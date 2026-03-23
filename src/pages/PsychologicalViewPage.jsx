// src/pages/PsychologicalViewPage.jsx
// Fully dynamic — fetches from /api/psych/all
// Falls back to static data if API is unreachable

import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function fetchPsychData() {
  const res = await fetch(`${API_BASE}/api/psych/all`)
  if (!res.ok) throw new Error('Failed')
  return res.json()
}

// ── FALLBACK DATA (identical to old static arrays) ────────────
const FALLBACK = {
  videos: [
    { id: '1', youtube_id: 'dQw4w9WgXcQ', title: 'Understanding Trauma: A Psychological Perspective',   description: 'How unresolved trauma shapes our daily behaviour, relationships, and worldview.',                                                                             duration: '18:42', views: '12K views'  },
    { id: '2', youtube_id: 'hY7m5jjJ9mM', title: 'Anxiety in Modern Nepal: Causes & Healing',           description: 'Exploring the cultural, social and biological roots of rising anxiety in Nepal.',                                                                        duration: '24:10', views: '8.4K views' },
    { id: '3', youtube_id: 'tPEE9ZwImy0', title: 'Breaking Stigma: Mental Health Conversations',         description: 'A frank discussion on why mental health stigma persists and how communities can dismantle it.',                                                            duration: '31:05', views: '20K views'  },
  ],
  analyses: [
    { id:'1', category:'Global Politics', icon:'🌍', color_var:'var(--blue-mist)',   title:'Why Populism Keeps Rising: A Social Psychology Lens',                  slug:'populism-social-psychology',    excerpt:'Social identity theory, in-group favoritism, and threat perception explain the surge of populist movements across democracies. When economic anxiety activates tribal psychology, charismatic leaders offering simple narratives gain outsized power.',        concepts:['Social Identity Theory','Scapegoating','Fear Appeals','Cognitive Simplification'], read_time:'6 min', published_at:'2025-06-01' },
    { id:'2', category:'Social Media',    icon:'📱', color_var:'var(--sky-light)',   title:'Doom-Scrolling and the Negativity Bias of the Human Brain',            slug:'doom-scrolling-negativity-bias',excerpt:'Our brains evolved to prioritize threat detection. Social media algorithms exploit negativity bias, intermittent reinforcement, and FOMO to create compulsive usage patterns that mirror behavioral addiction.',                                concepts:['Negativity Bias','Intermittent Reinforcement','Variable Reward Schedules','FOMO'],  read_time:'5 min', published_at:'2025-05-01' },
    { id:'3', category:'Climate & Society',icon:'🌱',color_var:'var(--green-mist)',  title:'Climate Grief and Eco-Anxiety: The New Existential Crisis',            slug:'climate-grief-eco-anxiety',     excerpt:"Climate psychology identifies a spectrum of responses — from eco-anxiety to ecological grief. Solastalgia (distress caused by environmental change to one's home) is emerging as a new clinical concern globally.",                                         concepts:['Solastalgia','Existential Anxiety','Denial as Defense','Ecological Grief'],          read_time:'7 min', published_at:'2025-04-01' },
    { id:'4', category:'Post-Pandemic',   icon:'😷', color_var:'var(--earth-cream)', title:'Collective Trauma: How COVID-19 Rewired Social Psychology',            slug:'covid-collective-trauma',       excerpt:'Collective trauma operates differently from individual PTSD. COVID exposed fundamental tensions between individualism and collectivism, between scientific authority and epistemic mistrust — reshaping social contracts globally.',                           concepts:['Collective Trauma','Moral Injury','Trust in Institutions','Intergenerational Trauma'],read_time:'8 min', published_at:'2025-03-01' },
    { id:'5', category:'Nepal',           icon:'🏔', color_var:'var(--blue-mist)',   title:'Earthquake Trauma and Resilience: Lessons from Gorkha',               slug:'gorkha-earthquake-trauma',      excerpt:'A decade after the 2015 earthquake, Nepal offers a unique study in post-disaster collective recovery, the role of cultural rituals in grief processing, and how community bonding moderates PTSD outcomes.',                                               concepts:['Post-Traumatic Growth','Cultural Healing','Community Resilience','Survivor Guilt'],  read_time:'6 min', published_at:'2025-02-01' },
    { id:'6', category:'Conflict & War',  icon:'⚖️', color_var:'var(--blue-mist)',   title:"Moral Disengagement: How Ordinary People Commit Extraordinary Harm",   slug:'moral-disengagement-conflict',  excerpt:"Bandura's moral disengagement theory explains how individuals distance themselves from the human consequences of their actions — through dehumanization, diffusion of responsibility, and euphemistic labeling — in war and beyond.",                     concepts:['Moral Disengagement','Dehumanization','Obedience to Authority','Bystander Effect'],  read_time:'9 min', published_at:'2025-01-01' },
  ],
  concepts: [
    { id:'1', term:'Cognitive Dissonance',          definition:'The mental discomfort experienced when holding two contradictory beliefs simultaneously — and the unconscious drive to resolve it, often by distorting reality rather than changing behavior.' },
    { id:'2', term:'Fundamental Attribution Error', definition:"The tendency to overestimate personal causes and underestimate situational factors when explaining others' behavior — the root of much social judgment and victim-blaming." },
    { id:'3', term:'Groupthink',                    definition:'The deterioration of rational decision-making within a highly cohesive group, driven by conformity pressure and collective rationalization of poor choices.' },
    { id:'4', term:'Learned Helplessness',          definition:'A state in which an organism repeatedly subjected to uncontrollable adversity stops attempting to escape — applicable to systemic oppression, chronic poverty, and institutional barriers.' },
    { id:'5', term:'Confirmation Bias',             definition:"The tendency to search for, interpret, and recall information that confirms one's existing beliefs — the engine behind echo chambers, misinformation spread, and polarization." },
    { id:'6', term:'Diffusion of Responsibility',   definition:'The phenomenon where individuals are less likely to take action when others are present. The larger the group, the less personal responsibility each member feels.' },
  ],
}

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

// ── SHIMMER SKELETON ─────────────────────────────────────────
function Sk({ w = '100%', h = 14, r = 6 }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: 'rgba(255,255,255,0.08)', animation: 'shimmer 1.4s infinite', backgroundSize: '200% 100%' }} />
}

// ══════════════════════════════════════════════════════════════
// VIDEO SLIDER  (100% same design as original)
// ══════════════════════════════════════════════════════════════
function VideoSlider({ videos, loading }) {
  const [current, setCurrent] = useState(0)
  const [hovered, setHovered] = useState(null)
  const items = loading ? [{id:'s1'},{id:'s2'},{id:'s3'}] : videos
  const total = items.length

  return (
    <div style={{ background:'linear-gradient(160deg,#0a1628 0%,#0f2744 60%,#0a1e1a 100%)', padding:'4rem 2rem', position:'relative', overflow:'hidden' }}>

      <div style={{ textAlign:'center', marginBottom:'2.5rem', position:'relative', zIndex:1 }}>
        <span className="section-tag" style={{ color:'rgba(56,189,248,0.7)' }}>On YouTube</span>
        <h2 className="section-title" style={{ color:'white', marginBottom:'0.5rem' }}>
          Watch Our <em style={{ color:'#38BDF8' }}>Video Series</em>
        </h2>
        <p style={{ fontFamily:'var(--font-body)', fontSize:'0.92rem', color:'rgba(255,255,255,0.45)', maxWidth:480, margin:'0 auto', lineHeight:1.8 }}>
          Deep-dive conversations and educational content on mental health, psychology and society.
        </p>
      </div>

      <div style={{ maxWidth:860, margin:'0 auto', position:'relative', zIndex:1 }}>
        <div className="video-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.1rem', alignItems:'start' }}>
          {items.map((video, i) => {
            const isCenter = i === current
            const isHov    = hovered === i
            if (loading) return (
              <div key={video.id} style={{ borderRadius:14, overflow:'hidden', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', opacity:i===1?1:0.6, transform:i===1?'scale(1.04)':'scale(0.96)' }}>
                <div style={{ aspectRatio:'16/9', background:'rgba(255,255,255,0.06)' }} />
                <div style={{ padding:'0.9rem', display:'flex', flexDirection:'column', gap:8 }}>
                  <Sk w="80%" h={13} /><Sk w="55%" h={10} />
                </div>
              </div>
            )
            return (
              <div key={video.id}
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                onClick={() => isCenter ? window.open(`https://www.youtube.com/watch?v=${video.youtube_id}`,'_blank') : setCurrent(i)}
                style={{ borderRadius:14, overflow:'hidden', border:isCenter?'2px solid rgba(56,189,248,0.6)':'1px solid rgba(255,255,255,0.08)', background:isCenter?'rgba(56,189,248,0.07)':'rgba(255,255,255,0.03)', transform:isCenter?'scale(1.04)':'scale(0.96)', opacity:isCenter?1:0.6, transition:'all 0.3s ease', cursor:'pointer', boxShadow:isCenter?'0 20px 48px rgba(56,189,248,0.18)':'none' }}>
                <div style={{ position:'relative', aspectRatio:'16/9', background:'#0a1628', overflow:'hidden' }}>
                  <img src={`https://img.youtube.com/vi/${video.youtube_id}/hqdefault.jpg`} alt={video.title}
                    style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.4s ease', transform:isHov&&isCenter?'scale(1.05)':'scale(1)' }} />
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(10,22,40,0.72) 0%,transparent 55%)' }} />
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ width:isCenter?52:38, height:isCenter?52:38, borderRadius:'50%', background:isCenter?'rgba(255,255,255,0.95)':'rgba(255,255,255,0.45)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.25s', transform:isHov&&isCenter?'scale(1.1)':'scale(1)', boxShadow:isCenter?'0 4px 20px rgba(0,0,0,0.4)':'none' }}>
                      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M5 3.5L13 8L5 12.5V3.5Z" fill={isCenter?'#0EA5E9':'#aaa'} stroke={isCenter?'#0EA5E9':'#aaa'} strokeWidth="0.5" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                  <div style={{ position:'absolute', bottom:8, right:8, background:'rgba(0,0,0,0.78)', borderRadius:4, padding:'2px 6px', fontSize:'0.68rem', color:'white', fontWeight:600 }}>{video.duration}</div>
                  {isCenter && <div style={{ position:'absolute', top:8, left:8, background:'#FF0000', borderRadius:4, padding:'2px 7px', fontSize:'0.62rem', color:'white', fontWeight:800, letterSpacing:'0.03em' }}>▶ YouTube</div>}
                </div>
                <div style={{ padding:'0.9rem' }}>
                  <h4 style={{ fontFamily:'var(--font-display)', fontSize:'0.85rem', color:isCenter?'white':'rgba(255,255,255,0.55)', lineHeight:1.35, marginBottom:'0.4rem' }}>{video.title}</h4>
                  {isCenter && <p style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color:'rgba(255,255,255,0.45)', lineHeight:1.6, marginBottom:'0.5rem' }}>{video.description}</p>}
                  <div style={{ fontSize:'0.68rem', color:isCenter?'rgba(56,189,248,0.75)':'rgba(255,255,255,0.28)' }}>{video.views}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1.25rem', marginTop:'2rem' }}>
          <button onClick={() => setCurrent(c=>(c-1+total)%total)} style={{ width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.14)',color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(56,189,248,0.2)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          {Array.from({length:total}).map((_,i)=>(
            <button key={i} onClick={()=>setCurrent(i)} style={{ width:i===current?24:7,height:7,borderRadius:10,background:i===current?'#38BDF8':'rgba(255,255,255,0.22)',border:'none',cursor:'pointer',padding:0,transition:'all 0.28s ease' }} />
          ))}
          <button onClick={() => setCurrent(c=>(c+1)%total)} style={{ width:40,height:40,borderRadius:'50%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.14)',color:'white',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(56,189,248,0.2)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>

        <div style={{ textAlign:'center', marginTop:'1.75rem' }}>
          <button onClick={()=>window.open('https://www.youtube.com/@PujaSamargi','_blank')}
            style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',padding:'0.65rem 1.6rem',background:'#FF0000',border:'none',borderRadius:100,cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'0.85rem',fontWeight:700,color:'white',transition:'opacity 0.2s,transform 0.2s',boxShadow:'0 4px 20px rgba(255,0,0,0.3)' }}
            onMouseEnter={e=>{e.currentTarget.style.opacity='0.88';e.currentTarget.style.transform='scale(1.03)'}}
            onMouseLeave={e=>{e.currentTarget.style.opacity='1';e.currentTarget.style.transform='scale(1)'}}>
            <svg width="18" height="13" viewBox="0 0 18 13" fill="white"><path d="M17.6 2S17.4.6 16.8 0C16-.1 15-.1 14.5 0 12.1.1 9 .1 9 .1S5.9.1 3.5 0C3-.1 2-.1 1.2 2 .6 3.4.6 5 .6 5S.6 6.6 1.2 8c.8 1.8 1.8 1.9 2.3 1.9C5.9 10.1 9 10 9 10s3.1 0 5.5-.1c.5-.1 1.5-.1 2.3-1.9.6-1.4.6-3 .6-3s0-1.6-.8-3zM7.1 7V2.5L12 5 7.1 7z"/></svg>
            Visit Our YouTube Channel
          </button>
        </div>
      </div>

      <div style={{ position:'absolute',left:-80,bottom:-80,width:300,height:300,borderRadius:'50%',background:'rgba(56,189,248,0.04)',pointerEvents:'none' }} />
      <div style={{ position:'absolute',right:-60,top:40,width:220,height:220,borderRadius:'50%',background:'rgba(56,189,248,0.03)',pointerEvents:'none' }} />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// ANALYSES GRID
// ══════════════════════════════════════════════════════════════
function AnalysesGrid({ analyses, loading, navigate }) {
  const items = loading ? Array.from({length:6}).map((_,i)=>({id:`s${i}`})) : analyses
  return (
    <div className="section" style={{ background:'var(--off-white)', paddingTop:'3rem' }}>
      <div className="section-header">
        <div>
          <span className="section-tag">Analyses</span>
          <h2 className="section-title">World Events, <em>Decoded</em></h2>
        </div>
      </div>
      <div className="analyses-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem' }}>
        {items.map((a, i) => {
          if (loading) return (
            <div key={a.id} style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--blue-pale)' }}>
              <div style={{ height:80, background:'#e5e7eb' }} />
              <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ background:'#e5e7eb', height:16, borderRadius:6, width:'85%' }} />
                <div style={{ background:'#e5e7eb', height:11, borderRadius:6 }} />
                <div style={{ background:'#e5e7eb', height:11, borderRadius:6, width:'70%' }} />
              </div>
            </div>
          )
          return (
            <div key={a.id}
              style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--blue-pale)', boxShadow:'var(--shadow-soft)', cursor:'pointer', transition:'all 0.25s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow='var(--shadow-mid)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='var(--shadow-soft)'}}
              onClick={() => navigate('/psychological-view/' + a.slug)}
            >
              <div style={{ background:a.color_var, padding:'1.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <span style={{ fontSize:'2rem' }}>{a.icon}</span>
                <div>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--blue-mid)' }}>{a.category}</div>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:'var(--text-light)' }}>{fmtDate(a.published_at)} · {a.read_time} read</div>
                </div>
              </div>
              <div style={{ padding:'1.25rem' }}>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--blue-deep)', marginBottom:'0.6rem', lineHeight:1.35 }}>{a.title}</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'var(--text-light)', lineHeight:1.65, marginBottom:'0.75rem' }}>{a.excerpt}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {(a.concepts||[]).map((c,j)=>(
                    <span key={j} className="tag" style={{ fontSize:'0.65rem' }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// CONCEPTS GLOSSARY
// ══════════════════════════════════════════════════════════════
function ConceptsGlossary({ concepts, loading }) {
  const items = loading ? Array.from({length:4}).map((_,i)=>({id:`s${i}`})) : concepts
  return (
    <div className="section" style={{ background:'var(--green-deep)', color:'white' }}>
      <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
        <span className="section-tag" style={{ color:'var(--green-pale)' }}>Psychology 101</span>
        <h2 className="section-title" style={{ color:'white' }}>Key Concepts to <em>Understand the World</em></h2>
      </div>
      <div className="concepts-grid" style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1.25rem' }}>
        {items.map((c, i) => {
          if (loading) return (
            <div key={c.id} style={{ background:'rgba(255,255,255,0.07)', borderRadius:'var(--radius-md)', padding:'1.5rem', border:'1px solid rgba(255,255,255,0.12)', display:'flex', flexDirection:'column', gap:10 }}>
              <Sk w="55%" h={18} /><Sk h={12} /><Sk w="80%" h={12} />
            </div>
          )
          return (
            <div key={c.id}
              style={{ background:'rgba(255,255,255,0.07)', borderRadius:'var(--radius-md)', padding:'1.5rem', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', transition:'background 0.2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.12)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.07)'}
            >
              <h4 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'#38BDF8', marginBottom:'0.5rem' }}>{c.term}</h4>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:'rgba(255,255,255,0.65)', lineHeight:1.7, margin:0 }}>{c.definition}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function PsychologicalViewPage() {
  const { navigate }        = useRouter()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchPsychData()
      .then(d  => { setData(d); setApiError(false) })
      .catch(() => { setData(FALLBACK); setApiError(true) })
      .finally(() => setLoading(false))
  }, [])

  const videos   = data?.videos   || FALLBACK.videos
  const analyses = data?.analyses || FALLBACK.analyses
  const concepts = data?.concepts || FALLBACK.concepts

  return (
    <div className="page-wrapper">
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @media(max-width:768px){
          .video-grid    { grid-template-columns:1fr !important }
          .analyses-grid { grid-template-columns:1fr !important }
          .concepts-grid { grid-template-columns:1fr !important }
          .psych-hero    { padding:3rem 1.5rem 2rem !important }
        }
        @media(max-width:1024px){
          .analyses-grid { grid-template-columns:repeat(2,1fr) !important }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="psych-hero" style={{ background:'linear-gradient(145deg,#0c1e2b 0%,#1a3a4a 50%,#1a2e1a 100%)', padding:'5rem 6rem 3rem', position:'relative', overflow:'hidden', color:'white' }}>
        <div style={{ position:'relative', zIndex:1 }}>
          <span className="section-tag" style={{ color:'rgba(176,212,232,0.7)' }}>Psychological View</span>
          <h1 className="section-title" style={{ color:'white', fontSize:'clamp(2rem,4vw,3rem)', marginBottom:'1rem' }}>
            The World, Seen Through <em style={{ color:'#38BDF8' }}>Psychology</em>
          </h1>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'1.05rem', color:'rgba(255,255,255,0.55)', maxWidth:580, lineHeight:1.8, marginBottom:'2rem' }}>
            Events do not happen in a vacuum. Behind every social crisis, political upheaval, and cultural shift lie deep psychological forces — fear, identity, trauma, and power. This is our analysis.
          </p>
          <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={()=>navigate('/research')}>Our Research →</button>
            <button className="btn btn-outline" style={{ borderColor:'rgba(255,255,255,0.3)', color:'rgba(255,255,255,0.8)' }} onClick={()=>navigate('/blog')}>Blog & Articles</button>
          </div>
        </div>
        {[280,200,120].map((r,i)=>(
          <div key={i} style={{ position:'absolute', right:-r/2, top:'50%', transform:'translateY(-50%)', width:r*2, height:r*2, borderRadius:'50%', border:`1px solid rgba(0,191,255,${0.06+i*0.02})`, pointerEvents:'none' }} />
        ))}
      </div>

      {/* API error banner */}
      {apiError && !loading && (
        <div style={{ background:'#fffbeb', borderBottom:'1px solid #fde68a', padding:'0.6rem 2rem', textAlign:'center', fontSize:'0.78rem', color:'#92400e' }}>
          ⚠ Could not reach the server — showing cached content. Check your API connection.
        </div>
      )}

      <VideoSlider   videos={videos}     loading={loading} />
      <AnalysesGrid  analyses={analyses} loading={loading} navigate={navigate} />
      <ConceptsGlossary concepts={concepts} loading={loading} />
    </div>
  )
}