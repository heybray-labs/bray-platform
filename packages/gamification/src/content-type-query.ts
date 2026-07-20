/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

/** Parse optional `?contentType=` for star-map drill-in routes (mirror leaderboard validation). */
export function parseContentTypeQueryParam(
  raw: string | undefined,
  registeredTypes: readonly string[],
): { contentType?: string; invalid?: boolean } {
  const trimmed = typeof raw === "string" ? raw.trim() : "";
  if (!trimmed) return {};
  if (!registeredTypes.includes(trimmed)) {
    return { invalid: true };
  }
  return { contentType: trimmed };
}
