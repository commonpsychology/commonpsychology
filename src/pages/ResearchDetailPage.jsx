// src/pages/ResearchDetailPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from '../context/RouterContext'
import { useFetch } from '../hooks/useFetch'

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
const C = {
  skyBright:   '#00BFFF',
  skyMid:      '#009FD4',
  skyDeep:     '#007BA8',
  skyFaint:    '#E0F7FF',
  skyFainter:  '#F0FBFF',
  skyGhost:    '#F8FEFF',
  white:       '#ffffff',
  mint:        '#e8f3ee',
  textDark:    '#1a3a4a',
  textMid:     '#2e6080',
  textLight:   '#7a9aaa',
  borderFaint: '#daeef8',
  success:     '#2d7a4a',
  successBg:   '#e8f3ee',
  errorBg:     '#fff0f0',
  errorText:   '#c0392b',
}

const heroGrad = `linear-gradient(135deg, #0f2c3f 0%, ${C.skyDeep} 40%, ${C.skyMid} 80%, ${C.skyBright} 100%)`
const btnGrad  = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyBright} 100%)`

const API_BASE = import.meta.env.VITE_API_URL ?? ''

/* ─────────────────────────────────────────────────────────────
   RESPONSIVE CSS  (injected once into <head>)
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @keyframes rdp-spin    { to { transform: rotate(360deg) } }
  @keyframes rdp-fadeIn  { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
  @keyframes rdp-pulse   { 0%,100% { opacity:.6 } 50% { opacity:1 } }

  .rdp-page { background:${C.skyGhost}; min-height:100vh; }

  /* ── HERO ── */
  .rdp-hero { background:${heroGrad}; padding: 5rem 4rem 2.5rem; }
  .rdp-hero-inner { max-width:1100px; margin:0 auto; }

  /* ── MAIN GRID ── */
  .rdp-main {
    max-width: 1100px; margin: 0 auto;
    padding: 3rem 4rem;
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2.5rem;
    align-items: start;
  }

  /* ── SIDEBAR ── */
  .rdp-sidebar {
    position: sticky; top: 2rem;
    display: flex; flex-direction: column; gap: 1.25rem;
  }

  /* ── GDOCS IFRAME ── */
  .rdp-gdocs-iframe {
    width: 100%; height: 72vh; min-height: 480px;
    border: none; display: block;
  }

  /* ── SECTION LABEL ── */
  .rdp-label {
    font-size: .72rem; font-weight: 800;
    color: ${C.textLight}; text-transform: uppercase;
    letter-spacing: .1em; margin-bottom: 1rem;
    font-family: var(--font-body);
  }

  /* ── CARD BASE ── */
  .rdp-card {
    background: ${C.white}; border-radius: 14px;
    border: 1px solid ${C.borderFaint};
  }

  /* ── ANIMATIONS ── */
  .rdp-fade-in { animation: rdp-fadeIn .35s ease both; }

  /* ── TABLET (≤ 960px) ── */
  @media (max-width: 960px) {
    .rdp-hero  { padding: 4rem 2rem 2rem; }
    .rdp-main  { grid-template-columns: 1fr; padding: 2rem 2rem; gap: 2rem; }
    .rdp-sidebar { position: static; }
    .rdp-gdocs-iframe { height: 62vh; min-height: 400px; }
  }

  /* ── MOBILE (≤ 640px) ── */
  @media (max-width: 640px) {
    .rdp-hero  { padding: 3.5rem 1.25rem 1.75rem; }
    .rdp-hero-inner h1 { font-size: 1.2rem !important; }
    .rdp-main  { padding: 1.5rem 1rem; gap: 1.5rem; }
    .rdp-gdocs-iframe  { height: 55vh; min-height: 360px; }
    .rdp-toolbar {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: .5rem;
    }
    .rdp-toolbar-title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
    .rdp-toolbar-actions { width: 100%; display: flex; gap: .5rem; }
    .rdp-toolbar-actions a,
    .rdp-toolbar-actions button { flex: 1; text-align: center; justify-content: center; }
    .rdp-detail-row { padding: .4rem 0 !important; }
    .rdp-author-chip { font-size: .75rem !important; }
  }

  /* ── SMALL MOBILE (≤ 390px) ── */
  @media (max-width: 390px) {
    .rdp-hero { padding: 3rem 1rem 1.5rem; }
    .rdp-main { padding: 1.25rem .875rem; }
    .rdp-gdocs-iframe { height: 50vh; min-height: 320px; }
  }
`

function InjectStyles() {
  useEffect(() => {
    const ID = 'rdp-global-styles'
    if (!document.getElementById(ID)) {
      const el = document.createElement('style')
      el.id = ID
      el.textContent = GLOBAL_CSS
      document.head.appendChild(el)
    }
  }, [])
  return null
}

/* ─────────────────────────────────────────────────────────────
   SHARED BUTTON STYLES (inline, avoids SSR / specificity issues)
───────────────────────────────────────────────────────────── */
const btnPrimary = (disabled = false) => ({
  padding: '.55rem 1.1rem', borderRadius: 9,
  background: disabled ? '#d1d5db' : btnGrad,
  color: disabled ? '#9ca3af' : C.white,
  border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'var(--font-body)', fontWeight: 700,
  fontSize: '.78rem', whiteSpace: 'nowrap',
  transition: 'opacity .15s',
  display: 'inline-flex', alignItems: 'center', gap: '.3rem',
})

const btnOutline = (active = false) => ({
  padding: '.5rem 1rem', borderRadius: 9,
  background: active ? C.successBg : 'transparent',
  color: active ? C.success : C.skyMid,
  border: `1.5px solid ${active ? C.success : C.skyBright}`,
  cursor: active ? 'default' : 'pointer',
  fontFamily: 'var(--font-body)', fontWeight: 700,
  fontSize: '.78rem', whiteSpace: 'nowrap',
  transition: 'all .2s',
  display: 'inline-flex', alignItems: 'center', gap: '.3rem',
})

/* ─────────────────────────────────────────────────────────────
   GOOGLE DOCS VIEWER  (no CORS — Google fetches PDF server-side)
───────────────────────────────────────────────────────────── */
const MAX_RETRIES = 4
const RETRY_DELAYS = [2000, 3500, 5000, 7000]   // ms — GDocs is slow first load

function GDocsViewer({ pdfUrl }) {
  const [phase,    setPhase]   = useState('loading')   // loading | ready | retrying | error
  const [attempt,  setAttempt] = useState(0)
  const iframeRef  = useRef(null)
  const timerRef   = useRef(null)

  // Rebuild iframe src on each attempt so the iframe remounts cleanly
  const src = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`

  // GDocs viewer sometimes returns a blank white page rather than an error —
  // we use a load-timeout: if the iframe fires onLoad but appears blank after
  // BLANK_THRESHOLD ms, treat it as a retry candidate.
  const BLANK_THRESHOLD = 1500

  const scheduleRetry = useCallback((next) => {
    clearTimeout(timerRef.current)
    if (next >= MAX_RETRIES) { setPhase('error'); return }
    setPhase('retrying')
    timerRef.current = setTimeout(() => {
      setAttempt(next)
      setPhase('loading')
    }, RETRY_DELAYS[next] ?? 3000)
  }, [])

  function handleLoad() {
    // Give GDocs a moment to paint; if it stays blank the iframe body will
    // have no children — we can't read cross-origin content, so just trust it.
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setPhase('ready'), BLANK_THRESHOLD)
  }

  function handleError() {
    scheduleRetry(attempt + 1)
  }

  function manualRetry() {
    clearTimeout(timerRef.current)
    setAttempt(0)
    setPhase('loading')
  }

  useEffect(() => () => clearTimeout(timerRef.current), [])

  return (
    <div style={{ position: 'relative', background: '#f0fbff' }}>
      {/* ── Loading / Retrying overlay ── */}
      {(phase === 'loading' || phase === 'retrying') && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          background: C.skyGhost, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', minHeight: 320,
          gap: '.75rem',
        }}>
          <div style={{
            width: 38, height: 38,
            border: `3px solid ${C.skyFaint}`,
            borderTop: `3px solid ${C.skyBright}`,
            borderRadius: '50%',
            animation: 'rdp-spin .9s linear infinite',
          }} />
          <p style={{ fontFamily:'var(--font-body)', color:C.textLight, fontSize:'.82rem', margin:0, textAlign:'center' }}>
            {phase === 'retrying'
              ? `Retrying preview… (${attempt}/${MAX_RETRIES})`
              : 'Loading preview…'}
          </p>
          {phase === 'retrying' && (
            <p style={{ fontFamily:'var(--font-body)', color:C.textLight, fontSize:'.74rem', margin:0, animation:'rdp-pulse 1.6s ease infinite' }}>
              Google Docs viewer can be slow on first load
            </p>
          )}
        </div>
      )}

      {/* ── Error fallback ── */}
      {phase === 'error' && (
        <div style={{
          minHeight: 300, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: '1rem',
          padding: '2.5rem 1.5rem', textAlign: 'center', background: C.skyGhost,
        }}>
          <div style={{ fontSize: '3rem', lineHeight: 1 }}>📄</div>
          <div>
            <p style={{ fontFamily:'var(--font-body)', color:C.textDark, fontWeight:700, fontSize:'.95rem', margin:'0 0 .3rem' }}>
              Preview couldn't load
            </p>
            <p style={{ fontFamily:'var(--font-body)', color:C.textLight, fontSize:'.82rem', margin:'0 auto', maxWidth:340, lineHeight:1.6 }}>
              Google's viewer may be temporarily unavailable or this PDF may not be publicly accessible. Use the buttons above to open or download it directly.
            </p>
          </div>
          <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap', justifyContent:'center' }}>
            <button onClick={manualRetry} style={btnPrimary()}>↺ Try Again</button>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
              <button style={btnOutline()}>Open in New Tab ↗</button>
            </a>
          </div>
        </div>
      )}

      {/* ── The actual iframe (always mounted so GDocs can load in background) ── */}
      <iframe
        key={`gdocs-${attempt}`}
        ref={iframeRef}
        src={src}
        className="rdp-gdocs-iframe"
        title="PDF Preview"
        onLoad={handleLoad}
        onError={handleError}
        style={{
          display: phase === 'error' ? 'none' : 'block',
          opacity: phase === 'ready' ? 1 : 0,
          transition: 'opacity .3s ease',
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        loading="lazy"
      />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   DOWNLOAD HOOK
───────────────────────────────────────────────────────────── */
function useDownload(paperId, pdfUrl) {
  const [state, setState] = useState('idle')  // idle | loading | done | error

  async function download(title) {
    if (!pdfUrl || state === 'loading') return
    setState('loading')

    // Fire-and-forget analytics ping
    fetch(`${API_BASE}/api/research/${paperId}/download`, { method: 'POST' }).catch(() => {})

    try {
      const res = await fetch(pdfUrl, { mode: 'cors' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      const parts = pdfUrl.split('/')
      a.download = parts[parts.length - 1] || `${title ?? 'paper'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setState('done')
    } catch {
      // CORS blocked blob fetch — open in new tab as fallback
      window.open(pdfUrl, '_blank')
      setState('done')
    } finally {
      setTimeout(() => setState('idle'), 3000)
    }
  }

  return { dlState: state, download }
}

/* ─────────────────────────────────────────────────────────────
   PILL BADGE
───────────────────────────────────────────────────────────── */
function Pill({ children, bg = 'rgba(255,255,255,0.2)', color = 'white', border = 'rgba(255,255,255,0.3)' }) {
  return (
    <span style={{
      fontSize: '.7rem', fontWeight: 800,
      padding: '3px 12px', borderRadius: 100,
      background: bg, color, border: `1px solid ${border}`,
      fontFamily: 'var(--font-body)', letterSpacing: '.02em',
    }}>
      {children}
    </span>
  )
}

/* ─────────────────────────────────────────────────────────────
   SIDEBAR DETAIL ROW
───────────────────────────────────────────────────────────── */
function DetailRow({ label, value, last = false }) {
  if (!value) return null
  return (
    <div
      className="rdp-detail-row"
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '.5rem 0',
        borderBottom: last ? 'none' : `1px solid ${C.borderFaint}`,
        gap: '.5rem',
      }}
    >
      <span style={{ fontFamily:'var(--font-body)', fontSize:'.75rem', color:C.textLight, flexShrink:0 }}>{label}</span>
      <span style={{ fontFamily:'var(--font-body)', fontSize:'.75rem', fontWeight:700, color:C.textDark, textAlign:'right', wordBreak:'break-word', minWidth:0 }}>
        {value}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   LOADING SPINNER PAGE
───────────────────────────────────────────────────────────── */
function LoadingPage() {
  return (
    <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.skyGhost }}>
      <div style={{ textAlign:'center', animation:'rdp-fadeIn .4s ease' }}>
        <div style={{
          width: 52, height: 52,
          border: `3px solid ${C.skyFaint}`,
          borderTop: `3px solid ${C.skyBright}`,
          borderRadius: '50%',
          animation: 'rdp-spin .85s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <p style={{ fontFamily:'var(--font-body)', color:C.textLight, fontSize:'.9rem', margin:0 }}>
          Loading paper…
        </p>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   ERROR / NOT FOUND PAGE
───────────────────────────────────────────────────────────── */
function ErrorPage({ onBack }) {
  return (
    <div style={{
      minHeight:'70vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:'1.25rem',
      background:C.skyGhost, padding:'2rem 1.25rem', textAlign:'center',
      animation:'rdp-fadeIn .4s ease',
    }}>
      <div style={{ fontSize:'4rem', lineHeight:1 }}>🔬</div>
      <div>
        <p style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:700, color:C.textDark, margin:'0 0 .4rem' }}>
          Paper not found
        </p>
        <p style={{ fontFamily:'var(--font-body)', color:C.textLight, fontSize:'.88rem', margin:0 }}>
          This research paper may have been removed or the link is incorrect.
        </p>
      </div>
      <button onClick={onBack} style={{ ...btnPrimary(), padding:'.7rem 1.75rem', fontSize:'.88rem' }}>
        ← Back to Research
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   COPY CITATION BUTTON
───────────────────────────────────────────────────────────── */
function CopyCitation({ paper }) {
  const [copied, setCopied] = useState(false)

  function buildCitation() {
    const authors = (paper.authors || []).join(', ')
    const doi = paper.doi ? ` https://doi.org/${paper.doi}` : ''
    const vol  = paper.volume ? `, Vol. ${paper.volume}` : ''
    const pg   = paper.pages  ? `, pp. ${paper.pages}`  : ''
    return `${authors} (${paper.year}). ${paper.title}. ${paper.journal ?? ''}${vol}${pg}.${doi}`
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(buildCitation())
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard API blocked — silently ignore
    }
  }

  return (
    <button
      onClick={copy}
      style={{
        width: '100%', padding: '.7rem', borderRadius: 12,
        background: copied ? C.successBg : C.skyFainter,
        color: copied ? C.success : C.skyMid,
        border: `1.5px solid ${copied ? C.success : C.borderFaint}`,
        fontFamily: 'var(--font-body)', fontWeight: 700,
        fontSize: '.85rem', cursor: 'pointer', transition: 'all .2s',
      }}
    >
      {copied ? '✓ Citation copied!' : '📋 Copy citation'}
    </button>
  )
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function ResearchDetailPage() {
  const { params, navigate } = useRouter()
  const id = params?.id ?? ''

  const { data: paper, loading, error } = useFetch(`/research/${id}`, {}, [id])

  const [dlCount, setDlCount] = useState(null)
  const { dlState, download } = useDownload(id, paper?.pdf_url)

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [id])
  useEffect(() => { if (paper) setDlCount(paper.downloads ?? 0) }, [paper])

  // Track download count locally
  function handleDownload() {
    download(paper?.title)
    setDlCount(c => (c ?? 0) + 1)
  }

  /* ── Guards ── */
  if (loading) return <><InjectStyles /><LoadingPage /></>
  if (error || !paper) return <><InjectStyles /><ErrorPage onBack={() => navigate('/research')} /></>

  const downloads = dlCount ?? paper.downloads ?? 0
  const authors   = paper.authors ?? []
  const keywords  = paper.keywords ?? []

  /* ── Download button label ── */
  const dlLabel = dlState === 'loading' ? '⏳ Downloading…'
                : dlState === 'done'    ? '✓ Saved'
                : '⬇ Download PDF'

  return (
    <div className="rdp-page">
      <InjectStyles />

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <div className="rdp-hero">
        <div className="rdp-hero-inner">

          {/* Back button */}
          <button
            onClick={() => navigate('/research')}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white', borderRadius: 100,
              padding: '.3rem 1rem',
              fontFamily: 'var(--font-body)', fontSize: '.78rem', fontWeight: 600,
              cursor: 'pointer', marginBottom: '1.25rem',
              backdropFilter: 'blur(8px)',
              display: 'inline-flex', alignItems: 'center', gap: '.35rem',
            }}
          >
            ← Back to Research
          </button>

          {/* Badges row */}
          <div style={{ display:'flex', gap:'.6rem', alignItems:'center', marginBottom:'.75rem', flexWrap:'wrap' }}>
            <Pill>{paper.type ?? 'Paper'}</Pill>
            <Pill bg={paper.open_access ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}>
              {paper.open_access ? '🔓 Open Access' : '🔒 Subscription'}
            </Pill>
            {paper.year && (
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'.75rem', fontFamily:'var(--font-body)' }}>
                {paper.year}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.15rem, 3vw, 2.1rem)',
            color: 'white', lineHeight: 1.35,
            maxWidth: 820, marginBottom: '1rem',
            fontWeight: 700,
          }}>
            {paper.title}
          </h1>

          {/* Authors */}
          {authors.length > 0 && (
            <div style={{ fontFamily:'var(--font-body)', fontSize:'.85rem', color:'rgba(255,255,255,0.8)', marginBottom:'.35rem', wordBreak:'break-word' }}>
              {authors.join(', ')}
            </div>
          )}

          {/* Journal */}
          {paper.journal && (
            <div style={{ fontFamily:'var(--font-body)', fontSize:'.8rem', color:'rgba(255,255,255,0.6)', fontStyle:'italic' }}>
              {paper.journal}
              {paper.volume ? `, Vol. ${paper.volume}` : ''}
              {paper.pages  ? `, pp. ${paper.pages}`  : ''}
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          MAIN GRID  (left content + right sidebar)
      ══════════════════════════════════════ */}
      <div className="rdp-main">

        {/* ─── LEFT COLUMN ─── */}
        <div className="rdp-fade-in">
          <div className="rdp-label">📄 Full Paper</div>

          {/* ── PDF CARD ── */}
          {paper.pdf_url ? (
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: `1px solid ${C.borderFaint}`,
              boxShadow: '0 8px 32px rgba(0,191,255,0.08)',
              background: C.white,
            }}>
              {/* Toolbar */}
              <div
                className="rdp-toolbar"
                style={{
                  background: `linear-gradient(135deg,${C.skyFainter},${C.mint})`,
                  padding: '.75rem 1.25rem',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: `1px solid ${C.borderFaint}`,
                  gap: '.5rem',
                }}
              >
                <span
                  className="rdp-toolbar-title"
                  style={{ fontFamily:'var(--font-body)', fontSize:'.8rem', fontWeight:700, color:C.textMid, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', minWidth:0, flex:1 }}
                >
                  📄 {paper.title?.slice(0, 52)}{(paper.title?.length ?? 0) > 52 ? '…' : ''}
                </span>

                <div className="rdp-toolbar-actions" style={{ display:'flex', gap:'.5rem', flexShrink:0 }}>
                  <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
                    <button style={btnPrimary()}>Open ↗</button>
                  </a>
                  <button
                    onClick={handleDownload}
                    disabled={dlState === 'loading'}
                    style={btnOutline(dlState === 'done')}
                  >
                    {dlLabel}
                  </button>
                </div>
              </div>

              {/* Google Docs Viewer */}
              <GDocsViewer pdfUrl={paper.pdf_url} />
            </div>

          ) : (
            /* No PDF available */
            <div style={{
              background: C.white, borderRadius: 16,
              border: `1.5px dashed ${C.borderFaint}`,
              padding: '3rem 2rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight:1 }}>🔒</div>
              <p style={{ fontFamily:'var(--font-body)', color:C.textDark, fontWeight:700, marginBottom:'.35rem', fontSize:'.95rem' }}>
                Full PDF not publicly available
              </p>
              {paper.doi && (
                <>
                  <p style={{ fontFamily:'var(--font-body)', color:C.textLight, fontSize:'.82rem', marginBottom:'1.5rem', lineHeight:1.6 }}>
                    Access this paper through its DOI link via your institution or a preprint server.
                  </p>
                  <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
                    <button style={{ ...btnPrimary(), padding:'.7rem 2rem', fontSize:'.88rem' }}>
                      View via DOI ↗
                    </button>
                  </a>
                </>
              )}
            </div>
          )}

          {/* ── ABSTRACT ── */}
          {paper.abstract && (
            <div style={{ marginTop:'2rem' }} className="rdp-card">
              <div style={{ padding:'1.75rem' }}>
                <div className="rdp-label">Abstract</div>
                <div style={{ borderLeft:`4px solid ${C.skyBright}`, paddingLeft:'1.25rem' }}>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '.92rem',
                    color: C.textMid, lineHeight: 1.85, margin: 0,
                  }}>
                    {paper.abstract}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── KEYWORDS ── */}
          {keywords.length > 0 && (
            <div style={{ marginTop:'1.5rem' }} className="rdp-card">
              <div style={{ padding:'1.25rem' }}>
                <div className="rdp-label">Keywords</div>
                <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap' }}>
                  {keywords.map(k => (
                    <span
                      key={k}
                      style={{
                        fontSize: '.75rem', padding: '4px 13px', borderRadius: 100,
                        background: C.skyFaint, color: C.skyMid,
                        fontWeight: 700, fontFamily: 'var(--font-body)',
                        border: `1px solid ${C.borderFaint}`,
                      }}
                    >
                      #{k}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div className="rdp-sidebar rdp-fade-in" style={{ animationDelay: '.1s' }}>

          {/* Paper details card */}
          <div className="rdp-card" style={{ padding:'1.25rem', boxShadow:'0 2px 12px rgba(0,191,255,0.05)' }}>
            <div className="rdp-label">Paper Details</div>
            <DetailRow label="Type"      value={paper.type} />
            <DetailRow label="Year"      value={paper.year?.toString()} />
            <DetailRow label="Journal"   value={paper.journal} />
            <DetailRow label="Volume"    value={paper.volume ? `Vol. ${paper.volume}` : undefined} />
            <DetailRow label="Pages"     value={paper.pages  ? `pp. ${paper.pages}`  : undefined} />
            <DetailRow
              label="Downloads"
              value={downloads > 0 ? downloads.toLocaleString() : undefined}
            />
            <DetailRow
              label="Access"
              value={paper.open_access !== undefined
                ? (paper.open_access ? '🔓 Open Access' : '🔒 Subscription')
                : undefined}
              last
            />
          </div>

          {/* Authors card */}
          {authors.length > 0 && (
            <div style={{
              background: `linear-gradient(135deg,${C.skyFainter},${C.mint})`,
              borderRadius: 14, border:`1px solid ${C.borderFaint}`, padding:'1.25rem',
            }}>
              <div className="rdp-label">Authors</div>
              {authors.map((author, i) => (
                <div
                  key={i}
                  style={{ display:'flex', alignItems:'center', gap:'.65rem', marginBottom: i < authors.length - 1 ? '.65rem' : 0 }}
                >
                  {/* Avatar initial circle */}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: btnGrad,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.7rem', color: 'white', fontWeight: 800,
                    flexShrink: 0, fontFamily: 'var(--font-body)',
                    boxShadow: '0 2px 8px rgba(0,191,255,0.25)',
                  }}>
                    {author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span
                    className="rdp-author-chip"
                    style={{ fontFamily:'var(--font-body)', fontSize:'.82rem', color:C.textDark, fontWeight:600, wordBreak:'break-word' }}
                  >
                    {author}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* DOI card */}
          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration:'none' }}
            >
              <div style={{
                background: C.white, borderRadius: 14,
                border: `1.5px solid ${C.skyBright}`,
                padding: '1rem 1.25rem',
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', gap: '.5rem',
                cursor: 'pointer',
                transition: 'box-shadow .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px rgba(0,191,255,0.15)`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ minWidth:0 }}>
                  <div className="rdp-label" style={{ marginBottom:'.2rem' }}>DOI</div>
                  <div style={{
                    fontFamily:'var(--font-body)', fontSize:'.78rem',
                    color:C.skyMid, fontWeight:600, wordBreak:'break-all',
                  }}>
                    {paper.doi}
                  </div>
                </div>
                <span style={{ fontSize:'1.1rem', flexShrink:0, color:C.skyMid }}>↗</span>
              </div>
            </a>
          )}

          {/* Copy citation */}
          <CopyCitation paper={paper} />

          {/* Download CTA */}
          {paper.pdf_url && (
            <button
              onClick={handleDownload}
              disabled={dlState === 'loading'}
              style={{
                width: '100%', padding: '.85rem', borderRadius: 12,
                background: dlState === 'loading' ? '#d1d5db' : btnGrad,
                color: 'white', border: 'none',
                fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '.9rem',
                cursor: dlState === 'loading' ? 'not-allowed' : 'pointer',
                boxShadow: dlState === 'loading' ? 'none' : '0 4px 18px rgba(0,191,255,0.28)',
                transition: 'all .2s',
              }}
            >
              {dlLabel}
            </button>
          )}

          {/* Back to all */}
          <button
            onClick={() => navigate('/research')}
            style={{
              width: '100%', padding: '.7rem', borderRadius: 12,
              background: 'transparent', color: C.skyMid,
              border: `1.5px solid ${C.borderFaint}`,
              fontFamily: 'var(--font-body)', fontWeight: 600,
              fontSize: '.85rem', cursor: 'pointer',
              transition: 'border-color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.skyBright}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.borderFaint}
          >
            ← All Publications
          </button>

        </div>
      </div>
    </div>
  )
}