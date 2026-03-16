/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useRef, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'

/* ── Auth pages where navbar should not render ── */
const AUTH_PAGES = ['/signin', '/register']

/* ── Nav groups ── */
const NAV = [
  {
    label: 'Care',
    path: '/services',
    children: [
      { label: 'All Services',     path: '/services',    icon: '🩺', desc: 'Everything we offer' },
      { label: 'Our Therapists',   path: '/therapists',  icon: '👩‍⚕️', desc: 'Meet the team' },
      { label: 'Book a Session',   path: '/book',        icon: '📅', desc: 'Schedule now' },
      { label: 'Online Courses',   path: '/courses',     icon: '📚', desc: 'Self-paced programs' },
      { label: 'Store',            path: '/store',       icon: '🛍️', desc: 'Books & workbooks' },
    ],
  },
  {
    label: 'Tools',
    path: '/assessments',
    children: [
      { label: 'Assessments',      path: '/assessments', icon: '📝', desc: 'PHQ-9, GAD-7, DASS-21' },
      { label: 'AI Mental Tools',  path: '/ai-tools',    icon: '🧠', desc: 'CBT, check-ins, stress' },
      { label: 'Free Resources',   path: '/resources',   icon: '📄', desc: 'Worksheets & guides' },
      { label: 'My Portal',        path: '/portal',      icon: '🔐', desc: 'Your therapy dashboard' },
    ],
  },
  {
    label: 'Learn',
    path: '/blog',
    children: [
      { label: 'Blog & Articles',  path: '/blog',        icon: '✍️', desc: 'Expert-written insights' },
      { label: 'Research',         path: '/research',    icon: '🔬', desc: 'Publications & studies' },
      { label: 'Community',        path: '/community',   icon: '🤝', desc: 'Support groups & forums' },
    ],
  },
  {
    label: 'Our Works',
    path: '/our-works',
    children: [
      { label: 'Workshops',    path: '/workshops',   icon: '🎓', desc: 'Live & recorded sessions' },
      { label: 'Social Work',  path: '/social-work', icon: '🤝', desc: 'Community outreach programs' },
      { label: 'Gallery',      path: '/gallery',     icon: '🖼️', desc: 'Photos & event memories' },
     
    ],
  },
  {
    label: 'About',
    path: '/about',
    children: [
      { label: 'Contact',          path: '/contact',     icon: '📞', desc: 'Get in touch' },
      { label: 'Payment & Ethics', path: '/payment',     icon: '🔒', desc: 'Billing & legal info' },
    ],
  },
]

/* ══════════════════════════════════════
   AVATAR DROPDOWN
══════════════════════════════════════ */
function AvatarDropdown({ onNavigate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  function handleLogout() {
    setOpen(false)
    onNavigate('/signin')
  }

  function handleMyAccount() {
    setOpen(false)
    onNavigate('/account')
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        style={{
          width: 38, height: 38,
          borderRadius: '50%',
          border: `2px solid ${open ? 'var(--sky)' : 'var(--blue-pale)'}`,
          background: 'linear-gradient(135deg, #0f3460 0%, #2980b9 100%)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: open ? '0 0 0 3px rgba(41,128,185,0.2)' : 'none',
          flexShrink: 0,
          overflow: 'hidden',
          padding: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--sky)'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(41,128,185,0.15)'
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.borderColor = 'var(--blue-pale)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      >
        {/* Person icon SVG */}
        <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      <div style={{
        position: 'absolute',
        top: 'calc(100% + 12px)',
        right: 0,
        width: 200,
        background: 'var(--white)',
        borderRadius: 14,
        border: '1px solid var(--blue-pale)',
        boxShadow: '0 20px 56px rgba(15,52,96,0.14), 0 2px 8px rgba(0,0,0,0.06)',
        padding: '0.4rem',
        zIndex: 400,
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none',
        transform: open ? 'translateY(0)' : 'translateY(-8px)',
        transition: 'opacity 0.16s ease, transform 0.16s ease',
      }}>
        {/* Caret */}
        <div style={{
          position: 'absolute', top: -7, right: 14,
          width: 14, height: 8, overflow: 'hidden',
        }}>
          <div style={{
            width: 10, height: 10,
            background: 'var(--white)',
            border: '1px solid var(--blue-pale)',
            transform: 'rotate(45deg)',
            margin: '3px auto 0',
          }} />
        </div>

        {/* User info header */}
        <div style={{
          padding: '0.7rem 0.8rem 0.6rem',
          borderBottom: '1px solid var(--blue-pale)',
          marginBottom: '0.3rem',
        }}>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '0.83rem',
            fontWeight: 700, color: 'var(--text-dark)',
          }}>Priya Sharma</div>
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: '0.72rem',
            color: 'var(--text-light)', marginTop: 1,
          }}>priya@email.com</div>
        </div>

        {/* My Account */}
        <button
          onClick={handleMyAccount}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            width: '100%', padding: '0.6rem 0.8rem',
            borderRadius: 8, border: 'none',
            background: 'transparent', cursor: 'pointer',
            textAlign: 'left', transition: 'background 0.14s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--off-white)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--sky-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.82rem', flexShrink: 0,
          }}>👤</span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.83rem',
            fontWeight: 600, color: 'var(--text-dark)',
          }}>My Account</span>
        </button>

        {/* Portal shortcut */}
        <button
          onClick={() => { setOpen(false); onNavigate('/portal') }}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            width: '100%', padding: '0.6rem 0.8rem',
            borderRadius: 8, border: 'none',
            background: 'transparent', cursor: 'pointer',
            textAlign: 'left', transition: 'background 0.14s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--off-white)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{
            width: 28, height: 28, borderRadius: 7,
            background: 'var(--blue-mist)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.82rem', flexShrink: 0,
          }}>🔐</span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.83rem',
            fontWeight: 600, color: 'var(--text-dark)',
          }}>My Portal</span>
        </button>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--blue-pale)', margin: '0.35rem 0.4rem' }} />

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            width: '100%', padding: '0.6rem 0.8rem',
            borderRadius: 8, border: 'none',
            background: 'transparent', cursor: 'pointer',
            textAlign: 'left', transition: 'background 0.14s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{
            width: 28, height: 28, borderRadius: 7,
            background: '#fff0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.82rem', flexShrink: 0,
          }}>🚪</span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: '0.83rem',
            fontWeight: 600, color: '#e53e3e',
          }}>Log Out</span>
        </button>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   DROPDOWN ITEM (nav groups)
══════════════════════════════════════ */
function DropdownItem({ group, currentPath, onNavigate }) {
  const [open, setOpen] = useState(false)
  const ref      = useRef(null)
  const timerRef = useRef(null)
  const isActive = group.children.some(c => c.path === currentPath)

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  function handleMouseEnter() { clearTimeout(timerRef.current); setOpen(true) }
  function handleMouseLeave() { timerRef.current = setTimeout(() => setOpen(false), 80) }

  return (
    <div ref={ref} style={{ position: 'relative' }}
      onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <button
        onClick={() => { onNavigate(group.path); setOpen(false) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '0.25rem 0', background: 'none', border: 'none',
          fontFamily: 'var(--font-body)', fontSize: '0.88rem',
          fontWeight: 600, letterSpacing: '0.01em',
          color: isActive ? 'var(--sky)' : 'var(--text-mid)',
          cursor: 'pointer', transition: 'color 0.2s', position: 'relative',
        }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--green-deep)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-mid)' }}
      >
        {group.label}
        {isActive && (
          <span style={{ position: 'absolute', bottom: -4, left: 0, right: 0, height: 2, background: 'var(--sky)', borderRadius: 2 }} />
        )}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
          style={{ opacity: 0.45, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{ position: 'absolute', top: '100%', left: '-20px', right: '-20px', height: 18, background: 'transparent', zIndex: 299 }} />
      )}

      <div style={{
        position: 'absolute', top: 'calc(100% + 16px)', left: '50%', minWidth: 256,
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--blue-pale)',
        boxShadow: '0 20px 56px rgba(26,58,74,0.13), 0 2px 8px rgba(0,0,0,0.05)',
        padding: '0.45rem', zIndex: 300,
        opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
        transform: open ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-8px)',
        transition: 'opacity 0.16s ease, transform 0.16s ease',
      }}>
        <div style={{ position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)', width: 14, height: 8, overflow: 'hidden' }}>
          <div style={{ width: 10, height: 10, background: 'var(--white)', border: '1px solid var(--blue-pale)', transform: 'rotate(45deg)', margin: '3px auto 0' }} />
        </div>
        {group.children.map(item => {
          const active = currentPath === item.path
          return (
            <button key={item.path + item.label}
              onClick={() => { onNavigate(item.path); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                width: '100%', padding: '0.6rem 0.8rem',
                borderRadius: 'var(--radius-md)',
                background: active ? 'var(--sky-light)' : 'transparent',
                border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.14s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--off-white)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: active ? 'var(--sky)' : 'var(--blue-mist)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.88rem', transition: 'background 0.14s',
              }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.83rem', fontWeight: 700, color: active ? 'var(--sky)' : 'var(--text-dark)', lineHeight: 1.2 }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.71rem', color: 'var(--text-light)', marginTop: 1 }}>{item.desc}</div>
              </div>
              {active && <span style={{ color: 'var(--sky)', fontSize: '0.65rem' }}>●</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   MOBILE GROUP
══════════════════════════════════════ */
function MobileGroup({ group, currentPath, onNavigate }) {
  const [open, setOpen] = useState(false)
  const isActive = group.children.some(c => c.path === currentPath)

  return (
    <li>
      <button onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '0.8rem 0', background: 'none', border: 'none',
          borderBottom: open ? 'none' : '1px solid var(--earth-cream)',
          fontFamily: 'var(--font-body)', fontSize: '0.98rem',
          fontWeight: isActive ? 700 : 600,
          color: isActive ? 'var(--sky)' : 'var(--text-mid)',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {group.label}
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none"
          style={{ opacity: 0.4, flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <ul style={{ listStyle: 'none', paddingLeft: '0.5rem', paddingBottom: '0.4rem', borderBottom: '1px solid var(--earth-cream)' }}>
          {group.children.map(item => (
            <li key={item.path + item.label}>
              <a href={item.path} onClick={e => { e.preventDefault(); onNavigate(item.path) }}
                className={currentPath === item.path ? 'nav-active' : ''}
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.55rem 0', borderBottom: '1px solid rgba(0,0,0,0.04)', textDecoration: 'none' }}
              >
                <span style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: currentPath === item.path ? 'var(--sky)' : 'var(--blue-mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem' }}>{item.icon}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: currentPath === item.path ? 700 : 500, color: currentPath === item.path ? 'var(--sky)' : 'var(--text-mid)' }}>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

/* ══════════════════════════════════════
   MAIN NAVBAR
══════════════════════════════════════ */
export default function Navbar() {
  const { navigate, currentPath } = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [lang, setLang]         = useState('EN')

  if (AUTH_PAGES.includes(currentPath)) return null

  function go(path) {
    navigate(path)
    setMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <nav className="navbar">
        {/* LEFT: Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <div className="navbar-logo" onClick={() => go('/')} style={{ cursor: 'pointer' }}>
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.5 2 5.5 4.5 5 8c-.3 2 .5 4 2 5.5L12 22l5-8.5c1.5-1.5 2.3-3.5 2-5.5C18.5 4.5 15.5 2 12 2zm0 9a3 3 0 110-6 3 3 0 010 6z"/>
              </svg>
            </div>
            <div>
              <div className="logo-text">Puja Samargi</div>
              <div className="logo-sub">Mental Wellness Center</div>
            </div>
          </div>
        </div>

        {/* CENTRE: Nav links */}
        <div className="navbar-links" style={{ gap: '1.75rem' }}>
          {NAV.map(group => (
            <DropdownItem key={group.label} group={group} currentPath={currentPath} onNavigate={go} />
          ))}
        </div>

        {/* RIGHT: lang + Book Session + Avatar + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {/* Language toggle */}
          <button
            onClick={() => setLang(l => l === 'EN' ? 'NP' : 'EN')}
            style={{
              padding: '0.28rem 0.6rem', border: '1.5px solid var(--green-pale)',
              borderRadius: 100, background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 700,
              color: 'var(--green-deep)', cursor: 'pointer', letterSpacing: '0.04em',
              transition: 'background 0.18s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--green-mist)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            🌐 {lang}
          </button>

          {/* Desktop: Sign In (shown when not logged in) + Book Session + Avatar */}
          <div className="navbar-cta">
            <button className="btn btn-outline" onClick={() => go('/signin')}>Sign In</button>
            <button className="btn btn-primary" onClick={() => go('/book')}>Book Session</button>
          </div>

          {/* Avatar dropdown — shown after Book Session */}
          <AvatarDropdown onNavigate={go} />

          {/* Hamburger */}
          <button className="hamburger" aria-label="Toggle menu" onClick={() => setMenuOpen(o => !o)}>
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </nav>

      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} style={{ opacity: 1 }} />}

      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        <ul className="mobile-links" style={{ marginBottom: '0.75rem', paddingBottom: 0, borderBottom: 'none' }}>
          {NAV.map(group => (
            <MobileGroup key={group.label} group={group} currentPath={currentPath} onNavigate={go} />
          ))}
        </ul>
        {/* Mobile: account options */}
        <div style={{ padding: '0.75rem 0', borderTop: '1px solid var(--earth-cream)', marginBottom: '0.75rem' }}>
          <button onClick={() => { go('/account'); setMenuOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', padding: '0.6rem 0', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: '1rem' }}>👤</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-mid)' }}>My Account</span>
          </button>
          <button onClick={() => { go('/signin'); setMenuOpen(false) }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', width: '100%', padding: '0.6rem 0', background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ fontSize: '1rem' }}>🚪</span>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', fontWeight: 600, color: '#e53e3e' }}>Log Out</span>
          </button>
        </div>
        <div className="mobile-cta">
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => go('/book')}>Book a Session →</button>
          <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={() => go('/signin')}>Sign In</button>
        </div>
      </div>
    </>
  )
}