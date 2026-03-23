// src/pages/AssessmentTakePage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { isLoggedIn } from '../services/api'

// ─────────────────────────────────────────────────────────────
// FULL ASSESSMENT DEFINITIONS (embedded — no API needed)
// ─────────────────────────────────────────────────────────────
const ASSESSMENTS = {
  phq9: {
    id: 'phq9',
    title: 'PHQ-9 Depression Screening',
    subtitle: 'Patient Health Questionnaire',
    description: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
    icon: '🧠',
    color: '#1e4d3a',
    accent: '#4ade80',
    estTime: '5 min',
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed, or hopeless',
      'Trouble falling or staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
      'Trouble concentrating on things, such as reading the newspaper or watching television',
      'Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
      'Thoughts that you would be better off dead, or thoughts of hurting yourself in some way',
    ],
    options: [
      { label: 'Not at all',             value: 0 },
      { label: 'Several days',           value: 1 },
      { label: 'More than half the days',value: 2 },
      { label: 'Nearly every day',       value: 3 },
    ],
    maxScore: 27,
    scoring: [
      { range: [0,  4],  label: 'Minimal',              severity: 'none',     color: '#16a34a', bg: '#dcfce7', recommendation: 'Your responses suggest minimal or no depressive symptoms. Continue your healthy routines — good sleep, regular movement, and social connection are your best prevention tools.' },
      { range: [5,  9],  label: 'Mild',                 severity: 'mild',     color: '#ca8a04', bg: '#fef9c3', recommendation: 'You may be experiencing mild depressive symptoms. Consider speaking with a counselor for support strategies. Lifestyle changes such as regular exercise and structured routines can help significantly at this stage.' },
      { range: [10, 14], label: 'Moderate',             severity: 'moderate', color: '#ea580c', bg: '#ffedd5', recommendation: 'Your score indicates moderate depression. We recommend speaking with a qualified therapist soon. Evidence-based therapies like CBT are highly effective at this level.' },
      { range: [15, 19], label: 'Moderately Severe',    severity: 'high',     color: '#dc2626', bg: '#fee2e2', recommendation: 'Your responses indicate moderately severe depression. Please book an appointment with one of our therapists as soon as possible. A combination of therapy and evaluation is recommended.' },
      { range: [20, 27], label: 'Severe',               severity: 'critical', color: '#7f1d1d', bg: '#fecaca', recommendation: 'Your score suggests severe depression. Please seek professional support immediately. You are not alone — our team is ready to help you today.' },
    ],
    note: 'If you selected "Nearly every day" for question 9, please reach out to a mental health professional or a crisis helpline immediately.',
    reference: 'Kroenke K, Spitzer RL, Williams JBW. The PHQ-9. J Gen Intern Med. 2001.',
  },

  gad7: {
    id: 'gad7',
    title: 'GAD-7 Anxiety Scale',
    subtitle: 'Generalised Anxiety Disorder Assessment',
    description: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
    icon: '💭',
    color: '#1e3a5f',
    accent: '#60a5fa',
    estTime: '4 min',
    questions: [
      'Feeling nervous, anxious, or on edge',
      'Not being able to stop or control worrying',
      'Worrying too much about different things',
      'Trouble relaxing',
      'Being so restless that it is hard to sit still',
      'Becoming easily annoyed or irritable',
      'Feeling afraid, as if something awful might happen',
    ],
    options: [
      { label: 'Not at all',             value: 0 },
      { label: 'Several days',           value: 1 },
      { label: 'More than half the days',value: 2 },
      { label: 'Nearly every day',       value: 3 },
    ],
    maxScore: 21,
    scoring: [
      { range: [0,  4],  label: 'Minimal Anxiety',  severity: 'none',     color: '#16a34a', bg: '#dcfce7', recommendation: 'Your anxiety levels appear minimal. Your coping mechanisms are working well. Maintaining mindfulness practices and healthy social connections will continue to serve you.' },
      { range: [5,  9],  label: 'Mild Anxiety',     severity: 'mild',     color: '#ca8a04', bg: '#fef9c3', recommendation: 'You are experiencing mild anxiety. Relaxation techniques, breathing exercises, and reducing caffeine can help. Consider a check-in with a counselor if it persists for more than a few weeks.' },
      { range: [10, 14], label: 'Moderate Anxiety', severity: 'moderate', color: '#ea580c', bg: '#ffedd5', recommendation: 'Moderate anxiety is significantly affecting daily life. Cognitive-behavioural therapy (CBT) is the gold-standard treatment at this level. We recommend booking a session with one of our therapists.' },
      { range: [15, 21], label: 'Severe Anxiety',   severity: 'critical', color: '#dc2626', bg: '#fee2e2', recommendation: 'Your score indicates severe anxiety. Please consult a mental health professional promptly. Treatment is highly effective — most people see major improvement with the right support.' },
    ],
    reference: 'Spitzer RL, et al. A brief measure for assessing GAD. Arch Intern Med. 2006.',
  },

  dass21: {
    id: 'dass21',
    title: 'DASS-21',
    subtitle: 'Depression Anxiety Stress Scales',
    description: 'Please read each statement and indicate how much the statement applied to you over the past week. Rate on a scale of 0–3.',
    icon: '📊',
    color: '#3b1f5e',
    accent: '#c084fc',
    estTime: '8 min',
    questions: [
      // Depression items (indices 0,1,2,3,4,5,6 — every 3rd starting at 0)
      { text: 'I couldn\'t seem to experience any positive feeling at all',            subscale: 'depression' },
      { text: 'I found it difficult to work up the initiative to do things',          subscale: 'depression' },
      { text: 'I felt that I had nothing to look forward to',                         subscale: 'depression' },
      { text: 'I felt down-hearted and blue',                                         subscale: 'depression' },
      { text: 'I was unable to become enthusiastic about anything',                   subscale: 'depression' },
      { text: 'I felt I wasn\'t worth much as a person',                              subscale: 'depression' },
      { text: 'I felt that life was meaningless',                                     subscale: 'depression' },
      // Anxiety items
      { text: 'I was aware of dryness of my mouth',                                   subscale: 'anxiety' },
      { text: 'I experienced breathing difficulty (e.g. excessively fast breathing)', subscale: 'anxiety' },
      { text: 'I experienced trembling (e.g. in the hands)',                          subscale: 'anxiety' },
      { text: 'I was worried about situations in which I might panic',                subscale: 'anxiety' },
      { text: 'I felt I was close to panic',                                          subscale: 'anxiety' },
      { text: 'I was aware of the action of my heart in the absence of physical exertion', subscale: 'anxiety' },
      { text: 'I felt scared without any good reason',                                subscale: 'anxiety' },
      // Stress items
      { text: 'I found it hard to wind down',                                         subscale: 'stress' },
      { text: 'I tended to over-react to situations',                                 subscale: 'stress' },
      { text: 'I felt that I was using a lot of nervous energy',                      subscale: 'stress' },
      { text: 'I found myself getting agitated',                                      subscale: 'stress' },
      { text: 'I found it difficult to tolerate interruptions to what I was doing',   subscale: 'stress' },
      { text: 'I was irritable',                                                      subscale: 'stress' },
      { text: 'I found it difficult to relax',                                        subscale: 'stress' },
    ],
    options: [
      { label: 'Did not apply to me at all',                  value: 0 },
      { label: 'Applied to me to some degree',                value: 1 },
      { label: 'Applied to me a considerable degree',         value: 2 },
      { label: 'Applied to me very much',                     value: 3 },
    ],
    maxScore: 42,
    // DASS-21 subscale scoring (multiply raw sum × 2 to get DASS-42 equivalent)
    subscaleScoring: {
      depression: [
        { range: [0,  9],  label: 'Normal',   severity: 'none',     color: '#16a34a', bg: '#dcfce7' },
        { range: [10, 13], label: 'Mild',      severity: 'mild',     color: '#ca8a04', bg: '#fef9c3' },
        { range: [14, 20], label: 'Moderate',  severity: 'moderate', color: '#ea580c', bg: '#ffedd5' },
        { range: [21, 27], label: 'Severe',    severity: 'high',     color: '#dc2626', bg: '#fee2e2' },
        { range: [28, 42], label: 'Extremely Severe', severity: 'critical', color: '#7f1d1d', bg: '#fecaca' },
      ],
      anxiety: [
        { range: [0,  7],  label: 'Normal',   severity: 'none',     color: '#16a34a', bg: '#dcfce7' },
        { range: [8,  9],  label: 'Mild',      severity: 'mild',     color: '#ca8a04', bg: '#fef9c3' },
        { range: [10, 14], label: 'Moderate',  severity: 'moderate', color: '#ea580c', bg: '#ffedd5' },
        { range: [15, 19], label: 'Severe',    severity: 'high',     color: '#dc2626', bg: '#fee2e2' },
        { range: [20, 42], label: 'Extremely Severe', severity: 'critical', color: '#7f1d1d', bg: '#fecaca' },
      ],
      stress: [
        { range: [0,  14], label: 'Normal',   severity: 'none',     color: '#16a34a', bg: '#dcfce7' },
        { range: [15, 18], label: 'Mild',      severity: 'mild',     color: '#ca8a04', bg: '#fef9c3' },
        { range: [19, 25], label: 'Moderate',  severity: 'moderate', color: '#ea580c', bg: '#ffedd5' },
        { range: [26, 33], label: 'Severe',    severity: 'high',     color: '#dc2626', bg: '#fee2e2' },
        { range: [34, 42], label: 'Extremely Severe', severity: 'critical', color: '#7f1d1d', bg: '#fecaca' },
      ],
    },
    reference: 'Lovibond SH & Lovibond PF. Manual for the Depression Anxiety Stress Scales. 1995.',
  },

  burnout: {
    id: 'burnout',
    title: 'Burnout Check',
    subtitle: 'Workplace Burnout & Stress Inventory',
    description: 'Think about your work and daily life over the past month. How often do you experience the following?',
    icon: '🔥',
    color: '#7c2d12',
    accent: '#fb923c',
    estTime: '6 min',
    questions: [
      { text: 'I feel emotionally drained by my work',                               subscale: 'exhaustion' },
      { text: 'I feel used up at the end of the workday',                            subscale: 'exhaustion' },
      { text: 'I feel tired when I get up and have to face another day at work',     subscale: 'exhaustion' },
      { text: 'Working all day is really a strain for me',                           subscale: 'exhaustion' },
      { text: 'I feel burned out from my work',                                      subscale: 'exhaustion' },
      { text: 'I have become less interested in my work since I started this job',   subscale: 'cynicism' },
      { text: 'I have become less enthusiastic about my work',                       subscale: 'cynicism' },
      { text: 'I doubt the significance of my work',                                 subscale: 'cynicism' },
      { text: 'I have become more cynical about whether my work contributes anything', subscale: 'cynicism' },
      { text: 'I feel I make an effective contribution to what this organisation does', subscale: 'efficacy' },
      { text: 'I can effectively solve the problems that arise in my work',           subscale: 'efficacy' },
      { text: 'I feel I am making an effective contribution at work',                subscale: 'efficacy' },
      { text: 'In my opinion I am good at my job',                                   subscale: 'efficacy' },
    ],
    options: [
      { label: 'Never',        value: 0 },
      { label: 'Rarely',       value: 1 },
      { label: 'Sometimes',    value: 2 },
      { label: 'Often',        value: 3 },
      { label: 'Always',       value: 4 },
    ],
    maxScore: 52,
    subscaleScoring: {
      exhaustion: [
        { range: [0,  7],  label: 'Low',      severity: 'none',     color: '#16a34a', bg: '#dcfce7' },
        { range: [8,  13], label: 'Moderate', severity: 'mild',     color: '#ca8a04', bg: '#fef9c3' },
        { range: [14, 20], label: 'High',     severity: 'critical', color: '#dc2626', bg: '#fee2e2' },
      ],
      cynicism: [
        { range: [0,  5],  label: 'Low',      severity: 'none',     color: '#16a34a', bg: '#dcfce7' },
        { range: [6,  10], label: 'Moderate', severity: 'mild',     color: '#ca8a04', bg: '#fef9c3' },
        { range: [11, 16], label: 'High',     severity: 'critical', color: '#dc2626', bg: '#fee2e2' },
      ],
      efficacy: [
        { range: [12, 16], label: 'High (Healthy)',    severity: 'none',     color: '#16a34a', bg: '#dcfce7' },
        { range: [8,  11], label: 'Moderate',          severity: 'mild',     color: '#ca8a04', bg: '#fef9c3' },
        { range: [0,  7],  label: 'Low (Risk Factor)', severity: 'critical', color: '#dc2626', bg: '#fee2e2' },
      ],
    },
    reference: 'Maslach C, Leiter MP. The Maslach Burnout Inventory. 1997.',
  },
}

// ─────────────────────────────────────────────────────────────
// SCORING HELPERS
// ─────────────────────────────────────────────────────────────
function scoreSimple(assessment, answers) {
  const total = Object.values(answers).reduce((a, b) => a + Number(b), 0)
  const match = assessment.scoring.find(s => total >= s.range[0] && total <= s.range[1])
  return { type: 'simple', total, match }
}

function scoreDASS(answers) {
  const a = ASSESSMENTS.dass21
  const dRaw = [0,1,2,3,4,5,6].reduce((s, i) => s + Number(answers[i] ?? 0), 0)
  const axRaw = [7,8,9,10,11,12,13].reduce((s, i) => s + Number(answers[i] ?? 0), 0)
  const stRaw = [14,15,16,17,18,19,20].reduce((s, i) => s + Number(answers[i] ?? 0), 0)
  // multiply × 2 for DASS-42 equivalent norms
  const d  = dRaw  * 2
  const ax = axRaw * 2
  const st = stRaw * 2
  const find = (scale, score) => a.subscaleScoring[scale].find(s => score >= s.range[0] && score <= s.range[1])
  return {
    type: 'subscale',
    subscales: {
      depression: { raw: dRaw,  norm: d,  ...find('depression', d)  },
      anxiety:    { raw: axRaw, norm: ax, ...find('anxiety',    ax) },
      stress:     { raw: stRaw, norm: st, ...find('stress',     st) },
    },
  }
}

function scoreBurnout(answers) {
  const exRaw  = [0,1,2,3,4].reduce((s, i) => s + Number(answers[i] ?? 0), 0)
  const cynRaw = [5,6,7,8].reduce((s, i) => s + Number(answers[i] ?? 0), 0)
  // Efficacy is reverse-scored conceptually — low efficacy = burnout risk
  const effRaw = [9,10,11,12].reduce((s, i) => s + Number(answers[i] ?? 0), 0)
  const a = ASSESSMENTS.burnout
  const find = (scale, score) => a.subscaleScoring[scale].find(s => score >= s.range[0] && score <= s.range[1])
  return {
    type: 'subscale',
    subscales: {
      exhaustion: { raw: exRaw,  ...find('exhaustion', exRaw) },
      cynicism:   { raw: cynRaw, ...find('cynicism',   cynRaw) },
      efficacy:   { raw: effRaw, ...find('efficacy',   effRaw) },
    },
  }
}

function computeResult(assessment, answers) {
  if (assessment.id === 'phq9' || assessment.id === 'gad7') return scoreSimple(assessment, answers)
  if (assessment.id === 'dass21')  return scoreDASS(answers)
  if (assessment.id === 'burnout') return scoreBurnout(answers)
}

// ─────────────────────────────────────────────────────────────
// SEVERITY BADGE
// ─────────────────────────────────────────────────────────────
function SeverityBadge({ label, color, bg }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.3rem 1rem',
      borderRadius: 100,
      background: bg,
      color,
      fontWeight: 700,
      fontSize: '0.82rem',
      letterSpacing: '0.02em',
    }}>{label}</span>
  )
}

// ─────────────────────────────────────────────────────────────
// SCORE BAR
// ─────────────────────────────────────────────────────────────
function ScoreBar({ value, max, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ background: '#e5e7eb', borderRadius: 100, height: 8, overflow: 'hidden', marginTop: 6 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 100, transition: 'width 0.8s cubic-bezier(.4,0,.2,1)' }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// RESULTS: simple (PHQ-9, GAD-7)
// ─────────────────────────────────────────────────────────────
function SimpleResult({ assessment, result, navigate }) {
  const { total, match } = result
  const pct = Math.round((total / assessment.maxScore) * 100)
  return (
    <div style={{ maxWidth: 580, margin: '0 auto', textAlign: 'center', padding: '0 1rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{assessment.icon}</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--green-deep)', marginBottom: '0.25rem' }}>
        Your Results
      </h2>
      <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '2rem' }}>{assessment.title}</p>

      {/* Score circle */}
      <div style={{
        width: 140, height: 140, borderRadius: '50%',
        background: match?.bg || '#f0fdf4',
        border: `6px solid ${match?.color || '#16a34a'}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem',
      }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: match?.color, lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>/ {assessment.maxScore}</div>
      </div>

      <SeverityBadge label={match?.label} color={match?.color} bg={match?.bg} />

      {/* Score bar */}
      <div style={{ margin: '1.5rem 0', textAlign: 'left', background: 'var(--off-white)', borderRadius: 12, padding: '1.25rem 1.5rem', border: '1px solid var(--earth-cream)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: 4 }}>
          <span>Score: {total}/{assessment.maxScore}</span><span>{pct}th percentile range</span>
        </div>
        <ScoreBar value={total} max={assessment.maxScore} color={match?.color || '#16a34a'} />

        {/* Range legend */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          {assessment.scoring.map((s, i) => (
            <div key={i} style={{
              padding: '0.2rem 0.6rem', borderRadius: 6,
              background: s.range[0] === match?.range[0] ? s.bg : '#f3f4f6',
              color: s.range[0] === match?.range[0] ? s.color : '#9ca3af',
              fontSize: '0.7rem', fontWeight: s.range[0] === match?.range[0] ? 700 : 400,
              border: s.range[0] === match?.range[0] ? `1px solid ${s.color}` : '1px solid transparent',
            }}>
              {s.range[0]}–{s.range[1]}: {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div style={{ background: 'var(--off-white)', borderRadius: 12, padding: '1.5rem', border: '1px solid var(--earth-cream)', marginBottom: '1.5rem', textAlign: 'left' }}>
        <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--green-deep)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Our Recommendation
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.75, margin: 0 }}>
          {match?.recommendation}
        </p>
      </div>

      {/* Q9 crisis note for PHQ-9 */}
      {assessment.id === 'phq9' && Number(answers?.[8]) > 0 && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
          <p style={{ fontSize: '0.85rem', color: '#7f1d1d', margin: 0, lineHeight: 1.6 }}>
            <strong>⚠ Important:</strong> {assessment.note}
          </p>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '2rem', textAlign: 'left' }}>
        <p style={{ fontSize: '0.78rem', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
          <strong>⚠ Clinical Note:</strong> This screening tool is not a diagnosis. Results can be influenced by comorbid conditions and situational factors. Please consult a qualified mental health professional for a comprehensive evaluation.
        </p>
        <p style={{ fontSize: '0.7rem', color: '#a16207', margin: '0.5rem 0 0', fontStyle: 'italic' }}>
          Reference: {assessment.reference}
        </p>
      </div>

      {!isLoggedIn() && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '1.5rem', background: 'var(--earth-cream)', padding: '0.75rem 1rem', borderRadius: 8 }}>
          💡 <strong>Sign in</strong> to save your results and track your progress over time.
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/book')}>Book a Therapist</button>
        <button className="btn btn-outline btn-lg" onClick={() => navigate('/assessments')}>Take Another</button>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Home</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// RESULTS: subscale (DASS-21, Burnout)
// ─────────────────────────────────────────────────────────────
const SUBSCALE_META = {
  // DASS-21
  depression: { label: 'Depression',  icon: '😔', maxNorm: 28, desc: 'Measures low mood, hopelessness, and loss of interest.' },
  anxiety:    { label: 'Anxiety',     icon: '😰', maxNorm: 20, desc: 'Measures physiological arousal and situational anxiety.' },
  stress:     { label: 'Stress',      icon: '😤', maxNorm: 34, desc: 'Measures tension, irritability, and difficulty relaxing.' },
  // Burnout
  exhaustion: { label: 'Exhaustion',  icon: '😴', maxNorm: 20, desc: 'Emotional and physical depletion from work demands.' },
  cynicism:   { label: 'Cynicism',    icon: '😒', maxNorm: 16, desc: 'Detachment and disillusionment toward your work.' },
  efficacy:   { label: 'Efficacy',    icon: '💪', maxNorm: 16, desc: 'Sense of competence and achievement in your role. Higher = healthier.' },
}

const BURNOUT_OVERALL = (subscales) => {
  const ex  = subscales.exhaustion?.severity
  const cyn = subscales.cynicism?.severity
  const eff = subscales.efficacy?.severity
  const criticalCount = [ex, cyn, eff].filter(s => s === 'critical').length
  const mildCount     = [ex, cyn, eff].filter(s => s === 'mild').length
  if (criticalCount >= 2) return { label: 'High Burnout Risk',    color: '#dc2626', bg: '#fee2e2', recommendation: 'Your scores across multiple dimensions indicate significant burnout. Please prioritise your wellbeing — we strongly recommend speaking with a therapist or occupational health specialist urgently.' }
  if (criticalCount === 1 || mildCount >= 2) return { label: 'Moderate Burnout Risk', color: '#ea580c', bg: '#ffedd5', recommendation: 'You are showing signs of burnout in key areas. Boundary-setting, workload review, and speaking with a counsellor can help prevent escalation.' }
  return { label: 'Low Burnout Risk', color: '#16a34a', bg: '#dcfce7', recommendation: 'Your burnout indicators are currently low. Maintain your self-care practices and check in regularly — early awareness is your best protection.' }
}

const DASS_OVERALL = (subscales) => {
  const severities = [subscales.depression?.severity, subscales.anxiety?.severity, subscales.stress?.severity]
  if (severities.includes('critical')) return { label: 'Requires Urgent Attention', color: '#7f1d1d', bg: '#fecaca' }
  if (severities.includes('high'))     return { label: 'Elevated Distress',          color: '#dc2626', bg: '#fee2e2' }
  if (severities.includes('moderate')) return { label: 'Moderate Distress',          color: '#ea580c', bg: '#ffedd5' }
  if (severities.includes('mild'))     return { label: 'Mild Distress',              color: '#ca8a04', bg: '#fef9c3' }
  return { label: 'Within Normal Range', color: '#16a34a', bg: '#dcfce7' }
}

function SubscaleResult({ assessment, result, navigate }) {
  const { subscales } = result
  const isDASS     = assessment.id === 'dass21'
  const overall    = isDASS ? DASS_OVERALL(subscales) : BURNOUT_OVERALL(subscales)
  const burnoutRec = !isDASS ? BURNOUT_OVERALL(subscales).recommendation : null

  const DASS_REC = {
    depression: 'Depression symptoms benefit greatly from behavioural activation — scheduling small pleasurable activities can help start breaking the cycle. CBT is the most evidence-supported treatment.',
    anxiety:    'Anxiety responds well to relaxation training, controlled breathing, and CBT. If physical symptoms are prominent, a medical review is also worthwhile.',
    stress:     'High stress often responds to structured time management, mindfulness, and identifying and reducing stressors. A therapist can help you build a personalised stress management plan.',
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{assessment.icon}</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--green-deep)', marginBottom: '0.25rem' }}>
          Your Results
        </h2>
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '1rem' }}>{assessment.title}</p>
        <SeverityBadge label={overall.label} color={overall.color} bg={overall.bg} />
      </div>

      {/* Subscale cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {Object.entries(subscales).map(([key, data]) => {
          const meta = SUBSCALE_META[key]
          const maxVal = key === 'exhaustion' ? 20 : key === 'cynicism' ? 16 : key === 'efficacy' ? 16 : meta.maxNorm
          const displayScore = isDASS ? data.norm : data.raw
          const displayMax   = isDASS ? meta.maxNorm : maxVal
          return (
            <div key={key} style={{
              background: 'var(--white)',
              borderRadius: 12,
              padding: '1.25rem 1.5rem',
              border: `1.5px solid ${data.bg || '#e5e7eb'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '1.1rem', marginRight: '0.4rem' }}>{meta.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--green-deep)' }}>{meta.label}</span>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '0.2rem 0 0', maxWidth: 360 }}>{meta.desc}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '1rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.4rem', color: data.color }}>{displayScore}</span>
                  <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>/{displayMax}</span>
                  <div style={{ marginTop: 4 }}>
                    <SeverityBadge label={data.label} color={data.color} bg={data.bg} />
                  </div>
                </div>
              </div>
              <ScoreBar value={displayScore} max={displayMax} color={data.color} />
              {isDASS && data.severity !== 'none' && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.75rem', lineHeight: 1.6, borderTop: '1px solid var(--earth-cream)', paddingTop: '0.75rem' }}>
                  {DASS_REC[key]}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Overall recommendation */}
      {burnoutRec && (
        <div style={{ background: 'var(--off-white)', borderRadius: 12, padding: '1.5rem', border: '1px solid var(--earth-cream)', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--green-deep)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Overall Recommendation
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-mid)', lineHeight: 1.75, margin: 0 }}>{burnoutRec}</p>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.78rem', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
          <strong>⚠ Clinical Note:</strong> These scores are screening indicators, not diagnoses. Comorbid conditions can affect results across all subscales. Please consult a qualified clinician for a comprehensive evaluation.
        </p>
        <p style={{ fontSize: '0.7rem', color: '#a16207', margin: '0.5rem 0 0', fontStyle: 'italic' }}>
          Reference: {assessment.reference}
        </p>
      </div>

      {!isLoggedIn() && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '1.5rem', background: 'var(--earth-cream)', padding: '0.75rem 1rem', borderRadius: 8 }}>
          💡 <strong>Sign in</strong> to save your results and track your progress over time.
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/book')}>Book a Therapist</button>
        <button className="btn btn-outline btn-lg" onClick={() => navigate('/assessments')}>Take Another</button>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Home</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
let answers // lifted for Q9 note access in SimpleResult — we'll pass it down
export default function AssessmentTakePage() {
  const { params, navigate }        = useRouter()
  const assessmentId                = params?.assessmentId || 'phq9'
  const assessment                  = ASSESSMENTS[assessmentId] || ASSESSMENTS.phq9
  const [localAnswers, setAnswers]  = useState({})
  const [submitted, setSubmitted]   = useState(false)
  const [result, setResult]         = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')

  // Reset when assessment changes
  useEffect(() => {
    setAnswers({})
    setSubmitted(false)
    setResult(null)
    setError('')
  }, [assessmentId])

  const questions = assessment.questions
  const total     = questions.length
  const answered  = Object.keys(localAnswers).length
  const progress  = total > 0 ? (answered / total) * 100 : 0

  async function handleSubmit() {
    if (answered < total) return
    setSubmitting(true)
    setError('')
    try {
      const res = computeResult(assessment, localAnswers)
      setResult(res)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── RESULTS SCREEN ──
  if (submitted && result) return (
    <div className="page-wrapper">
      <div className="section" style={{ background: 'var(--off-white)', minHeight: '80vh', paddingTop: '4rem', paddingBottom: '4rem' }}>
        {result.type === 'simple'
          ? <SimpleResult assessment={assessment} result={result} navigate={navigate} answers={localAnswers} />
          : <SubscaleResult assessment={assessment} result={result} navigate={navigate} />
        }
      </div>
    </div>
  )

  // ── QUESTION SCREEN ──
  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div className="page-hero" style={{ background: assessment.color, paddingBottom: '2.5rem' }}>
        <button
          onClick={() => navigate('/assessments')}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 'var(--radius-sm)', padding: '0.4rem 1rem', cursor: 'pointer', fontSize: '0.82rem', marginBottom: '1rem' }}
        >
          ← Back
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '1.8rem' }}>{assessment.icon}</span>
          <div>
            <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: '0.1rem' }}>
              {assessment.subtitle}
            </span>
            <h1 style={{ fontFamily: 'var(--font-display)', color: 'white', fontSize: '1.5rem', margin: 0 }}>
              {assessment.title}
            </h1>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.1)', borderRadius: 100, height: 6, maxWidth: 400 }}>
          <div style={{ height: '100%', borderRadius: 100, background: assessment.accent, width: `${progress}%`, transition: 'width 0.3s' }} />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.4rem' }}>
          {answered} of {total} answered
        </div>
      </div>

      {/* Questions */}
      <div className="section" style={{ background: 'var(--off-white)', paddingTop: '2.5rem', paddingBottom: '4rem' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>

          {/* Description banner */}
          <div style={{ background: 'white', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '2rem', border: '1px solid var(--earth-cream)', fontSize: '0.875rem', color: 'var(--text-mid)', lineHeight: 1.7 }}>
            {assessment.description}
          </div>

          {questions.map((q, qi) => {
            const text = typeof q === 'string' ? q : q.text
            const opts = assessment.options
            const isAnswered = localAnswers[qi] !== undefined
            return (
              <div
                key={qi}
                style={{
                  background: 'var(--white)',
                  borderRadius: 12,
                  padding: '1.5rem',
                  marginBottom: '1rem',
                  border: `2px solid ${isAnswered ? assessment.accent : 'var(--earth-cream)'}`,
                  transition: 'border-color 0.2s',
                }}
              >
                {/* Subscale tag */}
                {q.subscale && (
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', marginBottom: '0.5rem' }}>
                    {q.subscale}
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.98rem', fontWeight: 500, color: 'var(--green-deep)', marginBottom: '1rem', lineHeight: 1.5 }}>
                  <span style={{ fontWeight: 700, marginRight: '0.4rem', color: isAnswered ? assessment.color : '#9ca3af' }}>
                    {qi + 1}.
                  </span>
                  {text}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${opts.length <= 4 ? opts.length : 2}, 1fr)`, gap: '0.5rem' }}>
                  {opts.map((opt, oi) => {
                    const val = opt.value ?? oi
                    const selected = localAnswers[qi] === val
                    return (
                      <button
                        key={oi}
                        onClick={() => setAnswers(a => ({ ...a, [qi]: val }))}
                        style={{
                          border: `2px solid ${selected ? assessment.color : 'var(--earth-cream)'}`,
                          borderRadius: 8,
                          padding: '0.65rem 0.5rem',
                          fontSize: '0.78rem',
                          fontWeight: selected ? 700 : 400,
                          cursor: 'pointer',
                          background: selected ? assessment.color : 'var(--white)',
                          color: selected ? 'white' : 'var(--text-mid)',
                          transition: 'all 0.15s',
                          lineHeight: 1.4,
                          textAlign: 'center',
                        }}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {error && <p style={{ color: '#c0392b', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}

          {/* Disclaimer above submit */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '0.85rem 1.1rem', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.75rem', color: '#92400e', margin: 0, lineHeight: 1.6 }}>
              <strong>⚠ Note:</strong> This is a screening tool only, not a clinical diagnosis. Self-assessment can be misleading due to symptom overlap with comorbid conditions. For a proper evaluation, please consult our experienced clinicians.
            </p>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', opacity: answered === total ? 1 : 0.45, cursor: answered === total ? 'pointer' : 'not-allowed' }}
            onClick={handleSubmit}
            disabled={answered < total || submitting}
          >
            {submitting ? 'Calculating…' : `Submit & See Results → (${answered}/${total})`}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.75rem' }}>
            Estimated time: {assessment.estTime} · Results shown immediately
          </p>
        </div>
      </div>
    </div>
  )
}