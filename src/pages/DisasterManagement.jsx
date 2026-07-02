import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "../context/RouterContext";
import { Brain, HeartHandshake, AlertTriangle, Users, ShieldCheck } from "lucide-react";

const BG = "#f8fafc";
const PRIMARY = "#0ea5e9";
const DARK = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

/* ---------------------------------------------------------------------
   EMOTIONAL ARC — a smooth curve through each phase's emotional
   intensity, replacing the stacked phase cards. Same card styling
   (glass panel, colored accents, title/desc fonts) as before, just
   plotted along a single arc instead of a vertical list.
------------------------------------------------------------------------ */
function getSmoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/* Responsive CSS for the phase-label row beneath the arc.
   Desktop keeps the original 5-column grid; on small screens the
   labels become a horizontally scrollable strip so long titles like
   "Disillusionment Phase" never overflow or get crushed. */
function ResponsiveArcStyles() {
  return (
    <style>{`
      .phase-labels {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .phase-labels h3 {
        overflow-wrap: break-word;
        word-break: break-word;
      }
      @media (max-width: 640px) {
        .phase-labels {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          gap: 1rem;
          padding-bottom: 0.5rem;
          -webkit-overflow-scrolling: touch;
        }
        .phase-labels > div {
          flex: 0 0 auto;
          width: 130px;
          scroll-snap-align: start;
        }
        .phase-labels h3 {
          font-size: 0.95rem !important;
        }
        .phase-labels p {
          font-size: 0.78rem !important;
        }
      }
    `}</style>
  );
}

function EmotionalArc({ phases }) {
  const width = 900;
  const height = 260;
  const topPad = 36;
  const baseline = 216;
  const leftPad = 70;
  const rightPad = 70;
  const step = (width - leftPad - rightPad) / (phases.length - 1);

  const points = phases.map((p, i) => ({
    x: leftPad + i * step,
    y: baseline - (p.value / 100) * (baseline - topPad),
    ...p,
  }));

  const linePath = getSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      style={{
        padding: "2rem 1.5rem 1.5rem",
        borderRadius: "18px",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.4)",
        boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
      }}
    >
      <ResponsiveArcStyles />

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        <defs>
          <linearGradient id="arcFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PRIMARY} stopOpacity="0.28" />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* baseline */}
        <line x1={leftPad} y1={baseline} x2={width - rightPad} y2={baseline} stroke={BORDER} strokeWidth="1.5" />

        {/* area under curve */}
        <motion.path
          d={areaPath}
          fill="url(#arcFill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        />

        {/* the arc line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke={PRIMARY}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          viewport={{ once: true }}
        />

        {/* guide lines + dots per phase */}
        {points.map((p, i) => (
          <g key={i}>
            <motion.line
              x1={p.x}
              y1={p.y}
              x2={p.x}
              y2={baseline}
              stroke={p.color}
              strokeWidth="1"
              strokeDasharray="3 4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.5 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
              viewport={{ once: true }}
            />
            <motion.circle
              cx={p.x}
              cy={p.y}
              r="9"
              fill={p.color}
              opacity="0.15"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
              viewport={{ once: true }}
            />
            <motion.circle
              cx={p.x}
              cy={p.y}
              r="5"
              fill={p.color}
              stroke="white"
              strokeWidth="2"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }}
              viewport={{ once: true }}
            />
          </g>
        ))}
      </svg>

      {/* phase labels, aligned under each point */}
      <div className="phase-labels">
        {phases.map((p, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.15, duration: 0.5 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", padding: "0 0.25rem" }}
          >
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: p.color,
                margin: "0 auto 0.5rem",
              }}
            />
            <h3
              style={{
                color: DARK,
                fontSize: "1.2rem",
                fontWeight: "700",
                marginBottom: "0.4rem",
              }}
            >
              {p.title}
            </h3>
            <p style={{ color: MUTED, lineHeight: 1.7, fontSize: "0.85rem" }}>
              {p.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default function DisasterManagementPage() {
  const { navigate } = useRouter();
  const [active, setActive] = useState(0);

  return (
    <div style={{ background: BG }} className="page-wrapper">
      {/* HERO */}
      <section
        style={{
          height: "70vh",
          position: "relative",
        }}
      >
        {/* Responsive background image */}
        <picture
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <source media="(min-width: 768px)" srcSet="/images/crisis.png" />
          <img
            src="/images/crisis.jpg"
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
        </picture>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: "3rem",
            left: "2rem",
            color: "white",
            maxWidth: "700px",
          }}
        >
          <h1 style={{ fontSize: "3rem", fontWeight: "800" }}>
            Disaster Management & Psychology
          </h1>
          <p style={{ marginTop: "0.5rem", color: "#e2e8f0" }}>
            Understanding trauma, resilience, and human behavior during crisis.
          </p>
        </div>
      </section>

      <section
        style={{
          padding: "4rem 1.5rem",
          background: "linear-gradient(to bottom, #f1f5f9, #e0f2fe)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "2rem",
              marginBottom: "2.5rem",
              color: DARK,
              textAlign: "center",
              fontWeight: "800",
            }}
          >
            Psychological Journey Through Disaster
          </h2>

          <EmotionalArc phases={phases} />
        </div>
      </section>

      {/* CORE AREAS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem", color: DARK }}>
          Our Focus Areas
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
          {areas.map((a, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              style={{
                background: "white",
                padding: "1.2rem",
                borderRadius: "16px",
                border: `1px solid ${BORDER}`,
              }}
            >
              <a.icon size={28} color={PRIMARY} />
              <h3 style={{ marginTop: "0.6rem" }}>{a.title}</h3>
              <p style={{ color: MUTED, fontSize: "0.9rem" }}>{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BLOG STYLE SECTION */}


      {/* DETERMINATION SECTION */}
      <section style={{ padding: "3rem 1.5rem" }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: "linear-gradient(135deg,#0ea5e9,#22d3ee)",
            padding: "2rem",
            borderRadius: "20px",
            color: "white",
          }}
        >
          <h2>Our Determination</h2>
          <p style={{ marginTop: "0.5rem", lineHeight: 1.8 }}>
            We are committed to bringing psychological care into disaster zones.
            From immediate trauma response to long-term mental health recovery,
            our goal is to rebuild not just homes—but minds.
          </p>

          <button
            onClick={() => navigate("/contact")}
            style={{
              marginTop: "1rem",
              background: "white",
              color: PRIMARY,
              padding: "0.7rem 1.5rem",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Contact Us
          </button>
        </div>
      </section>


    </div>
  );
}

const areas = [
  {
    icon: Brain,
    title: "Trauma Response",
    desc: "Immediate psychological first aid and crisis intervention.",
  },
  {
    icon: Users,
    title: "Community Healing",
    desc: "Group therapy and rebuilding social connection.",
  },
  {
    icon: HeartHandshake,
    title: "Emotional Support",
    desc: "Providing counseling and emotional stabilization.",
  },
  {
    icon: ShieldCheck,
    title: "Resilience Building",
    desc: "Helping individuals develop coping strategies.",
  },
  {
    icon: AlertTriangle,
    title: "Crisis Awareness",
    desc: "Educating people about mental health during disasters.",
  },
];

const phases = [
  {
    title: "Impact Phase",
    desc: "Shock, fear, and confusion dominate immediately after disaster.",
    value: 30,
    color: "#ef4444",
  },
  {
    title: "Heroic Phase",
    desc: "High energy and rescue behavior among survivors.",
    value: 80,
    color: "#f97316",
  },
  {
    title: "Honeymoon Phase",
    desc: "Community bonding and shared hope.",
    value: 65,
    color: "#22c55e",
  },
  {
    title: "Disillusionment Phase",
    desc: "Stress, frustration, and emotional fatigue begin.",
    value: 15,
    color: "#eab308",
  },
  {
    title: "Reconstruction Phase",
    desc: "Long-term recovery and rebuilding of life.",
    value: 55,
    color: "#0ea5e9",
  },
];