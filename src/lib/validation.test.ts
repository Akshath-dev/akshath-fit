import { it, expect } from "vitest";
import {
  validateNutrition,
  validateTraining,
  validateCheckin,
} from "./validation";
const food = {
  date: "2026-10-21",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  notes: "",
};
const session = {
  date: "2026-10-21",
  kind: "strength" as const,
  activityType: "",
  durationMinutes: "",
  distanceKm: "",
  notes: "",
  muscleGroupIds: [],
};
it("preserves partial nutrition and explicit zero", () => {
  const r = validateNutrition({ ...food, protein: "0" });
  expect(r.ok && r.value).toEqual({
    date: "2026-10-21",
    calories: null,
    protein: 0,
    carbs: null,
    fat: null,
    notes: "",
  });
  expect(validateNutrition(food).ok).toBe(false);
});
it("rejects negative and nonfinite quantities", () => {
  for (const value of ["-1", "Infinity", "NaN", "1e999"])
    expect(validateNutrition({ ...food, calories: value }).ok).toBe(false);
});
it("requires muscle selection for strength and duration for cardio", () => {
  expect(validateTraining(session).ok).toBe(false);
  expect(
    validateTraining({ ...session, muscleGroupIds: ["chest", "back"] }).ok,
  ).toBe(true);
  expect(
    validateTraining({ ...session, kind: "cardio", activityType: "Running" })
      .ok,
  ).toBe(false);
});
it("rejects fractional steps and zero weight", () => {
  const i = {
    date: "2026-10-21",
    steps: "1.5",
    weightKg: "",
    waistCm: "",
    restDay: false,
    notes: "",
  };
  expect(validateCheckin(i).ok).toBe(false);
  expect(validateCheckin({ ...i, steps: "0" }).ok).toBe(true);
  expect(validateCheckin({ ...i, steps: "", weightKg: "0" }).ok).toBe(false);
});
it("rejects impossible calendar dates", () => {
  expect(
    validateNutrition({ ...food, date: "2026-02-30", calories: "100" }).ok,
  ).toBe(false);
});
