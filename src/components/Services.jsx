import { useRouter } from '../context/RouterContext'

const services = [
  {
    icon: '🧠', iconClass: 'si-green',
    title: 'Individual Therapy',
    desc: 'One-on-one sessions with certified psychologists and counselors, available online or in-person.',
    features: ['Licensed therapists', 'Online & in-person', 'Flexible scheduling'],
    link: 'Book a session',
    route: '/book',
  },
  {
    icon: '💑', iconClass: 'si-earth',
    title: 'Couples Counseling',
    desc: 'Rebuild connection and communication with your partner through guided therapeutic sessions.',
    features: ['Joint & individual sessions', 'Communication tools', 'Conflict resolution'],
    link: 'Learn more',
    route: '/services',
  },
  {
    icon: '👨‍👩‍👧', iconClass: 'si-blue',
    title: 'Family Therapy',
    desc: 'Address family dynamics, resolve conflicts, and strengthen bonds with professional guidance.',
    features: ['All ages welcome', 'Systemic approach', 'Home visit option'],
    link: 'Learn more',
    route: '/services',
  },
  {
    icon: '📝', iconClass: 'si-green',
    title: 'Mental Health Assessments',
    desc: 'Validated screening tools — PHQ-9, GAD-7, DASS-21 — to understand your mental health status.',
    features: ['Free initial screening', 'Clinical-grade tools', 'Instant results'],
    link: 'Take a free test',
    route: '/assessments',
  },
  {
    icon: '📚', iconClass: 'si-earth',
    title: 'Online Courses',
    desc: 'Structured self-paced programs on stress, anxiety, mindfulness, and emotional regulation.',
    features: ['Self-paced modules', 'Expert-led content', 'Certificate on completion'],
    link: 'Browse courses',
    route: '/courses',
  },
  {
    icon: '🛍️', iconClass: 'si-blue',
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
    <section className="section services" id="services">
      <div className="section-header">
        <div>
          <span className="section-tag">What We Offer</span>
          <h2 className="section-title">
            Comprehensive Care for Your <em>Whole Self</em>
          </h2>
          <p className="section-desc">
            From therapy sessions to self-help tools, we support every step of your mental wellness journey.
          </p>
        </div>

        <button
          className="btn btn-outline"
          onClick={() => navigate('/services')}
        >
          View All Services
        </button>
      </div>

      <div className="services-grid-full">
        {services.map((s, i) => (
          <div
            className="service-card-full"
            key={i}
            onClick={() => navigate(s.route)}
          >
            <div className={`service-icon ${s.iconClass}`}>
              {s.icon}
            </div>

            <h3 className="service-card-title">{s.title}</h3>
            <p className="service-card-desc">{s.desc}</p>

            <ul className="service-card-features">
              {s.features.map((f, fi) => (
                <li key={fi}>
                  <span className="service-card-check">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className="btn btn-sky-outline service-card-btn"
              onClick={(e) => {
                e.stopPropagation()
                navigate(s.route)
              }}
            >
              {s.link} →
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}