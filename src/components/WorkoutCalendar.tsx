"use client";
import { useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function WorkoutCalendar({ workoutDates }: { workoutDates: string[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const dateSet = new Set(workoutDates);

  function prev() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function next() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
  const offset = (firstDow + 6) % 7; // shift to Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const isFutureMonth =
    year > today.getFullYear() ||
    (year === today.getFullYear() && month > today.getMonth());

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prev}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "var(--muted)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <span className="text-sm font-semibold text-white">
          {MONTHS[month]} {year}
        </span>

        <button
          onClick={next}
          disabled={isFutureMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/5 disabled:opacity-30"
          style={{ color: "var(--muted)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_HEADERS.map((d) => (
          <div key={d} className="text-center text-xs font-medium py-1" style={{ color: "var(--muted)" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const hasWorkout = dateSet.has(dateStr);
          const isToday = isCurrentMonth && day === today.getDate();
          const isPast = !isFutureMonth && (
            !isCurrentMonth || day <= today.getDate()
          );

          return (
            <div key={i} className="flex items-center justify-center py-0.5">
              <div
                className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all select-none"
                style={{
                  background: hasWorkout ? "var(--accent)" : "transparent",
                  color: hasWorkout
                    ? "white"
                    : isToday
                    ? "var(--accent)"
                    : isPast
                    ? "white"
                    : "var(--muted)",
                  border: isToday && !hasWorkout ? "1.5px solid var(--accent)" : "none",
                  opacity: !isPast && !isToday ? 0.3 : 1,
                }}
              >
                {day}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: "var(--accent)" }} />
          <span className="text-xs" style={{ color: "var(--muted)" }}>Workout</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-1.5" style={{ border: "1.5px solid var(--accent)" }} />
          <span className="text-xs" style={{ color: "var(--muted)" }}>Today</span>
        </div>
      </div>
    </div>
  );
}
