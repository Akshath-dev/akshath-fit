import { useState, type FormEvent } from "react";
import type { NutritionInput } from "../../lib/types";
import {
  validateNutrition,
  type NutritionFormValues,
} from "../../lib/validation";
import { Field, ErrorNotice } from "../../components/Ui";
import { EntryActions, useEntrySave } from "../../components/EntrySheet";
export function NutritionForm({
  date,
  initial,
  onSave,
  onCancel,
}: {
  date: string;
  initial?: NutritionInput;
  onSave: (input: NutritionInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [v, setV] = useState<NutritionFormValues>({
      date: initial?.date || date,
      calories: initial?.calories?.toString() ?? "",
      protein: initial?.protein?.toString() ?? "",
      carbs: initial?.carbs?.toString() ?? "",
      fat: initial?.fat?.toString() ?? "",
      notes: initial?.notes || "",
    }),
    [errors, setErrors] = useState<Record<string, string>>({});
  const save = useEntrySave();
  const update = (key: keyof NutritionFormValues, value: string) =>
    setV((s) => ({ ...s, [key]: value }));
  function submit(e: FormEvent) {
    e.preventDefault();
    const result = validateNutrition(v);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    void save.submit(() => onSave(result.value));
  }
  return (
    <form className="entry-form" onSubmit={submit} aria-busy={save.busy}>
      <p className="form-hint">
        Enter your totals for the day. Leave anything you haven’t tracked blank.
      </p>
      <Field
        label="Date"
        type="date"
        required
        value={v.date}
        readOnly
        error={errors.date}
      />
      <p className="form-hint">
        To log another day, close this form and select that date.
      </p>
      <div className="form-grid">
        {(["calories", "protein", "carbs", "fat"] as const).map((key) => (
          <Field
            key={key}
            label={
              key === "calories"
                ? "Calories (kcal)"
                : `${key === "carbs" ? "Carbohydrates" : key[0].toUpperCase() + key.slice(1)} (g)`
            }
            type="number"
            min="0"
            step="any"
            value={v[key]}
            placeholder="Not logged"
            onChange={(e) => update(key, e.target.value)}
            error={errors[key]}
          />
        ))}
      </div>
      <label className="field">
        <span>Notes · optional</span>
        <textarea
          maxLength={2000}
          value={v.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Anything to remember about today?"
        />
      </label>
      {(errors.form || save.error) && (
        <ErrorNotice message={save.error || errors.form} />
      )}
      <EntryActions
        busy={save.busy}
        label="Save nutrition"
        onCancel={onCancel}
      />
    </form>
  );
}
