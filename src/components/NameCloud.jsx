import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Users, Loader2, UserPlus } from "lucide-react";

/**
 * NameCloud
 * ----------------------------------------------------------------------------
 * Turns the `full_name` column of a `profiles` table into a canvas-rendered
 * word-cloud, and keeps rendering smooth whether the table has 40 rows or
 * 4,000,000 rows.
 *
 * WHY IT DOESN'T DRAW "A MILLION NAMES" LITERALLY
 * A million legible text nodes has no visual meaning (it's just noise) and no
 * browser can lay that many out without freezing. Instead this component:
 *   1. Fetches the true total row count (one cheap COUNT query).
 *   2. Fetches a *sample* sized as a percentage of that total, capped at
 *      `maxWords`, floored at `minWords` — so the cloud gets visibly denser
 *      as your table grows, without ever choking the browser.
 *   3. Displays the real total honestly ("2,400 of 1,284,391 names") so nothing
 *      is hidden from the person looking at it.
 *   4. Lays words out with a canvas + downsampled bitmap collision grid
 *      (the same core trick libraries like wordcloud2.js use), processed in
 *      animation-frame chunks so the tab never locks up.
 *
 * DATA SOURCE
 * Defaults assume a Supabase client (pass it as `supabaseClient`). If you're
 * on a different backend, ignore `supabaseClient` entirely and pass your own
 * `fetchCount` / `fetchSample` functions — see prop docs below.
 *
 * REQUIRED PEER DEPENDENCIES
 *   npm install lucide-react
 *   (@supabase/supabase-js only if you use the built-in Supabase fetchers)
 *
 * BASIC USAGE
 *   <NameCloud supabaseClient={supabase} />
 *
 * CUSTOM BACKEND USAGE
 *   <NameCloud
 *     fetchCount={async () => (await fetch('/api/profiles/count')).json()}
 *     fetchSample={async (n) => (await fetch(`/api/profiles/sample?n=${n}`)).json()}
 *   />
 *
 * REGISTER CTA
 * A "Register to be a Member" button sits at the top-right of the header,
 * styled in the same accent blue as the rest of the palette. By default it
 * navigates the browser to `/register`; pass `onRegister` to override that
 * (e.g. to push a client-side route instead of a full navigation), or
 * `registerHref` to point it somewhere else.
 */

// ---------------------------------------------------------------------------
// Palette — bright sky-cyan fading to white, left-to-right, matching the
// site's header banner. Ink colors are cool blues/teals/greens so words stay
// legible against the bright left edge as well as the white right edge.
// ---------------------------------------------------------------------------
const PALETTE = {
  sky: "#0EA5E9", // solid sky-blue, no gradient
  inkMuted: "#BFE9F2",
  text: "#0E3A4A",
  subtext: "#4A7686",
  accent: "#1B9CC7",
};

const DISPLAY_FONT =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

// ---------------------------------------------------------------------------
// Default Supabase-backed fetchers
// ---------------------------------------------------------------------------
function makeSupabaseFetchers({ supabaseClient, table, nameColumn, weightColumn }) {
  const fetchCount = async () => {
    const { count, error } = await supabaseClient
      .from(table)
      .select(nameColumn, { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  };

  // For huge tables, ORDER BY random() is slow. Instead we take a handful of
  // random offset windows (cheap with an indexed range scan) and merge them,
  // which gives a good-enough representative sample without a full table scan.
  const fetchSample = async (sampleSize, totalCount) => {
    if (totalCount <= sampleSize) {
      let query = supabaseClient.from(table).select(nameColumn + (weightColumn ? `,${weightColumn}` : ""));
      const { data, error } = await query.limit(sampleSize);
      if (error) throw error;
      return data;
    }

    const windows = Math.min(12, Math.max(3, Math.ceil(sampleSize / 300)));
    const perWindow = Math.ceil(sampleSize / windows);
    const chunks = await Promise.all(
      Array.from({ length: windows }, async () => {
        const maxOffset = Math.max(0, totalCount - perWindow);
        const offset = Math.floor(Math.random() * maxOffset);
        const { data, error } = await supabaseClient
          .from(table)
          .select(nameColumn + (weightColumn ? `,${weightColumn}` : ""))
          .range(offset, offset + perWindow - 1);
        if (error) throw error;
        return data ?? [];
      })
    );
    return chunks.flat().slice(0, sampleSize);
  };

  return { fetchCount, fetchSample };
}

// ---------------------------------------------------------------------------
// Layout: spiral placement over a downsampled bitmap collision grid
// ---------------------------------------------------------------------------
function buildLayoutEngine(ctx, width, height, cellSize = 4) {
  const cols = Math.ceil(width / cellSize);
  const rows = Math.ceil(height / cellSize);
  const grid = new Uint8Array(cols * rows);

  const markOccupied = (x, y, w, h) => {
    const x0 = Math.max(0, Math.floor(x / cellSize));
    const y0 = Math.max(0, Math.floor(y / cellSize));
    const x1 = Math.min(cols - 1, Math.ceil((x + w) / cellSize));
    const y1 = Math.min(rows - 1, Math.ceil((y + h) / cellSize));
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        grid[gy * cols + gx] = 1;
      }
    }
  };

  const collides = (x, y, w, h) => {
    const x0 = Math.floor(x / cellSize);
    const y0 = Math.floor(y / cellSize);
    const x1 = Math.ceil((x + w) / cellSize);
    const y1 = Math.ceil((y + h) / cellSize);
    if (x0 < 0 || y0 < 0 || x1 >= cols || y1 >= rows) return true;
    for (let gy = y0; gy <= y1; gy++) {
      const rowBase = gy * cols;
      for (let gx = x0; gx <= x1; gx++) {
        if (grid[rowBase + gx]) return true;
      }
    }
    return false;
  };

  // Archimedean spiral search for the first free spot near the center.
  const place = (w, h) => {
    const cx = width / 2 - w / 2;
    const cy = height / 2 - h / 2;
    const maxR = Math.sqrt(width * width + height * height) / 1.6;
    let angle = Math.random() * Math.PI * 2;
    let radius = 0;
    const step = Math.max(2, Math.min(w, h) / 6);

    while (radius < maxR) {
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle) * 0.55; // squash vertically, cloud-ish
      if (!collides(x, y, w, h)) {
        markOccupied(x, y, w, h);
        return { x, y };
      }
      angle += 0.35;
      radius += step * 0.12;
    }
    return null; // no room found — skip this word
  };

  return { place };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function NameCloud({
  supabaseClient = null,
  table = "profiles",
  nameColumn = "full_name",
  weightColumn = null, // optional numeric column (e.g. "activity_score") to size words by importance
  fetchCount: fetchCountProp,
  fetchSample: fetchSampleProp,
  maxWords = 4000,
  minWords = 40,
  sampleRatio = 0.05, // 5% of the table, up to maxWords
  minFontPx = 11,
  maxFontPx = 64,
  className = "",
  height = 520,
  registerHref = "/register",
  onRegister,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [totalCount, setTotalCount] = useState(null);
  const [shownCount, setShownCount] = useState(0);
  const [nonce, setNonce] = useState(0); // bump to force a re-sample

  const fetchers = supabaseClient
    ? makeSupabaseFetchers({ supabaseClient, table, nameColumn, weightColumn })
    : {};
  const fetchCount = fetchCountProp || fetchers.fetchCount;
  const fetchSample = fetchSampleProp || fetchers.fetchSample;

  const handleRegisterClick = useCallback(() => {
    if (onRegister) {
      onRegister();
      return;
    }
    if (typeof window !== "undefined") {
      window.location.href = registerHref;
    }
  }, [onRegister, registerHref]);

  const draw = useCallback(
    async (words, canvasWidth, canvasHeight) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      const ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Background — solid sky blue, no gradient. Names float on it like clouds.
      ctx.fillStyle = PALETTE.sky;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      if (!words.length) return;

      // Font sizing: rank-based scale, auto-compressed as sample size grows
      // so the cloud gets visibly denser as the underlying table grows.
      const n = words.length;
      const densityFactor = Math.max(0.28, 1 - Math.log10(n + 1) / 5);
      const effMaxFont = Math.max(minFontPx + 4, maxFontPx * densityFactor);

      const weights = words.map((w) => w.weight);
      const wMin = Math.min(...weights);
      const wMax = Math.max(...weights);
      const wRange = wMax - wMin || 1;

      const sorted = [...words].sort((a, b) => b.weight - a.weight);
      const engine = buildLayoutEngine(ctx, canvasWidth, canvasHeight);

      const CHUNK = 120;
      let i = 0;
      let placedCount = 0;

      const step = () =>
        new Promise((resolve) => {
          requestAnimationFrame(() => {
            const end = Math.min(i + CHUNK, sorted.length);
            for (; i < end; i++) {
              const item = sorted[i];
              const t = (item.weight - wMin) / wRange; // 0..1
              const fontSize = Math.round(
                minFontPx + Math.pow(t, 0.65) * (effMaxFont - minFontPx)
              );
              ctx.font = `${i % 7 === 0 ? "700" : "500"} ${fontSize}px ${DISPLAY_FONT}`;
              const metrics = ctx.measureText(item.text);
              const w = metrics.width;
              const h = fontSize * 1.05;
              const spot = engine.place(w, h);
              if (spot) {
                const x = spot.x;
                const y = spot.y + h * 0.78;

                // 1) Soft blurred shadow — darker sky-blue, offset down-right,
                // heavily blurred so it reads as a puffy cloud shadow rather
                // than a hard-edged emboss.
                ctx.save();
                ctx.filter = "blur(3px)";
                ctx.globalAlpha = 0.55;
                ctx.fillStyle = "#0678B3";
                ctx.fillText(item.text, x + 2, y + 2);
                ctx.restore();

                // 2) Soft white outer glow — fuzzy halo around the letters.
                ctx.save();
                ctx.filter = "blur(6px)";
                ctx.globalAlpha = 0.55;
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(item.text, x, y);
                ctx.restore();

                // 3) Crisp white core on top — the sharp, readable center.
                ctx.globalAlpha = 1;
                ctx.fillStyle = "#FFFFFF";
                ctx.fillText(item.text, x, y);

                placedCount++;
              }
              

            }
            resolve();
          });
        });

      while (i < sorted.length) {
        await step();
      }
      setShownCount(placedCount);
    },
    [minFontPx, maxFontPx]
  );

  const load = useCallback(async () => {
    if (!fetchCount || !fetchSample) {
      setStatus("error");
      setErrorMsg(
        "No data source configured. Pass a `supabaseClient` prop, or your own `fetchCount` / `fetchSample` functions."
      );
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const total = await fetchCount();
      setTotalCount(total);

      const sampleSize = Math.min(
        maxWords,
        Math.max(minWords, Math.round(total * sampleRatio))
      );

      const rows = await fetchSample(sampleSize, total);
      const words = rows
        .map((r) => {
          const text = (r[nameColumn] || "").toString().trim();
          const weight = weightColumn && typeof r[weightColumn] === "number"
            ? r[weightColumn]
            : Math.random(); // no weight column -> organic random sizing
          return text ? { text, weight } : null;
        })
        .filter(Boolean);

      const container = containerRef.current;
      const w = container ? container.clientWidth : 900;
      await draw(words, w, height);
      setStatus("ready");
    } catch (err) {
      console.error("NameCloud load error:", err);
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong loading names.");
    }
  }, [draw, fetchCount, fetchSample, maxWords, minWords, sampleRatio, nameColumn, weightColumn, height]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce]);

  // Redraw on container resize (debounced)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={className}
      style={{
        fontFamily: UI_FONT,
        // Bluish-white glassy gradient background for the page, layered so
        // it reads as frosted glass rather than a flat fill.
        background: `
          radial-gradient(circle at 15% 10%, #E4FAF0 0%, transparent 45%),
          radial-gradient(circle at 85% 0%, #DDF3FA 0%, transparent 50%),
          radial-gradient(circle at 50% 100%, #CDEBF5 0%, transparent 55%),
          linear-gradient(135deg, #F1FBF6 0%, #E3F4FA 35%, #D3EDF7 65%, #E9F9F2 100%)
        `,
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: PALETTE.subtext, fontSize: 13 }}>
          <Users size={15} />
          {totalCount !== null ? (
            <span>
              Showing{" "}
              <strong style={{ color: PALETTE.text }}>
                {shownCount.toLocaleString()}
              </strong>{" "}
              of{" "}
              <strong style={{ color: PALETTE.text }}>
                {totalCount.toLocaleString()}
              </strong>{" "}
              names
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
              background: "transparent",
              border: `1px solid ${PALETTE.inkMuted}`,
              color: PALETTE.text,
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 13,
              cursor: status === "loading" ? "default" : "pointer",
              opacity: status === "loading" ? 0.6 : 1,
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
              background: PALETTE.accent,
              border: `1px solid ${PALETTE.accent}`,
              color: "#FFFFFF",
              borderRadius: 999,
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgb(4, 150, 255)",
            }}
          >
            <UserPlus size={14} />
            Register to be a Member
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height,
          borderRadius: 16,
          overflow: "hidden",
          background: PALETTE.sky,
          border: `1px solid ${PALETTE.inkMuted}66`,
        }}
      >
        <canvas ref={canvasRef} style={{ display: "block" }} />

        {status === "loading" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PALETTE.subtext,
              fontSize: 13,
              gap: 8,
              background: `${PALETTE.sky}CC`,
            }}
          >
            <Loader2 size={16} className="animate-spin" />
            Weaving names into place…
          </div>
        )}

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
              color: "#D9645C",
              fontSize: 13,
            }}
          >
            {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
}