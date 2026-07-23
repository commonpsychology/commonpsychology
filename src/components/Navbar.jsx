import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from '../context/RouterContext'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LanguageContext'



const AUTH_PAGES = ['/signin', '/register']

const NAV = [
  { label: 'Care', labelNP: 'सेवा', path: '/services', children: [
    { label: 'All Services',    labelNP: 'सबै सेवाहरू',       path: '/services',     icon: '🏥', desc: 'Everything we offer',         descNP: 'हाम्रो सबै सेवाहरू' },
    { label: 'Our Therapists',  labelNP: 'थेरापिस्टहरू',      path: '/therapists',   icon: '👩‍⚕️', desc: 'Meet the team',              descNP: 'टिमसँग भेट्नुहोस्' },
    { label: 'Book a Session',  labelNP: 'सत्र बुक गर्नुहोस्', path: '/book',        icon: '📅', desc: 'Schedule now',               descNP: 'अहिले तालिका बनाउनुहोस्' },
    { label: 'Online Courses',  labelNP: 'अनलाइन कोर्सहरू',   path: '/courses',      icon: '📚', desc: 'Self-paced programs',         descNP: 'स्व-गतिका कार्यक्रमहरू' },
    { label: 'Store',           labelNP: 'स्टोर',              path: '/store',        icon: '🛍️', desc: 'Books & workbooks',           descNP: 'किताब र वर्कबुकहरू' },
  ]},
  { label: 'Tools', labelNP: 'उपकरणहरू', path: '/assessments', children: [
    { label: 'Assessments',     labelNP: 'मूल्यांकनहरू',      path: '/assessments',  icon: '📝', desc: 'PHQ-9, GAD-7, DASS-21',      descNP: 'PHQ-9, GAD-7, DASS-21' },
    { label: 'Free Resources',  labelNP: 'निःशुल्क स्रोतहरू',  path: '/resources',   icon: '📄', desc: 'Worksheets & guides',         descNP: 'वर्कशीट र गाइडहरू' },
        { label: 'Mental Fitness',       labelNP: 'मानसिक फिटनेस',       path: '/mental-fitness',       icon: '🧠', desc: 'Improve your mental health',      descNP: 'तपाईंको मानसिक स्वास्थ्य बढाउनुहोस्' },
    { label: 'My Portal',       labelNP: 'मेरो पोर्टल',       path: '/portal',       icon: '🔐', desc: 'Your therapy dashboard',      descNP: 'तपाईंको थेरापी ड्यासबोर्ड' },
  ]},
  { label: 'Learn', labelNP: 'सिक्नुहोस्', path: '/blog', children: [
    { label: 'Blog & Articles', labelNP: 'ब्लग र लेखहरू',     path: '/blog',         icon: '✍️', desc: 'Expert-written insights',     descNP: 'विशेषज्ञ-लिखित अन्तर्दृष्टि' },
    { label: 'Research',        labelNP: 'अनुसन्धान',         path: '/research',     icon: '🔬', desc: 'Publications & studies',      descNP: 'प्रकाशन र अध्ययनहरू' },
        { label: 'News',        labelNP: 'समाचार',         path: '/our-news',     icon: '📰', desc: 'Latest updates and announcements',      descNP: 'नवीनतम अपडेट र घोषणाहरू' },

    { label: 'Community',       labelNP: 'समुदाय',            path: '/community',    icon: '🤝', desc: 'Support groups & forums',     descNP: 'सहयोग समूह र फोरमहरू' },
    { label: 'Animations',       labelNP: 'न्यूरोसाइन्स',            path: '/neuro-science',    icon: '🎬', desc: 'Educational videos',     descNP: 'शिक्षामूलक भिडियोहरू' },
  ]},
  { label: 'Our Works', labelNP: 'हाम्रा कामहरू', path: '/workshops', children: [
    { label: 'Workshops & Training', labelNP: 'कार्यशालाहरू',  path: '/workshops',    icon: '🎓', desc: 'Live & recorded sessions',    descNP: 'लाइभ र रेकर्ड गरिएका सत्रहरू' },
    { label: 'Active Projects',     labelNP: 'सक्रिय कार्यक्रमहरू',     path: '/project-work',  icon: '🤝', desc: 'Community projects', descNP: 'सामुदायिक कार्यक्रमहरू' },
    { label: 'Gallery',         labelNP: 'फोटो ग्यालेरी',          path: '/gallery',      icon: '🖼️', desc: 'Photos & event memories',     descNP: 'फोटो र कार्यक्रम स्मृतिहरू' },
        { label: 'Annual Reports', labelNP: 'वार्षिक रिपोर्टहरू', path: '/annual-reports', icon: '📊', desc: 'Our annual reports', descNP: 'हाम्रो वार्षिक रिपोर्टहरू' },

    { label: 'Disaster Mangement', labelNP: 'विपद व्यवस्थापन', path: '/disaster-management', icon: '🆘', desc: 'Our works and Commitment', descNP: 'हाम्रो काम र प्रतिवद्धता' },
  ]},
  
  { label: 'About', labelNP: ' हाम्रो बारेमा', path: '/about', children: [
    { label: 'Contact',          labelNP: 'सम्पर्क गर्नुहोस्',           path: '/contact',      icon: '📞', desc: 'Get in touch',               descNP: 'सम्पर्कमा आउनुहोस्' },
    { label: 'Payment & Ethics', labelNP: 'भुक्तान र नैतिकता', path: '/payment-info', icon: '🔒', desc: 'Billing & legal info',       descNP: 'बिलिङ र कानुनी जानकारी' },
    { label: 'Staff Information', labelNP: 'हाम्रो टोली', path: '/staff-detail', icon: '👥', desc: 'Meet our team', descNP: 'हाम्रो टोलीसँग भेट्नुहोस्' },
        { label: 'Notices',       labelNP: 'सूचनाहरू',   path: '/notices',   icon: '📌', desc: 'Important announcements',          descNP: 'महत्वपूर्ण घोषणाहरू' },
    { label: 'Our Values',       labelNP: 'हाम्रा वाचा',   path: '/our-values',   icon: '🌱', desc: 'What we stand for',          descNP: 'हामी के मा विश्वास गर्छौं' },
  ]},

  { label: 'Connect', labelNP: 'आश्रम', path: '/ashram', children: [
    { label: 'Connect',           labelNP: 'आश्रम',             path: '/ashram',       icon: '🏠', desc: 'Place to connect',           descNP: 'जोडिने स्थान' },
  ]},
]

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

function UserAvatar({ user, size = 38 }) {
  const initials = (user?.fullName || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors = [
    ['#c8e6c9','#2e7d32'], ['#bbdefb','#1565c0'], ['#f8bbd0','#880e4f'],
    ['#fff9c4','#f57f17'], ['#d1c4e9','#4527a0'], ['#b2dfdb','#00695c'],
  ]
  const [bg, fg] = colors[(user?.fullName || user?.email || '').charCodeAt(0) % colors.length]
  if (user?.avatarUrl)
    return <img src={user.avatarUrl} alt={user.fullName || 'User'}
      style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', display:'block' }} />
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:bg, color:fg,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontWeight:800, fontSize:size*0.36, fontFamily:'var(--font-display)', flexShrink:0 }}>
      {initials}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NOTIFICATION BELL  — shows ! badge when unread > 0,
   click → portal Notifications tab
───────────────────────────────────────────────────────────── */
function NotificationBell({ onNavigate }) {
  const { user }          = useAuth()
  const [unread, setUnread] = useState(0)

  const fetchUnread = useCallback(async () => {
    if (!user) return
    const token = localStorage.getItem('accessToken')
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/notifications?limit=1`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUnread(data.unreadCount || 0)
      }
    } catch {}
  }, [user])

  useEffect(() => {
    fetchUnread()
    const id = setInterval(fetchUnread, 2 * 60 * 1000)
    return () => clearInterval(id)
  }, [fetchUnread])

  // Clear badge immediately when portal marks notifications as read
  useEffect(() => {
    function onCleared() { setUnread(0) }
    window.addEventListener('cp-notifs-cleared', onCleared)
    return () => window.removeEventListener('cp-notifs-cleared', onCleared)
  }, [])

  if (!user) return null

  function handleClick() {
    setUnread(0)                                    // clear badge instantly
    sessionStorage.setItem('portalTab', 'Notifications')
    onNavigate('/portal')
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Notifications"
      style={{
        position: 'relative',
        width: 38, height: 38,
        borderRadius: '50%',
        border: '1.5px solid var(--blue-pale)',
        background: unread > 0 ? 'var(--sky-light)' : 'transparent',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, padding: 0,
        transition: 'border-color 0.2s, background 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--sky)'
        e.currentTarget.style.background  = 'var(--sky-light)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--blue-pale)'
        e.currentTarget.style.background  = unread > 0 ? 'var(--sky-light)' : 'transparent'
      }}
    >
      {/* Bell SVG */}
      <svg
        viewBox="0 0 24 24" width="18" height="18"
        fill="none" stroke={unread > 0 ? 'var(--sky)' : 'var(--text-mid)'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {/* ! badge */}
      {unread > 0 && (
        <span style={{
          position: 'absolute', top: -3, right: -3,
          minWidth: 16, height: 16,
          borderRadius: '50%',
          background: '#e53e3e',
          border: '2px solid white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.6rem', fontWeight: 900, color: 'white',
          lineHeight: 1, pointerEvents: 'none',
        }}>
          !
        </span>
      )}
    </button>
  )
}

function AvatarDropdown({ onNavigate }) {
  const { user, logout } = useAuth()
  const { lang, t }      = useLang()
  const [open, setOpen]  = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mouseup', close)
    return () => document.removeEventListener('mouseup', close)
  }, [])

  function handleOpen() { setOpen(o => !o) }

  async function handleLogout() { setOpen(false); await logout(); onNavigate('/signin') }

  if (!user) return (
    <button onClick={() => onNavigate('/signin')} aria-label="Sign in"
      style={{ width:38, height:38, borderRadius:'50%', border:'2px solid var(--blue-pale)',
        background:'linear-gradient(135deg,#0f3460 0%,#2980b9 100%)',
        cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
        transition:'border-color 0.2s', flexShrink:0, padding:0 }}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </button>
  )

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={handleOpen} aria-label="Account menu"
        style={{ width:38, height:38, borderRadius:'50%',
          border:`2px solid ${open ? 'var(--sky)' : 'var(--blue-pale)'}`,
          cursor:'pointer', padding:0, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          overflow:'hidden',
          boxShadow: open ? '0 0 0 3px rgba(41,128,185,0.2)' : 'none',
          transition:'border-color 0.2s, box-shadow 0.2s', background:'transparent' }}>
        <UserAvatar user={user} size={36} />
      </button>

      <div style={{ position:'absolute', top:'calc(100% + 12px)', right:0, width:232,
        background:'linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.85) 100%)',
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderRadius:16, border:'1px solid rgba(255,255,255,0.6)',
        boxShadow:'0 24px 60px rgba(0,60,90,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
        padding:'0.45rem', zIndex:400,
        opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
        transform: open ? 'translateY(0)' : 'translateY(-8px)',
        transition:'opacity 0.16s ease, transform 0.16s ease' }}>

        <div style={{ position:'absolute', top:-7, right:14, width:14, height:8, overflow:'hidden' }}>
          <div style={{ width:10, height:10, background:'var(--white)',
            border:'1px solid var(--blue-pale)', transform:'rotate(45deg)', margin:'3px auto 0' }} />
        </div>

        <div style={{ padding:'0.75rem 0.85rem 0.65rem', borderBottom:'1px solid var(--blue-pale)',
          marginBottom:'0.3rem', display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <UserAvatar user={user} size={32} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.83rem', fontWeight:700,
              color:'var(--text-dark)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user.fullName || t('myAccount')}
            </div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem',
              color:'var(--text-light)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user.email}
            </div>
          </div>
        </div>

        {user.role && user.role !== 'client' && (
          <div style={{ margin:'0 0.4rem 0.3rem', padding:'0.3rem 0.6rem',
            background:'var(--green-mist)', borderRadius:6, fontSize:'0.72rem',
            fontWeight:700, color:'var(--green-deep)', textTransform:'capitalize' }}>
            {user.role} account
          </div>
        )}

        {[
          { icon:'👤', label:t('myAccount'), path:'/account',     bg:'var(--sky-light)' },
          { icon:'🔐', label:t('myPortal'),  path:'/portal',      bg:'var(--blue-mist)' },
          ...(user.role === 'admin'
            ? [{ icon:'⚙️', label: lang==='EN' ? 'Admin Dashboard' : 'एडमिन ड्यासबोर्ड', path:'/staff/admin', bg:'var(--green-mist)' }]
            : []),
          ...(user.role === 'staff'
            ? [{ icon:'🏥', label: lang==='EN' ? 'Staff Portal' : 'स्टाफ पोर्टल', path:'/staff/portal', bg:'var(--green-mist)' }]
            : []),
          ...(user.role === 'therapist'
            ? [{ icon:'🩺', label: lang==='EN' ? 'Therapist Portal' : 'थेरापिस्ट पोर्टल', path:'/staff/therapist', bg:'var(--green-mist)' }]
            : []),
        ].map(item => (
          <button key={item.path} onClick={() => { setOpen(false); onNavigate(item.path) }}
            style={{ display:'flex', alignItems:'center', gap:'0.6rem', width:'100%',
              padding:'0.55rem 0.7rem', borderRadius:11, marginBottom:4,
              background:'linear-gradient(160deg, rgba(255,255,255,0.4) 0%, rgba(224,242,254,0.22) 100%)',
              border:'1px solid rgba(255,255,255,0.4)', cursor:'pointer', textAlign:'left',
              transition:'transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s ease, background 0.2s ease' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(160deg, rgba(255,255,255,0.7) 0%, rgba(186,230,253,0.45) 100%)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,123,168,0.14)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(160deg, rgba(255,255,255,0.4) 0%, rgba(224,242,254,0.22) 100%)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}>
            <span style={{ width:28, height:28, borderRadius:8, background:item.bg,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.82rem', flexShrink:0 }}>{item.icon}</span>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.83rem',
              fontWeight:600, color:'var(--text-dark)' }}>{item.label}</span>
          </button>
        ))}

        <div style={{ height:1, background:'var(--blue-pale)', margin:'0.35rem 0.4rem' }} />

        <button onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:'0.6rem', width:'100%',
            padding:'0.6rem 0.8rem', borderRadius:8, border:'none',
            background:'transparent', cursor:'pointer', textAlign:'left', transition:'background 0.14s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span style={{ width:28, height:28, borderRadius:7, background:'#fff0f0',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'0.82rem', flexShrink:0 }}>🚪</span>
          <span style={{ fontFamily:'var(--font-body)', fontSize:'0.83rem',
            fontWeight:600, color:'#e53e3e' }}>{t('logOut')}</span>
        </button>
      </div>
    </div>
  )
}

function DropdownItem({ group, currentPath, onNavigate, lang }) {
  const [open, setOpen] = useState(false)
  const ref      = useRef(null)
  const timerRef = useRef(null)
  const isActive = group.children.some(c => c.path === currentPath)
  const label    = lang === 'NP' ? (group.labelNP || group.label) : group.label

  useEffect(() => {
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mouseup', close)
    return () => document.removeEventListener('mouseup', close)
  }, [])

  return (
    <div ref={ref} style={{ position:'relative' }}
      onMouseEnter={() => { clearTimeout(timerRef.current); setOpen(true) }}
      onMouseLeave={() => { timerRef.current = setTimeout(() => setOpen(false), 80) }}>
      <button onClick={() => { onNavigate(group.path); setOpen(false) }}
        style={{ display:'flex', alignItems:'center', gap:4, padding:'0.25rem 0',
          background:'none', border:'none', fontFamily:'var(--font-body)', fontSize:'0.88rem',
          fontWeight:600, letterSpacing:'0.01em',
          color: isActive ? 'var(--sky)' : 'var(--text-mid)',
          cursor:'pointer', transition:'color 0.2s', position:'relative' }}
        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--green-deep)' }}
        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-mid)' }}>
        {label}
        {isActive && <span style={{ position:'absolute', bottom:-4, left:0, right:0,
          height:2, background:'var(--sky)', borderRadius:2 }} />}
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
          style={{ opacity:0.45, transition:'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && <div style={{ position:'absolute', top:'100%', left:'-20px', right:'-20px',
        height:18, background:'transparent', zIndex:299 }} />}

      <div style={{ position:'absolute', top:'calc(100% + 16px)', left:'50%', minWidth:272,
        background:'linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.85) 100%)',
        backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
        borderRadius:18, border:'1px solid rgba(255,255,255,0.6)',
        boxShadow:'0 24px 60px rgba(0,123,168,0.16), inset 0 1px 0 rgba(255,255,255,0.6)',
        padding:'0.5rem', zIndex:300,
        opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
        transform: open ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-8px)',
        transition:'opacity 0.16s ease, transform 0.16s ease' }}>
        <div style={{ position:'absolute', top:-7, left:'50%', transform:'translateX(-50%)',
          width:14, height:8, overflow:'hidden' }}>
          <div style={{ width:10, height:10, background:'rgba(255,255,255,0.9)',
            border:'1px solid rgba(255,255,255,0.6)', transform:'rotate(45deg)', margin:'3px auto 0' }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem' }}>
        {group.children.map(item => {
          const active = currentPath === item.path
          const iLabel = lang === 'NP' ? (item.labelNP || item.label) : item.label
          const iDesc  = lang === 'NP' ? (item.descNP  || item.desc)  : item.desc
          return (
            <button key={item.path + item.label}
              onClick={() => { onNavigate(item.path); setOpen(false) }}
              style={{ display:'flex', alignItems:'center', gap:'0.7rem', width:'100%',
                padding:'0.6rem 0.75rem', borderRadius:12,
                background: active
                  ? 'linear-gradient(160deg, rgba(186,230,253,0.6) 0%, rgba(224,242,254,0.4) 100%)'
                  : 'linear-gradient(160deg, rgba(255,255,255,0.5) 0%, rgba(224,242,254,0.28) 100%)',
                border: active ? '1px solid rgba(41,128,185,0.32)' : '1px solid rgba(255,255,255,0.45)',
                boxShadow: active ? '0 4px 14px rgba(0,123,168,0.12)' : '0 1px 3px rgba(0,60,90,0.04)',
                cursor:'pointer', textAlign:'left',
                transition:'transform 0.22s cubic-bezier(0.22,1,0.36,1), box-shadow 0.22s ease, background 0.22s ease, border-color 0.22s ease' }}
              onMouseEnter={e => {
                if (active) return
                e.currentTarget.style.background = 'linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(186,230,253,0.5) 100%)'
                e.currentTarget.style.borderColor = 'rgba(120,190,230,0.5)'
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,123,168,0.16)'
              }}
              onMouseLeave={e => {
                if (active) return
                e.currentTarget.style.background = 'linear-gradient(160deg, rgba(255,255,255,0.5) 0%, rgba(224,242,254,0.28) 100%)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,60,90,0.04)'
              }}>
              <span style={{ width:32, height:32, borderRadius:9, flexShrink:0,
                background: active ? 'var(--sky)' : 'rgba(255,255,255,0.75)',
                border: active ? 'none' : '1px solid rgba(255,255,255,0.6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'0.88rem' }}>{item.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.83rem', fontWeight:700,
                  color: active ? 'var(--sky)' : 'var(--text-dark)', lineHeight:1.2 }}>{iLabel}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.71rem',
                  color:'var(--text-light)', marginTop:1 }}>{iDesc}</div>
              </div>
              {active && <span style={{ color:'var(--sky)', fontSize:'0.65rem' }}>●</span>}
            </button>
          )
        })}
        </div>
      </div>
    </div>
  )
}

function MobileGroup({ group, currentPath, onNavigate, lang }) {
  const [open, setOpen] = useState(false)
  const isActive = group.children.some(c => c.path === currentPath)
  const label    = lang === 'NP' ? (group.labelNP || group.label) : group.label

  return (
    <li style={{ listStyle:'none', marginBottom:'0.5rem' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          width:'100%', padding:'0.85rem 1rem',
          background: open
            ? 'linear-gradient(160deg, rgba(186,230,253,0.6) 0%, rgba(224,242,254,0.4) 100%)'
            : 'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.42) 100%)',
          backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
          border: `1px solid ${open ? 'rgba(41,128,185,0.35)' : 'rgba(255,255,255,0.6)'}`,
          borderRadius:14,
          boxShadow: open ? '0 6px 18px rgba(0,123,168,0.16)' : '0 2px 10px rgba(0,60,90,0.05)',
          fontFamily:'var(--font-body)', fontSize:'0.95rem',
          fontWeight: isActive ? 700 : 600,
          color: isActive ? 'var(--sky)' : 'var(--text-dark)',
          cursor:'pointer', textAlign:'left', transition:'all 0.2s ease' }}>
        {label}
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none"
          style={{ opacity: open ? 0.7 : 0.4, flexShrink:0, transition:'transform 0.2s',
            color: open ? 'var(--sky)' : 'currentColor',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul style={{ listStyle:'none', padding:'0.5rem 0.3rem 0.2rem',
          display:'flex', flexDirection:'column', gap:'0.35rem' }}>
          {group.children.map(item => {
            const iLabel = lang === 'NP' ? (item.labelNP || item.label) : item.label
            const active = currentPath === item.path
            return (
              <li key={item.path + item.label} style={{ listStyle:'none' }}>
                <a href={item.path} onClick={e => { e.preventDefault(); onNavigate(item.path) }}
                  style={{ display:'flex', alignItems:'center', gap:'0.65rem',
                    padding:'0.6rem 0.75rem', borderRadius:12,
                    background: active
                      ? 'linear-gradient(160deg, rgba(186,230,253,0.55) 0%, rgba(224,242,254,0.35) 100%)'
                      : 'linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(224,242,254,0.28) 100%)',
                    border: active ? '1px solid rgba(41,128,185,0.3)' : '1px solid rgba(255,255,255,0.5)',
                    boxShadow: active ? '0 4px 12px rgba(0,123,168,0.1)' : '0 1px 3px rgba(0,60,90,0.04)',
                    textDecoration:'none', transition:'background 0.16s ease, transform 0.16s ease' }}>
                  <span style={{ width:28, height:28, borderRadius:8, flexShrink:0,
                    background: active ? 'var(--sky)' : 'rgba(255,255,255,0.8)',
                    border: active ? 'none' : '1px solid rgba(255,255,255,0.7)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'0.78rem' }}>{item.icon}</span>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--sky)' : 'var(--text-mid)' }}>{iLabel}</span>
                </a>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

export default function Navbar() {
  const { navigate, currentPath } = useRouter()
  const { user, logout }          = useAuth()
  const { lang, toggle, t }       = useLang()
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.left = '0'
    document.body.style.right = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      window.scrollTo(0, scrollY)
    }
  }, [menuOpen])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (AUTH_PAGES.includes(currentPath)) return null

  function go(path) { navigate(path); setMenuOpen(false); window.scrollTo({ top:0, behavior:'smooth' }) }
  async function handleMobileLogout() { setMenuOpen(false); await logout(); navigate('/signin') }

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu {
            background:
              radial-gradient(circle at 12% 0%, rgba(14,165,233,0.12), transparent 55%),
              radial-gradient(circle at 100% 100%, rgba(41,128,185,0.10), transparent 55%),
              linear-gradient(160deg, rgba(255,255,255,0.94) 0%, rgba(214,238,252,0.8) 55%, rgba(255,255,255,0.94) 100%) !important;
            backdrop-filter: blur(22px) !important;
            -webkit-backdrop-filter: blur(22px) !important;
            border-left: 1px solid rgba(255,255,255,0.6) !important;
            box-shadow: -14px 0 44px rgba(0,60,90,0.2) !important;
          }
          .mobile-user-card {
            background: linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(214,238,252,0.55) 100%);
            border: 1px solid rgba(255,255,255,0.6);
            border-radius: 16px;
            box-shadow: 0 8px 24px rgba(0,123,168,0.12), inset 0 1px 0 rgba(255,255,255,0.6);
            padding: 0.85rem 1rem;
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }
          .mobile-footer-item {
            background: linear-gradient(160deg, rgba(255,255,255,0.65) 0%, rgba(224,242,254,0.38) 100%) !important;
            border: 1px solid rgba(255,255,255,0.55) !important;
            border-radius: 12px !important;
            box-shadow: 0 2px 10px rgba(0,60,90,0.06) !important;
            padding: 0.65rem 0.85rem !important;
            margin-bottom: 0.45rem !important;
            transition: all 0.2s ease !important;
          }
          .mobile-footer-item:active {
            background: linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(186,230,253,0.55) 100%) !important;
            transform: scale(0.98);
          }
          .mobile-icon-badge {
            width: 30px; height: 30px; border-radius: 9px; flex-shrink: 0;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.85rem;
            background: rgba(255,255,255,0.75);
            border: 1px solid rgba(255,255,255,0.6);
            box-shadow: 0 2px 8px rgba(0,60,90,0.06);
          }
        }
      `}</style>
      <nav className="navbar">
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>
          <div className="navbar-logo" onClick={() => go('/')} style={{ cursor:'pointer',gap: 0 }}>
            <div className="logo-mark" style={{ overflow:'hidden', background:'transparent', border:'none' }}>
              <img src="/header.png" alt="COMMON PSYHCOLOGY (साझा मनोविज्ञान)"
                style={{ width:'100%', height:'100%', objectFit:'contain', display:'block' }} />
            </div>
            <div>
              <div className="logo-text" style={{
                fontSize: window.innerWidth <= 480 ? '0.62rem' : '1.05rem',
                fontWeight: 900,
                letterSpacing: '0.02em',
                color: 'var(--green-deep)',
                textShadow: '0 0 1px currentColor',
                lineHeight: 1.15,
              }}>
  {lang==='NP' ? 'साझा मनोविज्ञान' : 'COMMON PSYCHOLOGY'}
</div>
              <div className="logo-sub" style={{
                fontWeight: 800,
                letterSpacing: '0.03em',
                color: 'var(--green-deep)',
                fontSize: window.innerWidth <= 480 ? '0.52rem' : '0.7rem',
              }}>{lang==='NP' ? 'मानसिक स्वास्थ्य केन्द्र' : 'Mental Wellness Center'}</div>
            </div>
          </div>
        </div>

        <div className="navbar-links" style={{ gap:'1.75rem' }}>
          {NAV.map(group => (
            <DropdownItem key={group.label} group={group}
              currentPath={currentPath} onNavigate={go} lang={lang} />
          ))}
        </div>

        <div style={{ width:'3rem', flexShrink:0 }} />
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }} />

        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexShrink:0 }}>

          {/* ── Desktop language toggle ── */}
          <button onClick={toggle}
  className="navbar-lang-btn"
  style={{ padding:'0.28rem 0.65rem', border:'1.5px solid var(--green-pale)',
              borderRadius:100, background:'transparent', fontFamily:'var(--font-body)',
              fontSize:'0.68rem', fontWeight:700, color:'var(--green-deep)',
              cursor:'pointer', letterSpacing:'0.04em', transition:'background 0.18s',
              whiteSpace:'nowrap' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--green-mist)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            🌐 {lang === 'EN' ? 'नेपाली' : 'English'}
          </button>

          <div className="navbar-cta">
            {!user && (
              <button className="btn btn-outline" onClick={() => go('/signin')}>{t('signIn')}</button>
            )}
            <button className="btn btn-primary" onClick={() => go('/book')}>{t('bookSession')}</button>
          </div>

          {/* ── Notification Bell ── */}
          <NotificationBell onNavigate={go} />

          <AvatarDropdown onNavigate={go} />

          <button className="hamburger" aria-label="Toggle menu" onClick={() => setMenuOpen(o => !o)}>
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="mobile-overlay" onClick={() => setMenuOpen(false)}
          style={{ opacity:1, pointerEvents:'all', background:'rgba(6,20,34,0.35)', backdropFilter:'blur(2px)', WebkitBackdropFilter:'blur(2px)' }} />
      )}

      <div className={`mobile-menu ${menuOpen ? 'mobile-menu-open' : ''}`}>
        {user && (
          <div className="mobile-user-card" style={{ display:'flex', alignItems:'center', gap:'0.75rem',
            marginBottom:'1rem' }}>
            <UserAvatar user={user} size={40} />
            <div>
              <div style={{ fontFamily:'var(--font-body)', fontWeight:700,
                fontSize:'0.92rem', color:'var(--text-dark)' }}>{user.fullName || t('myAccount')}</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem',
                color:'var(--text-light)' }}>{user.email}</div>
            </div>
          </div>
        )}

        <ul className="mobile-links" style={{ marginBottom:'0.75rem', paddingBottom:0, borderBottom:'none' }}>
          {NAV.map(group => (
            <MobileGroup key={group.label} group={group}
              currentPath={currentPath} onNavigate={go} lang={lang} />
          ))}
        </ul>

        <div style={{ padding:'0.75rem 0', borderTop:'1px solid var(--earth-cream)', marginBottom:'0.75rem' }}>
          {user ? (
            <>
              <button onClick={() => go('/account')} className="mobile-footer-item" style={{ display:'flex', alignItems:'center',
                gap:'0.7rem', width:'100%', cursor:'pointer' }}>
                <span className="mobile-icon-badge">👤</span>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', fontWeight:600, color:'var(--text-dark)' }}>{t('myAccount')}</span>
              </button>
              <button onClick={() => go('/portal')} className="mobile-footer-item" style={{ display:'flex', alignItems:'center',
                gap:'0.7rem', width:'100%', cursor:'pointer' }}>
                <span className="mobile-icon-badge">🔐</span>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', fontWeight:600, color:'var(--text-dark)' }}>{t('myPortal')}</span>
              </button>
              <button onClick={handleMobileLogout} className="mobile-footer-item" style={{ display:'flex', alignItems:'center',
                gap:'0.7rem', width:'100%', cursor:'pointer' }}>
                <span className="mobile-icon-badge" style={{ background:'#fff0f0' }}>🚪</span>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', fontWeight:600, color:'#e53e3e' }}>{t('logOut')}</span>
              </button>
            </>
          ) : (
            <button onClick={() => go('/signin')} className="mobile-footer-item" style={{ display:'flex', alignItems:'center',
              gap:'0.7rem', width:'100%', cursor:'pointer' }}>
              <span className="mobile-icon-badge">🔑</span>
              <span style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', fontWeight:600, color:'var(--text-dark)' }}>{t('signIn')}</span>
            </button>
          )}

          {/* ── Mobile language toggle ── */}
          <button onClick={toggle} className="mobile-footer-item" style={{ display:'flex', alignItems:'center',
            gap:'0.7rem', width:'100%', cursor:'pointer' }}>
            <span className="mobile-icon-badge">🌐</span>
            <span style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', fontWeight:600, color:'var(--green-deep)' }}>
              {lang === 'EN' ? 'नेपालीमा हेर्नुहोस्' : 'View in English'}
            </span>
          </button>
        </div>

        <div className="mobile-cta">
          <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }}
            onClick={() => go('/book')}>{t('bookSession')} →</button>
          {!user && (
            <button className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }}
              onClick={() => go('/signin')}>{t('signIn')}</button>
          )}
        </div>
      </div>
    </>
  )
}