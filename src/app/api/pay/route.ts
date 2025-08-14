// src/app/api/pay/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: אפשר להחזיר רשימת ספקים זמינה / בדיקת בריאות
export async function GET() {
  return Response.json({
    ok: true,
    providers: ["paypal", "cardcom", "tranzila"],
    note: "Use /api/pay/{provider} to initiate a payment.",
  });
}

// POST: מכוון את המשתמש לנתיב הספק הספציפי
export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => ({} as any));
  const provider = (data?.provider ?? "").toString().toLowerCase();

  if (!provider) {
    return Response.json(
      {
        ok: false,
        error: "Missing 'provider'. Use /api/pay/{provider} instead.",
      },
      { status: 400 }
    );
  }

  return Response.json(
    {
      ok: false,
      error: `Direct POST to /api/pay is not supported. Use /api/pay/${provider}.`,
    },
    { status: 400 }
  );
}
