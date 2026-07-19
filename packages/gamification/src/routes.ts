/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { Router, Response, type RequestHandler } from "express";
import { authenticateToken, requirePasswordChanged, type AuthRequest } from "@heybray/identity";
import { createLogger } from "@heybray/server-kit";
import { GamificationService, type GamificationConfig } from "./service.ts";
import { listMasteryDimensionSlugs } from "./resolve-mastery.ts";

const log = createLogger("gamification");

export interface GamificationRouterOptions {
  /**
   * Extra middleware run (after auth) immediately before the `/leaderboard`
   * handler — e.g. an app-supplied `requireFeature(...)` gate. The package
   * stays agnostic of what the middleware does (feature flags, entitlements,
   * anything); it only knows the route exists and that auth must run first
   * so the gate sees the authenticated user.
   */
  leaderboardMiddleware?: RequestHandler[];
}

export type ResolvedLeaderboardScope = {
  mode: "global" | "dimension-option";
  /** Present when mode is dimension-option — the taxonomy dimension to filter on. */
  dimensionSlug?: string;
};

/**
 * Builds the /api/points routes (same paths as the app's legacy points router).
 * Leaderboard scope accepts the legacy `category` token, any registered mastery
 * dimension slug (e.g. `topic`), or `dimension-option` — all map to the
 * service's generic dimension-option scope + option slug query param.
 *
 * `masteryDimensionSlugs` may be a single string (legacy callers) or the full
 * list from `listMasteryDimensionSlugs(config)`.
 */
export function resolveLeaderboardScope(
  queryScope: unknown,
  masteryDimensionSlugs: string | string[],
): ResolvedLeaderboardScope {
  const slugs = (
    Array.isArray(masteryDimensionSlugs) ? masteryDimensionSlugs : [masteryDimensionSlugs]
  ).filter(Boolean);

  if (queryScope == null || queryScope === "" || queryScope === "global") {
    return { mode: "global" };
  }

  if (queryScope === "dimension-option") {
    return { mode: "dimension-option", dimensionSlug: slugs[0] };
  }

  if (typeof queryScope === "string" && slugs.includes(queryScope)) {
    return { mode: "dimension-option", dimensionSlug: queryScope };
  }

  // Legacy token: if "category" is a registered dimension use it; otherwise
  // fall back to the sole/first registered dimension (preserves Flashcards
  // tests that still call ?scope=category with a topic-backed config).
  if (queryScope === "category") {
    if (slugs.includes("category")) {
      return { mode: "dimension-option", dimensionSlug: "category" };
    }
    if (slugs.length >= 1) {
      return { mode: "dimension-option", dimensionSlug: slugs[0] };
    }
  }

  return { mode: "global" };
}

export function createGamificationRouter(
  config: GamificationConfig,
  options: GamificationRouterOptions = {},
): Router {
  const service = new GamificationService(config);
  const router = Router();
  const masterySlugs = listMasteryDimensionSlugs(config);

  router.use(authenticateToken);
  router.use(requirePasswordChanged);

  router.get("/me", async (req: AuthRequest, res: Response) => {
    try {
      const summary = await service.getUserPointsSummary(req.user!.id);
      res.json(summary);
    } catch (error) {
      log.error("get points total error", error instanceof Error ? error : undefined);
      res.status(500).json({ error: "Failed to get points total" });
    }
  });

  router.get("/me/stats", async (req: AuthRequest, res: Response) => {
    try {
      const stats = await service.getUserProgressStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      log.error("get progress stats error", error instanceof Error ? error : undefined);
      res.status(500).json({ error: "Failed to get progress stats" });
    }
  });

  router.get("/me/history", async (req: AuthRequest, res: Response) => {
    try {
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
      const history = await service.getUserPointsHistory(req.user!.id, page, limit);
      res.json(history);
    } catch (error) {
      log.error("get points history error", error instanceof Error ? error : undefined);
      res.status(500).json({ error: "Failed to get points history" });
    }
  });

  router.get("/recent-stars", async (req: AuthRequest, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 15;
      const result = await service.getRecentStarAchievements({
        limit,
        currentUserId: req.user!.id,
      });
      res.json(result);
    } catch (error) {
      log.error("get recent stars error", error instanceof Error ? error : undefined);
      res.status(500).json({ error: "Failed to get recent star achievements" });
    }
  });

  router.get("/leaderboard", ...(options.leaderboardMiddleware ?? []), async (req: AuthRequest, res: Response) => {
    try {
      const resolved = resolveLeaderboardScope(req.query.scope, masterySlugs);
      const period = req.query.period === "month" ? "month" : "all_time";
      const optionSlug =
        typeof req.query.category === "string" ? req.query.category : undefined;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
      const rawContentType =
        typeof req.query.contentType === "string" ? req.query.contentType.trim() : undefined;
      const registeredTypes = config.contentTypes.map((c) => c.type);
      if (rawContentType && !registeredTypes.includes(rawContentType)) {
        res.status(400).json({ error: "Invalid contentType" });
        return;
      }

      const result = await service.getLeaderboard({
        scope: resolved.mode,
        dimensionSlug: resolved.dimensionSlug,
        optionSlug,
        period,
        limit,
        currentUserId: req.user!.id,
        contentType: rawContentType || undefined,
      });

      res.json(result);
    } catch (error) {
      log.error("get leaderboard error", error instanceof Error ? error : undefined);
      res.status(500).json({ error: "Failed to get leaderboard" });
    }
  });

  return router;
}
