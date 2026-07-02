import React, { useState, useEffect, useCallback } from "react";

/**
 * WELLSPRING — flask widget
 * Transparent-background, 3D-glass flask that fills with falling
 * oceanic-blue droplets, then pours a real stream out of a side
 * spout, splitting to a family, a school, and a village. Tapping the
 * flask or the drop-shaped CTA opens a QR code to give.
 */

const TOKENS = {
  oceanDeep: "#012A3F",
  oceanMid: "#0B6E8C",
  ocean: "#1197B8",
  oceanBright: "#2FD0E0",
  oceanLight: "#9CF3E8",
  glass: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.35)",
  ink: "#062431",
  mist: "#F2FBFA",
  dim: "#3E6673",
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
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(1, 20, 30, 0.6)",
        backdropFilter: "blur(6px)",
        zIndex: 50,
      }}
      className="flex items-center justify-center p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: `linear-gradient(165deg, ${TOKENS.oceanDeep} 0%, #01161F 100%)`,
          border: `1px solid ${TOKENS.glassBorder}`,
          borderRadius: "22px",
          maxWidth: "360px",
          width: "100%",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
        className="relative p-7 text-center"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{ color: TOKENS.oceanLight }}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:text-white focus:outline-none focus-visible:ring-2"
        >
          ✕
        </button>

        <h3
          style={{ color: TOKENS.mist, fontFamily: "'Fraunces', serif" }}
          className="text-xl mb-4"
        >
          Give a drop
        </h3>

        <div
          style={{
            background: TOKENS.mist,
            borderRadius: "16px",
            padding: "14px",
            display: "inline-block",
          }}
        >
          <img
            src={qrSrc}
            width={220}
            height={220}
            alt="QR code linking to the Wellspring donation page"
            style={{ display: "block", borderRadius: "6px" }}
          />
        </div>

        <button
          onClick={copyLink}
          style={{
            marginTop: "18px",
            width: "100%",
            padding: "12px 16px",
            borderRadius: "999px",
            border: `1px solid ${TOKENS.glassBorder}`,
            color: TOKENS.mist,
            background: "rgba(255,255,255,0.05)",
            fontFamily: "'Inter', sans-serif",
          }}
          className="text-sm font-medium hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2"
        >
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

function DropButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Give a drop"
      style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
      className="group relative focus:outline-none"
    >
      <svg width="132" height="150" viewBox="0 0 132 150">
        <defs>
          <radialGradient id="dropBtnGrad" cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor={TOKENS.oceanLight} />
            <stop offset="42%" stopColor={TOKENS.oceanBright} />
            <stop offset="78%" stopColor={TOKENS.ocean} />
            <stop offset="100%" stopColor={TOKENS.oceanMid} />
          </radialGradient>
          <filter id="dropBtnShadow" x="-40%" y="-20%" width="180%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor={TOKENS.oceanDeep} floodOpacity="0.4" />
          </filter>
        </defs>
        <g filter="url(#dropBtnShadow)" className="transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
          <path
            d="M66 8 C96 52 118 78 118 104 A52 52 0 1 1 14 104 C14 78 36 52 66 8 Z"
            fill="url(#dropBtnGrad)"
          />
          <ellipse cx="46" cy="72" rx="14" ry="22" fill="#FFFFFF" opacity="0.35" />
        </g>
        <text
          x="66"
          y="112"
          textAnchor="middle"
          fill={TOKENS.oceanDeep}
          style={{ font: "600 13px 'Inter', sans-serif" }}
        >
          Give a
        </text>
        <text
          x="66"
          y="128"
          textAnchor="middle"
          fill={TOKENS.oceanDeep}
          style={{ font: "600 13px 'Inter', sans-serif" }}
        >
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
    <button
      onClick={onGive}
      aria-label="Tap the flask to give a drop of water"
      className="group relative block w-full focus:outline-none"
      style={{ background: "transparent", border: "none", cursor: "pointer" }}
    >
      <svg viewBox="0 0 400 540" className="w-full h-auto" style={{ maxWidth: "440px", margin: "0 auto", display: "block" }}>
        <defs>
          <linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TOKENS.oceanLight} />
            <stop offset="45%" stopColor={TOKENS.oceanBright} />
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
          {/* union of neck + body: keeps falling drops masked to the glass interior, never outside it */}
          <clipPath id="flaskInterior">
            <rect x="176" y="26" width="48" height="86" />
            <path d="M170 108 C150 148 92 174 84 258 C76 344 136 428 200 428 C264 428 324 344 316 258 C308 174 250 148 230 108 Z" />
          </clipPath>
        </defs>

        {/* falling donation droplets, clipped so they only ever appear inside the neck/body glass.
            NOTE: the x offset lives on this static wrapper <g>, not on the animated path itself —
            a CSS transform animation replaces the whole transform, so if x were on the animated
            element it gets clobbered and every drop falls at x=0 (outside the flask). */}
        <g clipPath="url(#flaskInterior)">
          {drops.map((d, i) => (
            <g key={i} transform={`translate(${d.x}, 0)`}>
              <path
                className="drop-fall"
                d="M6 0 C6 0 0 9 0 13.5 A6 6 0 1 0 12 13.5 C12 9 6 0 6 0 Z"
                fill={TOKENS.oceanBright}
                style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}
              />
            </g>
          ))}
        </g>

        {/* neck */}
        <rect x="174" y="30" width="52" height="82" rx="6" fill="url(#glassBody)" stroke={TOKENS.glassBorder} strokeWidth="3" />

        {/* flask body: glass + liquid + outline, with a real 3D drop shadow */}
        <g filter="url(#flaskShadow)">
          <path
            d="M170 108 C150 148 92 174 84 258 C76 344 136 428 200 428 C264 428 324 344 316 258 C308 174 250 148 230 108 Z"
            fill="url(#glassBody)"
          />
          <g clipPath="url(#flaskClip)">
            <rect x="60" y="260" width="290" height="200" fill="url(#waterFill)" />
            <path className="wave-drift" d="M60 260 Q100 250 140 260 T220 260 T300 260 T380 260 V266 H60 Z" fill={TOKENS.oceanLight} opacity="0.5" />
            <path className="wave-drift wave-drift-2" d="M60 266 Q105 258 150 266 T240 266 T330 266 T420 266 V272 H60 Z" fill={TOKENS.oceanBright} opacity="0.6" />
            {/* glossy specular streak for 3D glass feel */}
            <ellipse cx="140" cy="330" rx="18" ry="70" fill="#FFFFFF" opacity="0.12" />
          </g>
          <path
            d="M170 108 C150 148 92 174 84 258 C76 344 136 428 200 428 C264 428 324 344 316 258 C308 174 250 148 230 108 Z"
            fill="none"
            stroke={TOKENS.glassBorder}
            strokeWidth="3"
          />
          {/* spout opening low on the right side of the flask */}
          <path d="M292 372 C 306 380 316 384 326 384" fill="none" stroke={TOKENS.glassBorder} strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* stream pouring from the spout, splitting to the three destinations */}
        <g>
          <path d="M320 380 C 330 384 340 388 344 396" fill="none" stroke="url(#streamGrad)" strokeWidth="9" strokeLinecap="round" opacity="0.85" />
          {channels.map((c, i) => (
            <path
              key={i}
              d={c.path}
              fill="none"
              stroke="url(#streamGrad)"
              strokeWidth={i === 1 ? 7 : 5}
              strokeLinecap="round"
              opacity="0.7"
            />
          ))}
        </g>

        {/* animated droplets traveling each channel + destination markers */}
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
    <div style={{ background: "transparent", fontFamily: "'Inter', sans-serif" }} className="relative w-full py-8 px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap');

        @keyframes dropFall {
          0%   { transform: translate(var(--tx, 0px), -18px); opacity: 0; }
          10%  { opacity: 1; }
          72%  { opacity: 1; }
          100% { transform: translate(var(--tx, 0px), 230px); opacity: 0; }
        }
        .drop-fall {
          animation-name: dropFall;
          animation-timing-function: ease-in;
          animation-iteration-count: infinite;
          transform-box: fill-box;
          transform-origin: center;
        }

        @keyframes waveDrift {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-90px); }
        }
        .wave-drift { animation: waveDrift 4.5s linear infinite; }
        .wave-drift-2 { animation-duration: 6.5s; animation-direction: reverse; }

        @media (prefers-reduced-motion: reduce) {
          .drop-fall, .wave-drift, .wave-drift-2 { animation: none !important; }
        }

        .focus-visible\\:ring-2:focus-visible {
          outline: 2px solid ${TOKENS.oceanBright};
          outline-offset: 2px;
        }
      `}</style>

      <div className="max-w-md mx-auto flex flex-col items-center">
        <FlaskVisual onGive={openModal} />

        <div className="flex justify-center gap-8 mt-4 mb-8">
          {stats.map(([num, label]) => (
            <div key={label} className="text-center">
              <div style={{ color: TOKENS.ink, fontFamily: "'Fraunces', serif" }} className="text-xl md:text-2xl font-medium">
                {num}
              </div>
              <div style={{ color: TOKENS.dim }} className="text-[10px] uppercase tracking-wide mt-1 leading-tight max-w-[80px]">
                {label}
              </div>
            </div>
          ))}
        </div>

        <DropButton onClick={openModal} />
      </div>

      <DonateModal open={open} onClose={closeModal} />
    </div>
  );
}