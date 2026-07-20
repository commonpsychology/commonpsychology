// src/components/ReviewModal.jsx
import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

export default function ReviewModal({ therapist, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!therapist) return null

  const handlePost = async () => {
    if (rating < 1) {
      setError('Please select a star rating.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken')

      const res = await fetch(`${API_BASE}/therapists/${therapist.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ rating, review_text: text.trim() || null }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Could not submit review.')
      }
      onSubmitted && onSubmitted(data.review)
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(4,44,83,0.55)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 420,
        padding: '1.75rem', boxShadow: '0 24px 60px rgba(4,44,83,.25)',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14, width: 30, height: 30,
            borderRadius: '50%', border: 'none', background: '#f1f5f9',
            cursor: 'pointer', fontSize: 14,
          }}
        >✕</button>

        <h3 style={{ margin: '0 0 0.3rem', fontSize: '1.15rem', color: '#0f172a' }}>
          Rate {therapist.full_name || therapist.name}
        </h3>
        <p style={{ margin: '0 0 1.1rem', fontSize: '0.85rem', color: '#64748b' }}>
          Share how your session went.
        </p>

        {/* Stars */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '1.8rem', lineHeight: 1, padding: 0,
                color: (hoverRating || rating) >= n ? '#f59e0b' : '#e2e8f0',
              }}
              aria-label={`${n} star`}
            >★</button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your review (optional)..."
          rows={4}
          maxLength={2000}
          style={{
            width: '100%', borderRadius: 12, border: '1px solid #e2e8f0',
            padding: '0.75rem', fontSize: '0.9rem', fontFamily: 'inherit',
            resize: 'vertical', marginBottom: '0.75rem',
          }}
        />

        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            {error}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handlePost}
          disabled={submitting}
          style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}
        >
          {submitting ? 'Posting...' : 'Post Review'}
        </button>
      </div>
    </div>
  )
}