import { it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NutritionForm } from "./nutrition/NutritionForm";
import type { NutritionInput, CheckinInput } from "../lib/types";
import { CheckinForm } from "./progress/CheckinForm";

it("keeps an edited nutrition day fixed and preserves another day's totals", async () => {
  const original = {
    date: "2026-10-19",
    calories: null,
    protein: 100,
    carbs: null,
    fat: null,
    notes: "Monday",
  };
  const destination = {
    ...original,
    date: "2026-10-20",
    calories: 1900,
    protein: 150,
    notes: "Tuesday",
  };
  const records = new Map<string, NutritionInput>([
    [original.date, original],
    [destination.date, destination],
  ]);
  render(
    <NutritionForm
      date={original.date}
      initial={original}
      onCancel={() => {}}
      onSave={async (i) => {
        records.set(i.date, i);
      }}
    />,
  );
  expect(screen.getByLabelText("Date")).toHaveAttribute("readonly");
  await userEvent.clear(screen.getByLabelText("Protein (g)"));
  await userEvent.type(screen.getByLabelText("Protein (g)"), "120");
  await userEvent.click(screen.getByRole("button", { name: "Save nutrition" }));
  expect(records.get(original.date)?.protein).toBe(120);
  expect(records.get(destination.date)).toEqual(destination);
});

it("keeps an edited check-in day fixed and preserves another day's measurements", async () => {
  const original = {
    date: "2026-10-19",
    steps: 2000,
    weightKg: null,
    waistCm: null,
    restDay: false,
    notes: "Monday",
  };
  const destination = {
    ...original,
    date: "2026-10-20",
    weightKg: 75,
    steps: 9000,
    notes: "Tuesday",
  };
  const records = new Map<string, CheckinInput>([
    [original.date, original],
    [destination.date, destination],
  ]);
  render(
    <CheckinForm
      date={original.date}
      initial={original}
      onCancel={() => {}}
      onSave={async (i) => {
        records.set(i.date, i);
      }}
    />,
  );
  expect(screen.getByLabelText("Date")).toHaveAttribute("readonly");
  await userEvent.clear(screen.getByLabelText("Steps"));
  await userEvent.type(screen.getByLabelText("Steps"), "4000");
  await userEvent.click(screen.getByRole("button", { name: "Save check-in" }));
  expect(records.get(original.date)?.steps).toBe(4000);
  expect(records.get(destination.date)).toEqual(destination);
});
