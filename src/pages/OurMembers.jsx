import React, { useCallback, useEffect, useRef, useState } from "react";
import { Swords, Users, Loader2, ShieldPlus, Flame } from "lucide-react";

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
const API = import.meta.env.VITE_API_URL;

// ---------------------------------------------------------------------------
// Palette — Wall of Warriors: forged stone, torchlight, no blue.
// ---------------------------------------------------------------------------
const PALETTE = {
  bgDeep: "#171310",       // page background — near-black stone
  mortar: "#211D18",       // gaps between bricks
  brickBase: "#4A4030",    // brick fill (mid)
  brickLight: "#6E5F45",   // brick top-left bevel highlight
  brickShadow: "#15110D",  // brick bottom-right bevel shadow
  parchment: "#E9DEC2",    // engraved name — light stroke
  parchmentDim: "#7C7360", // faint texture on blank bricks
  ember: "#D98A34",        // torch / accent
  emberBright: "#FFC078",  // glow highlight
  gold: "#D9B26A",         // "you" brick accent
  goldDeep: "#8C6A2F",
  steel: "#9AA6AC",         // shuffle button
  text: "#EFE7D6",
  subtext: "rgba(239,231,214,0.72)",
};

const DISPLAY_FONT = '"Cinzel", Georgia, "Times New Roman", serif';
const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

const JOIN_STRIP_WIDTH = 92;
const JOIN_STRIP_WIDTH_MOBILE = 56;

// ---------------------------------------------------------------------------
// Small seeded PRNG so per-brick stone texture stays stable between redraws
// that aren't full reshuffles (keeps the wall feeling solid, not jittery).
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Compute a running-bond brick grid for the given area.
// ---------------------------------------------------------------------------
function computeBrickGrid(width, height, topReserve) {
  const scale = Math.max(0.72, Math.min(1.25, width / 1400));
  const brickW = 148 * scale;
  const brickH = 46 * scale;
  const gap = 6 * scale;

  const availH = Math.max(0, height - topReserve);
  const rows = Math.max(1, Math.floor((availH + gap) / (brickH + gap)));
  const cols = Math.max(1, Math.ceil((width + brickW) / (brickW + gap)) + 1);

  const cells = [];
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 1 ? (brickW + gap) / 2 : 0;
    for (let c = 0; c < cols; c++) {
      const x = c * (brickW + gap) - offset;
      const y = topReserve + r * (brickH + gap);
      if (x + brickW < 0 || x > width) continue;
      cells.push({ x, y, w: brickW, h: brickH, row: r, col: c });
    }
  }

  // Find the cell nearest the visual center to reserve for the logged-in
  // warrior's name.
  const cx = width / 2;
  const cy = topReserve + availH / 2;
  let centerIdx = 0;
  let bestDist = Infinity;
  cells.forEach((cell, i) => {
    const mx = cell.x + cell.w / 2;
    const my = cell.y + cell.h / 2;
    const d = (mx - cx) ** 2 + (my - cy) ** 2;
    if (d < bestDist) {
      bestDist = d;
      centerIdx = i;
    }
  });

  return { cells, centerIdx, brickW, brickH, gap, rows, cols };
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fitFontSize(ctx, text, maxWidth, startSize, minSize, bold) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${bold ? "700" : "500"} ${size}px ${DISPLAY_FONT}`;
    if (ctx.measureText(text.toUpperCase()).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function drawShield(ctx, cx, cy, size, fill, stroke) {
  const w = size;
  const h = size * 1.15;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - h / 2);
  ctx.bezierCurveTo(cx + w / 2, cy - h / 2, cx + w / 2, cy - h / 8, cx + w / 2, cy);
  ctx.bezierCurveTo(cx + w / 2, cy + h / 3, cx + w / 6, cy + h / 2, cx, cy + h / 2);
  ctx.bezierCurveTo(cx - w / 6, cy + h / 2, cx - w / 2, cy + h / 3, cx - w / 2, cy);
  ctx.bezierCurveTo(cx - w / 2, cy - h / 8, cx - w / 2, cy - h / 2, cx, cy - h / 2);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = Math.max(1, size * 0.08);
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// OurMembersPage — Wall of Warriors
// ---------------------------------------------------------------------------
export default function OurMembersPage({
  maxWords = 260,
  minWords = 40,
  sampleRatio = 0.05,
  minFontPx = 11,
  maxFontPx = 20,
  registerHref = "/register",
  onRegister,
  headerOffset = 0,
  currentUserName = null, // the logged-in warrior's display name, if any
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const namePoolRef = useRef([]); // fetched names, excluding currentUserName
  const sizeRef = useRef({ w: 0, h: 0 });

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [totalCount, setTotalCount] = useState(null);
  const [shownCount, setShownCount] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fetchCount = useCallback(async () => {
    const res = await fetch(`${API}/profiles-directory/count`);
    if (!res.ok) throw new Error(`Count request failed (${res.status})`);
    const data = await res.json();
    return data.count;
  }, []);

  const fetchSample = useCallback(async (sampleSize) => {
    const res = await fetch(
      `${API}/profiles-directory/sample?limit=${sampleSize}`
    );
    if (!res.ok) throw new Error(`Sample request failed (${res.status})`);
    return res.json();
  }, []);

  const handleRegisterClick = useCallback(() => {
    if (onRegister) {
      onRegister();
      return;
    }
    if (typeof window !== "undefined") {
      window.location.href = registerHref;
    }
  }, [onRegister, registerHref]);

  // -------------------------------------------------------------------------
  // Draw the full wall: mortar bed, every brick's bevel + stone texture,
  // and every engraved name. Called on layout, resize, and shuffle — no
  // continuous animation loop, since a wall of bricks should feel solid,
  // not drifting.
  // -------------------------------------------------------------------------
  const drawWall = useCallback(
    (names, width, height, topReserve) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Mortar bed
      ctx.fillStyle = PALETTE.mortar;
      ctx.fillRect(0, 0, width, height);

      const { cells, centerIdx, brickW, brickH } = computeBrickGrid(
        width,
        height,
        topReserve
      );

      // Build the assignment: center cell reserved for the logged-in
      // warrior (if any); the rest filled with the shuffled name pool.
      const pool = [...names];
      const assignment = new Array(cells.length).fill(null);
      let poolIdx = 0;
      cells.forEach((_, i) => {
        if (currentUserName && i === centerIdx) return; // filled below
        if (poolIdx < pool.length) {
          assignment[i] = pool[poolIdx++];
        }
      });
      if (currentUserName) assignment[centerIdx] = currentUserName;

      const r = Math.round(brickH * 0.16);

      cells.forEach((cell, i) => {
        const isYou = currentUserName && i === centerIdx;
        const rand = mulberry32(cell.row * 9973 + cell.col * 613 + 17);
        const tint = (rand() - 0.5) * 14;

        const { x, y, w, h } = cell;

        // Brick body — subtle bevel gradient
        const grad = ctx.createLinearGradient(x, y, x + w, y + h);
        if (isYou) {
          grad.addColorStop(0, "#3A2E14");
          grad.addColorStop(0.5, PALETTE.goldDeep);
          grad.addColorStop(1, "#2A2010");
        } else {
          grad.addColorStop(0, shadeColor(PALETTE.brickLight, tint));
          grad.addColorStop(0.55, shadeColor(PALETTE.brickBase, tint));
          grad.addColorStop(1, PALETTE.brickShadow);
        }
        roundRect(ctx, x, y, w, h, r);
        ctx.fillStyle = grad;
        ctx.fill();

        // Fine stone speckle texture
        ctx.save();
        roundRect(ctx, x, y, w, h, r);
        ctx.clip();
        for (let s = 0; s < 5; s++) {
          const sx = x + rand() * w;
          const sy = y + rand() * h;
          ctx.fillStyle = `rgba(0,0,0,${0.08 + rand() * 0.08})`;
          ctx.fillRect(sx, sy, 1.4, 1.4);
        }
        ctx.restore();

        // Top-left bevel highlight edge
        ctx.save();
        roundRect(ctx, x, y, w, h, r);
        ctx.clip();
        ctx.strokeStyle = isYou
          ? "rgba(255,224,160,0.35)"
          : "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x + 2, y + h - 2);
        ctx.lineTo(x + 2, y + 2);
        ctx.lineTo(x + w - 2, y + 2);
        ctx.stroke();
        ctx.restore();

        // Gold outline ring for the logged-in warrior's brick
        if (isYou) {
          roundRect(ctx, x + 1.5, y + 1.5, w - 3, h - 3, r);
          ctx.strokeStyle = PALETTE.gold;
          ctx.lineWidth = 2;
          ctx.shadowColor = "rgba(217,138,52,0.55)";
          ctx.shadowBlur = 10;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // Engraved name
        const name = assignment[i];
        if (name) {
          const maxTextW = w - (isYou ? 22 : 14);
          const startSize = isYou
            ? maxFontPx + 3
            : minFontPx + ((maxFontPx - minFontPx) * (0.4 + rand() * 0.6));
          const size = fitFontSize(
            ctx,
            name,
            maxTextW,
            Math.min(startSize, h * 0.5),
            9,
            !!isYou
          );
          ctx.font = `${isYou ? "700" : "500"} ${size}px ${DISPLAY_FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const tx = x + w / 2 + (isYou ? 6 : 0);
          const ty = y + h / 2 + 1;
          const label = name.toUpperCase();

          // Engraved effect: dark incised shadow, light emboss edge, fill
          ctx.fillStyle = "rgba(0,0,0,0.55)";
          ctx.fillText(label, tx + 1, ty + 1.4);
          ctx.fillStyle = isYou
            ? "rgba(255,236,196,0.5)"
            : "rgba(255,255,255,0.18)";
          ctx.fillText(label, tx - 0.8, ty - 0.8);
          ctx.fillStyle = isYou ? "#FFF3D9" : PALETTE.parchment;
          if (isYou) {
            ctx.shadowColor = "rgba(255,178,90,0.6)";
            ctx.shadowBlur = 6;
          }
          ctx.fillText(label, tx, ty);
          ctx.shadowBlur = 0;

          if (isYou) {
            drawShield(ctx, x + 13, y + h / 2, h * 0.42, "#C89A4A", "#3A2A0F");
          }
        } else {
          // Blank brick: faint carved dashes, awaiting the next warrior
          ctx.strokeStyle = "rgba(233,222,194,0.10)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x + w * 0.32, y + h / 2);
          ctx.lineTo(x + w * 0.68, y + h / 2);
          ctx.stroke();
        }
      });

      setShownCount(assignment.filter(Boolean).length - (currentUserName ? 1 : 0));
    },
    [currentUserName, maxFontPx, minFontPx]
  );

  const relayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    sizeRef.current = { w, h };
    const mobile = w < 640;
    setIsMobile(mobile);
    const topReserve = Math.max(150, Math.min(220, h * 0.32));
    const stripW = mobile ? JOIN_STRIP_WIDTH_MOBILE : JOIN_STRIP_WIDTH;
    drawWall(namePoolRef.current, Math.max(0, w - stripW), h, topReserve);
  }, [drawWall]);

  const load = useCallback(
    async (isStale) => {
      setStatus("loading");
      setErrorMsg("");
      try {
        const total = await fetchCount();
        if (isStale()) return;
        setTotalCount(total);

        const sampleSize = Math.min(
          maxWords,
          Math.max(minWords, Math.round(total * sampleRatio))
        );

        const rows = await fetchSample(sampleSize);
        if (isStale()) return;

        const lowerYou = (currentUserName || "").trim().toLowerCase();
        const names = shuffleArray(
          rows
            .map((row) => (row.full_name || "").toString().trim())
            .filter((n) => n && n.toLowerCase() !== lowerYou)
        );

        namePoolRef.current = names;
        if (isStale()) return;
        setStatus("ready");
        relayout();
      } catch (err) {
        if (isStale()) return;
        console.error("OurMembersPage load error:", err);
        setStatus("error");
        setErrorMsg(err.message || "The wall could not be raised.");
      }
    },
    [fetchCount, fetchSample, maxWords, minWords, sampleRatio, currentUserName, relayout]
  );

  useEffect(() => {
    let stale = false;
    load(() => stale);
    return () => {
      stale = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(relayout, 200);
    });
    observer.observe(container);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, [relayout]);

  const handleShuffle = useCallback(() => {
    if (status === "loading") return;
    setIsShuffling(true);
    namePoolRef.current = shuffleArray(namePoolRef.current);
    window.setTimeout(() => {
      relayout();
      setIsShuffling(false);
    }, 180);
    // Occasionally pull a fresh sample from the server too, so the wall
    // isn't limited to the first batch fetched.
    setNonce((n) => n + 1);
  }, [status, relayout]);

  const stripW = isMobile ? JOIN_STRIP_WIDTH_MOBILE : JOIN_STRIP_WIDTH;

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        marginTop: headerOffset,
        height: `calc(100vh - ${headerOffset}px)`,
        overflow: "hidden",
        fontFamily: UI_FONT,
        color: PALETTE.text,
        background: PALETTE.bgDeep,
        zIndex: 0,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&display=swap');
        @keyframes wow-ember-pulse {
          0%, 100% { box-shadow: 0 0 14px 2px rgba(217,138,52,0.45), inset 0 0 18px rgba(217,138,52,0.25); }
          50% { box-shadow: 0 0 26px 6px rgba(255,178,90,0.65), inset 0 0 24px rgba(255,178,90,0.35); }
        }
        @keyframes wow-flicker {
          0%, 100% { opacity: 0.9; }
          45% { opacity: 1; }
          50% { opacity: 0.75; }
          55% { opacity: 1; }
        }
        .wow-canvas-wrap { transition: opacity 0.18s ease; }
        .wow-join-btn { animation: wow-ember-pulse 2.6s ease-in-out infinite; }
        .wow-flame { animation: wow-flicker 2.2s ease-in-out infinite; }
      `}</style>

      {/* Header row */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: stripW,
          zIndex: 1000,
          padding: "28px 24px 0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 320px", minWidth: 240 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: PALETTE.emberBright,
              marginBottom: 14,
              padding: "0.28rem 0.9rem",
              borderRadius: 3,
              border: `1px solid rgba(217,138,52,0.45)`,
              background: "rgba(217,138,52,0.08)",
            }}
          >
            <Flame size={12} className="wow-flame" />
            Hall of Warriors
          </div>
          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: "clamp(28px, 4.6vw, 46px)",
              fontWeight: 700,
              letterSpacing: "0.02em",
              margin: "0 0 10px",
              lineHeight: 1.08,
              color: PALETTE.text,
              textShadow: "0 2px 0 #000, 0 0 18px rgba(217,138,52,0.25)",
            }}
          >
            Wall of Warriors
          </h1>
          <p
            style={{
              color: PALETTE.subtext,
              fontSize: 15,
              maxWidth: 540,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Every name struck into this stone belongs to a fighter who never
            gave up. Shuffle the wall to meet more of the guild.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: PALETTE.steel,
              fontSize: 13,
              marginTop: 14,
            }}
          >
            <Users size={14} />
            {totalCount !== null ? (
              <span>
                <strong style={{ color: PALETTE.text }}>
                  {shownCount.toLocaleString()}
                </strong>{" "}
                of{" "}
                <strong style={{ color: PALETTE.text }}>
                  {totalCount.toLocaleString()}
                </strong>{" "}
                names on the wall
              </span>
            ) : (
              <span>Raising the wall…</span>
            )}
          </div>
        </div>

        <button
          onClick={handleShuffle}
          disabled={status === "loading"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            background: "rgba(154,166,172,0.10)",
            border: `1.5px solid ${PALETTE.steel}`,
            color: PALETTE.steel,
            borderRadius: 4,
            padding: "9px 18px",
            fontSize: 13,
            fontFamily: UI_FONT,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            cursor: status === "loading" ? "default" : "pointer",
            opacity: status === "loading" ? 0.6 : 1,
            whiteSpace: "nowrap",
            marginTop: 4,
            transition: "background 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(154,166,172,0.2)";
            e.currentTarget.style.color = PALETTE.text;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(154,166,172,0.10)";
            e.currentTarget.style.color = PALETTE.steel;
          }}
        >
          {status === "loading" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Swords size={15} />
          )}
          Shuffle
        </button>
      </div>

      {/* The wall */}
      <div
        className="wow-canvas-wrap"
        style={{
          position: "absolute",
          inset: 0,
          right: stripW,
          opacity: isShuffling ? 0.35 : 1,
        }}
      >
        <canvas ref={canvasRef} style={{ display: "block" }} />
      </div>

      {/* Right-side glowing "Become a Member" brick column */}
      <button
        onClick={handleRegisterClick}
        className="wow-join-btn"
        aria-label="Become a member"
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: stripW,
          zIndex: 1000,
          border: "none",
          borderLeft: `2px solid ${PALETTE.ember}`,
          background:
            "linear-gradient(180deg, #3A2410 0%, #2A1A0C 50%, #3A2410 100%)",
          color: PALETTE.emberBright,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "18px 8px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(180deg, #4A2E12 0%, #34210E 50%, #4A2E12 100%)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            "linear-gradient(180deg, #3A2410 0%, #2A1A0C 50%, #3A2410 100%)";
        }}
      >
        <ShieldPlus size={isMobile ? 18 : 22} />
        <span
          style={{
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: isMobile ? 12 : 14,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            textShadow: "0 0 10px rgba(255,178,90,0.6)",
          }}
        >
          Become a Member
        </span>
      </button>

      {status === "error" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            color: PALETTE.text,
            fontSize: 14,
            background: "rgba(23,19,16,0.92)",
          }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
}