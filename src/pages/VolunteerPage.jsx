// src/pages/VolunteerPage.jsx
import { useState } from 'react'
import { useRouter } from '../context/RouterContext'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const C = {
  skyBright:   '#00BFFF', skyMid: '#009FD4', skyDeep: '#007BA8',
  skyFaint:    '#E0F7FF', skyFainter: '#F0FBFF', skyGhost: '#F8FEFF',
  white:       '#ffffff', mint: '#e8f3ee', mintPale: '#b8d5c8',
  textDark:    '#1a3a4a', textMid: '#2e6080', textLight: '#7a9aaa',
  border:      '#b0d4e8', borderFaint: '#daeef8', green: '#0B6623',
}
const navbarGrad  = `linear-gradient(to right,#00BFFF 0%,#00BFFF 2%,#e8f3ee 40%,#f0f8f4 60%,#f8fcfa 80%,#ffffff 100%)`
const heroGrad    = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 40%,${C.skyBright} 80%,#22d3ee 100%)`
const btnGrad     = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`
const sectionGrad = `linear-gradient(135deg,${C.skyFainter} 0%,${C.mint} 60%,${C.skyFaint} 100%)`

// Chevron SVG as a data URI for the select dropdown arrow
const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%237a9aaa' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`

const ROLES = [
  { id:'counsellor',  icon:'🧠', label:'Counsellor / Psychologist',  desc:'Provide supervised therapy sessions' },
  { id:'outreach',    icon:'🏘️', label:'Community Outreach Worker',   desc:'Field visits & awareness campaigns' },
  { id:'facilitator', icon:'🎓', label:'Workshop Facilitator',        desc:'Lead group workshops & trainings' },
  { id:'translator',  icon:'🌐', label:'Translator / Interpreter',    desc:'Nepali ↔ English & local dialects' },
  { id:'admin',       icon:'📋', label:'Administrative Support',      desc:'Scheduling, data entry & coordination' },
  { id:'social',      icon:'📱', label:'Social Media & Comms',        desc:'Content creation & digital outreach' },
]
const AVAILABILITY = ['Weekdays', 'Weekends', 'Evenings Only', 'Flexible']
const LANGUAGES    = ['Nepali', 'English', 'Maithili', 'Bhojpuri', 'Tamang', 'Newari', 'Other']
const DISTRICTS    = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Sindhupalchok', 'Dolakha', 'Chitwan', 'Pokhara', 'Other']

// ── Shared form primitives ────────────────────────────────────
function Label({ children, required }) {
  return (
    <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.72rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.5rem' }}>
      {children}{required && <span style={{ color:C.skyBright, marginLeft:3 }}>*</span>}
    </label>
  )
}

function Input({ style, ...props }) {
  const [f, setF] = useState(false)
  return (
    <input
      {...props}
      onFocus={e => { setF(true);  props.onFocus && props.onFocus(e) }}
      onBlur={e  => { setF(false); props.onBlur  && props.onBlur(e)  }}
      style={{
        width: '100%', padding: '0.8rem 1rem',
        border: `1.5px solid ${f ? C.skyBright : C.borderFaint}`,
        borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        color: C.textDark, backgroundColor: f ? C.skyGhost : C.white,
        outline: 'none', boxSizing: 'border-box',
        boxShadow: f ? `0 0 0 3px rgba(0,191,255,0.1)` : 'none',
        transition: 'all 0.2s', ...style,
      }}
    />
  )
}

// FIX: replaced `background` shorthand with `backgroundColor` so it doesn't
// conflict with backgroundImage / backgroundPosition / backgroundRepeat
function Select({ children, style, ...props }) {
  const [f, setF] = useState(false)
  return (
    <select
      {...props}
      onFocus={() => setF(true)}
      onBlur={()  => setF(false)}
      style={{
        width: '100%', padding: '0.8rem 1rem',
        border: `1.5px solid ${f ? C.skyBright : C.borderFaint}`,
        borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        color: C.textDark,
        backgroundColor:    f ? C.skyGhost : C.white,   // ← no shorthand conflict
        backgroundImage:    CHEVRON,
        backgroundRepeat:   'no-repeat',
        backgroundPosition: 'right 1rem center',
        outline: 'none', boxSizing: 'border-box',
        cursor: 'pointer', appearance: 'none',
        paddingRight: '2.5rem', ...style,
      }}
    >
      {children}
    </select>
  )
}

function Textarea({ style, ...props }) {
  const [f, setF] = useState(false)
  return (
    <textarea
      {...props}
      onFocus={() => setF(true)}
      onBlur={()  => setF(false)}
      style={{
        width: '100%', padding: '0.8rem 1rem',
        border: `1.5px solid ${f ? C.skyBright : C.borderFaint}`,
        borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: '0.9rem',
        color: C.textDark, backgroundColor: f ? C.skyGhost : C.white,
        outline: 'none', boxSizing: 'border-box',
        resize: 'vertical', minHeight: 110, ...style,
      }}
    />
  )
}

function PillGroup({ options, selected, onToggle }) {
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
      {options.map(opt => {
        const active = selected.includes(opt)
        return (
          <button key={opt} type="button" onClick={() => onToggle(opt)}
            style={{ padding:'0.4rem 1rem', borderRadius:100, border:`1.5px solid ${active ? C.skyBright : C.borderFaint}`, background:active ? btnGrad : C.white, color:active ? C.white : C.textMid, fontFamily:'var(--font-body)', fontSize:'0.8rem', fontWeight:active ? 700 : 500, cursor:'pointer', boxShadow:active ? '0 3px 12px rgba(0,191,255,0.28)' : 'none', transition:'all 0.18s' }}>
            {opt}
          </button>
        )
      })}
    </div>
  )
}

function Divider({ label }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.85rem', margin:'0.5rem 0 1.5rem' }}>
      <div style={{ flex:1, height:1, background:C.borderFaint }}/>
      <span style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>{label}</span>
      <div style={{ flex:1, height:1, background:C.borderFaint }}/>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export default function VolunteerPage() {
  const { navigate } = useRouter()

  const [form, setForm] = useState({
    firstName:'', lastName:'', email:'', phone:'',
    district:'', address:'', profession:'', organisation:'', experience:'',
    role:'', skills:'', reference:'',
    availability:[], languages:[], hours:'', motivation:'', consent:false,
  })
  const [submitted,  setSubmitted]  = useState(false)
  const [refCode,    setRefCode]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitErr,  setSubmitErr]  = useState('')
  const [step,       setStep]       = useState(1)
  const TOTAL_STEPS = 3

  const up        = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleArr = (k, v) => setForm(f => ({ ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v] }))

  const step1OK  = form.firstName && form.lastName && form.email && form.phone && form.district
  const step2OK  = form.role
  const step3OK  = form.availability.length > 0 && form.motivation && form.consent
  const progress = (step / TOTAL_STEPS) * 100

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setSubmitErr('')
    try {
      const res = await fetch(`${API_BASE}/volunteer`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      setRefCode(data.reference || `VOL-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`)
      setSubmitted(true)
    } catch (err) {
      setSubmitErr(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page-wrapper" style={{ background:C.skyGhost, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
        <div style={{ maxWidth:520, width:'100%', padding:'2rem', textAlign:'center' }}>
          <div style={{ background:C.white, borderRadius:24, padding:'3.5rem 2.5rem', border:`1.5px solid ${C.borderFaint}`, boxShadow:`0 8px 40px rgba(0,191,255,0.1)` }}>
            <div style={{ width:72, height:72, borderRadius:'50%', background:btnGrad, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.75rem', boxShadow:'0 8px 28px rgba(0,191,255,0.35)', fontSize:'2rem' }}>✓</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', color:C.textDark, marginBottom:'0.75rem' }}>Application Received!</h2>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.92rem', color:C.textMid, lineHeight:1.75, marginBottom:'0.5rem' }}>
              Thank you, <strong>{form.firstName}</strong>. Your volunteer application has been submitted successfully.
            </p>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textLight, lineHeight:1.7, marginBottom:'2rem' }}>
              Our team will review your application and reach out within <strong>3–5 business days</strong>.
            </p>
            <div style={{ background:sectionGrad, borderRadius:12, padding:'0.85rem 1.25rem', border:`1px solid ${C.borderFaint}`, marginBottom:'2rem' }}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.2rem' }}>Application Reference</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:C.skyMid, fontWeight:700 }}>{refCode}</div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={() => navigate('/')} style={{ padding:'0.65rem 1.5rem', borderRadius:10, border:'none', background:btnGrad, color:C.white, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>Back to Home</button>
              <button onClick={() => navigate('/social-work')} style={{ padding:'0.65rem 1.5rem', borderRadius:10, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.88rem', cursor:'pointer' }}>Our Programmes</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Multi-step form ─────────────────────────────────────────
  return (
    <div className="page-wrapper" style={{ background:C.skyGhost }}>

      {/* Hero */}
      <div style={{ background:heroGrad, padding:'5rem 4rem 3.5rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-70, right:-70, width:340, height:340, borderRadius:'50%', background:'rgba(255,255,255,0.07)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:navbarGrad, opacity:0.6 }}/>
        <div style={{ maxWidth:780, margin:'0 auto', position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.15)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.28)', borderRadius:100, padding:'0.32rem 1rem', marginBottom:'1.1rem' }}>
            <span style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em', color:'rgba(255,255,255,0.92)', textTransform:'uppercase', fontFamily:'var(--font-body)' }}>🤝 Volunteer With Us</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,2.9rem)', color:'white', marginBottom:'0.85rem', lineHeight:1.18 }}>Make a Difference<br/>in Someone's Mind</h1>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'1rem', color:'rgba(255,255,255,0.82)', lineHeight:1.75, maxWidth:500 }}>Join our community of professionals and passionate individuals bringing mental health support to those who need it most across Nepal.</p>
          <div style={{ display:'flex', gap:'2.5rem', marginTop:'2rem', flexWrap:'wrap' }}>
            {[['120+','Active Volunteers'],['38','Districts Covered'],['Free','CPD Training Provided']].map((s, i) => (
              <div key={i}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'white', fontWeight:700 }}>{s[0]}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:'rgba(255,255,255,0.65)', fontWeight:600, marginTop:2 }}>{s[1]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step progress bar */}
      <div style={{ background:navbarGrad, borderBottom:`1px solid ${C.borderFaint}`, padding:'0 4rem' }}>
        <div style={{ maxWidth:780, margin:'0 auto', display:'flex', alignItems:'center' }}>
          {['Personal Info', 'Role & Skills', 'Commitment'].map((label, i) => {
            const num = i + 1; const active = step === num; const done = step > num
            return (
              <div key={num} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', padding:'0.9rem 0', position:'relative', cursor:done ? 'pointer' : 'default' }}
                onClick={() => done && setStep(num)}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:active ? btnGrad : done ? C.skyFaint : 'transparent', border:`2px solid ${active || done ? C.skyBright : C.borderFaint}`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:800, color:active ? 'white' : done ? C.skyMid : C.textLight, marginBottom:'0.3rem', boxShadow:active ? '0 3px 12px rgba(0,191,255,0.35)' : 'none', transition:'all 0.25s' }}>
                  {done ? '✓' : num}
                </div>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', fontWeight:active ? 700 : 500, color:active ? C.skyDeep : C.textLight, whiteSpace:'nowrap' }}>{label}</span>
                {active && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2.5, background:btnGrad, borderRadius:2 }}/>}
                {i < 2 && <div style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', width:1, height:20, background:C.borderFaint }}/>}
              </div>
            )
          })}
        </div>
        {/* progress fill */}
        <div style={{ maxWidth:780, margin:'0 auto', height:2, background:C.borderFaint, borderRadius:2 }}>
          <div style={{ width:`${progress}%`, height:'100%', background:btnGrad, borderRadius:2, transition:'width 0.4s ease' }}/>
        </div>
      </div>

      {/* Form body */}
      <div style={{ maxWidth:780, margin:'0 auto', padding:'3rem 4rem 5rem' }}>
        <form onSubmit={handleSubmit}>

          {/* ── STEP 1 — Personal Info ── */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom:'2rem' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:C.textDark, marginBottom:'0.3rem' }}>Tell us about yourself</h2>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textLight }}>Basic details so our team can reach you.</p>
              </div>

              <Divider label="Full Name"/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem' }}>
                <div><Label required>First Name</Label><Input placeholder="Priya" value={form.firstName} onChange={e => up('firstName', e.target.value)} required/></div>
                <div><Label required>Last Name</Label><Input placeholder="Sharma" value={form.lastName} onChange={e => up('lastName', e.target.value)} required/></div>
              </div>

              <Divider label="Contact"/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem' }}>
                <div><Label required>Email Address</Label><Input type="email" placeholder="priya@email.com" value={form.email} onChange={e => up('email', e.target.value)} required/></div>
                <div><Label required>Phone / WhatsApp</Label><Input type="tel" placeholder="98XXXXXXXX" value={form.phone} onChange={e => up('phone', e.target.value)} required/></div>
              </div>

              <Divider label="Location"/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem' }}>
                <div>
                  <Label required>District</Label>
                  <Select value={form.district} onChange={e => up('district', e.target.value)} required>
                    <option value="">Select district…</option>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </Select>
                </div>
                <div><Label>City / Area</Label><Input placeholder="e.g. Baneshwor" value={form.address} onChange={e => up('address', e.target.value)}/></div>
              </div>

              <Divider label="Background"/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1.25rem' }}>
                <div><Label>Profession / Degree</Label><Input placeholder="e.g. BSc Psychology" value={form.profession} onChange={e => up('profession', e.target.value)}/></div>
                <div><Label>Organisation</Label><Input placeholder="e.g. TU, WHO Nepal" value={form.organisation} onChange={e => up('organisation', e.target.value)}/></div>
              </div>
              <div style={{ marginBottom:'1.25rem' }}>
                <Label>Years of Relevant Experience</Label>
                <Select value={form.experience} onChange={e => up('experience', e.target.value)}>
                  <option value="">Select…</option>
                  {['0–1 year (Student / Fresh graduate)','1–3 years','3–5 years','5–10 years','10+ years'].map(o => <option key={o}>{o}</option>)}
                </Select>
              </div>
              <div style={{ marginBottom:'2rem' }}>
                <Label>Languages Spoken</Label>
                <PillGroup options={LANGUAGES} selected={form.languages} onToggle={v => toggleArr('languages', v)}/>
              </div>

              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button type="button" disabled={!step1OK} onClick={() => setStep(2)}
                  style={{ padding:'0.75rem 2.2rem', borderRadius:12, border:'none', background:step1OK ? btnGrad : C.borderFaint, color:step1OK ? 'white' : C.textLight, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.92rem', cursor:step1OK ? 'pointer' : 'not-allowed', boxShadow:step1OK ? '0 4px 18px rgba(0,191,255,0.32)' : 'none', transition:'all 0.2s' }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2 — Role & Skills ── */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom:'2rem' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:C.textDark, marginBottom:'0.3rem' }}>Choose your role</h2>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textLight }}>Select the area where you'd like to contribute most.</p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.85rem', marginBottom:'2rem' }}>
                {ROLES.map(role => {
                  const active = form.role === role.id
                  return (
                    <button key={role.id} type="button" onClick={() => up('role', role.id)}
                      style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', padding:'1rem 1.1rem', borderRadius:14, textAlign:'left', border:`1.5px solid ${active ? C.skyBright : C.borderFaint}`, background:active ? C.skyFaint : C.white, cursor:'pointer', boxShadow:active ? `0 0 0 3px rgba(0,191,255,0.12),0 4px 18px rgba(0,191,255,0.14)` : 'none', transition:'all 0.2s' }}>
                      <span style={{ width:38, height:38, borderRadius:10, flexShrink:0, background:active ? btnGrad : C.skyFainter, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>{role.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.84rem', fontWeight:700, color:active ? C.skyDeep : C.textDark, marginBottom:'0.15rem' }}>{role.label}</div>
                        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.73rem', color:C.textLight, lineHeight:1.4 }}>{role.desc}</div>
                      </div>
                      {active && <div style={{ marginLeft:'auto', width:20, height:20, borderRadius:'50%', background:btnGrad, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ color:'white', fontSize:'0.65rem', fontWeight:800 }}>✓</span></div>}
                    </button>
                  )
                })}
              </div>

              <Divider label="Skills & Strengths"/>
              <div style={{ marginBottom:'1.25rem' }}>
                <Label>Relevant Skills</Label>
                <Textarea placeholder="e.g. CBT, Motivational Interviewing, Crisis First Aid…" value={form.skills} onChange={e => up('skills', e.target.value)}/>
              </div>
              <div style={{ marginBottom:'2rem' }}>
                <Label>How did you hear about us?</Label>
                <Select value={form.reference} onChange={e => up('reference', e.target.value)}>
                  <option value="">Select…</option>
                  {['Friend / Colleague','Social Media (Facebook/Instagram)','University / College','NGO / Partner Organisation','News / Media','Google Search','Other'].map(o => <option key={o}>{o}</option>)}
                </Select>
              </div>

              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'space-between' }}>
                <button type="button" onClick={() => setStep(1)} style={{ padding:'0.75rem 1.5rem', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}>← Back</button>
                <button type="button" disabled={!step2OK} onClick={() => setStep(3)}
                  style={{ padding:'0.75rem 2.2rem', borderRadius:12, border:'none', background:step2OK ? btnGrad : C.borderFaint, color:step2OK ? 'white' : C.textLight, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.92rem', cursor:step2OK ? 'pointer' : 'not-allowed', boxShadow:step2OK ? '0 4px 18px rgba(0,191,255,0.32)' : 'none', transition:'all 0.2s' }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Commitment ── */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom:'2rem' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:C.textDark, marginBottom:'0.3rem' }}>Your commitment</h2>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textLight }}>Help us understand your availability and what drives you.</p>
              </div>

              <Divider label="Availability"/>
              <div style={{ marginBottom:'1.5rem' }}>
                <Label required>When are you available?</Label>
                <PillGroup options={AVAILABILITY} selected={form.availability} onToggle={v => toggleArr('availability', v)}/>
              </div>
              <div style={{ marginBottom:'1.75rem' }}>
                <Label>Hours per week you can commit</Label>
                <Select value={form.hours} onChange={e => up('hours', e.target.value)}>
                  <option value="">Select…</option>
                  {['1–3 hours','4–6 hours','7–10 hours','10+ hours','Project-based only'].map(o => <option key={o}>{o}</option>)}
                </Select>
              </div>

              <Divider label="Motivation"/>
              <div style={{ marginBottom:'1.75rem' }}>
                <Label required>Why do you want to volunteer with Common Psychology?</Label>
                <Textarea placeholder="Share what motivates you…" value={form.motivation} onChange={e => up('motivation', e.target.value)} style={{ minHeight:130 }}/>
              </div>

              {/* Summary card */}
              <div style={{ background:sectionGrad, borderRadius:14, padding:'1.25rem 1.5rem', border:`1px solid ${C.borderFaint}`, marginBottom:'1.75rem' }}>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.7rem' }}>Your Application Summary</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.3rem 1.5rem' }}>
                  {[
                    ['Name',        `${form.firstName} ${form.lastName}`],
                    ['Email',       form.email        || '—'],
                    ['District',    form.district      || '—'],
                    ['Role',        ROLES.find(r => r.id === form.role)?.label || '—'],
                    ['Availability',form.availability.join(', ') || '—'],
                    ['Languages',   form.languages.join(', ')    || '—'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ paddingBottom:'0.3rem', borderBottom:`1px solid ${C.borderFaint}` }}>
                      <div style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:700, color:C.textLight }}>{k}</div>
                      <div style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:C.textDark, fontWeight:600, marginTop:1 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Consent */}
              <div style={{ marginBottom:'2rem' }}>
                <label style={{ display:'flex', alignItems:'flex-start', gap:'0.75rem', cursor:'pointer' }}>
                  <div onClick={() => up('consent', !form.consent)}
                    style={{ width:20, height:20, borderRadius:5, flexShrink:0, marginTop:2, border:`2px solid ${form.consent ? C.skyBright : C.border}`, background:form.consent ? btnGrad : C.white, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.18s' }}>
                    {form.consent && <span style={{ color:'white', fontSize:'0.65rem', fontWeight:800, lineHeight:1 }}>✓</span>}
                  </div>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.textMid, lineHeight:1.65 }}>
                    I confirm that the information provided is accurate. I understand that volunteering is subject to a brief interview and background check. I consent to Common Psychology storing my data for volunteer coordination purposes.
                  </span>
                </label>
              </div>

              {submitErr && (
                <div style={{ background:'#fff0f0', border:'1px solid #f5a0a0', borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem', fontSize:'0.85rem', color:'#c0392b' }}>
                  {submitErr}
                </div>
              )}

              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'space-between', alignItems:'center' }}>
                <button type="button" onClick={() => setStep(2)} style={{ padding:'0.75rem 1.5rem', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.9rem', cursor:'pointer' }}>← Back</button>
                <button type="submit" disabled={!step3OK || submitting}
                  style={{ padding:'0.85rem 2.8rem', borderRadius:12, border:'none', background:step3OK && !submitting ? btnGrad : C.borderFaint, color:step3OK && !submitting ? 'white' : C.textLight, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.95rem', cursor:step3OK && !submitting ? 'pointer' : 'not-allowed', boxShadow:step3OK && !submitting ? '0 6px 24px rgba(0,191,255,0.38)' : 'none', transition:'all 0.2s' }}>
                  {submitting ? 'Submitting…' : 'Submit Application →'}
                </button>
              </div>
            </div>
          )}

        </form>
      </div>

      {/* Why volunteer strip */}
      <div style={{ background:navbarGrad, borderTop:`1px solid ${C.borderFaint}`, padding:'3rem 4rem' }}>
        <div style={{ maxWidth:780, margin:'0 auto' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:C.textDark, marginBottom:'1.5rem', textAlign:'center' }}>Why volunteer with us?</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
            {[
              { icon:'📜', title:'Free CPD Training',     desc:'Certified continuing professional development included' },
              { icon:'🤝', title:'Supervised Practice',   desc:'Clinical supervision from licensed psychologists' },
              { icon:'🏆', title:'Certificate of Service',desc:'Official recognition for your contribution' },
              { icon:'🌐', title:'Network & Community',   desc:"Connect with Nepal's mental health professionals" },
            ].map((b, i) => (
              <div key={i} style={{ background:C.white, borderRadius:14, padding:'1.1rem 1.2rem', border:`1px solid ${C.borderFaint}`, boxShadow:'0 2px 10px rgba(0,191,255,0.06)' }}>
                <div style={{ fontSize:'1.4rem', marginBottom:'0.4rem' }}>{b.icon}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:700, color:C.textDark, marginBottom:'0.2rem' }}>{b.title}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color:C.textLight, lineHeight:1.5 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
