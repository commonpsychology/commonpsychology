// src/data/sharedTherapists.js
// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for therapist display data across the entire app.
// Used by: Therapists.jsx (home section), TherapistsPage.jsx, BookingPage.jsx
//
// To update a therapist's info, change it HERE — all pages stay in sync.
// avatar_url: use a full URL (Unsplash/CDN) or a relative path to /api/uploads/
// ─────────────────────────────────────────────────────────────────────────────

export const SHARED_THERAPISTS = [
  {
    id: 1,
    full_name: 'Dr. Priya Sharma',
    license_type: 'Clinical Psychologist',
    experience_years: 8,
    consultation_fee: 2500,
    specializations: ['Anxiety', 'Depression', 'CBT'],
    rating: 4.9,
    total_reviews: 87,
    is_available: true,
    bio: 'Dr. Priya specializes in cognitive-behavioral therapy for anxiety and depression, with a warm, evidence-based approach tailored to Nepali cultural contexts.',
    avatar_url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=face',
    imgClass: 't1',
    tags: ['Anxiety', 'Depression', 'CBT'],
    tagClass: '',
    fee: 'NPR 2,500',
    exp: '8 yrs',
    role: 'Clinical Psychologist',
  },
  {
    id: 2,
    full_name: 'Mr. Arun Poudel',
    license_type: 'Counseling Therapist',
    experience_years: 5,
    consultation_fee: 1800,
    specializations: ['Relationships', 'Stress', 'Mindfulness'],
    rating: 4.7,
    total_reviews: 64,
    is_available: true,
    bio: 'Arun draws on mindfulness and humanistic traditions to help clients navigate relationship challenges and chronic stress.',
    avatar_url: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
    imgClass: 't2',
    tags: ['Relationships', 'Stress', 'Mindfulness'],
    tagClass: 'blue-tag',
    fee: 'NPR 1,800',
    exp: '5 yrs',
    role: 'Counseling Therapist',
  },
  {
    id: 3,
    full_name: 'Ms. Sita Tamang',
    license_type: 'Child & Family Therapist',
    experience_years: 6,
    consultation_fee: 2000,
    specializations: ['Child Therapy', 'Family', 'Trauma'],
    rating: 4.8,
    total_reviews: 49,
    is_available: false,
    bio: 'Sita works primarily with children and families, using play therapy and family systems approaches to address trauma and behavioral challenges.',
    avatar_url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
    imgClass: 't3',
    tags: ['Child Therapy', 'Family', 'Trauma'],
    tagClass: '',
    fee: 'NPR 2,000',
    exp: '6 yrs',
    role: 'Child & Family Therapist',
  },
  {
    id: 4,
    full_name: 'Dr. Suresh Adhikari',
    license_type: 'Psychiatrist',
    experience_years: 12,
    consultation_fee: 3000,
    specializations: ['Medication', 'Bipolar', 'Schizophrenia'],
    rating: 4.7,
    total_reviews: 52,
    is_available: true,
    bio: 'Dr. Suresh is a board-certified psychiatrist offering medication management alongside psychotherapy for complex psychiatric conditions.',
    avatar_url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=face',
    imgClass: 't1',
    tags: ['Medication', 'Bipolar', 'Schizophrenia'],
    tagClass: 'blue-tag',
    fee: 'NPR 3,000',
    exp: '12 yrs',
    role: 'Psychiatrist',
  },
  {
    id: 5,
    full_name: 'Ms. Deepa Rai',
    license_type: 'Art Therapist',
    experience_years: 4,
    consultation_fee: 1600,
    specializations: ['Art Therapy', 'Trauma', 'Youth'],
    rating: 4.9,
    total_reviews: 41,
    is_available: true,
    bio: 'Deepa uses creative arts as a therapeutic medium, particularly effective for trauma processing and working with young people.',
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    imgClass: 't2',
    tags: ['Art Therapy', 'Trauma', 'Youth'],
    tagClass: '',
    fee: 'NPR 1,600',
    exp: '4 yrs',
    role: 'Art Therapist',
  },
  {
    id: 6,
    full_name: 'Mr. Bikash Thapa',
    license_type: 'Addiction Counselor',
    experience_years: 7,
    consultation_fee: 1700,
    specializations: ['Addiction', 'Recovery', 'CBT'],
    rating: 4.8,
    total_reviews: 63,
    is_available: false,
    bio: 'Bikash specializes in substance use disorders and behavioral addictions, combining CBT with motivational interviewing for lasting recovery.',
    avatar_url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
    imgClass: 't3',
    tags: ['Addiction', 'Recovery', 'CBT'],
    tagClass: 'blue-tag',
    fee: 'NPR 1,700',
    exp: '7 yrs',
    role: 'Addiction Counselor',
  },
]

// ── Helper: merge API data over static data (API wins for live fields) ────────
// Call this after fetching from the API to keep names/avatars consistent
// while updating live fields (availability, rating, fee).
export function mergeWithApiData(apiTherapists = []) {
  return SHARED_THERAPISTS.map(staticT => {
    const apiT = apiTherapists.find(a => a.id === staticT.id)
    if (!apiT) return staticT

    const pr = apiT.profiles || {}
    return {
      ...staticT,
      // Always preserve static display data (name, avatar, bio) as baseline,
      // but allow API to override if it has richer data
      full_name:         pr.full_name || apiT.full_name || staticT.full_name,
      avatar_url:        resolveApiAvatar(pr, apiT) || staticT.avatar_url,
      bio:               pr.bio || apiT.bio || staticT.bio,
      // Live fields — always take from API
      is_available:      apiT.is_available ?? staticT.is_available,
      rating:            apiT.rating ?? staticT.rating,
      total_reviews:     apiT.total_reviews ?? staticT.total_reviews,
      consultation_fee:  apiT.consultation_fee ?? staticT.consultation_fee,
      // Preserve original id so booking works
      _apiData:          apiT,
    }
  })
}

function resolveApiAvatar(pr, t) {
  const API_BASE = (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : '') || '${import.meta.env.VITE_API_URL}/api'
  let raw = t.avatar_url || pr.avatar_url || null
  if (!raw) return null
  if (typeof raw === 'string' && raw.trim().startsWith('[')) {
    try { raw = JSON.parse(raw)[0] } catch { return null }
  }
  if (typeof raw === 'string') raw = raw.replace(/^"+|"+$/g, '').trim()
  if (Array.isArray(raw)) raw = raw[0]
  if (!raw || typeof raw !== 'string') return null
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  const base = API_BASE.replace(/\/api\/?$/, '')
  return `${base}${raw}`
}
