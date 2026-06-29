// MyOrdersPage.jsx — v3.0 (gradient redesign)
// ✅ Auth guard: uses real useAuth + useRouter from your contexts
//    → loading=true  → render nothing (no flash)
//    → user=null     → navigate('/signin') instantly
//    → user exists   → render full page
// ✅ Hero: deep teal→sky gradient with radial glow + diagonal cut
// ✅ Cards: system-token surfaces, light/dark adaptive
// ✅ QR modal shows /payment-qr.png
// ✅ COD confirmation popup
// ✅ Past orders collapsed by default

import { useState, useEffect } from 'react'
import { useAuth }   from '../context/AuthContext'
import { useRouter } from '../context/RouterContext'

const API_BASE = import.meta.env?.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

/* ─────────────────────────────────────────────
   Design tokens — all colours live here
───────────────────────────────────────────── */
const T = {
  // Brand gradient
  gradStart:  '#0a5c7a',
  gradMid:    '#007BA8',
  gradEnd:    '#00BFFF',

  // Surfaces (light-mode first; dark overrides via CSS vars below)
  bg:         '#f4f8fb',
  surface:    '#ffffff',
  surfaceAlt: '#f0f8ff',
  border:     '#daeef8',
  borderMid:  '#b0d4e8',

  // Text
  primary:    '#1a3a4a',
  secondary:  '#4a6a7a',
  muted:      '#7a9aaa',

  // Accent
  sky:        '#007BA8',
  skyLight:   '#e0f7ff',
  skyDark:    '#005580',

  // Status
  green:      '#1a7a4a',
  greenLight: '#e8f8f0',
  red:        '#c0392b',
  redLight:   '#fff0f0',
  amber:      '#92600a',
  amberLight: '#fff8e6',
  purple:     '#5a1a8a',
  purpleLight:'#f0e8ff',
}

const STATUS_COLORS = {
  pending:    { bg: '#fff9e6', color: '#8a5a1a' },
  confirmed:  { bg: T.greenLight, color: T.green },
  processing: { bg: T.skyLight,   color: T.sky   },
  shipped:    { bg: T.purpleLight, color: T.purple },
  delivered:  { bg: '#e8f8f0',   color: '#1a5a3a' },
  cancelled:  { bg: T.redLight,   color: T.red   },
  refunded:   { bg: '#f0f4f8',   color: T.secondary },
}

const PAYMENT_COLORS = {
  pending:   { bg: '#fff9e6', color: '#8a5a1a', icon: '⏳' },
  paid:      { bg: T.greenLight, color: T.green, icon: '✅' },
  failed:    { bg: T.redLight, color: T.red, icon: '❌' },
  refunded:  { bg: '#f0f4f8', color: T.secondary, icon: '↩️' },
  partial:   { bg: T.amberLight, color: T.amber, icon: '⚡' },
  cancelled: { bg: T.redLight, color: T.red, icon: '✕' },
}

const ORDER_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

/* ─────────────────────────────────────────────
   Global CSS (injected once)
───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,600&family=DM+Sans:wght@300;400;500;600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --navbar-height: 64px;
  --mo-bg:        ${T.bg};
  --mo-surface:   ${T.surface};
  --mo-surface-alt:${T.surfaceAlt};
  --mo-border:    ${T.border};
  --mo-border-mid:${T.borderMid};
  --mo-primary:   ${T.primary};
  --mo-secondary: ${T.secondary};
  --mo-muted:     ${T.muted};
  --mo-sky:       ${T.sky};
  --mo-sky-lt:    ${T.skyLight};
}

/* Optional dark-mode surface overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --mo-bg:         #0d1f2d;
    --mo-surface:    #112233;
    --mo-surface-alt:#0a1a28;
    --mo-border:     #1e3a50;
    --mo-border-mid: #2a5070;
    --mo-primary:    #e0f0f8;
    --mo-secondary:  #8ab8d0;
    --mo-muted:      #4a7a9a;
  }
}

body { font-family: 'DM Sans', system-ui, sans-serif; background: var(--mo-bg); min-height: 100vh; }

/* ── Wrap ── */
.mo-wrap { min-height: 100vh; background: var(--mo-bg); }

/* ── Hero ── */
.mo-hero {
  background: linear-gradient(135deg, ${T.gradStart} 0%, ${T.gradMid} 45%, ${T.gradEnd} 100%);
  padding: clamp(1.5rem, 5vw, 2.25rem) clamp(1.25rem, 5vw, 2rem) 3.5rem;
  padding-top: calc(clamp(1.5rem, 5vw, 2.25rem) + var(--navbar-height, 64px));
  position: relative;
  overflow: hidden;
}
/* Radial glow accent */
.mo-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 85% 0%, rgba(0, 191, 255, .38) 0%, transparent 60%),
              radial-gradient(ellipse at 10% 100%, rgba(0, 85, 128, .4) 0%, transparent 55%);
  pointer-events: none;
}
/* Diagonal cut into page */
.mo-hero::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom right, transparent 49.5%, var(--mo-bg) 50%);
}
.mo-hero-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  position: relative;
  z-index: 1;
}
.mo-hero-left  { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.mo-hero-icon  {
  width: 54px; height: 54px;
  border-radius: 16px;
  background: rgba(255, 255, 255, .15);
  border: 1.5px solid rgba(255, 255, 255, .28);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}
.mo-hero-title {
  font-family: 'Fraunces', Georgia, serif;
  font-size: clamp(1.4rem, 5vw, 2rem);
  color: #fff;
  font-weight: 500;
  line-height: 1.1;
  letter-spacing: -.02em;
}
.mo-hero-sub   { font-size: .82rem; color: rgba(255,255,255,.72); margin-top: .3rem; }
.mo-hero-sub strong { color: #fff; }
.mo-back-btn {
  padding: .5rem 1.1rem;
  border-radius: 10px;
  border: 1.5px solid rgba(255,255,255,.3);
  background: rgba(255,255,255,.12);
  color: #fff;
  font-size: .8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  backdrop-filter: blur(6px);
  white-space: nowrap;
  flex-shrink: 0;
  transition: background .15s;
}
.mo-back-btn:hover { background: rgba(255,255,255,.22); }

/* ── Stats bar ── */
.mo-stats {
  background: var(--mo-surface);
  border-bottom: 1px solid var(--mo-border);
  padding: .9rem clamp(1.25rem, 5vw, 2rem);
}
.mo-stats-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  gap: 2rem;
  overflow-x: auto;
  scrollbar-width: none;
  align-items: center;
}
.mo-stats-inner::-webkit-scrollbar { display: none; }
.mo-stat     { display: flex; flex-direction: column; align-items: center; gap: .15rem; min-width: 72px; }
.mo-stat-num { font-family: 'Fraunces', Georgia, serif; font-size: 1.35rem; font-weight: 500; color: var(--mo-sky); line-height: 1; }
.mo-stat-lbl { font-size: .65rem; font-weight: 700; text-transform: uppercase; letter-spacing: .09em; color: var(--mo-muted); white-space: nowrap; }
.mo-stat-div { width: 1px; background: var(--mo-border); align-self: stretch; flex-shrink: 0; }

/* ── Tabs ── */
.mo-tabs { background: var(--mo-surface); border-bottom: 1px solid var(--mo-border); overflow-x: auto; scrollbar-width: none; }
.mo-tabs::-webkit-scrollbar { display: none; }
.mo-tabs-inner { max-width: 960px; margin: 0 auto; display: flex; padding: 0 clamp(1.25rem, 5vw, 2rem); }
.mo-tab {
  padding: .9rem 1.25rem;
  border: none;
  background: none;
  font-family: inherit;
  font-size: .83rem;
  cursor: pointer;
  border-bottom: 2.5px solid transparent;
  color: var(--mo-secondary);
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all .2s;
}
.mo-tab.active { color: var(--mo-sky); font-weight: 700; border-bottom-color: var(--mo-sky); }

/* ── Main content ── */
.mo-main { max-width: 960px; margin: 0 auto; padding: 1.5rem clamp(1.25rem, 5vw, 2rem); }

/* ── Section header ── */
.mo-section-hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: .5rem; }
.mo-section-title { font-family: 'Fraunces', Georgia, serif; color: var(--mo-primary); font-size: clamp(.95rem, 3vw, 1.1rem); font-weight: 500; }

/* ── Order card ── */
.mo-card {
  background: var(--mo-surface);
  border: 1px solid var(--mo-border);
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: .85rem;
  transition: border-color .2s, box-shadow .2s;
}
.mo-card.open {
  border-color: var(--mo-border-mid);
  box-shadow: 0 4px 20px rgba(0, 123, 168, .07);
}
.mo-card-hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.15rem;
  cursor: pointer;
  flex-wrap: wrap;
  gap: .5rem;
  transition: background .15s;
}
.mo-card-hd:hover { background: var(--mo-surface-alt); }
.mo-card-hd.open  { background: #f0fbff; }
.mo-card-icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  background: var(--mo-bg);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  transition: all .2s;
}
.mo-card-icon.open {
  background: linear-gradient(135deg, ${T.gradMid}, ${T.gradEnd});
}

/* ── Status badge ── */
.mo-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: .2rem .65rem;
  border-radius: 100px;
  font-size: .68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .07em;
}
.mo-badge-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; opacity: .75; display: inline-block; flex-shrink: 0; }

/* ── Timeline ── */
.mo-timeline {
  display: flex;
  align-items: center;
  padding: .85rem 1.15rem .65rem;
  border-top: 1px solid var(--mo-border);
  background: var(--mo-bg);
  overflow-x: auto;
  scrollbar-width: none;
}
.mo-timeline::-webkit-scrollbar { display: none; }
.mo-t-step { display: flex; flex-direction: column; align-items: center; flex: 1; min-width: 52px; }
.mo-t-dot {
  width: 22px; height: 22px;
  border-radius: 50%;
  border: 2px solid var(--mo-border);
  background: var(--mo-surface);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
  z-index: 1; flex-shrink: 0;
  color: var(--mo-muted);
  transition: all .25s;
}
.mo-t-dot.done      { background: var(--mo-sky); border-color: var(--mo-sky); color: #fff; }
.mo-t-dot.active    { border-color: var(--mo-sky); color: var(--mo-sky); box-shadow: 0 0 0 3px rgba(0,123,168,.15); }
.mo-t-dot.cancelled { background: ${T.redLight}; border-color: ${T.red}; color: ${T.red}; }
.mo-t-lbl { font-size: 10px; color: var(--mo-muted); margin-top: 5px; text-align: center; white-space: nowrap; transition: all .2s; }
.mo-t-lbl.done      { color: var(--mo-sky); font-weight: 700; }
.mo-t-lbl.active    { color: var(--mo-primary); font-weight: 700; }
.mo-t-lbl.cancelled { color: ${T.red}; font-weight: 700; }
.mo-t-line { flex: 1; height: 2px; background: var(--mo-border); margin-bottom: 18px; min-width: 12px; transition: background .3s; }
.mo-t-line.done { background: var(--mo-sky); }

/* ── Card body ── */
.mo-card-body { border-top: 1px solid var(--mo-border); padding: 1.15rem; }
.mo-items-hd { font-size: .68rem; font-weight: 800; color: var(--mo-muted); text-transform: uppercase; letter-spacing: .09em; margin-bottom: .65rem; }
.mo-item-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: .5rem 0;
  border-bottom: 1px solid var(--mo-border);
}
.mo-item-row:last-child { border-bottom: none; }
.mo-item-name { font-size: .85rem; font-weight: 600; color: var(--mo-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mo-item-qty  { font-size: .72rem; color: var(--mo-muted); margin-top: 1px; }
.mo-item-price { font-weight: 700; color: var(--mo-sky); font-size: .85rem; flex-shrink: 0; margin-left: .75rem; }
.mo-totals { background: var(--mo-bg); border-radius: 10px; padding: .8rem 1rem; margin-top: 1rem; display: flex; flex-direction: column; gap: .3rem; }
.mo-total-row { display: flex; justify-content: space-between; font-size: .8rem; color: var(--mo-secondary); }
.mo-total-final { display: flex; justify-content: space-between; font-size: .9rem; font-weight: 800; color: var(--mo-primary); border-top: 1px solid var(--mo-border); padding-top: .45rem; margin-top: .2rem; }

/* ── Action buttons in card ── */
.mo-action-btns { display: flex; gap: .5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.mo-btn-pay {
  padding: .42rem .9rem;
  border-radius: 8px;
  border: 1.5px solid var(--mo-sky);
  background: none;
  color: var(--mo-sky);
  font-size: .75rem; font-weight: 600;
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; gap: 5px;
  transition: background .15s;
}
.mo-btn-pay:hover { background: var(--mo-sky-lt); }
.mo-btn-cod {
  padding: .42rem .9rem;
  border-radius: 8px;
  border: 1.5px solid #f5d87a;
  background: ${T.amberLight};
  color: ${T.amber};
  font-size: .75rem; font-weight: 600;
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; gap: 5px;
  transition: background .15s;
}
.mo-btn-cod:hover { background: #fef3c7; }

/* ── Refresh / ghost button ── */
.mo-btn-ghost {
  padding: .42rem .9rem;
  border-radius: 8px;
  border: 1px solid var(--mo-border);
  background: var(--mo-surface);
  color: var(--mo-secondary);
  font-size: .78rem; font-weight: 500;
  cursor: pointer; font-family: inherit;
  display: flex; align-items: center; gap: 5px;
  transition: all .15s;
}
.mo-btn-ghost:hover { border-color: var(--mo-sky); color: var(--mo-sky); }
.mo-btn-ghost:disabled { opacity: .5; cursor: default; }

/* ── Past orders toggle ── */
.mo-past-toggle {
  display: flex; align-items: center; gap: .5rem;
  background: none; border: none; cursor: pointer;
  font-size: .78rem; font-weight: 700; color: var(--mo-secondary);
  padding: .5rem 0; margin: 1rem 0 .75rem;
  font-family: inherit;
}
.mo-past-arrow {
  display: inline-flex;
  width: 20px; height: 20px;
  border-radius: 6px;
  background: var(--mo-surface);
  border: 1px solid var(--mo-border);
  align-items: center; justify-content: center;
  font-size: .65rem;
  color: var(--mo-secondary);
  transition: transform .2s;
}
.mo-past-arrow.open { transform: rotate(90deg); }

/* ── Payment status tab ── */
.mo-ps-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: .85rem; }
.mo-ps-card {
  background: var(--mo-surface);
  border: 1px solid var(--mo-border);
  border-radius: 12px;
  padding: 1rem;
  display: flex; flex-direction: column; gap: .5rem;
}
.mo-ps-timeline { display: flex; align-items: center; gap: .4rem; margin-top: .35rem; }
.mo-ps-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--mo-border); flex-shrink: 0; }
.mo-ps-dot.done { background: var(--mo-sky); }
.mo-ps-line { flex: 1; height: 2px; background: var(--mo-border); }
.mo-ps-line.done { background: var(--mo-sky); }
.mo-ps-admin-note { font-size: .72rem; color: var(--mo-secondary); font-style: italic; border-left: 2px solid var(--mo-border); padding-left: .5rem; margin-top: .25rem; }

/* ── QR modal ── */
.mo-qr-overlay {
  position: fixed; inset: 0;
  background: rgba(10, 25, 40, .6);
  backdrop-filter: blur(6px);
  z-index: 9999;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: moFadeIn .2s ease;
}
.mo-qr-modal {
  background: var(--mo-surface);
  border-radius: 20px;
  width: 100%; max-width: 380px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 24px 80px rgba(0,0,0,.18);
  animation: moSlideUp .24s cubic-bezier(.22, 1, .36, 1);
}
.mo-qr-header {
  padding: 1.1rem 1.25rem 1rem;
  border-bottom: 1px solid var(--mo-border);
  display: flex; align-items: center; justify-content: space-between;
}
.mo-qr-header-icon {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, ${T.gradMid}, ${T.gradEnd});
  display: flex; align-items: center; justify-content: center;
  font-size: .9rem;
}
.mo-qr-close {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1px solid var(--mo-border);
  background: transparent;
  cursor: pointer;
  font-size: .85rem;
  color: var(--mo-secondary);
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.mo-qr-close:hover { background: var(--mo-bg); }
.mo-qr-body { padding: 1.1rem 1.25rem; }
.mo-qr-img-wrap { display: flex; justify-content: center; margin-bottom: 1rem; }
.mo-qr-img { width: 200px; height: 200px; object-fit: contain; border-radius: 12px; border: 2px solid var(--mo-border); background: #fff; padding: 6px; display: block; }
.mo-qr-summary { background: var(--mo-bg); border-radius: 8px; border: 1px solid var(--mo-border); padding: .75rem 1rem; margin-bottom: 1rem; font-size: .8rem; color: var(--mo-secondary); }
.mo-qr-row { display: flex; justify-content: space-between; padding: .15rem 0; }
.mo-qr-key { font-weight: 600; }
.mo-qr-val { color: var(--mo-primary); font-weight: 700; }

/* ── COD modal ── */
.mo-cod-overlay {
  position: fixed; inset: 0;
  background: rgba(10, 25, 40, .6);
  backdrop-filter: blur(6px);
  z-index: 10000;
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: moFadeIn .2s ease;
}
.mo-cod-modal {
  background: var(--mo-surface);
  border-radius: 20px;
  width: 100%; max-width: 400px;
  box-shadow: 0 24px 80px rgba(0,0,0,.18);
  animation: moSlideUp .24s cubic-bezier(.22, 1, .36, 1);
  overflow: hidden;
}
.mo-cod-top {
  background: linear-gradient(135deg, ${T.gradMid}, ${T.gradEnd});
  padding: 1.75rem;
  text-align: center;
}
.mo-cod-body { padding: 1.5rem; }
.mo-cod-actions { display: flex; gap: .65rem; padding: 1rem 1.5rem 1.5rem; }
.mo-btn-confirm {
  padding: .7rem 1.5rem;
  border-radius: 10px; border: none;
  background: linear-gradient(135deg, ${T.gradMid}, ${T.gradEnd});
  color: #fff; font-weight: 700; font-size: .88rem;
  cursor: pointer; font-family: inherit; flex: 1;
  transition: opacity .15s;
}
.mo-btn-confirm:disabled { opacity: .6; cursor: default; }
.mo-btn-cancel-modal {
  padding: .7rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--mo-border);
  background: none;
  color: var(--mo-secondary);
  font-size: .88rem; cursor: pointer; font-family: inherit; flex: 1;
}

/* ── Auth loading ── */
.mo-auth-loading { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--mo-bg); }
.mo-auth-spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--mo-border);
  border-top-color: var(--mo-sky);
  border-radius: 50%;
  animation: moSpin .7s linear infinite;
}

/* ── Empty state ── */
.mo-empty { text-align: center; padding: 3.5rem 1rem; }
.mo-empty-icon { font-size: 3rem; opacity: .2; margin-bottom: 1rem; }
.mo-btn-primary {
  padding: .65rem 1.5rem;
  border-radius: 10px; border: none;
  background: linear-gradient(135deg, ${T.gradMid}, ${T.gradEnd});
  color: #fff; font-weight: 700; font-size: .88rem;
  cursor: pointer; font-family: inherit;
}

/* ── Alert boxes ── */
.mo-alert-cancelled { background: ${T.redLight}; border: 1px solid #f5c4c4; border-radius: 8px; padding: .65rem .9rem; margin-bottom: 1rem; font-size: .82rem; color: ${T.red}; display: flex; align-items: center; gap: .5rem; }
.mo-alert-warning   { background: ${T.amberLight}; border: 1px solid #f5d87a; border-radius: 8px; padding: .85rem 1rem; margin-bottom: 1rem; font-size: .82rem; color: ${T.amber}; line-height: 1.6; }

/* ── Payment legend ── */
.mo-ps-legend { margin-top: 1.5rem; background: var(--mo-bg); border-radius: 10px; border: 1px solid var(--mo-border); padding: 1rem; display: flex; flex-wrap: wrap; gap: .75rem; }
.mo-ps-legend-hd { font-size: .68rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: var(--mo-muted); width: 100%; }

/* ── Coupon pill ── */
.mo-coupon { display: inline-flex; align-items: center; gap: .4rem; margin-top: .65rem; background: ${T.greenLight}; color: ${T.green}; border-radius: 100px; padding: .2rem .65rem; font-size: .75rem; font-weight: 700; }

/* ── Chevron ── */
.mo-chevron { font-size: .75rem; color: var(--mo-muted); display: inline-block; transition: transform .2s; }
.mo-chevron.open { transform: rotate(180deg); }

/* ── Animations ── */
@keyframes moFadeIn  { from { opacity: 0 } to { opacity: 1 } }
@keyframes moSlideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
@keyframes moSpin    { to { transform: rotate(360deg) } }

@media (max-width: 600px) {
  .mo-ps-grid { grid-template-columns: 1fr; }
  .mo-hero-icon { display: none; }
  .mo-qr-img { width: 170px; height: 170px; }
  .mo-stat-num { font-size: 1.1rem; }
}
`

function injectCSS(id, css) {
  if (document.getElementById(id)) return
  const s = document.createElement('style')
  s.id = id
  s.textContent = css
  document.head.appendChild(s)
}

/* ─────────────────────────────────────────────
   Status Timeline
───────────────────────────────────────────── */
function StatusTimeline({ status }) {
  const norm        = (status || 'pending').toLowerCase()
  const isCancelled = norm === 'cancelled' || norm === 'refunded'
  const activeIdx   = ORDER_STEPS.indexOf(norm)

  return (
    <div className="mo-timeline">
      {ORDER_STEPS.map((step, i) => {
        const done     = !isCancelled && i < activeIdx
        const active   = !isCancelled && i === activeIdx
        const cancelAt = isCancelled && i === 1
        const dimmed   = isCancelled && i > 1
        return (
          <div
            key={step}
            style={{ display: 'flex', alignItems: 'center', flex: i < ORDER_STEPS.length - 1 ? 1 : 'none' }}
          >
            <div className="mo-t-step" style={{ opacity: dimmed ? 0.25 : 1 }}>
              <div className={`mo-t-dot${done ? ' done' : active ? ' active' : cancelAt ? ' cancelled' : ''}`}>
                {done && '✓'}{cancelAt && '✕'}
              </div>
              <div className={`mo-t-lbl${done ? ' done' : active ? ' active' : cancelAt ? ' cancelled' : ''}`}>
                {step === 'pending' ? 'Placed' : step.charAt(0).toUpperCase() + step.slice(1)}
              </div>
            </div>
            {i < ORDER_STEPS.length - 1 && (
              <div
                className={`mo-t-line${done ? ' done' : ''}`}
                style={{ opacity: isCancelled && i >= 1 ? 0.2 : 1 }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────
   QR Modal
───────────────────────────────────────────── */
function QRModal({ order, onClose }) {
  const orderRef = order?.order_number || ('#' + (order?.id || '').slice(0, 8).toUpperCase())
  const amount   = Number(order?.total_amount || 0)

  return (
    <div className="mo-qr-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mo-qr-modal" onClick={e => e.stopPropagation()}>
        <div className="mo-qr-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
            <div className="mo-qr-header-icon">📲</div>
            <div>
              <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: '.9rem', color: T.primary, fontWeight: 500 }}>
                Scan to pay
              </div>
              <div style={{ fontSize: '.62rem', color: T.muted }}>eSewa · Khalti · FonePay</div>
            </div>
          </div>
          <button className="mo-qr-close" onClick={onClose}>✕</button>
        </div>

        <div className="mo-qr-body">
          <div className="mo-qr-img-wrap">
            <img src="/payment-qr.png" alt="Payment QR Code" className="mo-qr-img" />
          </div>

          <div className="mo-qr-summary">
            <div style={{ fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: T.muted, marginBottom: '.4rem' }}>
              Order details
            </div>
            {[
              ['Merchant', 'Common Psychology'],
              ['Order',    orderRef],
              ['Amount',   `NPR ${amount.toLocaleString()}`],
            ].map(([k, v]) => (
              <div className="mo-qr-row" key={k}>
                <span className="mo-qr-key">{k}</span>
                <span className="mo-qr-val">{v}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '.72rem', color: T.muted, textAlign: 'center', lineHeight: 1.6 }}>
            Open <strong>eSewa</strong>, <strong>Khalti</strong>, or your bank app.<br />
            Tap <strong>Scan QR</strong> → scan → enter <strong>NPR {amount.toLocaleString()}</strong>.<br />
            Share your payment screenshot with us after paying.
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   COD Confirmation Modal
───────────────────────────────────────────── */
function CODConfirmModal({ order, onConfirm, onClose }) {
  const [confirming, setConfirming] = useState(false)

  async function handleConfirm() {
    setConfirming(true)
    await new Promise(r => setTimeout(r, 900))
    onConfirm()
  }

  const items  = order?.order_items || order?.items || []
  const amount = Number(order?.total_amount || 0)
  const ref    = order?.order_number || ('#' + (order?.id || '').slice(0, 8).toUpperCase())

  return (
    <div className="mo-cod-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mo-cod-modal" onClick={e => e.stopPropagation()}>
        <div className="mo-cod-top">
          <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>💵</div>
          <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: '1.25rem', color: '#fff', fontWeight: 500 }}>
            Confirm cash on delivery
          </div>
          <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.8)', marginTop: '.25rem' }}>{ref}</div>
        </div>

        <div className="mo-cod-body">
          <div className="mo-alert-warning">
            ⚠️ By confirming, you agree to pay <strong>NPR {amount.toLocaleString()}</strong> in cash upon
            delivery. Your order will be held for <strong>24 hours</strong> pending team confirmation.
          </div>

          <div style={{ background: T.bg, borderRadius: 8, padding: '.75rem 1rem', fontSize: '.8rem', color: T.secondary, lineHeight: 1.7 }}>
            {[
              ['Order total',    `NPR ${amount.toLocaleString()}`],
              ['Payment method', 'Cash / COD'],
              ['Items',          `${items.length} item(s)`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{k}</span>
                <span style={{ color: T.primary, fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mo-cod-actions">
          <button className="mo-btn-cancel-modal" onClick={onClose} disabled={confirming}>Cancel</button>
          <button className="mo-btn-confirm" onClick={handleConfirm} disabled={confirming}>
            {confirming ? 'Confirming…' : '✓ Confirm COD order'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Payment Status Tab
───────────────────────────────────────────── */
const PS_STEPS = ['initiated', 'processing', 'verified', 'completed']

function PaymentStatusTab({ orders }) {
  if (!orders.length) {
    return (
      <div className="mo-empty">
        <div className="mo-empty-icon">💳</div>
        <p style={{ color: T.secondary, fontSize: '.9rem' }}>No payment records yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mo-ps-grid">
        {orders.map(order => {
          const ps          = (order.payment_status || 'pending').toLowerCase()
          const os          = (order.status || 'pending').toLowerCase()
          const sc          = PAYMENT_COLORS[ps] || PAYMENT_COLORS.pending
          const currentStep = ps === 'paid' ? 3 : ps === 'pending' ? 0 : ps === 'failed' ? -1 : 1

          return (
            <div className="mo-ps-card" key={order.id}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.5rem' }}>
                <div style={{ fontSize: '.82rem', fontWeight: 700, color: T.primary }}>
                  {order.order_number || `#${(order.id || '').slice(0, 8).toUpperCase()}`}
                </div>
                <span className="mo-badge" style={{ background: sc.bg, color: sc.color }}>
                  <span className="mo-badge-dot" />
                  {sc.icon} {ps}
                </span>
              </div>

              <div style={{ fontSize: '.72rem', color: T.muted }}>
                NPR {Number(order.total_amount || 0).toLocaleString()} ·{' '}
                {new Date(order.created_at || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              <div className="mo-ps-timeline">
                {PS_STEPS.map((step, i) => {
                  const dotDone = currentStep === -1 ? i === 0 : i <= currentStep
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < PS_STEPS.length - 1 ? 1 : 'none' }}>
                      <div
                        className={`mo-ps-dot${dotDone ? ' done' : ''}`}
                        style={{ background: currentStep === -1 ? (i === 0 ? T.red : undefined) : undefined }}
                        title={step}
                      />
                      {i < PS_STEPS.length - 1 && (
                        <div className={`mo-ps-line${i < currentStep ? ' done' : ''}`} />
                      )}
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.62rem', color: T.muted }}>
                {PS_STEPS.map(s => <span key={s} style={{ textAlign: 'center', flex: 1 }}>{s}</span>)}
              </div>

              {order.payment_admin_note && (
                <div className="mo-ps-admin-note">💬 {order.payment_admin_note}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.25rem' }}>
                <span style={{ fontSize: '.68rem', color: T.muted }}>
                  Order: <strong style={{ color: T.secondary }}>{os}</strong>
                </span>
                {order.payment_method && (
                  <span style={{ fontSize: '.68rem', color: T.muted, background: T.bg, borderRadius: 4, padding: '.1rem .4rem' }}>
                    {order.payment_method}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mo-ps-legend">
        <div className="mo-ps-legend-hd">Payment status guide</div>
        {Object.entries(PAYMENT_COLORS).map(([key, val]) => (
          <span key={key} className="mo-badge" style={{ background: val.bg, color: val.color, fontSize: '.6rem', padding: '.15rem .5rem' }}>
            {val.icon} {key}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Order Card
───────────────────────────────────────────── */
function OrderCard({ order, onShowQR, onCODConfirm }) {
  const [isOpen, setIsOpen] = useState(false)

  const items       = order.order_items || order.items || []
  const status      = (order.status || 'pending').toLowerCase()
  const isCancelled = status === 'cancelled' || status === 'refunded'
  const statusColor = STATUS_COLORS[status] || { bg: '#f0f4f8', color: T.secondary }
  const canCOD      = status === 'pending' || status === 'confirmed'

  const fmt = d =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className={`mo-card${isOpen ? ' open' : ''}`}>
      {/* Header */}
      <div
        className={`mo-card-hd${isOpen ? ' open' : ''}`}
        onClick={() => setIsOpen(v => !v)}
        role="button"
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
          <div className={`mo-card-icon${isOpen ? ' open' : ''}`}>
            <span style={{ filter: isOpen ? 'brightness(10)' : 'none' }}>📦</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: T.primary, fontSize: '.88rem' }}>
              {order.order_number || `#${(order.id || '').slice(0, 8).toUpperCase()}`}
            </div>
            <div style={{ fontSize: '.72rem', color: T.muted, marginTop: 1 }}>
              {fmt(order.created_at)}
              {items.length > 0 && ` · ${items.length} item${items.length !== 1 ? 's' : ''}`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', flexShrink: 0 }}>
          <span className="mo-badge" style={{ background: statusColor.bg, color: statusColor.color }}>
            <span className="mo-badge-dot" />
            {status}
          </span>
          <div style={{ fontWeight: 800, color: isCancelled ? T.muted : T.primary, fontSize: '.92rem', textDecoration: isCancelled ? 'line-through' : 'none' }}>
            NPR {Number(order.total_amount || 0).toLocaleString()}
          </div>
          <span className={`mo-chevron${isOpen ? ' open' : ''}`}>▾</span>
        </div>
      </div>

      {/* Timeline always visible */}
      <StatusTimeline status={status} />

      {/* Expanded body */}
      {isOpen && (
        <div className="mo-card-body">
          {isCancelled && (
            <div className="mo-alert-cancelled">
              <span>✕</span>
              <span>
                This order was <strong>{status}</strong>
                {status === 'refunded' ? ' — a refund has been processed.' : ' before processing.'}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="mo-action-btns">
            <button className="mo-btn-pay" onClick={() => onShowQR(order)}>
              📲 Scan to pay
            </button>
            {canCOD && (
              <button className="mo-btn-cod" onClick={() => onCODConfirm(order)}>
                💵 Confirm COD
              </button>
            )}
          </div>

          {/* Items */}
          {items.length > 0 ? (
            <div style={{ marginBottom: '1rem' }}>
              <div className="mo-items-hd">Items</div>
              {items.map((item, idx) => {
                const unitPrice = Number(item.unit_price || item.price || 0)
                const qty       = Number(item.quantity || 1)
                const lineTotal = Number(item.total_price || item.line_total || unitPrice * qty || 0)
                return (
                  <div key={item.id || idx} className="mo-item-row">
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="mo-item-name"
                        style={{
                          textDecoration: isCancelled ? 'line-through' : 'none',
                          opacity:        isCancelled ? .55 : 1,
                        }}
                      >
                        {item.products?.name || item.product_name || item.name || `Product #${String(item.product_id || '').slice(0, 6) || '—'}`}
                      </div>
                      <div className="mo-item-qty">NPR {unitPrice.toLocaleString()} × {qty}</div>
                    </div>
                    <div
                      className="mo-item-price"
                      style={{
                        color:          isCancelled ? T.muted : undefined,
                        textDecoration: isCancelled ? 'line-through' : 'none',
                      }}
                    >
                      NPR {lineTotal.toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ fontSize: '.8rem', color: T.muted, marginBottom: '1rem' }}>
              No item details available.
            </p>
          )}

          {/* Totals */}
          {(() => {
            const subtotal = Number(order.subtotal || order.sub_total || 0)
            const discount = Number(order.discount_amount || order.discount || 0)
            const tax      = Number(order.tax_amount || order.tax || 0)
            const shipping = Number(order.shipping_amount || order.shipping || 0)
            const total    = Number(order.total_amount || order.total || 0)
            const calcSub  = subtotal > 0
              ? subtotal
              : items.reduce((s, i) => s + (Number(i.total_price || i.line_total || 0) || Number(i.unit_price || i.price || 0) * Number(i.quantity || 1)), 0)

            const rows = [
              ['Subtotal', calcSub],
              discount > 0 && ['Discount', discount, 'discount'],
              tax      > 0 && ['Tax', tax],
              shipping > 0 && ['Shipping', shipping],
            ].filter(Boolean)

            return (
              <div className="mo-totals">
                {rows.map(([label, val, type]) => (
                  <div key={label} className="mo-total-row">
                    <span>{label}</span>
                    <span style={{ color: type === 'discount' ? T.green : undefined }}>
                      {type === 'discount' ? '− ' : ''}NPR {Number(val || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div
                  className="mo-total-final"
                  style={{ opacity: isCancelled ? .5 : 1 }}
                >
                  <span>{isCancelled ? 'Order total' : 'Total paid'}</span>
                  <span style={{ textDecoration: isCancelled ? 'line-through' : 'none' }}>
                    NPR {total.toLocaleString()}
                  </span>
                </div>
                {status === 'refunded' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.88rem', fontWeight: 700, color: T.green, paddingTop: '.3rem' }}>
                    <span>Refund processed</span>
                    <span>NPR {total.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )
          })()}

          {order.notes && (
            <div style={{ fontSize: '.8rem', color: T.muted, fontStyle: 'italic', marginTop: '.65rem' }}>
              Note: {order.notes}
            </div>
          )}

          {order.coupon_code && (
            <div className="mo-coupon">
              🎫 Coupon: {order.coupon_code}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Demo data (fallback when API is unavailable)
───────────────────────────────────────────── */
const DEMO_ORDERS = [
  {
    id: 'ord-abc12345',
    order_number: 'ORD-2024-0042',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'shipped',
    payment_status: 'paid',
    payment_method: 'eSewa',
    payment_admin_note: 'Payment verified by admin on Apr 1.',
    total_amount: 4850,
    subtotal: 4350,
    shipping_amount: 500,
    discount_amount: 430,
    coupon_code: 'SAVE10',
    order_items: [
      { id: 'i1', product_name: 'Himalayan Herb Oil',  unit_price: 2200, quantity: 1, total_price: 2200 },
      { id: 'i2', product_name: 'Wellness Tea Pack',   unit_price: 2150, quantity: 1, total_price: 2150 },
    ],
  },
  {
    id: 'ord-def67890',
    order_number: 'ORD-2024-0038',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'pending',
    payment_status: 'pending',
    payment_method: 'COD',
    payment_admin_note: '',
    total_amount: 1200,
    order_items: [
      { id: 'i3', product_name: 'Aromatherapy Candle', unit_price: 1200, quantity: 1, total_price: 1200 },
    ],
  },
  {
    id: 'ord-ghi11111',
    order_number: 'ORD-2024-0031',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    status: 'delivered',
    payment_status: 'paid',
    payment_method: 'Khalti',
    payment_admin_note: 'Confirmed & delivered. Thank you!',
    total_amount: 7500,
    subtotal: 7500,
    order_items: [
      { id: 'i4', product_name: 'Puja Kit Premium', unit_price: 5000, quantity: 1, total_price: 5000 },
      { id: 'i5', product_name: 'Incense Set',       unit_price: 2500, quantity: 1, total_price: 2500 },
    ],
  },
  {
    id: 'ord-jkl22222',
    order_number: 'ORD-2024-0019',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    status: 'cancelled',
    payment_status: 'refunded',
    payment_method: 'eSewa',
    payment_admin_note: 'Refund issued — item out of stock.',
    total_amount: 2800,
    order_items: [
      { id: 'i6', product_name: 'Ritual Copper Pot', unit_price: 2800, quantity: 1, total_price: 2800 },
    ],
  },
]

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   Auth flow:
     1. authLoading=true → spinner only
     2. !user            → navigate to /signin
     3. user exists      → render full page
═══════════════════════════════════════════════════════════ */
export default function MyOrdersPage() {
  useEffect(() => { injectCSS('mo-css-v3', CSS) }, [])

  const { user, loading: authLoading } = useAuth()
  const { navigate }                   = useRouter()

  // ── Auth guard ──────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return
    if (!user) navigate('/signin')
  }, [user, authLoading])

  const [tab,            setTab]            = useState('orders')
  const [orders,         setOrders]         = useState([])
  const [loading,        setLoading]        = useState(true)
  const [qrOrder,        setQrOrder]        = useState(null)
  const [codOrder,       setCodOrder]       = useState(null)
  const [codDone,        setCodDone]        = useState({})
  const [showPastOrders, setShowPastOrders] = useState(false)

  // Fetch orders once auth resolves
  useEffect(() => {
    if (!authLoading && user) fetchOrders()
  }, [user, authLoading])

  async function fetchOrders() {
    setLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const res   = await fetch(`${API_BASE}/store/orders?limit=50`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) throw new Error()
      const data    = await res.json()
      const fetched = data.orders || data.data || data.items || []
      setOrders(fetched.length ? fetched : DEMO_ORDERS)
    } catch {
      setOrders(DEMO_ORDERS)
    } finally {
      setLoading(false)
    }
  }

  // ── Show spinner during auth resolution ─────────────────
  if (authLoading || !user) {
    return (
      <div className="mo-auth-loading">
        <div className="mo-auth-spinner" />
      </div>
    )
  }

  // ── Derived stats ────────────────────────────────────────
  const stats = {
    total:     orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending:   orders.filter(o => ['pending', 'confirmed', 'processing'].includes(o.status)).length,
    spent:     orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((s, o) => s + Number(o.total_amount || 0), 0),
  }

  const ACTIVE_STATUSES = ['pending', 'confirmed', 'processing', 'shipped']
  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes((o.status || '').toLowerCase()))
  const pastOrders   = orders.filter(o => !ACTIVE_STATUSES.includes((o.status || '').toLowerCase()))

  const resolvedOrder = id =>
    codDone[id] ? { ...orders.find(o => o.id === id), status: 'confirmed' } : orders.find(o => o.id === id)

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="mo-wrap">

      {/* ── Hero ── */}
      <div className="mo-hero">
        <div className="mo-hero-inner">
          <div className="mo-hero-left">
            <div className="mo-hero-icon">📦</div>
            <div>
              <h1 className="mo-hero-title">My Orders</h1>
              <p className="mo-hero-sub">
                Signed in as{' '}
                <strong>{user.fullName || user.full_name || user.name || user.email}</strong>
              </p>
            </div>
          </div>
          <button className="mo-back-btn" onClick={() => navigate('/account')}>
            ← Back to account
          </button>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="mo-stats">
        <div className="mo-stats-inner">
          {[
            { num: stats.total,                            label: 'Total orders' },
            { num: stats.delivered,                        label: 'Delivered'    },
            { num: stats.pending,                          label: 'In progress'  },
            { num: `NPR ${stats.spent.toLocaleString()}`,  label: 'Total spent'  },
          ].map((s, i) => (
            <div key={s.label} style={{ display: 'contents' }}>
              {i > 0 && <div className="mo-stat-div" />}
              <div className="mo-stat">
                <span className="mo-stat-num">{s.num}</span>
                <span className="mo-stat-lbl">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mo-tabs">
        <div className="mo-tabs-inner">
          {[
            { id: 'orders',  label: '📦 My orders'       },
            { id: 'payment', label: '💳 Payment status'  },
          ].map(t => (
            <button
              key={t.id}
              className={`mo-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main ── */}
      <div className="mo-main">

        {/* ── Orders tab ── */}
        {tab === 'orders' && (
          <>
            <div className="mo-section-hd">
              <h2 className="mo-section-title">
                {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''}`}
              </h2>
              <button className="mo-btn-ghost" onClick={fetchOrders} disabled={loading}>
                🔄 Refresh
              </button>
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="mo-empty">
                <div style={{ fontSize: '2rem', opacity: .25, marginBottom: '1rem' }}>📦</div>
                <p style={{ color: T.secondary, fontSize: '.85rem' }}>Loading your orders…</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && orders.length === 0 && (
              <div className="mo-empty">
                <div className="mo-empty-icon">📦</div>
                <p style={{ color: T.secondary, marginBottom: '.5rem', fontFamily: "'Fraunces',Georgia,serif", fontSize: '1.05rem' }}>
                  No orders yet
                </p>
                <p style={{ color: T.muted, fontSize: '.85rem', marginBottom: '1.5rem' }}>
                  When you purchase products, they'll appear here.
                </p>
                <button className="mo-btn-primary" onClick={() => navigate('/shop')}>
                  Browse shop →
                </button>
              </div>
            )}

            {/* Active orders */}
            {!loading && activeOrders.map(order => (
              <OrderCard
                key={order.id}
                order={resolvedOrder(order.id) || order}
                onShowQR={setQrOrder}
                onCODConfirm={setCodOrder}
              />
            ))}

            {/* Past orders toggle */}
            {!loading && pastOrders.length > 0 && (
              <>
                <button
                  className="mo-past-toggle"
                  onClick={() => setShowPastOrders(v => !v)}
                >
                  <span className={`mo-past-arrow${showPastOrders ? ' open' : ''}`}>▶</span>
                  Past orders ({pastOrders.length})
                </button>

                {showPastOrders && pastOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={resolvedOrder(order.id) || order}
                    onShowQR={setQrOrder}
                    onCODConfirm={setCodOrder}
                  />
                ))}
              </>
            )}
          </>
        )}

        {/* ── Payment tab ── */}
        {tab === 'payment' && loading && (
          <div className="mo-empty">
            <div style={{ fontSize: '2rem', opacity: .25, marginBottom: '1rem' }}>💳</div>
            <p style={{ color: T.secondary, fontSize: '.85rem' }}>Loading…</p>
          </div>
        )}

        {tab === 'payment' && !loading && (
          <>
            <div className="mo-section-hd">
              <h2 className="mo-section-title">Payment status</h2>
              <span style={{ fontSize: '.72rem', background: T.amberLight, border: `1px solid #f5d87a`, borderRadius: 6, padding: '.25rem .65rem', color: T.amber }}>
                🔔 Status updated by admin
              </span>
            </div>

            <PaymentStatusTab orders={activeOrders} />

            {pastOrders.length > 0 && (
              <>
                <button
                  className="mo-past-toggle"
                  onClick={() => setShowPastOrders(v => !v)}
                  style={{ marginTop: '1.5rem' }}
                >
                  <span className={`mo-past-arrow${showPastOrders ? ' open' : ''}`}>▶</span>
                  Past order payments ({pastOrders.length})
                </button>
                {showPastOrders && <PaymentStatusTab orders={pastOrders} />}
              </>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {qrOrder && (
        <QRModal order={qrOrder} onClose={() => setQrOrder(null)} />
      )}

      {codOrder && (
        <CODConfirmModal
          order={codOrder}
          onConfirm={() => {
            setCodDone(d => ({ ...d, [codOrder.id]: true }))
            setCodOrder(null)
          }}
          onClose={() => setCodOrder(null)}
        />
      )}
    </div>
  )
}