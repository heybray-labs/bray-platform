/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

/** Content-neutral team star map API paths (preferred for new apps). */
export function memberContentHistoryPath(teamId: number | "all", userId: number): string {
  return `/api/teams/${teamId}/members/${userId}/content-history`;
}

export function memberContentAttemptsPath(
  teamId: number | "all",
  userId: number,
  contentId: number,
): string {
  return `/api/teams/${teamId}/members/${userId}/contents/${contentId}/attempts`;
}

/** Legacy Scenarios-shaped paths — kept for back-compat. */
export function legacyMemberScenarioHistoryPath(teamId: number | "all", userId: number): string {
  return `/api/teams/${teamId}/members/${userId}/scenario-history`;
}

export function legacyMemberRoleplayAttemptsPath(
  teamId: number | "all",
  userId: number,
  contentId: number,
): string {
  return `/api/teams/${teamId}/members/${userId}/roleplays/${contentId}/attempts`;
}
