---
"@heybray/server-kit": minor
---

Add the `ApiKeyVerifier` extension seam (`ApiKeyPrincipal`, `API_KEY_PREFIX`, `NullApiKeyVerifier`, `setApiKeyVerifier`, `verifyApiKey`). OSS default never recognizes a key, matching the existing `EntitlementProvider`/`TenantResolver` seam pattern; an enterprise package can install a real, DB-backed verifier.
