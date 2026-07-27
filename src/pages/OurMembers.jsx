import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Users, Loader2, UserPlus } from "lucide-react";

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
const API = import.meta.env.VITE_API_URL;

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const PALETTE = {
  skyTop: "#0A6FA8",
  skyMid: "#1C8FC7",
  inkMuted: "#BFE9F2",
  text: "#0E3A4A",
  subtext: "#EAF9FF",
  accent: "#00BFFF",
};

const DISPLAY_FONT =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

// ---------------------------------------------------------------------------
// Layout: spiral placement over a downsampled bitmap collision grid.
// ---------------------------------------------------------------------------
function buildLayoutEngine(width, height, cellSize = 4, pad = 8) {
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid = new Uint8Array(cols * rows);

  const markOccupied = (x, y, w, h) => {
    const x0 = Math.max(0, Math.floor((x - pad) / cellSize));
    const y0 = Math.max(0, Math.floor((y - pad) / cellSize));
    const x1 = Math.min(cols - 1, Math.ceil((x + w + pad) / cellSize));
    const y1 = Math.min(rows - 1, Math.ceil((y + h + pad) / cellSize));
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        grid[gy * cols + gx] = 1;
      }
    }
  };

  const collides = (x, y, w, h) => {
    const x0 = Math.floor((x - pad) / cellSize);
    const y0 = Math.floor((y - pad) / cellSize);
    const x1 = Math.ceil((x + w + pad) / cellSize);
    const y1 = Math.ceil((y + h + pad) / cellSize);
    if (x0 < 0 || y0 < 0 || x1 >= cols || y1 >= rows) return true;
    for (let gy = y0; gy <= y1; gy++) {
      const rowBase = gy * cols;
      for (let gx = x0; gx <= x1; gx++) {
        if (grid[rowBase + gx]) return true;
      }
    }
    return false;
  };

  const place = (w, h) => {
    const cx = width / 2 - w / 2;
    const cy = height / 2 - h / 2;
    const maxR = Math.sqrt(width * width + height * height) / 1.6;
    let angle = Math.random() * Math.PI * 2;
    let radius = 0;
    const step = Math.max(2, Math.min(w, h) / 6);

    while (radius < maxR) {
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle) * 0.55;
      if (!collides(x, y, w, h)) {
        markOccupied(x, y, w, h);
        return { x, y };
      }
      angle += 0.35;
      radius += step * 0.12;
    }
    return null;
  };

  return { place, markOccupied };
}

// ---------------------------------------------------------------------------
// Build an offscreen "sprite" canvas for a single word: shadow + glow + crisp
// text baked in ONCE at layout time. This is the key perf fix — the old
// version called ctx.filter = "blur(...)" for every word, every frame,
// which is extremely expensive on the main thread (blur is not
// GPU-accelerated in most browsers) and was the cause of the animation
// jank / slow scrolling. Now each frame just does a cheap drawImage() per
// word with zero filter work.
// ---------------------------------------------------------------------------
function buildWordSprite(text, fontSize, bold, dpr) {
  const PAD = 16; // room for blur bleed + shadow offset
  const font = `${bold ? "700" : "500"} ${fontSize}px ${DISPLAY_FONT}`;

  // Measure using a throwaway context first
  const measureCanvas = document.createElement("canvas");
  const mctx = measureCanvas.getContext("2d");
  mctx.font = font;
  const metrics = mctx.measureText(text);
  const textW = metrics.width;
  const textH = fontSize * 1.2;

  const spriteW = Math.ceil(textW) + PAD * 2;
  const spriteH = Math.ceil(textH) + PAD * 2;
  // Baseline sits this far down from the sprite's top edge
  const baselineOffset = PAD + fontSize * 0.95;

  const sprite = document.createElement("canvas");
  sprite.width = Math.ceil(spriteW * dpr);
  sprite.height = Math.ceil(spriteH * dpr);
  const ctx = sprite.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.font = font;
  ctx.textBaseline = "alphabetic";

  const x = PAD;
  const y = baselineOffset;

  // Soft blurred shadow
  ctx.save();
  ctx.filter = "blur(3px)";
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#0678B3";
  ctx.fillText(text, x + 2, y + 2);
  ctx.restore();

  // Soft white glow
  ctx.save();
  ctx.filter = "blur(6px)";
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(text, x, y);
  ctx.restore();

  // Crisp white core
  ctx.globalAlpha = 1;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(text, x, y);

  return { canvas: sprite, w: spriteW, h: spriteH, padX: PAD, baselineOffset, textW };
}

// ---------------------------------------------------------------------------
// OurMembersPage
// ---------------------------------------------------------------------------
export default function OurMembersPage({
  maxWords = 260,
  minWords = 40,
  sampleRatio = 0.05,
  minFontPx = 12,
  maxFontPx = 64,
  registerHref = "/register",
  onRegister,
  headerOffset = 0, // height in px of any fixed/sticky site nav above this section
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const wordsRef = useRef([]);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [totalCount, setTotalCount] = useState(null);
  const [shownCount, setShownCount] = useState(0);
  const [nonce, setNonce] = useState(0);

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
  // Lay the words out once (spiral collision layout), pre-bake each word's
  // sprite (shadow+glow+text), and attach drift params for the animation.
  // -------------------------------------------------------------------------
  const layoutWords = useCallback(
    (rawWords, canvasWidth, canvasHeight) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);

      const n = rawWords.length;
      const densityFactor = Math.max(0.28, 1 - Math.log10(n + 1) / 5);
      const effMaxFont = Math.max(minFontPx + 4, maxFontPx * densityFactor);

      const weights = rawWords.map((w) => w.weight);
      const wMin = Math.min(...weights);
      const wMax = Math.max(...weights);
      const wRange = wMax - wMin || 1;

      const sorted = [...rawWords].sort((a, b) => b.weight - a.weight);
      const MAX_AMP_X = 14;
      const MAX_AMP_Y = 9;
      const engine = buildLayoutEngine(
        canvasWidth,
        canvasHeight,
        4,
        8 + Math.max(MAX_AMP_X, MAX_AMP_Y)
      );

      // Reserve the header/status-bar band so no word can land under the
      // title, intro paragraph, or the shuffle/register bar.
      const headerReserve = Math.max(160, Math.min(260, canvasHeight * 0.3));
      engine.markOccupied(0, 0, canvasWidth, headerReserve);

      const placed = [];
      for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i];
        const t = (item.weight - wMin) / wRange;
        const fontSize = Math.round(
          minFontPx + Math.pow(t, 0.65) * (effMaxFont - minFontPx)
        );
        const bold = i % 7 === 0;

        const sprite = buildWordSprite(item.text, fontSize, bold, dpr);
        const w = sprite.textW;
        const h = fontSize * 1.05;

        const spot = engine.place(w, h);
        if (spot) {
          placed.push({
            baseX: spot.x,
            baseY: spot.y,
            h,
            sprite,
            ampX: 4 + Math.random() * (MAX_AMP_X - 4),
            ampY: 3 + Math.random() * (MAX_AMP_Y - 3),
            speedX: 0.15 + Math.random() * 0.25,
            speedY: 0.12 + Math.random() * 0.22,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
          });
        }
      }
      wordsRef.current = placed;
      setShownCount(placed.length);
    },
    [minFontPx, maxFontPx]
  );

  // -------------------------------------------------------------------------
  // Continuous animation loop — now just a background fill + one drawImage
  // per word. No per-frame blur/filter work, so this stays cheap even with
  // ~260 words animating at once, and no longer competes with page scroll.
  // -------------------------------------------------------------------------
  const renderFrame = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (startTimeRef.current === null) startTimeRef.current = timestamp;
    const t = (timestamp - startTimeRef.current) / 1000;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { w: canvasWidth, h: canvasHeight } = sizeRef.current;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    bgGrad.addColorStop(0, PALETTE.skyTop);
    bgGrad.addColorStop(0.55, PALETTE.skyMid);
    bgGrad.addColorStop(1, PALETTE.skyTop);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const words = wordsRef.current;
    for (let i = 0; i < words.length; i++) {
      const wd = words[i];
      const s = wd.sprite;

      const xBaseline = wd.baseX + Math.sin(t * wd.speedX + wd.phaseX) * wd.ampX;
      const yBaseline =
        wd.baseY +
        Math.cos(t * wd.speedY + wd.phaseY) * wd.ampY +
        wd.h * 0.78;

      const drawX = xBaseline - s.padX;
      const drawY = yBaseline - s.baselineOffset;

      ctx.drawImage(s.canvas, drawX, drawY, s.w, s.h);
    }

    rafRef.current = requestAnimationFrame(renderFrame);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = container.clientWidth;
    const h = container.clientHeight;
    sizeRef.current = { w, h };
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
  }, []);

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

        const words = rows
          .map((r) => {
            const text = (r.full_name || "").toString().trim();
            const weight = Math.random();
            return text ? { text, weight } : null;
          })
          .filter(Boolean);

        resizeCanvas();
        layoutWords(words, sizeRef.current.w, sizeRef.current.h);
        if (isStale()) return;
        setStatus("ready");

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        startTimeRef.current = null;
        rafRef.current = requestAnimationFrame(renderFrame);
      } catch (err) {
        if (isStale()) return;
        console.error("OurMembersPage load error:", err);
        setStatus("error");
        setErrorMsg(err.message || "Something went wrong loading names.");
      }
    },
    [
      fetchCount,
      fetchSample,
      maxWords,
      minWords,
      sampleRatio,
      resizeCanvas,
      layoutWords,
      renderFrame,
    ]
  );

  useEffect(() => {
    let stale = false;
    load(() => stale);
    return () => {
      stale = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let timeout;
    const observer = new ResizeObserver(() => {
      clearTimeout(timeout);
      timeout = setTimeout(() => setNonce((n) => n + 1), 300);
    });
    observer.observe(container);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: `calc(100vh - ${headerOffset}px)`,
        overflow: "hidden",
        fontFamily: UI_FONT,
        color: PALETTE.text,
        zIndex: 0, // establishes a fresh stacking context for this section
      }}
    >
      {/* Fullscreen, drifting name-cloud canvas — the page background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />

      {/* Header overlay, floating above the cloud */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "32px 24px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 13,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#FFFFFF",
            marginBottom: 14,
            padding: "0.28rem 0.9rem",
            borderRadius: 100,
            border: "1.5px solid rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          Community
        </div>
        <h1
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 600,
            margin: "0 0 12px",
            lineHeight: 1.1,
            color: "#FFFFFF",
            textShadow: "0 2px 12px rgba(6,120,179,0.5)",
          }}
        >
          Our Members
        </h1>
        <p
          style={{
            color: PALETTE.subtext,
            fontSize: 16,
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.6,
            textShadow: "0 1px 8px rgba(6,120,179,0.5)",
          }}
        >
          Every name floating above belongs to someone who's part of this
          community. The cloud drifts and reshuffles as more people join.
        </p>
      </div>

      {/* Status / actions bar — this is where "Become a Member" lives.
          zIndex is higher than the header above it AND explicit, so an
          outside app header/nav can no longer cover it. */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          right: 24,
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#FFFFFF",
            fontSize: 13,
            textShadow: "0 1px 6px rgba(6,120,179,0.6)",
          }}
        >
          <Users size={15} />
          {totalCount !== null ? (
            <span>
              Showing <strong>{shownCount.toLocaleString()}</strong> of{" "}
              <strong>{totalCount.toLocaleString()}</strong> names
            </span>
          ) : (
            <span>Loading name pool…</span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setNonce((n) => n + 1)}
            disabled={status === "loading"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.15)",
              border: `1px solid rgba(255,255,255,0.5)`,
              color: "#FFFFFF",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 13,
              cursor: status === "loading" ? "default" : "pointer",
              opacity: status === "loading" ? 0.6 : 1,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            {status === "loading" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            Shuffle
          </button>

          <button
            onClick={handleRegisterClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#FFFFFF",
              border: "2px solid #FFFFFF",
              color: "#0A6FA8",
              borderRadius: 999,
              padding: "10px 22px",
              fontSize: 14.5,
              fontWeight: 800,
              letterSpacing: "0.01em",
              cursor: "pointer",
              boxShadow:
                "0 4px 16px rgba(6,120,179,0.45), 0 0 0 4px rgba(255,255,255,0.18)",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 22px rgba(6,120,179,0.5), 0 0 0 4px rgba(255,255,255,0.28)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(6,120,179,0.45), 0 0 0 4px rgba(255,255,255,0.18)";
            }}
          >
            <UserPlus size={16} />
            Become a Member
          </button>
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
            color: "#FFFFFF",
            fontSize: 14,
            background: "rgba(6,120,179,0.85)",
          }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}