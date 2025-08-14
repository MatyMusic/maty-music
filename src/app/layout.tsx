// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Topbar from "@/components/layout/Topbar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactDock from "@/components/ContactDock";
import Splash from "@/components/Splash";
import FloatingPlayer from "@/components/FloatingPlayer"; // ← חדש

export const metadata: Metadata = {
  title: "MATY MUSIC",
  description: "אתר מוזיקה אינטראקטיבי 3D — MATY MUSIC",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon-192.png" },
  manifest: "/manifest.webmanifest",
  // themeColor עבר ל-viewport.ts (כדי לא לקבל אזהרות)
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased">
        <Providers>
          {/* מסך פתיחה לאורחים */}
          <Splash />

          {/* ניווט עליון + כותרת */}
          <Topbar />
          <Header />

          {/* תוכן הדפים */}
          <main className="min-h-dvh">{children}</main>

          {/* פוטר ותיבת יצירת קשר */}
          <Footer />
          <ContactDock />

          {/* נגן צף גלובלי — נפתח אוטומטית כשמפעילים MiniPlayer */}
          <FloatingPlayer />
        </Providers>
      </body>
    </html>
  );
}
