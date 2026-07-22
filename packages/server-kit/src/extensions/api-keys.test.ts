/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import { describe, expect, it } from "vitest";
import {
  NullApiKeyVerifier,
  setApiKeyVerifier,
  verifyApiKey,
  type ApiKeyPrincipal,
  type ApiKeyVerifier,
} from "./api-keys.ts";

describe("OSS default API key verifier", () => {
  it("NullApiKeyVerifier never recognizes a key", async () => {
    const verifier = new NullApiKeyVerifier();
    await expect(verifier.verify("bk_anything")).resolves.toBeNull();
  });

  it("verifyApiKey rejects everything with no custom verifier installed", async () => {
    setApiKeyVerifier(new NullApiKeyVerifier());
    await expect(verifyApiKey("bk_anything")).resolves.toBeNull();
  });

  it("setApiKeyVerifier swaps in a custom verifier", async () => {
    const principal: ApiKeyPrincipal = { keyId: "1", tenantId: null, permissions: ["read"] };
    const fake: ApiKeyVerifier = {
      async verify(rawKey: string) {
        return rawKey === "bk_valid" ? principal : null;
      },
    };
    setApiKeyVerifier(fake);

    await expect(verifyApiKey("bk_valid")).resolves.toEqual(principal);
    await expect(verifyApiKey("bk_invalid")).resolves.toBeNull();

    setApiKeyVerifier(new NullApiKeyVerifier());
  });
});
