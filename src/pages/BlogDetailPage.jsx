// src/pages/BlogDetailPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useFetch } from '../hooks/useFetch'
import ReactMarkdown from 'react-markdown'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

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

const btnGrad     = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyBright} 100%)`
const sectionGrad = `linear-gradient(135deg, ${C.skyFainter} 0%, ${C.mint} 60%, ${C.skyFaint} 100%)`

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const mdComponents = {
  h2: ({ children }) => (
    <h2 style={{
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(1.15rem, 2.5vw, 1.4rem)',
      color: C.textDark,
      margin: '2.25rem 0 0.75rem',
      lineHeight: 1.3,
      borderBottom: `2px solid ${C.skyFaint}`,
      paddingBottom: '0.5rem',
    }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(1rem, 2vw, 1.1rem)',
      color: C.textMid,
      margin: '1.75rem 0 0.5rem',
      lineHeight: 1.3,
    }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{
      fontFamily: 'var(--font-body)',
      fontSize: 'clamp(0.9rem, 2vw, 0.97rem)',
      color: C.textMid,
      lineHeight: 1.9,
      margin: '0 0 1.1rem',
    }}>
      {children}
    </p>
  ),
  ul: ({ children }) => <ul style={{ margin: '0.5rem 0 1.25rem 1.25rem', padding: 0 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '0.5rem 0 1.25rem 1.25rem', padding: 0 }}>{children}</ol>,
  li: ({ children }) => (
    <li style={{
      fontFamily: 'var(--font-body)',
      fontSize: 'clamp(0.88rem, 2vw, 0.95rem)',
      color: C.textMid,
      lineHeight: 1.8,
      marginBottom: '0.4rem',
    }}>
      {children}
    </li>
  ),
  strong: ({ children }) => <strong style={{ color: C.textDark, fontWeight: 700 }}>{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote style={{
      borderLeft: `4px solid ${C.skyBright}`,
      background: C.skyFainter,
      margin: '1.75rem 0',
      padding: '1rem 1.25rem',
      borderRadius: '0 12px 12px 0',
    }}>
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code style={{
      background: C.skyFaint,
      color: C.skyDeep,
      padding: '2px 7px',
      borderRadius: 5,
      fontSize: '0.88rem',
      fontFamily: 'monospace',
      wordBreak: 'break-word',
    }}>
      {children}
    </code>
  ),
}

export default function BlogDetailPage() {
  const { navigate, params } = useRouter()
  const slug = params.slug || ''
  const { data: post, loading, error } = useFetch(`/blog/${slug}`, {}, [slug])
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetch(`${API_BASE}/blog/${slug}/view`, { method: 'POST' }).catch(() => {})
  }, [slug])

  if (loading) return (
    <div style={{
      minHeight: '70vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: C.skyGhost,
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48,
          border: `3px solid ${C.skyFaint}`,
          borderTop: `3px solid ${C.skyBright}`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <p style={{ fontFamily: 'var(--font-body)', color: C.textLight }}>Loading article…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )

  if (error || !post) return (
    <div style={{
      minHeight: '70vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column', gap: '1rem',
      background: C.skyGhost, padding: '1rem',
    }}>
      <div style={{ fontSize: '3.5rem' }}>😕</div>
      <p style={{ fontFamily: 'var(--font-body)', color: C.textLight, fontSize: '1.05rem', textAlign: 'center' }}>
        Article not found.
      </p>
      <button
        onClick={() => navigate('/blog')}
        style={{
          padding: '0.6rem 1.5rem', borderRadius: 10, background: btnGrad,
          color: 'white', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontWeight: 700,
        }}
      >
        ← Back to Blog
      </button>
    </div>
  )

  const authorInitials = (post.author || '?').split(' ').map(w => w[0]).join('').slice(0, 2)

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }

        .blog-hero {
          position: relative;
          overflow: hidden;
          padding: 5rem 4rem 3.5rem;
          border-radius: 0 0 50% 50% / 0 0 36px 36px;
          background:
            radial-gradient(ellipse 75% 60% at 8% 25%, rgba(0,191,255,0.13) 0%, transparent 65%),
            radial-gradient(ellipse 60% 70% at 90% 10%, rgba(0,123,168,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 50% 50% at 55% 95%, rgba(0,159,212,0.08) 0%, transparent 55%),
            linear-gradient(160deg, #ffffff 0%, #f0f9ff 40%, #e6f4fb 100%);
        }
        .blog-hero-blob1 {
          position: absolute; width: 240px; height: 240px; border-radius: 50%;
          background: rgba(0,191,255,0.07); filter: blur(40px);
          top: -60px; right: 2%; pointer-events: none;
        }
        .blog-hero-blob2 {
          position: absolute; width: 160px; height: 160px; border-radius: 50%;
          background: rgba(0,123,168,0.06); filter: blur(32px);
          bottom: -30px; left: 4%; pointer-events: none;
        }
        .blog-hero-inner {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }
        .blog-main-grid {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 4rem;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 3rem;
          align-items: start;
        }
        .blog-sidebar {
          position: sticky;
          top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .blog-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(0,123,168,0.08);
          border: 1px solid ${C.border};
          color: ${C.skyDeep};
          border-radius: 100px;
          padding: 0.35rem 1rem;
          font-family: var(--font-body);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: background 0.2s;
        }
        .blog-back-btn:hover { background: ${C.skyFaint}; }

        .blog-category-pill {
          display: inline-flex;
          align-items: center;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 4px 14px;
          border-radius: 100px;
          background: ${C.skyFaint};
          color: ${C.skyDeep};
          border: 1px solid ${C.border};
          letter-spacing: 0.04em;
        }
        .blog-featured-pill {
          display: inline-flex;
          align-items: center;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 3px 11px;
          border-radius: 100px;
          background: #fff9e6;
          color: #8a5a00;
          border: 1px solid #f5d87a;
        }
        .sidebar-card {
          background: ${C.white};
          border-radius: 16px;
          border: 1px solid ${C.borderFaint};
          padding: 1.35rem;
          box-shadow: 0 2px 14px rgba(0,191,255,0.06);
        }
        .sidebar-card-label {
          font-family: var(--font-body);
          font-size: 0.68rem;
          font-weight: 800;
          color: ${C.textLight};
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.55rem 0;
          border-bottom: 1px solid ${C.borderFaint};
          gap: 0.5rem;
        }
        .meta-row:last-child { border-bottom: none; }

        @media (max-width: 1024px) {
          .blog-hero { padding: 5rem 2.5rem 3rem; }
          .blog-main-grid { padding: 2.5rem; grid-template-columns: 1fr 290px; gap: 2rem; }
        }
        @media (max-width: 768px) {
          .blog-hero { padding: 4.5rem 1.25rem 2.5rem; border-radius: 0 0 40% 40% / 0 0 24px 24px; }
          .blog-main-grid { padding: 1.75rem 1.25rem; grid-template-columns: 1fr; gap: 2rem; }
          .blog-sidebar { position: static; }
        }
        @media (max-width: 480px) {
          .blog-hero { padding: 4rem 1rem 2rem; }
          .blog-main-grid { padding: 1.5rem 1rem; }
        }
      `}</style>

      <div style={{ background: C.skyGhost, minHeight: '100vh' }}>

        {/* ── Hero ── */}
        <div className="blog-hero">
          <div className="blog-hero-blob1" />
          <div className="blog-hero-blob2" />
          <div className="blog-hero-inner">

            {/* Back button */}
            <button className="blog-back-btn" onClick={() => navigate('/blog')}>
              ← Back to Blog
            </button>

            {/* Pills row */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {post.category && (
                <span className="blog-category-pill">{post.category}</span>
              )}
              <span style={{ color: C.textLight, fontSize: '0.75rem', fontFamily: 'var(--font-body)' }}>
                {post.read_time} read · {formatDate(post.published_at)}
              </span>
              {post.featured && (
                <span className="blog-featured-pill">⭐ Featured</span>
              )}
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              color: C.textDark,
              lineHeight: 1.22,
              maxWidth: 820,
              marginBottom: '1.5rem',
              fontWeight: 700,
            }}>
              {post.title}
            </h1>

            {/* Author row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              flexWrap: 'wrap',
              padding: '0.85rem 1.1rem',
              background: 'rgba(255,255,255,0.72)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${C.borderFaint}`,
              borderRadius: 12,
              maxWidth: 480,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: btnGrad,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', color: 'white', fontWeight: 700, flexShrink: 0,
              }}>
                {authorInitials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: 700, color: C.textDark }}>
                  {post.author}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: C.textLight }}>
                  {post.author_role}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: C.textLight, whiteSpace: 'nowrap', flexShrink: 0 }}>
                👁 {(post.views || 0).toLocaleString()} views
              </div>
            </div>

          </div>
        </div>

        {/* ── Main content grid ── */}
        <div className="blog-main-grid">

          {/* LEFT — Article body */}
          <div>

            {/* Excerpt callout */}
            {post.excerpt && (
              <div style={{
                background: sectionGrad,
                border: `1px solid ${C.borderFaint}`,
                borderLeft: `4px solid ${C.skyBright}`,
                borderRadius: '0 14px 14px 0',
                padding: '1.25rem 1.5rem',
                marginBottom: '2.25rem',
              }}>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'clamp(0.9rem, 2vw, 1rem)',
                  color: C.textMid,
                  lineHeight: 1.8,
                  margin: 0,
                  fontStyle: 'italic',
                }}>
                  {post.excerpt}
                </p>
              </div>
            )}

            {/* Article image (mobile — shown above content) */}
            {post.image_url && (
              <div style={{
                display: 'none',
                borderRadius: 16, overflow: 'hidden',
                marginBottom: '2rem',
                boxShadow: `0 8px 32px rgba(0,191,255,0.12)`,
              }}
                className="blog-img-mobile"
              >
                <img
                  src={post.image_url}
                  alt={post.title}
                  style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 260 }}
                />
              </div>
            )}

            {/* Markdown content */}
            {post.content ? (
              <div style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                <ReactMarkdown components={mdComponents}>{post.content}</ReactMarkdown>
              </div>
            ) : (
              <div style={{
                padding: '3rem 2rem', textAlign: 'center',
                background: C.white, borderRadius: 16,
                border: `1.5px dashed ${C.borderFaint}`,
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✍️</div>
                <p style={{ fontFamily: 'var(--font-body)', color: C.textLight, fontSize: '0.9rem' }}>
                  Full article content coming soon.
                </p>
              </div>
            )}

            {/* Tags */}
            {(post.tags || []).length > 0 && (
              <div style={{
                marginTop: '2.5rem',
                paddingTop: '1.5rem',
                borderTop: `1px solid ${C.borderFaint}`,
              }}>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.72rem',
                  fontWeight: 800, color: C.textLight,
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  Tags
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {post.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '0.75rem', padding: '4px 13px',
                      borderRadius: 100, background: C.skyFaint,
                      color: C.skyMid, fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      border: `1px solid ${C.borderFaint}`,
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Back button bottom */}
            <div style={{ marginTop: '3rem' }}>
              <button
                onClick={() => navigate('/blog')}
                style={{
                  padding: '0.75rem 2rem', borderRadius: 10,
                  background: btnGrad, color: 'white', border: 'none',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                  fontWeight: 700, fontSize: '0.9rem',
                  boxShadow: `0 4px 18px rgba(0,191,255,0.3)`,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                ← Back to All Articles
              </button>
            </div>
          </div>

          {/* RIGHT — Sidebar */}
          <div className="blog-sidebar">

            {/* Article image */}
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              boxShadow: `0 8px 32px rgba(0,191,255,0.12)`,
              background: sectionGrad,
              minHeight: 200, position: 'relative',
            }}>
              {post.image_url ? (
                <img
                  src={post.image_url}
                  alt={post.title}
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    width: '100%', minHeight: 200, objectFit: 'cover',
                    display: 'block',
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 0.45s ease',
                  }}
                />
              ) : (
                <div style={{
                  minHeight: 200, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '3rem',
                }}>
                  📝
                </div>
              )}
              {/* gradient overlay at bottom */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
                background: `linear-gradient(to top, rgba(0,123,168,0.1), transparent)`,
                pointerEvents: 'none',
              }} />
            </div>

            {/* Article meta */}
            <div className="sidebar-card">
              <div className="sidebar-card-label">Article Info</div>
              {[
                { label: 'Category',  value: post.category },
                { label: 'Published', value: formatDate(post.published_at) },
                { label: 'Read time', value: post.read_time },
                { label: 'Views',     value: (post.views || 0).toLocaleString() },
              ].map(({ label, value }) => value ? (
                <div key={label} className="meta-row">
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: C.textLight }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: C.textDark, textAlign: 'right' }}>
                    {value}
                  </span>
                </div>
              ) : null)}
            </div>

            {/* Author card */}
            <div style={{
              background: sectionGrad,
              borderRadius: 16,
              border: `1px solid ${C.borderFaint}`,
              padding: '1.35rem',
            }}>
              <div className="sidebar-card-label">Written by</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: 46, height: 46, borderRadius: '50%',
                  background: btnGrad,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', color: 'white', fontWeight: 700, flexShrink: 0,
                  boxShadow: `0 4px 14px rgba(0,191,255,0.3)`,
                }}>
                  {authorInitials}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                    fontWeight: 700, color: C.textDark,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {post.author}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: C.textLight, marginTop: 2 }}>
                    {post.author_role}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA card */}
            <div style={{
              position: 'relative', overflow: 'hidden',
              borderRadius: 16, padding: '1.75rem 1.5rem',
              textAlign: 'center',
              background: `
                radial-gradient(ellipse 80% 60% at 20% 30%, rgba(0,191,255,0.14) 0%, transparent 65%),
                radial-gradient(ellipse 60% 70% at 85% 10%, rgba(0,123,168,0.11) 0%, transparent 60%),
                linear-gradient(158deg, #ffffff 0%, #f0f9ff 50%, #e6f4fb 100%)
              `,
              border: `1.5px solid ${C.border}`,
              boxShadow: `0 8px 28px rgba(0,191,255,0.1)`,
            }}>
              <div style={{
                position: 'absolute', width: 120, height: 120, borderRadius: '50%',
                background: 'rgba(0,191,255,0.07)', filter: 'blur(24px)',
                top: -30, right: -20, pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>🧠</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: '1.05rem',
                  color: C.textDark, marginBottom: '0.45rem', fontWeight: 700,
                }}>
                  Need Support?
                </div>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                  color: C.textMid, marginBottom: '1.1rem', lineHeight: 1.6,
                }}>
                  Talk to one of our licensed therapists today.
                </p>
                <button
                  onClick={() => navigate('/book')}
                  style={{
                    padding: '0.65rem 1.5rem', borderRadius: 10,
                    background: btnGrad, color: 'white', border: 'none',
                    fontFamily: 'var(--font-body)', fontWeight: 700,
                    fontSize: '0.85rem', cursor: 'pointer', width: '100%',
                    boxShadow: `0 4px 16px rgba(0,191,255,0.3)`,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Book a Session →
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}