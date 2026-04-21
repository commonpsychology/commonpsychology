// src/context/TherapistsContext.jsx
// Fetches from GET /api/therapists once, shares across all pages.
// Handles the joined shape: therapist row + profiles:user_id nested object.

import { createContext, useContext, useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const TherapistsContext = createContext(null)

export function TherapistsProvider({ children }) {
  const [therapists, setTherapists] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/therapists?limit=50`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        const list = data.therapists || data.data || []
        setTherapists(list.map(normalise))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <TherapistsContext.Provider value={{ therapists, loading, error }}>
      {children}
    </TherapistsContext.Provider>
  )
}

export function useTherapists() {
  const ctx = useContext(TherapistsContext)
  if (!ctx) throw new Error('useTherapists must be used inside <TherapistsProvider>')
  return ctx
}

// ── Normalise the backend shape into one flat object ─────────────────────────
function normalise(t) {
  const pr = t.profiles || {}

  const full_name = pr.full_name || pr.display_name || t.full_name || 'Therapist'

  const rawAvatar = t.avatar_url || pr.avatar_url || null
  const avatar_url = resolveUrl(rawAvatar)

  // ── FIX: parse available_hours — Supabase may return it as a JSON string ──
  let available_hours = t.available_hours || null
  if (typeof available_hours === 'string') {
    try { available_hours = JSON.parse(available_hours) } catch { available_hours = [] }
  }

  return {
    id:               t.id,
    full_name,
    bio:              pr.bio       || t.bio       || '',
    avatar_url,
    city:             pr.city      || t.city      || '',
    license_type:     t.license_type     || 'Licensed Therapist',
    experience_years: t.experience_years || null,
    specializations:  t.specializations  || [],
    languages_spoken: t.languages_spoken || [],
    consultation_fee: t.consultation_fee || null,
    session_duration: t.session_duration || 60,
    rating:           t.rating           || null,
    total_reviews:    t.total_reviews    || 0,
    is_available:     t.is_available     ?? true,
    available_hours,   // ← was missing entirely before
    _raw: t,
  }
}

function resolveUrl(raw) {
  if (!raw) return null
  if (typeof raw === 'string' && raw.trim().startsWith('[')) {
    try { raw = JSON.parse(raw)[0] } catch { return null }
  }
  if (Array.isArray(raw)) raw = raw[0]
  if (!raw || typeof raw !== 'string') return null
  raw = raw.replace(/^"+|"+$/g, '').trim()
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  const origin = API_BASE.replace(/\/api\/?$/, '')
  return `${origin}${raw.startsWith('/') ? '' : '/'}${raw}`
}
