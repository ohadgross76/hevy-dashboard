import { NextRequest, NextResponse } from "next/server";
import { loadSuggestedRoutines, saveSuggestedRoutine, deleteSuggestedRoutine } from "@/lib/suggestedRoutines";

export async function GET() {
  return NextResponse.json(loadSuggestedRoutines());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const saved = saveSuggestedRoutine(body);
  return NextResponse.json(saved, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  deleteSuggestedRoutine(id);
  return NextResponse.json({ ok: true });
}
