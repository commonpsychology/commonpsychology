// src/pages/Myaccountpage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'
import { profile as profileApi } from '../services/api'

const SKY_D='#007BA8'; const WHITE='#fff'; const BG='#f4f8fb'; const BORDER='#daeef8'; const SLATE_M='#4a6a7a'

const TABS = [
  { id:'profile',    icon:'👤', label:'Profile' },
  { id:'security',   icon:'🔒', label:'Security' },
  { id:'sessions',   icon:'📅', label:'Sessions' },
  { id:'notifications', icon:'🔔', label:'Notifications' },
]

export default function MyAccountPage() {
  const { navigate }      = useRouter()
  const { user, logout, refreshUser } = useAuth()
  const [tab, setTab]     = useState('profile')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const [form, setForm] = useState({
    full_name:         '',
    phone:             '',
    date_of_birth:     '',
    gender:            '',
    address:           '',
    city:              '',
    bio:               '',
    language:          'en',
    emergency_contact: '',
  })

  const [pwForm, setPwForm] = useState({ current:'', newPw:'', confirm:'' })
  const [pwMsg, setPwMsg]   = useState('')
  const [pwErr, setPwErr]   = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    profileApi.get().then(d => {
      const p = d.user
      setForm({
        full_name:         p.fullName         || '',
        phone:             p.phone            || '',
        date_of_birth:     p.dateOfBirth      || '',
        gender:            p.gender           || '',
        address:           p.address          || '',
        city:              p.city             || '',
        bio:               p.bio              || '',
        language:          p.language         || 'en',
        emergency_contact: p.emergencyContact || '',
      })
    }).catch(() => {})
  }, [user])

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false)
    try {
      await profileApi.update(form)
      await refreshUser()
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Could not save profile.')
    } finally { setSaving(false) }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwErr(''); setPwMsg('')
    if (!pwForm.current || !pwForm.newPw) { setPwErr('Please fill all fields.'); return }
    if (pwForm.newPw !== pwForm.confirm)  { setPwErr('Passwords do not match.'); return }
    if (pwForm.newPw.length < 8)          { setPwErr('New password must be at least 8 characters.'); return }
    setPwSaving(true)
    try {
      await profileApi.changePassword(pwForm.current, pwForm.newPw)
      setPwMsg('Password changed. You will be signed out.')
      setTimeout(() => logout(), 2000)
    } catch (err) {
      setPwErr(err.message || 'Could not change password.')
    } finally { setPwSaving(false) }
  }

  const up = k => v => setForm(f => ({ ...f, [k]: v }))
  const initials = (user?.fullName||'U').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()

  const inputSx = { width:'100%', padding:'0.75rem 1rem', border:`1.5px solid ${BORDER}`, borderRadius:10, fontSize:'0.9rem', color:'#1a3a4a', outline:'none', boxSizing:'border-box', background:editing?WHITE:BG, transition:'background 0.2s' }
  const labelSx = { display:'block', fontSize:'0.72rem', fontWeight:800, color:SLATE_M, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.4rem' }

  return (
    <div style={{ minHeight:'100vh', background:BG }}>
      {/* Hero */}
<div style={{ background:`linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`, padding:'2rem', paddingTop:'calc(2rem + 72px)', position:'relative' }}>        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', alignItems:'center', gap:'1.25rem' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.2)', backdropFilter:'blur(8px)', border:'3px solid rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:'1.4rem', color:WHITE, fontWeight:800, flexShrink:0 }}>
            {user?.avatarUrl ? <img src={user.avatarUrl} style={{width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover'}} alt=""/> : initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color:WHITE, margin:0 }}>{user?.fullName||'Your Account'}</h1>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.82rem', margin:'0.25rem 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.email}</p>
          </div>
          <button onClick={logout} style={{ padding:'0.45rem 1rem', borderRadius:9, border:'1.5px solid rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.12)', color:WHITE, fontSize:'0.8rem', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
            🚪 Log Out
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background:WHITE, borderBottom:`1px solid ${BORDER}`, padding:'1rem 2rem' }}>
        <div style={{ maxWidth:900, margin:'0 auto', display:'flex', gap:'2rem', justifyContent:'center', flexWrap:'wrap' }}>
          {[{ icon:'✅', val:user?.totalSessions||'—', label:'Sessions' }, { icon:'🔥', val:'—', label:'Streak' }, { icon:'😊', val:'—', label:'Avg Mood' }, { icon:'📅', val:'—', label:'Next' }].map((s,i)=>(
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'1rem' }}>{s.icon}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:SKY_D, fontWeight:800 }}>{s.val}</div>
              <div style={{ fontSize:'0.65rem', color:SLATE_M, fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth:900, margin:'0 auto', padding:'2rem', display:'grid', gridTemplateColumns:'200px 1fr', gap:'1.5rem', alignItems:'start' }}>
        {/* Sidebar */}
        <div style={{ background:WHITE, borderRadius:14, border:`1px solid ${BORDER}`, padding:'1rem', position:'sticky', top:'1rem' }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ display:'flex', alignItems:'center', gap:'0.6rem', width:'100%', padding:'0.65rem 0.85rem', borderRadius:10, border:'none', cursor:'pointer', textAlign:'left', background:tab===t.id?'var(--sky-light)':'transparent', marginBottom:'0.1rem', fontFamily:'inherit', transition:'background 0.15s' }}>
              <span style={{ fontSize:'0.95rem', width:20, textAlign:'center' }}>{t.icon}</span>
              <span style={{ fontSize:'0.84rem', fontWeight:tab===t.id?700:500, color:tab===t.id?SKY_D:SLATE_M }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background:WHITE, borderRadius:14, border:`1px solid ${BORDER}`, padding:'2rem' }}>

          {/* PROFILE TAB */}
          {tab==='profile' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <h2 style={{ fontFamily:'var(--font-display)', color:'#1a3a4a', fontSize:'1.2rem' }}>Profile Information</h2>
                {!editing ? (
                  <button onClick={()=>setEditing(true)} style={{ padding:'0.45rem 1rem', borderRadius:8, border:`1.5px solid ${BORDER}`, background:'none', fontSize:'0.82rem', color:SKY_D, cursor:'pointer', fontWeight:600 }}>✏️ Edit</button>
                ) : (
                  <div style={{ display:'flex', gap:'0.5rem' }}>
                    <button onClick={()=>setEditing(false)} style={{ padding:'0.45rem 1rem', borderRadius:8, border:`1.5px solid ${BORDER}`, background:'none', fontSize:'0.82rem', color:SLATE_M, cursor:'pointer' }}>Cancel</button>
                    <button onClick={handleSave} disabled={saving} style={{ padding:'0.45rem 1rem', borderRadius:8, border:'none', background:SKY_D, color:WHITE, fontSize:'0.82rem', fontWeight:700, cursor:'pointer' }}>
                      {saving?'Saving…':'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              {saved&&<div style={{ background:'#e8f8f0', border:'1px solid #a0ddb8', borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem', fontSize:'0.85rem', color:'#1a7a4a' }}>✓ Profile saved successfully!</div>}
              {error&&<div style={{ background:'#fff0f0', border:'1px solid #f5a0a0', borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem', fontSize:'0.85rem', color:'#c0392b' }}>{error}</div>}

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                {[
                  { key:'full_name',     label:'Full Name',         type:'text' },
                  { key:'phone',         label:'Phone',             type:'tel' },
                  { key:'date_of_birth', label:'Date of Birth',     type:'date' },
                  { key:'city',          label:'City',              type:'text' },
                  { key:'address',       label:'Address',           type:'text' },
                  { key:'emergency_contact', label:'Emergency Contact', type:'text' },
                ].map(({ key, label, type })=>(
                  <div key={key}>
                    <label style={labelSx}>{label}</label>
                    <input type={type} value={form[key]} disabled={!editing}
                      onChange={e=>up(key)(e.target.value)} style={inputSx}/>
                  </div>
                ))}

                <div>
                  <label style={labelSx}>Gender</label>
                  <select value={form.gender} disabled={!editing} onChange={e=>up('gender')(e.target.value)} style={{...inputSx, cursor:editing?'pointer':'default'}}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label style={labelSx}>Language</label>
                  <select value={form.language} disabled={!editing} onChange={e=>up('language')(e.target.value)} style={{...inputSx, cursor:editing?'pointer':'default'}}>
                    <option value="en">English</option>
                    <option value="ne">Nepali</option>
                  </select>
                </div>

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={labelSx}>Bio</label>
                  <textarea value={form.bio} disabled={!editing} rows={3}
                    onChange={e=>up('bio')(e.target.value)}
                    style={{...inputSx, resize:'vertical', fontFamily:'var(--font-body)'}}/>
                </div>
              </div>
            </>
          )}

          {/* SECURITY TAB */}
          {tab==='security' && (
            <>
              <h2 style={{ fontFamily:'var(--font-display)', color:'#1a3a4a', fontSize:'1.2rem', marginBottom:'1.5rem' }}>Change Password</h2>
              {pwMsg&&<div style={{ background:'#e8f8f0', border:'1px solid #a0ddb8', borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem', fontSize:'0.85rem', color:'#1a7a4a' }}>{pwMsg}</div>}
              {pwErr&&<div style={{ background:'#fff0f0', border:'1px solid #f5a0a0', borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem', fontSize:'0.85rem', color:'#c0392b' }}>{pwErr}</div>}
              <form onSubmit={handlePasswordChange} style={{ display:'flex', flexDirection:'column', gap:'1rem', maxWidth:400 }}>
                {[{ key:'current', label:'Current Password' },{ key:'newPw', label:'New Password' },{ key:'confirm', label:'Confirm New Password' }].map(({ key, label })=>(
                  <div key={key}>
                    <label style={labelSx}>{label}</label>
                    <input type="password" value={pwForm[key]} onChange={e=>setPwForm(f=>({...f,[key]:e.target.value}))} style={inputSx}/>
                  </div>
                ))}
                <button type="submit" disabled={pwSaving} style={{ padding:'0.8rem 1.5rem', background:SKY_D, color:WHITE, border:'none', borderRadius:10, fontWeight:700, fontSize:'0.9rem', cursor:'pointer' }}>
                  {pwSaving?'Changing…':'Change Password'}
                </button>
              </form>
            </>
          )}

          {tab==='sessions' && (
            <div style={{ textAlign:'center', padding:'3rem 2rem', color:'var(--text-light)' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📅</div>
              <p style={{ marginBottom:'1.5rem' }}>View all your sessions from the Client Portal.</p>
              <button className="btn btn-primary" onClick={()=>navigate('/portal')}>Go to My Portal →</button>
            </div>
          )}

          {tab==='notifications' && (
            <div style={{ textAlign:'center', padding:'3rem 2rem', color:'var(--text-light)' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🔔</div>
              <p style={{ marginBottom:'1.5rem' }}>Manage notifications from the Client Portal.</p>
              <button className="btn btn-primary" onClick={()=>navigate('/portal')}>Go to My Portal →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}