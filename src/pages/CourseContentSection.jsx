// CourseContentSection.jsx — SELF-CONTAINED, ERROR-FREE
// Glass (bluish-white) design pass applied — accent color #0ea5e9.
// Drop-in replacement. In AdminDashboardPage.jsx, change the courses tab to:
//
//   {tab === 'courses' && (
//     <CourseContentSection
//       courses={courses}
//       courseTotal={courseTotal}
//       coursePage={coursePage}
//       setCoursePage={setCoursePage}
//       busy={busy}
//       openEdit={openEdit}
//       openCreate={openCreate}
//       del={del}
//       sec={sec}
//       setCourses={setCourses}
//       setCourseTotal={setCourseTotal}
//       EnrollmentsComponent={CourseEnrollmentsSection}
//     />
//   )}
//
// All helpers (apiFetch, Pager, Badge, Toggle, RowActions, Confirm, LIMIT)
// are defined locally so this file has zero external dependencies beyond React.

import { useState, useEffect, useCallback } from 'react'

// ─── Local copies of shared helpers (mirror AdminDashboardPage exactly) ───────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const LIMIT    = 20
const PLIMIT   = 200

// ─── Glass design tokens ────────────────────────────────────────────────────
const SKY = {
  accent:     '#0ea5e9',
  accentSoft: '#7dd3fc',
  accentDeep: '#0369a1',
  glassBg:    'linear-gradient(160deg, rgba(255,255,255,0.78) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.75) 100%)',
  glassBgHov: 'linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(200,232,250,0.68) 55%, rgba(255,255,255,0.85) 100%)',
  border:     '1px solid rgba(255,255,255,0.6)',
  borderHov:  '1px solid rgba(120,190,230,0.65)',
  shadow:     '0 4px 18px rgba(14,165,233,0.10), inset 0 1px 0 rgba(255,255,255,0.55)',
  shadowHov:  '0 10px 28px rgba(14,165,233,0.16), inset 0 1px 0 rgba(255,255,255,0.6)',
  ink:        '#0f3a52',
  inkSoft:    '#4a6a7a',
  inkFaint:   '#8fa9b2',
}

const CC_CSS = `
  .cc-wrap { position: relative; }

  .cc-sec-head {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.1rem;
    background: ${SKY.glassBg};
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border: ${SKY.border}; border-radius: 16px;
    box-shadow: ${SKY.shadow};
    padding: 1.1rem 1.3rem;
  }
  .cc-sec-title { font-size: 1.15rem; font-weight: 800; color: ${SKY.ink}; margin: 0; display: flex; align-items: baseline; gap: 0.4rem; }
  .cc-sec-count { font-size: 0.85rem; font-weight: 700; color: ${SKY.accentDeep}; }
  .cc-sec-sub   { font-size: 0.8rem; color: ${SKY.inkSoft}; margin: 0.25rem 0 0; }

  .cc-btn {
    padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.8rem; font-weight: 700;
    cursor: pointer; font-family: inherit; transition: all 0.18s ease; border: none;
  }
  .cc-btn-primary {
    background: linear-gradient(135deg, ${SKY.accent}, ${SKY.accentSoft});
    color: #fff; box-shadow: 0 4px 14px rgba(14,165,233,0.35);
  }
  .cc-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(14,165,233,0.45); }
  .cc-btn-ghost {
    background: rgba(255,255,255,0.55); color: ${SKY.accentDeep};
    border: 1.5px solid rgba(14,165,233,0.3);
  }
  .cc-btn-ghost:hover { background: rgba(255,255,255,0.85); }

  .cc-subtabbar {
    display: flex; gap: 0.35rem; flex-wrap: wrap;
    background: ${SKY.glassBg};
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border: ${SKY.border}; border-radius: 14px;
    box-shadow: ${SKY.shadow};
    padding: 0.4rem;
    margin-bottom: 1.1rem;
  }
  .cc-subtab {
    padding: 0.55rem 1rem; border-radius: 10px; border: none; background: transparent;
    font-size: 0.8rem; font-weight: 600; color: ${SKY.inkSoft}; cursor: pointer;
    font-family: inherit; transition: all 0.18s ease; white-space: nowrap;
  }
  .cc-subtab.active {
    background: linear-gradient(135deg, ${SKY.accent}, ${SKY.accentSoft});
    color: #fff; font-weight: 800; box-shadow: 0 4px 14px rgba(14,165,233,0.32);
  }
  .cc-subtab:not(.active):hover { background: rgba(255,255,255,0.5); color: ${SKY.accentDeep}; }

  .cc-filters {
    display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;
    background: ${SKY.glassBg};
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border: ${SKY.border}; border-radius: 14px;
    box-shadow: ${SKY.shadow};
    padding: 0.85rem 1rem;
    margin-bottom: 1rem;
  }
  .cc-inp {
    padding: 0.55rem 0.85rem; border-radius: 9px;
    border: 1.5px solid rgba(120,190,230,0.45);
    background: rgba(255,255,255,0.7);
    font-size: 0.82rem; color: ${SKY.ink}; font-family: inherit;
    outline: none; transition: all 0.18s ease;
  }
  .cc-inp:focus { border-color: ${SKY.accent}; background: #fff; box-shadow: 0 0 0 3px rgba(14,165,233,0.14); }

  .cc-tbl-wrap {
    background: ${SKY.glassBg};
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border: ${SKY.border}; border-radius: 16px;
    box-shadow: ${SKY.shadow};
    overflow: hidden;
  }
  .cc-tbl-wrap table.tbl { background: transparent; }
  .cc-tbl-wrap thead tr { background: rgba(255,255,255,0.5); }
  .cc-tbl-wrap thead th {
    font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
    color: ${SKY.accentDeep}; padding: 0.75rem 0.9rem; text-align: left;
    border-bottom: 1px solid rgba(120,190,230,0.35);
  }
  .cc-tbl-wrap tbody td { padding: 0.7rem 0.9rem; border-bottom: 1px solid rgba(214,238,252,0.5); }
  .cc-tbl-wrap tbody tr:hover { background: rgba(255,255,255,0.4); }
  .cc-tbl-wrap tbody tr:last-child td { border-bottom: none; }

  .cc-empty {
    text-align: center; padding: 2.5rem 1rem;
    background: rgba(255,255,255,0.4); border-radius: 14px;
  }
  .cc-empty-icon { font-size: 2.2rem; margin-bottom: 0.5rem; opacity: 0.5; }
  .cc-empty-text { font-size: 0.85rem; color: ${SKY.inkSoft}; font-weight: 600; }

  .cc-stat {
    background: ${SKY.glassBg};
    backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
    border: ${SKY.border}; border-radius: 14px;
    box-shadow: ${SKY.shadow};
    padding: 0.75rem 1.05rem;
    min-width: 120px;
  }
  .cc-stat-val { font-size: 1.05rem; font-weight: 800; color: ${SKY.accentDeep}; }
  .cc-stat-lbl { font-size: 0.62rem; font-weight: 700; color: ${SKY.inkFaint}; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 0.15rem; }

  .cc-overlay {
    position: fixed; inset: 0; z-index: 9998;
    background: rgba(15,58,82,0.35); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .cc-modal {
    width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto;
    background: linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(224,242,254,0.9) 100%);
    backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,0.7); border-radius: 20px;
    box-shadow: 0 24px 60px rgba(14,165,233,0.22), inset 0 1px 0 rgba(255,255,255,0.6);
  }
  .cc-modal-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1.1rem 1.3rem; border-bottom: 1px solid rgba(120,190,230,0.3);
  }
  .cc-modal-title { font-size: 1rem; font-weight: 800; color: ${SKY.ink}; }
  .cc-modal-body { padding: 1.2rem 1.3rem; display: flex; flex-direction: column; gap: 0.9rem; }
  .cc-modal-foot { display: flex; justify-content: flex-end; gap: 0.6rem; padding: 1rem 1.3rem; border-top: 1px solid rgba(120,190,230,0.3); }

  .cc-field label { display: block; font-size: 0.72rem; font-weight: 800; color: ${SKY.accentDeep}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.35rem; }
  .cc-field-hint { font-size: 0.68rem; color: ${SKY.inkFaint}; margin-top: 0.25rem; }
  .cc-field-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
  .cc-field-row > .cc-field { flex: 1; min-width: 140px; }

  .cc-alert {
    border-radius: 10px; padding: 0.7rem 1rem; font-size: 0.8rem; font-weight: 600;
  }
  .cc-alert-error { background: #fff0f0; border: 1px solid #f5c4c4; color: #c0392b; }
  .cc-alert-info  { background: rgba(14,165,233,0.08); border: 1px solid rgba(14,165,233,0.25); color: ${SKY.accentDeep}; }

  .cc-toast {
    position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999;
    padding: 0.7rem 1.15rem; border-radius: 12px; font-weight: 700; font-size: 0.82rem;
    color: #fff; box-shadow: 0 10px 28px rgba(0,0,0,0.18);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  }
  .cc-toast-ok  { background: linear-gradient(135deg, #10b981, #34d399); }
  .cc-toast-err { background: linear-gradient(135deg, #ef4444, #f87171); }

  .cc-pill { background: rgba(14,165,233,0.10); color: ${SKY.accentDeep}; padding: 0.15rem 0.55rem; border-radius: 100px; font-weight: 700; font-size: 0.7rem; }
`

function injectCC() {
  if (typeof document === 'undefined') return
  if (document.getElementById('cc-glass-css')) return
  const el = document.createElement('style')
  el.id = 'cc-glass-css'
  el.textContent = CC_CSS
  document.head.appendChild(el)
}

const getToken = () => localStorage.getItem('accessToken')
const apiFetch = async (path, opts = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  })

  // ── Show raw response if not JSON ──
  const text = await res.text()
  console.log(`[API] ${opts.method || 'GET'} ${API_BASE}${path}`)
  console.log(`[API] Status: ${res.status}`)
  console.log(`[API] Raw response:`, text.slice(0, 500))

  let data = {}
  try { data = JSON.parse(text) } catch {
    throw new Error(`Server returned non-JSON (${res.status}): ${text.slice(0, 200)}`)
  }

  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}
function statusVariant(s) {
  const map = {
    published: 'badge-green', draft: 'badge-gray', active: 'badge-green',
    paused: 'badge-amber', free: 'badge-green', premium: 'badge-purple',
    beginner: 'badge-green', intermediate: 'badge-amber', advanced: 'badge-purple',
    true: 'badge-green', false: 'badge-red',
  }
  return map[String(s)?.toLowerCase()] || 'badge-gray'
}

function Badge({ s }) {
  return <span className={`badge ${statusVariant(s)}`}>{String(s)}</span>
}

function Toggle({ on, onChange }) {
  return (
    <button
      type="button"
      className={`toggle${on ? ' on' : ''}`}
      onClick={() => onChange(!on)}
      style={{
        width: 40, height: 22, borderRadius: 99, border: 'none', cursor: 'pointer',
        position: 'relative', flexShrink: 0,
        background: on ? `linear-gradient(135deg, ${SKY.accent}, ${SKY.accentSoft})` : 'rgba(143,169,178,0.35)',
        transition: 'background 0.2s',
      }}
    >
      <span style={{
        position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%',
        background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'left 0.2s',
      }} />
    </button>
  )
}

function Pager({ page, set, total }) {
  const tp = Math.max(1, Math.ceil(total / LIMIT))
  if (tp <= 1) return null
  return (
    <div className="pager" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.85rem', marginTop: '1rem' }}>
      <button className="cc-btn cc-btn-ghost" onClick={() => set(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
      <span style={{ fontSize: '0.78rem', color: SKY.inkSoft, fontWeight: 600 }}>{page} / {tp} · <strong style={{ color: SKY.accentDeep }}>{total}</strong> total</span>
      <button className="cc-btn cc-btn-ghost" onClick={() => set(p => Math.min(tp, p + 1))} disabled={page === tp}>Next →</button>
    </div>
  )
}

function Confirm({ msg, onConfirm, onCancel, danger = true }) {
  return (
    <div className="cc-overlay" onClick={onCancel}>
      <div className="cc-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="cc-modal-head">
          <span className="cc-modal-title">{danger ? '⚠️ Confirm Action' : '❓ Confirm'}</span>
        </div>
        <div className="cc-modal-body"><p style={{ fontSize: '0.86rem', color: SKY.inkSoft, lineHeight: 1.6, margin: 0 }}>{msg}</p></div>
        <div className="cc-modal-foot">
          <button className="cc-btn cc-btn-ghost" onClick={onCancel}>Cancel</button>
          <button
            className="cc-btn"
            style={{ background: danger ? 'linear-gradient(135deg,#ef4444,#f87171)' : `linear-gradient(135deg, ${SKY.accent}, ${SKY.accentSoft})`, color: '#fff', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }}
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

function RowActions({ onEdit, onDelete, children }) {
  return (
    <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
      {children}
      {onEdit   && <button className="cc-btn cc-btn-ghost" style={{ padding: '0.35rem 0.55rem' }} title="Edit"   onClick={onEdit}>✏️</button>}
      {onDelete && <button className="cc-btn" style={{ padding: '0.35rem 0.55rem', background: 'linear-gradient(135deg,#ef4444,#f87171)', color: '#fff' }} title="Delete" onClick={onDelete}>🗑</button>}
    </div>
  )
}

// ─── Duration helper ──────────────────────────────────────────────────────────
function secsToHMS(s) {
  const n = Number(s) || 0
  const h = Math.floor(n / 3600)
  const m = Math.floor((n % 3600) / 60)
  const sec = n % 60
  if (h) return `${h}h ${m}m`
  if (m) return `${m}m ${sec}s`
  return `${sec}s`
}

// ─────────────────────────────────────────────────────────────────────────────
// PLAYLISTS SUB-SECTION
// ─────────────────────────────────────────────────────────────────────────────
function PlaylistsSection({ courses, onEditVideo }) {
  const [selectedCourse, setSelectedCourse] = useState('')
  const [playlists,      setPlaylists]      = useState([])
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')

  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({})
  const [saving,  setSaving]  = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [delConf, setDelConf] = useState(null)
  const [toast,   setToast]   = useState(null)

  const flash = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3200)
  }

  const load = useCallback(async () => {
    if (!selectedCourse) { setPlaylists([]); return }
    setLoading(true); setError('')
    try {
      const d = await apiFetch(`/admin/course-playlists?course_id=${selectedCourse}&limit=${PLIMIT}`)
      const list = d.items || d.playlists || d.data || []
      setPlaylists(list.sort((a, b) => a.sort_order - b.sort_order))
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [selectedCourse])

  useEffect(() => { load() }, [load])

  const openCreate = () => {
    setForm({ course_id: selectedCourse, emoji: '📚', sort_order: playlists.length + 1, is_published: true, access_pin: '' })
    setSaveErr(''); setModal({ data: null })
  }
  const openEdit  = p => { setForm({ ...p, access_pin: '' }); setSaveErr(''); setModal({ data: p }) }
  const closeModal = () => { setModal(null); setForm({}); setSaveErr('') }

  const save = async () => {
    if (!form.title?.trim()) return setSaveErr('Title is required')
    if (!form.course_id)     return setSaveErr('Please select a course first')
    setSaving(true); setSaveErr('')
    try {
      const body = {
        course_id:   form.course_id,
        title:       form.title,
        description: form.description || null,
        emoji:       form.emoji || '📚',
        sort_order:  Number(form.sort_order) || 0,
        is_published: form.is_published !== false,
        ...(form.access_pin?.trim() ? { access_pin: form.access_pin } : {}),
      }
      if (modal.data) {
        await apiFetch(`/admin/course-playlists/${modal.data.id}`, { method: 'PUT', body: JSON.stringify(body) })
        flash('Playlist updated ✓')
      } else {
        await apiFetch('/admin/course-playlists', { method: 'POST', body: JSON.stringify(body) })
        flash('Playlist created ✓')
      }
      closeModal(); load()
    } catch (e) { setSaveErr(e.message) }
    finally { setSaving(false) }
  }

  const doDelete = async () => {
    try {
      await apiFetch(`/admin/course-playlists/${delConf.id}`, { method: 'DELETE' })
      flash('Playlist deleted')
      setDelConf(null); load()
    } catch (e) { flash(e.message, false); setDelConf(null) }
  }

  const courseTitle = id => courses.find(c => c.id === id)?.title || '—'

  return (
    <div style={{ position: 'relative' }}>
      {toast && (
        <div className={`cc-toast ${toast.ok ? 'cc-toast-ok' : 'cc-toast-err'}`}>{toast.msg}</div>
      )}

      <div className="cc-filters">
        <select className="cc-inp" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{ minWidth: 220 }}>
          <option value="">— Select a course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.emoji || '📚'} {c.title}</option>)}
        </select>
        <button className="cc-btn cc-btn-ghost" onClick={load}>↺ Refresh</button>
        {selectedCourse && <button className="cc-btn cc-btn-primary" onClick={openCreate}>+ New Playlist</button>}
      </div>

      {!selectedCourse && (
        <div className="cc-empty">
          <div className="cc-empty-icon">📋</div>
          <div className="cc-empty-text">Select a course to manage its playlists</div>
        </div>
      )}

      {selectedCourse && error && (
        <div className="cc-alert cc-alert-error" style={{ marginBottom: '.85rem' }}>⚠️ {error}</div>
      )}

      {selectedCourse && (
        <div className="cc-tbl-wrap">
          <div className="tbl-scroll" style={{ overflowX: 'auto' }}>
            <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['#', 'Playlist', 'Videos', 'Duration', 'PIN', 'Published', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td className="tbl-loading" colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: SKY.inkSoft }}><span className="spinner" /> Loading playlists…</td></tr>
                  : playlists.length === 0
                    ? <tr><td colSpan={7}><div className="cc-empty"><div className="cc-empty-icon">📂</div><div className="cc-empty-text">No playlists yet for this course</div></div></td></tr>
                    : playlists.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700, color: SKY.inkFaint, fontSize: '.78rem', width: 32 }}>{p.sort_order}</td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '.82rem', color: SKY.ink }}>{p.emoji} {p.title}</div>
                            {p.description && <div style={{ fontSize: '.7rem', color: SKY.inkFaint, marginTop: '.1rem' }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</div>}
                          </td>
                          <td style={{ fontSize: '.78rem', fontWeight: 700, color: SKY.accentDeep }}>{p.video_count ?? '—'}</td>
                          <td style={{ fontSize: '.74rem', color: SKY.inkFaint }}>{p.total_duration_secs ? secsToHMS(p.total_duration_secs) : '—'}</td>
                          <td>
                            {p.requires_pin || p.access_pin
                              ? <span className="badge badge-amber">🔒 PIN set</span>
                              : <span className="badge badge-gray">Open</span>}
                          </td>
                          <td>
                            <span className={`badge ${p.is_published ? 'badge-green' : 'badge-gray'}`}>
                              {p.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td>
                            <RowActions onEdit={() => openEdit(p)} onDelete={() => setDelConf({ id: p.id, label: p.title })}>
                              <button className="cc-btn cc-btn-ghost" style={{ padding: '0.35rem 0.6rem' }} title="Manage videos in this playlist"
                                onClick={() => onEditVideo(p.course_id, p.id)}>
                                🎬 Videos
                              </button>
                            </RowActions>
                          </td>
                        </tr>
                      ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="cc-overlay" onClick={closeModal}>
          <div className="cc-modal" onClick={e => e.stopPropagation()}>
            <div className="cc-modal-head">
              <span className="cc-modal-title">{modal.data ? '✏️ Edit Playlist' : '+ New Playlist'}</span>
              <button className="cc-btn cc-btn-ghost" style={{ padding: '0.35rem 0.6rem' }} onClick={closeModal}>✕</button>
            </div>
            <div className="cc-modal-body">
              {!modal.data && (
                <div className="cc-field">
                  <label>Course *</label>
                  <select className="cc-inp" style={{ width: '100%' }} value={form.course_id || ''} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}>
                    <option value="">— Select course —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.emoji || '📚'} {c.title}</option>)}
                  </select>
                </div>
              )}
              {modal.data && (
                <div className="cc-alert cc-alert-info">
                  Course: <strong>{courseTitle(modal.data.course_id)}</strong>
                </div>
              )}
              <div className="cc-field-row">
                <div className="cc-field" style={{ flex: '0 0 64px' }}>
                  <label>Emoji</label>
                  <input className="cc-inp" value={form.emoji || '📚'} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} style={{ textAlign: 'center', fontSize: '1.15rem', width: '100%' }} />
                </div>
                <div className="cc-field">
                  <label>Title *</label>
                  <input className="cc-inp" style={{ width: '100%' }} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Module 1: Foundations" />
                </div>
              </div>
              <div className="cc-field">
                <label>Description</label>
                <textarea className="cc-inp" style={{ width: '100%', resize: 'vertical' }} rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description shown to students" />
              </div>
              <div className="cc-field-row">
                <div className="cc-field">
                  <label>Sort Order</label>
                  <input className="cc-inp" style={{ width: '100%' }} type="number" min="0" value={form.sort_order ?? 0} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                  <div className="cc-field-hint">Lower = shown first</div>
                </div>
                <div className="cc-field">
                  <label>Access PIN (optional)</label>
                  <input className="cc-inp" style={{ width: '100%' }} type="password" value={form.access_pin || ''} onChange={e => setForm(f => ({ ...f, access_pin: e.target.value }))}
                    placeholder={modal.data ? 'Leave blank to keep existing' : '4-digit PIN to lock'} />
                  <div className="cc-field-hint">Leave blank to remove PIN. Stored hashed.</div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', color: SKY.inkSoft, fontWeight: 600, cursor: 'pointer' }}>
                <Toggle on={form.is_published !== false} onChange={v => setForm(f => ({ ...f, is_published: v }))} />
                Published (visible to enrolled students)
              </label>
              {saveErr && <div className="cc-alert cc-alert-error">{saveErr}</div>}
            </div>
            <div className="cc-modal-foot">
              <button className="cc-btn cc-btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="cc-btn cc-btn-primary" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : modal.data ? 'Save Changes' : 'Create Playlist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConf && (
        <Confirm
          msg={`Delete playlist "${delConf.label}"? All videos will be unlinked (not deleted).`}
          onConfirm={doDelete}
          onCancel={() => setDelConf(null)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VIDEOS SUB-SECTION
// ─────────────────────────────────────────────────────────────────────────────
function VideosSection({ courses, initialCourseId, initialPlaylistId }) {
  const [selectedCourse,   setSelectedCourse]   = useState(initialCourseId   || '')
  const [selectedPlaylist, setSelectedPlaylist] = useState(initialPlaylistId || '')
  const [playlists,        setPlaylists]        = useState([])
  const [videos,           setVideos]           = useState([])
  const [loading,          setLoading]          = useState(false)
  const [error,            setError]            = useState('')

  const [modal,   setModal]   = useState(null)
  const [form,    setForm]    = useState({})
  const [saving,  setSaving]  = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [delConf, setDelConf] = useState(null)
  const [toast,   setToast]   = useState(null)

  const flash = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3200)
  }

  // Load playlists when course changes
  useEffect(() => {
    if (!selectedCourse) { setPlaylists([]); setSelectedPlaylist(''); return }
    ;(async () => {
      try {
        const d = await apiFetch(`/admin/course-playlists?course_id=${selectedCourse}&limit=${PLIMIT}`)
        const list = d.items || d.playlists || d.data || []
        setPlaylists(list.sort((a, b) => a.sort_order - b.sort_order))
      } catch { setPlaylists([]) }
    })()
  }, [selectedCourse])

  // Load videos
  const load = useCallback(async () => {
    if (!selectedCourse) { setVideos([]); return }
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ course_id: selectedCourse, limit: PLIMIT })
      if (selectedPlaylist) params.set('playlist_id', selectedPlaylist)
      const d = await apiFetch(`/admin/course-videos?${params}`)
      const list = d.items || d.videos || d.data || []
      setVideos(list.sort((a, b) => a.sort_order - b.sort_order))
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [selectedCourse, selectedPlaylist])

  useEffect(() => { load() }, [load])

  // Sync initial props (e.g. when navigated from Playlists tab)
  useEffect(() => {
    if (initialCourseId)   setSelectedCourse(initialCourseId)
    if (initialPlaylistId) setSelectedPlaylist(initialPlaylistId)
  }, [initialCourseId, initialPlaylistId])

  const openCreate = () => {
    const nextOrder = videos.length ? Math.max(...videos.map(v => v.sort_order || 0)) + 1 : 1
    setForm({ course_id: selectedCourse, playlist_id: selectedPlaylist || null, sort_order: nextOrder, is_free_preview: false, duration_secs: '' })
    setSaveErr(''); setModal({ data: null })
  }
  const openEdit  = v => { setForm({ ...v }); setSaveErr(''); setModal({ data: v }) }
  const closeModal = () => { setModal(null); setForm({}); setSaveErr('') }

  const save = async () => {
    if (!form.title?.trim())     return setSaveErr('Title is required')
    if (!form.course_id)         return setSaveErr('Course is required')
    if (!form.video_url?.trim()) return setSaveErr('Video URL is required')
    setSaving(true); setSaveErr('')
    try {
      const body = {
        course_id:       form.course_id,
        playlist_id:     form.playlist_id || null,
        title:           form.title,
        description:     form.description || null,
        video_url:       form.video_url,
        thumbnail_url:   form.thumbnail_url || null,
        duration_secs:   form.duration_secs ? Number(form.duration_secs) : null,
        sort_order:      Number(form.sort_order) || 0,
        is_free_preview: form.is_free_preview === true,
      }
      if (modal.data) {
        await apiFetch(`/admin/course-videos/${modal.data.id}`, { method: 'PUT', body: JSON.stringify(body) })
        flash('Video updated ✓')
      } else {
        await apiFetch('/admin/course-videos', { method: 'POST', body: JSON.stringify(body) })
        flash('Video created ✓')
      }
      closeModal(); load()
    } catch (e) { setSaveErr(e.message) }
    finally { setSaving(false) }
  }

  const doDelete = async () => {
    try {
      await apiFetch(`/admin/course-videos/${delConf.id}`, { method: 'DELETE' })
      flash('Video deleted')
      setDelConf(null); load()
    } catch (e) { flash(e.message, false); setDelConf(null) }
  }

  const ytIdFromUrl = url => {
    if (!url) return null
    const m = url.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
    return m ? m[1] : null
  }

  return (
    <div style={{ position: 'relative' }}>
      {toast && (
        <div className={`cc-toast ${toast.ok ? 'cc-toast-ok' : 'cc-toast-err'}`}>{toast.msg}</div>
      )}

      <div className="cc-filters">
        <select className="cc-inp" value={selectedCourse}
          onChange={e => { setSelectedCourse(e.target.value); setSelectedPlaylist('') }}
          style={{ minWidth: 220 }}>
          <option value="">— Select a course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.emoji || '📚'} {c.title}</option>)}
        </select>
        {selectedCourse && (
          <select className="cc-inp" value={selectedPlaylist} onChange={e => setSelectedPlaylist(e.target.value)} style={{ minWidth: 180 }}>
            <option value="">All playlists</option>
            {playlists.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.title}</option>)}
          </select>
        )}
        <button className="cc-btn cc-btn-ghost" onClick={load}>↺ Refresh</button>
        {selectedCourse && <button className="cc-btn cc-btn-primary" onClick={openCreate}>+ Add Video</button>}
        {selectedPlaylist && (
          <span className="cc-pill">🔍 Filtered by playlist</span>
        )}
      </div>

      {!selectedCourse && (
        <div className="cc-empty"><div className="cc-empty-icon">🎬</div><div className="cc-empty-text">Select a course to manage its videos</div></div>
      )}

      {selectedCourse && error && (
        <div className="cc-alert cc-alert-error" style={{ marginBottom: '.85rem' }}>⚠️ {error}</div>
      )}

      {/* Stats bar */}
      {selectedCourse && !loading && videos.length > 0 && (
        <div style={{ display: 'flex', gap: '.85rem', marginBottom: '.85rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total videos',   val: videos.length },
            { label: 'Free previews',  val: videos.filter(v => v.is_free_preview).length },
            { label: 'Total duration', val: secsToHMS(videos.reduce((s, v) => s + (v.duration_secs || 0), 0)) },
            { label: 'Avg duration',   val: secsToHMS(Math.round(videos.reduce((s, v) => s + (v.duration_secs || 0), 0) / videos.length)) },
          ].map((s, i) => (
            <div key={i} className="cc-stat">
              <div className="cc-stat-val">{s.val}</div>
              <div className="cc-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {selectedCourse && (
        <div className="cc-tbl-wrap">
          <div className="tbl-scroll" style={{ overflowX: 'auto' }}>
            <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['#', 'Thumbnail', 'Video', 'Playlist', 'Duration', 'Free Preview', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td className="tbl-loading" colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: SKY.inkSoft }}><span className="spinner" /> Loading videos…</td></tr>
                  : videos.length === 0
                    ? <tr><td colSpan={7}><div className="cc-empty"><div className="cc-empty-icon">🎬</div><div className="cc-empty-text">No videos yet{selectedPlaylist ? ' in this playlist' : ' for this course'}</div></div></td></tr>
                    : videos.map(v => {
                        const ytId = ytIdFromUrl(v.video_url)
                        const thumb = v.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null)
                        const playlist = playlists.find(p => p.id === v.playlist_id)
                        return (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 700, color: SKY.inkFaint, fontSize: '.78rem', width: 32 }}>{v.sort_order}</td>
                            <td style={{ width: 72 }}>
                              {thumb
                                ? <img src={thumb} alt="" style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(120,190,230,0.4)' }} />
                                : <div style={{ width: 64, height: 40, background: 'rgba(14,165,233,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🎬</div>
                              }
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '.82rem', color: SKY.ink }}>{v.title}</div>
                              {v.description && <div style={{ fontSize: '.7rem', color: SKY.inkFaint, marginTop: '.1rem' }}>{v.description.slice(0, 55)}{v.description.length > 55 ? '…' : ''}</div>}
                              <div className="mono" style={{ fontSize: '.62rem', color: SKY.accentDeep, marginTop: '.18rem' }}>
                                {ytId ? `yt:${ytId}` : v.video_url?.slice(0, 40)}
                              </div>
                            </td>
                            <td style={{ fontSize: '.74rem' }}>
                              {playlist
                                ? <span className="cc-pill">{playlist.emoji} {playlist.title}</span>
                                : <span style={{ color: SKY.inkFaint }}>Unassigned</span>}
                            </td>
                            <td style={{ fontSize: '.74rem', fontWeight: 600, color: SKY.inkFaint }}>{v.duration_secs ? secsToHMS(v.duration_secs) : '—'}</td>
                            <td>
                              <span className={`badge ${v.is_free_preview ? 'badge-green' : 'badge-gray'}`}>
                                {v.is_free_preview ? '🔓 Free' : '🔒 Paid'}
                              </span>
                            </td>
                            <td>
                              <RowActions onEdit={() => openEdit(v)} onDelete={() => setDelConf({ id: v.id, label: v.title })}>
                                {v.video_url && (
                                  <a href={v.video_url} target="_blank" rel="noreferrer">
                                    <button className="cc-btn cc-btn-ghost" style={{ padding: '0.35rem 0.55rem' }} title="Preview video">▶</button>
                                  </a>
                                )}
                              </RowActions>
                            </td>
                          </tr>
                        )
                      })
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="cc-overlay" onClick={closeModal}>
          <div className="cc-modal" onClick={e => e.stopPropagation()}>
            <div className="cc-modal-head">
              <span className="cc-modal-title">{modal.data ? '✏️ Edit Video' : '+ Add Video'}</span>
              <button className="cc-btn cc-btn-ghost" style={{ padding: '0.35rem 0.6rem' }} onClick={closeModal}>✕</button>
            </div>
            <div className="cc-modal-body">
              <div className="cc-field-row">
                <div className="cc-field">
                  <label>Course *</label>
                  <select className="cc-inp" style={{ width: '100%' }} value={form.course_id || ''} onChange={e => setForm(f => ({ ...f, course_id: e.target.value, playlist_id: null }))}>
                    <option value="">— Select course —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.emoji || '📚'} {c.title}</option>)}
                  </select>
                </div>
                <div className="cc-field">
                  <label>Playlist (optional)</label>
                  <select className="cc-inp" style={{ width: '100%' }} value={form.playlist_id || ''} onChange={e => setForm(f => ({ ...f, playlist_id: e.target.value || null }))}>
                    <option value="">— No playlist / Unassigned —</option>
                    {playlists.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="cc-field">
                <label>Title *</label>
                <input className="cc-inp" style={{ width: '100%' }} value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to CBT" />
              </div>
              <div className="cc-field">
                <label>Description</label>
                <textarea className="cc-inp" style={{ width: '100%', resize: 'vertical' }} rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief summary shown to students" />
              </div>
              <div className="cc-field">
                <label>Video URL * (YouTube embed or direct)</label>
                <input className="cc-inp mono" style={{ width: '100%' }} value={form.video_url || ''} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://www.youtube.com/embed/VIDEO_ID" />
                <div className="cc-field-hint">Use embed URL format: https://www.youtube.com/embed/VIDEO_ID</div>
              </div>
              {/* Live thumbnail preview */}
              {(() => {
                const ytId = ytIdFromUrl(form.video_url)
                const thumb = form.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null)
                return thumb ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.65rem', background: 'rgba(14,165,233,0.06)', borderRadius: 10, border: '1px solid rgba(120,190,230,0.35)' }}>
                    <img src={thumb} alt="preview" style={{ width: 96, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                    <div style={{ fontSize: '.72rem', color: SKY.inkSoft }}>
                      {ytId ? <>YouTube ID: <strong className="mono">{ytId}</strong></> : 'Custom thumbnail'}
                    </div>
                  </div>
                ) : null
              })()}
              <div className="cc-field">
                <label>Thumbnail URL (optional — auto-detected from YouTube)</label>
                <input className="cc-inp" style={{ width: '100%' }} value={form.thumbnail_url || ''} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} placeholder="https://…" />
              </div>
              <div className="cc-field-row">
                <div className="cc-field">
                  <label>Duration (seconds)</label>
                  <input className="cc-inp" style={{ width: '100%' }} type="number" min="0" value={form.duration_secs || ''} onChange={e => setForm(f => ({ ...f, duration_secs: e.target.value }))} placeholder="e.g. 720 = 12 min" />
                  {form.duration_secs && <div className="cc-field-hint">= {secsToHMS(form.duration_secs)}</div>}
                </div>
                <div className="cc-field">
                  <label>Sort Order</label>
                  <input className="cc-inp" style={{ width: '100%' }} type="number" min="0" value={form.sort_order ?? 0} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                  <div className="cc-field-hint">Lower = shown first within playlist</div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem', color: SKY.inkSoft, fontWeight: 600, cursor: 'pointer' }}>
                <Toggle on={!!form.is_free_preview} onChange={v => setForm(f => ({ ...f, is_free_preview: v }))} />
                Free Preview — visible to non-enrolled visitors
              </label>
              {saveErr && <div className="cc-alert cc-alert-error">{saveErr}</div>}
            </div>
            <div className="cc-modal-foot">
              <button className="cc-btn cc-btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="cc-btn cc-btn-primary" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : modal.data ? 'Save Changes' : 'Add Video'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConf && (
        <Confirm
          msg={`Delete video "${delConf.label}"? This cannot be undone.`}
          onConfirm={doDelete}
          onCancel={() => setDelConf(null)}
        />
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// COURSES LIST SUB-SECTION
// ─────────────────────────────────────────────────────────────────────────────
function CoursesListSection({ courses, courseTotal, coursePage, setCoursePage, busy, openEdit, openCreate, del, sec, setCourses, setCourseTotal }) {
  return (
    <>
      <div className="cc-tbl-wrap">
        <div className="tbl-scroll" style={{ overflowX: 'auto' }}>
          <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Course', 'Level', 'Price', 'Start Date', 'Seats Left', 'Published', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {busy.courses
                ? <tr><td className="tbl-loading" colSpan={7} style={{ textAlign: 'center', padding: '1.5rem', color: SKY.inkSoft }}><span className="spinner" /> Loading…</td></tr>
                : courses.length === 0
                  ? <tr><td colSpan={7}><div className="cc-empty"><div className="cc-empty-icon">📭</div><div className="cc-empty-text">No courses found.</div></div></td></tr>
                  : courses.map(c => {
                      const seats  = c.seats || c.max_seats || c.total_seats
                      const booked = c.booked_count || c.enrolled_count || 0
                      const left   = seats ? Math.max(0, seats - booked) : null
                      const pct    = seats ? Math.min(100, Math.round((booked / seats) * 100)) : 0
                      return (
                        <tr key={c.id}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '.82rem', color: SKY.ink }}>{c.emoji} {c.title}</div>
                            {c.tags?.length > 0 && (
                              <div style={{ fontSize: '.68rem', color: SKY.inkFaint, marginTop: '.15rem' }}>
                                {(Array.isArray(c.tags) ? c.tags : c.tags.split(',')).slice(0, 3).join(' · ')}
                              </div>
                            )}
                          </td>
                          <td><Badge s={c.level || 'Beginner'} /></td>
                          <td style={{ color: SKY.ink, fontWeight: 600 }}>
                            {c.price_label || (c.is_free || !c.price || Number(c.price) === 0
                              ? <Badge s="free" />
                              : `NPR ${Number(c.price).toLocaleString()}`)}
                          </td>
                          <td style={{ fontSize: '.74rem', color: SKY.inkFaint, whiteSpace: 'nowrap' }}>
                            {c.start_date ? new Date(c.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            {c.start_time ? <><br /><span style={{ fontSize: '.68rem' }}>{c.start_time}</span></> : null}
                          </td>
                          <td>
                            {left !== null
                              ? <div>
                                  <span style={{ fontWeight: 800, fontSize: '.82rem', color: left === 0 ? '#c0392b' : pct >= 80 ? '#b45309' : '#1a7a4a' }}>
                                    {left} / {seats}
                                  </span>
                                  <div style={{ marginTop: '.25rem', height: 3, background: 'rgba(120,190,230,0.3)', borderRadius: 100, overflow: 'hidden', width: 60 }}>
                                    <div style={{ height: '100%', width: pct + '%', background: left === 0 ? '#c0392b' : pct >= 80 ? '#b45309' : '#1a7a4a', borderRadius: 100 }} />
                                  </div>
                                </div>
                              : <span style={{ color: SKY.inkFaint, fontSize: '.78rem' }}>—</span>
                            }
                          </td>
                          <td><Badge s={c.is_published ? 'published' : 'draft'} /></td>
                          <td>
                            <RowActions
                              onEdit={() => openEdit('course', c)}
                              onDelete={() => del('/admin/courses', c.id, c.title, () => sec('/admin/courses', setCourses, setCourseTotal, coursePage))}
                            />
                          </td>
                        </tr>
                      )
                    })
              }
            </tbody>
          </table>
        </div>
      </div>
      <Pager page={coursePage} set={setCoursePage} total={courseTotal} />
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────
export default function CourseContentSection({
  courses, courseTotal, coursePage, setCoursePage,
  busy, openEdit, openCreate, del, sec,
  setCourses, setCourseTotal,
  EnrollmentsComponent,
}) {
  useEffect(() => { injectCC() }, [])

  const [subTab, setSubTab] = useState('list')

  const [videoFilterCourse,   setVideoFilterCourse]   = useState('')
  const [videoFilterPlaylist, setVideoFilterPlaylist] = useState('')

  const handleEditVideo = (courseId, playlistId) => {
    setVideoFilterCourse(courseId)
    setVideoFilterPlaylist(playlistId)
    setSubTab('videos')
  }

  const SUBTABS = [
    { id: 'list',        label: '📚 Courses'     },
    { id: 'playlists',   label: '📋 Playlists'   },
    { id: 'videos',      label: '🎬 Videos'      },
    { id: 'enrollments', label: '🎓 Enrollments' },
  ]

  return (
    <div className="cc-wrap">
      {/* Header */}
      <div className="cc-sec-head">
        <div>
          <h1 className="cc-sec-title">
            Courses
            {subTab === 'list' && courseTotal != null && (
              <span className="cc-sec-count">({courseTotal})</span>
            )}
          </h1>
          <p className="cc-sec-sub">Manage courses, playlists, videos and enrollments</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {subTab === 'list' && (
            <>
              <button className="cc-btn cc-btn-ghost" onClick={() => sec('/admin/courses', setCourses, setCourseTotal, coursePage)}>↺ Refresh</button>
              <button className="cc-btn cc-btn-primary" onClick={() => openCreate('course', { is_free: true, is_published: false, level: 'Beginner' })}>+ New Course</button>
            </>
          )}
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="cc-subtabbar">
        {SUBTABS.map(t => (
          <button
            key={t.id}
            className={`cc-subtab${subTab === t.id ? ' active' : ''}`}
            onClick={() => setSubTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {subTab === 'list' && (
        <CoursesListSection
          courses={courses}
          courseTotal={courseTotal}
          coursePage={coursePage}
          setCoursePage={setCoursePage}
          busy={busy}
          openEdit={openEdit}
          openCreate={openCreate}
          del={del}
          sec={sec}
          setCourses={setCourses}
          setCourseTotal={setCourseTotal}
        />
      )}

      {subTab === 'playlists' && (
        <PlaylistsSection courses={courses} onEditVideo={handleEditVideo} />
      )}

      {subTab === 'videos' && (
        <VideosSection
          courses={courses}
          initialCourseId={videoFilterCourse}
          initialPlaylistId={videoFilterPlaylist}
        />
      )}

      {subTab === 'enrollments' && EnrollmentsComponent && (
        <EnrollmentsComponent />
      )}
    </div>
  )
}
