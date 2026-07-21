/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import { describe, expect, it } from "vitest";
import { EnvEntitlements } from "./entitlements.ts";

/** Neutral example keys — OSS contract test must not mirror app vocabulary in platform packages. */
const EXAMPLE_CATALOGED_KEYS = [
  "platform.leaderboard",
  "leaderboard",
  "exampleapp.coaching.live",
  "exampleapp.attempts.admin",
  "exampleapp.scoring.premium",
  "platform.audit",
  "platform.branding",
] as const;

describe("OSS allow-all entitlements contract", () => {
  it("EnvEntitlements allows every example catalog key with no custom provider installed", async () => {
    const provider = new EnvEntitlements();
    for (const key of EXAMPLE_CATALOGED_KEYS) {
      await expect(provider.isEnabled(key)).resolves.toBe(true);
    }
  });
});
