// UmbrellaPage.jsx — paste the <svg> block inside your component's return
// CHANGES FROM ORIGINAL:
//   1. Whole scene is now a clickable link to /integrate (keyboard accessible too).
//   2. The center figure + umbrella group gets an extra hover "lift" so it visibly
//      reads as the thing you're meant to click.
import React, { useState } from 'react'

export default function UmbrellaPage({ onNavigate }) {
  const [hovering, setHovering] = useState(false)

  const goToIntegrate = () => {
    if (onNavigate) {
      onNavigate('/integrate')
    } else if (typeof window !== 'undefined') {
      window.location.href = '/integrate'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      goToIntegrate()
    }
  }

  return (
    <section style={{
      width: '100%',
      background: '#060d1a',
      padding: '2rem 1rem 3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Fade in from the light News section above — soft eased band */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 'clamp(60px, 12vw, 140px)',
        background: 'linear-gradient(to top, rgba(219,234,254,0) 0%, rgba(219,234,254,0.15) 45%, rgba(219,234,254,0.55) 78%, var(--blue-mist) 100%)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      {/* Fade toward the light Services section below — soft eased band */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: 'clamp(60px, 12vw, 140px)',
        background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.55) 78%, var(--white) 100%)',
        pointerEvents: 'none', zIndex: 1,
      }} />
      <svg
        width="100%"
        viewBox="0 0 680 700"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: 820, cursor: 'pointer' }}
        role="link"
        tabIndex={0}
        aria-label="हामी एक हौँ — join the community. Three figures sheltering together under one umbrella in a stormy night. Activate to go to the integration page."
        onClick={goToIntegrate}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <defs>
          <style>{`
            @keyframes fall {
              0%   { transform: translateY(-20px); opacity: 0; }
              6%   { opacity: 0.7; }
              88%  { opacity: 0.6; }
              100% { transform: translateY(480px); opacity: 0; }
            }
            @keyframes sway {
              0%,100% { transform: rotate(-1.2deg); }
              50%     { transform: rotate(1.2deg); }
            }
            @keyframes flicker {
              0%,100% { opacity: 1; }
              48%     { opacity: 1; }
              50%     { opacity: 0.15; }
              52%     { opacity: 1; }
              78%     { opacity: 1; }
              80%     { opacity: 0.3; }
              82%     { opacity: 1; }
            }
            @keyframes lightpulse {
              0%,100% { opacity: 0.18; }
              50%     { opacity: 0.28; }
            }
            @keyframes ctaPulse {
              0%,100% { opacity: 0.22; }
              50%     { opacity: 0.4; }
            }
            .rdrop { animation: fall linear infinite; }
            .umb   { transform-origin: 340px 350px; animation: sway 5s ease-in-out infinite; transition: transform 0.35s ease; }
            .lamp  { animation: flicker 7s ease-in-out infinite; }
            .glow  { animation: lightpulse 3s ease-in-out infinite; }
            .cta-ring { animation: ctaPulse 2.4s ease-in-out infinite; transition: opacity 0.3s ease; }
            .center-figure { transition: transform 0.35s ease; transform-origin: 340px 450px; }
          `}</style>

          <radialGradient id="warmGlow" cx="50%" cy="100%" r="60%">
            <stop offset="0%"   stopColor="#f59e2a" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#f59e2a" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="umbGlow" cx="50%" cy="60%" r="55%">
            <stop offset="0%"   stopColor="#1a3a6e" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#0a1628" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="ctaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#f5d06a" stopOpacity="0.55"/>
            <stop offset="100%" stopColor="#f5d06a" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#060d1a"/>
            <stop offset="50%"  stopColor="#0d1e36"/>
            <stop offset="100%" stopColor="#122040"/>
          </linearGradient>
          <linearGradient id="umbTop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1b4fc4"/>
            <stop offset="100%" stopColor="#0f3490"/>
          </linearGradient>
          <linearGradient id="umbSheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#ffffff" stopOpacity="0"/>
            <stop offset="35%"  stopColor="#ffffff" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0e2040"/>
            <stop offset="100%" stopColor="#060d1a"/>
          </linearGradient>
          <linearGradient id="puddleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1a3a6e" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#0a1628" stopOpacity="0.4"/>
          </linearGradient>
          <linearGradient id="lampPost" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#2a3d52"/>
            <stop offset="100%" stopColor="#131f2e"/>
          </linearGradient>
            <filter id="softBlur"><feGaussianBlur stdDeviation="3"/></filter>
          <filter id="tinyBlur"><feGaussianBlur stdDeviation="1.2"/></filter>
          <clipPath id="canopyClip">
            <path d="M158,350 Q188,258 340,242 Q492,258 522,350 Z"/>
          </clipPath>
        </defs>

        {/* Sky */}
        <rect width="680" height="700" fill="url(#skyGrad)"/>

        {/* Storm clouds */}
        <ellipse cx="120" cy="55"  rx="140" ry="52" fill="#0e1e32" opacity="0.95"/>
        <ellipse cx="90"  cy="48"  rx="90"  ry="40" fill="#111f32" opacity="0.9"/>
        <ellipse cx="360" cy="42"  rx="160" ry="58" fill="#0b1726" opacity="0.95"/>
        <ellipse cx="460" cy="50"  rx="130" ry="48" fill="#0d1b2e" opacity="0.92"/>
        <ellipse cx="580" cy="38"  rx="120" ry="44" fill="#0c1928" opacity="0.9"/>
        <ellipse cx="240" cy="80"  rx="130" ry="42" fill="#0c1a2e" opacity="0.65"/>
        <ellipse cx="430" cy="75"  rx="150" ry="46" fill="#0b1828" opacity="0.7"/>

        {/* Lightning */}
        <polyline points="490,28 478,68 490,68 474,108" stroke="#c9d8f8" strokeWidth="1.5" fill="none" opacity="0.45"/>
        <polyline points="490,28 478,68 490,68 474,108" stroke="#ffffff"  strokeWidth="0.5"  fill="none" opacity="0.6"/>

        {/* Buildings */}
        <rect x="0"   y="310" width="45"  height="220" fill="#070e1c"/>
        <rect x="30"  y="275" width="30"  height="255" fill="#080f1e"/>
        <rect x="65"  y="260" width="38"  height="270" fill="#070d1c"/>
        <rect x="560" y="290" width="30"  height="240" fill="#07101e"/>
        <rect x="578" y="265" width="38"  height="265" fill="#060c1a"/>
        <rect x="625" y="275" width="30"  height="255" fill="#070d1a"/>
        <rect x="648" y="310" width="32"  height="220" fill="#060b18"/>
        {/* Windows */}
        <rect x="36" y="285" rx="1" ry="1" width="5" height="4" fill="#f5a623" opacity="0.5"/>
        <rect x="72" y="268" rx="1" ry="1" width="5" height="4" fill="#f5a623" opacity="0.45"/>
        <rect x="565" y="300" rx="1" ry="1" width="5" height="4" fill="#f5a623" opacity="0.45"/>
        <rect x="614" y="304" rx="1" ry="1" width="5" height="4" fill="#f5a623" opacity="0.5"/>

        {/* Lamp left */}
        <rect x="146" y="220" width="7" height="320" fill="url(#lampPost)"/>
        <rect x="140" y="215" width="20" height="8" rx="3" ry="3" fill="#2a3d52"/>
        <path d="M147,215 Q148,195 162,190 Q175,188 178,200 L178,215" fill="none" stroke="#2a3d52" strokeWidth="4" strokeLinecap="round"/>
        <rect x="168" y="187" width="22" height="11" rx="3" ry="3" fill="#2a3d52"/>
        <ellipse cx="179" cy="188" rx="12" ry="8" fill="#f5d06a" className="lamp" opacity="0.9" filter="url(#tinyBlur)"/>
        <path d="M162,198 Q179,330 110,545 L248,545 Q230,330 196,198 Z" fill="url(#warmGlow)" opacity="0.85" className="glow"/>

        {/* Lamp right */}
        <rect x="527" y="220" width="7" height="320" fill="url(#lampPost)"/>
        <rect x="521" y="215" width="20" height="8" rx="3" ry="3" fill="#2a3d52"/>
        <path d="M534,215 Q533,195 519,190 Q506,188 503,200 L503,215" fill="none" stroke="#2a3d52" strokeWidth="4" strokeLinecap="round"/>
        <rect x="490" y="187" width="22" height="11" rx="3" ry="3" fill="#2a3d52"/>
        <ellipse cx="501" cy="188" rx="12" ry="8" fill="#f5d06a" className="lamp" opacity="0.9" filter="url(#tinyBlur)"/>
        <path d="M512,198 Q501,330 432,545 L572,545 Q562,330 528,198 Z" fill="url(#warmGlow)" opacity="0.85" className="glow"/>

        {/* Rain back */}
        <g fill="none" stroke="#5c8ab0" strokeWidth="0.8" strokeLinecap="round" opacity="0.4">
          {[
            [55,100,51,128,'1.1s','0.0s'],[100,90,96,118,'0.95s','0.3s'],[248,98,244,126,'0.88s','0.45s'],
            [345,92,341,120,'0.95s','0.1s'],[440,95,436,123,'1.0s','0.8s'],[536,102,532,130,'1.12s','0.55s'],
            [628,98,624,126,'0.88s','0.2s'],[78,145,74,173,'1.02s','0.5s'],[316,125,312,153,'1.1s','0.05s'],
            [460,138,456,166,'1.08s','0.75s'],[604,120,600,148,'1.0s','0.8s'],
          ].map(([x1,y1,x2,y2,dur,del],i) => (
            <line key={i} className="rdrop" x1={x1} y1={y1} x2={x2} y2={y2}
                  style={{animationDuration:dur, animationDelay:del}}/>
          ))}
        </g>

        {/* Rain front */}
        <g fill="none" stroke="#8ab8d8" strokeWidth="1.2" strokeLinecap="round" opacity="0.65">
          {[
            [42,155,37,191,'0.9s','0.2s'],[133,160,128,196,'0.88s','0.0s'],[224,158,219,194,'0.95s','0.35s'],
            [315,155,310,191,'0.85s','0.1s'],[408,160,403,196,'0.92s','0.8s'],[500,158,495,194,'0.88s','0.55s'],
            [592,162,587,198,'0.95s','0.3s'],[637,168,632,204,'1.0s','0.6s'],[108,228,103,264,'0.9s','0.1s'],
            [202,232,197,268,'0.88s','0.5s'],[295,230,290,266,'0.92s','0.65s'],[388,228,383,264,'0.95s','0.4s'],
            [482,230,477,266,'0.88s','0.3s'],[574,228,569,264,'0.9s','0.15s'],[660,230,655,266,'0.95s','0.25s'],
          ].map(([x1,y1,x2,y2,dur,del],i) => (
            <line key={i} className="rdrop" x1={x1} y1={y1} x2={x2} y2={y2}
                  style={{animationDuration:dur, animationDelay:del}}/>
          ))}
        </g>

        {/* Ground */}
        <rect x="0" y="528" width="680" height="172" fill="url(#groundGrad)"/>
        <ellipse cx="179" cy="545" rx="38" ry="8"  fill="url(#puddleGrad)" opacity="0.6"/>
        <ellipse cx="340" cy="555" rx="80" ry="11" fill="url(#puddleGrad)" opacity="0.5"/>
        <ellipse cx="501" cy="545" rx="38" ry="8"  fill="url(#puddleGrad)" opacity="0.6"/>

        {/* Soft gold "click me" halo behind the center figure — brightens on hover */}
        <ellipse
          cx="340" cy="470" rx="150" ry="150"
          fill="url(#ctaGlow)"
          className="cta-ring"
          opacity={hovering ? 0.55 : 0.22}
        />

        {/* Left figure */}
        <g stroke="#d4824a" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="252" cy="450" r="16" fill="#c47040" stroke="#d4824a"/>
          <path d="M238,466 Q228,492 224,524 Q230,530 252,532 Q274,530 280,524 Q276,492 266,466 Z" fill="#1a3a5c" stroke="#1a3a5c"/>
          <path d="M266,474 Q290,460 318,450" stroke="#c47040" strokeWidth="2.8"/>
          <path d="M238,474 Q222,488 218,508" stroke="#c47040" strokeWidth="2.5"/>
          <path d="M240,528 Q234,548 230,558" stroke="#0d2238" strokeWidth="5" strokeLinecap="round"/>
          <path d="M264,528 Q268,548 272,558" stroke="#0d2238" strokeWidth="5" strokeLinecap="round"/>
          <ellipse cx="228" cy="561" rx="14" ry="5" fill="#0d2238" stroke="none"/>
          <ellipse cx="274" cy="561" rx="14" ry="5" fill="#0d2238" stroke="none"/>
        </g>

        {/* Center figure — the community's "join" figure. Lifts slightly on hover. */}
        <g
          className="center-figure"
          style={{ transform: hovering ? 'translateY(-6px) scale(1.03)' : 'none' }}
        >
          <g stroke="#f0a030" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="340" cy="438" r="20" fill="#e08820" stroke="#f0a030"/>
            <path d="M320,442 Q322,418 340,414 Q358,418 360,442" fill="#1a4a8a" stroke="#1a4a8a"/>
            <path d="M322,456 Q308,488 306,524 Q316,534 340,536 Q364,534 374,524 Q372,488 358,456 Z" fill="#1a4a8a" stroke="#1a4a8a"/>
            <circle cx="340" cy="472" r="2.5" fill="#7aa8e0" stroke="none"/>
            <circle cx="340" cy="487" r="2.5" fill="#7aa8e0" stroke="none"/>
            {/* Right arm raised up to grip handle at 340,428 */}
            <path d="M355,456 Q358,440 340,430" stroke="#e08820" strokeWidth="3"/>
            {/* Left arm — unchanged */}
            <path d="M322,462 Q295,478 278,488" stroke="#e08820" strokeWidth="2.8"/>
            <path d="M322,532 Q316,550 312,562" stroke="#0d2238" strokeWidth="6" strokeLinecap="round"/>
            <path d="M358,532 Q364,550 368,562" stroke="#0d2238" strokeWidth="6" strokeLinecap="round"/>
            <ellipse cx="310" cy="565" rx="16" ry="5.5" fill="#0d2238" stroke="none"/>
            <ellipse cx="370" cy="565" rx="16" ry="5.5" fill="#0d2238" stroke="none"/>
          </g>
        </g>

        {/* Right figure */}
        <g stroke="#d4824a" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="428" cy="450" r="16" fill="#c47040" stroke="#d4824a"/>
          <path d="M414,466 Q404,492 400,524 Q406,530 428,532 Q450,530 456,524 Q452,492 442,466 Z" fill="#1e3a5a" stroke="#1e3a5a"/>
          <path d="M414,474 Q390,480 362,488" stroke="#c47040" strokeWidth="2.5"/>
          <path d="M442,474 Q458,488 462,508" stroke="#c47040" strokeWidth="2.5"/>
          <path d="M416,528 Q410,548 406,558" stroke="#0d2238" strokeWidth="5" strokeLinecap="round"/>
          <path d="M440,528 Q444,548 448,558" stroke="#0d2238" strokeWidth="5" strokeLinecap="round"/>
          <ellipse cx="404" cy="561" rx="14" ry="5" fill="#0d2238" stroke="none"/>
          <ellipse cx="450" cy="561" rx="14" ry="5" fill="#0d2238" stroke="none"/>
        </g>

        {/* Clasped hands */}
        <ellipse cx="278" cy="492" rx="10" ry="7" fill="#c47040" stroke="#d4824a" strokeWidth="1.5"/>
        <ellipse cx="362" cy="492" rx="10" ry="7" fill="#c47040" stroke="#d4824a" strokeWidth="1.5"/>

        {/* Hand gripping umbrella shaft */}
        <ellipse cx="340" cy="428" rx="9" ry="6" fill="#e08820" stroke="#f0a030" strokeWidth="1.5"/>

        {/* Umbrella — lifted ~90px vs original, "opens" slightly wider on hover */}
        <g className="umb" style={{ transform: hovering ? 'scale(1.02)' : 'none' }}>
          <ellipse cx="340" cy="350" rx="190" ry="38" fill="url(#umbGlow)" opacity="0.5" filter="url(#softBlur)"/>
          {/* Canopy: tip at y=241, hem at y=350 */}
          <path d="M158,350 Q188,258 340,242 Q492,258 522,350 Z" fill="url(#umbTop)"/>
          {/* Ribs */}
          <line x1="340" y1="241" x2="158" y2="350" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="241" x2="215" y2="254" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="241" x2="272" y2="242" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="241" x2="340" y2="350" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="241" x2="408" y2="242" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="241" x2="465" y2="254" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="241" x2="522" y2="350" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          {/* Scalloped hem at y=350/375 */}
          <path d="M158,350 Q168,375 180,350 Q192,375 204,350 Q216,375 228,350 Q240,375 252,350 Q264,375 276,350 Q288,375 300,350 Q312,375 324,350 Q332,375 340,350 Q348,375 356,350 Q368,375 380,350 Q392,375 404,350 Q416,375 428,350 Q440,375 452,350 Q464,375 476,350 Q488,375 500,350 Q510,375 522,350"
                fill="#0f3aa8" stroke="#0a2878" strokeWidth="1" opacity="0.95"/>
            {/* Sheen overlay */}
          <path d="M158,350 Q188,258 340,242 Q492,258 522,350" fill="url(#umbSheen)" opacity="0.9"/>
          <path d="M228,256 Q280,244 340,242" fill="none" stroke="#c8d8f8" strokeWidth="1.5" opacity="0.25" strokeLinecap="round"/>

          {/* Faint interfaith symbols woven into the canopy fabric */}
          <g clipPath="url(#canopyClip)" opacity="0.3">
            <g stroke="#dbe9ff" fill="none" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">

              {/* Christianity — cross */}
              <g transform="translate(196,300) scale(0.55)">
                <line x1="50" y1="8" x2="50" y2="92"/>
                <line x1="22" y1="34" x2="78" y2="34"/>
              </g>

              {/* Islam — crescent + star */}
              <g transform="translate(240,270) scale(0.42)">
                <path d="M62,15 A38,38 0 1 0 62,85 A30,30 0 1 1 62,15 Z"/>
                <path d="M80,28 l3,7 7,1 -5,5 1,7 -6,-4 -6,4 1,-7 -5,-5 7,-1 z"/>
              </g>

              {/* Judaism — star of David */}
              <g transform="translate(288,254) scale(0.4)">
                <polygon points="50,10 88,72 12,72"/>
                <polygon points="50,90 12,28 88,28"/>
              </g>

              {/* Hinduism — Om */}
              <text x="340" y="268" textAnchor="middle" fontSize="26"
                fontFamily="'Noto Sans Devanagari', serif" fill="#dbe9ff" stroke="none">ॐ</text>

              {/* Buddhism — dharma wheel */}
              <g transform="translate(390,255) scale(0.36)">
                <circle cx="50" cy="50" r="36"/>
                <circle cx="50" cy="50" r="6"/>
                {Array.from({ length: 8 }, (_, i) => {
                  const a = (i * 45 * Math.PI) / 180
                  return (
                    <line key={i} x1="50" y1="50"
                      x2={50 + 34 * Math.cos(a)} y2={50 + 34 * Math.sin(a)} />
                  )
                })}
              </g>

              {/* Sikhism — khanda-style circle & blades */}
              <g transform="translate(438,272) scale(0.38)">
                <circle cx="50" cy="50" r="34"/>
                <line x1="50" y1="12" x2="50" y2="88"/>
                <line x1="22" y1="26" x2="66" y2="82"/>
                <line x1="78" y1="26" x2="34" y2="82"/>
              </g>

              {/* Taoism — yin yang */}
              <g transform="translate(478,304) scale(0.34)">
                <circle cx="50" cy="50" r="36"/>
                <path d="M50,14 A18,18 0 0 1 50,50 A18,18 0 0 0 50,86 A36,36 0 0 0 50,14 Z" fill="#dbe9ff" stroke="none"/>
                <circle cx="50" cy="32" r="5"/>
                <circle cx="50" cy="68" r="5" fill="#0f3490" stroke="none"/>
              </g>

              {/* Shinto — torii gate */}
              <g transform="translate(220,326) scale(0.36)">
                <line x1="22" y1="30" x2="22" y2="90"/>
                <line x1="78" y1="30" x2="78" y2="90"/>
                <path d="M10,28 Q50,10 90,28"/>
                <line x1="16" y1="42" x2="84" y2="42"/>
              </g>

              {/* Bahá'í — nine-pointed star */}
              <g transform="translate(340,326) scale(0.3)">
                <polygon points="50,12 55.47,34.97 74.43,20.89 63.86,42 87.43,43.4 65.76,52.78 82.9,69 60.29,62.26 63,85.7 50,66 37,85.7 39.71,62.26 17.1,69 34.24,52.78 12.57,43.4 36.14,42 25.57,20.89 44.53,34.97"/>
              </g>

              {/* Jainism — ahimsa hand */}
              <g transform="translate(458,326) scale(0.34)">
                <path d="M50,14 C34,14 26,26 26,40 C26,58 38,66 38,80 L62,80 C62,66 74,58 74,40 C74,26 66,14 50,14 Z"/>
                <line x1="42" y1="26" x2="42" y2="42"/>
                <line x1="50" y1="22" x2="50" y2="42"/>
                <line x1="58" y1="26" x2="58" y2="42"/>
                <circle cx="50" cy="62" r="9"/>
              </g>

            </g>
          </g>

          {/* Tip finial */}
          <ellipse cx="340" cy="241" rx="8"   ry="6.5" fill="#7aaaf2"/>
          <ellipse cx="340" cy="241" rx="3.5" ry="3"   fill="#ddeeff"/>
          {/* Shaft from tip down to hand */}
          <line x1="340" y1="242" x2="340" y2="428" stroke="#2c3e50" strokeWidth="6" strokeLinecap="round"/>
          {/* Crook curving left, tip resting at y=428 */}
          <path d="M340,428 Q340,450 318,450 Q296,450 296,428" fill="none" stroke="#2c3e50" strokeWidth="6" strokeLinecap="round"/>
          <circle cx="296" cy="428" r="9" fill="#1a2738"/>
          <circle cx="296" cy="428" r="4" fill="#2c3e50"/>
        </g>

        {/* Text */}
        <line x1="230" y1="590" x2="450" y2="590" stroke="#1a3a6e" strokeWidth="0.8" opacity="0.6"/>
        <text x="340" y="622"
              fontFamily="'Noto Sans Devanagari','Arial Unicode MS',Arial,sans-serif"
              fontSize="30" fontWeight="600" fill="#90c0f0" textAnchor="middle" letterSpacing="2">
          हामी एक हौँ
        </text>
        <text x="340" y="648"
              fontFamily="Georgia,'Times New Roman',serif"
              fontSize="13" fill="#4a7aaa" textAnchor="middle" letterSpacing="1.5" fontStyle="italic">
          under one umbrella — we are one
        </text>
        <line x1="230" y1="662" x2="450" y2="662" stroke="#1a3a6e" strokeWidth="0.8" opacity="0.6"/>
        <ellipse cx="340" cy="675" rx="210" ry="7" fill="#05101e" opacity="0.5"/>

        {/* Tiny call-to-action label, only visible on hover, sits just under the figures */}
      
      </svg>
    </section>
  )
}