// src/pages/StaffPortalPage.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Staff Portal — Patient Registration & Records
// • Matches the sky-blue design system used in StaffLoginPage
// • Route: /staff/portal  (add to ROUTES in App.jsx and NO_SHELL_PAGES)
// • Redirects non-staff/non-admin roles away on mount
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth }   from '../context/AuthContext'
import { useRouter } from '../context/RouterContext'

// ── Design tokens (same palette as StaffLoginPage) ───────────────────────────
const C = {
  skyBright:   '#00BFFF',
  skyMid:      '#009FD4',
  skyDeep:     '#007BA8',
  skyFaint:    '#E0F7FF',
  skyFainter:  '#F0FBFF',
  skyGhost:    '#F8FEFF',
  white:       '#ffffff',
  mint:        '#e8f3ee',
  textDark:    '#1a3a4a',
  textMid:     '#2e6080',
  textLight:   '#7a9aaa',
  border:      '#b0d4e8',
  borderFaint: '#daeef8',
  success:     '#16a34a',
  successBg:   '#f0fdf4',
  error:       '#dc2626',
  errorBg:     '#fef2f2',
  warn:        '#b45309',
  warnBg:      '#fffbeb',
}
const heroGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 45%,${C.skyBright} 85%,#22d3ee 100%)`
const btnGrad  = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`

const API_BASE = import.meta.env.VITE_API_URL || ''

// ── Injected CSS ──────────────────────────────────────────────────────────────
const CSS = `
  .sp-root { min-height:100vh; background:${C.skyGhost}; font-family:var(--font-body); }
  .sp-topbar { background:${heroGrad}; padding:0 2rem; height:60px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; box-shadow:0 2px 12px rgba(0,127,168,0.25); }
  .sp-topbar-title { font-family:var(--font-display); color:white; font-size:1.1rem; font-weight:700; display:flex; align-items:center; gap:0.6rem; }
  .sp-topbar-user { display:flex; align-items:center; gap:0.75rem; }
  .sp-logout-btn { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); color:white; border-radius:8px; padding:0.35rem 0.9rem; font-family:var(--font-body); font-size:0.78rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .sp-logout-btn:hover { background:rgba(255,255,255,0.25); }

  .sp-tabs { display:flex; gap:0; border-bottom:2px solid ${C.borderFaint}; background:${C.white}; padding:0 2rem; }
  .sp-tab { padding:0.85rem 1.5rem; font-family:var(--font-body); font-size:0.85rem; font-weight:700; color:${C.textLight}; cursor:pointer; border-bottom:3px solid transparent; margin-bottom:-2px; transition:all 0.18s; letter-spacing:0.03em; }
  .sp-tab:hover { color:${C.skyMid}; }
  .sp-tab.active { color:${C.skyDeep}; border-bottom-color:${C.skyBright}; }

  .sp-body { max-width:1200px; margin:0 auto; padding:2rem 1.5rem; }

  /* ── Table panel ── */
  .sp-card { background:${C.white}; border-radius:16px; border:1px solid ${C.borderFaint}; box-shadow:0 2px 12px rgba(0,191,255,0.07); overflow:hidden; }
  .sp-card-header { display:flex; align-items:center; justify-content:space-between; padding:1.25rem 1.5rem; border-bottom:1px solid ${C.borderFaint}; flex-wrap:wrap; gap:0.75rem; }
  .sp-card-title { font-family:var(--font-display); font-size:1.05rem; color:${C.textDark}; font-weight:700; }
  .sp-search { padding:0.55rem 1rem; border:1.5px solid ${C.borderFaint}; border-radius:10px; font-family:var(--font-body); font-size:0.85rem; color:${C.textDark}; width:220px; outline:none; transition:all 0.18s; }
  .sp-search:focus { border-color:${C.skyBright}; box-shadow:0 0 0 3px rgba(0,191,255,0.1); }
  .sp-date-input { padding:0.55rem 1rem; border:1.5px solid ${C.borderFaint}; border-radius:10px; font-family:var(--font-body); font-size:0.85rem; color:${C.textDark}; outline:none; transition:all 0.18s; }
  .sp-date-input:focus { border-color:${C.skyBright}; box-shadow:0 0 0 3px rgba(0,191,255,0.1); }

  .sp-table-wrap { overflow-x:auto; }
  .sp-table { width:100%; border-collapse:collapse; }
  .sp-table th { background:${C.skyFainter}; color:${C.skyDeep}; font-family:var(--font-body); font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; padding:0.75rem 1rem; text-align:left; border-bottom:2px solid ${C.borderFaint}; white-space:nowrap; }
  .sp-table td { padding:0.8rem 1rem; font-family:var(--font-body); font-size:0.84rem; color:${C.textDark}; border-bottom:1px solid ${C.borderFaint}; vertical-align:middle; }
  .sp-table tr:last-child td { border-bottom:none; }
  .sp-table tbody tr:hover { background:${C.skyFainter}; }
  .sp-status { display:inline-block; padding:0.2rem 0.65rem; border-radius:100px; font-size:0.7rem; font-weight:700; }
  .sp-status.active    { background:#dcfce7; color:#166534; }
  .sp-status.discharged { background:#f3f4f6; color:#6b7280; }
  .sp-status.follow-up { background:#fef9c3; color:#854d0e; }
  .sp-print-btn { background:none; border:1.5px solid ${C.borderFaint}; border-radius:8px; padding:0.3rem 0.75rem; font-family:var(--font-body); font-size:0.75rem; font-weight:700; color:${C.skyMid}; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
  .sp-print-btn:hover { background:${C.skyFaint}; border-color:${C.skyBright}; }
  .sp-empty { text-align:center; padding:3rem 1rem; color:${C.textLight}; font-family:var(--font-body); }

  /* ── Form panel ── */
  .sp-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; padding:1.5rem; }
  .sp-form-full { grid-column:1/-1; }
  .sp-label { display:block; font-family:var(--font-body); font-size:0.7rem; font-weight:800; color:${C.skyDeep}; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.45rem; }
  .sp-input { width:100%; padding:0.75rem 1rem; border:1.5px solid ${C.borderFaint}; border-radius:10px; font-family:var(--font-body); font-size:0.88rem; color:${C.textDark}; background:${C.white}; outline:none; box-sizing:border-box; transition:all 0.18s; }
  .sp-input:focus { border-color:${C.skyBright}; background:${C.skyGhost}; box-shadow:0 0 0 3px rgba(0,191,255,0.1); }
  .sp-textarea { width:100%; padding:0.75rem 1rem; border:1.5px solid ${C.borderFaint}; border-radius:10px; font-family:var(--font-body); font-size:0.88rem; color:${C.textDark}; background:${C.white}; outline:none; box-sizing:border-box; resize:vertical; min-height:90px; transition:all 0.18s; }
  .sp-textarea:focus { border-color:${C.skyBright}; background:${C.skyGhost}; box-shadow:0 0 0 3px rgba(0,191,255,0.1); }
  .sp-select { width:100%; padding:0.75rem 1rem; border:1.5px solid ${C.borderFaint}; border-radius:10px; font-family:var(--font-body); font-size:0.88rem; color:${C.textDark}; background:${C.white}; outline:none; box-sizing:border-box; transition:all 0.18s; appearance:none; }
  .sp-select:focus { border-color:${C.skyBright}; box-shadow:0 0 0 3px rgba(0,191,255,0.1); }
  .sp-form-actions { display:flex; gap:1rem; align-items:center; padding:0 1.5rem 1.5rem; }
  .sp-submit-btn { padding:0.85rem 2rem; border-radius:12px; border:none; background:${btnGrad}; color:white; font-family:var(--font-body); font-weight:800; font-size:0.92rem; cursor:pointer; box-shadow:0 4px 16px rgba(0,191,255,0.3); transition:all 0.2s; }
  .sp-submit-btn:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
  .sp-submit-btn:disabled { background:${C.borderFaint}; color:${C.textLight}; box-shadow:none; cursor:not-allowed; }
  .sp-reset-btn { padding:0.85rem 1.5rem; border-radius:12px; border:1.5px solid ${C.borderFaint}; background:${C.white}; color:${C.textMid}; font-family:var(--font-body); font-weight:700; font-size:0.88rem; cursor:pointer; transition:all 0.2s; }
  .sp-reset-btn:hover { background:${C.skyFainter}; border-color:${C.skyBright}; }
  .sp-alert { display:flex; gap:0.6rem; align-items:flex-start; padding:0.85rem 1rem; border-radius:10px; margin:0 1.5rem 1rem; font-family:var(--font-body); font-size:0.84rem; line-height:1.5; }
  .sp-alert.success { background:${C.successBg}; border:1.5px solid #bbf7d0; color:${C.success}; }
  .sp-alert.error   { background:${C.errorBg};   border:1.5px solid #fecaca; color:${C.error}; }
  .sp-loading { text-align:center; padding:2rem; color:${C.textLight}; }

  /* ── Pagination ── */
  .sp-pager { display:flex; align-items:center; justify-content:flex-end; gap:0.5rem; padding:0.85rem 1.5rem; border-top:1px solid ${C.borderFaint}; }
  .sp-page-btn { padding:0.35rem 0.75rem; border-radius:8px; border:1.5px solid ${C.borderFaint}; background:${C.white}; color:${C.textMid}; font-family:var(--font-body); font-size:0.78rem; font-weight:700; cursor:pointer; transition:all 0.15s; }
  .sp-page-btn:hover:not(:disabled) { background:${C.skyFaint}; border-color:${C.skyBright}; }
  .sp-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .sp-page-info { font-family:var(--font-body); font-size:0.78rem; color:${C.textLight}; padding:0 0.5rem; }

  @media (max-width:700px) {
    .sp-form-grid { grid-template-columns:1fr; }
    .sp-topbar { padding:0 1rem; }
    .sp-body { padding:1rem; }
    .sp-tabs { padding:0 0.5rem; overflow-x:auto; }
    .sp-tab { padding:0.7rem 1rem; font-size:0.8rem; }
    .sp-card-header { flex-direction:column; align-items:flex-start; }
  }

  /* ── Print slip (hidden on screen, shown only when printing) ── */
  @media print {
    body * { visibility:hidden !important; }
    #slip-print-area, #slip-print-area * { visibility:visible !important; }
    #slip-print-area {
      position:fixed !important;
      top:0 !important; left:0 !important;
      width:80mm !important;
      padding:0 !important;
      margin:0 !important;
    }
  }
`

function injectCSS(id, css) {
  if (document.getElementById(id)) return
  const s = document.createElement('style')
  s.id = id; s.textContent = css
  document.head.appendChild(s)
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcAge(dob) {
  if (!dob) return '—'
  const today = new Date()
  const b = new Date(dob)
  let age = today.getFullYear() - b.getFullYear()
  const m = today.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--
  return age
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// ── Registration Slip Component ───────────────────────────────────────────────
function RegistrationSlip({ patient }) {
  if (!patient) return null
  const age = calcAge(patient.date_of_birth)
  const date = formatDate(patient.registered_at)
  const time = formatTime(patient.registered_at)

  return (
    <div
      id="slip-print-area"
      style={{
        width: '76mm',
        background: '#fff',
        border: '1px dashed #aaa',
        borderRadius: 4,
        padding: '6px 8px',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: '9.5pt',
        lineHeight: 1.55,
        color: '#111',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '1px solid #ccc', paddingBottom: 4, marginBottom: 5 }}>
        <div style={{ fontWeight: 'bold', fontSize: '10.5pt', letterSpacing: '0.03em' }}>COMMON PSYCHOLOGY</div>
        <div style={{ fontSize: '7.5pt', color: '#444' }}>PATIENT REGISTRATION SLIP</div>
      </div>

      {/* Token */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontWeight: 'bold', fontSize: '8pt' }}>Token #:</span>
        <span style={{ fontWeight: 'bold', fontSize: '10pt' }}>{patient.token_number || '—'}</span>
      </div>

      <SlipRow label="Date"    value={date} />
      <SlipRow label="Time"    value={time} />
      <div style={{ borderTop: '1px dashed #ddd', margin: '4px 0' }} />
      <SlipRow label="Name"    value={patient.full_name} bold />
      <SlipRow label="Age"     value={`${age} yrs`} />
      <SlipRow label="Gender"  value={patient.gender} />
      <SlipRow label="DOB"     value={formatDate(patient.date_of_birth)} />
      <SlipRow label="Address" value={patient.address} />
      {patient.phone && <SlipRow label="Phone" value={patient.phone} />}
      <div style={{ borderTop: '1px dashed #ddd', margin: '4px 0' }} />
      <div style={{ fontSize: '8.5pt' }}>
        <span style={{ fontWeight: 'bold' }}>Complaints: </span>
        <span>{patient.complaints}</span>
      </div>
      <div style={{ borderTop: '1px dashed #ddd', margin: '5px 0 3px' }} />
      <div style={{ textAlign: 'center', fontSize: '7.5pt', color: '#666' }}>
        Paste this slip in patient card
      </div>
    </div>
  )
}

function SlipRow({ label, value, bold }) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 1 }}>
      <span style={{ minWidth: 55, fontWeight: 'bold', fontSize: '8.5pt', flexShrink: 0 }}>{label}:</span>
      <span style={{ fontSize: '8.5pt', fontWeight: bold ? 'bold' : 'normal', wordBreak: 'break-word' }}>{value || '—'}</span>
    </div>
  )
}

// ── Slip Print Modal ──────────────────────────────────────────────────────────
function SlipModal({ patient, onClose }) {
  function handlePrint() {
    window.print()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        background: C.white, borderRadius: 16, width: '100%', maxWidth: 420,
        boxShadow: '0 16px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
      }}>
        <div style={{
          background: heroGrad, padding: '1rem 1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-display)', color: 'white', fontWeight: 700 }}>
            🖨️ Registration Slip Preview
          </span>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: 8, padding: '0.3rem 0.7rem', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700 }}>
            ✕
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <RegistrationSlip patient={patient} />
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <button
              onClick={handlePrint}
              style={{ flex: 1, padding: '0.85rem', borderRadius: 12, border: 'none', background: btnGrad, color: 'white', fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,191,255,0.3)' }}
            >
              🖨️ Print Slip
            </button>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: '0.85rem', borderRadius: 12, border: `1.5px solid ${C.borderFaint}`, background: C.white, color: C.textMid, fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StaffPortalPage() {
  useEffect(() => { injectCSS('sp-css', CSS) }, [])

  const { user, logout } = useAuth()
  const { navigate }     = useRouter()

  // Guard: only staff (not therapist, not admin going elsewhere)
  useEffect(() => {
    if (!user) { navigate('/staff'); return }
    if (user.role === 'therapist') { navigate('/staff/therapist'); return }
    if (user.role === 'admin')     { navigate('/staff/admin'); return }
    if (!['staff'].includes(user.role)) { navigate('/staff'); return }
  }, [user])

  // Tabs: 'records' | 'register'
  const [tab, setTab] = useState('records')

  // ── Records state ─────────────────────────────────────────────
  const [patients,  setPatients]  = useState([])
  const [loading,   setLoading]   = useState(false)
  const [search,    setSearch]    = useState('')
  const [dateFilter, setDateFilter] = useState(todayISO())
  const [page,      setPage]      = useState(0)
  const [total,     setTotal]     = useState(0)
  const PAGE_SIZE = 20

  // ── Form state ────────────────────────────────────────────────
  const EMPTY_FORM = { full_name:'', date_of_birth:'', gender:'', address:'', phone:'', complaints:'' }
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [formMsg,    setFormMsg]    = useState(null) // { type:'success'|'error', text }
  const [lastPatient, setLastPatient] = useState(null)

  // ── Slip modal ─────────────────────────────────────────────────
  const [slipPatient, setSlipPatient] = useState(null)

  // ── Fetch patients ────────────────────────────────────────────
  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({
        limit:  PAGE_SIZE,
        offset: page * PAGE_SIZE,
        ...(dateFilter && { date: dateFilter }),
        ...(search     && { search }),
      })
      const res = await fetch(`${API_BASE}/patients?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load patients')
      setPatients(data.patients || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [page, dateFilter, search])

  useEffect(() => {
    if (tab === 'records') fetchPatients()
  }, [tab, fetchPatients])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(0)
      if (tab === 'records') fetchPatients()
    }, 350)
    return () => clearTimeout(t)
  }, [search, dateFilter])

  // ── Form submit ────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault()
    setFormMsg(null)

    const { full_name, date_of_birth, gender, address, complaints } = form
    if (!full_name || !date_of_birth || !gender || !address || !complaints) {
      setFormMsg({ type: 'error', text: 'Please fill in all required fields.' })
      return
    }

    setSubmitting(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${API_BASE}/api/patients`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')

      setLastPatient(data.patient)
      setFormMsg({ type: 'success', text: `Patient "${data.patient.full_name}" registered successfully! Token #${data.patient.token_number}` })
      setForm(EMPTY_FORM)
      setSlipPatient(data.patient) // auto-open print modal
    } catch (err) {
      setFormMsg({ type: 'error', text: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  function handleField(k) {
    return e => setForm(f => ({ ...f, [k]: e.target.value }))
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="sp-root">

      {/* Top bar */}
      <div className="sp-topbar">
        <div className="sp-topbar-title">
          <img src="/header.png" alt="" style={{ height: 30, objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
          <span>Common Psychology — Staff Portal</span>
        </div>
        <div className="sp-topbar-user">
          <span style={{ fontFamily: 'var(--font-body)', color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem' }}>
            👤 {user?.full_name || user?.email}
          </span>
          <button className="sp-logout-btn" onClick={() => { logout(); navigate('/staff') }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sp-tabs">
        <div className={`sp-tab${tab === 'records' ? ' active' : ''}`} onClick={() => setTab('records')}>
          📋 Patient Records
        </div>
        <div className={`sp-tab${tab === 'register' ? ' active' : ''}`} onClick={() => { setTab('register'); setFormMsg(null) }}>
          ➕ Register Patient
        </div>
      </div>

      <div className="sp-body">

        {/* ══ RECORDS TAB ══════════════════════════════════════════ */}
        {tab === 'records' && (
          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-title">📋 Incoming Patients</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Date filter */}
                <input
                  type="date"
                  className="sp-date-input"
                  value={dateFilter}
                  onChange={e => { setDateFilter(e.target.value); setPage(0) }}
                  title="Filter by date"
                />
                {/* Search */}
                <input
                  type="text"
                  className="sp-search"
                  placeholder="🔍 Search name or phone…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {/* Register shortcut */}
                <button
                  onClick={() => setTab('register')}
                  style={{ padding: '0.55rem 1.1rem', borderRadius: 10, border: 'none', background: btnGrad, color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  + New Patient
                </button>
              </div>
            </div>

            {loading ? (
              <div className="sp-loading">⏳ Loading patients…</div>
            ) : patients.length === 0 ? (
              <div className="sp-empty">
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗂️</div>
                <p>No patients found{dateFilter ? ` for ${formatDate(dateFilter + 'T00:00:00')}` : ''}.</p>
              </div>
            ) : (
              <>
                <div className="sp-table-wrap">
                  <table className="sp-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Token</th>
                        <th>Full Name</th>
                        <th>Age</th>
                        <th>Gender</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Complaints</th>
                        <th>Reg. Time</th>
                        <th>Status</th>
                        <th>Slip</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((p, i) => (
                        <tr key={p.id}>
                          <td style={{ color: C.textLight, fontSize: '0.78rem' }}>{page * PAGE_SIZE + i + 1}</td>
                          <td style={{ fontWeight: 700, color: C.skyDeep }}>#{p.token_number}</td>
                          <td style={{ fontWeight: 600 }}>{p.full_name}</td>
                          <td>{calcAge(p.date_of_birth)} yrs</td>
                          <td>{p.gender}</td>
                          <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.address}</td>
                          <td>{p.phone || '—'}</td>
                          <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.complaints}</td>
                          <td style={{ fontSize: '0.78rem', color: C.textLight, whiteSpace: 'nowrap' }}>
                            {formatDate(p.registered_at)}<br />
                            <span style={{ fontSize: '0.7rem' }}>{formatTime(p.registered_at)}</span>
                          </td>
                          <td>
                            <span className={`sp-status ${p.status}`}>{p.status}</span>
                          </td>
                          <td>
                            <button className="sp-print-btn" onClick={() => setSlipPatient(p)}>
                              🖨️ Slip
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="sp-pager">
                  <span className="sp-page-info">
                    {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                  </span>
                  <button className="sp-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <button className="sp-page-btn" disabled={(page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ REGISTER TAB ═════════════════════════════════════════ */}
        {tab === 'register' && (
          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-title">➕ Register New Patient</div>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: C.textLight }}>
                A printable slip will be generated after registration.
              </span>
            </div>

            {/* Alert */}
            {formMsg && (
              <div className={`sp-alert ${formMsg.type}`}>
                <span>{formMsg.type === 'success' ? '✅' : '⚠️'}</span>
                <span>{formMsg.text}</span>
              </div>
            )}

            {/* Last registered — quick reprint */}
            {lastPatient && !slipPatient && (
              <div style={{ margin: '0 1.5rem 0.75rem', padding: '0.75rem 1rem', background: C.skyFainter, border: `1px solid ${C.borderFaint}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', color: C.textMid }}>
                  Last registered: <strong>{lastPatient.full_name}</strong> — Token #{lastPatient.token_number}
                </span>
                <button className="sp-print-btn" onClick={() => setSlipPatient(lastPatient)}>
                  🖨️ Reprint Slip
                </button>
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="sp-form-grid">

                {/* Full Name */}
                <div>
                  <label className="sp-label">Full Name <span style={{ color: C.skyBright }}>*</span></label>
                  <input className="sp-input" value={form.full_name} onChange={handleField('full_name')} placeholder="e.g. Ram Bahadur Thapa" required />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="sp-label">Date of Birth <span style={{ color: C.skyBright }}>*</span></label>
                  <input type="date" className="sp-input" value={form.date_of_birth} onChange={handleField('date_of_birth')} required />
                </div>

                {/* Gender */}
                <div>
                  <label className="sp-label">Gender <span style={{ color: C.skyBright }}>*</span></label>
                  <select className="sp-select" value={form.gender} onChange={handleField('gender')} required>
                    <option value="">Select gender…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="sp-label">Phone</label>
                  <input className="sp-input" type="tel" value={form.phone} onChange={handleField('phone')} placeholder="e.g. 98XXXXXXXX" />
                </div>

                {/* Address */}
                <div className="sp-form-full">
                  <label className="sp-label">Address <span style={{ color: C.skyBright }}>*</span></label>
                  <input className="sp-input" value={form.address} onChange={handleField('address')} placeholder="e.g. Kathmandu-10, Baneshwor" required />
                </div>

                {/* Complaints */}
                <div className="sp-form-full">
                  <label className="sp-label">Chief Complaints <span style={{ color: C.skyBright }}>*</span></label>
                  <textarea className="sp-textarea" value={form.complaints} onChange={handleField('complaints')} placeholder="Describe presenting complaints / reason for visit…" required />
                </div>

              </div>

              {/* Calculated age preview */}
              {form.date_of_birth && (
                <div style={{ margin: '-0.5rem 1.5rem 0.5rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', color: C.skyDeep, fontWeight: 700 }}>
                  Age: {calcAge(form.date_of_birth)} years
                </div>
              )}

              <div className="sp-form-actions">
                <button type="submit" className="sp-submit-btn" disabled={submitting}>
                  {submitting ? '⏳ Registering…' : '✔ Register & Print Slip'}
                </button>
                <button type="button" className="sp-reset-btn" onClick={() => { setForm(EMPTY_FORM); setFormMsg(null) }}>
                  Clear Form
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Slip print modal */}
      {slipPatient && (
        <SlipModal patient={slipPatient} onClose={() => setSlipPatient(null)} />
      )}
    </div>
  )
}