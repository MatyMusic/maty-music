// // src/app/checkout/page.tsx
// import CheckoutHybridClient from "./CheckoutHybridClient";

// export default async function CheckoutPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ orderId?: string; amount?: string }>;
// }) {
//   const sp = await searchParams;
//   const orderId = sp?.orderId && sp.orderId.trim() !== "" ? sp.orderId : `MATY-${Date.now()}`;
//   const amountILS = Number(sp?.amount ?? 1) || 1;

//   return <CheckoutHybridClient orderId={orderId} amountILS={amountILS} />;
// }


import CheckoutRedirectClient from "@/components/checkout/CheckoutRedirectClient";

export default async function CheckoutPage({
  searchParams,
}: { searchParams: Promise<{ orderId?: string; amount?: string }> }) {
  const sp = await searchParams;
  const orderId = sp?.orderId ?? `MATY-${Date.now()}`;
  const amountILS = Number(sp?.amount ?? 1) || 1;
  return <CheckoutRedirectClient orderId={orderId} amountILS={amountILS} />;
}

