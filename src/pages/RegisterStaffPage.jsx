// src/pages/RegisterStaffPage.jsx
// Updated from original:
//   - Role selector (therapist / staff / admin / rider) — was hardcoded to therapist only
//   - Conditional fields per role:
//       therapist → specialization
//       staff/admin → department
//       rider → vehicle_type, vehicle_number, area
//   - Left panel, success screen, and submit button text all update with role
//   - All original fields (name, email, phone, password, confirm, notes) preserved
//   - All original validation logic preserved unchanged
//   - API payload sends role + all role-specific fields

import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'
import { admin } from '../services/api'

async function registerStaffApi(payload) {
  if (payload.role === 'rider') {
    return admin.registerRider(payload)
  }
  return admin.registerStaff(payload)
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

// ── Role metadata ─────────────────────────────────────────────
// Drives the left panel, role badge, submit button, and success screen.
const ROLES = {
  therapist: {
    icon: '🩺',
    label: 'Therapist',
    color: C.skyDeep,
    colorBg: C.skyFaint,
    colorBorder: C.skyBright,
    desc: 'Access to appointments, notes & client records only',
    pillDesc: 'Add a new therapist. They get a therapist dashboard — not admin controls.',
    pills: [
      { icon: '🔐', text: 'Credentials emailed automatically' },
      { icon: '🩺', text: 'Therapist-only dashboard access' },
      { icon: '🚫', text: 'No admin or staff permissions granted' },
      { icon: '📋', text: 'All registrations are audit-logged' },
    ],
    successTitle: 'Therapist Registered!',
    successDesc: (s) => `${s.full_name} has been added as a Therapist. They can log in at /staff.`,
  },
  staff: {
    icon: '🧑‍💼',
    label: 'Staff',
    color: '#0e7490',
    colorBg: '#ecfeff',
    colorBorder: '#22d3ee',
    desc: 'Access to staff dashboard, client management, and orders',
    pillDesc: 'Add a new staff member with access to day-to-day operations.',
    pills: [
      { icon: '🔐', text: 'Credentials emailed automatically' },
      { icon: '🧑‍💼', text: 'Staff dashboard access only' },
      { icon: '🚫', text: 'Cannot access admin controls' },
      { icon: '📋', text: 'All registrations are audit-logged' },
    ],
    successTitle: 'Staff Member Registered!',
    successDesc: (s) => `${s.full_name} has been added as Staff. They can log in at /staff.`,
  },
  admin: {
    icon: '🛡️',
    label: 'Admin',
    color: '#92400e',
    colorBg: '#fffbeb',
    colorBorder: '#f59e0b',
    desc: 'Full access — manage staff, products, orders, and settings',
    pillDesc: 'Grant full admin access. Use with care — admins can manage all staff.',
    pills: [
      { icon: '🔐', text: 'Credentials emailed automatically' },
      { icon: '🛡️', text: 'Full admin dashboard access' },
      { icon: '⚠️', text: 'Can register and deactivate other users' },
      { icon: '📋', text: 'All registrations are audit-logged' },
    ],
    successTitle: 'Admin Registered!',
    successDesc: (s) => `${s.full_name} has been added as Admin. They can log in at /staff.`,
  },
  rider: {
    icon: '🚴',
    label: 'Delivery Rider',
    color: '#065f46',
    colorBg: '#ecfdf5',
    colorBorder: '#10b981',
    desc: 'Access to the delivery portal — view & update assigned orders only',
    pillDesc: 'Register a delivery rider. They log in at /delivery — separate from staff.',
    pills: [
      { icon: '🔐', text: 'Credentials emailed automatically' },
      { icon: '📦', text: 'Delivery portal access only (/delivery)' },
      { icon: '🚴', text: 'Can update delivery status on assigned orders' },
      { icon: '🚫', text: 'No access to admin, staff, or therapist areas' },
    ],
    successTitle: 'Delivery Rider Registered!',
    successDesc: (s) => `${s.full_name} has been added as a Delivery Rider. They log in at /delivery.`,
  },
}

const CSS = `
  .rsf-root { min-height:100vh; background:${C.skyGhost}; display:flex; flex-direction:column; }
  .rsf-topbar {
    background:${heroGrad}; padding:0 clamp(1rem,3vw,2rem); height:56px;
    display:flex; align-items:center; justify-content:space-between;
    position:sticky; top:0; z-index:100; box-shadow:0 2px 16px rgba(0,127,168,0.25);
  }
  .rsf-body { flex:1; display:grid; grid-template-columns:340px 1fr; min-height:calc(100vh - 56px); }
  .rsf-left {
    background:${heroGrad}; display:flex; flex-direction:column;
    align-items:center; justify-content:center; padding:3rem 2rem;
    position:relative; overflow:hidden;
  }
  .rsf-right {
    display:flex; align-items:center; justify-content:center;
    padding:clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2.5rem);
    overflow-y:auto; background:${C.white};
  }
  .rsf-card { width:100%; max-width:560px; }
  .rsf-input {
    width:100%; padding:0.85rem 1rem; border:1.5px solid ${C.borderFaint};
    border-radius:12px; font-family:var(--font-body); font-size:0.92rem;
    color:${C.textDark}; background:${C.white}; outline:none;
    box-sizing:border-box; transition:all 0.2s;
  }
  .rsf-input:focus { border-color:${C.skyBright}; background:${C.skyGhost}; box-shadow:0 0 0 3.5px rgba(0,191,255,0.12); }
  .rsf-select {
    width:100%; padding:0.85rem 1rem; border:1.5px solid ${C.borderFaint};
    border-radius:12px; font-family:var(--font-body); font-size:0.92rem;
    color:${C.textDark}; background:${C.white}; outline:none;
    box-sizing:border-box; cursor:pointer; appearance:none;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a9aaa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat:no-repeat; background-position:right 1rem center; padding-right:2.5rem; transition:all 0.2s;
  }
  .rsf-select:focus { border-color:${C.skyBright}; box-shadow:0 0 0 3.5px rgba(0,191,255,0.12); }
  .rsf-label { display:block; font-family:var(--font-body); font-size:0.78rem; font-weight:700; color:${C.textMid}; margin-bottom:0.45rem; text-transform:uppercase; letter-spacing:0.06em; }
  .rsf-field { margin-bottom:1.3rem; }
  .rsf-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
  .rsf-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:1rem; }
  .rsf-submit {
    width:100%; padding:1rem; border-radius:14px; border:none;
    background:${btnGrad}; color:white; font-family:var(--font-body);
    font-weight:800; font-size:1rem; cursor:pointer;
    box-shadow:0 6px 22px rgba(0,191,255,0.35); transition:all 0.2s;
    letter-spacing:0.02em; margin-top:0.5rem;
  }
  .rsf-submit:hover:not(:disabled) { opacity:0.88; transform:translateY(-1px); }
  .rsf-submit:disabled { background:${C.borderFaint}; color:${C.textLight}; box-shadow:none; cursor:not-allowed; }
  .rsf-info-pill {
    display:flex; align-items:flex-start; gap:0.6rem;
    background:rgba(255,255,255,0.13); border:1px solid rgba(255,255,255,0.22);
    border-radius:12px; padding:0.75rem 1rem; margin-bottom:0.65rem;
  }
  .rsf-divider { height:1px; background:${C.borderFaint}; margin:1.5rem 0; }
  .rsf-role-badge {
    display:flex; align-items:center; gap:0.75rem;
    border-radius:14px; padding:1rem 1.25rem; width:100%;
    box-sizing:border-box; margin-bottom:1.3rem;
    border:2px solid; transition:all 0.2s;
  }
  .rsf-role-grid {
    display:grid; grid-template-columns:1fr 1fr; gap:0.6rem; margin-bottom:1.5rem;
  }
  .rsf-role-option {
    display:flex; align-items:center; gap:0.6rem;
    padding:0.85rem 1rem; border-radius:12px; cursor:pointer;
    border:2px solid ${C.borderFaint}; background:${C.white};
    transition:all 0.18s; font-family:var(--font-body);
  }
  .rsf-role-option:hover { border-color:${C.skyBright}; background:${C.skyFainter}; }
  .rsf-role-option.selected { border-color:${C.skyBright}; background:${C.skyFaint}; box-shadow:0 0 0 3px rgba(0,191,255,0.12); }
  .rsf-role-option.role-admin.selected  { border-color:#f59e0b; background:#fffbeb; box-shadow:0 0 0 3px rgba(245,158,11,0.12); }
  .rsf-role-option.role-rider.selected  { border-color:#10b981; background:#ecfdf5; box-shadow:0 0 0 3px rgba(16,185,129,0.12); }
  .rsf-role-option.role-staff.selected  { border-color:#22d3ee; background:#ecfeff; box-shadow:0 0 0 3px rgba(34,211,238,0.12); }
  .rsf-section-header {
    display:flex; align-items:center; gap:0.5rem;
    font-family:var(--font-body); font-size:0.7rem; font-weight:800;
    color:${C.textMid}; text-transform:uppercase; letter-spacing:0.1em;
    margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:1.5px solid ${C.borderFaint};
  }
  .rsf-conditional { animation:fadeIn 0.2s ease; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:none} }
  @media (max-width:900px) { .rsf-body { grid-template-columns:280px 1fr; } }
  @media (max-width:680px) {
    .rsf-body { grid-template-columns:1fr; }
    .rsf-left { display:none; }
    .rsf-right { padding:1.5rem 1.25rem; align-items:flex-start; }
    .rsf-card { max-width:100%; }
    .rsf-row { grid-template-columns:1fr; }
    .rsf-row-3 { grid-template-columns:1fr; }
    .rsf-role-grid { grid-template-columns:1fr 1fr; }
  }
`

function injectCSS() {
  if (document.getElementById('rsf-css')) return
  const s = document.createElement('style')
  s.id = 'rsf-css'; s.textContent = CSS
  document.head.appendChild(s)
}

const INITIAL = {
  full_name: '', email: '', phone: '',
  password: '', confirm: '',
  // therapist
  specialization: '',
  // staff / admin
  department: '',
  // rider
  vehicle_type: '', vehicle_number: '', area: '',
  // shared
  notes: '',
}

export default function RegisterStaffPage() {
  useEffect(() => { injectCSS() }, [])
  const { navigate }                   = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [role,    setRole]    = useState('therapist')   // default same as original
  const [form,    setForm]    = useState(INITIAL)
  const [showPw,  setShowPw]  = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Only admin can access — unchanged from original
  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/staff'); return }
    if (user.role !== 'admin') { navigate('/portal'); return }
  }, [user, authLoading])

   if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.skyGhost }}>
      <div style={{ textAlign:'center', color:C.textLight }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🔐</div>
        <p style={{ fontFamily:'var(--font-body)' }}>Verifying session…</p>
      </div>
    </div>
  )

  // ── ADD THIS: if not admin, render nothing (redirect fires via useEffect) ──
  if (!user || user.role !== 'admin') return null

  // Reset role-specific fields when role changes so stale values don't get sent
  function changeRole(r) {
    setRole(r)
    setError('')
    setForm(f => ({
      ...f,
      specialization: '', department: '',
      vehicle_type: '', vehicle_number: '', area: '',
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // ── Validation — identical to original ───────────────────
    if (!form.full_name.trim())                                 { setError('Full name is required.'); return }
    if (!form.email.trim())                                     { setError('Email is required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setError('Please enter a valid email address.'); return }
    if (!form.password)                                         { setError('Password is required.'); return }
    if (form.password.length < 8)                               { setError('Password must be at least 8 characters.'); return }
    if (!/[A-Z]/.test(form.password))                           { setError('Password needs at least one uppercase letter.'); return }
    if (!/[0-9]/.test(form.password))                           { setError('Password needs at least one number.'); return }
    if (form.password !== form.confirm)                         { setError('Passwords do not match.'); return }

    // ── Role-specific validation ─────────────────────────────
    if (role === 'rider' && !form.area.trim()) {
      setError('Delivery area is required for riders.'); return
    }

    setLoading(true)
    try {
      // Build payload — base fields always sent, role-specific fields only when relevant
      const payload = {
        full_name: form.full_name.trim(),
        email:     form.email.trim().toLowerCase(),
        phone:     form.phone.trim() || null,
        password:  form.password,
        role,
        notes:     form.notes.trim() || null,
        // therapist
        ...(role === 'therapist' ? {
          specialization: form.specialization.trim() || null,
        } : {}),
        // staff / admin
        ...(role === 'staff' || role === 'admin' ? {
          department: form.department.trim() || null,
        } : {}),
        // rider
        ...(role === 'rider' ? {
          vehicle_type:   form.vehicle_type   || null,
          vehicle_number: form.vehicle_number.trim() || null,
          area:           form.area.trim()    || null,
        } : {}),
      }

      await registerStaffApi(payload)
      setSuccess({ ...form, role })
      setForm(INITIAL)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading screen — identical to original ────────────────
  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:C.skyGhost }}>
      <div style={{ textAlign:'center', color:C.textLight }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🌿</div>
        <p style={{ fontFamily:'var(--font-body)' }}>Verifying session…</p>
      </div>
    </div>
  )

  // ── Success screen — updated to reflect actual registered role ──
  if (success) {
    const meta = ROLES[success.role] || ROLES.therapist
    const portalPath = success.role === 'rider' ? '/delivery' : '/staff'
    return (
      <div style={{ minHeight:'100vh', background:C.skyGhost, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
        <div style={{ background:C.white, borderRadius:20, padding:'3rem 2.5rem', maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 8px 48px rgba(0,127,168,0.12)', border:`1px solid ${C.borderFaint}` }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:meta.colorBg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem', fontSize:'2rem', border:`2px solid ${meta.colorBorder}` }}>
            {meta.icon}
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', color:C.textDark, marginBottom:'0.5rem' }}>{meta.successTitle}</h2>
          <p style={{ color:C.textLight, lineHeight:1.7, marginBottom:'0.5rem', fontFamily:'var(--font-body)', fontSize:'0.9rem' }}>
            <strong style={{ color:C.textDark }}>{success.full_name}</strong> has been added as a{' '}
            <strong style={{ color:meta.color }}>{meta.label}</strong>.
          </p>
          <p style={{ color:C.textLight, fontFamily:'var(--font-body)', fontSize:'0.85rem', marginBottom:'0.5rem' }}>
            They can now log in at <strong>{portalPath}</strong> to access their{' '}
            {success.role === 'rider' ? 'delivery dashboard' : `${meta.label.toLowerCase()} dashboard`}.
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
  }

  const meta = ROLES[role] || ROLES.therapist

  return (
    <div className="rsf-root">

      {/* ── Top bar — identical to original ── */}
      <div className="rsf-topbar">
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <img src="/header.png" alt="" style={{ height:28, objectFit:'contain' }} onError={e => e.target.style.display='none'}/>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem', color:'white', fontWeight:700, lineHeight:1.1 }}>Common Psychology</div>
            <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Staff Registration</div>
          </div>
        </div>
        <button onClick={() => navigate('/staff/admin')}
          style={{ background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.25)', color:'rgba(255,255,255,0.85)', borderRadius:8, padding:'0.35rem 0.9rem', fontFamily:'var(--font-body)', fontSize:'0.78rem', cursor:'pointer' }}>
          ← Dashboard
        </button>
      </div>

      <div className="rsf-body">

        {/* ── Left info panel — updates with selected role ── */}
        <div className="rsf-left">
          <div style={{ position:'absolute', top:-80, right:-80, width:280, height:280, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-50, left:-50, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }}/>
          <div style={{ position:'relative', width:'100%', maxWidth:260 }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'1.25rem', textAlign:'center', transition:'all 0.2s' }}>{meta.icon}</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'white', marginBottom:'0.75rem', textAlign:'center', lineHeight:1.3 }}>
              Register a<br/>{meta.label}
            </h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'rgba(255,255,255,0.75)', lineHeight:1.75, marginBottom:'1.75rem', textAlign:'center' }}>
              {meta.pillDesc}
            </p>
            {meta.pills.map((item, i) => (
              <div key={i} className="rsf-info-pill">
                <span style={{ fontSize:'0.9rem', flexShrink:0, marginTop:'0.1rem' }}>{item.icon}</span>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'rgba(255,255,255,0.88)', lineHeight:1.55 }}>{item.text}</span>
              </div>
            ))}
            {/* Portal path indicator */}
            <div style={{ marginTop:'1.25rem', background:'rgba(255,255,255,0.1)', borderRadius:10, padding:'0.65rem 0.9rem', textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.2rem' }}>Portal login</div>
              <div style={{ fontFamily:'monospace', fontSize:'0.9rem', color:'white', fontWeight:700 }}>
                {role === 'rider' ? '/delivery' : '/staff'}
              </div>
            </div>
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
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.5rem,3vw,1.85rem)', color:C.textDark, marginBottom:'0.35rem' }}>Register New Staff</h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textLight }}>Select a role first — the form will show the right fields for that account type.</p>
            </div>

            {/* Error banner — identical to original */}
            {error && (
              <div style={{ background:C.redLight, border:`1.5px solid #f5a0a0`, borderRadius:10, padding:'0.85rem 1rem', marginBottom:'1.25rem', display:'flex', gap:'0.6rem', alignItems:'flex-start' }}>
                <span style={{ flexShrink:0 }}>⚠️</span>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.84rem', color:C.red, lineHeight:1.5 }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              {/* ── SECTION 1: Role selector ── */}
              <div style={{ marginBottom:'1.5rem' }}>
                <span className="rsf-label">Role *</span>
                <div className="rsf-role-grid">
                  {Object.entries(ROLES).map(([key, m]) => (
                    <button
                      key={key} type="button"
                      className={`rsf-role-option role-${key}${role === key ? ' selected' : ''}`}
                      onClick={() => changeRole(key)}
                    >
                      <span style={{ fontSize:'1.3rem', flexShrink:0 }}>{m.icon}</span>
                      <div style={{ textAlign:'left' }}>
                        <div style={{ fontWeight:700, fontSize:'0.82rem', color:C.textDark }}>{m.label}</div>
                        <div style={{ fontSize:'0.65rem', color:C.textLight, lineHeight:1.4, marginTop:2 }}>{m.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected role badge */}
                <div className="rsf-role-badge" style={{ background:meta.colorBg, borderColor:meta.colorBorder }}>
                  <span style={{ fontSize:'1.6rem' }}>{meta.icon}</span>
                  <div>
                    <div style={{ fontFamily:'var(--font-body)', fontWeight:800, color:meta.color, fontSize:'0.95rem' }}>{meta.label}</div>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color:C.textLight, marginTop:2 }}>{meta.desc}</div>
                  </div>
                  <div style={{ marginLeft:'auto', fontFamily:'monospace', fontSize:'0.72rem', color:meta.color, fontWeight:700, background:meta.colorBg, border:`1px solid ${meta.colorBorder}`, borderRadius:6, padding:'0.2rem 0.5rem' }}>
                    {role === 'rider' ? '/delivery' : '/staff'}
                  </div>
                </div>
              </div>

              <div className="rsf-divider" style={{ marginTop:0 }}/>

              {/* ── SECTION 2: Personal details (identical to original) ── */}
              <div className="rsf-section-header">
                <span>👤</span> Personal Details
              </div>

              <div className="rsf-row">
                <div className="rsf-field">
                  <label className="rsf-label">Full Name *</label>
                  <input className="rsf-input" type="text" value={form.full_name}
                    placeholder={role === 'rider' ? 'Bikash Tamang' : role === 'therapist' ? 'Dr. Jane Doe' : 'Full name'}
                    onChange={e => set('full_name', e.target.value)}/>
                </div>
                <div className="rsf-field">
                  <label className="rsf-label">Phone</label>
                  <input className="rsf-input" type="tel" value={form.phone} placeholder="+977 98XXXXXXXX"
                    onChange={e => set('phone', e.target.value)}/>
                </div>
              </div>

              <div className="rsf-field">
                <label className="rsf-label">Email *</label>
                <input className="rsf-input" type="email" value={form.email}
                  placeholder={role === 'rider' ? 'rider@commonpsychology.com.np' : 'staff@commonpsychology.com.np'}
                  onChange={e => set('email', e.target.value)}/>
              </div>

              <div className="rsf-divider"/>

              {/* ── SECTION 3: Role-specific fields ── */}
              <div className="rsf-section-header">
                <span>{meta.icon}</span> {meta.label} Details
              </div>

              {/* THERAPIST fields */}
              {role === 'therapist' && (
                <div className="rsf-conditional">
                  <div className="rsf-row">
                    <div className="rsf-field">
                      <label className="rsf-label">Specialization</label>
                      <select className="rsf-select" value={form.specialization} onChange={e => set('specialization', e.target.value)}>
                        <option value="">Select…</option>
                        <option value="cbt">Cognitive Behavioural Therapy (CBT)</option>
                        <option value="psychotherapy">Psychotherapy</option>
                        <option value="counselling">General Counselling</option>
                        <option value="trauma">Trauma & PTSD</option>
                        <option value="child">Child & Adolescent</option>
                        <option value="couples">Couples Therapy</option>
                        <option value="addiction">Addiction & Recovery</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="rsf-field">
                      <label className="rsf-label">Department</label>
                      <input className="rsf-input" type="text" value={form.department} placeholder="e.g. Clinical"
                        onChange={e => set('department', e.target.value)}/>
                    </div>
                  </div>
                </div>
              )}

              {/* STAFF / ADMIN fields */}
              {(role === 'staff' || role === 'admin') && (
                <div className="rsf-conditional">
                  <div className="rsf-field">
                    <label className="rsf-label">Department</label>
                    <input className="rsf-input" type="text" value={form.department}
                      placeholder={role === 'admin' ? 'e.g. Management' : 'e.g. Reception, Orders, Support'}
                      onChange={e => set('department', e.target.value)}/>
                  </div>
                </div>
              )}

              {/* RIDER fields */}
              {role === 'rider' && (
                <div className="rsf-conditional">
                  <div className="rsf-row">
                    <div className="rsf-field">
                      <label className="rsf-label">Vehicle Type</label>
                      <select className="rsf-select" value={form.vehicle_type} onChange={e => set('vehicle_type', e.target.value)}>
                        <option value="">Select…</option>
                        <option value="bicycle">🚲 Bicycle</option>
                        <option value="motorcycle">🏍️ Motorcycle</option>
                        <option value="scooter">🛵 Scooter</option>
                        <option value="van">🚐 Van</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="rsf-field">
                      <label className="rsf-label">Vehicle Number / ID</label>
                      <input className="rsf-input" type="text" value={form.vehicle_number}
                        placeholder="e.g. BA 1 PA 2345"
                        onChange={e => set('vehicle_number', e.target.value)}/>
                    </div>
                  </div>
                  <div className="rsf-field">
                    <label className="rsf-label">Delivery Area *</label>
                    <input className="rsf-input" type="text" value={form.area}
                      placeholder="e.g. Lazimpat, Thamel, Baneshwor"
                      onChange={e => set('area', e.target.value)}/>
                    <div style={{ marginTop:'0.4rem', fontFamily:'var(--font-body)', fontSize:'0.72rem', color:C.textLight }}>
                      The zone this rider will cover. Shown on their delivery dashboard.
                    </div>
                  </div>
                  {/* Rider portal note */}
                  <div style={{ background:'#ecfdf5', border:'1.5px solid #10b981', borderRadius:10, padding:'0.75rem 1rem', marginBottom:'1.3rem', display:'flex', gap:'0.5rem', alignItems:'flex-start' }}>
                    <span style={{ flexShrink:0 }}>🚴</span>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'#065f46', lineHeight:1.6 }}>
                      This rider will log in at <strong>/delivery</strong> — not /staff. They can only view and update the delivery status of orders assigned to them.
                    </div>
                  </div>
                </div>
              )}

              <div className="rsf-divider"/>

              {/* ── SECTION 4: Password (identical to original) ── */}
              <div className="rsf-section-header">
                <span>🔐</span> Login Credentials
              </div>

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

              {/* Password hint — identical to original */}
              <div style={{ marginTop:'-0.75rem', marginBottom:'1.25rem', padding:'0.65rem 0.9rem', background:C.skyFainter, borderRadius:8, border:`1px solid ${C.borderFaint}` }}>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:C.textMid, lineHeight:1.7 }}>
                  Password must be <strong>8+ characters</strong>, include <strong>1 uppercase</strong> letter and <strong>1 number</strong>.
                </div>
              </div>

              {/* ── SECTION 5: Notes (identical to original) ── */}
              <div className="rsf-field">
                <label className="rsf-label">Internal Notes <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0 }}>(optional)</span></label>
                <textarea className="rsf-input" value={form.notes} rows={3}
                  placeholder={
                    role === 'rider'     ? 'e.g. Available Mon–Sat, knows Kathmandu valley well…' :
                    role === 'therapist' ? 'e.g. Specialises in CBT, available Mon–Fri…' :
                    'e.g. Joining from branch, covers weekends…'
                  }
                  onChange={e => set('notes', e.target.value)}
                  style={{ resize:'vertical', minHeight:80 }}/>
              </div>

              <button type="submit" className="rsf-submit" disabled={loading}>
                {loading ? '⏳ Registering…' : `${meta.icon} Register ${meta.label}`}
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