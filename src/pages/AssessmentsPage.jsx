// src/components/Assessment.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { wellness } from '../services/api'

// ─── Assessment question banks ───────────────────────────────────────────────

const ASSESSMENT_QUESTIONS = {
  phq9: {
    title: 'PHQ-9 Depression Screening',
    instruction: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    scores: [0, 1, 2, 3],
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
      'Trouble concentrating on things, such as reading the newspaper or watching television',
      'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
      'Thoughts that you would be better off dead, or of hurting yourself in some way',
    ],
    domains: [
      { name: 'Mood', indices: [0, 1], color: '#5b89d4' },
      { name: 'Sleep & Energy', indices: [2, 3], color: '#7b6fd4' },
      { name: 'Appetite & Self-image', indices: [4, 5], color: '#d47b6f' },
      { name: 'Concentration & Activity', indices: [6, 7], color: '#6fb8d4' },
      { name: 'Suicidal Ideation', indices: [8], color: '#d46f6f' },
    ],
    severity: (total) => {
      if (total <= 4)  return { label: 'Minimal', color: '#4caf50', bg: 'rgba(76,175,80,0.12)' }
      if (total <= 9)  return { label: 'Mild', color: '#8bc34a', bg: 'rgba(139,195,74,0.12)' }
      if (total <= 14) return { label: 'Moderate', color: '#ff9800', bg: 'rgba(255,152,0,0.12)' }
      if (total <= 19) return { label: 'Moderately Severe', color: '#f44336', bg: 'rgba(244,67,54,0.12)' }
      return { label: 'Severe', color: '#b71c1c', bg: 'rgba(183,28,28,0.12)' }
    },
    maxScore: 27,
  },

  gad7: {
    title: 'GAD-7 Anxiety Scale',
    instruction: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'],
    scores: [0, 1, 2, 3],
    questions: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen',
    ],
    domains: [
      { name: 'Core Anxiety', indices: [0, 1, 2], color: '#5b89d4' },
      { name: 'Physical Tension', indices: [3, 4], color: '#d4a45b' },
      { name: 'Irritability & Fear', indices: [5, 6], color: '#d47b6f' },
    ],
    severity: (total) => {
      if (total <= 4)  return { label: 'Minimal', color: '#4caf50', bg: 'rgba(76,175,80,0.12)' }
      if (total <= 9)  return { label: 'Mild', color: '#8bc34a', bg: 'rgba(139,195,74,0.12)' }
      if (total <= 14) return { label: 'Moderate', color: '#ff9800', bg: 'rgba(255,152,0,0.12)' }
      return { label: 'Severe', color: '#b71c1c', bg: 'rgba(183,28,28,0.12)' }
    },
    maxScore: 21,
  },

  pcl5: {
    title: 'PCL-5 PTSD Checklist',
    instruction: 'In the past month, how much were you bothered by the following problems? These may relate to a stressful experience.',
    options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely'],
    scores: [0, 1, 2, 3, 4],
    questions: [
      // Criterion B – Intrusion (5 items)
      'Repeated, disturbing, and unwanted memories of the stressful experience',
      'Repeated, disturbing dreams of the stressful experience',
      'Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)',
      'Feeling very upset when something reminded you of the stressful experience',
      'Having strong physical reactions when something reminded you of the stressful experience',
      // Criterion C – Avoidance (2 items)
      'Avoiding internal reminders of the stressful experience (thoughts, feelings or physical sensations)',
      'Avoiding external reminders of the stressful experience (people, places, conversations, activities, objects or situations)',
      // Criterion D – Negative alterations (7 items)
      'Trouble remembering important parts of the stressful experience',
      'Having strong negative beliefs about yourself, other people, or the world',
      'Blaming yourself or someone else for the stressful experience or what happened after it',
      'Having strong negative feelings such as fear, horror, anger, guilt, or shame',
      'Loss of interest in activities that you used to enjoy',
      'Feeling distant or cut off from other people',
      'Trouble experiencing positive feelings',
      // Criterion E – Hyperarousal (5 items)
      'Irritable behaviour, angry outbursts, or acting aggressively',
      'Taking too many risks or doing things that could cause you harm',
      'Being "super-alert" or watchful or on guard',
      'Feeling jumpy or easily startled',
      'Having difficulty concentrating',
      'Trouble falling or staying asleep',
    ],
    domains: [
      { name: 'Intrusion (B)', indices: [0, 1, 2, 3, 4], color: '#d47b6f', description: 'Re-experiencing symptoms' },
      { name: 'Avoidance (C)', indices: [5, 6], color: '#d4a45b', description: 'Avoidance of reminders' },
      { name: 'Neg. Cognition (D)', indices: [7, 8, 9, 10, 11, 12, 13], color: '#7b6fd4', description: 'Negative thoughts & mood' },
      { name: 'Hyperarousal (E)', indices: [14, 15, 16, 17, 18, 19], color: '#5b89d4', description: 'Altered reactivity' },
    ],
    severity: (total) => {
      if (total <= 20) return { label: 'Sub-threshold', color: '#4caf50', bg: 'rgba(76,175,80,0.12)' }
      if (total <= 37) return { label: 'Moderate', color: '#ff9800', bg: 'rgba(255,152,0,0.12)' }
      if (total <= 49) return { label: 'Moderately Severe', color: '#f44336', bg: 'rgba(244,67,54,0.12)' }
      return { label: 'Severe', color: '#b71c1c', bg: 'rgba(183,28,28,0.12)' }
    },
    maxScore: 80,
    provisionalCutoff: 33,
    note: 'A provisional PTSD diagnosis is suggested when the total score is ≥ 33 AND at least one item in each criterion cluster scores ≥ 2.',
  },

  burnout: {
    title: 'Burnout Check',
    instruction: 'How often do you experience the following at work?',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    scores: [0, 1, 2, 3, 4],
    questions: [
      'I feel emotionally drained by my work',
      'I feel used up at the end of the workday',
      'I feel tired when I get up in the morning and have to face another day',
      'Working with people all day is really a strain',
      'I feel burned out from my work',
      'I feel frustrated by my job',
      'I feel I am working too hard on my job',
      'Working directly with people puts too much stress on me',
      'I feel like I am at the end of my rope',
      'I have accomplished many worthwhile things in this job',
      'I deal effectively with the problems of the people I work with',
      'I feel enthusiastic about my job',
    ],
    domains: [
      { name: 'Emotional Exhaustion', indices: [0, 1, 2, 4, 8], color: '#d47b6f' },
      { name: 'Work Pressure', indices: [3, 6, 7], color: '#d4a45b' },
      { name: 'Job Frustration', indices: [5], color: '#7b6fd4' },
      { name: 'Efficacy (Protective)', indices: [9, 10, 11], color: '#5b9d7b', reverse: true },
    ],
    severity: (total) => {
      if (total <= 12) return { label: 'Low', color: '#4caf50', bg: 'rgba(76,175,80,0.12)' }
      if (total <= 24) return { label: 'Mild', color: '#8bc34a', bg: 'rgba(139,195,74,0.12)' }
      if (total <= 36) return { label: 'Moderate', color: '#ff9800', bg: 'rgba(255,152,0,0.12)' }
      return { label: 'High', color: '#b71c1c', bg: 'rgba(183,28,28,0.12)' }
    },
    maxScore: 48,
  },
}

// ─── DomainBar component ──────────────────────────────────────────────────────

function DomainBar({ domain, score, maxPossible, animate }) {
  const pct = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0
  return (
    <div style={{ marginBottom: '0.9rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
          {domain.name}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)' }}>
          {score} / {maxPossible} &nbsp;·&nbsp; {pct}%
        </span>
      </div>
      {domain.description && (
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem' }}>
          {domain.description}
        </div>
      )}
      <div style={{
        height: 10,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: animate ? `${pct}%` : '0%',
          background: domain.color,
          borderRadius: 6,
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: `0 0 8px ${domain.color}55`,
        }} />
      </div>
    </div>
  )
}

// ─── Radar / Spider chart for domains ────────────────────────────────────────

function DomainRadar({ domains, scores, maxScores }) {
  const cx = 130, cy = 130, r = 90
  const n = domains.length
  const points = domains.map((_, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  })

  const pcts = domains.map((d, i) => maxScores[i] > 0 ? scores[i] / maxScores[i] : 0)

  const dataPoints = pcts.map((p, i) => ({
    x: cx + r * p * Math.cos((2 * Math.PI * i) / n - Math.PI / 2),
    y: cy + r * p * Math.sin((2 * Math.PI * i) / n - Math.PI / 2),
  }))

  const polyStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ')
  const gridStr = (scale) => points.map(p => `${cx + (p.x - cx) * scale},${cy + (p.y - cy) * scale}`).join(' ')

  return (
    <svg width="260" height="260" viewBox="0 0 260 260" style={{ overflow: 'visible' }}>
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map(s => (
        <polygon key={s} points={gridStr(s)} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}
      {/* Axis lines */}
      {points.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      ))}
      {/* Data polygon */}
      <polygon points={polyStr} fill="rgba(100,160,220,0.2)" stroke="#5b89d4" strokeWidth="1.5" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={domains[i].color} stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
      ))}
      {/* Labels */}
      {points.map((p, i) => {
        const dx = p.x - cx, dy = p.y - cy
        const lx = cx + (r + 22) * Math.cos((2 * Math.PI * i) / n - Math.PI / 2)
        const ly = cy + (r + 22) * Math.sin((2 * Math.PI * i) / n - Math.PI / 2)
        return (
          <text
            key={i}
            x={lx} y={ly}
            textAnchor={Math.abs(dx) < 5 ? 'middle' : dx > 0 ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize="9"
            fill="rgba(255,255,255,0.7)"
          >
            {domains[i].name.split(' (')[0]}
          </text>
        )
      })}
    </svg>
  )
}

// ─── ResultView ───────────────────────────────────────────────────────────────

function ResultView({ assessmentId, answers, onRetake, onBook }) {
  const config = ASSESSMENT_QUESTIONS[assessmentId]
  const [animateBars, setAnimateBars] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setAnimateBars(true), 100)
    return () => clearTimeout(t)
  }, [])

  const total = answers.reduce((s, a) => s + a, 0)
  const severity = config.severity(total)

  const domainData = config.domains.map(domain => {
    const domainMax = domain.indices.length * (config.scores[config.scores.length - 1])
    const domainScore = domain.indices.reduce((s, idx) => s + (answers[idx] || 0), 0)
    return { domain, score: domainScore, maxPossible: domainMax }
  })

  const radarScores = domainData.map(d => d.score)
  const radarMaxes = domainData.map(d => d.maxPossible)

  // PCL-5 provisional check
  let provisionalPTSD = false
  if (assessmentId === 'pcl5') {
    const meetsThreshold = total >= config.provisionalCutoff
    const criteriaCheck = config.domains.every(domain =>
      domain.indices.some(idx => (answers[idx] || 0) >= 2)
    )
    provisionalPTSD = meetsThreshold && criteriaCheck
  }

  const pctOfMax = Math.round((total / config.maxScore) * 100)

  return (
    <div style={{
      background: 'rgba(0,0,0,0.25)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16,
      padding: '2rem',
      maxWidth: 720,
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'white',
          marginBottom: '0.3rem',
        }}>
          {config.title} — Results
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)' }}>
          Based on your responses to {config.questions.length} questions
        </p>
      </div>

      {/* Total score */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        background: severity.bg,
        border: `1px solid ${severity.color}44`,
        borderRadius: 12,
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
      }}>
        <div style={{ textAlign: 'center', minWidth: 70 }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 700, color: severity.color, lineHeight: 1 }}>
            {total}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
            / {config.maxScore}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: severity.color, marginBottom: '0.25rem' }}>
            {severity.label}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            Your score of {total} ({pctOfMax}% of maximum) falls in the{' '}
            <strong style={{ color: severity.color }}>{severity.label.toLowerCase()}</strong> range
            for this screening tool.
          </div>
        </div>
      </div>

      {/* PCL-5 specific provisional indicator */}
      {assessmentId === 'pcl5' && (
        <div style={{
          background: provisionalPTSD ? 'rgba(244,67,54,0.1)' : 'rgba(76,175,80,0.1)',
          border: `1px solid ${provisionalPTSD ? '#f4433644' : '#4caf5044'}`,
          borderRadius: 10,
          padding: '1rem 1.25rem',
          marginBottom: '1.75rem',
          fontSize: '0.82rem',
          color: 'rgba(255,255,255,0.75)',
          lineHeight: 1.6,
        }}>
          <strong style={{ color: provisionalPTSD ? '#ef9a9a' : '#a5d6a7' }}>
            {provisionalPTSD ? '⚠ Provisional PTSD criteria met' : '✓ Provisional PTSD criteria not met'}
          </strong>
          <br />
          {config.note}
        </div>
      )}

      {/* Domain breakdown */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '1.1rem',
        }}>
          Domain Breakdown
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: config.domains.length >= 3 ? '1fr auto' : '1fr',
          gap: '1.5rem',
          alignItems: 'start',
        }}>
          <div>
            {domainData.map(({ domain, score, maxPossible }, i) => (
              <DomainBar
                key={i}
                domain={domain}
                score={score}
                maxPossible={maxPossible}
                animate={animateBars}
              />
            ))}
          </div>
          {config.domains.length >= 3 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DomainRadar
                domains={config.domains}
                scores={radarScores}
                maxScores={radarMaxes}
              />
            </div>
          )}
        </div>
      </div>

      {/* Warning banner */}
      <div style={{
        background: 'rgba(255,200,60,0.08)',
        border: '1px solid rgba(255,200,60,0.2)',
        borderRadius: 10,
        padding: '0.9rem 1.1rem',
        marginBottom: '1.5rem',
        fontSize: '0.78rem',
        color: 'rgba(255,255,255,0.65)',
        lineHeight: 1.65,
      }}>
        <span style={{ color: 'rgba(255,210,80,0.95)', fontWeight: 700 }}>⚠ Important: </span>
        These results are a <em>screening aid only</em> and may not be accurate. Screening tools cannot
        diagnose any condition — symptom overlap between disorders (comorbidity) means scores can be
        misleading. Please consult a qualified clinician for a proper evaluation. If you are in distress,
        seek help immediately.
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          onClick={onBook}
          style={{
            background: 'white',
            color: 'var(--green-deep)',
            border: 'none',
            borderRadius: 8,
            padding: '0.7rem 1.5rem',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Book a Professional Assessment →
        </button>
        <button
          onClick={onRetake}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '0.7rem 1.5rem',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        >
          Retake Assessment
        </button>
      </div>
    </div>
  )
}

// ─── QuestionnaireView ────────────────────────────────────────────────────────

function QuestionnaireView({ assessmentId, title, onComplete, onBack }) {
  const config = ASSESSMENT_QUESTIONS[assessmentId]
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)

  if (!config) return (
    <div style={{ color: 'rgba(255,255,255,0.7)', padding: '2rem', textAlign: 'center' }}>
      Assessment not found.
      <button onClick={onBack} style={{ display: 'block', margin: '1rem auto', color: 'white', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        ← Go back
      </button>
    </div>
  )

  const questions = config.questions
  const totalQ = questions.length
  const progress = Math.round((Object.keys(answers).length / totalQ) * 100)

  const handleAnswer = (qIdx, scoreValue) => {
    const newAnswers = { ...answers, [qIdx]: scoreValue }
    setAnswers(newAnswers)
    if (qIdx < totalQ - 1) {
      setTimeout(() => setCurrent(qIdx + 1), 220)
    }
  }

  const handleSubmit = () => {
    const finalAnswers = questions.map((_, i) => answers[i] || 0)
    onComplete(finalAnswers)
  }

  const allAnswered = Object.keys(answers).length === totalQ

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 1rem' }}>
      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '1.2rem', padding: 0 }}
        >
          ←
        </button>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'white', margin: 0 }}>
          {config.title}
        </h3>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
            {Object.keys(answers).length} of {totalQ} answered
          </span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>{progress}%</span>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'var(--green-pale)',
            borderRadius: 3,
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      {/* Instruction */}
      <p style={{
        fontSize: '0.85rem',
        color: 'rgba(255,255,255,0.55)',
        marginBottom: '1.5rem',
        lineHeight: 1.6,
        fontStyle: 'italic',
      }}>
        {config.instruction}
      </p>

      {/* Questions */}
      {questions.map((q, qIdx) => (
        <div
          key={qIdx}
          style={{
            background: current === qIdx ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.92))',
            border: `1px solid ${current === qIdx ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 255, 255, 0.92)'}`,
            borderRadius: 12,
            padding: '1.1rem 1.25rem',
            marginBottom: '0.75rem',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onClick={() => setCurrent(qIdx)}
        >
          <p style={{
            fontSize: '0.88rem',
            color: answers[qIdx] !== undefined ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
            marginBottom: '0.85rem',
            lineHeight: 1.55,
            fontWeight: answers[qIdx] !== undefined ? 500 : 400,
          }}>
            <span style={{ color: 'rgba(210, 236, 252, 0.3)', marginRight: '0.5rem', fontSize: '0.75rem' }}>
              {qIdx + 1}.
            </span>
            {q}
          </p>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {config.options.map((opt, oIdx) => {
              const val = config.scores[oIdx]
              const selected = answers[qIdx] === val
              return (
                <button
                  key={oIdx}
                  onClick={(e) => { e.stopPropagation(); handleAnswer(qIdx, val) }}
                  style={{
                    background: selected ? 'var(--green-pale)' : 'rgba(219, 231, 242, 0.07)',
                    color: selected ? 'var(--green-deep)' : 'rgba(255,255,255,0.75)',
                    border: `1px solid ${selected ? 'var(--green-pale)' : 'rgba(220, 242, 247, 0.12)'}`,
                    borderRadius: 100,
                    padding: '0.3rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: selected ? 700 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'rgba(255,255,255,0.12)' }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'rgba(219, 231, 242, 0.07)' }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Submit */}
      {allAnswered && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem', marginBottom: '1rem' }}>
          <button
            onClick={handleSubmit}
            style={{
              background: 'white',
              color: 'var(--green-deep)',
              border: 'none',
              borderRadius: 8,
              padding: '0.85rem 2.5rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
          >
            View My Results →
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 480px) {
          .q-options { flex-direction: column !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Main Assessment component ────────────────────────────────────────────────

export default function Assessment() {
  const { navigate } = useRouter()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeAssessment, setActiveAssessment] = useState(null) // { id, title }
  const [results, setResults] = useState(null)                   // { assessmentId, answers }

  useEffect(() => {
    wellness.assessments()
      .then(d => setAssessments(d.assessments || []))
      .catch(() => setAssessments([
        { id: 'phq9',    title: 'PHQ-9 Depression Screening', description: 'Validated depression screening tool.',         is_free: true },
        { id: 'gad7',    title: 'GAD-7 Anxiety Scale',        description: 'Generalised anxiety disorder assessment.',    is_free: true },
        { id: 'pcl5',    title: 'PCL-5 PTSD Checklist',       description: 'PTSD symptom scale with domain analysis.',    is_free: true },
        { id: 'burnout', title: 'Burnout Check',               description: 'Work-related stress & burnout analysis.',    is_free: true },
      ]))
      .finally(() => setLoading(false))
  }, [])

  // ── State: taking a questionnaire ──
  if (activeAssessment && !results) {
    return (
      <section style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--green-deep)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)',
        }} />
        <div style={{ flex: 1, padding: '5rem 2rem 3rem', position: 'relative', zIndex: 1 }}>
          <QuestionnaireView
            assessmentId={activeAssessment.id}
            title={activeAssessment.title}
            onComplete={(answers) => {
              setResults({ assessmentId: activeAssessment.id, answers })
            }}
            onBack={() => setActiveAssessment(null)}
          />
        </div>
      </section>
    )
  }

  // ── State: viewing results ──
  if (results) {
    return (
      <section style={{
        minHeight: '100vh',
        width: '100%',
        background: 'var(--green-deep)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.04) 0%, transparent 60%)',
        }} />
        <div style={{ flex: 1, padding: '5rem 2rem 3rem', position: 'relative', zIndex: 1 }}>
          <ResultView
            assessmentId={results.assessmentId}
            answers={results.answers}
            onRetake={() => setResults(null)}
            onBook={() => navigate('/book')}
          />
        </div>
      </section>
    )
  }

  // ── State: landing / card grid ──
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
      {/* subtle background texture */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.04) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%)',
      }} />

      {/* main content */}
      <div
        style={{
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
        {/* left column */}
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
              'Results with domain-level statistical breakdown',
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

        {/* right column: cards */}
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
                  onClick={() => setActiveAssessment({ id: a.id, title: a.title })}
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
                    {a.is_free ? 'FREE · 5–10 MIN' : 'Premium'}
                  </span>
                </div>
              ))
          }
        </div>
      </div>

      {/* disclaimer banner */}
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
          <span style={{ color: 'rgba(255,200,100,0.9)', fontWeight: 700, marginRight: '0.4em' }}>⚠ Important Notice:</span>
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

      {/* responsive styles */}
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