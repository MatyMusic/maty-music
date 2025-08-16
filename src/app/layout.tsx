import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Topbar from "@/components/layout/Topbar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactDock from "@/components/ContactDock";
import Splash from "@/components/Splash";
import FloatingPlayer from "@/components/FloatingPlayer";

export const metadata: Metadata = {
  title: "MATY MUSIC",
  description: "אתר מוזיקה אינטראקטיבי 3D — MATY MUSIC",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon-192.png" },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body
        className="min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-violet-500/20 selection:text-violet-900 dark:selection:bg-violet-400/20 dark:selection:text-white"
        style={{ colorScheme: "light dark" }}
      >
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-[100] focus:rounded-lg focus:bg-white/90 dark:focus:bg-neutral-900/90 focus:px-3 focus:py-2 focus:shadow">
          דלג לתוכן
        </a>

        <Providers>
          <Splash />
          <Topbar />
          <Header />

          {/* ריווח תחתון בטוח כדי ששום רכיב קבוע לא יסתיר תוכן */}
          <main id="main" className="min-h-dvh safe-bottom">
            {children}
            {/* סנטינל: כשהוא נכנס לפריים – הדוק/נגן עולים מעט כדי לא להסתיר את הפוטר */}
            <div id="footer-sentinel" aria-hidden="true" />
          </main>

          <Footer />

          {/* שני אלה רונדרים ל-body ב-Portal, לא מושפעים מטרנספורמים/Canvas */}
          <ContactDock />
          <FloatingPlayer />
        </Providers>
      </body>
    </html>
  );
}
