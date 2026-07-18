# `@heybray/react`

Shared React hooks, auth pages, and query client for Bray apps.

## Query defaults

The shared `queryClient` (`@heybray/react/lib/queryClient`) sets:

| Option | Default | Notes |
|---|---|---|
| `staleTime` | `30_000` | Remounts within 30s reuse cache. Override per query when freshness matters. |
| `refetchOnWindowFocus` | `false` | Opt a query back in with `refetchOnWindowFocus: true` when a screen needs focus-freshness (mutations already invalidate the main “my points changed” paths). |
| `refetchOnReconnect` | `false` | Opt in per query when a screen must refresh after the browser goes back online. |
| `retry` | `false` | Never auto-retry, including 401/429. |

## Session-expiry latch

On the first HTTP 401 from `apiRequest` or the default queryFn, the client clears the session and redirects to `/login` **once** (module-level latch). Concurrent in-flight 401s coalesce into that single redirect. Successful `AuthService.login` / `register` / `setupAdmin` / SSO complete call `resetSessionExpiryLatch()` so a later expiry can redirect again.
