// src/components/SmartDatePicker.jsx
import { useState, useRef, useEffect, useId } from 'react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAYS = ['S','M','T','W','T','F','S']

// ---- Design tokens -------------------------------------------------------
// Small, cute, colorful: white → sky-blue gradient, playful pastel accents,
// a tiled "CP" watermark ghosted into the background of the panel.
const T = {
  grad1:      '#ffffff',
  grad2:      '#dbeeff',
  grad3:      '#eef4ff',
  border:     '#c9e2fb',
  ink:        '#1f2a44',
  inkSoft:    '#6b7fa3',
  blue:       '#4f9cf9',
  blueDeep:   '#2f7fe0',
  purple:     '#a78bfa',
  pink:       '#fb7fb0',
  mint:       '#7fe0c9',
  hoverTint:  '#eaf4ff',
  disabled:   '#c7d2e6',
  shadow:     '0 14px 30px -10px rgba(79,156,249,0.35), 0 2px 8px rgba(31,42,68,0.08)',
}

const SANS = '"Nunito","Segoe UI",-apple-system,BlinkMacSystemFont,sans-serif'
const ROUND = '"Baloo 2","Nunito",sans-serif'

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

// tiny tiled "CP" watermark as a data-URI SVG pattern
function watermarkBg(color = '#4f9cf9', opacity = 0.07) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='60'>
    <text x='0' y='22' font-family='sans-serif' font-weight='800' font-size='16' fill='${color}' fill-opacity='${opacity}' transform='rotate(-18 45 30)'>CP</text>
    <text x='45' y='52' font-family='sans-serif' font-weight='800' font-size='16' fill='${color}' fill-opacity='${opacity}' transform='rotate(-18 45 30)'>CP</text>
  </svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

export default function SmartDatePicker({ value, onChange, minDate, disabledDay, placeholder = 'YYYY-MM-DD' }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(value || '')
  const [viewYear, setViewYear] = useState(value ? +value.slice(0, 4) : new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(value ? +value.slice(5, 7) - 1 : new Date().getMonth())
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 240 })
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const dropRef = useRef(null)
  const scopeId = 'sdp-' + useId().replace(/:/g, '')

  useEffect(() => setText(value || ''), [value])

  useEffect(() => {
    if (!open) return
    function calcPos() {
      if (!inputRef.current) return
      const r = inputRef.current.getBoundingClientRect()
      const dropH = 260
      const spaceBelow = window.innerHeight - r.bottom
      const top = spaceBelow >= dropH + 8 ? r.bottom + 6 : Math.max(8, r.top - dropH - 6)
      setDropPos({ top, left: r.left, width: Math.max(240, r.width) })
    }
    calcPos()
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open])

  useEffect(() => {
    function onDown(e) {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        dropRef.current && !dropRef.current.contains(e.target)
      ) setOpen(false)
    }
    function onKey(e) { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  function commitText(v) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const d = new Date(v + 'T00:00')
      if (!isNaN(d) && (!minDate || v >= minDate) && (!disabledDay || !disabledDay(d))) {
        onChange(v)
      }
    }
  }

  function isDisabled(y, m, d) {
    const iso = toISO(y, m, d)
    const dObj = new Date(y, m, d)
    return (minDate && iso < minDate) || (disabledDay && disabledDay(dObj))
  }

  function goToday() {
    const t = new Date()
    setViewYear(t.getFullYear())
    setViewMonth(t.getMonth())
    if (!isDisabled(t.getFullYear(), t.getMonth(), t.getDate())) {
      const iso = toISO(t.getFullYear(), t.getMonth(), t.getDate())
      onChange(iso)
      setText(iso)
      setOpen(false)
    }
  }

  function stepMonth(delta) {
    let m = viewMonth + delta, y = viewYear
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setViewMonth(m); setViewYear(y)
  }

  const today = new Date()
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate())
  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const startOffset = firstOfMonth.getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = [...Array(startOffset).fill(null), ...Array(daysInMonth)].map((_, i) =>
    i < startOffset ? null : i - startOffset + 1
  )
  const years = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() + i - 1)
  const monthKey = `${viewYear}-${viewMonth}`

  return (
    <div className={scopeId} style={{ fontFamily: SANS }}>
      <style>{`
        .${scopeId} .sdp-input:hover { border-color: ${T.blue} !important; }
        .${scopeId} .sdp-navbtn { background: #fff; border: 1.5px solid ${T.border}; cursor: pointer; color: ${T.blueDeep}; width: 22px; height: 22px; border-radius: 999px; display: flex; align-items: center; justify-content: center; transition: transform .12s, background .15s; }
        .${scopeId} .sdp-navbtn:hover { background: ${T.hoverTint}; transform: scale(1.12); }
        .${scopeId} select.sdp-sel { appearance: none; -webkit-appearance: none; background: transparent; border: none; cursor: pointer; color: ${T.ink}; font-family: ${ROUND}; font-weight: 800; font-size: 0.8rem; padding: 2px 14px 2px 3px; border-radius: 6px; }
        .${scopeId} select.sdp-sel:hover { background: ${T.hoverTint}; }
        .${scopeId} select.sdp-year { font-weight: 700; font-size: 0.72rem; color: ${T.inkSoft}; }
        .${scopeId} .sdp-day { position: relative; border: none; cursor: pointer; font-family: ${SANS}; font-weight: 700; font-size: 0.68rem; width: 100%; aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: background .12s, color .12s, transform .1s; background: transparent; color: ${T.ink}; }
        .${scopeId} .sdp-day:hover:not(:disabled) { background: ${T.hoverTint}; }
        .${scopeId} .sdp-day:active:not(:disabled) { transform: scale(0.88); }
        .${scopeId} .sdp-day:disabled { color: ${T.disabled}; cursor: not-allowed; }
        .${scopeId} .sdp-day.selected { background: linear-gradient(135deg, ${T.blue}, ${T.purple}); color: #fff; box-shadow: 0 3px 8px -2px rgba(79,156,249,0.6); }
        .${scopeId} .sdp-today-dot { position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%); width: 3.5px; height: 3.5px; border-radius: 50%; background: ${T.pink}; }
        .${scopeId} .sdp-day.selected .sdp-today-dot { background: #fff; }
        .${scopeId} .sdp-grid { animation: sdp-fade-${scopeId} .16s ease; }
        .${scopeId} .sdp-jump { background: linear-gradient(135deg, ${T.blue}, ${T.purple}); border: none; cursor: pointer; font-family: ${ROUND}; font-weight: 800; font-size: 0.62rem; letter-spacing: 0.02em; color: #fff; padding: 4px 10px; border-radius: 999px; transition: transform .12s, box-shadow .12s; box-shadow: 0 3px 8px -2px rgba(79,156,249,0.5); }
        .${scopeId} .sdp-jump:hover { transform: translateY(-1px) scale(1.04); }
        @keyframes sdp-fade-${scopeId} { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sdp-pop-${scopeId} { from { opacity: 0; transform: translateY(-6px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <input
        ref={inputRef}
        className="sdp-input"
        value={text}
        placeholder={placeholder}
        onChange={e => { setText(e.target.value); commitText(e.target.value) }}
        onFocus={() => { setOpen(true); setFocused(true) }}
        onBlur={() => setFocused(false)}
        style={{
          padding: '0.5rem 0.7rem',
          border: `1.5px solid ${focused ? T.blue : T.border}`,
          borderRadius: 12,
          width: '100%',
          maxWidth: 190,
          boxSizing: 'border-box',
          fontSize: '0.78rem',
          fontFamily: SANS,
          fontWeight: 700,
          color: T.ink,
          background: `linear-gradient(135deg, ${T.grad1}, ${T.grad3})`,
          outline: 'none',
          boxShadow: focused ? `0 0 0 3px ${T.hoverTint}` : '0 2px 6px -2px rgba(79,156,249,0.25)',
          transition: 'border-color .15s, box-shadow .15s',
        }}
      />

      {open && (
        <div
          ref={dropRef}
          style={{
            position: 'fixed', zIndex: 99999,
            top: dropPos.top, left: dropPos.left, width: dropPos.width,
            maxWidth: 240,
            background: `linear-gradient(160deg, ${T.grad1} 0%, ${T.grad2} 100%), ${watermarkBg(T.blue, 0.09)}`,
            backgroundBlendMode: 'normal',
            border: `1.5px solid ${T.border}`,
            borderRadius: 18,
            boxShadow: T.shadow,
            padding: '0.6rem 0.65rem 0.55rem',
            animation: `sdp-pop-${scopeId} .14s ease`,
            overflow: 'hidden',
          }}
        >
          {/* header: month/year + nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <button type="button" className="sdp-navbtn" onClick={() => stepMonth(-1)} aria-label="Previous month">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.15rem' }}>
              <select className="sdp-sel" value={viewMonth} onChange={e => setViewMonth(+e.target.value)} aria-label="Month">
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select className="sdp-sel sdp-year" value={viewYear} onChange={e => setViewYear(+e.target.value)} aria-label="Year">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button type="button" className="sdp-navbtn" onClick={() => stepMonth(1)} aria-label="Next month">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* weekday header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 2 }}>
            {WEEKDAYS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontFamily: ROUND, fontWeight: 800, fontSize: '0.55rem', color: [T.blue, T.purple, T.pink, T.blueDeep, T.mint, T.purple, T.pink][i], padding: '1px 0' }}>{d}</div>
            ))}
          </div>

          {/* day grid */}
          <div className="sdp-grid" key={monthKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const iso = toISO(viewYear, viewMonth, day)
              const disabled = isDisabled(viewYear, viewMonth, day)
              const selected = iso === value
              const isToday = iso === todayISO
              return (
                <button
                  key={i} type="button" disabled={disabled}
                  className={`sdp-day${selected ? ' selected' : ''}`}
                  onClick={() => { onChange(iso); setText(iso); setOpen(false) }}
                >
                  {day}
                  {isToday && !disabled && <span className="sdp-today-dot" />}
                </button>
              )
            })}
          </div>

          {/* footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
            <span style={{ fontFamily: ROUND, fontWeight: 700, fontSize: '0.55rem', color: T.inkSoft }}>
              {value ? value : 'pick a date 🩵'}
            </span>
            <button type="button" className="sdp-jump" onClick={goToday}>Today</button>
          </div>
        </div>
      )}
    </div>
  )
}