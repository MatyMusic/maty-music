import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongo";
import Order from "@/models/Order";

export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const {
    orderId,
    amountILS,
    description,
    customer,
    captureId,
    paypalRaw,
    invoiceNumber,
  } = body;

  const doc = await Order.findOneAndUpdate(
    { orderId },
    {
      orderId,
      amountILS,
      description,
      status: "paid",
      paypal: { captureId, raw: paypalRaw },
      customer,
      invoiceNumber,
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ ok: true, id: doc._id });
}
