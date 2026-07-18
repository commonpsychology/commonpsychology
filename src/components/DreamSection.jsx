/**
 * DreamSection.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * All dreams float as small dim orbs across the cosmos.
 * The logged-in user's dream is larger, brighter, and highlighted.
 * Each dream follows a unique deterministic wandering path seeded by its id.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from 'react'

// ── Deterministic pseudo-random ───────────────────────────────────────────────
function seededRandom(seed) {
  let h = 2166136261 >>> 0
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return () => {
    h ^= h << 13; h ^= h >>> 17; h ^= h << 5
    return (h >>> 0) / 4294967296
  }
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function generateStars(count = 200) {
  const rng = seededRandom('cosmos-stars-v3')
  return Array.from({ length: count }, (_, i) => ({
    id:      i,
    x:       rng() * 100,
    y:       rng() * 100,
    r:       rng() * 1.4 + 0.25,
    opacity: rng() * 0.6 + 0.12,
    dur:     (rng() * 5 + 2).toFixed(2),
    delay:   (rng() * 6).toFixed(2),
  }))
}

// ── Wandering path covering all 4 corners ────────────────────────────────────
function getWanderPath(seed) {
  const rng = seededRandom(seed + '-wander')
  const regions = [
    [1,  1,  18, 20],   // top-left
    [40, 1,  60, 16],   // top-center
    [80, 1,  97, 20],   // top-right
    [82, 28, 97, 54],   // right-upper
    [80, 58, 97, 80],   // right-lower
    [52, 80, 75, 97],   // bottom-right
    [22, 80, 50, 97],   // bottom-left
    [1,  60, 18, 80],   // left-lower
    [1,  26, 18, 54],   // left-upper
    [30, 28, 68, 70],   // center
  ]
  const pts = regions.map(([x1, y1, x2, y2]) => ({
    x: x1 + rng() * (x2 - x1),
    y: y1 + rng() * (y2 - y1),
  }))
  const n = pts.length
  let d = `M ${pts[0].x.toFixed(2)},${pts[0].y.toFixed(2)}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`
  }
  return d + ' Z'
}

// ── Per-dream visual props ────────────────────────────────────────────────────
function getDreamProps(seed, isMine) {
  const rng = seededRandom(seed + '-props')
  return {
    hue:   isMine ? 210 : Math.floor(rng() * 360),  // 210 = deep sky blue
    size:  isMine ? rng() * 0.3 + 2   : rng() * 0.8 + 0.6,   // mine: 4–6, others: 1–1.8
    glowR: isMine ? rng() * 0.1 + 0.6   : rng() * 0.4 + 0.2, // mine: 3–5, others: 0.8–1.6
    dur:   isMine
      ? (rng() * 30 + 50).toFixed(0) + 's'
      : (rng() * 50 + 60).toFixed(0) + 's',
    begin: '-' + (rng() * 60).toFixed(0) + 's',
  }
}
const STARS = generateStars(200)

// ── Cosmos SVG — renders all orbs ────────────────────────────────────────────
function CosmosBg({ allDreams, myDream }) {
  // Build data for each dream: path id must be unique per dream
  const dreamData = allDreams.map(d => {
    const isMine = myDream && d.id === myDream.id
    const seed   = d.id
    const props  = getDreamProps(seed, isMine)
    const path   = getWanderPath(seed)
    const pathId = `wp-${d.id.replace(/-/g, '')}`
    return { ...d, isMine, props, path, pathId }
  })

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden="true"
    >
      <defs>
        {/* Bluish-white space sky — deep indigo-blue instead of flat black */}
        <radialGradient id="cosmosGrad" cx="50%" cy="50%" r="75%">
          <stop offset="0%"   stopColor="#1a2740" />
          <stop offset="55%"  stopColor="#0e1830" />
          <stop offset="100%" stopColor="#060c1c" />
        </radialGradient>
        {/* Soft blue-white nebulae so the orbs sit on a lit, airy sky */}
        <radialGradient id="neb1" cx="20%" cy="15%" r="45%">
          <stop offset="0%" stopColor="#8fb4e0" stopOpacity="0.16"/><stop offset="100%" stopColor="#8fb4e0" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="neb2" cx="80%" cy="75%" r="40%">
          <stop offset="0%" stopColor="#a9c8ee" stopOpacity="0.14"/><stop offset="100%" stopColor="#a9c8ee" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="neb3" cx="60%" cy="8%"  r="35%">
          <stop offset="0%" stopColor="#cfe0f7" stopOpacity="0.12"/><stop offset="100%" stopColor="#cfe0f7" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="neb4" cx="8%"  cy="82%" r="38%">
          <stop offset="0%" stopColor="#7ea3d6" stopOpacity="0.12"/><stop offset="100%" stopColor="#7ea3d6" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="neb5" cx="92%" cy="28%" r="32%">
          <stop offset="0%" stopColor="#bcd4f2" stopOpacity="0.10"/><stop offset="100%" stopColor="#bcd4f2" stopOpacity="0"/>
        </radialGradient>

        {/* Per-dream radial gradient for core glow */}
        {dreamData.map(({ id, props, pathId, isMine }) => (
          <radialGradient key={id} id={`dg-${pathId}`} cx="40%" cy="35%" r="60%">
            {isMine ? <>
              <stop offset="0%"   stopColor="#a8d8f0" stopOpacity="1"   />
              <stop offset="35%"  stopColor="#3a8fc4" stopOpacity="0.95"/>
              <stop offset="70%"  stopColor="#1a5a9a" stopOpacity="0.85"/>
              <stop offset="100%" stopColor="#0a2a5e" stopOpacity="0"   />
            </> : <>
              <stop offset="0%"   stopColor={`hsl(${props.hue},35%,78%)`} stopOpacity="0.6" />
              <stop offset="55%"  stopColor={`hsl(${props.hue},25%,55%)`} stopOpacity="0.35"/>
              <stop offset="100%" stopColor={`hsl(${props.hue},20%,35%)`} stopOpacity="0"   />
            </>}
          </radialGradient>
        ))}

        {/* Motion paths — defined once in defs */}
        {dreamData.map(({ pathId, path }) => (
          <path key={pathId} id={pathId} d={path} />
        ))}
      </defs>

      {/* Sky */}
      <rect width="100" height="100" fill="url(#cosmosGrad)" />
      <rect width="100" height="100" fill="url(#neb1)" />
      <rect width="100" height="100" fill="url(#neb2)" />
      <rect width="100" height="100" fill="url(#neb3)" />
      <rect width="100" height="100" fill="url(#neb4)" />
      <rect width="100" height="100" fill="url(#neb5)" />

      {/* Stars */}
      {STARS.map(s => (
        <circle key={s.id} cx={s.x} cy={s.y} r={s.r * 0.15} fill="white" opacity={s.opacity}>
          <animate attributeName="opacity"
            values={`${s.opacity};${Math.min(1, s.opacity + 0.5)};${s.opacity}`}
            dur={`${s.dur}s`} begin={`-${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Render OTHER dreams first (behind), mine on top */}
      {[...dreamData.filter(d => !d.isMine), ...dreamData.filter(d => d.isMine)].map(dream => {
        const { pathId, props, isMine } = dream
        const href = `#${pathId}`

        return (
          <g key={dream.id}>
            {/* Outer pulse ring — only for mine */}
            {isMine && (
              <circle r={props.glowR * 1.1} fill="none"
                stroke={isMine ? '#5baad4' : `hsl(${props.hue},40%,72%)`}
                strokeWidth="0.2" strokeOpacity="0.35">
                <animateMotion dur={props.dur} begin={props.begin} repeatCount="indefinite" rotate="none">
                  <mpath href={href} />
                </animateMotion>
                <animate attributeName="r"
                  values={`${props.glowR * 0.9};${props.glowR * 1.8};${props.glowR * 0.9}`}
                  dur="10s" repeatCount="indefinite" />
                <animate attributeName="stroke-opacity"
                  values="0.35;0.04;0.35" dur="10s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Soft mid glow */}
            <circle r={props.size * 0.65}
              fill={`hsl(${props.hue},${isMine?72:30}%,${isMine?55:55}%)`}
              opacity={isMine ? 0.2 : 0.08}>
              <animateMotion dur={props.dur} begin={props.begin} repeatCount="indefinite" rotate="none">
                <mpath href={href} />
              </animateMotion>
            </circle>

            {/* Core orb */}
            <circle r={props.size * 0.42} fill={`url(#dg-${pathId})`} opacity={isMine ? 1 : 0.55}>
              <animateMotion dur={props.dur} begin={props.begin} repeatCount="indefinite" rotate="none">
                <mpath href={href} />
              </animateMotion>
            </circle>

            {/* Center sparkle */}
            <circle r={isMine ? props.size * 0.1 : props.size * 0.18}
              fill="white"
              opacity={isMine ? 0.9 : 0.5}>
              <animateMotion dur={props.dur} begin={props.begin} repeatCount="indefinite" rotate="none">
                <mpath href={href} />
              </animateMotion>
              <animate attributeName="opacity"
                values={isMine ? '0.9;0.2;0.9' : '0.5;0.15;0.5'}
                dur={isMine ? '3.5s' : '5s'} repeatCount="indefinite" />
            </circle>
          </g>
        )
      })}
    </svg>
  )
}

// ── Dream text labels (SVG layer on top) ──────────────────────────────────────
function DreamLabels({ allDreams, myDream }) {
  const dreamData = allDreams.map(d => {
    const isMine = myDream && d.id === myDream.id
    const seed   = d.id
    const props  = getDreamProps(seed, isMine)
    const path   = getWanderPath(seed)
    const pathId = `lp-${d.id.replace(/-/g, '')}`
    const words  = d.dream_text.split(' ').slice(0, isMine ? 8 : 4).join(' ')
      + (d.dream_text.split(' ').length > (isMine ? 8 : 4) ? '…' : '')
    return { ...d, isMine, props, path, pathId, words }
  })

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
      aria-hidden="true"
    >
      <defs>
        {dreamData.map(({ pathId, path }) => (
          <path key={pathId} id={pathId} d={path} />
        ))}
      </defs>

      {/* Others first, mine on top */}
      {[...dreamData.filter(d => !d.isMine), ...dreamData.filter(d => d.isMine)].map(dream => {
        const { pathId, props, isMine, words } = dream
        const offsetY = props.size * 0.42 + (isMine ? 3.5 : 2)

        return (
          <text
            key={dream.id}
            textAnchor="middle"
            fill={isMine ? '#eaf4ff' : `hsl(${props.hue}, 45%, 88%)`}
            fontSize={isMine ? '0.7' : '0.8'}
            fontFamily="Georgia, serif"
            fontStyle="italic"
            fontWeight={isMine ? 'bold' : 'normal'}
            opacity={isMine ? 0.95 : 0.55}
            style={{
              filter: isMine
                ? 'drop-shadow(0 0 2px rgba(6,12,28,0.85))'
                : 'drop-shadow(0 0 1.2px rgba(6,12,28,0.75))',
            }}
          >
            <animateMotion dur={props.dur} begin={props.begin} repeatCount="indefinite" rotate="none">
              <mpath href={`#${pathId}`} />
            </animateMotion>
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0 ${offsetY}`}
              additive="sum"
              dur="1s" repeatCount="1" fill="freeze"
            />
            "{words}"
          </text>
        )
      })}
    </svg>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DreamSection({ user, onRequestLogin, apiBase, authToken }) {
  const [dreamText,     setDreamText]     = useState('')
  const [existingDream, setExistingDream] = useState(null)
  const [allDreams,     setAllDreams]     = useState([])
  const [loading,       setLoading]       = useState(false)
  const [fetching,      setFetching]      = useState(false)
  const [error,         setError]         = useState(null)
  const [planted,       setPlanted]       = useState(false)
  const fontsInjected                     = useRef(false)

  // Inject keyframes
  useEffect(() => {
    if (fontsInjected.current) return
    fontsInjected.current = true
    const style = document.createElement('style')
    style.textContent = `
      @keyframes cosmosReveal { from{opacity:0} to{opacity:1} }
      @keyframes pulseRing {
        0%   { box-shadow: 0 0 0 0    rgba(180,190,200,0.45); }
        70%  { box-shadow: 0 0 0 18px rgba(180,190,200,0);    }
        100% { box-shadow: 0 0 0 0    rgba(180,190,200,0);    }
      }
      @keyframes glowPulse {
        0%,100% { text-shadow: 0 0 30px rgba(170,205,240,0.35); }
        50%      { text-shadow: 0 0 48px rgba(190,215,245,0.55); }
      }
    `
    document.head.appendChild(style)
  }, [])

  // Fetch ALL dreams (public)
  useEffect(() => {
    fetch(`${apiBase}/api/dreams/all`)
      .then(r => r.json())
      .then(data => { if (data.success) setAllDreams(data.dreams || []) })
      .catch(() => {})
  }, [apiBase])

  // Fetch MY dream when logged in
  useEffect(() => {
    if (!user || !authToken) { setExistingDream(null); return }
    setFetching(true)
    fetch(`${apiBase}/api/dreams/mine`, {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.dream) {
          setExistingDream(data.dream)
          setDreamText(data.dream.dream_text)
        }
      })
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [user, authToken, apiBase])

  const hasDream   = !!existingDream
  const isLoggedIn = !!user

  // Merge: if my dream isn't already in allDreams, add it
  const mergedDreams = existingDream && !allDreams.find(d => d.id === existingDream.id)
    ? [existingDream, ...allDreams]
    : allDreams

  const buttonLabel = () => {
    if (!isLoggedIn) return '✦ Sign in to Plant Your Dream'
    if (fetching)    return 'Reaching into the cosmos…'
    if (loading)     return 'Planting…'
    if (hasDream)    return '✦ Dream is Floating in the Cosmos'
    return '✦ Plant Dream into Cosmos'
  }

  const handleClick = async () => {
    if (!isLoggedIn) { onRequestLogin(); return }
    if (hasDream || loading || fetching) return
    if (!dreamText.trim()) { setError('Write your dream first.'); return }

    setError(null)
    setLoading(true)
    try {
      const res  = await fetch(`${apiBase}/api/dreams`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` },
        body:    JSON.stringify({ dream_text: dreamText.trim() }),
      })
      const data = await res.json()

      if (res.status === 409 || data.message === 'Dream already planted.') {
        const r2 = await fetch(`${apiBase}/api/dreams/mine`, { headers: { Authorization: `Bearer ${authToken}` } })
        const d2 = await r2.json()
        if (d2.success && d2.dream) {
          setExistingDream(d2.dream)
          setAllDreams(prev => prev.find(d => d.id === d2.dream.id) ? prev : [d2.dream, ...prev])
        }
        return
      }

      if (!data.success) { setError(data.message || 'Something went wrong.'); return }

      setExistingDream(data.dream)
      setAllDreams(prev => [data.dream, ...prev])
      setPlanted(true)
      setTimeout(() => setPlanted(false), 3000)
    } catch {
      setError('Could not reach the cosmos. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{
      minHeight: '100vh', position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', boxSizing: 'border-box', animation: 'cosmosReveal 1.2s ease both',
      background: '#060c1c',
    }}>
      {/* Fade toward the light Therapists section below */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '16%',
        background: 'linear-gradient(to bottom, transparent 0%, #f8fafc 100%)',
        pointerEvents: 'none', zIndex: 15,
      }} />

      {/* Cosmos with all floating orbs */}
      <CosmosBg allDreams={mergedDreams} myDream={existingDream} />

      {/* Dream text labels */}
      {mergedDreams.length > 0 && (
        <DreamLabels allDreams={mergedDreams} myDream={existingDream} />
      )}

      {/* UI */}
      <div style={{ position: 'relative', zIndex: 20, maxWidth: '520px', width: '100%', textAlign: 'center' }}>

        <div style={{ marginBottom: '40px' }}>
          <span style={{ fontFamily: "'Lato',sans-serif", fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#9aa5b1', fontWeight: 700, display: 'block', marginBottom: '14px' }}>
            The Dream Cosmos
          </span>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,4.5vw,48px)', fontWeight: 400, color: '#eef1f5', margin: '0 0 16px', lineHeight: 1.2, animation: 'glowPulse 4s ease-in-out infinite' }}>
            Plant Your Dream <em style={{ color: '#c7cdd6', fontStyle: 'italic' }}>into the Stars</em>
          </h2>
          <p style={{ fontFamily: "'Lato',sans-serif", fontSize: '14px', color: '#8b95a1', margin: '0 auto', maxWidth: '400px', lineHeight: 1.8, fontWeight: 300 }}>
            {hasDream
              ? 'Your dream drifts bright among the others — a constellation of souls.'
              : allDreams.length > 0
                ? `${allDreams.length} dream${allDreams.length !== 1 ? 's' : ''} already float in the cosmos. Add yours.`
                : 'One dream per soul. Once planted, it floats among the stars forever.'}
          </p>
        </div>

        {isLoggedIn && (
          <div style={{ marginBottom: '28px', position: 'relative' }}>
            <textarea
              value={dreamText}
              onChange={e => !hasDream && setDreamText(e.target.value)}
              disabled={hasDream || loading}
              placeholder="Whisper your dream into the cosmos…"
              maxLength={280}
              rows={4}
              style={{
                width: '100%', padding: '18px 20px', borderRadius: '16px',
                border: hasDream
                  ? '1.5px solid rgba(180,190,200,0.35)'
                  : error
                    ? '1.5px solid #f87171'
                    : '1.5px solid rgba(150,160,172,0.3)',
                background: 'rgba(8,8,10,0.75)',
                backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                color: hasDream ? '#c9cfd6' : '#eef1f5',
                fontFamily: "'Playfair Display',serif", fontStyle: 'italic',
                fontSize: '15px', lineHeight: 1.7,
                resize: 'none', outline: 'none', boxSizing: 'border-box',
                cursor: hasDream ? 'default' : 'text',
                transition: 'border-color 0.3s ease',
                boxShadow: hasDream ? '0 0 24px rgba(180,190,200,0.12)' : '0 4px 24px rgba(0,0,0,0.5)',
              }}
            />
            {!hasDream && (
              <span style={{ position: 'absolute', bottom: '10px', right: '14px', fontSize: '11px', color: '#475569', fontFamily: "'Lato',sans-serif" }}>
                {dreamText.length}/280
              </span>
            )}
          </div>
        )}

        {error && (
          <p style={{ fontFamily: "'Lato',sans-serif", fontSize: '13px', color: '#fca5a5', marginBottom: '16px', textShadow: '0 0 8px rgba(248,113,113,0.4)' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleClick}
          disabled={hasDream || loading || fetching}
          style={{
            padding: '15px 36px', borderRadius: '999px',
            border: hasDream ? '1.5px solid rgba(180,190,200,0.3)' : '1.5px solid rgba(160,170,182,0.5)',
            background: hasDream
              ? 'rgba(180,190,200,0.08)'
              : loading
                ? 'rgba(90,98,110,0.35)'
                : 'linear-gradient(135deg,rgba(30,32,38,0.9),rgba(55,60,70,0.9))',
            color: hasDream ? '#c9cfd6' : '#eef1f5',
            fontFamily: "'Lato',sans-serif", fontSize: '13px', fontWeight: 700,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: hasDream || loading || fetching ? 'default' : 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            boxShadow: hasDream ? 'none' : '0 4px 24px rgba(0,0,0,0.5)',
            animation: planted ? 'pulseRing 0.7s ease-out' : 'none',
            opacity: fetching ? 0.6 : 1,
          }}
          onMouseEnter={e => {
            if (!hasDream && !loading && !fetching && isLoggedIn) {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.65)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = hasDream ? 'none' : '0 4px 24px rgba(0,0,0,0.5)'
          }}
        >
          {buttonLabel()}
        </button>

        {planted && (
          <p style={{ marginTop: '20px', fontFamily: "'Playfair Display',serif", fontStyle: 'italic', fontSize: '14px', color: '#c9cfd6', textShadow: '0 0 20px rgba(200,210,220,0.5)', animation: 'cosmosReveal 0.6s ease' }}>
            ✦ Your dream now drifts among all the others ✦
          </p>
        )}

        {!isLoggedIn && (
          <p style={{ marginTop: '20px', fontFamily: "'Lato',sans-serif", fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
            Sign in to plant your dream and watch it float among the others forever.
          </p>
        )}
      </div>

      {/* Dream count badge */}
      {mergedDreams.length > 0 && (
        <div style={{
          position: 'absolute', top: '24px', right: '24px', zIndex: 20,
          background: 'rgba(8,8,10,0.7)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(160,170,182,0.22)', borderRadius: '999px',
          padding: '6px 14px', fontFamily: "'Lato',sans-serif",
          fontSize: '11px', color: '#9aa5b1', fontWeight: 700, letterSpacing: '0.08em',
        }}>
          ✦ {mergedDreams.length} dream{mergedDreams.length !== 1 ? 's' : ''} in the cosmos
        </div>
      )}

      <p style={{ position: 'absolute', bottom: '24px', fontFamily: "'Lato',sans-serif", fontSize: '11px', color: '#334155', textAlign: 'center', zIndex: 20, margin: 0 }}>
        One dream per soul · Planted forever
      </p>
    </section>
  )
}