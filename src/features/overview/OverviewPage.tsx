import {
  Flame,
  Dumbbell,
  Footprints,
  Scale,
  ArrowUpRight,
  Plus,
  Check,
  Utensils,
  NotebookPen,
  ChevronRight,
  Target,
} from "lucide-react";
import { useDashboard } from "../../data/DashboardProvider";
import { summarize } from "../../lib/metrics";
import { daysEnding, prettyDate } from "../../lib/dates";
import type { EditorRequest, Route } from "../../lib/types";
import {
  Card,
  CardTitle,
  ArrowButton,
  formatNumber,
  EmptyState,
} from "../../components/Ui";
import { ProgressRing, WeekBars, WeightChart } from "../../components/Charts";
export function OverviewPage({
  onEdit,
  onNavigate,
}: {
  onEdit: (r: EditorRequest) => void;
  onNavigate: (r: Route) => void;
}) {
  const { snapshot, selectedDate } = useDashboard();
  if (!snapshot) return null;
  const s = summarize(snapshot, selectedDate),
    g = snapshot.goals,
    n = s.nutritionToday,
    c = s.checkinToday,
    todayTraining = snapshot.training.filter((t) => t.date === selectedDate),
    weightPoints = snapshot.checkins.filter((c) => c.weightKg != null),
    recent = snapshot.training
      .filter((s) => s.date <= selectedDate)
      .slice(0, 3);
  const priorities = [
    {
      label: c?.restDay ? "Rest & recover" : "Log your movement",
      detail: c?.restDay
        ? "Rest day marked"
        : todayTraining.length
          ? `${todayTraining.length} session${todayTraining.length > 1 ? "s" : ""} recorded`
          : "Strength, cardio, or a rest day",
      done: !!c?.restDay || todayTraining.length > 0,
      icon: Dumbbell,
      edit: { type: c?.restDay ? "checkin" : "training" } as EditorRequest,
    },
    {
      label: "Log your nutrition",
      detail: n
        ? "Daily totals recorded"
        : "A little clarity on your daily fuel",
      done: !!n,
      icon: Utensils,
      edit: { type: "nutrition", initial: n } as EditorRequest,
    },
    {
      label: g.protein
        ? `${formatNumber(g.protein)} g of protein`
        : "Set your protein target",
      detail:
        n?.protein != null
          ? `${formatNumber(n.protein)} g recorded`
          : "Not logged yet",
      done: !!g.protein && (n?.protein ?? -1) >= g.protein,
      icon: Target,
      edit: { type: "nutrition", initial: n } as EditorRequest,
    },
    {
      label: g.steps
        ? `${formatNumber(g.steps)} steps`
        : "Log your daily steps",
      detail:
        c?.steps != null
          ? `${formatNumber(c.steps)} steps recorded`
          : "Every step adds up",
      done: g.steps ? c?.steps != null && c.steps >= g.steps : c?.steps != null,
      icon: Footprints,
      edit: { type: "checkin", initial: c } as EditorRequest,
    },
  ];
  const completed = priorities.filter((p) => p.done).length;
  return (
    <div className="dashboard-grid">
      <div className="dashboard-primary">
        <div className="top-metrics">
          <Card className="nutrition-summary">
            <CardTitle
              action={
                <ArrowButton
                  label="Open nutrition"
                  onClick={() => onNavigate("nutrition")}
                />
              }
            >
              Nutrition <Flame size={16} />
            </CardTitle>
            <div className="metric-value">
              {formatNumber(n?.calories)}
              <span>kcal</span>
            </div>
            <p className="metric-caption">
              {s.caloriesRemaining == null
                ? g.calories
                  ? `${formatNumber(g.calories)} kcal daily target`
                  : "Daily target not set"
                : s.caloriesRemaining >= 0
                  ? `${formatNumber(s.caloriesRemaining)} kcal to your target`
                  : `${formatNumber(-s.caloriesRemaining)} kcal over your target`}
            </p>
            <div className="protein-summary">
              <div>
                <span>Protein</span>
                <strong>
                  {formatNumber(n?.protein)}{" "}
                  <small>/ {formatNumber(g.protein)} g</small>
                </strong>
              </div>
              <div className="track">
                <span
                  style={{
                    width: `${n?.protein != null && g.protein ? Math.min(100, (n.protein / g.protein) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </Card>
          <Card className="steps-summary">
            <CardTitle
              action={
                <ArrowButton
                  label="Log steps"
                  onClick={() => onEdit({ type: "checkin", initial: c })}
                />
              }
            >
              Steps
            </CardTitle>
            <ProgressRing
              value={c?.steps ?? null}
              target={g.steps}
              label={`${formatNumber(c?.steps)} steps${g.steps ? ` of ${formatNumber(g.steps)}` : ""}`}
            />
            <p className="metric-caption">
              {g.steps ? (
                <>
                  <span>Daily target</span>
                  <strong>{formatNumber(g.steps)}</strong>
                </>
              ) : (
                "Set a target in Settings"
              )}
            </p>
          </Card>
          <Card className="weight-summary">
            <CardTitle
              action={
                <ArrowButton
                  label="Open progress"
                  onClick={() => onNavigate("progress")}
                />
              }
            >
              Weight
            </CardTitle>
            <div className="metric-value">
              {formatNumber(s.latestWeight?.weightKg, 1)}
              <span>kg</span>
            </div>
            <p className="metric-caption">
              {s.latestWeight
                ? `Last logged ${prettyDate(s.latestWeight.date)}`
                : "Your starting point is enough"}
            </p>
            <WeightChart
              points={weightPoints}
              start={daysEnding(selectedDate, 30)[0]}
              end={selectedDate}
              mini
            />
            <div className="weight-average">
              <span>7-day average</span>
              <strong>
                {formatNumber(s.weightAverage, 1)} <small>kg</small>
              </strong>
            </div>
          </Card>
        </div>
        <Card className="weekly-card">
          <CardTitle
            action={
              <button
                className="text-link"
                onClick={() => onNavigate("training")}
              >
                View journal
                <ArrowUpRight size={14} />
              </button>
            }
          >
            Your week in motion
          </CardTitle>
          <div className="week-heading">
            <div>
              <strong>
                {s.week.total}
                <span> sessions</span>
              </strong>
              <p>
                {g.weeklyTraining
                  ? `${g.weeklyTraining} sessions is your weekly target`
                  : "One session at a time."}
              </p>
            </div>
            <span className="date-chip">
              {prettyDate(s.week.start)} – {prettyDate(s.week.end)}
            </span>
          </div>
          <WeekBars week={s.week} selectedDate={selectedDate} />
          <div className="chart-legend">
            <span>
              <i className="legend-lime" />
              Strength
            </span>
            <span>
              <i className="legend-violet" />
              Cardio
            </span>
            <span className="legend-time">{s.week.minutes} min recorded</span>
          </div>
        </Card>
        <Card className="recent-card">
          <CardTitle
            action={
              <button
                className="text-link"
                onClick={() => onNavigate("training")}
              >
                View all
                <ArrowUpRight size={14} />
              </button>
            }
          >
            Recent activity
          </CardTitle>
          {recent.length ? (
            recent.map((session) => (
              <button
                className="recent-row"
                key={session.id}
                onClick={() => onEdit({ type: "training", initial: session })}
              >
                <span
                  className={`activity-icon ${session.kind === "strength" ? "lime" : "violet"}`}
                >
                  {session.kind === "strength" ? (
                    <Dumbbell size={18} />
                  ) : (
                    <Footprints size={18} />
                  )}
                </span>
                <span className="recent-description">
                  <strong>
                    {session.kind === "strength"
                      ? session.muscleGroupIds
                          .map(
                            (id) =>
                              snapshot.muscleGroups.find((g) => g.id === id)
                                ?.name,
                          )
                          .filter(Boolean)
                          .join(" + ")
                      : session.activityType}
                  </strong>
                  <small>
                    {prettyDate(session.date, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {session.kind === "strength" ? "Strength" : "Cardio"}
                  </small>
                </span>
                <span className="recent-duration">
                  {session.durationMinutes != null
                    ? `${session.durationMinutes} min`
                    : "Logged"}
                </span>
                <ArrowUpRight size={15} />
              </button>
            ))
          ) : (
            <EmptyState
              icon={<Dumbbell size={20} />}
              title="Make your first entry."
              description="Your recent activity will appear here."
            />
          )}
        </Card>
      </div>
      <aside className="dashboard-secondary">
        <Card className="priorities-card">
          <CardTitle
            action={
              <button
                className="icon-button"
                aria-label="Edit goals"
                onClick={() => onNavigate("settings")}
              >
                <Target size={15} />
              </button>
            }
          >
            Daily check-in
          </CardTitle>
          <span className="tiny muted">Small actions. A stronger routine.</span>
          <div className="priority-list">
            {priorities.map(({ label, detail, done, icon: Icon, edit }) => (
              <button
                key={label}
                className={`priority-item ${done ? "complete" : ""}`}
                onClick={() =>
                  label === "Set your protein target"
                    ? onNavigate("settings")
                    : onEdit(edit)
                }
              >
                <span className="priority-icon">
                  <Icon size={18} />
                </span>
                <span>
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </span>
                <span className="priority-check">
                  {done && <Check size={13} />}
                </span>
              </button>
            ))}
          </div>
          <div className="priority-completion">
            <div className="track">
              <span style={{ width: `${(completed / 4) * 100}%` }} />
            </div>
            <div>
              <span>Checked in</span>
              <strong>
                {completed}
                <small> / 4</small>
              </strong>
            </div>
          </div>
        </Card>
        <div className="quick-entry-card">
          <span className="eyebrow">YOUR NEXT SMALL STEP</span>
          <h2>
            Put it on
            <br />
            the record.
          </h2>
          <div className="quick-entry-buttons">
            {[
              { label: "Workout", type: "training", icon: Dumbbell },
              { label: "Cardio", type: "cardio", icon: Footprints },
              { label: "Nutrition", type: "nutrition", icon: Utensils },
              { label: "Check-in", type: "checkin", icon: Scale },
            ].map(({ label, type, icon: Icon }) => (
              <button
                key={label}
                onClick={() =>
                  onEdit(
                    type === "cardio"
                      ? { type: "training", kind: "cardio" }
                      : ({ type } as EditorRequest),
                  )
                }
              >
                <Icon size={17} />
                {label}
                <Plus size={14} />
              </button>
            ))}
          </div>
        </div>
        <button className="plan-link-card" onClick={() => onNavigate("plan")}>
          <span className="plan-link-icon">
            <NotebookPen size={23} />
          </span>
          <strong>
            Your plan,
            <br />
            one tap away.
          </strong>
          <p>Training · Meals · Groceries</p>
          <span>
            Open your plan
            <ChevronRight size={15} />
          </span>
        </button>
      </aside>
    </div>
  );
}
