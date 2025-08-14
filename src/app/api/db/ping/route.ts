// src/app/api/db/ping/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export const runtime = "nodejs"; // לא Edge

export async function GET() {
  try {
    const db = await getDb();
    const r = await db.command({ ping: 1 });
    return NextResponse.json({ ok: true, ping: r.ok === 1 });
  } catch (err: any) {
    console.error("DB Ping Error:", err);
    return NextResponse.json(
      { ok: false, error: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}
