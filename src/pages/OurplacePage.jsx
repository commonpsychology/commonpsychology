// src/pages/OurplacePage.jsx
// Payment fully centralized — usePayment() replaces inline payment screens.
// On success: room booking + payment saved in DB, linked by booking_id.
// Admin fetches /admin/payments?category=room_booking  OR  /admin/bookings
// ✅ NEW: Fetches real availability, shows booked slots visually, warns on conflict

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter }  from '../context/RouterContext'
import { usePayment } from '../components/PaymentModal'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const SKY   ='#0ea5e9', SKY_L='#e0f2fe', SKY_D='#0369a1'
const MINT  ='#10b981', MINT_L='#d1fae5'
const SLATE ='#1e293b', SLATE_M='#64748b', SLATE_L='#94a3b8'
const BORDER='#e2e8f0', BG='#f8fafc', WHITE='#ffffff'
const GOLD  ='#d97706', GOLD_L='#fef3c7'
const RED   ='#ef4444', RED_L='#fef2f2', RED_D='#991b1b'
const AMBER ='#f59e0b', AMBER_L='#fffbeb'
const btnGrad  = `linear-gradient(135deg,${SKY_D} 0%,${SKY} 100%)`
const goldGrad = `linear-gradient(135deg,#92400e 0%,${GOLD} 60%,#fbbf24 100%)`

const DEFAULT_ROOM_NAME = 'Therapy Room A'


function MyBookingsSidebar({ apiBase }) {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) { setLoading(false); return }
    fetch(`${apiBase}/room-bookings/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setBookings(d.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [apiBase])

  const upcoming = bookings
    .filter(b => b.booked_date >= new Date().toISOString().split('T')[0])
    .sort((a, b) => a.booked_date.localeCompare(b.booked_date))
    .slice(0, 5)

  return (
    <div style={{
      position: 'sticky', top: 80, width: 260, flexShrink: 0, alignSelf: 'flex-start',
      background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 16,
      overflow: 'hidden', boxShadow: '0 4px 20px rgba(14,165,233,0.07)'
    }}>
      <div style={{ padding: '0.85rem 1.1rem', background: `linear-gradient(135deg,${SKY_L},${MINT_L})`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontFamily: 'inherit', fontSize: '0.68rem', fontWeight: 800, color: SLATE_L, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>Your Bookings</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', color: SLATE }}>Upcoming Sessions</div>
      </div>

      <div style={{ padding: '0.75rem' }}>
        {loading ? (
          <div style={{ padding: '1.25rem 0.5rem', textAlign: 'center', fontSize: '0.78rem', color: SLATE_L }}>Loading…</div>
        ) : upcoming.length === 0 ? (
          <div style={{ padding: '1.5rem 0.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📅</div>
            <div style={{ fontSize: '0.78rem', color: SLATE_L, lineHeight: 1.5 }}>No upcoming bookings yet.</div>
          </div>
        ) : upcoming.map((b, i) => {
          const pkg = PACKAGES.find(p => p.id === b.package_id) || PACKAGES[0]
          const isPast = b.booked_date < new Date().toISOString().split('T')[0]
          return (
            <div key={b.id || i} style={{
              padding: '0.75rem 0.85rem', borderRadius: 12, marginBottom: '0.5rem',
              background: BG, border: `1.5px solid ${isPast ? BORDER : pkg.color + '44'}`,
              borderLeft: `4px solid ${pkg.color}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.9rem' }}>{pkg.emoji}</span>
                <span style={{ fontFamily: 'inherit', fontSize: '0.78rem', fontWeight: 700, color: SLATE }}>{pkg.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.62rem', fontWeight: 700, background: pkg.faint, color: pkg.color, padding: '0.1rem 0.45rem', borderRadius: 100 }}>
                  {b.status === 'confirmed' ? '✓ Confirmed' : b.status === 'pending' ? 'Pending' : b.status}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: SKY_D, fontWeight: 600, marginBottom: '0.2rem' }}>
                📅 {b.booked_date}
              </div>
              <div style={{ fontSize: '0.73rem', color: SLATE_M }}>
                🕐 {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
              </div>
              {b.notes && (
                <div style={{ marginTop: '0.35rem', fontSize: '0.68rem', color: SLATE_L, fontStyle: 'italic', borderTop: `1px solid ${BORDER}`, paddingTop: '0.3rem' }}>
                  {b.notes.length > 60 ? b.notes.slice(0, 60) + '…' : b.notes}
                </div>
              )}
            </div>
          )
        })}

        {!loading && bookings.length > 5 && (
          <div style={{ textAlign: 'center', fontSize: '0.72rem', color: SLATE_L, paddingTop: '0.25rem' }}>
            +{bookings.length - 5} more in your portal
          </div>
        )}
      </div>
    </div>
  )
}

// ── Generate time slots from 07:00 to 20:00 in 30-min increments ─────────────
function generateTimeSlots() {
  const slots = []
  for (let h = 7; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 20 && m > 0) break
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    }
  }
  return slots
}
const ALL_SLOTS = generateTimeSlots()

// Is a slot overlapping with any booked range?
function isSlotBooked(slotTime, bookedSlots) {
  return bookedSlots.some(b => slotTime >= b.start && slotTime < b.end)
}

// Is the selected start time conflicting with package duration?
function hasConflict(startTime, durationHours, bookedSlots) {
  if (!startTime || !durationHours) return false
  const endTime = addHours(startTime, durationHours)
  return bookedSlots.some(b => startTime < b.end && endTime > b.start)
}

// Format "HH:MM" → "h:MM AM/PM"
function fmtTime(t) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h % 12 || 12
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`
}

const PLACE = {
  name:    'The Serenity Room',
  tagline: 'A calm, private space for healing, reflection & community.',
  caption: 'Our in-house wellness space in the heart of Lazimpat, Kathmandu',
  description: `The Serenity Room is PsycheCare Nepal's dedicated in-house venue — a thoughtfully designed, fully sound-proofed space built for therapeutic group sessions, private one-on-ones, mindfulness workshops, and small community gatherings focused on mental wellbeing.\n\nBathed in natural light with living-wall greenery, adjustable ambient lighting, and noise-cancelling panels, every detail was chosen to lower cortisol and invite openness. Whether you're a facilitator running a DBT skills group, a couple attending mediation, or an individual who simply needs a neutral, safe environment away from home or office — The Serenity Room is for you.\n\nThe space seats up to 12 in a circle arrangement and can be reconfigured for presentations, yoga, or bilateral movement therapy. A private anteroom with tea station, writing desk, and charging points is included with every booking.`,
  amenities: [
    { icon:'🔇', label:'Sound-proofed walls' },{ icon:'🌿', label:'Living wall greenery' },
    { icon:'💡', label:'Adjustable ambient lighting' },{ icon:'🛋️', label:'Therapeutic-grade furniture' },
    { icon:'📶', label:'High-speed private Wi-Fi' },{ icon:'☕', label:'Tea & water station' },
    { icon:'🖥️', label:'65" display screen' },{ icon:'♿', label:'Fully accessible' },
  ],
  images: [
    { src:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80', thumb:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=70', alt:'The Serenity Room — main circle space', label:'Main Room' },
    { src:'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1400&q=80', thumb:'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=200&q=70', alt:'Natural light & living wall', label:'Natural Light' },
    { src:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1400&q=80', thumb:'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=200&q=70', alt:'Mindfulness & meditation corner', label:'Meditation Corner' },
    { src:'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80', thumb:'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=200&q=70', alt:'Group session space', label:'Group Space' },
    { src:'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1400&q=80', thumb:'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=200&q=70', alt:'Wellness & yoga area', label:'Wellness Area' },
    { src:'https://images.unsplash.com/photo-1552508744-1696d4464960?auto=format&fit=crop&w=1400&q=80', thumb:'https://images.unsplash.com/photo-1552508744-1696d4464960?auto=format&fit=crop&w=200&q=70', alt:'Tea station & anteroom', label:'Anteroom & Tea' },
  ],
}

const PACKAGES = [
  {
    id:'hour',    name:'Single Hour', emoji:'⏱️', price:1500, period:'per hour',
    durationHours: 1,
    color:SKY_D, faint:SKY_L, grad:btnGrad,
    features:[{label:'1 hour room access',on:true},{label:'Up to 6 people',on:true},{label:'Tea & water included',on:true},{label:'Basic A/V setup',on:true},{label:'Anteroom access',on:false},{label:'Extended seating (12 seats)',on:false},{label:'Facilitator whiteboard kit',on:false},{label:'Recording (audio only)',on:false}]
  },
  {
    id:'halfday', name:'Half-Day',    emoji:'🌤️', price:4500, period:'4 hours',
    durationHours: 4,
    color:MINT,  faint:MINT_L, grad:`linear-gradient(135deg,#059669 0%,${MINT} 100%)`, popular:true,
    features:[{label:'1 hour room access',on:true},{label:'Up to 6 people',on:true},{label:'Tea & water included',on:true},{label:'Basic A/V setup',on:true},{label:'Anteroom access',on:true},{label:'Extended seating (12 seats)',on:true},{label:'Facilitator whiteboard kit',on:false},{label:'Recording (audio only)',on:false}]
  },
  {
    id:'fullday', name:'Full Day',    emoji:'☀️', price:7500, period:'8 hours',
    durationHours: 8,
    color:GOLD,  faint:GOLD_L, grad:goldGrad,
    features:[{label:'1 hour room access',on:true},{label:'Up to 6 people',on:true},{label:'Tea & water included',on:true},{label:'Basic A/V setup',on:true},{label:'Anteroom access',on:true},{label:'Extended seating (12 seats)',on:true},{label:'Facilitator whiteboard kit',on:true},{label:'Recording (audio only)',on:true}]
  },
]

function addHours(timeStr, hours) {
  const [h, m] = timeStr.split(':').map(Number)
  const totalMin = h * 60 + m + Math.round(hours * 60)
  const nh = Math.floor(totalMin / 60) % 24
  const nm = totalMin % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FocusInput({ type, value, onChange, placeholder, min }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type || 'text'} value={value} onChange={onChange}
      placeholder={placeholder} min={min}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width:'100%', padding:'0.72rem 1rem',
        border:`1.5px solid ${focused ? SKY : BORDER}`, borderRadius:12,
        fontFamily:'inherit', fontSize:'0.88rem', color:SLATE,
        background:focused ? '#f0f9ff' : BG, outline:'none',
        boxSizing:'border-box', boxShadow:focused ? `0 0 0 3px ${SKY_L}` : 'none',
        transition:'all 0.2s',
      }}
    />
  )
}

function FocusTextarea({ value, onChange, placeholder, rows }) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows || 3}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width:'100%', padding:'0.72rem 1rem',
        border:`1.5px solid ${focused ? SKY : BORDER}`, borderRadius:12,
        fontFamily:'inherit', fontSize:'0.88rem', color:SLATE,
        background:focused ? '#f0f9ff' : BG, outline:'none',
        boxSizing:'border-box', boxShadow:focused ? `0 0 0 3px ${SKY_L}` : 'none',
        transition:'all 0.2s', resize:'vertical',
      }}
    />
  )
}

function PlaceholderImg({ label, style }) {
  return (
    <div style={{ ...style, background:`linear-gradient(145deg,#0c4a6e 0%,${SKY_D} 45%,#0891b2 75%,#0d9488 100%)`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'0.75rem', position:'relative', overflow:'hidden' }}>
      <div style={{ display:'flex', gap:'0.5rem', fontSize:'2rem', opacity:0.7 }}>🌿 🛋️ 🕯️</div>
      <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'1rem', fontWeight:700 }}>The Serenity Room</div>
      <div style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.72rem', textAlign:'center', maxWidth:200, lineHeight:1.5 }}>{label}</div>
    </div>
  )
}

function Lightbox({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx)
  const [imgErr, setImgErr] = useState({})
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [images.length, onClose])
  const img = images[idx]
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.92)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{ position:'relative', maxWidth:'90vw', maxHeight:'85vh', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.75rem' }}>
        <button onClick={onClose} style={{ position:'absolute', top:-44, right:0, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', color:WHITE, borderRadius:'50%', width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'1.1rem', fontFamily:'inherit' }}>✕</button>
        <div style={{ borderRadius:16, overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.6)', maxHeight:'72vh', position:'relative' }}>
          {imgErr[idx]
            ? <PlaceholderImg label={img.alt} style={{ width:'70vw', maxWidth:800, height:'50vh', borderRadius:16 }}/>
            : <img src={img.src} alt={img.alt} onError={() => setImgErr(e => ({ ...e, [idx]:true }))} style={{ display:'block', maxWidth:'80vw', maxHeight:'72vh', objectFit:'cover', borderRadius:16 }}/>
          }
          {images.length > 1 && (<>
            <button onClick={() => setIdx(i => (i - 1 + images.length) % images.length)} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.5)', border:'none', color:WHITE, borderRadius:'50%', width:40, height:40, cursor:'pointer', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(6px)' }}>‹</button>
            <button onClick={() => setIdx(i => (i + 1) % images.length)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'rgba(0,0,0,0.5)', border:'none', color:WHITE, borderRadius:'50%', width:40, height:40, cursor:'pointer', fontSize:'1.1rem', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(6px)' }}>›</button>
          </>)}
        </div>
        <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', justifyContent:'center' }}>
          {images.map((im, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{ width:52, height:36, borderRadius:7, overflow:'hidden', padding:0, border:`2px solid ${i === idx ? SKY : 'rgba(255,255,255,0.2)'}`, cursor:'pointer', opacity:i === idx ? 1 : 0.55, transition:'all 0.2s', flexShrink:0 }}>
              <img src={im.thumb} alt={im.alt} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} onError={e => { e.target.style.display='none'; e.target.parentElement.style.background=SKY_D }}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Availability Timeline ─────────────────────────────────────────────────────
function AvailabilityTimeline({ bookedSlots, selectedStart, selectedEnd, durationHours, loading }) {
  if (loading) return (
    <div style={{ padding:'1rem', background:BG, borderRadius:12, border:`1px solid ${BORDER}`, textAlign:'center' }}>
      <div style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', color:SLATE_L, fontSize:'0.8rem' }}>
        <span style={{ display:'inline-block', width:14, height:14, border:`2px solid ${SKY_L}`, borderTopColor:SKY, borderRadius:'50%', animation:'spin 0.7s linear infinite' }}/>
        Loading availability…
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // Build 30-min visual blocks from 07:00–20:00
  const blocks = ALL_SLOTS.map(slot => {
    const booked   = isSlotBooked(slot, bookedSlots)
    const inSelect = selectedStart && selectedEnd && slot >= selectedStart && slot < selectedEnd
    const conflict = inSelect && booked
    return { slot, booked, inSelect, conflict }
  })

  const hasBusy = bookedSlots.length > 0

  return (
    <div style={{ background:BG, borderRadius:14, border:`1px solid ${BORDER}`, padding:'1rem 1.1rem', marginBottom:'0.85rem' }}>
      {/* Legend */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.7rem', flexWrap:'wrap', gap:'0.4rem' }}>
        <span style={{ fontFamily:'inherit', fontSize:'0.67rem', fontWeight:800, color:SLATE_L, textTransform:'uppercase', letterSpacing:'0.08em' }}>
          Today's Availability
        </span>
        <div style={{ display:'flex', gap:'0.85rem', flexWrap:'wrap' }}>
          {[
            { color:MINT,  label:'Available' },
            { color:RED,   label:'Booked' },
            { color:SKY,   label:'Your selection' },
            { color:AMBER, label:'Conflict ⚠️' },
          ].map(l => (
            <div key={l.label} style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
              <div style={{ width:10, height:10, borderRadius:3, background:l.color, flexShrink:0 }}/>
              <span style={{ fontFamily:'inherit', fontSize:'0.67rem', color:SLATE_M }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline grid */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'2px' }}>
        {blocks.map(({ slot, booked, inSelect, conflict }) => {
          let bg = MINT_L, border = `1px solid #a7f3d0`, title = `${fmtTime(slot)} — Available`
          if (booked && !inSelect) {
            bg = RED_L; border = `1px solid #fca5a5`; title = `${fmtTime(slot)} — Already Booked`
          }
          if (inSelect && !conflict) {
            bg = SKY_L; border = `1px solid ${SKY}`; title = `${fmtTime(slot)} — Your selection`
          }
          if (conflict) {
            bg = AMBER_L; border = `1px solid ${AMBER}`; title = `${fmtTime(slot)} — ⚠️ Conflict!`
          }

          const isHour = slot.endsWith(':00')
          return (
            <div
              key={slot}
              title={title}
              style={{
                position:'relative',
                width: isHour ? 'calc(6.25% - 2px)' : 'calc(6.25% - 2px)',
                minWidth:28, height:28,
                background: bg, border, borderRadius:5,
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor:'default', flexShrink:0,
                transition:'all 0.15s',
              }}
            >
              {isHour && (
                <span style={{ fontFamily:'inherit', fontSize:'0.52rem', fontWeight:700, color: booked ? RED_D : conflict ? '#92400e' : SKY_D, lineHeight:1 }}>
                  {Number(slot.split(':')[0]) % 12 || 12}{Number(slot.split(':')[0]) >= 12 ? 'p' : 'a'}
                </span>
              )}
              {conflict && (
                <span style={{ position:'absolute', top:-1, right:-1, fontSize:'0.5rem', lineHeight:1 }}>⚠️</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Booked slots list */}
      {hasBusy && (
        <div style={{ marginTop:'0.75rem', display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
          {bookedSlots.map((b, i) => (
            <div key={i} style={{ display:'inline-flex', alignItems:'center', gap:'0.35rem', background:RED_L, border:`1px solid #fca5a5`, borderRadius:100, padding:'0.2rem 0.65rem' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:RED, flexShrink:0, display:'inline-block' }}/>
              <span style={{ fontFamily:'inherit', fontSize:'0.7rem', color:RED_D, fontWeight:600 }}>
                {fmtTime(b.start)} – {fmtTime(b.end)}
              </span>
            </div>
          ))}
        </div>
      )}

      {!hasBusy && (
        <div style={{ marginTop:'0.6rem', fontSize:'0.75rem', color:SLATE_L, fontStyle:'italic' }}>
          ✅ No bookings yet on this date — all slots available.
        </div>
      )}
    </div>
  )
}

// ── Time Picker with booked-slot awareness ────────────────────────────────────
// Uses position:fixed so the dropdown escapes any overflow:hidden/scroll parent
function SmartTimePicker({ value, onChange, bookedSlots, durationHours, label }) {
  const [open,    setOpen]    = useState(false)
  const [dropPos, setDropPos] = useState({ top:0, left:0, width:200 })
  const btnRef  = useRef(null)
  const dropRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function calcPos() {
      if (!btnRef.current) return
      const r          = btnRef.current.getBoundingClientRect()
      const dropH      = 268
      const spaceBelow = window.innerHeight - r.bottom
      const top        = spaceBelow >= dropH + 8 ? r.bottom + 4 : r.top - dropH - 4
      setDropPos({ top, left: r.left, width: r.width })
    }
    calcPos()
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open])

  useEffect(() => {
    function onDown(e) {
      if (
        btnRef.current  && !btnRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  return (
    <div style={{ position:'relative' }}>
      <label style={{ display:'block', fontFamily:'inherit', fontSize:'0.68rem', fontWeight:800, color:SLATE_L, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.35rem' }}>{label}</label>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width:'100%', padding:'0.72rem 1rem',
          border:`1.5px solid ${open ? SKY : BORDER}`, borderRadius:12,
          fontFamily:'inherit', fontSize:'0.88rem',
          color: value ? SLATE : SLATE_L,
          background: open ? '#f0f9ff' : BG, outline:'none',
          boxSizing:'border-box', boxShadow: open ? `0 0 0 3px ${SKY_L}` : 'none',
          transition:'all 0.2s', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          textAlign:'left',
        }}
      >
        <span>{value ? fmtTime(value) : 'Select start time…'}</span>
        <span style={{ fontSize:'0.7rem', color:SLATE_L }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div
          ref={dropRef}
          style={{
            position:'fixed',
            top:   dropPos.top,
            left:  dropPos.left,
            width: dropPos.width,
            background: WHITE,
            border: `1.5px solid ${BORDER}`,
            borderRadius: 14,
            zIndex: 99999,
            boxShadow: '0 16px 48px rgba(14,165,233,0.2), 0 2px 8px rgba(0,0,0,0.1)',
            maxHeight: 260,
            overflowY: 'auto',
            scrollbarWidth: 'thin',
          }}
        >
          <div style={{ padding:'0.5rem 0.6rem', borderBottom:`1px solid ${BORDER}`, fontSize:'0.65rem', fontWeight:700, color:SLATE_L, textTransform:'uppercase', letterSpacing:'0.08em', position:'sticky', top:0, background:WHITE, zIndex:1 }}>
            Select start time
          </div>
          {ALL_SLOTS.map(slot => {
            const slotBooked = isSlotBooked(slot, bookedSlots)
            const endIfSelected = addHours(slot, durationHours || 1)
            const wouldConflict = durationHours
              ? hasConflict(slot, durationHours, bookedSlots)
              : slotBooked
            const isSelected = value === slot

            let bg = WHITE, color = SLATE, borderLeft = '3px solid transparent'
            let statusIcon = null, statusTip = ''

            if (slotBooked) {
              bg = RED_L; color = '#b91c1c'; borderLeft = `3px solid ${RED}`
              statusIcon = '🚫'; statusTip = 'This slot is booked'
            } else if (wouldConflict) {
              bg = AMBER_L; color = '#92400e'; borderLeft = `3px solid ${AMBER}`
              statusIcon = '⚠️'; statusTip = `${durationHours}h session would overlap a booking`
            } else {
              statusIcon = '✓'; statusTip = 'Available'
            }

            if (isSelected) {
              borderLeft = `3px solid ${SKY}`
              bg = SKY_L; color = SKY_D
            }

            return (
              <div
                key={slot}
                onClick={() => { if (!slotBooked) { onChange(slot); setOpen(false) } }}
                title={statusTip}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'0.55rem 0.85rem',
                  background: bg, color,
                  borderLeft,
                  cursor: slotBooked ? 'not-allowed' : 'pointer',
                  fontFamily:'inherit', fontSize:'0.84rem', fontWeight: isSelected ? 700 : 400,
                  transition:'background 0.1s',
                }}
                onMouseEnter={e => { if (!slotBooked && !isSelected) e.currentTarget.style.background = SKY_L }}
                onMouseLeave={e => { if (!slotBooked && !isSelected) e.currentTarget.style.background = bg }}
              >
                <span>{fmtTime(slot)}</span>
                <span style={{ display:'flex', alignItems:'center', gap:'0.4rem', fontSize:'0.73rem' }}>
                  {wouldConflict && !slotBooked && durationHours && (
                    <span style={{ fontSize:'0.68rem', color:'#92400e' }}>ends {fmtTime(endIfSelected)} overlaps</span>
                  )}
                  <span style={{ opacity:0.7 }}>{statusIcon}</span>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── API ───────────────────────────────────────────────────────────────────────
async function saveRoomBooking({ roomId, bookedDate, startTime, endTime, notes, paymentMethod }) {
  const token = localStorage.getItem('accessToken')
  const res = await fetch(`${API_BASE}/room-bookings`, {
    method:  'POST',
    headers: { 'Content-Type':'application/json', ...(token ? { Authorization:`Bearer ${token}` } : {}) },
    body: JSON.stringify({ roomId, bookedDate, startTime, endTime, notes:notes||null, paymentMethod:paymentMethod||null }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || `Booking failed (${res.status})`)
  return data.booking?.id || data.id || null
}

// ─────────────────────────────────────────────────────────────────────────────
export default function OurPlacePage() {
  const { navigate }    = useRouter()
  const { openPayment } = usePayment()

  const [screen,      setScreen]      = useState('place')
  const [selPkg,      setSelPkg]      = useState(null)
  const [imgIdx,      setImgIdx]      = useState(0)
  const [imgErr,      setImgErr]      = useState({})
  const [lightbox,    setLightbox]    = useState(null)
  const [bookDate,    setBookDate]    = useState('')
  const [bookTime,    setBookTime]    = useState('')
  const [clientName,  setClientName]  = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [notes,       setNotes]       = useState('')
  const [doneData,    setDoneData]    = useState(null)
  const [bookErr,     setBookErr]     = useState('')
  const [roomId,      setRoomId]      = useState(null)

  // ── Availability state ──────────────────────────────────────────────────
  const [bookedSlots,   setBookedSlots]   = useState([])  // [{start,end}]
  const [availLoading,  setAvailLoading]  = useState(false)
  const [availErr,      setAvailErr]      = useState('')
  const [availFetched,  setAvailFetched]  = useState('')  // last fetched date+roomId

  const bookEl = useRef(null)
  const payEl  = useRef(null)

  // Auto-slide hero
  useEffect(() => {
    const id = setInterval(() => setImgIdx(i => (i + 1) % PLACE.images.length), 5000)
    return () => clearInterval(id)
  }, [])

  // Resolve room UUID
  useEffect(() => {
    fetch(`${API_BASE}/room-bookings/rooms`)
      .then(r => r.json())
      .then(data => {
        const rooms = data.rooms || []
        const room  = rooms.find(r => r.name === DEFAULT_ROOM_NAME) || rooms[0]
        if (room) setRoomId(room.id)
      })
      .catch(() => {})
  }, [])

  // ── Fetch availability whenever date or roomId changes ──────────────────
  const fetchAvailability = useCallback(async (date, rid) => {
    if (!date || !rid) return
    const key = `${date}__${rid}`
    if (availFetched === key) return  // already fetched
    setAvailLoading(true)
    setAvailErr('')
    try {
      const res  = await fetch(`${API_BASE}/room-bookings/availability?roomId=${rid}&date=${date}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load availability')
      setBookedSlots(data.bookedSlots || [])
      setAvailFetched(key)
    } catch (e) {
      setAvailErr('Could not load availability. Please proceed carefully.')
    } finally {
      setAvailLoading(false)
    }
  }, [availFetched])

  useEffect(() => {
    if (screen === 'pay' && bookDate && roomId) {
      fetchAvailability(bookDate, roomId)
    }
  }, [screen, bookDate, roomId, fetchAvailability])

  // Also re-fetch when date changes while on pay screen
  useEffect(() => {
    if (screen === 'pay' && bookDate && roomId) {
      setAvailFetched('')  // force re-fetch
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookDate])

  const pkg    = PACKAGES.find(p => p.id === selPkg)
  const endTime = bookTime && pkg ? addHours(bookTime, pkg.durationHours) : ''

  // Conflict detection
  const timeConflict = bookTime && pkg
    ? hasConflict(bookTime, pkg.durationHours, bookedSlots)
    : false

  const formOK = bookDate && bookTime && clientName.trim() && clientPhone.trim().length >= 7 && !timeConflict

  function goBook() {
    setScreen('book')
    setTimeout(() => bookEl.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 80)
  }

  function goPay(pkgId) {
    setSelPkg(pkgId)
    setScreen('pay')
    setTimeout(() => payEl.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 80)
  }

  async function handleConfirmBooking() {
    if (!formOK || !pkg) return
    setBookErr('')
    if (!roomId) { setBookErr('Could not load room details. Please refresh and try again.'); return }
    if (timeConflict) { setBookErr('Selected time conflicts with an existing booking. Please choose another slot.'); return }

    let bookingId = null
    try {
      bookingId = await saveRoomBooking({ roomId, bookedDate:bookDate, startTime:bookTime, endTime, notes:notes||null, paymentMethod:null })
    } catch (err) {
      setBookErr(err.message || 'Could not create booking. Please try again.')
      return
    }

    const result = await openPayment({
      type:        'room_booking',
      amount:      pkg.price,
      title:       `The Serenity Room — ${pkg.name}`,
      description: `${bookDate} · ${bookTime}–${endTime} · ${pkg.period}`,
      itemLines:   [{ label:`${pkg.name} (${pkg.period})`, amount:pkg.price }],
      couponEnabled: true,
      allowedGateways: ['esewa','khalti','fonepay','stripe','bank_transfer','cash'],
      metadata: {
        booking_id:      bookingId,
        room_booking_id: bookingId,
        category:        'room_booking',
        package_id:      pkg.id,
        package_name:    pkg.name,
        book_date:       bookDate,
        book_time:       bookTime,
        client_name:     clientName,
        client_phone:    clientPhone,
        client_email:    clientEmail,
      },
    })

    if (result.success) {
      if (bookingId && result.paymentId) {
        fetch(`${API_BASE}/room-bookings/${bookingId}/attach-payment`, {
          method:  'POST',
          headers: { 'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('accessToken')}` },
          body: JSON.stringify({ paymentId:result.paymentId, transactionId:result.transactionId }),
        }).catch(() => {})
      }
      setDoneData({ pkg, bookDate, bookTime, endTime, clientName, clientPhone, method:result.method, txnId:result.transactionId })
      setScreen('done')
      window.scrollTo({ top:0, behavior:'smooth' })
    }
  }

  const minDate = new Date().toISOString().split('T')[0]

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (screen === 'done' && doneData) return (
    <div className="page-wrapper" style={{ background:BG }}>
      <div style={{ maxWidth:500, margin:'0 auto', padding:'5rem 1.5rem' }}>
        <div style={{ background:WHITE, borderRadius:24, border:`1.5px solid ${BORDER}`, boxShadow:'0 8px 40px rgba(14,165,233,0.12)', overflow:'hidden' }}>
          <div style={{ height:5, background:doneData.pkg?.grad||btnGrad }}/>
          <div style={{ padding:'3rem 2.5rem', textAlign:'center' }}>
            <div style={{ width:76, height:76, borderRadius:'50%', background:doneData.pkg?.grad||btnGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'2rem', boxShadow:'0 8px 28px rgba(14,165,233,0.28)' }}>{doneData.pkg?.emoji||'🏛️'}</div>
            <div style={{ display:'inline-block', background:MINT_L, border:`1px solid ${MINT}`, borderRadius:100, padding:'0.28rem 1rem', marginBottom:'0.85rem' }}>
              <span style={{ fontFamily:'inherit', fontSize:'0.65rem', fontWeight:800, color:'#065f46', letterSpacing:'0.1em', textTransform:'uppercase' }}>💳 Booking Confirmed</span>
            </div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', color:SLATE, marginBottom:'0.65rem' }}>Your Booking is Set!</h2>
            <p style={{ fontFamily:'inherit', fontSize:'0.9rem', color:SLATE_M, lineHeight:1.75, marginBottom:'1.5rem' }}>
              Thank you, <strong>{doneData.clientName}</strong>! Your {doneData.pkg?.name} booking for {doneData.bookDate} at {doneData.bookTime}–{doneData.endTime} has been recorded.
            </p>
            <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12, padding:'0.9rem 1.1rem', marginBottom:'1.75rem', textAlign:'left' }}>
              {[
                ['Package', `${doneData.pkg?.emoji} ${doneData.pkg?.name}`],
                ['Date',    doneData.bookDate],
                ['Time',    `${doneData.bookTime} – ${doneData.endTime}`],
                ['Total',   `NPR ${doneData.pkg?.price?.toLocaleString()}`],
                ['Payment', doneData.method||'—'],
                ...(doneData.txnId ? [['Ref', doneData.txnId]] : []),
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'0.35rem 0', borderBottom:`1px solid ${BORDER}`, fontFamily:'inherit', fontSize:'0.82rem' }}>
                  <span style={{ color:SLATE_L, fontWeight:600 }}>{k}</span>
                  <span style={{ color:SLATE,   fontWeight:700 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => navigate('/')} style={{ padding:'0.75rem 2rem', borderRadius:12, border:'none', background:btnGrad, color:WHITE, fontFamily:'inherit', fontWeight:700, fontSize:'0.9rem', cursor:'pointer', boxShadow:'0 4px 16px rgba(14,165,233,0.28)' }}>🏠 Back to Home</button>
              <button onClick={() => { setScreen('place'); setDoneData(null) }} style={{ padding:'0.75rem 1.5rem', borderRadius:12, border:`1.5px solid ${BORDER}`, background:WHITE, color:SLATE_M, fontFamily:'inherit', fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}>View Space</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page-wrapper" style={{ background:BG }}>
      {lightbox !== null && <Lightbox images={PLACE.images} startIdx={lightbox} onClose={() => setLightbox(null)}/>}

      {/* Hero */}
      <div style={{ position:'relative', width:'100%' }}>
        <div style={{ position:'relative', width:'100%', height:'clamp(260px,55vw,620px)', overflow:'hidden' }}>
          {PLACE.images.map((img, i) => (
            <div key={i} style={{ position:'absolute', inset:0, opacity:imgIdx===i?1:0, transition:'opacity 1s ease', zIndex:imgIdx===i?1:0 }}>
              {imgErr[i]
                ? <PlaceholderImg label={img.alt} style={{ position:'absolute', inset:0 }}/>
                : <img src={img.src} alt={img.alt} onError={() => setImgErr(e => ({ ...e, [i]:true }))} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              }
            </div>
          ))}
          <div onClick={() => setLightbox(imgIdx)} style={{ position:'absolute', inset:0, zIndex:2, cursor:'zoom-in' }}/>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'55%', background:'linear-gradient(to top,rgba(0,0,0,0.78) 0%,transparent 100%)', zIndex:3, pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'clamp(1rem,3vw,2rem) clamp(1rem,3vw,2.5rem)', zIndex:4, pointerEvents:'none' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.25)', borderRadius:100, padding:'0.25rem 0.85rem', marginBottom:'0.5rem' }}>
              <span style={{ fontFamily:'inherit', fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.9)', textTransform:'uppercase', letterSpacing:'0.1em' }}>📍 {PLACE.caption}</span>
            </div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,4vw,2.8rem)', color:WHITE, margin:0, lineHeight:1.1, textShadow:'0 2px 12px rgba(0,0,0,0.4)' }}>{PLACE.name}</h1>
            <p style={{ fontFamily:'inherit', fontSize:'clamp(0.82rem,1.8vw,1rem)', color:'rgba(255,255,255,0.82)', marginTop:'0.3rem', textShadow:'0 1px 6px rgba(0,0,0,0.4)' }}>{PLACE.tagline}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i-1+PLACE.images.length)%PLACE.images.length) }} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', zIndex:5, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.25)', color:WHITE, borderRadius:'50%', width:44, height:44, fontSize:'1.3rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
          <button onClick={e => { e.stopPropagation(); setImgIdx(i => (i+1)%PLACE.images.length) }} style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', zIndex:5, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.25)', color:WHITE, borderRadius:'50%', width:44, height:44, fontSize:'1.3rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
          <div style={{ position:'absolute', bottom:'1.2rem', right:'1.25rem', display:'flex', alignItems:'center', gap:'0.6rem', zIndex:5 }}>
            <button onClick={e => { e.stopPropagation(); setLightbox(0) }} style={{ background:'rgba(0,0,0,0.45)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.25)', color:WHITE, borderRadius:100, padding:'0.25rem 0.75rem', fontFamily:'inherit', fontSize:'0.68rem', fontWeight:700, cursor:'pointer' }}>🖼 {PLACE.images.length} photos</button>
            {PLACE.images.map((_,i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setImgIdx(i) }} style={{ width:imgIdx===i?24:8, height:8, borderRadius:4, border:'none', background:imgIdx===i?WHITE:'rgba(255,255,255,0.45)', cursor:'pointer', padding:0, transition:'all 0.25s' }}/>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', padding:'0.75rem 1.25rem', background:SLATE, overflowX:'auto', scrollbarWidth:'none' }}>
          {PLACE.images.map((img,i) => (
            <div key={i} onClick={() => setImgIdx(i)} style={{ width:80, height:52, borderRadius:8, overflow:'hidden', flexShrink:0, border:`2px solid ${imgIdx===i?SKY:'transparent'}`, cursor:'pointer', transition:'border-color 0.2s', opacity:imgIdx===i?1:0.6 }}>
              <img src={img.thumb} alt={img.alt} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { e.target.style.display='none'; e.target.parentElement.style.background=SKY_D }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Description + amenities */}
      <div style={{ maxWidth:860, margin:'0 auto', padding:'clamp(2rem,5vw,4rem) clamp(1rem,4vw,2rem)' }}>
        <div style={{ marginBottom:'3rem' }}>
          {PLACE.description.split('\n\n').map((para,i) => (
            <p key={i} style={{ fontFamily:'inherit', fontSize:'clamp(0.9rem,2vw,1.02rem)', color:SLATE_M, lineHeight:1.88, marginBottom:'1.25rem' }}>{para}</p>
          ))}
        </div>
        <div style={{ marginBottom:'3rem' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:SLATE, marginBottom:'1.25rem' }}>What's Included</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'0.65rem' }}>
            {PLACE.amenities.map((a,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.7rem', padding:'0.7rem 1rem', background:WHITE, borderRadius:12, border:`1.5px solid ${BORDER}` }}>
                <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{a.icon}</span>
                <span style={{ fontFamily:'inherit', fontSize:'0.84rem', color:SLATE_M, fontWeight:500 }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {screen === 'place' && (
          <div style={{ textAlign:'center', padding:'2rem 0' }}>
            <div style={{ background:`linear-gradient(135deg,${SKY_L} 0%,${MINT_L} 100%)`, borderRadius:20, padding:'2.5rem', border:`1.5px solid ${BORDER}`, marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🏛️</div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:SLATE, marginBottom:'0.5rem' }}>Ready to book The Serenity Room?</h3>
              <p style={{ fontFamily:'inherit', fontSize:'0.9rem', color:SLATE_M, lineHeight:1.7, maxWidth:440, margin:'0 auto 1.5rem' }}>Choose a package — from a single hour to a full-day retreat.</p>
              <button onClick={goBook} onMouseEnter={e=>e.currentTarget.style.opacity='0.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'} style={{ padding:'0.9rem 3rem', borderRadius:14, border:'none', background:btnGrad, color:WHITE, fontFamily:'inherit', fontWeight:700, fontSize:'1rem', cursor:'pointer', boxShadow:'0 6px 24px rgba(14,165,233,0.35)', transition:'opacity 0.2s' }}>
                📅 Book This Place
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Package selection */}
      {(screen === 'book' || screen === 'pay') && (
        <div ref={bookEl} style={{ background:WHITE, borderTop:`3px solid ${SKY}` }}>
          <div style={{ background:`linear-gradient(135deg,${SKY_D} 0%,${SKY} 55%,#22d3ee 100%)`, padding:'clamp(1.5rem,4vw,2.5rem) clamp(1rem,4vw,2.5rem)', position:'relative', overflow:'hidden' }}>
            <div style={{ maxWidth:860, margin:'0 auto', position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
              <div>
                <div style={{ fontFamily:'inherit', fontSize:'0.68rem', fontWeight:700, color:'rgba(255,255,255,0.72)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.3rem' }}>Step 1 — Choose your package</div>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.3rem,3vw,1.8rem)', color:WHITE, margin:0 }}>Select a Booking Package</h2>
              </div>
              <button onClick={() => setScreen('place')} style={{ background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', color:WHITE, borderRadius:100, padding:'0.38rem 1.1rem', fontFamily:'inherit', fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }}>← Back</button>
            </div>
          </div>
          <div style={{ maxWidth:860, margin:'0 auto', padding:'clamp(1.5rem,4vw,2.5rem) clamp(1rem,4vw,1.5rem)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1.25rem', marginBottom:'2.5rem' }}>
              {PACKAGES.map(p => {
                const isSel = selPkg === p.id
                return (
                  <div key={p.id} style={{ background:WHITE, borderRadius:20, overflow:'hidden', border:`2px solid ${isSel?p.color:BORDER}`, boxShadow:isSel?`0 0 0 4px ${p.color}22,0 8px 32px ${p.color}22`:p.popular?'0 8px 32px rgba(14,165,233,0.1)':'0 2px 10px rgba(0,0,0,0.04)', transform:p.popular&&!isSel?'translateY(-4px)':isSel?'translateY(-3px)':'none', transition:'all 0.25s', position:'relative' }}>
                    {p.popular && <div style={{ position:'absolute', top:14, right:14, background:btnGrad, color:WHITE, fontSize:'0.6rem', fontWeight:800, padding:'0.2rem 0.65rem', borderRadius:100, letterSpacing:'0.08em', textTransform:'uppercase', fontFamily:'inherit' }}>Best Value</div>}
                    <div style={{ height:5, background:p.grad }}/>
                    <div style={{ padding:'1.5rem' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'0.85rem' }}>
                        <div style={{ width:42, height:42, borderRadius:12, background:p.faint, border:`1px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>{p.emoji}</div>
                        <div>
                          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:SLATE }}>{p.name}</div>
                          <div style={{ fontFamily:'inherit', fontSize:'0.7rem', color:SLATE_L }}>{p.period}</div>
                        </div>
                      </div>
                      <div style={{ marginBottom:'1.1rem' }}><span style={{ fontFamily:'var(--font-display)', fontSize:'1.65rem', color:SLATE }}>NPR {p.price.toLocaleString()}</span></div>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', marginBottom:'1.25rem' }}>
                        {p.features.map((f,i) => (
                          <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.55rem' }}>
                            <div style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, background:f.on?p.faint:BG, border:`1px solid ${f.on?p.color:BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.5rem', fontWeight:800, color:f.on?p.color:SLATE_L }}>{f.on?'✓':'✕'}</div>
                            <span style={{ fontFamily:'inherit', fontSize:'0.79rem', color:f.on?SLATE_M:SLATE_L }}>{f.label}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => goPay(p.id)} style={{ width:'100%', padding:'0.75rem', borderRadius:12, background:isSel?p.grad:p.popular?btnGrad:`linear-gradient(135deg,${SKY_L},#bae6fd)`, color:isSel||p.popular?WHITE:SKY_D, fontFamily:'inherit', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', border:isSel||p.popular?'none':`1.5px solid ${BORDER}`, boxShadow:isSel||p.popular?`0 4px 18px ${p.color}44`:'none', transition:'all 0.2s' }}>
                        {isSel?'✓ Selected — Fill Details':`Book ${p.name} →`}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Booking details form */}
      {screen === 'pay' && pkg && (
        <div ref={payEl} style={{ background:BG, borderTop:`3px solid ${pkg.color}` }}>
          <div style={{ background:pkg.grad, padding:'clamp(1.25rem,3vw,2rem) clamp(1rem,4vw,2.5rem)', position:'relative', overflow:'hidden' }}>
            <div style={{ maxWidth:860, margin:'0 auto', position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
              <div>
                <div style={{ fontFamily:'inherit', fontSize:'0.65rem', fontWeight:700, color:'rgba(255,255,255,0.72)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.2rem' }}>Step 2 — Booking Details</div>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.2rem,3vw,1.65rem)', color:WHITE, margin:0 }}>{pkg.emoji} {pkg.name} — NPR {pkg.price.toLocaleString()}</h2>
              </div>
              <button onClick={() => setScreen('book')} style={{ background:'rgba(255,255,255,0.18)', border:'1px solid rgba(255,255,255,0.3)', color:WHITE, borderRadius:100, padding:'0.38rem 1.1rem', fontFamily:'inherit', fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }}>← Change Package</button>
            </div>
          </div>

          <div style={{ maxWidth:640, margin:'0 auto', padding:'clamp(1.5rem,4vw,2.5rem) clamp(1rem,4vw,1.5rem) 5rem' }}>

            {/* ── Date + Time card ─── */}
            <div style={{ background:WHITE, borderRadius:18, border:`1px solid ${BORDER}`, overflow:'hidden', boxShadow:'0 4px 20px rgba(14,165,233,0.06)', marginBottom:'1rem' }}>
              <div style={{ padding:'0.85rem 1.4rem', background:`linear-gradient(135deg,${SKY_L},${MINT_L})`, borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', color:SLATE }}>📅 Date & Time</span>
              </div>
              <div style={{ padding:'1.25rem 1.4rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

                {/* Date picker */}
                <div>
                  <label style={{ display:'block', fontFamily:'inherit', fontSize:'0.68rem', fontWeight:800, color:SLATE_L, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.35rem' }}>Date *</label>
                  <FocusInput type="date" value={bookDate} onChange={e => { setBookDate(e.target.value); setBookTime('') }} min={minDate}/>
                </div>

                {/* Availability timeline — shows when date is selected */}
                {bookDate && (
                  <div>
                    {availErr && (
                      <div style={{ background:AMBER_L, border:`1px solid ${AMBER}`, borderRadius:8, padding:'0.5rem 0.75rem', fontSize:'0.75rem', color:'#92400e', marginBottom:'0.5rem' }}>
                        ⚠️ {availErr}
                      </div>
                    )}
                    <AvailabilityTimeline
                      bookedSlots={bookedSlots}
                      selectedStart={bookTime}
                      selectedEnd={endTime}
                      durationHours={pkg.durationHours}
                      loading={availLoading}
                    />
                  </div>
                )}

                {/* Smart time picker */}
                <SmartTimePicker
                  value={bookTime}
                  onChange={setBookTime}
                  bookedSlots={bookedSlots}
                  durationHours={pkg.durationHours}
                  label={`Start Time * (${pkg.durationHours}h slot)`}
                />

                {/* Session summary or conflict warning */}
                {bookTime && !timeConflict && (
                  <div style={{ background:SKY_L, borderRadius:10, padding:'0.65rem 0.9rem', fontSize:'0.82rem', color:SKY_D, fontWeight:600, display:'flex', alignItems:'center', gap:'0.5rem' }}>
                    ✅ <span>Session: <strong>{fmtTime(bookTime)}</strong> – <strong>{fmtTime(endTime)}</strong> &nbsp;·&nbsp; {pkg.durationHours}h &nbsp;·&nbsp; {bookDate}</span>
                  </div>
                )}
                {bookTime && timeConflict && (
                  <div style={{ background:RED_L, border:`1.5px solid ${RED}`, borderRadius:10, padding:'0.75rem 0.9rem', display:'flex', gap:'0.6rem', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'1.1rem', flexShrink:0 }}>🚫</span>
                    <div>
                      <div style={{ fontFamily:'inherit', fontSize:'0.84rem', fontWeight:700, color:RED_D, marginBottom:'0.2rem' }}>Time Conflict</div>
                      <div style={{ fontFamily:'inherit', fontSize:'0.78rem', color:'#b91c1c', lineHeight:1.5 }}>
                        Your <strong>{pkg.durationHours}h</strong> session from <strong>{fmtTime(bookTime)}</strong> to <strong>{fmtTime(endTime)}</strong> overlaps an existing booking.
                        <br/>Please choose a different start time.
                      </div>
                      {bookedSlots.length > 0 && (
                        <div style={{ marginTop:'0.45rem', display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
                          {bookedSlots.map((b,i) => (
                            <span key={i} style={{ background:'#fee2e2', border:`1px solid #fca5a5`, borderRadius:100, padding:'0.15rem 0.55rem', fontSize:'0.68rem', color:RED_D, fontWeight:600 }}>
                              {fmtTime(b.start)}–{fmtTime(b.end)} booked
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Contact card ─── */}
            <div style={{ background:WHITE, borderRadius:18, border:`1px solid ${BORDER}`, overflow:'hidden', boxShadow:'0 4px 20px rgba(14,165,233,0.06)', marginBottom:'1rem' }}>
              <div style={{ padding:'0.85rem 1.4rem', background:`linear-gradient(135deg,${SKY_L},${MINT_L})`, borderBottom:`1px solid ${BORDER}` }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', color:SLATE }}>👤 Your Details</span>
              </div>
              <div style={{ padding:'1.25rem 1.4rem', display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                {[
                  { label:'Your Name *',        type:'text',  value:clientName,  set:setClientName,  ph:'Priya Sharma' },
                  { label:'Phone / WhatsApp *', type:'tel',   value:clientPhone, set:setClientPhone, ph:'98XXXXXXXX'   },
                  { label:'Email',              type:'email', value:clientEmail, set:setClientEmail, ph:'you@email.com' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display:'block', fontFamily:'inherit', fontSize:'0.68rem', fontWeight:800, color:SLATE_L, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.35rem' }}>{f.label}</label>
                    <FocusInput type={f.type} value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.ph}/>
                  </div>
                ))}
                <div>
                  <label style={{ display:'block', fontFamily:'inherit', fontSize:'0.68rem', fontWeight:800, color:SLATE_L, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.35rem' }}>Purpose / Notes</label>
                  <FocusTextarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Group DBT session for 8 people, need chairs in circle…" rows={3}/>
                </div>
              </div>
            </div>

            {bookErr && (
              <div style={{ background:RED_L, border:`1px solid #fca5a5`, borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1rem', fontSize:'0.82rem', color:RED_D, display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
                <span>⚠️</span><span>{bookErr}</span>
              </div>
            )}

            <div style={{ background:'#e8f8f0', border:'1px solid #a8d8b8', borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1.25rem', fontSize:'0.82rem', color:'#1a5a3a' }}>
              ℹ️ After filling in your details, you'll choose your payment method (eSewa, Khalti, Card, Bank Transfer, or Cash on Arrival).
            </div>

            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button onClick={() => setScreen('book')} style={{ padding:'0.75rem 1.25rem', borderRadius:12, border:`1.5px solid ${BORDER}`, background:WHITE, color:SLATE_M, fontFamily:'inherit', fontWeight:600, cursor:'pointer' }}>← Back</button>
              <button
                onClick={handleConfirmBooking}
                disabled={!formOK}
                style={{ flex:1, padding:'0.9rem', borderRadius:12, border:'none', background:formOK?pkg.grad:BORDER, color:formOK?WHITE:SLATE_L, fontFamily:'inherit', fontWeight:700, fontSize:'0.9rem', cursor:formOK?'pointer':'not-allowed', boxShadow:formOK?`0 6px 22px ${pkg.color}44`:'none', transition:'all 0.2s' }}>
                {timeConflict
                  ? '🚫 Choose a different time'
                  : !bookDate || !bookTime
                    ? 'Pick a date & time first'
                    : !clientName.trim() || clientPhone.trim().length < 7
                      ? 'Fill in your name & phone'
                      : `Choose Payment — NPR ${pkg.price.toLocaleString()} →`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
