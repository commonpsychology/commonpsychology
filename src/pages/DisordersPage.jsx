// src/pages/GalleryPage.jsx
import { useState, useCallback, useMemo } from 'react'
import { useImages, SmartImage } from '../hooks/useImages'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', skyGhost:'#F8FEFF',
  white:'#ffffff', mint:'#e8f3ee',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8',
}
const heroGrad    = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 40%,${C.skyBright} 80%,#22d3ee 100%)`
const sectionGrad = `linear-gradient(135deg,${C.skyFainter} 0%,${C.mint} 60%,${C.skyFaint} 100%)`
const btnGrad     = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`

// ── Photo Submission Modal ────────────────────────────────────
function SubmitPhotoModal({ onClose }) {
  const [form, setForm]             = useState({ name:'', email:'', message:'' })
  const [file, setFile]             = useState(null)
  const [preview, setPreview]       = useState(null)
  const [dragOver, setDragOver]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState('')

  function handleFile(f) {
    if (!f) return
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(f.type)) {
      setError('Only JPG, PNG, or WEBP files are allowed.'); return
    }
    if (f.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return }
    setError(''); setFile(f)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim())  { setError('Name is required.'); return }
    if (!form.email.trim()) { setError('Email is required.'); return }
    if (!file)              { setError('Please select a photo.'); return }
    setSubmitting(true); setError('')
    try {
      const fd = new FormData()
      fd.append('name',    form.name.trim())
      fd.append('email',   form.email.trim())
      fd.append('message', form.message.trim())
      fd.append('photo',   file)
      const res  = await fetch(`${API_BASE}/gallery/submit`, { method:'POST', body:fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(10,25,40,0.75)', backdropFilter:'blur(8px)', zIndex:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:22, maxWidth:480, width:'100%', maxHeight:'90vh', overflowY:'auto', boxShadow:`0 0 0 2px ${C.skyBright},0 40px 100px rgba(0,0,0,0.35)`, position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:16, background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:C.textLight }}>✕</button>
        <div style={{ padding:'2rem 2rem 0' }}>
          <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>📸</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.35rem', color:C.textDark, marginBottom:'0.35rem' }}>Share a Memory</h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.textLight, marginBottom:'1.5rem', lineHeight:1.6 }}>Attended one of our events? Submit your photo and we may feature it.</p>
        </div>
        {submitted ? (
          <div style={{ padding:'2rem', textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:'50%', background:btnGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', fontSize:'1.5rem' }}>✓</div>
            <h3 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'0.5rem' }}>Photo Submitted!</h3>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textLight, lineHeight:1.6 }}>Our team will review your photo and get back to you.</p>
            <button onClick={onClose} style={{ marginTop:'1.5rem', padding:'0.65rem 1.75rem', borderRadius:10, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, cursor:'pointer' }}>Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ padding:'0 2rem 2rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              {[['Name','text','name','Your name'],['Email','email','email','you@email.com']].map(([label,type,key,ph]) => (
                <div key={key}>
                  <label style={{ display:'block', fontSize:'0.68rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.35rem' }}>{label} *</label>
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]:e.target.value }))} placeholder={ph} type={type} required style={{ width:'100%', padding:'0.65rem 0.85rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:10, fontSize:'0.88rem', outline:'none', boxSizing:'border-box' }} />
                </div>
              ))}
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.68rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.35rem' }}>Photo *</label>
              <div onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }} onClick={() => document.getElementById('gfi').click()} style={{ border:`2px dashed ${dragOver?C.skyBright:preview?C.skyMid:C.borderFaint}`, borderRadius:12, padding:'1.5rem', textAlign:'center', cursor:'pointer', background:dragOver?C.skyFainter:preview?C.skyFaint:C.white, transition:'all 0.2s' }}>
                <input id="gfi" type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display:'none' }} onChange={e => handleFile(e.target.files[0])} />
                {preview
                  ? <div><img src={preview} alt="Preview" style={{ maxHeight:160, maxWidth:'100%', borderRadius:8, objectFit:'cover' }} /><div style={{ marginTop:'0.65rem', fontSize:'0.78rem', color:C.skyDeep, fontWeight:700 }}>✓ {file?.name}</div></div>
                  : <div><div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🖼️</div><div style={{ fontSize:'0.85rem', fontWeight:700, color:C.textMid }}>{dragOver?'Drop to upload':'Click or drag & drop'}</div><div style={{ fontSize:'0.72rem', color:C.textLight, marginTop:'0.25rem' }}>JPG, PNG, WEBP · Max 10 MB</div></div>
                }
              </div>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.68rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.35rem' }}>Caption (optional)</label>
              <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message:e.target.value }))} placeholder="Tell us about this photo…" rows={2} style={{ width:'100%', padding:'0.65rem 0.85rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:10, fontSize:'0.88rem', outline:'none', boxSizing:'border-box', resize:'vertical' }} />
            </div>
            {error && <div style={{ background:'#fff0f0', border:'1px solid #f5a0a0', borderRadius:8, padding:'0.65rem 1rem', fontSize:'0.82rem', color:'#c0392b' }}>{error}</div>}
            <div style={{ display:'flex', gap:'0.65rem' }}>
              <button type="button" onClick={onClose} style={{ flex:1, padding:'0.7rem', borderRadius:10, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontWeight:600, cursor:'pointer' }}>Cancel</button>
              <button type="submit" disabled={submitting || !file} style={{ flex:2, padding:'0.7rem', borderRadius:10, border:'none', background:file&&!submitting?btnGrad:C.borderFaint, color:file&&!submitting?'white':C.textLight, fontWeight:700, cursor:file&&!submitting?'pointer':'not-allowed' }}>
                {submitting ? 'Uploading…' : '📤 Submit Photo'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Gallery Card ──────────────────────────────────────────────
function GalleryCard({ item, onOpen }) {
  const [hovered, setHovered] = useState(false)
  const colSpan = item.cols || 1
  const rowSpan = item.rows || 1

  // Supabase items use image_url; fallback items also use image_url
  const imgSrc = item.image_url || item.resolved

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(item)}
      style={{
        gridColumn:`span ${colSpan}`, gridRow:`span ${rowSpan}`,
        borderRadius:20, background:C.white, position:'relative',
        overflow:'visible', cursor:'pointer',
        boxShadow: hovered
          ? `0 2px 0 0 ${C.skyDeep},0 5px 0 0 ${C.skyMid}bb,0 9px 0 0 ${C.skyBright}55,0 24px 56px rgba(0,191,255,0.22)`
          : `0 2px 14px rgba(0,191,255,0.07)`,
        border:`1.5px solid ${hovered ? C.skyBright : C.borderFaint}`,
        transform: hovered ? 'translateY(-8px) scale(1.015)' : 'translateY(0) scale(1)',
        transition:'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        minHeight: rowSpan > 1 ? 380 : 220,
      }}
    >
      <SmartImage
        src={imgSrc}
        alt={item.title}
        gradient={item.gradient || heroGrad}
        emoji={item.emoji}
        style={{ borderRadius:'18px 18px 0 0', height: rowSpan > 1 ? 280 : 180, overflow:'hidden' }}
        imgStyle={{ transform: hovered ? 'scale(1.05)' : 'scale(1)', transition:'transform 0.4s ease' }}
      />

      <div style={{ position:'absolute', top:12, left:12, background:'rgba(255,255,255,0.18)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:100, padding:'3px 10px', fontSize:'0.65rem', fontWeight:700, color:'white', zIndex:2 }}>
        {item.date_label}
      </div>
      <div style={{ position:'absolute', top:12, right:12, width:30, height:30, borderRadius:'50%', background:hovered?btnGrad:'rgba(255,255,255,0.18)', backdropFilter:'blur(10px)', border:`1px solid ${hovered?'transparent':'rgba(255,255,255,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', color:'white', transition:'all 0.3s', zIndex:2 }}>🔍</div>

      <div style={{ position:'absolute', bottom: rowSpan > 1 ? 'calc(100% - 302px)' : 'calc(100% - 202px)', left:'50%', transform:'translateX(-50%)', zIndex:10, background:hovered?btnGrad:C.white, border:`1.5px solid ${hovered?C.skyBright:C.border}`, borderRadius:100, padding:'5px 18px', boxShadow:hovered?'0 4px 20px rgba(0,191,255,0.4)':'0 4px 16px rgba(0,0,0,0.12)', transition:'all 0.3s', whiteSpace:'nowrap', pointerEvents:'none' }}>
        <span style={{ fontSize:'0.7rem', fontWeight:800, color:hovered?'white':C.textMid, transition:'color 0.3s' }}>{item.category}</span>
      </div>

      <div style={{ padding:'1.3rem 1.4rem 1.25rem' }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:colSpan > 1 ? '1.05rem' : '0.92rem', color:C.textDark, lineHeight:1.35, marginBottom:'0.5rem' }}>{item.title}</h3>
        <p style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.textLight, lineHeight:1.6, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{item.description}</p>
      </div>
    </div>
  )
}

// ── Lightbox ──────────────────────────────────────────────────
function Lightbox({ item, items, onClose, onNav }) {
  if (!item) return null
  const idx    = items.findIndex(i => i.id === item.id)
  const imgSrc = item.image_url || item.resolved

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:600, background:'rgba(10,25,40,0.88)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:C.white, borderRadius:24, maxWidth:680, width:'100%', boxShadow:`0 0 0 2px ${C.skyBright},0 40px 100px rgba(0,0,0,0.4)`, overflow:'hidden', position:'relative' }}>
        <SmartImage
          src={imgSrc}
          alt={item.title}
          gradient={item.gradient || heroGrad}
          emoji={item.emoji}
          style={{ height:320 }}
        />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:324, pointerEvents:'none' }}>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:4, background:btnGrad }} />
          <div style={{ position:'absolute', top:16, left:16, background:'rgba(255,255,255,0.18)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:100, padding:'4px 12px', fontSize:'0.7rem', fontWeight:700, color:'white' }}>{item.date_label}</div>
          <div style={{ position:'absolute', top:16, right:54, background:btnGrad, borderRadius:100, padding:'4px 12px', fontSize:'0.68rem', fontWeight:800, color:'white' }}>{item.category}</div>
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, width:32, height:32, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', color:'white', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'all' }}>✕</button>
        </div>
        <div style={{ padding:'2rem' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.35rem', color:C.textDark, marginBottom:'0.75rem', lineHeight:1.3 }}>{item.title}</h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textMid, lineHeight:1.72, marginBottom:'1.5rem' }}>{item.description}</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem' }}>
            <button onClick={() => onNav(items[(idx - 1 + items.length) % items.length])} style={{ padding:'0.55rem 1.2rem', borderRadius:10, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontWeight:700, cursor:'pointer' }}>← Prev</button>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.textLight }}>{idx + 1} / {items.length}</span>
            <button onClick={() => onNav(items[(idx + 1) % items.length])} style={{ padding:'0.55rem 1.2rem', borderRadius:10, border:'none', background:btnGrad, color:'white', fontWeight:700, cursor:'pointer', boxShadow:'0 4px 14px rgba(0,191,255,0.35)' }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
function SkeletonCard({ colSpan=1, rowSpan=1 }) {
  return (
    <div style={{ gridColumn:`span ${colSpan}`, gridRow:`span ${rowSpan}`, borderRadius:20, background:C.white, border:`1px solid ${C.borderFaint}`, minHeight:rowSpan > 1 ? 380 : 220, overflow:'hidden' }}>
      <div style={{ height:rowSpan > 1 ? 280 : 180, background:`linear-gradient(90deg,${C.skyFaint} 0%,${C.borderFaint} 50%,${C.skyFaint} 100%)`, backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }} />
      <div style={{ padding:'1.3rem', display:'flex', flexDirection:'column', gap:8 }}>
        <div style={{ height:16, background:C.borderFaint, borderRadius:6, width:'70%' }} />
        <div style={{ height:12, background:C.skyFaint,    borderRadius:6, width:'50%' }} />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [lightbox, setLightbox]         = useState(null)
  const [showSubmit, setShowSubmit]     = useState(false)

  const { getGalleryItems, getGalleryCategories, loading } = useImages()

  const filters = getGalleryCategories()

  // ✅ useMemo ensures this recomputes when activeFilter changes
  const filtered = useMemo(
    () => getGalleryItems(activeFilter),
    [activeFilter, getGalleryItems]
  )

  const openLightbox  = useCallback(item => setLightbox(item), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])
  const navLightbox   = useCallback(item => setLightbox(item), [])

  return (
    <div className="page-wrapper" style={{ background:C.skyGhost }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      {/* Hero */}
      <div style={{ background:heroGrad, padding:'5rem 4rem 4rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:300, height:300, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
        <div style={{ maxWidth:680, position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.3rem 1rem', marginBottom:'1rem' }}>
            <span style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.92)', textTransform:'uppercase' }}>🖼️ Photo Gallery</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,3rem)', color:'white', marginBottom:'1rem', lineHeight:1.2 }}>Moments That<br/>Matter</h1>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'1rem', color:'rgba(255,255,255,0.82)', lineHeight:1.75, maxWidth:520 }}>A glimpse into our workshops, community programs, team life, and the spaces we've built.</p>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'3rem 4rem 5rem' }}>

        {/* Filter bar */}
        <div style={{ background:sectionGrad, borderRadius:16, padding:'1.25rem 1.5rem', border:`1px solid ${C.borderFaint}`, marginBottom:'3rem', display:'flex', gap:'0.5rem', flexWrap:'wrap', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:700, color:C.textLight, marginRight:'0.25rem', textTransform:'uppercase', letterSpacing:'0.08em' }}>Filter:</span>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{ padding:'0.4rem 1rem', borderRadius:100, border:`1.5px solid ${activeFilter===f?C.skyBright:C.border}`, background:activeFilter===f?btnGrad:C.white, color:activeFilter===f?'white':C.textMid, fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s', boxShadow:activeFilter===f?'0 4px 14px rgba(0,191,255,0.3)':'none' }}
            >
              {f}
            </button>
          ))}
          <span style={{ marginLeft:'auto', fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.textLight }}>
            {loading ? '…' : `${filtered.length} photo${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gridAutoRows:'220px', gap:'1.75rem', paddingTop:'0.5rem' }}>
          {loading
            ? [1,2,3,4,5,6].map((_, i) => <SkeletonCard key={i} colSpan={i===0?2:1} rowSpan={i===0?2:1} />)
            : filtered.map(item => (
                <GalleryCard key={item.id} item={item} onOpen={openLightbox} />
              ))
          }
        </div>

        {/* Submit CTA */}
        <div style={{ marginTop:'4rem', padding:'3rem', background:heroGrad, borderRadius:20, textAlign:'center', boxShadow:'0 16px 48px rgba(0,191,255,0.2)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'relative' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>📸</div>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'white', marginBottom:'0.75rem' }}>Share a Memory With Us</h3>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:'rgba(255,255,255,0.82)', marginBottom:'1.5rem' }}>Attended one of our events? We'd love to feature your photos.</p>
            <button onClick={() => setShowSubmit(true)} style={{ padding:'0.75rem 2rem', borderRadius:12, border:'none', background:C.white, color:C.skyDeep, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}>
              📨 Send Your Photos
            </button>
          </div>
        </div>
      </div>

      <Lightbox item={lightbox} items={filtered} onClose={closeLightbox} onNav={navLightbox} />
      {showSubmit && <SubmitPhotoModal onClose={() => setShowSubmit(false)} />}
    </div>
  )
}