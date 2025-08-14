// src/lib/pricing.ts
export type CategoryKey = "chabad" | "mizrahi" | "soft" | "fun";

export const CATEGORY_LABEL: Record<CategoryKey, string> = {
  chabad: "חסידי (חב״ד)",
  mizrahi: "מזרחי",
  soft: "שקט",
  fun: "מקפיץ",
};

export const BASE_PRICE: Record<CategoryKey, number> = {
  chabad: 2900,
  mizrahi: 2900,
  soft: 2700,
  fun: 3000,
};

export type Addons = {
  chuppah?: boolean; // חופה
  extraDjSet?: boolean; // סט DJ נוסף
  extraMusicians?: number; // מספר נגנים נוספים
};

export type QuoteInput = {
  category: CategoryKey;
  dateISO: string;
  hours: number;
  guests: number;
  distanceKm: number;
  addons: Addons;
  rushDays?: number;
};

export type QuoteBreakdown = {
  base: number;
  extraHours: number;
  audience: number;
  travel: number;
  addons: number;
  weekend: number;
  rush: number;
  early: number;
  subtotal: number;
  total: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function calcRushDays(dateISO: string): number | undefined {
  try {
    const now = new Date();
    const d = new Date(dateISO + "T00:00:00");
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return Math.floor(diff);
  } catch {
    return undefined;
  }
}

export function calcQuote(input: QuoteInput): QuoteBreakdown {
  const base = BASE_PRICE[input.category] ?? 0;
  const hours = clamp(input.hours || 2, 1, 10);
  const distanceKm = Math.max(0, input.distanceKm || 0);
  const guests = Math.max(0, input.guests || 0);

  // שעות נוספות — רק מעל 6 שעות, 200₪ לכל שעה נוספת
  const extraHours = Math.max(0, hours - 6) * 200;

  // תוספת קהל — רק אם מעל 1000 איש, תוספת 1000₪
  const audience = guests > 1000 ? 1000 : 0;

  // נסיעות — 6₪ לכל ק״מ מעבר ל־20
  const travel = Math.max(0, distanceKm - 20) * 6;

  // תוספים
  const addons =
    (input.addons?.chuppah ? 1200 : 0) + // אם תרצה לשנות ל-200 – תגיד ואעדכן
    (input.addons?.extraDjSet ? 1500 : 0) +
    Math.max(0, input.addons?.extraMusicians || 0) * 1800;

  // סופ״ש: שישי (5) או שבת (6) — 10%
  let weekend = 0;
  try {
    const day = new Date(input.dateISO + "T00:00:00").getDay();
    if (day === 5 || day === 6) weekend = 0.1;
  } catch {}

  // דחוף/מוקדם
  const rushDays = input.rushDays ?? calcRushDays(input.dateISO) ?? 0;
  const rush = rushDays >= 0 && rushDays <= 7 ? 0.1 : 0;
  const early = rushDays > 60 ? -0.05 : 0;

  const subtotal = base + extraHours + audience + travel + addons;
  const weekendFee = subtotal * weekend;
  const rushFee = subtotal * rush;
  const earlyDisc = subtotal * early;
  const total = Math.round(subtotal + weekendFee + rushFee + earlyDisc);

  return {
    base,
    extraHours,
    audience,
    travel,
    addons,
    weekend: Math.round(weekendFee),
    rush: Math.round(rushFee),
    early: Math.round(earlyDisc),
    subtotal: Math.round(subtotal),
    total,
  };
}
