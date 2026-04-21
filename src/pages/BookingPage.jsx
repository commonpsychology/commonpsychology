// src/pages/BookingPage.jsx
import { useState, useEffect, useCallback } from 'react'
import { useRouter }    from '../context/RouterContext'
import { useAuth }      from '../context/AuthContext'
import { usePayment }   from '../components/PaymentModal'
import { useTherapists } from '../context/TherapistsContext'
import { appointments } from '../services/api'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const C = {
  skyDeep:'#007BA8', skyBright:'#00BFFF', skyFaint:'#E0F7FF', skyFainter:'#F0FBFF',
  white:'#ffffff', textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8', red:'#c0392b', redFaint:'#fff0f0',
  amber:'#8a5a1a', amberFaint:'#fff9e6',
}
const btnGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`
const STEPS   = ['Therapist','Session Type','Date & Time','Confirm']

const SESSION_TYPES = [
  { label:'Online Video', icon:'💻', value:'online'    },
  { label:'In-Person',    icon:'🏢', value:'in_person' },
  { label:'Phone Call',   icon:'📞', value:'phone'     },
]

const ALL_TIME_SLOTS = [
  { label:'9:00 AM',  hour:9  },{ label:'10:00 AM', hour:10 },
  { label:'11:00 AM', hour:11 },{ label:'12:00 PM', hour:12 },
  { label:'1:00 PM',  hour:13 },{ label:'2:00 PM',  hour:14 },
  { label:'3:00 PM',  hour:15 },{ label:'4:00 PM',  hour:16 },
  { label:'5:00 PM',  hour:17 },
]

function getAvailableSlots(therapist, dateStr) {
  if (!therapist || !dateStr) return ALL_TIME_SLOTS
  let hours = therapist.available_hours
  if (typeof hours === 'string') {
    try { hours = JSON.parse(hours) } catch { hours = [] }
  }
  if (!hours || !Array.isArray(hours) || hours.length === 0) return ALL_TIME_SLOTS
  const d = new Date(dateStr + 'T00:00')
  const dayName = d.toLocaleDateString('en-US', { weekday: 'long' })
  const rule = hours.find(h => h.day === dayName)
  if (!rule) return []
  const [startH] = rule.start.split(':').map(Number)
  const [endH]   = rule.end.split(':').map(Number)
  return ALL_TIME_SLOTS.filter(s => s.hour >= startH && s.hour < endH)
}

function slotToISO(dateStr, timeLabel) {
  const slot = ALL_TIME_SLOTS.find(s => s.label === timeLabel)
  if (!slot || !dateStr) return null
  const d = new Date(dateStr + 'T00:00')
  d.setHours(slot.hour, 0, 0, 0)
  return d.toISOString()
}

// ── StepBar: desktop = horizontal row, mobile = 2-per-row grid ──────────────
const STEP_BAR_CSS = `
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

  .stepbar-wrap {
    display: flex;
    align-items: center;
    gap: 0;
    margin-top: 1.25rem;
    flex-wrap: nowrap;
  }

  /* ── Mobile: 2-column grid ── */
  @media (max-width: 600px) {
    .stepbar-wrap {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
      margin-top: 1rem;
    }
    .stepbar-connector { display: none !important; }
  }

  .stepbar-item {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .stepbar-item {
      background: rgba(255,255,255,0.12);
      border-radius: 10px;
      padding: 0.5rem 0.65rem;
    }
  }

  .stepbar-connector {
    flex: 1;
    height: 1.5px;
    margin: 0 0.4rem;
    background: rgba(255,255,255,0.2);
  }
  .stepbar-connector.done {
    background: rgba(255,255,255,0.6);
  }
`

function StepBar({ step }) {
  useEffect(() => {
    if (!document.getElementById('stepbar-css')) {
      const s = document.createElement('style')
      s.id = 'stepbar-css'
      s.textContent = STEP_BAR_CSS
      document.head.appendChild(s)
    }
  }, [])

  return (
    <div className="stepbar-wrap">
      {STEPS.map((label, i) => {
        const num    = i + 1
        const done   = step > num
        const active = step === num
        return (
          <>
            <div key={i} className="stepbar-item">
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background:  done || active ? btnGrad : 'rgba(255,255,255,0.18)',
                border:      done || active ? 'none'  : '1.5px solid rgba(255,255,255,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.68rem', fontWeight: 800,
                color: done || active ? 'white' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.25s',
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.76rem',
                fontWeight: active ? 700 : 500,
                color: active ? 'white' : done ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.5)',
                whiteSpace: 'nowrap',
              }}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div key={`c${i}`} className={`stepbar-connector${done ? ' done' : ''}`} />
            )}
          </>
        )
      })}
    </div>
  )
}

export default function BookingPage() {
  const { params, navigate }   = useRouter()
  const { user }               = useAuth()
  const { openPayment }        = usePayment()
  const { therapists, loading: loadingTherapists } = useTherapists()

  const [step,         setStep]         = useState(params?.therapist ? 2 : 1)
  const [selected,     setSelected]     = useState({ therapist: params?.therapist || null, type:'online', date:'', time:'', notes:'' })
  const [bookedSlots,  setBookedSlots]  = useState([])
  const [userSlots,    setUserSlots]    = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const allSpecializations = ['All', ...Array.from(new Set(therapists.flatMap(t => t.specializations || []))).sort()]
  const filteredTherapists = activeFilter === 'All' ? therapists : therapists.filter(t => (t.specializations||[]).includes(activeFilter))

  const loadBookedSlots = useCallback(async () => {
    if (!selected.therapist || !selected.date) { setBookedSlots([]); setUserSlots([]); return }
    setLoadingSlots(true)
    try {
      const token   = localStorage.getItem('accessToken')
      const headers = { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) }
      const therapistId = selected.therapist.id

      const tRes = await fetch(`${API_BASE}/appointments/booked-slots?therapistId=${therapistId}&date=${selected.date}`, { headers })
      if (tRes.ok) {
        const d = await tRes.json()
        setBookedSlots(d.slots || d.bookedSlots || [])
      }

      if (user) {
        const uRes = await fetch(`${API_BASE}/appointments/my-slots?date=${selected.date}`, { headers })
        if (uRes.ok) {
          const d = await uRes.json()
          setUserSlots(d.slots || d.bookedSlots || [])
        }
      }
    } catch (err) { console.error('Slot load error:', err) }
    finally { setLoadingSlots(false) }
  }, [selected.therapist, selected.date, user])

  useEffect(() => { if (step === 3) loadBookedSlots() }, [step, selected.therapist?.id, selected.date])

  function getSlotStatus(label) {
    const norm = s => s.replace(/\s+/g,'').toUpperCase()
    const nl = norm(label)
    if (bookedSlots.some(b => norm(b) === nl)) return 'therapist_booked'
    if (userSlots.some(b => norm(b) === nl))   return 'user_booked'
    return 'available'
  }

  async function handleConfirm() {
    if (!user) { navigate('/signin'); return }
    if (!selected.therapist || !selected.date || !selected.time) { setError('Please complete all required fields.'); return }
    const status = getSlotStatus(selected.time)
    if (status === 'therapist_booked') { setError('That slot was just booked. Please choose another time.'); return }
    if (status === 'user_booked')      { setError('You already have an appointment at this time.'); return }

    setSubmitting(true); setError('')
    try {
      const dateTime     = slotToISO(selected.date, selected.time)
      const therapistId  = selected.therapist.id
      const data         = await appointments.book(therapistId, dateTime, selected.type, selected.notes)
      const appointmentId = data.appointment?.id || data.id
      const fee          = selected.therapist.consultation_fee || 2000
      const therapistName = selected.therapist.full_name || 'Therapist'
      const sessionLabel = SESSION_TYPES.find(t => t.value === selected.type)?.label || selected.type

      const result = await openPayment({
        type:'appointment', amount:fee,
        title:`Session with ${therapistName}`,
        description:`${selected.date} · ${selected.time} · ${sessionLabel}`,
        itemLines:[{ label:`Therapy session (50 min) — ${sessionLabel}`, amount:fee }],
        couponEnabled:true,
        allowedGateways:['esewa','khalti','fonepay','stripe','bank_transfer'],
        metadata:{ appointment_id:appointmentId, therapist_id:therapistId, therapist_name:therapistName, session_type:selected.type, scheduled_at:dateTime, client_name:user.fullName||user.full_name||user.name||'', client_email:user.email||'', category:'appointment' },
      })

      if (result.success) {
        navigate('/portal')
      } else if (!result.cancelled) {
        setError('Payment was not completed. Your booking slot is held for 30 minutes.')
      }
    } catch (err) {
      if (err.status === 409 || err.message?.includes('conflict')) {
        setError('This slot was just taken. Please choose a different time.')
        await loadBookedSlots(); setStep(3)
      } else {
        setError(err.message || 'Booking failed. Please try again.')
      }
    } finally { setSubmitting(false) }
  }

  const minDate = new Date().toISOString().split('T')[0]
  const availableSlotsForDay = getAvailableSlots(selected.therapist, selected.date)

  return (
    <div className="page-wrapper">
      <div style={{ background:`linear-gradient(135deg,${C.skyDeep},${C.skyBright})`, padding:'3rem 2rem 2rem', color:'white' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>
          <span style={{ fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', opacity:0.7 }}>Book a Session</span>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', margin:'0.5rem 0' }}>Schedule Your Therapy</h1>
          <StepBar step={step}/>
        </div>
      </div>

      <div style={{ background:'var(--off-white)', padding:'3rem 2rem', minHeight:'60vh' }}>
        <div style={{ maxWidth:800, margin:'0 auto' }}>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'0.35rem' }}>Choose a Therapist</h2>
              <p style={{ fontSize:'0.85rem', color:C.textLight, marginBottom:'1.5rem' }}>
                {therapists.length} therapist{therapists.length !== 1 ? 's' : ''} available
              </p>

              {!loadingTherapists && allSpecializations.length > 1 && (
                <div style={{ marginBottom:'1.5rem' }}>
                  <div style={{ fontSize:'0.7rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:C.textLight, marginBottom:'0.6rem' }}>Filter by Specialization</div>
                  <div style={{ display:'flex', gap:'0.45rem', flexWrap:'wrap' }}>
                    {allSpecializations.map(spec => {
                      const isActive = activeFilter === spec
                      const count = spec === 'All' ? therapists.length : therapists.filter(t => (t.specializations||[]).includes(spec)).length
                      return (
                        <button key={spec} onClick={() => setActiveFilter(spec)} style={{ padding:'0.32rem 0.8rem', borderRadius:100, border:`1.5px solid ${isActive?C.skyBright:C.borderFaint}`, background:isActive?`linear-gradient(135deg,${C.skyDeep},${C.skyBright})`:C.white, color:isActive?'white':C.textMid, fontSize:'0.77rem', fontWeight:isActive?700:500, cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:'0.35rem' }}>
                          {spec}
                          <span style={{ background:isActive?'rgba(255,255,255,0.25)':C.skyFaint, color:isActive?'white':C.skyDeep, borderRadius:100, padding:'0.05rem 0.4rem', fontSize:'0.63rem', fontWeight:800 }}>{count}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {loadingTherapists ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {[1,2,3].map(i => <div key={i} style={{ height:90, borderRadius:16, background:'linear-gradient(90deg,#f0f4f8 25%,#e8eef4 50%,#f0f4f8 75%)', backgroundSize:'200% 100%', animation:'shimmer 1.4s infinite' }}/>)}
                </div>
              ) : filteredTherapists.length === 0 ? (
                <div style={{ textAlign:'center', padding:'3rem 1rem', background:C.white, borderRadius:16, border:`1.5px solid ${C.borderFaint}` }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🔍</div>
                  <div style={{ fontFamily:'var(--font-display)', color:C.textDark, fontSize:'1.1rem', marginBottom:'0.4rem' }}>No therapists found</div>
                  <button onClick={() => setActiveFilter('All')} style={{ padding:'0.4rem 1rem', borderRadius:100, border:`1.5px solid ${C.skyBright}`, background:C.skyFaint, color:C.skyDeep, fontSize:'0.8rem', fontWeight:700, cursor:'pointer' }}>Show all</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  {filteredTherapists.map(t => {
                    const isActive = selected.therapist?.id === t.id
                    return (
                      <div key={t.id} onClick={() => setSelected(s => ({ ...s, therapist:t }))}
                        style={{ background:isActive?C.skyFaint:C.white, border:`1.5px solid ${isActive?C.skyBright:C.borderFaint}`, borderRadius:16, padding:'1.25rem', cursor:'pointer', boxShadow:isActive?'0 0 0 3px rgba(0,191,255,0.1)':'0 1px 4px rgba(0,0,0,0.04)', transition:'all 0.2s', display:'flex', alignItems:'center', gap:'1rem' }}>
                        <div style={{ width:52, height:52, borderRadius:'50%', flexShrink:0, overflow:'hidden', background:isActive?btnGrad:'#e8f4fb', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {t.avatar_url ? <img src={t.avatar_url} alt={t.full_name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='flex' }}/> : null}
                          <span style={{ display:t.avatar_url?'none':'flex', fontSize:'1.4rem', alignItems:'center', justifyContent:'center', width:'100%', height:'100%' }}>👩‍⚕️</span>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:'var(--font-display)', fontWeight:600, color:isActive?C.skyDeep:C.textDark, fontSize:'1rem' }}>{t.full_name}</div>
                          <div style={{ fontSize:'0.78rem', color:C.textLight, marginTop:'0.15rem' }}>
                            {t.license_type}{t.experience_years ? ` · ${t.experience_years} yrs exp` : ''} · <strong style={{ color:isActive?C.skyDeep:C.textMid }}>NPR {t.consultation_fee?.toLocaleString() || '—'}</strong>/session
                          </div>
                          {(t.specializations||[]).length > 0 && (
                            <div style={{ display:'flex', gap:'0.35rem', marginTop:'0.45rem', flexWrap:'wrap' }}>
                              {t.specializations.map((s,i) => (
                                <span key={i} style={{ fontSize:'0.68rem', padding:'0.15rem 0.5rem', borderRadius:100, background:isActive?'rgba(0,191,255,0.12)':C.skyFainter, color:isActive?C.skyDeep:C.textMid, fontWeight:500, border:`1px solid ${C.borderFaint}` }}>{s}</span>
                              ))}
                            </div>
                          )}
                          {t.rating > 0 && (
                            <div style={{ fontSize:'0.72rem', color:C.textLight, marginTop:'0.3rem' }}>
                              {'★'.repeat(Math.round(t.rating))}{'☆'.repeat(5-Math.round(t.rating))} {Number(t.rating).toFixed(1)} ({t.total_reviews} reviews)
                            </div>
                          )}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.4rem', flexShrink:0 }}>
                          <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'0.25rem 0.65rem', borderRadius:100, background:t.is_available?'#e8f8f0':'#f8f0e8', color:t.is_available?'#1a7a4a':'#8a5a1a' }}>
                            {t.is_available ? '● Available' : '○ Busy'}
                          </span>
                          {isActive && <span style={{ fontSize:'0.68rem', fontWeight:800, padding:'0.2rem 0.55rem', borderRadius:100, background:btnGrad, color:'white' }}>✓ Selected</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <button className="btn btn-primary btn-lg" disabled={!selected.therapist} style={{ marginTop:'2rem', opacity:selected.therapist?1:0.5 }} onClick={() => selected.therapist && setStep(2)}>
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'1.5rem' }}>Choose Session Type</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
                {SESSION_TYPES.map(t => {
                  const active = selected.type === t.value
                  return (
                    <div key={t.value} onClick={() => setSelected(s => ({ ...s, type:t.value }))}
                      style={{ border:`1.5px solid ${active?C.skyBright:C.borderFaint}`, borderRadius:16, padding:'1.5rem 1rem', textAlign:'center', cursor:'pointer', background:active?C.skyFaint:C.white, transition:'all 0.2s' }}>
                      <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{t.icon}</div>
                      <div style={{ fontWeight:700, color:active?C.skyDeep:C.textDark }}>{t.label}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'1.5rem' }}>Pick a Date &amp; Time</h2>
              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>Date</label>
                <input
                  type="date" min={minDate} value={selected.date}
                  onChange={e => {
                    const val = e.target.value
                    if (val) {
                      const day = new Date(val + 'T00:00').getDay()
                      if (day === 6) return
                    }
                    setSelected(s => ({ ...s, date: val, time: '' }))
                  }}
                  style={{ padding:'0.75rem 1rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:10, fontSize:'0.9rem', color:C.textDark, outline:'none', width:'100%', boxSizing:'border-box' }}
                />
                <div style={{ fontSize:'0.75rem', color:C.textLight, marginTop:'0.35rem' }}>
                  📅 Saturdays are unavailable — please select any other day.
                </div>
              </div>

              {selected.date && (
                <div style={{ marginBottom:'1.5rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                    <label style={{ fontSize:'0.82rem', fontWeight:700, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.08em' }}>Available Times</label>
                    {loadingSlots && <span style={{ fontSize:'0.75rem', color:C.skyDeep }}>Checking…</span>}
                  </div>

                  {availableSlotsForDay.length === 0 ? (
                    <div style={{ padding:'1rem 1.25rem', background:C.amberFaint, borderRadius:10, color:C.amber, fontSize:'0.85rem', border:`1px solid #f5d87a` }}>
                      This therapist is not available on {new Date(selected.date + 'T00:00').toLocaleDateString('en-US', { weekday:'long' })}s. Please choose a different date.
                    </div>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(110px,1fr))', gap:'0.5rem' }}>
                      {availableSlotsForDay.map(slot => {
                        const status = getSlotStatus(slot.label)
                        const isBooked = status === 'therapist_booked'
                        const isUserBooked = status === 'user_booked'
                        const isSel = selected.time === slot.label
                        return (
                          <button key={slot.label}
                            disabled={isBooked || isUserBooked || loadingSlots}
                            onClick={() => !isBooked && !isUserBooked && setSelected(s => ({ ...s, time:slot.label }))}
                            style={{ padding:'0.65rem 0.4rem', border:`1.5px solid ${isBooked?'#fca5a5':isUserBooked?'#fcd34d':isSel?C.skyBright:C.borderFaint}`, borderRadius:10, fontSize:'0.82rem', fontWeight:isSel?700:400, background:isBooked?'#fef2f2':isUserBooked?'#fffbeb':isSel?C.skyFaint:C.white, color:isBooked?'#ef4444':isUserBooked?'#d97706':isSel?C.skyDeep:C.textMid, cursor:isBooked||isUserBooked?'not-allowed':'pointer', transition:'all 0.15s', opacity:loadingSlots?0.6:1 }}>
                            {slot.label}
                            {(isBooked||isUserBooked) && <div style={{ fontSize:'0.6rem', marginTop:2 }}>{isUserBooked?'Your appt':'Booked'}</div>}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              <div style={{ marginBottom:'1.5rem' }}>
                <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>Notes (optional)</label>
                <textarea value={selected.notes} onChange={e => setSelected(s => ({ ...s, notes:e.target.value }))} placeholder="Share anything relevant…" rows={3}
                  style={{ width:'100%', padding:'0.75rem 1rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:10, fontSize:'0.88rem', color:C.textDark, outline:'none', resize:'vertical', boxSizing:'border-box' }}/>
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                <button className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary btn-lg"
                  disabled={!selected.date || !selected.time || loadingSlots || availableSlotsForDay.length === 0}
                  style={{ opacity:selected.date&&selected.time&&!loadingSlots&&availableSlotsForDay.length>0?1:0.5 }}
                  onClick={() => setStep(4)}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4 ── */}
          {step === 4 && (
            <div>
              <h2 style={{ fontFamily:'var(--font-display)', color:C.textDark, marginBottom:'1.5rem' }}>Confirm Booking</h2>
              <div style={{ background:C.white, borderRadius:16, padding:'2rem', border:`1.5px solid ${C.borderFaint}`, marginBottom:'1.5rem' }}>
                {[
                  ['Therapist',    selected.therapist?.full_name || '—'],
                  ['Session Type', SESSION_TYPES.find(t => t.value===selected.type)?.label || '—'],
                  ['Date',         selected.date],
                  ['Time',         selected.time],
                  ['Fee',          `NPR ${selected.therapist?.consultation_fee?.toLocaleString() || '—'}`],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.75rem 0', borderBottom:`1px solid ${C.borderFaint}` }}>
                    <span style={{ fontSize:'0.85rem', color:C.textLight, fontWeight:600 }}>{k}</span>
                    <span style={{ fontSize:'0.9rem', color:C.textDark, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>

              {!user && (
                <div style={{ background:C.amberFaint, border:'1.5px solid #f5d87a', borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1.25rem', fontSize:'0.85rem', color:C.amber }}>
                  ⚠️ You need to <button onClick={() => navigate('/signin')} style={{ background:'none', border:'none', color:'var(--green-deep)', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>sign in</button> to complete your booking.
                </div>
              )}
              {error && <div style={{ background:C.redFaint, border:'1.5px solid #f5a0a0', borderRadius:8, padding:'0.75rem 1rem', marginBottom:'1rem', color:C.red, fontSize:'0.875rem' }}>{error}</div>}

              <div style={{ background:'#e8f8f0', border:'1px solid #a8d8b8', borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1.25rem', fontSize:'0.82rem', color:'#1a5a3a' }}>
                ℹ️ Your appointment will be saved first, then you'll choose your payment method.
              </div>
              <div style={{ display:'flex', gap:'1rem' }}>
                <button className="btn btn-outline" onClick={() => setStep(3)}>← Back</button>
                <button className="btn btn-primary btn-lg" style={{ flex:1, justifyContent:'center', opacity:submitting?0.7:1 }} onClick={handleConfirm} disabled={submitting}>
                  {submitting ? 'Saving…' : 'Choose Payment Method →'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}