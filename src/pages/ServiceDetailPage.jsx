import { useRouter } from '../context/RouterContext'
import { allServices, slugify } from './ServicesPage'

export default function ServiceDetailPage() {
  const { currentPath, navigate } = useRouter()
  const slug = currentPath.replace('/services/', '')
  const service = allServices.find(s => slugify(s.title) === slug)

  if (!service) {
    return (
      <div className="page-wrapper" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h1 className="section-title">Service Not Found</h1>
        <p className="section-desc">We couldn't find the service you're looking for.</p>
        <button
          className="btn btn-primary"
          style={{
            marginTop: '1.5rem',
            background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)',
            border: 'none',
            padding: '0.8rem 1.8rem',
            borderRadius: '999px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          onClick={() => navigate('/services')}
        >
          ← Back to All Services
        </button>
      </div>
    )
  }

  const handleBook = () =>
    navigate('/book', { serviceTitle: service.title, serviceSpecialties: service.specialties })

  return (
    <div className="page-wrapper">

      {/* ── Hero ───────────────────────────────────────────── */}
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
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: '999px',
              padding: '0.4rem 1rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#1d9e75',
              cursor: 'pointer',
              marginBottom: '1.2rem',
              backdropFilter: 'blur(6px)',
            }}
          >
            ← All Services
          </button>

          <div
            className={`service-icon ${service.iconClass}`}
            style={{
              margin: '0 auto 1rem',
              width: 72, height: 72,
              fontSize: '2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {service.icon}
          </div>

          <span className="section-tag">Service Details</span>
          <h1 className="section-title">{service.title}</h1>
          <p className="section-desc">{service.desc}</p>

          <button
            className="btn btn-primary"
            style={{
              marginTop: '1.5rem',
              background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)',
              boxShadow: '0 8px 24px rgba(0,150,210,0.35)',
              border: 'none',
              padding: '0.9rem 2rem',
              fontSize: '1rem',
              fontWeight: 700,
              borderRadius: '999px',
              cursor: 'pointer',
            }}
            onClick={handleBook}
          >
            Book This Session
          </button>
        </div>
      </div>

      {/* ── Details card ───────────────────────────────────── */}
      <div className="section" style={{ background: 'var(--white)' }}>
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.55)',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: '0 20px 44px rgba(0,123,168,0.15), 0 6px 16px rgba(29,158,117,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a4a', marginBottom: '1rem' }}>
            What's Included
          </h2>

          <ul className="service-card-features" style={{ marginBottom: '2rem' }}>
            {service.features.map((f, i) => (
              <li key={i} style={{ fontSize: '0.95rem', marginBottom: '0.6rem' }}>
                <span className="service-card-check">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a3a4a', marginBottom: '1rem' }}>
            Specialties
          </h2>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2.5rem' }}>
            {service.specialties.map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  padding: '0.3rem 0.8rem',
                  borderRadius: '999px',
                  background: 'rgba(29,158,117,0.1)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(29,158,117,0.15)',
                  color: '#1d9e75',
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #1d9e75, #007ba8)',
                boxShadow: '0 10px 28px rgba(29,158,117,0.35)',
                border: 'none',
                padding: '1rem 2.6rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                borderRadius: '999px',
                cursor: 'pointer',
              }}
              onClick={handleBook}
            >
              Book This Service Now
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}