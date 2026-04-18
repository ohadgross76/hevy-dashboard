import { hevy, Routine, RoutineFolder, Exercise, Set } from "@/lib/hevy";
import { loadSuggestedRoutines, SuggestedRoutine } from "@/lib/suggestedRoutines";
import DeleteSuggestedButton from "./DeleteSuggestedButton";

export const revalidate = 0;

function formatWeight(sets: Set[]) {
  const weights = sets.map((s) => s.weight_kg).filter((w): w is number => w !== null && w > 0);
  if (weights.length === 0) return "—";
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  return min === max ? `${min} kg` : `${min}–${max} kg`;
}

function formatReps(sets: Set[]) {
  const reps = sets.map((s) => s.reps).filter((r): r is number => r !== null);
  if (reps.length === 0) return "—";
  const min = Math.min(...reps);
  const max = Math.max(...reps);
  return min === max ? `${min}` : `${min}–${max}`;
}

function RoutineTable({ routine }: { routine: Routine }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-white mb-2 pl-1">{routine.title}</h3>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left text-xs font-semibold uppercase tracking-wider"
              style={{ background: "var(--surface-raised)", color: "var(--muted)", borderBottom: "1px solid var(--border)" }}
            >
              <th className="px-4 py-2 w-8">#</th>
              <th className="px-4 py-2">Exercise</th>
              <th className="px-4 py-2 text-center">Sets</th>
              <th className="px-4 py-2 text-center">Reps</th>
              <th className="px-4 py-2 text-center">Weight</th>
            </tr>
          </thead>
          <tbody>
            {routine.exercises.map((ex: Exercise, i: number) => (
              <tr
                key={ex.index}
                style={{
                  background: i % 2 === 0 ? "var(--surface)" : "var(--surface-raised)",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <td className="px-4 py-2 text-xs" style={{ color: "var(--muted)" }}>{i + 1}</td>
                <td className="px-4 py-2 font-medium text-white">{ex.title}</td>
                <td className="px-4 py-2 text-center" style={{ color: "var(--muted)" }}>{ex.sets.length}</td>
                <td className="px-4 py-2 text-center" style={{ color: "var(--muted)" }}>{formatReps(ex.sets)}</td>
                <td className="px-4 py-2 text-center" style={{ color: "var(--muted)" }}>{formatWeight(ex.sets)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuggestedRoutineTable({ routine }: { routine: SuggestedRoutine }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2 pl-1">
        <h3 className="text-sm font-semibold text-white">
          {routine.title}
          <span className="ml-2 text-xs font-normal" style={{ color: "var(--muted)" }}>{routine.day}</span>
        </h3>
        <DeleteSuggestedButton id={routine.id} />
      </div>
      <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid var(--accent)", opacity: 0.9 }}>
        <table className="w-full text-sm">
          <thead>
            <tr
              className="text-left text-xs font-semibold uppercase tracking-wider"
              style={{ background: "#2a1a0e", color: "var(--accent)", borderBottom: "1px solid var(--border)" }}
            >
              <th className="px-4 py-2 w-8">#</th>
              <th className="px-4 py-2">Exercise</th>
              <th className="px-4 py-2 text-center">Sets</th>
              <th className="px-4 py-2 text-center">Reps</th>
              <th className="px-4 py-2 text-center">Weight</th>
            </tr>
          </thead>
          <tbody>
            {routine.exercises.map((ex, i) => {
              const reps = ex.sets.map((s) => s.reps);
              const repMin = Math.min(...reps), repMax = Math.max(...reps);
              const weights = ex.sets.map((s) => s.weight_kg).filter((w): w is number => w !== undefined && w > 0);
              const wMin = weights.length ? Math.min(...weights) : null;
              const wMax = weights.length ? Math.max(...weights) : null;
              return (
                <tr
                  key={i}
                  style={{
                    background: i % 2 === 0 ? "var(--surface)" : "var(--surface-raised)",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <td className="px-4 py-2 text-xs" style={{ color: "var(--muted)" }}>{i + 1}</td>
                  <td className="px-4 py-2 font-medium text-white">{ex.name}</td>
                  <td className="px-4 py-2 text-center" style={{ color: "var(--muted)" }}>{ex.sets.length}</td>
                  <td className="px-4 py-2 text-center" style={{ color: "var(--muted)" }}>
                    {repMin === repMax ? repMin : `${repMin}–${repMax}`}
                  </td>
                  <td className="px-4 py-2 text-center" style={{ color: "var(--muted)" }}>
                    {wMin === null ? "—" : wMin === wMax ? `${wMin} kg` : `${wMin}–${wMax} kg`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FolderSection({ folder, routines }: { folder: RoutineFolder | null; routines: Routine[] }) {
  if (routines.length === 0) return null;
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: "1px solid var(--border)" }}>
        <h2 className="text-base font-bold text-white">
          {folder ? folder.title : "My Routines"}
        </h2>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "var(--surface-raised)", color: "var(--muted)" }}
        >
          {routines.length}
        </span>
      </div>
      {routines.map((r) => (
        <RoutineTable key={r.id} routine={r} />
      ))}
    </section>
  );
}

export default async function RoutinesPage() {
  const [routines, folders, suggested] = await Promise.all([
    hevy.getAllRoutines(),
    hevy.getRoutineFolders(),
    Promise.resolve(loadSuggestedRoutines()),
  ]);

  const sortedFolders = [...folders].sort((a, b) => a.index - b.index);

  const byFolder = new Map<number | null, Routine[]>();
  byFolder.set(null, []);
  for (const f of sortedFolders) byFolder.set(f.id, []);
  for (const r of routines) {
    const key = r.folder_id ?? null;
    if (!byFolder.has(key)) byFolder.set(key, []);
    byFolder.get(key)!.push(r);
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-1">Routines</h1>
      <p className="text-sm mb-8" style={{ color: "var(--muted)" }}>
        {routines.length} routines · {folders.length} folders
      </p>

      {suggested.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4 pb-2" style={{ borderBottom: "1px solid var(--accent)" }}>
            <h2 className="text-base font-bold" style={{ color: "var(--accent)" }}>Next Week</h2>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "#2a1a0e", color: "var(--accent)" }}
            >
              {suggested.length} suggested
            </span>
          </div>
          {suggested.map((r) => (
            <SuggestedRoutineTable key={r.id} routine={r} />
          ))}
        </section>
      )}

      {sortedFolders.map((f) => (
        <FolderSection key={f.id} folder={f} routines={byFolder.get(f.id) ?? []} />
      ))}

      <FolderSection folder={null} routines={byFolder.get(null) ?? []} />
    </main>
  );
}
