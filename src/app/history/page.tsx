import { hevy, Workout } from "@/lib/hevy";

export const revalidate = 60;

function duration(w: Workout) {
  const mins = Math.round(
    (new Date(w.end_time).getTime() - new Date(w.start_time).getTime()) / 60000
  );
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function totalVolume(w: Workout) {
  let vol = 0;
  for (const ex of w.exercises) {
    for (const s of ex.sets) {
      if (s.weight_kg && s.reps) vol += s.weight_kg * s.reps;
    }
  }
  return vol > 0 ? `${Math.round(vol).toLocaleString()} kg` : "—";
}

function totalSets(w: Workout) {
  return w.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function HistoryPage() {
  const workouts = await hevy.getAllWorkouts();

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-1">Workout History</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>{workouts.length} workouts total</p>

      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left text-xs font-semibold uppercase tracking-wider"
              style={{ background: "var(--surface-raised)", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}
            >
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Workout</th>
              <th className="px-4 py-3 text-center">Duration</th>
              <th className="px-4 py-3 text-center">Exercises</th>
              <th className="px-4 py-3 text-center">Sets</th>
              <th className="px-4 py-3 text-right">Volume</th>
            </tr>
          </thead>
          <tbody>
            {workouts.map((w, i) => (
              <tr
                key={w.id}
                className="transition-colors hover:brightness-125"
                style={{
                  background: i % 2 === 0 ? "var(--surface)" : "var(--surface-raised)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted)" }}>{formatDate(w.start_time)}</td>
                <td className="px-4 py-3 font-medium text-white">{w.title}</td>
                <td className="px-4 py-3 text-center" style={{ color: "var(--muted)" }}>{duration(w)}</td>
                <td className="px-4 py-3 text-center" style={{ color: "var(--muted)" }}>{w.exercises.length}</td>
                <td className="px-4 py-3 text-center" style={{ color: "var(--muted)" }}>{totalSets(w)}</td>
                <td className="px-4 py-3 text-right font-medium" style={{ color: "var(--accent)" }}>{totalVolume(w)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
