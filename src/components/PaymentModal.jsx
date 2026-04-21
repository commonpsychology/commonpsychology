// PaymentModal.jsx — v2.7
// ✅ Fixed: metadata spread no longer overwrites amount/method
// ✅ Fixed: amount always sent as integer (Math.round)
// ✅ Fixed: method always sent as backend-expected string
// ✅ Auth guard in PaymentProvider + PaymentModal
// ✅ createPortal COD popup
// ✅ /payment-qr.png → eSewa & Khalti
// ✅ /bank-qr.png    → Bank Transfer & FonePay
// ✅ QR 260px with image-rendering:pixelated

import { useState, useEffect, useCallback, createContext, useContext, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuth }   from '../context/AuthContext'
import { useRouter } from '../context/RouterContext'

const injectCSS = () => {
  if (document.getElementById('psm-css')) return
  const s = document.createElement('style')
  s.id = 'psm-css'
  s.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600&family=DM+Sans:wght@300;400;500;600&display=swap');
:root {
  --psm-display:'Fraunces',Georgia,serif; --psm-body:'DM Sans',system-ui,sans-serif;
  --psm-teal:#007BA8; --psm-teal-lt:#e0f7ff; --psm-teal-dk:#005580;
  --psm-green:#1a7a4a; --psm-green-lt:#e8f8f0;
  --psm-amber:#92600a; --psm-amber-lt:#fff8e6;
  --psm-red:#c0392b; --psm-red-lt:#fff0f0;
  --psm-slate:#1a3a4a; --psm-slate-md:#2e6080; --psm-slate-lt:#7a9aaa;
  --psm-border:#e2e8f0; --psm-bg:#f0f4f8; --psm-white:#ffffff;
  --psm-radius:14px; --psm-radius-sm:8px;
  --psm-shadow:0 24px 80px rgba(0,0,0,.18),0 4px 16px rgba(0,0,0,.08);
}
.psm-overlay { position:fixed; inset:0; background:rgba(10,25,40,.6); backdrop-filter:blur(6px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:1rem; animation:psmFadeIn .2s ease }
@keyframes psmFadeIn  { from { opacity:0 }              to { opacity:1 } }
@keyframes psmSlideUp { from { transform:translateY(16px); opacity:0 } to { transform:translateY(0); opacity:1 } }
@keyframes psmSpin    { to { transform:rotate(360deg) } }
.psm-modal { background:var(--psm-white); border-radius:20px; width:100%; max-width:520px; max-height:92vh; overflow-y:auto; box-shadow:var(--psm-shadow); animation:psmSlideUp .24s cubic-bezier(.22,1,.36,1); font-family:var(--psm-body) }
.psm-modal::-webkit-scrollbar { width:4px } .psm-modal::-webkit-scrollbar-thumb { background:#ddd; border-radius:4px }
.psm-header { padding:1.5rem 1.5rem 1rem; border-bottom:1px solid var(--psm-border) }
.psm-header-top { display:flex; justify-content:space-between; align-items:flex-start }
.psm-brand { display:flex; align-items:center; gap:.6rem }
.psm-brand-icon { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,var(--psm-teal) 0%,#00BFFF 100%); display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0 }
.psm-brand-text { font-family:var(--psm-display); font-size:1rem; color:var(--psm-slate); line-height:1.1 }
.psm-brand-sub  { font-size:.68rem; color:var(--psm-slate-lt) }
.psm-close { width:30px; height:30px; border-radius:50%; border:1.5px solid var(--psm-border); background:transparent; cursor:pointer; font-size:.9rem; color:var(--psm-slate-lt); display:flex; align-items:center; justify-content:center; transition:all .15s; flex-shrink:0 }
.psm-close:hover { background:var(--psm-bg); color:var(--psm-slate) }
.psm-summary { background:var(--psm-bg); border-radius:var(--psm-radius-sm); padding:1rem; margin-top:1rem }
.psm-summary-label { font-size:.63rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--psm-slate-lt); margin-bottom:.6rem }
.psm-summary-row { display:flex; justify-content:space-between; align-items:center; padding:.3rem 0; font-size:.82rem; color:var(--psm-slate-md) }
.psm-summary-row.total { border-top:1px solid var(--psm-border); margin-top:.4rem; padding-top:.55rem; font-weight:700; color:var(--psm-slate); font-size:.92rem }
.psm-coupon-row { display:flex; gap:.5rem; margin-top:.75rem }
.psm-coupon-inp { flex:1; padding:.45rem .75rem; border:1.5px solid var(--psm-border); border-radius:8px; font-size:.8rem; font-family:var(--psm-body); color:var(--psm-slate); outline:none; transition:border .15s }
.psm-coupon-inp:focus { border-color:var(--psm-teal) }
.psm-coupon-btn { padding:.45rem .85rem; border-radius:8px; font-family:var(--psm-body); font-size:.78rem; font-weight:600; border:1.5px solid var(--psm-teal); color:var(--psm-teal); background:transparent; cursor:pointer; transition:all .15s; white-space:nowrap }
.psm-coupon-btn:hover { background:var(--psm-teal-lt) }
.psm-coupon-success { font-size:.73rem; color:var(--psm-green); font-weight:600; margin-top:.35rem }
.psm-coupon-error   { font-size:.73rem; color:var(--psm-red); margin-top:.35rem }
.psm-body { padding:1.25rem 1.5rem }
.psm-section-label { font-size:.63rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--psm-slate-lt); margin-bottom:.85rem }
.psm-gateway-grid { display:grid; grid-template-columns:1fr 1fr; gap:.6rem; margin-bottom:1.25rem }
.psm-gw { border:2px solid var(--psm-border); border-radius:var(--psm-radius-sm); padding:.75rem; cursor:pointer; background:var(--psm-white); display:flex; align-items:center; gap:.6rem; transition:all .15s; position:relative }
.psm-gw:hover { border-color:var(--psm-teal); background:var(--psm-teal-lt) }
.psm-gw.active { border-color:var(--psm-teal); background:var(--psm-teal-lt); box-shadow:0 0 0 3px rgba(0,123,168,.12) }
.psm-gw.active .psm-gw-check { opacity:1; background:var(--psm-teal) }
.psm-gw-icon { font-size:1.3rem; flex-shrink:0 }
.psm-gw-info { flex:1; min-width:0 }
.psm-gw-name { font-size:.8rem; font-weight:600; color:var(--psm-slate) }
.psm-gw-sub  { font-size:.68rem; color:var(--psm-slate-lt); white-space:nowrap; overflow:hidden; text-overflow:ellipsis }
.psm-gw-check { width:16px; height:16px; border-radius:50%; border:1.5px solid var(--psm-border); display:flex; align-items:center; justify-content:center; flex-shrink:0; opacity:0; transition:all .15s }
.psm-gw-check::after { content:'✓'; color:white; font-size:.6rem; font-weight:800 }
.psm-gw-badge { position:absolute; top:-.4rem; right:.5rem; font-size:.58rem; font-weight:800; text-transform:uppercase; letter-spacing:.06em; background:var(--psm-green); color:white; padding:.1rem .4rem; border-radius:100px }
.psm-panel { background:var(--psm-bg); border-radius:var(--psm-radius-sm); border:1px solid var(--psm-border); padding:1.1rem; margin-bottom:1rem; animation:psmFadeIn .18s ease }
.psm-panel-title { font-size:.75rem; font-weight:700; color:var(--psm-slate-md); margin-bottom:.9rem; display:flex; align-items:center; gap:.4rem }
.psm-amount-banner { background:linear-gradient(135deg,var(--psm-teal) 0%,#00BFFF 100%); border-radius:10px; padding:.75rem 1rem; display:flex; justify-content:space-between; align-items:center; margin-bottom:.85rem }
.psm-amount-label  { font-size:.68rem; color:rgba(255,255,255,.8); font-weight:600; text-transform:uppercase; letter-spacing:.06em }
.psm-amount-value  { font-family:var(--psm-display); font-size:1.2rem; color:#fff; font-weight:500 }
.psm-amount-meta   { font-size:.7rem; color:rgba(255,255,255,.72); text-align:right; line-height:1.5 }
.psm-qr-img-wrap { display:flex; justify-content:center; margin-bottom:.75rem }
.psm-qr-img {
  width:260px; height:260px; image-rendering:pixelated; object-fit:contain;
  border-radius:12px; border:2px solid var(--psm-border); background:#fff; padding:8px; display:block
}
.psm-qr-hint { text-align:center; font-size:.75rem; color:var(--psm-slate-lt); margin-bottom:.85rem; line-height:1.6 }
.psm-detail-table { background:white; border:1px solid var(--psm-border); border-radius:10px; overflow:hidden; margin-bottom:.85rem }
.psm-detail-row { display:flex; justify-content:space-between; align-items:center; padding:.55rem .9rem; border-bottom:1px solid var(--psm-border); font-size:.82rem }
.psm-detail-row:last-child { border-bottom:none }
.psm-detail-key { color:var(--psm-slate-lt); font-weight:600; flex-shrink:0; margin-right:.5rem }
.psm-detail-val { color:var(--psm-slate); font-weight:700; font-family:monospace; font-size:.78rem; display:flex; align-items:center; gap:.4rem; text-align:right; word-break:break-all }
.psm-copy-btn { font-size:.65rem; color:var(--psm-teal); cursor:pointer; border:1px solid var(--psm-teal); background:var(--psm-teal-lt); border-radius:4px; padding:.1rem .4rem; font-family:var(--psm-body); font-weight:600; flex-shrink:0; transition:all .12s }
.psm-copy-btn:hover { background:var(--psm-teal); color:white }
.psm-info-note { background:var(--psm-amber-lt); border:1px solid #f5d87a; border-radius:8px; padding:.6rem .85rem; font-size:.78rem; color:var(--psm-amber); line-height:1.5; margin-bottom:.85rem }
.psm-field { display:flex; flex-direction:column; gap:.3rem; margin-bottom:.75rem }
.psm-field label { font-size:.67rem; font-weight:700; color:#4a6a7a; text-transform:uppercase; letter-spacing:.08em }
.psm-field input { padding:.52rem .82rem; border:1.5px solid var(--psm-border); border-radius:8px; font-size:.84rem; color:var(--psm-slate); outline:none; font-family:var(--psm-body); transition:border .15s; width:100%; box-sizing:border-box }
.psm-field input:focus { border-color:var(--psm-teal) }
.psm-card-row { display:flex; gap:.6rem } .psm-card-row .psm-field { flex:1 }
.psm-notice { background:var(--psm-amber-lt); border:1px solid #f5d87a; border-radius:var(--psm-radius-sm); padding:.65rem .85rem; font-size:.78rem; color:var(--psm-amber); margin-bottom:1rem; display:flex; gap:.45rem; align-items:flex-start; line-height:1.5 }
.psm-footer { padding:1rem 1.5rem 1.5rem; border-top:1px solid var(--psm-border) }
.psm-pay-btn { width:100%; padding:.9rem; border-radius:var(--psm-radius-sm); font-family:var(--psm-display); font-size:1rem; font-weight:500; cursor:pointer; border:none; background:linear-gradient(135deg,var(--psm-teal) 0%,#00BFFF 100%); color:white; box-shadow:0 4px 16px rgba(0,123,168,.3); transition:all .18s; display:flex; align-items:center; justify-content:center; gap:.5rem }
.psm-pay-btn:hover:not(:disabled) { opacity:.9; transform:translateY(-1px) }
.psm-pay-btn:disabled { opacity:.5; cursor:not-allowed; transform:none }
.psm-secure { display:flex; align-items:center; justify-content:center; gap:.4rem; font-size:.68rem; color:var(--psm-slate-lt); margin-top:.65rem }
.psm-result { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2.5rem 1.5rem; text-align:center; gap:.75rem }
.psm-result-icon { width:64px; height:64px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.8rem }
.psm-result-icon.success { background:var(--psm-green-lt) } .psm-result-icon.error { background:var(--psm-red-lt) }
.psm-result-title { font-family:var(--psm-display); font-size:1.2rem; color:var(--psm-slate) }
.psm-result-sub   { font-size:.83rem; color:var(--psm-slate-lt); max-width:280px; line-height:1.6 }
.psm-result-ref   { font-family:monospace; font-size:.78rem; background:var(--psm-bg); border:1px solid var(--psm-border); border-radius:6px; padding:.35rem .7rem; color:var(--psm-teal-dk) }
.psm-result-btn   { padding:.6rem 1.5rem; border-radius:8px; font-family:var(--psm-body); font-size:.85rem; font-weight:600; cursor:pointer; border:1.5px solid var(--psm-teal); color:var(--psm-teal); background:var(--psm-teal-lt); transition:all .15s }
.psm-result-btn:hover { background:var(--psm-teal); color:white }
.psm-spinner { width:20px; height:20px; border:2.5px solid rgba(255,255,255,.35); border-top-color:white; border-radius:50%; animation:psmSpin .7s linear infinite; flex-shrink:0 }
.psm-progress { height:3px; background:var(--psm-border); border-radius:100px; overflow:hidden; margin-bottom:1rem }
.psm-progress-bar { height:100%; background:linear-gradient(90deg,var(--psm-teal),#00BFFF); border-radius:100px; transition:width .4s ease }
.psm-auth-wall { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2.5rem 2rem; text-align:center; gap:1rem }
.psm-auth-wall-icon { width:64px; height:64px; border-radius:50%; background:var(--psm-bg); display:flex; align-items:center; justify-content:center; font-size:1.8rem; border:2px solid var(--psm-border) }
.psm-auth-wall-title { font-family:var(--psm-display); font-size:1.2rem; color:var(--psm-slate) }
.psm-auth-wall-sub { font-size:.83rem; color:var(--psm-slate-lt); max-width:260px; line-height:1.65 }
.psm-auth-signin-btn { padding:.75rem 1.75rem; border-radius:10px; border:none; background:linear-gradient(135deg,var(--psm-teal) 0%,#00BFFF 100%); color:white; font-family:var(--psm-display); font-size:.95rem; font-weight:500; cursor:pointer; box-shadow:0 4px 14px rgba(0,123,168,.28); transition:all .18s }
.psm-auth-signin-btn:hover { opacity:.9; transform:translateY(-1px) }
.psm-auth-register-link { font-size:.78rem; color:var(--psm-slate-lt) }
.psm-auth-register-link a { color:var(--psm-teal); font-weight:600; text-decoration:none; cursor:pointer }
.psm-cod-overlay { position:fixed; inset:0; background:rgba(8,20,35,.8); backdrop-filter:blur(8px); z-index:10002; display:flex; align-items:center; justify-content:center; padding:1rem; animation:psmFadeIn .18s ease }
.psm-cod-modal { background:white; border-radius:20px; width:100%; max-width:420px; box-shadow:0 32px 100px rgba(0,0,0,.25); animation:psmSlideUp .24s cubic-bezier(.22,1,.36,1); overflow:hidden; font-family:var(--psm-body) }
.psm-cod-hero { background:linear-gradient(135deg,#007BA8 0%,#00BFFF 100%); padding:1.75rem 1.5rem 1.5rem; text-align:center }
.psm-cod-body { padding:1.5rem }
.psm-cod-notice { background:#fff8e6; border:1px solid #f5d87a; border-radius:10px; padding:.9rem 1rem; font-size:.83rem; color:#92600a; line-height:1.65; margin-bottom:1rem }
.psm-cod-row { display:flex; justify-content:space-between; font-size:.83rem; padding:.32rem 0; border-bottom:1px solid #e2e8f0; color:#4a6a7a }
.psm-cod-row:last-child { border-bottom:none }
.psm-cod-row strong { color:#1a3a4a }
.psm-cod-actions { display:flex; gap:.65rem; padding:0 1.5rem 1.5rem }
.psm-cod-confirm { flex:1; padding:.85rem; border-radius:11px; border:none; background:linear-gradient(135deg,#007BA8 0%,#00BFFF 100%); color:white; font-family:var(--psm-display); font-size:.98rem; font-weight:500; cursor:pointer; transition:opacity .15s }
.psm-cod-confirm:disabled { opacity:.6; cursor:not-allowed }
.psm-cod-cancel { padding:.85rem 1.25rem; border-radius:11px; border:1.5px solid #e2e8f0; background:none; color:#7a9aaa; font-family:var(--psm-body); font-size:.85rem; cursor:pointer; transition:all .15s }
.psm-cod-cancel:hover { border-color:#007BA8; color:#007BA8 }
@media(max-width:540px) {
  .psm-modal { border-radius:16px 16px 0 0; max-height:95vh }
  .psm-overlay { align-items:flex-end }
  .psm-gateway-grid { grid-template-columns:1fr }
  .psm-cod-modal { border-radius:16px 16px 0 0 }
  .psm-cod-overlay { align-items:flex-end }
  .psm-qr-img { width:240px; height:240px }
}
`
  document.head.appendChild(s)
}

/* ── Gateways ── */
const GATEWAYS = [
  { id:'esewa',         name:'eSewa',        sub:'Scan QR · NPR',    icon:'🟢', badge:'Popular' },
  { id:'khalti',        name:'Khalti',        sub:'Scan QR · NPR',    icon:'🟣' },
  { id:'fonepay',       name:'FonePay',       sub:'Scan QR · NPR',    icon:'📲' },
  { id:'stripe',        name:'Card',          sub:'Visa / Mastercard', icon:'💳' },
  { id:'bank_transfer', name:'Bank Transfer', sub:'Scan QR · NPR',    icon:'🏦' },
  { id:'cash',          name:'Cash / COD',    sub:'Pay on delivery',   icon:'💵' },
]

const BANK = { name:'Nabil Bank', acct:'Common Psychology Pvt. Ltd.', number:'0600012345678901', swift:'NARBNPKA', branch:'Thamel, Kathmandu' }
const ESEWA_ID   = import.meta.env?.VITE_ESEWA_MERCHANT_ID || 'EPAYTEST'
const FONEPAY_ID = 'PSEPAY001'

/* ── Gateway Panels ── */
function GatewayPanel({ gateway, finalAmount, config, cardName, setCardName, cardNum, setCardNum, cardExp, setCardExp, cardCvc, setCardCvc, copied, copyText }) {
  if (!gateway) return null
  const orderId = config?.metadata?.order_id || config?.metadata?.appointment_id || ('ORD-' + Date.now())
  const remarks = config?.title || 'Payment to Common Psychology'

  const AmountBanner = () => (
    <div className="psm-amount-banner">
      <div>
        <div className="psm-amount-label">Amount to pay</div>
        <div className="psm-amount-value">NPR {finalAmount.toLocaleString()}</div>
      </div>
      <div className="psm-amount-meta">Ref: {orderId}</div>
    </div>
  )

  const DetailTable = ({ rows }) => (
    <div className="psm-detail-table">
      {rows.map(([k, v, copyVal]) => (
        <div className="psm-detail-row" key={k}>
          <span className="psm-detail-key">{k}</span>
          <span className="psm-detail-val">
            {v}
            {copyVal && <button className="psm-copy-btn" onClick={() => copyText(copyVal)}>{copied ? '✓' : 'Copy'}</button>}
          </span>
        </div>
      ))}
    </div>
  )

  const QRHint = ({ text }) => (
    <div className="psm-qr-hint">
      📱 {text}<br />
      Then tap <strong>Confirm Payment</strong> below.
    </div>
  )

  if (gateway.id === 'esewa') return (
    <div className="psm-panel">
      <div className="psm-panel-title">🟢 eSewa Payment</div>
      <AmountBanner />
      <div className="psm-qr-img-wrap">
        <img src="/payment-qr.png" alt="eSewa QR" className="psm-qr-img" />
      </div>
      <QRHint text={`Open eSewa → Scan QR → Pay NPR ${finalAmount.toLocaleString()}`} />
      <DetailTable rows={[
        ['Merchant ID',   ESEWA_ID,       ESEWA_ID],
        ['Merchant Name', 'Common Psychology', null],
      ]} />
    </div>
  )

  if (gateway.id === 'khalti') return (
    <div className="psm-panel">
      <div className="psm-panel-title">🟣 Khalti Payment</div>
      <AmountBanner />
      <div className="psm-qr-img-wrap">
        <img src="/payment-qr.png" alt="Khalti QR" className="psm-qr-img" />
      </div>
      <QRHint text={`Open Khalti → Scan → Pay NPR ${finalAmount.toLocaleString()}`} />
      <DetailTable rows={[
        ['Merchant Name', 'Common Psychology', null],
      ]} />
    </div>
  )

  if (gateway.id === 'fonepay') return (
    <div className="psm-panel">
      <div className="psm-panel-title">📲 FonePay Payment</div>
      <AmountBanner />
      <div className="psm-qr-img-wrap">
        <img src="/bank-qr.png" alt="FonePay QR" className="psm-qr-img" />
      </div>
      <QRHint text={`Open your bank / FonePay app → Scan QR → Pay NPR ${finalAmount.toLocaleString()}`} />
      <DetailTable rows={[
        ['Merchant Name', 'Common Psychology',                        null],
        ['FonePay ID',    FONEPAY_ID,                            FONEPAY_ID],
        ['Amount',        `NPR ${finalAmount.toLocaleString()}`,  String(finalAmount)],
        ['Remarks',       remarks,                                null],
        ['Order Ref',     orderId,                                orderId],
      ]} />
    </div>
  )

  if (gateway.id === 'bank_transfer') return (
    <div className="psm-panel">
      <div className="psm-panel-title">🏦 Bank Transfer</div>
      <AmountBanner />
      <div className="psm-qr-img-wrap">
        <img src="/bank-qr.png" alt="Bank QR" className="psm-qr-img" />
      </div>
      <QRHint text={`Scan QR or transfer to the account below → Pay NPR ${finalAmount.toLocaleString()}`} />
      <DetailTable rows={[
        ['Bank',         BANK.name,   null],
        ['Account Name', BANK.acct,   null],
        ['Account No.',  BANK.number, BANK.number],
        ['SWIFT / BIC',  BANK.swift,  BANK.swift],
        ['Branch',       BANK.branch, null],
      ]} />
    </div>
  )

  if (gateway.id === 'stripe') return (
    <div className="psm-panel">
      <div className="psm-panel-title">💳 Card Details</div>
      <AmountBanner />
      <div className="psm-field"><label>Name on card</label><input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Full name" /></div>
      <div className="psm-field"><label>Card number</label><input value={cardNum} onChange={e => setCardNum(e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} /></div>
      <div className="psm-card-row">
        <div className="psm-field"><label>Expiry</label><input value={cardExp} onChange={e => setCardExp(e.target.value)} placeholder="MM/YY" maxLength={5} /></div>
        <div className="psm-field"><label>CVC</label><input value={cardCvc} onChange={e => setCardCvc(e.target.value)} placeholder="123" maxLength={4} /></div>
      </div>
    </div>
  )

  if (gateway.id === 'cash') return (
    <div className="psm-panel">
      <div className="psm-panel-title">💵 Cash / Pay on Delivery</div>
      <AmountBanner />
      <div className="psm-notice">⚠️ Click <strong>"Review COD Order"</strong> below to confirm. You'll pay <strong>NPR {finalAmount.toLocaleString()}</strong> in cash upon delivery.</div>
    </div>
  )

  return null
}

/* ── COD Portal ── */
function CODConfirmPortal({ finalAmount, config, onConfirm, onCancel }) {
  const [state, setState] = useState('idle')
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])
  return createPortal(
    <div className="psm-cod-overlay" onPointerDown={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="psm-cod-modal" onPointerDown={e => e.stopPropagation()}>
        <div className="psm-cod-hero">
          <div style={{ fontSize:'2.2rem', marginBottom:'.5rem', lineHeight:1 }}>💵</div>
          <div style={{ fontFamily:'var(--psm-display)', fontSize:'1.15rem', color:'#fff', fontWeight:500 }}>Confirm Cash on Delivery?</div>
          <div style={{ fontSize:'.75rem', color:'rgba(255,255,255,.78)', marginTop:'.3rem' }}>{config?.title || 'Your order'}</div>
        </div>
        <div className="psm-cod-body">
          <div className="psm-cod-notice">
            ⚠️ By confirming, you agree to pay <strong style={{ color:'#7a4a00' }}>NPR {finalAmount.toLocaleString()}</strong> in cash on delivery.
            Your order will be held for <strong style={{ color:'#7a4a00' }}>24 hours</strong> pending team confirmation.
          </div>
          <div style={{ background:'#f0f4f8', borderRadius:8, padding:'.75rem 1rem' }}>
            <div className="psm-cod-row"><span>Payment method</span><strong>Cash / COD</strong></div>
            <div className="psm-cod-row"><span>Total amount</span><strong>NPR {finalAmount.toLocaleString()}</strong></div>
            {(config?.itemLines || []).map((item, i) => (
              <div className="psm-cod-row" key={i}><span>{item.label}</span><strong>NPR {Number(item.amount).toLocaleString()}</strong></div>
            ))}
          </div>
        </div>
        <div className="psm-cod-actions">
          <button className="psm-cod-cancel" onClick={onCancel} disabled={state !== 'idle'}>Go back</button>
          <button className="psm-cod-confirm" disabled={state !== 'idle'} onClick={() => { setState('loading'); setTimeout(onConfirm, 700) }}>
            {state === 'loading'
              ? <span style={{ display:'flex', alignItems:'center', gap:'.45rem', justifyContent:'center' }}>
                  <span style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'psmSpin .7s linear infinite', display:'inline-block' }} />
                  Placing…
                </span>
              : '✓ Yes, Place COD Order'
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ── Auth Wall ── */
function AuthWall({ onClose }) {
  const { navigate } = useRouter()
  return (
    <>
      <div className="psm-header">
        <div className="psm-header-top">
          <div className="psm-brand">
            <div className="psm-brand-icon">💳</div>
            <div>
              <div className="psm-brand-text">Secure Checkout</div>
              <div className="psm-brand-sub">Common Psychology</div>
            </div>
          </div>
          <button className="psm-close" onClick={onClose}>✕</button>
        </div>
      </div>
      <div className="psm-auth-wall">
        <div className="psm-auth-wall-icon">🔒</div>
        <div className="psm-auth-wall-title">Sign in to continue</div>
        <div className="psm-auth-wall-sub">You need to be signed in to complete your payment. Your cart will be saved.</div>
        <button className="psm-auth-signin-btn" onClick={() => { onClose(); navigate('/signin') }}>Sign in to My Account</button>
        <div className="psm-auth-register-link">New here? <a onClick={() => { onClose(); navigate('/signup') }}>Create an account</a></div>
      </div>
    </>
  )
}

/* ── Context ── */
const PaymentContext = createContext(null)

export function PaymentProvider({ children }) {
  useEffect(() => { injectCSS() }, [])
  const [config,  setConfig]  = useState(null)
  const [visible, setVisible] = useState(false)
  const resolveRef = useRef(null)

  const openPayment = useCallback((cfg) => new Promise(resolve => {
    resolveRef.current = resolve
    setConfig(cfg)
    setVisible(true)
  }), [])

  const closeModal = useCallback((result = null) => {
    setVisible(false)
    setTimeout(() => setConfig(null), 300)
    if (resolveRef.current) {
      resolveRef.current(result || { success:false, cancelled:true })
      resolveRef.current = null
    }
  }, [])

  const handleResult = useCallback((result) => {
    if (result.success && config?.onSuccess) config.onSuccess(result)
    if (!result.success && config?.onError)  config.onError(result.error)
    if (resolveRef.current) { resolveRef.current(result); resolveRef.current = null }
  }, [config])

  return (
    <PaymentContext.Provider value={{ openPayment }}>
      {children}
      {visible && config && (
        <PaymentModal config={config} onClose={closeModal} onResult={handleResult} />
      )}
    </PaymentContext.Provider>
  )
}

export function usePayment() {
  const ctx = useContext(PaymentContext)
  if (!ctx) throw new Error('usePayment must be used inside <PaymentProvider>')
  return ctx
}

/* ── PaymentModal ── */
function PaymentModal({ config, onClose, onResult }) {
  const { user, loading: authLoading } = useAuth()

  const [gateway,       setGateway]       = useState(null)
  const [step,          setStep]          = useState('select')
    const [couponLocked,  setCouponLocked]  = useState(false)  

  const [coupon,        setCoupon]        = useState('')
  const [couponApplied, setCouponApplied] = useState(null)
  const [couponError,   setCouponError]   = useState('')
  const [txnId,         setTxnId]         = useState('')
  const [errMsg,        setErrMsg]        = useState('')
  const [copied,        setCopied]        = useState(false)
  const [progress,      setProgress]      = useState(0)
  const [showCOD,       setShowCOD]       = useState(false)
  const [cardNum,  setCardNum]  = useState('')
  const [cardExp,  setCardExp]  = useState('')
  const [cardCvc,  setCardCvc]  = useState('')
  const [cardName, setCardName] = useState('')

  const token = () => localStorage.getItem('accessToken')
  const API   = import.meta.env?.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

  // ── FIX: ensure amount is always a valid positive number ──────────────────
  const baseAmount = Math.round(Math.max(0, Number(config.amount) || 0))

  const allowedGateways = config.allowedGateways
    ? GATEWAYS.filter(g => config.allowedGateways.includes(g.id))
    : GATEWAYS

  const finalAmount = couponApplied
    ? Math.max(0, baseAmount - (couponApplied.type === 'percentage'
        ? Math.round(baseAmount * couponApplied.value / 100)
        : couponApplied.value))
    : baseAmount
  const discount = baseAmount - finalAmount

  async function applyCoupon() {
  setCouponError('')
  setCouponLocked(false)
  try {
    const res  = await fetch(`${API}/payments/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token()}` },
      body: JSON.stringify({ code: coupon, amount: baseAmount }),
    })
    const data = await res.json()
    if (!res.ok) {
      if (data.alreadyClaimed) setCouponLocked(true)
      throw new Error(data.message || 'Invalid coupon')
    }
    setCouponApplied(data.coupon)
  } catch(e) { setCouponError(e.message) }
}

  function copyText(txt) {
    navigator.clipboard.writeText(txt).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  }

  useEffect(() => {
    if (step !== 'processing') return
    setProgress(0)
    const ts = [300, 800, 1500, 2500].map((t, i) => setTimeout(() => setProgress([30, 60, 80, 92][i]), t))
    return () => ts.forEach(clearTimeout)
  }, [step])

  function handlePayClick() {
    if (gateway?.id === 'cash') { setShowCOD(true); return }
    submitPayment()
  }

  async function submitPayment() {
    setShowCOD(false)
    if (!gateway) return

    // ── FIX: validate amount and method before sending ────────────────────
    const safeAmount = Math.round(Number(finalAmount))
    const safeMethod = gateway.id

    if (!safeAmount || safeAmount <= 0) {
      setErrMsg('Invalid payment amount. Please go back and try again.')
      setStep('error')
      onResult({ success:false, error:'Invalid amount' })
      return
    }
    if (!safeMethod) {
      setErrMsg('No payment method selected.')
      setStep('error')
      onResult({ success:false, error:'No method' })
      return
    }

    setStep('processing')

    // ── FIX: metadata spread BEFORE required fields so it can never
    //         overwrite amount or method ──────────────────────────────────
    const payload = {
  ...(config.metadata || {}),
  amount:    safeAmount,
  method:    safeMethod,
  currency:  config.currency || 'NPR',
  category:  config.type     || 'generic',
  ...(couponApplied?.code ? { coupon_code: couponApplied.code } : {}),
}

    // Gateway-specific additions
    if (safeMethod === 'cash') {
      payload.gateway_response = { method:'cod' }
      payload.status = 'pending_cod'
    }
    if (safeMethod === 'stripe') {
      payload.gateway_response = { last4:cardNum.slice(-4), brand:'visa' }
    }
    if (['esewa','khalti','fonepay'].includes(safeMethod)) {
      payload.return_url = `${window.location.origin}/payment/callback`
    }

    // Debug log — remove after confirming payments work:
    console.log('[PaymentModal] POST /payments payload:', JSON.stringify(payload, null, 2))

    try {
      const res  = await fetch(`${API}/payments`, {
        method:  'POST',
        headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token()}` },
        body:    JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || data.error || `Payment failed (${res.status})`)

      // Redirect flow (eSewa/Khalti/FonePay hosted)
      if (['esewa','khalti','fonepay'].includes(safeMethod) && data.redirect_url) {
        setProgress(100)
        setTimeout(() => { window.location.href = data.redirect_url }, 400)
        return
      }

      // Success
      setProgress(100)
      setTimeout(() => {
        const txn = data.payment?.transaction_id || data.transaction_id || data.id || ''
        setTxnId(txn)
        setStep('success')
        onResult({
          success:       true,
          paymentId:     data.payment?.id     || data.id,
          transactionId: data.payment?.transaction_id || data.transaction_id,
          method:        safeMethod,
          amount:        safeAmount,
          status:        data.payment?.status || data.status || 'completed',
          raw:           data,
        })
      }, 400)
    } catch(e) {
      console.error('[PaymentModal] payment error:', e)
      setProgress(100)
      setTimeout(() => {
        setErrMsg(e.message)
        setStep('error')
        onResult({ success:false, error:e.message })
      }, 300)
    }
  }

  const canSubmit = (() => {
    if (!gateway) return false
    if (gateway.id === 'stripe') return cardNum.length >= 15 && cardExp.length === 5 && cardCvc.length >= 3 && cardName.trim()
    return true
  })()

  const payBtnLabel = (() => {
    if (!gateway)                return 'Select a payment method'
    if (gateway.id === 'cash')   return `💵 Review COD Order — NPR ${finalAmount.toLocaleString()}`
    if (gateway.id === 'stripe') return `Pay NPR ${finalAmount.toLocaleString()}`
    return `✓ Confirm Payment — NPR ${finalAmount.toLocaleString()}`
  })()

  return (
    <>
      <div className="psm-overlay" onClick={e => { if (e.target === e.currentTarget && step !== 'processing') onClose() }}>
        <div className="psm-modal" onClick={e => e.stopPropagation()}>

          {authLoading && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem' }}>
              <div className="psm-spinner" style={{ borderTopColor:'var(--psm-teal)', borderColor:'var(--psm-border)', width:28, height:28 }} />
            </div>
          )}

          {!authLoading && !user && <AuthWall onClose={onClose} />}

          {!authLoading && user && step === 'processing' && (
            <>
              <div className="psm-progress"><div className="psm-progress-bar" style={{ width:`${progress}%` }} /></div>
              <div className="psm-result">
                <div className="psm-result-icon success" style={{ background:'var(--psm-teal-lt)' }}>
                  <div className="psm-spinner" style={{ borderTopColor:'var(--psm-teal)', borderColor:'rgba(0,123,168,.2)' }} />
                </div>
                <div className="psm-result-title">Processing…</div>
                <div className="psm-result-sub">Don't close this window.</div>
              </div>
            </>
          )}

          {!authLoading && user && step === 'success' && (
            <div className="psm-result">
              <div className="psm-result-icon success">✅</div>
              <div className="psm-result-title">Payment submitted!</div>
              <div className="psm-result-sub">
                {config.type === 'appointment' && 'Your session is confirmed.'}
                {config.type === 'order'       && 'Your order has been placed.'}
                {config.type === 'course'      && 'Full access granted.'}
                {(!config.type || config.type === 'generic') && 'Payment recorded successfully.'}
              </div>
              {txnId && txnId !== '' && <div className="psm-result-ref">Ref: {txnId}</div>}
              <button className="psm-result-btn" onClick={() => onClose({ success:true })}>Close</button>
            </div>
          )}

          {!authLoading && user && step === 'error' && (
            <div className="psm-result">
              <div className="psm-result-icon error">❌</div>
              <div className="psm-result-title">Payment failed</div>
              <div className="psm-result-sub">{errMsg || 'Something went wrong. Please try again.'}</div>
              <div style={{ display:'flex', gap:'.65rem', flexWrap:'wrap', justifyContent:'center' }}>
                <button className="psm-result-btn" onClick={() => { setStep('select'); setErrMsg('') }}>Try Again</button>
                <button className="psm-result-btn" style={{ borderColor:'var(--psm-slate-lt)', color:'var(--psm-slate-lt)', background:'transparent' }} onClick={() => onClose()}>Cancel</button>
              </div>
            </div>
          )}

          {!authLoading && user && (step === 'select' || step === 'detail') && (
            <>
              <div className="psm-header">
                <div className="psm-header-top">
                  <div className="psm-brand">
                    <div className="psm-brand-icon">💳</div>
                    <div>
                      <div className="psm-brand-text">Secure Checkout</div>
                      <div className="psm-brand-sub">Common Psychology · {user.fullName || user.name || user.email}</div>
                    </div>
                  </div>
                  <button className="psm-close" onClick={() => onClose()}>✕</button>
                </div>
                <div className="psm-summary">
                  <div className="psm-summary-label">
                    {config.type === 'appointment' && '📅 Appointment'}
                    {config.type === 'order'       && '📦 Order'}
                    {config.type === 'course'      && '🎓 Course'}
                    {(!config.type || config.type === 'generic') && '🧾 Payment'}
                    {' '}Summary
                  </div>
                  <div className="psm-summary-row" style={{ fontWeight:600, color:'var(--psm-slate)' }}><span>{config.title}</span></div>
                  {config.description && <div className="psm-summary-row" style={{ color:'var(--psm-slate-lt)', fontSize:'.75rem' }}><span>{config.description}</span></div>}
                  {(config.itemLines || []).map((item, i) => (
                    <div className="psm-summary-row" key={i}><span>{item.label}</span><span>NPR {Number(item.amount).toLocaleString()}</span></div>
                  ))}
                  {couponApplied && <div className="psm-summary-row" style={{ color:'var(--psm-green)' }}><span>🎫 Coupon ({couponApplied.code})</span><span>– NPR {discount.toLocaleString()}</span></div>}
                  <div className="psm-summary-row total"><span>Total</span><span>NPR {finalAmount.toLocaleString()}</span></div>
                  {config.couponEnabled !== false && !couponApplied && (
  <>
    {couponLocked ? (
      <div style={{
        marginTop: '.75rem',
        padding: '.6rem .85rem',
        background: '#fff8e6',
        border: '1px solid #f5d87a',
        borderRadius: 8,
        fontSize: '.78rem',
        color: '#92600a',
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem',
      }}>
        🔒 This coupon has already been claimed by another customer.
        <button
          style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', fontSize:'.7rem', color:'var(--psm-slate-lt)' }}
          onClick={() => { setCouponLocked(false); setCoupon(''); setCouponError('') }}>
          Try another
        </button>
      </div>
    ) : (
      <div className="psm-coupon-row">
        <input
          className="psm-coupon-inp"
          value={coupon}
          onChange={e => setCoupon(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          onKeyDown={e => e.key === 'Enter' && applyCoupon()}
        />
        <button className="psm-coupon-btn" onClick={applyCoupon}>Apply</button>
      </div>
    )}
    {!couponLocked && couponError && <div className="psm-coupon-error">{couponError}</div>}
  </>
)}
                </div>
              </div>

              <div className="psm-body">
                <div className="psm-section-label">Choose payment method</div>
                <div className="psm-gateway-grid">
                  {allowedGateways.map(gw => (
                    <div key={gw.id} className={`psm-gw${gateway?.id === gw.id ? ' active' : ''}`} onClick={() => { setGateway(gw); setStep('detail') }}>
                      {gw.badge && <span className="psm-gw-badge">{gw.badge}</span>}
                      <span className="psm-gw-icon">{gw.icon}</span>
                      <div className="psm-gw-info">
                        <div className="psm-gw-name">{gw.name}</div>
                        <div className="psm-gw-sub">{gw.sub}</div>
                      </div>
                      <span className="psm-gw-check" />
                    </div>
                  ))}
                </div>
                <GatewayPanel
                  gateway={gateway} finalAmount={finalAmount} config={config}
                  cardName={cardName} setCardName={setCardName}
                  cardNum={cardNum}   setCardNum={setCardNum}
                  cardExp={cardExp}   setCardExp={setCardExp}
                  cardCvc={cardCvc}   setCardCvc={setCardCvc}
                  copied={copied}     copyText={copyText}
                />
              </div>

              <div className="psm-footer">
                <button className="psm-pay-btn" disabled={!canSubmit} onClick={handlePayClick}>
                  {payBtnLabel}
                </button>
                <div className="psm-secure">🔒 256-bit SSL · Secure · Common Psychology</div>
              </div>
            </>
          )}
        </div>
      </div>

      {showCOD && (
        <CODConfirmPortal finalAmount={finalAmount} config={config} onConfirm={submitPayment} onCancel={() => setShowCOD(false)} />
      )}
    </>
  )
}

export default PaymentModal
