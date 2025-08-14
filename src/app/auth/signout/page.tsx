"use client";
import { signOut } from "next-auth/react";

export default function SignOutPage() {
  return (
    <main className="container-section section-padding text-center">
      <h1 className="text-2xl font-bold mb-3">להתנתק?</h1>
      <button className="btn bg-brand text-white border-0" onClick={()=>signOut({ callbackUrl:"/" })}>
        התנתק
      </button>
    </main>
  );
}
