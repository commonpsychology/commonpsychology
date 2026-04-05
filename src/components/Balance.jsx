/**
 * BalanceWithin.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * "The Scale Within" — A gentle, figurative wellness balance component.
 *
 * Design: Calm blue-to-white gradient background. Soft indigo & sky blue
 * accents for the scale. No harsh colors or overwhelming animations.
 * Intentionally welcoming for users with psychological sensitivity.
 *
 * Usage:
 *   import BalanceWithin from "./BalanceWithin";
 *   <BalanceWithin />
 *
 * No external library dependencies beyond React.
 * Google Fonts loaded dynamically (Playfair Display + Lato).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useRef } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────
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

// ─── Insight Messages ─────────────────────────────────────────────────────────
function getInsight(bodyTotal, mindTotal) {
  const diff  = Math.abs(bodyTotal - mindTotal);
  const total = bodyTotal + mindTotal;
  if (total === 0)
    return {
      title: "Your scale awaits",
      body: "Gently add what matters to you — there is no right or wrong here. This is just for you.",
      mood: "neutral",
    };
  if (diff <= 1.5)
    return {
      title: "A beautiful balance",
      body: "You are tending to both your body and your mind. This harmony is a quiet strength.",
      mood: "balanced",
    };
  if (bodyTotal > mindTotal)
    return {
      title: "Body is leading today",
      body: "Your physical self is being cared for. Your inner world may welcome a little quiet attention too.",
      mood: "body",
    };
  return {
    title: "Mind is leading today",
    body: "Your inner world is being nurtured. Your body may appreciate gentle movement or restful stillness.",
    mood: "mind",
  };
}

// ─── Chip ─────────────────────────────────────────────────────────────────────
function WeightChip({ item, selected, onToggle, side }) {
  const isBody   = side === "body";
  const accent   = isBody ? "#2563eb" : "#5b21b6";
  const accentBg = isBody ? "#dbeafe" : "#ede9fe";

  return (
    <button
      onClick={() => onToggle(item)}
      style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            "6px",
        padding:        "8px 15px",
        borderRadius:   "999px",
        border:         `1.5px solid ${selected ? accent : "#cbd5e1"}`,
        background:     selected
          ? accentBg
          : "rgba(255,255,255,0.75)",
        color:          selected ? accent : "#475569",
        fontFamily:     "'Lato', sans-serif",
        fontSize:       "13px",
        fontWeight:     selected ? 700 : 400,
        cursor:         "pointer",
        transition:     "all 0.22s ease",
        boxShadow:      selected
          ? `0 2px 14px ${accent}28`
          : "0 1px 4px rgba(0,0,0,0.05)",
        transform:      selected ? "translateY(-2px)" : "none",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        outline:        "none",
      }}
    >
      <span style={{ fontSize: "15px", lineHeight: 1 }}>{item.icon}</span>
      {item.label}
    </button>
  );
}

// ─── Scale Dish ───────────────────────────────────────────────────────────────
function ScaleDish({ side, weights, tilt }) {
  const isBody      = side === "body";
  const accent      = isBody ? "#3b82f6" : "#7c3aed";
  const accentLight = isBody ? "#bfdbfe" : "#ddd6fe";
  const translateY  = isBody ? tilt * 20 : -tilt * 20;

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      alignItems:    "center",
      transition:    "transform 0.75s cubic-bezier(0.34,1.3,0.64,1)",
      transform:     `translateY(${translateY}px)`,
    }}>
      {/* Suspension string */}
      <div style={{
        width:        "2px",
        height:       "52px",
        background:   `linear-gradient(to bottom, ${accentLight}, ${accent})`,
        borderRadius: "2px",
        opacity:      0.65,
      }} />

      {/* Dish bowl */}
      <div style={{
        width:         "136px",
        height:        "58px",
        borderRadius:  "0 0 90px 90px",
        background:    "linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(241,245,255,0.8) 100%)",
        border:        `2px solid ${accentLight}`,
        boxShadow:     `0 10px 36px ${accent}18, inset 0 2px 10px rgba(255,255,255,0.9)`,
        display:       "flex",
        alignItems:    "center",
        justifyContent:"center",
        flexWrap:      "wrap",
        gap:           "5px",
        padding:       "8px",
        backdropFilter:"blur(10px)",
        WebkitBackdropFilter:"blur(10px)",
      }}>
        {weights.map((w, i) => (
          <div
            key={w.id + i}
            style={{
              width:        "20px",
              height:       "20px",
              borderRadius: "50%",
              background:   `radial-gradient(circle at 35% 35%, ${accentLight}, ${accent})`,
              boxShadow:    `0 2px 8px ${accent}44`,
              animation:    "scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          />
        ))}
        {weights.length === 0 && (
          <span style={{
            color:      "#94a3b8",
            fontSize:   "11px",
            fontFamily: "'Lato', sans-serif",
            fontStyle:  "italic",
          }}>
            empty
          </span>
        )}
      </div>

      {/* Side label */}
      <p style={{
        margin:         "10px 0 0",
        fontSize:       "10px",
        letterSpacing:  "0.14em",
        textTransform:  "uppercase",
        color:          accent,
        fontFamily:     "'Lato', sans-serif",
        fontWeight:     700,
        opacity:        0.75,
      }}>
        {isBody ? "Physical" : "Mental"}
      </p>
    </div>
  );
}

// ─── Scale Arm ────────────────────────────────────────────────────────────────
function ScaleArm({ tilt }) {
  const angle = Math.max(-22, Math.min(22, tilt * 22));
  return (
    <div style={{ position: "relative", height: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Fulcrum */}
      <div style={{
        position:     "absolute",
        width:        "18px",
        height:       "18px",
        borderRadius: "50%",
        background:   "linear-gradient(135deg, #93c5fd, #7c3aed)",
        boxShadow:    "0 3px 14px #3b82f644",
        zIndex:       2,
      }} />
      {/* Arm bar */}
      <div style={{
        width:          "clamp(260px, 45vw, 340px)",
        height:         "5px",
        borderRadius:   "5px",
        background:     "linear-gradient(90deg, #7c3aed, #93c5fd, #3b82f6)",
        boxShadow:      "0 3px 18px #3b82f628",
        transform:      `rotate(${angle}deg)`,
        transition:     "transform 0.75s cubic-bezier(0.34,1.3,0.64,1)",
        transformOrigin:"center",
      }} />
    </div>
  );
}

// ─── Balance Bar ──────────────────────────────────────────────────────────────
function BalanceBar({ bodyTotal, mindTotal }) {
  const total    = bodyTotal + mindTotal || 1;
  const bodyPct  = (bodyTotal / total) * 100;
  return (
    <div style={{ width: "100%", maxWidth: "380px", margin: "0 auto" }}>
      <div style={{
        display:        "flex",
        justifyContent: "space-between",
        marginBottom:   "7px",
        fontFamily:     "'Lato', sans-serif",
        fontSize:       "12px",
      }}>
        <span style={{ color: "#2563eb", fontWeight: 700 }}>Physical {Math.round(bodyPct)}%</span>
        <span style={{ color: "#7c3aed", fontWeight: 700 }}>Mental {Math.round(100 - bodyPct)}%</span>
      </div>
      <div style={{
        height:       "8px",
        borderRadius: "999px",
        background:   "#e2e8f0",
        overflow:     "hidden",
        boxShadow:    "inset 0 1px 4px rgba(0,0,0,0.05)",
      }}>
        <div style={{
          height:       "100%",
          width:        `${bodyPct}%`,
          background:   "linear-gradient(90deg, #3b82f6, #93c5fd)",
          borderRadius: "999px",
          transition:   "width 0.75s cubic-bezier(0.34,1.3,0.64,1)",
          boxShadow:    "0 1px 8px #3b82f638",
        }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BalanceWithin() {
  const [bodyWeights, setBodyWeights] = useState([]);
  const [mindWeights, setMindWeights] = useState([]);
  const fontsInjected = useRef(false);

  useEffect(() => {
    if (fontsInjected.current) return;
    fontsInjected.current = true;

    const link = document.createElement("link");
    link.rel  = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes scaleIn {
        0%   { transform: scale(0); opacity: 0; }
        80%  { transform: scale(1.15); }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
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
    <section style={{
      minHeight:     "100vh",
      background:    "linear-gradient(155deg, #dbeafe 0%, #eff6ff 30%, #ffffff 60%, #eef2ff 85%, #e0e7ff 100%)",
      display:       "flex",
      flexDirection: "column",
      alignItems:    "center",
      padding:       "72px 20px 88px",
      position:      "relative",
      overflow:      "hidden",
      boxSizing:     "border-box",
    }}>

      {/* Background soft orbs */}
      {[
        { top: "-100px", left: "-100px", size: "420px", color: "#bfdbfe44" },
        { bottom: "-120px", right: "-80px", size: "380px", color: "#c7d2fe38" },
        { top: "40%", left: "60%", size: "260px", color: "#e0e7ff30" },
      ].map((orb, i) => (
        <div key={i} style={{
          position:     "absolute",
          top:          orb.top,
          left:         orb.left,
          bottom:       orb.bottom,
          right:        orb.right,
          width:        orb.size,
          height:       orb.size,
          borderRadius: "50%",
          background:   `radial-gradient(circle, ${orb.color}, transparent 68%)`,
          pointerEvents:"none",
        }} />
      ))}

      {/* ── Header ── */}
      <header style={{
        textAlign:    "center",
        marginBottom: "52px",
        animation:    "fadeUp 0.8s ease both",
      }}>
        <span style={{
          fontFamily:    "'Lato', sans-serif",
          fontSize:      "10px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color:         "#6366f1",
          fontWeight:    700,
          display:       "block",
          marginBottom:  "14px",
        }}>
          Wellness Reflection · Figurative Only
        </span>

        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize:   "clamp(30px, 5vw, 54px)",
          fontWeight: 400,
          color:      "#1e3a5f",
          margin:     "0 0 18px",
          lineHeight: 1.15,
        }}>
          The Scale <em style={{ fontStyle: "italic", color: "#4f46e5" }}>Within</em>
        </h2>

        <p style={{
          fontFamily: "'Lato', sans-serif",
          fontSize:   "15px",
          color:      "#64748b",
          maxWidth:   "460px",
          lineHeight: 1.75,
          margin:     "0 auto",
          fontWeight: 300,
        }}>
          Gently explore the balance between your physical and inner wellbeing.
          Select what you've been nurturing — this is a reflection, not a score.
        </p>
      </header>

      {/* ── Scale ── */}
      <div style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        marginBottom:  "28px",
        animation:     "fadeUp 0.95s ease both",
      }}>
        {/* Post */}
        <div style={{
          width:        "6px",
          height:       "44px",
          background:   "linear-gradient(to bottom, #93c5fd, #7c3aed)",
          borderRadius: "3px",
          marginBottom: "-4px",
          boxShadow:    "0 4px 18px #3b82f620",
        }} />

        <ScaleArm tilt={tilt} />

        <div style={{
          display:    "flex",
          gap:        "clamp(32px, 8vw, 110px)",
          alignItems: "flex-start",
          marginTop:  "6px",
        }}>
          <ScaleDish side="body" weights={bodyWeights} tilt={tilt} />
          <ScaleDish side="mind" weights={mindWeights} tilt={-tilt} />
        </div>

        {/* Base */}
        <div style={{
          marginTop:  "14px",
          width:      "80px",
          height:     "8px",
          borderRadius:"999px",
          background: "linear-gradient(90deg, #bfdbfe, #c7d2fe)",
          boxShadow:  "0 2px 12px #3b82f620",
        }} />
      </div>

      {/* ── Balance Bar ── */}
      <div style={{
        width:        "100%",
        maxWidth:     "380px",
        marginBottom: "32px",
        opacity:      total > 0 ? 1 : 0,
        transition:   "opacity 0.5s ease",
      }}>
        <BalanceBar bodyTotal={bodyTotal} mindTotal={mindTotal} />
      </div>

      {/* ── Insight Card ── */}
      <div style={{
        maxWidth:     "420px",
        width:        "100%",
        padding:      "22px 26px",
        borderRadius: "20px",
        background:   insightTheme.bg,
        border:       `1.5px solid ${insightTheme.border}`,
        marginBottom: "48px",
        transition:   "all 0.5s ease",
        animation:    "fadeUp 1.05s ease both",
        boxShadow:    "0 4px 24px rgba(99,102,241,0.07)",
      }}>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize:   "17px",
          fontWeight: 700,
          color:      insightTheme.title,
          margin:     "0 0 8px",
        }}>
          {insight.title}
        </p>
        <p style={{
          fontFamily: "'Lato', sans-serif",
          fontSize:   "14px",
          color:      insightTheme.body,
          margin:     0,
          lineHeight: 1.75,
          fontWeight: 300,
        }}>
          {insight.body}
        </p>
      </div>

      {/* ── Weight Selectors ── */}
      <div style={{
        display:             "grid",
        gridTemplateColumns: "1fr 1fr",
        gap:                 "36px",
        width:               "100%",
        maxWidth:            "700px",
        animation:           "fadeUp 1.15s ease both",
      }}>
        {/* Physical */}
        <div>
          <h3 style={{
            fontFamily:  "'Playfair Display', serif",
            fontSize:    "15px",
            color:       "#1d4ed8",
            marginBottom:"14px",
            fontWeight:  700,
            display:     "flex",
            alignItems:  "center",
            gap:         "8px",
          }}>
            <span style={{
              display:      "inline-flex",
              width:        "8px",
              height:       "8px",
              borderRadius: "50%",
              background:   "#3b82f6",
              flexShrink:   0,
            }} />
            Physical
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {BODY_ITEMS.map(item => (
              <WeightChip
                key={item.id}
                item={item}
                selected={!!bodyWeights.find(w => w.id === item.id)}
                onToggle={(i) => toggleItem("body", i)}
                side="body"
              />
            ))}
          </div>
        </div>

        {/* Mental */}
        <div>
          <h3 style={{
            fontFamily:  "'Playfair Display', serif",
            fontSize:    "15px",
            color:       "#5b21b6",
            marginBottom:"14px",
            fontWeight:  700,
            display:     "flex",
            alignItems:  "center",
            gap:         "8px",
          }}>
            <span style={{
              display:      "inline-flex",
              width:        "8px",
              height:       "8px",
              borderRadius: "50%",
              background:   "#7c3aed",
              flexShrink:   0,
            }} />
            Mental
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {MIND_ITEMS.map(item => (
              <WeightChip
                key={item.id}
                item={item}
                selected={!!mindWeights.find(w => w.id === item.id)}
                onToggle={(i) => toggleItem("mind", i)}
                side="mind"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Reset ── */}
      {total > 0 && (
        <button
          onClick={() => { setBodyWeights([]); setMindWeights([]); }}
          style={{
            marginTop:   "40px",
            padding:     "10px 30px",
            borderRadius:"999px",
            border:      "1.5px solid #cbd5e1",
            background:  "rgba(255,255,255,0.82)",
            color:       "#64748b",
            fontFamily:  "'Lato', sans-serif",
            fontSize:    "12px",
            fontWeight:  700,
            letterSpacing:"0.1em",
            cursor:      "pointer",
            transition:  "all 0.2s ease",
            animation:   "fadeUp 0.4s ease both",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onMouseEnter={e => { e.target.style.background = "#f1f5f9"; e.target.style.color = "#334155"; }}
          onMouseLeave={e => { e.target.style.background = "rgba(255,255,255,0.82)"; e.target.style.color = "#64748b"; }}
        >
          Clear &amp; Begin Again
        </button>
      )}

      {/* ── Disclaimer ── */}
      <p style={{
        marginTop:  "44px",
        fontFamily: "'Lato', sans-serif",
        fontSize:   "11px",
        color:      "#94a3b8",
        textAlign:  "center",
        maxWidth:   "380px",
        lineHeight: 1.65,
        fontWeight: 300,
      }}>
        This is a gentle, figurative reflection tool — not a clinical assessment
        and not a substitute for professional guidance.
      </p>
    </section>
  );
}