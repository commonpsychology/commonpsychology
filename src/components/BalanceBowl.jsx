/**
 * BalanceBowl.jsx
 * ─────────────────────────────────────────────────────────
 * A floating "vessel" balance section.
 * A sculpted glass bowl sits at the centre of four suspended
 * weights (1/4, 2/4, 3/4, 4/4). Activating a weight sends a
 * pulse of light down its spoke and raises the water line in
 * the bowl — balance is something you visibly fill, not score.
 * Self-contained: no external imports required.
 * ─────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";

// ─── Weights (clockwise from top) ─────────────────────────────────────────
const WEIGHTS = [
  { key: "top",    label: "1/4", cx: 360, cy: 88  },
  { key: "right",  label: "2/4", cx: 632, cy: 270 },
  { key: "bottom", label: "3/4", cx: 360, cy: 592 },
  { key: "left",   label: "4/4", cx: 88,  cy: 270 },
];

// spoke endpoints on the bowl rim, matched to each weight's key
const RIM_POINTS = {
  top:    { x: 360, y: 240 },
  right:  { x: 476, y: 270 },
  bottom: { x: 360, y: 432 },
  left:   { x: 244, y: 270 },
};

const ORB_R = 38;

const MESSAGES = [
  { title: "An empty bowl",     body: "Nothing added yet, and that's alright. Fill it whenever you're ready." },
  { title: "A quiet beginning", body: "One small offering is resting in the bowl. Small steps still count." },
  { title: "Halfway held",      body: "The bowl is beginning to hold something real. Keep going, gently." },
  { title: "Nearly whole",      body: "Three quarters settled. Balance is close at hand." },
  { title: "Fully held",        body: "The bowl is whole. This is what balance can feel like — not perfect, just present." },
];

const PARTICLES = [
  { x: 300, r: 3,   dur: "5.5s", begin: "0s"    },
  { x: 420, r: 2.4, dur: "6.8s", begin: "-2s"   },
  { x: 340, r: 2,   dur: "7.4s", begin: "-4.1s" },
  { x: 390, r: 3.2, dur: "6.1s", begin: "-1.2s" },
];

// ─── Weight orb ─────────────────────────────────────────────────────────────
function WeightOrb({ weight, active, onToggle }) {
  const { key, label, cx, cy } = weight;
  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={active}
      aria-label={`Weight ${label}${active ? ", active" : ""}`}
      onClick={() => onToggle(key)}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onToggle(key))}
      style={{ cursor: "pointer", outline: "none" }}
    >
      <ellipse cx={cx} cy={cy + ORB_R + 10} rx={ORB_R * 0.7} ry={9}
        fill="#0f2540" opacity={active ? 0.16 : 0.08}
        style={{ transition: "opacity 0.5s ease" }} />
      <circle cx={cx} cy={cy} r={ORB_R + 6} fill="none"
        stroke={active ? "#00BFFF" : "#cfe8f7"} strokeWidth={active ? 2 : 1}
        opacity={active ? 0.55 : 0.5}
        style={{ transition: "all 0.5s ease" }} />
      <circle cx={cx} cy={cy} r={ORB_R}
        fill={active ? "url(#orbActiveGrad)" : "url(#orbRestGrad)"}
        stroke={active ? "#0077b6" : "#a9cfe6"} strokeWidth="1.4"
        style={{
          transition: "all 0.55s cubic-bezier(0.34,1.3,0.64,1)",
          filter: active ? "drop-shadow(0 6px 18px rgba(0,191,255,0.45))" : "drop-shadow(0 3px 8px rgba(30,58,95,0.10))",
        }}
      />
      <circle cx={cx - ORB_R * 0.32} cy={cy - ORB_R * 0.38} r={ORB_R * 0.28}
        fill="#ffffff" opacity={active ? 0.5 : 0.35} />
      <text x={cx} y={cy + 6} textAnchor="middle"
        fontFamily="'Playfair Display', serif" fontSize="17" fontWeight="700"
        fill={active ? "#ffffff" : "#1d4ed8"}
        style={{ transition: "fill 0.5s ease" }}>
        {label}
      </text>
    </g>
  );
}

// ─── Fraction meter (4 segments) ───────────────────────────────────────────
function FractionMeter({ count }) {
  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", margin: "0 0 22px" }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{
          width: "44px", height: "7px", borderRadius: "999px",
          background: i < count ? "linear-gradient(90deg,#0077b6,#00BFFF)" : "#e2eef7",
          boxShadow: i < count ? "0 1px 8px rgba(0,191,255,0.5)" : "none",
          transition: "all 0.5s ease",
        }} />
      ))}
    </div>
  );
}

// ─── Main section ───────────────────────────────────────────────────────────
export default function BalanceBowl() {
  const [active, setActive] = useState({ top: false, right: false, bottom: false, left: false });
  const fontsInjected = useRef(false);

  useEffect(() => {
    if (fontsInjected.current) return;
    fontsInjected.current = true;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes bb-fadeUp { from { opacity:0; transform: translateY(22px);} to { opacity:1; transform: translateY(0);} }
      @keyframes bb-float  { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-11px);} }
      @keyframes bb-shimmer{ 0%,100% { transform: scaleY(1); opacity:0.85;} 50% { transform: scaleY(1.35); opacity:1;} }
    `;
    document.head.appendChild(style);
  }, []);

  const toggle = key => setActive(prev => ({ ...prev, [key]: !prev[key] }));
  const count = Object.values(active).filter(Boolean).length;
  const fill = count / 4;
  const msg = MESSAGES[count];

  // bowl liquid geometry
  const bowlTopY = 270, bowlBottomY = 410;
  const liquidY = bowlBottomY - fill * (bowlBottomY - bowlTopY);
  const liquidHeight = 470 - liquidY;

  const theme = [
    { bg: "#f4fbff", border: "#cfe8f7", title: "#0369a1" },
    { bg: "#eef8ff", border: "#bfe3fb", title: "#0077b6" },
    { bg: "#e9f6ff", border: "#a9d9f4", title: "#00728f" },
    { bg: "#e3f3ff", border: "#8fcdef", title: "#005f87" },
    { bg: "#dcf0ff", border: "#6fc0ec", title: "#004a6b" },
  ][count];

  return (
    <section
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f5fbff 0%, #ffffff 48%, #e6f5fd 100%)",
        display: "flex", flexDirection: "column", alignItems: "center",
        padding: "80px 20px 96px", position: "relative", overflow: "hidden",
        fontFamily: "'Lato', sans-serif", boxSizing: "border-box",
      }}
    >
      {/* ambient glow blobs */}
      {[
        { top: "-120px", left: "-100px", size: "380px", color: "#bfe9fb55" },
        { bottom: "-100px", right: "-90px", size: "360px", color: "#c9e9fb4a" },
      ].map((o, i) => (
        <div key={i} style={{
          position: "absolute", top: o.top, left: o.left, bottom: o.bottom, right: o.right,
          width: o.size, height: o.size, borderRadius: "50%",
          background: `radial-gradient(circle, ${o.color}, transparent 68%)`, pointerEvents: "none",
        }} />
      ))}

      {/* header */}
      <header style={{ textAlign: "center", marginBottom: "40px", maxWidth: "520px", animation: "bb-fadeUp 0.8s ease both", position: "relative", zIndex: 2 }}>
        <span style={{
          fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase",
          color: "#0077b6", fontWeight: 700, display: "block", marginBottom: "14px",
        }}>
          Equilibrium · A Living Vessel
        </span>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(30px,5vw,52px)",
          fontWeight: 400, color: "#1e3a5f", margin: "0 0 16px", lineHeight: 1.15,
        }}>
          The Bowl <em style={{ fontStyle: "italic", color: "#00BFFF" }}>of Balance</em>
        </h2>
        <p style={{ fontSize: "15px", color: "#64748b", lineHeight: 1.75, margin: 0, fontWeight: 300 }}>
          Four weights rest at the edges of one vessel. Lift the ones that
          reflect what you've tended to today — watch the bowl fill, one
          quarter at a time.
        </p>
      </header>

      {/* composition */}
      <div style={{ animation: "bb-float 6s ease-in-out infinite, bb-fadeUp 1s ease both", width: "100%", maxWidth: "660px" }}>
        <svg viewBox="0 0 720 640" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden="true">
          <defs>
            <radialGradient id="bowlCentreGlow" cx="50%" cy="52%" r="50%">
              <stop offset="0%" stopColor="#00BFFF" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#00BFFF" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bowlBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f7fcff" />
              <stop offset="55%" stopColor="#e4f3fb" />
              <stop offset="100%" stopColor="#cfe8f7" />
            </linearGradient>
            <linearGradient id="rimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#d7edf9" />
            </linearGradient>
            <linearGradient id="liquidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7fe3ff" />
              <stop offset="45%" stopColor="#00BFFF" />
              <stop offset="100%" stopColor="#0077b6" />
            </linearGradient>
            <radialGradient id="orbRestGrad" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#eaf5fc" />
            </radialGradient>
            <radialGradient id="orbActiveGrad" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#5fd7ff" />
              <stop offset="100%" stopColor="#0077b6" />
            </radialGradient>
            <clipPath id="bowlInnerClip">
              <path d="M258,272 C248,352 292,414 360,414 C428,414 472,352 462,272 C440,258 280,258 258,272 Z" />
            </clipPath>
            <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          <ellipse cx="360" cy="300" rx="320" ry="150" fill="url(#bowlCentreGlow)" />

          {/* spokes */}
          {WEIGHTS.map(w => {
            const rim = RIM_POINTS[w.key];
            const dx = w.cx - rim.x, dy = w.cy - rim.y;
            const len = Math.hypot(dx, dy);
            const ex = rim.x + (dx / len) * (len - ORB_R - 8);
            const ey = rim.y + (dy / len) * (len - ORB_R - 8);
            const isActive = active[w.key];
            return (
              <line key={w.key} x1={rim.x} y1={rim.y} x2={ex} y2={ey}
                stroke={isActive ? "#00BFFF" : "#bcdcee"} strokeWidth={isActive ? 2.4 : 1.6}
                strokeLinecap="round" opacity={isActive ? 0.9 : 0.65}
                style={{ transition: "all 0.5s ease" }} />
            );
          })}

          {/* bowl shadow (floating cue) */}
          <ellipse cx="360" cy="470" rx="150" ry="18" fill="#123a5e" opacity="0.10" />

          {/* bowl body */}
          <path d="M245,270 C233,362 282,432 360,432 C438,432 487,362 475,270"
            fill="url(#bowlBodyGrad)" stroke="#bcdcee" strokeWidth="1.6" />

          {/* liquid, clipped to bowl interior */}
          <g clipPath="url(#bowlInnerClip)">
            <rect x="240" y={liquidY} width="240" height={liquidHeight}
              fill="url(#liquidGrad)" opacity={count === 0 ? 0.12 : 0.92}
              style={{ transition: "y 0.85s cubic-bezier(0.34,1.3,0.64,1), height 0.85s cubic-bezier(0.34,1.3,0.64,1), opacity 0.6s ease" }} />
            <ellipse cx="360" cy={liquidY} rx="112" ry="9" fill="#ffffff" opacity={count === 0 ? 0.1 : 0.45}
              style={{ transformOrigin: `360px ${liquidY}px`, animation: "bb-shimmer 3.4s ease-in-out infinite", transition: "cy 0.85s cubic-bezier(0.34,1.3,0.64,1)" }} />
            {count > 0 && PARTICLES.map((p, i) => (
              <circle key={i} cx={p.x} cy={liquidY} r={p.r} fill="#ffffff" opacity="0.75">
                <animate attributeName="cy" values={`${liquidY};${liquidY - 130};${liquidY}`} dur={p.dur} begin={p.begin} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0.8;0" dur={p.dur} begin={p.begin} repeatCount="indefinite" />
              </circle>
            ))}
          </g>

          {/* inner rim shadow for depth */}
          <ellipse cx="360" cy="272" rx="103" ry="24" fill="none" stroke="#8fb9d1" strokeWidth="1.4" opacity="0.5" />
          {/* outer rim (drawn over bowl top for 3D lip) */}
          <ellipse cx="360" cy="270" rx="115" ry="28" fill="url(#rimGrad)" stroke="#bcdcee" strokeWidth="1.6" />
          <ellipse cx="360" cy="270" rx="98" ry="20" fill="#eaf6fc" opacity="0.6" />

          {/* weights */}
          {WEIGHTS.map(w => (
            <WeightOrb key={w.key} weight={w} active={active[w.key]} onToggle={toggle} />
          ))}
        </svg>
      </div>

      {/* readout */}
      <div style={{ width: "100%", maxWidth: "380px", marginTop: "18px" }}>
        <FractionMeter count={count} />
        <div style={{
          padding: "22px 26px", borderRadius: "20px",
          background: theme.bg, border: `1.5px solid ${theme.border}`,
          boxShadow: "0 4px 24px rgba(0,119,182,0.08)",
          transition: "all 0.6s ease", animation: "bb-fadeUp 1.1s ease both",
        }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "17px", fontWeight: 700, color: theme.title, margin: "0 0 8px" }}>
            {msg.title}
          </p>
          <p style={{ fontSize: "14px", color: "#475569", margin: 0, lineHeight: 1.75, fontWeight: 300 }}>
            {msg.body}
          </p>
        </div>
      </div>

      {count > 0 && (
        <button
          onClick={() => setActive({ top: false, right: false, bottom: false, left: false })}
          style={{
            marginTop: "32px", padding: "10px 30px", borderRadius: "999px",
            border: "1.5px solid #bcdcee", background: "rgba(255,255,255,0.85)",
            color: "#0077b6", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em",
            cursor: "pointer", transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.target.style.background = "#eaf6fc"; }}
          onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.85)"; }}
        >
          Empty &amp; Begin Again
        </button>
      )}

      <p style={{ marginTop: "40px", fontSize: "11px", color: "#94a3b8", textAlign: "center", maxWidth: "380px", lineHeight: 1.65, fontWeight: 300 }}>
        This is a gentle, figurative reflection tool — not a clinical assessment
        and not a substitute for professional guidance.
      </p>
    </section>
  );
}