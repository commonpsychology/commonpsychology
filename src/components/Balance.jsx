/**
 * BalanceWithin.jsx — Enhanced Edition
 * ─────────────────────────────────────────────────────────
 * Fixed: user + authToken now come from AuthContext
 * (previously used its own bw_token which was never set)
 * ─────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";
import DreamSection from "./DreamSection";
import { useAuth } from "../context/AuthContext"; // ← adjust path to match your project

// ─── Data ────────────────────────────────────────────────────────────────────
const BODY_ITEMS = [
  { id: "b1", label: "Movement",    icon: "🚶", value: 2   },
  { id: "b2", label: "Nourishment", icon: "🥗", value: 1.5 },
  { id: "b3", label: "Sleep",       icon: "🌙", value: 2.5 },
  { id: "b4", label: "Hydration",   icon: "💧", value: 1   },
  { id: "b5", label: "Rest",        icon: "☁️", value: 1.5 },
  { id: "b6", label: "Fresh Air",   icon: "🌿", value: 1   },
];

const MIND_ITEMS = [
  { id: "m1", label: "Stillness",  icon: "🔵", value: 2   },
  { id: "m2", label: "Connection", icon: "🤝", value: 1.5 },
  { id: "m3", label: "Creativity", icon: "🎨", value: 1   },
  { id: "m4", label: "Gratitude",  icon: "🌸", value: 1   },
  { id: "m5", label: "Learning",   icon: "📖", value: 1.5 },
  { id: "m6", label: "Joy",        icon: "✨", value: 2   },
];

function getInsight(bodyTotal, mindTotal) {
  const diff  = Math.abs(bodyTotal - mindTotal);
  const total = bodyTotal + mindTotal;
  if (total === 0)
    return { title: "Your scale awaits", body: "Gently add what matters to you — there is no right or wrong here. This is just for you.", mood: "neutral" };
  if (diff <= 1.5)
    return { title: "A beautiful balance", body: "You are tending to both your body and your mind. This harmony is a quiet strength.", mood: "balanced" };
  if (bodyTotal > mindTotal)
    return { title: "Body is leading today", body: "Your physical self is being cared for. Your inner world may welcome a little quiet attention too.", mood: "body" };
  return { title: "Mind is leading today", body: "Your inner world is being nurtured. Your body may appreciate gentle movement or restful stillness.", mood: "mind" };
}

// ─── Infinity Scale Constants ─────────────────────────────────────────────────
const CX = 340, CY = 115;
const INF_PATH = `M ${CX},${CY} C ${CX+55},${CY-72} ${CX+200},${CY-72} ${CX+260},${CY} C ${CX+200},${CY+72} ${CX+55},${CY+72} ${CX},${CY} C ${CX-55},${CY-72} ${CX-200},${CY-72} ${CX-260},${CY} C ${CX-200},${CY+72} ${CX-55},${CY+72} ${CX},${CY} Z`;

const PARTICLES = [
  { r: 5,   color: "#93c5fd", dur: "6s",   begin: "0s"    },
  { r: 3.5, color: "#a78bfa", dur: "7.5s", begin: "-1.5s" },
  { r: 4,   color: "#818cf8", dur: "5.5s", begin: "-3s"   },
  { r: 3,   color: "#c4b5fd", dur: "8.2s", begin: "-4.8s" },
  { r: 4.5, color: "#60a5fa", dur: "6.5s", begin: "-2.2s" },
  { r: 3,   color: "#e0e7ff", dur: "9s",   begin: "-5.5s" },
  { r: 2.5, color: "#ddd6fe", dur: "7s",   begin: "-1s"   },
  { r: 4,   color: "#bfdbfe", dur: "8.5s", begin: "-6.5s" },
];

// ─── Infinity Scale SVG ───────────────────────────────────────────────────────
function InfinityScaleSVG({ bodyWeights, mindWeights, tilt }) {
  const angle   = Math.max(-12, Math.min(12, tilt * 12));
  const DISH_Y  = 262;
  const L       = 80;
  const R       = 600;
  const STR_BOT = DISH_Y - 26;

  return (
    <svg
      viewBox="0 0 680 360"
      width="100%"
      style={{ maxWidth: "700px", display: "block", overflow: "visible", margin: "0 auto" }}
      aria-hidden="true"
    >
      <defs>
        <path id="infMP" d={INF_PATH} />
        <linearGradient id="infG" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.95" />
          <stop offset="45%"  stopColor="#818cf8" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.95" />
        </linearGradient>
        <radialGradient id="centreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#818cf8" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0"   />
        </radialGradient>
        <linearGradient id="ldg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.98)" />
          <stop offset="100%" stopColor="rgba(219,234,254,0.82)" />
        </linearGradient>
        <linearGradient id="rdg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.98)" />
          <stop offset="100%" stopColor="rgba(237,233,254,0.82)" />
        </linearGradient>
      </defs>

      <ellipse cx={CX} cy={CY} rx={295} ry={105} fill="url(#centreGlow)" />

      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${CX}px ${CY}px`, transition: "transform 0.78s cubic-bezier(0.34, 1.3, 0.64, 1)" }}>
        <use href="#infMP" fill="none" stroke="#818cf8" strokeWidth="22" strokeOpacity="0.09" />
        <use href="#infMP" fill="none" stroke="#818cf8" strokeWidth="11" strokeOpacity="0.14" />
        <path d={INF_PATH} fill="#eef2ff" fillOpacity="0.13" />
        <use href="#infMP" fill="none" stroke="url(#infG)" strokeWidth="2.8" />

        {PARTICLES.map((p, i) => (
          <circle key={i} r={p.r} fill={p.color} opacity="0.92">
            <animateMotion dur={p.dur} repeatCount="indefinite" begin={p.begin}>
              <mpath href="#infMP" />
            </animateMotion>
          </circle>
        ))}

        <line x1={L} y1={CY + 2} x2={L} y2={STR_BOT} stroke="#93c5fd" strokeWidth="1.5" strokeOpacity="0.65" />
        <line x1={R} y1={CY + 2} x2={R} y2={STR_BOT} stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.65" />

        <ellipse cx={L} cy={DISH_Y} rx={64} ry={25} fill="url(#ldg)" stroke="#93c5fd" strokeWidth="1.8" />
        {bodyWeights.slice(0, 8).map((w, i) => (
          <circle key={w.id} cx={L - 22 + (i % 4) * 14} cy={DISH_Y - 5 + Math.floor(i / 4) * 13} r={5.5} fill="#3b82f6" fillOpacity="0.88" />
        ))}
        {bodyWeights.length === 0 && (
          <text x={L} y={DISH_Y + 7} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Lato,sans-serif" fontStyle="italic">empty</text>
        )}
        <text x={L} y={DISH_Y + 44} textAnchor="middle" fill="#1d4ed8" fontSize="9" fontFamily="Lato,sans-serif" fontWeight="700" letterSpacing="0.14em">PHYSICAL</text>

        <ellipse cx={R} cy={DISH_Y} rx={64} ry={25} fill="url(#rdg)" stroke="#c4b5fd" strokeWidth="1.8" />
        {mindWeights.slice(0, 8).map((w, i) => (
          <circle key={w.id} cx={R - 22 + (i % 4) * 14} cy={DISH_Y - 5 + Math.floor(i / 4) * 13} r={5.5} fill="#7c3aed" fillOpacity="0.88" />
        ))}
        {mindWeights.length === 0 && (
          <text x={R} y={DISH_Y + 7} textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Lato,sans-serif" fontStyle="italic">empty</text>
        )}
        <text x={R} y={DISH_Y + 44} textAnchor="middle" fill="#5b21b6" fontSize="9" fontFamily="Lato,sans-serif" fontWeight="700" letterSpacing="0.14em">MENTAL</text>
      </g>
    </svg>
  );
}

// ─── WeightChip ───────────────────────────────────────────────────────────────
function WeightChip({ item, selected, onToggle, side }) {
  const isBody   = side === "body";
  const accent   = isBody ? "#2563eb" : "#5b21b6";
  const accentBg = isBody ? "#dbeafe" : "#ede9fe";

  return (
    <button
      onClick={() => onToggle(item)}
      style={{
        display: "inline-flex", alignItems: "center", gap: "6px",
        padding: "8px 15px", borderRadius: "999px",
        border: `1.5px solid ${selected ? accent : "#cbd5e1"}`,
        background: selected ? accentBg : "rgba(255,255,255,0.75)",
        color: selected ? accent : "#475569",
        fontFamily: "'Lato', sans-serif", fontSize: "13px",
        fontWeight: selected ? 700 : 400, cursor: "pointer",
        transition: "all 0.22s ease",
        boxShadow: selected ? `0 2px 14px ${accent}28` : "0 1px 4px rgba(0,0,0,0.05)",
        transform: selected ? "translateY(-2px)" : "none",
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", outline: "none",
      }}
    >
      <span style={{ fontSize: "15px", lineHeight: 1 }}>{item.icon}</span>
      {item.label}
    </button>
  );
}

// ─── BalanceBar ───────────────────────────────────────────────────────────────
function BalanceBar({ bodyTotal, mindTotal }) {
  const total   = bodyTotal + mindTotal || 1;
  const bodyPct = (bodyTotal / total) * 100;

  return (
    <div style={{ width: "100%", maxWidth: "380px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px", fontFamily: "'Lato', sans-serif", fontSize: "12px" }}>
        <span style={{ color: "#2563eb", fontWeight: 700 }}>Physical {Math.round(bodyPct)}%</span>
        <span style={{ color: "#7c3aed", fontWeight: 700 }}>Mental {Math.round(100 - bodyPct)}%</span>
      </div>
      <div style={{ height: "8px", borderRadius: "999px", background: "#e2e8f0", overflow: "hidden", boxShadow: "inset 0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ height: "100%", width: `${bodyPct}%`, background: "linear-gradient(90deg, #3b82f6, #93c5fd)", borderRadius: "999px", transition: "width 0.75s cubic-bezier(0.34,1.3,0.64,1)", boxShadow: "0 1px 8px #3b82f638" }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BalanceWithin() {
  const [bodyWeights, setBodyWeights] = useState([]);
  const [mindWeights, setMindWeights] = useState([]);
  const [authOpen,    setAuthOpen]    = useState(false);
  const fontsInjected                 = useRef(false);

  // ✅ Pull user from AuthContext — the single source of truth
  const { user } = useAuth();

  // ✅ Read the correct token key your AuthContext stores
  const authToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (fontsInjected.current) return;
    fontsInjected.current = true;

    const link = document.createElement("link");
    link.rel   = "stylesheet";
    link.href  = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes twinkle {
        0%   { opacity: 0.1; transform: scale(0.7); }
        100% { opacity: 0.9; transform: scale(1.3); }
      }
      @keyframes dotPulse {
        0%, 100% { opacity: 0.2; transform: scale(0.75); }
        50%       { opacity: 1;   transform: scale(1.2);  }
      }
      @keyframes infinityFloat {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-6px); }
      }
      @keyframes floatCosmos {
        0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
        50%       { transform: translate(-50%, -50%) translateY(-14px); }
      }
      @keyframes glowPulse {
        0%, 100% {
          text-shadow: 0 0 40px rgba(167,139,250,0.5), 0 0 80px rgba(124,58,237,0.2);
        }
        50% {
          text-shadow: 0 0 80px rgba(167,139,250,0.95), 0 0 150px rgba(124,58,237,0.6);
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const toggleItem = (side, item) => {
    const setter = side === "body" ? setBodyWeights : setMindWeights;
    setter(prev =>
      prev.find(w => w.id === item.id)
        ? prev.filter(w => w.id !== item.id)
        : [...prev, item]
    );
  };

  const bodyTotal = bodyWeights.reduce((s, w) => s + w.value, 0);
  const mindTotal = mindWeights.reduce((s, w) => s + w.value, 0);
  const total     = bodyTotal + mindTotal;
  const tilt      = total === 0
    ? 0
    : (bodyTotal - mindTotal) / Math.max(bodyTotal, mindTotal);

  const insight = getInsight(bodyTotal, mindTotal);
  const insightTheme = {
    neutral:  { bg: "#f0f9ff", border: "#bae6fd", title: "#0369a1", body: "#475569" },
    balanced: { bg: "#f0fdf4", border: "#bbf7d0", title: "#15803d", body: "#475569" },
    body:     { bg: "#eff6ff", border: "#bfdbfe", title: "#1d4ed8", body: "#475569" },
    mind:     { bg: "#f5f3ff", border: "#ddd6fe", title: "#5b21b6", body: "#475569" },
  }[insight.mood];

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>

      {/* ════ SECTION 1 — THE SCALE ════ */}
      <section
        style={{
          minHeight: "100vh",
          background: "linear-gradient(155deg, #dbeafe 0%, #eff6ff 30%, #ffffff 60%, #eef2ff 85%, #e0e7ff 100%)",
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "72px 20px 88px", position: "relative", overflow: "hidden", boxSizing: "border-box",
        }}
      >
        {[
          { top: "-100px", left: "-100px", size: "420px", color: "#bfdbfe44" },
          { bottom: "-120px", right: "-80px", size: "380px", color: "#c7d2fe38" },
          { top: "40%", left: "60%", size: "260px", color: "#e0e7ff30" },
        ].map((o, i) => (
          <div key={i} style={{ position: "absolute", top: o.top, left: o.left, bottom: o.bottom, right: o.right, width: o.size, height: o.size, borderRadius: "50%", background: `radial-gradient(circle, ${o.color}, transparent 68%)`, pointerEvents: "none" }} />
        ))}

        <header style={{ textAlign: "center", marginBottom: "48px", animation: "fadeUp 0.8s ease both" }}>
          <span style={{ fontFamily: "'Lato',sans-serif", fontSize: "10px", letterSpacing: "0.22em", textTransform: "uppercase", color: "#6366f1", fontWeight: 700, display: "block", marginBottom: "14px" }}>
            Wellness Reflection · Figurative Only
          </span>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(30px,5vw,54px)", fontWeight: 400, color: "#1e3a5f", margin: "0 0 18px", lineHeight: 1.15 }}>
            The Scale <em style={{ fontStyle: "italic", color: "#4f46e5" }}>Within</em>
          </h2>
          <p style={{ fontFamily: "'Lato',sans-serif", fontSize: "15px", color: "#64748b", maxWidth: "460px", lineHeight: 1.75, margin: "0 auto", fontWeight: 300 }}>
            Gently explore the balance between your physical and inner wellbeing.
            Select what you've been nurturing — this is a reflection, not a score.
          </p>
        </header>

        <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: "24px", animationName: "fadeUp, infinityFloat", animationDuration: "0.95s, 5s", animationDelay: "0s, 1s", animationTimingFunction: "ease, ease-in-out", animationFillMode: "both, none", animationIterationCount: "1, infinite" }}>
          <InfinityScaleSVG bodyWeights={bodyWeights} mindWeights={mindWeights} tilt={tilt} />
        </div>

        <div style={{ width: "100%", maxWidth: "380px", marginBottom: "32px", opacity: total > 0 ? 1 : 0, transition: "opacity 0.5s ease" }}>
          <BalanceBar bodyTotal={bodyTotal} mindTotal={mindTotal} />
        </div>

        <div style={{ maxWidth: "420px", width: "100%", padding: "22px 26px", borderRadius: "20px", background: insightTheme.bg, border: `1.5px solid ${insightTheme.border}`, marginBottom: "48px", transition: "all 0.5s ease", animation: "fadeUp 1.05s ease both", boxShadow: "0 4px 24px rgba(99,102,241,0.07)" }}>
          <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "17px", fontWeight: 700, color: insightTheme.title, margin: "0 0 8px" }}>{insight.title}</p>
          <p style={{ fontFamily: "'Lato',sans-serif", fontSize: "14px", color: insightTheme.body, margin: 0, lineHeight: 1.75, fontWeight: 300 }}>{insight.body}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "36px", width: "100%", maxWidth: "700px", animation: "fadeUp 1.15s ease both" }}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "15px", color: "#1d4ed8", marginBottom: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-flex", width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
              Physical
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {BODY_ITEMS.map(item => (
                <WeightChip key={item.id} item={item} selected={!!bodyWeights.find(w => w.id === item.id)} onToggle={i => toggleItem("body", i)} side="body" />
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "15px", color: "#5b21b6", marginBottom: "14px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ display: "inline-flex", width: "8px", height: "8px", borderRadius: "50%", background: "#7c3aed", flexShrink: 0 }} />
              Mental
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {MIND_ITEMS.map(item => (
                <WeightChip key={item.id} item={item} selected={!!mindWeights.find(w => w.id === item.id)} onToggle={i => toggleItem("mind", i)} side="mind" />
              ))}
            </div>
          </div>
        </div>

        {total > 0 && (
          <button
            onClick={() => { setBodyWeights([]); setMindWeights([]); }}
            style={{ marginTop: "40px", padding: "10px 30px", borderRadius: "999px", border: "1.5px solid #cbd5e1", background: "rgba(255,255,255,0.82)", color: "#64748b", fontFamily: "'Lato',sans-serif", fontSize: "12px", fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer", transition: "all 0.2s ease", animation: "fadeUp 0.4s ease both", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
            onMouseEnter={e => { e.target.style.background = "#f1f5f9"; e.target.style.color = "#334155"; }}
            onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.82)"; e.target.style.color = "#64748b"; }}
          >
            Clear &amp; Begin Again
          </button>
        )}

        <p style={{ marginTop: "44px", fontFamily: "'Lato',sans-serif", fontSize: "11px", color: "#94a3b8", textAlign: "center", maxWidth: "380px", lineHeight: 1.65, fontWeight: 300 }}>
          This is a gentle, figurative reflection tool — not a clinical assessment
          and not a substitute for professional guidance.
        </p>
      </section>

      {/* ════ SECTION 2 — THE DREAM ════ */}
      <DreamSection
        user={user}
        onRequestLogin={() => setAuthOpen(true)}
apiBase={import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || "${import.meta.env.VITE_API_URL}"}
        authToken={authToken}
      />
    </div>
  );
}