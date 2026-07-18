// src/pages/StaffPortalPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth }   from '../context/AuthContext'
import { useRouter } from '../context/RouterContext'

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
  gold:        '#b45309',
  goldBg:      '#fffbeb',
  goldBright:  '#d97706',
}
const heroGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 45%,${C.skyBright} 85%,#22d3ee 100%)`
const btnGrad  = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`
const goldGrad = `linear-gradient(135deg,#92400e 0%,${C.goldBright} 100%)`

// SHA-256 hash of accountant password "3nfj2DA9@#3Svs"
const ACCOUNTANT_HASH = '9a8c4c32b1ea2788dbc005600c10fca88de534f3df4746f637a3a2eefedf7a54'

const API_BASE = import.meta.env.VITE_API_URL || ''

// ── SHA-256 via Web Crypto ────────────────────────────────────────────────────
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Injected CSS ──────────────────────────────────────────────────────────────
const CSS = `
  .sp-root { min-height:100vh; background:${C.skyGhost}; font-family:var(--font-body); }
  .sp-topbar { background:${heroGrad}; padding:0 2rem; height:60px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; box-shadow:0 2px 12px rgba(0,127,168,0.25); }
  .sp-topbar-title { font-family:var(--font-display); color:white; font-size:1.1rem; font-weight:700; display:flex; align-items:center; gap:0.6rem; }
  .sp-topbar-user { display:flex; align-items:center; gap:0.75rem; }
  .sp-logout-btn { background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.3); color:white; border-radius:8px; padding:0.35rem 0.9rem; font-family:var(--font-body); font-size:0.78rem; font-weight:600; cursor:pointer; transition:all 0.2s; }
  .sp-logout-btn:hover { background:rgba(255,255,255,0.25); }

  .sp-tabs { display:flex; gap:0; border-bottom:2px solid ${C.borderFaint}; background:${C.white}; padding:0 2rem; }
  .sp-tab { padding:0.85rem 1.5rem; font-family:var(--font-body); font-size:0.85rem; font-weight:700; color:${C.textLight}; cursor:pointer; border-bottom:3px solid transparent; margin-bottom:-2px; transition:all 0.18s; letter-spacing:0.03em; white-space:nowrap; }
  .sp-tab:hover { color:${C.skyMid}; }
  .sp-tab.active { color:${C.skyDeep}; border-bottom-color:${C.skyBright}; }
  .sp-tab.gold-tab:hover { color:${C.goldBright}; }
  .sp-tab.gold-tab.active { color:${C.gold}; border-bottom-color:${C.goldBright}; }

  .sp-body { max-width:1200px; margin:0 auto; padding:2rem 1.5rem; }

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
  .sp-status.paid      { background:#dcfce7; color:#166534; }
  .sp-status.unpaid    { background:#fef2f2; color:#dc2626; }
  .sp-status.partial   { background:#fef9c3; color:#854d0e; }
  .sp-status.waived    { background:#f3f4f6; color:#6b7280; }

  .sp-print-btn { background:none; border:1.5px solid ${C.borderFaint}; border-radius:8px; padding:0.3rem 0.75rem; font-family:var(--font-body); font-size:0.75rem; font-weight:700; color:${C.skyMid}; cursor:pointer; transition:all 0.15s; white-space:nowrap; }
  .sp-print-btn:hover { background:${C.skyFaint}; border-color:${C.skyBright}; }
  .sp-empty { text-align:center; padding:3rem 1rem; color:${C.textLight}; font-family:var(--font-body); }

  .sp-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; padding:1.5rem; }
  .sp-form-full { grid-column:1/-1; }
  .sp-label { display:block; font-family:var(--font-body); font-size:0.7rem; font-weight:800; color:${C.skyDeep}; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:0.45rem; }
  .sp-label.gold { color:${C.gold}; }
  .sp-input { width:100%; padding:0.75rem 1rem; border:1.5px solid ${C.borderFaint}; border-radius:10px; font-family:var(--font-body); font-size:0.88rem; color:${C.textDark}; background:${C.white}; outline:none; box-sizing:border-box; transition:all 0.18s; }
  .sp-input:focus { border-color:${C.skyBright}; background:${C.skyGhost}; box-shadow:0 0 0 3px rgba(0,191,255,0.1); }
  .sp-input.gold-focus:focus { border-color:${C.goldBright}; background:#fffdf7; box-shadow:0 0 0 3px rgba(217,119,6,0.12); }
  .sp-textarea { width:100%; padding:0.75rem 1rem; border:1.5px solid ${C.borderFaint}; border-radius:10px; font-family:var(--font-body); font-size:0.88rem; color:${C.textDark}; background:${C.white}; outline:none; box-sizing:border-box; resize:vertical; min-height:90px; transition:all 0.18s; }
  .sp-textarea:focus { border-color:${C.skyBright}; background:${C.skyGhost}; box-shadow:0 0 0 3px rgba(0,191,255,0.1); }
  .sp-select { width:100%; padding:0.75rem 1rem; border:1.5px solid ${C.borderFaint}; border-radius:10px; font-family:var(--font-body); font-size:0.88rem; color:${C.textDark}; background:${C.white}; outline:none; box-sizing:border-box; transition:all 0.18s; appearance:none; }
  .sp-select:focus { border-color:${C.skyBright}; box-shadow:0 0 0 3px rgba(0,191,255,0.1); }
  .sp-select.gold-focus:focus { border-color:${C.goldBright}; box-shadow:0 0 0 3px rgba(217,119,6,0.12); }
  .sp-form-actions { display:flex; gap:1rem; align-items:center; padding:0 1.5rem 1.5rem; }
  .sp-submit-btn { padding:0.85rem 2rem; border-radius:12px; border:none; background:${btnGrad}; color:white; font-family:var(--font-body); font-weight:800; font-size:0.92rem; cursor:pointer; box-shadow:0 4px 16px rgba(0,191,255,0.3); transition:all 0.2s; }
  .sp-submit-btn:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
  .sp-submit-btn:disabled { background:${C.borderFaint}; color:${C.textLight}; box-shadow:none; cursor:not-allowed; }
  .sp-submit-btn.gold { background:${goldGrad}; box-shadow:0 4px 16px rgba(217,119,6,0.3); }
  .sp-reset-btn { padding:0.85rem 1.5rem; border-radius:12px; border:1.5px solid ${C.borderFaint}; background:${C.white}; color:${C.textMid}; font-family:var(--font-body); font-weight:700; font-size:0.88rem; cursor:pointer; transition:all 0.2s; }
  .sp-reset-btn:hover { background:${C.skyFainter}; border-color:${C.skyBright}; }
  .sp-alert { display:flex; gap:0.6rem; align-items:flex-start; padding:0.85rem 1rem; border-radius:10px; margin:0 1.5rem 1rem; font-family:var(--font-body); font-size:0.84rem; line-height:1.5; }
  .sp-alert.success { background:${C.successBg}; border:1.5px solid #bbf7d0; color:${C.success}; }
  .sp-alert.error   { background:${C.errorBg};   border:1.5px solid #fecaca; color:${C.error}; }
  .sp-loading { text-align:center; padding:2rem; color:${C.textLight}; }

  .sp-pager { display:flex; align-items:center; justify-content:flex-end; gap:0.5rem; padding:0.85rem 1.5rem; border-top:1px solid ${C.borderFaint}; }
  .sp-page-btn { padding:0.35rem 0.75rem; border-radius:8px; border:1.5px solid ${C.borderFaint}; background:${C.white}; color:${C.textMid}; font-family:var(--font-body); font-size:0.78rem; font-weight:700; cursor:pointer; transition:all 0.15s; }
  .sp-page-btn:hover:not(:disabled) { background:${C.skyFaint}; border-color:${C.skyBright}; }
  .sp-page-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .sp-page-info { font-family:var(--font-body); font-size:0.78rem; color:${C.textLight}; padding:0 0.5rem; }

  /* ── Accountant lock screen ── */
  .acc-lock { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh; gap:1.5rem; }
  .acc-lock-card { background:${C.white}; border-radius:20px; border:1.5px solid #fde68a; box-shadow:0 8px 40px rgba(217,119,6,0.12); padding:2.5rem 2rem; width:100%; max-width:380px; display:flex; flex-direction:column; gap:1.25rem; align-items:center; }
  .acc-lock-icon { width:56px; height:56px; background:${C.goldBg}; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; }
  .acc-lock-title { font-family:var(--font-display); font-size:1.15rem; font-weight:800; color:${C.gold}; text-align:center; }
  .acc-lock-sub { font-family:var(--font-body); font-size:0.82rem; color:${C.textLight}; text-align:center; margin-top:-0.5rem; }
  .acc-lock-input { width:100%; padding:0.85rem 1rem; border:1.5px solid #fde68a; border-radius:12px; font-family:var(--font-body); font-size:0.95rem; color:${C.textDark}; background:#fffdf7; outline:none; box-sizing:border-box; transition:all 0.18s; letter-spacing:0.08em; }
  .acc-lock-input:focus { border-color:${C.goldBright}; box-shadow:0 0 0 3px rgba(217,119,6,0.14); }
  .acc-lock-btn { width:100%; padding:0.9rem; border-radius:12px; border:none; background:${goldGrad}; color:white; font-family:var(--font-body); font-weight:800; font-size:0.95rem; cursor:pointer; box-shadow:0 4px 16px rgba(217,119,6,0.28); transition:all 0.2s; }
  .acc-lock-btn:hover { opacity:0.9; transform:translateY(-1px); }
  .acc-lock-err { color:${C.error}; font-family:var(--font-body); font-size:0.82rem; text-align:center; }

  /* ── Accountant summary cards ── */
  .acc-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:1.5rem; }
  .acc-stat { background:${C.white}; border-radius:14px; border:1px solid ${C.borderFaint}; padding:1.1rem 1.25rem; display:flex; flex-direction:column; gap:0.3rem; }
  .acc-stat-label { font-family:var(--font-body); font-size:0.68rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:${C.textLight}; }
  .acc-stat-value { font-family:var(--font-display); font-size:1.5rem; font-weight:800; color:${C.textDark}; }
  .acc-stat-value.green { color:${C.success}; }
  .acc-stat-value.red   { color:${C.error}; }
  .acc-stat-value.gold  { color:${C.goldBright}; }

  /* ── Action buttons in table ── */
  .acc-action-btn { background:none; border:1.5px solid ${C.borderFaint}; border-radius:7px; padding:0.25rem 0.6rem; font-family:var(--font-body); font-size:0.72rem; font-weight:700; cursor:pointer; transition:all 0.15s; white-space:nowrap; margin-right:0.3rem; }
  .acc-action-btn.edit  { color:${C.skyMid}; }
  .acc-action-btn.edit:hover  { background:${C.skyFaint}; border-color:${C.skyBright}; }
  .acc-action-btn.receipt { color:${C.gold}; border-color:#fde68a; }
  .acc-action-btn.receipt:hover { background:${C.goldBg}; border-color:${C.goldBright}; }

  /* ── Modal overlay ── */
  .sp-modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:1000; padding:1rem; }
  .sp-modal { background:${C.white}; border-radius:18px; width:100%; max-width:500px; box-shadow:0 16px 60px rgba(0,0,0,0.2); overflow:hidden; }
  .sp-modal-head { background:${heroGrad}; padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center; }
  .sp-modal-head.gold { background:${goldGrad}; }
  .sp-modal-title { font-family:var(--font-display); color:white; font-weight:700; font-size:1rem; }
  .sp-modal-close { background:rgba(255,255,255,0.2); border:none; color:white; border-radius:8px; padding:0.3rem 0.7rem; cursor:pointer; font-family:var(--font-body); font-weight:700; }
  .sp-modal-body { padding:1.5rem; display:flex; flex-direction:column; gap:1rem; }

  /* ── Receipt ── */
  .receipt-wrap { font-family:'Courier New',Courier,monospace; font-size:9.5pt; color:#111; line-height:1.6; }
  .receipt-wrap hr { border:none; border-top:1px dashed #aaa; margin:6px 0; }

  @media (max-width:900px) { .acc-stats { grid-template-columns:1fr 1fr; } }
  @media (max-width:700px) {
    .sp-form-grid { grid-template-columns:1fr; }
    .sp-topbar { padding:0 1rem; }
    .sp-body { padding:1rem; }
    .sp-tabs { padding:0 0.5rem; overflow-x:auto; }
    .sp-tab { padding:0.7rem 1rem; font-size:0.8rem; }
    .sp-card-header { flex-direction:column; align-items:flex-start; }
    .acc-stats { grid-template-columns:1fr 1fr; }
  }

  @media print {
    body * { visibility:hidden !important; }
    #slip-print-area, #slip-print-area * { visibility:visible !important; }
    #slip-print-area { position:fixed !important; top:0 !important; left:0 !important; width:80mm !important; padding:0 !important; margin:0 !important; }
  }
`

function injectCSS(id, css) {
  if (document.getElementById(id)) return
  const s = document.createElement('style'); s.id = id; s.textContent = css
  document.head.appendChild(s)
}

function calcAge(dob) {
  if (!dob) return '—'
  const today = new Date(), b = new Date(dob)
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
function todayISO() { return new Date().toISOString().slice(0, 10) }
function fmtMoney(n) { return `Rs. ${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` }

// ── Registration Slip ─────────────────────────────────────────────────────────
function RegistrationSlip({ patient }) {
  if (!patient) return null
  return (
    <div id="slip-print-area" style={{ width:'76mm', background:'#fff', border:'1px dashed #aaa', borderRadius:4, padding:'6px 8px', fontFamily:"'Courier New',Courier,monospace", fontSize:'9.5pt', lineHeight:1.55, color:'#111', boxSizing:'border-box' }}>
      <div style={{ textAlign:'center', borderBottom:'1px solid #ccc', paddingBottom:4, marginBottom:5 }}>
        <div style={{ fontWeight:'bold', fontSize:'10.5pt' }}>COMMON PSYCHOLOGY</div>
        <div style={{ fontSize:'7.5pt', color:'#444' }}>PATIENT REGISTRATION SLIP</div>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ fontWeight:'bold', fontSize:'8pt' }}>Token #:</span>
        <span style={{ fontWeight:'bold', fontSize:'10pt' }}>{patient.token_number || '—'}</span>
      </div>
      {[['Date', formatDate(patient.registered_at)],['Time', formatTime(patient.registered_at)]].map(([l,v]) => (
        <div key={l} style={{ display:'flex', gap:4, marginBottom:1 }}>
          <span style={{ minWidth:55, fontWeight:'bold', fontSize:'8.5pt' }}>{l}:</span>
          <span style={{ fontSize:'8.5pt' }}>{v}</span>
        </div>
      ))}
      <div style={{ borderTop:'1px dashed #ddd', margin:'4px 0' }} />
      {[['Name', patient.full_name, true],['Age', `${calcAge(patient.date_of_birth)} yrs`],['Gender', patient.gender],['DOB', formatDate(patient.date_of_birth)],['Address', patient.address],patient.phone && ['Phone', patient.phone]].filter(Boolean).map(([l,v,b]) => (
        <div key={l} style={{ display:'flex', gap:4, marginBottom:1 }}>
          <span style={{ minWidth:55, fontWeight:'bold', fontSize:'8.5pt' }}>{l}:</span>
          <span style={{ fontSize:'8.5pt', fontWeight: b ? 'bold' : 'normal', wordBreak:'break-word' }}>{v || '—'}</span>
        </div>
      ))}
      <div style={{ borderTop:'1px dashed #ddd', margin:'4px 0' }} />
      <div style={{ fontSize:'8.5pt' }}><span style={{ fontWeight:'bold' }}>Complaints: </span>{patient.complaints}</div>
      <div style={{ borderTop:'1px dashed #ddd', margin:'5px 0 3px' }} />
      <div style={{ textAlign:'center', fontSize:'7.5pt', color:'#666' }}>Paste this slip in patient card</div>
    </div>
  )
}

function SlipModal({ patient, onClose }) {
  return (
    <div className="sp-modal-overlay">
      <div className="sp-modal">
        <div className="sp-modal-head">
          <span className="sp-modal-title">🖨️ Registration Slip Preview</span>
          <button className="sp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sp-modal-body" style={{ alignItems:'center' }}>
          <RegistrationSlip patient={patient} />
          <div style={{ display:'flex', gap:'0.75rem', width:'100%' }}>
            <button onClick={() => window.print()} style={{ flex:1, padding:'0.85rem', borderRadius:12, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:800, fontSize:'0.9rem', cursor:'pointer' }}>🖨️ Print Slip</button>
            <button onClick={onClose} style={{ flex:1, padding:'0.85rem', borderRadius:12, border:`1.5px solid ${C.borderFaint}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Billing Receipt Modal ─────────────────────────────────────────────────────
function ReceiptModal({ entry, patient, onClose }) {
  const receiptNo = `RCP-${String(entry?.id || '').slice(-6).toUpperCase() || Math.random().toString(36).slice(2,8).toUpperCase()}`
  return (
    <div className="sp-modal-overlay">
      <div className="sp-modal">
        <div className="sp-modal-head gold">
          <span className="sp-modal-title">🧾 Payment Receipt</span>
          <button className="sp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sp-modal-body" style={{ alignItems:'center' }}>
          <div id="slip-print-area" className="receipt-wrap" style={{ width:'76mm', background:'#fff', border:'1px dashed #aaa', borderRadius:4, padding:'8px 10px', boxSizing:'border-box' }}>
            <div style={{ textAlign:'center', marginBottom:6 }}>
              <div style={{ fontWeight:'bold', fontSize:'10.5pt' }}>COMMON PSYCHOLOGY</div>
              <div style={{ fontSize:'7.5pt', color:'#444' }}>PAYMENT RECEIPT</div>
            </div>
            <hr />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'8pt' }}>
              <span>Receipt #:</span><span style={{ fontWeight:'bold' }}>{receiptNo}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'8pt' }}>
              <span>Date:</span><span>{formatDate(entry?.payment_date || new Date().toISOString())}</span>
            </div>
            <hr />
            <div style={{ fontSize:'8.5pt' }}><b>Patient:</b> {patient?.full_name || entry?.patient_name || '—'}</div>
            <div style={{ fontSize:'8.5pt' }}><b>Token #:</b> {patient?.token_number || entry?.token_number || '—'}</div>
            <hr />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'8.5pt' }}>
              <span>Consultation Fee:</span><span>{fmtMoney(entry?.consultation_fee)}</span>
            </div>
            {entry?.additional_charges > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'8.5pt' }}>
                <span>Additional:</span><span>{fmtMoney(entry?.additional_charges)}</span>
              </div>
            )}
            {entry?.discount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'8.5pt' }}>
                <span>Discount:</span><span>-{fmtMoney(entry?.discount)}</span>
              </div>
            )}
            <hr />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'9.5pt', fontWeight:'bold' }}>
              <span>Total Due:</span><span>{fmtMoney(entry?.total_due)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'9.5pt', fontWeight:'bold' }}>
              <span>Amount Paid:</span><span>{fmtMoney(entry?.amount_paid)}</span>
            </div>
            {(entry?.total_due - entry?.amount_paid) > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'8.5pt', color:'#dc2626' }}>
                <span>Balance Due:</span><span>{fmtMoney(entry?.total_due - entry?.amount_paid)}</span>
              </div>
            )}
            <hr />
            <div style={{ fontSize:'8pt' }}><b>Status:</b> {entry?.payment_status?.toUpperCase()}</div>
            {entry?.payment_method && <div style={{ fontSize:'8pt' }}><b>Method:</b> {entry?.payment_method}</div>}
            {entry?.notes && <div style={{ fontSize:'8pt' }}><b>Notes:</b> {entry?.notes}</div>}
            <hr />
            <div style={{ textAlign:'center', fontSize:'7.5pt', color:'#666' }}>Thank you for your visit</div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', width:'100%' }}>
            <button onClick={() => window.print()} style={{ flex:1, padding:'0.85rem', borderRadius:12, border:'none', background:goldGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:800, cursor:'pointer' }}>🖨️ Print Receipt</button>
            <button onClick={onClose} style={{ flex:1, padding:'0.85rem', borderRadius:12, border:`1.5px solid ${C.borderFaint}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:700, cursor:'pointer' }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Billing Entry Form Modal ──────────────────────────────────────────────────
function BillingFormModal({ entry, patients, onSave, onClose }) {
  const isEdit = !!entry?.id
  const EMPTY = { patient_id:'', consultation_fee:'', additional_charges:'0', discount:'0', amount_paid:'', payment_status:'unpaid', payment_method:'cash', payment_date: todayISO(), notes:'' }
  const [form, setForm] = useState(entry ? {
    patient_id:          entry.patient_id || '',
    consultation_fee:    entry.consultation_fee || '',
    additional_charges:  entry.additional_charges || '0',
    discount:            entry.discount || '0',
    amount_paid:         entry.amount_paid || '',
    payment_status:      entry.payment_status || 'unpaid',
    payment_method:      entry.payment_method || 'cash',
    payment_date:        entry.payment_date ? entry.payment_date.slice(0,10) : todayISO(),
    notes:               entry.notes || '',
  } : EMPTY)
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState('')

  const totalDue = Math.max(0, (parseFloat(form.consultation_fee)||0) + (parseFloat(form.additional_charges)||0) - (parseFloat(form.discount)||0))

  function f(k) { return e => setForm(p => ({ ...p, [k]: e.target.value })) }

  async function handleSave() {
    if (!form.patient_id || !form.consultation_fee) { setErr('Patient and consultation fee are required.'); return }
    setSaving(true); setErr('')
    try {
      const token = localStorage.getItem('accessToken')
      const payload = { ...form, total_due: totalDue, consultation_fee: parseFloat(form.consultation_fee)||0, additional_charges: parseFloat(form.additional_charges)||0, discount: parseFloat(form.discount)||0, amount_paid: parseFloat(form.amount_paid)||0 }
      const url = isEdit ? `${API_BASE}/patients/billing/${entry.id}` : `${API_BASE}/patients/billing`
      const res = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('accessToken')}` }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save')
      onSave(data.entry || data)
    } catch(e) { setErr(e.message) }
    finally { setSaving(false) }
  }

  const inputStyle = { width:'100%', padding:'0.7rem 0.9rem', border:`1.5px solid #fde68a`, borderRadius:10, fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textDark, background:'#fffdf7', outline:'none', boxSizing:'border-box' }
  const labelStyle = { display:'block', fontFamily:'var(--font-body)', fontSize:'0.7rem', fontWeight:800, color:C.gold, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.4rem' }

  return (
    <div className="sp-modal-overlay">
      <div className="sp-modal" style={{ maxWidth:520 }}>
        <div className="sp-modal-head gold">
          <span className="sp-modal-title">{isEdit ? '✏️ Edit Billing Entry' : '➕ New Billing Entry'}</span>
          <button className="sp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="sp-modal-body" style={{ maxHeight:'80vh', overflowY:'auto' }}>
          {err && <div className="sp-alert error"><span>⚠️</span><span>{err}</span></div>}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>Patient *</label>
              <select value={form.patient_id} onChange={f('patient_id')} style={inputStyle}>
                <option value="">Select patient…</option>
                {patients.map(p => <option key={p.id} value={p.id}>#{p.token_number} — {p.full_name}</option>)}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Consultation Fee (Rs.) *</label>
              <input type="number" min="0" value={form.consultation_fee} onChange={f('consultation_fee')} placeholder="e.g. 1500" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Additional Charges (Rs.)</label>
              <input type="number" min="0" value={form.additional_charges} onChange={f('additional_charges')} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Discount (Rs.)</label>
              <input type="number" min="0" value={form.discount} onChange={f('discount')} placeholder="0" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Amount Paid (Rs.)</label>
              <input type="number" min="0" value={form.amount_paid} onChange={f('amount_paid')} placeholder="0" style={inputStyle} />
            </div>

            <div style={{ gridColumn:'1/-1', background:C.goldBg, border:'1px solid #fde68a', borderRadius:10, padding:'0.75rem 1rem', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontFamily:'var(--font-body)', fontWeight:700, color:C.gold }}>Total Due:</span>
              <span style={{ fontFamily:'var(--font-display)', fontWeight:800, color:C.gold, fontSize:'1.05rem' }}>{fmtMoney(totalDue)}</span>
            </div>

            <div>
              <label style={labelStyle}>Payment Status</label>
              <select value={form.payment_status} onChange={f('payment_status')} style={inputStyle}>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="waived">Waived</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Payment Method</label>
              <select value={form.payment_method} onChange={f('payment_method')} style={inputStyle}>
                <option value="cash">Cash</option>
                <option value="esewa">eSewa</option>
                <option value="khalti">Khalti</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>Payment Date</label>
              <input type="date" value={form.payment_date} onChange={f('payment_date')} style={inputStyle} />
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={labelStyle}>Notes</label>
              <textarea value={form.notes} onChange={f('notes')} placeholder="Any notes…" style={{ ...inputStyle, resize:'vertical', minHeight:70 }} />
            </div>
          </div>

          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button onClick={handleSave} disabled={saving} style={{ flex:1, padding:'0.9rem', borderRadius:12, border:'none', background:goldGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:800, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Saving…' : isEdit ? '✔ Update Entry' : '✔ Save Entry'}
            </button>
            <button onClick={onClose} style={{ flex:1, padding:'0.9rem', borderRadius:12, border:`1.5px solid ${C.borderFaint}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:700, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Accountant Lock Screen ────────────────────────────────────────────────────
function AccountantLock({ onUnlock }) {
  const [pw, setPw]   = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleUnlock() {
    if (!pw) { setErr('Enter the accountant password.'); return }
    setLoading(true); setErr('')
    const hash = await sha256(pw)
    if (hash === ACCOUNTANT_HASH) {
      sessionStorage.setItem('acc_unlocked', '1')
      onUnlock()
    } else {
      setErr('Incorrect password. Access denied.')
    }
    setLoading(false)
  }

  return (
    <div className="acc-lock">
      <div className="acc-lock-card">
        <div className="acc-lock-icon">🔐</div>
        <div className="acc-lock-title">Accountant Access</div>
        <div className="acc-lock-sub">This section is restricted. Enter the accountant password to continue.</div>
        <input
          type="password"
          className="acc-lock-input"
          placeholder="Enter password…"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr('') }}
          onKeyDown={e => e.key === 'Enter' && handleUnlock()}
          autoFocus
        />
        {err && <div className="acc-lock-err">⚠️ {err}</div>}
        <button className="acc-lock-btn" onClick={handleUnlock} disabled={loading}>
          {loading ? '⏳ Verifying…' : '🔓 Unlock'}
        </button>
      </div>
    </div>
  )
}

// ── Accountant Tab ────────────────────────────────────────────────────────────
function AccountantTab() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('acc_unlocked') === '1')
  const [billing,  setBilling]  = useState([])
  const [patients, setPatients] = useState([])
  const [loading,  setLoading]  = useState(false)
  const [search,   setSearch]   = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage]         = useState(0)
  const [total, setTotal]       = useState(0)
  const PAGE_SIZE = 20

  const [editEntry,    setEditEntry]    = useState(null)  // null = closed, {} = new, obj = edit
  const [receiptEntry, setReceiptEntry] = useState(null)
  const [msg, setMsg]                   = useState(null)

  // Fetch all patients for dropdown
  const fetchPatients = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${API_BASE}/patients?limit=500`, { headers: { Authorization:`Bearer ${token}` } })
      const data = await res.json()
      setPatients(data.patients || [])
    } catch {}
  }, [])

  // Fetch billing entries
  const fetchBilling = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, ...(search && { search }), ...(dateFilter && { date: dateFilter }), ...(statusFilter && { status: statusFilter }) })
      const res = await fetch(`${API_BASE}/patients/billing?${params}`, { headers: { Authorization:`Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setBilling(data.entries || [])
      setTotal(data.total || 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, dateFilter, statusFilter])

  useEffect(() => { if (unlocked) { fetchPatients(); fetchBilling() } }, [unlocked, fetchBilling])

  // Summary stats
  const totalRevenue  = billing.reduce((s, e) => s + (parseFloat(e.amount_paid)||0), 0)
  const totalDue      = billing.reduce((s, e) => s + (parseFloat(e.total_due)||0), 0)
  const totalBalance  = billing.reduce((s, e) => s + Math.max(0, (parseFloat(e.total_due)||0) - (parseFloat(e.amount_paid)||0)), 0)
  const unpaidCount   = billing.filter(e => e.payment_status === 'unpaid').length

  function handleSaved(entry) {
    setEditEntry(null)
    setMsg({ type:'success', text: `Billing entry saved successfully.` })
    fetchBilling()
    setTimeout(() => setMsg(null), 4000)
  }

  if (!unlocked) return <AccountantLock onUnlock={() => setUnlocked(true)} />

  return (
    <div>
      {/* Summary cards */}
      <div className="acc-stats">
        <div className="acc-stat">
          <div className="acc-stat-label">Total Collected</div>
          <div className="acc-stat-value green">{fmtMoney(totalRevenue)}</div>
        </div>
        <div className="acc-stat">
          <div className="acc-stat-label">Total Billed</div>
          <div className="acc-stat-value">{fmtMoney(totalDue)}</div>
        </div>
        <div className="acc-stat">
          <div className="acc-stat-label">Outstanding</div>
          <div className="acc-stat-value red">{fmtMoney(totalBalance)}</div>
        </div>
        <div className="acc-stat">
          <div className="acc-stat-label">Unpaid Entries</div>
          <div className="acc-stat-value gold">{unpaidCount}</div>
        </div>
      </div>

      {/* Billing table */}
      <div className="sp-card">
        <div className="sp-card-header">
          <div className="sp-card-title">💰 Billing Records</div>
          <div style={{ display:'flex', gap:'0.65rem', flexWrap:'wrap', alignItems:'center' }}>
            <input type="date" className="sp-date-input" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(0) }} title="Filter by date" />
            <select className="sp-select" style={{ width:'auto', padding:'0.55rem 1rem' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(0) }}>
              <option value="">All statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="waived">Waived</option>
            </select>
            <input type="text" className="sp-search" placeholder="🔍 Search patient…" value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
            <button onClick={() => setEditEntry({})} style={{ padding:'0.55rem 1.1rem', borderRadius:10, border:'none', background:goldGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', whiteSpace:'nowrap' }}>
              + New Entry
            </button>
          </div>
        </div>

        {msg && <div className={`sp-alert ${msg.type}`} style={{ margin:'1rem 1.5rem 0' }}><span>{msg.type==='success'?'✅':'⚠️'}</span><span>{msg.text}</span></div>}

        {loading ? (
          <div className="sp-loading">⏳ Loading billing records…</div>
        ) : billing.length === 0 ? (
          <div className="sp-empty">
            <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>💳</div>
            <p>No billing records found. Add the first entry.</p>
          </div>
        ) : (
          <>
            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Patient</th>
                    <th>Token</th>
                    <th>Date</th>
                    <th>Fee</th>
                    <th>Additional</th>
                    <th>Discount</th>
                    <th>Total Due</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Method</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billing.map((e, i) => {
                    const balance = Math.max(0, (parseFloat(e.total_due)||0) - (parseFloat(e.amount_paid)||0))
                    const patient = patients.find(p => p.id === e.patient_id)
                    return (
                      <tr key={e.id}>
                        <td style={{ color:C.textLight, fontSize:'0.78rem' }}>{page * PAGE_SIZE + i + 1}</td>
                        <td style={{ fontWeight:600 }}>{e.patient_name || patient?.full_name || '—'}</td>
                        <td style={{ color:C.skyDeep, fontWeight:700 }}>#{e.token_number || patient?.token_number || '—'}</td>
                        <td style={{ fontSize:'0.78rem', whiteSpace:'nowrap' }}>{formatDate(e.payment_date)}</td>
                        <td>{fmtMoney(e.consultation_fee)}</td>
                        <td>{fmtMoney(e.additional_charges)}</td>
                        <td>{e.discount > 0 ? `-${fmtMoney(e.discount)}` : '—'}</td>
                        <td style={{ fontWeight:700 }}>{fmtMoney(e.total_due)}</td>
                        <td style={{ color:C.success, fontWeight:700 }}>{fmtMoney(e.amount_paid)}</td>
                        <td style={{ color: balance > 0 ? C.error : C.success, fontWeight:700 }}>{balance > 0 ? fmtMoney(balance) : '—'}</td>
                        <td><span className={`sp-status ${e.payment_status}`}>{e.payment_status}</span></td>
                        <td style={{ fontSize:'0.78rem', textTransform:'capitalize' }}>{e.payment_method || '—'}</td>
                        <td style={{ whiteSpace:'nowrap' }}>
                          <button className="acc-action-btn edit" onClick={() => setEditEntry(e)}>✏️ Edit</button>
                          <button className="acc-action-btn receipt" onClick={() => setReceiptEntry({ entry: e, patient })}>🧾 Receipt</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="sp-pager">
              <span className="sp-page-info">{page * PAGE_SIZE + 1}–{Math.min((page+1)*PAGE_SIZE, total)} of {total}</span>
              <button className="sp-page-btn" disabled={page===0} onClick={() => setPage(p=>p-1)}>← Prev</button>
              <button className="sp-page-btn" disabled={(page+1)*PAGE_SIZE>=total} onClick={() => setPage(p=>p+1)}>Next →</button>
            </div>
          </>
        )}
      </div>

      {/* Lock button */}
      <div style={{ marginTop:'1.5rem', display:'flex', justifyContent:'flex-end' }}>
        <button onClick={() => { sessionStorage.removeItem('acc_unlocked'); setUnlocked(false) }}
          style={{ padding:'0.55rem 1.25rem', borderRadius:10, border:`1.5px solid #fde68a`, background:'transparent', color:C.gold, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
          🔒 Lock Accountant Tab
        </button>
      </div>

      {/* Modals */}
      {editEntry !== null && (
        <BillingFormModal entry={editEntry.id ? editEntry : null} patients={patients} onSave={handleSaved} onClose={() => setEditEntry(null)} />
      )}
      {receiptEntry && (
        <ReceiptModal entry={receiptEntry.entry} patient={receiptEntry.patient} onClose={() => setReceiptEntry(null)} />
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StaffPortalPage() {
 useEffect(() => {
    injectCSS('sp-css', CSS)
    return () => document.getElementById('sp-css')?.remove()
  }, [])

  const { user, logout } = useAuth()
  const { navigate }     = useRouter()

  useEffect(() => {
    if (!user) { navigate('/staff'); return }
    if (user.role === 'therapist') { navigate('/staff/therapist'); return }
    if (user.role === 'admin')     { navigate('/staff/admin'); return }
    if (!['staff'].includes(user.role)) { navigate('/staff'); return }
  }, [user])

  const [tab, setTab] = useState('records')

  // ── Records state ─────────────────────────────────────────────
  const [patients,   setPatients]   = useState([])
  const [loading,    setLoading]    = useState(false)
  const [search,     setSearch]     = useState('')
  const [dateFilter, setDateFilter] = useState(todayISO())
  const [page,       setPage]       = useState(0)
  const [total,      setTotal]      = useState(0)
  const PAGE_SIZE = 20

  const EMPTY_FORM = { full_name:'', date_of_birth:'', gender:'', address:'', phone:'', complaints:'' }
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [submitting,  setSubmitting]  = useState(false)
  const [formMsg,     setFormMsg]     = useState(null)
  const [lastPatient, setLastPatient] = useState(null)
  const [slipPatient, setSlipPatient] = useState(null)

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const params = new URLSearchParams({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, ...(dateFilter && { date: dateFilter }), ...(search && { search }) })
      const res = await fetch(`${API_BASE}/patients?${params}`, { headers: { Authorization:`Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load patients')
      setPatients(data.patients || [])
      setTotal(data.total || 0)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }, [page, dateFilter, search])

  useEffect(() => { if (tab === 'records') fetchPatients() }, [tab, fetchPatients])

  useEffect(() => {
    const t = setTimeout(() => { setPage(0); if (tab === 'records') fetchPatients() }, 350)
    return () => clearTimeout(t)
  }, [search, dateFilter])

  async function handleRegister(e) {
    e.preventDefault(); setFormMsg(null)
    const { full_name, date_of_birth, gender, address, complaints } = form
    if (!full_name || !date_of_birth || !gender || !address || !complaints) {
      setFormMsg({ type:'error', text:'Please fill in all required fields.' }); return
    }
    setSubmitting(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${API_BASE}/patients`, { method:'POST', headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Registration failed')
      setLastPatient(data.patient)
      setFormMsg({ type:'success', text:`Patient "${data.patient.full_name}" registered! Token #${data.patient.token_number}` })
      setForm(EMPTY_FORM)
      setSlipPatient(data.patient)
    } catch (err) { setFormMsg({ type:'error', text: err.message }) }
    finally { setSubmitting(false) }
  }

  function handleField(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })) }

  return (
    <div className="sp-root">
      <div className="sp-topbar">
        <div className="sp-topbar-title">
          <img src="/header.png" alt="" style={{ height:30, objectFit:'contain' }} onError={e => e.target.style.display='none'} />
          <span>Common Psychology — Staff Portal</span>
        </div>
        <div className="sp-topbar-user">
          <span style={{ fontFamily:'var(--font-body)', color:'rgba(255,255,255,0.85)', fontSize:'0.82rem' }}>👤 {user?.full_name || user?.email}</span>
          <button className="sp-logout-btn" onClick={() => { logout(); navigate('/staff') }}>Sign Out</button>
        </div>
      </div>

      <div className="sp-tabs">
        <div className={`sp-tab${tab==='records'?' active':''}`} onClick={() => setTab('records')}>📋 Patient Records</div>
        <div className={`sp-tab${tab==='register'?' active':''}`} onClick={() => { setTab('register'); setFormMsg(null) }}>➕ Register Patient</div>
        <div className={`sp-tab gold-tab${tab==='accounts'?' active':''}`} onClick={() => setTab('accounts')}>💰 Accounts</div>
      </div>

      <div className="sp-body">

        {/* ══ RECORDS TAB ══════════════════════════════════════════ */}
        {tab === 'records' && (
          <div className="sp-card">
            <div className="sp-card-header">
              <div className="sp-card-title">📋 Incoming Patients</div>
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', alignItems:'center' }}>
                <input type="date" className="sp-date-input" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPage(0) }} />
                <input type="text" className="sp-search" placeholder="🔍 Search name or phone…" value={search} onChange={e => setSearch(e.target.value)} />
                <button onClick={() => setTab('register')} style={{ padding:'0.55rem 1.1rem', borderRadius:10, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', whiteSpace:'nowrap' }}>+ New Patient</button>
              </div>
            </div>

            {loading ? (
              <div className="sp-loading">⏳ Loading patients…</div>
            ) : patients.length === 0 ? (
              <div className="sp-empty">
                <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>🗂️</div>
                <p>No patients found{dateFilter ? ` for ${formatDate(dateFilter + 'T00:00:00')}` : ''}.</p>
              </div>
            ) : (
              <>
                <div className="sp-table-wrap">
                  <table className="sp-table">
                    <thead><tr><th>#</th><th>Token</th><th>Full Name</th><th>Age</th><th>Gender</th><th>Address</th><th>Phone</th><th>Complaints</th><th>Reg. Time</th><th>Status</th><th>Slip</th></tr></thead>
                    <tbody>
                      {patients.map((p, i) => (
                        <tr key={p.id}>
                          <td style={{ color:C.textLight, fontSize:'0.78rem' }}>{page * PAGE_SIZE + i + 1}</td>
                          <td style={{ fontWeight:700, color:C.skyDeep }}>#{p.token_number}</td>
                          <td style={{ fontWeight:600 }}>{p.full_name}</td>
                          <td>{calcAge(p.date_of_birth)} yrs</td>
                          <td>{p.gender}</td>
                          <td style={{ maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.address}</td>
                          <td>{p.phone || '—'}</td>
                          <td style={{ maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.complaints}</td>
                          <td style={{ fontSize:'0.78rem', color:C.textLight, whiteSpace:'nowrap' }}>{formatDate(p.registered_at)}<br /><span style={{ fontSize:'0.7rem' }}>{formatTime(p.registered_at)}</span></td>
                          <td><span className={`sp-status ${p.status}`}>{p.status}</span></td>
                          <td><button className="sp-print-btn" onClick={() => setSlipPatient(p)}>🖨️ Slip</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sp-pager">
                  <span className="sp-page-info">{page * PAGE_SIZE + 1}–{Math.min((page+1)*PAGE_SIZE, total)} of {total}</span>
                  <button className="sp-page-btn" disabled={page===0} onClick={() => setPage(p=>p-1)}>← Prev</button>
                  <button className="sp-page-btn" disabled={(page+1)*PAGE_SIZE>=total} onClick={() => setPage(p=>p+1)}>Next →</button>
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
              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.textLight }}>A printable slip will be generated after registration.</span>
            </div>

            {formMsg && <div className={`sp-alert ${formMsg.type}`}><span>{formMsg.type==='success'?'✅':'⚠️'}</span><span>{formMsg.text}</span></div>}

            {lastPatient && !slipPatient && (
              <div style={{ margin:'0 1.5rem 0.75rem', padding:'0.75rem 1rem', background:C.skyFainter, border:`1px solid ${C.borderFaint}`, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'space-between', gap:'0.75rem', flexWrap:'wrap' }}>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.83rem', color:C.textMid }}>Last registered: <strong>{lastPatient.full_name}</strong> — Token #{lastPatient.token_number}</span>
                <button className="sp-print-btn" onClick={() => setSlipPatient(lastPatient)}>🖨️ Reprint Slip</button>
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="sp-form-grid">
                <div>
                  <label className="sp-label">Full Name <span style={{ color:C.skyBright }}>*</span></label>
                  <input className="sp-input" value={form.full_name} onChange={handleField('full_name')} placeholder="e.g. Ram Bahadur Thapa" required />
                </div>
                <div>
                  <label className="sp-label">Date of Birth <span style={{ color:C.skyBright }}>*</span></label>
                  <input type="date" className="sp-input" value={form.date_of_birth} onChange={handleField('date_of_birth')} required />
                </div>
                <div>
                  <label className="sp-label">Gender <span style={{ color:C.skyBright }}>*</span></label>
                  <select className="sp-select" value={form.gender} onChange={handleField('gender')} required>
                    <option value="">Select gender…</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="sp-label">Phone</label>
                  <input className="sp-input" type="tel" value={form.phone} onChange={handleField('phone')} placeholder="e.g. 98XXXXXXXX" />
                </div>
                <div className="sp-form-full">
                  <label className="sp-label">Address <span style={{ color:C.skyBright }}>*</span></label>
                  <input className="sp-input" value={form.address} onChange={handleField('address')} placeholder="e.g. Kathmandu-10, Baneshwor" required />
                </div>
                <div className="sp-form-full">
                  <label className="sp-label">Chief Complaints <span style={{ color:C.skyBright }}>*</span></label>
                  <textarea className="sp-textarea" value={form.complaints} onChange={handleField('complaints')} placeholder="Describe presenting complaints / reason for visit…" required />
                </div>
              </div>
              {form.date_of_birth && (
                <div style={{ margin:'-0.5rem 1.5rem 0.5rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.skyDeep, fontWeight:700 }}>Age: {calcAge(form.date_of_birth)} years</div>
              )}
              <div className="sp-form-actions">
                <button type="submit" className="sp-submit-btn" disabled={submitting}>{submitting ? '⏳ Registering…' : '✔ Register & Print Slip'}</button>
                <button type="button" className="sp-reset-btn" onClick={() => { setForm(EMPTY_FORM); setFormMsg(null) }}>Clear Form</button>
              </div>
            </form>
          </div>
        )}

        {/* ══ ACCOUNTS TAB ═════════════════════════════════════════ */}
        {tab === 'accounts' && <AccountantTab />}
      </div>

      {slipPatient && <SlipModal patient={slipPatient} onClose={() => setSlipPatient(null)} />}
    </div>
  )
}