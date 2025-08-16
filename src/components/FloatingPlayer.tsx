"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";

type Track = { id: string; title: string; artist: string; src: string; cover?: string; };
const HIDE_ON: RegExp[] = []; // אם תרצה להסתיר בדפים מסוימים

const Icon = {
  Play:  (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7-11-7z"/></svg>,
  Pause: (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>,
  Close: (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M18.3 5.71L12 12.01l-6.3-6.3-1.4 1.41 6.29 6.29-6.3 6.3 1.42 1.41 6.3-6.29 6.29 6.29 1.41-1.41-6.29-6.3 6.29-6.29-1.41-1.41z"/></svg>,
};

export default function FloatingPlayer() {
  const [mounted, setMounted] = useState(false);
  const [track, setTrack] = useState<Track | null>(null);
  const [show, setShow] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  // מסתירים אם הדף תואם תבנית
  useEffect(() => {
    const apply = () => {
      const p = window.location.pathname;
      if (HIDE_ON.some(rx => rx.test(p))) setShow(false);
    };
    apply();
    addEventListener("popstate", apply);
    return () => removeEventListener("popstate", apply);
  }, []);

  // אירועים מהמיני־נגנים
  useEffect(() => {
    const onPlay = (e: Event) => {
      const detail = (e as CustomEvent).detail as { track: Track };
      if (!detail?.track) return;
      setTrack(detail.track);

      const el = audioRef.current;
      if (!el) { setShow(true); return; }

      const abs = new URL(detail.track.src, location.origin).href;
      if (el.src !== abs) { el.src = detail.track.src; el.load(); }

      dispatchEvent(new Event("mm:pause-others"));
      el.play().then(() => { setPlaying(true); setShow(true); }).catch(() => setShow(true));
    };
    const onPause = () => { audioRef.current?.pause(); setPlaying(false); };

    addEventListener("mm:play", onPlay as EventListener);
    addEventListener("mm:pause", onPause);
    return () => {
      removeEventListener("mm:play", onPlay as EventListener);
      removeEventListener("mm:pause", onPause);
    };
  }, []);

  // מודדים גובה – מעדכנים CSS var כדי שלא יסתיר תוכן
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const update = () => {
      const h = show && cardRef.current ? Math.ceil(cardRef.current.getBoundingClientRect().height) : 0;
      root.style.setProperty("--player-h", `${h}px`);
    };
    update();
    addEventListener("resize", update);
    const id = window.setInterval(update, 300);
    return () => { removeEventListener("resize", update); clearInterval(id); root.style.setProperty("--player-h", "0px"); };
  }, [mounted, show, track]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) { dispatchEvent(new Event("mm:pause-others")); el.play().then(() => setPlaying(true)).catch(() => {}); }
    else { el.pause(); setPlaying(false); }
  };
  const close = () => { audioRef.current?.pause(); setPlaying(false); setShow(false); document.documentElement.style.setProperty("--player-h","0px"); };

  if (!mounted || !track) return null;

  const card = (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed inset-x-0 z-50"
          style={{
            bottom: "calc(env(safe-area-inset-bottom,0px) + var(--contact-dock-h) + 8px)",
          }}
          dir="rtl"
        >
          <div className="mx-auto w-full max-w-md px-3">
            <audio ref={audioRef} preload="metadata" />
            <div
              ref={cardRef}
              className="flex items-center gap-3 rounded-2xl border border-black/10 dark:border-white/10 bg-white/88 dark:bg-neutral-900/88 backdrop-blur px-3 py-2 shadow-lg"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-md border border-black/10 dark:border-white/10 shrink-0">
                <img src={track.cover ?? "/assets/logo/maty-music-wordmark.svg"} alt="" className="h-full w-full object-cover" />
              </div>

              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{track.title}</div>
                <div className="truncate text-xs opacity-70">{track.artist}</div>
              </div>

              <div className="ms-2 flex items-center gap-1.5">
                <button
                  onClick={togglePlay}
                  className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition shadow"
                  title={playing ? "Pause" : "Play"}
                  aria-pressed={playing}
                >
                  {playing ? <Icon.Pause className="h-5 w-5" /> : <Icon.Play className="h-5 w-5" />}
                </button>
                <button
                  onClick={close}
                  className="grid h-8 w-8 place-items-center rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                  title="סגור"
                  aria-label="סגור"
                >
                  <Icon.Close className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(card, document.body);
}
