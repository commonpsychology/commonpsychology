// src/pages/ServiceDetailPage.jsx
import { useRouter } from '../context/RouterContext'
import { allServices, slugify } from './ServicesPage'

// ── Glass card palette (matches ServicesPage) ──────────────────
const GLASS = {
  bg:     'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)',
  border: '1px solid rgba(255,255,255,0.55)',
}

export default function ServiceDetailPage() {
  const { params, navigate } = useRouter()
  const service = allServices.find(s => slugify(s.title) === params.slug)

  // ── Not found ──────────────────────────────────────────────
  if (!service) {
    return (
      <div className="page-wrapper">
        <div className="section" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <h1 className="section-title">Service not found</h1>
          <p className="section-desc" style={{ marginBottom: '2rem' }}>
            We couldn't find a service matching "{params.slug}".
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/services')}>
            Back to All Services
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      {/* Hero */}
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
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <button
            onClick={() => navigate('/services')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#007ba8', fontWeight: 600, fontSize: '0.9rem',
              marginBottom: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            }}
          >
            ← All Services
          </button>
          <div className={`service-icon ${service.iconClass}`} style={{ margin: '0 auto 1rem' }}>
            {service.icon}
          </div>
          <span className="section-tag">{service.specialties[0]}</span>
          <h1 className="section-title">{service.title}</h1>
          <p className="section-desc">{service.desc}</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginTop: '1rem' }}>
            {service.specialties.map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.7rem',
                  borderRadius: '999px', background: 'rgba(29,158,117,0.1)',
                  border: '1px solid rgba(29,158,117,0.15)', color: '#1d9e75',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="section" style={{ background: 'var(--white)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: '2.5rem' }}>

          {/* Quick facts */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              background: GLASS.bg,
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: GLASS.border,
              borderRadius: '20px',
              padding: '1.5rem',
            }}
          >
            <QuickFact label="Duration" value={service.duration} />
            <QuickFact label="Format" value={service.format} />
            <QuickFact label="Frequency" value={service.frequency} />
          </div>

          {/* Overview */}
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Overview</h2>
            <p style={{ color: '#4a5a55', lineHeight: 1.7 }}>{service.overview}</p>
          </section>

          {/* Who it's for */}
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Is This Right For You?</h2>
            <ul style={{ display: 'grid', gap: '0.65rem', listStyle: 'none', padding: 0 }}>
              {service.whoFor.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.6rem', color: '#3a4a45' }}>
                  <span className="service-card-check" style={{ flexShrink: 0 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Features */}
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>What's Included</h2>
            <ul className="service-card-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
              {service.features.map((f, j) => (
                <li key={j}>
                  <span className="service-card-check">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* Process */}
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem' }}>How It Works</h2>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {service.process.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      flexShrink: 0, width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1d9e75, #007ba8)',
                      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem', fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{step.title}</h4>
                    <p style={{ margin: 0, color: '#5a6a65', fontSize: '0.92rem', lineHeight: 1.6 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {service.faqs.map((faq, i) => (
                <details
                  key={i}
                  style={{
                    background: GLASS.bg,
                    border: GLASS.border,
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                  }}
                >
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#213a34' }}>
                    {faq.q}
                  </summary>
                  <p style={{ margin: '0.6rem 0 0', color: '#5a6a65', lineHeight: 1.6 }}>{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <button
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)',
                boxShadow: '0 6px 18px rgba(0,150,210,0.3)',
                border: 'none',
                padding: '0.9rem 2.2rem',
                fontSize: '1rem',
              }}
              onClick={() => navigate('/book', { serviceTitle: service.title, serviceSpecialties: service.specialties })}
            >
              Book This Service
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

function QuickFact({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7a8a85', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#213a34' }}>
        {value}
      </div>
    </div>
  )
}