import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppShell } from "./AppShell";
it("navigates to nutrition and exposes the additional destinations", async () => {
  const navigate = vi.fn();
  const user = userEvent.setup();
  render(
    <AppShell route="overview" onNavigate={navigate} onSignOut={() => {}}>
      <p>Dashboard content</p>
    </AppShell>,
  );
  await user.click(screen.getAllByRole("button", { name: "Nutrition" })[0]);
  expect(navigate).toHaveBeenCalledWith("nutrition");
  await user.click(screen.getByRole("button", { name: "More" }));
  expect(
    screen.getAllByRole("button", { name: "Plan" }).length,
  ).toBeGreaterThan(0);
  expect(
    screen.getAllByRole("button", { name: "Settings" }).length,
  ).toBeGreaterThan(0);
});
