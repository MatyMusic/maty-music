import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "Missing fields" },
      { status: 400 }
    );
  }
  const em = String(email).toLowerCase().trim();

  const client = await clientPromise;
  const db = client.db();

  const exists = await db.collection("users").findOne({ email: em });
  if (exists)
    return NextResponse.json(
      { ok: false, error: "Email already exists" },
      { status: 409 }
    );

  const hash = await bcrypt.hash(password, 12);
  const { insertedId } = await db.collection("users").insertOne({
    name: name || "",
    email: em,
    password: hash,
    emailVerified: null,
  });

  return NextResponse.json({ ok: true, id: insertedId.toString() });
}
