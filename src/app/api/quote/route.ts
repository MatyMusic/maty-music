// src/app/api/quote/route.ts
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ברירת מחדל: כבוי בפרוד/פריוויו כדי שהפריסה לא תיפול.
 * אם תרצה להפעיל ב-Vercel, הוסף משתנה סביבה ENABLE_QUOTE_API=1.
 */
const DISABLED =
  process.env.DISABLE_QUOTE_API === "1" ||
  (process.env.VERCEL && process.env.ENABLE_QUOTE_API !== "1");

export async function POST(req: NextRequest) {
  if (DISABLED) {
    return Response.json(
      {
        ok: false,
        error:
          "Quote API disabled on this environment. Set ENABLE_QUOTE_API=1 to enable.",
      },
      { status: 503 }
    );
  }

  // כדי לא להכביד על הבאנדל של הבילד, טוענים דינמית
  const puppeteer = await import("puppeteer");

  // חשוב: בלי "new". משתמשים ב-true + דגלים שמתאימים לשרתים סנדבוקס
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
    ],
  });

  try {
    const page = await browser.newPage();

    // דוגמה מינימלית: רנדר ל-PDF. תתאימו לצרכים שלכם.
    const { html = "<h1>Quote</h1><p>Hello from MATY MUSIC</p>" } =
      (await req.json().catch(() => ({}))) as { html?: string };

    await page.setContent(String(html), { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });

    return new Response(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="quote.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } finally {
    await browser.close().catch(() => {});
  }
}

export async function GET() {
  return Response.json({ ok: true, disabled: !!DISABLED });
}
