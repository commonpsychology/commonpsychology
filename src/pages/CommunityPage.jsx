import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'

const GROUPS = [
  { id:1, name:'Anxiety & Stress Support',     emoji:'😰', members:142, posts:38, desc:'A safe space for sharing experiences with anxiety, panic, and stress management techniques.',              color:'var(--blue-mist)', tags:['Anxiety','Stress','Panic'] },
  { id:2, name:'Depression Recovery Circle',   emoji:'🌱', members:98,  posts:24, desc:'Peer support and shared stories from those navigating depression. Moderated by a licensed counselor.',   color:'var(--green-mist)', tags:['Depression','Recovery','Hope'] },
  { id:3, name:'Family & Relationship Issues', emoji:'👨‍👩‍👧', members:76, posts:19, desc:'Discuss family conflict, communication challenges, and relationship patterns in a confidential setting.', color:'var(--earth-cream)', tags:['Family','Relationships','Communication'] },
  { id:4, name:'Student Mental Health',        emoji:'🎓', members:213, posts:55, desc:'For students dealing with academic pressure, exam stress, career anxiety, and campus life challenges.',   color:'var(--sky-light)', tags:['Students','Stress','Academic'] },
  { id:5, name:'Grief & Loss',                 emoji:'💙', members:54,  posts:12, desc:'A gentle space for those processing loss — of loved ones, relationships, or life transitions.',          color:'var(--blue-mist)', tags:['Grief','Loss','Healing'] },
  { id:6, name:'Mindfulness & Wellness',       emoji:'🧘', members:187, posts:44, desc:'Share mindfulness practices, meditation experiences, and everyday wellness strategies.',                  color:'var(--green-mist)', tags:['Mindfulness','Wellness','Meditation'] },
]

const ANNOUNCEMENTS = [
  { title:'Group Therapy — Anxiety Management', date:'Wed 18 Jun · 6:00 PM', mode:'Online (Zoom)', facilitator:'Dr. Anita Shrestha', spots:4 },
  { title:'Mindfulness Circle — Weekly Session', date:'Fri 20 Jun · 5:30 PM', mode:'In-Person, Kathmandu', facilitator:'Ms. Priya Tamang', spots:8 },
  { title:'Student Stress Workshop', date:'Sat 21 Jun · 10:00 AM', mode:'Online (Zoom)', facilitator:'Mr. Roshan Karki', spots:12 },
]

const RECENT_POSTS = [
  { group:'Anxiety & Stress Support', author:'Anonymous', time:'2h ago', text:"I tried the 4-7-8 breathing technique during my presentation today and it actually worked. First time I didn't freeze up!", likes:14, replies:6 },
  { group:'Student Mental Health', author:'Student23', time:'5h ago', text:"Exam week is brutal. Anyone else feeling completely overwhelmed? How do you all manage?", likes:22, replies:11 },
  { group:'Depression Recovery Circle', author:'HealingSlowly', time:'1d ago', text:"100 days of consistently taking my medication. Small win but I'm proud of it.", likes:48, replies:18 },
]

const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', white:'#ffffff', mint:'#e8f3ee',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8',
}
const btnGrad     = `linear-gradient(135deg,#007BA8 0%,#00BFFF 100%)`
const sectionGrad = `linear-gradient(135deg,${C.skyFainter} 0%,${C.mint} 60%,${C.skyFaint} 100%)`

/* ── Join confirmation modal ── */
function JoinModal({ group, onConfirm, onCancel }) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [anon, setAnon]   = useState(false)
  const [fN, setFN] = useState(false)
  const [fE, setFE] = useState(false)
  const valid = anon || (name.trim() && email.includes('@'))

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={onCancel}>
      <div style={{ background:C.white, borderRadius:22, padding:'2.25rem', maxWidth:420, width:'100%', boxShadow:`0 20px 60px rgba(0,0,0,0.22)`, position:'relative' }}
        onClick={e=>e.stopPropagation()}>
        <button onClick={onCancel} style={{ position:'absolute', top:14, right:16, background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:C.textLight }}>✕</button>

        <div style={{ display:'flex', alignItems:'center', gap:'0.85rem', marginBottom:'1.5rem', padding:'0.9rem', background:sectionGrad, borderRadius:14, border:`1px solid ${C.borderFaint}` }}>
          <span style={{ fontSize:'2rem' }}>{group.emoji}</span>
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem', color:C.textDark }}>{group.name}</div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:C.textLight }}>{group.members} members · Moderated</div>
          </div>
        </div>

        <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', color:C.textDark, marginBottom:'0.35rem' }}>Join this Group</h3>
        <p style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.textMid, lineHeight:1.65, marginBottom:'1.25rem' }}>
          You can join anonymously or with your name. All groups are moderated by licensed professionals.
        </p>

        <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', marginBottom:'1.1rem', padding:'0.75rem 1rem', background:anon?C.skyFainter:C.white, border:`1.5px solid ${anon?C.skyBright:C.borderFaint}`, borderRadius:12, cursor:'pointer', transition:'all 0.2s' }}
          onClick={()=>setAnon(a=>!a)}>
          <div style={{ width:20, height:20, borderRadius:'50%', border:`2px solid ${anon?C.skyBright:C.border}`, background:anon?btnGrad:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
            {anon && <span style={{ color:'white', fontSize:'0.6rem', fontWeight:800 }}>✓</span>}
          </div>
          <div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:700, color:anon?C.skyDeep:C.textDark }}>Join Anonymously</div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', color:C.textLight }}>Your identity will never be shared</div>
          </div>
        </div>

        {!anon && (
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.1rem' }}>
            <div>
              <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.35rem' }}>Name <span style={{ color:C.skyBright }}>*</span></label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" type="text"
                onFocus={()=>setFN(true)} onBlur={()=>setFN(false)}
                style={{ width:'100%', padding:'0.7rem 0.9rem', border:`1.5px solid ${fN?C.skyBright:C.borderFaint}`, borderRadius:10, fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textDark, background:fN?C.skyFainter:C.white, outline:'none', boxSizing:'border-box', transition:'all 0.2s' }} />
            </div>
            <div>
              <label style={{ display:'block', fontFamily:'var(--font-body)', fontSize:'0.65rem', fontWeight:800, color:C.textLight, textTransform:'uppercase', letterSpacing:'0.09em', marginBottom:'0.35rem' }}>Email <span style={{ color:C.skyBright }}>*</span></label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@email.com" type="email"
                onFocus={()=>setFE(true)} onBlur={()=>setFE(false)}
                style={{ width:'100%', padding:'0.7rem 0.9rem', border:`1.5px solid ${fE?C.skyBright:C.borderFaint}`, borderRadius:10, fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textDark, background:fE?C.skyFainter:C.white, outline:'none', boxSizing:'border-box', transition:'all 0.2s' }} />
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap:'0.65rem' }}>
          <button onClick={onCancel} style={{ flex:1, padding:'0.75rem', borderRadius:12, border:`1.5px solid ${C.border}`, background:C.white, color:C.textMid, fontFamily:'var(--font-body)', fontWeight:600, fontSize:'0.88rem', cursor:'pointer' }}>Cancel</button>
          <button onClick={()=>valid&&onConfirm({ name: anon?'Anonymous':name, email: anon?'':email, anon })} disabled={!valid}
            style={{ flex:2, padding:'0.75rem', borderRadius:12, border:'none', background:valid?btnGrad:C.borderFaint, color:valid?'white':C.textLight, fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.88rem', cursor:valid?'pointer':'not-allowed', boxShadow:valid?`0 4px 16px rgba(0,191,255,0.3)`:'none', transition:'all 0.2s' }}>
            🤝 Join Group
          </button>
        </div>
      </div>
    </div>
  )
}

function JoinToast({ group, onClose }) {
  return (
    <div style={{ position:'fixed', bottom:32, right:32, zIndex:1000, background:C.white, borderRadius:16, padding:'1rem 1.25rem', boxShadow:`0 8px 32px rgba(0,0,0,0.15)`, border:`1.5px solid ${C.borderFaint}`, display:'flex', alignItems:'center', gap:'0.85rem', maxWidth:320 }}>
      <span style={{ fontSize:'1.8rem', flexShrink:0 }}>{group.emoji}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', fontWeight:700, color:C.textDark }}>Joined successfully!</div>
        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:'#22c55e', fontWeight:600 }}>✓ {group.name}</div>
      </div>
      <button onClick={onClose} style={{ background:'none', border:'none', color:C.textLight, cursor:'pointer', fontSize:'1rem', flexShrink:0 }}>✕</button>
    </div>
  )
}

export default function CommunityPage() {
  const { navigate } = useRouter()
  const [joined, setJoined]       = useState([])
  const [joinModal, setJoinModal] = useState(null)
  const [toast, setToast]         = useState(null)
  const [activeTab, setActiveTab] = useState('groups')
  const [likedPosts, setLikedPosts] = useState([])

  // Responsive window width — same pattern as WorkshopsPage
  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024)
  useEffect(() => {
    const handler = () => setWinWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  function openJoin(group) {
    if (joined.includes(group.id)) {
      setJoined(prev => prev.filter(id => id !== group.id))
    } else {
      setJoinModal(group)
    }
  }

  function confirmJoin(group) {
    setJoined(prev => [...prev, group.id])
    setJoinModal(null)
    setToast(group)
    setTimeout(() => setToast(null), 3500)
  }

  function toggleLike(idx) {
    setLikedPosts(prev => prev.includes(idx) ? prev.filter(i=>i!==idx) : [...prev, idx])
  }

  return (
    <div className="page-wrapper">
      {/* ── Responsive grid — injected once, same pattern as WorkshopsPage ── */}
      <style>{`
        .community-groups-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        @media (max-width: 1024px) {
          .community-groups-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .community-groups-grid {
            grid-template-columns: 1fr;
          }
        }
        .community-announcement-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 1.5rem;
          align-items: center;
        }
        @media (max-width: 600px) {
          .community-announcement-row {
            grid-template-columns: 1fr;
          }
        }
        .community-feed-cta {
          display: flex;
          align-items: center;
          flex-direction: row;
          gap: 0.85rem;
        }
        @media (max-width: 600px) {
          .community-feed-cta {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="page-hero" style={{ background:'var(--sky-light)' }}>
        <span className="section-tag">Community</span>
        <h1 className="section-title">You Are Not <em>Alone</em></h1>
        <p className="section-desc">Connect with peers, share your journey, and find support in moderated community spaces. All groups are facilitated by our clinical team.</p>
        <div style={{ display:'flex', gap:'0.75rem', marginTop:'1.5rem', alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:4 }}>
            {['😊','🙂','😄','🌱','💙'].map((e,i)=>(
              <span key={i} style={{ width:32, height:32, borderRadius:'50%', background:'var(--white)', border:'2px solid var(--blue-pale)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', marginLeft:i>0?-8:0 }}>{e}</span>
            ))}
          </div>
          <span style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:'var(--text-mid)' }}>
            <strong>770+ members</strong> actively supporting each other
          </span>
          {joined.length > 0 && (
            <div style={{ background:btnGrad, borderRadius:100, padding:'3px 12px', fontFamily:'var(--font-body)', fontSize:'0.72rem', fontWeight:800, color:'white' }}>
              ✓ {joined.length} group{joined.length>1?'s':''} joined
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background:'var(--white)', borderBottom:'1px solid var(--blue-pale)', padding:'0 1rem', display:'flex', gap:0, overflowX:'auto' }}>
        {[['groups','Support Groups'],['announcements','Group Sessions'],['feed','Recent Posts']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{ padding:'1rem 1.5rem', border:'none', background:'none', fontFamily:'var(--font-body)', fontSize:'0.85rem', fontWeight:activeTab===id?700:500, color:activeTab===id?'var(--sky)':'var(--text-light)', borderBottom:activeTab===id?'2.5px solid var(--sky)':'2.5px solid transparent', cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap' }}>{label}</button>
        ))}
      </div>

      <div className="section" style={{ background:'var(--off-white)', paddingTop:'3rem' }}>

        {/* GROUPS */}
        {activeTab === 'groups' && (
          <div>
            <div style={{ background:'rgba(0,191,255,0.08)', border:'1px solid var(--blue-pale)', borderRadius:'var(--radius-md)', padding:'1rem 1.5rem', marginBottom:'2rem', display:'flex', gap:'0.75rem', alignItems:'center' }}>
              <span style={{ fontSize:'1.2rem' }}>🛡️</span>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:'var(--blue-deep)', margin:0 }}>
                All community spaces are <strong>moderated by licensed professionals</strong>. Anonymous participation is supported. Please read our <a href="#" style={{ color:'var(--sky)' }}>Community Guidelines</a> before posting.
              </p>
            </div>

            {/* Responsive grid — matches WorkshopsPage pattern */}
            <div className="community-groups-grid">
              {GROUPS.map(g => {
                const isJoined = joined.includes(g.id)
                return (
                  <div key={g.id}
                    style={{ background: isJoined?C.skyFainter:'var(--white)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:`1.5px solid ${isJoined?C.skyBright:'var(--blue-pale)'}`, boxShadow: isJoined?`0 4px 20px rgba(0,191,255,0.12)`:'var(--shadow-soft)', transition:'all 0.25s' }}
                    onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
                  >
                    <div style={{ background:isJoined?`linear-gradient(135deg,${C.skyFaint},${C.skyFainter})`:g.color, padding:'1.5rem', fontSize:'2.5rem', textAlign:'center', position:'relative' }}>
                      {g.emoji}
                      {isJoined && (
                        <div style={{ position:'absolute', top:10, right:10, background:btnGrad, borderRadius:100, padding:'3px 10px', fontFamily:'var(--font-body)', fontSize:'0.62rem', fontWeight:800, color:'white' }}>✓ JOINED</div>
                      )}
                    </div>
                    <div style={{ padding:'1.25rem' }}>
                      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--blue-deep)', marginBottom:'0.4rem' }}>{g.name}</h3>
                      <p style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'var(--text-light)', lineHeight:1.6, marginBottom:'0.75rem' }}>{g.desc}</p>
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:'0.75rem' }}>
                        {g.tags.map((t,j)=><span key={j} className="tag" style={{ fontSize:'0.65rem' }}>{t}</span>)}
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', color:'var(--text-light)' }}>
                          👥 {isJoined ? g.members + 1 : g.members} members · 💬 {g.posts} posts
                        </span>
                      </div>
                      <button
                        onClick={()=>openJoin(g)}
                        style={{ width:'100%', padding:'0.6rem', borderRadius:12, border:`1.5px solid ${isJoined?C.skyBright:'var(--green-deep)'}`, background:isJoined?C.skyFaint:'var(--green-deep)', color:isJoined?C.skyDeep:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.82rem', cursor:'pointer', transition:'all 0.2s', textAlign:'center' }}>
                        {isJoined ? '✓ Joined — Leave Group' : '🤝 Join Group'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {joined.length > 0 && (
              <div style={{ marginTop:'2.5rem', background:C.white, borderRadius:18, border:`1px solid ${C.borderFaint}`, padding:'1.4rem 1.75rem', boxShadow:`0 4px 20px rgba(0,191,255,0.07)` }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:C.textDark, marginBottom:'0.9rem' }}>My Groups ({joined.length})</div>
                <div style={{ display:'flex', gap:'0.65rem', flexWrap:'wrap' }}>
                  {GROUPS.filter(g=>joined.includes(g.id)).map(g=>(
                    <div key={g.id} style={{ display:'inline-flex', alignItems:'center', gap:'0.45rem', background:sectionGrad, border:`1px solid ${C.borderFaint}`, borderRadius:100, padding:'5px 14px 5px 8px' }}>
                      <span style={{ fontSize:'1rem' }}>{g.emoji}</span>
                      <span style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem', fontWeight:700, color:C.skyDeep }}>{g.name}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>navigate('/portal')} style={{ marginTop:'1rem', padding:'0.6rem 1.4rem', borderRadius:12, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
                  View My Groups in Portal →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', marginBottom:'1.5rem' }}>Upcoming Group Therapy Sessions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {ANNOUNCEMENTS.map((a,i)=>(
                <div key={i} style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'1.75rem', border:'1px solid var(--blue-pale)', boxShadow:'var(--shadow-soft)' }}>
                  <div className="community-announcement-row">
                    <div>
                      <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--blue-deep)', marginBottom:'0.4rem' }}>{a.title}</h3>
                      <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'var(--text-light)' }}>📅 {a.date}</span>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'var(--text-light)' }}>💻 {a.mode}</span>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:'var(--text-light)' }}>👤 {a.facilitator}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'var(--earth-warm)', fontWeight:700, marginBottom:'0.5rem' }}>{a.spots} spots left</div>
                      <button className="btn btn-primary" onClick={()=>navigate('/book')}>Reserve Spot →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEED */}
        {activeTab === 'feed' && (
          <div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--blue-deep)', marginBottom:'1.5rem' }}>Recent Community Posts</div>
            <div style={{ background:'rgba(0,191,255,0.06)', border:'1px solid var(--blue-pale)', borderRadius:'var(--radius-md)', padding:'1rem 1.5rem', marginBottom:'2rem', fontSize:'0.82rem', color:'var(--blue-mid)' }}>
              💡 All posts are anonymous by default. Your privacy is protected. Please be kind and supportive.
            </div>
            {!joined.length && (
              <div style={{ background:'rgba(0,191,255,0.06)', border:'1px solid var(--blue-pale)', borderRadius:'var(--radius-md)', padding:'1.25rem 1.5rem', marginBottom:'2rem' }}>
                <div className="community-feed-cta">
                  <span style={{ fontSize:'1.4rem' }}>🤝</span>
                  <div>
                    <div style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.85rem', color:'var(--blue-deep)', marginBottom:'0.2rem' }}>Join a group to post and reply</div>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:'var(--text-light)' }}>You can still read posts. Join any support group to participate.</div>
                  </div>
                  <button onClick={()=>setActiveTab('groups')} style={{ marginLeft:'auto', padding:'0.5rem 1.1rem', borderRadius:100, border:'none', background:btnGrad, color:'white', fontFamily:'var(--font-body)', fontSize:'0.78rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                    Browse Groups →
                  </button>
                </div>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              {RECENT_POSTS.map((p,i)=>(
                <div key={i} style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', padding:'1.5rem', border:'1px solid var(--blue-pale)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem', alignItems:'center' }}>
                    <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--sky-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem' }}>😊</div>
                      <div>
                        <div style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:'0.82rem', color:'var(--blue-deep)' }}>{p.author}</div>
                        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem', color:'var(--text-light)' }}>{p.group} · {p.time}</div>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:'var(--text-mid)', lineHeight:1.7, marginBottom:'1rem' }}>{p.text}</p>
                  <div style={{ display:'flex', gap:'1rem' }}>
                    <button onClick={()=>toggleLike(i)}
                      style={{ border:'none', background:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.8rem', color:likedPosts.includes(i)?'#e53935':'var(--text-light)', display:'flex', alignItems:'center', gap:4, transition:'color 0.2s' }}>
                      {likedPosts.includes(i)?'❤️':'🤍'} {likedPosts.includes(i) ? p.likes+1 : p.likes}
                    </button>
                    <button style={{ border:'none', background:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'var(--text-light)', display:'flex', alignItems:'center', gap:4 }}>💬 {p.replies} replies</button>
                    {joined.length > 0 && (
                      <button style={{ border:'none', background:'none', cursor:'pointer', fontFamily:'var(--font-body)', fontSize:'0.8rem', color:'var(--sky)' }}>Reply</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {joinModal && (
        <JoinModal
          group={joinModal}
          onConfirm={(data) => confirmJoin(joinModal, data)}
          onCancel={() => setJoinModal(null)}
        />
      )}

      {toast && <JoinToast group={toast} onClose={()=>setToast(null)} />}
    </div>
  )
}