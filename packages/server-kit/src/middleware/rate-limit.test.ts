/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { Server } from "node:http";
import { parseRateLimitMax } from "./rate-limit.ts";

describe("parseRateLimitMax", () => {
  it("defaults to 2000 when unset or invalid", () => {
    expect(parseRateLimitMax(undefined)).toBe(2000);
    expect(parseRateLimitMax("")).toBe(2000);
    expect(parseRateLimitMax("nope")).toBe(2000);
    expect(parseRateLimitMax("0")).toBe(2000);
  });

  it("parses a positive env override", () => {
    expect(parseRateLimitMax("5")).toBe(5);
    expect(parseRateLimitMax("2000")).toBe(2000);
  });
});

describe("parseIpAllowlist", () => {
  it("parses comma-separated entries", async () => {
    const { parseIpAllowlist } = await import("./rate-limit.ts");
    expect(parseIpAllowlist("127.0.0.1, 10.0.0.0/8")).toEqual(["127.0.0.1", "10.0.0.0/8"]);
    expect(parseIpAllowlist(undefined)).toEqual([]);
  });
});

describe("isAllowlistedIp", () => {
  const prevAllowlist = process.env.RATE_LIMIT_IP_ALLOWLIST;

  afterEach(() => {
    if (prevAllowlist === undefined) delete process.env.RATE_LIMIT_IP_ALLOWLIST;
    else process.env.RATE_LIMIT_IP_ALLOWLIST = prevAllowlist;
    vi.resetModules();
  });

  it("matches exact IPs and CIDR ranges when env is set", async () => {
    process.env.RATE_LIMIT_IP_ALLOWLIST = "127.0.0.1,10.0.0.0/8";
    vi.resetModules();
    const { isAllowlistedIp } = await import("./rate-limit.ts");
    expect(isAllowlistedIp("127.0.0.1")).toBe(true);
    expect(isAllowlistedIp("10.1.2.3")).toBe(true);
    expect(isAllowlistedIp("192.168.0.1")).toBe(false);
  });
});

describe("globalRateLimiter", () => {
  const prevMax = process.env.RATE_LIMIT_MAX;
  let server: Server | undefined;
  let warnSpy: ReturnType<typeof vi.spyOn> | undefined;

  afterEach(async () => {
    if (prevMax === undefined) delete process.env.RATE_LIMIT_MAX;
    else process.env.RATE_LIMIT_MAX = prevMax;
    warnSpy?.mockRestore();
    await new Promise<void>((resolve) => {
      if (!server) return resolve();
      server.close(() => resolve());
    });
    server = undefined;
    vi.resetModules();
  });

  it("returns 429 with RateLimit-* headers and logs the rejection", async () => {
    process.env.RATE_LIMIT_MAX = "2";
    vi.resetModules();

    const { logger } = await import("../logger.ts");
    warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

    const { globalRateLimiter } = await import("./rate-limit.ts");
    const app = express();
    app.use("/api", globalRateLimiter);
    app.get("/api/ping", (_req, res) => {
      res.json({ ok: true });
    });

    server = await new Promise<Server>((resolve) => {
      const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const { port } = server.address() as { port: number };
    const base = `http://127.0.0.1:${port}`;

    expect((await fetch(`${base}/api/ping`)).status).toBe(200);
    expect((await fetch(`${base}/api/ping`)).status).toBe(200);

    const limited = await fetch(`${base}/api/ping`);
    expect(limited.status).toBe(429);
    expect(limited.headers.get("ratelimit-limit") ?? limited.headers.get("RateLimit-Limit")).toBeTruthy();
    expect(limited.headers.get("ratelimit-policy") ?? limited.headers.get("RateLimit-Policy")).toBeTruthy();

    expect(warnSpy).toHaveBeenCalled();
    const [, meta] = warnSpy.mock.calls.find(([msg]) => msg === "Rate limit exceeded") ?? [];
    expect(meta).toMatchObject({
      module: "rate-limit",
      keyType: "ip",
    });
    expect(String((meta as { path?: string }).path)).toContain("/api/ping");
    expect(typeof (meta as { count?: number }).count).toBe("number");
  });
});
