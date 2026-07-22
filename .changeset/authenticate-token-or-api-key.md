---
"@heybray/identity": minor
---

Add `authenticateTokenOrApiKey` middleware, accepting an API key (via `@heybray/server-kit`'s `ApiKeyVerifier` seam) as an alternative to a user JWT on the same `Authorization: Bearer` header. `requirePermission` now checks either the authenticated user's role permissions or the API key principal's permissions, so existing route-level authorization is unchanged for JWT-authenticated requests and works unmodified for routes that opt in to `authenticateTokenOrApiKey`.
