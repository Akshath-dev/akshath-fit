import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPage } from "./SettingsPage";
import { DashboardProvider, useDashboard } from "../../data/DashboardProvider";
import { TrainingForm } from "../training/TrainingForm";
import { emptySnapshot } from "../../test/fixtures";
import type { FitnessRepository } from "../../lib/repository";
import type { Goals, Profile } from "../../lib/types";
function setup(fail = false) {
  const s = emptySnapshot();
  s.nutrition = [
    {
      date: "2026-10-21",
      calories: 1900,
      protein: 150,
      carbs: 190,
      fat: 55,
      notes: "",
    },
  ];
  const repo = {
    getSnapshot: async () => structuredClone(s),
    saveSettings: async (
      p: Pick<Profile, "displayName" | "timeZone">,
      g: Goals,
    ) => {
      if (fail) throw new Error("Save failed. Try again.");
      s.profile = { ...s.profile, ...p };
      s.goals = g;
      return { profile: s.profile, goals: g };
    },
    addMuscleGroup: async (name: string) => {
      const g = { id: "custom", name, isCustom: true };
      s.muscleGroups.push(g);
      return g;
    },
  } as unknown as FitnessRepository;
  return { repo, s };
}
function Probe() {
  const { snapshot } = useDashboard();
  return snapshot ? (
    <>
      <p>{snapshot.profile.timeZone}</p>
      <TrainingForm
        date="2026-10-21"
        muscleGroups={snapshot.muscleGroups}
        onSave={async () => {}}
        onCancel={() => {}}
      />
    </>
  ) : null;
}
it("saves owner goals without rewriting recorded nutrition and exposes new muscles", async () => {
  const { repo, s } = setup();
  render(
    <DashboardProvider repository={repo} selectedDate="2026-10-21">
      <SettingsPage />
      <Probe />
    </DashboardProvider>,
  );
  const user = userEvent.setup(),
    calories = await screen.findByLabelText("Calories (kcal)");
  await user.clear(calories);
  await user.type(calories, "1800");
  const zone = screen.getByLabelText("Time zone");
  await user.clear(zone);
  await user.type(zone, "UTC");
  await user.click(screen.getByRole("button", { name: "Save settings" }));
  await screen.findByText("Settings saved.");
  expect(s.goals.calories).toBe(1800);
  expect(s.nutrition[0].calories).toBe(1900);
  expect(screen.getByText("UTC")).toBeInTheDocument();
  await user.type(screen.getByLabelText("New muscle group"), "Forearms");
  await user.click(screen.getByRole("button", { name: "Add muscle group" }));
  await screen.findByRole("button", { name: "Forearms" });
});
it("keeps edited goals after a failed save", async () => {
  const { repo } = setup(true);
  render(
    <DashboardProvider repository={repo} selectedDate="2026-10-21">
      <SettingsPage />
    </DashboardProvider>,
  );
  const user = userEvent.setup(),
    calories = await screen.findByLabelText("Calories (kcal)");
  await user.clear(calories);
  await user.type(calories, "1800");
  await user.click(screen.getByRole("button", { name: "Save settings" }));
  await screen.findByText("Save failed. Try again.");
  expect(calories).toHaveValue(1800);
  expect(screen.queryByText("Settings saved.")).not.toBeInTheDocument();
});
