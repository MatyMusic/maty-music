// src/components/PricingSection.tsx
'use client'

import Link from 'next/link'
import { BASE_PRICE, CATEGORY_LABEL, CategoryKey } from '@/lib/pricing'

const CATS: CategoryKey[] = ['chabad','mizrahi','soft','fun']

const FEATURES: Record<CategoryKey, string[]> = {
  chabad: ['ניגונים חסידיים', 'התוועדות/ריקודים', 'מוביל קהל', 'אפשרות חופה'],
  mizrahi: ['ים־תיכוני חי', 'הוקי קהל', 'מקצבים דרבוקה/תופים', 'סט הרחבה'],
  soft: ['בלדות/ליווי', 'צליל נקי ושקט', 'טקס/קבלת פנים', 'מינימום רעש'],
  fun: ['סטים מקפיצים', 'מעברים חדים', 'אנרגיה גבוהה', 'אינטראקציה מלאה'],
}

export default function PricingSection() {
  return (
    <section className="section-padding" id="pricing">
      <div className="container-section">
        <div className="mb-6 text-right">
          <h1 className="text-3xl md:text-4xl font-extrabold">מחירון לפי קטגוריות</h1>
          <p className="opacity-80 mt-1">6 שעות בסיס + אפשרות הרחבה. המחיר מתעדכן לפי פרטי האירוע.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATS.map((k) => (
            <div key={k} className="card flex flex-col">
              <div className="text-xl font-extrabold text-right">{CATEGORY_LABEL[k]}</div>
              <div className="mt-1 text-3xl font-black text-right">
                ₪{BASE_PRICE[k].toLocaleString()}
                <span className="text-sm opacity-60 mr-1">/  6 שעות</span>
              </div>
              <ul className="mt-4 space-y-2 text-right opacity-90">
                {FEATURES[k].map((f) => <li key={f}>• {f}</li>)}
              </ul>
              <div className="mt-auto pt-4 flex justify-end">
                <Link href={`/book?category=${k}`} className="btn bg-brand text-white border-0 hover:opacity-90">
                  הזמן עכשיו
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-xs opacity-70 text-right">
          * תוספות אפשריות: שעות נוספות, תוספת נגנים, נסיעות, גודל קהל. סופ״ש/מועד דחוף עשויים להשפיע.
        </div>
      </div>
    </section>
  )
}
