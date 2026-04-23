// src/components/FloatingActions.jsx
//
// MEET LOGIC:
//   - Client must be logged in (auth token in localStorage/context)
//   - On open, fetches /api/appointments/upcoming?userId=X
//   - Server returns { meet_link, starts_at, ends_at } for THEIR booking only
//   - Link is only shown if current time is within [starts_at - 15min, ends_at + 30min]
//   - No shared / hardcoded link — each row in appointments table has its own meet_link
//   - If not logged in → prompt to log in
//   - If no upcoming session → show "No session scheduled"
//   - If session exists but not yet time → show countdown

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from '../context/RouterContext'
import AttendanceModal from './AttendanceModal'

// ─────────────────────────────────────────────
// CSS (unchanged from original)
// ─────────────────────────────────────────────
const CSS = `
@keyframes fa-pulse-ring {
  0%   { transform: scale(1);   opacity: .7; }
  100% { transform: scale(2.2); opacity: 0;  }
}
@keyframes fa-pulse-ring2 {
  0%   { transform: scale(1);   opacity: .5; }
  100% { transform: scale(1.9); opacity: 0;  }
}
@keyframes fa-hand-bounce {
  0%,100% { transform: translateY(0) rotate(-15deg); }
  40%     { transform: translateY(-6px) rotate(-10deg); }
  60%     { transform: translateY(-3px) rotate(-18deg); }
}
@keyframes fa-hand-tap {
  0%,100% { transform: scale(1) rotate(-15deg); }
  50%     { transform: scale(.85) rotate(-5deg); }
}
@keyframes fa-label-in {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes fa-items-in {
  from { opacity: 0; transform: translateY(8px) scale(.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fa-hint-bob {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-4px); }
}
@keyframes popup-overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes popup-card-in {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes heartbeat {
  0%   { transform: scale(1); }
  15%  { transform: scale(1.13); }
  30%  { transform: scale(1.01); }
  45%  { transform: scale(1.08); }
  60%  { transform: scale(1); }
}
@keyframes meet-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50%     { box-shadow: 0 0 0 8px rgba(34,197,94,0); }
}
@keyframes meet-audio-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
  50%     { box-shadow: 0 0 0 8px rgba(99,102,241,0); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
@keyframes countdown-tick {
  0%  { transform: scale(1); }
  50% { transform: scale(1.04); }
  100%{ transform: scale(1); }
}

.fa-root {
  position: fixed; bottom: 28px; right: 28px;
  z-index: 9999; display: flex; flex-direction: column;
  align-items: flex-end; gap: 0;
}
.fa-ring {
  position: absolute; bottom: 0; right: 0;
  width: 56px; height: 56px; border-radius: 50%;
  background: rgba(0,191,255,.28); pointer-events: none;
}
.fa-ring1 { animation: fa-pulse-ring  2.2s ease-out infinite; }
.fa-ring2 { animation: fa-pulse-ring2 2.2s ease-out .6s infinite; }

.fa-btn {
  width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer;
  background: linear-gradient(135deg, #007BA8 0%, #009FD4 55%, #00BFFF 100%);
  box-shadow: 0 4px 18px rgba(0,123,168,.45);
  display: flex; align-items: center; justify-content: center;
  position: relative; transition: transform .2s, box-shadow .2s; flex-shrink: 0;
}
.fa-btn:hover { transform: scale(1.07); box-shadow: 0 6px 24px rgba(0,123,168,.55); }
.fa-btn.fa-open { background: linear-gradient(135deg, #005580 0%, #007BA8 100%); }
.fa-hand {
  animation: fa-hand-bounce 1.8s ease-in-out infinite;
  display: flex; align-items: center; justify-content: center; user-select: none;
}
.fa-btn:hover .fa-hand { animation: fa-hand-tap .35s ease-in-out; }
.fa-x { font-size: 20px; color: white; font-weight: 300; line-height: 1; }

.fa-hint {
  position: absolute; bottom: 62px; right: 0;
  background: rgba(255,255,255,.96); border: 1px solid rgba(0,123,168,.2);
  border-radius: 100px; padding: 5px 13px 5px 10px;
  font-size: 11.5px; font-weight: 700; color: #007BA8;
  white-space: nowrap; letter-spacing: .02em;
  display: flex; align-items: center; gap: 5px;
  box-shadow: 0 3px 12px rgba(0,60,100,.13);
  animation: fa-hint-bob 2s ease-in-out infinite; pointer-events: none;
}
.fa-hint::after {
  content: ''; position: absolute; bottom: -6px; right: 20px;
  width: 10px; height: 6px; background: rgba(255,255,255,.96);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}
.fa-items {
  display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
  margin-bottom: 14px; animation: fa-items-in .22s ease both;
}
.fa-row { display: flex; align-items: center; gap: 10px; }
.fa-label {
  background: rgba(255,255,255,.97); border: 1px solid rgba(0,123,168,.15);
  border-radius: 100px; padding: 6px 14px;
  font-size: 12px; font-weight: 700; color: #1a3a4a;
  white-space: nowrap; box-shadow: 0 2px 10px rgba(0,60,100,.1);
  cursor: pointer; transition: background .15s, color .15s;
  animation: fa-label-in .2s ease both;
}
.fa-label:hover { background: #e0f4ff; color: #007BA8; }
.fa-item-btn {
  width: 42px; height: 42px; border-radius: 50%; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
  transition: transform .15s, box-shadow .15s; line-height: 1;
}
.fa-item-btn:hover { transform: scale(1.12); }

.pop-overlay {
  position: fixed; inset: 0; background: rgba(0,10,20,0.65);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  z-index: 10000; display: flex; align-items: center; justify-content: center;
  padding: 16px; animation: popup-overlay-in 0.25s ease both;
}
.pop-card {
  position: relative; width: min(480px, 94vw); border-radius: 22px; overflow: hidden;
  background: #0a1628;
  box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(0,191,255,0.18), inset 0 1px 0 rgba(255,255,255,0.08);
  animation: popup-card-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
  display: flex; flex-direction: column;
}
.pop-header {
  padding: 16px 18px 14px;
  background: linear-gradient(180deg, rgba(7,18,38,0.97) 60%, transparent 100%);
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid rgba(0,191,255,0.1);
}
.pop-header-dot {
  width: 8px; height: 8px; border-radius: 50%;
  flex-shrink: 0; box-shadow: 0 0 8px currentColor;
}
.pop-header-text { flex: 1; }
.pop-eyebrow {
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.1em;
  text-transform: uppercase; margin: 0 0 2px;
}
.pop-title { font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0; line-height: 1.2; }
.pop-subtitle { font-size: 0.68rem; font-weight: 400; color: rgba(180,220,255,0.7); margin: 2px 0 0; letter-spacing: 0.02em; }
.pop-close {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, #dc2626, #ef4444);
  border: 1.5px solid rgba(255,100,100,0.5); color: #fff;
  font-size: 1rem; font-weight: 700; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; line-height: 1; box-shadow: 0 3px 14px rgba(220,38,38,0.5);
  transition: background 0.18s, transform 0.18s, box-shadow 0.18s; outline: none;
}
.pop-close:hover {
  background: linear-gradient(135deg, #b91c1c, #dc2626);
  transform: scale(1.1) rotate(90deg); box-shadow: 0 5px 20px rgba(220,38,38,0.7);
}
.pop-footer {
  padding: 12px 18px 14px;
  background: linear-gradient(0deg, rgba(7,18,38,0.97) 60%, transparent 100%);
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  border-top: 1px solid rgba(0,191,255,0.08);
}
.pop-footer-info { display: flex; align-items: center; gap: 8px; font-size: 0.7rem; color: rgba(160,210,255,0.75); }
.pop-action-btn {
  display: flex; align-items: center; gap: 6px;
  background: rgba(0,191,255,0.12); border: 1px solid rgba(0,191,255,0.3);
  border-radius: 100px; padding: 6px 14px; color: #00BFFF;
  font-size: 0.68rem; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase;
  cursor: pointer; text-decoration: none;
  transition: background 0.2s, border-color 0.2s, box-shadow 0.2s; white-space: nowrap;
}
.pop-action-btn:hover {
  background: rgba(0,191,255,0.22); border-color: rgba(0,191,255,0.6);
  box-shadow: 0 3px 14px rgba(0,191,255,0.2);
}
.pop-map-iframe { width: 100%; height: 300px; border: none; display: block; }

.pop-donate-body { padding: 0; }
.pop-qr-section { padding: 20px 20px 14px; text-align: center; border-bottom: 1px solid rgba(0,191,255,0.08); }
.pop-qr-frame {
  background: rgba(255,255,255,0.06); border: 1.5px dashed rgba(0,191,255,0.35);
  border-radius: 16px; padding: 16px; display: inline-block;
}
.pop-qr-frame img { width: 160px; height: 160px; object-fit: contain; display: block; border-radius: 8px; }
.pop-qr-hint { margin: 10px 0 0; font-size: 0.68rem; color: rgba(160,210,255,0.65); font-weight: 500; letter-spacing: 0.02em; }
.pop-benefits { padding: 16px 20px; border-bottom: 1px solid rgba(0,191,255,0.08); }
.pop-benefits-label { font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(0,191,255,0.6); margin: 0 0 12px; }
.pop-benefit-row { display: flex; gap: 10px; margin-bottom: 10px; align-items: flex-start; }
.pop-benefit-icon { font-size: 15px; line-height: 1.5; flex-shrink: 0; }
.pop-benefit-text { margin: 0; font-size: 0.72rem; color: rgba(200,230,255,0.8); line-height: 1.6; }
.pop-thank { margin: 0; padding: 10px 20px; background: rgba(249,115,22,0.1); border-top: 1px solid rgba(249,115,22,0.2); font-size: 0.7rem; color: rgba(255,200,130,0.85); text-align: center; font-weight: 600; letter-spacing: 0.02em; }
.hb-icon { animation: heartbeat 1.5s ease-in-out infinite; display: inline-block; }

/* ── Meet popup specific ── */
.pop-meet-body { padding: 20px 20px 4px; display: flex; flex-direction: column; gap: 14px; }
.meet-call-card {
  display: flex; align-items: center; gap: 16px; padding: 18px 20px;
  border-radius: 16px; text-decoration: none; cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
  position: relative; overflow: hidden;
}
.meet-call-card:hover { transform: translateY(-2px); }
.meet-call-card:active { transform: translateY(0) scale(0.98); }
.meet-card-video { background: rgba(34,197,94,0.1); border: 1.5px solid rgba(34,197,94,0.3); animation: meet-pulse 2.4s ease-in-out infinite; }
.meet-card-video:hover { border-color: rgba(34,197,94,0.6); box-shadow: 0 8px 32px rgba(34,197,94,0.2); }
.meet-card-audio { background: rgba(99,102,241,0.1); border: 1.5px solid rgba(99,102,241,0.3); animation: meet-audio-pulse 2.4s ease-in-out 0.6s infinite; }
.meet-card-audio:hover { border-color: rgba(99,102,241,0.6); box-shadow: 0 8px 32px rgba(99,102,241,0.2); }
.meet-icon-wrap { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
.meet-icon-video { background: rgba(34,197,94,0.18); }
.meet-icon-audio { background: rgba(99,102,241,0.18); }
.meet-card-text { flex: 1; }
.meet-card-label { font-size: 0.95rem; font-weight: 800; color: #fff; margin: 0 0 3px; letter-spacing: 0.01em; }
.meet-card-desc { font-size: 0.7rem; color: rgba(180,210,255,0.6); margin: 0; line-height: 1.5; }
.meet-card-arrow { font-size: 1.1rem; opacity: 0.5; transition: opacity 0.15s, transform 0.15s; }
.meet-call-card:hover .meet-card-arrow { opacity: 1; transform: translateX(3px); }
.meet-divider { display: flex; align-items: center; gap: 10px; }
.meet-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
.meet-divider-text { font-size: 0.62rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.2); }
.meet-note { margin: 0; padding: 10px 20px 14px; font-size: 0.68rem; color: rgba(160,210,255,0.5); text-align: center; line-height: 1.6; }

/* ── Meet states ── */
.meet-state-box {
  margin: 20px 20px 4px;
  border-radius: 16px;
  padding: 28px 22px;
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.meet-state-icon { font-size: 2.5rem; line-height: 1; }
.meet-state-title { font-size: 1rem; font-weight: 800; color: #fff; margin: 0; }
.meet-state-sub { font-size: 0.75rem; color: rgba(180,210,255,0.65); margin: 0; line-height: 1.6; }
.meet-countdown {
  font-size: 1.4rem; font-weight: 800; letter-spacing: 0.05em;
  color: #00BFFF; animation: countdown-tick 1s ease-in-out infinite;
}
.meet-spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid rgba(0,191,255,0.15);
  border-top-color: #00BFFF;
  animation: spin 0.8s linear infinite;
}
.meet-login-btn {
  margin-top: 4px;
  background: linear-gradient(135deg, #007BA8, #00BFFF);
  color: white; border: none; border-radius: 100px;
  padding: 9px 22px; font-size: 0.8rem; font-weight: 800;
  cursor: pointer; letter-spacing: 0.04em;
  transition: transform 0.15s, box-shadow 0.15s;
  box-shadow: 0 4px 14px rgba(0,123,168,0.4);
}
.meet-login-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,123,168,0.5); }

/* ── Session badge ── */
.meet-session-badge {
  margin: 12px 20px 0;
  background: rgba(34,197,94,0.08);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex; align-items: center; gap: 10px;
}
.meet-session-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #22c55e; flex-shrink: 0;
  box-shadow: 0 0 6px rgba(34,197,94,0.7);
  animation: meet-pulse 1.8s ease-in-out infinite;
}
.meet-session-info { flex: 1; }
.meet-session-label { font-size: 0.68rem; font-weight: 800; color: rgba(34,197,94,0.85); letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 2px; }
.meet-session-time { font-size: 0.72rem; color: rgba(180,210,255,0.65); margin: 0; }

@media (max-width: 500px) {
  .fa-root { bottom: 18px; right: 16px; }
  .fa-label { font-size: 11px; padding: 5px 11px; }
  .fa-item-btn { width: 38px; height: 38px; font-size: 15px; }
  .fa-btn { width: 50px; height: 50px; }
  .fa-ring { width: 50px; height: 50px; }
  .pop-card { border-radius: 16px; }
  .pop-map-iframe { height: 240px; }
  .meet-call-card { padding: 14px 16px; }
  .meet-icon-wrap { width: 44px; height: 44px; font-size: 20px; }
}
`

function injectCSS() {
  if (typeof document === 'undefined') return
  if (document.getElementById('fa-css')) return
  const el = document.createElement('style')
  el.id = 'fa-css'
  el.textContent = CSS
  document.head.appendChild(el)
}

// ─────────────────────────────────────────────
// Shared popup hook
// ─────────────────────────────────────────────
function usePopupBehavior(onClose) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

// ─────────────────────────────────────────────
// API call — fetch this user's upcoming session
//
// Your backend should:
//   GET /api/appointments/my-next
//   Headers: Authorization: Bearer <token>
//   Returns:
//     {
//       id: "appt_123",
//       meet_link: "https://meet.google.com/abc-defg-hij",   ← unique per booking
//       audio_link: "tel:+977XXXXXXXXXX",                    ← optional
//       starts_at:  "2025-07-15T10:00:00+05:45",
//       ends_at:    "2025-07-15T11:00:00+05:45",
//       therapist:  "Dr. Puja Samargi",
//       type:       "Individual Therapy"
//     }
//   Or 404 / { error: "no_session" } if no upcoming booking
// ─────────────────────────────────────────────
async function fetchMySession() {
  const token = localStorage.getItem('auth_token')
  if (!token) return { state: 'not_logged_in' }

  try {
    const res = await fetch('/api/appointments/my-next', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 401) return { state: 'not_logged_in' }
    if (res.status === 404) return { state: 'no_session' }

    const data = await res.json()
    if (!data?.meet_link) return { state: 'no_session' }

    const now       = Date.now()
    const startMs   = new Date(data.starts_at).getTime()
    const endMs     = new Date(data.ends_at).getTime()
    const openFrom  = startMs - 15 * 60 * 1000   // 15 min before
    const closeAt   = endMs   + 30 * 60 * 1000   // 30 min after

    if (now > closeAt)   return { state: 'no_session' }          // session over
    if (now < openFrom)  return { state: 'waiting', data, msUntilOpen: openFrom - now }
    return { state: 'active', data }                             // join now

  } catch {
    return { state: 'error' }
  }
}

// ─────────────────────────────────────────────
// MEET POPUP
// ─────────────────────────────────────────────
function MeetPopup({ onClose }) {
  usePopupBehavior(onClose)
  const { navigate } = useRouter()
  const [status, setStatus] = useState({ state: 'loading' })
  const [tick, setTick]     = useState(0)

  // load session on mount
  useEffect(() => {
    fetchMySession().then(setStatus)
  }, [])

  // countdown ticker — re-renders every second when waiting
  useEffect(() => {
    if (status.state !== 'waiting') return
    const id = setInterval(() => {
      setTick(t => t + 1)
      // re-check if window has opened
      const msLeft = status.msUntilOpen - (tick + 1) * 1000
      if (msLeft <= 0) fetchMySession().then(setStatus)
    }, 1000)
    return () => clearInterval(id)
  }, [status, tick])

  const msLeft = status.state === 'waiting'
    ? Math.max(0, status.msUntilOpen - tick * 1000)
    : 0

  return (
    <div
      className="pop-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      role="dialog" aria-modal="true" aria-label="Join session"
    >
      <div className="pop-card">

        {/* Header */}
        <div className="pop-header">
          <div className="pop-header-dot" style={{ color: '#22c55e', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.8)' }} />
          <div className="pop-header-text">
            <p className="pop-eyebrow" style={{ color: 'rgba(34,197,94,0.75)' }}>Connect With Us</p>
            <h2 className="pop-title">Join Your Session 🎙️</h2>
            <p className="pop-subtitle">Private link — only visible to you</p>
          </div>
          <button className="pop-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* ── STATE: loading ── */}
        {status.state === 'loading' && (
          <div className="meet-state-box" style={{ background: 'rgba(0,191,255,0.05)', border: '1px solid rgba(0,191,255,0.1)' }}>
            <div className="meet-spinner" />
            <p className="meet-state-sub">Fetching your session details…</p>
          </div>
        )}

        {/* ── STATE: not logged in ── */}
        {status.state === 'not_logged_in' && (
          <div className="meet-state-box" style={{ background: 'rgba(255,200,60,0.06)', border: '1px solid rgba(255,200,60,0.15)' }}>
            <div className="meet-state-icon">🔐</div>
            <p className="meet-state-title">Login Required</p>
            <p className="meet-state-sub">
              Your session link is private and tied to your account.<br />
              Please log in to access it.
            </p>
            <button className="meet-login-btn" onClick={() => { onClose(); navigate('/login') }}>
              Log In to Continue →
            </button>
          </div>
        )}

        {/* ── STATE: no upcoming session ── */}
        {status.state === 'no_session' && (
          <div className="meet-state-box" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className="meet-state-icon">📅</div>
            <p className="meet-state-title">No Session Scheduled</p>
            <p className="meet-state-sub">
              You don't have an upcoming session right now.<br />
              Book an appointment and your private link will appear here.
            </p>
            <button className="meet-login-btn" onClick={() => { onClose(); navigate('/book') }}
              style={{ background: 'linear-gradient(135deg,#534AB7,#7b72e0)', boxShadow: '0 4px 14px rgba(83,74,183,0.4)' }}>
              Book a Session →
            </button>
          </div>
        )}

        {/* ── STATE: waiting (session exists, not yet time) ── */}
        {status.state === 'waiting' && status.data && (
          <>
            <div className="meet-session-badge">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px rgba(245,158,11,0.7)', flexShrink: 0 }} />
              <div className="meet-session-info">
                <p className="meet-session-label" style={{ color: 'rgba(245,158,11,0.85)' }}>
                  {status.data.type || 'Session'} · {status.data.therapist}
                </p>
                <p className="meet-session-time">
                  {formatDate(status.data.starts_at)} &nbsp;·&nbsp;
                  {formatTime(status.data.starts_at)} – {formatTime(status.data.ends_at)}
                </p>
              </div>
            </div>
            <div className="meet-state-box" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="meet-state-icon">⏳</div>
              <p className="meet-state-title">Session Opens In</p>
              <div className="meet-countdown">{formatCountdown(msLeft)}</div>
              <p className="meet-state-sub">
                Your private link will unlock 15 minutes before your session starts.<br />
                Come back then to join.
              </p>
            </div>
          </>
        )}

        {/* ── STATE: active — show the real private links ── */}
        {status.state === 'active' && status.data && (
          <>
            {/* Session info badge */}
            <div className="meet-session-badge">
              <div className="meet-session-dot" />
              <div className="meet-session-info">
                <p className="meet-session-label">
                  {status.data.type || 'Session'} · {status.data.therapist}
                </p>
                <p className="meet-session-time">
                  {formatDate(status.data.starts_at)} &nbsp;·&nbsp;
                  {formatTime(status.data.starts_at)} – {formatTime(status.data.ends_at)}
                </p>
              </div>
            </div>

            {/* Links */}
            <div className="pop-meet-body">
              <a
                className="meet-call-card meet-card-video"
                href={status.data.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
              >
                <div className="meet-icon-wrap meet-icon-video">📹</div>
                <div className="meet-card-text">
                  <p className="meet-card-label">Join Video Call</p>
                  <p className="meet-card-desc">Your private session link — camera &amp; microphone</p>
                </div>
                <span className="meet-card-arrow">→</span>
              </a>

              {status.data.audio_link && (
                <>
                  <div className="meet-divider">
                    <div className="meet-divider-line" />
                    <span className="meet-divider-text">or</span>
                    <div className="meet-divider-line" />
                  </div>
                  <a
                    className="meet-call-card meet-card-audio"
                    href={status.data.audio_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onClose}
                  >
                    <div className="meet-icon-wrap meet-icon-audio">🎧</div>
                    <div className="meet-card-text">
                      <p className="meet-card-label">Audio Only</p>
                      <p className="meet-card-desc">Phone or audio-only — no camera needed</p>
                    </div>
                    <span className="meet-card-arrow">→</span>
                  </a>
                </>
              )}
            </div>
          </>
        )}

        {/* ── STATE: error ── */}
        {status.state === 'error' && (
          <div className="meet-state-box" style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
            <div className="meet-state-icon">⚠️</div>
            <p className="meet-state-title">Connection Error</p>
            <p className="meet-state-sub">Could not fetch your session details. Please try again or contact support.</p>
            <button className="meet-login-btn" onClick={() => fetchMySession().then(setStatus)}
              style={{ background: 'linear-gradient(135deg,#dc2626,#ef4444)', boxShadow: '0 4px 14px rgba(220,38,38,0.4)' }}>
              Retry
            </button>
          </div>
        )}

        <p className="meet-note">🔒 &nbsp;Your link is private and only visible to you after login</p>

        <div className="pop-footer">
          <div className="pop-footer-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Private &amp; Confidential
          </div>
          <button className="pop-action-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// LOCATION POPUP (unchanged)
// ─────────────────────────────────────────────
const OFFICE = {
  label:    'Common Psychology',
  address:  'Bhaktapur, Nepal',
  hours:    'Sun – Fri  |  9:00 AM – 6:00 PM NPT',
  embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.4773846854585!2d85.31525731503832!3d27.71727798279466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjfCsDQzJzAyLjIiTiA4NcKwMTknMDMuMiJF!5e0!3m2!1sen!2snp!4v1700000000000',
  gmapsUrl: 'https://maps.google.com/?q=Common+Psychology+Thimi+Bhaktapur+Nepal',
}

function LocationPopup({ onClose }) {
  usePopupBehavior(onClose)
  return (
    <div className="pop-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true">
      <div className="pop-card">
        <div className="pop-header">
          <div className="pop-header-dot" style={{ color: '#00BFFF', background: '#00BFFF' }} />
          <div className="pop-header-text">
            <p className="pop-eyebrow" style={{ color: 'rgba(0,191,255,0.7)' }}>Find Us</p>
            <h2 className="pop-title">{OFFICE.label}</h2>
            <p className="pop-subtitle">📍 {OFFICE.address}</p>
          </div>
          <button className="pop-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <iframe className="pop-map-iframe" src={OFFICE.embedUrl} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Office location map" />
        <div className="pop-footer">
          <div className="pop-footer-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {OFFICE.hours}
          </div>
          <a className="pop-action-btn" href={OFFICE.gmapsUrl} target="_blank" rel="noopener noreferrer">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open in Google Maps
          </a>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// DONATE POPUP (unchanged)
// ─────────────────────────────────────────────
const DONATE_BENEFITS = [
  { icon: '🧠', text: 'Provide free mental health resources to those in need' },
  { icon: '💬', text: 'Subsidise therapy sessions for low-income families' },
  { icon: '📚', text: 'Create awareness programs in schools & communities' },
  { icon: '🤝', text: 'Train local mental health volunteers across Nepal' },
]

function DonatePopup({ onClose }) {
  usePopupBehavior(onClose)
  return (
    <div className="pop-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true">
      <div className="pop-card">
        <div className="pop-header">
          <div className="pop-header-dot" style={{ color: '#f97316', background: '#f97316', boxShadow: '0 0 8px rgba(249,115,22,0.8)' }} />
          <div className="pop-header-text">
            <p className="pop-eyebrow" style={{ color: 'rgba(249,115,22,0.75)' }}>Support Our Mission</p>
            <h2 className="pop-title">Donate to Puja Samargi 🙏</h2>
            <p className="pop-subtitle">Every rupee makes a real difference</p>
          </div>
          <button className="pop-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="pop-donate-body">
          <div className="pop-qr-section">
            <div className="pop-qr-frame"><img src="/payment-qr.png" alt="Payment QR Code" /></div>
            <p className="pop-qr-hint">Scan with any UPI / payment app</p>
          </div>
          <div className="pop-benefits">
            <p className="pop-benefits-label">Your donation helps us:</p>
            {DONATE_BENEFITS.map(({ icon, text }) => (
              <div key={text} className="pop-benefit-row">
                <span className="pop-benefit-icon">{icon}</span>
                <p className="pop-benefit-text">{text}</p>
              </div>
            ))}
          </div>
          <p className="pop-thank">❤️ &nbsp; Thank you for your generosity</p>
        </div>
        <div className="pop-footer">
          <div className="pop-footer-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            Secure UPI &nbsp;|&nbsp; No account needed
          </div>
          <button className="pop-action-btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Hand SVG (unchanged)
// ─────────────────────────────────────────────
function HandIcon() {
  return (
    <svg className="fa-hand" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.25))' }}>
      <g transform="translate(12,12) rotate(-15) translate(-12,-12)">
        <path d="M8 13V7.5a1.5 1.5 0 0 1 3 0V12"          stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M11 11.5V6.5a1.5 1.5 0 0 1 3 0V12"       stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M14 11.5V8a1.5 1.5 0 0 1 3 0v4.5"        stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 13c0 0-.5 1 0 2.5C8.5 17.5 9.5 19 12 20c2.5 1 4-1 4.5-2.5.5-1.5.5-4.5.5-5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8 13v-2a1.5 1.5 0 0 0-3 0v3c0 2 1.5 5 5 6" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────
// ACTIONS CONFIG (unchanged)
// ─────────────────────────────────────────────
const ACTIONS = [
  { id: 'attendance', label: 'Event Attendance', emoji: '📋', bg: 'linear-gradient(135deg,#007BA8,#00BFFF)', shadow: 'rgba(0,123,168,.4)',    popup: 'attendance' },
  { id: 'meet',       label: 'Meet Online',       emoji: '🤝', bg: 'linear-gradient(135deg,#16a34a,#22c55e)', shadow: 'rgba(34,197,94,.38)',   popup: 'meet'       },
  { id: 'support',    label: 'Support Us',         emoji: '❤️', bg: 'linear-gradient(135deg,#e8593c,#ff7a57)', shadow: 'rgba(232,89,60,.4)',   popup: 'donate'     },
  { id: 'office',     label: 'Find Our Office',    emoji: '📍', bg: 'linear-gradient(135deg,#1D9E75,#2cc08a)', shadow: 'rgba(29,158,117,.35)', popup: 'location'   },
  { id: 'eye',        label: 'Psychology Eye',     emoji: '👁️', bg: 'linear-gradient(135deg,#534AB7,#7b72e0)', shadow: 'rgba(83,74,183,.38)',  path:  '/psychological-view' },
  { id: 'orders',     label: 'Track My Orders',    emoji: '📦', bg: 'linear-gradient(135deg,#BA7517,#e8a030)', shadow: 'rgba(186,117,23,.38)', path:  '/my-orders'  },
]

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function FloatingActions() {
  useEffect(() => { injectCSS() }, [])

  const { navigate } = useRouter()
  const [open, setOpen]         = useState(false)
  const [hintDone, setHintDone] = useState(false)
  const [popup, setPopup]       = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setHintDone(true), 5000)
    return () => clearTimeout(t)
  }, [])

  function handleOpen() { setOpen(o => !o); setHintDone(true) }

  function handleAction(action) {
    setOpen(false)
    if (action.popup) { setPopup(action.popup); return }
    if (action.path)  { navigate(action.path);  return }
  }

  return (
    <>
      {popup === 'donate'     && <DonatePopup    onClose={() => setPopup(null)} />}
      {popup === 'location'   && <LocationPopup  onClose={() => setPopup(null)} />}
      {popup === 'meet'       && <MeetPopup      onClose={() => setPopup(null)} />}
      {popup === 'attendance' && <AttendanceModal onClose={() => setPopup(null)} />}

      <div className="fa-root">
        {open && (
          <div className="fa-items">
            {ACTIONS.map((a, i) => (
              <div key={a.id} className="fa-row" style={{ animationDelay: `${i * 45}ms` }}>
                <span className="fa-label" onClick={() => handleAction(a)}>{a.label}</span>
                <button className="fa-item-btn" style={{ background: a.bg, boxShadow: `0 4px 14px ${a.shadow}` }} onClick={() => handleAction(a)} aria-label={a.label}>
                  {a.emoji}
                </button>
              </div>
            ))}
          </div>
        )}
        {!open && <><div className="fa-ring fa-ring1" /><div className="fa-ring fa-ring2" /></>}
        {!hintDone && !open && (
          <div className="fa-hint"><span style={{ fontSize: 13 }}>👆</span>Tap me</div>
        )}
        <button className={`fa-btn${open ? ' fa-open' : ''}`} onClick={handleOpen} aria-label={open ? 'Close menu' : 'Open quick actions'} aria-expanded={open}>
          {open ? <span className="fa-x">✕</span> : <HandIcon />}
        </button>
      </div>
    </>
  )
}