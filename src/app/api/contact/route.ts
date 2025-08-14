// src/app/api/contact/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { fullName, phone, email, message } = await req.json();

    const to = process.env.CONTACT_TO || "matymusic770@gmail.com";
    const from = process.env.CONTACT_FROM || "no-reply@maty-music.local";

    const adminHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
        <h2>📬 הודעת צור קשר — MATY-MUSIC</h2>
        <p><b>שם:</b> ${esc(fullName || "")}</p>
        <p><b>טלפון:</b> ${esc(phone || "")}</p>
        <p><b>אימייל:</b> ${esc(email || "")}</p>
        <p><b>הודעה:</b><br/>${nl2br(esc(message || ""))}</p>
        <hr><small>נשלח מהאתר</small>
      </div>
    `;
    await sendMail({
      to,
      from,
      subject: "צור קשר — MATY-MUSIC",
      html: adminHtml,
    });

    if (email) {
      const clientHtml = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
          <h3>תודה ${esc(fullName || "")}</h3>
          <p>קיבלנו את הפנייה שלך ונחזור בהקדם 🙌</p>
          <small>MATY-MUSIC</small>
        </div>
      `;
      await sendMail({
        to: String(email),
        from,
        subject: "קיבלנו את ההודעה שלך — MATY-MUSIC",
        html: clientHtml,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("CONTACT error", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

function esc(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ((
        {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        } as any
      )[c])
  );
}
function nl2br(s: string) {
  return s.replace(/\n/g, "<br/>");
}
