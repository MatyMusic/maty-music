// src/components/ContactDock.tsx
"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";

type Action = {
  key: "whatsapp" | "phone" | "chat" | "email" | "map";
  label: string;
  href: string;
  target?: "_blank";
  rel?: string;
  icon: JSX.Element;
};

const Ic = {
  Wa:   (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2a10 10 0 00-8.94 14.56L2 22l5.6-1.47A10 10 0 1012 2zm5.4 14.3c-.23.66-1.13 1.21-1.57 1.26-.4.04-.9.06-1.46-.09a10.1 10.1 0 01-4.25-2.17 8.9 8.9 0 01-2.72-3.38c-.28-.74-.3-1.36-.2-1.86.1-.47.73-1.1 1.03-1.13.26-.03.59-.03.9-.03.14 0 .32.02.5.38.19.38.64 1.33.7 1.43.06.1.09.22.02.35-.22.45-.47.73-.6.86-.13.14-.28.3-.12.58.17.28.78 1.29 1.68 2.1 1.16 1.02 2.13 1.35 2.45 1.5.32.16.51.13.7-.06.2-.2.81-.94 1.03-1.26.22-.32.45-.27.75-.16.31.1 1.95.92 2.29 1.09.34.18.57.26.66.41.1.16.1.9-.13 1.56z"/></svg>),
  Phone:(<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.05-.24c1.15.38 2.39.59 3.54.59a1 1 0 011 1V21a1 1 0 01-1 1C10.4 22 2 13.6 2 3a1 1 0 011-1h3.47a1 1 0 011 1c0 1.15.2 2.39.59 3.54a1 1 0 01-.25 1.05l-2.2 2.2z"/></svg>),
  Chat: (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>),
  Mail: (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5L4 8V6l8 5 8-5v2z"/></svg>),
  Map:  (<svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 119.5 9 2.5 2.5 0 0112 11.5z"/></svg>),
};

const isExternal = (href: string) => /^(https?:|tel:|mailto:)/.test(href);
const SmartLink = (p: { href: string } & React.ComponentProps<"a">) =>
  isExternal(p.href) ? <a {...p} /> : <Link href={p.href} {...p} />;

function getEnv(name: string, fallback = "") {
  if (typeof process !== "undefined" && (process as any).env) return (process as any).env[name] ?? fallback;
  return fallback;
}

export default function ContactDock() {
  const [mounted, setMounted] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lift, setLift] = useState(false);       // מתרומם ליד הפוטר
  const [compact, setCompact] = useState(false); // קטן בגלילה מטה

  // mount + סטטוס הסתרה משומר
  useEffect(() => {
    setMounted(true);
    setHidden(localStorage.getItem("mm_contact_hidden") === "1");
  }, []);

  // מרווח תחתון גלובלי לפי מצב הדוק
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.style.setProperty("--contact-dock-h", hidden ? "0px" : "64px");
    return () => root.style.removeProperty("--contact-dock-h");
  }, [mounted, hidden]);

  // קומפקט בגלילה מטה
  useEffect(() => {
    if (!mounted) return;
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setCompact(y > lastY && y > 80);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted]);

  // הרמה ליד הפוטר
  useEffect(() => {
    if (!mounted) return;
    const s = document.getElementById("footer-sentinel");
    if (!s) return;
    const io = new IntersectionObserver(
      (entries) => setLift(entries[0]?.isIntersecting ?? false),
      { rootMargin: "0px 0px -25% 0px" }
    );
    io.observe(s);
    return () => io.disconnect();
  }, [mounted]);

  const actions: Action[] = useMemo(() => {
    const wa   = getEnv("NEXT_PUBLIC_WHATSAPP_URL", "/#contact");
    const tel  = getEnv("NEXT_PUBLIC_PHONE_TEL", "");
    const mail = getEnv("NEXT_PUBLIC_EMAIL", "");
    const map  = getEnv("NEXT_PUBLIC_MAPS_URL", "");
    return [
      { key: "whatsapp", label: "WhatsApp", href: wa, target: wa.startsWith("http") ? "_blank" : undefined, rel: wa.startsWith("http") ? "noopener" : undefined, icon: Ic.Wa },
      { key: "phone",    label: "התקשרו",  href: tel ? `tel:${tel}` : "/#contact", icon: Ic.Phone },
      { key: "chat",     label: "צ'אט",    href: "/#contact", icon: Ic.Chat },
      { key: "email",    label: "מייל",    href: mail ? `mailto:${mail}` : "/#contact", icon: Ic.Mail },
      { key: "map",      label: "ניווט",   href: map || "/#contact", target: map ? "_blank" : undefined, rel: map ? "noopener" : undefined, icon: Ic.Map },
    ];
  }, []);

  if (!mounted) return null;

  // כפתור החזרה כשמוסתר
  if (hidden) {
    return createPortal(
      <button
        onClick={() => { setHidden(false); localStorage.removeItem("mm_contact_hidden"); }}
        className="fixed z-40 inset-x-0 mx-auto w-fit"
        style={{ bottom: `calc(${lift ? "84px" : "10px"} + env(safe-area-inset-bottom,0px))` }}
        aria-label="הצג דוק יצירת קשר"
        title="הצג יצירת קשר"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white shadow-lg">✉️</span>
      </button>,
      document.body
    );
  }

  // הדוק עצמו
  const dock = (
    <div
      className="fixed inset-x-0 z-40"
      dir="rtl"
      style={{
        bottom: `calc(${lift ? "84px" : "10px"} + env(safe-area-inset-bottom,0px))`,
        transition: "bottom .25s ease, transform .2s ease, opacity .2s",
        transform: compact ? "translateY(18px)" : "translateY(0)",
        opacity: compact ? 0.88 : 1,
      }}
    >
      <nav aria-label="יצירת קשר מהירה" className="mx-auto w-full max-w-md px-3">
        <div className="relative flex items-center justify-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/92 dark:bg-neutral-900/90 backdrop-blur px-2 py-2 shadow-lg">
          {/* סגירה */}
          <button
            onClick={() => { setHidden(true); localStorage.setItem("mm_contact_hidden","1"); }}
            className="absolute left-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            title="הסתר"
            aria-label="הסתר"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M18.3 5.71L12 12.01l-6.3-6.3-1.4 1.41 6.29 6.29-6.3 6.3 1.42 1.41 6.3-6.29 6.29 6.29 1.41-1.41-6.29-6.3 6.29-6.29-1.41-1.41z"/></svg>
          </button>

          {actions.map((a) => (
            <SmartLink
              key={a.key}
              href={a.href}
              target={a.target}
              rel={a.rel}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100/85 dark:bg-neutral-800/75 hover:bg-slate-200/85 dark:hover:bg-neutral-700/75 transition"
              title={a.label}
              aria-label={a.label}
            >
              <span className="text-slate-800 dark:text-slate-100">{a.icon}</span>
            </SmartLink>
          ))}
        </div>
      </nav>
    </div>
  );

  return createPortal(dock, document.body);
}
