// src/pages/TherapistsPage.jsx
import { useState } from 'react'
import { useRouter } from '../context/RouterContext'
import { useTherapists } from '../context/TherapistsContext'
import TherapistDetailModal from '../components/TherapistDetailModal'

function InitialsAvatar({ name }) {
  const initials = (name || 'T').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = [
    ['#c8e6c9','#1b5e20'],['#bbdefb','#0d47a1'],['#fff9c4','#e65100'],
    ['#f8bbd0','#880e4f'],['#ffe0b2','#e65100'],['#b3e5fc','#01579b'],
  ]
  const [bg, fg] = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <circle cx="80" cy="80" r="80" fill={bg} />
      <text x="80" y="95" textAnchor="middle" fontSize="52" fontWeight="700" fontFamily="sans-serif" fill={fg}>
        {initials}
      </text>
    </svg>
  )
}

function cleanUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return null
}

function SkeletonCard() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0 }
          100% { background-position: -200% 0 }
        }
      `}</style>
      <div style={cardStyle}>
        {/* Image placeholder */}
        <div style={{
          height: 220, flexShrink: 0,
          background: 'linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
        }} />
        {/* Body placeholder */}
        <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.7rem', flex: 1 }}>
          {[['60%','1.1rem'],['40%','0.8rem'],['100%','1.6rem'],['50%','0.8rem']].map(([w, h], i) => (
            <div key={i} style={{
              height: h, width: w,
              background: 'linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%)',
              backgroundSize: '200% 100%',
              borderRadius: 6,
              animation: 'shimmer 1.4s infinite',
            }} />
          ))}
          {/* Button placeholder pinned to bottom */}
          <div style={{ marginTop: 'auto', height: '2.6rem', borderRadius: 8, background: '#e2e8f0' }} />
        </div>
      </div>
    </>
  )
}

// ─── Shared card shell style ──────────────────────────────────────────────────
const cardStyle = {
  display: 'flex',
  flexDirection: 'column',   // key: column so body can flex-grow
  background: '#fff',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  transition: 'box-shadow 0.2s, transform 0.2s',
  cursor: 'pointer',
}

function TherapistCard({ t, onBook, onView }) {
  const [imgErr, setImgErr] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="therapist-card"
      style={{
        ...cardStyle,
        boxShadow: hovered ? '0 8px 28px rgba(0,0,0,0.14)' : cardStyle.boxShadow,
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
      onClick={onView}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Fixed-height image area ── */}
      <div style={{ height: 220, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {cleanUrl(t.avatar_url) && !imgErr ? (
          <img
            src={cleanUrl(t.avatar_url)}
            alt={t.full_name}
            onError={() => setImgErr(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#007BA8,#00BFFF)' }}>
            <InitialsAvatar name={t.full_name} />
          </div>
        )}
        <span style={{
          position: 'absolute', bottom: 10, left: 12,
          background: t.is_available ? '#22c55e' : 'var(--earth-warm, #b45309)',
          color: '#fff',
          fontSize: '0.72rem', fontWeight: 600,
          padding: '3px 10px', borderRadius: 20,
          letterSpacing: '0.03em',
        }}>
          {t.is_available ? '● Available' : 'Unavailable'}
        </span>
      </div>

      {/* ── Body: flex-col so button sticks to bottom ── */}
      <div style={{
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,               // fills remaining card height
        gap: 0,
      }}>
        {/* Name */}
        <div style={{
          fontWeight: 700, fontSize: '1.05rem', color: '#0f172a',
          lineHeight: 1.3, marginBottom: '0.3rem',
          // clamp to 2 lines so very long names don't push layout
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {t.full_name}
        </div>

        {/* Role / experience */}
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>
          {t.license_type}{t.experience_years ? ` · ${t.experience_years} yrs` : ''}
        </div>

        {/* Specialization tags — fixed min-height so gaps don't shift layout */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '0.35rem',
          minHeight: '3.2rem',   // reserves space for up to 2 rows of tags
          alignContent: 'flex-start',
          marginBottom: '0.75rem',
        }}>
          {(t.specializations || []).slice(0, 3).map((tag, j) => (
            <span key={j} className="tag" style={{
              fontSize: '0.72rem', padding: '3px 9px', borderRadius: 20,
              background: '#f1f5f9', color: '#334155', fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Rating + fee row */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '0.5rem',
        }}>
          <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>
            ⭐ {t.rating ? Number(t.rating).toFixed(1) : 'New'}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#0f172a', textAlign: 'right' }}>
            <strong>{t.consultation_fee ? `NPR ${Number(t.consultation_fee).toLocaleString()}` : '—'}</strong>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}> / session</span>
          </div>
        </div>

        {/* Book button — pushed to bottom by marginTop: auto */}
        <button
          className="btn btn-primary"
          style={{
            width: '100%',
            marginTop: 'auto',   // ← this is the key: always pins button to bottom
            justifyContent: 'center',
            paddingTop: '0.65rem',
            paddingBottom: '0.65rem',
          }}
          onClick={e => { e.stopPropagation(); onBook() }}
        >
          Book Session
        </button>
      </div>
    </div>
  )
}

export default function TherapistsPage() {
  const { navigate } = useRouter()
  const { therapists, loading, error } = useTherapists()
  const [selectedTherapist, setSelectedTherapist] = useState(null)

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ background: 'var(--earth-cream)' }}>
        <span className="section-tag">Our Team</span>
        <h1 className="section-title">Meet All Our <em>Therapists</em></h1>
        <p className="section-desc">
          Every practitioner is licensed, verified, and committed to culturally sensitive mental health care.
        </p>
      </div>

      <div className="section therapists" style={{ paddingTop: '3rem' }}>
        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444', fontSize: '0.9rem' }}>
            Could not load therapists. Please try again later.
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch',   // ← all cells stretch to row height
        }}>
          {loading
            ? [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)
            : therapists.map(t => (
                <TherapistCard
                  key={t.id}
                  t={t}
                  onBook={() => navigate('/book', { therapist: t })}
                  onView={() => setSelectedTherapist(t)}
                />
              ))
          }
        </div>
      </div>

      {selectedTherapist && (
        <TherapistDetailModal
          therapist={selectedTherapist}
          onClose={() => setSelectedTherapist(null)}
          onBook={(t) => {
            setSelectedTherapist(null)
            navigate('/book', { therapist: t })
          }}
        />
      )}
    </div>
  )
}