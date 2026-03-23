// src/components/Assessment.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { wellness } from '../services/api'

export default function Assessment() {
  const { navigate }          = useRouter()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    wellness.assessments()
      .then(d => setAssessments(d.assessments || []))
      .catch(() => setAssessments([
        { id: 'phq9',    title: 'PHQ-9 Depression Screening', description: 'Validated depression screening tool.',      is_free: true },
        { id: 'gad7',    title: 'GAD-7 Anxiety Scale',        description: 'Generalised anxiety disorder assessment.',  is_free: true },
        { id: 'dass21',  title: 'DASS-21',                    description: 'Depression, anxiety & stress scale.',       is_free: true },
        { id: 'burnout', title: 'Burnout Check',              description: 'Work-related stress & burnout analysis.',   is_free: true },
      ]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section
      id="assessments"
      style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--green-deep)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── subtle background texture ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.04) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)',
      }} />

      {/* ── main content ── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '3rem',
        maxWidth: 1200,
        width: '100%',
        margin: '0 auto',
        padding: '6rem 2rem 3rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}
        className="assessment-grid"
      >
        {/* ── left column ── */}
        <div>
          <span style={{
            display: 'inline-block',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: '1.25rem',
          }}>
            Self Assessment
          </span>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'white',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
          }}>
            Understand Where<br />
            You Are{' '}
            <em style={{ color: 'var(--green-pale)', fontStyle: 'normal' }}>Right Now</em>
          </h2>

          <p style={{
            fontSize: '1rem',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.75,
            marginBottom: '2rem',
            maxWidth: 440,
          }}>
            Our clinically validated tools give you honest insight into your mental
            health — completely free, private, and confidential.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Clinically validated international standards',
              'Results with personalized recommendations',
              'Completely anonymous — no account needed',
              'Share securely with your therapist',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: 'var(--green-pale)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '0.7rem', color: 'var(--green-deep)', fontWeight: 700,
                }}>✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            className="btn btn-lg"
            style={{
              background: 'white',
              color: 'var(--green-deep)',
              fontWeight: 700,
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 2rem',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            onClick={() => navigate('/assessments')}
          >
            Start a Free Assessment →
          </button>
        </div>

        {/* ── right column: cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
        }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  opacity: 0.4,
                  height: 140,
                }} />
              ))
            : assessments.slice(0, 4).map((a, i) => (
                <div
                  key={a.id || i}
                  onClick={() => navigate('/assessment-take', { assessmentId: a.id, title: a.title })}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s, transform 0.15s',
                    backdropFilter: 'blur(8px)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none' }}
                >
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: 'white',
                    marginBottom: '0.5rem',
                    lineHeight: 1.3,
                  }}>{a.title}</h4>
                  <p style={{
                    fontSize: '0.78rem',
                    color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.5,
                    marginBottom: '0.75rem',
                  }}>{a.description}</p>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--green-pale)',
                    background: 'rgba(255,255,255,0.08)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: 100,
                  }}>
                    {a.is_free ? 'FREE · 5 MIN' : 'Premium'}
                  </span>
                </div>
              ))
          }
        </div>
      </div>

      {/* ── disclaimer banner ── */}
      <div style={{
        width: '100%',
        background: 'rgba(0,0,0,0.25)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '1.25rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 1,
      }}>
        <p style={{
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.6,
          maxWidth: 680,
          textAlign: 'center',
          margin: 0,
        }}>
          <span style={{ color: 'rgba(255,200,100,0.9)', fontWeight: 700, marginRight: '0.4rem' }}>⚠ Important Notice:</span>
          Self-assessment tools are screening aids only and can be misleading due to symptom overlap across conditions (comorbidity). Results should never replace a professional evaluation. Please consult our experienced clinicians for an accurate, comprehensive mental health assessment.
        </p>
        <button
          onClick={() => navigate('/book')}
          style={{
            flexShrink: 0,
            background: 'var(--green-pale)',
            color: 'var(--green-deep)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '0.6rem 1.4rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Book Professional Assessment →
        </button>
      </div>

      {/* ── responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .assessment-grid {
            grid-template-columns: 1fr !important;
            padding-top: 4rem !important;
          }
        }
      `}</style>
    </section>
  )
}