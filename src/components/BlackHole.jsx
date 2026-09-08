import { useMemo } from "react";

/**
 * BlackHole
 * A pure CSS/SVG animated black hole — accretion disk (blue-to-white),
 * a near-side arc that passes in front of the event horizon, gravitational
 * lensing glow, and words being pulled in and stretched apart by gravity.
 * No external dependencies. Drop it into any React project.
 *
 * Props:
 *  - title, subtitle: optional overlay text (omit both for a pure visual)
 *  - size: diameter of the event horizon in px (default 220)
 *  - words: array of strings shown spiraling into the hole
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

  // Words spiral in from random angles/distances, stretch (spaghettify),
  // then vanish at the horizon. Cycle the word list so it feels continuous.
  const fallingWords = useMemo(() => {
    const count = 9;
    const radius = size * 1.5;
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.6;
      const sx = Math.cos(angle) * radius;
      const sy = Math.sin(angle) * radius;
      const rot = (angle * 180) / Math.PI + 90;
      return {
        id: i,
        text: words[i % words.length],
        sx,
        sy,
        rot,
        delay: (i * 1.6) % 9,
        duration: 7 + Math.random() * 3,
      };
    });
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

        {fallingWords.map((w) => (
          <span
            key={w.id}
            className="bh-word"
            style={{
              "--sx": `${w.sx}px`,
              "--sy": `${w.sy}px`,
              "--rot": `${w.rot}deg`,
              animationDelay: `${w.delay}s`,
              animationDuration: `${w.duration}s`,
            }}
          >
            {w.text}
          </span>
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

        /* words pulled in by gravity, spaghettified as they near the horizon */
        .bh-word {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 7;
          white-space: nowrap;
          pointer-events: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.02em;
          color: rgba(255, 232, 225, 0.85);
          text-shadow: 0 0 6px rgba(255, 200, 190, 0.5);
          animation: bh-fallword linear infinite;
        }
        @keyframes bh-fallword {
          0% {
            transform: translate(-50%, -50%) translate(var(--sx), var(--sy)) scale(1);
            opacity: 0;
          }
          8% { opacity: 0.9; }
          75% {
            opacity: 0.55;
            transform: translate(-50%, -50%) translate(calc(var(--sx) * 0.12), calc(var(--sy) * 0.12))
              rotate(calc(var(--rot) * 0.3)) scaleX(1.7) scaleY(0.55);
          }
          100% {
            transform: translate(-50%, -50%) translate(0, 0) rotate(calc(var(--rot) * 0.6))
              scaleX(0.05) scaleY(0.2);
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
          .bh-photon-ring, .bh-word {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}