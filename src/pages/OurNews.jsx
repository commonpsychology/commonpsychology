// src/pages/OurNews.jsx
// Fully dynamic — fetches from /api/news and /api/news/meta
// Clicking any article navigates to /news/:slug (NewsDetailPage)

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "../context/RouterContext"

// ✅ FIXED: API_BASE always ends with /api — matches detail pages exactly
const API_BASE = (import.meta.env.VITE_API_URL || "${import.meta.env.VITE_API_URL}/api")
  .replace(/\/+$/, "")   // strip trailing slash
  .replace(/\/api$/, "") // strip /api if already present
  + "/api"               // re-append exactly once

/* ─── DESIGN TOKENS — newspaper palette (matches NewsDetailPage) ─ */
const T = {
  paper:"#f7f1e3", paperDeep:"#efe4cc", paperLine:"#d8c9a3",
  ink:"#211b14", inkSoft:"#4a4038", inkFaint:"#8a7d68",
  blueDeep:"#1a3a4a", blueMid:"#2e6080", sky:"#0e7c9c", skyDark:"#095a73",
  greenDeep:"#2d4a3e", greenMid:"#3d6b5a", greenPale:"#b8d5c8",
  white:"#ffffff", cardLine:"#e3d7ba",
}

/* ─── STATIC FALLBACK DATA ───────────────────────────────────── */
const FALLBACK_ARTICLES = [
  { id:"1", slug:"mindfulness-reduces-anxiety-40-percent", headline:"New Study Reveals Mindfulness Meditation Reduces Anxiety by 40% in Clinical Trials", summary:"Researchers at Harvard Medical School have published groundbreaking findings showing that consistent mindfulness practice significantly reduces cortisol levels and anxiety symptoms.", author:"Dr. Priya Sharma", read_time:"6 min read", size:"hero", tag:"Research", image_gradient:`linear-gradient(135deg,${T.greenDeep} 0%,${T.blueMid} 60%,${T.sky} 100%)`, image_emoji:"🧘", published_at:"2026-03-22", news_categories:{name:"Mental Health",slug:"mental-health"} },
  { id:"2", slug:"online-therapy-300-percent-growth", headline:"Online Therapy Platforms See 300% Growth Post-Pandemic", summary:"Digital mental health services are reshaping how millions access therapy, breaking down geographic and financial barriers.", author:"Ananya Patel", read_time:"4 min read", size:"secondary", tag:"Access", image_gradient:`linear-gradient(135deg,${T.blueMid} 0%,${T.sky} 100%)`, image_emoji:"💻", published_at:"2026-03-21", news_categories:{name:"Therapy",slug:"therapy"} },
  { id:"3", slug:"science-of-sleep-heals-anxious-mind", headline:"The Science of Sleep: How Rest Heals the Anxious Mind", summary:"Neuroscientists have mapped the precise mechanisms by which deep sleep processes emotional memories.", author:"Dr. Raj Mehta", read_time:"5 min read", size:"secondary", tag:"Neuroscience", image_gradient:`linear-gradient(135deg,${T.greenMid} 0%,${T.blueMid} 100%)`, image_emoji:"🌙", published_at:"2026-03-20", news_categories:{name:"Well-Being",slug:"well-being"} },
  { id:"4", slug:"nepal-rural-mental-health-clinics", headline:"Nepal's First Rural Mental Health Clinics Open Doors to 50,000 Residents", summary:"A landmark initiative brings licensed therapists and psychiatrists to rural mountain communities.", author:"Sita Gurung", read_time:"7 min read", size:"medium", tag:"Access", image_gradient:`linear-gradient(135deg,${T.inkFaint} 0%,${T.greenDeep} 100%)`, image_emoji:"🏔️", published_at:"2026-03-19", news_categories:{name:"Community",slug:"community"} },
  { id:"5", slug:"psychedelic-therapy-science-healing", headline:"Psychedelic-Assisted Therapy: Where Science Meets Healing", summary:"Phase III clinical trials for psilocybin therapy show remarkable results for treatment-resistant depression.", author:"Dr. Kavya Nair", read_time:"8 min read", size:"medium", tag:"Research", image_gradient:`linear-gradient(135deg,${T.blueDeep} 0%,${T.sky} 100%)`, image_emoji:"🔬", published_at:"2026-03-18", news_categories:{name:"Research",slug:"research"} },
  { id:"6", slug:"raising-emotionally-intelligent-children", headline:"Raising Emotionally Intelligent Children: A Practical Guide", summary:"Child psychologists outline evidence-based strategies for fostering emotional resilience from infancy through adolescence.", author:"Meera Joshi", read_time:"5 min read", size:"medium", tag:"Guide", image_gradient:`linear-gradient(135deg,${T.greenMid} 0%,${T.paperDeep} 100%)`, image_emoji:"👨‍👩‍👧", published_at:"2026-03-17", news_categories:{name:"Parenting",slug:"parenting"} },
  { id:"7", slug:"corporate-burnout-chief-mental-health-officers", headline:"Corporate Burnout Crisis: Why Fortune 500 Companies Are Hiring Chief Mental Health Officers", summary:"A seismic shift in corporate culture sees employee wellbeing elevated to board-level priority.", author:"Arjun Thapa", read_time:"6 min read", size:"small", tag:"Workplace", image_gradient:`linear-gradient(135deg,${T.blueDeep} 0%,${T.blueMid} 100%)`, image_emoji:"🏢", published_at:"2026-03-16", news_categories:{name:"Workplace",slug:"workplace"} },
  { id:"8", slug:"journaling-mental-health-evidence", headline:"Journaling for Mental Health: The Evidence Behind the Practice", summary:"Meta-analysis of 200+ studies confirms expressive writing reduces depression symptoms.", author:"Dr. Sunita Rai", read_time:"3 min read", size:"small", tag:"Self-Care", image_gradient:`linear-gradient(135deg,${T.paperDeep} 0%,${T.greenPale} 100%)`, image_emoji:"📓", published_at:"2026-03-15", news_categories:{name:"Self-Care",slug:"self-care"} },
  { id:"9", slug:"crisis-lines-record-volumes-new-methods", headline:"24/7 Mental Health Crisis Lines Report Record Call Volumes", summary:"Crisis helplines are expanding text and chat support as younger generations prefer digital communication.", author:"Riya Thakur", read_time:"4 min read", size:"small", tag:"Crisis", image_gradient:`linear-gradient(135deg,${T.ink} 0%,${T.blueDeep} 100%)`, image_emoji:"📞", published_at:"2026-03-14", news_categories:{name:"Crisis Support",slug:"crisis-support"} },
  { id:"10", slug:"gut-brain-connection-diet-mental-health", headline:"The Gut-Brain Connection: How Your Diet Shapes Your Mental Health", summary:"Emerging research in nutritional psychiatry reveals the profound impact of gut microbiome health on mood regulation.", author:"Dr. Pooja Sharma", read_time:"5 min read", size:"small", tag:"Nutrition", image_gradient:`linear-gradient(135deg,${T.greenMid} 0%,${T.sky} 100%)`, image_emoji:"🥗", published_at:"2026-03-13", news_categories:{name:"Nutrition",slug:"nutrition"} },
]

const FALLBACK_CATEGORIES = ["All","Mental Health","Therapy","Research","Well-Being","Community","Workplace","Self-Care"]
const FALLBACK_TOPICS = ["Anxiety","Depression","Mindfulness","Relationships","Grief","Trauma","Self-care","CBT","Parenting","Sleep","Nutrition","Work Stress"]

function fmtDate(iso) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })
}

/* ─── ARTICLE IMAGE VISUAL ───────────────────────────────────── */
function ArticleImage({ article, height=220, style={} }) {
  return (
    <div style={{
      width:"100%", height,
      background: article.image_gradient || `linear-gradient(135deg,${T.greenDeep},${T.blueMid})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize: height>200 ? "4rem" : "3rem",
      position:"relative", overflow:"hidden", flexShrink:0,
      filter:"grayscale(0.1) contrast(1.05)",
      ...style,
    }}>
      <span style={{ filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.2))" }}>{article.image_emoji || "📰"}</span>
      {article.tag && (
        <div style={{ position:"absolute", top:10, left:0, background:T.ink, color:T.paper,
          fontFamily:"'Nunito',sans-serif", fontSize:"0.65rem", fontWeight:800,
          letterSpacing:"0.1em", textTransform:"uppercase", padding:"3px 12px" }}>
          {article.tag}
        </div>
      )}
    </div>
  )
}

/* ─── CATEGORY PILL — outlined, ink-on-active ───────────────── */
function CatPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"0.42rem 1.05rem", borderRadius:2,
      fontFamily:"'Nunito',sans-serif", fontSize:"0.75rem", fontWeight:700,
      letterSpacing:"0.03em",
      border: `1.5px solid ${T.ink}`,
      background: active ? T.ink : "transparent",
      color: active ? T.paper : T.ink,
      cursor:"pointer", whiteSpace:"nowrap", transition:"all 0.2s",
    }}>{label}</button>
  )
}

/* ─── NEWSLETTER BOX ─────────────────────────────────────────── */
function NewsletterBox() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle | loading | done | error

  async function handleSubscribe() {
    if (!email) return
    setStatus("loading")
    try {
      const res = await fetch(`${API_BASE}/news/subscribe`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ email })
      })
      if (res.ok) setStatus("done")
      else setStatus("error")
    } catch {
      setStatus("done")
    }
  }

  return (
    <div style={{ background:`linear-gradient(135deg,${T.blueDeep} 0%,${T.greenDeep} 100%)`,
      borderRadius:6, padding:"1.9rem 1.6rem", color:T.paper, marginBottom:"1.5rem",
      border:`1px solid ${T.ink}` }}>
      <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.68rem", fontWeight:800, letterSpacing:"0.14em", textTransform:"uppercase", color:T.greenPale, marginBottom:"0.5rem" }}>Newsletter</div>
      <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.2rem", fontWeight:400, marginBottom:"0.5rem", lineHeight:1.3 }}>Mental health insights, weekly</h3>
      <p style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.78rem", color:"rgba(247,241,227,0.7)", lineHeight:1.55, marginBottom:"1.25rem" }}>Expert-curated articles, research highlights, and wellness tips delivered every Sunday.</p>
      {status === "done" ? (
        <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:4, padding:"0.75rem", textAlign:"center", fontSize:"0.82rem", fontWeight:600 }}>✅ You're subscribed!</div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"0.5rem" }}>
          <input value={email} onChange={e=>setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ padding:"0.65rem 1rem", borderRadius:4, border:"1.5px solid rgba(247,241,227,0.3)",
              background:"rgba(255,255,255,0.08)", color:T.paper,
              fontFamily:"'Nunito',sans-serif", fontSize:"0.85rem", outline:"none" }} />
          <button onClick={handleSubscribe} disabled={status==="loading"}
            style={{ padding:"0.65rem", borderRadius:4, border:"none",
              background:T.paper, color:T.ink, fontFamily:"'Nunito',sans-serif",
              fontSize:"0.85rem", fontWeight:700, cursor:"pointer",
              opacity: status==="loading" ? 0.7 : 1 }}>
            {status==="loading" ? "Subscribing…" : "Subscribe Free"}
          </button>
          {status==="error" && <p style={{ fontSize:"0.75rem", color:"#f3a0a0", margin:0 }}>Something went wrong. Please try again.</p>}
        </div>
      )}
    </div>
  )
}

/* ─── TRENDING SIDEBAR ───────────────────────────────────────── */
function TrendingSidebar({ articles, onSelect }) {
  return (
    <div style={{ background:T.white, borderRadius:6, border:`1px solid ${T.cardLine}`, overflow:"hidden", marginBottom:"1.5rem" }}>
      <div style={{ background:T.ink, padding:"0.8rem 1.25rem",
        fontFamily:"'Nunito',sans-serif", fontSize:"0.68rem", fontWeight:800,
        letterSpacing:"0.14em", textTransform:"uppercase", color:T.paper,
        display:"flex", alignItems:"center", gap:6 }}>🔥 Trending</div>
      {articles.slice(0,5).map((a,i)=>(
        <div key={a.id} onClick={()=>onSelect(a)}
          style={{ display:"flex", gap:12, padding:"0.9rem 1.1rem",
            borderBottom: i<4 ? `1px solid ${T.cardLine}` : "none",
            cursor:"pointer", transition:"background 0.18s" }}
          onMouseEnter={e=>e.currentTarget.style.background=T.paperDeep}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <span style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.6rem",
            color:T.cardLine, lineHeight:1, flexShrink:0, minWidth:28 }}>{i+1}</span>
          <div>
            <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.62rem", fontWeight:800,
              letterSpacing:"0.1em", textTransform:"uppercase", color:T.blueMid, marginBottom:3 }}>
              {a.news_categories?.name || a.category}
            </div>
            <p style={{ fontFamily:"'Source Serif 4',Georgia,serif", fontSize:"0.85rem", fontWeight:600,
              color:T.ink, lineHeight:1.4, margin:0 }}>{a.headline.slice(0,72)}…</p>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.7rem", color:T.inkFaint }}>{a.read_time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── BREAKING TICKER ────────────────────────────────────────── */
function BreakingTicker() {
  const items = [
    "New mindfulness app reaches 1 million downloads in Nepal",
    "WHO releases updated mental health guidelines for 2026",
    "Common Psychology opens new telehealth clinics this quarter",
    "Research: 1 in 5 adults experience anxiety disorder annually",
    "Free depression screening available — see assessments",
  ]
  const [idx,setIdx] = useState(0)
  useEffect(()=>{const t=setInterval(()=>setIdx(i=>(i+1)%items.length),3500);return()=>clearInterval(t)},[])
  return (
    <div style={{ background:T.ink, color:T.paper, display:"flex", alignItems:"center", height:38, overflow:"hidden",
      borderBottom:`1px solid ${T.ink}` }}>
      <div style={{ background:"#8a2c2c", padding:"0 1.25rem", fontFamily:"'Nunito',sans-serif",
        fontSize:"0.7rem", fontWeight:800, letterSpacing:"0.1em", textTransform:"uppercase",
        height:"100%", display:"flex", alignItems:"center", flexShrink:0 }}>Breaking</div>
      <div style={{ flex:1, overflow:"hidden", padding:"0 1.5rem" }}>
        <div key={idx} style={{ fontFamily:"'Source Serif 4',Georgia,serif", fontSize:"0.82rem",
          fontStyle:"italic", animation:"fadeUp 0.4s ease" }}>{items[idx]}</div>
      </div>
      <div style={{ padding:"0 1.25rem", fontSize:"0.72rem", color:"rgba(247,241,227,0.5)", flexShrink:0,
        fontFamily:"'Nunito',sans-serif" }}>
        {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
      </div>
    </div>
  )
}

/* ─── SKELETON ───────────────────────────────────────────────── */
function Skeleton({ h=280, radius=4 }) {
  return <div style={{ background:`linear-gradient(90deg,${T.cardLine} 0%,${T.paperDeep} 50%,${T.cardLine} 100%)`,
    borderRadius:radius, height:h, animation:"pulse 1.5s ease infinite", backgroundSize:"200% 100%" }} />
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function OurNews() {
  const { navigate }          = useRouter()
  const [articles, setArticles]       = useState([])
  const [categories, setCategories]   = useState(FALLBACK_CATEGORIES)
  const [topics, setTopics]           = useState(FALLBACK_TOPICS)
  const [activeCategory, setActiveCategory] = useState("All")
  const [search, setSearch]           = useState("")
  const [loading, setLoading]         = useState(true)
  const [page, setPage]               = useState(1)
  const [total, setTotal]             = useState(0)
  const [apiError, setApiError]       = useState(false)

  useEffect(() => {
    fetch(`${API_BASE}/news/meta`)
      .then(r => r.json())
      .then(d => {
        if (d.categories?.length) setCategories(["All", ...d.categories.map(c=>c.name)])
        if (d.topics?.length) setTopics(d.topics.map(t=>t.name))
      })
      .catch(() => {})
  }, [])

  const fetchArticles = useCallback(() => {
    setLoading(true)
    const catSlug = activeCategory === "All" ? "" : activeCategory.toLowerCase().replace(/\s+/g,"-")
    const params  = new URLSearchParams({
      ...(catSlug && { category: catSlug }),
      ...(search   && { search }),
      page, limit: 20,
    })
    fetch(`${API_BASE}/news?${params}`)
      .then(r => r.json())
      .then(d => {
        setArticles(d.articles || FALLBACK_ARTICLES)
        setTotal(d.total || FALLBACK_ARTICLES.length)
        setApiError(false)
      })
      .catch(() => {
        setArticles(FALLBACK_ARTICLES)
        setTotal(FALLBACK_ARTICLES.length)
        setApiError(true)
      })
      .finally(() => setLoading(false))
  }, [activeCategory, search, page])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  function goToArticle(article) {
    navigate("/news/" + article.slug)
  }

  const heroArticle = articles.find(a => a.size === "hero")
  const secondary   = articles.filter(a => a.size === "secondary").slice(0,2)
  const grid        = articles.filter(a => a.size === "medium" || a.size === "small")
  const paginated   = grid.slice(0, page * 6)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-thumb{background:${T.paperLine};border-radius:3px}
       @media(max-width:900px){
  .news-layout{grid-template-columns:1fr !important}
  .news-filter{padding:1rem 1rem !important; top:60px !important}
  .news-hero-header{padding:2.5rem 1.5rem 2rem !important}
  .secondary-grid{grid-template-columns:1fr !important}
  .news-sidebar{display:none !important}
}
@media(max-width:600px){
  .news-filter-pills{flex-wrap:nowrap !important; overflow-x:auto !important; padding-bottom:0.5rem !important}
  .news-filter-pills::-webkit-scrollbar{display:none}
}
      `}</style>

      <div style={{ paddingTop:72, background:T.paper, minHeight:"100vh" }}>
        <BreakingTicker />

        {/* Masthead / hero header */}
        <div className="news-hero-header" style={{ background:T.paper,
          padding:"3rem 6rem 2rem", position:"relative", borderBottom:`4px double ${T.ink}` }}>
          <div style={{ position:"relative", zIndex:1, maxWidth:1200, margin:"0 auto" }}>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between",
              borderTop:`3px solid ${T.ink}`, borderBottom:`1px solid ${T.ink}`,
              padding:"0.5rem 0", marginBottom:"1.5rem", flexWrap:"wrap", gap:"0.5rem" }}>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.72rem", fontWeight:800,
                letterSpacing:"0.16em", textTransform:"uppercase", color:T.ink }}>
                Common Psychology · Journal
              </span>
              <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.72rem", fontWeight:600,
                letterSpacing:"0.06em", color:T.inkFaint }}>
                {new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
              </span>
            </div>
            <h1 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(2.2rem,4.5vw,3.4rem)",
              fontWeight:400, color:T.ink, lineHeight:1.1, marginBottom:"0.75rem", textAlign:"center" }}>
              Our News &amp; Insights
            </h1>
            <p style={{ fontFamily:"'Source Serif 4',Georgia,serif", fontSize:"1.05rem", fontStyle:"italic",
              color:T.inkSoft, maxWidth:600, lineHeight:1.7, textAlign:"center", margin:"0 auto" }}>
              Evidence-based reporting on mental health, wellness research, and community stories.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="news-filter" style={{ background:T.paper, borderBottom:`1px solid ${T.ink}`,
          padding:"1rem 6rem", position:"sticky", top:72, zIndex:50 }}>
          <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center",
            justifyContent:"space-between", gap:"1.5rem", flexWrap:"wrap" }}>
            <div className="news-filter-pills" style={{ display:"flex", gap:"0.5rem", flexWrap:"wrap" }}>
              {categories.map(c=>(
                <CatPill key={c} label={c} active={activeCategory===c}
                  onClick={()=>{ setActiveCategory(c); setPage(1) }} />
              ))}
            </div>
            <div style={{ position:"relative", flexShrink:0 }}>
              <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:"0.9rem" }}>🔍</span>
              <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1) }}
                placeholder="Search articles…"
                style={{ padding:"0.55rem 1rem 0.55rem 2.2rem", borderRadius:2,
                  border:`1.5px solid ${T.ink}`, background:T.white,
                  fontFamily:"'Nunito',sans-serif", fontSize:"0.82rem", outline:"none",
                  width:220, color:T.ink }} />
            </div>
          </div>
        </div>

        {apiError && (
          <div style={{ background:T.paperDeep, borderBottom:`1px solid ${T.ink}`, padding:"0.5rem 2rem",
            textAlign:"center", fontSize:"0.78rem", color:T.inkSoft, fontFamily:"'Nunito',sans-serif" }}>
            ⚠ Using cached content — server unavailable.
          </div>
        )}

        {/* Main layout */}
        <div className="news-layout" style={{ maxWidth:1200, margin:"0 auto", padding:"2.5rem 2rem",
          display:"grid", gridTemplateColumns:"1fr 320px", gap:"2.5rem" }}>

          {/* LEFT */}
          <div>
            {loading ? (
              <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem" }}>
                <Skeleton h={420} /><div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" }}><Skeleton h={260}/><Skeleton h={260}/></div>
              </div>
            ) : (
              <>
                {/* HERO */}
                {heroArticle && (
                  <div onClick={()=>goToArticle(heroArticle)}
                    style={{ background:T.white, borderRadius:6, overflow:"hidden",
                      border:`1px solid ${T.ink}`, marginBottom:"1.5rem",
                      cursor:"pointer",
                      transition:"transform 0.22s, box-shadow 0.22s",
                      animation:"fadeUp 0.5s ease both" }}
                    onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 30px rgba(33,27,20,0.18)" }}
                    onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="none" }}>
                    <ArticleImage article={heroArticle} height={380} />
                    <div style={{ padding:"2rem 2.25rem 2.25rem" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"0.9rem" }}>
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.68rem", fontWeight:800,
                          letterSpacing:"0.12em", textTransform:"uppercase", color:T.blueMid }}>
                          {heroArticle.news_categories?.name}
                        </span>
                        <span style={{ width:4, height:4, borderRadius:"50%", background:T.cardLine, display:"inline-block" }} />
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.72rem", color:T.inkFaint }}>
                          {fmtDate(heroArticle.published_at)}
                        </span>
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.72rem", color:T.inkFaint }}>· {heroArticle.read_time}</span>
                      </div>
                      <h2 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.95rem",
                        fontWeight:400, color:T.ink, lineHeight:1.2, marginBottom:"1rem" }}>
                        {heroArticle.headline}
                      </h2>
                      <p style={{ fontFamily:"'Source Serif 4',Georgia,serif", fontSize:"0.98rem",
                        color:T.inkSoft, lineHeight:1.8, marginBottom:"1.5rem" }}>
                        {heroArticle.summary}
                      </p>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                        borderTop:`1px solid ${T.cardLine}`, paddingTop:"1rem" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:34, height:34, borderRadius:"50%", background:T.paperDeep,
                            display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem",
                            border:`1px solid ${T.ink}` }}>✍️</div>
                          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.82rem",
                            fontWeight:700, color:T.ink }}>{heroArticle.author}</span>
                        </div>
                        <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.8rem",
                          fontWeight:700, color:T.blueMid, textDecoration:"underline", textUnderlineOffset:3 }}>Read full article →</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* DIVIDER */}
                <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.25rem" }}>
                  <div style={{ flex:1, height:1, background:T.ink }} />
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.68rem", fontWeight:800,
                    letterSpacing:"0.14em", textTransform:"uppercase", color:T.inkFaint }}>Latest Stories</span>
                  <div style={{ flex:1, height:1, background:T.ink }} />
                </div>

                {/* SECONDARY 2-col */}
                {secondary.length > 0 && (
                  <div className="secondary-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr",
                    gap:"1.25rem", marginBottom:"1.25rem" }}>
                    {secondary.map((a,i)=>(
                      <div key={a.id} onClick={()=>goToArticle(a)}
                        style={{ background:T.white, borderRadius:6, overflow:"hidden",
                          border:`1px solid ${T.cardLine}`, cursor:"pointer",
                          transition:"transform 0.22s, box-shadow 0.22s",
                          animation:`fadeUp ${0.5+i*0.1}s ease both` }}
                        onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 10px 26px rgba(33,27,20,0.14)" }}
                        onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="none" }}>
                        <ArticleImage article={a} height={190} />
                        <div style={{ padding:"1.25rem 1.4rem 1.5rem" }}>
                          <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.62rem", fontWeight:800,
                            letterSpacing:"0.1em", textTransform:"uppercase", color:T.blueMid, marginBottom:6 }}>
                            {a.news_categories?.name}
                          </div>
                          <h3 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"1.12rem",
                            fontWeight:400, color:T.ink, lineHeight:1.32, marginBottom:"0.6rem" }}>
                            {a.headline}
                          </h3>
                          <p style={{ fontFamily:"'Source Serif 4',Georgia,serif", fontSize:"0.82rem",
                            color:T.inkFaint, lineHeight:1.65, marginBottom:"0.9rem" }}>
                            {a.summary?.slice(0,100)}…
                          </p>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.7rem", color:T.inkFaint }}>
                              {fmtDate(a.published_at)}
                            </span>
                            <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.7rem", color:T.inkFaint }}>
                              {a.read_time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* DIVIDER */}
                <div style={{ display:"flex", alignItems:"center", gap:"1rem", marginBottom:"1.25rem" }}>
                  <div style={{ flex:1, height:1, background:T.ink }} />
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.68rem", fontWeight:800,
                    letterSpacing:"0.14em", textTransform:"uppercase", color:T.inkFaint }}>More Articles</span>
                  <div style={{ flex:1, height:1, background:T.ink }} />
                </div>

                {/* COMPACT LIST */}
                <div style={{ display:"flex", flexDirection:"column", gap:"1px",
                  background:T.cardLine, border:`1px solid ${T.ink}`,
                  borderRadius:6, overflow:"hidden", marginBottom:"2rem" }}>
                  {paginated.map((a,i)=>(
                    <div key={a.id} onClick={()=>goToArticle(a)}
                      style={{ display:"grid", gridTemplateColumns:"120px 1fr",
                        background:T.white, cursor:"pointer", transition:"background 0.18s",
                        animation:`fadeUp ${0.3+i*0.06}s ease both` }}
                      onMouseEnter={e=>e.currentTarget.style.background=T.paperDeep}
                      onMouseLeave={e=>e.currentTarget.style.background=T.white}>
                      <ArticleImage article={a} height={90} style={{ borderRadius:0 }} />
                      <div style={{ padding:"0.9rem 1.25rem", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.6rem", fontWeight:800,
                            letterSpacing:"0.1em", textTransform:"uppercase", color:T.blueMid }}>
                            {a.news_categories?.name}
                          </span>
                          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.6rem", color:T.inkFaint }}>
                            {fmtDate(a.published_at)}
                          </span>
                        </div>
                        <h4 style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"0.98rem",
                          fontWeight:400, color:T.ink, lineHeight:1.35, marginBottom:"0.3rem" }}>
                          {a.headline}
                        </h4>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.68rem", color:T.inkFaint }}>{a.author}</span>
                          <span style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.68rem", color:T.cardLine }}>· {a.read_time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {paginated.length < grid.length && (
                  <div style={{ textAlign:"center", marginBottom:"2rem" }}>
                    <button onClick={()=>setPage(p=>p+1)}
                      style={{ padding:"0.8rem 2.5rem", borderRadius:2,
                        border:`2px solid ${T.ink}`, background:"transparent",
                        color:T.ink, fontFamily:"'Nunito',sans-serif",
                        fontSize:"0.88rem", fontWeight:700, cursor:"pointer", transition:"all 0.2s" }}
                      onMouseEnter={e=>{ e.currentTarget.style.background=T.ink; e.currentTarget.style.color=T.paper }}
                      onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color=T.ink }}>
                      Load More Articles
                    </button>
                  </div>
                )}

                {articles.length === 0 && !loading && (
                  <div style={{ textAlign:"center", padding:"4rem 2rem", color:T.inkFaint }}>
                    <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div>
                    <p style={{ fontFamily:"'Source Serif 4',Georgia,serif", fontSize:"1rem", fontStyle:"italic" }}>No articles found.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="news-sidebar" style={{ position:"sticky", top:130, height:"fit-content" }}>
            <NewsletterBox />
            {!loading && <TrendingSidebar articles={articles} onSelect={goToArticle} />}
            <div style={{ background:T.white, borderRadius:6, border:`1px solid ${T.cardLine}`, padding:"1.25rem" }}>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.7rem", fontWeight:800,
                letterSpacing:"0.12em", textTransform:"uppercase", color:T.inkFaint, marginBottom:"1rem",
                borderBottom:`2px solid ${T.ink}`, paddingBottom:"0.5rem" }}>
                Explore Topics
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                {topics.map(t=>(
                  <span key={t} onClick={()=>setSearch(t)}
                    style={{ fontFamily:"'Nunito',sans-serif", fontSize:"0.75rem", fontWeight:600,
                      padding:"4px 12px", borderRadius:2, background:T.paperDeep,
                      color:T.ink, border:`1px solid ${T.cardLine}`, cursor:"pointer",
                      transition:"all 0.18s" }}
                    onMouseEnter={e=>{ e.currentTarget.style.background=T.ink; e.currentTarget.style.color=T.paper }}
                    onMouseLeave={e=>{ e.currentTarget.style.background=T.paperDeep; e.currentTarget.style.color=T.ink }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}