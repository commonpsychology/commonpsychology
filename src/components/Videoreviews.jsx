// src/components/VideoReviews.jsx
// Dynamic video reviews section — users can submit videos, stored in Supabase
// Shows approved videos; links to full /reviews page

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const GAP = 20

function getVisible(w) {
  if (w < 640)  return 1
  if (w < 1024) return 2
  return 3
}

/* ── STAR RATING ── */
function Stars({ count = 5, size = '0.8rem' }) {
  return (
    <span style={{ color: 'var(--earth-warm)', fontSize: size, letterSpacing: 1 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

/* ── VIDEO THUMBNAIL ── */
function VideoThumbnail({ v }) {
  const [errored, setErrored] = useState(false)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef(null)

  const thumbBg = v.thumbnail_url
    ? `url(${v.thumbnail_url}) center/cover no-repeat`
    : 'var(--sky-light)'

  if (v.video_url && !errored) {
    return (
      <div style={{ position: 'relative', width: '100%', background: '#0a1520' }}>
        {/* Topic pill */}
        <div style={{
          position: 'absolute', top: 10, left: 10, zIndex: 3,
          background: 'var(--white)', borderRadius: 100,
          padding: '3px 10px',
          fontFamily: 'var(--font-body)', fontSize: '0.65rem',
          fontWeight: 700, color: 'var(--blue-deep)',
          border: '1px solid var(--blue-pale)',
          pointerEvents: 'none',
        }}>
          {v.topic}
        </div>

        {/* Duration badge */}
        {v.duration && (
          <div style={{
            position: 'absolute', bottom: 8, right: 8, zIndex: 3,
            background: 'rgba(0,0,0,0.6)', borderRadius: 4,
            padding: '2px 7px',
            fontFamily: 'var(--font-body)', fontSize: '0.68rem',
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
          style={{
            display: 'block', width: '100%', height: 210,
            objectFit: 'cover', background: '#0a1520',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{
      position: 'relative', height: 210,
      background: v.thumbnail_url ? undefined : 'var(--sky-light)',
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
        fontSize: '1.4rem',
      }}>▶</div>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 600,
        color: 'var(--text-light)', background: 'rgba(255,255,255,0.85)',
        padding: '3px 12px', borderRadius: 100,
      }}>
        {errored ? 'Video unavailable' : 'Video coming soon'}
      </span>
      <div style={{
        position: 'absolute', top: 10, left: 10,
        background: 'var(--white)', borderRadius: 100,
        padding: '3px 10px',
        fontFamily: 'var(--font-body)', fontSize: '0.65rem',
        fontWeight: 700, color: 'var(--blue-deep)',
        border: '1px solid var(--blue-pale)',
      }}>
        {v.topic}
      </div>
    </div>
  )
}

/* ── VIDEO CARD ── */
function VideoCard({ v, cardW }) {
  return (
    <div
      style={{
        width: cardW, minWidth: cardW, flexShrink: 0,
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        border: '1px solid var(--blue-pale)',
        boxShadow: 'var(--shadow-soft)',
        transition: 'box-shadow 0.25s, transform 0.25s',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-mid)'
        e.currentTarget.style.transform = 'translateY(-4px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <VideoThumbnail v={v} />
      <div style={{ padding: '1.1rem 1.2rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '0.84rem',
          color: 'var(--text-mid)', fontStyle: 'italic',
          lineHeight: 1.65, margin: 0, flex: 1,
        }}>
          {v.quote ? `"${v.quote}"` : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.84rem', fontWeight: 700, color: 'var(--blue-deep)' }}>
              {v.name}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'var(--text-light)' }}>
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
    background: 'rgba(10,20,40,0.7)', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  }
  const modal = {
    background: 'var(--white)', borderRadius: 20,
    width: '100%', maxWidth: 520,
    boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
    overflow: 'hidden', position: 'relative',
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right,#00BFFF 0%,#00BFFF 5%,#e8f3ee 50%,#fff 100%)',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--green-pale)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--blue-deep)', fontWeight: 600 }}>
              Share Your Story 🎥
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-light)' }}>
              Your experience can inspire others to seek help
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: 'rgba(0,0,0,0.06)', cursor: 'pointer',
            fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem 1.75rem' }}>

          {/* Step 3: Done */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--green-deep)', marginBottom: '0.5rem' }}>
                Thank you!
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.6 }}>
                Your video has been submitted for review. Once approved by our team, it will appear in the Stories section.
              </p>
            </div>
          )}

          {/* Step 2: Uploading */}
          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📤</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-mid)', marginBottom: '1rem' }}>
                Uploading your video... {progress}%
              </div>
              <div style={{ height: 8, background: 'var(--sky-light)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 8,
                  background: 'var(--sky)',
                  width: `${progress}%`,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.75rem' }}>
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
                  fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#c53030',
                }}>
                  {error}
                </div>
              )}

              {/* Video file */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: '0.4rem' }}>
                  Video File * <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(MP4, max 100MB)</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${file ? 'var(--sky)' : 'var(--blue-pale)'}`,
                    borderRadius: 10, padding: '1rem',
                    textAlign: 'center', cursor: 'pointer',
                    background: file ? 'var(--sky-light)' : 'var(--off-white)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{file ? '✅' : '📁'}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: file ? 'var(--sky-dark)' : 'var(--text-light)', fontWeight: file ? 600 : 400 }}>
                    {file ? file.name : 'Click to choose your video'}
                  </div>
                </div>
                <input ref={fileRef} type="file" accept="video/mp4,video/*" style={{ display: 'none' }} onChange={handleFile} />
              </div>

              {/* Name + City */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[['name', 'Your Name *', 'Sita Maharjan'], ['city', 'Your City *', 'Kathmandu']].map(([key, label, ph]) => (
                  <div key={key}>
                    <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: '0.3rem' }}>{label}</label>
                    <input
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={ph}
                      style={{
                        width: '100%', padding: '0.55rem 0.8rem',
                        border: '1.5px solid var(--blue-pale)', borderRadius: 8,
                        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                        color: 'var(--text-dark)', outline: 'none',
                        background: 'var(--white)',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Topic */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: '0.3rem' }}>Topic *</label>
                <select
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
                  style={{
                    width: '100%', padding: '0.55rem 0.8rem',
                    border: '1.5px solid var(--blue-pale)', borderRadius: 8,
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                    color: form.topic ? 'var(--text-dark)' : 'var(--text-light)',
                    background: 'var(--white)', outline: 'none',
                  }}
                >
                  <option value="">Select your experience area...</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Quote */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: '0.3rem' }}>
                  Short Quote <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(optional)</span>
                </label>
                <textarea
                  value={form.quote}
                  onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
                  placeholder="One sentence describing your experience..."
                  rows={2}
                  style={{
                    width: '100%', padding: '0.55rem 0.8rem',
                    border: '1.5px solid var(--blue-pale)', borderRadius: 8,
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                    color: 'var(--text-dark)', resize: 'none', outline: 'none',
                    background: 'var(--white)',
                  }}
                />
              </div>

              {/* Stars */}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: '0.4rem' }}>Your Rating</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(f => ({ ...f, stars: n }))}
                      style={{
                        border: 'none', background: 'none', cursor: 'pointer',
                        fontSize: '1.6rem', lineHeight: 1,
                        color: n <= form.stars ? 'var(--earth-warm)' : 'var(--earth-light)',
                        transition: 'color 0.15s',
                      }}>★</button>
                  ))}
                </div>
              </div>

              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.73rem', color: 'var(--text-light)', margin: 0, lineHeight: 1.5 }}>
                🔒 Your video will be reviewed by our team before being published. We respect your privacy and will never share your information.
              </p>

              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmit}
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem' }}
              >
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
  const [index, setIndex] = useState(0)
  const [width, setWidth] = useState(960)
  const wrapRef = useRef(null)

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

  const visible  = getVisible(width)
  const cardW    = Math.floor((width - GAP * (visible - 1)) / visible)
  const maxIndex = Math.max(0, videos.length - visible)
  const pageCount  = Math.ceil(videos.length / visible)
  const activePage = Math.floor(index / visible)

  useEffect(() => { setIndex(i => Math.min(i, maxIndex)) }, [maxIndex])

  function prev() { setIndex(i => Math.max(0, i - visible)) }
  function next() { setIndex(i => Math.min(maxIndex, i + visible)) }

  const touchX = useRef(null)
  function onTouchStart(e) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchX.current === null) return
    const dx = touchX.current - e.changedTouches[0].clientX
    if (dx > 40) next()
    if (dx < -40) prev()
    touchX.current = null
  }

  return (
    <>
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchVideos() }}
        />
      )}

      <section className="section" style={{ background: 'var(--white)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <span className="section-tag">Proof of Trust</span>
            <h2 className="section-title">Real Stories, Real <em>Healing</em></h2>
            <p className="section-desc">Hear directly from clients who took the first step.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Share your story button */}
            <button
              className="btn btn-outline"
              onClick={() => user ? setShowModal(true) : navigate('/signin')}
              style={{ gap: 6 }}
            >
              🎥 Share Your Story
            </button>

            {/* Carousel nav */}
            {videos.length > visible && (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={prev} disabled={index === 0}
                  aria-label="Previous"
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '2px solid var(--blue-pale)', background: 'var(--white)',
                    cursor: index > 0 ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', color: 'var(--blue-deep)',
                    opacity: index > 0 ? 1 : 0.3, transition: 'all 0.2s',
                  }}
                >‹</button>
                <button
                  onClick={next} disabled={index >= maxIndex}
                  aria-label="Next"
                  style={{
                    width: 40, height: 40, borderRadius: '50%',
                    border: '2px solid var(--blue-pale)',
                    background: index < maxIndex ? 'var(--sky)' : 'var(--white)',
                    cursor: index < maxIndex ? 'pointer' : 'default',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem',
                    color: index < maxIndex ? 'white' : 'var(--blue-deep)',
                    opacity: index < maxIndex ? 1 : 0.3, transition: 'all 0.2s',
                  }}
                >›</button>
              </div>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', gap: GAP }}>
            {[1,2,3].slice(0, visible).map(i => (
              <div key={i} style={{
                flex: 1, height: 340, borderRadius: 20,
                background: 'linear-gradient(90deg,var(--sky-light) 0%,#e8f3ee 50%,var(--sky-light) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.4s infinite',
              }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && videos.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            border: '2px dashed var(--blue-pale)', borderRadius: 16,
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎥</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--blue-deep)', marginBottom: '0.5rem' }}>
              Be the first to share your story
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
              Your experience can inspire others to seek the help they need.
            </p>
            <button className="btn btn-primary" onClick={() => user ? setShowModal(true) : navigate('/signin')}>
              🎥 Share Your Story
            </button>
          </div>
        )}

        {/* Carousel */}
        {!loading && videos.length > 0 && (
          <>
            <div
              ref={wrapRef}
              style={{ overflow: 'hidden', width: '100%' }}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <div style={{
                display: 'flex', gap: GAP,
                transition: 'transform 0.44s cubic-bezier(0.4,0,0.2,1)',
                transform: `translateX(${-index * (cardW + GAP)}px)`,
                willChange: 'transform',
              }}>
                {videos.map((v, i) => (
                  <VideoCard key={v.id || i} v={v} cardW={cardW} />
                ))}
              </div>
            </div>

            {/* Dots */}
            {pageCount > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: '1.5rem' }}>
                {Array.from({ length: pageCount }).map((_, p) => (
                  <button
                    key={p}
                    onClick={() => setIndex(Math.min(p * visible, maxIndex))}
                    style={{
                      width: p === activePage ? 24 : 8, height: 8,
                      borderRadius: 4, border: 'none',
                      background: p === activePage ? 'var(--sky)' : 'var(--blue-pale)',
                      cursor: 'pointer', transition: 'all 0.25s', padding: 0,
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/reviews')}>
            View All Stories →
          </button>
          <button className="btn btn-outline" onClick={() => user ? setShowModal(true) : navigate('/signin')}>
            🎥 Share Your Story
          </button>
        </div>
      </section>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  )
}