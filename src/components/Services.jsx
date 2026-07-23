import { useRouter } from '../context/RouterContext'
import { TOKENS, sectionGradientCSS } from '../styles/oceanTheme'

// Icon tint rotates through three depths of the same ocean-blue family
// (was green / earth-clay / blue before) so the six service cards still
// have visual variety without pulling in unrelated hues.
const services = [
  {
    icon: '🧠', tint: 'a',
    title: 'Individual Therapy',
    desc: 'One-on-one sessions with certified psychologists and counselors, available online or in-person.',
    features: ['Licensed therapists', 'Online & in-person', 'Flexible scheduling'],
    link: 'Book a session',
    route: '/book',
  },
  {
    icon: '💑', tint: 'b',
    title: 'Couples Counseling',
    desc: 'Rebuild connection and communication with your partner through guided therapeutic sessions.',
    features: ['Joint & individual sessions', 'Communication tools', 'Conflict resolution'],
    link: 'Learn more',
    route: '/services',
  },
  {
    icon: '👨‍👩‍👧', tint: 'c',
    title: 'Family Therapy',
    desc: 'Address family dynamics, resolve conflicts, and strengthen bonds with professional guidance.',
    features: ['All ages welcome', 'Systemic approach', 'Home visit option'],
    link: 'Learn more',
    route: '/services',
  },
  {
    icon: '📝', tint: 'a',
    title: 'Mental Health Assessments',
    desc: 'Validated screening tools — PHQ-9, GAD-7, DASS-21 — to understand your mental health status.',
    features: ['Free initial screening', 'Clinical-grade tools', 'Instant results'],
    link: 'Take a free test',
    route: '/assessments',
  },
  {
    icon: '📚', tint: 'b',
    title: 'Online Courses',
    desc: 'Structured self-paced programs on stress, anxiety, mindfulness, and emotional regulation.',
    features: ['Self-paced modules', 'Expert-led content', 'Certificate on completion'],
    link: 'Browse courses',
    route: '/courses',
  },
  {
    icon: '🛍️', tint: 'c',
    title: 'Books & Workbooks',
    desc: 'Curated therapeutic books, worksheets, and self-help tools delivered to your door.',
    features: ['Clinician-curated', 'Digital & physical', 'Free worksheets'],
    link: 'Visit store',
    route: '/store',
  },
]

export default function Services() {
  const { navigate } = useRouter()

  return (
    <section className="svc-section" id="services">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700&display=swap');
        ${sectionGradientCSS('svc-section')}

        .svc-section { padding: 3.5rem 1.5rem 4rem; }
        .svc-inner { position: relative; z-index: 2; max-width: 1120px; margin: 0 auto; }

        .svc-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 2.25rem; gap: 1rem; flex-wrap: wrap;
        }
        .svc-eyebrow {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.25rem 0.75rem; margin-bottom: 0.7rem;
          border: 1.5px solid ${TOKENS.bluePale}; border-radius: 100px;
          font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #0f3460; background: ${TOKENS.skyLight};
        }
        .svc-title {
          font-family: 'Fraunces', serif; font-weight: 800;
          font-size: clamp(1.5rem, 3vw, 2.05rem); line-height: 1.2;
          color: ${TOKENS.oceanInk}; margin: 0 0 0.4rem;
        }
        .svc-title em { font-style: italic; color: ${TOKENS.oceanBright}; }
        .svc-desc { font-family: 'Inter', sans-serif; font-size: 0.9rem; color: ${TOKENS.dim}; line-height: 1.55; margin: 0; max-width: 480px; }

        .svc-btn-outline {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.85rem;
          padding: 0.65rem 1.3rem; border-radius: 100px; cursor: pointer;
          background: ${TOKENS.white}; color: ${TOKENS.oceanDeep};
          border: 1.5px solid ${TOKENS.bluePale};
          transition: all 0.2s ease; white-space: nowrap;
        }
        .svc-btn-outline:hover { background: ${TOKENS.skyLight}; border-color: ${TOKENS.oceanBright}; }

        .svc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        .svc-card {
          background: ${TOKENS.white};
          border: 1px solid ${TOKENS.bluePale};
          border-radius: 18px;
          padding: 1.6rem 1.5rem;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(15,52,96,0.06);
          transition: all 0.25s;
          display: flex; flex-direction: column;
        }
        .svc-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,88,128,0.14); }

        .svc-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; margin-bottom: 1rem;
        }
        .svc-icon.tint-a { background: ${TOKENS.oceanPale}; }
        .svc-icon.tint-b { background: ${TOKENS.bluePale}; }
        .svc-icon.tint-c { background: ${TOKENS.skyLight}; }

        .svc-card-title { font-family: 'Fraunces', serif; font-size: 1.1rem; color: ${TOKENS.oceanInk}; margin: 0 0 0.5rem; }
        .svc-card-desc { font-family: 'Inter', sans-serif; font-size: 0.85rem; color: ${TOKENS.dim}; line-height: 1.6; margin: 0 0 1rem; }

        .svc-features { list-style: none; padding: 0; margin: 0 0 1.25rem; display: flex; flex-direction: column; gap: 0.45rem; flex: 1; }
        .svc-features li {
          display: flex; align-items: center; gap: 0.5rem;
          font-family: 'Inter', sans-serif; font-size: 0.82rem; color: ${TOKENS.oceanDeep};
        }
        .svc-check { color: ${TOKENS.oceanBright}; font-weight: 800; }

        .svc-card-btn {
          align-self: flex-start;
          font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.82rem;
          padding: 0.55rem 1.1rem; border-radius: 100px; cursor: pointer;
          background: ${TOKENS.white}; color: ${TOKENS.oceanBright};
          border: 1.5px solid ${TOKENS.oceanBright};
          transition: all 0.2s ease;
        }
        .svc-card-btn:hover { background: ${TOKENS.oceanBright}; color: #fff; }

        @media (max-width: 900px) { .svc-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 620px) {
          .svc-grid { grid-template-columns: 1fr; }
          .svc-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* Fade in from the section above */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 'clamp(50px, 10vw, 110px)',
        background: `linear-gradient(to top, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.55) 78%, ${TOKENS.white} 100%)`,
        pointerEvents: 'none', zIndex: 1,
      }} />
      {/* Fade toward the section below */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 'clamp(50px, 10vw, 110px)',
        background: `linear-gradient(to bottom, rgba(234,246,252,0) 0%, rgba(234,246,252,0.15) 45%, rgba(234,246,252,0.5) 78%, ${TOKENS.skyLight} 100%)`,
        pointerEvents: 'none', zIndex: 1,
      }} />

      <div className="svc-inner">
        <div className="svc-header">
          <div>
            <span className="svc-eyebrow">🩺 What We Offer</span>
            <h2 className="svc-title">Comprehensive Care for Your <em>Whole Self</em></h2>
            <p className="svc-desc">From therapy sessions to self-help tools, we support every step of your mental wellness journey.</p>
          </div>
          <button className="svc-btn-outline" onClick={() => navigate('/services')}>View All Services</button>
        </div>

        <div className="svc-grid">
          {services.map((s, i) => {
            const bookingParams = s.route === '/book' ? { serviceTitle: s.title } : undefined
            return (
              <div className="svc-card" key={i} onClick={() => navigate(s.route, bookingParams)}>
                <div className={`svc-icon tint-${s.tint}`}>{s.icon}</div>
                <h3 className="svc-card-title">{s.title}</h3>
                <p className="svc-card-desc">{s.desc}</p>
                <ul className="svc-features">
                  {s.features.map((f, fi) => (
                    <li key={fi}><span className="svc-check">✓</span>{f}</li>
                  ))}
                </ul>
                <button
                  className="svc-card-btn"
                  onClick={(e) => { e.stopPropagation(); navigate(s.route, bookingParams) }}
                >
                  {s.link} →
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}