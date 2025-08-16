// src/app/(site)/about/page.tsx
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "על MATY-MUSIC",
  description: "אודות — מתי גורפינקל (MG) והפרויקט MATY-MUSIC",
};

export default function AboutPage() {
  return (
    <section className="section-padding">
      <div className="container-section">
        <div className="card">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 text-right">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">על MATY-MUSIC</h1>
              <p className="opacity-90">
                אני <b>מתי גורפינקל (MG)</b>, קלידן וזמר. אנחנו מרימים במה חיה לאירועים
                עם שילוב מנצח של סאונד איכותי, פלייליסטים מותאמים והובלת קהל —
                מהניגון החסידי, דרך ים־תיכוני ועד סטים מקפיצים בלי הפסקה.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-white/10">
                  <div className="font-semibold mb-1">מה אנחנו עושים</div>
                  <ul className="text-sm opacity-80 space-y-1">
                    <li>• הופעות חיות לאירועים</li>
                    <li>• חופות/שירותי במה</li>
                    <li>• הפקה מוזיקלית מלאה</li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-white/10">
                  <div className="font-semibold mb-1">סגנונות</div>
                  <ul className="text-sm opacity-80 space-y-1">
                    <li>• חסידי וחב״ד</li>
                    <li>• מזרחי/ים־תיכוני</li>
                    <li>• שקט/בלדות, סטים מקפיצים</li>
                  </ul>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200/60 dark:border-white/10">
                  <div className="font-semibold mb-1">למה אנחנו</div>
                  <ul className="text-sm opacity-80 space-y-1">
                    <li>• התאמה מלאה לקהל</li>
                    <li>• סאונד נקי ומקצועי</li>
                    <li>• אנרגיה וביצוע חי</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Link href="/contact" className="btn">צור קשר</Link>
                <Link href={{ pathname: "/", hash: "demos" }} className="btn">דמואים</Link>
              </div>
            </div>

            <Image
              src="/assets/logo/mg-mark.svg"
              alt="MG Logo"
              width={160}
              height={160}
              className="w-28 md:w-36 h-auto opacity-90"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
