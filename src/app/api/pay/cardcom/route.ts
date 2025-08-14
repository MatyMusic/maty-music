// // src/app/api/pay/cardcom/route.ts
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   if (!process.env.CARDCOM_TERMINAL_NUMBER) {
//     return NextResponse.json(
//       { ok: false, error: "CARDCOM_TERMINAL_NUMBER missing" },
//       { status: 400 }
//     );
//   }
//   const body = await req.json().catch(() => ({}));
//   const amount = Number(body?.breakdown?.total ?? body?.total ?? 0);
//   if (!amount)
//     return NextResponse.json(
//       { ok: false, error: "amount missing" },
//       { status: 400 }
//     );

//   const isSandbox = String(process.env.CARDCOM_SANDBOX ?? "true") === "true";
//   const base = isSandbox
//     ? "https://secure.cardcom.solutions/External/Charges/Charge.aspx"
//     : "https://secure.cardcom.solutions/External/Charges/Charge.aspx";

//   const params = new URLSearchParams({
//     TerminalNumber: String(process.env.CARDCOM_TERMINAL_NUMBER),
//     // User: process.env.CARDCOM_USER ?? '',
//     // APIKey: process.env.CARDCOM_API_KEY ?? '',
//     Amount: String(amount),
//     Currency: "ILS",
//     Language: "he",
//     // SuccessRedirectUrl: `${origin}/checkout/success`,
//     // ErrorRedirectUrl: `${origin}/checkout/cancel`,
//   });
//   const url = `${base}?${params.toString()}`;
//   return NextResponse.json({ ok: true, url });
// }
