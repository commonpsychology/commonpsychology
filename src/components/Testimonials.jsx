// src/components/Testimonials.jsx
import { useState, useEffect, useCallback } from 'react'
import { TOKENS, sectionGradientCSS } from '../styles/oceanTheme'

const API = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const FALLBACK = [
  { text:"I was skeptical at first, but Common Psychology changed my life. My therapist helped me understand my anxiety in a way no one had before.", name:'Sita M.', detail:'Anxiety Management · 3 months', stars:5 },
  { text:"Finding a therapist who understood the cultural pressures I faced as a Nepali woman was so difficult — until I found Common Psychology.", name:'Bikram T.', detail:'Depression & Stress · 6 months', stars:5 },
  { text:"The online sessions made it so easy to get help without anyone knowing. I feel stronger and more confident than I have in years.", name:'Kamala R.', detail:'Relationship Counseling · 4 months', stars:5 },
  { text:"I never thought I'd be able to talk about my trauma. The compassionate approach here made it possible.", name:'Arjun K.', detail:'Trauma Recovery · 8 months', stars:5 },
  { text:"As a working mother, I struggled to find time for myself. Common Psychology's flexible scheduling made mental health care finally accessible.", name:'Nisha G.', detail:'Grief Counseling · 5 months', stars:5 },
]

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState(FALLBACK)
  const [active, setActive]     = useState(0)
  const [animating, setAnimating] = useState(false)

  // Reset active index whenever testimonials array changes
  useEffect(() => { setActive(0) }, [testimonials])

  useEffect(() => {
    fetch(`${API}/reviews?approved=true&limit=5`)
      .then(r => r.json())
      .then(d => {
        if (!Array.isArray(d.reviews) || d.reviews.length === 0) return

        const mapped = d.reviews
          .map(r => ({
            text:   r.content || r.quote || null,
            name:   r.reviewer?.full_name || r.name || 'Anonymous',
            detail: r.therapist_name
              ? `Session with ${r.therapist_name}`
              : r.topic || 'Verified Client',
            stars:  r.rating || r.stars || 5,
          }))
          .filter(r => typeof r.text === 'string' && r.text.trim().length > 0)

        // Only replace FALLBACK if we got actual text-based reviews
        // Video-only reviews (no quote) will produce empty mapped → keep FALLBACK
        if (mapped.length > 0) setTestimonials(mapped)
      })
      .catch(() => {}) // silently keep FALLBACK on any network error
  }, [])

  const goTo = useCallback((idx) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => { setActive(idx); setAnimating(false) }, 300)
  }, [animating])

  const prev = () => goTo((active - 1 + testimonials.length) % testimonials.length)
  const next = () => goTo((active + 1) % testimonials.length)

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [active, testimonials.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // Triple-safe guard — t can never be undefined
  const t = testimonials[active] ?? testimonials[0] ?? FALLBACK[0]

  return (
    <section className="tm-section" id="testimonials">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700&display=swap');
        ${sectionGradientCSS('tm-section')}

        .tm-section { padding: 3.5rem 1.5rem 4rem; }
        .tm-inner { position: relative; z-index: 1; max-width: 760px; margin: 0 auto; }

        .tm-header { text-align: center; margin-bottom: 2.25rem; }
        .tm-eyebrow {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.25rem 0.75rem; margin-bottom: 0.7rem;
          border: 1.5px solid ${TOKENS.bluePale}; border-radius: 100px;
          font-family: 'Inter', sans-serif; font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #0f3460; background: ${TOKENS.skyLight};
        }
        .tm-title {
          font-family: 'Fraunces', serif; font-weight: 800;
          font-size: clamp(1.5rem, 3vw, 2.05rem); line-height: 1.2;
          color: ${TOKENS.oceanInk}; margin: 0 0 0.5rem;
        }
        .tm-title em { font-style: italic; color: ${TOKENS.oceanBright}; }
        .tm-desc {
          font-family: 'Inter', sans-serif; font-size: 0.9rem;
          color: ${TOKENS.dim}; line-height: 1.55; margin: 0 auto; max-width: 520px;
        }

        .tm-card {
          position: relative;
          background: ${TOKENS.white};
          border: 1px solid ${TOKENS.bluePale};
          border-radius: 20px;
          box-shadow: 0 4px 16px rgba(15,52,96,0.06);
          padding: 2.2rem 2rem 1.9rem;
          transition: opacity 0.3s ease;
        }
        .tm-card.is-animating { opacity: 0; }
        .tm-quote-mark {
          position: absolute; top: 14px; left: 22px;
          font-family: 'Fraunces', serif; font-size: 3.5rem;
          color: ${TOKENS.oceanPale}; line-height: 1; user-select: none;
        }
        .tm-text {
          position: relative; z-index: 1;
          font-family: 'Inter', sans-serif; font-size: 1.02rem;
          color: ${TOKENS.oceanInk}; line-height: 1.7; font-style: italic;
          margin: 0.5rem 0 1.6rem;
        }
        .tm-author { display: flex; align-items: center; gap: 0.85rem; }
        .tm-avatar {
          width: 44px; height: 44px; border-radius: 50%; flex-shrink: 0;
          background: ${TOKENS.oceanPale};
          display: flex; align-items: center; justify-content: center;
          font-family: 'Fraunces', serif; font-size: 1rem; font-weight: 700;
          color: ${TOKENS.oceanDeep};
          border: 1px solid ${TOKENS.bluePale};
        }
        .tm-name { font-family: 'Inter', sans-serif; font-size: 0.9rem; font-weight: 700; color: ${TOKENS.oceanDeep}; }
        .tm-detail { font-family: 'Inter', sans-serif; font-size: 0.76rem; color: ${TOKENS.dim}; margin-top: 1px; }
        .tm-stars { color: ${TOKENS.oceanBright}; font-size: 0.82rem; margin-top: 3px; letter-spacing: 1px; }

        .tm-controls { display: flex; align-items: center; justify-content: center; gap: 1rem; margin-top: 1.6rem; }
        .tm-arrow {
          width: 40px; height: 40px; border-radius: 50%;
          border: 2px solid ${TOKENS.bluePale}; background: ${TOKENS.white};
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem; color: ${TOKENS.oceanDeep}; cursor: pointer;
          transition: all 0.2s;
        }
        .tm-arrow:hover { background: ${TOKENS.oceanBright}; color: #fff; border-color: ${TOKENS.oceanBright}; }
        .tm-dots { display: flex; gap: 6px; }
        .tm-dot {
          border: none; padding: 0; cursor: pointer; border-radius: 4px; height: 8px;
          background: ${TOKENS.bluePale}; width: 8px;
          transition: all 0.25s ease;
        }
        .tm-dot.is-active { width: 24px; background: ${TOKENS.oceanBright}; }
      `}</style>

      <div className="tm-inner">
        <div className="tm-header">
          <span className="tm-eyebrow">💬 Client Stories</span>
          <h2 className="tm-title">Voices of <em>Healing</em></h2>
          <p className="tm-desc">Real experiences from real people who took the first step toward better mental health.</p>
        </div>

        <div className={`tm-card ${animating ? 'is-animating' : ''}`}>
          <div className="tm-quote-mark">"</div>
          <p className="tm-text">{t.text}</p>
          <div className="tm-author">
            <div className="tm-avatar">
              {(t.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div className="tm-name">{t.name}</div>
              <div className="tm-detail">{t.detail}</div>
              <div className="tm-stars">{'★'.repeat(Math.min(5, Math.max(1, t.stars || 5)))}</div>
            </div>
          </div>
        </div>

        <div className="tm-controls">
          <button className="tm-arrow" onClick={prev} aria-label="Previous">‹</button>
          <div className="tm-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`tm-dot ${i === active ? 'is-active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button className="tm-arrow" onClick={next} aria-label="Next">›</button>
        </div>
      </div>
    </section>
  )
}