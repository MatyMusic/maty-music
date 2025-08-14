// src/components/FloatingPlayer.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProPlayer from "@/components/ProPlayer";

type Track = {
  id: string;
  title: string;
  artist: string;
  src: string;
  cover?: string;
  duration?: number;
};

export default function FloatingPlayer() {
  const [open, setOpen] = useState(false);
  const [playlist, setPlaylist] = useState<Track[] | undefined>(undefined);
  const [playerKey, setPlayerKey] = useState(0); // רימאונט כדי לאתחל אינדקס

  useEffect(() => {
    const onPlay = (e: Event) => {
      const evt = e as CustomEvent<{ track: Track }>;
      const t = evt.detail?.track;
      if (!t) return;
      setPlaylist([t]);      // כרגע נגן על הטרק שנשלח
      setPlayerKey((k) => k + 1);
      setOpen(true);
    };
    const onPause = () => {
      // אופציונלי: לא נסגור אוטומטית כשהמיני נעצר
    };

    window.addEventListener("mm:play" as any, onPlay as EventListener);
    window.addEventListener("mm:pause" as any, onPause as EventListener);
    return () => {
      window.removeEventListener("mm:play" as any, onPlay as EventListener);
      window.removeEventListener("mm:pause" as any, onPause as EventListener);
    };
  }, []);

  return (
    <>
      {/* כפתור לפתיחה כשסגור */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fp-open"
            className="fixed bottom-4 right-4 z-[90] rounded-full bg-emerald-500 text-white px-4 py-2 shadow-lg hover:bg-emerald-600"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={() => setOpen(true)}
            title="פתח נגן"
          >
            נגן
          </motion.button>
        )}
      </AnimatePresence>

      {/* הנגן הצף */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="fp"
            className="fixed inset-x-0 bottom-0 z-[95] px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <div className="mx-auto max-w-5xl pointer-events-auto">
              <div className="relative">
                {/* כפתור סגירה */}
                <button
                  onClick={() => setOpen(false)}
                  className="absolute -top-3 right-2 z-10 rounded-full bg-black/70 text-white px-3 py-1 text-xs hover:bg-black/85"
                  title="סגור נגן"
                >
                  סגור ✕
                </button>

                {/* ProPlayer – מקבל פלייליסט חיצוני; key מרענן אינדקס */}
                <ProPlayer key={playerKey} playlist={playlist} defaultIndex={0} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
