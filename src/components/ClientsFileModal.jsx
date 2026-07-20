// src/components/ClientFilesModal.jsx
//
// Shows a client's uploaded files (images, PDFs, docs, anything) as a
// grid of cards. Clicking a card opens a viewer (image lightbox, inline
// PDF, or a download prompt for other types). Includes drag-and-drop /
// click-to-upload.
//
// Usage (see integration notes at the bottom of this file):
//   <ClientFilesModal client={filesClient} onClose={() => setFilesClient(null)} />

import { useState, useEffect, useRef, useCallback } from 'react'
import { C, GLASS } from '../pages/TherapistDashboardPage' // adjust path if needed

const API_BASE = import.meta.env.VITE_API_URL || `${import.meta.env.VITE_API_URL}/api`

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('accessToken')
  const isFormData = options.body instanceof FormData
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

const CATEGORY_META = {
  image:    { icon: '🖼️', label: 'Image',    bg: '#e0f7ff', color: C.skyDeep },
  pdf:      { icon: '📕', label: 'PDF',      bg: '#fff0f0', color: '#c0392b' },
  document: { icon: '📄', label: 'Document', bg: '#e8f8f0', color: '#1a7a4a' },
  other:    { icon: '📎', label: 'File',     bg: '#f0f0ff', color: '#4a3ab0' },
}

function fmtSize(bytes) {
  if (bytes == null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Full-screen viewer: image lightbox / inline PDF / download prompt ──
function FileViewer({ file, onClose }) {
  const [url, setUrl]         = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true); setError(''); setUrl('')
    apiFetch(`/therapist-portal/files/${file.id}/url`)
      .then(d => { if (!cancelled) setUrl(d.url) })
      .catch(e => { if (!cancelled) setError(e.message || 'Failed to load file.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [file.id])

  async function handleDownload() {
    try {
      const d = await apiFetch(`/therapist-portal/files/${file.id}/url?download=1`)
      const a = document.createElement('a')
      a.href = d.url; a.download = file.file_name
      document.body.appendChild(a); a.click(); a.remove()
    } catch (e) { alert(e.message || 'Download failed.') }
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,32,45,0.72)', zIndex: 2100,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: C.white, borderRadius: 16, width: '100%', maxWidth: 860,
          maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.9rem 1.25rem', borderBottom: `1px solid ${C.borderFaint}` }}>
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, color: C.textDark,
            fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.file_name}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <button onClick={handleDownload} style={{ padding: '0.4rem 0.9rem', borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.white, color: C.textMid,
              fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              ⬇ Download
            </button>
            <button onClick={onClose} style={{ padding: '0.4rem 0.75rem', borderRadius: 8,
              border: 'none', background: C.skyFaint, color: C.textMid, fontSize: '0.9rem',
              cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', background: '#f4f8fb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
          {loading && <p style={{ color: C.textLight, fontFamily: 'var(--font-body)' }}>Loading…</p>}
          {error && <p style={{ color: '#c0392b', fontFamily: 'var(--font-body)' }}>⚠ {error}</p>}
          {!loading && !error && url && file.category === 'image' && (
            <img src={url} alt={file.file_name} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
          )}
          {!loading && !error && url && file.category === 'pdf' && (
            <iframe src={url} title={file.file_name} style={{ width: '100%', height: '70vh', border: 'none' }} />
          )}
          {!loading && !error && url && !['image', 'pdf'].includes(file.category) && (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: C.textLight, fontFamily: 'var(--font-body)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{CATEGORY_META[file.category]?.icon || '📎'}</div>
              <p style={{ marginBottom: '1rem' }}>Preview isn't available for this file type in-browser.</p>
              <button onClick={handleDownload} style={{ padding: '0.6rem 1.4rem', borderRadius: 10,
                border: 'none', background: `linear-gradient(135deg,${C.skyDeep},${C.skyBright})`,
                color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                ⬇ Download to view
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClientFilesModal({ client, onClose }) {
  const [files, setFiles]           = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [uploading, setUploading]   = useState(false)
  const [viewerFile, setViewerFile] = useState(null)
  const [dragOver, setDragOver]     = useState(false)
  const fileInputRef                = useRef(null)

  // Works whether you pass a raw client object ({id, full_name, ...}) or
  // an appointment row that embeds it as appt.clients (as the dashboard does).
  const clientId   = client?.client_id || client?.id
  const clientName = client?.clients?.full_name || client?.full_name || 'Client'

  const loadFiles = useCallback(async () => {
    if (!clientId) return
    setLoading(true); setError('')
    try {
      const data = await apiFetch(`/therapist-portal/clients/${clientId}/files`)
      setFiles(data.files || [])
    } catch (e) {
      setError(e.message || 'Failed to load files.')
    } finally { setLoading(false) }
  }, [clientId])

  useEffect(() => { if (client) loadFiles() }, [client, loadFiles])

  async function handleUpload(fileList) {
    if (!fileList || fileList.length === 0) return
    setUploading(true); setError('')
    for (const f of fileList) {
      const form = new FormData()
      form.append('file', f)
      try {
        await apiFetch(`/therapist-portal/clients/${clientId}/files`, { method: 'POST', body: form })
      } catch (e) {
        setError(`Failed to upload "${f.name}": ${e.message}`)
      }
    }
    setUploading(false)
    loadFiles()
  }

  async function handleDelete(file) {
    if (!confirm(`Delete "${file.file_name}"? This can't be undone.`)) return
    try {
      await apiFetch(`/therapist-portal/files/${file.id}`, { method: 'DELETE' })
      setFiles(prev => prev.filter(f => f.id !== file.id))
    } catch (e) { setError(e.message || 'Failed to delete file.') }
  }

  if (!client) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(10,32,45,0.48)', zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      <div
        style={{ background: C.white, borderRadius: 20, width: '100%', maxWidth: 760,
          maxHeight: '86vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,60,90,0.28)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${C.borderFaint}`,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: C.textDark, fontWeight: 700 }}>
              {clientName} — Files
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: C.textLight }}>
              {files.length} file{files.length !== 1 ? 's' : ''}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none',
            background: C.skyFaint, color: C.textMid, fontSize: '1rem', cursor: 'pointer' }}>✕</button>
        </div>

        {/* upload zone */}
        <div style={{ padding: '1rem 1.5rem 0' }}>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }}
            onClick={() => fileInputRef.current?.click()}
            style={{ border: `2px dashed ${dragOver ? C.skyBright : C.border}`, borderRadius: 12,
              padding: '1.25rem', textAlign: 'center', cursor: 'pointer',
              background: dragOver ? C.skyFainter : 'transparent', transition: 'all 0.15s' }}
          >
            <input ref={fileInputRef} type="file" multiple hidden onChange={e => handleUpload(e.target.files)} />
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: C.textMid }}>
              {uploading ? 'Uploading…' : '📤 Click or drag files here to upload'}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: C.textLight, marginTop: '0.25rem' }}>
              Images, PDFs, Word docs — up to 25MB each
            </div>
          </div>
        </div>

        {error && (
          <div style={{ margin: '0.85rem 1.5rem 0', background: '#fff0f0', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '0.6rem 0.9rem', fontSize: '0.8rem', color: '#c0392b',
            fontFamily: 'var(--font-body)' }}>⚠ {error}</div>
        )}

        {/* file grid */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.5rem 1.5rem' }}>
          {loading ? (
            <p style={{ color: C.textLight, fontFamily: 'var(--font-body)', textAlign: 'center' }}>Loading files…</p>
          ) : files.length === 0 ? (
            <div style={{ textAlign: 'center', color: C.textLight, fontFamily: 'var(--font-body)', padding: '2rem 0' }}>
              No files uploaded for this client yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.9rem' }}>
              {files.map(f => {
                const meta = CATEGORY_META[f.category] || CATEGORY_META.other
                return (
                  <div
                    key={f.id}
                    style={{ border: `1px solid ${C.borderFaint}`, borderRadius: 12, overflow: 'hidden',
                      background: C.white, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onClick={() => setViewerFile(f)}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,191,255,0.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                  >
                    <div style={{ height: 100, background: meta.bg, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '2.2rem' }}>
                      {meta.icon}
                    </div>
                    <div style={{ padding: '0.65rem 0.75rem' }}>
                      <div title={f.file_name} style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem',
                        fontWeight: 700, color: C.textDark, whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis', marginBottom: '0.2rem' }}>
                        {f.file_name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', color: C.textLight,
                        display: 'flex', justifyContent: 'space-between' }}>
                        <span>{fmtSize(f.file_size)}</span>
                        <span>{fmtDate(f.created_at)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 700, color: meta.color,
                          background: meta.bg, padding: '0.12rem 0.45rem', borderRadius: 100,
                          textTransform: 'uppercase', letterSpacing: '0.05em' }}>{meta.label}</span>
                        <button onClick={e => { e.stopPropagation(); handleDelete(f) }}
                          style={{ border: 'none', background: 'none', color: '#c0392b',
                            fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {viewerFile && <FileViewer file={viewerFile} onClose={() => setViewerFile(null)} />}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   INTEGRATION — apply these small changes to TherapistDashboardPage.jsx
   ════════════════════════════════════════════════════════════════

   1) Export the shared palette so this file can reuse it:
        const C = {...}        →  export const C = {...}
        const GLASS = {...}    →  export const GLASS = {...}

   2) Import the modal at the top:
        import ClientFilesModal from '../components/ClientFilesModal'

   3) Add state near your other useState calls:
        const [filesClient, setFilesClient] = useState(null)

   4) In the Clients tab, make each client card open it — add onClick
      and cursor:'pointer' to the card wrapping div that currently reads:
        <div key={i} className="th-glass-card" style={{ ... }}>
      → 
        <div key={i} className="th-glass-card" onClick={() => setFilesClient(a)}
          style={{ ..., cursor:'pointer' }}>

   5) Render the modal near your other modals (MarkDoneModal, Toast):
        <ClientFilesModal client={filesClient} onClose={() => setFilesClient(null)} />

   That's it — clicking any client card now opens their file manager.
   ════════════════════════════════════════════════════════════════ */