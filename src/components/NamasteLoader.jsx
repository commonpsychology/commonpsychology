// NamasteLoader.jsx
// Green-branded full-screen loading overlay matching the welcome page design.
// Place loadingpage.png in /public/loadingpage.png (already there).
//
// Usage:
//   const [loading, setLoading] = useState(true)
//   useEffect(() => {
//     const t = setTimeout(() => setLoading(false), 2800)
//     return () => clearTimeout(t)
//   }, [])
//   if (loading) return <NamasteLoader />

import { useEffect, useState } from 'react'

const LEAVES = [
  { left: '12%', dur: 5.5, delay: 0.2,  rot: -30, color: '#4caf50' },
  { left: '78%', dur: 4.8, delay: 1.1,  rot:  20, color: '#66bb6a' },
  { left: '55%', dur: 6.2, delay: 0.6,  rot: -15, color: '#a5d6a7' },
  { left: '30%', dur: 5.0, delay: 1.8,  rot:  35, color: '#4caf50' },
  { left: '88%', dur: 4.4, delay: 0.9,  rot: -45, color: '#81c784' },
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
        @keyframes nm-leaf-float {
          0%   { opacity: 0;   transform: translateY(0)    rotate(0deg);   }
          10%  { opacity: 0.8; }
          90%  { opacity: 0.5; }
          100% { opacity: 0;   transform: translateY(110vh) rotate(180deg); }
        }
        @keyframes nm-glow-pulse {
          0%,100% { opacity: 0.6; transform: translate(-50%,-62%) scale(1);    }
          50%     { opacity: 1;   transform: translate(-50%,-62%) scale(1.12); }
        }
        @keyframes nm-logo-entry {
          from { opacity: 0; transform: scale(0.55); }
          to   { opacity: 1; transform: scale(1);    }
        }
        @keyframes nm-logo-breathe {
          0%,100% { box-shadow: 0 0 0 6px rgba(255,255,255,0.6), 0 0 0 10px rgba(90,173,90,0.25); }
          50%     { box-shadow: 0 0 0 8px rgba(255,255,255,0.75),0 0 0 16px rgba(90,173,90,0.15); }
        }
        @keyframes nm-text-rise {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes nm-divider-grow {
          from { width: 0;    opacity: 0; }
          to   { width: 48px; opacity: 1; }
        }
        @keyframes nm-bar-fill {
          0%   { width: 0;    }
          60%  { width: 75%;  }
          100% { width: 100%; }
        }
      `}</style>

      {/* Root overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #f0faf0 0%, #e8f5e8 35%, #d4edda 70%, #c8e6c9 100%)',
        overflow: 'hidden',
        transition: 'opacity 0.6s ease',
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
        fontFamily: 'Arial, sans-serif',
      }}>

        {/* Floating leaves */}
        {LEAVES.map((l, i) => (
          <div key={i} style={{
            position: 'absolute', left: l.left, top: '-20px',
            width: 18, height: 18, opacity: 0,
            animation: `nm-leaf-float ${l.dur}s linear ${l.delay}s infinite`,
          }}>
            <svg viewBox="0 0 20 20" width="18" height="18">
              <ellipse cx="10" cy="10" rx="5" ry="9"
                fill={l.color} opacity="0.72"
                transform={`rotate(${l.rot} 10 10)`}
              />
            </svg>
          </div>
        ))}

        {/* Radial glow */}
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.7) 0%, rgba(144,238,144,0.3) 50%, transparent 75%)',
          top: '50%', left: '50%',
          animation: 'nm-glow-pulse 2.4s ease-in-out infinite',
        }} />

        {/* Logo circle */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: 110, height: 110, borderRadius: '50%',
          background: 'linear-gradient(145deg, #5aad5a, #2d8a2d)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          animation: 'nm-logo-entry 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s both, nm-logo-breathe 2.8s ease-in-out 1.2s infinite',
        }}>
          {!imgError ? (
            <img
              src="/header.png"
              alt="Logo"
              onError={() => setImgError(true)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            <span style={{ fontSize: 52, lineHeight: 1 }}>🙏</span>
          )}
        </div>

        {/* Text block */}
        <div style={{
          position: 'relative', zIndex: 2,
          textAlign: 'center', marginTop: 22,
          animation: 'nm-text-rise 1s cubic-bezier(0.22,1,0.36,1) 0.4s both',
        }}>
          <div style={{ fontSize: 38, fontWeight: 700, color: '#1b5e20', letterSpacing: '0.03em', lineHeight: 1.1 }}>
            Welcome
          </div>
          <div style={{ fontSize: 14, color: '#4a8a4a', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6 }}>
            We're here to serve you
          </div>

          {/* Divider */}
          <div style={{
            height: 2, margin: '14px auto',
            background: 'linear-gradient(90deg, transparent, #4caf50, transparent)',
            borderRadius: 2,
            animation: 'nm-divider-grow 0.8s ease 0.9s both',
          }} />

          <div style={{ fontSize: 22, color: '#2e7d32', fontWeight: 600, letterSpacing: '0.04em' }}>
            स्वागतम्
          </div>
          <div style={{ fontSize: 12, color: '#5a9e5a', marginTop: 4, letterSpacing: '0.06em' }}>
            हामी यहाँ तपाईंहरुको सेवा गर्न आएका छौँ ।
          </div>
        </div>

        {/* Values bar */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', marginTop: 20,
          border: '1.5px solid rgba(76,175,80,0.35)',
          borderRadius: 14, overflow: 'hidden',
          background: 'rgba(255,255,255,0.55)',
          animation: 'nm-text-rise 1s cubic-bezier(0.22,1,0.36,1) 0.65s both',
        }}>
          {VALUES.map((v, i) => (
            <div key={i} style={{
              padding: '10px 18px', textAlign: 'center',
              fontSize: 11, color: '#2e7d32', fontWeight: 600,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              borderRight: i < VALUES.length - 1 ? '1px solid rgba(76,175,80,0.3)' : 'none',
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
          background: 'rgba(76,175,80,0.2)',
          borderRadius: 3, marginTop: 22,
          overflow: 'hidden',
          animation: 'nm-text-rise 1s ease 0.7s both',
        }}>
          <div style={{
            height: '100%', width: 0,
            background: 'linear-gradient(90deg, #4caf50, #81c784)',
            borderRadius: 3,
            animation: 'nm-bar-fill 2.2s cubic-bezier(0.4,0,0.2,1) 0.8s forwards',
          }} />
        </div>

      </div>
    </>
  )
}