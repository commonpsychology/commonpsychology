// src/pages/TherapistDashboardPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

// ── apiFetch: always reads the latest token ────────────────────
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('accessToken')

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    window.location.href = '/staff'
    throw new Error('Session expired. Please log in again.')
  }

  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

// ── Palette ────────────────────────────────────────────────────
const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', white:'#ffffff', mint:'#e8f3ee',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8',
}
const btnGrad  = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`
const heroGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 45%,${C.skyBright} 85%,#22d3ee 100%)`
const secGrad  = `linear-gradient(135deg,${C.skyFainter} 0%,${C.mint} 60%,${C.skyFaint} 100%)`

const CSS = `
  .th-layout { min-height:100vh; background:${C.skyFainter}; display:flex; flex-direction:column; }
  .th-topbar { background:${heroGrad}; padding:0.85rem clamp(1rem,3vw,2rem); display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:100; box-shadow:0 2px 12px rgba(0,0,0,0.15); }
  .th-tabbar { background:${C.white}; border-bottom:1px solid ${C.borderFaint}; display:flex; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; padding:0 clamp(0.5rem,3vw,2rem); }
  .th-tabbar::-webkit-scrollbar { display:none; }
  .th-tab-btn { flex-shrink:0; padding:0.85rem clamp(0.75rem,2vw,1.5rem); border:none; background:none; font-family:var(--font-body); font-size:0.85rem; cursor:pointer; transition:all 0.2s; border-bottom:2.5px solid transparent; white-space:nowrap; color:${C.textLight}; }
  .th-tab-btn.active { color:${C.skyDeep}; font-weight:700; border-bottom-color:${C.skyDeep}; }
  .th-content { padding:clamp(1rem,3vw,2rem); max-width:1100px; margin:0 auto; width:100%; }
  .th-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
  .th-stat-card { border-radius:14px; padding:clamp(1rem,3vw,1.5rem); border:1px solid ${C.borderFaint}; }
  .th-table-wrap { background:${C.white}; border-radius:14px; border:1px solid ${C.borderFaint}; overflow:auto; }
  table.th-table { width:100%; border-collapse:collapse; min-width:520px; }
  table.th-table th { padding:0.65rem 1rem; text-align:left; font-size:0.72rem; font-weight:800; color:${C.textLight}; text-transform:uppercase; letter-spacing:0.08em; border-bottom:1px solid ${C.borderFaint}; background:${secGrad}; white-space:nowrap; }
  table.th-table td { padding:0.75rem 1rem; font-size:0.84rem; color:${C.textMid}; border-bottom:1px solid ${C.borderFaint}; vertical-align:middle; }
  table.th-table tr:hover td { background:${C.skyFainter}; }
  .th-client-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1.25rem; }
  .th-action-btn { padding:0.32rem 0.85rem; border:none; border-radius:8px; font-size:0.78rem; font-weight:700; cursor:pointer; font-family:var(--font-body); transition:all 0.15s; }
  .th-action-btn:disabled { opacity:0.5; cursor:not-allowed; }
  .th-toast { position:fixed; bottom:1.5rem; right:1.5rem; z-index:9999; padding:0.85rem 1.25rem; border-radius:12px; font-family:var(--font-body); font-size:0.85rem; font-weight:600; box-shadow:0 8px 24px rgba(0,0,0,0.15); animation:thSlideIn 0.25s ease; max-width:360px; }
  .th-toast.error   { background:#fff0f0; border:1.5px solid #fca5a5; color:#c0392b; }
  .th-toast.success { background:#e8f8f0; border:1.5px solid #86efac; color:#1a7a4a; }
  @keyframes thSlideIn { from { transform:translateY(12px); opacity:0 } to { transform:translateY(0); opacity:1 } }
  @media(max-width:900px){ .th-stats{grid-template-columns:repeat(2,1fr);} }
  @media(max-width:600px){ .th-stats{grid-template-columns:1fr 1fr;gap:0.75rem;} .th-content{padding:0.85rem;} .th-topbar{padding:0.65rem 1rem;} .th-client-grid{grid-template-columns:1fr;} }
  @media(max-width:420px){ .th-stats{grid-template-columns:1fr;gap:0.6rem;} }
`

function injectCSS() {
  if (document.getElementById('therapist-dash-css')) return
  const s = document.createElement('style')
  s.id = 'therapist-dash-css'; s.textContent = CSS
  document.head.appendChild(s)
}

const STATUS_COLOR = {
  confirmed:{ bg:'#e8f8f0', color:'#1a7a4a' },
  pending:  { bg:'#fff5e6', color:'#8a5a1a' },
  completed:{ bg:'#e0f7ff', color:'#007BA8'  },
  cancelled:{ bg:'#fff0f0', color:'#c0392b'  },
  no_show:  { bg:'#fff0f0', color:'#c0392b'  },
}

function StatusBadge({ status }) {
  const s = STATUS_COLOR[status] || { bg:'#eee', color:'#444' }
  return (
    <span style={{ padding:'0.2rem 0.65rem', borderRadius:100, fontSize:'0.72rem', fontWeight:700,
      background:s.bg, color:s.color, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>
      {status?.replace(/_/g,' ')}
    </span>
  )
}

// ── Toast notification ─────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null
  return (
    <div className={`th-toast ${toast.type}`}>
      {toast.type === 'error' ? '⚠ ' : '✓ '}{toast.message}
    </div>
  )
}

function AuthSpinner() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:C.skyFainter }}>
      <div style={{ textAlign:'center', color:C.textLight }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🌿</div>
        <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem' }}>Verifying session…</p>
      </div>
    </div>
  )
}

function NoTherapistRecord({ userName }) {
  return (
    <div style={{ background:C.white, borderRadius:16, padding:'3rem 2rem',
      border:`1.5px solid ${C.borderFaint}`, textAlign:'center', maxWidth:500, margin:'4rem auto' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>⚠️</div>
      <h3 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'0.75rem' }}>
        Therapist Profile Not Found
      </h3>
      <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textMid,
        lineHeight:1.7, marginBottom:'1.5rem' }}>
        Hi <strong>{userName}</strong>, your staff account was created but the therapist profile
        record is missing. Please contact your admin — it takes less than a minute to fix.
      </p>
      <div style={{ background:C.skyFainter, borderRadius:10, padding:'1rem',
        border:`1px solid ${C.borderFaint}`, fontFamily:'var(--font-body)',
        fontSize:'0.8rem', color:C.textMid }}>
        📞 Admin: WhatsApp <strong>+977 9849350088</strong>
      </div>
    </div>
  )
}

const CONTACT_INFO = {
  whatsapp: {
    number: '+977 9849350088', link: 'https://wa.me/9779849350088',
    label: 'WhatsApp', emoji: '💬', color: '#25D366', faint: '#e8fdf0',
  },
  messenger: {
    number: 'puja.samargi', link: 'https://m.me/puja.samargi',
    label: 'Messenger', emoji: '💙', color: '#0084FF', faint: '#e0f0ff',
  },
}

function MessagingPanel() {
  const [copied, setCopied] = useState('')
  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(''), 2500)
  }
  return (
    <div>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.1rem,3vw,1.4rem)',
        color:C.textDark, marginBottom:'0.4rem' }}>Message Support</h2>
      <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textLight,
        marginBottom:'2rem', lineHeight:1.65 }}>
        Contact admin or client support via WhatsApp or Messenger.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.25rem' }}>
        {Object.entries(CONTACT_INFO).map(([key, info]) => (
          <div key={key} style={{ background:C.white, borderRadius:16,
            border:`1.5px solid ${C.borderFaint}`, overflow:'hidden',
            boxShadow:`0 4px 20px rgba(0,191,255,0.06)`, transition:'transform 0.2s,box-shadow 0.2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,191,255,0.12)' }}
            onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=`0 4px 20px rgba(0,191,255,0.06)` }}>
            <div style={{ background:info.faint, borderBottom:`1.5px solid ${info.color}22`,
              padding:'1.5rem 1.5rem 1.25rem', display:'flex', alignItems:'center', gap:'0.85rem' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:info.color,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.5rem', flexShrink:0, boxShadow:`0 4px 14px ${info.color}44` }}>
                {info.emoji}
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:C.textDark, fontWeight:700 }}>{info.label}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color:C.textLight, marginTop:2 }}>
                  {key === 'whatsapp' ? 'Message us directly on WhatsApp' : 'Find us on Facebook Messenger'}
                </div>
              </div>
            </div>
            <div style={{ padding:'1.25rem 1.5rem' }}>
              <div style={{ fontSize:'0.65rem', fontWeight:800, color:C.textLight,
                textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.5rem' }}>
                {key === 'whatsapp' ? 'Phone Number' : 'Page Handle'}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                background:'#f8fafc', borderRadius:10, padding:'0.65rem 0.85rem',
                border:`1px solid ${C.borderFaint}`, marginBottom:'1.1rem', gap:'0.75rem' }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem',
                  color:C.textDark, fontWeight:700 }}>{info.number}</span>
                <button onClick={() => copyToClipboard(info.number, key)}
                  style={{ padding:'0.3rem 0.8rem', borderRadius:7,
                    border:`1.5px solid ${copied===key ? '#22c55e' : C.borderFaint}`,
                    background:copied===key ? '#e8fdf0' : C.white,
                    color:copied===key ? '#065f46' : C.textMid,
                    fontSize:'0.74rem', fontWeight:700, cursor:'pointer',
                    transition:'all 0.18s', whiteSpace:'nowrap', fontFamily:'var(--font-body)' }}>
                  {copied===key ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>
              <a href={info.link} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
                  width:'100%', padding:'0.8rem 1rem', background:info.color,
                  color:'white', borderRadius:10, border:'none',
                  fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem',
                  cursor:'pointer', textDecoration:'none',
                  boxShadow:`0 4px 14px ${info.color}44`, transition:'opacity 0.18s' }}
                onMouseEnter={e=>e.currentTarget.style.opacity='0.88'}
                onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
                {info.emoji} Open {info.label}
              </a>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:'2rem', background:C.skyFainter, borderRadius:12,
        padding:'1.25rem 1.5rem', border:`1px solid ${C.borderFaint}`,
        display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
        <span style={{ fontSize:'1.2rem', flexShrink:0, marginTop:2 }}>🕐</span>
        <div>
          <div style={{ fontWeight:700, color:C.textDark, fontSize:'0.88rem',
            fontFamily:'var(--font-body)', marginBottom:'0.3rem' }}>Support Hours</div>
          <div style={{ fontSize:'0.82rem', color:C.textLight, fontFamily:'var(--font-body)', lineHeight:1.65 }}>
            Sunday – Friday: 9:00 AM – 6:00 PM (NPT)<br/>
            Saturday: 10:00 AM – 2:00 PM (NPT)<br/>
            We aim to respond within 2–4 hours during these hours.
          </div>
        </div>
      </div>
    </div>
  )
}

const TABS = ['Dashboard', 'My Schedule', 'Clients', 'Notes', 'Messages']

export default function TherapistDashboard() {
  useEffect(() => { injectCSS() }, [])

  const { navigate }                           = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [tab, setTab]                          = useState('Dashboard')
  const [appointments, setAppointments]        = useState([])
  const [loading, setLoading]                  = useState(false)
  const [error, setError]                      = useState('')
  const [noTherapistRecord, setNoTherapistRecord] = useState(false)
  // ── Per-appointment updating state so only the clicked button spins ──
  const [updatingIds, setUpdatingIds]          = useState(new Set())
  // ── Toast for status update feedback ──
  const [toast, setToast]                      = useState(null)
  const toastTimer                             = useRef(null)

  const hasLoaded = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/staff'); return }
    if (!['therapist', 'admin', 'staff'].includes(user.role)) { navigate('/staff'); return }
    if (!hasLoaded.current) { hasLoaded.current = true; loadAppointments() }
  }, [user, authLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(message, type = 'error') {
    clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  async function loadAppointments() {
    setLoading(true); setError(''); setNoTherapistRecord(false)
    try {
      const data = await apiFetch('/therapist-portal/appointments?limit=100')
      if (data.warning) { setNoTherapistRecord(true); setAppointments([]); return }
      setAppointments(data.appointments || [])
    } catch (err) {
      if (err.message !== 'Session expired. Please log in again.') {
        setError(err.message || 'Failed to load appointments.')
      }
      setAppointments([])
    } finally { setLoading(false) }
  }

  // ── updateStatus: optimistic UI + therapist-portal route ──────────────────
  async function updateStatus(id, newStatus) {
    if (updatingIds.has(id)) return  // prevent double-click

    // Save previous status for rollback
    const previous = appointments.find(a => a.id === id)?.status

    // 1. Optimistic update — UI responds instantly
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    setUpdatingIds(prev => new Set([...prev, id]))

    try {
      // 2. Use therapist-portal route — works for therapist, admin, and staff roles
      await apiFetch(`/therapist-portal/appointments/${id}/status`, {
        method: 'PATCH',
        body:   JSON.stringify({ status: newStatus }),
      })
      showToast(`Status updated to "${newStatus.replace(/_/g, ' ')}"`, 'success')
    } catch (err) {
      // 3. Rollback on failure
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: previous } : a))
      showToast(err.message || 'Failed to update status. Please try again.')
    } finally {
      setUpdatingIds(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  async function handleLogout() { await logout(); navigate('/staff') }

  const upcoming = appointments.filter(a => ['pending','confirmed'].includes(a.status))
  const past     = appointments.filter(a => ['completed','cancelled','no_show'].includes(a.status))
  const uniqueClients = [
    ...new Map(appointments.filter(a => a.clients?.full_name).map(a => [a.client_id, a])).values()
  ]

  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' })
  const fmtTime = d => new Date(d).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })
  const fmtFull = d => `${fmtDate(d)} at ${fmtTime(d)}`

  if (authLoading) return <AuthSpinner />
  if (!user) return null

  return (
    <div className="th-layout">
      <Toast toast={toast} />

      {/* ── Top bar ── */}
      <div className="th-topbar">
        <div style={{ display:'flex', alignItems:'center', gap:'0.85rem' }}>
          <img src="/header.png" alt="Common Psychology"
            style={{ height:32, objectFit:'contain' }}
            onError={e => e.target.style.display='none'}/>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color:'white' }}>Therapist Portal</div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', color:'rgba(255,255,255,0.65)' }}>Common Psychology</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'white', fontWeight:600 }}>
              {user?.fullName || user?.full_name || user?.displayName || 'Therapist'}
            </div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', color:'rgba(255,255,255,0.65)' }}>{user?.email}</div>
          </div>
          <button onClick={handleLogout}
            style={{ padding:'0.35rem 0.8rem', borderRadius:8, border:'1.5px solid rgba(255,255,255,0.35)',
              background:'rgba(255,255,255,0.12)', color:'white', fontSize:'0.78rem', cursor:'pointer',
              fontFamily:'var(--font-body)', whiteSpace:'nowrap' }}>
            Log Out
          </button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="th-tabbar">
        {TABS.map(t => (
          <button key={t} className={`th-tab-btn${tab===t?' active':''}`} onClick={() => setTab(t)}>
            {t === 'Messages' ? '💬 ' : ''}{t}
          </button>
        ))}
      </div>

      <div className="th-content">
        {noTherapistRecord && <NoTherapistRecord userName={user?.fullName || user?.full_name || 'there'} />}

        {error && !noTherapistRecord && (
          <div style={{ background:'#fff0f0', border:'1px solid #fca5a5', borderRadius:10,
            padding:'0.85rem 1.25rem', marginBottom:'1.25rem', fontFamily:'var(--font-body)',
            fontSize:'0.85rem', color:'#c0392b', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>⚠ {error}</span>
            <button onClick={loadAppointments}
              style={{ background:'none', border:'1px solid #fca5a5', borderRadius:6,
                padding:'0.25rem 0.75rem', color:'#c0392b', cursor:'pointer',
                fontSize:'0.78rem', fontFamily:'var(--font-body)' }}>Retry</button>
          </div>
        )}

        {!noTherapistRecord && (
          <>
            {/* ════ DASHBOARD ════ */}
            {tab === 'Dashboard' && (
              <div>
                <div className="th-stats">
                  {[
                    { label:'Upcoming Sessions',    val:upcoming.length,                               icon:'📅', color:C.skyFaint },
                    { label:'Completed Sessions',   val:past.filter(a=>a.status==='completed').length, icon:'✅', color:'#e8f8f0' },
                    { label:'Pending Confirmation', val:upcoming.filter(a=>a.status==='pending').length,icon:'⏳', color:'#fff5e6' },
                    { label:'Total Clients',        val:uniqueClients.length,                          icon:'👥', color:secGrad   },
                  ].map((c,i) => (
                    <div key={i} className="th-stat-card" style={{ background:c.color }}>
                      <div style={{ fontSize:'1.4rem', marginBottom:'0.3rem' }}>{c.icon}</div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,4vw,1.8rem)', color:C.textDark, fontWeight:700 }}>
                        {loading ? '…' : c.val}
                      </div>
                      <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:C.textLight, fontWeight:600 }}>{c.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                  <h3 style={{ fontFamily:'var(--font-display)', color:C.textDark, fontSize:'clamp(1rem,2.5vw,1.2rem)', margin:0 }}>
                    Upcoming Sessions
                  </h3>
                  <button onClick={loadAppointments}
                    style={{ padding:'0.35rem 0.85rem', border:`1px solid ${C.borderFaint}`, borderRadius:8,
                      background:C.white, color:C.textMid, fontSize:'0.78rem', cursor:'pointer', fontFamily:'var(--font-body)' }}>
                    🔄 Refresh
                  </button>
                </div>

                {loading ? (
                  <p style={{ color:C.textLight, fontFamily:'var(--font-body)' }}>Loading appointments…</p>
                ) : upcoming.length === 0 ? (
                  <div style={{ background:C.white, borderRadius:12, padding:'2.5rem',
                    border:`1px solid ${C.borderFaint}`, textAlign:'center', color:C.textLight }}>
                    <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>📅</div>
                    <p style={{ fontFamily:'var(--font-body)', margin:0 }}>No upcoming sessions.</p>
                  </div>
                ) : upcoming.slice(0,8).map((a,i) => {
                  const isUpdating = updatingIds.has(a.id)
                  return (
                    <div key={a.id||i}
                      style={{ background:C.white, borderRadius:12,
                        padding:'clamp(1rem,3vw,1.25rem) clamp(1rem,3vw,1.5rem)',
                        border:`1px solid ${C.borderFaint}`, marginBottom:'0.75rem',
                        display:'flex', justifyContent:'space-between',
                        alignItems:'center', flexWrap:'wrap', gap:'0.75rem',
                        opacity: isUpdating ? 0.75 : 1, transition:'opacity 0.15s' }}>
                      <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
                        <div style={{ width:40, height:40, borderRadius:'50%', background:C.skyFaint,
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:'1.1rem', flexShrink:0, overflow:'hidden' }}>
                          {a.clients?.avatar_url
                            ? <img src={a.clients.avatar_url} style={{ width:'100%',height:'100%',objectFit:'cover' }} alt=""/>
                            : '👤'}
                        </div>
                        <div>
                          <div style={{ fontFamily:'var(--font-body)', fontWeight:700, color:C.textDark }}>
                            {a.clients?.full_name || 'Client'}
                          </div>
                          <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.textLight }}>
                            {fmtFull(a.scheduled_at)} · {a.type}
                          </div>
                          {a.clients?.phone && (
                            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:C.textLight }}>
                              📞 {a.clients.phone}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'0.6rem', alignItems:'center', flexWrap:'wrap' }}>
                        <StatusBadge status={a.status}/>
                        {a.status === 'pending' && (
                          <button
                            className="th-action-btn"
                            disabled={isUpdating}
                            onClick={() => updateStatus(a.id, 'confirmed')}
                            style={{ background:btnGrad, color:'white' }}>
                            {isUpdating ? 'Saving…' : 'Confirm'}
                          </button>
                        )}
                        {a.status === 'confirmed' && (
                          <button
                            className="th-action-btn"
                            disabled={isUpdating}
                            onClick={() => updateStatus(a.id, 'completed')}
                            style={{ border:`1px solid #22c55e`, background:'#e8f8f0', color:'#1a7a4a' }}>
                            {isUpdating ? 'Saving…' : 'Mark Done'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ════ MY SCHEDULE ════ */}
            {tab === 'My Schedule' && (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
                  <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark, fontSize:'clamp(1.1rem,3vw,1.4rem)', margin:0 }}>
                    My Schedule ({appointments.length} total)
                  </h2>
                  <button onClick={loadAppointments}
                    style={{ padding:'0.4rem 0.9rem', border:`1px solid ${C.borderFaint}`, borderRadius:8,
                      background:C.white, color:C.textMid, fontSize:'0.8rem', cursor:'pointer', fontFamily:'var(--font-body)' }}>
                    🔄 Refresh
                  </button>
                </div>
                <div className="th-table-wrap">
                  <table className="th-table">
                    <thead>
                      <tr>{['Client','Phone','Date','Time','Type','Status'].map(h=>(
                        <th key={h}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} style={{ textAlign:'center',padding:'2rem',color:C.textLight }}>Loading…</td></tr>
                      ) : appointments.length === 0 ? (
                        <tr><td colSpan={7} style={{ textAlign:'center',padding:'2rem',color:C.textLight }}>No appointments found.</td></tr>
                      ) : appointments.map((a,i) => {
                        const isUpdating = updatingIds.has(a.id)
                        return (
                          <tr key={a.id||i} style={{ opacity: isUpdating ? 0.6 : 1, transition:'opacity 0.15s' }}>
                            <td><strong style={{ color:C.textDark,fontFamily:'var(--font-body)' }}>{a.clients?.full_name||'—'}</strong></td>
                            <td style={{ fontFamily:'var(--font-body)',fontSize:'0.78rem',color:C.textLight }}>{a.clients?.phone||'—'}</td>
                            <td style={{ fontFamily:'var(--font-body)' }}>{fmtDate(a.scheduled_at)}</td>
                            <td style={{ fontFamily:'var(--font-body)' }}>{fmtTime(a.scheduled_at)}</td>
                            <td style={{ fontFamily:'var(--font-body)' }}>
                              <span style={{ fontSize:'0.75rem',background:'#f0f4f8',padding:'0.18rem 0.5rem',borderRadius:5 }}>{a.type}</span>
                            </td>
                            <td><StatusBadge status={a.status}/></td>
                            <td>
  {/* {(() => {
    const ps = a.payment_status || 'unpaid'
    const styles = {
      paid:    { bg: '#e8f8f0', color: '#1a7a4a', label: '✓ Paid'    },
      pending: { bg: '#fff5e6', color: '#8a5a1a', label: '⏳ Pending' },
      unpaid:  { bg: '#fff0f0', color: '#c0392b', label: '✗ Unpaid'  },
      refunded:{ bg: '#f0f0ff', color: '#4a3ab0', label: '↩ Refunded'},
    }
    const s = styles[ps] || styles.unpaid
    return (
      <span style={{
        padding: '0.2rem 0.65rem', borderRadius: 100, fontSize: '0.72rem',
        fontWeight: 700, background: s.bg, color: s.color,
        textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap'
      }}>
        {s.label}
      </span>
    )
  })()} */}
</td>
                            <td>
                              {/* ── The select now calls updateStatus which uses the correct route ── */}
                              <select
                                value={a.status}
                                disabled={isUpdating}
                                onChange={async e => {
                                  const newStatus = e.target.value
                                  if (newStatus === a.status) return
                                  await updateStatus(a.id, newStatus)
                                }}
                                style={{ padding:'0.3rem 0.5rem', border:`1px solid ${C.borderFaint}`,
                                  borderRadius:6, fontSize:'0.78rem', cursor: isUpdating ? 'not-allowed' : 'pointer',
                                  outline:'none', fontFamily:'var(--font-body)', color:C.textMid,
                                  opacity: isUpdating ? 0.5 : 1 }}>
                                {['confirmed','completed','no_show'].map(s=>(
                                  <option key={s} value={s}>{s.replace(/_/g,' ')}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ════ CLIENTS ════ */}
            {tab === 'Clients' && (
              <div>
                <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark,
                  marginBottom:'1.25rem', fontSize:'clamp(1.1rem,3vw,1.4rem)' }}>
                  My Clients ({uniqueClients.length})
                </h2>
                {loading ? (
                  <p style={{ color:C.textLight, fontFamily:'var(--font-body)' }}>Loading…</p>
                ) : uniqueClients.length === 0 ? (
                  <div style={{ background:C.white, borderRadius:14, padding:'2.5rem',
                    border:`1px solid ${C.borderFaint}`, textAlign:'center', color:C.textLight }}>
                    <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>👥</div>
                    <p style={{ fontFamily:'var(--font-body)', margin:0 }}>No clients yet.</p>
                  </div>
                ) : (
                  <div className="th-client-grid">
                    {uniqueClients.map((a,i) => {
                      const clientSessions = appointments.filter(ap => ap.client_id === a.client_id)
                      const lastSession    = clientSessions[0]
                      return (
                        <div key={i} style={{ background:C.white, borderRadius:14, padding:'1.5rem',
                          border:`1px solid ${C.borderFaint}`, boxShadow:`0 2px 10px rgba(0,191,255,0.05)` }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'0.85rem', marginBottom:'1rem' }}>
                            <div style={{ width:44, height:44, borderRadius:'50%', background:btnGrad,
                              display:'flex', alignItems:'center', justifyContent:'center',
                              color:'white', fontWeight:800, fontSize:'1rem', flexShrink:0, overflow:'hidden' }}>
                              {a.clients?.avatar_url
                                ? <img src={a.clients.avatar_url} style={{ width:'100%',height:'100%',objectFit:'cover' }} alt=""/>
                                : (a.clients?.full_name||'C').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()
                              }
                            </div>
                            <div>
                              <div style={{ fontFamily:'var(--font-body)', fontWeight:700, color:C.textDark }}>{a.clients?.full_name||'—'}</div>
                              <div style={{ fontSize:'0.75rem', color:C.textLight, fontFamily:'var(--font-body)' }}>{a.clients?.email||''}</div>
                              {a.clients?.phone && (
                                <div style={{ fontSize:'0.72rem', color:C.textLight, fontFamily:'var(--font-body)' }}>📞 {a.clients.phone}</div>
                              )}
                            </div>
                          </div>
                          <div style={{ borderTop:`1px solid ${C.borderFaint}`, paddingTop:'0.75rem' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-body)', fontSize:'0.75rem', color:C.textLight, marginBottom:'0.35rem' }}>
                              <span>Sessions</span><strong style={{ color:C.textDark }}>{clientSessions.length}</strong>
                            </div>
                            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-body)', fontSize:'0.75rem', color:C.textLight, marginBottom:'0.5rem' }}>
                              <span>Last session</span><span>{lastSession ? fmtDate(lastSession.scheduled_at) : '—'}</span>
                            </div>
                            {lastSession && <StatusBadge status={lastSession.status}/>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ════ NOTES ════ */}
            {tab === 'Notes' && (
              <div>
                <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'1.25rem', fontSize:'clamp(1.1rem,3vw,1.4rem)' }}>
                  Session Notes
                </h2>
                {past.filter(a=>a.status==='completed').length === 0 ? (
                  <div style={{ background:C.white, borderRadius:14, padding:'2.5rem',
                    border:`1px solid ${C.borderFaint}`, textAlign:'center', color:C.textLight }}>
                    <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>📝</div>
                    <p style={{ fontFamily:'var(--font-body)', marginBottom:'1.5rem', lineHeight:1.7 }}>
                      Session notes appear here after sessions are marked as completed.
                    </p>
                    <button onClick={() => setTab('My Schedule')}
                      style={{ padding:'0.65rem 1.5rem', border:`1.5px solid ${C.skyBright}`,
                        borderRadius:10, background:'transparent', color:C.skyMid,
                        fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>
                      View My Schedule →
                    </button>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {past.filter(a=>a.status==='completed').map((a,i) => (
                      <div key={a.id||i} style={{ background:C.white, borderRadius:12, padding:'1.25rem 1.5rem', border:`1px solid ${C.borderFaint}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem', flexWrap:'wrap', gap:'0.5rem' }}>
                          <div>
                            <div style={{ fontFamily:'var(--font-body)', fontWeight:700, color:C.textDark, marginBottom:'0.2rem' }}>{a.clients?.full_name||'Client'}</div>
                            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color:C.textLight }}>{fmtFull(a.scheduled_at)} · {a.type}</div>
                          </div>
                          <StatusBadge status={a.status}/>
                          {/* Payment indicator — helps therapist know if session is confirmed/paid */}
{a.payment_status && a.payment_status !== 'paid' && (
  <span style={{
    fontSize: '0.68rem', fontWeight: 700, padding: '0.2rem 0.55rem',
    borderRadius: 100,
    background: a.payment_status === 'pending' ? '#fff5e6' : '#fff0f0',
    color:      a.payment_status === 'pending' ? '#8a5a1a' : '#c0392b',
  }}>
    {a.payment_status === 'pending' ? '⏳ Payment pending' : '✗ Unpaid'}
  </span>
)}
                        </div>
                        {a.notes ? (
                          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textMid, lineHeight:1.7, margin:0, background:C.skyFainter, padding:'0.75rem', borderRadius:8 }}>
                            {a.notes}
                          </p>
                        ) : (
                          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.textLight, margin:0, fontStyle:'italic' }}>
                            No session notes recorded.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ════ MESSAGES ════ */}
            {tab === 'Messages' && <MessagingPanel />}
          </>
        )}
      </div>
    </div>
  )
}
