// src/pages/ClientsPortalPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'
import { appointments, wellness, notifications } from '../services/api'

const TABS = ['Overview','Appointments','Mood Diary','Journal','Notifications']
const MOODS = ['😞','😔','😐','🙂','😊','😄','🤩']

export default function ClientPortalPage() {
  const { navigate }          = useRouter()
  const { user, logout }      = useAuth()
  const [tab, setTab]         = useState('Overview')

  // Overview state
  const [stats, setStats]     = useState(null)
  const [moodToday, setMoodToday] = useState(null)
  const [moodSaved, setMoodSaved] = useState(false)

  // Appointments
  const [upcoming, setUpcoming]   = useState([])
  const [past, setPast]           = useState([])
  const [loadingAppts, setLoadingAppts] = useState(false)

  // Mood diary
  const [moodLogs, setMoodLogs]   = useState([])

  // Journal
  const [entries, setEntries]     = useState([])
  const [newEntry, setNewEntry]   = useState({ title:'', content:'' })
  const [savingEntry, setSavingEntry] = useState(false)

  // Notifications
  const [notifs, setNotifs]       = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    loadOverview()
  }, [user])

  useEffect(() => {
    if (tab === 'Appointments') loadAppointments()
    if (tab === 'Mood Diary')   loadMoodLogs()
    if (tab === 'Journal')      loadJournal()
    if (tab === 'Notifications')loadNotifications()
  }, [tab])

  async function loadOverview() {
    try {
      const [apptRes, moodRes] = await Promise.all([
        appointments.list({ limit:5, status:'confirmed' }),
        wellness.getMoodLogs({ limit:7 }),
      ])
      const upcoming = apptRes.appointments?.filter(a=>new Date(a.scheduled_at)>=new Date()) || []
      const moodAvg  = moodRes.logs?.reduce((s,l)=>s+l.mood_score,0) / (moodRes.logs?.length||1)
      setStats({
        sessions:   apptRes.pagination?.total || 0,
        nextSession: upcoming[0] ? new Date(upcoming[0].scheduled_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}) : '—',
        moodAvg:    moodAvg ? moodAvg.toFixed(1) : '—',
        streak:     moodRes.logs?.length || 0,
      })
    } catch {}
  }

  async function loadAppointments() {
    setLoadingAppts(true)
    try {
      const res = await appointments.list({ limit:20 })
      const all = res.appointments || []
      setUpcoming(all.filter(a=>['pending','confirmed'].includes(a.status)))
      setPast(all.filter(a=>['completed','cancelled'].includes(a.status)))
    } catch {} finally { setLoadingAppts(false) }
  }

  async function loadMoodLogs() {
    try { const res = await wellness.getMoodLogs({limit:14}); setMoodLogs(res.logs||[]) } catch {}
  }

  async function loadJournal() {
    try { const res = await wellness.getJournal({limit:10}); setEntries(res.entries||[]) } catch {}
  }

  async function loadNotifications() {
    try { const res = await notifications.list({limit:20}); setNotifs(res.notifications||[]); setUnreadCount(res.unreadCount||0) } catch {}
  }

  async function saveMood(idx) {
    setMoodToday(idx)
    try {
      await wellness.addMoodLog({ moodScore: idx+1, emotions:[], notes:'' })
      setMoodSaved(true)
      setTimeout(()=>setMoodSaved(false),3000)
    } catch {}
  }

  async function saveJournalEntry() {
    if (!newEntry.content.trim()) return
    setSavingEntry(true)
    try {
      await wellness.createEntry({ title:newEntry.title, content:newEntry.content })
      setNewEntry({title:'',content:''})
      loadJournal()
    } catch {} finally { setSavingEntry(false) }
  }

  async function markNotifRead(id) {
    try {
      await notifications.markRead(id)
      setNotifs(n=>n.map(x=>x.id===id?{...x,is_read:true}:x))
      setUnreadCount(c=>Math.max(0,c-1))
    } catch {}
  }

  async function markAllRead() {
    try { await notifications.markAllRead(); setNotifs(n=>n.map(x=>({...x,is_read:true}))); setUnreadCount(0) } catch {}
  }

  async function cancelAppt(id) {
    try { await appointments.cancel(id); loadAppointments() } catch {}
  }

  const fmtDate = d => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
  const fmtTime = d => new Date(d).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})

  return (
    <div className="page-wrapper" style={{ background:'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--blue-pale)', padding:'1.5rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'var(--blue-deep)' }}>
            Welcome back, <em>{user?.fullName?.split(' ')[0] || 'there'}</em> 👋
          </div>
          <div style={{ fontSize:'0.82rem', color:'var(--text-light)', marginTop:2 }}>
            {stats?.nextSession !== '—' ? `Next session: ${stats?.nextSession}` : 'No upcoming sessions'}
          </div>
        </div>
        <button onClick={logout} style={{ padding:'0.45rem 1rem', borderRadius:8, border:'1px solid var(--earth-cream)', background:'none', fontSize:'0.82rem', color:'var(--text-light)', cursor:'pointer' }}>
          🚪 Log Out
        </button>
      </div>

      {/* Tabs */}
      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--blue-pale)', padding:'0 2rem', display:'flex', gap:0, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{ padding:'1rem 1.25rem', border:'none', background:'none', fontFamily:'var(--font-body)', fontSize:'0.85rem', fontWeight:tab===t?700:500, color:tab===t?'var(--sky)':'var(--text-light)', borderBottom:tab===t?'2.5px solid var(--sky)':'2.5px solid transparent', cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}>
            {t}{t==='Notifications'&&unreadCount>0?` (${unreadCount})`:''}
          </button>
        ))}
      </div>

      <div style={{ padding:'2rem', maxWidth:1100, margin:'0 auto' }}>

        {/* OVERVIEW */}
        {tab==='Overview' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1.25rem', marginBottom:'2rem' }}>
              {[
                { label:'Sessions Completed', val:stats?.sessions??'…', icon:'✅', color:'var(--sky-light)' },
                { label:'Next Appointment',   val:stats?.nextSession??'…', icon:'📅', color:'var(--green-mist)' },
                { label:'Log Streak',         val:`${stats?.streak??'…'} days`, icon:'🔥', color:'#fff5e6' },
                { label:'Avg Mood (7 days)',  val:stats?.moodAvg??'…', icon:'😊', color:'var(--blue-mist)' },
              ].map((c,i)=>(
                <div key={i} style={{ background:c.color, borderRadius:'var(--radius-md)', padding:'1.25rem', border:'1px solid var(--blue-pale)' }}>
                  <div style={{ fontSize:'1.5rem', marginBottom:'0.4rem' }}>{c.icon}</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--blue-deep)' }}>{c.val}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-light)', fontWeight:600 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Mood check-in */}
            <div style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'2rem', border:'1px solid var(--blue-pale)', marginBottom:'1.5rem' }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--blue-deep)', marginBottom:'1rem' }}>How are you feeling today?</div>
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                {MOODS.map((e,i)=>(
                  <button key={i} onClick={()=>saveMood(i)} style={{ fontSize:'1.8rem', padding:'0.5rem', border:`2px solid ${moodToday===i?'var(--sky)':'var(--blue-pale)'}`, borderRadius:'var(--radius-sm)', background:moodToday===i?'var(--sky-light)':'var(--off-white)', cursor:'pointer', transition:'all 0.2s' }}>{e}</button>
                ))}
              </div>
              {moodSaved && <p style={{ marginTop:'0.75rem', color:'var(--green-deep)', fontSize:'0.85rem', fontWeight:600 }}>✓ Mood logged. Keep it up!</p>}
            </div>

            <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
              <button className="btn btn-primary" onClick={()=>navigate('/book')}>Book New Session</button>
              <button className="btn btn-outline" onClick={()=>setTab('Mood Diary')}>Mood Diary →</button>
              <button className="btn btn-outline" onClick={()=>setTab('Journal')}>Journal →</button>
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {tab==='Appointments' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)' }}>Upcoming Sessions</h2>
              <button className="btn btn-primary" style={{ fontSize:'0.82rem', padding:'0.5rem 1rem' }} onClick={()=>navigate('/book')}>+ Book New</button>
            </div>

            {loadingAppts ? <p style={{ color:'var(--text-light)' }}>Loading…</p>
            : upcoming.length===0 ? (
              <div style={{ background:'var(--white)', borderRadius:'var(--radius-md)', padding:'2rem', textAlign:'center', border:'1px solid var(--blue-pale)', marginBottom:'2rem' }}>
                <p style={{ color:'var(--text-light)', marginBottom:'1rem' }}>No upcoming appointments.</p>
                <button className="btn btn-primary" onClick={()=>navigate('/book')}>Book Your First Session →</button>
              </div>
            ) : upcoming.map((a,i)=>(
              <div key={i} style={{ background:'var(--white)', borderRadius:'var(--radius-md)', padding:'1.25rem 1.5rem', border:'1px solid var(--blue-pale)', display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.75rem', flexWrap:'wrap', gap:'1rem' }}>
                <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:'var(--sky-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>📅</div>
                  <div>
                    <div style={{ fontWeight:700, color:'var(--blue-deep)' }}>{a.type} · {a.therapists?.profiles?.full_name||'Therapist'}</div>
                    <div style={{ fontSize:'0.82rem', color:'var(--text-light)' }}>{fmtDate(a.scheduled_at)} at {fmtTime(a.scheduled_at)}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
                  <span style={{ fontSize:'0.72rem', fontWeight:800, padding:'3px 10px', borderRadius:100, background:a.status==='confirmed'?'var(--green-mist)':'var(--earth-cream)', color:a.status==='confirmed'?'var(--green-deep)':'var(--earth-warm)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{a.status}</span>
                  <button className="btn btn-outline" style={{ fontSize:'0.78rem', padding:'0.35rem 0.9rem' }} onClick={()=>cancelAppt(a.id)}>Cancel</button>
                </div>
              </div>
            ))}

            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', margin:'2rem 0 1rem' }}>Past Sessions</h2>
            {past.length===0 ? <p style={{ color:'var(--text-light)' }}>No past sessions yet.</p>
            : past.map((a,i)=>(
              <div key={i} style={{ background:'var(--off-white)', borderRadius:'var(--radius-md)', padding:'1.25rem 1.5rem', border:'1px solid var(--earth-cream)', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <div>
                  <div style={{ fontWeight:600, color:'var(--text-mid)' }}>{a.therapists?.profiles?.full_name||'Therapist'} · {fmtDate(a.scheduled_at)}</div>
                  <span style={{ fontSize:'0.75rem', fontWeight:700, color: a.status==='completed'?'var(--green-deep)':'#c0392b', textTransform:'uppercase' }}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MOOD DIARY */}
        {tab==='Mood Diary' && (
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', marginBottom:'1.5rem' }}>Mood Log</h2>
            {moodLogs.length===0 ? (
              <div style={{ background:'var(--white)', borderRadius:'var(--radius-md)', padding:'2rem', textAlign:'center', border:'1px solid var(--blue-pale)' }}>
                <p style={{ color:'var(--text-light)', marginBottom:'1rem' }}>No mood logs yet. Log your first mood above!</p>
                <button className="btn btn-outline" onClick={()=>setTab('Overview')}>Log Mood Now</button>
              </div>
            ) : (
              <>
                {/* Bar chart */}
                <div style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'2rem', border:'1px solid var(--blue-pale)', marginBottom:'1.5rem' }}>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:'1rem', height:140, marginBottom:'0.5rem' }}>
                    {moodLogs.slice(0,14).reverse().map((m,i)=>(
                      <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                        <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--sky)' }}>{m.mood_score}</span>
                        <div style={{ width:'100%', background:'var(--sky)', borderRadius:'var(--radius-sm) var(--radius-sm) 0 0', height:m.mood_score*11, transition:'height 1s' }}/>
                        <span style={{ fontSize:'0.65rem', color:'var(--text-light)' }}>{new Date(m.logged_at).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Log list */}
                {moodLogs.map((m,i)=>(
                  <div key={i} style={{ background:'var(--white)', borderRadius:'var(--radius-md)', padding:'1rem 1.25rem', border:'1px solid var(--blue-pale)', marginBottom:'0.5rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <span style={{ fontSize:'1.5rem', marginRight:'0.75rem' }}>{MOODS[Math.min(m.mood_score-1,MOODS.length-1)]}</span>
                      <strong>{m.mood_score}/10</strong>
                      {m.notes && <span style={{ fontSize:'0.82rem', color:'var(--text-light)', marginLeft:'0.75rem' }}>{m.notes}</span>}
                    </div>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-light)' }}>{fmtDate(m.logged_at)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* JOURNAL */}
        {tab==='Journal' && (
          <div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', marginBottom:'1.5rem' }}>My Journal</h2>
            <div style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'2rem', border:'1px solid var(--blue-pale)', marginBottom:'2rem' }}>
              <h3 style={{ fontSize:'1rem', color:'var(--blue-deep)', marginBottom:'1rem' }}>New Entry</h3>
              <input placeholder="Title (optional)" value={newEntry.title}
                onChange={e=>setNewEntry(n=>({...n,title:e.target.value}))}
                style={{ width:'100%', padding:'0.65rem 0.85rem', border:'1px solid var(--blue-pale)', borderRadius:8, fontSize:'0.9rem', marginBottom:'0.75rem', boxSizing:'border-box', outline:'none' }}/>
              <textarea placeholder="What's on your mind today?" value={newEntry.content} rows={4}
                onChange={e=>setNewEntry(n=>({...n,content:e.target.value}))}
                style={{ width:'100%', padding:'0.65rem 0.85rem', border:'1px solid var(--blue-pale)', borderRadius:8, fontSize:'0.88rem', resize:'vertical', boxSizing:'border-box', outline:'none', fontFamily:'var(--font-body)' }}/>
              <button className="btn btn-primary" style={{ marginTop:'0.75rem' }} onClick={saveJournalEntry} disabled={savingEntry||!newEntry.content.trim()}>
                {savingEntry ? 'Saving…' : 'Save Entry →'}
              </button>
            </div>

            {entries.map((e,i)=>(
              <div key={i} style={{ background:'var(--white)', borderRadius:'var(--radius-md)', padding:'1.25rem 1.5rem', border:'1px solid var(--blue-pale)', marginBottom:'0.75rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
                  <strong style={{ color:'var(--blue-deep)' }}>{e.title||'Untitled'}</strong>
                  <span style={{ fontSize:'0.75rem', color:'var(--text-light)' }}>{fmtDate(e.created_at)}</span>
                </div>
                {e.mood_score&&<span style={{ fontSize:'0.75rem', background:'var(--sky-light)', color:'var(--sky)', padding:'0.15rem 0.5rem', borderRadius:100, fontWeight:600, marginBottom:'0.5rem', display:'inline-block' }}>Mood: {e.mood_score}/10</span>}
              </div>
            ))}
            {entries.length===0&&<p style={{ color:'var(--text-light)' }}>No journal entries yet. Write your first one above!</p>}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {tab==='Notifications' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)' }}>Notifications</h2>
              {unreadCount>0&&<button className="btn btn-outline" style={{ fontSize:'0.82rem', padding:'0.4rem 0.9rem' }} onClick={markAllRead}>Mark all read</button>}
            </div>
            {notifs.length===0 ? <p style={{ color:'var(--text-light)' }}>No notifications yet.</p>
            : notifs.map((n,i)=>(
              <div key={i} onClick={()=>!n.is_read&&markNotifRead(n.id)}
                style={{ background:n.is_read?'var(--off-white)':'var(--white)', borderRadius:'var(--radius-md)', padding:'1rem 1.25rem', border:`1px solid ${n.is_read?'var(--earth-cream)':'var(--blue-pale)'}`, marginBottom:'0.5rem', cursor:n.is_read?'default':'pointer', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
                <div>
                  {!n.is_read&&<span style={{ width:8, height:8, borderRadius:'50%', background:'var(--sky)', display:'inline-block', marginRight:8 }}/>}
                  <strong style={{ color:'var(--blue-deep)', fontSize:'0.88rem' }}>{n.title}</strong>
                  {n.message&&<p style={{ fontSize:'0.82rem', color:'var(--text-light)', marginTop:4 }}>{n.message}</p>}
                </div>
                <span style={{ fontSize:'0.72rem', color:'var(--text-light)', whiteSpace:'nowrap', flexShrink:0 }}>{fmtDate(n.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}