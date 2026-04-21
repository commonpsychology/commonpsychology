// src/pages/ReviewsPage.jsx
// Full reviews page — matching the site's blue/white gradient design
// Shows all approved video reviews, filter by topic, user can submit

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const TOPICS = ['All', 'Anxiety Recovery', 'Depression', 'Relationship Counselling',
  'Burnout & Stress', 'Grief Counselling', 'PTSD Recovery',
  'Child Psychology', 'Online Therapy', 'Other']

function Stars({ count = 5 }) {
  return (
    <span style={{ color: 'var(--earth-warm)', fontSize: '0.82rem', letterSpacing: 1 }}>
      {'★'.repeat(count)}{'☆'.repeat(5 - count)}
    </span>
  )
}

/* ── VIDEO CARD (full page version, bigger) ── */
function ReviewCard({ v, onPlay }) {
  const [errored, setErrored] = useState(false)
  const [hovering, setHovering] = useState(false)

  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: `1.5px solid ${hovering ? 'var(--sky)' : 'var(--border-faint)'}`,
        boxShadow: hovering ? 'var(--shadow-mid)' : 'var(--shadow-soft)',
        transition: 'all 0.25s',
        transform: hovering ? 'translateY(-4px)' : 'none',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Video / Thumbnail */}
      <div style={{ position: 'relative', background: '#0a1520' }}>
        {v.video_url && !errored ? (
          <>
            <div style={{
              position: 'absolute', top: 10, left: 10, zIndex: 2,
              background: 'var(--white)', borderRadius: 100,
              padding: '3px 10px',
              fontFamily: 'var(--font-body)', fontSize: '0.65rem',
              fontWeight: 700, color: 'var(--blue-deep)',
              border: '1px solid var(--blue-pale)',
            }}>{v.topic}</div>
            {v.duration && (
              <div style={{
                position: 'absolute', bottom: 8, right: 8, zIndex: 2,
                background: 'rgba(0,0,0,0.6)', borderRadius: 4,
                padding: '2px 7px', fontFamily: 'var(--font-body)',
                fontSize: '0.68rem', color: '#fff', fontWeight: 600,
              }}>{v.duration}</div>
            )}
            <video
              src={v.video_url}
              poster={v.thumbnail_url || undefined}
              controls playsInline preload="metadata"
              onError={() => setErrored(true)}
              style={{ display: 'block', width: '100%', height: 220, objectFit: 'cover' }}
            />
          </>
        ) : (
          <div style={{
            height: 220, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 8,
            background: v.thumbnail_url ? `url(${v.thumbnail_url}) center/cover` : 'var(--sky-light)',
          }}>
            <div style={{
              position: 'absolute', top: 10, left: 10,
              background: 'var(--white)', borderRadius: 100,
              padding: '3px 10px', fontFamily: 'var(--font-body)',
              fontSize: '0.65rem', fontWeight: 700, color: 'var(--blue-deep)',
              border: '1px solid var(--blue-pale)',
            }}>{v.topic}</div>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: 'rgba(0,191,255,0.15)',
              border: '2px solid rgba(0,191,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
            }}>▶</div>
            <span style={{
              fontFamily: 'var(--font-body)', fontSize: '0.72rem',
              color: 'var(--text-light)', background: 'rgba(255,255,255,0.85)',
              padding: '3px 12px', borderRadius: 100,
            }}>Coming soon</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1.2rem 1.3rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {v.quote && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '0.875rem',
            color: 'var(--text-mid)', fontStyle: 'italic',
            lineHeight: 1.65, margin: 0, flex: 1,
          }}>
            "{v.quote}"
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid var(--border-faint)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--blue-deep)' }}>{v.name}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-light)' }}>{v.city}</div>
          </div>
          <Stars count={v.stars || 5} />
        </div>
      </div>
    </div>
  )
}

/* ── UPLOAD MODAL (imported inline for self-contained page) ── */
function UploadModal({ onClose, onSuccess }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: user?.fullName || '', city: '', topic: '', quote: '', stars: 5 })
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const fileRef = useRef()

  const topics = TOPICS.filter(t => t !== 'All')

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
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE}/reviews/upload`)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.upload.onprogress = e => { if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 90)) }
      xhr.onload = () => {
        if ([200, 201].includes(xhr.status)) { setProgress(100); setStep(3); setTimeout(() => { onSuccess?.(); onClose() }, 1800) }
        else { setError('Upload failed. Please try again.'); setStep(1) }
      }
      xhr.onerror = () => { setError('Network error.'); setStep(1) }
      xhr.send(fd)
    } catch (err) { setError(err.message || 'Upload failed'); setStep(1) }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(10,20,40,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--white)', borderRadius: 20, width: '100%', maxWidth: 520,
        boxShadow: '0 32px 80px rgba(0,0,0,0.28)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(to right,#00BFFF 0%,#00BFFF 5%,#e8f3ee 55%,#fff 100%)',
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--green-pale)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--blue-deep)', fontWeight: 600 }}>Share Your Story 🎥</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-light)' }}>Inspire others to seek help</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.06)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
        </div>
        <div style={{ padding: '1.5rem 1.75rem' }}>
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎉</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--green-deep)', marginBottom: '0.5rem' }}>Thank you!</div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-light)', lineHeight: 1.6 }}>Your video has been submitted for review. Once approved it will appear here.</p>
            </div>
          )}
          {step === 2 && (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📤</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-mid)', marginBottom: '1rem' }}>Uploading... {progress}%</div>
              <div style={{ height: 8, background: 'var(--sky-light)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 8, background: 'var(--sky)', width: `${progress}%`, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && <div style={{ background: '#fff5f5', border: '1px solid #feb2b2', borderRadius: 8, padding: '0.6rem 0.9rem', fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: '#c53030' }}>{error}</div>}
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: '0.4rem' }}>Video File * <span style={{ fontWeight: 400 }}>(MP4, max 100MB)</span></label>
                <div onClick={() => fileRef.current?.click()} style={{ border: `2px dashed ${file ? 'var(--sky)' : 'var(--blue-pale)'}`, borderRadius: 10, padding: '1rem', textAlign: 'center', cursor: 'pointer', background: file ? 'var(--sky-light)' : 'var(--off-white)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{file ? '✅' : '📁'}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: file ? 'var(--sky-dark)' : 'var(--text-light)', fontWeight: file ? 600 : 400 }}>{file ? file.name : 'Click to choose your video'}</div>
                </div>
                <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFile} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[['name','Your Name *','e.g. Sita Maharjan'],['city','Your City *','e.g. Kathmandu']].map(([k,l,p]) => (
                  <div key={k}>
                    <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: '0.3rem' }}>{l}</label>
                    <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={p} style={{ width: '100%', padding: '0.55rem 0.8rem', border: '1.5px solid var(--blue-pale)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: '0.85rem', outline: 'none', background: 'var(--white)' }} />
                  </div>
                ))}
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: '0.3rem' }}>Topic *</label>
                <select value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} style={{ width: '100%', padding: '0.55rem 0.8rem', border: '1.5px solid var(--blue-pale)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: '0.85rem', background: 'var(--white)', outline: 'none' }}>
                  <option value="">Select area...</option>
                  {topics.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: '0.3rem' }}>Short Quote <span style={{ fontWeight: 400 }}>(optional)</span></label>
                <textarea value={form.quote} onChange={e => setForm(f => ({ ...f, quote: e.target.value }))} placeholder="One sentence about your experience..." rows={2} style={{ width: '100%', padding: '0.55rem 0.8rem', border: '1.5px solid var(--blue-pale)', borderRadius: 8, fontFamily: 'var(--font-body)', fontSize: '0.85rem', resize: 'none', outline: 'none', background: 'var(--white)' }} />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-mid)', display: 'block', marginBottom: '0.4rem' }}>Your Rating</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(f => ({ ...f, stars: n }))} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.6rem', lineHeight: 1, color: n <= form.stars ? 'var(--earth-warm)' : 'var(--earth-light)', transition: 'color 0.15s' }}>★</button>
                  ))}
                </div>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.73rem', color: 'var(--text-light)', margin: 0, lineHeight: 1.5 }}>🔒 Your video is reviewed before publishing. We respect your privacy.</p>
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} style={{ width: '100%', justifyContent: 'center' }}>Submit My Story →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   REVIEWS PAGE
══════════════════════════════════════ */
export default function ReviewsPage() {
  const { navigate } = useRouter()
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [stats, setStats] = useState({ total: 0, avgStars: 5 })
  const PER_PAGE = 9

  const fetchReviews = useCallback(async (topicFilter = 'All', pageNum = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        approved: 'true',
        limit: PER_PAGE,
        offset: (pageNum - 1) * PER_PAGE,
      })
      if (topicFilter !== 'All') params.append('topic', topicFilter)
      const res = await fetch(`${API_BASE}/reviews?${params}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(pageNum === 1 ? (data.reviews || []) : prev => [...prev, ...(data.reviews || [])])
        setHasMore((data.reviews || []).length === PER_PAGE)
        if (data.stats) setStats(data.stats)
      }
    } catch { setReviews([]) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { setPage(1); fetchReviews(filter, 1) }, [filter, fetchReviews])

  function loadMore() {
    const next = page + 1
    setPage(next)
    fetchReviews(filter, next)
  }

  return (
    <>
      {showModal && <UploadModal onClose={() => setShowModal(false)} onSuccess={() => fetchReviews(filter, 1)} />}

      <div className="page-wrapper">

        {/* ── PAGE HERO ── */}
        <div style={{
          background: 'linear-gradient(to right,#00BFFF 0%,#00BFFF 3%,#e8f3ee 40%,#f0f8f4 65%,#fff 100%)',
          borderBottom: '1px solid var(--green-pale)',
          padding: 'clamp(2.5rem,6vw,4rem) clamp(1rem,5vw,6rem)',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--text-light)', padding: 0 }}>Home</button>
              <span style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>›</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: 'var(--sky)', fontWeight: 600 }}>Client Stories</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div>
                <span className="section-tag">Real Voices</span>
                <h1 className="section-title" style={{ fontSize: 'clamp(1.8rem,4vw,2.8rem)', marginBottom: '0.6rem' }}>
                  Client Stories & <em>Healing Journeys</em>
                </h1>
                <p className="section-desc">
                  Every story here represents courage — the courage to seek help and transform. Watch, be inspired, and add your own.
                </p>

                {/* Stats row */}
                {stats.total > 0 && (
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                    {[
                      { num: stats.total, label: 'Stories Shared' },
                      { num: `${Number(stats.avgStars || 5).toFixed(1)}★`, label: 'Average Rating' },
                      { num: '100%', label: 'Real Clients' },
                    ].map(({ num, label }) => (
                      <div key={label}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--blue-deep)', lineHeight: 1, fontWeight: 600 }}>{num}</div>
                        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 500 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn btn-primary btn-lg" onClick={() => user ? setShowModal(true) : navigate('/signin')}>
                🎥 Share Your Story
              </button>
            </div>
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div style={{ background: 'var(--sky-ghost)', borderBottom: '1px solid var(--border-faint)', padding: '0.85rem clamp(1rem,5vw,6rem)', position: 'sticky', top: 'var(--navbar-h)', zIndex: 50 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-light)', marginRight: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filter:</span>
            {TOPICS.map(t => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                style={{
                  padding: '0.3rem 0.9rem',
                  border: `1.5px solid ${filter === t ? 'var(--sky)' : 'var(--blue-pale)'}`,
                  borderRadius: 100,
                  background: filter === t ? 'var(--sky)' : 'var(--white)',
                  color: filter === t ? 'white' : 'var(--text-mid)',
                  fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
                }}
              >{t}</button>
            ))}
          </div>
        </div>

        {/* ── REVIEWS GRID ── */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem clamp(1rem,5vw,3rem)' }}>

          {/* Loading skeletons */}
          {loading && reviews.length === 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ height: 360, borderRadius: 20, background: 'linear-gradient(90deg,var(--sky-light) 0%,#e8f3ee 50%,var(--sky-light) 100%)', backgroundSize: '200%', animation: 'shimmer 1.4s infinite' }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && reviews.length === 0 && (
            <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎥</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--blue-deep)', marginBottom: '0.5rem' }}>
                {filter !== 'All' ? `No stories for "${filter}" yet` : 'No stories yet'}
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                Be the first to share your healing journey.
              </p>
              <button className="btn btn-primary" onClick={() => user ? setShowModal(true) : navigate('/signin')}>
                🎥 Share Your Story
              </button>
            </div>
          )}

          {/* Grid */}
          {reviews.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.5rem' }}>
              {reviews.map((v, i) => <ReviewCard key={v.id || i} v={v} />)}
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
              <button className="btn btn-outline btn-lg" onClick={loadMore}>
                Load More Stories
              </button>
            </div>
          )}

          {loading && reviews.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-light)', fontFamily: 'var(--font-body)', fontSize: '0.88rem' }}>
              Loading more...
            </div>
          )}
        </div>

        {/* ── CTA BANNER ── */}
        <div style={{
          background: 'linear-gradient(to right,#00BFFF 0%,#00BFFF 3%,#e8f3ee 40%,#f0f8f4 65%,#fff 100%)',
          borderTop: '1px solid var(--green-pale)',
          padding: 'clamp(2rem,5vw,3.5rem) clamp(1rem,5vw,6rem)',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,3vw,2rem)', color: 'var(--blue-deep)', marginBottom: '0.75rem', fontWeight: 600 }}>
              Your story could inspire someone to seek help
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Recovery happens in community. Share your experience — anonymously or with your name — and become part of the healing.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => user ? setShowModal(true) : navigate('/signin')}>
                🎥 Share Your Story
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => navigate('/book')}>
                Book a Session →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </>
  )
}
