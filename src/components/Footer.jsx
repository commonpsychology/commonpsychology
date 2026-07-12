import { useRouter } from '../context/RouterContext'
import { useState, useEffect } from 'react'

/* ════════════════════════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════════════════════════ */
const AUTH_PAGES = ['/signin', '/register']

const SERVICE_LINKS = [
  ['Individual Therapy',  '/book'],
  ['Couples Counseling',  '/services'],
  ['Family Therapy',      '/services'],
  ['Child Psychology',    '/services'],
  ['Online Sessions',     '/book'],
]
const RESOURCE_LINKS = [
  ['Assessments',       '/assessments'],
  ['Blog & Articles',   '/blog'],
  ['Free Worksheets',   '/resources'],
  ['Online Courses',    '/courses'],
  ['Books & Workbooks', '/store'],
]
const COMPANY_LINKS = [
  ['About Us',           '/our-values'],
  ['Our Therapists',     '/therapists'],
  ['Become a Therapist', '/contact'],
  ['Policies',     '/payment-info'],
  ['Contact',            '/contact'],
]

const SOCIALS = [
  {
    label: 'Facebook',
    href: 'https://facebook.com/commonpsychology',
    hoverBg: 'rgba(24,119,242,0.18)',
    hoverBorder: 'rgba(24,119,242,0.45)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
          stroke="rgba(0,0,0,0.7)" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/commonpsychology',
    hoverBg: 'rgba(225,48,108,0.18)',
    hoverBorder: 'rgba(225,48,108,0.45)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5"
          stroke="rgba(0,0,0,0.7)" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="4" stroke="rgba(0,0,0,0.7)" strokeWidth="1.8" />
        <circle cx="17.5" cy="6.5" r="1" fill="rgba(0,0,0,0.7)" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/commonpsychology',
    hoverBg: 'rgba(255,0,0,0.15)',
    hoverBorder: 'rgba(255,0,0,0.38)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95C23 15.88 23 12 23 12s0-3.88-.46-5.58z"
          stroke="rgba(0,0,0,0.7)" strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"
          stroke="rgba(0,0,0,0.7)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          fill="rgba(0,0,0,0.7)" />
      </svg>
    ),
  },
]

/* ── Decorative SVG data ── */
const DOTS = [
  [90,35,'rgba(0,191,255,0.18)'],[320,18,'rgba(0,191,255,0.12)'],
  [510,42,'rgba(184,213,200,0.22)'],[730,15,'rgba(184,213,200,0.16)'],
  [960,28,'rgba(0,191,255,0.1)'],[1130,38,'rgba(184,213,200,0.14)'],
  [180,480,'rgba(0,191,255,0.14)'],[400,470,'rgba(184,213,200,0.18)'],
  [650,490,'rgba(255,255,255,0.3)'],[850,468,'rgba(184,213,200,0.12)'],
  [1050,480,'rgba(0,191,255,0.08)'],[55,200,'rgba(0,191,255,0.16)'],
  [1170,200,'rgba(184,213,200,0.12)'],[260,360,'rgba(255,255,255,0.25)'],
  [800,120,'rgba(0,191,255,0.12)'],
]
const HATCH = Array.from({ length: 20 }, (_, i) => i)
const STARS = [[200,140],[680,80],[1000,360],[420,420],[900,200]]

/* ════════════════════════════════════════════════════════════
   BREAKPOINT HOOK  →  'mobile' | 'tablet' | 'desktop'
════════════════════════════════════════════════════════════ */
function useBreakpoint() {
  const get = () => {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    if (w <= 640)  return 'mobile'
    if (w <= 1023) return 'tablet'
    return 'desktop'
  }
  const [bp, setBp] = useState(get)
  useEffect(() => {
    const handler = () => setBp(get())
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return bp
}

/* ════════════════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════════════════ */

function NavLink({ label, onClick, align = 'left' }) {
  const [hovered, setHovered] = useState(false)
  return (
    <li style={{ textAlign: align }}>
      <a
        href="#"
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: hovered ? 'var(--text-dark)' : 'var(--text-light)',
          transition: 'color 0.18s',
          textDecoration: 'none',
          display: 'inline-block',
          lineHeight: 1.6,
        }}
      >
        {label}
      </a>
    </li>
  )
}

function SocialBtn({ social }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      title={social.label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 38, height: 38, borderRadius: 10,
        background: hovered ? social.hoverBg : 'rgba(0,0,0,0.055)',
        border: `1px solid ${hovered ? social.hoverBorder : 'rgba(0,0,0,0.12)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.22s', textDecoration: 'none',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? `0 6px 20px ${social.hoverBg}` : 'none',
        flexShrink: 0,
      }}
    >
      {social.icon}
    </a>
  )
}

function ColHead({ color, children, align = 'left' }) {
  return (
    <h5 style={{
      fontFamily: 'var(--font-body)',
      fontSize: '0.68rem',
      fontWeight: 800,
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      color,
      marginBottom: '0.9rem',
      textAlign: align,
    }}>
      {children}
    </h5>
  )
}

function LinkCol({ heading, headingColor, links, onNav, align = 'left' }) {
  return (
    <div style={{ width: '100%' }}>
      <ColHead color={headingColor} align={align}>{heading}</ColHead>
      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'flex', flexDirection: 'column', gap: '0.6rem',
        alignItems: align === 'center' ? 'center' : 'flex-start',
      }}>
        {links.map(([label, path]) => (
          <NavLink key={label} label={label} onClick={onNav(path)} align={align} />
        ))}
      </ul>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════
   DECORATIVE SVG BACKGROUND
   — retuned for light gradient background (sky-blue left → white right)
════════════════════════════════════════════════════════════ */
function DecorativeBg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', overflow: 'hidden',
      }}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1200 500"
    >
      <defs>
        {/* Subtle depth overlays on the light gradient */}
        <radialGradient id="fpr1" cx="5%" cy="50%" r="40%">
          <stop offset="0%"   stopColor="#00BFFF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#00BFFF" stopOpacity="0"    />
        </radialGradient>
        <radialGradient id="fpr2" cx="95%" cy="50%" r="35%">
          <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0"   />
        </radialGradient>
        <radialGradient id="fpr3" cx="50%" cy="0%" r="45%">
          <stop offset="0%"   stopColor="#b8d5c8" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#b8d5c8" stopOpacity="0"   />
        </radialGradient>
        <radialGradient id="fpr4" cx="25%" cy="100%" r="38%">
          <stop offset="0%"   stopColor="#00BFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#00BFFF" stopOpacity="0"   />
        </radialGradient>
      </defs>

      <rect width="1200" height="500" fill="url(#fpr1)" />
      <rect width="1200" height="500" fill="url(#fpr2)" />
      <rect width="1200" height="500" fill="url(#fpr3)" />
      <rect width="1200" height="500" fill="url(#fpr4)" />

      {/* Concentric ring accents — left (sky) side */}
      <ellipse cx="60"   cy="490" rx="300" ry="180" fill="none" stroke="rgba(0,191,255,0.08)"  strokeWidth="60" />
      <ellipse cx="60"   cy="490" rx="200" ry="120" fill="none" stroke="rgba(0,191,255,0.06)"  strokeWidth="1"  />
      <ellipse cx="60"   cy="490" rx="120" ry="72"  fill="none" stroke="rgba(0,191,255,0.05)"  strokeWidth="1"  />

      {/* Concentric ring accents — right (white) side */}
      <ellipse cx="1160" cy="30"  rx="280" ry="160" fill="none" stroke="rgba(184,213,200,0.1)" strokeWidth="50" />
      <ellipse cx="1160" cy="30"  rx="190" ry="108" fill="none" stroke="rgba(184,213,200,0.07)" strokeWidth="1" />
      <ellipse cx="1160" cy="30"  rx="110" ry="64"  fill="none" stroke="rgba(184,213,200,0.05)" strokeWidth="1" />

      {/* Leaf / organic blobs */}
      <path d="M0,80 C80,15 180,0 230,80 C180,145 80,155 0,80Z"
        fill="rgba(0,191,255,0.07)" />
      <path d="M0,80 C40,78 80,64 118,80 C80,96 40,96 0,80Z"
        fill="rgba(0,191,255,0.05)" />
      <path d="M1200,410 C1122,346 1022,346 982,414 C1044,484 1144,484 1200,410Z"
        fill="rgba(184,213,200,0.09)" />

      {/* Diagonal hatch lines */}
      {HATCH.map(i => (
        <line key={`h${i}`}
          x1={i * 65 - 50} y1="0" x2={i * 65 + 470} y2="500"
          stroke="rgba(0,0,0,0.012)" strokeWidth="1" />
      ))}

      {/* Flowing horizontal curves */}
      <path d="M0,165 Q200,148 400,162 Q620,178 820,155 Q1020,132 1200,150"
        fill="none" stroke="rgba(0,191,255,0.07)"    strokeWidth="1" />
      <path d="M0,305 Q300,290 600,303 Q900,318 1200,298"
        fill="none" stroke="rgba(184,213,200,0.09)"  strokeWidth="1" />
      <path d="M0,405 Q250,396 520,410 Q820,426 1200,402"
        fill="none" stroke="rgba(255,255,255,0.3)"   strokeWidth="1" />

      {/* Sky glow left edge */}
      <ellipse cx="30"   cy="250" rx="80"  ry="240" fill="rgba(0,191,255,0.06)"  />
      {/* White glow right edge */}
      <ellipse cx="1185" cy="250" rx="80"  ry="240" fill="rgba(255,255,255,0.25)" />

      {/* Cross / star sparkles */}
      {STARS.map(([cx, cy], i) => (
        <g key={`s${i}`} transform={`translate(${cx},${cy})`}>
          <line x1="-6" y1="0" x2="6" y2="0"
            stroke={i % 2 === 0 ? 'rgba(0,191,255,0.18)' : 'rgba(184,213,200,0.2)'}
            strokeWidth="1" strokeLinecap="round" />
          <line x1="0" y1="-6" x2="0" y2="6"
            stroke={i % 2 === 0 ? 'rgba(0,191,255,0.18)' : 'rgba(184,213,200,0.2)'}
            strokeWidth="1" strokeLinecap="round" />
        </g>
      ))}

      {/* Scatter dots */}
      {DOTS.map(([cx, cy, fill], i) => (
        <circle key={`d${i}`} cx={cx} cy={cy} r="2.2" fill={fill} />
      ))}
    </svg>
  )
}

/* ════════════════════════════════════════════════════════════
   MAIN FOOTER COMPONENT
════════════════════════════════════════════════════════════ */
export default function Footer() {
  const { navigate, currentPath } = useRouter()
  const bp = useBreakpoint()

  if (AUTH_PAGES.includes(currentPath)) return null

  const handleNav = (path) => (e) => {
    e.preventDefault()
    navigate(path)
  }

  const isMobile  = bp === 'mobile'
  const isTablet  = bp === 'tablet'
  const isDesktop = bp === 'desktop'

  const outerPadding = isMobile
    ? '2.5rem 1.25rem 1.75rem'
    : isTablet
    ? '3.5rem 3rem 2rem'
    : '4rem 5vw 2rem'

  const mainGridCols = isMobile
    ? '1fr'
    : isTablet
    ? '1fr 2fr'
    : '2fr 1fr 1fr 1fr'

  return (
    <footer style={{
      position: 'relative',
      overflow: 'hidden',
      /* ── Same pattern as navbar: sky-blue left → white right ── */
      background:
        'linear-gradient(to right,' +
        '#00BFFF 0%,' +
        '#00BFFF 2%,' +
        '#e8f3ee 40%,' +
        '#f0f8f4 60%,' +
        '#f8fcfa 80%,' +
        '#ffffff 100%)',
      color: 'var(--text-dark)',
      borderTop: '1px solid var(--green-pale)',
      padding: outerPadding,
      width: '100%',
      boxSizing: 'border-box',
    }}>

      <DecorativeBg />

      {/* ── Content layer ── */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>

        {/* ════════════════════════════════
            MAIN GRID
        ════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mainGridCols,
          gap: isMobile ? '2.25rem' : isTablet ? '2rem 4rem' : '3rem 5rem',
          alignItems: 'start',
          width: '100%',
          marginBottom: '2.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}>

          {/* ══════════════
              BRAND COLUMN
          ══════════════ */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMobile ? 'center' : 'flex-start',
            textAlign: isMobile ? 'center' : 'left',
          }}>

            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', marginBottom: '1.1rem',
              }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,#3d6b5a 0%,#2e6080 100%)',
                border: '1.5px solid rgba(184,213,200,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, fill: 'white' }}>
                  <path d="M12 2C8.5 2 5.5 4.5 5 8c-.3 2 .5 4 2 5.5L12 22l5-8.5c1.5-1.5 2.3-3.5 2-5.5C18.5 4.5 15.5 2 12 2zm0 9a3 3 0 110-6 3 3 0 010 6z" />
                </svg>
              </div>
              <div>
                <div className="logo-text" style={{ color: 'var(--text-dark)' }}>
                  Common Psyhcology
                </div>
                <div className="logo-sub" style={{ color: 'var(--text-light)' }}>
                  Mental Wellness Center
                </div>
              </div>
            </div>

            {/* Tagline */}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              lineHeight: 1.8,
              color: 'var(--text-light)',
              maxWidth: isMobile ? '100%' : '88%',
              marginBottom: '1.5rem',
            }}>
              A compassionate mental health platform for Nepal — connecting clients with certified
              therapists and providing tools for everyday wellness.
            </p>

            {/* Social icons */}
            <div style={{
              display: 'flex', gap: '0.6rem', alignItems: 'center',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}>
              {SOCIALS.map(s => <SocialBtn key={s.label} social={s} />)}
            </div>
          </div>

          {isDesktop && (
            <>
              <LinkCol
                heading="Services"
                headingColor="var(--text-mid)"
                links={SERVICE_LINKS}
                onNav={handleNav}
                align="left"
              />
              <LinkCol
                heading="Resources"
                headingColor="var(--text-mid)"
                links={RESOURCE_LINKS}
                onNav={handleNav}
                align="left"
              />
              <LinkCol
                heading="Company"
                headingColor="var(--text-mid)"
                links={COMPANY_LINKS}
                onNav={handleNav}
                align="left"
              />
            </>
          )}

          {isTablet && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1rem 2rem',
              alignItems: 'start',
              width: '100%',
            }}>
              <LinkCol
                heading="Services"
                headingColor="var(--text-mid)"
                links={SERVICE_LINKS}
                onNav={handleNav}
                align="left"
              />
              <LinkCol
                heading="Resources"
                headingColor="var(--text-mid)"
                links={RESOURCE_LINKS}
                onNav={handleNav}
                align="left"
              />
              <LinkCol
                heading="Company"
                headingColor="var(--text-mid)"
                links={COMPANY_LINKS}
                onNav={handleNav}
                align="left"
              />
            </div>
          )}

          {isMobile && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.75rem 1rem',
              alignItems: 'start',
              width: '100%',
            }}>
              <LinkCol
                heading="Services"
                headingColor="var(--text-mid)"
                links={SERVICE_LINKS}
                onNav={handleNav}
                align="center"
              />
              <LinkCol
                heading="Resources"
                headingColor="var(--text-mid)"
                links={RESOURCE_LINKS}
                onNav={handleNav}
                align="center"
              />
              {/* Company spans both columns */}
              <div style={{ gridColumn: '1 / -1' }}>
                <ColHead color="var(--text-mid)" align="center">Company</ColHead>
                <ul style={{
                  listStyle: 'none', padding: 0, margin: 0,
                  display: 'flex', flexWrap: 'wrap',
                  gap: '0.45rem 1.25rem',
                  justifyContent: 'center',
                }}>
                  {COMPANY_LINKS.map(([label, path]) => (
                    <NavLink key={label} label={label} onClick={handleNav(path)} align="center" />
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════
            BOTTOM BAR
        ════════════════════════════════ */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: isMobile ? 'center' : 'space-between',
          gap: isMobile ? '0.45rem' : '0',
          width: '100%',
          fontFamily: 'var(--font-body)',
          fontSize: '0.74rem',
          color: 'var(--text-light)',
          textAlign: isMobile ? 'center' : 'left',
        }}>
          <span>
            © 2025  Mental Wellness. All rights reserved. Kathmandu, Nepal.
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2C8.5 2 5.5 4.5 5 8c-.3 2 .5 4 2 5.5L12 22l5-8.5c1.5-1.5 2.3-3.5 2-5.5C18.5 4.5 15.5 2 12 2z"
                fill="var(--text-light)"
              />
            </svg>
            Built with compassion for mental health
          </span>
        </div>

      </div>
    </footer>
  )
}
