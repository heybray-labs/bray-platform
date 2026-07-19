/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

type CacheEntry = { url: string; refs: number };

const cache = new Map<number, CacheEntry>();
const inflight = new Map<number, Promise<string>>();

/** Drop cached blob URLs (e.g. on logout / session expiry). */
export function clearAuthenticatedImageCache(): void {
  for (const entry of cache.values()) {
    URL.revokeObjectURL(entry.url);
  }
  cache.clear();
  inflight.clear();
}

export function peekAuthenticatedImageUrl(mediaId: number): string | null {
  return cache.get(mediaId)?.url ?? null;
}

export function releaseCachedImage(mediaId: number): void {
  const entry = cache.get(mediaId);
  if (!entry) return;
  entry.refs -= 1;
  if (entry.refs <= 0) {
    URL.revokeObjectURL(entry.url);
    cache.delete(mediaId);
  }
}

export function getInflightImageRequest(mediaId: number): Promise<string> | undefined {
  return inflight.get(mediaId);
}

export function setInflightImageRequest(mediaId: number, promise: Promise<string>): void {
  inflight.set(mediaId, promise);
}

export function clearInflightImageRequest(mediaId: number): void {
  inflight.delete(mediaId);
}

/** Reserve a ref on an already-cached image (used when joining an in-flight fetch). */
export function retainCachedImageUrl(mediaId: number): string | null {
  const entry = cache.get(mediaId);
  if (!entry) return null;
  entry.refs += 1;
  return entry.url;
}

/** Mark a freshly fetched blob URL as cached with one consumer ref. */
export function commitCachedImageUrl(mediaId: number, url: string): string {
  cache.set(mediaId, { url, refs: 1 });
  return url;
}
