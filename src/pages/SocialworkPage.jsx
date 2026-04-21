import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const C = {
  skyBright:  '#00BFFF',
  skyMid:     '#009FD4',
  skyDeep:    '#007BA8',
  skyFaint:   '#E0F7FF',
  skyFainter: '#F0FBFF',
  skyGhost:   '#F8FEFF',
  white:      '#ffffff',
  mint:       '#e8f3ee',
  textDark:   '#1a3a4a',
  textMid:    '#2e6080',
  textLight:  '#7a9aaa',
  border:     '#b0d4e8',
  borderFaint:'#daeef8',
}

const heroGrad    = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyMid} 40%, ${C.skyBright} 80%, #22d3ee 100%)`
const sectionGrad = `linear-gradient(135deg, ${C.skyFainter} 0%, ${C.mint} 60%, ${C.skyFaint} 100%)`
const btnGrad     = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyBright} 100%)`

/* ── Responsive columns hook ── */
function useGridColumns() {
  const getColumns = (w) => {
    if (w < 480) return 1
    if (w < 900) return 2
    return 3
  }
  const [cols, setCols] = useState(() => getColumns(typeof window !== 'undefined' ? window.innerWidth : 1024))
  useEffect(() => {
    const handler = () => setCols(getColumns(window.innerWidth))
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return cols
}

const IMPACT = [
  { icon: '🏘️', val: '6',    label: 'Communities Reached' },
  { icon: '👥', val: '100+', label: 'Beneficiaries' },
  { icon: '🤝', val: '7',    label: 'NGO Partners' },
  { icon: '📅', val: '1 yrs', label: 'Of Outreach' },
]

// Collect all unique partners across all programs for the partners strip
function collectAllPartners(programs) {
  const seen = new Set()
  const result = []
  for (const p of programs) {
    for (const partner of (Array.isArray(p.partners) ? p.partners : [])) {
      if (!seen.has(partner)) { seen.add(partner); result.push(partner) }
    }
  }
  return result
}

/* ══════════════════════════════════════
   PROGRAM CARD
══════════════════════════════════════ */
function ProgramCard({ prog, onReadMore }) {
  const [hovered, setHovered] = useState(false)

  // Normalize: API uses short_desc, legacy uses desc
  const cardDesc = prog.short_desc || prog.desc || ''
  const tags     = Array.isArray(prog.tags)     ? prog.tags     : []
  const outcomes = Array.isArray(prog.outcomes) ? prog.outcomes : []

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20, background: C.white,
        position: 'relative', overflow: 'visible',
        cursor: 'pointer',
        boxShadow: hovered
          ? `0 2px 0 0 ${C.skyDeep},
             0 5px 0 0 ${C.skyMid}bb,
             0 9px 0 0 ${C.skyBright}55,
             0 22px 52px rgba(0,191,255,0.2),
             inset 0 1px 0 rgba(255,255,255,0.9)`
          : `0 2px 12px rgba(0,191,255,0.06), inset 0 1px 0 rgba(255,255,255,0.8)`,
        border: `1.5px solid ${hovered ? C.skyBright : C.borderFaint}`,
        transform: hovered ? 'translateY(-7px) scale(1.013)' : 'translateY(0) scale(1)',
        transition: 'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Image */}
      <div style={{
        height: 160, borderRadius: '18px 18px 0 0',
        background: prog.img_gradient || prog.img || heroGrad,
        position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent', transition: 'background 0.3s' }} />
        <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))', position: 'relative' }}>{prog.emoji}</span>

        {/* Status pill */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(0,255,120,0.2)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,255,120,0.35)', borderRadius: 100,
          padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', display: 'inline-block', boxShadow: '0 0 6px #00e676' }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', letterSpacing: '0.06em', fontFamily: 'var(--font-body)' }}>
            {(prog.status || 'ACTIVE').toUpperCase()}
          </span>
        </div>

        {/* Since badge */}
        {prog.since && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: 100, padding: '3px 10px',
            fontSize: '0.65rem', fontWeight: 700, color: 'white',
            fontFamily: 'var(--font-body)',
          }}>Since {prog.since}</div>
        )}
      </div>

      {/* Floating type label */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(100% - 185px)',
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 10,
        background: hovered ? btnGrad : C.white,
        border: `1.5px solid ${hovered ? C.skyBright : C.border}`,
        borderRadius: 100, padding: '5px 16px',
        boxShadow: hovered
          ? '0 4px 20px rgba(0,191,255,0.35), inset 0 1px 0 rgba(255,255,255,0.3)'
          : '0 4px 14px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 800,
          color: hovered ? 'white' : C.textMid,
          letterSpacing: '0.05em', transition: 'color 0.3s',
        }}>{prog.type}</span>
      </div>

      {/* Body */}
      <div style={{ padding: '1.4rem 1.4rem 1.3rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: C.textDark, lineHeight: 1.35, marginBottom: '0.3rem' }}>{prog.title}</h3>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.74rem', color: C.skyMid, fontWeight: 700, marginBottom: '0.7rem' }}>📍 {prog.region}</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.79rem', color: C.textLight, lineHeight: 1.62, marginBottom: '0.9rem' }}>{cardDesc}</p>

        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
            {tags.map(t => (
              <span key={t} style={{
                fontSize: '0.65rem', fontWeight: 700, padding: '2px 9px', borderRadius: 100,
                background: hovered ? C.skyFaint : C.skyFainter,
                color: C.skyMid, border: `1px solid ${C.borderFaint}`,
                transition: 'background 0.3s',
              }}>#{t}</span>
            ))}
          </div>
        )}

        {/* Outcomes */}
        {outcomes.length > 0 && (
          <div style={{ background: sectionGrad, borderRadius: 10, padding: '0.7rem 0.9rem', marginBottom: '1rem', border: `1px solid ${C.borderFaint}` }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 800, color: C.textLight, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Key Outcomes</div>
            {outcomes.map((o, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: i < outcomes.length - 1 ? '0.25rem' : 0 }}>
                <span style={{ width: 14, height: 14, borderRadius: '50%', background: btnGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.5rem', color: 'white', fontWeight: 800 }}>✓</span>
                </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: C.textMid }}>{o}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: C.textDark, fontWeight: 700 }}>{prog.beneficiaries}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: C.textLight }}>beneficiaries</div>
          </div>
          <button onClick={() => onReadMore(prog)}
            style={{
              padding: '0.5rem 1.1rem', borderRadius: 10, border: 'none',
              background: hovered ? btnGrad : C.skyFaint,
              color: hovered ? 'white' : C.skyMid,
              fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.3s ease',
              boxShadow: hovered ? '0 4px 14px rgba(0,191,255,0.35)' : 'none',
            }}>Learn More →</button>
        </div>
      </div>
    </div>
  )
}

// ── Loading skeleton ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{ borderRadius: 20, background: C.white, border: `1.5px solid ${C.borderFaint}`, overflow: 'hidden' }}>
      <div style={{ height: 160, background: `linear-gradient(90deg, ${C.skyFaint} 25%, ${C.skyFainter} 50%, ${C.skyFaint} 75%)`, backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '1.4rem' }}>
        {[80, 50, 100, 100, 70].map((w, i) => (
          <div key={i} style={{ height: 12, width: `${w}%`, background: C.skyFainter, borderRadius: 6, marginBottom: '.6rem' }} />
        ))}
      </div>
    </div>
  )
}

export default function SocialWorkPage() {
  const { navigate } = useRouter()
  const [selected,  setSelected]  = useState(null)
  const [programs,  setPrograms]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [fetchErr,  setFetchErr]  = useState('')

  const gridCols = useGridColumns()
  const gridTemplateColumns =
    gridCols === 1 ? '1fr' :
    gridCols === 2 ? 'repeat(2, 1fr)' :
    'repeat(auto-fill, minmax(320px, 1fr))'

  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  useEffect(() => {
    const handler = () => setWinWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Fetch programs from backend
  useEffect(() => {
    ;(async () => {
      setLoading(true); setFetchErr('')
      try {
        const res = await fetch(`${API_BASE}/social-work-programs`)
        const d   = await res.json()
        if (!res.ok) throw new Error(d.message || `HTTP ${res.status}`)
        setPrograms(d.programs || d.items || [])
      } catch (e) {
        setFetchErr(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const heroPadding  = winWidth < 480 ? '3rem 1.25rem 2.5rem' : winWidth < 768 ? '4rem 2rem 3rem' : '5rem 4rem 4rem'
  const innerPadding = winWidth < 480 ? '2rem 1.25rem 4rem' : winWidth < 768 ? '2.5rem 2rem 4rem' : '3rem 4rem 5rem'
  const allPartners  = collectAllPartners(programs)

  return (
    <div className="page-wrapper" style={{ background: C.skyGhost }}>

      {/* ── Shimmer CSS ── */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0 }
          100% { background-position: 200% 0 }
        }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ background: heroGrad, padding: heroPadding, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 100, padding: '0.3rem 1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.92)', textTransform: 'uppercase' }}>🤝 Community Social Work</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 3rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>
            Mental Health for<br />Every Nepali
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, maxWidth: 520, marginBottom: '2.5rem' }}>
            Beyond the clinic — reaching underserved communities, rural villages, schools, and shelters. Our social work programmes bring mental health support to those who need it most.
          </p>
          <div style={{ display: 'flex', gap: winWidth < 480 ? '1.25rem' : '2rem', flexWrap: 'wrap' }}>
            {IMPACT.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '0.1rem' }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'white', fontWeight: 700 }}>{s.val}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: innerPadding }}>

        {/* Section header */}
        <div style={{ background: sectionGrad, borderRadius: 16, padding: '1.4rem 2rem', marginBottom: '2.5rem', border: `1px solid ${C.borderFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: C.textDark, margin: 0 }}>Our Active Programmes</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: C.textMid, margin: '0.3rem 0 0' }}>All programmes are free or heavily subsidised for beneficiaries.</p>
          </div>
          <button onClick={() => navigate('/contact')}
            style={{ padding: '0.55rem 1.3rem', borderRadius: 10, border: 'none', background: btnGrad, color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,191,255,0.3)', whiteSpace: 'nowrap' }}>
            Partner With Us
          </button>
        </div>

        {/* Error state */}
        {fetchErr && !loading && (
          <div style={{ padding: '2rem', textAlign: 'center', color: C.textLight, fontSize: '.85rem' }}>
            ⚠️ Could not load programs: {fetchErr}
          </div>
        )}

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns, gap: '2rem', paddingTop: '0.5rem' }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : programs.map(p => (
                <ProgramCard key={p.id} prog={p} onReadMore={setSelected} />
              ))
          }
        </div>

        {/* Partners strip — only shown when we have programs */}
        {!loading && allPartners.length > 0 && (
          <div style={{ marginTop: '4rem', background: sectionGrad, borderRadius: 16, padding: '2rem', border: `1px solid ${C.borderFaint}` }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: C.textDark, marginBottom: '1.25rem', textAlign: 'center' }}>Our Partners & Funders</div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {allPartners.map((p, i) => (
                <div key={i} style={{ padding: '0.45rem 1.1rem', borderRadius: 100, background: C.white, border: `1px solid ${C.border}`, fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600, color: C.textMid, boxShadow: '0 2px 8px rgba(0,191,255,0.06)' }}>{p}</div>
              ))}
            </div>
          </div>
        )}

        {/* Volunteer CTA */}
        <div style={{
          marginTop: '2rem', padding: winWidth < 480 ? '2rem 1.5rem' : '3rem', background: heroGrad, borderRadius: 20,
          display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap',
          boxShadow: '0 16px 48px rgba(0,191,255,0.2)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'white', marginBottom: '0.5rem' }}>Volunteer With Us</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65 }}>
              Mental health professionals, social workers, and trained volunteers are always needed. Join our team and make a difference in underserved communities.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', position: 'relative' }}>
            <button onClick={() => navigate('/volunteer')} style={{ padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none', background: C.white, color: C.skyDeep, fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer' }}>Apply to Volunteer →</button>
          </div>
        </div>
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(26,58,74,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 24, padding: winWidth < 480 ? '1.5rem' : '2.5rem', maxWidth: 520, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', border: `1.5px solid ${C.skyBright}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ height: 6, background: btnGrad, borderRadius: 3, marginBottom: '1.5rem' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2.5rem' }}>{selected.emoji}</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: C.textDark, margin: 0 }}>{selected.title}</h3>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: C.skyMid, fontWeight: 700, marginTop: 3 }}>📍 {selected.region}</div>
              </div>
            </div>

            {/* Full description (falls back to short if not set) */}
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: C.textMid, lineHeight: 1.7, marginBottom: '1.25rem' }}>
              {selected.full_desc || selected.short_desc || selected.desc || ''}
            </p>

            {/* Outcomes */}
            {Array.isArray(selected.outcomes) && selected.outcomes.length > 0 && (
              <div style={{ background: sectionGrad, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', border: `1px solid ${C.borderFaint}` }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Outcomes</div>
                {selected.outcomes.map((o, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ color: C.skyBright, fontWeight: 800, fontSize: '0.8rem' }}>✓</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: C.textMid }}>{o}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Partners */}
            {Array.isArray(selected.partners) && selected.partners.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Partners</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {selected.partners.map(p => (
                    <span key={p} style={{ padding: '3px 10px', borderRadius: 100, background: C.skyFaint, color: C.skyMid, fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${C.borderFaint}` }}>{p}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '0.7rem', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, color: C.textMid, fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer' }}>Close</button>
              <button onClick={() => { navigate('/contact'); setSelected(null) }} style={{ flex: 2, padding: '0.7rem', borderRadius: 10, border: 'none', background: btnGrad, color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,191,255,0.35)' }}>Get Involved →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
