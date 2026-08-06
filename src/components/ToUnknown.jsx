// src/components/ToUnknown.jsx
// A great double door set into a carved stone archway — ancient, riveted,
// rune-bordered — standing in the realm of the known. Pull the twin rings
// at its center and both leaves swing back on a vast dark beyond, populated
// by the things that live past the threshold: emotions, thoughts, souls,
// dreams, death, truth, morals...
//
// Composition referenced from a classic "ancient temple door" reference:
// carved stone archway with pilasters, a keystone crest, a runic border,
// a pair of riveted wood-and-metal leaves each bearing rune-wheel medallions,
// a split central medallion with twin ring-pulls at the seam, and stone
// steps at the threshold. Rendered in the site's bluish-white / deep-stone
// palette rather than the reference's warm bronze, to stay in the same
// visual family as the rest of Common Psychology.

import { useState, useCallback, useMemo } from "react"

/* ─── DESIGN TOKENS — bluish-white paper palette + deep stone + a void register ─── */
const T = {
  paper: "#eaf6ff", paperDeep: "#d8f0ff", paperLine: "#a9dcf5",
  ink: "#0f3a52", inkSoft: "#2e6080", inkFaint: "#5b8aa0",
  blueDeep: "#1a3a4a", blueMid: "#2e6080", sky: "#00BFFF", skyDark: "#009fd4",
  white: "#ffffff", cardLine: "#bfe3fb",
  void: "#03060c", voidMid: "#0a1830", voidGlow: "#123a52",
  /* re-tinted to the site's sky-blue variable set */
  stone1: "#E0F7FF", stone2: "#00BFFF", stone3: "#009FD4", stone4: "#0a6f96", stone5: "#063f56",
  moss: "#5bb8d9", mossDark: "#2d6f8c",
  patina: "#8fdcf5", patinaDark: "#009FD4",
  metal1: "#00BFFF", metal2: "#063f56",
}

/* deterministic pseudo-random — stable across renders, no hydration flicker */
function seeded(i, salt) {
  const x = Math.sin((i + 1) * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function useField(count, salt) {
  return useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        left: seeded(i, salt) * 100,
        top: seeded(i, salt + 1) * 100,
        size: 0.6 + seeded(i, salt + 2) * 1.8,
        delay: seeded(i, salt + 3) * 5,
        duration: 2.4 + seeded(i, salt + 4) * 3.2,
      })),
    [count, salt]
  )
}

/* what waits beyond the threshold */
const CONCEPTS = [
  "YOU","Emotions", "Thoughts", "Souls", "Dreams", "Death",
  "Truth", "Morals", "Memory", "Fear", "Hope",
  "Time", "Silence", "Longing", "Wonder","Unknown", "Suffering","Fear","Loneliness","Disorder","Uncertanity","Belief"
]

function useConcepts() {
  return useMemo(
    () =>
      CONCEPTS.map((word, i) => {
        const layer = i % 3 // 0 near, 1 mid, 2 far
        return {
          word,
          left: 10 + seeded(i, 30) * 80,
          top: 8 + seeded(i, 31) * 78,
          layer,
          driftDur: 6 + seeded(i, 32) * 6,
          driftDelay: seeded(i, 33) * 4,
          fadeDelay: 0.5 + i * 0.11,
        }
      }),
    []
  )
}

/* rune-band ticks running along the arch — most worn nearly to nothing */
function useRuneband(count, salt) {
  return useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        h: 5 + seeded(i, salt) * 7,
        faint: seeded(i, salt + 1) > 0.55,
      })),
    [count, salt]
  )
}

const OPEN_W = 320
const OPEN_H = 500
const ARCH = `${OPEN_W / 2}px ${OPEN_W / 2}px 4px 4px`
const LEAF_W = OPEN_W / 2

const LAYER_STYLE = {
  0: { fontSize: "1.05rem", opacity: 0.95, blur: 0, color: "#eaf6ff" },
  1: { fontSize: "0.85rem", opacity: 0.72, blur: 0.4, color: "#bfe3fb" },
  2: { fontSize: "0.68rem", opacity: 0.5, blur: 1, color: "#7fb8d8" },
}

/* a bolted rune-wheel — purely decorative plating on each leaf */
function Wheel({ size = 46 }) {
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 30%, ${T.stone1} 0%, ${T.stone3} 55%, ${T.stone4} 100%)`,
        border: `1.5px solid ${T.stone5}`,
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5), inset 0 -1px 2px rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "22%",
          borderRadius: "50%",
          border: `1px solid ${T.stone5}`,
          background: `conic-gradient(${T.stone2} 0deg 12deg, transparent 12deg 45deg, ${T.stone2} 45deg 57deg, transparent 57deg 90deg, ${T.stone2} 90deg 102deg, transparent 102deg 135deg, ${T.stone2} 135deg 147deg, transparent 147deg 180deg, ${T.stone2} 180deg 192deg, transparent 192deg 225deg, ${T.stone2} 225deg 237deg, transparent 237deg 270deg, ${T.stone2} 270deg 282deg, transparent 282deg 315deg, ${T.stone2} 315deg 327deg, transparent 327deg 360deg)`,
        }}
      />
      {[...Array(6)].map((_, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 2,
            height: 2,
            marginLeft: -1,
            marginTop: -1,
            borderRadius: "50%",
            background: T.stone5,
            transform: `rotate(${i * 60}deg) translate(${size * 0.42}px)`,
            boxShadow: "0 0 1px rgba(0,0,0,0.6)",
          }}
        />
      ))}
    </div>
  )
}

/* a metal strap with rivets, at any width/rotation */
function Strap({ style }) {
  const numericWidth = typeof style.width === "number" ? style.width : LEAF_W
  const rivetCount = Math.max(2, Math.round(numericWidth / 22))
  return (
    <div style={{ position: "absolute", height: 10, background: `linear-gradient(180deg, ${T.metal1}, ${T.metal2})`, boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 2px 4px rgba(0,0,0,0.4)", ...style }}>
      {[...Array(rivetCount)].map((_, i, arr) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: "50%",
            left: `${(100 / (arr.length + 1)) * (i + 1)}%`,
            width: 4,
            height: 4,
            marginTop: -2,
            marginLeft: -2,
            borderRadius: "50%",
            background: T.stone1,
            boxShadow: "inset 0 1px 1px rgba(0,0,0,0.6), 0 0 1px rgba(255,255,255,0.2)",
          }}
        />
      ))}
    </div>
  )
}

export default function ToUnknown() {
  const [open, setOpen] = useState(false)
  const stars = useField(110, 1)
  const concepts = useConcepts()
  const runeband = useRuneband(34, 50)

  const toggle = useCallback(() => setOpen(o => !o), [])

  return (
    <div style={styles.stage}>
      <div style={{
        position: "absolute", width: 360, height: 360, top: -140, left: -120,
        borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(41,128,185,0.14), transparent 70%)",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300, bottom: -120, right: -100,
        borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(0,191,255,0.12), transparent 70%)",
      }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Source+Serif+4:ital,wght@0,400;1,400&family=Nunito:ital,wght@0,400;0,600;0,700;0,800&display=swap');
        .tu-scope * { box-sizing: border-box; }

        @keyframes tu-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.85); }
          50%      { opacity: 1;    transform: scale(1.15); }
        }
        @keyframes tu-drift {
          0%   { transform: translate(-6%, 0%) scale(1); }
          50%  { transform: translate(4%, -4%) scale(1.08); }
          100% { transform: translate(-6%, 0%) scale(1); }
        }
        @keyframes tu-drift-slow {
          0%   { transform: translate(3%, -2%) scale(1.05); }
          50%  { transform: translate(-5%, 3%) scale(0.95); }
          100% { transform: translate(3%, -2%) scale(1.05); }
        }
        @keyframes tu-breathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }
        @keyframes tu-mist {
          0%   { transform: translateY(0) translateX(0); opacity: 0.35; }
          50%  { transform: translateY(-14px) translateX(8px); opacity: 0.6; }
          100% { transform: translateY(0) translateX(0); opacity: 0.35; }
        }
        @keyframes tu-word-drift {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes tu-bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(4px); }
        }
        @keyframes tu-glow {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 0.9; }
        }
        @keyframes tu-halo-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.9;  transform: scale(1.18); }
        }

        .tu-knob-wrap { transition: transform 0.25s ease; }
        .tu-knob-wrap:hover { transform: scale(1.08); }
        .tu-knob-wrap:active { transform: scale(0.94); }
        .tu-knob-wrap:focus-visible {
          outline: 2px solid ${T.sky};
          outline-offset: 4px;
          border-radius: 8px;
        }

        @media (prefers-reduced-motion: reduce) {
          .tu-scope *, .tu-scope *::before, .tu-scope *::after {
            animation-duration: 0.001ms !important;
            animation-iteration-count: 1 !important;
          }
        }

        @media (max-width: 560px) {
          .tu-scope { transform: scale(0.7); }
        }
      `}</style>

      <div className="tu-scope" style={styles.scope}>
        {/* ── ambient mist of the known realm ── */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${8 + i * 19}%`,
              top: `${6 + (i % 3) * 22}%`,
              width: 170 + i * 22,
              height: 170 + i * 22,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${T.paperDeep} 0%, transparent 70%)`,
              filter: "blur(18px)",
              opacity: 0.4,
              animation: `tu-mist ${7 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.6}s`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* ── eyebrow ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.75rem" }}>
          <div style={{ ...styles.eyebrowRow, marginBottom: "0.5rem" }}>
            <span style={styles.eyebrowLine} />
            <span style={styles.eyebrow}>In the Realm of the Known</span>
            <span style={styles.eyebrowLine} />
          </div>
          <span style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontStyle: "italic", fontSize: "0.78rem", color: T.inkFaint, opacity: 0.85 }}>
           We discourse on life and everything
          </span>
        </div>

        {/* ── the doorway itself ── */}
        <div style={styles.archWrap}>
          {/* carved stone archway, with pilasters either side */}
          <div style={styles.surround}>
            {/* keystone crest — fixed to the stone, never moves */}
            <div style={styles.keystone}>
              <div style={styles.emblemPlate}>
                <img src="/header.png" alt="Common Psychology crest" style={styles.crestLogo} draggable={false} />
              </div>
            </div>

            {/* runic border, worn nearly illegible in places */}
            <div style={styles.runeArc}>
              {runeband.map((r, i) => (
                <span
                  key={i}
                  style={{
                    ...styles.runeTick,
                    height: r.h,
                    opacity: r.faint ? 0.14 : 0.4,
                    transform: `translateX(-50%) rotate(${-92 + (184 * i) / (runeband.length - 1)}deg)`,
                  }}
                />
              ))}
            </div>

            {/* left pilaster */}
            <div style={{ ...styles.pilaster, left: 0 }}>
              <div style={styles.pilasterCapital} />
              <div style={styles.pilasterFlutes} />
              <div style={styles.pilasterBase}>
                <div style={styles.baseRune} />
              </div>
            </div>
            {/* right pilaster */}
            <div style={{ ...styles.pilaster, right: 0 }}>
              <div style={styles.pilasterCapital} />
              <div style={styles.pilasterFlutes} />
              <div style={styles.pilasterBase}>
                <div style={styles.baseRune} />
              </div>
            </div>

            {/* moss finding its way up regardless of how carefully this was carved */}
            <div style={{ ...styles.mossPatch, left: -4, bottom: -4, width: 54, height: 40, background: `radial-gradient(circle, ${T.moss} 0%, transparent 72%)`, opacity: 0.5 }} />
            <div style={{ ...styles.mossPatch, right: -6, bottom: 8, width: 40, height: 60, background: `radial-gradient(circle, ${T.mossDark} 0%, transparent 70%)`, opacity: 0.42 }} />

            {/* the opening — perspective lives here so both leaves can swing in 3D */}
            <div style={styles.opening}>
              {/* what lies beyond — vast, always there, only ever seen through the doorway */}
              <div style={{ ...styles.voidLayer, animation: "tu-breathe 18s ease-in-out infinite" }} aria-hidden="true">
                <div style={styles.nebulaA} />
                <div style={styles.nebulaB} />
                <div style={styles.nebulaC} />

                {stars.map((s, i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      left: `${s.left}%`,
                      top: `${s.top}%`,
                      width: s.size,
                      height: s.size,
                      borderRadius: "50%",
                      background: "#eaf6ff",
                      boxShadow: `0 0 ${s.size * 2}px rgba(234,246,255,0.8)`,
                      animation: `tu-twinkle ${s.duration}s ease-in-out infinite`,
                      animationDelay: `${s.delay}s`,
                    }}
                  />
                ))}

                {concepts.map((c) => {
                  const ls = LAYER_STYLE[c.layer]
                  return (
                    <span
                      key={c.word}
                      style={{
                        position: "absolute",
                        left: `${c.left}%`,
                        top: `${c.top}%`,
                        transform: "translate(-50%, -50%)",
                        fontFamily: "'Source Serif 4', Georgia, serif",
                        fontStyle: "italic",
                        fontSize: ls.fontSize,
                        color: ls.color,
                        filter: `blur(${ls.blur}px)`,
                        textShadow: `0 0 12px rgba(0,191,255,0.55), 0 0 2px rgba(255,255,255,0.4)`,
                        opacity: open ? ls.opacity : 0,
                        transition: `opacity 1.1s ease ${c.fadeDelay}s`,
                        animation: `tu-word-drift ${c.driftDur}s ease-in-out infinite`,
                        animationDelay: `${c.driftDelay}s`,
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                      }}
                    >
                      {c.word}
                    </span>
                  )
                })}

                <div style={styles.abyssVignette} />
              </div>

              {/* ── LEFT LEAF ── */}
              <div style={{ ...styles.leaf, left: 0, transformOrigin: "0% 50%", transform: open ? "rotateY(-108deg)" : "rotateY(0deg)" }}>
                <div style={styles.leafFace}>
                  <div style={styles.plankGrain} />
                  <Strap style={{ top: "18%", left: 0, width: "100%" }} />
                  <Strap style={{ top: "78%", left: 0, width: "100%" }} />
                  <Strap style={{ top: 0, right: 6, width: 10, height: "100%", writingMode: "vertical-lr" }} />
                  <div style={{ position: "absolute", top: "30%", left: "28%" }}><Wheel /></div>
                  <div style={{ position: "absolute", top: "63%", left: "28%" }}><Wheel size={38} /></div>

                  {/* right half of the split central medallion */}
                  <div style={styles.medallionWrapL}>
                    <div style={styles.medallionCircleL}>
                      <div style={styles.medallionInnerRing} />
                    </div>
                  </div>
                  <span style={{ ...styles.ringPull, right: 12 }} />
                </div>
              </div>

              {/* ── RIGHT LEAF ── */}
              <div style={{ ...styles.leaf, right: 0, transformOrigin: "100% 50%", transform: open ? "rotateY(108deg)" : "rotateY(0deg)" }}>
                <div style={styles.leafFace}>
                  <div style={styles.plankGrain} />
                  <Strap style={{ top: "18%", left: 0, width: "100%" }} />
                  <Strap style={{ top: "78%", left: 0, width: "100%" }} />
                  <Strap style={{ top: 0, left: 6, width: 10, height: "100%" }} />
                  <div style={{ position: "absolute", top: "30%", right: "28%" }}><Wheel /></div>
                  <div style={{ position: "absolute", top: "63%", right: "28%" }}><Wheel size={38} /></div>

                  {/* left half of the split central medallion */}
                  <div style={styles.medallionWrapR}>
                    <div style={styles.medallionCircleR}>
                      <div style={styles.medallionInnerRing} />
                    </div>
                  </div>
                  <span style={{ ...styles.ringPull, left: 12 }} />
                </div>
              </div>

              {/* single hit target spanning the seam — pulling either ring opens both leaves */}
              <button
                className="tu-knob-wrap"
                onClick={toggle}
                aria-pressed={open}
                aria-label={open ? "Close the doors" : "Open the doors"}
                style={styles.knobBtn}
              >
                <span style={styles.knobHalo} />
              </button>
            </div>
          </div>

          {/* light spilling out once the doors give way */}
          <div style={{ ...styles.spill, opacity: open ? 1 : 0 }} />

          {/* stone steps at the threshold */}
          <div style={styles.steps}>
            <div style={{ ...styles.step, width: "78%" }} />
            <div style={{ ...styles.step, width: "92%" }} />
            <div style={{ ...styles.step, width: "106%" }} />
          </div>
        </div>

        {/* ── invitation ── */}
        <p style={styles.caption}>
          We are waiting for you — turn the knob and join us in this journey.
        </p>
        {!open && (
          <div style={styles.hint}>
            <span style={{ animation: "tu-bob 1.6s ease-in-out infinite", display: "inline-block" }}>↳</span>
            &nbsp;pull the rings
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════ */
const styles = {
  stage: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `linear-gradient(180deg, ${T.paper} 0%, #ffffff 55%, ${T.paper} 100%)`,
    padding: "3rem 1.5rem",
    overflow: "hidden",
    position: "relative",
  },
  scope: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 1,
  },
  eyebrowRow: { display: "flex", alignItems: "center", gap: 10 },
  eyebrowLine: { width: 34, height: 1, background: T.ink, opacity: 0.5 },
  eyebrow: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: "0.68rem",
    fontWeight: 800,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: T.inkSoft,
  },

  archWrap: { position: "relative" },

  surround: {
    position: "relative",
    padding: `24px ${52}px 8px`,
    borderRadius: `${OPEN_W / 2 + 52}px ${OPEN_W / 2 + 52}px 10px 10px`,
    background: `
      radial-gradient(circle at 26% 10%, rgba(255,255,255,0.22) 0%, transparent 36%),
      radial-gradient(circle at 78% 90%, rgba(0,0,0,0.3) 0%, transparent 45%),
      linear-gradient(160deg, ${T.stone1} 0%, ${T.stone2} 48%, ${T.stone3} 100%)
    `,
    border: `2px solid ${T.stone5}`,
    boxShadow: `
      0 30px 74px rgba(10,14,17,0.45),
      inset 0 2px 0 rgba(255,255,255,0.16),
      inset 0 -5px 16px rgba(0,0,0,0.4)
    `,
  },

  keystone: {
    position: "absolute",
    left: "50%",
    top: -30,
    transform: "translateX(-50%)",
    zIndex: 3,
  },

  runeArc: {
    position: "absolute",
    left: "50%",
    top: 20,
    width: 0,
    height: 0,
    pointerEvents: "none",
  },
  runeTick: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 1.5,
    transformOrigin: "50% 0%",
    background: T.stone5,
  },

  pilaster: {
    position: "absolute",
    top: 20,
    bottom: 6,
    width: 34,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  pilasterCapital: {
    width: "100%",
    height: 14,
    borderRadius: 3,
    background: `linear-gradient(180deg, ${T.stone1}, ${T.stone3})`,
    border: `1px solid ${T.stone5}`,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
    flexShrink: 0,
  },
  pilasterFlutes: {
    flex: 1,
    width: "82%",
    marginTop: 2,
    background: `repeating-linear-gradient(90deg, ${T.stone3} 0px, ${T.stone2} 3px, ${T.stone4} 6px)`,
    boxShadow: "inset 0 0 10px rgba(0,0,0,0.45)",
  },
  pilasterBase: {
    width: "100%",
    height: 30,
    marginTop: 2,
    borderRadius: 3,
    background: `linear-gradient(180deg, ${T.stone2}, ${T.stone4})`,
    border: `1px solid ${T.stone5}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  baseRune: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: `1.5px solid ${T.stone5}`,
    background: `conic-gradient(${T.stone1} 0deg 30deg, transparent 30deg 60deg, ${T.stone1} 60deg 90deg, transparent 90deg 120deg, ${T.stone1} 120deg 150deg, transparent 150deg 180deg, ${T.stone1} 180deg 210deg, transparent 210deg 240deg, ${T.stone1} 240deg 270deg, transparent 270deg 300deg, ${T.stone1} 300deg 330deg, transparent 330deg 360deg)`,
    opacity: 0.6,
  },

  mossPatch: { position: "absolute", borderRadius: "50%", filter: "blur(7px)", pointerEvents: "none" },

  opening: {
    position: "relative",
    width: OPEN_W,
    height: OPEN_H,
    margin: "0 auto",
    borderRadius: ARCH,
    overflow: "hidden",
    perspective: 1700,
    boxShadow: `inset 0 0 0 2px ${T.stone5}, inset 0 8px 30px rgba(0,0,0,0.6)`,
  },

  voidLayer: {
    position: "absolute",
    inset: 0,
    background: `radial-gradient(ellipse at 50% 28%, ${T.voidGlow} 0%, ${T.voidMid} 45%, ${T.void} 100%)`,
    overflow: "hidden",
  },
  nebulaA: {
    position: "absolute", left: "-15%", top: "-8%", width: "80%", height: "60%", borderRadius: "50%",
    background: `radial-gradient(circle, rgba(0,191,255,0.26) 0%, transparent 70%)`,
    filter: "blur(34px)", animation: "tu-drift 13s ease-in-out infinite",
  },
  nebulaB: {
    position: "absolute", right: "-18%", bottom: "2%", width: "72%", height: "58%", borderRadius: "50%",
    background: `radial-gradient(circle, rgba(61,107,90,0.24) 0%, transparent 72%)`,
    filter: "blur(38px)", animation: "tu-drift-slow 16s ease-in-out infinite",
  },
  nebulaC: {
    position: "absolute", left: "18%", bottom: "-12%", width: "60%", height: "45%", borderRadius: "50%",
    background: `radial-gradient(circle, rgba(46,96,128,0.3) 0%, transparent 72%)`,
    filter: "blur(30px)", animation: "tu-drift 20s ease-in-out infinite reverse",
  },
  abyssVignette: {
    position: "absolute", inset: 0,
    boxShadow: "inset 0 0 110px 24px rgba(0,0,0,0.72)",
    animation: "tu-glow 5s ease-in-out infinite",
  },

  leaf: {
    position: "absolute",
    top: 0,
    width: LEAF_W,
    height: "100%",
    transformStyle: "preserve-3d",
    backfaceVisibility: "hidden",
    transition: "transform 1.5s cubic-bezier(0.22, 0.61, 0.22, 1)",
    willChange: "transform",
  },
  leafFace: {
    position: "absolute",
    inset: 0,
    background: `
      radial-gradient(circle at 25% 12%, rgba(255,255,255,0.12) 0%, transparent 30%),
      radial-gradient(circle at 75% 88%, rgba(0,0,0,0.28) 0%, transparent 40%),
      linear-gradient(155deg, ${T.stone1} 0%, ${T.stone2} 55%, ${T.stone3} 100%)
    `,
    boxShadow: `inset 0 3px 0 rgba(255,255,255,0.1), inset 0 -8px 20px rgba(0,0,0,0.45)`,
    overflow: "hidden",
  },
  plankGrain: {
    position: "absolute",
    inset: 0,
    background: `repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0px, transparent 2px, transparent 22px, rgba(255,255,255,0.05) 24px)`,
    pointerEvents: "none",
  },

  medallionWrapL: { position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 58, height: 116, overflow: "hidden" },
  medallionCircleL: {
    position: "absolute", right: 0, top: 0, width: 116, height: 116, borderRadius: "50%",
    background: `radial-gradient(circle at 35% 30%, ${T.stone1} 0%, ${T.stone3} 55%, ${T.stone5} 100%)`,
    border: `2px solid ${T.stone5}`,
    boxShadow: "inset 0 3px 8px rgba(0,0,0,0.5)",
  },
  medallionWrapR: { position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 58, height: 116, overflow: "hidden" },
  medallionCircleR: {
    position: "absolute", left: 0, top: 0, width: 116, height: 116, borderRadius: "50%",
    background: `radial-gradient(circle at 65% 30%, ${T.stone1} 0%, ${T.stone3} 55%, ${T.stone5} 100%)`,
    border: `2px solid ${T.stone5}`,
    boxShadow: "inset 0 3px 8px rgba(0,0,0,0.5)",
  },
  medallionInnerRing: {
    position: "absolute", inset: "18%", borderRadius: "50%",
    border: `1px solid ${T.stone5}`,
    background: `conic-gradient(${T.stone2} 0deg 10deg, transparent 10deg 35deg, ${T.stone2} 35deg 45deg, transparent 45deg 70deg, ${T.stone2} 70deg 80deg, transparent 80deg 105deg, ${T.stone2} 105deg 115deg, transparent 115deg 140deg, ${T.stone2} 140deg 150deg, transparent 150deg 175deg, ${T.stone2} 175deg 185deg, transparent 185deg 210deg, ${T.stone2} 210deg 220deg, transparent 220deg 245deg, ${T.stone2} 245deg 255deg, transparent 255deg 280deg, ${T.stone2} 280deg 290deg, transparent 290deg 315deg, ${T.stone2} 315deg 325deg, transparent 325deg 350deg, ${T.stone2} 350deg 360deg)`,
  },
  ringPull: {
    position: "absolute",
    top: "50%",
    marginTop: -11,
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: `3px solid ${T.patina}`,
    background: "transparent",
    boxShadow: `inset 0 2px 3px rgba(0,0,0,0.5), 0 0 8px rgba(0,191,255,0.35), 0 2px 4px rgba(0,0,0,0.5)`,
  },

  keystone_placeholder: {},

  emblemPlate: {
    position: "relative",
    width: 104,
    height: 104,
    borderRadius: "50%",
    background: `radial-gradient(circle at 32% 26%, ${T.stone1} 0%, ${T.stone2} 55%, ${T.stone3} 100%)`,
    border: `3px solid ${T.stone5}`,
    boxShadow: `inset 0 0 0 4px rgba(255,255,255,0.9), inset 0 2px 4px rgba(0,0,0,0.15), 0 8px 20px rgba(10,47,51,0.45)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  crestLogo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    userSelect: "none",
  },

  knobBtn: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 64,
    height: 74,
    marginLeft: -32,
    marginTop: -37,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    padding: 0,
    zIndex: 5,
    borderRadius: 8,
  },
  knobHalo: {
    position: "absolute",
    inset: 4,
    borderRadius: "50%",
    background: `radial-gradient(circle, rgba(0,191,255,0.3) 0%, transparent 70%)`,
    filter: "blur(6px)",
    animation: "tu-halo-pulse 3s ease-in-out infinite",
  },

  spill: {
    position: "absolute",
    left: "50%",
    bottom: -14,
    width: OPEN_W * 1.4,
    height: 80,
    transform: "translateX(-50%)",
    background: `radial-gradient(ellipse at 50% 0%, rgba(0,191,255,0.35) 0%, transparent 72%)`,
    filter: "blur(6px)",
    transition: "opacity 1s ease 0.4s",
    pointerEvents: "none",
  },

  steps: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 4,
  },
  step: {
    height: 12,
    borderRadius: "2px",
    background: `linear-gradient(180deg, ${T.stone2} 0%, ${T.stone4} 100%)`,
    border: `1px solid ${T.stone5}`,
    borderTop: `1px solid rgba(255,255,255,0.15)`,
    marginTop: -1,
    boxShadow: "0 3px 6px rgba(0,0,0,0.35)",
  },

  caption: {
    marginTop: "2.5rem",
    fontFamily: "'Source Serif 4', Georgia, serif",
    fontStyle: "italic",
    fontSize: "1.08rem",
    color: T.inkSoft,
    textAlign: "center",
    maxWidth: 380,
    lineHeight: 1.65,
  },
  hint: {
    marginTop: "0.6rem",
    fontFamily: "'Nunito', sans-serif",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: T.inkFaint,
  },
}