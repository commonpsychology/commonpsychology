import { useState, useEffect } from "react";
import BrainModel3D from "../components/BrainModal3D";

const COLORS = {
  blue50: "#E6F1FB", blue100: "#B5D4F4", blue200: "#85B7EB",
  blue400: "#378ADD", blue600: "#185FA5", blue800: "#0C447C", blue900: "#042C53",
  teal50: "#E1F5EE", teal100: "#9FE1CB", teal400: "#1D9E75", teal600: "#0F6E56", teal800: "#085041",
  purple50: "#EEEDFE", purple100: "#CECBF6", purple400: "#7F77DD", purple600: "#534AB7", purple800: "#3C3489",
  coral50: "#FAECE7", coral100: "#F5C4B3", coral400: "#D85A30", coral600: "#993C1D",
  amber50: "#FAEEDA", amber100: "#FAC775", amber400: "#EF9F27", amber600: "#854F0B",
  pink50: "#FBEAF0", pink100: "#F4C0D1", pink400: "#D4537E", pink600: "#993556",
};

// ── Design system ────────────────────────────────────────────────────────
const FONT_DISPLAY = "'Quicksand', 'Baloo 2', system-ui, sans-serif";
const FONT_BODY = "'Nunito', system-ui, sans-serif";

const GLASS = {
  background: "rgba(255,255,255,0.62)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  border: "1px solid rgba(255,255,255,0.85)",
  boxShadow: "0 8px 32px rgba(23,74,130,0.09), inset 0 1px 0 rgba(255,255,255,0.6)",
};

const GLASS_SOFT = {
  background: "rgba(255,255,255,0.45)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.7)",
};

const PAGE_BG = `
  radial-gradient(ellipse 60% 45% at 12% 8%, rgba(133,183,235,0.35) 0%, transparent 60%),
  radial-gradient(ellipse 55% 50% at 92% 18%, rgba(159,225,203,0.28) 0%, transparent 58%),
  radial-gradient(ellipse 50% 45% at 85% 85%, rgba(206,203,246,0.28) 0%, transparent 60%),
  radial-gradient(ellipse 55% 50% at 8% 82%, rgba(245,196,179,0.2) 0%, transparent 58%),
  linear-gradient(170deg, #eaf5ff 0%, #f5faff 40%, #ffffff 75%, #f0f8ff 100%)
`;

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
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: COLORS.blue800, fontWeight: 600, fontFamily: FONT_BODY }}>{label}</span>
        <span style={{ fontSize: 13, color: color, fontWeight: 800, fontFamily: FONT_DISPLAY }}>{value}%</span>
      </div>
      <div style={{ background: "rgba(133,183,235,0.14)", borderRadius: 999, height: 12, overflow: "hidden", border: "1px solid rgba(133,183,235,0.25)" }}>
        <div style={{
          width: `${value}%`, height: "100%",
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: 999, transition: "width 0.7s cubic-bezier(.4,0,.2,1)",
          boxShadow: `0 0 10px ${color}55`,
        }} />
      </div>
    </div>
  );
}

function NTMolecule({ color }) {
  return (
    <svg width="48" height="48" viewBox="0 0 44 44">
      <circle cx="22" cy="22" r="21" fill={color} opacity="0.1" />
      <circle cx="22" cy="22" r="13" fill={color} opacity="0.22" />
      <circle cx="22" cy="22" r="6.5" fill={color} />
      <circle cx="8" cy="16" r="4" fill={color} opacity="0.55" />
      <circle cx="36" cy="16" r="4" fill={color} opacity="0.55" />
      <circle cx="8" cy="30" r="3" fill={color} opacity="0.35" />
      <circle cx="36" cy="30" r="3" fill={color} opacity="0.35" />
      <line x1="14" y1="19" x2="16" y2="21" stroke={color} strokeWidth="1.5" opacity="0.7" />
      <line x1="30" y1="19" x2="28" y2="21" stroke={color} strokeWidth="1.5" opacity="0.7" />
      <line x1="12" y1="28" x2="16" y2="24" stroke={color} strokeWidth="1" opacity="0.5" />
      <line x1="32" y1="28" x2="28" y2="24" stroke={color} strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

export default function NeuroscienceLab() {
  const [page, setPage] = useState("brain");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [expandedNT, setExpandedNT] = useState(null);
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
    { id: "brain", label: "Brain map", icon: "🧠" },
    { id: "neuro", label: "Neurotransmitters", icon: "✨" },
    { id: "anxiety", label: "Anxiety circuit", icon: "⚡" },
  ];

  return (
    <div style={{
      fontFamily: FONT_BODY,
      background: PAGE_BG,
      minHeight: "100vh",
      padding: "70px 0 48px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500;600;700&family=Nunito:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <div style={{
        position: "relative", overflow: "hidden",
        margin: "0 16px 24px",
        padding: "36px 28px 32px",
        borderRadius: 32,
        ...GLASS,
        boxShadow: "0 12px 44px rgba(23,74,130,0.12), inset 0 1px 0 rgba(255,255,255,0.7)",
      }}>
        <div style={{ position: "absolute", width: 220, height: 220, borderRadius: "50%", background: "rgba(55,138,221,0.16)", filter: "blur(50px)", top: -80, right: "2%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "rgba(29,158,117,0.14)", filter: "blur(40px)", bottom: -60, left: "4%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "rgba(127,119,221,0.14)", filter: "blur(36px)", top: "30%", left: "40%", pointerEvents: "none" }} />

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 14,
              background: "linear-gradient(135deg, rgba(55,138,221,0.18), rgba(29,158,117,0.14))",
              border: "1px solid rgba(133,183,235,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 14px rgba(23,74,130,0.1)",
            }}>
              <svg width="24" height="24" viewBox="0 0 28 28">
                <ellipse cx="14" cy="14" rx="12" ry="10" fill="none" stroke="#85B7EB" strokeWidth="1.5" />
                <path d="M 8 10 C 11 6, 17 6, 20 10" fill="none" stroke="#B5D4F4" strokeWidth="1.5" />
                <circle cx="10" cy="15" r="3" fill="#378ADD" opacity="0.85" />
                <circle cx="18" cy="12" r="2" fill="#1D9E75" opacity="0.85" />
                <circle cx="15" cy="18" r="2.5" fill="#D85A30" opacity="0.85" />
              </svg>
            </div>
            <span style={{ fontSize: 12, color: COLORS.blue600, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: FONT_DISPLAY, fontWeight: 700 }}>
              Neuroscience Lab
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(26px,4vw,34px)", fontWeight: 700, color: COLORS.blue900, margin: "0 0 8px", lineHeight: 1.15, fontFamily: FONT_DISPLAY, letterSpacing: "-0.01em" }}>
            Brain & Neuroscience Lab
          </h1>
          <p style={{ fontSize: 15, color: COLORS.blue600, margin: 0, fontFamily: FONT_BODY, fontWeight: 500 }}>
            Interactive maps · Neurotransmitters · Anxiety circuits
          </p>
        </div>
      </div>

      {/* Navigation — glass pill tabs */}
      <div style={{
        display: "flex", gap: 8, padding: "0 16px 20px",
        overflowX: "auto",
      }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            display: "flex", alignItems: "center", gap: 7,
            flexShrink: 0,
            padding: "11px 20px", borderRadius: 999,
            border: page === n.id ? `1.5px solid ${COLORS.blue400}` : "1.5px solid rgba(133,183,235,0.35)",
            background: page === n.id
              ? "linear-gradient(135deg, #378ADD, #185FA5)"
              : "rgba(255,255,255,0.5)",
            backdropFilter: "blur(10px)",
            color: page === n.id ? "#fff" : COLORS.blue800,
            fontSize: 13.5, fontWeight: page === n.id ? 700 : 600,
            cursor: "pointer", fontFamily: FONT_DISPLAY,
            boxShadow: page === n.id ? "0 6px 20px rgba(24,95,165,0.35)" : "none",
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: 14 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "0 16px", maxWidth: 720, margin: "0 auto" }}>

        {/* ── BRAIN MAP ── */}
        {page === "brain" && (
          <div>
            <div style={{
              display: "flex", justifyContent: "center", marginBottom: 20,
              padding: 20, borderRadius: 28, ...GLASS,
            }}>
              <BrainModel3D selectedRegion={selectedRegion} onSelect={setSelectedRegion} />
            </div>

            {/* Region grid — glass cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 18 }}>
              {Object.entries(REGIONS).map(([id, r]) => {
                const active = selectedRegion === id;
                return (
                  <button key={id} onClick={() => setSelectedRegion(active ? null : id)} style={{
                    background: active ? `linear-gradient(150deg, ${r.color}, ${r.color}dd)` : "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(14px)",
                    border: active ? `1.5px solid ${r.color}` : "1px solid rgba(133,183,235,0.28)",
                    borderRadius: 18, padding: "13px 10px", cursor: "pointer",
                    textAlign: "left", transition: "all 0.2s",
                    boxShadow: active ? `0 8px 22px ${r.color}44` : "0 3px 12px rgba(23,74,130,0.05)",
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: active ? "#fff" : COLORS.blue900, fontFamily: FONT_DISPLAY, marginBottom: 3 }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: 11, color: active ? "rgba(255,255,255,0.85)" : COLORS.blue600, fontFamily: FONT_BODY, fontWeight: 500, lineHeight: 1.35 }}>
                      {r.role}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Info panel */}
            {region && (
              <div style={{
                ...GLASS, borderRadius: 24, padding: 22, marginBottom: 14,
                borderLeft: `5px solid ${region.color}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 16,
                    background: `linear-gradient(150deg, ${region.light}, #fff)`,
                    border: `2px solid ${region.color}55`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 14px ${region.color}22`,
                  }}>
                    <div style={{ width: 15, height: 15, borderRadius: "50%", background: region.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.blue900, fontFamily: FONT_DISPLAY }}>{region.label}</div>
                    <div style={{ fontSize: 12.5, color: COLORS.blue600, fontFamily: FONT_BODY, fontWeight: 600 }}>{region.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: COLORS.blue800, lineHeight: 1.7, fontFamily: FONT_BODY, margin: "0 0 12px", fontWeight: 500 }}>{region.desc}</p>
                <div style={{ background: "rgba(225,245,238,0.65)", border: "1px solid rgba(159,225,203,0.5)", borderRadius: 14, padding: "12px 15px", display: "flex", gap: 9 }}>
                  <span style={{ fontSize: 15 }}>💡</span>
                  <span style={{ fontSize: 12.5, color: COLORS.teal600, fontFamily: FONT_BODY, fontStyle: "italic", fontWeight: 600, lineHeight: 1.5 }}>{region.fact}</span>
                </div>
                {region.connections.length > 0 && (
                  <div style={{ marginTop: 12, display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontSize: 11.5, color: COLORS.blue600, fontFamily: FONT_BODY, fontWeight: 700 }}>Connects to:</span>
                    {region.connections.map(c => (
                      <button key={c} onClick={() => setSelectedRegion(c)} style={{
                        fontSize: 12, padding: "5px 13px", borderRadius: 999,
                        background: "rgba(230,241,251,0.8)", border: `1px solid ${COLORS.blue200}`,
                        color: COLORS.blue800, cursor: "pointer", fontFamily: FONT_DISPLAY, fontWeight: 600,
                        transition: "all 0.15s",
                      }}>{REGIONS[c]?.label}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!region && (
              <div style={{
                textAlign: "center", padding: "22px 0", color: COLORS.blue400,
                fontSize: 13.5, fontFamily: FONT_BODY, fontWeight: 600,
                ...GLASS_SOFT, borderRadius: 18,
              }}>
                Select a region above to explore its function
              </div>
            )}
          </div>
        )}

        {/* ── NEUROTRANSMITTERS ── */}
        {page === "neuro" && (
          <div>
            <p style={{ fontSize: 13.5, color: COLORS.blue600, fontFamily: FONT_BODY, fontWeight: 600, marginBottom: 18 }}>
              The brain's chemical messengers — tap each to expand
            </p>
            {NEUROTRANSMITTERS.map(nt => {
              const open = expandedNT === nt.id;
              return (
                <div key={nt.id} style={{
                  ...GLASS,
                  borderRadius: 22, marginBottom: 12, overflow: "hidden",
                  borderColor: open ? `${nt.color}66` : "rgba(255,255,255,0.85)",
                  boxShadow: open ? `0 10px 30px ${nt.color}22` : GLASS.boxShadow,
                  transition: "all 0.2s",
                }}>
                  <div onClick={() => setExpandedNT(open ? null : nt.id)} style={{
                    display: "flex", alignItems: "center", gap: 15, padding: "16px 18px", cursor: "pointer",
                  }}>
                    <NTMolecule color={nt.color} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.blue900, fontFamily: FONT_DISPLAY }}>{nt.name}</div>
                      <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap" }}>
                        {nt.tags.map(t => (
                          <span key={t} style={{
                            fontSize: 10.5, padding: "3px 10px", borderRadius: 999,
                            background: nt.light, color: nt.color, fontFamily: FONT_DISPLAY, fontWeight: 700,
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 13,
                        background: `linear-gradient(150deg, ${nt.color}, ${nt.color}cc)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800, color: "#fff", fontFamily: FONT_DISPLAY,
                        boxShadow: `0 4px 12px ${nt.color}44`,
                      }}>{nt.abbr}</div>
                      <span style={{ fontSize: 17, color: nt.color, fontFamily: FONT_BODY, fontWeight: 800 }}>{open ? "−" : "+"}</span>
                    </div>
                  </div>

                  {open && (
                    <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${nt.border}66` }}>
                      <div style={{ paddingTop: 15 }}>
                        <p style={{ fontSize: 14, color: COLORS.blue800, lineHeight: 1.7, fontFamily: FONT_BODY, fontWeight: 500, marginBottom: 16 }}>{nt.desc}</p>

                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 12, color: COLORS.blue600, fontFamily: FONT_BODY, fontWeight: 600 }}>Typical relative level</span>
                            <span style={{ fontSize: 12, color: nt.color, fontFamily: FONT_DISPLAY, fontWeight: 700 }}>{nt.level}%</span>
                          </div>
                          <div style={{ background: "rgba(133,183,235,0.14)", borderRadius: 999, height: 12, overflow: "hidden" }}>
                            <div style={{ width: `${nt.level}%`, height: "100%", background: `linear-gradient(90deg, ${nt.light}, ${nt.color})`, borderRadius: 999, transition: "width 0.8s" }} />
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                          <div style={{ background: "rgba(250,236,231,0.7)", border: "1px solid rgba(245,196,179,0.5)", borderRadius: 14, padding: "12px 14px" }}>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.coral400, fontFamily: FONT_DISPLAY, marginBottom: 5 }}>Too low</div>
                            <div style={{ fontSize: 12.5, color: "#712B13", fontFamily: FONT_BODY, lineHeight: 1.55, fontWeight: 500 }}>{nt.low}</div>
                          </div>
                          <div style={{ background: "rgba(250,238,218,0.7)", border: "1px solid rgba(250,199,117,0.5)", borderRadius: 14, padding: "12px 14px" }}>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.amber600, fontFamily: FONT_DISPLAY, marginBottom: 5 }}>Too high</div>
                            <div style={{ fontSize: 12.5, color: COLORS.amber600, fontFamily: FONT_BODY, lineHeight: 1.55, fontWeight: 500 }}>{nt.high}</div>
                          </div>
                        </div>

                        <div style={{ background: "rgba(225,245,238,0.7)", border: "1px solid rgba(159,225,203,0.5)", borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 700, color: COLORS.teal600, fontFamily: FONT_DISPLAY, marginBottom: 8 }}>Natural boosters</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {nt.boosters.map(b => (
                              <span key={b} style={{ fontSize: 11.5, padding: "4px 12px", borderRadius: 999, background: "rgba(159,225,203,0.4)", color: COLORS.teal800, fontFamily: FONT_DISPLAY, fontWeight: 600 }}>{b}</span>
                            ))}
                          </div>
                        </div>

                        <div style={{ fontSize: 11.5, color: COLORS.blue600, fontFamily: FONT_BODY, fontStyle: "italic", fontWeight: 500 }}>
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
            <p style={{ fontSize: 13.5, color: COLORS.blue600, fontFamily: FONT_BODY, fontWeight: 600, marginBottom: 18 }}>
              How a threat signal travels through your brain — step by step
            </p>

            {/* Step selector */}
            <div style={{ display: "flex", gap: 7, marginBottom: 18, overflowX: "auto", paddingBottom: 4 }}>
              {ANXIETY_STEPS.map((s, i) => (
                <button key={i} onClick={() => setStep(i)} style={{
                  flexShrink: 0, padding: "9px 16px", borderRadius: 999,
                  border: anxietyStep === i ? `1.5px solid ${s.color}` : "1px solid rgba(133,183,235,0.3)",
                  background: anxietyStep === i ? `linear-gradient(135deg, ${s.color}, ${s.color}cc)` : "rgba(255,255,255,0.55)",
                  backdropFilter: "blur(10px)",
                  color: anxietyStep === i ? "#fff" : COLORS.blue800,
                  fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT_DISPLAY,
                  boxShadow: anxietyStep === i ? `0 6px 18px ${s.color}44` : "none",
                  transition: "all 0.2s",
                }}>
                  {i + 1}. {s.region}
                </button>
              ))}
            </div>

            {/* Active step detail */}
            {(() => {
              const s = ANXIETY_STEPS[anxietyStep];
              return (
                <div style={{
                  ...GLASS, borderRadius: 24, padding: 22, marginBottom: 18,
                  borderLeft: `5px solid ${s.color}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 15,
                      background: `linear-gradient(150deg, ${s.color}, ${s.color}cc)`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19,
                      boxShadow: `0 6px 16px ${s.color}44`,
                    }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.blue900, fontFamily: FONT_DISPLAY }}>Step {s.id}: {s.title}</div>
                      <div style={{ fontSize: 12.5, color: COLORS.blue600, fontFamily: FONT_BODY, fontWeight: 600 }}>{s.region}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: COLORS.blue800, lineHeight: 1.7, fontFamily: FONT_BODY, fontWeight: 500, margin: 0 }}>{s.desc}</p>

                  <div style={{ display: "flex", gap: 9, marginTop: 16 }}>
                    {anxietyStep > 0 && (
                      <button onClick={() => setStep(anxietyStep - 1)} style={{
                        padding: "9px 18px", borderRadius: 999, border: "1.5px solid rgba(133,183,235,0.4)",
                        background: "rgba(255,255,255,0.6)", color: COLORS.blue600, fontSize: 12.5,
                        fontWeight: 700, cursor: "pointer", fontFamily: FONT_DISPLAY,
                      }}>← Back</button>
                    )}
                    {anxietyStep < ANXIETY_STEPS.length - 1 && (
                      <button onClick={() => setStep(anxietyStep + 1)} style={{
                        padding: "9px 18px", borderRadius: 999, border: `1.5px solid ${s.color}`,
                        background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, color: "#fff",
                        fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT_DISPLAY,
                        boxShadow: `0 6px 16px ${s.color}44`,
                      }}>Next step →</button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Live brain state meters */}
            <div style={{ ...GLASS, borderRadius: 24, padding: 22, marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.blue900, fontFamily: FONT_DISPLAY, marginBottom: 16 }}>
                Live brain state
              </div>
              <MeterBar label="Amygdala activity" value={meters.amygdala} color={COLORS.coral400} />
              <MeterBar label="Cortisol level" value={meters.cortisol} color={COLORS.amber400} />
              <MeterBar label="Heart rate" value={meters.heart} color="#E24B4A" />
              <MeterBar label="Prefrontal control" value={meters.prefrontal} color={COLORS.blue400} />
              <MeterBar label="GABA (calm signal)" value={meters.gaba} color={COLORS.teal400} />
            </div>

            {/* Stressor simulator */}
            <div style={{ ...GLASS, borderRadius: 24, padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.blue900, fontFamily: FONT_DISPLAY, marginBottom: 8 }}>
                Stressor simulator
              </div>
              <p style={{ fontSize: 12.5, color: COLORS.blue600, fontFamily: FONT_BODY, fontWeight: 600, marginBottom: 14 }}>
                Trigger a stressor and watch how each brain region responds
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {Object.entries(STRESSORS).map(([key, s]) => (
                  <button key={key} onClick={() => triggerStressor(key)} style={{
                    padding: "9px 16px", borderRadius: 999,
                    border: activeStressor === key ? `1.5px solid ${COLORS.coral400}` : "1px solid rgba(133,183,235,0.3)",
                    background: activeStressor === key ? "rgba(250,236,231,0.85)" : "rgba(255,255,255,0.5)",
                    color: activeStressor === key ? COLORS.coral600 : COLORS.blue800,
                    fontSize: 12.5, fontWeight: 700,
                    cursor: "pointer", fontFamily: FONT_DISPLAY, transition: "all 0.15s",
                  }}>{s.label}</button>
                ))}
              </div>
              <button onClick={triggerCalm} style={{
                width: "100%", padding: "14px", borderRadius: 18,
                border: `1.5px solid ${COLORS.teal400}66`,
                background: "linear-gradient(135deg, rgba(159,225,203,0.5), rgba(225,245,238,0.7))",
                color: COLORS.teal600,
                fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: FONT_DISPLAY,
                transition: "all 0.2s",
                boxShadow: "0 4px 16px rgba(29,158,117,0.15)",
              }}>
                🌿 Activate calm — diaphragmatic breathing
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "36px 16px 0", color: COLORS.blue400, fontSize: 12.5, fontFamily: FONT_BODY, fontWeight: 600 }}>
        Brain & Neuroscience Lab · Interactive edition
      </div>
    </div>
  );
}