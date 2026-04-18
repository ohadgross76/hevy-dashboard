import { NextRequest, NextResponse } from "next/server";
import { hevy, ExerciseTemplate } from "@/lib/hevy";

function findTemplateId(name: string, templates: ExerciseTemplate[]): string | null {
  const n = name.toLowerCase().trim();

  // Exact match
  let t = templates.find((t) => t.title.toLowerCase() === n);
  if (t) return t.id;

  // Strip parentheticals and match core name: "Squat (BB)" → "Squat"
  const stripped = n.replace(/\s*\(.*?\)/g, "").trim();
  t = templates.find(
    (t) => t.title.toLowerCase().replace(/\s*\(.*?\)/g, "").trim() === stripped
  );
  if (t) return t.id;

  // Substring match
  t = templates.find(
    (t) => t.title.toLowerCase().includes(n) || n.includes(t.title.toLowerCase())
  );
  if (t) return t.id;

  // Word overlap scoring
  const words = n.split(/[\s()]+/).filter(Boolean);
  let best = 0;
  let bestT: ExerciseTemplate | null = null;
  for (const tmpl of templates) {
    const tw = tmpl.title.toLowerCase().split(/[\s()]+/).filter(Boolean);
    const overlap = words.filter((w) => tw.includes(w)).length;
    const score = overlap / Math.max(words.length, tw.length);
    if (score > best) {
      best = score;
      bestT = tmpl;
    }
  }
  return best >= 0.5 ? bestT!.id : null;
}

export async function POST(req: NextRequest) {
  try {
    const { title, exercises } = await req.json();

    const [templates, folders] = await Promise.all([
      hevy.getAllExerciseTemplates(),
      hevy.getRoutineFolders(),
    ]);

    const coachFolder = folders.find((f) => f.title.toLowerCase() === "coach");
    const folderId = coachFolder?.id ?? null;

    const mapped = exercises.map((ex: { name: string; sets: { reps: number; weight_kg?: number }[] }) => {
      const templateId = findTemplateId(ex.name, templates);
      return {
        templateId,
        name: ex.name,
        sets: ex.sets.map((s) => ({
          type: "normal",
          weight_kg: s.weight_kg ?? null,
          reps: s.reps ?? null,
          distance_meters: null,
          duration_seconds: null,
          custom_metric: null,
        })),
      };
    });

    const unmatched = mapped.filter((e: { templateId: string | null }) => !e.templateId).map((e: { name: string }) => e.name);
    const validExercises = mapped
      .filter((e: { templateId: string | null }) => e.templateId)
      .map((e: { templateId: string; sets: object[] }) => ({
        exercise_template_id: e.templateId,
        superset_id: null,
        notes: "",
        sets: e.sets,
      }));

    if (validExercises.length === 0) {
      return NextResponse.json(
        { error: "No exercises could be matched to Hevy templates", unmatched },
        { status: 400 }
      );
    }

    const result = await hevy.createRoutine({
      routine: { title, folder_id: folderId, notes: "", exercises: validExercises },
    });

    return NextResponse.json({ ok: true, routine: result, unmatched });
  } catch (e) {
    console.error("Create Hevy routine error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
