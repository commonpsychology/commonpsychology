// src/pages/BookingPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'
import { therapists as therapistsApi, appointments } from '../services/api'

const C = { skyDeep:'#007BA8', skyBright:'#00BFFF', skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', white:'#ffffff', textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa', border:'#b0d4e8', borderFaint:'#daeef8' }
const btnGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`
const STEPS   = ['Therapist','Session Type','Date & Time','Confirm']
const SESSION_TYPES = [{ label:'Online Video',icon:'💻',value:'online' },{ label:'In-Person',icon:'🏢',value:'in_person' },{ label:'Phone Call',icon:'📞',value:'phone' }]
const TIME_SLOTS = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM']

function StepBar({ step }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, marginTop:'1.25rem' }}>
      {STEPS.map((label, i) => {
        const num=i+1; const done=step>num; const active=step===num
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', flex:i<STEPS.length-1?1:'none' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', background:done||active?btnGrad:'rgba(255,255,255,0.2)', border:done||active?'none':'1.5px solid rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:800, color:done||active?'white':'rgba(255,255,255,0.7)', boxShadow:active?'0 3px 12px rgba(0,191,255,0.4)':'none', transition:'all 0.25s' }}>
                {done?'✓':num}
              </div>
              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', fontWeight:active?700:500, color:active?'white':done?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.55)', whiteSpace:'nowrap' }}>{label}</span>
            </div>
            {i<STEPS.length-1&&<div style={{ flex:1, height:1.5, background:done?'rgba(255,255,255,0.6)':'rgba(255,255,255,0.2)', margin:'0 0.6rem' }}/>}
          </div>
        )
      })}
    </div>
  )
}

export default function BookingPage() {
  const { params, navigate }    = useRouter()
  const { user }                = useAuth()
  const [step, setStep]         = useState(params?.therapist ? 2 : 1)
  const [therapistsList, setTherapistsList] = useState([])
  const [loadingTherapists, setLoadingTherapists] = useState(true)
  const [selected, setSelected] = useState({
    therapist: params?.therapist || null,
    type:      'online',
    date:      '',
    time:      '',
    notes:     '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    therapistsApi.list({ limit: 20 })
      .then(d => setTherapistsList(d.therapists || []))
      .catch(() => setTherapistsList([]))
      .finally(() => setLoadingTherapists(false))
  }, [])

  const minDate = new Date().toISOString().split('T')[0]

  async function handleConfirm() {
    if (!user) { navigate('/signin'); return }
    if (!selected.therapist || !selected.date || !selected.time) {
      setError('Please complete all required fields.'); return
    }
    setSubmitting(true); setError('')
    try {
      // 1. Book the appointment in DB
      const dateTime = new Date(`${selected.date} ${selected.time}`).toISOString()
      const data = await appointments.book(
        selected.therapist.id,
        dateTime,
        selected.type,
        selected.notes
      )

      // 2. Build booking payload for payment page
      const bookingPayload = {
        appointmentId:  data.appointment?.id || data.id,
        therapistId:    selected.therapist.id,
        therapistName:  selected.therapist.profiles?.full_name || 'Therapist',
        therapistEmoji: '👩‍⚕️',
        therapistRole:  selected.therapist.license_type || 'Licensed Therapist',
        type:           SESSION_TYPES.find(t => t.value === selected.type)?.label || selected.type,
        date:           selected.date,
        time:           selected.time,
        sessionNo:      1,
        clientName:     user.fullName || user.name || 'Client',
        clientEmail:    user.email || '',
        clientPhone:    user.phone || '',
        notes:          selected.notes,
        fee:            selected.therapist.consultation_fee || 2000,
      }

      // 3. Save to sessionStorage so PaymentPage can read it
      sessionStorage.setItem('pendingBooking', JSON.stringify(bookingPayload))

      // 4. Navigate to payment page
      navigate('/payment')

    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`, padding:'3rem 2rem 2rem', color:'white' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <span style={{ fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', opacity:0.7 }}>Book a Session</span>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', margin:'0.5rem 0' }}>Schedule Your Therapy</h1>
          <StepBar step={step}/>
        </div>
      </div>

      <div style={{ background:'var(--off-white)', padding:'3rem 2rem', minHeight:'60vh' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>

          {/* Step 1: Choose therapist */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'1.5rem' }}>Choose a Therapist</h2>
              {loadingTherapists ? (
                <p style={{ color:'var(--text-light)' }}>Loading therapists…</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {therapistsList.map(t => {
                    const pr = t.profiles||{}; const active = selected.therapist?.id===t.id
                    return (
                      <div key={t.id} onClick={()=>setSelected(s=>({...s,therapist:t}))}
                        style={{ background:active?C.skyFaint:C.white, border:`1.5px solid ${active?C.skyBright:C.borderFaint}`, borderRadius:16, padding:'1.25rem', cursor:'pointer', boxShadow: active ? `0 0 0 3px rgba(0,191,255,0.1)` : 'none', transition:'all 0.2s', display:'flex', alignItems:'center', gap:'1rem' }}>
                        <div style={{ width:52, height:52, borderRadius:'50%', background:active?btnGrad:'var(--green-mist)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>
                          {pr.avatar_url?<img src={pr.avatar_url} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} alt=""/>:'👩‍⚕️'}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontFamily:'var(--font-display)', fontWeight:600, color:active?C.skyDeep:C.textDark }}>{pr.full_name||'Therapist'}</div>
                          <div style={{ fontSize:'0.78rem', color:C.textLight }}>{t.license_type||'Licensed Therapist'} · NPR {t.consultation_fee?.toLocaleString()||'—'}/session</div>
                          <div style={{ display:'flex', gap:'0.4rem', marginTop:'0.4rem', flexWrap:'wrap' }}>
                            {(t.specializations||[]).slice(0,3).map((s,i)=><span key={i} style={{ fontSize:'0.7rem', padding:'0.15rem 0.5rem', borderRadius:100, background:active?'rgba(0,191,255,0.12)':'var(--green-mist)', color:active?C.skyDeep:'var(--green-deep)', fontWeight:600 }}>{s}</span>)}
                          </div>
                        </div>
                        <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'0.25rem 0.65rem', borderRadius:100, background:t.is_available?'#e8f8f0':'#f8f0e8', color:t.is_available?'#1a7a4a':'#8a5a1a', flexShrink:0 }}>
                          {t.is_available?'● Available':'○ Busy'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
              <button className="btn btn-primary btn-lg" disabled={!selected.therapist}
                style={{ marginTop:'2rem', opacity:selected.therapist?1:0.5 }}
                onClick={()=>selected.therapist&&setStep(2)}>
                Continue →
              </button>
            </div>
          )}

          {/* Step 2: Session type */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'1.5rem' }}>Choose Session Type</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
                {SESSION_TYPES.map(t => {
                  const active=selected.type===t.value
                  return (
                    <div key={t.value} onClick={()=>setSelected(s=>({...s,type:t.value}))}
                      style={{ border:`1.5px solid ${active?C.skyBright:C.borderFaint}`, borderRadius:16, padding:'1.5rem 1rem', textAlign:'center', cursor:'pointer', background:active?C.skyFaint:C.white, transition:'all 0.2s' }}>
                      <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{t.icon}</div>
                      <div style={{ fontWeight:700, color:active?C.skyDeep:C.textDark, fontSize:'0.95rem' }}>{t.label}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                <button className="btn btn-outline" onClick={()=>setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={()=>setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3: Date & time */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'1.5rem' }}>Pick a Date & Time</h2>
              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>Date</label>
                <input type="date" min={minDate} value={selected.date}
                  onChange={e=>setSelected(s=>({...s,date:e.target.value}))}
                  style={{ padding:'0.75rem 1rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:10, fontSize:'0.9rem', color:C.textDark, outline:'none', width:'100%', boxSizing:'border-box' }}/>
              </div>
              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>Time</label>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(100px,1fr))', gap:'0.5rem' }}>
                  {TIME_SLOTS.map(t => (
                    <button key={t} onClick={()=>setSelected(s=>({...s,time:t}))}
                      style={{ padding:'0.6rem', border:`1.5px solid ${selected.time===t?C.skyBright:C.borderFaint}`, borderRadius:10, fontSize:'0.82rem', fontWeight:selected.time===t?700:400, background:selected.time===t?C.skyFaint:C.white, color:selected.time===t?C.skyDeep:C.textMid, cursor:'pointer', transition:'all 0.15s' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>Notes (optional)</label>
                <textarea value={selected.notes} onChange={e=>setSelected(s=>({...s,notes:e.target.value}))}
                  placeholder="Share anything relevant for your therapist…" rows={3}
                  style={{ width:'100%', padding:'0.75rem 1rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:10, fontSize:'0.88rem', color:C.textDark, outline:'none', resize:'vertical', boxSizing:'border-box' }}/>
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                <button className="btn btn-outline" onClick={()=>setStep(2)}>← Back</button>
                <button className="btn btn-primary btn-lg" disabled={!selected.date||!selected.time}
                  style={{ opacity:selected.date&&selected.time?1:0.5 }} onClick={()=>setStep(4)}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'1.5rem' }}>Confirm Booking</h2>
              <div style={{ background:C.white, borderRadius:16, padding:'2rem', border:`1.5px solid ${C.borderFaint}`, marginBottom:'1.5rem' }}>
                {[
                  ['Therapist',    selected.therapist?.profiles?.full_name||'—'],
                  ['Session Type', SESSION_TYPES.find(t=>t.value===selected.type)?.label||'—'],
                  ['Date',         selected.date],
                  ['Time',         selected.time],
                  ['Fee',          `NPR ${selected.therapist?.consultation_fee?.toLocaleString()||'—'}`],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.75rem 0', borderBottom:`1px solid ${C.borderFaint}` }}>
                    <span style={{ fontSize:'0.85rem', color:C.textLight, fontWeight:600 }}>{k}</span>
                    <span style={{ fontSize:'0.9rem', color:C.textDark, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>

              {!user && (
                <div style={{ background:'#fff9e6', border:'1.5px solid #f5d87a', borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1.25rem', fontSize:'0.85rem', color:'#7a5a00' }}>
                  ⚠️ You need to{' '}
                  <button onClick={()=>navigate('/signin')} style={{ background:'none', border:'none', color:'var(--green-deep)', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>sign in</button>
                  {' '}to complete your booking.
                </div>
              )}

              {error && (
                <div style={{ background:'#fff0f0', border:'1.5px solid #f5a0a0', borderRadius:8, padding:'0.75rem 1rem', marginBottom:'1rem', color:'#c0392b', fontSize:'0.875rem' }}>
                  {error}
                </div>
              )}

              <div style={{ background:'#e8f8f0', border:'1px solid #a8d8b8', borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1.25rem', fontSize:'0.82rem', color:'#1a5a3a' }}>
                ℹ️ Your appointment will be saved and you'll proceed to complete payment on the next screen.
              </div>

              <div style={{ display:'flex', gap:'1rem' }}>
                <button className="btn btn-outline" onClick={()=>setStep(3)}>← Back</button>
                <button className="btn btn-primary btn-lg"
                  style={{ flex:1, justifyContent:'center', opacity: submitting ? 0.7 : 1 }}
                  onClick={handleConfirm}
                  disabled={submitting}>
                  {submitting ? 'Saving…' : 'Proceed to Payment →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}