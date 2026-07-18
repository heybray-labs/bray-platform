/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiRequest,
  isSessionExpiryHandled,
  queryClient,
  resetSessionExpiryLatch,
} from "./queryClient";

describe("queryClient defaults", () => {
  it("disables reconnect and focus refetch by default", () => {
    const queries = queryClient.getDefaultOptions().queries!;
    expect(queries.staleTime).toBe(30_000);
    expect(queries.refetchOnWindowFocus).toBe(false);
    expect(queries.refetchOnReconnect).toBe(false);
    expect(queries.retry).toBe(false);
  });
});

describe("session expiry latch", () => {
  const hrefSets: string[] = [];

  beforeEach(() => {
    resetSessionExpiryLatch();
    hrefSets.length = 0;
    localStorage.setItem("auth_token", "expired");
    localStorage.setItem("auth_user", JSON.stringify({ id: 1 }));

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/home",
        set href(v: string) {
          hrefSets.push(v);
        },
        get href() {
          return "http://localhost/home";
        },
      },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ message: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    resetSessionExpiryLatch();
  });

  it("redirects once across concurrent 401s", async () => {
    const results = await Promise.allSettled([
      apiRequest("GET", "/api/points/me"),
      apiRequest("GET", "/api/points/leaderboard"),
      apiRequest("GET", "/api/auth/me"),
    ]);

    expect(results.every((r) => r.status === "rejected")).toBe(true);
    expect(isSessionExpiryHandled()).toBe(true);
    expect(hrefSets).toEqual(["/login"]);
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("auth_user")).toBeNull();
  });

  it("resets so a later expiry can redirect again", async () => {
    await Promise.allSettled([apiRequest("GET", "/api/points/me")]);
    expect(hrefSets).toEqual(["/login"]);

    resetSessionExpiryLatch();
    localStorage.setItem("auth_token", "another-expired");
    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        pathname: "/flashcards",
        set href(v: string) {
          hrefSets.push(v);
        },
        get href() {
          return "http://localhost/flashcards";
        },
      },
    });

    await Promise.allSettled([apiRequest("GET", "/api/points/me")]);
    expect(hrefSets).toEqual(["/login", "/login"]);
  });
});
