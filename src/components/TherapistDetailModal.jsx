import { useState, useEffect } from 'react'

/* ─── Avatar components (inline SVG) ─── */
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
      <rect x="72" y="104" width="16" height="18" rx="6" fill="#f5cba7" />
      <ellipse cx="80" cy="87" rx="26" ry="28" fill="#f5cba7" />
      <ellipse cx="80" cy="67" rx="26" ry="14" fill="#4a148c" />
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
      <path d="M72 101 Q80 109 88 101" fill="none" stroke="#c0704a" strokeWidth="2" strokeLinecap="round" />
      <circle cx="80" cy="79" r="2.2" fill="#e91e63" />
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
      <rect x="72" y="104" width="16" height="18" rx="6" fill="#d4a574" />
      <ellipse cx="80" cy="86" rx="27" ry="29" fill="#d4a574" />
      <ellipse cx="80" cy="66" rx="27" ry="13" fill="#37474f" />
      <rect x="53" y="66" width="8" height="28" rx="4" fill="#37474f" />
      <rect x="99" y="66" width="8" height="28" rx="4" fill="#37474f" />
      <rect x="53" y="66" width="4" height="14" rx="2" fill="#90a4ae" />
      <rect x="103" y="66" width="4" height="14" rx="2" fill="#90a4ae" />
      <ellipse cx="70" cy="87" rx="4.5" ry="4.5" fill="white" />
      <ellipse cx="90" cy="87" rx="4.5" ry="4.5" fill="white" />
      <circle cx="71" cy="87" r="2.8" fill="#1a1a1a" />
      <circle cx="91" cy="87" r="2.8" fill="#1a1a1a" />
      <path d="M65 81 Q70 78 75 81" fill="none" stroke="#37474f" strokeWidth="2" strokeLinecap="round" />
      <path d="M85 81 Q90 78 95 81" fill="none" stroke="#37474f" strokeWidth="2" strokeLinecap="round" />
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
      <path d="M72 101 Q80 108 88 101" fill="none" stroke="#c0704a" strokeWidth="2" strokeLinecap="round" />
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
      <path d="M57 100 Q65 112 80 114 Q95 112 103 100 Q100 96 80 96 Q60 96 57 100Z" fill="#212121" opacity="0.5" />
      <ellipse cx="70" cy="87" rx="4.5" ry="4.5" fill="white" />
      <ellipse cx="90" cy="87" rx="4.5" ry="4.5" fill="white" />
      <circle cx="71" cy="87" r="2.8" fill="#1a1a1a" />
      <circle cx="91" cy="87" r="2.8" fill="#1a1a1a" />
      <path d="M73 101 Q80 108 87 101" fill="none" stroke="#b07a4c" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const AVATAR_MAP = {
  'Dr. Anita Shrestha': AvatarAnita,
  'Mr. Roshan Karki': AvatarRoshan,
  'Ms. Priya Tamang': AvatarPriya,
  'Dr. Suresh Adhikari': AvatarSuresh,
  'Ms. Deepa Rai': AvatarDeepa,
  'Mr. Bikash Thapa': AvatarBikash,
}

/* ─── Fallback initials avatar for DB therapists ─── */
function InitialsAvatar({ name }) {
  const initials = (name || 'T').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const palettes = [
    ['#c8e6c9', '#1b5e20'], ['#bbdefb', '#0d47a1'], ['#fff9c4', '#e65100'],
    ['#f8bbd0', '#880e4f'], ['#ffe0b2', '#bf360c'], ['#b3e5fc', '#01579b'],
  ]
  const [bg, fg] = palettes[(name?.charCodeAt(0) || 0) % palettes.length]
  return (
    <svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <circle cx="80" cy="80" r="80" fill={bg} />
      <text x="80" y="95" textAnchor="middle" fontSize="52" fontWeight="700" fontFamily="sans-serif" fill={fg}>{initials}</text>
    </svg>
  )
}

/* ─── Helper: get avatar for any therapist object ─── */
function getAvatar(therapist) {
  const name = therapist?.full_name || therapist?.name || ''
  const AvatarComp = AVATAR_MAP[name]
  if (AvatarComp) return <AvatarComp />
  // Try to use photo from DB
  const url = therapist?.avatar_url
  if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
    return <img src={url} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
  }
  return <InitialsAvatar name={name} />
}

/* ─── Hero gradient colours per therapist ─── */
const HERO_GRADIENTS = [
  'linear-gradient(135deg, #e6f1fb 0%, #b5d4f4 50%, #85b7eb 100%)',
  'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 50%, #66bb6a 100%)',
  'linear-gradient(135deg, #fff8e1 0%, #ffe082 50%, #ffd54f 100%)',
  'linear-gradient(135deg, #fce4ec 0%, #f48fb1 50%, #ec407a 80%)',
  'linear-gradient(135deg, #fff3e0 0%, #ffcc80 50%, #ffa726 100%)',
  'linear-gradient(135deg, #e1f5fe 0%, #81d4fa 50%, #29b6f6 100%)',
]

/* ─── Static extra data for the 6 known therapists ─── */
const EXTENDED_DATA = {
  'Dr. Anita Shrestha': {
    bio: 'Dr. Anita Shrestha is a licensed clinical psychologist with over 8 years of experience helping individuals navigate anxiety, depression, and life transitions. She combines evidence-based CBT with mindfulness and a warm, culturally sensitive approach. Her practice emphasises building lasting coping skills and genuine self-awareness.',
    methods: ['Cognitive Behavioral Therapy', 'Mindfulness-Based Stress Reduction', 'Solution-Focused Therapy'],
    languages: ['Nepali', 'English', 'Hindi'],
    schedule: ['Mon', 'Tue', 'Wed', 'Fri'],
    education: [
      { deg: 'Ph.D. Clinical Psychology', inst: 'Tribhuvan University, 2015' },
      { deg: 'M.Sc. Psychology', inst: 'Patan Multiple Campus, 2011' },
    ],
  },
  'Mr. Roshan Karki': {
    bio: 'Roshan brings a humanistic and narrative approach, helping clients rewrite their personal stories in empowering ways. He specialises in relationship counselling and trauma-informed care, creating a non-judgmental space where clients feel heard and respected.',
    methods: ['Narrative Therapy', 'Acceptance & Commitment Therapy', 'EMDR'],
    languages: ['Nepali', 'English'],
    schedule: ['Mon', 'Thu', 'Fri', 'Sat'],
    education: [
      { deg: 'M.A. Counseling Psychology', inst: 'Kathmandu University, 2018' },
      { deg: 'B.A. Psychology', inst: 'Prithivi Narayan Campus, 2015' },
    ],
  },
  'Ms. Priya Tamang': {
    bio: 'Priya specialises in supporting children and teenagers through emotional and developmental challenges. Her play-therapy approach meets young clients where they are. She also works closely with families to create supportive home environments.',
    methods: ['Play Therapy', 'Family Systems Therapy', 'DBT'],
    languages: ['Nepali', 'English', 'Tamang'],
    schedule: ['Tue', 'Wed', 'Sat'],
    education: [
      { deg: 'M.Sc. Child Psychology', inst: 'Mahendra Ratna Campus, 2017' },
      { deg: 'Certificate in Play Therapy', inst: 'IAPT, India, 2019' },
    ],
  },
  'Dr. Suresh Adhikari': {
    bio: 'Dr. Suresh is a board-certified psychiatrist with over a decade of clinical experience. He integrates medication management with psychoeducation to treat complex conditions including bipolar disorder and schizophrenia, helping clients and families fully understand their treatment.',
    methods: ['Pharmacotherapy', 'Integrative Psychiatry', 'Psychoeducation'],
    languages: ['Nepali', 'English'],
    schedule: ['Mon', 'Wed', 'Thu'],
    education: [
      { deg: 'M.D. Psychiatry', inst: 'B.P. Koirala Institute, 2011' },
      { deg: 'M.B.B.S.', inst: 'KIST Medical College, 2006' },
    ],
  },
  'Ms. Deepa Rai': {
    bio: 'Deepa uses creative arts as a therapeutic medium, enabling clients to process emotions beyond what words can reach. Particularly effective with trauma survivors and young people, her sessions combine visual art, movement, and storytelling in a safe, exploratory environment.',
    methods: ['Expressive Arts Therapy', 'Trauma-Informed Care', 'Somatic Therapy'],
    languages: ['Nepali', 'English', 'Rai'],
    schedule: ['Tue', 'Thu', 'Sat', 'Sun'],
    education: [
      { deg: 'M.A. Art Therapy', inst: 'Sikkim Manipal University, 2019' },
      { deg: 'B.F.A.', inst: 'Lalit Kala Campus, 2016' },
    ],
  },
  'Mr. Bikash Thapa': {
    bio: 'Bikash specialises in substance use disorders and behavioural addictions, drawing on motivational interviewing and relapse-prevention strategies. With 7 years in the field, he meets clients with compassion and zero judgment, focusing on sustainable recovery.',
    methods: ['Motivational Interviewing', 'Relapse Prevention', '12-Step Facilitation'],
    languages: ['Nepali', 'English'],
    schedule: ['Mon', 'Wed', 'Fri'],
    education: [
      { deg: 'M.A. Social Work (Addiction Studies)', inst: 'Tribhuvan University, 2016' },
      { deg: 'Certified Addiction Counselor', inst: 'NAADAC, 2018' },
    ],
  },
}

const ALL_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/* ══════════════════════════════════════════
   THERAPIST DETAIL MODAL
   ══════════════════════════════════════════ */
export default function TherapistDetailModal({ therapist, onClose, onBook }) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Keyboard close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!therapist) return null

  /* ── Normalise data: works with both DB shape and static shape ── */
  const name       = therapist.full_name   || therapist.name   || 'Unknown'
  const role       = therapist.license_type || therapist.role   || ''
  const expYears   = therapist.experience_years != null
                       ? `${therapist.experience_years} yrs`
                       : (therapist.exp || '—')
  const fee        = therapist.consultation_fee
                       ? `NPR ${Number(therapist.consultation_fee).toLocaleString()}`
                       : (therapist.fee || '—')
  const rating     = therapist.rating
                       ? Number(therapist.rating).toFixed(1)
                       : (therapist.rating || 'New')
  const reviews    = therapist.review_count || therapist.reviews || 0
  const isAvailable = therapist.is_available ?? therapist.available ?? false
  const tags       = therapist.specializations || therapist.tags || []

  // Merge with extended static data (fallback if DB doesn't have it)
  const extra      = EXTENDED_DATA[name] || {}
  const bio        = therapist.bio        || extra.bio        || 'Experienced mental health professional committed to culturally sensitive care.'
  const methods    = therapist.methods    || extra.methods    || []
  const languages  = therapist.languages  || extra.languages  || ['Nepali', 'English']
  const schedule   = therapist.schedule   || extra.schedule   || []
  const education  = therapist.education  || extra.education  || []

  // Pick hero gradient by name hash
  const gradIdx    = (name.charCodeAt(0) || 0) % HERO_GRADIENTS.length
  const heroGrad   = HERO_GRADIENTS[gradIdx]

  return (
    <>
      {/* ── Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

        .tdm-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(4, 44, 83, 0.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1rem;
          animation: tdm-fade-in .22s ease;
        }
        @keyframes tdm-fade-in { from { opacity:0 } to { opacity:1 } }

        .tdm-modal {
          background: #ffffff;
          border-radius: 24px;
          width: 100%; max-width: 660px;
          max-height: 92vh;
          overflow-y: auto;
          position: relative;
          animation: tdm-slide-up .28s cubic-bezier(.22,1,.36,1);
          box-shadow: 0 32px 80px rgba(4,44,83,.22), 0 8px 24px rgba(4,44,83,.12);
          scrollbar-width: thin;
          scrollbar-color: #b5d4f4 transparent;
        }
        .tdm-modal::-webkit-scrollbar { width: 4px }
        .tdm-modal::-webkit-scrollbar-thumb { background: #b5d4f4; border-radius: 4px }
        @keyframes tdm-slide-up {
          from { opacity:0; transform: translateY(28px) scale(.98) }
          to   { opacity:1; transform: translateY(0)    scale(1)   }
        }

        .tdm-close {
          position: absolute; top: 14px; right: 14px; z-index: 10;
          width: 34px; height: 34px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,.6);
          background: rgba(255,255,255,.25);
          backdrop-filter: blur(8px);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; color: #042c53;
          transition: background .15s, transform .15s;
          font-family: inherit;
        }
        .tdm-close:hover { background: rgba(255,255,255,.5); transform: scale(1.08) }
        .tdm-close:active { transform: scale(.95) }

        .tdm-hero {
          height: 210px; position: relative; overflow: hidden;
          border-radius: 24px 24px 0 0;
        }
        .tdm-hero-bg {
          position: absolute; inset: 0;
        }
        .tdm-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(255,255,255,.96) 38%, rgba(255,255,255,.1) 100%);
        }
        .tdm-hero-avatar {
          position: absolute; right: 0; bottom: 0;
          width: 210px; height: 210px;
        }
        .tdm-hero-content {
          position: relative; z-index: 2;
          padding: 2rem 2rem 1.5rem;
          display: flex; flex-direction: column; gap: .35rem;
          height: 100%; justify-content: center;
        }
        .tdm-avail-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; letter-spacing: .04em;
          padding: 3px 11px; border-radius: 20px; width: fit-content;
          font-family: 'DM Sans', sans-serif;
        }
        .tdm-avail-yes { background: #e1f5ee; color: #0a5e46; border: 1px solid #9fe1cb }
        .tdm-avail-no  { background: #faeeda; color: #7a4510; border: 1px solid #f9c974 }
        .tdm-hero-name {
          font-family: 'DM Serif Display', serif;
          font-size: 28px; color: #042c53; line-height: 1.15;
        }
        .tdm-hero-role {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; color: #185fa5; font-weight: 500;
        }
        .tdm-hero-exp {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; color: #378add; font-weight: 400;
        }

        .tdm-body { padding: 1.5rem 2rem 2rem; font-family: 'DM Sans', sans-serif; }

        .tdm-stats {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 10px;
          margin-bottom: 1.5rem;
        }
        .tdm-stat {
          background: #f0f7ff; border: 1px solid #deedf9;
          border-radius: 14px; padding: .85rem 1rem; text-align: center;
        }
        .tdm-stat-val {
          font-size: 20px; font-weight: 700; color: #042c53;
          font-family: 'DM Serif Display', serif; line-height: 1;
        }
        .tdm-stat-lbl {
          font-size: 11px; color: #5a8ab0; margin-top: 4px;
          letter-spacing: .04em; text-transform: uppercase;
        }

        .tdm-section-head {
          font-size: 11px; color: #8aafcc;
          letter-spacing: .08em; text-transform: uppercase;
          margin-bottom: .6rem; margin-top: 1.4rem; font-weight: 600;
        }
        .tdm-bio {
          font-size: 14px; color: #334e68; line-height: 1.75;
        }
        .tdm-tags { display: flex; flex-wrap: wrap; gap: 7px; }
        .tdm-tag {
          font-size: 12px; padding: 4px 12px; border-radius: 20px;
          background: #e6f1fb; color: #185fa5;
          border: 1px solid #b5d4f4; font-weight: 500;
        }
        .tdm-tag.green {
          background: #eaf3de; color: #3b6d11; border-color: #c0dd97;
        }
        .tdm-tag.amber {
          background: #faeeda; color: #854f0b; border-color: #fac775;
        }

        .tdm-divider {
          height: 1px; background: #e8f0f8; margin: 1.4rem 0;
        }

        .tdm-edu-item {
          display: flex; gap: 12px; align-items: flex-start;
          padding: .6rem 0;
          border-bottom: 1px solid #f0f7ff;
        }
        .tdm-edu-item:last-child { border-bottom: none }
        .tdm-edu-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: linear-gradient(135deg, #e6f1fb, #b5d4f4);
          display: flex; align-items: center; justify-content: center;
          font-size: 15px; flex-shrink: 0;
        }
        .tdm-edu-deg { font-size: 13px; font-weight: 600; color: #042c53; }
        .tdm-edu-inst { font-size: 12px; color: #5a8ab0; margin-top: 2px; }

        .tdm-days { display: flex; flex-wrap: wrap; gap: 7px; }
        .tdm-day {
          font-size: 12px; padding: 5px 12px; border-radius: 8px;
          border: 1px solid #dde8f5; color: #8aafcc; font-weight: 500;
        }
        .tdm-day.active {
          background: #e6f1fb; border-color: #85b7eb; color: #185fa5;
        }

        .tdm-lang-pill {
          font-size: 12px; padding: 4px 12px; border-radius: 20px;
          background: #f5f9ff; color: #5a8ab0;
          border: 1px solid #dde8f5;
        }

        .tdm-bottom-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
        }

        .tdm-book-btn {
          width: 100%; margin-top: 1.75rem;
          padding: 15px; border-radius: 14px; border: none;
          background: linear-gradient(135deg, #0c447c 0%, #185fa5 50%, #378add 100%);
          color: white; font-size: 15px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          letter-spacing: .02em;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 6px 20px rgba(24,95,165,.35);
        }
        .tdm-book-btn:hover {
          opacity: .93; transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(24,95,165,.4);
        }
        .tdm-book-btn:active { transform: scale(.99); }

        @media (max-width: 520px) {
          .tdm-modal { border-radius: 18px; }
          .tdm-hero  { height: 180px; }
          .tdm-hero-avatar { width: 170px; height: 170px; }
          .tdm-hero-name { font-size: 22px; }
          .tdm-body { padding: 1.25rem 1.25rem 1.75rem; }
          .tdm-stats { grid-template-columns: repeat(3,1fr); gap: 7px; }
          .tdm-stat-val { font-size: 17px; }
          .tdm-bottom-row { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>

      {/* ── Overlay (click outside to close) ── */}
      <div
        className="tdm-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={`Profile of ${name}`}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="tdm-modal">

          {/* Close button */}
          <button className="tdm-close" onClick={onClose} aria-label="Close">✕</button>

          {/* ── Hero ── */}
          <div className="tdm-hero">
            <div className="tdm-hero-bg" style={{ background: heroGrad }} />
            <div className="tdm-hero-overlay" />
            <div className="tdm-hero-avatar">{getAvatar(therapist)}</div>
            <div className="tdm-hero-content">
              <span className={`tdm-avail-badge ${isAvailable ? 'tdm-avail-yes' : 'tdm-avail-no'}`}>
                {isAvailable ? '● Available' : '◌ Unavailable'}
              </span>
              <div className="tdm-hero-name">{name}</div>
              <div className="tdm-hero-role">{role}</div>
              {expYears !== '—' && <div className="tdm-hero-exp">{expYears} of practice</div>}
            </div>
          </div>

          {/* ── Body ── */}
          <div className="tdm-body">

            {/* Stats row */}
            <div className="tdm-stats">
              <div className="tdm-stat">
                <div className="tdm-stat-val">⭐ {rating}</div>
                <div className="tdm-stat-lbl">Rating{reviews ? ` · ${reviews}` : ''}</div>
              </div>
              <div className="tdm-stat">
                <div className="tdm-stat-val">{expYears}</div>
                <div className="tdm-stat-lbl">Experience</div>
              </div>
              <div className="tdm-stat">
                <div className="tdm-stat-val" style={{ fontSize: fee.length > 9 ? 14 : 20 }}>{fee}</div>
                <div className="tdm-stat-lbl">Per session</div>
              </div>
            </div>

            {/* Bio */}
            <div className="tdm-section-head">About</div>
            <p className="tdm-bio">{bio}</p>

            {/* Specialisations */}
            {tags.length > 0 && (
              <>
                <div className="tdm-section-head">Specializations</div>
                <div className="tdm-tags">
                  {tags.map((tag, i) => <span className="tdm-tag" key={i}>{tag}</span>)}
                </div>
              </>
            )}

            {/* Methods */}
            {methods.length > 0 && (
              <>
                <div className="tdm-section-head">Approach & Methods</div>
                <div className="tdm-tags">
                  {methods.map((m, i) => <span className="tdm-tag green" key={i}>{m}</span>)}
                </div>
              </>
            )}

            <div className="tdm-divider" />

            {/* Education */}
            {education.length > 0 && (
              <>
                <div className="tdm-section-head">Education</div>
                {education.map((e, i) => (
                  <div className="tdm-edu-item" key={i}>
                    <div className="tdm-edu-icon">🎓</div>
                    <div>
                      <div className="tdm-edu-deg">{e.deg}</div>
                      <div className="tdm-edu-inst">{e.inst}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="tdm-divider" />

            {/* Languages + Schedule */}
            <div className="tdm-bottom-row">
              <div>
                <div className="tdm-section-head">Languages</div>
                <div className="tdm-tags">
                  {languages.map((l, i) => (
                    <span className="tdm-lang-pill" key={i}>{l}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="tdm-section-head">Available Days</div>
                <div className="tdm-days">
                  {ALL_DAYS.map(d => (
                    <span key={d} className={`tdm-day ${schedule.includes(d) ? 'active' : ''}`}>{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Book CTA */}
            <button
              className="tdm-book-btn"
              onClick={() => onBook && onBook(therapist)}
            >
              Book a Session with {name.split(' ')[1] || name}
            </button>

          </div>
        </div>
      </div>
    </>
  )
}