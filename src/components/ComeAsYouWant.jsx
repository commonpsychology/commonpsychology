// src/components/ComeAsYouAreBanner.jsx
import { useEffect } from 'react'
import { useLang } from '../context/LanguageContext'

/* ─────────────────────────────────────────────────────────────
   COPY (EN / NP)
   ───────────────────────────────────────────────────────────── */
const COPY = {
  EN: {
    line1: "YOU DON'T NEED A CRISIS",
    line2: 'TO REACH OUT',
    sub:   'No problem too small, no moment too soon — come exactly as you are.',
  },
  NP: {
    line1: 'सङ्कट पर्खनु पर्दैन',
    line2: 'सम्पर्क गर्न',
    sub:   'कुनै समस्या सानो होइन, कुनै समय चाँडो होइन — जस्तो हुनुहुन्छ त्यस्तै आउनुहोस्।',
  },
}

/* ─────────────────────────────────────────────────────────────
   CSS
   ───────────────────────────────────────────────────────────── */
const CAYA_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,600&display=swap');

  @keyframes caya-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes caya-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes caya-glow-pulse {
    0%,100% { opacity: 0.35; transform: translate(-50%,-50%) scale(1); }
    50%      { opacity: 0.6;  transform: translate(-50%,-50%) scale(1.06); }
  }

  .caya-section {
    position: relative;
    overflow: hidden;
    padding: 56px 24px;
    text-align: center;
    background: linear-gradient(135deg, #003a5c 0%, #005f8a 50%, #007BA8 100%);
  }
  .caya-glow {
    position: absolute; top: 50%; left: 50%;
    width: 520px; height: 260px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,191,255,0.28) 0%, rgba(0,159,212,0.10) 55%, transparent 75%);
    transform: translate(-50%,-50%);
    animation: caya-glow-pulse 3.6s ease-in-out infinite;
    pointer-events: none;
  }
  .caya-inner {
    position: relative;
    z-index: 2;
    max-width: 780px;
    margin: 0 auto;
    animation: caya-fade-up 0.8s ease both;
  }
  .caya-heading {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic;
    font-weight: 600;
    font-size: clamp(1.6rem, 4vw, 2.75rem);
    line-height: 1.25;
    letter-spacing: 0.06em;
    margin: 0 0 18px;
    background: linear-gradient(100deg, #ffffff 0%, #9fe8ff 35%, #ffffff 60%, #9fe8ff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: caya-shimmer 4s linear infinite;
    text-shadow: 0 2px 24px rgba(0,80,130,0.35);
  }
  .caya-heading.lang-np {
    font-family: var(--font-display), 'Noto Sans Devanagari', serif;
    letter-spacing: 0.02em;
  }
  .caya-sub {
    font-family: var(--font-body, system-ui), sans-serif;
    font-weight: 500;
    font-size: clamp(0.85rem, 1.6vw, 1.05rem);
    letter-spacing: 0.03em;
    color: rgba(221, 238, 248, 0.88);
    margin: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .caya-heading, .caya-glow, .caya-inner { animation: none !important; }
  }
`

function injectCSS(id, css) {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  const el = document.createElement('style')
  el.id = id
  el.textContent = css
  document.head.appendChild(el)
}

export default function ComeAsYouAreBanner() {
  const { lang } = useLang()
  const c = COPY[lang] ?? COPY.EN

  useEffect(() => {
    injectCSS('caya-banner-css', CAYA_CSS)
  }, [])

  return (
    <section className="caya-section">
      <div className="caya-glow" />
      <div className="caya-inner">
        <h2 className={`caya-heading${lang === 'NP' ? ' lang-np' : ''}`}>
          {c.line1}
          <br />
          {c.line2}
        </h2>
        <p className="caya-sub">{c.sub}</p>
      </div>
    </section>
  )
}