// src/components/Hero3D.tsx
"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, Preload } from "@react-three/drei";
import * as THREE from "three";

/** ---- נתונים ---- */
type CategoryKey = "chabad" | "mizrahi" | "soft" | "fun";
type Cat = { key: CategoryKey; label: string; imgs: string[]; headline: string; blurb: string };

const CATEGORIES: Cat[] = [
  {
    key: "chabad",
    label: "חסידי (חב״ד)",
    imgs: [
      "/assets/images/avatar-chabad-removebg-preview.png",
      "/assets/images/avatar-chabad.png",
    ],
    headline: "ניגונים שמרימים את הנפש",
    blurb: "חום של התוועדות, ביטים מודרניים ונשמה חסידית.",
  },
  {
    key: "mizrahi",
    label: "מזרחי",
    imgs: [
      "/assets/images/avatar-mizrahi-removebg-preview.png",
      "/assets/images/avatar-mizrahi.png",
    ],
    headline: "ים־תיכוני בועט",
    blurb: "גרוב של חאפלה, כינורות ותופים שמזיזים את הרחבה.",
  },
  {
    key: "soft",
    label: "שקט",
    imgs: [
      "/assets/images/avatar-soft-removebg-preview.png",
      "/assets/images/avatar-soft.png",
    ],
    headline: "שירים לנשימה עמוקה",
    blurb: "בלדות עדינות, צליל נקי ורוגע אחרי יום ארוך.",
  },
  {
    key: "fun",
    label: "מקפיץ",
    imgs: [
      "/assets/images/avatar-fun-removebg-preview.png",
      "/assets/images/avatar-fun.png",
    ],
    headline: "בוסט של אנרגיה",
    blurb: "ביטים חדים, הוקים קליטים ואווירת מסיבה.",
  },
];

/** ---- פריסת עומק/מיקום קבועה (בלי Hooks) ---- */
const LAYOUT: ReadonlyArray<[number, number, number]> = [
  [0.65, 0.18, 0.0],  // עליון-שמאלי יחסי
  [0.95, -0.05, 0.15], // אמצעי
  [0.55, -0.25, 0.30], // תחתון-שמאלי עמוק
  [1.10, 0.10, 0.45],  // עליון-ימני עמוק
];

/** ---- עוזר לטעינת תמונה זמינה ---- */
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
        if (ok && alive) {
          setUrl(u);
          break;
        }
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.join("|")]);
  return url;
}

/** ---- Mesh תמונה שטוחה עם אנימציות "חיים" ---- */
function AvatarPlane({
  src,
  base,
  mouse,
  phase = 0,
  depth = 0,
}: {
  src: string;
  base: [number, number];
  mouse: THREE.Vector2;
  phase?: number;
  depth?: number;
}) {
  const tex = useTexture(src);
  const maxAniso = useThree((s) => s.gl.capabilities.getMaxAnisotropy());

  useEffect(() => {
    if ("colorSpace" in tex) {
      (tex as any).colorSpace =
        (THREE as any).SRGBColorSpace ?? (THREE as any).sRGBEncoding;
    } else if ("encoding" in tex && "sRGBEncoding" in THREE) {
      (tex as any).encoding = (THREE as any).sRGBEncoding;
    }
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
  useFrame(({ clock }) => {
    if (!g.current) return;
    const t = clock.getElapsedTime() + phase;

    const mx = THREE.MathUtils.clamp(mouse.x, -0.8, 0.8);
    const my = THREE.MathUtils.clamp(mouse.y, -0.8, 0.8);
    const parallaxX = mx * (0.12 + depth * 0.04);
    const parallaxY = -my * (0.08 + depth * 0.03);

    const bobY = Math.sin(t * (1.1 + depth * 0.15)) * 0.05;
    const rotY = Math.sin(t * 0.9) * (0.06 + depth * 0.02);
    const rotX = Math.cos(t * 1.2) * (0.04 + depth * 0.02);

    g.current.position.set(base[0] + parallaxX, base[1] + bobY + parallaxY, -depth);
    g.current.rotation.set(rotX, rotY, 0);

    const s = 1 + Math.sin(t * 1.6) * 0.015;
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

/** ---- סצנה עם 4 אווטארים (Hooks קבועים בכל רנדר!) ---- */
function QuadScene({ mouse }: { mouse: THREE.Vector2 }) {
  // תמיד 4 קריאות (סדר וקבוע) → אין שבירת Hooks
  const urls = [
    useSmartUrl(CATEGORIES[0].imgs),
    useSmartUrl(CATEGORIES[1].imgs),
    useSmartUrl(CATEGORIES[2].imgs),
    useSmartUrl(CATEGORIES[3].imgs),
  ];
  const ready = urls.every(Boolean);

  return (
    
    <Suspense fallback={null}>
      {ready &&
        urls.map((u, i) => (
          <AvatarPlane
            key={u as string}
            src={u as string}
            mouse={mouse}
            base={[LAYOUT[i][0], LAYOUT[i][1]]}
            depth={LAYOUT[i][2]}
            phase={i * 0.7}
          />
        ))}
      <Preload all />
    </Suspense>
  );
}

/** ---- HERO ---- */
export default function Hero3D() {
  const [hoverRight, setHoverRight] = useState(false);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const mouse = useRef(new THREE.Vector2(0, 0));
  const boxRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouse.current.set(x * 2 - 1, y * 2 - 1);
    setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top }); // קואורדינטות יחסיות למיכל
  };

  return (
    <section className="relative">
      {/* זוהרים רכים ברקע */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute left-1/3 top-1/5 h-48 w-48 rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.32), rgba(99,102,241,0) 70%)" }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
        />
        <motion.div
          className="absolute right-1/4 bottom-1/4 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(236,72,153,0.26), rgba(236,72,153,0) 70%)" }}
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 36, ease: "linear" }}
        />
      </motion.div>

      <div className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-8">
        {/* טקסט משמאל */}
        <div className="order-2 md:order-1 text-right">
          <motion.h1
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            בחרו סגנון — ארבע דמויות, עולם אחד 🎶
          </motion.h1>
          <motion.p
            className="mt-4 opacity-80 leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            כל דמות מייצגת וייב אחר. הזיזו את העכבר ותראו אותן חיות, נעות ונושמות.
          </motion.p>
        </div>

        {/* מיכל Z לימין עם Canvas – לא קולט קליקים */}
        <motion.div
          ref={boxRef}
          className="order-1 md:order-2 relative h-[360px] md:h-[480px] rounded-2xl overflow-visible"
          style={{ perspective: 1000, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          onPointerMove={onPointerMove}
          onPointerEnter={() => setHoverRight(true)}
          onPointerLeave={() => setHoverRight(false)}
        >
          <Canvas
            className="pointer-events-none absolute inset-0" // לא חוסם קליקים
            dpr={[1.25, 2.5]}
            camera={{ position: [0, 0.7, 2.2], fov: 35 }}
            gl={{ antialיה: true, alpha: true } as any}
            onCreated={({ gl }) => {
              if ("outputColorSpace" in gl && (THREE as any).SRGBColorSpace) {
                (gl as any).outputColorSpace = (THREE as any).SRGBColorSpace;
              } else if ("outputEncoding" in gl && (THREE as any).sRGBEncoding) {
                (gl as any).outputEncoding = (THREE as any).sRGBEncoding;
              }
            }}
          >
            <QuadScene mouse={mouse.current} />
          </Canvas>

          {/* נקודת אור קטנה רודפת */}
          <AnimatePresence>
            {hoverRight && (
              <motion.div
                key="cursor-glow"
                className="pointer-events-none absolute z-10 h-10 w-10 rounded-full blur-lg"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)",
                  left: 0, top: 0,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.8, scale: 1, x: cursor.x - 20, y: cursor.y - 20 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 250, damping: 24 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
