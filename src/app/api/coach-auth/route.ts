import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("coach_auth");
  if (cookie?.value === process.env.COACH_PIN) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const { pin } = await req.json();
  if (pin !== process.env.COACH_PIN) {
    return NextResponse.json({ error: "Wrong PIN" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("coach_auth", process.env.COACH_PIN!, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
