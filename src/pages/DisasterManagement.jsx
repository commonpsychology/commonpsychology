import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "../context/RouterContext";
import {
  Brain,
  HeartHandshake,
  AlertTriangle,
  Users,
  ShieldCheck,
  MapPin,
  X,
} from "lucide-react";

/* ── Sky-blue / white glass palette — matches BookingPage & CartPage ── */
const C = {
  skyDeep: "#007BA8",
  skyBright: "#00BFFF",
  skyFaint: "#E0F7FF",
  skyFainter: "#F0FBFF",
  white: "#ffffff",
  textDark: "#1a3a4a",
  textMid: "#2e6080",
  textLight: "#7a9aaa",
  border: "#b0d4e8",
  borderFaint: "#daeef8",
};

const btnGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`;

const GLASS = {
  base: "linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.7) 100%)",
  active:
    "linear-gradient(160deg, rgba(224,247,255,0.9) 0%, rgba(180,224,248,0.72) 60%, rgba(224,247,255,0.85) 100%)",
  borderIdle: "1px solid rgba(255,255,255,0.6)",
  shadowIdle: "0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.55)",
  shadowHover: "0 16px 36px rgba(0,123,168,0.20), inset 0 1px 0 rgba(255,255,255,0.6)",
  blur: "blur(14px)",
};

const PAGE_BG = `
  radial-gradient(ellipse 90% 55% at 8% 0%, rgba(186,220,248,0.5) 0%, transparent 62%),
  radial-gradient(ellipse 70% 65% at 100% 6%, rgba(214,238,252,0.55) 0%, transparent 60%),
  radial-gradient(ellipse 65% 55% at 45% 100%, rgba(200,232,250,0.35) 0%, transparent 60%),
  linear-gradient(180deg, #eef8fc 0%, #f6fbff 45%, #eaf5fb 100%)
`;

/* Organic blob shapes for the photo frames — each a slightly different
   irregular border-radius so the gallery reads as flowing, not gridded. */
const BLOBS = [
  "63% 37% 54% 46% / 43% 47% 53% 57%",
  "37% 63% 41% 59% / 55% 48% 52% 45%",
  "58% 42% 63% 37% / 38% 55% 45% 62%",
  "42% 58% 37% 63% / 60% 40% 60% 40%",
  "55% 45% 60% 40% / 45% 60% 40% 55%",
  "48% 52% 44% 56% / 58% 42% 58% 42%",
  "60% 40% 55% 45% / 40% 55% 45% 60%",
];

function PageStyles() {
  return (
    <style>{`
      .dm-flow-wrap { position: relative; }
      .dm-flow-item {
        display: flex;
        align-items: center;
        gap: 2.5rem;
        margin-bottom: 3rem;
        position: relative;
      }
      .dm-flow-item.reverse { flex-direction: row-reverse; }
      .dm-flow-photo {
        flex-shrink: 0;
        width: 300px;
        height: 260px;
        overflow: hidden;
        box-shadow: 0 20px 45px rgba(0,123,168,0.22), inset 0 1px 0 rgba(255,255,255,0.5);
        border: 3px solid rgba(255,255,255,0.75);
        cursor: pointer;
        transition: transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s;
      }
      .dm-flow-photo:hover { transform: scale(1.035) rotate(-0.5deg); box-shadow: 0 26px 55px rgba(0,123,168,0.3); }
      .dm-flow-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .dm-flow-caption { flex: 1; min-width: 0; }

      @media (max-width: 760px) {
        .dm-flow-item, .dm-flow-item.reverse { flex-direction: column; gap: 1.25rem; text-align: center; }
        .dm-flow-photo { width: 100%; max-width: 340px; height: 240px; }
      }

      .phase-labels {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.75rem;
        margin-top: 1rem;
      }
      .phase-labels h3 { overflow-wrap: break-word; word-break: break-word; }
      @media (max-width: 640px) {
        .phase-labels {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          gap: 1rem;
          padding-bottom: 0.5rem;
          -webkit-overflow-scrolling: touch;
        }
        .phase-labels > div { flex: 0 0 auto; width: 130px; scroll-snap-align: start; }
        .phase-labels h3 { font-size: 0.95rem !important; }
        .phase-labels p { font-size: 0.78rem !important; }
      }
    `}</style>
  );
}

/* ── Emotional arc curve (unchanged mechanism, recolored to sky palette) ── */
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
        borderRadius: 18,
        background: GLASS.base,
        backdropFilter: GLASS.blur,
        WebkitBackdropFilter: GLASS.blur,
        border: GLASS.borderIdle,
        boxShadow: GLASS.shadowIdle,
      }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        <defs>
          <linearGradient id="arcFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.skyBright} stopOpacity="0.3" />
            <stop offset="100%" stopColor={C.skyBright} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="arcLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.skyDeep} />
            <stop offset="100%" stopColor={C.skyBright} />
          </linearGradient>
        </defs>

        <line x1={leftPad} y1={baseline} x2={width - rightPad} y2={baseline} stroke={C.borderFaint} strokeWidth="1.5" />

        <motion.path
          d={areaPath}
          fill="url(#arcFill)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#arcLine)"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
          viewport={{ once: true }}
        />

        {points.map((p, i) => (
          <g key={i}>
            <motion.line
              x1={p.x} y1={p.y} x2={p.x} y2={baseline}
              stroke={p.color} strokeWidth="1" strokeDasharray="3 4"
              initial={{ opacity: 0 }} whileInView={{ opacity: 0.5 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }} viewport={{ once: true }}
            />
            <motion.circle
              cx={p.x} cy={p.y} r="9" fill={p.color} opacity="0.15"
              initial={{ scale: 0 }} whileInView={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }} viewport={{ once: true }}
            />
            <motion.circle
              cx={p.x} cy={p.y} r="5" fill={p.color} stroke={C.white} strokeWidth="2"
              initial={{ scale: 0 }} whileInView={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.4 }} viewport={{ once: true }}
            />
          </g>
        ))}
      </svg>

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
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color, margin: "0 auto 0.5rem" }} />
            <h3 style={{ fontFamily: "var(--font-display)", color: C.textDark, fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.35rem" }}>
              {p.title}
            </h3>
            <p style={{ color: C.textLight, lineHeight: 1.6, fontSize: "0.85rem" }}>{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Field photos: real deployment shots, flowing/organic layout ── */
const dispatches = [
  { src: "https://i.postimg.cc/GHGjQd01/dm.jpg", alt: "Field response — psychological support work", location: "Field site", note: "Our team providing psychological support on the ground." },
  { src: "https://i.postimg.cc/Xpdg84M6/dm2.jpg", alt: "Field response — community session", location: "Field site", note: "A community session held during a recent deployment." },
  { src: "https://i.postimg.cc/PPYM4hgB/dm3.jpg", alt: "Field response — team at work", location: "Field site", note: "Our team at work supporting an affected community." },
  { src: "https://i.postimg.cc/crwcm0qq/dm4.jpg", alt: "Field response — outreach", location: "Field site", note: "Outreach and support during a disaster response." },
  { src: "https://i.postimg.cc/D8LcgF99/dm6.jpg", alt: "Field response — group activity", location: "Field site", note: "A group activity as part of our recovery programming." },
  { src: "https://i.postimg.cc/D8LcgF9M/dm7.jpg", alt: "Field response — volunteer coordination", location: "Field site", note: "Volunteers coordinating before deployment." },
  { src: "https://i.postimg.cc/zVKkj5s4/m5.jpg", alt: "Field response — follow-up visit", location: "Field site", note: "A follow-up visit checking in on community wellbeing." },
];

function FieldDispatches() {
  const [open, setOpen] = useState(null);

  return (
    <section style={{ padding: "4rem 1.5rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.skyDeep, opacity: 0.85 }}>
          Proof of Work
        </span>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: C.textDark, margin: "0.5rem 0 0.5rem" }}>
          Our Work in the Field
        </h2>
        <p style={{ color: C.textLight, maxWidth: 560, marginBottom: "3rem", lineHeight: 1.7, fontSize: "0.92rem" }}>
          A look at what disaster response actually looks like on the ground — tap any photo for the full note.
        </p>

        <div className="dm-flow-wrap">
          {dispatches.map((d, i) => (
            <motion.div
              key={i}
              className={`dm-flow-item${i % 2 === 1 ? " reverse" : ""}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              viewport={{ once: true }}
            >
              <div
                className="dm-flow-photo"
                style={{ borderRadius: BLOBS[i % BLOBS.length] }}
                onClick={() => setOpen(d)}
              >
                <img src={d.src} alt={d.alt} loading="lazy" />
              </div>
              <div className="dm-flow-caption">
                <div
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    fontSize: "0.72rem", fontWeight: 700, color: C.skyDeep,
                    background: C.skyFaint, padding: "0.25rem 0.7rem", borderRadius: 100,
                    marginBottom: "0.6rem",
                  }}
                >
                  <MapPin size={12} /> {d.location}
                </div>
                <p style={{ fontFamily: "var(--font-display)", fontSize: "1.05rem", color: C.textDark, lineHeight: 1.6, margin: 0 }}>
                  {d.note}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            style={{
              position: "fixed", inset: 0, zIndex: 1000,
              background: "rgba(15,58,82,0.55)",
              backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1.5rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 640, width: "100%", position: "relative" }}
            >
              <div style={{
                borderRadius: 20, overflow: "hidden", border: "4px solid rgba(255,255,255,0.85)",
                boxShadow: "0 30px 70px rgba(0,60,90,0.35)",
              }}>
                <img src={open.src} alt={open.alt} style={{ width: "100%", display: "block" }} />
              </div>
              <div style={{
                marginTop: "1rem", background: GLASS.base, backdropFilter: GLASS.blur,
                WebkitBackdropFilter: GLASS.blur, border: GLASS.borderIdle, borderRadius: 14,
                padding: "1rem 1.25rem", boxShadow: GLASS.shadowIdle,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", fontWeight: 700, color: C.skyDeep, marginBottom: "0.4rem" }}>
                  <MapPin size={13} /> {open.location}
                </div>
                <p style={{ color: C.textDark, lineHeight: 1.7, margin: 0, fontSize: "0.92rem" }}>{open.note}</p>
              </div>
              <button
                onClick={() => setOpen(null)}
                aria-label="Close"
                style={{
                  position: "absolute", top: -16, right: -16,
                  width: 36, height: 36, borderRadius: "50%",
                  background: C.white, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 6px 18px rgba(0,60,90,0.25)",
                }}
              >
                <X size={18} color={C.textDark} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function DisasterManagementPage() {
  const { navigate } = useRouter();

  return (
    <div style={{ background: PAGE_BG }} className="page-wrapper">
      <PageStyles />

      {/* HERO */}
      <section style={{ height: "68vh", position: "relative" }}>
        <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <source media="(min-width: 768px)" srcSet="/images/crisis.png" />
          <img
            src="/images/crisis.jpg"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
          />
        </picture>
        <div
          style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to top, rgba(0,123,168,0.85) 0%, rgba(0,191,255,0.25) 55%, rgba(255,255,255,0.05) 100%)`,
          }}
        />
        <div style={{ position: "absolute", bottom: "3.5rem", left: "2rem", right: "2rem", maxWidth: 720 }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#fff", opacity: 0.9 }}>
            Common Psychology
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.1rem, 5vw, 3.2rem)", color: "#fff", marginTop: "0.6rem", lineHeight: 1.12 }}>
            Disaster Management &amp; Psychology
          </h1>
          <p style={{ marginTop: "0.85rem", color: "rgba(255,255,255,0.92)", fontSize: "1.02rem", lineHeight: 1.6 }}>
            Understanding trauma, resilience, and human behavior during crisis.
          </p>
        </div>
      </section>

      {/* EMOTIONAL ARC */}
      <section style={{ padding: "4rem 1.5rem" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: C.textDark, textAlign: "center", marginBottom: "2.5rem", fontWeight: 800 }}>
            Psychological Journey Through Disaster
          </h2>
          <EmotionalArc phases={phases} />
        </div>
      </section>

      {/* CORE AREAS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem 1.5rem 3rem" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.7rem", color: C.textDark, marginBottom: "1.5rem" }}>
          Our Focus Areas
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
          {areas.map((a, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              style={{
                background: GLASS.base, backdropFilter: GLASS.blur, WebkitBackdropFilter: GLASS.blur,
                border: GLASS.borderIdle, boxShadow: GLASS.shadowIdle,
                padding: "1.3rem", borderRadius: 18,
              }}
            >
              <a.icon size={26} color={C.skyDeep} />
              <h3 style={{ marginTop: "0.6rem", fontFamily: "var(--font-display)", color: C.textDark, fontSize: "1.05rem" }}>{a.title}</h3>
              <p style={{ color: C.textLight, fontSize: "0.9rem", marginTop: "0.35rem", lineHeight: 1.6 }}>{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FIELD PHOTOS — organic flowing gallery */}
      <FieldDispatches />

      {/* DETERMINATION */}
      <section style={{ padding: "3rem 1.5rem 4rem" }}>
        <div
          style={{
            maxWidth: 900, margin: "0 auto",
            background: btnGrad,
            padding: "2.25rem 2rem", borderRadius: 22, color: "white",
            boxShadow: "0 20px 50px rgba(0,123,168,0.3)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem" }}>Our Determination</h2>
          <p style={{ marginTop: "0.6rem", lineHeight: 1.8 }}>
            We are committed to bringing psychological care into disaster zones. From immediate
            trauma response to long-term mental health recovery, our goal is to rebuild not just
            homes — but minds.
          </p>
          <button
            onClick={() => navigate("/contact")}
            style={{
              marginTop: "1.25rem", background: "white", color: C.skyDeep,
              padding: "0.75rem 1.6rem", borderRadius: 12, border: "none",
              cursor: "pointer", fontWeight: 700, fontFamily: "var(--font-body)",
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
  { icon: Brain, title: "Trauma Response", desc: "Immediate psychological first aid and crisis intervention." },
  { icon: Users, title: "Community Healing", desc: "Group therapy and rebuilding social connection." },
  { icon: HeartHandshake, title: "Emotional Support", desc: "Providing counseling and emotional stabilization." },
  { icon: ShieldCheck, title: "Resilience Building", desc: "Helping individuals develop coping strategies." },
  { icon: AlertTriangle, title: "Crisis Awareness", desc: "Educating people about mental health during disasters." },
];

const phases = [
  { title: "Impact Phase", desc: "Shock, fear, and confusion dominate immediately after disaster.", value: 30, color: "#ef4444" },
  { title: "Heroic Phase", desc: "High energy and rescue behavior among survivors.", value: 80, color: "#f97316" },
  { title: "Honeymoon Phase", desc: "Community bonding and shared hope.", value: 65, color: "#22c55e" },
  { title: "Disillusionment Phase", desc: "Stress, frustration, and emotional fatigue begin.", value: 15, color: "#eab308" },
  { title: "Reconstruction Phase", desc: "Long-term recovery and rebuilding of life.", value: 55, color: "#00BFFF" },
];