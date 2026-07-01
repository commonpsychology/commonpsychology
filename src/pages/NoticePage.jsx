import { useEffect, useMemo, useState } from 'react'

/* ─────────────────────────────────────────────────────────────
   NOTICE DATA
   Add new notices here. Fields:
   - id: unique string
   - date: 'YYYY-MM-DD' (drives sorting + the "New" badge)
   - category: 'event' | 'announcement' | 'update'
   - title / titleNp: English + Nepali headline
   - body / bodyNp: optional supporting text
   - image: optional URL
───────────────────────────────────────────────────────────── */
const NOTICES = [
  {
    id: 'awareness-2026-04-30',
    date: '2026-04-30',
    category: 'event',
    title: 'Awareness program in collaboration with ABC Foundation at Tribhuvan University',
    titleNp: '२०८३-०१-१७ मा ABC फाउन्डेसनको सहकार्यमा त्रिभुवन विश्वविद्यालयमा चेतनामूलक कार्यक्रम आयोजना गरिने छ।',
    body: '',
    bodyNp: '',
    image: '', // add a URL when available
  },
]

/* ─────────────────────────────────────────────────────────────
   CATEGORY META — color language for the rail + chips
───────────────────────────────────────────────────────────── */
const CATEGORY = {
  event: {
    label: 'Event',
    color: '#0d8a7a',
    pale: '#E6FBF3',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#0d8a7a" strokeWidth="1.3"/>
        <path d="M5 3V1.6M11 3V1.6M2 6.3h12" stroke="#0d8a7a" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  announcement: {
    label: 'Announcement',
    color: '#007BA8',
    pale: '#E0F7FF',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M2 6.5 12 3v10L2 9.5z" stroke="#007BA8" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M4.5 9.5v2.8a1 1 0 0 0 1 1H6a1 1 0 0 0 1-1V9.9" stroke="#007BA8" strokeWidth="1.3"/>
      </svg>
    ),
  },
  update: {
    label: 'Update',
    color: '#c98a1f',
    pale: '#FFF6E0',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
        <path d="M13.5 8A5.5 5.5 0 1 1 11.8 4" stroke="#c98a1f" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M13.8 2.3v3.4h-3.4" stroke="#c98a1f" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
}

const FILTERS = [
  { key: 'all', label: 'All notices' },
  { key: 'event', label: 'Events' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'update', label: 'Updates' },
]

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}
function isRecent(d) {
  const days = (Date.now() - new Date(d + 'T00:00:00').getTime()) / 86400000
  return days >= 0 && days <= 14
}

/* ─────────────────────────────────────────────────────────────
   PAGE STYLES (injected once)
───────────────────────────────────────────────────────────── */
const PAGE_CSS = `
  @keyframes noticeRise {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes leafPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.35); }
    50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
  }
  @keyframes driftA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(14px,-10px); } }
  @keyframes driftB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-10px,12px); } }

  .np-chip {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.5rem 1rem;
    border-radius: 100px;
    border: 1.5px solid #daeef8;
    background: #ffffff;
    color: #4a6a7a;
    cursor: pointer;
    transition: all 0.18s ease;
    white-space: nowrap;
  }
  .np-chip:hover { border-color: #00BFFF; color: #007BA8; }
  .np-chip.active {
    background: linear-gradient(135deg, #007BA8, #00BFFF);
    border-color: transparent;
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(0,191,255,0.35);
  }

  .np-card {
    animation: noticeRise 0.5s cubic-bezier(0.22,1,0.36,1) backwards;
  }
  .np-toggle {
    font-family: var(--font-body, 'Inter', sans-serif);
    font-size: 0.76rem;
    font-weight: 700;
    color: #007BA8;
    background: #E0F7FF;
    border: 1px solid #bfe8f7;
    border-radius: 8px;
    padding: 0.35rem 0.7rem;
    cursor: pointer;
    transition: background 0.15s;
  }
  .np-toggle:hover { background: #cdf1ff; }

  @media (max-width: 640px) {
    .np-hero-title { font-size: 1.75rem !important; }
    .np-rail-line { left: 19px !important; }
    .np-node { width: 38px !important; height: 38px !important; }
    .np-card-body { padding: 1.1rem !important; }
  }
`

function injectCSS(id, css) {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  const el = document.createElement('style')
  el.id = id
  el.textContent = css
  document.head.appendChild(el)
}

/* ─────────────────────────────────────────────────────────────
   NOTICE CARD
───────────────────────────────────────────────────────────── */
function NoticeCard({ notice, index }) {
  const [showNp, setShowNp] = useState(false)
  const cat = CATEGORY[notice.category] || CATEGORY.announcement
  const fresh = isRecent(notice.date)

  return (
    <div style={{ position: 'relative', display: 'flex', gap: '1.1rem' }}>
      {/* rail node */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', width: 48 }}>
        <div
          className="np-node"
          style={{
            width: 44, height: 44, borderRadius: '14px',
            background: cat.pale, border: `1.5px solid ${cat.color}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 2, flexShrink: 0,
            animation: fresh ? 'leafPulse 2.2s ease-in-out infinite' : 'none',
          }}
        >
          {cat.icon}
        </div>
      </div>

      {/* card */}
      <div
        className="np-card"
        style={{
          flex: 1, minWidth: 0, marginBottom: '1.5rem',
          animationDelay: `${index * 60}ms`,
        }}
      >
        <div
          className="np-card-body"
          style={{
            background: '#ffffff', borderRadius: 16, padding: '1.4rem 1.5rem',
            border: '1px solid #daeef8', boxShadow: '0 4px 20px rgba(0,123,168,0.06)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,123,168,0.12)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,123,168,0.06)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: '0.55rem' }}>
            <span style={{
              fontSize: '0.68rem', fontWeight: 800, color: cat.color, background: cat.pale,
              borderRadius: 100, padding: '0.2rem 0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em',
              border: `1px solid ${cat.color}33`,
            }}>{cat.label}</span>
            {fresh && (
              <span style={{
                fontSize: '0.68rem', fontWeight: 800, color: '#065f46', background: '#d1fae5',
                borderRadius: 100, padding: '0.2rem 0.65rem', letterSpacing: '0.04em',
              }}>● New</span>
            )}
            <span style={{ fontSize: '0.75rem', color: '#7a9aaa', marginLeft: 'auto' }}>{fmtDate(notice.date)}</span>
          </div>

          <h3 style={{
            margin: '0 0 0.4rem', fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)',
            fontSize: '1.08rem', fontWeight: 600, color: '#153244', lineHeight: 1.4,
          }}>
            {notice.title}
          </h3>

          {notice.body && (
            <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: '#5c7f8f', lineHeight: 1.65 }}>
              {notice.body}
            </p>
          )}

          {notice.image && (
            <img
              src={notice.image} alt=""
              style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12, border: '1px solid #daeef8', margin: '0.5rem 0 0.75rem' }}
            />
          )}

          {(notice.titleNp || notice.bodyNp) && (
            <>
              <button className="np-toggle" onClick={() => setShowNp(v => !v)}>
                {showNp ? '✕ नेपाली लुकाउनुहोस्' : 'अ नेपालीमा पढ्नुहोस्'}
              </button>
              {showNp && (
                <div style={{
                  marginTop: '0.75rem', padding: '0.85rem 1rem', background: '#F0FBFF',
                  borderRadius: 10, border: '1px solid #daeef8',
                }}>
                  {notice.titleNp && (
                    <p style={{ margin: '0 0 2px', fontSize: '0.92rem', fontWeight: 600, color: '#153244', lineHeight: 1.7 }}>
                      {notice.titleNp}
                    </p>
                  )}
                  {notice.bodyNp && (
                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#5c7f8f', lineHeight: 1.7 }}>
                      {notice.bodyNp}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
export default function NoticesPage() {
  const [filter, setFilter] = useState('all')

  useEffect(() => { injectCSS('notices-page-css', PAGE_CSS) }, [])

  const sorted = useMemo(
    () => [...NOTICES].sort((a, b) => b.date.localeCompare(a.date)),
    []
  )
  const filtered = filter === 'all' ? sorted : sorted.filter(n => n.category === filter)
  const newCount = sorted.filter(n => isRecent(n.date)).length

  const counts = FILTERS.reduce((acc, f) => {
    acc[f.key] = f.key === 'all' ? sorted.length : sorted.filter(n => n.category === f.key).length
    return acc
  }, {})

  return (
    <div style={{ background: '#F4FBFD', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(120deg, #007BA8 0%, #00BFFF 55%, #12b8a0 100%)' }}>
        <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -80, right: '10%', animation: 'driftA 9s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(16,185,129,0.22)', bottom: -50, left: '6%', animation: 'driftB 11s ease-in-out infinite', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 900, margin: '0 auto', padding: 'clamp(2.5rem,6vw,4rem) clamp(1.25rem,4vw,2rem) 4rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', fontWeight: 800,
            color: 'rgba(255,255,255,0.92)', letterSpacing: '0.14em', textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 100, padding: '0.35rem 0.85rem', marginBottom: '1rem', backdropFilter: 'blur(4px)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            Common Psychology
          </span>

          <h1 className="np-hero-title" style={{
            fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: 600,
            fontSize: 'clamp(2rem,5vw,2.7rem)', color: '#ffffff', margin: '0 0 0.6rem', lineHeight: 1.15,
          }}>
            Notices &amp; Announcements
          </h1>
          <p style={{ fontSize: '0.98rem', color: 'rgba(255,255,255,0.88)', maxWidth: 480, lineHeight: 1.7, margin: '0 0 1.5rem' }}>
            Everything from upcoming events to practice updates, gathered in one place — in English and Nepali.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '0.6rem 1rem', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{sorted.length}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Total notices</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '0.6rem 1rem', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{newCount}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Posted this week</div>
            </div>
          </div>
        </div>

        {/* wave divider */}
        <svg viewBox="0 0 1440 80" style={{ display: 'block', width: '100%', height: 56, marginTop: -1 }} preserveAspectRatio="none">
          <path d="M0,32 C240,80 480,0 720,24 C960,48 1200,8 1440,40 L1440,80 L0,80 Z" fill="#F4FBFD" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 clamp(1.25rem,4vw,2rem) 4rem', marginTop: '-1.75rem' }}>

        {/* filter chips */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '2.25rem' }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`np-chip${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label} · {counts[f.key]}
            </button>
          ))}
        </div>

        {/* rail + cards */}
        {filtered.length === 0 ? (
          <div style={{
            background: '#ffffff', borderRadius: 18, border: '1.5px dashed #bae6fd',
            padding: '3rem 1.5rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>🌿</div>
            <div style={{ fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontSize: '1.05rem', color: '#153244', marginBottom: '0.35rem' }}>
              Nothing here yet
            </div>
            <p style={{ fontSize: '0.85rem', color: '#7a9aaa', maxWidth: 320, margin: '0 auto' }}>
              No {filter === 'all' ? '' : FILTERS.find(f => f.key === filter)?.label.toLowerCase() + ' '}notices right now — check back soon.
            </p>
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div className="np-rail-line" style={{
              position: 'absolute', left: 21, top: 6, bottom: 30, width: 2,
              background: 'linear-gradient(180deg, #00BFFF 0%, #12b8a0 100%)',
              opacity: 0.35, borderRadius: 2,
            }} />
            {filtered.map((n, i) => <NoticeCard key={n.id} notice={n} index={i} />)}
          </div>
        )}
      </div>
    </div>
  )
}