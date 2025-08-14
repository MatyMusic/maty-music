// src/app/api/pay/cardcom/route.ts
import { NextRequest } from "next/server";
import {
  makeCardcomInitPayload,
  type CardcomInitBody,
} from "@/lib/pay/cardcom";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function POST(req: NextRequest) {
  const SANDBOX = process.env.CARDCOM_SANDBOX === "true";
  const TERMINAL = process.env.CARDCOM_TERMINAL_NUMBER;
  const USER = process.env.CARDCOM_USER;
  const KEY = process.env.CARDCOM_API_KEY;

  // בפריוויו/בלי מפתחות לא עושים חיוב אמיתי
  if (!TERMINAL || !USER || !KEY || SANDBOX) {
    return Response.json(
      {
        ok: false,
        error: "Cardcom disabled in preview (missing config or SANDBOX=true).",
      },
      { status: 501 }
    );
  }

  const body = (await req.json()) as CardcomInitBody;
  const payload = makeCardcomInitPayload(body);

  // TODO: קריאה אמיתית ל־Cardcom (fetch ל־API שלהם עם payload)
  return Response.json(
    { ok: false, error: "Cardcom integration not implemented yet.", payload },
    { status: 501 }
  );
}
