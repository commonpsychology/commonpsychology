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
  sky: "#00BFFF",
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
// Used once, up front, to find non-overlapping starting positions. After
// that the words drift gently (like clouds) via a per-frame sine offset
// rather than being re-laid-out every frame (which would be far too slow).
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

  return { place };
}

// ---------------------------------------------------------------------------
// OurMembersPage
// ----------------------------------------------------------------------------
// Everything that used to live in the separate <NameCloud /> component is
// now inlined here. The word-cloud canvas fills the entire viewport (it's
// the page background, not a boxed widget), and the words drift slowly and
// continuously — like clouds — rather than sitting static once laid out.
// ---------------------------------------------------------------------------
export default function OurMembersPage({
  maxWords = 260, // kept lower than the old 4000 cap so a 60fps drift stays smooth
  minWords = 40,
  sampleRatio = 0.05,
  minFontPx = 12,
  maxFontPx = 64,
  registerHref = "/register",
  onRegister,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const wordsRef = useRef([]); // laid-out words with drift params
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
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
    return res.json(); // expects [{ full_name: "..." }, ...]
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
  // Lay the words out once (spiral collision layout), attaching random drift
  // parameters (amplitude, speed, phase) so the animation loop can move each
  // word along its own gentle, cloud-like orbit.
  // -------------------------------------------------------------------------
  const layoutWords = useCallback(
    (rawWords, canvasWidth, canvasHeight) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      const n = rawWords.length;
      const densityFactor = Math.max(0.28, 1 - Math.log10(n + 1) / 5);
      const effMaxFont = Math.max(minFontPx + 4, maxFontPx * densityFactor);

      const weights = rawWords.map((w) => w.weight);
      const wMin = Math.min(...weights);
      const wMax = Math.max(...weights);
      const wRange = wMax - wMin || 1;

      const sorted = [...rawWords].sort((a, b) => b.weight - a.weight);
      // Pad the collision grid by the max possible drift amplitude so that
      // words swaying during the animation can never sway into a neighbor's
      // space — collisions are only safe to ignore post-layout if the sway
      // radius was already reserved up front.
      const MAX_AMP_X = 14;
      const MAX_AMP_Y = 9;
      const engine = buildLayoutEngine(
        canvasWidth,
        canvasHeight,
        4,
        8 + Math.max(MAX_AMP_X, MAX_AMP_Y)
      );

      const placed = [];
      for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i];
        const t = (item.weight - wMin) / wRange;
        const fontSize = Math.round(
          minFontPx + Math.pow(t, 0.65) * (effMaxFont - minFontPx)
        );
        ctx.font = `${i % 7 === 0 ? "700" : "500"} ${fontSize}px ${DISPLAY_FONT}`;
        const metrics = ctx.measureText(item.text);
        const w = metrics.width;
        const h = fontSize * 1.05;
        const spot = engine.place(w, h);
        if (spot) {
          placed.push({
            text: item.text,
            fontSize,
            bold: i % 7 === 0,
            baseX: spot.x,
            baseY: spot.y,
            w,
            h,
            // Drift parameters — each word floats along its own slow,
            // independent sine path so the whole cloud feels alive rather
            // than static. Amplitudes stay within MAX_AMP_X/MAX_AMP_Y above,
            // which is exactly how much extra space the layout reserved
            // around every word, so drifting words can never sway into a
            // neighbor's spot.
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
  // Continuous animation loop — redraws every word each frame at its base
  // position plus a sine-wave offset and a slow wind drift, wrapping around
  // the screen edges so the cloud endlessly, gently flows.
  // -------------------------------------------------------------------------
  const renderFrame = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (startTimeRef.current === null) startTimeRef.current = timestamp;
    const t = (timestamp - startTimeRef.current) / 1000; // seconds

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { w: canvasWidth, h: canvasHeight } = sizeRef.current;
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = PALETTE.sky;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const words = wordsRef.current;
    for (let i = 0; i < words.length; i++) {
      const wd = words[i];

      const x = wd.baseX + Math.sin(t * wd.speedX + wd.phaseX) * wd.ampX;
      const y =
        wd.baseY + Math.cos(t * wd.speedY + wd.phaseY) * wd.ampY + wd.h * 0.78;

      ctx.font = `${wd.bold ? "700" : "500"} ${wd.fontSize}px ${DISPLAY_FONT}`;

      // Soft blurred shadow
      ctx.save();
      ctx.filter = "blur(3px)";
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#0678B3";
      ctx.fillText(wd.text, x + 2, y + 2);
      ctx.restore();

      // Soft white glow
      ctx.save();
      ctx.filter = "blur(6px)";
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(wd.text, x, y);
      ctx.restore();

      // Crisp white core
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(wd.text, x, y);
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
            const weight = Math.random(); // no weight column -> organic random sizing
            return text ? { text, weight } : null;
          })
          .filter(Boolean);

        resizeCanvas();
        layoutWords(words, sizeRef.current.w, sizeRef.current.h);
        if (isStale()) return;
        setStatus("ready");

        // (Re)start the drift animation loop — cancel any previous loop
        // first so a duplicate effect run (e.g. React StrictMode in dev)
        // can never leave two loops drawing on the same canvas at once.
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

  // Re-layout (debounced) on window resize so the cloud keeps covering the
  // whole screen at any viewport size.
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
        height: "100vh", // fills the screen, but stays in normal page flow
        overflow: "hidden",
        fontFamily: UI_FONT,
        color: PALETTE.text,
      }}
    >
      {/* Fullscreen, drifting name-cloud canvas — this IS the page background */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />

      {/* Header overlay, floating above the cloud */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "32px 24px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          pointerEvents: "none", // let clicks pass through to the cloud, except on buttons below
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

      {/* Status / actions bar, floating at the top, pointer-events re-enabled */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: 24,
          right: 24,
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
              gap: 6,
              background: "#FFFFFF",
              border: `1px solid #FFFFFF`,
              color: PALETTE.accent,
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(6,120,179,0.35)",
            }}
          >
            <UserPlus size={14} />
            Register to be a Member
          </button>
        </div>
      </div>

      {status === "error" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
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