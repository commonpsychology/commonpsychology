import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'

const C = {
  skyBright:  '#00BFFF',
  skyMid:     '#009FD4',
  skyDeep:    '#007BA8',
  skyFaint:   '#E0F7FF',
  skyFainter: '#F0FBFF',
  skyGhost:   '#F8FEFF',
  white:      '#ffffff',
  mint:       '#e8f3ee',
  textDark:   '#1a3a4a',
  textMid:    '#2e6080',
  textLight:  '#7a9aaa',
  border:     '#b0d4e8',
  borderFaint:'#daeef8',
}

const heroGrad    = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyMid} 40%, ${C.skyBright} 80%, #22d3ee 100%)`
const sectionGrad = `linear-gradient(135deg, ${C.skyFainter} 0%, ${C.mint} 60%, ${C.skyFaint} 100%)`
const btnGrad     = `linear-gradient(135deg, ${C.skyDeep} 0%, ${C.skyBright} 100%)`

/* ── Responsive columns hook ── */
function useGridColumns() {
  const getColumns = (w) => {
    if (w < 480) return 1   // mobile  → 1 card per row
    if (w < 900) return 2   // tablet  → 2 cards per row
    return 3                // desktop → 3 cards per row
  }
  const [cols, setCols] = useState(() => getColumns(typeof window !== 'undefined' ? window.innerWidth : 1024))
  useEffect(() => {
    const handler = () => setCols(getColumns(window.innerWidth))
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return cols
}

const IMPACT = [
  { icon: '🏘️', val: '38',    label: 'Communities Reached' },
  { icon: '👥', val: '6,200+', label: 'Beneficiaries' },
  { icon: '🤝', val: '14',    label: 'NGO Partners' },
  { icon: '📅', val: '5 yrs', label: 'Of Outreach' },
]

const PROGRAMS = [
  {
    id: 1,
    title: 'Rural Mental Health Outreach',
    region: 'Sindhupalchok & Dolakha',
    type: 'Community Outreach',
    status: 'Active',
    since: '2020',
    beneficiaries: '1,200+',
    img: 'linear-gradient(135deg, #007BA8 0%, #00BFFF 60%, #a0e9ff 100%)',
    emoji: '🏔️',
    desc: 'Monthly mental health camps in earthquake-affected districts. Provides free psychosocial first aid, trauma screening, and referrals to district hospitals. Partnered with local Female Community Health Volunteers (FCHVs).',
    tags: ['Trauma', 'Rural', 'Post-Disaster'],
    partners: ['WHO Nepal', 'TPO Nepal', 'FCHVs'],
    outcomes: ['1,200 screenings', '340 referred to care', '80 FCHVs trained'],
  },
  {
    id: 2,
    title: 'School Mental Health Programme',
    region: 'Kathmandu Valley — 22 Schools',
    type: 'Education Outreach',
    status: 'Active',
    since: '2021',
    beneficiaries: '3,500+',
    img: 'linear-gradient(135deg, #0f4c6b 0%, #009FD4 60%, #22d3ee 100%)',
    emoji: '🏫',
    desc: 'Embedding mental health literacy into school curricula. Trained school counsellors, teacher sensitisation workshops, and a peer support buddy system for students aged 10–18.',
    tags: ['Youth', 'Schools', 'Prevention'],
    partners: ['Ministry of Education', 'UNICEF Nepal'],
    outcomes: ['22 schools covered', '150 teachers trained', '600 peer buddies'],
  },
  {
    id: 3,
    title: 'Women & Girls Resilience Project',
    region: 'Lalitpur & Bhaktapur',
    type: 'Gender-Based',
    status: 'Active',
    since: '2022',
    beneficiaries: '850+',
    img: 'linear-gradient(135deg, #b56a28 0%, #d4a574 60%, #f5ede0 100%)',
    emoji: '💜',
    desc: 'Safe circles for women survivors of domestic violence and gender-based trauma. Integrates psychological support with livelihood skills training and legal aid referrals.',
    tags: ['GBV', 'Women', 'Empowerment'],
    partners: ['UNFPA Nepal', 'Saathi NGO'],
    outcomes: ['850 women supported', '200 in skills training', '60 legal referrals'],
  },
  {
    id: 4,
    title: 'Migrant Worker Re-integration Support',
    region: 'Kathmandu, Rupandehi, Chitwan',
    type: 'Labour Migration',
    status: 'Active',
    since: '2023',
    beneficiaries: '620+',
    img: 'linear-gradient(135deg, #1a3a4a 0%, #2e6080 60%, #5b9ab5 100%)',
    emoji: '✈️',
    desc: 'Psychosocial support for returning migrant workers facing re-integration challenges: depression, identity loss, financial stress, and family conflict after years abroad.',
    tags: ['Migration', 'Reintegration', 'Men'],
    partners: ['IOM Nepal', 'DOFE'],
    outcomes: ['620 workers reached', '180 in therapy', '4 support groups'],
  },
  {
    id: 5,
    title: 'Elderly Mental Health & Loneliness Initiative',
    region: 'Kathmandu — Old Age Homes',
    type: 'Elder Care',
    status: 'Active',
    since: '2023',
    beneficiaries: '280+',
    img: 'linear-gradient(135deg, #2d4a3e 0%, #3d6b5a 60%, #6a9e88 100%)',
    emoji: '🌸',
    desc: 'Weekly visits to old age homes and isolated elderly individuals. Combines reminiscence therapy, art activities, and family-mediated counselling to address loneliness and late-life depression.',
    tags: ['Elderly', 'Loneliness', 'Arts'],
    partners: ['Hamro Budheshwor', 'HelpAge Nepal'],
    outcomes: ['280 seniors supported', '12 homes visited', '45 family sessions'],
  },
  {
    id: 6,
    title: 'Crisis Hotline & First Responder Training',
    region: 'Nepal-wide',
    type: 'Crisis Intervention',
    status: 'Active',
    since: '2021',
    beneficiaries: '400+ calls/mo',
    img: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 60%, #7dd3fc 100%)',
    emoji: '📞',
    desc: 'Operation of a toll-free crisis support line staffed by trained counsellors. Also trains Nepal Police and hospital emergency staff in psychological first aid and safe messaging guidelines.',
    tags: ['Crisis', 'Hotline', 'First Aid'],
    partners: ['Nepal Police', 'MOH Nepal'],
    outcomes: ['4,800+ calls handled', '200 first responders trained', '98% satisfaction'],
  },
]

/* ══════════════════════════════════════
   PROGRAM CARD — floating label + bevel hover
══════════════════════════════════════ */
function ProgramCard({ prog, onReadMore }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20, background: C.white,
        position: 'relative', overflow: 'visible',
        cursor: 'pointer',
        boxShadow: hovered
          ? `0 2px 0 0 ${C.skyDeep},
             0 5px 0 0 ${C.skyMid}bb,
             0 9px 0 0 ${C.skyBright}55,
             0 22px 52px rgba(0,191,255,0.2),
             inset 0 1px 0 rgba(255,255,255,0.9)`
          : `0 2px 12px rgba(0,191,255,0.06), inset 0 1px 0 rgba(255,255,255,0.8)`,
        border: `1.5px solid ${hovered ? C.skyBright : C.borderFaint}`,
        transform: hovered ? 'translateY(-7px) scale(1.013)' : 'translateY(0) scale(1)',
        transition: 'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      {/* Image */}
      <div style={{
        height: 160, borderRadius: '18px 18px 0 0',
        background: prog.img, position: 'relative', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: hovered ? 'rgba(255,255,255,0.07)' : 'transparent', transition: 'background 0.3s' }} />
        <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))', position: 'relative' }}>{prog.emoji}</span>

        {/* Status pill */}
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(0,255,120,0.2)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0,255,120,0.35)', borderRadius: 100,
          padding: '3px 10px', display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00e676', display: 'inline-block', boxShadow: '0 0 6px #00e676' }} />
          <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'white', letterSpacing: '0.06em', fontFamily: 'var(--font-body)' }}>ACTIVE</span>
        </div>

        {/* Since badge */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 100, padding: '3px 10px',
          fontSize: '0.65rem', fontWeight: 700, color: 'white',
          fontFamily: 'var(--font-body)',
        }}>Since {prog.since}</div>
      </div>

      {/* Floating label */}
      <div style={{
        position: 'absolute',
        bottom: 'calc(100% - 185px)',
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 10,
        background: hovered ? btnGrad : C.white,
        border: `1.5px solid ${hovered ? C.skyBright : C.border}`,
        borderRadius: 100, padding: '5px 16px',
        boxShadow: hovered
          ? '0 4px 20px rgba(0,191,255,0.35), inset 0 1px 0 rgba(255,255,255,0.3)'
          : '0 4px 14px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        whiteSpace: 'nowrap', pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 800,
          color: hovered ? 'white' : C.textMid,
          letterSpacing: '0.05em', transition: 'color 0.3s',
        }}>{prog.type}</span>
      </div>

      {/* Body */}
      <div style={{ padding: '1.4rem 1.4rem 1.3rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: C.textDark, lineHeight: 1.35, marginBottom: '0.3rem' }}>{prog.title}</h3>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.74rem', color: C.skyMid, fontWeight: 700, marginBottom: '0.7rem' }}>📍 {prog.region}</div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.79rem', color: C.textLight, lineHeight: 1.62, marginBottom: '0.9rem' }}>{prog.desc}</p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
          {prog.tags.map(t => (
            <span key={t} style={{
              fontSize: '0.65rem', fontWeight: 700, padding: '2px 9px', borderRadius: 100,
              background: hovered ? C.skyFaint : C.skyFainter,
              color: C.skyMid, border: `1px solid ${C.borderFaint}`,
              transition: 'background 0.3s',
            }}>#{t}</span>
          ))}
        </div>

        {/* Outcomes */}
        <div style={{ background: sectionGrad, borderRadius: 10, padding: '0.7rem 0.9rem', marginBottom: '1rem', border: `1px solid ${C.borderFaint}` }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.68rem', fontWeight: 800, color: C.textLight, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Key Outcomes</div>
          {prog.outcomes.map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: i < prog.outcomes.length - 1 ? '0.25rem' : 0 }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: btnGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: '0.5rem', color: 'white', fontWeight: 800 }}>✓</span>
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.76rem', color: C.textMid }}>{o}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: C.textDark, fontWeight: 700 }}>{prog.beneficiaries}</div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.65rem', color: C.textLight }}>beneficiaries</div>
          </div>
          <button onClick={() => onReadMore(prog)}
            style={{
              padding: '0.5rem 1.1rem', borderRadius: 10, border: 'none',
              background: hovered ? btnGrad : C.skyFaint,
              color: hovered ? 'white' : C.skyMid,
              fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.3s ease',
              boxShadow: hovered ? '0 4px 14px rgba(0,191,255,0.35)' : 'none',
            }}>Learn More →</button>
        </div>
      </div>
    </div>
  )
}

export default function SocialWorkPage() {
  const { navigate } = useRouter()
  const [selected, setSelected] = useState(null)

  // Responsive grid: 1 col on mobile, 2 on tablet, 3 on desktop
  const gridCols = useGridColumns()
  const gridTemplateColumns =
    gridCols === 1 ? '1fr' :
    gridCols === 2 ? 'repeat(2, 1fr)' :
    'repeat(auto-fill, minmax(320px, 1fr))'

  // Track width for hero padding etc.
  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  useEffect(() => {
    const handler = () => setWinWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  const heroPadding  = winWidth < 480 ? '3rem 1.25rem 2.5rem' : winWidth < 768 ? '4rem 2rem 3rem' : '5rem 4rem 4rem'
  const innerPadding = winWidth < 480 ? '2rem 1.25rem 4rem' : winWidth < 768 ? '2.5rem 2rem 4rem' : '3rem 4rem 5rem'

  return (
    <div className="page-wrapper" style={{ background: C.skyGhost }}>

      {/* ── Hero ── */}
      <div style={{ background: heroGrad, padding: heroPadding, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 680, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 100, padding: '0.3rem 1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.92)', textTransform: 'uppercase' }}>🤝 Community Social Work</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem, 4vw, 3rem)', color: 'white', marginBottom: '1rem', lineHeight: 1.2 }}>
            Mental Health for<br />Every Nepali
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.75, maxWidth: 520, marginBottom: '2.5rem' }}>
            Beyond the clinic — reaching underserved communities, rural villages, schools, and shelters. Our social work programmes bring mental health support to those who need it most.
          </p>
          {/* Impact stats */}
          <div style={{ display: 'flex', gap: winWidth < 480 ? '1.25rem' : '2rem', flexWrap: 'wrap' }}>
            {IMPACT.map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '0.1rem' }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'white', fontWeight: 700 }}>{s.val}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: innerPadding }}>

        {/* Section header */}
        <div style={{ background: sectionGrad, borderRadius: 16, padding: '1.4rem 2rem', marginBottom: '2.5rem', border: `1px solid ${C.borderFaint}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: C.textDark, margin: 0 }}>Our Active Programmes</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: C.textMid, margin: '0.3rem 0 0' }}>All programmes are free or heavily subsidised for beneficiaries.</p>
          </div>
          <button onClick={() => navigate('/contact')}
            style={{ padding: '0.55rem 1.3rem', borderRadius: 10, border: 'none', background: btnGrad, color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,191,255,0.3)', whiteSpace: 'nowrap' }}>
            Partner With Us
          </button>
        </div>

        {/* ↓ Responsive grid — 1 col mobile, 2 col tablet, 3 col desktop */}
        <div style={{ display: 'grid', gridTemplateColumns, gap: '2rem', paddingTop: '0.5rem' }}>
          {PROGRAMS.map(p => (
            <ProgramCard key={p.id} prog={p} onReadMore={setSelected} />
          ))}
        </div>

        {/* Partners strip */}
        <div style={{ marginTop: '4rem', background: sectionGrad, borderRadius: 16, padding: '2rem', border: `1px solid ${C.borderFaint}` }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: C.textDark, marginBottom: '1.25rem', textAlign: 'center' }}>Our Partners & Funders</div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['WHO Nepal', 'UNICEF Nepal', 'UNFPA Nepal', 'IOM Nepal', 'TPO Nepal', 'Saathi NGO', 'HelpAge Nepal', 'Ministry of Education', 'Nepal Police', 'DOFE'].map((p, i) => (
              <div key={i} style={{
                padding: '0.45rem 1.1rem', borderRadius: 100,
                background: C.white, border: `1px solid ${C.border}`,
                fontFamily: 'var(--font-body)', fontSize: '0.8rem', fontWeight: 600,
                color: C.textMid, boxShadow: '0 2px 8px rgba(0,191,255,0.06)',
              }}>{p}</div>
            ))}
          </div>
        </div>

        {/* Volunteer CTA */}
        <div style={{
          marginTop: '2rem', padding: winWidth < 480 ? '2rem 1.5rem' : '3rem', background: heroGrad, borderRadius: 20,
          display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap',
          boxShadow: '0 16px 48px rgba(0,191,255,0.2)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'white', marginBottom: '0.5rem' }}>Volunteer With Us</h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65 }}>
              Mental health professionals, social workers, and trained volunteers are always needed. Join our team and make a difference in underserved communities.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', position: 'relative' }}>
            <button onClick={() => navigate('/volunteer')} style={{ padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none', background: C.white, color: C.skyDeep, fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer' }}>Apply to Volunteer →</button>
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(26,58,74,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.white, borderRadius: 24, padding: winWidth < 480 ? '1.5rem' : '2.5rem', maxWidth: 520, width: '100%', boxShadow: '0 32px 80px rgba(0,0,0,0.2)', border: `1.5px solid ${C.skyBright}`, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ height: 6, background: btnGrad, borderRadius: 3, marginBottom: '1.5rem' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2.5rem' }}>{selected.emoji}</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: C.textDark, margin: 0 }}>{selected.title}</h3>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: C.skyMid, fontWeight: 700, marginTop: 3 }}>📍 {selected.region}</div>
              </div>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: C.textMid, lineHeight: 1.7, marginBottom: '1.25rem' }}>{selected.desc}</p>
            <div style={{ background: sectionGrad, borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.25rem', border: `1px solid ${C.borderFaint}` }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Outcomes</div>
              {selected.outcomes.map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: C.skyBright, fontWeight: 800, fontSize: '0.8rem' }}>✓</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: C.textMid }}>{o}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.7rem', fontWeight: 800, color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Partners</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {selected.partners.map(p => (
                  <span key={p} style={{ padding: '3px 10px', borderRadius: 100, background: C.skyFaint, color: C.skyMid, fontSize: '0.75rem', fontWeight: 700, border: `1px solid ${C.borderFaint}` }}>{p}</span>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '0.7rem', borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.white, color: C.textMid, fontFamily: 'var(--font-body)', fontWeight: 600, cursor: 'pointer' }}>Close</button>
              <button onClick={() => { navigate('/contact'); setSelected(null) }} style={{ flex: 2, padding: '0.7rem', borderRadius: 10, border: 'none', background: btnGrad, color: 'white', fontFamily: 'var(--font-body)', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,191,255,0.35)' }}>Get Involved →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}