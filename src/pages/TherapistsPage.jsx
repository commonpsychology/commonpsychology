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
    <div className="therapist-card" style={{ pointerEvents: 'none' }}>
      <div
        className="therapist-img"
        style={{
          background: 'linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite',
          height: 220,
        }}
      />
      <div className="therapist-body">
        {[['60%','1.1rem'],['45%','0.8rem'],['100%','1.8rem'],['80%','0.8rem']].map(([w, h], i) => (
          <div
            key={i}
            style={{
              height: h, width: w,
              background: '#f0f4f8',
              borderRadius: 8,
              marginBottom: '0.6rem',
              animation: 'shimmer 1.4s infinite',
            }}
          />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  )
}

function TherapistCard({ t, onBook, onView }) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div className="therapist-card" onClick={onView} style={{ cursor: 'pointer' }}>
      <div className="therapist-img" style={{ padding: 0, overflow: 'hidden', position: 'relative', height: 220 }}>
        {cleanUrl(t.avatar_url) && !imgErr
          ? (
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
          )
        }
        {t.is_available
          ? <span className="therapist-avail-badge">● Available</span>
          : <span className="therapist-avail-badge" style={{ background: 'var(--earth-warm)' }}>Unavailable</span>
        }
      </div>

      <div className="therapist-body">
        <div className="therapist-name">{t.full_name}</div>
        <div className="therapist-role">
          {t.license_type}
          {t.experience_years ? ` · ${t.experience_years} yrs` : ''}
        </div>
        <div className="therapist-tags">
          {(t.specializations || []).slice(0, 3).map((tag, j) => (
            <span className="tag" key={j}>{tag}</span>
          ))}
        </div>
        <div className="therapist-footer">
          <div className="therapist-rating">⭐ {t.rating ? Number(t.rating).toFixed(1) : 'New'}</div>
          <div className="therapist-fee">
            {t.consultation_fee ? `NPR ${Number(t.consultation_fee).toLocaleString()}` : '—'}
            <small> / session</small>
          </div>
        </div>
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
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

<div className="therapists-grid" style={{ 
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' 
}}>          {loading
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