import React from 'react'

export default function UmbrellaPage() {
  return (
    <section
      style={{
        width: '100%',
        background: '#0d1b2a',
        padding: '2rem 1rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <svg
        width="100%"
        viewBox="0 0 680 580"
        xmlns="http://www.w3.org/2000/svg"
        style={{ maxWidth: 820 }}
      >
        <defs>
          <style>{`
            @keyframes fall {
              0%   { transform: translateY(0px); opacity:0; }
              8%   { opacity:0.65; }
              92%  { opacity:0.65; }
              100% { transform: translateY(340px); opacity:0; }
            }
            @keyframes sway {
              0%,100% { transform: rotate(-0.8deg) translateX(0); }
              50%     { transform: rotate(0.8deg) translateX(2px); }
            }
            .rdrop { animation: fall linear infinite; }
            .umb   { transform-origin: 340px 210px; animation: sway 4.5s ease-in-out infinite; }
          `}</style>
        </defs>

        <rect x="0" y="0" width="680" height="580" fill="#0d1b2a"/>

    

        {/* Rain drops */}
        <g fill="none" stroke="#8ab8d8" strokeWidth="1.1" strokeLinecap="round" opacity="0.55">
          {[
            [52,110,49,138,'1.05s','0.0s'],[85,100,82,128,'0.92s','0.3s'],[118,115,115,143,'1.15s','0.6s'],
            [150,105,147,133,'1.0s','0.15s'],[183,118,180,146,'0.88s','0.45s'],[216,108,213,136,'1.2s','0.75s'],
            [248,112,245,140,'0.95s','0.1s'],[280,102,277,130,'1.08s','0.5s'],[312,116,309,144,'1.0s','0.8s'],
            [344,106,341,134,'0.9s','0.25s'],[376,114,373,142,'1.12s','0.55s'],[408,104,405,132,'1.0s','0.85s'],
            [440,118,437,146,'0.88s','0.2s'],[472,108,469,136,'1.18s','0.6s'],[504,112,501,140,'0.97s','0.4s'],
            [536,102,533,130,'1.06s','0.0s'],[568,115,565,143,'1.0s','0.7s'],[600,105,597,133,'0.92s','0.35s'],
            [632,118,629,146,'1.1s','0.65s'],[664,108,661,136,'0.85s','0.15s'],
            [68,140,65,168,'1.02s','0.5s'],[100,130,97,158,'1.15s','0.2s'],[133,142,130,170,'0.9s','0.7s'],
            [165,132,162,160,'1.05s','0.4s'],[198,145,195,173,'0.95s','0.9s'],[231,135,228,163,'1.1s','0.05s'],
            [264,140,261,168,'0.88s','0.6s'],[296,130,293,158,'1.0s','0.3s'],[328,143,325,171,'1.08s','0.75s'],
            [360,133,357,161,'0.93s','0.15s'],[392,142,389,170,'1.15s','0.45s'],[424,132,421,160,'1.0s','0.8s'],
            [456,145,453,173,'0.9s','0.1s'],[488,135,485,163,'1.05s','0.55s'],[520,140,517,168,'0.95s','0.35s'],
            [552,128,549,156,'1.12s','0.65s'],[584,142,581,170,'0.88s','0.25s'],[616,130,613,158,'1.0s','0.5s'],
            [648,143,645,171,'1.08s','0.0s'],
          ].map(([x1,y1,x2,y2,dur,del], i) => (
            <line key={i} className="rdrop" x1={x1} y1={y1} x2={x2} y2={y2}
                  style={{ animationDuration: dur, animationDelay: del }}/>
          ))}
        </g>

        {/* Big blue umbrella */}
        <g className="umb">
          <path d="M175,260 Q195,148 340,132 Q485,148 505,260 Z" fill="#1256a8"/>
          
          <path d="M175,260 Q188,280 200,260 Q213,280 225,260 Q238,280 250,260 Q263,280 275,260 Q288,280 300,260 Q313,280 325,260 Q338,280 340,260 Q342,280 355,260 Q368,280 380,260 Q393,280 405,260 Q418,280 430,260 Q443,280 455,260 Q468,280 480,260 Q493,280 505,260"
                fill="none" stroke="#0d47a1" strokeWidth="1.8"/>
          <path d="M175,260 Q195,148 340,132 Q485,148 505,260"
                fill="none" stroke="#e3f2fd" strokeWidth="1.2" opacity="0.4"/>
          <line x1="340" y1="131" x2="175" y2="260" stroke="#0d47a1" strokeWidth="1" opacity="0.5"/>
          <line x1="340" y1="131" x2="222" y2="142" stroke="#0d47a1" strokeWidth="1" opacity="0.5"/>
          <line x1="340" y1="131" x2="300" y2="132" stroke="#0d47a1" strokeWidth="1" opacity="0.5"/>
          <line x1="340" y1="131" x2="340" y2="260" stroke="#0d47a1" strokeWidth="1" opacity="0.5"/>
          <line x1="340" y1="131" x2="380" y2="132" stroke="#0d47a1" strokeWidth="1" opacity="0.5"/>
          <line x1="340" y1="131" x2="458" y2="142" stroke="#0d47a1" strokeWidth="1" opacity="0.5"/>
          <line x1="340" y1="131" x2="505" y2="260" stroke="#0d47a1" strokeWidth="1" opacity="0.5"/>
          <ellipse cx="340" cy="131" rx="6" ry="5" fill="#90caf9"/>
          <ellipse cx="340" cy="131" rx="2.5" ry="2" fill="#e3f2fd"/>
          <line x1="340" y1="262" x2="340" y2="348" stroke="#37474f" strokeWidth="5" strokeLinecap="round"/>
          <path d="M340,348 Q340,368 320,368 Q300,368 300,348"
                fill="none" stroke="#37474f" strokeWidth="5" strokeLinecap="round"/>
          <circle cx="300" cy="348" r="7" fill="#263238"/>
        </g>

        

        {/* Human figures (inclusion icon style) — orange */}
        <g stroke="#e87722" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g transform="translate(252,370)">
            <circle cx="0" cy="-38" r="12"/>
            <path d="M-12,-26 Q-20,0 -16,22 Q-8,28 0,28 Q8,28 16,22 Q20,0 12,-26 Z"/>
            <path d="M-28,-30 Q-36,-10 -30,10"/>
            <path d="M28,-30 Q36,-10 30,10"/>
          </g>
          <g transform="translate(340,370)" stroke="#f5a623">
            <circle cx="0" cy="-38" r="14"/>
            <path d="M-14,-24 Q-22,4 -18,26 Q-9,32 0,32 Q9,32 18,26 Q22,4 14,-24 Z"/>
            <path d="M-32,-28 Q-40,-6 -34,14"/>
            <path d="M32,-28 Q40,-6 34,14"/>
          </g>
          <g transform="translate(428,370)">
            <circle cx="0" cy="-38" r="12"/>
            <path d="M-12,-26 Q-20,0 -16,22 Q-8,28 0,28 Q8,28 16,22 Q20,0 12,-26 Z"/>
            <path d="M-28,-30 Q-36,-10 -30,10"/>
            <path d="M28,-30 Q36,-10 30,10"/>
          </g>
        </g>

        {/* Cupped hands */}
        <g stroke="#f5a623" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M222,418 Q222,435 230,445 Q248,462 280,466 Q300,468 340,468 Q380,468 400,466 Q432,462 450,445 Q458,435 458,418"/>
          <path d="M222,418 Q215,410 215,402 Q218,392 226,390 Q232,388 238,392 Q240,396 238,402"/>
          <path d="M458,418 Q465,410 465,402 Q462,392 454,390 Q448,388 442,392 Q440,396 442,402"/>
        </g>

        {/* Nepali text */}
        <text x="340" y="502"
              fontFamily="'Noto Sans Devanagari', 'Arial Unicode MS', Arial, sans-serif"
              fontSize="26" fontWeight="600" fill="#90caf9" textAnchor="middle" letterSpacing="1">
          हामी एक हौँ
        </text>
        <text x="340" y="530" fontFamily="Arial, sans-serif" fontSize="13"
              fill="#5b9bd5" textAnchor="middle" opacity="0.85">
          under one umbrella — we are one
        </text>

        <ellipse cx="340" cy="560" rx="240" ry="6" fill="#0d47a1" opacity="0.18"/>
      </svg>
    </section>
  )
}