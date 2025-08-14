// src/app/api/pay/tranzila/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!process.env.TRANZILA_SUPPLIER) {
    return NextResponse.json(
      { ok: false, error: "TRANZILA_SUPPLIER missing" },
      { status: 400 }
    );
  }
  const body = await req.json().catch(() => ({}));
  const amount = Number(body?.breakdown?.total ?? body?.total ?? 0);
  if (!amount)
    return NextResponse.json(
      { ok: false, error: "amount missing" },
      { status: 400 }
    );

  const supplier = process.env.TRANZILA_SUPPLIER;
  const isSandbox = String(process.env.TRANZILA_SANDBOX ?? "true") === "true";
  const base = isSandbox
    ? "https://direct.tranzila.com"
    : "https://direct.tranzila.com";
  // דוגמה ל־iframe/redirect (נכוון ל־iframe.php או דף חדש לפי החשבון)
  const url = `${base}/${supplier}/iframe.php?sum=${encodeURIComponent(
    amount
  )}&currency=1&lang=he`;

  return NextResponse.json({ ok: true, url });
}
