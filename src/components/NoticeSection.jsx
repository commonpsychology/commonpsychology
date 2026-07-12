import { useState } from 'react'
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
    np: 'तिर्न सक्नुहुन्छ भने, हामी हाम्रो सामान्य शुल्क मात्र लिन्छौं।',
    en: 'Can you pay for care? We charge our normal rates — nothing more.',
  },
  {
    tone: 'open',
    icon: '🌱',
    np: 'हामी बढ्न योग्य छौं भन्ने लाग्छ भने, दान गरेर, सिफारिस गरेर, वा नियमित ग्राहक बनेर सघाउनुहोस्।',
    en: 'Believe this work deserves to grow? Donate, refer us, or return as a regular — support us however you can.',
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

  const isNP = lang === 'NP'

  function go(path) {
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        @media (max-width: 760px) {
          .cp-notice { padding: 3.5rem 1.25rem; }
          .cp-notice-grid { grid-template-columns: 1fr; }
          .cp-notice-closing { flex-direction: column; align-items: flex-start; }
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

        {/* closing banner */}
        <div style={{
          borderRadius: 'var(--radius-lg)', padding: '2.2rem 2rem',
          background: 'linear-gradient(135deg, #0f3460 0%, #2980b9 100%)',
        }}>
          <div className="cp-notice-closing">
            <p style={{
              margin: 0, flex: '1 1 380px',
              fontFamily: 'var(--font-display)', fontWeight: 600, fontStyle: 'italic',
              fontSize: 'clamp(1.05rem, 2.4vw, 1.35rem)', lineHeight: 1.55,
              color: 'var(--white)',
            }}>
              {isNP
                ? 'इच्छा वा आवश्यकताले आउनुहोस् — हठात् मनले होइन, चर्चा वा दावीले तानिएर होइन।'
                : "Come out of want, or out of need — never on a whim, and never because we're being talked about."}
            </p>

            <div className="cp-notice-cta">
              <button
                onClick={() => go('/book')}
                style={{
                  padding: '0.85rem 1.5rem', border: 'none', borderRadius: 100,
                  background: 'var(--white)', color: '#0f3460',
                  fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {isNP ? 'सत्र बुक गर्नुहोस् →' : 'Book a Session →'}
              </button>
             
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}