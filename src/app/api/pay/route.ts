// // src/app/api/pay/route.ts
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   const body = await req.json().catch(() => ({}));
//   const provider =
//     (body?.provider as string) || process.env.PAY_DEFAULT || "payplus";
//   const url = new URL(req.url);
//   const origin = url.origin;

//   // נעביר הלאה לראוט הספציפי
//   return NextResponse.redirect(`${origin}/api/pay/${provider}`, 307);
// }
