---
"@heybray/react": minor
---

Request hygiene: default `staleTime` of 30s, and a single-flight 401 latch so session expiry redirects to login once (reset on successful login). Documented in the package README. `retry` / `refetchOnWindowFocus` remain false as previously shipped.
