import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "../context/RouterContext";
import { Brain, HeartHandshake, AlertTriangle, Users, ShieldCheck } from "lucide-react";

/* ---------------------------------------------------------------------
   DESIGN TOKENS
   A "paper & ink" base with a five-color phase language borrowed from
   the real disaster-psychology recovery curve (impact → heroic →
   honeymoon → disillusionment → reconstruction). Those five colors are
   the only saturated color in the page — everywhere they appear they
   are pointing at a specific phase, never used decoratively.
------------------------------------------------------------------------ */
const INK = "#1A2333";
const INK_DARK = "#12161E";
const PAPER = "#F1F3F0";
const MUTED = "#5B6472";
const BORDER = "#DDE2DD";

const PHASE = {
  impact: "#B5473F",
  heroic: "#D98A3D",
  honeymoon: "#7A9B6E",
  disillusionment: "#647079",
  reconstruction: "#3E7C8C",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

.dmp-wrapper { font-family: 'Inter', sans-serif; color: ${INK}; }
.dmp-serif { font-family: 'Fraunces', serif; }
.dmp-mono { font-family: 'IBM Plex Mono', monospace; letter-spacing: 0.08em; }

@keyframes dmp-kenburns {
  0% { transform: scale(1); }
  100% { transform: scale(1.08); }
}
@keyframes dmp-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(6px); opacity: 1; }
}
.dmp-hero-img { animation: dmp-kenburns 22s ease-in-out infinite alternate; }
.dmp-scrollcue { animation: dmp-bounce 1.8s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .dmp-hero-img, .dmp-scrollcue { animation: none !important; }
  * { transition-duration: 0.001ms !important; }
}
`;

/* ---------------------------------------------------------------------
   CONTENT — ordered to match the real emotional arc, low to high y
   (y is an SVG coordinate, so a *lower* number sits *higher* on chart)
------------------------------------------------------------------------ */
const phases = [
  {
    key: "impact",
    num: "01",
    title: "Impact Phase",
    desc: "Shock, fear, and confusion dominate in the minutes and hours after disaster strikes.",
    x: 60,
    y: 190,
  },
  {
    key: "heroic",
    num: "02",
    title: "Heroic Phase",
    desc: "A surge of adrenaline drives rescue behavior — survivors act fast, often for others before themselves.",
    x: 250,
    y: 68,
  },
  {
    key: "honeymoon",
    num: "03",
    title: "Honeymoon Phase",
    desc: "Community bonds tighten. Shared hope and visible support make the road ahead feel walkable.",
    x: 440,
    y: 118,
  },
  {
    key: "disillusionment",
    num: "04",
    title: "Disillusionment Phase",
    desc: "Aid slows, attention moves elsewhere, and the real weight of loss settles in. The longest, hardest stretch.",
    x: 630,
    y: 232,
  },
  {
    key: "reconstruction",
    num: "05",
    title: "Reconstruction Phase",
    desc: "A new baseline forms. Recovery isn't a return to before — it's the slow work of building what's next.",
    x: 820,
    y: 148,
  },
];

const pathD = phases
  .map((p, i) => {
    if (i === 0) return `M${p.x},${p.y}`;
    const prev = phases[i - 1];
    const midX = (prev.x + p.x) / 2;
    return `C${midX},${prev.y} ${midX},${p.y} ${p.x},${p.y}`;
  })
  .join(" ");

const areas = [
  { icon: Brain, title: "Trauma Response", desc: "Immediate psychological first aid and crisis intervention.", phase: "impact" },
  { icon: AlertTriangle, title: "Crisis Awareness", desc: "Educating people about mental health before and during disasters.", phase: "heroic" },
  { icon: Users, title: "Community Healing", desc: "Group therapy and rebuilding social connection.", phase: "honeymoon" },
  { icon: HeartHandshake, title: "Emotional Support", desc: "Counseling and stabilization through the hardest stretch of recovery.", phase: "disillusionment" },
  { icon: ShieldCheck, title: "Resilience Building", desc: "Helping individuals develop lasting coping strategies.", phase: "reconstruction" },
];

/* --------------------------------------------------------------------- */

export default function DisasterManagementPage() {
  const { navigate } = useRouter();
  const [active, setActive] = useState(null);

  return (
    <div className="dmp-wrapper" style={{ background: PAPER }}>
      <style>{FONTS}</style>

      {/* HERO */}
      <section style={{ height: "72vh", position: "relative", overflow: "hidden" }}>
        <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <source media="(min-width: 768px)" srcSet="/images/crisis.png" />
          <img
            src="/images/crisis.jpg"
            alt=""
            className="dmp-hero-img"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
          />
        </picture>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(10,12,16,0.88), rgba(10,12,16,0.25) 55%, rgba(10,12,16,0.15))",
          }}
        />

        <div style={{ position: "absolute", bottom: "3.5rem", left: "2rem", right: "2rem", maxWidth: 760 }}>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="dmp-mono"
            style={{ color: PHASE.heroic, fontSize: "0.75rem", textTransform: "uppercase", marginBottom: "0.9rem" }}
          >
            Disaster Psychology &amp; Recovery
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="dmp-serif"
            style={{ fontSize: "3.1rem", fontWeight: 500, lineHeight: 1.08, color: "#FCFBF8" }}
          >
            Understanding the mind through crisis.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            style={{ marginTop: "0.9rem", color: "#D7DBE0", fontSize: "1.05rem", maxWidth: 560 }}
          >
            Trauma, resilience, and human behavior don't follow a straight line.
            Here's how we meet people at every point on that curve.
          </motion.p>
        </div>

        <div className="dmp-scrollcue" style={{ position: "absolute", bottom: "1.4rem", left: "50%", transform: "translateX(-50%)" }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 7L10 13L16 7" stroke="#FCFBF8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </section>

      {/* PSYCHOLOGICAL ARC — signature element */}
      <section style={{ padding: "5rem 1.5rem 3rem", maxWidth: 1000, margin: "0 auto" }}>
        <p className="dmp-mono" style={{ color: MUTED, fontSize: "0.72rem", textTransform: "uppercase", marginBottom: "0.6rem" }}>
          The Emotional Arc
        </p>
        <h2 className="dmp-serif" style={{ fontSize: "2rem", fontWeight: 500, color: INK, marginBottom: "2.5rem", maxWidth: 620 }}>
          Recovery isn't a straight climb out — it moves in phases.
        </h2>

        <svg viewBox="0 0 900 300" style={{ width: "100%", height: "auto", overflow: "visible" }}>
          <defs>
            <linearGradient id="dmpArcGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={PHASE.impact} />
              <stop offset="25%" stopColor={PHASE.heroic} />
              <stop offset="50%" stopColor={PHASE.honeymoon} />
              <stop offset="75%" stopColor={PHASE.disillusionment} />
              <stop offset="100%" stopColor={PHASE.reconstruction} />
            </linearGradient>
          </defs>

          {/* baseline */}
          <line x1="40" y1="270" x2="880" y2="270" stroke={BORDER} strokeWidth="1" />

          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#dmpArcGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />

          {phases.map((p, i) => {
            const isActive = active === i;
            const labelAbove = p.y <= 150;
            return (
              <g
                key={p.key}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(isActive ? null : i)}
              >
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={isActive ? 8 : 5.5}
                  fill={PAPER}
                  stroke={PHASE[p.key]}
                  strokeWidth={isActive ? 3 : 2}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.18 }}
                />
                <text
                  x={p.x}
                  y={labelAbove ? p.y - 34 : p.y + 30}
                  textAnchor="middle"
                  className="dmp-mono"
                  style={{ fontSize: "10px", fill: MUTED }}
                >
                  {p.num}
                </text>
                <text
                  x={p.x}
                  y={labelAbove ? p.y - 18 : p.y + 46}
                  textAnchor="middle"
                  className="dmp-serif"
                  style={{ fontSize: "14px", fill: isActive ? PHASE[p.key] : INK, fontWeight: 500 }}
                >
                  {p.title.replace(" Phase", "")}
                </text>
              </g>
            );
          })}
        </svg>

        {/* detail row, synced to the chart via `active` */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "1.25rem",
            marginTop: "1.5rem",
          }}
        >
          {phases.map((p, i) => (
            <div
              key={p.key}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              style={{
                borderTop: `2px solid ${active === i ? PHASE[p.key] : BORDER}`,
                paddingTop: "0.9rem",
                transition: "border-color 0.2s ease",
                cursor: "pointer",
              }}
            >
              <p style={{ color: MUTED, fontSize: "0.9rem", lineHeight: 1.6 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOCUS AREAS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "4rem 1.5rem" }}>
        <p className="dmp-mono" style={{ color: MUTED, fontSize: "0.72rem", textTransform: "uppercase", marginBottom: "0.6rem" }}>
          What We Do
        </p>
        <h2 className="dmp-serif" style={{ fontSize: "1.9rem", fontWeight: 500, marginBottom: "2rem", color: INK }}>
          Support mapped to every phase.
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "1.1rem" }}>
          {areas.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              style={{
                background: "#fff",
                padding: "1.4rem",
                borderRadius: "14px",
                border: `1px solid ${BORDER}`,
                transition: "box-shadow 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: `${PHASE[a.phase]}1A`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "0.9rem",
                }}
              >
                <a.icon size={19} color={PHASE[a.phase]} strokeWidth={2} />
              </div>
              <h3 className="dmp-serif" style={{ fontSize: "1.05rem", fontWeight: 500, color: INK }}>{a.title}</h3>
              <p style={{ color: MUTED, fontSize: "0.88rem", marginTop: "0.35rem", lineHeight: 1.55 }}>{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DETERMINATION / CTA */}
      <section style={{ padding: "1rem 1.5rem 5rem" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: INK_DARK,
            padding: "3rem 2.5rem",
            borderRadius: "20px",
            color: "#F1F3F0",
          }}
        >
          <p className="dmp-mono" style={{ color: PHASE.heroic, fontSize: "0.72rem", textTransform: "uppercase", marginBottom: "0.8rem" }}>
            Our Determination
          </p>
          <h2 className="dmp-serif" style={{ fontSize: "1.8rem", fontWeight: 500, maxWidth: 560 }}>
            We rebuild minds, not just homes.
          </h2>
          <p style={{ marginTop: "0.9rem", lineHeight: 1.8, color: "#B9BFC7", maxWidth: 560 }}>
            From immediate trauma response to long-term mental health recovery, our work
            follows people through the full arc — especially the phase everyone else
            has stopped watching for.
          </p>

          <button
            onClick={() => navigate("/contact")}
            style={{
              marginTop: "1.6rem",
              background: "transparent",
              color: "#F1F3F0",
              padding: "0.75rem 1.6rem",
              borderRadius: "999px",
              border: `1.5px solid ${PHASE.heroic}`,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.95rem",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = PHASE.heroic)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Contact Us
          </button>
        </motion.div>
      </section>
    </div>
  );
}