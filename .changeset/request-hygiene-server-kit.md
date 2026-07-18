---
"@heybray/server-kit": minor
---

Raise default `RATE_LIMIT_MAX` from 300 to 2000 per 15-minute window. Rate-limit 429 responses now log via the limiter handler (path, key type, count) while keeping the limiter mounted first. Standard `RateLimit-*` headers unchanged.
