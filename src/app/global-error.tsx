"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("Global Error:", error);

  return (
    <html>
      <body>
        <main className="min-h-dvh grid place-items-center p-6">
          <div className="max-w-xl w-full space-y-4">
            <h1 className="text-2xl font-bold">שגיאה גלובלית</h1>
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
              רענון
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
