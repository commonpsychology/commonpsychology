// src/pages/ResearchDetailPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useFetch } from '../hooks/useFetch'

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
  borderFaint:'#daeef8',
}
const heroGrad = `linear-gradient(135deg, #0f2c3f 0%, ${C.skyDeep} 40%, ${C.skyMid} 80%, ${C.skyBright} 100%)`
const btnGrad  = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyBright} 100%)`
const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

// Inject responsive styles once
const RESPONSIVE_CSS = `
  @keyframes spin { to { transform: rotate(360deg) } }

  .rdp-hero {
    background: ${heroGrad};
    padding: 5rem 4rem 2.5rem;
  }
  .rdp-hero-inner {
    max-width: 1100px;
    margin: 0 auto;
  }

  .rdp-main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 3rem 4rem;
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 2.5rem;
    align-items: start;
  }

  .rdp-sidebar {
    position: sticky;
    top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .rdp-pdf-iframe {
    width: 100%;
    height: 75vh;
    border: none;
    display: block;
  }

  /* ── Tablet (≤ 900px) ── */
  @media (max-width: 900px) {
    .rdp-hero {
      padding: 4rem 2rem 2rem;
    }
    .rdp-main {
      grid-template-columns: 1fr;
      padding: 2rem 2rem;
      gap: 2rem;
    }
    .rdp-sidebar {
      position: static;
      /* Move sidebar above content on tablet/mobile is optional;
         here we keep it below but unstick it */
    }
    .rdp-pdf-iframe {
      height: 60vh;
    }
  }

  /* ── Mobile (≤ 600px) ── */
  @media (max-width: 600px) {
    .rdp-hero {
      padding: 3.5rem 1.25rem 1.75rem;
    }
    .rdp-hero h1 {
      font-size: 1.25rem !important;
    }
    .rdp-main {
      padding: 1.5rem 1.25rem;
      gap: 1.5rem;
    }
    .rdp-pdf-iframe {
      height: 50vh;
    }
    .rdp-pdf-toolbar {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 0.5rem;
    }
    .rdp-pdf-toolbar-title {
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .rdp-pdf-toolbar-actions {
      width: 100%;
      display: flex;
      gap: 0.5rem;
    }
    .rdp-pdf-toolbar-actions a,
    .rdp-pdf-toolbar-actions button {
      flex: 1;
      text-align: center;
    }
    .rdp-detail-row {
      padding: 0.45rem 0 !important;
    }
  }

  /* ── Very small (≤ 380px) ── */
  @media (max-width: 380px) {
    .rdp-hero {
      padding: 3rem 1rem 1.5rem;
    }
    .rdp-main {
      padding: 1.25rem 1rem;
    }
  }
`

function InjectStyles() {
  useEffect(() => {
    const id = 'rdp-responsive-styles'
    if (!document.getElementById(id)) {
      const el = document.createElement('style')
      el.id = id
      el.textContent = RESPONSIVE_CSS
      document.head.appendChild(el)
    }
    return () => {
      // leave styles in DOM — avoids flicker on re-mount
    }
  }, [])
  return null
}

export default function ResearchDetailPage() {
  const { params, navigate } = useRouter()
  const id = params.id || ''
  const { data: paper, loading, error } = useFetch(`/research/${id}`, {}, [id])
  const [pdfError,   setPdfError]   = useState(false)
  const [dlCount,    setDlCount]    = useState(null)

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  useEffect(() => {
    if (paper) setDlCount(paper.downloads ?? 0)
  }, [paper])

  const [dlState, setDlState] = useState('idle') // 'idle' | 'loading' | 'done' | 'error'

  async function handleDownload() {
    if (!paper?.pdf_url || dlState === 'loading') return
    setDlState('loading')
    // Tell backend (fire-and-forget)
    fetch(`${API_BASE}/research/${id}/download`, { method: 'POST' }).catch(() => {})
    try {
      // Fetch the PDF as a blob to force a real download (bypasses CSP frame-src)
      const res = await fetch(paper.pdf_url)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      // Derive a filename from the URL or fall back to paper title
      const urlParts = paper.pdf_url.split('/')
      a.download = urlParts[urlParts.length - 1] || `${paper.title ?? 'paper'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setDlCount(c => (c ?? 0) + 1)
      setDlState('done')
      setTimeout(() => setDlState('idle'), 2500)
    } catch {
      // If blob fetch fails (e.g. CORS), fall back to opening in new tab
      window.open(paper.pdf_url, '_blank')
      setDlCount(c => (c ?? 0) + 1)
      setDlState('done')
      setTimeout(() => setDlState('idle'), 2500)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.skyGhost }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${C.skyFaint}`, borderTop: `3px solid ${C.skyBright}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontFamily: 'var(--font-body)', color: C.textLight }}>Loading paper…</p>
      </div>
    </div>
  )

  if (error || !paper) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: C.skyGhost, padding: '2rem 1.25rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem' }}>🔬</div>
      <p style={{ fontFamily: 'var(--font-body)', color: C.textLight }}>Paper not found.</p>
      <button onClick={() => navigate('/research')} style={{ padding: '0.6rem 1.5rem', borderRadius: 10, background: btnGrad, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
        ← Back to Research
      </button>
    </div>
  )

  const downloads = dlCount ?? paper.downloads ?? 0

  return (
    <div style={{ background: C.skyGhost, minHeight: '100vh' }}>
      <InjectStyles />

      {/* ── Hero ── */}
      <div className="rdp-hero">
        <div className="rdp-hero-inner">
          <button
            onClick={() => navigate('/research')}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 100, padding: '0.3rem 1rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem', backdropFilter: 'blur(8px)' }}>
            ← Back to Research
          </button>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '3px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>{paper.type}</span>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 12px', borderRadius: 100, background: paper.open_access ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)' }}>
              {paper.open_access ? '🔓 Open Access' : '🔒 Subscription'}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>{paper.year}</span>
          </div>

          <h1 className="rdp-hero-h1" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem,3vw,2.1rem)', color: 'white', lineHeight: 1.3, maxWidth: 820, marginBottom: '1rem' }}>
            {paper.title}
          </h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.35rem', wordBreak: 'break-word' }}>
            {(paper.authors || []).join(', ')}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', fontStyle: 'italic' }}>
            {paper.journal}{paper.volume ? `, Vol. ${paper.volume}` : ''}{paper.pages ? `, pp. ${paper.pages}` : ''}
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="rdp-main">

        {/* LEFT — PDF + abstract + keywords */}
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            📄 Full Paper
          </div>

          {paper.pdf_url ? (
            /* PDF card — iframe is blocked by CSP frame-src, so we show action buttons */
            <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.borderFaint}`, boxShadow: '0 8px 32px rgba(0,191,255,0.1)', background: C.white }}>
              {/* Toolbar */}
              <div
                className="rdp-pdf-toolbar"
                style={{ background: `linear-gradient(135deg,${C.skyFainter},${C.mint})`, padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.borderFaint}`, gap: '0.5rem' }}>
                <span className="rdp-pdf-toolbar-title" style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 700, color: C.textMid, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                  📄 {paper.title?.slice(0, 50)}{paper.title?.length > 50 ? '…' : ''}
                </span>
                <div className="rdp-pdf-toolbar-actions" style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '0.3rem 0.85rem', borderRadius: 8, background: btnGrad, color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      Open ↗
                    </button>
                  </a>
                  <button
                    onClick={handleDownload}
                    disabled={dlState === 'loading'}
                    style={{ padding: '0.3rem 0.85rem', borderRadius: 8, background: dlState === 'done' ? '#e8f3ee' : 'transparent', color: dlState === 'done' ? '#2d7a4a' : C.skyMid, border: `1.5px solid ${dlState === 'done' ? '#2d7a4a' : C.skyBright}`, fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, cursor: dlState === 'loading' ? 'wait' : 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
                    {dlState === 'loading' ? '⏳ Downloading…' : dlState === 'done' ? '✓ Downloaded' : '⬇ Download'}
                  </button>
                </div>
              </div>

              {/* Preview body */}
              <div style={{ padding: '3rem 2rem', textAlign: 'center', background: `linear-gradient(180deg, ${C.skyFainter} 0%, ${C.white} 100%)` }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1 }}>📄</div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: C.textDark, marginBottom: '0.4rem' }}>
                  In-page preview unavailable
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: C.textLight, maxWidth: 360, margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
                  This site's security policy prevents embedding external PDFs. Use the buttons below to read or save the full paper.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '0.65rem 1.5rem', borderRadius: 10, background: btnGrad, color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,191,255,0.25)' }}>
                      Open in New Tab ↗
                    </button>
                  </a>
                  <button
                    onClick={handleDownload}
                    disabled={dlState === 'loading'}
                    style={{ padding: '0.65rem 1.5rem', borderRadius: 10, background: dlState === 'done' ? '#e8f3ee' : 'transparent', color: dlState === 'done' ? '#2d7a4a' : C.skyMid, border: `1.5px solid ${dlState === 'done' ? '#2d7a4a' : C.skyBright}`, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.88rem', cursor: dlState === 'loading' ? 'wait' : 'pointer', transition: 'all 0.2s' }}>
                    {dlState === 'loading' ? '⏳ Downloading…' : dlState === 'done' ? '✓ Saved to device' : '⬇ Download PDF'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ background: C.white, borderRadius: 16, border: `1px dashed ${C.borderFaint}`, padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
              <p style={{ fontFamily: 'var(--font-body)', color: C.textLight, marginBottom: '0.5rem', fontSize: '0.95rem' }}>Full PDF not available.</p>
              {paper.doi && (
                <>
                  <p style={{ fontFamily: 'var(--font-body)', color: C.textLight, fontSize: '0.82rem', marginBottom: '1.5rem' }}>Access this paper via its DOI link.</p>
                  <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                    <button style={{ padding: '0.7rem 2rem', borderRadius: 10, background: btnGrad, color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer' }}>
                      View via DOI ↗
                    </button>
                  </a>
                </>
              )}
            </div>
          )}

          {/* Abstract */}
          {paper.abstract && (
            <div style={{ marginTop: '2rem', background: C.white, borderRadius: 14, border: `1px solid ${C.borderFaint}`, padding: '1.75rem' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Abstract</div>
              <div style={{ borderLeft: `4px solid ${C.skyBright}`, paddingLeft: '1.25rem' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.92rem', color: C.textMid, lineHeight: 1.8, margin: 0 }}>{paper.abstract}</p>
              </div>
            </div>
          )}

          {/* Keywords */}
          {(paper.keywords || []).length > 0 && (
            <div style={{ marginTop: '1.5rem', background: C.white, borderRadius: 14, border: `1px solid ${C.borderFaint}`, padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Keywords</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {paper.keywords.map(k => (
                  <span key={k} style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: 100, background: C.skyFaint, color: C.skyMid, fontWeight: 600, fontFamily: 'var(--font-body)' }}>#{k}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT sidebar */}
        <div className="rdp-sidebar">

          {/* Paper details */}
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.borderFaint}`, padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,191,255,0.06)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Paper Details</div>
            {[
              { label: 'Type',      value: paper.type },
              { label: 'Year',      value: paper.year },
              { label: 'Journal',   value: paper.journal },
              { label: 'Downloads', value: downloads.toLocaleString() },
              { label: 'Access',    value: paper.open_access ? '🔓 Open' : '🔒 Subscription' },
            ].filter(r => r.value).map(({ label, value }) => (
              <div
                key={label}
                className="rdp-detail-row"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: `1px solid ${C.borderFaint}`, gap: '0.5rem' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: C.textLight, flexShrink: 0 }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, color: C.textDark, textAlign: 'right', wordBreak: 'break-word', minWidth: 0 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Authors */}
          {(paper.authors || []).length > 0 && (
            <div style={{ background: `linear-gradient(135deg,${C.skyFainter},${C.mint})`, borderRadius: 14, border: `1px solid ${C.borderFaint}`, padding: '1.25rem' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>Authors</div>
              {paper.authors.map((author, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: btnGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                    {author.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: C.textDark, fontWeight: 600, wordBreak: 'break-word' }}>{author}</span>
                </div>
              ))}
            </div>
          )}

          {/* DOI */}
          {paper.doi && (
            <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ background: C.white, borderRadius: 14, border: `1.5px solid ${C.skyBright}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '0.5rem' }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>DOI</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: C.skyMid, fontWeight: 600, wordBreak: 'break-all' }}>{paper.doi}</div>
                </div>
                <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>↗</span>
              </div>
            </a>
          )}

          {/* Download CTA */}
          {paper.pdf_url && (
            <button
              onClick={handleDownload}
              style={{ width: '100%', padding: '0.85rem', borderRadius: 12, background: btnGrad, color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,191,255,0.3)' }}>
              ⬇ Download PDF
            </button>
          )}

          {/* Back */}
          <button
            onClick={() => navigate('/research')}
            style={{ width: '100%', padding: '0.7rem', borderRadius: 12, background: 'transparent', color: C.skyMid, border: `1.5px solid ${C.borderFaint}`, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            ← All Publications
          </button>
        </div>
      </div>
    </div>
  )
}