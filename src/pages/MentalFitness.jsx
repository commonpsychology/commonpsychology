import { useLang } from '../context/LanguageContext'

/* ─────────────────────────────────────────────────────────────
   MENTAL FITNESS SCORE — static landing page
   Visual language matched to Navbar.jsx:
     fonts   var(--font-display) / var(--font-body)
     colors  var(--sky) var(--sky-light) var(--green-deep)
             var(--green-mist) var(--blue-pale) var(--blue-mist)
             var(--text-dark) var(--text-mid) var(--text-light)
             var(--white) var(--off-white)
     shape   var(--radius-md) var(--radius-lg), pill buttons,
             icon-in-rounded-square swatches, soft drop shadows
───────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    icon: '🌊',
    label: 'Emotional Regulation',
    labelNP: 'भावनात्मक नियमन',
    desc: 'How steady you feel when things get hard, and how quickly you find your footing again.',
    descNP: 'कठिन परिस्थितिमा तपाईं कत्तिको स्थिर रहनुहुन्छ र फेरि सन्तुलनमा फर्किनुहुन्छ।',
    tint: 'var(--sky-light)',
    fg: 'var(--sky)',
  },
  {
    icon: '🌙',
    label: 'Sleep',
    labelNP: 'निद्रा',
    desc: 'The quality and consistency of your rest — the quiet foundation everything else sits on.',
    descNP: 'तपाईंको निद्राको गुणस्तर र नियमितता — बाँकी सबैको जग।',
    tint: 'var(--blue-mist)',
    fg: '#1565c0',
  },
  {
    icon: '🔥',
    label: 'Stress',
    labelNP: 'तनाव',
    desc: 'How much pressure you\u2019re carrying day to day, and how well you\u2019re able to set it down.',
    descNP: 'दैनिक रूपमा तपाईंले कति दबाब बोकिरहनुभएको छ र त्यसलाई कत्तिको राम्रोसँग छोड्न सक्नुहुन्छ।',
    tint: '#fde8e3',
    fg: '#c0533f',
  },
  {
    icon: '🤝',
    label: 'Relationships',
    labelNP: 'सम्बन्धहरू',
    desc: 'The warmth, honesty, and support flowing between you and the people closest to you.',
    descNP: 'तपाईं र तपाईंको नजिकका मानिसहरू बीचको न्यानोपन र सहयोग।',
    tint: 'var(--green-mist)',
    fg: 'var(--green-deep)',
  },
  {
    icon: '🧭',
    label: 'Purpose',
    labelNP: 'उद्देश्य',
    desc: 'A sense of direction — knowing why your days matter, even on the ordinary ones.',
    descNP: 'दिशाको भावना — सामान्य दिनहरूमा पनि तपाईंको समय किन महत्त्वपूर्ण छ भनेर थाहा हुनु।',
    tint: '#f3e8fd',
    fg: '#7b3fc0',
  },
  {
    icon: '🌱',
    label: 'Habits',
    labelNP: 'बानीहरू',
    desc: 'The small daily routines that quietly compound into how well you function and feel.',
    descNP: 'साना दैनिक दिनचर्याहरू जसले बिस्तारै तपाईंको काम र भावनालाई असर गर्छ।',
    tint: '#fff7d6',
    fg: '#a67c00',
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

export default function MentalFitnessScore({ onNavigate }) {
  const { lang } = useLang ? useLang() : { lang: 'EN' }

  function go(path) {
    if (onNavigate) onNavigate(path)
  }

  return (
    <div style={{ background:'var(--off-white)' }}>

      {/* ───────────── HERO ───────────── */}
      <section style={{
        padding:'4.5rem 1.5rem 4rem',
        background:'linear-gradient(180deg, var(--sky-light) 0%, var(--off-white) 100%)',
        borderBottom:'1px solid var(--blue-pale)',
      }}>
        <div style={{ maxWidth:920, margin:'0 auto', textAlign:'center' }}>

          <div style={{
            display:'inline-flex', alignItems:'center', gap:'0.45rem',
            padding:'0.35rem 0.9rem', borderRadius:100,
            background:'var(--white)', border:'1.5px solid var(--blue-pale)',
            fontFamily:'var(--font-body)', fontSize:'0.72rem', fontWeight:700,
            color:'var(--green-deep)', letterSpacing:'0.04em',
            marginBottom:'1.5rem',
          }}>
            🧠 {lang==='NP' ? 'नयाँ उपकरण' : 'New tool'}
          </div>

          <h1 style={{
            fontFamily:'var(--font-display)', fontWeight:800,
            fontSize:'clamp(2.1rem, 5vw, 3.4rem)', lineHeight:1.08,
            color:'var(--text-dark)', margin:'0 0 1.1rem',
            letterSpacing:'-0.01em',
          }}>
            {lang==='NP' ? 'तपाईंको मानसिक फिटनेस स्कोर' : 'Your Mental Fitness Score'}
          </h1>

          <p style={{
            fontFamily:'var(--font-body)', fontSize:'1.08rem',
            color:'var(--text-mid)', maxWidth:600, margin:'0 auto 2.25rem',
            lineHeight:1.6,
          }}>
            {lang==='NP'
              ? 'यो कुनै चिकित्सा निदान होइन। यो तपाईंको दैनिक भावनात्मक स्वास्थ्यको सरल, सौम्य झलक हो — समयसँगै तपाईं कस्तो महसुस गर्दै हुनुहुन्छ भन्ने प्रवृत्ति।'
              : 'Not a medical score. Just a simple, honest read on how you\u2019re really doing — your psychological wellness trend, over time.'}
          </p>

          <div style={{ display:'flex', gap:'0.85rem', justifyContent:'center', flexWrap:'wrap' }}>
            <button className="btn btn-primary" onClick={() => go('/assessments')}>
              {lang==='NP' ? 'आफ्नो स्कोर हेर्नुहोस्' : 'Check My Score'} →
            </button>
            <button className="btn btn-outline" onClick={() => go('/resources')}>
              {lang==='NP' ? 'यो कसरी काम गर्छ' : 'How it works'}
            </button>
          </div>

          {/* simple static score dial */}
          <div style={{
            marginTop:'3.25rem', display:'inline-flex', alignItems:'center', gap:'1.75rem',
            background:'var(--white)', border:'1px solid var(--blue-pale)',
            borderRadius:'var(--radius-lg)', padding:'1.4rem 2rem',
            boxShadow:'0 20px 56px rgba(15,52,96,0.08)',
            flexWrap:'wrap', justifyContent:'center',
          }}>
            <div style={{ position:'relative', width:108, height:108, flexShrink:0 }}>
              <svg viewBox="0 0 100 100" width="108" height="108">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--blue-pale)" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--sky)" strokeWidth="10"
                  strokeLinecap="round" strokeDasharray={`${2*Math.PI*42*0.74} ${2*Math.PI*42}`}
                  transform="rotate(-90 50 50)" />
              </svg>
              <div style={{
                position:'absolute', inset:0, display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
              }}>
                <span style={{ fontFamily:'var(--font-display)', fontWeight:800,
                  fontSize:'1.55rem', color:'var(--text-dark)', lineHeight:1 }}>74</span>
                <span style={{ fontFamily:'var(--font-body)', fontSize:'0.6rem',
                  color:'var(--text-light)', fontWeight:700, letterSpacing:'0.05em' }}>
                  {lang==='NP' ? '१००/' : '/ 100'}
                </span>
              </div>
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem',
                color:'var(--text-light)', fontWeight:600, marginBottom:'0.2rem' }}>
                {lang==='NP' ? 'नमुना मात्र' : 'Sample only'}
              </div>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700,
                fontSize:'1.05rem', color:'var(--green-deep)' }}>
                {lang==='NP' ? 'स्थिर र सुधारिँदै' : 'Steady & improving'}
              </div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem',
                color:'var(--text-mid)', marginTop:'0.15rem' }}>
                {lang==='NP' ? 'गत ३० दिनको प्रवृत्तिमा आधारित' : 'Based on your last 30 days'}
              </div>
            </div>
          </div>

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
            <div key={p.label} style={{
              background:'var(--white)', border:'1px solid var(--blue-pale)',
              borderRadius:'var(--radius-lg)', padding:'1.5rem',
              boxShadow:'0 12px 32px rgba(15,52,96,0.05)',
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
      <section style={{ padding:'3rem 1.5rem 5rem', textAlign:'center' }}>
        <h3 style={{ fontFamily:'var(--font-display)', fontWeight:800,
          fontSize:'1.5rem', color:'var(--text-dark)', margin:'0 0 1rem' }}>
          {lang==='NP' ? 'आज आफ्नो प्रवृत्ति जाँच गर्नुहोस्' : 'Check your trend today'}
        </h3>
        <button className="btn btn-primary" onClick={() => go('/assessments')}>
          {lang==='NP' ? 'सुरु गर्नुहोस्' : 'Get Started'} →
        </button>
      </section>

    </div>
  )
}