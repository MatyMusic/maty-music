// src/app/api/quote/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: Request) {
  try {
    const data = await req.json(); // אותו אובייקט שאתה שולח מ-BookingForm: { category, dateISO, hours, ... , breakdown }

    const html = makeHtml(data);

    const browser = await puppeteer.launch({
      headless: "new",
      // ב-Windows מקומי מספיק כך. בשרת צריך התאמות אחרות.
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "24mm", bottom: "20mm", left: "15mm", right: "15mm" },
    });
    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="maty-quote.pdf"',
      },
    });
  } catch (e) {
    console.error("QUOTE error", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

function makeHtml(d: any) {
  const total = d?.breakdown?.total ?? "";
  const rows = d?.breakdown
    ? [
        ["בסיס", d.breakdown.base],
        ["שעות נוספות", d.breakdown.extraHours],
        ["גודל קהל", d.breakdown.audience],
        ["נסיעות", d.breakdown.travel],
        ["תוספים", d.breakdown.addons],
        ["סופ״ש", d.breakdown.weekend],
        ["דחוף/מוקדם", d.breakdown.rush + d.breakdown.early],
        ["סיכום ביניים", d.breakdown.subtotal],
      ]
    : [];

  const fmt = (n: any) =>
    typeof n === "number" ? `₪${n.toLocaleString("he-IL")}` : "";

  return `
<!doctype html>
<html lang="he" dir="rtl">
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>הצעת מחיר — MATY-MUSIC</title>
<style>
  * { box-sizing:border-box; }
  body { font-family: system-ui,-apple-system,Segoe UI,Rubik,Arial,Helvetica,sans-serif; background:#fff; color:#111; margin:0; }
  .wrap { padding:24px; }
  .head { display:flex; justify-content:space-between; align-items:center; gap:16px; margin-bottom:14px; }
  .brand { font-size:28px; font-weight:900; letter-spacing:.5px; background: linear-gradient(90deg,#F0ABFC,#8B5CF6,#38BDF8); -webkit-background-clip:text; background-clip:text; color:transparent; }
  .muted { opacity:.7; font-size:12px; }
  h1 { margin:10px 0 6px; font-size:22px; }
  .grid { display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-top:10px; }
  .card { border:1px solid #E5E7EB; border-radius:16px; padding:14px; }
  table { width:100%; border-collapse:collapse; margin-top:8px; }
  th, td { text-align:right; padding:8px; border-bottom:1px solid #EEE; }
  th { background:#F8FAFC; font-weight:700; }
  .total { font-size:18px; font-weight:900; text-align:left; }
  .tag { display:inline-block; border:1px solid #E5E7EB; border-radius:999px; padding:4px 10px; font-size:12px; margin-left:6px; }
  .footer { margin-top:18px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#555; }
</style>
<body>
  <div class="wrap">
    <div class="head">
      <div class="brand">MATY-MUSIC</div>
      <div class="muted">תאריך הפקה: ${new Date().toLocaleDateString(
        "he-IL"
      )}</div>
    </div>

    <h1>הצעת מחיר להופעה${d?.category ? ` — ${d.category}` : ""}</h1>

    <div class="grid">
      <div class="card">
        <div><b>פרטי אירוע</b></div>
        <div class="muted">תאריך: ${d?.dateISO || "—"}</div>
        <div class="muted">משך: ${d?.hours || "—"} ש׳</div>
        <div class="muted">קהל: ${d?.guests || "—"}</div>
        <div class="muted">מרחק נסיעה: ${d?.distanceKm || 0} ק״מ</div>
        <div class="muted">תוספים: ${
          [
            d?.addons?.chuppah ? "חופה" : null,
            d?.addons?.extraDjSet ? "סט DJ נוסף" : null,
            (d?.addons?.extraMusicians || 0) > 0
              ? `+${d?.addons?.extraMusicians} נגנים`
              : null,
          ]
            .filter(Boolean)
            .join(", ") || "—"
        }</div>
      </div>

      <div class="card">
        <div><b>סיכום תמחור</b></div>
        <table>
          <thead><tr><th>שורה</th><th>סכום</th></tr></thead>
          <tbody>
            ${rows
              .map(([k, v]: any) => `<tr><td>${k}</td><td>${fmt(v)}</td></tr>`)
              .join("")}
            ${
              d?.breakdown
                ? `<tr><td class="total">סה״כ משוער</td><td class="total">${fmt(
                    total
                  )}</td></tr>`
                : ""
            }
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <div>הצעה משוערת — המחיר הסופי נקבע לאחר תיאום לוגיסטי.</div>
      <div>
        <span class="tag">חסידי</span>
        <span class="tag">מזרחי</span>
        <span class="tag">שקט</span>
        <span class="tag">מקפיץ</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}
