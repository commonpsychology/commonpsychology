// src/pages/ResearchPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'

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

const TYPE_COLORS = {
  'Clinical Study': { bg: '#E0F7FF', text: '#009FD4' },
  'Meta-Analysis':  { bg: '#f0e6ff', text: '#6c3fc5' },
  'Case Report':    { bg: '#fff3e0', text: '#e65100' },
  'Review Article': { bg: '#e8f3ee', text: '#2d4a3e' },
  'Policy Brief':   { bg: '#fce4ec', text: '#c62828' },
}
const TYPES = ['All', 'Clinical Study', 'Meta-Analysis', 'Case Report', 'Review Article', 'Policy Brief']
const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

export default function ResearchPage() {
  const { navigate }                  = useRouter()
  const [papers,      setPapers]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [type,        setType]        = useState('All')
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)
  const [total,       setTotal]       = useState(0)
  const [globalStats, setGlobalStats] = useState(null)
  const LIMIT = 12

  useEffect(() => { window.scrollTo(0, 0) }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = new URLSearchParams({ page, limit: LIMIT })
    if (type !== 'All') params.set('type', type)
    if (search.trim())  params.set('q', search.trim())
    fetch(`${API_BASE}/research?${params}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        const list = d.research || d.papers || d.items || d.data || (Array.isArray(d) ? d : [])
        setPapers(list)
        setTotal(d.pagination?.total ?? d.total ?? list.length)
        if (d.stats) setGlobalStats(d.stats)
      })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [type, page, search])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const pageStats  = {
    openAccess: papers.filter(p => p.open_access).length,
    types:      [...new Set(papers.map(p => p.type).filter(Boolean))].length,
  }
  const heroStats = [
    { val: globalStats?.total_papers ?? total,                label: 'Publications' },
    { val: globalStats?.open_access  ?? pageStats.openAccess, label: 'Open Access'  },
    { val: globalStats?.study_types  ?? pageStats.types,      label: 'Study Types'  },
  ]

  return (
    <div style={{ background: C.skyGhost, minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: heroGrad, padding: '5rem 5rem 4rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100, padding: '0.3rem 1rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-body)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>🔬 Research &amp; Publications</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', color: 'white', lineHeight: 1.2, maxWidth: 700, marginBottom: '0.75rem' }}>
            Mental Health Research<br />from Nepal &amp; Beyond
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(255,255,255,0.8)', maxWidth: 560, lineHeight: 1.7, marginBottom: '2rem' }}>
            Peer-reviewed studies, clinical research, and policy briefs advancing psychological science in the Himalayan region.
          </p>
          <form onSubmit={e => { e.preventDefault(); setPage(1) }} style={{ display: 'flex', gap: '0.5rem', maxWidth: 500, marginBottom: '2rem' }}>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search papers, authors, keywords…"
              style={{ flex: 1, padding: '0.65rem 1.1rem', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: 'white', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, background: C.white, color: C.skyDeep, border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              Search
            </button>
          </form>
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            {heroStats.map(({ val, label }) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'white', lineHeight: 1 }}>{val}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.09em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.borderFaint}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5rem', overflowX: 'auto', display: 'flex', gap: '0.25rem', scrollbarWidth: 'none' }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => { setType(t); setPage(1) }}
              style={{ padding: '0.85rem 1.1rem', border: 'none', borderBottom: `2.5px solid ${type === t ? C.skyBright : 'transparent'}`, background: 'transparent', color: type === t ? C.skyDeep : C.textLight, fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: type === t ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 5rem' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div style={{ width: 44, height: 44, border: `3px solid ${C.skyFaint}`, borderTop: `3px solid ${C.skyBright}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ fontFamily: 'var(--font-body)', color: C.textLight }}>Loading papers…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '5rem 0', fontFamily: 'var(--font-body)', color: C.textLight }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😕</div>
            <p>Could not load papers.</p>
            <button onClick={() => window.location.reload()} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: 8, background: btnGrad, color: 'white', border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {!loading && !error && papers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '5rem 0', fontFamily: 'var(--font-body)', color: C.textLight }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔬</div>
            <p>No papers found{search ? ` for "${search}"` : ''}.</p>
          </div>
        )}

        {!loading && !error && papers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
            {papers.map(paper => {
              const tc = TYPE_COLORS[paper.type] || { bg: C.skyFaint, text: C.skyMid }
              return (
                <div key={paper.id} onClick={() => navigate(`/research/${paper.id}`)}
                  style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.borderFaint}`, padding: '1.75rem', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start', boxShadow: '0 2px 12px rgba(0,191,255,0.04)', transition: 'transform 0.18s, box-shadow 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,191,255,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,191,255,0.04)' }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 10px', borderRadius: 100, background: tc.bg, color: tc.text }}>{paper.type}</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: paper.open_access ? '#e8f3ee' : '#f5f5f5', color: paper.open_access ? '#2d4a3e' : C.textLight }}>
                        {paper.open_access ? '🔓 Open Access' : '🔒 Subscription'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: C.textLight, fontFamily: 'var(--font-body)' }}>{paper.year}</span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: C.textDark, lineHeight: 1.35, marginBottom: '0.5rem' }}>{paper.title}</h3>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: C.skyMid, fontWeight: 600, marginBottom: '0.4rem' }}>
                      {(paper.authors || []).slice(0, 3).join(', ')}{(paper.authors?.length ?? 0) > 3 ? ' et al.' : ''}
                    </p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: C.textLight, fontStyle: 'italic', marginBottom: '0.75rem' }}>{paper.journal}</p>
                    {paper.abstract && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: C.textMid, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{paper.abstract}</p>
                    )}
                    {(paper.keywords || []).length > 0 && (
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                        {paper.keywords.slice(0, 5).map(k => (
                          <span key={k} style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 100, background: C.skyFaint, color: C.skyMid, fontWeight: 600 }}>#{k}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Right — downloads only, NO citations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end', flexShrink: 0, minWidth: 90 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: C.textDark, lineHeight: 1 }}>{(paper.downloads || 0).toLocaleString()}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Downloads</div>
                    </div>
                    {paper.pdf_url && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: C.skyDeep, background: C.skyFaint, padding: '4px 10px', borderRadius: 100 }}>📄 PDF</span>}
                    <span style={{ fontSize: '0.75rem', color: C.skyMid, fontWeight: 600 }}>Read →</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }} disabled={page === 1}
              style={{ padding: '0.5rem 1.1rem', borderRadius: 10, border: `1.5px solid ${C.borderFaint}`, background: C.white, color: page === 1 ? C.textLight : C.skyDeep, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.82rem', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
              <button key={p} onClick={() => { setPage(p); window.scrollTo(0, 0) }}
                style={{ padding: '0.5rem 0.9rem', borderRadius: 10, border: `1.5px solid ${p === page ? C.skyBright : C.borderFaint}`, background: p === page ? C.skyFaint : C.white, color: p === page ? C.skyDeep : C.textMid, fontFamily: 'var(--font-body)', fontWeight: p === page ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer' }}>
                {p}
              </button>
            ))}
            <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }} disabled={page === totalPages}
              style={{ padding: '0.5rem 1.1rem', borderRadius: 10, border: `1.5px solid ${C.borderFaint}`, background: C.white, color: page === totalPages ? C.textLight : C.skyDeep, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.82rem', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}>
              Next →
            </button>
          </div>
        )}
      </div>
      <style>{`input::placeholder{color:rgba(255,255,255,0.55)}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
