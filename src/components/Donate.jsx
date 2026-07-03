import React, { useState, useEffect, useCallback } from "react";

/**
 * WELLSPRING — flask widget
 * Transparent-background, 3D-glass flask that fills with falling
 * oceanic-blue droplets, then pours a real stream out of an open spout
 * hole, splitting to a family, a school, and a village. Tapping the
 * flask or the drop-shaped CTA opens a QR code to give.
 *
 * NOTE: layout is done with plain scoped CSS (see <style> block below)
 * instead of Tailwind utility classes, so it renders correctly
 * regardless of whether this file's path is covered by the host site's
 * Tailwind `content` globs.
 */

const TOKENS = {
  oceanDeep: "#012A3F",
  oceanMid: "#023E5C",
  ocean: "#0B6E8C",
  oceanBright: "#1EC3D6",
  oceanLight: "#8FEAE0",
  glass: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.35)",
  ink: "#043249",
  mist: "#F2FBFA",
  dim: "#4C7387",
  bgFrom: "#F5FAFD",
  bgTo: "#E6F0F6",
  waveA: "#012A3F",
  waveB: "#0B6E8C",
  waveC: "#1EC3D6",
};

const DONATE_URL = "https://wellspring.org/give?src=hero-flask";

// Backend base URL — change this if your API lives elsewhere.
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

/**
 * Fetches live donation stats from the backend.
 * Returns { stats, loading, error } where stats is always a
 * three-item array in display order: [liters, people, wells].
 * Falls back to zeroed values (not fake numbers) if the request fails,
 * so the UI never silently shows made-up data.
 */
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
  return `${n.toLocaleString()} L`;
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

        <h3 className="wf-modal-title">Give a drop</h3>

        <div className="wf-qr-card">
          <img
            src="/bank-qr.png"
            width={220}
            height={220}
            alt="QR code linking to the Wellspring donation page"
            className="wf-qr-img"
          />
        </div>

        <button onClick={copyLink} className="wf-copy-btn">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function DropButton({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Give a drop" className="wf-drop-btn">
      <svg width="136" height="172" viewBox="0 0 136 172">
        <defs>
          <radialGradient id="dropBtnGrad" cx="38%" cy="28%" r="78%">
            <stop offset="0%" stopColor={TOKENS.oceanLight} />
            <stop offset="42%" stopColor={TOKENS.oceanBright} />
            <stop offset="78%" stopColor={TOKENS.ocean} />
            <stop offset="100%" stopColor={TOKENS.oceanMid} />
          </radialGradient>
          <filter id="dropBtnShadow" x="-40%" y="-20%" width="180%" height="170%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor={TOKENS.oceanDeep} floodOpacity="0.4" />
          </filter>
        </defs>
        <g filter="url(#dropBtnShadow)" className="wf-drop-btn-inner">
          <path
            d="M68 6 C102 56 124 86 124 112 A56 56 0 1 1 12 112 C12 86 34 56 68 6 Z"
            fill="url(#dropBtnGrad)"
          />
          <ellipse cx="47" cy="78" rx="15" ry="24" fill="#FFFFFF" opacity="0.35" />
        </g>
        <text x="68" y="120" textAnchor="middle" fill="#FFFFFF" style={{ font: "600 14px 'Inter', sans-serif" }}>
          Give a
        </text>
        <text x="68" y="138" textAnchor="middle" fill="#FFFFFF" style={{ font: "600 14px 'Inter', sans-serif" }}>
          drop
        </text>
      </svg>
    </button>
  );
}

/** Decorative gradient wave band across the top of the section. */
function TopWave() {
  return (
    <svg
      className="wf-top-wave"
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="waveGradA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={TOKENS.waveA} />
          <stop offset="55%" stopColor={TOKENS.waveB} />
          <stop offset="100%" stopColor={TOKENS.waveC} />
        </linearGradient>
        <linearGradient id="waveGradB" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={TOKENS.waveB} stopOpacity="0.55" />
          <stop offset="100%" stopColor={TOKENS.waveC} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* back wave */}
      <path
        className="wf-wave-layer wf-wave-back"
        d="M0,90 C 220,150 420,40 720,90 C 1020,140 1240,40 1440,90 L1440,0 L0,0 Z"
        fill="url(#waveGradA)"
      />
      {/* front wave, slightly offset for parallax depth */}
      <path
        className="wf-wave-layer wf-wave-front"
        d="M0,130 C 260,80 460,180 760,130 C 1040,84 1260,170 1440,130 L1440,0 L0,0 Z"
        fill="url(#waveGradB)"
      />
    </svg>
  );
}

function FlaskVisual({ onGive }) {
  const drops = [0, 1, 2].map((i) => ({
    x: 194 + i * 10 - 10,
    delay: i * 1.0,
    dur: 2.8 + (i % 2) * 0.4,
  }));

  // All three channels fan out from the same point: the mouth of the
  // spout hole (322, 380). Nothing else starts or ends disconnected from
  // that point, so there's no stray floating segment.
  const spout = { x: 322, y: 380 };
  const channels = [
    { path: `M${spout.x} ${spout.y} C 248 396 118 414 46 434`, lx: 46, ly: 456, label: "family" },
    { path: `M${spout.x} ${spout.y} C 292 432 232 480 202 502`, lx: 202, ly: 522, label: "school" },
    { path: `M${spout.x} ${spout.y} C 340 398 350 414 354 434`, lx: 354, ly: 456, label: "village" },
  ];

  return (
    <button onClick={onGive} aria-label="Tap the flask to give a drop of water" className="wf-flask-btn">
      <svg viewBox="0 0 400 560" width="400" height="560" className="wf-flask-svg">
        <defs>
          <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TOKENS.oceanLight} />
            <stop offset="45%" stopColor={TOKENS.oceanBright} />
            <stop offset="80%" stopColor={TOKENS.ocean} />
            <stop offset="100%" stopColor={TOKENS.oceanMid} />
          </linearGradient>
          <linearGradient id="glassBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#aecaf2" stopOpacity="0.16" />
            <stop offset="45%" stopColor="#aecaf2" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#aecaf2" stopOpacity="0.10" />
          </linearGradient>
          <linearGradient id="streamGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TOKENS.oceanBright} stopOpacity="0.9" />
            <stop offset="100%" stopColor={TOKENS.ocean} stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="spoutHole" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor={TOKENS.oceanDeep} />
            <stop offset="70%" stopColor={TOKENS.oceanMid} />
            <stop offset="100%" stopColor={TOKENS.ocean} />
          </radialGradient>
          <filter id="flaskShadow" x="-30%" y="-10%" width="160%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor={TOKENS.oceanDeep} floodOpacity="0.35" />
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
            <path className="wf-wave-drift" d="M60 260 Q100 250 140 260 T220 260 T300 260 T380 260 V266 H60 Z" fill={TOKENS.oceanLight} opacity="0.5" />
            <path className="wf-wave-drift wf-wave-drift-2" d="M60 266 Q105 258 150 266 T240 266 T330 266 T420 266 V272 H60 Z" fill={TOKENS.oceanBright} opacity="0.6" />
            <ellipse cx="140" cy="330" rx="18" ry="70" fill="#FFFFFF" opacity="0.12" />
          </g>
          <path
            d="M170 108 C150 148 92 174 84 258 C76 344 136 428 200 428 C264 428 324 344 316 258 C308 174 250 148 230 108 Z"
            fill="none"
            stroke={TOKENS.glassBorder}
            strokeWidth="3"
          />

          {/* Spout: a short protruding nozzle fused to the flask wall, ending
              in an open elliptical hole. The stream below starts exactly at
              the hole's mouth, so it reads as water pouring out of an
              opening rather than a stray line floating near the glass. */}
          <path
            d="M290 360 C 306 356 322 360 330 372 C 334 382 328 392 314 396 C 300 398 288 392 284 380 C 282 372 284 364 290 360 Z"
            fill="url(#glassBody)"
            stroke={TOKENS.glassBorder}
            strokeWidth="2.5"
          />
          <ellipse cx={spout.x} cy={spout.y} rx="10" ry="7" fill="url(#spoutHole)" />
          <path
            d={`M${spout.x - 9} ${spout.y - 3} A 10 7 0 0 1 ${spout.x + 8} ${spout.y - 4}`}
            fill="none"
            stroke={TOKENS.glassBorder}
            strokeWidth="1.5"
            opacity="0.8"
          />
        </g>

        {/* stream pouring from the open hole, fanning to the three destinations */}
        <g>
          {channels.map((c, i) => (
            <path
              key={i}
              d={c.path}
              fill="none"
              stroke="url(#streamGrad)"
              strokeWidth={i === 1 ? 7 : 5}
              strokeLinecap="round"
              opacity="0.75"
            />
          ))}
        </g>

        {channels.map((c, i) => (
          <g key={i}>
            <circle r="4.5" fill={TOKENS.oceanBright}>
              <animateMotion dur={`${2.2 + i * 0.35}s`} repeatCount="indefinite" path={c.path} begin={`${i * 0.4}s`} />
            </circle>
            <path
              d={`M${c.lx} ${c.ly - 24} C ${c.lx + 9} ${c.ly - 10} ${c.lx + 9} ${c.ly} ${c.lx} ${c.ly} C ${c.lx - 9} ${c.ly} ${c.lx - 9} ${c.ly - 10} ${c.lx} ${c.ly - 24} Z`}
              fill={TOKENS.ocean}
              opacity="0.85"
            />
            <ellipse cx={c.lx - 2.5} cy={c.ly - 14} rx="2.5" ry="4" fill="#FFFFFF" opacity="0.5" />
            <text x={c.lx} y={c.ly + 16} textAnchor="middle" fill={TOKENS.dim} style={{ font: "10px 'Inter', sans-serif" }}>
              {c.label}
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

  // Live data from the backend, formatted for display.
  // While loading, show "—" instead of a fake placeholder number so the
  // widget never claims a stat it hasn't actually fetched yet.
  const stats = [
    [loading ? "—" : formatLiters(litersThisMonth), "given this month"],
    [loading ? "—" : formatCount(peopleReached), "people reached"],
    [loading ? "—" : formatCount(wellsFunded), "wells funded"],
  ];

  return (
    <div className="wf-root">
      <TopWave />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

        .wf-root {
          background: linear-gradient(180deg, ${TOKENS.bgFrom} 0%, ${TOKENS.bgTo} 55%, ${TOKENS.bgFrom} 100%);
          font-family: 'Inter', sans-serif;
          position: relative;
          width: 100%;
          max-width: 560px;
          margin: 0 auto;
          border-radius: 28px;
          padding: 160px 16px 48px 16px;
          box-sizing: border-box;
          overflow: hidden;
          box-shadow: 0 12px 40px rgba(3,60,90,0.10);
        }

        .wf-top-wave {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 190px;
          display: block;
        }
        .wf-wave-layer { transform-origin: center; }
        .wf-wave-back { animation: wfWaveSway 9s ease-in-out infinite; }
        .wf-wave-front { animation: wfWaveSway 7s ease-in-out infinite reverse; }
        @keyframes wfWaveSway {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-wave-back, .wf-wave-front { animation: none; }
        }

        .wf-inner {
          position: relative;
          z-index: 1;
          max-width: 448px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .wf-flask-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          display: block;
          width: 100%;
        }
        .wf-flask-svg {
          width: 100%;
          max-width: 440px;
          height: auto;
          margin: 0 auto;
          display: block;
        }

        .wf-stats {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: stretch;
          gap: 14px;
          margin-top: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .wf-stat {
          text-align: center;
          background: rgba(255,255,255,0.65);
          border: 1px solid rgba(3,60,90,0.12);
          border-radius: 16px;
          padding: 16px 20px;
          min-width: 108px;
          box-shadow: 0 2px 10px rgba(3,60,90,0.06);
          cursor: default;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }
        .wf-stat:hover,
        .wf-stat:focus-visible {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.95);
          border-color: rgba(3,60,90,0.28);
          box-shadow: 0 12px 26px rgba(3,60,90,0.14);
        }
        .wf-stat-num {
          color: ${TOKENS.oceanMid};
          font-family: 'Fraunces', serif;
          font-size: 24px;
          font-weight: 600;
          transition: color 0.22s ease;
        }
        .wf-stat:hover .wf-stat-num { color: ${TOKENS.oceanBright}; }
        .wf-stat-label {
          color: ${TOKENS.dim};
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: 6px;
          line-height: 1.3;
        }
        .wf-stats-error {
          text-align: center;
          color: ${TOKENS.dim};
          font-size: 11px;
          margin-top: -20px;
          margin-bottom: 24px;
        }

        .wf-drop-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
          display: block;
        }
        .wf-drop-btn-inner { transition: transform 0.2s ease; }
        .wf-drop-btn:hover .wf-drop-btn-inner,
        .wf-drop-btn:focus-visible .wf-drop-btn-inner { transform: translateY(-4px); }
        .wf-drop-btn:focus-visible { outline: 2px solid ${TOKENS.oceanBright}; outline-offset: 3px; border-radius: 999px; }

        .wf-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(1, 20, 30, 0.6);
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
          background: linear-gradient(165deg, ${TOKENS.oceanDeep} 0%, #01161F 100%);
          border: 1px solid ${TOKENS.glassBorder};
          border-radius: 22px;
          max-width: 360px;
          width: 100%;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
          padding: 28px;
          text-align: center;
          box-sizing: border-box;
        }
        .wf-modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          color: ${TOKENS.oceanLight};
          background: transparent;
          border: none;
          cursor: pointer;
        }
        .wf-modal-close:hover { color: #fff; }
        .wf-modal-title {
          color: ${TOKENS.mist};
          font-family: 'Fraunces', serif;
          font-size: 20px;
          margin: 0 0 16px 0;
        }
        .wf-qr-card {
          background: ${TOKENS.mist};
          border-radius: 16px;
          padding: 14px;
          display: inline-block;
        }
        .wf-qr-img { display: block; border-radius: 6px; }
        .wf-copy-btn {
          margin-top: 18px;
          width: 100%;
          padding: 12px 16px;
          border-radius: 999px;
          border: 1px solid ${TOKENS.glassBorder};
          color: ${TOKENS.mist};
          background: rgba(255,255,255,0.05);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
          box-sizing: border-box;
        }
        .wf-copy-btn:hover { background: rgba(255,255,255,0.1); }

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

        @media (prefers-reduced-motion: reduce) {
          .wf-wave-drift, .wf-wave-drift-2 { animation: none !important; }
        }
      `}</style>

      <div className="wf-inner">
        <FlaskVisual onGive={openModal} />

        <div className="wf-stats">
          {stats.map(([num, label]) => (
            <div key={label} className="wf-stat" tabIndex={0}>
              <div className="wf-stat-num">{num}</div>
              <div className="wf-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="wf-stats-error">Live totals unavailable right now — showing dashes.</div>
        )}

        <DropButton onClick={openModal} />
      </div>

      <DonateModal open={open} onClose={closeModal} />
    </div>
  );
}