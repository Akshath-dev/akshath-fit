import { useState, type FormEvent } from "react";
import { Settings2, Plus, LockKeyhole, LogOut } from "lucide-react";
import type { DashboardSnapshot, Goals } from "../../lib/types";
import { useDashboard } from "../../data/DashboardProvider";
import {
  Button,
  Card,
  CardTitle,
  Field,
  ErrorNotice,
} from "../../components/Ui";
import { useEntrySave } from "../../components/EntrySheet";
export function SettingsPage({ onSignOut }: { onSignOut?: () => void } = {}) {
  const { snapshot } = useDashboard();
  return snapshot ? (
    <SettingsFields snapshot={snapshot} onSignOut={onSignOut} />
  ) : null;
}
function SettingsFields({
  snapshot,
  onSignOut,
}: {
  snapshot: DashboardSnapshot;
  onSignOut?: () => void;
}) {
  const { mutate } = useDashboard(),
    [displayName, setName] = useState(snapshot.profile.displayName),
    [timeZone, setZone] = useState(snapshot.profile.timeZone),
    [goals, setGoals] = useState<Record<keyof Goals, string>>(
      () =>
        Object.fromEntries(
          Object.entries(snapshot.goals).map(([k, v]) => [
            k,
            v?.toString() ?? "",
          ]),
        ) as Record<keyof Goals, string>,
    ),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [saved, setSaved] = useState(""),
    [newGroup, setNewGroup] = useState(""),
    [groupError, setGroupError] = useState("");
  const saving = useEntrySave(),
    groupSave = useEntrySave();
  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaved("");
    const errors: Record<string, string> = {},
      values = {} as Goals;
    if (!displayName.trim() || displayName.trim().length > 60)
      errors.displayName = "Use a name between 1 and 60 characters.";
    try {
      new Intl.DateTimeFormat("en", { timeZone }).format();
    } catch {
      errors.timeZone = "Choose a valid time zone.";
    }
    for (const key of Object.keys(goals) as (keyof Goals)[]) {
      const raw = goals[key].trim(),
        value = raw ? Number(raw) : null;
      values[key] = value;
      if (
        value !== null &&
        (!Number.isFinite(value) ||
          value <= 0 ||
          (["steps", "weeklyTraining"].includes(key) &&
            !Number.isSafeInteger(value)))
      )
        errors[key] = "Use a positive number, or leave blank.";
    }
    setErrors(errors);
    if (Object.keys(errors).length) return;
    await saving.submit(async () => {
      await mutate((r) =>
        r.saveSettings({ displayName: displayName.trim(), timeZone }, values),
      );
      setSaved("Settings saved.");
    });
  }
  async function addGroup(e: FormEvent) {
    e.preventDefault();
    setGroupError("");
    const name = newGroup.trim();
    if (!name || name.length > 40) {
      setGroupError("Use a name between 1 and 40 characters.");
      return;
    }
    if (
      snapshot.muscleGroups.some(
        (g) => g.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setGroupError("That muscle group is already available.");
      return;
    }
    await groupSave.submit(async () => {
      await mutate((r) => r.addMuscleGroup(name));
      setNewGroup("");
    });
  }
  const zones = [
    ...new Set([
      "Asia/Kolkata",
      "UTC",
      ...(typeof Intl.supportedValuesOf === "function"
        ? Intl.supportedValuesOf("timeZone")
        : []),
    ]),
  ];
  return (
    <div className="settings-layout">
      <form className="page-stack settings-main" onSubmit={submit}>
        <Card>
          <CardTitle>
            <Settings2 size={17} />
            Your personal space
          </CardTitle>
          <div className="form-grid">
            <Field
              label="Display name"
              maxLength={60}
              required
              value={displayName}
              onChange={(e) => {
                setName(e.target.value);
                setSaved("");
              }}
              error={errors.displayName}
            />
            <Field
              label="Time zone"
              list="time-zones"
              value={timeZone}
              onChange={(e) => {
                setZone(e.target.value);
                setSaved("");
              }}
              error={errors.timeZone}
            />
            <datalist id="time-zones">
              {zones.map((zone) => (
                <option key={zone} value={zone} />
              ))}
            </datalist>
          </div>
          <p className="form-hint settings-note">
            Dates follow your time zone. Measurements use kg, cm, and km.
          </p>
        </Card>
        <Card>
          <CardTitle>Your targets, your pace</CardTitle>
          <p className="form-hint">
            Starting nutrition targets were imported from your original plan.
            Adjust them to match your current goals. Optional targets can stay
            blank.
          </p>
          <div className="form-grid goals-grid">
            {(
              [
                { key: "calories", label: "Calories (kcal)" },
                { key: "protein", label: "Protein (g)" },
                { key: "carbs", label: "Carbohydrates (g)" },
                { key: "fat", label: "Fat (g)" },
                { key: "steps", label: "Daily steps" },
                { key: "weeklyTraining", label: "Weekly training sessions" },
              ] as const
            ).map(({ key, label }) => (
              <Field
                key={key}
                label={label}
                type="number"
                min="0"
                step={["steps", "weeklyTraining"].includes(key) ? "1" : "any"}
                value={goals[key]}
                onChange={(e) => {
                  setGoals((g) => ({ ...g, [key]: e.target.value }));
                  setSaved("");
                }}
                placeholder="Not set"
                error={errors[key]}
              />
            ))}
          </div>
          {saving.error && <ErrorNotice message={saving.error} />}
          <div className="settings-save">
            {saved && <p role="status">{saved}</p>}
            <Button type="submit" disabled={saving.busy}>
              {saving.busy ? "Saving…" : "Save settings"}
            </Button>
          </div>
        </Card>
      </form>
      <aside className="page-stack settings-aside">
        <Card>
          <CardTitle>Muscle groups</CardTitle>
          <p className="form-hint">
            Your built-in groups are ready to use. Add anything you want to
            track separately.
          </p>
          <div className="settings-muscles">
            {snapshot.muscleGroups.map((g) => (
              <span key={g.id} className={g.isCustom ? "custom" : ""}>
                {g.name}
              </span>
            ))}
          </div>
          <form className="entry-form" onSubmit={addGroup}>
            <Field
              label="New muscle group"
              maxLength={40}
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              placeholder="e.g. Forearms"
              error={groupError}
            />
            {groupSave.error && <ErrorNotice message={groupSave.error} />}
            <Button variant="secondary" type="submit" disabled={groupSave.busy}>
              <Plus size={15} />
              {groupSave.busy ? "Adding…" : "Add muscle group"}
            </Button>
          </form>
        </Card>
        <Card className="account-card">
          <span className="stat-icon lime">
            <LockKeyhole size={19} />
          </span>
          <h2>Just your account.</h2>
          <p>
            This space is restricted to the owner. Manage your sign-in through
            your Supabase project.
          </p>
          {onSignOut && (
            <Button variant="ghost" onClick={onSignOut}>
              <LogOut size={15} />
              Sign out
            </Button>
          )}
        </Card>
      </aside>
    </div>
  );
}
