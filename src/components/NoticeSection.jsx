import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../context/RouterContext'
import { useLang } from '../context/LanguageContext'

/* ─────────────────────────────────────────────────────────────
   Content — kept in one place so copy can be edited without
   touching markup. `tone` drives the card's accent color:
   'open'   → sky/blue accent  (things that welcome the right fit)
   'muted'  → warm stone accent (things that filter people out)
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
    en: 'Can you pay for care? We charge our normal rates — nothing more. If you cannot, we can discuss a sliding scale or referral services.',
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
  const [lineGrown, setLineGrown] = useState(false)
  const bannerRef = useRef(null)
  const lineRef = useRef(null)

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

  useEffect(() => {
    const el = lineRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setLineGrown(true); io.disconnect() } },
      { threshold: 0.1 }
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
          background:
            radial-gradient(circle at 8% 0%, rgba(0,191,255,0.08), transparent 50%),
            radial-gradient(circle at 100% 100%, rgba(0,191,255,0.06), transparent 50%),
            linear-gradient(165deg, #f7fbfd 0%, #eef7fb 45%, #eaf5fa 100%);
        }
        .cp-notice-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
        }

        /* ── Eyebrow — glassy pill ── */
        .cp-notice-eyebrow-badge {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.3rem 0.85rem; margin-bottom: 1.4rem;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 100px;
          font-family: var(--font-body);
          font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #3a6a86;
          box-shadow: 0 4px 14px rgba(15,52,96,0.05), inset 0 1px 0 rgba(255,255,255,0.7);
        }

        /* ── Flow track: zigzag cards connected by a growing line ── */
        .cp-notice-track {
          position: relative;
          max-width: 800px;
          margin: 0 auto 3.2rem;
        }
        .cp-notice-spine {
          position: absolute;
          left: 50%;
          top: 22px;
          bottom: 22px;
          width: 2px;
          transform: translateX(-50%) scaleY(0);
          transform-origin: top;
          background: linear-gradient(180deg, rgba(0,191,255,0.4), rgba(139,130,114,0.35));
          transition: transform 1.1s cubic-bezier(0.2,0.7,0.3,1);
        }
        .cp-notice-spine.is-grown { transform: translateX(-50%) scaleY(1); }

        .cp-notice-row {
          position: relative;
          display: flex;
          margin-bottom: 1.3rem;
        }
        .cp-notice-row.align-left  { justify-content: flex-start; }
        .cp-notice-row.align-right { justify-content: flex-end; }

        .cp-notice-node {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          width: 30px; height: 30px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-body); font-weight: 700; font-size: 0.68rem;
          background: rgba(255,255,255,0.55);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1.5px solid;
          box-shadow: 0 4px 12px rgba(15,52,96,0.08), inset 0 1px 0 rgba(255,255,255,0.7);
          z-index: 2;
          transition: transform 0.5s cubic-bezier(0.34,1.56,0.64,1) var(--node-delay, 0s);
        }
        .cp-notice-node.is-grown { transform: translate(-50%, -50%) scale(1); }

        .cp-notice-card {
          display: flex; gap: 0.9rem; align-items: flex-start;
          width: calc(50% - 2rem);
          padding: 1.3rem 1.4rem;
          border-radius: var(--radius-lg);
          background: linear-gradient(160deg, #ffffff 0%, #eef8ff 60%, #dff2fc 100%);
          border: 1.5px solid var(--blue-pale);
          box-shadow: 0 4px 14px rgba(15,52,96,0.06);
          transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease, background 0.25s ease;
        }
        .cp-notice-icon-badge {
          width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1rem;
          filter: grayscale(0.25);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
        }

        @media (max-width: 760px) {
          .cp-notice-spine { left: 14px; }
          .cp-notice-node { left: 14px; width: 24px; height: 24px; font-size: 0.6rem; }
          .cp-notice-row.align-left, .cp-notice-row.align-right { justify-content: flex-end; }
          .cp-notice-card { width: calc(100% - 3.2rem); }
        }

        /* ── Spotlight banner ── */
        .cp-notice-spotlight {
          position: relative;
          margin-bottom: 2.4rem;
        }
        .cp-notice-glow {
          position: absolute;
          inset: -30px;
          border-radius: 32px;
          background: radial-gradient(ellipse 70% 90% at 50% 40%, rgba(0,191,255,0.14), transparent 72%);
          filter: blur(20px);
          opacity: 0;
          pointer-events: none;
          transition: opacity 1.1s ease;
        }
        .cp-notice-spotlight.is-visible .cp-notice-glow {
          opacity: 1;
        }
        .cp-notice-banner {
          position: relative;
          border-radius: var(--radius-lg);
          padding: 2.4rem 2.2rem;
          background: linear-gradient(160deg, #ffffff 0%, #eef8ff 55%, #dff2fc 100%);
          border: 1.5px solid var(--blue-pale);
          border-left: 3px solid #00BFFF;
          box-shadow: 0 8px 24px rgba(15,52,96,0.08);
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.2,0.8,0.2,1);
          overflow: hidden;
        }
        .cp-notice-spotlight.is-visible .cp-notice-banner {
          opacity: 1;
          transform: translateY(0);
        }
        .cp-notice-quote-mark {
          position: absolute;
          top: 0.4rem; left: 1.5rem;
          font-family: var(--font-display);
          font-size: 4.5rem;
          line-height: 1;
          color: rgba(0,191,255,0.1);
          user-select: none;
          pointer-events: none;
        }
        .cp-notice-eyebrow-sm {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-family: var(--font-body);
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #3a6a86;
          opacity: 0.85;
          margin-bottom: 0.9rem;
        }
        .cp-notice-closing {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
          position: relative;
        }
        .cp-notice-cta-btn {
          padding: 0.8rem 1.4rem; border-radius: 8px;
          background: rgba(0,191,255,0.85);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.35);
          color: #fff;
          font-family: var(--font-body); font-weight: 700; font-size: 0.88rem;
          cursor: pointer; white-space: nowrap;
          box-shadow: 0 8px 20px rgba(0,191,255,0.3), inset 0 1px 0 rgba(255,255,255,0.35);
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .cp-notice-cta-btn:hover {
          transform: translateY(-2px);
          background: rgba(0,170,230,0.92);
          box-shadow: 0 12px 26px rgba(0,191,255,0.38), inset 0 1px 0 rgba(255,255,255,0.4);
        }

        @media (max-width: 760px) {
          .cp-notice { padding: 3.5rem 1.25rem; }
          .cp-notice-closing { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
          .cp-notice-closing-text { flex: none !important; width: 100%; }
          .cp-notice-banner { padding: 2rem 1.4rem; }
          .cp-notice-header-item { text-align: center; margin-left: auto; margin-right: auto; }
          .cp-notice-eyebrow-badge { font-size: 0.62rem; padding: 0.28rem 0.7rem; margin-bottom: 1rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cp-notice-banner, .cp-notice-glow, .cp-notice-spine, .cp-notice-node { transition: opacity 0.4s ease !important; transform: none !important; animation: none !important; }
        }
      `}</style>

      <div className="cp-notice-blob" style={{
        width: 340, height: 340, top: -160, right: -120,
        background: 'radial-gradient(circle, rgba(0,191,255,0.1), transparent 70%)',
      }} />
      <div className="cp-notice-blob" style={{
        width: 300, height: 300, bottom: -140, left: -100,
        background: 'radial-gradient(circle, rgba(0,191,255,0.06), transparent 70%)',
      }} />

      <div style={{ position: 'relative', maxWidth: 980, margin: '0 auto', zIndex: 1 }}>

        {/* eyebrow */}
        <div className="cp-notice-eyebrow-badge cp-notice-header-item">
          📌 {isNP ? 'सूचना — विज्ञापन होइन' : 'A Notice — Not a Pitch'}
        </div>

        {/* title */}
        <h2 className="cp-notice-header-item" style={{
          fontFamily: 'var(--font-display)', fontWeight: 800,
          fontSize: 'clamp(1.5rem, 4.2vw, 2.9rem)', lineHeight: 1.25,
          color: 'var(--text-dark)', margin: '0 0 0.6rem',
        }}>
          {isNP ? 'हामी सबैका लागि होइनौं' : 'We Are Not For Everyone'}
        </h2>
        <p className="cp-notice-header-item" style={{
          fontFamily: 'var(--font-body)', fontSize: '1.02rem',
          color: 'var(--text-mid)', maxWidth: 620, margin: '0 auto 3rem', lineHeight: 1.6,
        }}>
          {isNP
            ? 'कमन साइकोलोजीमा आउनुअघि, यी केही कुरा हामी स्पष्ट राख्न चाहन्छौं।'
            : "Before you come to Common Psychology, here's what we want to be upfront about."}
        </p>

        {/* zigzag flow of clauses, spine grows down toward the banner */}
        <div className="cp-notice-track" ref={lineRef}>
          <div className={`cp-notice-spine${lineGrown ? ' is-grown' : ''}`} />
          {CLAUSES.map((c, i) => {
            const open = c.tone === 'open'
            const alignLeft = i % 2 === 0
            const isHovered = hovered === i
            const accent = open ? '#00BFFF' : '#8B8272'
            return (
              <div key={i} className={`cp-notice-row ${alignLeft ? 'align-left' : 'align-right'}`}>
                <div
                  className={`cp-notice-node${lineGrown ? ' is-grown' : ''}`}
                  style={{ '--node-delay': `${0.15 + i * 0.18}s`, borderColor: accent, color: accent }}
                >
                  {i + 1}
                </div>
                <div
                  className="cp-notice-card"
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    borderColor: isHovered ? (open ? 'rgba(0,191,255,0.35)' : 'rgba(139,130,114,0.35)') : 'rgba(15,52,96,0.07)',
                    boxShadow: isHovered
                      ? `0 16px 34px ${open ? 'rgba(0,191,255,0.16)' : 'rgba(139,130,114,0.14)'}`
                      : '0 6px 18px rgba(15,52,96,0.05)',
                    transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                  }}
                >
                  <span
                    className="cp-notice-icon-badge"
                    style={{
                      background: open ? 'rgba(0,191,255,0.12)' : 'rgba(139,130,114,0.12)',
                    }}
                  >
                    {c.icon}
                  </span>
                  <p style={{
                    margin: 0, fontFamily: 'var(--font-body)',
                    fontSize: '0.95rem', lineHeight: 1.6,
                    color: open ? 'var(--text-dark)' : 'var(--text-mid)',
                    fontWeight: open ? 600 : 500,
                  }}>
                    {isNP ? c.np : c.en}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── spotlighted closing banner — where the flow lands ── */}
        <div
          ref={bannerRef}
          className={`cp-notice-spotlight${bannerVisible ? ' is-visible' : ''}`}
        >
          <div className="cp-notice-glow" />
          <div className="cp-notice-banner">
            <span className="cp-notice-quote-mark" aria-hidden="true">"</span>
            <div className="cp-notice-closing">
              <div className="cp-notice-closing-text" style={{ flex: '1 1 380px' }}>
                <div className="cp-notice-eyebrow-sm">
                  ✦ {isNP ? 'सबैभन्दा महत्त्वपूर्ण कुरा' : 'The One Thing to Remember'}
                </div>
                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontStyle: 'italic',
                  fontSize: 'clamp(1.15rem, 2.7vw, 1.5rem)', lineHeight: 1.55,
                  color: '#0f3460',
                }}>
                  {isNP
                    ? 'इच्छा वा आवश्यकताले आउनुहोस् — हठात् मनले होइन, चर्चा वा दावीले तानिएर होइन।'
                    : "Come out of want, or out of need — never on a whim, and never because we're being talked about."}
                </p>
              </div>

              <div>
                <button className="cp-notice-cta-btn" onClick={() => go('/book')}>
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