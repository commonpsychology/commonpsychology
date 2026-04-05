// NamasteLoader.jsx
// Full-screen loading overlay with namaste animation.
// Usage: render before your homepage mounts, then unmount when ready.
//
// Example in your HomePage:
//   const [loading, setLoading] = useState(true)
//   useEffect(() => { const t = setTimeout(() => setLoading(false), 2800); return () => clearTimeout(t) }, [])
//   if (loading) return <NamasteLoader />

import { useEffect, useState } from 'react'

export default function NamasteLoader({ duration = 2800, onDone }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeAt = duration - 600
    const t1 = setTimeout(() => setFading(true), fadeAt)
    const t2 = setTimeout(() => onDone?.(), duration)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [duration, onDone])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap');

        .nm-root {
          position: fixed; inset: 0; z-index: 9999;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          background: var(--nm-bg, #fdfaf6);
          transition: opacity 0.6s ease;
        }
        .nm-root.nm-fade { opacity: 0; pointer-events: none; }

        /* ---- Mandala ---- */
        .nm-mandala {
          position: absolute;
          width: 360px; height: 360px;
          opacity: 0;
          animation: nm-appear 1.2s ease 0.3s forwards;
        }
        .nm-ring-1 {
          transform-origin: 180px 180px;
          animation: nm-spin 18s linear infinite;
        }
        .nm-ring-2 {
          transform-origin: 180px 180px;
          animation: nm-spin-rev 24s linear infinite;
        }
        @keyframes nm-spin     { to { transform: rotate(360deg); } }
        @keyframes nm-spin-rev { to { transform: rotate(-360deg); } }

        /* ---- Hands ---- */
        .nm-hands {
          position: relative; z-index: 2;
          animation: nm-rise 1s cubic-bezier(0.22,1,0.36,1) 0.2s both;
        }

        /* ---- Text ---- */
        .nm-word {
  color: #ffffff;
  font-weight: 800;
  font-size: 28px;
  letter-spacing: 0.04em;
}

.nm-sub {
  color: rgba(255,255,255,0.85);
  font-weight: 600;
  font-size: 14px;
  margin-top: 4px;
}

.nm-dots {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  justify-content: center;
}

.nm-dot {
  width: 6px;
  height: 6px;
  background: #ffffff;
  border-radius: 50%;
  opacity: 0.7;
}        /* ---- Centre glow ---- */
        .nm-glow {
          position: absolute; width: 8px; height: 8px; border-radius: 50%;
          background: #c8a97a; top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          animation: nm-glow-pulse 2.5s ease-in-out infinite;
        }

        @keyframes nm-appear { to { opacity: 1; } }
        @keyframes nm-rise   { from { opacity:0; transform: translateY(28px); } to { opacity:1; transform: translateY(0); } }
        @keyframes nm-up     { from { opacity:0; transform: translateY(8px);  } to { opacity:1; transform: translateY(0); } }
        @keyframes nm-dot-pulse {
          0%,100% { opacity:.2; transform: scale(.8); }
          50%     { opacity: 1; transform: scale(1.4); }
        }
        @keyframes nm-glow-pulse {
          0%,100% { opacity:.35; transform: translate(-50%,-50%) scale(1);   }
          50%     { opacity: 1;  transform: translate(-50%,-50%) scale(2.4); }
        }

        @media (prefers-color-scheme: dark) {
          .nm-root { --nm-bg: #1a1410; }
          .nm-word { color: #e8d9c4; }
          .nm-sub  { color: #9a8a7a; }
        }
      `}</style>

      <div className={`nm-root${fading ? ' nm-fade' : ''}`}>
        <div className="nm-glow" />

        {/* Mandala */}
        <svg className="nm-mandala" viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg">
          <g className="nm-ring-1" opacity="0.14">
            {[0,45,90,135,180,225,270,315].map(r => (
              <ellipse key={r} cx="180" cy="118" rx="15" ry="36" fill="#c8a97a"
                transform={r ? `rotate(${r} 180 180)` : undefined}/>
            ))}
          </g>
          <g className="nm-ring-2" opacity="0.10">
            {Array.from({length:12},(_,i)=>i*30).map(r => (
              <circle key={r} cx="180" cy="68" r="5.5" fill="#c8a97a"
                transform={r ? `rotate(${r} 180 180)` : undefined}/>
            ))}
          </g>
          <circle cx="180" cy="180" r="20"  fill="none" stroke="#c8a97a" strokeWidth="0.8" opacity="0.22"/>
          <circle cx="180" cy="180" r="68"  fill="none" stroke="#c8a97a" strokeWidth="0.5" opacity="0.14"/>
          <circle cx="180" cy="180" r="112" fill="none" stroke="#c8a97a" strokeWidth="0.5" opacity="0.09"/>
        </svg>

        
      <div className="nm-word">Namaste</div>
<div className="nm-sub">We Bow to You</div>
<div className="nm-dots">
  <div className="nm-dot"/>
  <div className="nm-dot"/>
  <div className="nm-dot"/>
</div>
      </div>
    </>
  )
}