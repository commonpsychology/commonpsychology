import { useState, useEffect } from 'react'

// Global tiny event bus so any page can push a log line without prop-drilling.
const listeners = new Set()
export function logBookingStep(label, detail) {
  const entry = { time: new Date().toLocaleTimeString(), label, detail }
  listeners.forEach(fn => fn(entry))
  console.log(`[booking] ${label}`, detail)
}

export default function BookingDebugPanel() {
  const [logs, setLogs] = useState([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const fn = entry => setLogs(l => [...l.slice(-49), entry])
    listeners.add(fn)
    return () => listeners.delete(fn)
  }, [])

  // Only show in the URL has ?debug=1, so it never appears for normal users
  const enabled = typeof window !== 'undefined' && window.location.search.includes('debug=1')
  if (!enabled) return null

  return (
    <div style={{ position:'fixed', bottom:12, right:12, zIndex:999999, fontFamily:'monospace' }}>
      <button onClick={() => setOpen(o => !o)} style={{ padding:'8px 12px', background:'#111', color:'#0f0', border:'none', borderRadius:8, fontSize:12, cursor:'pointer' }}>
        🐛 Debug ({logs.length})
      </button>
      {open && (
        <div style={{ marginTop:8, width:420, maxHeight:400, overflowY:'auto', background:'#111', color:'#0f0', padding:10, borderRadius:8, fontSize:11, lineHeight:1.5 }}>
          {logs.length === 0 && <div>No events yet.</div>}
          {logs.map((l, i) => (
            <div key={i} style={{ marginBottom:6, borderBottom:'1px solid #333', paddingBottom:6 }}>
              <div style={{ color:'#0af' }}>{l.time} — {l.label}</div>
              <pre style={{ whiteSpace:'pre-wrap', margin:0, color:'#fff' }}>{JSON.stringify(l.detail, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}