/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

/** Minimal config shape needed to resolve mastery dimensions. */
export interface MasteryDimensionConfig {
  contentTypes: Array<{
    type: string;
    label: string;
    masteryDimensionSlug?: string;
  }>;
  /** @deprecated Prefer per-entry masteryDimensionSlug. */
  masteryDimensionSlug?: string;
}

/**
 * Resolve the taxonomy dimension slug for a registered content type.
 * Prefers `contentTypes[].masteryDimensionSlug`; falls back to the deprecated
 * top-level `masteryDimensionSlug` for single-type apps.
 */
export function resolveMasteryDimension(
  config: MasteryDimensionConfig,
  contentType: string,
): string {
  const entry = config.contentTypes.find((c) => c.type === contentType);
  if (!entry) {
    throw new Error(`Unknown content type "${contentType}" in GamificationConfig`);
  }
  const slug = entry.masteryDimensionSlug ?? config.masteryDimensionSlug;
  if (!slug) {
    throw new Error(
      `No masteryDimensionSlug for content type "${contentType}" ` +
        `(set contentTypes[].masteryDimensionSlug or top-level fallback)`,
    );
  }
  return slug;
}

/** Distinct mastery dimension slugs registered on the config (order preserved). */
export function listMasteryDimensionSlugs(config: MasteryDimensionConfig): string[] {
  const slugs: string[] = [];
  const seen = new Set<string>();
  for (const ct of config.contentTypes) {
    const slug = ct.masteryDimensionSlug ?? config.masteryDimensionSlug;
    if (slug && !seen.has(slug)) {
      seen.add(slug);
      slugs.push(slug);
    }
  }
  return slugs;
}

/** Assert every registered content type can resolve a mastery dimension. */
export function assertMasteryDimensionsResolvable(config: MasteryDimensionConfig): void {
  if (!config.contentTypes.length) {
    throw new Error("GamificationConfig.contentTypes must not be empty");
  }
  for (const ct of config.contentTypes) {
    resolveMasteryDimension(config, ct.type);
  }
}
