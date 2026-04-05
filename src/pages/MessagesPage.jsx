import { useEffect } from 'react'

/* ─── injected CSS ─── */
const PAGE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,600&family=Lora:ital,wght@0,400;0,500;1,400&family=Nunito:wght@300;400;600;700;800&display=swap');

  /* ── Keyframes ── */
  @keyframes mp-fadeup   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes mp-fadein   { from{opacity:0} to{opacity:1} }
  @keyframes mp-lineGrow { from{transform:scaleX(0)} to{transform:scaleX(1)} }
  @keyframes mp-float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes mp-shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes mp-orb      { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(30px,-20px) scale(1.06)} 66%{transform:translate(-20px,15px) scale(0.96)} }
  @keyframes mp-pulse    { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.04)} }
  @keyframes mp-valueIn  { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }

  /* ── Root vars ── */
  :root {
    --mp-sky:    #007BA8;
    --mp-mid:    #009FD4;
    --mp-bright: #00BFFF;
    --mp-faint:  #E0F7FF;
    --mp-ghost:  #F0FBFF;
    --mp-dark:   #0a1e2e;
    --mp-ink:    #1a3a4a;
    --mp-muted:  #2e6080;
    --mp-light:  #7a9aaa;
    --mp-gold:   #c9a227;
    --mp-rose:   #b5546a;
    --mp-sage:   #4a7c59;
  }

  /* ────────────────────────────────────────
     HERO
  ──────────────────────────────────────── */
  .mp-hero {
    background: linear-gradient(160deg,
      #007BA8 0%,
      #009FD4 25%,
      #00BFFF 50%,
      #7dd8f8 70%,
      #c8eefb 85%,
      #e8f9ff 100%
    );
    min-height: 52vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 5rem 2rem 4rem;
    position: relative;
    overflow: hidden;
  }
  .mp-hero-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    animation: mp-orb 9s ease-in-out infinite;
  }
  .mp-hero-kicker {
    font-family: 'Nunito', sans-serif;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #005a80;
    background: rgba(255,255,255,0.45);
    border: 1px solid rgba(255,255,255,0.7);
    border-radius: 100px;
    padding: 0.32rem 1.1rem;
    margin-bottom: 1.5rem;
    display: inline-block;
    animation: mp-fadein 0.8s ease both;
  }
  .mp-hero-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(2.4rem, 5vw, 4rem);
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2px 20px rgba(0,80,130,0.3);
    line-height: 1.12;
    margin-bottom: 1.25rem;
    animation: mp-fadeup 0.9s 0.1s ease both;
  }
  .mp-hero-title em {
    font-style: italic;
    color: #003d5c;
  }
  .mp-hero-sub {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(0.92rem, 2vw, 1.08rem);
    color: rgba(0,55,90,0.78);
    line-height: 1.75;
    max-width: 520px;
    margin: 0 auto;
    animation: mp-fadeup 0.9s 0.2s ease both;
    font-style: italic;
  }
  /* decorative rule under hero */
  .mp-hero-rule {
    width: 80px;
    height: 2px;
    background: linear-gradient(to right, transparent, #fff, transparent);
    margin: 2rem auto 0;
    animation: mp-lineGrow 1s 0.5s ease both;
    transform-origin: center;
  }

  /* ────────────────────────────────────────
     MESSAGES SECTION
  ──────────────────────────────────────── */
  .mp-messages-section {
    background: linear-gradient(135deg,
      #007BA8 0%,
      #00BFFF 12%,
      #c8eefb 28%,
      #ffffff 45%,
      #e8f9ff 58%,
      #ffffff 72%,
      #b8e8fa 85%,
      #00BFFF 95%,
      #009FD4 100%
    );
    padding: 5rem 2rem;
    position: relative;
  }
  .mp-messages-section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(to right, #007BA8, #00BFFF, #22d3ee, #00BFFF, #007BA8);
  }
  .mp-messages-inner {
    max-width: 980px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Each message row */
  .mp-msg-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 0;
    padding: 4.5rem 0;
    position: relative;
    border-bottom: 1px solid rgba(0,159,212,0.1);
    animation: mp-fadeup 0.8s ease both;
  }
  .mp-msg-row:last-child { border-bottom: none; }

  /* Photo side */
  .mp-photo-col {
    padding: 1.5rem 2.5rem 1.5rem 0;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .mp-msg-row.mp-reverse .mp-photo-col {
    padding: 1.5rem 0 1.5rem 2.5rem;
    align-items: flex-end;
    order: 2;
  }
  .mp-msg-row.mp-reverse .mp-text-col { order: 1; }

  .mp-photo-frame {
    position: relative;
    width: 200px;
    height: 220px;
    flex-shrink: 0;
  }
  /* Decorative offset box behind photo */
  .mp-photo-frame::before {
    content: '';
    position: absolute;
    inset: -12px;
    border-radius: 22px;
    border: 2px solid rgba(0,191,255,0.2);
    z-index: 0;
    transition: border-color 0.3s;
  }
  .mp-photo-frame:hover::before { border-color: rgba(0,191,255,0.55); }
  /* Corner accent */
  .mp-photo-frame::after {
    content: '';
    position: absolute;
    bottom: -18px;
    right: -18px;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--mp-sky), var(--mp-bright));
    z-index: 0;
    opacity: 0.35;
  }
  .mp-msg-row.mp-reverse .mp-photo-frame::after {
    right: auto;
    left: -18px;
  }
  .mp-photo-img {
    position: relative;
    z-index: 1;
    width: 200px;
    height: 220px;
    border-radius: 18px;
    object-fit: cover;
    object-position: center top;
    box-shadow: 0 12px 40px rgba(0,80,130,0.2);
    display: block;
  }
  /* Placeholder when no real image */
  .mp-photo-placeholder {
    position: relative;
    z-index: 1;
    width: 200px;
    height: 220px;
    border-radius: 18px;
    background: linear-gradient(135deg, #cfe8f5 0%, #a8d0e8 50%, #85b8d4 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 12px 40px rgba(0,80,130,0.2);
    overflow: hidden;
  }
  .mp-photo-placeholder::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
    background-size: 200% 100%;
    animation: mp-shimmer 2.5s linear infinite;
  }
  .mp-placeholder-icon {
    font-size: 3.5rem;
    filter: drop-shadow(0 2px 8px rgba(0,80,130,0.25));
    position: relative;
    z-index: 1;
  }
  .mp-placeholder-label {
    font-family: 'Nunito', sans-serif;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(0,80,130,0.6);
    margin-top: 0.5rem;
    position: relative;
    z-index: 1;
  }

  /* Name badge below photo */
  .mp-person-badge {
    margin-top: 1.25rem;
    padding-left: 0.5rem;
  }
  .mp-msg-row.mp-reverse .mp-person-badge {
    padding-left: 0;
    padding-right: 0.5rem;
    text-align: right;
  }
  .mp-person-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--mp-ink);
    line-height: 1.2;
  }
  .mp-person-role {
    font-family: 'Nunito', sans-serif;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--mp-bright);
    margin-top: 0.18rem;
  }

  /* Text side */
  .mp-text-col {
    padding: 2.25rem 2.5rem;
    position: relative;
    background: linear-gradient(135deg, rgba(0,191,255,0.07) 0%, rgba(255,255,255,0.9) 40%, rgba(224,247,255,0.6) 100%);
    border-radius: 22px;
    border: 1.5px solid rgba(0,191,255,0.18);
    box-shadow: 0 4px 28px rgba(0,123,168,0.08);
    backdrop-filter: blur(8px);
  }
  .mp-msg-row.mp-reverse .mp-text-col {
    padding: 2.25rem 2.5rem;
    text-align: right;
    background: linear-gradient(225deg, rgba(0,191,255,0.07) 0%, rgba(255,255,255,0.9) 40%, rgba(224,247,255,0.6) 100%);
  }

  /* Large decorative opening quote */
  .mp-quote-mark {
    font-family: 'Playfair Display', serif;
    font-size: 5rem;
    line-height: 0.7;
    background: linear-gradient(135deg, #007BA8, #00BFFF);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline;
    margin-right: 0.1em;
    font-style: italic;
    user-select: none;
    vertical-align: -0.3em;
    float: left;
    margin-top: 0.15em;
  }
  .mp-msg-row.mp-reverse .mp-quote-mark {
    float: right;
    margin-right: 0;
    margin-left: 0.1em;
  }

  .mp-message-text {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(0.92rem, 1.8vw, 1.02rem);
    line-height: 1.92;
    color: #1e3d52;
    font-style: italic;
    display: inline;
  }
  .mp-message-body {
    overflow: hidden;
    margin-bottom: 1.4rem;
  }
  .mp-message-signature {
    font-family: 'Nunito', sans-serif;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--mp-muted);
    letter-spacing: 0.05em;
    display: block;
    clear: both;
    padding-top: 1rem;
    border-top: 1px solid rgba(0,191,255,0.2);
    margin-top: 0.5rem;
  }
  .mp-message-signature::before {
    content: '— ';
    color: var(--mp-bright);
  }

  /* Vertical timeline dot between rows */
  .mp-timeline-dot {
    position: absolute;
    left: 50%;
    bottom: -18px;
    transform: translateX(-50%);
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--mp-sky), var(--mp-bright));
    border: 4px solid #E8F6FF;
    z-index: 5;
    box-shadow: 0 0 0 6px rgba(0,191,255,0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    color: white;
  }

  /* ────────────────────────────────────────
     VALUES SECTION
  ──────────────────────────────────────── */
  .mp-values-section {
    background: linear-gradient(160deg, #0a1e2e 0%, #0f2d42 45%, #0d2535 100%);
    padding: 6rem 2rem;
    position: relative;
    overflow: hidden;
  }
  .mp-values-bg-circle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .mp-values-header {
    text-align: center;
    margin-bottom: 4.5rem;
    position: relative;
    z-index: 2;
  }
  .mp-values-kicker {
    font-family: 'Nunito', sans-serif;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--mp-gold);
    display: inline-block;
    margin-bottom: 1rem;
  }
  .mp-values-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 4vw, 3.2rem);
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 1.1rem;
  }
  .mp-values-title em {
    font-style: italic;
    color: #a8d8f0;
  }
  .mp-values-tagline {
    font-family: 'Lora', serif;
    font-style: italic;
    font-size: clamp(0.95rem, 2vw, 1.1rem);
    color: rgba(255,255,255,0.55);
    max-width: 540px;
    margin: 0 auto;
    line-height: 1.75;
  }

  /* Values grid */
  .mp-values-grid {
    max-width: 1060px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.75rem;
    position: relative;
    z-index: 2;
  }

  .mp-value-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 2.25rem 1.8rem;
    transition: all 0.32s cubic-bezier(0.34,1.4,0.64,1);
    position: relative;
    overflow: hidden;
    cursor: default;
  }
  .mp-value-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(0,191,255,0.06) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s;
    border-radius: inherit;
  }
  .mp-value-card:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(0,191,255,0.28);
    transform: translateY(-6px);
    box-shadow: 0 20px 50px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,191,255,0.2);
  }
  .mp-value-card:hover::before { opacity: 1; }

  /* Accent top line per card */
  .mp-value-card-accent {
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    border-radius: 24px 24px 0 0;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .mp-value-card:hover .mp-value-card-accent { opacity: 1; }

  .mp-value-icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    margin-bottom: 1.4rem;
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }
  .mp-value-card:hover .mp-value-icon-wrap { transform: scale(1.1) rotate(-4deg); }

  .mp-value-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 0.65rem;
    line-height: 1.2;
    position: relative;
    z-index: 1;
  }
  .mp-value-desc {
    font-family: 'Lora', serif;
    font-size: 0.88rem;
    line-height: 1.82;
    color: rgba(255,255,255,0.58);
    position: relative;
    z-index: 1;
    margin-bottom: 1.1rem;
  }
  .mp-value-quote {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 0.82rem;
    line-height: 1.65;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 0.9rem;
    position: relative;
    z-index: 1;
    transition: color 0.3s;
  }
  .mp-value-card:hover .mp-value-quote { color: rgba(255,255,255,0.82); }

  /* ── Signature quote at bottom of values ── */
  .mp-values-closing {
    text-align: center;
    margin-top: 4.5rem;
    position: relative;
    z-index: 2;
    max-width: 680px;
    margin-left: auto;
    margin-right: auto;
  }
  .mp-values-big-quote {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: clamp(1.3rem, 3vw, 1.9rem);
    color: rgba(255,255,255,0.85);
    line-height: 1.55;
    margin-bottom: 1rem;
  }
  .mp-values-big-quote strong {
    color: #a8d8f0;
    font-style: normal;
  }
  .mp-values-attribution {
    font-family: 'Nunito', sans-serif;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--mp-gold);
  }
  .mp-values-rule {
    width: 60px;
    height: 1px;
    background: rgba(201,162,39,0.4);
    margin: 1.1rem auto;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .mp-values-grid { grid-template-columns: repeat(2, 1fr); }
    .mp-msg-row {
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 3rem 0;
    }
    .mp-photo-col,
    .mp-msg-row.mp-reverse .mp-photo-col {
      padding: 0;
      align-items: center;
      order: 1;
    }
    .mp-text-col,
    .mp-msg-row.mp-reverse .mp-text-col {
      padding: 0;
      text-align: left;
      order: 2;
    }
    .mp-msg-row.mp-reverse .mp-quote-mark { text-align: left; }
    .mp-msg-row.mp-reverse .mp-person-badge {
      padding-right: 0;
      text-align: left;
    }
    .mp-timeline-dot { display: none; }
  }
  @media (max-width: 600px) {
    .mp-values-grid { grid-template-columns: 1fr; }
    .mp-photo-frame, .mp-photo-img, .mp-photo-placeholder { width: 160px; height: 176px; }
    .mp-messages-section { padding: 3rem 1.25rem; }
    .mp-values-section { padding: 4rem 1.25rem; }
  }
`

function injectCSS(id, css) {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  const el = document.createElement('style')
  el.id = id
  el.textContent = css
  document.head.appendChild(el)
}

/* ── Data ── */
const MESSAGES = [
  {
    name:  'Sanjeev Neupane',
    role:  'Executive Director',
    photo: '/images/staff/director.jpg',
    emoji: '🧑‍💼',
    color: 'linear-gradient(135deg,#007BA8,#00BFFF)',
    faint: 'rgba(0,191,255,0.15)',
    message: `When I founded Puja Samargi, I carried a single conviction: that mental health is not a luxury, but a birthright. In Nepal, too many families suffer in silence — not because they lack strength, but because no one told them that asking for help is the bravest thing a person can do.

Our center exists to change that. Every session we hold, every family we walk alongside, is a quiet act of revolution. We are building a Nepal where the mind is treated with the same urgency as the body — with compassion, skill, and unwavering dignity.Saying all this, One value we keep close to our heart is, 'Its Your Choice'. If you feel we can help and can connect with you then only seek our help and follow.`,
    sign: 'Sanjeev Neupane, Executive Director',
  },
  {
    name:  'Pramila Pradhan',
    role:  'Lead Clinical Psychologist',
    photo: '/images/staff/therapist.jpg',
    emoji: '👩‍⚕️',
    color: 'linear-gradient(135deg,#2d6a4f,#52b788)',
    faint: 'rgba(82,183,136,0.15)',
    message: `In fifteen years of practice, the question I am asked most is: "Will I ever feel better?" And every time, my answer is the same — yes. Not because healing is easy, but because the human mind is staggeringly resilient when it is held in the right environment.

Therapy is not about fixing what is broken. It is about revealing what was never truly lost. I have the privilege every day of sitting with people at their most honest, and watching them discover that the version of themselves they were searching for was already inside them, waiting.`,
    sign: 'Pramila Pradhan, Lead Clinical Psychologist',
  },
  {
    name:  'Dipak Pokhrel',
    role:  'Operations & Outreach Manager',
    photo: '/images/staff/manager.jpg',
    emoji: '🧑‍💼',
    color: 'linear-gradient(135deg,#7b2d8b,#c77dff)',
    faint: 'rgba(199,125,255,0.15)',
    message: `Behind every therapy room is a system of people who believe that access to mental healthcare should never depend on your postcode or your bank balance. My team works every day to make Puja Samargi reachable — to the parent in Butwal, the student in Pokhara, the young professional in Kathmandu who finally decided today was the day.

We are building partnerships with schools, clinics, and community organisations across Nepal. Because mental wellness does not happen in isolation — it happens in communities that care.`,
    sign: 'Dipak Pokhrel, Operations & Outreach Manager',
  },
]

const VALUES = [
  {
    icon: '🌱',
    name: 'Dignity First',
    color: 'linear-gradient(135deg,#007BA8,#00BFFF)',
    accent: 'linear-gradient(90deg,#007BA8,#00BFFF)',
    desc: 'Every person who walks through our door is treated as whole, worthy, and deserving of the best care. We refuse to pathologise or diminish. Mental health struggles are human experiences, not character flaws.',
    quote: '"We see the person before we see the diagnosis."',
  },
  {
    icon: '🤝',
    name: 'Radical Compassion',
    color: 'linear-gradient(135deg,#2d6a4f,#74c69d)',
    accent: 'linear-gradient(90deg,#2d6a4f,#74c69d)',
    desc: 'Compassion is not passive sympathy. It is the active choice to enter someone\'s pain, to resist judgment, and to stay present. We train our therapists not just in technique, but in the deeper art of truly seeing another person.',
    quote: '"The antidote to shame is empathy — always."',
  },
  {
    icon: '🔬',
    name: 'Evidence-Based Practice',
    color: 'linear-gradient(135deg,#944f2c,#e07040)',
    accent: 'linear-gradient(90deg,#944f2c,#e07040)',
    desc: 'We do not trade in promises. Every therapeutic approach at Puja Samargi is grounded in peer-reviewed research, clinical evidence, and continuous professional development. Our clients deserve interventions that actually work.',
    quote: '"Science and soul are not opposites — they are partners."',
  },
  {
    icon: '🌏',
    name: 'Cultural Rootedness',
    color: 'linear-gradient(135deg,#c9a227,#f5c842)',
    accent: 'linear-gradient(90deg,#c9a227,#f5c842)',
    desc: 'We are Nepali. Our practice honours the cultural fabric of our communities — the weight of collective identity, the complexity of intergenerational relationships, the spiritual dimensions of wellbeing that Western models often overlook.',
    quote: '"Healing must speak the language of the healed."',
  },
  {
    icon: '🔓',
    name: 'Accessibility for All',
    color: 'linear-gradient(135deg,#7b2d8b,#c77dff)',
    accent: 'linear-gradient(90deg,#7b2d8b,#c77dff)',
    desc: 'Mental healthcare has too long been a privilege. We offer sliding-scale fees, online sessions, community outreach, and partnerships with schools and workplaces — because geography and income must not determine whether someone gets help.',
    quote: '"A locked door is not a waiting room."',
  },
  {
    icon: '♾️',
    name: 'Lifelong Growth',
    color: 'linear-gradient(135deg,#b5546a,#e88fa0)',
    accent: 'linear-gradient(90deg,#b5546a,#e88fa0)',
    desc: 'Wellness is not a destination. We nurture a culture of ongoing learning — for our therapists, our clients, and ourselves. We regularly review, adapt, and evolve our practices because the communities we serve are always growing too.',
    quote: '"We are perpetual students of the human story."',
  },
]

/* ── Photo placeholder component ── */
function PhotoPlaceholder({ emoji }) {
  return (
    <div className="mp-photo-placeholder">
      <span className="mp-placeholder-icon">{emoji}</span>
      <span className="mp-placeholder-label">Add Photo</span>
    </div>
  )
}

/* ── Single message row ── */
function MessageRow({ person, reverse, delay }) {
  return (
    <div
      className={`mp-msg-row${reverse ? ' mp-reverse' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Photo column */}
      <div className="mp-photo-col">
        <div className="mp-photo-frame">
          {/* Real image with placeholder fallback */}
          <img
            src={person.photo}
            alt={person.name}
            className="mp-photo-img"
            onError={e => {
              e.target.style.display = 'none'
              const ph = e.target.nextSibling
              if (ph) ph.style.display = 'flex'
            }}
          />
          <PhotoPlaceholder emoji={person.emoji} />
        </div>
        <div className="mp-person-badge">
          <div className="mp-person-name">{person.name}</div>
          <div className="mp-person-role">{person.role}</div>
        </div>
      </div>

      {/* Message column */}
      <div className="mp-text-col">
        <div className="mp-message-body">
          <span className="mp-quote-mark">"</span>
          <span className="mp-message-text">
            {person.message.replace(/\n\n/g, ' ')}
          </span>
        </div>
        <div className="mp-message-signature">{person.sign}</div>
      </div>

      {/* Timeline dot */}
      <div className="mp-timeline-dot">✦</div>
    </div>
  )
}

/* ── Value card ── */
function ValueCard({ v, delay }) {
  return (
    <div className="mp-value-card" style={{ animationDelay: `${delay}s` }}>
      <div className="mp-value-card-accent" style={{ background: v.accent }} />
      <div className="mp-value-icon-wrap" style={{ background: v.color }}>
        {v.icon}
      </div>
      <div className="mp-value-name">{v.name}</div>
      <p className="mp-value-desc">{v.desc}</p>
      <div className="mp-value-quote" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {v.quote}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════ */
export default function MessagesPage() {

  useEffect(() => {
    injectCSS('messages-page-css', PAGE_CSS)
    // Hide the placeholder sibling when image loads fine
    document.querySelectorAll('.mp-photo-img').forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        const ph = img.nextSibling
        if (ph) ph.style.display = 'none'
      } else {
        img.addEventListener('load', () => {
          const ph = img.nextSibling
          if (ph) ph.style.display = 'none'
        })
      }
    })
  }, [])

  return (
    <div className="page-wrapper">

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <div className="mp-hero">
        {/* Ambient orbs */}
        <div className="mp-hero-orb" style={{ width:420, height:420, top:'5%', right:'-8%', background:'radial-gradient(circle,rgba(255,255,255,0.35),transparent 70%)', animationDuration:'11s' }} />
        <div className="mp-hero-orb" style={{ width:300, height:300, bottom:'10%', left:'-5%', background:'radial-gradient(circle,rgba(0,100,160,0.18),transparent 70%)', animationDuration:'8s', animationDelay:'-3s' }} />

        <span className="mp-hero-kicker">Puja Samargi Mental Wellness</span>
        <h1 className="mp-hero-title">
          Words from the<br />
          <em>Hearts That Lead</em>
        </h1>
        <p className="mp-hero-sub">
          Messages from our director, therapists, and team —
          the people behind every act of care this centre provides.
        </p>
        <div className="mp-hero-rule" />
      </div>

      {/* ════════════════════════════════════════
          MESSAGES
      ════════════════════════════════════════ */}
      <div className="mp-messages-section">
        {/* Thin top accent */}
        <div style={{ height:4, background:'linear-gradient(to right,transparent,#00BFFF,transparent)', marginBottom:'1rem', maxWidth:300, margin:'0 auto 1rem' }} />

        <div className="mp-messages-inner">
          {MESSAGES.map((person, i) => (
            <MessageRow
              key={i}
              person={person}
              reverse={i % 2 !== 0}
              delay={i * 0.15}
            />
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════
          OUR VALUES
      ════════════════════════════════════════ */}
      <div className="mp-values-section">
        {/* Background circles */}
        <div className="mp-values-bg-circle" style={{ width:600, height:600, top:'-15%', right:'-10%', background:'radial-gradient(circle,rgba(0,191,255,0.06),transparent 65%)', animation:'mp-pulse 8s ease-in-out infinite' }} />
        <div className="mp-values-bg-circle" style={{ width:400, height:400, bottom:'5%', left:'-8%', background:'radial-gradient(circle,rgba(201,162,39,0.06),transparent 65%)', animation:'mp-pulse 10s ease-in-out infinite 2s' }} />

        <div className="mp-values-header">
          <div className="mp-values-kicker">What We Stand For</div>
          <h2 className="mp-values-title">
            Our <em>Values</em>
          </h2>
          <p className="mp-values-tagline">
            Six principles that shape every decision, every conversation,
            and every act of healing that happens within these walls.
          </p>
        </div>

        <div className="mp-values-grid">
          {VALUES.map((v, i) => (
            <ValueCard key={i} v={v} delay={i * 0.1} />
          ))}
        </div>

        {/* Closing signature quote */}
        <div className="mp-values-closing">
          <div className="mp-values-rule" />
          <p className="mp-values-big-quote">
            "Mental health is not the absence of struggle.
            It is the presence of <strong>someone willing to help you carry it.</strong>"
          </p>
          <div className="mp-values-rule" />
          <div className="mp-values-attribution">Puja Samargi · Est. 2018 · Kathmandu, Nepal</div>
        </div>
      </div>

    </div>
  )
}