import { useRouter } from '../context/RouterContext'

const assessments = [
  { title: 'PHQ-9', desc: 'Depression screening — 9 questions', tag: 'FREE · 5 min', id: 'phq9' },
  { title: 'GAD-7', desc: 'Anxiety assessment tool', tag: 'FREE · 4 min', id: 'gad7' },
  { title: 'DASS-21', desc: 'Depression, Anxiety & Stress', tag: 'FREE · 8 min', id: 'dass21' },
  { title: 'Burnout Check', desc: 'Work-related stress analysis', tag: 'FREE · 6 min', id: 'burnout' },
]

export default function Assessment() {
  const { navigate } = useRouter()

  return (
    <>
      <style>{`
        .section.assessment {
          display: flex;
          gap: 48px;
          align-items: center;
          padding: 72px 56px;
          background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 40%, #ffffff 100%);
          position: relative;
          overflow: hidden;
        }

        .section.assessment::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(56,189,248,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        .section.assessment::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(186,230,253,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .section-tag {
          display: inline-block;
          background: linear-gradient(90deg, #bae6fd, #e0f2fe);
          color: #0369a1;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 4px 14px;
          border-radius: 20px;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 32px;
          font-weight: 700;
          color: #111111;
          line-height: 1.25;
          margin-bottom: 14px;
        }

        .section-title em {
          font-style: italic;
          color: #0284c7;
        }

        .section-desc {
          font-size: 15px;
          color: #111111;
          line-height: 1.65;
          margin-bottom: 28px;
          max-width: 380px;
        }

        .assessment-list {
          list-style: none;
          padding: 0;
          margin-bottom: 32px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .assessment-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          color: #111111;
        }

        .assessment-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #7dd3fc);
          color: white;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .btn {
          display: inline-block;
          padding: 14px 28px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .btn-white {
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          color: white;
          box-shadow: 0 4px 16px rgba(14,165,233,0.28);
        }

        .btn-white:hover {
          background: linear-gradient(135deg, #0284c7, #0ea5e9);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(14,165,233,0.38);
        }

        .assessment-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          flex-shrink: 0;
          width: 380px;
          position: relative;
          z-index: 1;
        }

        .assessment-card {
          background: linear-gradient(145deg, #ffffff, #f0f9ff);
          border: 1.5px solid #bae6fd;
          border-radius: 14px;
          padding: 18px;
          cursor: pointer;
          transition: all 0.22s ease;
          box-shadow: 0 2px 8px rgba(186,230,253,0.35);
        }

        .assessment-card:hover {
          border-color: #38bdf8;
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(56,189,248,0.2);
          background: linear-gradient(145deg, #f0f9ff, #e0f2fe);
        }

        .assessment-card h4 {
          font-size: 16px;
          font-weight: 700;
          color: #111111;
          margin-bottom: 6px;
        }

        .assessment-card p {
          font-size: 12px;
          color: #333333;
          line-height: 1.5;
          margin-bottom: 10px;
        }

        .assessment-tag {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          color: #0284c7;
          background: linear-gradient(90deg, #e0f2fe, #bae6fd);
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.03em;
        }
      `}</style>

      <section className="section assessment" id="assessments">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="section-tag">Self Assessment</span>
          <h2 className="section-title">Understand Where You Are <em>Right Now</em></h2>
          <p className="section-desc">
            Our clinically validated tools give you honest insight into your mental health — completely free, private, and confidential.
          </p>

          <ul className="assessment-list">
            {[
              'Clinically validated international standards',
              'Results with personalized recommendations',
              'Completely anonymous — no account needed',
              'Share securely with your therapist',
            ].map((item, i) => (
              <li className="assessment-item" key={i}>
                <div className="assessment-check">✓</div>
                {item}
              </li>
            ))}
          </ul>

          <button
            className="btn btn-white btn-lg"
            onClick={() => navigate('/assessments')}
          >
            Start a Free Assessment →
          </button>
        </div>

        <div className="assessment-cards">
          {assessments.map((a, i) => (
            <div
              className="assessment-card"
              key={i}
              onClick={() => navigate('/assessment-take', { assessmentId: a.id, title: a.title })}
            >
              <h4>{a.title}</h4>
              <p>{a.desc}</p>
              <span className="assessment-tag">{a.tag}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}