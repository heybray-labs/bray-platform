/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";
import { logger } from "../logger.ts";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** @internal exported for tests */
export function parseRateLimitMax(value: string | undefined, fallback = 2000): number {
  return parsePositiveInt(value, fallback);
}

const windowMs = parsePositiveInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000);
const globalMax = parseRateLimitMax(process.env.RATE_LIMIT_MAX, 2000);
const authMax = parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 20);

/** @internal exported for tests */
export function parseIpAllowlist(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const ipAllowlist = parseIpAllowlist(process.env.RATE_LIMIT_IP_ALLOWLIST);

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    const n = Number(part);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    value = (value << 8) + n;
  }
  return value >>> 0;
}

/** @internal exported for tests */
export function isAllowlistedIp(ip: string | undefined): boolean {
  if (!ip || ipAllowlist.length === 0) return false;
  const normalized = ip.replace(/^::ffff:/, "");
  for (const entry of ipAllowlist) {
    if (!entry.includes("/")) {
      if (normalized === entry) return true;
      continue;
    }
    const [network, prefixRaw] = entry.split("/");
    const prefix = Number(prefixRaw);
    const ipInt = ipv4ToInt(normalized);
    const networkInt = ipv4ToInt(network);
    if (ipInt == null || networkInt == null || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
      continue;
    }
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    if ((ipInt & mask) === (networkInt & mask)) return true;
  }
  return false;
}

function isHealthCheck(req: Request): boolean {
  return req.path === "/health";
}

function shouldSkipRateLimit(req: Request): boolean {
  return isHealthCheck(req) || isAllowlistedIp(req.ip);
}

function keyType(req: Request): "auth" | "ip" {
  const auth = req.headers.authorization;
  return typeof auth === "string" && auth.length > 0 ? "auth" : "ip";
}

/** Prefer per-session keys so multiple logged-in users on one IP do not share a bucket. */
function rateLimitKey(req: Request): string {
  const auth = req.headers.authorization;
  if (typeof auth === "string" && auth.length > 0) {
    return `auth:${auth}`;
  }
  return `ip:${ipKeyGenerator(req.ip ?? "")}`;
}

function logRateLimitRejection(req: Request): void {
  const info = (req as Request & { rateLimit?: { used?: number; limit?: number } }).rateLimit;
  logger.warn("Rate limit exceeded", {
    module: "rate-limit",
    path: req.originalUrl || req.url || req.path,
    keyType: keyType(req),
    count: info?.used,
    limit: info?.limit,
  });
}

function rateLimitHandler(
  req: Request,
  res: Response,
  _next: NextFunction,
  options: { statusCode: number; message: unknown },
): void {
  logRateLimitRejection(req);
  res.status(options.statusCode).send(options.message);
}

/** Applied to /api routes only (static assets and SPA HTML are not counted). */
export const globalRateLimiter = rateLimit({
  windowMs,
  max: globalMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
  skip: shouldSkipRateLimit,
  keyGenerator: rateLimitKey,
  handler: rateLimitHandler,
});

/**
 * Stricter limit for authentication endpoints that hit the database and
 * run expensive password hashing (bcrypt).
 */
export const authRateLimiter = rateLimit({
  windowMs,
  max: authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts, please try again later." },
  skip: (req) => isAllowlistedIp(req.ip),
  keyGenerator: rateLimitKey,
  handler: rateLimitHandler,
});
