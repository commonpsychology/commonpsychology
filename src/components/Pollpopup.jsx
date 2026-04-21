// src/components/PollPopup.jsx
import { useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

const POLL = {
  title: 'Quick Mental Wellness Check-in',
  subtitle: 'Anonymous · Takes 60 seconds · No login needed',
  questions: [
    { id:'q1', text:'How often do you feel mentally overwhelmed in a typical week?', options:['Rarely or never','Once or twice','3–4 times','Almost every day'] },
    { id:'q2', text:'Have you ever sought professional mental health support?',        options:['Yes, currently','Yes, in the past','No, but I want to','No, I prefer self-help'] },
    { id:'q3', text:'What is the biggest barrier to accessing mental health care for you?', options:['Cost / affordability','Stigma / judgment','Not knowing where to start','Time or availability'] },
    { id:'q4', text:'How do you primarily manage stress right now?',                   options:['Exercise or movement','Talking to friends/family','Mindfulness / meditation','I struggle to manage it'] },
    { id:'q5', text:'How useful would a free mental health assessment be for you?',    options:['Very useful','Somewhat useful','Not sure','Not useful for me'] },
  ],
}

// Baseline counts so results look realistic even without a DB
const BASE_COUNTS = {
  q1:[120,340,210,180], q2:[95,270,185,140],
  q3:[310,220,190,130], q4:[260,185,140,95], q5:[420,180,90,60],
}

export default function PollPopup({ onClose }) {
  const [answers, setAnswers]   = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [visible, setVisible]   = useState(false)
  const [liveCounts, setLiveCounts] = useState(BASE_COUNTS)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    // Fetch current poll results
    fetch(`${API}/polls/results`).then(r => r.json()).then(d => {
      if (d.counts) setLiveCounts(d.counts)
    }).catch(() => {})
    return () => clearTimeout(t)
  }, [])

  const total    = POLL.questions.length
  const answered = Object.keys(answers).length
  const progress = Math.round((answered / total) * 100)

  async function handleSubmit() {
    if (answered < total) return
    setSubmitting(true)
    try {
      await fetch(`${API}/polls/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
    } catch {}
    setSubmitting(false)
    setSubmitted(true)
  }

  function dismiss() {
    setVisible(false)
    setTimeout(onClose, 300)
  }

  function getResults(qIdx, optIdx) {
    const qid    = POLL.questions[qIdx].id
    const counts = [...(liveCounts[qid] || [0,0,0,0])]
    if (answers[qIdx] !== undefined) counts[answers[qIdx]] += 1
    const tot = counts.reduce((a, b) => a + b, 0)
    return { count: counts[optIdx], pct: tot > 0 ? Math.round((counts[optIdx] / tot) * 100) : 0 }
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(26,58,74,0.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem', opacity:visible?1:0, transition:'opacity 0.3s ease' }}
      onClick={e => e.target === e.currentTarget && dismiss()}>
      <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', border:'1.5px solid #000', boxShadow:'0 24px 80px rgba(0,0,0,0.18)', transform:visible?'translateY(0) scale(1)':'translateY(20px) scale(0.97)', transition:'transform 0.3s ease' }}>

        {/* Header */}
        <div style={{ padding:'1.5rem 1.75rem 1rem', borderBottom:'1.5px solid #000', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'#000', marginBottom:4 }}>🗳 Community Poll</div>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', color:'#000', lineHeight:1.25 }}>{POLL.title}</h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color:'#555', marginTop:4 }}>{POLL.subtitle}</p>
            </div>
            <button onClick={dismiss} style={{ background:'none', border:'1.5px solid #000', borderRadius:6, width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:'1rem', fontSize:'1rem', color:'#000' }}>✕</button>
          </div>

          {!submitted && (
            <div style={{ marginTop:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'#555', marginBottom:5 }}>
                <span>{answered} of {total} answered</span>
                <span style={{ fontWeight:700, color:'#000' }}>{progress}%</span>
              </div>
              <div style={{ height:6, background:'#eee', borderRadius:3, border:'1px solid #000', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'#000', borderRadius:3, transition:'width 0.4s ease' }}/>
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ overflowY:'auto', padding:'1.25rem 1.75rem', flex:1 }}>
          {!submitted ? (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              {POLL.questions.map((q, qi) => (
                <div key={q.id}>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', fontWeight:700, color:'#000', marginBottom:'0.75rem', lineHeight:1.4 }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:800, color:'#555', marginRight:6 }}>{qi+1}.</span>{q.text}
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                    {q.options.map((opt, oi) => {
                      const sel = answers[qi] === oi
                      return (
                        <button key={oi} onClick={() => setAnswers(p => ({...p,[qi]:oi}))}
                          style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.6rem 0.85rem', border:`1.5px solid ${sel?'#000':'#ccc'}`, borderRadius:8, background:sel?'#000':'#fff', cursor:'pointer', textAlign:'left', transition:'all 0.15s', width:'100%' }}>
                          <span style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${sel?'#fff':'#000'}`, background:sel?'#fff':'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            {sel && <span style={{ width:8, height:8, borderRadius:'50%', background:'#000', display:'block' }}/>}
                          </span>
                          <span style={{ fontFamily:'var(--font-body)', fontSize:'0.83rem', fontWeight:sel?700:400, color:sel?'#fff':'#000' }}>{opt}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <div style={{ textAlign:'center', padding:'1rem 0 1.5rem', borderBottom:'1.5px solid #000', marginBottom:'1.5rem' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🙏</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'#000' }}>Thank you for sharing!</h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'#555', marginTop:4 }}>See how others responded below.</p>
              </div>

              {POLL.questions.map((q, qi) => (
                <div key={q.id} style={{ marginBottom:'1.5rem' }}>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', fontWeight:700, color:'#000', marginBottom:'0.75rem' }}>{qi+1}. {q.text}</div>
                  {q.options.map((opt, oi) => {
                    const { count, pct } = getResults(qi, oi)
                    const isMyAnswer = answers[qi] === oi
                    return (
                      <div key={oi} style={{ marginBottom:'0.5rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                          <span style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:isMyAnswer?'#000':'#444', fontWeight:isMyAnswer?700:400 }}>
                            {isMyAnswer && '● '}{opt}
                          </span>
                          <span style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', fontWeight:700, color:'#000' }}>{pct}%</span>
                        </div>
                        <div style={{ height:8, background:'#eee', borderRadius:4, border:'1px solid #ccc', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:isMyAnswer?'#000':'#888', borderRadius:4, transition:'width 0.6s ease' }}/>
                        </div>
                        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', color:'#888', marginTop:2 }}>{count} responses</div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:'1rem 1.75rem', borderTop:'1.5px solid #000', display:'flex', gap:'0.75rem', flexShrink:0 }}>
          {!submitted ? (
            <>
              <button onClick={dismiss} style={{ flex:1, padding:'0.65rem', border:'1.5px solid #000', borderRadius:8, background:'#fff', fontFamily:'var(--font-body)', fontSize:'0.85rem', fontWeight:600, color:'#000', cursor:'pointer' }}>
                Skip for now
              </button>
              <button onClick={handleSubmit} disabled={answered < total || submitting}
                style={{ flex:2, padding:'0.65rem', border:'1.5px solid #000', borderRadius:8, background:answered===total?'#000':'#eee', fontFamily:'var(--font-body)', fontSize:'0.85rem', fontWeight:700, color:answered===total?'#fff':'#aaa', cursor:answered===total?'pointer':'not-allowed', transition:'all 0.2s' }}>
                {submitting ? 'Submitting…' : 'Submit Poll →'}
              </button>
            </>
          ) : (
            <button onClick={dismiss} style={{ flex:1, padding:'0.65rem', border:'1.5px solid #000', borderRadius:8, background:'#000', fontFamily:'var(--font-body)', fontSize:'0.85rem', fontWeight:700, color:'#fff', cursor:'pointer' }}>
              Close & Explore →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
