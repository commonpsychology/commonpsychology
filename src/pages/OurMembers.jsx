import React, { useCallback, useEffect, useRef, useState } from "react";
import { Shuffle, Users, Loader2, UserPlus, Shield, Heart, Star } from "lucide-react";

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
const API = import.meta.env.VITE_API_URL;

// ---------------------------------------------------------------------------
// Palette — bluish-white glow, accent locked to the requested #00BFFF.
// ---------------------------------------------------------------------------
const PALETTE = {
  glow: "#00BFFF",              // required accent
  glowSoft: "rgba(0,191,255,0.35)",
  bgTop: "#EAF6FE",             // page gradient — white to sky blue
  bgBottom: "#CFEBFB",
  navy: "#123A63",              // heading / engraved text
  navySoft: "#3E6690",
  card: "#1670C9",              // sidebar panel base
  cardDeep: "#0E4F9E",
  white: "#FFFFFF",
};

const BRICK_TONES = ["#F6EFE2", "#ECEAF7", "#E3F4FC", "#F8E9EE", "#EDF6EC"];

const DISPLAY_FONT = '"Playfair Display", Georgia, "Times New Roman", serif';
const SCRIPT_FONT = '"Dancing Script", "Brush Script MT", cursive';
const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

// Reserved space (px) below the wall canvas for the floating action bar.
const BOTTOM_RESERVE = 88;

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

// ---------------------------------------------------------------------------
// Build a brick grid sized and CENTERED for the actual number of names we
// have — instead of always tiling the full container (which used to leave a
// huge trailing block of empty bricks when the member count was small).
// ---------------------------------------------------------------------------
function computeBrickGrid(width, height, topReserve, bottomReserve, count) {
  const availW = Math.max(50, width);
  const availH = Math.max(50, height - topReserve - bottomReserve);
  const n = Math.max(1, count);
  const gap = 10;

  // Pick a column count that roughly matches the container's aspect ratio.
  let cols = Math.max(1, Math.round(Math.sqrt((n * availW) / availH)));
  let rows = Math.max(1, Math.ceil(n / cols));

  // Brick size that fills the chosen grid, clamped to a pleasant range so a
  // handful of names read as "up close" instead of tiny and scattered.
  const rawW = (availW - gap * (cols - 1)) / cols;
  const rawH = (availH - gap * (rows - 1)) / rows;
  let brickW = Math.max(90, Math.min(230, rawW));
  let brickH = Math.max(34, Math.min(84, brickW * 0.34, rawH));
  brickW = Math.min(brickW, rawW);

  const gridW = cols * brickW + (cols - 1) * gap;
  const gridH = rows * brickH + (rows - 1) * gap;
  const offsetX = (width - gridW) / 2;
  const offsetY = topReserve + Math.max(0, availH - gridH) / 2;

  const cells = [];
  let idx = 0;
  outer: for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (idx >= n) break outer;
      const x = offsetX + c * (brickW + gap);
      const y = offsetY + r * (brickH + gap);
      cells.push({ x, y, w: brickW, h: brickH, row: r, col: c });
      idx++;
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
// OurMembersPage — Wall of Names
// ---------------------------------------------------------------------------
export default function OurMembersPage({
  maxWords = 260,
  minWords = 40,
  sampleRatio = 0.05,
  minFontPx = 11,
  maxFontPx = 16,
  registerHref = "/register",
  onRegister,
  headerOffset = 0,
  currentUserName = null, // logged-in member's display name
}) {
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const canvasRef = useRef(null);
  const namePoolRef = useRef([]);

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [totalCount, setTotalCount] = useState(null);
  const [shownCount, setShownCount] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

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
  // Draw the wall of bricks — exactly one brick per name, centered.
  // -------------------------------------------------------------------------
  const drawWall = useCallback(
    (names, width, height, topReserve, bottomReserve) => {
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

      const pool = [...names];
      const { cells, brickH } = computeBrickGrid(
        width,
        height,
        topReserve,
        bottomReserve,
        Math.max(1, pool.length)
      );

      const r = Math.round(brickH * 0.22);

      cells.forEach((cell, i) => {
        const { x, y, w, h } = cell;
        const name = pool[i];
        if (!name) return;

        const rand = mulberry32(cell.row * 9973 + cell.col * 613 + 17);
        const tone = BRICK_TONES[Math.floor(rand() * BRICK_TONES.length)];
        const isYou =
          currentUserName &&
          name.trim().toLowerCase() === currentUserName.trim().toLowerCase();

        // Brick fill
        roundRect(ctx, x, y, w, h, r);
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, "#FFFFFF");
        grad.addColorStop(1, tone);
        ctx.fillStyle = grad;
        ctx.fill();

        // Subtle border
        roundRect(ctx, x + 0.75, y + 0.75, w - 1.5, h - 1.5, r);
        ctx.strokeStyle = isYou ? PALETTE.glow : "rgba(18,58,99,0.10)";
        ctx.lineWidth = isYou ? 2 : 1;
        if (isYou) {
          ctx.shadowColor = PALETTE.glowSoft;
          ctx.shadowBlur = 12;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Name
        const maxTextW = w - 14;
        const size = fitFontSize(
          ctx,
          name,
          maxTextW,
          Math.min(maxFontPx, h * 0.4),
          minFontPx
        );
        ctx.font = `${isYou ? "800" : "700"} ${size}px ${UI_FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isYou ? PALETTE.card : PALETTE.navy;
        ctx.fillText(name.toUpperCase(), x + w / 2, y + h / 2 + 1);
      });

      setShownCount(pool.filter(Boolean).length);
    },
    [currentUserName, maxFontPx, minFontPx]
  );

  const relayout = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    const narrow = w < 860;
    setIsNarrow(narrow);

    const headerH = headerRef.current ? headerRef.current.offsetHeight : 0;

    const wallW = narrow ? w : w - 300;
    // Subtract the header's real rendered height so the canvas never grows
    // taller than what's actually left in the viewport (this was the cause
    // of the wall trailing off far past the visible area).
    const wallH = narrow
      ? Math.max(280, h * 0.55)
      : Math.max(320, h - headerH);

    const topReserve = narrow ? Math.max(20, Math.min(48, wallH * 0.12)) : 24;
    drawWall(namePoolRef.current, wallW, wallH, topReserve, BOTTOM_RESERVE);
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
    }, 160);
    setNonce((n) => n + 1);
  }, [status, relayout]);

  const benefits = [
    { icon: Shield, text: "Your trust inspires us." },
    { icon: Users, text: "Your support strengthens us." },
    { icon: Star, text: "Your presence matters." },
    { icon: Heart, text: "You are part of our story." },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        marginTop: headerOffset,
        height: `calc(100vh - ${headerOffset}px)`,
        overflowY: "auto",
        overflowX: "hidden",
        fontFamily: UI_FONT,
        color: PALETTE.navy,
        background: `linear-gradient(180deg, ${PALETTE.bgTop} 0%, ${PALETTE.bgBottom} 100%)`,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Dancing+Script:wght@600&display=swap');
        @keyframes wow-glow-pulse {
          0%, 100% { box-shadow: 0 0 14px 2px ${PALETTE.glowSoft}, inset 0 0 12px rgba(0,191,255,0.25); }
          50% { box-shadow: 0 0 26px 6px rgba(0,191,255,0.55), inset 0 0 18px rgba(0,191,255,0.4); }
        }
        .wow-canvas-wrap { transition: opacity 0.16s ease; }
        .wow-glow { animation: wow-glow-pulse 2.4s ease-in-out infinite; }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: isNarrow ? "column" : "row",
          height: isNarrow ? "auto" : "100%",
          minHeight: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Left: header + wall + bottom action bar */}
        <div
          style={{
            flex: 1,
            position: "relative",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            ref={headerRef}
            style={{
              textAlign: "center",
              padding: "28px 24px 10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
              }}
            >
              <LeafOrnament flip={false} />
              <h1
                style={{
                  fontFamily: DISPLAY_FONT,
                  fontWeight: 800,
                  fontSize: "clamp(28px, 4vw, 44px)",
                  letterSpacing: "0.03em",
                  color: PALETTE.navy,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                Wall of Names
              </h1>
              <LeafOrnament flip={true} />
            </div>
            <p
              style={{
                marginTop: 6,
                fontSize: 13,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: PALETTE.navySoft,
              }}
            >
              To respect. To appreciate. Together we grow.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                margin: "12px auto 0",
                maxWidth: 420,
              }}
            >
              <span style={{ flex: 1, height: 1, background: "rgba(18,58,99,0.18)" }} />
              <Heart size={13} color={PALETTE.glow} fill={PALETTE.glow} />
              <span style={{ flex: 1, height: 1, background: "rgba(18,58,99,0.18)" }} />
            </div>
            <p
              style={{
                fontStyle: "italic",
                color: PALETTE.navySoft,
                fontSize: 14,
                marginTop: 8,
              }}
            >
              Every name here is a part of our journey and our purpose.
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 6,
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
                  names shown
                </span>
              ) : (
                <span>Building the wall…</span>
              )}
            </div>
          </div>

          {/* Wall */}
          <div
            className="wow-canvas-wrap"
            style={{
              position: "relative",
              width: "100%",
              flex: isNarrow ? "none" : 1,
              height: isNarrow ? "55vh" : "auto",
              minHeight: 280,
              opacity: isShuffling ? 0.35 : 1,
            }}
          >
            <canvas ref={canvasRef} style={{ display: "block" }} />
          </div>

          {/* Bottom action bar — sits inside the reserved gap at canvas bottom */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "0 24px 28px",
              marginTop: isNarrow ? 12 : -BOTTOM_RESERVE,
              position: "relative",
              zIndex: 5,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "stretch",
                background: "rgba(255,255,255,0.85)",
                border: `1px solid ${PALETTE.glowSoft}`,
                boxShadow: "0 8px 28px rgba(18,58,99,0.14)",
                borderRadius: 16,
                overflow: "hidden",
                backdropFilter: "blur(6px)",
              }}
            >
              <ActionCell
                icon={
                  status === "loading" ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Shuffle size={17} />
                  )
                }
                title="Shuffle Names"
                subtitle="Celebrate everyone equally. Click to shuffle the wall."
                onClick={handleShuffle}
                disabled={status === "loading"}
              />
              <div style={{ width: 1, background: "rgba(18,58,99,0.12)" }} />
              <ActionCell
                icon={<UserPlus size={17} />}
                title="Be a Member"
                subtitle="Join our family and add your name to the wall."
                onClick={handleRegisterClick}
              />
            </div>
          </div>

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
                color: PALETTE.navy,
                fontSize: 14,
                background: "rgba(234,246,254,0.95)",
              }}
            >
              {errorMsg}
            </div>
          )}
        </div>

        {/* Right: member card — fills the full column height, card centered in it */}
        <div
          style={{
            width: isNarrow ? "100%" : 300,
            flexShrink: 0,
            boxSizing: "border-box",
            padding: isNarrow ? "0 20px 28px" : "28px 22px",
            display: "flex",
            alignItems: isNarrow ? "flex-start" : "center",
            justifyContent: "center",
            height: isNarrow ? "auto" : "100%",
          }}
        >
          <div
            style={{
              width: "100%",
              borderRadius: 20,
              padding: "26px 22px 22px",
              background: `linear-gradient(160deg, ${PALETTE.card} 0%, ${PALETTE.cardDeep} 100%)`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.15) inset, 0 14px 34px rgba(14,79,158,0.35)`,
              color: PALETTE.white,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: SCRIPT_FONT,
                fontSize: 30,
                lineHeight: 1,
              }}
            >
              Thank you
            </div>
            <div
              style={{
                fontSize: 12.5,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                opacity: 0.85,
                marginTop: 8,
              }}
            >
              For being a part of us
            </div>

            <div
              style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div
                style={{
                  fontSize: 11.5,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  opacity: 0.85,
                  marginBottom: 10,
                }}
              >
                ★ Our Member ★
              </div>
              <div
                className={currentUserName ? "wow-glow" : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "rgba(0,191,255,0.18)",
                  border: `1.5px solid ${PALETTE.glow}`,
                  borderRadius: 10,
                  padding: "12px 10px",
                }}
              >
                <Users size={16} color={PALETTE.white} />
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {currentUserName || "Sign in"}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 18, textAlign: "left" }}>
              {benefits.map(({ icon: Icon, text }, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "7px 0",
                    borderBottom:
                      i < benefits.length - 1
                        ? "1px dashed rgba(255,255,255,0.18)"
                        : "none",
                    fontSize: 13,
                    opacity: 0.95,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={11} />
                  </span>
                  {text}
                </div>
              ))}
            </div>

            <button
              onClick={handleRegisterClick}
              className="wow-glow"
              style={{
                marginTop: 20,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "rgba(0,191,255,0.22)",
                border: `1.5px solid ${PALETTE.glow}`,
                borderRadius: 10,
                color: PALETTE.white,
                fontWeight: 800,
                fontSize: 13.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <UserPlus size={16} />
              Become Member
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// small presentational pieces
// ---------------------------------------------------------------------------
function ActionCell({ icon, title, subtitle, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 20px",
        background: "transparent",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        textAlign: "left",
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: PALETTE.glow,
          color: PALETTE.white,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 0 10px ${PALETTE.glowSoft}`,
        }}
      >
        {icon}
      </span>
      <span>
        <div style={{ fontWeight: 700, fontSize: 13.5, color: PALETTE.navy }}>
          {title}
        </div>
        <div style={{ fontSize: 11.5, color: PALETTE.navySoft, maxWidth: 210 }}>
          {subtitle}
        </div>
      </span>
    </button>
  );
}

function LeafOrnament({ flip }) {
  return (
    <svg
      width="46"
      height="20"
      viewBox="0 0 46 20"
      style={{ transform: flip ? "scaleX(-1)" : "none", flexShrink: 0 }}
    >
      <path
        d="M2 10 C 14 2, 28 2, 44 10"
        stroke={PALETTE.glow}
        strokeWidth="1.4"
        fill="none"
        opacity="0.7"
      />
      {[8, 18, 28, 38].map((cx, i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={9 - (i % 2)}
          rx="4.5"
          ry="2.6"
          fill={PALETTE.glow}
          opacity={0.35 + i * 0.1}
          transform={`rotate(${-20 + i * 12} ${cx} ${9 - (i % 2)})`}
        />
      ))}
    </svg>
  );
}