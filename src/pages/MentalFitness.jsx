import { useState, useEffect } from 'react'
import { useLang } from '../context/LanguageContext'

/* ─────────────────────────────────────────────────────────────
   MENTAL FITNESS SCORE — landing page + interactive check-in
   v2: sky-blue → white gradient backdrop (explicit hex, not the
   theme's grey/purple off-white token) + animated quiz/results flow.
───────────────────────────────────────────────────────────── */

// Explicit sky-blue/white palette used for backgrounds & motion accents —
// intentionally hard-coded so this page reads "sky blue" regardless of
// what --off-white / --sky-light resolve to elsewhere in the app.
const BG = {
  pageTop:    '#eaf6ff',
  pageMid:    '#ffffff',
  pageBot:    '#f2fbff',
  heroTop:    '#d8eeff',
  heroBot:    '#ffffff',
  glow1:      'rgba(56,150,231,0.16)',
  glow2:      'rgba(56,150,231,0.10)',
  cardBorder: '#dceefc',
}

// Glass card treatment — same layered translucent gradient + blur used
// on the Services page cards, tuned to this page's sky-blue palette.
const GLASS = {
  bg:        'linear-gradient(160deg, rgba(255,255,255,0.78) 0%, rgba(216,238,255,0.58) 55%, rgba(255,255,255,0.74) 100%)',
  bgHover:   'linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(200,228,255,0.7) 55%, rgba(255,255,255,0.84) 100%)',
  border:    '1px solid #dceefc',
  borderHov: '1px solid rgba(56,150,231,0.45)',
  shadow:    '0 4px 18px rgba(56,150,231,0.10), inset 0 1px 0 rgba(255,255,255,0.5)',
  shadowHov: '0 20px 44px rgba(56,150,231,0.24), 0 6px 16px rgba(56,150,231,0.14), inset 0 1px 0 rgba(255,255,255,0.6)',
}

const PILLARS = [
  {
    key: 'emotional',
    icon: '🌊',
    label: 'Emotional Regulation',
    labelNP: 'भावनात्मक नियमन',
    desc: 'How steady you feel when things get hard, and how quickly you find your footing again.',
    descNP: 'कठिन परिस्थितिमा तपाईं कत्तिको स्थिर रहनुहुन्छ र फेरि सन्तुलनमा फर्किनुहुन्छ।',
    tint: 'var(--sky-light)',
    fg: 'var(--sky)',
    levels: [
      { label: 'Overwhelmed most days', labelNP: 'धेरैजसो दिन अभिभूत' },
      { label: 'Often shaken', labelNP: 'प्रायः विचलित' },
      { label: 'Mixed, day to day', labelNP: 'दिनैपिच्छे फरक' },
      { label: 'Mostly steady', labelNP: 'धेरैजसो स्थिर' },
      { label: 'Grounded and steady', labelNP: 'स्थिर र सन्तुलित' },
    ],
  },
  {
    key: 'sleep',
    icon: '🌙',
    label: 'Sleep',
    labelNP: 'निद्रा',
    desc: 'The quality and consistency of your rest — the quiet foundation everything else sits on.',
    descNP: 'तपाईंको निद्राको गुणस्तर र नियमितता — बाँकी सबैको जग।',
    tint: 'var(--blue-mist)',
    fg: '#1565c0',
    levels: [
      { label: 'Rarely rested', labelNP: 'विरलै आराम भएको' },
      { label: 'Often disrupted', labelNP: 'प्रायः बाधित' },
      { label: 'Hit or miss', labelNP: 'कहिलेकाहीं राम्रो' },
      { label: 'Usually good', labelNP: 'प्रायः राम्रो' },
      { label: 'Deep and consistent', labelNP: 'गहिरो र नियमित' },
    ],
  },
  {
    key: 'stress',
    icon: '🔥',
    label: 'Stress',
    labelNP: 'तनाव',
    desc: 'How much pressure you\u2019re carrying day to day, and how well you\u2019re able to set it down.',
    descNP: 'दैनिक रूपमा तपाईंले कति दबाब बोकिरहनुभएको छ र त्यसलाई कत्तिको राम्रोसँग छोड्न सक्नुहुन्छ।',
    tint: '#fde8e3',
    fg: '#c0533f',
    levels: [
      { label: 'Constantly under pressure', labelNP: 'सधैं दबाबमा' },
      { label: 'Frequently stretched thin', labelNP: 'प्रायः थकित' },
      { label: 'Manageable most days', labelNP: 'धेरैजसो थेग्नसक्ने' },
      { label: 'Rarely overwhelmed', labelNP: 'विरलै अभिभूत' },
      { label: 'Calm and in control', labelNP: 'शान्त र नियन्त्रणमा' },
    ],
  },
  {
    key: 'relationships',
    icon: '🤝',
    label: 'Relationships',
    labelNP: 'सम्बन्धहरू',
    desc: 'The warmth, honesty, and support flowing between you and the people closest to you.',
    descNP: 'तपाईं र तपाईंको नजिकका मानिसहरू बीचको न्यानोपन र सहयोग।',
    tint: 'var(--green-mist)',
    fg: 'var(--green-deep)',
    levels: [
      { label: 'Isolated or strained', labelNP: 'एक्लो वा तनावपूर्ण' },
      { label: 'Distant lately', labelNP: 'हालै टाढा' },
      { label: 'Okay, could be closer', labelNP: 'ठीकै, अझ नजिक हुन सक्ने' },
      { label: 'Mostly warm', labelNP: 'धेरैजसो न्यानो' },
      { label: 'Close and supported', labelNP: 'नजिक र सहयोगी' },
    ],
  },
  {
    key: 'purpose',
    icon: '🧭',
    label: 'Purpose',
    labelNP: 'उद्देश्य',
    desc: 'A sense of direction — knowing why your days matter, even on the ordinary ones.',
    descNP: 'दिशाको भावना — सामान्य दिनहरूमा पनि तपाईंको समय किन महत्त्वपूर्ण छ भनेर थाहा हुनु।',
    tint: '#f3e8fd',
    fg: '#7b3fc0',
    levels: [
      { label: 'Adrift most days', labelNP: 'धेरैजसो दिशाहीन' },
      { label: 'Unsure lately', labelNP: 'हालै अनिश्चित' },
      { label: 'Some sense of why', labelNP: 'केही हदसम्म कारण थाहा' },
      { label: 'Mostly clear', labelNP: 'धेरैजसो स्पष्ट' },
      { label: 'Clear and motivated', labelNP: 'स्पष्ट र उत्प्रेरित' },
    ],
  },
  {
    key: 'habits',
    icon: '🌱',
    label: 'Habits',
    labelNP: 'बानीहरू',
    desc: 'The small daily routines that quietly compound into how well you function and feel.',
    descNP: 'साना दैनिक दिनचर्याहरू जसले बिस्तारै तपाईंको काम र भावनालाई असर गर्छ।',
    tint: '#fff7d6',
    fg: '#a67c00',
    levels: [
      { label: 'Routines have slipped', labelNP: 'दिनचर्या बिग्रिएको' },
      { label: 'Inconsistent', labelNP: 'अनियमित' },
      { label: 'Some good habits', labelNP: 'केही राम्रा बानी' },
      { label: 'Mostly consistent', labelNP: 'धेरैजसो नियमित' },
      { label: 'Strong daily routines', labelNP: 'बलियो दैनिक दिनचर्या' },
    ],
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Answer a few honest questions',
    titleNP: 'केही इमानदार प्रश्नहरूको जवाफ दिनुहोस्',
    desc: 'A short, gentle check-in across all six pillars. No right answers, just where you are today.',
    descNP: 'छ वटै आधारहरूमा छोटो, सौम्य जाँच। सही जवाफ छैन, आज तपाईं कहाँ हुनुहुन्छ मात्र।',
  },
  {
    n: '02',
    title: 'See your wellness trend',
    titleNP: 'आफ्नो स्वास्थ्य प्रवृत्ति हेर्नुहोस्',
    desc: 'We turn your answers into a single, readable score — and show you how it shifts over time.',
    descNP: 'हामी तपाईंको जवाफलाई एउटा सजिलो स्कोरमा बदल्छौं — र समयसँगै यो कसरी परिवर्तन हुन्छ देखाउँछौं।',
  },
  {
    n: '03',
    title: 'Get gentle, specific guidance',
    titleNP: 'सौम्य र विशेष मार्गदर्शन पाउनुहोस्',
    desc: 'Wherever your score points to strain, we suggest a next step — a worksheet, a session, or simply rest.',
    descNP: 'जहाँ तनाव देखिन्छ, हामी अर्को कदम सुझाव दिन्छौं — वर्कशीट, सत्र, वा केवल आराम।',
  },
]

// level index (0-4) -> percentage for that pillar
function levelToPercent(levelIndex) {
  return Math.round((levelIndex / (5 - 1)) * 100)
}

function scoreColor(pct) {
  if (pct >= 70) return { fg: 'var(--green-deep)', bg: 'var(--green-mist)' }
  if (pct >= 40) return { fg: '#a67c00', bg: '#fff7d6' }
  return { fg: '#c0533f', bg: '#fde8e3' }
}

// One-time keyframe injection for the quiz/results motion. Scoped with an
// "mfs-" prefix so it can't collide with anything else on the page.
function injectMotionCSS() {
  if (typeof document === 'undefined' || document.getElementById('mfs-motion-css')) return
  const s = document.createElement('style')
  s.id = 'mfs-motion-css'
  s.textContent = `
    @keyframes mfsStepIn { from { opacity:0; transform:translateX(18px); } to { opacity:1; transform:translateX(0); } }
    @keyframes mfsStepOutLeft { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(-18px); } }
    @keyframes mfsPopIn { from { opacity:0; transform:translateY(14px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
    @keyframes mfsRingIn { from { opacity:0; transform:scale(0.85); } to { opacity:1; transform:scale(1); } }
    @keyframes mfsFadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes mfsFloat { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
    @keyframes mfsShimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
    .mfs-step-anim { animation: mfsStepIn 0.32s cubic-bezier(.22,1,.36,1); }
    .mfs-pop-anim { animation: mfsPopIn 0.4s cubic-bezier(.22,1,.36,1); }
    .mfs-ring-anim { animation: mfsRingIn 0.5s cubic-bezier(.22,1,.36,1) both; }
    .mfs-fade-up { animation: mfsFadeUp 0.42s cubic-bezier(.22,1,.36,1) both; }
    .mfs-glow-a { animation: mfsFloat 7s ease-in-out infinite; }
    .mfs-glow-b { animation: mfsFloat 9s ease-in-out infinite 1.2s; }
    .mfs-level-btn { transition: border-color .15s ease, background .15s ease, transform .12s ease; }
    .mfs-level-btn:hover { transform: translateX(3px); }
    .mfs-level-btn:active { transform: translateX(1px) scale(0.99); }
    .mfs-glass-card:hover {
      transform: translateY(-4px) scale(1.01);
      background: linear-gradient(160deg, rgba(255,255,255,0.88) 0%, rgba(200,228,255,0.7) 55%, rgba(255,255,255,0.84) 100%);
      border-color: rgba(56,150,231,0.45);
      box-shadow: 0 20px 44px rgba(56,150,231,0.24), 0 6px 16px rgba(56,150,231,0.14), inset 0 1px 0 rgba(255,255,255,0.6);
    }
  `
  document.head.appendChild(s)
}

export default function MentalFitnessScore({ onNavigate }) {
  const { lang } = useLang ? useLang() : { lang: 'EN' }

  // quiz state: null = not started, 'quiz' = in progress, 'results' = done
  const [stage, setStage] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [answers, setAnswers] = useState({}) // { pillarKey: levelIndex }
  const [animKey, setAnimKey] = useState(0)  // bumps to re-trigger the step-in animation

  useEffect(() => { injectMotionCSS() }, [])

  function go(path) {
    if (onNavigate) onNavigate(path)
  }

  function startQuiz() {
    setAnswers({})
    setStepIndex(0)
    setAnimKey(k => k + 1)
    setStage('quiz')
  }

  function selectLevel(pillarKey, levelIdx) {
    const next = { ...answers, [pillarKey]: levelIdx }
    setAnswers(next)
    if (stepIndex < PILLARS.length - 1) {
      setStepIndex(stepIndex + 1)
      setAnimKey(k => k + 1)
    } else {
      setStage('results')
    }
  }

  function goBackStep() {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
      setAnimKey(k => k + 1)
    }
  }

  function retake() {
    setAnswers({})
    setStepIndex(0)
    setAnimKey(k => k + 1)
    setStage('quiz')
  }

  const pillarScores = PILLARS.map(p => ({
    ...p,
    pct: answers[p.key] !== undefined ? levelToPercent(answers[p.key]) : null,
  }))
  const answeredScores = pillarScores.filter(p => p.pct !== null)
  const overallPct = answeredScores.length
    ? Math.round(answeredScores.reduce((sum, p) => sum + p.pct, 0) / answeredScores.length)
    : 0

  const overallColor = scoreColor(overallPct)
  const overallLabel =
    overallPct >= 70
      ? { en: 'Steady & doing well', np: 'स्थिर र राम्रो अवस्थामा' }
      : overallPct >= 40
      ? { en: 'Mixed, worth attention', np: 'मिश्रित, ध्यान दिनुपर्ने' }
      : { en: 'Under real strain', np: 'वास्तविक तनावमा' }

  return (
    <div style={{ background: `linear-gradient(180deg, ${BG.pageTop} 0%, ${BG.pageMid} 45%, ${BG.pageBot} 100%)` }}>

      {/* ───────────── HERO / QUIZ ───────────── */}
      <section style={{
        padding: stage === null ? '4.5rem 1.5rem 4rem' : '3.25rem 1.5rem 3.5rem',
        background: `linear-gradient(180deg, ${BG.heroTop} 0%, ${BG.heroBot} 100%)`,
        borderBottom: '1px solid var(--blue-pale)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* soft floating sky-blue glows for a bit of life behind the content */}
        <div className="mfs-glow-a" style={{ position:'absolute', top:-60, left:'8%', width:220, height:220, borderRadius:'50%', background:BG.glow1, filter:'blur(46px)', pointerEvents:'none' }} />
        <div className="mfs-glow-b" style={{ position:'absolute', bottom:-70, right:'6%', width:260, height:260, borderRadius:'50%', background:BG.glow2, filter:'blur(52px)', pointerEvents:'none' }} />

        <div style={{ maxWidth:920, margin:'0 auto', textAlign:'center', position:'relative' }}>

          {stage === null && (
            <div className="mfs-fade-up" style={{
              display:'inline-flex', alignItems:'center', gap:'0.45rem',
              padding:'0.35rem 0.9rem', borderRadius:100,
              background:'var(--white)', border:'1.5px solid var(--blue-pale)',
              fontFamily:'var(--font-body)', fontSize:'0.72rem', fontWeight:700,
              color:'var(--green-deep)', letterSpacing:'0.04em',
              marginBottom:'1.5rem',
            }}>
              🧠 {lang==='NP' ? 'नयाँ उपकरण' : 'New tool'}
            </div>
          )}

          {stage === null && (
            <>
              <h1 className="mfs-fade-up" style={{
                fontFamily:'var(--font-display)', fontWeight:800,
                fontSize:'clamp(2.1rem, 5vw, 3.4rem)', lineHeight:1.08,
                color:'var(--text-dark)', margin:'0 0 1.1rem',
                letterSpacing:'-0.01em', animationDelay:'60ms',
              }}>
                {lang==='NP' ? 'तपाईंको मानसिक फिटनेस स्कोर' : 'Your Mental Fitness Score'}
              </h1>

              <p className="mfs-fade-up" style={{
                fontFamily:'var(--font-body)', fontSize:'1.08rem',
                color:'var(--text-mid)', maxWidth:600, margin:'0 auto 2.25rem',
                lineHeight:1.6, animationDelay:'120ms',
              }}>
                {lang==='NP'
                  ? 'यो कुनै चिकित्सा निदान होइन। यो तपाईंको दैनिक भावनात्मक स्वास्थ्यको सरल, सौम्य झलक हो — समयसँगै तपाईं कस्तो महसुस गर्दै हुनुहुन्छ भन्ने प्रवृत्ति।'
                  : 'Not a medical score. Just a simple, honest read on how you\u2019re really doing — your psychological wellness trend, over time.'}
              </p>

              <div className="mfs-fade-up" style={{ display:'flex', gap:'0.85rem', justifyContent:'center', flexWrap:'wrap', animationDelay:'180ms' }}>
                <button className="btn btn-primary" onClick={startQuiz}>
                  {lang==='NP' ? 'आफ्नो स्कोर हेर्नुहोस्' : 'Check My Score'} →
                </button>
              </div>
            </>
          )}

          {/* ───────── QUIZ: one pillar at a time, animated between steps ───────── */}
          {stage === 'quiz' && (() => {
            const pillar = PILLARS[stepIndex]
            return (
              <div key={animKey} className="mfs-step-anim" style={{ textAlign:'left', maxWidth:560, margin:'0 auto' }}>

                {/* progress strip */}
                <div style={{ display:'flex', gap:'0.4rem', marginBottom:'2rem' }}>
                  {PILLARS.map((p, i) => (
                    <div key={p.key} style={{
                      flex:1, height:6, borderRadius:100,
                      background: i < stepIndex ? 'var(--sky)'
                        : i === stepIndex ? 'var(--sky)'
                        : 'var(--blue-pale)',
                      opacity: i === stepIndex ? 1 : i < stepIndex ? 0.55 : 1,
                      transition:'background 0.25s ease, opacity 0.25s ease',
                    }} />
                  ))}
                </div>

                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', fontWeight:700,
                  color:'var(--sky)', letterSpacing:'0.06em', textTransform:'uppercase',
                  marginBottom:'1rem' }}>
                  {lang==='NP'
                    ? `प्रश्न ${stepIndex + 1} / ${PILLARS.length}`
                    : `Question ${stepIndex + 1} of ${PILLARS.length}`}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:'0.9rem', marginBottom:'0.9rem' }}>
                  <div style={{
                    width:46, height:46, borderRadius:12, background:pillar.tint,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1.3rem', flexShrink:0,
                  }}>
                    {pillar.icon}
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700,
                    fontSize:'1.3rem', color:'var(--text-dark)' }}>
                    {lang==='NP' ? pillar.labelNP : pillar.label}
                  </div>
                </div>

                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.96rem',
                  color:'var(--text-mid)', lineHeight:1.6, margin:'0 0 1.75rem' }}>
                  {lang==='NP' ? pillar.descNP : pillar.desc}
                </p>

                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  {pillar.levels.map((lvl, idx) => (
                    <button
                      key={idx}
                      className="mfs-level-btn mfs-fade-up"
                      onClick={() => selectLevel(pillar.key, idx)}
                      style={{
                        display:'flex', alignItems:'center', gap:'0.85rem',
                        textAlign:'left', width:'100%',
                        padding:'0.9rem 1.1rem', borderRadius:'var(--radius-md)',
                        border: answers[pillar.key] === idx
                          ? `1.5px solid ${pillar.fg}` : '1.5px solid var(--blue-pale)',
                        background: answers[pillar.key] === idx ? pillar.tint : 'var(--white)',
                        fontFamily:'var(--font-body)', fontSize:'0.94rem', fontWeight:600,
                        color:'var(--text-dark)', cursor:'pointer',
                        animationDelay: `${idx * 45}ms`,
                      }}
                    >
                      <span style={{
                        width:24, height:24, borderRadius:'50%', flexShrink:0,
                        border:`1.5px solid ${pillar.fg}`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'0.7rem', fontWeight:800, color:pillar.fg,
                        fontFamily:'var(--font-display)',
                      }}>
                        {idx + 1}
                      </span>
                      {lang==='NP' ? lvl.labelNP : lvl.label}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop:'1.5rem' }}>
                  {stepIndex > 0 ? (
                    <button
                      onClick={goBackStep}
                      style={{
                        background:'none', border:'none', cursor:'pointer',
                        fontFamily:'var(--font-body)', fontSize:'0.86rem', fontWeight:600,
                        color:'var(--text-light)', padding:'0.4rem 0',
                      }}
                    >
                      ← {lang==='NP' ? 'अघिल्लो' : 'Back'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setStage(null)}
                      style={{
                        background:'none', border:'none', cursor:'pointer',
                        fontFamily:'var(--font-body)', fontSize:'0.86rem', fontWeight:600,
                        color:'var(--text-light)', padding:'0.4rem 0',
                      }}
                    >
                      ← {lang==='NP' ? 'रद्द गर्नुहोस्' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            )
          })()}

          {/* ───────── RESULTS — pops in, ring draws in, cards stagger up ───────── */}
          {stage === 'results' && (
            <div className="mfs-pop-anim">
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', fontWeight:700,
                color:'var(--sky)', letterSpacing:'0.06em', textTransform:'uppercase',
                marginBottom:'1.1rem' }}>
                {lang==='NP' ? 'तपाईंको नतिजा' : 'Your result'}
              </div>

              <div style={{
                display:'inline-flex', alignItems:'center', gap:'1.75rem',
                background:GLASS.bg, backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
                border:GLASS.border,
                borderRadius:'var(--radius-lg)', padding:'1.4rem 2rem',
                boxShadow:GLASS.shadowHov,
                flexWrap:'wrap', justifyContent:'center', marginBottom:'2rem',
              }}>
                <div className="mfs-ring-anim" style={{ position:'relative', width:108, height:108, flexShrink:0 }}>
                  <svg viewBox="0 0 100 100" width="108" height="108">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="var(--blue-pale)" strokeWidth="10" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke={overallColor.fg} strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2*Math.PI*42*(overallPct/100)} ${2*Math.PI*42}`}
                      transform="rotate(-90 50 50)"
                      style={{ transition:'stroke-dasharray 0.9s cubic-bezier(.22,1,.36,1)' }} />
                  </svg>
                  <div style={{
                    position:'absolute', inset:0, display:'flex', flexDirection:'column',
                    alignItems:'center', justifyContent:'center',
                  }}>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:800,
                      fontSize:'1.55rem', color:'var(--text-dark)', lineHeight:1 }}>{overallPct}</span>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:'0.6rem',
                      color:'var(--text-light)', fontWeight:700, letterSpacing:'0.05em' }}>
                      {lang==='NP' ? '१००/' : '/ 100'}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign:'left' }}>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem',
                    color:'var(--text-light)', fontWeight:600, marginBottom:'0.2rem' }}>
                    {lang==='NP' ? 'आजको जाँच' : 'Today\u2019s check-in'}
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontWeight:700,
                    fontSize:'1.05rem', color:overallColor.fg }}>
                    {lang==='NP' ? overallLabel.np : overallLabel.en}
                  </div>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem',
                    color:'var(--text-mid)', marginTop:'0.15rem' }}>
                    {lang==='NP' ? 'छ आधारहरूको औसतमा आधारित' : 'Based on all six pillars'}
                  </div>
                </div>
              </div>

              {/* per-pillar breakdown — staggers up one card at a time */}
              <div style={{
                display:'grid', gap:'0.7rem',
                gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',
                textAlign:'left', marginBottom:'2rem',
              }}>
                {pillarScores.map((p, i) => {
                  const c = scoreColor(p.pct ?? 0)
                  return (
                    <div key={p.key} className="mfs-fade-up mfs-glass-card" style={{
                      background:GLASS.bg, backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
                      border:GLASS.border,
                      borderRadius:'var(--radius-md)', padding:'0.9rem 1rem',
                      display:'flex', alignItems:'center', gap:'0.75rem',
                      boxShadow:GLASS.shadow,
                      transition:'transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease, border 0.3s ease',
                      animationDelay: `${140 + i * 70}ms`,
                    }}>
                      <div style={{
                        width:36, height:36, borderRadius:10, background:p.tint,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'1.05rem', flexShrink:0,
                      }}>
                        {p.icon}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.84rem',
                          fontWeight:700, color:'var(--text-dark)' }}>
                          {lang==='NP' ? p.labelNP : p.label}
                        </div>
                        <div style={{
                          height:5, borderRadius:100, background:'var(--blue-pale)',
                          marginTop:'0.35rem', overflow:'hidden',
                        }}>
                          <div style={{
                            height:'100%', width:`${p.pct}%`, background:c.fg,
                            borderRadius:100, transition:'width 0.7s cubic-bezier(.22,1,.36,1)',
                            transitionDelay: `${140 + i * 70}ms`,
                          }} />
                        </div>
                      </div>
                      <div style={{ fontFamily:'var(--font-display)', fontWeight:800,
                        fontSize:'0.92rem', color:c.fg, flexShrink:0 }}>
                        {p.pct}%
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mfs-fade-up" style={{ display:'flex', gap:'0.85rem', justifyContent:'center', flexWrap:'wrap', animationDelay:'620ms' }}>
                <button className="btn btn-primary" onClick={() => go('/resources')}>
                  {lang==='NP' ? 'सुझावहरू हेर्नुहोस्' : 'See suggestions'} →
                </button>
                <button className="btn btn-outline" onClick={retake}>
                  {lang==='NP' ? 'फेरि जाँच गर्नुहोस्' : 'Retake check-in'}
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ───────────── SIX PILLARS ───────────── */}
      <section style={{ padding:'4rem 1.5rem', maxWidth:1080, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:'2.75rem' }}>
          <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', fontWeight:700,
            color:'var(--sky)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'0.6rem' }}>
            {lang==='NP' ? 'छ आधारहरू' : 'The six pillars'}
          </div>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800,
            fontSize:'clamp(1.5rem, 3vw, 2.1rem)', color:'var(--text-dark)', margin:'0 0 0.75rem' }}>
            {lang==='NP' ? 'हामी के मापन गर्छौं' : 'What we measure'}
          </h2>
          <p style={{ fontFamily:'var(--font-body)', color:'var(--text-mid)',
            maxWidth:560, margin:'0 auto', lineHeight:1.6, fontSize:'0.98rem' }}>
            {lang==='NP'
              ? 'तपाईंको स्कोर यी छ क्षेत्रहरूको सरल औसतबाट बनेको हो — कुनै पनि एउटा मात्र पूर्ण कथा होइन।'
              : 'Your score is built from a gentle read across six areas of daily life — no single one tells the whole story.'}
          </p>
        </div>

        <div style={{
          display:'grid', gap:'1.1rem',
          gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',
        }}>
          {PILLARS.map(p => (
            <div key={p.label} className="mfs-glass-card" style={{
              background:GLASS.bg, backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
              border:GLASS.border,
              borderRadius:'var(--radius-lg)', padding:'1.5rem',
              boxShadow:GLASS.shadow,
              transition:'transform 0.3s cubic-bezier(.22,1,.36,1), box-shadow 0.3s ease, background 0.3s ease, border 0.3s ease',
            }}>
              <div style={{
                width:46, height:46, borderRadius:12, background:p.tint,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.3rem', marginBottom:'1rem',
              }}>
                {p.icon}
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700,
                fontSize:'1.02rem', color:'var(--text-dark)', marginBottom:'0.4rem' }}>
                {lang==='NP' ? p.labelNP : p.label}
              </div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.86rem',
                color:'var(--text-light)', lineHeight:1.55 }}>
                {lang==='NP' ? p.descNP : p.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section style={{ padding:'4rem 1.5rem', background:'var(--white)',
        borderTop:'1px solid var(--blue-pale)', borderBottom:'1px solid var(--blue-pale)' }}>
        <div style={{ maxWidth:1000, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:'2.75rem' }}>
            <h2 style={{ fontFamily:'var(--font-display)', fontWeight:800,
              fontSize:'clamp(1.5rem, 3vw, 2.1rem)', color:'var(--text-dark)', margin:0 }}>
              {lang==='NP' ? 'यो कसरी काम गर्छ' : 'How it works'}
            </h2>
          </div>

          <div style={{ display:'grid', gap:'1.5rem',
            gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ textAlign:'left' }}>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:800,
                  fontSize:'1.6rem', color:'var(--sky-light)', WebkitTextStroke:'1px var(--sky)',
                  marginBottom:'0.85rem' }}>
                  {s.n}
                </div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700,
                  fontSize:'1.05rem', color:'var(--text-dark)', marginBottom:'0.5rem' }}>
                  {lang==='NP' ? s.titleNP : s.title}
                </div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem',
                  color:'var(--text-light)', lineHeight:1.6 }}>
                  {lang==='NP' ? s.descNP : s.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── REASSURANCE STRIP ───────────── */}
      <section style={{ padding:'2.75rem 1.5rem' }}>
        <div style={{
          maxWidth:760, margin:'0 auto', textAlign:'center',
          background:'var(--green-mist)', border:'1px solid var(--blue-pale)',
          borderRadius:'var(--radius-lg)', padding:'1.75rem 2rem',
        }}>
          <div style={{ fontSize:'1.4rem', marginBottom:'0.5rem' }}>🌿</div>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'0.92rem',
            color:'var(--green-deep)', fontWeight:600, lineHeight:1.6, margin:0 }}>
            {lang==='NP'
              ? 'यो स्कोर निदान होइन — यो केवल एउटा ऐना हो। यसले मात्र भन्छ कि सहयोग खोज्ने राम्रो समय कहिले हो।'
              : 'This score is not a diagnosis \u2014 it\u2019s a mirror. It only tells you when it might be a good time to reach out for support.'}
          </p>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      {stage === null && (
        <section style={{ padding:'3rem 1.5rem 5rem', textAlign:'center' }}>
          <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800,
            fontSize:'1.5rem', color:'var(--text-dark)', margin:'0 0 1rem' }}>
            {lang==='NP' ? 'आज आफ्नो प्रवृत्ति जाँच गर्नुहोस्' : 'Check your trend today'}
          </h3>
          <button className="btn btn-primary" onClick={startQuiz}>
            {lang==='NP' ? 'सुरु गर्नुहोस्' : 'Get Started'} →
          </button>
        </section>
      )}

    </div>
  )
}