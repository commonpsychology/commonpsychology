import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'


const roleColors = {
  admin: { bg: "#1e3a8a", light: "#dbeafe", text: "#1e3a8a", label: "Admin" },
  therapist: { bg: "#0e7490", light: "#cffafe", text: "#0e7490", label: "Therapist" },
  staff: { bg: "#4338ca", light: "#e0e7ff", text: "#4338ca", label: "Staff" },
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

function Avatar({ src, name, size = 96 }) {
  const [err, setErr] = useState(false);
  const initials = getInitials(name);
  const hue = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 360;

  if (!src || err) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `hsl(${hue},55%,55%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * 0.33,
          fontWeight: 700,
          color: "#fff",
          letterSpacing: 1,
          flexShrink: 0,
          border: "3px solid rgba(255,255,255,0.7)",
          boxShadow: "0 4px 16px rgba(30,58,138,0.18)",
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
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: "3px solid rgba(255,255,255,0.7)",
        boxShadow: "0 4px 16px rgba(30,58,138,0.18)",
        flexShrink: 0,
      }}
    />
  );
}

function RoleBadge({ role }) {
  const c = roleColors[role?.toLowerCase()] || roleColors.staff;
  return (
    <span
      style={{
        background: c.light,
        color: c.text,
        borderRadius: 20,
        padding: "3px 12px",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: 0.5,
        textTransform: "capitalize",
        border: `1px solid ${c.text}22`,
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
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(18px)",
        borderRadius: 20,
        padding: "28px 24px 22px",
        border: "1px solid rgba(147,197,253,0.45)",
        boxShadow: "0 8px 32px rgba(30,58,138,0.10), 0 1.5px 4px rgba(30,58,138,0.06)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 0,
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "default",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(30,58,138,0.18), 0 2px 8px rgba(30,58,138,0.10)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(30,58,138,0.10), 0 1.5px 4px rgba(30,58,138,0.06)";
      }}
    >
      <Avatar src={member.avatar_url} name={member.full_name} size={84} />

      <div style={{ marginTop: 16, marginBottom: 6 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1e3a8a", lineHeight: 1.2 }}>
          {member.full_name || "Unnamed"}
        </div>
        {member.notes && (
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontStyle: "italic", lineHeight: 1.4 }}>
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
          borderTop: "1px solid rgba(147,197,253,0.35)",
          paddingTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {member.phone && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 14, color: "#374151" }}>
            <span style={{ fontSize: 16, color: "#3b82f6" }}>📞</span>
            <span>{member.phone}</span>
          </div>
        )}
        {member.department && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontSize: 13, color: "#6b7280" }}>
            <span style={{ fontSize: 15 }}>🏢</span>
            <span>{member.department}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 4 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: member.is_active ? "#22c55e" : "#ef4444",
              display: "inline-block",
            }}
          />
          <span style={{ fontSize: 12, color: member.is_active ? "#16a34a" : "#dc2626" }}>
            {member.is_active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Honeycomb header background ---------- */

const HONEY_WORDS = [
  "We Value You", "We Love You", "We Respect You", "You Matter",
  "Our Strength", "Thank You", "You Inspire Us", "Well Done",
  "We See You", "You're Heard", "Keep Shining", "We Honor You",
  "You Belong", "Grateful", "You're Vital", "Stay Strong",
];

function Hexagon({ word, opacity, scale = 1, delay = 0 }) {
  // pointy-top-flat-side hexagon via clip-path
  return (
    <div
      style={{
        width: 108 * scale,
        height: 124 * scale,
        margin: "-9px 3px",
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        background: "rgba(255,255,255,0.14)",
        border: "1px solid rgba(255,255,255,0.22)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 10px",
        flexShrink: 0,
        opacity,
        animation: `honeyFloat 7s ease-in-out ${delay}s infinite`,
      }}
    >
      <span
        style={{
          fontSize: 11.5 * scale,
          fontWeight: 700,
          color: "rgba(255,255,255,0.92)",
          letterSpacing: 0.3,
          lineHeight: 1.25,
          textShadow: "0 1px 3px rgba(15,40,90,0.35)",
        }}
      >
        {word}
      </span>
    </div>
  );
}

function HoneycombField() {
  // build staggered honeycomb rows; odd rows shifted half a hex to the right
  const rowCount = 5;
  const perRow = 9;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        maskImage: "radial-gradient(ellipse 90% 100% at 50% 35%, black 35%, transparent 85%)",
        WebkitMaskImage: "radial-gradient(ellipse 90% 100% at 50% 35%, black 35%, transparent 85%)",
      }}
    >
      <style>{`
        @keyframes honeyFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>
      <div
        style={{
          position: "absolute",
          top: -40,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {Array.from({ length: rowCount }).map((_, rowIdx) => (
          <div
            key={rowIdx}
            style={{
              display: "flex",
              marginLeft: rowIdx % 2 === 1 ? 54 : 0,
            }}
          >
            {Array.from({ length: perRow }).map((_, colIdx) => {
              const wordIdx = (rowIdx * perRow + colIdx) % HONEY_WORDS.length;
              // fade cells nearer the edges / bottom so it blends into the gradient
              const distFromCenterRow = Math.abs(rowIdx - (rowCount - 1) / 2);
              const baseOpacity = 0.85 - distFromCenterRow * 0.16;
              return (
                <Hexagon
                  key={colIdx}
                  word={HONEY_WORDS[wordIdx]}
                  opacity={Math.max(0.12, baseOpacity)}
                  delay={(rowIdx * perRow + colIdx) * 0.15}
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
        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 35%, #bfdbfe 60%, #93c5fd 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "0 0 60px",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "48px 40px 36px",
          borderRadius: "0 0 50% 50% / 0 0 32px 32px",
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, rgba(180,230,210,0.55) 0%, transparent 70%),
            radial-gradient(ellipse 70% 80% at 80% 20%, rgba(186,220,248,0.5) 0%, transparent 65%),
            radial-gradient(ellipse 60% 50% at 60% 80%, rgba(254,243,199,0.45) 0%, transparent 60%),
            linear-gradient(160deg, #18ea81 0%, #0c9ff4 45%, #f5e538 100%)
          `,
          textAlign: "center",
        }}
      >
        {/* Honeycomb of affirming words */}
        <HoneycombField />

        {/* Decorative circles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              width: [180, 120, 90, 200, 60][i],
              height: [180, 120, 90, 200, 60][i],
              top: ["-40px", "10px", "30px", "-60px", "20px"][i],
              left: ["70%", "5%", "85%", "20%", "50%"][i],
              pointerEvents: "none",
            }}
          />
        ))}

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, letterSpacing: 3, textTransform: "uppercase", color: "#93c5fd", marginBottom: 10, fontWeight: 600 }}>
            Our Team
          </div>
         
          <p
            style={{
              color: "#f0f9ff",
              fontSize: 16,
              margin: "0 0 28px",
              maxWidth: 480,
              marginLeft: "auto",
              marginRight: "auto",
              textShadow: "0 1px 6px rgba(15,40,90,0.25)",
            }}
          >
            
            <h1
            style={{
              fontSize: 38,
              fontWeight: 800,
              color: "#1404f0",
              margin: "0 0 10px",
              lineHeight: 1.1,
              textShadow: "0 2px 12px rgba(15,40,90,0.25)",
            }}
          >
            Meet Our Staff
          </h1>
          </p>

          {/* Stats */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {[
              { label: "Total Members", value: staff.length },
              { label: "Active", value: activeCount },
              { label: "Therapists", value: staff.filter(s => s.role === "therapist").length },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  background: "rgba(255,255,255,0.16)",
                  backdropFilter: "blur(4px)",
                  borderRadius: 12,
                  padding: "10px 22px",
                  border: "1px solid rgba(255,255,255,0.28)",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "#eff6ff", marginTop: 2 }}>{stat.label}</div>
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
              borderColor: filter === role ? "#1d4ed8" : "rgba(147,197,253,0.5)",
              background: filter === role ? "#1d4ed8" : "rgba(255,255,255,0.7)",
              color: filter === role ? "#fff" : "#1e3a8a",
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
          <div style={{ textAlign: "center", padding: "60px 0", color: "#1d4ed8", fontSize: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✨</div>
            Loading staff members…
          </div>
        )}

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 12,
              padding: "20px 24px",
              color: "#b91c1c",
              textAlign: "center",
              marginTop: 20,
            }}
          >
            <strong>Could not load staff.</strong> {error}
            <br />
            <span style={{ fontSize: 13, color: "#6b7280", marginTop: 8, display: "block" }}>
              Make sure your Supabase URL and anon key are set at the top of this file.
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
          <div style={{ textAlign: "center", color: "#6b7280", padding: "40px 0", fontSize: 15 }}>
            No staff found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}