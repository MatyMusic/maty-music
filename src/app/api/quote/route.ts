// src/app/api/quote/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuoteBody = {
  html?: string; // אפשר להעביר HTML ליצירת PDF; אם לא, נייצר דף ברירת מחדל
};

export async function GET() {
  return new Response("Method Not Allowed", { status: 405 });
}

export async function POST(req: Request) {
  // אם תרצה להשבית זמנית בפרודקשן בלי לשבור בילד:
  if (process.env.NEXT_PUBLIC_DISABLE_QUOTE === "true") {
    return NextResponse.json(
      { ok: false, error: "Quote API disabled" },
      { status: 501 }
    );
  }

  // ייבוא דינמי כדי למנוע בעיות בבנייה/בשרתים שאין בהם Chromium בזמן בילד
  let puppeteer: typeof import("puppeteer");
  try {
    puppeteer = await import("puppeteer");
  } catch {
    return NextResponse.json(
      { ok: false, error: "Puppeteer not available on this environment" },
      { status: 501 }
    );
  }

  const { html } = (await req.json().catch(() => ({}))) as QuoteBody;

  const browser = await puppeteer.launch({
    headless: true, // ← זה התיקון: לא "new" אלא true (או "shell")
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(
      html ??
        `<html lang="he" dir="rtl"><head><meta charset="utf-8" />
          <style>
            body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; padding:24px}
            h1{margin:0 0 12px}
            .muted{opacity:.7}
          </style></head>
          <body>
            <h1>MATY MUSIC — הצעת מחיר</h1>
            <div class="muted">מסמך ברירת מחדל (לא הועבר HTML בבקשה)</div>
          </body></html>`,
      { waitUntil: "load" }
    );

    const pdf = await page.pdf({ format: "A4", printBackground: true });

    return new Response(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="quote.pdf"',
      },
    });
  } finally {
    await browser.close();
  }
}
