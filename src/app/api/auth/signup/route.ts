// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json(
      { ok: false, error: "Missing fields" },
      { status: 400 }
    );
  }

  const em = String(email).toLowerCase().trim();
  const db = await getDb();
  const users = db.collection("users");

  const exists = await users.findOne({ email: em });
  if (exists) {
    return NextResponse.json(
      { ok: false, error: "Email already registered" },
      { status: 409 }
    );
  }

  const hash = await bcrypt.hash(password, 10);
  await users.insertOne({
    name: String(name).trim(),
    email: em,
    password: hash,
    createdAt: new Date(),
    emailVerified: null,
  });

  return NextResponse.json({ ok: true });
}
