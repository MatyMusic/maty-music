// src/components/auth/RegisterForm.tsx
'use client'

export default function RegisterForm() {
  return (
    <form
      className="grid gap-3 text-right"
      onSubmit={(e) => {
        e.preventDefault()
        alert('נרשמת בהצלחה (דמו). בהמשך נחבר ל-NextAuth + DB.')
      }}
    >
      <label className="grid gap-1">
        <span className="text-sm opacity-80">שם מלא</span>
        <input required className="input-base input-rtl" />
      </label>

      <label className="grid gap-1">
        <span className="text-sm opacity-80">טלפון</span>
        <input required type="tel" className="input-base input-ltr" inputMode="tel" />
      </label>

      <label className="grid gap-1">
        <span className="text-sm opacity-80">אימייל</span>
        <input required type="email" className="input-base input-ltr" inputMode="email" />
      </label>

      <label className="grid gap-1">
        <span className="text-sm opacity-80">סיסמה</span>
        <input required type="password" className="input-base input-ltr" />
      </label>

      <button className="btn mt-2">הרשמה</button>
    </form>
  )
}
