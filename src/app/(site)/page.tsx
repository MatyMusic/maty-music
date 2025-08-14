// src/app/(site)/page.tsx
import Hero3D from "@/components/Hero3D";

export default function HomePage() {
  return (
    <>
      {/* HERO 3D (Client Component) */}
      <section className="relative overflow-hidden">
        <div className="container-section section-padding">
          <Hero3D />
        </div>
      </section>

      {/* תוכן סטטי בטוח (בלי טיימרים/Date.now/Math.random) */}
      <section className="container-section section-padding text-center">
        <img
          src="/assets/logo/maty-music-wordmark.svg"
          alt="MATY MUSIC"
          className="mx-auto h-14 w-auto mb-6"
        />
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
          מוזיקה חיה. חוויה אמיתית.
        </h1>
        <p className="mt-3 opacity-80">
          בחרו פלייליסט, הזמינו הופעה, ותנו לנו לעשות את הקסם.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <a href="/book" className="btn bg-brand text-white border-0 hover:opacity-90">
            הזמן הופעה
          </a>
          <a href="/playlists" className="btn">פלייליסטים</a>
        </div>
      </section>

      <section className="container-section section-padding">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card p-4">
            <h3 className="font-bold mb-2">אירועים</h3>
            <p className="opacity-80">חתונות, חינה, בר/בת מצווה — אנחנו מכסים אותך.</p>
          </div>
          <div className="card p-4">
            <h3 className="font-bold mb-2">מחירון</h3>
            <p className="opacity-80">תמחור שקוף וגמיש לכל סוג אירוע.</p>
          </div>
          <div className="card p-4">
            <h3 className="font-bold mb-2">גלריה</h3>
            <p className="opacity-80">תמונות אמיתיות מאירועים שלנו.</p>
          </div>
        </div>
      </section>
    </>
  );
}
