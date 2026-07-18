/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { HttpError } from "./http-error";

/**
 * Shared query defaults for all Bray apps:
 * - `staleTime: 30_000` — remounts within 30s reuse cache (opt out per query when freshness matters)
 * - `refetchOnWindowFocus: false` — opt in per query if a screen needs focus-freshness
 * - `retry: false` — never auto-retry (including 401/429)
 *
 * Session expiry: the first 401 from `apiRequest` / the default queryFn clears the
 * session and redirects to `/login` exactly once (module latch). Call
 * `resetSessionExpiryLatch()` after a successful login so a later expiry can redirect again.
 */

/** Module latch: one login redirect per session-expiry event. */
let sessionExpiryHandled = false;

/** @internal exported for tests */
export function isSessionExpiryHandled(): boolean {
  return sessionExpiryHandled;
}

/** Reset after a successful login / register / SSO complete so the next expiry can redirect. */
export function resetSessionExpiryLatch(): void {
  sessionExpiryHandled = false;
}

function handleUnauthorized(url: string): void {
  if (url.includes("/auth/login")) return;
  if (sessionExpiryHandled) return;
  sessionExpiryHandled = true;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    let message = text || res.statusText;
    if (text) {
      try {
        const data = JSON.parse(text);
        message = data.message || data.error || message;
      } catch {
        // keep message as text
      }
    }
    throw new HttpError(res.status, message);
  }
}

export async function apiRequest(
  method: string = "GET",
  url: string,
  body?: unknown,
): Promise<any> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    handleUnauthorized(url);
  }

  await throwIfResNotOk(res);
  const raw = await res.text();
  if (!raw.trim()) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn =
  ({ on401 }: { on401: UnauthorizedBehavior }): QueryFunction =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const token = localStorage.getItem("auth_token");
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { headers });
    if (res.status === 401) {
      if (on401 === "returnNull") return null;
      handleUnauthorized(url);
    }
    await throwIfResNotOk(res);
    const raw = await res.text();
    if (!raw.trim()) return null;
    return JSON.parse(raw);
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: false,
      throwOnError: (error) => {
        if (error instanceof HttpError) {
          return error.status === 403 || error.status >= 500;
        }
        return true;
      },
    },
  },
});
