import React, { useState, useEffect, useCallback } from "react";

/**
 * WELLSPRING — flask donate section (v4)
 *
 * Changes from v3:
 * - The horn now carries a visible column of water through it: a thick
 *   blue stroke runs along the horn's centerline, from inside the
 *   flask's own water body out to the mouth, using the same gradient
 *   family as the water fill and the pour. The glass shell sits on top
 *   of that water, so it reads as one continuous piece of plumbing —
 *   water visible the whole way from body to pool — instead of a
 *   glass nub with water only appearing after it exits.
 * - The horn's attach point sits inside the flask's water line (not
 *   above it against bare glass), so the water column connects to
 *   something real.
 * - Overall much more compact: smaller flask, tighter stats card,
 *   smaller type, less padding — and the two-column row (flask on the
 *   left, stats + button stacked to its right) now holds until a much
 *   narrower width before stacking, so it stays side-by-side.
 */

const TOKENS = {
  oceanInk: "#003850",
  oceanDeep: "#005580",
  oceanCore: "#007BA8",
  oceanBright: "#00BFFF",
  oceanPale: "#F0FBFF",
  mist: "#F4FAF9",
  dim: "#4d7c94",
  glassBorder: "rgba(255,255,255,0.4)",
};

const DONATE_URL = "https://wellspring.org/give?src=hero-flask";

const DESTINATIONS = [
  { icon: "🏠", label: "Family", x: 150 },
  { icon: "🏫", label: "School", x: 260 },
  { icon: "🏘️", label: "Village", x: 370 },
];

const API_BASE = "https://puja-backend-gamma.vercel.app";
const STATS_ENDPOINT = `${API_BASE}/api/donations/stats`;

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return reduced;
}

function useDonationStats() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    litersThisMonth: 0,
    peopleReached: 0,
    wellsFunded: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(STATS_ENDPOINT);
        if (!res.ok) throw new Error(`Stats request failed: ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setState({
          loading: false,
          error: null,
          litersThisMonth: Number(data.litersThisMonth) || 0,
          peopleReached: Number(data.peopleReached) || 0,
          wellsFunded: Number(data.wellsFunded) || 0,
        });
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({ ...prev, loading: false, error: err.message }));
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

function formatLiters(n) {
  return `Rs. ${n.toLocaleString()}`;
}

function formatCount(n) {
  return n.toLocaleString();
}

function DonateModal({ open, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(DONATE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable, ignore */
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Give a drop of water"
      onClick={onClose}
      className="wf-modal-overlay"
    >
      <div onClick={(e) => e.stopPropagation()} className="wf-modal">
        <button onClick={onClose} aria-label="Close" className="wf-modal-close">
          ✕
        </button>

        <span className="wf-modal-eyebrow">Every drop counted</span>
        <h3 className="wf-modal-title">Give a drop</h3>
        <p className="wf-modal-sub">Scan to send directly — no account needed.</p>

        <div className="wf-qr-card">
          <img
            src="/bank-qr.png"
            width={200}
            height={200}
            alt="QR code linking to the Wellspring donation page"
            className="wf-qr-img"
          />
        </div>

        <button onClick={copyLink} className="wf-copy-btn">
          {copied ? "Copied ✓" : "Copy link instead"}
        </button>
      </div>
    </div>
  );
}

function FlaskVisual({ onGive }) {
  const drops = [0, 1, 2].map((i) => ({
    x: 194 + i * 10 - 10,
    delay: i * 1.0,
    dur: 2.8 + (i % 2) * 0.4,
  }));

  // Horn centerline: starts INSIDE the flask's water body (well below
  // the water line at y=260, so it visually connects to the liquid,
  // not to bare glass) and runs out to the open mouth.
  const hornStart = { x: 262, y: 336 };
  const mouth = { x: 356, y: 392, angle: 34 };
  const hornCenterline = `M${hornStart.x} ${hornStart.y} C 300 332 332 346 350 368 C 356 376 356 384 ${mouth.x} ${mouth.y}`;

  // The pour continues in the same direction the horn is pointing
  // before curving down into the pool, so body -> horn -> pour reads
  // as one unbroken column of water.
  const pourPath = `M${mouth.x} ${mouth.y} C 372 414 372 438 356 458 C 338 480 306 492 268 496`;

  const pool = { cx: 258, cy: 498, rx: 128, ry: 26 };

  return (
    <button onClick={onGive} aria-label="Tap the flask to give a drop of water" className="wf-flask-btn">
      <svg viewBox="0 0 440 560" width="440" height="560" className="wf-flask-svg">
        <defs>
          <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TOKENS.oceanPale} />
            <stop offset="42%" stopColor={TOKENS.oceanBright} />
            <stop offset="78%" stopColor={TOKENS.oceanCore} />
            <stop offset="100%" stopColor={TOKENS.oceanDeep} />
          </linearGradient>
          <linearGradient id="glassBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#DCEFEE" stopOpacity="0.20" />
            <stop offset="45%" stopColor="#DCEFEE" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#DCEFEE" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TOKENS.oceanBright} stopOpacity="0.95" />
            <stop offset="100%" stopColor={TOKENS.oceanCore} stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id="hornWaterGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={TOKENS.oceanCore} />
            <stop offset="60%" stopColor={TOKENS.oceanBright} />
            <stop offset="100%" stopColor={TOKENS.oceanBright} />
          </linearGradient>
          <radialGradient id="spoutHole" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor={TOKENS.oceanInk} />
            <stop offset="70%" stopColor={TOKENS.oceanDeep} />
            <stop offset="100%" stopColor={TOKENS.oceanCore} />
          </radialGradient>
          <radialGradient id="poolGrad" cx="50%" cy="30%" r="75%">
            <stop offset="0%" stopColor={TOKENS.oceanPale} stopOpacity="0.9" />
            <stop offset="55%" stopColor={TOKENS.oceanBright} stopOpacity="0.75" />
            <stop offset="100%" stopColor={TOKENS.oceanCore} stopOpacity="0.55" />
          </radialGradient>
          <filter id="flaskShadow" x="-30%" y="-10%" width="160%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor={TOKENS.oceanInk} floodOpacity="0.24" />
          </filter>
          <clipPath id="flaskClip">
            <path d="M170 108 C150 148 92 174 84 258 C76 344 136 428 200 428 C264 428 324 344 316 258 C308 174 250 148 230 108 Z" />
          </clipPath>
          <clipPath id="flaskInterior">
            <rect x="176" y="26" width="48" height="86" />
            <path d="M170 108 C150 148 92 174 84 258 C76 344 136 428 200 428 C264 428 324 344 316 258 C308 174 250 148 230 108 Z" />
          </clipPath>
        </defs>

        <g clipPath="url(#flaskInterior)">
          {drops.map((d, i) => (
            <g key={i} transform={`translate(${d.x}, 0)`}>
              <path
                className="wf-drop-fall"
                d="M6 0 C6 0 0 9 0 13.5 A6 6 0 1 0 12 13.5 C12 9 6 0 6 0 Z"
                fill={TOKENS.oceanBright}
                style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
              />
            </g>
          ))}
        </g>

        <rect x="174" y="30" width="52" height="82" rx="6" fill="url(#glassBody)" stroke={TOKENS.glassBorder} strokeWidth="3" />

        <g filter="url(#flaskShadow)">
          <path
            d="M170 108 C150 148 92 174 84 258 C76 344 136 428 200 428 C264 428 324 344 316 258 C308 174 250 148 230 108 Z"
            fill="url(#glassBody)"
          />
          <g clipPath="url(#flaskClip)">
            <rect x="60" y="260" width="290" height="200" fill="url(#waterFill)" />
            <path className="wf-wave-drift" d="M60 260 Q100 250 140 260 T220 260 T300 260 T380 260 V266 H60 Z" fill={TOKENS.oceanPale} opacity="0.5" />
            <path className="wf-wave-drift wf-wave-drift-2" d="M60 266 Q105 258 150 266 T240 266 T330 266 T420 266 V272 H60 Z" fill={TOKENS.oceanBright} opacity="0.55" />
            <ellipse cx="140" cy="330" rx="18" ry="70" fill="#FFFFFF" opacity="0.12" />
          </g>

          {/* Water column running through the horn — same centerline
              the horn glass follows, drawn thick and blue so the
              liquid reads as continuous from the flask's body, through
              the spout, to the mouth. Drawn BEFORE the glass shell so
              the shell sits on top like real glass around real water. */}
          <path
            d={hornCenterline}
            fill="none"
            stroke="url(#hornWaterGrad)"
            strokeWidth="15"
            strokeLinecap="round"
            opacity="0.92"
          />

          {/* Glass shell of the horn, overlapping deep into the flask
              wall so it fuses with the body's own outline rather than
              butting up against it. */}
          <path
            d="M254 320 C 292 316 330 330 352 358 C 368 378 374 390 368 402 L 342 406
               C 338 388 326 368 308 352 C 288 334 266 326 250 330 Z"
            fill="url(#glassBody)"
            stroke={TOKENS.glassBorder}
            strokeWidth="2"
            opacity="0.85"
          />

          <path
            d="M170 108 C150 148 92 174 84 258 C76 344 136 428 200 428 C264 428 324 344 316 258 C308 174 250 148 230 108 Z"
            fill="none"
            stroke={TOKENS.glassBorder}
            strokeWidth="3"
          />

          <g transform={`rotate(${mouth.angle} ${mouth.x} ${mouth.y})`}>
            <ellipse cx={mouth.x} cy={mouth.y} rx="11" ry="7" fill="url(#spoutHole)" />
            <path
              d={`M${mouth.x - 10} ${mouth.y - 3} A 11 7 0 0 1 ${mouth.x + 9} ${mouth.y - 4}`}
              fill="none"
              stroke={TOKENS.glassBorder}
              strokeWidth="1.5"
              opacity="0.85"
            />
          </g>
        </g>

        <path
          d={pourPath}
          fill="none"
          stroke="url(#streamGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.88"
        />
        <circle r="4.5" fill={TOKENS.oceanBright}>
          <animateMotion dur="1.7s" repeatCount="indefinite" path={pourPath} />
        </circle>

        <ellipse cx={pool.cx} cy={pool.cy} rx={pool.rx} ry={pool.ry} fill="url(#poolGrad)" />
        <ellipse className="wf-ripple" cx={pool.cx} cy={pool.cy} rx={pool.rx * 0.35} ry={pool.ry * 0.55} />
        <ellipse className="wf-ripple wf-ripple-2" cx={pool.cx} cy={pool.cy} rx={pool.rx * 0.35} ry={pool.ry * 0.55} />

        {DESTINATIONS.map((d) => (
          <g key={d.label} transform={`translate(${d.x}, ${pool.cy - 6})`}>
            <circle r="17" fill="#FFFFFF" opacity="0.92" />
            <circle r="17" fill="none" stroke={TOKENS.oceanBright} strokeWidth="1.5" opacity="0.5" />
            <text textAnchor="middle" dominantBaseline="central" style={{ font: "16px 'Inter', sans-serif" }}>
              {d.icon}
            </text>
            <text
              y="34"
              textAnchor="middle"
              fill={TOKENS.dim}
              style={{ font: "600 11px 'Inter', sans-serif", letterSpacing: "0.02em" }}
            >
              {d.label}
            </text>
          </g>
        ))}
      </svg>
    </button>
  );
}

export default function WellspringFlask() {
  const [open, setOpen] = useState(false);
  useReducedMotion();
  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  const { loading, error, litersThisMonth, peopleReached, wellsFunded } = useDonationStats();

  const stats = [
    [loading ? "—" : formatLiters(litersThisMonth), "given this month"],
    [loading ? "—" : formatCount(peopleReached), "people reached"],
    [loading ? "—" : formatCount(wellsFunded), "projects funded"],
  ];

  return (
    <section className="wf-section" id="donate">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

        .wf-section {
          position: relative;
          overflow: hidden;
          padding: 3rem 1.5rem 3.5rem;
          background: linear-gradient(180deg, var(--sky-light, #EAF6FC) 0%, var(--white, #FFFFFF) 45%, var(--sky-light, #EAF6FC) 100%);
        }

        .wf-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
        }

        .wf-inner {
          position: relative;
          z-index: 1;
          max-width: 860px;
          margin: 0 auto;
        }

        .wf-header {
          max-width: 560px;
          margin: 0 auto 1.6rem;
          text-align: center;
        }
        .wf-eyebrow {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.25rem 0.75rem; margin-bottom: 0.8rem;
          border: 1.5px solid var(--blue-pale, #BEE9FB); border-radius: 100px;
          font-family: var(--font-body, 'Inter', sans-serif); font-size: 0.65rem; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #0f3460; background: var(--sky-light, #EAF6FC);
        }
        .wf-title {
          font-family: var(--font-display, 'Fraunces', serif); font-weight: 800;
          font-size: clamp(1.5rem, 3vw, 2.05rem); line-height: 1.2;
          color: var(--text-dark, #003850); margin: 0 0 0.5rem;
        }
        .wf-title em {
          font-style: italic; color: #00BFFF;
        }
        .wf-desc {
          font-family: var(--font-body, 'Inter', sans-serif); font-size: 0.9rem;
          color: var(--text-mid, #4d7c94); line-height: 1.55; margin: 0 auto;
        }

        .wf-row {
          display: grid;
          grid-template-columns: minmax(150px, 210px) 1fr;
          gap: 1.25rem;
          align-items: center;
        }

        .wf-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .wf-flask-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          display: block;
        }
        .wf-flask-svg {
          width: 100%;
          max-width: 210px;
          height: auto;
          display: block;
        }

        .wf-stats-col {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0;
          background: var(--white, #ffffff);
          border: 1px solid var(--blue-pale, #BEE9FB);
          border-radius: var(--radius-lg, 16px);
          box-shadow: 0 4px 16px rgba(15,52,96,0.06);
          padding: 0.2rem 1.1rem;
        }
        .wf-stat-vert {
          position: relative;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 0.75rem;
          padding: 0.65rem 0;
          border-bottom: 1px solid var(--blue-pale, #E4F3FB);
        }
        .wf-stat-vert:last-of-type { border-bottom: none; }
        .wf-stat-num {
          font-family: var(--font-display, 'Fraunces', serif); font-weight: 700;
          font-size: 1.15rem; color: var(--text-dark, #003850); line-height: 1;
          white-space: nowrap;
        }
        .wf-stat-label {
          font-family: var(--font-body, 'Inter', sans-serif); font-size: 0.68rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.04em;
          color: var(--text-mid, #4d7c94); text-align: right;
        }

        .wf-error {
          font-family: var(--font-body, 'Inter', sans-serif); font-size: 0.7rem;
          color: var(--text-mid, #4d7c94); margin: 0.5rem 0 0;
        }

        .wf-cta {
          margin-top: 0.75rem;
          width: 100%;
          padding: 0.65rem 1.4rem; border: none; border-radius: 100px;
          background: #00BFFF; color: #fff;
          font-family: var(--font-body, 'Inter', sans-serif); font-weight: 700; font-size: 0.85rem;
          cursor: pointer; box-shadow: 0 8px 18px rgba(0,123,168,0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .wf-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0,123,168,0.38);
        }

        .wf-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(7, 22, 31, 0.62);
          backdrop-filter: blur(6px);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          box-sizing: border-box;
        }
        .wf-modal {
          position: relative;
          background: linear-gradient(165deg, ${TOKENS.oceanInk} 0%, #001824 100%);
          border: 1px solid rgba(0,191,255,0.28);
          border-radius: 22px;
          max-width: 340px;
          width: 100%;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
          padding: 28px 26px 26px;
          text-align: center;
          box-sizing: border-box;
        }
        .wf-modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: ${TOKENS.oceanPale};
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .wf-modal-close:hover { color: #fff; }
        .wf-modal-eyebrow {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #F0FBFF;
          margin-bottom: 8px;
        }
        .wf-modal-title {
          color: ${TOKENS.mist};
          font-family: 'Fraunces', serif;
          font-size: 21px;
          font-weight: 600;
          margin: 0 0 6px 0;
        }
        .wf-modal-sub {
          color: rgba(244,250,249,0.6);
          font-size: 13px;
          margin: 0 0 16px 0;
        }
        .wf-qr-card {
          background: ${TOKENS.mist};
          border-radius: 16px;
          padding: 12px;
          display: inline-block;
          box-shadow: 0 0 0 1px rgba(0,191,255,0.25);
        }
        .wf-qr-img { display: block; border-radius: 6px; }
        .wf-copy-btn {
          margin-top: 16px;
          width: 100%;
          padding: 11px 16px;
          border-radius: 999px;
          border: 1px solid rgba(0,191,255,0.45);
          color: #F0FBFF;
          background: rgba(0,191,255,0.12);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease, border-color 0.2s ease;
          box-sizing: border-box;
        }
        .wf-copy-btn:hover { background: rgba(0,191,255,0.22); border-color: rgba(0,191,255,0.7); }

        @keyframes wfDropFall {
          0%   { transform: translateY(-18px); opacity: 0; }
          10%  { opacity: 1; }
          72%  { opacity: 1; }
          100% { transform: translateY(230px); opacity: 0; }
        }
        .wf-drop-fall {
          animation-name: wfDropFall;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        @keyframes wfWaveDrift {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-90px); }
        }
        .wf-wave-drift { animation: wfWaveDrift 4.5s linear infinite; }
        .wf-wave-drift-2 { animation-duration: 6.5s; animation-direction: reverse; }

        @keyframes wfRipple {
          0%   { transform: scale(0.6); opacity: 0.55; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .wf-ripple {
          fill: none;
          stroke: #FFFFFF;
          stroke-width: 1.5;
          transform-box: fill-box;
          transform-origin: center;
          animation: wfRipple 2.6s ease-out infinite;
        }
        .wf-ripple-2 { animation-delay: 1.3s; }

        @media (prefers-reduced-motion: reduce) {
          .wf-wave-drift, .wf-wave-drift-2 { animation: none !important; }
          .wf-drop-fall { animation: none !important; }
          .wf-ripple, .wf-ripple-2 { animation: none !important; }
        }

        /* Stays side-by-side (flask left, stats+button right) down to
           a narrow width — only stacks on genuinely small screens. */
        @media (max-width: 480px) {
          .wf-row { grid-template-columns: 1fr; }
          .wf-visual { margin-bottom: 0.4rem; }
          .wf-flask-svg { max-width: 170px; }
        }
        @media (max-width: 380px) {
          .wf-section { padding: 2.5rem 1rem 3rem; }
        }
      `}</style>

      <div className="wf-blob" style={{
        width: 260, height: 260, top: -90, right: -90,
        background: 'radial-gradient(circle, rgba(0,191,255,0.12), transparent 70%)',
      }} />
      <div className="wf-blob" style={{
        width: 220, height: 220, bottom: -80, left: -80,
        background: 'radial-gradient(circle, rgba(41,128,185,0.13), transparent 70%)',
      }} />

      <div className="wf-inner">
        <div className="wf-header">
          <span className="wf-eyebrow">💧 Give Water</span>
          <h2 className="wf-title">
            Every Donation <em>Reaches</em> Someone
          </h2>
          <p className="wf-desc">
            One flask, three destinations — a family, a school, a village.
          </p>
        </div>

        <div className="wf-row">
          <div className="wf-visual">
            <FlaskVisual onGive={openModal} />
          </div>

          <div className="wf-stats-col">
            {stats.map(([num, label]) => (
              <div className="wf-stat-vert" key={label}>
                <span className="wf-stat-num">{num}</span>
                <span className="wf-stat-label">{label}</span>
              </div>
            ))}
            {error && (
              <p className="wf-error">Live totals unavailable right now — showing dashes.</p>
            )}
            <button className="wf-cta" onClick={openModal}>
              Give a Drop →
            </button>
          </div>
        </div>
      </div>

      <DonateModal open={open} onClose={closeModal} />
    </section>
  );
}