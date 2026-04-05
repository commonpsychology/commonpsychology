// AdmindashboardPage.jsx — COMPLETE FIXED
// Fixes:
//   1. galsubPage → galSubPage (was crashing with ReferenceError)
//   2. Volunteer + gallery_submissions JSX moved inside return() statement
//   3. All JSX sections now properly inside the adm-content div

import { useState, useEffect } from 'react'
import { useRouter }           from '../context/RouterContext'
import { useAuth }             from '../context/AuthContext'
import { admin as adminApi }   from '../services/api'
import ReviewsModeration from '../components/ReviewsModeration'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const LIMIT    = 20

const token    = () => localStorage.getItem('accessToken')
const apiFetch = async (path, opts = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...(opts.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

const fmt  = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const fmtT = d => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600;700&display=swap');
:root {
  --font-display:'Instrument Serif',Georgia,serif;
  --font-body:'DM Sans',system-ui,sans-serif;
  --teal:#007BA8;--teal-lt:#e0f7ff;--teal-dk:#005580;
  --green:#1a7a4a;--green-lt:#e8f8f0;
  --amber:#8a5a1a;--amber-lt:#fff5e6;
  --purple:#5a1a8a;--purple-lt:#f0e8ff;
  --red:#c0392b;--red-lt:#fff0f0;
  --slate:#1a3a4a;--slate-md:#2e6080;--slate-lt:#7a9aaa;
  --border:#e2e8f0;--bg:#f0f4f8;--white:#ffffff;
  --radius:12px;--radius-sm:8px;
  --shadow-sm:0 1px 4px rgba(0,0,0,0.06);--shadow-md:0 4px 16px rgba(0,0,0,0.1);
}
*{box-sizing:border-box;margin:0;padding:0;}
.adm{min-height:100vh;background:var(--bg);display:flex;flex-direction:column;font-family:var(--font-body);}
.adm-bar{background:linear-gradient(135deg,#1a3a4a 0%,#2e6080 100%);padding:.75rem clamp(1rem,3vw,1.75rem);display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:200;box-shadow:0 2px 12px rgba(0,0,0,.18);min-height:56px;}
.adm-body{display:flex;flex:1;min-height:0;}
.adm-side{width:220px;flex-shrink:0;background:var(--white);border-right:1px solid var(--border);position:sticky;top:56px;height:calc(100vh - 56px);overflow-y:auto;padding:.5rem 0;scrollbar-width:thin;}
.adm-side::-webkit-scrollbar{width:4px;}
.adm-side::-webkit-scrollbar-thumb{background:#ddd;border-radius:4px;}
.side-group{padding:.35rem .9rem .1rem;font-size:.62rem;font-weight:800;color:var(--slate-lt);text-transform:uppercase;letter-spacing:.1em;margin-top:.5rem;}
.side-btn{display:flex;align-items:center;gap:.55rem;width:100%;padding:.55rem 1.1rem;border:none;background:transparent;font-family:var(--font-body);font-size:.82rem;cursor:pointer;text-align:left;color:var(--slate-md);transition:all .14s;position:relative;}
.side-btn:hover{background:var(--bg);}
.side-btn.active{background:var(--green-lt);color:var(--green);font-weight:700;}
.side-btn.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:var(--green);border-radius:0 2px 2px 0;}
.side-btn.highlight{color:var(--teal);background:var(--teal-lt);font-weight:700;border-left:3px solid var(--teal);}
.side-divider{height:1px;background:var(--border);margin:.5rem 1rem;}
.adm-content{flex:1;padding:clamp(1rem,3vw,1.75rem);overflow-x:hidden;min-width:0;}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.5rem;}
.stat-card{background:var(--white);border-radius:var(--radius);padding:1.2rem;border:1px solid var(--border);cursor:pointer;transition:all .18s;}
.stat-card:hover{box-shadow:var(--shadow-md);transform:translateY(-2px);}
.tbl-wrap{background:var(--white);border-radius:var(--radius);border:1px solid var(--border);overflow:auto;}
table.tbl{width:100%;border-collapse:collapse;min-width:500px;}
table.tbl th{padding:.55rem .9rem;text-align:left;font-size:.66rem;font-weight:800;color:var(--slate-lt);text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--border);background:var(--bg);white-space:nowrap;}
table.tbl td{padding:.6rem .9rem;font-size:.82rem;color:var(--slate-md);border-bottom:1px solid var(--border);vertical-align:middle;}
table.tbl tr:last-child td{border-bottom:none;}
table.tbl tr:hover td{background:#f8fafc;}
.tbl-empty{text-align:center;padding:2.5rem;color:var(--slate-lt);font-size:.85rem;}
.pager{display:flex;justify-content:center;align-items:center;gap:.5rem;padding:.75rem;border-top:1px solid var(--border);}
.pg-btn{padding:.28rem .7rem;border:1px solid var(--border);border-radius:6px;background:var(--white);cursor:pointer;font-size:.78rem;color:var(--slate-md);font-family:var(--font-body);transition:all .14s;}
.pg-btn:disabled{background:var(--bg);cursor:not-allowed;color:#ccc;}
.pg-btn:not(:disabled):hover{border-color:var(--teal);color:var(--teal);}
.filters{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin-bottom:1rem;}
.inp{padding:.4rem .8rem;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-size:.82rem;color:var(--slate);background:var(--white);outline:none;font-family:var(--font-body);transition:border .15s;}
.inp:focus{border-color:var(--teal);}
select.inp{cursor:pointer;}
.btn{padding:.4rem .9rem;border-radius:var(--radius-sm);font-family:var(--font-body);font-size:.8rem;font-weight:600;cursor:pointer;border:1.5px solid transparent;transition:all .15s;display:inline-flex;align-items:center;gap:.35rem;white-space:nowrap;}
.btn-primary{background:linear-gradient(135deg,var(--teal) 0%,#00BFFF 100%);color:white;box-shadow:0 3px 10px rgba(0,191,255,.25);}
.btn-primary:hover{opacity:.88;transform:translateY(-1px);}
.btn-green{background:var(--green);color:white;}
.btn-green:hover{opacity:.88;}
.btn-ghost{background:var(--white);color:var(--slate-md);border-color:var(--border);}
.btn-ghost:hover{border-color:var(--slate-md);}
.btn-danger{background:var(--red-lt);color:var(--red);border-color:var(--red-lt);}
.btn-danger:hover{background:var(--red);color:white;}
.btn-sm{padding:.25rem .6rem;font-size:.73rem;}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important;}
.badge{padding:.18rem .55rem;border-radius:100px;font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;}
.modal-overlay{position:fixed;inset:0;background:rgba(15,30,45,.55);backdrop-filter:blur(4px);z-index:500;display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn .18s;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:var(--white);border-radius:16px;width:100%;max-width:640px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:slideUp .2s;}
@keyframes slideUp{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
.modal-header{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;}
.modal-body{padding:1.5rem;display:flex;flex-direction:column;gap:1rem;}
.modal-footer{padding:1rem 1.5rem;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:.65rem;}
.field{display:flex;flex-direction:column;gap:.3rem;}
.field label{font-size:.7rem;font-weight:800;color:#4a6a7a;text-transform:uppercase;letter-spacing:.08em;}
.field input,.field select,.field textarea{padding:.55rem .85rem;border:1.5px solid var(--border);border-radius:8px;font-size:.85rem;color:var(--slate);outline:none;font-family:var(--font-body);transition:border .15s;width:100%;box-sizing:border-box;}
.field input:focus,.field select:focus,.field textarea:focus{border-color:var(--teal);}
.field textarea{resize:vertical;line-height:1.6;}
.field-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
.field-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.75rem;}
.sec-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;flex-wrap:wrap;gap:.75rem;}
.sec-title{font-family:var(--font-display);font-size:clamp(1.2rem,3vw,1.4rem);color:var(--slate);}
.sec-sub{font-size:.75rem;color:var(--slate-lt);margin-top:.15rem;font-family:var(--font-body);}
.alert{padding:.65rem 1rem;border-radius:8px;font-size:.82rem;font-weight:600;}
.alert-success{background:var(--green-lt);border:1px solid #a0ddb8;color:var(--green);}
.alert-error{background:var(--red-lt);border:1px solid #f5a0a0;color:var(--red);}
.toggle{width:36px;height:20px;background:#ddd;border-radius:100px;position:relative;cursor:pointer;border:none;transition:background .2s;flex-shrink:0;}
.toggle.on{background:var(--green);}
.toggle::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;background:white;border-radius:50%;transition:transform .2s;}
.toggle.on::after{transform:translateX(16px);}
.adm-tabbar{display:none;background:var(--white);border-bottom:1px solid var(--border);overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.adm-tabbar::-webkit-scrollbar{display:none;}
.tab-btn{flex-shrink:0;padding:.65rem .85rem;border:none;background:transparent;font-family:var(--font-body);font-size:.78rem;font-weight:500;color:var(--slate-lt);cursor:pointer;white-space:nowrap;border-bottom:2.5px solid transparent;}
.tab-btn.active{color:var(--green);font-weight:700;border-bottom-color:var(--green);}
.hint{font-size:.7rem;color:var(--slate-lt);}
.chip{padding:.15rem .5rem;border-radius:100px;background:var(--teal-lt);color:var(--teal);font-size:.7rem;font-weight:600;display:inline-block;}
@media(max-width:900px){.stat-grid{grid-template-columns:repeat(2,1fr);}.adm-side{width:190px;}}
@media(max-width:680px){.adm-side{display:none;}.adm-tabbar{display:flex;}.adm-content{padding:1rem;}.stat-grid{grid-template-columns:repeat(2,1fr);gap:.75rem;}.field-row{grid-template-columns:1fr;}.field-row3{grid-template-columns:1fr 1fr;}}
`

function injectCSS() {
  if (document.getElementById('adm-full-css')) return
  const s = document.createElement('style')
  s.id = 'adm-full-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

const SIDEBAR = [
  { group: 'Core', items: [
    { id: 'dashboard',    label: 'Dashboard',     icon: '📊' },
    { id: 'users',        label: 'Users',         icon: '👥' },
    { id: 'appointments', label: 'Appointments',  icon: '📅' },
    { id: 'orders',       label: 'Orders',        icon: '📦' },
    { id: 'payments',     label: 'Payments',      icon: '💳' },
    { id: 'notifications',label: 'Send Notify',   icon: '🔔' },
{ id: 'reviews', label: 'Video Reviews', icon: '🎥' },
  ]},
  { group: 'Content', items: [
    { id: 'posts',          label: 'Blog Posts',    icon: '✍️' },
    { id: 'news',           label: 'News Articles', icon: '📰' },
    { id: 'resources',      label: 'Resources',     icon: '📥' },
    { id: 'gallery',        label: 'Gallery',       icon: '🖼️' },
    { id: 'research',       label: 'Research',      icon: '🔬' },
    { id: 'psych_videos',   label: 'Psych Videos',  icon: '🎬' },
    { id: 'psych_analyses', label: 'Psych Analyses',icon: '🧠' },
    { id: 'psych_concepts', label: 'Psych Concepts',icon: '💡' },
  ]},
  { group: 'Services', items: [
    { id: 'products',            label: 'Products',         icon: '🛍️' },
    { id: 'courses',             label: 'Courses',          icon: '🎓' },
    { id: 'assessments',         label: 'Assessments',      icon: '📋' },
    { id: 'therapists',          label: 'Therapists',       icon: '🩺' },
    { id: 'community',           label: 'Community Grps',   icon: '💬' },
    { id: 'community_admin',     label: 'Community Admin',  icon: '🌐' },
    { id: 'volunteers',          label: 'Volunteers',       icon: '🤝' },
    { id: 'gallery_submissions', label: 'Photo Submissions',icon: '📸' },
  ]},
  { group: 'System', items: [
    { id: 'faqs',          label: 'FAQs',         icon: '❓' },
    { id: 'coupons',       label: 'Coupons',      icon: '🎫' },
    { id: 'contacts',      label: 'Contact Msgs', icon: '📩' },
    { id: 'subscriptions', label: 'Subscriptions',icon: '♻️' },
    { id: 'settings',      label: 'Site Settings',icon: '⚙️' },
  ]},
]

const STATUS_MAP = {
  pending:     { bg: '#fff5e6', c: '#8a5a1a' },
  pending_cod: { bg: '#fff9e6', c: '#8a5a1a' },
  confirmed:   { bg: '#e8f8f0', c: '#1a7a4a' },
  completed:   { bg: '#e0f7ff', c: '#007BA8' },
  cancelled:   { bg: '#fff0f0', c: '#c0392b' },
  refunded:    { bg: '#f0e8ff', c: '#5a1a8a' },
  shipped:     { bg: '#e8f8f0', c: '#1a7a4a' },
  delivered:   { bg: '#e0f7ff', c: '#007BA8' },
  processing:  { bg: '#fff9e6', c: '#8a6a1a' },
  active:      { bg: '#e8f8f0', c: '#1a7a4a' },
  paused:      { bg: '#fff5e6', c: '#8a5a1a' },
  reviewing:   { bg: '#e0f7ff', c: '#007BA8' },
  approved:    { bg: '#e8f8f0', c: '#1a7a4a' },
  rejected:    { bg: '#fff0f0', c: '#c0392b' },
  waitlisted:  { bg: '#fff5e6', c: '#8a5a1a' },
  published:   { bg: '#e8f8f0', c: '#1a7a4a' },
  draft:       { bg: '#f0f4f8', c: '#5a7a8a' },
  archived:    { bg: '#f0e8ff', c: '#5a1a8a' },
  true:        { bg: '#e8f8f0', c: '#1a7a4a' },
  false:       { bg: '#fff0f0', c: '#c0392b' },
  free:        { bg: '#e8f8f0', c: '#1a7a4a' },
  premium:     { bg: '#f0e8ff', c: '#5a1a8a' },
  open:        { bg: '#e8f8f0', c: '#1a7a4a' },
  unpaid:      { bg: '#fff5e6', c: '#8a5a1a' },
  paid:        { bg: '#e8f8f0', c: '#1a7a4a' },
  overdue:     { bg: '#fff0f0', c: '#c0392b' },
  new:         { bg: '#e0f7ff', c: '#007BA8' },
  resolved:    { bg: '#e8f8f0', c: '#1a7a4a' },
  in_progress: { bg: '#fff9e6', c: '#8a6a1a' },
  client:      { bg: '#e8f8f0', c: '#1a7a4a' },
  therapist:   { bg: '#e0f7ff', c: '#007BA8' },
  admin:       { bg: '#f0e8ff', c: '#5a1a8a' },
  staff:       { bg: '#fff5e6', c: '#8a5a1a' },
  beginner:    { bg: '#e8f8f0', c: '#1a7a4a' },
  intermediate:{ bg: '#fff9e6', c: '#8a6a1a' },
  advanced:    { bg: '#f0e8ff', c: '#5a1a8a' },
  Beginner:    { bg: '#e8f8f0', c: '#1a7a4a' },
  Intermediate:{ bg: '#fff9e6', c: '#8a6a1a' },
  Advanced:    { bg: '#f0e8ff', c: '#5a1a8a' },
}

function Badge({ s }) {
  const v = STATUS_MAP[String(s)] || { bg: '#eee', c: '#444' }
  return <span className="badge" style={{ background: v.bg, color: v.c }}>{String(s)}</span>
}

function Toggle({ on, onChange }) {
  return <button className={`toggle${on ? ' on' : ''}`} onClick={() => onChange(!on)} type="button" />
}

function Pager({ page, set, total }) {
  const tp = Math.max(1, Math.ceil(total / LIMIT))
  if (tp <= 1) return null
  return (
    <div className="pager">
      <button className="pg-btn" onClick={() => set(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
      <span style={{ fontSize: '.78rem', color: 'var(--slate-lt)', padding: '0 .4rem' }}>{page} / {tp} · {total} total</span>
      <button className="pg-btn" onClick={() => set(p => Math.min(tp, p + 1))} disabled={page === tp}>Next →</button>
    </div>
  )
}

function Confirm({ msg, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--slate)' }}>⚠️ Confirm</span>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '.88rem', color: 'var(--slate-md)' }}>{msg}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, sub, count, onNew, children }) {
  return (
    <div className="sec-head">
      <div>
        <h1 className="sec-title">
          {title}
          {count != null && <span style={{ fontSize: '.9rem', color: 'var(--slate-lt)', fontFamily: 'var(--font-body)', fontWeight: 400 }}> ({count})</span>}
        </h1>
        {sub && <p className="sec-sub">{sub}</p>}
      </div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {children}
        {onNew && <button className="btn btn-primary" onClick={onNew}>➕ New</button>}
      </div>
    </div>
  )
}

function TblWrap({ cols, rows, loading: ld, empty = 'No records found.' }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {ld
            ? <tr><td className="tbl-empty" colSpan={cols.length}>Loading…</td></tr>
            : rows.length === 0
              ? <tr><td className="tbl-empty" colSpan={cols.length}>{empty}</td></tr>
              : rows
          }
        </tbody>
      </table>
    </div>
  )
}

function Actions({ onEdit, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: '.35rem' }}>
      {onEdit   && <button className="btn btn-ghost btn-sm" onClick={onEdit}>✏️</button>}
      {onDelete && <button className="btn btn-danger btn-sm" onClick={onDelete}>🗑</button>}
    </div>
  )
}

function resolveClientName(appt) {
  return (
    appt.client_name || appt.clients?.full_name || appt.profiles?.full_name ||
    appt.client?.full_name || appt.client?.name || appt.user?.full_name ||
    (appt.client_id ? `Client …${String(appt.client_id).slice(-6)}` : '—')
  )
}

function resolveTherapistName(appt) {
  return (
    appt.therapist_name || appt.therapists?.profiles?.full_name ||
    appt.therapist?.profiles?.full_name || appt.therapist?.full_name ||
    appt.therapists?.full_name || (appt.therapist_id ? `…${String(appt.therapist_id).slice(-6)}` : '—')
  )
}

function resolvePaymentDetails(pay) {
  const clientName = pay.client_name || pay.profiles?.full_name || pay.clients?.full_name ||
    pay.client?.full_name || (pay.client_id ? `…${String(pay.client_id).slice(-6)}` : '—')
  const linkedTo = pay.appointment_id ? 'Appointment' : pay.order_id ? 'Order' : 'Other'
  const linkedId = pay.appointment_id || pay.order_id || null
  const isPending = ['pending', 'pending_cod'].includes(pay.status)
  return { clientName, linkedTo, linkedId, isPending }
}

function PaymentValidityBadge({ status }) {
  const map = {
    completed:   { bg: '#e8f8f0', c: '#1a7a4a', label: '✓ Verified' },
    pending_cod: { bg: '#fff9e6', c: '#8a5a1a', label: '⏳ COD — Awaiting' },
    pending:     { bg: '#fff5e6', c: '#8a5a1a', label: '⏳ Pending' },
    failed:      { bg: '#fff0f0', c: '#c0392b', label: '✗ Failed' },
    refunded:    { bg: '#f0e8ff', c: '#5a1a8a', label: '↩ Refunded' },
  }
  const v = map[status] || { bg: '#eee', c: '#444', label: status }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '.2rem .6rem', borderRadius: 100, background: v.bg, color: v.c, fontSize: '.68rem', fontWeight: 800 }}>
      {v.label}
    </span>
  )
}

function AdminPaymentSection() {
  const [pays,       setPays]       = useState([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [status,     setStatus]     = useState('')
  const [method,     setMethod]     = useState('')
  const [category,   setCategory]   = useState('')
  const [loading,    setLoading]    = useState(false)
  const [expanded,   setExpanded]   = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [busy,       setBusy]       = useState({})
  const [summary,    setSummary]    = useState(null)
  

  useEffect(() => { load() }, [page, status, method, category]) // eslint-disable-line

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (status)   params.set('status',   status)
      if (method)   params.set('method',   method)
      if (category) params.set('category', category)
      const d = await apiFetch(`/admin/payments?${params}`)
      const list = d.payments || d.items || d.data || []
      setPays(list)
      setTotal(d.pagination?.total || d.total || list.length)
      setSummary({
        total:     list.length,
        completed: list.filter(p => p.status === 'completed').length,
        pending:   list.filter(p => ['pending', 'pending_cod'].includes(p.status)).length,
        failed:    list.filter(p => p.status === 'failed').length,
        revenue:   list.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount || 0), 0),
      })
    } catch (e) { console.error('Payments:', e) }
    finally { setLoading(false) }
  }

  async function confirmPayment(id) {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await apiFetch(`/admin/payments/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) })
      setConfirming(null); load()
    } catch (e) { alert(e.message) }
    finally { setBusy(b => ({ ...b, [id]: false })) }
  }

  async function rejectPayment(id) {
    setBusy(b => ({ ...b, [id]: true }))
    try {
      await apiFetch(`/admin/payments/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'failed' }) }); load()
    } catch (e) { alert(e.message) }
    finally { setBusy(b => ({ ...b, [id]: false })) }
  }

  async function refundPayment(id) {
    try { await apiFetch(`/admin/payments/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'refunded' }) }); load() }
    catch (e) { alert(e.message) }
  }


  const tableRows = loading
    ? [<tr key="loading"><td className="tbl-empty" colSpan={8}>Loading…</td></tr>]
    : pays.length === 0
      ? [<tr key="empty"><td className="tbl-empty" colSpan={8}>No payments found.</td></tr>]
      : pays.flatMap(pay => {
          const { clientName, linkedTo, linkedId, isPending } = resolvePaymentDetails(pay)
          const isExpanded = expanded === pay.id
          const gw = pay.gateway_response
          const mainRow = (
            <tr key={pay.id} style={{ cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : pay.id)}>
              <td>
                <div style={{ fontWeight: 600, color: 'var(--slate)', fontSize: '.83rem' }}>{clientName}</div>
                <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)', fontFamily: 'monospace' }}>{pay.transaction_id || String(pay.id || '').slice(0, 12)}</div>
              </td>
              <td><strong style={{ color: 'var(--slate)', fontSize: '.88rem' }}>{pay.currency || 'NPR'} {Number(pay.amount || 0).toLocaleString()}</strong></td>
              <td><span style={{ fontSize: '.8rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--teal)' }}>{pay.method || '—'}</span></td>
              <td><span style={{ fontSize: '.75rem', background: 'var(--bg)', padding: '.15rem .45rem', borderRadius: 4 }}>{pay.category || linkedTo}</span></td>
              <td><PaymentValidityBadge status={pay.status} /></td>
              <td><Badge s={pay.status} /></td>
              <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{fmt(pay.created_at)}</td>
              <td onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                  {isPending && <>
                    <button className="btn btn-green btn-sm" disabled={busy[pay.id]} onClick={() => setConfirming(pay.id)}>✓ Confirm</button>
                    <button className="btn btn-danger btn-sm" disabled={busy[pay.id]} onClick={() => rejectPayment(pay.id)}>✗ Reject</button>
                  </>}
                  {pay.status === 'completed' && <button className="btn btn-ghost btn-sm" onClick={() => refundPayment(pay.id)}>↩ Refund</button>}
                  <button className="btn btn-ghost btn-sm" onClick={() => setExpanded(isExpanded ? null : pay.id)}>{isExpanded ? '▲' : '▼'}</button>
                </div>
              </td>
            </tr>
          )
          if (!isExpanded) return [mainRow]
          const detailRow = (
            <tr key={`${pay.id}-detail`}>
              <td colSpan={8} style={{ padding: 0, background: '#f8fafc' }}>
                <div style={{ padding: '1rem 1.1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
                  {gw && (
                    <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', padding: '.85rem' }}>
                      <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--slate-lt)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>Gateway Response</div>
                      <pre style={{ fontSize: '.72rem', color: 'var(--slate-md)', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', margin: 0, fontFamily: 'monospace' }}>
                        {typeof gw === 'string' ? gw : JSON.stringify(gw, null, 2)}
                      </pre>
                    </div>
                  )}
                  <div style={{ background: 'var(--white)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', padding: '.85rem' }}>
                    <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--slate-lt)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>Payment Details</div>
                    {[
                      ['Payment ID', pay.id], ['Transaction ID', pay.transaction_id || '—'],
                      ['Method', pay.method || '—'], ['Category', pay.category || linkedTo],
                      ['Currency', pay.currency || 'NPR'], ['Paid At', pay.paid_at ? fmtT(pay.paid_at) : '—'],
                      ['Created', fmtT(pay.created_at)],
                      linkedId ? ['Linked To', `${linkedTo} · ${String(linkedId).slice(0, 12)}…`] : null,
                    ].filter(Boolean).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '.25rem 0', borderBottom: '1px solid var(--border)', fontSize: '.78rem' }}>
                        <span style={{ color: 'var(--slate-lt)', fontWeight: 600 }}>{k}</span>
                        <span style={{ color: 'var(--slate-md)', fontFamily: ['Payment ID', 'Transaction ID'].includes(k) ? 'monospace' : 'inherit', fontSize: ['Payment ID', 'Transaction ID'].includes(k) ? '.7rem' : 'inherit', wordBreak: 'break-all', maxWidth: '55%', textAlign: 'right' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </td>
            </tr>
          )
          return [mainRow, detailRow]
        })

  return (
    <div>
      <div className="sec-head">
        <div><h1 className="sec-title">💳 Payments</h1><p className="sec-sub">Verify, confirm and manage all payment records</p></div>
        <button className="btn btn-ghost" onClick={load}>🔄 Refresh</button>
      </div>
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '.75rem', marginBottom: '1.25rem' }}>
          {[
            { label: 'This Page',     val: summary.total,                             bg: '#f0f4f8', c: 'var(--slate)' },
            { label: 'Completed',     val: summary.completed,                         bg: '#e8f8f0', c: '#1a7a4a'      },
            { label: 'Pending / COD', val: summary.pending,                           bg: '#fff9e6', c: '#8a5a1a'      },
            { label: 'Failed',        val: summary.failed,                            bg: '#fff0f0', c: '#c0392b'      },
            { label: 'Page Revenue',  val: `NPR ${summary.revenue.toLocaleString()}`, bg: '#e0f7ff', c: '#007BA8'      },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 'var(--radius-sm)', padding: '.85rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.c, fontFamily: 'var(--font-display)' }}>{s.val}</div>
              <div style={{ fontSize: '.68rem', color: 'var(--slate-lt)', fontWeight: 700, marginTop: '.2rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
      <div className="filters">
        <select className="inp" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['pending', 'pending_cod', 'completed', 'failed', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="inp" value={method} onChange={e => { setMethod(e.target.value); setPage(1) }}>
          <option value="">All methods</option>
          {['esewa', 'khalti', 'stripe', 'bank_transfer', 'cash', 'fonepay'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="inp" value={category} onChange={e => { setCategory(e.target.value); setPage(1) }}>
          <option value="">All categories</option>
          {['appointment', 'order', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {pays.some(p => p.status === 'pending_cod') && (
        <div style={{ background: '#fff9e6', border: '1px solid #f5d87a', borderRadius: 'var(--radius-sm)', padding: '.75rem 1rem', marginBottom: '1rem', fontSize: '.82rem', color: '#8a5a1a', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          ⚠️ <strong>{pays.filter(p => p.status === 'pending_cod').length} COD payment(s)</strong> awaiting manual confirmation.
        </div>
      )}
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Client</th><th>Amount</th><th>Method</th><th>Category</th><th>Validity</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>{tableRows}</tbody>
        </table>
      </div>
      <Pager page={page} set={setPage} total={total} />
      {confirming && (
        <Confirm
          msg={`Mark this payment as completed? NPR ${Number(pays.find(p => p.id === confirming)?.amount || 0).toLocaleString()}`}
          onConfirm={() => confirmPayment(confirming)}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function AdminDashboardFull() {
  useEffect(() => { injectCSS() }, [])
  const { navigate }                           = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [tab, setTab] = useState('dashboard')

  const [stats,  setStats]  = useState(null)
  const [recent, setRecent] = useState([])

  const [users,  setUsers]  = useState([]); const [uTotal, setUTotal] = useState(0); const [uPage, setUPage] = useState(1)
  const [uSearch,setUSearch]= useState(''); const [uRole,  setURole]  = useState('')
  const [appts,  setAppts]  = useState([]); const [aTotal, setATotal] = useState(0); const [aPage, setAPage] = useState(1)
  const [aStatus,setAStatus]= useState('')
  const [orders, setOrders] = useState([]); const [oTotal, setOTotal] = useState(0); const [oPage, setOPage] = useState(1)
  const [oStatus,setOStatus]= useState('')

  const [notifClients, setNotifClients] = useState([])
  const [notifTarget,  setNotifTarget]  = useState('')
  const [notifTitle,   setNotifTitle]   = useState('')
  const [notifMsg,     setNotifMsg]     = useState('')
  const [notifType,    setNotifType]    = useState('system')
  const [notifSending, setNotifSending] = useState(false)
  const [notifResult,  setNotifResult]  = useState(null)
  const [sentHistory,  setSentHistory]  = useState([])

  // ── Volunteer & Gallery Submissions state ────────────────────
  const [volunteers,    setVolunteers]    = useState([])
  const [volTotal,      setVolTotal]      = useState(0)
  const [volPage,       setVolPage]       = useState(1)
  const [volSearch,     setVolSearch]     = useState('')
  const [volStatus,     setVolStatus]     = useState('')
  const [volDetail,     setVolDetail]     = useState(null)

  // FIX: was galsubPage — renamed consistently to galSubPage everywhere
  const [galSubs,       setGalSubs]       = useState([])
  const [galSubTotal,   setGalSubTotal]   = useState(0)
  const [galSubPage,    setGalSubPage]    = useState(1)
  const [galSubStatus,  setGalSubStatus]  = useState('')

  const [commGroups,        setCommGroups]        = useState([])
  const [commSessions,      setCommSessions]      = useState([])
  const [commReservations,  setCommReservations]  = useState([])
  const [commMemberships,   setCommMemberships]   = useState([])
  const [commSessionsTotal, setCommSessionsTotal] = useState(0)
  const [commSessionPage,   setCommSessionPage]   = useState(1)
  const [commTab,           setCommTab]           = useState('groups')
  const [sessionModal,      setSessionModal]      = useState(null)
  const [sessionForm,       setSessionForm]       = useState({})
  const [sessionSaving,     setSessionSaving]     = useState(false)
  const [sessionErr,        setSessionErr]        = useState('')
  const [selectedSessionId, setSelectedSessionId] = useState(null)

  const [posts,      setPosts]      = useState([]); const [postsTotal,  setPostsTotal]  = useState(0); const [postsPage,  setPostsPage]  = useState(1)
  const [news,       setNews]       = useState([]); const [newsTotal,   setNewsTotal]   = useState(0); const [newsPage,   setNewsPage]   = useState(1)
  const [resources,  setRes]        = useState([]); const [resTotal,    setResTotal]    = useState(0); const [resPage,    setResPage]    = useState(1)
  const [gallery,    setGallery]    = useState([]); const [galTotal,    setGalTotal]    = useState(0); const [galPage,    setGalPage]    = useState(1)
  const [research,   setResearch]   = useState([]); const [rscTotal,    setRscTotal]    = useState(0); const [rscPage,    setRscPage]    = useState(1)
  const [pvids,      setPvids]      = useState([]); const [pvTotal,     setPvTotal]     = useState(0); const [pvPage,     setPvPage]     = useState(1)
  const [panalyses,  setPanalyses]  = useState([]); const [paTotal,     setPaTotal]     = useState(0); const [paPage,     setPaPage]     = useState(1)
  const [pconcepts,  setPconcepts]  = useState([]); const [pcTotal,     setPcTotal]     = useState(0); const [pcPage,     setPcPage]     = useState(1)
  const [therapists, setTherapists] = useState([]); const [thrTotal,    setThrTotal]    = useState(0); const [thrPage,    setThrPage]    = useState(1)
  const [products,   setProducts]   = useState([]); const [prodTotal,   setProdTotal]   = useState(0); const [prodPage,   setProdPage]   = useState(1)
  const [courses,    setCourses]    = useState([]); const [courseTotal, setCourseTotal] = useState(0); const [coursePage, setCoursePage] = useState(1)
  const [assessments,setAssess]     = useState([]); const [assTotal,    setAssTotal]    = useState(0); const [assPage,    setAssPage]    = useState(1)
  const [community,  setCommunity]  = useState([]); const [comTotal,    setComTotal]    = useState(0); const [comPage,    setComPage]    = useState(1)
  const [faqs,       setFaqs]       = useState([]); const [faqTotal,    setFaqTotal]    = useState(0); const [faqPage,    setFaqPage]    = useState(1)
  const [coupons,    setCoupons]    = useState([]); const [couTotal,    setCouTotal]    = useState(0); const [couPage,    setCouPage]    = useState(1)
  const [contacts,   setContacts]   = useState([]); const [ctcTotal,    setCtcTotal]    = useState(0); const [ctcPage,    setCtcPage]    = useState(1)
  const [subs,       setSubs]       = useState([]); const [subTotal,    setSubTotal]    = useState(0); const [subPage,    setSubPage]    = useState(1)
  const [settings,   setSettings]   = useState([])

  const [modal,      setModal]      = useState(null)
  const [form,       setForm]       = useState({})
  const [saving,     setSaving]     = useState(false)
  const [saveErr,    setSaveErr]    = useState(null)
  const [delConfirm, setDelConfirm] = useState(null)
  const [busy,       setBusy]       = useState({})
  const [photoReplace,   setPhotoReplace]   = useState(null)
const [photoUploading, setPhotoUploading] = useState(false)
const [photoError,     setPhotoError]     = useState('')
  const setB = (k, v) => setBusy(b => ({ ...b, [k]: v }))

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/staff'); return }
    if (!['admin', 'staff'].includes(user.role)) { navigate('/portal'); return }
    fetchDashboard()
  }, [user, authLoading]) // eslint-disable-line

  // FIX: galsubPage → galSubPage in the dependency array (was the crash source)
  useEffect(() => {
    if (authLoading || !user || !['admin', 'staff'].includes(user.role)) return
    const MAP = {
      users:               () => fetchUsers(),
      appointments:        () => fetchAppts(),
      orders:              () => fetchOrders(),
      notifications:       () => fetchNotifClients(),
      posts:               () => sec('/admin/posts',            setPosts,      setPostsTotal,  postsPage),
      news:                () => sec('/admin/news',             setNews,       setNewsTotal,   newsPage),
      resources:           () => sec('/admin/resources',        setRes,        setResTotal,    resPage),
      therapists:          () => sec('/admin/therapists',       setTherapists, setThrTotal,    thrPage),
      gallery:             () => sec('/admin/gallery',          setGallery,    setGalTotal,    galPage),
      volunteers:          () => secVol(),
      gallery_submissions: () => secGalSub(),
      research:            () => sec('/admin/research',         setResearch,   setRscTotal,    rscPage),
      psych_videos:        () => sec('/admin/psych-videos',     setPvids,      setPvTotal,     pvPage),
      psych_analyses:      () => sec('/admin/psych-analyses',   setPanalyses,  setPaTotal,     paPage),
      psych_concepts:      () => sec('/admin/psych-concepts',   setPconcepts,  setPcTotal,     pcPage),
      products:            () => sec('/admin/products',         setProducts,   setProdTotal,   prodPage),
      courses:             () => sec('/admin/courses',          setCourses,    setCourseTotal, coursePage),
      assessments:         () => sec('/admin/assessments',      setAssess,     setAssTotal,    assPage),
      community:           () => sec('/admin/community-groups', setCommunity,  setComTotal,    comPage),
      faqs:                () => sec('/admin/faqs',             setFaqs,       setFaqTotal,    faqPage),
      coupons:             () => sec('/admin/coupons',          setCoupons,    setCouTotal,    couPage),
      contacts:            () => sec('/admin/contacts',         setContacts,   setCtcTotal,    ctcPage),
      subscriptions:       () => sec('/admin/subscriptions',    setSubs,       setSubTotal,    subPage),
      settings:            () => fetchSettings(),
    }
    if (MAP[tab]) MAP[tab]()
  }, [tab, uPage, aPage, oPage, postsPage, newsPage, resPage,
      galSubPage,   // FIX: was galsubPage (lowercase s) — now matches state variable
      volPage, rscPage, pvPage, paPage, pcPage, prodPage, coursePage,
      assPage, comPage, faqPage, couPage, ctcPage, subPage, thrPage]) // eslint-disable-line

  const fetchDashboard = async () => {
  setB('dash', true)
  try {
    const d = await adminApi.dashboard()
    const payments = d.recentPayments || []
    setRecent(payments)

    // Fetch real payment data for accurate revenue
    const pd = await apiFetch('/admin/payments?page=1&limit=100')
    const allPayments = pd.payments || pd.items || pd.data || []
    const calculatedRevenue = allPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)

    setStats({
      ...(d.stats || {}),
      revenue30d: calculatedRevenue,
    })
  } catch { /* silent */ }
  finally { setB('dash', false) }
}
  const fetchUsers = async () => {
    setB('users', true)
    try {
      const d = await adminApi.users({ page: uPage, limit: LIMIT, q: uSearch || undefined, role: uRole || undefined })
      setUsers(d.users || []); setUTotal(d.pagination?.total || 0)
    } catch { /* silent */ }
    finally { setB('users', false) }
  }

  const fetchAppts = async () => {
    setB('appts', true)
    try {
      const d = await adminApi.appointments({ page: aPage, limit: LIMIT, status: aStatus || undefined })
      setAppts(d.appointments || []); setATotal(d.pagination?.total || 0)
    } catch { /* silent */ }
    finally { setB('appts', false) }
  }

  const fetchOrders = async () => {
    setB('orders', true)
    try {
      const d = await adminApi.orders({ page: oPage, limit: LIMIT, status: oStatus || undefined })
      setOrders(d.orders || []); setOTotal(d.pagination?.total || 0)
    } catch { /* silent */ }
    finally { setB('orders', false) }
  }

  const fetchNotifClients = async () => {
    try {
      const d = await adminApi.users({ limit: 200, role: 'client' })
      setNotifClients(d.users || [])
    } catch { /* silent */ }
  }

  const sec = async (endpoint, setter, totalSetter, pg) => {
    const busyKey = endpoint.replace('/admin/', '').replace(/-/g, '_')
    setB(busyKey, true)
    try {
      const d = await apiFetch(`${endpoint}?page=${pg}&limit=${LIMIT}`)
      const arr = d.items || d.posts || d.users || d.news || d.resources || d.gallery ||
        d.research || d.products || d.courses || d.assessments ||
        d.faqs || d.coupons || d.contacts || d.settings ||
        Object.values(d).find(v => Array.isArray(v)) || []
      setter(arr)
      totalSetter(d.pagination?.total ?? d.total ?? arr.length)
    } catch (e) { console.error(`${endpoint}:`, e) }
    finally { setB(busyKey, false) }
  }

  const fetchSettings = async () => {
    setB('settings', true)
    try { const d = await apiFetch('/admin/settings'); setSettings(d.settings || d.data || []) }
    catch { /* silent */ }
    finally { setB('settings', false) }
  }

  const fetchCommGroups = async () => {
    try { const d = await apiFetch('/admin/community-groups?page=1&limit=50'); setCommGroups(d.items || []) }
    catch (e) { console.error('commGroups:', e) }
  }

  const fetchCommSessions = async (pg = 1) => {
    try {
      const d = await apiFetch(`/admin/group-sessions?page=${pg}&limit=20`)
      setCommSessions(d.items || []); setCommSessionsTotal(d.pagination?.total || 0)
    } catch (e) { console.error('commSessions:', e) }
  }

  const fetchCommReservations = async (sessionId) => {
    try {
      const d = await apiFetch(`/admin/group-reservations?session_id=${sessionId}&limit=100`)
      setCommReservations(d.items || []); setSelectedSessionId(sessionId)
    } catch (e) { console.error('commReservations:', e) }
  }

  const fetchCommMemberships = async (groupId) => {
    try {
      const d = await apiFetch(`/admin/group-memberships?group_id=${groupId}&limit=100`)
      setCommMemberships(d.items || [])
    } catch (e) { console.error('commMemberships:', e) }
  }

  const saveSessionModal = async () => {
    setSessionSaving(true); setSessionErr('')
    try {
      if (sessionModal?.data) {
        await apiFetch(`/admin/group-sessions/${sessionModal.data.id}`, { method: 'PUT', body: JSON.stringify(sessionForm) })
      } else {
        await apiFetch('/admin/group-sessions', { method: 'POST', body: JSON.stringify(sessionForm) })
      }
      setSessionModal(null); setSessionForm({})
      fetchCommSessions(commSessionPage)
    } catch (e) { setSessionErr(e.message) }
    finally { setSessionSaving(false) }
  }

  // ── Volunteer fetch helpers ───────────────────────────────────
  const secVol = async () => {
    setB('volunteers', true)
    try {
      const params = new URLSearchParams({ page: volPage, limit: LIMIT })
      if (volStatus) params.set('status', volStatus)
      if (volSearch) params.set('search', volSearch)
      const d = await apiFetch(`/admin/volunteers?${params}`)
      setVolunteers(d.items || []); setVolTotal(d.pagination?.total || 0)
    } catch (e) { console.error('volunteers:', e) }
    finally { setB('volunteers', false) }
  }

  // ── Gallery submissions fetch helpers ─────────────────────────
  const secGalSub = async () => {
    setB('gallery_submissions', true)
    try {
      const params = new URLSearchParams({ page: galSubPage, limit: LIMIT })
      if (galSubStatus) params.set('status', galSubStatus)
      const d = await apiFetch(`/admin/gallery-submissions?${params}`)
      setGalSubs(d.items || []); setGalSubTotal(d.pagination?.total || 0)
    } catch (e) { console.error('gallery_submissions:', e) }
    finally { setB('gallery_submissions', false) }
  }

  async function updateVolStatus(id, status, notes) {
    try {
      await apiFetch(`/admin/volunteers/${id}`, { method: 'PUT', body: JSON.stringify({ status, admin_notes: notes }) })
      secVol()
    } catch (e) { alert(e.message) }
  }

  async function updateGalSubStatus(id, status) {
    try {
      await apiFetch(`/admin/gallery-submissions/${id}`, { method: 'PUT', body: JSON.stringify({ status }) })
      secGalSub()
    } catch (e) { alert(e.message) }
  }

  async function deleteGalSub(id) {
    try { await apiFetch(`/admin/gallery-submissions/${id}`, { method: 'DELETE' }); secGalSub() }
    catch (e) { alert(e.message) }
  }

  async function replaceGalleryPhoto(file, itemId) {
    setPhotoUploading(true); setPhotoError('')
    try {
      const fd = new FormData()
      fd.append('photo',    file)
      fd.append('title',    photoReplace.title)
      fd.append('category', photoReplace.category || 'Events')
      fd.append('itemId',   itemId)

      const res = await fetch(`${API_BASE}/gallery/replace-photo`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body:    fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      setPhotoReplace(null)
      sec('/admin/gallery', setGallery, setGalTotal, galPage)
    } catch (e) { setPhotoError(e.message) }
    finally { setPhotoUploading(false) }
  }

  async function downloadGalSub(id, fileName) {
    try {
      const d = await apiFetch(`/admin/gallery-submissions/${id}/download`)
      const a = document.createElement('a')
      a.href = d.url; a.download = d.file_name || fileName || 'photo.jpg'; a.target = '_blank'
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
    } catch (e) { alert(e.message) }
  }

  const openCreate = (type, defaults = {}) => { setForm(defaults); setSaveErr(null); setModal({ type, data: null }) }
  const openEdit   = (type, item)          => { setForm({ ...item }); setSaveErr(null); setModal({ type, data: item }) }
  const closeModal = ()                    => { setModal(null); setForm({}); setSaveErr(null) }
  const fld        = key => e => setForm(p => ({ ...p, [key]: e.target ? e.target.value : e }))

  const ENDPOINT_MAP = {
    post:              '/admin/posts',
    news_article:      '/admin/news',
    resource:          '/admin/resources',
    gallery_item:      '/admin/gallery',
    research_paper:    '/admin/research',
    therapist_profile: '/admin/therapists',
    psych_video:       '/admin/psych-videos',
    psych_analysis:    '/admin/psych-analyses',
    psych_concept:     '/admin/psych-concepts',
    product:           '/admin/products',
    course:            '/admin/courses',
    assessment:        '/admin/assessments',
    community_group:   '/admin/community-groups',
    faq:               '/admin/faqs',
    coupon:            '/admin/coupons',
    setting:           '/admin/settings',
  }

  const refreshFor = type => {
    const MAP = {
      post:              () => sec('/admin/posts',            setPosts,      setPostsTotal,  postsPage),
      news_article:      () => sec('/admin/news',             setNews,       setNewsTotal,   newsPage),
      resource:          () => sec('/admin/resources',        setRes,        setResTotal,    resPage),
      gallery_item:      () => sec('/admin/gallery',          setGallery,    setGalTotal,    galPage),
      therapist_profile: () => sec('/admin/therapists',       setTherapists, setThrTotal,    thrPage),
      research_paper:    () => sec('/admin/research',         setResearch,   setRscTotal,    rscPage),
      psych_video:       () => sec('/admin/psych-videos',     setPvids,      setPvTotal,     pvPage),
      psych_analysis:    () => sec('/admin/psych-analyses',   setPanalyses,  setPaTotal,     paPage),
      psych_concept:     () => sec('/admin/psych-concepts',   setPconcepts,  setPcTotal,     pcPage),
      product:           () => sec('/admin/products',         setProducts,   setProdTotal,   prodPage),
      course:            () => sec('/admin/courses',          setCourses,    setCourseTotal, coursePage),
      assessment:        () => sec('/admin/assessments',      setAssess,     setAssTotal,    assPage),
      community_group:   () => sec('/admin/community-groups', setCommunity,  setComTotal,    comPage),
      faq:               () => sec('/admin/faqs',             setFaqs,       setFaqTotal,    faqPage),
      coupon:            () => sec('/admin/coupons',          setCoupons,    setCouTotal,    couPage),
      setting:           () => fetchSettings(),
    }
    if (MAP[type]) MAP[type]()
  }

  const saveModal = async () => {
    if (!modal) return
    setSaving(true); setSaveErr(null)
    const ep = ENDPOINT_MAP[modal.type]
    try {
      if (modal.data) {
        await apiFetch(`${ep}/${modal.data.id}`, { method: 'PUT', body: JSON.stringify(form) })
      } else {
        await apiFetch(ep, { method: 'POST', body: JSON.stringify(form) })
      }
      closeModal(); refreshFor(modal.type)
    } catch (e) { setSaveErr(e.message) }
    finally { setSaving(false) }
  }

  const doDelete = async () => {
    if (!delConfirm) return
    try {
      await apiFetch(`${delConfirm.endpoint}/${delConfirm.id}`, { method: 'DELETE' })
      setDelConfirm(null)
      if (delConfirm.refresh) delConfirm.refresh()
    } catch (e) { alert(e.message) }
  }

  const doApptStatus  = async (id, s) => { try { await adminApi.updateAppointmentStatus(id, s); fetchAppts() } catch { /* silent */ } }
  const doOrderStatus = async (id, s) => { try { await adminApi.updateOrderStatus(id, s); fetchOrders() } catch { /* silent */ } }
  const doToggle      = async id      => { try { await adminApi.toggleActive(id); fetchUsers() } catch { /* silent */ } }
  const doRole        = async (id, r) => { try { await adminApi.updateRole(id, r); fetchUsers() } catch { /* silent */ } }
  const handleLogout  = async ()      => { await logout(); navigate('/staff') }

  async function doContactStatus(id, status) {
    try { await apiFetch(`/admin/contacts/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); sec('/admin/contacts', setContacts, setCtcTotal, ctcPage) } catch { /* silent */ }
  }
  async function doSubStatus(id, status) {
    try { await apiFetch(`/admin/subscriptions/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }); sec('/admin/subscriptions', setSubs, setSubTotal, subPage) } catch { /* silent */ }
  }

  async function sendNotif(e) {
    e.preventDefault(); setNotifSending(true); setNotifResult(null)
    const tk = token()
    const send = async uid => {
      const r = await fetch(`${API_BASE}/admin/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tk}` },
        body: JSON.stringify({ userId: uid, title: notifTitle, message: notifMsg, type: notifType }),
      })
      if (!r.ok) throw new Error('fail')
    }
    try {
      if (notifTarget === 'all') {
        let ok = 0
        for (const c of notifClients) { try { await send(c.id); ok++ } catch { /* skip */ } }
        setNotifResult({ ok: true, msg: `✓ Sent to ${ok} clients.` })
        setSentHistory(h => [{ title: notifTitle, target: 'All clients', type: notifType, time: new Date() }, ...h].slice(0, 5))
      } else {
        await send(notifTarget)
        const c = notifClients.find(x => x.id === notifTarget)
        setNotifResult({ ok: true, msg: `✓ Sent to ${c?.full_name || 'client'}.` })
        setSentHistory(h => [{ title: notifTitle, target: c?.full_name || 'Client', type: notifType, time: new Date() }, ...h].slice(0, 5))
      }
      setNotifTitle(''); setNotifMsg(''); setNotifTarget('')
    } catch (err) { setNotifResult({ ok: false, msg: `✗ ${err.message}` }) }
    finally { setNotifSending(false) }
  }

  const inpSx = { padding: '.55rem .85rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '.85rem', color: 'var(--slate)', outline: 'none', fontFamily: 'var(--font-body)', width: '100%', boxSizing: 'border-box' }
  const selSx = { ...inpSx, cursor: 'pointer' }
  const taSx  = { ...inpSx, resize: 'vertical', lineHeight: 1.6 }

  function renderModalFields() {
    if (!modal) return null
    switch (modal.type) {
     case 'post': return (<>
  <div className="field-row">
    <div className="field"><label>Title *</label><input style={inpSx} value={form.title || ''} onChange={fld('title')} placeholder="Post title" /></div>
    <div className="field"><label>Slug *</label><input style={inpSx} value={form.slug || ''} onChange={e => {
      setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }))
    }} placeholder="url-slug" /></div>
  </div>
  <div className="field"><label>Excerpt</label><textarea style={taSx} rows={2} value={form.excerpt || ''} onChange={fld('excerpt')} /></div>
  <div className="field"><label>Content (Markdown)</label><textarea style={{ ...taSx, fontFamily: 'monospace', fontSize: '.82rem' }} rows={10} value={form.content || ''} onChange={fld('content')} placeholder="## Heading&#10;&#10;Write your article here in markdown...&#10;&#10;- Bullet point&#10;- Another point" /></div>
  <div className="field-row">
    <div className="field"><label>Category</label>
      <select style={selSx} value={form.category || 'Anxiety'} onChange={fld('category')}>
        {['Anxiety','Depression','Self-Care','Mindfulness','Relationships','Trauma','Parenting','Sleep'].map(c => <option key={c}>{c}</option>)}
      </select>
    </div>
    <div className="field"><label>Author Name *</label><input style={inpSx} value={form.author || ''} onChange={fld('author')} placeholder="Dr. Anita Shrestha" /></div>
  </div>
  <div className="field-row">
    <div className="field"><label>Author Role</label><input style={inpSx} value={form.author_role || ''} onChange={fld('author_role')} placeholder="Clinical Psychologist" /></div>
    <div className="field"><label>Read Time</label><input style={inpSx} value={form.read_time || '5 min'} onChange={fld('read_time')} placeholder="5 min" /></div>
  </div>
  <div className="field-row">
    <div className="field"><label>Publish Date</label><input style={inpSx} type="date" value={form.published_at ? form.published_at.slice(0,10) : new Date().toISOString().slice(0,10)} onChange={fld('published_at')} /></div>
    <div className="field"><label>Cover Image URL</label><input style={inpSx} value={form.image_url || ''} onChange={fld('image_url')} placeholder="https://…supabase.co/storage/…" /></div>
  </div>
  <div className="field"><label>Gradient (fallback color)</label>
    <select style={selSx} value={form.gradient || 'linear-gradient(135deg, #007BA8 0%, #00BFFF 100%)'} onChange={fld('gradient')}>
      {[
        'linear-gradient(135deg, #007BA8 0%, #00BFFF 100%)',
        'linear-gradient(135deg, #009FD4 0%, #22d3ee 100%)',
        'linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%)',
        'linear-gradient(135deg, #2d4a3e 0%, #3d6b5a 100%)',
        'linear-gradient(135deg, #006b8f 0%, #00BFFF 100%)',
      ].map(g => <option key={g} value={g}>{g.slice(0,40)}…</option>)}
    </select>
  </div>
  <div className="field"><label>Tags (comma separated)</label>
    <input style={inpSx} value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags || ''} onChange={e => setForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} placeholder="anxiety, nepal, culture" />
  </div>
  <div style={{ display: 'flex', gap: '1.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
      <Toggle on={!!form.featured} onChange={v => setForm(p => ({ ...p, featured: v }))} />
      <span style={{ fontSize: '.82rem' }}>⭐ Featured</span>
    </div>
  </div>
</>)

      case 'news_article': return (<>
        <div className="field"><label>Headline *</label><input style={inpSx} value={form.headline || ''} onChange={fld('headline')} /></div>
        <div className="field-row">
          <div className="field"><label>Slug *</label><input style={inpSx} value={form.slug || ''} onChange={fld('slug')} /></div>
          <div className="field"><label>Tag</label><input style={inpSx} value={form.tag || ''} onChange={fld('tag')} placeholder="Research" /></div>
        </div>
        <div className="field"><label>Summary</label><textarea style={taSx} rows={3} value={form.summary || ''} onChange={fld('summary')} /></div>
        <div className="field-row">
          <div className="field"><label>Author</label><input style={inpSx} value={form.author || ''} onChange={fld('author')} /></div>
          <div className="field"><label>Author Role</label><input style={inpSx} value={form.author_role || ''} onChange={fld('author_role')} /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Size</label><select style={selSx} value={form.size || 'medium'} onChange={fld('size')}><option value="hero">Hero</option><option value="secondary">Secondary</option><option value="medium">Medium</option><option value="small">Small</option></select></div>
          <div className="field"><label>Read Time</label><input style={inpSx} value={form.read_time || '5 min read'} onChange={fld('read_time')} /></div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[['is_published', 'Published'], ['is_featured', 'Featured']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Toggle on={form[k] !== false} onChange={v => setForm(p => ({ ...p, [k]: v }))} />
              <span style={{ fontSize: '.82rem' }}>{l}</span>
            </div>
          ))}
        </div>
      </>)

      case 'resource': return (<>
        <div className="field"><label>Title *</label><input style={inpSx} value={form.title || ''} onChange={fld('title')} /></div>
        <div className="field"><label>Description</label><textarea style={taSx} rows={2} value={form.description || ''} onChange={fld('description')} /></div>
        <div className="field-row">
          <div className="field"><label>Category</label><input style={inpSx} value={form.category || ''} onChange={fld('category')} /></div>
          <div className="field"><label>File Type</label><select style={selSx} value={form.file_type || 'pdf'} onChange={fld('file_type')}><option value="pdf">PDF</option><option value="video">Video</option><option value="audio">Audio</option><option value="worksheet">Worksheet</option><option value="ebook">eBook</option><option value="tool">Tool</option></select></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Emoji</label><input style={inpSx} value={form.emoji || '📄'} onChange={fld('emoji')} /></div>
          <div className="field"><label>Price Label</label><input style={inpSx} value={form.price_label || 'FREE'} onChange={fld('price_label')} /></div>
        </div>
        <div className="field"><label>File URL</label><input style={inpSx} value={form.file_url || ''} onChange={fld('file_url')} placeholder="/resources/file.pdf" /></div>
        <div className="field-row">
          <div className="field"><label>Access Level</label><select style={selSx} value={form.access_level || 'public'} onChange={fld('access_level')}><option value="public">Public</option><option value="registered">Registered</option><option value="premium">Premium</option></select></div>
          <div className="field"><label>Sort Order</label><input style={inpSx} type="number" value={form.sort_order || 0} onChange={fld('sort_order')} /></div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[['is_free', 'Free'], ['is_active', 'Active']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Toggle on={form[k] !== false} onChange={v => setForm(p => ({ ...p, [k]: v }))} />
              <span style={{ fontSize: '.82rem' }}>{l}</span>
            </div>
          ))}
        </div>
      </>)

      case 'gallery_item': return (<>
        <div className="field"><label>Title *</label><input style={inpSx} value={form.title || ''} onChange={fld('title')} /></div>
        <div className="field-row">
          <div className="field"><label>Category *</label><input style={inpSx} value={form.category || ''} onChange={fld('category')} placeholder="Events" /></div>
          <div className="field"><label>Emoji</label><input style={inpSx} value={form.emoji || '📸'} onChange={fld('emoji')} /></div>
        </div>
        <div className="field"><label>Description</label><textarea style={taSx} rows={2} value={form.description || ''} onChange={fld('description')} /></div>
        <div className="field"><label>Gradient (CSS)</label><input style={inpSx} value={form.gradient || ''} onChange={fld('gradient')} placeholder="linear-gradient(135deg,#007BA8,#00BFFF)" /></div>
        <div className="field-row">
          <div className="field"><label>Event Date</label><input style={inpSx} value={form.event_date || ''} onChange={fld('event_date')} placeholder="Mar 2024" /></div>
          <div className="field"><label>Sort Order</label><input style={inpSx} type="number" value={form.sort_order || 0} onChange={fld('sort_order')} /></div>
        </div>
        <div className="field-row3">
          <div className="field"><label>Col Span</label><input style={inpSx} type="number" value={form.col_span || 1} onChange={fld('col_span')} /></div>
          <div className="field"><label>Row Span</label><input style={inpSx} type="number" value={form.row_span || 1} onChange={fld('row_span')} /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '.2rem' }}>
            <Toggle on={form.is_active !== false} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
            <span style={{ fontSize: '.82rem', marginLeft: '.5rem' }}>Active</span>
          </div>
        </div>
      </>)

      case 'research_paper': return (<>
  <div className="field"><label>Title *</label><input style={inpSx} value={form.title || ''} onChange={fld('title')} placeholder="Full research paper title" /></div>
  <div className="field-row">
    <div className="field"><label>Journal</label><input style={inpSx} value={form.journal || ''} onChange={fld('journal')} placeholder="Journal of Mental Health" /></div>
    <div className="field"><label>Year</label><input style={inpSx} type="number" value={form.year || new Date().getFullYear()} onChange={fld('year')} /></div>
  </div>
  <div className="field"><label>Authors (comma separated)</label>
    <input style={inpSx} value={Array.isArray(form.authors) ? form.authors.join(', ') : form.authors || ''} onChange={e => setForm(p => ({ ...p, authors: e.target.value.split(',').map(a => a.trim()).filter(Boolean) }))} placeholder="Dr. Name One, Dr. Name Two" />
  </div>
  <div className="field-row">
    <div className="field"><label>Paper Type</label>
      <select style={selSx} value={form.type || 'Clinical Study'} onChange={fld('type')}>
        {['Clinical Study','Meta-Analysis','Case Report','Review Article','Policy Brief'].map(t => <option key={t}>{t}</option>)}
      </select>
    </div>
    <div className="field"><label>DOI</label><input style={inpSx} value={form.doi || ''} onChange={fld('doi')} placeholder="10.xxxx/..." /></div>
  </div>
  <div className="field"><label>Abstract</label><textarea style={taSx} rows={4} value={form.abstract || ''} onChange={fld('abstract')} /></div>
  <div className="field"><label>Keywords (comma separated)</label>
    <input style={inpSx} value={Array.isArray(form.keywords) ? form.keywords.join(', ') : form.keywords || ''} onChange={e => setForm(p => ({ ...p, keywords: e.target.value.split(',').map(k => k.trim().toLowerCase()).filter(Boolean) }))} placeholder="depression, nepal, cbt" />
  </div>
  <div className="field"><label>PDF URL (from Supabase Storage)</label>
    <input style={inpSx} value={form.pdf_url || ''} onChange={fld('pdf_url')} placeholder="https://…supabase.co/storage/v1/object/public/research-pdfs/…" />
  </div>
  <div className="field-row3">
    <div className="field"><label>Citations</label><input style={inpSx} type="number" value={form.citations || 0} onChange={fld('citations')} /></div>
    <div className="field"><label>Downloads</label><input style={inpSx} type="number" value={form.downloads || 0} onChange={fld('downloads')} /></div>
    <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '.2rem', gap: '.5rem' }}>
      <Toggle on={form.open_access !== false} onChange={v => setForm(p => ({ ...p, open_access: v }))} />
      <span style={{ fontSize: '.82rem' }}>🔓 Open Access</span>
    </div>
  </div>
</>)

      case 'psych_video': return (<>
        <div className="field"><label>Title *</label><input style={inpSx} value={form.title || ''} onChange={fld('title')} /></div>
        <div className="field"><label>YouTube ID *</label><input style={inpSx} value={form.youtube_id || ''} onChange={fld('youtube_id')} placeholder="dQw4w9WgXcQ" /></div>
        <div className="field"><label>Description</label><textarea style={taSx} rows={2} value={form.description || ''} onChange={fld('description')} /></div>
        <div className="field-row3">
          <div className="field"><label>Duration</label><input style={inpSx} value={form.duration || ''} onChange={fld('duration')} placeholder="18:42" /></div>
          <div className="field"><label>Views</label><input style={inpSx} value={form.views || ''} onChange={fld('views')} placeholder="12K views" /></div>
          <div className="field"><label>Sort Order</label><input style={inpSx} type="number" value={form.sort_order || 0} onChange={fld('sort_order')} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Toggle on={form.is_active !== false} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
          <span style={{ fontSize: '.82rem' }}>Active</span>
        </div>
      </>)

      case 'psych_analysis': return (<>
        <div className="field"><label>Title *</label><input style={inpSx} value={form.title || ''} onChange={fld('title')} /></div>
        <div className="field-row">
          <div className="field"><label>Slug *</label><input style={inpSx} value={form.slug || ''} onChange={fld('slug')} /></div>
          <div className="field"><label>Category</label><input style={inpSx} value={form.category || ''} onChange={fld('category')} /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Icon</label><input style={inpSx} value={form.icon || '📄'} onChange={fld('icon')} /></div>
          <div className="field"><label>Read Time</label><input style={inpSx} value={form.read_time || '5 min'} onChange={fld('read_time')} /></div>
        </div>
        <div className="field"><label>Excerpt</label><textarea style={taSx} rows={2} value={form.excerpt || ''} onChange={fld('excerpt')} /></div>
        <div className="field"><label>Content</label><textarea style={taSx} rows={5} value={form.content || ''} onChange={fld('content')} /></div>
        <div className="field"><label>Concepts (comma separated)</label><input style={inpSx} value={Array.isArray(form.concepts) ? form.concepts.join(', ') : form.concepts || ''} onChange={e => setForm(p => ({ ...p, concepts: e.target.value.split(',').map(c => c.trim()).filter(Boolean) }))} /></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Toggle on={form.is_active !== false} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
          <span style={{ fontSize: '.82rem' }}>Active</span>
        </div>
      </>)

      case 'psych_concept': return (<>
        <div className="field">
          <label>Term *</label>
          <input style={inpSx} value={form.term || ''} onChange={fld('term')} placeholder="e.g. Cognitive Dissonance" />
        </div>
        <div className="field">
          <label>Definition *</label>
          <textarea style={taSx} rows={4} value={form.definition || ''} onChange={fld('definition')} placeholder="The mental discomfort experienced when holding two contradictory beliefs…" />
        </div>
        <div className="field-row">
          <div className="field"><label>Sort Order</label><input style={inpSx} type="number" value={form.sort_order || 0} onChange={fld('sort_order')} /></div>
          <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '.2rem', gap: '.5rem' }}>
            <Toggle on={form.is_active !== false} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
            <span style={{ fontSize: '.82rem' }}>Active</span>
          </div>
        </div>
      </>)

      case 'therapist_profile': return (<>
        <div className="field-row">
          <div className="field"><label>Full Name *</label><input style={inpSx} value={form.full_name || ''} onChange={fld('full_name')} placeholder="Dr. Priya Tamang" /></div>
          <div className="field"><label>Email</label><input style={inpSx} value={form.email || ''} onChange={fld('email')} type="email" /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Phone</label><input style={inpSx} value={form.phone || ''} onChange={fld('phone')} /></div>
          <div className="field"><label>Department</label><input style={inpSx} value={form.department || ''} onChange={fld('department')} placeholder="Clinical" /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>License Number</label><input style={inpSx} value={form.license_number || ''} onChange={fld('license_number')} /></div>
          <div className="field"><label>License Type</label><input style={inpSx} value={form.license_type || ''} onChange={fld('license_type')} /></div>
        </div>
        <div className="field"><label>Specializations (comma separated)</label><input style={inpSx} value={Array.isArray(form.specializations) ? form.specializations.join(', ') : form.specializations || ''} onChange={e => setForm(p => ({ ...p, specializations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} /></div>
        <div className="field"><label>Bio</label><textarea style={taSx} rows={4} value={form.bio || ''} onChange={fld('bio')} /></div>
        <div className="field-row3">
          <div className="field"><label>Fee (NPR)</label><input style={inpSx} type="number" value={form.consultation_fee || ''} onChange={fld('consultation_fee')} /></div>
          <div className="field"><label>Duration (min)</label><input style={inpSx} type="number" value={form.session_duration || 60} onChange={fld('session_duration')} /></div>
          <div className="field"><label>Experience (yrs)</label><input style={inpSx} type="number" value={form.experience_years || 0} onChange={fld('experience_years')} /></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Languages (comma separated)</label><input style={inpSx} value={Array.isArray(form.languages_spoken) ? form.languages_spoken.join(', ') : form.languages_spoken || ''} onChange={e => setForm(p => ({ ...p, languages_spoken: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} /></div>
          <div className="field"><label>Avatar URL</label><input style={inpSx} value={form.avatar_url || ''} onChange={fld('avatar_url')} /></div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {[['is_available', 'Available'], ['is_verified', 'Verified'], ['is_active', 'Active']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Toggle on={form[k] !== false} onChange={v => setForm(p => ({ ...p, [k]: v }))} />
              <span style={{ fontSize: '.82rem' }}>{l}</span>
            </div>
          ))}
        </div>
      </>)

      case 'product': return (<>
        <div className="field"><label>Name *</label><input style={inpSx} value={form.name || ''} onChange={fld('name')} /></div>
        <div className="field-row">
          <div className="field"><label>Slug *</label><input style={inpSx} value={form.slug || ''} onChange={fld('slug')} /></div>
          <div className="field"><label>SKU</label><input style={inpSx} value={form.sku || ''} onChange={fld('sku')} /></div>
        </div>
        <div className="field"><label>Description</label><textarea style={taSx} rows={3} value={form.description || ''} onChange={fld('description')} /></div>
        <div className="field-row3">
          <div className="field"><label>Price (NPR) *</label><input style={inpSx} type="number" value={form.price || ''} onChange={fld('price')} /></div>
          <div className="field"><label>Sale Price</label><input style={inpSx} type="number" value={form.sale_price || ''} onChange={fld('sale_price')} /></div>
          <div className="field"><label>Stock Qty</label><input style={inpSx} type="number" value={form.stock_quantity || 0} onChange={fld('stock_quantity')} /></div>
        </div>
        <div className="field"><label>Tags (comma separated)</label><input style={inpSx} value={Array.isArray(form.tags) ? form.tags.join(', ') : form.tags || ''} onChange={e => setForm(p => ({ ...p, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))} /></div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[['is_digital', 'Digital'], ['is_active', 'Active'], ['is_featured', 'Featured']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Toggle on={!!form[k]} onChange={v => setForm(p => ({ ...p, [k]: v }))} />
              <span style={{ fontSize: '.82rem' }}>{l}</span>
            </div>
          ))}
        </div>
      </>)

      case 'course': return (<>
        <div className="field"><label>Title *</label><input style={inpSx} value={form.title || ''} onChange={fld('title')} /></div>
        <div className="field-row">
          <div className="field"><label>Slug *</label><input style={inpSx} value={form.slug || ''} onChange={fld('slug')} /></div>
          <div className="field"><label>Emoji</label><input style={inpSx} value={form.emoji || '📚'} onChange={fld('emoji')} /></div>
        </div>
        <div className="field"><label>Description</label><textarea style={taSx} rows={3} value={form.description || ''} onChange={fld('description')} /></div>
        <div className="field-row3">
          <div className="field"><label>Price (NPR)</label><input style={inpSx} type="number" value={form.price || 0} onChange={fld('price')} /></div>
          <div className="field"><label>Price Label</label><input style={inpSx} value={form.price_label || 'FREE'} onChange={fld('price_label')} /></div>
          <div className="field"><label>Level</label><select style={selSx} value={form.level || 'Beginner'} onChange={fld('level')}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
        </div>
        <div className="field-row">
          <div className="field"><label>Lessons Count</label><input style={inpSx} type="number" value={form.lessons_count || 0} onChange={fld('lessons_count')} /></div>
          <div className="field"><label>Duration (hours)</label><input style={inpSx} type="number" value={form.duration_hours || 0} onChange={fld('duration_hours')} /></div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[['is_free', 'Free'], ['is_published', 'Published']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Toggle on={!!form[k]} onChange={v => setForm(p => ({ ...p, [k]: v }))} />
              <span style={{ fontSize: '.82rem' }}>{l}</span>
            </div>
          ))}
        </div>
      </>)

      case 'assessment': return (<>
        <div className="field"><label>Title *</label><input style={inpSx} value={form.title || ''} onChange={fld('title')} /></div>
        <div className="field-row">
          <div className="field"><label>Slug *</label><input style={inpSx} value={form.slug || ''} onChange={fld('slug')} /></div>
          <div className="field"><label>Type</label><select style={selSx} value={form.type || 'custom'} onChange={fld('type')}><option value="phq9">PHQ-9</option><option value="gad7">GAD-7</option><option value="dass21">DASS-21</option><option value="burnout">Burnout</option><option value="stress">Stress</option><option value="custom">Custom</option></select></div>
        </div>
        <div className="field"><label>Description</label><textarea style={taSx} rows={2} value={form.description || ''} onChange={fld('description')} /></div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {[['is_free', 'Free'], ['is_active', 'Active']].map(([k, l]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <Toggle on={form[k] !== false} onChange={v => setForm(p => ({ ...p, [k]: v }))} />
              <span style={{ fontSize: '.82rem' }}>{l}</span>
            </div>
          ))}
        </div>
      </>)

      case 'community_group': return (<>
        <div className="field"><label>Name *</label><input style={inpSx} value={form.name || ''} onChange={fld('name')} /></div>
        <div className="field"><label>Description</label><textarea style={taSx} rows={3} value={form.description || ''} onChange={fld('description')} /></div>
        <div className="field-row">
          <div className="field"><label>Emoji</label><input style={inpSx} value={form.emoji || '💙'} onChange={fld('emoji')} /></div>
          <div className="field"><label>Color</label><input style={inpSx} value={form.color || ''} onChange={fld('color')} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Toggle on={form.is_active !== false} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
          <span style={{ fontSize: '.82rem' }}>Active</span>
        </div>
      </>)

      case 'faq': return (<>
        <div className="field"><label>Question *</label><input style={inpSx} value={form.question || ''} onChange={fld('question')} /></div>
        <div className="field"><label>Answer *</label><textarea style={taSx} rows={4} value={form.answer || ''} onChange={fld('answer')} /></div>
        <div className="field-row">
          <div className="field"><label>Category</label><input style={inpSx} value={form.category || ''} onChange={fld('category')} /></div>
          <div className="field"><label>Sort Order</label><input style={inpSx} type="number" value={form.sort_order || 0} onChange={fld('sort_order')} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Toggle on={form.is_active !== false} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
          <span style={{ fontSize: '.82rem' }}>Active</span>
        </div>
      </>)

      case 'coupon': return (<>
        <div className="field-row">
          <div className="field"><label>Code *</label><input style={inpSx} value={form.code || ''} onChange={fld('code')} placeholder="WELCOME20" /></div>
          <div className="field"><label>Type</label><select style={selSx} value={form.type || 'percentage'} onChange={fld('type')}><option value="percentage">Percentage</option><option value="fixed">Fixed (NPR)</option></select></div>
        </div>
        <div className="field"><label>Description</label><input style={inpSx} value={form.description || ''} onChange={fld('description')} /></div>
        <div className="field-row3">
          <div className="field"><label>Value *</label><input style={inpSx} type="number" value={form.value || ''} onChange={fld('value')} /></div>
          <div className="field"><label>Min Order (NPR)</label><input style={inpSx} type="number" value={form.min_order_amount || 0} onChange={fld('min_order_amount')} /></div>
          <div className="field"><label>Max Uses</label><input style={inpSx} type="number" value={form.max_uses || ''} onChange={fld('max_uses')} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          <Toggle on={form.is_active !== false} onChange={v => setForm(p => ({ ...p, is_active: v }))} />
          <span style={{ fontSize: '.82rem' }}>Active</span>
        </div>
      </>)

      case 'setting': return (<>
        <div className="field"><label>Key</label><input style={{ ...inpSx, background: '#f0f4f8', cursor: 'not-allowed' }} value={form.key || ''} readOnly /></div>
        <div className="field">
          <label>Value</label>
          <textarea style={taSx} rows={3} value={typeof form.value === 'object' ? JSON.stringify(form.value) : String(form.value ?? '')} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
          <span className="hint">Wrap strings in quotes: "Nepal". Numbers without quotes.</span>
        </div>
      </>)

      default: return <p style={{ color: 'var(--slate-lt)', fontSize: '.85rem' }}>No form defined for "{modal.type}".</p>
    }
  }

  

  if (authLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', color: 'var(--slate-lt)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🌿</div>
        <p style={{ fontFamily: 'var(--font-body)' }}>Verifying session…</p>
      </div>
    </div>
  )

  const allTabs = SIDEBAR.flatMap(g => g.items)
  const del = (endpoint, id, label, refresh) => setDelConfirm({ endpoint, id, label, refresh })

  return (
    <div className="adm">

      {/* TOP BAR */}
      <div className="adm-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <img src="/header.png" alt="" style={{ height: 28, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '.92rem', color: 'white', fontWeight: 600, lineHeight: 1.1 }}>Puja Samargi</div>
            <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Admin Panel</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '.78rem' }}>
            {(user?.fullName || user?.full_name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.7)', fontFamily: 'var(--font-body)' }}>
            {(user?.fullName || user?.full_name || '').split(' ')[0]}
          </span>
          <button onClick={handleLogout} style={{ padding: '.32rem .7rem', borderRadius: 6, border: '1.5px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.1)', color: 'white', fontSize: '.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
            Log Out
          </button>
        </div>
      </div>

      {/* MOBILE TABBAR */}
      <div className="adm-tabbar">
        {allTabs.map(t => (
          <button key={t.id} className={`tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="adm-body">

        {/* SIDEBAR */}
        <div className="adm-side">
          {SIDEBAR.map(g => (
            <div key={g.group}>
              <div className="side-group">{g.group}</div>
              {g.items.map(t => (
                <button key={t.id} className={`side-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
                  <span style={{ width: 16, textAlign: 'center', fontSize: '.85rem' }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          ))}
          <div className="side-divider" />
          <button className="side-btn highlight" onClick={() => navigate('/register-staffs')}>
            <span style={{ width: 16, textAlign: 'center' }}>➕</span>Register Staff
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="adm-content">

          {/* ═══ DASHBOARD ═══ */}
          {tab === 'dashboard' && (
            <div>
              <div className="sec-head">
                <div><h1 className="sec-title">Overview</h1><p className="sec-sub">Welcome back, {(user?.fullName || user?.full_name || '').split(' ')[0]}.</p></div>
                <button className="btn btn-ghost" onClick={fetchDashboard}>🔄 Refresh</button>
              </div>
              <div className="stat-grid">
                {[
                  { icon: '👥', val: stats?.totalUsers,        label: 'Total Clients',   color: '#e0f7ff', tab: 'users' },
                  { icon: '📅', val: stats?.totalAppointments, label: 'Appointments',    color: '#e8f8f0', tab: 'appointments' },
                  { icon: '📦', val: stats?.totalOrders,       label: 'Total Orders',    color: '#fff5e6', tab: 'orders' },
{ icon: '💰', val: stats?.revenue30d != null ? `NPR ${Number(stats.revenue30d).toLocaleString()}` : undefined, label: 'Revenue (30d)', color: '#f0e8ff', tab: 'payments' },
                ].map((s, i) => (
                  <div key={i} className="stat-card" style={{ background: s.color }} onClick={() => setTab(s.tab)}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '.35rem' }}>{s.icon}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,3vw,1.8rem)', color: 'var(--slate)', fontWeight: 700 }}>
                      {s.val ?? <span style={{ opacity: .3, fontSize: '1.1rem' }}>—</span>}
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'var(--slate-lt)', fontWeight: 600, marginTop: '.2rem' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--slate)', marginBottom: '.85rem' }}>Quick Access</div>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
                  {allTabs.slice(1).map(t => <button key={t.id} className="btn btn-ghost btn-sm" onClick={() => setTab(t.id)}>{t.icon} {t.label}</button>)}
                </div>
              </div>
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.25rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--slate)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Recent Payments</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab('payments')}>View All →</button>
                </div>
                {busy.dash
                  ? <p style={{ color: 'var(--slate-lt)', fontSize: '.82rem' }}>Loading…</p>
                  : recent.length === 0
                    ? <p style={{ color: 'var(--slate-lt)', fontSize: '.82rem' }}>No payments yet.</p>
                    : recent.map((p, i) => {
                        const { clientName, linkedTo, isPending } = resolvePaymentDetails(p)
                        return (
                          <div key={p.id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.6rem 0', borderBottom: i < recent.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap', gap: '.5rem' }}>
                            <div>
                              <div style={{ fontSize: '.85rem', color: 'var(--slate)', fontWeight: 600 }}>
                                {p.currency || 'NPR'} {Number(p.amount || 0).toLocaleString()}
                                <span style={{ fontSize: '.72rem', color: 'var(--slate-lt)', fontWeight: 400, marginLeft: '.4rem' }}>· {p.method || '—'}</span>
                              </div>
                              <div style={{ fontSize: '.72rem', color: 'var(--slate-lt)' }}>{clientName} · {linkedTo} · {fmt(p.created_at)}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
                              <PaymentValidityBadge status={p.status} />
                              {isPending && <button className="btn btn-green btn-sm" onClick={() => setTab('payments')}>Confirm →</button>}
                            </div>
                          </div>
                        )
                      })
                }
              </div>
            </div>
          )}

          {/* ═══ USERS ═══ */}
          {tab === 'users' && (
            <div>
              <SectionHeader title="👥 Users" count={uTotal}>
                <input className="inp" value={uSearch} onChange={e => setUSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchUsers()} placeholder="Search name/email…" style={{ width: 180 }} />
                <select className="inp" value={uRole} onChange={e => { setURole(e.target.value); setUPage(1) }}>
                  <option value="">All roles</option>
                  {['client', 'therapist', 'admin', 'staff'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button className="btn btn-ghost" onClick={() => { setUPage(1); fetchUsers() }}>Search</button>
              </SectionHeader>
              <TblWrap loading={busy.users} cols={['User', 'Email', 'Role', 'Status', 'Joined', 'Actions']}
                rows={users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e0f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: '#007BA8', flexShrink: 0 }}>
                          {(u.full_name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <strong style={{ color: 'var(--slate)', fontSize: '.83rem' }}>{u.full_name}</strong>
                      </div>
                    </td>
                    <td style={{ color: 'var(--slate-lt)', fontSize: '.77rem' }}>{u.email}</td>
                    <td>
                      <select className="inp" value={u.role} onChange={e => doRole(u.id, e.target.value)} style={{ padding: '.2rem .5rem', fontSize: '.75rem' }}>
                        {['client', 'therapist', 'admin', 'staff'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td><Badge s={u.is_active ? 'active' : 'paused'} /></td>
                    <td style={{ color: 'var(--slate-lt)', fontSize: '.77rem' }}>{fmt(u.created_at)}</td>
                    <td>
                      <button className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-green'}`} onClick={() => doToggle(u.id)}>
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={uPage} set={setUPage} total={uTotal} />
            </div>
          )}

          {/* ═══ APPOINTMENTS ═══ */}
          {tab === 'appointments' && (
            <div>
              <SectionHeader title="📅 Appointments" count={aTotal}>
                <select className="inp" value={aStatus} onChange={e => { setAStatus(e.target.value); setAPage(1) }}>
                  <option value="">All statuses</option>
                  {['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </SectionHeader>
              <TblWrap loading={busy.appts} cols={['Client', 'Therapist', 'Date & Time', 'Type', 'Status', 'Update']}
                rows={appts.map(a => (
                  <tr key={a.id}>
                    <td>
                      <strong style={{ color: 'var(--slate)', fontSize: '.83rem' }}>{resolveClientName(a)}</strong>
                      {a.client_id && <div style={{ fontSize: '.68rem', color: 'var(--slate-lt)', fontFamily: 'monospace' }}>{String(a.client_id).slice(0, 12)}…</div>}
                    </td>
                    <td style={{ fontSize: '.82rem' }}>{resolveTherapistName(a)}</td>
                    <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{fmtT(a.scheduled_at)}</td>
                    <td><span style={{ fontSize: '.72rem', background: 'var(--bg)', padding: '.15rem .45rem', borderRadius: 4 }}>{a.type}</span></td>
                    <td><Badge s={a.status} /></td>
                    <td>
                      <select className="inp" value={a.status} onChange={e => doApptStatus(a.id, e.target.value)} style={{ padding: '.22rem .45rem', fontSize: '.75rem' }}>
                        {['pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={aPage} set={setAPage} total={aTotal} />
            </div>
          )}

          {/* ═══ ORDERS ═══ */}
          {tab === 'orders' && (
            <div>
              <SectionHeader title="📦 Orders" count={oTotal}>
                <select className="inp" value={oStatus} onChange={e => { setOStatus(e.target.value); setOPage(1) }}>
                  <option value="">All statuses</option>
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </SectionHeader>
              <TblWrap loading={busy.orders} cols={['Order #', 'Client', 'Amount', 'Status', 'Date', 'Update']}
                rows={orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700, color: 'var(--green)', fontSize: '.78rem' }}>{o.order_number || '—'}</td>
                    <td style={{ fontSize: '.82rem' }}>{o.client_name || o.clients?.full_name || o.profiles?.full_name || '—'}</td>
                    <td><strong>NPR {Number(o.total_amount || 0).toLocaleString()}</strong></td>
                    <td><Badge s={o.status} /></td>
                    <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{fmt(o.created_at)}</td>
                    <td>
                      <select className="inp" value={o.status} onChange={e => doOrderStatus(o.id, e.target.value)} style={{ padding: '.22rem .45rem', fontSize: '.75rem' }}>
                        {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={oPage} set={setOPage} total={oTotal} />
            </div>
          )}

          {/* ═══ PAYMENTS ═══ */}
          {tab === 'payments' && <AdminPaymentSection />}

          {/* ═══ NOTIFICATIONS ═══ */}
          {tab === 'notifications' && (
            <div>
              <h1 className="sec-title" style={{ marginBottom: '1.5rem' }}>🔔 Send Notifications</h1>
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <form onSubmit={sendNotif} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="field">
                    <label>Send To</label>
                    <select style={{ padding: '.55rem .85rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '.85rem', color: 'var(--slate)', outline: 'none', fontFamily: 'var(--font-body)', cursor: 'pointer', width: '100%' }} value={notifTarget} onChange={e => setNotifTarget(e.target.value)} required>
                      <option value="">— Select recipient —</option>
                      <option value="all">📢 All Clients ({notifClients.length})</option>
                      {notifClients.map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                    </select>
                  </div>
                  <div className="field-row">
                    <div className="field">
                      <label>Type</label>
                      <select style={{ padding: '.55rem .85rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '.85rem', color: 'var(--slate)', outline: 'none', fontFamily: 'var(--font-body)', cursor: 'pointer', width: '100%' }} value={notifType} onChange={e => setNotifType(e.target.value)}>
                        {['system', 'appointment', 'payment', 'reminder', 'message', 'review'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="field">
                      <label>Title *</label>
                      <input style={{ padding: '.55rem .85rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '.85rem', color: 'var(--slate)', outline: 'none', fontFamily: 'var(--font-body)', width: '100%' }} value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder="e.g. Session reminder" required />
                    </div>
                  </div>
                  <div className="field">
                    <label>Message (optional)</label>
                    <textarea style={{ padding: '.55rem .85rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '.85rem', color: 'var(--slate)', outline: 'none', fontFamily: 'var(--font-body)', resize: 'vertical', lineHeight: 1.6, width: '100%' }} rows={3} value={notifMsg} onChange={e => setNotifMsg(e.target.value)} />
                  </div>
                  {notifResult && <div className={`alert ${notifResult.ok ? 'alert-success' : 'alert-error'}`}>{notifResult.msg}</div>}
                  <button type="submit" className="btn btn-primary" disabled={notifSending || !notifTarget || !notifTitle.trim()} style={{ alignSelf: 'flex-start' }}>
                    {notifSending ? 'Sending…' : '🔔 Send Notification'}
                  </button>
                </form>
              </div>
              {sentHistory.length > 0 && (
                <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', padding: '1.25rem' }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--slate)', marginBottom: '.85rem' }}>Recently Sent</h2>
                  {sentHistory.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.55rem 0', borderBottom: i < sentHistory.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap', gap: '.4rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--slate)', fontSize: '.85rem' }}>{h.title}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--slate-lt)' }}>To: {h.target} · {h.type}</div>
                      </div>
                      <span style={{ fontSize: '.72rem', color: 'var(--slate-lt)' }}>{h.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ BLOG POSTS ═══ */}
          {tab === 'posts' && (
            <div>
              <SectionHeader title="✍️ Blog Posts" count={postsTotal} sub="Manage all blog content" onNew={() => openCreate('post', { status: 'draft', featured: false })} />
              <TblWrap loading={busy.posts} cols={['Title', 'Category', 'Author', 'Status', 'Featured', 'Actions']}
                rows={posts.map(p => (
                  <tr key={p.id}>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{p.title}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{p.slug}</div>
                    </td>
                    <td><span style={{ fontSize: '.75rem', background: 'var(--bg)', padding: '.15rem .45rem', borderRadius: 4 }}>{p.category || '—'}</span></td>
                    <td style={{ fontSize: '.8rem' }}>{p.author_name || '—'}</td>
                    <td><Badge s={p.status || 'draft'} /></td>
                    <td><Badge s={p.featured ? 'true' : 'false'} /></td>
                    <td><Actions onEdit={() => openEdit('post', p)} onDelete={() => del('/admin/posts', p.id, p.title, () => sec('/admin/posts', setPosts, setPostsTotal, postsPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={postsPage} set={setPostsPage} total={postsTotal} />
            </div>
          )}

          {/* ═══ NEWS ═══ */}
          {tab === 'news' && (
            <div>
              <SectionHeader title="📰 News Articles" count={newsTotal} sub="Manage news content" onNew={() => openCreate('news_article', { is_published: true, is_featured: false, size: 'medium' })} />
              <TblWrap loading={busy.news} cols={['Headline', 'Author', 'Tag', 'Size', 'Featured', 'Published', 'Actions']}
                rows={news.map(n => (
                  <tr key={n.id}>
                    <td style={{ maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{n.headline}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{n.slug}</div>
                    </td>
                    <td style={{ fontSize: '.8rem' }}>{n.author || '—'}</td>
                    <td><span style={{ fontSize: '.75rem', background: 'var(--bg)', padding: '.15rem .45rem', borderRadius: 4 }}>{n.tag || '—'}</span></td>
                    <td><Badge s={n.size || 'medium'} /></td>
                    <td><Badge s={n.is_featured ? 'true' : 'false'} /></td>
                    <td><Badge s={n.is_published ? 'published' : 'draft'} /></td>
                    <td><Actions onEdit={() => openEdit('news_article', n)} onDelete={() => del('/admin/news', n.id, n.headline, () => sec('/admin/news', setNews, setNewsTotal, newsPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={newsPage} set={setNewsPage} total={newsTotal} />
            </div>
          )}

          {/* ═══ RESOURCES ═══ */}
          {tab === 'resources' && (
            <div>
              <SectionHeader title="📥 Resources" count={resTotal} sub="Downloadable files and tools" onNew={() => openCreate('resource', { is_free: true, access_level: 'public', is_active: true, emoji: '📄', sort_order: 0 })} />
              <TblWrap loading={busy.resources} cols={['Title', 'Category', 'Type', 'Price', 'Downloads', 'Active', 'Actions']}
                rows={resources.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{r.emoji || '📄'} {r.title}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{r.description?.slice(0, 50)}</div>
                    </td>
                    <td><span style={{ fontSize: '.75rem', background: 'var(--bg)', padding: '.15rem .45rem', borderRadius: 4 }}>{r.category || '—'}</span></td>
                    <td><Badge s={r.file_type || r.type_label || '—'} /></td>
                    <td style={{ fontSize: '.8rem' }}>{r.price_label || (r.is_free ? 'FREE' : 'Paid')}</td>
                    <td style={{ textAlign: 'center' }}>{r.download_count || 0}</td>
                    <td><Badge s={r.is_active !== false ? 'active' : 'paused'} /></td>
                    <td><Actions onEdit={() => openEdit('resource', r)} onDelete={() => del('/admin/resources', r.id, r.title, () => sec('/admin/resources', setRes, setResTotal, resPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={resPage} set={setResPage} total={resTotal} />
            </div>
          )}

          {/* ═══ GALLERY ═══ */}
          {tab === 'gallery' && (
            <div>
              <SectionHeader title="🖼️ Gallery" count={galTotal} sub="Photo gallery items" onNew={() => openCreate('gallery_item', { is_active: true, sort_order: 0, col_span: 1, row_span: 1, emoji: '📸' })} />
              <TblWrap loading={busy.gallery} cols={['Title', 'Category', 'Date', 'Cols×Rows', 'Active', 'Actions']}
                rows={gallery.map(g => (
                  <tr key={g.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{g.emoji} {g.title}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{g.description?.slice(0, 50)}</div>
                    </td>
                    <td><span style={{ fontSize: '.75rem', background: 'var(--bg)', padding: '.15rem .45rem', borderRadius: 4 }}>{g.category}</span></td>
                    <td style={{ fontSize: '.78rem', color: 'var(--slate-lt)' }}>{g.event_date || '—'}</td>
                    <td style={{ textAlign: 'center', fontSize: '.82rem' }}>{g.col_span}×{g.row_span}</td>
                    <td><Badge s={g.is_active !== false ? 'active' : 'paused'} /></td>
<td>
  <div style={{ display: 'flex', gap: '.35rem' }}>
    <button className="btn btn-ghost btn-sm" onClick={() => openEdit('gallery_item', g)}>✏️</button>
    <button className="btn btn-ghost btn-sm" style={{ color: '#007BA8' }}
      onClick={() => { setPhotoReplace({ id: g.id, title: g.title, category: g.category }); setPhotoError('') }}>
      🖼️ Photo
    </button>
    <button className="btn btn-danger btn-sm"
      onClick={() => del('/admin/gallery', g.id, g.title, () => sec('/admin/gallery', setGallery, setGalTotal, galPage))}>
      🗑
    </button>
  </div>
</td>                  </tr>
                ))}
              />
              <Pager page={galPage} set={setGalPage} total={galTotal} />
            </div>
          )}

          {/* ═══ VIDEO REVIEWS ═══ */}
{tab === 'reviews' && (
  <ReviewsModeration />
)}

{photoReplace && (
  <div className="modal-overlay" onClick={() => setPhotoReplace(null)}>
    <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--slate)' }}>
          🖼️ Replace Photo
        </span>
        <button className="btn btn-ghost btn-sm" onClick={() => setPhotoReplace(null)}>✕</button>
      </div>
      <div className="modal-body">
        <p style={{ fontSize: '.85rem', color: 'var(--slate-md)', marginBottom: '.5rem' }}>
          Replacing photo for: <strong>{photoReplace.title}</strong>
        </p>
        <div className="field">
          <label>Select New Photo</label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            style={{ padding: '.55rem', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: '.85rem', width: '100%' }}
            onChange={e => {
              const file = e.target.files[0]
              if (!file) return
              if (file.size > 10 * 1024 * 1024) { setPhotoError('File must be under 10 MB'); return }
              replaceGalleryPhoto(file, photoReplace.id)
            }}
          />
          <span className="hint">JPG, PNG, WEBP · Max 10 MB</span>
        </div>
        {photoError && <div className="alert alert-error">{photoError}</div>}
        {photoUploading && (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--teal)', fontWeight: 600, fontSize: '.85rem' }}>
            ⏳ Uploading photo…
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={() => setPhotoReplace(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}
          {/* ═══ RESEARCH ═══ */}
          {tab === 'research' && (
            <div>
              <SectionHeader title="🔬 Research Papers" count={rscTotal} sub="Academic publications" onNew={() => openCreate('research_paper', { open_access: true, is_active: true, citations: 0, downloads: 0, paper_type: 'Clinical Study' })} />
              <TblWrap loading={busy.research} cols={['Title', 'Journal', 'Year', 'Type', 'Citations', 'Open', 'Actions']}
                rows={research.map(r => (
                  <tr key={r.id}>
                    <td style={{ maxWidth: 240 }}>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{r.title}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{(r.authors || []).join(', ')}</div>
                    </td>
                    <td style={{ fontSize: '.78rem' }}>{r.journal || '—'}</td>
                    <td style={{ fontWeight: 700 }}>{r.year || '—'}</td>
                    <td><Badge s={r.paper_type || '—'} /></td>
                    <td style={{ textAlign: 'center' }}>{r.citations || 0}</td>
                    <td><Badge s={r.open_access ? 'open' : 'premium'} /></td>
                    <td><Actions onEdit={() => openEdit('research_paper', r)} onDelete={() => del('/admin/research', r.id, r.title, () => sec('/admin/research', setResearch, setRscTotal, rscPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={rscPage} set={setRscPage} total={rscTotal} />
            </div>
          )}

          {/* ═══ PSYCH VIDEOS ═══ */}
          {tab === 'psych_videos' && (
            <div>
              <SectionHeader title="🎬 Psych Videos" count={pvTotal} sub="YouTube video library" onNew={() => openCreate('psych_video', { is_active: true, sort_order: 0 })} />
              <TblWrap loading={busy.psych_videos} cols={['Title', 'YouTube ID', 'Duration', 'Views', 'Order', 'Active', 'Actions']}
                rows={pvids.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{v.title}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{v.description?.slice(0, 50)}</div>
                    </td>
                    <td><code style={{ fontSize: '.75rem', fontFamily: 'monospace', background: '#f0f4f8', padding: '.1rem .4rem', borderRadius: 4 }}>{v.youtube_id}</code></td>
                    <td style={{ fontSize: '.78rem' }}>{v.duration || '—'}</td>
                    <td style={{ fontSize: '.78rem' }}>{v.views || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{v.sort_order}</td>
                    <td><Badge s={v.is_active !== false ? 'active' : 'paused'} /></td>
                    <td><Actions onEdit={() => openEdit('psych_video', v)} onDelete={() => del('/admin/psych-videos', v.id, v.title, () => sec('/admin/psych-videos', setPvids, setPvTotal, pvPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={pvPage} set={setPvPage} total={pvTotal} />
            </div>
          )}

          {/* ═══ PSYCH ANALYSES ═══ */}
          {tab === 'psych_analyses' && (
            <div>
              <SectionHeader title="🧠 Psych Analyses" count={paTotal} sub="Psychology deep-dives" onNew={() => openCreate('psych_analysis', { is_active: true, sort_order: 0, icon: '📄' })} />
              <TblWrap loading={busy.psych_analyses} cols={['Title', 'Category', 'Icon', 'Read Time', 'Order', 'Active', 'Actions']}
                rows={panalyses.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{a.title}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{a.slug}</div>
                    </td>
                    <td><span style={{ fontSize: '.75rem', background: 'var(--bg)', padding: '.15rem .45rem', borderRadius: 4 }}>{a.category}</span></td>
                    <td style={{ fontSize: '1.1rem' }}>{a.icon || '📄'}</td>
                    <td style={{ fontSize: '.78rem' }}>{a.read_time || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{a.sort_order}</td>
                    <td><Badge s={a.is_active !== false ? 'active' : 'paused'} /></td>
                    <td><Actions onEdit={() => openEdit('psych_analysis', a)} onDelete={() => del('/admin/psych-analyses', a.id, a.title, () => sec('/admin/psych-analyses', setPanalyses, setPaTotal, paPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={paPage} set={setPaPage} total={paTotal} />
            </div>
          )}

          {/* ═══ PSYCH CONCEPTS ═══ */}
          {tab === 'psych_concepts' && (
            <div>
              <SectionHeader title="💡 Psych Concepts" count={pcTotal} sub="Psychology 101 glossary" onNew={() => openCreate('psych_concept', { is_active: true, sort_order: 0 })} />
              <TblWrap loading={busy.psych_concepts} cols={['Term', 'Definition (preview)', 'Order', 'Active', 'Actions']}
                rows={pconcepts.map(c => (
                  <tr key={c.id}>
                    <td><div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--teal-dk)' }}>{c.term}</div></td>
                    <td style={{ maxWidth: 340 }}>
                      <div style={{ fontSize: '.78rem', color: 'var(--slate-md)', lineHeight: 1.5 }}>
                        {c.definition?.slice(0, 120)}{c.definition?.length > 120 ? '…' : ''}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '.82rem' }}>{c.sort_order}</td>
                    <td><Badge s={c.is_active !== false ? 'active' : 'paused'} /></td>
                    <td><Actions onEdit={() => openEdit('psych_concept', c)} onDelete={() => del('/admin/psych-concepts', c.id, c.term, () => sec('/admin/psych-concepts', setPconcepts, setPcTotal, pcPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={pcPage} set={setPcPage} total={pcTotal} />
            </div>
          )}

          {/* ═══ THERAPISTS ═══ */}
          {tab === 'therapists' && (
            <div>
              <SectionHeader title="🩺 Therapists" count={thrTotal} sub="Manage therapist profiles" onNew={() => openCreate('therapist_profile', { is_available: true, is_verified: true, is_active: true, consultation_fee: 2000, session_duration: 60, experience_years: 0, languages_spoken: ['Nepali', 'English'], specializations: [] })} />
              <TblWrap loading={busy.therapists} cols={['Therapist', 'License / Specialization', 'Fee', 'Experience', 'Available', 'Verified', 'Actions']}
                rows={therapists.map(t => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        {t.avatar_url
                          ? <img src={t.avatar_url} alt="" style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          : <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#e0f7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.65rem', fontWeight: 800, color: '#007BA8', flexShrink: 0 }}>
                              {(t.full_name || 'T').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                        }
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '.83rem', color: 'var(--slate)' }}>{t.full_name || '—'}</div>
                          <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{t.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--slate-md)' }}>{t.license_type || '—'}</div>
                      <div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap', marginTop: '.2rem' }}>
                        {(t.specializations || []).slice(0, 3).map(s => <span key={s} className="chip" style={{ fontSize: '.65rem' }}>{s}</span>)}
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '.83rem' }}>NPR {Number(t.consultation_fee || 0).toLocaleString()}</td>
                    <td style={{ fontSize: '.82rem', color: 'var(--slate-md)' }}>{t.experience_years ?? 0} yrs</td>
                    <td><Badge s={t.is_available ? 'active' : 'paused'} /></td>
                    <td><Badge s={t.is_verified ? 'true' : 'false'} /></td>
                    <td><Actions onEdit={() => openEdit('therapist_profile', t)} onDelete={() => del('/admin/therapists', t.id, t.full_name || 'Therapist', () => sec('/admin/therapists', setTherapists, setThrTotal, thrPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={thrPage} set={setThrPage} total={thrTotal} />
            </div>
          )}

          {/* ═══════════════════ VOLUNTEERS ════════════════════════ */}
          {/* FIX: was a floating JSX expression outside return() — now properly inside */}
          {tab === 'volunteers' && (
            <div>
              <SectionHeader title="🤝 Volunteer Applications" count={volTotal} sub="Applications submitted via the volunteer form">
                <input className="inp" value={volSearch}
                  onChange={e => setVolSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && secVol()}
                  placeholder="Search name, email, role…" style={{ width: 200 }}
                />
                <select className="inp" value={volStatus} onChange={e => { setVolStatus(e.target.value); setVolPage(1) }}>
                  <option value="">All statuses</option>
                  {['new','reviewing','approved','rejected','waitlisted'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-ghost" onClick={secVol}>🔄</button>
              </SectionHeader>
              <TblWrap loading={busy.volunteers} cols={['Applicant', 'Role', 'District', 'Availability', 'Status', 'Applied', 'Actions']}
                rows={volunteers.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '.83rem', color: 'var(--slate)' }}>{v.first_name} {v.last_name}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{v.email}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{v.phone}</div>
                    </td>
                    <td><span style={{ fontSize: '.78rem', background: 'var(--bg)', padding: '.15rem .45rem', borderRadius: 4, fontWeight: 600 }}>{v.role}</span></td>
                    <td style={{ fontSize: '.8rem' }}>{v.district || '—'}</td>
                    <td><div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap' }}>{(v.availability || []).map(a => <span key={a} className="chip" style={{ fontSize: '.65rem' }}>{a}</span>)}</div></td>
                    <td>
                      <select className="inp" value={v.status || 'new'} onChange={e => updateVolStatus(v.id, e.target.value, v.admin_notes)} style={{ padding: '.22rem .45rem', fontSize: '.75rem' }}>
                        {['new','reviewing','approved','rejected','waitlisted'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{fmt(v.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '.35rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setVolDetail(v)}>👁 View</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDelConfirm({ endpoint:'/admin/volunteers', id:v.id, label:`${v.first_name} ${v.last_name}`, refresh:secVol })}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={volPage} set={setVolPage} total={volTotal} />

              {volDetail && (
                <div className="modal-overlay" onClick={() => setVolDetail(null)}>
                  <div className="modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', color: 'var(--slate)' }}>
                        🤝 {volDetail.first_name} {volDetail.last_name} — Application
                      </span>
                      <button className="btn btn-ghost btn-sm" onClick={() => setVolDetail(null)}>✕</button>
                    </div>
                    <div className="modal-body">
                      {[
                        ['Full Name', `${volDetail.first_name} ${volDetail.last_name}`],
                        ['Email', volDetail.email], ['Phone', volDetail.phone],
                        ['District', volDetail.district || '—'], ['Address', volDetail.address || '—'],
                        ['Profession', volDetail.profession || '—'], ['Organisation', volDetail.organisation || '—'],
                        ['Experience', volDetail.experience || '—'], ['Role', volDetail.role],
                        ['Availability', (volDetail.availability || []).join(', ') || '—'],
                        ['Languages', (volDetail.languages || []).join(', ') || '—'],
                        ['Hours/week', volDetail.hours || '—'], ['Reference', volDetail.reference || '—'],
                      ].map(([k, val]) => (
                        <div key={k} style={{ display: 'flex', gap: '1rem', padding: '.35rem 0', borderBottom: '1px solid var(--border)', fontSize: '.83rem' }}>
                          <span style={{ color: 'var(--slate-lt)', fontWeight: 700, minWidth: 130, flexShrink: 0 }}>{k}</span>
                          <span style={{ color: 'var(--slate-md)' }}>{val}</span>
                        </div>
                      ))}
                      {volDetail.skills && (
                        <div style={{ marginTop: '.75rem' }}>
                          <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--slate-lt)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.35rem' }}>Skills</div>
                          <p style={{ fontSize: '.83rem', color: 'var(--slate-md)', lineHeight: 1.6 }}>{volDetail.skills}</p>
                        </div>
                      )}
                      {volDetail.motivation && (
                        <div style={{ marginTop: '.75rem' }}>
                          <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--slate-lt)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.35rem' }}>Motivation</div>
                          <p style={{ fontSize: '.83rem', color: 'var(--slate-md)', lineHeight: 1.6 }}>{volDetail.motivation}</p>
                        </div>
                      )}
                      <div style={{ marginTop: '.75rem' }}>
                        <div style={{ fontSize: '.68rem', fontWeight: 800, color: 'var(--slate-lt)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.35rem' }}>Admin Notes</div>
                        <textarea className="inp" rows={3} defaultValue={volDetail.admin_notes || ''} placeholder="Add internal notes…"
                          style={{ width: '100%', resize: 'vertical', fontFamily: 'var(--font-body)', fontSize: '.82rem' }} id="vol-admin-notes" />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-ghost" onClick={() => setVolDetail(null)}>Close</button>
                      <button className="btn btn-primary" onClick={() => {
                        const notes = document.getElementById('vol-admin-notes')?.value || ''
                        updateVolStatus(volDetail.id, volDetail.status, notes)
                        setVolDetail(null)
                      }}>💾 Save Notes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════ GALLERY SUBMISSIONS ═══════════════ */}
          {/* FIX: was a floating JSX expression outside return() — now properly inside */}
          {tab === 'gallery_submissions' && (
            <div>
              <SectionHeader title="📸 Photo Submissions" count={galSubTotal} sub="User-submitted photos from the gallery page">
                <select className="inp" value={galSubStatus} onChange={e => { setGalSubStatus(e.target.value); setGalSubPage(1) }}>
                  <option value="">All statuses</option>
                  {['pending','approved','rejected','added_to_gallery'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-ghost" onClick={secGalSub}>🔄</button>
              </SectionHeader>
              <TblWrap loading={busy.gallery_submissions} cols={['Preview', 'Submitter', 'Message', 'Size', 'Status', 'Date', 'Actions']}
                rows={galSubs.map(g => (
                  <tr key={g.id}>
                    <td>
                      <div style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', background: 'var(--bg)', flexShrink: 0 }}>
                        {g.file_url
                          ? <img src={g.file_url} alt={g.file_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🖼️</div>
                        }
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: '.83rem', color: 'var(--slate)' }}>{g.name}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{g.email}</div>
                    </td>
                    <td style={{ maxWidth: 160, fontSize: '.78rem', color: 'var(--slate-md)' }}>
                      {g.message?.slice(0, 60) || <span style={{ color: 'var(--slate-lt)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: '.78rem', color: 'var(--slate-lt)' }}>
                      {g.file_size ? `${(g.file_size/1024/1024).toFixed(1)} MB` : '—'}
                    </td>
                    <td>
                      <select className="inp" value={g.status || 'pending'} onChange={e => updateGalSubStatus(g.id, e.target.value)} style={{ padding: '.22rem .45rem', fontSize: '.75rem' }}>
                        {['pending','approved','rejected','added_to_gallery'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{fmt(g.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                        {g.file_url && (
                          <a href={g.file_url} target="_blank" rel="noreferrer">
                            <button className="btn btn-ghost btn-sm">👁 View</button>
                          </a>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => downloadGalSub(g.id, g.file_name)}>⬇ DL</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDelConfirm({ endpoint:'/admin/gallery-submissions', id:g.id, label:g.file_name, refresh:secGalSub })}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={galSubPage} set={setGalSubPage} total={galSubTotal} />
            </div>
          )}

          {/* ═══ PRODUCTS ═══ */}
          {tab === 'products' && (
            <div>
              <SectionHeader title="🛍️ Products" count={prodTotal} onNew={() => openCreate('product', { is_active: true, is_digital: false, is_featured: false, stock_quantity: 0 })} />
              <TblWrap loading={busy.products} cols={['Product', 'Price', 'Sale', 'Stock', 'Active', 'Actions']}
                rows={products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{p.name}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{p.sku || p.slug}</div>
                    </td>
                    <td>NPR {Number(p.price || 0).toLocaleString()}</td>
                    <td style={{ color: 'var(--green)' }}>{p.sale_price ? `NPR ${Number(p.sale_price).toLocaleString()}` : '—'}</td>
                    <td>{p.is_digital ? '∞' : (p.stock_quantity || 0)}</td>
                    <td><Badge s={p.is_active ? 'active' : 'paused'} /></td>
                    <td><Actions onEdit={() => openEdit('product', p)} onDelete={() => del('/admin/products', p.id, p.name, () => sec('/admin/products', setProducts, setProdTotal, prodPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={prodPage} set={setProdPage} total={prodTotal} />
            </div>
          )}

          {/* ═══ COURSES ═══ */}
          {tab === 'courses' && (
            <div>
              <SectionHeader title="🎓 Courses" count={courseTotal} sub="Online learning courses" onNew={() => openCreate('course', { is_free: true, is_published: false, level: 'Beginner', lessons_count: 0, emoji: '📚' })} />
              <TblWrap loading={busy.courses} cols={['Course', 'Level', 'Price', 'Lessons', 'Published', 'Actions']}
                rows={courses.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{c.emoji} {c.title}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{c.slug}</div>
                    </td>
                    <td><Badge s={c.level || 'Beginner'} /></td>
                    <td style={{ fontWeight: 700 }}>{c.price_label || (c.is_free ? 'FREE' : `NPR ${Number(c.price || 0).toLocaleString()}`)}</td>
                    <td style={{ textAlign: 'center' }}>{c.lessons_count || 0}</td>
                    <td><Badge s={c.is_published ? 'published' : 'draft'} /></td>
                    <td><Actions onEdit={() => openEdit('course', c)} onDelete={() => del('/admin/courses', c.id, c.title, () => sec('/admin/courses', setCourses, setCourseTotal, coursePage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={coursePage} set={setCoursePage} total={courseTotal} />
            </div>
          )}

          {/* ═══ ASSESSMENTS ═══ */}
          {tab === 'assessments' && (
            <div>
              <SectionHeader title="📋 Assessments" count={assTotal} sub="Psychological screening tools" onNew={() => openCreate('assessment', { is_active: true, is_free: true, type: 'custom' })} />
              <TblWrap loading={busy.assessments} cols={['Title', 'Type', 'Free', 'Active', 'Actions']}
                rows={assessments.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{a.title}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{a.description?.slice(0, 60)}</div>
                    </td>
                    <td><Badge s={a.type || '—'} /></td>
                    <td><Badge s={a.is_free ? 'free' : 'premium'} /></td>
                    <td><Badge s={a.is_active !== false ? 'active' : 'paused'} /></td>
                    <td><Actions onEdit={() => openEdit('assessment', a)} onDelete={() => del('/admin/assessments', a.id, a.title, () => sec('/admin/assessments', setAssess, setAssTotal, assPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={assPage} set={setAssPage} total={assTotal} />
            </div>
          )}

          {/* ═══ COMMUNITY GROUPS ═══ */}
          {tab === 'community' && (
            <div>
              <SectionHeader title="💬 Community Groups" count={comTotal} sub="Peer support groups" onNew={() => openCreate('community_group', { is_active: true, emoji: '💙', tags: [] })} />
              <TblWrap loading={busy.community_groups} cols={['Group', 'Emoji', 'Tags', 'Active', 'Actions']}
                rows={community.map(g => (
                  <tr key={g.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{g.name}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{g.description?.slice(0, 60)}</div>
                    </td>
                    <td style={{ fontSize: '1.2rem' }}>{g.emoji}</td>
                    <td><div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap' }}>{(g.tags || []).map(t => <span key={t} className="chip">{t}</span>)}</div></td>
                    <td><Badge s={g.is_active !== false ? 'active' : 'paused'} /></td>
                    <td><Actions onEdit={() => openEdit('community_group', g)} onDelete={() => del('/admin/community-groups', g.id, g.name, () => sec('/admin/community-groups', setCommunity, setComTotal, comPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={comPage} set={setComPage} total={comTotal} />
            </div>
          )}

          {/* ═══ COMMUNITY ADMIN ═══ */}
          {tab === 'community_admin' && (
            <div>
              <div className="sec-head">
                <div>
                  <h1 className="sec-title">🌐 Community Admin</h1>
                  <p className="sec-sub">Manage support groups, therapy sessions, memberships and reservations</p>
                </div>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  {['groups', 'sessions', 'reservations', 'memberships'].map(t => (
                    <button key={t} className={`btn ${commTab === t ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => {
                        setCommTab(t)
                        if (t === 'groups')      fetchCommGroups()
                        if (t === 'sessions')    fetchCommSessions(commSessionPage)
                        if (t === 'reservations' && selectedSessionId) fetchCommReservations(selectedSessionId)
                        if (t === 'memberships') apiFetch('/admin/group-memberships?limit=100').then(d => setCommMemberships(d.items || []))
                      }}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {commTab === 'groups' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--slate-lt)' }}>{commGroups.length} groups</span>
                    <button className="btn btn-ghost" onClick={fetchCommGroups}>🔄 Refresh</button>
                  </div>
                  <TblWrap cols={['Group', 'Members', 'Tags', 'Status', 'Actions']}
                    rows={commGroups.map(g => (
                      <tr key={g.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <span style={{ fontSize: '1.4rem' }}>{g.emoji}</span>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '.83rem' }}>{g.name}</div>
                              <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{g.description?.slice(0, 50)}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => { fetchCommMemberships(g.id); setCommTab('memberships') }}>
                            👥 {g.member_count || 0} — View
                          </button>
                        </td>
                        <td><div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap' }}>{(g.tags || []).map(t => <span key={t} className="chip">{t}</span>)}</div></td>
                        <td><Badge s={g.is_active !== false ? 'active' : 'paused'} /></td>
                        <td>
                          <div style={{ display: 'flex', gap: '.35rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setCommTab('sessions'); fetchCommSessions() }}>📅 Sessions</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit('community_group', g)}>✏️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  />
                </div>
              )}

              {commTab === 'sessions' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--slate-lt)' }}>{commSessions.length} sessions</span>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button className="btn btn-ghost" onClick={() => fetchCommSessions(commSessionPage)}>🔄 Refresh</button>
                      <button className="btn btn-primary" onClick={() => { setSessionForm({ max_spots: 20, mode: 'Online (Zoom)', price: 0 }); setSessionErr(''); setSessionModal({ data: null }) }}>➕ New Session</button>
                    </div>
                  </div>
                  <TblWrap cols={['Session', 'Group', 'Date & Time', 'Mode', 'Spots', 'Reserved', 'Left', 'Price', 'Actions']}
                    rows={commSessions.map(s => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ fontWeight: 700, fontSize: '.83rem' }}>{s.title}</div>
                          <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>👤 {s.facilitator}</div>
                        </td>
                        <td style={{ fontSize: '.8rem' }}>{s.community_groups?.emoji} {s.community_groups?.name || '—'}</td>
                        <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)', whiteSpace: 'nowrap' }}>{fmtT(s.scheduled_at)}</td>
                        <td><span style={{ fontSize: '.75rem', background: 'var(--bg)', padding: '.15rem .45rem', borderRadius: 4 }}>{s.mode}</span></td>
                        <td style={{ textAlign: 'center', fontWeight: 700 }}>{s.max_spots}</td>
                        <td style={{ textAlign: 'center' }}><span style={{ color: s.reserved_count > 0 ? 'var(--green)' : 'var(--slate-lt)', fontWeight: 700 }}>{s.reserved_count}</span></td>
                        <td style={{ textAlign: 'center' }}><span style={{ fontWeight: 800, color: s.is_full ? '#c0392b' : s.spots_left <= 3 ? '#8a5a1a' : '#1a7a4a' }}>{s.is_full ? 'FULL' : s.spots_left}</span></td>
                        <td style={{ fontSize: '.8rem', fontWeight: 700 }}>{s.price > 0 ? `NPR ${Number(s.price).toLocaleString()}` : <Badge s="free" />}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '.35rem' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => { fetchCommReservations(s.id); setCommTab('reservations') }}>👥 {s.reserved_count}</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => { setSessionForm({ ...s }); setSessionErr(''); setSessionModal({ data: s }) }}>✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => setDelConfirm({ endpoint: '/admin/group-sessions', id: s.id, label: s.title, refresh: () => fetchCommSessions(commSessionPage) })}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  />
                  <Pager page={commSessionPage} set={p => { setCommSessionPage(p); fetchCommSessions(p) }} total={commSessionsTotal} />
                </div>
              )}

              {commTab === 'reservations' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--slate-lt)' }}>{commReservations.length} reservation{commReservations.length !== 1 ? 's' : ''}</span>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                      <button className="btn btn-ghost" onClick={() => apiFetch('/admin/group-reservations?limit=100').then(d => setCommReservations(d.items || []))}>📋 All</button>
                      {selectedSessionId && <button className="btn btn-ghost" onClick={() => fetchCommReservations(selectedSessionId)}>🔄 Refresh</button>}
                    </div>
                  </div>
                  <TblWrap cols={['Name', 'Anonymous', 'Session', 'Date', 'Booked At']}
                    rows={commReservations.map(r => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600, fontSize: '.83rem' }}>{r.display_name || '—'}</td>
                        <td><Badge s={r.is_anonymous ? 'true' : 'false'} /></td>
                        <td style={{ fontSize: '.8rem' }}>{r.group_sessions?.title || '—'}</td>
                        <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{r.group_sessions?.scheduled_at ? fmtT(r.group_sessions.scheduled_at) : '—'}</td>
                        <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{fmt(r.created_at)}</td>
                      </tr>
                    ))}
                  />
                </div>
              )}

              {commTab === 'memberships' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--slate-lt)' }}>{commMemberships.length} membership{commMemberships.length !== 1 ? 's' : ''}</span>
                    <button className="btn btn-ghost" onClick={() => apiFetch('/admin/group-memberships?limit=100').then(d => setCommMemberships(d.items || []))}>🔄 All Members</button>
                  </div>
                  <TblWrap cols={['Name', 'Anonymous', 'Group', 'Joined']}
                    rows={commMemberships.map(m => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600, fontSize: '.83rem' }}>{m.display_name || '—'}</td>
                        <td><Badge s={m.is_anonymous ? 'true' : 'false'} /></td>
                        <td style={{ fontSize: '.8rem' }}>{m.community_groups?.emoji} {m.community_groups?.name || '—'}</td>
                        <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{fmt(m.created_at)}</td>
                      </tr>
                    ))}
                  />
                </div>
              )}

              {sessionModal && (
                <div className="modal-overlay" onClick={() => setSessionModal(null)}>
                  <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--slate)' }}>
                        {sessionModal.data ? '✏️ Edit Session' : '➕ New Group Session'}
                      </span>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSessionModal(null)}>✕</button>
                    </div>
                    <div className="modal-body">
                      <div className="field"><label>Session Title *</label><input style={inpSx} value={sessionForm.title || ''} onChange={e => setSessionForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Mindfulness Circle — Weekly Session" /></div>
                      <div className="field-row">
                        <div className="field">
                          <label>Group *</label>
                          <select style={selSx} value={sessionForm.group_id || ''} onChange={e => setSessionForm(p => ({ ...p, group_id: e.target.value }))}>
                            <option value="">— Select group —</option>
                            {commGroups.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}
                          </select>
                        </div>
                        <div className="field">
                          <label>Mode</label>
                          <select style={selSx} value={sessionForm.mode || 'Online (Zoom)'} onChange={e => setSessionForm(p => ({ ...p, mode: e.target.value }))}>
                            <option>Online (Zoom)</option><option>In-Person, Kathmandu</option><option>Hybrid</option><option>Phone Call</option>
                          </select>
                        </div>
                      </div>
                      <div className="field-row">
                        <div className="field"><label>Date & Time *</label><input style={inpSx} type="datetime-local" value={sessionForm.scheduled_at ? sessionForm.scheduled_at.slice(0, 16) : ''} onChange={e => setSessionForm(p => ({ ...p, scheduled_at: new Date(e.target.value).toISOString() }))} /></div>
                        <div className="field"><label>Facilitator</label><input style={inpSx} value={sessionForm.facilitator || ''} onChange={e => setSessionForm(p => ({ ...p, facilitator: e.target.value }))} placeholder="Ms. Priya Tamang" /></div>
                      </div>
                      <div className="field-row">
                        <div className="field"><label>Max Spots</label><input style={inpSx} type="number" value={sessionForm.max_spots || 20} onChange={e => setSessionForm(p => ({ ...p, max_spots: Number(e.target.value) }))} /></div>
                        <div className="field"><label>Price (NPR) — 0 = Free</label><input style={inpSx} type="number" value={sessionForm.price || 0} onChange={e => setSessionForm(p => ({ ...p, price: Number(e.target.value) }))} /></div>
                      </div>
                      <div className="field"><label>Notes</label><textarea style={{ ...inpSx, resize: 'vertical', lineHeight: 1.6 }} rows={2} value={sessionForm.notes || ''} onChange={e => setSessionForm(p => ({ ...p, notes: e.target.value }))} /></div>
                    </div>
                    {sessionErr && <div style={{ margin: '0 1.5rem .5rem' }}><div className="alert alert-error">{sessionErr}</div></div>}
                    <div className="modal-footer">
                      <button className="btn btn-ghost" onClick={() => setSessionModal(null)}>Cancel</button>
                      <button className="btn btn-primary" onClick={saveSessionModal} disabled={sessionSaving}>{sessionSaving ? 'Saving…' : sessionModal.data ? '💾 Save Changes' : '➕ Create Session'}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ FAQs ═══ */}
          {tab === 'faqs' && (
            <div>
              <SectionHeader title="❓ FAQs" count={faqTotal} onNew={() => openCreate('faq', { is_active: true, sort_order: 0 })} />
              <TblWrap loading={busy.faqs} cols={['Question', 'Category', 'Order', 'Active', 'Actions']}
                rows={faqs.map(fq => (
                  <tr key={fq.id}>
                    <td style={{ maxWidth: 260 }}>
                      <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{fq.question}</div>
                      <div style={{ fontSize: '.7rem', color: 'var(--slate-lt)' }}>{fq.answer?.slice(0, 60)}…</div>
                    </td>
                    <td><span style={{ fontSize: '.75rem', background: 'var(--bg)', padding: '.15rem .45rem', borderRadius: 4 }}>{fq.category || '—'}</span></td>
                    <td style={{ textAlign: 'center' }}>{fq.sort_order || 0}</td>
                    <td><Badge s={fq.is_active !== false ? 'active' : 'paused'} /></td>
                    <td><Actions onEdit={() => openEdit('faq', fq)} onDelete={() => del('/admin/faqs', fq.id, fq.question, () => sec('/admin/faqs', setFaqs, setFaqTotal, faqPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={faqPage} set={setFaqPage} total={faqTotal} />
            </div>
          )}

          {/* ═══ COUPONS ═══ */}
          {tab === 'coupons' && (
            <div>
              <SectionHeader title="🎫 Coupons" count={couTotal} onNew={() => openCreate('coupon', { is_active: true, type: 'percentage', value: 10, min_order_amount: 0 })} />
              <TblWrap loading={busy.coupons} cols={['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Active', 'Actions']}
                rows={coupons.map(c => (
                  <tr key={c.id}>
                    <td><code style={{ fontSize: '.82rem', fontWeight: 700, background: '#f0f4f8', padding: '.15rem .45rem', borderRadius: 4, color: 'var(--teal-dk)' }}>{c.code}</code></td>
                    <td><Badge s={c.type || 'percentage'} /></td>
                    <td style={{ fontWeight: 700 }}>{c.type === 'percentage' ? `${c.value}%` : `NPR ${c.value}`}</td>
                    <td>{c.min_order_amount ? `NPR ${c.min_order_amount}` : '—'}</td>
                    <td>{c.used_count || 0}/{c.max_uses || '∞'}</td>
                    <td><Badge s={c.is_active ? 'active' : 'paused'} /></td>
                    <td><Actions onEdit={() => openEdit('coupon', c)} onDelete={() => del('/admin/coupons', c.id, c.code, () => sec('/admin/coupons', setCoupons, setCouTotal, couPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={couPage} set={setCouPage} total={couTotal} />
            </div>
          )}

          {/* ═══ CONTACTS ═══ */}
          {tab === 'contacts' && (
            <div>
              <SectionHeader title="📩 Contact Messages" count={ctcTotal} />
              <TblWrap loading={busy.contacts} cols={['Name', 'Email', 'Subject', 'Type', 'Status', 'Date', 'Update']}
                rows={contacts.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, fontSize: '.82rem' }}>{c.name}</td>
                    <td style={{ fontSize: '.78rem', color: 'var(--slate-lt)' }}>{c.email}</td>
                    <td style={{ maxWidth: 160, fontSize: '.8rem' }}>{c.subject || (c.message?.slice(0, 40) + '…')}</td>
                    <td><Badge s={c.type || 'general'} /></td>
                    <td><Badge s={c.status || 'new'} /></td>
                    <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{fmt(c.created_at)}</td>
                    <td>
                      <select className="inp" value={c.status || 'new'} onChange={e => doContactStatus(c.id, e.target.value)} style={{ padding: '.2rem .45rem', fontSize: '.75rem' }}>
                        {['new', 'in_progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={ctcPage} set={setCtcPage} total={ctcTotal} />
            </div>
          )}

          {/* ═══ SUBSCRIPTIONS ═══ */}
          {tab === 'subscriptions' && (
            <div>
              <SectionHeader title="♻️ Subscriptions" count={subTotal} />
              <TblWrap loading={busy.subscriptions} cols={['Client', 'Plan', 'Amount', 'Status', 'Started', 'Expires', 'Update']}
                rows={subs.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, fontSize: '.82rem' }}>{s.client_name || s.profiles?.full_name || s.client_id || '—'}</td>
                    <td>{s.plan_name}</td>
                    <td style={{ fontWeight: 600 }}>{s.amount ? `NPR ${Number(s.amount).toLocaleString()}` : '—'}</td>
                    <td><Badge s={s.status || 'active'} /></td>
                    <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{fmt(s.started_at)}</td>
                    <td style={{ fontSize: '.77rem', color: 'var(--slate-lt)' }}>{s.expires_at ? fmt(s.expires_at) : '—'}</td>
                    <td>
                      <select className="inp" value={s.status || 'active'} onChange={e => doSubStatus(s.id, e.target.value)} style={{ padding: '.2rem .45rem', fontSize: '.75rem' }}>
                        {['active', 'cancelled', 'expired', 'paused'].map(x => <option key={x} value={x}>{x}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={subPage} set={setSubPage} total={subTotal} />
            </div>
          )}

          {/* ═══ SITE SETTINGS ═══ */}
          {tab === 'settings' && (
            <div>
              <SectionHeader title="⚙️ Site Settings" />
              <div style={{ background: 'var(--white)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
                {busy.settings
                  ? <p style={{ padding: '2rem', color: 'var(--slate-lt)', fontSize: '.85rem' }}>Loading…</p>
                  : settings.length === 0
                    ? <p style={{ padding: '2rem', color: 'var(--slate-lt)', fontSize: '.85rem' }}>No settings found.</p>
                    : settings.map((s, i) => (
                        <div key={s.key || i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.7rem 1rem', borderBottom: i < settings.length - 1 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap' }}>
                          <code style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--teal-dk)', background: '#f0f4f8', padding: '.15rem .45rem', borderRadius: 4, minWidth: 180, flexShrink: 0 }}>{s.key}</code>
                          <span style={{ fontSize: '.82rem', color: 'var(--slate-md)', flex: 1, wordBreak: 'break-all' }}>
                            {typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value ?? '')}
                          </span>
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit('setting', { key: s.key, value: typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value ?? '') })}>✏️ Edit</button>
                        </div>
                      ))
                }
              </div>
            </div>
          )}

        </div>{/* /adm-content */}
      </div>{/* /adm-body */}

      {modal && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal" style={{ maxWidth: 660 }} onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--slate)' }}>
          {modal.data ? '✏️ Edit' : '➕ New'} {({
            post: 'Blog Post', news_article: 'News Article', resource: 'Resource',
            gallery_item: 'Gallery Item', research_paper: 'Research Paper',
            psych_video: 'Psych Video', psych_analysis: 'Psych Analysis',
            psych_concept: 'Psych Concept', therapist_profile: 'Therapist Profile',
            product: 'Product', course: 'Course', assessment: 'Assessment',
            community_group: 'Community Group', faq: 'FAQ', coupon: 'Coupon',
            setting: 'Site Setting',
          })[modal.type] || modal.type}
        </span>
        <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
      </div>
      <div className="modal-body">{renderModalFields()}</div>
      {saveErr && (
        <div style={{ margin: '0 1.5rem .5rem' }}>
          <div className="alert alert-error">{saveErr}</div>
        </div>
      )}
      <div className="modal-footer">
        <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
        <button className="btn btn-primary" onClick={saveModal} disabled={saving}>
          {saving ? 'Saving…' : modal.data ? '💾 Save Changes' : '➕ Create'}
        </button>
      </div>
    </div>
  </div>
)}
      {delConfirm && (
        <Confirm
          msg={`Delete "${delConfirm.label}"? This cannot be undone.`}
          onConfirm={doDelete}
          onCancel={() => setDelConfirm(null)}
        />
      )}

    </div>
  )
}