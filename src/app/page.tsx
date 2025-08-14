// src/app/page.tsx
"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Preload } from "@react-three/drei";
import * as THREE from "three";
import Link from "next/link";
import MiniPlayer, { MiniTrack } from "@/components/MiniPlayer";

/** ========= נתונים ========= */
type CategoryKey = "chabad" | "mizrahi" | "soft" | "fun";
type Cat = {
  key: CategoryKey;
  label: string;
  imgs: string[];
  href: string;
  blurb: string;
  track: MiniTrack; // קובץ הדמו למיני־נגן
};

const CATS: Cat[] = [
  {
    key: "chabad",
    label: "חסידי (חב״ד)",
    imgs: ["/assets/images/avatar-chabad-removebg-preview.png", "/assets/images/avatar-chabad.png"],
    href: "/genre/chabad",
    blurb: "ניגונים שמרימים את הנפש",
    track: { id: "demo-chabad", title: "Nigun Uplift", artist: "Maty Music · Chabad", src: "/assets/audio/demo.mp3", cover: "/assets/images/avatar-chabad.png" },
  },
  {
    key: "mizrahi",
    label: "מזרחי",
    imgs: ["/assets/images/avatar-mizrahi-removebg-preview.png", "/assets/images/avatar-mizrahi.png"],
    href: "/genre/mizrahi",
    blurb: "ים־תיכוני בועט",
    track: { id: "demo-mizrahi", title: "Hafla Groove", artist: "Maty Music · Mizrahi", src: "/assets/audio/demo.mp3", cover: "/assets/images/avatar-mizrahi.png" },
  },
  {
    key: "soft",
    label: "שקט",
    imgs: ["/assets/images/avatar-soft-removebg-preview.png", "/assets/images/avatar-soft.png"],
    href: "/genre/soft",
    blurb: "בלדות לנשימה עמוקה",
    track: { id: "demo-soft", title: "Deep Breath", artist: "Maty Music · Soft", src: "/assets/audio/demo.mp3", cover: "/assets/images/avatar-soft.png" },
  },
  {
    key: "fun",
    label: "מקפיץ",
    imgs: ["/assets/images/avatar-fun-removebg-preview.png", "/assets/images/avatar-fun.png"],
    href: "/genre/fun",
    blurb: "בוסט של אנרגיה",
    track: { id: "demo-fun", title: "Energy Boost", artist: "Maty Music · Fun", src: "/assets/audio/demo.mp3", cover: "/assets/images/avatar-fun.png" },
  },
];

/** ========= עוזרים ========= */
function useSmartUrl(candidates: string[]) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      for (const u of candidates) {
        const ok = await new Promise<boolean>((res) => {
          const img = new Image();
          img.onload = () => res(true);
          img.onerror = () => res(false);
          img.src = u;
        });
        if (ok && alive) { setUrl(u); break; }
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.join("|")]);
  return url;
}

function AvatarPlane({ src, mouseTarget, seed = 0 }: { src: string; mouseTarget: THREE.Vector2; seed?: number; }) {
  const tex = useTexture(src);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  useEffect(() => {
    if ("colorSpace" in tex) (tex as any).colorSpace = (THREE as any).SRGBColorSpace ?? (THREE as any).sRGBEncoding;
    else if ("encoding" in tex && "sRGBEncoding" in THREE) (tex as any).encoding = (THREE as any).sRGBEncoding;
    tex.anisotropy = Math.min(16, maxAniso || 16);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
  }, [tex, maxAniso]);

  const w = (tex.image as HTMLImageElement | undefined)?.width ?? 1;
  const h = (tex.image as HTMLImageElement | undefined)?.height ?? 1;
  const baseH = 1.35;
  const planeW = baseH * (w / h);

  const g = useRef<THREE.Group>(null);
  const cur = useRef(new THREE.Vector2(0, 0));

  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.getElapsedTime() + seed;
    cur.current.lerp(mouseTarget, 0.12);
    const mx = THREE.MathUtils.clamp(cur.current.x, -1, 1);
    const my = THREE.MathUtils.clamp(cur.current.y, -1, 1);
    const bobY = Math.sin(t * 1.35) * 0.05;
    const px = mx * 0.35;
    const py = -my * 0.30;
    g.current.position.set(px, bobY + py, 0);
    const rotY = Math.sin(t * 0.9) * 0.04 + mx * 0.35;
    const rotX = Math.cos(t * 1.1) * 0.035 - my * 0.28;
    g.current.rotation.set(rotX, rotY, 0);
    const s = 1 + Math.sin(t * 1.8) * 0.01;
    g.current.scale.set(s, s, 1);
  });

  return (
    <group ref={g}>
      <mesh>
        <planeGeometry args={[planeW, baseH]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.05} />
      </mesh>
    </group>
  );
}

/** ========= קוביית אווטאר עם MiniPlayer ========= */
function AvatarCard({ cat, i }: { cat: Cat; i: number }) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, s: 1 });
  const mouseTarget = useRef(new THREE.Vector2(0, 0));
  const url = useSmartUrl(cat.imgs);

  const onMove = (e: React.MouseEvent) => {
    if (!boxRef.current) return;
    const r = boxRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mouseTarget.current.set(px * 2 - 1, py * 2 - 1);
    const ry = (px - 0.5) * 16;
    const rx = -(py - 0.5) * 12;
    setTilt({ rx, ry, s: 1.02 });
  };
  const onLeave = () => {
    setTilt({ rx: 0, ry: 0, s: 1 });
    mouseTarget.current.set(0, 0);
  };

  const Hint = () => (
    <div
      className="absolute right-4 top-4 text-xs font-semibold px-2 py-1 rounded-full backdrop-blur border border-white/20 bg-white/60 dark:bg-neutral-900/60"
      style={{ transform: "translateZ(24px)" }}
    >
      {cat.label} · לחצו לכניסה
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 120, damping: 16, delay: i * 0.06 }}
      className="relative"
    >
      <div
        className="relative rounded-3xl p-4 md:p-5 border bg-white/70 dark:bg-neutral-900/70 border-black/10 dark:border-white/10 shadow-md"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.s})`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* אזור עליון קליקבילי לקטגוריה */}
        <Link
          href={cat.href}
          aria-label={`${cat.label} – ${cat.blurb}`}
          className="group block cursor-pointer select-none"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("mm:setCategory", { detail: { category: cat.key } }));
          }}
        >
          {/* הילה מסתובבת */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl blur-2xl"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 22 + i * 3, ease: "linear" }}
            style={{ background: "conic-gradient(from 0deg, rgba(99,102,241,0.35), rgba(236,72,153,0.28), rgba(99,102,241,0.35))" }}
          />
          <Hint />

          {/* Canvas אזור */}
          <div
            ref={boxRef}
            className="relative h-[260px] rounded-2xl overflow-hidden"
            style={{ transform: "translateZ(18px)" }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            <motion.div
              aria-hidden
              className="absolute inset-0"
              animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
              transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
              style={{
                backgroundImage:
                  "radial-gradient(60% 60% at 30% 20%, rgba(255,255,255,0.25), transparent 70%), radial-gradient(50% 50% at 80% 70%, rgba(99,102,241,0.20), transparent 70%)",
                backgroundSize: "200% 200%",
              }}
            />
            <Canvas
              className="pointer-events-none absolute inset-0"
              dpr={[1.25, 2.5]}
              camera={{ position: [0, 0.7, 2.2], fov: 35 }}
              gl={{ antialias: true, alpha: true }}
              onCreated={({ gl }) => {
                if ("outputColorSpace" in gl && (THREE as any).SRGBColorSpace) (gl as any).outputColorSpace = (THREE as any).SRGBColorSpace;
                else if ("outputEncoding" in gl && (THREE as any).sRGBEncoding) (gl as any).outputEncoding = (THREE as any).sRGBEncoding;
              }}
            >
              <Suspense fallback={null}>
                {url && <AvatarPlane src={url} mouseTarget={mouseTarget.current} seed={i * 0.7} />}
                <Preload all />
              </Suspense>
            </Canvas>

            {/* “שיין” בזמן ריחוף */}
            <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-2xl overflow-hidden" whileHover="shine">
              <motion.span
                variants={{ shine: { x: ["-40%", "140%"] } }}
                transition={{ type: "tween", duration: 1.8, ease: "easeInOut", repeat: Infinity }}
                className="absolute -left-1/3 top-0 h-full w-1/2 rotate-12"
                style={{ background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%)" }}
              />
            </motion.span>
          </div>

          {/* טקסט תחתון קטן (עדיין בתוך ה־Link) */}
          <div className="mt-3 text-right" style={{ transform: "translateZ(14px)" }}>
            <div className="text-base font-extrabold tracking-tight">{cat.label}</div>
            <div className="text-sm opacity-75">{cat.blurb}</div>
          </div>
        </Link>

        {/* מיני־נגן — מחוץ ל־Link כדי שהכפתורים לא ינווטו */}
        <div className="mt-3" style={{ transform: "translateZ(12px)" }}>
          <MiniPlayer track={cat.track} />
        </div>
      </div>
    </motion.div>
  );
}

/** ========= CTA תחתון (כדוגמה; אפשר להשאיר/להסיר) ========= */
const CTAS = [
  { href: "/events",  title: "אירועים",     subtitle: "חתונות, בר/בת מצווה, הופעות חיות", emoji: "🎤" },
  { href: "/pricing", title: "מחירון",      subtitle: "חבילות גמישות לכל כיס",           emoji: "💳" },
  { href: "/gallery", title: "גלריה",       subtitle: "תמונות ווידאו מאירועים",           emoji: "📸" },
  { href: "/booking", title: "הזמנת הופעה", subtitle: "בדיקת זמינות וסגירת תאריך",       emoji: "📅" },
] as const;

function FancyCard({ href, title, subtitle, emoji, i }: (typeof CTAS)[number] & { i: number }) {
  const isPricing = href === "/pricing";
  return (
    <motion.div initial={{ opacity: 0, y: 22, scale: 0.985 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true, amount: 0.35 }} transition={{ type: "spring", stiffness: 120, damping: 16, delay: i * 0.05 }} className="relative">
      <motion.div aria-hidden className="pointer-events-none absolute -inset-2 -z-10 rounded-3xl blur-2xl" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 24 + i * 4, ease: "linear" }}
        style={{ background: isPricing ? "conic-gradient(from 0deg, rgba(99,102,241,0.45), rgba(236,72,153,0.35), rgba(99,102,241,0.45))" : "radial-gradient(closest-side, rgba(99,102,241,0.25), rgba(99,102,241,0) 70%)" }} />
      <Link href={href} className="group block rounded-2xl border p-5 shadow-md backdrop-blur transition-all bg-white/70 dark:bg-neutral-900/70 border-black/10 dark:border-white/10 hover:shadow-lg hover:scale-[1.01]" style={{ transformStyle: "preserve-3d" }}>
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-xl text-2xl shadow-inner transition-transform group-hover:-translate-y-0.5" style={{ background: "radial-gradient(closest-side, rgba(255,255,255,0.9), rgba(255,255,255,0.45))", transform: "translateZ(24px)" }}>
          <span aria-hidden>{emoji}</span>
        </div>
        <div style={{ transform: "translateZ(18px)" }}>
          <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm opacity-80">{subtitle}</p>
        </div>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold opacity-90 transition group-hover:opacity-100" style={{ transform: "translateZ(12px)" }}>
          <span>פתח</span><span aria-hidden className="transition-transform group-hover:translate-x-0.5">↗</span>
        </div>
      </Link>
    </motion.div>
  );
}

/** ========= דף ========= */
export default function HomePage() {
  return (
    <main dir="rtl" className="relative">
      {/* HERO – גריד 2x2 של קוביות תלת־מימד (עם מיני־נגן בכל קובייה) */}
      <section className="relative z-0 mx-auto max-w-6xl px-4 pt-8">
        <h1 className="sr-only">MATY MUSIC</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
          {CATS.map((cat, i) => (<AvatarCard key={cat.key} cat={cat} i={i} />))}
        </div>
      </section>

      {/* CTA תחתון (לא חובה) */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 py-10 md:py-14">
        <div className="mb-6 text-right">
          <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5 }} className="text-2xl font-extrabold md:text-3xl">לאן ממשיכים?</motion.h2>
          <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-1 opacity-80">בחרו יעד ותמשיכו לחקור את MATY MUSIC.</motion.p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CTAS.map((c, i) => (<FancyCard key={c.href} {...c} i={i} />))}
        </div>
      </section>
    </main>
  );
}
