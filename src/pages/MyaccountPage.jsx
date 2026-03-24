// src/pages/Myaccountpage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'
import { profile as profileApi } from '../services/api'

const SKY_D  = '#007BA8'
const WHITE  = '#fff'
const BG     = '#f4f8fb'
const BORDER = '#daeef8'
const MID    = '#4a6a7a'

const TABS = [
  { id:'profile',       icon:'👤', label:'Profile'       },
  { id:'security',      icon:'🔒', label:'Security'      },
  { id:'sessions',      icon:'📅', label:'Sessions'      },
  { id:'notifications', icon:'🔔', label:'Notifications' },
]

const CSS = `
  .acc-layout { min-height:100vh; background:${BG}; }
  .acc-hero { background:linear-gradient(135deg,#007BA8 0%,#00BFFF 100%); padding:clamp(1.25rem,4vw,2rem); padding-top:calc(clamp(1.25rem,4vw,2rem) + 72px); }
  .acc-hero-inner { max-width:900px; margin:0 auto; display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap; }
  .acc-stats-bar { background:${WHITE}; border-bottom:1px solid ${BORDER}; padding:clamp(0.75rem,2vw,1rem) clamp(1rem,4vw,2rem); }
  .acc-stats-inner { max-width:900px; margin:0 auto; display:flex; gap:clamp(1rem,4vw,2rem); justify-content:center; flex-wrap:wrap; }
  .acc-main { max-width:900px; margin:0 auto; padding:clamp(1rem,4vw,2rem); display:grid; grid-template-columns:200px 1fr; gap:1.5rem; align-items:start; }
  .acc-sidebar { background:${WHITE}; border-radius:14px; border:1px solid ${BORDER}; padding:0.85rem; position:sticky; top:1rem; }
  .acc-sidebar-btn { display:flex; align-items:center; gap:0.6rem; width:100%; padding:0.65rem 0.85rem; border-radius:10px; border:none; cursor:pointer; text-align:left; margin-bottom:0.15rem; font-family:inherit; transition:background 0.15s; }
  .acc-content { background:${WHITE}; border-radius:14px; border:1px solid ${BORDER}; padding:clamp(1.25rem,4vw,2rem); }
  .acc-tabs-mobile { display:none; background:${WHITE}; border-bottom:1px solid ${BORDER}; overflow-x:auto; scrollbar-width:none; }
  .acc-tabs-mobile::-webkit-scrollbar { display:none; }
  .acc-tab-btn { flex-shrink:0; padding:0.85rem 1.1rem; border:none; background:none; font-family:inherit; font-size:0.83rem; cursor:pointer; border-bottom:2.5px solid transparent; white-space:nowrap; color:${MID}; transition:all 0.2s; }
  .acc-tab-btn.active { color:${SKY_D}; font-weight:700; border-bottom-color:${SKY_D}; }
  .acc-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  @media(max-width:700px) {
    .acc-main { grid-template-columns:1fr; }
    .acc-sidebar { display:none; }
    .acc-tabs-mobile { display:flex; }
    .acc-grid-2 { grid-template-columns:1fr; }
    .acc-hero-inner { gap:0.85rem; }
  }
  @media(max-width:420px) {
    .acc-stats-inner { gap:0.75rem; }
    .acc-content { padding:1rem; }
  }
`
function injectCSS() {
  if (document.getElementById('acc-css')) return
  const s = document.createElement('style')
  s.id = 'acc-css'; s.textContent = CSS
  document.head.appendChild(s)
}

export default function MyAccountPage() {
  useEffect(() => { injectCSS() }, [])

  const { navigate }               = useRouter()
  const { user, logout, refreshUser } = useAuth()
  const [tab,     setTab]     = useState('profile')
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    full_name:'', phone:'', date_of_birth:'', gender:'',
    address:'', city:'', bio:'', language:'en', emergency_contact:'',
  })

  const [pwForm,   setPwForm]   = useState({ current:'', newPw:'', confirm:'' })
  const [pwMsg,    setPwMsg]    = useState('')
  const [pwErr,    setPwErr]    = useState('')
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
      setSaved(true); setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Could not save profile.')
    } finally { setSaving(false) }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwErr(''); setPwMsg('')
    if (!pwForm.current || !pwForm.newPw)    { setPwErr('Please fill all fields.'); return }
    if (pwForm.newPw !== pwForm.confirm)     { setPwErr('Passwords do not match.'); return }
    if (pwForm.newPw.length < 8)             { setPwErr('Minimum 8 characters.'); return }
    setPwSaving(true)
    try {
      await profileApi.changePassword(pwForm.current, pwForm.newPw)
      setPwMsg('Password changed. Signing you out…')
      setTimeout(() => logout(), 2000)
    } catch (err) {
      setPwErr(err.message || 'Could not change password.')
    } finally { setPwSaving(false) }
  }

  const up = k => v => setForm(f => ({ ...f, [k]:v }))
  const initials = (user?.fullName || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()

  const inputSx = {
    width:'100%', padding:'0.75rem 1rem',
    border:`1.5px solid ${BORDER}`, borderRadius:10,
    fontSize:'0.9rem', color:'#1a3a4a', outline:'none',
    boxSizing:'border-box',
    background: editing ? WHITE : BG,
    transition:'background 0.2s',
  }
  const labelSx = {
    display:'block', fontSize:'0.72rem', fontWeight:800,
    color:MID, textTransform:'uppercase',
    letterSpacing:'0.08em', marginBottom:'0.4rem',
  }

  const TabBtn = ({ id, icon, label }) => (
    <button className={`acc-tab-btn${tab===id?' active':''}`} onClick={() => setTab(id)}>
      {icon} {label}
    </button>
  )

  return (
    <div className="acc-layout">

      {/* Hero */}
      <div className="acc-hero">
        <div className="acc-hero-inner">
          <div style={{ width:64, height:64, borderRadius:'50%',
            background:'rgba(255,255,255,0.2)', border:'3px solid rgba(255,255,255,0.5)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'var(--font-display)', fontSize:'1.4rem',
            color:WHITE, fontWeight:800, flexShrink:0, overflow:'hidden' }}>
            {user?.avatarUrl
              ? <img src={user.avatarUrl} style={{ width:'100%',height:'100%',borderRadius:'50%',objectFit:'cover' }} alt=""/>
              : initials}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{ fontFamily:'var(--font-display)',
              fontSize:'clamp(1.2rem,5vw,1.6rem)', color:WHITE, margin:0,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.fullName || 'Your Account'}
            </h1>
            <p style={{ color:'rgba(255,255,255,0.75)',
              fontSize:'clamp(0.72rem,2vw,0.82rem)', margin:'0.25rem 0 0',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user?.email}
            </p>
          </div>
          <button onClick={logout} style={{ padding:'0.45rem 1rem', borderRadius:9,
            border:'1.5px solid rgba(255,255,255,0.35)',
            background:'rgba(255,255,255,0.12)', color:WHITE,
            fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
            flexShrink:0, whiteSpace:'nowrap' }}>
            🚪 Log Out
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="acc-stats-bar">
        <div className="acc-stats-inner">
          {[
            { icon:'✅', val:'—', label:'Sessions'  },
            { icon:'🔥', val:'—', label:'Streak'    },
            { icon:'😊', val:'—', label:'Avg Mood'  },
            { icon:'📅', val:'—', label:'Next'      },
          ].map((s,i) => (
            <div key={i} style={{ textAlign:'center', minWidth:60 }}>
              <div style={{ fontSize:'1rem' }}>{s.icon}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem',
                color:SKY_D, fontWeight:800 }}>{s.val}</div>
              <div style={{ fontSize:'0.65rem', color:MID, fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="acc-tabs-mobile">
        {TABS.map(t => <TabBtn key={t.id} {...t} />)}
      </div>

      {/* Main grid */}
      <div className="acc-main">

        {/* Desktop sidebar */}
        <div className="acc-sidebar">
          {TABS.map(t => (
            <button key={t.id} className="acc-sidebar-btn"
              onClick={() => setTab(t.id)}
              style={{ background: tab===t.id ? 'var(--sky-light)' : 'transparent' }}>
              <span style={{ fontSize:'0.95rem', width:20, textAlign:'center' }}>{t.icon}</span>
              <span style={{ fontSize:'0.84rem', fontWeight: tab===t.id ? 700 : 500,
                color: tab===t.id ? SKY_D : MID }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="acc-content">

          {/* PROFILE */}
          {tab === 'profile' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between',
                alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <h2 style={{ fontFamily:'var(--font-display)', color:'#1a3a4a',
                  fontSize:'clamp(1rem,3vw,1.2rem)', margin:0 }}>Profile Information</h2>
                {!editing
                  ? <button onClick={() => setEditing(true)} style={{ padding:'0.45rem 1rem',
                      borderRadius:8, border:`1.5px solid ${BORDER}`, background:'none',
                      fontSize:'0.82rem', color:SKY_D, cursor:'pointer', fontWeight:600 }}>✏️ Edit</button>
                  : <div style={{ display:'flex', gap:'0.5rem' }}>
                      <button onClick={() => setEditing(false)} style={{ padding:'0.45rem 1rem',
                        borderRadius:8, border:`1.5px solid ${BORDER}`, background:'none',
                        fontSize:'0.82rem', color:MID, cursor:'pointer' }}>Cancel</button>
                      <button onClick={handleSave} disabled={saving} style={{ padding:'0.45rem 1rem',
                        borderRadius:8, border:'none', background:SKY_D, color:WHITE,
                        fontSize:'0.82rem', fontWeight:700, cursor:'pointer',
                        opacity: saving ? 0.7 : 1 }}>
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                }
              </div>

              {saved && <div style={{ background:'#e8f8f0', border:'1px solid #a0ddb8',
                borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem',
                fontSize:'0.85rem', color:'#1a7a4a' }}>✓ Profile saved!</div>}
              {error && <div style={{ background:'#fff0f0', border:'1px solid #f5a0a0',
                borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem',
                fontSize:'0.85rem', color:'#c0392b' }}>{error}</div>}

              <div className="acc-grid-2">
                {[
                  { key:'full_name',          label:'Full Name',         type:'text' },
                  { key:'phone',              label:'Phone',             type:'tel'  },
                  { key:'date_of_birth',      label:'Date of Birth',     type:'date' },
                  { key:'city',               label:'City',              type:'text' },
                  { key:'address',            label:'Address',           type:'text' },
                  { key:'emergency_contact',  label:'Emergency Contact', type:'text' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label style={labelSx}>{label}</label>
                    <input type={type} value={form[key]} disabled={!editing}
                      onChange={e => up(key)(e.target.value)} style={inputSx}/>
                  </div>
                ))}

                <div>
                  <label style={labelSx}>Gender</label>
                  <select value={form.gender} disabled={!editing}
                    onChange={e => up('gender')(e.target.value)}
                    style={{ ...inputSx, cursor: editing ? 'pointer' : 'default' }}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label style={labelSx}>Language</label>
                  <select value={form.language} disabled={!editing}
                    onChange={e => up('language')(e.target.value)}
                    style={{ ...inputSx, cursor: editing ? 'pointer' : 'default' }}>
                    <option value="en">English</option>
                    <option value="ne">Nepali</option>
                  </select>
                </div>

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={labelSx}>Bio</label>
                  <textarea value={form.bio} disabled={!editing} rows={3}
                    onChange={e => up('bio')(e.target.value)}
                    style={{ ...inputSx, resize:'vertical', fontFamily:'var(--font-body)', lineHeight:1.65 }}/>
                </div>
              </div>
            </>
          )}

          {/* SECURITY */}
          {tab === 'security' && (
            <>
              <h2 style={{ fontFamily:'var(--font-display)', color:'#1a3a4a',
                fontSize:'clamp(1rem,3vw,1.2rem)', marginBottom:'1.5rem' }}>Change Password</h2>
              {pwMsg && <div style={{ background:'#e8f8f0', border:'1px solid #a0ddb8',
                borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem',
                fontSize:'0.85rem', color:'#1a7a4a' }}>{pwMsg}</div>}
              {pwErr && <div style={{ background:'#fff0f0', border:'1px solid #f5a0a0',
                borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem',
                fontSize:'0.85rem', color:'#c0392b' }}>{pwErr}</div>}
              <form onSubmit={handlePasswordChange}
                style={{ display:'flex', flexDirection:'column', gap:'1rem', maxWidth:400 }}>
                {[
                  { key:'current', label:'Current Password'   },
                  { key:'newPw',   label:'New Password'        },
                  { key:'confirm', label:'Confirm New Password'},
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={labelSx}>{label}</label>
                    <input type="password" value={pwForm[key]}
                      onChange={e => setPwForm(f => ({ ...f, [key]:e.target.value }))}
                      style={inputSx}/>
                  </div>
                ))}
                <button type="submit" disabled={pwSaving} style={{ padding:'0.8rem 1.5rem',
                  background:SKY_D, color:WHITE, border:'none', borderRadius:10,
                  fontWeight:700, fontSize:'0.9rem', cursor:'pointer',
                  opacity: pwSaving ? 0.7 : 1 }}>
                  {pwSaving ? 'Changing…' : 'Change Password'}
                </button>
              </form>
            </>
          )}

          {/* SESSIONS */}
          {tab === 'sessions' && (
            <div style={{ textAlign:'center', padding:'3rem 2rem', color:'var(--text-light)' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📅</div>
              <p style={{ marginBottom:'1.5rem' }}>View all your sessions from the Client Portal.</p>
              <button className="btn btn-primary" onClick={() => navigate('/portal')}>Go to My Portal →</button>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {tab === 'notifications' && (
            <div style={{ textAlign:'center', padding:'3rem 2rem', color:'var(--text-light)' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🔔</div>
              <p style={{ marginBottom:'1.5rem' }}>Manage notifications from the Client Portal.</p>
              <button className="btn btn-primary" onClick={() => navigate('/portal')}>Go to My Portal →</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}