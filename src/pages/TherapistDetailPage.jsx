import { useState } from 'react'
import { useRouter } from '../context/RouterContext'
import { SHARED_THERAPISTS as therapistsData } from '../data/sharedTherapists'
import TherapistDetailModal from '../components/TherapistDetailModal'

/* ── SVG Avatars ── */
function AvatarAnita() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="bgA1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8e6c9" />
          <stop offset="100%" stopColor="#81c784" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="80" fill="url(#bgA1)" />
      <rect x="52" y="118" width="56" height="40" rx="6" fill="white" />
      <ellipse cx="80" cy="148" rx="52" ry="30" fill="#e8f5e9" />
      <path d="M68 122 Q80 134 92 122" fill="none" stroke="#4caf50" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="80" cy="134" r="4" fill="none" stroke="#4caf50" strokeWidth="2" />
      <rect x="72" y="105" width="16" height="18" rx="6" fill="#f5cba7" />
      <ellipse cx="80" cy="88" rx="26" ry="28" fill="#f5cba7" />
      <ellipse cx="80" cy="68" rx="27" ry="16" fill="#3e2723" />
      <rect x="53" y="68" width="8" height="34" rx="4" fill="#3e2723" />
      <rect x="99" y="68" width="8" height="34" rx="4" fill="#3e2723" />
      <ellipse cx="71" cy="88" rx="4" ry="4.5" fill="white" />
      <ellipse cx="89" cy="88" rx="4" ry="4.5" fill="white" />
      <circle cx="72" cy="88" r="2.5" fill="#3e2723" />
      <circle cx="90" cy="88" r="2.5" fill="#3e2723" />
      <circle cx="72.8" cy="87.2" r="0.8" fill="white" />
      <circle cx="90.8" cy="87.2" r="0.8" fill="white" />
      <path d="M66 82 Q71 80 76 82" fill="none" stroke="#3e2723" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M84 82 Q89 80 94 82" fill="none" stroke="#3e2723" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M78 93 Q80 97 82 93" fill="none" stroke="#c49a6c" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M73 100 Q80 106 87 100" fill="none" stroke="#c0704a" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="80" cy="79" r="2" fill="#e53935" />
    </svg>
  )
}

function AvatarRoshan() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="bgA2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#bbdefb" />
          <stop offset="100%" stopColor="#64b5f6" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="80" fill="url(#bgA2)" />
      <ellipse cx="80" cy="150" rx="52" ry="28" fill="#1a237e" />
      <rect x="52" y="118" width="56" height="40" rx="4" fill="#1565c0" />
      <polygon points="80,118 75,128 80,148 85,128" fill="#e53935" />
      <polygon points="72,118 80,126 88,118 84,112 76,112" fill="white" />
      <rect x="72" y="104" width="16" height="18" rx="6" fill="#d4a574" />
      <ellipse cx="80" cy="86" rx="27" ry="29" fill="#d4a574" />
      <ellipse cx="80" cy="66" rx="27" ry="13" fill="#212121" />
      <ellipse cx="53" cy="88" rx="4" ry="6" fill="#c49a6c" />
      <ellipse cx="107" cy="88" rx="4" ry="6" fill="#c49a6c" />
      <ellipse cx="70" cy="87" rx="4.5" ry="4.5" fill="white" />
      <ellipse cx="90" cy="87" rx="4.5" ry="4.5" fill="white" />
      <circle cx="71" cy="87" r="2.8" fill="#212121" />
      <circle cx="91" cy="87" r="2.8" fill="#212121" />
      <circle cx="71.8" cy="86.2" r="0.9" fill="white" />
      <circle cx="91.8" cy="86.2" r="0.9" fill="white" />
      <path d="M65 81 Q70 78 75 81" fill="none" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
      <path d="M85 81 Q90 78 95 81" fill="none" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
      <path d="M77 93 Q80 98 83 93" fill="none" stroke="#b07a4c" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M73 100 Q80 107 87 100" fill="none" stroke="#b07a4c" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="62" y="83" width="15" height="10" rx="4" fill="none" stroke="#1565c0" strokeWidth="1.5" />
      <rect x="83" y="83" width="15" height="10" rx="4" fill="none" stroke="#1565c0" strokeWidth="1.5" />
      <line x1="77" y1="87" x2="83" y2="87" stroke="#1565c0" strokeWidth="1.5" />
    </svg>
  )
}

function AvatarPriya() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="bgA3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="100%" stopColor="#f9a825" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="80" fill="url(#bgA3)" />
      <ellipse cx="80" cy="150" rx="52" ry="28" fill="#e91e63" />
      <rect x="52" y="118" width="56" height="40" rx="6" fill="#e91e63" />
      <circle cx="80" cy="128" r="4" fill="#f48fb1" opacity="0.6" />
      <circle cx="68" cy="134" r="3" fill="#f48fb1" opacity="0.5" />
      <circle cx="92" cy="134" r="3" fill="#f48fb1" opacity="0.5" />
      <rect x="72" y="104" width="16" height="18" rx="6" fill="#f5cba7" />
      <ellipse cx="80" cy="87" rx="26" ry="28" fill="#f5cba7" />
      <ellipse cx="80" cy="67" rx="26" ry="14" fill="#4a148c" />
      <ellipse cx="80" cy="56" rx="13" ry="12" fill="#4a148c" />
      <circle cx="80" cy="46" r="7" fill="#7b1fa2" />
      <rect x="54" y="67" width="7" height="28" rx="3" fill="#4a148c" />
      <rect x="99" y="67" width="7" height="28" rx="3" fill="#4a148c" />
      <ellipse cx="71" cy="88" rx="4" ry="4.5" fill="white" />
      <ellipse cx="89" cy="88" rx="4" ry="4.5" fill="white" />
      <circle cx="72" cy="88" r="2.8" fill="#4a148c" />
      <circle cx="90" cy="88" r="2.8" fill="#4a148c" />
      <circle cx="72.8" cy="87.2" r="0.9" fill="white" />
      <circle cx="90.8" cy="87.2" r="0.9" fill="white" />
      <path d="M66 82 Q71 79 76 82" fill="none" stroke="#4a148c" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M84 82 Q89 79 94 82" fill="none" stroke="#4a148c" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M78 93 Q80 97 82 93" fill="none" stroke="#c49a6c" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M72 101 Q80 109 88 101" fill="none" stroke="#c0704a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="79" r="2.2" fill="#e91e63" />
      <circle cx="54" cy="92" r="3" fill="#f9a825" stroke="#e91e63" strokeWidth="1" />
      <circle cx="106" cy="92" r="3" fill="#f9a825" stroke="#e91e63" strokeWidth="1" />
    </svg>
  )
}

function AvatarSuresh() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="bgA4" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c8e6c9" />
          <stop offset="100%" stopColor="#66bb6a" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="80" fill="url(#bgA4)" />
      <ellipse cx="80" cy="150" rx="52" ry="28" fill="#1b5e20" />
      <rect x="52" y="118" width="56" height="40" rx="4" fill="#2e7d32" />
      <path d="M65 122 Q80 136 95 122" fill="none" stroke="#a5d6a7" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="80" cy="136" r="5" fill="none" stroke="#a5d6a7" strokeWidth="2" />
      <polygon points="72,118 80,126 88,118 84,112 76,112" fill="white" />
      <rect x="72" y="104" width="16" height="18" rx="6" fill="#d4a574" />
      <ellipse cx="80" cy="86" rx="27" ry="29" fill="#d4a574" />
      <ellipse cx="80" cy="66" rx="27" ry="13" fill="#37474f" />
      <rect x="53" y="66" width="8" height="28" rx="4" fill="#37474f" />
      <rect x="99" y="66" width="8" height="28" rx="4" fill="#37474f" />
      <rect x="53" y="66" width="4" height="14" rx="2" fill="#90a4ae" />
      <rect x="103" y="66" width="4" height="14" rx="2" fill="#90a4ae" />
      <ellipse cx="53" cy="88" rx="4" ry="6" fill="#c49a6c" />
      <ellipse cx="107" cy="88" rx="4" ry="6" fill="#c49a6c" />
      <ellipse cx="70" cy="87" rx="4.5" ry="4.5" fill="white" />
      <ellipse cx="90" cy="87" rx="4.5" ry="4.5" fill="white" />
      <circle cx="71" cy="87" r="2.8" fill="#1a1a1a" />
      <circle cx="91" cy="87" r="2.8" fill="#1a1a1a" />
      <circle cx="71.8" cy="86.2" r="0.9" fill="white" />
      <circle cx="91.8" cy="86.2" r="0.9" fill="white" />
      <path d="M65 81 Q70 78 75 81" fill="none" stroke="#37474f" strokeWidth="2" strokeLinecap="round" />
      <path d="M85 81 Q90 78 95 81" fill="none" stroke="#37474f" strokeWidth="2" strokeLinecap="round" />
      <path d="M77 93 Q80 98 83 93" fill="none" stroke="#b07a4c" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M73 99 Q80 106 87 99" fill="none" stroke="#b07a4c" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function AvatarDeepa() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="bgA5" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe0b2" />
          <stop offset="100%" stopColor="#ffb74d" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="80" fill="url(#bgA5)" />
      <ellipse cx="80" cy="150" rx="52" ry="28" fill="#6a1b9a" />
      <rect x="52" y="118" width="56" height="40" rx="6" fill="#7b1fa2" />
      <circle cx="68" cy="128" r="4" fill="#ef5350" opacity="0.7" />
      <circle cx="80" cy="124" r="4" fill="#42a5f5" opacity="0.7" />
      <circle cx="92" cy="128" r="4" fill="#66bb6a" opacity="0.7" />
      <rect x="72" y="104" width="16" height="18" rx="6" fill="#f5cba7" />
      <ellipse cx="80" cy="87" rx="26" ry="28" fill="#f5cba7" />
      <ellipse cx="80" cy="67" rx="26" ry="14" fill="#4e342e" />
      <circle cx="58" cy="72" r="9" fill="#4e342e" />
      <circle cx="102" cy="72" r="9" fill="#4e342e" />
      <circle cx="66" cy="62" r="8" fill="#4e342e" />
      <circle cx="94" cy="62" r="8" fill="#4e342e" />
      <circle cx="80" cy="58" r="9" fill="#4e342e" />
      <ellipse cx="71" cy="88" rx="4" ry="4.5" fill="white" />
      <ellipse cx="89" cy="88" rx="4" ry="4.5" fill="white" />
      <circle cx="72" cy="88" r="2.8" fill="#4e342e" />
      <circle cx="90" cy="88" r="2.8" fill="#4e342e" />
      <circle cx="72.8" cy="87.2" r="0.9" fill="white" />
      <circle cx="90.8" cy="87.2" r="0.9" fill="white" />
      <path d="M66 82 Q71 79 76 82" fill="none" stroke="#4e342e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M84 82 Q89 79 94 82" fill="none" stroke="#4e342e" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M78 93 Q80 97 82 93" fill="none" stroke="#c49a6c" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M72 101 Q80 108 88 101" fill="none" stroke="#c0704a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="79" r="2" fill="#e91e63" />
      <rect x="103" y="74" width="3" height="18" rx="1.5" fill="#ffb74d" />
      <ellipse cx="104.5" cy="73" rx="2" ry="3" fill="#ef5350" />
    </svg>
  )
}

function AvatarBikash() {
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <defs>
        <radialGradient id="bgA6" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#b3e5fc" />
          <stop offset="100%" stopColor="#4fc3f7" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="80" fill="url(#bgA6)" />
      <ellipse cx="80" cy="150" rx="52" ry="28" fill="#01579b" />
      <rect x="52" y="118" width="56" height="40" rx="4" fill="#0277bd" />
      <polygon points="72,118 80,126 88,118 84,112 76,112" fill="#e3f2fd" />
      <rect x="72" y="104" width="16" height="18" rx="6" fill="#d4a574" />
      <ellipse cx="80" cy="86" rx="27" ry="29" fill="#d4a574" />
      <ellipse cx="80" cy="66" rx="27" ry="13" fill="#1a1a1a" />
      <ellipse cx="53" cy="88" rx="4" ry="6" fill="#c49a6c" />
      <ellipse cx="107" cy="88" rx="4" ry="6" fill="#c49a6c" />
      <path d="M57 100 Q65 112 80 114 Q95 112 103 100 Q100 96 80 96 Q60 96 57 100Z" fill="#212121" opacity="0.5" />
      <ellipse cx="70" cy="87" rx="4.5" ry="4.5" fill="white" />
      <ellipse cx="90" cy="87" rx="4.5" ry="4.5" fill="white" />
      <circle cx="71" cy="87" r="2.8" fill="#1a1a1a" />
      <circle cx="91" cy="87" r="2.8" fill="#1a1a1a" />
      <circle cx="71.8" cy="86.2" r="0.9" fill="white" />
      <circle cx="91.8" cy="86.2" r="0.9" fill="white" />
      <path d="M65 81 Q70 78 75 81" fill="none" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
      <path d="M85 81 Q90 78 95 81" fill="none" stroke="#212121" strokeWidth="2" strokeLinecap="round" />
      <path d="M77 93 Q80 98 83 93" fill="none" stroke="#b07a4c" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M73 101 Q80 108 87 101" fill="none" stroke="#b07a4c" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/* ── Avatar lookup ── */
const avatarMap = {
  'Dr. Anita Shrestha': AvatarAnita,
  'Mr. Roshan Karki': AvatarRoshan,
  'Ms. Priya Tamang': AvatarPriya,
  'Dr. Suresh Adhikari': AvatarSuresh,
  'Ms. Deepa Rai': AvatarDeepa,
  'Mr. Bikash Thapa': AvatarBikash,
}

/* ── Static extra therapists ── */
const extraTherapists = [
  {
    id: 4,
    name: 'Dr. Suresh Adhikari',
    role: 'Psychiatrist',
    imgClass: 't1',
    tags: ['Medication', 'Bipolar', 'Schizophrenia'],
    tagClass: 'blue-tag',
    rating: '4.7',
    reviews: 52,
    fee: 'NPR 3,000',
    available: true,
    exp: '12 yrs',
    bio: 'Dr. Suresh is a board-certified psychiatrist offering medication management alongside psychotherapy.',
  },
  {
    id: 5,
    name: 'Ms. Deepa Rai',
    role: 'Art Therapist',
    imgClass: 't2',
    tags: ['Art Therapy', 'Trauma', 'Youth'],
    tagClass: '',
    rating: '4.9',
    reviews: 41,
    fee: 'NPR 1,600',
    available: true,
    exp: '4 yrs',
    bio: 'Deepa uses creative arts as a therapeutic medium, particularly effective for trauma and non-verbal processing.',
  },
  {
    id: 6,
    name: 'Mr. Bikash Thapa',
    role: 'Addiction Counselor',
    imgClass: 't3',
    tags: ['Addiction', 'Recovery', 'CBT'],
    tagClass: 'blue-tag',
    rating: '4.8',
    reviews: 63,
    fee: 'NPR 1,700',
    available: false,
    exp: '7 yrs',
    bio: 'Bikash specializes in substance use disorders and behavioral addictions, using motivational interviewing.',
  },
]

/* ── Page component ── */
export default function TherapistsPage() {
  const { navigate } = useRouter()
  const [selectedTherapist, setSelectedTherapist] = useState(null)

  // Merge shared + extra, deduplicate by id
  const therapists = [...therapistsData, ...extraTherapists].filter(
    (t, i, arr) => arr.findIndex(x => x.id === t.id) === i
  )

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
        <div className="therapists-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {therapists.map((t) => {
            const Avatar = avatarMap[t.name]
            return (
              <div
                key={t.id}
                className="therapist-card"
                onClick={() => setSelectedTherapist(t)}
                style={{ cursor: 'pointer' }}
              >
                <div
                  className={`therapist-img ${t.imgClass}`}
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', alignItems: 'stretch', justifyContent: 'stretch' }}
                >
                  {Avatar
                    ? <Avatar />
                    : <span style={{ fontSize: '3rem', margin: 'auto' }}>{t.emoji}</span>
                  }
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
                      <span key={j} className={`tag ${t.tagClass}`}>{tag}</span>
                    ))}
                  </div>
                  <div className="therapist-footer">
                    <div className="therapist-rating">⭐ {t.rating}</div>
                    <div className="therapist-fee">{t.fee} <small>/ session</small></div>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem', justifyContent: 'center' }}
                    onClick={(e) => { e.stopPropagation(); navigate('/book', { therapist: t }) }}
                  >
                    Book Session
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail modal — rendered once, outside the grid */}
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