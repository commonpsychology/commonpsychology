import React, { useState, useEffect, useCallback } from "react";

/**
 * WELLSPRING — flask widget
 * Transparent-background, 3D-glass flask that fills with falling
 * oceanic-blue droplets, then pours a real stream out of a side
 * spout, splitting to a family, a school, and a village. Tapping the
 * flask or the drop-shaped CTA opens a QR code to give.
 *
 * NOTE: layout is done with plain scoped CSS (see <style> block below)
 * instead of Tailwind utility classes. The previous version relied on
 * classes like `flex`, `gap-8`, `w-full`, `h-auto`, `text-center` etc.
 * If this file's path isn't covered by the host site's Tailwind
 * `content` globs, those classes compile to nothing and the layout
 * (and even the flask SVG's sizing) silently breaks — which is what
 * was happening. This version has no external CSS dependency.
 */

const TOKENS = {
  oceanDeep: "#022278",
  oceanMid: "#02225F",
  ocean: "#022280",
  oceanBright: "#453cf6",
  oceanLight: "#3814ea",
  glass: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.35)",
  ink: "#003C5F",
  mist: "#F2FBFA",
  dim: "#4C7387",
  bgFrom: "#F5FAFD",
  bgTo: "#E6F0F6",
};

const DONATE_URL = "https://wellspring.org/give?src=hero-flask";

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

function DonateModal({ open, onClose }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&qzone=1&color=062431&bgcolor=ffffff&data=${encodeURIComponent(
    DONATE_URL
  )}`;

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
            src='/bank-qr.png'
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
        {/* rounder, fuller teardrop: bigger base circle (r=56), fully inside the 172px-tall
            viewBox (bottom edge at 112+56=168, 4px clear) so it no longer clips */}
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

function FlaskVisual({ onGive }) {
  const drops = [0, 1, 2].map((i) => ({
    x: 194 + i * 10 - 10,
    delay: i * 1.0,
    dur: 2.8 + (i % 2) * 0.4,
  }));

  const channels = [
    { path: "M158 318 C 108 336 66 372 46 416", lx: 46, ly: 438, label: "family" },
    { path: "M200 400 C 200 440 200 462 200 486", lx: 200, ly: 506, label: "school" },
    { path: "M242 318 C 292 336 334 372 354 416", lx: 354, ly: 438, label: "village" },
  ];

  return (
    <button onClick={onGive} aria-label="Tap the flask to give a drop of water" className="wf-flask-btn">
      <svg viewBox="0 0 400 540" width="400" height="540" className="wf-flask-svg">
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
          <path d="M292 372 C 306 380 316 384 326 384" fill="none" stroke={TOKENS.glassBorder} strokeWidth="3" strokeLinecap="round" />
        </g>

        <g>
          <path d="M320 380 C 330 384 340 388 344 396" fill="none" stroke="url(#streamGrad)" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
          {channels.map((c, i) => (
            <path key={i} d={c.path} fill="none" stroke="url(#streamGrad)" strokeWidth={i === 1 ? 7 : 5} strokeLinecap="round" opacity="0.7" />
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

  const stats = [
    ["12,480 L", "given this month"],
    ["3,240", "people reached"],
    ["58", "wells funded"],
  ];

  return (
    <div className="wf-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

        .wf-root {
          background: linear-gradient(180deg, ${TOKENS.bgFrom} 0%, ${TOKENS.bgTo} 55%, ${TOKENS.bgFrom} 100%);
          font-family: 'Inter', sans-serif;
          position: relative;
          width: 100%;
          padding: 48px 16px;
          box-sizing: border-box;
        }
        .wf-inner {
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
          border: 1px solid rgba(0,60,95,0.12);
          border-radius: 16px;
          padding: 16px 20px;
          min-width: 108px;
          box-shadow: 0 2px 10px rgba(0,60,95,0.06);
          cursor: default;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }
        .wf-stat:hover,
        .wf-stat:focus-visible {
          transform: translateY(-4px);
          background: rgba(255,255,255,0.95);
          border-color: rgba(0,60,95,0.28);
          box-shadow: 0 12px 26px rgba(0,60,95,0.14);
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
          .wf-drop-fall, .wf-wave-drift, .wf-wave-drift-2 { animation: none !important; }
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

        <DropButton onClick={openModal} />
      </div>

      <DonateModal open={open} onClose={closeModal} />
    </div>
  );
}