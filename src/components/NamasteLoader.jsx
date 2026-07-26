// NamasteLoader.jsx
// Blue-branded full-screen loading overlay matching the Common Psychology website header.
// Place header.png in /public/header.png
//
// Usage:
//   const [loading, setLoading] = useState(true)
//   useEffect(() => {
//     const t = setTimeout(() => setLoading(false), 2800)
//     return () => clearTimeout(t)
//   }, [])
//   if (loading) return <NamasteLoader />

import { useEffect, useState } from 'react'

const PARTICLES = [
  { left: '10%', dur: 5.5, delay: 0.2,  size: 6, color: 'rgba(0,176,240,0.5)' },
  { left: '75%', dur: 4.8, delay: 1.1,  size: 5, color: 'rgba(255,255,255,0.6)' },
  { left: '52%', dur: 6.2, delay: 0.6,  size: 4, color: 'rgba(0,140,200,0.4)' },
  { left: '28%', dur: 5.0, delay: 1.8,  size: 7, color: 'rgba(255,255,255,0.5)' },
  { left: '85%', dur: 4.4, delay: 0.9,  size: 5, color: 'rgba(0,176,240,0.45)' },
  { left: '40%', dur: 5.8, delay: 1.4,  size: 4, color: 'rgba(255,255,255,0.4)' },
]

const VALUES = [
  { icon: '♥',  label: 'We Care'    },
  { icon: '🤝', label: 'We Respect' },
  { icon: '🛡', label: 'We Protect' },
  { icon: '👥', label: 'We Serve'   },
]

export default function NamasteLoader({ duration = 2800, onDone }) {
  const [fading, setFading] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true),  duration - 600)
    const t2 = setTimeout(() => onDone?.(),        duration)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [duration, onDone])

  return (
    <>
      <style>{`
        @keyframes nm-particle-float {
          0%   { opacity: 0;   transform: translateY(0) scale(0.5);   }
          10%  { opacity: 1; }
          90%  { opacity: 0.4; }
          100% { opacity: 0;   transform: translateY(-110vh) scale(1.2); }
        }
        @keyframes nm-glow-pulse {
          0%,100% { opacity: 0.5; transform: translate(-50%,-58%) scale(1);    }
          50%     { opacity: 0.85; transform: translate(-50%,-58%) scale(1.1); }
        }
        @keyframes nm-logo-entry {
          from { opacity: 0; transform: scale(0.55); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes nm-logo-breathe {
          0%,100% { box-shadow: 0 0 0 5px rgba(255,255,255,0.5), 0 0 0 10px rgba(0,176,240,0.2); }
          50%     { box-shadow: 0 0 0 7px rgba(255,255,255,0.65), 0 0 0 16px rgba(0,176,240,0.12); }
        }
        @keyframes nm-text-rise {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes nm-divider-grow {
          from { width: 0;    opacity: 0; }
          to   { width: 56px; opacity: 1; }
        }
        @keyframes nm-bar-fill {
          0%   { width: 0;    }
          60%  { width: 75%;  }
          100% { width: 100%; }
        }
        @keyframes nm-wave {
          0%   { background-position: 0% 50%;   }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%;   }
        }

        .nm-values-bar {
          background: linear-gradient(135deg, rgba(255,255,255,0.55), rgba(0,191,255,0.25));
          border: 1.5px solid rgba(0,191,255,0.45);
          box-shadow: 0 4px 24px rgba(0,191,255,0.25), inset 0 1px 1px rgba(255,255,255,0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .nm-values-bar .nm-value-item {
          border-right: 1px solid rgba(0,191,255,0.3);
        }
        .nm-values-bar .nm-value-item:last-child {
          border-right: none;
        }

        @media (max-width: 480px) {
          .nm-values-bar {
            margin-top: 14px !important;
            border-radius: 10px !important;
          }
          .nm-values-bar .nm-value-item {
            padding: 6px 10px !important;
            font-size: 9px !important;
            gap: 2px !important;
          }
          .nm-values-bar .nm-value-item span {
            font-size: 14px !important;
          }
        }
      `}</style>

      {/* Root overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(150deg, #e8f7fd 0%, #c8ecf9 25%, #a8dff5 55%, #7dcef0 80%, #4db8e8 100%)',
        backgroundSize: '200% 200%',
        animation: 'nm-wave 8s ease infinite',
        overflow: 'hidden',
        transition: 'opacity 0.6s ease',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
        fontFamily: 'Arial, sans-serif',
      }}>

        {/* Floating particles / bubbles */}
        {PARTICLES.map((p, i) => (
          <div key={i} style={{
            position: 'absolute', left: p.left, bottom: '-20px',
            width: p.size * 2, height: p.size * 2,
            borderRadius: '50%',
            background: p.color,
            border: '1px solid rgba(255,255,255,0.5)',
            opacity: 0,
            animation: `nm-particle-float ${p.dur}s ease-in ${p.delay}s infinite`,
          }} />
        ))}

        {/* Radial glow */}
        <div style={{
          position: 'absolute', width: 340, height: 340, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(0,176,240,0.2) 50%, transparent 75%)',
          top: '50%', left: '50%',
          animation: 'nm-glow-pulse 2.6s ease-in-out infinite',
        }} />

        {/* Logo circle */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: 110, height: 110, borderRadius: '50%',
          background: 'linear-gradient(145deg, #0099cc, #006fa6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          border: '3px solid rgba(255,255,255,0.75)',
          animation: 'nm-logo-entry 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s both, nm-logo-breathe 2.8s ease-in-out 1.2s infinite',
        }}>
          {!imgError ? (
            <img
              src="/header.png"
              alt="Common Psychology Logo"
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            <span style={{ fontSize: 52, lineHeight: 1 }}>🧠</span>
          )}
        </div>

        {/* Text block */}
        <div style={{
          position: 'relative', zIndex: 2,
          textAlign: 'center', marginTop: 22,
          animation: 'nm-text-rise 1s cubic-bezier(0.22,1,0.36,1) 0.4s both',
        }}>
          {/* Brand name */}
          <div style={{
            fontSize: 13, fontWeight: 700, color: '#005580',
            letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 4,
          }}>
            Common Psychology
          </div>

          <div style={{ fontSize: 36, fontWeight: 700, color: '#003a52', letterSpacing: '0.02em', lineHeight: 1.15 }}>
            Welcome
          </div>
          <div style={{ fontSize: 13, color: '#006fa6', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 5 }}>
            Mental Wellness Center
          </div>

          {/* Divider */}
          <div style={{
            height: 2, margin: '14px auto',
            background: 'linear-gradient(90deg, transparent, rgba(0,140,200,0.7), transparent)',
            borderRadius: 2,
            animation: 'nm-divider-grow 0.8s ease 0.9s both',
          }} />

          <div style={{ fontSize: 22, color: '#003a52', fontWeight: 600, letterSpacing: '0.04em' }}>
            स्वागतम्
          </div>
          <div style={{ fontSize: 12, color: '#005580', marginTop: 4, letterSpacing: '0.06em' }}>
            हामी यहाँ तपाईंहरुको सेवा गर्न आएका छौँ ।
          </div>
        </div>

        {/* Values bar */}
        <div className="nm-values-bar" style={{
          position: 'relative', zIndex: 2,
          display: 'flex', marginTop: 20,
          borderRadius: 14, overflow: 'hidden',
          animation: 'nm-text-rise 1s cubic-bezier(0.22,1,0.36,1) 0.65s both',
        }}>
          {VALUES.map((v, i) => (
            <div key={i} className="nm-value-item" style={{
              padding: '10px 18px', textAlign: 'center',
              fontSize: 11, color: '#004d73', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontSize: 18 }}>{v.icon}</span>
              {v.label}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: 200, height: 3,
          background: 'rgba(0,140,200,0.2)',
          borderRadius: 3, marginTop: 22,
          overflow: 'hidden',
          animation: 'nm-text-rise 1s ease 0.7s both',
        }}>
          <div style={{
            height: '100%', width: 0,
            background: 'linear-gradient(90deg, #0099cc, #66d1f5)',
            borderRadius: 3,
            animation: 'nm-bar-fill 2.2s cubic-bezier(0.4,0,0.2,1) 0.8s forwards',
          }} />
        </div>

      </div>
    </>
  )
}