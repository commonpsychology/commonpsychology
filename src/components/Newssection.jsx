import { useRouter } from '../context/RouterContext'
import { TOKENS, sectionGradientCSS } from '../styles/oceanTheme'

const NEWS_SOURCES = [
  { name: 'News',                  url: '/our-news',        icon: '📰', desc: 'Our Works and News' },
  { name: 'Psychology Today',      url: 'https://www.psychologytoday.com/us/basics',        icon: '🧠', desc: 'Latest in mental health & behavior' },
  { name: 'APA Monitor',           url: 'https://www.apa.org/monitor',                       icon: '📰', desc: 'American Psychological Association news' },
  { name: 'WHO Mental Health',     url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response', icon: '🌍', desc: 'Global mental health facts & updates' },
  { name: 'The Lancet Psychiatry', url: 'https://www.thelancet.com/journals/lanpsy/home',   icon: '🔬', desc: 'Peer-reviewed psychiatric research' },
  { name: 'MindSite News',         url: 'https://mindsites.substack.com',                    icon: '📡', desc: 'Mental health journalism & advocacy' },
]

// All four tags now draw from the same ocean-blue family (varying only in
// tint/weight) instead of mixing in green and cream accents, so the grid
// reads as one palette rather than four unrelated category colors.
const FEATURED_ARTICLES = [
  {
    tag: 'Global Research',
    title: 'WHO Reports 1 in 8 People Live with a Mental Disorder Globally',
    summary: 'The World Health Organization\'s latest report highlights the widening treatment gap, with low-income countries like Nepal facing the greatest burden and fewest resources.',
    source: 'WHO',
    date: 'Jan 2024',
    url: 'https://www.who.int/news/item/17-06-2022-who-highlights-urgent-need-to-transform-mental-health-and-mental-health-care',
    tagBg: TOKENS.oceanPale,
  },
  {
    tag: 'Nepal Focus',
    title: 'Nepal\'s Mental Health Gap: Less Than 1 Psychiatrist Per 100,000 People',
    summary: 'A national health survey reveals critical shortages in mental health professionals across Nepal\'s rural provinces, highlighting the need for digital-first care solutions.',
    source: 'Nepal Health Research Council',
    date: 'Mar 2024',
    url: 'https://nhrc.gov.np',
    tagBg: TOKENS.bluePale,
  },
  {
    tag: 'New Research',
    title: 'CBT via Video Call Found Equally Effective as In-Person Therapy',
    summary: 'A landmark RCT published in JAMA Psychiatry confirms telehealth CBT achieves equivalent outcomes to face-to-face sessions for depression and anxiety disorders.',
    source: 'JAMA Psychiatry',
    date: 'Feb 2024',
    url: 'https://jamanetwork.com/journals/jamapsychiatry',
    tagBg: TOKENS.skyLight,
  },
  {
    tag: 'Community',
    title: 'Post-Earthquake Mental Health in Nepal: A Decade of Recovery',
    summary: 'Longitudinal data from 2015 earthquake survivors reveals ongoing PTSD rates and the critical need for sustained community-based mental health programs.',
    source: 'Lancet Global Health',
    date: 'Apr 2024',
    url: 'https://www.thelancet.com',
    tagBg: TOKENS.mist,
  },
]

export default function NewsSection() {
  const { navigate } = useRouter()

  return (
    <section className="ns-section" id="news">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700&display=swap');
        ${sectionGradientCSS('ns-section')}

        .ns-section { padding: 3.5rem 1.5rem 4rem; }
        .ns-inner { position: relative; z-index: 1; max-width: 1120px; margin: 0 auto; }

        .ns-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap;
        }
        .ns-eyebrow {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.25rem 0.75rem; margin-bottom: 0.7rem;
          border: 1.5px solid ${TOKENS.bluePale}; border-radius: 100px;
          font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #0f3460; background: ${TOKENS.skyLight};
        }
        .ns-title {
          font-family: 'Fraunces', serif; font-weight: 800;
          font-size: clamp(1.5rem, 3vw, 2.05rem); line-height: 1.2;
          color: ${TOKENS.oceanInk}; margin: 0 0 0.4rem;
        }
        .ns-title em { font-style: italic; color: ${TOKENS.oceanBright}; }
        .ns-desc { font-family: 'Inter', sans-serif; font-size: 0.9rem; color: ${TOKENS.dim}; line-height: 1.55; margin: 0; max-width: 480px; }

        .ns-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.85rem;
          padding: 0.65rem 1.3rem; border-radius: 100px; cursor: pointer;
          background: ${TOKENS.white}; color: ${TOKENS.oceanDeep};
          border: 1.5px solid ${TOKENS.bluePale};
          transition: all 0.2s ease; white-space: nowrap;
        }
        .ns-btn:hover { background: ${TOKENS.skyLight}; border-color: ${TOKENS.oceanBright}; }

        .ns-articles-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-bottom: 2.5rem; }
        .ns-article-card {
          background: ${TOKENS.white};
          border-radius: 16px;
          padding: 1.5rem;
          border: 1px solid ${TOKENS.bluePale};
          text-decoration: none;
          display: block;
          transition: all 0.25s;
          box-shadow: 0 4px 16px rgba(15,52,96,0.06);
        }
        .ns-article-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,88,128,0.14); }
        .ns-tag {
          font-size: 0.68rem; font-weight: 800; padding: 3px 9px;
          border-radius: 100px; color: ${TOKENS.oceanDeep};
          text-transform: uppercase; letter-spacing: 0.08em;
          font-family: 'Inter', sans-serif; white-space: nowrap;
        }
        .ns-meta { font-family: 'Inter', sans-serif; font-size: 0.72rem; color: ${TOKENS.dim}; }
        .ns-article-title { font-family: 'Fraunces', serif; font-size: clamp(0.9rem, 2.5vw, 1rem); color: ${TOKENS.oceanInk}; line-height: 1.35; margin: 0.6rem 0; }
        .ns-summary { font-family: 'Inter', sans-serif; font-size: 0.82rem; color: ${TOKENS.dim}; line-height: 1.65; margin: 0; }
        .ns-read-more { margin-top: 0.75rem; font-family: 'Inter', sans-serif; font-size: 0.78rem; font-weight: 700; color: ${TOKENS.oceanBright}; }

        .ns-sources-card { background: ${TOKENS.white}; border-radius: 16px; padding: clamp(1rem, 3vw, 1.5rem); border: 1px solid ${TOKENS.bluePale}; }
        .ns-sources-label {
          font-family: 'Inter', sans-serif; font-size: 0.72rem; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase; color: ${TOKENS.dim};
          margin-bottom: 1rem;
        }
        .ns-sources-row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .ns-source-pill {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; border: 1.5px solid ${TOKENS.bluePale}; border-radius: 100px;
          background: ${TOKENS.mist}; text-decoration: none; transition: all 0.2s;
          max-width: 100%; box-sizing: border-box;
        }
        .ns-source-pill:hover { background: ${TOKENS.skyLight}; border-color: ${TOKENS.oceanBright}; }
        .ns-source-pill-label {
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          font-family: 'Inter', sans-serif; font-size: 0.8rem; font-weight: 600; color: ${TOKENS.oceanDeep};
        }

        @media (max-width: 768px) {
          .ns-articles-grid { grid-template-columns: 1fr; gap: 1rem; margin-bottom: 1.75rem; }
          .ns-article-card { padding: 1.1rem 1rem; }
          .ns-header { flex-direction: column; align-items: flex-start; gap: 0.75rem; margin-bottom: 1.25rem; }
          .ns-sources-row { gap: 0.5rem; }
          .ns-source-pill { padding: 0.42rem 0.85rem; }
        }
        @media (max-width: 480px) {
          .ns-sources-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
          .ns-source-pill { justify-content: center; padding: 0.5rem 0.6rem; min-width: 0; }
          .ns-source-pill-label { white-space: normal; font-size: 0.72rem; text-align: center; line-height: 1.3; }
        }
      `}</style>

      <div className="ns-inner">
        {/* Header */}
        <div className="ns-header">
          <div>
            <span className="ns-eyebrow">📰 Psychology News</span>
            <h2 className="ns-title">Stay Informed About <em>Mental Health</em></h2>
            <p className="ns-desc">Curated global psychology news, research, and updates relevant to Nepal and beyond.</p>
          </div>
          <button className="ns-btn" onClick={() => navigate('/blog')}>View Blog →</button>
        </div>

        {/* Featured articles grid */}
        <div className="ns-articles-grid">
          {FEATURED_ARTICLES.map((a, i) => (
            <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="ns-article-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span className="ns-tag" style={{ background: a.tagBg }}>{a.tag}</span>
                <span className="ns-meta">{a.source} · {a.date}</span>
              </div>
              <h3 className="ns-article-title">{a.title}</h3>
              <p className="ns-summary">{a.summary}</p>
              <div className="ns-read-more">Read full article →</div>
            </a>
          ))}
        </div>

        {/* News source links */}
        <div className="ns-sources-card">
          <div className="ns-sources-label">Follow World Psychology News</div>
          <div className="ns-sources-row">
            {NEWS_SOURCES.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target={src.url.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="ns-source-pill"
              >
                <span style={{ fontSize: '0.88rem' }}>{src.icon}</span>
                <span className="ns-source-pill-label">{src.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}