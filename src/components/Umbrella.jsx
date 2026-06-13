// UmbrellaPage.jsx — paste the <svg> block inside your component's return
import React from 'react'

export default function UmbrellaPage() {
  return (
    <section style={{
      width: '100%',
      background: '#060d1a',
      padding: '2rem 1rem 3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflow: 'hidden',
    }}>
      <svg
        width="100%"
        viewBox="0 0 680 700"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: 820 }}
        role="img"
        aria-label="हामी एक हौँ — Three figures sheltering together under one umbrella in a stormy night"
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
            .rdrop { animation: fall linear infinite; }
            .umb   { transform-origin: 340px 430px; animation: sway 5s ease-in-out infinite; }
            .lamp  { animation: flicker 7s ease-in-out infinite; }
            .glow  { animation: lightpulse 3s ease-in-out infinite; }
          `}</style>

          <radialGradient id="warmGlow" cx="50%" cy="100%" r="60%">
            <stop offset="0%"   stopColor="#f59e2a" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#f59e2a" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="umbGlow" cx="50%" cy="60%" r="55%">
            <stop offset="0%"   stopColor="#1a3a6e" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="#0a1628" stopOpacity="0"/>
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

        {/* Center figure */}
        <g stroke="#f0a030" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="340" cy="438" r="20" fill="#e08820" stroke="#f0a030"/>
          <path d="M320,442 Q322,418 340,414 Q358,418 360,442" fill="#1a4a8a" stroke="#1a4a8a"/>
          <path d="M322,456 Q308,488 306,524 Q316,534 340,536 Q364,534 374,524 Q372,488 358,456 Z" fill="#1a4a8a" stroke="#1a4a8a"/>
          <circle cx="340" cy="472" r="2.5" fill="#7aa8e0" stroke="none"/>
          <circle cx="340" cy="487" r="2.5" fill="#7aa8e0" stroke="none"/>
          <path d="M355,460 Q368,445 346,442" stroke="#e08820" strokeWidth="3"/>
          <path d="M322,462 Q295,478 278,488" stroke="#e08820" strokeWidth="2.8"/>
          <path d="M322,532 Q316,550 312,562" stroke="#0d2238" strokeWidth="6" strokeLinecap="round"/>
          <path d="M358,532 Q364,550 368,562" stroke="#0d2238" strokeWidth="6" strokeLinecap="round"/>
          <ellipse cx="310" cy="565" rx="16" ry="5.5" fill="#0d2238" stroke="none"/>
          <ellipse cx="370" cy="565" rx="16" ry="5.5" fill="#0d2238" stroke="none"/>
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

        {/* Umbrella — low arc */}
        <g className="umb">
          <ellipse cx="340" cy="440" rx="190" ry="38" fill="url(#umbGlow)" opacity="0.5" filter="url(#softBlur)"/>
          <path d="M158,432 Q188,340 340,324 Q492,340 522,432 Z" fill="url(#umbTop)"/>
          <line x1="340" y1="323" x2="158" y2="432" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="323" x2="215" y2="336" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="323" x2="272" y2="324" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="323" x2="340" y2="432" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="323" x2="408" y2="324" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="323" x2="465" y2="336" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <line x1="340" y1="323" x2="522" y2="432" stroke="#0a2878" strokeWidth="1.2" opacity="0.6"/>
          <path d="M158,432 Q168,457 180,432 Q192,457 204,432 Q216,457 228,432 Q240,457 252,432 Q264,457 276,432 Q288,457 300,432 Q312,457 324,432 Q332,457 340,432 Q348,457 356,432 Q368,457 380,432 Q392,457 404,432 Q416,457 428,432 Q440,457 452,432 Q464,457 476,432 Q488,457 500,432 Q510,457 522,432"
                fill="#0f3aa8" stroke="#0a2878" strokeWidth="1" opacity="0.95"/>
          <path d="M158,432 Q188,340 340,324 Q492,340 522,432" fill="url(#umbSheen)" opacity="0.9"/>
          <path d="M228,338 Q280,326 340,324" fill="none" stroke="#c8d8f8" strokeWidth="1.5" opacity="0.25" strokeLinecap="round"/>
          <ellipse cx="340" cy="323" rx="8"   ry="6.5" fill="#7aaaf2"/>
          <ellipse cx="340" cy="323" rx="3.5" ry="3"   fill="#ddeeff"/>
          <line x1="340" y1="324" x2="340" y2="510" stroke="#2c3e50" strokeWidth="6" strokeLinecap="round"/>
          <path d="M340,510 Q340,532 318,532 Q296,532 296,510" fill="none" stroke="#2c3e50" strokeWidth="6" strokeLinecap="round"/>
          <circle cx="296" cy="510" r="9" fill="#1a2738"/>
          <circle cx="296" cy="510" r="4" fill="#2c3e50"/>
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
      </svg>
    </section>
  )
}