// src/pages/WorkshopsPage.jsx
// Payment fully centralized — usePayment() replaces the inline payment screen.
// On success: registration + payment saved in DB, linked by workshop_id.
// Admin fetches /admin/payments?category=workshop  OR  /admin/registrations

import { useState, useEffect } from 'react'
import { useRouter }  from '../context/RouterContext'
import { usePayment } from '../components/PaymentModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

const WORKSHOPS = [
  { id:1, emoji:'🧠', title:'Understanding Anxiety — A CBT Workshop',  facilitator:'Dr. Anita Shrestha', date:'Sat, 21 Jun 2025', time:'10:00 AM – 1:00 PM',  mode:'Online (Zoom)',      seats:20, booked:16, price:800,  free:false, tags:['Anxiety','CBT','Beginners'], color:'var(--blue-mist)'  },
  { id:2, emoji:'🌿', title:'Mindfulness & Meditation — Foundations',   facilitator:'Ms. Priya Tamang',   date:'Sun, 22 Jun 2025', time:'9:00 AM – 11:30 AM', mode:'In-Person, Kathmandu', seats:15, booked:9,  price:0,    free:true,  tags:['Mindfulness','Meditation'],   color:'var(--green-mist)' },
  { id:3, emoji:'💼', title:'Burnout Recovery — Workplace Wellbeing',   facilitator:'Mr. Roshan Karki',   date:'Sat, 28 Jun 2025', time:'2:00 PM – 5:00 PM',  mode:'Online (Zoom)',      seats:25, booked:18, price:1200, free:false, tags:['Burnout','Workplace'],        color:'var(--earth-cream)'},
  { id:4, emoji:'👨‍👩‍👧', title:'Parenting Teenagers — Staying Connected',  facilitator:'Dr. Anita Shrestha', date:'Fri, 4 Jul 2025',  time:'6:00 PM – 8:30 PM',  mode:'Online (Zoom)',      seats:30, booked:12, price:600,  free:false, tags:['Parenting','Family'],         color:'var(--sky-light)'  },
  { id:5, emoji:'😴', title:'Better Sleep — Science & Strategies',      facilitator:'Ms. Priya Tamang',   date:'Sat, 5 Jul 2025',  time:'10:00 AM – 12:00 PM',mode:'In-Person, Kathmandu', seats:20, booked:20, price:500,  free:false, tags:['Sleep','Insomnia'],           color:'var(--green-mist)', full:true },
  { id:6, emoji:'💙', title:'Grief & Loss — Finding Your Way Through',  facilitator:'Mr. Roshan Karki',   date:'Sun, 13 Jul 2025', time:'3:00 PM – 5:30 PM',  mode:'Online (Zoom)',      seats:20, booked:7,  price:0,    free:true,  tags:['Grief','Healing'],            color:'var(--blue-mist)'  },
]

function FInput({ label, required, type='text', placeholder, value, onChange }) {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.66rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.4rem' }}>
        {label}{required && <span style={{ color:C.skyBright, marginLeft:2 }}>*</span>}
      </label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ width:'100%', padding:'0.75rem 1rem', border:`1.5px solid ${f?C.skyBright:C.borderFaint}`, borderRadius:10, fontFamily:'var(--font-body)', fontSize:'0.9rem', color:C.textDark, background:f?C.skyGhost:C.white, outline:'none', boxSizing:'border-box', boxShadow:f?`0 0 0 3px rgba(0,191,255,0.1)`:'none', transition:'all 0.2s' }}/>
    </div>
  )
}

async function saveRegistration({ workshopId, workshopTitle, form, isFree }) {
  const token = localStorage.getItem('accessToken')
  try {
    await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) },
      body: JSON.stringify({
        workshop_id:    workshopId,
        workshop_title: workshopTitle,
        attendee_name:  form.name,
        attendee_email: form.email,
        attendee_phone: form.phone,
        notes:          form.notes,
        is_free:        isFree,
        category:       'workshop',
      }),
    })
  } catch { /* non-fatal — payment already recorded */ }
}

export default function WorkshopsPage() {
  const { navigate } = useRouter()
  const { openPayment } = usePayment()   // ← centralized

  const [screen,     setScreen]   = useState('list')   // 'list' | 'register' | 'done'
  const [workshop,   setWorkshop] = useState(null)
  const [registered, setReg]      = useState([])
  const [form,       setForm]     = useState({ name:'', email:'', phone:'', notes:'' })

  const upForm = (k, v) => setForm(f => ({ ...f, [k]:v }))
  const formOK = form.name.trim() && form.email.includes('@') && form.phone.trim()

  function openRegister(ws) {
    setWorkshop(ws)
    setForm({ name:'', email:'', phone:'', notes:'' })
    setScreen('register')
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  async function handleFreeRegister() {
    // Save registration to DB
    await saveRegistration({ workshopId:workshop.id, workshopTitle:workshop.title, form, isFree:true })
    setReg(prev => [...prev, workshop.id])
    setScreen('done')
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  async function handleProceedPay() {
    // 1. Save registration intent to DB first
    await saveRegistration({ workshopId:workshop.id, workshopTitle:workshop.title, form, isFree:false })

    // 2. Open centralized payment modal
    const result = await openPayment({
      type:         'appointment',   // 'appointment' groups workshops with sessions in admin
      amount:       workshop.price,
      title:        workshop.title,
      description:  `${workshop.date} · ${workshop.time} · ${workshop.mode}`,
      itemLines:    [{ label:workshop.title, amount:workshop.price }],
      couponEnabled: true,
      // No COD for workshops — digital payment or pay on arrival
      allowedGateways: ['esewa','khalti','fonepay','stripe','cash'],
      // Stored in payments table — admin queries by workshop_id or category='workshop'
      metadata: {
        workshop_id:    workshop.id,
        workshop_title: workshop.title,
        workshop_date:  workshop.date,
        attendee_name:  form.name,
        attendee_email: form.email,
        attendee_phone: form.phone,
        facilitator:    workshop.facilitator,
        mode:           workshop.mode,
        category:       'workshop',
      },
    })

    if (result.success) {
      setReg(prev => [...prev, workshop.id])
      setScreen('done')
      window.scrollTo({ top:0, behavior:'smooth' })
    }
    // If cancelled: stay on register screen, user can try again
  }

  // ── SUCCESS ──────────────────────────────────────────────────────────────
  if (screen === 'done') return (
    <div className="page-wrapper" style={{ background:C.skyGhost }}>
      <div style={{ maxWidth:520, margin:'0 auto', padding:'5rem 2rem' }}>
        <div style={{ background:C.white, borderRadius:24, border:`1.5px solid ${C.borderFaint}`, boxShadow:`0 8px 40px rgba(0,191,255,0.12)`, overflow:'hidden' }}>
          <div style={{ height:4, background:btnGrad }} />
          <div style={{ padding:'3rem 2.5rem', textAlign:'center' }}>
            <div style={{ width:76, height:76, borderRadius:'50%', background:heroGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.75rem', fontSize:'2rem', boxShadow:`0 8px 28px rgba(0,191,255,0.35)` }}>✓</div>
            <div style={{ display:'inline-block', background:sectionGrad, border:`1px solid ${C.borderFaint}`, borderRadius:100, padding:'0.28rem 1rem', marginBottom:'0.9rem' }}>
              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:800, color:C.skyDeep, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                {workshop?.free ? '🎓 Registered Free' : '💳 Payment Confirmed'}
              </span>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.9rem', color:C.textDark, marginBottom:'0.75rem' }}>
              {workshop?.free ? "You're Registered!" : 'Thank You!'}
            </h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:C.textMid, lineHeight:1.78, marginBottom:'1.5rem' }}>
              {workshop?.free
                ? `Your spot is confirmed for "${workshop?.title}". A Zoom link / directions will be emailed to ${form.email}.`
                : `Your registration and payment have been recorded. Confirmation will be sent to ${form.email}.`}
            </p>
            <div style={{ background:C.white, border:`1px solid ${C.borderFaint}`, borderRadius:12, padding:'0.9rem', marginBottom:'1.75rem', textAlign:'left' }}>
              {[['Workshop',workshop?.title],['Date',workshop?.date],['Time',workshop?.time],['Mode',workshop?.mode],['Facilitator',workshop?.facilitator]].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.35rem 0', borderBottom:`1px solid ${C.borderFaint}`, fontFamily:'var(--font-body)', fontSize:'0.78rem' }}>
                  <span style={{ color:C.textLight, fontWeight:700 }}>{k}</span>
                  <span style={{ color:C.textDark, fontWeight:600, textAlign:'right', maxWidth:'60%' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => navigate('/')} style={{ padding:'0.7rem 1.75rem', borderRadius:12, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}>🏠 Back to Home</button>
              <button onClick={() => { setScreen('list') }} style={{ padding:'0.7rem 1.4rem', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}>Browse More Workshops</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── REGISTER FORM ─────────────────────────────────────────────────────────
  if (screen === 'register') return (
    <div className="page-wrapper" style={{ background:C.skyGhost }}>
      <div style={{ background:heroGrad, padding:'4rem 3rem 3rem', position:'relative', overflow:'hidden' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.28rem 0.9rem', marginBottom:'0.85rem' }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.9)', textTransform:'uppercase' }}>📋 Workshop Registration</span>
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,2rem)', color:'white', marginBottom:'0.4rem' }}>{workshop?.title}</h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:'rgba(255,255,255,0.78)' }}>
            {workshop?.date} · {workshop?.time} · {workshop?.mode} · {workshop?.free ? 'FREE' : `NPR ${workshop?.price?.toLocaleString()}`}
          </p>
          <button onClick={() => setScreen('list')} style={{ marginTop:'1rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.32rem 1rem', cursor:'pointer' }}>← Back to Workshops</button>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:'2.5rem auto', padding:'0 2rem 5rem' }}>
        <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.borderFaint}`, overflow:'hidden', boxShadow:`0 4px 24px rgba(0,191,255,0.07)` }}>
          <div style={{ padding:'1.1rem 1.5rem', background:sectionGrad, borderBottom:`1px solid ${C.borderFaint}` }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', color:C.textDark }}>Workshop Details</span>
          </div>
          <div style={{ padding:'1rem 1.5rem 0.5rem' }}>
            {[['Facilitator',workshop?.facilitator],['Date',workshop?.date],['Time',workshop?.time],['Mode',workshop?.mode],['Seats Left',`${workshop?.seats-(workshop?.booked||0)} remaining`],['Fee',workshop?.free?'FREE':`NPR ${workshop?.price?.toLocaleString()}`]].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.4rem 0', borderBottom:`1px solid ${C.borderFaint}`, fontFamily:'var(--font-body)', fontSize:'0.82rem' }}>
                <span style={{ color:C.textLight, fontWeight:700 }}>{k}</span>
                <span style={{ color:C.textDark, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ padding:'0.9rem 1.5rem', background:sectionGrad, borderBottom:`1px solid ${C.borderFaint}`, borderTop:`1px solid ${C.borderFaint}`, marginTop:'0.5rem' }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', color:C.textDark }}>Your Details</span>
          </div>
          <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            <FInput label="Full Name"      required placeholder="Priya Sharma"   value={form.name}  onChange={e => upForm('name',e.target.value)} />
            <FInput label="Email"          required type="email" placeholder="you@email.com" value={form.email} onChange={e => upForm('email',e.target.value)} />
            <FInput label="Phone/WhatsApp" required type="tel" placeholder="98XXXXXXXX" value={form.phone} onChange={e => upForm('phone',e.target.value)} />
            <div>
              <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.66rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.4rem' }}>Notes (optional)</label>
              <textarea value={form.notes} onChange={e => upForm('notes',e.target.value)} placeholder="Any accessibility requirements or questions…" rows={2}
                style={{ width:'100%', padding:'0.75rem 1rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:10, fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textDark, background:C.white, outline:'none', resize:'vertical', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor=C.skyBright}
                onBlur={e => e.target.style.borderColor=C.borderFaint}/>
            </div>
          </div>

          {!workshop?.free && (
            <div style={{ margin:'0 1.5rem 1rem', background:'#e8f8f0', border:'1px solid #a8d8b8', borderRadius:10, padding:'0.75rem 1rem', fontSize:'0.8rem', color:'#1a5a3a' }}>
              ℹ️ You'll choose your payment method (eSewa, Khalti, Card, etc.) on the next screen after submitting your details.
            </div>
          )}

          <div style={{ padding:'1.1rem 1.5rem', borderTop:`1px solid ${C.borderFaint}`, display:'flex', gap:'0.75rem' }}>
            <button onClick={() => setScreen('list')} style={{ padding:'0.75rem 1.2rem', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.88rem', cursor:'pointer' }}>← Back</button>
            <button onClick={() => { if (!formOK) return; workshop.free ? handleFreeRegister() : handleProceedPay() }} disabled={!formOK}
              style={{ flex:1, padding:'0.88rem', borderRadius:12, border:'none', background:formOK?btnGrad:C.borderFaint, color:formOK?'white':C.textLight, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.92rem', cursor:formOK?'pointer':'not-allowed', boxShadow:formOK?'0 6px 22px rgba(0,191,255,0.35)':'none', transition:'all 0.2s' }}>
              {!formOK ? 'Fill in your details' : workshop?.free ? '🎓 Register Free →' : `💳 Choose Payment — NPR ${workshop?.price?.toLocaleString()} →`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── WORKSHOP LIST ─────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <style>{`
        .workshops-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        @media(max-width:1024px){.workshops-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:600px){.workshops-grid{grid-template-columns:1fr;}}
      `}</style>

      <div className="page-hero" style={{ background:'var(--sky-light)' }}>
        <span className="section-tag">Workshops &amp; Events</span>
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
          {WORKSHOPS.map(ws => {
            const isReg = registered.includes(ws.id)
            const pct   = Math.round((ws.booked/ws.seats)*100)
            const urgent = pct >= 80
            return (
              <div key={ws.id}
                style={{ background:isReg?C.skyFainter:'var(--off-white)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:`1.5px solid ${isReg?C.skyBright:ws.full?'#f97316':'var(--earth-cream)'}`, boxShadow:isReg?`0 4px 20px rgba(0,191,255,0.12)`:'var(--shadow-soft)', transition:'all 0.25s', opacity:ws.full&&!isReg?0.75:1 }}
                onMouseEnter={e => !ws.full && (e.currentTarget.style.transform='translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}>
                <div style={{ background:isReg?`linear-gradient(135deg,${C.skyFaint},${C.skyFainter})`:ws.color, padding:'1.75rem', fontSize:'2.5rem', textAlign:'center', position:'relative' }}>
                  {ws.emoji}
                  {isReg && <div style={{ position:'absolute', top:10, right:10, background:btnGrad, borderRadius:100, padding:'3px 10px', fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:'white' }}>✓ REGISTERED</div>}
                  {ws.full && !isReg && <div style={{ position:'absolute', top:10, right:10, background:'#f97316', borderRadius:100, padding:'3px 10px', fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:'white' }}>FULL</div>}
                </div>
                <div style={{ padding:'1.4rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.3rem' }}>
                    <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--blue-mid)' }}>{ws.mode}</span>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color:'var(--green-deep)' }}>{ws.free?'FREE':`NPR ${ws.price.toLocaleString()}`}</span>
                  </div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--blue-deep)', marginBottom:'0.4rem', lineHeight:1.3 }}>{ws.title}</h3>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'var(--text-light)', marginBottom:'0.6rem' }}>👤 {ws.facilitator}</p>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'var(--text-mid)', marginBottom:'0.6rem' }}>📅 {ws.date} · {ws.time}</div>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:'0.85rem' }}>
                    {ws.tags.map((t,j) => <span key={j} className="tag" style={{ fontSize:'0.65rem' }}>{t}</span>)}
                  </div>
                  <div style={{ marginBottom:'1rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-body)', fontSize:'0.7rem', color:urgent?'#e53e3e':'var(--text-light)', marginBottom:'0.3rem', fontWeight:urgent?700:400 }}>
                      <span>{urgent?'⚠ Almost full!':'Seats available'}</span>
                      <span>{ws.seats-ws.booked} of {ws.seats} left</span>
                    </div>
                    <div style={{ height:5, background:'var(--earth-cream)', borderRadius:100, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background:pct>=90?'linear-gradient(90deg,#e53e3e,#f97316)':pct>=70?'linear-gradient(90deg,#f97316,#ffd54f)':btnGrad, borderRadius:100, transition:'width 0.3s' }}/>
                    </div>
                  </div>
                  {isReg ? (
                    <button className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }} onClick={() => navigate('/portal')}>✓ Registered — View Details</button>
                  ) : ws.full ? (
                    <button disabled style={{ width:'100%', padding:'0.6rem', borderRadius:12, border:'1.5px solid var(--earth-cream)', background:'var(--earth-cream)', color:'var(--text-light)', fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.82rem', cursor:'not-allowed' }}>Workshop Full</button>
                  ) : (
                    <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={() => openRegister(ws)}>
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