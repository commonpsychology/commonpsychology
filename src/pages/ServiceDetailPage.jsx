// src/pages/ServiceDetailPage.jsx
import { useState, useEffect, useRef } from 'react'
import { useRouter } from '../context/RouterContext'
import { allServices, slugify } from './ServicesPage'

const GLASS = {
  bg:        'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)',
  bgHover:   'linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(200,232,250,0.68) 55%, rgba(255,255,255,0.78) 100%)',
  border:    '1px solid rgba(255,255,255,0.55)',
  borderHov: '1px solid rgba(120,190,230,0.65)',
}

const TRUST_BADGES = [
  { icon: '🔒', label: 'Confidential' },
  { icon: '🎓', label: 'Licensed Clinicians' },
  { icon: '📊', label: 'Evidence-Based' },
  { icon: '🌐', label: 'Online or In-Person' },
]

// Short, generic blurbs keyed by common approach/technique tags found in `features`.
// Falls back to a neutral description if a tag isn't in this map.
const APPROACH_BLURBS = {
  'CBT': 'Cognitive Behavioral Therapy helps identify and reshape unhelpful thought patterns that drive difficult emotions and behavior.',
  'DBT': 'Dialectical Behavior Therapy blends acceptance and change strategies, building skills for emotional regulation and distress tolerance.',
  'Gottman Method': 'A research-backed framework for understanding relationship dynamics and building stronger communication between partners.',
  'EMDR': 'Eye Movement Desensitization and Reprocessing helps the brain reprocess distressing memories so they carry less emotional weight.',
  'Play Therapy': 'Uses play as a natural language for children to express emotions and work through experiences words can\'t always capture.',
  'MBSR': 'Mindfulness-Based Stress Reduction combines meditation and body awareness to build a sustainable, practical stress-management practice.',
  'CBT for insomnia': 'A structured, non-medication approach that retrains sleep patterns by addressing the thoughts and habits that disrupt rest.',
}

function approachFor(feature) {
  const key = Object.keys(APPROACH_BLURBS).find(k => feature.toLowerCase().includes(k.toLowerCase()))
  return key ? APPROACH_BLURBS[key] : null
}

// Generic, clearly-labeled sample testimonials — placeholders only.
// Swap these for real (consented, anonymized) client feedback before launch.
const SAMPLE_TESTIMONIALS = [
  { initials: 'A.S.', quote: 'I was nervous starting therapy, but my sessions felt genuinely tailored to what I was going through — not a generic script.' },
  { initials: 'R.T.',  quote: 'Having sessions online made it possible to keep up consistently, even during a busy work season.' },
  { initials: 'P.K.',  quote: 'It took a few sessions to open up, but I felt like my therapist was actually listening and adjusting the approach with me.' },
]

const NAV_SECTIONS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'who-for',    label: 'Is This For You?' },
  { id: 'approach',   label: 'Our Approach' },
  { id: 'included',   label: "What's Included" },
  { id: 'process',    label: 'How It Works' },
  { id: 'benefits',   label: 'Benefits' },
  { id: 'pricing',    label: 'Pricing & Insurance' },
  { id: 'stories',    label: 'Client Stories' },
  { id: 'faqs',       label: 'FAQs' },
]

export default function ServiceDetailPage() {
  const { params, navigate } = useRouter()
  const service = allServices.find(s => slugify(s.title) === params.slug)
  const [openFaq, setOpenFaq] = useState(0)
  const [activeSection, setActiveSection] = useState('overview')
  const sectionRefs = useRef({})

  // Track which section is in view for the sticky in-page nav highlight
  useEffect(() => {
    if (!service) return
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id)
        })
      },
      { rootMargin: '-15% 0px -70% 0px' }
    )
    Object.values(sectionRefs.current).forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [service])

  function scrollTo(id) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!service) {
    return (
      <div className="page-wrapper">
        <div className="section" style={{ textAlign: 'center', padding: '6rem 2rem' }}>
          <h1 className="section-title">Service not found</h1>
          <p className="section-desc" style={{ marginBottom: '2rem' }}>
            {params.slug
              ? `We couldn't find a service matching "${params.slug}".`
              : "No service was specified in the URL."}
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/services')}>
            Back to All Services
          </button>
        </div>
      </div>
    )
  }

  const related = allServices
    .filter(s => s.title !== service.title && s.specialties.some(tag => service.specialties.includes(tag)))
    .slice(0, 3)
  const relatedPool = related.length > 0 ? related : allServices.filter(s => s.title !== service.title).slice(0, 3)

  const approachItems = (service.features || [])
    .map(f => ({ feature: f, blurb: approachFor(f) }))
    .filter(item => item.blurb)

  const availableNav = NAV_SECTIONS.filter(n => {
    if (n.id === 'overview')  return !!service.overview
    if (n.id === 'who-for')   return service.whoFor?.length > 0
    if (n.id === 'approach')  return approachItems.length > 0
    if (n.id === 'included')  return service.features?.length > 0
    if (n.id === 'process')   return service.process?.length > 0
    if (n.id === 'benefits')  return service.whoFor?.length > 0
    if (n.id === 'pricing')   return true
    if (n.id === 'stories')   return true
    if (n.id === 'faqs')      return service.faqs?.length > 0
    return true
  })

  return (
    <div className="page-wrapper">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div
        className="page-hero"
        style={{
          position: 'relative', overflow: 'hidden', padding: '3.5rem 2rem 4.5rem',
          borderRadius: '0 0 60px 60px',
          background: `
            radial-gradient(ellipse 80% 60% at 15% 30%, rgba(180,230,210,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 70% 80% at 85% 10%, rgba(186,220,248,0.5) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 60% 90%, rgba(254,243,199,0.4) 0%, transparent 60%),
            linear-gradient(160deg, #f0faf5 0%, #e8f4fb 45%, #fefce8 100%)
          `,
        }}
      >
        <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', background: 'rgba(0,123,168,0.1)', filter: 'blur(40px)', top: -60, right: '3%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(29,158,117,0.1)', filter: 'blur(40px)', bottom: -30, left: '5%', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: '#5a7a72', marginBottom: '1.75rem' }}>
            <span style={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/')}>Home</span>
            <span>/</span>
            <span style={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/services')}>Services</span>
            <span>/</span>
            <span style={{ color: '#213a34', fontWeight: 700 }}>{service.title}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5rem' }}>
            <div className={`service-icon ${service.iconClass}`} style={{ width: 76, height: 76, fontSize: '2.2rem', flexShrink: 0 }}>
              {service.icon}
            </div>
            <div style={{ flex: 1, minWidth: 260 }}>
              {service.specialties?.[0] && <span className="section-tag">{service.specialties[0]}</span>}
              <h1 className="section-title" style={{ margin: '0.35rem 0 0.6rem' }}>{service.title}</h1>
              <p className="section-desc" style={{ margin: 0, maxWidth: 620 }}>{service.desc}</p>
            </div>
          </div>

          {service.specialties?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '1.5rem' }}>
              {service.specialties.map(tag => (
                <span key={tag} style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.8rem', borderRadius: '999px', background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.15)', color: '#1d9e75' }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Trust badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '2rem' }}>
            {TRUST_BADGES.map(b => (
              <div key={b.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.7)',
                borderRadius: '999px', padding: '0.45rem 0.9rem', fontSize: '0.78rem', fontWeight: 600, color: '#213a34',
              }}>
                <span>{b.icon}</span>{b.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── In-page nav (sticky) ────────────────────────────── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderBottom: '1px solid #e5ede9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: '0.25rem', overflowX: 'auto', padding: '0 2rem' }} className="service-detail-inpage-nav">
          {availableNav.map(n => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              style={{
                flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.9rem 0.9rem', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap',
                color: activeSection === n.id ? '#007ba8' : '#7a8a85',
                borderBottom: activeSection === n.id ? '2px solid #007ba8' : '2px solid transparent',
                transition: 'color 0.15s ease, border-color 0.15s ease',
              }}
            >
              {n.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body: content + sticky sidebar ──────────────────── */}
      <div className="section" style={{ background: 'var(--white)' }}>
        <div
          style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '3rem', alignItems: 'start' }}
          className="service-detail-grid"
        >
          {/* ── Main column ── */}
          <div style={{ display: 'grid', gap: '3.5rem' }}>

            {service.overview && (
              <section id="overview" ref={el => (sectionRefs.current.overview = el)} style={{ scrollMarginTop: '5rem' }}>
                <SectionLabel>Overview</SectionLabel>
                <p style={{ color: '#3a4a45', lineHeight: 1.8, fontSize: '1.02rem' }}>{service.overview}</p>
              </section>
            )}

            {service.whoFor?.length > 0 && (
              <section id="who-for" ref={el => (sectionRefs.current['who-for'] = el)} style={{ scrollMarginTop: '5rem' }}>
                <SectionLabel>Is This Right For You?</SectionLabel>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {service.whoFor.map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: GLASS.bg, border: GLASS.border, borderRadius: '14px', padding: '0.9rem 1.1rem' }}>
                      <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg, #1d9e75, #007ba8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 800, marginTop: '0.1rem' }}>✓</span>
                      <span style={{ color: '#3a4a45', lineHeight: 1.6, fontSize: '0.95rem' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {approachItems.length > 0 && (
              <section id="approach" ref={el => (sectionRefs.current.approach = el)} style={{ scrollMarginTop: '5rem' }}>
                <SectionLabel>Our Approach</SectionLabel>
                <p style={{ color: '#5a6a65', fontSize: '0.92rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                  We draw on established, evidence-based methods — matched to your goals rather than applied as a fixed formula.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {approachItems.map(({ feature, blurb }) => (
                    <div key={feature} style={{ background: GLASS.bg, border: GLASS.border, borderRadius: '16px', padding: '1.25rem' }}>
                      <div style={{ fontWeight: 700, color: '#1d9e75', fontSize: '0.9rem', marginBottom: '0.4rem' }}>{feature}</div>
                      <p style={{ margin: 0, color: '#5a6a65', fontSize: '0.86rem', lineHeight: 1.6 }}>{blurb}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {service.features?.length > 0 && (
              <section id="included" ref={el => (sectionRefs.current.included = el)} style={{ scrollMarginTop: '5rem' }}>
                <SectionLabel>What's Included</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                  {service.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', padding: '0.7rem 0' }}>
                      <span className="service-card-check">✓</span>
                      <span style={{ color: '#3a4a45', fontSize: '0.92rem', fontWeight: 500 }}>{f}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {service.process?.length > 0 && (
              <section id="process" ref={el => (sectionRefs.current.process = el)} style={{ scrollMarginTop: '5rem' }}>
                <SectionLabel>How It Works</SectionLabel>
                <div style={{ position: 'relative', display: 'grid', gap: '1.75rem' }}>
                  <div style={{ position: 'absolute', left: 17, top: 8, bottom: 8, width: 2, background: 'linear-gradient(180deg, rgba(29,158,117,0.35), rgba(0,123,168,0.15))' }} />
                  {service.process.map((step, i) => (
                    <div key={i} style={{ position: 'relative', display: 'flex', gap: '1.1rem', alignItems: 'flex-start' }}>
                      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #1d9e75, #007ba8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 800, zIndex: 1, boxShadow: '0 4px 12px rgba(29,158,117,0.3)' }}>
                        {i + 1}
                      </div>
                      <div style={{ paddingTop: '0.15rem' }}>
                        <h4 style={{ margin: '0 0 0.3rem', fontSize: '1.05rem', color: '#213a34' }}>{step.title}</h4>
                        <p style={{ margin: 0, color: '#5a6a65', fontSize: '0.92rem', lineHeight: 1.65 }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {service.whoFor?.length > 0 && (
              <section id="benefits" ref={el => (sectionRefs.current.benefits = el)} style={{ scrollMarginTop: '5rem' }}>
                <SectionLabel>What You Can Expect to Gain</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  {[
                    { icon: '🧭', text: 'A clearer sense of direction and practical tools you can use between sessions.' },
                    { icon: '🗣️', text: 'A confidential space to speak openly, without judgment or rushed advice.' },
                    { icon: '📈', text: 'Progress you can track over time, with check-ins to adjust the approach as needed.' },
                    { icon: '🤝', text: 'A therapeutic relationship built on trust, at a pace that respects your comfort.' },
                  ].map((b, i) => (
                    <div key={i} style={{ background: GLASS.bg, border: GLASS.border, borderRadius: '16px', padding: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{b.icon}</span>
                      <p style={{ margin: 0, color: '#3a4a45', fontSize: '0.88rem', lineHeight: 1.6 }}>{b.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section id="pricing" ref={el => (sectionRefs.current.pricing = el)} style={{ scrollMarginTop: '5rem' }}>
              <SectionLabel>Pricing &amp; Insurance</SectionLabel>
              <div style={{ background: GLASS.bg, border: GLASS.border, borderRadius: '16px', padding: '1.5rem', display: 'grid', gap: '0.9rem' }}>
                <p style={{ margin: 0, color: '#3a4a45', fontSize: '0.92rem', lineHeight: 1.7 }}>
                  Session fees vary by therapist and are shown before you confirm your booking. You'll see the exact price for your chosen therapist and time slot during checkout — no hidden charges.
                </p>
                <p style={{ margin: 0, color: '#5a6a65', fontSize: '0.85rem', lineHeight: 1.7 }}>
                  Have a question about payment plans or receipts for reimbursement? Reach out through our <span style={{ color: '#007ba8', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/contact')}>contact page</span> before booking and we'll help you plan ahead.
                </p>
              </div>
            </section>

            <section id="stories" ref={el => (sectionRefs.current.stories = el)} style={{ scrollMarginTop: '5rem' }}>
              <SectionLabel>Client Stories</SectionLabel>
              <p style={{ color: '#7a8a85', fontSize: '0.78rem', marginBottom: '1.25rem', fontStyle: 'italic' }}>
                Illustrative examples — replace with real, consented client feedback.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {SAMPLE_TESTIMONIALS.map((t, i) => (
                  <div key={i} style={{ background: GLASS.bg, border: GLASS.border, borderRadius: '16px', padding: '1.25rem', display: 'grid', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.4rem', color: '#a8c8c0' }}>“</span>
                    <p style={{ margin: 0, color: '#3a4a45', fontSize: '0.88rem', lineHeight: 1.6, fontStyle: 'italic' }}>{t.quote}</p>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1d9e75' }}>— {t.initials}</span>
                  </div>
                ))}
              </div>
            </section>

            {service.faqs?.length > 0 && (
              <section id="faqs" ref={el => (sectionRefs.current.faqs = el)} style={{ scrollMarginTop: '5rem' }}>
                <SectionLabel>Frequently Asked Questions</SectionLabel>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {service.faqs.map((faq, i) => {
                    const isOpen = openFaq === i
                    return (
                      <div key={i} style={{ background: isOpen ? GLASS.bgHover : GLASS.bg, border: isOpen ? GLASS.borderHov : GLASS.border, borderRadius: '14px', overflow: 'hidden', transition: 'background 0.2s ease, border 0.2s ease' }}>
                        <button
                          onClick={() => setOpenFaq(isOpen ? -1 : i)}
                          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '1rem 1.25rem', fontWeight: 600, color: '#213a34', fontSize: '0.94rem' }}
                        >
                          {faq.q}
                          <span style={{ flexShrink: 0, marginLeft: '1rem', color: '#007ba8', fontWeight: 700, transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', fontSize: '1.1rem' }}>+</span>
                        </button>
                        {isOpen && (
                          <p style={{ margin: 0, padding: '0 1.25rem 1.1rem', color: '#5a6a65', lineHeight: 1.65, fontSize: '0.9rem' }}>{faq.a}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ── Sticky sidebar ── */}
          <aside className="service-detail-sidebar" style={{ position: 'sticky', top: '4.5rem', display: 'grid', gap: '1.25rem' }}>
            <div style={{ background: GLASS.bg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: GLASS.border, borderRadius: '20px', padding: '1.5rem', boxShadow: '0 8px 28px rgba(0,123,168,0.12)' }}>
              <h3 style={{ margin: '0 0 1.1rem', fontSize: '1.05rem', color: '#213a34' }}>Session Details</h3>
              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {service.duration  && <QuickFact icon="⏱️" label="Duration"  value={service.duration} />}
                {service.format    && <QuickFact icon="📍" label="Format"    value={service.format} />}
                {service.frequency && <QuickFact icon="🔁" label="Frequency" value={service.frequency} />}
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '1.4rem', background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)', boxShadow: '0 6px 18px rgba(0,150,210,0.3)', border: 'none', padding: '0.85rem 1rem', fontSize: '0.95rem' }}
                onClick={() => navigate('/book', { serviceTitle: service.title, serviceSpecialties: service.specialties })}
              >
                Book This Service →
              </button>
              <p style={{ margin: '0.75rem 0 0', fontSize: '0.72rem', color: '#7a8a85', textAlign: 'center' }}>
                No payment required to start booking
              </p>
            </div>

            {relatedPool.length > 0 && (
              <div style={{ background: GLASS.bg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: GLASS.border, borderRadius: '20px', padding: '1.5rem' }}>
                <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: '#213a34' }}>Related Services</h3>
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  {relatedPool.map(s => (
                    <button
                      key={s.title}
                      onClick={() => navigate(`/services/${slugify(s.title)}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.6)', borderRadius: '12px', padding: '0.6rem 0.7rem', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <span style={{ fontSize: '1.15rem' }}>{s.icon}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3a4a45' }}>{s.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* ── Closing CTA banner ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1d9e75 0%, #007ba8 100%)',
        padding: '3.5rem 2rem', textAlign: 'center', color: '#fff',
      }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.6rem', margin: '0 0 0.6rem' }}>Ready to take the first step?</h2>
          <p style={{ opacity: 0.92, margin: '0 0 1.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Booking takes a few minutes, and you can choose a therapist that fits your needs and schedule.
          </p>
          <button
            className="btn"
            style={{ background: '#fff', color: '#007ba8', border: 'none', padding: '0.9rem 2.2rem', fontSize: '0.95rem', fontWeight: 700, borderRadius: '999px', cursor: 'pointer' }}
            onClick={() => navigate('/book', { serviceTitle: service.title, serviceSpecialties: service.specialties })}
          >
            Book This Service →
          </button>
        </div>
      </div>

      <style>{`
        .service-detail-inpage-nav::-webkit-scrollbar { height: 0; }
        @media (max-width: 860px) {
          .service-detail-grid { grid-template-columns: 1fr !important; }
          .service-detail-sidebar { position: static !important; }
        }
      `}</style>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' }}>
      <div style={{ width: 4, height: 20, borderRadius: '4px', background: 'linear-gradient(180deg, #1d9e75, #007ba8)' }} />
      <h2 style={{ fontSize: '1.35rem', margin: 0, color: '#213a34' }}>{children}</h2>
    </div>
  )
}

function QuickFact({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#7a8a85', marginBottom: '0.15rem' }}>{label}</div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#213a34' }}>{value}</div>
      </div>
    </div>
  )
}