// src/app/api/songs/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export const runtime = "nodejs";

export async function GET() {
  const db = await getDb();
  const songs = await db.collection("songs").find({}).limit(20).toArray();
  return NextResponse.json({ ok: true, songs });
}

export async function POST(req: Request) {
  const body = await req.json();
  const db = await getDb();
  const r = await db.collection("songs").insertOne({
    title: body.title,
    artist: body.artist,
    createdAt: new Date(),
  });
  return NextResponse.json({ ok: true, id: r.insertedId });
}
