/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

/** Prefix distinguishing an API key from a JWT in an `Authorization: Bearer <token>` header. */
export const API_KEY_PREFIX = "bk_";

export interface ApiKeyPrincipal {
  keyId: string;
  tenantId: string | null;
  permissions: string[];
  label?: string;
}

/**
 * Extension seam: verifies a raw API key and resolves the principal it grants.
 * The OSS default (`NullApiKeyVerifier`) never recognizes a key — an enterprise
 * package can call `setApiKeyVerifier()` to supply a real, DB-backed one.
 */
export interface ApiKeyVerifier {
  verify(rawKey: string): Promise<ApiKeyPrincipal | null>;
}

/** OSS default: no API keys ever exist. */
export class NullApiKeyVerifier implements ApiKeyVerifier {
  async verify(rawKey: string): Promise<null> {
    return null;
  }
}

let currentVerifier: ApiKeyVerifier = new NullApiKeyVerifier();

export function setApiKeyVerifier(verifier: ApiKeyVerifier): void {
  currentVerifier = verifier;
}

export async function verifyApiKey(rawKey: string): Promise<ApiKeyPrincipal | null> {
  return currentVerifier.verify(rawKey);
}
