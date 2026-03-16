import { useRouter } from '../context/RouterContext'

export default function Hero() {
  const { navigate } = useRouter()

  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <span>🌿</span> Nepal's Trusted Mental Wellness Platform
        </div>

        <h1>
          We Are Here To <i>Help</i>
        </h1>

        <p className="hero-desc">
          Professional therapy, self-assessment tools, and wellness resources — 
          all in one compassionate space. Connect with certified therapists from the comfort of your home.
        </p>

        <div className="hero-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/book')}
          >
            Book a Free Consultation →
          </button>
          <button
            className="btn btn-outline btn-lg"
            onClick={() => navigate('/assessments')}
          >
            Take an Assessment
          </button>
        </div>

        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">500+</div>
            <div className="hero-stat-label">Clients Helped</div>
          </div>
          <div>
            <div className="hero-stat-num">12</div>
            <div className="hero-stat-label">Expert Therapists</div>
          </div>
          <div>
            <div className="hero-stat-num">4.9★</div>
            <div className="hero-stat-label">Average Rating</div>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-card-stack">

          {/* ── MAIN CARD: Psychology Mind Illustration ── */}
          <div className="hero-main-card">
            <div className="hero-card-img">
              <svg
                className="psych-art"
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: '100%', height: '100%' }}
              >
                <defs>
                  {/* Sky-blue radial gradient background */}
                  <radialGradient id="bgGrad" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#e0f4ff" />
                    <stop offset="100%" stopColor="#87ceeb" />
                  </radialGradient>

                  {/* Soft glow for the head */}
                  <radialGradient id="headGlow" cx="50%" cy="40%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#bde8ff" stopOpacity="0.4" />
                  </radialGradient>

                  {/* Pulse animation glow */}
                  <radialGradient id="pulseGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#87ceeb" stopOpacity="0" />
                  </radialGradient>

                  <filter id="softGlow">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Background circle */}
                <circle cx="100" cy="100" r="98" fill="url(#bgGrad)" />

                {/* Subtle concentric ripple rings — calm/peace metaphor */}
                <circle cx="100" cy="100" r="75" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.35">
                  <animate attributeName="r" values="75;82;75" dur="4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0.1;0.35" dur="4s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="100" r="60" fill="none" stroke="#ffffff" strokeWidth="0.6" opacity="0.25">
                  <animate attributeName="r" values="60;68;60" dur="4s" begin="0.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.25;0.07;0.25" dur="4s" begin="0.5s" repeatCount="indefinite" />
                </circle>

                {/* ── Human Head Silhouette ── */}
                {/* Neck */}
                <rect x="88" y="128" width="24" height="18" rx="4" fill="url(#headGlow)" opacity="0.85" />
                {/* Head shape */}
                <ellipse cx="100" cy="100" rx="36" ry="42" fill="url(#headGlow)" filter="url(#softGlow)" />

                {/* ── Brain outline inside head ── */}
                <g opacity="0.55" stroke="#1a7fc4" strokeWidth="1.2" fill="none">
                  {/* Left hemisphere */}
                  <path d="M82 96 C75 88, 74 78, 80 72 C86 66, 94 67, 98 72" />
                  {/* Right hemisphere */}
                  <path d="M118 96 C125 88, 126 78, 120 72 C114 66, 106 67, 102 72" />
                  {/* Centre divide */}
                  <line x1="100" y1="72" x2="100" y2="108" strokeDasharray="2,2" opacity="0.5" />
                  {/* Brain folds left */}
                  <path d="M80 82 C77 80, 76 85, 79 87" strokeWidth="1" />
                  <path d="M78 92 C75 90, 74 96, 78 97" strokeWidth="1" />
                  {/* Brain folds right */}
                  <path d="M120 82 C123 80, 124 85, 121 87" strokeWidth="1" />
                  <path d="M122 92 C125 90, 126 96, 122 97" strokeWidth="1" />
                </g>

                {/* ── Neural synapse nodes ── */}
                {/* Nodes */}
                <circle cx="88" cy="80" r="3" fill="#1a7fc4" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="2.2s" repeatCount="indefinite" />
                </circle>
                <circle cx="112" cy="80" r="3" fill="#1a7fc4" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;1;0.8" dur="2.2s" begin="0.4s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="76" r="2.5" fill="#ffffff" opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.4;0.9" dur="2.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="83" cy="95" r="2" fill="#5ab8f5" opacity="0.75">
                  <animate attributeName="opacity" values="0.75;1;0.75" dur="3.1s" begin="0.8s" repeatCount="indefinite" />
                </circle>
                <circle cx="117" cy="95" r="2" fill="#5ab8f5" opacity="0.75">
                  <animate attributeName="opacity" values="0.75;1;0.75" dur="3.1s" begin="1.2s" repeatCount="indefinite" />
                </circle>

                {/* Synapse connection lines */}
                <line x1="88" y1="80" x2="100" y2="76" stroke="#5ab8f5" strokeWidth="0.8" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
                </line>
                <line x1="112" y1="80" x2="100" y2="76" stroke="#5ab8f5" strokeWidth="0.8" opacity="0.6">
                  <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
                </line>
                <line x1="83" y1="95" x2="88" y2="80" stroke="#5ab8f5" strokeWidth="0.7" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3s" begin="0.6s" repeatCount="indefinite" />
                </line>
                <line x1="117" y1="95" x2="112" y2="80" stroke="#5ab8f5" strokeWidth="0.7" opacity="0.5">
                  <animate attributeName="opacity" values="0.5;0.15;0.5" dur="3s" begin="1s" repeatCount="indefinite" />
                </line>

                {/* ── Heart rate / EEG wave below head ── */}
                <g opacity="0.7">
                  <polyline
                    points="64,150 72,150 76,142 80,158 84,144 88,154 92,150 108,150 112,144 116,158 120,142 124,150 128,150 136,150"
                    fill="none"
                    stroke="#1a7fc4"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <animate attributeName="opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite" />
                  </polyline>
                </g>

                {/* ── Floating wellness symbols ── */}
                {/* Left: small lotus */}
                <g transform="translate(30, 90)" opacity="0.75">
                  <ellipse cx="0" cy="0" rx="6" ry="10" fill="#ffffff" opacity="0.7" transform="rotate(-20)" />
                  <ellipse cx="0" cy="0" rx="6" ry="10" fill="#bde8ff" opacity="0.6" />
                  <ellipse cx="0" cy="0" rx="6" ry="10" fill="#ffffff" opacity="0.7" transform="rotate(20)" />
                  <ellipse cx="0" cy="2" rx="3" ry="5" fill="#87ceeb" opacity="0.9" />
                  <animate attributeName="opacity" values="0.75;1;0.75" dur="3.5s" repeatCount="indefinite" />
                </g>

                {/* Right: small star/sparkle */}
                <g transform="translate(168, 85)" opacity="0.8">
                  <line x1="0" y1="-8" x2="0" y2="8" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="-8" y1="0" x2="8" y2="0" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="-5" y1="-5" x2="5" y2="5" stroke="#bde8ff" strokeWidth="1" />
                  <line x1="5" y1="-5" x2="-5" y2="5" stroke="#bde8ff" strokeWidth="1" />
                  <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2.6s" repeatCount="indefinite" />
                  <animateTransform attributeName="transform" type="rotate" from="0 168 85" to="360 168 85" dur="8s" repeatCount="indefinite" additive="sum" />
                </g>

                {/* Top: infinity loop — endless healing */}
                <g transform="translate(100, 42)" opacity="0.6">
                  <path
                    d="M-14,0 C-14,-8 -4,-8 0,0 C4,8 14,8 14,0 C14,-8 4,-8 0,0 C-4,8 -14,8 -14,0 Z"
                    fill="none" stroke="#ffffff" strokeWidth="1.5"
                  >
                    <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
                  </path>
                </g>
              </svg>
            </div>

            <div className="hero-card-overlay">
              <div className="hero-card-name">Dr. Anita Shrestha</div>
              <div className="hero-card-role">Clinical Psychologist · 8 yrs exp.</div>
              <div className="hero-card-avail">
                <span className="dot" /> Available Today — NPR 2,000/session
              </div>
            </div>
          </div>

          {/* Floating cards remain unchanged */}
          <div className="floating-card fc-1" style={{ cursor: 'pointer' }} onClick={() => navigate('/resources')}>
            <div className="fc-icon green">🧘</div>
            <div>
              <div className="fc-label">Mood Tracker</div>
              <div className="fc-sub">Log your daily mood</div>
            </div>
          </div>

          <div className="floating-card fc-2" style={{ cursor: 'pointer' }} onClick={() => navigate('/assessments')}>
            <div className="fc-label" style={{ marginBottom: '4px' }}>📋 PHQ-9 Completed</div>
            <div className="fc-sub">Score: Mild — See recommendations →</div>
          </div>

        </div>
      </div>
    </section>
  )
}