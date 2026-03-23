// src/pages/PsychologicalArticlePage.jsx
// Route: /psychological-view/:slug
// Full article detail page for Psychological View analyses
// Navbar + Footer provided by App.jsx shell

import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Fallback data — matches the analyses in PsychologicalViewPage
const FALLBACK_ANALYSES = [
  { id:'1', slug:'populism-social-psychology',    category:'Global Politics', icon:'🌍', color_var:'var(--blue-mist)',   title:'Why Populism Keeps Rising: A Social Psychology Lens',                read_time:'6 min', published_at:'2025-06-01', concepts:['Social Identity Theory','Scapegoating','Fear Appeals','Cognitive Simplification'], excerpt:'Social identity theory, in-group favoritism, and threat perception explain the surge of populist movements across democracies.', content:'Social identity theory, first developed by Henri Tajfel and John Turner in the 1970s, proposes that people derive a significant portion of their self-concept from the groups they belong to. This psychological mechanism — powerful and largely unconscious — becomes politically explosive during periods of economic anxiety and rapid social change.\n\nWhen material conditions deteriorate, or when cultural change feels threatening to a group\'s sense of identity and status, the psychological need for in-group solidarity intensifies. Charismatic leaders who offer simple narratives of "us versus them" are not creating these tribal impulses — they are expertly channeling pre-existing psychological currents.\n\nFear appeals work by activating the amygdala — the brain\'s threat-detection centre — which reduces activity in the prefrontal cortex responsible for rational deliberation. Under conditions of perceived threat, people become more susceptible to authoritarian solutions and less critical of factual inconsistencies in messaging.\n\nCognitive simplification — the tendency to reduce complex systemic problems to single causes and single villains — is a natural response to cognitive overload. When economic systems, geopolitical forces, and cultural change converge simultaneously, the brain\'s preference for simple causal stories becomes a vulnerability.\n\nScapegoating historically targets out-groups that are visible, culturally distinct, and politically vulnerable. The psychological function it serves is to transform diffuse, structurally-caused anxiety into concrete, actionable anger — a transition that feels enormously relieving, even when destructive.\n\nUnderstanding these mechanisms is not an endorsement of populism but an essential precondition for countering it effectively. Education, economic security, and media literacy all reduce vulnerability to fear-based political messaging.' },
  { id:'2', slug:'doom-scrolling-negativity-bias', category:'Social Media',    icon:'📱', color_var:'var(--sky-light)',   title:'Doom-Scrolling and the Negativity Bias of the Human Brain',          read_time:'5 min', published_at:'2025-05-01', concepts:['Negativity Bias','Intermittent Reinforcement','Variable Reward Schedules','FOMO'], excerpt:'Our brains evolved to prioritize threat detection. Social media algorithms exploit this to create compulsive usage patterns.', content:'The human brain did not evolve in a world of infinite information. For 99% of our evolutionary history, the most adaptive response to negative signals was immediate, sustained attention — a predator glimpsed in the bushes demanded more cognitive resources than a pleasant sunset.\n\nThis negativity bias — our tendency to weight negative information more heavily than equivalent positive information — was a survival asset for hunter-gatherers. In the digital age, it has become a liability that technology companies have learned to exploit with extraordinary precision.\n\nSocial media platforms are not passive conduits of information. They are behavioural engineering systems designed, through iterative A/B testing on billions of users, to maximise engagement. And engagement, it turns out, is most reliably triggered by content that provokes anxiety, outrage, or fear.\n\nThe variable reward schedule — the same psychological mechanism that drives slot machine addiction — is central to the design of infinite scroll feeds. The unpredictable spacing of rewarding content (a like, a funny video, an outrage-inducing headline) produces dopaminergic anticipation that is neurologically identical to other forms of behavioural addiction.\n\nFOMO (Fear of Missing Out) adds a social anxiety layer. The platform communicates, implicitly but constantly, that social consequence awaits those who disengage. Relationships, opportunities, and cultural relevance all feel contingent on continuous monitoring.\n\nThe clinical implications are significant. Excessive social media use is now robustly associated with increased rates of anxiety, depression, and sleep disruption — particularly in adolescents. Puja Samargi recommends structured "digital sunset" practices: no screens one hour before bed, app time limits, and intentional news consumption rather than passive scrolling.' },
  { id:'3', slug:'climate-grief-eco-anxiety',      category:'Climate & Society',icon:'🌱', color_var:'var(--green-mist)', title:'Climate Grief and Eco-Anxiety: The New Existential Crisis',          read_time:'7 min', published_at:'2025-04-01', concepts:['Solastalgia','Existential Anxiety','Denial as Defense','Ecological Grief'], excerpt:'Climate psychology identifies a spectrum from eco-anxiety to ecological grief. Solastalgia is emerging as a new clinical concern.', content:'Glenn Albrecht coined the term "solastalgia" in 2003 to describe the distress caused by environmental change to one\'s home environment. Originally applied to communities living near open-cut mines in Australia, the concept has acquired global relevance as climate change transforms landscapes, weather patterns, and seasonal rhythms that communities have built cultural identities around for generations.\n\nEco-anxiety — chronic fear of environmental doom — is distinct from clinical anxiety disorders but can exacerbate them. The American Psychological Association formally recognised eco-anxiety in 2017, acknowledging that the mental health impacts of climate change extend far beyond the direct trauma of floods, fires, and displacement.\n\nThe psychological challenge is partly structural: climate change is a slow-moving, complex, globally-distributed threat that resists the brain\'s threat-detection systems, which evolved for immediate, localised dangers. This mismatch produces a characteristic affective response — oscillation between acute alarm and numbing denial.\n\nDenial as a psychological defence mechanism is not stupidity — it is the mind\'s attempt to make an overwhelming reality psychologically manageable. Understanding this does not excuse inaction, but it does explain why information campaigns alone fail to change behaviour at the scale required.\n\nEcological grief — mourning the loss of species, landscapes, seasons, and ecological relationships — is legitimate grief that deserves acknowledgement and therapeutic support. For many Indigenous communities, this grief has been ongoing for centuries.\n\nClinically, the most effective interventions combine realistic emotional processing with meaningful action. Agency — even small, local agency — is the most effective antidote to the helplessness that drives eco-anxiety into depression.' },
  { id:'4', slug:'covid-collective-trauma',         category:'Post-Pandemic',   icon:'😷', color_var:'var(--earth-cream)', title:'Collective Trauma: How COVID-19 Rewired Social Psychology',          read_time:'8 min', published_at:'2025-03-01', concepts:['Collective Trauma','Moral Injury','Trust in Institutions','Intergenerational Trauma'], excerpt:'Collective trauma operates differently from individual PTSD. COVID exposed fundamental tensions between individualism and collectivism.', content:'Collective trauma differs from individual trauma in ways that are clinically and sociologically significant. Where individual PTSD involves a specific person\'s nervous system encoding a specific threat experience, collective trauma disrupts the shared assumptions, social trust, and meaning-making frameworks that hold communities together.\n\nCOVID-19 attacked the most fundamental social infrastructures simultaneously: physical proximity, shared ritual, economic security, institutional trust, and the generational contract between the young and the old. The psychological damage was not merely the sum of individual losses but the fracturing of collective coherence.\n\nMoral injury — a concept originally developed in combat veteran psychology — describes the damage done when a person is forced to act in ways that violate their deeply held moral beliefs, or witnesses such violations by others. Healthcare workers who were forced to choose which patients received care, teachers who watched children lose developmental years, and care workers who could not hold the hands of dying patients all experienced moral injury at scale.\n\nThe erosion of institutional trust during the pandemic — accelerated by politicisation of public health, inconsistent messaging, and genuine scientific uncertainty — has lasting consequences. Trust, once damaged, recovers slowly and asymmetrically. Misinformation fills the vacuum left by distrusted official sources.\n\nIntergenerational trauma transmission is a well-documented phenomenon: the psychological and even epigenetic effects of major collective traumas can be measurable in subsequent generations. The pandemic cohort of children — those aged 0–10 during 2020–2022 — will require longitudinal monitoring for developmental and psychological impacts that may only become apparent in adolescence.\n\nRecovery from collective trauma requires collective action: rebuilding social trust through transparent institutions, creating space for communal grief, and investing in the mental health infrastructure that the pandemic both devastated and made newly urgent.' },
  { id:'5', slug:'gorkha-earthquake-trauma',        category:'Nepal',           icon:'🏔', color_var:'var(--blue-mist)',   title:'Earthquake Trauma and Resilience: Lessons from Gorkha',             read_time:'6 min', published_at:'2025-02-01', concepts:['Post-Traumatic Growth','Cultural Healing','Community Resilience','Survivor Guilt'], excerpt:'A decade after the 2015 earthquake, Nepal offers a unique study in post-disaster collective recovery.', content:'The April 2015 earthquake that struck Nepal with a 7.8 magnitude, followed by a 7.3 magnitude aftershock seventeen days later, killed nearly 9,000 people, injured 22,000, and displaced hundreds of thousands. The psychological aftermath — less visible than the physical destruction but equally profound — continues to shape the mental health landscape of affected communities a decade later.\n\nPost-traumatic stress disorder prevalence in heavily affected districts was estimated at 30–47% in the immediate aftermath — among the highest recorded for any natural disaster globally. Yet the story of Gorkha and surrounding districts is not only one of trauma. It is equally a story of remarkable resilience.\n\nPost-traumatic growth (PTG) — the positive psychological change that can emerge from the struggle with highly challenging life circumstances — was documented extensively in survivor communities. Survivors frequently reported strengthened relationships, enhanced appreciation for life, discovery of personal strength, spiritual development, and recognition of new possibilities.\n\nCultural healing practices played a documented role in this recovery. Buddhist and Hindu mourning rituals provided structured frameworks for grief processing. Community labour-sharing traditions (parma) facilitated both practical reconstruction and the social bonding that buffers trauma. The physical act of rebuilding together was itself therapeutic.\n\nSurvivor guilt — the complex, often irrational distress experienced by those who survived when others did not — required specific clinical attention. The randomness of survival in natural disasters is psychologically destabilising in ways distinct from other traumas, because it defies the human need for causal coherence.\n\nThe Gorkha experience offers a compelling case for culturally-integrated mental health responses — ones that work alongside existing community structures rather than imposing externally-designed protocols.' },
  { id:'6', slug:'moral-disengagement-conflict',    category:'Conflict & War',  icon:'⚖️', color_var:'var(--blue-mist)',   title:'Moral Disengagement: How Ordinary People Commit Extraordinary Harm', read_time:'9 min', published_at:'2025-01-01', concepts:['Moral Disengagement','Dehumanization','Obedience to Authority','Bystander Effect'], excerpt:"Bandura's moral disengagement theory explains how individuals distance themselves from consequences through dehumanization.", content:'Albert Bandura\'s theory of moral disengagement, developed over decades of empirical research, addresses one of the most unsettling questions in human psychology: how do ordinary, morally functioning individuals come to participate in extraordinary cruelty?\n\nThe answer, Bandura demonstrated, is not that they abandon their moral standards — it is that they employ a range of psychological mechanisms that selectively disengage those standards from their actions. These mechanisms are not unique to exceptional circumstances; they operate in everyday organizational life, in media consumption, and in political participation.\n\nDehumanization is perhaps the most powerful of these mechanisms. When outgroups are systematically represented as subhuman — through language, imagery, and narrative — the neurological empathy circuits that normally inhibit harm towards others are suppressed. The historical record is unambiguous: dehumanizing rhetoric consistently precedes mass violence.\n\nDiffusion of responsibility in group settings means that individual moral agency evaporates into collective structures. "I was following orders," "everyone else was doing it," and "the system made this decision" are not mere excuses — they reflect genuine psychological experiences of diminished personal accountability.\n\nStanley Milgram\'s obedience studies, conducted in the aftermath of the Holocaust, demonstrated that ordinary American participants would administer what they believed were life-threatening electric shocks to strangers when instructed by an authority figure in a scientific context. Situational forces, not character defects, were the primary determinants of behaviour.\n\nThe bystander effect — the well-documented phenomenon whereby the presence of others reduces individual intervention in emergencies — operates through similar diffusion mechanisms. The antidote, research shows, is explicit assignment of individual responsibility: when a specific person is named and asked to act, the diffusion dynamic collapses.\n\nUnderstanding moral disengagement is not academic. It is essential knowledge for building institutions, organizations, and communities that are structurally resistant to the conditions under which ordinary people become capable of harm.' },
]

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function SkeletonDetail() {
  const Sk = ({ w='100%', h=16 }) => (
    <div style={{ width:w, height:h, borderRadius:6,
      background:'linear-gradient(90deg,#e5e7eb 0%,#f3f4f6 50%,#e5e7eb 100%)',
      animation:'pulse 1.5s ease infinite', backgroundSize:'200% 100%', marginBottom:12 }} />
  )
  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'3rem 2rem' }}>
      <Sk h={32} w="60%" /><Sk h={20} w="85%" /><Sk h={20} w="70%" />
      <Sk h={14} /><Sk h={14} /><Sk w="80%" h={14} /><Sk h={14} /><Sk w="60%" h={14} />
    </div>
  )
}

export default function PsychologicalArticlePage() {
  const { params, navigate }    = useRouter()
  const slug                    = params?.slug
  const [article,  setArticle]  = useState(null)
  const [related,  setRelated]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(false)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => { window.scrollTo({ top:0, behavior:'smooth' }) }, [slug])

  // Try API first, fall back to local data
  useEffect(() => {
    if (!slug) { navigate('/psychological-view'); return }
    setLoading(true)
    setError(false)

    fetch(`${API_BASE}/api/psych/analyses/${slug}`)
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json() })
      .then(d  => {
        setArticle(d.analysis)
        // related = other analyses except current
        const others = FALLBACK_ANALYSES.filter(a => a.slug !== slug).slice(0, 3)
        setRelated(others)
      })
      .catch(() => {
        // Fall back to local data
        const found = FALLBACK_ANALYSES.find(a => a.slug === slug)
        if (found) {
          setArticle(found)
          setRelated(FALLBACK_ANALYSES.filter(a => a.slug !== slug).slice(0, 3))
        } else {
          setError(true)
        }
      })
      .finally(() => setLoading(false))
  }, [slug])

  function handleCopy() {
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── ERROR ──
  if (!loading && error) return (
    <div className="page-wrapper">
      <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', padding:'4rem 2rem', textAlign:'center' }}>
        <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🧠</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem',
          color:'var(--green-deep)', marginBottom:'0.75rem' }}>Article Not Found</h2>
        <p style={{ color:'var(--text-light)', marginBottom:'2rem' }}>
          This analysis may have been moved or removed.
        </p>
        <button onClick={() => navigate('/psychological-view')}
          className="btn btn-primary">← Back to Psychological View</button>
      </div>
    </div>
  )

  return (
    <div className="page-wrapper">
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
        .psych-article-body p { margin-bottom:1.5rem; line-height:1.85; }
        @media(max-width:900px){
          .psych-detail-layout { grid-template-columns:1fr !important }
          .psych-detail-sticky { position:static !important }
          .psych-related-grid  { grid-template-columns:1fr !important }
        }
      `}</style>

      {loading ? <SkeletonDetail /> : article && (
        <>
          {/* ── BREADCRUMB ── */}
          <div style={{ background:'var(--white)', borderBottom:'1px solid var(--earth-cream)',
            padding:'0.75rem 4rem' }}>
            <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center',
              gap:'0.5rem', fontFamily:'var(--font-body)', fontSize:'0.78rem' }}>
              <span onClick={()=>navigate('/')} style={{ color:'var(--sky)', cursor:'pointer', fontWeight:600 }}>Home</span>
              <span style={{ color:'var(--earth-cream)' }}>›</span>
              <span onClick={()=>navigate('/psychological-view')} style={{ color:'var(--sky)', cursor:'pointer', fontWeight:600 }}>Psychological View</span>
              <span style={{ color:'var(--earth-cream)' }}>›</span>
              <span style={{ color:'var(--text-light)', fontWeight:600 }}>{article.category}</span>
            </div>
          </div>

          {/* ── HERO BANNER ── */}
          <div style={{ background: article.color_var || 'var(--blue-mist)',
            padding:'4rem 6rem 3rem', position:'relative', overflow:'hidden' }}>
            <div style={{ maxWidth:1200, margin:'0 auto', position:'relative', zIndex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
                <span style={{ fontSize:'2.5rem' }}>{article.icon}</span>
                <div>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:800,
                    textTransform:'uppercase', letterSpacing:'0.1em', color:'var(--blue-mid)',
                    marginBottom:'0.2rem' }}>{article.category}</div>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem',
                    color:'var(--text-light)' }}>
                    {fmtDate(article.published_at)} · {article.read_time} read
                  </div>
                </div>
              </div>
              <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.75rem,3vw,2.6rem)',
                fontWeight:700, color:'var(--blue-deep)', lineHeight:1.2, marginBottom:'1.25rem',
                maxWidth:760 }}>
                {article.title}
              </h1>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'1.05rem',
                color:'var(--text-mid)', lineHeight:1.75, maxWidth:680,
                paddingLeft:'1.25rem', borderLeft:'4px solid var(--sky)' }}>
                {article.excerpt}
              </p>
            </div>
            {/* Decorative orb */}
            <div style={{ position:'absolute', right:-60, top:'50%', transform:'translateY(-50%)',
              width:320, height:320, borderRadius:'50%',
              background:'rgba(0,191,255,0.08)', pointerEvents:'none' }} />
          </div>

          {/* ── MAIN LAYOUT ── */}
          <div className="psych-detail-layout"
            style={{ maxWidth:1200, margin:'0 auto', display:'grid',
              gridTemplateColumns:'1fr 300px', gap:'3rem',
              padding:'2.5rem 2rem 4rem', alignItems:'start',
              background:'var(--off-white)' }}>

            {/* LEFT: Article body */}
            <article style={{ animation:'fadeUp 0.5s ease both' }}>

              {/* Concepts tags */}
              {(article.concepts||[]).length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'2rem' }}>
                  {article.concepts.map((c,i) => (
                    <span key={i} className="tag" style={{ fontSize:'0.75rem' }}>{c}</span>
                  ))}
                </div>
              )}

              {/* Full content */}
              <div className="psych-article-body"
                style={{ fontFamily:'var(--font-body)', fontSize:'1rem',
                  color:'var(--text-mid)', lineHeight:1.85 }}>
                {(article.content || article.excerpt || '')
                  .split('\n\n')
                  .filter(p => p.trim())
                  .map((para, i) => (
                    <p key={i}>{para.trim()}</p>
                  ))}
              </div>

              <div style={{ height:1, background:'var(--earth-cream)', margin:'2.5rem 0' }} />

              {/* Share + back row */}
              <div style={{ display:'flex', alignItems:'center',
                justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem',
                    fontWeight:700, color:'var(--text-mid)' }}>Share:</span>
                  {[
                    { label:'Copy Link', icon:'🔗', action: handleCopy },
                    { label:'Twitter',   icon:'🐦', action: ()=>window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`,'_blank') },
                  ].map(btn => (
                    <button key={btn.label} onClick={btn.action}
                      className="btn btn-outline"
                      style={{ fontSize:'0.75rem', padding:'0.4rem 0.9rem',
                        display:'flex', alignItems:'center', gap:5 }}>
                      {btn.icon} {btn.label === 'Copy Link' && copied ? 'Copied!' : btn.label}
                    </button>
                  ))}
                </div>
                <button onClick={()=>navigate('/psychological-view')}
                  className="btn btn-outline">
                  ← Psychological View
                </button>
              </div>

              {/* ── RELATED ANALYSES ── */}
              {related.length > 0 && (
                <div style={{ marginTop:'3.5rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'1.5rem' }}>
                    <div style={{ flex:1, height:1, background:'var(--earth-cream)' }} />
                    <span style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:800,
                      letterSpacing:'0.14em', textTransform:'uppercase',
                      color:'var(--text-light)' }}>More Analyses</span>
                    <div style={{ flex:1, height:1, background:'var(--earth-cream)' }} />
                  </div>
                  <div className="psych-related-grid"
                    style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.25rem' }}>
                    {related.map(a => (
                      <div key={a.id}
                        style={{ background:'var(--white)', borderRadius:'var(--radius-lg)',
                          overflow:'hidden', border:'1px solid var(--blue-pale)',
                          cursor:'pointer', transition:'all 0.25s',
                          boxShadow:'var(--shadow-soft)' }}
                        onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='var(--shadow-mid)' }}
                        onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='var(--shadow-soft)' }}
                        onClick={()=>{ navigate('/psychological-view/'+a.slug); window.scrollTo({top:0,behavior:'smooth'}) }}>
                        <div style={{ background:a.color_var, padding:'1rem 1.25rem',
                          display:'flex', alignItems:'center', gap:'0.5rem' }}>
                          <span style={{ fontSize:'1.5rem' }}>{a.icon}</span>
                          <div style={{ fontFamily:'var(--font-body)', fontSize:'0.65rem',
                            fontWeight:800, textTransform:'uppercase',
                            letterSpacing:'0.08em', color:'var(--blue-mid)' }}>
                            {a.category}
                          </div>
                        </div>
                        <div style={{ padding:'1rem 1.25rem' }}>
                          <h4 style={{ fontFamily:'var(--font-display)', fontSize:'0.9rem',
                            color:'var(--blue-deep)', lineHeight:1.35,
                            marginBottom:'0.4rem' }}>{a.title}</h4>
                          <div style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem',
                            color:'var(--text-light)' }}>{a.read_time} read</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            {/* RIGHT SIDEBAR */}
            <aside className="psych-detail-sticky" style={{ position:'sticky', top:100 }}>

              {/* Book CTA */}
              <div style={{ background:'linear-gradient(135deg,var(--green-deep) 0%,var(--blue-deep) 100%)',
                borderRadius:16, padding:'1.75rem', color:'white', marginBottom:'1.5rem' }}>
                <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>🌿</div>
                <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem',
                  fontWeight:600, marginBottom:'0.5rem', lineHeight:1.3 }}>
                  Speak with a Psychologist
                </h3>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem',
                  color:'rgba(255,255,255,0.65)', lineHeight:1.55, marginBottom:'1.25rem' }}>
                  Our licensed clinical team can help you apply these insights to your own wellbeing.
                </p>
                <button onClick={()=>navigate('/book')}
                  className="btn btn-primary"
                  style={{ width:'100%', justifyContent:'center', background:'var(--sky)',
                    border:'none', color:'white' }}>
                  Book Free Consultation →
                </button>
              </div>

              {/* Take assessment */}
              <div style={{ background:'var(--white)', borderRadius:14, padding:'1.5rem',
                border:'1px solid var(--earth-cream)', marginBottom:'1.5rem' }}>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:800,
                  letterSpacing:'0.1em', textTransform:'uppercase',
                  color:'var(--text-light)', marginBottom:'0.75rem' }}>Free Screening</div>
                <h4 style={{ fontFamily:'var(--font-display)', fontSize:'0.95rem',
                  color:'var(--blue-deep)', marginBottom:'0.5rem' }}>
                  Check Your Mental Health
                </h4>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem',
                  color:'var(--text-light)', lineHeight:1.55, marginBottom:'1rem' }}>
                  Take a validated screening — PHQ-9, GAD-7, DASS-21, or Burnout Check. Free and anonymous.
                </p>
                <button onClick={()=>navigate('/assessments')}
                  className="btn btn-outline" style={{ width:'100%', justifyContent:'center' }}>
                  Start Assessment
                </button>
              </div>

              {/* Article info */}
              <div style={{ background:'var(--white)', borderRadius:14, padding:'1.5rem',
                border:'1px solid var(--earth-cream)' }}>
                <div style={{ fontFamily:'var(--font-body)', fontSize:'0.68rem', fontWeight:800,
                  letterSpacing:'0.1em', textTransform:'uppercase',
                  color:'var(--text-light)', marginBottom:'1rem' }}>About This Analysis</div>
                {[
                  ['Category',  article.category],
                  ['Published', fmtDate(article.published_at)],
                  ['Read Time', article.read_time],
                  ['Concepts',  (article.concepts||[]).length + ' key concepts'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between',
                    padding:'0.5rem 0', borderBottom:'1px solid var(--off-white)' }}>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem',
                      color:'var(--text-light)' }}>{k}</span>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem',
                      fontWeight:600, color:'var(--text-dark)', textAlign:'right',
                      maxWidth:'55%' }}>{v}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}