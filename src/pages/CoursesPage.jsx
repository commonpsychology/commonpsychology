// src/pages/CoursesPage.jsx
// Enrollment state is stored in the DB (enrollments table), not localStorage.
// PIN gate (24-hour session token in sessionStorage) guards access to course videos.

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter }  from '../context/RouterContext'
import { usePayment } from '../components/PaymentModal'

const API_BASE     = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'
const PIN_KEY      = 'ps_course_pin_unlocked'   // sessionStorage key
const PIN_EXPIRY   = 24 * 60 * 60 * 1000        // 24 h in ms
const POLL_INTERVAL = 8000

// ── Colors ────────────────────────────────────────────────────────────────────
const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF',  skyFainter:'#F0FBFF', white:'#ffffff',
  mint:'#e8f3ee', textDark:'#1a3a4a', textMid:'#2e6080',
  textLight:'#7a9aaa', border:'#b0d4e8', borderFaint:'#daeef8',
}
const heroGrad    = `linear-gradient(135deg,#007BA8 0%,#009FD4 45%,#00BFFF 85%,#22d3ee 100%)`
const btnGrad     = `linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`
const sectionGrad = `linear-gradient(135deg,${C.skyFainter} 0%,${C.mint} 60%,${C.skyFaint} 100%)`

// ── CSS ───────────────────────────────────────────────────────────────────────
const COURSES_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
@keyframes course-success-pop  { 0%{transform:scale(0.7);opacity:0;} 65%{transform:scale(1.08);} 100%{transform:scale(1);opacity:1;} }
@keyframes course-enroll-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,191,255,0.4);} 50%{box-shadow:0 0 0 8px rgba(0,191,255,0);} }
@keyframes free-badge-glow     { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4);} 50%{box-shadow:0 0 0 6px rgba(34,197,94,0);} }
@keyframes pending-pulse       { 0%,100%{opacity:1;} 50%{opacity:0.55;} }
@keyframes spin                { to{transform:rotate(360deg)} }
@keyframes confirmation-appear { 0%{transform:translateY(12px);opacity:0;} 100%{transform:translateY(0);opacity:1;} }
@keyframes pin-modal-in        { 0%{transform:scale(0.88) translateY(24px);opacity:0;} 100%{transform:scale(1) translateY(0);opacity:1;} }
@keyframes pin-shake           { 0%,100%{transform:translateX(0);} 20%,60%{transform:translateX(-8px);} 40%,80%{transform:translateX(8px);} }
.courses-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.course-card  { background:var(--off-white,#fff); border-radius:16px; overflow:hidden; border:1.5px solid var(--earth-cream,#f0ebe3); box-shadow:0 2px 12px rgba(0,0,0,0.06); transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1); cursor:pointer; position:relative; }
.course-card:hover { transform:translateY(-6px); box-shadow:0 16px 48px rgba(0,123,168,0.13); border-color:rgba(0,191,255,0.3); }
.course-card.enrolled-free    { border-color:#22c55e; box-shadow:0 8px 32px rgba(34,197,94,0.15); }
.course-card.enrolled-paid    { border-color:#00BFFF; box-shadow:0 8px 32px rgba(0,191,255,0.15); }
.course-card.enrolled-pending { border-color:#f59e0b; box-shadow:0 8px 32px rgba(245,158,11,0.15); }
.enrolled-badge { position:absolute; top:12px; right:12px; z-index:5; padding:4px 10px; border-radius:100px; font-size:0.62rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; }
.pending-spinner { display:inline-block; width:11px; height:11px; border:2px solid currentColor; border-right-color:transparent; border-radius:50%; animation:spin 0.7s linear infinite; vertical-align:middle; margin-right:4px; }
.go-btn { width:100%; padding:0.78rem; border-radius:12px; border:none; font-family:'Sora',var(--font-body,sans-serif); font-weight:800; font-size:0.9rem; cursor:pointer; transition:all 0.18s; letter-spacing:0.01em; }
.go-btn.active { background:linear-gradient(135deg,#007BA8 0%,#00BFFF 100%); color:white; box-shadow:0 6px 24px rgba(0,191,255,0.4); }
.go-btn.active:hover { transform:translateY(-2px); box-shadow:0 10px 32px rgba(0,191,255,0.5); }
.go-btn.pending-state { background:#fffbeb; border:1.5px solid #fcd34d; color:#92400e; cursor:default; animation:pending-pulse 2.2s ease infinite; }
.pin-overlay { position:fixed; inset:0; background:rgba(10,30,50,0.65); backdrop-filter:blur(6px); z-index:9900; display:flex; align-items:center; justify-content:center; padding:1rem; }
.pin-modal   { background:#ffffff; border-radius:24px; padding:2.5rem 2rem; max-width:420px; width:100%; box-shadow:0 32px 80px rgba(0,0,0,0.28); animation:pin-modal-in 0.32s cubic-bezier(0.34,1.56,0.64,1); }
.pin-input   { width:100%; text-align:center; font-size:2rem; letter-spacing:0.6em; font-family:'Sora',sans-serif; font-weight:800; border:2px solid ${C.border}; border-radius:14px; padding:0.9rem 0.5rem; outline:none; transition:border-color 0.15s; color:${C.textDark}; background:#f8feff; }
.pin-input:focus { border-color:${C.skyBright}; }
.pin-input.shake { animation:pin-shake 0.4s ease; border-color:#ef4444; }
.pin-dots { display:flex; justify-content:center; gap:10px; margin:1rem 0; }
.pin-dot  { width:14px; height:14px; border-radius:50%; border:2px solid ${C.border}; transition:all 0.15s; }
.pin-dot.filled { background:${C.skyBright}; border-color:${C.skyBright}; transform:scale(1.15); }
@media(max-width:900px){.courses-grid{grid-template-columns:repeat(2,1fr);gap:1.25rem;}}
@media(max-width:600px){.courses-grid{grid-template-columns:1fr;gap:1rem;}}
`

function injectCSS(id, css) {
  if (typeof document === 'undefined' || document.getElementById(id)) return
  const s = document.createElement('style'); s.id = id; s.textContent = css
  document.head.appendChild(s)
}

// ── PIN session helpers ───────────────────────────────────────────────────────
function isPinUnlocked() {
  try {
    const raw = sessionStorage.getItem(PIN_KEY)
    if (!raw) return false
    const { ts } = JSON.parse(raw)
    return Date.now() - ts < PIN_EXPIRY
  } catch { return false }
}
function setPinUnlocked() {
  try { sessionStorage.setItem(PIN_KEY, JSON.stringify({ ts: Date.now() })) } catch {}
}

// ── Auth token ────────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem('accessToken') }

// ── API helpers ───────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed')
    err.status = res.status
    throw err
  }
  return data
}

async function fetchMyEnrollments() {
  const data = await apiFetch('/enrollments/me')
  return data.enrollments || []
}

async function enrollFree(courseId) {
  return apiFetch('/enrollments', {
    method: 'POST',
    body: JSON.stringify({ course_id: courseId, is_free: true }),
  })
}

async function enrollPaid(courseId, paymentId) {
  return apiFetch('/enrollments', {
    method: 'POST',
    body: JSON.stringify({ course_id: courseId, payment_id: paymentId }),
  })
}

async function unenroll(courseId) {
  return apiFetch(`/enrollments/${courseId}`, { method: 'DELETE' })
}

async function verifyPin(pin) {
  return apiFetch('/enrollments/verify-pin', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  })
}

async function checkPaymentStatus(paymentId) {
  try {
    const data = await apiFetch(`/payments/${paymentId}`)
    return data.payment || data.data || data
  } catch { return null }
}

// ── Static fallback courses ───────────────────────────────────────────────────
const STATIC_COURSES = [
  { id:'static-0', title:'Mindfulness-Based Stress Reduction', level:'Beginner',     duration_hours:8, lessons_count:24, price:1500, is_free:false, tags:['Mindfulness','Stress'], color:'var(--green-mist)', emoji:'🧘' },
  { id:'static-1', title:'Overcoming Anxiety: A CBT Approach', level:'Intermediate', duration_hours:6, lessons_count:18, price:0,    is_free:true,  tags:['Anxiety','CBT'],        color:'var(--blue-mist)',  emoji:'🧠' },
  { id:'static-2', title:'Building Emotional Resilience',       level:'Beginner',     duration_hours:5, lessons_count:15, price:1200, is_free:false, tags:['Resilience'],           color:'var(--earth-cream)',emoji:'🌱' },
  { id:'static-3', title:'Sleep Better: CBT for Insomnia',      level:'Beginner',     duration_hours:4, lessons_count:12, price:800,  is_free:false, tags:['Sleep','CBT'],          color:'var(--green-mist)', emoji:'🌙' },
  { id:'static-4', title:'Workplace Mental Health',             level:'Advanced',     duration_hours:7, lessons_count:21, price:0,    is_free:true,  tags:['Work','Burnout'],       color:'var(--blue-mist)',  emoji:'💼' },
  { id:'static-5', title:'Healthy Relationships Workshop',      level:'Intermediate', duration_hours:5, lessons_count:16, price:1000, is_free:false, tags:['Relationships'],        color:'var(--earth-cream)',emoji:'💛' },
]

const levelColor = {
  Beginner:     'var(--green-deep,#3d6b5a)',
  Intermediate: 'var(--blue-mid,#2e6080)',
  Advanced:     'var(--earth-mid,#7a5c38)',
}

function fmtDate(d) {
  if (!d) return null
  try { return new Date(d).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' }) }
  catch { return d }
}
function fmtTime(t) {
  if (!t) return null
  if (t.includes('AM') || t.includes('PM')) return t
  try {
    const [h, m] = t.split(':').map(Number)
    return `${((h % 12) || 12)}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`
  } catch { return t }
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SeatBar({ seats, bookedCount }) {
  if (!seats) return null
  const left   = Math.max(0, seats - (bookedCount || 0))
  const pct    = Math.min(100, Math.round(((bookedCount || 0) / seats) * 100))
  const urgent = pct >= 80
  const full   = pct >= 100
  return (
    <div style={{ marginBottom:'0.7rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color: full ? '#e53e3e' : urgent ? '#d97706' : C.textLight, marginBottom:'0.28rem', fontWeight: urgent ? 700 : 400, fontFamily:'var(--font-body,sans-serif)' }}>
        <span>{full ? '🔴 Course Full' : urgent ? '⚠ Almost full!' : '🟢 Seats available'}</span>
        <span style={{ fontWeight:700 }}>{left} / {seats} left</span>
      </div>
      <div style={{ height:4, background:'#f0ebe3', borderRadius:100, overflow:'hidden' }}>
        <div style={{ height:'100%', width:pct+'%', background: pct>=100?'#e53e3e':pct>=80?'linear-gradient(90deg,#f97316,#ffd54f)':btnGrad, borderRadius:100, transition:'width 0.4s' }} />
      </div>
    </div>
  )
}

function PendingBanner() {
  return (
    <div style={{ background:'#fffbeb', border:'1.5px solid #fcd34d', borderRadius:10, padding:'0.75rem 0.9rem', marginBottom:'0.6rem', animation:'confirmation-appear 0.3s ease' }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:'0.55rem' }}>
        <span style={{ fontSize:'1.1rem' }}>⏳</span>
        <div>
          <div style={{ fontFamily:'var(--font-body,sans-serif)', fontSize:'0.72rem', fontWeight:800, color:'#92400e', marginBottom:'0.2rem' }}>Awaiting Admin Confirmation</div>
          <div style={{ fontFamily:'var(--font-body,sans-serif)', fontSize:'0.68rem', color:'#a16207', lineHeight:1.5 }}>
            Your payment is being reviewed. The <strong>Go to Course</strong> button unlocks automatically once confirmed.
          </div>
        </div>
      </div>
    </div>
  )
}

function FreeToast({ course, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{ position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:9500, maxWidth:'min(440px,92vw)', width:'100%' }}>
      <div style={{ background:'#fff', borderRadius:18, border:'2px solid #22c55e', boxShadow:'0 16px 48px rgba(0,0,0,0.2)', padding:'1.1rem 1.4rem', display:'flex', alignItems:'center', gap:'1rem', animation:'course-success-pop 0.35s ease' }}>
        <div style={{ width:46, height:46, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'1.3rem' }}>✓</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'0.65rem', fontWeight:800, color:'#16a34a', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.15rem', fontFamily:'var(--font-body,sans-serif)' }}>🎓 Enrolled — Free Access!</div>
          <div style={{ fontFamily:'var(--font-display,serif)', fontSize:'0.92rem', color:'#1a3a4a' }}>{course.title}</div>
        </div>
        <button onClick={onDone} style={{ background:'none', border:'none', color:C.textLight, cursor:'pointer', fontSize:'1rem' }}>✕</button>
      </div>
    </div>
  )
}

function ConfirmedToast({ course, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 5000); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{ position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:9500, maxWidth:'min(460px,92vw)', width:'100%' }}>
      <div style={{ background:'#fff', borderRadius:18, border:'2px solid #00BFFF', boxShadow:'0 16px 48px rgba(0,0,0,0.2)', padding:'1.1rem 1.4rem', display:'flex', alignItems:'center', gap:'1rem', animation:'course-success-pop 0.35s ease' }}>
        <div style={{ width:46, height:46, borderRadius:'50%', background:btnGrad, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'1.3rem' }}>🎓</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'0.65rem', fontWeight:800, color:C.skyDeep, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.15rem', fontFamily:'var(--font-body,sans-serif)' }}>✅ Payment Confirmed!</div>
          <div style={{ fontFamily:'var(--font-display,serif)', fontSize:'0.92rem', color:'#1a3a4a' }}>{course.title} — You're in!</div>
        </div>
        <button onClick={onDone} style={{ background:'none', border:'none', color:C.textLight, cursor:'pointer', fontSize:'1rem' }}>✕</button>
      </div>
    </div>
  )
}

// ── PIN Gate Modal ────────────────────────────────────────────────────────────
function PinModal({ courseTitle, onSuccess, onCancel }) {
  const [pin,     setPin]     = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [shake,   setShake]   = useState(false)
  const inputRef              = useRef(null)
  const MAX = 6

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80) }, [])

  function triggerShake() {
    setShake(true)
    setTimeout(() => setShake(false), 450)
  }

  async function handleSubmit() {
    if (!pin) { setError('Please enter your PIN.'); triggerShake(); return }
    setLoading(true); setError('')
    try {
      await verifyPin(pin)
      setPinUnlocked()
      onSuccess()
    } catch (err) {
      setError(err.message || 'Incorrect PIN.')
      setPin('')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSubmit()
    if (e.key === 'Escape') onCancel()
  }

  return (
    <div className="pin-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="pin-modal">
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:sectionGrad, border:`2px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 1rem' }}>🔐</div>
          <h2 style={{ fontFamily:'var(--font-display,serif)', fontSize:'1.35rem', color:C.textDark, marginBottom:'0.4rem' }}>Course Access PIN</h2>
          <p style={{ fontFamily:'var(--font-body,sans-serif)', fontSize:'0.82rem', color:C.textLight, lineHeight:1.5 }}>
            Enter the PIN provided by your admin to access<br />
            <strong style={{ color:C.textMid }}>{courseTitle}</strong>
          </p>
        </div>

        {/* PIN dots indicator */}
        <div className="pin-dots">
          {Array.from({ length: MAX }).map((_, i) => (
            <div key={i} className={`pin-dot${i < pin.length ? ' filled' : ''}`} />
          ))}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          maxLength={MAX}
          value={pin}
          onChange={e => { setPin(e.target.value.replace(/\D/g,'')); setError('') }}
          onKeyDown={handleKey}
          className={`pin-input${shake ? ' shake' : ''}`}
          placeholder="• • • •"
          disabled={loading}
        />

        {/* Error */}
        {error && (
          <div style={{ textAlign:'center', color:'#ef4444', fontSize:'0.8rem', fontFamily:'var(--font-body,sans-serif)', marginTop:'0.6rem', fontWeight:600 }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem' }}>
          <button
            onClick={onCancel}
            style={{ flex:1, padding:'0.75rem', borderRadius:12, border:`1.5px solid ${C.border}`, background:'white', color:C.textLight, fontFamily:'var(--font-body,sans-serif)', fontWeight:600, fontSize:'0.88rem', cursor:'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !pin}
            style={{ flex:2, padding:'0.75rem', borderRadius:12, border:'none', background: loading||!pin ? '#e2e8f0' : btnGrad, color: loading||!pin ? '#94a3b8' : 'white', fontFamily:'var(--font-body,sans-serif)', fontWeight:800, fontSize:'0.88rem', cursor: loading||!pin ? 'not-allowed' : 'pointer', transition:'all 0.15s' }}
          >
            {loading ? <><span className="pending-spinner" /> Verifying…</> : '🔓 Unlock Course'}
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:'0.7rem', color:C.textLight, fontFamily:'var(--font-body,sans-serif)', marginTop:'1rem' }}>
          Access stays unlocked for 24 hours per session
        </p>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function CoursesPage() {
  useEffect(() => { injectCSS('courses-css', COURSES_CSS) }, [])

  const { navigate }    = useRouter()
  const { openPayment } = usePayment()

  const [courses,        setCourses]        = useState([])
  const [enrollments,    setEnrollments]    = useState({})   // { [courseId]: { status, paymentId, enrollmentId } }
  const [loading,        setLoading]        = useState(true)
  const [freeToast,      setFreeToast]      = useState(null)
  const [confirmedToast, setConfirmedToast] = useState(null)
  const [pinTarget,      setPinTarget]      = useState(null) // course object awaiting PIN
  const pollRef = useRef(null)

  // ── Load courses ────────────────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const r = await fetch(`${API_BASE}/courses?is_published=true&limit=50`)
        const j = await r.json()
        const list = j.courses || j.items || j.data || []
        setCourses(list.length ? list : STATIC_COURSES)
      } catch {
        setCourses(STATIC_COURSES)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ── Load enrollments from DB ────────────────────────────────────────────────
  useEffect(() => {
    if (!getToken()) return
    ;(async () => {
      try {
        const rows = await fetchMyEnrollments()
        const map  = {}
        for (const row of rows) {
          map[String(row.course_id)] = {
            status:       row.status,
            paymentId:    row.payment_id,
            enrollmentId: row.id,
          }
        }
        setEnrollments(map)
      } catch {}
    })()
  }, [])

  // ── Poll pending payments ───────────────────────────────────────────────────
  const pollPending = useCallback(async () => {
    const pending = Object.entries(enrollments).filter(([, v]) => v.status === 'pending' && v.paymentId)
    if (!pending.length) return

    for (const [courseId, info] of pending) {
      const pay = await checkPaymentStatus(info.paymentId)
      if (!pay) continue
      if (pay.status === 'completed' || pay.status === 'paid') {
        setEnrollments(prev => ({
          ...prev,
          [courseId]: { ...prev[courseId], status: 'confirmed' },
        }))
        setCourses(prev => {
          const c = prev.find(c => String(c.id) === courseId)
          if (c) setConfirmedToast(c)
          return prev
        })
      }
    }
  }, [enrollments])

  useEffect(() => {
    const hasPending = Object.values(enrollments).some(v => v.status === 'pending')
    clearInterval(pollRef.current)
    if (!hasPending) return
    pollRef.current = setInterval(pollPending, POLL_INTERVAL)
    pollPending()
    return () => clearInterval(pollRef.current)
  }, [pollPending, enrollments])

  // ── Seat helpers ────────────────────────────────────────────────────────────
  function updateSeats(courseId, delta) {
    setCourses(prev => prev.map(c =>
      String(c.id) === String(courseId)
        ? { ...c, booked_count: Math.max(0, (c.booked_count || 0) + delta) }
        : c
    ))
  }

  // ── Enroll ──────────────────────────────────────────────────────────────────
  async function handleEnroll(course) {
    const cid    = String(course.id)
    if (enrollments[cid]) return
    const isFree = course.is_free || !course.price || Number(course.price) === 0

    if (isFree) {
      try {
        const { enrollment } = await enrollFree(cid)
        setEnrollments(prev => ({ ...prev, [cid]: { status:'free', paymentId:null, enrollmentId: enrollment?.id } }))
        updateSeats(cid, 1)
        setFreeToast(course)
      } catch (err) {
        alert(err.message || 'Could not enroll. Please try again.')
      }
      return
    }

    // Paid
    const result = await openPayment({
      type:            'course',
      amount:          course.price,
      title:           course.title,
      description:     `${course.lessons_count} lessons · ${course.duration_hours}h`,
      itemLines:       [{ label: course.title, amount: course.price }],
      couponEnabled:   true,
      allowedGateways: ['esewa','khalti','fonepay','stripe'],
      metadata:        { course_id: cid, course_title: course.title, category: 'course' },
    })

    if (result?.success) {
      const paymentId = result.paymentId || result.payment_id || result.id || null
      try {
        const { enrollment } = await enrollPaid(cid, paymentId)
        setEnrollments(prev => ({ ...prev, [cid]: { status:'pending', paymentId, enrollmentId: enrollment?.id } }))
        updateSeats(cid, 1)
      } catch (err) {
        alert(err.message || 'Could not save enrollment. Please contact support.')
      }
    }
  }

  // ── Leave ───────────────────────────────────────────────────────────────────
  async function handleLeave(course) {
    const cid = String(course.id)
    if (!enrollments[cid]) return
    if (!window.confirm(`Leave "${course.title}"? Your enrollment will be removed.`)) return
    try {
      await unenroll(cid)
      setEnrollments(prev => { const n = { ...prev }; delete n[cid]; return n })
      updateSeats(cid, -1)
    } catch (err) {
      alert(err.message || 'Could not unenroll. Please try again.')
    }
  }

  // ── Go to course — check PIN first ─────────────────────────────────────────
  function handleGoToCourse(course) {
    if (isPinUnlocked()) {
      navigate('/courses-videos', { courseId: String(course.id), courseTitle: course.title })
      return
    }
    setPinTarget(course)
  }

  function handlePinSuccess() {
    setPinTarget(null)
    navigate('/courses-videos', { courseId: String(pinTarget.id), courseTitle: pinTarget.title })
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="page-wrapper">
      <div style={{ textAlign:'center', padding:'6rem', fontFamily:'var(--font-body,sans-serif)', color:C.textLight }}>
        <div style={{ width:32, height:32, border:'3px solid #b0d4e8', borderTopColor:C.skyBright, borderRadius:'50%', margin:'0 auto 1rem', animation:'spin 0.7s linear infinite' }} />
        Loading courses…
      </div>
    </div>
  )

  const confirmedCount = Object.values(enrollments).filter(v => v.status==='confirmed'||v.status==='free').length
  const pendingCount   = Object.values(enrollments).filter(v => v.status==='pending').length

  return (
    <div className="page-wrapper">
      {/* PIN modal */}
      {pinTarget && (
        <PinModal
          courseTitle={pinTarget.title}
          onSuccess={handlePinSuccess}
          onCancel={() => setPinTarget(null)}
        />
      )}

      {/* Hero */}
      <div className="page-hero" style={{ background:'var(--earth-cream,#f5ede0)' }}>
        <span className="section-tag">Online Learning</span>
        <h1 className="section-title">Trainings for <em>Every</em> Journey</h1>
        <p className="section-desc">Self-paced, expert-led programs designed to support your mental wellness from home.</p>

        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.25rem', flexWrap:'wrap', justifyContent:'center' }}>
          {confirmedCount > 0 && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', padding:'0.5rem 1.2rem', borderRadius:100, fontFamily:'var(--font-body,sans-serif)', fontSize:'0.82rem', fontWeight:700, boxShadow:'0 4px 18px rgba(34,197,94,0.35)' }}>
              🎓 {confirmedCount} course{confirmedCount>1?'s':''} active
            </div>
          )}
          {pendingCount > 0 && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#fffbeb', color:'#92400e', border:'1.5px solid #fcd34d', padding:'0.5rem 1.2rem', borderRadius:100, fontFamily:'var(--font-body,sans-serif)', fontSize:'0.82rem', fontWeight:700, animation:'pending-pulse 2.2s ease infinite' }}>
              <span className="pending-spinner" />{pendingCount} awaiting confirmation
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="section" style={{ background:'var(--white,#fff)' }}>
        <div className="courses-grid">
          {courses.map((c, i) => {
            const cid        = String(c.id)
            const enrInfo    = enrollments[cid]
            const enrStatus  = enrInfo?.status
            const isEnrolled = !!enrInfo
            const isFree     = c.is_free || !c.price || Number(c.price) === 0
            const startDate  = fmtDate(c.start_date)
            const startTime  = fmtTime(c.start_time)
            const seats      = c.seats || c.max_seats || c.total_seats || null
            const booked     = c.booked_count || c.enrolled_count || 0
            const seatsLeft  = seats ? Math.max(0, seats - booked) : null
            const isFull     = seats ? seatsLeft === 0 : false
            const cardBg     = c.color || (i%2===0 ? 'var(--green-mist,#e8f3ee)' : i%3===0 ? 'var(--earth-cream,#f5ede0)' : 'var(--blue-mist,#e6f2f8)')

            let cardClass = 'course-card'
            if (enrStatus==='free')                           cardClass += ' enrolled-free'
            else if (enrStatus==='confirmed')                 cardClass += ' enrolled-paid'
            else if (enrStatus==='pending')                   cardClass += ' enrolled-pending'

            const badgeText  = enrStatus==='free' ? '✓ Free Enrolled' : enrStatus==='confirmed' ? '✓ Enrolled' : enrStatus==='pending' ? '⏳ Pending' : null
            const badgeStyle = enrStatus==='free'      ? { background:'#d1fae5', color:'#065f46', border:'1.5px solid #a7f3d0' }
                             : enrStatus==='confirmed' ? { background:C.skyFaint, color:C.skyDeep, border:`1.5px solid ${C.border}` }
                             : enrStatus==='pending'   ? { background:'#fffbeb', color:'#92400e', border:'1.5px solid #fcd34d', animation:'pending-pulse 2.2s ease infinite' }
                             : {}

            const headerBg   = enrStatus==='free'      ? 'linear-gradient(135deg,#d1fae5,#a7f3d0)'
                             : enrStatus==='confirmed' ? sectionGrad
                             : enrStatus==='pending'   ? 'linear-gradient(135deg,#fffbeb,#fef3c7)'
                             : cardBg

            return (
              <div key={cid} className={cardClass}>
                {badgeText && <div className="enrolled-badge" style={badgeStyle}>{badgeText}</div>}

                {/* Header */}
                <div style={{ background:headerBg, padding:'2rem', display:'flex', alignItems:'center', justifyContent:'center', height:110 }}>
                  <span style={{ fontSize:'3rem' }}>{c.emoji || '📚'}</span>
                </div>

                <div style={{ padding:'1.5rem' }}>
                  {/* Level + Price */}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:levelColor[c.level]||levelColor.Beginner }}>{c.level||'Beginner'}</span>
                    {isFree
                      ? <span style={{ fontSize:'0.72rem', fontWeight:800, padding:'3px 10px', borderRadius:100, background:'#d1fae5', color:'#065f46', border:'1.5px solid #a7f3d0', animation:'free-badge-glow 2.5s ease infinite', fontFamily:'var(--font-body,sans-serif)' }}>FREE</span>
                      : <span style={{ fontFamily:'var(--font-display,serif)', fontWeight:700, color: enrStatus==='confirmed' ? C.skyDeep : 'var(--green-deep,#3d6b5a)', fontSize:'0.95rem' }}>NPR {Number(c.price).toLocaleString()}</span>
                    }
                  </div>

                  <h3 style={{ fontFamily:'var(--font-display,serif)', fontSize:'1.05rem', fontWeight:400, color:'var(--green-deep,#3d6b5a)', marginBottom:'0.4rem', lineHeight:1.3 }}>{c.title}</h3>

                  {(c.instructor || c.instructor_name) && (
                    <p style={{ fontFamily:'var(--font-body,sans-serif)', fontSize:'0.8rem', color:'var(--text-light,#7a9aaa)', marginBottom:'0.6rem' }}>
                      By {c.instructor || c.instructor_name}
                    </p>
                  )}

                  {/* Tags */}
                  {(c.tags||[]).length > 0 && (
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'0.85rem' }}>
                      {(c.tags||[]).map((t,j) => <span key={j} className="tag" style={{ fontSize:'0.68rem' }}>{t}</span>)}
                    </div>
                  )}

                  {/* Stats row */}
                  <div style={{ display:'flex', gap:'1rem', fontSize:'0.78rem', color:'var(--text-light,#7a9aaa)', padding:'0.6rem 0', borderTop:'1px solid var(--earth-cream,#f0ebe3)', borderBottom:'1px solid var(--earth-cream,#f0ebe3)', marginBottom:'0.75rem' }}>
                    {c.lessons_count && <span>📚 {c.lessons_count} lessons</span>}
                    {c.duration_hours && <span>⏱ {c.duration_hours}h</span>}
                  </div>

                  {/* Start date */}
                  {(startDate || startTime) && (
                    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.6rem', padding:'0.45rem 0.65rem', background:C.skyFainter, borderRadius:8, border:'1px solid '+C.borderFaint }}>
                      <span style={{ fontSize:'0.7rem', color:C.skyDeep, fontWeight:700, fontFamily:'var(--font-body,sans-serif)' }}>
                        {startDate && <span>📅 {startDate}</span>}
                        {startDate && startTime && <span style={{ color:C.textLight, margin:'0 4px' }}>·</span>}
                        {startTime && <span>🕐 {startTime}</span>}
                      </span>
                    </div>
                  )}

                  {/* Seat bar */}
                  {seats && <SeatBar seats={seats} bookedCount={booked} />}

                  {/* ── CTA ── */}
                  {enrStatus==='pending' && <PendingBanner />}

                  {enrStatus==='free' || enrStatus==='confirmed' ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                      <button className="go-btn active" onClick={() => handleGoToCourse(c)}>
                        ▶ Go to Course
                      </button>
                      <button
                        onClick={() => handleLeave(c)}
                        style={{ width:'100%', padding:'0.52rem', borderRadius:10, border:'1px solid #fca5a5', background:'#fff5f5', color:'#b91c1c', fontFamily:'var(--font-body,sans-serif)', fontWeight:600, fontSize:'0.76rem', cursor:'pointer' }}>
                        Leave Course
                      </button>
                    </div>
                  ) : enrStatus==='pending' ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                      <button className="go-btn pending-state" disabled>
                        <span className="pending-spinner" />Waiting for Confirmation…
                      </button>
                      <div style={{ textAlign:'center', fontSize:'0.66rem', color:C.textLight, fontFamily:'var(--font-body,sans-serif)' }}>
                        Auto-unlocks once admin approves · checks every {POLL_INTERVAL/1000}s
                      </div>
                    </div>
                  ) : isFull ? (
                    <button disabled style={{ width:'100%', padding:'0.72rem', borderRadius:12, border:'1.5px solid var(--earth-cream,#f0ebe3)', background:'var(--earth-cream,#f0ebe3)', color:'var(--text-light,#7a9aaa)', fontFamily:'var(--font-body,sans-serif)', fontWeight:600, fontSize:'0.82rem', cursor:'not-allowed' }}>
                      Course Full
                    </button>
                  ) : isFree ? (
                    <button
                      onClick={() => handleEnroll(c)}
                      style={{ width:'100%', padding:'0.72rem', borderRadius:12, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', fontFamily:'var(--font-body,sans-serif)', fontWeight:800, fontSize:'0.88rem', cursor:'pointer', boxShadow:'0 4px 16px rgba(34,197,94,0.35)', animation:'free-badge-glow 2.5s ease infinite' }}>
                      🎓 Enroll Free →
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(c)}
                      style={{ width:'100%', padding:'0.72rem', borderRadius:12, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body,sans-serif)', fontWeight:800, fontSize:'0.88rem', cursor:'pointer', boxShadow:'0 4px 16px rgba(0,191,255,0.35)', animation:'course-enroll-pulse 3s ease infinite' }}>
                      💳 Enroll Now — NPR {Number(c.price).toLocaleString()} →
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {freeToast      && <FreeToast      course={freeToast}      onDone={() => setFreeToast(null)} />}
      {confirmedToast && <ConfirmedToast course={confirmedToast} onDone={() => setConfirmedToast(null)} />}
    </div>
  )
}
