// src/components/ContactSection.tsx
'use client'
import { useState } from 'react'
import { CONTACT } from '@/lib/constants'

export default function ContactSection() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState<'ok'|'err'|null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setSent(null)
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone, email, message }),
      })
      if (!r.ok) throw new Error()
      setSent('ok')
      setFullName(''); setPhone(''); setEmail(''); setMessage('')
    } catch { setSent('err') } finally { setLoading(false) }
  }

  return (
    <section id="contact" className="section-padding">
      <div className="container-section">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-2xl font-extrabold mb-2 text-right">צור קשר</h2>
            <form className="grid gap-3 text-right" onSubmit={submit}>
              <label className="grid gap-1">
                <span className="text-sm opacity-80">שם מלא</span>
                <input className="input-base input-rtl" required value={fullName} onChange={e=>setFullName(e.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">טלפון</span>
                  <input className="input-base input-ltr" required value={phone} onChange={e=>setPhone(e.target.value)} />
                </label>
                <label className="grid gap-1">
                  <span className="text-sm opacity-80">אימייל</span>
                  <input className="input-base input-ltr" type="email" value={email} onChange={e=>setEmail(e.target.value)} />
                </label>
              </div>
              <label className="grid gap-1">
                <span className="text-sm opacity-80">הודעה</span>
                <textarea className="input-base input-rtl rounded-2xl" rows={4} value={message} onChange={e=>setMessage(e.target.value)} />
              </label>
              <div className="flex justify-end gap-2">
                <a href={CONTACT.whatsapp} target="_blank" className="btn bg-emerald-500 text-white border-0 hover:opacity-90">ווטסאפ</a>
                <button className="btn" disabled={loading}>{loading?'שולח…':'שלח'}</button>
              </div>
              {sent==='ok'  && <div className="text-green-600 dark:text-green-400 text-sm">נשלח! נדבר בקרוב.</div>}
              {sent==='err' && <div className="text-red-600 dark:text-red-400 text-sm">משהו השתבש בשליחה.</div>}
            </form>
          </div>

          <div className="card">
            <div className="text-right">
              <div className="font-semibold">פרטים מהירים</div>
              <div className="mt-2 text-sm opacity-80">טלפון: {CONTACT.phoneLocal}</div>
              <div className="text-sm opacity-80">אימייל: {CONTACT.email}</div>
              <div className="mt-3 flex gap-2 justify-end">
                <a className="btn" href={CONTACT.whatsapp} target="_blank">וואטסאפ</a>
                <a className="btn" href={`mailto:${CONTACT.email}`}>מייל</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
