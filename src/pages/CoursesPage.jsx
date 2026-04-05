// src/pages/CoursesPage.jsx
// Payment fully centralized — usePayment() replaces the inline PaymentModal.
// On success: enrollment record created in DB, payment linked by course_id.
// Admin sees it under /admin/payments?category=course

import { useState, useEffect } from 'react'
import { useRouter }  from '../context/RouterContext'
import { usePayment } from '../components/PaymentModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const C = { skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8', skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', skyGhost:'#F8FEFF', white:'#ffffff', mint:'#e8f3ee', textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa', border:'#b0d4e8', borderFaint:'#daeef8' }
const heroGrad    = `linear-gradient(135deg,#007BA8 0%,#009FD4 45%,#00BFFF 85%,#22d3ee 100%)`
const btnGrad     = `linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`
const sectionGrad = `linear-gradient(135deg,${C.skyFainter} 0%,${C.mint} 60%,${C.skyFaint} 100%)`

const COURSES_CSS = `
@keyframes course-success-pop { 0%{transform:scale(0.7);opacity:0;} 65%{transform:scale(1.08);} 100%{transform:scale(1);opacity:1;} }
@keyframes course-enroll-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,191,255,0.4);} 50%{box-shadow:0 0 0 8px rgba(0,191,255,0);} }
@keyframes free-badge-glow { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4);} 50%{box-shadow:0 0 0 6px rgba(34,197,94,0);} }
.courses-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
.course-card { background:var(--off-white); border-radius:var(--radius-lg); overflow:hidden; border:1.5px solid var(--earth-cream); box-shadow:var(--shadow-soft); transition:all 0.28s cubic-bezier(0.34,1.56,0.64,1); cursor:pointer; position:relative; }
.course-card:hover { transform:translateY(-6px); box-shadow:0 16px 48px rgba(0,123,168,0.13); border-color:rgba(0,191,255,0.3); }
.course-card.enrolled { border-color:#22c55e; box-shadow:0 8px 32px rgba(34,197,94,0.15); }
.course-card.paid-enrolled { border-color:${C.skyBright}; box-shadow:0 8px 32px rgba(0,191,255,0.15); }
.enrolled-badge { position:absolute; top:12px; right:12px; z-index:5; padding:4px 10px; border-radius:100px; font-size:0.62rem; font-weight:800; letter-spacing:0.08em; text-transform:uppercase; }
@media(max-width:900px){.courses-grid{grid-template-columns:repeat(2,1fr);gap:1.25rem;}}
@media(max-width:600px){.courses-grid{grid-template-columns:1fr;gap:1rem;}}
`

function injectCSS(id, css) {
  if (typeof document === 'undefined' || document.getElementById(id)) return
  const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.appendChild(s)
}

// ── Illustrations (unchanged) ──────────────────────────────────────────────
function IllustrationMindfulness() {
  return <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="80" height="80" rx="16" fill="#e8f3ee"/><circle cx="40" cy="38" r="16" fill="none" stroke="#3d6b5a" strokeWidth="2.5"/><path d="M40 22 L40 16" stroke="#ffd54f" strokeWidth="2" strokeLinecap="round"/><path d="M54 28 L58 24" stroke="#ffd54f" strokeWidth="2" strokeLinecap="round"/><path d="M56 40 L62 40" stroke="#ffd54f" strokeWidth="2" strokeLinecap="round"/><path d="M26 28 L22 24" stroke="#ffd54f" strokeWidth="2" strokeLinecap="round"/><path d="M24 40 L18 40" stroke="#ffd54f" strokeWidth="2" strokeLinecap="round"/><circle cx="40" cy="38" r="6" fill="#6a9e88"/><circle cx="40" cy="38" r="2.5" fill="white"/><path d="M32 52 Q40 60 48 52" fill="none" stroke="#b8d5c8" strokeWidth="2" strokeLinecap="round"/></svg>
}
function IllustrationCBT() {
  return <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="80" height="80" rx="16" fill="#e6f2f8"/><ellipse cx="40" cy="30" rx="20" ry="14" fill="white" stroke="#5b9ab5" strokeWidth="2"/><text x="28" y="34" fontFamily="sans-serif" fontSize="11" fill="#e57373" fontWeight="bold">✗</text><text x="44" y="34" fontFamily="sans-serif" fontSize="11" fill="#81c784" fontWeight="bold">✓</text><line x1="37" y1="30" x2="42" y2="30" stroke="#5b9ab5" strokeWidth="1.5"/><circle cx="34" cy="46" r="3" fill="white" stroke="#5b9ab5" strokeWidth="1.5"/><circle cx="30" cy="52" r="2" fill="white" stroke="#5b9ab5" strokeWidth="1.5"/><circle cx="27" cy="57" r="1.5" fill="white" stroke="#5b9ab5" strokeWidth="1.5"/><circle cx="40" cy="65" r="6" fill="#f5cba7" stroke="#d4b896" strokeWidth="1.5"/><ellipse cx="40" cy="73" rx="8" ry="4" fill="#5b9ab5"/></svg>
}
function IllustrationResilience() {
  return <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="80" height="80" rx="16" fill="#f5ede0"/><rect x="36" y="55" width="8" height="14" rx="3" fill="#6b4f35"/><ellipse cx="40" cy="55" rx="12" ry="8" fill="#3d6b5a"/><ellipse cx="28" cy="48" rx="9" ry="6" fill="#6a9e88"/><ellipse cx="52" cy="44" rx="9" ry="6" fill="#6a9e88"/><ellipse cx="40" cy="38" rx="10" ry="7" fill="#3d6b5a"/><ellipse cx="40" cy="28" rx="7" ry="5" fill="#6a9e88"/><ellipse cx="40" cy="22" rx="5" ry="4" fill="#3d6b5a"/><circle cx="40" cy="18" r="3" fill="#ffd54f"/></svg>
}
function IllustrationSleep() {
  return <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="80" height="80" rx="16" fill="#e8f3ee"/><path d="M50 20 C42 22, 36 30, 38 40 C40 50, 50 56, 58 52 C48 54, 40 46, 40 36 C40 28 44 22 50 20Z" fill="#ffd54f"/><circle cx="22" cy="26" r="2" fill="#ffd54f"/><circle cx="30" cy="18" r="1.5" fill="#ffd54f"/><circle cx="18" cy="38" r="1" fill="#ffd54f"/><text x="16" y="58" fontFamily="sans-serif" fontSize="10" fill="#5b9ab5" fontWeight="bold" opacity="0.8">z</text><text x="24" y="50" fontFamily="sans-serif" fontSize="8" fill="#5b9ab5" fontWeight="bold" opacity="0.6">z</text><text x="30" y="44" fontFamily="sans-serif" fontSize="6" fill="#5b9ab5" fontWeight="bold" opacity="0.4">z</text><rect x="10" y="60" width="60" height="14" rx="7" fill="#b0d4e8"/><ellipse cx="40" cy="60" rx="18" ry="5" fill="#e6f2f8"/></svg>
}
function IllustrationWorkplace() {
  return <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="80" height="80" rx="16" fill="#e6f2f8"/><rect x="10" y="52" width="60" height="6" rx="3" fill="#6b4f35"/><rect x="16" y="58" width="5" height="16" rx="2" fill="#6b4f35"/><rect x="59" y="58" width="5" height="16" rx="2" fill="#6b4f35"/><rect x="24" y="38" width="32" height="18" rx="3" fill="#2e6080"/><rect x="26" y="40" width="28" height="13" rx="2" fill="#e6f2f8"/><rect x="20" y="56" width="40" height="3" rx="1.5" fill="#1a3a4a"/><rect x="30" y="48" width="4" height="5" rx="1" fill="#5b9ab5"/><rect x="36" y="44" width="4" height="9" rx="1" fill="#00BFFF"/><rect x="42" y="46" width="4" height="7" rx="1" fill="#5b9ab5"/><circle cx="40" cy="26" r="7" fill="#f5cba7" stroke="#d4b896" strokeWidth="1.2"/><path d="M33 37 C33 31, 47 31, 47 37" fill="#3d6b5a"/></svg>
}
function IllustrationRelationships() {
  return <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="80" height="80" rx="16" fill="#f5ede0"/><circle cx="28" cy="25" r="8" fill="#f5cba7" stroke="#d4b896" strokeWidth="1.5"/><circle cx="52" cy="25" r="8" fill="#f5cba7" stroke="#d4b896" strokeWidth="1.5"/><path d="M20 50 C20 40, 36 40, 36 50 L36 70 L20 70 Z" fill="#e91e63" opacity="0.8"/><path d="M44 50 C44 40, 60 40, 60 50 L60 70 L44 70 Z" fill="#3d6b5a"/><path d="M36 58 Q40 55 44 58" fill="none" stroke="#f5cba7" strokeWidth="3.5" strokeLinecap="round"/><path d="M40 18 C40 16, 37 14.5, 37 17 C37 19 40 21 40 21 C40 21 43 19 43 17 C43 14.5 40 16 40 18Z" fill="#e53935"/></svg>
}

const COURSES = [
  { illustration:<IllustrationMindfulness/>, title:'Mindfulness-Based Stress Reduction', instructor:'Dr. Anita Shrestha', level:'Beginner',     duration:'8 hrs', lessons_count:24, price:1500, free:false, tags:['Mindfulness','Stress','Meditation'],  color:'var(--green-mist)' },
  { illustration:<IllustrationCBT/>,         title:'Overcoming Anxiety: A CBT Approach',  instructor:'Mr. Roshan Karki',   level:'Intermediate', duration:'6 hrs', lessons_count:18, price:0,    free:true,  tags:['Anxiety','CBT','Skills'],             color:'var(--blue-mist)'  },
  { illustration:<IllustrationResilience/>,  title:'Building Emotional Resilience',        instructor:'Ms. Priya Tamang',   level:'Beginner',     duration:'5 hrs', lessons_count:15, price:1200, free:false, tags:['Resilience','Emotions','Wellbeing'],  color:'var(--earth-cream)'},
  { illustration:<IllustrationSleep/>,       title:'Sleep Better: CBT for Insomnia',       instructor:'Dr. Anita Shrestha', level:'Beginner',     duration:'4 hrs', lessons_count:12, price:800,  free:false, tags:['Sleep','Insomnia','CBT'],             color:'var(--green-mist)' },
  { illustration:<IllustrationWorkplace/>,   title:'Workplace Mental Health',              instructor:'Mr. Roshan Karki',   level:'Advanced',     duration:'7 hrs', lessons_count:21, price:0,    free:true,  tags:['Work','Burnout','Boundaries'],         color:'var(--blue-mist)'  },
  { illustration:<IllustrationRelationships/>,title:'Healthy Relationships Workshop',      instructor:'Ms. Priya Tamang',   level:'Intermediate', duration:'5 hrs', lessons_count:16, price:1000, free:false, tags:['Relationships','Communication'],       color:'var(--earth-cream)'},
]
const levelColor = { Beginner:'var(--green-deep)', Intermediate:'var(--blue-mid)', Advanced:'var(--earth-mid)' }

// Free-enroll toast (unchanged UI, no payment modal)
function FreeToast({ course, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3200); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{ position:'fixed', bottom:32, left:'50%', transform:'translateX(-50%)', zIndex:9500, maxWidth:'min(440px,92vw)', width:'100%' }}>
      <div style={{ background:'#ffffff', borderRadius:18, border:'2px solid #22c55e', boxShadow:'0 16px 48px rgba(0,0,0,0.2)', padding:'1.1rem 1.4rem', display:'flex', alignItems:'center', gap:'1rem' }}>
        <div style={{ width:46, height:46, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#16a34a)', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'1.3rem' }}>✓</div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:800, color:'#16a34a', textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.15rem' }}>🎓 Enrolled — Free Access!</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:'0.92rem', color:'#1a3a4a' }}>{course.title}</div>
        </div>
        <button onClick={onDone} style={{ background:'none', border:'none', color:'#7a9aaa', cursor:'pointer', fontSize:'1rem' }}>✕</button>
      </div>
    </div>
  )
}

async function enrollFreeApi(courseIdx) {
  // POST /enrollments with course_id to save to DB
  const token = localStorage.getItem('accessToken')
  if (!token) return
  try {
    await fetch(`${API_BASE}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify({ course_index:courseIdx, category:'course', is_free:true }),
    })
  } catch { /* non-fatal */ }
}

export default function CoursesPage() {
  useEffect(() => { injectCSS('courses-css', COURSES_CSS) }, [])
  const { openPayment }            = usePayment()   // ← centralized
  const [enrolled, setEnrolled]    = useState(new Set())
  const [freeToast, setFreeToast]  = useState(null)

  async function handleEnroll(course, idx) {
    if (enrolled.has(idx)) return

    if (course.free) {
      // Free: instant enrollment, save to DB
      setEnrolled(prev => new Set([...prev, idx]))
      setFreeToast(course)
      await enrollFreeApi(idx)
      return
    }

    // Paid: open centralized payment modal
    // course_index + title go to DB via metadata so admin can identify
    const result = await openPayment({
      type:         'course',
      amount:       course.price,
      title:        course.title,
      description:  `${course.lessons_count} lessons · ${course.duration} · By ${course.instructor}`,
      itemLines:    [{ label: course.title, amount: course.price }],
      couponEnabled: true,
      allowedGateways: ['esewa','khalti','fonepay','stripe'],
      // Stored in payments table — admin queries by category='course' or course_index
      metadata: {
        course_index:    idx,
        course_title:    course.title,
        course_level:    course.level,
        instructor_name: course.instructor,
        category:        'course',
      },
    })

    if (result.success) {
      setEnrolled(prev => new Set([...prev, idx]))
    }
  }

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ background:'var(--earth-cream)' }}>
        <span className="section-tag">Online Learning</span>
        <h1 className="section-title">Trainings for <em>Every</em> Journey</h1>
        <p className="section-desc">Self-paced, expert-led programs designed to support your mental wellness from home.</p>
        {enrolled.size > 0 && (
          <div style={{ marginTop:'1.25rem', display:'inline-flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', padding:'0.5rem 1.2rem', borderRadius:100, fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:700, boxShadow:'0 4px 18px rgba(34,197,94,0.35)' }}>
            🎓 {enrolled.size} course{enrolled.size>1?'s':''} enrolled — start learning!
          </div>
        )}
      </div>

      <div className="section" style={{ background:'var(--white)' }}>
        <div className="courses-grid">
          {COURSES.map((c, i) => {
            const isEnrolled = enrolled.has(i)
            return (
              <div key={i} className={`course-card${isEnrolled?(c.free?' enrolled':' paid-enrolled'):''}`}>
                {isEnrolled && (
                  <div className="enrolled-badge" style={{ background:c.free?'#d1fae5':C.skyFaint, color:c.free?'#065f46':C.skyDeep, border:`1.5px solid ${c.free?'#a7f3d0':C.border}` }}>
                    {c.free ? '✓ Enrolled Free' : '✓ Enrolled'}
                  </div>
                )}
                <div style={{ background:isEnrolled?(c.free?'linear-gradient(135deg,#d1fae5,#a7f3d0)':sectionGrad):c.color, padding:'2rem', display:'flex', alignItems:'center', justifyContent:'center', height:110, position:'relative' }}>
                  {c.illustration}
                </div>
                <div style={{ padding:'1.5rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                    <span style={{ fontSize:'0.72rem', fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', color:levelColor[c.level] }}>{c.level}</span>
                    {c.free
                      ? <span style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', fontWeight:800, padding:'3px 10px', borderRadius:100, background:'#d1fae5', color:'#065f46', border:'1.5px solid #a7f3d0', animation:'free-badge-glow 2.5s ease infinite' }}>FREE</span>
                      : <span style={{ fontFamily:'var(--font-display)', fontWeight:700, color:isEnrolled?C.skyDeep:'var(--green-deep)', fontSize:'0.95rem' }}>NPR {c.price.toLocaleString()}</span>
                    }
                  </div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:400, color:'var(--green-deep)', marginBottom:'0.5rem', lineHeight:1.3 }}>{c.title}</h3>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'var(--text-light)', marginBottom:'0.75rem' }}>By {c.instructor}</p>
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'1rem' }}>
                    {c.tags.map((t,j) => <span key={j} className="tag" style={{ fontSize:'0.68rem' }}>{t}</span>)}
                  </div>
                  <div style={{ display:'flex', gap:'1rem', fontSize:'0.78rem', color:'var(--text-light)', padding:'0.75rem 0', borderTop:'1px solid var(--earth-cream)', marginBottom:'1rem' }}>
                    <span>📚 {c.lessons_count} lessons</span><span>⏱ {c.duration}</span>
                  </div>
                  {isEnrolled ? (
                    <button style={{ width:'100%', padding:'0.72rem', borderRadius:12, border:`2px solid ${c.free?'#22c55e':C.skyBright}`, background:c.free?'#d1fae5':C.skyFainter, color:c.free?'#065f46':C.skyDeep, fontFamily:'var(--font-body)', fontWeight:800, fontSize:'0.88rem', cursor:'pointer' }}>
                      ▶ Go to Course
                    </button>
                  ) : c.free ? (
                    <button className="btn" style={{ width:'100%', justifyContent:'center', background:'linear-gradient(135deg,#22c55e,#16a34a)', border:'none', color:'white', fontWeight:800, boxShadow:'0 4px 16px rgba(34,197,94,0.35)', animation:'free-badge-glow 2.5s ease infinite' }} onClick={() => handleEnroll(c,i)}>
                      🎓 Enroll Free →
                    </button>
                  ) : (
                    <button className="btn btn-primary" style={{ width:'100%', justifyContent:'center', animation:'course-enroll-pulse 3s ease infinite' }} onClick={() => handleEnroll(c,i)}>
                      💳 Enroll Now — NPR {c.price.toLocaleString()} →
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {freeToast && <FreeToast course={freeToast} onDone={() => setFreeToast(null)} />}
      {/* No inline PaymentModal — usePayment() renders it via PaymentProvider */}
    </div>
  )
}