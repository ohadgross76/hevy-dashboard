import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "suggested-routines.json");

export interface SuggestedSet {
  reps: number;
  weight_kg?: number;
}

export interface SuggestedExercise {
  name: string;
  sets: SuggestedSet[];
}

export interface SuggestedRoutine {
  id: string;
  title: string;
  day: string;
  week: string;
  savedAt: string;
  exercises: SuggestedExercise[];
}

function ensureFile() {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, "[]", "utf8");
}

export function loadSuggestedRoutines(): SuggestedRoutine[] {
  ensureFile();
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
}

export function saveSuggestedRoutine(routine: Omit<SuggestedRoutine, "id" | "savedAt">): SuggestedRoutine {
  const all = loadSuggestedRoutines();
  const newRoutine: SuggestedRoutine = {
    ...routine,
    id: `${Date.now()}`,
    savedAt: new Date().toISOString(),
  };
  all.push(newRoutine);
  ensureFile();
  fs.writeFileSync(DATA_PATH, JSON.stringify(all, null, 2), "utf8");
  return newRoutine;
}

export function deleteSuggestedRoutine(id: string): void {
  const all = loadSuggestedRoutines().filter((r) => r.id !== id);
  ensureFile();
  fs.writeFileSync(DATA_PATH, JSON.stringify(all, null, 2), "utf8");
}
