import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

type LineItem = { title: string; qty: number; unitPrice: number };

export async function POST(req: Request) {
  try {
    const {
      invoiceNumber, // למשל: INV-2025-0001
      orderId, // מזהה פנימי שלך
      captureId, // מזהה PayPal capture
      customer = { name: "", email: "" },
      items = [] as LineItem[],
      currency = "₪",
      issuedAt = new Date().toISOString(),
      business = {
        name: "MATY MUSIC",
        phone: "054-770-0019",
        email: "mtyg7702@gmail.com",
        website: "https://maty-music.example",
        address: "ישראל",
        vatId: "", // אם יש
      },
      notes = "תודה שבחרתם ב-MATY MUSIC",
    } = await req.json();

    const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
    const vatRate = 0; // אם תרצה מע״מ: 0.17
    const vat = +(subtotal * vatRate).toFixed(2);
    const total = +(subtotal + vat).toFixed(2);

    const html = `<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>חשבונית ${invoiceNumber}</title>
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,"Noto Sans Hebrew",sans-serif;
       margin:0; padding:32px; color:#0f172a; background:#fff;}
  .wrap{max-width:800px; margin:0 auto; border:1px solid #e5e7eb; border-radius:16px; padding:32px;}
  h1{margin:0 0 8px; font-size:24px}
  .muted{color:#64748b; font-size:12px}
  .row{display:flex; gap:24px; justify-content:space-between; align-items:flex-start}
  .card{background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px}
  table{width:100%; border-collapse:collapse; margin-top:16px}
  th,td{padding:10px; border-bottom:1px solid #e5e7eb; text-align:right}
  th{background:#f1f5f9; font-weight:600}
  .totals{margin-top:12px; display:grid; gap:6px; max-width:320px; margin-inline-start:auto}
  .totals div{display:flex; justify-content:space-between}
  .badge{display:inline-block; padding:4px 10px; border-radius:999px; background:#e2fbe8; color:#166534; font-weight:600; font-size:12px}
  .footer{margin-top:24px; font-size:12px; color:#475569}
  .logo{font-weight:800; letter-spacing:0.5px}
</style>
</head>
<body>
  <div class="wrap">
    <div class="row">
      <div>
        <div class="logo">MATY MUSIC</div>
        <div class="muted">${business.address} · ${business.phone}</div>
        <div class="muted">${business.email} · ${business.website}</div>
        ${
          business.vatId
            ? `<div class="muted">עוסק/ח.פ: ${business.vatId}</div>`
            : ""
        }
      </div>
      <div class="card">
        <div><strong>מס׳ חשבונית:</strong> ${invoiceNumber}</div>
        <div><strong>תאריך:</strong> ${new Date(issuedAt).toLocaleDateString(
          "he-IL"
        )}</div>
        <div><strong>מצב:</strong> <span class="badge">שולם</span></div>
      </div>
    </div>

    <div class="row" style="margin-top:16px">
      <div class="card" style="flex:1">
        <div><strong>לכבוד:</strong> ${customer.name || ""}</div>
        <div class="muted">${customer.email || ""}</div>
      </div>
      <div class="card" style="flex:1">
        <div><strong>הזמנה:</strong> ${orderId}</div>
        <div class="muted">PayPal Capture: ${captureId}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr><th>פריט</th><th>כמות</th><th>מחיר יחידה</th><th>סך הכל</th></tr>
      </thead>
      <tbody>
        ${items
          .map(
            (it) => `
          <tr>
            <td>${it.title}</td>
            <td>${it.qty}</td>
            <td>${currency} ${it.unitPrice.toFixed(2)}</td>
            <td>${currency} ${(it.qty * it.unitPrice).toFixed(2)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals">
      <div><span>סיכום ביניים</span><strong>${currency} ${subtotal.toFixed(
      2
    )}</strong></div>
      <div><span>מע״מ ${vatRate * 100}%</span><strong>${currency} ${vat.toFixed(
      2
    )}</strong></div>
      <div><span>לתשלום</span><strong>${currency} ${total.toFixed(
      2
    )}</strong></div>
    </div>

    <div class="footer">
      ${notes}
      <br/>מסמך זה הופק אוטומטית. שמרו אותו לרישומיכם.
    </div>
  </div>
</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "18mm", bottom: "18mm", left: "16mm", right: "16mm" },
    });
    await browser.close();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${invoiceNumber}.pdf"`,
      },
    });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: "invoice_failed", details: String(e?.message || e) },
      { status: 500 }
    );
  }
}
