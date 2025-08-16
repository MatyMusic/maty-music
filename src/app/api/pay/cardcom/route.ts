// src/app/api/pay/cardcom/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type CardcomInitBody = {
  amount: number;
  currency?: string;
  description?: string;
};

export function makeCardcomInitPayload(body: CardcomInitBody) {
  const amountAgorot = Math.round((body.amount ?? 0) * 100);
  return {
    amount: amountAgorot,
    currency: body.currency ?? "ILS",
    description: body.description ?? "MATY MUSIC",
  };
}

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function POST(req: NextRequest) {
  const SANDBOX = String(process.env.CARDCOM_SANDBOX ?? "true") === "true";
  const TERMINAL = process.env.CARDCOM_TERMINAL_NUMBER;
  const USER = process.env.CARDCOM_USER;
  const KEY = process.env.CARDCOM_API_KEY;

  // בפריוויו/ללא מפתחות—לא מבצעים חיוב אמיתי
  if (!TERMINAL || !USER || !KEY || SANDBOX) {
    const body = (await req
      .json()
      .catch(() => ({}))) as Partial<CardcomInitBody>;
    return Response.json(
      {
        ok: false,
        error: "Cardcom disabled in preview (missing config or SANDBOX=true).",
        payload: makeCardcomInitPayload({ amount: Number(body?.amount ?? 0) }),
      },
      { status: 501 }
    );
  }

  // TODO: חיבור אמיתי ל-Cardcom
  return Response.json(
    { ok: false, error: "Not implemented." },
    { status: 501 }
  );
}
