// src/pages/RegisterStaffPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'

// ── API helper ──────────────────────────────────────────────
// Call the backend route directly. Reads the JWT from localStorage
// (adjust the key name to match wherever your auth context stores it).
async function registerStaffApi(payload) {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || ''
  const res = await fetch('/api/admin/register-staff', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Failed to register staff')
  return data
}

const C = {
  skyBright: '#00BFFF', skyMid: '#009FD4', skyDeep: '#007BA8',
  skyFaint: '#E0F7FF', skyFainter: '#F0FBFF', skyGhost: '#F8FEFF',
  white: '#ffffff', mint: '#e8f3ee',
  textDark: '#1a3a4a', textMid: '#2e6080', textLight: '#7a9aaa',
  border: '#b0d4e8', borderFaint: '#daeef8',
  green: '#1a7a4a', greenLight: '#e8f8f0',
  red: '#c0392b', redLight: '#fff0f0',
}
const heroGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 45%,${C.skyBright} 85%,#22d3ee 100%)`
const btnGrad  = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`

const CSS = `
  .rsf-root {
    min-height: 100vh;
    background: ${C.skyGhost};
    display: flex;
    flex-direction: column;
  }
  .rsf-topbar {
    background: ${heroGrad};
    padding: 0 clamp(1rem,3vw,2rem);
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 16px rgba(0,127,168,0.25);
  }
  .rsf-body {
    flex: 1;
    display: grid;
    grid-template-columns: 340px 1fr;
    min-height: calc(100vh - 56px);
  }
  .rsf-left {
    background: ${heroGrad};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    position: relative;
    overflow: hidden;
  }
  .rsf-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2.5rem);
    overflow-y: auto;
    background: ${C.white};
  }
  .rsf-card {
    width: 100%;
    max-width: 520px;
  }
  .rsf-input {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 1.5px solid ${C.borderFaint};
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: ${C.textDark};
    background: ${C.white};
    outline: none;
    box-sizing: border-box;
    transition: all 0.2s;
  }
  .rsf-input:focus {
    border-color: ${C.skyBright};
    background: ${C.skyGhost};
    box-shadow: 0 0 0 3.5px rgba(0,191,255,0.12);
  }
  .rsf-select {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 1.5px solid ${C.borderFaint};
    border-radius: 12px;
    font-family: var(--font-body);
    font-size: 0.92rem;
    color: ${C.textDark};
    background: ${C.white};
    outline: none;
    box-sizing: border-box;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a9aaa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 1rem center;
    padding-right: 2.5rem;
    transition: all 0.2s;
  }
  .rsf-select:focus {
    border-color: ${C.skyBright};
    box-shadow: 0 0 0 3.5px rgba(0,191,255,0.12);
  }
  .rsf-label {
    display: block;
    font-family: var(--font-body);
    font-size: 0.78rem;
    font-weight: 700;
    color: ${C.textMid};
    margin-bottom: 0.45rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .rsf-field { margin-bottom: 1.3rem; }
  .rsf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .rsf-submit {
    width: 100%;
    padding: 1rem;
    border-radius: 14px;
    border: none;
    background: ${btnGrad};
    color: white;
    font-family: var(--font-body);
    font-weight: 800;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 6px 22px rgba(0,191,255,0.35);
    transition: all 0.2s;
    letter-spacing: 0.02em;
    margin-top: 0.5rem;
  }
  .rsf-submit:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .rsf-submit:disabled { background: ${C.borderFaint}; color: ${C.textLight}; box-shadow: none; cursor: not-allowed; }
  .rsf-role-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.65rem;
    margin-bottom: 1.3rem;
  }
  .rsf-role-card {
    border: 2px solid ${C.borderFaint};
    border-radius: 12px;
    padding: 0.85rem 0.65rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.18s;
    background: ${C.white};
  }
  .rsf-role-card:hover { border-color: ${C.skyMid}; background: ${C.skyFainter}; }
  .rsf-role-card.selected {
    border-color: ${C.skyBright};
    background: ${C.skyFaint};
    box-shadow: 0 0 0 3px rgba(0,191,255,0.15);
  }
  .rsf-info-pill {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    background: rgba(255,255,255,0.13);
    border: 1px solid rgba(255,255,255,0.22);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.65rem;
  }
  .rsf-divider {
    height: 1px;
    background: ${C.borderFaint};
    margin: 1.5rem 0;
  }
  @media (max-width: 900px) {
    .rsf-body { grid-template-columns: 280px 1fr; }
  }
  @media (max-width: 680px) {
    .rsf-body { grid-template-columns: 1fr; }
    .rsf-left { display: none; }
    .rsf-right { padding: 1.5rem 1.25rem; align-items: flex-start; }
    .rsf-card { max-width: 100%; }
    .rsf-row { grid-template-columns: 1fr; }
    .rsf-role-grid { grid-template-columns: 1fr 1fr; }
  }
`
function injectCSS() {
  if (document.getElementById('rsf-css')) return
  const s = document.createElement('style')
  s.id = 'rsf-css'; s.textContent = CSS
  document.head.appendChild(s)
}

const ROLES = [
  { value: 'staff',     label: 'Staff',     icon: '🧑‍💼', desc: 'General staff access' },
  { value: 'therapist', label: 'Therapist', icon: '🩺', desc: 'Clinical dashboard' },
  { value: 'admin',     label: 'Admin',     icon: '⚙️',  desc: 'Full system access' },
]

const INITIAL = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  role: 'staff',
  department: '',
  notes: '',
}

export default function RegisterStaffPage() {
  useEffect(() => { injectCSS() }, [])
  const { navigate }                   = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [form, setForm]                = useState(INITIAL)
  const [showPw, setShowPw]            = useState(false)
  const [error, setError]              = useState('')
  const [success, setSuccess]          = useState(null)
  const [loading, setLoading]          = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Auth guard — only admin/staff can access
  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/staff'); return }
    if (!['admin', 'staff'].includes(user.role)) { navigate('/portal'); return }
  }, [user, authLoading])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // ── Client-side validation ──────────────────────────────
    if (!form.full_name.trim())               { setError('Full name is required.'); return }
    if (!form.email.trim())                   { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
                                                setError('Please enter a valid email address.'); return }
    if (!form.password)                       { setError('Password is required.'); return }
    if (form.password.length < 8)             { setError('Password must be at least 8 characters.'); return }
    if (!/[A-Z]/.test(form.password))         { setError('Password needs at least one uppercase letter.'); return }
    if (!/[0-9]/.test(form.password))         { setError('Password needs at least one number.'); return }
    if (form.password !== form.confirm)       { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      // ── Call the backend which hashes the password & inserts ──
      await registerStaffApi({
        full_name:  form.full_name.trim(),
        email:      form.email.trim().toLowerCase(),
        phone:      form.phone.trim() || null,
        password:   form.password,          // backend bcrypt-hashes this
        role:       form.role,
        department: form.department.trim() || null,
        notes:      form.notes.trim() || null,
      })
      setSuccess({ ...form })
      setForm(INITIAL)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.skyGhost }}>
      <div style={{ textAlign:'center', color:C.textLight }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🌿</div>
        <p style={{ fontFamily:'var(--font-body)' }}>Verifying session…</p>
      </div>
    </div>
  )

  if (success) return (
    <div style={{ minHeight:'100vh', background:C.skyGhost, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div style={{ background:C.white, borderRadius:20, padding:'3rem 2.5rem', maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 8px 48px rgba(0,127,168,0.12)', border:`1px solid ${C.borderFaint}` }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:C.greenLight, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'2rem' }}>✅</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', color:C.textDark, marginBottom:'0.5rem' }}>Staff Registered!</h2>
        <p style={{ color:C.textLight, lineHeight:1.7, marginBottom:'0.5rem', fontFamily:'var(--font-body)', fontSize:'0.9rem' }}>
          <strong style={{ color:C.textDark }}>{success.full_name}</strong> has been added as <strong style={{ color:C.skyDeep }}>{success.role}</strong>.
        </p>
        <p style={{ color:C.textLight, fontFamily:'var(--font-body)', fontSize:'0.85rem', marginBottom:'2rem' }}>
          Login credentials sent to <strong>{success.email}</strong>.
        </p>
        <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={() => setSuccess(null)}
            style={{ background:btnGrad, color:'white', border:'none', borderRadius:10, padding:'0.75rem 1.5rem', fontWeight:700, cursor:'pointer', fontSize:'0.9rem', fontFamily:'var(--font-body)', boxShadow:'0 4px 14px rgba(0,191,255,0.3)' }}>
            ➕ Register Another
          </button>
          <button onClick={() => navigate('/staff/admin')}
            style={{ background:C.white, color:C.skyDeep, border:`1.5px solid ${C.borderFaint}`, borderRadius:10, padding:'0.75rem 1.5rem', fontWeight:700, cursor:'pointer', fontSize:'0.9rem', fontFamily:'var(--font-body)' }}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="rsf-root">

      {/* ── Top bar ── */}
      <div className="rsf-topbar">
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <img src="/header.png" alt="" style={{ height:28, objectFit:'contain' }} onError={e => e.target.style.display='none'}/>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', color:'white', fontWeight:700, lineHeight:1.1 }}>Puja Samargi</div>
            <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Staff Registration</div>
          </div>
        </div>
        <button onClick={() => navigate('/staff/admin')}
          style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', color:'rgba(255,255,255,0.85)', borderRadius:8, padding:'0.35rem 0.9rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', cursor:'pointer' }}>
          ← Dashboard
        </button>
      </div>

      <div className="rsf-body">

        {/* ── Left info panel ── */}
        <div className="rsf-left">
          <div style={{ position:'absolute', top:-80, right:-80, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-50, left:-50, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }}/>
          <div style={{ position:'relative', width:'100%', maxWidth:260 }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1.25rem', textAlign:'center' }}>🧑‍⚕️</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'white', marginBottom:'0.75rem', textAlign:'center', lineHeight:1.3 }}>
              Add a Team<br/>Member
            </h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'rgba(255,255,255,0.75)', lineHeight:1.75, marginBottom:'1.75rem', textAlign:'center' }}>
              Register staff, therapists, and admins securely. They'll receive login credentials instantly.
            </p>
            {[
              { icon:'🔐', text:'Credentials emailed automatically' },
              { icon:'🎭', text:'Role-based access control' },
              { icon:'📋', text:'All registrations are audit-logged' },
              { icon:'🔒', text:'Passwords are hashed & secure' },
            ].map((item, i) => (
              <div key={i} className="rsf-info-pill">
                <span style={{ fontSize:'0.9rem', flexShrink:0, marginTop:'0.1rem' }}>{item.icon}</span>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'rgba(255,255,255,0.88)', lineHeight:1.55 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right form ── */}
        <div className="rsf-right">
          <div className="rsf-card">

            {/* Header */}
            <div style={{ marginBottom:'1.75rem' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:`linear-gradient(135deg,${C.skyFaint},${C.mint})`, border:`1px solid ${C.borderFaint}`, borderRadius:100, padding:'0.28rem 0.85rem', marginBottom:'0.85rem' }}>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:800, color:C.skyDeep, textTransform:'uppercase', letterSpacing:'0.1em' }}>🔐 Admin Only</span>
              </div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,1.85rem)', color:C.textDark, marginBottom:'0.35rem' }}>Register Staff Member</h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textLight }}>Fill in the details below to create a new staff account.</p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background:C.redLight, border:`1.5px solid #f5a0a0`, borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1.25rem', display:'flex', gap:'0.6rem', alignItems:'flex-start' }}>
                <span style={{ flexShrink:0 }}>⚠️</span>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.84rem', color:C.red, lineHeight:1.5 }}>{error}</span>
              </div>
            )}

            {/* NOTE: using onSubmit on the form — the button type="submit" triggers it */}
            <form onSubmit={handleSubmit} noValidate>

              {/* Role picker */}
              <div style={{ marginBottom:'1.5rem' }}>
                <span className="rsf-label">Role *</span>
                <div className="rsf-role-grid">
                  {ROLES.map(r => (
                    <div key={r.value} className={`rsf-role-card${form.role === r.value ? ' selected' : ''}`}
                      onClick={() => set('role', r.value)}>
                      <div style={{ fontSize:'1.4rem', marginBottom:'0.3rem' }}>{r.icon}</div>
                      <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:700, color:form.role===r.value?C.skyDeep:C.textDark }}>{r.label}</div>
                      <div style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', color:C.textLight, marginTop:'0.2rem' }}>{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rsf-divider"/>

              {/* Name + Phone */}
              <div className="rsf-row">
                <div className="rsf-field">
                  <label className="rsf-label">Full Name *</label>
                  <input className="rsf-input" type="text" value={form.full_name} placeholder="Dr. Jane Doe"
                    onChange={e => set('full_name', e.target.value)}/>
                </div>
                <div className="rsf-field">
                  <label className="rsf-label">Phone</label>
                  <input className="rsf-input" type="tel" value={form.phone} placeholder="+977 98XXXXXXXX"
                    onChange={e => set('phone', e.target.value)}/>
                </div>
              </div>

              {/* Email + Department */}
              <div className="rsf-row">
                <div className="rsf-field">
                  <label className="rsf-label">Email *</label>
                  <input className="rsf-input" type="email" value={form.email} placeholder="jane@pujasamargi.com.np"
                    onChange={e => set('email', e.target.value)}/>
                </div>
                <div className="rsf-field">
                  <label className="rsf-label">Department</label>
                  <select className="rsf-select" value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">Select…</option>
                    <option value="clinical">Clinical</option>
                    <option value="admin">Administration</option>
                    <option value="it">IT / Tech</option>
                    <option value="support">Client Support</option>
                    <option value="finance">Finance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="rsf-row">
                <div className="rsf-field">
                  <label className="rsf-label">Password *</label>
                  <div style={{ position:'relative' }}>
                    <input className="rsf-input" type={showPw ? 'text' : 'password'} value={form.password}
                      placeholder="Min 8 chars" onChange={e => set('password', e.target.value)}
                      style={{ paddingRight:'3.5rem' }}/>
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position:'absolute', right:'0.75rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:C.textLight, cursor:'pointer', fontSize:'0.72rem', fontFamily:'var(--font-body)', fontWeight:600 }}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <div className="rsf-field">
                  <label className="rsf-label">Confirm Password *</label>
                  <input className="rsf-input" type={showPw ? 'text' : 'password'} value={form.confirm}
                    placeholder="Repeat password" onChange={e => set('confirm', e.target.value)}/>
                </div>
              </div>

              {/* Password strength hint */}
              <div style={{ marginTop:'-0.75rem', marginBottom:'1.25rem', padding:'0.65rem 0.9rem', background:C.skyFainter, borderRadius:8, border:`1px solid ${C.borderFaint}` }}>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:C.textMid, lineHeight:1.7 }}>
                  Password must be <strong>8+ characters</strong>, include <strong>1 uppercase</strong> letter and <strong>1 number</strong>.
                </div>
              </div>

              {/* Notes */}
              <div className="rsf-field">
                <label className="rsf-label">Internal Notes <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
                <textarea className="rsf-input" value={form.notes} rows={3}
                  placeholder="e.g. Specialises in CBT, hired for night shift…"
                  onChange={e => set('notes', e.target.value)}
                  style={{ resize:'vertical', minHeight:80 }}/>
              </div>

              {/* type="submit" ensures Enter key and form submission work correctly */}
              <button type="submit" className="rsf-submit" disabled={loading}>
                {loading ? '⏳ Registering…' : `➕ Register ${ROLES.find(r=>r.value===form.role)?.label || 'Staff'}`}
              </button>
            </form>

            <div style={{ marginTop:'1.25rem', textAlign:'center' }}>
              <button onClick={() => navigate('/staff/admin')}
                style={{ background:'none', border:'none', color:C.textLight, fontFamily:'var(--font-body)', fontSize:'0.82rem', cursor:'pointer' }}>
                ← Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}