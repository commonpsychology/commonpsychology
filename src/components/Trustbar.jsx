import { useState } from 'react'

const TRUST_ITEMS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 3L5 7v7c0 5.25 3.85 10.15 9 11.35C19.15 24.15 23 19.25 23 14V7l-9-4z"
          fill="rgba(14,165,233,0.18)" stroke="#0ea5e9" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M10 14l3 3 5-5" stroke="#0369a1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Licensed & Verified',
    desc: 'NPC-certified therapists',
    accent: '#0ea5e9',
    lightBg: 'rgba(14,165,233,0.06)',
    num: '01',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="10" fill="rgba(56,189,248,0.14)" stroke="#38bdf8" strokeWidth="1.6"/>
        <path d="M14 8v6l4 2" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: '24 / 7 Support',
    desc: 'Always here when you need us',
    accent: '#0284c7',
    lightBg: 'rgba(2,132,199,0.06)',
    num: '02',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="16" rx="4" fill="rgba(59,130,246,0.14)" stroke="#3b82f6" strokeWidth="1.6"/>
        <path d="M9 13h10M9 17h6" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="9" cy="9.5" r="1.5" fill="#3b82f6"/>
      </svg>
    ),
    label: 'Ethical Practice',
    desc: 'Confidentiality & consent',
    accent: '#3b82f6',
    lightBg: 'rgba(59,130,246,0.06)',
    num: '03',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="10" r="5" fill="rgba(14,165,233,0.14)" stroke="#0ea5e9" strokeWidth="1.6"/>
        <path d="M6 23c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="#0ea5e9" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M20 13l2 2 4-4" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Personalised Care',
    desc: 'Tailored to your unique needs',
    accent: '#7dd3fc',
    lightBg: 'rgba(125,211,252,0.08)',
    num: '04',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C9.58 4 6 7.58 6 12c0 6 8 14 8 14s8-8 8-14c0-4.42-3.58-8-8-8z"
          fill="rgba(14,165,233,0.14)" stroke="#0ea5e9" strokeWidth="1.6"/>
        <circle cx="14" cy="12" r="3" fill="#0ea5e9"/>
      </svg>
    ),
    label: 'Smooth Processing',
    desc: 'We handle the process smoothly for you',
    accent: '#38bdf8',
    lightBg: 'rgba(56,189,248,0.06)',
    num: '05',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="3" y="8" width="22" height="14" rx="3" fill="rgba(56,189,248,0.14)" stroke="#38bdf8" strokeWidth="1.6"/>
        <path d="M8 15h12M8 19h7" stroke="#0284c7" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 6l4-2 4 2 4-2" stroke="#38bdf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Evidence-Based',
    desc: 'Clinically validated methods',
    accent: '#0284c7',
    lightBg: 'rgba(2,132,199,0.06)',
    num: '06',
  },
]

// eslint-disable-next-line no-unused-vars
function TrustCard({ item, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        flex: '1 1 0',
        minWidth: 0,
        padding: '1.1rem 1rem 1rem',
        borderRadius: '14px',
        background: hovered ? item.lightBg : 'rgba(255,255,255,0.75)',
        border: `1px solid ${hovered ? item.accent + '55' : 'rgba(186,230,253,0.55)'}`,
        boxShadow: hovered
          ? `0 8px 24px rgba(14,165,233,0.1), 0 2px 6px rgba(0,0,0,0.04)`
          : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.55rem',
        overflow: 'hidden',
      }}
    >
      {/* Faint number watermark, set in the rounded display face so it
          reads as a soft page marker rather than a code artifact */}
      <div style={{
        position: 'absolute',
        top: 4, right: 11,
        fontFamily: "'Baloo 2', sans-serif",
        fontWeight: 600,
        fontSize: '0.95rem',
        color: hovered ? item.accent : 'rgba(148,163,184,0.38)',
        letterSpacing: '0.01em',
        transition: 'color 0.2s',
        userSelect: 'none',
      }}>
        {item.num}
      </div>

      {/* Bottom accent bar */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0,
        height: 2,
        width: hovered ? '100%' : '0%',
        background: `linear-gradient(90deg, ${item.accent}, transparent)`,
        transition: 'width 0.3s ease',
        borderRadius: '0 0 14px 14px',
      }} />

      {/* Icon */}
      <div style={{
        width: 44, height: 44,
        borderRadius: '11px',
        background: hovered ? item.lightBg : 'rgba(240,249,255,0.7)',
        border: `1px solid ${hovered ? item.accent + '44' : 'rgba(186,230,253,0.5)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.22s',
        flexShrink: 0,
      }}>
        {item.icon}
      </div>

      {/* Text */}
      <div>
        <div style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontSize: '0.92rem',
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: hovered ? item.accent : '#16324a',
          lineHeight: 1.25,
          marginBottom: '0.24rem',
          transition: 'color 0.18s',
        }}>
          {item.label}
        </div>
        <div style={{
          fontFamily: "'Quicksand', sans-serif",
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.005em',
          color: hovered ? '#0369a1' : '#64748b',
          lineHeight: 1.45,
          transition: 'color 0.18s',
        }}>
          {item.desc}
        </div>
      </div>
    </div>
  )
}

export default function TrustBar() {
  return (
    <div style={{
      padding: '12px 3px',
      background: 'linear-gradient(180deg, #EAF6FC 0%, #FFFFFF 50%, #F0FBFF 100%)',
      borderTop: '1px solid rgba(186,230,253,0.4)',
      borderBottom: '1px solid rgba(186,230,253,0.4)',
      boxSizing: 'border-box',
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Quicksand:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Outer card shell */}
      <div style={{
        width: '100%',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.55)',
        border: '1px solid rgba(186,230,253,0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(14,165,233,0.06), 0 1px 3px rgba(0,0,0,0.03)',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}>

        {/* Top stripe — blues only */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 35%, #7dd3fc 65%, #0ea5e9 100%)',
          backgroundSize: '200% 100%',
        }} />

        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.15rem 0.55rem',
          borderBottom: '1px solid rgba(186,230,253,0.35)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <span style={{
              display: 'inline-block',
              width: 7, height: 7, borderRadius: '50%',
              background: '#0ea5e9',
              boxShadow: '0 0 0 3px rgba(14,165,233,0.18)',
            }} />
            <span style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 600,
              fontSize: '0.82rem',
              letterSpacing: '0.01em',
              color: '#0c4a6e',
            }}>
              Your trust, our commitment
            </span>
          </div>
          <div style={{
            fontFamily: "'Quicksand', sans-serif",
            fontSize: '0.6rem',
            fontWeight: 700,
            color: 'rgba(100,116,139,0.75)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            6 pillars of care
          </div>
        </div>

        {/* Cards grid — 6 equal columns, no scroll */}
      
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
  gap: '0.55rem',
  padding: '0.65rem 0.75rem 0.75rem',
}}>
          {TRUST_ITEMS.map((item, i) => (
            <TrustCard key={i} item={item} index={i} />
          ))}
        </div>

      </div>
    </div>
  )
}