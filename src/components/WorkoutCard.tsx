"use client";
import { Workout } from "@/lib/hevy";

function formatDuration(start: string, end: string) {
  const mins = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function WorkoutCard({ workout }: { workout: Workout }) {
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div
      className="rounded-xl p-4 transition-all hover:brightness-110"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-white text-base leading-tight">{workout.title}</h3>
        <span className="text-xs shrink-0 ml-2 mt-0.5" style={{ color: "var(--muted)" }}>
          {formatDate(workout.start_time)}
        </span>
      </div>
      <div className="flex gap-3 text-xs mb-3" style={{ color: "var(--muted)" }}>
        <span>{formatDuration(workout.start_time, workout.end_time)}</span>
        <span>·</span>
        <span>{workout.exercises.length} exercises</span>
        <span>·</span>
        <span>{totalSets} sets</span>
      </div>
      <ul className="space-y-1">
        {workout.exercises.slice(0, 4).map((ex) => (
          <li key={ex.index} className="text-xs truncate" style={{ color: "var(--muted)" }}>
            {ex.title}
          </li>
        ))}
        {workout.exercises.length > 4 && (
          <li className="text-xs" style={{ color: "var(--accent)" }}>
            +{workout.exercises.length - 4} more
          </li>
        )}
      </ul>
    </div>
  );
}
