import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../context/RouterContext'

export default function PsychologicalEye() {
  const { navigate } = useRouter()
  const [hovered, setHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const sectionRef = useRef(null)

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    function handleMouse(e) {
      if (!sectionRef.current) return
      const rect = sectionRef.current.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  const eyeSize = isMobile ? 180 : 260

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.8); }
        }
        @keyframes orbitSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes orbitSpinRev {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes irisSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(0.95); }
          50% { opacity: 0.65; transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes floatUp {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(56,189,248,0.2), 0 0 24px rgba(56,189,248,0.06); }
          50% { box-shadow: 0 0 0 1px rgba(56,189,248,0.5), 0 0 40px rgba(56,189,248,0.15); }
        }

        .pe-section {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 45%, #ffffff 100%);
          padding: 0;
          font-family: 'DM Sans', sans-serif;
        }

        /* Soft blobs for depth */
        .pe-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        /* Floating particle dots */
        .pe-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }

        /* Main layout */
        .pe-inner {
          position: relative;
          z-index: 1;
          max-width: 1160px;
          margin: 0 auto;
          padding: 6rem 3rem;
          display: grid;
          align-items: center;
          gap: 5rem;
        }

        .pe-inner.desktop { grid-template-columns: 1fr 1fr; }
        .pe-inner.mobile  { grid-template-columns: 1fr; gap: 3rem; padding: 4rem 1.5rem; }

        /* Left copy */
        .pe-copy { animation: fadeInUp 0.7s ease both; }

        .pe-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(90deg, #bae6fd, #e0f2fe);
          border: 1px solid rgba(56,189,248,0.3);
          border-radius: 100px;
          padding: 5px 16px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #0369a1;
          margin-bottom: 1.5rem;
        }

        .pe-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #0ea5e9;
          animation: twinkle 2s ease-in-out infinite;
        }

        .pe-headline {
          font-family: 'Lora', serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          font-weight: 600;
          line-height: 1.18;
          color: #0c4a6e;
          margin: 0 0 1.25rem;
          letter-spacing: -0.02em;
        }

        .pe-headline em {
          font-style: italic;
          background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 50%, #7dd3fc 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .pe-desc {
          font-size: 1.05rem;
          color: #4a7a9b;
          line-height: 1.8;
          max-width: 440px;
          margin: 0 0 2.5rem;
        }

        /* Stat chips row */
        .pe-stats {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 2.5rem;
        }
        .pe-stat-chip {
          background: white;
          border: 1.5px solid #bae6fd;
          border-radius: 12px;
          padding: 10px 18px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          box-shadow: 0 2px 8px rgba(186,230,253,0.4);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pe-stat-chip:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(14,165,233,0.15);
        }
        .pe-stat-num {
          font-family: 'Lora', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: #0284c7;
          line-height: 1;
        }
        .pe-stat-label {
          font-size: 11px;
          font-weight: 600;
          color: #7ec8e3;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* CTA button */
        .pe-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, #0c4a6e, #0284c7);
          color: white;
          border: none;
          border-radius: 14px;
          padding: 14px 28px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(2,132,199,0.3), 0 1px 0 rgba(255,255,255,0.1) inset;
          transition: all 0.25s ease;
          text-decoration: none;
          letter-spacing: -0.01em;
        }
        .pe-btn:hover {
          background: linear-gradient(135deg, #0369a1, #0ea5e9);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(2,132,199,0.4);
        }
        .pe-btn-arrow {
          font-size: 18px;
          transition: transform 0.25s ease;
        }
        .pe-btn:hover .pe-btn-arrow { transform: translateX(4px); }

        /* Eye container */
        .pe-eye-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: floatUp 5s ease-in-out infinite;
        }
        .pe-eye-wrap.mobile { order: -1; }

        /* Glow rings behind eye */
        .pe-ring {
          position: absolute;
          border-radius: 50%;
          top: 50%; left: 50%;
          border: 1px solid;
          pointer-events: none;
        }

        /* Orbit track */
        .pe-orbit {
          position: absolute;
          top: 50%; left: 50%;
          border-radius: 50%;
          border: 1px dashed rgba(56,189,248,0.2);
          pointer-events: none;
        }

        /* Orbit dot spinning */
        .pe-orbit-spin {
          position: absolute;
          top: 50%; left: 50%;
          border-radius: 50%;
          pointer-events: none;
        }

        /* Corner decorative fragments */
        .pe-fragment {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }

        /* Tag pill on eye */
        .pe-eye-tag {
          position: absolute;
          bottom: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(90deg, #e0f2fe, #f0f9ff);
          border: 1px solid #bae6fd;
          border-radius: 100px;
          padding: 5px 14px;
          font-size: 12px;
          font-weight: 600;
          color: #0369a1;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .pe-eye-tag.visible {
          opacity: 1;
          transform: translateX(-50%) translateY(-4px);
        }

        /* Divider line at bottom */
        .pe-divider {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #bae6fd 30%, #bae6fd 70%, transparent);
        }
      `}</style>

      <section className="pe-section" ref={sectionRef}>

        {/* Blobs */}
        <div className="pe-blob" style={{
          width: 500, height: 500,
          background: 'rgba(56,189,248,0.08)',
          top: '-100px', right: '-80px',
        }} />
        <div className="pe-blob" style={{
          width: 400, height: 400,
          background: 'rgba(14,165,233,0.06)',
          bottom: '-60px', left: '-60px',
        }} />
        <div className="pe-blob" style={{
          width: 250, height: 250,
          background: 'rgba(186,230,253,0.2)',
          top: '40%', left: '40%',
        }} />

        {/* Floating particles */}
        {[...Array(18)].map((_, i) => (
          <div key={i} className="pe-particle" style={{
            width: i % 4 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
            height: i % 4 === 0 ? 4 : i % 3 === 0 ? 3 : 2,
            background: i % 5 === 0
              ? 'rgba(14,165,233,0.5)'
              : i % 3 === 0
                ? 'rgba(56,189,248,0.35)'
                : 'rgba(186,230,253,0.6)',
            top: `${15 + (Math.sin(i * 137.5) * 0.5 + 0.5) * 70}%`,
            left: `${(i * 5.9) % 95}%`,
            animation: `twinkle ${2.5 + (i % 4) * 0.6}s ease-in-out infinite ${i * 0.22}s`,
          }} />
        ))}

        {/* Grid */}
        <div className={`pe-inner ${isMobile ? 'mobile' : 'desktop'}`}>

          {/* ── LEFT: Copy ── */}
          <div className="pe-copy">
            <div className="pe-eyebrow">
              <span className="pe-eyebrow-dot" />
              Psychological Lens
            </div>

            <h2 className="pe-headline">
              See the world<br/>
              the way your<br/>
              <em>mind shapes it</em>
            </h2>

            <p className="pe-desc">
              World events, social phenomena, and cultural shifts — analysed through the lens of psychology.
              Understand <em style={{ fontStyle: 'italic', color: '#0284c7' }}>why</em> the world behaves the way it does.
            </p>

            {/* Stat chips */}
            <div className="pe-stats">
              {[
                { num: '200+', label: 'Insights' },
                { num: '12', label: 'Categories' },
                { num: 'Daily', label: 'Updates' },
              ].map((s, i) => (
                <div className="pe-stat-chip" key={i}>
                  <span className="pe-stat-num">{s.num}</span>
                  <span className="pe-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            <button className="pe-btn" onClick={() => navigate('/psychological-view')}>
              Enter Psychological View
              <span className="pe-btn-arrow">→</span>
            </button>
          </div>

          {/* ── RIGHT: Eye ── */}
          <div
            className={`pe-eye-wrap${isMobile ? ' mobile' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => navigate('/psychological-view')}
            style={{ cursor: 'pointer' }}
          >
            {/* Glow pulse behind */}
            <div style={{
              position: 'absolute',
              width: eyeSize * 1.6,
              height: eyeSize * 1.6,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, rgba(56,189,248,0.06) 50%, transparent 80%)',
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              animation: 'pulseGlow 3s ease-in-out infinite',
              pointerEvents: 'none',
            }} />

            {/* Orbit rings */}
            {[1.55, 1.85, 2.15].map((mult, ri) => (
              <div key={ri} className="pe-orbit" style={{
                width: eyeSize * mult,
                height: eyeSize * mult,
                marginLeft: -(eyeSize * mult) / 2,
                marginTop: -(eyeSize * mult) / 2,
                borderColor: `rgba(56,189,248,${0.18 - ri * 0.04})`,
              }} />
            ))}

            {/* Spinning orbit dots */}
            {[
              { r: eyeSize * 0.78, speed: '9s', dotSize: 7, color: '#38bdf8', delay: '0s' },
              { r: eyeSize * 0.93, speed: '14s', dotSize: 5, color: '#7dd3fc', delay: '-4s', reverse: true },
              { r: eyeSize * 1.08, speed: '20s', dotSize: 4, color: '#bae6fd', delay: '-8s' },
            ].map((o, oi) => (
              <div key={oi} className="pe-orbit-spin" style={{
                width: o.r * 2,
                height: o.r * 2,
                marginLeft: -o.r,
                marginTop: -o.r,
                animation: `${o.reverse ? 'orbitSpinRev' : 'orbitSpin'} ${o.speed} linear infinite ${o.delay}`,
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  marginLeft: -(o.dotSize / 2),
                  marginTop: -(o.dotSize / 2),
                  width: o.dotSize,
                  height: o.dotSize,
                  borderRadius: '50%',
                  background: o.color,
                  boxShadow: `0 0 6px ${o.color}`,
                }} />
              </div>
            ))}

            {/* SVG Eye */}
            <svg
              width={eyeSize}
              height={eyeSize}
              viewBox="0 0 200 200"
              style={{
                display: 'block',
                position: 'relative',
                zIndex: 2,
                filter: hovered
                  ? 'drop-shadow(0 0 20px rgba(14,165,233,0.5)) drop-shadow(0 0 50px rgba(56,189,248,0.25))'
                  : 'drop-shadow(0 0 10px rgba(14,165,233,0.25)) drop-shadow(0 0 24px rgba(186,230,253,0.3))',
                transform: hovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.4s ease, filter 0.4s ease',
              }}
            >
              {/* Outer dark circle */}
              <circle cx="100" cy="100" r="99" fill="#e0f2fe" />
              <circle cx="100" cy="100" r="99" fill="url(#eyeBg)" />

              <defs>
                <radialGradient id="eyeBg" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#f0f9ff" />
                  <stop offset="100%" stopColor="#bae6fd" />
                </radialGradient>
                <radialGradient id="irisGrad" cx="40%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0c4a6e" />
                </radialGradient>
                <radialGradient id="pupilGrad" cx="35%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#1e3a4f" />
                  <stop offset="100%" stopColor="#0a1f2d" />
                </radialGradient>
              </defs>

              {/* Eye white area */}
              <path d="M16 100 Q100 26 184 100 Q100 174 16 100Z" fill="white" opacity="0.92" />

              {/* Iris base */}
              <circle cx="100" cy="100" r="50" fill="url(#irisGrad)" />

              {/* Iris fine rings */}
              <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
              <circle cx="100" cy="100" r="43" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8" />
              <circle cx="100" cy="100" r="36" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7" />

              {/* Spinning radial iris lines */}
              <g style={{ transformOrigin: '100px 100px', animation: 'irisSpin 18s linear infinite' }}>
                {Array.from({ length: 24 }, (_, i) => {
                  const angle = (i * 15 * Math.PI) / 180
                  return (
                    <line key={i}
                      x1={100 + 36 * Math.cos(angle)}
                      y1={100 + 36 * Math.sin(angle)}
                      x2={100 + 49 * Math.cos(angle)}
                      y2={100 + 49 * Math.sin(angle)}
                      stroke="rgba(255,255,255,0.18)"
                      strokeWidth="0.8"
                    />
                  )
                })}
              </g>

              {/* Pupil */}
              <circle
                cx="100" cy="100"
                r={hovered ? 22 : 16}
                fill="url(#pupilGrad)"
                style={{ transition: 'r 0.4s ease' }}
              />

              {/* Specular highlights */}
              <circle cx="110" cy="90" r="6" fill="rgba(255,255,255,0.75)" />
              <circle cx="91"  cy="108" r="3" fill="rgba(255,255,255,0.3)" />
              <circle cx="108" cy="111" r="1.5" fill="rgba(255,255,255,0.2)" />

              {/* Lashes — top */}
              {[-40, -20, 0, 20, 40].map((dx, li) => (
                <line key={li}
                  x1={100 + dx * 0.95}
                  y1={hovered ? 49 : 54}
                  x2={100 + dx * 1.4}
                  y2={hovered ? 36 : 41}
                  stroke="#0284c7"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.6"
                  style={{ transition: 'all 0.35s ease' }}
                />
              ))}

              {/* Eye curves */}
              <path d="M16 100 Q100 26 184 100" fill="none" stroke="rgba(2,132,199,0.5)" strokeWidth="1.5" />
              <path d="M16 100 Q100 174 184 100" fill="none" stroke="rgba(2,132,199,0.25)" strokeWidth="1" />

              {/* Outer border glow ring */}
              <circle cx="100" cy="100" r="98" fill="none"
                stroke={hovered ? 'rgba(56,189,248,0.7)' : 'rgba(56,189,248,0.25)'}
                strokeWidth="1.5"
                style={{ transition: 'stroke 0.4s ease' }}
              />
            </svg>

            {/* Hover tag */}
            <div className={`pe-eye-tag ${hovered ? 'visible' : ''}`}>
              Explore insights →
            </div>
          </div>
        </div>

        <div className="pe-divider" />
      </section>
    </>
  )
}