import { useState } from 'react'
import { useRouter } from '../context/RouterContext'

const allServices = [
  // {
  //   icon: '🩺', iconClass: 'si-blue',
  //   title: 'Psychiatrist Consultation',
  //   desc: 'Comprehensive psychiatric evaluation and medication management from licensed psychiatrists, for when therapy alone needs clinical support.',
  //   features: ['Diagnostic assessment', 'Medication management', 'Follow-up reviews', 'Coordination with your therapist'],
  //   specialties: ['Psychiatry', 'Medication', 'Diagnosis', 'Clinical'],
  // },
  {
    icon: '🧠', iconClass: 'si-green',
    title: 'Individual Therapy',
    desc: 'One-on-one sessions tailored to your unique needs, delivered by certified clinical psychologists. Available online or in-person across Kathmandu.',
    features: ['CBT & DBT approaches', '60-minute sessions', 'Flexible scheduling', 'Session notes shared securely'],
    specialties: ['Anxiety', 'Depression', 'CBT', 'Trauma'],
  },
  {
    icon: '💑', iconClass: 'si-earth',
    title: 'Couples Counseling',
    desc: 'Rebuild trust, communication, and intimacy with your partner through evidence-based relationship therapy.',
    features: ['Gottman Method', 'Joint & separate sessions', 'Conflict resolution', 'Relationship assessment'],
    specialties: ['Relationship', 'Couples', 'Gottman', 'Communication'],
  },
  {
    icon: '👨‍👩‍👧', iconClass: 'si-blue',
    title: 'Family Therapy',
    desc: 'Strengthen family bonds and work through dynamics that affect everyone in the household.',
    features: ['Family systems approach', 'Parenting support', 'Communication skills', 'Crisis intervention'],
    specialties: ['Family', 'Parenting', 'Crisis', 'Communication'],
  },
  {
    icon: '🧒', iconClass: 'si-green',
    title: 'Child Psychology',
    desc: 'Specialized support for children aged 5–18, using play therapy and age-appropriate techniques.',
    features: ['Play therapy', 'Behavioral assessment', 'School-related issues', 'Parent coaching'],
    specialties: ['Children', 'Play Therapy', 'Behavioral', 'Adolescents'],
  },
  {
    icon: '🌿', iconClass: 'si-earth',
    title: 'Mindfulness & Stress',
    desc: 'Learn practical mindfulness techniques to manage stress, anxiety, and emotional regulation.',
    features: ['MBSR program', 'Breathing techniques', 'Stress audit', 'Daily practice tools'],
    specialties: ['Mindfulness', 'Stress', 'Anxiety', 'MBSR'],
  },
  {
    icon: '😴', iconClass: 'si-blue',
    title: 'Sleep & Mood',
    desc: 'Address insomnia, burnout, and mood disorders with targeted therapeutic interventions.',
    features: ['CBT for insomnia', 'Mood charting', 'Sleep hygiene coaching', 'Lifestyle integration'],
    specialties: ['Insomnia', 'Sleep', 'Mood', 'Burnout'],
  },
  {
    icon: '💼', iconClass: 'si-blue',
    title: 'Organizational Wellness',
    desc: 'Support for workplace mental health and employee well-being.',
    features: ['Workplace assessments', 'Employee assistance', 'Leadership training', 'Culture of care'],
    specialties: ['Workplace', 'Employee', 'Leadership', 'Culture'],
  },
]

const allTags = ['All', ...Array.from(new Set(allServices.flatMap(s => s.specialties)))]

// ── Glass card palette ─────────────────────────────────────────
const GLASS = {
  bg:        'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)',
  bgHover:   'linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(200,232,250,0.68) 55%, rgba(255,255,255,0.78) 100%)',
  border:    '1px solid rgba(255,255,255,0.55)',
  borderHov: '1px solid rgba(120,190,230,0.65)',
}

export default function ServicesPage() {
  const { navigate } = useRouter()
  const [activeTag, setActiveTag] = useState('All')
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const visibleServices = activeTag === 'All'
    ? allServices
    : allServices.filter(s => s.specialties.includes(activeTag))

  return (
    <div className="page-wrapper">
      <div
        className="page-hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '4rem 2rem 5rem',
          textAlign: 'center',
          borderRadius: '0 0 60% 60% / 0 0 40px 40px',
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, rgba(180,230,210,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 70% 80% at 80% 20%, rgba(186,220,248,0.5) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 60% 80%, rgba(254,243,199,0.45) 0%, transparent 60%),
            linear-gradient(160deg, #f0faf5 0%, #e8f4fb 45%, #fefce8 100%)
          `,
        }}
      >
        <div style={{
          position: 'absolute', width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(0,123,168,0.12)', filter: 'blur(32px)',
          top: -40, right: '5%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(29,158,117,0.1)', filter: 'blur(32px)',
          bottom: -20, left: '8%', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <span className="section-tag">All Services</span>
          <h1 className="section-title">Everything You Need for <em>Mental Wellness</em></h1>
          <p className="section-desc">
            Comprehensive, evidence-based mental health services designed for the Nepali community.
          </p>
        </div>
      </div>

      <div className="section" style={{ background: 'var(--white)' }}>

        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.6rem',
            marginBottom: '3rem',
            padding: '0 1rem',
          }}
        >
          {allTags.map(tag => {
            const active = tag === activeTag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  border: active ? '1px solid transparent' : '1px solid #d8e3df',
                  background: active
                    ? 'linear-gradient(135deg, #1d9e75, #007ba8)'
                    : '#fff',
                  color: active ? '#fff' : '#3a4a45',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: active ? '0 4px 14px rgba(29,158,117,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transform: active ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>

        <div className="services-grid-full">
          {visibleServices.map((s, i) => {
            const isHovered = hoveredIdx === i
            return (
              <div
                className="service-card-full"
                key={s.title}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  background: isHovered ? GLASS.bgHover : GLASS.bg,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isHovered ? GLASS.borderHov : GLASS.border,
                  transform: isHovered ? 'translateY(-8px) scale(1.015)' : 'translateY(0) scale(1)',
                  boxShadow: isHovered
                    ? '0 20px 44px rgba(0,123,168,0.22), 0 6px 16px rgba(29,158,117,0.14), inset 0 1px 0 rgba(255,255,255,0.6)'
                    : '0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.5)',
                  borderRadius: '20px',
                  transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, background 0.35s ease, border 0.35s ease',
                  animation: `fadeSlideIn 0.5s ease both`,
                  animationDelay: `${i * 0.06}s`,
                }}
                onClick={() => navigate('/book', { serviceTitle: s.title, serviceSpecialties: s.specialties })}
              >
                <div
                  className={`service-icon ${s.iconClass}`}
                  style={{
                    transform: isHovered ? 'scale(1.12) rotate(-4deg)' : 'scale(1)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  {s.icon}
                </div>

                <h3 className="service-card-title">{s.title}</h3>
                <p className="service-card-desc">{s.desc}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {s.specialties.map(tag => (
                    <span
                      key={tag}
                      onClick={(e) => { e.stopPropagation(); setActiveTag(tag) }}
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: 'rgba(29,158,117,0.1)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(29,158,117,0.15)',
                        color: '#1d9e75',
                        cursor: 'pointer',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <ul className="service-card-features">
                  {s.features.map((f, j) => (
                    <li key={j}>
                      <span className="service-card-check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className="btn btn-primary service-card-btn"
                  style={{
                    background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)',
                    boxShadow: '0 6px 18px rgba(0,150,210,0.3)',
                    border: 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/book', { serviceTitle: s.title, serviceSpecialties: s.specialties })
                  }}
                >
                  Book This Service
                </button>
              </div>
            )
          })}
        </div>

        {visibleServices.length === 0 && (
          <p style={{ textAlign: 'center', color: '#7a8a85', marginTop: '2rem' }}>
            No services match that filter.
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}