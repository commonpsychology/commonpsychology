import { useEffect, useState } from 'react'
import { useRouter } from '../context/RouterContext'
import { useLang } from '../context/LanguageContext'
import { useSiteStats } from '../hooks/useSiteStats'
import MindfulClock from './MindClock'

/* ─────────────────────────────────────────────────────────────
   HERO COPY  (EN / NP)
───────────────────────────────────────────────────────────── */
const HERO_COPY = {
  EN: {
    badge:           "WORKING FOR THE PEACE OF MIND GLOBALLY",
    h1_our:          'Our ',
    h1_help:         'Help',
    h1_your:         ', Your ',
    h1_choice:       'Choice',
    desc:            'Professional therapy, self-assessment tools, and wellness resources , all in one compassionate space. Connect with certified therapists from the comfort of your home.Connect if you feel we can help and understand you.',
    btn_book:        'Book a Free Consultation →',
    btn_assess:      'Take an Assessment',
    stat_clients:    'Clients Helped',
    stat_therapists: 'Expert Therapists',
    stat_rating:     'Average Rating',
    pill_families:   '❤️  500+ families healed',
    pill_rating:     '4.9 ★ rated',
    parent_title:    "I'm a Parent",
    parent_sub:      'For families',
    parent_body:     "My child has changed. I don't know how to reach them.",
    parent_cta:      'Free 15-min call',
    teen_title:      "I'm a Teen",
    teen_sub:        'For adolescents',
    teen_body:       "I feel so much but can't explain it to anyone.",
    teen_cta:        'Someone who listens',
    map_label:       'Find Our Office',
    hours:           'Sun \u2013 Fri \u00a0|\u00a0 9:00 AM \u2013 6:00 PM NPT',
    open_maps:       'Open in Google Maps',
  },
  NP: {
    badge:           'विश्व शान्तिका लागि कार्यरत',
    h1_our:          'हाम्रो ',
    h1_help:         'सहयोग',
    h1_your:         ', तपाईंको ',
    h1_choice:       'रोजाइ',
    desc:            'व्यावसायिक थेरापी, स्व-मूल्यांकन उपकरण र स्वास्थ्य सम्पदाहरू — एउटै करुणाशील ठाउँमा। प्रमाणित थेरापिस्टहरूसँग आफ्नै घरको आरामबाट जोडिनुहोस्।यदि हामी तपाईंलाई सहयोग गर्न र बुझ्न सक्छौं जस्तो लाग्छ भने मात्र जोडिनुहोस्।',
    btn_book:        'निःशुल्क परामर्श बुक गर्नुहोस् →',
    btn_assess:      'मूल्यांकन गर्नुहोस्',
    stat_clients:    'सहयोग पाएका ग्राहकहरू',
    stat_therapists: 'विशेषज्ञ थेरापिस्टहरू',
    stat_rating:     'औसत मूल्यांकन',
    pill_families:   '❤️  ५०० भन्दा बढी परिवार निको भए',
    pill_rating:     '४.९ ★ मूल्यांकन',
    parent_title:    'म अभिभावक हुँ',
    parent_sub:      'परिवारका लागि',
    parent_body:     'मेरो बच्चा बदलिएको छ। म उनीसँग कसरी जोडिने बुझ्दिनँ।',
    parent_cta:      'निःशुल्क १५-मिनेट कल',
    teen_title:      'म किशोर/किशोरी हुँ',
    teen_sub:        'किशोरहरूका लागि',
    teen_body:       'मैले धेरै महसुस गर्छु तर कसैलाई बुझाउन सक्दिनँ।',
    teen_cta:        'सुन्ने कोही छ',
    map_label:       'हाम्रो कार्यालय खोज्नुहोस्',
    hours:           'आइत \u2013 शुक्र \u00a0|\u00a0 बिहान ९ \u2013 साँझ ६ बजे NPT',
    open_maps:       'गुगल म्यापमा खोल्नुहोस्',
  },
}

/* ─────────────────────────────────────────────────────────────
   CSS
───────────────────────────────────────────────────────────── */
const HEART_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap');

  @keyframes hb-beat {
    0%,100% { transform: scale(1); }
    15%      { transform: scale(1.13); }
    30%      { transform: scale(1.01); }
    45%      { transform: scale(1.08); }
    60%      { transform: scale(1); }
  }
  @keyframes hb-pulse-ring {
    0%   { transform: translate(-50%,-50%) scale(0.82); opacity: 0.65; }
    100% { transform: translate(-50%,-50%) scale(1.6);  opacity: 0; }
  }
  @keyframes hb-flow {
    from { stroke-dashoffset: 600; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes hb-ekg {
    from { stroke-dashoffset: 520; }
    to   { stroke-dashoffset: -520; }
  }
  @keyframes hb-drop {
    0%   { opacity: 0; transform: translateY(-10px) scale(0.8) rotate(-45deg); }
    30%  { opacity: 0.9; }
    100% { opacity: 0; transform: translateY(14px) scale(1.1) rotate(-45deg); }
  }
  @keyframes hb-glow-pulse {
    0%,100% { opacity: 0.3; transform: translate(-50%,-50%) scale(1); }
    50%      { opacity: 0.55; transform: translate(-50%,-50%) scale(1.08); }
  }
  @keyframes hb-float {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-7px); }
  }
  @keyframes hb-float-r {
    0%,100% { transform: translateY(0px); }
    50%     { transform: translateY(-5px); }
  }
  @keyframes hb-card-in-l {
    from { opacity: 0; transform: translateX(-24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes hb-card-in-r {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes map-btn-bounce {
    0%,100% { transform: translateY(0) scale(1); }
    50%     { transform: translateY(-4px) scale(1.05); }
  }
  @keyframes map-btn-ping {
    0%   { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(2.2); opacity: 0; }
  }
  @keyframes map-popup-in {
    from { opacity: 0; transform: translateY(20px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes map-overlay-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ── H1 underline shimmer ── */
  @keyframes h1-shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }

  /* ── H1 fade-up on mount ── */
  @keyframes h1-fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (min-width: 1024px) {
    .hero-clock-wrapper {
      display: block !important;
    }
  }

  /* ══════════════════════════════════════
     H1 HEADING STYLES
  ══════════════════════════════════════ */
  .hero-heading {
    font-family: 'Playfair Display', Georgia, serif !important;
    font-size: clamp(2.4rem, 5vw, 3.6rem) !important;
    font-weight: 400 !important;
    line-height: 1.13 !important;
    letter-spacing: -0.015em !important;
    color: #ddeef8 !important;
    margin: 0 0 24px !important;
    animation: h1-fade-up 0.7s 0.15s cubic-bezier(0.22,1,0.36,1) both;
  }

  .hero-heading .h1-plain {
    color: #ffffff;
    font-weight: 400;
    font-style: normal;
  }

  .hero-heading .h1-accent-help {
    font-style: italic;
    font-weight: 600;
    background: linear-gradient(100deg, #00BFFF 0%, #5dd8ff 45%, #00BFFF 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: h1-shimmer 3.5s linear infinite;
    display: inline-block;
  }

  .hero-heading .h1-accent-choice {
    font-style: italic;
    font-weight: 600;
    background: linear-gradient(100deg, #38c8ff 0%, #7de8ff 45%, #38c8ff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: h1-shimmer 3.5s 0.6s linear infinite;
    display: inline-block;
    position: relative;
  }

  .hero-heading .h1-accent-choice::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: 2px;
    background: linear-gradient(90deg, rgba(0,191,255,0.0) 0%, rgba(0,191,255,0.55) 35%, rgba(120,225,255,0.7) 60%, rgba(0,191,255,0.0) 100%);
  }

  .hero-heading.lang-np {
    font-family: var(--font-display), 'Noto Sans Devanagari', serif !important;
    font-size: clamp(1.8rem, 4vw, 2.6rem) !important;
    letter-spacing: 0 !important;
  }
  .hero-heading.lang-np .h1-accent-choice::after {
    display: none;
  }

  /* ══════════════════════════════════════
     HEART VISUAL STYLES
  ══════════════════════════════════════ */
  .hb-visual-root {
    position: relative; width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
  }
  .hb-glow-blob {
    position: absolute; top: 50%; left: 50%;
    width: 380px; height: 380px; border-radius: 50%;
    background: radial-gradient(circle, rgba(0,191,255,0.28) 0%, rgba(0,159,212,0.12) 50%, transparent 75%);
    animation: hb-glow-pulse 2.4s ease-in-out infinite;
    pointer-events: none; z-index: 1;
  }
  .hb-pulse {
    position: absolute; top: 50%; left: 50%;
    border-radius: 50%; border: 1.5px solid rgba(0,191,255,0.4);
    pointer-events: none; z-index: 2;
    animation: hb-pulse-ring 2.2s ease-out infinite;
  }
  .hb-heart-svg {
    position: relative; z-index: 6;
    animation: hb-beat 1.5s ease-in-out infinite;
    filter: drop-shadow(0 0 32px rgba(0,191,255,0.5)) drop-shadow(0 6px 18px rgba(0,80,130,0.3));
  }
  .hb-vein { stroke-dasharray: 600; animation: hb-flow 2s linear infinite; }
  .hb-ekg-strip { stroke-dasharray: 520; animation: hb-ekg 2.4s linear infinite; }
  .hb-drop-particle {
    position: absolute; border-radius: 50% 50% 50% 0;
    pointer-events: none; z-index: 4;
    animation: hb-drop ease-in-out infinite;
  }

  /* ══════════════════════════════════════════════════════════
     CARD WRAPPER — anchored hit-area (never moves)
     This is the KEY fix: the wrapper stays in place so the
     cursor never accidentally leaves it when the inner card
     floats/lifts, eliminating the flicker loop.
  ══════════════════════════════════════════════════════════ */
  .hb-card-wrapper-parent {
    position: absolute;
    top: 50%;
    left: 0%;
    transform: translateY(-50%);
    z-index: 35;
    /* entrance animation only — NO float here */
    animation: hb-card-in-l 0.7s 0.5s ease both;
  }

  .hb-card-wrapper-teen {
    position: absolute;
    top: 50%;
    right: 0%;
    transform: translateY(-50%);
    z-index: 35;
    /* entrance animation only — NO float here */
    animation: hb-card-in-r 0.7s 0.8s ease both;
  }

  /* ══════════════════════════════════════════════════════════
     INNER CARD — floats and lifts on hover
     Hover is tracked on the WRAPPER above, so moving this
     element away from the cursor won't trigger mouseleave.
  ══════════════════════════════════════════════════════════ */
  .hb-persona-card {
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-radius: 18px; padding: 16px 20px; cursor: pointer;
    width: 175px;
    transition: background 0.28s ease, border-color 0.28s ease,
                box-shadow 0.28s ease,
                transform 0.32s cubic-bezier(0.34,1.56,0.64,1);
  }

  /* Float lives on the inner card — not the wrapper */
  .hb-persona-card-inner-parent {
    animation: hb-float 4.2s 0.5s ease-in-out infinite;
  }
  .hb-persona-card-inner-teen {
    animation: hb-float-r 3.7s 1s ease-in-out infinite;
  }

  /* Hover only scales — no translateY, so the card never
     escapes the wrapper's bounding box */
  .hb-card-wrapper-parent:hover .hb-persona-card,
  .hb-card-wrapper-teen:hover .hb-persona-card {
    transform: scale(1.04);
  }

  .hb-stat-pill {
    position: absolute;
    background: rgba(255,255,255,0.14); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.28); border-radius: 100px;
    padding: 5px 14px; z-index: 18; pointer-events: none; white-space: nowrap;
  }
  .map-fab {
    position: fixed; bottom: 32px; right: 32px;
    width: 58px; height: 58px; border-radius: 50%;
    background: linear-gradient(135deg, #007BA8 0%, #00BFFF 100%);
    border: none; cursor: pointer; z-index: 9000;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 6px 24px rgba(0,123,168,0.45), 0 2px 8px rgba(0,0,0,0.18);
    animation: map-btn-bounce 3s ease-in-out infinite;
    transition: box-shadow 0.2s ease, transform 0.2s ease; outline: none;
  }
  .map-fab:hover {
    box-shadow: 0 10px 36px rgba(0,123,168,0.6), 0 2px 12px rgba(0,0,0,0.22);
    animation: none; transform: scale(1.1);
  }
  .map-fab:active { transform: scale(0.95); }
  .map-fab-ping {
    position: fixed; bottom: 32px; right: 32px;
    width: 58px; height: 58px; border-radius: 50%;
    background: rgba(0,191,255,0.35); z-index: 8999;
    animation: map-btn-ping 2.2s ease-out infinite; pointer-events: none;
  }
  .map-fab-label {
    position: fixed; bottom: 98px; right: 28px;
    background: rgba(0,0,0,0.75); color: #fff;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 0.06em;
    padding: 5px 11px; border-radius: 100px;
    pointer-events: none; white-space: nowrap; z-index: 9001;
    backdrop-filter: blur(6px); opacity: 0; transform: translateY(6px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .map-fab:hover ~ .map-fab-label, .map-fab-label.visible { opacity: 1; transform: translateY(0); }
  .map-overlay {
    position: fixed; inset: 0; background: rgba(0,10,20,0.65);
    backdrop-filter: blur(6px); z-index: 9100;
    display: flex; align-items: center; justify-content: center;
    animation: map-overlay-in 0.25s ease both;
  }
  .map-popup {
    position: relative; width: min(720px, 94vw); height: min(540px, 88vh);
    border-radius: 22px; overflow: hidden; background: #0a1628;
    box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(0,191,255,0.18),
                inset 0 1px 0 rgba(255,255,255,0.08);
    animation: map-popup-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
    display: flex; flex-direction: column;
  }
  .map-popup-header {
    position: absolute; top: 0; left: 0; right: 0; z-index: 10;
    padding: 14px 18px 12px;
    background: linear-gradient(180deg, rgba(7,18,38,0.97) 60%, transparent 100%);
    display: flex; align-items: center; gap: 10px;
  }
  .map-popup-title {
    flex: 1; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.06em;
    text-transform: uppercase; color: #fff;
    display: flex; align-items: center; gap: 8px;
  }
  .map-popup-title-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #00BFFF;
    box-shadow: 0 0 8px rgba(0,191,255,0.8); flex-shrink: 0;
  }
  .map-popup-address {
    font-size: 0.68rem; font-weight: 400; color: rgba(180,220,255,0.7);
    letter-spacing: 0.02em; text-transform: none; margin-top: 1px;
  }
  .map-close-btn {
    width: 34px; height: 34px; border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #ef4444);
    border: 1.5px solid rgba(255,100,100,0.5); color: #fff;
    font-size: 1rem; font-weight: 700; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; line-height: 1;
    box-shadow: 0 3px 14px rgba(220,38,38,0.5);
    transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
    outline: none; z-index: 20;
  }
  .map-close-btn:hover {
    background: linear-gradient(135deg, #b91c1c, #dc2626);
    transform: scale(1.1) rotate(90deg); box-shadow: 0 5px 20px rgba(220,38,38,0.7);
  }
  .map-close-btn:active { transform: scale(0.95) rotate(90deg); }
  .map-iframe { width: 100%; height: 100%; border: none; display: block; }
  .map-popup-footer {
    position: absolute; bottom: 0; left: 0; right: 0; z-index: 10;
    padding: 12px 18px 14px;
    background: linear-gradient(0deg, rgba(7,18,38,0.97) 60%, transparent 100%);
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
  }
  .map-footer-info {
    display: flex; align-items: center; gap: 8px;
    font-size: 0.7rem; color: rgba(160,210,255,0.75);
  }
  .map-footer-info svg { opacity: 0.7; flex-shrink: 0; }
  .map-open-gmaps {
    display: flex; align-items: center; gap: 6px;
    background: rgba(0,191,255,0.12); border: 1px solid rgba(0,191,255,0.3);
    border-radius: 100px; padding: 6px 14px; color: #00BFFF;
    font-size: 0.68rem; font-weight: 800; letter-spacing: 0.07em;
    text-transform: uppercase; cursor: pointer; text-decoration: none;
    transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    white-space: nowrap;
  }
  .map-open-gmaps:hover {
    background: rgba(0,191,255,0.22); border-color: rgba(0,191,255,0.6);
    box-shadow: 0 3px 14px rgba(0,191,255,0.2);
  }
`

function injectCSS(id, css) {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  const el = document.createElement('style')
  el.id = id; el.textContent = css
  document.head.appendChild(el)
}

/* ══════════════════════════════════════════════════════════════
   MAP POPUP
══════════════════════════════════════════════════════════════ */
const OFFICE = {
  label:    'Common Psychology',
  address:  'Thimi, Bhaktapur, Nepal',
  embedUrl: 'https://www.google.com/maps/embed/v1/search?key=YOUR_GOOGLE_MAPS_API_KEY&q=Common+Psychology+Thimi+Bhaktapur+Nepal',
  gmapsUrl: 'https://www.google.com/maps/search/?api=1&query=Common+Psychology+Thimi+Bhaktapur+Nepal',
}

function MapPopup({ onClose, c }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div className="map-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-label="Office location map">
      <div className="map-popup">
        <div className="map-popup-header">
          <div className="map-popup-title">
            <div className="map-popup-title-dot" />
            <div>
              <div>{OFFICE.label}</div>
              <div className="map-popup-address">📍 {OFFICE.address}</div>
            </div>
          </div>
          <button className="map-close-btn" onClick={onClose} aria-label="Close map" title="Close">✕</button>
        </div>

        <iframe className="map-iframe" src={OFFICE.embedUrl}
          allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          title="Office location" />

        <div className="map-popup-footer">
          <div className="map-footer-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {c.hours}
          </div>
          <a className="map-open-gmaps" href={OFFICE.gmapsUrl} target="_blank" rel="noopener noreferrer">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            {c.open_maps}
          </a>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   HEART VISUAL
══════════════════════════════════════════════════════════════ */
function HeartVisual({ onParentClick, onTeenClick, onAssessClick, c }) {
  const [hovered, setHovered] = useState(null)

  const parentBase    = { background:'linear-gradient(135deg, rgba(45,74,62,0.82) 0%, rgba(61,107,90,0.78) 100%)',  border:'1.5px solid rgba(184,213,200,0.35)', boxShadow:'0 8px 28px rgba(0,0,0,0.18)' }
  const parentHovered = { background:'linear-gradient(135deg, rgba(45,74,62,0.95) 0%, rgba(61,107,90,0.92) 100%)',  border:'1.5px solid rgba(184,213,200,0.65)', boxShadow:'0 20px 48px rgba(0,0,0,0.22), inset 0 1px 0 rgba(184,213,200,0.3)' }
  const teenBase      = { background:'linear-gradient(135deg, rgba(88,28,135,0.82) 0%, rgba(147,51,234,0.75) 100%)', border:'1.5px solid rgba(216,180,254,0.35)', boxShadow:'0 8px 28px rgba(88,28,135,0.25)' }
  const teenHovered   = { background:'linear-gradient(135deg, rgba(88,28,135,0.96) 0%, rgba(147,51,234,0.92) 100%)', border:'1.5px solid rgba(216,180,254,0.65)', boxShadow:'0 20px 48px rgba(88,28,135,0.35), inset 0 1px 0 rgba(216,180,254,0.3)' }

  return (
    <div className="hb-visual-root">
      <div className="hb-glow-blob" />
      {[{ size:260, delay:'0s' }, { size:320, delay:'0.7s' }, { size:390, delay:'1.4s' }].map((r,i) => (
        <div key={i} className="hb-pulse" style={{ width:r.size, height:r.size, animationDelay:r.delay }} />
      ))}

      <svg className="hb-heart-svg" viewBox="0 0 200 185" width="300" height="278" style={{ position:'relative', zIndex:30 }}>
        <defs>
          <linearGradient id="hg-body" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#007BA8" /><stop offset="30%"  stopColor="#009FD4" />
            <stop offset="65%"  stopColor="#00BFFF" /><stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="hg-depth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,55,100,0.45)" />
          </linearGradient>
          <linearGradient id="hg-shine" x1="15%" y1="0%" x2="75%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id="hg-vein" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
            <stop offset="45%"  stopColor="rgba(255,255,255,0.65)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <clipPath id="hc-clip">
            <path d="M100,165 C58,133 8,102 8,57 C8,27 29,8 55,8 C70,8 85,16 100,31 C115,16 130,8 145,8 C171,8 192,27 192,57 C192,102 142,133 100,165 Z" />
          </clipPath>
        </defs>
        <path d="M100,165 C58,133 8,102 8,57 C8,27 29,8 55,8 C70,8 85,16 100,31 C115,16 130,8 145,8 C171,8 192,27 192,57 C192,102 142,133 100,165 Z" fill="url(#hg-body)" />
        <path d="M100,165 C58,133 8,102 8,57 C8,27 29,8 55,8 C70,8 85,16 100,31 C115,16 130,8 145,8 C171,8 192,27 192,57 C192,102 142,133 100,165 Z" fill="url(#hg-depth)" />
        <g clipPath="url(#hc-clip)" opacity="0.55">
          <path d="M55,8 Q38,42 33,78 Q30,105 52,138"      fill="none" stroke="url(#hg-vein)" strokeWidth="6"   strokeLinecap="round" className="hb-vein" style={{ animationDelay:'0s',   animationDuration:'2.2s' }} />
          <path d="M145,8 Q162,42 167,78 Q170,105 148,138" fill="none" stroke="url(#hg-vein)" strokeWidth="6"   strokeLinecap="round" className="hb-vein" style={{ animationDelay:'0.5s', animationDuration:'2.2s' }} />
          <path d="M100,31 Q94,68 88,95 Q85,115 100,145"   fill="none" stroke="url(#hg-vein)" strokeWidth="4.5" strokeLinecap="round" className="hb-vein" style={{ animationDelay:'1s',   animationDuration:'2.2s' }} />
          <path d="M25,62 Q62,56 100,59 Q138,56 175,62"    fill="none" stroke="url(#hg-vein)" strokeWidth="4"   strokeLinecap="round" className="hb-vein" style={{ animationDelay:'1.5s', animationDuration:'2.2s' }} />
          <path d="M38,42 Q70,78 100,90 Q130,78 162,42"    fill="none" stroke="url(#hg-vein)" strokeWidth="3"   strokeLinecap="round" className="hb-vein" style={{ animationDelay:'0.3s', animationDuration:'2.8s' }} />
        </g>
        <g clipPath="url(#hc-clip)" opacity="0.4">
          <polyline points="18,90 38,90 48,70 58,110 66,76 74,100 84,90 116,90 124,68 134,114 142,72 150,98 160,90 182,90"
            fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="hb-ekg-strip" style={{ animationDuration:'2.4s' }} />
        </g>
        <path d="M100,165 C58,133 8,102 8,57 C8,27 29,8 55,8 C70,8 85,16 100,31 C115,16 130,8 145,8 C171,8 192,27 192,57 C192,102 142,133 100,165 Z" fill="url(#hg-shine)" opacity="0.38" />
        <path d="M63,18 C52,27 45,44 45,58 C45,66 48,73 53,78" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="6" strokeLinecap="round" />
        <ellipse cx="70" cy="36" rx="9" ry="5.5" fill="rgba(255,255,255,0.22)" transform="rotate(-28,70,36)" />
      </svg>

      {[
        { left:'30%', top:'14%', size:11, delay:'0s',   dur:'2.6s' },
        { left:'66%', top:'18%', size:8,  delay:'0.8s', dur:'3.0s' },
        { left:'20%', top:'52%', size:7,  delay:'1.5s', dur:'2.4s' },
        { left:'74%', top:'58%', size:10, delay:'0.4s', dur:'2.9s' },
        { left:'48%', top:'10%', size:6,  delay:'1.9s', dur:'2.2s' },
        { left:'82%', top:'35%', size:7,  delay:'1.1s', dur:'3.1s' },
      ].map((d,i) => (
        <div key={i} className="hb-drop-particle" style={{
          left:d.left, top:d.top, width:d.size, height:d.size,
          background:'radial-gradient(circle at 32% 32%, rgba(255,255,255,0.85), rgba(0,191,255,0.65))',
          animationDelay:d.delay, animationDuration:d.dur }} />
      ))}

      <svg viewBox="0 0 360 44" width="360" height="44" style={{
        position:'absolute', bottom:'13%', left:'50%', transform:'translateX(-50%)',
        opacity:0.45, zIndex:7, pointerEvents:'none' }}>
        <polyline points="0,22 30,22 42,8 56,36 66,10 76,30 88,22 180,22 194,6 208,38 218,8 230,32 242,22 360,22"
          fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="hb-ekg-strip" style={{ animationDuration:'2.4s', strokeDasharray:520 }} />
      </svg>

      {/* Stat pills */}
      <div className="hb-stat-pill" style={{ top:'6%', left:'50%', transform:'translateX(-50%)',
        background:'rgba(255,255,255,0.92)', border:'1.5px solid rgba(0,123,168,0.3)', zIndex:32 }}>
        <span style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:800, color:'#007BA8', letterSpacing:'0.06em' }}>
          {c.pill_families}
        </span>
      </div>
      <div className="hb-stat-pill" style={{ bottom:'8%', right:'2%',
        background:'rgba(255,255,255,0.92)', border:'1.5px solid rgba(0,123,168,0.3)', zIndex:32 }}>
        <span style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:800, color:'#007BA8' }}>
          {c.pill_rating}
        </span>
      </div>

      {/*
        ══════════════════════════════════════════════════════════
        PARENT CARD — HOVER FLICKER FIX
        ══════════════════════════════════════════════════════════
        Structure:
          [.hb-card-wrapper-parent]   ← anchored, handles hover events
            [.hb-persona-card
             .hb-persona-card-inner-parent]  ← floats + scales on hover

        The wrapper's top/left/transform stay fixed, so the cursor
        never accidentally leaves while the inner card animates.
        Hover is detected on the WRAPPER via onMouseEnter/Leave,
        so lifting the inner card cannot trigger a mouseleave.
      */}
      <div
        className="hb-card-wrapper-parent"
        onMouseEnter={() => setHovered('parent')}
        onMouseLeave={() => setHovered(null)}
        onClick={onParentClick}
      >
        <div
          className="hb-persona-card hb-persona-card-inner-parent"
          style={hovered === 'parent' ? parentHovered : parentBase}
        >
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', flexShrink:0,
              background:'rgba(184,213,200,0.25)', border:'1.5px solid rgba(184,213,200,0.45)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px',
              transition:'transform 0.3s ease',
              transform: hovered==='parent' ? 'scale(1.15) rotate(-6deg)' : 'scale(1)' }}>🌿</div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'#d4f0e0', lineHeight:1.15, fontWeight:400 }}>
                {c.parent_title}
              </div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.58rem', fontWeight:800,
                letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(184,213,200,0.6)', marginTop:'2px' }}>
                {c.parent_sub}
              </div>
            </div>
          </div>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:'rgba(212,240,224,0.82)',
            lineHeight:1.6, margin:'0 0 12px', fontWeight:400 }}>
            {c.parent_body}
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            borderTop:'1px solid rgba(184,213,200,0.22)', paddingTop:'10px' }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800,
              letterSpacing:'0.09em', textTransform:'uppercase',
              color: hovered==='parent' ? '#b8d5c8' : 'rgba(184,213,200,0.5)', transition:'color 0.2s' }}>
              {c.parent_cta}
            </span>
            <div style={{ width:22, height:22, borderRadius:'50%',
              background: hovered==='parent' ? 'rgba(184,213,200,0.35)' : 'rgba(184,213,200,0.15)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.7rem', color:'#b8d5c8', transition:'background 0.2s' }}>→</div>
          </div>
        </div>
      </div>

      {/*
        ══════════════════════════════════════════════════════════
        TEEN CARD — same fix applied
        ══════════════════════════════════════════════════════════
      */}
      <div
        className="hb-card-wrapper-teen"
        onMouseEnter={() => setHovered('teen')}
        onMouseLeave={() => setHovered(null)}
        onClick={onTeenClick}
      >
        <div
          className="hb-persona-card hb-persona-card-inner-teen"
          style={hovered === 'teen' ? teenHovered : teenBase}
        >
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
            <div style={{ width:44, height:44, borderRadius:'50%', flexShrink:0,
              background:'rgba(216,180,254,0.2)', border:'1.5px solid rgba(216,180,254,0.4)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px',
              transition:'transform 0.3s ease',
              transform: hovered==='teen' ? 'scale(1.15) rotate(6deg)' : 'scale(1)' }}>✨</div>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'#ede9fe', lineHeight:1.15, fontWeight:400 }}>
                {c.teen_title}
              </div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.58rem', fontWeight:800,
                letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(216,180,254,0.6)', marginTop:'2px' }}>
                {c.teen_sub}
              </div>
            </div>
          </div>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:'rgba(237,233,254,0.82)',
            lineHeight:1.6, margin:'0 0 12px', fontWeight:400 }}>
            {c.teen_body}
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            borderTop:'1px solid rgba(216,180,254,0.22)', paddingTop:'10px' }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800,
              letterSpacing:'0.09em', textTransform:'uppercase',
              color: hovered==='teen' ? '#ddd6fe' : 'rgba(221,214,254,0.5)', transition:'color 0.2s' }}>
              {c.teen_cta}
            </span>
            <div style={{ width:22, height:22, borderRadius:'50%',
              background: hovered==='teen' ? 'rgba(216,180,254,0.3)' : 'rgba(216,180,254,0.12)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.7rem', color:'#ddd6fe', transition:'background 0.2s' }}>→</div>
          </div>
        </div>
      </div>

      <div className="floating-card" onClick={onAssessClick} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN HERO
══════════════════════════════════════════════════════════════ */
export default function Hero() {
  const { navigate }                      = useRouter()
  const { lang }                          = useLang()
  const siteStats                         = useSiteStats()
  const [mapOpen, setMapOpen]             = useState(false)
  const [labelVisible, setLabelVisible]   = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 1024
  )

  useEffect(() => {
    const handler = () => setIsLargeScreen(window.innerWidth >= 1024)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const c = HERO_COPY[lang] ?? HERO_COPY.EN

  useEffect(() => {
    injectCSS('hb-heart-css', HEART_CSS)
    const t  = setTimeout(() => setLabelVisible(true),  1200)
    const t2 = setTimeout(() => setLabelVisible(false), 3500)
    return () => { clearTimeout(t); clearTimeout(t2) }
  }, [])

  const dynClients      = `${siteStats.clients}+`
  const dynTherapists   = siteStats.therapists
  const dynRating       = `${siteStats.rating}★`
  const dynPillFamilies = lang === 'NP'
    ? `❤️  ${siteStats.families}+ परिवार निको भए`
    : `❤️  ${siteStats.families}+ families healed`
  const dynPillRating   = `${siteStats.pillRating} ★ rated`

  return (
    <section className="hero">

      {/* ══ LEFT ══ */}
      <div className="hero-content">
        <div className="hero-badge">
          <span>🌿</span> {c.badge}
        </div>

        <h1 className={`hero-heading${lang === 'NP' ? ' lang-np' : ''}`}>
          <span className="h1-plain">{c.h1_our}</span>
          <span className="h1-accent-help">{c.h1_help}</span>
          <span className="h1-plain">{c.h1_your}</span>
          <span className="h1-accent-choice">{c.h1_choice}</span>
        </h1>

        <p className="hero-desc">{c.desc}</p>

        <div className="hero-actions">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/book')}>
            {c.btn_book}
          </button>
          <button className="btn btn-outline btn-lg" onClick={() => navigate('/assessments')}>
            {c.btn_assess}
          </button>
        </div>

        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">{dynClients}</div>
            <div className="hero-stat-label">{c.stat_clients}</div>
          </div>
          <div>
            <div className="hero-stat-num">{dynTherapists}</div>
            <div className="hero-stat-label">{c.stat_therapists}</div>
          </div>
          <div>
            <div className="hero-stat-num">{dynRating}</div>
            <div className="hero-stat-label">{c.stat_rating}</div>
          </div>
        </div>
      </div>

      {/* ══ RIGHT ══ */}
      {isLargeScreen && <MindfulClock />}

      <div className="hero-visual">
        <div className="hero-card-stack" style={{ position:'relative', width:'100%', height:'100%', minHeight:'500px' }}>
          <HeartVisual
            c={{
              ...c,
              pill_families: dynPillFamilies,
              pill_rating:   dynPillRating,
            }}
            onParentClick={() => navigate('/book', { intent: 'parent' })}
            onTeenClick={()   => navigate('/book', { intent: 'teen'   })}
            onAssessClick={() => navigate('/assessments')}
          />
        </div>
      </div>

      <div className={`map-fab-label${labelVisible ? ' visible' : ''}`}>{c.map_label}</div>

      {mapOpen && <MapPopup onClose={() => setMapOpen(false)} c={c} />}
    </section>
  )
}