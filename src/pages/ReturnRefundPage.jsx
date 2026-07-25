import { useState } from 'react'
import { useLang } from '../context/LanguageContext'

// Reuses the same WhatsApp/Messenger contact pattern already used in the
// therapist dashboard's MessagingPanel — keep the numbers/links in sync
// with that file if they ever change.
const CONTACT_INFO = {
  whatsapp: {
    number: '+977 9849350088', link: 'https://wa.me/9779849350088',
    label: 'WhatsApp', emoji: '💬', color: '#25D366', faint: '#e8fdf0',
  },
  messenger: {
    number: 'puja.samargi', link: 'https://m.me/puja.samargi',
    label: 'Messenger', emoji: '💙', color: '#0084FF', faint: '#e0f0ff',
  },
}

export default function ReturnRefundSection() {
  const { lang } = useLang()
  const isNP = lang === 'NP'
  const [tapped, setTapped] = useState(false)

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      padding: 'clamp(5rem,10vw,7.5rem) 1.5rem clamp(3rem,7vw,5rem)',
      background:
        'radial-gradient(circle at 12% 0%, rgba(14,165,233,0.12), transparent 55%),' +
        'radial-gradient(circle at 100% 100%, rgba(41,128,185,0.10), transparent 55%),' +
        'linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(214,238,252,0.75) 55%, rgba(255,255,255,0.96) 100%)',
    }}>
      <style>{`
        .rr-card {
          position: relative;
          max-width: 720px;
          margin: 0 auto;
          border-radius: 24px;
          padding: clamp(1.75rem,4vw,2.75rem);
          background: linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.8) 100%);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1.5px solid rgba(255,255,255,0.6);
          box-shadow: 0 20px 54px rgba(0,123,168,0.14), inset 0 1px 0 rgba(255,255,255,0.6);
          text-align: center;
          cursor: pointer;
          transition: transform 0.28s cubic-bezier(.22,1,.36,1), box-shadow 0.28s ease;
        }
        .rr-card:hover, .rr-card:focus-visible {
          transform: translateY(-4px);
          box-shadow: 0 28px 64px rgba(0,123,168,0.2), inset 0 1px 0 rgba(255,255,255,0.65);
        }
        .rr-card:active { transform: translateY(-1px) scale(0.995); }

        .rr-tap-pill {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.32rem 0.9rem; margin-bottom: 1.1rem;
          background: linear-gradient(135deg, #0ea5e9 0%, #00BFFF 100%);
          color: #fff;
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 0.68rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
          box-shadow: 0 8px 20px rgba(14,165,233,0.32);
          animation: rrPulseTap 2.4s ease-in-out infinite;
        }
        @keyframes rrPulseTap {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.05); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rr-tap-pill { animation: none; }
        }

        .rr-icon-badge {
          width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 1rem;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          background: rgba(14,165,233,0.10);
          border: 2px solid rgba(14,165,233,0.25);
        }

        .rr-expand {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.4s cubic-bezier(.22,1,.36,1), opacity 0.35s ease, margin-top 0.4s ease;
        }
        .rr-expand.open {
          max-height: 240px;
          opacity: 1;
          margin-top: 1.5rem;
        }

        .rr-contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }
        @media (max-width: 560px) {
          .rr-contact-grid { grid-template-columns: 1fr; }
        }
        .rr-contact-btn {
          display: flex; align-items: center; gap: 0.65rem;
          padding: 0.85rem 1rem;
          border-radius: 14px;
          text-decoration: none;
          font-family: var(--font-body);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .rr-contact-btn:hover { transform: translateY(-2px); }
      `}</style>

      <div
        className="rr-card"
        role="button"
        tabIndex={0}
        onClick={() => setTapped(v => !v)}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setTapped(v => !v)}
      >
        <span className="rr-tap-pill">
          👆 {isNP ? 'च्याट गर्न ट्याप गर्नुहोस्' : 'Tap Me To Chat'}
        </span>

        <div className="rr-icon-badge">↩️</div>

        <h3 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.2rem,3vw,1.55rem)', color: '#0f3460', margin: '0 0 0.6rem',
        }}>
          {isNP ? 'फिर्ता वा रिफन्ड चाहियो?' : 'Need a Return or Refund?'}
        </h3>

        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.92rem', lineHeight: 1.7,
          color: 'var(--text-mid, #4a6a7a)', maxWidth: 480, margin: '0 auto',
        }}>
          {isNP
            ? 'हामी सहज बनाउन चाहन्छौं। कुनै पनि अर्डर, भुक्तानी, वा सेवा सम्बन्धी फिर्ता/रिफन्डको लागि, सिधै हाम्रो एडमिन वा स्टाफसँग च्याट गर्नुहोस् — फारम भर्नुपर्दैन।'
            : "We want this to be easy. For any return or refund on an order, payment, or service, just chat directly with our admin or staff — no forms to fill out."}
        </p>

        <div className={`rr-expand${tapped ? ' open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="rr-contact-grid">
            {Object.entries(CONTACT_INFO).map(([key, info]) => (
              <a key={key} href={info.link} target="_blank" rel="noopener noreferrer"
                className="rr-contact-btn"
                style={{ background: info.faint, border: `1.5px solid ${info.color}33` }}>
                <span style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: info.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', boxShadow: `0 4px 12px ${info.color}44`,
                }}>{info.emoji}</span>
                <span style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#0f3460' }}>{info.label}</span>
                  <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-light, #7a9aaa)' }}>{info.number}</span>
                </span>
              </a>
            ))}
          </div>
          <p style={{
            marginTop: '0.85rem', fontSize: '0.72rem', color: 'var(--text-light, #7a9aaa)',
            fontFamily: 'var(--font-body)',
          }}>
            {isNP ? 'आइतबार–शुक्रबार: बिहान ९ – साँझ ६ | शनिबार: बिहान १० – दिउँसो २ (नेपाली समय)' : 'Sun–Fri: 9AM–6PM · Sat: 10AM–2PM (NPT)'}
          </p>
        </div>

        {!tapped && (
          <div style={{ marginTop: '1.1rem', fontSize: '0.76rem', fontWeight: 700, color: '#0369a1', fontFamily: 'var(--font-body)' }}>
            {isNP ? 'सम्पर्क विकल्पहरू हेर्न ट्याप गर्नुहोस् ↓' : 'Tap to see contact options ↓'}
          </div>
        )}
      </div>
    </section>
  )
}