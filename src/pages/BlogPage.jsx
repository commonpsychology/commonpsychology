// src/pages/BlogPage.jsx  — list of all blog posts
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
  border:     '#b0d4e8',
  borderFaint:'#daeef8',
}
const heroGrad = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyMid} 40%, ${C.skyBright} 80%, #22d3ee 100%)`
const btnGrad  = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyBright} 100%)`

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const CATEGORIES = ['All', 'Anxiety', 'Depression', 'Self-Care', 'Mindfulness', 'Relationships', 'Trauma', 'Parenting', 'Sleep']

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BlogPage() {
  const { navigate } = useRouter()
  const [posts,    setPosts]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [category, setCategory] = useState('All')
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)
  const LIMIT = 12

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = new URLSearchParams({ page, limit: LIMIT })
    if (category !== 'All') params.set('category', category)
    if (search.trim())      params.set('q', search.trim())

    fetch(`${API_BASE}/blog?${params}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return
        // handle various API shapes
        const list = d.posts || d.items || d.data || (Array.isArray(d) ? d : [])
        setPosts(list)
        setTotal(d.pagination?.total ?? d.total ?? list.length)
      })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [category, page, search])

  const totalPages = Math.max(1, Math.ceil(total / LIMIT))

  function handleSearch(e) {
    e.preventDefault()
    setPage(1)
  }

  // Featured post = first post with featured flag, or just first post
  const featured = posts.find(p => p.featured) || posts[0]
  const rest      = posts.filter(p => p !== featured)

  return (
    <div style={{ background: C.skyGhost, minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={{ background: heroGrad, padding: '5rem 5rem 4rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 100, padding: '0.3rem 1rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white', fontFamily: 'var(--font-body)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>✍️ Blog &amp; Articles</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: 'white', lineHeight: 1.2, maxWidth: 700, marginBottom: '0.75rem' }}>
            Insights for Mind &amp; Wellbeing
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(255,255,255,0.8)', maxWidth: 560, lineHeight: 1.7, marginBottom: '2rem' }}>
            Expert-written articles on mental health, psychology, and holistic wellbeing — grounded in Nepali context.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', maxWidth: 500 }}>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search articles…"
              style={{ flex: 1, padding: '0.65rem 1.1rem', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', fontFamily: 'var(--font-body)', fontSize: '0.9rem', outline: 'none' }}
            />
            <button type="submit" style={{ padding: '0.65rem 1.25rem', borderRadius: 10, background: C.white, color: C.skyDeep, border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
              Search
            </button>
          </form>
        </div>
      </div>

      {/* ── Category filter tabs ── */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.borderFaint}`, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 4rem', overflowX: 'auto', display: 'flex', gap: '0.25rem', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setPage(1) }}
              style={{
                padding: '0.85rem 1.1rem',
                border: 'none',
                borderBottom: `2.5px solid ${category === cat ? C.skyBright : 'transparent'}`,
                background: 'transparent',
                color: category === cat ? C.skyDeep : C.textLight,
                fontFamily: 'var(--font-body)',
                fontSize: '0.8rem',
                fontWeight: category === cat ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 4rem' }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ width: 44, height: 44, border: `3px solid ${C.skyFaint}`, borderTop: `3px solid ${C.skyBright}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
            <p style={{ fontFamily: 'var(--font-body)', color: C.textLight }}>Loading articles…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: C.textLight, fontFamily: 'var(--font-body)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😕</div>
            <p>Could not load articles. Please try again.</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: C.textLight, fontFamily: 'var(--font-body)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <p>No articles found{search ? ` for "${search}"` : ''}.</p>
          </div>
        )}

        {/* Featured post — only on page 1, no filter, no search */}
        {!loading && !error && featured && page === 1 && category === 'All' && !search && (
          <div
            onClick={() => navigate(`/blog/${featured.slug}`)}
            style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.borderFaint}`, overflow: 'hidden', marginBottom: '2.5rem', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr 1fr', boxShadow: `0 4px 24px rgba(0,191,255,0.08)`, transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,191,255,0.16)` }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,191,255,0.08)` }}
          >
            {/* Image side */}
            <div style={{ background: featured.gradient || heroGrad, minHeight: 320, position: 'relative', overflow: 'hidden' }}>
              {featured.image_url && (
                <img src={featured.image_url} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              )}
              <div style={{ position: 'absolute', top: '1.25rem', left: '1.25rem', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.3)' }}>
                ⭐ Featured
              </div>
            </div>
            {/* Content side */}
            <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: C.skyFaint, color: C.skyMid }}>{featured.category}</span>
                <span style={{ fontSize: '0.7rem', color: C.textLight, fontFamily: 'var(--font-body)' }}>{featured.read_time} · {formatDate(featured.published_at)}</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)', color: C.textDark, lineHeight: 1.3, marginBottom: '1rem' }}>
                {featured.title}
              </h2>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: C.textMid, lineHeight: 1.75, marginBottom: '1.5rem' }}>
                {featured.excerpt}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: btnGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'white', fontWeight: 700 }}>
                  {(featured.author || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 700, color: C.textDark }}>{featured.author}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: C.textLight }}>{featured.author_role}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.7rem', color: C.textLight, fontFamily: 'var(--font-body)' }}>
                  👁 {(featured.views || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid of posts */}
        {!loading && !error && posts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {(page === 1 && category === 'All' && !search ? rest : posts).map(post => (
              <div
                key={post.id || post.slug}
                onClick={() => navigate(`/blog/${post.slug}`)}
                style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.borderFaint}`, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', boxShadow: `0 2px 12px rgba(0,191,255,0.05)`, transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,191,255,0.14)` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 12px rgba(0,191,255,0.05)` }}
              >
                {/* Card image */}
                <div style={{ background: post.gradient || heroGrad, height: 180, position: 'relative', flexShrink: 0, overflow: 'hidden' }}>
                  {post.image_url && (
                    <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                  <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                    {post.category}
                  </span>
                  {post.featured && (
                    <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', fontSize: '0.6rem', padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,0.2)', color: 'white' }}>⭐</span>
                  )}
                </div>
                {/* Card body */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.7rem', color: C.textLight, fontFamily: 'var(--font-body)', marginBottom: '0.5rem' }}>
                    {post.read_time} · {formatDate(post.published_at)}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: C.textDark, lineHeight: 1.35, marginBottom: '0.6rem', flex: 1 }}>
                    {post.title}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: C.textMid, lineHeight: 1.65, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: btnGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                        {(post.author || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 600, color: C.textDark }}>{post.author}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: C.textLight, fontFamily: 'var(--font-body)' }}>👁 {(post.views || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }}
              disabled={page === 1}
              style={{ padding: '0.5rem 1.1rem', borderRadius: 10, border: `1.5px solid ${C.borderFaint}`, background: C.white, color: page === 1 ? C.textLight : C.skyDeep, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.82rem', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
              <button
                key={p}
                onClick={() => { setPage(p); window.scrollTo(0, 0) }}
                style={{ padding: '0.5rem 0.9rem', borderRadius: 10, border: `1.5px solid ${p === page ? C.skyBright : C.borderFaint}`, background: p === page ? C.skyFaint : C.white, color: p === page ? C.skyDeep : C.textMid, fontFamily: 'var(--font-body)', fontWeight: p === page ? 700 : 500, fontSize: '0.82rem', cursor: 'pointer' }}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }}
              disabled={page === totalPages}
              style={{ padding: '0.5rem 1.1rem', borderRadius: 10, border: `1.5px solid ${C.borderFaint}`, background: C.white, color: page === totalPages ? C.textLight : C.skyDeep, fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.82rem', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .blog-grid { grid-template-columns: repeat(2,1fr) !important; }
          .blog-featured { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .blog-grid { grid-template-columns: 1fr !important; }
        }
        input::placeholder { color: rgba(255,255,255,0.6); }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
