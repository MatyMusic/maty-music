// src/components/ContactDock.tsx
'use client'
import { CONTACT } from '@/lib/constants'
import { ReactNode } from 'react'

function Tip({ children }: { children: ReactNode }) {
  return (
    <span
      className="absolute top-1/2 -translate-y-1/2 -right-2 translate-x-full
                 whitespace-nowrap text-xs px-2 py-1 rounded-xl
                 bg-black/80 text-white opacity-0 group-hover:opacity-100
                 transition-opacity"
    >
      {children}
    </span>
  )
}

export default function ContactDock() {
  const mailto = `mailto:${CONTACT.email}?subject=${CONTACT.emailSubject}&body=${CONTACT.emailBody}`

  const btn =
    'group relative flex items-center justify-center w-12 h-12 rounded-full border backdrop-blur ' +
    'bg-white/90 border-slate-200 shadow-md hover:shadow-lg ' +
    'dark:bg-white/10 dark:border-white/15 hover:scale-105 transition'

  const icon = 'w-6 h-6'

  return (
    <aside
      className="fixed left-3 top-1/2 -translate-y-1/2 z-[120] flex flex-col gap-2 pointer-events-auto"
      aria-label="יצירת קשר מהיר"
    >
      {/* WhatsApp */}
      <a
        href={CONTACT.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="ווצאפ"
        title={`ווצאפ: ${CONTACT.phoneLocal}`}
      >
        <svg className={icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M.05 23.39 1.7 17.3A11.42 11.42 0 1 1 4.7 20.3L.05 23.4zM6.6 19a9.42 9.42 0 1 0-2.9-2.9l-.2.3-1 3.8 3.9-1 .2-.2z"/>
          <path d="M16.6 13.6c-.2-.1-1.3-.6-1.5-.7-.2 0-.3-.1-.5.1-.1.2-.6.7-.7.8-.1.1-.3.2-.6.1a7.6 7.6 0 0 1-3.4-2.1 7.8 7.8 0 0 1-1.6-2.1c-.2-.4 0-.6.1-.7l.4-.5c.2-.2.2-.4.3-.5l.1-.4c0-.1 0-.3 0-.5 0-.2-.5-.4-.6-.4h-.5c-.2 0-.5.1-.7.3A2.2 2.2 0 0 0 6 8.1c0 .3.1.7.2 1 .4 1 .9 1.9 1.6 2.8a12 12 0 0 0 3.7 3.3c.4.2.9.5 1.3.7.5.2 1 .4 1.6.3.4 0 1-.4 1.2-.9.2-.4.2-.8.1-.9 0-.1-.2-.1-.3-.2z"/>
        </svg>
        <Tip>ווצאפ: {CONTACT.phoneLocal}</Tip>
      </a>

      {/* Phone */}
      <a href={`tel:${CONTACT.phoneE164}`} className={btn} aria-label="טלפון" title={`התקשר: ${CONTACT.phoneLocal}`}>
        <svg className={icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M6.6 10.8a15.3 15.3 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.3 1.2.3 2.6.5 4 .5.6 0 1 .4 1 .9v3.7c0 .6-.4 1-1 1A19.5 19.5 0 0 1 2 4c0-.6.4-1 1-1h3.8c.5 0 .9.4.9 1 0 1.4.2 2.7.5 4 .1.4 0 .8-.3 1.1l-2.3 2.2z"/>
        </svg>
        <Tip>התקשר: {CONTACT.phoneLocal}</Tip>
      </a>

      {/* Messenger */}
      <a
        href={CONTACT.messenger}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        aria-label="מסנג'ר"
        title="Messenger"
      >
        <svg className={icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.5 2 2 6 2 10.6c0 2.7 1.5 5 3.8 6.6v4.7l4.2-2.3c.6.1 1.3.2 2 .2 5.5 0 10-4.5 10-9.9S17.5 2 12 2zm.8 9.7L9.8 8.8l-4 3.9L9 9.4l3 2 4.5-2.1-3.7 4.1z"/>
        </svg>
        <Tip>Messenger</Tip>
      </a>

      {/* Email */}
      <a href={mailto} className={btn} aria-label="מייל" title={CONTACT.email}>
        <svg className={icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M2 5h20a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm10 6 9-5H3l9 5zm0 2-9-5v8h18v-8l-9 5z"/>
        </svg>
        <Tip>{CONTACT.email}</Tip>
      </a>

      {/* VCF – הוסף לאנשי קשר */}
      <a
        href={CONTACT.vcfPath}
        download
        className={btn}
        aria-label="הוסף לאנשי קשר"
        title="הוסף לאנשי קשר (VCF)"
      >
        <svg className={icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 8a7 7 0 0 1 14 0v1H5zM20 2H8a2 2 0 0 0-2 2v3h2V4h12v16h-3v2h3a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
        </svg>
        <Tip>הוסף לאנשי קשר</Tip>
      </a>
    </aside>
  )
}
