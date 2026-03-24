import { useState, useRef } from 'react'
import { useRouter } from '../context/RouterContext'

const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', skyGhost:'#F8FEFF',
  white:'#ffffff', mint:'#e8f3ee',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8',
}
const heroGrad    = `linear-gradient(135deg,#007BA8 0%,#009FD4 45%,#00BFFF 85%,#22d3ee 100%)`
const btnGrad     = `linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`
const sectionGrad = `linear-gradient(135deg,${C.skyFainter} 0%,${C.mint} 60%,${C.skyFaint} 100%)`

const QR_IMAGE = '/images/payment-qr.png'
const ESEWA_ID = '9849350088'
const KHALTI_ID = '9849350088'

const METHODS = [
  { id:'qr',     label:'QR Code',         emoji:'📷', color:C.skyBright, faint:C.skyFaint },
  { id:'esewa',  label:'eSewa',            emoji:'🟢', color:'#22c55e',   faint:'#d1fae5'  },
  { id:'khalti', label:'Khalti',           emoji:'🟣', color:'#a855f7',   faint:'#f0e6ff'  },
  { id:'cod',    label:'Cash on Arrival',  emoji:'💵', color:'#f97316',   faint:'#fff7ed'  },
]

const WORKSHOPS = [
  { id:1, emoji:'🧠', title:'Understanding Anxiety — A CBT Workshop', facilitator:'Dr. Anita Shrestha', date:'Sat, 21 Jun 2025', time:'10:00 AM – 1:00 PM', mode:'Online (Zoom)', seats:20, booked:16, price:'NPR 800', num:800, free:false, tags:['Anxiety','CBT','Beginners'], color:'var(--blue-mist)' },
  { id:2, emoji:'🌿', title:'Mindfulness & Meditation — Foundations', facilitator:'Ms. Priya Tamang', date:'Sun, 22 Jun 2025', time:'9:00 AM – 11:30 AM', mode:'In-Person, Kathmandu', seats:15, booked:9, price:'FREE', num:0, free:true, tags:['Mindfulness','Meditation'], color:'var(--green-mist)' },
  { id:3, emoji:'💼', title:'Burnout Recovery — Workplace Wellbeing', facilitator:'Mr. Roshan Karki', date:'Sat, 28 Jun 2025', time:'2:00 PM – 5:00 PM', mode:'Online (Zoom)', seats:25, booked:18, price:'NPR 1,200', num:1200, free:false, tags:['Burnout','Workplace','Stress'], color:'var(--earth-cream)' },
  { id:4, emoji:'👨‍👩‍👧', title:'Parenting Teenagers — Staying Connected', facilitator:'Dr. Anita Shrestha', date:'Fri, 4 Jul 2025', time:'6:00 PM – 8:30 PM', mode:'Online (Zoom)', seats:30, booked:12, price:'NPR 600', num:600, free:false, tags:['Parenting','Adolescents','Family'], color:'var(--sky-light)' },
  { id:5, emoji:'😴', title:'Better Sleep — Science & Strategies', facilitator:'Ms. Priya Tamang', date:'Sat, 5 Jul 2025', time:'10:00 AM – 12:00 PM', mode:'In-Person, Kathmandu', seats:20, booked:20, price:'NPR 500', num:500, free:false, tags:['Sleep','Insomnia','Health'], color:'var(--green-mist)', full:true },
  { id:6, emoji:'💙', title:'Grief & Loss — Finding Your Way Through', facilitator:'Mr. Roshan Karki', date:'Sun, 13 Jul 2025', time:'3:00 PM – 5:30 PM', mode:'Online (Zoom)', seats:20, booked:7, price:'FREE', num:0, free:true, tags:['Grief','Loss','Healing'], color:'var(--blue-mist)' },
]

function genRef() {
  return `PS-WS-${new Date().getFullYear()}-${String(Math.floor(Math.random()*90000)+10000)}`
}

function CopyBtn({ text, id, copied, onCopy }) {
  const active = copied === id
  return (
    <button onClick={() => { navigator.clipboard.writeText(text).catch(()=>{}); onCopy(id) }}
      style={{ padding:'0.3rem 0.85rem', borderRadius:8, border:`1.5px solid ${active?'#22c55e':C.border}`, background:active?'#d1fae5':C.white, color:active?'#065f46':C.textMid, fontFamily:'var(--font-body)', fontSize:'0.74rem', fontWeight:700, cursor:'pointer', transition:'all 0.18s', whiteSpace:'nowrap' }}>
      {active ? '✓ Copied' : '⎘ Copy'}
    </button>
  )
}

function FInput({ label, required, type='text', placeholder, value, onChange }) {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.66rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.4rem' }}>
        {label}{required && <span style={{ color:C.skyBright, marginLeft:2 }}>*</span>}
      </label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ width:'100%', padding:'0.75rem 1rem', border:`1.5px solid ${f?C.skyBright:C.borderFaint}`, borderRadius:10, fontFamily:'var(--font-body)', fontSize:'0.9rem', color:C.textDark, background:f?C.skyGhost:C.white, outline:'none', boxSizing:'border-box', boxShadow:f?`0 0 0 3px rgba(0,191,255,0.1)`:'none', transition:'all 0.2s' }} />
    </div>
  )
}

export default function WorkshopsPage() {
  const { navigate }          = useRouter()
  const [screen, setScreen]   = useState('list')   // 'list' | 'register' | 'payment' | 'done'
  const [workshop, setWS]     = useState(null)
  const [method, setMethod]   = useState('qr')
  const [copied, setCopied]   = useState('')
  const [saving, setSaving]   = useState(false)
  const [ref]                 = useState(genRef)
  const [registered, setReg]  = useState([])
  const confirmed             = useRef(false)
  const payRef                = useRef(null)

  const [form, setForm] = useState({ name:'', email:'', phone:'', notes:'' })
  const upForm = (k,v) => setForm(f=>({...f,[k]:v}))
  const sel    = METHODS.find(m=>m.id===method)
  const formOK = form.name.trim() && form.email.includes('@') && form.phone.trim()

  function copy(text, id) {
    navigator.clipboard.writeText(text).catch(()=>{})
    setCopied(id)
    setTimeout(()=>setCopied(''), 2200)
  }

  function openRegister(ws) {
    setWS(ws)
    setForm({ name:'', email:'', phone:'', notes:'' })
    setScreen('register')
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  function handleFreeRegister() {
    setReg(prev=>[...prev,workshop.id])
    setScreen('done')
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  function handleProceedPay() {
    setScreen('payment')
    setTimeout(()=>payRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }),80)
  }

  async function handleConfirm() {
    if (confirmed.current || saving) return
    setSaving(true)
    await new Promise(r=>setTimeout(r,900))
    confirmed.current = true
    setReg(prev=>[...prev,workshop.id])
    setSaving(false)
    setScreen('done')
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  /* ── SUCCESS ── */
  if (screen === 'done') return (
    <div className="page-wrapper" style={{ background:C.skyGhost }}>
      <div style={{ maxWidth:520, margin:'0 auto', padding:'5rem 2rem' }}>
        <div style={{ background:C.white, borderRadius:24, border:`1.5px solid ${C.borderFaint}`, boxShadow:`0 8px 40px rgba(0,191,255,0.12)`, overflow:'hidden' }}>
          <div style={{ height:4, background:btnGrad }} />
          <div style={{ padding:'3rem 2.5rem', textAlign:'center' }}>
            <div style={{ width:76, height:76, borderRadius:'50%', background:heroGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.75rem', fontSize:'2rem', boxShadow:`0 8px 28px rgba(0,191,255,0.35)` }}>✓</div>
            <div style={{ display:'inline-block', background:sectionGrad, border:`1px solid ${C.borderFaint}`, borderRadius:100, padding:'0.28rem 1rem', marginBottom:'0.9rem' }}>
              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:800, color:C.skyDeep, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                {workshop?.free ? '🎓 Registered Free' : '💳 Payment Submitted'}
              </span>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.9rem', color:C.textDark, marginBottom:'0.75rem' }}>
              {workshop?.free ? "You're Registered!" : 'Thank You!'}
            </h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:C.textMid, lineHeight:1.78, marginBottom:'1.5rem' }}>
              {workshop?.free
                ? `Your spot is confirmed for "${workshop?.title}". A Zoom link / directions will be emailed to ${form.email}.`
                : `We'll verify your payment and send confirmation to ${form.email} within 24 hours.`}
            </p>
            <div style={{ background:sectionGrad, borderRadius:14, padding:'1rem 1.5rem', border:`1px solid ${C.borderFaint}`, marginBottom:'1rem' }}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.3rem' }}>Registration Reference</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:C.skyDeep, fontWeight:700 }}>{ref}</div>
            </div>
            <div style={{ background:C.white, border:`1px solid ${C.borderFaint}`, borderRadius:12, padding:'0.9rem', marginBottom:'1.75rem', textAlign:'left' }}>
              {[['Workshop',workshop?.title],['Date',workshop?.date],['Time',workshop?.time],['Mode',workshop?.mode],['Facilitator',workshop?.facilitator]].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.35rem 0', borderBottom:`1px solid ${C.borderFaint}`, fontFamily:'var(--font-body)', fontSize:'0.78rem' }}>
                  <span style={{ color:C.textLight, fontWeight:700 }}>{k}</span>
                  <span style={{ color:C.textDark, fontWeight:600, textAlign:'right', maxWidth:'60%' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={()=>navigate('/')} style={{ padding:'0.7rem 1.75rem', borderRadius:12, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}>🏠 Back to Home</button>
              <button onClick={()=>{ setScreen('list'); confirmed.current=false }} style={{ padding:'0.7rem 1.4rem', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}>Browse More Workshops</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── REGISTER FORM ── */
  if (screen === 'register') return (
    <div className="page-wrapper" style={{ background:C.skyGhost }}>
      <div style={{ background:heroGrad, padding:'4rem 3rem 3rem', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.28rem 0.9rem', marginBottom:'0.85rem' }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.9)', textTransform:'uppercase' }}>📋 Workshop Registration</span>
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,2rem)', color:'white', marginBottom:'0.4rem' }}>{workshop?.title}</h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:'rgba(255,255,255,0.78)' }}>
            {workshop?.date} · {workshop?.time} · {workshop?.mode} · {workshop?.price}
          </p>
          <button onClick={()=>setScreen('list')} style={{ marginTop:'1rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.32rem 1rem', cursor:'pointer' }}>
            ← Back to Workshops
          </button>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:'2.5rem auto', padding:'0 2rem 5rem' }}>
        <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.borderFaint}`, overflow:'hidden', boxShadow:`0 4px 24px rgba(0,191,255,0.07)` }}>

          {/* Workshop detail card */}
          <div style={{ padding:'1.1rem 1.5rem', background:sectionGrad, borderBottom:`1px solid ${C.borderFaint}` }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', color:C.textDark }}>Workshop Details</span>
          </div>
          <div style={{ padding:'1rem 1.5rem 0.5rem' }}>
            {[['Facilitator',workshop?.facilitator],['Date',workshop?.date],['Time',workshop?.time],['Mode',workshop?.mode],['Seats Left',`${workshop?.seats-(workshop?.booked||0)} remaining`],['Fee',workshop?.price]].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.4rem 0', borderBottom:`1px solid ${C.borderFaint}`, fontFamily:'var(--font-body)', fontSize:'0.82rem' }}>
                <span style={{ color:C.textLight, fontWeight:700 }}>{k}</span>
                <span style={{ color:C.textDark, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Your details */}
          <div style={{ padding:'0.9rem 1.5rem', background:sectionGrad, borderBottom:`1px solid ${C.borderFaint}`, borderTop:`1px solid ${C.borderFaint}`, marginTop:'0.5rem' }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', color:C.textDark }}>Your Details</span>
          </div>
          <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            <FInput label="Full Name"        required placeholder="Priya Sharma"   value={form.name}  onChange={e=>upForm('name',e.target.value)} />
            <FInput label="Email"            required type="email" placeholder="you@email.com" value={form.email} onChange={e=>upForm('email',e.target.value)} />
            <FInput label="Phone/WhatsApp"   required type="tel" placeholder="98XXXXXXXX" value={form.phone} onChange={e=>upForm('phone',e.target.value)} />
            <div>
              <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.66rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.4rem' }}>Notes (optional)</label>
              <textarea value={form.notes} onChange={e=>upForm('notes',e.target.value)} placeholder="Any accessibility requirements or questions for the facilitator…" rows={2}
                style={{ width:'100%', padding:'0.75rem 1rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:10, fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textDark, background:C.white, outline:'none', resize:'vertical', boxSizing:'border-box', transition:'border-color 0.2s' }}
                onFocus={e=>e.target.style.borderColor=C.skyBright}
                onBlur={e=>e.target.style.borderColor=C.borderFaint} />
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding:'1.1rem 1.5rem', borderTop:`1px solid ${C.borderFaint}`, display:'flex', gap:'0.75rem' }}>
            <button onClick={()=>setScreen('list')} style={{ padding:'0.75rem 1.2rem', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.88rem', cursor:'pointer' }}>← Back</button>
            <button onClick={() => { if(!formOK) return; workshop.free ? handleFreeRegister() : handleProceedPay() }} disabled={!formOK}
              style={{ flex:1, padding:'0.88rem', borderRadius:12, border:'none', background:formOK?btnGrad:C.borderFaint, color:formOK?'white':C.textLight, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.92rem', cursor:formOK?'pointer':'not-allowed', boxShadow:formOK?'0 6px 22px rgba(0,191,255,0.35)':'none', transition:'all 0.2s' }}>
              {!formOK ? 'Fill in your details' : workshop?.free ? '🎓 Register Free →' : `💳 Proceed to Payment — ${workshop?.price} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── PAYMENT ── */
  if (screen === 'payment') return (
    <div className="page-wrapper" style={{ background:C.skyGhost }} ref={payRef}>
      <div style={{ background:heroGrad, padding:'3rem 3rem 3.5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:920, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.28rem 0.9rem', marginBottom:'0.85rem' }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.9)', textTransform:'uppercase' }}>💳 Workshop Payment</span>
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,2rem)', color:'white', marginBottom:'0.4rem' }}>{workshop?.title}</h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:'rgba(255,255,255,0.78)' }}>{workshop?.date} · {workshop?.price}</p>
          <button onClick={()=>setScreen('register')} style={{ marginTop:'1rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.32rem 1rem', cursor:'pointer' }}>← Back to form</button>
        </div>
      </div>

      <div style={{ maxWidth:920, margin:'0 auto', padding:'2.5rem 2rem 5rem' }}>
        {/* Responsive payment layout: side-by-side on desktop, stacked on mobile */}
        <style>{`
          .payment-layout {
            display: grid;
            grid-template-columns: 1fr 300px;
            gap: 1.75rem;
            align-items: start;
          }
          .payment-sidebar {
            position: sticky;
            top: 5.5rem;
          }
          @media (max-width: 700px) {
            .payment-layout {
              grid-template-columns: 1fr;
            }
            .payment-sidebar {
              position: static;
            }
          }
        `}</style>
        <div className="payment-layout">
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Method selector */}
            <div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.66rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.75rem' }}>Choose Payment Method</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'0.65rem' }}>
                {METHODS.map(m=>(
                  <button key={m.id} onClick={()=>setMethod(m.id)} style={{ padding:'0.85rem 0.5rem', borderRadius:14, border:`1.5px solid ${method===m.id?m.color:C.borderFaint}`, background:method===m.id?m.faint:C.white, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.35rem', boxShadow:method===m.id?`0 4px 14px ${m.color}33`:'none', transform:method===m.id?'translateY(-2px)':'none', transition:'all 0.2s ease', fontFamily:'inherit' }}>
                    <span style={{ fontSize:'1.4rem' }}>{m.emoji}</span>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:method===m.id?800:600, color:method===m.id?m.color:C.textMid, textAlign:'center', lineHeight:1.2 }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment instructions */}
            <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.borderFaint}`, overflow:'hidden', boxShadow:`0 4px 24px rgba(0,191,255,0.07)` }}>
              <div style={{ padding:'0.9rem 1.5rem', background:sectionGrad, borderBottom:`1px solid ${C.borderFaint}`, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span>{sel.emoji}</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', color:C.textDark }}>Pay via {sel.label}</span>
              </div>
              <div style={{ padding:'1.75rem 2rem', textAlign:'center' }}>
                {method==='qr' && (
                  <>
                    <div style={{ width:'min(180px,80%)', aspectRatio:'1', margin:'0 auto 1.1rem', borderRadius:16, border:`2px solid ${C.borderFaint}`, background:C.white, padding:8, overflow:'hidden', boxShadow:`0 4px 20px rgba(0,191,255,0.1)` }}>
                      <img src={QR_IMAGE} alt="QR" style={{ width:'100%', height:'100%', objectFit:'contain' }}
                        onError={e=>{ e.target.parentElement.innerHTML=`<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;color:#7a9aaa;text-align:center;gap:8px"><span style="font-size:2rem">📷</span><span>Add QR to /public/images/payment-qr.png</span></div>` }} />
                    </div>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textMid, lineHeight:1.78, maxWidth:360, margin:'0 auto' }}>
                      Open any bank app → Scan QR → Amount <strong style={{ color:C.skyDeep }}>{workshop?.price}</strong> → Remarks: <strong style={{ color:C.skyDeep }}>{ref}</strong>
                    </p>
                  </>
                )}
                {(method==='esewa'||method==='khalti') && (
                  <>
                    <div style={{ fontSize:'3rem', marginBottom:'0.65rem' }}>{sel.emoji}</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.65rem', marginBottom:'0.9rem', flexWrap:'wrap' }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:C.textDark, fontWeight:700, padding:'0.5rem 1.2rem', background:sectionGrad, borderRadius:12, border:`1px solid ${C.borderFaint}` }}>{method==='esewa'?ESEWA_ID:KHALTI_ID}</div>
                      <CopyBtn text={method==='esewa'?ESEWA_ID:KHALTI_ID} id={method} copied={copied} onCopy={copy} />
                    </div>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.textMid, lineHeight:1.78, maxWidth:360, margin:'0 auto 0.9rem' }}>
                      Amount: <strong style={{ color:C.skyDeep }}>{workshop?.price}</strong> · Remarks: <strong style={{ color:C.skyDeep }}>{ref}</strong>
                    </p>
                    <a href={method==='esewa'?'https://esewa.com.np':'https://khalti.com'} target="_blank" rel="noopener noreferrer"
                      style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'0.48rem 1.2rem', borderRadius:100, border:`1.5px solid ${sel.color}`, color:sel.color, background:sel.faint, fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:700, textDecoration:'none' }}>
                      {sel.emoji} Open {sel.label} App →
                    </a>
                  </>
                )}
                {method==='cod' && (
                  <>
                    <div style={{ fontSize:'3rem', marginBottom:'0.65rem' }}>💵</div>
                    <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:C.textDark, marginBottom:'0.65rem' }}>Pay on Arrival</h3>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textMid, lineHeight:1.8, maxWidth:340, margin:'0 auto' }}>
                      Your spot is reserved now. Please bring exactly <strong style={{ color:C.skyDeep }}>{workshop?.price}</strong> on the day. Our team will call {form.phone} to confirm.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: sticky confirm */}
          <div className="payment-sidebar">
            <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.borderFaint}`, overflow:'hidden', boxShadow:`0 6px 32px rgba(0,191,255,0.1)` }}>
              <div style={{ background:heroGrad, padding:'1.5rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', top:-25, right:-25, width:110, height:110, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.3rem' }}>Workshop Fee</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'2.2rem', color:'white', fontWeight:800, lineHeight:1 }}>{workshop?.price}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', color:'rgba(255,255,255,0.65)', marginTop:'0.3rem' }}>{workshop?.date}</div>
              </div>
              <div style={{ padding:'1.1rem' }}>
                <div style={{ background:sectionGrad, borderRadius:10, padding:'0.65rem 0.85rem', marginBottom:'0.9rem', border:`1px solid ${C.borderFaint}`, display:'flex', justifyContent:'space-between', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
                  <div>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:'0.56rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.1rem' }}>Reference</div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'0.78rem', color:C.skyDeep, fontWeight:700 }}>{ref}</div>
                  </div>
                  <CopyBtn text={ref} id="ref" copied={copied} onCopy={copy} />
                </div>
                {[['Method',sel.label],['Name',form.name||'—'],['Phone',form.phone||'—']].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.38rem 0', borderBottom:`1px solid ${C.borderFaint}`, fontFamily:'var(--font-body)', fontSize:'0.76rem' }}>
                    <span style={{ color:C.textLight, fontWeight:700 }}>{k}</span>
                    <span style={{ color:C.textDark, fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <button onClick={handleConfirm} disabled={saving}
                  style={{ width:'100%', marginTop:'1rem', padding:'0.88rem 1rem', borderRadius:12, border:'none', background:saving?C.borderFaint:btnGrad, color:saving?C.textLight:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem', cursor:saving?'not-allowed':'pointer', boxShadow:saving?'none':'0 6px 22px rgba(0,191,255,0.35)', transition:'all 0.2s' }}>
                  {saving?'⏳ Confirming…':method==='cod'?'✓ Reserve — Pay on Arrival':`✓ I've Paid — Confirm Registration`}
                </button>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.64rem', color:C.textLight, textAlign:'center', marginTop:'0.75rem', lineHeight:1.55 }}>
                  🔒 Secure · Confirmation sent to email
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  /* ── WORKSHOP LIST ── */
  return (
    <div className="page-wrapper">
      {/* Responsive grid styles injected once */}
      <style>{`
        .workshops-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 1024px) {
          .workshops-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .workshops-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-hero" style={{ background:'var(--sky-light)' }}>
        <span className="section-tag">Workshops & Events</span>
        <h1 className="section-title">Join a Live <em>Workshop</em></h1>
        <p className="section-desc">Interactive sessions led by our therapists — online and in-person across Nepal.</p>
        {registered.length > 0 && (
          <div style={{ marginTop:'1.25rem', display:'inline-flex', alignItems:'center', gap:8, background:btnGrad, borderRadius:100, padding:'6px 18px', fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight:700, color:'white', boxShadow:`0 4px 16px rgba(0,191,255,0.3)` }}>
            ✓ {registered.length} workshop{registered.length>1?'s':''} registered
          </div>
        )}
      </div>

      <div className="section" style={{ background:'var(--white)' }}>
        <div className="workshops-grid">
          {WORKSHOPS.map((ws) => {
            const isReg   = registered.includes(ws.id)
            const pct     = Math.round((ws.booked/ws.seats)*100)
            const urgent  = pct >= 80
            return (
              <div key={ws.id}
                style={{ background:isReg?C.skyFainter:'var(--off-white)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:`1.5px solid ${isReg?C.skyBright:ws.full?'#f97316':'var(--earth-cream)'}`, boxShadow:isReg?`0 4px 20px rgba(0,191,255,0.12)`:'var(--shadow-soft)', transition:'all 0.25s', opacity:ws.full&&!isReg?0.75:1 }}
                onMouseEnter={e=>!ws.full&&(e.currentTarget.style.transform='translateY(-4px)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>

                {/* Image / header */}
                <div style={{ background:isReg?`linear-gradient(135deg,${C.skyFaint},${C.skyFainter})`:ws.color, padding:'1.75rem', fontSize:'2.5rem', textAlign:'center', position:'relative' }}>
                  {ws.emoji}
                  {isReg && <div style={{ position:'absolute', top:10, right:10, background:btnGrad, borderRadius:100, padding:'3px 10px', fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:'white' }}>✓ REGISTERED</div>}
                  {ws.full && !isReg && <div style={{ position:'absolute', top:10, right:10, background:'#f97316', borderRadius:100, padding:'3px 10px', fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:'white' }}>FULL</div>}
                </div>

                <div style={{ padding:'1.4rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.3rem' }}>
                    <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--blue-mid)' }}>{ws.mode}</span>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color: ws.free?'var(--green-deep)':'var(--green-deep)' }}>{ws.free?'FREE':ws.price}</span>
                  </div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--blue-deep)', marginBottom:'0.4rem', lineHeight:1.3 }}>{ws.title}</h3>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'var(--text-light)', marginBottom:'0.6rem' }}>👤 {ws.facilitator}</p>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'var(--text-mid)', marginBottom:'0.6rem' }}>
                    📅 {ws.date} · {ws.time}
                  </div>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:'0.85rem' }}>
                    {ws.tags.map((t,j)=><span key={j} className="tag" style={{ fontSize:'0.65rem' }}>{t}</span>)}
                  </div>

                  {/* Seat bar */}
                  <div style={{ marginBottom:'1rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-body)', fontSize:'0.7rem', color: urgent?'#e53e3e':'var(--text-light)', marginBottom:'0.3rem', fontWeight: urgent?700:400 }}>
                      <span>{urgent?'⚠ Almost full!':'Seats available'}</span>
                      <span>{ws.seats-ws.booked} of {ws.seats} left</span>
                    </div>
                    <div style={{ height:5, background:'var(--earth-cream)', borderRadius:100, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background: pct>=90?'linear-gradient(90deg,#e53e3e,#f97316)':pct>=70?'linear-gradient(90deg,#f97316,#ffd54f)':btnGrad, borderRadius:100, transition:'width 0.3s' }} />
                    </div>
                  </div>

                  {isReg ? (
                    <button className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }} onClick={()=>navigate('/portal')}>
                      ✓ Registered — View Details
                    </button>
                  ) : ws.full ? (
                    <button disabled style={{ width:'100%', padding:'0.6rem', borderRadius:12, border:`1.5px solid var(--earth-cream)`, background:'var(--earth-cream)', color:'var(--text-light)', fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.82rem', cursor:'not-allowed' }}>
                      Workshop Full
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={()=>openRegister(ws)}>
                      {ws.free ? 'Register Free →' : 'Register Now →'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}