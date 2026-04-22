// CourseContentSection.jsx — SELF-CONTAINED, ERROR-FREE
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
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const LIMIT    = 20
const PLIMIT   = 200

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
  const data = await res.json().catch(() => ({}))
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
    />
  )
}

function Pager({ page, set, total }) {
  const tp = Math.max(1, Math.ceil(total / LIMIT))
  if (tp <= 1) return null
  return (
    <div className="pager">
      <button className="pg-btn" onClick={() => set(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
      <span className="pg-info">{page} / {tp} · <strong>{total}</strong> total</span>
      <button className="pg-btn" onClick={() => set(p => Math.min(tp, p + 1))} disabled={page === tp}>Next →</button>
    </div>
  )
}

function Confirm({ msg, onConfirm, onCancel, danger = true }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-head-title">{danger ? '⚠️ Confirm Action' : '❓ Confirm'}</span>
        </div>
        <div className="modal-body"><p className="confirm-msg">{msg}</p></div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

function RowActions({ onEdit, onDelete, children }) {
  return (
    <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
      {children}
      {onEdit   && <button className="btn btn-ghost btn-sm btn-icon" title="Edit"   onClick={onEdit}>✏️</button>}
      {onDelete && <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={onDelete}>🗑</button>}
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
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.ok ? 'var(--green)' : 'var(--red)',
          color: 'white', padding: '.65rem 1.1rem', borderRadius: 'var(--radius)',
          fontWeight: 600, fontSize: '.82rem', boxShadow: 'var(--shadow-md)',
        }}>{toast.msg}</div>
      )}

      <div className="filters">
        <select className="inp" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} style={{ minWidth: 220 }}>
          <option value="">— Select a course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.emoji || '📚'} {c.title}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={load}>↺ Refresh</button>
        {selectedCourse && <button className="btn btn-primary" onClick={openCreate}>+ New Playlist</button>}
      </div>

      {!selectedCourse && (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-text">Select a course to manage its playlists</div>
        </div>
      )}

      {selectedCourse && error && (
        <div className="alert alert-error" style={{ marginBottom: '.85rem' }}>⚠️ {error}</div>
      )}

      {selectedCourse && (
        <div className="tbl-wrap">
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>{['#', 'Playlist', 'Videos', 'Duration', 'PIN', 'Published', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td className="tbl-loading" colSpan={7}><span className="spinner" /> Loading playlists…</td></tr>
                  : playlists.length === 0
                    ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📂</div><div className="empty-text">No playlists yet for this course</div></div></td></tr>
                    : playlists.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '.78rem', width: 32 }}>{p.sort_order}</td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{p.emoji} {p.title}</div>
                            {p.description && <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: '.1rem' }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '…' : ''}</div>}
                          </td>
                          <td style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--blue-dk)' }}>{p.video_count ?? '—'}</td>
                          <td style={{ fontSize: '.74rem', color: 'var(--text-muted)' }}>{p.total_duration_secs ? secsToHMS(p.total_duration_secs) : '—'}</td>
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
                              <button className="btn btn-ghost btn-sm" title="Manage videos in this playlist"
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
        <div className="overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{modal.data ? '✏️ Edit Playlist' : '+ New Playlist'}</span>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {!modal.data && (
                <div className="field">
                  <label>Course *</label>
                  <select className="inp" value={form.course_id || ''} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}>
                    <option value="">— Select course —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.emoji || '📚'} {c.title}</option>)}
                  </select>
                </div>
              )}
              {modal.data && (
                <div className="alert alert-info" style={{ marginBottom: '.25rem' }}>
                  Course: <strong>{courseTitle(modal.data.course_id)}</strong>
                </div>
              )}
              <div className="field-row">
                <div className="field" style={{ flex: '0 0 64px' }}>
                  <label>Emoji</label>
                  <input className="inp" value={form.emoji || '📚'} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))} style={{ textAlign: 'center', fontSize: '1.15rem' }} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Title *</label>
                  <input className="inp" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Module 1: Foundations" />
                </div>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea className="inp" rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description shown to students" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Sort Order</label>
                  <input className="inp" type="number" min="0" value={form.sort_order ?? 0} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                  <div className="field-hint">Lower = shown first</div>
                </div>
                <div className="field">
                  <label>Access PIN (optional)</label>
                  <input className="inp" type="password" value={form.access_pin || ''} onChange={e => setForm(f => ({ ...f, access_pin: e.target.value }))}
                    placeholder={modal.data ? 'Leave blank to keep existing' : '4-digit PIN to lock'} />
                  <div className="field-hint">Leave blank to remove PIN. Stored hashed.</div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.78rem', cursor: 'pointer' }}>
                <Toggle on={form.is_published !== false} onChange={v => setForm(f => ({ ...f, is_published: v }))} />
                Published (visible to enrolled students)
              </label>
              {saveErr && <div className="alert alert-error">{saveErr}</div>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
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
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.ok ? 'var(--green)' : 'var(--red)',
          color: 'white', padding: '.65rem 1.1rem', borderRadius: 'var(--radius)',
          fontWeight: 600, fontSize: '.82rem', boxShadow: 'var(--shadow-md)',
        }}>{toast.msg}</div>
      )}

      <div className="filters">
        <select className="inp" value={selectedCourse}
          onChange={e => { setSelectedCourse(e.target.value); setSelectedPlaylist('') }}
          style={{ minWidth: 220 }}>
          <option value="">— Select a course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.emoji || '📚'} {c.title}</option>)}
        </select>
        {selectedCourse && (
          <select className="inp" value={selectedPlaylist} onChange={e => setSelectedPlaylist(e.target.value)} style={{ minWidth: 180 }}>
            <option value="">All playlists</option>
            {playlists.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.title}</option>)}
          </select>
        )}
        <button className="btn btn-ghost" onClick={load}>↺ Refresh</button>
        {selectedCourse && <button className="btn btn-primary" onClick={openCreate}>+ Add Video</button>}
        {selectedPlaylist && (
          <span style={{ fontSize: '.72rem', color: 'var(--blue-dk)', fontWeight: 700, alignSelf: 'center' }}>
            🔍 Filtered by playlist
          </span>
        )}
      </div>

      {!selectedCourse && (
        <div className="empty-state"><div className="empty-icon">🎬</div><div className="empty-text">Select a course to manage its videos</div></div>
      )}

      {selectedCourse && error && (
        <div className="alert alert-error" style={{ marginBottom: '.85rem' }}>⚠️ {error}</div>
      )}

      {/* Stats bar */}
      {selectedCourse && !loading && videos.length > 0 && (
        <div style={{ display: 'flex', gap: '.85rem', marginBottom: '.85rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total videos',   val: videos.length,                                                                          color: '#eff6ff', tc: 'var(--blue-dk)' },
            { label: 'Free previews',  val: videos.filter(v => v.is_free_preview).length,                                          color: '#ecfdf5', tc: '#065f46' },
            { label: 'Total duration', val: secsToHMS(videos.reduce((s, v) => s + (v.duration_secs || 0), 0)),                     color: '#f5f3ff', tc: '#5b21b6' },
            { label: 'Avg duration',   val: secsToHMS(Math.round(videos.reduce((s, v) => s + (v.duration_secs || 0), 0) / videos.length)), color: '#fffbeb', tc: '#92400e' },
          ].map((s, i) => (
            <div key={i} style={{ background: s.color, borderRadius: 'var(--radius)', padding: '.65rem .95rem', border: '1px solid var(--border)', minWidth: 110 }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: s.tc }}>{s.val}</div>
              <div style={{ fontSize: '.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '.15rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {selectedCourse && (
        <div className="tbl-wrap">
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>{['#', 'Thumbnail', 'Video', 'Playlist', 'Duration', 'Free Preview', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td className="tbl-loading" colSpan={7}><span className="spinner" /> Loading videos…</td></tr>
                  : videos.length === 0
                    ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">🎬</div><div className="empty-text">No videos yet{selectedPlaylist ? ' in this playlist' : ' for this course'}</div></div></td></tr>
                    : videos.map(v => {
                        const ytId = ytIdFromUrl(v.video_url)
                        const thumb = v.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null)
                        const playlist = playlists.find(p => p.id === v.playlist_id)
                        return (
                          <tr key={v.id}>
                            <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '.78rem', width: 32 }}>{v.sort_order}</td>
                            <td style={{ width: 72 }}>
                              {thumb
                                ? <img src={thumb} alt="" style={{ width: 64, height: 40, objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                                : <div style={{ width: 64, height: 40, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🎬</div>
                              }
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{v.title}</div>
                              {v.description && <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: '.1rem' }}>{v.description.slice(0, 55)}{v.description.length > 55 ? '…' : ''}</div>}
                              <div className="mono" style={{ fontSize: '.62rem', color: 'var(--blue-dk)', marginTop: '.18rem' }}>
                                {ytId ? `yt:${ytId}` : v.video_url?.slice(0, 40)}
                              </div>
                            </td>
                            <td style={{ fontSize: '.74rem' }}>
                              {playlist
                                ? <span style={{ background: 'var(--blue-lt)', color: 'var(--blue-dk)', padding: '.15rem .45rem', borderRadius: 4, fontWeight: 600 }}>{playlist.emoji} {playlist.title}</span>
                                : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                            </td>
                            <td style={{ fontSize: '.74rem', fontWeight: 600, color: 'var(--text-muted)' }}>{v.duration_secs ? secsToHMS(v.duration_secs) : '—'}</td>
                            <td>
                              <span className={`badge ${v.is_free_preview ? 'badge-green' : 'badge-gray'}`}>
                                {v.is_free_preview ? '🔓 Free' : '🔒 Paid'}
                              </span>
                            </td>
                            <td>
                              <RowActions onEdit={() => openEdit(v)} onDelete={() => setDelConf({ id: v.id, label: v.title })}>
                                {v.video_url && (
                                  <a href={v.video_url} target="_blank" rel="noreferrer">
                                    <button className="btn btn-ghost btn-sm" title="Preview video">▶</button>
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
        <div className="overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{modal.data ? '✏️ Edit Video' : '+ Add Video'}</span>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <div className="field">
                  <label>Course *</label>
                  <select className="inp" value={form.course_id || ''} onChange={e => setForm(f => ({ ...f, course_id: e.target.value, playlist_id: null }))}>
                    <option value="">— Select course —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.emoji || '📚'} {c.title}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Playlist (optional)</label>
                  <select className="inp" value={form.playlist_id || ''} onChange={e => setForm(f => ({ ...f, playlist_id: e.target.value || null }))}>
                    <option value="">— No playlist / Unassigned —</option>
                    {playlists.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Title *</label>
                <input className="inp" value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to CBT" />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea className="inp" rows={2} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief summary shown to students" />
              </div>
              <div className="field">
                <label>Video URL * (YouTube embed or direct)</label>
                <input className="inp mono" value={form.video_url || ''} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://www.youtube.com/embed/VIDEO_ID" />
                <div className="field-hint">Use embed URL format: https://www.youtube.com/embed/VIDEO_ID</div>
              </div>
              {/* Live thumbnail preview */}
              {(() => {
                const ytId = ytIdFromUrl(form.video_url)
                const thumb = form.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : null)
                return thumb ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.65rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                    <img src={thumb} alt="preview" style={{ width: 96, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                    <div style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                      {ytId ? <>YouTube ID: <strong className="mono">{ytId}</strong></> : 'Custom thumbnail'}
                    </div>
                  </div>
                ) : null
              })()}
              <div className="field">
                <label>Thumbnail URL (optional — auto-detected from YouTube)</label>
                <input className="inp" value={form.thumbnail_url || ''} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} placeholder="https://…" />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Duration (seconds)</label>
                  <input className="inp" type="number" min="0" value={form.duration_secs || ''} onChange={e => setForm(f => ({ ...f, duration_secs: e.target.value }))} placeholder="e.g. 720 = 12 min" />
                  {form.duration_secs && <div className="field-hint">= {secsToHMS(form.duration_secs)}</div>}
                </div>
                <div className="field">
                  <label>Sort Order</label>
                  <input className="inp" type="number" min="0" value={form.sort_order ?? 0} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
                  <div className="field-hint">Lower = shown first within playlist</div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.78rem', cursor: 'pointer' }}>
                <Toggle on={!!form.is_free_preview} onChange={v => setForm(f => ({ ...f, is_free_preview: v }))} />
                Free Preview — visible to non-enrolled visitors
              </label>
              {saveErr && <div className="alert alert-error">{saveErr}</div>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
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
      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>{['Course', 'Level', 'Price', 'Start Date', 'Seats Left', 'Published', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {busy.courses
                ? <tr><td className="tbl-loading" colSpan={7}><span className="spinner" /> Loading…</td></tr>
                : courses.length === 0
                  ? <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📭</div><div className="empty-text">No courses found.</div></div></td></tr>
                  : courses.map(c => {
                      const seats  = c.seats || c.max_seats || c.total_seats
                      const booked = c.booked_count || c.enrolled_count || 0
                      const left   = seats ? Math.max(0, seats - booked) : null
                      const pct    = seats ? Math.min(100, Math.round((booked / seats) * 100)) : 0
                      return (
                        <tr key={c.id}>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{c.emoji} {c.title}</div>
                            {c.tags?.length > 0 && (
                              <div style={{ fontSize: '.68rem', color: 'var(--text-muted)', marginTop: '.15rem' }}>
                                {(Array.isArray(c.tags) ? c.tags : c.tags.split(',')).slice(0, 3).join(' · ')}
                              </div>
                            )}
                          </td>
                          <td><Badge s={c.level || 'Beginner'} /></td>
                          <td>
                            {c.price_label || (c.is_free || !c.price || Number(c.price) === 0
                              ? <Badge s="free" />
                              : `NPR ${Number(c.price).toLocaleString()}`)}
                          </td>
                          <td style={{ fontSize: '.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {c.start_date ? new Date(c.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            {c.start_time ? <><br /><span style={{ fontSize: '.68rem' }}>{c.start_time}</span></> : null}
                          </td>
                          <td>
                            {left !== null
                              ? <div>
                                  <span style={{ fontWeight: 800, fontSize: '.82rem', color: left === 0 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : 'var(--green)' }}>
                                    {left} / {seats}
                                  </span>
                                  <div style={{ marginTop: '.25rem', height: 3, background: 'var(--border)', borderRadius: 100, overflow: 'hidden', width: 60 }}>
                                    <div style={{ height: '100%', width: pct + '%', background: left === 0 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : 'var(--green)', borderRadius: 100 }} />
                                  </div>
                                </div>
                              : <span style={{ color: 'var(--text-muted)', fontSize: '.78rem' }}>—</span>
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
    <div>
      {/* Header */}
      <div className="sec-head">
        <div>
          <h1 className="sec-title">
            Courses
            {subTab === 'list' && courseTotal != null && (
              <span className="sec-count">({courseTotal})</span>
            )}
          </h1>
          <p className="sec-sub">Manage courses, playlists, videos and enrollments</p>
        </div>
        <div className="sec-actions">
          {subTab === 'list' && (
            <>
              <button className="btn btn-ghost" onClick={() => sec('/admin/courses', setCourses, setCourseTotal, coursePage)}>↺ Refresh</button>
              <button className="btn btn-primary" onClick={() => openCreate('course', { is_free: true, is_published: false, level: 'Beginner' })}>+ New Course</button>
            </>
          )}
        </div>
      </div>

      {/* Sub-tab bar */}
      <div className="sub-tabbar" style={{ marginBottom: '1.1rem' }}>
        {SUBTABS.map(t => (
          <button
            key={t.id}
            className={`sub-tab${subTab === t.id ? ' active' : ''}`}
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
