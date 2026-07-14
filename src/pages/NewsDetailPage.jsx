// src/pages/NewsDetailPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import ReactMarkdown from 'react-markdown'

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

// ─── Newspaper palette ────────────────────────────────────────────
const T = {
  paper:'#f7f1e3', paperDeep:'#efe4cc', paperLine:'#d8c9a3',
  ink:'#211b14', inkSoft:'#4a4038', inkFaint:'#8a7d68',
  blueDeep:'#1a3a4a', blueMid:'#2e6080', sky:'#0e7c9c', skyDark:'#095a73',
  greenDeep:'#2d4a3e', greenMid:'#3d6b5a',
  white:'#ffffff', cardLine:'#e3d7ba',
}

const btnGrad = `linear-gradient(135deg, ${T.blueDeep} 0%, ${T.sky} 100%)`

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
}
function fmtDateShort(iso) {
  if (!iso) return new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })
  return new Date(iso).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })
}

// ─── Markdown styling — set in serif "column" type ────────────────
const mdComponents = {
  h2: ({ children }) => (
    <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'clamp(1.15rem,2.5vw,1.5rem)',
      color:T.ink, margin:'2.4rem 0 0.8rem', lineHeight:1.3,
      borderBottom:`2px solid ${T.paperLine}`, paddingBottom:'0.5rem' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'clamp(1rem,2vw,1.15rem)',
      color:T.blueMid, margin:'1.85rem 0 0.5rem', lineHeight:1.35, fontStyle:'italic' }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ fontFamily:"'Source Serif 4',Georgia,serif", fontSize:'clamp(0.95rem,2vw,1.04rem)',
      color:T.inkSoft, lineHeight:1.85, margin:'0 0 1.15rem' }}>
      {children}
    </p>
  ),
  ul: ({ children }) => <ul style={{ margin:'0.5rem 0 1.25rem 1.25rem', padding:0 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin:'0.5rem 0 1.25rem 1.25rem', padding:0 }}>{children}</ol>,
  li: ({ children }) => (
    <li style={{ fontFamily:"'Source Serif 4',Georgia,serif", fontSize:'clamp(0.92rem,2vw,1rem)',
      color:T.inkSoft, lineHeight:1.8, marginBottom:'0.4rem' }}>
      {children}
    </li>
  ),
  strong: ({ children }) => <strong style={{ color:T.ink, fontWeight:700 }}>{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft:`3px solid ${T.ink}`, background:T.paperDeep,
      margin:'2rem 0', padding:'1.1rem 1.5rem',
      fontFamily:"'DM Serif Display',Georgia,serif", fontStyle:'italic', fontSize:'1.05rem', color:T.ink }}>
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code style={{ background:T.paperDeep, color:T.blueDeep, padding:'2px 7px',
      borderRadius:4, fontSize:'0.88rem', fontFamily:'monospace', wordBreak:'break-word' }}>
      {children}
    </code>
  ),
}

function ArticleVisual({ article, height = 240 }) {
  const [imgErr, setImgErr] = useState(false)
  if (article.image_url && !imgErr) {
    return (
      <img src={article.image_url} alt={article.headline}
        onError={() => setImgErr(true)}
        style={{ width:'100%', height, objectFit:'cover', display:'block', filter:'grayscale(0.15) contrast(1.05)' }} />
    )
  }
  return (
    <div style={{ width:'100%', height, background: article.image_gradient || `linear-gradient(135deg, ${T.blueDeep}, ${T.greenDeep})`,
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'5rem' }}>
      <span style={{ filter:'drop-shadow(0 4px 20px rgba(0,0,0,0.25))' }}>
        {article.image_emoji || '📰'}
      </span>
    </div>
  )
}

function Loader() {
  return (
    <div style={{ minHeight:'70vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:T.paper }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:44, height:44, border:`2px solid ${T.paperLine}`,
          borderTop:`2px solid ${T.ink}`, borderRadius:'50%',
          animation:'spin 0.8s linear infinite', margin:'0 auto 1rem' }} />
        <p style={{ fontFamily:"'Source Serif 4',Georgia,serif", color:T.inkFaint, fontSize:'0.92rem', fontStyle:'italic' }}>
          Loading article…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}

export default function NewsDetailPage() {
  const { params, navigate } = useRouter()
  const slug = params?.slug || ''

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    setError(false)
    fetch(`${API_BASE}/news/${slug}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => { setArticle(d.article || d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [slug])

  if (loading) return <Loader />

  if (error || !article) return (
    <div style={{ minHeight:'70vh', display:'flex', alignItems:'center',
      justifyContent:'center', flexDirection:'column', gap:'1rem', background:T.paper, padding:'1rem' }}>
      <div style={{ fontSize:'3.5rem' }}>😕</div>
      <p style={{ fontFamily:"'Source Serif 4',Georgia,serif", color:T.inkFaint, fontSize:'1.05rem', textAlign:'center', fontStyle:'italic' }}>
        Article not found.
      </p>
      <button onClick={() => navigate('/our-news')}
        style={{ padding:'0.65rem 1.5rem', borderRadius:4, background:btnGrad,
          color:'white', border:'none', cursor:'pointer',
          fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>
        ← Back to News
      </button>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .news-hero {
          background: ${T.paper};
          padding: 5.5rem 6rem 2.5rem;
          position: relative;
          border-bottom: 4px double ${T.ink};
        }
        .news-hero-inner { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }

        .news-masthead {
          display: flex; align-items: baseline; justify-content: space-between;
          border-top: 3px solid ${T.ink}; border-bottom: 1px solid ${T.ink};
          padding: 0.5rem 0; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 0.5rem;
        }
        .news-eyebrow {
          font-family: 'Nunito', sans-serif; font-size: 0.72rem; font-weight: 800;
          letter-spacing: 0.16em; text-transform: uppercase; color: ${T.ink};
        }
        .news-dateline {
          font-family: 'Nunito', sans-serif; font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.06em; color: ${T.inkFaint};
        }

        .news-body {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 6rem;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 3rem;
          align-items: start;
        }
        .news-sidebar {
          position: sticky;
          top: 6rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        @media (max-width: 1100px) {
          .news-hero { padding: 5rem 2.5rem 2.25rem; }
          .news-body {
            padding: 2.5rem 2.5rem;
            grid-template-columns: 1fr 300px;
            gap: 2rem;
          }
        }

        @media (max-width: 860px) {
          .news-hero { padding: 4.5rem 1.5rem 2rem; }
          .news-body {
            padding: 2rem 1.5rem;
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .news-sidebar {
            position: static;
            top: auto;
          }
        }

        @media (max-width: 480px) {
          .news-hero { padding: 4rem 1rem 1.75rem; }
          .news-body { padding: 1.5rem 1rem; }
        }
      `}</style>

      <div style={{ background:T.paper, minHeight:'100vh', paddingTop:72 }}>

        {/* HERO — newspaper masthead */}
        <div className="news-hero">
          <div className="news-hero-inner">

            <div className="news-masthead">
              <span className="news-eyebrow">Common Psychology · Journal</span>
              <span className="news-dateline">{fmtDateShort(article.published_at)}</span>
            </div>

            <button onClick={() => navigate('/our-news')}
              style={{ background:'none', border:'none', padding:0, marginBottom:'1.5rem',
                color:T.blueMid, fontFamily:"'Nunito',sans-serif", fontSize:'0.8rem', fontWeight:700,
                letterSpacing:'0.04em', cursor:'pointer', textDecoration:'underline', textUnderlineOffset:3 }}>
              ← Back to News
            </button>

            <div style={{ display:'flex', gap:'0.6rem', alignItems:'center',
              marginBottom:'1rem', flexWrap:'wrap' }}>
              {article.news_categories?.name && (
                <span style={{ border:`1px solid ${T.ink}`, color:T.ink, fontSize:'0.7rem', fontWeight:800,
                  padding:'3px 12px', borderRadius:2, textTransform:'uppercase', letterSpacing:'0.08em',
                  fontFamily:"'Nunito',sans-serif" }}>
                  {article.news_categories.name}
                </span>
              )}
              {article.tag && (
                <span style={{ background:T.ink, color:T.paper, fontSize:'0.68rem',
                  fontWeight:800, padding:'4px 11px', borderRadius:2,
                  letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:"'Nunito',sans-serif" }}>
                  {article.tag}
                </span>
              )}
              {article.read_time && (
                <span style={{ color:T.inkFaint, fontSize:'0.78rem', fontFamily:"'Nunito',sans-serif", fontStyle:'italic' }}>
                  {article.read_time} read
                </span>
              )}
            </div>

            <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif",
              fontSize:'clamp(1.8rem,4.2vw,3.1rem)', color:T.ink,
              lineHeight:1.15, maxWidth:820, marginBottom:'1.1rem', fontWeight:400 }}>
              {article.headline}
            </h1>

            <div style={{ height:1, background:T.ink, width:64, marginBottom:'1.2rem' }} />

            {article.author && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                <div style={{ width:38, height:38, borderRadius:'50%',
                  background:btnGrad, border:`1px solid ${T.ink}`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.95rem', flexShrink:0 }}>
                  ✍️
                </div>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.82rem', color:T.inkSoft }}>
                  <span style={{ fontWeight:800, color:T.ink }}>By {article.author}</span>
                  {article.author_role && <span style={{ color:T.inkFaint }}> — {article.author_role}</span>}
                  {article.published_at && <span style={{ color:T.inkFaint }}> · {fmtDate(article.published_at)}</span>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="news-body">

          {/* Article body */}
          <div>
            {article.summary && (
              <div style={{ background:T.paperDeep,
                border:`1px solid ${T.cardLine}`, borderLeft:`3px solid ${T.ink}`,
                borderRadius:'0 8px 8px 0', padding:'1.3rem 1.6rem', marginBottom:'2.25rem' }}>
                <p style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'clamp(1rem,2vw,1.15rem)',
                  color:T.ink, lineHeight:1.7, margin:0, fontStyle:'italic' }}>
                  {article.summary}
                </p>
              </div>
            )}

            {article.content ? (
              <div style={{ overflowWrap:'break-word', wordBreak:'break-word' }}>
                <ReactMarkdown components={mdComponents}>{article.content}</ReactMarkdown>
              </div>
            ) : (
              <div style={{ padding:'2.5rem', textAlign:'center', background:T.white,
                borderRadius:8, border:`1px dashed ${T.cardLine}` }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>📰</div>
                <p style={{ fontFamily:"'Source Serif 4',Georgia,serif", color:T.inkFaint, fontSize:'0.95rem', fontStyle:'italic' }}>
                  Full article content coming soon.
                </p>
              </div>
            )}

            {(article.tags || []).length > 0 && (
              <div style={{ marginTop:'2.5rem', paddingTop:'1.5rem', borderTop:`1px solid ${T.cardLine}` }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.72rem',
                  fontWeight:800, color:T.inkFaint, marginBottom:'0.75rem',
                  textTransform:'uppercase', letterSpacing:'0.1em' }}>Filed Under</div>
                <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                  {article.tags.map(tag => (
                    <span key={tag} style={{ fontSize:'0.75rem', padding:'4px 13px',
                      borderRadius:2, border:`1px solid ${T.cardLine}`, color:T.blueMid,
                      fontWeight:700, fontFamily:"'Nunito',sans-serif" }}>#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop:'3rem' }}>
              <button onClick={() => navigate('/news')}
                style={{ padding:'0.78rem 2rem', borderRadius:4, background:btnGrad,
                  color:'white', border:'none', cursor:'pointer',
                  fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:'0.9rem',
                  boxShadow:`0 4px 18px rgba(14,124,156,0.28)` }}>
                ← Back to All News
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="news-sidebar">
            <div style={{ borderRadius:8, overflow:'hidden', border:`1px solid ${T.ink}` }}>
              <ArticleVisual article={article} height={230} />
            </div>

            <div style={{ background:T.white, borderRadius:6, border:`1px solid ${T.cardLine}`,
              padding:'1.3rem' }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.7rem', fontWeight:800,
                color:T.inkFaint, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1rem',
                borderBottom:`2px solid ${T.ink}`, paddingBottom:'0.5rem' }}>
                Article Info
              </div>
              {[
                { label:'Category',  value: article.news_categories?.name || article.category || '—' },
                { label:'Published', value: fmtDate(article.published_at) || '—' },
                { label:'Read Time', value: article.read_time || '—' },
                { label:'Author',    value: article.author || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', padding:'0.55rem 0', borderBottom:`1px solid ${T.cardLine}`, gap:'0.5rem' }}>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.78rem', color:T.inkFaint, flexShrink:0 }}>{label}</span>
                  <span style={{ fontFamily:"'Source Serif 4',Georgia,serif", fontSize:'0.82rem',
                    fontWeight:700, color:T.ink, textAlign:'right', maxWidth:'58%',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</span>
                </div>
              ))}
            </div>

            {article.author && (
              <div style={{ background:T.paperDeep,
                borderRadius:6, border:`1px solid ${T.cardLine}`, padding:'1.3rem' }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.7rem', fontWeight:800,
                  color:T.inkFaint, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1rem' }}>
                  Written By
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:btnGrad,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.1rem', color:'white', fontWeight:700, flexShrink:0,
                    border:`1px solid ${T.ink}` }}>✍️</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'0.95rem',
                      fontWeight:400, color:T.ink, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{article.author}</div>
                    {article.author_role && (
                      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.75rem',
                        color:T.inkFaint }}>{article.author_role}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ background:`linear-gradient(135deg, ${T.blueDeep} 0%, ${T.greenDeep} 100%)`,
              borderRadius:6, padding:'1.6rem', border:`1px solid ${T.ink}`,
              textAlign:'center' }}>
              <div style={{ fontSize:'1.6rem', marginBottom:'0.5rem' }}>🧠</div>
              <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'1.05rem',
                color:'white', marginBottom:'0.4rem' }}>Need Support?</div>
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.78rem',
                color:'rgba(255,255,255,0.8)', marginBottom:'1.1rem', lineHeight:1.6 }}>
                Talk to one of our licensed therapists today.
              </p>
              <button onClick={() => navigate('/book')}
                style={{ padding:'0.65rem 1.3rem', borderRadius:4, background:T.paper,
                  color:T.blueDeep, border:'none', fontFamily:"'Nunito',sans-serif",
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