'use client'

import { useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { calcQuote, CATEGORY_LABEL, CategoryKey, QuoteBreakdown, BASE_PRICE } from '@/lib/pricing'
import { CONTACT } from '@/lib/constants'

const CATS: CategoryKey[] = ['chabad','mizrahi','soft','fun']

export default function BookingForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const catFromUrl = (sp.get('category') as CategoryKey) || 'fun'

  // הזמנה
  const [category, setCategory] = useState<CategoryKey>(CATS.includes(catFromUrl) ? catFromUrl : 'fun')
  const [dateISO, setDateISO] = useState<string>('')
  const [hours, setHours] = useState<number>(2)
  const [guests, setGuests] = useState<number>(150)
  const [distanceKm, setDistanceKm] = useState<number>(0)
  const [chuppah, setChuppah] = useState(false)
  const [extraDjSet, setExtraDjSet] = useState(false)
  const [extraMusicians, setExtraMusicians] = useState(0)

  // לקוח
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')

  // מצב
  const [sent, setSent] = useState<'ok'|'err'|null>(null)
  const [loading, setLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [payLoading, setPayLoading] = useState(false)

  // תשלומים (1–12)
  const [installments, setInstallments] = useState<number>(1)

  // חישוב
  const breakdown: QuoteBreakdown | null = useMemo(() => {
    if (!dateISO) return null
    return calcQuote({
      category, dateISO, hours, guests, distanceKm,
      addons: { chuppah, extraDjSet, extraMusicians },
    })
  }, [category, dateISO, hours, guests, distanceKm, chuppah, extraDjSet, extraMusicians])

  // PDF
  async function downloadPdf() {
    try {
      setPdfLoading(true)
      const payload = {
        category, dateISO, hours, guests, distanceKm,
        addons: { chuppah, extraDjSet, extraMusicians }, breakdown
      }
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('pdf failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'maty-quote.pdf'
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      alert('לא הצלחתי להפיק PDF כרגע')
    } finally { setPdfLoading(false) }
  }

  // תשלום (PayPal – מעבר לצ'קאאוט)
  async function payNow() {
    if (!breakdown) return alert('בחר תאריך כדי לחשב מחיר.')
    if (!fullName || !phone) return alert('מלא שם וטלפון לפני תשלום.')

    setPayLoading(true)
    try {
      const orderId = `MATY-${Date.now()}`
      const total = breakdown.total
      const qs = new URLSearchParams({ orderId, amount: String(total) }).toString()
      router.push(`/checkout?${qs}`)
    } finally {
      setPayLoading(false)
    }
  }

  // שליחה לוגית
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setSent(null)
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category, dateISO, hours, guests, distanceKm,
          addons: { chuppah, extraDjSet, extraMusicians },
          fullName, phone, email, notes,
          breakdown,
        }),
      })
      if (!res.ok) throw new Error()
      setSent('ok')
    } catch {
      setSent('err')
    } finally { setLoading(false) }
  }

  const waText = encodeURIComponent(
    `הזמנת הופעה — MATY-MUSIC
קטגוריה: ${CATEGORY_LABEL[category]}
תאריך: ${dateISO || '—'}
משך: ${hours} שעות
קהל: ${guests}
מרחק נסיעה: ${distanceKm} ק״מ
תוספים: ${[
  chuppah ? 'חופה' : null,
  extraDjSet ? 'סט DJ נוסף' : null,
  extraMusicians > 0 ? `+${extraMusicians} נגנים` : null,
].filter(Boolean).join(', ') || '—'}
${breakdown ? `מחיר משוער: ₪${breakdown.total.toLocaleString()}` : `מחיר בסיס: ₪${BASE_PRICE[category].toLocaleString()}`}
—
שם: ${fullName || '—'}
טלפון: ${phone || '—'}
אימייל: ${email || '—'}
הערות: ${notes || '—'}`
  )

  return (
    <section className="section-padding">
      <div className="container-section">
        <div className="grid md:grid-cols-2 gap-6">
          {/* טופס */}
          <form className="card grid gap-3 text-right" onSubmit={submit}>
            <h1 className="text-3xl font-extrabold">הזמן הופעה</h1>
            <p className="opacity-80 -mt-1">בחר קטגוריה ומלא פרטים — נקבל הצעת מחיר חיה.</p>

            {/* קטגוריה */}
            <label className="grid gap-1">
              <span className="text-sm opacity-80">קטגוריה</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATS.map((k) => (
                  <button
                    type="button"
                    key={k}
                    className={`btn w-full ${category === k ? 'ring-2 ring-brand bg-white/70 dark:bg-white/10' : ''}`}
                    onClick={() => setCategory(k)}
                  >
                    {CATEGORY_LABEL[k]}
                  </button>
                ))}
              </div>
            </label>

            {/* תאריך + שעות */}
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-sm opacity-80">תאריך</span>
                <input required type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)} className="input-base input-rtl" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm opacity-80">משך (שעות)</span>
                <input type="number" min={1} max={10} value={hours} onChange={(e) => setHours(Number(e.target.value))} className="input-base input-ltr" />
              </label>
            </div>

            {/* קהל + מרחק */}
            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-1">
                <span className="text-sm opacity-80">גודל קהל (משוער)</span>
                <input type="number" min={1} value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="input-base input-ltr" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm opacity-80">מרחק נסיעה (ק״מ)</span>
                <input type="number" min={0} value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))} className="input-base input-ltr" />
              </label>
            </div>

            {/* תוספים */}
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="flex gap-2 items-center">
                <input type="checkbox" checked={chuppah} onChange={(e) => setChuppah(e.target.checked)} />
                חופה (+₪1,200)
              </label>
              <label className="flex gap-2 items-center">
                <input type="checkbox" checked={extraDjSet} onChange={(e) => setExtraDjSet(e.target.checked)} />
                סט DJ נוסף (+₪1,500)
              </label>
              <label className="flex gap-2 items-center">
                נגנים נוספים:
                <input type="number" min={0} value={extraMusicians} onChange={(e) => setExtraMusicians(Number(e.target.value))}
                  className="w-20 rounded-xl border px-3 py-1 bg-white/70 dark:bg-white/5 input-ltr focus:outline-none focus:ring-2 focus:ring-brand/60 border-slate-300 dark:border-white/10" />
                × ₪1,800
              </label>
            </div>

            {/* פרטי קשר */}
            <div className="grid sm:grid-cols-3 gap-3">
              <label className="grid gap-1">
                <span className="text-sm opacity-80">שם מלא</span>
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-base input-rtl" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm opacity-80">טלפון</span>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-base input-ltr" inputMode="tel" />
              </label>
              <label className="grid gap-1">
                <span className="text-sm opacity-80">אימייל</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-base input-ltr" inputMode="email" />
              </label>
            </div>

            {/* הערות */}
            <label className="grid gap-1">
              <span className="text-sm opacity-80">הערות</span>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="input-base input-rtl rounded-2xl" />
            </label>

            {/* תשלומים */}
            <label className="grid gap-1">
              <span className="text-sm opacity-80">מספר תשלומים</span>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="input-base input-ltr rounded-2xl"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </label>

            {/* פעולות */}
            <div className="flex flex-wrap justify-end gap-2">
              <a href={`https://wa.me/${CONTACT.phoneE164.replace('+','')}?text=${waText}`} target="_blank" rel="noopener noreferrer" className="btn bg-emerald-500 text-white border-0 hover:opacity-90">
                שלח בוואטסאפ
              </a>
              <button type="button" className="btn" onClick={downloadPdf} disabled={!breakdown || pdfLoading}>
                {pdfLoading ? 'מכין PDF…' : 'הורד PDF'}
              </button>
              <button type="button" className="btn bg-brand text-white border-0 hover:opacity-90" onClick={payNow} disabled={!breakdown || payLoading}>
                {payLoading ? 'פותח תשלום…' : 'שלם עכשיו'}
              </button>
              <button className="btn" disabled={loading}>
                {loading ? 'שולח…' : 'שלח טופס'}
              </button>
            </div>

            {sent === 'ok' && <div className="text-green-600 dark:text-green-400 text-sm">נשלח! נחזור אליך בהקדם.</div>}
            {sent === 'err' && <div className="text-red-600 dark:text-red-400 text-sm">קרתה תקלה בשליחה.</div>}
          </form>

          {/* סיכום מחיר */}
          <div className="card">
            <div className="text-right">
              <div className="text-2xl font-extrabold">הצעת מחיר חיה</div>
              <div className="opacity-80">מבוסס על הפרטים שמילאת</div>

              {!breakdown ? (
                <div className="mt-4 text-sm opacity-80">בחר תאריך כדי לחשב מחיר משוער.</div>
              ) : (
                <div className="mt-4 space-y-2 text-sm">
                  <Row label="בסיס" val={breakdown.base} />
                  <Row label="שעות נוספות" val={breakdown.extraHours} />
                  <Row label="גודל קהל" val={breakdown.audience} />
                  <Row label="נסיעות" val={breakdown.travel} />
                  <Row label="תוספים" val={breakdown.addons} />
                  <Row label="סופ״ש" val={breakdown.weekend} />
                  <Row label="דחוף/מוקדם" val={breakdown.rush + breakdown.early} />
                  <hr className="my-2 border-white/10" />
                  <Row label="סיכום ביניים" val={breakdown.subtotal} />
                  <div className="text-lg font-extrabold mt-2">סה״כ משוער: ₪{breakdown.total.toLocaleString()}</div>
                  <div className="opacity-70 mt-1">* המחיר הסופי ייסגר לאחר שיחה קצרה ותיאום לוגיסטיקה.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Row({ label, val }: { label: string; val: number }) {
  const sign = val >= 0 ? '' : '−'
  const n = Math.abs(val)
  return (
    <div className="flex items-center justify-between">
      <span className="opacity-80">{label}</span>
      <span className="font-semibold">₪{sign}{n.toLocaleString()}</span>
    </div>
  )
}
