/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

/** Content-neutral team star map API paths (preferred for new apps). */
function withContentTypeQuery(base: string, contentType?: string): string {
  if (!contentType) return base;
  return `${base}?contentType=${encodeURIComponent(contentType)}`;
}

export function memberContentHistoryPath(
  teamId: number | "all",
  userId: number,
  contentType?: string,
): string {
  return withContentTypeQuery(
    `/api/teams/${teamId}/members/${userId}/content-history`,
    contentType,
  );
}

export function memberContentAttemptsPath(
  teamId: number | "all",
  userId: number,
  contentId: number,
  contentType?: string,
): string {
  return withContentTypeQuery(
    `/api/teams/${teamId}/members/${userId}/contents/${contentId}/attempts`,
    contentType,
  );
}

/** Legacy app-shaped paths — kept for back-compat. */
// DEPRECATED: legacyMemberScenarioHistoryPath
export function legacyMemberScenarioHistoryPath(teamId: number | "all", userId: number): string {
  return `/api/teams/${teamId}/members/${userId}/scenario-history`; // DEPRECATED:
}

// DEPRECATED: legacyMemberRoleplayAttemptsPath
export function legacyMemberRoleplayAttemptsPath(
  teamId: number | "all",
  userId: number,
  contentId: number,
): string {
  return `/api/teams/${teamId}/members/${userId}/roleplays/${contentId}/attempts`; // DEPRECATED:
}
