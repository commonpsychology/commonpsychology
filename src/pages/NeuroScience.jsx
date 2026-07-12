import { useState, useEffect, useRef } from "react";
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

function PulsingDot({ x, y, r, color, delay = 0 }) {
  return (
    <>
      <circle cx={x} cy={y} r={r + 6} fill={color} opacity="0.15">
        <animate attributeName="r" values={`${r + 2};${r + 10};${r + 2}`} dur="2.5s" repeatCount="indefinite" begin={`${delay}s`} />
        <animate attributeName="opacity" values="0.15;0;0.15" dur="2.5s" repeatCount="indefinite" begin={`${delay}s`} />
      </circle>
      <circle cx={x} cy={y} r={r} fill={color} />
    </>
  );
}

function BrainMap({ selectedRegion, onSelect }) {
  return (
    <svg viewBox="0 0 520 360" style={{ width: "100%", maxWidth: 520 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="brainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ddeeff" />
          <stop offset="100%" stopColor="#c5e0fa" />
        </linearGradient>
        <linearGradient id="innerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eaf4fd" />
          <stop offset="100%" stopColor="#d8ecf9" />
        </linearGradient>
      </defs>

      {/* Outer brain silhouette */}
      <path d="M 120 180 C 80 100, 100 40, 180 30 C 220 22, 280 18, 330 30 C 390 45, 430 90, 440 150 C 455 210, 440 270, 400 300 C 370 325, 330 335, 290 338 C 260 341, 240 335, 220 330 C 190 322, 160 310, 140 290 C 115 265, 110 220, 120 180 Z"
        fill="url(#brainGrad)" stroke="#85B7EB" strokeWidth="2" />

      {/* Brain fold lines */}
      <path d="M 160 100 C 190 80, 230 75, 260 90" fill="none" stroke="#85B7EB" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <path d="M 280 75 C 310 70, 345 80, 365 105" fill="none" stroke="#85B7EB" strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      <path d="M 150 160 C 170 140, 200 135, 230 145" fill="none" stroke="#85B7EB" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <path d="M 340 130 C 370 125, 400 140, 415 165" fill="none" stroke="#85B7EB" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <path d="M 165 230 C 195 215, 235 210, 265 220" fill="none" stroke="#85B7EB" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
      <path d="M 330 200 C 360 190, 400 200, 420 225" fill="none" stroke="#85B7EB" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>

      {/* Prefrontal cortex */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("prefrontal")}>
        <ellipse cx="175" cy="110" rx="58" ry="52"
          fill={selectedRegion === "prefrontal" ? COLORS.blue400 : COLORS.blue100}
          stroke={COLORS.blue600} strokeWidth={selectedRegion === "prefrontal" ? 2.5 : 1.5}
          opacity="0.85" />
        {selectedRegion === "prefrontal" && <ellipse cx="175" cy="110" rx="68" ry="62" fill="none" stroke={COLORS.blue400} strokeWidth="1.5" opacity="0.3">
          <animate attributeName="rx" values="65;75;65" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="59;69;59" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
        </ellipse>}
        <text x="175" y="105" textAnchor="middle" fontSize="11" fontWeight="600"
          fill={selectedRegion === "prefrontal" ? "#fff" : COLORS.blue900} fontFamily="system-ui">Prefrontal</text>
        <text x="175" y="120" textAnchor="middle" fontSize="10" fontWeight="400"
          fill={selectedRegion === "prefrontal" ? "#c8e4ff" : COLORS.blue600} fontFamily="system-ui">cortex</text>
      </g>

      {/* Broca's area */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("broca")}>
        <ellipse cx="170" cy="195" rx="40" ry="32"
          fill={selectedRegion === "broca" ? COLORS.purple400 : COLORS.purple100}
          stroke={COLORS.purple600} strokeWidth={selectedRegion === "broca" ? 2.5 : 1.5} opacity="0.85" />
        {selectedRegion === "broca" && <ellipse cx="170" cy="195" rx="50" ry="42" fill="none" stroke={COLORS.purple400} strokeWidth="1.5" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
        </ellipse>}
        <text x="170" y="191" textAnchor="middle" fontSize="10" fontWeight="600"
          fill={selectedRegion === "broca" ? "#fff" : COLORS.purple800} fontFamily="system-ui">Broca's</text>
        <text x="170" y="204" textAnchor="middle" fontSize="10"
          fill={selectedRegion === "broca" ? "#d8d0ff" : COLORS.purple600} fontFamily="system-ui">area</text>
      </g>

      {/* Amygdala */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("amygdala")}>
        <ellipse cx="238" cy="230" rx="34" ry="28"
          fill={selectedRegion === "amygdala" ? COLORS.coral400 : COLORS.coral100}
          stroke={COLORS.coral600} strokeWidth={selectedRegion === "amygdala" ? 2.5 : 1.5} opacity="0.88" />
        {selectedRegion === "amygdala" && <ellipse cx="238" cy="230" rx="44" ry="38" fill="none" stroke={COLORS.coral400} strokeWidth="1.5" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0;0.3" dur="1.8s" repeatCount="indefinite"/>
        </ellipse>}
        <text x="238" y="226" textAnchor="middle" fontSize="10" fontWeight="600"
          fill={selectedRegion === "amygdala" ? "#fff" : "#712B13"} fontFamily="system-ui">Amygdala</text>
        <text x="238" y="239" textAnchor="middle" fontSize="9"
          fill={selectedRegion === "amygdala" ? "#ffd0c0" : COLORS.coral600} fontFamily="system-ui">⚡ alarm</text>
      </g>

      {/* Hippocampus */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("hippocampus")}>
        <path d="M 280 258 C 265 245, 260 225, 270 210 C 280 195, 305 192, 320 205 C 340 220, 338 248, 322 262 C 308 274, 292 270, 280 258 Z"
          fill={selectedRegion === "hippocampus" ? COLORS.teal400 : COLORS.teal100}
          stroke={COLORS.teal600} strokeWidth={selectedRegion === "hippocampus" ? 2.5 : 1.5} opacity="0.88" />
        {selectedRegion === "hippocampus" && <path d="M 280 258 C 265 245, 260 225, 270 210 C 280 195, 305 192, 320 205 C 340 220, 338 248, 322 262 C 308 274, 292 270, 280 258 Z"
          fill="none" stroke={COLORS.teal400} strokeWidth="3" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
        </path>}
        <text x="296" y="228" textAnchor="middle" fontSize="9.5" fontWeight="600"
          fill={selectedRegion === "hippocampus" ? "#fff" : COLORS.teal800} fontFamily="system-ui">Hippo-</text>
        <text x="296" y="241" textAnchor="middle" fontSize="9.5" fontWeight="600"
          fill={selectedRegion === "hippocampus" ? "#fff" : COLORS.teal800} fontFamily="system-ui">campus</text>
      </g>

      {/* Hypothalamus */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("hypothalamus")}>
        <ellipse cx="255" cy="178" rx="28" ry="22"
          fill={selectedRegion === "hypothalamus" ? COLORS.amber400 : COLORS.amber100}
          stroke={COLORS.amber600} strokeWidth={selectedRegion === "hypothalamus" ? 2.5 : 1.5} opacity="0.88" />
        {selectedRegion === "hypothalamus" && <ellipse cx="255" cy="178" rx="38" ry="32" fill="none" stroke={COLORS.amber400} strokeWidth="1.5" opacity="0.3">
          <animate attributeName="opacity" values="0.3;0;0.3" dur="2.2s" repeatCount="indefinite"/>
        </ellipse>}
        <text x="255" y="174" textAnchor="middle" fontSize="9" fontWeight="600"
          fill={selectedRegion === "hypothalamus" ? "#fff" : COLORS.amber600} fontFamily="system-ui">Hypo-</text>
        <text x="255" y="186" textAnchor="middle" fontSize="9"
          fill={selectedRegion === "hypothalamus" ? "#ffe8b0" : COLORS.amber600} fontFamily="system-ui">thalamus</text>
      </g>

      {/* Cerebellum */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("cerebellum")}>
        <ellipse cx="390" cy="280" rx="55" ry="42"
          fill={selectedRegion === "cerebellum" ? COLORS.blue200 : COLORS.blue50}
          stroke={COLORS.blue400} strokeWidth={selectedRegion === "cerebellum" ? 2.5 : 1.5} opacity="0.88" />
        {/* fold lines in cerebellum */}
        <path d="M 348 275 C 365 268, 380 265, 395 268" fill="none" stroke="#85B7EB" strokeWidth="1" opacity="0.6"/>
        <path d="M 350 285 C 368 278, 385 276, 400 279" fill="none" stroke="#85B7EB" strokeWidth="1" opacity="0.6"/>
        <path d="M 355 295 C 373 289, 390 287, 405 290" fill="none" stroke="#85B7EB" strokeWidth="1" opacity="0.6"/>
        <text x="390" y="276" textAnchor="middle" fontSize="11" fontWeight="600"
          fill={selectedRegion === "cerebellum" ? COLORS.blue900 : COLORS.blue900} fontFamily="system-ui">Cerebellum</text>
        <text x="390" y="290" textAnchor="middle" fontSize="9"
          fill={COLORS.blue600} fontFamily="system-ui">balance · motor</text>
      </g>

      {/* Brain stem */}
      <g style={{ cursor: "pointer" }} onClick={() => onSelect("brainstem")}>
        <rect x="215" y="295" width="60" height="42" rx="10"
          fill={selectedRegion === "brainstem" ? "#888780" : "#D3D1C7"}
          stroke="#5F5E5A" strokeWidth={selectedRegion === "brainstem" ? 2.5 : 1.5} opacity="0.88" />
        <text x="245" y="312" textAnchor="middle" fontSize="10" fontWeight="600"
          fill={selectedRegion === "brainstem" ? "#fff" : "#2C2C2A"} fontFamily="system-ui">Brain</text>
        <text x="245" y="326" textAnchor="middle" fontSize="10"
          fill={selectedRegion === "brainstem" ? "#ddd" : "#5F5E5A"} fontFamily="system-ui">stem</text>
      </g>

      {/* Connection lines when selected */}
      {selectedRegion && REGIONS[selectedRegion]?.connections.map(c => {
        const pts = {
          prefrontal: [175, 110], amygdala: [238, 230],
          hippocampus: [296, 232], hypothalamus: [255, 178], broca: [170, 195],
        };
        const from = pts[selectedRegion];
        const to = pts[c];
        if (!from || !to) return null;
        return (
          <line key={c} x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]}
            stroke={REGIONS[selectedRegion].color} strokeWidth="1.5" strokeDasharray="5,4" opacity="0.7">
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.5s" repeatCount="indefinite"/>
          </line>
        );
      })}

      {/* Tap hint */}
      {!selectedRegion && (
        <text x="260" y="22" textAnchor="middle" fontSize="11" fill={COLORS.blue600} fontFamily="system-ui" fontStyle="italic">
          Tap any region to explore
        </text>
      )}
    </svg>
  );
}

function MeterBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: COLORS.blue800, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: color, fontWeight: 600 }}>{value}%</span>
      </div>
      <div style={{ background: COLORS.blue50, borderRadius: 6, height: 10, overflow: "hidden", border: `1px solid ${COLORS.blue100}` }}>
        <div style={{
          width: `${value}%`, height: "100%", background: color,
          borderRadius: 6, transition: "width 0.7s cubic-bezier(.4,0,.2,1)"
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
      <line x1="12" y1="28" x2="16" y2="24" stroke={color} strokeWidth="1" opacity="0.6"/>
      <line x1="32" y1="28" x2="28" y2="24" stroke={color} strokeWidth="1" opacity="0.6"/>
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
  const [animTick, setAnimTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setAnimTick(n => n + 1), 2000);
    return () => clearInterval(t);
  }, []);

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

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      // sky blue → white gradient
      background: "linear-gradient(160deg, #cdeaff 0%, #e6f4ff 35%, #ffffff 68%, #eaf6ff 100%)",
      minHeight: "100vh", padding: "70px 0 48px",
    }}>
      {/* Header */}
      <div style={{
  position: "relative", overflow: "hidden",
  padding: "32px 24px 28px",
  borderRadius: "0 0 40% 40% / 0 0 20px 20px",
  background: `
    radial-gradient(ellipse 72% 58% at 10% 28%, rgba(55,138,221,0.16) 0%, transparent 62%),
    radial-gradient(ellipse 55% 62% at 88% 10%, rgba(24,95,165,0.12) 0%, transparent 58%),
    linear-gradient(158deg, #cdeaff 0%, #eaf5ff 45%, #ffffff 100%)
  `,
}}>
  <div style={{ position:"absolute", width:180, height:180, borderRadius:"50%", background:"rgba(12,68,124,0.06)", filter:"blur(32px)", top:-40, right:"3%", pointerEvents:"none" }} />
  <div style={{ position:"absolute", width:130, height:130, borderRadius:"50%", background:"rgba(24,95,165,0.05)", filter:"blur(26px)", bottom:-20, left:"5%", pointerEvents:"none" }} />
        {/* decorative circles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 60 + i * 40, height: 60 + i * 40,
            borderRadius: "50%",
            border: "1px solid rgba(133,183,235,0.15)",
            top: -20 + i * 8, right: -20 + i * 6,
            pointerEvents: "none",
          }} />
        ))}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <svg width="28" height="28" viewBox="0 0 28 28">
              <ellipse cx="14" cy="14" rx="12" ry="10" fill="none" stroke="#85B7EB" strokeWidth="1.5"/>
              <path d="M 8 10 C 11 6, 17 6, 20 10" fill="none" stroke="#B5D4F4" strokeWidth="1.5"/>
              <circle cx="10" cy="15" r="3" fill="#378ADD" opacity="0.8"/>
              <circle cx="18" cy="12" r="2" fill="#1D9E75" opacity="0.8"/>
              <circle cx="15" cy="18" r="2.5" fill="#D85A30" opacity="0.8"/>
            </svg>
            <span style={{ fontSize: 11, color: "#185FA5", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "system-ui" }}>
              Neuroscience Lab
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#042C53", margin: "0 0 6px", lineHeight: 1.2 }}>
            Brain & Neuroscience Lab
          </h1>
          <p style={{ fontSize: 14, color: "#185FA5", margin: 0, fontFamily: "system-ui", fontWeight: 400 }}>
            Interactive maps · Neurotransmitters · Anxiety circuits
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        display: "flex", gap: 8, padding: "16px 20px 0",
        borderBottom: `1px solid ${COLORS.blue100}`,
      }}>
        {navItems.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{
            padding: "9px 18px", borderRadius: "20px 20px 0 0",
            border: `1.5px solid ${page === n.id ? COLORS.blue600 : COLORS.blue200}`,
            borderBottom: page === n.id ? `2px solid ${COLORS.blue50}` : `1.5px solid ${COLORS.blue200}`,
            background: page === n.id ? "#fff" : "transparent",
            color: page === n.id ? COLORS.blue900 : COLORS.blue600,
            fontSize: 13, fontWeight: page === n.id ? 600 : 400,
            cursor: "pointer", fontFamily: "system-ui",
            marginBottom: page === n.id ? -1 : 0,
            transition: "all 0.15s",
          }}>{n.label}</button>
        ))}
      </div>

      <div style={{ padding: "20px 16px 0" }}>

        {/* ── BRAIN MAP ── */}
        {page === "brain" && (
            
          <div>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
<BrainModel3D selectedRegion={selectedRegion} onSelect={setSelectedRegion} />
            </div>

            {/* Region grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
              {Object.entries(REGIONS).map(([id, r]) => (
                <button key={id} onClick={() => setSelectedRegion(selectedRegion === id ? null : id)} style={{
                  background: selectedRegion === id ? r.color : "#fff",
                  border: `1.5px solid ${selectedRegion === id ? r.color : COLORS.blue100}`,
                  borderRadius: 12, padding: "10px 8px", cursor: "pointer",
                  textAlign: "left", transition: "all 0.18s",
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: selectedRegion === id ? "#fff" : COLORS.blue900, fontFamily: "system-ui", marginBottom: 2 }}>
                    {r.label}
                  </div>
                  <div style={{ fontSize: 11, color: selectedRegion === id ? "rgba(255,255,255,0.75)" : COLORS.blue600, fontFamily: "system-ui" }}>
                    {r.role}
                  </div>
                </button>
              ))}
            </div>

            {/* Info panel */}
            {region && (
              <div style={{
                background: "#fff", border: `1.5px solid ${region.color}`,
                borderRadius: 16, padding: 18, marginBottom: 12,
                borderLeft: `5px solid ${region.color}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: region.light, border: `2px solid ${region.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 14, height: 14, borderRadius: "50%", background: region.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.blue900, fontFamily: "system-ui" }}>{region.label}</div>
                    <div style={{ fontSize: 12, color: COLORS.blue600, fontFamily: "system-ui" }}>{region.role}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: COLORS.blue800, lineHeight: 1.65, fontFamily: "system-ui", margin: "0 0 10px" }}>{region.desc}</p>
                <div style={{ background: COLORS.teal50, borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>💡</span>
                  <span style={{ fontSize: 12, color: COLORS.teal600, fontFamily: "system-ui", fontStyle: "italic" }}>{region.fact}</span>
                </div>
                {region.connections.length > 0 && (
                  <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, color: COLORS.blue600, fontFamily: "system-ui" }}>Connects to:</span>
                    {region.connections.map(c => (
                      <button key={c} onClick={() => setSelectedRegion(c)} style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 12,
                        background: COLORS.blue50, border: `1px solid ${COLORS.blue200}`,
                        color: COLORS.blue800, cursor: "pointer", fontFamily: "system-ui",
                      }}>{REGIONS[c]?.label}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!region && (
              <div style={{ textAlign: "center", padding: "16px 0", color: COLORS.blue400, fontSize: 13, fontFamily: "system-ui" }}>
                Select a region above to explore its function
              </div>
            )}
          </div>
        )}

        {/* ── NEUROTRANSMITTERS ── */}
        {page === "neuro" && (
          <div>
            <p style={{ fontSize: 13, color: COLORS.blue600, fontFamily: "system-ui", marginBottom: 16 }}>
              The brain's chemical messengers — tap each to expand
            </p>
            {NEUROTRANSMITTERS.map(nt => {
              const open = expandedNT === nt.id;
              return (
                <div key={nt.id} style={{
                  background: "#fff", border: `1.5px solid ${open ? nt.color : nt.border}`,
                  borderRadius: 16, marginBottom: 10, overflow: "hidden",
                  transition: "border-color 0.2s",
                }}>
                  <div onClick={() => setExpandedNT(open ? null : nt.id)} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", cursor: "pointer",
                  }}>
                    <NTMolecule color={nt.color} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.blue900, fontFamily: "system-ui" }}>{nt.name}</div>
                      <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                        {nt.tags.map(t => (
                          <span key={t} style={{
                            fontSize: 10, padding: "2px 8px", borderRadius: 10,
                            background: nt.light, color: nt.color, fontFamily: "system-ui", fontWeight: 600,
                          }}>{t}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: nt.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: "system-ui" }}>{nt.abbr}</div>
                      <span style={{ fontSize: 18, color: nt.color, fontFamily: "system-ui" }}>{open ? "−" : "+"}</span>
                    </div>
                  </div>

                  {open && (
                    <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${nt.border}` }}>
                      <div style={{ paddingTop: 14 }}>
                        <p style={{ fontSize: 13, color: COLORS.blue800, lineHeight: 1.65, fontFamily: "system-ui", marginBottom: 14 }}>{nt.desc}</p>

                        {/* Level bar */}
                        <div style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: COLORS.blue600, fontFamily: "system-ui" }}>Typical relative level</span>
                            <span style={{ fontSize: 11, color: nt.color, fontFamily: "system-ui", fontWeight: 600 }}>{nt.level}%</span>
                          </div>
                          <div style={{ background: COLORS.blue50, borderRadius: 8, height: 12, overflow: "hidden" }}>
                            <div style={{ width: `${nt.level}%`, height: "100%", background: `linear-gradient(90deg, ${nt.light}, ${nt.color})`, borderRadius: 8, transition: "width 0.8s" }} />
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                          <div style={{ background: COLORS.coral50, borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.coral400, fontFamily: "system-ui", marginBottom: 4 }}>Too low</div>
                            <div style={{ fontSize: 12, color: "#712B13", fontFamily: "system-ui", lineHeight: 1.5 }}>{nt.low}</div>
                          </div>
                          <div style={{ background: COLORS.amber50, borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.amber600, fontFamily: "system-ui", marginBottom: 4 }}>Too high</div>
                            <div style={{ fontSize: 12, color: COLORS.amber600, fontFamily: "system-ui", lineHeight: 1.5 }}>{nt.high}</div>
                          </div>
                        </div>

                        <div style={{ background: COLORS.teal50, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.teal600, fontFamily: "system-ui", marginBottom: 6 }}>Natural boosters</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {nt.boosters.map(b => (
                              <span key={b} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: COLORS.teal100, color: COLORS.teal800, fontFamily: "system-ui" }}>{b}</span>
                            ))}
                          </div>
                        </div>

                        <div style={{ fontSize: 11, color: COLORS.blue600, fontFamily: "system-ui", fontStyle: "italic" }}>
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
            <p style={{ fontSize: 13, color: COLORS.blue600, fontFamily: "system-ui", marginBottom: 16 }}>
              How a threat signal travels through your brain — step by step
            </p>

            {/* Step selector */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {ANXIETY_STEPS.map((s, i) => (
                <button key={i} onClick={() => setStep(i)} style={{
                  flexShrink: 0, padding: "8px 14px", borderRadius: 20,
                  border: `1.5px solid ${anxietyStep === i ? s.color : COLORS.blue200}`,
                  background: anxietyStep === i ? s.color : "#fff",
                  color: anxietyStep === i ? "#fff" : COLORS.blue800,
                  fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui",
                  transition: "all 0.18s",
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
                  background: "#fff", border: `1.5px solid ${s.color}`,
                  borderRadius: 16, padding: 18, marginBottom: 16,
                  borderLeft: `5px solid ${s.color}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.blue900, fontFamily: "system-ui" }}>Step {s.id}: {s.title}</div>
                      <div style={{ fontSize: 12, color: COLORS.blue600, fontFamily: "system-ui" }}>{s.region}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: COLORS.blue800, lineHeight: 1.65, fontFamily: "system-ui", margin: 0 }}>{s.desc}</p>

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {anxietyStep > 0 && (
                      <button onClick={() => setStep(anxietyStep - 1)} style={{
                        padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${COLORS.blue200}`,
                        background: "transparent", color: COLORS.blue600, fontSize: 12, cursor: "pointer", fontFamily: "system-ui",
                      }}>← Back</button>
                    )}
                    {anxietyStep < ANXIETY_STEPS.length - 1 && (
                      <button onClick={() => setStep(anxietyStep + 1)} style={{
                        padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${s.color}`,
                        background: s.color, color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: "system-ui",
                      }}>Next step →</button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Live brain state meters */}
            <div style={{ background: "#fff", border: `1.5px solid ${COLORS.blue100}`, borderRadius: 16, padding: 18, marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.blue900, fontFamily: "system-ui", marginBottom: 12 }}>
                Live brain state
              </div>
              <MeterBar label="Amygdala activity" value={meters.amygdala} color={COLORS.coral400} />
              <MeterBar label="Cortisol level" value={meters.cortisol} color={COLORS.amber400} />
              <MeterBar label="Heart rate" value={meters.heart} color="#E24B4A" />
              <MeterBar label="Prefrontal control" value={meters.prefrontal} color={COLORS.blue400} />
              <MeterBar label="GABA (calm signal)" value={meters.gaba} color={COLORS.teal400} />
            </div>

            {/* Stressor simulator */}
            <div style={{ background: "#fff", border: `1.5px solid ${COLORS.blue100}`, borderRadius: 16, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.blue900, fontFamily: "system-ui", marginBottom: 8 }}>
                Stressor simulator
              </div>
              <p style={{ fontSize: 12, color: COLORS.blue600, fontFamily: "system-ui", marginBottom: 12 }}>
                Trigger a stressor and watch how each brain region responds
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14 }}>
                {Object.entries(STRESSORS).map(([key, s]) => (
                  <button key={key} onClick={() => triggerStressor(key)} style={{
                    padding: "8px 14px", borderRadius: 20,
                    border: `1.5px solid ${activeStressor === key ? COLORS.coral400 : COLORS.blue200}`,
                    background: activeStressor === key ? COLORS.coral50 : "transparent",
                    color: activeStressor === key ? COLORS.coral600 : COLORS.blue700,
                    fontSize: 12, fontWeight: activeStressor === key ? 600 : 400,
                    cursor: "pointer", fontFamily: "system-ui", transition: "all 0.15s",
                  }}>{s.label}</button>
                ))}
              </div>
              <button onClick={triggerCalm} style={{
                width: "100%", padding: "12px", borderRadius: 12,
                border: `1.5px solid ${COLORS.teal400}`,
                background: COLORS.teal50, color: COLORS.teal600,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "system-ui",
                transition: "all 0.2s",
              }}>
                🌿 Activate calm — diaphragmatic breathing
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "32px 16px 0", color: COLORS.blue400, fontSize: 12, fontFamily: "system-ui" }}>
        Brain & Neuroscience Lab · Interactive edition
      </div>
    </div>
  );
}