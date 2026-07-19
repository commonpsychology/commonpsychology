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
  Calendar,
  X,
} from "lucide-react";

/* ---------------------------------------------------------------------
   DESIGN TOKENS
   ink      — dusk-after-disaster navy, used for hero/footer/dark bands
   fog      — cool post-storm light, replaces a generic warm-cream bg
   amber    — signal / hazard-tape accent, used sparingly for emphasis
   teal     — recovery & growth accent, replaces the old generic sky-blue
   ash      — muted body text
   charcoal — primary text on light backgrounds
------------------------------------------------------------------------ */
const ink = "#10192B";
const fog = "#E9EEEE";
const paper = "#FFFFFF";
const amber = "#E8A33D";
const teal = "#2F8F87";
const ash = "#64748B";
const charcoal = "#1B2430";
const border = "#DCE3E3";

const FONT_DISPLAY = "'Fraunces', Georgia, serif";
const FONT_LABEL = "'Barlow Condensed', 'Arial Narrow', sans-serif";
const FONT_BODY = "'Inter', system-ui, sans-serif";

/* ---------------------------------------------------------------------
   Global type + section-seam styles for this page.
   Note: for production, move the @import into index.html's <head>
   (or your font-loading setup) instead of a runtime @import — this
   inline version is here so the component works standalone.
------------------------------------------------------------------------ */
function PageStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&display=swap');

      .dm-eyebrow {
        font-family: ${FONT_LABEL};
        text-transform: uppercase;
        letter-spacing: 0.14em;
        font-weight: 600;
      }

      /* Torn-seam divider between hero and body — a literal fault line */
      .dm-seam {
        position: relative;
        height: 46px;
        margin-top: -2px;
      }
      .dm-seam svg { display: block; width: 100%; height: 100%; }

      /* ---- Field Dispatches photo grid ---- */
      .dispatch-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-auto-rows: 190px;
        gap: 14px;
      }
      .dispatch-item:nth-child(1) { grid-column: span 2; grid-row: span 2; }
      .dispatch-item:nth-child(4) { grid-column: span 2; }
      .dispatch-item:nth-child(7) { grid-column: span 2; grid-row: span 2; }

      @media (max-width: 900px) {
        .dispatch-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 200px; }
        .dispatch-item:nth-child(1) { grid-column: span 2; grid-row: span 2; }
        .dispatch-item:nth-child(4) { grid-column: span 1; }
        .dispatch-item:nth-child(7) { grid-column: span 2; grid-row: span 1; }
      }
      @media (max-width: 560px) {
        .dispatch-grid { grid-template-columns: 1fr; grid-auto-rows: 240px; }
        .dispatch-item, .dispatch-item:nth-child(1), .dispatch-item:nth-child(4), .dispatch-item:nth-child(7) {
          grid-column: span 1 !important; grid-row: span 1 !important;
        }
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

/* ---------------------------------------------------------------------
   EMOTIONAL ARC — same underlying curve mechanism as before (this is
   the page's real signature idea), restyled into the new palette.
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
        borderRadius: "4px",
        background: paper,
        border: `1px solid ${border}`,
        boxShadow: "0 12px 30px rgba(16,25,43,0.06)",
      }}
    >
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
        <defs>
          <linearGradient id="arcFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={teal} stopOpacity="0.25" />
            <stop offset="100%" stopColor={teal} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1={leftPad} y1={baseline} x2={width - rightPad} y2={baseline} stroke={border} strokeWidth="1.5" />

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
          stroke={teal}
          strokeWidth="3"
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
              cx={p.x} cy={p.y} r="5" fill={p.color} stroke={paper} strokeWidth="2"
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
            <h3 style={{ fontFamily: FONT_DISPLAY, color: charcoal, fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.35rem" }}>
              {p.title}
            </h3>
            <p style={{ color: ash, lineHeight: 1.6, fontSize: "0.85rem", fontFamily: FONT_BODY }}>{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------------
   FIELD DISPATCHES — the proof-of-work photo gallery.
   Swap the `src` paths below for your real photos. Keep captions
   honest and specific (real place + real date reads far stronger
   than generic captions like "Helping a community").
------------------------------------------------------------------------ */
const dispatches = [
  {
    id: 1,
    src: "/images/fieldwork/dispatch-01.jpg",
    alt: "Team leading a group counseling circle after flooding",
    location: "Sindhupalchok",
    date: "Jul 2025",
    note: "First group session, four days after the flood.",
  },
  {
    id: 2,
    src: "/images/fieldwork/dispatch-02.jpg",
    alt: "Psychological first aid training for local volunteers",
    location: "Bhaktapur",
    date: "Mar 2025",
    note: "Training 30 volunteers in psychological first aid.",
  },
  {
    id: 3,
    src: "/images/fieldwork/dispatch-03.jpg",
    alt: "One-on-one counseling session in a temporary shelter",
    location: "Melamchi",
    date: "Jul 2025",
    note: "Individual sessions inside the relief camp.",
  },
  {
    id: 4,
    src: "/images/fieldwork/dispatch-04.jpg",
    alt: "Children's art therapy workshop",
    location: "Dolakha",
    date: "May 2025",
    note: "Art therapy for children displaced by landslides.",
  },
  {
    id: 5,
    src: "/images/fieldwork/dispatch-05.jpg",
    alt: "Community debrief meeting after the response",
    location: "Sindhupalchok",
    date: "Aug 2025",
    note: "Three-month follow-up debrief with the community.",
  },
  {
    id: 6,
    src: "/images/fieldwork/dispatch-06.jpg",
    alt: "Volunteer team preparing for deployment",
    location: "Kathmandu",
    date: "Feb 2025",
    note: "Team briefing before deployment to the field.",
  },
  {
    id: 7,
    src: "/images/fieldwork/dispatch-07.jpg",
    alt: "Wide shot of the mobile counseling tent set up on-site",
    location: "Melamchi",
    date: "Jul 2025",
    note: "Our mobile counseling tent, set up within 48 hours.",
  },
];

function FieldDispatches() {
  const [open, setOpen] = useState(null);

  return (
    <section style={{ background: fog, padding: "4.5rem 1.5rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <span className="dm-eyebrow" style={{ color: amber, fontSize: "0.85rem" }}>
          Proof of Work
        </span>
        <h2
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 600,
            color: ink,
            margin: "0.4rem 0 0.5rem",
          }}
        >
          Field Dispatches
        </h2>
        <p style={{ color: ash, fontFamily: FONT_BODY, maxWidth: 560, marginBottom: "2rem", lineHeight: 1.7 }}>
          Every dispatch below is a real deployment — logged by location and date, the way our field
          teams record them. Tap a photo to read the full note.
        </p>

        <div className="dispatch-grid">
          {dispatches.map((d, i) => (
            <motion.button
              key={d.id}
              className="dispatch-item"
              onClick={() => setOpen(d)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              viewport={{ once: true }}
              style={{
                position: "relative",
                border: "none",
                padding: 0,
                cursor: "pointer",
                borderRadius: "4px",
                overflow: "hidden",
                background: `${ink}`,
                textAlign: "left",
              }}
            >
              <img
                src={d.src}
                alt={d.alt}
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.92 }}
              />
              <div
                style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(16,25,43,0.88) 0%, rgba(16,25,43,0.1) 55%, transparent 100%)",
                }}
              />
              <span
                className="dm-eyebrow"
                style={{
                  position: "absolute", top: 10, left: 10,
                  color: amber, fontSize: "0.72rem",
                  background: "rgba(16,25,43,0.55)",
                  padding: "0.15rem 0.5rem", borderRadius: "2px",
                }}
              >
                Dispatch {String(d.id).padStart(2, "0")}
              </span>
              <div style={{ position: "absolute", left: 12, right: 12, bottom: 10, color: paper }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", opacity: 0.9, fontFamily: FONT_BODY }}>
                  <MapPin size={12} /> {d.location}
                  <span style={{ opacity: 0.6 }}>·</span>
                  <Calendar size={12} /> {d.date}
                </div>
              </div>
            </motion.button>
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
              background: "rgba(16,25,43,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1.5rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: 720, width: "100%" }}
            >
              <img src={open.src} alt={open.alt} style={{ width: "100%", borderRadius: 4, display: "block" }} />
              <div style={{ marginTop: "1rem", color: paper }}>
                <div className="dm-eyebrow" style={{ color: amber, fontSize: "0.8rem", marginBottom: "0.4rem" }}>
                  Dispatch {String(open.id).padStart(2, "0")} — {open.location}, {open.date}
                </div>
                <p style={{ fontFamily: FONT_BODY, lineHeight: 1.7, color: "#DCE3E3" }}>{open.note}</p>
              </div>
              <button
                onClick={() => setOpen(null)}
                aria-label="Close"
                style={{
                  position: "absolute", top: -18, right: -18,
                  width: 36, height: 36, borderRadius: "50%",
                  background: paper, border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <X size={18} color={ink} />
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
    <div style={{ background: fog }} className="page-wrapper">
      <PageStyles />

      {/* HERO */}
      <section style={{ height: "72vh", position: "relative", background: ink }}>
        <picture style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <source media="(min-width: 768px)" srcSet="/images/crisis.png" />
          <img
            src="/images/crisis.jpg"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", opacity: 0.85 }}
          />
        </picture>
        <div
          style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(to top, ${ink} 0%, rgba(16,25,43,0.35) 55%, rgba(16,25,43,0.15) 100%)`,
          }}
        />

        <div style={{ position: "absolute", bottom: "4rem", left: "2rem", right: "2rem", maxWidth: 720 }}>
          <span className="dm-eyebrow" style={{ color: amber, fontSize: "0.85rem" }}>
            Field Report — Nepal
          </span>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
              fontWeight: 600,
              color: paper,
              marginTop: "0.6rem",
              lineHeight: 1.1,
            }}
          >
            Disaster Management &amp; Psychology
          </h1>
          <p style={{ marginTop: "0.85rem", color: "#C7D2D2", fontFamily: FONT_BODY, fontSize: "1.05rem", lineHeight: 1.6 }}>
            Understanding trauma, resilience, and human behavior during crisis — and the fieldwork
            we do because of it.
          </p>
        </div>
      </section>

      {/* Torn-seam divider: the fault line between crisis and calm */}
      <div className="dm-seam" style={{ background: ink }}>
        <svg viewBox="0 0 1200 46" preserveAspectRatio="none">
          <path
            d="M0,10 L60,10 L90,32 L130,4 L170,26 L210,10 L1200,10 L1200,46 L0,46 Z"
            fill={fog}
          />
        </svg>
      </div>

      {/* EMOTIONAL ARC */}
      <section style={{ padding: "4rem 1.5rem", background: fog }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <span className="dm-eyebrow" style={{ color: teal, fontSize: "0.85rem" }}>
            What We Prepare For
          </span>
          <h2
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              fontWeight: 600,
              color: ink,
              margin: "0.4rem 0 2rem",
            }}
          >
            The Psychological Journey Through Disaster
          </h2>

          <EmotionalArc phases={phases} />
        </div>
      </section>

      {/* CORE AREAS */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "1rem 1.5rem 3.5rem" }}>
        <span className="dm-eyebrow" style={{ color: teal, fontSize: "0.85rem" }}>
          Our Focus Areas
        </span>
        <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.7rem", fontWeight: 600, color: ink, margin: "0.4rem 0 1.5rem" }}>
          Where We Show Up
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "1rem" }}>
          {areas.map((a, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              style={{
                background: paper,
                padding: "1.4rem",
                borderRadius: "4px",
                border: `1px solid ${border}`,
                borderTop: `3px solid ${teal}`,
              }}
            >
              <a.icon size={26} color={teal} />
              <h3 style={{ marginTop: "0.7rem", fontFamily: FONT_DISPLAY, fontWeight: 600, color: charcoal, fontSize: "1.05rem" }}>
                {a.title}
              </h3>
              <p style={{ color: ash, fontSize: "0.9rem", fontFamily: FONT_BODY, marginTop: "0.35rem", lineHeight: 1.6 }}>
                {a.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FIELD DISPATCHES — photo gallery */}
      <FieldDispatches />

      {/* DETERMINATION / CTA */}
      <section style={{ padding: "4rem 1.5rem", background: ink }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: `linear-gradient(135deg, ${teal} 0%, #1F6E68 100%)`,
            padding: "2.5rem 2rem",
            borderRadius: "4px",
            color: paper,
          }}
        >
          <span className="dm-eyebrow" style={{ color: amber, fontSize: "0.8rem" }}>
            Our Determination
          </span>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.6rem", fontWeight: 600, marginTop: "0.5rem" }}>
            We rebuild minds, not just homes.
          </h2>
          <p style={{ marginTop: "0.75rem", lineHeight: 1.8, fontFamily: FONT_BODY, color: "#E4EFEE" }}>
            We are committed to bringing psychological care into disaster zones — from immediate
            trauma response to long-term mental health recovery.
          </p>

          <button
            onClick={() => navigate("/contact")}
            style={{
              marginTop: "1.25rem",
              background: paper,
              color: ink,
              padding: "0.75rem 1.6rem",
              borderRadius: "3px",
              border: "none",
              cursor: "pointer",
              fontFamily: FONT_LABEL,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
              fontSize: "0.9rem",
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
  { title: "Heroic Phase", desc: "High energy and rescue behavior among survivors.", value: 80, color: "#E8A33D" },
  { title: "Honeymoon Phase", desc: "Community bonding and shared hope.", value: 65, color: "#22c55e" },
  { title: "Disillusionment Phase", desc: "Stress, frustration, and emotional fatigue begin.", value: 15, color: "#eab308" },
  { title: "Reconstruction Phase", desc: "Long-term recovery and rebuilding of life.", value: 55, color: "#2F8F87" },
];