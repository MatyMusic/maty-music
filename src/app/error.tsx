"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // השגיאה המקורית תופיע בקונסול של הדפדפן
    console.error("App Error:", error);
  }, [error]);

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <div className="max-w-xl w-full space-y-4">
        <h1 className="text-2xl font-bold">משהו נשבר בשורש המסך 😬</h1>
        <p className="text-sm opacity-80 break-words">{error.message}</p>
        {error.stack && (
          <pre className="text-xs bg-black/5 p-3 rounded overflow-auto max-h-72">
            {error.stack}
          </pre>
        )}
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded bg-black text-white"
        >
          נסה לטעון מחדש
        </button>
      </div>
    </main>
  );
}
