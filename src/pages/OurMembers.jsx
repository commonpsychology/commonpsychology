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
  bg: "#0B0F22",
  text: "#F4EFE6",
  subtext: "#8B93B8",
  accent: "#F1C97B",
};

const DISPLAY_FONT =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
const UI_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, sans-serif';

export default function OurMembersPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: PALETTE.bg,
        color: PALETTE.text,
        fontFamily: UI_FONT,
        padding: "64px 24px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: PALETTE.accent,
              marginBottom: 14,
            }}
          >
            Community
          </div>
          <h1
            style={{
              fontFamily: DISPLAY_FONT,
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 600,
              margin: "0 0 14px",
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