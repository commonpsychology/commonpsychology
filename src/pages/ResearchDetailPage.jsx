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
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const TYPE_COLORS = {
  'Clinical Study': { bg: '#E0F7FF', text: '#009FD4' },
  'Meta-Analysis':  { bg: '#f0e6ff', text: '#6c3fc5' },
  'Case Report':    { bg: '#fff3e0', text: '#e65100' },
  'Review Article': { bg: '#e8f3ee', text: '#2d4a3e' },
  'Policy Brief':   { bg: '#fce4ec', text: '#c62828' },
}

export default function ResearchDetailPage() {
  const { params, navigate } = useRouter()
  const id = params.id || ''
  const { data: paper, loading, error } = useFetch(`/research/${id}`, {}, [id])
  const [pdfError,   setPdfError]   = useState(false)
  // Local download count so UI updates immediately after clicking download
  const [dlCount,    setDlCount]    = useState(null)

  useEffect(() => { window.scrollTo(0, 0) }, [id])

  // Sync local count with fetched paper data
  useEffect(() => {
    if (paper) setDlCount(paper.downloads ?? 0)
  }, [paper])

  // Called by BOTH download buttons
  function handleDownload() {
    if (!paper?.pdf_url) return
    // Optimistic UI — increment immediately
    setDlCount(c => (c ?? 0) + 1)
    // Tell backend silently
    fetch(`${API_BASE}/research/${id}/download`, { method: 'POST' }).catch(() => {})
    // Open the file
    window.open(paper.pdf_url, '_blank')
  }

  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.skyGhost }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${C.skyFaint}`, borderTop: `3px solid ${C.skyBright}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontFamily: 'var(--font-body)', color: C.textLight }}>Loading paper…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (error || !paper) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: C.skyGhost }}>
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

      {/* Hero */}
      <div style={{ background: heroGrad, padding: '5rem 4rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <button onClick={() => navigate('/research')}
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

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2.1rem)', color: 'white', lineHeight: 1.3, maxWidth: 820, marginBottom: '1rem' }}>{paper.title}</h1>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.35rem' }}>
            {(paper.authors || []).join(', ')}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', fontStyle: 'italic' }}>
            {paper.journal}{paper.volume ? `, Vol. ${paper.volume}` : ''}{paper.pages ? `, pp. ${paper.pages}` : ''}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 4rem', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2.5rem', alignItems: 'start' }}>

        {/* LEFT — PDF + abstract + keywords */}
        <div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
            📄 Full Paper
          </div>

          {paper.pdf_url ? (
            !pdfError ? (
              <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${C.borderFaint}`, boxShadow: '0 8px 32px rgba(0,191,255,0.1)', background: C.white }}>
                {/* Toolbar */}
                <div style={{ background: `linear-gradient(135deg,${C.skyFainter},${C.mint})`, padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.borderFaint}` }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 700, color: C.textMid }}>
                    📄 {paper.title?.slice(0, 40)}…
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                      <button style={{ padding: '0.3rem 0.85rem', borderRadius: 8, background: btnGrad, color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                        Open ↗
                      </button>
                    </a>
                    {/* Download button — increments counter */}
                    <button onClick={handleDownload}
                      style={{ padding: '0.3rem 0.85rem', borderRadius: 8, background: 'transparent', color: C.skyMid, border: `1.5px solid ${C.skyBright}`, fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                      ⬇ Download
                    </button>
                  </div>
                </div>
                <iframe
                  src={`${paper.pdf_url}#toolbar=1&navpanes=0&scrollbar=1`}
                  title={paper.title}
                  onError={() => setPdfError(true)}
                  style={{ width: '100%', height: '75vh', border: 'none', display: 'block' }}
                />
              </div>
            ) : (
              <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.borderFaint}`, padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                <p style={{ fontFamily: 'var(--font-body)', color: C.textLight, marginBottom: '1.5rem' }}>PDF preview unavailable in this browser.</p>
                <button onClick={handleDownload} style={{ padding: '0.7rem 2rem', borderRadius: 10, background: btnGrad, color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                  Open PDF in New Tab ↗
                </button>
              </div>
            )
          ) : (
            <div style={{ background: C.white, borderRadius: 16, border: `1px dashed ${C.borderFaint}`, padding: '3rem', textAlign: 'center' }}>
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
        <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Paper details — NO citations row */}
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.borderFaint}`, padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,191,255,0.06)' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Paper Details</div>
            {[
              { label: 'Type',      value: paper.type                                    },
              { label: 'Year',      value: paper.year                                    },
              { label: 'Journal',   value: paper.journal                                 },
              { label: 'Downloads', value: downloads.toLocaleString()                    },
              { label: 'Access',    value: paper.open_access ? '🔓 Open' : '🔒 Subscription' },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: `1px solid ${C.borderFaint}` }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: C.textLight }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, color: C.textDark, maxWidth: 160, textAlign: 'right' }}>{value}</span>
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
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: C.textDark, fontWeight: 600 }}>{author}</span>
                </div>
              ))}
            </div>
          )}

          {/* DOI */}
          {paper.doi && (
            <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ background: C.white, borderRadius: 14, border: `1.5px solid ${C.skyBright}`, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>DOI</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: C.skyMid, fontWeight: 600 }}>{paper.doi}</div>
                </div>
                <span style={{ fontSize: '1.1rem' }}>↗</span>
              </div>
            </a>
          )}

          {/* Download CTA — increments counter */}
          {paper.pdf_url && (
            <button onClick={handleDownload}
              style={{ width: '100%', padding: '0.85rem', borderRadius: 12, background: btnGrad, color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,191,255,0.3)' }}>
              ⬇ Download PDF
            </button>
          )}

          {/* Back */}
          <button onClick={() => navigate('/research')}
            style={{ width: '100%', padding: '0.7rem', borderRadius: 12, background: 'transparent', color: C.skyMid, border: `1.5px solid ${C.borderFaint}`, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
            ← All Publications
          </button>
        </div>
      </div>
    </div>
  )
}