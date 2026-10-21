// DESIGN_PREVIEW_ONLY: Synthetic fixtures for local visual QA. Never imported by the production entry.
import type { FitnessRepository } from "../src/lib/repository";
import type {
  DashboardSnapshot,
  TrainingInput,
  TrainingSession,
  CheckinInput,
  NutritionInput,
  Goals,
  Profile,
  MuscleGroup,
} from "../src/lib/types";
import { localDate, shiftDate } from "../src/lib/dates";
export function createMemoryRepository({
  empty = false,
  failSaves = false,
} = {}): FitnessRepository {
  const today = localDate(new Date(), "Asia/Kolkata"),
    names = [
      "Chest",
      "Back",
      "Shoulders",
      "Biceps",
      "Triceps",
      "Quadriceps",
      "Hamstrings",
      "Glutes",
      "Calves",
      "Core",
      "Full body",
    ];
  const data: DashboardSnapshot = {
    profile: {
      userId: "preview-only",
      displayName: "Akshath",
      timeZone: "Asia/Kolkata",
    },
    goals: {
      calories: 1900,
      protein: 150,
      carbs: 190,
      fat: 55,
      steps: 10000,
      weeklyTraining: 5,
    },
    muscleGroups: names.map((name, i) => ({
      id: `muscle-${i}`,
      name,
      isCustom: false,
    })),
    training: [],
    nutrition: [],
    checkins: [],
    latestWeight: null,
  };
  if (!empty) {
    data.training = [
      {
        id: "preview-1",
        date: today,
        kind: "strength",
        activityType: null,
        durationMinutes: 55,
        distanceKm: null,
        notes: "Good energy today. Focused on form.",
        muscleGroupIds: ["muscle-0", "muscle-2", "muscle-4"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "preview-2",
        date: shiftDate(today, -1),
        kind: "cardio",
        activityType: "Running",
        durationMinutes: 32,
        distanceKm: 4.8,
        notes: "Easy evening run.",
        muscleGroupIds: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: "preview-3",
        date: shiftDate(today, -2),
        kind: "strength",
        activityType: null,
        durationMinutes: 48,
        distanceKm: null,
        notes: "",
        muscleGroupIds: ["muscle-1", "muscle-3"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "preview-4",
        date: shiftDate(today, -4),
        kind: "strength",
        activityType: null,
        durationMinutes: 50,
        distanceKm: null,
        notes: "",
        muscleGroupIds: ["muscle-5", "muscle-6", "muscle-7"],
        createdAt: new Date().toISOString(),
      },
    ];
    data.nutrition = Array.from({ length: 9 }, (_, i) => ({
      date: shiftDate(today, -i),
      calories: i === 0 ? 1680 : 1820 + i * 9,
      protein: i === 0 ? 128 : 145 + i,
      carbs: 174 + i * 2,
      fat: 49 + i,
      notes: "",
    }));
    data.checkins = Array.from({ length: 11 }, (_, i) => ({
      date: shiftDate(today, -i * 3),
      steps: i === 0 ? 7200 : 8200 + i * 137,
      weightKg: Math.round((74.6 + i * 0.11 + Math.sin(i) * 0.09) * 10) / 10,
      waistCm: i % 3 === 0 ? 80.5 + i * 0.1 : null,
      restDay: false,
      notes: "",
    }));
  }
  function writing() {
    if (failSaves)
      throw new Error(
        "Preview: save failed. Your entries are still here. Please try again.",
      );
  }
  const clone = <T>(value: T): T => structuredClone(value);
  const upsert = <T extends { date: string }>(list: T[], input: T) => {
    const i = list.findIndex((r) => r.date === input.date);
    if (i < 0) list.push(clone(input));
    else list[i] = clone(input);
    return clone(input);
  };
  return {
    async getSnapshot(range, signal) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      const s = clone(data);
      s.training = s.training
        .filter((r) => r.date >= range.start && r.date <= range.end)
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            b.createdAt.localeCompare(a.createdAt),
        );
      s.nutrition = s.nutrition
        .filter((r) => r.date >= range.start && r.date <= range.end)
        .sort((a, b) => b.date.localeCompare(a.date));
      s.checkins = s.checkins
        .filter((r) => r.date >= range.start && r.date <= range.end)
        .sort((a, b) => b.date.localeCompare(a.date));
      s.latestWeight = clone(
        data.checkins
          .filter((r) => r.weightKg != null && r.date <= range.end)
          .sort((a, b) => b.date.localeCompare(a.date))[0] || null,
      );
      return s;
    },
    async saveTraining(input: TrainingInput) {
      writing();
      const row: TrainingSession = {
        ...clone(input),
        id: input.id || crypto.randomUUID(),
        createdAt:
          data.training.find((t) => t.id === input.id)?.createdAt ||
          new Date().toISOString(),
      };
      const i = data.training.findIndex((t) => t.id === row.id);
      if (i < 0) data.training.push(row);
      else data.training[i] = row;
      const c = data.checkins.find((c) => c.date === row.date);
      if (c) c.restDay = false;
      return clone(row);
    },
    async deleteTraining(id) {
      writing();
      data.training = data.training.filter((t) => t.id !== id);
    },
    async saveNutrition(input: NutritionInput) {
      writing();
      return upsert(data.nutrition, input);
    },
    async deleteNutrition(date) {
      writing();
      data.nutrition = data.nutrition.filter((n) => n.date !== date);
    },
    async saveCheckin(input: CheckinInput) {
      writing();
      if (input.restDay && data.training.some((t) => t.date === input.date))
        throw new Error("A day with training cannot be marked as rest.");
      return upsert(data.checkins, input);
    },
    async deleteCheckin(date) {
      writing();
      data.checkins = data.checkins.filter((c) => c.date !== date);
    },
    async saveSettings(
      profile: Pick<Profile, "displayName" | "timeZone">,
      goals: Goals,
    ) {
      writing();
      data.profile = { ...data.profile, ...clone(profile) };
      data.goals = clone(goals);
      return clone({ profile: data.profile, goals: data.goals });
    },
    async addMuscleGroup(name: string) {
      writing();
      if (
        data.muscleGroups.some(
          (g) => g.name.toLowerCase() === name.toLowerCase(),
        )
      )
        throw new Error("That muscle group already exists.");
      const g: MuscleGroup = { id: crypto.randomUUID(), name, isCustom: true };
      data.muscleGroups.push(g);
      return clone(g);
    },
  };
}
