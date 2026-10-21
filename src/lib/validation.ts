import type {
  TrainingInput,
  NutritionInput,
  CheckinInput,
  ValidationResult,
} from "./types";
import { validDate } from "./dates";
export type TrainingFormValues = Omit<
  TrainingInput,
  "durationMinutes" | "distanceKm"
> & { durationMinutes: string; distanceKm: string };
export type NutritionFormValues = Omit<
  NutritionInput,
  "calories" | "protein" | "carbs" | "fat"
> & { calories: string; protein: string; carbs: string; fat: string };
export type CheckinFormValues = Omit<
  CheckinInput,
  "steps" | "weightKg" | "waistCm"
> & { steps: string; weightKg: string; waistCm: string };
function numeric(
  value: string,
  key: string,
  errors: Record<string, string>,
  positive = false,
  integer = false,
) {
  if (!value.trim()) return null;
  const v = Number(value);
  if (
    !Number.isFinite(v) ||
    v < 0 ||
    (positive && v <= 0) ||
    (integer && !Number.isSafeInteger(v))
  )
    errors[key] = integer
      ? "Enter a whole, nonnegative number."
      : positive
        ? "Enter a number greater than zero."
        : "Enter a finite, nonnegative number.";
  return v;
}
function base(i: { date: string; notes: string }) {
  const errors: Record<string, string> = {};
  if (!validDate(i.date)) errors.date = "Choose a valid date.";
  if (i.notes.length > 2000) errors.notes = "Use 2,000 characters or fewer.";
  return errors;
}
function finish<T>(
  errors: Record<string, string>,
  value: T,
): ValidationResult<T> {
  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, value };
}
export function validateTraining(
  i: TrainingFormValues,
): ValidationResult<TrainingInput> {
  const errors = base(i),
    durationMinutes = numeric(i.durationMinutes, "durationMinutes", errors),
    distanceKm =
      i.kind === "cardio" ? numeric(i.distanceKm, "distanceKm", errors) : null;
  const ids = [...new Set(i.muscleGroupIds)];
  if (i.kind === "strength" && !ids.length)
    errors.muscleGroupIds = "Choose at least one muscle group.";
  if (
    i.kind === "cardio" &&
    (!i.activityType?.trim() || durationMinutes == null || durationMinutes <= 0)
  )
    errors.durationMinutes =
      "Add an activity type and duration greater than zero.";
  return finish(errors, {
    ...i,
    notes: i.notes.trim(),
    activityType: i.kind === "cardio" ? i.activityType!.trim() : null,
    durationMinutes,
    distanceKm,
    muscleGroupIds: i.kind === "strength" ? ids : [],
  });
}
export function validateNutrition(
  i: NutritionFormValues,
): ValidationResult<NutritionInput> {
  const errors = base(i),
    calories = numeric(i.calories, "calories", errors),
    protein = numeric(i.protein, "protein", errors),
    carbs = numeric(i.carbs, "carbs", errors),
    fat = numeric(i.fat, "fat", errors);
  if ([calories, protein, carbs, fat].every((v) => v === null))
    errors.form = "Add at least one nutrition value.";
  return finish(errors, {
    date: i.date,
    calories,
    protein,
    carbs,
    fat,
    notes: i.notes.trim(),
  });
}
export function validateCheckin(
  i: CheckinFormValues,
): ValidationResult<CheckinInput> {
  const errors = base(i),
    steps = numeric(i.steps, "steps", errors, false, true),
    weightKg = numeric(i.weightKg, "weightKg", errors, true),
    waistCm = numeric(i.waistCm, "waistCm", errors, true);
  if (
    [steps, weightKg, waistCm].every((v) => v === null) &&
    !i.restDay &&
    !i.notes.trim()
  )
    errors.form = "Add a metric, a note, or mark a rest day.";
  return finish(errors, {
    date: i.date,
    steps,
    weightKg,
    waistCm,
    restDay: i.restDay,
    notes: i.notes.trim(),
  });
}
