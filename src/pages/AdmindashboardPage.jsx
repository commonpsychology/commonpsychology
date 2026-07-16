// AdminDashboardPage.jsx — FIXED
// Fixes applied:
//  1. CourseEnrollmentsSection moved OUTSIDE AdminDashboardPage (was nested inside → invalid hooks)
//  2. Courses tab JSX block properly closed before Assessments tab starts
//  3. Removed duplicate `{tab === 'courses' && ...}` guard inside already-open courses block
//  4. CourseContentSection rendered cleanly without wrapping other tabs
//  5. All subsequent tabs (assessments, community, room_bookings, etc.) are now at the correct nesting level

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter }   from '../context/RouterContext'
import { useAuth }     from '../context/AuthContext'
import { admin as adminApi } from '../services/api'
import ReviewsModeration from '../components/ReviewsModeration'
import CourseContentSection from './CourseContentSection'
const LIMIT = 10 // or 20 or whatever you want
  

const fmt  = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const fmtT = d => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

/* ════════════════════════════════════════════════════════════════════════
   GLASSY BLUISH-WHITE THEME
   Drop-in replacement for the `const CSS = \`...\`` block in
   AdminDashboardPage.jsx. Nothing else in the file needs to change —
   every component already reads colors through these CSS variables
   and existing class names.
   ════════════════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

/* ── PART 1: ROOT VARIABLES ─────────────────────────────────────────────
   Swapped every solid color for a bluish-glass palette. Surfaces are
   translucent whites/blues meant to sit on top of the gradient body
   background defined in PART 2, with blur applied per-component.       */
:root {
  --font-ui: 'Sora', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Sidebar — deep blue glass instead of near-black */
  --sidebar-bg: rgba(15, 33, 64, 0.72);
  --sidebar-border: rgba(148, 190, 255, 0.18);
  --sidebar-hover: rgba(255, 255, 255, 0.06);
  --sidebar-active-bg: rgba(96, 165, 250, 0.22);
  --sidebar-active-border: #7dd3fc;
  --sidebar-text: #b9cbe8;
  --sidebar-text-active: #f0f7ff;
  --sidebar-group: #8ba3c7;

  /* Topbar — same glass family as sidebar */
  --topbar-bg: rgba(15, 33, 64, 0.72);
  --topbar-border: rgba(148, 190, 255, 0.18);

  /* Page + surfaces — bluish-white glass */
  --bg: #eaf2fb;
  --bg-gradient: radial-gradient(1200px 600px at 10% -10%, #dbeafe 0%, transparent 60%),
                 radial-gradient(1000px 700px at 100% 0%, #e0f2fe 0%, transparent 55%),
                 linear-gradient(180deg, #eef4fc 0%, #e3edf9 45%, #dbe8f7 100%);
  --surface: rgba(255, 255, 255, 0.62);
  --surface-2: rgba(255, 255, 255, 0.4);
  --surface-solid: #ffffff;
  --border: rgba(148, 180, 224, 0.35);
  --border-2: rgba(148, 180, 224, 0.22);
  --glass-blur: blur(16px);
  --glass-blur-sm: blur(8px);

  --text-primary: #0f2440;
  --text-secondary: #3f5978;
  --text-muted: #7891ae;
  --text-label: #5f7a9c;

  --blue: #3b82f6;
  --blue-lt: rgba(59, 130, 246, 0.12);
  --blue-dk: #1d4ed8;
  --green: #10b981;
  --green-lt: rgba(16, 185, 129, 0.12);
  --green-dk: #065f46;
  --amber: #f59e0b;
  --amber-lt: rgba(245, 158, 11, 0.14);
  --red: #ef4444;
  --red-lt: rgba(239, 68, 68, 0.12);
  --purple: #8b5cf6;
  --purple-lt: rgba(139, 92, 246, 0.12);
  --teal: #14b8a6;
  --teal-lt: rgba(20, 184, 166, 0.12);
  --rose: #f43f5e;

  --radius-sm: 8px;
  --radius: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  --shadow-xs: 0 1px 2px rgba(30, 64, 130, .06);
  --shadow-sm: 0 1px 4px rgba(30, 64, 130, .08), 0 2px 8px rgba(30, 64, 130, .05);
  --shadow-md: 0 8px 24px rgba(30, 64, 130, .12), 0 2px 6px rgba(30, 64, 130, .06);
  --shadow-lg: 0 16px 48px rgba(30, 64, 130, .16);
  --shadow-xl: 0 24px 70px rgba(30, 64, 130, .22);
  --shadow-glow: 0 0 0 1px rgba(255,255,255,.5) inset, 0 8px 32px rgba(59,130,246,.10);

  --topbar-h: 54px;
  --sidebar-w: 234px;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font-ui); }

/* ── PART 2: SHELL / LAYOUT / TOPBAR / GLASS BODY ──────────────────────── */
.adm {
  min-height: 100vh;
  background: var(--bg-gradient);
  background-attachment: fixed;
  display: flex; flex-direction: column;
  font-family: var(--font-ui); color: var(--text-primary);
}
.adm-bar {
  height: var(--topbar-h);
  background: var(--topbar-bg);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--topbar-border);
  padding: 0 1.25rem; display: flex; justify-content: space-between; align-items: center;
  position: sticky; top: 0; z-index: 300;
}
.adm-body { display: flex; flex: 1; min-height: 0; background: var(--bg-gradient); }
.adm-side {
  width: var(--sidebar-w); flex-shrink: 0;
  background: var(--sidebar-bg);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border-right: 1px solid var(--sidebar-border);
  position: sticky; top: var(--topbar-h); height: calc(100vh - var(--topbar-h));
  overflow-y: auto; padding: .75rem 0;
  scrollbar-width: thin; scrollbar-color: rgba(148,190,255,.3) transparent;
}
.adm-side::-webkit-scrollbar { width: 3px; }
.adm-side::-webkit-scrollbar-thumb { background: rgba(148,190,255,.3); border-radius: 3px; }

/* .adm-content is the shared wrapper every tab renders into.
   Kept transparent/plain on purpose — the gradient page background
   shows through it, and each individual block inside a tab
   (header bar, sub-tabbar, table, stat cards, section-inner) is its
   own separate floating glass card. See PART 3 for the header card. */
.adm-content {
  flex: 1; min-width: 0; max-width: 100%; overflow-x: hidden;
  padding: 1.5rem;
}

.side-group-label { padding: .9rem 1.1rem .3rem; font-size: .62rem; font-weight: 700; color: var(--sidebar-group); text-transform: uppercase; letter-spacing: .1em; }
.side-btn { display: flex; align-items: center; gap: .6rem; width: 100%; padding: .48rem 1.1rem; border: none; background: transparent; font-family: var(--font-ui); font-size: .78rem; font-weight: 500; cursor: pointer; text-align: left; color: var(--sidebar-text); transition: all .15s; position: relative; border-radius: 0; }
.side-btn:hover { background: var(--sidebar-hover); color: var(--sidebar-text-active); }
.side-btn.active { background: var(--sidebar-active-bg); color: var(--sidebar-text-active); font-weight: 600; border-right: 2px solid var(--sidebar-active-border); box-shadow: inset 0 0 20px rgba(125,211,252,.08); }
.side-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; font-size: .82rem; flex-shrink: 0; }
.side-divider { height: 1px; background: var(--sidebar-border); margin: .6rem 1.1rem; }
.side-btn.side-accent { color: #7dd3fc; font-weight: 600; }
.side-btn.side-accent:hover { background: rgba(125,211,252,.12); }

.brand { display: flex; align-items: center; gap: .7rem; }
.brand-logo { height: 26px; object-fit: contain; }
.brand-name { font-size: .85rem; font-weight: 700; color: #f0f7ff; letter-spacing: -.01em; }
.brand-sub { font-size: .58rem; color: #8ba3c7; text-transform: uppercase; letter-spacing: .1em; }
.topbar-right { display: flex; align-items: center; gap: .65rem; }
.avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #60a5fa, #a78bfa); display: flex; align-items: center; justify-content: center; font-size: .66rem; font-weight: 800; color: white; box-shadow: 0 2px 8px rgba(96,165,250,.4); }
.topbar-name { font-size: .78rem; color: #b9cbe8; }
.logout-btn { padding: .28rem .7rem; border-radius: var(--radius-sm); border: 1px solid rgba(148,190,255,.25); background: rgba(255,255,255,.04); color: #b9cbe8; font-size: .72rem; cursor: pointer; font-family: var(--font-ui); transition: all .15s; }
.logout-btn:hover { border-color: rgba(148,190,255,.5); color: #f0f7ff; background: rgba(255,255,255,.08); }

/* ── PART 3: SECTION HEADERS ─────────────────────────────────────────── */
.sec-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 1.25rem; flex-wrap: wrap; gap: .75rem;
  background: var(--surface);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.4rem;
  box-shadow: var(--shadow-glow);
}
.sec-title { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); letter-spacing: -.02em; }
.sec-sub { font-size: .73rem; color: var(--text-muted); margin-top: .2rem; }
.sec-count { font-size: .78rem; font-weight: 400; color: var(--text-muted); margin-left: .35rem; }
.sec-actions { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }

/* ── PART 4: BUTTONS ─────────────────────────────────────────────────── */
.btn { padding: .38rem .85rem; border-radius: var(--radius-sm); font-family: var(--font-ui); font-size: .76rem; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; transition: all .15s; display: inline-flex; align-items: center; gap: .35rem; white-space: nowrap; line-height: 1.4; }
.btn:disabled { opacity: .45; cursor: not-allowed; transform: none !important; pointer-events: none; }
.btn-primary { background: linear-gradient(135deg, #3b82f6, #60a5fa); color: white; border-color: transparent; box-shadow: 0 4px 14px rgba(59,130,246,.35); }
.btn-primary:hover { background: linear-gradient(135deg, #2563eb, #3b82f6); box-shadow: 0 6px 18px rgba(59,130,246,.45); transform: translateY(-1px); }
.btn-success { background: linear-gradient(135deg, #10b981, #34d399); color: white; border-color: transparent; box-shadow: 0 4px 14px rgba(16,185,129,.3); }
.btn-success:hover { filter: brightness(1.06); transform: translateY(-1px); }
.btn-ghost { background: rgba(255,255,255,.5); backdrop-filter: var(--glass-blur-sm); color: var(--text-secondary); border-color: var(--border); }
.btn-ghost:hover { border-color: #93c5fd; color: var(--text-primary); background: rgba(255,255,255,.75); }
.btn-danger { background: var(--red-lt); color: var(--red); border-color: rgba(239,68,68,.25); }
.btn-danger:hover { background: var(--red); color: white; border-color: var(--red); }
.btn-warn { background: var(--amber-lt); color: #92400e; border-color: rgba(245,158,11,.3); }
.btn-warn:hover { background: var(--amber); color: white; }
.btn-sm { padding: .22rem .58rem; font-size: .7rem; border-radius: 6px; }
.btn-xs { padding: .15rem .42rem; font-size: .65rem; border-radius: 5px; }
.btn-icon { padding: .32rem .42rem; }

/* ── PART 5: INPUTS / SELECTS ────────────────────────────────────────── */
.inp { padding: .38rem .75rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm); font-size: .78rem; color: var(--text-primary); background: rgba(255,255,255,.55); backdrop-filter: var(--glass-blur-sm); outline: none; font-family: var(--font-ui); transition: border .15s, box-shadow .15s, background .15s; }
.inp:focus { border-color: var(--blue); background: rgba(255,255,255,.85); box-shadow: 0 0 0 3px rgba(59,130,246,.15); }
select.inp { cursor: pointer; }
textarea.inp { resize: vertical; line-height: 1.65; }

/* ── PART 6: TABLES ──────────────────────────────────────────────────── */
.tbl-wrap { background: var(--surface); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border-radius: var(--radius-lg); border: 1px solid var(--border); overflow: hidden; box-shadow: var(--shadow-glow); }
.tbl-scroll { overflow-x: auto; }
table.tbl { width: 100%; border-collapse: collapse; min-width: 480px; }
table.tbl th { padding: .6rem .9rem; text-align: left; font-size: .62rem; font-weight: 700; color: var(--text-label); text-transform: uppercase; letter-spacing: .08em; background: rgba(219,234,254,.45); border-bottom: 1px solid var(--border); white-space: nowrap; }
table.tbl td { padding: .65rem .9rem; font-size: .79rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-2); vertical-align: middle; }
table.tbl tr:last-child td { border-bottom: none; }
table.tbl tr:hover td { background: rgba(219,234,254,.35); }
.tbl-empty { text-align: center; padding: 3rem; color: var(--text-muted); font-size: .82rem; }
.tbl-loading { text-align: center; padding: 2.5rem; color: var(--text-muted); font-size: .82rem; }

.pager { display: flex; justify-content: center; align-items: center; gap: .4rem; padding: .75rem 1rem; border-top: 1px solid var(--border); }
.pg-btn { padding: .26rem .65rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: rgba(255,255,255,.5); cursor: pointer; font-size: .73rem; color: var(--text-secondary); font-family: var(--font-ui); transition: all .13s; }
.pg-btn:disabled { background: rgba(255,255,255,.2); cursor: not-allowed; color: var(--text-muted); }
.pg-btn:not(:disabled):hover { border-color: var(--blue); color: var(--blue); background: rgba(255,255,255,.8); }
.pg-info { font-size: .72rem; color: var(--text-muted); padding: 0 .5rem; }

.filters { display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; margin-bottom: 1rem; }

/* ── PART 7: STAT CARDS ──────────────────────────────────────────────── */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: .85rem; margin-bottom: 1.5rem; }
.stat-card {
  background: rgba(255,255,255,.55);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-lg); border: 1px solid var(--border);
  padding: 1.1rem 1.2rem; cursor: pointer; transition: all .18s; position: relative; overflow: hidden;
  box-shadow: var(--shadow-sm);
}
.stat-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 55%, rgba(255,255,255,.45)); pointer-events: none; }
.stat-card::before { content: ''; position: absolute; top: -40%; right: -20%; width: 140px; height: 140px; background: radial-gradient(circle, rgba(96,165,250,.25), transparent 70%); pointer-events: none; }
.stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); border-color: #93c5fd; background: rgba(255,255,255,.72); }
.stat-icon { font-size: 1.25rem; margin-bottom: .5rem; }
.stat-val { font-size: 1.55rem; font-weight: 800; color: var(--text-primary); letter-spacing: -.03em; line-height: 1; margin-bottom: .3rem; }
.stat-label { font-size: .67rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .06em; }

/* ── PART 8: BADGES ──────────────────────────────────────────────────── */
.badge { display: inline-flex; align-items: center; padding: .18rem .52rem; border-radius: 100px; font-size: .63rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap; backdrop-filter: var(--glass-blur-sm); }
.badge-green  { background: var(--green-lt); color: #065f46; }
.badge-blue   { background: var(--blue-lt); color: #1e40af; }
.badge-amber  { background: var(--amber-lt); color: #92400e; }
.badge-red    { background: var(--red-lt); color: #991b1b; }
.badge-purple { background: var(--purple-lt); color: #5b21b6; }
.badge-teal   { background: var(--teal-lt); color: #0f766e; }
.badge-gray   { background: rgba(148,180,224,.15); color: #475569; }

/* ── PART 9: OVERLAYS / MODALS ───────────────────────────────────────── */
.overlay { position: fixed; inset: 0; background: rgba(15,33,64,.45); backdrop-filter: blur(8px); z-index: 600; display: flex; align-items: center; justify-content: center; padding: 1rem; animation: fadeIn .18s; }
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.modal {
  background: rgba(255,255,255,.78);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border-radius: var(--radius-xl); width: 100%; max-width: 620px; max-height: 90vh; overflow-y: auto;
  box-shadow: var(--shadow-xl); border: 1px solid rgba(255,255,255,.6);
  animation: slideUp .2s;
}
.modal-lg { max-width: 820px; }
@keyframes slideUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
.modal-head { padding: 1.15rem 1.4rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.modal-head-title { font-size: .95rem; font-weight: 700; color: var(--text-primary); }
.modal-body { padding: 1.35rem 1.4rem; display: flex; flex-direction: column; gap: .9rem; }
.modal-foot { padding: .9rem 1.4rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: .5rem; }

.field { display: flex; flex-direction: column; gap: .3rem; }
.field label { font-size: .67rem; font-weight: 700; color: var(--text-label); text-transform: uppercase; letter-spacing: .08em; }
.field .inp { width: 100%; }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: .9rem; }
.field-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: .75rem; }
.field-hint { font-size: .66rem; color: var(--text-muted); margin-top: .15rem; }

.toggle { width: 34px; height: 18px; background: rgba(148,163,184,.5); border-radius: 100px; position: relative; cursor: pointer; border: none; transition: background .2s; flex-shrink: 0; }
.toggle.on { background: linear-gradient(135deg, #10b981, #34d399); }
.toggle::after { content: ''; position: absolute; top: 2px; left: 2px; width: 14px; height: 14px; background: white; border-radius: 50%; transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.25); }
.toggle.on::after { transform: translateX(16px); }

.alert { padding: .6rem .9rem; border-radius: var(--radius-sm); font-size: .78rem; font-weight: 600; backdrop-filter: var(--glass-blur-sm); }
.alert-success { background: var(--green-lt); border: 1px solid rgba(16,185,129,.3); color: var(--green-dk); }
.alert-error { background: var(--red-lt); border: 1px solid rgba(239,68,68,.3); color: #991b1b; }
.alert-warn { background: var(--amber-lt); border: 1px solid rgba(245,158,11,.35); color: #92400e; }
.alert-info { background: var(--blue-lt); border: 1px solid rgba(59,130,246,.3); color: #1e40af; }

.confirm-dialog { max-width: 380px; }
.confirm-msg { font-size: .85rem; color: var(--text-secondary); line-height: 1.6; }

/* ── PART 10: DETAIL / EXPANDED ROWS ─────────────────────────────────── */
.detail-row td { background: rgba(219,234,254,.35) !important; border-bottom: 1px solid var(--border) !important; }
.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: .75rem; padding: .85rem 1rem; }
.detail-card { background: rgba(255,255,255,.6); backdrop-filter: var(--glass-blur-sm); border-radius: var(--radius); border: 1px solid var(--border); padding: .85rem; }
.detail-card-title { font-size: .6rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: .1em; margin-bottom: .5rem; }
.detail-row-item { display: flex; justify-content: space-between; padding: .22rem 0; border-bottom: 1px solid var(--border-2); font-size: .75rem; }
.detail-row-item:last-child { border-bottom: none; }
.detail-row-key { color: var(--text-muted); font-weight: 600; }
.detail-row-val { color: var(--text-secondary); max-width: 55%; text-align: right; word-break: break-all; }

/* ── PART 11: SUB-TABS ───────────────────────────────────────────────── */
.sub-tabbar { display: flex; gap: .4rem; flex-wrap: wrap; margin-bottom: 1.25rem; padding: .65rem; background: var(--surface); backdrop-filter: var(--glass-blur); border-radius: var(--radius); border: 1px solid var(--border); }
.sub-tab { padding: .38rem .85rem; border-radius: var(--radius-sm); font-size: .75rem; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; background: transparent; color: var(--text-muted); font-family: var(--font-ui); transition: all .13s; }
.sub-tab:hover { background: rgba(255,255,255,.5); color: var(--text-secondary); }
.sub-tab.active { background: linear-gradient(135deg, rgba(59,130,246,.16), rgba(125,211,252,.16)); color: var(--blue-dk); border-color: rgba(59,130,246,.3); }

.pay-badge { display: inline-flex; align-items: center; padding: .19rem .55rem; border-radius: 100px; font-size: .63rem; font-weight: 800; white-space: nowrap; backdrop-filter: var(--glass-blur-sm); }

.adm-tabbar { display: none; background: var(--topbar-bg); backdrop-filter: var(--glass-blur); border-bottom: 1px solid var(--topbar-border); overflow-x: auto; scrollbar-width: none; }
.adm-tabbar::-webkit-scrollbar { display: none; }
.mob-tab { flex-shrink: 0; padding: .6rem .8rem; border: none; background: transparent; font-family: var(--font-ui); font-size: .73rem; color: var(--sidebar-text); cursor: pointer; white-space: nowrap; border-bottom: 2px solid transparent; font-weight: 500; }
.mob-tab.active { color: #7dd3fc; border-bottom-color: #3b82f6; font-weight: 700; }

/* ── PART 12: MISC ───────────────────────────────────────────────────── */
.mono { font-family: var(--font-mono); }
.chip { display: inline-block; padding: .12rem .45rem; border-radius: 4px; font-size: .68rem; font-weight: 600; background: var(--blue-lt); color: var(--blue-dk); }
.empty-state { text-align: center; padding: 3.5rem 2rem; color: var(--text-muted); }
.empty-icon { font-size: 2.5rem; margin-bottom: .75rem; opacity: .5; }
.empty-text { font-size: .82rem; }
.spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spin .6s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
.section-inner { background: var(--surface); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur); border-radius: var(--radius-lg); border: 1px solid var(--border); padding: 1.25rem; margin-bottom: 1rem; box-shadow: var(--shadow-sm); }

/* ── PART 13: RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .adm-side { width: 200px; }
}
@media (max-width: 680px) {
  .adm-side { display: none; }
  .adm-tabbar { display: flex; }
  .adm-content { padding: 1rem; }
  .stat-grid { grid-template-columns: repeat(2, 1fr); gap: .65rem; }
  .field-row { grid-template-columns: 1fr; }
  .field-row3 { grid-template-columns: 1fr 1fr; }
  :root { --sidebar-w: 200px; }
}
`




const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'
const getToken = () => localStorage.getItem('accessToken')
const apiFetch = async (path, opts = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(opts.headers || {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
  return data
}


// ── JSON array field helpers ──────────────────────────────────
// Converts array ↔ newline-separated string for textarea editing
const arrToText = arr => (Array.isArray(arr) ? arr : []).join('\n')
const textToArr = txt => txt.split('\n').map(s => s.trim()).filter(Boolean)

// ── Gradient presets ─────────────────────────────────────────
const GRADIENT_PRESETS = [
  { label: 'Sky Blue',   val: 'linear-gradient(135deg, #007BA8 0%, #00BFFF 60%, #a0e9ff 100%)' },
  { label: 'Deep Blue',  val: 'linear-gradient(135deg, #0f4c6b 0%, #009FD4 60%, #22d3ee 100%)' },
  { label: 'Warm Earth', val: 'linear-gradient(135deg, #b56a28 0%, #d4a574 60%, #f5ede0 100%)' },
  { label: 'Dark Navy',  val: 'linear-gradient(135deg, #1a3a4a 0%, #2e6080 60%, #5b9ab5 100%)' },
  { label: 'Forest',     val: 'linear-gradient(135deg, #2d4a3e 0%, #3d6b5a 60%, #6a9e88 100%)' },
  { label: 'Ocean',      val: 'linear-gradient(135deg, #0369a1 0%, #0ea5e9 60%, #7dd3fc 100%)' },
  { label: 'Purple',     val: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 60%, #c4b5fd 100%)' },
  { label: 'Rose',       val: 'linear-gradient(135deg, #881337 0%, #e11d48 60%, #fda4af 100%)' },
]

const DS_BADGE = {
  unassigned: { label:'Unassigned', bg:'#f1f5f9', c:'#475569', dot:'#94a3b8' },
  assigned:   { label:'Assigned',   bg:'#eff6ff', c:'#1e40af', dot:'#3b82f6' },
  picked_up:  { label:'Picked Up',  bg:'#f5f3ff', c:'#5b21b6', dot:'#8b5cf6' },
  in_transit: { label:'In Transit', bg:'#ecfeff', c:'#0e7490', dot:'#14b8a6' },
  delivered:  { label:'Delivered',  bg:'#ecfdf5', c:'#065f46', dot:'#10b981' },
  failed:     { label:'Failed',     bg:'#fef2f2', c:'#991b1b', dot:'#ef4444' },
  returned:   { label:'Returned',   bg:'#faf5ff', c:'#6b21a8', dot:'#a855f7' },
}

const EMPTY_FORM = {
  title: '', region: '', type: '', status: 'Active', since: '', beneficiaries: '',
  emoji: '🤝', img_gradient: GRADIENT_PRESETS[0].val,
  short_desc: '', full_desc: '',
  tags_text: '', partners_text: '', outcomes_text: '',
  sort_order: 0, is_active: true,
}

function formToPayload(form) {
  return {
    title:         form.title,
    region:        form.region,
    type:          form.type,
    status:        form.status,
    since:         form.since,
    beneficiaries: form.beneficiaries,
    emoji:         form.emoji,
    img_gradient:  form.img_gradient,
    short_desc:    form.short_desc,
    full_desc:     form.full_desc,
    tags:          textToArr(form.tags_text),
    partners:      textToArr(form.partners_text),
    outcomes:      textToArr(form.outcomes_text),
    sort_order:    Number(form.sort_order) || 0,
    is_active:     form.is_active,
  }
}

function itemToForm(item) {
  return {
    title:          item.title         || '',
    region:         item.region        || '',
    type:           item.type          || '',
    status:         item.status        || 'Active',
    since:          item.since         || '',
    beneficiaries:  item.beneficiaries || '',
    emoji:          item.emoji         || '🤝',
    img_gradient:   item.img_gradient  || GRADIENT_PRESETS[0].val,
    short_desc:     item.short_desc    || '',
    full_desc:      item.full_desc     || '',
    tags_text:      arrToText(item.tags),
    partners_text:  arrToText(item.partners),
    outcomes_text:  arrToText(item.outcomes),
    sort_order:     item.sort_order    ?? 0,
    is_active:      item.is_active     !== false,
  }
}

// ── Mini gradient preview ─────────────────────────────────────
function GradientPreview({ gradient }) {
  return (
    <div style={{
      width: '100%', height: 48, borderRadius: 8,
      background: gradient, border: '1px solid var(--border)',
      marginTop: '.25rem',
    }} />
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
 function SocialWorkAdminSection() {
  const [programs, setPrograms] = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const [modal,    setModal]    = useState(null)   // null | { data: item|null }
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [saving,   setSaving]   = useState(false)
  const [saveErr,  setSaveErr]  = useState('')

  const [delConf,  setDelConf]  = useState(null)   // null | { id, label }
  const [preview,  setPreview]  = useState(null)   // null | item  (card preview)
  const [toast,    setToast]    = useState(null)
  const [search,   setSearch]   = useState('')

  const flash = (msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const fld = k => e => setForm(f => ({ ...f, [k]: e?.target ? e.target.value : e }))

  // ── Load ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = new URLSearchParams({ limit: 100, include_inactive: 'true' })
      if (search) params.set('search', search)
      const d = await apiFetch(`/admin/social-work-programs?${params}`)
      const items = d.items || d.programs || d.data || []
      setPrograms(items)
      setTotal(d.pagination?.total || items.length)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { load() }, [load])

  // ── Modal open/close ─────────────────────────────────────
  const openCreate = () => {
    setForm({ ...EMPTY_FORM, sort_order: programs.length + 1 })
    setSaveErr(''); setModal({ data: null })
  }
  const openEdit = item => {
    setForm(itemToForm(item)); setSaveErr(''); setModal({ data: item })
  }
  const closeModal = () => { setModal(null); setSaveErr('') }

  // ── Save ─────────────────────────────────────────────────
  const save = async () => {
    if (!form.title?.trim()) return setSaveErr('Title is required')
    setSaving(true); setSaveErr('')
    try {
      const body = formToPayload(form)
      if (modal.data) {
        await apiFetch(`/admin/social-work-programs/${modal.data.id}`, {
          method: 'PUT', body: JSON.stringify(body),
        })
        flash('Program updated ✓')
      } else {
        await apiFetch('/admin/social-work-programs', {
          method: 'POST', body: JSON.stringify(body),
        })
        flash('Program created ✓')
      }
      closeModal(); load()
    } catch (e) { setSaveErr(e.message) }
    finally { setSaving(false) }
  }

  // ── Delete ───────────────────────────────────────────────
  const doDelete = async () => {
    try {
      await apiFetch(`/admin/social-work-programs/${delConf.id}`, { method: 'DELETE' })
      flash('Program deactivated')
      setDelConf(null); load()
    } catch (e) { flash(e.message, false); setDelConf(null) }
  }

  // ── Quick toggle active ───────────────────────────────────
  const toggleActive = async (item) => {
    try {
      await apiFetch(`/admin/social-work-programs/${item.id}`, {
        method: 'PUT', body: JSON.stringify({ is_active: !item.is_active }),
      })
      load()
    } catch (e) { flash(e.message, false) }
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'relative' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.ok ? 'var(--green)' : 'var(--red)',
          color: 'white', padding: '.65rem 1.1rem', borderRadius: 'var(--radius)',
          fontWeight: 600, fontSize: '.82rem', boxShadow: 'var(--shadow-md)',
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="sec-head">
        <div>
          <h1 className="sec-title">Social Work Programs <span className="sec-count">({total})</span></h1>
          <p className="sec-sub">Manage the program cards and modal content shown on the Social Work page</p>
        </div>
        <div className="sec-actions">
          <button className="btn btn-ghost" onClick={load}>↺ Refresh</button>
          <button className="btn btn-primary" onClick={openCreate}>+ New Program</button>
        </div>
      </div>

      {/* Search */}
      <div className="filters">
        <input className="inp" value={search} onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && load()}
          placeholder="Search title / region / type…" style={{ width: 240 }} />
        {search && <button className="btn btn-ghost" onClick={() => setSearch('')}>✕ Clear</button>}
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '.85rem' }}>⚠️ {error}</div>}

      {/* Table */}
      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>{['#', 'Preview', 'Program', 'Type', 'Region', 'Since', 'Active', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td className="tbl-loading" colSpan={8}><span className="spinner" /> Loading…</td></tr>
                : programs.length === 0
                  ? <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">🤝</div><div className="empty-text">No programs yet. Click + New Program to add one.</div></div></td></tr>
                  : programs.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '.78rem', width: 32 }}>{p.sort_order}</td>

                        {/* Gradient preview swatch */}
                        <td style={{ width: 72 }}>
                          <div style={{
                            width: 56, height: 36, borderRadius: 8,
                            background: p.img_gradient,
                            border: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem',
                          }}>{p.emoji}</div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 600, fontSize: '.83rem' }}>{p.title}</div>
                          <div style={{ fontSize: '.7rem', color: 'var(--text-muted)', marginTop: '.1rem' }}>
                            {p.beneficiaries && <span style={{ marginRight: '.5rem' }}>👥 {p.beneficiaries}</span>}
                            {Array.isArray(p.tags) && p.tags.slice(0, 2).map(t => (
                              <span key={t} style={{ marginRight: '.3rem', background: 'var(--blue-lt)', color: 'var(--blue-dk)', padding: '1px 6px', borderRadius: 100, fontSize: '.62rem', fontWeight: 700 }}>#{t}</span>
                            ))}
                          </div>
                        </td>

                        <td style={{ fontSize: '.76rem' }}>{p.type || '—'}</td>
                        <td style={{ fontSize: '.74rem', color: 'var(--text-muted)' }}>{p.region || '—'}</td>
                        <td style={{ fontSize: '.74rem' }}>{p.since || '—'}</td>

                        <td>
                          <Toggle on={p.is_active} onChange={() => toggleActive(p)} />
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap' }}>
                            <button className="btn btn-ghost btn-sm" title="Preview card" onClick={() => setPreview(p)}>👁</button>
                            <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={() => openEdit(p)}>✏️</button>
                            <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={() => setDelConf({ id: p.id, label: p.title })}>🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* ── EDIT / CREATE MODAL ─────────────────────────────── */}
      {modal && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <div className="modal-head">
              <span className="modal-head-title">{modal.data ? '✏️ Edit Program' : '+ New Social Work Program'}</span>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>

              {/* ── Row 1: emoji + title ── */}
              <div className="field-row">
                <div className="field" style={{ flex: '0 0 80px' }}>
                  <label>Emoji</label>
                  <input className="inp" value={form.emoji} onChange={fld('emoji')}
                    style={{ textAlign: 'center', fontSize: '1.4rem' }} />
                </div>
                <div className="field" style={{ flex: 1 }}>
                  <label>Title *</label>
                  <input className="inp" value={form.title} onChange={fld('title')} placeholder="e.g. Rural Mental Health Outreach" />
                </div>
              </div>

              {/* ── Row 2: type + status ── */}
              <div className="field-row">
                <div className="field">
                  <label>Program Type</label>
                  <input className="inp" value={form.type} onChange={fld('type')} placeholder="e.g. Community Outreach" />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select className="inp" value={form.status} onChange={fld('status')}>
                    {['Active', 'Paused', 'Completed', 'Upcoming'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Row 3: region + since + beneficiaries ── */}
              <div className="field-row3" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
                <div className="field">
                  <label>Region / Location</label>
                  <input className="inp" value={form.region} onChange={fld('region')} placeholder="e.g. Sindhupalchok & Dolakha" />
                </div>
                <div className="field">
                  <label>Since (year)</label>
                  <input className="inp" value={form.since} onChange={fld('since')} placeholder="2020" />
                </div>
                <div className="field">
                  <label>Beneficiaries</label>
                  <input className="inp" value={form.beneficiaries} onChange={fld('beneficiaries')} placeholder="1,200+" />
                </div>
              </div>

              {/* ── Gradient picker ── */}
              <div className="field">
                <label>Card Gradient</label>
                <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.4rem' }}>
                  {GRADIENT_PRESETS.map(g => (
                    <button key={g.label} type="button"
                      onClick={() => setForm(f => ({ ...f, img_gradient: g.val }))}
                      style={{
                        width: 48, height: 32, borderRadius: 6,
                        background: g.val,
                        border: form.img_gradient === g.val ? '2.5px solid var(--blue)' : '1.5px solid var(--border)',
                        cursor: 'pointer', position: 'relative',
                      }}
                      title={g.label}
                    />
                  ))}
                </div>
                <input className="inp mono" value={form.img_gradient} onChange={fld('img_gradient')}
                  placeholder="linear-gradient(…)" style={{ fontSize: '.72rem' }} />
                <GradientPreview gradient={form.img_gradient} />
              </div>

              {/* ── Short description (card) ── */}
              <div className="field">
                <label>Short Description (shown on card)</label>
                <textarea className="inp" rows={3} value={form.short_desc} onChange={fld('short_desc')}
                  placeholder="Brief 2-3 sentence summary shown on the card" />
                <div className="field-hint">{form.short_desc.length}/300 chars recommended</div>
              </div>

              {/* ── Full description (modal) ── */}
              <div className="field">
                <label>Full Description (shown in detail modal)</label>
                <textarea className="inp" rows={5} value={form.full_desc} onChange={fld('full_desc')}
                  placeholder="Detailed description shown when user clicks 'Learn More'" />
              </div>

              {/* ── Tags / Partners / Outcomes ── */}
              <div className="field-row3">
                <div className="field">
                  <label>Tags (one per line)</label>
                  <textarea className="inp" rows={4} value={form.tags_text} onChange={fld('tags_text')}
                    placeholder={'Trauma\nRural\nPost-Disaster'} style={{ resize: 'vertical' }} />
                  <div className="field-hint">Shown as #hashtags on the card</div>
                </div>
                <div className="field">
                  <label>Partners (one per line)</label>
                  <textarea className="inp" rows={4} value={form.partners_text} onChange={fld('partners_text')}
                    placeholder={'WHO Nepal\nTPO Nepal\nFCHVs'} style={{ resize: 'vertical' }} />
                  <div className="field-hint">Shown in detail modal</div>
                </div>
                <div className="field">
                  <label>Key Outcomes (one per line)</label>
                  <textarea className="inp" rows={4} value={form.outcomes_text} onChange={fld('outcomes_text')}
                    placeholder={'1,200 screenings\n340 referred to care\n80 FCHVs trained'} style={{ resize: 'vertical' }} />
                  <div className="field-hint">Shown with ✓ checkmarks</div>
                </div>
              </div>

              {/* ── Sort order + Active ── */}
              <div className="field-row">
                <div className="field">
                  <label>Sort Order</label>
                  <input className="inp" type="number" min="0" value={form.sort_order} onChange={fld('sort_order')} />
                  <div className="field-hint">Lower = shown first on the page</div>
                </div>
                <div className="field" style={{ justifyContent: 'flex-end', paddingBottom: '.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', marginTop: 'auto' }}>
                    <Toggle on={form.is_active} onChange={v => setForm(f => ({ ...f, is_active: v }))} />
                    <span style={{ fontSize: '.78rem' }}>Active (visible on site)</span>
                  </label>
                </div>
              </div>

              {saveErr && <div className="alert alert-error">{saveErr}</div>}
            </div>

            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setPreview(formToPayload({ ...form, tags: textToArr(form.tags_text), partners: textToArr(form.partners_text), outcomes: textToArr(form.outcomes_text) }))}>
                👁 Preview
              </button>
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : modal.data ? 'Save Changes' : 'Create Program'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CARD PREVIEW MODAL ─────────────────────────────── */}
      {preview && (
        <div className="overlay" onClick={() => setPreview(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
            padding: '1.5rem', maxWidth: 480, width: '100%',
            boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontWeight: 700, fontSize: '.9rem' }}>Card Preview</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>✕</button>
            </div>

            {/* Simulated card */}
            <div style={{ borderRadius: 16, background: 'white', border: '1.5px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              {/* Image area */}
              <div style={{ height: 140, background: preview.img_gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span style={{ fontSize: '2.8rem' }}>{preview.emoji}</span>
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(0,255,120,0.2)', border: '1px solid rgba(0,255,120,0.35)', borderRadius: 100, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e676', display: 'inline-block' }} />
                  <span style={{ fontSize: '.6rem', fontWeight: 800, color: 'white' }}>{preview.status?.toUpperCase() || 'ACTIVE'}</span>
                </div>
                {preview.since && (
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 100, padding: '2px 8px', fontSize: '.6rem', fontWeight: 700, color: 'white' }}>Since {preview.since}</div>
                )}
                {/* Floating type label */}
                <div style={{ position: 'absolute', bottom: -12, left: '50%', transform: 'translateX(-50%)', background: 'white', border: '1.5px solid #b0d4e8', borderRadius: 100, padding: '4px 14px', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,.1)', zIndex: 2 }}>
                  <span style={{ fontSize: '.68rem', fontWeight: 800, color: '#2e6080' }}>{preview.type || 'Program Type'}</span>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '1.25rem 1.25rem 1rem', paddingTop: '1.5rem' }}>
                <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#1a3a4a', marginBottom: '.25rem' }}>{preview.title || 'Program Title'}</div>
                <div style={{ fontSize: '.7rem', color: '#007BA8', fontWeight: 700, marginBottom: '.6rem' }}>📍 {preview.region || 'Region'}</div>
                <p style={{ fontSize: '.76rem', color: '#7a9aaa', lineHeight: 1.6, marginBottom: '.75rem' }}>
                  {(preview.short_desc || preview.desc || '').slice(0, 120)}{(preview.short_desc || '').length > 120 ? '…' : ''}
                </p>

                {/* Tags */}
                {Array.isArray(preview.tags) && preview.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '.3rem', flexWrap: 'wrap', marginBottom: '.75rem' }}>
                    {preview.tags.map(t => (
                      <span key={t} style={{ fontSize: '.62rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: '#F0FBFF', color: '#009FD4', border: '1px solid #daeef8' }}>#{t}</span>
                    ))}
                  </div>
                )}

                {/* Outcomes */}
                {Array.isArray(preview.outcomes) && preview.outcomes.length > 0 && (
                  <div style={{ background: '#F0FBFF', borderRadius: 8, padding: '.6rem .8rem', marginBottom: '.85rem', border: '1px solid #daeef8' }}>
                    <div style={{ fontSize: '.62rem', fontWeight: 800, color: '#7a9aaa', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '.35rem' }}>Key Outcomes</div>
                    {preview.outcomes.slice(0, 3).map((o, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.35rem', marginBottom: '.2rem' }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'linear-gradient(135deg,#007BA8,#00BFFF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: '.45rem', color: 'white', fontWeight: 800 }}>✓</span>
                        </span>
                        <span style={{ fontSize: '.72rem', color: '#2e6080' }}>{o}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.9rem', color: '#1a3a4a' }}>{preview.beneficiaries || '—'}</div>
                    <div style={{ fontSize: '.62rem', color: '#7a9aaa' }}>beneficiaries</div>
                  </div>
                  <div style={{ padding: '.45rem 1rem', borderRadius: 8, background: '#E0F7FF', color: '#009FD4', fontSize: '.76rem', fontWeight: 700 }}>Learn More →</div>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '.72rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '.75rem' }}>
              This is an approximate preview. The live page may look slightly different.
            </p>
            <div style={{ textAlign: 'center', marginTop: '.5rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>Close Preview</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delConf && (
        <Confirm
          msg={`Deactivate program "${delConf.label}"? It will be hidden from the site but not permanently deleted.`}
          onConfirm={doDelete}
          onCancel={() => setDelConf(null)}
        />
      )}
    </div>
  )
}


function injectCSS() {
  if (document.getElementById('adm-v2-css')) return
  const s = document.createElement('style')
  s.id = 'adm-v2-css'
  s.textContent = CSS
  document.head.appendChild(s)
}

// ─── STATUS → BADGE ──────────────────────────────────────────────────────────
function statusVariant(s) {
  const map = {
    pending:'badge-amber', pending_cod:'badge-amber', confirmed:'badge-green',
    completed:'badge-blue', cancelled:'badge-red', refunded:'badge-purple',
    shipped:'badge-teal', delivered:'badge-blue', processing:'badge-amber',
    active:'badge-green', paused:'badge-amber', reviewing:'badge-blue',
    approved:'badge-green', rejected:'badge-red', waitlisted:'badge-amber',
    published:'badge-green', draft:'badge-gray', archived:'badge-purple',
    free:'badge-green', premium:'badge-purple', open:'badge-green',
    paid:'badge-green', unpaid:'badge-amber', overdue:'badge-red',
    new:'badge-blue', resolved:'badge-green', in_progress:'badge-teal',
    client:'badge-green', therapist:'badge-blue', admin:'badge-purple',
    staff:'badge-amber', beginner:'badge-green', intermediate:'badge-amber',
    advanced:'badge-purple', failed:'badge-red',
    true:'badge-green', false:'badge-red',
  }
  return map[String(s)?.toLowerCase()] || 'badge-gray'
}
function Badge({ s }) { return <span className={`badge ${statusVariant(s)}`}>{String(s)}</span> }
function Toggle({ on, onChange }) { return <button type="button" className={`toggle${on ? ' on' : ''}`} onClick={() => onChange(!on)} /> }
function Pager({ page, set, total, limit = LIMIT }) {
  const tp = Math.max(1, Math.ceil(total / limit))
  if (tp <= 1) return null
  return (
    <div className="pager">
      <button className="pg-btn" onClick={() => set(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
      <span className="pg-info">{page} / {tp} · <strong>{total}</strong> total</span>
      <button className="pg-btn" onClick={() => set(p => Math.min(tp, p + 1))} disabled={page === tp}>Next →</button>
    </div>
  )
}

function Confirm({ msg, onConfirm, onCancel, danger = true }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><span className="modal-head-title">{danger ? '⚠️ Confirm Action' : '❓ Confirm'}</span></div>
        <div className="modal-body"><p className="confirm-msg">{msg}</p></div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, sub, count, onNew, newLabel = '+ New', children }) {
  return (
    <div className="sec-head">
      <div>
        <h1 className="sec-title">{title}{count != null && <span className="sec-count">({count})</span>}</h1>
        {sub && <p className="sec-sub">{sub}</p>}
      </div>
      <div className="sec-actions">
        {children}
        {onNew && <button className="btn btn-primary" onClick={onNew}>{newLabel}</button>}
      </div>
    </div>
  )
}

function Table({ cols, rows, loading, empty = 'No records found.' }) {
  return (
    <div className="tbl-wrap">
      <div className="tbl-scroll">
        <table className="tbl">
          <thead><tr>{cols.map(c => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {loading
              ? <tr><td className="tbl-loading" colSpan={cols.length}><span className="spinner" /> Loading…</td></tr>
              : rows.length === 0
                ? <tr><td colSpan={cols.length}><div className="empty-state"><div className="empty-icon">📭</div><div className="empty-text">{empty}</div></div></td></tr>
                : rows}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RowActions({ onEdit, onDelete, children }) {
  return (
    <div style={{ display:'flex', gap:'.3rem', flexWrap:'wrap' }}>
      {children}
      {onEdit && <button className="btn btn-ghost btn-sm btn-icon" title="Edit" onClick={onEdit}>✏️</button>}
      {onDelete && <button className="btn btn-danger btn-sm btn-icon" title="Delete" onClick={onDelete}>🗑</button>}
    </div>
  )
}

function resolveClientName(r) {
  return r.client_name || r.clients?.full_name || r.profiles?.full_name || r.client?.full_name || r.user?.full_name || (r.client_id ? `…${String(r.client_id).slice(-6)}` : '—')
}
function resolveTherapistName(r) {
  return r.therapist_name || r.therapists?.profiles?.full_name || r.therapist?.full_name || (r.therapist_id ? `…${String(r.therapist_id).slice(-6)}` : '—')
}
function resolvePaymentDetails(pay) {
  const clientName = pay.client_name || pay.profiles?.full_name || pay.clients?.full_name || pay.client?.full_name || (pay.client_id ? `…${String(pay.client_id).slice(-6)}` : '—')
  let category = '—'
  if (pay.category === 'community_group_membership' || pay.metadata?.item_type === 'community_group_membership') category = '🏘 Group Joined'
  else if (pay.category === 'community_session') category = '📅 Session'
  else if (pay.appointment_id) category = '📋 Appointment'
  else if (pay.order_id) category = '📦 Order'
  else if (pay.category) category = pay.category
const isPending = pay.status === 'pending_cod' ||
  (pay.status === 'pending' && pay.method !== 'esewa')
    return { clientName, category, isPending }
}

function PayBadge({ status }) {
  const MAP = {
    completed:   { bg:'#ecfdf5', c:'#065f46', t:'✓ Verified' },
    pending_cod: { bg:'#fffbeb', c:'#92400e', t:'⏳ COD' },
    pending:     { bg:'#fffbeb', c:'#92400e', t:'⏳ Pending' },
    failed:      { bg:'#fef2f2', c:'#991b1b', t:'✗ Failed' },
    refunded:    { bg:'#f5f3ff', c:'#5b21b6', t:'↩ Refunded' },
    free:        { bg:'#ecfdf5', c:'#065f46', t:'🎁 Free' },
    paid:        { bg:'#ecfdf5', c:'#065f46', t:'✓ Paid' },
    unpaid:      { bg:'#f1f5f9', c:'#475569', t:'○ Unpaid' },
  }
  const v = MAP[status] || { bg:'#f1f5f9', c:'#475569', t: status || '—' }
  return <span className="pay-badge" style={{ background:v.bg, color:v.c }}>{v.t}</span>
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
const SIDEBAR = [
{ group:'Core', items:[
    { id:'dashboard',     label:'Dashboard',       icon:'◈' },
    { id:'users',         label:'Users',           icon:'◎' },
    { id:'appointments',  label:'Appointments',    icon:'▦' },
    { id:'orders',        label:'Orders',          icon:'⬡' },
    { id:'payments',      label:'Payments',        icon:'◉' },
    { id:'notifications', label:'Send Notify',     icon:'◈' },
    { id:'sms',           label:'Send SMS',        icon:'📨' },
    { id:'reviews',       label:'Video Reviews',   icon:'▶' },
  ]},
  { group:'Content', items:[
    { id:'posts',          label:'Blog Posts',     icon:'✦' },
    { id:'news',           label:'News',           icon:'◆' },
    { id:'resources',      label:'Resources',      icon:'▣' },
    { id:'gallery',        label:'Gallery',        icon:'▦' },
    { id:'research',       label:'Research',       icon:'◈' },
    { id:'psych_videos',   label:'Psych Videos',   icon:'▶' },
    { id:'psych_analyses', label:'Psych Analyses', icon:'◎' },
    { id:'psych_concepts', label:'Psych Concepts', icon:'◆' },
    { id:'room_bookings',  label:'Room Bookings',  icon:'▣' },
  ]},
  { group:'Services', items:[
    { id:'products',            label:'Products',          icon:'⬡' },
    { id:'courses',             label:'Courses',           icon:'◈' },
    { id:'assessments',         label:'Assessments',       icon:'▦' },
    { id:'therapists',          label:'Therapists',        icon:'◎' },
    { id:'community',           label:'Community Groups',  icon:'◉' },
    { id:'community_admin',     label:'Community Admin',   icon:'◆' },
    { id:'social_work', label:'Social Work', sicon:'🤝' },
    { id:'product_reviews', label:'Product Reviews', icon:'⭐' },
    { id:'volunteers',          label:'Volunteers',        icon:'✦' },
    { id:'gallery_submissions', label:'Photo Submissions', icon:'▣' },
    { id:'workshops',           label:'Workshops',         icon:'◈' },
  ]},
{ group:'System', items:[
    { id:'hero_stats',    label:'Hero Stats',    icon:'✦' },
    { id:'faqs',          label:'FAQs',          icon:'◎' },
    { id:'coupons',       label:'Coupons',       icon:'◆' },
    { id:'contacts',      label:'Contact Msgs',  icon:'▦' },
    { id:'subscriptions', label:'Subscriptions', icon:'◈' },
    { id:'delivery_riders', label:'Delivery Riders', icon:'🚴' },
    { id:'settings',      label:'Site Settings', icon:'⬡' },
  ]},
]

// ─── PAYMENTS SECTION ────────────────────────────────────────────────────────
function PaymentsSection() {
  const [pays, setPays]         = useState([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [status, setStatus]     = useState('')
  const [method, setMethod]     = useState('')
  const [cat, setCat]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [confirming, setConfirming] = useState(null)
  const [busy, setBusy]         = useState({})
  const [summary, setSummary]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, limit: LIMIT })
      if (status) p.set('status', status)
      if (method) p.set('method', method)
      if (cat) p.set('category', cat)
      const d = await apiFetch(`/admin/payments?${p}`)
      const list = d.payments || d.items || d.data || []
      setPays(list); setTotal(d.pagination?.total || d.total || list.length)
      let rev = 0
      try {
        const all = await apiFetch('/admin/payments?page=1&limit=200&status=completed')
        rev = (all.payments || all.items || all.data || []).reduce((s, p) => s + Number(p.amount || 0), 0)
      } catch {}
      setSummary({ total:list.length, completed:list.filter(p=>p.status==='completed').length, pending:list.filter(p=>['pending','pending_cod'].includes(p.status)).length, failed:list.filter(p=>p.status==='failed').length, revenue:rev })
    } catch (e) { console.error('Payments:', e) }
    finally { setLoading(false) }
  }, [page, status, method, cat])

  useEffect(() => { load() }, [load])

 const confirm = async id => {
    setBusy(b => ({ ...b, [id]:true }))
    try { await apiFetch(`/admin/payments/${id}`, { method:'PUT', body:JSON.stringify({ status:'completed' }) }); setConfirming(null); load() }
    catch (e) { alert(e.message) }
    finally { setBusy(b => ({ ...b, [id]:false })) }
  }

  // Rejecting/refunding a payment must also free the slot it was holding —
  // otherwise the appointment/room stays 'pending' forever, permanently
  // locking that date+time even though no money ever cleared for it.
  const releaseBookingForPayment = async id => {
    const pay = pays.find(p => p.id === id)
    if (!pay) return
    try {
      if (pay.appointment_id) {
        await adminApi.updateAppointmentStatus(pay.appointment_id, 'cancelled')
      }
      if (pay.room_booking_id) {
        await apiFetch(`/admin/room-bookings/${pay.room_booking_id}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'cancelled', reason: 'Payment rejected/refunded by admin' }),
        })
      }
    } catch (e) {
      console.error('releaseBookingForPayment:', e.message)
    }
  }

  const reject = async id => {
    setBusy(b => ({ ...b, [id]:true }))
    try {
      await apiFetch(`/admin/payments/${id}`, { method:'PUT', body:JSON.stringify({ status:'failed' }) })
      await releaseBookingForPayment(id)
      load()
    }
    catch (e) { alert(e.message) }
    finally { setBusy(b => ({ ...b, [id]:false })) }
  }
  const refund = async id => {
    try {
      await apiFetch(`/admin/payments/${id}`, { method:'PUT', body:JSON.stringify({ status:'refunded' }) })
      await releaseBookingForPayment(id)
      load()
    }
    catch (e) { alert(e.message) }
  }

  const SUMCARDS = summary ? [
    { label:'This Page',    val:summary.total,     color:'#f1f5f9', tc:'var(--text-primary)' },
    { label:'Completed',    val:summary.completed, color:'#ecfdf5', tc:'#065f46' },
    { label:'Pending / COD',val:summary.pending,   color:'#fffbeb', tc:'#92400e' },
    { label:'Failed',       val:summary.failed,    color:'#fef2f2', tc:'#991b1b' },
    { label:'Total Revenue',val:`NPR ${summary.revenue.toLocaleString()}`, color:'#eff6ff', tc:'#1e40af' },
  ] : []

  const rows = loading
    ? [<tr key="ld"><td className="tbl-loading" colSpan={8}><span className="spinner" /> Loading…</td></tr>]
    : pays.length === 0
      ? [<tr key="e"><td colSpan={8}><div className="empty-state"><div className="empty-icon">💳</div><div className="empty-text">No payments found</div></div></td></tr>]
      : pays.flatMap(pay => {
          const { clientName, category, isPending } = resolvePaymentDetails(pay)
          const isExp = expanded === pay.id
          const main = (
            <tr key={pay.id} style={{ cursor:'pointer' }} onClick={() => setExpanded(isExp ? null : pay.id)}>
              <td>
                <div style={{ fontWeight:600, fontSize:'.82rem', color:'var(--text-primary)' }}>{clientName}</div>
                <div className="mono" style={{ fontSize:'.66rem', color:'var(--text-muted)' }}>{pay.transaction_id || String(pay.id || '').slice(0,12)}</div>
              </td>
              <td><strong style={{ fontSize:'.85rem' }}>NPR {Number(pay.amount || 0).toLocaleString()}</strong></td>
              <td><span className="mono" style={{ fontSize:'.73rem', fontWeight:700, color:'var(--teal)', textTransform:'uppercase' }}>{pay.method || '—'}</span></td>
              <td><span style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>{category}</span></td>
              <td><PayBadge status={pay.status} /></td>
              <td><Badge s={pay.status} /></td>
              <td style={{ fontSize:'.74rem', color:'var(--text-muted)' }}>{fmt(pay.created_at)}</td>
              <td onClick={e => e.stopPropagation()}>
                <div style={{ display:'flex', gap:'.3rem', flexWrap:'wrap' }}>
                  {isPending && <>
                    <button className="btn btn-success btn-sm" disabled={busy[pay.id]} onClick={() => setConfirming(pay.id)}>✓</button>
                    <button className="btn btn-danger btn-sm" disabled={busy[pay.id]} onClick={() => reject(pay.id)}>✗</button>
                  </>}
                  {pay.status === 'completed' && <button className="btn btn-ghost btn-sm" onClick={() => refund(pay.id)}>↩</button>}
                  <button className="btn btn-ghost btn-sm btn-icon">{isExp ? '▲' : '▼'}</button>
                </div>
              </td>
            </tr>
          )
          if (!isExp) return [main]
          const gw = pay.gateway_response
          const detail = (
            <tr key={`${pay.id}-d`} className="detail-row">
              <td colSpan={8} style={{ padding:0 }}>
                <div className="detail-grid">
                  <div className="detail-card">
                    <div className="detail-card-title">Payment Details</div>
                    {[['ID',pay.id],['Transaction',pay.transaction_id||'—'],['Method',pay.method||'—'],['Category',category],['Paid At',pay.paid_at?fmtT(pay.paid_at):'—'],['Created',fmtT(pay.created_at)]].map(([k,v]) => (
                      <div key={k} className="detail-row-item"><span className="detail-row-key">{k}</span><span className="detail-row-val mono" style={{ fontSize:['ID','Transaction'].includes(k)?'.66rem':'.74rem' }}>{v}</span></div>
                    ))}
                  </div>
                  {gw && (
                    <div className="detail-card">
                      <div className="detail-card-title">Gateway Response</div>
                      <pre style={{ fontSize:'.68rem', color:'var(--text-secondary)', overflowX:'auto', whiteSpace:'pre-wrap', wordBreak:'break-all', fontFamily:'var(--font-mono)' }}>
                        {typeof gw === 'string' ? gw : JSON.stringify(gw, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          )
          return [main, detail]
        })

  return (
    <div>
      <SectionHeader title="Payments" sub="Verify, confirm and manage all payment records">
        <button className="btn btn-ghost" onClick={load}>↺ Refresh</button>
      </SectionHeader>
      {SUMCARDS.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'.65rem', marginBottom:'1.25rem' }}>
          {SUMCARDS.map((s,i) => (
            <div key={i} style={{ background:s.color, borderRadius:'var(--radius)', padding:'.85rem', border:'1px solid var(--border)' }}>
              <div style={{ fontSize:'1.1rem', fontWeight:800, color:s.tc, letterSpacing:'-.02em' }}>{s.val}</div>
              <div style={{ fontSize:'.63rem', color:'var(--text-muted)', fontWeight:700, marginTop:'.2rem', textTransform:'uppercase', letterSpacing:'.07em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
     {pays.some(p => p.status === 'pending_cod') && (
  <div className="alert alert-warn" style={{ marginBottom:'.85rem' }}>
    ⚠️ <strong>{pays.filter(p => p.status === 'pending_cod').length} COD payment(s)</strong> awaiting manual confirmation.
  </div>
)}
{pays.some(p => p.status === 'pending' && p.method === 'esewa') && (
  <div className="alert alert-info" style={{ marginBottom:'.85rem' }}>
    ⏳ <strong>{pays.filter(p => p.status === 'pending' && p.method === 'esewa').length} eSewa payment(s)</strong> pending — confirm automatically via eSewa callback. No action needed.
  </div>
)}
      <div className="filters">
        <select className="inp" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['pending','pending_cod','completed','failed','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="inp" value={method} onChange={e => { setMethod(e.target.value); setPage(1) }}>
          <option value="">All methods</option>
          {['esewa','khalti','stripe','bank_transfer','cash','fonepay'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="inp" value={cat} onChange={e => { setCat(e.target.value); setPage(1) }}>
          <option value="">All categories</option>
          {['appointment','order','community_group_membership','community_session','other'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead><tr>{['Client','Amount','Method','Category','Validity','Status','Date','Actions'].map(c => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{rows}</tbody>
          </table>
        </div>
      </div>
      <Pager page={page} set={setPage} total={total} />
      {confirming && (
        <Confirm msg={`Mark payment of NPR ${Number(pays.find(p => p.id === confirming)?.amount || 0).toLocaleString()} as completed?`} onConfirm={() => confirm(confirming)} onCancel={() => setConfirming(null)} />
      )}
    </div>
  )
}

// ─── HERO STATS SECTION ───────────────────────────────────────────────────────
function HeroStatsSection() {
  const DEFS = { hero_clients_count:'500', hero_therapists_count:'12', hero_rating:'4.9', hero_families_count:'500', hero_pill_rating:'4.9' }
  const [vals, setVals]       = useState(DEFS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [result, setResult]   = useState(null)

  useEffect(() => {
    ;(async () => {
      try {
        const d = await apiFetch('/admin/settings')
        const list = d.settings || d.data || []
        const m = { ...DEFS }
        list.forEach(s => { if (s.key in m) m[s.key] = String(s.value ?? m[s.key]) })
        setVals(m)
      } catch {}
      finally { setLoading(false) }
    })()
  }, [])

  const save = async () => {
    setSaving(true); setResult(null)
    let ok = 0
    for (const [key, value] of Object.entries(vals)) {
      try {
        await apiFetch(`/admin/settings/${key}`, { method:'PUT', body:JSON.stringify({ value }) })
          .catch(() => apiFetch('/admin/settings', { method:'POST', body:JSON.stringify({ key, value }) }))
        ok++
      } catch {}
    }
    setSaving(false)
    setResult(ok === Object.keys(vals).length ? { ok:true, msg:`✓ All ${ok} stats saved.` } : { ok:false, msg:`⚠ Saved ${ok}/${Object.keys(vals).length} values.` })
  }

  if (loading) return <div className="tbl-loading"><span className="spinner" /> Loading…</div>
  return (
    <div>
      <SectionHeader title="Hero Stats" sub="Numbers shown on the public homepage" />
      <div className="section-inner">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'.85rem' }}>
          {Object.entries(vals).map(([key, val]) => (
            <div key={key} className="field">
              <label>{key}</label>
              <input className="inp" type="number" value={val} onChange={e => setVals(v => ({ ...v, [key]:e.target.value }))} />
            </div>
          ))}
        </div>
        <div style={{ marginTop:'1.25rem', display:'flex', gap:'.85rem', alignItems:'center', flexWrap:'wrap' }}>
          <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? <><span className="spinner" /> Saving…</> : '💾 Save All Stats'}</button>
          {result && <div className={`alert ${result.ok ? 'alert-success' : 'alert-error'}`}>{result.msg}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── SMS SECTION ──────────────────────────────────────────────────────────
const SMS_ROLES = [
  { key: 'customer',  label: 'Users' },
  { key: 'staff',     label: 'Staff' },
  { key: 'rider',     label: 'Delivery Riders' },
  { key: 'therapist', label: 'Therapists' },
]

function SmsSection() {
  const [role, setRole]           = useState('customer')
  const [templates, setTemplates] = useState({})
  const [templateId, setTemplateId] = useState('')
  const [message, setMessage]     = useState('')
  const [search, setSearch]       = useState('')
  const [recipients, setRecipients] = useState([])
  const [selected, setSelected]   = useState({})
  const [mode, setMode]           = useState('select')   // 'select' | 'broadcast'
  const [loading, setLoading]     = useState(false)
  const [sending, setSending]     = useState(false)
 const [logs, setLogs]           = useState([])
  const [showLogs, setShowLogs]   = useState(false)
  const [toast, setToast]         = useState(null)
  const [confirmSend, setConfirmSend] = useState(false)

  const flash = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200) }

  useEffect(() => { apiFetch('/admin/sms/templates').then(setTemplates).catch(() => {}) }, [])

  const loadRecipients = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ role })
      if (search) p.set('search', search)
      const d = await apiFetch(`/admin/sms/recipients?${p}`)
      setRecipients(d.items || [])
    } catch (e) { flash(e.message, false) }
    finally { setLoading(false) }
  }, [role, search])

  useEffect(() => { loadRecipients() }, [loadRecipients])
  useEffect(() => { setSelected({}); setTemplateId(''); setMessage('') }, [role])

  function applyTemplate(id) {
    setTemplateId(id)
    const t = (templates[role] || []).find(t => t.id === id)
    setMessage(t ? t.text : '')
  }

  const toggleOne = id => setSelected(s => ({ ...s, [id]: !s[id] }))
  const toggleAll = () => {
    const allSel = recipients.every(r => selected[r.id])
    const next = {}
    if (!allSel) recipients.forEach(r => next[r.id] = true)
    setSelected(next)
  }
  const selectedCount = Object.values(selected).filter(Boolean).length

  async function loadLogs() {
    try { const d = await apiFetch('/admin/sms/logs'); setLogs(d.items || []); setShowLogs(true) }
    catch (e) { flash(e.message, false) }
  }

function handleSend() {
    if (!message.trim()) return flash('Message cannot be empty', false)
    if (mode === 'select' && selectedCount === 0) return flash('Select at least one recipient', false)
    setConfirmSend(true)
  }

  async function doSend() {
    setConfirmSend(false)
    setSending(true)
    try {
      const body = mode === 'broadcast'
        ? { mode: 'broadcast', role, message }
        : { mode: 'select', role, recipient_ids: Object.keys(selected).filter(id => selected[id]), message }
      const d = await apiFetch('/admin/sms/send', { method: 'POST', body: JSON.stringify(body) })
      flash(`✓ Sent to ${d.sent} recipient(s)`)
      setSelected({})
    } catch (e) { flash(e.message, false) }
    finally { setSending(false) }
  }

  return (
    <div style={{ position: 'relative' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.ok ? 'var(--green)' : 'var(--red)', color: 'white',
          padding: '.65rem 1.1rem', borderRadius: 'var(--radius)', fontWeight: 600,
          fontSize: '.82rem', boxShadow: 'var(--shadow-md)',
        }}>{toast.msg}</div>
      )}

      <SectionHeader title="Send SMS" sub="Notify users, staff, riders, or therapists via Sparrow SMS">
        <button className="btn btn-ghost" onClick={loadLogs}>🕓 History</button>
      </SectionHeader>

      {/* Role tabs */}
      <div className="sub-tabbar">
        {SMS_ROLES.map(r => (
          <button key={r.key} className={`sub-tab${role === r.key ? ' active' : ''}`} onClick={() => setRole(r.key)}>
            {r.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* LEFT: Recipients */}
        <div className="tbl-wrap">
          <div style={{ padding: '.85rem .9rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '.9rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.78rem', fontWeight: 600 }}>
              <input type="radio" checked={mode === 'select'} onChange={() => setMode('select')} /> Select individuals
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.78rem', fontWeight: 600 }}>
              <input type="radio" checked={mode === 'broadcast'} onChange={() => setMode('broadcast')} />
              Broadcast to all {SMS_ROLES.find(r => r.key === role)?.label}
            </label>
          </div>

          {mode === 'select' && (
            <>
              <div style={{ padding: '.65rem .9rem', borderBottom: '1px solid var(--border)' }}>
                <input className="inp" placeholder="Search by name or phone…" value={search}
                  onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div className="tbl-scroll" style={{ maxHeight: 360, overflowY: 'auto' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 30 }}>
                        <input type="checkbox" checked={recipients.length > 0 && recipients.every(r => selected[r.id])} onChange={toggleAll} />
                      </th>
                      <th>Name</th>
                      <th>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading
                      ? <tr><td className="tbl-loading" colSpan={3}><span className="spinner" /> Loading…</td></tr>
                      : recipients.length === 0
                        ? <tr><td colSpan={3}><div className="empty-state"><div className="empty-text">No profiles found</div></div></td></tr>
                        : recipients.map(r => (
                          <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => toggleOne(r.id)}>
                            <td onClick={e => e.stopPropagation()}>
                              <input type="checkbox" checked={!!selected[r.id]} onChange={() => toggleOne(r.id)} />
                            </td>
                            <td style={{ fontWeight: 600 }}>{r.name || '—'}</td>
                            <td className="mono">{r.phone}</td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
              <div style={{ padding: '.6rem .9rem', fontSize: '.74rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                {selectedCount} of {recipients.length} selected
              </div>
            </>
          )}

          {mode === 'broadcast' && (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '.5rem' }}>📢</div>
              This will send to <strong>all {recipients.length}</strong> {SMS_ROLES.find(r => r.key === role)?.label.toLowerCase()} with a phone number on file.
            </div>
          )}
        </div>

        {/* RIGHT: Compose */}
        <div className="section-inner" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          <div className="field">
            <label>Template</label>
            <select className="inp" value={templateId} onChange={e => applyTemplate(e.target.value)}>
              <option value="">Custom message…</option>
              {(templates[role] || []).map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Message</label>
            <textarea className="inp" rows={6} value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Type your message… use {name}, {order_number}, {date}, {time} as placeholders" />
            <div className="field-hint" style={{ textAlign: 'right' }}>{message.length} chars</div>
          </div>

          <div className="alert alert-warn">
            ⚠️ Placeholders like {'{name}'} aren't auto-replaced per-recipient in bulk sends — write generically, or send individually for personalization.
          </div>

          <button className="btn btn-primary" onClick={handleSend} disabled={sending} style={{ justifyContent: 'center' }}>
            {sending ? <><span className="spinner" /> Sending…</> : `Send SMS ${mode === 'broadcast' ? `(${recipients.length})` : selectedCount ? `(${selectedCount})` : ''}`}
          </button>
        </div>
      </div>

      {/* Send confirm modal */}
      {confirmSend && (
        <Confirm
          danger={false}
          msg={mode === 'broadcast'
            ? `Send to ALL ${SMS_ROLES.find(r => r.key === role)?.label} (${recipients.length} people)?`
            : `Send to ${selectedCount} selected recipient(s)?`}
          onConfirm={doSend}
          onCancel={() => setConfirmSend(false)}
        />
      )}

      {/* History modal */}
      {showLogs && (
        <div className="overlay" onClick={() => setShowLogs(false)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">🕓 SMS History</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowLogs(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: 420, overflowY: 'auto' }}>
              {logs.length === 0
                ? <div className="empty-state"><div className="empty-text">No messages sent yet</div></div>
                : logs.map(l => (
                  <div key={l.id} style={{ borderBottom: '1px solid var(--border-2)', padding: '.6rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.72rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{l.role}</span>
                      <span>{fmtT(l.created_at)}</span>
                    </div>
                    <div style={{ fontSize: '.78rem', margin: '.25rem 0' }}>{l.message}</div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text-muted)' }}>→ {l.recipient_count} recipient(s)</div>
                  </div>
                ))
              }
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setShowLogs(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// ─── COURSE ENROLLMENTS SECTION ───────────────────────────────────────────────
// FIX: Defined at MODULE LEVEL (outside AdminDashboardPage) so hooks are valid
function CourseEnrollmentsSection() {
  const [enrollments,  setEnrollments]  = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(false)
  const [loadErr,      setLoadErr]      = useState('')
  const [courses,      setCoursesLocal] = useState([])

  const [filterCourse, setFilterCourse] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search,       setSearch]       = useState('')

  const [busy,       setBusy]       = useState({})
  const [confirmDlg, setConfirmDlg] = useState(null)
  const [detailRow,  setDetailRow]  = useState(null)

  const [addOpen,   setAddOpen]   = useState(false)
  const [addForm,   setAddForm]   = useState({ course_id:'', user_email:'', payment_status:'free', amount:'' })
  const [addErr,    setAddErr]    = useState('')
  const [addSaving, setAddSaving] = useState(false)

  const [toast, setToast] = useState(null)

  const flash = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3400) }
  const setB  = (k, v) => setBusy(b => ({ ...b, [k]: v }))

  const statusBg = s => ({ confirmed:'#ecfdf5', pending:'#fffbeb', free:'#ecfdf5', cancelled:'#fef2f2' })[s] || '#f1f5f9'
  const statusFg = s => ({ confirmed:'#065f46', pending:'#92400e', free:'#065f46', cancelled:'#991b1b' })[s] || '#475569'

  // load course list for dropdowns
  useEffect(() => {
    ;(async () => {
      try {
        const d = await apiFetch('/admin/courses?page=1&limit=200')
        setCoursesLocal(d.items || d.courses || d.data || [])
      } catch (e) { console.warn('courses list:', e.message) }
    })()
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setLoadErr('')
    try {
      const p = new URLSearchParams({ page, limit: LIMIT })
      if (filterCourse) p.set('course_id', filterCourse)
      if (filterStatus) p.set('status',    filterStatus)
      if (search)       p.set('search',    search)

      const data = await apiFetch(`/enrollments/admin/list?${p}`)

      const items = (data.items || data.enrollments || []).map(e => ({
        id:             e.id,
        payment_id:     e.payment_id     || null,
        user_id:        e.user_id        || null,
        user_name:      e.user_name      || e.profiles?.full_name || '—',
        user_email:     e.user_email     || e.profiles?.email     || '',
        avatar_url:     e.avatar_url     || e.profiles?.avatar_url|| null,
        course_id:      e.course_id      || null,
        course_title:   e.course_title   || e.courses?.title      || '—',
        course_emoji:   e.course_emoji   || e.courses?.emoji      || '📚',
        payment_status: e.payment_status || e.status              || 'pending',
        is_free:        e.is_free        || Number(e.amount || 0) === 0,
        amount:         e.amount,
        method:         e.method         || null,
        transaction_id: e.transaction_id || null,
        enrolled_at:    e.enrolled_at    || e.created_at,
        confirmed_at:   e.confirmed_at   || null,
      }))

      setEnrollments(items)
      setTotal(data.pagination?.total || data.total || items.length)
    } catch (e) {
      setLoadErr(e.message)
      setEnrollments([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, filterCourse, filterStatus, search])

  useEffect(() => { load() }, [load])

  const revokeEnrollment = async ({ id, paymentId }) => {
    setB(id, true)
    try {
      await apiFetch(`/enrollments/admin/${id}`, { method: 'DELETE' })
      if (paymentId) {
        try {
          await apiFetch(`/admin/payments/${paymentId}`, {
            method: 'PUT', body: JSON.stringify({ status: 'failed' }),
          })
        } catch { /* non-fatal */ }
      }
      setConfirmDlg(null)
      flash('Enrollment revoked')
      load()
    } catch (e) {
      flash(e.message, false)
    } finally {
      setB(id, false)
    }
  }

  const confirmEnrollment = async ({ id, paymentId }) => {
    setB(id, true)
    try {
      await apiFetch(`/enrollments/admin/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'confirmed', confirmed_at: new Date().toISOString() }),
      })
      if (paymentId) {
        try {
          await apiFetch(`/admin/payments/${paymentId}`, {
            method: 'PUT', body: JSON.stringify({ status: 'completed' }),
          })
        } catch { /* non-fatal */ }
      }
      setConfirmDlg(null)
      flash('Enrollment confirmed ✓')
      load()
    } catch (e) {
      flash(e.message, false)
    } finally {
      setB(id, false)
    }
  }

  const submitAdd = async () => {
    setAddErr('')
    if (!addForm.course_id)  return setAddErr('Please select a course')
    if (!addForm.user_email) return setAddErr('User email is required')
    setAddSaving(true)
    try {
      await apiFetch('/enrollments/admin/enroll', {
        method: 'POST',
        body: JSON.stringify({
          course_id:      addForm.course_id,
          user_email:     addForm.user_email.trim(),
          payment_status: addForm.payment_status,
          amount:         addForm.amount ? Number(addForm.amount) : 0,
        }),
      })
      setAddOpen(false)
      setAddForm({ course_id:'', user_email:'', payment_status:'free', amount:'' })
      flash('User enrolled successfully ✓')
      load()
    } catch (e) {
      setAddErr(e.message)
    } finally {
      setAddSaving(false)
    }
  }

  const seatCards = courses
    .map(c => ({ id:c.id, title:c.title, emoji:c.emoji||'📚', seats:c.seats||c.max_seats||null, booked:c.booked_count||c.enrolled_count||0 }))
    .filter(c => c.seats)

  return (
    <div style={{ position:'relative' }}>

      {/* toast */}
      {toast && (
        <div style={{
          position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:9999,
          background: toast.ok ? 'var(--green)' : 'var(--red)',
          color:'white', padding:'.65rem 1.1rem', borderRadius:'var(--radius)',
          fontWeight:600, fontSize:'.82rem', boxShadow:'var(--shadow-md)', animation:'fadeIn .2s',
        }}>{toast.msg}</div>
      )}

      {/* seat summary cards */}
      {seatCards.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:'.65rem', marginBottom:'1.25rem' }}>
          {seatCards.map(c => {
            const left = Math.max(0, c.seats - c.booked)
            const pct  = Math.min(100, Math.round((c.booked / c.seats) * 100))
            const col  = pct >= 100 ? 'var(--red)' : pct >= 80 ? 'var(--amber)' : 'var(--green)'
            const active = filterCourse === String(c.id)
            return (
              <div key={c.id} onClick={() => setFilterCourse(active ? '' : String(c.id))} style={{
                background: active ? 'var(--blue-lt)' : 'var(--surface)',
                border:`1px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
                borderRadius:'var(--radius)', padding:'.85rem', cursor:'pointer', transition:'all .13s',
              }}>
                <div style={{ fontSize:'.7rem', fontWeight:700, color:'var(--text-label)', marginBottom:'.3rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                  {c.emoji} {c.title}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'.3rem' }}>
                  <span style={{ fontSize:'1.1rem', fontWeight:800, color: left===0 ? 'var(--red)' : 'var(--text-primary)' }}>{left}</span>
                  <span style={{ fontSize:'.62rem', color:'var(--text-muted)' }}>of {c.seats} left</span>
                </div>
                <div style={{ height:3, background:'var(--border)', borderRadius:100, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:pct+'%', background:col, borderRadius:100, transition:'width .3s' }} />
                </div>
                {active && <div style={{ fontSize:'.6rem', color:'var(--blue-dk)', fontWeight:700, marginTop:'.3rem' }}>● Filtered</div>}
              </div>
            )
          })}
        </div>
      )}

      {/* filters */}
      <div className="filters">
        <input
          className="inp" placeholder="Search name / email…" value={search} style={{ width:190 }}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          onKeyDown={e => e.key === 'Enter' && load()}
        />
        <select className="inp" value={filterCourse} onChange={e => { setFilterCourse(e.target.value); setPage(1) }}>
          <option value="">All courses</option>
          {courses.map(c => <option key={c.id} value={String(c.id)}>{c.emoji||'📚'} {c.title}</option>)}
        </select>
        <select className="inp" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          {['confirmed','pending','free','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={load}>↺ Refresh</button>
        <button className="btn btn-primary" onClick={() => { setAddOpen(true); setAddErr('') }}>+ Enroll User</button>
        {(filterCourse || filterStatus || search) && (
          <button className="btn btn-ghost" onClick={() => { setFilterCourse(''); setFilterStatus(''); setSearch(''); setPage(1) }}>✕ Clear</button>
        )}
      </div>

      {loadErr && (
        <div className="alert alert-error" style={{ marginBottom:'.85rem' }}>⚠️ {loadErr}</div>
      )}

      {/* table */}
      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>{['Student','Course','Method','Amount','Status','Enrolled At','Actions'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td className="tbl-loading" colSpan={7}><span className="spinner" /> Loading enrollments…</td></tr>
                : enrollments.length === 0 && !loadErr
                  ? <tr><td colSpan={7}>
                      <div className="empty-state">
                        <div className="empty-icon">🎓</div>
                        <div className="empty-text">
                          {filterCourse||filterStatus||search ? 'No enrollments match your filters' : 'No enrollments yet'}
                        </div>
                      </div>
                    </td></tr>
                  : enrollments.map(enr => {
                      const isPending = enr.payment_status === 'pending'
                      const isFree    = enr.is_free || Number(enr.amount||0) === 0 || enr.payment_status === 'free'
                      return (
                        <tr key={enr.id} style={{ cursor:'pointer' }} onClick={() => setDetailRow(enr)}>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display:'flex', alignItems:'center', gap:'.55rem' }}>
                              {enr.avatar_url
                                ? <img src={enr.avatar_url} style={{ width:28, height:28, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} alt="" />
                                : <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--blue-lt)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.65rem', fontWeight:800, color:'var(--blue-dk)', flexShrink:0 }}>
                                    {(enr.user_name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                                  </div>
                              }
                              <div>
                                <div style={{ fontWeight:600, fontSize:'.82rem' }}>{enr.user_name}</div>
                                <div style={{ fontSize:'.68rem', color:'var(--text-muted)' }}>{enr.user_email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight:600, fontSize:'.82rem' }}>{enr.course_emoji} {enr.course_title}</div>
                            {enr.transaction_id && <div className="mono" style={{ fontSize:'.63rem', color:'var(--text-muted)' }}>{enr.transaction_id}</div>}
                          </td>
                          <td>
                            <span className="mono" style={{ fontSize:'.72rem', fontWeight:700, color:'var(--teal)', textTransform:'uppercase' }}>
                              {enr.method || '—'}
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontSize:'.82rem' }}>
                              {isFree ? <span style={{ color:'var(--green)' }}>Free</span> : `NPR ${Number(enr.amount).toLocaleString()}`}
                            </strong>
                          </td>
                          <td>
                            <span style={{
                              display:'inline-block', padding:'.18rem .52rem', borderRadius:100,
                              fontSize:'.63rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em',
                              background:statusBg(enr.payment_status), color:statusFg(enr.payment_status),
                            }}>{enr.payment_status}</span>
                          </td>
                          <td style={{ fontSize:'.74rem', color:'var(--text-muted)', whiteSpace:'nowrap' }}>
                            {fmtT(enr.enrolled_at)}
                            {enr.confirmed_at && (
                              <div style={{ fontSize:'.63rem', color:'var(--green)', marginTop:'.1rem' }}>✓ {fmtT(enr.confirmed_at)}</div>
                            )}
                          </td>
                          <td onClick={e => e.stopPropagation()}>
                            <div style={{ display:'flex', gap:'.3rem', flexWrap:'wrap' }}>
                              {isPending && (
                                <button className="btn btn-success btn-sm" disabled={busy[enr.id]} title="Confirm payment"
                                  onClick={() => setConfirmDlg({ id:enr.id, paymentId:enr.payment_id, name:enr.user_name, action:'confirm' })}>✓</button>
                              )}
                              <button className="btn btn-ghost btn-sm btn-icon" title="View details"
                                onClick={() => setDetailRow(enr)}>👁</button>
                              <button className="btn btn-danger btn-sm" disabled={busy[enr.id]} title="Revoke enrollment"
                                onClick={() => setConfirmDlg({ id:enr.id, paymentId:enr.payment_id, name:enr.user_name, action:'revoke' })}>Revoke</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
              }
            </tbody>
          </table>
        </div>
      </div>
      <Pager page={page} set={setPage} total={total} />

      {/* confirm dialog */}
      {confirmDlg && (
        <div className="overlay" onClick={() => setConfirmDlg(null)}>
          <div className="modal confirm-dialog" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{confirmDlg.action === 'revoke' ? '⚠️ Revoke Enrollment' : '✓ Confirm Payment'}</span>
            </div>
            <div className="modal-body">
              <p className="confirm-msg">
                {confirmDlg.action === 'revoke'
                  ? `Permanently remove ${confirmDlg.name}'s enrollment? Their linked payment (if any) will be marked failed.`
                  : `Mark ${confirmDlg.name}'s enrollment as confirmed and their linked payment as completed?`}
              </p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setConfirmDlg(null)}>Cancel</button>
              <button
                className={`btn ${confirmDlg.action === 'revoke' ? 'btn-danger' : 'btn-success'}`}
                disabled={busy[confirmDlg.id]}
                onClick={() => confirmDlg.action === 'revoke' ? revokeEnrollment(confirmDlg) : confirmEnrollment(confirmDlg)}
              >
                {busy[confirmDlg.id] ? <><span className="spinner" /> Working…</> : confirmDlg.action === 'revoke' ? 'Yes, Revoke' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* detail modal */}
      {detailRow && (
        <div className="overlay" onClick={() => setDetailRow(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">📋 Enrollment Detail</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetailRow(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-grid" style={{ padding:0 }}>
                {[
                  { title:'Student',    rows:[['Name', detailRow.user_name],['Email', detailRow.user_email||'—'],['User ID', detailRow.user_id||'—']] },
                  { title:'Course',     rows:[['Title', `${detailRow.course_emoji} ${detailRow.course_title}`],['Course ID', detailRow.course_id||'—'],['Status', detailRow.payment_status]] },
                  { title:'Payment',    rows:[['Amount', detailRow.is_free ? 'Free' : `NPR ${Number(detailRow.amount||0).toLocaleString()}`],['Method', detailRow.method||'—'],['Txn ID', detailRow.transaction_id||'—'],['Payment ID', detailRow.payment_id||'—']] },
                  { title:'Timestamps', rows:[['Enrolled', fmtT(detailRow.enrolled_at)],['Confirmed', detailRow.confirmed_at ? fmtT(detailRow.confirmed_at) : '—'],['Record ID', detailRow.id]] },
                ].map(card => (
                  <div key={card.title} className="detail-card">
                    <div className="detail-card-title">{card.title}</div>
                    {card.rows.map(([k, v]) => (
                      <div key={k} className="detail-row-item">
                        <span className="detail-row-key">{k}</span>
                        <span className="detail-row-val mono" style={{ fontSize:['User ID','Course ID','Txn ID','Payment ID','Record ID'].includes(k)?'.63rem':'.74rem' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-foot">
              {detailRow.payment_status === 'pending' && (
                <button className="btn btn-success" onClick={() => { setDetailRow(null); setConfirmDlg({ id:detailRow.id, paymentId:detailRow.payment_id, name:detailRow.user_name, action:'confirm' }) }}>
                  ✓ Confirm Payment
                </button>
              )}
              <button className="btn btn-danger" onClick={() => { setDetailRow(null); setConfirmDlg({ id:detailRow.id, paymentId:detailRow.payment_id, name:detailRow.user_name, action:'revoke' }) }}>
                Revoke
              </button>
              <button className="btn btn-ghost" onClick={() => setDetailRow(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* manual enroll modal */}
      {addOpen && (
        <div className="overlay" onClick={() => setAddOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">+ Enroll a User</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setAddOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field">
                <label>Course *</label>
                <select className="inp" value={addForm.course_id} onChange={e => setAddForm(f => ({ ...f, course_id:e.target.value }))}>
                  <option value="">— Select course —</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.emoji||'📚'} {c.title}</option>)}
                </select>
              </div>
              <div className="field">
                <label>User Email *</label>
                <input className="inp" type="email" placeholder="user@example.com"
                  value={addForm.user_email} onChange={e => setAddForm(f => ({ ...f, user_email:e.target.value }))} />
                <div className="field-hint">Must match an existing account in the system</div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Payment Status</label>
                  <select className="inp" value={addForm.payment_status} onChange={e => setAddForm(f => ({ ...f, payment_status:e.target.value }))}>
                    <option value="free">Free (no payment)</option>
                    <option value="confirmed">Confirmed (paid)</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="field">
                  <label>Amount (NPR)</label>
                  <input className="inp" type="number" placeholder="0 = free"
                    value={addForm.amount} onChange={e => setAddForm(f => ({ ...f, amount:e.target.value }))} />
                </div>
              </div>
              {addErr && <div className="alert alert-error">{addErr}</div>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setAddOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={submitAdd} disabled={addSaving}>
                {addSaving ? <><span className="spinner" /> Enrolling…</> : 'Enroll User'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ─── DELIVERY RIDERS SECTION ─────────────────────────────────────────────────
const EMPTY_RIDER = { full_name:'', phone:'', email:'', area:'', vehicle_type:'', password:'', is_active:true }

function AdminDeliveryRidersSection() {
  const [riders, setRiders]   = useState([])
  const [total, setTotal]     = useState(0)
  const [page, setPage]       = useState(1)
  const [search, setSearch]   = useState('')
  const [statusF, setStatusF] = useState('')
  const [loading, setLoading] = useState(false)
  const RIDER_LIMIT = 15

  const [modal, setModal]     = useState(null) // null | { data: rider|null }
  const [form, setForm]       = useState(EMPTY_RIDER)
  const [saving, setSaving]   = useState(false)
  const [saveErr, setSaveErr] = useState('')

  const [pwModal, setPwModal] = useState(null) // null | rider
  const [pwValue, setPwValue] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwErr, setPwErr]     = useState('')

  const [delConf, setDelConf] = useState(null)
  const [toast, setToast]     = useState(null)

  const flash = (msg, ok=true) => { setToast({ msg, ok }); setTimeout(()=>setToast(null), 3000) }
  const fld = k => e => setForm(f => ({ ...f, [k]: e?.target ? (e.target.type==='checkbox'?e.target.checked:e.target.value) : e }))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, limit: RIDER_LIMIT })
      if (search) p.set('search', search)
      if (statusF) p.set('is_active', statusF)
      const d = await apiFetch(`/admin/delivery-riders?${p}`)
      setRiders(d.riders || [])
      setTotal(d.pagination?.total || 0)
    } catch (e) { flash(e.message, false) }
    finally { setLoading(false) }
  }, [page, search, statusF])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(EMPTY_RIDER); setSaveErr(''); setModal({ data:null }) }
  const openEdit   = r  => { setForm({ full_name:r.full_name||'', phone:r.phone||'', email:r.email||'', area:r.area||'', vehicle_type:r.vehicle_type||'', password:'', is_active:r.is_active!==false }); setSaveErr(''); setModal({ data:r }) }
  const closeModal = () => setModal(null)

  const save = async () => {
    if (!form.full_name.trim()) return setSaveErr('Full name is required')
    if (!form.phone.trim()) return setSaveErr('Phone is required')
    if (!modal.data && (!form.password || form.password.length < 6)) return setSaveErr('Password must be at least 6 characters')
    setSaving(true); setSaveErr('')
    try {
      if (modal.data) {
        await apiFetch(`/admin/delivery-riders/${modal.data.id}`, {
          method:'PUT',
          body: JSON.stringify({ full_name:form.full_name, phone:form.phone, email:form.email, area:form.area, vehicle_type:form.vehicle_type, is_active:form.is_active }),
        })
        flash('Rider updated ✓')
      } else {
        await apiFetch('/admin/delivery-riders', { method:'POST', body: JSON.stringify(form) })
        flash('Rider created ✓')
      }
      closeModal(); load()
    } catch (e) { setSaveErr(e.message) }
    finally { setSaving(false) }
  }

  const doDelete = async () => {
    try {
      await apiFetch(`/admin/delivery-riders/${delConf.id}`, { method:'DELETE' })
      flash('Rider deactivated'); setDelConf(null); load()
    } catch (e) { flash(e.message, false); setDelConf(null) }
  }

  const toggleActive = async r => {
    try { await apiFetch(`/admin/delivery-riders/${r.id}`, { method:'PUT', body: JSON.stringify({ is_active: !r.is_active }) }); load() }
    catch (e) { flash(e.message, false) }
  }

  const openSetPassword = r => { setPwModal(r); setPwValue(''); setPwErr('') }
  const saveSetPassword = async () => {
    if (!pwValue || pwValue.length < 6) return setPwErr('Password must be at least 6 characters')
    setPwSaving(true); setPwErr('')
    try {
      await apiFetch(`/admin/delivery-riders/${pwModal.id}/set-password`, { method:'POST', body: JSON.stringify({ password: pwValue }) })
      flash(`Password updated for ${pwModal.full_name} ✓`)
      setPwModal(null)
    } catch (e) { setPwErr(e.message) }
    finally { setPwSaving(false) }
  }

  return (
    <div style={{ position:'relative' }}>
      {toast && (
        <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:9999, background:toast.ok?'var(--green)':'var(--red)', color:'white', padding:'.65rem 1.1rem', borderRadius:'var(--radius)', fontWeight:600, fontSize:'.82rem', boxShadow:'var(--shadow-md)' }}>{toast.msg}</div>
      )}

      <SectionHeader title="Delivery Riders" count={total} onNew={openCreate} newLabel="+ New Rider">
        <input className="inp" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search name…" style={{width:180}} />
        <select className="inp" value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1)}}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button className="btn btn-ghost" onClick={load}>↺ Refresh</button>
      </SectionHeader>

      <Table loading={loading} cols={['Rider','Contact','Area','Vehicle','Active','Delivered','Actions']}
        rows={riders.map(r => (
          <tr key={r.id}>
            <td>
              <div style={{ fontWeight:600, fontSize:'.82rem' }}>{r.full_name}</div>
              {!r.has_password && <span className="badge badge-amber" style={{ fontSize:'.58rem', marginTop:'.15rem', display:'inline-block' }}>No password set</span>}
            </td>
            <td style={{ fontSize:'.78rem' }}>
              <div>{r.phone}</div>
              {r.email && <div style={{ fontSize:'.68rem', color:'var(--text-muted)' }}>{r.email}</div>}
            </td>
            <td style={{ fontSize:'.78rem' }}>{r.area || '—'}</td>
            <td style={{ fontSize:'.78rem' }}>{r.vehicle_type || '—'}</td>
            <td><Toggle on={r.is_active} onChange={() => toggleActive(r)} /></td>
            <td style={{ fontSize:'.78rem' }}>
              {r.stats?.delivered ?? 0}
              {r.stats?.active > 0 && <span style={{ color:'var(--blue)', fontSize:'.68rem', marginLeft:'.35rem' }}>({r.stats.active} active)</span>}
            </td>
            <td>
              <RowActions onEdit={()=>openEdit(r)} onDelete={()=>setDelConf({ id:r.id, label:r.full_name })}>
                <button className="btn btn-ghost btn-sm" onClick={()=>openSetPassword(r)}>🔑 Password</button>
              </RowActions>
            </td>
          </tr>
        ))}
      />
      <Pager page={page} set={setPage} total={total} limit={RIDER_LIMIT} />

      {/* Create / Edit modal */}
      {modal && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{modal.data ? '✏️ Edit Rider' : '+ New Rider'}</span>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <div className="field"><label>Full Name *</label><input className="inp" value={form.full_name} onChange={fld('full_name')} /></div>
                <div className="field"><label>Phone *</label><input className="inp" value={form.phone} onChange={fld('phone')} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Email (for login)</label><input className="inp" type="email" value={form.email} onChange={fld('email')} /></div>
                <div className="field"><label>Area</label><input className="inp" value={form.area} onChange={fld('area')} placeholder="e.g. Lalitpur" /></div>
              </div>
              <div className="field">
                <label>Vehicle Type</label>
                <select className="inp" value={form.vehicle_type} onChange={fld('vehicle_type')}>
                  <option value="">— Select —</option>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="car">Car</option>
                  <option value="bicycle">Bicycle</option>
                </select>
              </div>
              {!modal.data && (
                <div className="field">
                  <label>Initial Password *</label>
                  <input className="inp" type="text" value={form.password} onChange={fld('password')} placeholder="Min. 6 characters" />
                  <div className="field-hint">Rider logs in with phone or email + this password. You can change it later from the 🔑 Password action.</div>
                </div>
              )}
              <label style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.78rem', cursor:'pointer' }}>
                <Toggle on={form.is_active} onChange={v=>setForm(f=>({...f,is_active:v}))} /> Active
              </label>
              {saveErr && <div className="alert alert-error">{saveErr}</div>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : modal.data ? 'Save Changes' : 'Create Rider'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Set password modal */}
      {pwModal && (
        <div className="overlay" onClick={()=>setPwModal(null)}>
          <div className="modal confirm-dialog" onClick={e=>e.stopPropagation()}>
            <div className="modal-head"><span className="modal-head-title">🔑 Set Password — {pwModal.full_name}</span></div>
            <div className="modal-body">
              <div className="field">
                <label>New Password</label>
                <input className="inp" type="text" value={pwValue} onChange={e=>setPwValue(e.target.value)} placeholder="Min. 6 characters" autoFocus />
              </div>
              {pwErr && <div className="alert alert-error">{pwErr}</div>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setPwModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSetPassword} disabled={pwSaving}>
                {pwSaving ? <><span className="spinner" /> Saving…</> : 'Set Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConf && (
        <Confirm msg={`Deactivate "${delConf.label}"? Their active deliveries will be unassigned and they won't be able to log in. This can be reversed later.`}
          onConfirm={doDelete} onCancel={()=>setDelConf(null)} />
      )}
    </div>
  )
}
// ─── ADMIN PRODUCTS SECTION ──────────────────────────────────────────────────
const EMPTY_PRODUCT = {
  name:'', slug:'', category_id:'', short_description:'', description:'',
  price:0, sale_price:'', sku:'', stock_quantity:0, is_digital:false,
  digital_file_url:'', tags_text:'', is_active:true, is_featured:false,
  weight_grams:'', images:[],
}

function productToForm(p) {
  return {
    name:p.name||'', slug:p.slug||'', category_id:p.category_id||'',
    short_description:p.short_description||'', description:p.description||'',
    price:p.price||0, sale_price:p.sale_price ?? '', sku:p.sku||'',
    stock_quantity:p.stock_quantity||0, is_digital:!!p.is_digital,
    digital_file_url:p.digital_file_url||'', tags_text:(p.tags||[]).join(', '),
    is_active:p.is_active!==false, is_featured:!!p.is_featured,
    weight_grams:p.weight_grams ?? '', images:p.images||[],
  }
}

function formToPayloadProduct(f) {
  const slug = f.slug?.trim() ||
    f.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
  return {
    name:f.name, slug, category_id:f.category_id || null,
    short_description:f.short_description, description:f.description,
    price:Number(f.price)||0, sale_price:f.sale_price===''?null:Number(f.sale_price),
    sku:f.sku, stock_quantity:Number(f.stock_quantity)||0, is_digital:f.is_digital,
    digital_file_url:f.digital_file_url,
    tags:f.tags_text.split(',').map(t=>t.trim()).filter(Boolean),
    is_active:f.is_active, is_featured:f.is_featured,
    weight_grams:f.weight_grams===''?null:Number(f.weight_grams),
    images:f.images,
  }
}

function AdminProductsSection() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [catFilter, setCatFilter]   = useState('')
  const [loading, setLoading]       = useState(false)

  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState(EMPTY_PRODUCT)
  const [saving, setSaving]   = useState(false)
  const [saveErr, setSaveErr] = useState('')
  const [uploading, setUploading] = useState(false)

  const [delConf, setDelConf] = useState(null)
  const [toast, setToast]     = useState(null)
  const PROD_LIMIT = 12

  const [catModal, setCatModal]       = useState(false)
  const [catForm, setCatForm]         = useState({ id:null, name:'', slug:'', sort_order:0 })
  const [catSaving, setCatSaving]     = useState(false)
  const [catErr, setCatErr]           = useState('')
  const [catDelConf, setCatDelConf]   = useState(null)

  const flash = (msg, ok=true) => { setToast({ msg, ok }); setTimeout(()=>setToast(null), 3000) }
  const fld = k => e => setForm(f => ({ ...f, [k]: e?.target ? (e.target.type==='checkbox'?e.target.checked:e.target.value) : e }))

  const reloadCategories = () => apiFetch('/admin/product-categories').then(d => setCategories(d.categories||[])).catch(()=>{})

  useEffect(() => { reloadCategories() }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, limit:PROD_LIMIT, include_inactive:'true' })
      if (search) p.set('search', search)
      if (catFilter) p.set('category_id', catFilter)
      const d = await apiFetch(`/admin/products?${p}`)
      setProducts(d.items || [])
      setTotal(d.pagination?.total || 0)
    } catch (e) { flash(e.message, false) }
    finally { setLoading(false) }
  }, [page, search, catFilter])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(EMPTY_PRODUCT); setSaveErr(''); setModal({ data:null }) }
  const openEdit   = p  => { setForm(productToForm(p)); setSaveErr(''); setModal({ data:p }) }
  const closeModal = () => setModal(null)

  const save = async () => {
    if (!form.name.trim()) return setSaveErr('Product name is required')
    setSaving(true); setSaveErr('')
    try {
      const body = formToPayloadProduct(form)
      if (modal.data) await apiFetch(`/admin/products/${modal.data.id}`, { method:'PUT', body:JSON.stringify(body) })
      else await apiFetch('/admin/products', { method:'POST', body:JSON.stringify(body) })
      flash(modal.data ? 'Product updated ✓' : 'Product created ✓')
      closeModal(); load()
    } catch (e) { setSaveErr(e.message) }
    finally { setSaving(false) }
  }

  const doDelete = async () => {
    try {
      await apiFetch(`/admin/products/${delConf.id}`, { method:'DELETE' })
      flash('Product deactivated'); setDelConf(null); load()
    } catch (e) { flash(e.message, false); setDelConf(null) }
  }

  const toggleActive = async p => {
    try { await apiFetch(`/admin/products/${p.id}`, { method:'PUT', body:JSON.stringify({ is_active: !p.is_active }) }); load() }
    catch (e) { flash(e.message, false) }
  }

  const uploadImages = async (files) => {
    if (!modal?.data?.id) { flash('Save the product first, then add images', false); return }
    setUploading(true)
    try {
      const fd = new FormData()
      Array.from(files).forEach(f => fd.append('images', f))
      const res = await fetch(`${API_BASE}/admin/products/${modal.data.id}/images`, {
        method:'POST', headers:{ Authorization:`Bearer ${getToken()}` }, body:fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      setForm(f => ({ ...f, images: data.product.images }))
      flash('Images uploaded ✓')
    } catch (e) { flash(e.message, false) }
    finally { setUploading(false) }
  }

  const removeImage = async (url) => {
    if (!modal?.data?.id) { setForm(f => ({ ...f, images: f.images.filter(u => u !== url) })); return }
    try {
      const d = await apiFetch(`/admin/products/${modal.data.id}/images`, { method:'DELETE', body:JSON.stringify({ url }) })
      setForm(f => ({ ...f, images: d.product.images }))
    } catch (e) { flash(e.message, false) }
  }

  const editCategory = c => setCatForm({ id:c.id, name:c.name, slug:c.slug, sort_order:c.sort_order||0 })
  const resetCategoryForm = () => setCatForm({ id:null, name:'', slug:'', sort_order: categories.length })

  const saveCategory = async () => {
    if (!catForm.name.trim()) return setCatErr('Category name is required')
    setCatSaving(true); setCatErr('')
    try {
      const slug = catForm.slug.trim() || catForm.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
      const body = { name: catForm.name, slug, sort_order: Number(catForm.sort_order)||0 }
      if (catForm.id) await apiFetch(`/admin/product-categories/${catForm.id}`, { method:'PUT', body:JSON.stringify(body) })
      else await apiFetch('/admin/product-categories', { method:'POST', body:JSON.stringify(body) })
      flash(catForm.id ? 'Category updated ✓' : 'Category created ✓')
      resetCategoryForm(); reloadCategories()
    } catch (e) { setCatErr(e.message) }
    finally { setCatSaving(false) }
  }

  const doDeleteCategory = async () => {
    try {
      await apiFetch(`/admin/product-categories/${catDelConf.id}`, { method:'DELETE' })
      flash('Category deleted')
      setCatDelConf(null); reloadCategories(); load()
    } catch (e) { flash(e.message, false); setCatDelConf(null) }
  }

  return (
    <div style={{ position:'relative' }}>
      {toast && (
        <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:9999, background:toast.ok?'var(--green)':'var(--red)', color:'white', padding:'.65rem 1.1rem', borderRadius:'var(--radius)', fontWeight:600, fontSize:'.82rem', boxShadow:'var(--shadow-md)' }}>{toast.msg}</div>
      )}

      <SectionHeader title="Products" count={total} onNew={openCreate}>
        <input className="inp" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search name…" style={{width:180}} />
        <select className="inp" value={catFilter} onChange={e=>{setCatFilter(e.target.value);setPage(1)}}>
          <option value="">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button className="btn btn-ghost" onClick={() => setCatModal(true)}>🏷 Categories</button>
        <button className="btn btn-ghost" onClick={load}>↺ Refresh</button>
      </SectionHeader>

      <Table loading={loading} cols={['Image','Product','Price','Stock','Rating','Active','Actions']}
        rows={products.map(p => (
          <tr key={p.id}>
            <td>
              <div style={{ width:44, height:44, borderRadius:8, overflow:'hidden', background:'var(--surface-2)' }}>
                {(p.images?.[0]||p.image_url) ? <img src={p.images?.[0]||p.image_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : null}
              </div>
            </td>
            <td>
              <div style={{ fontWeight:600, fontSize:'.82rem' }}>{p.name}</div>
              <div style={{ fontSize:'.68rem', color:'var(--text-muted)' }}>{p.sku||'—'}</div>
            </td>
            <td>
              {p.sale_price
                ? <><strong>NPR {Number(p.sale_price).toLocaleString()}</strong> <span style={{textDecoration:'line-through',color:'var(--text-muted)',fontSize:'.72rem'}}>NPR {Number(p.price).toLocaleString()}</span></>
                : <>NPR {Number(p.price||0).toLocaleString()}</>}
            </td>
            <td>{p.is_digital ? '∞' : (p.stock_quantity||0)}</td>
            <td>{p.rating ? `★ ${Number(p.rating).toFixed(1)} (${p.reviews_count||0})` : '—'}</td>
            <td><Toggle on={p.is_active} onChange={() => toggleActive(p)} /></td>
            <td><RowActions onEdit={()=>openEdit(p)} onDelete={()=>setDelConf({ id:p.id, label:p.name })} /></td>
          </tr>
        ))}
      />
      <Pager page={page} set={setPage} total={total} limit={PROD_LIMIT} />

      {modal && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()} style={{ maxWidth:820 }}>
            <div className="modal-head">
              <span className="modal-head-title">{modal.data ? '✏️ Edit Product' : '+ New Product'}</span>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight:'75vh', overflowY:'auto' }}>
              <div className="field-row">
                <div className="field"><label>Name *</label><input className="inp" value={form.name} onChange={fld('name')} /></div>
                <div className="field"><label>Category</label>
                  <select className="inp" value={form.category_id} onChange={fld('category_id')}>
                    <option value="">— None —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="field-row">
                <div className="field"><label>Slug (auto if blank)</label><input className="inp mono" value={form.slug} onChange={fld('slug')} placeholder="auto-generated-from-name" /></div>
                <div className="field"><label>SKU</label><input className="inp" value={form.sku} onChange={fld('sku')} /></div>
              </div>

              <div className="field"><label>Short Description</label><textarea className="inp" rows={2} value={form.short_description} onChange={fld('short_description')} /></div>
              <div className="field"><label>Full Description</label><textarea className="inp" rows={4} value={form.description} onChange={fld('description')} /></div>

              <div className="field-row3">
                <div className="field"><label>Price (NPR) *</label><input className="inp" type="number" value={form.price} onChange={fld('price')} /></div>
                <div className="field"><label>Sale Price (blank = none)</label><input className="inp" type="number" value={form.sale_price} onChange={fld('sale_price')} /></div>
                <div className="field"><label>Weight (g)</label><input className="inp" type="number" value={form.weight_grams} onChange={fld('weight_grams')} /></div>
              </div>

              <div className="field-row3">
                <div className="field"><label>Stock Quantity</label><input className="inp" type="number" value={form.stock_quantity} onChange={fld('stock_quantity')} disabled={form.is_digital} /></div>
                <div className="field" style={{ justifyContent:'flex-end', paddingBottom:'.4rem' }}>
                  <label style={{ display:'flex', alignItems:'center', gap:'.5rem', cursor:'pointer' }}>
                    <Toggle on={form.is_digital} onChange={v=>setForm(f=>({...f,is_digital:v}))} /> Digital product
                  </label>
                </div>
              </div>

              {form.is_digital && (
                <div className="field"><label>Digital File URL</label><input className="inp" value={form.digital_file_url} onChange={fld('digital_file_url')} /></div>
              )}

              <div className="field"><label>Tags (comma separated)</label><input className="inp" value={form.tags_text} onChange={fld('tags_text')} placeholder="mindfulness, workbook, self-help" /></div>

              <div className="field">
                <label>Images ({form.images.length})</label>
                <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'.5rem' }}>
                  {form.images.map((url,i) => (
                    <div key={i} style={{ position:'relative', width:72, height:72, borderRadius:8, overflow:'hidden', border:'1px solid var(--border)' }}>
                      <img src={url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      <button onClick={()=>removeImage(url)} style={{ position:'absolute', top:2, right:2, width:20, height:20, borderRadius:'50%', border:'none', background:'rgba(0,0,0,0.6)', color:'#fff', fontSize:'.65rem', cursor:'pointer' }}>✕</button>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/*" multiple disabled={uploading}
                  onChange={e => e.target.files.length && uploadImages(e.target.files)}
                  style={{ padding:'.4rem', border:'1.5px solid var(--border)', borderRadius:'var(--radius-sm)', fontSize:'.76rem', width:'100%' }} />
                {uploading && <div className="field-hint"><span className="spinner" /> Uploading…</div>}
                {!modal.data && <div className="field-hint">Save the product first to enable image upload.</div>}
              </div>

              <div style={{ display:'flex', gap:'1.25rem' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.78rem', cursor:'pointer' }}>
                  <Toggle on={form.is_active} onChange={v=>setForm(f=>({...f,is_active:v}))} /> Active
                </label>
                <label style={{ display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.78rem', cursor:'pointer' }}>
                  <Toggle on={form.is_featured} onChange={v=>setForm(f=>({...f,is_featured:v}))} /> Featured
                </label>
              </div>

              {saveErr && <div className="alert alert-error">{saveErr}</div>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <><span className="spinner" /> Saving…</> : modal.data ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {delConf && (
        <Confirm msg={`Deactivate "${delConf.label}"? It will be hidden from the store but not permanently deleted.`}
          onConfirm={doDelete} onCancel={()=>setDelConf(null)} />
      )}

      {catModal && (
        <div className="overlay" onClick={() => setCatModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:560 }}>
            <div className="modal-head">
              <span className="modal-head-title">🏷 Manage Categories</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setCatModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', flexDirection:'column', gap:'.4rem', maxHeight:260, overflowY:'auto', marginBottom:'.5rem' }}>
                {categories.length === 0
                  ? <div style={{ fontSize:'.8rem', color:'var(--text-muted)', textAlign:'center', padding:'1rem' }}>No categories yet.</div>
                  : categories.map(c => (
                    <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'.6rem', padding:'.5rem .7rem', border:'1px solid var(--border)', borderRadius:'var(--radius-sm)', background: catForm.id===c.id ? 'var(--blue-lt)' : 'var(--surface)' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, fontSize:'.82rem' }}>{c.name}</div>
                        <div style={{ fontSize:'.68rem', color:'var(--text-muted)' }}>{c.slug} · order {c.sort_order||0}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => editCategory(c)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setCatDelConf({ id:c.id, label:c.name })}>🗑</button>
                    </div>
                  ))
                }
              </div>

              <div style={{ borderTop:'1px solid var(--border)', paddingTop:'.85rem' }}>
                <div style={{ fontSize:'.68rem', fontWeight:700, color:'var(--text-label)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'.5rem' }}>
                  {catForm.id ? 'Edit Category' : 'New Category'}
                </div>
                <div className="field-row3" style={{ gridTemplateColumns:'2fr 2fr 1fr' }}>
                  <div className="field"><label>Name *</label><input className="inp" value={catForm.name} onChange={e=>setCatForm(f=>({...f,name:e.target.value}))} /></div>
                  <div className="field"><label>Slug (auto if blank)</label><input className="inp mono" value={catForm.slug} onChange={e=>setCatForm(f=>({...f,slug:e.target.value}))} /></div>
                  <div className="field"><label>Order</label><input className="inp" type="number" value={catForm.sort_order} onChange={e=>setCatForm(f=>({...f,sort_order:e.target.value}))} /></div>
                </div>
                {catErr && <div className="alert alert-error" style={{ marginTop:'.5rem' }}>{catErr}</div>}
                <div style={{ display:'flex', gap:'.5rem', marginTop:'.75rem' }}>
                  {catForm.id && <button className="btn btn-ghost" onClick={resetCategoryForm}>Cancel Edit</button>}
                  <button className="btn btn-primary" onClick={saveCategory} disabled={catSaving}>
                    {catSaving ? <><span className="spinner" /> Saving…</> : catForm.id ? 'Save Changes' : '+ Add Category'}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setCatModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {catDelConf && (
        <Confirm msg={`Delete category "${catDelConf.label}"? Products in this category will become uncategorized.`}
          onConfirm={doDeleteCategory} onCancel={()=>setCatDelConf(null)} />
      )}
    </div>
  )
}

// ─── PRODUCT REVIEWS SECTION ─────────────────────────────────────────────────
function ProductReviewsSection() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterProduct, setFilterProduct] = useState('')
  const [toast, setToast] = useState(null)
  const flash = (msg, ok=true) => { setToast({ msg, ok }); setTimeout(()=>setToast(null), 3000) }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams()
      if (filterProduct) p.set('product_id', filterProduct)
      const d = await apiFetch(`/admin/product-reviews?${p}`)
      setReviews(d.items || [])
    } catch (e) { flash(e.message, false) }
    finally { setLoading(false) }
  }, [filterProduct])

  useEffect(() => { load() }, [load])

  const setApproved = async (id, is_approved) => {
    try { await apiFetch(`/admin/product-reviews/${id}`, { method:'PUT', body: JSON.stringify({ is_approved }) }); load() }
    catch (e) { flash(e.message, false) }
  }
  const remove = async id => {
    try { await apiFetch(`/admin/product-reviews/${id}`, { method:'DELETE' }); flash('Review deleted'); load() }
    catch (e) { flash(e.message, false) }
  }

  return (
    <div style={{ position:'relative' }}>
      {toast && (
        <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:9999, background:toast.ok?'var(--green)':'var(--red)', color:'white', padding:'.65rem 1.1rem', borderRadius:'var(--radius)', fontWeight:600, fontSize:'.82rem', boxShadow:'var(--shadow-md)' }}>{toast.msg}</div>
      )}
      <SectionHeader title="Product Reviews" count={reviews.length} sub="Moderate star ratings and comments left on store products">
        <button className="btn btn-ghost" onClick={load}>↺ Refresh</button>
      </SectionHeader>
      <Table loading={loading} cols={['Product','Rating','Comment','Author','Date','Approved','Actions']}
        rows={reviews.map(r => (
          <tr key={r.id}>
            <td style={{ fontWeight:600, fontSize:'.82rem' }}>{r.products?.name || '—'}</td>
            <td style={{ color:'#f59e0b', fontSize:'.85rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</td>
            <td style={{ maxWidth:280, fontSize:'.78rem' }}>{r.comment || <span style={{ color:'var(--text-muted)' }}>—</span>}</td>
            <td style={{ fontSize:'.78rem' }}>{r.author_name || 'Anonymous'}</td>
            <td style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>{fmt(r.created_at)}</td>
            <td><Toggle on={r.is_approved} onChange={() => setApproved(r.id, !r.is_approved)} /></td>
            <td><button className="btn btn-danger btn-sm btn-icon" onClick={() => remove(r.id)}>🗑</button></td>
          </tr>
        ))}
      />
    </div>
  )
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  useEffect(() => { injectCSS() }, [])

  const { navigate }                           = useRouter()
  const { user, loading: authLoading, logout } = useAuth()
  const [tab, setTab]                          = useState('dashboard')

  // Dashboard
  const [stats, setStats]   = useState(null)
  const [recent, setRecent] = useState([])

  // Users
  const [users, setUsers]     = useState([]); const [uTotal, setUTotal]   = useState(0); const [uPage, setUPage]   = useState(1)
  const [uSearch, setUSearch] = useState(''); const [uRole, setURole]     = useState('')

  // Appointments
  const [appts, setAppts]     = useState([]); const [aTotal, setATotal]   = useState(0); const [aPage, setAPage]   = useState(1)
  const [aStatus, setAStatus] = useState('')


    // ── Orders ──────────────────────────────────────────────────
    const [orders, setOrders]           = useState([])
    const [oTotal, setOTotal]           = useState(0)
    const [oPage,  setOPage]            = useState(1)
    const [oStatus, setOStatus]         = useState('')
    const [oDeliveryStatus, setODeliveryStatus] = useState('')  // ← NEW
  
    // ── Riders pool (for dropdown) ────────────────────────────── ← NEW
    const [riders,     setRiders]     = useState([])
    const [riderBusy,  setRiderBusy]  = useState({})
    const [riderToast, setRiderToast] = useState(null)

  // Notifications
  const [notifClients, setNotifClients] = useState([])
  const [notifTarget,  setNotifTarget]  = useState('')
  const [notifTitle,   setNotifTitle]   = useState('')
  const [notifMsg,     setNotifMsg]     = useState('')
  const [notifType,    setNotifType]    = useState('system')
  const [notifSending, setNotifSending] = useState(false)
  const [notifResult,  setNotifResult]  = useState(null)

  // Room Bookings
  const [roomBookings, setRoomBookings] = useState([]); const [rbTotal, setRbTotal] = useState(0); const [rbPage, setRbPage] = useState(1)
  const [rbStatus, setRbStatus]         = useState(''); const [rbLoading, setRbLoading] = useState(false)

  // Volunteers
  const [volunteers, setVolunteers] = useState([]); const [volTotal, setVolTotal] = useState(0); const [volPage, setVolPage] = useState(1)
  const [volSearch, setVolSearch]   = useState(''); const [volStatus, setVolStatus] = useState(''); const [volDetail, setVolDetail] = useState(null)

  // Gallery Submissions
  const [galSubs, setGalSubs]           = useState([]); const [galSubTotal, setGalSubTotal] = useState(0); const [galSubPage, setGalSubPage] = useState(1)
  const [galSubStatus, setGalSubStatus] = useState('')

  // Workshops
  const [workshops, setWorkshops] = useState([]); const [wsTotal, setWsTotal] = useState(0)
  const [wsRegs, setWsRegs]       = useState([]); const [wsTab, setWsTab]     = useState('list')

  // Community Admin
  const [commGroups, setCommGroups]                 = useState([])
  const [commSessions, setCommSessions]             = useState([]); const [commSessionsTotal, setCommSessionsTotal] = useState(0); const [commSessionPage, setCommSessionPage] = useState(1)
  const [commReservations, setCommReservations]     = useState([])
  const [commMemberships, setCommMemberships]       = useState([])
  const [commTab, setCommTab]                       = useState('groups')
  const [selectedSessionId, setSelectedSessionId]   = useState(null)
  const [sessionModal, setSessionModal]             = useState(null)
  const [sessionForm, setSessionForm]               = useState({})
  const [sessionSaving, setSessionSaving]           = useState(false)
  const [sessionErr, setSessionErr]                 = useState('')

  // Content tabs
  const [posts, setPosts]         = useState([]); const [postsTotal, setPostsTotal]     = useState(0); const [postsPage, setPostsPage]     = useState(1)
  const [news, setNews]           = useState([]); const [newsTotal, setNewsTotal]       = useState(0); const [newsPage, setNewsPage]       = useState(1)
  const [resources, setRes]       = useState([]); const [resTotal, setResTotal]         = useState(0); const [resPage, setResPage]         = useState(1)
  const [gallery, setGallery]     = useState([]); const [galTotal, setGalTotal]         = useState(0); const [galPage, setGalPage]         = useState(1)
  const [research, setResearch]   = useState([]); const [rscTotal, setRscTotal]         = useState(0); const [rscPage, setRscPage]         = useState(1)
  const [pvids, setPvids]         = useState([]); const [pvTotal, setPvTotal]           = useState(0); const [pvPage, setPvPage]           = useState(1)
  const [panalyses, setPanalyses] = useState([]); const [paTotal, setPaTotal]           = useState(0); const [paPage, setPaPage]           = useState(1)
  const [pconcepts, setPconcepts] = useState([]); const [pcTotal, setPcTotal]           = useState(0); const [pcPage, setPcPage]           = useState(1)
  const [therapists, setTherapists] = useState([]); const [thrTotal, setThrTotal]       = useState(0); const [thrPage, setThrPage]         = useState(1)
  const [courses, setCourses]     = useState([]); const [courseTotal, setCourseTotal]   = useState(0); const [coursePage, setCoursePage]   = useState(1)
  const [courseSubTab, setCourseSubTab] = useState('list')
  const [assessments, setAssess]  = useState([]); const [assTotal, setAssTotal]         = useState(0); const [assPage, setAssPage]         = useState(1)
  const [community, setCommunity] = useState([]); const [comTotal, setComTotal]         = useState(0); const [comPage, setComPage]         = useState(1)
  const [faqs, setFaqs]           = useState([]); const [faqTotal, setFaqTotal]         = useState(0); const [faqPage, setFaqPage]         = useState(1)
  const [coupons, setCoupons]     = useState([]); const [couTotal, setCouTotal]         = useState(0); const [couPage, setCouPage]         = useState(1)
  const [contacts, setContacts]   = useState([]); const [ctcTotal, setCtcTotal]         = useState(0); const [ctcPage, setCtcPage]         = useState(1)
  const [subs, setSubs]           = useState([]); const [subTotal, setSubTotal]         = useState(0); const [subPage, setSubPage]         = useState(1)
  const [settings, setSettings]   = useState([])

  // Modal
  const [modal, setModal]             = useState(null)
  const [form, setForm]               = useState({})
  const [saving, setSaving]           = useState(false)
  const [saveErr, setSaveErr]         = useState(null)
  const [delConfirm, setDelConfirm]   = useState(null)
  const [busy, setBusy]               = useState({})
  const [photoReplace, setPhotoReplace]       = useState(null)
  const [photoUploading, setPhotoUploading]   = useState(false)
  const [photoError, setPhotoError]           = useState('')

  const setB = (k, v) => setBusy(b => ({ ...b, [k]:v }))

  // Auth guard
  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/staff'); return }
    if (!['admin','staff'].includes(user.role)) { navigate('/portal'); return }
    loadDashboard()
  }, [user, authLoading])

  // Load on tab/page change
  // Auto-refresh orders every 30s when on orders tab
  useEffect(() => {
    if (tab !== 'orders') return
    const interval = setInterval(() => {
      fetchOrders()
      fetchRiders()
    }, 30_000)
    return () => clearInterval(interval)
  }, [tab, oPage, oStatus, oDeliveryStatus])

  // Load on tab/page change
  useEffect(() => {
    if (authLoading || !user || !['admin','staff'].includes(user.role)) return
    const MAP = {
      users:               fetchUsers,
      appointments:        fetchAppts,
  orders: () => { fetchOrders(); fetchRiders() },  // ← call both
      notifications:       fetchNotifClients,
      posts:               () => sec('/admin/posts',            setPosts,      setPostsTotal,  postsPage),
      news:                () => sec('/admin/news',             setNews,       setNewsTotal,   newsPage),
      resources:           () => sec('/admin/resources',        setRes,        setResTotal,    resPage),
      therapists:          () => sec('/admin/therapists',       setTherapists, setThrTotal,    thrPage),
      gallery:             () => sec('/admin/gallery',          setGallery,    setGalTotal,    galPage),
      volunteers:          fetchVolunteers,
      room_bookings:       fetchRoomBookings,
      gallery_submissions: fetchGalSubs,
      workshops:           fetchWorkshops,
      research:            () => sec('/admin/research',         setResearch,   setRscTotal,    rscPage),
      psych_videos:        () => sec('/admin/psych-videos',     setPvids,      setPvTotal,     pvPage),
      psych_analyses:      () => sec('/admin/psych-analyses',   setPanalyses,  setPaTotal,     paPage),
psych_concepts:      () => sec('/admin/psych-concepts',   setPconcepts,  setPcTotal,     pcPage),
      courses:             () => sec('/admin/courses',          setCourses,    setCourseTotal, coursePage),
      assessments:         () => sec('/admin/assessments',      setAssess,     setAssTotal,    assPage),
      community:           () => sec('/admin/community-groups', setCommunity,  setComTotal,    comPage),
      faqs:                () => sec('/admin/faqs',             setFaqs,       setFaqTotal,    faqPage),
      coupons:             () => sec('/admin/coupons',          setCoupons,    setCouTotal,    couPage),
      contacts:            () => sec('/admin/contacts',         setContacts,   setCtcTotal,    ctcPage),
      subscriptions:       () => sec('/admin/subscriptions',    setSubs,       setSubTotal,    subPage),
      settings:            fetchSettings,
      // AFTER (fixed)
      community_admin: () => {
        fetchCommGroups()
        fetchCommSessions(1)
        fetchCommReservations(null)
        fetchCommMemberships()
      },
    }                          // ← closes the MAP object
    if (MAP[tab]) MAP[tab]()   // ← now correctly outside the object
}, [tab, uPage, aPage, oPage, oStatus, oDeliveryStatus,   // ← added oStatus, oDeliveryStatus
    postsPage, newsPage, resPage, galSubPage, volPage,
    rscPage, pvPage, paPage, pcPage, coursePage, assPage, comPage,
    faqPage, couPage, rbPage, ctcPage, subPage, thrPage])

  // Fetchers
  const loadDashboard = async () => {
    setB('dash', true)
    try {
      const d = await adminApi.dashboard()
      setRecent(d.recentPayments || [])
      const pd = await apiFetch('/admin/payments?page=1&limit=200')
      const allP = pd.payments || pd.items || pd.data || []
      const rev = allP.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount || 0), 0)
      setStats({ ...(d.stats || {}), revenue30d:rev })
    } catch {}
    finally { setB('dash', false) }
  }

const fetchRiders = async () => {
    try {
      const d = await apiFetch('/admin/delivery-riders?is_active=true&limit=200')
      setRiders(
        (d.riders || d.items || d.data || []).map(r => ({
          id:           r.id,
          name:         r.full_name || r.profiles?.full_name || r.name || '—',
          area:         r.area || '',
          vehicle_type: r.vehicle_type || '',
        }))
      )
    } catch (e) { console.warn('fetchRiders:', e.message) }
  }

  // ── fetchOrders — updated to pass delivery_status filter + normalise join ← CHANGED
  const fetchOrders = async () => {
    setB('orders', true)
    try {
      const d = await adminApi.orders({
        page:            oPage,
        limit:           LIMIT,
        status:          oStatus           || undefined,
        delivery_status: oDeliveryStatus   || undefined,  // ← NEW param
      })
      // Normalise: flatten rider join so the table can read rider name directly
      const list = (d.orders || []).map(o => ({
        ...o,
        delivery_rider_name: o.delivery_riders?.profiles?.full_name
                          || o.delivery_rider_name
                          || null,
        rider_area:          o.delivery_riders?.area || null,
      }))
      setOrders(list)
      setOTotal(d.pagination?.total || 0)
    } catch {}
    finally { setB('orders', false) }
  }

  // ── assignRider ───────────────────────────────────────────── ← NEW
  const assignRider = async (orderId, riderId) => {
    setRiderBusy(b => ({ ...b, [orderId]: true }))
    try {
      await apiFetch(`/admin/orders/${orderId}/assign-rider`, {
        method: 'PUT',
        body:   JSON.stringify({ rider_id: riderId || null }),
      })
      // Optimistic local update — no full refetch needed
      setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o
        const rider = riders.find(r => r.id === riderId)
        return {
          ...o,
          delivery_rider_id:   riderId || null,
          delivery_rider_name: rider?.name || null,
          rider_area:          rider?.area || null,
          delivery_status:
            riderId && (!o.delivery_status || o.delivery_status === 'unassigned')
              ? 'assigned'
              : (!riderId ? 'unassigned' : o.delivery_status),
        }
      }))
      setRiderToast({ msg: riderId ? '🚴 Rider assigned' : 'Rider removed', ok: true })
      setTimeout(() => setRiderToast(null), 2800)
    } catch (e) {
      setRiderToast({ msg: e.message, ok: false })
      setTimeout(() => setRiderToast(null), 3500)
    } finally {
      setRiderBusy(b => ({ ...b, [orderId]: false }))
    }
  }


  const fetchUsers = async () => {
    setB('users', true)
    try {
      const d = await adminApi.users({ page:uPage, limit:LIMIT, q:uSearch||undefined, role:uRole||undefined })
      setUsers(d.users || []); setUTotal(d.pagination?.total || 0)
    } catch {}
    finally { setB('users', false) }
  }

  const fetchAppts = async () => {
    setB('appts', true)
    try {
      const d = await adminApi.appointments({ page:aPage, limit:LIMIT, status:aStatus||undefined })
      setAppts(d.appointments || []); setATotal(d.pagination?.total || 0)
    } catch {}
    finally { setB('appts', false) }
  }

 

  const fetchNotifClients = async () => {
    try { const d = await adminApi.users({ limit:200, role:'client' }); setNotifClients(d.users || []) } catch {}
  }

  const fetchRoomBookings = async () => {
    setRbLoading(true)
    try {
      const p = new URLSearchParams({ page:rbPage, limit:LIMIT })
      if (rbStatus) p.set('status', rbStatus)
      const d = await apiFetch(`/admin/room-bookings?${p}`)
      setRoomBookings(d.bookings || d.items || []); setRbTotal(d.pagination?.total || 0)
    } catch (e) { console.error(e) }
    finally { setRbLoading(false) }
  }

  const fetchSettings = async () => {
    setB('settings', true)
    try { const d = await apiFetch('/admin/settings'); setSettings(d.settings || d.data || []) }
    catch {}
    finally { setB('settings', false) }
  }

  const sec = async (ep, setter, totalSetter, pg) => {
    const k = ep.replace('/admin/', '').replace(/-/g, '_')
    setB(k, true)
    try {
      const d = await apiFetch(`${ep}?page=${pg}&limit=${LIMIT}`)
      const arr = d.items || d.posts || d.users || d.news || d.resources || d.gallery ||
        d.research || d.products || d.courses || d.assessments ||
        d.faqs || d.coupons || d.contacts || d.settings ||
        Object.values(d).find(v => Array.isArray(v)) || []
      setter(arr); totalSetter(d.pagination?.total ?? d.total ?? arr.length)
    } catch (e) { console.error(ep, e) }
    finally { setB(k, false) }
  }

  const fetchCommGroups = async () => {
    try { const d = await apiFetch('/admin/community-groups?page=1&limit=50'); setCommGroups(d.items || d.groups || []) } catch (e) { console.error(e) }
  }
  const fetchCommSessions = async (pg = 1) => {
    try {
      const d = await apiFetch(`/admin/group-sessions?page=${pg}&limit=20`)
      setCommSessions(d.items || []); setCommSessionsTotal(d.pagination?.total || 0)
    } catch (e) { console.error(e) }
  }
  const fetchCommReservations = async (sessionId = null) => {
    try {
      const url = sessionId ? `/admin/group-reservations?session_id=${sessionId}&limit=100` : `/admin/group-reservations?limit=100`
      const d = await apiFetch(url)
      setCommReservations(d.items || [])
      if (sessionId) setSelectedSessionId(sessionId)
    } catch (e) { console.error(e) }
  }
  const fetchCommMemberships = async (groupId = null) => {
    try {
      const p = new URLSearchParams({ limit:100 })
      if (groupId) p.set('group_id', groupId)
      const d = await apiFetch(`/admin/group-memberships?${p}`)
      setCommMemberships(d.items || [])
    } catch (e) { console.error(e) }
  }

  const fetchVolunteers = async () => {
    setB('volunteers', true)
    try {
      const p = new URLSearchParams({ page:volPage, limit:LIMIT })
      if (volStatus) p.set('status', volStatus)
      if (volSearch) p.set('search', volSearch)
      const d = await apiFetch(`/admin/volunteers?${p}`)
      setVolunteers(d.items || []); setVolTotal(d.pagination?.total || 0)
    } catch (e) { console.error(e) }
    finally { setB('volunteers', false) }
  }

  const fetchGalSubs = async () => {
    setB('gallery_submissions', true)
    try {
      const p = new URLSearchParams({ page:galSubPage, limit:LIMIT })
      if (galSubStatus) p.set('status', galSubStatus)
      const d = await apiFetch(`/admin/gallery-submissions?${p}`)
      setGalSubs(d.items || []); setGalSubTotal(d.pagination?.total || 0)
    } catch (e) { console.error(e) }
    finally { setB('gallery_submissions', false) }
  }

  const fetchWorkshops = async () => {
    setB('workshops', true)
    try { const d = await apiFetch('/workshops/admin/all'); setWorkshops(d.workshops || []); setWsTotal(d.workshops?.length || 0) }
    catch (e) { console.error(e) }
    finally { setB('workshops', false) }
  }

  const fetchWsRegs = async () => {
    setB('ws_regs', true)
    try { const d = await apiFetch('/workshops/admin/registrations'); setWsRegs(d.registrations || []) }
    catch (e) { console.error(e) }
    finally { setB('ws_regs', false) }
  }

const saveSessionModal = async () => {
    setSessionSaving(true); setSessionErr('')
    try {
      if (!sessionForm.group_id)           throw new Error('Please select a group')
      if (!sessionForm.title?.trim())      throw new Error('Title is required')
      if (!sessionForm.facilitator?.trim()) throw new Error('Facilitator is required')
      if (!sessionForm.scheduled_at)       throw new Error('Date and time is required')

      const body = {
        ...sessionForm,
        scheduled_at:     new Date(sessionForm.scheduled_at).toISOString(),
        max_spots:        Number(sessionForm.max_spots        || 20),
        price:            Number(sessionForm.price            || 0),
        duration_minutes: Number(sessionForm.duration_minutes || 60),
      }

      if (sessionModal?.data) {
        await apiFetch(`/admin/group-sessions/${sessionModal.data.id}`, {
          method: 'PUT', body: JSON.stringify(body),
        })
      } else {
        await apiFetch('/admin/group-sessions', {
          method: 'POST', body: JSON.stringify(body),
        })
      }
      setSessionModal(null)
      setSessionForm({})
      fetchCommSessions(commSessionPage)
    } catch (e) { setSessionErr(e.message) }
    finally { setSessionSaving(false) }
  }
  const ENDPOINTS = {
    post:'/admin/posts', news_article:'/admin/news', resource:'/admin/resources',
    gallery_item:'/admin/gallery', research_paper:'/admin/research', therapist_profile:'/admin/therapists',
  psych_video:'/admin/psych-videos', psych_analysis:'/admin/psych-analyses', psych_concept:'/admin/psych-concepts',
    course:'/admin/courses', assessment:'/admin/assessments',
    community_group:'/admin/community-groups', faq:'/admin/faqs', coupon:'/admin/coupons',
    setting:'/admin/settings', workshop:null,
  }

  const REFRESH_MAP = {
    post:              () => sec('/admin/posts',            setPosts,      setPostsTotal,  postsPage),
    news_article:      () => sec('/admin/news',             setNews,       setNewsTotal,   newsPage),
    resource:          () => sec('/admin/resources',        setRes,        setResTotal,    resPage),
    gallery_item:      () => sec('/admin/gallery',          setGallery,    setGalTotal,    galPage),
    therapist_profile: () => sec('/admin/therapists',       setTherapists, setThrTotal,    thrPage),
    research_paper:    () => sec('/admin/research',         setResearch,   setRscTotal,    rscPage),
    psych_video:       () => sec('/admin/psych-videos',     setPvids,      setPvTotal,     pvPage),
    psych_analysis:    () => sec('/admin/psych-analyses',   setPanalyses,  setPaTotal,     paPage),
psych_concept:     () => sec('/admin/psych-concepts',   setPconcepts,  setPcTotal,     pcPage),
    course:            () => sec('/admin/courses',          setCourses,    setCourseTotal, coursePage),
    assessment:        () => sec('/admin/assessments',      setAssess,     setAssTotal,    assPage),
    community_group:   () => sec('/admin/community-groups', setCommunity,  setComTotal,    comPage),
    faq:               () => sec('/admin/faqs',             setFaqs,       setFaqTotal,    faqPage),
    coupon:            () => sec('/admin/coupons',          setCoupons,    setCouTotal,    couPage),
    setting:           fetchSettings,
    workshop:          fetchWorkshops,
  }

  const openCreate = (type, defs = {}) => { setForm(defs); setSaveErr(null); setModal({ type, data:null }) }
  const openEdit   = (type, item)  => { setForm({ ...item }); setSaveErr(null); setModal({ type, data:item }) }
  const closeModal = () => { setModal(null); setForm({}); setSaveErr(null) }
  const fld = k => e => setForm(p => ({ ...p, [k]: e?.target ? e.target.value : e }))

  const saveModal = async () => {
    if (!modal) return
    setSaving(true); setSaveErr(null)
    try {
      if (modal.type === 'workshop') {
        const body = { ...form, seats:Number(form.seats||20), price:Number(form.price||0), sort_order:Number(form.sort_order||0), tags:Array.isArray(form.tags)?form.tags:(form.tags||'').split(',').map(t=>t.trim()).filter(Boolean), is_active:form.is_active!==false }
        if (modal.data) await apiFetch(`/workshops/admin/${modal.data.id}`, { method:'PATCH', body:JSON.stringify(body) })
        else await apiFetch('/workshops/admin', { method:'POST', body:JSON.stringify(body) })
      } else {
        const ep = ENDPOINTS[modal.type]
        if (modal.data) await apiFetch(`${ep}/${modal.data.id}`, { method:'PUT', body:JSON.stringify(form) })
        else await apiFetch(ep, { method:'POST', body:JSON.stringify(form) })
      }
closeModal()
await REFRESH_MAP[modal.type]?.()
    } catch (e) { setSaveErr(e.message) }
    finally { setSaving(false) }
  }

  const doDelete = async () => {
    if (!delConfirm) return
    try {
      await apiFetch(`${delConfirm.endpoint}/${delConfirm.id}`, { method:'DELETE' })
      setDelConfirm(null); delConfirm.refresh?.()
    } catch (e) { alert(e.message) }
  }

  const del = (ep, id, label, refresh) => setDelConfirm({ endpoint:ep, id, label, refresh })

  const doApptStatus  = async (id, s) => { try { await adminApi.updateAppointmentStatus(id, s); fetchAppts() } catch {} }
  const doOrderStatus = async (id, s) => { try { await adminApi.updateOrderStatus(id, s); fetchOrders() } catch {} }
  const doToggle      = async id      => { try { await adminApi.toggleActive(id); fetchUsers() } catch {} }
  const doRole        = async (id, r) => { try { await adminApi.updateRole(id, r); fetchUsers() } catch {} }
  const handleLogout  = async ()      => { await logout(); navigate('/staff') }

  const doContactStatus = async (id, s) => {
    try { await apiFetch(`/admin/contacts/${id}`, { method:'PUT', body:JSON.stringify({ status:s }) }); sec('/admin/contacts', setContacts, setCtcTotal, ctcPage) } catch {}
  }
  const doSubStatus = async (id, s) => {
    try { await apiFetch(`/admin/subscriptions/${id}`, { method:'PUT', body:JSON.stringify({ status:s }) }); sec('/admin/subscriptions', setSubs, setSubTotal, subPage) } catch {}
  }
  const updateVolStatus = async (id, status, notes) => {
    try { await apiFetch(`/admin/volunteers/${id}`, { method:'PUT', body:JSON.stringify({ status, admin_notes:notes }) }); fetchVolunteers() }
    catch (e) { alert(e.message) }
  }
  const updateGalSubStatus = async (id, status) => {
    try { await apiFetch(`/admin/gallery-submissions/${id}`, { method:'PUT', body:JSON.stringify({ status }) }); fetchGalSubs() }
    catch (e) { alert(e.message) }
  }
  const replaceGalleryPhoto = async (file) => {
    setPhotoUploading(true); setPhotoError('')
    try {
      const fd = new FormData()
      fd.append('photo', file); fd.append('title', photoReplace.title)
      fd.append('category', photoReplace.category || 'Events'); fd.append('itemId', photoReplace.id)
      const res = await fetch(`${API_BASE}/gallery/replace-photo`, { method:'POST', headers:{ Authorization:`Bearer ${getToken()}` }, body:fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      setPhotoReplace(null); sec('/admin/gallery', setGallery, setGalTotal, galPage)
    } catch (e) { setPhotoError(e.message) }
    finally { setPhotoUploading(false) }
  }

  const sendNotif = async e => {
    e.preventDefault(); setNotifSending(true); setNotifResult(null)
    const tk = getToken()
    const send = async uid => {
      const r = await fetch(`${API_BASE}/admin/notifications`, {
        method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${tk}` },
        body:JSON.stringify({ userId:uid, title:notifTitle, message:notifMsg, type:notifType }),
      })
      if (!r.ok) throw new Error('fail')
    }
    try {
      if (notifTarget === 'all') {
        let ok = 0
        for (const c of notifClients) { try { await send(c.id); ok++ } catch {} }
        setNotifResult({ ok:true, msg:`✓ Sent to ${ok} clients.` })
      } else {
        await send(notifTarget)
        const c = notifClients.find(x => x.id === notifTarget)
        setNotifResult({ ok:true, msg:`✓ Sent to ${c?.full_name || 'client'}.` })
      }
      setNotifTitle(''); setNotifMsg(''); setNotifTarget('')
    } catch (err) { setNotifResult({ ok:false, msg:`✗ ${err.message}` }) }
    finally { setNotifSending(false) }
  }

  // ── Modal fields ─────────────────────────────────────────────────────────
  function renderFields() {
    if (!modal) return null
    const t = modal.type
    if (t === 'post') return (<>
      <div className="field-row">
        <div className="field"><label>Title *</label><input className="inp" value={form.title||''} onChange={fld('title')} /></div>
        <div className="field"><label>Slug *</label><input className="inp" value={form.slug||''} onChange={e => setForm(p => ({ ...p, slug:e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') }))} /></div>
      </div>
      <div className="field"><label>Excerpt</label><textarea className="inp" rows={2} value={form.excerpt||''} onChange={fld('excerpt')} /></div>
      <div className="field"><label>Content (Markdown)</label><textarea className="inp mono" rows={8} value={form.content||''} onChange={fld('content')} /></div>
      <div className="field-row">
        <div className="field"><label>Category</label><select className="inp" value={form.category||'Anxiety'} onChange={fld('category')}>{['Anxiety','Depression','Self-Care','Mindfulness','Relationships','Trauma','Parenting','Sleep'].map(c=><option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>Author *</label><input className="inp" value={form.author||''} onChange={fld('author')} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Read Time</label><input className="inp" value={form.read_time||'5 min'} onChange={fld('read_time')} /></div>
        <div className="field"><label>Publish Date</label><input className="inp" type="date" value={(form.published_at||new Date().toISOString()).slice(0,10)} onChange={fld('published_at')} /></div>
      </div>
      <div className="field"><label>Cover Image URL</label><input className="inp" value={form.image_url||''} onChange={fld('image_url')} /></div>
      <div className="field"><label>Tags (comma separated)</label><input className="inp" value={Array.isArray(form.tags)?form.tags.join(', '):form.tags||''} onChange={e=>setForm(p=>({...p,tags:e.target.value.split(',').map(t=>t.trim()).filter(Boolean)}))} /></div>
      <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={!!form.featured} onChange={v=>setForm(p=>({...p,featured:v}))} /> Featured</label>
    </>)
    if (t === 'news_article') return (<>
      <div className="field"><label>Headline *</label><input className="inp" value={form.headline||''} onChange={fld('headline')} /></div>
      <div className="field-row">
        <div className="field"><label>Slug *</label><input className="inp" value={form.slug||''} onChange={fld('slug')} /></div>
        <div className="field"><label>Tag</label><input className="inp" value={form.tag||''} onChange={fld('tag')} /></div>
      </div>
      <div className="field"><label>Summary</label><textarea className="inp" rows={3} value={form.summary||''} onChange={fld('summary')} /></div>
      <div className="field-row">
        <div className="field"><label>Author</label><input className="inp" value={form.author||''} onChange={fld('author')} /></div>
        <div className="field"><label>Author Role</label><input className="inp" value={form.author_role||''} onChange={fld('author_role')} /></div>
      </div>
      <div style={{display:'flex',gap:'1.25rem'}}>
        {[['is_published','Published'],['is_featured','Featured']].map(([k,l])=>(<label key={k} style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={form[k]!==false} onChange={v=>setForm(p=>({...p,[k]:v}))} />{l}</label>))}
      </div>
    </>)
    if (t === 'resource') return (<>
      <div className="field"><label>Title *</label><input className="inp" value={form.title||''} onChange={fld('title')} /></div>
      <div className="field"><label>Description</label><textarea className="inp" rows={2} value={form.description||''} onChange={fld('description')} /></div>
      <div className="field-row">
        <div className="field"><label>Category</label><input className="inp" value={form.category||''} onChange={fld('category')} /></div>
        <div className="field"><label>File Type</label><select className="inp" value={form.file_type||'pdf'} onChange={fld('file_type')}><option value="pdf">PDF</option><option value="video">Video</option><option value="audio">Audio</option></select></div>
      </div>
      <div className="field"><label>File URL</label><input className="inp" value={form.file_url||''} onChange={fld('file_url')} /></div>
      <div style={{display:'flex',gap:'1.25rem'}}>
        {[['is_free','Free'],['is_active','Active']].map(([k,l])=>(<label key={k} style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={form[k]!==false} onChange={v=>setForm(p=>({...p,[k]:v}))} />{l}</label>))}
      </div>
    </>)
    if (t === 'gallery_item') return (<>
      <div className="field"><label>Title *</label><input className="inp" value={form.title||''} onChange={fld('title')} /></div>
      <div className="field-row">
        <div className="field"><label>Category *</label><input className="inp" value={form.category||''} onChange={fld('category')} /></div>
        <div className="field"><label>Emoji</label><input className="inp" value={form.emoji||'📸'} onChange={fld('emoji')} /></div>
      </div>
      <div className="field"><label>Description</label><textarea className="inp" rows={2} value={form.description||''} onChange={fld('description')} /></div>
      <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={form.is_active!==false} onChange={v=>setForm(p=>({...p,is_active:v}))} /> Active</label>
    </>)
    if (t === 'community_group') return (<>
      <div className="field"><label>Name *</label><input className="inp" value={form.name||''} onChange={fld('name')} /></div>
      <div className="field"><label>Description</label><textarea className="inp" rows={3} value={form.description||''} onChange={fld('description')} /></div>
      <div className="field-row">
        <div className="field"><label>Emoji</label><input className="inp" value={form.emoji||'💙'} onChange={fld('emoji')} /></div>
        <div className="field"><label>Color</label><input className="inp" value={form.color||''} onChange={fld('color')} placeholder="#3b82f6" /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Membership Fee (NPR) — 0=Free</label><input className="inp" type="number" value={form.membership_fee||0} onChange={fld('membership_fee')} /></div>
        <div className="field"><label>Period</label><select className="inp" value={form.membership_period||'one_time'} onChange={fld('membership_period')}><option value="one_time">One-time</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
      </div>
      <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={form.is_active!==false} onChange={v=>setForm(p=>({...p,is_active:v}))} /> Active</label>
    </>)
    if (t === 'faq') return (<>
      <div className="field"><label>Question *</label><input className="inp" value={form.question||''} onChange={fld('question')} /></div>
      <div className="field"><label>Answer *</label><textarea className="inp" rows={4} value={form.answer||''} onChange={fld('answer')} /></div>
      <div className="field-row">
        <div className="field"><label>Category</label><input className="inp" value={form.category||''} onChange={fld('category')} /></div>
        <div className="field"><label>Sort Order</label><input className="inp" type="number" value={form.sort_order||0} onChange={fld('sort_order')} /></div>
      </div>
      <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={form.is_active!==false} onChange={v=>setForm(p=>({...p,is_active:v}))} /> Active</label>
    </>)
    if (t === 'coupon') return (<>
      <div className="field-row">
        <div className="field"><label>Code *</label><input className="inp mono" value={form.code||''} onChange={fld('code')} /></div>
        <div className="field"><label>Type</label><select className="inp" value={form.type||'percentage'} onChange={fld('type')}><option value="percentage">Percentage</option><option value="fixed">Fixed (NPR)</option></select></div>
      </div>
      <div className="field-row3">
        <div className="field"><label>Value *</label><input className="inp" type="number" value={form.value||''} onChange={fld('value')} /></div>
        <div className="field"><label>Min Order</label><input className="inp" type="number" value={form.min_order_amount||0} onChange={fld('min_order_amount')} /></div>
        <div className="field"><label>Max Uses</label><input className="inp" type="number" value={form.max_uses||''} onChange={fld('max_uses')} /></div>
      </div>
      <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={form.is_active!==false} onChange={v=>setForm(p=>({...p,is_active:v}))} /> Active</label>
    </>)
    if (t === 'setting') return (<>
      <div className="field"><label>Key</label><input className="inp mono" value={form.key||''} readOnly style={{background:'var(--surface-2)',cursor:'not-allowed'}} /></div>
      <div className="field"><label>Value</label><textarea className="inp" rows={3} value={typeof form.value==='object'?JSON.stringify(form.value):String(form.value??'')} onChange={e=>setForm(p=>({...p,value:e.target.value}))} /><div className="field-hint">Wrap strings in quotes: "Nepal". Numbers without quotes.</div></div>
    </>)
    if (t === 'workshop') return (<>
      <div className="field-row">
        <div className="field"><label>Emoji</label><input className="inp" value={form.emoji||'🧠'} onChange={fld('emoji')} /></div>
        <div className="field"><label>Title *</label><input className="inp" value={form.title||''} onChange={fld('title')} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Facilitator *</label><input className="inp" value={form.facilitator||''} onChange={fld('facilitator')} /></div>
        <div className="field"><label>Mode *</label><select className="inp" value={form.mode||'Online (Zoom)'} onChange={fld('mode')}><option>Online (Zoom)</option><option>In-Person, Kathmandu</option><option>Hybrid</option></select></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Date *</label><input className="inp" value={form.date||''} onChange={fld('date')} placeholder="Sat, 21 Jun 2025" /></div>
        <div className="field"><label>Time *</label><input className="inp" value={form.time||''} onChange={fld('time')} placeholder="10:00 AM – 1:00 PM" /></div>
      </div>
      <div className="field-row3">
        <div className="field"><label>Seats</label><input className="inp" type="number" value={form.seats||20} onChange={fld('seats')} /></div>
        <div className="field"><label>Price (NPR)</label><input className="inp" type="number" value={form.price??0} onChange={fld('price')} /></div>
        <div className="field"><label>Sort Order</label><input className="inp" type="number" value={form.sort_order||0} onChange={fld('sort_order')} /></div>
      </div>
      <div className="field"><label>Description</label><textarea className="inp" rows={3} value={form.description||''} onChange={fld('description')} /></div>
      <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={form.is_active!==false} onChange={v=>setForm(p=>({...p,is_active:v}))} /> Active</label>
    </>)
    if (t === 'research_paper') return (<>
      <div className="field"><label>Title *</label><input className="inp" value={form.title||''} onChange={fld('title')} /></div>
      <div className="field-row">
        <div className="field"><label>Journal</label><input className="inp" value={form.journal||''} onChange={fld('journal')} /></div>
        <div className="field"><label>Year</label><input className="inp" type="number" value={form.year||''} onChange={fld('year')} /></div>
      </div>
      <div className="field"><label>Abstract</label><textarea className="inp" rows={3} value={form.abstract||''} onChange={fld('abstract')} /></div>
      <div className="field"><label>PDF URL</label><input className="inp" value={form.pdf_url||''} onChange={fld('pdf_url')} /></div>
      <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={form.open_access!==false} onChange={v=>setForm(p=>({...p,open_access:v}))} /> Open Access</label>
    </>)
    if (t === 'course') return (<>
      <div className="field-row">
        <div className="field"><label>Emoji</label><input className="inp" value={form.emoji||'📚'} onChange={fld('emoji')} /></div>
        <div className="field"><label>Title *</label><input className="inp" value={form.title||''} onChange={fld('title')} /></div>
      </div>
      <div className="field"><label>Description</label><textarea className="inp" rows={2} value={form.description||''} onChange={fld('description')} /></div>
      <div className="field-row">
        <div className="field"><label>Level</label><select className="inp" value={form.level||'Beginner'} onChange={fld('level')}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
        <div className="field"><label>Price (NPR) — 0=Free</label><input className="inp" type="number" value={form.price||0} onChange={fld('price')} /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>Duration (hrs)</label><input className="inp" type="number" value={form.duration_hours||''} onChange={fld('duration_hours')} /></div>
        <div className="field"><label>Lessons Count</label><input className="inp" type="number" value={form.lessons_count||''} onChange={fld('lessons_count')} /></div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Start Date</label>
          <input className="inp" type="date" value={(form.start_date||'').slice(0,10)} onChange={fld('start_date')} />
        </div>
        <div className="field">
          <label>Start Time</label>
          <input className="inp" type="time" value={form.start_time||''} onChange={fld('start_time')} />
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Total Seats (blank = unlimited)</label>
          <input className="inp" type="number" value={form.seats||''} onChange={fld('seats')} placeholder="e.g. 30" />
        </div>
        <div className="field">
          <label>Tags (comma separated)</label>
          <input className="inp" value={Array.isArray(form.tags)?form.tags.join(', '):form.tags||''} onChange={e=>setForm(p=>({...p,tags:e.target.value.split(',').map(x=>x.trim()).filter(Boolean)}))} />
        </div>
      </div>
      <div className="field"><label>Thumbnail URL</label><input className="inp" value={form.thumbnail_url||''} onChange={fld('thumbnail_url')} /></div>
      <div style={{display:'flex',gap:'1.25rem'}}>
        {[['is_free','Free'],['is_published','Published']].map(([k,l])=>(<label key={k} style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={form[k]!==false} onChange={v=>setForm(p=>({...p,[k]:v}))} />{l}</label>))}
      </div>
    </>)
   if (['psych_video','psych_analysis','psych_concept','assessment','therapist_profile'].includes(t)) return (<>
      <div className="field"><label>{t==='psych_concept'?'Term':'Title'} *</label><input className="inp" value={form.title||form.term||''} onChange={e=>setForm(p=>({...p,[t==='psych_concept'?'term':'title']:e.target.value}))} /></div>
      {t==='psych_video' && <div className="field"><label>YouTube ID *</label><input className="inp mono" value={form.youtube_id||''} onChange={fld('youtube_id')} /></div>}
      {t==='psych_concept' && <div className="field"><label>Definition *</label><textarea className="inp" rows={4} value={form.definition||''} onChange={fld('definition')} /></div>}
      {t==='therapist_profile' && <div className="field-row"><div className="field"><label>Email</label><input className="inp" value={form.email||''} onChange={fld('email')} /></div><div className="field"><label>Fee (NPR)</label><input className="inp" type="number" value={form.consultation_fee||0} onChange={fld('consultation_fee')} /></div></div>}
      <label style={{display:'flex',alignItems:'center',gap:'.5rem',fontSize:'.78rem',cursor:'pointer'}}><Toggle on={form.is_active!==false && form.is_available!==false} onChange={v=>setForm(p=>({...p,is_active:v,is_available:v}))} /> Active</label>
    </>)
    return <p style={{color:'var(--text-muted)',fontSize:'.82rem'}}>No form defined for "{t}".</p>
  }

const MODAL_TITLES = { post:'Blog Post', news_article:'News Article', resource:'Resource', gallery_item:'Gallery Item', research_paper:'Research Paper', psych_video:'Psych Video', psych_analysis:'Psych Analysis', psych_concept:'Psych Concept', therapist_profile:'Therapist', course:'Course', assessment:'Assessment', community_group:'Community Group', faq:'FAQ', coupon:'Coupon', setting:'Setting', workshop:'Workshop' }
  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0d1117' }}>
      <div style={{ textAlign:'center', color:'#4a5568' }}>
        <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>◈</div>
        <p style={{ fontFamily:'Sora, sans-serif', fontSize:'.82rem' }}>Verifying session…</p>
      </div>
    </div>
  )

  const allTabs = SIDEBAR.flatMap(g => g.items)

  return (
    <div className="adm">

      {/* TOP BAR */}
      <div className="adm-bar">
        <div className="brand">
          <img src="/header.png" className="brand-logo" alt="" onError={e => e.target.style.display='none'} />
          <div>
            <div className="brand-name">Common Psychology</div>
            <div className="brand-sub">Admin Panel</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="avatar">{(user?.fullName||user?.full_name||'A').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</div>
          <span className="topbar-name">{(user?.fullName||user?.full_name||'').split(' ')[0]}</span>
          <button className="logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </div>

      {/* MOBILE TAB BAR */}
      <div className="adm-tabbar">
        {allTabs.map(t => <button key={t.id} className={`mob-tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
      </div>

      <div className="adm-body">

        {/* SIDEBAR */}
        <div className="adm-side">
          {SIDEBAR.map(g => (
            <div key={g.group}>
              <div className="side-group-label">{g.group}</div>
              {g.items.map(t => (
                <button key={t.id} className={`side-btn${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
                  <span className="side-icon">{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          ))}
          <div className="side-divider" />
          <button className="side-btn side-accent" onClick={() => navigate('/register-staffs')}>
            <span className="side-icon">+</span>Register Staff
          </button>
        </div>

        {/* CONTENT */}
        <div className="adm-content">

          {/* ═══ DASHBOARD ═══ */}
          {tab === 'dashboard' && (
            <div>
              <SectionHeader title="Overview" sub={`Welcome back, ${(user?.fullName||user?.full_name||'').split(' ')[0]}.`}>
                <button className="btn btn-ghost" onClick={loadDashboard}>↺ Refresh</button>
              </SectionHeader>
              <div className="stat-grid">
                {[
                  { icon:'◎', val:stats?.totalUsers,        label:'Total Clients',  bg:'#eff6ff', tab:'users' },
                  { icon:'▦', val:stats?.totalAppointments, label:'Appointments',   bg:'#ecfdf5', tab:'appointments' },
                  { icon:'⬡', val:stats?.totalOrders,       label:'Total Orders',   bg:'#fffbeb', tab:'orders' },
                  { icon:'◉', val:stats?.revenue30d!=null?`NPR ${Number(stats.revenue30d).toLocaleString()}`:null, label:'Revenue', bg:'#f5f3ff', tab:'payments' },
                ].map((s,i) => (
                  <div key={i} className="stat-card" style={{ background:s.bg }} onClick={() => setTab(s.tab)}>
                    <div className="stat-icon">{s.icon}</div>
                    <div className="stat-val">{s.val ?? <span style={{opacity:.3,fontSize:'1rem'}}>—</span>}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="section-inner">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                  <span style={{ fontWeight:700, fontSize:'.9rem' }}>Recent Payments</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setTab('payments')}>View all →</button>
                </div>
                {busy.dash ? <div className="tbl-loading"><span className="spinner" /> Loading…</div>
                  : recent.length === 0 ? <div className="empty-state"><div className="empty-text">No payments yet.</div></div>
                  : recent.map((p,i) => {
                      const { clientName, category, isPending } = resolvePaymentDetails(p)
                      return (
                        <div key={p.id||i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'.6rem 0', borderBottom:i<recent.length-1?'1px solid var(--border-2)':'none', flexWrap:'wrap', gap:'.5rem' }}>
                          <div>
                            <div style={{ fontSize:'.83rem', fontWeight:700 }}>NPR {Number(p.amount||0).toLocaleString()} <span style={{ fontSize:'.72rem', color:'var(--text-muted)', fontWeight:400 }}>· {p.method||'—'}</span></div>
                            <div style={{ fontSize:'.7rem', color:'var(--text-muted)' }}>{clientName} · {category} · {fmt(p.created_at)}</div>
                          </div>
                          <div style={{ display:'flex', gap:'.35rem', alignItems:'center' }}>
                            <PayBadge status={p.status} />
                            {isPending && <button className="btn btn-success btn-sm" onClick={() => setTab('payments')}>Confirm →</button>}
                          </div>
                        </div>
                      )
                    })
                }
              </div>
            </div>
          )}

          {/* ═══ USERS ═══ */}
          {tab === 'users' && (
            <div>
              <SectionHeader title="Users" count={uTotal}>
                <input className="inp" value={uSearch} onChange={e=>setUSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchUsers()} placeholder="Search name / email…" style={{width:180}} />
                <select className="inp" value={uRole} onChange={e=>{setURole(e.target.value);setUPage(1)}}>
                  <option value="">All roles</option>
                  {['client','therapist','admin','staff'].map(r=><option key={r} value={r}>{r}</option>)}
                </select>
                <button className="btn btn-ghost" onClick={()=>{setUPage(1);fetchUsers()}}>Search</button>
              </SectionHeader>
            <Table loading={busy.users} cols={['User','Email','Emergency Contact','Role','Status','Joined','Actions']}
                rows={users.map(u=>(
                  <tr key={u.id}>
                    <td><strong style={{fontSize:'.82rem'}}>{u.full_name}</strong></td>
                    <td style={{fontSize:'.74rem',color:'var(--text-muted)'}}>{u.email}</td>
                    <td style={{fontSize:'.76rem', minWidth: 160}}>
                      {u.emergency_contact_name
                        ? <>
                            <div style={{fontWeight:600}}>{u.emergency_contact_name}</div>
                            <div style={{fontSize:'.68rem', color:'var(--text-muted)'}}>
                              {u.emergency_contact_phone || '—'}
                              {u.emergency_contact_relation ? ` · ${u.emergency_contact_relation}` : ''}
                            </div>
                          </>
                        : <span style={{color:'var(--text-muted)'}}>—</span>
                      }
                    </td>
                    <td><select className="inp" value={u.role} onChange={e=>doRole(u.id,e.target.value)} style={{padding:'.18rem .45rem',fontSize:'.72rem'}}>{['client','therapist','admin','staff'].map(r=><option key={r} value={r}>{r}</option>)}</select></td>
                    <td><Badge s={u.is_active?'active':'paused'} /></td>
                    <td style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{fmt(u.created_at)}</td>
                    <td><button className={`btn btn-sm ${u.is_active?'btn-danger':'btn-success'}`} onClick={()=>doToggle(u.id)}>{u.is_active?'Deactivate':'Activate'}</button></td>
                  </tr>
                ))}
              />
              <Pager page={uPage} set={setUPage} total={uTotal} />
            </div>
          )}

     {/* ═══ APPOINTMENTS ═══ */}
          {tab === 'appointments' && (
            <div>
              {appts.some(a => {
                const unpaid = ['unpaid', 'pending', undefined, null].includes(a.payment_status)
                const ageMin = (Date.now() - new Date(a.created_at || a.scheduled_at).getTime()) / 60000
                return unpaid && ageMin > 20 && !['cancelled','completed'].includes(a.status)
              }) && (
                <div className="alert alert-warn" style={{ marginBottom:'.85rem' }}>
                  ⚠️ Some appointments on this page have been <strong>unpaid for over 20 minutes</strong> — likely abandoned checkouts. They won't appear in Payments until a payment record exists. Consider cancelling them to free the time slot.
                </div>
              )}
              <SectionHeader title="Appointments" count={aTotal}>
                <select className="inp" value={aStatus} onChange={e=>{setAStatus(e.target.value);setAPage(1)}}>
                  <option value="">All statuses</option>
                  {['pending','confirmed','completed','cancelled','no_show'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-ghost" onClick={fetchAppts}>↺</button>
              </SectionHeader>
         <Table loading={busy.appts} cols={['Client','Therapist','Date & Time','Type','Payment','Status','Update']}
                rows={appts.map(a=>{
                  const unpaid = ['unpaid', 'pending', undefined, null].includes(a.payment_status)
                  const ageMin = (Date.now() - new Date(a.created_at || a.scheduled_at).getTime()) / 60000
                  const stale  = unpaid && ageMin > 20 && !['cancelled','completed'].includes(a.status)
                  return (
                    <tr key={a.id} style={stale ? { background:'#fffbeb' } : undefined}>
                      <td><strong style={{fontSize:'.82rem'}}>{resolveClientName(a)}</strong></td>
                      <td style={{fontSize:'.79rem'}}>{resolveTherapistName(a)}</td>
                      <td style={{fontSize:'.74rem',color:'var(--text-muted)',whiteSpace:'nowrap'}}>{fmtT(a.scheduled_at)}</td>
                      <td><span style={{fontSize:'.7rem',background:'var(--surface-2)',padding:'.15rem .4rem',borderRadius:4}}>{a.type}</span></td>
                      <td>
                        {stale
                          ? <span className="pay-badge" style={{ background:'#fef3c7', color:'#92400e' }}>⚠️ Abandoned?</span>
                          : <span className="pay-badge" style={{ background:a.payment_status==='paid'?'#ecfdf5':'#f1f5f9', color:a.payment_status==='paid'?'#065f46':'#475569' }}>{a.payment_status||'—'}</span>
                        }
                      </td>
                      <td><Badge s={a.status} /></td>
                      <td><select className="inp" value={a.status} onChange={e=>doApptStatus(a.id,e.target.value)} style={{padding:'.18rem .42rem',fontSize:'.72rem'}}>{['pending','confirmed','completed','cancelled','no_show'].map(s=><option key={s} value={s}>{s}</option>)}</select></td>
                    </tr>
                  )
                })}
              />
              <Pager page={aPage} set={setAPage} total={aTotal} />
            </div>
          )}

          {/* ═══ ORDERS ═══ */}
          {tab === 'orders' && (
            <div>

              {/* Rider assignment toast ────────────────────────── ← NEW */}
          {riderToast && (
            <div style={{
              position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999,
              background: riderToast.ok ? 'var(--green)' : 'var(--red)',
              color: 'white', padding: '.65rem 1.1rem', borderRadius: 'var(--radius)',
              fontWeight: 600, fontSize: '.82rem', boxShadow: 'var(--shadow-md)',
            }}>{riderToast.msg}</div>
          )}

          <SectionHeader title="Orders" count={oTotal}>
            {/* Delivery status filter ── ← NEW */}
            <select className="inp" style={{ minWidth: 130 }}
              value={oDeliveryStatus}
              onChange={e => { setODeliveryStatus(e.target.value); setOPage(1) }}>
              <option value="">All delivery</option>
              {Object.entries(DS_BADGE).map(([k, v]) =>
                <option key={k} value={k}>{v.label}</option>
              )}
            </select>
            {/* Existing order status filter */}
            <select className="inp" value={oStatus}
              onChange={e => { setOStatus(e.target.value); setOPage(1) }}>
              <option value="">All statuses</option>
              {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s =>
                <option key={s} value={s}>{s}</option>
              )}
            </select>
            <button className="btn btn-ghost"
              onClick={() => { fetchOrders(); fetchRiders() }}>↺</button>
          </SectionHeader>

          {/* Unassigned orders alert ──────────────────────── ← NEW */}
          {orders.some(o => !o.delivery_rider_id && !['cancelled','refunded'].includes(o.status)) && (
            <div className="alert alert-warn" style={{ marginBottom: '.85rem' }}>
              ⚠️ <strong>
                {orders.filter(o => !o.delivery_rider_id && !['cancelled','refunded'].includes(o.status)).length} order(s)
              </strong> have no delivery rider assigned yet.
            </div>
          )}

          <div className="tbl-wrap">
            <div className="tbl-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    {/* ← CHANGED: added 'Delivery Status' + 'Delivery Rider' cols */}
                    {['Order #','Client','Amount','Order Status','Delivery Status','Delivery Rider','Address','Date','Update'].map(h =>
  <th key={h}>{h}</th>
)}
                  </tr>
                </thead>
               <tbody>
                  {busy.orders
                    ? <tr><td className="tbl-loading" colSpan={9}><span className="spinner" /> Loading…</td></tr>
                    : orders.length === 0
                      ? <tr><td colSpan={9}>
                          <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <div className="empty-text">No orders found</div>
                          </div>
                        </td></tr>
                      : orders.map(o => {
                          const dsKey  = o.delivery_status || 'unassigned'
                          const ds     = DS_BADGE[dsKey] || DS_BADGE.unassigned
                          const rName  = o.delivery_rider_name || null
                          const rArea  = o.rider_area || ''
                          const locked = ['delivered','returned','cancelled','refunded'].includes(dsKey)

                          return (
                            <tr key={o.id}>

                              {/* Order # */}
                              <td>
                                <span className="mono" style={{ fontWeight: 700, fontSize: '.78rem', color: 'var(--blue-dk)' }}>
                                  {o.order_number || '—'}
                                </span>
                              </td>

                              {/* Client */}
                              <td style={{ fontSize: '.79rem' }}>
                                {o.client_name || o.clients?.full_name || '—'}
                              </td>

                              {/* Amount */}
                              <td>
                                <strong>NPR {Number(o.total_amount || 0).toLocaleString()}</strong>
                              </td>

                              {/* Order status badge */}
                              <td><Badge s={o.status} /></td>

                              {/* Delivery status badge ─────────────────── ← NEW */}
                              <td>
                                <span style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '.28rem',
                                  padding: '.18rem .52rem', borderRadius: 100,
                                  fontSize: '.62rem', fontWeight: 700,
                                  textTransform: 'uppercase', letterSpacing: '.05em',
                                  background: ds.bg, color: ds.c,
                                }}>
                                  <span style={{
                                    width: 5, height: 5, borderRadius: '50%',
                                    background: ds.dot, display: 'inline-block', flexShrink: 0,
                                  }} />
                                  {ds.label}
                                </span>
                              </td>

                              {/* Delivery Rider dropdown ───────────────── ← NEW */}
                              <td style={{ minWidth: 185 }}>
                                {riderBusy[o.id]
                                  ? (
                                    <span style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                                      <span className="spinner" /> Saving…
                                    </span>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
                                      <select
                                        className="inp"
                                        value={o.delivery_rider_id || ''}
                                        disabled={locked}
                                        style={{
                                          padding: '.22rem .55rem', fontSize: '.72rem',
                                          minWidth: 170,
                                          borderColor: o.delivery_rider_id ? 'var(--green)' : 'var(--border)',
                                          background: o.delivery_rider_id ? 'var(--green-lt)' : 'var(--surface)',
                                        }}
                                        onChange={e => assignRider(o.id, e.target.value)}
                                      >
                                        <option value="">— Unassigned —</option>
                                        {riders.map(r => (
                                          <option key={r.id} value={r.id}>
                                            🚴 {r.name}{r.area ? ` · ${r.area}` : ''}{r.vehicle_type ? ` (${r.vehicle_type})` : ''}
                                          </option>
                                        ))}
                                      </select>
                                      {/* Current rider sub-label */}
                                      {rName && (
                                        <div style={{ fontSize: '.62rem', color: 'var(--green-dk)', fontWeight: 600 }}>
                                          ✓ {rName}{rArea ? ` · ${rArea}` : ''}
                                        </div>
                                      )}
                                      {locked && (
                                        <div style={{ fontSize: '.6rem', color: 'var(--text-muted)' }}>
                                          locked · {ds.label}
                                        </div>
                                      )}
                                    </div>
                                  )
                                }
                              </td>

                           <td style={{ maxWidth: 220, fontSize: '.74rem' }}>
                                {o.shipping_address ? (() => {
                                  const a = o.shipping_address
                                  const name    = a.full_name || a.name || ''
                                  const address = a.address_line || a.address || ''
                                  return (
                                    <div>
                                      {name && <div style={{ fontWeight: 600 }}>{name}</div>}
                                      {a.phone && <div style={{ color: 'var(--text-muted)' }}>{a.phone}</div>}
                                      {(address || a.city) && (
                                        <div style={{ color: 'var(--text-muted)' }}>
                                          {address}{address && a.city ? ', ' : ''}{a.city}
                                          {a.landmark ? ` (${a.landmark})` : ''}
                                        </div>
                                      )}
                                      {a.notes && (
                                        <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                          {a.notes}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })() : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                              </td>

                              {/* Date */}
                              <td style={{ fontSize: '.72rem', color: 'var(--text-muted)' }}>
                                {fmt(o.created_at)}
                              </td>

                              {/* Order status updater */}
                              <td>
                                <select className="inp" value={o.status}
                                  onChange={e => doOrderStatus(o.id, e.target.value)}
                                  style={{ padding: '.18rem .42rem', fontSize: '.72rem' }}>
                                  {['pending','confirmed','processing','shipped','delivered','cancelled','refunded'].map(s =>
                                    <option key={s} value={s}>{s}</option>
                                  )}
                                </select>
                              </td>

                            </tr>
                          )
                        })
                  }
                </tbody>
              </table>
            </div>
          </div>
          <Pager page={oPage} set={setOPage} total={oTotal} />
        </div>
      )}
              

          {/* ═══ PAYMENTS ═══ */}
          {tab === 'payments' && <PaymentsSection />}

          {/* ═══ NOTIFICATIONS ═══ */}
          {tab === 'notifications' && (
            <div>
              <SectionHeader title="Send Notifications" sub="Push notifications to clients" />
              <div className="section-inner" style={{maxWidth:600}}>
                <form onSubmit={sendNotif} style={{display:'flex',flexDirection:'column',gap:'.9rem'}}>
                  <div className="field">
                    <label>Send To</label>
                    <select className="inp" value={notifTarget} onChange={e=>setNotifTarget(e.target.value)} required>
                      <option value="">— Select recipient —</option>
                      <option value="all">📢 All Clients ({notifClients.length})</option>
                      {notifClients.map(c=><option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>)}
                    </select>
                  </div>
                  <div className="field-row">
                    <div className="field"><label>Type</label><select className="inp" value={notifType} onChange={e=>setNotifType(e.target.value)}>{['system','appointment','payment','reminder','message','review'].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                    <div className="field"><label>Title *</label><input className="inp" value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} placeholder="e.g. Session reminder" required /></div>
                  </div>
                  <div className="field"><label>Message (optional)</label><textarea className="inp" rows={3} value={notifMsg} onChange={e=>setNotifMsg(e.target.value)} /></div>
                  {notifResult && <div className={`alert ${notifResult.ok?'alert-success':'alert-error'}`}>{notifResult.msg}</div>}
                  <button type="submit" className="btn btn-primary" disabled={notifSending||!notifTarget||!notifTitle.trim()} style={{alignSelf:'flex-start'}}>
                    {notifSending ? <><span className="spinner" /> Sending…</> : '◈ Send Notification'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {tab === 'hero_stats' && <HeroStatsSection />}
                    {tab === 'sms'        && <SmsSection />}

          {tab === 'reviews'    && <ReviewsModeration />}

          {/* ═══ BLOG POSTS ═══ */}
          {tab === 'posts' && (
            <div>
              <SectionHeader title="Blog Posts" count={postsTotal} onNew={() => openCreate('post',{status:'draft',featured:false})} />
              <Table loading={busy.posts} cols={['Title','Category','Author','Status','Actions']}
                rows={posts.map(p=>(
                  <tr key={p.id}>
                    <td><div style={{fontWeight:600,fontSize:'.82rem'}}>{p.title}</div><div className="mono" style={{fontSize:'.66rem',color:'var(--text-muted)'}}>{p.slug}</div></td>
                    <td><span style={{fontSize:'.72rem',background:'var(--surface-2)',padding:'.15rem .4rem',borderRadius:4}}>{p.category||'—'}</span></td>
                    <td style={{fontSize:'.78rem'}}>{p.author_name||'—'}</td>
                    <td><Badge s={p.status||'draft'} /></td>
                    <td><RowActions onEdit={()=>openEdit('post',p)} onDelete={()=>del('/admin/posts',p.id,p.title,()=>sec('/admin/posts',setPosts,setPostsTotal,postsPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={postsPage} set={setPostsPage} total={postsTotal} />
            </div>
          )}

          {/* ═══ NEWS ═══ */}
          {tab === 'news' && (
            <div>
              <SectionHeader title="News Articles" count={newsTotal} onNew={() => openCreate('news_article',{is_published:true,is_featured:false})} />
              <Table loading={busy.news} cols={['Headline','Author','Published','Actions']}
                rows={news.map(n=>(
                  <tr key={n.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem'}}>{n.headline}</td>
                    <td style={{fontSize:'.78rem'}}>{n.author||'—'}</td>
                    <td><Badge s={n.is_published?'published':'draft'} /></td>
                    <td><RowActions onEdit={()=>openEdit('news_article',n)} onDelete={()=>del('/admin/news',n.id,n.headline,()=>sec('/admin/news',setNews,setNewsTotal,newsPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={newsPage} set={setNewsPage} total={newsTotal} />
            </div>
          )}

          {/* ═══ RESOURCES ═══ */}
          {tab === 'resources' && (
            <div>
              <SectionHeader title="Resources" count={resTotal} onNew={() => openCreate('resource',{is_free:true,is_active:true})} />
              <Table loading={busy.resources} cols={['Title','Category','Type','Active','Actions']}
                rows={resources.map(r=>(
                  <tr key={r.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem'}}>{r.title}</td>
                    <td style={{fontSize:'.78rem'}}>{r.category||'—'}</td>
                    <td><Badge s={r.file_type||'—'} /></td>
                    <td><Badge s={r.is_active!==false?'active':'paused'} /></td>
                    <td><RowActions onEdit={()=>openEdit('resource',r)} onDelete={()=>del('/admin/resources',r.id,r.title,()=>sec('/admin/resources',setRes,setResTotal,resPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={resPage} set={setResPage} total={resTotal} />
            </div>
          )}

          {/* ═══ GALLERY ═══ */}
          {tab === 'gallery' && (
            <div>
<SectionHeader title="Gallery" count={galTotal} onNew={() => openCreate('gallery_item',{is_active:true,emoji:'📸'})}>
  <button className="btn btn-ghost" onClick={() => sec('/admin/gallery', setGallery, setGalTotal, galPage)}>↺ Refresh</button>
</SectionHeader>              <Table loading={busy.gallery} cols={['Title','Category','Active','Actions']}
                rows={gallery.map(g=>(
                  <tr key={g.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem'}}>{g.emoji} {g.title}</td>
                    <td style={{fontSize:'.78rem'}}>{g.category}</td>
                    <td><Badge s={g.is_active!==false?'active':'paused'} /></td>
                    <td>
                      <RowActions onEdit={()=>openEdit('gallery_item',g)} onDelete={()=>del('/admin/gallery',g.id,g.title,()=>sec('/admin/gallery',setGallery,setGalTotal,galPage))}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>{setPhotoReplace({id:g.id,title:g.title,category:g.category});setPhotoError('')}}>🖼 Photo</button>
                      </RowActions>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={galPage} set={setGalPage} total={galTotal} />
            </div>
          )}

          {photoReplace && (
            <div className="overlay" onClick={()=>setPhotoReplace(null)}>
              <div className="modal" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
                <div className="modal-head"><span className="modal-head-title">Replace Photo — {photoReplace.title}</span><button className="btn btn-ghost btn-sm" onClick={()=>setPhotoReplace(null)}>✕</button></div>
                <div className="modal-body">
                  <input type="file" accept=".jpg,.jpeg,.png,.webp" style={{padding:'.45rem',border:'1.5px solid var(--border)',borderRadius:'var(--radius-sm)',fontSize:'.78rem',width:'100%'}} onChange={e=>{const f=e.target.files[0];if(f)replaceGalleryPhoto(f)}} />
                  {photoError && <div className="alert alert-error">{photoError}</div>}
                  {photoUploading && <div style={{textAlign:'center',color:'var(--blue)',fontWeight:600,fontSize:'.82rem'}}><span className="spinner" /> Uploading…</div>}
                </div>
                <div className="modal-foot"><button className="btn btn-ghost" onClick={()=>setPhotoReplace(null)}>Cancel</button></div>
              </div>
            </div>
          )}

          {/* ═══ RESEARCH ═══ */}
          {tab === 'research' && (
            <div>
              <SectionHeader title="Research Papers" count={rscTotal} onNew={() => openCreate('research_paper',{open_access:true})} />
              <Table loading={busy.research} cols={['Title','Journal','Year','Actions']}
                rows={research.map(r=>(
                  <tr key={r.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem'}}>{r.title}</td>
                    <td style={{fontSize:'.78rem'}}>{r.journal||'—'}</td>
                    <td style={{fontSize:'.78rem'}}>{r.year||'—'}</td>
                    <td><RowActions onEdit={()=>openEdit('research_paper',r)} onDelete={()=>del('/admin/research',r.id,r.title,()=>sec('/admin/research',setResearch,setRscTotal,rscPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={rscPage} set={setRscPage} total={rscTotal} />
            </div>
          )}

          {/* ═══ PSYCH VIDEOS ═══ */}
          {tab === 'psych_videos' && (
            <div>
              <SectionHeader title="Psych Videos" count={pvTotal} onNew={() => openCreate('psych_video',{is_active:true})} />
              <Table loading={busy.psych_videos} cols={['Title','YouTube ID','Duration','Active','Actions']}
                rows={pvids.map(v=>(
                  <tr key={v.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem'}}>{v.title}</td>
                    <td><code className="mono" style={{fontSize:'.72rem',background:'var(--surface-2)',padding:'.12rem .38rem',borderRadius:4}}>{v.youtube_id}</code></td>
                    <td style={{fontSize:'.78rem'}}>{v.duration||'—'}</td>
                    <td><Badge s={v.is_active!==false?'active':'paused'} /></td>
                    <td><RowActions onEdit={()=>openEdit('psych_video',v)} onDelete={()=>del('/admin/psych-videos',v.id,v.title,()=>sec('/admin/psych-videos',setPvids,setPvTotal,pvPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={pvPage} set={setPvPage} total={pvTotal} />
            </div>
          )}

          {/* ═══ PSYCH ANALYSES ═══ */}
          {tab === 'psych_analyses' && (
            <div>
              <SectionHeader title="Psych Analyses" count={paTotal} onNew={() => openCreate('psych_analysis',{is_active:true})} />
              <Table loading={busy.psych_analyses} cols={['Title','Category','Active','Actions']}
                rows={panalyses.map(a=>(
                  <tr key={a.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem'}}>{a.title}</td>
                    <td style={{fontSize:'.78rem'}}>{a.category||'—'}</td>
                    <td><Badge s={a.is_active!==false?'active':'paused'} /></td>
                    <td><RowActions onEdit={()=>openEdit('psych_analysis',a)} onDelete={()=>del('/admin/psych-analyses',a.id,a.title,()=>sec('/admin/psych-analyses',setPanalyses,setPaTotal,paPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={paPage} set={setPaPage} total={paTotal} />
            </div>
          )}

          {/* ═══ PSYCH CONCEPTS ═══ */}
          {tab === 'psych_concepts' && (
            <div>
              <SectionHeader title="Psych Concepts" count={pcTotal} onNew={() => openCreate('psych_concept',{is_active:true})} />
              <Table loading={busy.psych_concepts} cols={['Term','Definition','Active','Actions']}
                rows={pconcepts.map(c=>(
                  <tr key={c.id}>
                    <td style={{fontWeight:700,fontSize:'.83rem',color:'var(--blue-dk)'}}>{c.term}</td>
                    <td style={{maxWidth:300,fontSize:'.75rem'}}>{c.definition?.slice(0,90)}…</td>
                    <td><Badge s={c.is_active!==false?'active':'paused'} /></td>
                    <td><RowActions onEdit={()=>openEdit('psych_concept',c)} onDelete={()=>del('/admin/psych-concepts',c.id,c.term,()=>sec('/admin/psych-concepts',setPconcepts,setPcTotal,pcPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={pcPage} set={setPcPage} total={pcTotal} />
            </div>
          )}

          {/* ═══ THERAPISTS ═══ */}
          {tab === 'therapists' && (
            <div>
              <SectionHeader title="Therapists" count={thrTotal} onNew={() => openCreate('therapist_profile',{is_available:true,is_active:true})} />
              <Table loading={busy.therapists} cols={['Therapist','Fee (NPR)','Available','Actions']}
                rows={therapists.map(t=>(
                  <tr key={t.id}>
                    <td><div style={{fontWeight:700,fontSize:'.82rem'}}>{t.full_name||'—'}</div><div style={{fontSize:'.7rem',color:'var(--text-muted)'}}>{t.email||''}</div></td>
                    <td>NPR {Number(t.consultation_fee||0).toLocaleString()}</td>
                    <td><Badge s={t.is_available?'active':'paused'} /></td>
                    <td><RowActions onEdit={()=>openEdit('therapist_profile',t)} onDelete={()=>del('/admin/therapists',t.id,t.full_name||'Therapist',()=>sec('/admin/therapists',setTherapists,setThrTotal,thrPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={thrPage} set={setThrPage} total={thrTotal} />
            </div>
          )}

          {/* ═══ VOLUNTEERS ═══ */}
          {tab === 'volunteers' && (
            <div>
              <SectionHeader title="Volunteer Applications" count={volTotal}>
                <input className="inp" value={volSearch} onChange={e=>setVolSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&fetchVolunteers()} placeholder="Search…" style={{width:180}} />
                <select className="inp" value={volStatus} onChange={e=>{setVolStatus(e.target.value);setVolPage(1)}}>
                  <option value="">All statuses</option>
                  {['new','reviewing','approved','rejected','waitlisted'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-ghost" onClick={fetchVolunteers}>↺</button>
              </SectionHeader>
              <Table loading={busy.volunteers} cols={['Applicant','Role','District','Status','Applied','Actions']}
                rows={volunteers.map(v=>(
                  <tr key={v.id}>
                    <td><div style={{fontWeight:700,fontSize:'.82rem'}}>{v.first_name} {v.last_name}</div><div style={{fontSize:'.7rem',color:'var(--text-muted)'}}>{v.email}</div></td>
                    <td style={{fontSize:'.76rem'}}>{v.role}</td>
                    <td style={{fontSize:'.76rem'}}>{v.district||'—'}</td>
                    <td><select className="inp" value={v.status||'new'} onChange={e=>updateVolStatus(v.id,e.target.value,v.admin_notes)} style={{padding:'.18rem .42rem',fontSize:'.72rem'}}>{['new','reviewing','approved','rejected','waitlisted'].map(s=><option key={s} value={s}>{s}</option>)}</select></td>
                    <td style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{fmt(v.created_at)}</td>
                    <td>
                      <RowActions onDelete={()=>del('/admin/volunteers',v.id,`${v.first_name} ${v.last_name}`,fetchVolunteers)}>
                        <button className="btn btn-ghost btn-sm" onClick={()=>setVolDetail(v)}>View</button>
                      </RowActions>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={volPage} set={setVolPage} total={volTotal} />
              {volDetail && (
                <div className="overlay" onClick={()=>setVolDetail(null)}>
                  <div className="modal" onClick={e=>e.stopPropagation()}>
                    <div className="modal-head"><span className="modal-head-title">Volunteer — {volDetail.first_name} {volDetail.last_name}</span><button className="btn btn-ghost btn-sm" onClick={()=>setVolDetail(null)}>✕</button></div>
                    <div className="modal-body">
                      {[['Email',volDetail.email],['Phone',volDetail.phone],['District',volDetail.district||'—'],['Role',volDetail.role]].map(([k,v])=>(
                        <div key={k} style={{display:'flex',gap:'1rem',padding:'.32rem 0',borderBottom:'1px solid var(--border-2)',fontSize:'.82rem'}}><span style={{color:'var(--text-muted)',fontWeight:700,minWidth:110}}>{k}</span><span>{v}</span></div>
                      ))}
                      <div className="field" style={{marginTop:'.75rem'}}>
                        <label>Admin Notes</label>
                        <textarea className="inp" rows={3} defaultValue={volDetail.admin_notes||''} id="vol-notes" />
                      </div>
                    </div>
                    <div className="modal-foot">
                      <button className="btn btn-ghost" onClick={()=>setVolDetail(null)}>Close</button>
                      <button className="btn btn-primary" onClick={()=>{updateVolStatus(volDetail.id,volDetail.status,document.getElementById('vol-notes')?.value||'');setVolDetail(null)}}>Save Notes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ GALLERY SUBMISSIONS ═══ */}
          {tab === 'gallery_submissions' && (
            <div>
              <SectionHeader title="Photo Submissions" count={galSubTotal}>
                <select className="inp" value={galSubStatus} onChange={e=>{setGalSubStatus(e.target.value);setGalSubPage(1)}}>
                  <option value="">All statuses</option>
                  {['pending','approved','rejected','added_to_gallery'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-ghost" onClick={fetchGalSubs}>↺</button>
              </SectionHeader>
              <Table loading={busy.gallery_submissions} cols={['Preview','Submitter','Status','Date','Actions']}
                rows={galSubs.map(g=>(
                  <tr key={g.id}>
                    <td><div style={{width:52,height:52,borderRadius:'var(--radius-sm)',overflow:'hidden',background:'var(--surface-2)'}}>{g.file_url?<img src={g.file_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />:<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',fontSize:'1.2rem'}}>🖼</div>}</div></td>
                    <td><div style={{fontWeight:700,fontSize:'.82rem'}}>{g.name}</div><div style={{fontSize:'.7rem',color:'var(--text-muted)'}}>{g.email}</div></td>
                    <td><select className="inp" value={g.status||'pending'} onChange={e=>updateGalSubStatus(g.id,e.target.value)} style={{padding:'.18rem .42rem',fontSize:'.72rem'}}>{['pending','approved','rejected','added_to_gallery'].map(s=><option key={s} value={s}>{s}</option>)}</select></td>
                    <td style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{fmt(g.created_at)}</td>
                    <td>
                      <RowActions onDelete={()=>del('/admin/gallery-submissions',g.id,g.file_name||'submission',fetchGalSubs)}>
                        {g.file_url && <a href={g.file_url} target="_blank" rel="noreferrer"><button className="btn btn-ghost btn-sm">View</button></a>}
                      </RowActions>
                    </td>
                  </tr>
                ))}
              />
              <Pager page={galSubPage} set={setGalSubPage} total={galSubTotal} />
            </div>
          )}

          {/* ═══ WORKSHOPS ═══ */}
          {tab === 'workshops' && (
            <div>
              <SectionHeader title="Workshops">
                <div style={{display:'flex',gap:'.4rem'}}>
                  {['list','registrations'].map(t=><button key={t} className={`btn ${wsTab===t?'btn-primary':'btn-ghost'}`} onClick={()=>{setWsTab(t);if(t==='registrations')fetchWsRegs()}}>{t==='list'?'Workshops':'Registrations'}</button>)}
                  {wsTab==='list' && <button className="btn btn-primary" onClick={()=>openCreate('workshop',{emoji:'🧠',seats:20,price:0,is_active:true})}>+ New</button>}
                  <button className="btn btn-ghost" onClick={()=>wsTab==='list'?fetchWorkshops():fetchWsRegs()}>↺</button>
                </div>
              </SectionHeader>
              {wsTab === 'list' && (
                <Table loading={busy.workshops} cols={['Workshop','Facilitator','Date','Seats','Price','Active','Actions']}
                  rows={workshops.map(w=>(
                    <tr key={w.id}>
                      <td><div style={{fontWeight:700,fontSize:'.82rem'}}>{w.emoji} {w.title}</div></td>
                      <td style={{fontSize:'.78rem'}}>{w.facilitator}</td>
                      <td style={{fontSize:'.74rem',color:'var(--text-muted)'}}>{w.date}</td>
                      <td style={{fontSize:'.78rem'}}>{Number(w.booked||0)}/{w.seats}</td>
                      <td>{w.price===0?<Badge s="free" />:`NPR ${Number(w.price).toLocaleString()}`}</td>
                      <td><Badge s={w.is_active!==false?'active':'paused'} /></td>
                      <td><RowActions onEdit={()=>openEdit('workshop',w)} onDelete={()=>del('/workshops/admin',w.id,w.title,fetchWorkshops)} /></td>
                    </tr>
                  ))}
                />
              )}
              {wsTab === 'registrations' && (
                <Table loading={busy.ws_regs} cols={['Attendee','Workshop','Payment','Status','Registered','Actions']}
                  rows={wsRegs.map(r=>(
                    <tr key={r.id}>
                      <td><div style={{fontWeight:700,fontSize:'.82rem'}}>{r.attendee_name}</div><div style={{fontSize:'.7rem',color:'var(--text-muted)'}}>{r.attendee_email}</div></td>
                      <td style={{fontSize:'.78rem'}}>{r.workshops?.title||'—'}</td>
                      <td><PayBadge status={r.payment_status==='paid'?'paid':r.payment_status==='free'?'free':'pending'} /></td>
                      <td><Badge s={r.status||'pending'} /></td>
                      <td style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{fmt(r.created_at)}</td>
                      <td>
                        <div style={{display:'flex',gap:'.3rem'}}>
                          {r.status!=='confirmed' && <button className="btn btn-success btn-sm" disabled={busy[`wr_${r.id}`]} onClick={async()=>{setB(`wr_${r.id}`,true);try{await apiFetch(`/workshops/admin/registrations/${r.id}`,{method:'PATCH',body:JSON.stringify({status:'confirmed'})});fetchWsRegs()}catch(e){alert(e.message)}finally{setB(`wr_${r.id}`,false)}}}>✓ Confirm</button>}
                          {r.status!=='cancelled' && <button className="btn btn-danger btn-sm" disabled={busy[`wr_${r.id}`]} onClick={async()=>{setB(`wr_${r.id}`,true);try{await apiFetch(`/workshops/admin/registrations/${r.id}`,{method:'PATCH',body:JSON.stringify({status:'cancelled'})});fetchWsRegs()}catch(e){alert(e.message)}finally{setB(`wr_${r.id}`,false)}}}>✗ Cancel</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                />
              )}
            </div>
          )}

          {/* ═══ PRODUCTS ═══ */}
          {tab === 'products' && <AdminProductsSection />}

          {tab === 'courses' && (
  <CourseContentSection
    courses={courses}
    courseTotal={courseTotal}
    coursePage={coursePage}
    setCoursePage={setCoursePage}
    busy={busy}
    openEdit={openEdit}
    openCreate={openCreate}
    del={del}
    sec={sec}
    setCourses={setCourses}
    setCourseTotal={setCourseTotal}
    EnrollmentsComponent={CourseEnrollmentsSection}
  />
)}

          {/* ═══ ASSESSMENTS ═══ */}
          {tab === 'assessments' && (
            <div>
              <SectionHeader title="Assessments" count={assTotal} onNew={() => openCreate('assessment',{is_active:true,is_free:true})} />
              <Table loading={busy.assessments} cols={['Title','Type','Active','Actions']}
                rows={assessments.map(a=>(
                  <tr key={a.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem'}}>{a.title}</td>
                    <td><Badge s={a.type||'—'} /></td>
                    <td><Badge s={a.is_active!==false?'active':'paused'} /></td>
                    <td><RowActions onEdit={()=>openEdit('assessment',a)} onDelete={()=>del('/admin/assessments',a.id,a.title,()=>sec('/admin/assessments',setAssess,setAssTotal,assPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={assPage} set={setAssPage} total={assTotal} />
            </div>
          )}

          {/* ═══ COMMUNITY GROUPS ═══ */}
          {tab === 'community' && (
            <div>
              <SectionHeader title="Community Groups" count={comTotal} onNew={() => openCreate('community_group',{is_active:true,emoji:'💙'})} />
              <Table loading={busy.community_groups} cols={['Group','Emoji','Active','Actions']}
                rows={community.map(g=>(
                  <tr key={g.id}>
                    <td><div style={{fontWeight:600,fontSize:'.82rem'}}>{g.name}</div><div style={{fontSize:'.7rem',color:'var(--text-muted)'}}>{g.description?.slice(0,60)}</div></td>
                    <td style={{fontSize:'1.2rem'}}>{g.emoji}</td>
                    <td><Badge s={g.is_active!==false?'active':'paused'} /></td>
                    <td><RowActions onEdit={()=>openEdit('community_group',g)} onDelete={()=>del('/admin/community-groups',g.id,g.name,()=>sec('/admin/community-groups',setCommunity,setComTotal,comPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={comPage} set={setComPage} total={comTotal} />
            </div>
          )}

          {/* ═══ ROOM BOOKINGS ═══ */}
          {tab === 'room_bookings' && (
            <div>
              <SectionHeader title="Room Bookings" count={rbTotal}>
                <select className="inp" value={rbStatus} onChange={e=>{setRbStatus(e.target.value);setRbPage(1)}}>
                  <option value="">All statuses</option>
                  {['pending','confirmed','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <button className="btn btn-ghost" onClick={fetchRoomBookings}>↺</button>
              </SectionHeader>
              <Table loading={rbLoading} cols={['Client','Date','Time','Amount','Payment','Status','Actions']}
                rows={roomBookings.map(b=>(
                  <tr key={b.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem'}}>{b.profiles?.full_name||'—'}</td>
                    <td style={{fontWeight:700}}>{b.booked_date}</td>
                    <td style={{fontSize:'.76rem'}}>{b.start_time?.slice(0,5)} → {b.end_time?.slice(0,5)}</td>
                    <td>NPR {Number(b.total_amount||0).toLocaleString()}</td>
                    <td><Badge s={b.payment_status||'pending'} /></td>
                    <td>
                      <select className="inp" value={b.status||'pending'} style={{padding:'.18rem .42rem',fontSize:'.72rem'}}
                        onChange={async e=>{try{await apiFetch(`/admin/room-bookings/${b.id}`,{method:'PUT',body:JSON.stringify({status:e.target.value})});fetchRoomBookings()}catch(err){alert(err.message)}}}>
                        {['pending','confirmed','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><button className="btn btn-danger btn-sm" onClick={()=>del('/admin/room-bookings',b.id,`booking ${b.booked_date}`,fetchRoomBookings)}>🗑</button></td>
                  </tr>
                ))}
              />
              <Pager page={rbPage} set={setRbPage} total={rbTotal} />
            </div>
          )}

          {/* ═══ COMMUNITY ADMIN ═══ */}
          {tab === 'community_admin' && (
            <div>
              <SectionHeader title="Community Admin" sub="Groups · Sessions · Reservations · Memberships" />
              <div className="sub-tabbar">
                {[['groups','Groups'],['sessions','Sessions'],['reservations','Reservations'],['memberships','Memberships']].map(([t,l])=>(
                  <button key={t} className={`sub-tab${commTab===t?' active':''}`} onClick={()=>{
                    setCommTab(t)
                    if(t==='groups')fetchCommGroups()
                    if(t==='sessions')fetchCommSessions(commSessionPage)
                    if(t==='reservations')fetchCommReservations(selectedSessionId||null)
                    if(t==='memberships')fetchCommMemberships()
                  }}>{l}</button>
                ))}
              </div>

              {commTab === 'groups' && (
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.85rem'}}>
                    <span style={{fontSize:'.78rem',color:'var(--text-muted)'}}>{commGroups.length} groups</span>
                    <button className="btn btn-ghost btn-sm" onClick={fetchCommGroups}>↺ Refresh</button>
                  </div>
                  <Table cols={['Group','Members','Fee','Status','Actions']}
                    rows={commGroups.map(g=>(
                      <tr key={g.id}>
                        <td><div style={{display:'flex',alignItems:'center',gap:'.5rem'}}><span style={{fontSize:'1.3rem'}}>{g.emoji}</span><div><div style={{fontWeight:700,fontSize:'.82rem'}}>{g.name}</div><div style={{fontSize:'.68rem',color:'var(--text-muted)'}}>{g.description?.slice(0,45)}</div></div></div></td>
                        <td><button className="btn btn-ghost btn-sm" onClick={()=>{fetchCommMemberships(g.id);setCommTab('memberships')}}>👥 {g.member_count||0}</button></td>
                        <td>{Number(g.membership_fee||0)===0?<Badge s="free" />:<span style={{fontSize:'.78rem',fontWeight:700}}>NPR {Number(g.membership_fee).toLocaleString()}</span>}</td>
                        <td><Badge s={g.is_active!==false?'active':'paused'} /></td>
                        <td><RowActions onEdit={()=>openEdit('community_group',g)}><button className="btn btn-ghost btn-sm" onClick={()=>{setCommTab('sessions');fetchCommSessions()}}>Sessions</button></RowActions></td>
                      </tr>
                    ))}
                  />
                </div>
              )}


              {commTab === 'sessions' && (
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.85rem'}}>
                    <span style={{fontSize:'.78rem',color:'var(--text-muted)'}}>{commSessions.length} sessions</span>
                    <div style={{display:'flex',gap:'.4rem'}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>fetchCommSessions(commSessionPage)}>↺ Refresh</button>
                      <button className="btn btn-primary" onClick={()=>{setSessionForm({max_spots:20,mode:'Online (Zoom)',price:0,group_id:commGroups[0]?.id||''});setSessionErr('');setSessionModal({data:null})}}>+ New Session</button>
                    </div>
                  </div>
                  <Table cols={['Session','Group','Date','Mode','Spots','Left','Price','Actions']}
                    rows={commSessions.map(s=>(
                      <tr key={s.id}>
                        <td><div style={{fontWeight:700,fontSize:'.82rem'}}>{s.title}</div><div style={{fontSize:'.68rem',color:'var(--text-muted)'}}>👤 {s.facilitator}</div></td>
                        <td style={{fontSize:'.76rem'}}>{s.community_groups?.emoji} {s.community_groups?.name||'—'}</td>
                        <td style={{fontSize:'.72rem',color:'var(--text-muted)',whiteSpace:'nowrap'}}>{fmtT(s.scheduled_at)}</td>
                        <td style={{fontSize:'.72rem'}}>{s.mode}</td>
                        <td style={{textAlign:'center',fontWeight:700}}>{s.max_spots}</td>
                        <td style={{textAlign:'center'}}><span style={{fontWeight:800,color:s.is_full?'var(--red)':s.spots_left<=3?'var(--amber)':'var(--green)'}}>{s.is_full?'FULL':s.spots_left}</span></td>
                        <td>{Number(s.price)>0?`NPR ${Number(s.price).toLocaleString()}`:<Badge s="free" />}</td>
                        <td>
                          <RowActions onEdit={()=>{setSessionForm({...s});setSessionErr('');setSessionModal({data:s})}} onDelete={()=>del('/admin/group-sessions',s.id,s.title,()=>fetchCommSessions(commSessionPage))}>
                            <button className="btn btn-ghost btn-sm" onClick={()=>{fetchCommReservations(s.id);setCommTab('reservations')}}>👥 {s.reserved_count||0}</button>
                          </RowActions>
                        </td>
                      </tr>
                    ))}
                  />
                  <Pager page={commSessionPage} set={p=>{setCommSessionPage(p);fetchCommSessions(p)}} total={commSessionsTotal} />
                </div>
              )}

              {commTab === 'reservations' && (
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.85rem',flexWrap:'wrap',gap:'.5rem'}}>
                    <span style={{fontSize:'.78rem',color:'var(--text-muted)'}}>{commReservations.length} reservations</span>
                    <div style={{display:'flex',gap:'.4rem'}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>fetchCommReservations(null)}>📋 All</button>
                      {selectedSessionId && <button className="btn btn-ghost btn-sm" onClick={()=>fetchCommReservations(selectedSessionId)}>↺</button>}
                    </div>
                  </div>
                  {commReservations.some(r=>r.payment_status==='pending') && (
                    <div className="alert alert-warn" style={{marginBottom:'.85rem'}}>⚠️ <strong>{commReservations.filter(r=>r.payment_status==='pending').length} reservation(s)</strong> awaiting payment verification.</div>
                  )}
                  <Table cols={['Attendee','Session','Method','Amount','Pay Status','Txn Ref','Booked','Actions']}
                    rows={commReservations.map(r=>{
                      const session=r.group_sessions||{}
                      const isFree=!session.price||Number(session.price)===0
                      const ps=isFree?'free':(r.payment_status||'unpaid')
                      const isPending=ps==='pending'
                      const isDone=ps==='paid'||ps==='free'
                      return (
                        <tr key={r.id}>
                          <td><div style={{fontWeight:600,fontSize:'.82rem'}}>{r.display_name||'—'}</div>{r.is_anonymous&&<span className="badge badge-blue" style={{fontSize:'.58rem'}}>anon</span>}</td>
                          <td style={{fontSize:'.76rem'}}>{session.title||'—'}</td>
                          <td><span className="mono" style={{fontSize:'.7rem',fontWeight:700,color:'var(--teal)',textTransform:'uppercase'}}>{r.payment_method||(isFree?'free':'—')}</span></td>
                          <td style={{fontWeight:700}}>{isFree?<span style={{color:'var(--green)'}}>Free</span>:`NPR ${Number(r.payment_amount||session.price||0).toLocaleString()}`}</td>
                          <td><PayBadge status={ps} /></td>
                          <td className="mono" style={{maxWidth:100,fontSize:'.68rem',color:'var(--text-muted)',wordBreak:'break-all'}}>{r.payment_reference||'—'}</td>
                          <td style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{r.created_at?new Date(r.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—'}</td>
                          <td>
                            <div style={{display:'flex',gap:'.3rem',flexWrap:'wrap'}}>
                              {isPending&&<>
                                <button className="btn btn-success btn-sm" disabled={busy[`res_${r.id}`]} onClick={async()=>{if(!window.confirm(`Confirm payment for ${r.display_name}?`))return;setBusy(b=>({...b,[`res_${r.id}`]:true}));try{if(r.payment_id)await apiFetch(`/admin/payments/${r.payment_id}`,{method:'PUT',body:JSON.stringify({status:'completed'})});else await apiFetch(`/admin/group-reservations/${r.id}`,{method:'PUT',body:JSON.stringify({payment_status:'paid',confirmed_at:new Date().toISOString()})});fetchCommReservations(selectedSessionId||null)}catch(e){alert(e.message)}finally{setBusy(b=>({...b,[`res_${r.id}`]:false}))}}}>✓</button>
                                <button className="btn btn-danger btn-sm" disabled={busy[`res_${r.id}`]} onClick={async()=>{setBusy(b=>({...b,[`res_${r.id}`]:true}));try{if(r.payment_id)await apiFetch(`/admin/payments/${r.payment_id}`,{method:'PUT',body:JSON.stringify({status:'failed'})});else await apiFetch(`/admin/group-reservations/${r.id}`,{method:'PUT',body:JSON.stringify({payment_status:'failed'})});fetchCommReservations(selectedSessionId||null)}catch(e){alert(e.message)}finally{setBusy(b=>({...b,[`res_${r.id}`]:false}))}}}>✗</button>
                              </>}
                              {isDone&&<span style={{fontSize:'.68rem',color:'var(--green)',fontWeight:700}}>✓</span>}
                              <button className="btn btn-danger btn-sm btn-icon" onClick={()=>del('/admin/group-reservations',r.id,`${r.display_name}'s reservation`,()=>fetchCommReservations(selectedSessionId||null))}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  />
                </div>
              )}

              {commTab === 'memberships' && (
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'.85rem'}}>
                    <span style={{fontSize:'.78rem',color:'var(--text-muted)'}}>{commMemberships.length} memberships</span>
                    <button className="btn btn-ghost btn-sm" onClick={()=>fetchCommMemberships()}>↺ All</button>
                  </div>
                  {commMemberships.some(m=>m.payment_status==='pending') && (
                    <div className="alert alert-warn" style={{marginBottom:'.85rem'}}>⚠️ <strong>{commMemberships.filter(m=>m.payment_status==='pending').length} membership(s)</strong> awaiting payment verification.</div>
                  )}
                  <Table cols={['Member','Group','Pay Status','Method','Amount','Txn Ref','Joined','Actions']}
                    rows={commMemberships.map(m=>{
                      const isFree=m.payment_status==='free'||!m.payment_amount||Number(m.payment_amount)===0
                      const isPending=m.payment_status==='pending'
                      const isPaid=m.payment_status==='paid'||m.payment_status==='free'
                      return (
                        <tr key={m.id}>
                          <td><div style={{fontWeight:600,fontSize:'.82rem'}}>{m.display_name||'—'}</div><div style={{fontSize:'.68rem',color:'var(--text-muted)'}}>{m.email||'—'}</div></td>
                          <td style={{fontSize:'.78rem'}}>{m.community_groups?.emoji} {m.community_groups?.name||'—'}</td>
                          <td><PayBadge status={m.payment_status||'unpaid'} /></td>
                          <td><span className="mono" style={{fontSize:'.7rem',fontWeight:700,color:'var(--teal)',textTransform:'uppercase'}}>{m.payment_method||(isFree?'free':'—')}</span></td>
                          <td style={{fontWeight:700}}>{isFree?<span style={{color:'var(--green)'}}>Free</span>:`NPR ${Number(m.payment_amount||0).toLocaleString()}`}</td>
                          <td className="mono" style={{maxWidth:100,fontSize:'.68rem',color:'var(--text-muted)',wordBreak:'break-all'}}>{m.payment_reference||'—'}</td>
                          <td style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{m.joined_at?new Date(m.joined_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'—'}</td>
                          <td>
                            <div style={{display:'flex',gap:'.3rem',flexWrap:'wrap'}}>
                              {isPending&&<>
                                <button className="btn btn-success btn-sm" disabled={busy[`mem_${m.id}`]} onClick={async()=>{if(!window.confirm(`Confirm membership for ${m.display_name}?`))return;setBusy(b=>({...b,[`mem_${m.id}`]:true}));try{if(m.payment_id)await apiFetch(`/admin/payments/${m.payment_id}`,{method:'PUT',body:JSON.stringify({status:'completed'})});else await apiFetch(`/admin/group-memberships/${m.id}`,{method:'PUT',body:JSON.stringify({payment_status:'paid',confirmed_at:new Date().toISOString()})});fetchCommMemberships()}catch(e){alert(e.message)}finally{setBusy(b=>({...b,[`mem_${m.id}`]:false}))}}}>✓</button>
                                <button className="btn btn-danger btn-sm" disabled={busy[`mem_${m.id}`]} onClick={async()=>{setBusy(b=>({...b,[`mem_${m.id}`]:true}));try{if(m.payment_id)await apiFetch(`/admin/payments/${m.payment_id}`,{method:'PUT',body:JSON.stringify({status:'failed'})});else await apiFetch(`/admin/group-memberships/${m.id}`,{method:'PUT',body:JSON.stringify({payment_status:'failed'})});fetchCommMemberships()}catch(e){alert(e.message)}finally{setBusy(b=>({...b,[`mem_${m.id}`]:false}))}}}>✗</button>
                              </>}
                              {isPaid&&<span style={{fontSize:'.68rem',color:'var(--green)',fontWeight:700}}>✓ Active</span>}
                              <button className="btn btn-danger btn-sm btn-icon" onClick={()=>del('/admin/group-memberships',m.id,`${m.display_name}'s membership`,fetchCommMemberships)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  />
                </div>
              )}
            </div>
          )}

{tab === 'social_work' && <SocialWorkAdminSection />}
              {tab === 'delivery_riders' && <AdminDeliveryRidersSection />}
              {tab === 'product_reviews' && <ProductReviewsSection />}

          {/* ═══ FAQs ═══ */}
          {tab === 'faqs' && (
            <div>
              <SectionHeader title="FAQs" count={faqTotal} onNew={() => openCreate('faq',{is_active:true,sort_order:0})} />
              <Table loading={busy.faqs} cols={['Question','Category','Active','Actions']}
                rows={faqs.map(fq=>(
                  <tr key={fq.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem',maxWidth:340}}>{fq.question}</td>
                    <td style={{fontSize:'.76rem'}}>{fq.category||'—'}</td>
                    <td><Badge s={fq.is_active!==false?'active':'paused'} /></td>
                    <td><RowActions onEdit={()=>openEdit('faq',fq)} onDelete={()=>del('/admin/faqs',fq.id,fq.question,()=>sec('/admin/faqs',setFaqs,setFaqTotal,faqPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={faqPage} set={setFaqPage} total={faqTotal} />
            </div>
          )}

          {/* ═══ COUPONS ═══ */}
          {tab === 'coupons' && (
            <div>
              <SectionHeader title="Coupons" count={couTotal} onNew={() => openCreate('coupon',{is_active:true,type:'percentage',value:10})} />
              <Table loading={busy.coupons} cols={['Code','Type','Value','Uses','Active','Actions']}
                rows={coupons.map(c=>(
                  <tr key={c.id}>
                    <td><code className="mono" style={{fontWeight:700,background:'var(--surface-2)',padding:'.12rem .38rem',borderRadius:4,fontSize:'.78rem',color:'var(--blue-dk)'}}>{c.code}</code></td>
                    <td><Badge s={c.type||'percentage'} /></td>
                    <td>{c.type==='percentage'?`${c.value}%`:`NPR ${c.value}`}</td>
                    <td>{c.used_count||0}/{c.max_uses||'∞'}</td>
                    <td><Badge s={c.is_active?'active':'paused'} /></td>
                    <td><RowActions onEdit={()=>openEdit('coupon',c)} onDelete={()=>del('/admin/coupons',c.id,c.code,()=>sec('/admin/coupons',setCoupons,setCouTotal,couPage))} /></td>
                  </tr>
                ))}
              />
              <Pager page={couPage} set={setCouPage} total={couTotal} />
            </div>
          )}

          {/* ═══ CONTACTS ═══ */}
          {tab === 'contacts' && (
            <div>
              <SectionHeader title="Contact Messages" count={ctcTotal}>
                <button className="btn btn-ghost" onClick={()=>sec('/admin/contacts',setContacts,setCtcTotal,ctcPage)}>↺</button>
              </SectionHeader>
              <Table loading={busy.contacts} cols={['Name','Email','Subject','Status','Date','Update']}
                rows={contacts.map(c=>(
                  <tr key={c.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem'}}>{c.name}</td>
                    <td style={{fontSize:'.74rem',color:'var(--text-muted)'}}>{c.email}</td>
                    <td style={{maxWidth:160,fontSize:'.76rem'}}>{c.subject||(c.message?.slice(0,40)+'…')}</td>
                    <td><Badge s={c.status||'new'} /></td>
                    <td style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{fmt(c.created_at)}</td>
                    <td><select className="inp" value={c.status||'new'} onChange={e=>doContactStatus(c.id,e.target.value)} style={{padding:'.18rem .42rem',fontSize:'.72rem'}}>{['new','in_progress','resolved','closed'].map(s=><option key={s} value={s}>{s}</option>)}</select></td>
                  </tr>
                ))}
              />
              <Pager page={ctcPage} set={setCtcPage} total={ctcTotal} />
            </div>
          )}

          {/* ═══ SUBSCRIPTIONS ═══ */}
          {tab === 'subscriptions' && (
            <div>
              <SectionHeader title="Subscriptions" count={subTotal}>
                <button className="btn btn-ghost" onClick={()=>sec('/admin/subscriptions',setSubs,setSubTotal,subPage)}>↺</button>
              </SectionHeader>
              <Table loading={busy.subscriptions} cols={['Client','Plan','Amount','Status','Started','Update']}
                rows={subs.map(s=>(
                  <tr key={s.id}>
                    <td style={{fontWeight:600,fontSize:'.82rem'}}>{s.client_name||s.profiles?.full_name||'—'}</td>
                    <td style={{fontSize:'.78rem'}}>{s.plan_name}</td>
                    <td>{s.amount?`NPR ${Number(s.amount).toLocaleString()}`:'—'}</td>
                    <td><Badge s={s.status||'active'} /></td>
                    <td style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{fmt(s.started_at)}</td>
                    <td><select className="inp" value={s.status||'active'} onChange={e=>doSubStatus(s.id,e.target.value)} style={{padding:'.18rem .42rem',fontSize:'.72rem'}}>{['active','cancelled','expired','paused'].map(x=><option key={x} value={x}>{x}</option>)}</select></td>
                  </tr>
                ))}
              />
              <Pager page={subPage} set={setSubPage} total={subTotal} />
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {tab === 'settings' && (
            <div>
              <SectionHeader title="Site Settings">
                <button className="btn btn-ghost" onClick={fetchSettings}>↺</button>
              </SectionHeader>
              <div className="tbl-wrap">
                {busy.settings ? <div className="tbl-loading"><span className="spinner" /> Loading…</div>
                  : settings.length === 0 ? <div className="empty-state"><div className="empty-text">No settings found.</div></div>
                  : settings.map((s,i)=>(
                    <div key={s.key||i} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'.65rem 1rem',borderBottom:i<settings.length-1?'1px solid var(--border-2)':'none',flexWrap:'wrap'}}>
                      <code className="mono" style={{fontSize:'.74rem',color:'var(--blue-dk)',background:'var(--surface-2)',padding:'.12rem .4rem',borderRadius:4,minWidth:200}}>{s.key}</code>
                      <span style={{fontSize:'.79rem',color:'var(--text-secondary)',flex:1,wordBreak:'break-all'}}>{typeof s.value==='object'?JSON.stringify(s.value):String(s.value??'')}</span>
                      <button className="btn btn-ghost btn-sm" onClick={()=>openEdit('setting',{key:s.key,value:String(s.value??'')})}>✏️ Edit</button>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

        </div>{/* /adm-content */}
      </div>{/* /adm-body */}

      {/* SESSION MODAL */}
      {sessionModal && (
        <div className="overlay" onClick={()=>setSessionModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{sessionModal.data ? '✏️ Edit Session' : '+ New Group Session'}</span>
              <button className="btn btn-ghost btn-sm" onClick={()=>setSessionModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="field-row">
                <div className="field"><label>Title *</label><input className="inp" value={sessionForm.title||''} onChange={e=>setSessionForm(f=>({...f,title:e.target.value}))} placeholder="e.g. Anxiety Support Circle" /></div>
                <div className="field"><label>Group *</label><select className="inp" value={sessionForm.group_id||''} onChange={e=>setSessionForm(f=>({...f,group_id:e.target.value}))}><option value="">— Select group —</option>{commGroups.map(g=><option key={g.id} value={g.id}>{g.emoji} {g.name}</option>)}</select></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Facilitator *</label><input className="inp" value={sessionForm.facilitator||''} onChange={e=>setSessionForm(f=>({...f,facilitator:e.target.value}))} /></div>
                <div className="field"><label>Mode</label><select className="inp" value={sessionForm.mode||'Online (Zoom)'} onChange={e=>setSessionForm(f=>({...f,mode:e.target.value}))}><option>Online (Zoom)</option><option>In-Person, Kathmandu</option><option>Hybrid</option></select></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Scheduled At *</label><input className="inp" type="datetime-local" value={sessionForm.scheduled_at?sessionForm.scheduled_at.slice(0,16):''} onChange={e=>setSessionForm(f=>({...f,scheduled_at:e.target.value}))} /></div>
                <div className="field"><label>Duration (min)</label><input className="inp" type="number" value={sessionForm.duration_minutes||60} onChange={e=>setSessionForm(f=>({...f,duration_minutes:Number(e.target.value)}))} /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>Max Spots</label><input className="inp" type="number" value={sessionForm.max_spots||20} onChange={e=>setSessionForm(f=>({...f,max_spots:Number(e.target.value)}))} /></div>
                <div className="field"><label>Price (NPR) — 0=Free</label><input className="inp" type="number" value={sessionForm.price??0} onChange={e=>setSessionForm(f=>({...f,price:Number(e.target.value)}))} /></div>
              </div>
              <div className="field"><label>Description</label><textarea className="inp" rows={3} value={sessionForm.description||''} onChange={e=>setSessionForm(f=>({...f,description:e.target.value}))} /></div>
              {sessionErr && <div className="alert alert-error">{sessionErr}</div>}
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={()=>setSessionModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveSessionModal} disabled={sessionSaving}>{sessionSaving?<><span className="spinner" /> Saving…</>:sessionModal.data?'Save Changes':'Create Session'}</button>
            </div>
          </div>
        </div>
      )}

      {/* GENERIC CRUD MODAL */}
      {modal && (
        <div className="overlay" onClick={closeModal}>
          <div className="modal modal-lg" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-head-title">{modal.data ? '✏️ Edit' : '+ New'} {MODAL_TITLES[modal.type] || modal.type}</span>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">{renderFields()}</div>
            {saveErr && <div style={{margin:'0 1.4rem .5rem'}}><div className="alert alert-error">{saveErr}</div></div>}
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={saveModal} disabled={saving}>{saving?<><span className="spinner" /> Saving…</>:modal.data?'Save Changes':'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DIALOG */}
      {delConfirm && (
        <Confirm msg={`Delete "${delConfirm.label}"? This cannot be undone.`} onConfirm={doDelete} onCancel={()=>setDelConfirm(null)} />
      )}

    </div>
  )
}
