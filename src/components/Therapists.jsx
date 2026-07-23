// src/components/Therapists.jsx
import { useState } from 'react'
import { useRouter } from '../context/RouterContext'
import { useTherapists } from '../context/TherapistsContext'
import { TOKENS, sectionGradientCSS } from '../styles/oceanTheme'

// Fallback avatar palette — was a mixed green/blue/pink/yellow/purple/teal
// set before. Now every tint is a shade of ocean blue (varying lightness
// for personality) so avatars without a photo still belong to the same
// family as everything else on the page.
const AVATAR_PALETTES = [
  { bg: `linear-gradient(135deg, ${TOKENS.bluePale}, ${TOKENS.oceanBright})`, c: TOKENS.oceanInk },
  { bg: `linear-gradient(135deg, ${TOKENS.oceanPale}, ${TOKENS.oceanCore})`,  c: TOKENS.white },
  { bg: `linear-gradient(135deg, ${TOKENS.skyLight}, ${TOKENS.oceanDeep})`,   c: TOKENS.white },
  { bg: `linear-gradient(135deg, ${TOKENS.mist}, ${TOKENS.oceanBright})`,     c: TOKENS.oceanInk },
  { bg: `linear-gradient(135deg, ${TOKENS.bluePale}, ${TOKENS.oceanDeep})`,   c: TOKENS.white },
  { bg: `linear-gradient(135deg, ${TOKENS.oceanPale}, ${TOKENS.oceanInk})`,   c: TOKENS.white },
]

function Avatar({ name, size = 88 }) {
  const initials = (name || 'T').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const p = AVATAR_PALETTES[(name?.charCodeAt(0) || 0) % AVATAR_PALETTES.length]
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: p.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Fraunces', serif", fontWeight: 800,
      fontSize: size * 0.3, color: p.c, flexShrink: 0,
      boxShadow: '0 4px 16px rgba(0,56,80,0.16)',
    }}>{initials}</div>
  )
}

function cleanUrl(raw) {
  if (!raw) return null
  return String(raw).trim().replace(/^["']+|["']+$/g, '') || null
}

// Rating stars use ocean-bright fill instead of amber, matching the star
// treatment already used in Testimonials and Video Reviews.
function Stars({ rating }) {
  const r = Math.round(Number(rating) * 2) / 2
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={i <= r ? TOKENS.oceanBright : TOKENS.bluePale}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '0.75rem', fontWeight: 700, color: TOKENS.dim, marginLeft: 3 }}>
        {Number(rating || 0).toFixed(1)}
      </span>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ background: TOKENS.white, borderRadius: 24, overflow: 'hidden', border: `1px solid ${TOKENS.bluePale}` }}>
      <div className="th-shimmer" style={{ height: 220 }}/>
      <div style={{ padding: '1.5rem' }}>
        {[['60%','1rem'],['45%','0.75rem'],['100%','2.5rem'],['80%','0.75rem']].map(([w,h],i) => (
          <div key={i} className="th-shimmer" style={{ height: h, width: w, borderRadius: 8, marginBottom: '0.65rem' }}/>
        ))}
      </div>
    </div>
  )
}

export default function Therapists() {
  const { navigate } = useRouter()
  const { therapists, loading } = useTherapists()
  const list = therapists.filter(t => t.is_available).slice(0, 3)

  return (
    <section className="th-section" id="therapists">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,800&family=Inter:wght@400;500;600;700&display=swap');
        ${sectionGradientCSS('th-section')}

        .th-section { padding: clamp(3rem,8vw,6rem) clamp(1rem,5vw,4rem); }
        .th-inner { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }

        .th-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: clamp(2rem,5vw,3.5rem); flex-wrap: wrap; gap: 1rem; }
        .th-eyebrow {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.25rem 0.75rem; margin-bottom: 0.85rem;
          border: 1.5px solid ${TOKENS.bluePale}; border-radius: 100px;
          font-family: 'Inter', sans-serif; font-size: 0.68rem; font-weight: 800;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #0f3460; background: ${TOKENS.skyLight};
        }
        .th-title { font-family: 'Fraunces', serif; font-weight: 800; font-size: clamp(1.75rem,4vw,2.6rem); color: ${TOKENS.oceanInk}; line-height: 1.2; margin: 0; }
        .th-title em { font-style: italic; color: ${TOKENS.oceanBright}; }
        .th-desc { font-family: 'Inter', sans-serif; font-size: clamp(0.88rem,2vw,1rem); color: ${TOKENS.dim}; margin-top: 0.65rem; max-width: 500px; line-height: 1.75; }

        .th-btn-outline {
          padding: 0.7rem 1.75rem; border-radius: 100px; border: 2px solid ${TOKENS.oceanBright};
          background: transparent; color: ${TOKENS.oceanDeep};
          font-family: 'Inter', sans-serif; font-weight: 700; font-size: 0.9rem;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .th-btn-outline:hover { background: ${TOKENS.oceanBright}; color: #fff; }

        .th-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap: clamp(1rem,3vw,1.75rem); }

        .th-empty { grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: ${TOKENS.dim}; font-family: 'Inter', sans-serif; }

        .th-cta-wrap { text-align: center; margin-top: clamp(2rem,5vw,3.5rem); }
        .th-cta {
          padding: 0.95rem 3rem; border-radius: 100px; border: none;
          background: linear-gradient(135deg, ${TOKENS.oceanCore} 0%, ${TOKENS.oceanBright} 100%);
          color: white; font-family: 'Inter', sans-serif; font-weight: 800; font-size: 1rem;
          cursor: pointer; box-shadow: 0 8px 28px rgba(0,123,168,0.35); transition: all 0.2s;
        }
        .th-cta:hover { transform: translateY(-2px); }

        .th-shimmer {
          background: linear-gradient(90deg, ${TOKENS.skyLight} 25%, ${TOKENS.bluePale} 50%, ${TOKENS.skyLight} 75%);
          background-size: 200% 100%;
          animation: th-shimmer 1.4s infinite;
        }
        @keyframes th-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes th-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>

      <div className="th-inner">
        <div className="th-header">
          <div>
            <span className="th-eyebrow">👩‍⚕️ Our Team</span>
            <h2 className="th-title">Meet Our <em>Therapists</em></h2>
            <p className="th-desc">Licensed, experienced professionals trained in culturally sensitive mental health care for Nepal.</p>
          </div>
          <button className="th-btn-outline" onClick={() => navigate('/therapists')}>View All Therapists →</button>
        </div>

        <div className="th-grid">
          {loading
            ? [0,1,2].map(i => <SkeletonCard key={i}/>)
            : list.length === 0
              ? (
                <div className="th-empty">
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👩‍⚕️</div>
                  <p>Therapist profiles coming soon.</p>
                </div>
              )
              : list.map(t => <TherapistCard key={t.id} therapist={t} onNavigate={navigate}/>)
          }
        </div>

        {!loading && list.length > 0 && (
          <div className="th-cta-wrap">
            <button className="th-cta" onClick={() => navigate('/book')}>📅 See Other Therapists</button>
          </div>
        )}
      </div>
    </section>
  )
}

function TherapistCard({ therapist: t, onNavigate }) {
  const [hovered, setHovered] = useState(false)
  const [imgErr,  setImgErr]  = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: TOKENS.white, borderRadius: 24, overflow: 'hidden',
        border: `1.5px solid ${hovered ? TOKENS.oceanBright : TOKENS.bluePale}`,
        boxShadow: hovered ? '0 20px 60px rgba(0,123,168,0.16)' : '0 2px 16px rgba(0,56,80,0.06)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ position:'relative', height:220, background: `linear-gradient(135deg, ${TOKENS.oceanInk} 0%, ${TOKENS.oceanCore} 50%, ${TOKENS.oceanBright} 100%)`, overflow:'hidden', flexShrink:0 }}>
        {cleanUrl(t.avatar_url) && !imgErr
          ? <img src={cleanUrl(t.avatar_url)} alt={t.full_name} onError={() => setImgErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center', display:'block', transition:'transform 0.4s', transform:hovered?'scale(1.04)':'scale(1)' }}/>
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><Avatar name={t.full_name} size={96}/></div>
        }
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'40%', background:'linear-gradient(to top,rgba(0,20,31,0.55),transparent)', pointerEvents:'none' }}/>

        {/* Status badge kept in green/gray — availability is a status
            signal (like a traffic light), so it stays distinct from the
            brand blue for instant recognition rather than blending in. */}
        <div style={{ position:'absolute', top:14, left:14, display:'flex', alignItems:'center', gap:5, background:t.is_available?'rgba(16,185,129,0.9)':'rgba(100,116,139,0.85)', backdropFilter:'blur(8px)', borderRadius:100, padding:'0.28rem 0.75rem' }}>
          <span style={{ width:7, height:7, borderRadius:'50%', background:t.is_available?'#ecfdf5':'#cbd5e1', animation:t.is_available ? 'th-pulse 2s infinite' : 'none' }}/>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize:'0.65rem', fontWeight:800, color:'white', letterSpacing:'0.06em', textTransform:'uppercase' }}>{t.is_available?'Available':'Busy'}</span>
        </div>
        {t.consultation_fee && (
          <div style={{ position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.18)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:100, padding:'0.25rem 0.7rem' }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize:'0.68rem', fontWeight:700, color:'white' }}>NPR {Number(t.consultation_fee).toLocaleString()}</span>
          </div>
        )}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'0.85rem 1.1rem' }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize:'1.1rem', color:'white', fontWeight:700, textShadow:'0 1px 6px rgba(0,0,0,0.4)' }}>{t.full_name}</div>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize:'0.72rem', color:'rgba(255,255,255,0.82)', marginTop:2 }}>{t.license_type}</div>
        </div>
      </div>

      <div style={{ padding:'1.25rem 1.3rem', display:'flex', flexDirection:'column', gap:'0.85rem', flex:1 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'0.4rem' }}>
          {t.rating ? <Stars rating={t.rating}/> : <span style={{ fontFamily: "'Inter', sans-serif", fontSize:'0.75rem', color: TOKENS.dim }}>No reviews yet</span>}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize:'0.72rem', fontWeight:600, color: TOKENS.dim }}>
            {t.total_reviews ? `${t.total_reviews} reviews` : ''}
            {t.total_reviews && t.experience_years ? ' · ' : ''}
            {t.experience_years ? `${t.experience_years} yrs exp` : ''}
          </span>
        </div>

        {t.specializations.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
            {t.specializations.slice(0,4).map((s,i) => (
              <span key={i} style={{
                fontFamily: "'Inter', sans-serif", fontSize:'0.68rem', fontWeight:700, padding:'0.22rem 0.65rem', borderRadius:100,
                background: i===0 ? TOKENS.skyLight : TOKENS.mist,
                color: i===0 ? TOKENS.oceanDeep : TOKENS.dim,
                border: `1px solid ${i===0 ? TOKENS.bluePale : TOKENS.bluePale}`,
              }}>{s}</span>
            ))}
            {t.specializations.length > 4 && (
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize:'0.68rem', fontWeight:700, padding:'0.22rem 0.65rem', borderRadius:100, background: TOKENS.mist, color: TOKENS.dim, border: `1px solid ${TOKENS.bluePale}` }}>+{t.specializations.length-4}</span>
            )}
          </div>
        )}

        {t.bio && (
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize:'0.8rem', color: TOKENS.dim, lineHeight:1.65, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{t.bio}</p>
        )}

        <div style={{ flex:1 }}/>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem' }}>
          <button onClick={() => onNavigate('/book', { therapist: t._raw || t })}
            style={{
              padding:'0.65rem 0.5rem', borderRadius:10, border:'none',
              background: hovered ? `linear-gradient(135deg, ${TOKENS.oceanCore}, ${TOKENS.oceanBright})` : `linear-gradient(135deg, ${TOKENS.oceanInk}, ${TOKENS.oceanCore})`,
              color:'white', fontFamily: "'Inter', sans-serif", fontWeight:700, fontSize:'0.82rem', cursor:'pointer', transition:'all 0.25s',
            }}>
            📅 Book Now
          </button>
          <button onClick={() => onNavigate('/therapists', { therapistId: t.id })}
            style={{
              padding:'0.65rem 0.5rem', borderRadius:10,
              border:`1.5px solid ${hovered ? TOKENS.oceanBright : TOKENS.bluePale}`,
              background:'transparent', color: hovered ? TOKENS.oceanDeep : TOKENS.dim,
              fontFamily: "'Inter', sans-serif", fontWeight:700, fontSize:'0.82rem', cursor:'pointer', transition:'all 0.25s',
            }}>
            View Profile
          </button>
        </div>
      </div>
    </div>
  )
}