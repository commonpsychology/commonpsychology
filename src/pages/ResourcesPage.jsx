import { useState } from 'react'
import { useRouter } from '../context/RouterContext'

const allResources = [
  { type:'Worksheet', emoji:'📄', title:'Anxiety Management Worksheet', desc:'Practical CBT exercises to manage anxious thoughts and reframe negative patterns.', downloads:'1.2k', free:true,  cat:'Anxiety',       file:'/resources/anxiety-worksheet.pdf' },
  { type:'Audio',     emoji:'🎧', title:'Guided Meditation — 10 min',    desc:'Calm your mind with this Nepali-language guided body scan meditation session.',  downloads:'890',  free:true,  cat:'Mindfulness',   file:'/resources/guided-meditation.mp3' },
  { type:'eBook',     emoji:'📖', title:'Understanding Depression',       desc:'A compassionate guide to understanding, accepting and navigating depression.',   downloads:'650',  free:false, cat:'Depression',    file:null },
  { type:'Tool',      emoji:'🧩', title:'Mood Tracker Template',          desc:'Daily mood logging template for consistent mental health tracking.',             downloads:'2.1k', free:true,  cat:'Wellness',      file:'/resources/mood-tracker.pdf' },
  { type:'Worksheet', emoji:'📝', title:'Thought Record Sheet',           desc:'A CBT tool to identify and challenge unhelpful thoughts and cognitive distortions.', downloads:'940', free:true, cat:'Anxiety',      file:'/resources/thought-record.pdf' },
  { type:'Audio',     emoji:'🎵', title:'Sleep Relaxation Audio',         desc:'A 20-minute progressive muscle relaxation audio designed for better sleep.',     downloads:'760',  free:true,  cat:'Sleep',         file:'/resources/sleep-relaxation.mp3' },
  { type:'eBook',     emoji:'📚', title:'Mindful Relationships',          desc:'Practical guidance for building healthier, more present relationships.',          downloads:'430',  free:false, cat:'Relationships', file:null },
  { type:'Tool',      emoji:'📊', title:'Stress Audit Worksheet',         desc:'Identify your top stress triggers and design a personalised coping strategy.',   downloads:'1.4k', free:true,  cat:'Stress',        file:'/resources/stress-audit.pdf' },
]

const cats = ['All','Anxiety','Depression','Mindfulness','Wellness','Sleep','Stress','Relationships']

const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', white:'#ffffff', mint:'#e8f3ee',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8',
}
const btnGrad = `linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`

/* ── Premium upsell modal ── */
function PremiumModal({ resource, onClose, onNavigate }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={onClose}>
      <div style={{ background:C.white, borderRadius:22, padding:'2.5rem', maxWidth:440, width:'100%', boxShadow:`0 20px 60px rgba(0,0,0,0.25)`, position:'relative' }}
        onClick={e=>e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:C.textLight }}>✕</button>
        <div style={{ width:60, height:60, borderRadius:'50%', background:btnGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 1.25rem', boxShadow:`0 6px 20px rgba(0,191,255,0.35)` }}>
          🔒
        </div>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:C.textDark, textAlign:'center', marginBottom:'0.6rem' }}>Premium Resource</h3>
        <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textMid, lineHeight:1.72, textAlign:'center', marginBottom:'1.5rem' }}>
          <strong style={{ color:C.textDark }}>{resource?.title}</strong> is part of our premium library. Unlock all premium resources by enrolling in a course or purchasing from the Store.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
          <button onClick={()=>onNavigate('/courses')} style={{ padding:'0.82rem', borderRadius:12, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', boxShadow:`0 4px 16px rgba(0,191,255,0.3)` }}>
            🎓 Browse Courses (includes access)
          </button>
          <button onClick={()=>onNavigate('/store')} style={{ padding:'0.82rem', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}>
            🛍️ Buy from Store
          </button>
          <button onClick={onClose} style={{ padding:'0.7rem', borderRadius:12, border:'none', background:'none', color:C.textLight, fontFamily:'var(--font-body)', fontSize:'0.82rem', cursor:'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Download toast ── */
function DownloadToast({ resource, onClose }) {
  return (
    <div style={{ position:'fixed', bottom:32, right:32, zIndex:1000, background:C.white, borderRadius:16, padding:'1rem 1.25rem', boxShadow:`0 8px 32px rgba(0,0,0,0.15)`, border:`1.5px solid ${C.borderFaint}`, display:'flex', alignItems:'center', gap:'0.85rem', maxWidth:320 }}>
      <div style={{ width:40, height:40, borderRadius:'50%', background:btnGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>⬇</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight:700, color:C.textDark, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{resource?.title}</div>
        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', color:'#22c55e', fontWeight:600 }}>✓ Download started</div>
      </div>
      <button onClick={onClose} style={{ background:'none', border:'none', color:C.textLight, cursor:'pointer', fontSize:'1rem', flexShrink:0 }}>✕</button>
    </div>
  )
}

export default function ResourcesPage() {
  const { navigate } = useRouter()
  const [active, setActive]         = useState('All')
  const [premiumRes, setPremiumRes] = useState(null)
  const [toast, setToast]           = useState(null)
  const [downloaded, setDownloaded] = useState([])

  const filtered = active === 'All' ? allResources : allResources.filter(r => r.cat === active)

  function handleBtn(r) {
    if (r.free) {
      if (r.file) {
        const a = document.createElement('a')
        a.href = r.file
        a.download = r.file.split('/').pop()
        a.click()
      }
      setDownloaded(prev => [...prev, r.title])
      setToast(r)
      setTimeout(() => setToast(null), 3500)
    } else {
      setPremiumRes(r)
    }
  }

  return (
    <div className="page-wrapper">
      {/* ── Responsive grid — same pattern as WorkshopsPage ── */}
      <style>{`
        .resources-responsive-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 1100px) {
          .resources-responsive-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .resources-responsive-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .resources-responsive-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-hero" style={{ background:'var(--blue-mist)' }}>
        <span className="section-tag">Library</span>
        <h1 className="section-title">Free <em>Wellness</em> Resources</h1>
        <p className="section-desc">Worksheets, guided audios, eBooks, and trackers — all curated by our clinical team.</p>
      </div>

      <div className="section" style={{ background:'var(--off-white)' }}>
        {/* Category filter */}
        <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', marginBottom:'2.5rem' }}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setActive(c)}
              style={{ padding:'0.45rem 1.1rem', borderRadius:'100px', border:`2px solid ${active===c?'var(--blue-mid)':'var(--blue-pale)'}`, background:active===c?'var(--blue-mid)':'white', color:active===c?'white':'var(--blue-mid)', fontSize:'0.82rem', fontWeight:500, cursor:'pointer', transition:'all 0.2s' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Responsive resource grid */}
        <div className="resources-responsive-grid">
          {filtered.map((r,i) => {
            const isDone = downloaded.includes(r.title)
            return (
              <div key={i} className="resource-card"
                style={{
                  cursor:'pointer',
                  border:`1.5px solid ${isDone?C.skyBright:'transparent'}`,
                  background:isDone?C.skyFainter:undefined,
                  transition:'all 0.25s',
                  display:'flex',
                  flexDirection:'column',
                }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <span className="resource-type">{r.type}</span>
                <div className="resource-emoji">{r.emoji}</div>
                <h4 style={{ margin:'0 0 0.4rem', fontFamily:'var(--font-display)', fontSize:'0.95rem', color:'var(--blue-deep)' }}>{r.title}</h4>
                <p style={{ margin:'0 0 auto', fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'var(--text-light)', lineHeight:1.55, paddingBottom:'0.75rem' }}>{r.desc}</p>
                <div className="resource-meta">
                  <span>{r.downloads} downloads</span>
                  <span className={r.free?'resource-free':''}>{r.free?'FREE':'Premium'}</span>
                </div>
                <button
                  className={r.free ? 'btn btn-outline' : 'btn btn-primary'}
                  style={{ width:'100%', marginTop:'1rem', justifyContent:'center', fontSize:'0.8rem', background: !r.free ? btnGrad : undefined, border: !r.free ? 'none' : undefined, color: !r.free ? 'white' : undefined }}
                  onClick={() => handleBtn(r)}
                >
                  {isDone && r.free ? '✓ Downloaded' : r.free ? '⬇ Download Free' : '🔒 Get Premium'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {premiumRes && (
        <PremiumModal
          resource={premiumRes}
          onClose={() => setPremiumRes(null)}
          onNavigate={p => { setPremiumRes(null); navigate(p) }}
        />
      )}

      {toast && <DownloadToast resource={toast} onClose={() => setToast(null)} />}
    </div>
  )
}