// src/pages/PsychDetailPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import ReactMarkdown from 'react-markdown'

// FIX: API_BASE now correctly includes /api — no double /api/api/ issue
const API_BASE = (import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api')
  .replace(/\/+$/, '')

const C = {
  bgDark:'#0c1e2b', bgDeep:'#0f2744', bgGreen:'#0a1e1a',
  blueDeep:'#1a3a4a', blueMid:'#2e6080', blueSoft:'#5b9ab5',
  bluePale:'#b0d4e8', blueMist:'#e6f2f8',
  sky:'#38BDF8', skyBright:'#00BFFF', skyLight:'#E0F7FF', skyFainter:'#F0FBFF',
  greenDeep:'#1a3320', greenMid:'#2d4a3e', greenPale:'#b8d5c8', greenMist:'#e8f3ee',
  white:'#ffffff', offWhite:'#f6f9fb',
  textDark:'#0f2035', textMid:'#2e5068', textLight:'#7a9aaa', borderFaint:'#daeef8',
}

const heroGrad = `linear-gradient(145deg, ${C.bgDark} 0%, ${C.blueDeep} 50%, ${C.bgGreen} 100%)`
const sideGrad = `linear-gradient(135deg, ${C.blueDeep} 0%, ${C.sky} 100%)`

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
}

const mdComponents = {
  h2: ({ children }) => (
    <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'1.45rem',
      color:C.blueDeep, margin:'2.25rem 0 0.8rem', lineHeight:1.3,
      borderBottom:`2px solid ${C.skyLight}`, paddingBottom:'0.5rem' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'1.1rem',
      color:C.blueMid, margin:'1.75rem 0 0.5rem', lineHeight:1.35 }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.97rem',
      color:C.textMid, lineHeight:1.9, margin:'0 0 1.1rem' }}>
      {children}
    </p>
  ),
  ul: ({ children }) => <ul style={{ margin:'0.5rem 0 1.25rem 1.25rem', padding:0 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin:'0.5rem 0 1.25rem 1.25rem', padding:0 }}>{children}</ol>,
  li: ({ children }) => (
    <li style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.95rem',
      color:C.textMid, lineHeight:1.8, marginBottom:'0.4rem' }}>
      {children}
    </li>
  ),
  strong: ({ children }) => <strong style={{ color:C.textDark, fontWeight:700 }}>{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft:`4px solid ${C.sky}`, background:C.skyFainter,
      margin:'1.75rem 0', padding:'1.1rem 1.4rem', borderRadius:'0 12px 12px 0' }}>
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code style={{ background:C.skyLight, color:C.blueDeep, padding:'2px 7px',
      borderRadius:4, fontSize:'0.88rem', fontFamily:'monospace' }}>
      {children}
    </code>
  ),
}

function AnalysisVisual({ analysis, height=240 }) {
  const colorMap = {
    'var(--blue-mist)':   `linear-gradient(135deg,#e6f2f8,#b0d4e8)`,
    'var(--sky-light)':   `linear-gradient(135deg,#E0F7FF,#b0d4e8)`,
    'var(--green-mist)':  `linear-gradient(135deg,#e8f3ee,#b8d5c8)`,
    'var(--earth-cream)': `linear-gradient(135deg,#f5ede0,#d4b896)`,
  }
  const bg = colorMap[analysis.color_var] || `linear-gradient(135deg,${C.skyLight},${C.blueMist})`
  return (
    <div style={{ width:'100%', height, background:bg,
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', gap:'0.75rem' }}>
      <span style={{ fontSize:'4.5rem', filter:'drop-shadow(0 4px 16px rgba(0,0,0,0.12))' }}>
        {analysis.icon || '🧠'}
      </span>
      <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.72rem',
        fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase',
        color:C.blueMid, background:'rgba(255,255,255,0.6)', padding:'4px 14px', borderRadius:100 }}>
        {analysis.category}
      </span>
    </div>
  )
}

function Loader() {
  return (
    <div style={{ minHeight:'70vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:C.offWhite }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, border:`3px solid ${C.skyLight}`,
          borderTop:`3px solid ${C.sky}`, borderRadius:'50%',
          animation:'spin 0.8s linear infinite', margin:'0 auto 1rem' }} />
        <p style={{ fontFamily:"'Nunito',sans-serif", color:C.textLight, fontSize:'0.9rem' }}>
          Loading analysis…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}

export default function PsychDetailPage() {
  const { params, navigate } = useRouter()
  const slug = params?.slug || ''

  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)
    // FIX: API_BASE already has /api, so just /psych/${slug} — no double /api/api/
    fetch(`${API_BASE}/psych/${slug}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => { setAnalysis(d.analysis || d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [slug])

  if (loading) return <Loader />

  if (error || !analysis) return (
    <div style={{ minHeight:'70vh', display:'flex', alignItems:'center',
      justifyContent:'center', flexDirection:'column', gap:'1rem', background:C.offWhite }}>
      <div style={{ fontSize:'3.5rem' }}>😕</div>
      <p style={{ fontFamily:"'Nunito',sans-serif", color:C.textLight, fontSize:'1.05rem' }}>
        Analysis not found.
      </p>
      <button onClick={() => navigate('/psychological-view')}
        style={{ padding:'0.65rem 1.5rem', borderRadius:10, background:sideGrad,
          color:'white', border:'none', cursor:'pointer',
          fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>
        ← Back to Psychological View
      </button>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap');
        *{box-sizing:border-box}
        @media(max-width:900px){
          .psych-detail-grid{grid-template-columns:1fr !important}
          .psych-detail-hero{padding:5rem 1.5rem 2.25rem !important}
          .psych-detail-body{padding:2rem 1.5rem !important}
        }
      `}</style>

      <div style={{ background:C.offWhite, minHeight:'100vh', paddingTop:72 }}>

        {/* HERO */}
        <div className="psych-detail-hero"
          style={{ background:heroGrad, padding:'5.5rem 6rem 3rem',
            position:'relative', overflow:'hidden', color:'white' }}>
          {[320,220,130].map((r,i) => (
            <div key={i} style={{ position:'absolute', right:-r/2, top:'50%',
              transform:'translateY(-50%)', width:r*2, height:r*2, borderRadius:'50%',
              border:`1px solid rgba(56,189,248,${0.07+i*0.03})`, pointerEvents:'none' }} />
          ))}
          <div style={{ maxWidth:1100, margin:'0 auto', position:'relative', zIndex:1 }}>
            <button onClick={() => navigate('/psychological-view')}
              style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)',
                color:'white', borderRadius:100, padding:'0.3rem 1.1rem',
                fontFamily:"'Nunito',sans-serif", fontSize:'0.78rem', fontWeight:600,
                cursor:'pointer', marginBottom:'1.5rem', backdropFilter:'blur(8px)' }}>
              ← Back to Psychological View
            </button>
            <div style={{ display:'flex', gap:'0.6rem', alignItems:'center',
              marginBottom:'0.85rem', flexWrap:'wrap' }}>
              {analysis.category && (
                <span style={{ background:'rgba(56,189,248,0.2)', backdropFilter:'blur(8px)',
                  color:'white', fontSize:'0.72rem', fontWeight:700, padding:'4px 13px',
                  borderRadius:100, border:'1px solid rgba(56,189,248,0.4)' }}>
                  {analysis.icon} {analysis.category}
                </span>
              )}
              <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.78rem' }}>
                {fmtDate(analysis.published_at)}{analysis.read_time ? ` · ${analysis.read_time} read` : ''}
              </span>
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif",
              fontSize:'clamp(1.7rem,3.5vw,2.6rem)', color:'white',
              lineHeight:1.22, maxWidth:800, marginBottom:'1.25rem', fontWeight:400 }}>
              {analysis.title}
            </h1>
            {(analysis.concepts || []).length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'0.45rem', marginTop:'0.5rem' }}>
                {analysis.concepts.map((c, i) => (
                  <span key={i} style={{ background:'rgba(56,189,248,0.15)',
                    border:'1px solid rgba(56,189,248,0.3)', color:'rgba(255,255,255,0.85)',
                    fontSize:'0.7rem', fontWeight:600, padding:'3px 11px',
                    borderRadius:100, fontFamily:"'Nunito',sans-serif" }}>
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="psych-detail-body"
          style={{ maxWidth:1100, margin:'0 auto', padding:'3rem 6rem',
            display:'grid', gridTemplateColumns:'1fr 340px', gap:'3rem', alignItems:'start' }}>

          <div>
            {analysis.excerpt && (
              <div style={{ background:`linear-gradient(135deg,${C.skyFainter},${C.greenMist})`,
                border:`1px solid ${C.borderFaint}`, borderLeft:`4px solid ${C.sky}`,
                borderRadius:'0 14px 14px 0', padding:'1.3rem 1.6rem', marginBottom:'2.25rem' }}>
                <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:'1rem',
                  color:C.textMid, lineHeight:1.8, margin:0, fontStyle:'italic' }}>
                  {analysis.excerpt}
                </p>
              </div>
            )}
            {analysis.content ? (
              <ReactMarkdown components={mdComponents}>{analysis.content}</ReactMarkdown>
            ) : (
              <div style={{ padding:'2.5rem', textAlign:'center', background:C.white,
                borderRadius:14, border:`1px dashed ${C.borderFaint}` }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>🧠</div>
                <p style={{ fontFamily:"'Nunito',sans-serif", color:C.textLight, fontSize:'0.9rem' }}>
                  Full analysis coming soon.
                </p>
              </div>
            )}
            {(analysis.tags || []).length > 0 && (
              <div style={{ marginTop:'2.5rem', paddingTop:'1.5rem', borderTop:`1px solid ${C.borderFaint}` }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.75rem',
                  fontWeight:800, color:C.textLight, marginBottom:'0.75rem',
                  textTransform:'uppercase', letterSpacing:'0.09em' }}>Tags</div>
                <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                  {analysis.tags.map(tag => (
                    <span key={tag} style={{ fontSize:'0.75rem', padding:'4px 13px',
                      borderRadius:100, background:C.skyLight, color:C.blueMid,
                      fontWeight:600, fontFamily:"'Nunito',sans-serif" }}>#{tag}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ marginTop:'3rem' }}>
              <button onClick={() => navigate('/psychological-view')}
                style={{ padding:'0.78rem 2rem', borderRadius:10, background:sideGrad,
                  color:'white', border:'none', cursor:'pointer',
                  fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:'0.9rem',
                  boxShadow:`0 4px 18px rgba(56,189,248,0.28)` }}>
                ← Back to Psychological View
              </button>
            </div>
          </div>

          <aside style={{ position:'sticky', top:'6rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <div style={{ borderRadius:16, overflow:'hidden', boxShadow:`0 8px 36px rgba(56,189,248,0.14)` }}>
              <AnalysisVisual analysis={analysis} height={220} />
            </div>
            <div style={{ background:C.white, borderRadius:14, border:`1px solid ${C.borderFaint}`,
              padding:'1.3rem', boxShadow:`0 2px 14px rgba(56,189,248,0.06)` }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.7rem', fontWeight:800,
                color:C.textLight, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1rem' }}>
                Analysis Info
              </div>
              {[
                { label:'Category',  value: analysis.category || '—' },
                { label:'Published', value: fmtDate(analysis.published_at) || '—' },
                { label:'Read Time', value: analysis.read_time ? `${analysis.read_time} read` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', padding:'0.55rem 0', borderBottom:`1px solid ${C.borderFaint}` }}>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.78rem', color:C.textLight }}>{label}</span>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.78rem',
                    fontWeight:700, color:C.textDark }}>{value}</span>
                </div>
              ))}
            </div>
            {(analysis.concepts || []).length > 0 && (
              <div style={{ background:`linear-gradient(135deg,${C.bgDark},${C.blueDeep})`,
                borderRadius:14, padding:'1.3rem', boxShadow:`0 4px 20px rgba(0,0,0,0.2)` }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.7rem', fontWeight:800,
                  color:'rgba(56,189,248,0.7)', textTransform:'uppercase',
                  letterSpacing:'0.1em', marginBottom:'1rem' }}>Key Concepts</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                  {analysis.concepts.map((concept, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:C.sky, flexShrink:0 }} />
                      <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.82rem',
                        fontWeight:600, color:'rgba(255,255,255,0.82)' }}>{concept}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ background:heroGrad, borderRadius:14, padding:'1.6rem',
              textAlign:'center', boxShadow:`0 8px 28px rgba(0,0,0,0.25)`,
              border:`1px solid rgba(56,189,248,0.2)` }}>
              <div style={{ fontSize:'1.6rem', marginBottom:'0.5rem' }}>🧠</div>
              <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'1.05rem',
                color:'white', marginBottom:'0.4rem' }}>Need Support?</div>
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.78rem',
                color:'rgba(255,255,255,0.7)', marginBottom:'1.1rem', lineHeight:1.6 }}>
                Talk to one of our licensed therapists today.
              </p>
              <button onClick={() => navigate('/book')}
                style={{ padding:'0.65rem 1.3rem', borderRadius:8, background:C.white,
                  color:C.blueDeep, border:'none', fontFamily:"'Nunito',sans-serif",
                  fontWeight:700, fontSize:'0.83rem', cursor:'pointer', width:'100%' }}>
                Book a Session
              </button>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
