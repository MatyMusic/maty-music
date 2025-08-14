// src/app/api/book/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      category,
      dateISO,
      hours,
      guests,
      distanceKm,
      addons,
      fullName,
      phone,
      email,
      notes,
      breakdown,
    } = body || {};

    // מייל למנהל
    const adminHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
        <h2>📩 הזמנת הופעה חדשה — MATY-MUSIC</h2>
        <p><b>שם:</b> ${escapeHtml(fullName || "")}</p>
        <p><b>טלפון:</b> ${escapeHtml(phone || "")}</p>
        <p><b>אימייל:</b> ${escapeHtml(email || "")}</p>
        <hr/>
        <p><b>קטגוריה:</b> ${escapeHtml(category || "")}</p>
        <p><b>תאריך:</b> ${escapeHtml(dateISO || "")}</p>
        <p><b>משך:</b> ${escapeHtml(String(hours))} שעות</p>
        <p><b>קהל:</b> ${escapeHtml(String(guests))}</p>
        <p><b>מרחק נסיעה:</b> ${escapeHtml(String(distanceKm))} ק״מ</p>
        <p><b>תוספים:</b> ${escapeHtml(JSON.stringify(addons))}</p>
        <p><b>הערות:</b><br/>${nl2br(escapeHtml(notes || ""))}</p>
        <hr/>
        ${
          breakdown
            ? `<p><b>סה״כ משוער:</b> ₪${Number(breakdown.total).toLocaleString(
                "he-IL"
              )}</p>`
            : ""
        }
        <p style="opacity:.7">נשלח אוטומטית מהאתר.</p>
      </div>
    `;
    await sendMail({
      to: process.env.BOOK_TO || "matymusic770@gmail.com",
      subject: "הזמנה חדשה — MATY-MUSIC",
      html: adminHtml,
    });

    // מייל ללקוח (אם מילא אימייל)
    if (email) {
      const clientHtml = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
          <h2>תודה ${escapeHtml(fullName || "")}! קיבלנו את הבקשה</h2>
          <p>נחזור אליך בהקדם כדי לסגור פרטים.</p>
          ${
            breakdown
              ? `<p><b>מחיר משוער:</b> ₪${Number(
                  breakdown.total
                ).toLocaleString("he-IL")}</p>`
              : ""
          }
          <p style="opacity:.7">MATY-MUSIC</p>
        </div>
      `;
      await sendMail({
        to: String(email),
        subject: "התקבלה הזמנת הופעה — MATY-MUSIC",
        html: clientHtml,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("BOOKING error", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// עוזרים קטנים
function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (ch) =>
      ((
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        } as any
      )[ch])
  );
}
function nl2br(s: string) {
  return s.replace(/\n/g, "<br/>");
}
