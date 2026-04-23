import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "../context/RouterContext";
import { Brain, HeartHandshake, AlertTriangle, Users, ShieldCheck } from "lucide-react";

const BG = "#f8fafc";
const PRIMARY = "#0ea5e9";
const DARK = "#0f172a";
const MUTED = "#64748b";
const BORDER = "#e2e8f0";

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

    <div
      style={{
        display: "grid",
        gap: "1.5rem",
      }}
    >
      {phases.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2, duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          style={{
            padding: "1.5rem",
            borderRadius: "18px",
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* glowing emotional line */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: "6px",
              background:
                i === 0
                  ? "#ef4444"
                  : i === 1
                  ? "#f97316"
                  : i === 2
                  ? "#22c55e"
                  : i === 3
                  ? "#eab308"
                  : "#0ea5e9",
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

          <p style={{ color: MUTED, lineHeight: 1.7 }}>
            {p.desc}
          </p>
        </motion.div>
      ))}
    </div>
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
  },
  {
    title: "Heroic Phase",
    desc: "High energy and rescue behavior among survivors.",
  },
  {
    title: "Honeymoon Phase",
    desc: "Community bonding and shared hope.",
  },
  {
    title: "Disillusionment Phase",
    desc: "Stress, frustration, and emotional fatigue begin.",
  },
  {
    title: "Reconstruction Phase",
    desc: "Long-term recovery and rebuilding of life.",
  },
];
