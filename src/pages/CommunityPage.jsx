// src/pages/CommunityPage.jsx
// v7 — Fixed: removed module-level useNavigate() call, AuthGateModal uses onLogin prop

import { useState, useEffect, useCallback } from 'react'
import { useRouter }  from '../context/RouterContext'
import { useAuth }    from '../context/AuthContext'
import { usePayment } from '../components/PaymentModal'
import { community as communityApi } from '../services/api'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'
const token    = () => localStorage.getItem('accessToken')
const apiFetch = async (path, opts = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token()}`,
      ...(opts.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}

const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', white:'#ffffff', mint:'#e8f3ee',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8',
  green:'#1a7a4a', greenFaint:'#e8f8f0',
  amber:'#8a5a1a', amberFaint:'#fff5e6',
  red:'#c0392b', redFaint:'#fff0f0',
}
const btnGrad     = `linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`
const sectionGrad = `linear-gradient(135deg,${C.skyFainter} 0%,${C.mint} 60%,${C.skyFaint} 100%)`

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return null
  const dt = new Date(d)
  if (isNaN(dt)) return null
  return dt.toLocaleString('en-US', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
}
function fmtShortDate(d) {
  if (!d) return null
  const dt = new Date(d)
  if (isNaN(dt)) return null
  const diffDays = Math.ceil((dt - new Date()) / 86400000)
  if (diffDays < 0)  return null
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 7)  return `In ${diffDays} days`
  return dt.toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

function isFreeGroup(g) {
  if (g.membership_fee === null || g.membership_fee === undefined || g.membership_fee === '') return false
  const p = Number(g.membership_fee)
  if (isNaN(p)) return false
  return p === 0
}

function isFreeSession(s) {
  if (s.price === null || s.price === undefined || s.price === '') return false
  const p = Number(s.price)
  if (isNaN(p)) return false
  return p === 0
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, emoji, type = 'info', onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4200); return () => clearTimeout(t) }, [onClose])
  const bg     = type === 'error' ? C.redFaint   : type === 'success' ? C.greenFaint : C.white
  const border = type === 'error' ? C.red        : type === 'success' ? C.green      : C.borderFaint
  return (
    <div style={{ position:'fixed', bottom:32, right:32, zIndex:2000, background:bg, borderRadius:16,
      padding:'1rem 1.25rem', boxShadow:`0 8px 32px rgba(0,0,0,0.15)`, border:`1.5px solid ${border}`,
      display:'flex', alignItems:'center', gap:'0.85rem', maxWidth:340 }}>
      <span style={{ fontSize:'1.8rem', flexShrink:0 }}>{emoji}</span>
      <div style={{ flex:1, fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:600, color:C.textDark, lineHeight:1.5 }}>{msg}</div>
      <button onClick={onClose} style={{ background:'none', border:'none', color:C.textLight, cursor:'pointer', fontSize:'1rem' }}>✕</button>
    </div>
  )
}

// ── Auth Gate Modal ───────────────────────────────────────────────────────────
// FIX: removed internal navigate call — uses onLogin callback from parent instead
function AuthGateModal({ onLogin, onClose }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1500,
      display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }} onClick={onClose}>
      <div style={{ background:C.white, borderRadius:24, padding:'2.5rem', maxWidth:400, width:'100%',
        boxShadow:`0 24px 64px rgba(0,0,0,0.22)`, textAlign:'center', position:'relative' }}
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:16, background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:C.textLight }}>✕</button>
        <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔐</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:C.textDark, marginBottom:'0.5rem' }}>Sign In Required</h2>
        <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textLight, lineHeight:1.65, marginBottom:'1.75rem' }}>
          You need to be signed in to join a group or reserve a session.
        </p>
        <button
          onClick={onLogin}
          style={{ width:'100%', padding:'0.85rem', borderRadius:14, border:'none',
            background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.92rem',
            cursor:'pointer', marginBottom:'0.75rem' }}
        >
          🔑 Sign In to Continue
        </button>
        <button onClick={onClose} style={{ width:'100%', padding:'0.75rem', borderRadius:14,
          border:`1.5px solid ${C.borderFaint}`, background:'transparent', color:C.textLight,
          fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.85rem', cursor:'pointer' }}>
          Maybe Later
        </button>
      </div>
    </div>
  )
}

// ── Membership badge ──────────────────────────────────────────────────────────
function MembershipBadge({ status }) {
  const MAP = {
    paid:    { bg:C.greenFaint, c:C.green,   label:'✓ Member'  },
    pending: { bg:C.amberFaint, c:C.amber,   label:'⏳ Pending' },
    free:    { bg:C.skyFaint,   c:C.skyDeep, label:'✓ Member'  },
    failed:  { bg:C.redFaint,   c:C.red,     label:'✗ Failed'  },
  }
  const v = MAP[status] || MAP.paid
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'0.2rem 0.65rem',
      borderRadius:100, background:v.bg, color:v.c, fontSize:'0.68rem', fontWeight:800 }}>
      {v.label}
    </span>
  )
}

// ── Payment status badge ──────────────────────────────────────────────────────
const PAY_STATUS = {
  paid:    { bg:C.greenFaint, c:C.green,   label:'✓ Confirmed' },
  pending: { bg:C.amberFaint, c:C.amber,   label:'⏳ Pending'   },
  failed:  { bg:C.redFaint,   c:C.red,     label:'✗ Failed'     },
  free:    { bg:C.skyFaint,   c:C.skyDeep, label:'🎁 Free'      },
  unpaid:  { bg:'#f0f0f0',    c:'#666',    label:'○ Unpaid'     },
}
function PayBadge({ status }) {
  const v = PAY_STATUS[status] || PAY_STATUS.unpaid
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'0.2rem 0.65rem',
      borderRadius:100, background:v.bg, color:v.c, fontSize:'0.7rem', fontWeight:800 }}>
      {v.label}
    </span>
  )
}

// ── Seat progress bar ─────────────────────────────────────────────────────────
function SeatBar({ booked, total, compact }) {
  if (!total) return null
  const pct  = Math.min(100, Math.round((booked / total) * 100))
  const left = total - booked
  const color = pct >= 100 ? C.red : pct >= 80 ? C.amber : C.skyDeep
  if (compact) return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
      <div style={{ flex:1, height:4, background:C.borderFaint, borderRadius:100, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`, background:btnGrad, borderRadius:100 }} />
      </div>
      <span style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', color, fontWeight:700, whiteSpace:'nowrap' }}>
        {left <= 0 ? 'Full' : `${booked}/${total}`}
      </span>
    </div>
  )
  return (
    <div style={{ marginBottom:'0.6rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-body)',
        fontSize:'0.7rem', color, marginBottom:'0.25rem', fontWeight:pct >= 80 ? 700 : 400 }}>
        <span>{pct >= 100 ? '🔴 Full' : pct >= 80 ? '⚠ Almost full' : '🟢 Available'}</span>
        <span>{booked}/{total} reserved</span>
      </div>
      <div style={{ height:5, background:C.borderFaint, borderRadius:100, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${pct}%`,
          background:pct >= 100 ? C.red : pct >= 80 ? `linear-gradient(90deg,${C.amber},#ffd54f)` : btnGrad,
          borderRadius:100 }} />
      </div>
    </div>
  )
}

// ── My Reservations Panel ─────────────────────────────────────────────────────
function MyReservationsPanel({ reservations, loading, onCancelReservation, cancelBusy }) {
  if (loading) return (
    <div style={{ textAlign:'center', padding:'2.5rem', color:C.textLight, fontFamily:'var(--font-body)', fontSize:'0.85rem' }}>
      Loading…
    </div>
  )
  if (!reservations.length) return (
    <div style={{ textAlign:'center', padding:'3rem' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📭</div>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:C.textDark, marginBottom:'0.5rem' }}>No reservations yet</div>
      <div style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textLight }}>Reserve a spot in any group session to see it here.</div>
    </div>
  )
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
      {reservations.map(r => {
        const session   = r.group_sessions || {}
        const group     = session.community_groups || {}
        const isPast    = session.scheduled_at && new Date(session.scheduled_at) < new Date()
        const free      = isFreeSession(session)
        const payStatus = free ? 'free' : (r.payment_status || 'unpaid')
        const sessionPrice = Number(
          r.payment_amount ??
          session.price ??
          group.membership_fee ??
          0
        )
        return (
          <div key={r.id} style={{ background:C.white, borderRadius:18,
            border:`1.5px solid ${payStatus === 'paid' || payStatus === 'free' ? C.green + '55' : C.borderFaint}`,
            boxShadow:`0 4px 20px rgba(0,0,0,0.05)`, overflow:'hidden', opacity:isPast ? 0.7 : 1 }}>
            <div style={{ height:4, background:
              payStatus === 'paid' || payStatus === 'free'
                ? `linear-gradient(90deg,${C.green},#4ade80)`
                : payStatus === 'pending'
                  ? `linear-gradient(90deg,${C.amber},#fbbf24)`
                  : `linear-gradient(90deg,#ccc,#ddd)` }} />
            <div style={{ padding:'1.25rem 1.5rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'0.75rem', marginBottom:'0.75rem' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap', marginBottom:'0.25rem' }}>
                    <span style={{ fontSize:'1.2rem' }}>{group.emoji || '💙'}</span>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:C.textDark }}>{session.title || '—'}</span>
                    {isPast && <span style={{ padding:'0.15rem 0.5rem', borderRadius:100, background:'#f0f0f0', color:'#888', fontSize:'0.65rem', fontWeight:800 }}>PAST</span>}
                  </div>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color:C.textLight }}>{group.name} · {session.mode}</div>
                </div>
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
                  <PayBadge status={payStatus} />
                  {r.is_anonymous && <span style={{ padding:'0.15rem 0.55rem', borderRadius:100, background:C.skyFaint, color:C.skyDeep, fontSize:'0.65rem', fontWeight:800 }}>🕵️ Anon</span>}
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'0.5rem', marginBottom:'0.85rem' }}>
                {[
                  ['📅 Date',        session.scheduled_at ? fmtDate(session.scheduled_at) : '—'],
                  ['👤 Facilitator', session.facilitator || '—'],
                  ['💳 Method',      r.payment_method || (free ? 'Free' : '—')],
                  ['💰 Amount',      free ? 'Free' : `NPR ${sessionPrice.toLocaleString()}`],
                ].map(([label, value]) => (
                  <div key={label} style={{ background:C.skyFainter, borderRadius:10, padding:'0.6rem 0.75rem', border:`1px solid ${C.borderFaint}` }}>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.2rem' }}>{label}</div>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:C.textDark, fontWeight:600 }}>{value}</div>
                  </div>
                ))}
              </div>
              {payStatus === 'pending' && !free && (
                <div style={{ background:C.amberFaint, border:`1px solid #f5d87a`, borderRadius:10, padding:'0.65rem 0.9rem', marginBottom:'0.75rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.amber }}>
                  ⏳ <strong>Awaiting admin payment verification.</strong>
                  {r.payment_reference && <> Ref: <code style={{ background:'rgba(0,0,0,0.07)', padding:'0.1rem 0.35rem', borderRadius:4 }}>{r.payment_reference}</code></>}
                </div>
              )}
              {payStatus === 'paid' && (
                <div style={{ background:C.greenFaint, border:`1px solid #86efac`, borderRadius:10, padding:'0.65rem 0.9rem', marginBottom:'0.75rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.green }}>
                  ✅ <strong>Payment confirmed!</strong> Your seat is locked in.
                </div>
              )}
              {payStatus === 'free' && (
                <div style={{ background:C.skyFaint, border:`1px solid ${C.border}`, borderRadius:10, padding:'0.65rem 0.9rem', marginBottom:'0.75rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.skyDeep }}>
                  🎁 Free session — your seat is confirmed!
                </div>
              )}
              {!isPast && (
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={() => onCancelReservation(r.id)} disabled={cancelBusy === r.id}
                    style={{ padding:'0.5rem 1rem', borderRadius:10, border:`1.5px solid ${C.borderFaint}`, background:C.white, color:C.red, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.78rem', cursor:'pointer' }}>
                    {cancelBusy === r.id ? 'Cancelling…' : '✕ Cancel Reservation'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── My Memberships Panel ──────────────────────────────────────────────────────
function MyMembershipsPanel({ memberships, loading }) {
  if (loading || !memberships.length) return null
  return (
    <div style={{ marginTop:'2rem', background:C.white, borderRadius:18, border:`1px solid ${C.borderFaint}`, padding:'1.4rem 1.75rem' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:C.textDark, marginBottom:'1rem' }}>
        My Group Memberships ({memberships.length})
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
        {memberships.map(m => (
          <div key={m.id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem',
            background:sectionGrad, border:`1px solid ${C.borderFaint}`, borderRadius:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:'1.3rem' }}>{m.community_groups?.emoji || '💙'}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:700, color:C.textDark }}>
                {m.community_groups?.name || '—'}
              </div>
              {m.payment_status === 'pending' && (
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', color:C.amber }}>
                  ⏳ Payment pending admin verification
                  {m.payment_reference && ` · Ref: ${m.payment_reference}`}
                </div>
              )}
            </div>
            <MembershipBadge status={m.payment_status} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Post Composer ─────────────────────────────────────────────────────────────
function PostComposer({ groups, onPost }) {
  const [content,     setContent]     = useState('')
  const [groupId,     setGroupId]     = useState(groups[0]?.id || '')
  const [anon,        setAnon]        = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [err,         setErr]         = useState('')

  useEffect(() => { if (groups.length && !groupId) setGroupId(groups[0].id) }, [groups])

  async function handleSubmit() {
    if (!content.trim() || !groupId) return
    setLoading(true); setErr('')
    try {
      const post = await onPost({ group_id:groupId, content, is_anonymous:anon, display_name:anon ? 'Anonymous' : displayName })
      if (post) setContent('')
    } catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ background:C.white, borderRadius:16, border:`1.5px solid ${C.borderFaint}`, padding:'1.25rem 1.5rem', marginBottom:'1.5rem' }}>
      <div style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color:C.textDark, marginBottom:'0.85rem' }}>✍️ Share with the Community</div>
      <div style={{ display:'flex', gap:'0.65rem', marginBottom:'0.75rem', flexWrap:'wrap' }}>
        <select value={groupId} onChange={e => setGroupId(e.target.value)}
          style={{ padding:'0.45rem 0.75rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:8, fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.textMid, outline:'none', background:C.white }}>
          {groups.map(g => <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}
        </select>
        <button onClick={() => setAnon(a => !a)}
          style={{ padding:'0.45rem 0.9rem', border:`1.5px solid ${anon ? C.skyBright : C.borderFaint}`, borderRadius:8, background:anon ? C.skyFainter : C.white, color:anon ? C.skyDeep : C.textLight, fontFamily:'var(--font-body)', fontSize:'0.78rem', fontWeight:700, cursor:'pointer' }}>
          {anon ? '🕵️ Anonymous' : '👤 Named'}
        </button>
        {!anon && (
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your display name"
            style={{ padding:'0.45rem 0.75rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:8, fontFamily:'var(--font-body)', fontSize:'0.82rem', outline:'none', flex:1, minWidth:140 }} />
        )}
      </div>
      <textarea value={content} onChange={e => setContent(e.target.value)}
        placeholder="Share your thoughts, experiences, or a question…" rows={3}
        style={{ width:'100%', padding:'0.75rem', border:`1.5px solid ${C.borderFaint}`, borderRadius:10, fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textDark, resize:'vertical', outline:'none', boxSizing:'border-box', lineHeight:1.65 }} />
      {err && <div style={{ color:C.red, fontFamily:'var(--font-body)', fontSize:'0.78rem', marginTop:'0.4rem' }}>{err}</div>}
      <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'0.65rem' }}>
        <button onClick={handleSubmit} disabled={!content.trim() || loading}
          style={{ padding:'0.6rem 1.4rem', borderRadius:10, border:'none', background:content.trim() ? btnGrad : C.borderFaint, color:content.trim() ? 'white' : C.textLight, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.85rem', cursor:content.trim() ? 'pointer' : 'not-allowed' }}>
          {loading ? 'Posting…' : '📤 Post'}
        </button>
      </div>
    </div>
  )
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post, onLike, likedIds, onDelete, canDelete }) {
  const liked = likedIds.has(post.id)
  const timeAgo = t => {
    const s = Math.floor((Date.now() - new Date(t)) / 1000)
    if (s < 60) return 'just now'
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  }
  return (
    <div style={{ background:C.white, borderRadius:14, padding:'1.4rem 1.5rem', border:`1px solid ${C.borderFaint}`, marginBottom:'0.85rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' }}>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <div style={{ width:34, height:34, borderRadius:'50%', background:C.skyFaint, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>
            {post.is_anonymous ? '🕵️' : '😊'}
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.82rem', color:C.textDark }}>{post.display_name}</div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:C.textLight }}>{post.community_groups?.emoji} {post.community_groups?.name} · {timeAgo(post.created_at)}</div>
          </div>
        </div>
        {canDelete && (
          <button onClick={() => onDelete(post.id)} style={{ background:'none', border:'none', color:C.textLight, cursor:'pointer', fontSize:'0.78rem' }}>🗑</button>
        )}
      </div>
      <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:C.textMid, lineHeight:1.7, margin:'0 0 1rem' }}>{post.content}</p>
      <button onClick={() => onLike(post.id)}
        style={{ border:'none', background:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.8rem', color:liked ? '#e53935' : C.textLight, display:'flex', alignItems:'center', gap:4 }}>
        {liked ? '❤️' : '🤍'} {post.like_count}
      </button>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function CommunityPage() {
  // FIX: useRouter provides navigate — no useNavigate import needed at all
  const { navigate }    = useRouter()
  const { user }        = useAuth()
  const { openPayment } = usePayment()

  const [activeTab,      setActiveTab]      = useState('groups')
  const [groups,         setGroups]         = useState([])
  const [sessions,       setSessions]       = useState([])
  const [posts,          setPosts]          = useState([])
  const [myGroupIds,     setMyGroupIds]     = useState(new Set())
  const [memberStatuses, setMemberStatuses] = useState({})
  const [mySessionIds,   setMySessionIds]   = useState(new Set())
  const [myReservations, setMyReservations] = useState([])
  const [myMemberships,  setMyMemberships]  = useState([])
  const [likedPostIds,   setLikedPostIds]   = useState(new Set())
  const [loading,        setLoading]        = useState({ groups:true, sessions:true, posts:true, myRes:false })
  const [toast,          setToast]          = useState(null)
  const [authGate,       setAuthGate]       = useState(false)
  const [actionBusy,     setActionBusy]     = useState(null)
  const [cancelBusy,     setCancelBusy]     = useState(null)
  const [totalMembers,   setTotalMembers]   = useState(0)

  const setL      = (k, v) => setLoading(l => ({ ...l, [k]:v }))
  const showToast = (emoji, msg, type = 'info') => setToast({ emoji, msg, type })

  // ── fetchers ───────────────────────────────────────────────────────────────
  const fetchGroups = useCallback(async () => {
    setL('groups', true)
    try {
      const d = await communityApi.groups()
      setGroups(d.groups || [])
      setTotalMembers((d.groups || []).reduce((s, g) => s + (g.member_count || 0), 0))
    } catch (e) { console.error('[fetchGroups error]', e) }
    finally { setL('groups', false) }
  }, [])

  const fetchSessions = useCallback(async () => {
    setL('sessions', true)
    try { const d = await communityApi.sessions(); setSessions(d.sessions || []) }
    catch {} finally { setL('sessions', false) }
  }, [])

  const fetchPosts = useCallback(async () => {
    setL('posts', true)
    try { const d = await communityApi.posts({ limit:30 }); setPosts(d.posts || []) }
    catch {} finally { setL('posts', false) }
  }, [])

  const fetchMyData = useCallback(async () => {
    if (!user) return
    setL('myRes', true)
    try {
      const [grpRes, resRes] = await Promise.allSettled([
        communityApi.myGroups(),
        apiFetch('/community/my-reservations'),
      ])

      if (grpRes.status === 'fulfilled') {
        const raw = grpRes.value
        const memberships = raw.memberships || raw.items || raw.groups || []
        let groupIds
        if (memberships.length) {
          groupIds = memberships.map(m => m.group_id || m.id).filter(Boolean)
        } else {
          groupIds = (raw.groupIds || raw.group_ids || []).filter(Boolean)
        }
        setMyGroupIds(new Set(groupIds))
        if (memberships.length) {
          setMyMemberships(memberships)
          const statuses = {}
          memberships.forEach(m => {
            const gid = m.group_id || m.id
            if (gid) statuses[gid] = m.payment_status || 'paid'
          })
          setMemberStatuses(statuses)
        } else if (groupIds.length) {
          const statuses = {}
          groupIds.forEach(id => { statuses[id] = 'paid' })
          setMemberStatuses(statuses)
        }
      } else {
        console.error('[Community] myGroups failed:', grpRes.reason)
      }

      if (resRes.status === 'fulfilled') {
        const reservations = resRes.value.reservations || resRes.value.items || []
        setMyReservations(reservations)
        setMySessionIds(new Set(reservations.map(r => r.session_id || r.group_session_id)))
      } else {
        console.error('[Community] my-reservations failed:', resRes.reason)
      }
    } catch (e) { console.error('[Community] fetchMyData error:', e) }
    finally { setL('myRes', false) }
  }, [user])

  useEffect(() => {
    fetchGroups(); fetchSessions(); fetchPosts(); fetchMyData()
  }, [fetchGroups, fetchSessions, fetchPosts, fetchMyData])

  // ── JOIN / LEAVE GROUP ─────────────────────────────────────────────────────
  async function handleJoinGroup(group) {
    if (!user) { setAuthGate(true); return }

    if (myGroupIds.has(group.id)) {
      if (!window.confirm(`Leave "${group.name}"? You will lose access to this group.`)) return
      setActionBusy(group.id)
      try {
        await communityApi.leaveGroup(group.id)
        setMyGroupIds(s => { const ns = new Set(s); ns.delete(group.id); return ns })
        setMemberStatuses(s => { const ns = { ...s }; delete ns[group.id]; return ns })
        showToast(group.emoji, `Left ${group.name}`)
        fetchGroups()
      } catch (e) { showToast('⚠️', e.message, 'error') }
      finally { setActionBusy(null) }
      return
    }

    const fee  = Number(group.membership_fee || 0)
    const free = isFreeGroup(group)

    if (free) {
      setActionBusy(group.id)
      try {
        await communityApi.joinGroup(group.id, {
          display_name:   user.fullName || user.full_name || 'Member',
          is_anonymous:   false,
          payment_status: 'free',
          payment_amount: 0,
        })
        setMyGroupIds(s => new Set([...s, group.id]))
        setMemberStatuses(s => ({ ...s, [group.id]: 'free' }))
        showToast(group.emoji, `Joined ${group.name}!`, 'success')
        fetchGroups()
      } catch (e) { showToast('⚠️', e.message, 'error') }
      finally { setActionBusy(null) }
      return
    }

    const result = await openPayment({
      type:            'appointment',
      amount:          fee,
      title:           `Join: ${group.name}`,
      description:     group.description,
      itemLines:       [{ label: `${group.name} membership`, amount: fee }],
      couponEnabled:   false,
      allowedGateways: ['esewa', 'khalti', 'fonepay', 'bank_transfer', 'cash'],
      metadata: {
        item_type:  'community_group_membership',
        group_id:   group.id,
        group_name: group.name,
      },
    })

    if (!result || result.cancelled || !result.success) return

    setActionBusy(group.id)
    try {
      const joinData = await communityApi.joinGroup(group.id, {
        display_name:      user.fullName || user.full_name || 'Member',
        is_anonymous:      false,
        payment_status:    'pending',
        payment_method:    result.method,
        payment_reference: result.transactionId || null,
        payment_amount:    fee,
        payment_id:        result.paymentId || null,
      })

      if (result.paymentId && (joinData?.membership?.id || joinData?.id)) {
        const membershipId = joinData?.membership?.id || joinData?.id
        await communityApi.linkMembershipPayment(membershipId, result.paymentId).catch(() => {})
      }

      setMyGroupIds(s => new Set([...s, group.id]))
      const instantGateways = ['esewa', 'khalti', 'fonepay']
      const newStatus = instantGateways.includes(result.method) ? 'paid' : 'pending'
      setMemberStatuses(s => ({ ...s, [group.id]: newStatus }))

      showToast(
        group.emoji,
        result.method === 'cash'
          ? `Membership pending! Bring NPR ${fee.toLocaleString()} cash. Admin will confirm.`
          : newStatus === 'paid'
            ? `Welcome to ${group.name}! Payment confirmed.`
            : `Membership submitted! Admin will verify your payment.`,
        'success'
      )
      fetchGroups(); fetchMyData()
    } catch (e) { showToast('⚠️', e.message, 'error') }
    finally { setActionBusy(null) }
  }

  // ── RESERVE / CANCEL SESSION ───────────────────────────────────────────────
  async function handleReserveSession(session) {
    if (!user) { setAuthGate(true); return }

    const free = isFreeSession(session)

    if (free) {
      setActionBusy(session.id)
      try {
        await apiFetch(`/community/sessions/${session.id}/reserve`, {
          method: 'POST',
          body: JSON.stringify({
            display_name:      user.fullName || user.full_name || 'Member',
            is_anonymous:      false,
            payment_method:    'free',
            payment_reference: null,
            payment_status:    'free',
            payment_amount:    0,
          }),
        })
        setMySessionIds(s => new Set([...s, session.id]))
        showToast('✅', `Free spot reserved for "${session.title}"!`, 'success')
        fetchSessions(); fetchMyData()
      } catch (e) {
        showToast('⚠️', e.message || 'Reservation failed.', 'error')
      } finally { setActionBusy(null) }
      return
    }

    const price = Number(session.price)
    if (!price || isNaN(price) || price <= 0) {
      showToast('⚠️', 'This session has no valid price configured. Please contact support.', 'error')
      return
    }

    const result = await openPayment({
      type:            'appointment',
      amount:          price,
      title:           session.title,
      description:     `${fmtDate(session.scheduled_at)} · ${session.mode} · ${session.facilitator}`,
      itemLines:       [{ label: session.title, amount: price }],
      couponEnabled:   false,
      allowedGateways: ['esewa', 'khalti', 'fonepay', 'bank_transfer', 'cash'],
      metadata: {
        item_type:     'community_session',
        session_id:    session.id,
        session_title: session.title,
        facilitator:   session.facilitator,
        mode:          session.mode,
      },
    })

    if (!result || result.cancelled || !result.success) return

    setActionBusy(session.id)
    try {
      await apiFetch(`/community/sessions/${session.id}/reserve`, {
        method: 'POST',
        body: JSON.stringify({
          display_name:      user.fullName || user.full_name || 'Member',
          is_anonymous:      false,
          payment_method:    result.method,
          payment_reference: result.transactionId || null,
          payment_status:    'pending',
          payment_amount:    price,
          payment_id:        result.paymentId || null,
        }),
      })
      setMySessionIds(s => new Set([...s, session.id]))
      showToast(
        '⏳',
        result.method === 'cash'
          ? `Spot held! Bring NPR ${price.toLocaleString()} cash. Admin will confirm.`
          : `Reserved! Admin will verify your payment shortly.`,
        'success'
      )
      fetchSessions(); fetchMyData()
    } catch (e) {
      showToast('⚠️', e.message || 'Reservation failed.', 'error')
    } finally { setActionBusy(null) }
  }

  async function handleCancelReservation(reservationId) {
    if (!window.confirm('Cancel this reservation?')) return
    setCancelBusy(reservationId)
    try {
      await apiFetch(`/community/reservations/${reservationId}`, { method:'DELETE' })
      const removed = myReservations.find(r => r.id === reservationId)
      setMyReservations(rs => rs.filter(r => r.id !== reservationId))
      if (removed) {
        const sid = removed.session_id || removed.group_session_id
        setMySessionIds(s => { const ns = new Set(s); ns.delete(sid); return ns })
      }
      showToast('❌', 'Reservation cancelled.')
      fetchSessions()
    } catch (e) { showToast('⚠️', e.message, 'error') }
    finally { setCancelBusy(null) }
  }

  // ── POSTS ──────────────────────────────────────────────────────────────────
  async function handlePost(body) {
    const d = await communityApi.createPost(body)
    if (d.post) { setPosts(p => [d.post, ...p]); showToast('✍️', 'Post shared!', 'success') }
    return d.post
  }
  async function handleLike(postId) {
    try {
      const d = await communityApi.likePost(postId, {})
      setLikedPostIds(s => { const ns = new Set(s); if (d.liked) ns.add(postId); else ns.delete(postId); return ns })
      setPosts(ps => ps.map(p => p.id === postId ? { ...p, like_count: p.like_count + (d.liked ? 1 : -1) } : p))
    } catch {}
  }
  async function handleDeletePost(postId) {
    if (!confirm('Delete this post?')) return
    try { await communityApi.deletePost(postId); setPosts(ps => ps.filter(p => p.id !== postId)) }
    catch (e) { showToast('⚠️', e.message, 'error') }
  }

  const tabs = [
    ['groups',        'Support Groups'],
    ['announcements', 'Group Sessions'],
    ['feed',          'Recent Posts'],
  ]

  return (
    <div className="page-wrapper">
      <style>{`
        .community-groups-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
        @media(max-width:1024px) { .community-groups-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:600px)  { .community-groups-grid { grid-template-columns:1fr; } }
        .community-group-card { display:flex; flex-direction:column; }
        .session-card { transition:box-shadow 0.2s, transform 0.2s; }
        .session-card:hover { box-shadow:0 8px 32px rgba(0,191,255,0.12); transform:translateY(-2px); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── Hero ── */}
      <div className="page-hero" style={{ background:'var(--sky-light)' }}>
        <span className="section-tag">Community</span>
        <h1 className="section-title">You Are Not <em>Alone</em></h1>
        <p className="section-desc">Connect with peers, share your journey, and find support in moderated community spaces.</p>
        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem', alignItems:'center', flexWrap:'wrap' }}>
          <span style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:'var(--text-mid)' }}>
            <strong>{totalMembers.toLocaleString()}+ members</strong> actively supporting each other
          </span>
          {!user && (
            <button onClick={() => navigate('/signin')}
              style={{ padding:'0.45rem 1rem', borderRadius:100, border:`1.5px solid var(--sky)`, background:'var(--sky-faint)', color:'var(--sky)', fontFamily:'var(--font-body)', fontSize:'0.78rem', fontWeight:700, cursor:'pointer' }}>
              🔑 Sign in to join groups
            </button>
          )}
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--blue-pale)', padding:'0 1rem', display:'flex', gap:0, overflowX:'auto' }}>
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)}
            style={{ padding:'1rem 1.25rem', border:'none', background:'none', fontFamily:'var(--font-body)', fontSize:'0.85rem', fontWeight:activeTab === id ? 700 : 500, color:activeTab === id ? 'var(--sky)' : 'var(--text-light)', borderBottom:activeTab === id ? '2.5px solid var(--sky)' : '2.5px solid transparent', cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap', position:'relative' }}>
            {label}
            {id === 'my_reservations' && myReservations.some(r => r.payment_status === 'pending') && (
              <span style={{ position:'absolute', top:8, right:4, width:7, height:7, borderRadius:'50%', background:C.amber }} />
            )}
          </button>
        ))}
      </div>

      <div className="section" style={{ background:'var(--off-white)', paddingTop:'3rem' }}>

        {/* ════ GROUPS TAB ════ */}
        {activeTab === 'groups' && (
          <div>
            <div style={{ background:'rgba(0,191,255,0.08)', border:'1px solid var(--blue-pale)', borderRadius:'var(--radius-md)', padding:'1rem 1.5rem', marginBottom:'2rem', display:'flex', gap:'0.75rem', alignItems:'center' }}>
              <span style={{ fontSize:'1.2rem' }}>🛡️</span>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:'var(--blue-deep)', margin:0 }}>
                All community spaces are <strong>moderated by licensed professionals</strong>. Anonymous participation is supported.
              </p>
            </div>

            {loading.groups ? (
              <div style={{ textAlign:'center', padding:'3rem', color:C.textLight, fontFamily:'var(--font-body)' }}>Loading groups…</div>
            ) : (
              <div className="community-groups-grid">
                {groups.map(g => {
                  const isJoined     = myGroupIds.has(g.id)
                  const memberStatus = memberStatuses[g.id]
                  const free         = isFreeGroup(g)
                  const fee          = Number(g.membership_fee || 0)
                  const isBusy       = actionBusy === g.id
                  const nextSession  = g.next_session_at ? fmtShortDate(g.next_session_at) : null
                  const groupSess    = sessions.filter(s => s.group_id === g.id || s.community_groups?.id === g.id)
                  const soonest      = groupSess
                    .filter(s => s.scheduled_at && new Date(s.scheduled_at) > new Date())
                    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0]

                  const btnLabel = isBusy
                    ? '…'
                    : isJoined && memberStatus === 'pending'
                      ? '⏳ Pending — Click to Leave'
                      : isJoined
                        ? '✓ Joined — Click to Leave'
                        : free
                          ? '🤝 Join Group (Free)'
                          : `💳 Join — NPR ${fee.toLocaleString()}`

                  const btnBg     = isJoined ? (memberStatus === 'pending' ? C.amberFaint : C.skyFaint) : (free ? C.green : btnGrad)
                  const btnColor  = isJoined ? (memberStatus === 'pending' ? C.amber : C.skyDeep) : 'white'
                  const btnBorder = isJoined ? (memberStatus === 'pending' ? C.amber : C.skyBright) : (free ? C.green : C.skyDeep)

                  return (
                    <div key={g.id} className="community-group-card"
                      style={{ background: isJoined ? C.skyFainter : 'var(--white)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:`1.5px solid ${isJoined ? C.skyBright : 'var(--blue-pale)'}`, boxShadow: isJoined ? `0 4px 20px rgba(0,191,255,0.12)` : 'var(--shadow-soft)', transition:'all 0.25s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ background: isJoined ? `linear-gradient(135deg,${C.skyFaint},${C.skyFainter})` : (g.color && !g.color.startsWith('var(') ? g.color : C.skyFaint), padding:'1.5rem', fontSize:'2.5rem', textAlign:'center', position:'relative' }}>
                        {g.emoji}
                        {isJoined && memberStatus === 'pending' && (
                          <div style={{ position:'absolute', top:10, right:10, background:`linear-gradient(135deg,${C.amber},#fbbf24)`, borderRadius:100, padding:'3px 10px', fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:'white' }}>⏳ PENDING</div>
                        )}
                        {isJoined && memberStatus !== 'pending' && (
                          <div style={{ position:'absolute', top:10, right:10, background:btnGrad, borderRadius:100, padding:'3px 10px', fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:'white' }}>✓ JOINED</div>
                        )}
                        {!free && (
                          <div style={{ position:'absolute', top:10, left:10, background:'rgba(0,0,0,0.45)', borderRadius:100, padding:'3px 10px', fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:'white' }}>NPR {fee.toLocaleString()}</div>
                        )}
                      </div>

                      <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.4rem' }}>
                          <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--blue-deep)', margin:0 }}>{g.name}</h3>
                          {!free && (
                            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', fontWeight:700, color:C.skyDeep }}>
                              NPR {fee.toLocaleString()}{g.membership_period && g.membership_period !== 'one_time' ? `/${g.membership_period}` : ''}
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'var(--text-light)', lineHeight:1.6, marginBottom:'0.75rem' }}>{g.description}</p>
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:'0.75rem' }}>
                          {(g.tags || []).map((t, j) => (
                            <span key={j} className="tag" style={{ fontSize:'0.65rem' }}>{t}</span>
                          ))}
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', marginBottom:'0.9rem' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color:'var(--text-light)' }}>👥 {g.member_count || 0} members</span>
                            {isJoined && memberStatus && <MembershipBadge status={memberStatus} />}
                          </div>
                          {soonest && soonest.max_spots > 0 && (
                            <SeatBar booked={soonest.reserved_count || 0} total={soonest.max_spots} compact />
                          )}
                          {(nextSession || soonest) ? (
                            <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', padding:'0.4rem 0.65rem', background:C.skyFainter, border:`1px solid ${C.borderFaint}`, borderRadius:8 }}>
                              <span style={{ fontSize:'0.75rem' }}>📅</span>
                              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:C.skyDeep, fontWeight:700 }}>
                                Next: {nextSession || fmtDate(soonest.scheduled_at)}
                              </span>
                            </div>
                          ) : (
                            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:C.textLight, fontStyle:'italic' }}>No upcoming sessions scheduled</div>
                          )}
                        </div>
                        <div style={{ flex:1 }} />
                        <button onClick={() => handleJoinGroup(g)}
                          style={{ width:'100%', padding:'0.7rem', borderRadius:12, border:`1.5px solid ${btnBorder}`, background:btnBg, color:btnColor, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', opacity:isBusy ? 0.65 : 1, transition:'all 0.2s' }}>
                          {isBusy
                            ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                                <span style={{ width:13, height:13, borderRadius:'50%', border:`2px solid rgba(255,255,255,0.4)`, borderTopColor:'currentColor', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                                Please wait…
                              </span>
                            : btnLabel
                          }
                        </button>
                        {isJoined && memberStatus === 'pending' && (
                          <div style={{ marginTop:'0.6rem', fontFamily:'var(--font-body)', fontSize:'0.72rem', color:C.amber, textAlign:'center', lineHeight:1.5 }}>
                            ⏳ Awaiting admin verification. Full access granted once confirmed.
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <MyMembershipsPanel memberships={myMemberships} loading={loading.myRes} />
          </div>
        )}

        {/* ════ SESSIONS TAB ════ */}
        {activeTab === 'announcements' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)' }}>Upcoming Group Therapy Sessions</div>
            </div>
            {loading.sessions ? (
              <div style={{ textAlign:'center', padding:'3rem', color:C.textLight, fontFamily:'var(--font-body)' }}>Loading sessions…</div>
            ) : sessions.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:C.textLight, fontFamily:'var(--font-body)' }}>No upcoming sessions scheduled.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
                {sessions.map(s => {
                  const reserved     = mySessionIds.has(s.id)
                  const full         = s.is_full || (s.spots_left != null && s.spots_left <= 0)
                  const free         = isFreeSession(s)
                  const isBusy       = actionBusy === s.id
                  const myRes        = myReservations.find(r => (r.session_id || r.group_session_id) === s.id)
                  const payStatus    = free ? 'free' : (myRes?.payment_status || null)
                  const sessionPrice = Number(s.price || 0)

                  const btnLabel = isBusy
                    ? '…'
                    : reserved
                      ? '✓ Reserved — Click to Cancel'
                      : full
                        ? 'Session Full'
                        : free
                          ? '✅ Reserve Free Spot'
                          : `💳 Reserve & Pay — NPR ${sessionPrice.toLocaleString()}`

                  const btnBg     = reserved ? C.skyFaint : full ? C.borderFaint : btnGrad
                  const btnColor  = reserved ? C.skyDeep  : full ? C.textLight   : 'white'
                  const btnBorder = reserved ? C.skyBright : full ? C.borderFaint : 'transparent'

                  return (
                    <div key={s.id} className="session-card"
                      style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', border:`1.5px solid ${reserved ? C.green + '66' : 'var(--blue-pale)'}`, boxShadow:'var(--shadow-soft)', overflow:'hidden' }}>
                      <div style={{ height:3, background: reserved ? `linear-gradient(90deg,${C.green},#4ade80)` : full ? `linear-gradient(90deg,#ccc,#ddd)` : btnGrad }} />
                      <div style={{ padding:'1.75rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom:'1rem' }}>
                          <div style={{ flex:1, minWidth:200 }}>
                            <div style={{ display:'flex', gap:'0.6rem', alignItems:'center', flexWrap:'wrap', marginBottom:'0.5rem' }}>
                              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--blue-deep)', margin:0 }}>{s.title}</h3>
                              {free ? (
                                <span style={{ padding:'0.15rem 0.55rem', borderRadius:100, background:C.greenFaint, color:C.green, fontSize:'0.65rem', fontWeight:800 }}>FREE</span>
                              ) : (
                                <span style={{ padding:'0.15rem 0.55rem', borderRadius:100, background:C.skyFaint, color:C.skyDeep, fontSize:'0.72rem', fontWeight:800 }}>NPR {sessionPrice.toLocaleString()}</span>
                              )}
                              {reserved && payStatus && <PayBadge status={payStatus} />}
                            </div>
                            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'var(--text-light)' }}>📅 {fmtDate(s.scheduled_at)}</span>
                              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'var(--text-light)' }}>💻 {s.mode}</span>
                              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'var(--text-light)' }}>👤 {s.facilitator}</span>
                              {s.community_groups && (
                                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.skyDeep }}>{s.community_groups.emoji} {s.community_groups.name}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <SeatBar booked={s.reserved_count || 0} total={s.max_spots || 0} />
                        {reserved && payStatus === 'pending' && (
                          <div style={{ background:C.amberFaint, border:`1px solid #f5d87a`, borderRadius:10, padding:'0.65rem 0.9rem', marginBottom:'0.85rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.amber }}>
                            ⏳ Awaiting admin payment verification.
                            {myRes?.payment_reference && <> Ref: <code style={{ background:'rgba(0,0,0,0.07)', padding:'0.1rem 0.35rem', borderRadius:4 }}>{myRes.payment_reference}</code></>}
                          </div>
                        )}
                        <button
                          onClick={() => {
                            if (isBusy) return
                            if (reserved) { if (myRes) handleCancelReservation(myRes.id) }
                            else if (!full) { handleReserveSession(s) }
                          }}
                          style={{ width:'100%', padding:'0.72rem', borderRadius:10, border:`1.5px solid ${btnBorder}`, background:btnBg, color:btnColor, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.88rem', cursor: full && !reserved ? 'not-allowed' : 'pointer', opacity:isBusy ? 0.65 : 1, transition:'all 0.2s' }}>
                          {isBusy
                            ? <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                                <span style={{ width:14, height:14, borderRadius:'50%', border:`2px solid rgba(255,255,255,0.4)`, borderTopColor:'currentColor', display:'inline-block', animation:'spin 0.7s linear infinite' }} />
                                Please wait…
                              </span>
                            : btnLabel
                          }
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ════ MY RESERVATIONS TAB ════ */}
        {activeTab === 'my_reservations' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)' }}>My Session Reservations</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.textLight, marginTop:'0.25rem' }}>Track bookings and payment status</div>
              </div>
              <button onClick={fetchMyData}
                style={{ padding:'0.5rem 0.85rem', borderRadius:10, border:`1.5px solid ${C.borderFaint}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontSize:'0.8rem', cursor:'pointer' }}>
                🔄 Refresh
              </button>
            </div>
            {!user ? (
              <div style={{ textAlign:'center', padding:'3rem', background:C.white, borderRadius:18, border:`1px solid ${C.borderFaint}` }}>
                <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🔐</div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:C.textDark, marginBottom:'1.5rem' }}>Sign in to view your reservations</div>
                <button onClick={() => navigate('/signin')}
                  style={{ padding:'0.75rem 1.75rem', borderRadius:12, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, cursor:'pointer' }}>
                  🔑 Sign In
                </button>
              </div>
            ) : (
              <>
                {myReservations.length > 0 && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'0.75rem', marginBottom:'1.5rem' }}>
                    {[
                      { label:'Total Booked', val:myReservations.length,                                                        bg:C.skyFainter, c:C.skyDeep },
                      { label:'Confirmed',    val:myReservations.filter(r => ['paid','free'].includes(r.payment_status)).length, bg:C.greenFaint, c:C.green   },
                      { label:'Pending Pay',  val:myReservations.filter(r => r.payment_status === 'pending').length,            bg:C.amberFaint, c:C.amber   },
                    ].map((stat, i) => (
                      <div key={i} style={{ background:stat.bg, borderRadius:12, padding:'0.9rem', border:`1px solid ${C.borderFaint}`, textAlign:'center' }}>
                        <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:stat.c, fontWeight:700 }}>{stat.val}</div>
                        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', color:C.textLight, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', marginTop:'0.2rem' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                <MyReservationsPanel
                  reservations={myReservations}
                  loading={loading.myRes}
                  onCancelReservation={handleCancelReservation}
                  cancelBusy={cancelBusy}
                />
              </>
            )}
          </div>
        )}

        {/* ════ FEED TAB ════ */}
        {activeTab === 'feed' && (
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', marginBottom:'1.25rem' }}>Community Feed</div>
            <div style={{ background:'rgba(0,191,255,0.06)', border:'1px solid var(--blue-pale)', borderRadius:'var(--radius-md)', padding:'1rem 1.5rem', marginBottom:'1.5rem', fontSize:'0.82rem', color:'var(--blue-mid)' }}>
              💡 All posts are anonymous by default. Please be kind and supportive.
            </div>
            <PostComposer groups={groups} onPost={handlePost} />
            {loading.posts ? (
              <div style={{ textAlign:'center', padding:'3rem', color:C.textLight, fontFamily:'var(--font-body)' }}>Loading posts…</div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign:'center', padding:'3rem', color:C.textLight, fontFamily:'var(--font-body)' }}>No posts yet. Be the first to share!</div>
            ) : posts.map(p => (
              <PostCard
                key={p.id}
                post={p}
                onLike={handleLike}
                likedIds={likedPostIds}
                onDelete={handleDeletePost}
                canDelete={user && (p.user_id === user?.sub || ['admin','staff'].includes(user?.role))}
              />
            ))}
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      {authGate && (
        <AuthGateModal
          onLogin={() => { setAuthGate(false); navigate('/signin') }}
          onClose={() => setAuthGate(false)}
        />
      )}
      {toast && (
        <Toast emoji={toast.emoji} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
