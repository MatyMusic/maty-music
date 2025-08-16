// src/app/api/quote/route.ts
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { html } = await req.json();
    const browser = await puppeteer.launch({
      headless: true, // ← לא "new" (זה מפיל טיפוסים בבילד)
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html || "<h1>MATY MUSIC</h1>", { waitUntil: "load" });
    const pdf = await page.pdf({ format: "A4" });
    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="quote.pdf"',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
