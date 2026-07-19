// src/pages/MyBookings.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth }   from '../context/AuthContext'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const SKY='#0ea5e9', SKY_L='#e0f2fe', SKY_D='#0369a1'
const MINT='#10b981', MINT_L='#d1fae5'
const SLATE='#1e293b', SLATE_M='#64748b', SLATE_L='#94a3b8'
const BORDER='#e2e8f0', BG='#f8fafc', WHITE='#ffffff'

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

const ROOM_EMOJI = {
  'Therapy Room A':     '🛋️',
  'Therapy Room B':     '🪑',
  'The Serenity Room':  '🌿',
  'Mindfulness Studio': '🧘',
  'Conference Room':    '💼',
  'Family Room':        '👨‍👩‍👧',
  'Kids Play Room':     '🧸',
}
function roomEmoji(name) {
  return ROOM_EMOJI[name] || '🏛️'
}

function packageInfo(durationHours) {  if (durationHours >= 8) return { name:'Full Day',    emoji:'☀️',  color:'#d97706', faint:'#fef3c7', grad:'linear-gradient(135deg,#92400e,#d97706,#fbbf24)' }
  if (durationHours >= 4) return { name:'Half-Day',    emoji:'🌤️', color:MINT,      faint:MINT_L,     grad:'linear-gradient(135deg,#059669,#10b981)' }
  return                         { name:'Single Hour', emoji:'⏱️', color:SKY_D,     faint:SKY_L,      grad:'linear-gradient(135deg,#0369a1,#0ea5e9)' }
}

function paymentStatusBadge(paymentStatus, paymentMethod) {
  if (paymentStatus === 'paid')      return { label:'✓ Paid',                                   bg:'#d1fae5', color:'#065f46' }
  if (paymentStatus === 'refunded')  return { label:'↩ Refunded',                                bg:'#f5f3ff', color:'#5b21b6' }
  if (paymentStatus === 'failed')    return { label:'✗ Failed',                                  bg:'#fee2e2', color:'#991b1b' }
  if (paymentMethod)                 return { label:`⏳ ${paymentMethod.toUpperCase()} Pending`, bg:'#fef3c7', color:'#92400e' }
  return                                    { label:'💳 Payment Due',                            bg:'#fee2e2', color:'#991b1b' }
}

const ACTIVE_GLOW_BG = 'linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(209,250,229,0.62) 55%, rgba(255,255,255,0.96) 100%)'

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
  const roomName  = booking.room?.name || 'Room'
  const rEmoji    = roomEmoji(roomName)

  const dateObj  = new Date(`${booking.booked_date}T${booking.start_time}`)
  const dayName  = dateObj.toLocaleDateString('en-US', { weekday:'long' })
  const monthDay = dateObj.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })

  const nowMs    = Date.now()
  const startMs  = new Date(`${booking.booked_date}T${booking.start_time}`).getTime()
  const endMs    = new Date(`${booking.booked_date}T${booking.end_time}`).getTime()
  const isActive = nowMs >= startMs && nowMs < endMs
  const progress = isActive ? Math.min(100, ((nowMs - startMs) / (endMs - startMs)) * 100) : 0

  return (
<div style={{
  background: past ? '#f8fafc' : isActive ? ACTIVE_GLOW_BG : 'linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.8) 100%)',
  backdropFilter: past ? 'none' : 'blur(14px)',
  WebkitBackdropFilter: past ? 'none' : 'blur(14px)',
  borderRadius: 20,
  border: isActive ? '2px solid #10b981' : `1.5px solid ${past?BORDER:pkg.color+'44'}`,
  overflow: 'hidden',
  boxShadow: past ? 'none' : isActive ? '0 0 0 3px rgba(16,185,129,0.16), 0 10px 38px rgba(16,185,129,0.38), inset 0 1px 0 rgba(255,255,255,0.8)' : `0 6px 28px ${pkg.color}18, inset 0 1px 0 rgba(255,255,255,0.55)`,
  opacity: past ? 0.65 : 1,
  marginBottom: '1rem',
  position: 'relative',
  transition: 'all 0.25s',
  animation: isActive ? 'cardGlow 2.2s ease-in-out infinite' : 'none',
}}>      <div style={{ height:isActive?5:4, background:past?BORDER:isActive?'linear-gradient(90deg,#059669,#10b981,#34d399,#10b981,#059669)':pkg.grad, backgroundSize:isActive?'200% 100%':'auto', animation:isActive?'shimmerBar 2.4s linear infinite':'none' }} />
      {isActive && <div style={{ position:'absolute', top:5, left:0, height:5, width:`${progress}%`, background:'rgba(255,255,255,0.7)', transition:'width 1s linear', zIndex:2, boxShadow:'0 0 8px rgba(255,255,255,0.9)' }} />}

      <div style={{ padding:'1.25rem 1.5rem' }}>
        <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start', flexWrap:'wrap' }}>
          <div style={{ flexShrink:0, width:72, minHeight:72, borderRadius:16, background:past?'#f1f5f9':isActive?'#d1fae5':pkg.faint, border:`1.5px solid ${past?BORDER:isActive?'#10b981':pkg.color+'33'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2, boxShadow:isActive?'0 0 16px rgba(16,185,129,0.35)':'none' }}>
<span style={{ fontSize:'1.6rem' }}>{past?rEmoji:pkg.emoji}</span>            <span style={{ fontSize:'0.62rem', fontWeight:800, color:past?SLATE_L:isActive?'#047857':pkg.color, textTransform:'uppercase', letterSpacing:'0.04em', textAlign:'center', lineHeight:1.2, padding:'0 4px' }}>
              {dateObj.toLocaleDateString('en-US',{month:'short'})}<br/><span style={{ fontSize:'1rem', fontWeight:900 }}>{dateObj.getDate()}</span>
            </span>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap', marginBottom:'0.3rem' }}>
<span style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700, color:past?SLATE_M:SLATE }}>{rEmoji} {roomName}</span>              <span style={{ fontSize:'0.68rem', fontWeight:700, background:past?'#f1f5f9':isActive?'#d1fae5':pkg.faint, color:past?SLATE_L:isActive?'#047857':pkg.color, borderRadius:100, padding:'0.15rem 0.6rem', border:`1px solid ${past?BORDER:isActive?'#10b981':pkg.color+'44'}` }}>{pkg.name}</span>
            </div>
            <div style={{ fontSize:'0.8rem', color:SLATE_M, marginBottom:'0.5rem', fontWeight:500 }}>📅 {dayName}, {monthDay}</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', background:past?'#f8fafc':isActive?'#ecfdf5':'#f0f9ff', border:`1px solid ${past?BORDER:isActive?'#6ee7b7':'#bae6fd'}`, borderRadius:10, padding:'0.45rem 0.85rem', marginBottom:'0.65rem' }}>
              <span style={{ fontSize:'0.75rem' }}>🕐</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, color:past?SLATE_M:isActive?'#047857':SKY_D }}>{fmtTime12(booking.start_time)}</span>
              <span style={{ fontSize:'0.7rem', color:SLATE_L, fontWeight:500 }}>→</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', fontWeight:700, color:past?SLATE_M:isActive?'#047857':SKY_D }}>{fmtTime12(booking.end_time)}</span>
              <span style={{ fontSize:'0.68rem', color:SLATE_M, marginLeft:'0.25rem' }}>({Number(booking.duration_hours)}h)</span>
            </div>
            <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:'0.68rem', fontWeight:700, background:booking.status==='confirmed'?'#d1fae5':booking.status==='cancelled'?'#fee2e2':'#fef3c7', color:booking.status==='confirmed'?'#065f46':booking.status==='cancelled'?'#991b1b':'#92400e', borderRadius:100, padding:'0.18rem 0.6rem', textTransform:'uppercase', letterSpacing:'0.07em', border:`1px solid ${booking.status==='confirmed'?'#a7f3d0':booking.status==='cancelled'?'#fca5a5':'#fde68a'}` }}>
                {booking.status==='confirmed'?'✓ Confirmed':booking.status==='cancelled'?'✕ Cancelled':'⏳ Pending'}
              </span>
              <span style={{ fontSize:'0.68rem', fontWeight:700, background:pymtBadge.bg, color:pymtBadge.color, borderRadius:100, padding:'0.18rem 0.6rem' }}>{pymtBadge.label}</span>
              <span style={{ fontSize:'0.68rem', fontWeight:700, background:'#f8fafc', color:'#334155', borderRadius:100, padding:'0.18rem 0.6rem', border:'1px solid #e2e8f0' }}>NPR {Number(booking.total_amount).toLocaleString()}</span>
            </div>
            {booking.notes && <div style={{ marginTop:'0.6rem', fontSize:'0.78rem', color:SLATE_M, fontStyle:'italic', lineHeight:1.5, borderTop:'1px solid #f1f5f9', paddingTop:'0.5rem' }}>📝 {booking.notes}</div>}
          </div>
          <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.5rem' }}>
            {past ? (
              <div style={{ background:'#f1f5f9', border:'1px solid #e2e8f0', borderRadius:12, padding:'0.5rem 0.85rem', textAlign:'center' }}>
                <div style={{ fontSize:'0.62rem', fontWeight:700, color:SLATE_L, textTransform:'uppercase', letterSpacing:'0.06em' }}>Past</div>
                <div style={{ fontSize:'0.9rem', fontWeight:700, color:SLATE_M }}>Done</div>
              </div>
            ) : isActive ? (
              <div style={{ background:'linear-gradient(135deg,#059669,#10b981,#34d399)', borderRadius:12, padding:'0.55rem 0.95rem', textAlign:'center', boxShadow:'0 0 0 3px rgba(16,185,129,0.18), 0 6px 22px rgba(16,185,129,0.55)', animation:'pulse 2s ease-in-out infinite' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, fontSize:'0.62rem', fontWeight:800, color:'#fff', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#fff', boxShadow:'0 0 6px #fff', display:'inline-block' }}/>
                  LIVE
                </div>
                <div style={{ fontSize:'0.86rem', fontWeight:800, color:'#fff' }}>In Session</div>
              </div>
            ) : countdown ? (
              <div style={{ background:countdown.urgency==='imminent'?'linear-gradient(135deg,#ef4444,#f87171)':countdown.urgency==='soon'?'linear-gradient(135deg,#f59e0b,#fbbf24)':pkg.grad, borderRadius:12, padding:'0.5rem 0.85rem', textAlign:'center', boxShadow:`0 4px 14px ${pkg.color}33` }}>
                <div style={{ fontSize:'0.58rem', fontWeight:800, color:'rgba(255,255,255,0.82)', textTransform:'uppercase', letterSpacing:'0.07em' }}>In</div>
                <div style={{ fontSize:'0.92rem', fontWeight:800, color:'#fff', whiteSpace:'nowrap' }}>{countdown.label}</div>
              </div>
            ) : null}
          </div>
        </div>
        {isActive && (
          <div style={{ marginTop:'0.85rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.3rem' }}>
              <span style={{ fontSize:'0.68rem', color:'#047857', fontWeight:800 }}>Session in progress</span>
              <span style={{ fontSize:'0.68rem', color:'#047857', fontWeight:800 }}>{Math.round(progress)}%</span>
            </div>
            <div style={{ height:7, background:'#a7f3d0', borderRadius:99, overflow:'hidden', boxShadow:'inset 0 1px 3px rgba(5,150,105,0.25)' }}>
              <div style={{ height:'100%', background:'linear-gradient(90deg,#059669,#10b981,#34d399)', width:`${progress}%`, borderRadius:99, transition:'width 1s linear', boxShadow:'0 0 10px rgba(16,185,129,0.8)' }} />
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse{0%,100%{box-shadow:0 0 0 3px rgba(16,185,129,0.18), 0 6px 22px rgba(16,185,129,0.55);}50%{box-shadow:0 0 0 5px rgba(16,185,129,0.3), 0 8px 30px rgba(16,185,129,0.75);}}
        @keyframes cardGlow{0%,100%{box-shadow:0 0 0 3px rgba(16,185,129,0.16), 0 10px 38px rgba(16,185,129,0.38), inset 0 1px 0 rgba(255,255,255,0.8);}50%{box-shadow:0 0 0 5px rgba(16,185,129,0.26), 0 14px 48px rgba(16,185,129,0.55), inset 0 1px 0 rgba(255,255,255,0.9);}}
        @keyframes shimmerBar{0%{background-position:200% 0}100%{background-position:-200% 0}}
      `}</style>
    </div>
  )
}

export default function MyBookings() {
  const { navigate } = useRouter()
  const { user }      = useAuth()

  const [bookings,        setBookings]        = useState([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')
  const [showPast,        setShowPast]        = useState(false)
  const [nowTick,         setNowTick]         = useState(() => Date.now())

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    load()
  }, [user])

  // Re-check every few seconds so a booking flips from "Upcoming" to "Past"
  // the moment its end time elapses, without needing a page refresh.
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 5000)
    return () => clearInterval(id)
  }, [])

  async function load() {
    setLoading(true); setError('')
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) { setError('Please sign in to view your bookings.'); return }
      const res  = await fetch(`${API_BASE}/room-bookings/my`, { headers: { Authorization:`Bearer ${token}` } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Could not load bookings')
      setBookings(data.bookings || [])
    } catch (e) {
      setError(e.message || 'Could not load your bookings.')
    } finally {
      setLoading(false)
    }
  }

  const isElapsed = b => new Date(`${b.booked_date}T${b.end_time}`).getTime() <= nowTick
  const upcoming = bookings
    .filter(b => b.status !== 'cancelled' && !isElapsed(b))
    .sort((a,b) => a.booked_date.localeCompare(b.booked_date) || a.start_time.localeCompare(b.start_time))
  const past = bookings
    .filter(b => b.status === 'cancelled' || isElapsed(b))
    .sort((a,b) => b.booked_date.localeCompare(a.booked_date) || b.start_time.localeCompare(a.start_time))

  return (
    <div className="page-wrapper" style={{ background:BG, minHeight:'100vh' }}>

   <div style={{
        position:'relative', overflow:'hidden',
        background:'linear-gradient(160deg, rgba(255,255,255,0.9) 0%, rgba(214,238,252,0.7) 55%, rgba(255,255,255,0.88) 100%)',
        backdropFilter:'blur(18px)', WebkitBackdropFilter:'blur(18px)',
        borderBottom:'1px solid rgba(120,190,230,0.4)',
        boxShadow:'0 4px 22px rgba(14,165,233,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
        padding:'clamp(1.75rem,4vw,2.5rem) clamp(1rem,4vw,2rem)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        flexWrap:'wrap', gap:'1rem',
      }}>
        <div style={{ position:'absolute', width:260, height:260, borderRadius:'50%', background:'rgba(14,165,233,0.12)', filter:'blur(40px)', top:-120, right:'8%', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:'rgba(125,211,252,0.2)', filter:'blur(36px)', bottom:-90, left:'12%', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ width:52, height:52, borderRadius:14, background:'rgba(14,165,233,0.10)', border:'1px solid rgba(14,165,233,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0, backdropFilter:'blur(6px)' }}>🏛️</div>
          <div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.3rem,4vw,1.9rem)', color:'#0f3a52', margin:0 }}>My Bookings</h1>
<p style={{ fontFamily:'inherit', fontSize:'0.82rem', color:'#5a7c8f', margin:'0.2rem 0 0' }}>Your room reservations, all in one place</p>          </div>
        </div>

        <div style={{ position:'relative', zIndex:1, display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
       <button onClick={() => navigate('/ashram', { scrollTo: 'bottom' })} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1.1rem', borderRadius:12, border:'1.5px solid rgba(14,165,233,0.3)', background:'rgba(255,255,255,0.5)', backdropFilter:'blur(6px)', fontSize:'0.85rem', fontWeight:600, color:'#0369a1', cursor:'pointer', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.85)' }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.5)' }}>
            ← Book a Room
          </button>
          <button onClick={() => navigate('/ashram', { scrollTo: 'bottom' })} style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.6rem 1.1rem', borderRadius:12, border:'none', background:'linear-gradient(135deg,#0ea5e9,#7dd3fc)', fontSize:'0.85rem', fontWeight:700, color:'#fff', cursor:'pointer', boxShadow:'0 4px 16px rgba(14,165,233,0.35)' }}>
            + New Booking
          </button>
        </div>
      </div>

      <div style={{ maxWidth:900, margin:'0 auto', padding:'clamp(1.5rem,4vw,2.5rem) clamp(1rem,4vw,2rem)' }}>

        {loading ? (
          <div style={{ background:WHITE, borderRadius:18, border:`1px solid ${BORDER}`, padding:'3rem', textAlign:'center' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'0.6rem', color:SLATE_L, fontSize:'0.88rem' }}>
              <span style={{ display:'inline-block', width:18, height:18, border:`2.5px solid ${SKY_L}`, borderTopColor:SKY, borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
              Loading your bookings…
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : error ? (
          <div style={{ background:'#fef2f2', border:'1.5px solid #fca5a5', borderRadius:18, padding:'2rem', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>⚠️</div>
            <p style={{ color:'#991b1b', fontSize:'0.88rem', fontWeight:600, marginBottom:'1rem' }}>{error}</p>
            <button onClick={load} style={{ padding:'0.6rem 1.5rem', borderRadius:10, border:'none', background:SKY_D, color:WHITE, fontWeight:700, cursor:'pointer' }}>Try Again</button>
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ background:'linear-gradient(135deg,#f0f9ff,#ecfdf5)', borderRadius:20, border:'1.5px dashed #bae6fd', padding:'3rem 2rem', textAlign:'center' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🏛️</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:SLATE, marginBottom:'0.5rem' }}>No bookings yet</div>
            <p style={{ fontSize:'0.88rem', color:SLATE_M, maxWidth:360, margin:'0 auto 1.5rem', lineHeight:1.65 }}>
Reserve one of our private rooms — from 1:1 therapy spaces to sound-proofed group and wellness rooms.            </p>
            <button onClick={() => navigate('/ashram', { scrollTo: 'bottom' })} style={{ padding:'0.85rem 2.25rem', borderRadius:14, border:'none', background:'linear-gradient(135deg,#0369a1,#0ea5e9)', color:WHITE, fontFamily:'inherit', fontWeight:700, fontSize:'0.92rem', cursor:'pointer', boxShadow:'0 6px 22px rgba(14,165,233,0.35)' }}>
              Explore &amp; Book →
            </button>
          </div>
        ) : (
          <>
            {upcoming.length > 0 ? (
              <div style={{ marginBottom:'2rem' }}>
                <div style={{ fontSize:'0.7rem', fontWeight:800, color:SLATE_L, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'1rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', display:'inline-block' }}/>
                  Upcoming · {upcoming.length} booking{upcoming.length !== 1 ? 's' : ''}
                </div>
                {upcoming.map((b,i) => <SerenityBookingCard key={b.id||i} booking={b} />)}
              </div>
            ) : (
              <div style={{ background:WHITE, borderRadius:16, border:`1px solid ${BORDER}`, padding:'2rem', textAlign:'center', marginBottom:'2rem' }}>
                <p style={{ color:SLATE_M, fontSize:'0.88rem', marginBottom:'1rem' }}>No upcoming bookings right now.</p>
                <button onClick={() => navigate('/ashram', { scrollTo: 'bottom' })} style={{ padding:'0.65rem 1.5rem', borderRadius:10, border:'none', background:'linear-gradient(135deg,#0369a1,#0ea5e9)', color:WHITE, fontWeight:700, cursor:'pointer' }}>+ Book a Room</button>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <button onClick={() => setShowPast(v => !v)} style={{
                  display:'flex', alignItems:'center', gap:'0.6rem', width:'100%',
                  background:WHITE, border:`1px solid ${BORDER}`, borderRadius:14,
                  cursor:'pointer', fontSize:'0.85rem', fontWeight:700, color:SLATE,
                  padding:'0.9rem 1.1rem', marginBottom: showPast ? '0.85rem' : 0,
                  fontFamily:'inherit', transition:'all 0.15s',
                }}>
                  <span style={{
                    display:'inline-flex', width:24, height:24, borderRadius:8,
                    background:'#f1f5f9', border:`1px solid ${BORDER}`,
                    alignItems:'center', justifyContent:'center', fontSize:'0.7rem',
                    transition:'transform 0.2s', transform: showPast ? 'rotate(90deg)' : 'none', flexShrink:0,
                  }}>▶</span>
                  Past Bookings ({past.length})
                  <span style={{ marginLeft:'auto', fontSize:'0.7rem', color:SLATE_L, fontWeight:500 }}>
                    {showPast ? 'Hide' : 'Show'}
                  </span>
                </button>
                {showPast && past.map((b,i) => <SerenityBookingCard key={b.id||i} booking={b} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}