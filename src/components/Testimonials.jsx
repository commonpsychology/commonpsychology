// src/components/Testimonials.jsx
import { useState, useEffect, useCallback } from 'react'

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
    <section className="section testimonials">
      <div className="section-header">
        <div>
          <span className="section-tag">Client Stories</span>
          <h2 className="section-title">Voices of <em>Healing</em></h2>
          <p className="section-desc">Real experiences from real people who took the first step toward better mental health.</p>
        </div>
      </div>

      <div className="slider-wrapper">
        <div className={`slider-card ${animating ? 'slider-fade-out' : 'slider-fade-in'}`}>
          <div className="testimonial-quote">"</div>
          <p className="testimonial-text">{t.text}</p>
          <div className="testimonial-author">
            <div className={`testimonial-avatar av${(active % 5) + 1}`}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'var(--green-mist)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontSize: '1rem',
                color: 'var(--green-deep)', fontWeight: 700,
              }}>
                {(t.name || 'A').split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
            </div>
            <div>
              <div className="testimonial-name">{t.name}</div>
              <div className="testimonial-detail">{t.detail}</div>
              <div className="testimonial-stars">{'★'.repeat(Math.min(5, Math.max(1, t.stars || 5)))}</div>
            </div>
          </div>
        </div>

        <div className="slider-controls">
          <button className="slider-btn" onClick={prev} aria-label="Previous">‹</button>
          <div className="slider-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`slider-dot ${i === active ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
          <button className="slider-btn" onClick={next} aria-label="Next">›</button>
        </div>
      </div>
    </section>
  )
}
