// src/app/api/pay/cardcom/route.ts
import { NextRequest } from "next/server";

// מוודא שזה "מודול" מבחינת TS וגם אומר ל-Next שזה רץ בדינמי/Node
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// טיפוס גוף מינימלי לבקשה (תוכל להרחיב בהמשך)
export type CardcomInitBody = {
  amount: number; // בסכום שקלים (לא אגורות)
  currency?: string; // ILS ברירת מחדל
  description?: string; // תיאור עסקה
};

// פונקציה שיכולה לשמש גם בצד לקוח אם מייבאים — כרגע מחזירה payload בסיסי
export function makeCardcomInitPayload(body: CardcomInitBody) {
  const amountAgorot = Math.round((body.amount ?? 0) * 100);
  return {
    amount: amountAgorot,
    currency: body.currency ?? "ILS",
    description: body.description ?? "MATY MUSIC",
  };
}

// אפשר לחסום GET (לא חובה)
export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}

// ה-API עצמו — בפריוויו/ללא מפתחות נחזיר 501 כדי לא ליפול
export async function POST(req: NextRequest) {
  const SANDBOX = process.env.CARDCOM_SANDBOX === "true";
  const TERMINAL = process.env.CARDCOM_TERMINAL_NUMBER;
  const USER = process.env.CARDCOM_USER;
  const KEY = process.env.CARDCOM_API_KEY;

  // אם אין קונפיג מלא, או שאנחנו בפריוויו — לא נבצע חיוב אמיתי
  if (!TERMINAL || !USER || !KEY || SANDBOX) {
    return Response.json(
      {
        ok: false,
        error: "Cardcom disabled in preview (missing config or SANDBOX=true).",
      },
      { status: 501 }
    );
  }

  // קריאה אמיתית (תמומש בהמשך):
  const body = (await req.json()) as CardcomInitBody;
  const payload = makeCardcomInitPayload(body);

  // TODO: שליחה ל-Cardcom לפי ה-API שלהם (fetch ל-endpoint עם payload)
  // כרגע מחזירים 501 כדי לא לבצע חיוב אמיתי בפרוד/פריוויו
  return Response.json(
    { ok: false, error: "Cardcom integration not implemented yet.", payload },
    { status: 501 }
  );
}
