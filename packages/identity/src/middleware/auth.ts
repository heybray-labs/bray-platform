/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { userController } from "../controllers/user.controller.ts";
import type { UserWithRole } from "../schema/types.ts";
import { createLogger, API_KEY_PREFIX, verifyApiKey, type ApiKeyPrincipal } from "@heybray/server-kit";

const log = createLogger("auth");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

export interface AuthRequest extends Omit<Request, "user"> {
  user?: UserWithRole;
  apiKeyPrincipal?: ApiKeyPrincipal;
  requestId?: string;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    log.debug("Access token missing", { requestId: req.requestId, path: req.path });
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      log.debug("Invalid or expired token", {
        requestId: req.requestId,
        path: req.path,
        reason: err.message,
      });
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    try {
      const user = await userController.getUserWithRole(decoded.userId);
      if (!user || !user.isActive) {
        log.warn("User not found or inactive", {
          requestId: req.requestId,
          userId: decoded.userId,
        });
        return res.status(403).json({ message: "User not found or inactive" });
      }
      if (user.isSuspended) {
        log.warn("Account suspended", {
          requestId: req.requestId,
          userId: user.id,
        });
        return res.status(403).json({ message: "Account suspended" });
      }

      req.user = user;
      next();
    } catch (error) {
      log.error("Auth error", error instanceof Error ? error : undefined, {
        requestId: req.requestId,
      });
      return res.status(500).json({ message: "Server error during authentication" });
    }
  });
}

/**
 * Accepts either a user JWT (existing behavior) or an API key on the same
 * `Authorization: Bearer <token>` header, distinguished by `API_KEY_PREFIX`.
 * A successful key verification sets `req.apiKeyPrincipal`; it does not set
 * `req.user` — routes gating on permissions should use `requirePermission`,
 * which checks either principal.
 */
export function authenticateTokenOrApiKey(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token && token.startsWith(API_KEY_PREFIX)) {
    verifyApiKey(token)
      .then((principal) => {
        if (!principal) {
          log.debug("Invalid or revoked API key", { requestId: req.requestId, path: req.path });
          return res.status(401).json({ message: "Invalid or revoked API key" });
        }
        req.apiKeyPrincipal = principal;
        next();
      })
      .catch(next);
    return;
  }

  authenticateToken(req, res, next);
}

export function requirePermission(permission: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user && !req.apiKeyPrincipal) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const permissions = req.apiKeyPrincipal?.permissions ?? req.user?.role?.permissions ?? [];
    if (!permissions.includes(permission)) {
      log.warn("Insufficient permissions", {
        requestId: req.requestId,
        userId: req.user?.id,
        apiKeyId: req.apiKeyPrincipal?.keyId,
        required: permission,
      });
      return res.status(403).json({ message: "Insufficient permissions", required: permission });
    }
    next();
  };
}

export function requireRole(roleName: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.role?.name !== roleName) {
      log.warn("Insufficient role", {
        requestId: req.requestId,
        userId: req.user.id,
        required: roleName,
        actual: req.user.role?.name,
      });
      return res.status(403).json({ message: "Insufficient role permissions" });
    }
    next();
  };
}

export function requirePasswordChanged(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.mustChangePassword) {
    return res.status(403).json({ message: "Password change required", mustChangePassword: true });
  }
  next();
}

export function generateToken(userId: number, roleId: number): string {
  return jwt.sign({ userId, roleId }, JWT_SECRET, { expiresIn: "24h" });
}

export function generateRefreshToken(userId: number): string {
  return jwt.sign({ userId, type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });
}
