import { useRouter } from '../context/RouterContext'

const assessments = [
  { title: 'PHQ-9', desc: 'Depression screening — 9 questions', tag: 'FREE · 5 min', id: 'phq9' },
  { title: 'GAD-7', desc: 'Anxiety assessment tool', tag: 'FREE · 4 min', id: 'gad7' },
  { title: 'DASS-21', desc: 'Depression, Anxiety & Stress', tag: 'FREE · 8 min', id: 'dass21' },
  { title: 'Burnout Check', desc: 'Work-related stress analysis', tag: 'FREE · 6 min', id: 'burnout' },
]

const FEATURES = [
  'Clinically validated international standards',
  'Results with personalized recommendations',
  'Completely anonymous — no account needed',
  'Share securely with your therapist',
]

export default function Assessment() {
  const { navigate } = useRouter()

  return (
    <section className="cp-assess" id="assessments">
      <style>{`
        .cp-assess {
          position: relative;
          overflow: hidden;
          padding: 5rem 1.5rem;
          background: linear-gradient(180deg, var(--sky-light) 0%, var(--white) 55%, var(--sky-light) 100%);
        }
        .cp-assess-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
        }
        .cp-assess-inner {
          position: relative;
          z-index: 1;
          max-width: 1180px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .cp-assess-eyebrow {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.3rem 0.85rem; margin-bottom: 1.4rem;
          border: 1.5px solid var(--blue-pale); border-radius: 100;
          font-family: var(--font-body); font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #0f3460; background: var(--sky-light);
        }
        .cp-assess-title {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(1.9rem, 4vw, 2.7rem); line-height: 1.2;
          color: var(--text-dark); margin: 0 0 1rem;
        }
        .cp-assess-title em {
          font-style: italic; color: #00BFFF;
        }
        .cp-assess-desc {
          font-family: var(--font-body); font-size: 1.02rem;
          color: var(--text-mid); line-height: 1.65; margin: 0 0 2rem; max-width: 480px;
        }

        .cp-assess-list {
          list-style: none; margin: 0 0 2.4rem; padding: 0;
          display: flex; flex-direction: column; gap: 0.9rem;
        }
        .cp-assess-item {
          display: flex; align-items: center; gap: 0.75rem;
          font-family: var(--font-body); font-size: 0.96rem;
          color: var(--text-dark); font-weight: 500;
        }
        .cp-assess-check {
          width: 26px; height: 26px; flex-shrink: 0; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 800; color: var(--white);
          background: linear-gradient(135deg, #00BFFF, #007BA8);
          box-shadow: 0 4px 10px rgba(0,123,168,0.28);
        }

        .cp-assess-cta {
          padding: 0.95rem 1.8rem; border: none; border-radius: 100;
          background: #00BFFF; color: var(--white);
          font-family: var(--font-body); font-weight: 700; font-size: 0.95rem;
          cursor: pointer; box-shadow: 0 10px 24px rgba(0,123,168,0.32);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cp-assess-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(0,123,168,0.4);
        }

        .cp-assess-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.1rem;
        }
        .cp-assess-card {
          position: relative;
          cursor: pointer;
          padding: 1.6rem 1.4rem;
          border-radius: var(--radius-lg);
          background: linear-gradient(160deg, #ffffff 0%, #eef8ff 60%, #dff2fc 100%);
          border: 1.5px solid var(--blue-pale);
          box-shadow: 0 4px 14px rgba(15,52,96,0.06);
          transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease;
        }
        .cp-assess-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 34px rgba(15,52,96,0.14);
          border-color: #00BFFF;
        }
        .cp-assess-card h4 {
          margin: 0 0 0.4rem;
          font-family: var(--font-display); font-weight: 700;
          font-size: 1.1rem; color: var(--text-dark);
        }
        .cp-assess-card p {
          margin: 0 0 1rem;
          font-family: var(--font-body); font-size: 0.86rem;
          color: var(--text-mid); line-height: 1.5;
        }
        .cp-assess-tag {
          display: inline-block;
          padding: 0.3rem 0.7rem;
          border-radius: 100;
          font-family: var(--font-body); font-size: 0.7rem; font-weight: 700;
          letter-spacing: 0.03em;
          color: #005580;
          background: var(--sky-light);
          border: 1px solid var(--blue-pale);
        }

        @media (max-width: 900px) {
          .cp-assess-inner { grid-template-columns: 1fr; }
        }
        @media (max-width: 520px) {
          .cp-assess { padding: 3.5rem 1.25rem; }
          .cp-assess-cards { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ambient blobs, same treatment as NoticeSection */}
      <div className="cp-assess-blob" style={{
        width: 360, height: 360, top: -140, left: -120,
        background: 'radial-gradient(circle, rgba(41,128,185,0.14), transparent 70%)',
      }} />
      <div className="cp-assess-blob" style={{
        width: 300, height: 300, bottom: -120, right: -100,
        background: 'radial-gradient(circle, rgba(0,191,255,0.12), transparent 70%)',
      }} />

      <div className="cp-assess-inner">
        <div>
          <span className="cp-assess-eyebrow">📋 Self Assessment</span>
          <h2 className="cp-assess-title">
            Understand Where You Are <em>Right Now</em>
          </h2>
          <p className="cp-assess-desc">
            Our clinically validated tools give you honest insight into your mental health — completely free, private, and confidential.
          </p>

          <ul className="cp-assess-list">
            {FEATURES.map((item, i) => (
              <li className="cp-assess-item" key={i}>
                <div className="cp-assess-check">✓</div>
                {item}
              </li>
            ))}
          </ul>

          <button className="cp-assess-cta" onClick={() => navigate('/assessments')}>
            Start a Free Assessment →
          </button>
        </div>

        <div className="cp-assess-cards">
          {assessments.map((a, i) => (
            <div
              className="cp-assess-card"
              key={i}
              onClick={() => navigate('/assessment-take', { assessmentId: a.id, title: a.title })}
            >
              <h4>{a.title}</h4>
              <p>{a.desc}</p>
              <span className="cp-assess-tag">{a.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}