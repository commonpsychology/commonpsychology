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
    <section className="section assessment" id="assessments">
      <div>
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
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/assessment-take', { assessmentId: a.id, title: a.title })}
          >
            <h4>{a.title}</h4>
            <p>{a.desc}</p>
            <span className="assessment-tag">{a.tag}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
