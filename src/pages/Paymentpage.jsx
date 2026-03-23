// src/pages/Paymentpage.jsx
// Reads booking from sessionStorage (set by BookingPage)
// Calls payments.initiate() to create payment record in DB
// Calls payments.verify() to mark payment completed

import { useState, useRef } from 'react'
import { useRouter } from '../context/RouterContext'
import { payments as paymentsApi } from '../services/api'

const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', skyGhost:'#F8FEFF',
  white:'#ffffff', mint:'#e8f3ee',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8', green:'#0B6623',
}
const btnGrad     = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`
const heroGrad    = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 45%,${C.skyBright} 85%,#22d3ee 100%)`
const sectionGrad = `linear-gradient(135deg,${C.skyFainter} 0%,${C.mint} 60%,${C.skyFaint} 100%)`

const QR_IMAGE  = '/images/payment-qr.png'
const ESEWA_ID  = '9849350088'
const KHALTI_ID = '9849350088'

const METHODS = [
  { id:'qr',     label:'QR Code',         emoji:'📷', desc:'Scan with any bank app',  color:C.skyBright, faint:C.skyFaint  },
  { id:'esewa',  label:'eSewa',            emoji:'🟢', desc:'Send via eSewa wallet',   color:'#22c55e',   faint:'#d1fae5'   },
  { id:'khalti', label:'Khalti',           emoji:'🟣', desc:'Send via Khalti wallet',  color:'#a855f7',   faint:'#f0e6ff'   },
  { id:'cod',    label:'Cash on Delivery', emoji:'💵', desc:'Pay when you arrive',     color:'#f97316',   faint:'#fff7ed'   },
]

// Maps payment method id → gateway name stored in DB
const METHOD_TO_GATEWAY = {
  qr:     'fonepay',
  esewa:  'esewa',
  khalti: 'khalti',
  cod:    'cash',
}

function generateRef() {
  return `PS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
}

function CopyBtn({ text, copyKey, copied, onCopy }) {
  const active = copied === copyKey
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).catch(()=>{}); onCopy(copyKey) }}
      style={{ padding:'0.35rem 0.9rem', borderRadius:8, border:`1.5px solid ${active?'#22c55e':C.border}`, background:active?'#d1fae5':C.white, color:active?'#065f46':C.textMid, fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', transition:'all 0.18s', whiteSpace:'nowrap' }}>
      {active ? '✓ Copied' : '⎘ Copy'}
    </button>
  )
}

export default function PaymentPage() {
  const { navigate } = useRouter()

  // Read booking from sessionStorage (set by BookingPage)
  const booking = (() => {
    try {
      const stored = sessionStorage.getItem('pendingBooking')
      if (stored) return JSON.parse(stored)
    } catch {}
    return {
      appointmentId:  null,
      therapistName:  'Dr. Anita Shrestha',
      therapistEmoji: '👩‍⚕️',
      therapistRole:  'Clinical Psychologist',
      type:           'Online Video',
      date:           new Date().toISOString().split('T')[0],
      time:           '10:00 AM',
      sessionNo:      1,
      clientName:     'Guest',
      clientEmail:    '',
      clientPhone:    '',
      notes:          '',
      fee:            2000,
    }
  })()

  const [method,    setMethod]    = useState('qr')
  const [copied,    setCopied]    = useState('')
  const [saving,    setSaving]    = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')
  const [paymentId, setPaymentId] = useState(null)
  const [orderRef]                = useState(generateRef)
  const confirmed                 = useRef(false)

  const selected = METHODS.find(m => m.id === method)
  const feeStr   = `NPR ${Number(booking.fee || 0).toLocaleString()}`

  function copy(text, key) {
    navigator.clipboard.writeText(text).catch(()=>{})
    setCopied(key)
    setTimeout(() => setCopied(''), 2200)
  }

  async function handleConfirm() {
    if (confirmed.current || saving) return
    setSaving(true)
    setError('')

    try {
      // ── STEP 1: Create payment record in DB ──────────────────
      const initiateData = await paymentsApi.initiate({
        appointmentId: booking.appointmentId || undefined,
        amount:        booking.fee,
        currency:      'NPR',
        method:        METHOD_TO_GATEWAY[method],
        // For COD mark as completed immediately; others stay pending
        status:        method === 'cod' ? 'completed' : 'pending',
        transactionId: orderRef,
        gatewayResponse: {
          orderRef,
          paymentMethod: method,
          clientName:    booking.clientName,
          clientEmail:   booking.clientEmail,
          submittedAt:   new Date().toISOString(),
        },
      })

      const newPaymentId = initiateData?.payment?.id || initiateData?.id
      setPaymentId(newPaymentId)

      // ── STEP 2: For non-COD, mark as "pending verification"
      // For COD, mark as completed straight away
      if (method === 'cod' && newPaymentId) {
        await paymentsApi.verify(newPaymentId, orderRef, { method: 'cod', confirmedAt: new Date().toISOString() })
      }

      // Clear sessionStorage
      sessionStorage.removeItem('pendingBooking')
      confirmed.current = true
      setDone(true)

    } catch (err) {
      // If payments API isn't available yet, still proceed (graceful degradation)
      console.warn('Payment API error:', err.message)
      sessionStorage.removeItem('pendingBooking')
      confirmed.current = true
      setDone(true)
    } finally {
      setSaving(false)
    }
  }

  // ── SUCCESS SCREEN ────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight:'100vh', background:C.skyGhost, display:'flex', flexDirection:'column' }}>
      <div style={{ height:4, background:`linear-gradient(to right, #00BFFF 0%, #e8f3ee 100%)` }} />
      <div style={{ background:`linear-gradient(to right, #00BFFF 0%, #00BFFF 2%, #e8f3ee 40%, #ffffff 100%)`, borderBottom:`1px solid ${C.borderFaint}`, padding:'0 2rem', height:60, display:'flex', alignItems:'center', gap:'0.75rem' }}>
        <div style={{ width:30, height:30, borderRadius:'50%', background:btnGrad, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M12 2C8.5 2 5.5 4.5 5 8c-.3 2 .5 4 2 5.5L12 22l5-8.5c1.5-1.5 2.3-3.5 2-5.5C18.5 4.5 15.5 2 12 2zm0 9a3 3 0 110-6 3 3 0 010 6z"/></svg>
        </div>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', color:C.green }}>Puja Samargi</span>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
        <div style={{ maxWidth:500, width:'100%' }}>
          <div style={{ background:C.white, borderRadius:24, border:`1.5px solid ${C.borderFaint}`, boxShadow:`0 8px 40px rgba(0,191,255,0.12)`, overflow:'hidden' }}>
            <div style={{ height:4, background:btnGrad }} />
            <div style={{ padding:'3rem 2.5rem', textAlign:'center' }}>
              <div style={{ width:76, height:76, borderRadius:'50%', background:heroGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.75rem', boxShadow:`0 8px 28px rgba(0,191,255,0.35)`, fontSize:'2rem' }}>✓</div>

              <div style={{ display:'inline-block', background:sectionGrad, border:`1px solid ${C.borderFaint}`, borderRadius:100, padding:'0.28rem 1rem', marginBottom:'0.9rem' }}>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:800, color:C.skyDeep, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                  {method === 'cod' ? '📦 Order Confirmed' : '💳 Payment Submitted'}
                </span>
              </div>

              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.9rem', color:C.textDark, marginBottom:'0.75rem', lineHeight:1.2 }}>
                {method === 'cod' ? 'See You Soon!' : 'Thank You!'}
              </h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:C.textMid, lineHeight:1.78, marginBottom:'1.5rem' }}>
                {method === 'cod'
                  ? `Your session with ${booking.therapistName} is confirmed. Please have ${feeStr} ready at your appointment.`
                  : `Thank you, ${booking.clientName}! We will verify your payment and send a confirmation to ${booking.clientEmail || booking.clientPhone || 'you'}.`}
              </p>

              <div style={{ background:sectionGrad, borderRadius:14, padding:'1.1rem 1.5rem', border:`1px solid ${C.borderFaint}`, marginBottom:'1.5rem' }}>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.3rem' }}>Booking Reference</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:C.skyDeep, fontWeight:700, letterSpacing:'0.06em' }}>{orderRef}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', color:C.textLight, marginTop:'0.2rem' }}>Save this for your records · Screenshot this page</div>
              </div>

              <div style={{ background:C.white, border:`1px solid ${C.borderFaint}`, borderRadius:12, padding:'1rem', marginBottom:'1.75rem', textAlign:'left' }}>
                {[
                  ['Therapist',    booking.therapistName],
                  ['Session Type', booking.type],
                  ['Date & Time',  `${booking.date} at ${booking.time}`],
                  ['Amount',       feeStr],
                  ['Payment via',  METHODS.find(m => m.id === method)?.label || method],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.38rem 0', borderBottom:`1px solid ${C.borderFaint}`, fontFamily:'var(--font-body)', fontSize:'0.8rem' }}>
                    <span style={{ color:C.textLight, fontWeight:700 }}>{k}</span>
                    <span style={{ color:C.textDark, fontWeight:600, textAlign:'right' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
                <button onClick={()=>navigate('/')} style={{ padding:'0.7rem 1.75rem', borderRadius:12, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', boxShadow:'0 4px 16px rgba(0,191,255,0.3)' }}>🏠 Back to Home</button>
                <button onClick={()=>navigate('/portal')} style={{ padding:'0.7rem 1.5rem', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}>My Portal →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── PAYMENT SCREEN ────────────────────────────────────────────
  return (
    <div style={{ minHeight:'100vh', background:C.skyGhost }}>
      <div style={{ height:4, background:`linear-gradient(to right, #00BFFF 0%, #e8f3ee 100%)` }} />

      <div style={{ background:`linear-gradient(to right, #00BFFF 0%, #00BFFF 2%, #e8f3ee 40%, #ffffff 100%)`, borderBottom:`1px solid ${C.borderFaint}`, padding:'0 2rem', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50, boxShadow:`0 2px 12px rgba(0,191,255,0.07)` }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
          <div style={{ width:30, height:30, borderRadius:'50%', background:btnGrad, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M12 2C8.5 2 5.5 4.5 5 8c-.3 2 .5 4 2 5.5L12 22l5-8.5c1.5-1.5 2.3-3.5 2-5.5C18.5 4.5 15.5 2 12 2zm0 9a3 3 0 110-6 3 3 0 010 6z"/></svg>
          </div>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', color:C.green }}>Puja Samargi</span>
          <span style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', color:C.textLight, fontWeight:700 }}>· Secure Checkout</span>
        </div>
        <button onClick={()=>navigate('/book')} style={{ padding:'0.32rem 0.85rem', borderRadius:8, border:`1px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontSize:'0.76rem', fontWeight:600, cursor:'pointer' }}>← Back to booking</button>
      </div>

      <div style={{ background:heroGrad, padding:'2.5rem 3rem 3.5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-50, right:-50, width:260, height:260, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
        <div style={{ maxWidth:860, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.28rem 0.9rem', marginBottom:'0.85rem' }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.9)', textTransform:'uppercase' }}>💳 Complete Your Payment</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,2rem)', color:'white', marginBottom:'0.4rem', lineHeight:1.2 }}>
            Session with {booking.therapistEmoji} {booking.therapistName}
          </h1>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:'rgba(255,255,255,0.78)', lineHeight:1.65 }}>
            {booking.date} at {booking.time} · {booking.type}
          </p>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'-2rem auto 0', padding:'0 2rem 4rem', position:'relative', zIndex:10 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:'1.5rem', alignItems:'start' }}>

          {/* LEFT */}
          <div>
            {/* Booking summary */}
            <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.borderFaint}`, overflow:'hidden', marginBottom:'1.25rem', boxShadow:`0 4px 24px rgba(0,191,255,0.07)` }}>
              <div style={{ padding:'0.9rem 1.5rem', background:sectionGrad, borderBottom:`1px solid ${C.borderFaint}` }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', color:C.textDark }}>Booking Summary</span>
              </div>
              <div style={{ padding:'1.25rem 1.5rem' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.9rem' }}>
                  {[
                    ['Client',       booking.clientName],
                    ['Phone',        booking.clientPhone || '—'],
                    ['Therapist',    booking.therapistName],
                    ['Session Type', booking.type],
                    ['Date',         booking.date],
                    ['Time',         booking.time],
                  ].map(([k,v]) => (
                    <div key={k}>
                      <div style={{ fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.15rem' }}>{k}</div>
                      <div style={{ fontFamily:'var(--font-body)', fontSize:'0.84rem', fontWeight:600, color:C.textDark }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:sectionGrad, borderRadius:10, padding:'0.7rem 1rem', marginTop:'1rem', border:`1px solid ${C.borderFaint}`, gap:'0.75rem', flexWrap:'wrap' }}>
                  <div>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:'0.6rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.15rem' }}>Payment Reference</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:C.skyDeep, fontWeight:700, letterSpacing:'0.04em' }}>{orderRef}</div>
                  </div>
                  <CopyBtn text={orderRef} copyKey="ref" copied={copied} onCopy={copy} />
                </div>
              </div>
            </div>

            {/* Method selector */}
            <div style={{ marginBottom:'1.25rem' }}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.66rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.75rem' }}>Choose Payment Method</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.65rem' }}>
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    style={{ padding:'0.9rem 0.5rem', borderRadius:14, border:`1.5px solid ${method===m.id?m.color:C.borderFaint}`, background:method===m.id?m.faint:C.white, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.45rem', boxShadow:method===m.id?`0 4px 16px ${m.color}33`:`0 1px 6px rgba(0,191,255,0.04)`, transform:method===m.id?'translateY(-2px)':'none', transition:'all 0.2s ease', fontFamily:'inherit' }}
                    onMouseEnter={e => { if(method!==m.id) e.currentTarget.style.borderColor=C.border }}
                    onMouseLeave={e => { if(method!==m.id) e.currentTarget.style.borderColor=C.borderFaint }}>
                    <span style={{ fontSize:'1.5rem' }}>{m.emoji}</span>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', fontWeight:method===m.id?800:600, color:method===m.id?m.color:C.textMid, textAlign:'center', lineHeight:1.2 }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Instructions panel */}
            <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.borderFaint}`, overflow:'hidden', boxShadow:`0 4px 24px rgba(0,191,255,0.07)` }}>
              <div style={{ padding:'0.9rem 1.5rem', background:sectionGrad, borderBottom:`1px solid ${C.borderFaint}`, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span style={{ fontSize:'1.1rem' }}>{selected.emoji}</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', color:C.textDark }}>Pay via {selected.label}</span>
              </div>
              <div style={{ padding:'2rem', textAlign:'center' }}>

                {method === 'qr' && (
                  <>
                    <div style={{ width:196, height:196, margin:'0 auto 1.25rem', borderRadius:16, border:`2px solid ${C.borderFaint}`, background:C.white, padding:8, overflow:'hidden', boxShadow:`0 4px 20px rgba(0,191,255,0.1)` }}>
                      <img src={QR_IMAGE} alt="Scan to pay"
                        style={{ width:'100%', height:'100%', objectFit:'contain' }}
                        onError={e => { e.target.parentElement.innerHTML = `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;color:#7a9aaa;text-align:center;padding:8px;gap:6px"><span style="font-size:2rem">📷</span><span>Add QR to<br/>/public/images/payment-qr.png</span></div>` }} />
                    </div>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.86rem', color:C.textMid, lineHeight:1.78, maxWidth:380, margin:'0 auto' }}>
                      Open any banking or wallet app → <strong>Scan QR</strong> → Enter amount <strong style={{ color:C.skyDeep }}>{feeStr}</strong> → Add <strong style={{ color:C.skyDeep }}>{orderRef}</strong> in remarks.
                    </p>
                  </>
                )}

                {method === 'esewa' && (
                  <>
                    <div style={{ fontSize:'4rem', marginBottom:'0.75rem' }}>🟢</div>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.textLight, marginBottom:'0.85rem' }}>Send to this eSewa ID:</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem', marginBottom:'1.1rem', flexWrap:'wrap' }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:C.textDark, fontWeight:700, padding:'0.6rem 1.4rem', background:sectionGrad, borderRadius:12, border:`1px solid ${C.borderFaint}` }}>{ESEWA_ID}</div>
                      <CopyBtn text={ESEWA_ID} copyKey="esewa" copied={copied} onCopy={copy} />
                    </div>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.84rem', color:C.textMid, lineHeight:1.78, maxWidth:380, margin:'0 auto 1rem' }}>
                      eSewa → <strong>Send Money</strong> → ID: <strong style={{ color:C.skyDeep }}>{ESEWA_ID}</strong> → Amount: <strong style={{ color:C.skyDeep }}>{feeStr}</strong> → Remarks: <strong style={{ color:C.skyDeep }}>{orderRef}</strong>
                    </p>
                  </>
                )}

                {method === 'khalti' && (
                  <>
                    <div style={{ fontSize:'4rem', marginBottom:'0.75rem' }}>🟣</div>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.textLight, marginBottom:'0.85rem' }}>Send to this Khalti ID:</p>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.75rem', marginBottom:'1.1rem', flexWrap:'wrap' }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:C.textDark, fontWeight:700, padding:'0.6rem 1.4rem', background:sectionGrad, borderRadius:12, border:`1px solid ${C.borderFaint}` }}>{KHALTI_ID}</div>
                      <CopyBtn text={KHALTI_ID} copyKey="khalti" copied={copied} onCopy={copy} />
                    </div>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.84rem', color:C.textMid, lineHeight:1.78, maxWidth:380, margin:'0 auto 1rem' }}>
                      Khalti → <strong>Send Money</strong> → ID: <strong style={{ color:C.skyDeep }}>{KHALTI_ID}</strong> → Amount: <strong style={{ color:C.skyDeep }}>{feeStr}</strong> → Remarks: <strong style={{ color:C.skyDeep }}>{orderRef}</strong>
                    </p>
                  </>
                )}

                {method === 'cod' && (
                  <>
                    <div style={{ fontSize:'4rem', marginBottom:'0.75rem' }}>💵</div>
                    <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:C.textDark, marginBottom:'0.75rem' }}>Cash on Delivery</h3>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textMid, lineHeight:1.82, maxWidth:340, margin:'0 auto' }}>
                      Your session is confirmed immediately.<br /><br />
                      Please have exactly <strong style={{ color:C.skyDeep }}>{feeStr}</strong> ready at your appointment.<br /><br />
                      <span style={{ fontSize:'0.78rem', color:C.textLight }}>Our team will call to confirm 24 hours before.</span>
                    </p>
                  </>
                )}

              </div>
            </div>

            {error && (
              <div style={{ background:'#fff0f0', border:'1px solid #fca5a5', borderRadius:10, padding:'0.85rem 1rem', marginTop:'1rem', color:'#c0392b', fontSize:'0.85rem' }}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* RIGHT: confirm card */}
          <div style={{ position:'sticky', top:'4.5rem' }}>
            <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.borderFaint}`, overflow:'hidden', boxShadow:`0 6px 32px rgba(0,191,255,0.1)` }}>
              <div style={{ background:heroGrad, padding:'1.6rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.35rem' }}>Total Due</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'2.2rem', color:'white', fontWeight:800, lineHeight:1 }}>{feeStr}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:'rgba(255,255,255,0.7)', marginTop:'0.4rem' }}>Session #{booking.sessionNo}</div>
              </div>
              <div style={{ padding:'1.25rem' }}>
                {[
                  ['Therapist', booking.therapistName.split(' ').slice(-1)[0]],
                  ['Date',      booking.date],
                  ['Time',      booking.time],
                  ['Via',       selected.label],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.42rem 0', borderBottom:`1px solid ${C.borderFaint}`, fontFamily:'var(--font-body)', fontSize:'0.8rem' }}>
                    <span style={{ color:C.textLight, fontWeight:700 }}>{k}</span>
                    <span style={{ color:C.textDark, fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <button onClick={handleConfirm} disabled={saving}
                  style={{ width:'100%', marginTop:'1.1rem', padding:'0.88rem 1rem', borderRadius:12, border:'none', background:saving?C.borderFaint:btnGrad, color:saving?C.textLight:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem', cursor:saving?'not-allowed':'pointer', boxShadow:saving?'none':'0 6px 22px rgba(0,191,255,0.35)', transition:'all 0.2s', letterSpacing:'0.02em' }}
                  onMouseEnter={e => { if(!saving) e.currentTarget.style.opacity='0.88' }}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                  {saving ? '⏳ Confirming…' : method === 'cod' ? '✓ Confirm — Pay on Arrival' : `✓ I've Paid — Confirm Booking`}
                </button>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', color:C.textLight, textAlign:'center', marginTop:'0.8rem', lineHeight:1.55 }}>
                  🔒 Secure checkout · Payments verified within 24hrs
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}