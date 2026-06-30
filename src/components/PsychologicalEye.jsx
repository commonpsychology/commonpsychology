import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../context/RouterContext'

export default function PsychologicalEye() {
  const { navigate } = useRouter()
  const [hovered, setHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const ref = useRef(null)

  /* Detect breakpoint */
  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const eyeSize = isMobile ? 160 : 220

  return (
    <section style={{
      background: 'linear-gradient(145deg, #0c1e2b 0%, #1a3a4a 40%, #0d2233 100%)',
      padding: isMobile ? '3.5rem 1.5rem' : '5rem 6rem',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: isMobile ? '2.5rem' : '4rem',
      position: 'relative',
      overflow: 'hidden',
      textAlign: isMobile ? 'center' : 'left',
    }}>

      {/* Twinkling stars */}
      <style>{`
        @keyframes twinkle{0%,100%{opacity:.25;transform:scale(1)}50%{opacity:.9;transform:scale(1.5)}}
        @keyframes pulse-ring{0%,100%{transform:scale(.94);opacity:.6}50%{transform:scale(1.06);opacity:1}}
        @keyframes iris-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      `}</style>
      {[...Array(20)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute', borderRadius: '50%',
          width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
          background: 'rgba(255,255,255,0.35)',
          top: `${Math.sin(i * 137.5) * 45 + 50}%`,
          left: `${(i * 5.1) % 100}%`,
          animation: `twinkle ${2 + (i % 3)}s ease-in-out infinite ${i * 0.18}s`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* LEFT — copy (order 2 on mobile so eye is on top) */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, order: isMobile ? 2 : 1 }}>
        <span className="section-tag" style={{ color: 'rgba(176,212,232,0.7)' }}>New Perspective</span>
        <h2 className="section-title" style={{
          color: 'white',
          fontSize: isMobile ? '1.7rem' : 'clamp(1.8rem,3vw,2.8rem)',
          marginBottom: '1rem',
        }}>
          See the World Through a<br />
          <em style={{ color: 'var(--sky)' }}>Psychological Lens</em>
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: isMobile ? '0.9rem' : '1rem',
          color: 'rgba(255,255,255,0.55)', lineHeight: 1.8,
          maxWidth: isMobile ? '100%' : 480,
          margin: isMobile ? '0 auto 2rem' : '0 0 2rem',
        }}>
          World events, social phenomena, and cultural shifts — analysed through the lens of psychology.
          Understand why the world behaves the way it does.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: isMobile ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/psychological-view')}>
            Enter Psychological View →
          </button>
        </div>
      </div>

      {/* RIGHT — Eye (order 1 on mobile so it's on top) */}
      <div
        ref={ref}
        style={{
          flexShrink: 0, cursor: 'pointer',
          position: 'relative', zIndex: 1,
          order: isMobile ? 1 : 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => navigate('/psychological-view')}
      >
        {/* Outer pulse rings */}
        {[1, 2, 3].map(r => (
          <div key={r} style={{
            position: 'absolute',
            width: eyeSize + r * 36,
            height: eyeSize + r * 36,
            borderRadius: '50%',
            border: `1px solid rgba(0,191,255,${0.12 - r * 0.03})`,
            animation: `pulse-ring ${2 + r * 0.5}s ease-in-out infinite ${r * 0.3}s`,
            pointerEvents: 'none',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
          }} />
        ))}

        <svg
          width={eyeSize} height={eyeSize}
          viewBox="0 0 200 200"
          style={{
            display: 'block',
            filter: hovered
              ? 'drop-shadow(0 0 28px rgba(0,191,255,0.75)) drop-shadow(0 0 60px rgba(0,191,255,0.3))'
              : 'drop-shadow(0 0 14px rgba(0,191,255,0.4))',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.35s ease, filter 0.35s ease',
          }}
        >
          {/* Background circle */}
          <circle cx="100" cy="100" r="98" fill="#06111a" stroke="rgba(0,191,255,0.2)" strokeWidth="1"/>

          {/* Eye white */}
          <path d="M18 100 Q100 28 182 100 Q100 172 18 100Z" fill="#e8f4ff"/>

          {/* Iris rings */}
          <circle cx="100" cy="100" r="46" fill="#1a6090"/>
          <circle cx="100" cy="100" r="40" fill="none" stroke="rgba(0,191,255,0.35)" strokeWidth="1.2"/>
          <circle cx="100" cy="100" r="32" fill="#0e4266"/>

          {/* Spinning iris lines */}
          <g style={{ transformOrigin: '100px 100px', animation: 'iris-spin 14s linear infinite' }}>
            {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
              <line key={a} x1="100" y1="60" x2="100" y2="54"
                stroke="rgba(0,191,255,0.4)" strokeWidth="1.2"
                transform={`rotate(${a},100,100)`}
              />
            ))}
          </g>

          {/* Pupil — dilates on hover */}
          <circle cx="100" cy="100" r={hovered ? 20 : 14} fill="#030d14" style={{ transition: 'r 0.35s ease' }}/>

          {/* Shine dots */}
          <circle cx="109" cy="91"  r="5.5" fill="rgba(255,255,255,0.72)"/>
          <circle cx="90"  cy="109" r="2.5" fill="rgba(255,255,255,0.28)"/>

          {/* Lashes — fan upward on hover */}
          {[-44,-22,0,22,44].map((dx, li) => (
            <line key={li}
              x1={100 + dx}   y1={hovered ? 52 : 56}
              x2={100 + dx * 1.35} y2={hovered ? 40 : 44}
              stroke="rgba(176,212,232,0.6)" strokeWidth="1.6" strokeLinecap="round"
              style={{ transition: 'all 0.3s ease' }}
            />
          ))}

          {/* Eye outline curves */}
          <path d="M18 100 Q100 28 182 100"  fill="none" stroke="rgba(0,191,255,0.45)" strokeWidth="1.5"/>
          <path d="M18 100 Q100 172 182 100" fill="none" stroke="rgba(0,191,255,0.25)" strokeWidth="1"/>

          {/* Orbit dots */}
          {[0,72,144,216,288].map((angle, oi) => {
            const rad = (angle * Math.PI) / 180
            return (
              <circle key={oi}
                cx={100 + 82 * Math.cos(rad)}
                cy={100 + 82 * Math.sin(rad)}
                r="2.5"
                fill={`rgba(0,191,255,${0.3 + oi * 0.1})`}
              />
            )
          })}

          {/* Hover "Explore" label */}
          {hovered && (
            <text x="100" y="190" textAnchor="middle" fontFamily="var(--font-body)" fontSize="11" fill="rgba(0,191,255,0.85)" fontWeight="600">
              Explore →
            </text>
          )}
        </svg>
      </div>
    </section>
  )
}
