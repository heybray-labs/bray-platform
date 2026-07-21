/*
 * SPDX-License-Identifier: AGPL-3.0-only
 * Copyright (C) 2025-2026 Heybray
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navbar } from "./MainLayout.tsx";

vi.mock("./SettingsModal.tsx", () => ({
  SettingsModal: () => null,
}));

vi.mock("../hooks/use-auth.ts", () => ({
  useAuth: () => ({
    user: {
      id: 2,
      email: "decks-only@test.local",
      profile: { firstName: "Deck", lastName: "Manager" },
      role: {
        name: "flashcards-manager",
        permissions: ["deck:manage"],
      },
    },
    logout: vi.fn(),
    hasPermission: (permission: string) => permission === "deck:manage",
    hasRole: (roleName: string) => roleName === "flashcards-manager",
  }),
}));

const settingsPanels = [{ value: "about", label: "About", render: () => null }];

describe("Navbar settings menu visibility", () => {
  it("shows Settings when managePermissions are configured for a non-admin role name", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(
      <Navbar
        settingsPanels={settingsPanels}
        managePermissions={["deck:manage"]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Deck Manager/i }));
    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: /Settings/i })).toBeTruthy();
    });
  });

  it("hides Settings when no manage permission props are passed", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });

    render(<Navbar settingsPanels={settingsPanels} />);

    await user.click(screen.getByRole("button", { name: /Deck Manager/i }));
    await waitFor(() => {
      expect(screen.getByRole("menuitem", { name: /Log out/i })).toBeTruthy();
    });
    expect(screen.queryByRole("menuitem", { name: /Settings/i })).toBeNull();
  });
});
