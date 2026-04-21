// src/pages/BlogDetailPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useFetch } from '../hooks/useFetch'
import ReactMarkdown from 'react-markdown'

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
const heroGrad = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyMid} 40%, ${C.skyBright} 80%, #22d3ee 100%)`
const btnGrad  = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyBright} 100%)`

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

// Markdown component styles
const mdComponents = {
  h2: ({ children }) => (
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: C.textDark, margin: '2rem 0 0.75rem', lineHeight: 1.3, borderBottom: `2px solid ${C.skyFaint}`, paddingBottom: '0.5rem' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: C.textMid, margin: '1.5rem 0 0.5rem', lineHeight: 1.3 }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.97rem', color: C.textMid, lineHeight: 1.85, margin: '0 0 1rem' }}>
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul style={{ margin: '0.5rem 0 1.25rem 1.25rem', padding: 0 }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol style={{ margin: '0.5rem 0 1.25rem 1.25rem', padding: 0 }}>{children}</ol>
  ),
  li: ({ children }) => (
    <li style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: C.textMid, lineHeight: 1.8, marginBottom: '0.35rem' }}>
      {children}
    </li>
  ),
  strong: ({ children }) => (
    <strong style={{ color: C.textDark, fontWeight: 700 }}>{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft: `4px solid ${C.skyBright}`, background: C.skyFainter, margin: '1.5rem 0', padding: '1rem 1.25rem', borderRadius: '0 10px 10px 0' }}>
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code style={{ background: C.skyFaint, color: C.skyDeep, padding: '2px 6px', borderRadius: 4, fontSize: '0.88rem', fontFamily: 'monospace' }}>
      {children}
    </code>
  ),
}

export default function BlogDetailPage() {
  const { currentPath, navigate } = useRouter()
const { params } = useRouter()
const slug = params.slug || ''
  const { data: post, loading, error } = useFetch(`/blog/${slug}`, {}, [slug])
  const [imgLoaded, setImgLoaded] = useState(false)

  // Scroll to top on load
useEffect(() => {
  if (!slug) return
  fetch(`${API_BASE}/blog/${slug}/view`, { method: 'POST' })
    .catch(() => {}) // silent — never breaks the page
}, [slug])
  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.skyGhost }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${C.skyFaint}`, borderTop: `3px solid ${C.skyBright}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontFamily: 'var(--font-body)', color: C.textLight }}>Loading article…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (error || !post) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', background: C.skyGhost }}>
      <div style={{ fontSize: '3.5rem' }}>😕</div>
      <p style={{ fontFamily: 'var(--font-body)', color: C.textLight, fontSize: '1.05rem' }}>Article not found.</p>
      <button onClick={() => navigate('/blog')}
        style={{ padding: '0.6rem 1.5rem', borderRadius: 10, background: btnGrad, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
        ← Back to Blog
      </button>
    </div>
  )

  return (
    <div style={{ background: C.skyGhost, minHeight: '100vh' }}>

      {/* ── Slim hero breadcrumb bar ── */}
<div style={{ background: heroGrad, padding: '5rem 4rem 2.5rem' }}>        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <button
            onClick={() => navigate('/blog')}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: 100, padding: '0.3rem 1rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem', backdropFilter: 'blur(8px)' }}
          >
            ← Back to Blog
          </button>

          {/* Category + read time */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(255,255,255,0.3)' }}>
              {post.category}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>
              {post.read_time} read · {formatDate(post.published_at)}
            </span>
            {post.featured && (
              <span style={{ background: 'rgba(255,255,255,0.15)', color: 'white', fontSize: '0.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 100 }}>⭐ Featured</span>
            )}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: 'white', lineHeight: 1.25, maxWidth: 800, marginBottom: '1.25rem' }}>
            {post.title}
          </h1>

          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', color: 'white', fontWeight: 700 }}>
              {(post.author || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{post.author}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)' }}>{post.author_role}</div>
            </div>
            <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)' }}>
              👁 {(post.views || 0).toLocaleString()} views
            </div>
          </div>
        </div>
      </div>

      {/* ── Main 2-col layout ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 4rem', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }}>

        {/* LEFT — Article content */}
        <div>
          {/* Excerpt callout */}
          <div style={{ background: `linear-gradient(135deg, ${C.skyFainter}, ${C.mint})`, border: `1px solid ${C.borderFaint}`, borderLeft: `4px solid ${C.skyBright}`, borderRadius: '0 14px 14px 0', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: C.textMid, lineHeight: 1.75, margin: 0, fontStyle: 'italic' }}>
              {post.excerpt}
            </p>
          </div>

          {/* Markdown content */}
          {post.content ? (
            <div>
              <ReactMarkdown components={mdComponents}>{post.content}</ReactMarkdown>
            </div>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center', background: C.white, borderRadius: 14, border: `1px dashed ${C.borderFaint}` }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✍️</div>
              <p style={{ fontFamily: 'var(--font-body)', color: C.textLight, fontSize: '0.9rem' }}>
                Full article content coming soon.
              </p>
            </div>
          )}

          {/* Tags */}
          {(post.tags || []).length > 0 && (
            <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: `1px solid ${C.borderFaint}` }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: C.textLight, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tags</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {post.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: 100, background: C.skyFaint, color: C.skyMid, fontWeight: 600, fontFamily: 'var(--font-body)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back button */}
          <div style={{ marginTop: '3rem' }}>
            <button
              onClick={() => navigate('/blog')}
              style={{ padding: '0.75rem 2rem', borderRadius: 10, background: btnGrad, color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem', boxShadow: `0 4px 16px rgba(0,191,255,0.3)` }}
            >
              ← Back to All Articles
            </button>
          </div>
        </div>

        {/* RIGHT — Sticky sidebar */}
        <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Article image */}
          <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: `0 8px 32px rgba(0,191,255,0.15)`, background: post.gradient || heroGrad, minHeight: 220, position: 'relative' }}>
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                onLoad={() => setImgLoaded(true)}
                style={{ width: '100%', height: '100%', minHeight: 220, objectFit: 'cover', display: 'block', opacity: imgLoaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
              />
            )}
            {!imgLoaded && !post.image_url && (
              <div style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📝</div>
            )}
          </div>

          {/* Article meta card */}
          <div style={{ background: C.white, borderRadius: 14, border: `1px solid ${C.borderFaint}`, padding: '1.25rem', boxShadow: `0 2px 12px rgba(0,191,255,0.06)` }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Article Info</div>
            {[
              { label: 'Category',  value: post.category },
              { label: 'Published', value: formatDate(post.published_at) },
              { label: 'Read Time', value: post.read_time },
              { label: 'Views',     value: (post.views || 0).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: `1px solid ${C.borderFaint}` }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: C.textLight }}>{label}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: C.textDark }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Author card */}
          <div style={{ background: `linear-gradient(135deg, ${C.skyFainter}, ${C.mint})`, borderRadius: 14, border: `1px solid ${C.borderFaint}`, padding: '1.25rem' }}>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Written By</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: btnGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: 'white', fontWeight: 700, flexShrink: 0 }}>
                {(post.author || '?').split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 700, color: C.textDark }}>{post.author}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: C.textLight }}>{post.author_role}</div>
              </div>
            </div>
          </div>

          {/* Book a session CTA */}
          <div style={{ background: heroGrad, borderRadius: 14, padding: '1.5rem', textAlign: 'center', boxShadow: `0 8px 24px rgba(0,191,255,0.2)` }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧠</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'white', marginBottom: '0.4rem' }}>Need Support?</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1rem', lineHeight: 1.55 }}>
              Talk to one of our licensed therapists today.
            </p>
            <button
              onClick={() => navigate('/book')}
              style={{ padding: '0.6rem 1.25rem', borderRadius: 8, background: C.white, color: C.skyDeep, border: 'none', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', width: '100%' }}
            >
              Book a Session
            </button>
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .blog-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
