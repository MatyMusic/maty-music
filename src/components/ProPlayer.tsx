// src/components/ProPlayer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useAudioBeat from "@/hooks/useAudioBeat";

type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
  duration?: number;
};

const Icon = {
  Play: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7-11-7z"/></svg>),
  Pause: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>),
  Next: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M13 6l7 6-7 6V6zM4 6h2v12H4z"/></svg>),
  Prev: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M11 18L4 12l7-6v12zM18 6h2v12h-2z"/></svg>),
  Shuffle: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M17 3h4v4h-2V5h-2V3zM3 17h4v2H3v-2zm0-2l5-5 2 2-5 5H3zm7 6h2v-2l5-5h2V7h-2v4l-5 5h-2v2z"/></svg>),
  Repeat: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M7 7h7v2H7a3 3 0 0 0 0 6h2v-2l3 3-3 3v-2H7a5 5 0 0 1 0-10zm10 10h-7v-2h7a3 3 0 0 0 0-6h-2v2l-3-3 3-3v2h2a5 5 0 0 1 0 10z"/></svg>),
  RepeatOne: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M7 7h7v2H7a3 3 0 0 0 0 6h2v-2l3 3-3 3v-2H7a5 5 0 0 1 0-10zm10 10h-7v-2h7a3 3 0 0 0 0-6h-2v2l-3-3 3-3v2h2a5 5 0 0 1 0 10z"/><path d="M12 10h2v6h-2z"/></svg>),
  Heart: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 21s-6.716-4.25-9.333-7.5C.167 10 2 6 5.5 6c2.028 0 3.28 1.018 4.125 2.083C10.72 7.018 11.972 6 14 6 17.5 6 19.333 10 21.333 13.5 18.716 16.75 12 21 12 21z"/></svg>),
  HeartOutline: (p: any) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M20.8 12.6L12 21l-8.8-8.4A5.5 5.5 0 015.5 3 6.5 6.5 0 0112 7a6.5 6.5 0 016.5-4 5.5 5.5 0 012.3 9.6z"/></svg>),
  Volume: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M5 9v6h4l5 4V5l-5 4H5z"/></svg>),
  Mute: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M5 9v6h4l5 4V5l-5 4H5zm10.59 3L20 16.41 18.59 17.82 16.17 15.4l-2.41 2.42-1.41-1.42 2.41-2.41-2.41-2.41 1.41-1.42 2.41 2.42L20 7.59 21.41 9 18 12.41z"/></svg>),
  Queue: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M3 6h18v2H3V6zm0 4h12v2H3v-2zm0 4h12v2H3v-2zm14 0h4v2h-4v-2z"/></svg>),
  Sync: (p: any) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 6V3L8 7l4 4V8a4 4 0 11-3.46 6.02l-1.74 1a6 6 0 106.2-9.02z"/></svg>),
};

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

type RepeatMode = "off" | "all" | "one";

export default function ProPlayer({ playlist, defaultIndex = 0 }: { playlist?: Track[]; defaultIndex?: number; }) {
  const tracks = useMemo<Track[]>(
    () =>
      playlist ?? [
        { id: "chabad-1",  title: "Nigun Uplift", artist: "Maty Music · Chabad",  src: "/assets/audio/demo.mp3", cover: "/assets/images/avatar-chabad.png" },
        { id: "mizrahi-1", title: "Hafla Groove", artist: "Maty Music · Mizrahi", src: "/assets/audio/demo.mp3", cover: "/assets/images/avatar-mizrahi.png" },
        { id: "soft-1",    title: "Deep Breath",  artist: "Maty Music · Soft",    src: "/assets/audio/demo.mp3", cover: "/assets/images/avatar-soft.png" },
        { id: "fun-1",     title: "Energy Boost", artist: "Maty Music · Fun",     src: "/assets/audio/demo.mp3", cover: "/assets/images/avatar-fun.png" },
      ],
    [playlist]
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { level: beat, connected } = useAudioBeat({ audioRef, fftSize: 1024, smoothing: 0.85, boost: 1.15, lowBins: 28 });

  const [index, setIndex] = useState(Math.min(defaultIndex, tracks.length - 1));
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [muted, setMuted] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [shuffle, setShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [syncWanted, setSyncWanted] = useState(false);

  const track = tracks[index];

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_likes");
      if (raw) setLiked(new Set(JSON.parse(raw)));
    } catch {}
  }, []);
  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      try { localStorage.setItem("mm_likes", JSON.stringify(Array.from(n))); } catch {}
      return n;
    });
  };

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => { setDuration(el.duration || 0); if (playing) el.play().catch(() => {}); };
    const onTime = () => setCurrent(el.currentTime || 0);
    const onEnd = () => { if (repeat === "one") { el.currentTime = 0; el.play().catch(() => {}); return; } handleNext(); };
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnd);
    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnd);
    };
  }, [playing, repeat]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.src = track.src; el.load();
    if (playing) el.play().catch(() => {});
  }, [index, track.src, playing]);

  useEffect(() => {
    const el = audioRef.current; if (!el) return;
    el.volume = muted ? 0 : volume;
  }, [volume, muted]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.code === "Space") { e.preventDefault(); togglePlay(); }
      else if (e.code === "ArrowRight") { seekBy(5); }
      else if (e.code === "ArrowLeft") { seekBy(-5); }
      else if (e.key.toLowerCase() === "m") { setMuted((m) => !m); }
      else if (e.key.toLowerCase() === "l") { toggleLike(track.id); }
      else if (e.key.toLowerCase() === "s") { setShuffle((s) => !s); }
      else if (e.key.toLowerCase() === "r") { cycleRepeat(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [track?.id]);

  const togglePlay = () => {
    const el = audioRef.current; if (!el) return;
    if (el.paused) { el.play().then(() => setPlaying(true)).catch(() => {}); }
    else { el.pause(); setPlaying(false); }
  };
  const seekTo = (t: number) => {
    const el = audioRef.current; if (!el) return;
    el.currentTime = Math.max(0, Math.min(duration || 0, t)); setCurrent(el.currentTime);
  };
  const seekBy = (d: number) => seekTo(currentTime + d);
  const handlePrev = () => { if (currentTime > 3) { seekTo(0); return; } setIndex((i) => (i - 1 + tracks.length) % tracks.length); };
  const handleNext = () => {
    if (shuffle) { let j = Math.floor(Math.random() * tracks.length); if (tracks.length > 1 && j === index) j = (j + 1) % tracks.length; setIndex(j); return; }
    if (index === tracks.length - 1) { if (repeat === "all") setIndex(0); else { setPlaying(false); seekTo(0); } }
    else setIndex(index + 1);
  };
  const cycleRepeat = () => setRepeat((r) => (r === "off" ? "all" : r === "all" ? "one" : "off"));

  const onScrub = (e: React.ChangeEvent<HTMLInputElement>) => seekTo(Number(e.target.value));
  const requestSync = () => { setSyncWanted(true); audioRef.current?.play().catch(() => {}); setTimeout(() => setSyncWanted(false), 1200); };

  const bars = 12;
  const levels = useMemo(() => Array.from({ length: bars }, (_, i) => (i + 1) / bars), []);
  const now = typeof performance !== "undefined" ? performance.now() : 0;
  const barHeights = levels.map((w, i) => {
    const jitter = Math.sin(now / 200 + i) * 0.05 + 0.05;
    return Math.min(1, Math.max(0.06, beat * (0.35 + w * 0.75) + jitter));
  });

  return (
    <div dir="rtl" className="mx-auto max-w-5xl rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-900/80 backdrop-blur shadow-lg p-4 md:p-5">
      <audio ref={audioRef} preload="metadata" />
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-black/10 dark:border-white/10 shrink-0">
          <img src={track.cover ?? "/assets/logo/maty-music-wordmark.svg"} alt={track.title} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-2 px-1 pb-[3px]">
            <div className="flex h-full items-end gap-[2px] opacity-80">
              {barHeights.map((h, i) => (<div key={i} className="w-full rounded-sm bg-gradient-to-t from-violet-500/70 to-pink-500/70" style={{ height: `${h * 100}%` }} />))}
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-extrabold text-lg">{track.title}</h3>
            <span className="text-xs opacity-70">•</span>
            <div className="truncate text-sm opacity-80">{track.artist}</div>
          </div>
          <div className="mt-1 text-xs opacity-70">{/* אפשר להציג מצב סנכרון כאן אם תרצה */}</div>
        </div>
        <button className={`relative grid h-10 w-10 place-items-center rounded-full border transition ${/* לייק גלובלי */ ""}`} onClick={() => {}}>
          {/* שמתי כפתור ריק—אתה יכול לחבר ללייקים גלובליים אם תרצה */}
          ❤
        </button>
      </div>

      <div className="mt-4">
        <input type="range" min={0} max={Math.max(1, duration || 0)} value={Math.min(currentTime, duration || 0)} onChange={onScrub} className="w-full accent-violet-600" />
        <div className="mt-1 flex items-center justify-between text-xs opacity-75">
          <span>{fmt(currentTime)}</span><span>{fmt(duration)}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 md:gap-3">
        <button className="grid h-10 w-10 place-items-center rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition" onClick={() => {}} title="Shuffle"><svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M17 3h4v4h-2V5h-2V3zM3 17h4v2H3v-2zm0-2l5-5 2 2-5 5H3zm7 6h2v-2l5-5h2V7h-2v4l-5 5h-2v2z" fill="currentColor"/></svg></button>
        <button className="grid h-10 w-10 place-items-center rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition" onClick={() => {}} title="Prev"><svg viewBox="0 0 24 24" className="h-6 w-6"><path d="M11 18L4 12l7-6v12zM18 6h2v12h-2z" fill="currentColor"/></svg></button>
        <button className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition shadow" onClick={() => {}} title="Play/Pause">
          {/* זה הדמו — את הנגן הראשי תשאיר לדף הייעודי */}
          ▶
        </button>
        <button className="grid h-10 w-10 place-items-center rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition" onClick={() => {}} title="Next"><svg viewBox="0 0 24 24" className="h-6 w-6"><path d="M13 6l7 6-7 6V6zM4 6h2v12H4z" fill="currentColor"/></svg></button>
        <button className="grid h-10 w-10 place-items-center rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition" onClick={() => {}} title="Repeat"><svg viewBox="0 0 24 24" className="h-5 w-5"><path d="M7 7h7v2H7a3 3 0 0 0 0 6h2v-2l3 3-3 3v-2H7a5 5 0 0 1 0-10zm10 10h-7v-2h7a3 3 0 0 0 0-6h-2v2l-3-3 3-3v2h2a5 5 0 0 1 0 10z" fill="currentColor"/></svg></button>

        <div className="ml-auto flex items-center gap-2">
          {/* ווליום וכו' – השארתי לך כאן מקום אם תרצה לשחפל מהגרסה המלאה */}
        </div>
      </div>
    </div>
  );
}
