import { useRouter } from '../context/RouterContext'
import { TOKENS, sectionGradientCSS } from '../styles/oceanTheme'

function IllustrationWorksheet() {
  return (
    <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
      <rect width="56" height="56" rx="12" fill="#e6f2f8"/>
      <rect x="14" y="10" width="28" height="36" rx="4" fill="white" stroke="#b0d4e8" strokeWidth="1.5"/>
      <rect x="18" y="16" width="20" height="2.5" rx="1.25" fill="#5b9ab5"/>
      <rect x="18" y="21" width="16" height="2" rx="1" fill="#b0d4e8"/>
      <rect x="18" y="26" width="18" height="2" rx="1" fill="#b0d4e8"/>
      <rect x="18" y="31" width="12" height="2" rx="1" fill="#b0d4e8"/>
      <rect x="18" y="36" width="14" height="2" rx="1" fill="#b0d4e8"/>
      <circle cx="42" cy="42" r="8" fill="#00BFFF"/>
      <path d="M38.5 42l2.5 2.5 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function IllustrationAudio() {
  return (
    <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
      <rect width="56" height="56" rx="12" fill="#e8f3ee"/>
      <circle cx="28" cy="26" r="12" fill="white" stroke="#b8d5c8" strokeWidth="1.5"/>
      <circle cx="28" cy="26" r="5" fill="#3d6b5a"/>
      <circle cx="28" cy="26" r="2" fill="white"/>
      {/* headphone arc */}
      <path d="M18 26a10 10 0 0 1 20 0" fill="none" stroke="#3d6b5a" strokeWidth="2" strokeLinecap="round"/>
      <rect x="16" y="24" width="4" height="7" rx="2" fill="#6a9e88"/>
      <rect x="36" y="24" width="4" height="7" rx="2" fill="#6a9e88"/>
      {/* sound waves */}
      <path d="M10 38 Q12 36 10 34" fill="none" stroke="#6a9e88" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7 40 Q11 36 7 32" fill="none" stroke="#b8d5c8" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M46 38 Q44 36 46 34" fill="none" stroke="#6a9e88" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M49 40 Q45 36 49 32" fill="none" stroke="#b8d5c8" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function IllustrationEbook() {
  return (
    <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
      <rect width="56" height="56" rx="12" fill="#f5ede0"/>
      {/* book body */}
      <rect x="10" y="10" width="24" height="36" rx="3" fill="#a67c5b"/>
      <rect x="12" y="10" width="4" height="36" rx="2" fill="#6b4f35"/>
      {/* pages */}
      <rect x="16" y="12" width="16" height="32" rx="2" fill="white"/>
      <rect x="18" y="17" width="12" height="1.8" rx="0.9" fill="#d4b896"/>
      <rect x="18" y="21" width="10" height="1.5" rx="0.75" fill="#f5ede0"/>
      <rect x="18" y="25" width="11" height="1.5" rx="0.75" fill="#f5ede0"/>
      <rect x="18" y="29" width="8" height="1.5" rx="0.75" fill="#f5ede0"/>
      {/* heart */}
      <path d="M22 34 C22 32.5, 20 32, 20 33.5 C20 35 22 36.5 22 36.5 C22 36.5 24 35 24 33.5 C24 32 22 32.5 22 34Z" fill="#e07a5f"/>
      {/* bookmark */}
      <polygon points="36,10 44,10 44,30 40,26 36,30" fill="#00BFFF"/>
    </svg>
  )
}

function IllustrationMoodTracker() {
  return (
    <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
      <rect width="56" height="56" rx="12" fill="#e0f7ff"/>
      {/* calendar grid */}
      <rect x="8" y="12" width="40" height="34" rx="4" fill="white" stroke="#b0d4e8" strokeWidth="1.5"/>
      <rect x="8" y="12" width="40" height="9" rx="4" fill="#00BFFF"/>
      <rect x="8" y="17" width="40" height="4" fill="#009FD4"/>
      {/* calendar header dots */}
      <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.7"/>
      <circle cx="40" cy="16" r="2.5" fill="white" opacity="0.7"/>
      {/* mood dots */}
      <circle cx="17" cy="29" r="3.5" fill="#81c784"/>
      <circle cx="25" cy="29" r="3.5" fill="#81c784"/>
      <circle cx="33" cy="29" r="3.5" fill="#ffb74d"/>
      <circle cx="41" cy="29" r="3.5" fill="#e57373"/>
      <circle cx="17" cy="38" r="3.5" fill="#ffb74d"/>
      <circle cx="25" cy="38" r="3.5" fill="#81c784"/>
      <circle cx="33" cy="38" r="3.5" fill="#81c784"/>
      <circle cx="41" cy="38" r="3.5" fill="#64b5f6"/>
    </svg>
  )
}

const resources = [
  {
    type: 'Worksheet',
    illustration: <IllustrationWorksheet />,
    title: 'Anxiety Management Worksheet',
    desc: 'Practical CBT exercises to manage anxious thoughts.',
    downloads: '1.2k downloads',
    free: true,
    route: '/resources',
  },
  {
    type: 'Audio',
    illustration: <IllustrationAudio />,
    title: 'Guided Meditation — 10 min',
    desc: 'Calm your mind with this Nepali-language guided session.',
    downloads: '890 listens',
    free: true,
    route: '/resources',
  },
  {
    type: 'eBook',
    illustration: <IllustrationEbook />,
    title: 'Understanding Depression',
    desc: 'A compassionate guide to understanding and living with depression.',
    downloads: '650 downloads',
    free: false,
    route: '/store',
  },
  {
    type: 'Tool',
    illustration: <IllustrationMoodTracker />,
    title: 'Mood Tracker Template',
    desc: 'Daily mood logging template for consistent mental health tracking.',
    downloads: '2.1k uses',
    free: true,
    route: '/resources',
  },
]

export default function Resources() {
  const { navigate } = useRouter()

  return (
    <section className="rs-section" id="resources">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700&display=swap');
        ${sectionGradientCSS('rs-section')}

        .rs-section { padding: 3.5rem 1.5rem 4rem; }
        .rs-inner { position: relative; z-index: 1; max-width: 1120px; margin: 0 auto; }

        .rs-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap;
        }
        .rs-eyebrow {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.25rem 0.75rem; margin-bottom: 0.7rem;
          border: 1.5px solid ${TOKENS.bluePale}; border-radius: 100px;
          font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #0f3460; background: ${TOKENS.skyLight};
        }
        .rs-title {
          font-family: 'Fraunces', serif; font-weight: 800;
          font-size: clamp(1.5rem, 3vw, 2.05rem); line-height: 1.2;
          color: ${TOKENS.oceanInk}; margin: 0 0 0.4rem;
        }
        .rs-title em { font-style: italic; color: ${TOKENS.oceanBright}; }
        .rs-desc { font-family: 'Inter', sans-serif; font-size: 0.9rem; color: ${TOKENS.dim}; line-height: 1.55; margin: 0; max-width: 480px; }

        .rs-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.85rem;
          padding: 0.65rem 1.3rem; border-radius: 100px; cursor: pointer;
          background: ${TOKENS.white}; color: ${TOKENS.oceanDeep};
          border: 1.5px solid ${TOKENS.bluePale};
          transition: all 0.2s ease; white-space: nowrap;
        }
        .rs-btn:hover { background: ${TOKENS.skyLight}; border-color: ${TOKENS.oceanBright}; }

        .rs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.25rem; }
        .rs-card {
          background: ${TOKENS.white};
          border: 1px solid ${TOKENS.bluePale};
          border-radius: 16px;
          padding: 1.4rem 1.3rem;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(15,52,96,0.06);
          transition: all 0.25s;
        }
        .rs-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,88,128,0.14); }
        .rs-type {
          display: inline-block; font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 800;
          letter-spacing: 0.08em; text-transform: uppercase; color: ${TOKENS.oceanDeep};
          background: ${TOKENS.skyLight}; padding: 3px 9px; border-radius: 100px; margin-bottom: 0.9rem;
        }
        .rs-illustration { margin-bottom: 0.9rem; }
        .rs-card h4 { font-family: 'Fraunces', serif; font-size: 1rem; color: ${TOKENS.oceanInk}; margin: 0 0 0.4rem; line-height: 1.3; }
        .rs-card p { font-family: 'Inter', sans-serif; font-size: 0.82rem; color: ${TOKENS.dim}; line-height: 1.55; margin: 0 0 1rem; }
        .rs-meta { display: flex; align-items: center; justify-content: space-between; font-family: 'Inter', sans-serif; font-size: 0.75rem; color: ${TOKENS.dim}; }
        .rs-free { font-weight: 800; color: ${TOKENS.oceanBright}; }

        @media (max-width: 900px) { .rs-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) {
          .rs-grid { grid-template-columns: 1fr; }
          .rs-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="rs-inner">
        <div className="rs-header">
          <div>
            <span className="rs-eyebrow">🧰 Free Resources</span>
            <h2 className="rs-title">Tools to Support Your <em>Everyday</em> Wellness</h2>
            <p className="rs-desc">Download worksheets, guided audios, eBooks, and trackers — curated by our clinical team.</p>
          </div>
          <button className="rs-btn" onClick={() => navigate('/resources')}>View All Resources</button>
        </div>

        <div className="rs-grid">
          {resources.map((r, i) => (
            <div className="rs-card" key={i} onClick={() => navigate(r.route)}>
              <span className="rs-type">{r.type}</span>
              <div className="rs-illustration">{r.illustration}</div>
              <h4>{r.title}</h4>
              <p>{r.desc}</p>
              <div className="rs-meta">
                <span>{r.downloads}</span>
                <span className={r.free ? 'rs-free' : ''}>{r.free ? 'FREE' : 'Premium'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}