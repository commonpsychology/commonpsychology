// src/components/DailyReturnHook.jsx
// Shown after poll closes — designed to pull users back daily
import { useState, useEffect, useRef } from 'react'

// ── Daily affirmations rotate every visit ────────────────────
const AFFIRMATIONS = [
  { text: "You are not your worst day.", author: "— Common Psychology" },
  { text: "Healing isn't linear. Every step counts.", author: "— Our therapists" },
  { text: "Asking for help is the bravest thing.", author: "— Always" },
  { text: "Your mind deserves the same care as your body.", author: "— Common Psychology" },
  { text: "Small progress is still progress.", author: "— Remember this" },
  { text: "You've survived every hard day so far.", author: "— That matters" },
  { text: "Rest is not laziness. It is medicine.", author: "— Common Psychology" },
]

// ── Micro-habits — tiny wins that feel achievable ────────────
const HABITS = [
  { icon: "🌬️", label: "60-sec breath reset", time: "1 min", color: "#e0f2fe", accent: "#0284c7" },
  { icon: "📓", label: "Write 3 grateful things", time: "2 min", color: "#e8f8f0", accent: "#1a7a4a" },
  { icon: "🚶", label: "Walk outside barefoot", time: "5 min", color: "#fff5e6", accent: "#b45309" },
  { icon: "💧", label: "Drink a full glass of water", time: "30 sec", color: "#f0f0ff", accent: "#4338ca" },
  { icon: "📵", label: "Phone-free 10 minutes", time: "10 min", color: "#fdf0f8", accent: "#9d174d" },
  { icon: "🤲", label: "Name one emotion you feel", time: "1 min", color: "#f0fdf4", accent: "#166534" },
]

// ── Streak tracker ────────────────────────────────────────────
let _sessionStreak = null

function useStreak() {
  const [streak, setStreak] = useState(0)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (_sessionStreak !== null) {
      setStreak(_sessionStreak)
      setChecked(true)
      return
    }

    try {
      const last = localStorage.getItem('ps_last_visit')
      const s    = parseInt(localStorage.getItem('ps_streak') || '0')
      const today = new Date().toDateString()
      const yesterday = new Date(Date.now() - 86400000).toDateString()

      let newStreak
      if (last === today) {
        newStreak = s
        setChecked(true)
      } else if (last === yesterday) {
        newStreak = s + 1
        localStorage.setItem('ps_streak', newStreak)
        localStorage.setItem('ps_last_visit', today)
      } else {
        newStreak = 1
        localStorage.setItem('ps_streak', '1')
        localStorage.setItem('ps_last_visit', today)
      }

      _sessionStreak = newStreak
      setStreak(newStreak)
    } catch {
      _sessionStreak = 1
      setStreak(1)
    }
  }, [])

  function checkIn() { setChecked(true) }

  return { streak, checked, checkIn }
}

// ── Mood pulse ────────────────────────────────────────────────
const MOODS = [
  { emoji: "😔", label: "Low",     val: 1 },
  { emoji: "😐", label: "Okay",    val: 2 },
  { emoji: "🙂", label: "Good",    val: 3 },
  { emoji: "😊", label: "Great",   val: 4 },
  { emoji: "🤩", label: "Amazing", val: 5 },
]

const MOOD_MESSAGES = [
  "That takes courage to admit. We're here. 💙",
  "Okay is enough. You showed up today.",
  "Good days matter. Soak it in. 🌿",
  "That energy is contagious. Keep going! ✨",
  "Incredible! Share that light with someone today. 🌟",
]

export default function DailyReturnHook({ visible = true }) {
  const { streak, checked, checkIn } = useStreak()
  const [selectedMood, setSelectedMood]     = useState(null)
  const [completedHabit, setCompletedHabit] = useState(null)
  const [affirmIdx]  = useState(() => new Date().getDate() % AFFIRMATIONS.length)
  const [habitIdx]   = useState(() => new Date().getDate() % HABITS.length)
  const [hasAnimated, setHasAnimated]       = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight) {
      const raf = requestAnimationFrame(() => setHasAnimated(true))
      return () => cancelAnimationFrame(raf)
    }

    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHasAnimated(true) },
      { threshold: 0.10 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  function handleMood(mood) {
    setSelectedMood(mood)
    checkIn()
    try { localStorage.setItem('ps_last_mood', mood.val) } catch {}
  }

  function handleHabit(idx) {
    setCompletedHabit(idx)
    checkIn()
  }

  if (!visible) return null

  const affirmation = AFFIRMATIONS[affirmIdx]
  const todayHabit  = HABITS[habitIdx]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        .drh-root {
          background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 45%, #ffffff 100%);
          padding: clamp(3rem, 6vw, 5rem) clamp(1rem, 5vw, 2rem);
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .drh-root::before {
          content: '';
          position: absolute;
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .drh-root::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(186,230,253,0.18) 0%, transparent 70%);
          pointer-events: none;
        }

        .drh-wrap {
          max-width: 1100px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Header ── */
        .drh-header {
          text-align: center;
          margin-bottom: clamp(2rem, 4vw, 3.5rem);
        }
        .drh-eyebrow {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #0284c7;
          margin-bottom: 0.65rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .drh-eyebrow::before, .drh-eyebrow::after {
          content: '';
          display: block;
          width: 30px; height: 1px;
          background: #0284c7;
          opacity: 0.4;
        }
        .drh-title {
          font-family: 'Lora', serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          color: #0c4a6e;
          font-weight: 600;
          line-height: 1.25;
          margin: 0 0 0.75rem;
        }
        .drh-title em {
          font-style: italic;
          color: #0284c7;
        }
        .drh-subtitle {
          font-size: 0.95rem;
          color: #4a7a9b;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Streak ── */
        .drh-streak {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: clamp(2rem, 4vw, 3rem);
          flex-wrap: wrap;
        }
        .drh-streak-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #fff8e6, #fff3cc);
          border: 1.5px solid #f5c842;
          border-radius: 100px;
          padding: 0.5rem 1.1rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #92400e;
          box-shadow: 0 2px 12px rgba(245,200,66,0.2);
        }
        .drh-streak-num {
          font-family: 'Lora', serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: #b45309;
        }

        /* ── Grid ── */
        .drh-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto auto;
          gap: 1.25rem;
        }
        @media (max-width: 768px) {
          .drh-grid { grid-template-columns: 1fr; }
        }

        /* ── Cards ── */
        .drh-card {
          background: linear-gradient(145deg, #ffffff, #f0f9ff);
          border-radius: 20px;
          padding: 2rem;
          border: 1.5px solid #bae6fd;
          box-shadow: 0 4px 24px rgba(186,230,253,0.35);
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.55s ease, transform 0.55s ease, box-shadow 0.2s ease;
        }
        .drh-card.animated {
          opacity: 1;
          transform: translateY(0);
        }
        .drh-card:hover {
          box-shadow: 0 8px 32px rgba(56,189,248,0.18);
        }
        .drh-card:nth-child(1) { transition-delay: 0.05s; }
        .drh-card:nth-child(2) { transition-delay: 0.15s; }
        .drh-card:nth-child(3) { transition-delay: 0.25s; }
        .drh-card:nth-child(4) { transition-delay: 0.35s; }

        .drh-card-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #7ec8e3;
          margin-bottom: 1rem;
        }

        /* ── Affirmation card ── */
        .drh-affirmation {
          background: linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%);
          color: white;
          grid-column: span 2;
          display: flex;
          align-items: center;
          gap: 2rem;
          padding: 2.5rem;
          position: relative;
          overflow: hidden;
          border: none;
        }
        @media (max-width: 768px) {
          .drh-affirmation { grid-column: span 1; flex-direction: column; gap: 1.25rem; }
        }
        .drh-affirmation::before {
          content: '"';
          position: absolute;
          top: -20px; left: 20px;
          font-family: 'Lora', serif;
          font-size: 12rem;
          color: rgba(255,255,255,0.05);
          line-height: 1;
          pointer-events: none;
        }
        .drh-affirmation-icon {
          font-size: 3rem;
          flex-shrink: 0;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15));
        }
        .drh-affirmation-text {
          font-family: 'Lora', serif;
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          font-style: italic;
          line-height: 1.55;
          color: rgba(255,255,255,0.95);
          flex: 1;
        }
        .drh-affirmation-author {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.5);
          margin-top: 0.6rem;
          font-style: normal;
          font-family: 'DM Sans', sans-serif;
        }
        .drh-day-badge {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 100px;
          padding: 0.3rem 0.9rem;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.7);
          margin-top: 0.75rem;
          display: inline-block;
        }

        /* ── Mood ── */
        .drh-mood-grid {
          display: flex;
          gap: 0.6rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }
        .drh-mood-btn {
          flex: 1;
          min-width: 52px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.3rem;
          padding: 0.75rem 0.4rem;
          border-radius: 14px;
          border: 2px solid #bae6fd;
          background: #f0f9ff;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .drh-mood-btn:hover {
          border-color: #0284c7;
          background: #e0f2fe;
          transform: translateY(-3px);
        }
        .drh-mood-btn.selected {
          border-color: #0284c7;
          background: #e0f2fe;
          box-shadow: 0 4px 16px rgba(2,132,199,0.18);
          transform: translateY(-3px) scale(1.05);
        }
        .drh-mood-emoji { font-size: 1.5rem; }
        .drh-mood-label { font-size: 0.62rem; font-weight: 600; color: #4a7a9b; }
        .drh-mood-response {
          margin-top: 1rem;
          padding: 0.85rem 1rem;
          background: linear-gradient(135deg, #e0f2fe, #f0f9ff);
          border-radius: 12px;
          font-size: 0.85rem;
          color: #0c4a6e;
          font-weight: 500;
          line-height: 1.5;
          border-left: 3px solid #0284c7;
          animation: fadeSlideIn 0.4s ease;
        }

        /* ── Habit ── */
        .drh-habit-today {
          border: 2px dashed #bae6fd;
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.22s ease;
          margin-top: 0.5rem;
          position: relative;
          overflow: hidden;
        }
        .drh-habit-today:hover {
          border-color: #0284c7;
          background: #f0f9ff;
          transform: translateX(4px);
        }
        .drh-habit-today.done {
          border-style: solid;
          border-color: #1a7a4a;
          background: #e8f8f0;
        }
        .drh-habit-icon-wrap {
          width: 52px; height: 52px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .drh-habit-name {
          font-weight: 600;
          color: #0c4a6e;
          font-size: 0.95rem;
          line-height: 1.3;
        }
        .drh-habit-time {
          font-size: 0.72rem;
          color: #4a7a9b;
          margin-top: 0.2rem;
          font-weight: 500;
        }
        .drh-habit-check {
          margin-left: auto;
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 2px solid #bae6fd;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.22s ease;
          font-size: 0.9rem;
        }
        .drh-habit-today.done .drh-habit-check {
          background: #1a7a4a;
          border-color: #1a7a4a;
          color: white;
        }
        .drh-habit-other {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.85rem;
        }
        .drh-habit-chip {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          background: #e0f2fe;
          border-radius: 100px;
          padding: 0.3rem 0.75rem;
          font-size: 0.75rem;
          color: #0369a1;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid #bae6fd;
          transition: all 0.15s ease;
        }
        .drh-habit-chip:hover {
          background: #bae6fd;
          border-color: #0284c7;
          color: #0c4a6e;
        }
        .drh-habit-chip.done {
          background: #e8f8f0;
          border-color: #1a7a4a;
          color: #1a7a4a;
        }

        /* ── Resource card ── */
        .drh-refresh-card {
          background: linear-gradient(145deg, #f0f9ff, #e0f2fe);
          border: 1.5px solid #bae6fd;
        }
        .drh-resource-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-top: 0.5rem;
        }
        .drh-resource-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #bae6fd;
          cursor: pointer;
          transition: all 0.18s ease;
          text-decoration: none;
        }
        .drh-resource-item:hover {
          border-color: #0284c7;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(2,132,199,0.12);
        }
        .drh-resource-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }
        .drh-resource-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0c4a6e;
          line-height: 1.3;
        }
        .drh-resource-sub {
          font-size: 0.72rem;
          color: #4a7a9b;
          margin-top: 1px;
        }
        .drh-resource-arrow {
          margin-left: auto;
          color: #7ec8e3;
          font-size: 0.9rem;
          flex-shrink: 0;
          transition: transform 0.18s;
        }
        .drh-resource-item:hover .drh-resource-arrow { transform: translateX(3px); }

        /* ── CTA ── */
        .drh-cta {
          text-align: center;
          margin-top: clamp(2rem, 4vw, 3rem);
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.5s ease 0.5s, transform 0.5s ease 0.5s;
        }
        .drh-cta.animated { opacity: 1; transform: translateY(0); }
        .drh-cta-text {
          font-family: 'Lora', serif;
          font-size: clamp(1rem, 2vw, 1.2rem);
          color: #0369a1;
          margin-bottom: 1.25rem;
          font-style: italic;
        }
        .drh-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #0c4a6e, #0284c7);
          color: white;
          border: none;
          border-radius: 100px;
          padding: 0.9rem 2rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(2,132,199,0.3);
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .drh-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(2,132,199,0.4);
        }
        .drh-notify-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 1.5px solid #bae6fd;
          border-radius: 100px;
          padding: 0.45rem 1rem;
          font-size: 0.78rem;
          color: #0369a1;
          font-weight: 500;
          margin-left: 0.75rem;
          cursor: pointer;
          transition: all 0.18s;
          vertical-align: middle;
        }
        .drh-notify-badge:hover { border-color: #0284c7; background: #e0f2fe; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%       { transform: scale(1.4); opacity: 0.7; }
        }
        .drh-live-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #22c55e;
          display: inline-block;
          animation: pulse-dot 1.8s ease infinite;
          flex-shrink: 0;
        }
      `}</style>

      <section className="drh-root" ref={ref}>
        <div className="drh-wrap">

          {/* Header */}
          <div className="drh-header">
            <div className="drh-eyebrow">
              <span className="drh-live-dot"/>
              Your daily mental wellness space
            </div>
            <h2 className="drh-title">
              Something small,<br/><em>every single day</em>
            </h2>
            <p className="drh-subtitle">
              The people who heal fastest aren't those who do the most — they're the ones who show up consistently. Start here, right now.
            </p>
          </div>

          {/* Streak */}
          <div className="drh-streak">
            <div className="drh-streak-pill">
              🔥 <span className="drh-streak-num">{streak}</span>
              {streak === 1 ? ' day' : ' day'} visit streak
            </div>
            {streak >= 3 && (
              <div className="drh-streak-pill" style={{ background: 'linear-gradient(135deg,#e8f8f0,#d1fae5)', borderColor:'#6ee7b7', color:'#065f46' }}>
                🌱 {streak >= 7 ? 'Week warrior!' : streak >= 5 ? 'Building momentum' : 'Great start!'}
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="drh-grid">

            {/* Card 1 — Affirmation */}
            <div className={`drh-card drh-affirmation ${hasAnimated ? 'animated' : ''}`}>
              <div className="drh-affirmation-icon">🌿</div>
              <div>
                <div className="drh-card-label" style={{ color:'rgba(255,255,255,0.4)' }}>Today's affirmation</div>
                <div className="drh-affirmation-text">
                  "{affirmation.text}"
                  <div className="drh-affirmation-author">{affirmation.author}</div>
                </div>
                <div className="drh-day-badge">
                  Changes daily · {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
                </div>
              </div>
            </div>

            {/* Card 2 — Mood */}
            <div className={`drh-card ${hasAnimated ? 'animated' : ''}`}>
              <div className="drh-card-label">How are you right now?</div>
              <div style={{ fontFamily:'Lora, serif', fontSize:'1.05rem', color:'#0c4a6e', marginBottom:'0.25rem', fontWeight:600 }}>
                One tap. No pressure.
              </div>
              <div style={{ fontSize:'0.8rem', color:'#4a7a9b', marginBottom:'1rem', lineHeight:1.5 }}>
                Tracking your mood, even briefly, rewires your brain toward self-awareness.
              </div>
              <div className="drh-mood-grid">
                {MOODS.map((m) => (
                  <button
                    key={m.val}
                    className={`drh-mood-btn ${selectedMood?.val === m.val ? 'selected' : ''}`}
                    onClick={() => handleMood(m)}
                  >
                    <span className="drh-mood-emoji">{m.emoji}</span>
                    <span className="drh-mood-label">{m.label}</span>
                  </button>
                ))}
              </div>
              {selectedMood && (
                <div className="drh-mood-response">
                  {selectedMood.emoji} {MOOD_MESSAGES[selectedMood.val - 1]}
                </div>
              )}
            </div>

            {/* Card 3 — Habit */}
            <div className={`drh-card ${hasAnimated ? 'animated' : ''}`}>
              <div className="drh-card-label">Today's micro-habit</div>
              <div style={{ fontFamily:'Lora, serif', fontSize:'1.05rem', color:'#0c4a6e', marginBottom:'0.25rem', fontWeight:600 }}>
                Just one tiny thing
              </div>
              <div style={{ fontSize:'0.8rem', color:'#4a7a9b', marginBottom:'1rem', lineHeight:1.5 }}>
                Tiny habits compound. Do this one thing and your brain logs a win.
              </div>

              <div
                className={`drh-habit-today ${completedHabit === 'main' ? 'done' : ''}`}
                onClick={() => handleHabit('main')}
                style={{ background: completedHabit === 'main' ? '' : todayHabit.color }}
              >
                <div className="drh-habit-icon-wrap" style={{ background: todayHabit.color }}>
                  {todayHabit.icon}
                </div>
                <div>
                  <div className="drh-habit-name">{todayHabit.label}</div>
                  <div className="drh-habit-time">⏱ {todayHabit.time}</div>
                </div>
                <div className="drh-habit-check">
                  {completedHabit === 'main' ? '✓' : ''}
                </div>
              </div>

              <div style={{ fontSize:'0.72rem', color:'#7ec8e3', margin:'0.85rem 0 0.4rem', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                Or try another
              </div>
              <div className="drh-habit-other">
                {HABITS.filter((_, i) => i !== habitIdx).slice(0, 3).map((h, i) => (
                  <div
                    key={i}
                    className={`drh-habit-chip ${completedHabit === i ? 'done' : ''}`}
                    onClick={() => handleHabit(i)}
                  >
                    {h.icon} {h.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4 — Resources */}
            <div className={`drh-card drh-refresh-card ${hasAnimated ? 'animated' : ''}`}>
              <div className="drh-card-label">Explore today</div>
              <div style={{ fontFamily:'Lora, serif', fontSize:'1.05rem', color:'#0c4a6e', marginBottom:'0.25rem', fontWeight:600 }}>
                New resources, always
              </div>
              <div style={{ fontSize:'0.8rem', color:'#4a7a9b', marginBottom:'1rem', lineHeight:1.5 }}>
                Something fresh for your mind. Updated weekly.
              </div>
              <div className="drh-resource-list">
                {[
                  { icon:'🧠', bg:'#e0f2fe', title:'5-Minute Mindfulness Reset', sub:'Guided · Audio', href:'/resources' },
                  { icon:'📖', bg:'#e0f2fe', title:'Understanding Anxiety', sub:'Article · 4 min read', href:'/resources' },
                  { icon:'🩺', bg:'#e0f2fe', title:'Talk to a therapist today', sub:'Book a free 15-min call', href:'/book' },
                ].map((r, i) => (
                  <a key={i} href={r.href} className="drh-resource-item">
                    <div className="drh-resource-icon" style={{ background: r.bg }}>{r.icon}</div>
                    <div>
                      <div className="drh-resource-title">{r.title}</div>
                      <div className="drh-resource-sub">{r.sub}</div>
                    </div>
                    <span className="drh-resource-arrow">→</span>
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* CTA */}
          <div className={`drh-cta ${hasAnimated ? 'animated' : ''}`}>
            <p className="drh-cta-text">
              "The best investment you'll ever make is in your mental health."
            </p>
            <a href="/book" className="drh-cta-btn">
              🩺 Book a free session
            </a>
            <button className="drh-notify-badge" onClick={() => {
              if ('Notification' in window) Notification.requestPermission()
            }}>
              🔔 Daily reminders
            </button>
          </div>

        </div>
      </section>
    </>
  )
}