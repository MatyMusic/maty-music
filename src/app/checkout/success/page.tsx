// src/app/checkout/success/page.tsx
import Link from "next/link";

type SP = Record<string, string | string[] | undefined>;

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const token = (sp.token as string) ?? "";
  const payerId = (sp.PayerID as string) ?? "";

  return (
    <section className="section-padding">
      <div className="container-section">
        <div className="card text-right">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">התשלום התקבל ✅</h1>
          <p className="opacity-80">
            תודה! אנו מעבדים את ההזמנה שלך. מספר אסימון:{" "}
            <b dir="ltr">{token || "—"}</b>, מזהה משלם: <b dir="ltr">{payerId || "—"}</b>
          </p>

          <div className="mt-6 flex gap-2 justify-end">
            <Link href="/dashboard" className="btn">ללוח הבקרה</Link>
            <Link href="/" className="btn border">חזרה לדף הבית</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
