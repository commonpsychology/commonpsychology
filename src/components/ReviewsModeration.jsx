// src/components/admin/ReviewsModeration.jsx
// Admin panel tab — approve / reject / delete video reviews
// Add this as a tab inside your existing Staff/Admin Dashboard

import { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function VideoPreview({ url }) {
  if (!url) return null
  return (
    <video
      src={url}
      controls
      style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, background: '#111' }}
    />
  )
}

export default function ReviewsModeration() {
  const [pending, setPending] = useState([])
  const [approved, setApproved] = useState([])
  const [tab, setTab] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(null)

  const token = localStorage.getItem('accessToken')
  const headers = { Authorization: `Bearer ${token}` }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pendRes, appRes] = await Promise.all([
        fetch(`${API_BASE}/reviews/pending`, { headers }),
        fetch(`${API_BASE}/reviews?limit=50`, { headers }),
      ])
      const pendData = await pendRes.json()
      const appData  = await appRes.json()
      setPending(pendData.reviews || [])
      setApproved(appData.reviews || [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function approve(id, featured = false) {
    setActioning(id)
    await fetch(`${API_BASE}/reviews/${id}/approve`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: featured }),
    })
    setActioning(null); load()
  }

  async function reject(id) {
    setActioning(id)
    await fetch(`${API_BASE}/reviews/${id}/reject`, { method: 'PATCH', headers })
    setActioning(null); load()
  }

  async function remove(id) {
    if (!window.confirm('Permanently delete this video review?')) return
    setActioning(id)
    await fetch(`${API_BASE}/reviews/${id}`, { method: 'DELETE', headers })
    setActioning(null); load()
  }

  const rows = tab === 'pending' ? pending : approved
  const card = {
    background: '#fff', borderRadius: 12, border: '1px solid var(--border-faint)',
    padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem',
  }
  const btn = (bg, color) => ({
    padding: '0.38rem 0.85rem', border: 'none', borderRadius: 6,
    background: bg, color, fontFamily: 'var(--font-body)',
    fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
    transition: 'opacity 0.15s',
  })

  return (
    <div style={{ padding: '1.5rem 0' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-faint)', paddingBottom: '0.75rem' }}>
        {[['pending', `Pending Review (${pending.length})`, '#e53e3e'], ['approved', `Approved (${approved.length})`, 'var(--sky)']].map(([key, label, col]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '0.45rem 1.1rem', borderRadius: 8,
            border: `1.5px solid ${tab === key ? col : 'var(--border-faint)'}`,
            background: tab === key ? col : 'var(--white)',
            color: tab === key ? '#fff' : 'var(--text-mid)',
            fontFamily: 'var(--font-body)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
          }}>{label}</button>
        ))}
      </div>

      {loading && <div style={{ color: 'var(--text-light)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>Loading...</div>}

      {!loading && rows.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)', fontFamily: 'var(--font-body)' }}>
          {tab === 'pending' ? '✅ No pending reviews — all caught up!' : 'No approved reviews yet.'}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.1rem' }}>
        {rows.map(v => (
          <div key={v.id} style={{ ...card, opacity: actioning === v.id ? 0.5 : 1 }}>
            <VideoPreview url={v.video_url} />

            <div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--blue-deep)' }}>{v.name}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--text-light)' }}>{v.city} · {v.topic}</div>
            </div>

            {v.quote && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--text-mid)', fontStyle: 'italic', lineHeight: 1.55, margin: 0 }}>
                "{v.quote}"
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {'★'.repeat(v.stars || 5)}
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-light)' }}>
                {new Date(v.created_at).toLocaleDateString()}
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              {tab === 'pending' && (
                <>
                  <button style={btn('var(--sky)', '#fff')} onClick={() => approve(v.id, false)} disabled={!!actioning}>
                    ✓ Approve
                  </button>
                  <button style={btn('#2d4a3e', '#fff')} onClick={() => approve(v.id, true)} disabled={!!actioning}>
                    ⭐ Feature
                  </button>
                  <button style={btn('#fff5f5', '#e53e3e')} onClick={() => reject(v.id)} disabled={!!actioning}>
                    ✗ Reject
                  </button>
                </>
              )}
              {tab === 'approved' && (
                <button style={btn('#f0f4f8', 'var(--green-deep)')} onClick={() => approve(v.id, !v.is_featured)} disabled={!!actioning}>
                  {v.is_featured ? '★ Unfeature' : '☆ Feature'}
                </button>
              )}
              <button style={btn('#fff5f5', '#c53030')} onClick={() => remove(v.id)} disabled={!!actioning}>
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}