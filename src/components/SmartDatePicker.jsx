// src/components/SmartDatePicker.jsx
import { useState, useRef, useEffect, useId } from 'react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const WEEKDAYS = ['S','M','T','W','T','F','S']

// ---- Design tokens -------------------------------------------------------
// A quiet "desk ledger" palette: cool paper, ink-navy text, a deep teal for
// commitments (selected dates), and a small stamp-red dot for "today" —
// like a rubber date-stamp in a physical planner.
const T = {
  paper:      '#FAFAF8',
  paperLine:  '#E7E4DA',
  ink:        '#1C2431',
  inkSoft:    '#6B7280',
  inkFaint:   '#A9A79C',
  accent:     '#0E6F63',
  accentDeep: '#0B5850',
  accentTint: '#E4F1EE',
  stamp:      '#B23F29',
  disabled:   '#D2D0C6',
  shadow:     '0 18px 40px -12px rgba(28,36,49,0.22), 0 2px 8px rgba(28,36,49,0.06)',
}

const SERIF = '"Source Serif Pro","Iowan Old Style","Palatino Linotype",Georgia,serif'
const MONO  = '"IBM Plex Mono","SF Mono",Menlo,Consolas,monospace'
const SANS  = '-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif'

function toISO(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export default function SmartDatePicker({ value, onChange, minDate, disabledDay, placeholder = 'YYYY-MM-DD' }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(value || '')
  const [viewYear, setViewYear] = useState(value ? +value.slice(0, 4) : new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(value ? +value.slice(5, 7) - 1 : new Date().getMonth())
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 300 })
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const dropRef = useRef(null)
  const scopeId = 'sdp-' + useId().replace(/:/g, '')

  useEffect(() => setText(value || ''), [value])

  // Fixed positioning computed from the input's real screen position —
  // this is what escapes any ancestor's overflow:hidden, unlike position:absolute.
  useEffect(() => {
    if (!open) return
    function calcPos() {
      if (!inputRef.current) return
      const r = inputRef.current.getBoundingClientRect()
      const dropH = 336
      const spaceBelow = window.innerHeight - r.bottom
      const top = spaceBelow >= dropH + 10 ? r.bottom + 8 : Math.max(8, r.top - dropH - 8)
      setDropPos({ top, left: r.left, width: Math.max(300, r.width) })
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
        .${scopeId} .sdp-input:hover { border-color: ${T.inkFaint} !important; }
        .${scopeId} .sdp-navbtn { background: transparent; border: none; cursor: pointer; color: ${T.inkSoft}; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; transition: background .15s, color .15s; }
        .${scopeId} .sdp-navbtn:hover { background: ${T.accentTint}; color: ${T.accentDeep}; }
        .${scopeId} select.sdp-sel { appearance: none; -webkit-appearance: none; background: transparent; border: none; cursor: pointer; color: ${T.ink}; font-family: ${SERIF}; font-style: italic; font-size: 1.02rem; padding: 2px 20px 2px 4px; border-radius: 6px; }
        .${scopeId} select.sdp-sel:hover { background: ${T.accentTint}; }
        .${scopeId} select.sdp-year { font-style: normal; font-family: ${MONO}; font-size: 0.82rem; color: ${T.inkSoft}; }
        .${scopeId} .sdp-day { position: relative; border: none; cursor: pointer; font-family: ${SERIF}; font-size: 0.86rem; width: 100%; aspect-ratio: 1; border-radius: 9px; display: flex; align-items: center; justify-content: center; transition: background .12s, color .12s, transform .1s; background: transparent; color: ${T.ink}; }
        .${scopeId} .sdp-day:hover:not(:disabled) { background: ${T.accentTint}; }
        .${scopeId} .sdp-day:active:not(:disabled) { transform: scale(0.92); }
        .${scopeId} .sdp-day:disabled { color: ${T.disabled}; cursor: not-allowed; }
        .${scopeId} .sdp-day.selected { background: ${T.accent}; color: #fff; }
        .${scopeId} .sdp-day.selected:hover { background: ${T.accentDeep}; }
        .${scopeId} .sdp-today-dot { position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%); width: 4px; height: 4px; border-radius: 50%; background: ${T.stamp}; }
        .${scopeId} .sdp-day.selected .sdp-today-dot { background: #fff; }
        .${scopeId} .sdp-grid { animation: sdp-fade-${scopeId} .16s ease; }
        .${scopeId} .sdp-jump { background: transparent; border: none; cursor: pointer; font-family: ${MONO}; font-size: 0.7rem; letter-spacing: 0.06em; text-transform: uppercase; color: ${T.accentDeep}; padding: 5px 9px; border-radius: 7px; transition: background .15s; }
        .${scopeId} .sdp-jump:hover { background: ${T.accentTint}; }
        @keyframes sdp-fade-${scopeId} { from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sdp-pop-${scopeId} { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
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
          padding: '0.72rem 0.95rem',
          border: `1.5px solid ${focused ? T.accent : T.paperLine}`,
          borderRadius: 10,
          width: '100%',
          boxSizing: 'border-box',
          fontSize: '0.88rem',
          fontFamily: MONO,
          letterSpacing: '0.01em',
          color: T.ink,
          background: T.paper,
          outline: 'none',
          boxShadow: focused ? `0 0 0 3px ${T.accentTint}` : 'none',
          transition: 'border-color .15s, box-shadow .15s',
        }}
      />

      {open && (
        <div
          ref={dropRef}
          style={{
            position: 'fixed', zIndex: 99999,
            top: dropPos.top, left: dropPos.left, width: dropPos.width,
            background: T.paper,
            border: `1px solid ${T.paperLine}`,
            borderLeft: `3px solid ${T.accent}`,
            borderRadius: 14,
            boxShadow: T.shadow,
            padding: '0.95rem 1rem 0.85rem',
            animation: `sdp-pop-${scopeId} .14s ease`,
          }}
        >
          {/* header: month/year + nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.55rem' }}>
            <button type="button" className="sdp-navbtn" onClick={() => stepMonth(-1)} aria-label="Previous month">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <select
                className="sdp-sel"
                value={viewMonth}
                onChange={e => setViewMonth(+e.target.value)}
                aria-label="Month"
              >
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
              <select
                className="sdp-sel sdp-year"
                value={viewYear}
                onChange={e => setViewYear(+e.target.value)}
                aria-label="Year"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <button type="button" className="sdp-navbtn" onClick={() => stepMonth(1)} aria-label="Next month">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* hairline rule */}
          <div style={{ height: 1, background: T.paperLine, margin: '0 -2px 0.6rem' }} />

          {/* weekday header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 4 }}>
            {WEEKDAYS.map((d, i) => (
              <div key={i} style={{ textAlign: 'center', fontFamily: MONO, fontSize: '0.62rem', letterSpacing: '0.08em', color: T.inkFaint, textTransform: 'uppercase', padding: '2px 0' }}>{d}</div>
            ))}
          </div>

          {/* day grid */}
          <div className="sdp-grid" key={monthKey} style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.7rem', paddingTop: '0.6rem', borderTop: `1px solid ${T.paperLine}` }}>
            <span style={{ fontFamily: MONO, fontSize: '0.66rem', color: T.inkFaint, letterSpacing: '0.03em' }}>
              {value ? value : 'no date set'}
            </span>
            <button type="button" className="sdp-jump" onClick={goToday}>Today</button>
          </div>
        </div>
      )}
    </div>
  )
}