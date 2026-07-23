// src/components/VideoReviews.jsx
// Dynamic video reviews section — users can submit videos, stored in Supabase
// Shows approved videos; links to full /reviews page
//
// Visual language matches the Wellspring donate flask section: same ocean-blue
// token set, sky-light -> white -> sky-light section gradient, blurred blobs,
// pill eyebrow, Fraunces display type with an italic accent word, blue-pale
// card borders, and solid-blue pill CTAs — so the two sections read as one
// homepage rather than two different components stitched together.

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}`
  : '/api'
const GAP = 20

// Same palette as the donate flask (WellspringFlask.jsx TOKENS) so both
// sections draw from one source of truth for color.
const TOKENS = {
  oceanInk: '#003850',
  oceanDeep: '#005580',
  oceanCore: '#007BA8',
  oceanBright: '#00BFFF',
  oceanPale: '#F0FBFF',
  skyLight: '#EAF6FC',
  mist: '#F4FAF9',
  dim: '#4d7c94',
  bluePale: '#BEE9FB',
  white: '#FFFFFF',
}

function getVisible(w) {
  if (w < 640)  return 1
  if (w < 1280) return 2
  return 3
}

/* ── STAR RATING ── */
function Stars({ count = 5, size = '0.8rem' }) {
  return (
    <span style={{ color: TOKENS.oceanBright, fontSize: size, letterSpacing: 1 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

/* ── VIDEO THUMBNAIL ── */
function VideoThumbnail({ v }) {
  const [errored, setErrored] = useState(false)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef(null)

  if (v.video_url && !errored) {
    return (
      <div className="vr-thumb" style={{ position: 'relative', width: '100%', background: TOKENS.oceanInk }}>
        {/* Topic pill */}
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 3,
          background: TOKENS.white, borderRadius: 100,
          padding: '3px 10px',
          fontFamily: "'Inter', sans-serif", fontSize: '0.65rem',
          fontWeight: 700, color: TOKENS.oceanDeep,
          border: `1px solid ${TOKENS.bluePale}`,
          pointerEvents: 'none',
        }}>
          {v.topic}
        </div>

        {/* Duration badge */}
        {v.duration && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8, zIndex: 3,
            background: 'rgba(0,56,80,0.65)', borderRadius: 4,
            padding: '2px 7px',
            fontFamily: "'Inter', sans-serif", fontSize: '0.68rem',
            color: '#fff', fontWeight: 600, pointerEvents: 'none',
          }}>
            {v.duration}
          </div>
        )}

        <video
          ref={videoRef}
          src={v.video_url}
          poster={v.thumbnail_url || undefined}
          controls
          playsInline
          preload="metadata"
          onError={() => setErrored(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="vr-thumb-media"
          style={{
            display: 'block', width: '100%',
            objectFit: 'cover', background: TOKENS.oceanInk,
          }}
        />
      </div>
    )
  }

  return (
    <div className="vr-thumb" style={{
      position: 'relative',
      background: v.thumbnail_url ? undefined : TOKENS.skyLight,
      backgroundImage: v.thumbnail_url ? `url(${v.thumbnail_url})` : undefined,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 10,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: 'rgba(0,191,255,0.15)',
        border: '2px solid rgba(0,191,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.4rem', color: TOKENS.oceanCore,
      }}>▶</div>
      <span style={{
        fontFamily: "'Inter', sans-serif", fontSize: '0.72rem', fontWeight: 600,
        color: TOKENS.dim, background: 'rgba(255,255,255,0.85)',
        padding: '3px 12px', borderRadius: 100,
      }}>
        {errored ? 'Video unavailable' : 'Video coming soon'}
      </span>
      <div style={{
        position: 'absolute', top: 10, left: 10,
        background: TOKENS.white, borderRadius: 100,
        padding: '3px 10px',
        fontFamily: "'Inter', sans-serif", fontSize: '0.65rem',
        fontWeight: 700, color: TOKENS.oceanDeep,
        border: `1px solid ${TOKENS.bluePale}`,
      }}>
        {v.topic}
      </div>
    </div>
  )
}

/* ── VIDEO CARD ──
   `basis` is a CSS calc() string, e.g. "calc((100% - 40px) / 3)".
   Letting the browser compute the width (instead of a JS-floored pixel
   number) is what prevents the 3rd card from ever being clipped: calc()
   handles fractional/subpixel widths exactly, so N cards + (N-1) gaps
   always adds up to precisely 100% of the track, no matter the screen size. */
function VideoCard({ v, basis }) {
  return (
    <div
      className="vr-card"
      style={{
        flex: `0 0 ${basis}`,
        boxSizing: 'border-box',
        scrollSnapAlign: 'start',
        background: TOKENS.white,
        borderRadius: 16, overflow: 'hidden',
        border: `1px solid ${TOKENS.bluePale}`,
        boxShadow: '0 4px 16px rgba(15,52,96,0.06)',
        transition: 'box-shadow 0.25s, transform 0.25s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,88,128,0.14)'
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(15,52,96,0.06)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <VideoThumbnail v={v} />
      <div style={{ padding: '1.1rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{
          fontFamily: "'Inter', sans-serif", fontSize: '0.84rem',
          color: TOKENS.dim, fontStyle: 'italic',
          lineHeight: 1.65, margin: 0, flex: 1,
        }}>
          {v.quote ? `"${v.quote}"` : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.84rem', fontWeight: 700, color: TOKENS.oceanDeep }}>
              {v.name}
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.7rem', color: TOKENS.dim }}>
              {v.city}
            </div>
          </div>
          <Stars count={v.stars || 5} />
        </div>
      </div>
    </div>
  )
}

/* ── UPLOAD MODAL ── */
function UploadModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1) // 1=form, 2=uploading, 3=done
  const [form, setForm] = useState({
    name: user?.fullName || '',
    city: '',
    topic: '',
    quote: '',
    stars: 5,
  })
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const topics = ['Anxiety Recovery', 'Depression', 'Relationship Counselling',
    'Burnout & Stress', 'Grief Counselling', 'PTSD Recovery',
    'Child Psychology', 'Online Therapy', 'Other']

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 100 * 1024 * 1024) { setError('File must be under 100MB'); return }
    if (!f.type.startsWith('video/')) { setError('Please select a video file'); return }
    setError(''); setFile(f)
  }

  async function handleSubmit() {
    if (!file) { setError('Please select a video file'); return }
    if (!form.name || !form.city || !form.topic) { setError('Please fill all required fields'); return }
    setStep(2); setProgress(5)

    try {
      const token = localStorage.getItem('accessToken')
      const fd = new FormData()
      fd.append('video', file)
      fd.append('name', form.name)
      fd.append('city', form.city)
      fd.append('topic', form.topic)
      fd.append('quote', form.quote)
      fd.append('stars', form.stars)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/reviews/upload`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90))
      }

      xhr.onload = () => {
        if (xhr.status === 201 || xhr.status === 200) {
          setProgress(100); setStep(3)
          setTimeout(() => { onSuccess?.(); onClose() }, 1800)
        } else {
          setError('Upload failed. Please try again.'); setStep(1)
        }
      }
      xhr.onerror = () => { setError('Network error. Please try again.'); setStep(1) }
      xhr.send(fd)
    } catch (err) {
      setError(err.message || 'Upload failed'); setStep(1)
    }
  }

  const overlay = {
    position: 'fixed', inset: 0, zIndex: 9000,
    background: 'rgba(0,20,31,0.62)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  }
  const modal = {
    background: TOKENS.white, borderRadius: 20,
    width: '100%', maxWidth: 520,
    boxShadow: '0 32px 80px rgba(0,40,60,0.28)',
    overflow: 'hidden', position: 'relative',
    border: `1px solid ${TOKENS.bluePale}`,
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(to right, ${TOKENS.oceanBright} 0%, ${TOKENS.oceanBright} 5%, ${TOKENS.oceanPale} 55%, #fff 100%)`,
          padding: '1.25rem 1.75rem',
          borderBottom: `1px solid ${TOKENS.bluePale}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', color: TOKENS.oceanInk, fontWeight: 600 }}>
              Share Your Story 🎥
            </div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', color: TOKENS.dim }}>
              Your experience can inspire others to seek help
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: 'rgba(0,56,80,0.08)', cursor: 'pointer', color: TOKENS.oceanInk,
            fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem 1.75rem' }}>

          {/* Step 3: Done */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: '1.2rem', color: TOKENS.oceanDeep, marginBottom: '0.5rem' }}>
                Thank you!
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: TOKENS.dim, lineHeight: 1.6 }}>
                Your video has been submitted for review. Once approved by our team, it will appear in the Stories section.
              </p>
            </div>
          )}

          {/* Step 2: Uploading */}
          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📤</div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.9rem', color: TOKENS.dim, marginBottom: '1rem' }}>
                Uploading your video... {progress}%
              </div>
              <div style={{ height: 8, background: TOKENS.skyLight, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 8,
                  background: TOKENS.oceanBright,
                  width: `${progress}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', color: TOKENS.dim, marginTop: '0.75rem' }}>
                Please don't close this window
              </p>
            </div>
          )}

          {/* Step 1: Form */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && (
                <div style={{
                  background: '#fff5f5', border: '1px solid #feb2b2',
                  borderRadius: 8, padding: '0.6rem 0.9rem',
                  fontFamily: "'Inter', sans-serif", fontSize: '0.82rem', color: '#c53030',
                }}>
                  {error}
                </div>
              )}

              {/* Video file */}
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: TOKENS.oceanDeep, display: 'block', marginBottom: '0.4rem' }}>
                  Video File * <span style={{ fontWeight: 400, color: TOKENS.dim }}>(MP4, max 100MB)</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${file ? TOKENS.oceanBright : TOKENS.bluePale}`,
                    borderRadius: 10, padding: '1rem',
                    textAlign: 'center', cursor: 'pointer',
                    background: file ? TOKENS.oceanPale : TOKENS.mist,
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{file ? '✅' : '📁'}</div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.8rem', color: file ? TOKENS.oceanCore : TOKENS.dim, fontWeight: file ? 600 : 400 }}>
                    {file ? file.name : 'Click to choose your video'}
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="video/mp4,video/*" style={{ display: 'none' }} onChange={handleFile} />
              </div>

              {/* Name + City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[['name', 'Your Name *', 'Sita Maharjan'], ['city', 'Your City *', 'Kathmandu']].map(([key, label, ph]) => (
                  <div key={key}>
                    <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: TOKENS.oceanDeep, display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                    <input
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={ph}
                      style={{
                        width: '100%', padding: '0.55rem 0.8rem',
                        border: `1.5px solid ${TOKENS.bluePale}`, borderRadius: 8,
                        fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
                        color: TOKENS.oceanInk, outline: 'none',
                        background: TOKENS.white, boxSizing: 'border-box',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Topic */}
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: TOKENS.oceanDeep, display: 'block', marginBottom: '0.3rem' }}>Topic *</label>
                <select
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  style={{
                    width: '100%', padding: '0.55rem 0.8rem',
                    border: `1.5px solid ${TOKENS.bluePale}`, borderRadius: 8,
                    fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
                    color: form.topic ? TOKENS.oceanInk : TOKENS.dim,
                    background: TOKENS.white, outline: 'none',
                  }}
                >
                  <option value="">Select your experience area...</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Quote */}
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: TOKENS.oceanDeep, display: 'block', marginBottom: '0.3rem' }}>
                  Short Quote <span style={{ fontWeight: 400, color: TOKENS.dim }}>(optional)</span>
                </label>
                <textarea
                  value={form.quote}
                  onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
                  placeholder="One sentence describing your experience..."
                  rows={2}
                  style={{
                    width: '100%', padding: '0.55rem 0.8rem',
                    border: `1.5px solid ${TOKENS.bluePale}`, borderRadius: 8,
                    fontFamily: "'Inter', sans-serif", fontSize: '0.85rem',
                    color: TOKENS.oceanInk, resize: 'none', outline: 'none',
                    background: TOKENS.white, boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Stars */}
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.78rem', fontWeight: 700, color: TOKENS.oceanDeep, display: 'block', marginBottom: '0.4rem' }}>Your Rating</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(f => ({ ...f, stars: n }))}
                      style={{
                        border: 'none', background: 'none', cursor: 'pointer',
                        fontSize: '1.6rem', lineHeight: 1,
                        color: n <= form.stars ? TOKENS.oceanBright : TOKENS.bluePale,
                        transition: 'color 0.15s',
                      }}>★</button>
                  ))}
                </div>
              </div>

              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.73rem', color: TOKENS.dim, margin: 0, lineHeight: 1.5 }}>
                🔒 Your video will be reviewed by our team before being published. We respect your privacy and will never share your information.
              </p>

              <button className="vr-btn vr-btn-primary" onClick={handleSubmit} style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}>
                Submit My Story →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MAIN SECTION COMPONENT
══════════════════════════════════════ */
export default function VideoReviews() {
  const { navigate } = useRouter()
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [width, setWidth] = useState(960)
  const [scrollIndex, setScrollIndex] = useState(0) // active "page" of the carousel
  const wrapRef = useRef(null)   // the scrollable element
  const trackRef = useRef(null)  // the flex row of cards (used only to measure a real card)

  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/reviews?approved=true&limit=12`)
      if (res.ok) {
        const data = await res.json()
        setVideos(data.reviews || [])
      }
    } catch {
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVideos() }, [fetchVideos])

  useEffect(() => {
    function measure() {
      if (wrapRef.current) setWidth(wrapRef.current.offsetWidth)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (wrapRef.current) ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  const visible = getVisible(width)
  // CSS calc() does the sizing now — the browser handles fractional pixels
  // exactly, so `visible` cards + (visible-1) gaps always add up to exactly
  // 100% of the track. No more JS-floored pixel widths, no more drift, no
  // more clipped 3rd card.
  const basis = `calc((100% - ${GAP * (visible - 1)}px) / ${visible})`
  const pageCount = Math.max(1, Math.ceil(videos.length / visible))

  // Measure the width of one real, rendered card (+ gap) to know how far
  // to scroll. This reads the actual DOM, so it can never disagree with
  // what's on screen.
  const getStep = useCallback(() => {
    const card = trackRef.current?.firstElementChild
    if (!card) return 0
    return card.getBoundingClientRect().width + GAP
  }, [])

  // While true, the onScroll listener ignores events — set during
  // button-driven smooth scrolls so it can't recompute scrollIndex out
  // from under the click that just set it, then cleared once the
  // animation has actually settled.
  const programmaticScrollRef = useRef(false)
  const settleTimerRef = useRef(null)

  const scrollToPage = useCallback((page) => {
    const wrap = wrapRef.current
    const step = getStep()
    if (!wrap || !step) return
    const clamped = Math.min(pageCount - 1, Math.max(0, page))

    // Trust the click, not the animation-in-progress scroll events.
    setScrollIndex(clamped)
    programmaticScrollRef.current = true
    if (settleTimerRef.current) clearTimeout(settleTimerRef.current)

    wrap.scrollTo({ left: Math.round(clamped * visible * step), behavior: 'smooth' })

    // Smooth scrolls don't reliably fire a single "done" event across
    // browsers, so release the guard shortly after the animation should
    // have finished. Scroll listener resumes for touch-swipe tracking.
    settleTimerRef.current = setTimeout(() => {
      programmaticScrollRef.current = false
    }, 500)
  }, [getStep, pageCount, visible])

  function prev() { scrollToPage(scrollIndex - 1) }
  function next() { scrollToPage(scrollIndex + 1) }

  // Keep the dots/arrows in sync with native scrolling (including touch swipes).
  // Ignored while a button-triggered smooth scroll is still animating, so the
  // two mechanisms never fight over what scrollIndex should be.
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    let raf = null
    function onScroll() {
      if (programmaticScrollRef.current) return
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = null
        if (programmaticScrollRef.current) return
        const step = getStep()
        if (step > 0) {
          const page = Math.round(wrap.scrollLeft / (step * visible))
          setScrollIndex(Math.min(pageCount - 1, Math.max(0, page)))
        }
      })
    }
    wrap.addEventListener('scroll', onScroll, { passive: true })
    return () => wrap.removeEventListener('scroll', onScroll)
  }, [getStep, pageCount, visible])

  useEffect(() => { setScrollIndex(i => Math.min(i, pageCount - 1)) }, [pageCount])

  return (
    <>
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchVideos() }}
        />
      )}

      <section className="vr-section" id="stories">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700&display=swap');

          .vr-section {
            position: relative;
            overflow: hidden;
            padding: 3.5rem 1.5rem 4rem;
            background: linear-gradient(180deg, ${TOKENS.skyLight} 0%, ${TOKENS.white} 45%, ${TOKENS.skyLight} 100%);
          }
          .vr-blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(70px);
            pointer-events: none;
          }
          .vr-inner {
            position: relative;
            z-index: 1;
            max-width: 1120px;
            margin: 0 auto;
          }
          .vr-top {
            display: flex; justify-content: space-between; align-items: flex-end;
            margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
          }
          .vr-eyebrow {
            display: inline-flex; align-items: center; gap: 0.4rem;
            padding: 0.25rem 0.75rem; margin-bottom: 0.7rem;
            border: 1.5px solid ${TOKENS.bluePale}; border-radius: 100px;
            font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 700;
            letter-spacing: 0.06em; text-transform: uppercase;
            color: #0f3460; background: ${TOKENS.skyLight};
          }
          .vr-title {
            font-family: 'Fraunces', serif; font-weight: 800;
            font-size: clamp(1.5rem, 3vw, 2.05rem); line-height: 1.2;
            color: ${TOKENS.oceanInk}; margin: 0 0 0.4rem;
          }
          .vr-title em { font-style: italic; color: ${TOKENS.oceanBright}; }
          .vr-desc {
            font-family: 'Inter', sans-serif; font-size: 0.9rem;
            color: ${TOKENS.dim}; line-height: 1.55; margin: 0;
          }

          .vr-actions { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }

          .vr-btn {
            display: inline-flex; align-items: center; justify-content: center; gap: 6px;
            font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.85rem;
            padding: 0.65rem 1.3rem; border-radius: 100px; cursor: pointer;
            border: none; transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
          }
          .vr-btn-primary {
            background: ${TOKENS.oceanBright}; color: #fff;
            box-shadow: 0 8px 18px rgba(0,123,168,0.3);
          }
          .vr-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,123,168,0.38); }
          .vr-btn-outline {
            background: ${TOKENS.white}; color: ${TOKENS.oceanDeep};
            border: 1.5px solid ${TOKENS.bluePale};
          }
          .vr-btn-outline:hover { background: ${TOKENS.skyLight}; border-color: ${TOKENS.oceanBright}; }

          .vr-arrow {
            width: 40px; height: 40px; border-radius: 50%;
            border: 2px solid ${TOKENS.bluePale}; background: ${TOKENS.white};
            display: flex; align-items: center; justify-content: center;
            font-size: 1.2rem; color: ${TOKENS.oceanDeep};
            transition: all 0.2s;
          }
          .vr-arrow.is-active { background: ${TOKENS.oceanBright}; color: #fff; cursor: pointer; }
          .vr-arrow.is-disabled { opacity: 0.35; cursor: default; }

          .vr-carousel-wrap {
            overflow-x: auto; overflow-y: hidden; width: 100%;
            scroll-snap-type: x mandatory; scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; -ms-overflow-style: none;
          }
          .vr-carousel-wrap::-webkit-scrollbar { display: none; }

          .vr-thumb, .vr-thumb-media { height: 210px; }
          @media (max-width: 640px) {
            .vr-thumb, .vr-thumb-media { height: 130px; }
          }

          .vr-dot {
            border: none; padding: 0; cursor: pointer; border-radius: 4px; height: 8px;
            transition: all 0.25s ease;
          }

          .vr-empty {
            text-align: center; padding: 4rem 2rem;
            border: 2px dashed ${TOKENS.bluePale}; border-radius: 16px;
            background: ${TOKENS.white};
          }
          .vr-empty-title { font-family: 'Fraunces', serif; font-size: 1.1rem; color: ${TOKENS.oceanDeep}; margin-bottom: 0.5rem; }
          .vr-empty-desc { font-family: 'Inter', sans-serif; font-size: 0.88rem; color: ${TOKENS.dim}; margin-bottom: 1.25rem; }

          .vr-footer { display: flex; justify-content: center; gap: 0.75rem; margin-top: 1.75rem; flex-wrap: wrap; }

          @keyframes vrShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
          .vr-skeleton {
            border-radius: 16px;
            background: linear-gradient(90deg, ${TOKENS.skyLight} 0%, #e3f4fb 50%, ${TOKENS.skyLight} 100%);
            background-size: 200% 100%;
            animation: vrShimmer 1.4s infinite;
          }
          .vr-skeleton-card { height: 340px; }
          @media (max-width: 640px) {
            .vr-skeleton-card { height: 220px; }
          }

          @media (max-width: 640px) {
            .vr-top { align-items: flex-start; }
          }
        `}</style>

        <div className="vr-blob" style={{
          width: 280, height: 280, top: -100, left: -100,
          background: 'radial-gradient(circle, rgba(0,191,255,0.12), transparent 70%)',
        }} />
        <div className="vr-blob" style={{
          width: 240, height: 240, bottom: -90, right: -90,
          background: 'radial-gradient(circle, rgba(0,85,128,0.10), transparent 70%)',
        }} />

        <div className="vr-inner">
          {/* Header */}
          <div className="vr-top">
            <div>
              <span className="vr-eyebrow">🎥 Proof of Trust</span>
              <h2 className="vr-title">Real Stories, Real <em>Healing</em></h2>
              <p className="vr-desc">Hear directly from clients who took the first step.</p>
            </div>

            <div className="vr-actions">
              <button
                className="vr-btn vr-btn-outline"
                onClick={() => user ? setShowModal(true) : navigate('/signin')}
              >
                🎥 Share Your Story
              </button>

              {pageCount > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={prev} disabled={scrollIndex === 0}
                    aria-label="Previous"
                    className={`vr-arrow ${scrollIndex > 0 ? 'is-active' : 'is-disabled'}`}
                  >‹</button>
                  <button
                    onClick={next} disabled={scrollIndex >= pageCount - 1}
                    aria-label="Next"
                    className={`vr-arrow ${scrollIndex < pageCount - 1 ? 'is-active' : 'is-disabled'}`}
                  >›</button>
                </div>
              )}
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div style={{ display: 'flex', gap: GAP }}>
              {[1,2,3].slice(0, visible).map(i => (
                <div key={i} className="vr-skeleton vr-skeleton-card" style={{ flex: 1 }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && videos.length === 0 && (
            <div className="vr-empty">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎥</div>
              <div className="vr-empty-title">Be the first to share your story</div>
              <p className="vr-empty-desc">Your experience can inspire others to seek the help they need.</p>
              <button className="vr-btn vr-btn-primary" onClick={() => user ? setShowModal(true) : navigate('/signin')}>
                🎥 Share Your Story
              </button>
            </div>
          )}

          {/* Carousel */}
          {!loading && videos.length > 0 && (
            <>
              <div ref={wrapRef} className="vr-carousel-wrap">
                <div ref={trackRef} style={{ display: 'flex', gap: GAP }}>
                  {videos.map((v, i) => (
                    <VideoCard key={v.id || i} v={v} basis={basis} />
                  ))}
                </div>
              </div>

              {/* Dots */}
              {pageCount > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: '1.5rem' }}>
                  {Array.from({ length: pageCount }).map((_, p) => (
                    <button
                      key={p}
                      onClick={() => scrollToPage(p)}
                      className="vr-dot"
                      style={{
                        width: p === scrollIndex ? 24 : 8,
                        background: p === scrollIndex ? TOKENS.oceanBright : TOKENS.bluePale,
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Footer actions */}
          <div className="vr-footer">
            <button className="vr-btn vr-btn-primary" onClick={() => navigate('/reviews')}>
              View All Stories →
            </button>
            <button className="vr-btn vr-btn-outline" onClick={() => user ? setShowModal(true) : navigate('/signin')}>
              🎥 Share Your Story
            </button>
          </div>
        </div>
      </section>
    </>
  )
}