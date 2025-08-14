// "use client";
// import { useState } from "react";

// export default function CheckoutRedirectClient({
//   orderId,
//   amountILS,
// }: {
//   orderId: string;
//   amountILS: number;
// }) {
//   const [loading, setLoading] = useState(false);

//   async function pay() {
//     try {
//       setLoading(true);
//       const res = await fetch("/api/paypal/create-order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           orderId,
//           amount: amountILS,
//           description: "תשלום הזמנה – MATY MUSIC",
//         }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data?.error?.message || "create-order failed");

//       if (!data.approveUrl) throw new Error("approveUrl missing");
//       window.location.href = data.approveUrl; // מעבר ל-PayPal לאישור תשלום
//     } catch (e: any) {
//       console.error(e);
//       alert("שגיאה בפתיחת PayPal: " + (e?.message || e));
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="max-w-md mx-auto p-6 text-center">
//       <h1 className="text-2xl font-bold mb-3">תשלום</h1>
//       <p className="mb-6">סכום לתשלום: {amountILS.toFixed(2)} ₪</p>
//       <button
//         onClick={pay}
//         className="btn bg-brand text-white border-0 hover:opacity-90"
//         disabled={loading}
//       >
//         {loading ? "פותח..." : "שלם עם PayPal"}
//       </button>
//     </main>
//   );
// }



"use client";
import { useState } from "react";

export default function CheckoutRedirectClient({
  orderId, amountILS,
}: { orderId: string; amountILS: number; }) {
  const [loading, setLoading] = useState(false);

  async function pay() {
    try {
      setLoading(true);
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, amount: amountILS, description: "תשלום הזמנה – MATY MUSIC" }),
      });
      const data = await res.json();
      if (!res.ok || !data?.approveUrl) throw new Error(data?.error?.message || "create-order failed");
      window.location.href = data.approveUrl; // מעבר ל-PayPal
    } catch (e:any) {
      alert("שגיאה בפתיחת PayPal: " + (e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-3">תשלום</h1>
      <p className="mb-6">סכום לתשלום: {amountILS.toFixed(2)} ₪</p>
      <button onClick={pay} className="btn bg-brand text-white border-0 hover:opacity-90" disabled={loading}>
        {loading ? "פותח..." : "שלם עם PayPal"}
      </button>
    </main>
  );
}
