// src/pages/ServicesPage.jsx
import { useState } from 'react'
import { useRouter } from '../context/RouterContext'

export function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export const allServices = [
  {
    icon: '🧠', iconClass: 'si-green',
    title: 'Individual Therapy',
    desc: 'One-on-one sessions tailored to your unique needs, delivered by certified clinical psychologists. Available online or in-person across Kathmandu.',
    features: ['CBT & DBT approaches', '60-minute sessions', 'Flexible scheduling', 'Session notes shared securely'],
    specialties: ['Anxiety', 'Depression', 'CBT', 'Trauma'],
    overview: 'Individual therapy provides a private, one-on-one space to work through personal challenges — from anxiety and depression to self-esteem, life direction, and everyday stress. Sessions are led by certified clinical psychologists trained in evidence-based approaches like CBT and DBT, tailored to your specific goals rather than a one-size-fits-all program.',
    whoFor: [
      "You're dealing with ongoing anxiety, low mood, or stress affecting daily life",
      'You want a confidential space to process thoughts and feelings without judgment',
      "You're looking for practical tools, not just someone to listen",
      "You've tried therapy before or are completely new to it — both are welcome",
    ],
    duration: '60 minutes',
    format: 'Online or in-person in Kathmandu',
    frequency: 'Weekly, biweekly, or as needed',
    process: [
      { title: 'Initial Consultation', desc: 'A brief intake call to understand your concerns and match you with the right therapist.' },
      { title: 'First Session', desc: 'Your therapist gets a fuller picture of your history, goals, and what you want out of therapy.' },
      { title: 'Ongoing Sessions', desc: 'Regular sessions using CBT, DBT, or other approaches suited to your needs, with reflection between sessions.' },
      { title: 'Progress Check-ins', desc: 'Periodic reviews to track progress and adjust the approach as needed.' },
    ],
    faqs: [
      { q: 'How many sessions will I need?', a: 'It varies — some people benefit from a handful of sessions to work through a specific issue, while others continue longer-term. Your therapist will discuss this with you as you go.' },
      { q: 'Is everything I share confidential?', a: 'Yes. Sessions are private and confidential, in line with professional counseling ethics, except in rare situations involving risk of harm.' },
      { q: "Can I switch therapists if it's not a good fit?", a: 'Absolutely. Finding the right fit matters, and you can request a different therapist at any point.' },
    ],
  },
  {
    icon: '💑', iconClass: 'si-earth',
    title: 'Couples Counseling',
    desc: 'Rebuild trust, communication, and intimacy with your partner through evidence-based relationship therapy.',
    features: ['Gottman Method', 'Joint & separate sessions', 'Conflict resolution', 'Relationship assessment'],
    specialties: ['Relationship', 'Couples', 'Gottman', 'Communication'],
    overview: "Couples counseling helps partners rebuild trust, improve communication, and work through recurring conflict using structured, evidence-based methods like the Gottman Method. Whether you're navigating a rough patch or want to strengthen an already solid relationship, sessions create a safe space for both partners to be heard.",
    whoFor: [
      'You and your partner argue about the same issues repeatedly without resolution',
      'Communication feels difficult, distant, or one-sided',
      "You're rebuilding trust after a breach or difficult period",
      'You want to strengthen your relationship proactively, not just in crisis',
    ],
    duration: '75 minutes',
    format: 'Online or in-person, joint sessions with optional individual check-ins',
    frequency: 'Weekly or biweekly',
    process: [
      { title: 'Joint Assessment', desc: 'Both partners share their perspective and relationship history with the therapist.' },
      { title: 'Individual Check-ins', desc: "Brief one-on-one conversations to understand each partner's personal concerns." },
      { title: 'Guided Sessions', desc: 'Structured joint sessions focused on communication skills, conflict resolution, and rebuilding connection.' },
      { title: 'Home Practice', desc: "Simple exercises between sessions to reinforce what's discussed in therapy." },
    ],
    faqs: [
      { q: 'Do both partners need to attend every session?', a: 'Most sessions are joint, though occasional individual check-ins may be included when helpful.' },
      { q: "What if we're not sure about staying together?", a: "That's a valid reason to seek counseling. Sessions can help clarify the relationship's direction, whichever way that goes." },
      { q: 'Is this only for married couples?', a: 'No — we work with couples at any stage, married or not, of any orientation.' },
    ],
  },
  {
    icon: '👨‍👩‍👧', iconClass: 'si-blue',
    title: 'Family Therapy',
    desc: 'Strengthen family bonds and work through dynamics that affect everyone in the household.',
    features: ['Family systems approach', 'Parenting support', 'Communication skills', 'Crisis intervention'],
    specialties: ['Family', 'Parenting', 'Crisis', 'Communication'],
    overview: 'Family therapy addresses the dynamics, communication patterns, and conflicts that affect the household as a whole — not just one individual. Using a systemic approach, sessions help families understand each other better, resolve recurring conflicts, and build healthier ways of relating.',
    whoFor: [
      'Conflict between family members feels ongoing or unresolved',
      'A major life change (illness, loss, relocation) is affecting the whole family',
      'Parents and children are struggling to communicate',
      'You want support navigating a blended family or major transition',
    ],
    duration: '60–90 minutes',
    format: 'In-person (home visits available) or online',
    frequency: 'Weekly or as needed',
    process: [
      { title: 'Family Intake', desc: "Understanding each family member's perspective and the core concerns." },
      { title: 'Systemic Assessment', desc: 'Identifying recurring patterns and dynamics contributing to conflict.' },
      { title: 'Joint Sessions', desc: 'Structured conversations involving relevant family members, guided by the therapist.' },
      { title: 'Ongoing Support', desc: 'Regular check-ins as the family works through changes together.' },
    ],
    faqs: [
      { q: 'Does the whole family need to attend every session?', a: "Not necessarily — some sessions may involve specific family members depending on what's being addressed." },
      { q: 'Is this suitable for children?', a: 'Yes, sessions are adapted to be age-appropriate for all participating family members.' },
      { q: 'Do you offer home visits?', a: 'Yes, home visit options are available depending on location and availability.' },
    ],
  },
  {
    icon: '🧒', iconClass: 'si-green',
    title: 'Child Psychology',
    desc: 'Specialized support for children aged 5–18, using play therapy and age-appropriate techniques.',
    features: ['Play therapy', 'Behavioral assessment', 'School-related issues', 'Parent coaching'],
    specialties: ['Children', 'Play Therapy', 'Behavioral', 'Adolescents'],
    overview: 'Specialized psychological support for children aged 5–18, using play therapy, behavioral techniques, and age-appropriate conversation to help kids process emotions, navigate school-related stress, or work through behavioral challenges — with parents involved every step of the way.',
    whoFor: [
      'Your child is showing signs of anxiety, withdrawal, or behavioral changes',
      'School-related stress, bullying, or academic pressure is affecting them',
      'You want support navigating a major transition (divorce, new sibling, relocation)',
      "You're looking for parent coaching alongside your child's sessions",
    ],
    duration: '45 minutes',
    format: 'In-person (play therapy room) or online for older children/teens',
    frequency: 'Weekly',
    process: [
      { title: 'Parent Consultation', desc: 'An initial conversation with parents/guardians to understand concerns and history.' },
      { title: 'Child Assessment', desc: "Age-appropriate assessment to understand the child's emotional and behavioral needs." },
      { title: 'Therapy Sessions', desc: "Play therapy or talk-based sessions, depending on the child's age and comfort." },
      { title: 'Parent Coaching', desc: 'Guidance for parents on supporting progress at home.' },
    ],
    faqs: [
      { q: "Will I know what happens in my child's sessions?", a: "You'll receive general updates on progress while respecting your child's space to build trust with their therapist." },
      { q: 'What age range do you work with?', a: 'Children and adolescents aged 5 to 18.' },
      { q: 'What is play therapy?', a: 'A therapeutic approach using play, rather than direct conversation, to help younger children express and process emotions.' },
    ],
  },
  {
    icon: '🌿', iconClass: 'si-earth',
    title: 'Mindfulness & Stress',
    desc: 'Learn practical mindfulness techniques to manage stress, anxiety, and emotional regulation.',
    features: ['MBSR program', 'Breathing techniques', 'Stress audit', 'Daily practice tools'],
    specialties: ['Mindfulness', 'Stress', 'Anxiety', 'MBSR'],
    overview: 'Learn practical, evidence-based mindfulness techniques through a structured MBSR (Mindfulness-Based Stress Reduction) program, designed to help you manage everyday stress, anxiety, and emotional overwhelm with tools you can use long after sessions end.',
    whoFor: [
      'You feel chronically stressed, overwhelmed, or on edge',
      'You want practical tools rather than open-ended talk therapy',
      "You're curious about mindfulness but don't know where to start",
      "You're looking to build a sustainable daily practice",
    ],
    duration: '50 minutes',
    format: 'Online or in-person, individual or group sessions',
    frequency: 'Weekly for an 8-week program, or standalone sessions',
    process: [
      { title: 'Stress Audit', desc: 'Identifying your specific stress triggers and current coping patterns.' },
      { title: 'Foundational Techniques', desc: 'Learning breathing exercises and grounding techniques.' },
      { title: 'MBSR Program', desc: 'Structured weekly sessions building a complete mindfulness practice.' },
      { title: 'Daily Practice Tools', desc: 'Take-home resources to continue practicing independently.' },
    ],
    faqs: [
      { q: 'Do I need any prior meditation experience?', a: 'No prior experience is needed — sessions start from the basics.' },
      { q: 'Is this a substitute for therapy?', a: "It can complement therapy but isn't a replacement for clinical treatment of diagnosed conditions." },
      { q: 'Can I do this in a group setting?', a: 'Yes, both individual and group formats are available.' },
    ],
  },
  {
    icon: '😴', iconClass: 'si-blue',
    title: 'Sleep & Mood',
    desc: 'Address insomnia, burnout, and mood disorders with targeted therapeutic interventions.',
    features: ['CBT for insomnia', 'Mood charting', 'Sleep hygiene coaching', 'Lifestyle integration'],
    specialties: ['Insomnia', 'Sleep', 'Mood', 'Burnout'],
    overview: 'Address insomnia, low mood, and burnout with targeted, evidence-based interventions including CBT for Insomnia (CBT-I) — one of the most effective non-medication treatments for sleep difficulties — combined with mood tracking and lifestyle adjustments.',
    whoFor: [
      'You struggle to fall or stay asleep on a regular basis',
      "You're dealing with burnout or low energy affecting daily function",
      'Your mood feels persistently low or unpredictable',
      'You want an alternative or complement to sleep medication',
    ],
    duration: '50 minutes',
    format: 'Online or in-person',
    frequency: 'Weekly for 4–6 sessions, then as needed',
    process: [
      { title: 'Sleep & Mood Assessment', desc: 'Understanding your sleep patterns, mood history, and daily routines.' },
      { title: 'CBT-I Techniques', desc: 'Structured techniques to retrain sleep patterns without medication.' },
      { title: 'Mood Charting', desc: 'Tracking mood alongside sleep to identify patterns and triggers.' },
      { title: 'Lifestyle Integration', desc: 'Practical adjustments to daily habits supporting long-term improvement.' },
    ],
    faqs: [
      { q: 'Will you prescribe sleep medication?', a: 'No — this service focuses on non-medication approaches. Medication management would go through a psychiatrist.' },
      { q: 'How soon will I see improvement?', a: 'Many people notice improvement within a few weeks of consistent practice, though it varies by individual.' },
      { q: 'Is this only for insomnia?', a: 'It also addresses burnout and mood-related concerns connected to sleep.' },
    ],
  },
  {
    icon: '💼', iconClass: 'si-blue',
    title: 'Organizational Wellness',
    desc: 'Support for workplace mental health and employee well-being.',
    features: ['Workplace assessments', 'Employee assistance', 'Leadership training', 'Culture of care'],
    specialties: ['Workplace', 'Employee', 'Leadership', 'Culture'],
    overview: 'Support for workplace mental health, from individual employee assistance to leadership training and organization-wide culture assessments — helping teams build a sustainable culture of psychological safety and care.',
    whoFor: [
      'Your organization wants to introduce or improve employee mental health support',
      'Leadership wants training on supporting team wellbeing',
      "You're seeing signs of burnout or disengagement across your team",
      'You want a confidential Employee Assistance Program (EAP) for staff',
    ],
    duration: 'Varies by engagement (half-day workshops to ongoing EAP)',
    format: 'On-site, online, or hybrid',
    frequency: 'Custom, based on organizational needs',
    process: [
      { title: 'Organizational Assessment', desc: 'Understanding current workplace culture and specific challenges.' },
      { title: 'Program Design', desc: 'Tailoring an approach — EAP, workshops, leadership training, or a mix.' },
      { title: 'Implementation', desc: 'Rolling out sessions, trainings, or ongoing employee assistance access.' },
      { title: 'Review & Iteration', desc: 'Periodic review of impact and adjustments based on feedback.' },
    ],
    faqs: [
      { q: 'Is employee participation confidential?', a: 'Yes — individual employee sessions remain confidential from the employer.' },
      { q: 'What size organizations do you work with?', a: 'We work with organizations of varying sizes, from small teams to larger companies.' },
      { q: 'Can this be a one-time workshop instead of an ongoing program?', a: 'Yes, we offer both one-time workshops and ongoing engagement models.' },
    ],
  },
  {
    icon: '🗨️', iconClass: 'si-green',
    title: 'General Counseling',
    desc: 'Talk through everyday challenges, life transitions, or emotional struggles with a supportive, non-judgmental counselor.',
    features: ['Life transitions support', 'Emotional wellness check-ins', 'Confidential sessions', 'Personalized coping strategies'],
    specialties: ['Counseling', 'Life Transitions', 'Emotional Support', 'Wellness'],
    overview: "A flexible, supportive space to talk through everyday challenges, life transitions, or emotional struggles that don't necessarily need a clinical diagnosis to deserve attention — sometimes you just need a non-judgmental space to think things through.",
    whoFor: [
      "You're going through a life transition and want support processing it",
      'You feel emotionally overwhelmed but aren\'t sure it "counts" as needing therapy',
      'You want a regular space for reflection and emotional check-ins',
      "You're looking for short-term support around a specific situation",
    ],
    duration: '50 minutes',
    format: 'Online or in-person',
    frequency: 'Weekly, biweekly, or as needed',
    process: [
      { title: 'Initial Conversation', desc: "Understanding what's bringing you to counseling and what support looks like for you." },
      { title: 'Ongoing Sessions', desc: 'Regular sessions focused on your specific concerns and goals.' },
      { title: 'Coping Strategy Building', desc: "Developing personalized strategies for whatever you're navigating." },
      { title: 'Flexible Continuation', desc: "Continue as long as it's useful — short-term or ongoing, your choice." },
    ],
    faqs: [
      { q: 'Do I need a specific diagnosis to seek counseling?', a: "No — general counseling is open to anyone wanting support, whether or not there's a clinical diagnosis involved." },
      { q: 'How is this different from therapy?', a: "It's similar in format but often more flexible and short-term focused, suited to everyday challenges rather than deeper clinical work." },
      { q: 'Can I switch to a more specialized service later?', a: 'Yes, your counselor can help refer you to a more specialized service if needed.' },
    ],
  },
  {
    icon: '🕊️', iconClass: 'si-earth',
    title: 'Grief & Loss Counseling',
    desc: 'Compassionate support for processing grief after the loss of a loved one, relationship, or major life change.',
    features: ['Grief processing techniques', 'Individual & family sessions', 'Coping with loss', 'Memory & meaning-making work'],
    specialties: ['Grief', 'Loss', 'Bereavement', 'Family'],
    overview: 'Compassionate, paced support for processing grief after losing a loved one, a relationship, or navigating any major life loss — helping you find ways to carry the loss while continuing to live fully, on your own timeline.',
    whoFor: [
      "You've experienced the loss of a loved one, recently or in the past",
      "You're grieving a relationship, job, or other significant life change",
      'You feel stuck, numb, or overwhelmed by grief',
      'You want support for a family member navigating loss (e.g. a grieving child)',
    ],
    duration: '60 minutes',
    format: 'Online or in-person, individual or family sessions',
    frequency: 'Weekly or as needed, at your own pace',
    process: [
      { title: 'Gentle Intake', desc: 'A compassionate first conversation about your loss and what support you need.' },
      { title: 'Grief Processing', desc: 'Structured but flexible techniques to help process complex emotions around loss.' },
      { title: 'Meaning-Making Work', desc: 'Exploring ways to honor memory while moving forward.' },
      { title: 'Ongoing Support', desc: "Continued sessions as long as helpful — grief doesn't follow a fixed timeline." },
    ],
    faqs: [
      { q: 'How soon after a loss should I seek counseling?', a: "There's no fixed timeline — some people seek support immediately, others years later. Both are valid." },
      { q: 'Can this help with grief unrelated to death, like a breakup or job loss?', a: 'Yes, grief counseling supports processing any significant loss, not only bereavement.' },
      { q: 'Can children attend grief counseling?', a: 'Yes, sessions can be adapted for children experiencing loss, often alongside family sessions.' },
    ],
  },
  {
    icon: '🌱', iconClass: 'si-blue',
    title: 'Trauma Counseling',
    desc: 'Specialized, trauma-informed therapy to help you process difficult experiences and rebuild a sense of safety.',
    features: ['Trauma-informed approach', 'EMDR & grounding techniques', 'Safe, paced sessions', 'Nervous system regulation support'],
    specialties: ['Trauma', 'PTSD', 'EMDR', 'Safety'],
    overview: 'Specialized, trauma-informed therapy using approaches like EMDR and grounding techniques to help you process difficult or overwhelming experiences at a safe, manageable pace — with your sense of safety and control as the top priority throughout.',
    whoFor: [
      "You've experienced a distressing or traumatic event, recent or past",
      'You experience flashbacks, hypervigilance, or emotional numbness',
      'You want to work through trauma without being forced to relive it in detail',
      "You're looking for a trauma-informed therapist experienced with PTSD",
    ],
    duration: '60 minutes',
    format: 'Online or in-person',
    frequency: 'Weekly, at a pace set by you',
    process: [
      { title: 'Safety First', desc: 'Establishing trust and safety before any trauma processing begins.' },
      { title: 'Stabilization', desc: 'Building grounding and nervous system regulation tools.' },
      { title: 'Trauma Processing', desc: 'Using EMDR or other trauma-informed techniques, paced entirely to your comfort.' },
      { title: 'Integration', desc: 'Consolidating progress and building long-term resilience.' },
    ],
    faqs: [
      { q: 'Will I have to describe my trauma in detail?', a: "No — trauma-informed approaches like EMDR don't require you to recount every detail to be effective." },
      { q: 'What is EMDR?', a: 'Eye Movement Desensitization and Reprocessing — a structured, evidence-based therapy technique for processing traumatic memories.' },
      { q: "How do I know if I'm ready for trauma counseling?", a: "If you're considering it, that's often enough of a sign. Your therapist will move at whatever pace feels safe for you." },
    ],
  },
]

const allTags = ['All', ...Array.from(new Set(allServices.flatMap(s => s.specialties)))]

// ── Glass card palette ─────────────────────────────────────────
const GLASS = {
  bg:        'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)',
  bgHover:   'linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(200,232,250,0.68) 55%, rgba(255,255,255,0.78) 100%)',
  border:    '1px solid rgba(255,255,255,0.55)',
  borderHov: '1px solid rgba(120,190,230,0.65)',
}

export default function ServicesPage() {
  const { navigate } = useRouter()
  const [activeTag, setActiveTag] = useState('All')
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const visibleServices = activeTag === 'All'
    ? allServices
    : allServices.filter(s => s.specialties.includes(activeTag))

  return (
    <div className="page-wrapper">
      <div
        className="page-hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '4rem 2rem 5rem',
          textAlign: 'center',
          borderRadius: '0 0 60% 60% / 0 0 40px 40px',
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, rgba(180,230,210,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 70% 80% at 80% 20%, rgba(186,220,248,0.5) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 60% 80%, rgba(254,243,199,0.45) 0%, transparent 60%),
            linear-gradient(160deg, #f0faf5 0%, #e8f4fb 45%, #fefce8 100%)
          `,
        }}
      >
        <div style={{
          position: 'absolute', width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(0,123,168,0.12)', filter: 'blur(32px)',
          top: -40, right: '5%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(29,158,117,0.1)', filter: 'blur(32px)',
          bottom: -20, left: '8%', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <span className="section-tag">All Services</span>
          <h1 className="section-title">Everything You Need for <em>Mental Wellness</em></h1>
          <p className="section-desc">
            Comprehensive, evidence-based mental health services designed for the Nepali community.
          </p>
        </div>
      </div>

      <div className="section" style={{ background: 'var(--white)' }}>

        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.6rem',
            marginBottom: '3rem',
            padding: '0 1rem',
          }}
        >
          {allTags.map(tag => {
            const active = tag === activeTag
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  border: active ? '1px solid transparent' : '1px solid #d8e3df',
                  background: active
                    ? 'linear-gradient(135deg, #1d9e75, #007ba8)'
                    : '#fff',
                  color: active ? '#fff' : '#3a4a45',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: active ? '0 4px 14px rgba(29,158,117,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transform: active ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {tag}
              </button>
            )
          })}
        </div>

        <div className="services-grid-full">
          {visibleServices.map((s, i) => {
            const isHovered = hoveredIdx === i
            return (
              <div
                className="service-card-full"
                key={s.title}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  background: isHovered ? GLASS.bgHover : GLASS.bg,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isHovered ? GLASS.borderHov : GLASS.border,
                  transform: isHovered ? 'translateY(-8px) scale(1.015)' : 'translateY(0) scale(1)',
                  boxShadow: isHovered
                    ? '0 20px 44px rgba(0,123,168,0.22), 0 6px 16px rgba(29,158,117,0.14), inset 0 1px 0 rgba(255,255,255,0.6)'
                    : '0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.5)',
                  borderRadius: '20px',
                  transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, background 0.35s ease, border 0.35s ease',
                  animation: `fadeSlideIn 0.5s ease both`,
                  animationDelay: `${i * 0.06}s`,
                }}
                onClick={() => navigate('/book', { serviceTitle: s.title, serviceSpecialties: s.specialties })}
              >
                <button
                  aria-label={`View details for ${s.title}`}
                  onClick={(e) => { e.stopPropagation(); navigate(`/services/${slugify(s.title)}`) }}
                  style={{
                    position: 'absolute',
                    top: '14px',
                    right: '14px',
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.6)',
                    background: 'rgba(255,255,255,0.65)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(0,60,100,0.12)',
                    transition: 'transform 0.2s ease, background 0.2s ease',
                    zIndex: 2,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.9)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.65)' }}
                >
                  👁️
                </button>
                <div
                  className={`service-icon ${s.iconClass}`}
                  style={{
                    transform: isHovered ? 'scale(1.12) rotate(-4deg)' : 'scale(1)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  {s.icon}
                </div>

                <h3 className="service-card-title">{s.title}</h3>
                <p className="service-card-desc">{s.desc}</p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {s.specialties.map(tag => (
                    <span
                      key={tag}
                      onClick={(e) => { e.stopPropagation(); setActiveTag(tag) }}
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '999px',
                        background: 'rgba(29,158,117,0.1)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(29,158,117,0.15)',
                        color: '#1d9e75',
                        cursor: 'pointer',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <ul className="service-card-features">
                  {s.features.map((f, j) => (
                    <li key={j}>
                      <span className="service-card-check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className="btn btn-primary service-card-btn"
                  style={{
                    background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)',
                    boxShadow: '0 6px 18px rgba(0,150,210,0.3)',
                    border: 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('/book', { serviceTitle: s.title, serviceSpecialties: s.specialties })
                  }}
                >
                  Book This Service
                </button>
              </div>
            )
          })}
        </div>

        {visibleServices.length === 0 && (
          <p style={{ textAlign: 'center', color: '#7a8a85', marginTop: '2rem' }}>
            No services match that filter.
          </p>
        )}
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}