// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/gallery",
  "/pricing",
  "/events",
  "/playlists",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
];
const AUTH_PAGES = [
  "/auth/login",
  "/auth/register",
  "/auth/signin",
  "/auth/signup",
];
const PROTECTED_PREFIXES = [
  "/book",
  "/songs",
  "/events",
  "/profile",
  "/checkout",
];
const ADMIN_PREFIXES = ["/admin", "/dashboard", "/api/admin"];

function hasSessionCookie(req: NextRequest) {
  return Boolean(
    req.cookies.get("next-auth.session-token") ||
      req.cookies.get("__Secure-next-auth.session-token")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // NextAuth/סטטי
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/images")
  )
    return NextResponse.next();

  // אם אנחנו בדף הבית ויש auth=1:
  if (pathname === "/" && searchParams.has("auth")) {
    const token = await getToken({ req });
    const hasCookie = hasSessionCookie(req);
    // מחובר? ננקה את הפרמטר בצד שרת
    if (token || hasCookie) {
      const url = req.nextUrl.clone();
      url.searchParams.delete("auth");
      return NextResponse.redirect(url);
    }
    // אורח? נשאיר את הפרמטר כדי להציג Splash
    return NextResponse.next();
  }

  // עמודי auth → תמיד הביתה; אורח יקבל ?auth=1
  if (AUTH_PAGES.includes(pathname)) {
    const token = await getToken({ req });
    const url = req.nextUrl.clone();
    url.pathname = "/";
    if (token || hasSessionCookie(req)) url.searchParams.delete("auth");
    else url.searchParams.set("auth", "1");
    return NextResponse.redirect(url);
  }

  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();

  const needsAuth =
    PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) ||
    ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  if (!needsAuth) return NextResponse.next();

  const token = await getToken({ req });
  const hasCookie = hasSessionCookie(req);

  if (!token && !hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("auth", "1");
    return NextResponse.redirect(url);
  }

  if (ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    const role = (token as any)?.role;
    if (role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.delete("auth");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
