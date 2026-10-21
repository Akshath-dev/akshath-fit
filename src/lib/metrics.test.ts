import { it, expect } from "vitest";
import { summarize } from "./metrics";
import { emptySnapshot } from "../test/fixtures";
it("counts a multi-muscle session once and uses Monday–Sunday weeks", () => {
  const s = emptySnapshot();
  s.training = [
    {
      id: "one",
      date: "2026-10-25",
      kind: "strength",
      muscleGroupIds: ["chest", "back"],
      durationMinutes: 45,
      activityType: null,
      distanceKm: null,
      notes: "",
      createdAt: "",
    },
  ];
  expect(summarize(s, "2026-10-25").week.total).toBe(1);
  expect(summarize(s, "2026-10-26").week.total).toBe(0);
});
it("averages recorded weight observations rather than missing days", () => {
  const s = emptySnapshot();
  s.checkins = [
    {
      date: "2026-10-20",
      weightKg: 75,
      waistCm: null,
      steps: null,
      restDay: false,
      notes: "",
    },
    {
      date: "2026-10-21",
      weightKg: 74,
      waistCm: null,
      steps: null,
      restDay: false,
      notes: "",
    },
  ];
  const summary = summarize(s, "2026-10-21");
  expect(summary.weightAverage).toBe(74.5);
  expect(summary.weightSamples).toBe(2);
});
it("distinguishes absent metrics, explicit zero, and unset targets", () => {
  const s = emptySnapshot();
  s.goals.calories = null;
  expect(summarize(s, "2026-10-21").caloriesRemaining).toBeNull();
  expect(summarize(s, "2026-10-21").nutritionToday).toBeUndefined();
  s.nutrition = [
    {
      date: "2026-10-21",
      calories: 0,
      protein: null,
      carbs: null,
      fat: null,
      notes: "",
    },
  ];
  expect(summarize(s, "2026-10-21").nutritionToday?.calories).toBe(0);
  expect(summarize(s, "2026-10-21").weightChange).toBeNull();
});
