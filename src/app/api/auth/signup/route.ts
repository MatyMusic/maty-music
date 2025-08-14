// src/app/api/auth/signup/route.ts
import { NextResponse } from "next/server";
import mongoPromise from "@/lib/mongo"; // ג† ׳׳ ׳׳¦׳׳ ׳–׳” "@/lib/mongo" ג€“ ׳©׳ ׳” ׳‘׳”׳×׳׳
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { ok: false, error: "Missing fields" },
        { status: 400 }
      );
    }

    const client = await mongoPromise;
    const db = client.db();
    const users = db.collection("users");

    // ׳׳•׳•׳“׳׳™׳ ׳©׳׳™׳ ׳׳©׳×׳׳© ׳¢׳ ׳׳•׳×׳• ׳׳™׳׳™׳™׳
    const exists = await users.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Email already registered" },
        { status: 409 }
      );
    }

    // ׳”׳¦׳₪׳ ׳” ׳•׳©׳׳™׳¨׳”
    const hashed = await bcrypt.hash(password, 10);
    await users.insertOne({
      name,
      email,
      password: hashed,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("signup error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
