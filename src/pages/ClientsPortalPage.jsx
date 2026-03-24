// src/pages/ClientsPortalPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'
import { appointments, wellness, notifications } from '../services/api'

const TABS  = ['Overview','Appointments','Mood Diary','Journal','Notifications','Messages']
const MOODS = ['😞','😔','😐','🙂','😊','😄','🤩']

// ── Messaging contact info ────────────────────────────────────
const CONTACT_INFO = {
  whatsapp: {
    number: '+977 9849350088',
    link: 'https://wa.me/9779849350088',
    label: 'WhatsApp',
    emoji: '💬',
    color: '#25D366',
    faint: '#e8fdf0',
    instructions: 'Tap the button below to open WhatsApp, or copy the number to message us directly.',
  },
  messenger: {
    number: 'puja.samargi',
    link: 'https://m.me/puja.samargi',
    label: 'Messenger',
    emoji: '💙',
    color: '#0084FF',
    faint: '#e0f0ff',
    instructions: 'Tap the button below to open Messenger, or search for our page @puja.samargi.',
  },
}

// ── Journal entry modal ───────────────────────────────────────
function JournalModal({ entry, onClose }) {
  if (!entry) return null
  const fmtFull = d => new Date(d).toLocaleDateString('en-US', {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  })
  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
      zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
      padding:'1rem'
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background:'#fff', borderRadius:18, padding:'2rem',
        maxWidth:620, width:'100%', maxHeight:'85vh',
        overflowY:'auto', boxShadow:'0 24px 64px rgba(0,0,0,0.18)',
        position:'relative'
      }}>
        <button onClick={onClose} style={{
          position:'absolute', top:'1rem', right:'1rem',
          border:'none', background:'#f0f4f8', borderRadius:'50%',
          width:32, height:32, cursor:'pointer', fontSize:'1rem',
          display:'flex', alignItems:'center', justifyContent:'center'
        }}>✕</button>

        <div style={{ fontSize:'0.75rem', color:'#7a9aaa', fontWeight:700,
          textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.5rem' }}>
          {fmtFull(entry.created_at)}
        </div>

        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem',
          color:'#1a3a4a', margin:'0 0 1rem' }}>
          {entry.title || 'Untitled Entry'}
        </h2>

        {entry.mood_score && (
          <div style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem',
            background:'#e0f7ff', color:'#007BA8', borderRadius:100,
            padding:'0.25rem 0.75rem', fontSize:'0.8rem', fontWeight:700,
            marginBottom:'1.25rem' }}>
            {MOODS[Math.min(entry.mood_score-1, MOODS.length-1)]} Mood: {entry.mood_score}/10
          </div>
        )}

        {entry.tags?.length > 0 && (
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
            {entry.tags.map((tag, i) => (
              <span key={i} style={{ background:'#f0f4f8', color:'#2e6080',
                borderRadius:100, padding:'0.2rem 0.65rem', fontSize:'0.75rem',
                fontWeight:600 }}>#{tag}</span>
            ))}
          </div>
        )}

        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.95rem',
          lineHeight:1.85, color:'#2e6080', whiteSpace:'pre-wrap',
          background:'#f8fbfc', borderRadius:10, padding:'1.25rem',
          border:'1px solid #daeef8' }}>
          {entry.content}
        </div>
      </div>
    </div>
  )
}

// ── Messaging Panel ───────────────────────────────────────────
function MessagingPanel() {
  const [copied, setCopied] = useState('')

  function copyToClipboard(text, key) {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(''), 2500)
  }

  return (
    <div>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem',
        color:'var(--blue-deep)', marginBottom:'0.4rem' }}>Message Us</h2>
      <p style={{ fontSize:'0.85rem', color:'var(--text-light)', marginBottom:'2rem', lineHeight:1.65 }}>
        Reach out via WhatsApp or Messenger — we typically respond within a few hours during business hours.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.25rem' }}>
        {Object.entries(CONTACT_INFO).map(([key, info]) => (
          <div key={key} style={{
            background:'var(--white)', borderRadius:16,
            border:'1.5px solid var(--blue-pale)', overflow:'hidden',
            boxShadow:'0 4px 20px rgba(0,191,255,0.06)',
            transition:'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,191,255,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 20px rgba(0,191,255,0.06)' }}>

            {/* Card header */}
            <div style={{
              background: info.faint,
              borderBottom: `1.5px solid ${info.color}22`,
              padding: '1.5rem 1.5rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.85rem'
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: info.color, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', flexShrink: 0,
                boxShadow: `0 4px 14px ${info.color}44`
              }}>{info.emoji}</div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem',
                  color:'var(--blue-deep)', fontWeight:700 }}>{info.label}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-light)', marginTop:2 }}>
                  {info.instructions}
                </div>
              </div>
            </div>

            {/* Contact detail */}
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ fontSize:'0.65rem', fontWeight:800, color:'var(--text-light)',
                textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.5rem' }}>
                {key === 'whatsapp' ? 'Phone Number' : 'Page Handle'}
              </div>
              <div style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                background:'#f8fafc', borderRadius:10, padding:'0.65rem 0.85rem',
                border:'1px solid var(--blue-pale)', marginBottom:'1.1rem', gap:'0.75rem'
              }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem',
                  color:'var(--blue-deep)', fontWeight:700, letterSpacing:'0.03em' }}>
                  {info.number}
                </span>
                <button
                  onClick={() => copyToClipboard(info.number, key)}
                  style={{
                    padding:'0.3rem 0.8rem', borderRadius:7,
                    border: `1.5px solid ${copied === key ? '#22c55e' : 'var(--blue-pale)'}`,
                    background: copied === key ? '#e8fdf0' : 'var(--white)',
                    color: copied === key ? '#065f46' : 'var(--text-mid)',
                    fontSize:'0.74rem', fontWeight:700, cursor:'pointer',
                    transition:'all 0.18s', whiteSpace:'nowrap',
                    fontFamily:'var(--font-body)'
                  }}>
                  {copied === key ? '✓ Copied' : '⎘ Copy'}
                </button>
              </div>

              {/* Open app button */}
              <a href={info.link} target="_blank" rel="noopener noreferrer"
                style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
                  width:'100%', padding:'0.8rem 1rem',
                  background: info.color,
                  color:'white', borderRadius:10, border:'none',
                  fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.9rem',
                  cursor:'pointer', textDecoration:'none',
                  boxShadow:`0 4px 14px ${info.color}44`, transition:'opacity 0.18s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                {info.emoji} Open {info.label}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Office hours note */}
      <div style={{
        marginTop:'2rem', background:'var(--off-white)',
        borderRadius:12, padding:'1.25rem 1.5rem',
        border:'1px solid var(--earth-cream)',
        display:'flex', alignItems:'flex-start', gap:'0.75rem'
      }}>
        <span style={{ fontSize:'1.2rem', flexShrink:0, marginTop:2 }}>🕐</span>
        <div>
          <div style={{ fontWeight:700, color:'var(--blue-deep)', fontSize:'0.88rem', marginBottom:'0.3rem' }}>
            Response Hours
          </div>
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

export default function ClientPortalPage() {
  const { navigate }     = useRouter()
  const { user, logout } = useAuth()
  const [tab, setTab]    = useState('Overview')

  const [stats,     setStats]     = useState(null)
  const [moodToday, setMoodToday] = useState(null)
  const [moodSaved, setMoodSaved] = useState(false)

  const [upcoming,      setUpcoming]      = useState([])
  const [past,          setPast]          = useState([])
  const [loadingAppts,  setLoadingAppts]  = useState(false)

  const [moodLogs, setMoodLogs] = useState([])

  const [entries,     setEntries]     = useState([])
  const [newEntry,    setNewEntry]    = useState({ title:'', content:'' })
  const [savingEntry, setSavingEntry] = useState(false)
  const [openEntry,   setOpenEntry]   = useState(null)

  const [notifs,       setNotifs]       = useState([])
  const [unreadCount,  setUnreadCount]  = useState(0)

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    loadOverview()
  }, [user])

  useEffect(() => {
    if (tab === 'Appointments')  loadAppointments()
    if (tab === 'Mood Diary')    loadMoodLogs()
    if (tab === 'Journal')       loadJournal()
    if (tab === 'Notifications') loadNotifications()
  }, [tab])

  async function loadOverview() {
    try {
      const [apptRes, moodRes] = await Promise.all([
        appointments.list({ limit:5, status:'confirmed' }),
        wellness.getMoodLogs({ limit:7 }),
      ])
      const up      = apptRes.appointments?.filter(a => new Date(a.scheduled_at) >= new Date()) || []
      const moodAvg = moodRes.logs?.reduce((s,l) => s + l.mood_score, 0) / (moodRes.logs?.length || 1)
      setStats({
        sessions:    apptRes.pagination?.total || 0,
        nextSession: up[0] ? new Date(up[0].scheduled_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—',
        moodAvg:     moodAvg ? moodAvg.toFixed(1) : '—',
        streak:      moodRes.logs?.length || 0,
      })
    } catch {}
  }

  async function loadAppointments() {
    setLoadingAppts(true)
    try {
      const res = await appointments.list({ limit:20 })
      const all = res.appointments || []
      setUpcoming(all.filter(a => ['pending','confirmed'].includes(a.status)))
      setPast(all.filter(a => ['completed','cancelled'].includes(a.status)))
    } catch {} finally { setLoadingAppts(false) }
  }

  async function loadMoodLogs() {
    try { const res = await wellness.getMoodLogs({ limit:14 }); setMoodLogs(res.logs || []) } catch {}
  }

  async function loadJournal() {
    try { const res = await wellness.getJournal({ limit:20 }); setEntries(res.entries || []) } catch {}
  }

  async function loadNotifications() {
    try {
      const res = await notifications.list({ limit:20 })
      setNotifs(res.notifications || [])
      setUnreadCount(res.unreadCount || 0)
    } catch {}
  }

  async function saveMood(idx) {
    setMoodToday(idx)
    try {
      await wellness.addMoodLog({ moodScore: idx + 1, emotions:[], notes:'' })
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

  // Badge label for tab
  function tabLabel(t) {
    if (t === 'Notifications' && unreadCount > 0) return `${t} (${unreadCount})`
    return t
  }

  return (
    <div className="page-wrapper" style={{ background:'var(--off-white)', minHeight:'100vh' }}>

      <JournalModal entry={openEntry} onClose={() => setOpenEntry(null)} />

      {/* Header */}
      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--blue-pale)',
        padding:'1.25rem clamp(1rem,4vw,2rem)', display:'flex',
        alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.1rem,4vw,1.4rem)', color:'var(--blue-deep)' }}>
            Welcome back, <em>{user?.fullName?.split(' ')[0] || 'there'}</em> 👋
          </div>
          <div style={{ fontSize:'0.82rem', color:'var(--text-light)', marginTop:2 }}>
            {stats?.nextSession !== '—' ? `Next session: ${stats?.nextSession}` : 'No upcoming sessions'}
          </div>
        </div>
        <button onClick={logout} style={{ padding:'0.45rem 1rem', borderRadius:8,
          border:'1px solid var(--earth-cream)', background:'none',
          fontSize:'0.82rem', color:'var(--text-light)', cursor:'pointer' }}>
          🚪 Log Out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--blue-pale)',
        padding:'0 clamp(0.5rem,4vw,2rem)', display:'flex', gap:0,
        overflowX:'auto', scrollbarWidth:'none' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'0.9rem clamp(0.65rem,2vw,1.25rem)', border:'none',
            background:'none', fontFamily:'var(--font-body)', fontSize:'0.85rem',
            fontWeight: tab===t ? 700 : 500,
            color: tab===t ? 'var(--sky)' : 'var(--text-light)',
            borderBottom: tab===t ? '2.5px solid var(--sky)' : '2.5px solid transparent',
            cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}>
            {tabLabel(t)}
          </button>
        ))}
      </div>

      <div style={{ padding:'clamp(1rem,4vw,2rem)', maxWidth:1100, margin:'0 auto' }}>

        {/* ── OVERVIEW ── */}
        {tab === 'Overview' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
              gap:'1rem', marginBottom:'2rem' }}>
              {[
                { label:'Sessions Completed', val:stats?.sessions??'…',         icon:'✅', color:'var(--sky-light)' },
                { label:'Next Appointment',   val:stats?.nextSession??'…',      icon:'📅', color:'var(--green-mist)' },
                { label:'Log Streak',         val:`${stats?.streak??'…'} days`, icon:'🔥', color:'#fff5e6' },
                { label:'Avg Mood (7 days)',  val:stats?.moodAvg??'…',          icon:'😊', color:'var(--blue-mist)' },
              ].map((c,i) => (
                <div key={i} style={{ background:c.color, borderRadius:'var(--radius-md)',
                  padding:'1.25rem', border:'1px solid var(--blue-pale)' }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:'0.4rem' }}>{c.icon}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--blue-deep)' }}>{c.val}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-light)', fontWeight:600 }}>{c.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background:'var(--white)', borderRadius:'var(--radius-lg)',
              padding:'2rem', border:'1px solid var(--blue-pale)', marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem',
                color:'var(--blue-deep)', marginBottom:'1rem' }}>How are you feeling today?</div>
              <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
                {MOODS.map((e,i) => (
                  <button key={i} onClick={() => saveMood(i)} style={{
                    fontSize:'1.8rem', padding:'0.5rem',
                    border:`2px solid ${moodToday===i?'var(--sky)':'var(--blue-pale)'}`,
                    borderRadius:'var(--radius-sm)',
                    background: moodToday===i ? 'var(--sky-light)' : 'var(--off-white)',
                    cursor:'pointer', transition:'all 0.2s' }}>{e}</button>
                ))}
              </div>
              {moodSaved && <p style={{ marginTop:'0.75rem', color:'var(--green-deep)',
                fontSize:'0.85rem', fontWeight:600 }}>✓ Mood logged. Keep it up!</p>}
            </div>

            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <button className="btn btn-primary" onClick={() => navigate('/book')}>Book New Session</button>
              <button className="btn btn-outline" onClick={() => setTab('Mood Diary')}>Mood Diary →</button>
              <button className="btn btn-outline" onClick={() => setTab('Journal')}>Journal →</button>
              <button className="btn btn-outline" onClick={() => setTab('Messages')}>💬 Message Us →</button>
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS ── */}
        {tab === 'Appointments' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem',
                color:'var(--blue-deep)', margin:0 }}>Upcoming Sessions</h2>
              <button className="btn btn-primary"
                style={{ fontSize:'0.82rem', padding:'0.5rem 1rem' }}
                onClick={() => navigate('/book')}>+ Book New</button>
            </div>

            {loadingAppts
              ? <p style={{ color:'var(--text-light)' }}>Loading…</p>
              : upcoming.length === 0
              ? (
                <div style={{ background:'var(--white)', borderRadius:'var(--radius-md)',
                  padding:'2rem', textAlign:'center', border:'1px solid var(--blue-pale)', marginBottom:'2rem' }}>
                  <p style={{ color:'var(--text-light)', marginBottom:'1rem' }}>No upcoming appointments.</p>
                  <button className="btn btn-primary" onClick={() => navigate('/book')}>Book Your First Session →</button>
                </div>
              )
              : upcoming.map((a,i) => (
                <div key={i} style={{ background:'var(--white)', borderRadius:'var(--radius-md)',
                  padding:'1.25rem 1.5rem', border:'1px solid var(--blue-pale)',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  marginBottom:'0.75rem', flexWrap:'wrap', gap:'1rem' }}>
                  <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
                    <div style={{ width:48, height:48, borderRadius:'50%',
                      background:'var(--sky-light)', display:'flex',
                      alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>📅</div>
                    <div>
                      <div style={{ fontWeight:700, color:'var(--blue-deep)' }}>
                        {a.type} · {a.therapists?.profiles?.full_name || 'Therapist'}
                      </div>
                      <div style={{ fontSize:'0.82rem', color:'var(--text-light)' }}>
                        {fmtDate(a.scheduled_at)} at {fmtTime(a.scheduled_at)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:800, padding:'3px 10px',
                      borderRadius:100,
                      background: a.status==='confirmed' ? 'var(--green-mist)' : 'var(--earth-cream)',
                      color: a.status==='confirmed' ? 'var(--green-deep)' : 'var(--earth-warm)',
                      textTransform:'uppercase', letterSpacing:'0.06em' }}>{a.status}</span>
                    <button className="btn btn-outline"
                      style={{ fontSize:'0.78rem', padding:'0.35rem 0.9rem' }}
                      onClick={() => cancelAppt(a.id)}>Cancel</button>
                  </div>
                </div>
              ))
            }

            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem',
              color:'var(--blue-deep)', margin:'2rem 0 1rem' }}>Past Sessions</h2>
            {past.length === 0
              ? <p style={{ color:'var(--text-light)' }}>No past sessions yet.</p>
              : past.map((a,i) => (
                <div key={i} style={{ background:'var(--off-white)', borderRadius:'var(--radius-md)',
                  padding:'1rem 1.5rem', border:'1px solid var(--earth-cream)',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  marginBottom:'0.5rem', flexWrap:'wrap', gap:'0.75rem' }}>
                  <div>
                    <div style={{ fontWeight:600, color:'var(--text-mid)' }}>
                      {a.therapists?.profiles?.full_name || 'Therapist'} · {fmtDate(a.scheduled_at)}
                    </div>
                    <span style={{ fontSize:'0.75rem', fontWeight:700,
                      color: a.status==='completed' ? 'var(--green-deep)' : '#c0392b',
                      textTransform:'uppercase' }}>{a.status}</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {/* ── MOOD DIARY ── */}
        {tab === 'Mood Diary' && (
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem',
              color:'var(--blue-deep)', marginBottom:'1.5rem' }}>Mood Log</h2>
            {moodLogs.length === 0
              ? (
                <div style={{ background:'var(--white)', borderRadius:'var(--radius-md)',
                  padding:'2rem', textAlign:'center', border:'1px solid var(--blue-pale)' }}>
                  <p style={{ color:'var(--text-light)', marginBottom:'1rem' }}>No mood logs yet.</p>
                  <button className="btn btn-outline" onClick={() => setTab('Overview')}>Log Mood Now</button>
                </div>
              )
              : (
                <>
                  <div style={{ background:'var(--white)', borderRadius:'var(--radius-lg)',
                    padding:'1.5rem', border:'1px solid var(--blue-pale)', marginBottom:'1.5rem' }}>
                    <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--text-light)',
                      textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'1rem' }}>
                      Last {Math.min(moodLogs.length, 14)} days
                    </div>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:'0.5rem', height:120 }}>
                      {moodLogs.slice(0,14).reverse().map((m,i) => (
                        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column',
                          alignItems:'center', gap:2, minWidth:0 }}>
                          <span style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--sky)' }}>{m.mood_score}</span>
                          <div style={{ width:'100%', background:'var(--sky)', opacity:0.7 + m.mood_score*0.03,
                            borderRadius:'4px 4px 0 0', height:m.mood_score * 10, transition:'height 0.8s' }}/>
                          <span style={{ fontSize:'0.6rem', color:'var(--text-light)', whiteSpace:'nowrap' }}>
                            {fmtShort(m.logged_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {moodLogs.map((m,i) => (
                    <div key={i} style={{ background:'var(--white)', borderRadius:'var(--radius-md)',
                      padding:'1rem 1.25rem', border:'1px solid var(--blue-pale)',
                      marginBottom:'0.5rem', display:'flex',
                      justifyContent:'space-between', alignItems:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                        <span style={{ fontSize:'1.5rem' }}>{MOODS[Math.min(m.mood_score-1, MOODS.length-1)]}</span>
                        <div>
                          <strong style={{ color:'var(--blue-deep)' }}>{m.mood_score}/10</strong>
                          {m.emotions?.length > 0 && (
                            <div style={{ fontSize:'0.75rem', color:'var(--text-light)', marginTop:2 }}>
                              {m.emotions.join(', ')}
                            </div>
                          )}
                          {m.notes && (
                            <div style={{ fontSize:'0.82rem', color:'var(--text-mid)', marginTop:2 }}>{m.notes}</div>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize:'0.75rem', color:'var(--text-light)',
                        flexShrink:0, marginLeft:'1rem' }}>{fmtDate(m.logged_at)}</span>
                    </div>
                  ))}
                </>
              )
            }
          </div>
        )}

        {/* ── JOURNAL ── */}
        {tab === 'Journal' && (
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem',
              color:'var(--blue-deep)', marginBottom:'1.5rem' }}>My Journal</h2>

            <div style={{ background:'var(--white)', borderRadius:'var(--radius-lg)',
              padding:'1.75rem', border:'1px solid var(--blue-pale)', marginBottom:'2rem' }}>
              <h3 style={{ fontSize:'1rem', color:'var(--blue-deep)',
                marginBottom:'1rem', fontFamily:'var(--font-display)' }}>✍️ New Entry</h3>
              <input placeholder="Title (optional)" value={newEntry.title}
                onChange={e => setNewEntry(n => ({ ...n, title:e.target.value }))}
                style={{ width:'100%', padding:'0.7rem 1rem',
                  border:'1.5px solid var(--blue-pale)', borderRadius:10,
                  fontSize:'0.95rem', marginBottom:'0.75rem',
                  boxSizing:'border-box', outline:'none',
                  fontFamily:'var(--font-body)', color:'#1a3a4a' }}/>
              <textarea
                placeholder="What's on your mind today? Write freely — this is your private space."
                value={newEntry.content} rows={5}
                onChange={e => setNewEntry(n => ({ ...n, content:e.target.value }))}
                style={{ width:'100%', padding:'0.7rem 1rem',
                  border:'1.5px solid var(--blue-pale)', borderRadius:10,
                  fontSize:'0.9rem', resize:'vertical', boxSizing:'border-box',
                  outline:'none', fontFamily:'var(--font-body)', color:'#1a3a4a',
                  lineHeight:1.7 }}/>
              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', marginTop:'0.85rem' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text-light)' }}>
                  {newEntry.content.length} characters
                </span>
                <button className="btn btn-primary"
                  onClick={saveJournalEntry}
                  disabled={savingEntry || !newEntry.content.trim()}
                  style={{ opacity: savingEntry || !newEntry.content.trim() ? 0.6 : 1 }}>
                  {savingEntry ? 'Saving…' : 'Save Entry →'}
                </button>
              </div>
            </div>

            {entries.length === 0
              ? <p style={{ color:'var(--text-light)', textAlign:'center', padding:'2rem' }}>
                  No journal entries yet. Write your first one above!
                </p>
              : (
                <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                  {entries.map((e,i) => (
                    <div key={i}
                      onClick={() => setOpenEntry(e)}
                      style={{ background:'var(--white)', borderRadius:'var(--radius-md)',
                        padding:'1.25rem 1.5rem', border:'1px solid var(--blue-pale)',
                        cursor:'pointer', transition:'all 0.18s' }}
                      onMouseEnter={el => { el.currentTarget.style.borderColor='var(--sky)'; el.currentTarget.style.boxShadow='0 4px 16px rgba(0,191,255,0.1)' }}
                      onMouseLeave={el => { el.currentTarget.style.borderColor='var(--blue-pale)'; el.currentTarget.style.boxShadow='none' }}>

                      <div style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'flex-start', marginBottom:'0.65rem', gap:'1rem' }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem',
                            color:'var(--blue-deep)', fontWeight:700,
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {e.title || 'Untitled Entry'}
                          </div>
                          <div style={{ fontSize:'0.75rem', color:'var(--text-light)', marginTop:2 }}>
                            {fmtDate(e.created_at)}
                          </div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
                          {e.mood_score && (
                            <span style={{ background:'#e0f7ff', color:'#007BA8',
                              borderRadius:100, padding:'0.18rem 0.55rem',
                              fontSize:'0.72rem', fontWeight:700 }}>
                              {MOODS[Math.min(e.mood_score-1, MOODS.length-1)]} {e.mood_score}/10
                            </span>
                          )}
                          <span style={{ fontSize:'0.75rem', color:'var(--sky)', fontWeight:600 }}>Read →</span>
                        </div>
                      </div>

                      <p style={{ fontFamily:'var(--font-body)', fontSize:'0.87rem',
                        color:'var(--text-mid)', lineHeight:1.65, margin:0,
                        display:'-webkit-box', WebkitLineClamp:3,
                        WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {e.content}
                      </p>

                      {e.tags?.length > 0 && (
                        <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap', marginTop:'0.65rem' }}>
                          {e.tags.map((tag,ti) => (
                            <span key={ti} style={{ background:'#f0f4f8', color:'#4a6a7a',
                              borderRadius:100, padding:'0.15rem 0.55rem', fontSize:'0.7rem',
                              fontWeight:600 }}>#{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {/* ── NOTIFICATIONS ── */}
        {tab === 'Notifications' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:'1.25rem' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem',
                color:'var(--blue-deep)', margin:0 }}>Notifications</h2>
              {unreadCount > 0 && (
                <button className="btn btn-outline"
                  style={{ fontSize:'0.82rem', padding:'0.4rem 0.9rem' }}
                  onClick={markAllRead}>Mark all read</button>
              )}
            </div>
            {notifs.length === 0
              ? <p style={{ color:'var(--text-light)' }}>No notifications yet.</p>
              : notifs.map((n,i) => (
                <div key={i}
                  onClick={() => !n.is_read && markNotifRead(n.id)}
                  style={{ background: n.is_read ? 'var(--off-white)' : 'var(--white)',
                    borderRadius:'var(--radius-md)', padding:'1rem 1.25rem',
                    border:`1px solid ${n.is_read ? 'var(--earth-cream)' : 'var(--blue-pale)'}`,
                    marginBottom:'0.5rem', cursor: n.is_read ? 'default' : 'pointer',
                    display:'flex', justifyContent:'space-between',
                    alignItems:'flex-start', gap:'1rem' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      {!n.is_read && (
                        <span style={{ width:8, height:8, borderRadius:'50%',
                          background:'var(--sky)', display:'inline-block', flexShrink:0 }}/>
                      )}
                      <strong style={{ color:'var(--blue-deep)', fontSize:'0.88rem' }}>{n.title}</strong>
                    </div>
                    {n.message && (
                      <p style={{ fontSize:'0.82rem', color:'var(--text-light)',
                        marginTop:4, marginBottom:0, lineHeight:1.5 }}>{n.message}</p>
                    )}
                  </div>
                  <span style={{ fontSize:'0.72rem', color:'var(--text-light)',
                    whiteSpace:'nowrap', flexShrink:0 }}>{fmtDate(n.created_at)}</span>
                </div>
              ))
            }
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'Messages' && <MessagingPanel />}

      </div>
    </div>
  )
}