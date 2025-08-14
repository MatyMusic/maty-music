// src/components/layout/Header.tsx
'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()
  const { data: session, status } = useSession()

  const [mounted, setMounted] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [pagesOpen, setPagesOpen] = useState(false)
  const [year, setYear] = useState<number | null>(null)
  const pagesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => setIsDark(resolvedTheme === 'dark'), [resolvedTheme])
  useEffect(() => setYear(new Date().getFullYear()), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => e.key === 'Escape' && setPagesOpen(false)
    const onClick = (e: MouseEvent) => {
      if (!pagesRef.current) return
      if (!pagesRef.current.contains(e.target as Node)) setPagesOpen(false)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('mousedown', onClick)
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('mousedown', onClick) }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  const navBtn = 'btn px-4 py-2 rounded-2xl border transition border-slate-300 dark:border-white/10 hover:opacity-90'
  const mobileItem = 'btn w-full justify-start rounded-2xl border border-slate-300 dark:border-white/10 bg-white text-slate-900 dark:bg-neutral-900 dark:text-slate-100'

  return (
    <header className={'sticky top-0 z-50 border-b ' + (isDark ? 'bg-neutral-950 border-white/10' : 'bg-white border-slate-200/60')}>
      <div className={'container-section flex items-center justify-between transition-all ' + (scrolled ? 'h-14 shadow-sm' : 'h-16')}>
        <Link href="/" className="flex items-center gap-3">
          <img src="/assets/logo/maty-music-wordmark.svg" alt="MATY MUSIC" className="h-12 md:h-14 w-auto" />
        </Link>

        {/* דסקטופ */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/book" className="btn bg-brand text-white border-0 hover:opacity-90">הזמן הופעה</Link>

          <div className="relative" ref={pagesRef}>
            <button
              className={`${navBtn} ${['/playlists','/gallery','/pricing','/events'].some(isActive) ? 'ring-2 ring-brand' : ''}`}
              onClick={() => setPagesOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={pagesOpen}
            >
              דפים ▾
            </button>
            {pagesOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-neutral-950 shadow-2xl p-2 text-right z-[60]">
                <Link href="/playlists" className={`${navBtn} w-full justify-start`} onClick={() => setPagesOpen(false)}>פלייליסטים</Link>
                <Link href="/gallery"   className={`${navBtn} w-full justify-start`} onClick={() => setPagesOpen(false)}>גלריה</Link>
                <Link href="/pricing"   className={`${navBtn} w-full justify-start`} onClick={() => setPagesOpen(false)}>מחירון</Link>
                <Link href="/events"    className={`${navBtn} w-full justify-start`} onClick={() => setPagesOpen(false)}>אירועים</Link>
              </div>
            )}
          </div>

          {/* אם מחובר – שם/תמונה + התנתק. אם אורח – לא מציגים כלום */}
          {status !== 'loading' && session && (
            <div className="ml-auto flex items-center gap-3">
              {session.user?.image ? (
                <img src={session.user.image!} alt={session.user?.name ?? 'User'} className="h-9 w-9 rounded-full object-cover border" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-gray-300" />
              )}
              <span className="font-medium truncate max-w-[140px]" title={session.user?.name ?? ''}>
                {session.user?.name ?? session.user?.email ?? 'משתמש'}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition"
              >
                התנתק
              </button>
            </div>
          )}

          <Link href="/about"   className={`${navBtn} ${isActive('/about')   ? 'ring-2 ring-brand' : ''}`}>אודות</Link>
          <Link href="/contact" className={`${navBtn} ${isActive('/contact') ? 'ring-2 ring-brand' : ''}`}>צור קשר</Link>

          <button className="btn" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
            {mounted ? (isDark ? 'מצב בהיר' : 'מצב כהה') : 'מצב תצוגה'}
          </button>
        </nav>

        {/* מובייל */}
        <button className="md:hidden btn" onClick={() => setOpen(true)} aria-label="פתח תפריט">☰</button>
      </div>

      {/* מגירת מובייל */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[120]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/80" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] bg-white dark:bg-neutral-950 shadow-2xl border-l border-slate-200 dark:border-white/10">
            <div className="p-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
              <img src="/assets/logo/mg-mark.svg" alt="MG" className="h-8 w-auto" />
              <button className="btn" onClick={() => setOpen(false)} aria-label="סגור">✕</button>
            </div>

            <div className="p-4 flex flex-col gap-2 text-right">
              {/* אם מחובר – פרופיל + התנתק. אם אורח – לא מציגים כלום */}
              {status !== 'loading' && session && (
                <div className="flex items-center gap-3 p-2 rounded-2xl border border-black/10 dark:border-white/10">
                  {session.user?.image ? (
                    <img src={session.user.image!} alt={session.user?.name ?? 'User'} className="h-9 w-9 rounded-full object-cover border" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-gray-300" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium truncate" title={session.user?.name ?? ''}>
                      {session.user?.name ?? session.user?.email ?? 'משתמש'}
                    </div>
                    <button
                      onClick={() => { setOpen(false); signOut({ callbackUrl: '/' }); }}
                      className="text-sm text-red-500 hover:underline mt-0.5"
                    >
                      התנתק
                    </button>
                  </div>
                </div>
              )}

              <Link href="/" className={mobileItem} onClick={() => setOpen(false)}>בית</Link>
              <Link href="/book" className="btn w-full justify-start rounded-2xl bg-brand text-white border-0 hover:opacity-90" onClick={() => setOpen(false)}>הזמן הופעה</Link>

              <div className="mt-2 font-semibold opacity-80">דפים</div>
              <Link href="/playlists" className={mobileItem} onClick={() => setOpen(false)}>פלייליסטים</Link>
              <Link href="/gallery"   className={mobileItem} onClick={() => setOpen(false)}>גלריה</Link>
              <Link href="/pricing"   className={mobileItem} onClick={() => setOpen(false)}>מחירון</Link>
              <Link href="/events"    className={mobileItem} onClick={() => setOpen(false)}>אירועים</Link>

              <div className="mt-2 font-semibold opacity-80">מידע</div>
              <Link href="/about"    className={mobileItem} onClick={() => setOpen(false)}>אודות</Link>
              <Link href="/contact"  className={mobileItem} onClick={() => setOpen(false)}>צור קשר</Link>

              <div className="mt-auto p-4 text-xs opacity-60 text-right border-t border-black/10 dark:border-white/10">
                {year !== null && <>© {year} MATY MUSIC</>}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
