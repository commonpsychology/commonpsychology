// src/pages/RegisterPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'

const CSS = `
  .reg-root {
    min-height: 100vh;
    background: var(--earth-cream, #f5f0e8);
    display: grid;
    grid-template-columns: 400px 1fr;
    align-items: stretch;
  }
  .reg-left {
    background: linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2.5rem;
    border-right: 1px solid rgba(0,0,0,0.06);
  }
  .reg-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2rem);
    overflow-y: auto;
  }
  .reg-card {
    background: white;
    border-radius: 20px;
    padding: clamp(1.75rem, 4vw, 2.5rem);
    width: 100%;
    max-width: 460px;
    box-shadow: 0 8px 48px rgba(0,0,0,0.1);
    margin: 1rem 0;
  }
  .reg-input {
    width: 100%;
    padding: 0.85rem 1rem;
    border: 2px solid var(--earth-cream, #e8e0d0);
    border-radius: 10px;
    font-family: var(--font-body);
    font-size: 0.95rem;
    outline: none;
    color: var(--text-dark);
    transition: border-color 0.2s;
    background: white;
    box-sizing: border-box;
  }
  .reg-input:focus { border-color: var(--green-soft, #4caf50); }
  .reg-btn {
    width: 100%;
    padding: 0.9rem;
    background: var(--green-deep, #1a5c38);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    font-family: var(--font-body);
    margin-top: 0.5rem;
  }
  .reg-btn:hover:not(:disabled) { background: #154a2d; transform: translateY(-1px); }
  .reg-btn:disabled { background: #aaa; cursor: not-allowed; }
  .reg-feature {
    display: flex;
    align-items: center;
    gap: 10px;
    background: white;
    border-radius: 10px;
    padding: 0.75rem 1rem;
    font-size: 0.85rem;
    color: var(--text-mid);
    font-weight: 500;
    font-family: var(--font-body);
  }
  @media (max-width: 900px) {
    .reg-root { grid-template-columns: 320px 1fr; }
  }
  @media (max-width: 680px) {
    .reg-root  { grid-template-columns: 1fr; }
    .reg-left  { display: none; }
    .reg-right { padding: 1.5rem 1rem; align-items: flex-start; padding-top: 2rem; }
    .reg-card  { border-radius: 16px; max-width: 100%; margin: 0; }
  }
`
function injectCSS() {
  if (document.getElementById('reg-css')) return
  const s = document.createElement('style')
  s.id = 'reg-css'; s.textContent = CSS
  document.head.appendChild(s)
}

const FIELDS = [
  { key:'name',     label:'Full Name',        type:'text',     ph:'Your full name' },
  { key:'email',    label:'Email',            type:'email',    ph:'you@example.com' },
  { key:'password', label:'Password',         type:'password', ph:'Min 8 chars, 1 uppercase, 1 number' },
  { key:'confirm',  label:'Confirm Password', type:'password', ph:'Repeat your password' },
]

export default function RegisterPage() {
  useEffect(() => { injectCSS() }, [])
  const { navigate }          = useRouter()
  const { register }          = useAuth()
  const [form, setForm]       = useState({ name:'', email:'', password:'', confirm:'' })
  const [showPw, setShowPw]   = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const update = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // ── BACK BUTTON PREVENTION ──────────────────────────────────
  useEffect(() => {
    window.history.replaceState(null, '', window.location.href)

    const blockBack = () => {
      window.history.pushState(null, '', window.location.href)
    }
    window.addEventListener('popstate', blockBack)
    return () => window.removeEventListener('popstate', blockBack)
  }, [])
  // ────────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return }
    if (form.password.length < 8)        { setError('Password must be at least 8 characters.'); return }
    if (!/[A-Z]/.test(form.password))    { setError('Password must contain at least one uppercase letter.'); return }
    if (!/[0-9]/.test(form.password))    { setError('Password must contain at least one number.'); return }
    if (form.password !== form.confirm)  { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div style={{ minHeight:'100vh', background:'var(--earth-cream)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div style={{ background:'white', borderRadius:20, padding:'3rem 2.5rem', maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 8px 48px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>✅</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', color:'var(--green-deep)', marginBottom:'1rem' }}>Check your email!</h2>
        <p style={{ color:'var(--text-light)', lineHeight:1.7, marginBottom:'1.5rem', fontFamily:'var(--font-body)' }}>
          We sent a verification link to <strong>{form.email}</strong>. Please verify before signing in.
        </p>
        <button onClick={() => navigate('/signin')}
          style={{ background:'var(--green-deep)', color:'white', border:'none', borderRadius:10, padding:'0.85rem 2rem', fontWeight:700, cursor:'pointer', fontSize:'0.95rem', fontFamily:'var(--font-body)' }}>
          Go to Sign In →
        </button>
      </div>
    </div>
  )

  return (
    <div className="reg-root">

      {/* ── Left panel ── */}
      <div className="reg-left">
        <div style={{ textAlign:'center', maxWidth:280 }}>
          <div style={{ fontSize:'3.5rem', marginBottom:'1.5rem' }}>🧠</div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.9rem', color:'var(--green-deep)', marginBottom:'1rem', lineHeight:1.3 }}>
            Start Your<br/>Healing Journey
          </h2>
          <p style={{ color:'var(--text-light)', fontSize:'0.9rem', lineHeight:1.7, marginBottom:'1.75rem' }}>
            Join thousands of Nepalis taking the first step toward better mental health.
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
            {['✅ Free mental health assessments','🔒 Private & confidential sessions','🌿 Culturally sensitive therapists','📱 Access from anywhere in Nepal'].map((item,i) => (
              <div key={i} className="reg-feature">{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="reg-right">
        <div className="reg-card">
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'1.75rem', color:'var(--green-deep)', marginBottom:'0.3rem' }}>Create your account</h1>
          <p style={{ color:'var(--text-light)', fontSize:'0.88rem', marginBottom:'1.75rem', fontFamily:'var(--font-body)' }}>Free to join. No credit card needed.</p>

          {error && (
            <div style={{ background:'#fff0f0', border:'1.5px solid #f5a0a0', borderRadius:8, padding:'0.75rem 1rem', marginBottom:'1.25rem', color:'#c0392b', fontSize:'0.875rem', fontFamily:'var(--font-body)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            {FIELDS.map(({ key, label, type, ph }) => (
              <div key={key}>
                <label style={{ display:'block', fontSize:'0.82rem', fontWeight:600, color:'var(--text-mid)', marginBottom:'0.4rem', fontFamily:'var(--font-body)' }}>{label}</label>
                <div style={{ position:'relative' }}>
                  <input
                    className="reg-input"
                    type={type === 'password' && showPw ? 'text' : type}
                    value={form[key]}
                    placeholder={ph}
                    onChange={e => update(key, e.target.value)}
                    style={type === 'password' ? { paddingRight:'3.5rem' } : {}}
                  />
                  {type === 'password' && (
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      style={{ position:'absolute', right:'0.85rem', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--text-light)', cursor:'pointer', fontSize:'0.78rem', fontFamily:'var(--font-body)', fontWeight:600 }}>
                      {showPw ? 'Hide' : 'Show'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="submit" className="reg-btn" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p style={{ marginTop:'1.25rem', textAlign:'center', fontSize:'0.82rem', color:'var(--text-light)', fontFamily:'var(--font-body)' }}>
            By registering you agree to our{' '}
            <button onClick={() => navigate('/privacy')} style={{ background:'none', border:'none', color:'var(--green-deep)', cursor:'pointer', fontSize:'0.82rem', fontFamily:'var(--font-body)' }}>Privacy Policy</button>.
          </p>
          <div style={{ marginTop:'1rem', textAlign:'center', fontSize:'0.875rem', color:'var(--text-light)', fontFamily:'var(--font-body)' }}>
            Already have an account?{' '}
            <button onClick={() => navigate('/signin')} style={{ background:'none', border:'none', color:'var(--green-deep)', fontWeight:700, cursor:'pointer', fontSize:'0.875rem', fontFamily:'var(--font-body)' }}>
              Sign In →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}