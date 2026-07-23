import { useState } from 'react'
import { TOKENS, sectionGradientCSS } from '../styles/oceanTheme'

// Each line keeps a distinct shade so the three helplines stay easy to
// tell apart, but all three now sit inside the ocean-blue family instead
// of mixing in green and indigo — matches the rest of the homepage.
const lines = [
  { icon: '☎️', name: 'TPO Nepal Helpline', phone: '01-4524082', color: TOKENS.oceanBright, glow: 'rgba(0,191,255,0.15)' },
  { icon: '💬', name: 'Suicide Prevention Helpline', phone: '1166', color: TOKENS.oceanCore, glow: 'rgba(0,123,168,0.15)' },
  { icon: '🏥', name: 'Mental Health Helpline', phone: '9851223769', color: TOKENS.oceanDeep, glow: 'rgba(0,85,128,0.15)' },
]

function PhoneCard({ line }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={`tel:${line.phone}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.9rem',
        padding: '0.85rem 1.1rem',
        borderRadius: '14px',
        background: hovered ? `${line.glow}` : 'rgba(240,251,255,0.7)',
        border: `1px solid ${hovered ? line.color + '66' : 'rgba(190,233,251,0.6)'}`,
        textDecoration: 'none',
        transition: 'all 0.24s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateX(5px)' : 'translateX(0)',
        boxShadow: hovered ? `0 6px 20px ${line.glow}` : '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Emoji icon box */}
      <div style={{
        width: 42, height: 42, borderRadius: '11px', flexShrink: 0,
        background: hovered ? line.glow : TOKENS.oceanPale,
        border: `1px solid ${hovered ? line.color + '44' : 'rgba(190,233,251,0.7)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.1rem',
        transition: 'all 0.24s',
      }}>
        {line.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: '0.76rem',
          fontWeight: 600,
          color: TOKENS.dim,
          marginBottom: '0.15rem',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {line.name}
        </div>
        <div className="phone-number-text" style={{
          fontFamily: "'DM Mono', 'Fira Mono', monospace",
          fontSize: '0.95rem',
          fontWeight: 700,
          color: hovered ? line.color : TOKENS.oceanInk,
          letterSpacing: '0.04em',
          transition: 'color 0.2s',
        }}>
          {line.phone}
        </div>
      </div>

      {/* Arrow */}
      <svg
        width="16" height="16" viewBox="0 0 16 16" fill="none"
        style={{
          flexShrink: 0,
          opacity: hovered ? 1 : 0.3,
          transform: hovered ? 'translateX(2px)' : 'translateX(0)',
          transition: 'all 0.22s',
        }}
      >
        <path d="M3 8h10M9 4l4 4-4 4" stroke={line.color} strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}

export default function Crisis() {
  return (
    <section className="crisis-section">
      <style>{sectionGradientCSS('crisis-section')}</style>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '780px',
          borderRadius: '24px',
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${TOKENS.white} 0%, ${TOKENS.skyLight} 60%, ${TOKENS.oceanPale} 100%)`,
          border: `1px solid ${TOKENS.bluePale}`,
          boxShadow: '0 8px 40px rgba(0,123,168,0.1), 0 2px 8px rgba(0,0,0,0.05)',
        }}>

          {/* Top accent bar */}
          <div style={{
            height: 3,
            background: `linear-gradient(90deg, ${TOKENS.oceanBright} 0%, ${TOKENS.oceanCore} 50%, ${TOKENS.oceanDeep} 100%)`,
          }} />

          {/* Background orbs */}
          <div style={{
            position: 'absolute', top: -60, right: -60,
            width: 200, height: 200, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,191,255,0.10) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: -40, left: -40,
            width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,85,128,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Inner layout */}
          <div className="crisis-inner-grid" style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.1fr)',
            gap: '0',
            alignItems: 'stretch',
          }}>

            {/* LEFT — text */}
            <div className="crisis-left" style={{
              padding: '2rem 1.75rem 2rem 2rem',
              borderRight: `1px solid ${TOKENS.bluePale}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '0.75rem',
            }}>
              {/* Tag — kept red intentionally: red is the universal urgency
                  signal for a crisis line, and shouldn't be softened into
                  the brand blue just for palette consistency. */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontFamily: "'Inter', monospace",
                fontSize: '0.6rem',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#dc2626',
                background: 'rgba(254,226,226,0.7)',
                border: '1px solid rgba(252,165,165,0.5)',
                borderRadius: '99px',
                padding: '3px 10px',
                width: 'fit-content',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#ef4444',
                  display: 'inline-block',
                  animation: 'pulse-dot 1.8s ease-in-out infinite',
                }} />
                Crisis Support
              </span>

              <h2 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '1.55rem',
                fontWeight: 800,
                color: TOKENS.oceanInk,
                lineHeight: 1.2,
                margin: 0,
              }}>
                You Are{' '}
                <span style={{
                  background: `linear-gradient(135deg, ${TOKENS.oceanBright}, ${TOKENS.oceanDeep})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Not Alone
                </span>
              </h2>

              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '0.8rem',
                lineHeight: 1.7,
                color: TOKENS.dim,
                margin: 0,
              }}>
                If you or someone you know is in emotional distress, reach out to these
                free, confidential helplines available in Nepal.
              </p>

              {/* Decorative dots */}
              <div style={{ display: 'flex', gap: '5px', marginTop: '0.25rem' }}>
                {[TOKENS.oceanBright, TOKENS.oceanCore, TOKENS.oceanDeep].map((c, i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: c, opacity: 0.5,
                  }} />
                ))}
              </div>
            </div>

            {/* RIGHT — phone cards */}
            <div className="crisis-right" style={{
              padding: '1.6rem 1.75rem 1.6rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
              justifyContent: 'center',
            }}>
              {lines.map((l, i) => (
                <PhoneCard key={i} line={l} />
              ))}
            </div>
          </div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,800&family=Inter:wght@400;500;600;700&display=swap');
            @keyframes pulse-dot {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(0.7); }
            }
            @media (max-width: 640px) {
              .crisis-inner-grid { grid-template-columns: 1fr !important; }
              .crisis-left {
                padding: 1.5rem 1.25rem 1rem !important;
                border-right: none !important;
                border-bottom: 1px solid ${TOKENS.bluePale} !important;
              }
              .crisis-right { padding: 1.25rem !important; }
              .phone-number-text {
                font-size: 0.85rem !important;
                letter-spacing: 0.02em !important;
                word-break: break-word !important;
              }
            }
          `}</style>
        </div>
      </div>
    </section>
  )
}