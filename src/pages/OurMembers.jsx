import React from "react";
import NameCloud from "../components/NameCloud";

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
const API = import.meta.env.VITE_API_URL

const PALETTE = {
  text: "#0E3A4A",
  subtext: "#3E6B78",
  accent: "#1B9CC7",
};

const DISPLAY_FONT =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

export default function OurMembersPage() {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        // Same glassy sky-blue gradient language as the navbar's dropdown /
        // mobile-menu panels — layered radial glows over a soft diagonal wash.
        background: `
          radial-gradient(circle at 8% 4%, rgba(63,216,184,0.22), transparent 48%),
          radial-gradient(circle at 92% 0%, rgba(34,199,234,0.18), transparent 52%),
          radial-gradient(circle at 20% 96%, rgba(234,251,243,0.9), transparent 55%),
          radial-gradient(circle at 88% 100%, rgba(34,199,234,0.14), transparent 60%),
          linear-gradient(150deg, #F6FEFA 0%, #EAFBF3 30%, #DFF7F0 55%, #DCF4FA 78%, #FFFFFF 100%)
        `,
        color: PALETTE.text,
        fontFamily: UI_FONT,
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs — soft, glassy, sky-blue, echo the navbar's palette */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-200px",
          left: "-160px",
          width: 520,
          height: 520,
          borderRadius: "38% 62% 65% 35% / 42% 38% 62% 58%",
          background:
            "linear-gradient(160deg, rgba(63,216,184,0.28) 0%, rgba(234,251,243,0.4) 100%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "100px",
          right: "-180px",
          width: 460,
          height: 460,
          borderRadius: "60% 40% 45% 55% / 55% 45% 55% 45%",
          background:
            "linear-gradient(160deg, rgba(34,199,234,0.22) 0%, rgba(223,247,240,0.45) 100%)",
          filter: "blur(90px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-220px",
          left: "28%",
          width: 600,
          height: 600,
          borderRadius: "48% 52% 35% 65% / 60% 40% 65% 35%",
          background:
            "linear-gradient(160deg, rgba(234,251,243,0.55) 0%, rgba(63,216,184,0.15) 100%)",
          filter: "blur(100px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "35%",
          right: "8%",
          width: 260,
          height: 260,
          borderRadius: "55% 45% 60% 40% / 45% 55% 45% 55%",
          background:
            "linear-gradient(160deg, rgba(34,199,234,0.18) 0%, rgba(255,255,255,0.5) 100%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "112px 24px 96px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56, padding: "0 16px" }}>
          <div
            style={{
              display: "inline-block",
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: PALETTE.accent,
              marginBottom: 16,
              padding: "0.28rem 0.9rem",
              borderRadius: 100,
              border: "1.5px solid rgba(34,199,234,0.3)",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.65) 0%, rgba(63,216,184,0.25) 100%)",
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
              margin: "0 0 16px",
              lineHeight: 1.1,
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
            }}
          >
            Every name below belongs to someone who's part of this community.
            The cloud grows and reshuffles as more people join.
          </p>
        </div>

        <NameCloud
          fetchCount={async () => {
            const res = await fetch(`${API}/profiles-directory/count`);
            if (!res.ok) throw new Error(`Count request failed (${res.status})`);
            const data = await res.json();
            return data.count;
          }}
          fetchSample={async (sampleSize) => {
            const res = await fetch(
              `${API}/profiles-directory/sample?limit=${sampleSize}`
            );
            if (!res.ok) throw new Error(`Sample request failed (${res.status})`);
            return res.json(); // expects [{ full_name: "..." }, ...]
          }}
          height={560}
        />
      </div>
    </div>
  );
}