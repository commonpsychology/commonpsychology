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
  const [progress, setProgress] = useState(0)
  const [paused, setPaused]     = useState(false)
  const [thumb, setThumb]       = useState(0)
  const autoRef  = useRef(null)
  const progRef  = useRef(null)
  const trackRef = useRef(null)
  const startX   = useRef(null)
  const totalRef = useRef(0)  // ← stores images.length without stale closure

  // ── Fetch images ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`${API_BASE}/gallery?approved=true&limit=20`)
        const data = await res.json()
        const raw  = data?.images || data?.data || []
        // filter out items with no actual image URL
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

  // ── goTo — uses ref so never stale ─────────────────────────────────────────
  const goTo = useCallback((idx) => {
    const n = totalRef.current
    if (!n) return
    setCurrent((idx + n) % n)
    setProgress(0)
  }, [])

  // ── Auto-advance + progress bar ─────────────────────────────────────────────
  useEffect(() => {
    if (!images.length || paused) return
    clearInterval(autoRef.current)
    clearInterval(progRef.current)
    setProgress(0)

    progRef.current = setInterval(() => {
      setProgress(p => p >= 100 ? 100 : p + (100 / (AUTO_MS / 60)))
    }, 60)

    autoRef.current = setInterval(() => {
      setCurrent(prev => {
        const next = (prev + 1) % totalRef.current
        setProgress(0)
        return next
      })
    }, AUTO_MS)

    return () => {
      clearInterval(autoRef.current)
      clearInterval(progRef.current)
    }
  }, [images.length, paused]) // ← removed `current` and `goTo` from deps

  // ── Sync thumbnail strip ────────────────────────────────────────────────────
  useEffect(() => {
    if (!trackRef.current || !images.length) return
    const btn = trackRef.current.children[current]
    if (btn) btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    setThumb(current)
  }, [current, images.length])

  // ── Swipe ───────────────────────────────────────────────────────────────────
  function onTouchStart(e) { startX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (startX.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1))
    startX.current = null
  }

  // ── Loading spinner ─────────────────────────────────────────────────────────
  if (loading) return (
    <section style={{ display:'flex', alignItems:'center', justifyContent:'center',
      padding:'5rem 0', background:'var(--off-white)' }}>
      <div style={{ width:40, height:40, border:'3px solid var(--blue-pale)',
        borderTopColor:'var(--sky)', borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </section>
  )

  if (!images.length) return null

  const img = images[current]
  const src = img?.image_url || img?.url

  return (
    <section style={{ background:'var(--off-white)', padding:'0 0 3rem' }}>

      {/* Header */}
      <div style={{ textAlign:'center', padding:'3rem 1rem 2rem' }}>
        <span style={{ display:'inline-block', padding:'4px 16px', borderRadius:100,
          background:'var(--green-mist)', color:'var(--green-deep)',
          fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em',
          textTransform:'uppercase', marginBottom:'0.65rem' }}>
          📸 Our moments
        </span>
        <h2 style={{ fontSize:'clamp(1.4rem, 3vw, 2rem)', fontWeight:800,
          color:'var(--text-dark)', lineHeight:1.2, margin:0 }}>
          Glimpses from Common Psychology
        </h2>
        <p style={{ fontSize:'0.88rem', color:'var(--text-light)', marginTop:'0.4rem' }}>
          Workshops, therapy spaces, community events &amp; more
        </p>
      </div>

      {/* Slider */}
      <div style={{ position:'relative', maxWidth:860, margin:'0 auto', padding:'0 1rem' }}>

        {/* Decorative rings */}
        {[640, 580].map((sz, ri) => (
          <div key={ri} style={{ position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            width:`min(${sz}px, ${ri === 0 ? 90 : 82}vw)`,
            height:`min(${sz}px, ${ri === 0 ? 90 : 82}vw)`,
            borderRadius:'50%', pointerEvents:'none', zIndex:0,
            border: ri === 0
              ? '1px solid rgba(41,128,185,0.12)'
              : '1px dashed rgba(41,128,185,0.18)' }} />
        ))}

        {/* Circle frame */}
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          style={{ position:'relative', zIndex:1,
            width:'min(480px, 85vw)', height:'min(480px, 85vw)',
            borderRadius:'50%', overflow:'hidden', margin:'0 auto',
            border:'4px solid var(--white)',
            outline:'2px solid rgba(41,128,185,0.25)',
            boxShadow:'0 8px 40px rgba(15,52,96,0.18)', cursor:'grab' }}
        >
          {images.map((im, i) => {
            const imSrc = im?.image_url || im?.url
            return (
              <img key={im.id || i} src={imSrc} alt={im.title || `Slide ${i + 1}`}
                style={{ position:'absolute', inset:0, width:'100%', height:'100%',
                  objectFit:'cover',
                  opacity: i === current ? 1 : 0,
                  transform: i === current ? 'scale(1)' : 'scale(1.04)',
                  transition:'opacity 0.6s ease, transform 0.6s ease' }} />
            )
          })}

          {/* Progress arc */}
          <svg viewBox="0 0 200 200"
            style={{ position:'absolute', inset:0, width:'100%', height:'100%',
              pointerEvents:'none', zIndex:2 }}>
            <circle cx="100" cy="100" r="96" fill="none"
              stroke="rgba(41,128,185,0.55)" strokeWidth="4"
              strokeDasharray={`${progress * 6.032} 603.2`}
              strokeLinecap="round" transform="rotate(-90 100 100)"
              style={{ transition:'stroke-dasharray 0.1s linear' }} />
          </svg>

          {/* Caption */}
          {img?.title && (
            <div style={{ position:'absolute', bottom:0, left:0, right:0,
              background:'linear-gradient(to top, rgba(15,52,96,0.82) 0%, transparent 100%)',
              padding:'2rem 1.5rem 1.25rem',
              display:'flex', flexDirection:'column', alignItems:'center', zIndex:3 }}>
              {img.category && (
                <span style={{ padding:'2px 10px', borderRadius:100,
                  background:'rgba(41,128,185,0.45)', color:'#e8f4fd',
                  fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.08em',
                  textTransform:'uppercase', marginBottom:6 }}>
                  {img.category}
                </span>
              )}
              <span style={{ color:'#fff', fontSize:'0.95rem', fontWeight:700,
                fontFamily:'var(--font-display)', textAlign:'center',
                textShadow:'0 1px 4px rgba(0,0,0,0.4)' }}>
                {img.title}
              </span>
            </div>
          )}
        </div>

        {/* Prev / Next */}
        {[{ dir:-1, label:'←', side:'left' }, { dir:1, label:'→', side:'right' }].map(({ dir, label, side }) => (
          <button key={side} onClick={() => goTo(current + dir)} aria-label={dir === -1 ? 'Previous' : 'Next'}
            style={{ position:'absolute', top:'50%', [side]:0,
              transform:'translateY(-50%)', width:44, height:44,
              borderRadius:'50%', border:'2px solid var(--blue-pale)',
              background:'var(--white)', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'var(--sky)', fontSize:'1.1rem',
              transition:'border-color 0.2s, background 0.2s', zIndex:4 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--sky)'; e.currentTarget.style.background='var(--sky-light)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--blue-pale)'; e.currentTarget.style.background='var(--white)' }}>
            {label}
          </button>
        ))}

        {/* Counter */}
        <div style={{ textAlign:'center', marginTop:'1rem',
          fontSize:'0.78rem', color:'var(--text-light)',
          fontWeight:600, letterSpacing:'0.05em' }}>
          {images.length > 0 ? `${current + 1} / ${images.length}` : ''}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{ maxWidth:860, margin:'1.5rem auto 0', padding:'0 1rem' }}>
        <div ref={trackRef} style={{ display:'flex', gap:10, overflowX:'auto',
          paddingBottom:6, scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
          {images.map((im, i) => {
            const imSrc = im?.image_url || im?.url
            return (
              <button key={im.id || i} onClick={() => goTo(i)}
                aria-label={im.title || `Go to image ${i + 1}`}
                style={{ flexShrink:0,
                  width: i === thumb ? 80 : 60,
                  height: i === thumb ? 80 : 60,
                  borderRadius:'50%', overflow:'hidden',
                  border: i === thumb ? '3px solid var(--sky)' : '2px solid var(--blue-pale)',
                  cursor:'pointer', padding:0,
                  opacity: i === thumb ? 1 : 0.6,
                  transition:'all 0.3s ease',
                  outline: i === thumb ? '2px solid rgba(41,128,185,0.25)' : 'none',
                  outlineOffset:2 }}>
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