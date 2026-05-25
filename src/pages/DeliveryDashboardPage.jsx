// ═══════════════════════════════════════════════════════════════
// src/pages/DeliveryDashboardPage.jsx
// Route: /delivery/dashboard
// Rider sees only THEIR assigned orders. Can update delivery_status only.
// Matches the admin dark sidebar aesthetic but with delivery accent.
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '../context/RouterContext'

const API = (import.meta.env.VITE_API_URL || '').replace(/\/api$/, '')

const getToken  = () => localStorage.getItem('deliveryToken')
const getRider  = () => { try { return JSON.parse(localStorage.getItem('deliveryRider') || '{}') } catch { return {} } }

const apiFetch = async (path, opts = {}) => {
  const res = await fetch(`${API}${path}`, {
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

const fmt  = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const fmtT = d => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

// ── Delivery status config ────────────────────────────────────
const DS = {
  unassigned: { label: 'Unassigned', bg: '#f1f5f9', fg: '#475569', dot: '#94a3b8' },
  assigned:   { label: 'Assigned',   bg: '#eff6ff', fg: '#1e40af', dot: '#3b82f6' },
  picked_up:  { label: 'Picked Up',  bg: '#f5f3ff', fg: '#5b21b6', dot: '#8b5cf6' },
  in_transit: { label: 'In Transit', bg: '#ecfeff', fg: '#0e7490', dot: '#14b8a6' },
  delivered:  { label: 'Delivered',  bg: '#ecfdf5', fg: '#065f46', dot: '#10b981' },
  failed:     { label: 'Failed',     bg: '#fef2f2', fg: '#991b1b', dot: '#ef4444' },
  returned:   { label: 'Returned',   bg: '#faf5ff', fg: '#6b21a8', dot: '#a855f7' },
}

// Rider can only move forward through these
const RIDER_STATUSES = ['picked_up','in_transit','delivered','failed','returned']

// Order payment status badge
const PAY_MAP = {
  pending:   { bg: '#fffbeb', c: '#92400e', t: '⏳ Pending' },
  completed: { bg: '#ecfdf5', c: '#065f46', t: '✓ Paid' },
  paid:      { bg: '#ecfdf5', c: '#065f46', t: '✓ Paid' },
  failed:    { bg: '#fef2f2', c: '#991b1b', t: '✗ Failed' },
  cod:       { bg: '#fffbeb', c: '#92400e', t: '💵 COD' },
}

// ── CSS injected once ─────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
:root {
  --sb-bg:#0d1117; --sb-border:#1e2730; --sb-hover:#161d27;
  --sb-active-bg:#1a2840; --sb-active-bd:#3b82f6;
  --sb-text:#8b98a8; --sb-text-active:#e2e8f0;
  --bar-bg:#0d1117; --bar-border:#1e2730;
  --bg:#f1f4f9; --surface:#fff; --surface2:#f8fafc;
  --border:#e2e8f0; --border2:#edf2f7;
  --text:#0f172a; --text2:#475569; --muted:#94a3b8; --label:#64748b;
  --blue:#3b82f6; --green:#10b981; --red:#ef4444; --amber:#f59e0b;
  --teal:#14b8a6; --radius:10px; --radius-lg:14px;
  --shadow-sm:0 1px 4px rgba(0,0,0,.06);
  --shadow-md:0 4px 16px rgba(0,0,0,.08);
  --topbar-h:54px; --sb-w:220px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Sora',system-ui,sans-serif}

.dlv-adm{min-height:100vh;background:var(--bg);display:flex;flex-direction:column;font-family:'Sora',system-ui,sans-serif;color:var(--text)}
.dlv-bar{height:var(--topbar-h);background:var(--bar-bg);border-bottom:1px solid var(--bar-border);padding:0 1.25rem;display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;z-index:300}
.dlv-body{display:flex;flex:1;min-height:0}
.dlv-side{width:var(--sb-w);flex-shrink:0;background:var(--sb-bg);border-right:1px solid var(--sb-border);position:sticky;top:var(--topbar-h);height:calc(100vh - var(--topbar-h));overflow-y:auto;padding:.75rem 0;scrollbar-width:thin;scrollbar-color:#2d3748 transparent}
.dlv-content{flex:1;padding:1.5rem;overflow-x:hidden;min-width:0}
.sb-btn{display:flex;align-items:center;gap:.6rem;width:100%;padding:.5rem 1.1rem;border:none;background:transparent;font-family:'Sora',system-ui,sans-serif;font-size:.78rem;font-weight:500;cursor:pointer;text-align:left;color:var(--sb-text);transition:all .13s}
.sb-btn:hover{background:var(--sb-hover);color:var(--sb-text-active)}
.sb-btn.active{background:var(--sb-active-bg);color:var(--sb-text-active);font-weight:600;border-right:2px solid var(--sb-active-bd)}
.sb-group{padding:.9rem 1.1rem .3rem;font-size:.6rem;font-weight:700;color:#4a5568;text-transform:uppercase;letter-spacing:.1em}

.btn{padding:.38rem .85rem;border-radius:6px;font-family:inherit;font-size:.76rem;font-weight:600;cursor:pointer;border:1.5px solid transparent;transition:all .13s;display:inline-flex;align-items:center;gap:.3rem;white-space:nowrap}
.btn:disabled{opacity:.45;cursor:not-allowed}
.btn-primary{background:var(--blue);color:#fff;border-color:var(--blue)}
.btn-ghost{background:var(--surface);color:var(--text2);border-color:var(--border)}
.btn-ghost:hover{border-color:#94a3b8}
.btn-sm{padding:.22rem .55rem;font-size:.7rem;border-radius:5px}
.btn-danger{background:#fef2f2;color:var(--red);border-color:#fecaca}

.inp{padding:.38rem .75rem;border:1.5px solid var(--border);border-radius:6px;font-size:.78rem;color:var(--text);background:var(--surface);outline:none;font-family:inherit;transition:border .13s}
.inp:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(59,130,246,.1)}
select.inp{cursor:pointer}

.tbl-wrap{background:var(--surface);border-radius:var(--radius-lg);border:1px solid var(--border);overflow:hidden;box-shadow:var(--shadow-sm)}
.tbl-scroll{overflow-x:auto}
table.tbl{width:100%;border-collapse:collapse;min-width:600px}
table.tbl th{padding:.55rem .85rem;text-align:left;font-size:.6rem;font-weight:700;color:var(--label);text-transform:uppercase;letter-spacing:.08em;background:var(--surface2);border-bottom:1px solid var(--border)}
table.tbl td{padding:.62rem .85rem;font-size:.78rem;color:var(--text2);border-bottom:1px solid var(--border2);vertical-align:middle}
table.tbl tr:last-child td{border-bottom:none}
table.tbl tr:hover td{background:#fafbfd}
.tbl-loading{text-align:center;padding:2.5rem;color:var(--muted);font-size:.82rem}

.stat-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:.75rem;margin-bottom:1.25rem}
.stat-card{background:var(--surface);border-radius:var(--radius-lg);border:1px solid var(--border);padding:.95rem 1.1rem;cursor:pointer;transition:all .15s}
.stat-card:hover,.stat-card.active{transform:translateY(-2px);box-shadow:var(--shadow-md)}
.stat-val{font-size:1.5rem;font-weight:800;letter-spacing:-.03em;line-height:1;margin-bottom:.25rem}
.stat-lbl{font-size:.63rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}

.badge{display:inline-flex;align-items:center;gap:.3rem;padding:.16rem .5rem;border-radius:100px;font-size:.6rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap}
.dot{width:5px;height:5px;border-radius:50%;flex-shrink:0;display:inline-block}

.sec-head{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:1.25rem;flex-wrap:wrap;gap:.75rem}
.sec-title{font-size:1.15rem;font-weight:700;letter-spacing:-.02em}
.sec-sub{font-size:.73rem;color:var(--muted);margin-top:.2rem}
.sec-actions{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}

.filters{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center;margin-bottom:1rem}

.overlay{position:fixed;inset:0;background:rgba(2,6,23,.6);backdrop-filter:blur(6px);z-index:600;display:flex;align-items:center;justify-content:center;padding:1rem;animation:fi .15s}
@keyframes fi{from{opacity:0}to{opacity:1}}
.modal{background:var(--surface);border-radius:18px;width:100%;max-width:500px;max-height:88vh;overflow-y:auto;border:1px solid var(--border);box-shadow:0 20px 60px rgba(0,0,0,.18);animation:su .18s}
@keyframes su{from{transform:translateY(8px);opacity:0}to{transform:none;opacity:1}}
.mhead{padding:1.1rem 1.3rem;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.mhead-title{font-size:.92rem;font-weight:700}
.mbody{padding:1.2rem 1.3rem;display:flex;flex-direction:column;gap:.85rem}
.mfoot{padding:.85rem 1.3rem;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:.4rem}
.field{display:flex;flex-direction:column;gap:.28rem}
.field label{font-size:.63rem;font-weight:700;color:var(--label);text-transform:uppercase;letter-spacing:.08em}

.spinner{display:inline-block;width:13px;height:13px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.avatar{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:.68rem;font-weight:800;color:#fff}
.logout-btn{padding:.28rem .7rem;border-radius:6px;border:1px solid #2d3748;background:transparent;color:#94a3b8;font-size:.72rem;cursor:pointer;font-family:inherit;transition:all .13s}
.logout-btn:hover{border-color:#4a5568;color:#e2e8f0}

@media(max-width:680px){
  .dlv-side{display:none}
  .dlv-content{padding:1rem}
  .stat-grid{grid-template-columns:repeat(3,1fr)}
}
@media(max-width:480px){
  .stat-grid{grid-template-columns:repeat(2,1fr)}
}
`

function injectCSS() {
  if (document.getElementById('dlv-dash-css')) return
  const s = document.createElement('style')
  s.id = 'dlv-dash-css'; s.textContent = CSS
  document.head.appendChild(s)
}

// ─────────────────────────────────────────────────────────────
export default function DeliveryDashboardPage() {
  useEffect(() => { injectCSS() }, [])

  const { navigate } = useRouter()
  const rider = getRider()

  // Auth guard
  useEffect(() => {
    if (!getToken()) navigate('/delivery/login')
  }, [])

  const [tab,       setTab]       = useState('orders')
  const [orders,    setOrders]    = useState([])
  const [total,     setTotal]     = useState(0)
  const [summary,   setSummary]   = useState({})
  const [page,      setPage]      = useState(1)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [filterDS,  setFilterDS]  = useState('')
  const [busy,      setBusy]      = useState({})
  const [toast,     setToast]     = useState(null)
  const [detailRow, setDetailRow] = useState(null)
  const [updateModal, setUpdateModal] = useState(null)  // { order }
  const [newStatus, setNewStatus] = useState('')
  const [newNote,   setNewNote]   = useState('')
  const [saving,    setSaving]    = useState(false)

  const LIMIT = 15

  const flash = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3200)
  }

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const p = new URLSearchParams({ page, limit: LIMIT })
      if (filterDS) p.set('delivery_status', filterDS)
      const d = await apiFetch(`/api/delivery/my-orders?${p}`)
      setOrders(d.items || [])
      setTotal(d.pagination?.total || 0)
      setSummary(d.summary || {})
    } catch (e) {
      if (e.message.includes('401') || e.message.includes('token')) {
        localStorage.removeItem('deliveryToken')
        navigate('/delivery')
      }
      setError(e.message)
    } finally { setLoading(false) }
  }, [page, filterDS])

  useEffect(() => { load() }, [load])

  function handleLogout() {
    localStorage.removeItem('deliveryToken')
    localStorage.removeItem('deliveryRider')
    navigate('/delivery')
  }

  function openUpdate(order) {
    setUpdateModal({ order })
    setNewStatus(order.delivery_status || 'assigned')
    setNewNote('')
  }

  async function saveStatus() {
    if (!updateModal) return
    setSaving(true)
    try {
      await apiFetch(`/api/delivery/my-orders/${updateModal.order.id}`, {
        method: 'PUT',
        body: JSON.stringify({ delivery_status: newStatus, delivery_note: newNote, note: newNote }),
      })
      setUpdateModal(null)
      flash(`Status updated → ${DS[newStatus]?.label}`)
      load()
    } catch (e) { flash(e.message, false) }
    finally { setSaving(false) }
  }

  // ── Stat cards ───────────────────────────────────────────────
  const STATS = [
    { key: '',           label: 'Total',      val: summary.total      || 0, color: '#3b82f6', dot: '#3b82f6' },
    { key: 'assigned',   label: 'Assigned',   val: summary.assigned   || 0, color: '#1e40af', dot: '#3b82f6' },
    { key: 'in_transit', label: 'In Transit', val: summary.in_transit || 0, color: '#0e7490', dot: '#14b8a6' },
    { key: 'delivered',  label: 'Delivered',  val: summary.delivered  || 0, color: '#065f46', dot: '#10b981' },
    { key: 'failed',     label: 'Failed',     val: summary.failed     || 0, color: '#991b1b', dot: '#ef4444' },
  ]

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="dlv-adm">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.ok ? '#10b981' : '#ef4444',
          color: '#fff', padding: '.65rem 1.1rem', borderRadius: 'var(--radius)',
          fontWeight: 600, fontSize: '.82rem', boxShadow: 'var(--shadow-md)',
        }}>{toast.msg}</div>
      )}

      {/* Top bar */}
      <div className="dlv-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <img src="/header.png" style={{ height: 26, objectFit: 'contain' }} alt=""
            onError={e => e.target.style.display = 'none'} />
          <div>
            <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#e2e8f0', letterSpacing: '-.01em' }}>Common Psychology</div>
            <div style={{ fontSize: '.58rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '.1em' }}>Delivery Portal</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
          <div className="avatar">
            {(rider.name || 'R').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: '.78rem', color: '#94a3b8' }}>
            {(rider.name || '').split(' ')[0]}
          </span>
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      <div className="dlv-body">

        {/* Sidebar */}
        <div className="dlv-side">
          <div className="sb-group">Delivery</div>
          {[
            { id: 'orders', icon: '📦', label: 'My Orders' },
            { id: 'profile', icon: '👤', label: 'My Profile' },
          ].map(t => (
            <button key={t.id} className={`sb-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <span style={{ fontSize: '.9rem' }}>{t.icon}</span>{t.label}
            </button>
          ))}

          {/* Quick status summary in sidebar */}
          <div style={{ padding: '1rem 1.1rem', borderTop: '1px solid #1e2730', marginTop: '.5rem' }}>
            <div style={{ fontSize: '.6rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.6rem' }}>Today's Stats</div>
            {Object.entries(DS).filter(([k]) => k !== 'unassigned').map(([k, v]) => (
              summary[k] > 0 && (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.2rem 0', fontSize: '.73rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '.35rem', color: '#8b98a8' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: v.dot, display: 'inline-block' }} />
                    {v.label}
                  </span>
                  <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{summary[k]}</span>
                </div>
              )
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="dlv-content">

          {/* ── ORDERS TAB ── */}
          {tab === 'orders' && (
            <div>
              <div className="sec-head">
                <div>
                  <h1 className="sec-title">My Deliveries</h1>
                  <p className="sec-sub">Orders assigned to you — update status as you go</p>
                </div>
                <div className="sec-actions">
                  <button className="btn btn-ghost" onClick={load}>↺ Refresh</button>
                </div>
              </div>

              {/* Stat cards */}
              <div className="stat-grid">
                {STATS.map(s => (
                  <div key={s.key}
                    className={`stat-card${filterDS === s.key ? ' active' : ''}`}
                    style={{ borderColor: filterDS === s.key ? s.dot : 'var(--border)' }}
                    onClick={() => { setFilterDS(f => f === s.key ? '' : s.key); setPage(1) }}>
                    <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                    <div className="stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div className="filters">
                <select className="inp" value={filterDS}
                  onChange={e => { setFilterDS(e.target.value); setPage(1) }}>
                  <option value="">All statuses</option>
                  {Object.entries(DS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                {filterDS && (
                  <button className="btn btn-ghost" onClick={() => { setFilterDS(''); setPage(1) }}>✕ Clear</button>
                )}
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.65rem .9rem', marginBottom: '.85rem', fontSize: '.78rem', color: '#991b1b', fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}

              {/* Table */}
              <div className="tbl-wrap">
                <div className="tbl-scroll">
                  <table className="tbl">
                    <thead>
                      <tr>
                        {['Order #', 'Client', 'Address', 'Amount', 'Pay Status', 'Delivery Status', 'Assigned', 'Actions'].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading
                        ? <tr><td className="tbl-loading" colSpan={8}><span className="spinner" /> Loading your orders…</td></tr>
                        : orders.length === 0
                          ? (
                            <tr><td colSpan={8}>
                              <div style={{ textAlign: 'center', padding: '3.5rem 2rem', color: 'var(--muted)' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '.75rem', opacity: .5 }}>📦</div>
                                <div style={{ fontSize: '.82rem' }}>
                                  {filterDS ? 'No orders with this status' : 'No orders assigned to you yet'}
                                </div>
                              </div>
                            </td></tr>
                          )
                          : orders.map(o => {
                              const ds  = DS[o.delivery_status] || DS.unassigned
                              const pay = PAY_MAP[o.payment_status] || { bg: '#f1f5f9', c: '#475569', t: o.payment_status || '—' }
                              return (
                                <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => setDetailRow(o)}>

                                  {/* Order # */}
                                  <td onClick={e => e.stopPropagation()}>
                                    <div style={{ fontWeight: 700, fontSize: '.78rem', color: '#3b82f6', fontFamily: 'monospace' }}>
                                      {o.order_number || o.id?.slice(0, 8)}
                                    </div>
                                  </td>

                                  {/* Client */}
                                  <td>
                                    <div style={{ fontWeight: 600, fontSize: '.82rem', color: 'var(--text)' }}>{o.client_name || '—'}</div>
                                  </td>

                                  {/* Address */}
                                  <td style={{ maxWidth: 160 }}>
                                    <div style={{ fontSize: '.74rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 150 }}>
                                      {o.delivery_address || '—'}
                                    </div>
                                  </td>

                                  {/* Amount */}
                                  <td>
                                    <strong style={{ fontSize: '.82rem' }}>NPR {Number(o.total_amount || 0).toLocaleString()}</strong>
                                  </td>

                                  {/* Pay status */}
                                  <td>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '.16rem .5rem', borderRadius: 100, fontSize: '.6rem', fontWeight: 700, background: pay.bg, color: pay.c }}>
                                      {pay.t}
                                    </span>
                                  </td>

                                  {/* Delivery status */}
                                  <td>
                                    <span className="badge" style={{ background: ds.bg, color: ds.fg }}>
                                      <span className="dot" style={{ background: ds.dot }} />
                                      {ds.label}
                                    </span>
                                  </td>

                                  {/* Date */}
                                  <td style={{ fontSize: '.72rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                                    {fmt(o.created_at)}
                                    {o.delivered_at && (
                                      <div style={{ fontSize: '.63rem', color: '#10b981', marginTop: '.1rem' }}>✓ {fmtT(o.delivered_at)}</div>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td onClick={e => e.stopPropagation()}>
                                    <div style={{ display: 'flex', gap: '.3rem' }}>
                                      <button className="btn btn-ghost btn-sm" onClick={() => setDetailRow(o)} title="View details">👁</button>
                                      {/* Rider can update if not already delivered/returned */}
                                      {!['delivered','returned'].includes(o.delivery_status) && (
                                        <button className="btn btn-primary btn-sm"
                                          disabled={busy[o.id]}
                                          onClick={() => openUpdate(o)}>
                                          Update
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )
                            })
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.4rem', padding: '.75rem', borderTop: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
                  <span style={{ fontSize: '.72rem', color: 'var(--muted)', padding: '0 .5rem' }}>{page} / {totalPages} · <strong>{total}</strong> total</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <div>
              <div className="sec-head">
                <div>
                  <h1 className="sec-title">My Profile</h1>
                  <p className="sec-sub">Your delivery account details</p>
                </div>
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', maxWidth: 480 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'linear-gradient(135deg,#007BA8,#00BFFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {(rider.name || 'R').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{rider.name || '—'}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: '.15rem' }}>Delivery Rider</div>
                  </div>
                </div>
                {[
                  ['Email',    rider.email  || '—'],
                  ['Phone',    rider.phone  || '—'],
                  ['Area',     rider.area   || '—'],
                  ['Total Delivered', summary.delivered || 0],
                  ['In Transit',     summary.in_transit || 0],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '.5rem 0', borderBottom: '1px solid var(--border2)', fontSize: '.82rem' }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{k}</span>
                    <span style={{ color: 'var(--text)' }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop: '1.25rem' }}>
                  <button className="btn btn-danger" onClick={handleLogout} style={{ width: '100%', justifyContent: 'center' }}>
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── UPDATE STATUS MODAL ─────────────────────────── */}
      {updateModal && (
        <div className="overlay" onClick={() => setUpdateModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <span className="mhead-title">📦 Update Delivery Status</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setUpdateModal(null)}>✕</button>
            </div>
            <div className="mbody">
              {/* Order info summary */}
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '.75rem .9rem', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: '.83rem', marginBottom: '.25rem' }}>
                  {updateModal.order.order_number || updateModal.order.id?.slice(0, 8)}
                </div>
                <div style={{ fontSize: '.76rem', color: 'var(--muted)' }}>{updateModal.order.client_name || '—'}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.15rem' }}>{updateModal.order.delivery_address || '—'}</div>
              </div>

              <div className="field">
                <label>New Delivery Status</label>
                <select className="inp" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {RIDER_STATUSES.map(s => (
                    <option key={s} value={s}>{DS[s]?.label || s}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Note (optional)</label>
                <input className="inp" value={newNote} onChange={e => setNewNote(e.target.value)}
                  placeholder="e.g. Left at reception, Customer called back…" />
              </div>

              {/* Warning for failed */}
              {newStatus === 'failed' && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '.65rem .85rem', fontSize: '.78rem', color: '#991b1b', fontWeight: 600 }}>
                  ⚠️ Please add a reason note when marking as failed.
                </div>
              )}
            </div>
            <div className="mfoot">
              <button className="btn btn-ghost" onClick={() => setUpdateModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveStatus} disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : 'Save Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ORDER DETAIL MODAL ──────────────────────────── */}
      {detailRow && (
        <div className="overlay" onClick={() => setDetailRow(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="mhead">
              <span className="mhead-title">📋 Order Detail</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetailRow(null)}>✕</button>
            </div>
            <div className="mbody">
              {[
                { title: 'Order', rows: [
                  ['Order #',    detailRow.order_number || detailRow.id?.slice(0, 8)],
                  ['Amount',     `NPR ${Number(detailRow.total_amount || 0).toLocaleString()}`],
                  ['Pay Status', detailRow.payment_status || '—'],
                  ['Order Status', detailRow.status || '—'],
                ]},
                { title: 'Delivery', rows: [
                  ['Delivery Status', DS[detailRow.delivery_status]?.label || detailRow.delivery_status || '—'],
                  ['Assigned On',  fmt(detailRow.created_at)],
                  ['Picked Up',    detailRow.picked_up_at  ? fmtT(detailRow.picked_up_at)  : '—'],
                  ['Delivered At', detailRow.delivered_at  ? fmtT(detailRow.delivered_at)  : '—'],
                ]},
                { title: 'Client & Address', rows: [
                  ['Client',   detailRow.client_name     || '—'],
                  ['Address',  detailRow.delivery_address || '—'],
                ]},
              ].map(card => (
                <div key={card.title} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '.8rem', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '.6rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.5rem' }}>{card.title}</div>
                  {card.rows.map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '.22rem 0', borderBottom: '1px solid var(--border2)', fontSize: '.75rem' }}>
                      <span style={{ color: 'var(--muted)', fontWeight: 600 }}>{k}</span>
                      <span style={{ color: 'var(--text2)', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}

              {detailRow.delivery_note && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '.65rem .85rem', fontSize: '.78rem', color: '#1e40af' }}>
                  <strong style={{ fontSize: '.63rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>Note</strong>
                  <p style={{ margin: '.25rem 0 0' }}>{detailRow.delivery_note}</p>
                </div>
              )}
            </div>
            <div className="mfoot">
              {!['delivered','returned'].includes(detailRow.delivery_status) && (
                <button className="btn btn-primary" onClick={() => { setDetailRow(null); openUpdate(detailRow) }}>
                  Update Status
                </button>
              )}
              <button className="btn btn-ghost" onClick={() => setDetailRow(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}