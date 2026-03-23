// src/pages/NewsDetailPage.jsx
// Route: /news/:slug
// Full article page — uses your existing site header/footer
// Fetches article by slug, shows full content + related articles

import { useState, useEffect } from "react"
import { useRouter } from "../context/RouterContext"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"

const T = {
  earthCream:"#f5ede0",greenDeep:"#2d4a3e",greenMid:"#3d6b5a",greenSoft:"#6a9e88",
  greenPale:"#b8d5c8",greenMist:"#e8f3ee",blueDeep:"#1a3a4a",blueMid:"#2e6080",
  blueSoft:"#5b9ab5",bluePale:"#b0d4e8",blueMist:"#e6f2f8",sky:"#00BFFF",
  skyLight:"#E0F7FF",skyFainter:"#F0FBFF",borderFaint:"#daeef8",
  white:"#ffffff",offWhite:"#faf8f5",textDark:"#1e1a15",textMid:"#4a4038",textLight:"#7a6e62",
}

function fmtDate(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})
}

function ArticleImage({ article, height=420 }) {
  return (
    <div style={{ width:"100%", height,
      background: article.image_gradient || `linear-gradient(135deg,${T.greenDeep},${T.blueMid})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:"6rem", position:"relative", overflow:"hidden" }}>
      <span style={{ filter:"drop-shadow(0 8px 32px rgba(0,0,0,0.25))" }}>
        {article.image_emoji || "📰"}
      </span>
      {/* Dark overlay at bottom for text legibility */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"50%",
        background:"linear-gradient(to top, rgba(26,58,74,0.5) 0%, transparent 100%)" }} />
      {article.tag && (
        <div style={{ position:"absolute", top:20, left:24, background:T.sky, color:T.white,
          fontFamily:"'Nunito',sans-serif", fontSize:"0.72rem", fontWeight:800,
          letterSpacing:"0.1em", textTransform:"uppercase", padding:"5px 14px", borderRadius:100,
          boxShadow:"0 4px 12px rgba(0,191,255,0.3)" }}>
          {article.tag}
        </div>
      )}
    </div>
  )
}

function RelatedCard({ article, onClick }) {
  return (
    <div onClick={onClick}
      style={{ background:T.white, borderRadius:14, overflow:"hidden",
        border:`1px solid ${T.borderFaint}`, cursor:"pointer",
        boxShadow:"0 2px 12px rgba(26,58,74,0.06)",
        transition:"transform 0.22s, box-shadow 0.22s" }}
      onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 28px rgba(0,191,255,0.13)" }}
      onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 12px rgba(26,58,74,0.06)" }}>
      <div style={{ height:140, background: article.image_gradient || `linear-gradient(135deg,${T.greenDeep},${T.blueMid})`,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.5rem" }}>
        {article.image_emoji || "📰"}
      </div>
      <div style={{ padding:"1rem 1.25rem 1.25rem" }}>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.62rem", fontWeight:800,
          letterSpacing:"0.1em", textTransform:"uppercase", color:T.sky, marginBottom:6 }}>
          {article.news_categories?.name}
        </div>
        <h4 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"0.95rem",
          fontWeight:400, color:T.blueDeep, lineHeight:1.35, marginBottom:"0.5rem" }}>
          {article.headline}
        </h4>
        <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.7rem", color:T.textLight }}>
          {article.read_time}
        </div>
      </div>
    </div>
  )
}

function SkeletonDetail() {
  const Sk = ({ w="100%", h=16, r=6 }) => (
    <div style={{ width:w, height:h, borderRadius:r,
      background:`linear-gradient(90deg,${T.borderFaint} 0%,${T.skyFainter} 50%,${T.borderFaint} 100%)`,
      animation:"pulse 1.5s ease infinite", backgroundSize:"200% 100%", marginBottom:12 }} />
  )
  return (
    <div style={{ maxWidth:760, margin:"0 auto", padding:"3rem 2rem" }}>
      <Sk h={420} r={0} /><Sk w="40%" h={14} /><Sk w="85%" h={36} r={4} />
      <Sk w="70%" h={28} r={4} /><Sk h={14} /><Sk h={14} /><Sk w="80%" h={14} />
    </div>
  )
}

export default function NewsDetailPage() {
  const { params, navigate } = useRouter()
  const slug = params?.slug

  const [article,  setArticle]  = useState(null)
  const [related,  setRelated]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [copied,   setCopied]   = useState(false)

  // Scroll to top on load
  useEffect(() => { window.scrollTo({ top:0, behavior:"smooth" }) }, [slug])

  // Fetch article
  useEffect(() => {
    if (!slug) { navigate("/news"); return }
    setLoading(true)
    setError(false)
    fetch(`${API_BASE}/api/news/${slug}`)
      .then(r => { if (!r.ok) throw new Error("not found"); return r.json() })
      .then(d  => { setArticle(d.article); setError(false) })
      .catch(()=> setError(true))
      .finally(()=> setLoading(false))
  }, [slug])

  // Fetch related
  useEffect(() => {
    if (!slug) return
    fetch(`${API_BASE}/api/news/related/${slug}`)
      .then(r => r.json())
      .then(d => setRelated(d.articles || []))
      .catch(() => setRelated([]))
  }, [slug])

  function handleCopy() {
    navigator.clipboard?.writeText(window.location.href).then(()=>{
      setCopied(true)
      setTimeout(()=>setCopied(false), 2000)
    })
  }

  // ── ERROR STATE ──
  if (!loading && error) return (
    <div className="page-wrapper">
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", padding:"4rem 2rem", textAlign:"center" }}>
        <div style={{ fontSize:"4rem", marginBottom:"1rem" }}>📰</div>
        <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.8rem",
          color:T.blueDeep, marginBottom:"0.75rem" }}>Article Not Found</h2>
        <p style={{ fontFamily:"'Nunito',sans-serif", color:T.textLight, marginBottom:"2rem" }}>
          This article may have been moved or removed.
        </p>
        <button onClick={()=>navigate("/news")}
          style={{ padding:"0.75rem 2rem", borderRadius:100, background:T.sky, border:"none",
            color:T.white, fontFamily:"'Nunito',sans-serif", fontSize:"0.9rem",
            fontWeight:700, cursor:"pointer" }}>
          ← Back to News
        </button>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap');
        *{box-sizing:border-box}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .article-body p { margin-bottom: 1.5rem; }
        @media(max-width:900px){
          .detail-layout { grid-template-columns: 1fr !important; }
          .detail-sticky { position: static !important; }
        }
      `}</style>

      <div className="page-wrapper" style={{ paddingTop:72, background:T.offWhite, minHeight:"100vh" }}>

        {loading ? <SkeletonDetail /> : article && (
          <>
            {/* ── BREADCRUMB ── */}
            <div style={{ background:T.white, borderBottom:`1px solid ${T.borderFaint}`,
              padding:"0.75rem 4rem" }}>
              <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center",
                gap:"0.5rem", fontFamily:"'Nunito',sans-serif", fontSize:"0.78rem" }}>
                <span onClick={()=>navigate("/")} style={{ color:T.sky, cursor:"pointer",
                  fontWeight:600 }}>Home</span>
                <span style={{ color:T.borderFaint }}>›</span>
                <span onClick={()=>navigate("/news")} style={{ color:T.sky, cursor:"pointer",
                  fontWeight:600 }}>News</span>
                <span style={{ color:T.borderFaint }}>›</span>
                <span style={{ color:T.textLight, fontWeight:600 }}>
                  {article.news_categories?.name}
                </span>
              </div>
            </div>

            {/* ── ARTICLE HERO IMAGE ── */}
            <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 0 0 0" }}>
              <ArticleImage article={article} height={480} />
            </div>

            {/* ── MAIN LAYOUT ── */}
            <div className="detail-layout" style={{ maxWidth:1200, margin:"0 auto",
              display:"grid", gridTemplateColumns:"1fr 300px", gap:"3rem",
              padding:"2.5rem 2rem 4rem", alignItems:"start" }}>

              {/* ── LEFT: ARTICLE BODY ── */}
              <article style={{ animation:"fadeUp 0.5s ease both" }}>

                {/* Meta row */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem",
                  flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.72rem", fontWeight:800,
                    letterSpacing:"0.1em", textTransform:"uppercase", color:T.sky,
                    background:T.skyLight, padding:"4px 12px", borderRadius:100 }}>
                    {article.news_categories?.name}
                  </span>
                  {article.tag && (
                    <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.68rem", fontWeight:700,
                      letterSpacing:"0.08em", textTransform:"uppercase",
                      color:T.blueMid, background:T.blueMist, padding:"4px 10px", borderRadius:100 }}>
                      {article.tag}
                    </span>
                  )}
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.75rem", color:T.textLight }}>
                    {fmtDate(article.published_at)}
                  </span>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.75rem", color:T.textLight }}>
                    · {article.read_time}
                  </span>
                  {article.views > 0 && (
                    <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.72rem", color:T.textLight }}>
                      · {article.views.toLocaleString()} views
                    </span>
                  )}
                </div>

                {/* Headline */}
                <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif",
                  fontSize:"clamp(1.75rem,3vw,2.6rem)", fontWeight:400,
                  color:T.blueDeep, lineHeight:1.2, marginBottom:"1.25rem" }}>
                  {article.headline}
                </h1>

                {/* Summary (lead paragraph) */}
                <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:"1.08rem",
                  color:T.textMid, lineHeight:1.8, marginBottom:"2rem",
                  paddingLeft:"1.25rem", borderLeft:`4px solid ${T.sky}`,
                  fontWeight:500 }}>
                  {article.summary}
                </p>

                {/* Author strip */}
                <div style={{ display:"flex", alignItems:"center", gap:12,
                  padding:"1rem 1.25rem", background:T.skyFainter,
                  borderRadius:10, marginBottom:"2.5rem",
                  border:`1px solid ${T.borderFaint}` }}>
                  <div style={{ width:44, height:44, borderRadius:"50%", background:T.skyLight,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.3rem",
                    flexShrink:0 }}>
                    {article.author_emoji || "✍️"}
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.88rem",
                      fontWeight:700, color:T.blueDeep }}>{article.author}</div>
                    <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.72rem",
                      color:T.textLight }}>{article.author_role || "Clinical Correspondent"}</div>
                  </div>
                </div>

                {/* Full content — each paragraph separated by \n\n */}
                <div className="article-body" style={{ fontFamily:"'Nunito',sans-serif",
                  fontSize:"1rem", color:T.textMid, lineHeight:1.85 }}>
                  {(article.content || article.summary || "")
                    .split("\n\n")
                    .filter(p => p.trim())
                    .map((para, i) => (
                      <p key={i} style={{ marginBottom:"1.5rem" }}>{para.trim()}</p>
                    ))}
                </div>

                {/* Divider */}
                <div style={{ height:1, background:T.borderFaint, margin:"2.5rem 0" }} />

                {/* Share + nav row */}
                <div style={{ display:"flex", alignItems:"center",
                  justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
                    <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.8rem",
                      fontWeight:700, color:T.textMid }}>Share:</span>
                    {[
                      { label:"Copy Link", icon:"🔗", action: handleCopy },
                      { label:"Twitter",   icon:"🐦", action: ()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.headline)}&url=${encodeURIComponent(window.location.href)}`,"_blank") },
                      { label:"Facebook",  icon:"📘", action: ()=>window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,"_blank") },
                    ].map(btn=>(
                      <button key={btn.label} onClick={btn.action}
                        style={{ display:"flex", alignItems:"center", gap:5,
                          padding:"0.45rem 0.9rem", borderRadius:100,
                          border:`1.5px solid ${T.borderFaint}`, background:T.white,
                          fontFamily:"'Nunito',sans-serif", fontSize:"0.75rem",
                          fontWeight:600, color:T.textMid, cursor:"pointer",
                          transition:"all 0.18s" }}
                        onMouseEnter={e=>{ e.currentTarget.style.background=T.skyLight; e.currentTarget.style.borderColor=T.sky }}
                        onMouseLeave={e=>{ e.currentTarget.style.background=T.white; e.currentTarget.style.borderColor=T.borderFaint }}>
                        {btn.icon} {btn.label === "Copy Link" && copied ? "Copied!" : btn.label}
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>navigate("/news")}
                    style={{ padding:"0.6rem 1.5rem", borderRadius:100,
                      border:`2px solid ${T.sky}`, background:"transparent",
                      color:T.sky, fontFamily:"'Nunito',sans-serif",
                      fontSize:"0.85rem", fontWeight:700, cursor:"pointer",
                      transition:"all 0.2s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background=T.sky; e.currentTarget.style.color=T.white }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.sky }}>
                    ← All News
                  </button>
                </div>

                {/* Related Articles */}
                {related.length > 0 && (
                  <div style={{ marginTop:"3.5rem" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.5rem" }}>
                      <div style={{ flex:1, height:1, background:T.borderFaint }} />
                      <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.68rem",
                        fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase",
                        color:T.textLight }}>Related Articles</span>
                      <div style={{ flex:1, height:1, background:T.borderFaint }} />
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.25rem" }}>
                      {related.map(a=>(
                        <RelatedCard key={a.id} article={a}
                          onClick={()=>{ navigate("/news/"+a.slug); window.scrollTo({top:0,behavior:"smooth"}) }} />
                      ))}
                    </div>
                  </div>
                )}
              </article>

              {/* ── RIGHT SIDEBAR ── */}
              <aside className="detail-sticky" style={{ position:"sticky", top:100 }}>

                {/* Book therapy CTA */}
                <div style={{ background:`linear-gradient(135deg,${T.greenDeep} 0%,${T.blueDeep} 100%)`,
                  borderRadius:16, padding:"1.75rem", color:T.white, marginBottom:"1.5rem" }}>
                  <div style={{ fontSize:"2rem", marginBottom:"0.75rem" }}>🌿</div>
                  <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.15rem",
                    fontWeight:400, marginBottom:"0.5rem", lineHeight:1.3 }}>
                    Ready to take the next step?
                  </h3>
                  <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.78rem",
                    color:"rgba(255,255,255,0.65)", lineHeight:1.55, marginBottom:"1.25rem" }}>
                    Our licensed therapists are ready to help. Book a session today — first consultation is free.
                  </p>
                  <button onClick={()=>navigate("/book")}
                    style={{ width:"100%", padding:"0.75rem", borderRadius:8, border:"none",
                      background:T.sky, color:T.white, fontFamily:"'Nunito',sans-serif",
                      fontSize:"0.88rem", fontWeight:700, cursor:"pointer",
                      transition:"opacity 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
                    onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                    Book Free Consultation →
                  </button>
                </div>

                {/* Take assessment CTA */}
                <div style={{ background:T.white, borderRadius:14, padding:"1.5rem",
                  border:`1px solid ${T.borderFaint}`, marginBottom:"1.5rem" }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.7rem", fontWeight:800,
                    letterSpacing:"0.12em", textTransform:"uppercase", color:T.textLight, marginBottom:"0.75rem" }}>
                    Free Tool
                  </div>
                  <h4 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1rem",
                    fontWeight:400, color:T.blueDeep, marginBottom:"0.5rem" }}>
                    Assess Your Mental Health
                  </h4>
                  <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.78rem",
                    color:T.textLight, lineHeight:1.55, marginBottom:"1rem" }}>
                    Take a free, clinically validated screening — PHQ-9, GAD-7, DASS-21, or Burnout Check.
                  </p>
                  <button onClick={()=>navigate("/assessments")}
                    style={{ width:"100%", padding:"0.65rem", borderRadius:8,
                      border:`2px solid ${T.sky}`, background:"transparent", color:T.sky,
                      fontFamily:"'Nunito',sans-serif", fontSize:"0.82rem",
                      fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background=T.sky; e.currentTarget.style.color=T.white }}
                    onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.sky }}>
                    Start Free Assessment
                  </button>
                </div>

                {/* Article info card */}
                <div style={{ background:T.white, borderRadius:14, padding:"1.5rem",
                  border:`1px solid ${T.borderFaint}` }}>
                  <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.7rem", fontWeight:800,
                    letterSpacing:"0.12em", textTransform:"uppercase", color:T.textLight, marginBottom:"1rem" }}>
                    About This Article
                  </div>
                  {[
                    ["Author",    article.author],
                    ["Category",  article.news_categories?.name],
                    ["Published", fmtDate(article.published_at)],
                    ["Read Time", article.read_time],
                    ...(article.views > 0 ? [["Views", article.views.toLocaleString()]] : []),
                  ].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between",
                      padding:"0.55rem 0", borderBottom:`1px solid ${T.skyFainter}` }}>
                      <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.78rem",
                        color:T.textLight }}>{k}</span>
                      <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.78rem",
                        fontWeight:600, color:T.textDark, textAlign:"right",
                        maxWidth:"55%" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </>
  )
}