// src/app/checkout/success/page.tsx
export const metadata = { title: "תודה! התשלום התקבל" };

type Search = { token?: string; PayerID?: string };

export default async function SuccessPage({
  searchParams,
}: {
  searchParams?: Search | Promise<Search>;
}) {
  const sp: Search =
    searchParams && typeof (searchParams as any)?.then === "function"
      ? await (searchParams as Promise<Search>)
      : ((searchParams ?? {}) as Search);

  return (
    <section className="section-padding">
      <div className="container-section">
        <div className="card text-right">
          <h1 className="text-3xl font-extrabold mb-2">תודה! התשלום התקבל</h1>
          <p className="opacity-80">קיבלנו את ההזמנה שלך. נשלח מייל אישור עם פירוט.</p>
          {sp.token && <p className="mt-2 text-xs opacity-60">אסימון עסקה: {sp.token}</p>}
          {sp.PayerID && <p className="text-xs opacity-60">PayerID: {sp.PayerID}</p>}
        </div>
      </div>
    </section>
  );
}
