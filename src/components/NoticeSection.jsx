import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../context/RouterContext'
import { useLang } from '../context/LanguageContext'

/* ─────────────────────────────────────────────────────────────
   Content — kept in one place so copy can be edited without
   touching markup. `tone` drives the card's accent color:
   'open'   → sky/blue accent  (things that welcome the right fit)
   'muted'  → earth/gray accent (things that filter people out)
───────────────────────────────────────────────────────────── */
const CLAUSES = [
  {
    tone: 'muted',
    icon: '⏳',
    np: 'समय र लगाव छैन भने, कमन साइकोलोजीमा नआउनुहोस्।',
    en: "No time, no real interest? Then Common Psychology isn't the place — please don't join us.",
  },
  {
    tone: 'open',
    icon: '💳',
    np: 'तिर्न सक्नुहुन्छ भने, हामी हाम्रो सामान्य शुल्क मात्र लिन्छौं। थप केही होइन। यदि सक्नुहुन्न भने, हामी स्लाइडिङ स्केल वा प्रो बोनो व्यवस्था छलफल गर्न सक्छौं।',
    en: 'Can you pay for care? We charge our normal rates — nothing more. If you cannot, we can discuss a sliding scale or pro bono arrangement.',
  },
  {
    tone: 'open',
    icon: '🌱',
    np: 'हामी बढ्न योग्य छौं भन्ने लाग्छ भने, दान गरेर, सिफारिस गरेर, वा नियमित ग्राहक बनेर सघाउनुहोस्।',
    en: 'Believe this work deserves to grow? Donate, refer us, or return as a regular member — support us however you can.',
  },
  {
    tone: 'muted',
    icon: '🚪',
    np: 'यीमध्ये कुनै पनि नछोए, हामी तपाईंका लागि होइनौं — र साँच्चै भन्दा तपाईंलाई पनि हामी चाहिँदैन।',
    en: "None of this resonate? We're not for you — and honestly, you don't need us either.",
  },
]

export default function NoticeSection() {
  const { lang }      = useLang()
  const { navigate }  = useRouter()
  const [hovered, setHovered] = useState(null)
  const [bannerVisible, setBannerVisible] = useState(false)
  const bannerRef = useRef(null)

  const isNP = lang === 'NP'

  function go(path) {
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = bannerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setBannerVisible(true); io.disconnect() } },
      { threshold: 0.35 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="cp-notice">
      <style>{`
        .cp-notice {
          position: relative;
          overflow: hidden;
          padding: 5rem 1.5rem;
          background: linear-gradient(180deg, var(--white) 0%, var(--sky-light) 100%);
        }
        .cp-notice-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
        }
        .cp-notice-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }
        .cp-notice-closing {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .cp-notice-cta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        /* ── Spotlight banner ── */
        .cp-notice-spotlight {
          position: relative;
          margin-bottom: 2.4rem;
        }
        .cp-notice-glow {
          position: absolute;
          inset: -40px;
          border-radius: 32px;
          background: radial-gradient(ellipse 70% 90% at 50% 40%, rgba(41,128,185,0.22), transparent 72%);
          filter: blur(18px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 1.1s ease;
        }
        .cp-notice-spotlight.is-visible .cp-notice-glow {
          opacity: 1;
          animation: cp-pulse-glow 3.6s ease-in-out infinite;
        }
        @keyframes cp-pulse-glow {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.9;  transform: scale(1.04); }
        }
        .cp-notice-banner {
          position: relative;
          border-radius: var(--radius-lg);
          padding: 2.6rem 2.4rem;
          background: linear-gradient(135deg, #ffffff 0%, #eef8ff 40%, #d7f0fd 75%, #bfe6fb 100%);
          border: 1.5px solid var(--blue-pale);
          box-shadow: 0 12px 34px rgba(15,52,96,0.1);
          opacity: 0;
          transform: translateY(18px) scale(0.985);
          transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.2,0.8,0.2,1);
          overflow: hidden;
        }
        .cp-notice-spotlight.is-visible .cp-notice-banner {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .cp-notice-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.65) 38%, transparent 56%);
          background-size: 220% 220%;
          background-position: -60% -60%;
          pointer-events: none;
        }
        .cp-notice-spotlight.is-visible .cp-notice-banner::before {
          animation: cp-sheen 3.2s ease-in-out 0.9s;
        }
        @keyframes cp-sheen {
          0%   { background-position: -60% -60%; }
          100% { background-position: 160% 160%; }
        }
        .cp-notice-eyebrow {
          display: inline-flex; align-items: center; gap: '0.4rem';
          font-family: var(--font-body);
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #0f3460;
          opacity: 0.72;
          margin-bottom: 0.9rem;
        }
        .cp-notice-quote-mark {
          position: absolute;
          top: 0.6rem; left: 1.6rem;
          font-family: var(--font-display);
          font-size: 5rem;
          line-height: 1;
          color: rgba(41,128,185,0.14);
          user-select: none;
          pointer-events: none;
        }

        @media (max-width: 760px) {
          .cp-notice { padding: 3.5rem 1.25rem; }
          .cp-notice-grid { grid-template-columns: 1fr; }
          .cp-notice-closing { flex-direction: column; align-items: flex-start; }
          .cp-notice-banner { padding: 2rem 1.5rem; }
          .cp-notice-quote-mark { font-size: 3.6rem; top: 0.3rem; left: 1rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cp-notice-banner, .cp-notice-glow { transition: opacity 0.4s ease; animation: none !important; }
          .cp-notice-banner::before { animation: none !important; }
        }
      `}</style>

      {/* soft ambient blobs for depth, matching the sign-in gradient mark */}
      <div className="cp-notice-blob" style={{
        width: 380, height: 380, top: -160, right: -120,
        background: 'radial-gradient(circle, rgba(41,128,185,0.16), transparent 70%)',
      }} />
      <div className="cp-notice-blob" style={{
        width: 300, height: 300, bottom: -140, left: -100,
        background: 'radial-gradient(circle, rgba(46,125,50,0.10), transparent 70%)',
      }} />

      <div style={{ position: 'relative', maxWidth: 980, margin: '0 auto', zIndex: 1 }}>

        {/* eyebrow */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          padding: '0.3rem 0.85rem', marginBottom: '1.4rem',
          border: '1.5px solid var(--green-pale)', borderRadius: 100,
          fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--green-deep)', background: 'var(--green-mist)',
        }}>
          📌 {isNP ? 'सूचना — विज्ञापन होइन' : 'A Notice — Not a Pitch'}
        </div>

        {/* title */}
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.9rem, 4.2vw, 2.9rem)', lineHeight: 1.2,
          color: 'var(--text-dark)', margin: '0 0 0.6rem',
        }}>
          {isNP ? 'हामी सबैका लागि होइनौं' : 'We Are Not For Everyone'}
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '1.02rem',
          color: 'var(--text-mid)', maxWidth: 620, margin: '0 0 2.4rem', lineHeight: 1.6,
        }}>
          {isNP
            ? 'कमन साइकोलोजीमा आउनुअघि, यी केही कुरा हामी स्पष्ट राख्न चाहन्छौं।'
            : "Before you come to Common Psychology, here's what we want to be upfront about."}
        </p>

        {/* clause grid */}
        <div className="cp-notice-grid" style={{ marginBottom: '2.4rem' }}>
          {CLAUSES.map((c, i) => {
            const open = c.tone === 'open'
            const isHovered = hovered === i
            return (
              <div
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: 'flex', gap: '1rem', alignItems: 'flex-start',
                  padding: '1.5rem', background: 'var(--white)',
                  border: `1.5px solid ${open ? 'var(--blue-pale)' : 'var(--earth-cream)'}`,
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: isHovered
                    ? '0 14px 32px rgba(15,52,96,0.12)'
                    : '0 4px 14px rgba(15,52,96,0.05)',
                  transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                }}
              >
                <span style={{
                  width: 42, height: 42, flexShrink: 0, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.15rem',
                  background: open ? 'var(--sky-light)' : 'var(--off-white)',
                  border: `1.5px solid ${open ? 'var(--blue-pale)' : 'var(--earth-cream)'}`,
                }}>
                  {c.icon}
                </span>
                <p style={{
                  margin: 0, fontFamily: 'var(--font-body)',
                  fontSize: '0.97rem', lineHeight: 1.65,
                  color: open ? 'var(--text-dark)' : 'var(--text-mid)',
                  fontWeight: open ? 600 : 500,
                }}>
                  {isNP ? c.np : c.en}
                </p>
              </div>
            )
          })}
        </div>

        {/* ── spotlighted closing banner — the line we most want read ── */}
        <div
          ref={bannerRef}
          className={`cp-notice-spotlight${bannerVisible ? ' is-visible' : ''}`}
        >
          <div className="cp-notice-glow" />
          <div
            className="cp-notice-banner"
            style={{
              background: 'linear-gradient(135deg, #00BFFF 0%, #4fc9f2 20%, #a9dff5 45%, #d7f0fd 65%, #f0f8f4 85%, #f8fcfa 100%)',
            }}
          >
            <span className="cp-notice-quote-mark" aria-hidden="true">"</span>
            <div className="cp-notice-closing" style={{ position: 'relative' }}>
              <div style={{ flex: '1 1 380px' }}>
                <div className="cp-notice-eyebrow">
                  ✦ {isNP ? 'सबैभन्दा महत्त्वपूर्ण कुरा' : 'The One Thing to Remember'}
                </div>
                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontStyle: 'italic',
                  fontSize: 'clamp(1.15rem, 2.7vw, 1.55rem)', lineHeight: 1.55,
                  color: '#0f3460',
                }}>
                  {isNP
                    ? 'इच्छा वा आवश्यकताले आउनुहोस् — हठात् मनले होइन, चर्चा वा दावीले तानिएर होइन।'
                    : "Come out of want, or out of need — never on a whim, and never because we're being talked about."}
                </p>
              </div>

              <div className="cp-notice-cta">
                <button
                  onClick={() => go('/book')}
                  style={{
                    padding: '0.85rem 1.5rem', border: 'none', borderRadius: 100,
                    background: '#00BFFF', color: 'var(--white)',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    boxShadow: '0 8px 20px rgba(15,52,96,0.28)',
                  }}
                >
                  {isNP ? 'सत्र बुक गर्नुहोस् →' : 'Book a Session →'}
                </button>
              </div>
            

              <div className="cp-notice-cta">
                <button
                  onClick={() => go('/book')}
                  style={{
                    padding: '0.85rem 1.5rem', border: 'none', borderRadius: 100,
                    background: '#00BFFF', color: 'var(--white)',
                    fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    boxShadow: '0 8px 20px rgba(15,52,96,0.28)',
                  }}
                >
                  {isNP ? 'सत्र बुक गर्नुहोस् →' : 'Book a Session →'}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

