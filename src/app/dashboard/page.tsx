// src/app/dashboard/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

type UserSession = {
  name?: string | null;
  email?: string | null;
  id?: string | null;
  role?: string | null;
  image?: string | null;
};

export default async function DashboardPage() {
  const session = await auth();
  const u = (session?.user as UserSession) || null;

  // לא מחובר → שלח למסך התחברות עם חזרה לדשבורד
  if (!u) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  // לא אדמין → שלח הביתה (או תחליף ל־/403 אם בנית עמוד 403)
  if ((u.role ?? "user") !== "admin") {
    redirect("/");
  }

  return (
    <main className="container-section section-padding">
      <div className="flex items-center gap-3 mb-4">
        {u.image ? (
          <img
            src={u.image}
            alt={u.name ?? "user"}
            className="h-12 w-12 rounded-full object-cover border"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-gray-300" />
        )}
        <div>
          <h1 className="text-2xl font-extrabold">שלום {u.name || u.email} 👋</h1>
          <p className="text-sm opacity-70">תפקיד: מנהל • גישה מלאה</p>
        </div>
      </div>

      <div className="grid gap-3 max-w-2xl">
        <div className="card p-4">
          <div><b>שם:</b> {u.name || "—"}</div>
          <div><b>אימייל:</b> {u.email || "—"}</div>
          <div><b>מזהה:</b> {u.id || "—"}</div>
          <div><b>Role:</b> {u.role || "—"}</div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Link href="/admin/users" className="btn">משתמשים</Link>
          <Link href="/admin/songs" className="btn">שירים</Link>
          <Link href="/admin/events" className="btn">אירועים</Link>
          <Link href="/admin/stats" className="btn">סטטיסטיקות</Link>
          <Link href="/admin/settings" className="btn">הגדרות</Link>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/api/auth/signout?callbackUrl=/" className="btn">התנתק</Link>
      </div>
    </main>
  );
}
