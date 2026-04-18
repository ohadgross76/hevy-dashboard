import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { hevy } from "@/lib/hevy";
import { buildSystemPrompt } from "@/lib/systemPrompt";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (req.cookies.get("coach_auth")?.value !== process.env.COACH_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log("ANTHROPIC_API_KEY present:", !!apiKey, apiKey?.substring(0, 12));
    const client = new Anthropic({ apiKey });
    const { messages } = await req.json();

    const [workoutsData, routines, exerciseTemplates] = await Promise.all([
      hevy.getWorkouts(1, 5),
      hevy.getAllRoutines(),
      hevy.getAllExerciseTemplates(),
    ]);

    const recentWorkouts = workoutsData.workouts.map((w) => {
      const date = new Date(w.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const exercises = w.exercises.map((ex) => {
        const sets = ex.sets.map((s) => `${s.weight_kg ?? "BW"}kg×${s.reps ?? "?"}`).join(", ");
        return `  - ${ex.title}: ${sets}`;
      }).join("\n");
      return `${date} — ${w.title}\n${exercises}`;
    }).join("\n\n");

    const routineSummary = routines.map((r) =>
      `${r.title}: ${r.exercises.map((e) => e.title).join(", ")}`
    ).join("\n");

    const hevyContext = `### Recent Workouts (last 5)\n${recentWorkouts}\n\n### Current Routines\n${routineSummary}`;

    // Group exercise templates by primary muscle group, exclude custom ones
    const byMuscle = new Map<string, string[]>();
    for (const t of exerciseTemplates) {
      if (t.is_custom) continue;
      const group = t.primary_muscle_group || "Other";
      if (!byMuscle.has(group)) byMuscle.set(group, []);
      byMuscle.get(group)!.push(t.title);
    }
    const exerciseLibrary = Array.from(byMuscle.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, names]) => `**${group}**: ${names.join(", ")}`)
      .join("\n");

    const { TransformStream } = globalThis;
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Run streaming in background
    (async () => {
      try {
        const stream = client.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: buildSystemPrompt(hevyContext, exerciseLibrary),
          messages,
        });
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            await writer.write(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        console.error("Streaming error:", err);
        await writer.write(encoder.encode(`\n[Error: ${String(err)}]`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (e) {
    console.error("Chat API error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
