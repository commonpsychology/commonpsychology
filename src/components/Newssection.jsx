import { useRouter } from '../context/RouterContext'

const NEWS_SOURCES = [
  { name: 'News',                  url: '/our-news',        icon: '📰', desc: 'Our Works and News' },
  { name: 'Psychology Today',      url: 'https://www.psychologytoday.com/us/basics',        icon: '🧠', desc: 'Latest in mental health & behavior' },
  { name: 'APA Monitor',           url: 'https://www.apa.org/monitor',                       icon: '📰', desc: 'American Psychological Association news' },
  { name: 'WHO Mental Health',     url: 'https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response', icon: '🌍', desc: 'Global mental health facts & updates' },
  { name: 'The Lancet Psychiatry', url: 'https://www.thelancet.com/journals/lanpsy/home',   icon: '🔬', desc: 'Peer-reviewed psychiatric research' },
  { name: 'MindSite News',         url: 'https://mindsites.substack.com',                    icon: '📡', desc: 'Mental health journalism & advocacy' },
]

const FEATURED_ARTICLES = [
  {
    tag: 'Global Research',
    title: 'WHO Reports 1 in 8 People Live with a Mental Disorder Globally',
    summary: 'The World Health Organization\'s latest report highlights the widening treatment gap, with low-income countries like Nepal facing the greatest burden and fewest resources.',
    source: 'WHO',
    date: 'Jan 2024',
    url: 'https://www.who.int/news/item/17-06-2022-who-highlights-urgent-need-to-transform-mental-health-and-mental-health-care',
    color: 'var(--blue-mist)',
  },
  {
    tag: 'Nepal Focus',
    title: 'Nepal\'s Mental Health Gap: Less Than 1 Psychiatrist Per 100,000 People',
    summary: 'A national health survey reveals critical shortages in mental health professionals across Nepal\'s rural provinces, highlighting the need for digital-first care solutions.',
    source: 'Nepal Health Research Council',
    date: 'Mar 2024',
    url: 'https://nhrc.gov.np',
    color: 'var(--green-mist)',
  },
  {
    tag: 'New Research',
    title: 'CBT via Video Call Found Equally Effective as In-Person Therapy',
    summary: 'A landmark RCT published in JAMA Psychiatry confirms telehealth CBT achieves equivalent outcomes to face-to-face sessions for depression and anxiety disorders.',
    source: 'JAMA Psychiatry',
    date: 'Feb 2024',
    url: 'https://jamanetwork.com/journals/jamapsychiatry',
    color: 'var(--earth-cream)',
  },
  {
    tag: 'Community',
    title: 'Post-Earthquake Mental Health in Nepal: A Decade of Recovery',
    summary: 'Longitudinal data from 2015 earthquake survivors reveals ongoing PTSD rates and the critical need for sustained community-based mental health programs.',
    source: 'Lancet Global Health',
    date: 'Apr 2024',
    url: 'https://www.thelancet.com',
    color: 'var(--sky-light)',
  },
]

const CSS = `
  .news-articles-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    margin-bottom: 2.5rem;
  }
  .news-article-card {
    background: var(--white);
    border-radius: var(--radius-lg);
    padding: 1.5rem;
    border: 1px solid var(--blue-pale);
    text-decoration: none;
    display: block;
    transition: all 0.25s;
    box-shadow: var(--shadow-soft);
  }
  .news-article-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-mid);
  }
  .news-sources-row {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .news-source-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: 1.5px solid var(--blue-pale);
    border-radius: 100px;
    background: var(--off-white);
    text-decoration: none;
    transition: all 0.2s;
  }
  .news-source-pill:hover {
    background: var(--sky-light);
    border-color: var(--sky);
  }
  .news-section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    gap: 1rem;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    .news-articles-grid {
      grid-template-columns: 1fr;
      gap: 1rem;
      margin-bottom: 1.75rem;
    }
    .news-article-card {
      padding: 1.1rem 1rem;
    }
    .news-section-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .news-sources-row {
      gap: 0.5rem;
    }
    .news-source-pill {
      padding: 0.42rem 0.85rem;
    }
  }

  @media (max-width: 480px) {
    .news-sources-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .news-source-pill {
      justify-content: center;
    }
  }
`

function injectNewsCSS() {
  if (document.getElementById('news-section-css')) return
  const s = document.createElement('style')
  s.id = 'news-section-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

import { useEffect } from 'react'

export default function NewsSection() {
  const { navigate } = useRouter()
  useEffect(() => { injectNewsCSS() }, [])

  return (
    <section className="section" id="news" style={{ background: 'var(--blue-mist)' }}>

      {/* Header */}
      <div className="news-section-header">
        <div>
          <span className="section-tag">Psychology News</span>
          <h2 className="section-title">Stay Informed About <em>Mental Health</em></h2>
          <p className="section-desc">Curated global psychology news, research, and updates relevant to Nepal and beyond.</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/blog')}>View Blog →</button>
      </div>

      {/* Featured articles grid */}
      <div className="news-articles-grid">
        {FEATURED_ARTICLES.map((a, i) => (
          <a
            key={i}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-article-card"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.68rem', fontWeight: 800, padding: '3px 9px',
                borderRadius: 100, background: a.color, color: 'var(--blue-deep)',
                textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)',
                whiteSpace: 'nowrap',
              }}>
                {a.tag}
              </span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'var(--text-light)' }}>
                {a.source} · {a.date}
              </span>
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
              color: 'var(--blue-deep)', lineHeight: 1.35, marginBottom: '0.6rem',
            }}>
              {a.title}
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.82rem',
              color: 'var(--text-light)', lineHeight: 1.65, margin: 0,
            }}>
              {a.summary}
            </p>
            <div style={{ marginTop: '0.75rem', fontFamily: 'var(--font-body)', fontSize: '0.78rem', fontWeight: 700, color: 'var(--sky)' }}>
              Read full article →
            </div>
          </a>
        ))}
      </div>

      {/* News source links */}
      <div style={{
        background: 'var(--white)', borderRadius: 'var(--radius-lg)',
        padding: 'clamp(1rem, 3vw, 1.5rem)', border: '1px solid var(--blue-pale)',
      }}>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: '0.72rem', fontWeight: 800,
          letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-light)',
          marginBottom: '1rem',
        }}>
          Follow World Psychology News
        </div>
        <div className="news-sources-row">
          {NEWS_SOURCES.map((src, i) => (
            <a
              key={i}
              href={src.url}
              target={src.url.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="news-source-pill"
            >
              <span style={{ fontSize: '0.88rem' }}>{src.icon}</span>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                fontWeight: 600, color: 'var(--blue-deep)', whiteSpace: 'nowrap',
              }}>
                {src.name}
              </span>
            </a>
          ))}
        </div>
      </div>

    </section>
  )
}