// src/components/MiniPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export type MiniTrack = { id: string; title: string; artist: string; src: string; cover?: string; };

const Icon = {
  Play:  (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M8 5v14l11-7-11-7z"/></svg>,
  Pause: (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>,
  Heart: (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 21s-6.716-4.25-9.333-7.5C.167 10 2 6 5.5 6c2.028 0 3.28 1.018 4.125 2.083C10.72 7.018 11.972 6 14 6 17.5 6 19.333 10 21.333 13.5 18.716 16.75 12 21 12 21z"/></svg>,
  HeartO:(p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M20.8 12.6L12 21l-8.8-8.4A5.5 5.5 0 015.5 3 6.5 6.5 0 0112 7a6.5 6.5 0 016.5-4 5.5 5.5 0 012.3 9.6z"/></svg>,
};

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s/60), sec = Math.floor(s%60);
  return `${m}:${sec.toString().padStart(2,"0")}`;
};

export default function MiniPlayer({ track }: { track: MiniTrack }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  // לייקים ל-localStorage
  useEffect(() => {
    try{
      const raw = localStorage.getItem("mm_likes");
      const set = new Set<string>(raw ? JSON.parse(raw) : []);
      setLiked(set.has(track.id));
    }catch{}
  },[track.id]);

  const toggleLike = () => {
    try{
      const raw = localStorage.getItem("mm_likes");
      const set = new Set<string>(raw ? JSON.parse(raw) : []);
      set.has(track.id) ? set.delete(track.id) : set.add(track.id);
      localStorage.setItem("mm_likes", JSON.stringify([...set]));
      setLiked(set.has(track.id));
    }catch{}
  };

  // אירועי אודיו
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => setDur(el.duration || 0);
    const onTime   = () => setT(el.currentTime || 0);
    const onEnded  = () => setPlaying(false);
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, []);

  const play = () => {
    // משדרים לנגן הצף
    dispatchEvent(new CustomEvent("mm:play", { detail: { track } }));
    setPlaying(true);
  };

  const pause = () => { dispatchEvent(new Event("mm:pause")); setPlaying(false); };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = audioRef.current;
    if (!el || !dur) return;
    const nt = (+e.target.value / 100) * dur;
    el.currentTime = nt;
    setT(nt);
  };

  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70 p-3 backdrop-blur">
      <audio ref={audioRef} src={track.src} preload="metadata" className="hidden" />
      <div className="flex items-center gap-2">
        <button
          onClick={playing ? pause : play}
          className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition shadow"
          aria-pressed={playing}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? <Icon.Pause className="h-5 w-5" /> : <Icon.Play className="h-5 w-5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{track.title}</div>
          <div className="truncate text-xs opacity-70">{track.artist}</div>
        </div>

        <button onClick={toggleLike} className="grid h-9 w-9 place-items-center rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5" aria-pressed={liked} title={liked ? "הסר מהאהובים" : "הוסף לאהובים"}>
          {liked ? <Icon.Heart className="h-4 w-4" /> : <Icon.HeartO className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs tabular-nums opacity-70">{fmt(t)}</span>
        <input type="range" min={0} max={100} value={dur ? Math.min(100, (t/dur)*100) : 0} onChange={seek} className="flex-1 accent-emerald-500" />
        <span className="text-xs tabular-nums opacity-70">{fmt(dur)}</span>
      </div>
    </div>
  );
}
