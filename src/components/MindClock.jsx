import { useEffect, useRef } from 'react'

const MOODS = [
  [0,5,"Good Morning"],[5,8,"Good Morning"],
  [8,11,"Midday"],[11,13,"Midday "],
  [13,16,"Dusk Descends"],[16,19,"Dusk Descends"],
  [19,22,"Nights Calm"],[22,24,"Nights Calm "]
]
const COLORS = [
  [0,6,"#3C3489","#534AB7"],[6,9,"#854F0B","#BA7517"],
  [9,12,"#085041","#1D9E75"],[12,15,"#185FA5","#378ADD"],
  [15,18,"#993C1D","#D85A30"],[18,21,"#534AB7","#7F77DD"],
  [21,24,"#26215C","#3C3489"]
]

const CSS = `
@keyframes mc-orbit1{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
@keyframes mc-orbit2{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
@keyframes mc-orbit3{from{transform:rotate(30deg)}to{transform:rotate(390deg)}}
@keyframes mc-breathe{0%,100%{opacity:.12}50%{opacity:.28}}
@keyframes mc-node-pulse{0%,100%{r:3.5;opacity:.7}50%{r:5;opacity:1}}
@keyframes mc-shimmer{0%,100%{opacity:.06}50%{opacity:.18}}
.mc-ring1{transform-origin:100px 100px;animation:mc-orbit1 18s linear infinite}
.mc-ring2{transform-origin:100px 100px;animation:mc-orbit2 28s linear infinite}
.mc-ring3{transform-origin:100px 100px;animation:mc-orbit3 42s linear infinite}
.mc-breath{animation:mc-breathe 3.6s ease-in-out infinite}
.mc-node-p{animation:mc-node-pulse 2.8s ease-in-out infinite}
.mc-shimmer{animation:mc-shimmer 4s ease-in-out infinite}
`

function inject(id, css) {
  if (document.getElementById(id)) return
  const s = document.createElement('style'); s.id = id; s.textContent = css
  document.head.appendChild(s)
}

function get(h, arr) { return arr.find(([s,e]) => h >= s && h < e) }

export default function MindfulClock() {
  const ref = useRef(null)
  const timer = useRef(null)

  useEffect(() => {
    inject('mc-css', CSS)

    // Build tick marks once
    const svg = ref.current
    if (!svg) return
    const marksG = svg.getElementById('mc-marks')
    if (marksG && !marksG.children.length) {
      const ns = 'http://www.w3.org/2000/svg'
      for (let i = 0; i < 60; i++) {
        const a = (i/60)*2*Math.PI - Math.PI/2
        const isH = i % 5 === 0
        const r1 = isH ? 56 : 60, r2 = isH ? 65 : 63
        const l = document.createElementNS(ns, 'line')
        l.setAttribute('x1', 100+r1*Math.cos(a)); l.setAttribute('y1', 100+r1*Math.sin(a))
        l.setAttribute('x2', 100+r2*Math.cos(a)); l.setAttribute('y2', 100+r2*Math.sin(a))
        l.setAttribute('stroke', isH ? '#534AB7' : '#AFA9EC')
        l.setAttribute('stroke-width', isH ? '1.5' : '0.6')
        l.setAttribute('stroke-linecap', 'round')
        l.setAttribute('opacity', isH ? '0.8' : '0.5')
        marksG.appendChild(l)
      }
    }

    function tick() {
      const now = new Date()
      const h = now.getHours(), m = now.getMinutes(), s = now.getSeconds(), ms = now.getMilliseconds()
      const mood = get(h, MOODS)
      const col  = get(h, COLORS)
      const light = col ? col[3] : '#7F77DD'
      const accent = col ? col[2] : '#3C3489'
      const fmt = v => String(v).padStart(2,'0')

      const timeEl = document.getElementById('mc-time-el')
      const moodEl = document.getElementById('mc-mood-el')
      if (timeEl) timeEl.textContent = fmt(h) + ':' + fmt(m)
      if (moodEl) { moodEl.textContent = mood?.[2] ?? 'breathe'; moodEl.style.color = light }

      const secEl = svg.getElementById('mc-sec')
      const arcEl = svg.getElementById('mc-arc')
      const dot   = svg.querySelector('circle[r="5"]')
      if (secEl) secEl.setAttribute('stroke', light)
      if (dot)   dot.setAttribute('fill', accent)
      if (arcEl) {
        arcEl.setAttribute('stroke', light)
        const frac = (h*3600+m*60+s)/86400
        arcEl.setAttribute('stroke-dashoffset', (2*Math.PI*76*(1-frac)).toFixed(1))
      }
      const sa = (s+ms/1000)/60*360
      const ma = (m+(s+ms/1000)/60)/60*360
      const ha = ((h%12)+m/60+s/3600)/12*360
      svg.getElementById('mc-sec')?.setAttribute('transform',`rotate(${sa.toFixed(2)},100,100)`)
      svg.getElementById('mc-min')?.setAttribute('transform',`rotate(${ma.toFixed(2)},100,100)`)
      svg.getElementById('mc-hr')?.setAttribute('transform', `rotate(${ha.toFixed(2)},100,100)`)
    }

    tick()
    timer.current = setInterval(tick, 200)
    return () => clearInterval(timer.current)
  }, [])

  return (
    <div style={{ position:'absolute', top:'4.90rem', right:'1.5rem', zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <svg ref={ref} id="mc-svg-main" viewBox="0 0 200 200" width="190" height="190" style={{ overflow:'visible' }} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mc-face-grad" cx="42%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#f8f6ff"/>
            <stop offset="100%" stopColor="#e8e4f8"/>
          </radialGradient>
        </defs>
        <circle cx="100" cy="100" r="94" fill="none" stroke="#7F77DD" strokeWidth="0.6" className="mc-breath" opacity="0.2"/>
        <g className="mc-ring1">
          <circle cx="100" cy="12" r="2.5" fill="#534AB7" opacity="0.5" className="mc-node-p"/>
          <circle cx="188" cy="100" r="2" fill="#7F77DD" opacity="0.4"/>
          <circle cx="100" cy="188" r="2.5" fill="#534AB7" opacity="0.5"/>
          <circle cx="12" cy="100" r="2" fill="#7F77DD" opacity="0.4"/>
          <circle cx="162" cy="38" r="1.5" fill="#AFA9EC" opacity="0.5"/>
          <circle cx="162" cy="162" r="1.5" fill="#AFA9EC" opacity="0.5"/>
          <circle cx="38" cy="162" r="1.5" fill="#AFA9EC" opacity="0.5"/>
          <circle cx="38" cy="38" r="1.5" fill="#AFA9EC" opacity="0.5"/>
        </g>
        <g className="mc-ring2">
          <ellipse cx="100" cy="100" rx="88" ry="88" fill="none" stroke="#AFA9EC"
            strokeWidth="0.5" strokeDasharray="4 8" opacity="0.3"/>
        </g>
        <g className="mc-ring3">
          <path d="M100,18 A82,82 0 0,1 182,100" fill="none" stroke="#534AB7" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>
          <path d="M100,182 A82,82 0 0,1 18,100" fill="none" stroke="#534AB7" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>
        </g>
        <circle cx="100" cy="100" r="72" fill="url(#mc-face-grad)" stroke="#7F77DD" strokeWidth="0.8" opacity="0.95"/>
        <circle cx="100" cy="100" r="68" fill="none" stroke="#7F77DD" strokeWidth="0.4" className="mc-shimmer"/>
        <circle id="mc-arc" cx="100" cy="100" r="76"
          fill="none" stroke="#7F77DD" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="477.5" strokeDashoffset="477.5"
          transform="rotate(-90 100 100)" opacity="0.45"/>
        <g id="mc-marks"/>
        <line id="mc-hr"  x1="100" y1="100" x2="100" y2="52" stroke="#26215C" strokeWidth="3"  strokeLinecap="round"/>
        <line id="mc-min" x1="100" y1="106" x2="100" y2="38" stroke="#3C3489" strokeWidth="2"  strokeLinecap="round"/>
        <line id="mc-sec" x1="100" y1="110" x2="100" y2="32" stroke="#7F77DD" strokeWidth="1"  strokeLinecap="round"/>
        <circle cx="100" cy="100" r="5" fill="#534AB7"/>
        <circle cx="100" cy="100" r="2.5" fill="#f8f6ff"/>
        <circle cx="100" cy="30" r="3" fill="#7F77DD" opacity="0.8"/>
        <circle cx="100" cy="30" r="1.5" fill="white" opacity="0.6"/>
      </svg>
      <div style={{ textAlign:'center' }}>
        <div id="mc-time-el" style={{ fontFamily:'Georgia,serif', fontSize:'1.2rem', fontWeight:500, color:'#3C3489', letterSpacing:'0.06em' }}>--:--</div>
        <div id="mc-mood-el" style={{ fontSize:'0.7rem', color:'#7F77DD', fontStyle:'italic', marginTop:3, letterSpacing:'0.03em' }}>breathe</div>
      </div>
    </div>
  )
}