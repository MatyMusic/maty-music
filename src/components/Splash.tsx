// src/components/Splash.tsx
"use client";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const DISABLE_SPLASH = process.env.NEXT_PUBLIC_DISABLE_SPLASH === "1";

export default function Splash() {
  // ← תמיד לקרוא ל־hooks למעלה, לא בתנאי
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const force = search.get("auth") === "1";

  useEffect(() => {
    if (status === "authenticated" && force) {
      router.replace(pathname || "/", { scroll: false });
    }
  }, [status, force, pathname, router]);

  // תנאי ה־return רק אחרי ה־hooks
  if (DISABLE_SPLASH || status !== "unauthenticated" || !force) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur">
      <div className="w-[min(92vw,560px)] rounded-2xl p-6 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-center space-y-4">
        <img src="/assets/logo/maty-music-wordmark.svg" alt="MATY MUSIC" className="mx-auto h-12" />
        <h1 className="text-2xl font-extrabold">התחבר או הירשם</h1>
        <button onClick={() => signIn("google", { callbackUrl: "/" })} className="btn w-full">
          המשך עם Google
        </button>
        <div className="flex gap-2 mt-3">
          <Link href="/auth/signin" className="btn w-1/2 border">כניסה</Link>
          <Link href="/auth/register" className="btn w-1/2">הרשמה</Link>
        </div>
      </div>
    </div>
  );
}
