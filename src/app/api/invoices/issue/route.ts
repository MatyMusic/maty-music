// src/app/api/invoices/issue/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Item = {
  description: string;
  qty: number;
  unitPrice: number;
};

type InvoiceBody = {
  items: Item[];
  currency?: string; // ILS/...
  customer?: { name?: string; email?: string };
};

export async function POST(req: Request) {
  try {
    const {
      items = [],
      currency = "ILS",
      customer = {},
    } = (await req.json()) as InvoiceBody;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { ok: false, error: "items required" },
        { status: 400 }
      );
    }

    // ואלידציה בסיסית
    for (const it of items) {
      if (
        typeof it?.description !== "string" ||
        typeof it?.qty !== "number" ||
        typeof it?.unitPrice !== "number"
      ) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Each item must have description:string, qty:number, unitPrice:number",
          },
          { status: 400 }
        );
      }
    }

    // החשבון – שם טיפוס ל־reduce כדי לא לקבל any
    const subtotal = items.reduce<number>(
      (s, it) => s + it.qty * it.unitPrice,
      0
    );
    const vatRate = 0; // אם תרצה מע״מ: 0.17
    const vat = Number((subtotal * vatRate).toFixed(2));
    const total = Number((subtotal + vat).toFixed(2));

    return NextResponse.json({
      ok: true,
      currency,
      customer,
      totals: { subtotal, vatRate, vat, total },
    });
  } catch (err) {
    console.error("invoice issue error:", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
