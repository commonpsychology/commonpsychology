import { useState } from "react";
import BrainModel3D from "../components/BrainModal3D";

const COLORS = {
  blue50: "#E6F1FB", blue100: "#B5D4F4", blue200: "#85B7EB",
  blue400: "#378ADD", blue600: "#185FA5", blue800: "#0C447C", blue900: "#042C53",
  teal50: "#E1F5EE", teal100: "#9FE1CB", teal400: "#1D9E75", teal600: "#0F6E56", teal800: "#085041",
  purple50: "#EEEDFE", purple100: "#CECBF6", purple400: "#7F77DD", purple600: "#534AB7", purple800: "#3C3489",
  coral50: "#FAECE7", coral100: "#F5C4B3", coral400: "#D85A30", coral600: "#993C1D",
  amber50: "#FAEEDA", amber100: "#FAC775", amber400: "#EF9F27", amber600: "#854F0B",
};

// ── Same glass recipe as ServicesPage ─────────────────────────────────────
const GLASS = {
  bg:        "linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)",
  bgHover:   "linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(200,232,250,0.68) 55%, rgba(255,255,255,0.78) 100%)",
  border:    "1px solid rgba(255,255,255,0.55)",
  borderHov: "1px solid rgba(120,190,230,0.65)",
};

const REGIONS = {
  prefrontal: {
    label: "Prefrontal cortex", color: COLORS.blue400, light: COLORS.blue50, text: COLORS.blue900,
    role: "Decision making & impulse control",
    desc: "The CEO of your brain. Handles planning, personality expression, and moderating social behaviour. The last region to fully mature — development completes around age 25.",
    fact: "The prefrontal cortex is disproportionately large in humans compared to other primates — it's the seat of what makes us distinctly human.",
    connections: ["amygdala", "hippocampus"],
  },
  amygdala: {
    label: "Amygdala", color: COLORS.coral400, light: COLORS.coral50, text: "#712B13",
    role: "Fear & emotional memory",
    desc: "Two almond-shaped nuclei deep in the temporal lobe. Fires within milliseconds of a perceived threat. In anxiety disorders, this alarm system becomes hypersensitive and hard to switch off.",
    fact: "The amygdala can hijack the entire brain before the conscious mind even registers a threat — the neural 'fast path' bypasses rational thought.",
    connections: ["prefrontal", "hippocampus", "hypothalamus"],
  },
  hippocampus: {
    label: "Hippocampus", color: COLORS.teal400, light: COLORS.teal50, text: COLORS.teal800,
    role: "Memory formation",
    desc: "Named after the Greek for seahorse due to its curved shape. Essential for converting short-term experiences into long-term memories. Shrinks under chronic stress — a key finding in depression research.",
    fact: "London taxi drivers show enlarged hippocampi from memorising the city's 25,000 streets — proof of adult neuroplasticity.",
    connections: ["amygdala", "prefrontal"],
  },
  hypothalamus: {
    label: "Hypothalamus", color: COLORS.amber400, light: COLORS.amber50, text: COLORS.amber600,
    role: "Stress hormones & homeostasis",
    desc: "The brain's master regulator. Controls body temperature, hunger, thirst, sleep, and triggers the HPA axis to flood the body with cortisol during stress. Size of a pea, but controls everything.",
    fact: "The hypothalamus links the nervous system to the endocrine system — it's the critical bridge between thought and bodily stress response.",
    connections: ["amygdala"],
  },
  broca: {
    label: "Broca's area", color: COLORS.purple400, light: COLORS.purple50, text: COLORS.purple800,
    role: "Speech production",
    desc: "Located in the left frontal lobe. Responsible for the production of fluent speech and language comprehension. Named after surgeon Paul Broca who identified it in 1861.",
    fact: "Damage to Broca's area produces expressive aphasia — the person knows what they want to say but cannot produce the words.",
    connections: ["prefrontal"],
  },
  cerebellum: {
    label: "Cerebellum", color: COLORS.blue200, light: COLORS.blue50, text: COLORS.blue900,
    role: "Balance, motor coordination",
    desc: "Contains more than half of all neurons in the entire brain — about 69 billion. Coordinates precise movement and posture. Also involved in emotional regulation and some cognitive functions.",
    fact: "The cerebellum is disproportionately large in musicians — mastery literally reshapes its structure through neuroplasticity.",
    connections: [],
  },
  brainstem: {
    label: "Brain stem", color: "#888780", light: "#F1EFE8", text: "#2C2C2A",
    role: "Breathing, heartbeat, sleep",
    desc: "The evolutionary oldest part of the brain. Controls all vital automatic functions — breathing, heart rate, blood pressure, and basic arousal. Damage is often immediately fatal.",
    fact: "The brain stem is nearly identical across all vertebrates — from fish to humans. These circuits are 500 million years old.",
    connections: [],
  },
};

const NEUROTRANSMITTERS = [
  {
    id: "dopamine", abbr: "DA", name: "Dopamine",
    color: COLORS.blue600, light: COLORS.blue50, border: COLORS.blue200,
    tags: ["Reward", "Motivation", "Movement"],
    level: 72,
    desc: "Your brain's reward prediction signal. Surges in anticipation of pleasure — food, connection, achievement. Drives motivation and learning through reinforcement. Controls motor pathways via the basal ganglia.",
    low: "Fatigue, depression, Parkinson's disease, low motivation",
    high: "Impulsivity, mania, psychosis risk, addiction vulnerability",
    boosters: ["Exercise", "Sunlight", "Creative work", "Music"],
    pathway: "Mesolimbic pathway → nucleus accumbens → reward circuit",
  },
  {
    id: "serotonin", abbr: "5HT", name: "Serotonin",
    color: COLORS.teal600, light: COLORS.teal50, border: COLORS.teal100,
    tags: ["Mood", "Sleep", "Appetite"],
    level: 58,
    desc: "Stabilises mood and creates a sense of belonging and wellbeing. About 90% lives in the gut, not the brain. Regulates sleep-wake cycles, appetite, and emotional resilience. SSRIs increase its availability.",
    low: "Depression, anxiety, insomnia, poor impulse control",
    high: "Serotonin syndrome (rare) — agitation, tremor, elevated temperature",
    boosters: ["Sunlight exposure", "Exercise", "Social connection", "Tryptophan-rich foods"],
    pathway: "Raphe nuclei → widespread cortical projection",
  },
  {
    id: "gaba", abbr: "GABA", name: "GABA",
    color: COLORS.purple600, light: COLORS.purple50, border: COLORS.purple100,
    tags: ["Calm", "Inhibition", "Anti-anxiety"],
    level: 44,
    desc: "The brain's chief inhibitory neurotransmitter. Slows neural firing, reduces excitability, and creates a sense of calm. Benzodiazepines work by enhancing GABA receptors. Low GABA is central to anxiety disorders.",
    low: "Anxiety disorders, panic attacks, insomnia, seizure risk",
    high: "Sedation, impaired coordination, cognitive dulling",
    boosters: ["Meditation", "Yoga", "L-theanine (tea)", "Magnesium"],
    pathway: "Widely distributed — acts as universal neural 'brake'",
  },
  {
    id: "norepinephrine", abbr: "NE", name: "Norepinephrine",
    color: COLORS.coral600, light: COLORS.coral50, border: COLORS.coral100,
    tags: ["Alertness", "Fight/flight", "Focus"],
    level: 65,
    desc: "Triggers fight-or-flight. Sharpens attention, elevates heart rate, dilates pupils, and mobilises stored energy. Also acts as a stress hormone (adrenaline's cousin). Chronically elevated in PTSD and panic disorder.",
    low: "Difficulty concentrating, low energy, depression, hypotension",
    high: "Hypervigilance, chronic anxiety, hypertension, PTSD",
    boosters: ["Cold exposure", "Exercise", "Protein intake", "Adequate sleep"],
    pathway: "Locus coeruleus → widespread cortical & limbic projection",
  },
  {
    id: "acetylcholine", abbr: "ACh", name: "Acetylcholine",
    color: COLORS.teal400, light: COLORS.teal50, border: COLORS.teal100,
    tags: ["Memory", "Attention", "Learning"],
    level: 55,
    desc: "The memory and learning neurotransmitter. Vital for attention, encoding new memories, and REM sleep. Alzheimer's disease is marked by dramatic depletion of acetylcholine in the cortex and hippocampus.",
    low: "Memory impairment, Alzheimer's, attention deficit, brain fog",
    high: "Overactivation of parasympathetic nervous system — rare",
    boosters: ["Choline-rich foods (eggs)", "Physical exercise", "Deep sleep", "Mental challenges"],
    pathway: "Basal forebrain → hippocampus & cortex",
  },
];

const ANXIETY_STEPS = [
  { id: 1, region: "Thalamus", color: COLORS.blue400, icon: "👁", title: "Sensory signal received",
    desc: "Eyes, ears, or skin detect a potential threat. The thalamus acts as a relay station — routing raw sensory data simultaneously along two paths: a fast subcortical route and a slower cortical route.",
    meters: { amygdala: 30, cortisol: 10, heart: 20, prefrontal: 80, gaba: 75 } },
  { id: 2, region: "Amygdala", color: COLORS.coral400, icon: "⚡", title: "Amygdala fires — fast path",
    desc: "Within 12 milliseconds, the amygdala processes threat before conscious thought. This 'low road' bypasses rational evaluation entirely — an evolutionary shortcut that saved ancestors from predators.",
    meters: { amygdala: 92, cortisol: 45, heart: 60, prefrontal: 40, gaba: 35 } },
  { id: 3, region: "Hypothalamus", color: COLORS.amber400, icon: "🔥", title: "HPA axis activated",
    desc: "The hypothalamus-pituitary-adrenal axis floods the body with cortisol and adrenaline. Heart rate surges, breathing quickens, muscles tense, digestion halts. The body is war-ready.",
    meters: { amygdala: 95, cortisol: 95, heart: 92, prefrontal: 25, gaba: 20 } },
  { id: 4, region: "Prefrontal cortex", color: COLORS.purple400, icon: "🧠", title: "Rational evaluation begins",
    desc: "Seconds later, the prefrontal cortex assesses context — 'Was that a snake or a stick?' In healthy brains, it modulates the amygdala. In anxiety disorders, this regulatory loop misfires or is overridden.",
    meters: { amygdala: 70, cortisol: 75, heart: 70, prefrontal: 75, gaba: 40 } },
  { id: 5, region: "GABA system", color: COLORS.teal400, icon: "✓", title: "Resolution — calm restored",
    desc: "If threat is resolved, GABA dampens the alarm. Parasympathetic activity restores calm. In chronic anxiety, the circuit gets stuck — amygdala hyperactivity persistently overrides the prefrontal brake.",
    meters: { amygdala: 15, cortisol: 20, heart: 25, prefrontal: 85, gaba: 88 } },
];

const STRESSORS = {
  social: { label: "Social judgment", meters: { amygdala: 72, cortisol: 60, heart: 55, prefrontal: 42, gaba: 38 } },
  physical: { label: "Physical threat", meters: { amygdala: 97, cortisol: 92, heart: 95, prefrontal: 18, gaba: 12 } },
  exam: { label: "Exam pressure", meters: { amygdala: 65, cortisol: 72, heart: 62, prefrontal: 68, gaba: 40 } },
  uncertainty: { label: "Uncertainty", meters: { amygdala: 80, cortisol: 78, heart: 72, prefrontal: 35, gaba: 28 } },
};

function MeterBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12.5, color: COLORS.blue800, fontWeight: 600, fontFamily: "system-ui" }}>{label}</span>
        <span style={{ fontSize: 12.5, color, fontWeight: 700, fontFamily: "system-ui" }}>{value}%</span>
      </div>
      <div style={{ background: "rgba(133,183,235,0.16)", borderRadius: 8, height: 11, overflow: "hidden", border: "1px solid rgba(133,183,235,0.25)" }}>
        <div style={{
          width: `${value}%`, height: "100%",
          background: `linear-gradient(90deg, ${color}aa, ${color})`,
          borderRadius: 8, transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>
    </div>
  );
}

function NTMolecule({ color }) {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="20" fill={color} opacity="0.15" />
      <circle cx="22" cy="22" r="12" fill={color} opacity="0.3" />
      <circle cx="22" cy="22" r="6" fill={color} />
      <circle cx="8" cy="16" r="4" fill={color} opacity="0.6" />
      <circle cx="36" cy="16" r="4" fill={color} opacity="0.6" />
      <circle cx="8" cy="30" r="3" fill={color} opacity="0.4" />
      <circle cx="36" cy="30" r="3" fill={color} opacity="0.4" />
      <line x1="14" y1="19" x2="16" y2="21" stroke={color} strokeWidth="1.5" />
      <line x1="30" y1="19" x2="28" y2="21" stroke={color} strokeWidth="1.5" />
      <line x1="12" y1="28" x2="16" y2="24" stroke={color} strokeWidth="1" opacity="0.6" />
      <line x1="32" y1="28" x2="28" y2="24" stroke={color} strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

export default function NeuroscienceLab() {
  const [page, setPage] = useState("brain");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [expandedNT, setExpandedNT] = useState(null);
  const [hoveredNT, setHoveredNT] = useState(null);
  const [anxietyStep, setAnxietyStep] = useState(0);
  const [activeStressor, setActiveStressor] = useState(null);
  const [meters, setMeters] = useState({ amygdala: 12, cortisol: 15, heart: 22, prefrontal: 82, gaba: 85 });

  const region = selectedRegion ? REGIONS[selectedRegion] : null;

  function triggerStressor(key) {
    setActiveStressor(key);
    setMeters(STRESSORS[key].meters);
  }
  function triggerCalm() {
    setActiveStressor(null);
    setMeters({ amygdala: 10, cortisol: 12, heart: 18, prefrontal: 88, gaba: 90 });
  }
  function setStep(idx) {
    setAnxietyStep(idx);
    setMeters(ANXIETY_STEPS[idx].meters);
  }

  const navItems = [
    { id: "brain", label: "Brain map" },
    { id: "neuro", label: "Neurotransmitters" },
    { id: "anxiety", label: "Anxiety circuit" },
  ];

  const cardStyle = (isHovered, extra = {}) => ({
    background: isHovered ? GLASS.bgHover : GLASS.bg,
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: isHovered ? GLASS.borderHov : GLASS.border,
    boxShadow: isHovered
      ? "0 20px 44px rgba(0,123,168,0.22), 0 6px 16px rgba(29,158,117,0.14), inset 0 1px 0 rgba(255,255,255,0.6)"
      : "0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.5)",
    transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, background 0.35s ease, border 0.35s ease",
    ...extra,
  });

  return (
    <div style={{
      fontFamily: "system-ui",
      background: `
        radial-gradient(ellipse 72% 58% at 10% 10%, rgba(55,138,221,0.14) 0%, transparent 62%),
        radial-gradient(ellipse 55% 62% at 90% 8%, rgba(29,158,117,0.10) 0%, transparent 58%),
        radial-gradient(ellipse 60% 55% at 85% 90%, rgba(127,119,221,0.10) 0%, transparent 60%),
        linear-gradient(165deg, #cdeaff 0%, #e6f4ff 35%, #ffffff 68%, #eaf6ff 100%)
      `,
      minHeight: "100vh", padding: "70px 0 48px",
    }}>
      {/* Header */}
      <div style={{
        position: "relative", overflow: "hidden",
        margin: "0 16px 22px",
        padding: "32px 26px 30px",
        borderRadius: 28,
        ...cardStyle(false),
      }}>
        <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(0,123,168,0.14)", filter: "blur(40px)", top: -70, right: "3%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", background: "rgba(29,158,117,0.12)", filter: "blur(32px)", bottom: -50, left: "5%", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <ellipse cx="14" cy="14" rx="12" ry="10" fill="none" stroke="#85B7EB" strokeWidth="1.5" />
              <path d="M 8 10 C 11 6, 17 6, 20 10" fill="none" stroke="#B5D4F4" strokeWidth="1.5" />
              <circle cx="10" cy="15" r="3" fill="#378ADD" opacity="0.8" />
              <circle cx="18" cy="12" r="2" fill="#1D9E75" opacity="0.8" />
              <circle cx="15" cy="18" r="2.5" fill="#D85A30" opacity="0.8" />
            </svg>
            <span style={{ fontSize: 11.5, color: COLORS.blue600, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "system-ui", fontWeight: 700 }}>
              Neuroscience Lab
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: COLORS.blue900, margin: "0 0 6px", lineHeight: 1.2 }}>
            Brain & Neuroscience Lab
          </h1>
          <p style={{ fontSize: 14, color: COLORS.blue600, margin: 0, fontFamily: "system-ui", fontWeight: 500 }}>
            Interactive maps · Neurotransmitters · Anxiety circuits
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 20px", overflowX: "auto" }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            flexShrink: 0,
            padding: "10px 20px", borderRadius: 999,
            border: page === n.id ? "1px solid rgba(120,190,230,0.7)" : GLASS.border,
            background: page === n.id
              ? "linear-gradient(135deg, #007ba8, #00bfff)"
              : "rgba(255,255,255,0.5)",
            backdropFilter: "blur(10px)",
            color: page === n.id ? "#fff" : COLORS.blue800,
            fontSize: 13, fontWeight: page === n.id ? 700 : 600,
            cursor: "pointer", fontFamily: "system-ui",
            boxShadow: page === n.id ? "0 6px 18px rgba(0,150,210,0.32)" : "0 1px 3px rgba(0,0,0,0.04)",
            transition: "all 0.2s",
          }}>{n.label}</button>
        ))}
      </div>

      <div style={{ padding: "0 16px", maxWidth: 720, margin: "0 auto" }}>

        {/* ── BRAIN MAP ── */}
        {page === "brain" && (
          <div>
            <div style={{
              display: "flex", justifyContent: "center", marginBottom: 20,
              padding: 18, borderRadius: 24, ...cardStyle(false),
            }}>
              <BrainModel3D selectedRegion={selectedRegion} onSelect={setSelectedRegion} />
            </div>

            {/* Region cards — glass grid with lift-on-hover */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
              {Object.entries(REGIONS).map(([id, r], i) => {
                const active = selectedRegion === id;
                const hov = hoveredRegion === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedRegion(active ? null : id)}
                    onMouseEnter={() => setHoveredRegion(id)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    style={{
                      ...cardStyle(hov || active, {
                        borderRadius: 18, padding: "13px 10px", cursor: "pointer",
                        textAlign: "left",
                        transform: hov ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
                        background: active
                          ? `linear-gradient(150deg, ${r.color}, ${r.color}dd)`
                          : hov ? GLASS.bgHover : GLASS.bg,
                        border: active ? `1px solid ${r.color}` : hov ? GLASS.borderHov : GLASS.border,
                        animation: "fadeSlideIn 0.5s ease both",
                        animationDelay: `${i * 0.05}s`,
                      }),
                    }}
                  >
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: active ? "#fff" : COLORS.blue900, fontFamily: "system-ui", marginBottom: 3 }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.85)" : COLORS.blue600, fontFamily: "system-ui", fontWeight: 500, lineHeight: 1.35 }}>
                      {r.role}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info panel */}
            {region && (
              <div style={{
                ...cardStyle(false, { borderRadius: 22, padding: 20, marginBottom: 14, borderLeft: `5px solid ${region.color}` }),
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 15,
                    background: `linear-gradient(150deg, ${region.light}, #fff)`,
                    border: `2px solid ${region.color}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 14px ${region.color}22`,
                  }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: region.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16.5, fontWeight: 800, color: COLORS.blue900, fontFamily: "system-ui" }}>{region.label}</div>
                    <div style={{ fontSize: 12, color: COLORS.blue600, fontFamily: "system-ui", fontWeight: 600 }}>{region.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13.5, color: COLORS.blue800, lineHeight: 1.68, fontFamily: "system-ui", margin: "0 0 12px" }}>{region.desc}</p>
                <div style={{
                  background: "rgba(225,245,238,0.65)", backdropFilter: "blur(6px)",
                  border: "1px solid rgba(159,225,203,0.5)", borderRadius: 14, padding: "11px 14px", display: "flex", gap: 8,
                }}>
                  <span style={{ fontSize: 14 }}>💡</span>
                  <span style={{ fontSize: 12, color: COLORS.teal600, fontFamily: "system-ui", fontStyle: "italic", fontWeight: 600 }}>{region.fact}</span>
                </div>
                {region.connections.length > 0 && (
                  <div style={{ marginTop: 11, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: COLORS.blue600, fontFamily: "system-ui", fontWeight: 700 }}>Connects to:</span>
                    {region.connections.map(c => (
                      <button key={c} onClick={() => setSelectedRegion(c)} style={{
                        fontSize: 11.5, padding: "4px 12px", borderRadius: 999,
                        background: "rgba(230,241,251,0.8)", border: `1px solid ${COLORS.blue200}`,
                        color: COLORS.blue800, cursor: "pointer", fontFamily: "system-ui", fontWeight: 600,
                      }}>{REGIONS[c]?.label}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!region && (
              <div style={{
                textAlign: "center", padding: "18px 0", color: COLORS.blue400,
                fontSize: 13, fontFamily: "system-ui", fontWeight: 600,
                ...cardStyle(false, { borderRadius: 18 }),
              }}>
                Select a region above to explore its function
              </div>
            )}
          </div>
        )}

        {/* ── NEUROTRANSMITTERS ── */}
        {page === "neuro" && (
          <div>
            <p style={{ fontSize: 13, color: COLORS.blue600, fontFamily: "system-ui", fontWeight: 600, marginBottom: 16 }}>
              The brain's chemical messengers — tap each to expand
            </p>
            {NEUROTRANSMITTERS.map((nt, i) => {
              const open = expandedNT === nt.id;
              const hov = hoveredNT === nt.id;
              return (
                <div
                  key={nt.id}
                  onMouseEnter={() => setHoveredNT(nt.id)}
                  onMouseLeave={() => setHoveredNT(null)}
                  style={{
                    ...cardStyle(open || hov, {
                      borderRadius: 20, marginBottom: 12, overflow: "hidden",
                      transform: hov && !open ? "translateY(-3px)" : "translateY(0)",
                      animation: "fadeSlideIn 0.5s ease both",
                      animationDelay: `${i * 0.05}s`,
                    }),
                  }}
                >
                  <div onClick={() => setExpandedNT(open ? null : nt.id)} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "15px 17px", cursor: "pointer",
                  }}>
                    <NTMolecule color={nt.color} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.blue900, fontFamily: "system-ui" }}>{nt.name}</div>
                      <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                        {nt.tags.map(t => (
                          <span key={t} style={{
                            fontSize: 10, padding: "2px 9px", borderRadius: 999,
                            background: nt.light, color: nt.color, fontFamily: "system-ui", fontWeight: 700,
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <div style={{
                        width: 37, height: 37, borderRadius: 13,
                        background: `linear-gradient(150deg, ${nt.color}, ${nt.color}cc)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: "system-ui",
                        boxShadow: `0 4px 12px ${nt.color}44`,
                      }}>{nt.abbr}</div>
                      <span style={{ fontSize: 17, color: nt.color, fontFamily: "system-ui", fontWeight: 700 }}>{open ? "−" : "+"}</span>
                    </div>
                  </div>

                  {open && (
                    <div style={{ padding: "0 17px 17px", borderTop: `1px solid ${nt.border}66` }}>
                      <div style={{ paddingTop: 14 }}>
                        <p style={{ fontSize: 13.5, color: COLORS.blue800, lineHeight: 1.68, fontFamily: "system-ui", marginBottom: 15 }}>{nt.desc}</p>

                        <div style={{ marginBottom: 15 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 11.5, color: COLORS.blue600, fontFamily: "system-ui", fontWeight: 600 }}>Typical relative level</span>
                            <span style={{ fontSize: 11.5, color: nt.color, fontFamily: "system-ui", fontWeight: 700 }}>{nt.level}%</span>
                          </div>
                          <div style={{ background: "rgba(133,183,235,0.16)", borderRadius: 8, height: 12, overflow: "hidden" }}>
                            <div style={{ width: `${nt.level}%`, height: "100%", background: `linear-gradient(90deg, ${nt.light}, ${nt.color})`, borderRadius: 8, transition: "width 0.8s" }} />
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 15 }}>
                          <div style={{ background: "rgba(250,236,231,0.7)", border: "1px solid rgba(245,196,179,0.5)", borderRadius: 14, padding: "11px 13px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.coral400, fontFamily: "system-ui", marginBottom: 4 }}>Too low</div>
                            <div style={{ fontSize: 12, color: "#712B13", fontFamily: "system-ui", lineHeight: 1.5, fontWeight: 500 }}>{nt.low}</div>
                          </div>
                          <div style={{ background: "rgba(250,238,218,0.7)", border: "1px solid rgba(250,199,117,0.5)", borderRadius: 14, padding: "11px 13px" }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.amber600, fontFamily: "system-ui", marginBottom: 4 }}>Too high</div>
                            <div style={{ fontSize: 12, color: COLORS.amber600, fontFamily: "system-ui", lineHeight: 1.5, fontWeight: 500 }}>{nt.high}</div>
                          </div>
                        </div>

                        <div style={{ background: "rgba(225,245,238,0.7)", border: "1px solid rgba(159,225,203,0.5)", borderRadius: 14, padding: "11px 13px", marginBottom: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.teal600, fontFamily: "system-ui", marginBottom: 7 }}>Natural boosters</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {nt.boosters.map(b => (
                              <span key={b} style={{ fontSize: 11, padding: "3px 11px", borderRadius: 999, background: "rgba(159,225,203,0.4)", color: COLORS.teal800, fontFamily: "system-ui", fontWeight: 600 }}>{b}</span>
                            ))}
                          </div>
                        </div>

                        <div style={{ fontSize: 11, color: COLORS.blue600, fontFamily: "system-ui", fontStyle: "italic", fontWeight: 500 }}>
                          Pathway: {nt.pathway}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── ANXIETY CIRCUIT ── */}
        {page === "anxiety" && (
          <div>
            <p style={{ fontSize: 13, color: COLORS.blue600, fontFamily: "system-ui", fontWeight: 600, marginBottom: 16 }}>
              How a threat signal travels through your brain — step by step
            </p>

            <div style={{ display: "flex", gap: 7, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
              {ANXIETY_STEPS.map((s, i) => (
                <button key={i} onClick={() => setStep(i)} style={{
                  flexShrink: 0, padding: "9px 15px", borderRadius: 999,
                  border: anxietyStep === i ? `1px solid ${s.color}` : GLASS.border,
                  background: anxietyStep === i ? `linear-gradient(135deg, ${s.color}, ${s.color}cc)` : "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(10px)",
                  color: anxietyStep === i ? "#fff" : COLORS.blue800,
                  fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                  boxShadow: anxietyStep === i ? `0 6px 18px ${s.color}44` : "0 1px 3px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                }}>
                  {i + 1}. {s.region}
                </button>
              ))}
            </div>

            {(() => {
              const s = ANXIETY_STEPS[anxietyStep];
              return (
                <div style={{
                  ...cardStyle(false, { borderRadius: 22, padding: 20, marginBottom: 18, borderLeft: `5px solid ${s.color}` }),
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 14,
                      background: `linear-gradient(150deg, ${s.color}, ${s.color}cc)`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                      boxShadow: `0 6px 16px ${s.color}44`,
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 15.5, fontWeight: 800, color: COLORS.blue900, fontFamily: "system-ui" }}>Step {s.id}: {s.title}</div>
                      <div style={{ fontSize: 12, color: COLORS.blue600, fontFamily: "system-ui", fontWeight: 600 }}>{s.region}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13.5, color: COLORS.blue800, lineHeight: 1.68, fontFamily: "system-ui", margin: 0 }}>{s.desc}</p>

                  <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
                    {anxietyStep > 0 && (
                      <button onClick={() => setStep(anxietyStep - 1)} style={{
                        padding: "8px 17px", borderRadius: 999, border: GLASS.border,
                        background: "rgba(255,255,255,0.6)", color: COLORS.blue600, fontSize: 12.5,
                        fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                      }}>← Back</button>
                    )}
                    {anxietyStep < ANXIETY_STEPS.length - 1 && (
                      <button onClick={() => setStep(anxietyStep + 1)} style={{
                        padding: "8px 17px", borderRadius: 999, border: `1px solid ${s.color}`,
                        background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, color: "#fff",
                        fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                        boxShadow: `0 6px 16px ${s.color}44`,
                      }}>Next step →</button>
                    )}
                  </div>
                </div>
              );
            })()}

            <div style={{ ...cardStyle(false, { borderRadius: 22, padding: 20, marginBottom: 18 }) }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: COLORS.blue900, fontFamily: "system-ui", marginBottom: 14 }}>
                Live brain state
              </div>
              <MeterBar label="Amygdala activity" value={meters.amygdala} color={COLORS.coral400} />
              <MeterBar label="Cortisol level" value={meters.cortisol} color={COLORS.amber400} />
              <MeterBar label="Heart rate" value={meters.heart} color="#E24B4A" />
              <MeterBar label="Prefrontal control" value={meters.prefrontal} color={COLORS.blue400} />
              <MeterBar label="GABA (calm signal)" value={meters.gaba} color={COLORS.teal400} />
            </div>

            <div style={{ ...cardStyle(false, { borderRadius: 22, padding: 20 }) }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: COLORS.blue900, fontFamily: "system-ui", marginBottom: 8 }}>
                Stressor simulator
              </div>
              <p style={{ fontSize: 12.5, color: COLORS.blue600, fontFamily: "system-ui", fontWeight: 600, marginBottom: 13 }}>
                Trigger a stressor and watch how each brain region responds
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 15 }}>
                {Object.entries(STRESSORS).map(([key, s]) => (
                  <button key={key} onClick={() => triggerStressor(key)} style={{
                    padding: "9px 16px", borderRadius: 999,
                    border: activeStressor === key ? `1px solid ${COLORS.coral400}` : GLASS.border,
                    background: activeStressor === key ? "rgba(250,236,231,0.85)" : "rgba(255,255,255,0.5)",
                    color: activeStressor === key ? COLORS.coral600 : COLORS.blue800,
                    fontSize: 12.5, fontWeight: 700,
                    cursor: "pointer", fontFamily: "system-ui", transition: "all 0.15s",
                  }}>{s.label}</button>
                ))}
              </div>
              <button onClick={triggerCalm} style={{
                width: "100%", padding: "14px", borderRadius: 16,
                border: `1px solid ${COLORS.teal400}66`,
                background: "linear-gradient(135deg, rgba(159,225,203,0.5), rgba(225,245,238,0.75))",
                backdropFilter: "blur(8px)",
                color: COLORS.teal600,
                fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "system-ui",
                boxShadow: "0 6px 20px rgba(29,158,117,0.18)",
                transition: "all 0.2s",
              }}>
                🌿 Activate calm — diaphragmatic breathing
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", padding: "36px 16px 0", color: COLORS.blue400, fontSize: 12, fontFamily: "system-ui", fontWeight: 600 }}>
        Brain & Neuroscience Lab · Interactive edition
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}