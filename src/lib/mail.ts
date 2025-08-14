// src/lib/mail.ts
import nodemailer from "nodemailer";

export function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) throw new Error("SMTP env vars missing");

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendMail(opts: {
  to: string;
  from?: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const t = getTransport();
  return t.sendMail({
    to: opts.to,
    from: opts.from || "no-reply@maty-music.local",
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
