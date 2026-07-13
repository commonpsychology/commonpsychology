import { useState, useEffect, useRef, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || ''

const FALLBACK_IMAGES = [
  { id: 1, url: '/gallery/1.jpg', title: 'Community Session', category: 'therapy' },
  { id: 2, url: '/gallery/2.jpg', title: 'Workshop 2024',     category: 'workshop' },
  { id: 3, url: '/gallery/3.jpg', title: 'Healing Circle',    category: 'community' },
  { id: 4, url: '/gallery/4.jpg', title: 'Mindfulness Day',   category: 'wellness' },
  { id: 5, url: '/gallery/5.jpg', title: 'Team & Therapists', category: 'team' },
  { id: 6, url: '/gallery/6.jpg', title: 'Ashram Retreat',    category: 'ashram' },
]

const AUTO_MS = 4000

export default function ImageSlider() {
  const [images, setImages]     = useState([])
  const [current, setCurrent]   = useState(0)
  const [loading, setLoading]   = useState(true)
  const [paused, setPaused]     = useState(false)
  const [thumb, setThumb]       = useState(0)
  const autoRef  = useRef(null)
  const trackRef = useRef(null)
  const startX   = useRef(null)
  const totalRef = useRef(0)

  // ── Fetch images ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`${API_BASE}/gallery?approved=true&limit=20`)
        const data = await res.json()
        const raw  = data?.images || data?.data || []
        const imgs = raw.filter(im => im?.image_url || im?.url)
        if (imgs.length) {
          totalRef.current = imgs.length
          setImages(imgs)
          setLoading(false)
          return
        }
      } catch {}
      totalRef.current = FALLBACK_IMAGES.length
      setImages(FALLBACK_IMAGES)
      setLoading(false)
    }
    load()
  }, [])

  // ── goTo ─────────────────────────────────────────────────────────────────
  const goTo = useCallback((idx) => {
    const n = totalRef.current
    if (!n) return
    setCurrent((idx + n) % n)
  }, [])

  // ── Auto-advance ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!images.length || paused) return
    clearInterval(autoRef.current)
    autoRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % totalRef.current)
    }, AUTO_MS)
    return () => clearInterval(autoRef.current)
  }, [images.length, paused])

  // ── Sync thumbnail strip ────────────────────────────────────────────────
  useEffect(() => {
    if (!trackRef.current || !images.length) return
    const strip = trackRef.current
    const btn   = strip.children[current]
    if (btn) {
      const btnLeft    = btn.offsetLeft
      const btnWidth   = btn.offsetWidth
      const stripWidth = strip.offsetWidth
      strip.scrollTo({
        left: btnLeft - (stripWidth / 2) + (btnWidth / 2),
        behavior: 'smooth'
      })
    }
    setThumb(current)
  }, [current, images.length])

  // ── Swipe ───────────────────────────────────────────────────────────────
  function onTouchStart(e) { startX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1))
    startX.current = null
  }

  if (loading) return (
    <section style={{ display:'flex', alignItems:'center', justifyContent:'center',
      padding:'5rem 0', background:'linear-gradient(180deg, #EAF6FF 0%, #F6FBFF 100%)' }}>
      <div style={{ width:40, height:40, border:'3px solid var(--blue-pale)',
        borderTopColor:'var(--sky)', borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </section>
  )

  if (!images.length) return null

  const n = images.length
  const prevIdx = (current - 1 + n) % n
  const nextIdx = (current + 1) % n
  const getSrc = (im) => im?.image_url || im?.url

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #E3F5FF 0%, #F2FAFF 45%, #FFFFFF 100%)',
      padding: '0 0 3rem',
    }}>
      {/* ambient bluish blobs for depth */}
      <div style={{
        position:'absolute', width:420, height:420, top:-180, left:-140,
        borderRadius:'50%', filter:'blur(70px)', pointerEvents:'none',
        background:'radial-gradient(circle, rgba(0,191,255,0.16), transparent 70%)',
      }} />
      <div style={{
        position:'absolute', width:360, height:360, bottom:-160, right:-120,
        borderRadius:'50%', filter:'blur(70px)', pointerEvents:'none',
        background:'radial-gradient(circle, rgba(41,128,185,0.14), transparent 70%)',
      }} />

      {/* Header */}
      <div style={{ position:'relative', textAlign:'center', padding:'3rem 1rem 2.5rem', zIndex:1 }}>
        <a
          href="/gallery"
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '9px 18px',
            borderRadius: 100,
            background: 'linear-gradient(135deg, #2ECC71 0%, #16A085 100%)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.03em',
            textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(22,160,133,0.35), 0 2px 6px rgba(22,160,133,0.25)',
            border: '1.5px solid rgba(255,255,255,0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            zIndex: 2,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 12px 26px rgba(22,160,133,0.42), 0 4px 10px rgba(22,160,133,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(22,160,133,0.35), 0 2px 6px rgba(22,160,133,0.25)'
          }}
        >
          View Gallery →
        </a>
        <span style={{ display:'inline-block', padding:'4px 16px', borderRadius:100,
          background:'var(--white)', color:'#005580',
          border:'1.5px solid var(--blue-pale)',
          fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em',
          textTransform:'uppercase', marginBottom:'0.65rem' }}>
          📸 Our moments
        </span>
        <h2 style={{ fontSize:'clamp(1.4rem, 3vw, 2rem)', fontWeight:800,
          color:'var(--text-dark)', lineHeight:1.2, margin:0 }}>
          Social Responsibility and Our Community Involvement
        </h2>
        <p style={{ fontSize:'0.88rem', color:'var(--text-light)', marginTop:'0.4rem' }}>
          Workshops, therapy spaces, community events &amp; more
        </p>
      </div>

      {/* Coverflow slider */}
      <div
        style={{ position:'relative', zIndex:1, maxWidth:960, margin:'0 auto', padding:'0 1rem' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'center',
          gap:'clamp(-20px, -2vw, 0px)', minHeight:'min(420px, 62vw)',
        }}>
          {/* LEFT — smaller, peeking */}
          <SlideCard
            im={images[prevIdx]} getSrc={getSrc}
            size="min(190px, 30vw)"
            onClick={() => goTo(prevIdx)}
            style={{ opacity:0.6, transform:'translateX(6%) scale(0.92) rotateY(8deg)', zIndex:1 }}
          />

          {/* CENTER — large, active */}
          <SlideCard
            im={images[current]} getSrc={getSrc}
            size="min(340px, 56vw)"
            active
            style={{ zIndex:3 }}
          />

          {/* RIGHT — smaller, peeking */}
          <SlideCard
            im={images[nextIdx]} getSrc={getSrc}
            size="min(190px, 30vw)"
            onClick={() => goTo(nextIdx)}
            style={{ opacity:0.6, transform:'translateX(-6%) scale(0.92) rotateY(-8deg)', zIndex:1 }}
          />
        </div>

        {/* Prev / Next */}
        {[{ dir:-1, label:'←', side:'left' }, { dir:1, label:'→', side:'right' }].map(({ dir, label, side }) => (
          <button key={side} onClick={() => goTo(current + dir)} aria-label={dir === -1 ? 'Previous' : 'Next'}
            style={{ position:'absolute', top:'50%', [side]:'clamp(-6px, 0vw, 10px)',
              transform:'translateY(-50%)', width:44, height:44,
              borderRadius:'50%', border:'2px solid var(--blue-pale)',
              background:'var(--white)', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'var(--sky)', fontSize:'1.1rem',
              boxShadow:'0 6px 16px rgba(15,52,96,0.14)',
              transition:'border-color 0.2s, background 0.2s', zIndex:4 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--sky)'; e.currentTarget.style.background='var(--sky-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--blue-pale)'; e.currentTarget.style.background='var(--white)' }}>
            {label}
          </button>
        ))}

        {/* Caption for active image */}
        {images[current]?.title && (
          <div style={{ textAlign:'center', marginTop:'1.4rem' }}>
            {images[current].category && (
              <span style={{ display:'inline-block', padding:'2px 12px', borderRadius:100,
                background:'#DFF3FF', color:'#005580',
                fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.08em',
                textTransform:'uppercase', marginBottom:6 }}>
                {images[current].category}
              </span>
            )}
            <div style={{ color:'var(--text-dark)', fontSize:'1rem', fontWeight:700,
              fontFamily:'var(--font-display)' }}>
              {images[current].title}
            </div>
          </div>
        )}

        {/* Counter */}
        <div style={{ textAlign:'center', marginTop:'0.5rem',
          fontSize:'0.78rem', color:'var(--text-light)',
          fontWeight:600, letterSpacing:'0.05em' }}>
          {current + 1} / {n}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{ position:'relative', zIndex:1, maxWidth:860, margin:'1.5rem auto 0', padding:'0 1rem' }}>
        <div ref={trackRef} style={{ display:'flex', gap:10, overflowX:'auto',
          paddingBottom:6, scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
          {images.map((im, i) => {
            const imSrc = getSrc(im)
            return (
              <button key={im.id || i} onClick={() => goTo(i)}
                aria-label={im.title || `Go to image ${i + 1}`}
                style={{ flexShrink:0,
                  width: i === thumb ? 72 : 54,
                  height: i === thumb ? 72 : 54,
                  borderRadius: 14, overflow:'hidden',
                  border: i === thumb ? '3px solid var(--sky)' : '2px solid var(--blue-pale)',
                  cursor:'pointer', padding:0,
                  opacity: i === thumb ? 1 : 0.6,
                  boxShadow: i === thumb
                    ? '0 8px 18px rgba(0,123,168,0.25)'
                    : '0 2px 8px rgba(15,52,96,0.08)',
                  transition:'all 0.3s ease' }}>
                <img src={imSrc} alt={im.title || `Thumb ${i + 1}`}
                  style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              </button>
            )
          })}
        </div>
      </div>

      <style>{`div::-webkit-scrollbar{display:none}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </section>
  )
}

/* ── Reusable slide card — bevelled, 3D-shadowed image tile ── */
function SlideCard({ im, getSrc, size, active, onClick, style }) {
  const src = getSrc(im)
  return (
    <div
      onClick={onClick}
      style={{
        position:'relative',
        width: size, height: size,
        borderRadius: active ? 28 : 22,
        overflow:'hidden',
        cursor: onClick ? 'pointer' : 'default',
        flexShrink: 0,
        transition:'transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease',
        /* bevelled 3D look: layered shadow + inner highlight ring */
        boxShadow: active
          ? '0 22px 46px rgba(15,52,96,0.28), 0 4px 12px rgba(15,52,96,0.16), inset 0 2px 0 rgba(255,255,255,0.5)'
          : '0 10px 24px rgba(15,52,96,0.18), inset 0 2px 0 rgba(255,255,255,0.35)',
        border: '3px solid var(--white)',
        outline: active ? '2px solid rgba(0,191,255,0.35)' : '1px solid rgba(41,128,185,0.15)',
        outlineOffset: active ? 3 : 2,
        ...style,
      }}
    >
      <img
        src={src}
        alt={im?.title || 'Gallery image'}
        style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
      />
      {/* subtle top-light sheen for the bevelled/glossy feel */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background:'linear-gradient(160deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 30%, rgba(0,20,40,0.12) 100%)',
      }} />
    </div>
  )
}

