import React, { useCallback, useEffect, useRef, useState } from "react";
import { Shuffle, Swords, Heart, Users, Loader2 } from "lucide-react";

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
const API = import.meta.env.VITE_API_URL;

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const PALETTE = {
  page: "#F7F4EE",          // warm, easy-on-the-eyes neutral behind everything
  woodDark: "#6E4222",
  woodMid: "#8C5A30",
  woodLight: "#B47F44",
  green: "#4CB784",         // soft sage-emerald, easy on the eyes
  greenDeep: "#2F8F63",
  blue: "#00BFFF",
  blueDeep: "#0091D6",
  navy: "#4A3826",          // engraved name text — warm brown, matches wood
  navySoft: "#8A7660",
  white: "#FFFFFF",
};

const BRICK_TONES = ["#F6EEDD", "#F1E6D2", "#F8F1E4", "#EFE4CE", "#F4EDDD"];

const DISPLAY_FONT = '"Cinzel", Georgia, "Times New Roman", serif';
const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

// ---------------------------------------------------------------------------
// Seeded PRNG so brick texture stays stable between non-shuffle redraws.
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

function computeBrickGrid(width, height) {
  const scale = Math.max(0.72, Math.min(1.25, width / 1400));
  const brickW = 140 * scale;
  const brickH = 50 * scale;
  const gap = 7 * scale;

  const rows = Math.max(1, Math.floor((height + gap) / (brickH + gap)));
  const cols = Math.max(1, Math.floor((width + gap) / (brickW + gap)));

  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * (brickW + gap);
      const y = r * (brickH + gap);
      cells.push({ x, y, w: brickW, h: brickH, row: r, col: c });
    }
  }
  return { cells, brickW, brickH, rows, cols };
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fitFontSize(ctx, text, maxWidth, startSize, minSize) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `700 ${size}px ${UI_FONT}`;
    if (ctx.measureText(text.toUpperCase()).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------------------------------------------------------------------------
// OurMembersPage — wall of names with a woody/warrior header bar
// ---------------------------------------------------------------------------
export default function OurMembersPage({
  maxWords = 260,
  minWords = 40,
  sampleRatio = 0.05,
  minFontPx = 11,
  maxFontPx = 16,
  registerHref = "/register",
  onRegister,
  onBecomeWarrior,
  headerOffset = 0,
  currentUserName = null, // logged-in member's display name
}) {
  const containerRef = useRef(null);
  const wallRef = useRef(null);
  const canvasRef = useRef(null);
  const namePoolRef = useRef([]);

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [totalCount, setTotalCount] = useState(null);
  const [shownCount, setShownCount] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [youRect, setYouRect] = useState(null);

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

  const handleWarriorClick = useCallback(() => {
    if (onBecomeWarrior) {
      onBecomeWarrior();
      return;
    }
    handleRegisterClick();
  }, [onBecomeWarrior, handleRegisterClick]);

  // -------------------------------------------------------------------------
  // Draw the wall. The logged-in user's cell is left blank on canvas — its
  // name is rendered as a glowing DOM overlay instead, so it can pulse.
  // -------------------------------------------------------------------------
  const drawWall = useCallback(
    (names, width, height) => {
      const canvas = canvasRef.current;
      if (!canvas || width <= 0 || height <= 0) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const { cells } = computeBrickGrid(width, height);
      const pool = [...names];
      let nextYouRect = null;

      cells.forEach((cell, i) => {
        const { x, y, w, h } = cell;
        const r = Math.round(h * 0.22);
        const rand = mulberry32(cell.row * 9973 + cell.col * 613 + 17);
        const tone = BRICK_TONES[Math.floor(rand() * BRICK_TONES.length)];

        const name = pool[i];
        const isYou =
          currentUserName &&
          name &&
          name.trim().toLowerCase() === currentUserName.trim().toLowerCase();

        // Brick fill
        roundRect(ctx, x, y, w, h, r);
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(1, tone);
        ctx.fillStyle = grad;
        ctx.fill();

        roundRect(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r);
        ctx.strokeStyle = "rgba(74,56,38,0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();

        if (isYou) {
          nextYouRect = { x, y, w, h, name };
          return; // name rendered by the glowing overlay instead
        }

        if (name) {
          const maxTextW = w - 14;
          const size = fitFontSize(
            ctx,
            name,
            maxTextW,
            Math.min(maxFontPx, h * 0.4),
            minFontPx
          );
          ctx.font = `700 ${size}px ${UI_FONT}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = PALETTE.navy;
          ctx.fillText(name.toUpperCase(), x + w / 2, y + h / 2 + 1);
        }
      });

      setYouRect(nextYouRect);
      setShownCount(pool.filter(Boolean).length);
    },
    [currentUserName, maxFontPx, minFontPx]
  );

  const relayout = useCallback(() => {
    const wall = wallRef.current;
    if (!wall) return;
    drawWall(namePoolRef.current, wall.clientWidth, wall.clientHeight);
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

        const names = shuffleArray(
          rows
            .map((row) => (row.full_name || "").toString().trim())
            .filter(Boolean)
        );

        namePoolRef.current = names;
        if (isStale()) return;
        setStatus("ready");
        relayout();
      } catch (err) {
        if (isStale()) return;
        console.error("OurMembersPage load error:", err);
        setStatus("error");
        setErrorMsg(err.message || "The wall could not be loaded.");
      }
    },
    [fetchCount, fetchSample, maxWords, minWords, sampleRatio, relayout]
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
    const wall = wallRef.current;
    if (!wall) return;
    let timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(relayout, 200);
    });
    observer.observe(wall);
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
    }, 160);
    setNonce((n) => n + 1);
  }, [status, relayout]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        marginTop: headerOffset,
        height: `calc(100vh - ${headerOffset}px)`,
        display: "flex",
        flexDirection: "column",
        fontFamily: UI_FONT,
        color: PALETTE.navy,
        background: PALETTE.page,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&display=swap');

        .wow-shuffle-btn {
          display: flex;
          align-items: center;
          height: 48px;
          width: 48px;
          border-radius: 14px;
          border: none;
          padding: 0;
          background: linear-gradient(150deg, ${PALETTE.woodLight} 0%, ${PALETTE.woodMid} 55%, ${PALETTE.woodDark} 100%);
          box-shadow: 0 3px 10px rgba(110,66,34,0.35), inset 0 1px 0 rgba(255,255,255,0.25);
          color: #FFF3E4;
          cursor: pointer;
          overflow: hidden;
          transition: width 0.28s ease;
          flex-shrink: 0;
        }
        .wow-shuffle-btn:hover { width: 138px; }
        .wow-shuffle-btn:disabled { opacity: 0.65; cursor: default; }
        .wow-shuffle-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .wow-shuffle-label {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          white-space: nowrap;
          opacity: 0;
          transition: opacity 0.18s ease 0.08s;
        }
        .wow-shuffle-btn:hover .wow-shuffle-label { opacity: 1; }

        @keyframes wow-you-pulse {
          0%, 100% { box-shadow: 0 0 10px 1px rgba(0,191,255,0.45), inset 0 0 8px rgba(0,191,255,0.25); }
          50% { box-shadow: 0 0 20px 5px rgba(0,191,255,0.75), inset 0 0 14px rgba(0,191,255,0.4); }
        }
        .wow-you-glow { animation: wow-you-pulse 2s ease-in-out infinite; }
        .wow-wall-wrap { transition: opacity 0.16s ease; }
      `}</style>

      {/* Header bar: shuffle | become a warrior | become a member */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "18px 20px",
          flexWrap: "wrap",
        }}
      >
        <button
          className="wow-shuffle-btn"
          onClick={handleShuffle}
          disabled={status === "loading"}
          aria-label="Shuffle names"
          title="Shuffle"
        >
          <span className="wow-shuffle-icon">
            {status === "loading" ? (
              <Loader2 size={19} className="animate-spin" />
            ) : (
              <Shuffle size={19} />
            )}
          </span>
          <span className="wow-shuffle-label">Shuffle</span>
        </button>

        <button
          onClick={handleWarriorClick}
          style={{
            flex: "1 1 260px",
            minWidth: 200,
            height: 48,
            border: "none",
            borderRadius: 14,
            background: `linear-gradient(135deg, ${PALETTE.green} 0%, ${PALETTE.greenDeep} 100%)`,
            color: "#FFFFFF",
            fontFamily: DISPLAY_FONT,
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: "0.04em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            boxShadow: "0 3px 12px rgba(47,143,99,0.35)",
          }}
        >
          <Swords size={18} />
          Become a Warrior
        </button>

        <button
          onClick={handleRegisterClick}
          style={{
            height: 48,
            padding: "0 22px",
            border: "none",
            borderRadius: 999,
            background: `linear-gradient(135deg, ${PALETTE.blue} 0%, ${PALETTE.blueDeep} 100%)`,
            color: "#FFFFFF",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.02em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            whiteSpace: "nowrap",
            boxShadow: "0 3px 12px rgba(0,145,214,0.4)",
            flexShrink: 0,
          }}
        >
          <Heart size={16} fill="#FFFFFF" />
          Become a Member
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 20px 12px",
          fontSize: 12.5,
          color: PALETTE.navySoft,
        }}
      >
        <Users size={13} />
        {totalCount !== null ? (
          <span>
            <strong style={{ color: PALETTE.navy }}>
              {shownCount.toLocaleString()}
            </strong>{" "}
            of{" "}
            <strong style={{ color: PALETTE.navy }}>
              {totalCount.toLocaleString()}
            </strong>{" "}
            names on the wall
          </span>
        ) : (
          <span>Building the wall…</span>
        )}
      </div>

      {/* Wall */}
      <div
        ref={wallRef}
        className="wow-wall-wrap"
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          margin: "0 20px 20px",
          borderRadius: 18,
          overflow: "hidden",
          background: "#FFFFFF",
          boxShadow: "inset 0 0 0 1px rgba(74,56,38,0.08)",
          opacity: isShuffling ? 0.35 : 1,
        }}
      >
        <canvas ref={canvasRef} style={{ display: "block" }} />

        {youRect && (
          <div
            className="wow-you-glow"
            style={{
              position: "absolute",
              left: youRect.x,
              top: youRect.y,
              width: youRect.w,
              height: youRect.h,
              borderRadius: Math.round(youRect.h * 0.22),
              border: `2px solid ${PALETTE.blue}`,
              background: "rgba(0,191,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                fontWeight: 800,
                fontSize: Math.min(16, youRect.h * 0.32),
                letterSpacing: "0.03em",
                color: PALETTE.blueDeep,
                textShadow: "0 0 8px rgba(0,191,255,0.55)",
                textTransform: "uppercase",
                padding: "0 6px",
                textAlign: "center",
              }}
            >
              {youRect.name}
            </span>
          </div>
        )}

        {status === "error" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              textAlign: "center",
              color: PALETTE.navy,
              fontSize: 14,
              background: "rgba(247,244,238,0.95)",
            }}
          >
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}