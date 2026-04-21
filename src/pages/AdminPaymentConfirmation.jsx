// src/components/AdminPaymentConfirmation.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop-in replacement for the payments tab inside AdminDashboardFull.
// Shows pending payments with Approve / Reject / COD actions.
// Usage: import AdminPaymentConfirmation from './AdminPaymentConfirmation'
// Then in AdminDashboardFull, replace {tab === 'payments' && (...)} with:
//   {tab === 'payments' && <AdminPaymentConfirmation />}
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

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

const fmt  = d => d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'
const fmtT = d => d ? new Date(d).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'

const STATUS_COLORS = {
  pending:     { bg:'#fff5e6', c:'#8a5a1a' },
  pending_cod: { bg:'#fff0f8', c:'#8a1a5a' },
  completed:   { bg:'#e8f8f0', c:'#1a7a4a' },
  failed:      { bg:'#fff0f0', c:'#c0392b' },
}

function Badge({ s }) {
  const v = STATUS_COLORS[s] || { bg:'#eee', c:'#444' }
  return (
    <span style={{
      padding:'0.18rem 0.55rem', borderRadius:100,
      fontSize:'0.65rem', fontWeight:800, textTransform:'uppercase',
      letterSpacing:'0.06em', background:v.bg, color:v.c,
    }}>
      {s === 'pending_cod' ? 'COD Pending' : s}
    </span>
  )
}

function MethodBadge({ method }) {
  const map = {
    esewa:   { icon:'🟢', label:'eSewa',   c:'#22c55e' },
    khalti:  { icon:'🟣', label:'Khalti',  c:'#a855f7' },
    fonepay: { icon:'📷', label:'Fonepay', c:'#f97316' },
    qr:      { icon:'📷', label:'QR',      c:'#f97316' },
    cash:    { icon:'💵', label:'Cash/COD',c:'#5a6a7a' },
    cod:     { icon:'💵', label:'Cash/COD',c:'#5a6a7a' },
    stripe:  { icon:'💳', label:'Stripe',  c:'#635BFF' },
  }
  const m = map[method] || { icon:'💳', label: method, c:'#5a6a7a' }
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:'0.78rem', color:m.c, fontWeight:700 }}>
      {m.icon} {m.label}
    </span>
  )
}

// ── Action modal ──────────────────────────────────────────────────────────────
function ActionModal({ payment, type, onClose, onDone }) {
  const [note, setNote]         = useState('')
  const [txnId, setTxnId]       = useState('')
  const [collectedBy, setCollBy] = useState('')
  const [loading, setLoading]   = useState(false)
  const [err, setErr]           = useState('')

  const cfg = {
    approve:     { title:'✅ Approve Payment',   color:'#1a7a4a', btnLabel:'Approve & Confirm' },
    reject:      { title:'❌ Reject Payment',    color:'#c0392b', btnLabel:'Reject Payment'    },
    cod_confirm: { title:'💵 Confirm Cash Received', color:'#1a7a4a', btnLabel:'Mark Cash Collected' },
    cod_flag:    { title:'🚩 Flag COD Issue',    color:'#c0392b', btnLabel:'Flag as Unresolved' },
  }[type]

  async function submit() {
    setLoading(true); setErr('')
    try {
      const endpoints = {
        approve:     `/admin/payments/${payment.id}/approve`,
        reject:      `/admin/payments/${payment.id}/reject`,
        cod_confirm: `/admin/payments/${payment.id}/cod-confirm`,
        cod_flag:    `/admin/payments/${payment.id}/cod-flag`,
      }
      await apiFetch(endpoints[type], {
        method: 'POST',
        body: JSON.stringify({
          transactionId: txnId || undefined,
          reason:        note  || undefined,
          adminNote:     note  || undefined,
          collectedBy:   collectedBy || undefined,
        }),
      })
      onDone()
      onClose()
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,10,20,0.65)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'white', borderRadius:20, width:'min(520px,100%)', padding:0, boxShadow:'0 20px 60px rgba(0,0,0,0.3)', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ background: type.includes('flag') || type === 'reject' ? '#fff0f0' : '#e8f8f0', borderBottom:'1px solid #e2e8f0', padding:'1.25rem 1.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:cfg.color }}>{cfg.title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:'1.1rem', cursor:'pointer', color:'#7a9aaa', lineHeight:1 }}>✕</button>
        </div>

        {/* Payment summary */}
        <div style={{ padding:'1rem 1.5rem', background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem', fontSize:'0.84rem', color:'#2e6080' }}>
            <span><strong>{payment.client?.full_name || '—'}</strong> · {payment.client?.email}</span>
            <span style={{ fontWeight:700, fontSize:'1rem' }}>NPR {Number(payment.amount).toLocaleString()}</span>
          </div>
          <div style={{ display:'flex', gap:'1rem', marginTop:'0.4rem', fontSize:'0.78rem', color:'#7a9aaa' }}>
            <MethodBadge method={payment.method}/>
            <span>Submitted: {fmtT(payment.created_at)}</span>
            {payment.transaction_id && <span>TXN: {payment.transaction_id}</span>}
          </div>
          {payment.display_label && <div style={{ marginTop:'0.3rem', fontSize:'0.78rem', color:'#5a7a8a' }}>📋 {payment.display_label}</div>}
        </div>

        {/* Form */}
        <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          {type === 'approve' && (
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#4a6a7a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.35rem' }}>
                Transaction ID (optional — confirm if client provided one)
              </label>
              <input value={txnId} onChange={e => setTxnId(e.target.value)} placeholder={payment.transaction_id || 'e.g. ESW-20240128-XXXXX'}
                style={{ width:'100%', padding:'0.6rem 0.85rem', border:'1.5px solid #daeef8', borderRadius:8, fontSize:'0.85rem', outline:'none', boxSizing:'border-box' }}/>
            </div>
          )}
          {type === 'cod_confirm' && (
            <div>
              <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#4a6a7a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.35rem' }}>
                Collected By (name of staff)
              </label>
              <input value={collectedBy} onChange={e => setCollBy(e.target.value)} placeholder="Your name"
                style={{ width:'100%', padding:'0.6rem 0.85rem', border:'1.5px solid #daeef8', borderRadius:8, fontSize:'0.85rem', outline:'none', boxSizing:'border-box' }}/>
            </div>
          )}
          <div>
            <label style={{ display:'block', fontSize:'0.7rem', fontWeight:800, color:'#4a6a7a', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.35rem' }}>
              {type.includes('flag') || type === 'reject' ? 'Reason (will be sent to client) *' : 'Admin Note (internal, optional)'}
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3}
              placeholder={type === 'reject' ? 'e.g. Screenshot unclear, amount does not match' : type === 'cod_flag' ? 'e.g. Client not home, refused to pay' : ''}
              style={{ width:'100%', padding:'0.6rem 0.85rem', border:'1.5px solid #daeef8', borderRadius:8, fontSize:'0.85rem', resize:'vertical', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}/>
          </div>

          {err && <div style={{ background:'#fff0f0', border:'1px solid #fca5a5', borderRadius:8, padding:'0.6rem 0.85rem', fontSize:'0.82rem', color:'#c0392b' }}>{err}</div>}

          <div style={{ display:'flex', gap:'0.5rem', justifyContent:'flex-end' }}>
            <button onClick={onClose} style={{ padding:'0.55rem 1.1rem', border:'1.5px solid #e2e8f0', background:'white', borderRadius:8, fontSize:'0.82rem', cursor:'pointer' }}>Cancel</button>
            <button onClick={submit} disabled={loading}
              style={{ padding:'0.55rem 1.25rem', border:'none', borderRadius:8, background:cfg.color, color:'white', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? '⏳ Processing…' : cfg.btnLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function AdminPaymentConfirmation() {
  const [payments, setPayments]     = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(false)
  const [filterStatus, setFS]       = useState('')
  const [filterMethod, setFM]       = useState('')
  const [modal, setModal]           = useState(null) // { payment, type }
  const LIMIT = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: LIMIT })
      if (filterStatus) params.set('status', filterStatus)
      if (filterMethod) params.set('method', filterMethod)
      const d = await apiFetch(`/admin/payments?${params}`)
      setPayments(d.payments || [])
      setTotal(d.pagination?.total || 0)
    } catch {}
    finally { setLoading(false) }
  }, [page, filterStatus, filterMethod])

  useEffect(() => { load() }, [load])

  const pending    = payments.filter(p => ['pending', 'pending_cod'].includes(p.status))
  const historical = payments.filter(p => !['pending', 'pending_cod'].includes(p.status))

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div>
      {/* Header + filters */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'var(--slate)', margin:0 }}>
            💳 Payments
            {pending.length > 0 && (
              <span style={{ marginLeft:8, fontSize:'0.75rem', fontWeight:800, background:'#e53e3e', color:'white', borderRadius:100, padding:'0.18rem 0.65rem' }}>
                {pending.length} need review
              </span>
            )}
          </h1>
          <p style={{ fontSize:'0.75rem', color:'var(--slate-lt)', marginTop:'0.15rem' }}>Review and confirm pending payments</p>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
          <select value={filterStatus} onChange={e => { setFS(e.target.value); setPage(1) }}
            style={{ padding:'0.4rem 0.8rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.82rem', cursor:'pointer', background:'white' }}>
            <option value="">All statuses</option>
            <option value="pending">Pending (QR/Digital)</option>
            <option value="pending_cod">COD Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed/Rejected</option>
          </select>
          <select value={filterMethod} onChange={e => { setFM(e.target.value); setPage(1) }}
            style={{ padding:'0.4rem 0.8rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.82rem', cursor:'pointer', background:'white' }}>
            <option value="">All methods</option>
            {['esewa','khalti','fonepay','qr','cash','cod'].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <button onClick={() => load()} style={{ padding:'0.4rem 0.9rem', border:'1.5px solid var(--border)', borderRadius:8, fontSize:'0.82rem', cursor:'pointer', background:'white' }}>🔄</button>
        </div>
      </div>

      {/* ── Pending payments — needs review section ── */}
      {pending.length > 0 && (
        <div style={{ marginBottom:'1.5rem' }}>
          <div style={{ fontSize:'0.7rem', fontWeight:800, color:'#e53e3e', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.65rem' }}>
            ⚠ Awaiting Review ({pending.length})
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
            {pending.map(p => (
              <PendingPaymentRow key={p.id} payment={p} onAction={(type) => setModal({ payment: p, type })} />
            ))}
          </div>
        </div>
      )}

      {/* ── All payments table ── */}
      <div style={{ background:'white', borderRadius:12, border:'1px solid var(--border)', overflow:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
          <thead>
            <tr>
              {['Client','Amount','Method','Type','Status','Date','Actions'].map(h => (
                <th key={h} style={{ padding:'0.55rem 0.9rem', textAlign:'left', fontSize:'0.66rem', fontWeight:800, color:'var(--slate-lt)', textTransform:'uppercase', letterSpacing:'0.08em', borderBottom:'1px solid var(--border)', background:'var(--bg)', whiteSpace:'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding:'2.5rem', color:'var(--slate-lt)', fontSize:'0.85rem' }}>Loading…</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:'center', padding:'2.5rem', color:'var(--slate-lt)', fontSize:'0.85rem' }}>No payments found.</td></tr>
            ) : payments.map(p => (
              <tr key={p.id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'0.6rem 0.9rem' }}>
                  <div style={{ fontWeight:600, fontSize:'0.82rem', color:'var(--slate)' }}>{p.client?.full_name || '—'}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--slate-lt)' }}>{p.client?.email}</div>
                </td>
                <td style={{ padding:'0.6rem 0.9rem' }}>
                  <strong style={{ fontSize:'0.85rem' }}>NPR {Number(p.amount).toLocaleString()}</strong>
                </td>
                <td style={{ padding:'0.6rem 0.9rem' }}><MethodBadge method={p.method}/></td>
                <td style={{ padding:'0.6rem 0.9rem', fontSize:'0.78rem', color:'var(--slate-md)' }}>{p.display_label}</td>
                <td style={{ padding:'0.6rem 0.9rem' }}><Badge s={p.status}/></td>
                <td style={{ padding:'0.6rem 0.9rem', fontSize:'0.77rem', color:'var(--slate-lt)' }}>{fmtT(p.created_at)}</td>
                <td style={{ padding:'0.6rem 0.9rem' }}>
                  <ActionButtons payment={p} onAction={(type) => setModal({ payment: p, type })}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'0.5rem', padding:'0.75rem' }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} style={{ padding:'0.28rem 0.7rem', border:'1px solid var(--border)', borderRadius:6, background:'white', cursor:'pointer', fontSize:'0.78rem', opacity: page===1?0.4:1 }}>← Prev</button>
          <span style={{ fontSize:'0.78rem', color:'var(--slate-lt)' }}>{page} / {totalPages} · {total} total</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page>=totalPages} style={{ padding:'0.28rem 0.7rem', border:'1px solid var(--border)', borderRadius:6, background:'white', cursor:'pointer', fontSize:'0.78rem', opacity: page>=totalPages?0.4:1 }}>Next →</button>
        </div>
      )}

      {/* Action modal */}
      {modal && (
        <ActionModal
          payment={modal.payment}
          type={modal.type}
          onClose={() => setModal(null)}
          onDone={load}
        />
      )}
    </div>
  )
}

// ── Pending card (expanded view for needs-review items) ───────────────────────
function PendingPaymentRow({ payment: p, onAction }) {
  const isCOD = p.status === 'pending_cod' || p.is_cod

  return (
    <div style={{ background: isCOD ? '#fff0f8' : '#fff5e6', border:`1.5px solid ${isCOD?'#f5a0d0':'#f5c880'}`, borderRadius:12, padding:'1rem 1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.75rem' }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.3rem', flexWrap:'wrap' }}>
          <strong style={{ fontSize:'0.88rem', color:'var(--slate)' }}>{p.client?.full_name || '—'}</strong>
          <MethodBadge method={p.method}/>
          <Badge s={p.status}/>
        </div>
        <div style={{ fontSize:'0.82rem', color:'var(--slate-md)' }}>
          <strong>NPR {Number(p.amount).toLocaleString()}</strong>
          {p.transaction_id && <span style={{ marginLeft:8, color:'var(--slate-lt)', fontFamily:'monospace', fontSize:'0.75rem' }}>TXN: {p.transaction_id}</span>}
        </div>
        <div style={{ fontSize:'0.75rem', color:'var(--slate-lt)', marginTop:'0.2rem' }}>
          {p.display_label} · Submitted {new Date(p.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
        </div>
      </div>

      <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
        {isCOD ? (
          <>
            <button onClick={() => onAction('cod_confirm')}
              style={{ padding:'0.45rem 1rem', borderRadius:8, border:'none', background:'#1a7a4a', color:'white', fontWeight:700, fontSize:'0.8rem', cursor:'pointer' }}>
              💵 Cash Collected
            </button>
            <button onClick={() => onAction('cod_flag')}
              style={{ padding:'0.45rem 1rem', borderRadius:8, border:'1.5px solid #c0392b', background:'#fff0f0', color:'#c0392b', fontWeight:700, fontSize:'0.8rem', cursor:'pointer' }}>
              🚩 Flag Issue
            </button>
          </>
        ) : (
          <>
            <button onClick={() => onAction('approve')}
              style={{ padding:'0.45rem 1rem', borderRadius:8, border:'none', background:'#1a7a4a', color:'white', fontWeight:700, fontSize:'0.8rem', cursor:'pointer' }}>
              ✅ Approve
            </button>
            <button onClick={() => onAction('reject')}
              style={{ padding:'0.45rem 1rem', borderRadius:8, border:'1.5px solid #c0392b', background:'#fff0f0', color:'#c0392b', fontWeight:700, fontSize:'0.8rem', cursor:'pointer' }}>
              ❌ Reject
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Row-level action buttons (table view) ─────────────────────────────────────
function ActionButtons({ payment: p, onAction }) {
  if (p.status === 'completed' || p.status === 'failed') {
    return <span style={{ fontSize:'0.72rem', color:'var(--slate-lt)' }}>—</span>
  }
  if (p.status === 'pending_cod' || p.is_cod) {
    return (
      <div style={{ display:'flex', gap:'0.3rem' }}>
        <button onClick={() => onAction('cod_confirm')}
          style={{ padding:'0.25rem 0.6rem', border:'none', borderRadius:6, background:'#e8f8f0', color:'#1a7a4a', fontWeight:700, fontSize:'0.72rem', cursor:'pointer' }}>Cash ✓</button>
        <button onClick={() => onAction('cod_flag')}
          style={{ padding:'0.25rem 0.6rem', border:'1px solid #fca5a5', borderRadius:6, background:'#fff0f0', color:'#c0392b', fontWeight:700, fontSize:'0.72rem', cursor:'pointer' }}>Flag</button>
      </div>
    )
  }
  return (
    <div style={{ display:'flex', gap:'0.3rem' }}>
      <button onClick={() => onAction('approve')}
        style={{ padding:'0.25rem 0.6rem', border:'none', borderRadius:6, background:'#e8f8f0', color:'#1a7a4a', fontWeight:700, fontSize:'0.72rem', cursor:'pointer' }}>✅</button>
      <button onClick={() => onAction('reject')}
        style={{ padding:'0.25rem 0.6rem', border:'1px solid #fca5a5', borderRadius:6, background:'#fff0f0', color:'#c0392b', fontWeight:700, fontSize:'0.72rem', cursor:'pointer' }}>❌</button>
    </div>
  )
}
