import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../context/RouterContext'
import { useLang } from '../context/LanguageContext'

/* ─────────────────────────────────────────────────────────────
   Content — kept in one place so copy can be edited without
   touching markup. `tone` decides which column a clause lands
   in: 'open' → the "come if" column, 'muted' → the "not for
   you" column. The split IS the structure now, not a mixed grid.
───────────────────────────────────────────────────────────── */
const CLAUSES = [
  {
    tone: 'muted',
    mark: '⏳',
    np: 'समय र लगाव छैन भने, कमन साइकोलोजीमा नआउनुहोस्।',
    en: "No time, no real interest? Then Common Psychology isn't the place — please don't join us.",
  },
  {
    tone: 'muted',
    mark: '🚪',
    np: 'यीमध्ये कुनै पनि नछोए, हामी तपाईंका लागि होइनौं — र साँच्चै भन्दा तपाईंलाई पनि हामी चाहिँदैन।',
    en: "None of this resonate? We're not for you — and honestly, you don't need us either.",
  },
  {
    tone: 'open',
    mark: '💳',
    np: 'तिर्न सक्नुहुन्छ भने, हामी हाम्रो सामान्य शुल्क मात्र लिन्छौं। थप केही होइन। यदि सक्नुहुन्न भने, हामी स्लाइडिङ स्केल वा प्रो बोनो व्यवस्था छलफल गर्न सक्छौं।',
    en: 'Can you pay for care? We charge our normal rates — nothing more. If you cannot, we can discuss a sliding scale or referral services.',
  },
  {
    tone: 'open',
    mark: '🌱',
    np: 'हामी बढ्न योग्य छौं भन्ने लाग्छ भने, दान गरेर, सिफारिस गरेर, वा नियमित ग्राहक बनेर सघाउनुहोस्।',
    en: 'Believe this work deserves to grow? Donate, refer us, or return as a regular member — support us however you can.',
  },
]

export default function NoticeSection() {
  const { lang }      = useLang()
  const { navigate }  = useRouter()
  const [hovered, setHovered] = useState(null)
  const [visible, setVisible] = useState(false)
  const rootRef = useRef(null)

  const isNP = lang === 'NP'
  const openClauses  = CLAUSES.filter(c => c.tone === 'open')
  const mutedClauses = CLAUSES.filter(c => c.tone === 'muted')

  function go(path) {
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect() } },
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="cp-notice">
      <style>{`
        .cp-notice {
          position: relative;
          padding: 5.5rem 1.5rem;
          background: linear-gradient(180deg, #FCFAF5 0%, #F5F0E5 100%);
        }
        .cp-notice-glow {
          position: absolute;
          width: 460px; height: 460px;
          border-radius: 50%;
          top: -180px; right: -160px;
          background: radial-gradient(circle, rgba(28,126,168,0.06), transparent 70%);
          pointer-events: none;
        }

        /* ── the paper itself ── */
        .cp-notice-paper {
          position: relative;
          max-width: 980px;
          margin: 0 auto;
          background: #FFFEFB;
          border: 1px solid rgba(27,40,56,0.09);
          border-top: 3px solid #1C7EA8;
          border-radius: 6px;
          box-shadow: 0 30px 70px rgba(27,40,56,0.09), 0 2px 8px rgba(27,40,56,0.05);
          padding: 3rem 3rem 2.6rem;
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.85s ease, transform 0.85s cubic-bezier(0.2,0.8,0.2,1);
        }
        .cp-notice-paper.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── letterhead row ── */
        .cp-notice-letterhead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.6rem;
        }
        .cp-notice-seal-row {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .cp-notice-seal {
          width: 46px; height: 46px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px dashed rgba(28,126,168,0.55);
          background: rgba(28,126,168,0.06);
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 700;
          font-size: 0.82rem;
          color: #1C7EA8;
          transform: rotate(-8deg) scale(0.6);
          opacity: 0;
          transition: transform 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.5s, opacity 0.5s ease 0.5s;
        }
        .cp-notice-paper.is-visible .cp-notice-seal {
          transform: rotate(-8deg) scale(1);
          opacity: 1;
        }
        .cp-notice-eyebrow {
          font-family: var(--font-body);
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: #1C7EA8;
        }
        .cp-notice-eyebrow-sub {
          display: block;
          font-size: 0.68rem; font-weight: 500;
          letter-spacing: 0.04em; text-transform: none;
          color: var(--text-mid);
          margin-top: 0.15rem;
        }
        .cp-notice-serial {
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.72rem;
          color: rgba(27,40,56,0.38);
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .cp-notice-rule {
          height: 1px;
          background: linear-gradient(90deg, rgba(27,40,56,0.14), rgba(27,40,56,0.03));
          margin-bottom: 1.8rem;
        }

        .cp-notice-title {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(1.5rem, 3.6vw, 2.5rem); line-height: 1.2;
          color: var(--text-dark);
          margin: 0 0 0.65rem;
        }
        .cp-notice-subtitle {
          font-family: var(--font-body); font-size: 1rem;
          color: var(--text-mid); max-width: 560px;
          line-height: 1.65; margin: 0 0 2.4rem;
        }

        /* ── two-column body ── */
        .cp-notice-columns {
          display: grid;
          grid-template-columns: 1fr 1px 1fr;
          gap: 2.2rem;
          margin-bottom: 2.4rem;
        }
        .cp-notice-col-divider {
          background: rgba(27,40,56,0.1);
          position: relative;
        }
        .cp-notice-col-divider::before {
          content: '✦';
          position: absolute; top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: #FFFEFB;
          color: rgba(28,126,168,0.5);
          font-size: 0.7rem;
          padding: 0.4rem 0;
        }
        .cp-notice-col-label {
          display: flex; align-items: center; gap: 0.5rem;
          font-family: var(--font-body); font-size: 0.72rem;
          font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase;
          margin-bottom: 1.1rem;
        }
        .cp-notice-col-label-glyph {
          width: 20px; height: 20px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.65rem; flex-shrink: 0;
        }
        .cp-notice-item {
          display: flex; gap: 0.85rem; align-items: flex-start;
          padding: 0.9rem 0;
          border-bottom: 1px solid rgba(27,40,56,0.07);
          transition: padding-left 0.25s ease, background 0.25s ease;
        }
        .cp-notice-item:last-child { border-bottom: none; }
        .cp-notice-item.is-hovered { padding-left: 0.35rem; }
        .cp-notice-item-mark {
          font-size: 0.95rem;
          flex-shrink: 0;
          filter: grayscale(0.35);
          opacity: 0.9;
          line-height: 1.5;
        }
        .cp-notice-item-text {
          margin: 0; font-family: var(--font-body);
          font-size: 0.94rem; line-height: 1.6;
          color: var(--text-mid);
        }
        .cp-notice-item.is-hovered .cp-notice-item-text { color: var(--text-dark); }

        /* ── closing signature block ── */
        .cp-notice-closing {
          padding-top: 2.2rem;
          border-top: 1px solid rgba(27,40,56,0.1);
        }
        .cp-notice-quote {
          font-family: var(--font-display); font-weight: 600; font-style: italic;
          font-size: clamp(1.1rem, 2.2vw, 1.4rem); line-height: 1.55;
          color: #16324a;
          max-width: 640px;
          margin: 0 0 1.6rem;
        }
        .cp-notice-signoff {
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap;
        }
        .cp-notice-signoff-name {
          font-family: var(--font-body); font-size: 0.8rem;
          color: var(--text-mid); letter-spacing: 0.02em;
        }
        .cp-notice-signoff-name strong {
          color: var(--text-dark); font-weight: 700;
        }
        .cp-notice-cta-btn {
          padding: 0.7rem 1.35rem;
          border: 1.5px solid #1C7EA8;
          border-radius: 4px;
          background: transparent;
          color: #1C7EA8;
          font-family: var(--font-body); font-weight: 700; font-size: 0.86rem;
          cursor: pointer; white-space: nowrap;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .cp-notice-cta-btn:hover {
          background: #1C7EA8;
          color: #fff;
        }

        @media (max-width: 760px) {
          .cp-notice { padding: 3.5rem 1.1rem; }
          .cp-notice-paper { padding: 2.2rem 1.4rem; }
          .cp-notice-columns { grid-template-columns: 1fr; gap: 0; }
          .cp-notice-col-divider { display: none; }
          .cp-notice-columns > div:nth-child(1) { margin-bottom: 1.8rem; }
          .cp-notice-letterhead { flex-wrap: wrap; }
          .cp-notice-signoff { flex-direction: column; align-items: flex-start; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cp-notice-paper, .cp-notice-seal { transition: opacity 0.3s ease !important; transform: none !important; }
        }
      `}</style>

      <div className="cp-notice-glow" aria-hidden="true" />

      <div ref={rootRef} className={`cp-notice-paper${visible ? ' is-visible' : ''}`}>

        {/* letterhead */}
        <div className="cp-notice-letterhead">
          <div className="cp-notice-seal-row">
            <div className="cp-notice-seal">CP</div>
            <div>
              <span className="cp-notice-eyebrow">
                {isNP ? 'सूचना' : 'Notice'}
              </span>
              <span className="cp-notice-eyebrow-sub">
                {isNP ? 'विज्ञापन होइन' : 'Not a pitch'}
              </span>
            </div>
          </div>
          <span className="cp-notice-serial">{isNP ? 'नं. ००४' : 'No. 004'}</span>
        </div>

        <div className="cp-notice-rule" />

        <h2 className="cp-notice-title">
          {isNP ? 'हामी सबैका लागि होइनौं' : 'We Are Not For Everyone'}
        </h2>
        <p className="cp-notice-subtitle">
          {isNP
            ? 'कमन साइकोलोजीमा आउनुअघि, यी केही कुरा हामी स्पष्ट राख्न चाहन्छौं।'
            : "Before you come to Common Psychology, here's what we want to be upfront about."}
        </p>

        {/* two real columns — the split is the structure */}
        <div className="cp-notice-columns">
          <div>
            <div className="cp-notice-col-label" style={{ color: '#1C7EA8' }}>
              <span className="cp-notice-col-label-glyph" style={{ background: 'rgba(28,126,168,0.1)', color: '#1C7EA8' }}>✓</span>
              {isNP ? 'आउनुहोस्, यदि' : 'Come, if'}
            </div>
            {openClauses.map((c, i) => {
              const key = `open-${i}`
              return (
                <div
                  key={key}
                  className={`cp-notice-item${hovered === key ? ' is-hovered' : ''}`}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="cp-notice-item-mark">{c.mark}</span>
                  <p className="cp-notice-item-text">{isNP ? c.np : c.en}</p>
                </div>
              )
            })}
          </div>

          <div className="cp-notice-col-divider" />

          <div>
            <div className="cp-notice-col-label" style={{ color: '#8B8272' }}>
              <span className="cp-notice-col-label-glyph" style={{ background: 'rgba(139,130,114,0.14)', color: '#8B8272' }}>–</span>
              {isNP ? 'हामी होइनौं, यदि' : 'Not for you, if'}
            </div>
            {mutedClauses.map((c, i) => {
              const key = `muted-${i}`
              return (
                <div
                  key={key}
                  className={`cp-notice-item${hovered === key ? ' is-hovered' : ''}`}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="cp-notice-item-mark">{c.mark}</span>
                  <p className="cp-notice-item-text">{isNP ? c.np : c.en}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* closing signature */}
        <div className="cp-notice-closing">
          <p className="cp-notice-quote">
            {isNP
              ? '"इच्छा वा आवश्यकताले आउनुहोस् — हठात् मनले होइन, चर्चा वा दावीले तानिएर होइन।"'
              : '"Come out of want, or out of need — never on a whim, and never because we\'re being talked about."'}
          </p>
          <div className="cp-notice-signoff">
            <span className="cp-notice-signoff-name">
              — <strong>{isNP ? 'कमन साइकोलोजी' : 'Common Psychology'}</strong>
            </span>
            <button className="cp-notice-cta-btn" onClick={() => go('/book')}>
              {isNP ? 'सत्र बुक गर्नुहोस् →' : 'Book a Session →'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}