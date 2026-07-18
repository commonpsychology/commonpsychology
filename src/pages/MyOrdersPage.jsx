// MyOrdersPage.jsx — v2.4
// ✅ Auth guard: uses real useAuth + useRouter from your contexts
//    → loading=true  → render nothing (no flash)
//    → user=null     → navigate('/signin?redirect=/my-orders') instantly
//    → user exists   → render full page
// ✅ Hero overlap fixed via CSS var --navbar-height
// ✅ QR modal shows /payment-qr.png
// ✅ COD confirmation popup

import { useState, useEffect } from 'react'
import { useAuth }   from '../context/AuthContext'
import { useRouter } from '../context/RouterContext'
import { store as storeApi, payments as paymentsApi } from '../services/api'

const C = {
  sky:'#0ea5e9', skyLt:'#e0f2fe', skyDk:'#0369a1',
  white:'#fff', bg:'#f4f8fb', border:'#daeef8',
  mid:'#4a6a7a', slate:'#1a3a4a', green:'#1a7a4a',
  greenLt:'#e8f8f0', red:'#c0392b', redLt:'#fff0f0',
  amber:'#92600a', amberLt:'#fff8e6',
}

const ORDER_STATUS_COLORS = {
  pending:    { bg:'#fff9e6', color:'#8a5a1a' },
  confirmed:  { bg:'#e8f8f0', color:'#1a7a4a' },
  processing: { bg:'#e0f7ff', color:'#007BA8' },
  shipped:    { bg:'#f0e8ff', color:'#5a1a8a' },
  delivered:  { bg:'#e8f8f0', color:'#1a5a3a' },
  cancelled:  { bg:'#fff0f0', color:'#c0392b' },
  refunded:   { bg:'#f0f4f8', color:'#4a6a7a' },
}

const PAYMENT_STATUS_COLORS = {
  unpaid:      { bg:'#f0f4f8', color:'#4a6a7a', icon:'—' },
  pending:     { bg:'#fff9e6', color:'#8a5a1a', icon:'⏳' },
  pending_cod: { bg:'#fff8e6', color:'#92600a', icon:'💵' },
  completed:   { bg:'#e8f8f0', color:'#1a7a4a', icon:'✅' },
  failed:      { bg:'#fff0f0', color:'#c0392b', icon:'❌' },
  refunded:    { bg:'#f0f4f8', color:'#4a6a7a', icon:'↩️' },
}

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after { box-sizing:border-box; margin:0; padding:0 }
body { font-family:'DM Sans',system-ui,sans-serif; background:${C.bg}; min-height:100vh }

:root { --navbar-height:64px }
.mo-wrap { min-height:100vh; background:${C.bg} }

/* ── Hero: padding-top accounts for fixed navbar ── */
.mo-hero {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, rgba(255,255,255,0.9) 0%, rgba(214,238,252,0.7) 55%, rgba(255,255,255,0.88) 100%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(120,190,230,0.4);
  box-shadow: 0 4px 22px rgba(14,165,233,0.10), inset 0 1px 0 rgba(255,255,255,0.6);
  padding: clamp(1.5rem,5vw,2.5rem);
  padding-top: calc(clamp(1.5rem,5vw,2.5rem) + var(--navbar-height,64px));
}
.mo-hero-blob {
  position: absolute;
  pointer-events: none;
  z-index: 0;
}
.mo-hero-blob-1 { width: 50vw; max-width: 520px; top: -22%; left: -8%; animation: moBlob1 24s ease-in-out infinite; }
.mo-hero-blob-2 { width: 38vw; max-width: 400px; top: 5%; right: -6%; animation: moBlob2 28s ease-in-out infinite; }
.mo-hero-blob-3 { width: 32vw; max-width: 340px; bottom: -30%; left: 30%; animation: moBlob3 32s ease-in-out infinite; }
@keyframes moBlob1 { 0%,100% { transform:translate(0,0) scale(1) rotate(0deg) } 50% { transform:translate(2%,4%) scale(1.06) rotate(8deg) } }
@keyframes moBlob2 { 0%,100% { transform:translate(0,0) scale(1) rotate(0deg) } 50% { transform:translate(-3%,3%) scale(1.08) rotate(-10deg) } }
@keyframes moBlob3 { 0%,100% { transform:translate(0,0) scale(1) rotate(0deg) } 50% { transform:translate(3%,-3%) scale(1.05) rotate(6deg) } }
@media (prefers-reduced-motion: reduce) { .mo-hero-blob { animation:none !important } }
.mo-hero-inner { position:relative; z-index:1 }
.mo-hero-inner { max-width:960px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem }
.mo-hero-left  { display:flex; align-items:center; gap:1rem; flex-wrap:wrap }
.mo-hero-icon  { width:52px; height:52px; border-radius:14px; background:rgba(14,165,233,.10); border:2px solid rgba(14,165,233,.25); display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0 }
.mo-hero-title { font-family:'Fraunces',Georgia,serif; font-size:clamp(1.3rem,5vw,1.9rem); color:#0f3a52; font-weight:500; line-height:1.1 }
.mo-hero-sub   { font-size:.8rem; color:#5a7c8f; margin-top:.25rem }
.mo-back-btn   { padding:.45rem 1rem; border-radius:9px; border:1.5px solid rgba(14,165,233,.3); background:rgba(255,255,255,.55); color:#0369a1; font-size:.8rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all .15s; flex-shrink:0; white-space:nowrap }
.mo-back-btn:hover { background:rgba(255,255,255,.85) }

/* ── Stats ── */
.mo-stats { background:#fff; border-bottom:1px solid ${C.border}; padding:.75rem clamp(1rem,4vw,2rem) }
.mo-stats-inner { max-width:960px; margin:0 auto; display:flex; gap:1.5rem; overflow-x:auto; scrollbar-width:none }
.mo-stats-inner::-webkit-scrollbar { display:none }
.mo-stat     { display:flex; flex-direction:column; align-items:center; min-width:80px; gap:.15rem }
.mo-stat-num { font-family:'Fraunces',Georgia,serif; font-size:1.3rem; font-weight:500; color:${C.sky} }
.mo-stat-lbl { font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:${C.mid}; white-space:nowrap }
.mo-stat-divider { width:1px; background:${C.border}; align-self:stretch; flex-shrink:0 }

/* ── Tabs ── */
.mo-tabs { background:#fff; border-bottom:1px solid ${C.border}; overflow-x:auto; scrollbar-width:none }
.mo-tabs::-webkit-scrollbar { display:none }
.mo-tabs-inner { max-width:960px; margin:0 auto; display:flex; padding:0 clamp(1rem,4vw,2rem) }
.mo-tab { padding:.85rem 1.25rem; border:none; background:none; font-family:inherit; font-size:.83rem; cursor:pointer; border-bottom:2.5px solid transparent; color:${C.mid}; font-weight:500; white-space:nowrap; transition:all .2s; flex-shrink:0 }
.mo-tab.active { color:${C.sky}; font-weight:700; border-bottom-color:${C.sky} }

/* ── Main ── */
.mo-main { max-width:960px; margin:0 auto; padding:clamp(1rem,4vw,2rem) }

/* ── Order card ── */
.mo-card { background:linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.8) 100%); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,0.6); border-radius:14px; overflow:hidden; margin-bottom:.85rem; box-shadow:0 4px 18px rgba(14,165,233,0.10), inset 0 1px 0 rgba(255,255,255,0.55); transition:all .2s }
.mo-card.open { border-color:rgba(14,165,233,0.4); box-shadow:0 8px 26px rgba(14,165,233,.14), inset 0 1px 0 rgba(255,255,255,0.6) }
.mo-card-header { display:flex; align-items:center; justify-content:space-between; padding:.95rem 1.1rem; cursor:pointer; flex-wrap:wrap; gap:.5rem; transition:background .15s }
.mo-card-header:hover { background:rgba(255,255,255,0.3) }
.mo-card-header.open  { background:rgba(255,255,255,0.4) }
.mo-card-icon { width:38px; height:38px; border-radius:10px; background:rgba(255,255,255,0.6); display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; transition:all .2s }
.mo-card-icon.open { background:linear-gradient(135deg,${C.sky} 0%,#7dd3fc 100%) }

/* ── Timeline ── */
.mo-timeline { display:flex; align-items:center; padding:.85rem 1.1rem .65rem; border-top:1px solid ${C.border}; background:${C.bg}; overflow-x:auto; scrollbar-width:none }
.mo-timeline::-webkit-scrollbar { display:none }
.st-step  { display:flex; flex-direction:column; align-items:center; flex:1; min-width:52px }
.st-dot   { width:22px; height:22px; border-radius:50%; border:2px solid ${C.border}; background:#fff; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; z-index:1; flex-shrink:0; transition:all .2s }
.st-dot.done      { background:${C.sky}; border-color:${C.sky}; color:#fff }
.st-dot.active    { border-color:${C.sky}; color:${C.sky}; box-shadow:0 0 0 3px rgba(0,123,168,.15) }
.st-dot.cancelled { background:#fff0f0; border-color:#c0392b; color:#c0392b }
.st-label { font-size:10px; color:#7a9aaa; margin-top:5px; text-align:center; white-space:nowrap; font-weight:400; transition:all .2s }
.st-label.done      { color:${C.sky}; font-weight:700 }
.st-label.active    { color:#1a3a4a; font-weight:700 }
.st-label.cancelled { color:#c0392b; font-weight:700 }
.st-line { flex:1; height:2px; background:${C.border}; margin-bottom:18px; min-width:12px; transition:background .3s }
.st-line.done { background:${C.sky} }

/* ── Payment status ── */
.ps-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:.85rem }
.ps-card { background:#fff; border:1.5px solid ${C.border}; border-radius:12px; padding:1rem; display:flex; flex-direction:column; gap:.5rem }
.ps-badge { display:inline-flex; align-items:center; gap:4px; padding:.2rem .65rem; border-radius:100px; font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.07em }
.ps-admin-note { font-size:.72rem; color:${C.mid}; font-style:italic; border-left:2px solid ${C.border}; padding-left:.5rem; margin-top:.25rem }
.ps-timeline-mini { display:flex; align-items:center; gap:.4rem; margin-top:.35rem }
.ps-dot { width:8px; height:8px; border-radius:50%; background:${C.border}; flex-shrink:0; transition:background .2s }
.ps-dot.done { background:${C.sky} }
.ps-line-mini { flex:1; height:2px; background:${C.border}; transition:background .2s }
.ps-line-mini.done { background:${C.sky} }

/* ── QR modal ── */
.qr-overlay { position:fixed; inset:0; background:rgba(10,25,40,.6); backdrop-filter:blur(6px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn .2s ease }
@keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
@keyframes slideUp { from { transform:translateY(16px); opacity:0 } to { transform:translateY(0); opacity:1 } }
.qr-modal  { background:#fff; border-radius:20px; width:100%; max-width:380px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 80px rgba(0,0,0,.18); animation:slideUp .24s cubic-bezier(.22,1,.36,1) }
.qr-header { padding:1.1rem 1.25rem 1rem; border-bottom:1px solid ${C.border}; display:flex; align-items:center; justify-content:space-between }
.qr-close  { width:28px; height:28px; border-radius:50%; border:1.5px solid ${C.border}; background:transparent; cursor:pointer; font-size:.85rem; color:${C.mid}; display:flex; align-items:center; justify-content:center; transition:all .15s }
.qr-close:hover { background:${C.bg} }
.qr-body   { padding:1.1rem 1.25rem }
.qr-img-wrap { display:flex; justify-content:center; margin-bottom:1rem }
.qr-img    { width:200px; height:200px; object-fit:contain; border-radius:12px; border:2px solid ${C.border}; background:#fff; padding:6px; display:block }
.qr-order-summary { background:${C.bg}; border-radius:8px; border:1px solid ${C.border}; padding:.75rem 1rem; margin-bottom:1rem; font-size:.8rem; color:${C.mid} }
.qr-order-row { display:flex; justify-content:space-between; padding:.15rem 0 }
.qr-order-key { font-weight:600 }
.qr-order-val { color:${C.slate}; font-weight:700 }

/* ── COD modal ── */
.cod-overlay { position:fixed; inset:0; background:rgba(10,25,40,.6); backdrop-filter:blur(6px); z-index:10000; display:flex; align-items:center; justify-content:center; padding:1rem; animation:fadeIn .2s ease }
.cod-modal   { background:#fff; border-radius:20px; width:100%; max-width:400px; box-shadow:0 24px 80px rgba(0,0,0,.18); animation:slideUp .24s cubic-bezier(.22,1,.36,1); overflow:hidden }
.cod-top     { background:linear-gradient(135deg,${C.sky} 0%,#00BFFF 100%); padding:1.5rem; text-align:center }
.cod-body    { padding:1.5rem }
.cod-actions { display:flex; gap:.65rem; padding:1rem 1.5rem 1.5rem }

/* ── Auth loading screen ── */
.mo-auth-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${C.bg};
}
.mo-auth-spinner {
  width: 36px; height: 36px;
  border: 3px solid ${C.border};
  border-top-color: ${C.sky};
  border-radius: 50%;
  animation: moSpin .7s linear infinite;
}
@keyframes moSpin { to { transform: rotate(360deg) } }

/* ── Misc ── */
.mo-empty     { text-align:center; padding:3rem 1rem }
.mo-empty-icon { font-size:3rem; opacity:.25; margin-bottom:1rem }
.mo-btn-primary { padding:.65rem 1.5rem; border-radius:10px; border:none; background:linear-gradient(135deg,${C.sky} 0%,#00BFFF 100%); color:#fff; font-weight:700; font-size:.88rem; cursor:pointer; font-family:inherit }
.mo-btn-ghost   { padding:.45rem 1rem; border-radius:8px; border:1.5px solid ${C.border}; background:none; color:${C.mid}; font-size:.78rem; cursor:pointer; font-family:inherit; transition:all .15s }
.mo-btn-ghost:hover  { border-color:${C.sky}; color:${C.sky} }
.mo-btn-danger  { padding:.7rem 1.5rem; border-radius:10px; border:none; background:${C.red}; color:#fff; font-weight:700; font-size:.88rem; cursor:pointer; font-family:inherit; flex:1 }
.mo-btn-cancel  { padding:.7rem 1.5rem; border-radius:10px; border:1.5px solid ${C.border}; background:none; color:${C.mid}; font-size:.88rem; cursor:pointer; font-family:inherit; flex:1 }

@media(max-width:600px) {
  .ps-grid { grid-template-columns:1fr }
  .mo-hero-icon { display:none }
  .qr-img { width:170px; height:170px }
}
`

function injectCSS(id, css) {
  if (document.getElementById(id)) return
  const s = document.createElement('style')
  s.id = id; s.textContent = css
  document.head.appendChild(s)
}

/* ── Status Timeline ── */
function StatusTimeline({ status }) {
  const norm        = (status || 'pending').toLowerCase()
  const isCancelled = norm === 'cancelled' || norm === 'refunded'
  const activeIdx   = STATUS_STEPS.indexOf(norm)
  return (
    <div className="mo-timeline">
      {STATUS_STEPS.map((step, i) => {
        const done     = !isCancelled && i < activeIdx
        const active   = !isCancelled && i === activeIdx
        const cancelAt = isCancelled && i === 1
        return (
          <div key={step} style={{ display:'flex', alignItems:'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 'none' }}>
            <div className="st-step" style={{ opacity: isCancelled && i > 1 ? 0.3 : 1 }}>
              <div className={`st-dot${done ? ' done' : active ? ' active' : cancelAt ? ' cancelled' : ''}`}>
                {done && '✓'}{cancelAt && '✕'}
              </div>
              <div className={`st-label${done ? ' done' : active ? ' active' : cancelAt ? ' cancelled' : ''}`}>
                {step === 'pending' ? 'Placed' : step.charAt(0).toUpperCase() + step.slice(1)}
              </div>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className={`st-line${done ? ' done' : ''}`} style={{ opacity: isCancelled && i >= 1 ? 0.25 : 1 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── QR Modal ── */
function QRModal({ order, onClose }) {
  const orderRef = order?.order_number || ('#' + order?.id?.slice(0, 8).toUpperCase())
  const amount   = Number(order?.total_amount || 0)
  return (
    <div className="qr-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="qr-modal" onClick={e => e.stopPropagation()}>
        <div className="qr-header">
          <div style={{ display:'flex', alignItems:'center', gap:'.6rem' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:`linear-gradient(135deg,${C.sky} 0%,#00BFFF 100%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.9rem' }}>📲</div>
            <div>
              <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:'.9rem', color:C.slate, fontWeight:500 }}>Scan to Pay</div>
              <div style={{ fontSize:'.62rem', color:'#7a9aaa' }}>eSewa · Khalti · FonePay</div>
            </div>
          </div>
          <button className="qr-close" onClick={onClose}>✕</button>
        </div>
        <div className="qr-body">
          <div className="qr-img-wrap">
            <img src="/payment-qr.png" alt="Payment QR Code" className="qr-img" />
          </div>
          <div className="qr-order-summary">
            <div style={{ fontSize:'.62rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', color:'#7a9aaa', marginBottom:'.4rem' }}>Order Details</div>
            {[
              ['Merchant', 'Common Psychology'],
              ['Order',    orderRef],
              ['Amount',   `NPR ${amount.toLocaleString()}`],
            ].map(([k, v]) => (
              <div className="qr-order-row" key={k}>
                <span className="qr-order-key">{k}</span>
                <span className="qr-order-val">{v}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize:'.72rem', color:'#7a9aaa', textAlign:'center', lineHeight:1.5 }}>
            Open <strong>eSewa</strong>, <strong>Khalti</strong>, or your bank app.<br />
            Tap <strong>Scan QR</strong> → scan → enter <strong>NPR {amount.toLocaleString()}</strong>.<br />
            Share your payment screenshot with us after paying.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── COD Confirmation Modal ── */
function CODConfirmModal({ order, onConfirm, onClose }) {
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState(null)
  async function handleConfirm() {
    setConfirming(true)
    setError(null)
    try {
      await paymentsApi.initiate({
        order_id: order.id,
        amount: order.total_amount,
        method: 'cod',
      })
      onConfirm()
    } catch (err) {
      setError(err.message || 'Could not confirm COD order.')
      setConfirming(false)
    }
  }
  return (
    <div className="cod-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="cod-modal" onClick={e => e.stopPropagation()}>
        <div className="cod-top">
          <div style={{ fontSize:'2.5rem', marginBottom:'.5rem' }}>💵</div>
          <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:'1.2rem', color:'#fff', fontWeight:500 }}>Confirm Cash on Delivery</div>
          <div style={{ fontSize:'.8rem', color:'rgba(255,255,255,.8)', marginTop:'.25rem' }}>Order {order?.order_number || '#' + order?.id?.slice(0, 8).toUpperCase()}</div>
        </div>
        <div className="cod-body">
          <div style={{ background:C.amberLt, border:`1px solid #f5d87a`, borderRadius:8, padding:'.85rem 1rem', marginBottom:'1rem', fontSize:'.82rem', color:C.amber, lineHeight:1.6 }}>
            ⚠️ By confirming, you agree to pay <strong>NPR {Number(order?.total_amount || 0).toLocaleString()}</strong> in cash upon delivery. Your order will be held for <strong>24 hours</strong> pending team confirmation.
          </div>
          <div style={{ background:C.bg, borderRadius:8, padding:'.75rem 1rem', fontSize:'.8rem', color:C.mid, lineHeight:1.7 }}>
            {[
              ['Order total',    `NPR ${Number(order?.total_amount || 0).toLocaleString()}`],
              ['Payment method', 'Cash / COD'],
              ['Items',          `${(order?.order_items || order?.items || []).length} item(s)`],
            ].map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontWeight:600 }}>{k}</span>
                <span style={{ color:C.slate, fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        {error && (
          <div style={{ padding:'0 1.5rem', marginTop:'-.5rem', marginBottom:'.75rem', fontSize:'.78rem', color:C.red }}>{error}</div>
        )}
        <div className="cod-actions">
          <button className="mo-btn-cancel" onClick={onClose} disabled={confirming}>Cancel</button>
          <button className="mo-btn-danger" onClick={handleConfirm} disabled={confirming}>
            {confirming ? 'Confirming…' : '✓ Confirm COD Order'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Payment Status Tab ── */
function PaymentStatusTab({ orders }) {
  const steps = ['initiated', 'processing', 'verified', 'completed']
  if (!orders.length) return (
    <div className="mo-empty">
      <div className="mo-empty-icon">💳</div>
      <p style={{ color:C.mid, fontSize:'.9rem' }}>No payment records yet.</p>
    </div>
  )


  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'.5rem' }}>
        <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", color:C.slate, fontSize:'clamp(1rem,3vw,1.15rem)', fontWeight:500 }}>Payment Status</h2>
        <div style={{ fontSize:'.72rem', background:C.amberLt, border:`1px solid #f5d87a`, borderRadius:6, padding:'.25rem .65rem', color:C.amber }}>🔔 Status updated by admin</div>
      </div>
      <div className="ps-grid">
        {orders.map(order => {
          const ps          = (order.payment_status || 'unpaid').toLowerCase()
          const os          = (order.status || 'pending').toLowerCase()
          const s           = PAYMENT_STATUS_COLORS[ps] || PAYMENT_STATUS_COLORS.pending
          const currentStep = ps === 'completed' ? 3 : ps === 'pending_cod' ? 2 : ps === 'pending' ? 0 : ps === 'unpaid' ? -1 : ps === 'failed' ? -1 : 1
          return (
            <div className="ps-card" key={order.id}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'.5rem' }}>
                <div style={{ fontSize:'.82rem', fontWeight:700, color:C.slate }}>
                  {order.order_number || `#${order.id?.slice(0, 8).toUpperCase()}`}
                </div>
                <span className="ps-badge" style={{ background:s.bg, color:s.color }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor', opacity:.75, display:'inline-block', flexShrink:0 }} />
                  {s.icon} {ps}
                </span>
              </div>
              <div style={{ fontSize:'.72rem', color:'#7a9aaa' }}>
                NPR {Number(order.total_amount || 0).toLocaleString()} · {new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}
              </div>
              <div className="ps-timeline-mini">
                {steps.map((step, i) => (
                  <div key={step} style={{ display:'flex', alignItems:'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                    <div className={`ps-dot${i <= currentStep ? ' done' : ''}`}
                      style={{ background: currentStep === -1 ? (i === 0 ? C.red : C.border) : i <= currentStep ? C.sky : C.border }}
                      title={step} />
                    {i < steps.length - 1 && <div className={`ps-line-mini${i < currentStep ? ' done' : ''}`} />}
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.62rem', color:'#aac0cc', marginTop:'.15rem' }}>
                {steps.map(s => <span key={s} style={{ textAlign:'center', flex:1 }}>{s}</span>)}
              </div>
              {order.payment_admin_note && <div className="ps-admin-note">💬 {order.payment_admin_note}</div>}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'.25rem' }}>
                <span style={{ fontSize:'.68rem', color:'#7a9aaa' }}>Order: <strong style={{ color:C.mid }}>{os}</strong></span>
                {order.payment_method && <span style={{ fontSize:'.68rem', color:'#7a9aaa', background:C.bg, borderRadius:4, padding:'.1rem .4rem' }}>{order.payment_method}</span>}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ marginTop:'1.5rem', background:C.bg, borderRadius:10, border:`1px solid ${C.border}`, padding:'1rem', display:'flex', flexWrap:'wrap', gap:'.75rem' }}>
        <div style={{ fontSize:'.68rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.08em', color:C.mid, width:'100%' }}>Payment Status Guide</div>
        {Object.entries(PAYMENT_STATUS_COLORS).map(([key, val]) => (
          <span key={key} className="ps-badge" style={{ background:val.bg, color:val.color, fontSize:'.6rem', padding:'.15rem .5rem' }}>{val.icon} {key}</span>
        ))}
      </div>
    </div>
  )
}

/* ── Order Card ── */
function OrderCard({ order, onShowQR, onCODConfirm }) {
  const [isOpen, setIsOpen] = useState(false)
  const items       = order.order_items || order.items || []
  const status      = (order.status || 'pending').toLowerCase()
  const isCancelled = status === 'cancelled' || status === 'refunded'
  const psColor     = ORDER_STATUS_COLORS[status] || { bg:'#f0f4f8', color:C.mid }
  const fmt         = d => new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })

  return (
    <div className={`mo-card${isOpen ? ' open' : ''}`}>
      <div className={`mo-card-header${isOpen ? ' open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display:'flex', alignItems:'center', gap:'.85rem' }}>
          <div className={`mo-card-icon${isOpen ? ' open' : ''}`}>
            <span style={{ color: isOpen ? '#fff' : 'inherit' }}>📦</span>
          </div>
          <div>
            <div style={{ fontWeight:700, color:C.slate, fontSize:'.88rem' }}>
              {order.order_number || `#${order.id?.slice(0, 8).toUpperCase()}`}
            </div>
            <div style={{ fontSize:'.72rem', color:'#7a9aaa', marginTop:1 }}>
              {fmt(order.created_at)}{items.length > 0 && ` · ${items.length} item${items.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'.65rem', flexShrink:0 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'.2rem .65rem', borderRadius:100, fontSize:'.68rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'.07em', background:psColor.bg, color:psColor.color }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'currentColor', opacity:.75, display:'inline-block' }} />
            {status}
          </span>
          <div style={{ fontWeight:800, color:C.slate, fontSize:'.92rem' }}>NPR {Number(order.total_amount || 0).toLocaleString()}</div>
          <span style={{ fontSize:'.75rem', color:'#7a9aaa', display:'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▾</span>
        </div>
      </div>

      <StatusTimeline status={status} />

      {isOpen && (
        <div style={{ borderTop:`1px solid ${C.border}`, padding:'1.1rem' }}>
          {isCancelled && (
            <div style={{ background:C.redLt, border:`1px solid #f5c4c4`, borderRadius:8, padding:'.65rem .9rem', marginBottom:'1rem', fontSize:'.82rem', color:C.red, display:'flex', alignItems:'center', gap:'.5rem' }}>
              <span>✕</span>
              <span>This order was <strong>{status}</strong>{status === 'refunded' ? ' — a refund has been processed.' : ' before processing.'}</span>
            </div>
          )}

          <div style={{ display:'flex', gap:'.5rem', marginBottom:'1rem', flexWrap:'wrap' }}>
            <button onClick={() => onShowQR(order)} style={{ padding:'.4rem .85rem', borderRadius:8, border:`1.5px solid ${C.sky}`, background:'none', color:C.sky, fontSize:'.75rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
              📲 Scan to Pay
            </button>
            {(status === 'pending' || status === 'confirmed') && (
              <button onClick={() => onCODConfirm(order)} style={{ padding:'.4rem .85rem', borderRadius:8, border:`1.5px solid #f5d87a`, background:C.amberLt, color:C.amber, fontSize:'.75rem', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                💵 Confirm COD
              </button>
            )}
          </div>

          {items.length > 0 ? (
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:'.68rem', fontWeight:800, color:C.mid, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'.6rem' }}>Items</div>
              {items.map((item, idx) => {
                const unitPrice = Number(item.unit_price || item.price || 0)
                const qty       = Number(item.quantity || 1)
                const lineTotal = Number(item.total_price || item.line_total || (unitPrice * qty) || 0)
                return (
                  <div key={item.id || idx} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.5rem 0', borderBottom: idx < items.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'.85rem', fontWeight:600, color:C.slate, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration: isCancelled ? 'line-through' : 'none', opacity: isCancelled ? .6 : 1 }}>
                        {item.products?.name || item.product_name || item.name || `Product #${String(item.product_id || '').slice(0, 6) || '—'}`}
                      </div>
                      <div style={{ fontSize:'.72rem', color:'#7a9aaa', marginTop:1 }}>NPR {unitPrice.toLocaleString()} × {qty}</div>
                    </div>
                    <div style={{ fontWeight:700, color: isCancelled ? '#7a9aaa' : C.sky, fontSize:'.85rem', flexShrink:0, marginLeft:'.75rem', textDecoration: isCancelled ? 'line-through' : 'none' }}>
                      NPR {lineTotal.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize:'.8rem', color:'#7a9aaa', marginBottom:'1rem' }}>No item details available.</p>
          )}

          {(() => {
            const subtotal = Number(order.subtotal || order.sub_total || 0)
            const discount = Number(order.discount_amount || order.discount || 0)
            const tax      = Number(order.tax_amount || order.tax || 0)
            const shipping = Number(order.shipping_amount || order.shipping || 0)
            const total    = Number(order.total_amount || order.total || 0)
            const calcSub  = subtotal > 0 ? subtotal : items.reduce((s, i) => s + (Number(i.total_price || i.line_total || 0) || Number(i.unit_price || i.price || 0) * Number(i.quantity || 1)), 0)
            const rows     = [['Subtotal', calcSub], discount > 0 && ['Discount', discount, true], tax > 0 && ['Tax', tax], shipping > 0 && ['Shipping', shipping]].filter(Boolean)
            return (
              <div style={{ background:C.bg, borderRadius:8, padding:'.75rem 1rem', marginBottom:'1rem', display:'flex', flexDirection:'column', gap:'.3rem' }}>
                {rows.map(([label, val, isDiscount]) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:'.8rem', color:C.mid }}>
                    <span>{label}</span>
                    <span style={{ color: isDiscount ? C.green : 'inherit' }}>{isDiscount ? '− ' : ''}NPR {Number(val || 0).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.9rem', fontWeight:800, color:C.slate, borderTop:`1px solid ${C.border}`, paddingTop:'.4rem', marginTop:'.2rem' }}>
                  <span>{isCancelled ? 'Order Total' : 'Total Paid'}</span>
                  <span style={{ textDecoration: isCancelled ? 'line-through' : 'none', opacity: isCancelled ? .5 : 1 }}>NPR {total.toLocaleString()}</span>
                </div>
                {status === 'refunded' && (
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.88rem', fontWeight:700, color:C.green, paddingTop:'.3rem' }}>
                    <span>Refund Processed</span><span>NPR {total.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )
          })()}

          {order.notes && <div style={{ fontSize:'.8rem', color:'#7a9aaa', fontStyle:'italic' }}>Note: {order.notes}</div>}
          {order.coupon_code && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:'.4rem', marginTop:'.65rem', background:C.greenLt, color:C.green, borderRadius:100, padding:'.2rem .65rem', fontSize:'.75rem', fontWeight:700 }}>
              🎫 Coupon: {order.coupon_code}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   Auth flow (mirrors useAuthGuard from AuthContext):
     1. loading=true  → spinner only, render nothing else
     2. !user         → navigate to /signin immediately
     3. user exists   → render full page
═══════════════════════════════════════════════════════════ */
export default function MyOrdersPage() {
useEffect(() => {
    injectCSS('mo-css', CSS)
    return () => document.getElementById('mo-css')?.remove()
  }, [])
  const { user, loading: authLoading } = useAuth()
  const { navigate }                   = useRouter()

  // ── STEP 1 & 2: Auth guard ────────────────────────────────
  useEffect(() => {
    if (authLoading) return                          // still checking — wait
    if (!user) {
      // Not logged in → redirect to sign-in, preserve return path
      const returnTo = encodeURIComponent(window.location.pathname)
      navigate(`/signin`)
    }
  }, [user, authLoading])

  const [tab,      setTab]      = useState('orders')
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [qrOrder,  setQrOrder]  = useState(null)
  const [codOrder, setCodOrder] = useState(null)
  const [codDone,        setCodDone]        = useState({})
const [showPastOrders, setShowPastOrders] = useState(false)

  // Only fetch orders once auth is confirmed
  useEffect(() => {
    if (!authLoading && user) fetchOrders()
  }, [user, authLoading])

  // Uses the shared API client (storeApi.orders) instead of a raw fetch() —
  // that client already has the correct base URL, auth headers, and
  // token-refresh handling, so this can't drift out of sync with it again.
  async function fetchOrders() {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await storeApi.orders({ limit: 50 })
      const fetched = data.orders || data.data || data.items || []
      setOrders(fetched)
    } catch (err) {
      console.error('Failed to load orders:', err)
      setOrders([])
      setLoadError(err.message || 'Could not load your orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── STEP 1: Show spinner while auth resolves ──────────────
  // Also show spinner if auth resolved but user is null
  // (navigate() is async — keeps screen blank until redirect fires)
  if (authLoading || !user) {
    return (
      <div className="mo-auth-loading">
        <div className="mo-auth-spinner" />
      </div>
    )
  }

  // ── STEP 3: Authenticated — render full page ──────────────
  const stats = {
    total:     orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending:   orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
    spent:     orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').reduce((s, o) => s + Number(o.total_amount || 0), 0),
  }

  return (
    <div className="mo-wrap">
      <div className="mo-hero">
<svg className="mo-hero-blob mo-hero-blob-1" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="rgba(14,165,233,0.10)" d="M300,80 C420,60 540,150 540,280 C540,410 430,500 300,500 C170,500 60,420 60,290 C60,150 180,100 300,80Z" />
        </svg>
        <svg className="mo-hero-blob mo-hero-blob-2" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="rgba(125,211,252,0.18)" d="M280,40 C400,10 520,110 500,250 C480,390 360,470 230,460 C100,450 0,350 20,220 C40,90 160,70 280,40Z" />
        </svg>
        <svg className="mo-hero-blob mo-hero-blob-3" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path fill="rgba(14,165,233,0.14)" d="M320,60 C450,90 530,210 500,330 C470,450 340,520 220,490 C100,460 30,340 60,220 C90,100 190,30 320,60Z" />
        </svg>
        <div className="mo-hero-inner">
          <div className="mo-hero-left">
            <div className="mo-hero-icon">📦</div>
            <div>
              <h1 className="mo-hero-title">My Orders</h1>
              <p className="mo-hero-sub">
Signed in as <strong style={{ color:'#0369a1' }}>                  {user.fullName || user.full_name || user.name || user.email}
                </strong>
              </p>
            </div>
          </div>
          <button className="mo-back-btn" onClick={() => navigate('/account')}>← Back to Account</button>
        </div>
      </div>

      <div className="mo-stats">
        <div className="mo-stats-inner">
          {[
            { num: stats.total,     label: 'Total Orders' },
            { num: stats.delivered, label: 'Delivered' },
            { num: stats.pending,   label: 'In Progress' },
            { num: `NPR ${stats.spent.toLocaleString()}`, label: 'Total Spent' },
          ].map((s, i) => (
            <div key={s.label} style={{ display:'contents' }}>
              {i > 0 && <div className="mo-stat-divider" />}
              <div className="mo-stat">
                <span className="mo-stat-num">{s.num}</span>
                <span className="mo-stat-lbl">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mo-tabs">
        <div className="mo-tabs-inner">
          {[{ id:'orders', label:'📦 My Orders' }, { id:'payment', label:'💳 Payment Status' }].map(t => (
            <button key={t.id} className={`mo-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      <div className="mo-main">
        {tab === 'orders' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'.5rem' }}>
              <h2 style={{ fontFamily:"'Fraunces',Georgia,serif", color:C.slate, fontSize:'clamp(1rem,3vw,1.15rem)', fontWeight:500 }}>
                {loading ? 'Loading…' : `${orders.length} Order${orders.length !== 1 ? 's' : ''}`}
              </h2>
              <button className="mo-btn-ghost" onClick={fetchOrders} disabled={loading}>🔄 Refresh</button>
            </div>
            {loading && (
              <div className="mo-empty">
                <div style={{ fontSize:'2rem', opacity:.3, marginBottom:'1rem' }}>📦</div>
                <p style={{ color:C.mid, fontSize:'.85rem' }}>Loading your orders…</p>
              </div>
            )}
            {!loading && loadError && (
              <div className="mo-empty">
                <div className="mo-empty-icon">⚠️</div>
                <p style={{ color:C.red, marginBottom:'.5rem', fontFamily:"'Fraunces',Georgia,serif", fontSize:'1.05rem' }}>Couldn't load your orders</p>
                <p style={{ color:'#7a9aaa', fontSize:'.85rem', marginBottom:'1.5rem' }}>{loadError}</p>
                <button className="mo-btn-primary" onClick={fetchOrders}>Try Again</button>
              </div>
            )}
            {!loading && !loadError && orders.length === 0 && (
              <div className="mo-empty">
                <div className="mo-empty-icon">📦</div>
                <p style={{ color:C.mid, marginBottom:'.5rem', fontFamily:"'Fraunces',Georgia,serif", fontSize:'1.05rem' }}>No orders yet</p>
                <p style={{ color:'#7a9aaa', fontSize:'.85rem', marginBottom:'1.5rem' }}>When you purchase products, they'll appear here.</p>
                <button className="mo-btn-primary" onClick={() => navigate('/shop')}>Browse Shop →</button>
              </div>
            )}
            {!loading && !loadError && orders.length > 0 && (() => {
  const activeStatuses = ['pending', 'confirmed', 'processing', 'shipped']
  const activeOrders = orders.filter(o => activeStatuses.includes((o.status || '').toLowerCase()))
  const pastOrders   = orders.filter(o => !activeStatuses.includes((o.status || '').toLowerCase()))
  return (
    <>
      {activeOrders.map(order => (
        <OrderCard
          key={order.id}
          order={codDone[order.id] ? { ...order, status:'confirmed' } : order}
          onShowQR={setQrOrder}
          onCODConfirm={setCodOrder}
        />
      ))}
      {pastOrders.length > 0 && (
        <>
          <button onClick={() => setShowPastOrders(v => !v)} style={{
            display:'flex', alignItems:'center', gap:'0.5rem',
            background:'none', border:'none', cursor:'pointer',
            fontSize:'0.78rem', fontWeight:700, color:'#64748b',
            padding:'0.5rem 0', margin:'1rem 0 0.75rem', fontFamily:'inherit' }}>
            <span style={{ display:'inline-flex', width:20, height:20, borderRadius:6,
              background:'#f1f5f9', border:`1px solid ${C.border}`,
              alignItems:'center', justifyContent:'center', fontSize:'0.65rem',
              transition:'transform 0.2s',
              transform: showPastOrders ? 'rotate(90deg)' : 'none' }}>▶</span>
            Past Orders ({pastOrders.length})
          </button>
          {showPastOrders && pastOrders.map(order => (
            <OrderCard
              key={order.id}
              order={codDone[order.id] ? { ...order, status:'confirmed' } : order}
              onShowQR={setQrOrder}
              onCODConfirm={setCodOrder}
            />
          ))}
        </>
      )}
    </>
  )
})()}
          </>
        )}
{tab === 'payment' && !loading && !loadError && (() => {
  const activeStatuses = ['pending', 'confirmed', 'processing', 'shipped']
  const activeOrders = orders.filter(o => activeStatuses.includes((o.status || '').toLowerCase()))
  const pastOrders   = orders.filter(o => !activeStatuses.includes((o.status || '').toLowerCase()))
  return (
    <>
      <PaymentStatusTab orders={activeOrders} />
      {pastOrders.length > 0 && (
        <>
          <button onClick={() => setShowPastOrders(v => !v)} style={{
            display:'flex', alignItems:'center', gap:'0.5rem',
            background:'none', border:'none', cursor:'pointer',
            fontSize:'0.78rem', fontWeight:700, color:'#64748b',
            padding:'0.5rem 0', margin:'1.5rem 0 0.75rem', fontFamily:'inherit' }}>
            <span style={{ display:'inline-flex', width:20, height:20, borderRadius:6,
              background:'#f1f5f9', border:`1px solid ${C.border}`,
              alignItems:'center', justifyContent:'center', fontSize:'0.65rem',
              transition:'transform 0.2s',
              transform: showPastOrders ? 'rotate(90deg)' : 'none' }}>▶</span>
            Past Order Payments ({pastOrders.length})
          </button>
          {showPastOrders && <PaymentStatusTab orders={pastOrders} />}
        </>
      )}
    </>
  )
})()}        {tab === 'payment' && loading && (
          <div className="mo-empty">
            <div style={{ fontSize:'2rem', opacity:.3, marginBottom:'1rem' }}>💳</div>
            <p style={{ color:C.mid, fontSize:'.85rem' }}>Loading…</p>
          </div>
        )}
        {tab === 'payment' && loadError && !loading && (
          <div className="mo-empty">
            <div className="mo-empty-icon">⚠️</div>
            <p style={{ color:C.red, fontSize:'.85rem' }}>{loadError}</p>
          </div>
        )}
      </div>

      {qrOrder  && <QRModal order={qrOrder} onClose={() => setQrOrder(null)} />}
      {codOrder && (
        <CODConfirmModal
          order={codOrder}
          onConfirm={() => { setCodOrder(null); fetchOrders() }}
          onClose={() => setCodOrder(null)}
        />
      )}
    </div>
  )
}

