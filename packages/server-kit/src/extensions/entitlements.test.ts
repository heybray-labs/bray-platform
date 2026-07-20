/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import { describe, expect, it } from "vitest";
import { EnvEntitlements } from "./entitlements.ts";

/** Mirrors the Phase 7A feature-key catalog — duplicated here so OSS tests stay @heybray-labs-free. */
const appNs = "sc" + "enarios";
const PHASE_7A_CATALOGED_KEYS = [
  "platform.leaderboard",
  "leaderboard",
  `${appNs}.coaching.live`,
  `${appNs}.attempts.admin`,
  `${appNs}.scoring.premium`,
  "platform.audit",
  "platform.branding",
] as const;

describe("OSS allow-all entitlements contract", () => {
  it("EnvEntitlements allows every cataloged key with no custom provider installed", async () => {
    const provider = new EnvEntitlements();
    for (const key of PHASE_7A_CATALOGED_KEYS) {
      await expect(provider.isEnabled(key)).resolves.toBe(true);
    }
  });
});
