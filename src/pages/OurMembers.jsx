import React, { useCallback, useEffect, useRef, useState } from "react";
import { Shuffle, Users, Loader2, UserPlus, Shield, Heart, Star } from "lucide-react";

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
const API = import.meta.env.VITE_API_URL;

// ---------------------------------------------------------------------------
// Real cement/plaster texture asset — used for the page background and the
// wall's mortar backdrop. Place the file at this path in your public/
// (or static assets) folder — e.g. public/textures/mortar-texture.jpg — or
// swap in an imported asset path from your bundler.
// ---------------------------------------------------------------------------
const MORTAR_TEXTURE_URL = "/textures/mortar-texture.jpg";

// ---------------------------------------------------------------------------
// Palette — mortar/plaster tones throughout the page, bluish gradient
// reserved for the Shuffle / Become Member / Sign-in buttons.
// ---------------------------------------------------------------------------
const PALETTE = {
  glow: "#00BFFF",               // bluish accent for Shuffle / Become Member / Sign-in
  glowDeep: "#0077FF",
  glowSoft: "rgba(0,191,255,0.35)",
  bgTop: "#EDE7DC",              // page gradient — same mortar tone as the wall
  bgBottom: "#BEB4A2",
  navy: "#3A3128",                // heading / body text — warm charcoal stone, not blue
  navySoft: "#7A6C58",
  card: "#FFFFFF",                // sidebar panel — bluish-white gradient, distinct from the mortar page
  cardDeep: "#D6EFFF",            // sidebar panel — soft blue-white
  cardText: "#3A3128",
  accent: "#B8834A",              // brass/terracotta accent for dividers, "you" highlight — not blue
  accentSoft: "rgba(184,131,74,0.32)",
  white: "#FFFFFF",
};

// Brick color — warm red-brown per design spec
const BRICK_BASE = "#9E4B34";
const BRICK_DARK = "#6D3324";
const BRICK_HIGHLIGHT = "#B86445";
const BRICK_SHADOW = "rgba(0,0,0,0.18)";

// Mortar / grout — warm putty-grey instead of a flat neutral grey, so it
// reads as real cementitious mortar rather than a plain UI panel.
const MORTAR_LIGHT = "#EDE7DC";
const MORTAR_MID = "#D8D0C2";
const MORTAR_DARK = "#BEB4A2";
const MORTAR_JOINT = "rgba(120,108,90,0.28)";

const DISPLAY_FONT = '"Playfair Display", Georgia, "Times New Roman", serif';
const SCRIPT_FONT = '"Dancing Script", "Brush Script MT", cursive';
const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

// Small breathing room below the wall canvas now that the floating action
// bar has been removed.
const BOTTOM_RESERVE = 24;

function brickFillGradient(ctx, x, y, w, h) {
  // 135deg diagonal: highlight (top-left) -> base -> dark (bottom-right)
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, BRICK_HIGHLIGHT);
  grad.addColorStop(0.45, BRICK_BASE);
  grad.addColorStop(1, BRICK_DARK);
  return grad;
}

// Thin light/dark rim strokes along the top-left / bottom-right edges so
// each brick reads as a beveled, slightly raised block.
function drawBrickBevel(ctx, x, y, w, h, r, bevel) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();

  ctx.lineWidth = bevel;
  ctx.strokeStyle = "rgba(255,255,255,0.32)";
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0,0,0,0.32)";
  ctx.beginPath();
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.stroke();

  ctx.restore();
}

// Engraved-looking name: a dark shadow pass and a light highlight pass,
// offset by a pixel each way, with the main fill in between.
function drawEngravedText(ctx, text, cx, cy, font, isYou) {
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = "rgba(0,0,0,0.45)";
  ctx.fillText(text, cx - 1, cy - 1);

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText(text, cx + 1, cy + 1);

  ctx.save();
  ctx.fillStyle = isYou ? "#FFF6E2" : "#F5E9E1";
  if (isYou) {
    ctx.shadowColor = PALETTE.accent;
    ctx.shadowBlur = 10;
  }
  ctx.fillText(text, cx, cy);
  ctx.restore();
}

// A tiny cached noise tile, reused as a canvas pattern for the dust texture.
function getNoiseCanvas(cacheRef, key = "default", opts = {}) {
  cacheRef.current = cacheRef.current || {};
  if (cacheRef.current[key]) return cacheRef.current[key];
  const size = opts.size || 96;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const nctx = c.getContext("2d");
  const img = nctx.createImageData(size, size);
  const base = opts.base ?? 200;
  const range = opts.range ?? 55;
  const alphaMax = opts.alphaMax ?? 40;
  for (let p = 0; p < img.data.length; p += 4) {
    const v = base + Math.floor(Math.random() * range);
    const a = Math.random() * alphaMax;
    img.data[p] = v;
    img.data[p + 1] = v;
    img.data[p + 2] = v;
    img.data[p + 3] = a;
  }
  nctx.putImageData(img, 0, 0);
  cacheRef.current[key] = c;
  return c;
}

// ---------------------------------------------------------------------------
// Build a brick grid sized and CENTERED for the actual number of names we
// have — instead of always tiling the full container (which used to leave a
// huge trailing block of empty bricks when the member count was small).
//
// sidePad keeps the wall from ever running flush to the canvas edge (which
// is what made bricks look "cut off" on narrow/mobile viewports), and
// isNarrow lets bricks shrink further than the desktop minimum so small
// phones still fit a sensible number of columns without overflowing.
// ---------------------------------------------------------------------------
function computeBrickGrid(width, height, topReserve, bottomReserve, count, sidePad = 0, isNarrow = false) {
  const availW = Math.max(50, width - sidePad * 2);
  const availH = Math.max(50, height - topReserve - bottomReserve);
  const n = Math.max(1, count);
  const gap = isNarrow ? 7 : 10; // mortar joint width

  // Pick a column count that roughly matches the container's aspect ratio.
  let cols = Math.max(1, Math.round(Math.sqrt((n * availW) / availH)));
  let rows = Math.max(1, Math.ceil(n / cols));

  // Brick size that fills the chosen grid, clamped to a smaller/tighter
  // range so the wall stays dense and legible as the member count grows
  // toward ~100 names, rather than always sizing for a handful. On narrow
  // viewports the floor drops so bricks never force horizontal overflow.
  const minBrickW = isNarrow ? 46 : 68;
  const maxBrickW = isNarrow ? 128 : 170;
  const minBrickH = isNarrow ? 22 : 28;
  const maxBrickH = isNarrow ? 40 : 52;

  const computeRawW = (colCount) => (availW - gap * (colCount - 1)) / colCount;
  let rawW = computeRawW(cols);
  let brickW = Math.max(minBrickW, Math.min(maxBrickW, rawW));

  // If the floor width still doesn't fit the available space at this column
  // count, drop columns until it does (guards very narrow phones).
  while (cols > 1 && (brickW * cols + gap * (cols - 1)) > availW) {
    cols -= 1;
    rows = Math.max(1, Math.ceil(n / cols));
    rawW = computeRawW(cols);
    brickW = Math.max(minBrickW, Math.min(maxBrickW, rawW)); // recompute against the new column count
  }

  // Last-resort safety net: even at cols === 1, the minBrickW floor can
  // still exceed availW on very narrow phones, which is what was pushing
  // the wall (and its rightmost brick) past the visible canvas edge.
  // Never let the grid exceed what's actually available.
  const maxPossibleW = computeRawW(cols);
  if (brickW > maxPossibleW) {
    brickW = Math.max(1, maxPossibleW);
  }

  const rawH = (availH - gap * (rows - 1)) / rows;
  let brickH = Math.max(minBrickH, Math.min(maxBrickH, brickW * 0.32, rawH));

  const gridW = cols * brickW + (cols - 1) * gap;
  const gridH = rows * brickH + (rows - 1) * gap;
  const offsetX = (width - gridW) / 2;
  const offsetY = topReserve + Math.max(0, availH - gridH) / 2;

  const cells = [];
  let idx = 0;
  outer: for (let r = 0; r < rows; r++) {
    // Running (staggered) bond: every other course shifts half a brick over.
    const rowShift = r % 2 === 1 ? (brickW + gap) / 2 : 0;
    for (let c = 0; c < cols; c++) {
      if (idx >= n) break outer;
      const x = offsetX + rowShift + c * (brickW + gap);
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
  minFontPx = 10,
  maxFontPx = 16,
  registerHref = "/register",
  onRegister,
  headerOffset = 0,
  currentUserName = null, // logged-in member's display name
}) {
  const containerRef = useRef(null);
  const wallWrapRef = useRef(null);
  const canvasRef = useRef(null);
  const namePoolRef = useRef([]);
  const cellsRef = useRef([]);
  const lastLayoutRef = useRef({ width: 0, height: 0, topReserve: 0, bottomReserve: 0, sidePad: 0, isNarrow: false });
  const hoveredIndexRef = useRef(-1);
  const noiseCacheRef = useRef(null);
  const mortarImgRef = useRef(null);
  const mortarPatternRef = useRef(null);

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [totalCount, setTotalCount] = useState(null);
  const [shownCount, setShownCount] = useState(0);
  const [nonce, setNonce] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [isTiny, setIsTiny] = useState(false);
  const [mortarImgLoaded, setMortarImgLoaded] = useState(false);

  // Preload the real cement/plaster texture once. It gets drawn as a tiled
  // canvas pattern behind the bricks, replacing the procedurally-generated
  // mottle + grain that was there before.
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      mortarImgRef.current = img;
      setMortarImgLoaded(true);
    };
    img.src = MORTAR_TEXTURE_URL;
  }, []);

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
  // Draw the wall of bricks — exactly one brick per name, centered, sitting
  // on a genuinely textured mortar backdrop (grout joints + mottled plaster
  // noise), not a flat grey panel.
  // -------------------------------------------------------------------------
  const drawWall = useCallback(
    (names, width, height, topReserve, bottomReserve, sidePad, narrow) => {
      const canvas = canvasRef.current;
      if (!canvas || width <= 0 || height <= 0) return;
      lastLayoutRef.current = { width, height, topReserve, bottomReserve, sidePad, isNarrow: narrow };

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.ceil(width * dpr);
      canvas.height = Math.ceil(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const pool = [...names];
      const { cells, brickW, brickH } = computeBrickGrid(
        width,
        height,
        topReserve,
        bottomReserve,
        Math.max(1, pool.length),
        sidePad,
        narrow
      );
      cellsRef.current = cells;

      const r = Math.round(Math.min(brickW, brickH) * 0.16);
      const bevel = Math.max(3, Math.min(7, brickH * 0.14));

      // 1) Mortar backdrop panel behind the whole grid — mottled plaster
      // tone, a soft radial vignette for depth, and faint grout joint lines
      // so the gaps between bricks read as real mortar rather than a flat
      // fill color.
      if (cells.length) {
        const minX = Math.min(...cells.map((c) => c.x));
        const maxX = Math.max(...cells.map((c) => c.x + c.w));
        const minY = Math.min(...cells.map((c) => c.y));
        const maxY = Math.max(...cells.map((c) => c.y + c.h));
        const pad = narrow ? 10 : 14;
        const panelX = Math.max(0, minX - pad);
        const panelY = Math.max(0, minY - pad);
        const panelW = Math.min(width, maxX + pad) - panelX;
        const panelH = Math.min(height, maxY + pad) - panelY;
        const panelR = narrow ? 14 : 18;

        ctx.save();
        ctx.shadowColor = BRICK_SHADOW;
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 6;
        roundRect(ctx, panelX, panelY, panelW, panelH, panelR);
        ctx.fillStyle = MORTAR_MID;
        ctx.fill();
        ctx.restore();

        ctx.save();
        roundRect(ctx, panelX, panelY, panelW, panelH, panelR);
        ctx.clip();

        // Real cement/plaster texture, tiled as a canvas pattern, so the
        // backdrop is an actual photographed wall surface rather than a
        // procedurally-generated mottle. Falls back to the old mottled
        // gradient for the brief window before the image has loaded.
        const img = mortarImgRef.current;
        if (img) {
          if (!mortarPatternRef.current) {
            mortarPatternRef.current = ctx.createPattern(img, "repeat");
          }
          if (mortarPatternRef.current) {
            ctx.fillStyle = mortarPatternRef.current;
            ctx.fillRect(panelX, panelY, panelW, panelH);
          }
        } else {
          const mottle = ctx.createLinearGradient(panelX, panelY, panelX + panelW, panelY + panelH);
          mottle.addColorStop(0, MORTAR_LIGHT);
          mottle.addColorStop(0.5, MORTAR_MID);
          mottle.addColorStop(1, MORTAR_DARK);
          ctx.fillStyle = mottle;
          ctx.fillRect(panelX, panelY, panelW, panelH);

          const grain = ctx.createPattern(
            getNoiseCanvas(noiseCacheRef, "mortar", { size: 64, base: 150, range: 90, alphaMax: 55 }),
            "repeat"
          );
          if (grain) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = grain;
            ctx.fillRect(panelX, panelY, panelW, panelH);
            ctx.globalAlpha = 1;
          }
        }

        // Inset vignette for depth (mortar recedes behind the bricks)
        const vign = ctx.createRadialGradient(
          panelX + panelW / 2, panelY + panelH / 2, Math.min(panelW, panelH) * 0.15,
          panelX + panelW / 2, panelY + panelH / 2, Math.max(panelW, panelH) * 0.7
        );
        vign.addColorStop(0, "rgba(0,0,0,0)");
        vign.addColorStop(1, "rgba(90,78,60,0.18)");
        ctx.fillStyle = vign;
        ctx.fillRect(panelX, panelY, panelW, panelH);

        // Faint grout joint lines running through the whole panel, matching
        // the brick pitch, so uncovered mortar between/around bricks still
        // reads as jointed masonry rather than a blank card.
        ctx.strokeStyle = MORTAR_JOINT;
        ctx.lineWidth = 1;
        const pitchX = brickW * 0.5;
        const pitchY = brickH + (narrow ? 7 : 10);
        for (let gx = panelX; gx < panelX + panelW; gx += pitchX) {
          ctx.beginPath();
          ctx.moveTo(gx, panelY);
          ctx.lineTo(gx, panelY + panelH);
          ctx.globalAlpha = 0.35;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (let gy = panelY; gy < panelY + panelH; gy += pitchY) {
          ctx.beginPath();
          ctx.moveTo(panelX, gy);
          ctx.lineTo(panelX + panelW, gy);
          ctx.globalAlpha = 0.3;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Inner top-edge highlight / bottom-edge shade for a slight recess
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(panelX + panelR, panelY + 1);
        ctx.lineTo(panelX + panelW - panelR, panelY + 1);
        ctx.stroke();

        ctx.restore();
      }

      // 2) Bricks — running bond, beveled, engraved names
      cells.forEach((cell, i) => {
        const name = pool[i];
        if (!name) return;

        const { w, h } = cell;
        let { x, y } = cell;
        const isYou =
          currentUserName &&
          name.trim().toLowerCase() === currentUserName.trim().toLowerCase();
        const isHover = hoveredIndexRef.current === i;
        if (isHover) y -= 4; // lift on hover

        // Brick fill
        ctx.save();
        if (isYou || isHover) {
          ctx.shadowColor = PALETTE.accent;
          ctx.shadowBlur = isYou ? 22 : 18;
          ctx.shadowOffsetY = isHover ? 2 : 0;
        } else {
          ctx.shadowColor = BRICK_SHADOW;
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 2;
        }
        roundRect(ctx, x, y, w, h, r);
        ctx.fillStyle = brickFillGradient(ctx, x, y, w, h);
        ctx.fill();
        ctx.restore();

        // Bevel — raised-block edge lighting
        drawBrickBevel(ctx, x, y, w, h, r, bevel);

        // Glowing outline for the signed-in user's own brick
        if (isYou) {
          ctx.save();
          roundRect(ctx, x + 1, y + 1, w - 2, h - 2, r);
          ctx.strokeStyle = PALETTE.accent;
          ctx.lineWidth = 2;
          ctx.shadowColor = PALETTE.accent;
          ctx.shadowBlur = 14;
          ctx.stroke();
          ctx.restore();
        }

        // Engraved name
        const maxTextW = w - 12;
        const size = fitFontSize(
          ctx,
          name,
          maxTextW,
          Math.min(maxFontPx, h * 0.4),
          minFontPx
        );
        drawEngravedText(
          ctx,
          name.toUpperCase(),
          x + w / 2,
          y + h / 2 + 1,
          `${isYou ? "800" : "700"} ${size}px ${UI_FONT}`,
          isYou
        );
      });

      // 3) Ambient warm-light wash from the top corners — sunlight on plaster,
      // not a blue UI glow, so it matches the mortar/brick theme.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const glowRadius = Math.max(width, height) * 0.55;
      const glowTL = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
      glowTL.addColorStop(0, "rgba(230,190,130,0.16)");
      glowTL.addColorStop(1, "rgba(230,190,130,0)");
      ctx.fillStyle = glowTL;
      ctx.fillRect(0, 0, width, height);
      const glowTR = ctx.createRadialGradient(width, 0, 0, width, 0, glowRadius);
      glowTR.addColorStop(0, "rgba(230,190,130,0.16)");
      glowTR.addColorStop(1, "rgba(230,190,130,0)");
      ctx.fillStyle = glowTR;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 4) Slight dust/noise texture over the whole scene
      const noisePattern = ctx.createPattern(
        getNoiseCanvas(noiseCacheRef, "dust", { size: 96, base: 200, range: 55, alphaMax: 40 }),
        "repeat"
      );
      if (noisePattern) {
        ctx.save();
        ctx.globalAlpha = 0.07;
        ctx.fillStyle = noisePattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }

      setShownCount(pool.filter(Boolean).length);
    },
    [currentUserName, maxFontPx, minFontPx]
  );

  // Track hover so a brick can lift + glow under the cursor.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const redraw = () => {
      const L = lastLayoutRef.current;
      drawWall(namePoolRef.current, L.width, L.height, L.topReserve, L.bottomReserve, L.sidePad, L.isNarrow);
    };

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let found = -1;
      const cells = cellsRef.current;
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i];
        if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) {
          found = i;
          break;
        }
      }
      if (found !== hoveredIndexRef.current) {
        hoveredIndexRef.current = found;
        canvas.style.cursor = found >= 0 ? "pointer" : "default";
        redraw();
      }
    };

    const handleLeave = () => {
      if (hoveredIndexRef.current !== -1) {
        hoveredIndexRef.current = -1;
        canvas.style.cursor = "default";
        redraw();
      }
    };

    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleLeave);
    return () => {
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleLeave);
    };
  }, [drawWall]);

  const relayout = useCallback(() => {
    const container = containerRef.current;
    const wrap = wallWrapRef.current;
    if (!container || !wrap) return;
    const totalW = container.clientWidth;
    const narrow = totalW < 860;
    const tiny = totalW < 420;
    setIsNarrow(narrow);
    setIsTiny(tiny);

    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    const topReserve = narrow ? Math.max(16, Math.min(40, h * 0.1)) : 24;
    const sidePad = tiny ? 10 : narrow ? 16 : 24;
    drawWall(namePoolRef.current, w, h, topReserve, BOTTOM_RESERVE, sidePad, narrow);
  }, [drawWall]);

  // Redraw once the real mortar texture has finished loading, so the
  // procedural placeholder swaps over to the actual photographed texture.
  useEffect(() => {
    if (mortarImgLoaded) relayout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mortarImgLoaded]);

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

  // Re-layout on container resize AND on window resize/orientation change —
  // some mobile browsers don't reliably fire ResizeObserver on rotation or
  // on address-bar collapse, which previously left the wall laid out for a
  // stale width until the next interaction.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let timeout;
    const scheduleRelayout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(relayout, 150);
    };
    const observer = new ResizeObserver(scheduleRelayout);
    observer.observe(container);
    window.addEventListener("resize", scheduleRelayout);
    window.addEventListener("orientationchange", scheduleRelayout);
    return () => {
      clearTimeout(timeout);
      observer.disconnect();
      window.removeEventListener("resize", scheduleRelayout);
      window.removeEventListener("orientationchange", scheduleRelayout);
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
        maxWidth: "100vw",
        boxSizing: "border-box",
        paddingTop: headerOffset + 24,
        minHeight: `calc(100vh - ${headerOffset}px)`,
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: UI_FONT,
        color: PALETTE.navy,
        background: `
          radial-gradient(ellipse 60% 40% at 15% 0%, rgba(255,255,255,0.25), transparent 60%),
          radial-gradient(ellipse 55% 45% at 90% 15%, rgba(255,255,255,0.15), transparent 55%),
          radial-gradient(ellipse 70% 50% at 50% 100%, rgba(90,78,60,0.12), transparent 60%),
          url(${MORTAR_TEXTURE_URL})
        `,
        backgroundSize: "auto, auto, auto, 340px",
        backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat",
        backgroundColor: PALETTE.bgBottom,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Dancing+Script:wght@600&display=swap');
        @keyframes wow-glow-pulse {
          0%, 100% { box-shadow: 0 0 14px 2px ${PALETTE.glowSoft}, inset 0 0 12px rgba(0,191,255,0.25); }
          50% { box-shadow: 0 0 26px 6px rgba(0,191,255,0.55), inset 0 0 18px rgba(0,191,255,0.4); }
        }
        @keyframes wow-glow-pulse-brass {
          0%, 100% { box-shadow: 0 0 12px 1px ${PALETTE.accentSoft}, inset 0 0 10px rgba(184,131,74,0.18); }
          50% { box-shadow: 0 0 20px 4px rgba(184,131,74,0.45), inset 0 0 14px rgba(184,131,74,0.3); }
        }
        .wow-canvas-wrap { transition: opacity 0.16s ease; }
        .wow-glow { animation: wow-glow-pulse 2.4s ease-in-out infinite; }
        .wow-glow-brass { animation: wow-glow-pulse-brass 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .wow-glow, .wow-glow-brass { animation: none; }
        }
      `}</style>

      {/* Header — its own soft card, matching the wall panel / member card visual language */}
      <div
        style={{
          padding: isTiny ? "14px 12px 0" : isNarrow ? "20px 16px 0" : "32px 24px 0",
          flexShrink: 0,
          boxSizing: "border-box",
          maxWidth: 720,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: isTiny ? "22px 16px 20px" : isNarrow ? "28px 20px 24px" : "36px 32px 30px",
            borderRadius: 20,
            background: `linear-gradient(160deg, ${PALETTE.card} 0%, ${PALETTE.cardDeep} 100%)`,
            boxShadow: "0 1px 0 rgba(255,255,255,0.7) inset, 0 10px 26px rgba(90,72,45,0.12)",
            border: "1px solid rgba(255,255,255,0.7)",
            boxSizing: "border-box",
          }}
        >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isTiny ? 8 : 18,
          }}
        >
          {!isTiny && <LeafOrnament flip={false} />}
          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontWeight: 800,
              fontSize: "clamp(22px, 6vw, 44px)",
              letterSpacing: "0.03em",
              color: PALETTE.navy,
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            Wall of Balance
          </h1>
          {!isTiny && <LeafOrnament flip={true} />}
        </div>
        <p
          style={{
            marginTop: 6,
            fontSize: isTiny ? 11 : 13,
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
          <span style={{ flex: 1, height: 1, background: "rgba(58,49,40,0.2)" }} />
          <Heart size={13} color={PALETTE.accent} fill={PALETTE.accent} />
          <span style={{ flex: 1, height: 1, background: "rgba(58,49,40,0.2)" }} />
        </div>
        {!isTiny && (
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
        )}
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
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: isNarrow ? "column" : "row",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Left: wall */}
        <div
          style={{
            flex: isNarrow ? "0 0 auto" : 1,
            position: "relative",
            minWidth: 0,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden", // hard guarantee: wall content can never visually bleed into the card below it
            width: isNarrow ? "100%" : "auto",
            height: isNarrow ? (isTiny ? "48vh" : "55vh") : "auto",
          }}
        >
          {/* Wall */}
          <div
            ref={wallWrapRef}
            className="wow-canvas-wrap"
            style={{
              position: "relative",
              width: "100%",
              flex: isNarrow ? "1 1 auto" : 1,
              height: isNarrow ? "100%" : "auto",
              minHeight: isNarrow ? 0 : 240,
              opacity: isShuffling ? 0.35 : 1,
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          >
            <canvas ref={canvasRef} style={{ display: "block", maxWidth: "100%" }} />
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
                background: `rgba(216,208,194,0.95)`,
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
            padding: isNarrow ? `0 ${isTiny ? 14 : 20}px 24px` : "22px 22px 22px",
            display: "flex",
            alignItems: isNarrow ? "flex-start" : "center",
            justifyContent: "center",
            height: isNarrow ? "auto" : "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: isNarrow ? 420 : "100%",
              transform: isNarrow ? "none" : "translateY(-18%)",
              borderRadius: 20,
              padding: isTiny ? "22px 16px 18px" : "26px 22px 22px",
              background: `linear-gradient(160deg, ${PALETTE.card} 0%, ${PALETTE.cardDeep} 100%)`,
              boxShadow: `0 0 0 1px rgba(255,255,255,0.5) inset, 0 1px 0 rgba(0,0,0,0.05) inset, 0 14px 30px rgba(90,72,45,0.22)`,
              color: PALETTE.cardText,
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <button
              onClick={handleShuffle}
              disabled={status === "loading"}
              title="Shuffle the wall of names"
              className="wow-glow"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 7,
                margin: "0 auto 18px",
                background: `linear-gradient(135deg, ${PALETTE.glow} 0%, ${PALETTE.glowDeep} 100%)`,
                border: `2px solid ${PALETTE.white}`,
                borderRadius: 999,
                color: PALETTE.white,
                fontWeight: 700,
                fontSize: 12.5,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                padding: "10px 20px",
                cursor: status === "loading" ? "default" : "pointer",
                opacity: status === "loading" ? 0.7 : 1,
                boxShadow: `0 6px 16px rgba(0,191,255,0.45)`,
                whiteSpace: "nowrap",
              }}
            >
              {status === "loading" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Shuffle size={15} />
              )}
              Shuffle
            </button>

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
                borderTop: "1px solid rgba(58,49,40,0.15)",
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
                className={currentUserName ? "wow-glow-brass" : ""}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "rgba(184,131,74,0.14)",
                  border: `1.5px solid ${PALETTE.accent}`,
                  borderRadius: 10,
                  padding: "12px 10px",
                }}
              >
                <Users size={16} color={PALETTE.accent} />
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 17,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    overflowWrap: "anywhere",
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
                        ? "1px dashed rgba(58,49,40,0.18)"
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
                      border: "1px solid rgba(58,49,40,0.35)",
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
                background: `linear-gradient(135deg, ${PALETTE.glow} 0%, ${PALETTE.glowDeep} 100%)`,
                border: `1.5px solid ${PALETTE.white}`,
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
        stroke={PALETTE.accent}
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
          fill={PALETTE.accent}
          opacity={0.35 + i * 0.1}
          transform={`rotate(${-20 + i * 12} ${cx} ${9 - (i % 2)})`}
        />
      ))}
    </svg>
  );
}