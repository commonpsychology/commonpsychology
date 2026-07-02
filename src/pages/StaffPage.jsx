import { useState, useEffect, useMemo } from "react";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

/* ---------------------------------------------------------------------
   TOKENS
------------------------------------------------------------------------ */
const COLORS = {
  void: "#05060f",
  voidDeep: "#0a0e24",
  navy: "#0f1533",
  panel: "rgba(18,22,48,0.62)",
  panelBorder: "rgba(148,163,255,0.16)",
  amber: "#f5b942",
  amberSoft: "rgba(245,185,66,0.16)",
  violet: "#8b7cf6",
  violetSoft: "rgba(139,124,246,0.18)",
  teal: "#37c9c1",
  textBright: "#f4f6ff",
  textMuted: "#a3aed6",
  textFaint: "#6b74a3",
};

const roleColors = {
  admin: { bg: "rgba(139,124,246,0.16)", border: "rgba(139,124,246,0.4)", text: "#c3b8ff", label: "Admin" },
  therapist: { bg: "rgba(55,201,193,0.14)", border: "rgba(55,201,193,0.4)", text: "#7fe3db", label: "Therapist" },
  staff: { bg: "rgba(245,185,66,0.14)", border: "rgba(245,185,66,0.4)", text: "#f5c977", label: "Staff" },
};

function getInitials(name) {
  return (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function Avatar({ src, name, size = 84 }) {
  const [err, setErr] = useState(false);
  const initials = getInitials(name);
  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  const ring = {
    width: size,
    height: size,
    borderRadius: "50%",
    flexShrink: 0,
    border: "2px solid rgba(245,185,66,0.55)",
    boxShadow: "0 0 0 4px rgba(245,185,66,0.08), 0 8px 24px rgba(0,0,0,0.45)",
  };

  if (!src || err) {
    return (
      <div
        style={{
          ...ring,
          background: `linear-gradient(155deg, hsl(${hue},60%,42%), hsl(${(hue + 40) % 360},55%,28%))`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.32,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: 1,
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      style={{ ...ring, objectFit: "cover" }}
    />
  );
}

function RoleBadge({ role }) {
  const c = roleColors[role?.toLowerCase()] || roleColors.staff;
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        borderRadius: 20,
        padding: "3px 12px",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: "capitalize",
        border: `1px solid ${c.border}`,
      }}
    >
      {c.label}
    </span>
  );
}

function StaffCard({ member }) {
  const role = (member.role || "staff").toLowerCase();

  return (
    <div
      style={{
        background: COLORS.panel,
        backdropFilter: "blur(18px)",
        borderRadius: 18,
        padding: "26px 22px 20px",
        border: `1px solid ${COLORS.panelBorder}`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "rgba(245,185,66,0.4)";
        e.currentTarget.style.boxShadow = "0 18px 44px rgba(0,0,0,0.5)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = COLORS.panelBorder;
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";
      }}
    >
      <Avatar src={member.avatar_url} name={member.full_name} size={80} />

      <div style={{ marginTop: 16, marginBottom: 6 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: COLORS.textBright, lineHeight: 1.2 }}>
          {member.full_name || "Unnamed"}
        </div>
        {member.notes && (
          <div style={{ fontSize: 12, color: COLORS.textFaint, marginTop: 4, fontStyle: "italic", lineHeight: 1.4 }}>
            {member.notes}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 14 }}>
        <RoleBadge role={role} />
      </div>

      <div
        style={{
          width: "100%",
          borderTop: `1px solid ${COLORS.panelBorder}`,
          paddingTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {member.phone && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 14, color: COLORS.textMuted }}>
            <span style={{ fontSize: 15, color: COLORS.amber }}>📞</span>
            <span>{member.phone}</span>
          </div>
        )}
        {member.department && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13, color: COLORS.textFaint }}>
            <span style={{ fontSize: 14 }}>🏢</span>
            <span>{member.department}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: member.is_active ? "#34d399" : "#f87171",
              boxShadow: member.is_active ? "0 0 6px rgba(52,211,153,0.7)" : "0 0 6px rgba(248,113,113,0.7)",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 12, color: member.is_active ? "#6ee7b7" : "#fca5a5" }}>
            {member.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   STARFIELD — scattered twinkling points across the void
------------------------------------------------------------------------ */
function useStars(count, seed) {
  return useMemo(() => {
    let s = seed;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return Array.from({ length: count }).map((_, i) => ({
      top: rand() * 100,
      left: rand() * 100,
      size: rand() * 1.8 + 0.6,
      delay: rand() * 6,
      dur: rand() * 3 + 3,
      opacity: rand() * 0.5 + 0.35,
    }));
  }, [count, seed]);
}

function Starfield({ count = 90, seed = 7 }) {
  const stars = useStars(count, seed);
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            opacity: s.opacity,
            boxShadow: "0 0 3px rgba(255,255,255,0.8)",
            animation: `starTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------
   HONEYCOMB — set within the void, kept clear of the title band via a
   mask so it never competes with the text sitting in front of it.
------------------------------------------------------------------------ */
const HONEY_WORDS = [
  "Valued", "Loved", "Respected", "Matter",
  "Strength", "Thank You", "Inspiring", "Well Done",
  "Seen", "Heard", "Shine On", "Honored",
  "Belong", "Equal", "Vital", "Strong",
];

const HEX_W = 92;
const HEX_H = 104;
const HEX_GAP = 9;
const ROW_STEP = HEX_H * 0.75;
const ROWS = 5;
const PER_ROW = 9;

function Hexagon({ word, opacity, delay = 0 }) {
  const fontSize = word.length > 8 ? 10 : 11.5;
  return (
    <div
      style={{
        width: HEX_W,
        height: HEX_H,
        marginRight: HEX_GAP,
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        background: "linear-gradient(155deg, rgba(245,185,66,0.10), rgba(139,124,246,0.08))",
        border: "1px solid rgba(245,185,66,0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 12px",
        flexShrink: 0,
        opacity,
        animation: `honeyShimmer 9s ease-in-out ${delay}s infinite`,
      }}
    >
      <span
        style={{
          fontSize,
          fontWeight: 700,
          color: "rgba(245,230,200,0.85)",
          letterSpacing: 0.3,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
        }}
      >
        {word}
      </span>
    </div>
  );
}

function HoneycombField() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        // Fades out through the vertical center (where the title sits)
        // and at the far top/bottom edges, so cells only read clearly
        // in a quiet band around the headline — never behind the text.
        maskImage:
          "radial-gradient(ellipse 62% 40% at 50% 46%, transparent 0%, transparent 30%, black 62%, black 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 62% 40% at 50% 46%, transparent 0%, transparent 30%, black 62%, black 100%)",
      }}
    >
      <style>{`
        @keyframes honeyShimmer {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 1; }
        }
      `}</style>
      <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column" }}>
        {Array.from({ length: ROWS }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: "flex",
              marginLeft: rowIdx % 2 === 1 ? (HEX_W + HEX_GAP) / 2 : 0,
              marginTop: rowIdx === 0 ? 0 : -(HEX_H - ROW_STEP),
            }}
          >
            {Array.from({ length: PER_ROW }).map((_, colIdx) => {
              const wordIdx = (rowIdx * PER_ROW + colIdx) % HONEY_WORDS.length;
              return (
                <Hexagon
                  key={colIdx}
                  word={HONEY_WORDS[wordIdx]}
                  opacity={0.85}
                  delay={(rowIdx * PER_ROW + colIdx) * 0.2}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------- */

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch(`${API_BASE}/staff`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        const list = data.staff || data.data || []
        setStaff(list)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const roles = ["all", ...Array.from(new Set(staff.map(s => s.role?.toLowerCase()).filter(Boolean)))];
  const filtered = filter === "all" ? staff : staff.filter(s => s.role?.toLowerCase() === filter);
  const activeCount = staff.filter(s => s.is_active).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${COLORS.void} 0%, ${COLORS.voidDeep} 38%, ${COLORS.navy} 100%)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "0 0 60px",
      }}
    >
      {/* Header — galactic void */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "64px 40px 44px",
          textAlign: "center",
          borderBottom: "1px solid rgba(148,163,255,0.10)",
        }}
      >
        {/* Nebula glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse 60% 55% at 18% 20%, rgba(139,124,246,0.22) 0%, transparent 70%),
              radial-gradient(ellipse 55% 60% at 85% 15%, rgba(55,201,193,0.16) 0%, transparent 65%),
              radial-gradient(ellipse 70% 50% at 50% 100%, rgba(245,185,66,0.10) 0%, transparent 60%)
            `,
            pointerEvents: "none",
          }}
        />

        <Starfield count={110} seed={11} />
        <HoneycombField />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 12,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: COLORS.amber,
              marginBottom: 14,
              fontWeight: 700,
            }}
          >
            Our Team
          </div>

          <h1
            style={{
              fontSize: 42,
              fontWeight: 800,
              margin: "0 0 12px",
              lineHeight: 1.1,
              letterSpacing: 0.5,
              color: COLORS.textBright,
              textShadow: "0 0 28px rgba(139,124,246,0.35), 0 2px 20px rgba(0,0,0,0.6)",
            }}
          >
            Meet Our Staff
          </h1>

          <p
            style={{
              color: COLORS.textMuted,
              fontSize: 16,
              margin: "0 0 30px",
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            The people behind every session, every appointment, every check-in.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
            {[
              { label: "Total Members", value: staff.length },
              { label: "Active", value: activeCount },
              { label: "Therapists", value: staff.filter(s => s.role === "therapist").length },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(18,22,48,0.55)",
                  backdropFilter: "blur(6px)",
                  borderRadius: 12,
                  padding: "10px 24px",
                  border: "1px solid rgba(245,185,66,0.22)",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.amber }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "28px 20px 8px", flexWrap: "wrap" }}>
        {roles.map(role => (
          <button
            key={role}
            onClick={() => setFilter(role)}
            style={{
              padding: "8px 20px",
              borderRadius: 20,
              border: "1.5px solid",
              borderColor: filter === role ? COLORS.amber : COLORS.panelBorder,
              background: filter === role ? "rgba(245,185,66,0.14)" : COLORS.panel,
              color: filter === role ? COLORS.amber : COLORS.textMuted,
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.15s",
            }}
          >
            {role === "all" ? `All (${staff.length})` : `${role}s (${staff.filter(s => s.role?.toLowerCase() === role).length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "20px 24px 0" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: COLORS.amber, fontSize: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
            Loading staff members…
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 12,
              padding: "20px 24px",
              color: "#fca5a5",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            <strong>Could not load staff.</strong> {error}
            <br />
            <span style={{ fontSize: 13, color: COLORS.textFaint, marginTop: 8, display: "block" }}>
              Make sure your API URL is set correctly.
            </span>
          </div>
        )}

        {!loading && !error && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 20,
              marginTop: 8,
            }}
          >
            {filtered.map(member => (
              <StaffCard key={member.id} member={member} />
            ))}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", color: COLORS.textFaint, padding: "40px 0", fontSize: 15 }}>
            No staff found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}