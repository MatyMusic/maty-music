// src/components/MiniPlayer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useAudioBeat from "@/hooks/useAudioBeat";

export type MiniTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
};

const Icon = {
  Play: (p: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7-11-7z"/></svg>
  ),
  Pause: (p: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
  ),
  Heart: (p: any) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 21s-6.716-4.25-9.333-7.5C.167 10 2 6 5.5 6c2.028 0 3.28 1.018 4.125 2.083C10.72 7.018 11.972 6 14 6 17.5 6 19.333 10 21.333 13.5 18.716 16.75 12 21 12 21z"/></svg>
  ),
  HeartOutline: (p: any) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M20.8 12.6L12 21l-8.8-8.4A5.5 5.5 0 015.5 3 6.5 6.5 0 0112 7a6.5 6.5 0 016.5-4 5.5 5.5 0 012.3 9.6z"/></svg>
  ),
};

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export default function MiniPlayer({ track }: { track: MiniTrack }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Beat/Visualizer source
  const { level: beat } = useAudioBeat({
    audioRef,
    fftSize: 1024,
    smoothing: 0.85,
    boost: 1.1,
    lowBins: 28,
  });

  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  // ---- Hydration-safe flag ----
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // לייקים מה־localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_likes");
      const set = new Set<string>(raw ? JSON.parse(raw) : []);
      setLiked(set.has(track.id));
    } catch {}
  }, [track.id]);

  const toggleLike = () => {
    try {
      const raw = localStorage.getItem("mm_likes");
      const arr: string[] = raw ? JSON.parse(raw) : [];
      const set = new Set<string>(arr);
      if (set.has(track.id)) set.delete(track.id);
      else set.add(track.id);
      localStorage.setItem("mm_likes", JSON.stringify(Array.from(set)));
      setLiked(set.has(track.id));
    } catch {}
  };

  // אירועי אודיו
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => setDur(el.duration || 0);
    const onTime = () => setT(el.currentTime || 0);
    const onEnded = () => setPlaying(false);

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);

    el.src = track.src;
    el.load();

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [track.src]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().then(() => setPlaying(true)).catch(() => {});
      // שדר ארוע גלובלי – כדי לפתוח את הנגן הצף
      window.dispatchEvent(new CustomEvent("mm:play", { detail: { track } }));
    } else {
      el.pause();
      setPlaying(false);
      window.dispatchEvent(new CustomEvent("mm:pause", { detail: { track } }));
    }
  };

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Number(e.target.value);
    setT(el.currentTime);
  };

  // ---- Visualizer: SSR-safe ----
  const bars = 8;
  const levels = useMemo(() => Array.from({ length: bars }, (_, i) => (i + 1) / bars), []);
  const baseHeights = useMemo(() => Array(bars).fill(0.05), []); // SSR/first render
  const heights = useMemo(() => {
    if (!mounted) return baseHeights;
    const now = performance.now();
    return levels.map((w, i) => {
      const jitter = Math.sin(now / 240 + i) * 0.06 + 0.04;
      return Math.min(1, Math.max(0.05, beat * (0.35 + w * 0.7) + jitter));
    });
  }, [mounted, levels, beat, baseHeights]);

  return (
    <div
      className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 backdrop-blur px-3 py-2 shadow-sm"
      onClick={(e) => e.stopPropagation()} // שלא ילחץ את ה-Link של הקובייה
      onMouseDown={(e) => e.stopPropagation()}
    >
      <audio ref={audioRef} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* עטיפה + ברים זעירים */}
        <div className="relative h-10 w-10 overflow-hidden rounded-md border border-black/10 dark:border-white/10 shrink-0">
          <img
            src={track.cover ?? "/assets/logo/maty-music-wordmark.svg"}
            alt={track.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1 px-1 pb-[2px]">
            <div className="flex h-full items-end gap-[1px] opacity-80">
              {heights.map((h, i) => (
                <div
                  key={i}
                  className="w-full rounded-sm bg-gradient-to-t from-violet-500/70 to-pink-500/70"
                  style={{ height: `${h * 100}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* טקסט */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{track.title}</div>
          <div className="truncate text-xs opacity-70">{track.artist}</div>
        </div>

        {/* כפתורים */}
        <div className="flex items-center gap-1.5">
          <button
            className={`grid h-8 w-8 place-items-center rounded-full border transition ${
              liked ? "text-pink-600 border-pink-500/40 bg-pink-500/10" : "border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
            }`}
            aria-label={liked ? "הסר מלייקים" : "הוסף ללייקים"}
            title={liked ? "הסר מלייקים" : "הוסף ללייקים"}
            onClick={toggleLike}
          >
            {liked ? <Icon.Heart className="h-4 w-4" /> : <Icon.HeartOutline className="h-4 w-4" />}
          </button>

          <button
            className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition shadow"
            onClick={togglePlay}
            title={playing ? "Pause" : "Play"}
            aria-pressed={playing}
          >
            {playing ? <Icon.Pause className="h-5 w-5" /> : <Icon.Play className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* פס זמן */}
      <div className="mt-2">
        <input
          type="range"
          min={0}
          max={Math.max(1, dur || 0)}
          value={Math.min(t, dur || 0)}
          onChange={onScrub}
          className="w-full accent-violet-600"
          aria-label="Seek"
        />
        <div className="mt-0.5 flex items-center justify-between text-[10px] opacity-70">
          <span>{fmt(t)}</span>
          <span>{fmt(dur)}</span>
        </div>
      </div>
    </div>
  );
}
