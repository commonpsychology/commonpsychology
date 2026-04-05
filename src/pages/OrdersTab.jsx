// src/components/OrdersTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop-in Orders tab for MyAccountPage.
// Shows: Store orders · Therapy appointments · Course enrollments · Workshop reservations
// Includes payment status badge with pending/confirmed/failed states.
//
// Usage: in MyAccountPage.jsx add to TABS array:
//   { id:'orders', icon:'📦', label:'My Orders' }
// Then in the content panel:
//   {tab === 'orders' && <OrdersTab />}
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const token    = () => localStorage.getItem('accessToken')

const SKY   = '#007BA8'
const MID   = '#4a6a7a'
const LIGHT = '#7a9aaa'
const BG    = '#f4f8fb'
const BORDER= '#daeef8'

// ── Helpers ───────────────────────────────────────────────────────────────────
async function fetchMyOrders() {
  const res = await fetch(`${API_BASE}/payments/my-orders`, {
    headers: { Authorization: `Bearer ${token()}` },
  })
  const d = await res.json()
  if (!res.ok) throw new Error(d.message || 'Failed to load orders')
  return d
}

const fmt  = d => d ? new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' }) : '—'
const fmtT = d => d ? new Date(d).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'

// ── Status badges ─────────────────────────────────────────────────────────────
const ORDER_STATUS = {
  pending:     { bg:'#fff5e6', c:'#8a5a1a', label:'Pending' },
  confirmed:   { bg:'#e8f8f0', c:'#1a7a4a', label:'Confirmed' },
  processing:  { bg:'#fff9e6', c:'#8a6a1a', label:'Processing' },
  shipped:     { bg:'#e0f7ff', c:'#007BA8', label:'Shipped' },
  delivered:   { bg:'#e8f8f0', c:'#1a7a4a', label:'Delivered' },
  cancelled:   { bg:'#fff0f0', c:'#c0392b', label:'Cancelled' },
  completed:   { bg:'#e8f8f0', c:'#1a7a4a', label:'Completed' },
  no_show:     { bg:'#fff0f0', c:'#c0392b', label:'No Show' },
}

const PAY_STATUS = {
  completed:   { bg:'#e8f8f0', c:'#1a7a4a', label:'Paid' },
  pending:     { bg:'#fff5e6', c:'#8a5a1a', label:'Payment Pending' },
  pending_cod: { bg:'#fff0f8', c:'#8a1a5a', label:'COD Pending' },
  failed:      { bg:'#fff0f0', c:'#c0392b', label:'Payment Failed' },
}

function StatusBadge({ status, map }) {
  const v = (map || ORDER_STATUS)[status] || { bg:'#eee', c:'#444', label: status }
  return (
    <span style={{ padding:'0.18rem 0.6rem', borderRadius:100, fontSize:'0.65rem', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', background:v.bg, color:v.c, whiteSpace:'nowrap' }}>
      {v.label}
    </span>
  )
}

function PaymentBadge({ payments }) {
  if (!payments || payments.length === 0) return null
  // Take the most recent non-failed payment, or the latest
  const p = payments.find(x => x.status === 'completed') ||
            payments.find(x => x.status === 'pending' || x.status === 'pending_cod') ||
            payments[0]
  return p ? <StatusBadge status={p.status} map={PAY_STATUS}/> : null
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ icon, title, count, children }) {
  return (
    <div style={{ marginBottom:'2rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.85rem' }}>
        <span style={{ fontSize:'1.1rem' }}>{icon}</span>
        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'#1a3a4a', margin:0 }}>{title}</h3>
        {count != null && (
          <span style={{ fontSize:'0.72rem', fontWeight:700, color:LIGHT, background:BG, border:`1px solid ${BORDER}`, borderRadius:100, padding:'0.1rem 0.5rem' }}>{count}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign:'center', padding:'2rem 1rem', color:LIGHT, fontSize:'0.85rem' }}>
      <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>{icon}</div>
      <p>{text}</p>
    </div>
  )
}

// ── Card base ─────────────────────────────────────────────────────────────────
function Card({ children, highlight }) {
  return (
    <div style={{
      background:'white', borderRadius:12, border:`1px solid ${highlight ? '#b0d4e8' : BORDER}`,
      marginBottom:'0.75rem', overflow:'hidden',
      boxShadow: highlight ? '0 2px 12px rgba(0,191,255,0.08)' : 'none',
    }}>
      {children}
    </div>
  )
}

// ── Store order card ──────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const [open, setOpen] = useState(false)
  const items = order.order_items || []

  return (
    <Card highlight={order.status === 'confirmed' || order.status === 'processing'}>
      <div style={{ padding:'0.9rem 1.1rem', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}
        onClick={() => setOpen(o => !o)}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.25rem', flexWrap:'wrap' }}>
            <span style={{ fontWeight:700, fontSize:'0.84rem', color:'#1a3a4a' }}>#{order.order_number}</span>
            <StatusBadge status={order.status}/>
            <PaymentBadge payments={order.payments}/>
          </div>
          <div style={{ fontSize:'0.77rem', color:LIGHT }}>
            {items.length} item{items.length !== 1 ? 's' : ''} · {fmt(order.created_at)}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:SKY }}>
            NPR {Number(order.total_amount || 0).toLocaleString()}
          </span>
          <span style={{ color:LIGHT, fontSize:'0.8rem', transform: open ? 'rotate(180deg)' : 'none', transition:'0.2s' }}>▾</span>
        </div>
      </div>

      {open && (
        <div style={{ borderTop:`1px solid ${BORDER}`, padding:'0.8rem 1.1rem', background:BG }}>
          {items.map((item, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'0.35rem 0', borderBottom: i < items.length - 1 ? `1px solid ${BORDER}` : 'none', fontSize:'0.82rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span>{item.products?.is_digital ? '📥' : '📦'}</span>
                <span style={{ color:'#1a3a4a' }}>{item.products?.name || '—'}</span>
                <span style={{ color:LIGHT }}>×{item.quantity}</span>
              </div>
              <span style={{ color:MID, fontWeight:600 }}>NPR {Number(item.unit_price || 0).toLocaleString()}</span>
            </div>
          ))}
          {/* Payment status detail */}
          {(order.payments || []).map((p, i) => (
            <div key={i} style={{ marginTop:'0.65rem', padding:'0.5rem 0.75rem', background:'white', borderRadius:8, border:`1px solid ${BORDER}`, display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:'0.78rem' }}>
              <span style={{ color:MID }}>💳 {p.method} payment</span>
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <StatusBadge status={p.status} map={PAY_STATUS}/>
                {p.status === 'pending' && (
                  <span style={{ color:LIGHT, fontSize:'0.7rem' }}>Admin is verifying your payment</span>
                )}
                {p.status === 'pending_cod' && (
                  <span style={{ color:LIGHT, fontSize:'0.7rem' }}>Pay on delivery</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ── Appointment card ──────────────────────────────────────────────────────────
function AppointmentCard({ appt }) {
  const therapistName = appt.therapist?.profiles?.full_name || '—'
  const isPast        = new Date(appt.scheduled_at) < new Date()

  return (
    <Card highlight={appt.status === 'confirmed' && !isPast}>
      <div style={{ padding:'0.9rem 1.1rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.5rem' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.3rem', flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.9rem' }}>{appt.type === 'online' ? '💻' : appt.type === 'in_person' ? '🏥' : '📞'}</span>
            <span style={{ fontWeight:700, fontSize:'0.84rem', color:'#1a3a4a' }}>
              {appt.type?.replace('_', ' ')} session
            </span>
            <StatusBadge status={appt.status}/>
            <PaymentBadge payments={appt.payments}/>
          </div>
          <div style={{ fontSize:'0.8rem', color:MID, marginBottom:'0.2rem' }}>
            👤 {therapistName}
          </div>
          <div style={{ fontSize:'0.77rem', color:LIGHT }}>
            📅 {fmtT(appt.scheduled_at)} · {appt.duration_minutes || 60} min
          </div>
          {appt.meeting_link && appt.status === 'confirmed' && !isPast && (
            <a href={appt.meeting_link} target="_blank" rel="noopener noreferrer"
              style={{ display:'inline-block', marginTop:'0.4rem', fontSize:'0.78rem', fontWeight:700, color:SKY, textDecoration:'none' }}>
              🔗 Join session →
            </a>
          )}
        </div>
        <div style={{ textAlign:'right' }}>
          {(appt.payments || []).length > 0 && (
            <div style={{ fontSize:'0.82rem', fontWeight:700, color:SKY }}>
              NPR {Number(appt.payments[0]?.amount || 0).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

// ── Course enrollment card ────────────────────────────────────────────────────
function EnrollmentCard({ enrollment }) {
  const course = enrollment.courses || {}
  const pct    = Math.round(enrollment.progress || 0)

  return (
    <Card>
      <div style={{ padding:'0.9rem 1.1rem', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'0.5rem' }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.3rem', flexWrap:'wrap' }}>
            <span style={{ fontSize:'1.1rem' }}>{course.emoji || '📚'}</span>
            <span style={{ fontWeight:700, fontSize:'0.84rem', color:'#1a3a4a' }}>{course.title}</span>
            {enrollment.paid
              ? <StatusBadge status="completed" map={{ completed:{ bg:'#e8f8f0', c:'#1a7a4a', label:'Enrolled' }}}/>
              : <StatusBadge status="pending" map={{ pending:{ bg:'#e8f8f0', c:'#1a7a4a', label:'Free Access' }}}/>
            }
          </div>
          <div style={{ fontSize:'0.77rem', color:LIGHT }}>
            Enrolled {fmt(enrollment.enrolled_at)}
            {enrollment.completed_at && ` · Completed ${fmt(enrollment.completed_at)}`}
          </div>
          {/* Progress bar */}
          <div style={{ marginTop:'0.55rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:LIGHT, marginBottom:'0.2rem' }}>
              <span>Progress</span><span>{pct}%</span>
            </div>
            <div style={{ height:4, background:BG, borderRadius:100, overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${SKY},#00BFFF)`, borderRadius:100 }}/>
            </div>
          </div>
        </div>
        <div>
          <a href={`/courses/${course.slug}`}
            style={{ display:'inline-block', padding:'0.4rem 0.9rem', borderRadius:8, background:SKY, color:'white', fontWeight:700, fontSize:'0.8rem', textDecoration:'none' }}>
            ▶ Continue
          </a>
        </div>
      </div>
    </Card>
  )
}

// ── Workshop / group session card ─────────────────────────────────────────────
function ReservationCard({ reservation }) {
  const session = reservation.group_sessions || {}
  const group   = session.community_groups   || {}
  const isPast  = session.scheduled_at && new Date(session.scheduled_at) < new Date()

  return (
    <Card highlight={reservation.status === 'confirmed' && !isPast}>
      <div style={{ padding:'0.9rem 1.1rem', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.5rem' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.3rem', flexWrap:'wrap' }}>
            <span>{group.emoji || '🎓'}</span>
            <span style={{ fontWeight:700, fontSize:'0.84rem', color:'#1a3a4a' }}>{session.title}</span>
            <StatusBadge status={reservation.status} map={{
              confirmed: { bg:'#e8f8f0', c:'#1a7a4a', label:'Registered' },
              cancelled: { bg:'#fff0f0', c:'#c0392b', label:'Cancelled' },
            }}/>
          </div>
          <div style={{ fontSize:'0.8rem', color:MID, marginBottom:'0.2rem' }}>
            👤 {session.facilitator} · {session.mode}
          </div>
          <div style={{ fontSize:'0.77rem', color:LIGHT }}>
            📅 {fmtT(session.scheduled_at)}
            {group.name && ` · ${group.name}`}
          </div>
          {session.notes && <div style={{ marginTop:'0.3rem', fontSize:'0.75rem', color:MID }}>{session.notes}</div>}
        </div>
        {isPast && <span style={{ fontSize:'0.72rem', color:LIGHT, fontStyle:'italic' }}>Past event</span>}
      </div>
    </Card>
  )
}

// ── Pending payments banner ───────────────────────────────────────────────────
function PendingPaymentsBanner({ payments }) {
  if (!payments || payments.length === 0) return null
  return (
    <div style={{ background:'#fff5e6', border:'1.5px solid #f5c880', borderRadius:12, padding:'0.9rem 1.1rem', marginBottom:'1.5rem' }}>
      <div style={{ fontWeight:700, fontSize:'0.85rem', color:'#8a5a1a', marginBottom:'0.5rem' }}>
        ⏳ Payments Awaiting Verification ({payments.length})
      </div>
      {payments.map(p => (
        <div key={p.id} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:'#6a4a1a', padding:'0.3rem 0', borderBottom:'1px solid #f5d8a0' }}>
          <span>NPR {Number(p.amount).toLocaleString()} · {p.method}</span>
          <StatusBadge status={p.status} map={PAY_STATUS}/>
        </div>
      ))}
      <p style={{ fontSize:'0.74rem', color:'#9a6a2a', marginTop:'0.5rem', margin:'0.5rem 0 0' }}>
        Our team verifies payments within 24 hours. You'll receive a notification once confirmed.
      </p>
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────
export default function OrdersTab() {
  const { navigate }    = useRouter()
  const [data, setData] = useState(null)
  const [loading, setL] = useState(true)
  const [error, setErr] = useState('')
  const [section, setSec] = useState('orders') // orders | appointments | courses | workshops

  useEffect(() => {
    setL(true)
    fetchMyOrders()
      .then(setData)
      .catch(e => setErr(e.message))
      .finally(() => setL(false))
  }, [])

  const tabs = [
    { id:'orders',       label:'📦 Orders',      count: data?.orders?.length },
    { id:'appointments', label:'📅 Sessions',     count: data?.appointments?.length },
    { id:'courses',      label:'🎓 Courses',      count: data?.enrollments?.length },
    { id:'workshops',    label:'🏛 Workshops',    count: data?.reservations?.length },
  ]

  if (loading) return (
    <div style={{ textAlign:'center', padding:'3rem', color:LIGHT }}>
      <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>⏳</div>
      <p style={{ fontSize:'0.85rem' }}>Loading your orders…</p>
    </div>
  )

  if (error) return (
    <div style={{ background:'#fff0f0', border:'1px solid #fca5a5', borderRadius:10, padding:'1.25rem', color:'#c0392b', fontSize:'0.85rem' }}>
      ⚠️ {error}
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.5rem' }}>
        <h2 style={{ fontFamily:'var(--font-display)', color:'#1a3a4a', fontSize:'clamp(1rem,3vw,1.2rem)', margin:0 }}>My Orders & Bookings</h2>
        <button onClick={() => navigate('/portal')} style={{ fontSize:'0.8rem', color:SKY, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>
          View full portal →
        </button>
      </div>

      {/* Pending payments warning */}
      <PendingPaymentsBanner payments={data?.pendingPayments}/>

      {/* Sub-tabs */}
      <div style={{ display:'flex', gap:'0', marginBottom:'1.25rem', borderBottom:`1px solid ${BORDER}`, overflowX:'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setSec(t.id)}
            style={{ flexShrink:0, padding:'0.6rem 1rem', border:'none', background:'none', borderBottom:`2.5px solid ${section===t.id?SKY:'transparent'}`, color: section===t.id?SKY:LIGHT, fontWeight: section===t.id?700:500, fontSize:'0.82rem', cursor:'pointer', whiteSpace:'nowrap', fontFamily:'inherit' }}>
            {t.label}
            {t.count > 0 && (
              <span style={{ marginLeft:5, fontSize:'0.68rem', background: section===t.id?SKY:BG, color: section===t.id?'white':LIGHT, borderRadius:100, padding:'0 5px' }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Orders */}
      {section === 'orders' && (
        <Section icon="📦" title="Store Orders" count={data?.orders?.length}>
          {!data?.orders?.length
            ? <EmptyState icon="🛒" text="No store orders yet. Browse our wellness products." />
            : data.orders.map(o => <OrderCard key={o.id} order={o}/>)
          }
          {!data?.orders?.length && (
            <button onClick={() => navigate('/store')} style={{ width:'100%', padding:'0.75rem', borderRadius:10, border:`1.5px solid ${BORDER}`, background:BG, color:SKY, fontWeight:700, fontSize:'0.88rem', cursor:'pointer', marginTop:'0.5rem' }}>
              Browse Store →
            </button>
          )}
        </Section>
      )}

      {/* Appointments */}
      {section === 'appointments' && (
        <Section icon="📅" title="Therapy Sessions" count={data?.appointments?.length}>
          {!data?.appointments?.length
            ? <EmptyState icon="🩺" text="No sessions booked yet." />
            : data.appointments.map(a => <AppointmentCard key={a.id} appt={a}/>)
          }
          {!data?.appointments?.length && (
            <button onClick={() => navigate('/book')} style={{ width:'100%', padding:'0.75rem', borderRadius:10, border:`1.5px solid ${BORDER}`, background:BG, color:SKY, fontWeight:700, fontSize:'0.88rem', cursor:'pointer', marginTop:'0.5rem' }}>
              Book a Session →
            </button>
          )}
        </Section>
      )}

      {/* Courses */}
      {section === 'courses' && (
        <Section icon="🎓" title="Course Enrollments" count={data?.enrollments?.length}>
          {!data?.enrollments?.length
            ? <EmptyState icon="📚" text="No courses enrolled yet." />
            : data.enrollments.map(e => <EnrollmentCard key={e.id} enrollment={e}/>)
          }
          {!data?.enrollments?.length && (
            <button onClick={() => navigate('/courses')} style={{ width:'100%', padding:'0.75rem', borderRadius:10, border:`1.5px solid ${BORDER}`, background:BG, color:SKY, fontWeight:700, fontSize:'0.88rem', cursor:'pointer', marginTop:'0.5rem' }}>
              Browse Courses →
            </button>
          )}
        </Section>
      )}

      {/* Workshops */}
      {section === 'workshops' && (
        <Section icon="🏛" title="Workshop Registrations" count={data?.reservations?.length}>
          {!data?.reservations?.length
            ? <EmptyState icon="🎓" text="No workshops registered yet." />
            : data.reservations.map(r => <ReservationCard key={r.id} reservation={r}/>)
          }
          {!data?.reservations?.length && (
            <button onClick={() => navigate('/workshops')} style={{ width:'100%', padding:'0.75rem', borderRadius:10, border:`1.5px solid ${BORDER}`, background:BG, color:SKY, fontWeight:700, fontSize:'0.88rem', cursor:'pointer', marginTop:'0.5rem' }}>
              Browse Workshops →
            </button>
          )}
        </Section>
      )}
    </div>
  )
}