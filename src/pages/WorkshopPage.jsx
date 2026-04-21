// src/pages/WorkshopsPage.jsx
// Changes:
//  - MyEnrollments: Active/Upcoming unchanged. Past/Cancelled collapsed by default
//    with count badge, click to expand.
//  - EnrollmentCard: unchanged
//  - WorkshopCard: unchanged (seats/countdown logic intact)

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter }  from '../context/RouterContext'
import { useAuth }    from '../context/AuthContext'
import { usePayment } from '../components/PaymentModal'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', skyGhost:'#F8FEFF',
  white:'#ffffff', mint:'#e8f3ee',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8',
}
const heroGrad    = 'linear-gradient(135deg,#007BA8 0%,#009FD4 45%,#00BFFF 85%,#22d3ee 100%)'
const btnGrad     = 'linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)'
const sectionGrad = 'linear-gradient(135deg,#F0FBFF 0%,#e8f3ee 60%,#E0F7FF 100%)'

function safeCardColor(raw) {
  if (!raw || raw.startsWith('var(')) return C.skyFaint
  return raw
}

// ── Countdown hook ─────────────────────────────────────────────────────────
function useCountdown(dateStr) {
  const [diff, setDiff] = useState(null)
  useEffect(() => {
    function calc() {
      const target = new Date(dateStr)
      if (isNaN(target)) { setDiff(null); return }
      const ms = target - Date.now()
      if (ms <= 0) { setDiff({ past: true }); return }
      const days  = Math.floor(ms / 86400000)
      const hours = Math.floor((ms % 86400000) / 3600000)
      const mins  = Math.floor((ms % 3600000)  / 60000)
      setDiff({ days, hours, mins, past: false })
    }
    calc()
    const id = setInterval(calc, 60000)
    return () => clearInterval(id)
  }, [dateStr])
  return diff
}

function CountdownPill({ dateStr }) {
  const diff = useCountdown(dateStr)
  if (!diff) return null
  if (diff.past) return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#fff0e8', border:'1px solid #f5c4a4', borderRadius:100, padding:'0.2rem 0.65rem', fontSize:'0.65rem', fontWeight:800, color:'#c05a1a' }}>
      📅 Workshop passed
    </span>
  )
  const label  = diff.days > 0 ? diff.days + 'd ' + diff.hours + 'h away' : diff.hours > 0 ? diff.hours + 'h ' + diff.mins + 'm away' : diff.mins + 'm away'
  const urgent = diff.days < 3
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background: urgent ? '#fff0e8' : C.skyFainter, border:'1px solid ' + (urgent ? '#f5c4a4' : C.borderFaint), borderRadius:100, padding:'0.2rem 0.65rem', fontSize:'0.65rem', fontWeight:800, color: urgent ? '#c05a1a' : C.skyDeep }}>
      {urgent ? '⏰' : '🗓'} {label}
    </span>
  )
}

// ── Google Calendar link ───────────────────────────────────────────────────
function googleCalLink(ws) {
  const title = encodeURIComponent('Workshop: ' + (ws.title || 'Workshop'))
  const loc   = encodeURIComponent(ws.mode || '')
  const desc  = encodeURIComponent('Facilitator: ' + (ws.facilitator || '') + '\nRegistered via Sajha Manobigyan')
  let dateParam = ''
  try {
    const d = new Date(ws.date)
    if (!isNaN(d)) {
      const y   = d.getFullYear()
      const m   = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      dateParam = y + m + day
    }
  } catch (_) {}
  const dates = dateParam ? '&dates=' + dateParam + '/' + dateParam : ''
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title + '&location=' + loc + '&details=' + desc + dates
}

// ── Enrollment Card ────────────────────────────────────────────────────────
function EnrollmentCard({ reg, isOpen, chip, onToggle }) {
  const ws = reg.workshops || {}
  return (
    <div style={{ background: isOpen ? C.skyFainter : C.white, border:'1.5px solid ' + (isOpen ? C.skyMid : C.borderFaint), borderRadius:16, overflow:'hidden', boxShadow: isOpen ? '0 4px 24px rgba(0,191,255,0.1)' : '0 1px 4px rgba(0,80,130,0.06)', transition:'all 0.22s' }}>
      <div onClick={onToggle} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'1rem 1.1rem', cursor:'pointer', flexWrap:'wrap' }}>
        <div style={{ width:46, height:46, borderRadius:12, flexShrink:0, background: isOpen ? heroGrad : sectionGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', boxShadow: isOpen ? '0 4px 14px rgba(0,191,255,0.25)' : 'none', transition:'all 0.22s' }}>
          {ws.emoji || '📅'}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.2rem' }}>
            <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:C.textDark, fontSize:'0.92rem' }}>
              {ws.title || 'Workshop'}
            </span>
            {chip(reg.status === 'cancelled' ? 'cancelled' : reg.payment_status)}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', flexWrap:'wrap' }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.74rem', color:C.textLight }}>
              📅 {ws.date || '—'} · {ws.time || '—'}
            </span>
            {ws.date && reg.status !== 'cancelled' && <CountdownPill dateStr={ws.date} />}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
          {ws.mode && (
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:C.skyDeep, background:C.skyFaint, borderRadius:100, padding:'0.2rem 0.6rem' }}>
              {ws.mode.includes('Zoom') || ws.mode.includes('Online') ? '💻 Online' : '🏢 In-Person'}
            </span>
          )}
          <span style={{ color:C.textLight, fontSize:'0.75rem', display:'inline-block', transition:'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
        </div>
      </div>

      {isOpen && (
        <div style={{ borderTop:'1px solid ' + C.borderFaint }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'0.75rem', padding:'1.1rem' }}>
            {[
              ['👤 Facilitator', ws.facilitator || '—'],
              ['📅 Date',        ws.date         || '—'],
              ['🕐 Time',        ws.time         || '—'],
              ['📍 Mode',        ws.mode         || '—'],
              ['🎫 Fee',         ws.price === 0 ? 'FREE' : 'NPR ' + Number(ws.price || 0).toLocaleString()],
              ['🗒 Status',      reg.status      || '—'],
            ].map(([label, val]) => (
              <div key={label} style={{ background:C.white, border:'1px solid ' + C.borderFaint, borderRadius:10, padding:'0.65rem 0.8rem' }}>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.25rem' }}>{label}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:600, color:C.textDark }}>{val}</div>
              </div>
            ))}
          </div>

          {reg.notes && (
            <div style={{ margin:'0 1.1rem 1rem', background:'#fffbea', border:'1px solid #fde68a', borderRadius:10, padding:'0.65rem 0.9rem', fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'#78350f' }}>
              📝 <em>{reg.notes}</em>
            </div>
          )}

          {Array.isArray(ws.tags) && ws.tags.length > 0 && (
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', padding:'0 1.1rem 1rem' }}>
              {ws.tags.map((t, i) => (
                <span key={i} style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:700, background:C.skyFaint, color:C.skyDeep, borderRadius:100, padding:'0.2rem 0.65rem' }}>{t}</span>
              ))}
            </div>
          )}

          {reg.status !== 'cancelled' && ws.date && (
            <div style={{ margin:'0 1.1rem 1.1rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem', background:heroGrad, borderRadius:12, padding:'0.75rem 1rem' }}>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'0.82rem', color:'#fff', fontWeight:700 }}>📬 Add to Calendar</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', color:'rgba(255,255,255,0.7)' }}>Save your spot: {ws.date} at {ws.time}</div>
              </div>
              <a href={googleCalLink(ws)} target="_blank" rel="noopener noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'0.45rem 1rem', borderRadius:8, background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontFamily:'var(--font-body)', fontSize:'0.76rem', fontWeight:700, cursor:'pointer', textDecoration:'none', whiteSpace:'nowrap' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.28)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.18)'}
              >
                📅 Google Calendar
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── My Enrollments Section ─────────────────────────────────────────────────
function MyEnrollments({ userEmail }) {
  const [enrollments, setEnrollments] = useState([])
  const [loading,     setLoading]     = useState(false)
  const [fetchedFor,  setFetchedFor]  = useState('')
  const [inputVal,    setInputVal]    = useState(userEmail || '')
  const [error,       setError]       = useState('')
  const [expanded,    setExpanded]    = useState(null)
  // NEW: controls whether the past/cancelled drawer is open
  const [pastOpen,    setPastOpen]    = useState(false)

  useEffect(() => {
    if (userEmail && userEmail !== fetchedFor) {
      setInputVal(userEmail)
      fetchByEmail(userEmail)
    }
  }, [userEmail])

  async function fetchByEmail(emailStr) {
    const trimmed = (emailStr || '').trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) return
    setLoading(true); setError('')
    try {
      const res = await fetch(API_BASE + '/workshops/my-registrations?email=' + encodeURIComponent(trimmed))
      const j   = await res.json()
      if (!j.success) throw new Error(j.error || 'Could not load registrations')
      setEnrollments(j.registrations || [])
      setFetchedFor(trimmed)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  function lookup(e) {
    e.preventDefault()
    const trimmed = inputVal.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) { setError('Enter a valid email address.'); return }
    fetchByEmail(trimmed)
  }

  const STATUS = {
    confirmed: { bg:'#e8f8f0', color:'#1a7a4a', dot:'#22c55e', label:'Confirmed ✓' },
    paid:      { bg:'#e8f8f0', color:'#1a7a4a', dot:'#22c55e', label:'Paid ✓' },
    free:      { bg:'#e8f8f0', color:'#1a7a4a', dot:'#22c55e', label:'Registered ✓' },
    pending:   { bg:'#fff9e6', color:'#8a5a1a', dot:'#f59e0b', label:'Pending Payment' },
    cancelled: { bg:'#fff0f0', color:'#c0392b', dot:'#ef4444', label:'Cancelled' },
  }

  function chip(status) {
    const s = STATUS[status] || STATUS.pending
    return (
      <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:s.bg, color:s.color, borderRadius:100, padding:'0.22rem 0.7rem', fontSize:'0.63rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.07em' }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:s.dot, display:'inline-block' }} />
        {s.label}
      </span>
    )
  }

  const active   = enrollments.filter(r => ['confirmed','paid','free'].includes(r.payment_status) && r.status !== 'cancelled')
  const inactive = enrollments.filter(r => !active.includes(r))

  return (
    <div style={{ background:'var(--white)', padding:'0 0 4rem' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'0 clamp(1rem,4vw,2rem)' }}>

        {/* ── Header card ── */}
        <div style={{ background:'linear-gradient(135deg, #0f2942 0%, #1a4060 50%, #0e3a5a 100%)', borderRadius:20, overflow:'hidden', position:'relative', boxShadow:'0 12px 48px rgba(0,80,130,0.22)', marginBottom:'2.5rem' }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:160, height:160, borderRadius:'50%', background:'rgba(0,191,255,0.08)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:-20, left:60, width:100, height:100, borderRadius:'50%', background:'rgba(0,191,255,0.05)', pointerEvents:'none' }} />
          <div style={{ position:'relative', padding:'clamp(1.5rem,4vw,2.5rem)' }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:'1.25rem', flexWrap:'wrap' }}>
              <div style={{ width:52, height:52, borderRadius:14, background:btnGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0, boxShadow:'0 4px 16px rgba(0,191,255,0.35)' }}>
                🎟️
              </div>
              <div style={{ flex:1, minWidth:200 }}>
                <h2 style={{ fontFamily:'var(--font-display)', color:'#fff', fontSize:'clamp(1.1rem,3vw,1.5rem)', margin:'0 0 0.3rem' }}>
                  My Workshop Enrollments
                </h2>
                <p style={{ fontFamily:'var(--font-body)', color:'rgba(255,255,255,0.6)', fontSize:'0.82rem', margin:0, lineHeight:1.6 }}>
                  {userEmail ? 'Showing registrations for your account.' : 'Enter the email you registered with to see all your workshops.'}
                </p>
              </div>
            </div>

            {!userEmail && (
              <form onSubmit={lookup} style={{ marginTop:'1.5rem', display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  style={{ flex:1, minWidth:220, padding:'0.78rem 1.1rem', border:'1.5px solid rgba(255,255,255,0.15)', borderRadius:12, background:'rgba(255,255,255,0.08)', color:'#fff', fontFamily:'var(--font-body)', fontSize:'0.9rem', outline:'none', boxSizing:'border-box' }}
                  onFocus={e => e.target.style.borderColor='rgba(0,191,255,0.55)'}
                  onBlur={e  => e.target.style.borderColor='rgba(255,255,255,0.15)'}
                />
                <button type="submit" disabled={loading}
                  style={{ padding:'0.78rem 1.5rem', borderRadius:12, border:'none', background: loading ? 'rgba(0,191,255,0.3)' : btnGrad, color:'#fff', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.88rem', cursor: loading ? 'not-allowed' : 'pointer', whiteSpace:'nowrap', boxShadow: loading ? 'none' : '0 4px 18px rgba(0,191,255,0.4)' }}>
                  {loading ? '⏳ Looking up…' : '🔍 View My Workshops'}
                </button>
              </form>
            )}

            {userEmail && (
              <div style={{ marginTop:'1rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.5rem' }}>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'rgba(255,255,255,0.6)' }}>
                  📧 {userEmail}
                </span>
                <button onClick={() => fetchByEmail(userEmail)} disabled={loading}
                  style={{ padding:'0.35rem 0.85rem', borderRadius:8, border:'1px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.8)', fontFamily:'var(--font-body)', fontSize:'0.75rem', cursor:'pointer' }}>
                  {loading ? '⏳' : '🔄 Refresh'}
                </button>
              </div>
            )}

            {error && (
              <div style={{ marginTop:'0.75rem', background:'rgba(255,80,80,0.12)', border:'1px solid rgba(255,80,80,0.25)', borderRadius:10, padding:'0.6rem 0.9rem', fontSize:'0.8rem', color:'#ff8080', fontFamily:'var(--font-body)' }}>
                ⚠️ {error}
              </div>
            )}

            {loading && (
              <div style={{ marginTop:'1rem', fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'rgba(255,255,255,0.5)' }}>
                Loading your registrations…
              </div>
            )}
          </div>
        </div>

        {/* ── Results ── */}
        {fetchedFor && !loading && (
          <>
            {enrollments.length === 0 ? (
              <div style={{ textAlign:'center', padding:'2rem', color:C.textLight, fontFamily:'var(--font-body)', fontSize:'0.88rem' }}>
                No registrations found for <strong>{fetchedFor}</strong>. Double-check the email you signed up with.
              </div>
            ) : (
              <>
                {/* ACTIVE / UPCOMING — unchanged */}
                {active.length > 0 && (
                  <div style={{ marginBottom:'2rem' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'1rem' }}>
                      <span>✅</span>
                      <h3 style={{ fontFamily:'var(--font-display)', color:C.textDark, fontSize:'1rem', margin:0 }}>
                        Upcoming &amp; Active ({active.length})
                      </h3>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                      {active.map(reg => (
                        <EnrollmentCard key={reg.id} reg={reg} isOpen={expanded === reg.id} chip={chip} onToggle={() => setExpanded(expanded === reg.id ? null : reg.id)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* PAST / CANCELLED — collapsible dropdown */}
                {inactive.length > 0 && (
                  <div>
                    {/* Dropdown toggle header */}
                    <button
                      onClick={() => setPastOpen(o => !o)}
                      style={{
                        width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
                        padding:'0.75rem 1rem', borderRadius:12,
                        border:'1.5px solid ' + (pastOpen ? C.border : C.borderFaint),
                        background: pastOpen ? C.skyFainter : C.white,
                        cursor:'pointer', marginBottom: pastOpen ? '1rem' : 0,
                        transition:'all 0.2s',
                      }}
                    >
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <span style={{ fontSize:'1rem' }}>📋</span>
                        <span style={{ fontFamily:'var(--font-display)', color:C.textLight, fontSize:'0.92rem', fontWeight:600 }}>
                          Past &amp; Cancelled
                        </span>
                        {/* Count badge */}
                        <span style={{
                          display:'inline-flex', alignItems:'center', justifyContent:'center',
                          minWidth:22, height:22, borderRadius:100,
                          background: pastOpen ? C.skyMid : C.borderFaint,
                          color: pastOpen ? '#fff' : C.textLight,
                          fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:800,
                          padding:'0 6px', transition:'all 0.2s',
                        }}>
                          {inactive.length}
                        </span>
                      </div>
                      <span style={{
                        color:C.textLight, fontSize:'0.78rem', fontWeight:700,
                        display:'inline-block', transition:'transform 0.22s',
                        transform: pastOpen ? 'rotate(180deg)' : 'none',
                      }}>
                        ▾
                      </span>
                    </button>

                    {/* Dropdown body — only rendered when open */}
                    {pastOpen && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.7rem', opacity:0.72 }}>
                        {inactive.map(reg => (
                          <EnrollmentCard key={reg.id} reg={reg} isOpen={expanded === reg.id} chip={chip} onToggle={() => setExpanded(expanded === reg.id ? null : reg.id)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Form input ─────────────────────────────────────────────────────────────
function FInput({ label, required, type = 'text', placeholder, value, onChange }) {
  const [f, setF] = useState(false)
  return (
    <div>
      <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.66rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.4rem' }}>
        {label}{required && <span style={{ color:C.skyBright, marginLeft:2 }}>*</span>}
      </label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange}
        onFocus={() => setF(true)} onBlur={() => setF(false)}
        style={{ width:'100%', padding:'0.75rem 1rem', border:'1.5px solid ' + (f ? C.skyBright : C.borderFaint), borderRadius:10, fontFamily:'var(--font-body)', fontSize:'0.9rem', color:C.textDark, background: f ? C.skyGhost : C.white, outline:'none', boxSizing:'border-box', boxShadow: f ? '0 0 0 3px rgba(0,191,255,0.1)' : 'none', transition:'all 0.2s' }} />
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function WorkshopsPage() {
  const { navigate }    = useRouter()
  const { user }        = useAuth()
  const { openPayment } = usePayment()

  const userEmail = user?.email || ''

  const [workshops,  setWorkshops]  = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [screen,     setScreen]     = useState('list')
  const [workshop,   setWorkshop]   = useState(null)
  const [registered, setRegistered] = useState([])
  const [regId,      setRegId]      = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitErr,  setSubmitErr]  = useState(null)
  const [form, setForm] = useState({ name:'', email:'', phone:'', notes:'' })

  const upForm = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const formOK = form.name.trim() && form.email.includes('@') && form.phone.trim()

  const fetchWorkshops = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const r = await fetch(API_BASE + '/workshops')
      const j = await r.json()
      if (!j.success) throw new Error(j.error || 'Failed to load')
      setWorkshops(j.workshops)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchWorkshops() }, [fetchWorkshops])

  function isFull(ws)    { return parseInt(ws.booked || 0) >= ws.seats }
  function isFree(ws)    { return !ws.price || Number(ws.price) === 0 }
  function seatsLeft(ws) { return ws.seats - parseInt(ws.booked || 0) }
  function pct(ws)       { return Math.min(100, Math.round((parseInt(ws.booked || 0) / ws.seats) * 100)) }

  function openRegister(ws) {
    setWorkshop(ws)
    setForm({ name: user?.fullName || user?.full_name || '', email: userEmail, phone:'', notes:'' })
    setSubmitErr(null); setRegId(null); setScreen('register')
    window.scrollTo({ top:0, behavior:'smooth' })
  }

  async function ensureRegistration() {
    if (regId) return regId
    const r = await fetch(API_BASE + '/workshops/register', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ workshop_id: workshop.id, attendee_name: form.name, attendee_email: form.email, attendee_phone: form.phone, notes: form.notes }),
    })
    const j = await r.json()
    if (r.status === 409) {
      if (j.registration?.payment_status === 'paid') {
        setRegistered(prev => [...prev, workshop.id]); await fetchWorkshops(); setScreen('done'); return null
      }
      const existingId = j.registration?.id
      if (!existingId) throw new Error('Already registered. Contact us if you need help.')
      setRegId(existingId); return existingId
    }
    if (!j.success) throw new Error(j.error || 'Registration failed')
    setRegId(j.registration.id)
    return j.registration.id
  }

  async function handleFreeRegister() {
    setSubmitting(true); setSubmitErr(null)
    try {
      const rid = await ensureRegistration()
      if (rid === null) return
      setRegistered(prev => [...prev, workshop.id]); await fetchWorkshops(); setScreen('done')
      window.scrollTo({ top:0, behavior:'smooth' })
    } catch (e) { setSubmitErr(e.message) }
    finally { setSubmitting(false) }
  }

  async function handleProceedPay() {
    setSubmitting(true); setSubmitErr(null)
    try {
      const registrationId = await ensureRegistration()
      if (registrationId === null) return
      const result = await openPayment({
        type: 'appointment', amount: workshop.price,
        title: 'Workshop: ' + workshop.title,
        description: workshop.date + ' · ' + workshop.time + ' · ' + workshop.mode,
        itemLines: [{ label: workshop.title, amount: workshop.price }],
        couponEnabled: true, allowedGateways: ['esewa','khalti','fonepay','stripe','cash'],
        metadata: { item_type:'workshop', workshop_id: workshop.id, registration_id: registrationId, workshop_title: workshop.title, workshop_date: workshop.date, workshop_time: workshop.time, facilitator: workshop.facilitator, mode: workshop.mode, attendee_name: form.name, attendee_email: form.email, attendee_phone: form.phone },
      })
      if (!result || !result.success) { setSubmitting(false); return }
      try {
        await fetch(API_BASE + '/workshops/registration/' + registrationId + '/payment', {
          method: 'PATCH', headers: { 'Content-Type':'application/json' },
          body: JSON.stringify({ payment_status:'paid', payment_ref: result.transactionId || result.paymentId || 'confirmed' }),
        })
      } catch (patchErr) { console.warn('Workshop reg patch failed:', patchErr) }
      setRegistered(prev => [...prev, workshop.id]); await fetchWorkshops(); setScreen('done')
      window.scrollTo({ top:0, behavior:'smooth' })
    } catch (e) { setSubmitErr(e.message) }
    finally { setSubmitting(false) }
  }

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────────
  if (screen === 'done') return (
    <div className="page-wrapper" style={{ background:C.skyGhost }}>
      <div style={{ maxWidth:520, margin:'0 auto', padding:'5rem 2rem' }}>
        <div style={{ background:C.white, borderRadius:24, border:'1.5px solid ' + C.borderFaint, boxShadow:'0 8px 40px rgba(0,191,255,0.12)', overflow:'hidden' }}>
          <div style={{ height:4, background:btnGrad }} />
          <div style={{ padding:'3rem 2.5rem', textAlign:'center' }}>
            <div style={{ width:76, height:76, borderRadius:'50%', background:heroGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.75rem', fontSize:'2rem', boxShadow:'0 8px 28px rgba(0,191,255,0.35)' }}>✓</div>
            <div style={{ display:'inline-block', background:sectionGrad, border:'1px solid ' + C.borderFaint, borderRadius:100, padding:'0.28rem 1rem', marginBottom:'0.9rem' }}>
              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:800, color:C.skyDeep, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                {isFree(workshop) ? '🎓 Registered Free' : '💳 Payment Submitted'}
              </span>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.9rem', color:C.textDark, marginBottom:'0.75rem' }}>
              {isFree(workshop) ? "You're Registered!" : 'Thank You!'}
            </h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:C.textMid, lineHeight:1.78, marginBottom:'1.5rem' }}>
              {isFree(workshop)
                ? 'Your spot is confirmed for "' + workshop?.title + '". Details will be emailed to ' + form.email + '.'
                : 'Your registration and payment have been submitted. Confirmation will be sent to ' + form.email + ' once verified.'}
            </p>
            <div style={{ background:C.white, border:'1px solid ' + C.borderFaint, borderRadius:12, padding:'0.9rem', marginBottom:'1.75rem', textAlign:'left' }}>
              {[['Workshop', workshop?.title], ['Date', workshop?.date], ['Time', workshop?.time], ['Mode', workshop?.mode], ['Facilitator', workshop?.facilitator], ['Seats Left', seatsLeft(workshop) + ' of ' + workshop?.seats]].map(([k, v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.35rem 0', borderBottom:'1px solid ' + C.borderFaint, fontFamily:'var(--font-body)', fontSize:'0.78rem' }}>
                  <span style={{ color:C.textLight, fontWeight:700 }}>{k}</span>
                  <span style={{ color:C.textDark, fontWeight:600, textAlign:'right', maxWidth:'60%' }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => navigate('/')} style={{ padding:'0.7rem 1.75rem', borderRadius:12, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}>🏠 Back to Home</button>
              <button onClick={() => { setScreen('list'); fetchWorkshops() }} style={{ padding:'0.7rem 1.4rem', borderRadius:12, border:'1.5px solid ' + C.border, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}>Browse More</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── REGISTER FORM ──────────────────────────────────────────────────────
  if (screen === 'register') return (
    <div className="page-wrapper" style={{ background:C.skyGhost }}>
      <div style={{ background:heroGrad, padding:'4rem 3rem 3rem' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.28rem 0.9rem', marginBottom:'0.85rem' }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.9)', textTransform:'uppercase' }}>📋 Workshop Registration</span>
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,2rem)', color:'white', marginBottom:'0.4rem' }}>{workshop?.title}</h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:'rgba(255,255,255,0.78)' }}>
            {workshop?.date} · {workshop?.time} · {workshop?.mode} · {isFree(workshop) ? 'FREE' : 'NPR ' + workshop?.price?.toLocaleString()}
          </p>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'rgba(255,255,255,0.7)', marginTop:'0.4rem' }}>
            🪑 {seatsLeft(workshop)} seat{seatsLeft(workshop) !== 1 ? 's' : ''} remaining
          </p>
          <button onClick={() => setScreen('list')} style={{ marginTop:'1rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'rgba(255,255,255,0.7)', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.32rem 1rem', cursor:'pointer' }}>
            ← Back to Workshops
          </button>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:'2.5rem auto', padding:'0 2rem 5rem' }}>
        <div style={{ background:C.white, borderRadius:20, border:'1px solid ' + C.borderFaint, overflow:'hidden', boxShadow:'0 4px 24px rgba(0,191,255,0.07)' }}>
          <div style={{ padding:'1.1rem 1.5rem', background:sectionGrad, borderBottom:'1px solid ' + C.borderFaint }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', color:C.textDark }}>Workshop Details</span>
          </div>
          <div style={{ padding:'1rem 1.5rem 0.5rem' }}>
            {[['Facilitator', workshop?.facilitator], ['Date', workshop?.date], ['Time', workshop?.time], ['Mode', workshop?.mode], ['Seats Left', seatsLeft(workshop) + ' of ' + workshop?.seats + ' remaining'], ['Fee', isFree(workshop) ? 'FREE' : 'NPR ' + workshop?.price?.toLocaleString()]].map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.4rem 0', borderBottom:'1px solid ' + C.borderFaint, fontFamily:'var(--font-body)', fontSize:'0.82rem' }}>
                <span style={{ color:C.textLight, fontWeight:700 }}>{k}</span>
                <span style={{ color:C.textDark, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ padding:'0.9rem 1.5rem', background:sectionGrad, borderBottom:'1px solid ' + C.borderFaint, borderTop:'1px solid ' + C.borderFaint, marginTop:'0.5rem' }}>
            <span style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', color:C.textDark }}>Your Details</span>
          </div>
          <div style={{ padding:'1.25rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.9rem' }}>
            <FInput label="Full Name"      required placeholder="Priya Sharma"  value={form.name}  onChange={e => upForm('name', e.target.value)} />
            <FInput label="Email"          required type="email" placeholder="you@email.com" value={form.email} onChange={e => upForm('email', e.target.value)} />
            <FInput label="Phone/WhatsApp" required type="tel"   placeholder="98XXXXXXXX"    value={form.phone} onChange={e => upForm('phone', e.target.value)} />
            <div>
              <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.66rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.4rem' }}>Notes (optional)</label>
              <textarea value={form.notes} onChange={e => upForm('notes', e.target.value)} placeholder="Any accessibility requirements or questions…" rows={2}
                style={{ width:'100%', padding:'0.75rem 1rem', border:'1.5px solid ' + C.borderFaint, borderRadius:10, fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textDark, background:C.white, outline:'none', resize:'vertical', boxSizing:'border-box' }}
                onFocus={e => e.target.style.borderColor = C.skyBright}
                onBlur={e  => e.target.style.borderColor = C.borderFaint} />
            </div>
          </div>

          {submitErr && (
            <div style={{ margin:'0 1.5rem 0.5rem', background:'#fff0f0', border:'1px solid #fca5a5', borderRadius:10, padding:'0.75rem 1rem', fontSize:'0.82rem', color:'#b91c1c' }}>
              ⚠️ {submitErr}
            </div>
          )}
          {!isFree(workshop) && (
            <div style={{ margin:'0 1.5rem 1rem', background:'#e8f8f0', border:'1px solid #a8d8b8', borderRadius:10, padding:'0.75rem 1rem', fontSize:'0.8rem', color:'#1a5a3a' }}>
              ℹ️ You'll choose your payment method (eSewa, Khalti, FonePay, Card, or Cash) on the next screen.
            </div>
          )}

          <div style={{ padding:'1.1rem 1.5rem', borderTop:'1px solid ' + C.borderFaint, display:'flex', gap:'0.75rem' }}>
            <button onClick={() => setScreen('list')} disabled={submitting}
              style={{ padding:'0.75rem 1.2rem', borderRadius:12, border:'1.5px solid ' + C.border, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.88rem', cursor:'pointer' }}>
              ← Back
            </button>
            <button
              onClick={() => { if (!formOK || submitting) return; isFree(workshop) ? handleFreeRegister() : handleProceedPay() }}
              disabled={!formOK || submitting}
              style={{ flex:1, padding:'0.88rem', borderRadius:12, border:'none', background: formOK && !submitting ? btnGrad : C.borderFaint, color: formOK && !submitting ? 'white' : C.textLight, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.92rem', cursor: formOK && !submitting ? 'pointer' : 'not-allowed', boxShadow: formOK && !submitting ? '0 6px 22px rgba(0,191,255,0.35)' : 'none', transition:'all 0.2s' }}>
              {submitting ? '⏳ Please wait…' : !formOK ? 'Fill in your details' : isFree(workshop) ? '🎓 Register Free →' : '💳 Choose Payment — NPR ' + workshop?.price?.toLocaleString() + ' →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── WORKSHOP LIST ──────────────────────────────────────────────────────
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
          <div style={{ marginTop:'1.25rem', display:'inline-flex', alignItems:'center', gap:8, background:btnGrad, borderRadius:100, padding:'6px 18px', fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight:700, color:'white', boxShadow:'0 4px 16px rgba(0,191,255,0.3)' }}>
            ✓ {registered.length} workshop{registered.length > 1 ? 's' : ''} registered this session
          </div>
        )}
      </div>

      <div className="section" style={{ background:'var(--white)' }}>
        {loading && <div style={{ textAlign:'center', padding:'4rem', fontFamily:'var(--font-body)', color:C.textLight }}>Loading workshops…</div>}
        {error && (
          <div style={{ textAlign:'center', padding:'4rem' }}>
            <p style={{ color:'#b91c1c', fontFamily:'var(--font-body)', marginBottom:'1rem' }}>⚠️ {error}</p>
            <button onClick={fetchWorkshops} style={{ padding:'0.6rem 1.5rem', borderRadius:10, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, cursor:'pointer' }}>Retry</button>
          </div>
        )}
        {!loading && !error && workshops.length === 0 && (
          <div style={{ textAlign:'center', padding:'4rem', fontFamily:'var(--font-body)', color:C.textLight }}>No upcoming workshops right now. Check back soon!</div>
        )}
        {!loading && !error && workshops.length > 0 && (
          <div className="workshops-grid">
            {workshops.map(ws => {
              const isReg  = registered.includes(ws.id)
              const full   = isFull(ws)
              const free   = isFree(ws)
              const left   = seatsLeft(ws)
              const p      = pct(ws)
              const urgent = p >= 80
              const cardBg = safeCardColor(ws.color)
              return (
                <div key={ws.id}
                  style={{ background: isReg ? C.skyFainter : 'var(--off-white)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1.5px solid ' + (isReg ? C.skyBright : full ? '#f97316' : 'var(--earth-cream)'), boxShadow: isReg ? '0 4px 20px rgba(0,191,255,0.12)' : 'var(--shadow-soft)', transition:'all 0.25s', opacity: full && !isReg ? 0.75 : 1 }}
                  onMouseEnter={e => !full && (e.currentTarget.style.transform = 'translateY(-4px)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                  <div style={{ background: isReg ? 'linear-gradient(135deg,' + C.skyFaint + ',' + C.skyFainter + ')' : cardBg, padding:'1.75rem', fontSize:'2.5rem', textAlign:'center', position:'relative' }}>
                    {ws.emoji}
                    {isReg && <div style={{ position:'absolute', top:10, right:10, background:btnGrad, borderRadius:100, padding:'3px 10px', fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:'white' }}>✓ REGISTERED</div>}
                    {full && !isReg && <div style={{ position:'absolute', top:10, right:10, background:'#f97316', borderRadius:100, padding:'3px 10px', fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:'white' }}>FULL</div>}
                  </div>
                  <div style={{ padding:'1.4rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.3rem' }}>
                      <span style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--blue-mid)' }}>{ws.mode}</span>
                      <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color:'var(--green-deep)' }}>{free ? 'FREE' : 'NPR ' + ws.price.toLocaleString()}</span>
                    </div>
                    <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--blue-deep)', marginBottom:'0.4rem', lineHeight:1.3 }}>{ws.title}</h3>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'var(--text-light)', marginBottom:'0.6rem' }}>👤 {ws.facilitator}</p>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'var(--text-mid)', marginBottom:'0.6rem' }}>📅 {ws.date} · {ws.time}</div>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:'0.85rem' }}>
                      {(ws.tags || []).map((t, j) => <span key={j} className="tag" style={{ fontSize:'0.65rem' }}>{t}</span>)}
                    </div>
                    <div style={{ marginBottom:'1rem' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-body)', fontSize:'0.7rem', color: urgent ? '#e53e3e' : 'var(--text-light)', marginBottom:'0.3rem', fontWeight: urgent ? 700 : 400 }}>
                        <span>{full ? '🔴 Workshop Full' : urgent ? '⚠ Almost full!' : '🟢 Seats available'}</span>
                        <span>{left} of {ws.seats} left</span>
                      </div>
                      <div style={{ height:5, background:'var(--earth-cream)', borderRadius:100, overflow:'hidden' }}>
                        <div style={{ height:'100%', width: p + '%', background: p >= 100 ? '#e53e3e' : p >= 90 ? 'linear-gradient(90deg,#e53e3e,#f97316)' : p >= 70 ? 'linear-gradient(90deg,#f97316,#ffd54f)' : btnGrad, borderRadius:100, transition:'width 0.3s' }} />
                      </div>
                    </div>
                    {isReg ? (
                      <button className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }} onClick={() => navigate('/portal')}>✓ Registered — View Details</button>
                    ) : full ? (
                      <button disabled style={{ width:'100%', padding:'0.6rem', borderRadius:12, border:'1.5px solid var(--earth-cream)', background:'var(--earth-cream)', color:'var(--text-light)', fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.82rem', cursor:'not-allowed' }}>Workshop Full</button>
                    ) : (
                      <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={() => openRegister(ws)}>
                        {free ? 'Register Free →' : 'Register Now →'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {!loading && workshops.length > 0 && (
        <MyEnrollments userEmail={userEmail} />
      )}
    </div>
  )
}
