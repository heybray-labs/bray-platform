/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { useEffect, useState } from "react";
import { AuthService } from "../lib/auth.ts";
import { mediaUrl } from "../lib/media.ts";
import { useAuth } from "./use-auth.ts";
import {
  clearInflightImageRequest,
  commitCachedImageUrl,
  getInflightImageRequest,
  peekAuthenticatedImageUrl,
  releaseCachedImage,
  retainCachedImageUrl,
  setInflightImageRequest,
} from "./authenticated-image-cache.ts";

export { clearAuthenticatedImageCache } from "./authenticated-image-cache.ts";

async function subscribeAuthenticatedImage(mediaId: number): Promise<string> {
  const cached = peekAuthenticatedImageUrl(mediaId);
  if (cached) {
    retainCachedImageUrl(mediaId);
    return cached;
  }

  const existing = getInflightImageRequest(mediaId);
  if (existing) {
    const url = await existing;
    retainCachedImageUrl(mediaId);
    return url;
  }

  const pending = (async () => {
    try {
      const token = AuthService.getToken();
      const res = await fetch(mediaUrl(mediaId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error(`Failed to load image (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      commitCachedImageUrl(mediaId, url);
      return url;
    } finally {
      clearInflightImageRequest(mediaId);
    }
  })();

  setInflightImageRequest(mediaId, pending);
  return pending;
}

/**
 * Fetches an authenticated media asset and returns a blob URL for use in <img>.
 * Shares one fetch + blob URL per media id across components (carousel shelves).
 */
export function useAuthenticatedImage(mediaId: number | null | undefined): {
  src: string | null;
  isLoading: boolean;
  error: boolean;
} {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [src, setSrc] = useState<string | null>(() =>
    mediaId == null ? null : peekAuthenticatedImageUrl(mediaId),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (mediaId == null) {
      setSrc(null);
      setIsLoading(false);
      setError(false);
      return;
    }

    if (authLoading) {
      return;
    }

    if (!isAuthenticated && !AuthService.getToken()) {
      setSrc(null);
      setIsLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    let subscribedId: number | null = null;
    setIsLoading(true);
    setError(false);
    setSrc(peekAuthenticatedImageUrl(mediaId));

    subscribeAuthenticatedImage(mediaId)
      .then((url) => {
        if (cancelled) {
          releaseCachedImage(mediaId);
          return;
        }
        subscribedId = mediaId;
        setSrc(url);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
      if (subscribedId != null) {
        releaseCachedImage(subscribedId);
      }
    };
  }, [mediaId, authLoading, isAuthenticated]);

  return { src, isLoading, error };
}
