// src/pages/ResourcesPage.jsx
import { useState } from 'react'
import { useRouter } from '../context/RouterContext'
import { useFetch, apiFetch } from '../hooks/useFetch'

const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', white:'#ffffff', mint:'#e8f3ee',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8',
}
const btnGrad = `linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`

function PremiumModal({ resource, onClose, onNavigate }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={onClose}>
      <div style={{ background:C.white, borderRadius:22, padding:'2.5rem', maxWidth:440, width:'100%',
        boxShadow:'0 20px 60px rgba(0,0,0,0.25)', position:'relative' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'none',
          border:'none', fontSize:'1.2rem', cursor:'pointer', color:C.textLight }}>✕</button>
        <div style={{ width:60, height:60, borderRadius:'50%', background:btnGrad, display:'flex',
          alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 1.25rem',
          boxShadow:'0 6px 20px rgba(0,191,255,0.35)' }}>🔒</div>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:C.textDark,
          textAlign:'center', marginBottom:'0.6rem' }}>Premium Resource</h3>
        <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textMid, lineHeight:1.72,
          textAlign:'center', marginBottom:'1.5rem' }}>
          <strong style={{ color:C.textDark }}>{resource?.title}</strong> is part of our premium
          library. Unlock by enrolling in a course or purchasing from the Store.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
          <button onClick={() => onNavigate('/courses')} style={{ padding:'0.82rem', borderRadius:12,
            border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)',
            fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
            boxShadow:'0 4px 16px rgba(0,191,255,0.3)' }}>
            🎓 Browse Courses (includes access)
          </button>
          <button onClick={() => onNavigate('/store')} style={{ padding:'0.82rem', borderRadius:12,
            border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid,
            fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}>
            🛍️ Buy from Store
          </button>
          <button onClick={onClose} style={{ padding:'0.7rem', borderRadius:12, border:'none',
            background:'none', color:C.textLight, fontFamily:'var(--font-body)', fontSize:'0.82rem',
            cursor:'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function DownloadToast({ resource, onClose }) {
  return (
    <div style={{ position:'fixed', bottom:32, right:32, zIndex:1000, background:C.white,
      borderRadius:16, padding:'1rem 1.25rem', boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
      border:`1.5px solid ${C.borderFaint}`, display:'flex', alignItems:'center', gap:'0.85rem',
      maxWidth:320, animation:'slideUp 0.3s ease' }}>
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }`}</style>
      <div style={{ width:40, height:40, borderRadius:'50%', background:btnGrad, display:'flex',
        alignItems:'center', justifyContent:'center', fontSize:'1.2rem', flexShrink:0 }}>⬇</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight:700,
          color:C.textDark, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {resource?.title}
        </div>
        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', color:'#22c55e', fontWeight:600 }}>
          ✓ Download started
        </div>
      </div>
      <button onClick={onClose} style={{ background:'none', border:'none', color:C.textLight,
        cursor:'pointer', fontSize:'1rem', flexShrink:0 }}>✕</button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.borderFaint}`,
      padding:'1.5rem', display:'flex', flexDirection:'column', gap:8, minHeight:220 }}>
      {[35,0,75,90,60].map((w,i) => (
        <div key={i} style={{ height: i===1?48:i===0?12:11, width:i===1?'48px':w+'%',
          borderRadius: i===1?8:6, background: i%2===0?C.skyFaint:C.borderFaint,
          marginBottom: i===1?'0.5rem':0 }} />
      ))}
    </div>
  )
}

export default function ResourcesPage() {
  const { navigate } = useRouter()
  const [active, setActive]         = useState('All')
  const [premiumRes, setPremiumRes] = useState(null)
  const [toast, setToast]           = useState(null)
  const [downloaded, setDownloaded] = useState([])
  const [downloading, setDownloading] = useState([])

  const { data: categories } = useFetch('/resources/categories', {}, [])
  const { data: allResources, loading, error } = useFetch('/resources', {}, [])

  const cats     = categories?.length ? categories : ['All']
  const filtered = (allResources || []).filter(r => active === 'All' || r.category === active)

  async function handleDownload(r) {
  if (downloading.includes(r.id)) return
  setDownloading(prev => [...prev, r.id])
  try {
    const a = document.createElement('a')
    a.href = `http://localhost:5000/api/resources/${r.id}/download`
    // Use correct extension based on type
    const ext = r.type === 'Audio' ? '.mp3' 
              : r.type === 'Video' ? '.mp4' 
              : '.pdf'
    a.download = r.title + ext
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setDownloaded(prev => [...prev, r.id])
    setToast(r)
    setTimeout(() => setToast(null), 3500)
  } catch (err) {
    console.error('Download failed:', err)
    alert(`Could not download "${r.title}". Please try again.`)
  } finally {
    setDownloading(prev => prev.filter(id => id !== r.id))
  }
}
  function handleBtn(r) {
    if (r.free) handleDownload(r)
    else setPremiumRes(r)
  }

  function btnLabel(r) {
    if (!r.free) return '🔒 Get Premium'
    if (downloading.includes(r.id)) return '⏳ Preparing…'
    if (downloaded.includes(r.id)) return '✓ Downloaded'
    return '⬇ Download Free'
  }

  return (
    <div className="page-wrapper">
      <style>{`
        .resources-responsive-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 1100px) { .resources-responsive-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .resources-responsive-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px)  { .resources-responsive-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="page-hero" style={{ background:'var(--blue-mist)' }}>
        <span className="section-tag">Library</span>
        <h1 className="section-title">Free <em>Wellness</em> Resources</h1>
        <p className="section-desc">
          Worksheets, guides, eBooks, and workbooks — all curated and written by our clinical team.
          Free resources are yours to download instantly as PDF.
        </p>
      </div>

      <div className="section" style={{ background:'var(--off-white)' }}>
        {/* Category filter */}
        <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap', marginBottom:'2.5rem' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setActive(c)} style={{
              padding:'0.45rem 1.1rem', borderRadius:'100px',
              border:`2px solid ${active===c?'var(--blue-mid)':'var(--blue-pale)'}`,
              background: active===c?'var(--blue-mid)':'white',
              color: active===c?'white':'var(--blue-mid)',
              fontSize:'0.82rem', fontWeight:500, cursor:'pointer', transition:'all 0.2s',
            }}>{c}</button>
          ))}
        </div>

        {error && (
          <div style={{ padding:'1rem', color:'#c62828', fontFamily:'var(--font-body)',
            background:'#ffebee', borderRadius:8, marginBottom:'1.5rem' }}>
            Failed to load resources: {error}
          </div>
        )}

        <div className="resources-responsive-grid">
          {loading
            ? [1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)
            : filtered.map(r => {
                const isDone = downloaded.includes(r.id)
                const isLoading = downloading.includes(r.id)
                return (
                  <div key={r.id} className="resource-card"
                    style={{
                      border:`1.5px solid ${isDone?C.skyBright:'transparent'}`,
                      background: isDone?C.skyFainter:undefined,
                      transition:'all 0.25s', display:'flex', flexDirection:'column',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
                    <span className="resource-type">{r.type}</span>
                    <div className="resource-emoji">{r.emoji}</div>
                    <h4 style={{ margin:'0 0 0.4rem', fontFamily:'var(--font-display)',
                      fontSize:'0.95rem', color:'var(--blue-deep)' }}>{r.title}</h4>
                    <p style={{ margin:'0 0 auto', fontFamily:'var(--font-body)', fontSize:'0.8rem',
                      color:'var(--text-light)', lineHeight:1.55, paddingBottom:'0.75rem' }}>
                      {r.description}
                    </p>
                    <div className="resource-meta">
                      <span>{(r.downloads || 0).toLocaleString()} downloads</span>
                      <span className={r.free?'resource-free':''}>{r.free?'FREE':'Premium'}</span>
                    </div>
                    <button
                      className={r.free ? 'btn btn-outline' : 'btn btn-primary'}
                      disabled={isLoading}
                      style={{
                        width:'100%', marginTop:'1rem', justifyContent:'center',
                        fontSize:'0.8rem',
                        background: !r.free ? btnGrad : isDone ? C.skyFaint : undefined,
                        border: !r.free ? 'none' : isDone ? `1.5px solid ${C.skyBright}` : undefined,
                        color: !r.free ? 'white' : isDone ? C.skyDeep : undefined,
                        opacity: isLoading ? 0.65 : 1,
                        cursor: isLoading ? 'wait' : 'pointer',
                      }}
                      onClick={() => handleBtn(r)}
                    >
                      {btnLabel(r)}
                    </button>
                  </div>
                )
              })
          }
        </div>

        {/* Stats bar */}
        {!loading && !error && (
          <div style={{ marginTop:'2.5rem', padding:'1.25rem 1.5rem', borderRadius:14,
            background:`linear-gradient(135deg, ${C.skyFainter} 0%, ${C.mint} 100%)`,
            border:`1px solid ${C.borderFaint}`, display:'flex', gap:'2rem', flexWrap:'wrap',
            alignItems:'center' }}>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textMid }}>
              <strong style={{ color:C.textDark }}>
                {(allResources||[]).filter(r=>r.free).length}
              </strong> free resources available
            </div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textMid }}>
              <strong style={{ color:C.textDark }}>
                {(allResources||[]).reduce((s,r)=>s+(r.downloads||0),0).toLocaleString()}
              </strong> total downloads
            </div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textMid,
              marginLeft:'auto' }}>
              All materials written by our licensed clinical team ✓
            </div>
          </div>
        )}
      </div>

      {premiumRes && (
        <PremiumModal resource={premiumRes} onClose={() => setPremiumRes(null)}
          onNavigate={p => { setPremiumRes(null); navigate(p) }} />
      )}
      {toast && <DownloadToast resource={toast} onClose={() => setToast(null)} />}
    </div>
  )
}