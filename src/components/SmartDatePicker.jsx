// src/components/SmartDatePicker.jsx
import { useState, useRef, useEffect } from 'react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function SmartDatePicker({ value, onChange, minDate, disabledDay, placeholder = 'YYYY-MM-DD' }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(value || '')
  const [viewYear, setViewYear] = useState(value ? +value.slice(0,4) : new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(value ? +value.slice(5,7)-1 : new Date().getMonth())
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 280 })
  const inputRef = useRef(null)
  const dropRef  = useRef(null)

  useEffect(() => setText(value || ''), [value])

  // Fixed positioning computed from the input's real screen position —
  // this is what escapes any ancestor's overflow:hidden, unlike position:absolute.
  useEffect(() => {
    if (!open) return
    function calcPos() {
      if (!inputRef.current) return
      const r = inputRef.current.getBoundingClientRect()
      const dropH = 300
      const spaceBelow = window.innerHeight - r.bottom
      const top = spaceBelow >= dropH + 8 ? r.bottom + 6 : Math.max(8, r.top - dropH - 6)
      setDropPos({ top, left: r.left, width: Math.max(280, r.width) })
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
        dropRef.current  && !dropRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function commitText(v) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      const d = new Date(v + 'T00:00')
      if (!isNaN(d) && (!minDate || v >= minDate) && (!disabledDay || !disabledDay(d))) {
        onChange(v)
      }
    }
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1)
  const startOffset = firstOfMonth.getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells = [...Array(startOffset).fill(null), ...Array(daysInMonth)].map((_, i) =>
    i < startOffset ? null : i - startOffset + 1
  )
  const years = Array.from({ length: 12 }, (_, i) => new Date().getFullYear() + i - 1)

  return (
    <>
      <input
        ref={inputRef}
        value={text}
        placeholder={placeholder}
        onChange={e => { setText(e.target.value); commitText(e.target.value) }}
        onFocus={() => setOpen(true)}
        style={{ padding:'0.72rem 1rem', border:'1.5px solid #e2e8f0', borderRadius:12, width:'100%', boxSizing:'border-box', fontSize:'0.88rem', fontFamily:'inherit' }}
      />
      {open && (
        <div
          ref={dropRef}
          style={{
            position:'fixed', zIndex:99999,
            top: dropPos.top, left: dropPos.left, width: dropPos.width,
            background:'#fff', border:'1px solid #e2e8f0', borderRadius:14,
            boxShadow:'0 12px 40px rgba(0,0,0,0.15)', padding:'0.85rem',
          }}
        >
          <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.6rem' }}>
            <select value={viewMonth} onChange={e => setViewMonth(+e.target.value)} style={{ flex:1, padding:'0.35rem' }}>
              {MONTHS.map((m,i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select value={viewYear} onChange={e => setViewYear(+e.target.value)} style={{ padding:'0.35rem' }}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, fontSize:'0.68rem', color:'#94a3b8', marginBottom:4 }}>
            {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} style={{ textAlign:'center' }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
            {cells.map((day, i) => {
              if (!day) return <div key={i} />
              const iso = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
              const dObj = new Date(viewYear, viewMonth, day)
              const disabled = (minDate && iso < minDate) || (disabledDay && disabledDay(dObj))
              const selected = iso === value
              return (
                <button key={i} type="button" disabled={disabled}
                  onClick={() => { onChange(iso); setText(iso); setOpen(false) }}
                  style={{
                    padding:'0.4rem 0', borderRadius:8, border:'none', cursor: disabled?'not-allowed':'pointer',
                    background: selected ? '#0ea5e9' : 'transparent',
                    color: disabled ? '#cbd5e1' : selected ? '#fff' : '#1e293b', fontSize:'0.78rem',
                  }}>{day}</button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}