import React, { useState, useEffect, useCallback } from "react";

/**
 * WELLSPRING — flask widget
 * Transparent-background, glass flask that fills with falling
 * teal droplets, then pours a real stream out of an open spout
 * hole, splitting to a family, a school, and a village. Tapping the
 * flask or the drop-shaped CTA opens a QR code to give.
 *
 * Palette: a deep indigo-teal "night water" ground with a single warm
 * sun-gold accent reserved for the call to action and the moment of
 * giving — everything else stays quiet so that accent reads as a choice,
 * not a decoration.
 *
 * NOTE: layout is done with plain scoped CSS (see <style> block below)
 * instead of Tailwind utility classes, so it renders correctly
 * regardless of whether this file's path is covered by the host site's
 * Tailwind `content` globs.
 */

const TOKENS = {
  // Ocean — the water itself, and everything else: one consistent
  // sky-blue → white family used throughout, no second accent palette.
  oceanInk: "#003850",
  oceanDeep: "#005580",
  oceanCore: "#007BA8",
  oceanBright: "#00BFFF",
  oceanPale: "#F0FBFF",

  // Accent — kept in the same family, just the lightest/brightest step,
  // reserved for the giving moment (CTA, modal highlight).
  sun: "#00BFFF",
  sunLight: "#F0FBFF",
  sunDeep: "#005580",

  // Neutrals
  ink: "#003850",
  dim: "#4d7c94",
  mist: "#F4FAF9",
  bgFrom: "#F6FAFA",
  bgVia: "#EAF3F2",
  bgTo: "#F6FAFA",

  glassBorder: "rgba(255,255,255,0.4)",
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
            width={210}
            height={210}
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

function DropButton({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Give a drop" className="wf-drop-btn">
      <svg width="136" height="172" viewBox="0 0 136 172">
        <defs>
          <radialGradient id="dropBtnGrad" cx="36%" cy="26%" r="80%">
            <stop offset="0%" stopColor="#F0FBFF" />
            <stop offset="45%" stopColor="#00BFFF" />
            <stop offset="100%" stopColor="#007BA8" />
          </radialGradient>
          <filter id="dropBtnShadow" x="-40%" y="-20%" width="180%" height="170%">
            <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#005580" floodOpacity="0.38" />
          </filter>
        </defs>
        <g filter="url(#dropBtnShadow)" className="wf-drop-btn-inner">
          <path
            d="M68 6 C102 56 124 86 124 112 A56 56 0 1 1 12 112 C12 86 34 56 68 6 Z"
            fill="url(#dropBtnGrad)"
          />
          <ellipse cx="47" cy="78" rx="15" ry="24" fill="#FFFFFF" opacity="0.4" />
        </g>
        <text x="68" y="120" textAnchor="middle" fill="#003850" style={{ font: "600 14px 'Fraunces', serif" }}>
          Give a
        </text>
        <text x="68" y="138" textAnchor="middle" fill="#003850" style={{ font: "600 14px 'Fraunces', serif" }}>
          drop
        </text>
      </svg>
    </button>
  );
}

/** Quiet horizon band across the top of the section — a single still
    gradient rather than two competing wave layers, so the drama stays
    with the flask. */
function TopWave() {
  return (
    <div className="wf-top-wave-bleed" aria-hidden="true">
      <svg
        className="wf-top-wave"
        viewBox="0 0 1440 240"
        preserveAspectRatio="none"
      >
      <defs>
          <linearGradient id="waveGradA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#007BA8" />
            <stop offset="40%" stopColor="#00BFFF" />
            <stop offset="75%" stopColor="#F0FBFF" />
            <stop offset="100%" stopColor="#F6FAFA" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="skyBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DCF2FF" />
            <stop offset="100%" stopColor="#F0FBFF" />
          </linearGradient>
        </defs>

        {/* soft bluish-white sky fill so the white clouds have contrast
            to sit against, instead of the page's plain white showing
            through the transparent area above the horizon curve */}
        <rect x="0" y="0" width="1440" height="240" fill="url(#skyBg)" />

        <path
          className="wf-wave-layer wf-wave-back"
          d="M0,70 Q 720,190 1440,70 L1440,240 L0,240 Z"
          fill="url(#waveGradA)"
        />

        <g className="wf-cloud wf-cloud-1" opacity="0.85">
          <ellipse cx="180" cy="55" rx="70" ry="22" fill="#FFFFFF" />
          <ellipse cx="230" cy="45" rx="50" ry="26" fill="#FFFFFF" />
          <ellipse cx="130" cy="48" rx="45" ry="20" fill="#FFFFFF" />
        </g>
        <g className="wf-cloud wf-cloud-2" opacity="0.7">
          <ellipse cx="620" cy="40" rx="60" ry="18" fill="#FFFFFF" />
          <ellipse cx="660" cy="32" rx="42" ry="20" fill="#FFFFFF" />
          <ellipse cx="580" cy="35" rx="38" ry="16" fill="#FFFFFF" />
        </g>
        <g className="wf-cloud wf-cloud-3" opacity="0.6">
          <ellipse cx="1050" cy="62" rx="80" ry="24" fill="#FFFFFF" />
          <ellipse cx="1110" cy="52" rx="55" ry="26" fill="#FFFFFF" />
          <ellipse cx="990" cy="56" rx="50" ry="20" fill="#FFFFFF" />
        </g>
        <g className="wf-cloud wf-cloud-4" opacity="0.5">
          <ellipse cx="1320" cy="35" rx="55" ry="16" fill="#FFFFFF" />
          <ellipse cx="1360" cy="28" rx="35" ry="18" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
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
            <stop offset="0%" stopColor={TOKENS.oceanBright} stopOpacity="0.92" />
            <stop offset="100%" stopColor={TOKENS.oceanCore} stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="spoutHole" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor={TOKENS.oceanInk} />
            <stop offset="70%" stopColor={TOKENS.oceanDeep} />
            <stop offset="100%" stopColor={TOKENS.oceanCore} />
          </radialGradient>
          <filter id="flaskShadow" x="-30%" y="-10%" width="160%" height="140%">
            <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor={TOKENS.oceanInk} floodOpacity="0.30" />
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
              opacity="0.8"
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
              fill={TOKENS.oceanCore}
              opacity="0.9"
            />
            <ellipse cx={c.lx - 2.5} cy={c.ly - 14} rx="2.5" ry="4" fill="#FFFFFF" opacity="0.5" />
            <text x={c.lx} y={c.ly + 16} textAnchor="middle" fill={TOKENS.dim} style={{ font: "600 10px 'Inter', sans-serif", letterSpacing: "0.02em" }}>
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
    [loading ? "—" : formatCount(wellsFunded), "projects funded"],
  ];

  return (
    <div className="wf-root">
      <TopWave />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');

        .wf-root {
          background: transparent;
          font-family: 'Inter', sans-serif;
          position: relative;
          width: 100%;
          max-width: clamp(900px, 80vw, 1600px);
          margin: clamp(96px, 10vw, 160px) auto;
          padding: 160px 16px 60px 16px;
          box-sizing: border-box;
          overflow: visible;
        }
.wf-top-wave-bleed {
          position: absolute;
          top: 0;
          left: 50%;
          width: 100vw;
          transform: translateX(-50%);
          height: 240px;
          overflow: hidden;
          pointer-events: none;
          /* curves the TOP edge of the whole sky band into a wide
             concave arc — dips down at the outer edges, bulging
             upward through the center, instead of a flat rectangle top */
          clip-path: ellipse(65% 100% at 50% 0%);
        }
        .wf-top-wave {
          width: 100%;
          height: 100%;
          display: block;
        }
        .wf-wave-layer { transform-origin: center; }
        .wf-wave-back { animation: wfWaveSway 10s ease-in-out infinite; }
        @keyframes wfWaveSway {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(5px); }
        }
        .wf-cloud {
          transform-box: fill-box;
          transform-origin: center;
        }
        .wf-cloud-1 { animation: wfCloudDrift 38s ease-in-out infinite; }
        .wf-cloud-2 { animation: wfCloudDrift 52s ease-in-out infinite reverse; }
        .wf-cloud-3 { animation: wfCloudDrift 46s ease-in-out infinite; }
        .wf-cloud-4 { animation: wfCloudDrift 60s ease-in-out infinite reverse; }
        @keyframes wfCloudDrift {
          0%, 100% { transform: translateX(-24px); }
          50%      { transform: translateX(24px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-wave-back { animation: none; }
          .wf-cloud { animation: none !important; }
        }

        .wf-inner {
          position: relative;
          z-index: 1;
          max-width: 640px;
          width: 100%;
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
        }
        .wf-flask-svg {
          width: 100%;
          max-width: 600px;
          height: auto;
          margin: 0 auto;
          display: block;
        }

        .wf-stats {
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: stretch;
          gap: 12px;
          margin-top: 20px;
          margin-bottom: 34px;
          flex-wrap: wrap;
        }
        .wf-stat {
          position: relative;
          text-align: left;
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(20,107,134,0.14);
          border-radius: 14px;
          padding: 16px 20px 16px 18px;
          min-width: 128px;
          box-shadow: 0 3px 14px rgba(7,30,43,0.06);
          cursor: default;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }
        .wf-stat::before {
          content: "";
          position: absolute;
          left: 0;
          top: 12px;
          bottom: 12px;
          width: 3px;
          border-radius: 2px;
          background: ${TOKENS.oceanBright};
          opacity: 0.55;
          transition: opacity 0.22s ease, background 0.22s ease;
        }
        .wf-stat:hover,
        .wf-stat:focus-visible {
          transform: translateY(-3px);
          background: rgba(255,255,255,1);
          border-color: rgba(20,107,134,0.30);
          box-shadow: 0 14px 30px rgba(7,30,43,0.12);
        }
        .wf-stat:hover::before { background: ${TOKENS.sun}; opacity: 1; }
        .wf-stat-num {
          color: ${TOKENS.oceanDeep};
          font-family: 'Fraunces', serif;
          font-size: 23px;
          font-weight: 600;
          line-height: 1.1;
          transition: color 0.22s ease;
        }
        .wf-stat:hover .wf-stat-num { color: ${TOKENS.oceanInk}; }
        .wf-stat-label {
          color: ${TOKENS.dim};
          font-size: 10.5px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 5px;
          line-height: 1.3;
        }
        .wf-stats-error {
          text-align: center;
          color: ${TOKENS.dim};
          font-size: 11px;
          margin-top: -22px;
          margin-bottom: 26px;
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
        .wf-drop-btn:focus-visible { outline: 2px solid #00BFFF; outline-offset: 3px; border-radius: 999px; }

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
          max-width: 360px;
          width: 100%;
          box-shadow: 0 30px 80px rgba(0,0,0,0.5);
          padding: 30px 28px 28px;
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
          color: ${TOKENS.sunLight};
          margin-bottom: 8px;
        }
        .wf-modal-title {
          color: ${TOKENS.mist};
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 600;
          margin: 0 0 6px 0;
        }
        .wf-modal-sub {
          color: rgba(244,250,249,0.6);
          font-size: 13px;
          margin: 0 0 18px 0;
        }
        .wf-qr-card {
          background: ${TOKENS.mist};
          border-radius: 16px;
          padding: 14px;
          display: inline-block;
          box-shadow: 0 0 0 1px rgba(0,191,255,0.25);
        }
        .wf-qr-img { display: block; border-radius: 6px; }
        .wf-copy-btn {
          margin-top: 18px;
          width: 100%;
          padding: 12px 16px;
          border-radius: 999px;
          border: 1px solid rgba(0,191,255,0.45);
          color: ${TOKENS.sunLight};
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

        @media (prefers-reduced-motion: reduce) {
          .wf-wave-drift, .wf-wave-drift-2 { animation: none !important; }
        }

        @media (max-width: 480px) {
          .wf-stat { min-width: 104px; padding: 14px 14px 14px 16px; }
          .wf-stat-num { font-size: 20px; }
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