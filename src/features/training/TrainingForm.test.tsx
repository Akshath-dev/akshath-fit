import { it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrainingForm } from "./TrainingForm";
const groups = [
  { id: "chest", name: "Chest", isCustom: false },
  { id: "back", name: "Back", isCustom: false },
];
it("saves a multi-muscle workout once with its intended date", async () => {
  const save = vi.fn().mockResolvedValue(undefined),
    user = userEvent.setup();
  render(
    <TrainingForm
      date="2026-10-21"
      muscleGroups={groups}
      onSave={save}
      onCancel={() => {}}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Chest" }));
  await user.click(screen.getByRole("button", { name: "Back" }));
  await user.click(screen.getByRole("button", { name: "Save session" }));
  expect(save).toHaveBeenCalledTimes(1);
  expect(save).toHaveBeenCalledWith(
    expect.objectContaining({
      date: "2026-10-21",
      muscleGroupIds: ["chest", "back"],
    }),
  );
});
it("retains entries and shows a failed-save error", async () => {
  const user = userEvent.setup();
  render(
    <TrainingForm
      date="2026-10-21"
      muscleGroups={groups}
      onSave={async () => {
        throw new Error("Offline. Try again.");
      }}
      onCancel={() => {}}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Chest" }));
  await user.click(screen.getByRole("button", { name: "Save session" }));
  await screen.findByRole("alert");
  expect(screen.getByRole("button", { name: "Chest" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(screen.queryByText("Saved")).not.toBeInTheDocument();
});
