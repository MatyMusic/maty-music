// src/app/checkout/success/page.tsx
"use client";
import { useEffect, useState } from "react";

type CaptureResp = {
  captureId: string;
  raw: any;
};

export default function SuccessPage({
  searchParams,
}: {
  searchParams?: { token?: string; PayerID?: string };
}) {
  const token = searchParams?.token; // PayPal order id
  const [msg, setMsg] = useState("תופס תשלום...");
  const [details, setDetails] = useState<null | {
    orderId: string;
    amount: number;
    currency: string;
    payerEmail?: string;
    payerName?: string;
    invoiceNumber?: string;
  }>(null);

  useEffect(() => {
    if (!token) {
      setMsg("חסר token מה-URL");
      return;
    }
    (async () => {
      try {
        // 1) לכידת התשלום
        const capRes = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paypalOrderId: token }),
        });
        const cap: CaptureResp | { error: any } = await capRes.json();
        if (!capRes.ok || "error" in cap) throw new Error(JSON.stringify((cap as any).error));

        const raw = (cap as CaptureResp).raw;
        const pu = raw?.purchase_units?.[0];
        const capItem = pu?.payments?.captures?.[0];

        const amountVal = Number(capItem?.amount?.value ?? 0);
        const currency = String(capItem?.amount?.currency_code ?? "ILS");
        const referenceId = String(pu?.reference_id ?? token);

        const payerEmail =
          raw?.payer?.email_address ||
          pu?.payee?.email_address ||
          undefined;
        const payerName = raw?.payer?.name
          ? `${raw.payer.name.given_name ?? ""} ${raw.payer.name.surname ?? ""}`.trim()
          : undefined;

        // 2) הפקת חשבונית PDF
        const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now()}`;
        const customer = {
          name: payerName || "לקוח PayPal",
          email: payerEmail || "customer@example.com",
        };

        const pdfRes = await fetch("/api/invoices/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiceNumber,
            orderId: referenceId,
            captureId: (cap as CaptureResp).captureId,
            customer,
            items: [{ title: "תשלום הזמנה – MATY MUSIC", qty: 1, unitPrice: amountVal }],
            currency: currency === "ILS" ? "₪" : currency,
            issuedAt: new Date().toISOString(),
            business: {
              name: "MATY MUSIC",
              phone: "054-770-0019",
              email: "mtyg7702@gmail.com",
              website: "https://maty-music.example",
              address: "ישראל",
              vatId: "",
            },
            notes: "תודה על התשלום! להתראות בהופעה 🎵",
          }),
        });
        if (!pdfRes.ok) throw new Error("נכשלה הפקת חשבונית");

        // קריאה ל־DB
        await fetch("/api/orders/record", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: referenceId,
            amountILS: amountVal,
            description: "תשלום הזמנה – MATY MUSIC",
            customer,
            captureId: (cap as CaptureResp).captureId,
            paypalRaw: raw,
            invoiceNumber,
          }),
        });

        // שליחת החשבונית במייל
        const pdfBlob = await pdfRes.blob();
        const bytes = new Uint8Array(await pdfBlob.arrayBuffer());
        let bin = "";
        for (let b of bytes) bin += String.fromCharCode(b);
        const pdfBase64 = btoa(bin);

        await fetch("/api/invoices/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: customer.email,
            subject: `חשבונית ${invoiceNumber} – MATY MUSIC`,
            html: `<p>שלום ${customer.name},</p><p>מצורפת חשבונית על התשלום. תודה!</p>`,
            pdfBufferBase64: pdfBase64,
            filename: `${invoiceNumber}.pdf`,
          }),
        });

        // פתיחת ה-PDF ללקוח
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, "_blank");

        setDetails({
          orderId: referenceId,
          amount: amountVal,
          currency,
          payerEmail: customer.email,
          payerName: customer.name,
          invoiceNumber,
        });
        setMsg("שולם! מספר עסקה: " + (cap as CaptureResp).captureId);
      } catch (e: any) {
        console.error(e);
        setMsg("שגיאה: " + (e?.message || e));
      }
    })();
  }, [token]);

  return (
    <main className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-3">השלמת תשלום</h1>
      <p className="mb-4">{msg}</p>
      {details && (
        <div className="text-sm mt-3 space-y-1 opacity-90">
          <div>הזמנה: {details.orderId}</div>
          <div>סכום: {details.amount.toFixed(2)} {details.currency}</div>
          <div>לקוח: {details.payerName} ({details.payerEmail})</div>
          <div>חשבונית: {details.invoiceNumber}</div>
        </div>
      )}
      <a href="/book" className="btn mt-6">חזרה להזמנות</a>
    </main>
  );
}
