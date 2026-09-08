import { useMemo } from "react";

/**
 * BlackHole
 * A pure CSS/SVG animated black hole — accretion disk (blue-to-white),
 * a near-side arc that passes in front of the event horizon, gravitational
 * lensing glow, and small "planets" (labeled spheres) of varying size
 * spiraling in and getting stretched apart by gravity before vanishing.
 * No external dependencies. Drop it into any React project.
 *
 * Props:
 *  - title, subtitle: optional overlay text (omit both for a pure visual)
 *  - size: diameter of the event horizon in px (default 220)
 *  - words: labels for the planets being pulled in
 *           (default: ["extremist", "anger", "guilt", "pride"])
 */
export default function BlackHole({
  title,
  subtitle,
  size = 220,
  words = ["extremist", "anger", "guilt", "pride"],
}) {
  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        scale: Math.random() * 0.8 + 0.3,
        delay: Math.random() * 6,
        duration: Math.random() * 3 + 2,
      })),
    []
  );

  const streaks = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        angle: (360 / 10) * i + Math.random() * 20,
        delay: Math.random() * 4,
        duration: Math.random() * 2 + 3,
      })),
    []
  );

  // Relative size per label — bigger words read as bigger planets.
  const WORD_SCALE = { extremist: 1.3, anger: 1.1, guilt: 0.95, pride: 0.8 };

  // Mixed coloring inspired by real solar-system planets (Mercury grey,
  // Venus tan, Earth blue, Mars rust, Jupiter banded tan, Saturn pale gold,
  // Uranus icy cyan, Neptune deep blue) — assigned across the falling
  // planets so the mix feels varied rather than tied to word meaning.
  const SOLAR_PALETTE = [
    { light: "#e6e6e6", base: "#9c9c9c", dark: "#3a3a3a" }, // Mercury
    { light: "#f5deb3", base: "#d9a441", dark: "#6b4a13" }, // Venus
    { light: "#8fd3ff", base: "#2a6f97", dark: "#0a2a3a" }, // Earth
    { light: "#ff9a76", base: "#b3462c", dark: "#4a1a0d" }, // Mars
    { light: "#f3d9b1", base: "#c9975a", dark: "#6e4a24" }, // Jupiter
    { light: "#f7e7c4", base: "#d9c48a", dark: "#7a6a3d" }, // Saturn
    { light: "#cdfffb", base: "#7fd8d0", dark: "#2a5a55" }, // Uranus
    { light: "#8fb2ff", base: "#3355c9", dark: "#101f4a" }, // Neptune
  ];

  // Planets spiral in from random angles/distances, stretch (spaghettify),
  // then vanish at the horizon. Cycle the word list so it feels continuous.
  const fallingPlanets = useMemo(() => {
    const count = 8;
    const radius = size * 1.55;
    const coreSize = size * 0.15;
    return Array.from({ length: count }, (_, i) => {
      const word = words[i % words.length];
      const scale = WORD_SCALE[word.toLowerCase()] ?? 1;
      const palette = SOLAR_PALETTE[i % SOLAR_PALETTE.length];
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * radius;
      const rot = (angle * 180) / Math.PI + 90;
      const jitter = 0.85 + Math.random() * 0.3;
      const planetSize = coreSize * scale * jitter;
      return {
        id: i,
        text: word,
        sx,
        sy,
        rot,
        planetSize,
        light: palette.light,
        base: palette.base,
        dark: palette.dark,
        delay: (i * 1.9) % 10,
        duration: 8 + Math.random() * 3,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, words]);

  return (
    <section className="bh-root">
      <div className="bh-stars">
        {stars.map((s) => (
          <span
            key={s.id}
            className="bh-star"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              transform: `scale(${s.scale})`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="bh-stage" style={{ width: size * 2.8, height: size * 2.8 }}>
        {streaks.map((s) => (
          <span
            key={s.id}
            className="bh-streak"
            style={{
              transform: `rotate(${s.angle}deg)`,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}

        <div className="bh-lensing" style={{ width: size * 2.2, height: size * 2.2 }} />

        {/* far side of the disk, arcs above/behind the horizon */}
        <div className="bh-disk-back" style={{ width: size * 2, height: size * 0.66 }} />

        <div className="bh-horizon" style={{ width: size, height: size }} />
        <div className="bh-photon-ring" style={{ width: size * 1.08, height: size * 1.08 }} />

        {/* near side of the disk: same ellipse, only its bottom half shown,
            sitting in a higher z-index so it visibly crosses in front of the hole */}
        <div className="bh-disk-front" style={{ width: size * 2, height: size * 0.66 }} />

        {fallingPlanets.map((p) => (
          <div
            key={p.id}
            className="bh-planet-wrap"
            style={{
              "--sx": `${p.sx}px`,
              "--sy": `${p.sy}px`,
              "--rot": `${p.rot}deg`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          >
            <span
              className="bh-planet"
              style={{
                width: p.planetSize,
                height: p.planetSize,
                background: `radial-gradient(circle at 30% 30%, ${p.light} 0%, ${p.base} 55%, ${p.dark} 100%)`,
                boxShadow: `0 0 ${p.planetSize * 0.6}px ${p.planetSize * 0.15}px ${p.base}66`,
              }}
            />
            <span className="bh-planet-label">{p.text}</span>
          </div>
        ))}

        {(title || subtitle) && (
          <div className="bh-caption">
            {title && <h2 className="bh-title">{title}</h2>}
            {subtitle && <p className="bh-subtitle">{subtitle}</p>}
          </div>
        )}
      </div>

      <style>{`
        .bh-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: radial-gradient(ellipse at center, #050308 0%, #000000 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .bh-stars {
          position: absolute;
          inset: 0;
        }
        .bh-star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: #ffffff;
          border-radius: 50%;
          animation: bh-twinkle ease-in-out infinite;
        }
        @keyframes bh-twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.9; }
        }

        .bh-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bh-streak {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 1px;
          height: 46%;
          transform-origin: top center;
          background: linear-gradient(to bottom, rgba(160,220,255,0) 0%, rgba(160,220,255,0.85) 78%, rgba(255,255,255,0) 100%);
          animation: bh-infall linear infinite;
          opacity: 0;
          z-index: 3;
        }
        @keyframes bh-infall {
          0%   { opacity: 0; height: 10%; }
          15%  { opacity: 0.8; }
          85%  { opacity: 0.4; }
          100% { opacity: 0; height: 46%; }
        }

        .bh-lensing {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle,
            rgba(0, 191, 255, 0.12) 0%,
            rgba(0, 120, 200, 0.08) 35%,
            rgba(0,0,0,0) 65%);
          filter: blur(6px);
          animation: bh-pulse 6s ease-in-out infinite;
          z-index: 1;
        }
        @keyframes bh-pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%      { transform: scale(1.06); opacity: 1; }
        }

        /* shared disk look: blue on the left fading to white on the right */
        .bh-disk-back,
        .bh-disk-front {
          position: absolute;
          top: 50%;
          left: 50%;
          border-radius: 50%;
          background: linear-gradient(90deg, #00BFFF 0%, #8fdcff 40%, #ffffff 100%);
          transform: translate(-50%, -50%) rotateX(72deg);
        }

        .bh-disk-back {
          z-index: 2;
          filter: blur(1.5px);
          box-shadow: 0 0 40px 6px rgba(0, 191, 255, 0.3);
          animation: bh-breathe 5s ease-in-out infinite;
        }

        .bh-disk-front {
          z-index: 6;
          clip-path: inset(52% 0 0 0); /* keep only the near-side bottom arc */
          filter: blur(0.5px) brightness(1.15);
          box-shadow: 0 4px 30px 4px rgba(150, 220, 255, 0.4);
          animation: bh-breathe 5s ease-in-out infinite;
        }

        @keyframes bh-breathe {
          0%, 100% { filter: brightness(1); }
          50%      { filter: brightness(1.12); }
        }

        .bh-horizon {
          position: absolute;
          border-radius: 50%;
          background: #000;
          z-index: 4;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.8);
        }

        .bh-photon-ring {
          position: absolute;
          border-radius: 50%;
          z-index: 5;
          background: transparent;
          box-shadow:
            0 0 8px 2px rgba(210, 240, 255, 0.85),
            0 0 22px 6px rgba(0, 191, 255, 0.35);
          animation: bh-ring-shimmer 4s ease-in-out infinite;
        }
        @keyframes bh-ring-shimmer {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(210,240,255,0.7), 0 0 22px 6px rgba(0,191,255,0.3); }
          50%      { box-shadow: 0 0 12px 3px rgba(210,240,255,1),  0 0 30px 9px rgba(0,191,255,0.45); }
        }

        /* planets pulled in by gravity, spaghettified as they near the horizon */
        .bh-planet-wrap {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 7;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          pointer-events: none;
          animation-name: bh-fallplanet;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          /* keep each planet at its 0% (outer, invisible) position while it
             waits out its staggered delay, instead of snapping to the
             black hole's center for that time */
          animation-fill-mode: backwards;
        }
        .bh-planet {
          display: block;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .bh-planet-label {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 0.7rem;
          letter-spacing: 0.02em;
          color: rgba(255, 255, 255, 0.8);
          text-shadow: 0 0 5px rgba(0,0,0,0.8);
          white-space: nowrap;
        }
        @keyframes bh-fallplanet {
          0% {
            transform: translate(-50%, -50%) translate(var(--sx), var(--sy)) scale(1);
            opacity: 0;
          }
          8% { opacity: 1; }
          70% {
            opacity: 0.9;
            transform: translate(-50%, -50%) translate(calc(var(--sx) * 0.18), calc(var(--sy) * 0.18))
              rotate(calc(var(--rot) * 0.2)) scale(0.85);
          }
          90% {
            opacity: 0.7;
            transform: translate(-50%, -50%) translate(calc(var(--sx) * 0.05), calc(var(--sy) * 0.05))
              rotate(calc(var(--rot) * 0.4)) scaleX(1.8) scaleY(0.4);
          }
          100% {
            transform: translate(-50%, -50%) translate(0, 0) rotate(calc(var(--rot) * 0.6))
              scaleX(0.05) scaleY(0.15);
            opacity: 0;
          }
        }

        .bh-caption {
          position: absolute;
          bottom: -18%;
          text-align: center;
          z-index: 8;
          width: max-content;
          max-width: 90vw;
        }
        .bh-title {
          margin: 0;
          font-family: "Georgia", "Iowan Old Style", serif;
          font-weight: 400;
          font-size: clamp(1.6rem, 4vw, 2.6rem);
          color: #f5efe6;
          letter-spacing: 0.01em;
        }
        .bh-subtitle {
          margin: 0.5rem 0 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 1rem;
          color: rgba(245, 239, 230, 0.6);
        }

        @media (prefers-reduced-motion: reduce) {
          .bh-star, .bh-streak, .bh-lensing, .bh-disk-back, .bh-disk-front,
          .bh-photon-ring, .bh-planet-wrap {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}