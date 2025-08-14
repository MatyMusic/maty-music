"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onCreds(e: React.FormEvent) {
    e.preventDefault();
    await signIn("credentials", {
      email, password, callbackUrl: "/",
    });
  }

  return (
    <main className="container-section section-padding max-w-md">
      <h1 className="text-2xl font-bold mb-4">התחברות</h1>

      <button
        className="btn w-full mb-3"
        onClick={() => signIn("google", { callbackUrl: "/" })}
      >
        התחבר עם Google
      </button>

      <form onSubmit={onCreds} className="card grid gap-3">
        <input className="input-base input-ltr" placeholder="email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="input-base input-ltr" placeholder="password" type="password"
               value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="btn bg-brand text-white border-0">התחבר עם סיסמה</button>
      </form>
      <div className="mt-3 text-sm opacity-80">
        אין לך משתמש? <a className="underline" href="/auth/signup">להרשמה</a>
      </div>
    </main>
  );
}
