// src/app/checkout/cancel/page.tsx
type SP = Record<string, string | string[] | undefined>;

export default async function CancelPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const token = (sp.token as string) ?? "";
  return (
    <div className="container-section">
      <div className="card text-right">
        <h1 className="text-2xl font-extrabold">התשלום בוטל ❌</h1>
        <p className="opacity-80">אסימון פעולה: <b dir="ltr">{token || "—"}</b></p>
      </div>
    </div>
  );
}
