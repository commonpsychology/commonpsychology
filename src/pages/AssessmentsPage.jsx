// src/components/Assessment.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { wellness } from '../services/api'

// ─── Design tokens ────────────────────────────────────────────────────────────
// Primary bg gradient: sky-blue → white (used on every section)
// --sky-deep:    #0d2d4f   (dark navy, headings / button bg)
// --sky-mid:     #2b8fd0   (vivid sky blue, accents / CTAs)
// --sky-pale:    #bfe0f7   (light sky, gradient midpoint)
// --sky-faint:   #e8f4fd   (near-white sky, gradient start)
// --sky-border:  #c8e4f5   (card borders, dividers)
// --sky-text:    #3a5a7a   (body text on light bg)
// --sky-muted:   #6a8fa8   (muted / secondary text)

const S = {
  pageBg:       'linear-gradient(160deg, #e8f4fd 0%, #bfe0f7 40%, #ffffff 100%)',
  cardBg:       '#ffffff',
  cardBorder:   '1px solid #c8e4f5',
  cardRadius:   14,
  accent:       '#2b8fd0',
  accentDark:   '#0d2d4f',
  accentLight:  '#e8f4fd',
  accentBorder: '#bfe0f7',
  textPrimary:  '#0d2d4f',
  textBody:     '#3a5a7a',
  textMuted:    '#6a8fa8',
  tagBg:        '#e8f4fd',
  tagColor:     '#2b8fd0',
  pillBg:       '#2b8fd0',
  pillText:     '#ffffff',
  barTrack:     '#daeef8',
  sectionMin:   '100vh',
}

// ─── Assessment question banks ────────────────────────────────────────────────

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
      { name: 'Mood', indices: [0, 1], color: '#2b8fd0' },
      { name: 'Sleep & Energy', indices: [2, 3], color: '#5b6ad4' },
      { name: 'Appetite & Self-image', indices: [4, 5], color: '#d47b6f' },
      { name: 'Concentration & Activity', indices: [6, 7], color: '#3bb5c8' },
      { name: 'Suicidal Ideation', indices: [8], color: '#d46f6f' },
    ],
    severity: (total) => {
      if (total <= 4)  return { label: 'Minimal',            color: '#2e9e5b', bg: 'rgba(46,158,91,0.08)',   border: 'rgba(46,158,91,0.25)' }
      if (total <= 9)  return { label: 'Mild',               color: '#5a9e2e', bg: 'rgba(90,158,46,0.08)',   border: 'rgba(90,158,46,0.25)' }
      if (total <= 14) return { label: 'Moderate',           color: '#c47c10', bg: 'rgba(196,124,16,0.08)',  border: 'rgba(196,124,16,0.25)' }
      if (total <= 19) return { label: 'Moderately Severe',  color: '#c94040', bg: 'rgba(201,64,64,0.08)',   border: 'rgba(201,64,64,0.25)' }
      return              { label: 'Severe',                 color: '#9b1c1c', bg: 'rgba(155,28,28,0.08)',   border: 'rgba(155,28,28,0.25)' }
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
      { name: 'Core Anxiety', indices: [0, 1, 2], color: '#2b8fd0' },
      { name: 'Physical Tension', indices: [3, 4], color: '#c4a020' },
      { name: 'Irritability & Fear', indices: [5, 6], color: '#d47b6f' },
    ],
    severity: (total) => {
      if (total <= 4)  return { label: 'Minimal',  color: '#2e9e5b', bg: 'rgba(46,158,91,0.08)',  border: 'rgba(46,158,91,0.25)' }
      if (total <= 9)  return { label: 'Mild',     color: '#5a9e2e', bg: 'rgba(90,158,46,0.08)',  border: 'rgba(90,158,46,0.25)' }
      if (total <= 14) return { label: 'Moderate', color: '#c47c10', bg: 'rgba(196,124,16,0.08)', border: 'rgba(196,124,16,0.25)' }
      return              { label: 'Severe',       color: '#9b1c1c', bg: 'rgba(155,28,28,0.08)',  border: 'rgba(155,28,28,0.25)' }
    },
    maxScore: 21,
  },

  pcl5: {
    title: 'PCL-5 PTSD Checklist',
    instruction: 'In the past month, how much were you bothered by the following problems? These may relate to a stressful experience.',
    options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely'],
    scores: [0, 1, 2, 3, 4],
    questions: [
      'Repeated, disturbing, and unwanted memories of the stressful experience',
      'Repeated, disturbing dreams of the stressful experience',
      'Suddenly feeling or acting as if the stressful experience were actually happening again',
      'Feeling very upset when something reminded you of the stressful experience',
      'Having strong physical reactions when something reminded you of the stressful experience',
      'Avoiding internal reminders of the stressful experience (thoughts, feelings or physical sensations)',
      'Avoiding external reminders of the stressful experience (people, places, conversations, activities, objects or situations)',
      'Trouble remembering important parts of the stressful experience',
      'Having strong negative beliefs about yourself, other people, or the world',
      'Blaming yourself or someone else for the stressful experience or what happened after it',
      'Having strong negative feelings such as fear, horror, anger, guilt, or shame',
      'Loss of interest in activities that you used to enjoy',
      'Feeling distant or cut off from other people',
      'Trouble experiencing positive feelings',
      'Irritable behaviour, angry outbursts, or acting aggressively',
      'Taking too many risks or doing things that could cause you harm',
      'Being "super-alert" or watchful or on guard',
      'Feeling jumpy or easily startled',
      'Having difficulty concentrating',
      'Trouble falling or staying asleep',
    ],
    domains: [
      { name: 'Intrusion (B)',      indices: [0,1,2,3,4],          color: '#d47b6f', description: 'Re-experiencing symptoms' },
      { name: 'Avoidance (C)',      indices: [5,6],                 color: '#c4a020', description: 'Avoidance of reminders' },
      { name: 'Neg. Cognition (D)', indices: [7,8,9,10,11,12,13],  color: '#7b6fd4', description: 'Negative thoughts & mood' },
      { name: 'Hyperarousal (E)',   indices: [14,15,16,17,18,19],  color: '#2b8fd0', description: 'Altered reactivity' },
    ],
    severity: (total) => {
      if (total <= 20) return { label: 'Sub-threshold',      color: '#2e9e5b', bg: 'rgba(46,158,91,0.08)',  border: 'rgba(46,158,91,0.25)' }
      if (total <= 37) return { label: 'Moderate',           color: '#c47c10', bg: 'rgba(196,124,16,0.08)', border: 'rgba(196,124,16,0.25)' }
      if (total <= 49) return { label: 'Moderately Severe',  color: '#c94040', bg: 'rgba(201,64,64,0.08)',  border: 'rgba(201,64,64,0.25)' }
      return              { label: 'Severe',                 color: '#9b1c1c', bg: 'rgba(155,28,28,0.08)',  border: 'rgba(155,28,28,0.25)' }
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
      { name: 'Emotional Exhaustion', indices: [0,1,2,4,8],  color: '#d47b6f' },
      { name: 'Work Pressure',        indices: [3,6,7],       color: '#c4a020' },
      { name: 'Job Frustration',      indices: [5],           color: '#7b6fd4' },
      { name: 'Efficacy (Protective)',indices: [9,10,11],     color: '#2b8fd0', reverse: true },
    ],
    severity: (total) => {
      if (total <= 12) return { label: 'Low',      color: '#2e9e5b', bg: 'rgba(46,158,91,0.08)',  border: 'rgba(46,158,91,0.25)' }
      if (total <= 24) return { label: 'Mild',     color: '#5a9e2e', bg: 'rgba(90,158,46,0.08)',  border: 'rgba(90,158,46,0.25)' }
      if (total <= 36) return { label: 'Moderate', color: '#c47c10', bg: 'rgba(196,124,16,0.08)', border: 'rgba(196,124,16,0.25)' }
      return              { label: 'High',         color: '#9b1c1c', bg: 'rgba(155,28,28,0.08)',  border: 'rgba(155,28,28,0.25)' }
    },
    maxScore: 48,
  },
}

// ─── DomainBar ────────────────────────────────────────────────────────────────

function DomainBar({ domain, score, maxPossible, animate }) {
  const pct = maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: S.textPrimary }}>
          {domain.name}
        </span>
        <span style={{ fontSize: '0.75rem', color: S.textMuted }}>
          {score} / {maxPossible} · {pct}%
        </span>
      </div>
      {domain.description && (
        <div style={{ fontSize: '0.72rem', color: S.textMuted, marginBottom: '0.28rem' }}>
          {domain.description}
        </div>
      )}
      <div style={{ height: 9, background: S.barTrack, borderRadius: 6, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: animate ? `${pct}%` : '0%',
          background: domain.color,
          borderRadius: 6,
          transition: 'width 0.9s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  )
}

// ─── Radar chart ─────────────────────────────────────────────────────────────

function DomainRadar({ domains, scores, maxScores }) {
  const cx = 130, cy = 130, r = 88
  const n = domains.length
  const angle = (i) => (2 * Math.PI * i) / n - Math.PI / 2
  const pts = domains.map((_, i) => ({ x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) }))
  const pcts = domains.map((d, i) => maxScores[i] > 0 ? scores[i] / maxScores[i] : 0)
  const dataPts = pcts.map((p, i) => ({
    x: cx + r * p * Math.cos(angle(i)),
    y: cy + r * p * Math.sin(angle(i)),
  }))
  const polyStr = dataPts.map(p => `${p.x},${p.y}`).join(' ')
  const gridStr = (s) => pts.map(p => `${cx + (p.x - cx) * s},${cy + (p.y - cy) * s}`).join(' ')

  return (
    <svg width="260" height="260" viewBox="0 0 260 260" style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1].map(s => (
        <polygon key={s} points={gridStr(s)} fill="none" stroke="#c8e4f5" strokeWidth="1" />
      ))}
      {pts.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#d4ecf7" strokeWidth="1" />
      ))}
      <polygon points={polyStr} fill="rgba(43,143,208,0.12)" stroke="#2b8fd0" strokeWidth="1.5" />
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={domains[i].color} stroke="white" strokeWidth="1.5" />
      ))}
      {pts.map((p, i) => {
        const dx = p.x - cx
        const lx = cx + (r + 22) * Math.cos(angle(i))
        const ly = cy + (r + 22) * Math.sin(angle(i))
        return (
          <text key={i} x={lx} y={ly}
            textAnchor={Math.abs(dx) < 5 ? 'middle' : dx > 0 ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize="9"
            fill={S.textMuted}
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
    const t = setTimeout(() => setAnimateBars(true), 120)
    return () => clearTimeout(t)
  }, [])

  const total = answers.reduce((s, a) => s + a, 0)
  const severity = config.severity(total)
  const pctOfMax = Math.round((total / config.maxScore) * 100)

  const domainData = config.domains.map(domain => {
    const domainMax = domain.indices.length * config.scores[config.scores.length - 1]
    const domainScore = domain.indices.reduce((s, idx) => s + (answers[idx] || 0), 0)
    return { domain, score: domainScore, maxPossible: domainMax }
  })

  let provisionalPTSD = false
  if (assessmentId === 'pcl5') {
    const meetsThreshold = total >= config.provisionalCutoff
    const criteriaCheck = config.domains.every(d => d.indices.some(idx => (answers[idx] || 0) >= 2))
    provisionalPTSD = meetsThreshold && criteriaCheck
  }

  return (
    <section style={{
      minHeight: S.sectionMin,
      width: '100%',
      background: S.pageBg,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* decorative circles */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 380, height: 380, borderRadius: '50%', background: 'rgba(43,143,208,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(43,143,208,0.05)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, padding: '5.5rem 2rem 4rem', position: 'relative', zIndex: 1, maxWidth: 760, margin: '0 auto', width: '100%' }}>

        {/* header */}
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ display: 'inline-block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: S.accent, background: S.tagBg, padding: '0.2rem 0.75rem', borderRadius: 100, marginBottom: '0.9rem', border: `1px solid ${S.accentBorder}` }}>
            Results
          </span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: S.textPrimary, marginBottom: '0.3rem' }}>
            {config.title}
          </h2>
          <p style={{ fontSize: '0.83rem', color: S.textMuted }}>
            Based on your responses to {config.questions.length} questions
          </p>
        </div>

        {/* score banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          background: severity.bg,
          border: `1px solid ${severity.border}`,
          borderRadius: 14,
          padding: '1.4rem 1.75rem',
          marginBottom: '1.75rem',
          boxShadow: '0 2px 16px rgba(43,143,208,0.07)',
        }}>
          <div style={{ textAlign: 'center', minWidth: 72 }}>
            <div style={{ fontSize: '2.6rem', fontWeight: 700, color: severity.color, lineHeight: 1 }}>{total}</div>
            <div style={{ fontSize: '0.7rem', color: S.textMuted, marginTop: 2 }}>/ {config.maxScore}</div>
          </div>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: severity.color, marginBottom: '0.25rem' }}>{severity.label}</div>
            <div style={{ fontSize: '0.83rem', color: S.textBody, lineHeight: 1.6 }}>
              Your score of {total} ({pctOfMax}% of maximum) falls in the{' '}
              <strong style={{ color: severity.color }}>{severity.label.toLowerCase()}</strong> range for this screening tool.
            </div>
          </div>
        </div>

        {/* PCL-5 provisional */}
        {assessmentId === 'pcl5' && (
          <div style={{
            background: provisionalPTSD ? 'rgba(201,64,64,0.07)' : 'rgba(46,158,91,0.07)',
            border: `1px solid ${provisionalPTSD ? 'rgba(201,64,64,0.25)' : 'rgba(46,158,91,0.25)'}`,
            borderRadius: 12,
            padding: '1rem 1.25rem',
            marginBottom: '1.75rem',
            fontSize: '0.82rem',
            color: S.textBody,
            lineHeight: 1.65,
          }}>
            <strong style={{ color: provisionalPTSD ? '#c94040' : '#2e9e5b' }}>
              {provisionalPTSD ? '⚠ Provisional PTSD criteria met' : '✓ Provisional PTSD criteria not met'}
            </strong>
            <br />
            {config.note}
          </div>
        )}

        {/* domain breakdown */}
        <div style={{
          background: S.cardBg,
          border: S.cardBorder,
          borderRadius: S.cardRadius,
          padding: '1.5rem 1.75rem',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 16px rgba(43,143,208,0.07)',
        }}>
          <h4 style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase', color: S.textMuted, marginBottom: '1.25rem' }}>
            Domain Breakdown
          </h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: config.domains.length >= 3 ? '1fr auto' : '1fr',
            gap: '1.5rem',
            alignItems: 'center',
          }}>
            <div>
              {domainData.map(({ domain, score, maxPossible }, i) => (
                <DomainBar key={i} domain={domain} score={score} maxPossible={maxPossible} animate={animateBars} />
              ))}
            </div>
            {config.domains.length >= 3 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DomainRadar
                  domains={config.domains}
                  scores={domainData.map(d => d.score)}
                  maxScores={domainData.map(d => d.maxPossible)}
                />
              </div>
            )}
          </div>
        </div>

        {/* disclaimer */}
        <div style={{
          background: 'rgba(255,200,60,0.07)',
          border: '1px solid rgba(196,160,32,0.25)',
          borderRadius: 12,
          padding: '0.9rem 1.1rem',
          marginBottom: '1.75rem',
          fontSize: '0.78rem',
          color: S.textBody,
          lineHeight: 1.7,
        }}>
          <span style={{ color: '#b07c00', fontWeight: 700 }}>⚠ Important: </span>
          These results are a <em>screening aid only</em> and may not be accurate. Screening tools cannot
          diagnose any condition — symptom overlap between disorders (comorbidity) means scores can be
          misleading. Please consult a qualified clinician for a proper evaluation. If you are in distress,
          seek help immediately.
        </div>

        {/* actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={onBook}
            style={{
              background: S.accent,
              color: 'white',
              border: 'none',
              borderRadius: 10,
              padding: '0.75rem 1.75rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(43,143,208,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(43,143,208,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(43,143,208,0.3)' }}
          >
            Book a Professional Assessment →
          </button>
          <button
            onClick={onRetake}
            style={{
              background: 'white',
              color: S.accent,
              border: `1px solid ${S.accentBorder}`,
              borderRadius: 10,
              padding: '0.75rem 1.75rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = S.tagBg}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            Retake Assessment
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── QuestionnaireView ────────────────────────────────────────────────────────

function QuestionnaireView({ assessmentId, onComplete, onBack }) {
  const config = ASSESSMENT_QUESTIONS[assessmentId]
  const [answers, setAnswers] = useState({})
  const [current, setCurrent] = useState(0)

  if (!config) return (
    <div style={{ color: S.textMuted, padding: '2rem', textAlign: 'center' }}>
      Assessment not found.
      <button onClick={onBack} style={{ display: 'block', margin: '1rem auto', color: S.accent, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
        ← Go back
      </button>
    </div>
  )

  const questions = config.questions
  const totalQ = questions.length
  const answeredCount = Object.keys(answers).length
  const progress = Math.round((answeredCount / totalQ) * 100)

  const handleAnswer = (qIdx, val) => {
    const next = { ...answers, [qIdx]: val }
    setAnswers(next)
    if (qIdx < totalQ - 1) setTimeout(() => setCurrent(qIdx + 1), 200)
  }

  const handleSubmit = () => {
    const finalAnswers = questions.map((_, i) => answers[i] || 0)
    onComplete(finalAnswers)
  }

  const allAnswered = answeredCount === totalQ

  return (
    <section style={{
      minHeight: S.sectionMin,
      width: '100%',
      background: S.pageBg,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* decorative blobs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(43,143,208,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -50, width: 240, height: 240, borderRadius: '50%', background: 'rgba(43,143,208,0.05)', pointerEvents: 'none' }} />

      <div style={{ flex: 1, padding: '5.5rem 2rem 4rem', position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', width: '100%' }}>

        {/* back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
          <button
            onClick={onBack}
            style={{ background: 'white', border: S.cardBorder, color: S.accent, cursor: 'pointer', fontSize: '1rem', padding: '0.35rem 0.75rem', borderRadius: 8, fontWeight: 600, transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = S.tagBg}
            onMouseLeave={e => e.currentTarget.style.background = 'white'}
          >
            ←
          </button>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: S.textPrimary, margin: 0 }}>
              {config.title}
            </h3>
          </div>
        </div>

        {/* progress */}
        <div style={{
          background: 'white',
          border: S.cardBorder,
          borderRadius: 12,
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 8px rgba(43,143,208,0.07)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.78rem', color: S.textMuted, fontWeight: 500 }}>
              {answeredCount} of {totalQ} answered
            </span>
            <span style={{ fontSize: '0.78rem', color: S.accent, fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ height: 7, background: S.barTrack, borderRadius: 4 }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: `linear-gradient(90deg, #56b8f0, ${S.accent})`,
              borderRadius: 4,
              transition: 'width 0.35s ease',
            }} />
          </div>
        </div>

        {/* instruction */}
        <p style={{
          fontSize: '0.85rem',
          color: S.textMuted,
          marginBottom: '1.5rem',
          lineHeight: 1.65,
          fontStyle: 'italic',
          background: S.tagBg,
          border: `1px solid ${S.accentBorder}`,
          borderRadius: 10,
          padding: '0.75rem 1rem',
        }}>
          {config.instruction}
        </p>

        {/* questions */}
        {questions.map((q, qIdx) => {
          const isActive = current === qIdx
          const isAnswered = answers[qIdx] !== undefined
          return (
            <div
              key={qIdx}
              onClick={() => setCurrent(qIdx)}
              style={{
                background: isActive ? 'white' : (isAnswered ? '#f6fbff' : 'white'),
                border: isActive
                  ? `1.5px solid ${S.accent}`
                  : isAnswered
                    ? `1px solid ${S.accentBorder}`
                    : S.cardBorder,
                borderRadius: 12,
                padding: '1.1rem 1.25rem',
                marginBottom: '0.65rem',
                cursor: 'pointer',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: isActive ? '0 4px 18px rgba(43,143,208,0.12)' : '0 1px 4px rgba(43,143,208,0.05)',
              }}
            >
              <p style={{
                fontSize: '0.88rem',
                color: isAnswered ? S.textPrimary : S.textBody,
                marginBottom: '0.85rem',
                lineHeight: 1.55,
                fontWeight: isAnswered ? 500 : 400,
              }}>
                <span style={{ color: S.accent, marginRight: '0.45rem', fontSize: '0.75rem', fontWeight: 700 }}>
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
                        background: selected ? S.accent : 'white',
                        color: selected ? 'white' : S.textBody,
                        border: selected ? `1px solid ${S.accent}` : S.cardBorder,
                        borderRadius: 100,
                        padding: '0.3rem 0.8rem',
                        fontSize: '0.75rem',
                        fontWeight: selected ? 700 : 400,
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
                        boxShadow: selected ? '0 2px 8px rgba(43,143,208,0.25)' : 'none',
                      }}
                      onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = S.tagBg; e.currentTarget.style.borderColor = S.accent } }}
                      onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#c8e4f5' } }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* submit */}
        {allAnswered && (
          <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '1rem' }}>
            <button
              onClick={handleSubmit}
              style={{
                background: S.accent,
                color: 'white',
                border: 'none',
                borderRadius: 12,
                padding: '0.9rem 2.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(43,143,208,0.3)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(43,143,208,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(43,143,208,0.3)' }}
            >
              View My Results →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 480px) {
          .q-options { flex-direction: column !important; }
        }
      `}</style>
    </section>
  )
}

// ─── Landing / card grid ──────────────────────────────────────────────────────

function LandingView({ assessments, loading, onStart, onBook }) {
  return (
    <section
      id="assessments"
      style={{
        minHeight: S.sectionMin,
        width: '100%',
        background: S.pageBg,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* decorative circles */}
      <div style={{ position: 'absolute', top: -120, right: -120, width: 480, height: 480, borderRadius: '50%', background: 'rgba(43,143,208,0.07)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(43,143,208,0.05)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(43,143,208,0.04)', pointerEvents: 'none' }} />

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
          padding: '6.5rem 2rem 3rem',
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
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: S.accent,
            background: S.tagBg,
            border: `1px solid ${S.accentBorder}`,
            padding: '0.25rem 0.85rem',
            borderRadius: 100,
            marginBottom: '1.25rem',
          }}>
            Self Assessment
          </span>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: S.textPrimary,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
          }}>
            Understand Where<br />
            You Are{' '}
            <span style={{ color: S.accent }}>Right Now</span>
          </h2>

          <p style={{
            fontSize: '1rem',
            color: S.textBody,
            lineHeight: 1.75,
            marginBottom: '2rem',
            maxWidth: 440,
          }}>
            Our clinically validated tools give you honest insight into your mental
            health — completely free, private, and confidential.
          </p>

          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2.5rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {[
              'Clinically validated international standards',
              'Results with domain-level statistical breakdown',
              'Completely anonymous — no account needed',
              'Share securely with your therapist',
            ].map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: S.textBody, fontSize: '0.9rem' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: S.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: '0.65rem', color: 'white', fontWeight: 700,
                }}>✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            style={{
              background: S.accent,
              color: 'white',
              fontWeight: 700,
              border: 'none',
              borderRadius: 10,
              padding: '0.9rem 2.1rem',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(43,143,208,0.3)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(43,143,208,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(43,143,208,0.3)' }}
            onClick={() => document.getElementById('assessment-cards')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start a Free Assessment →
          </button>
        </div>

        {/* right column: cards */}
        <div id="assessment-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.6)',
                  border: S.cardBorder,
                  borderRadius: 14,
                  padding: '1.5rem',
                  height: 148,
                  animation: 'pulse 1.5s ease infinite',
                }} />
              ))
            : assessments.slice(0, 4).map((a, i) => (
                <div
                  key={a.id || i}
                  onClick={() => onStart({ id: a.id, title: a.title })}
                  style={{
                    background: 'white',
                    border: S.cardBorder,
                    borderRadius: 14,
                    padding: '1.4rem',
                    cursor: 'pointer',
                    transition: 'transform 0.18s, box-shadow 0.18s, border-color 0.18s',
                    boxShadow: '0 2px 12px rgba(43,143,208,0.07)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 8px 28px rgba(43,143,208,0.16)'
                    e.currentTarget.style.borderColor = S.accent
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(43,143,208,0.07)'
                    e.currentTarget.style.borderColor = '#c8e4f5'
                  }}
                >
                  <h4 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.93rem',
                    fontWeight: 600,
                    color: S.textPrimary,
                    marginBottom: '0.45rem',
                    lineHeight: 1.3,
                  }}>{a.title}</h4>
                  <p style={{
                    fontSize: '0.77rem',
                    color: S.textMuted,
                    lineHeight: 1.55,
                    marginBottom: '0.8rem',
                  }}>{a.description}</p>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.67rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: S.accent,
                    background: S.tagBg,
                    padding: '0.2rem 0.65rem',
                    borderRadius: 100,
                    border: `1px solid ${S.accentBorder}`,
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
        background: 'rgba(255,255,255,0.7)',
        borderTop: `1px solid ${S.accentBorder}`,
        backdropFilter: 'blur(8px)',
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
          color: S.textBody,
          lineHeight: 1.65,
          maxWidth: 680,
          textAlign: 'center',
          margin: 0,
        }}>
          <span style={{ color: '#b07c00', fontWeight: 700, marginRight: '0.4em' }}>⚠ Important Notice:</span>
          Self-assessment tools are screening aids only and can be misleading due to symptom overlap across conditions (comorbidity). Results should never replace a professional evaluation. Please consult our experienced clinicians for an accurate, comprehensive mental health assessment.
        </p>
        <button
          onClick={onBook}
          style={{
            flexShrink: 0,
            background: S.accent,
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '0.6rem 1.4rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(43,143,208,0.25)',
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Book Professional Assessment →
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .assessment-grid {
            grid-template-columns: 1fr !important;
            padding-top: 4.5rem !important;
          }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </section>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function Assessment() {
  const { navigate } = useRouter()
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeAssessment, setActiveAssessment] = useState(null)
  const [results, setResults] = useState(null)

  useEffect(() => {
    wellness.assessments()
      .then(d => setAssessments(d.assessments || []))
      .catch(() => setAssessments([
        { id: 'phq9',    title: 'PHQ-9 Depression Screening', description: 'Validated depression screening tool.',        is_free: true },
        { id: 'gad7',    title: 'GAD-7 Anxiety Scale',        description: 'Generalised anxiety disorder assessment.',   is_free: true },
        { id: 'pcl5',    title: 'PCL-5 PTSD Checklist',       description: 'PTSD symptom scale with domain analysis.',   is_free: true },
        { id: 'burnout', title: 'Burnout Check',               description: 'Work-related stress & burnout analysis.',   is_free: true },
      ]))
      .finally(() => setLoading(false))
  }, [])

  if (activeAssessment && !results) {
    return (
      <QuestionnaireView
        assessmentId={activeAssessment.id}
        onComplete={(answers) => setResults({ assessmentId: activeAssessment.id, answers })}
        onBack={() => setActiveAssessment(null)}
      />
    )
  }

  if (results) {
    return (
      <ResultView
        assessmentId={results.assessmentId}
        answers={results.answers}
        onRetake={() => setResults(null)}
        onBook={() => navigate('/book')}
      />
    )
  }

  return (
    <LandingView
      assessments={assessments}
      loading={loading}
      onStart={setActiveAssessment}
      onBook={() => navigate('/book')}
    />
  )
}