import React from "react";
import NameCloud from "../components/NameCloud";

// ---------------------------------------------------------------------------
// API base URL
// ---------------------------------------------------------------------------
// Matches the same VITE_API_URL convention already used elsewhere in this
// app (see src/pages/HomePage.jsx, e.g. `${API}/polls/has-answered`).
// VITE_API_URL already includes the /api prefix, so routes below are
// appended directly with no extra /api/ segment — same pattern as the
// rest of the app.
const API = import.meta.env.VITE_API_URL

const PALETTE = {
  bg: "#EEF4FB",
  text: "#1E2A3D",
  subtext: "#5C6B84",
  accent: "#3E6FD9",
  blob1: "rgba(163, 202, 255, 0.55)",
  blob2: "rgba(214, 230, 255, 0.65)",
  blob3: "rgba(190, 213, 250, 0.45)",
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
        // Bluish-white glassy gradient backdrop, matching NameCloud's page
        // background — layered radial highlights over a soft diagonal wash.
        background: `
          radial-gradient(circle at 15% 10%, #EAF8FC 0%, transparent 45%),
          radial-gradient(circle at 85% 0%, #DDF3FA 0%, transparent 50%),
          radial-gradient(circle at 50% 100%, #CDEBF5 0%, transparent 55%),
          linear-gradient(135deg, #F4FBFD 0%, #E3F4FA 40%, #D3EDF7 70%, #EAF7FB 100%)
        `,
        color: PALETTE.text,
        fontFamily: UI_FONT,
        overflow: "hidden",
      }}
    >
      {/* Decorative blobs — soft, transparent, bluish-white, sit behind content */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-180px",
          left: "-140px",
          width: 480,
          height: 480,
          borderRadius: "42% 58% 63% 37% / 45% 40% 60% 55%",
          background: PALETTE.blob1,
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "120px",
          right: "-160px",
          width: 420,
          height: 420,
          borderRadius: "63% 37% 42% 58% / 55% 45% 55% 45%",
          background: PALETTE.blob2,
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "-200px",
          left: "30%",
          width: 560,
          height: 560,
          borderRadius: "50% 50% 38% 62% / 62% 38% 62% 38%",
          background: PALETTE.blob3,
          filter: "blur(90px)",
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
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: PALETTE.accent,
              marginBottom: 16,
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