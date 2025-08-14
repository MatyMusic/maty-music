// src/lib/pay/cardcom.ts
export type CardcomInitBody = {
  amount: number; // סכום בשקלים (לא אגורות)
  currency?: string; // ILS ברירת מחדל
  description?: string; // תיאור עסקה
};

export function makeCardcomInitPayload(body: CardcomInitBody) {
  const amountAgorot = Math.round((body.amount ?? 0) * 100);
  return {
    amount: amountAgorot,
    currency: body.currency ?? "ILS",
    description: body.description ?? "MATY MUSIC",
  };
}
