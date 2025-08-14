// src/app/api/orders/record/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const db = await getDb(); // זה מחכה לחיבור ונותן לך את ה־DB
  const body = await req.json();
  const { orderId, userId, amount, items, status } = body ?? {};

  if (!orderId || !userId || !amount) {
    return NextResponse.json(
      { ok: false, error: "Missing fields" },
      { status: 400 }
    );
  }

  const orders = db.collection("orders");

  // אם כבר קיים אותו orderId נעדכן במקום ליצור כפילויות
  await orders.updateOne(
    { orderId },
    {
      $set: {
        userId,
        amount,
        items: Array.isArray(items) ? items : [],
        status: status ?? "pending",
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  return NextResponse.json({ ok: true });
}
