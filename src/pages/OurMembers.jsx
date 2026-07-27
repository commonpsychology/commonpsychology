import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Users, Loader2, UserPlus, Star } from "lucide-react";

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
const API = import.meta.env.VITE_API_URL;

// ---------------------------------------------------------------------------
// Palette — warm brick / stone / brass, no blue anywhere.
// ---------------------------------------------------------------------------
const PALETTE = {
  mortar: "#C9B693",
  brickBase: ["#9C4A2E", "#A8532F", "#8C3E23", "#B15B34", "#7A3620", "#9E4E2B", "#8F3F21"],
  engraveText: "#F3E4C4",
  engraveLight: "rgba(255,238,205,0.22)",
  engraveDark: "rgba(30,12,4,0.65)",
  pinnedBrick: "#E8AC3E",
  pinnedBrickDark: "#C68A26",
  pinnedText: "#3A2107",
  panelStart: "#E0A233",
  panelEnd: "#8A5714",
  plaque: "rgba(32,17,8,0.74)",
  plaqueBorder: "rgba(255,224,160,0.28)",
  cream: "#F6ECD9",
  creamDim: "#E4D3AE",
};

const DISPLAY_FONT =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

// ---------------------------------------------------------------------------
// Brick geometry
// ---------------------------------------------------------------------------
const BRICK_W = 150;
const BRICK_H = 56;
const GAP = 6;
const NARROW_BREAK = 760;

function pseudoRandom(seed) {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

function fitFontSize(text, pinned) {
  const len = text.length;
  const base = pinned ? 17 : 15;
  if (len <= 8) return base;
  if (len <= 12) return base - 2;
  if (len <= 16) return base - 3.5;
  if (len <= 22) return base - 5;
  return base - 6;
}

function computeGrid(width, height) {
  const cols = Math.max(4, Math.ceil(width / (BRICK_W + GAP)));
  const rows = Math.max(4, Math.ceil(height / (BRICK_H + GAP)));
  return { cols, rows };
}

// Lay names into a running-bond brick grid (alternating rows start with a
// half brick, like a real wall) and pin the current user's name into one
// fixed, non-shuffling cell near the middle.
function buildWall(names, cols, rows, currentUserName, reserveRightCols) {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const isOffset = r % 2 === 1;
    const row = [];
    if (isOffset) row.push({ width: BRICK_W / 2, isHalf: true });
    for (let c = 0; c < cols; c++) row.push({ width: BRICK_W, isHalf: false });
    grid.push(row);
  }

  const pool = names.length ? names : [{ text: "Member" }];
  let poolIdx = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = grid[r][c];
      cell.row = r;
      cell.col = c;
      cell.pinned = false;
      if (!cell.isHalf) {
        cell.text = pool[poolIdx % pool.length].text;
        poolIdx++;
      } else {
        cell.text = "";
      }
    }
  }

  if (currentUserName) {
    const pinnedRow = Math.min(rows - 1, Math.max(3, Math.round(rows * 0.55)));
    const rowArr = grid[pinnedRow];
    const maxCol = Math.max(1, rowArr.length - 1 - reserveRightCols);
    let pinnedCol = Math.min(maxCol, Math.max(1, Math.floor(rowArr.length * 0.42)));
    if (rowArr[pinnedCol]?.isHalf) pinnedCol = Math.min(maxCol, pinnedCol + 1);
    rowArr[pinnedCol] = {
      ...rowArr[pinnedCol],
      text: currentUserName,
      pinned: true,
    };
  }

  return grid;
}

// ---------------------------------------------------------------------------
// A single brick
// ---------------------------------------------------------------------------
function BrickTile({ brick, shuffleNonce }) {
  const { text, pinned, row, col, width, isHalf } = brick;

  if (!text) {
    const shade = PALETTE.brickBase[
      Math.floor(pseudoRandom(row * 97 + col * 57 + 13) * PALETTE.brickBase.length)
    ];
    return (
      <div
        style={{
          width,
          height: BRICK_H,
          marginRight: GAP,
          flexShrink: 0,
          borderRadius: 3,
          background: shade,
          filter: `brightness(${0.88 + pseudoRandom(row * 13 + col * 29 + 7) * 0.28})`,
          border: "1px solid rgba(0,0,0,0.15)",
          boxShadow: "inset 0 -3px 5px rgba(0,0,0,0.28), inset 0 2px 2px rgba(255,255,255,0.08)",
        }}
      />
    );
  }

  const shadeIdx = Math.floor(
    pseudoRandom(row * 97 + col * 57 + 13) * PALETTE.brickBase.length
  );
  const baseColor = PALETTE.brickBase[shadeIdx];
  const brightness = 0.88 + pseudoRandom(row * 13 + col * 29 + 7) * 0.28;
  const fontSize = fitFontSize(text, pinned);
  const delay = Math.min(420, row * 34 + col * 11);

  return (
    <div
      style={{
        width,
        height: BRICK_H,
        marginRight: GAP,
        flexShrink: 0,
        position: "relative",
        borderRadius: 3,
        background: pinned
          ? `linear-gradient(155deg, ${PALETTE.pinnedBrick}, ${PALETTE.pinnedBrickDark})`
          : baseColor,
        filter: pinned ? "none" : `brightness(${brightness})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 8px",
        boxShadow: pinned
          ? "inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 2px rgba(255,255,255,0.25)"
          : "inset 0 -3px 5px rgba(0,0,0,0.28), inset 0 2px 2px rgba(255,255,255,0.08)",
        animation: pinned ? "pinnedGlow 2.6s ease-in-out infinite" : undefined,
        border: pinned ? "1px solid rgba(255,230,165,0.95)" : "1px solid rgba(0,0,0,0.15)",
        overflow: "hidden",
        zIndex: pinned ? 2 : 1,
      }}
      title={text}
    >
      {pinned && (
        <Star
          size={11}
          fill={PALETTE.pinnedText}
          style={{ position: "absolute", top: 4, left: 6, color: PALETTE.pinnedText, opacity: 0.85 }}
        />
      )}
      <span
        key={pinned ? "pinned" : `${text}-${shuffleNonce}`}
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize,
          fontWeight: pinned ? 800 : 600,
          letterSpacing: "0.01em",
          color: pinned ? PALETTE.pinnedText : PALETTE.engraveText,
          textShadow: pinned
            ? "0 1px 0 rgba(255,255,255,0.4), 0 -1px 1px rgba(0,0,0,0.25)"
            : `0 1px 0 ${PALETTE.engraveLight}, 0 -1.5px 1.5px ${PALETTE.engraveDark}`,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "100%",
          animation: pinned ? undefined : "brickPop 0.5s ease both",
          animationDelay: pinned ? undefined : `${delay}ms`,
        }}
      >
        {text}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The glowing "Become a Member" brick — reused as a tall side panel on
// wide screens and an inline bar on narrow ones.
// ---------------------------------------------------------------------------
function MemberGlowButton({ onClick, variant }) {
  const isPanel = variant === "panel";
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: isPanel ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: isPanel ? 10 : 8,
        width: isPanel ? 168 : "auto",
        minHeight: isPanel ? 220 : "auto",
        padding: isPanel ? "20px 14px" : "12px 24px",
        borderRadius: 10,
        background: `linear-gradient(160deg, ${PALETTE.panelStart}, ${PALETTE.panelEnd})`,
        border: "2px solid rgba(255,228,170,0.9)",
        color: PALETTE.cream,
        cursor: "pointer",
        textAlign: "center",
        animation: "memberGlow 2.4s ease-in-out infinite",
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
      }}
    >
      <UserPlus size={isPanel ? 26 : 18} />
      <span
        style={{
          fontFamily: DISPLAY_FONT,
          fontWeight: 800,
          lineHeight: 1.25,
          textShadow: "0 1px 0 rgba(255,255,255,0.35), 0 -1px 1px rgba(0,0,0,0.3)",
        }}
      >
        {isPanel ? (
          <>
            <div style={{ fontSize: 12, letterSpacing: "0.14em", opacity: 0.9 }}>BECOME A</div>
            <div style={{ fontSize: 20 }}>MEMBER</div>
          </>
        ) : (
          <span style={{ fontSize: 15 }}>Become a Member</span>
        )}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// OurMembersPage
// ---------------------------------------------------------------------------
export default function OurMembersPage({
  maxWords = 220,
  minWords = 30,
  registerHref = "/register",
  onRegister,
  headerOffset = 0, // height in px of any fixed/sticky site nav above this section
  currentUserName = null, // pass the logged-in member's display name to pin their brick
}) {
  const containerRef = useRef(null);

  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [totalCount, setTotalCount] = useState(null);
  const [shownCount, setShownCount] = useState(0);
  const [wallGrid, setWallGrid] = useState([]);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [nonce, setNonce] = useState(0);
  const [shuffleNonce, setShuffleNonce] = useState(0);

  const isNarrow = dims.w > 0 && dims.w < NARROW_BREAK;

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

  const load = useCallback(
    async (isStale) => {
      setStatus("loading");
      setErrorMsg("");
      try {
        const total = await fetchCount();
        if (isStale()) return;
        setTotalCount(total);

        const container = containerRef.current;
        const width = container ? container.clientWidth : 1200;
        const height = container ? container.clientHeight : 700;
        setDims({ w: width, h: height });

        const { cols, rows } = computeGrid(width, height);
        const totalSlots = rows * cols;
        const sampleSize = Math.min(maxWords, Math.max(minWords, totalSlots));

        const rowsData = await fetchSample(sampleSize);
        if (isStale()) return;

        const names = rowsData
          .map((r) => (r.full_name || "").toString().trim())
          .filter(Boolean)
          .map((text) => ({ text }));

        for (let i = names.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [names[i], names[j]] = [names[j], names[i]];
        }

        const reserveRightCols = width < NARROW_BREAK ? 0 : 2;
        const grid = buildWall(names, cols, rows, currentUserName, reserveRightCols);
        if (isStale()) return;

        setWallGrid(grid);
        setShownCount(Math.min(names.length, totalSlots));
        setStatus("ready");
        setShuffleNonce((n) => n + 1);
      } catch (err) {
        if (isStale()) return;
        console.error("OurMembersPage load error:", err);
        setStatus("error");
        setErrorMsg(err.message || "Something went wrong loading names.");
      }
    },
    [fetchCount, fetchSample, maxWords, minWords, currentUserName]
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
        marginTop: headerOffset,
        height: `calc(100vh - ${headerOffset}px)`,
        overflow: "hidden",
        fontFamily: UI_FONT,
        color: PALETTE.cream,
        background: PALETTE.mortar,
        zIndex: 0,
      }}
    >
      <style>{`
        @keyframes brickPop {
          0% { opacity: 0; transform: scale(0.82) translateY(2px); }
          60% { opacity: 1; transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes pinnedGlow {
          0%, 100% { box-shadow: 0 0 0 2px rgba(255,205,110,0.55), 0 0 14px 3px rgba(255,190,80,0.4); }
          50% { box-shadow: 0 0 0 2px rgba(255,205,110,0.9), 0 0 26px 8px rgba(255,190,80,0.75); }
        }
        @keyframes memberGlow {
          0%, 100% { box-shadow: 0 0 22px 4px rgba(255,193,90,0.55), inset 0 0 14px rgba(255,224,150,0.25); }
          50% { box-shadow: 0 0 40px 10px rgba(255,193,90,0.85), inset 0 0 20px rgba(255,224,150,0.4); }
        }
      `}</style>

      {/* The brick wall itself */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        {wallGrid.map((row, rIdx) => (
          <div
            key={`row-${rIdx}`}
            style={{ display: "flex", height: BRICK_H, marginBottom: GAP, overflow: "hidden" }}
          >
            {row.map((brick, cIdx) => (
              <BrickTile key={`${rIdx}-${cIdx}`} brick={brick} shuffleNonce={shuffleNonce} />
            ))}
          </div>
        ))}
      </div>

      {/* Header plaque — title, blurb, member count, shuffle */}
      <div
        style={{
          position: "absolute",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "calc(100% - 48px)",
          maxWidth: 620,
          padding: "22px 28px",
          borderRadius: 16,
          background: PALETTE.plaque,
          border: `1px solid ${PALETTE.plaqueBorder}`,
          boxShadow: "0 14px 32px rgba(0,0,0,0.45)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 12,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: PALETTE.cream,
            marginBottom: 12,
            padding: "0.26rem 0.85rem",
            borderRadius: 100,
            border: "1.5px solid rgba(255,224,160,0.4)",
            background: "rgba(255,224,160,0.1)",
          }}
        >
          Community
        </div>
        <h1
          style={{
            fontFamily: DISPLAY_FONT,
            fontSize: "clamp(28px, 4.6vw, 44px)",
            fontWeight: 600,
            margin: "0 0 10px",
            lineHeight: 1.1,
            color: PALETTE.cream,
          }}
        >
          Our Members
        </h1>
        <p
          style={{
            color: PALETTE.creamDim,
            fontSize: 15,
            maxWidth: 520,
            margin: "0 auto 16px",
            lineHeight: 1.55,
          }}
        >
          Every name on the wall belongs to someone who's part of this
          community. Shuffle to see more, and your own brick always stays
          put, right in the middle.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: PALETTE.creamDim }}>
            <Users size={14} />
            {totalCount !== null ? (
              <span>
                Showing <strong>{shownCount.toLocaleString()}</strong> of{" "}
                <strong>{totalCount.toLocaleString()}</strong> names
              </span>
            ) : (
              <span>Loading name pool…</span>
            )}
          </div>

          <button
            onClick={() => setNonce((n) => n + 1)}
            disabled={status === "loading"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,224,160,0.12)",
              border: "1px solid rgba(255,224,160,0.5)",
              color: PALETTE.cream,
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

          {isNarrow && <MemberGlowButton onClick={handleRegisterClick} variant="inline" />}
        </div>
      </div>

      {/* Become a Member — glowing brick panel on the right side of the wall */}
      {!isNarrow && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: 28,
            transform: "translateY(-50%)",
            zIndex: 1000,
          }}
        >
          <MemberGlowButton onClick={handleRegisterClick} variant="panel" />
        </div>
      )}

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
            color: PALETTE.cream,
            fontSize: 14,
            background: "rgba(35,18,8,0.88)",
          }}
        >
          {errorMsg}
        </div>
      )}
    </div>
  );
}