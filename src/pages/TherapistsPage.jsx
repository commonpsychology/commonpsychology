// src/pages/TherapistsPage.jsx — with real image support
import { useRouter } from '../context/RouterContext'
import { therapistsData } from '../data/therapists'
import { useImages, SmartImage } from '../hooks/useImages'

// ── Keep SVG avatars as final fallback only ───────────────────
function SvgFallback({ name }) {
  const initials = name.split(' ').map(w => w[0]).join('').replace(/[^A-Z]/gi, '').slice(0, 2).toUpperCase()
  const colors = [
    ['#c8e6c9', '#1b5e20'], ['#bbdefb', '#0d47a1'], ['#fff9c4', '#e65100'],
    ['#c8e6c9', '#2e7d32'], ['#ffe0b2', '#e65100'], ['#b3e5fc', '#01579b'],
  ]
  const idx = name.charCodeAt(0) % colors.length
  const [bg, fg] = colors[idx]
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <circle cx="80" cy="80" r="80" fill={bg} />
      <text x="80" y="95" textAnchor="middle" fontSize="52" fontWeight="700" fontFamily="sans-serif" fill={fg}>
        {initials}
      </text>
    </svg>
  )
}

const extended = [
  ...therapistsData,
  {
    id: 4, name: 'Dr. Suresh Adhikari', role: 'Psychiatrist', imgClass: 't1',
    tags: ['Medication', 'Bipolar', 'Schizophrenia'], tagClass: 'blue-tag',
    rating: '4.7', reviews: 52, fee: 'NPR 3,000', available: true, exp: '12 yrs',
    bio: 'Dr. Suresh is a board-certified psychiatrist offering medication management alongside psychotherapy.'
  },
  {
    id: 5, name: 'Ms. Deepa Rai', role: 'Art Therapist', imgClass: 't2',
    tags: ['Art Therapy', 'Trauma', 'Youth'], tagClass: '',
    rating: '4.9', reviews: 41, fee: 'NPR 1,600', available: true, exp: '4 yrs',
    bio: 'Deepa uses creative arts as a therapeutic medium, particularly effective for trauma.'
  },
  {
    id: 6, name: 'Mr. Bikash Thapa', role: 'Addiction Counselor', imgClass: 't3',
    tags: ['Addiction', 'Recovery', 'CBT'], tagClass: 'blue-tag',
    rating: '4.8', reviews: 63, fee: 'NPR 1,700', available: false, exp: '7 yrs',
    bio: 'Bikash specializes in substance use disorders and behavioral addictions.'
  },
]

const unique = extended.filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)

// ── Single therapist card with real photo ────────────────────
function TherapistCard({ t, getTherapistImage, onBook, onView }) {
  const imageUrl = getTherapistImage(t.name)

  return (
    <div
      className="therapist-card"
      onClick={onView}
      style={{ cursor: 'pointer' }}
    >
      {/* Image container */}
      <div
        className={`therapist-img ${t.imgClass}`}
        style={{ padding: 0, overflow: 'hidden', position: 'relative', height: 220 }}
      >
        <SmartImage
          src={imageUrl}
          alt={t.name}
          gradient="linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)"
          style={{ width: '100%', height: '100%' }}
          imgStyle={{ objectFit: 'cover', objectPosition: 'center top' }}
          emoji={null}
        />

        {/* Fallback SVG shown if SmartImage fails (it handles this internally) */}
        {/* Available badge */}
        {t.available
          ? <span className="therapist-avail-badge">● Available</span>
          : <span className="therapist-avail-badge" style={{ background: 'var(--earth-warm)' }}>Unavailable</span>
        }
      </div>

      <div className="therapist-body">
        <div className="therapist-name">{t.name}</div>
        <div className="therapist-role">{t.role} · {t.exp}</div>
        <div className="therapist-tags">
          {t.tags.map((tag, j) => (
            <span className={`tag ${t.tagClass}`} key={j}>{tag}</span>
          ))}
        </div>
        <div className="therapist-footer">
          <div className="therapist-rating">⭐ {t.rating}</div>
          <div className="therapist-fee">{t.fee} <small>/ session</small></div>
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
  const { getTherapistImage, loading: imgLoading } = useImages()

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
        <div className="therapists-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
          {unique.map((t) => (
            <TherapistCard
              key={t.id}
              t={t}
              getTherapistImage={getTherapistImage}
              
              onBook={() => navigate('/book', { therapist: t })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}