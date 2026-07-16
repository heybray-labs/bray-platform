/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2026 Heybray
 */

import { createContext, useContext, type ReactNode } from "react";

export interface AppConfigUrls {
  repo: string;
  docs?: string;
  issues?: string;
  releases?: string;
}

export interface AppConfigRoutes {
  /** Build a client route for a gamified content item (e.g. `/roleplays/${id}`). */
  contentPath: (contentType: string, contentId: number) => string;
}

/**
 * Whitelabel seam: the small set of brand-level text/links a host app supplies.
 * Assets (logo, hero image) are passed as props where needed since they are
 * bundler-resolved imports rather than plain config values.
 */
export interface AppConfig {
  displayName: string;
  tagline?: string;
  urls: AppConfigUrls;
  routes: AppConfigRoutes;
  /** Primary gamified content type slug (e.g. `scenario`, `deck`). Used by gamification-react panels for deep links. */
  gamificationContentType?: string;
}

const AppConfigContext = createContext<AppConfig | null>(null);

export function AppConfigProvider({
  value,
  children,
}: {
  value: AppConfig;
  children: ReactNode;
}) {
  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig(): AppConfig {
  const config = useContext(AppConfigContext);
  if (!config) {
    throw new Error("useAppConfig must be used within an AppConfigProvider");
  }
  return config;
}
