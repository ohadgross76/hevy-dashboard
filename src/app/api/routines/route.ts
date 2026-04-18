import { NextRequest, NextResponse } from "next/server";
import { hevy } from "@/lib/hevy";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Math.min(Number(searchParams.get("pageSize") ?? 10), 10);
    const data = await hevy.getRoutines(page, pageSize);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
