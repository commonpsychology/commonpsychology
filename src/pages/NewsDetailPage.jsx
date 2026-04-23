// src/pages/NewsDetailPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import ReactMarkdown from 'react-markdown'

const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '')

const T = {
  earthDark:'#3b2f1e', earthMid:'#6b4f35', earthWarm:'#a67c5b', earthLight:'#d4b896',
  earthCream:'#f5ede0', greenDeep:'#2d4a3e', greenMid:'#3d6b5a', greenSoft:'#6a9e88',
  greenPale:'#b8d5c8', greenMist:'#e8f3ee', blueDeep:'#1a3a4a', blueMid:'#2e6080',
  blueSoft:'#5b9ab5', bluePale:'#b0d4e8', blueMist:'#e6f2f8', sky:'#00BFFF',
  skyDark:'#009FD4', skyLight:'#E0F7FF', skyFainter:'#F0FBFF',
  borderFaint:'#daeef8', white:'#ffffff', offWhite:'#faf8f5',
  textDark:'#1e1a15', textMid:'#4a4038', textLight:'#7a6e62',
}

const heroGrad = `linear-gradient(135deg, ${T.blueDeep} 0%, ${T.greenDeep} 55%, ${T.blueMid} 100%)`
const btnGrad  = `linear-gradient(135deg, ${T.blueDeep} 0%, ${T.sky} 100%)`

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
}

const mdComponents = {
  h2: ({ children }) => (
    <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'clamp(1.1rem,2.5vw,1.45rem)',
      color:T.blueDeep, margin:'2.25rem 0 0.8rem', lineHeight:1.3,
      borderBottom:`2px solid ${T.skyLight}`, paddingBottom:'0.5rem' }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'clamp(1rem,2vw,1.1rem)',
      color:T.blueMid, margin:'1.75rem 0 0.5rem', lineHeight:1.35 }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:'clamp(0.9rem,2vw,0.97rem)',
      color:T.textMid, lineHeight:1.9, margin:'0 0 1.1rem' }}>
      {children}
    </p>
  ),
  ul: ({ children }) => <ul style={{ margin:'0.5rem 0 1.25rem 1.25rem', padding:0 }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin:'0.5rem 0 1.25rem 1.25rem', padding:0 }}>{children}</ol>,
  li: ({ children }) => (
    <li style={{ fontFamily:"'Nunito',sans-serif", fontSize:'clamp(0.88rem,2vw,0.95rem)',
      color:T.textMid, lineHeight:1.8, marginBottom:'0.4rem' }}>
      {children}
    </li>
  ),
  strong: ({ children }) => <strong style={{ color:T.textDark, fontWeight:700 }}>{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote style={{ borderLeft:`4px solid ${T.sky}`, background:T.skyFainter,
      margin:'1.75rem 0', padding:'1.1rem 1.4rem', borderRadius:'0 12px 12px 0' }}>
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code style={{ background:T.skyLight, color:T.blueDeep, padding:'2px 7px',
      borderRadius:4, fontSize:'0.88rem', fontFamily:'monospace', wordBreak:'break-word' }}>
      {children}
    </code>
  ),
}

function ArticleVisual({ article, height = 260 }) {
  const [imgErr, setImgErr] = useState(false)
  if (article.image_url && !imgErr) {
    return (
      <img src={article.image_url} alt={article.headline}
        onError={() => setImgErr(true)}
        style={{ width:'100%', height, objectFit:'cover', display:'block' }} />
    )
  }
  return (
    <div style={{ width:'100%', height, background: article.image_gradient || heroGrad,
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
      justifyContent:'center', background:T.offWhite }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:48, height:48, border:`3px solid ${T.skyLight}`,
          borderTop:`3px solid ${T.sky}`, borderRadius:'50%',
          animation:'spin 0.8s linear infinite', margin:'0 auto 1rem' }} />
        <p style={{ fontFamily:"'Nunito',sans-serif", color:T.textLight, fontSize:'0.9rem' }}>
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
      justifyContent:'center', flexDirection:'column', gap:'1rem', background:T.offWhite, padding:'1rem' }}>
      <div style={{ fontSize:'3.5rem' }}>😕</div>
      <p style={{ fontFamily:"'Nunito',sans-serif", color:T.textLight, fontSize:'1.05rem', textAlign:'center' }}>
        Article not found.
      </p>
      <button onClick={() => navigate('/news')}
        style={{ padding:'0.65rem 1.5rem', borderRadius:10, background:btnGrad,
          color:'white', border:'none', cursor:'pointer',
          fontFamily:"'Nunito',sans-serif", fontWeight:700 }}>
        ← Back to News
      </button>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        .news-hero {
          background: ${heroGrad};
          padding: 5.5rem 6rem 3rem;
          position: relative;
          overflow: hidden;
        }
        .news-hero-inner { max-width: 1100px; margin: 0 auto; position: relative; z-index: 1; }

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
          .news-hero { padding: 5rem 2.5rem 2.5rem; }
          .news-body {
            padding: 2.5rem 2.5rem;
            grid-template-columns: 1fr 300px;
            gap: 2rem;
          }
        }

        @media (max-width: 860px) {
          .news-hero { padding: 4.5rem 1.5rem 2.25rem; }
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
          .news-hero { padding: 4rem 1rem 2rem; }
          .news-body { padding: 1.5rem 1rem; }
        }
      `}</style>

      <div style={{ background:T.offWhite, minHeight:'100vh', paddingTop:72 }}>

        {/* HERO */}
        <div className="news-hero">
          {[320,200,120].map((r,i) => (
            <div key={i} style={{ position:'absolute', right:-r/2, top:'50%',
              transform:'translateY(-50%)', width:r*2, height:r*2, borderRadius:'50%',
              border:`1px solid rgba(0,191,255,${0.06+i*0.03})`, pointerEvents:'none' }} />
          ))}

          <div className="news-hero-inner">
            <button onClick={() => navigate('/news')}
              style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)',
                color:'white', borderRadius:100, padding:'0.3rem 1.1rem',
                fontFamily:"'Nunito',sans-serif", fontSize:'0.78rem', fontWeight:600,
                cursor:'pointer', marginBottom:'1.5rem', backdropFilter:'blur(8px)' }}>
              ← Back to News
            </button>

            <div style={{ display:'flex', gap:'0.6rem', alignItems:'center',
              marginBottom:'0.85rem', flexWrap:'wrap' }}>
              {article.news_categories?.name && (
                <span style={{ background:'rgba(255,255,255,0.18)', backdropFilter:'blur(8px)',
                  color:'white', fontSize:'0.72rem', fontWeight:700,
                  padding:'4px 13px', borderRadius:100, border:'1px solid rgba(255,255,255,0.3)' }}>
                  {article.news_categories.name}
                </span>
              )}
              {article.tag && (
                <span style={{ background:T.sky, color:'white', fontSize:'0.7rem',
                  fontWeight:800, padding:'4px 11px', borderRadius:100,
                  letterSpacing:'0.06em', textTransform:'uppercase' }}>
                  {article.tag}
                </span>
              )}
              <span style={{ color:'rgba(255,255,255,0.65)', fontSize:'0.78rem' }}>
                {fmtDate(article.published_at)}{article.read_time ? ` · ${article.read_time}` : ''}
              </span>
            </div>

            <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif",
              fontSize:'clamp(1.5rem,3.5vw,2.6rem)', color:'white',
              lineHeight:1.22, maxWidth:800, marginBottom:'1.25rem', fontWeight:400 }}>
              {article.headline}
            </h1>

            {article.author && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
                <div style={{ width:40, height:40, borderRadius:'50%',
                  background:'rgba(255,255,255,0.22)', border:'2px solid rgba(255,255,255,0.4)',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0 }}>
                  ✍️
                </div>
                <div>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.85rem',
                    fontWeight:700, color:'white' }}>{article.author}</div>
                  {article.author_role && (
                    <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.72rem',
                      color:'rgba(255,255,255,0.65)' }}>{article.author_role}</div>
                  )}
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
              <div style={{ background:`linear-gradient(135deg,${T.skyFainter},${T.greenMist})`,
                border:`1px solid ${T.borderFaint}`, borderLeft:`4px solid ${T.sky}`,
                borderRadius:'0 14px 14px 0', padding:'1.3rem 1.6rem', marginBottom:'2.25rem' }}>
                <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:'clamp(0.9rem,2vw,1rem)',
                  color:T.textMid, lineHeight:1.8, margin:0, fontStyle:'italic' }}>
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
                borderRadius:14, border:`1px dashed ${T.borderFaint}` }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>📰</div>
                <p style={{ fontFamily:"'Nunito',sans-serif", color:T.textLight, fontSize:'0.9rem' }}>
                  Full article content coming soon.
                </p>
              </div>
            )}

            {(article.tags || []).length > 0 && (
              <div style={{ marginTop:'2.5rem', paddingTop:'1.5rem', borderTop:`1px solid ${T.borderFaint}` }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.75rem',
                  fontWeight:800, color:T.textLight, marginBottom:'0.75rem',
                  textTransform:'uppercase', letterSpacing:'0.09em' }}>Tags</div>
                <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap' }}>
                  {article.tags.map(tag => (
                    <span key={tag} style={{ fontSize:'0.75rem', padding:'4px 13px',
                      borderRadius:100, background:T.skyLight, color:T.blueMid,
                      fontWeight:600, fontFamily:"'Nunito',sans-serif" }}>#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop:'3rem' }}>
              <button onClick={() => navigate('/news')}
                style={{ padding:'0.78rem 2rem', borderRadius:10, background:btnGrad,
                  color:'white', border:'none', cursor:'pointer',
                  fontFamily:"'Nunito',sans-serif", fontWeight:700, fontSize:'0.9rem',
                  boxShadow:`0 4px 18px rgba(0,191,255,0.28)` }}>
                ← Back to All News
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="news-sidebar">
            <div style={{ borderRadius:16, overflow:'hidden', boxShadow:`0 8px 36px rgba(0,191,255,0.14)` }}>
              <ArticleVisual article={article} height={240} />
            </div>

            <div style={{ background:T.white, borderRadius:14, border:`1px solid ${T.borderFaint}`,
              padding:'1.3rem', boxShadow:`0 2px 14px rgba(0,191,255,0.06)` }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.7rem', fontWeight:800,
                color:T.textLight, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1rem' }}>
                Article Info
              </div>
              {[
                { label:'Category',  value: article.news_categories?.name || article.category || '—' },
                { label:'Published', value: fmtDate(article.published_at) || '—' },
                { label:'Read Time', value: article.read_time || '—' },
                { label:'Author',    value: article.author || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', padding:'0.55rem 0', borderBottom:`1px solid ${T.borderFaint}`, gap:'0.5rem' }}>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.78rem', color:T.textLight, flexShrink:0 }}>{label}</span>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.78rem',
                    fontWeight:700, color:T.textDark, textAlign:'right', maxWidth:'58%',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</span>
                </div>
              ))}
            </div>

            {article.author && (
              <div style={{ background:`linear-gradient(135deg,${T.skyFainter},${T.greenMist})`,
                borderRadius:14, border:`1px solid ${T.borderFaint}`, padding:'1.3rem' }}>
                <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.7rem', fontWeight:800,
                  color:T.textLight, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'1rem' }}>
                  Written By
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:btnGrad,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.1rem', color:'white', fontWeight:700, flexShrink:0 }}>✍️</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.88rem',
                      fontWeight:700, color:T.textDark, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{article.author}</div>
                    {article.author_role && (
                      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.75rem',
                        color:T.textLight }}>{article.author_role}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ background:heroGrad, borderRadius:14, padding:'1.6rem',
              textAlign:'center', boxShadow:`0 8px 28px rgba(0,191,255,0.2)` }}>
              <div style={{ fontSize:'1.6rem', marginBottom:'0.5rem' }}>🧠</div>
              <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:'1.05rem',
                color:'white', marginBottom:'0.4rem' }}>Need Support?</div>
              <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:'0.78rem',
                color:'rgba(255,255,255,0.75)', marginBottom:'1.1rem', lineHeight:1.6 }}>
                Talk to one of our licensed therapists today.
              </p>
              <button onClick={() => navigate('/book')}
                style={{ padding:'0.65rem 1.3rem', borderRadius:8, background:T.white,
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