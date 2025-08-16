// src/components/ProPlayer.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { MiniTrack as Track } from "@/components/MiniPlayer";

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const DEFAULT_QUEUE: Track[] = [
  {
    id: "demo-chabad",
    title: "Nigun Uplift",
    artist: "Maty Music · Chabad",
    src: "/assets/audio/demo.mp3",
    cover: "/assets/images/avatar-chabad.png",
  },
  {
    id: "demo-mizrahi",
    title: "Hafla Groove",
    artist: "Maty Music · Mizrahi",
    src: "/assets/audio/demo.mp3",
    cover: "/assets/images/avatar-mizrahi.png",
  },
  {
    id: "demo-soft",
    title: "Deep Breath",
    artist: "Maty Music · Soft",
    src: "/assets/audio/demo.mp3",
    cover: "/assets/images/avatar-soft.png",
  },
  {
    id: "demo-fun",
    title: "Energy Boost",
    artist: "Maty Music · Fun",
    src: "/assets/audio/demo.mp3",
    cover: "/assets/images/avatar-fun.png",
  },
];

export default function ProPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // state
  const [queue] = useState<Track[]>(DEFAULT_QUEUE);
  const [index, setIndex] = useState(0);
  const track = queue[index];

  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window === "undefined") return 0.9;
    const raw = localStorage.getItem("mm_volume");
    const v = raw ? Number(raw) : 0.9;
    return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0.9;
  });

  // helpers (memoized to satisfy eslint exhaustive-deps)
  const handleNext = useCallback(() => {
    setIndex((i) => (i + 1) % queue.length);
  }, [queue.length]);

  const handlePrev = useCallback(() => {
    setIndex((i) => (i - 1 + queue.length) % queue.length);
  }, [queue.length]);

  const seekBy = useCallback((delta: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.min(Math.max(0, el.currentTime + delta), el.duration || el.currentTime);
    setT(el.currentTime);
  }, []);

  const seekTo = useCallback((secs: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.min(Math.max(0, secs), el.duration || secs);
    setT(el.currentTime);
  }, []);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => {
        setPlaying(true);
        // מבקש ממיני-נגן אחרים לעצור כשפרו-פלייר מנגן
        window.dispatchEvent(new CustomEvent("mm:mini:play", { detail: { id: `pro-${track.id}` } }));
      }).catch(() => {});
    } else {
      el.pause();
      setPlaying(false);
    }
  }, [track.id]);

  // init & track change
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    // אירועי אודיו
    const onLoaded = () => setDur(el.duration || 0);
    const onTime = () => setT(el.currentTime || 0);
    const onEnded = () => handleNext();
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);

    // הגדרות בסיס
    el.volume = volume;
    el.src = track.src;
    el.load();

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
    };
  }, [track.src, volume, handleNext]);

  // כש־index משתנה – לנגן אוטומטית אם היינו במצב ניגון
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.play().catch(() => {});
      window.dispatchEvent(new CustomEvent("mm:mini:play", { detail: { id: `pro-${track.id}` } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]); // בכוונה לא שם 'playing' ו-'track.id' כאן כדי לא ליצור לולאה

  // volume persistence
  useEffect(() => {
    const el = audioRef.current;
    if (el) el.volume = volume;
    try {
      localStorage.setItem("mm_volume", String(volume));
    } catch {}
  }, [volume]);

  // מקשי מקלדת (תלוי ב-seekBy כדי לא לקבל אזהרת לינט)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target && (e.target as HTMLElement).tagName.match(/input|textarea|select/i)) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") seekBy(5);
      else if (e.code === "ArrowLeft") seekBy(-5);
      else if (e.code === "ArrowUp") setVolume((v) => Math.min(1, v + 0.05));
      else if (e.code === "ArrowDown") setVolume((v) => Math.max(0, v - 0.05));
      else if (e.key.toLowerCase() === "n") handleNext();
      else if (e.key.toLowerCase() === "p") handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [seekBy, togglePlay, handleNext, handlePrev]);

  // UI helpers
  const progress = useMemo(() => (dur ? (t / dur) * 100 : 0), [t, dur]);

  return (
    <div
      dir="rtl"
      className="fixed bottom-4 right-4 z-40 w-[min(520px,calc(100vw-2rem))] rounded-2xl border bg-white/80 dark:bg-neutral-900/80 backdrop-blur shadow-xl border-black/10 dark:border-white/10"
    >
      <audio ref={audioRef} preload="metadata" />

      {/* פס התקדמות דק למעלה */}
      <div className="relative h-1 overflow-hidden rounded-t-2xl bg-black/5 dark:bg-white/10">
        <div
          className="absolute inset-y-0 right-0 bg-gradient-to-l from-violet-600 to-pink-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-3 md:p-4 flex items-center gap-3">
        {/* עטיפה */}
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
          <Image
            src={track.cover ?? "/assets/logo/maty-music-wordmark.svg"}
            alt={track.title}
            fill
            sizes="56px"
            className="object-cover"
            priority={false}
          />
        </div>

        {/* פרטי שיר */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm md:text-base font-semibold">{track.title}</div>
          <div className="truncate text-xs md:text-sm opacity-70">{track.artist}</div>

          {/* סרגל זמן */}
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] tabular-nums opacity-70">{fmt(t)}</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, dur || 0)}
              value={Math.min(t, dur || 0)}
              onChange={(e) => seekTo(Number(e.target.value))}
              className="flex-1 accent-violet-600"
              aria-label="Seek"
            />
            <span className="text-[10px] tabular-nums opacity-70">{fmt(dur)}</span>
          </div>
        </div>

        {/* כפתורים */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={handlePrev}
            title="שיר קודם (P)"
            aria-label="Previous"
          >
            <span className="inline-block rotate-180">⏭️</span>
          </button>

          <button
            className="grid h-10 w-10 md:h-12 md:w-12 place-items-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shadow"
            onClick={togglePlay}
            title={playing ? "Pause (Space)" : "Play (Space)"}
            aria-pressed={playing}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6" fill="currentColor">
                <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 md:h-6 md:w-6" fill="currentColor">
                <path d="M8 5v14l11-7-11-7z" />
              </svg>
            )}
          </button>

          <button
            className="grid h-9 w-9 place-items-center rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            onClick={handleNext}
            title="שיר הבא (N)"
            aria-label="Next"
          >
            <span>⏭️</span>
          </button>
        </div>
      </div>

      {/* ווליום */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-70">ווליום</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 accent-violet-600"
            aria-label="Volume"
          />
          <span className="text-xs tabular-nums w-10 text-right opacity-70">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
}
