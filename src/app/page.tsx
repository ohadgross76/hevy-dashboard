import { hevy, Workout } from "@/lib/hevy";
import WorkoutCalendar from "@/components/WorkoutCalendar";

export const revalidate = 60;

// ─── Muscle inference ───────────────────────────────────────────────────────

const MUSCLE_PATTERNS: [RegExp, string][] = [
  [/squat|leg press|lunge|bulgarian|leg extension|hack squat/i, "Quads"],
  [/rdl|romanian|leg curl|hamstring|nordic/i, "Hamstrings"],
  [/deadlift/i, "Hamstrings"],
  [/glute bridge|hip thrust|rear kick|kickback/i, "Glutes"],
  [/calf|calves/i, "Calves"],
  [/bench|chest press|fly|pec dec|push.?up/i, "Chest"],
  [/lat pull|seated row|dumbbell row|t-bar|pull.?up|chin.?up/i, "Back"],
  [/lateral raise|front raise|rear delt|face pull|shoulder press|overhead press/i, "Shoulders"],
  [/bicep curl|hammer curl|preacher curl|curl/i, "Biceps"],
  [/tricep|pushdown|skull|overhead extension/i, "Triceps"],
  [/crunch|plank|leg raise|\bab\b|sit.?up/i, "Core"],
];

const MUSCLE_COLORS: Record<string, string> = {
  Quads: "#FF6922",
  Hamstrings: "#FF8C4A",
  Glutes: "#FFAA70",
  Back: "#4A9EFF",
  Chest: "#4AFFC4",
  Shoulders: "#FFD74A",
  Biceps: "#C47AFF",
  Triceps: "#FF4A9E",
  Calves: "#4AFFEE",
  Core: "#8CFF4A",
};

function getMuscleGroup(title: string): string {
  for (const [pattern, group] of MUSCLE_PATTERNS) {
    if (pattern.test(title)) return group;
  }
  return "Other";
}

function getMuscleStats(workouts: Workout[]) {
  const counts = new Map<string, number>();
  for (const w of workouts) {
    for (const ex of w.exercises) {
      const group = getMuscleGroup(ex.title);
      if (group !== "Other") counts.set(group, (counts.get(group) ?? 0) + 1);
    }
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)
    .map(([group, count]) => ({ group, count, pct: Math.round((count / total) * 100) }));
}

// ─── Stats helpers ───────────────────────────────────────────────────────────

function workoutsThisWeek(workouts: Workout[]) {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return workouts.filter((w) => new Date(w.start_time).getTime() > weekAgo).length;
}

function getStreak(workouts: Workout[]) {
  const dates = new Set(
    workouts.map((w) => {
      const d = new Date(w.start_time);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = today.getTime();
  if (!dates.has(cursor)) cursor -= 86400000;
  let streak = 0;
  while (dates.has(cursor)) {
    streak++;
    cursor -= 86400000;
  }
  return streak;
}

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function formatDuration(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ─── Calendar ────────────────────────────────────────────────────────────────

// ─── Muscle chart ─────────────────────────────────────────────────────────────

function MuscleChart({ stats }: { stats: { group: string; count: number; pct: number }[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {stats.map(({ group, count, pct }) => (
        <div key={group}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontSize: 13, color: "white", fontWeight: 500 }}>{group}</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              {count}× · {pct}%
            </span>
          </div>
          <div style={{ background: "var(--surface-raised)", borderRadius: 4, height: 6, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                borderRadius: 4,
                background: MUSCLE_COLORS[group] ?? "var(--accent)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-widest">{title}</h2>
        {subtitle && <span className="text-xs" style={{ color: "var(--muted)" }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      className="rounded-xl p-4 text-center"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
        {value}
      </div>
      <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
        {label}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const PAGE_SIZE = 10;
  const [countData, firstPage] = await Promise.all([
    hevy.getWorkoutCount(),
    hevy.getWorkouts(1, PAGE_SIZE),
  ]);

  const maxPages = Math.min(firstPage.page_count, 10);
  const restPages =
    maxPages > 1
      ? await Promise.all(
          Array.from({ length: maxPages - 1 }, (_, i) => hevy.getWorkouts(i + 2, PAGE_SIZE))
        )
      : [];

  const workouts = [firstPage, ...restPages].flatMap((r) => r.workouts);
  const { workout_count } = countData;

  const thisWeek = workoutsThisWeek(workouts);
  const streak = getStreak(workouts);
  const muscleStats = getMuscleStats(workouts);
  const workoutDates = workouts.map((w) => w.start_time.slice(0, 10));

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Hey, Ohad 👋</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Workouts" value={workout_count} />
        <StatCard label="This Week" value={thisWeek} />
        <StatCard label="Current Streak" value={streak > 0 ? `${streak}d` : "—"} />
        <StatCard label="Last Workout" value={workouts[0] ? daysAgo(workouts[0].start_time) : "—"} />
      </div>

      {/* Calendar */}
      <div className="mb-6">
        <Section title="Workout Calendar">
          <WorkoutCalendar workoutDates={workoutDates} />
        </Section>
      </div>

      {/* Muscle + Recent */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Section title="Muscle Distribution" subtitle={`${workouts.length} workouts`}>
          <MuscleChart stats={muscleStats} />
        </Section>

        <Section title="Recent Workouts">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {workouts.slice(0, 6).map((w) => (
              <div
                key={w.id}
                className="flex items-center justify-between rounded-lg px-3 py-2.5"
                style={{ background: "var(--surface-raised)", border: "1px solid var(--border)" }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    className="text-sm font-medium text-white truncate"
                    style={{ maxWidth: 200 }}
                  >
                    {w.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
                    {formatDuration(w.start_time, w.end_time)} · {w.exercises.length} ex
                  </div>
                </div>
                <div className="text-xs shrink-0 ml-3" style={{ color: "var(--muted)" }}>
                  {daysAgo(w.start_time)}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </main>
  );
}
