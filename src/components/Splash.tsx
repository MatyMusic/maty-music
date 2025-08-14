// src/components/Splash.tsx
"use client";

import { DISABLE_SPLASH } from "@/env";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Splash() {
  // אם הספלאש מבוטל מה־env – לא מציגים כלום
  if (DISABLE_SPLASH) return null;

  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const forceAuth = searchParams.get("auth") === "1";

  // אם המשתמש מחובר + פרמטר force – מעבירים אותו חזרה לדף הנוכחי בלי הספלאש
  useEffect(() => {
    if (status === "authenticated" && forceAuth) {
      router.replace(pathname || "/", { scroll: false });
    }
  }, [status, forceAuth, pathname, router]);

  // מציגים ספלאש רק אם המשתמש לא מחובר ויש פרמטר auth=1
  if (status !== "unauthenticated" || !forceAuth) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur">
      <div className="w-[min(92vw,560px)] rounded-2xl p-6 bg-white dark:bg-neutral-950 border border-black/10 dark:border-white/10 text-center space-y-4">
        <img
          src="/assets/logo/maty-music-wordmark.svg"
          alt="MATY MUSIC"
          className="mx-auto h-12"
        />
        <h1 className="text-2xl font-extrabold">התחבר או הירשם</h1>
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="btn w-full"
        >
          המשך עם Google
        </button>
        <div className="flex gap-2 mt-3">
          <Link href="/auth/signin" className="btn w-1/2 border">
            כניסה
          </Link>
          <Link href="/auth/register" className="btn w-1/2">
            הרשמה
          </Link>
        </div>
      </div>
    </div>
  );
}
