// src/pages/AdminDashboardPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'
import { admin as adminApi } from '../services/api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const CSS = `
  .adm-layout { min-height:100vh; background:#f0f4f8; display:flex; flex-direction:column; }
  .adm-topbar { background:linear-gradient(135deg,#1a3a4a 0%,#2e6080 100%); padding:0.75rem clamp(1rem,3vw,1.75rem); display:flex; justify-content:space-between; align-items:center; position:sticky; top:0; z-index:100; box-shadow:0 2px 12px rgba(0,0,0,0.18); min-height:56px; }
  .adm-body { display:flex; flex:1; min-height:0; }
  .adm-sidebar { width:200px; flex-shrink:0; background:#ffffff; border-right:1px solid #e2e8f0; position:sticky; top:56px; height:calc(100vh - 56px); overflow-y:auto; padding:0.75rem 0; }
  .adm-sidebar-btn { display:flex; align-items:center; gap:0.65rem; width:100%; padding:0.65rem 1.25rem; border:none; background:transparent; font-family:var(--font-body); font-size:0.85rem; cursor:pointer; text-align:left; transition:all 0.14s; position:relative; color:#2e6080; }
  .adm-sidebar-btn:hover { background:#f0f4f8; }
  .adm-sidebar-btn.active { background:#e8f8f0; color:#1a7a4a; font-weight:700; }
  .adm-sidebar-btn.active::before { content:''; position:absolute; left:0; top:15%; bottom:15%; width:3px; background:#1a7a4a; border-radius:0 2px 2px 0; }
  .adm-sidebar-btn.highlight { color:#007BA8; background:#e0f7ff; font-weight:700; border-left:3px solid #00BFFF; }
  .adm-sidebar-btn.highlight:hover { background:#c8effc; }
  .adm-content { flex:1; padding:clamp(1rem,3vw,1.75rem); overflow-x:hidden; min-width:0; }
  .adm-tabbar { display:none; background:#ffffff; border-bottom:1px solid #e2e8f0; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
  .adm-tabbar::-webkit-scrollbar { display:none; }
  .adm-tabbar-btn { flex-shrink:0; padding:0.75rem 1rem; border:none; background:transparent; font-family:var(--font-body); font-size:0.82rem; font-weight:500; color:#7a9aaa; cursor:pointer; white-space:nowrap; border-bottom:2.5px solid transparent; transition:all 0.2s; }
  .adm-tabbar-btn.active { color:#1a7a4a; font-weight:700; border-bottom-color:#1a7a4a; }
  .adm-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
  .adm-table-wrap { background:#fff; border-radius:12px; border:1px solid #e2e8f0; overflow:auto; }
  table.adm-table { width:100%; border-collapse:collapse; min-width:520px; }
  table.adm-table th { padding:0.6rem 1rem; text-align:left; font-size:0.7rem; font-weight:800; color:#7a9aaa; text-transform:uppercase; letter-spacing:0.08em; border-bottom:1px solid #e2e8f0; background:#f0f4f8; white-space:nowrap; }
  table.adm-table td { padding:0.65rem 1rem; font-size:0.83rem; color:#2e6080; border-bottom:1px solid #e2e8f0; vertical-align:middle; }
  table.adm-table tr:hover td { background:#f8fafc; }
  .adm-pager { display:flex; justify-content:center; align-items:center; gap:0.5rem; padding:0.85rem; border-top:1px solid #e2e8f0; }
  .adm-pager-btn { padding:0.3rem 0.75rem; border:1px solid #e2e8f0; border-radius:7px; background:#fff; cursor:pointer; font-size:0.8rem; color:#2e6080; font-family:var(--font-body); }
  .adm-pager-btn:disabled { background:#f0f4f8; cursor:not-allowed; color:#aaa; }
  .adm-filters { display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center; margin-bottom:1.25rem; }
  .adm-select { padding:0.42rem 0.8rem; border:1.5px solid #e2e8f0; border-radius:8px; font-size:0.82rem; color:#2e6080; background:#fff; cursor:pointer; outline:none; font-family:var(--font-body); }
  .adm-search { padding:0.42rem 0.85rem; border:1.5px solid #e2e8f0; border-radius:8px; font-size:0.83rem; outline:none; color:#1a3a4a; background:#fff; font-family:var(--font-body); }
  .adm-search:focus { border-color:#007BA8; }
  .adm-staff-cta { background:linear-gradient(135deg,#e0f7ff 0%,#f0fbff 100%); border:1.5px solid #b0d4e8; border-radius:16px; padding:1.4rem 1.6rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
  .adm-staff-cta-btn { padding:0.65rem 1.4rem; background:linear-gradient(135deg,#007BA8 0%,#00BFFF 100%); color:white; border:none; border-radius:10px; font-family:var(--font-body); font-weight:800; font-size:0.88rem; cursor:pointer; white-space:nowrap; box-shadow:0 4px 14px rgba(0,191,255,0.3); transition:all 0.2s; }
  .adm-staff-cta-btn:hover { opacity:0.88; transform:translateY(-1px); }
  .adm-notify-card { background:#fff; border-radius:14px; border:1px solid #e2e8f0; padding:1.75rem; margin-bottom:1.5rem; }
  .adm-pay-cat-tabs { display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1.25rem; }
  .adm-pay-cat-btn { padding:0.42rem 1rem; border:1.5px solid #e2e8f0; border-radius:100px; font-size:0.8rem; font-weight:600; cursor:pointer; transition:all 0.18s; font-family:var(--font-body); background:#fff; color:#2e6080; }
  .adm-pay-cat-btn.active { border-color:#007BA8; background:#e0f7ff; color:#007BA8; font-weight:700; }
  .adm-pay-summary { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:0.85rem; margin-bottom:1.5rem; }
  @media(max-width:900px){ .adm-stats{grid-template-columns:repeat(2,1fr);} .adm-sidebar{width:180px;} }
  @media(max-width:680px){ .adm-sidebar{display:none;} .adm-tabbar{display:flex;} .adm-content{padding:1rem;} .adm-stats{grid-template-columns:repeat(2,1fr);gap:0.75rem;} .adm-topbar{padding:0.6rem 1rem;} }
  @media(max-width:420px){ .adm-stats{grid-template-columns:1fr 1fr;gap:0.6rem;} .adm-content{padding:0.75rem;} }
`
function injectCSS() {
  if (document.getElementById('admin-dash-css')) return
  const s = document.createElement('style')
  s.id = 'admin-dash-css'; s.textContent = CSS
  document.head.appendChild(s)
}

const STATUS = {
  pending:{bg:'#fff5e6',c:'#8a5a1a'}, confirmed:{bg:'#e8f8f0',c:'#1a7a4a'},
  completed:{bg:'#e0f7ff',c:'#007BA8'}, cancelled:{bg:'#fff0f0',c:'#c0392b'},
  refunded:{bg:'#f0e8ff',c:'#5a1a8a'}, shipped:{bg:'#e8f8f0',c:'#1a7a4a'},
  delivered:{bg:'#e0f7ff',c:'#007BA8'}, processing:{bg:'#fff9e6',c:'#8a6a1a'},
  active:{bg:'#e8f8f0',c:'#1a7a4a'}, paused:{bg:'#fff5e6',c:'#8a5a1a'},
  client:{bg:'#e8f8f0',c:'#1a7a4a'}, therapist:{bg:'#e0f7ff',c:'#007BA8'},
  admin:{bg:'#f0e8ff',c:'#5a1a8a'}, staff:{bg:'#fff5e6',c:'#8a5a1a'},
  no_show:{bg:'#fff0f0',c:'#c0392b'},
}
function Badge({ s }) {
  const x = STATUS[s] || { bg:'#eee', c:'#444' }
  return <span style={{ padding:'0.22rem 0.65rem', borderRadius:100, fontSize:'0.7rem', fontWeight:700, background:x.bg, color:x.c, textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{s}</span>
}
function StatCard({ icon, val, label, color, sub, onClick }) {
  return (
    <div onClick={onClick} style={{ background:color, borderRadius:14, padding:'clamp(1rem,3vw,1.4rem)', border:'1px solid #e2e8f0', cursor:onClick?'pointer':'default', transition:'all 0.18s' }}
      onMouseEnter={e => { if(onClick){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.08)'}}}
      onMouseLeave={e => { e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none' }}>
      <div style={{ fontSize:'1.6rem', marginBottom:'0.4rem' }}>{icon}</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.4rem,3vw,1.9rem)', color:'#1a3a4a', fontWeight:700, lineHeight:1 }}>
        {val ?? <span style={{ opacity:0.3, fontSize:'1.2rem' }}>—</span>}
      </div>
      {sub && <div style={{ fontSize:'0.7rem', color:'#1a7a4a', fontWeight:700, marginTop:'0.2rem' }}>{sub}</div>}
      <div style={{ fontSize:'0.75rem', color:'#7a9aaa', fontWeight:600, marginTop:'0.25rem' }}>{label}</div>
    </div>
  )
}
function Pager({ page, set, total, limit=20 }) {
  const tp = Math.max(1, Math.ceil(total/limit))
  if (tp <= 1) return null
  return (
    <div className="adm-pager">
      <button className="adm-pager-btn" onClick={() => set(p => Math.max(1,p-1))} disabled={page===1}>← Prev</button>
      <span style={{ fontSize:'0.8rem', color:'#7a9aaa', padding:'0 0.5rem' }}>Page {page}/{tp} · {total} total</span>
      <button className="adm-pager-btn" onClick={() => set(p => Math.min(tp,p+1))} disabled={page===tp}>Next →</button>
    </div>
  )
}

const TABS = [
  { id:'dashboard',     label:'Dashboard',     icon:'📊' },
  { id:'users',         label:'Users',         icon:'👥' },
  { id:'appointments',  label:'Appointments',  icon:'📅' },
  { id:'orders',        label:'Orders',        icon:'📦' },
  { id:'payments',      label:'Payments',      icon:'💳' },
  { id:'notifications', label:'Notify Clients',icon:'🔔' },
]
const LIMIT = 20

// Payment category config — maps the "method" field to a display category
const PAY_CATEGORIES = [
  { id:'all',         label:'All Payments',      icon:'💳', color:'#007BA8', faint:'#e0f7ff' },
  { id:'appointment', label:'Appointment Fees',  icon:'📅', color:'#1a7a4a', faint:'#e8f8f0' },
  { id:'order',       label:'Product Orders',    icon:'📦', color:'#8a5a1a', faint:'#fff5e6' },
  { id:'cash',        label:'Cash / COD',        icon:'💵', color:'#5a6a7a', faint:'#f0f4f8' },
  { id:'esewa',       label:'eSewa',             icon:'🟢', color:'#22c55e', faint:'#d1fae5' },
  { id:'khalti',      label:'Khalti',            icon:'🟣', color:'#a855f7', faint:'#f0e6ff' },
  { id:'fonepay',     label:'QR / Fonepay',      icon:'📷', color:'#f97316', faint:'#fff7ed' },
]

async function sendNotification({ userId, title, message, type, token }) {
  const res = await fetch(`${API_BASE}/admin/notifications`, {
    method: 'POST',
    headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
    body: JSON.stringify({ userId, title, message, type }),
  })
  if (!res.ok) {
    const d = await res.json()
    throw new Error(d.message || 'Failed to send notification')
  }
  return res.json()
}

export default function AdminDashboard() {
  useEffect(() => { injectCSS() }, [])
  const { navigate }                           = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [tab,    setTab]    = useState('dashboard')
  const [stats,  setStats]  = useState(null)
  const [recent, setRecent] = useState([])
  const [users,  setUsers]  = useState([])
  const [appts,  setAppts]  = useState([])
  const [orders, setOrders] = useState([])
  const [pays,   setPays]   = useState([])
  const [uPage,setUPage]=useState(1); const [uTotal,setUTotal]=useState(0)
  const [aPage,setAPage]=useState(1); const [aTotal,setATotal]=useState(0)
  const [oPage,setOPage]=useState(1); const [oTotal,setOTotal]=useState(0)
  const [pPage,setPPage]=useState(1); const [pTotal,setPTotal]=useState(0)
  const [uSearch,setUSearch]=useState('')
  const [uRole,  setURole]  =useState('')
  const [aStatus,setAStatus]=useState('')
  const [oStatus,setOStatus]=useState('')
  const [busy, setBusy] = useState({})
  const setB = (k,v) => setBusy(b => ({ ...b, [k]:v }))

  // ── Payment category filter state ───────────────────────────
  const [payCategory, setPayCategory] = useState('all')
  const [pStatus,     setPStatus]     = useState('')

  // ── Notify tab state ────────────────────────────────────────
  const [notifClients,   setNotifClients]   = useState([])
  const [notifTarget,    setNotifTarget]    = useState('')
  const [notifTitle,     setNotifTitle]     = useState('')
  const [notifMessage,   setNotifMessage]   = useState('')
  const [notifType,      setNotifType]      = useState('system')
  const [notifSending,   setNotifSending]   = useState(false)
  const [notifResult,    setNotifResult]    = useState(null)
  const [sentHistory,    setSentHistory]    = useState([])

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/staff'); return }
    if (!['admin','staff'].includes(user.role)) { navigate('/portal'); return }
    fetchDashboard()
  }, [user, authLoading])

  useEffect(() => {
    if (authLoading || !user || !['admin','staff'].includes(user.role)) return
    if (tab==='users')         fetchUsers()
    if (tab==='appointments')  fetchAppts()
    if (tab==='orders')        fetchOrders()
    if (tab==='payments')      fetchPays()
    if (tab==='notifications') fetchNotifClients()
  }, [tab, uPage, aPage, oPage, pPage])

  // Re-fetch payments when category or status filter changes
  useEffect(() => {
    if (tab === 'payments') { setPPage(1); fetchPays() }
  }, [payCategory, pStatus])

  const fetchDashboard = useCallback(async () => {
    setB('dash',true)
    try { const d = await adminApi.dashboard(); setStats(d.stats||{}); setRecent(d.recentPayments||[]) }
    catch(e){ console.error(e.message) } finally { setB('dash',false) }
  }, [])

  const fetchUsers = useCallback(async () => {
    setB('users',true)
    try { const d = await adminApi.users({ page:uPage, limit:LIMIT, q:uSearch||undefined, role:uRole||undefined }); setUsers(d.users||[]); setUTotal(d.pagination?.total||0) }
    catch(e){ console.error(e.message) } finally { setB('users',false) }
  }, [uPage,uSearch,uRole])

  const fetchAppts = useCallback(async () => {
    setB('appts',true)
    try { const d = await adminApi.appointments({ page:aPage, limit:LIMIT, status:aStatus||undefined }); setAppts(d.appointments||[]); setATotal(d.pagination?.total||0) }
    catch(e){ console.error(e.message) } finally { setB('appts',false) }
  }, [aPage,aStatus])

  const fetchOrders = useCallback(async () => {
    setB('orders',true)
    try { const d = await adminApi.orders({ page:oPage, limit:LIMIT, status:oStatus||undefined }); setOrders(d.orders||[]); setOTotal(d.pagination?.total||0) }
    catch(e){ console.error(e.message) } finally { setB('orders',false) }
  }, [oPage,oStatus])

  const fetchPays = useCallback(async () => {
    setB('pays',true)
    try {
      // Build query params — filter by method (=category) if not 'all'
      const params = { page:pPage, limit:LIMIT }
      if (payCategory !== 'all') params.method = payCategory
      if (pStatus) params.status = pStatus
      const d = await adminApi.payments(params)
      setPays(d.payments||[])
      setPTotal(d.pagination?.total||0)
    }
    catch(e){ console.error(e.message) } finally { setB('pays',false) }
  }, [pPage, payCategory, pStatus])

  const fetchNotifClients = useCallback(async () => {
    setB('notifClients',true)
    try {
      const d = await adminApi.users({ limit:200, role:'client' })
      setNotifClients(d.users || [])
    } catch(e){ console.error(e.message) } finally { setB('notifClients',false) }
  }, [])

  async function handleSendNotification(e) {
    e.preventDefault()
    if (!notifTitle.trim()) return
    setNotifSending(true); setNotifResult(null)
    const token = localStorage.getItem('accessToken')
    try {
      if (notifTarget === 'all') {
        let successCount = 0
        for (const client of notifClients) {
          try {
            await sendNotification({ userId:client.id, title:notifTitle, message:notifMessage, type:notifType, token })
            successCount++
          } catch {}
        }
        setNotifResult({ ok:true, msg:`✓ Sent to ${successCount} clients.` })
        setSentHistory(h => [{ title:notifTitle, target:'All clients', type:notifType, time:new Date() }, ...h].slice(0,5))
      } else {
        await sendNotification({ userId:notifTarget, title:notifTitle, message:notifMessage, type:notifType, token })
        const client = notifClients.find(c => c.id === notifTarget)
        setNotifResult({ ok:true, msg:`✓ Notification sent to ${client?.full_name || 'client'}.` })
        setSentHistory(h => [{ title:notifTitle, target:client?.full_name || 'Client', type:notifType, time:new Date() }, ...h].slice(0,5))
      }
      setNotifTitle(''); setNotifMessage(''); setNotifTarget('')
    } catch (err) {
      setNotifResult({ ok:false, msg:`✗ ${err.message}` })
    } finally { setNotifSending(false) }
  }

  async function doApptStatus(id,status){ try{ await adminApi.updateAppointmentStatus(id,status); fetchAppts() }catch{} }
  async function doOrderStatus(id,status){ try{ await adminApi.updateOrderStatus(id,status); fetchOrders() }catch{} }
  async function doToggle(id){ try{ await adminApi.toggleActive(id); fetchUsers() }catch{} }
  async function doRole(id,role){ try{ await adminApi.updateRole(id,role); fetchUsers() }catch{} }
  async function handleLogout(){ await logout(); navigate('/staff') }

  const fmt  = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
  const fmtT = d => new Date(d).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})

  // ── Payment summary stats computed from current page data ───
  function paymentSummary() {
    const filtered = pays
    const total    = filtered.reduce((s,p) => s + Number(p.amount||0), 0)
    const completed = filtered.filter(p => p.status === 'completed').length
    const pending   = filtered.filter(p => p.status === 'pending').length
    return { total, completed, pending, count: filtered.length }
  }

  function TableShell({ cols, rows, loading }) {
    return (
      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {loading
              ? <tr><td colSpan={cols.length} style={{ textAlign:'center',padding:'2rem',color:'#7a9aaa' }}>Loading…</td></tr>
              : rows.length===0
                ? <tr><td colSpan={cols.length} style={{ textAlign:'center',padding:'2rem',color:'#7a9aaa' }}>No records found.</td></tr>
                : rows
            }
          </tbody>
        </table>
      </div>
    )
  }

  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4f8' }}>
      <div style={{ textAlign:'center', color:'#7a9aaa' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🌿</div>
        <p style={{ fontFamily:'var(--font-body)' }}>Verifying your session…</p>
      </div>
    </div>
  )

  const inputSx = { width:'100%', padding:'0.7rem 1rem', border:'1.5px solid #e2e8f0', borderRadius:10, fontSize:'0.88rem', color:'#1a3a4a', outline:'none', boxSizing:'border-box', fontFamily:'var(--font-body)' }

  // Active payment category config
  const activeCat = PAY_CATEGORIES.find(c => c.id === payCategory) || PAY_CATEGORIES[0]
  const pSummary  = paymentSummary()

  return (
    <div className="adm-layout">

      {/* Top bar */}
      <div className="adm-topbar">
        <div style={{ display:'flex', alignItems:'center', gap:'0.85rem' }}>
          <img src="/header.png" alt="" style={{ height:30, objectFit:'contain' }} onError={e => e.target.style.display='none'}/>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color:'white', fontWeight:600, lineHeight:1.1 }}>Puja Samargi</div>
            <div style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.55)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Admin</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800, fontSize:'0.82rem' }}>
            {(user?.fullName||'A').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <button onClick={handleLogout} style={{ padding:'0.35rem 0.75rem', borderRadius:7, border:'1.5px solid rgba(255,255,255,0.28)', background:'rgba(255,255,255,0.1)', color:'white', fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
            Log Out
          </button>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="adm-tabbar">
        {TABS.map(t => (
          <button key={t.id} className={`adm-tabbar-btn${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
        <button className="adm-tabbar-btn" onClick={() => navigate('/register-staffs')}>➕ Add Staff</button>
      </div>

      <div className="adm-body">

        {/* Desktop sidebar */}
        <div className="adm-sidebar">
          {TABS.map(t => (
            <button key={t.id} className={`adm-sidebar-btn${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
              <span style={{ width:18, textAlign:'center' }}>{t.icon}</span>{t.label}
            </button>
          ))}
          <div style={{ height:1, background:'#e2e8f0', margin:'0.75rem 1.25rem' }}/>
          <button className="adm-sidebar-btn highlight" onClick={() => navigate('/register-staffs')}>
            <span style={{ width:18, textAlign:'center' }}>➕</span>Register Staff
          </button>
          <div style={{ height:1, background:'#e2e8f0', margin:'0.75rem 1.25rem' }}/>
        </div>

        <div className="adm-content">

          {/* ════ DASHBOARD ════ */}
          {tab==='dashboard' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <div>
                  <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.25rem,3vw,1.5rem)', color:'#1a3a4a', margin:0 }}>Overview</h1>
                  <p style={{ fontSize:'0.82rem', color:'#7a9aaa', margin:'0.2rem 0 0', fontFamily:'var(--font-body)' }}>Welcome back, {user?.fullName?.split(' ')[0]}.</p>
                </div>
                <button onClick={fetchDashboard} style={{ padding:'0.42rem 0.9rem', border:'1.5px solid #e2e8f0', borderRadius:8, background:'#fff', color:'#2e6080', fontSize:'0.8rem', cursor:'pointer' }}>🔄 Refresh</button>
              </div>

              <div className="adm-staff-cta">
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'#1a3a4a', fontWeight:700, marginBottom:'0.25rem' }}>👥 Register a New Staff Member</div>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'#7a9aaa' }}>Add admins, staff, or therapists to the system securely.</div>
                </div>
                <button className="adm-staff-cta-btn" onClick={() => navigate('/register-staffs')}>➕ Register Staff</button>
              </div>

              <div className="adm-stats">
                <StatCard icon="👥" val={stats?.totalUsers}        label="Total Clients"   color="#e0f7ff" onClick={() => setTab('users')}/>
                <StatCard icon="📅" val={stats?.totalAppointments} label="Appointments"    color="#e8f8f0" sub={stats?.pendingAppointments?`${stats.pendingAppointments} pending`:''} onClick={() => setTab('appointments')}/>
                <StatCard icon="📦" val={stats?.totalOrders}       label="Total Orders"    color="#fff5e6" onClick={() => setTab('orders')}/>
                <StatCard icon="💰" val={stats?.revenue30d!=null?`NPR ${Number(stats.revenue30d).toLocaleString()}`:undefined} label="Revenue (30d)" color="#f0e8ff" onClick={() => setTab('payments')}/>
              </div>

              <div style={{ background:'#fff', borderRadius:14, border:'1px solid #e2e8f0', padding:'1.4rem', marginBottom:'1.5rem' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'#1a3a4a', marginBottom:'1rem' }}>Recent Payments</div>
                {busy.dash ? <p style={{ color:'#7a9aaa', fontSize:'0.82rem' }}>Loading…</p>
                  : recent.length===0 ? <p style={{ color:'#7a9aaa', fontSize:'0.82rem' }}>No payments yet.</p>
                  : recent.map((p,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.65rem 0', borderBottom:i<recent.length-1?'1px solid #e2e8f0':'none' }}>
                      <div>
                        <div style={{ fontSize:'0.85rem', color:'#1a3a4a', fontWeight:600 }}>NPR {Number(p.amount).toLocaleString()}</div>
                        <div style={{ fontSize:'0.72rem', color:'#7a9aaa' }}>{p.method} · {fmt(p.created_at)}</div>
                      </div>
                      <Badge s={p.status}/>
                    </div>
                  ))
                }
              </div>

              <div style={{ display:'flex', gap:'0.65rem', flexWrap:'wrap' }}>
                {TABS.slice(1).map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{ padding:'0.55rem 1.1rem', borderRadius:9, border:'1.5px solid #e2e8f0', background:'#fff', color:'#2e6080', fontFamily:'inherit', fontSize:'0.83rem', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', transition:'all 0.14s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='#1a7a4a'; e.currentTarget.style.color='#1a7a4a' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.color='#2e6080' }}>
                    {t.icon} {t.label} →
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ════ USERS ════ */}
          {tab==='users' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.2rem,3vw,1.4rem)', color:'#1a3a4a', margin:0 }}>
                  Users <span style={{ fontSize:'0.9rem', color:'#7a9aaa', fontWeight:400 }}>({uTotal})</span>
                </h1>
                <div className="adm-filters" style={{ margin:0 }}>
                  <input className="adm-search" value={uSearch}
                    onChange={e => setUSearch(e.target.value)}
                    onKeyDown={e => { if(e.key==='Enter'){ setUPage(1); fetchUsers() }}}
                    placeholder="Search name or email…" style={{ width:'clamp(140px,30vw,220px)' }}/>
                  <select className="adm-select" value={uRole} onChange={e => { setURole(e.target.value); setUPage(1) }}>
                    <option value="">All roles</option>
                    {['client','therapist','admin','staff'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={() => { setUPage(1); fetchUsers() }} style={{ padding:'0.42rem 0.9rem', border:'1.5px solid #e2e8f0', borderRadius:8, background:'#fff', color:'#2e6080', fontSize:'0.82rem', cursor:'pointer', fontFamily:'inherit' }}>Search</button>
                </div>
              </div>
              <TableShell loading={busy.users} cols={['User','Email','Role','Status','Joined','Actions']}
                rows={users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'#e0f7ff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:800, color:'#007BA8', flexShrink:0 }}>
                          {(u.full_name||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                        <strong style={{ color:'#1a3a4a' }}>{u.full_name}</strong>
                      </div>
                    </td>
                    <td style={{ color:'#7a9aaa', fontSize:'0.78rem' }}>{u.email}</td>
                    <td>
                      <select className="adm-select" value={u.role}
                        onChange={e => doRole(u.id,e.target.value)}
                        style={{ padding:'0.22rem 0.5rem', fontSize:'0.78rem' }}>
                        {['client','therapist','admin','staff'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td><Badge s={u.is_active?'active':'paused'}/></td>
                    <td style={{ color:'#7a9aaa', fontSize:'0.78rem' }}>{fmt(u.created_at)}</td>
                    <td>
                      <button onClick={() => doToggle(u.id)}
                        style={{ padding:'0.28rem 0.7rem', border:'1px solid #e2e8f0', borderRadius:6, fontSize:'0.74rem', cursor:'pointer', background:'#fff', color:u.is_active?'#c0392b':'#1a7a4a', fontWeight:700 }}>
                        {u.is_active?'Deactivate':'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={uPage} set={setUPage} total={uTotal}/>
            </div>
          )}

          {/* ════ APPOINTMENTS ════ */}
          {tab==='appointments' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.2rem,3vw,1.4rem)', color:'#1a3a4a', margin:0 }}>
                  Appointments <span style={{ fontSize:'0.9rem', color:'#7a9aaa', fontWeight:400 }}>({aTotal})</span>
                </h1>
                <select className="adm-select" value={aStatus} onChange={e => { setAStatus(e.target.value); setAPage(1) }}>
                  <option value="">All statuses</option>
                  {['pending','confirmed','completed','cancelled','no_show'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <TableShell loading={busy.appts} cols={['Client','Therapist','Date & Time','Type','Status','Update']}
                rows={appts.map(a => (
                  <tr key={a.id}>
                    <td><strong style={{ color:'#1a3a4a' }}>{a.clients?.full_name||'—'}</strong></td>
                    <td>{a.therapists?.profiles?.full_name||'—'}</td>
                    <td style={{ fontSize:'0.78rem', color:'#7a9aaa' }}>{fmtT(a.scheduled_at)}</td>
                    <td><span style={{ fontSize:'0.75rem', background:'#f0f4f8', padding:'0.18rem 0.5rem', borderRadius:5 }}>{a.type}</span></td>
                    <td><Badge s={a.status}/></td>
                    <td>
                      <select className="adm-select" value={a.status}
                        onChange={e => doApptStatus(a.id,e.target.value)}
                        style={{ padding:'0.25rem 0.45rem', fontSize:'0.77rem' }}>
                        {['pending','confirmed','completed','cancelled','no_show'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={aPage} set={setAPage} total={aTotal}/>
            </div>
          )}

          {/* ════ ORDERS ════ */}
          {tab==='orders' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.2rem,3vw,1.4rem)', color:'#1a3a4a', margin:0 }}>
                  Orders <span style={{ fontSize:'0.9rem', color:'#7a9aaa', fontWeight:400 }}>({oTotal})</span>
                </h1>
                <select className="adm-select" value={oStatus} onChange={e => { setOStatus(e.target.value); setOPage(1) }}>
                  <option value="">All statuses</option>
                  {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <TableShell loading={busy.orders} cols={['Order #','Client','Amount','Status','Date','Update']}
                rows={orders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight:700, color:'#1a7a4a', fontSize:'0.8rem' }}>{o.order_number||'—'}</td>
                    <td>{o.profiles?.full_name||'—'}</td>
                    <td><strong>NPR {Number(o.total_amount||0).toLocaleString()}</strong></td>
                    <td><Badge s={o.status}/></td>
                    <td style={{ fontSize:'0.78rem', color:'#7a9aaa' }}>{fmt(o.created_at)}</td>
                    <td>
                      <select className="adm-select" value={o.status}
                        onChange={e => doOrderStatus(o.id,e.target.value)}
                        style={{ padding:'0.25rem 0.45rem', fontSize:'0.77rem' }}>
                        {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={oPage} set={setOPage} total={oTotal}/>
            </div>
          )}

          {/* ════ PAYMENTS ════ */}
          {tab==='payments' && (
            <div>
              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.2rem,3vw,1.4rem)', color:'#1a3a4a', margin:0 }}>
                  Payments <span style={{ fontSize:'0.9rem', color:'#7a9aaa', fontWeight:400 }}>({pTotal})</span>
                </h1>
                <select className="adm-select" value={pStatus} onChange={e => { setPStatus(e.target.value); setPPage(1) }}>
                  <option value="">All statuses</option>
                  {['pending','completed','refunded','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Category pills */}
              <div className="adm-pay-cat-tabs">
                {PAY_CATEGORIES.map(cat => (
                  <button key={cat.id}
                    className={`adm-pay-cat-btn${payCategory===cat.id?' active':''}`}
                    onClick={() => { setPayCategory(cat.id); setPPage(1) }}
                    style={{
                      borderColor: payCategory===cat.id ? cat.color : '#e2e8f0',
                      background:  payCategory===cat.id ? cat.faint  : '#fff',
                      color:       payCategory===cat.id ? cat.color  : '#2e6080',
                    }}>
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>

              {/* Summary mini-cards */}
              <div className="adm-pay-summary">
                {[
                  { label:'Showing',   val: pSummary.count,     icon:'📋', color:'#f0f4f8' },
                  { label:'Completed', val: pSummary.completed, icon:'✅', color:'#e8f8f0' },
                  { label:'Pending',   val: pSummary.pending,   icon:'⏳', color:'#fff5e6' },
                  { label:'Total (page)', val: `NPR ${pSummary.total.toLocaleString()}`, icon:'💰', color:'#f0e8ff' },
                ].map((c,i) => (
                  <div key={i} style={{ background:c.color, borderRadius:10, padding:'0.85rem 1rem',
                    border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'0.6rem' }}>
                    <span style={{ fontSize:'1.3rem' }}>{c.icon}</span>
                    <div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem',
                        color:'#1a3a4a', fontWeight:700, lineHeight:1.1 }}>{c.val}</div>
                      <div style={{ fontSize:'0.7rem', color:'#7a9aaa', fontWeight:600 }}>{c.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active category banner */}
              {payCategory !== 'all' && (
                <div style={{
                  background: activeCat.faint,
                  border: `1.5px solid ${activeCat.color}33`,
                  borderRadius: 10,
                  padding: '0.7rem 1rem',
                  marginBottom: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.65rem',
                  fontFamily: 'var(--font-body)', fontSize: '0.83rem', color: activeCat.color, fontWeight: 600,
                }}>
                  <span style={{ fontSize: '1.1rem' }}>{activeCat.icon}</span>
                  Showing <strong>{activeCat.label}</strong> payments
                  <button onClick={() => setPayCategory('all')}
                    style={{ marginLeft:'auto', fontSize:'0.75rem', border:`1px solid ${activeCat.color}44`,
                      borderRadius:6, padding:'0.2rem 0.65rem', cursor:'pointer',
                      background:'white', color:activeCat.color, fontFamily:'var(--font-body)', fontWeight:600 }}>
                    ✕ Clear filter
                  </button>
                </div>
              )}

              {/* Table */}
              <TableShell loading={busy.pays} cols={['Client','Amount','Method / Category','Status','Transaction ID','Date']}
                rows={pays.map(p => {
                  // Determine display category label
                  const catMatch = PAY_CATEGORIES.find(c => c.id === p.method)
                  return (
                    <tr key={p.id}>
                      <td>{p.profiles?.full_name||'—'}</td>
                      <td><strong>NPR {Number(p.amount||0).toLocaleString()}</strong></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                          {catMatch && <span style={{ fontSize:'0.85rem' }}>{catMatch.icon}</span>}
                          <span style={{ textTransform:'capitalize', fontSize:'0.8rem',
                            color: catMatch ? catMatch.color : '#2e6080', fontWeight:600 }}>
                            {catMatch ? catMatch.label : (p.method || '—')}
                          </span>
                        </div>
                        {/* Show if linked to appointment or order */}
                        {(p.appointment_id || p.order_id) && (
                          <div style={{ fontSize:'0.7rem', color:'#7a9aaa', marginTop:2 }}>
                            {p.appointment_id ? '📅 Appointment' : '📦 Order'}
                          </div>
                        )}
                      </td>
                      <td><Badge s={p.status}/></td>
                      <td style={{ fontSize:'0.78rem', color:'#7a9aaa', maxWidth:140,
                        overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {p.transaction_id||'—'}
                      </td>
                      <td style={{ fontSize:'0.78rem', color:'#7a9aaa' }}>{fmt(p.created_at)}</td>
                    </tr>
                  )
                })}
              />
              <Pager page={pPage} set={setPPage} total={pTotal}/>
            </div>
          )}

          {/* ════ NOTIFY CLIENTS ════ */}
          {tab==='notifications' && (
            <div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.2rem,3vw,1.4rem)', color:'#1a3a4a', margin:'0 0 1.5rem' }}>
                🔔 Send Notifications
              </h1>

              <div className="adm-notify-card">
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem',
                  color:'#1a3a4a', marginBottom:'1.25rem' }}>Compose Notification</h2>

                <form onSubmit={handleSendNotification}
                  style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

                  <div>
                    <label style={{ display:'block', fontSize:'0.72rem', fontWeight:800,
                      color:'#4a6a7a', textTransform:'uppercase', letterSpacing:'0.08em',
                      marginBottom:'0.4rem' }}>Send To</label>
                    <select value={notifTarget} onChange={e => setNotifTarget(e.target.value)}
                      required style={{ ...inputSx, cursor:'pointer' }}>
                      <option value="">— Select recipient —</option>
                      <option value="all">📢 All Clients ({notifClients.length})</option>
                      {notifClients.map(c => (
                        <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display:'block', fontSize:'0.72rem', fontWeight:800,
                      color:'#4a6a7a', textTransform:'uppercase', letterSpacing:'0.08em',
                      marginBottom:'0.4rem' }}>Type</label>
                    <select value={notifType} onChange={e => setNotifType(e.target.value)}
                      style={{ ...inputSx, cursor:'pointer', maxWidth:240 }}>
                      {['system','appointment','payment','reminder','message','review'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display:'block', fontSize:'0.72rem', fontWeight:800,
                      color:'#4a6a7a', textTransform:'uppercase', letterSpacing:'0.08em',
                      marginBottom:'0.4rem' }}>Title *</label>
                    <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
                      placeholder="e.g. Session reminder for tomorrow" required style={inputSx}/>
                  </div>

                  <div>
                    <label style={{ display:'block', fontSize:'0.72rem', fontWeight:800,
                      color:'#4a6a7a', textTransform:'uppercase', letterSpacing:'0.08em',
                      marginBottom:'0.4rem' }}>Message (optional)</label>
                    <textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)}
                      rows={3} placeholder="Additional details…"
                      style={{ ...inputSx, resize:'vertical', lineHeight:1.65 }}/>
                  </div>

                  {notifResult && (
                    <div style={{ padding:'0.75rem 1rem', borderRadius:10,
                      background: notifResult.ok ? '#e8f8f0' : '#fff0f0',
                      border: `1px solid ${notifResult.ok ? '#a0ddb8' : '#f5a0a0'}`,
                      color: notifResult.ok ? '#1a7a4a' : '#c0392b',
                      fontSize:'0.85rem', fontWeight:600 }}>
                      {notifResult.msg}
                    </div>
                  )}

                  <button type="submit" disabled={notifSending || !notifTarget || !notifTitle.trim()}
                    style={{ padding:'0.85rem 1.75rem', background:'linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)',
                      color:'white', border:'none', borderRadius:10, fontWeight:800,
                      fontSize:'0.9rem', cursor:'pointer', alignSelf:'flex-start',
                      opacity: notifSending || !notifTarget || !notifTitle.trim() ? 0.6 : 1,
                      boxShadow:'0 4px 14px rgba(0,191,255,0.25)', transition:'all 0.2s' }}>
                    {notifSending ? 'Sending…' : '🔔 Send Notification'}
                  </button>
                </form>
              </div>

              {sentHistory.length > 0 && (
                <div className="adm-notify-card">
                  <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1rem',
                    color:'#1a3a4a', marginBottom:'1rem' }}>Recently Sent</h2>
                  {sentHistory.map((h,i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', padding:'0.65rem 0',
                      borderBottom: i < sentHistory.length-1 ? '1px solid #e2e8f0' : 'none',
                      flexWrap:'wrap', gap:'0.5rem' }}>
                      <div>
                        <div style={{ fontWeight:700, color:'#1a3a4a', fontSize:'0.88rem' }}>{h.title}</div>
                        <div style={{ fontSize:'0.75rem', color:'#7a9aaa', marginTop:2 }}>
                          To: {h.target} · {h.type}
                        </div>
                      </div>
                      <span style={{ fontSize:'0.72rem', color:'#7a9aaa', whiteSpace:'nowrap' }}>
                        {h.time.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}