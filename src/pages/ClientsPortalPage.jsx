// src/pages/ClientsPortalPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'
import { appointments, wellness, notifications } from '../services/api'

const TABS  = ['Overview','Appointments','Mood Diary','Journal','Notifications','Messages']
const MOODS = ['😞','😔','😐','🙂','😊','😄','🤩']

// NOTE: fixed — the original fallback referenced VITE_API_URL inside a
// single-quoted string, so `${...}` was never interpolated and the value
// was always the literal text "${import.meta.env.VITE_API_URL}/api".
// Adjust this fallback to your actual API host.
const API_BASE = import.meta.env.VITE_API_URL || '/api'

// ── Glass card palette (bluish-white, frosted) — identical to the
// therapist-card / session-type glass treatment on the Booking page ────────
const GLASS = {
  base:      'linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.7) 100%)',
  baseHover: 'linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(198,232,250,0.7) 55%, rgba(255,255,255,0.82) 100%)',
  borderIdle:   '1px solid rgba(255,255,255,0.6)',
  borderHover:  '1px solid rgba(120,190,230,0.7)',
  shadowIdle:   '0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.55)',
  shadowHover:  '0 14px 32px rgba(0,123,168,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
  blur: 'blur(14px)',
}

/* ─────────────────────────────────────────────────────────────
   CSS  (mobile responsive additions included)
───────────────────────────────────────────────────────────── */
const PORTAL_CSS = `
  .notif-item { display:flex; align-items:flex-start; gap:10px; padding:10px 12px; border-radius:10px; border:0.5px solid transparent; cursor:pointer; transition:background 0.15s; }
  .notif-item.unread { background:#fff; border-color:var(--blue-pale); }
  .notif-item.read   { background:transparent; }
  .notif-item:hover  { background:var(--off-white); }
  .notif-dot { width:7px; height:7px; border-radius:50%; margin-top:5px; flex-shrink:0; }
  .notif-icon { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
  .notif-title { font-size:13px; font-weight:700; color:var(--blue-deep); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .notif-item.read .notif-title { color:var(--text-light); font-weight:400; }
  .notif-msg { font-size:12px; color:var(--text-light); line-height:1.5; margin-top:1px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .notif-time { font-size:11px; color:#94a3b8; white-space:nowrap; flex-shrink:0; margin-top:3px; }
  .notif-filter-btn { font-size:12px; padding:4px 12px; border-radius:8px; border:1px solid var(--blue-pale); background:transparent; color:var(--text-light); cursor:pointer; transition:all 0.15s; font-family:var(--font-body); }
  .notif-filter-btn.active { background:var(--sky-light); color:var(--sky); border-color:var(--sky); font-weight:700; }
  .notif-section-label { font-size:11px; color:#94a3b8; font-weight:800; text-transform:uppercase; letter-spacing:0.07em; padding:8px 12px 4px; }
  .notif-load-more { width:100%; margin-top:8px; font-size:12px; padding:8px; border-radius:8px; border:1px solid var(--blue-pale); background:transparent; color:var(--text-light); cursor:pointer; font-family:var(--font-body); transition:background 0.15s; }
  .notif-load-more:hover { background:var(--off-white); }

  /* ── Portal tab bar: frosted glass, scrolls on desktop, 3-per-row grid on mobile ── */
  .portal-tabbar {
    background: linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.7) 100%);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.6);
    border-top: none;
    box-shadow: 0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.55);
    padding: 0 clamp(0.5rem,4vw,2rem);
    display: flex;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .portal-tabbar::-webkit-scrollbar { display: none; }
  .portal-tab-btn {
    flex-shrink: 0;
    padding: 0.9rem clamp(0.65rem,2vw,1.25rem);
    border: none;
    background: none;
    font-family: var(--font-body);
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-light);
    border-bottom: 2.5px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .portal-tab-btn.active {
    font-weight: 700;
    color: var(--sky);
    border-bottom-color: var(--sky);
    background: rgba(255,255,255,0.45);
  }

  /* ── Notification toolbar ── */
  .notif-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .notif-filters-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .notif-filter-group {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  @keyframes spin  { to { transform:rotate(360deg) } }
  @keyframes pulse { 0%,100% { box-shadow:0 4px 14px #10b98133; } 50% { box-shadow:0 4px 22px #10b98166; } }
  @keyframes logoutGlow {
    0%, 100% { box-shadow: 0 0 14px 2px rgba(14,165,233,0.45), 0 4px 18px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.6); }
    50%      { box-shadow: 0 0 22px 6px rgba(14,165,233,0.65), 0 4px 18px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.6); }
  }

  /* ── Logout button: outside blue glow, mobile only ── */
  @media (max-width: 600px) {
    .portal-logout-btn {
      box-shadow: 0 0 16px 3px rgba(14,165,233,0.5), 0 4px 18px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.6) !important;
      animation: logoutGlow 2.6s ease-in-out infinite;
    }
  }
  @keyframes logoutGlow {
    0%, 100% { box-shadow: 0 0 14px 2px rgba(14,165,233,0.45), 0 4px 18px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.6); }
    50%      { box-shadow: 0 0 22px 6px rgba(14,165,233,0.65), 0 4px 18px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.6); }
  }

  /* ── Logout button: outside blue glow, mobile only ── */
  @media (max-width: 600px) {
    .portal-logout-btn {
      box-shadow: 0 0 16px 3px rgba(14,165,233,0.5), 0 4px 18px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.6) !important;
      animation: logoutGlow 2.6s ease-in-out infinite;
    }
  }

  /* ════ MOBILE OVERRIDES (≤ 600px) ════ */
  @media (max-width: 600px) {

    /* Tab bar: 3 per row grid */
    .portal-tabbar {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr);
      overflow-x: visible;
      padding: 0;
    }
    .portal-tab-btn {
      padding: 0.65rem 0.25rem;
      font-size: 0.72rem;
      text-align: center;
      border-bottom: none;
      border-right: 1px solid rgba(255,255,255,0.6);
      white-space: normal;
      line-height: 1.25;
    }
    /* no right border on every 3rd tab */
    .portal-tab-btn:nth-child(3n) { border-right: none; }
    /* top border for second row */
    .portal-tab-btn:nth-child(n+4) { border-top: 1px solid rgba(255,255,255,0.6); }
    .portal-tab-btn.active {
      background: var(--sky-light);
      border-bottom: 2.5px solid var(--sky) !important;
    }

    /* Notification toolbar: stack vertically */
    .notif-toolbar { flex-direction: column; align-items: flex-start; }

    /* Filter buttons: 3 per row grid */
    .notif-filter-group {
      display: grid !important;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.4rem;
      width: 100%;
    }
    .notif-filter-btn {
      text-align: center;
      padding: 6px 4px;
      font-size: 0.71rem;
      width: 100%;
    }
    .notif-filters-wrap { width: 100%; }
  }
`

function injectCSS(id, css) {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  const el = document.createElement('style')
  el.id = id; el.textContent = css
  document.head.appendChild(el)
}

// ── Notification chime (synthesized, no audio file needed) ──
const NOTIF_POLL_MS = 30000 // check for new notifications every 30s

function playNotificationChime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    const now = ctx.currentTime
    // two quick ascending tones — a soft "ding-ding"
    ;[[880, now, 0.12], [1108.73, now + 0.13, 0.18]].forEach(([freq, start, dur]) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + dur + 0.03)
    })
    setTimeout(() => ctx.close(), 600)
  } catch {}
}

/* ─────────────────────────────────────────────────────────────
   CONTACT INFO
───────────────────────────────────────────────────────────── */
const CONTACT_INFO = {
  whatsapp: {
    number: '+977 9845064701', link: 'https://wa.me/9779845064701',
    label: 'WhatsApp', emoji: '💬', color: '#25D366', faint: '#e8fdf0',
  },
  messenger: {
    number: 'Common Psychology', link: 'https://m.me/commonpscyhology',
    label: 'Messenger', emoji: '💙', color: '#0084FF', faint: '#e0f0ff',
  },
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
function fmtTime12(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h % 12 || 12
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`
}

function getCountdown(bookedDate, startTime) {
  const now    = new Date()
  const target = new Date(`${bookedDate}T${startTime}`)
  const diffMs = target - now
  if (diffMs <= 0) return null
  const totalMins = Math.floor(diffMs / 60000)
  const days      = Math.floor(totalMins / 1440)
  const hours     = Math.floor((totalMins % 1440) / 60)
  const mins      = totalMins % 60
  if (days > 0)  return { label:`${days}d ${hours}h`, urgency: days <= 1 ? 'soon' : 'normal' }
  if (hours > 0) return { label:`${hours}h ${mins}m`, urgency:'soon' }
  return { label:`${mins}m`, urgency:'imminent' }
}

function isDue(bookedDate, endTime) {
  return new Date() >= new Date(`${bookedDate}T${endTime}`)
}

function packageInfo(durationHours) {
  if (durationHours >= 8) return { name:'Full Day',    emoji:'☀️',  color:'#d97706', faint:'#fef3c7', grad:'linear-gradient(135deg,#92400e,#d97706,#fbbf24)' }
  if (durationHours >= 4) return { name:'Half-Day',    emoji:'🌤️', color:'#10b981', faint:'#d1fae5', grad:'linear-gradient(135deg,#059669,#10b981)' }
  return                         { name:'Single Hour', emoji:'⏱️', color:'#0369a1', faint:'#e0f2fe', grad:'linear-gradient(135deg,#0369a1,#0ea5e9)' }
}

function paymentStatusBadge(paymentStatus, paymentMethod) {
  if (paymentStatus === 'paid')      return { label:'✓ Paid',                                   bg:'#d1fae5', color:'#065f46' }
  if (paymentStatus === 'refunded')  return { label:'↩ Refunded',                                bg:'#f5f3ff', color:'#5b21b6' }
  if (paymentStatus === 'failed')    return { label:'✗ Failed',                                  bg:'#fee2e2', color:'#991b1b' }
  if (paymentMethod)                 return { label:`⏳ ${paymentMethod.toUpperCase()} Pending`, bg:'#fef3c7', color:'#92400e' }
  return                                    { label:'💳 Payment Due',                            bg:'#fee2e2', color:'#991b1b' }
}



// ✅ NEW — badge for regular therapy appointments (uses a.payment_status
// values: 'unpaid' | 'pending' | 'pending_cod' | 'paid' | 'failed')
// An appointment is only "stale" if it's been unpaid for more than this many
// minutes — gives the client time to finish the payment modal without their
// own booking vanishing mid-checkout.
const UNPAID_GRACE_MINUTES = 20

function isStaleUnpaid(appt) {
  // Confirmed appointments are real, active bookings — never hide these,
  // even if payment is still pending/unpaid (e.g. cash/in-person payment,
  // or staff confirmed manually before the gateway callback fired).
  if (appt.status === 'confirmed') return false

  const unpaidStates = ['unpaid', 'pending', undefined, null]
  if (!unpaidStates.includes(appt.payment_status)) return false
  const createdAt = new Date(appt.created_at || appt.scheduled_at).getTime()
  const ageMinutes = (Date.now() - createdAt) / 60000
  return ageMinutes > UNPAID_GRACE_MINUTES
}

function apptPaymentBadge(status) {
  if (status === 'paid')                                 return { label:'✓ Paid',            bg:'#d1fae5', color:'#065f46' }
  if (status === 'pending' || status === 'pending_cod')   return { label:'⏳ Payment Pending', bg:'#fef3c7', color:'#92400e' }
  if (status === 'failed')                                return { label:'⚠️ Payment Issue',  bg:'#fee2e2', color:'#991b1b' }
  return                                                       { label:'💳 Payment Due',      bg:'#fee2e2', color:'#991b1b' }
}

/* ── Google Calendar link builders ──────────────────────────────────────── */
function pad2(n) { return String(n).padStart(2, '0') }

function toGCalUTC(date) {
  return date.getUTCFullYear()
    + pad2(date.getUTCMonth() + 1)
    + pad2(date.getUTCDate())
    + 'T'
    + pad2(date.getUTCHours())
    + pad2(date.getUTCMinutes())
    + pad2(date.getUTCSeconds())
    + 'Z'
}

// Regular therapy appointment — defaults to a 1hr block from scheduled_at
function googleCalLinkAppt(a) {
  const start = new Date(a.scheduled_at)
  if (isNaN(start)) return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  const end   = new Date(start.getTime() + 60 * 60000)
  const title = encodeURIComponent((a.type || 'Therapy Session') + ' with ' + (a.therapists?.profiles?.full_name || 'Therapist'))
  const desc  = encodeURIComponent('Appointment booked via Sajha Manobigyan client portal.')
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title
    + '&details=' + desc + '&dates=' + toGCalUTC(start) + '/' + toGCalUTC(end)
}

// Serenity Room booking — uses exact start_time/end_time
function googleCalLinkRoom(b) {
  const start = new Date(`${b.booked_date}T${b.start_time}`)
  const end   = new Date(`${b.booked_date}T${b.end_time}`)
  if (isNaN(start) || isNaN(end)) return 'https://calendar.google.com/calendar/render?action=TEMPLATE'
  const title = encodeURIComponent('The Serenity Room Booking')
  const desc  = encodeURIComponent('Room reservation via Sajha Manobigyan — The Serenity Room.')
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title
    + '&details=' + desc + '&dates=' + toGCalUTC(start) + '/' + toGCalUTC(end)
}

/* ─────────────────────────────────────────────────────────────
   SERENITY ROOM CARD
───────────────────────────────────────────────────────────── */
function SerenityBookingCard({ booking }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(id)
  }, [])

  const past      = isDue(booking.booked_date, booking.end_time)
  const countdown = past ? null : getCountdown(booking.booked_date, booking.start_time)
  const pkg       = packageInfo(Number(booking.duration_hours))
  const pymtBadge = paymentStatusBadge(booking.payment_status, booking.payment_method)

  const dateObj  = new Date(`${booking.booked_date}T${booking.start_time}`)
  const dayName  = dateObj.toLocaleDateString('en-US', { weekday:'long' })
  const monthDay = dateObj.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })

  const nowMs    = Date.now()
  const startMs  = new Date(`${booking.booked_date}T${booking.start_time}`).getTime()
  const endMs    = new Date(`${booking.booked_date}T${booking.end_time}`).getTime()
  const isActive = nowMs >= startMs && nowMs < endMs
  const progress = isActive ? Math.min(100, ((nowMs - startMs) / (endMs - startMs)) * 100) : 0

  return (
    <div style={{ background:past?'#f8fafc':'#ffffff', borderRadius:20, border:`1.5px solid ${past?'#e2e8f0':pkg.color+'44'}`, overflow:'hidden', boxShadow:past?'none':`0 6px 28px ${pkg.color}18`, opacity:past?0.65:1, marginBottom:'1rem', position:'relative', transition:'all 0.25s' }}>
      <div style={{ height:4, background:past?'#e2e8f0':pkg.grad }} />
      {isActive && <div style={{ position:'absolute', top:4, left:0, height:4, width:`${progress}%`, background:'rgba(255,255,255,0.6)', transition:'width 1s linear', zIndex:2 }} />}

      <div style={{ padding:'1.25rem 1.5rem' }}>
        <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start', flexWrap:'wrap' }}>
          <div style={{ flexShrink:0, width:72, minHeight:72, borderRadius:16, background:past?'#f1f5f9':pkg.faint, border:`1.5px solid ${past?'#e2e8f0':pkg.color+'33'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2 }}>
            <span style={{ fontSize:'1.6rem' }}>{past?'🏛️':pkg.emoji}</span>
            <span style={{ fontSize:'0.62rem', fontWeight:800, color:past?'#94a3b8':pkg.color, textTransform:'uppercase', letterSpacing:'0.04em', textAlign:'center', lineHeight:1.2, padding:'0 4px' }}>
              {dateObj.toLocaleDateString('en-US',{month:'short'})}<br/><span style={{ fontSize:'1rem', fontWeight:900 }}>{dateObj.getDate()}</span>
            </span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.3rem' }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700, color:past?'#64748b':'#1e293b' }}>The Serenity Room</span>
              <span style={{ fontSize:'0.68rem', fontWeight:700, background:past?'#f1f5f9':pkg.faint, color:past?'#94a3b8':pkg.color, borderRadius:100, padding:'0.15rem 0.6rem', border:`1px solid ${past?'#e2e8f0':pkg.color+'44'}` }}>{pkg.name}</span>
            </div>
            <div style={{ fontSize:'0.8rem', color:'#64748b', marginBottom:'0.5rem', fontWeight:500 }}>📅 {dayName}, {monthDay}</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', background:past?'#f8fafc':'#f0f9ff', border:`1px solid ${past?'#e2e8f0':'#bae6fd'}`, borderRadius:10, padding:'0.45rem 0.85rem', marginBottom:'0.65rem' }}>
              <span style={{ fontSize:'0.75rem' }}>🕐</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, color:past?'#64748b':'#0369a1' }}>{fmtTime12(booking.start_time)}</span>
              <span style={{ fontSize:'0.7rem', color:'#94a3b8', fontWeight:500 }}>→</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, color:past?'#64748b':'#0369a1' }}>{fmtTime12(booking.end_time)}</span>
              <span style={{ fontSize:'0.68rem', color:'#64748b', marginLeft:'0.25rem' }}>({Number(booking.duration_hours)}h)</span>
            </div>
            <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:'0.68rem', fontWeight:700, background:booking.status==='confirmed'?'#d1fae5':booking.status==='cancelled'?'#fee2e2':'#fef3c7', color:booking.status==='confirmed'?'#065f46':booking.status==='cancelled'?'#991b1b':'#92400e', borderRadius:100, padding:'0.18rem 0.6rem', textTransform:'uppercase', letterSpacing:'0.07em', border:`1px solid ${booking.status==='confirmed'?'#a7f3d0':booking.status==='cancelled'?'#fca5a5':'#fde68a'}` }}>
                {booking.status==='confirmed'?'✓ Confirmed':booking.status==='cancelled'?'✕ Cancelled':'⏳ Pending'}
              </span>
              <span style={{ fontSize:'0.68rem', fontWeight:700, background:pymtBadge.bg, color:pymtBadge.color, borderRadius:100, padding:'0.18rem 0.6rem' }}>{pymtBadge.label}</span>
              <span style={{ fontSize:'0.68rem', fontWeight:700, background:'#f8fafc', color:'#334155', borderRadius:100, padding:'0.18rem 0.6rem', border:'1px solid #e2e8f0' }}>NPR {Number(booking.total_amount).toLocaleString()}</span>
            </div>
            {booking.notes && <div style={{ marginTop:'0.6rem', fontSize:'0.78rem', color:'#64748b', fontStyle:'italic', lineHeight:1.5, borderTop:'1px solid #f1f5f9', paddingTop:'0.5rem' }}>📝 {booking.notes}</div>}
          </div>
          <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5rem' }}>
            {past ? (
              <div style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:12, padding:'0.5rem 0.85rem', textAlign:'center' }}>
                <div style={{ fontSize:'0.62rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.06em' }}>Past</div>
                <div style={{ fontSize:'0.9rem', fontWeight:700, color:'#64748b' }}>Done</div>
              </div>
            ) : isActive ? (
              <div style={{ background:'linear-gradient(135deg,#10b981,#34d399)', borderRadius:12, padding:'0.5rem 0.85rem', textAlign:'center', boxShadow:'0 4px 14px #10b98133', animation:'pulse 2s ease-in-out infinite' }}>
                <div style={{ fontSize:'0.62rem', fontWeight:800, color:'rgba(255,255,255,0.85)', textTransform:'uppercase', letterSpacing:'0.06em' }}>LIVE</div>
                <div style={{ fontSize:'0.82rem', fontWeight:800, color:'#fff' }}>In Session</div>
              </div>
            ) : countdown ? (
              <div style={{ background:countdown.urgency==='imminent'?'linear-gradient(135deg,#ef4444,#f87171)':countdown.urgency==='soon'?'linear-gradient(135deg,#f59e0b,#fbbf24)':pkg.grad, borderRadius:12, padding:'0.5rem 0.85rem', textAlign:'center', boxShadow:`0 4px 14px ${pkg.color}33` }}>
                <div style={{ fontSize:'0.58rem', fontWeight:800, color:'rgba(255,255,255,0.82)', textTransform:'uppercase', letterSpacing:'0.07em' }}>In</div>
                <div style={{ fontSize:'0.92rem', fontWeight:800, color:'#fff', whiteSpace:'nowrap' }}>{countdown.label}</div>
              </div>
            ) : null}
          </div>
        </div>
        {!past && (
          <div style={{ marginTop:'0.85rem', display:'flex', justifyContent:'flex-end' }}>
            <a
              href={googleCalLinkRoom(booking)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.75rem', padding: '0.4rem 0.9rem', borderRadius: 8,
                border: `1.5px solid ${pkg.color}44`, background: pkg.faint,
                color: pkg.color, fontWeight: 700, textDecoration: 'none',
                fontFamily: 'var(--font-body)',
              }}
            >
              📅 Add to Google Calendar
            </a>
          </div>
        )}

        {isActive && (
          <div style={{ marginTop:'0.85rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
              <span style={{ fontSize:'0.68rem', color:'#10b981', fontWeight:700 }}>Session in progress</span>
              <span style={{ fontSize:'0.68rem', color:'#10b981', fontWeight:700 }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height:6, background:'#d1fae5', borderRadius:99, overflow:'hidden' }}>
              <div style={{ height:'100%', background:'linear-gradient(90deg,#10b981,#34d399)', width:`${progress}%`, borderRadius:99, transition:'width 1s linear', boxShadow:'0 0 8px #10b98166' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   JOURNAL MODAL
───────────────────────────────────────────────────────────── */
function JournalModal({ entry, onClose }) {
  if (!entry) return null
  const fmtFull = d => new Date(d).toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#fff', borderRadius:18, padding:'2rem', maxWidth:620, width:'100%', maxHeight:'85vh', overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', border:'none', background:'#f0f4f8', borderRadius:'50%', width:32, height:32, cursor:'pointer', fontSize:'1rem', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        <div style={{ fontSize:'0.75rem', color:'#7a9aaa', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>{fmtFull(entry.created_at)}</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'#1a3a4a', margin:'0 0 1rem' }}>{entry.title || 'Untitled Entry'}</h2>
        {entry.mood_score && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:'#e0f7ff', color:'#007BA8', borderRadius:100, padding:'0.25rem 0.75rem', fontSize:'0.8rem', fontWeight:700, marginBottom:'1.25rem' }}>
            {MOODS[Math.min(entry.mood_score-1, MOODS.length-1)]} Mood: {entry.mood_score}/10
          </div>
        )}
        {entry.tags?.length > 0 && (
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
            {entry.tags.map((tag,i) => <span key={i} style={{ background:'#f0f4f8', color:'#2e6080', borderRadius:100, padding:'0.2rem 0.65rem', fontSize:'0.75rem', fontWeight:600 }}>#{tag}</span>)}
          </div>
        )}
        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.95rem', lineHeight:1.85, color:'#2e6080', whiteSpace:'pre-wrap', background:'#f8fbfc', borderRadius:10, padding:'1.25rem', border:'1px solid #daeef8' }}>{entry.content}</div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   MESSAGING PANEL
───────────────────────────────────────────────────────────── */
function MessagingPanel() {
  const [copied, setCopied] = useState('')
  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(''), 2500)
  }
  return (
    <div>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', marginBottom:'0.4rem' }}>Message Us</h2>
      <p style={{ fontSize:'0.85rem', color:'var(--text-light)', marginBottom:'2rem', lineHeight:1.65 }}>Reach out via WhatsApp or Messenger — we typically respond within a few hours during business hours.</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.25rem' }}>
        {Object.entries(CONTACT_INFO).map(([key, info]) => (
          <div key={key} style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:16, border:GLASS.borderIdle, overflow:'hidden', boxShadow:GLASS.shadowIdle, transition:'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=GLASS.shadowHover }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=GLASS.shadowIdle }}>
            <div style={{ background:info.faint, borderBottom:`1.5px solid ${info.color}22`, padding:'1.5rem 1.5rem 1.25rem', display:'flex', alignItems:'center', gap:'0.85rem' }}>
              <div style={{ width:52, height:52, borderRadius:'50%', background:info.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0, boxShadow:`0 4px 14px ${info.color}44` }}>{info.emoji}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--blue-deep)', fontWeight:700 }}>{info.label}</div>
            </div>
            <div style={{ padding:'1.25rem 1.5rem' }}>
              <div style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.5rem' }}>{key==='whatsapp'?'Phone Number':'Page Handle'}</div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.55)', borderRadius:10, padding:'0.65rem 0.85rem', border:GLASS.borderIdle, marginBottom:'1.1rem', gap:'0.75rem' }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--blue-deep)', fontWeight:700 }}>{info.number}</span>
                <button onClick={() => copyToClipboard(info.number, key)} style={{ padding:'0.3rem 0.8rem', borderRadius:7, border:`1.5px solid ${copied===key?'#22c55e':'var(--blue-pale)'}`, background:copied===key?'#e8fdf0':'var(--white)', color:copied===key?'#065f46':'var(--text-mid)', fontSize:'0.74rem', fontWeight:700, cursor:'pointer', transition:'all 0.18s', whiteSpace:'nowrap', fontFamily:'var(--font-body)' }}>{copied===key?'✓ Copied':'⎘ Copy'}</button>
              </div>
              <a href={info.link} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', width:'100%', padding:'0.8rem 1rem', background:info.color, color:'white', borderRadius:10, border:'none', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', textDecoration:'none', boxShadow:`0 4px 14px ${info.color}44`, transition:'opacity 0.18s' }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                {info.emoji} Open {info.label}
              </a>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:'2rem', background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:12, padding:'1.25rem 1.5rem', border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle, display:'flex', alignItems:'flex-start', gap:'0.75rem' }}>
        <span style={{ fontSize:'1.2rem', flexShrink:0, marginTop:2 }}>🕐</span>
        <div>
          <div style={{ fontWeight:700, color:'var(--blue-deep)', fontSize:'0.88rem', marginBottom:'0.3rem' }}>Response Hours</div>
          <div style={{ fontSize:'0.82rem', color:'var(--text-light)', lineHeight:1.65 }}>
            Sunday – Friday: 9:00 AM – 6:00 PM (NPT)<br/>
            Saturday: 10:00 AM – 2:00 PM (NPT)<br/>
            We aim to respond within 2–4 hours during these hours.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NOTIFICATIONS ICONS + BG + FILTERS
───────────────────────────────────────────────────────────── */
const NOTIF_ICONS = {
  appointment:'📅', reminder:'⏰', message:'💬', billing:'💳', wellness:'🌿', system:'🔔',
}
const NOTIF_BG = {
  appointment:'var(--sky-light)', reminder:'#fff8e6', message:'var(--green-mist)',
  billing:'#fee2e2', wellness:'var(--green-mist)', system:'var(--off-white)',
}
const NOTIF_FILTERS = [
  { key:'all',         label:'All'          },
  { key:'unread',      label:'Unread'       },
  { key:'appointment', label:'Appointments' },
  { key:'message',     label:'Messages'     },
  { key:'system',      label:'System'       },
]

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export default function ClientPortalPage() {
  const { navigate }     = useRouter()
  const { user, logout } = useAuth()
  const [tab, setTab]    = useState('Overview')

  const [stats,     setStats]     = useState(null)
  const [moodToday, setMoodToday] = useState(null)
  const [moodSaved, setMoodSaved] = useState(false)

  const [upcoming,     setUpcoming]     = useState([])
  const [past,         setPast]         = useState([])
  const [loadingAppts, setLoadingAppts] = useState(false)

  const [roomBookings,         setRoomBookings]         = useState([])
  const [loadingRoomBookings,  setLoadingRoomBookings]  = useState(false)
  const [showPastRoomBookings, setShowPastRoomBookings] = useState(false)
  const [showPastAppts,        setShowPastAppts]        = useState(false)
  const [moodLogs, setMoodLogs] = useState([])

  const [entries,     setEntries]     = useState([])
  const [newEntry,    setNewEntry]    = useState({ title:'', content:'' })
  const [savingEntry, setSavingEntry] = useState(false)
  const [openEntry,   setOpenEntry]   = useState(null)

  const [notifs,      setNotifs]      = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifFilter, setNotifFilter] = useState('all')
  const [notifShown,  setNotifShown]  = useState(8)

  const [loyaltyStatus, setLoyaltyStatus] = useState(null) // { completedCount, upcomingPaymentNumber, isEligible }

  // ── Notification chime tracking ──
  // null until the first successful load establishes a baseline of known IDs
  const seenNotifIds = useRef(null)
  const pollTimerRef = useRef(null)

  useEffect(() => {
    injectCSS('portal-css', PORTAL_CSS)
    return () => document.getElementById('portal-css')?.remove()
  }, [])
  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    loadOverview()
    if (user.role !== 'admin') loadLoyaltyStatus() // ✅ admins don't get loyalty rewards
    loadNotifications() // prime unread count + chime baseline on portal load
  }, [user])

  // ── Poll for new notifications regardless of which tab is open ──
  useEffect(() => {
    if (!user) return
    pollTimerRef.current = setInterval(() => { loadNotifications(true) }, NOTIF_POLL_MS)
    return () => clearInterval(pollTimerRef.current)
  }, [user])

  useEffect(() => {
    if (tab === 'Appointments')  { loadAppointments(); loadRoomBookings() }
    if (tab === 'Mood Diary')    loadMoodLogs()
    if (tab === 'Journal')       loadJournal()
    if (tab === 'Notifications') loadNotifications()
  }, [tab])

  async function loadOverview() {
    try {
      const [apptRes, moodRes] = await Promise.all([
        appointments.list({ limit: 50 }),   // ✅ no status filter anymore
        wellness.getMoodLogs({ limit: 7 }),
      ])
      const all     = apptRes.appointments || []
      // ✅ Exclude only truly abandoned (never-paid) holds. Pending / paid
      // both count toward "you have a session coming up".
      // Show pending/confirmed regardless of payment stage —
      // a brand-new booking starts as unpaid until gateway callback fires.
      const upcoming = all
        .filter(a =>
          ['pending', 'confirmed'].includes(a.status) &&
          new Date(a.scheduled_at) >= new Date() &&
          !isStaleUnpaid(a)
        )
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))

      const completedCount = all.filter(a => a.status === 'completed').length
      const moodAvg = moodRes.logs?.reduce((s, l) => s + l.mood_score, 0) / (moodRes.logs?.length || 1)

      setStats({
        sessions:    completedCount,
        nextSession: upcoming[0] ? new Date(upcoming[0].scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
        moodAvg:     moodAvg ? moodAvg.toFixed(1) : '—',
        streak:      moodRes.logs?.length || 0,
      })
    } catch {}
  }

  async function loadAppointments() {
    setLoadingAppts(true)
    try {
      const res = await appointments.list({ limit: 20 })
      console.log('[DEBUG] /appointments raw response:', res)
      const all = res.appointments || []
      console.log('[DEBUG] appointment count:', all.length, all)
      // Always show pending/confirmed — new bookings are 'unpaid' until
      // the payment gateway callback fires, so don't gate on payment_status here.
      const now = new Date()
      const upcomingAppts = all.filter(a => {
        if (a.status === 'cancelled') return false
        if (a.status === 'completed') return false
        if (isStaleUnpaid(a)) return false   // hide abandoned unpaid holds
        return new Date(a.scheduled_at) >= now
      })
      const pastAppts = all.filter(a => {
        if (a.status === 'completed') return true
        if (a.status === 'cancelled') return true
        return new Date(a.scheduled_at) < now
      })
      setUpcoming(upcomingAppts)
      setPast(pastAppts)
    } catch (err) {
      console.error('[DEBUG] loadAppointments FAILED:', err)
    } finally { setLoadingAppts(false) }
  }

  async function loadLoyaltyStatus() {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return
      const res  = await fetch(`${API_BASE}/payments/loyalty-status`, { headers: { Authorization:`Bearer ${token}` } })
      const data = await res.json()
      if (data.success) setLoyaltyStatus(data)
    } catch {}
  }

  async function loadRoomBookings() {
    setLoadingRoomBookings(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return
      const res  = await fetch(`${API_BASE}/room-bookings/my`, { headers: { Authorization:`Bearer ${token}` } })
      const data = await res.json()
      setRoomBookings(data.bookings || [])
    } catch {} finally { setLoadingRoomBookings(false) }
  }

  async function loadMoodLogs() {
    try { const res = await wellness.getMoodLogs({ limit:14 }); setMoodLogs(res.logs || []) } catch {}
  }

  async function loadJournal() {
    try { const res = await wellness.getJournal({ limit:20 }); setEntries(res.entries || []) } catch {}
  }

  async function loadNotifications(isPoll = false) {
    try {
      const res    = await notifications.list({ limit:50 })
      const list   = res.notifications  || []
      const unread = res.unreadCount    || 0

      if (seenNotifIds.current === null) {
        // First load ever this visit — establish baseline.
        // If there are already unread notifs waiting, chime once.
        seenNotifIds.current = new Set(list.map(n => n.id))
        if (unread > 0) playNotificationChime()
      } else {
        // Subsequent loads (polls or tab switches) — chime only for
        // notifications we haven't seen the ID of before, and only
        // if they're actually unread.
        const freshUnread = list.filter(n => !n.is_read && !seenNotifIds.current.has(n.id))
        if (freshUnread.length > 0) playNotificationChime()
        seenNotifIds.current = new Set(list.map(n => n.id))
      }

      setNotifs(list)
      setUnreadCount(unread)
    } catch {}
  }

  async function saveMood(idx) {
    setMoodToday(idx)
    try {
      await wellness.addMoodLog({ moodScore:idx + 1, emotions:[], notes:'' })
      setMoodSaved(true)
      setTimeout(() => setMoodSaved(false), 3000)
    } catch {}
  }

  async function saveJournalEntry() {
    if (!newEntry.content.trim()) return
    setSavingEntry(true)
    try {
      await wellness.createEntry({ title:newEntry.title, content:newEntry.content })
      setNewEntry({ title:'', content:'' })
      loadJournal()
    } catch {} finally { setSavingEntry(false) }
  }

  async function markNotifRead(id) {
    try {
      await notifications.markRead(id)
      setNotifs(n => n.map(x => x.id === id ? { ...x, is_read:true } : x))
      setUnreadCount(c => Math.max(0, c - 1))
    } catch {}
  }

  async function markAllRead() {
    try {
      await notifications.markAllRead()
      setNotifs(n => n.map(x => ({ ...x, is_read:true })))
      setUnreadCount(0)
    } catch {}
  }

  async function cancelAppt(id) {
    try { await appointments.cancel(id); loadAppointments() } catch {}
  }

  const fmtDate  = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
  const fmtTime  = d => new Date(d).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})
  const fmtShort = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'})

  const fmtAgo = d => {
    const diff  = Date.now() - new Date(d).getTime()
    const mins  = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days  = Math.floor(hours / 24)
    if (mins  <  1) return 'just now'
    if (mins  < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days  <  7) return `${days}d ago`
    return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric'})
  }

  function tabLabel(t) {
    if (t === 'Notifications' && unreadCount > 0) return `${t} (${unreadCount})`
    return t
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const upcomingRoomBookings = roomBookings
    .filter(b => b.booked_date >= todayStr && b.status !== 'cancelled')
    .sort((a,b) => a.booked_date.localeCompare(b.booked_date) || a.start_time.localeCompare(b.start_time))
  const pastRoomBookings = roomBookings
    .filter(b => b.booked_date < todayStr || b.status === 'cancelled')
    .sort((a,b) => b.booked_date.localeCompare(a.booked_date))

  const typeOf        = n => n.type || 'system'
  const notifFiltered = notifFilter === 'all'    ? notifs
    : notifFilter === 'unread'                   ? notifs.filter(n => !n.is_read)
    : notifs.filter(n => typeOf(n) === notifFilter)
  const notifVisible  = notifFiltered.slice(0, notifShown)
  const notifHasMore  = notifFiltered.length > notifShown
  const notifNew      = notifVisible.filter(n => !n.is_read)
  const notifOld      = notifVisible.filter(n =>  n.is_read)

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="page-wrapper" style={{
      background:
        'radial-gradient(circle at 10% 0%, rgba(14,165,233,0.14), transparent 52%),' +
        'radial-gradient(circle at 100% 15%, rgba(41,128,185,0.12), transparent 55%),' +
        'radial-gradient(circle at 50% 100%, rgba(125,211,252,0.16), transparent 60%),' +
        'linear-gradient(175deg, rgba(185, 221, 246, 0.75) 0%, rgba(240,249,255,0.85) 35%, rgba(173, 220, 247, 0.7) 70%, rgba(232,247,255,0.85) 100%)',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
    }}>

      <JournalModal entry={openEntry} onClose={() => setOpenEntry(null)} />

      {/* ── Header ── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(214,238,252,0.65) 55%, rgba(255,255,255,0.85) 100%)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderBottom: '1px solid rgba(120,190,230,0.5)',
          boxShadow: '0 4px 22px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
          padding: 'clamp(1.5rem,4vw,2.25rem) clamp(1rem,4vw,2rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{
          position: 'absolute', width: 280, height: 280, borderRadius: '50%',
          background: 'rgba(14,165,233,0.16)', filter: 'blur(52px)',
          top: -140, right: '10%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(125,211,252,0.22)', filter: 'blur(50px)',
          bottom: -100, left: '10%', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.3rem,4.5vw,1.75rem)',
              color: '#0f3a52',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            Welcome back,
            <span
              style={{
                fontWeight: 800,
                background: 'linear-gradient(90deg, #00BFFF, #1276fa 50%, #00BFFF)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shine 3.5s linear infinite',
                textShadow: '0 0 18px rgba(14,165,233,0.35)',
              }}
            >
              {user?.fullName?.split(' ')[0] || 'there'}
            </span>
            <span style={{ fontSize: '1.4rem' }}>👋</span>
          </div>

          {/* ── Next session callout — the eye-catching part ── */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginTop: '0.85rem',
              borderRadius: 14,
              padding: '0.6rem 1.1rem',
              fontSize: '0.92rem',
              fontWeight: 700,
              ...(stats?.nextSession !== '—'
                ? {
                    background: 'linear-gradient(135deg, #ffd166, #ffb74d)',
                    color: '#3a2400',
                    boxShadow: '0 6px 24px rgba(255,183,77,0.45)',
                    animation: 'glowPulse 2.4s ease-in-out infinite',
                  }
                : {
                    background: 'rgba(14,165,233,0.08)',
                    border: '1px solid rgba(14,165,233,0.18)',
                    color: '#3a5a72',
                    fontWeight: 500,
                    backdropFilter: 'blur(6px)',
                  }),
            }}
          >
            <span style={{ fontSize: '1.15rem' }}>
              {stats?.nextSession !== '—' ? '🔔' : '🌙'}
            </span>
            {stats?.nextSession !== '—'
              ? <>Upcoming session — <strong>{stats?.nextSession}</strong></>
              : 'No upcoming sessions — your calendar is clear'}
          </div>
        </div>

        <button
          onClick={logout}
          className="portal-logout-btn"
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.6rem 1.2rem',
            borderRadius: 12,
            border: '1.5px solid rgba(14,165,233,0.3)',
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#0369a1',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
            transition: 'all 0.22s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.85)'
            e.currentTarget.style.borderColor = 'rgba(14,165,233,0.5)'
            e.currentTarget.style.boxShadow = '0 6px 22px rgba(14,165,233,0.18), inset 0 1px 0 rgba(255,255,255,0.7)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.55)'
            e.currentTarget.style.borderColor = 'rgba(14,165,233,0.3)'
            e.currentTarget.style.boxShadow = '0 4px 18px rgba(14,165,233,0.12), inset 0 1px 0 rgba(255,255,255,0.6)'
            e.currentTarget.style.transform = 'none'
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>

      <style>{`
        @keyframes shine {
          to { background-position: 200% center; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 6px 24px rgba(255,183,77,0.45); transform: scale(1); }
          50% { box-shadow: 0 8px 32px rgba(255,183,77,0.7); transform: scale(1.02); }
        }
      `}</style>

      {/* ── Tab bar — responsive via CSS class ── */}
      <div className="portal-tabbar">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`portal-tab-btn${tab === t ? ' active' : ''}`}
          >
            {tabLabel(t)}
          </button>
        ))}
      </div>

      <div style={{ padding:'clamp(1rem,4vw,2rem)', maxWidth:1100, margin:'0 auto' }}>

        {tab === 'Overview' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
              {[
                { label:'Sessions Completed', val:stats?.sessions??'…',         icon:'✅' },
                { label:'Next Appointment',   val:stats?.nextSession??'…',      icon:'📅' },
                { label:'Log Streak',         val:`${stats?.streak??'…'} days`, icon:'🔥' },
                { label:'Avg Mood (7 days)',  val:stats?.moodAvg??'…',          icon:'😊' },
              ].map((c) => (
                <div key={c.label} style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:'var(--radius-md)', padding:'1.25rem', border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:'0.4rem' }}>{c.icon}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--blue-deep)' }}>{c.val}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-light)', fontWeight:600 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {loyaltyStatus && user?.role !== 'admin' && (() => {
              const completed     = loyaltyStatus.completedCount || 0
              const nextMilestone = Math.ceil((completed + 1) / 10) * 10 + 1 // e.g. 11, 21, 31...
              const inCycleCount  = completed % 10                            // 0..9 payments since last reward
              const progressPct   = Math.min(100, (inCycleCount / 10) * 100)
              const paymentsToGo  = 10 - inCycleCount

              return (
                <div style={{
                  background: loyaltyStatus.isEligible
                    ? 'linear-gradient(135deg,#fff7e6,#fffbeb)'
                    : GLASS.base,
                  backdropFilter: GLASS.blur,
                  WebkitBackdropFilter: GLASS.blur,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.75rem 2rem',
                  border: loyaltyStatus.isEligible ? '1.5px solid #fbbf24' : GLASS.borderIdle,
                  boxShadow: loyaltyStatus.isEligible ? 'none' : GLASS.shadowIdle,
                  marginBottom: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem', marginBottom:'0.9rem' }}>
                    <div>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--blue-deep)', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        💳 Payments Made
                      </div>
                      <div style={{ fontSize:'0.78rem', color:'var(--text-light)', marginTop:'0.15rem' }}>
                        Every 10th payment unlocks a reward
                      </div>
                    </div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800, color:'var(--blue-deep)', lineHeight:1 }}>
                      {completed}
                    </div>
                  </div>

                  {loyaltyStatus.isEligible ? (
                    <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', background:'#fbbf24', borderRadius:12, padding:'0.75rem 1rem', boxShadow:'0 4px 14px rgba(251,191,36,0.35)' }}>
                      <span style={{ fontSize:'1.3rem' }}>🎉</span>
                      <div>
                        <div style={{ fontWeight:800, color:'#3a2400', fontSize:'0.9rem' }}>
                          50% off unlocked for your {loyaltyStatus.upcomingPaymentNumber}th payment!
                        </div>
                        <div style={{ fontSize:'0.75rem', color:'#5c3d00' }}>
                          It'll be applied automatically at checkout.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ height:8, background:'var(--blue-pale)', borderRadius:99, overflow:'hidden', marginBottom:'0.6rem' }}>
                        <div style={{ height:'100%', width:`${progressPct}%`, background:'linear-gradient(90deg,#0369a1,#0ea5e9)', borderRadius:99, transition:'width 0.6s ease' }} />
                      </div>
                      <div style={{ fontSize:'0.82rem', color:'var(--text-mid)' }}>
                        <strong style={{ color:'var(--blue-deep)' }}>{paymentsToGo} more payment{paymentsToGo !== 1 ? 's' : ''}</strong> to get <strong style={{ color:'var(--blue-deep)' }}>50% off</strong> on your {nextMilestone}th payment.
                      </div>
                    </>
                  )}
                </div>
              )
            })()}

            <div style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:'var(--radius-lg)', padding:'2rem', border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle, marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--blue-deep)', marginBottom:'1rem' }}>How are you feeling today?</div>
              <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                {MOODS.map((e,i) => (
                  <button key={i} onClick={() => saveMood(i)} style={{ fontSize:'1.8rem', padding:'0.5rem', border:`2px solid ${moodToday===i?'var(--sky)':'var(--blue-pale)'}`, borderRadius:'var(--radius-sm)', background:moodToday===i?'var(--sky-light)':'var(--off-white)', cursor:'pointer', transition:'all 0.2s' }}>{e}</button>
                ))}
              </div>
              {moodSaved && <p style={{ marginTop:'0.75rem', color:'var(--green-deep)', fontSize:'0.85rem', fontWeight:600 }}>✓ Mood logged. Keep it up!</p>}
            </div>

            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/book')}>Book New Session</button>
              <button className="btn btn-outline" onClick={() => setTab('Mood Diary')}>Mood Diary →</button>
              <button className="btn btn-outline" onClick={() => setTab('Journal')}>Journal →</button>
              <button className="btn btn-outline" onClick={() => setTab('Messages')}>💬 Message Us →</button>
            </div>
          </div>
        )}

        {/* ══ APPOINTMENTS ══ */}
        {tab === 'Appointments' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', margin:0 }}>Upcoming Sessions</h2>
              <button className="btn btn-primary" style={{ fontSize:'0.82rem', padding:'0.5rem 1rem' }} onClick={() => navigate('/book')}>+ Book New</button>
            </div>

            {loadingAppts ? (
              <p style={{ color:'var(--text-light)' }}>Loading…</p>
            ) : upcoming.length === 0 ? (
              <div style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:'var(--radius-md)', padding:'2rem', textAlign:'center', border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle, marginBottom:'2rem' }}>
                <p style={{ color:'var(--text-light)', marginBottom:'1rem' }}>No upcoming appointments.</p>
                <button className="btn btn-primary" onClick={() => navigate('/book')}>Book A Session →</button>
              </div>
            ) : upcoming.map((a) => {

              const apptDate  = new Date(a.scheduled_at)
              const msUntil   = apptDate - Date.now()
              const daysUntil = Math.ceil((apptDate - new Date()) / 86400000)
              const isToday    = daysUntil === 0
              const isTomorrow = daysUntil === 1

              const urgencyColor = isToday ? '#ef4444' : isTomorrow ? '#f59e0b' : '#10b981'
              const urgencyBg    = isToday ? '#fee2e2' : isTomorrow ? '#fef3c7' : '#d1fae5'
              const urgencyLabel = isToday ? '🔴 Today' : isTomorrow ? '🟡 Tomorrow' : `🟢 In ${daysUntil} days`
              return (
                <div key={a.id} style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: `1.5px solid ${isToday ? '#fca5a5' : isTomorrow ? '#fde68a' : '#a7f3d0'}`,
                  marginBottom: '0.85rem',
                  overflow: 'hidden',
                  boxShadow: `0 4px 18px ${urgencyColor}18`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${urgencyColor}28` }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 4px 18px ${urgencyColor}18` }}
                >
                  <div style={{ height: 3, background: `linear-gradient(90deg, ${urgencyColor}, ${urgencyColor}88)` }} />
                  <div style={{ padding: '1.1rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                        background: urgencyBg, border: `1.5px solid ${urgencyColor}44`,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '0.58rem', fontWeight: 800, color: urgencyColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {apptDate.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: urgencyColor, lineHeight: 1.1 }}>
                          {apptDate.getDate()}
                        </span>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                          {a.type} · {a.therapists?.profiles?.full_name || 'Therapist'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.35rem' }}>
                          🕐 {fmtTime(a.scheduled_at)}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: urgencyBg, color: urgencyColor, border: `1px solid ${urgencyColor}44` }}>
                            {urgencyLabel}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: '#d1fae5', color: '#065f46' }}>
                            ✓ Confirmed
                          </span>
                          {(() => { const b = apptPaymentBadge(a.payment_status); return <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: b.bg, color: b.color }}>{b.label}</span> })()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <a
                        href={googleCalLinkAppt(a)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: '0.78rem', padding: '0.4rem 0.9rem', borderRadius: 8,
                          border: '1.5px solid #a7d8f0', background: '#f0f9ff',
                          color: '#0369a1', fontWeight: 700, textDecoration: 'none',
                          fontFamily: 'var(--font-body)', whiteSpace: 'nowrap',
                        }}
                      >
                        📅 Add to Calendar
                      </a>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.78rem', padding: '0.4rem 1rem', color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => cancelAppt(a.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            <button onClick={() => setShowPastAppts(v => !v)} style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'none', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:700, color:'#64748b', padding:'0.5rem 0', margin:'2rem 0 0.75rem', fontFamily:'var(--font-body)' }}>
              <span style={{ display:'inline-flex', width:20, height:20, borderRadius:6, background:'#f1f5f9', border:'1px solid #e2e8f0', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', transition:'transform 0.2s', transform:showPastAppts?'rotate(90deg)':'none' }}>▶</span>
              Past Sessions ({past.length})
            </button>
            {showPastAppts && (past.length === 0 ? (
              <p style={{ color:'var(--text-light)' }}>No past sessions yet.</p>
            ) : past.map((a) => (
              <div key={a.id} style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:'var(--radius-md)', padding:'1rem 1.5rem', border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle, display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <div>
                  <div style={{ fontWeight:600, color:'var(--text-mid)' }}>{a.therapists?.profiles?.full_name || 'Therapist'} · {fmtDate(a.scheduled_at)}</div>
                  <span style={{ fontSize:'0.75rem', fontWeight:700, textTransform:'uppercase', color:a.status==='completed'?'var(--green-deep)':'#c0392b' }}>{a.status}</span>
                </div>
              </div>
            )))}

            {/* Serenity Room */}
            <div style={{ marginTop:'2.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem', marginBottom:'1.25rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#0369a1,#0ea5e9)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', boxShadow:'0 4px 12px #0ea5e933' }}>🏛️</div>
                  <div>
                    <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', margin:0 }}>The Serenity Room</h2>
                    <p style={{ fontSize:'0.75rem', color:'var(--text-light)', margin:'2px 0 0' }}>Your space bookings at PsycheCare Nepal</p>
                  </div>
                </div>
                <button className="btn btn-primary" style={{ fontSize:'0.82rem', padding:'0.5rem 1rem' }} onClick={() => navigate('/ashram')}>+ Book Room</button>
              </div>

              {loadingRoomBookings ? (
                <div style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:16, border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle, padding:'2rem', textAlign:'center' }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', color:'#94a3b8', fontSize:'0.85rem' }}>
                    <span style={{ display:'inline-block', width:16, height:16, border:'2.5px solid #e0f2fe', borderTopColor:'#0ea5e9', borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
                    Loading your room bookings…
                  </div>
                </div>
              ) : upcomingRoomBookings.length === 0 && pastRoomBookings.length === 0 ? (
                <div style={{ background:'linear-gradient(135deg,#f0f9ff,#ecfdf5)', borderRadius:18, border:'1.5px dashed #bae6fd', padding:'2.5rem', textAlign:'center' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🏛️</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'#1e293b', marginBottom:'0.5rem' }}>No room bookings yet</div>
                  <p style={{ fontSize:'0.83rem', color:'#64748b', maxWidth:320, margin:'0 auto 1.25rem', lineHeight:1.65 }}>Reserve The Serenity Room — a private, sound-proofed wellness space for sessions, workshops, or individual reflection.</p>
                  <button className="btn btn-primary" style={{ fontSize:'0.85rem' }} onClick={() => navigate('/ashram')}>Explore &amp; Book →</button>
                </div>
              ) : (
                <>
                  {upcomingRoomBookings.length > 0 && (
                    <div style={{ marginBottom:'1.5rem' }}>
                      <div style={{ fontSize:'0.68rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.85rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block' }}/>
                        Upcoming · {upcomingRoomBookings.length} booking{upcomingRoomBookings.length !== 1 ? 's' : ''}
                      </div>
                      {upcomingRoomBookings.map((b,i) => <SerenityBookingCard key={b.id||i} booking={b} />)}
                    </div>
                  )}
                  {pastRoomBookings.length > 0 && (
                    <div>
                      <button onClick={() => setShowPastRoomBookings(v => !v)} style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'none', border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:700, color:'#64748b', padding:'0.5rem 0', marginBottom:'0.75rem', fontFamily:'var(--font-body)' }}>
                        <span style={{ display:'inline-flex', width:20, height:20, borderRadius:6, background:'#f1f5f9', border:'1px solid #e2e8f0', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', transition:'transform 0.2s', transform:showPastRoomBookings?'rotate(90deg)':'none' }}>▶</span>
                        Past Room Bookings ({pastRoomBookings.length})
                      </button>
                      {showPastRoomBookings && pastRoomBookings.map((b,i) => <SerenityBookingCard key={b.id||i} booking={b} />)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ══ MOOD DIARY ══ */}
        {tab === 'Mood Diary' && (
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', marginBottom:'1.5rem' }}>Mood Log</h2>
            {moodLogs.length === 0 ? (
              <div style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:'var(--radius-md)', padding:'2rem', textAlign:'center', border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle }}>
                <p style={{ color:'var(--text-light)', marginBottom:'1rem' }}>No mood logs yet.</p>
                <button className="btn btn-outline" onClick={() => setTab('Overview')}>Log Mood Now</button>
              </div>
            ) : (
              <>
                <div style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:'var(--radius-lg)', padding:'1.5rem', border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle, marginBottom:'1.5rem' }}>
                  <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--text-light)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'1rem' }}>Last {Math.min(moodLogs.length,14)} days</div>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem', height:120 }}>
                    {moodLogs.slice(0,14).reverse().map((m,i) => (
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2, minWidth:0 }}>
                        <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--sky)' }}>{m.mood_score}</span>
                        <div style={{ width:'100%', background:'var(--sky)', opacity:0.7+m.mood_score*0.03, borderRadius:'4px 4px 0 0', height:m.mood_score*10, transition:'height 0.8s' }}/>
                        <span style={{ fontSize:'0.6rem', color:'var(--text-light)', whiteSpace:'nowrap' }}>{fmtShort(m.logged_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {moodLogs.map((m,i) => (
                  <div key={i} style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:'var(--radius-md)', padding:'1rem 1.25rem', border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle, marginBottom:'0.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <span style={{ fontSize:'1.5rem' }}>{MOODS[Math.min(m.mood_score-1,MOODS.length-1)]}</span>
                      <div>
                        <strong style={{ color:'var(--blue-deep)' }}>{m.mood_score}/10</strong>
                        {m.emotions?.length > 0 && <div style={{ fontSize:'0.75rem', color:'var(--text-light)', marginTop:2 }}>{m.emotions.join(', ')}</div>}
                        {m.notes && <div style={{ fontSize:'0.82rem', color:'var(--text-mid)', marginTop:2 }}>{m.notes}</div>}
                      </div>
                    </div>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-light)', flexShrink:0, marginLeft:'1rem' }}>{fmtDate(m.logged_at)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* ══ JOURNAL ══ */}
        {tab === 'Journal' && (
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', marginBottom:'1.5rem' }}>My Journal</h2>
            <div style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:'var(--radius-lg)', padding:'1.75rem', border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle, marginBottom:'2rem' }}>
              <h3 style={{ fontSize:'1rem', color:'var(--blue-deep)', marginBottom:'1rem', fontFamily:'var(--font-display)' }}>✍️ New Entry</h3>
              <input placeholder="Title (optional)" value={newEntry.title} onChange={e => setNewEntry(n => ({ ...n, title:e.target.value }))}
                style={{ width:'100%', padding:'0.7rem 1rem', border:'1.5px solid var(--blue-pale)', borderRadius:10, fontSize:'0.95rem', marginBottom:'0.75rem', boxSizing:'border-box', outline:'none', fontFamily:'var(--font-body)', color:'#1a3a4a', background:'rgba(255,255,255,0.6)' }}/>
              <textarea placeholder="What's on your mind today? Write freely — this is your private space." value={newEntry.content} rows={5}
                onChange={e => setNewEntry(n => ({ ...n, content:e.target.value }))}
                style={{ width:'100%', padding:'0.7rem 1rem', border:'1.5px solid var(--blue-pale)', borderRadius:10, fontSize:'0.9rem', resize:'vertical', boxSizing:'border-box', outline:'none', fontFamily:'var(--font-body)', color:'#1a3a4a', lineHeight:1.7, background:'rgba(255,255,255,0.6)' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.85rem' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text-light)' }}>{newEntry.content.length} characters</span>
                <button className="btn btn-primary" onClick={saveJournalEntry} disabled={savingEntry || !newEntry.content.trim()} style={{ opacity:savingEntry||!newEntry.content.trim()?0.6:1 }}>
                  {savingEntry ? 'Saving…' : 'Save Entry →'}
                </button>
              </div>
            </div>
            {entries.length === 0 ? (
              <p style={{ color:'var(--text-light)', textAlign:'center', padding:'2rem' }}>No journal entries yet. Write your first one above!</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                {entries.map((e,i) => (
                  <div key={i} onClick={() => setOpenEntry(e)} style={{ background:GLASS.base, backdropFilter:GLASS.blur, WebkitBackdropFilter:GLASS.blur, borderRadius:'var(--radius-md)', padding:'1.25rem 1.5rem', border:GLASS.borderIdle, boxShadow:GLASS.shadowIdle, cursor:'pointer', transition:'all 0.18s' }}
                    onMouseEnter={el => { el.currentTarget.style.background=GLASS.baseHover; el.currentTarget.style.boxShadow=GLASS.shadowHover }}
                    onMouseLeave={el => { el.currentTarget.style.background=GLASS.base; el.currentTarget.style.boxShadow=GLASS.shadowIdle }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.65rem', gap:'1rem' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--blue-deep)', fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.title||'Untitled Entry'}</div>
                        <div style={{ fontSize:'0.75rem', color:'var(--text-light)', marginTop:2 }}>{fmtDate(e.created_at)}</div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
                        {e.mood_score && <span style={{ background:'#e0f7ff', color:'#007BA8', borderRadius:100, padding:'0.18rem 0.55rem', fontSize:'0.72rem', fontWeight:700 }}>{MOODS[Math.min(e.mood_score-1,MOODS.length-1)]} {e.mood_score}/10</span>}
                        <span style={{ fontSize:'0.75rem', color:'var(--sky)', fontWeight:600 }}>Read →</span>
                      </div>
                    </div>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:'0.87rem', color:'var(--text-mid)', lineHeight:1.65, margin:0, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{e.content}</p>
                    {e.tags?.length > 0 && (
                      <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap', marginTop:'0.65rem' }}>
                        {e.tags.map((tag,ti) => <span key={ti} style={{ background:'#f0f4f8', color:'#4a6a7a', borderRadius:100, padding:'0.15rem 0.55rem', fontSize:'0.7rem', fontWeight:600 }}>#{tag}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ NOTIFICATIONS ══ */}
        {tab === 'Notifications' && (
          <div>
            {/* ── Toolbar: title left, filters+mark-all right ── */}
            <div className="notif-toolbar">

              {/* Title + badge */}
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', color:'var(--blue-deep)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{ background:'var(--sky-light)', color:'var(--sky)', fontSize:'11px', fontWeight:800, borderRadius:99, padding:'2px 8px', border:'1px solid var(--sky)' }}>
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Filters + mark all — wraps on mobile */}
              <div className="notif-filters-wrap">
                {/* Filter buttons — 3-per-row grid on mobile via CSS */}
                <div className="notif-filter-group">
                  {NOTIF_FILTERS.map(f => (
                    <button
                      key={f.key}
                      className={`notif-filter-btn${notifFilter === f.key ? ' active' : ''}`}
                      onClick={() => { setNotifFilter(f.key); setNotifShown(8) }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize:'12px', padding:'4px 12px', borderRadius:8, border:'1px solid var(--blue-pale)', background:'none', color:'var(--text-light)', cursor:'pointer', fontFamily:'var(--font-body)', whiteSpace:'nowrap' }}>
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            {notifVisible.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem 1rem', color:'var(--text-light)', fontSize:'0.85rem' }}>
                <div style={{ fontSize:'1.8rem', marginBottom:'0.5rem' }}>🔔</div>
                No notifications{notifFilter !== 'all' ? ' in this category' : ''}.
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
                {notifNew.length > 0 && (
                  <>
                    {notifOld.length > 0 && <div className="notif-section-label">New</div>}
                    {notifNew.map(n => (
                      <div key={n.id} className="notif-item unread" onClick={() => markNotifRead(n.id)}>
                        <div className="notif-dot" style={{ background:'var(--sky)' }} />
                        <div className="notif-icon" style={{ background:NOTIF_BG[typeOf(n)] }}>{NOTIF_ICONS[typeOf(n)]??'🔔'}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="notif-title">{n.title}</div>
                          {n.message && <div className="notif-msg">{n.message}</div>}
                        </div>
                        <div className="notif-time">{fmtAgo(n.created_at)}</div>
                      </div>
                    ))}
                  </>
                )}
                {notifOld.length > 0 && (
                  <>
                    {notifNew.length > 0 && <div className="notif-section-label">Earlier</div>}
                    {notifOld.map(n => (
                      <div key={n.id} className="notif-item read">
                        <div className="notif-dot" style={{ background:'transparent', border:'1px solid var(--blue-pale)' }} />
                        <div className="notif-icon" style={{ background:'var(--off-white)' }}>{NOTIF_ICONS[typeOf(n)]??'🔔'}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="notif-title">{n.title}</div>
                          {n.message && <div className="notif-msg">{n.message}</div>}
                        </div>
                        <div className="notif-time">{fmtAgo(n.created_at)}</div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {notifHasMore && (
              <button className="notif-load-more" onClick={() => setNotifShown(s => s + 8)}>
                Show {Math.min(notifFiltered.length - notifShown, 8)} older notifications
              </button>
            )}
          </div>
        )}

        {/* ══ MESSAGES ══ */}
        {tab === 'Messages' && <MessagingPanel />}

      </div>
    </div>
  )
} 