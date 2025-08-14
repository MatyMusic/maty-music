// src/lib/mm.ts
export type CategoryKey = "chabad" | "mizrahi" | "soft" | "fun";

export function isCat(x: any): x is CategoryKey {
  return x === "chabad" || x === "mizrahi" || x === "soft" || x === "fun";
}

export function getInitialCategory(): CategoryKey {
  if (typeof window === "undefined") return "fun";
  const url = new URL(window.location.href);
  const p =
    url.searchParams.get("cat") || localStorage.getItem("mm-cat") || "fun";
  return isCat(p) ? (p as CategoryKey) : "fun";
}

export function setCatInUrl(cat: CategoryKey, replace = true) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("cat", cat);
  const fn = replace ? "replaceState" : "pushState";
  window.history[fn](null, "", url.toString());
  localStorage.setItem("mm-cat", cat);
}
