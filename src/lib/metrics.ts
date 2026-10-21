import type { DashboardSnapshot, LocalDate } from "./types";
import { daysEnding, shiftDate, weekRange } from "./dates";
export function summarize(
  snapshot: DashboardSnapshot,
  selectedDate: LocalDate,
) {
  const range = weekRange(selectedDate),
    weekTraining = snapshot.training.filter(
      (s) => s.date >= range.start && s.date <= range.end,
    ),
    seven = daysEnding(selectedDate, 7),
    weights = snapshot.checkins
      .filter((c) => c.weightKg != null && seven.includes(c.date))
      .sort((a, b) => a.date.localeCompare(b.date)),
    nutritionToday = snapshot.nutrition.find((n) => n.date === selectedDate),
    checkinToday = snapshot.checkins.find((c) => c.date === selectedDate),
    latestWeight =
      [
        ...snapshot.checkins.filter(
          (c) => c.weightKg != null && c.date <= selectedDate,
        ),
        ...(snapshot.latestWeight ? [snapshot.latestWeight] : []),
      ].sort((a, b) => b.date.localeCompare(a.date))[0] || null;
  return {
    nutritionToday,
    checkinToday,
    latestWeight,
    weightAverage: weights.length
      ? weights.reduce((sum, c) => sum + c.weightKg!, 0) / weights.length
      : null,
    weightSamples: weights.length,
    weightChange:
      weights.length > 1
        ? weights.at(-1)!.weightKg! - weights[0].weightKg!
        : null,
    caloriesRemaining:
      nutritionToday?.calories != null && snapshot.goals.calories
        ? snapshot.goals.calories - nutritionToday.calories
        : null,
    nutritionLoggingDays: snapshot.nutrition.filter((n) =>
      seven.includes(n.date),
    ).length,
    week: {
      ...range,
      total: weekTraining.length,
      strength: weekTraining.filter((s) => s.kind === "strength").length,
      cardio: weekTraining.filter((s) => s.kind === "cardio").length,
      minutes: weekTraining.reduce(
        (sum, s) => sum + (s.durationMinutes || 0),
        0,
      ),
      days: Array.from({ length: 7 }, (_, i) => {
        const date = shiftDate(range.start, i);
        return {
          date,
          strength: weekTraining.filter(
            (s) => s.date === date && s.kind === "strength",
          ).length,
          cardio: weekTraining.filter(
            (s) => s.date === date && s.kind === "cardio",
          ).length,
        };
      }),
    },
    muscleFrequency: snapshot.muscleGroups
      .map((g) => ({
        ...g,
        count: weekTraining.filter((s) => s.muscleGroupIds.includes(g.id))
          .length,
      }))
      .filter((g) => g.count > 0),
  };
}
export type DashboardSummary = ReturnType<typeof summarize>;
