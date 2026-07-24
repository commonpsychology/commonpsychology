// src/components/EleventhPaymentPromo.jsx
// Promo banner: 50% OFF on the 11th payment/order.
// Drop it near the top of any page — self-contained, no props required.

export default function EleventhPaymentPromo() {
  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      margin: '1.5rem auto',
      maxWidth: 880,
      width: 'calc(100% - 2rem)',
      borderRadius: 18,
      padding: '1.1rem 1.4rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      background: 'linear-gradient(120deg, #064e3b 0%, #065f46 45%, #047857 100%)',
      boxShadow: '0 10px 30px rgba(4,120,87,0.28)',
      border: '1px solid rgba(110,231,183,0.25)',
    }}>
      {/* ambient glow */}
      <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:'rgba(251,191,36,0.15)', filter:'blur(36px)', top:-60, left:-40, pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:140, height:140, borderRadius:'50%', background:'rgba(52,211,153,0.18)', filter:'blur(30px)', bottom:-50, right:'10%', pointerEvents:'none' }} />

      {/* shimmer sweep */}
      <style>{`
        @keyframes promoShimmer {
          0%   { transform: translateX(-120%) skewX(-15deg); }
          60%  { transform: translateX(220%)  skewX(-15deg); }
          100% { transform: translateX(220%)  skewX(-15deg); }
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.06); }
        }
      `}</style>
      <div style={{
        position: 'absolute', top: 0, bottom: 0, width: '35%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)',
        animation: 'promoShimmer 4.5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Badge */}
      <div style={{
        flexShrink: 0,
        width: 72, height: 72,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #fde68a, #f59e0b 70%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(245,158,11,0.45)',
        animation: 'badgePulse 2.2s ease-in-out infinite',
        position: 'relative', zIndex: 1,
      }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'1.35rem', fontWeight:800, color:'#7c2d12', lineHeight:1 }}>50%</span>
        <span style={{ fontSize:'0.55rem', fontWeight:800, color:'#7c2d12', letterSpacing:'0.06em' }}>OFF</span>
      </div>

      {/* Copy */}
      <div style={{ position:'relative', zIndex:1, flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
          <span style={{
            fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:700, color:'#fff',
          }}>
            50% off your <em style={{ color:'#fde68a', fontStyle:'normal' }}>11th payment</em>
          </span>
          <span style={{
            fontSize:'0.65rem', fontWeight:800, color:'#064e3b', background:'#6ee7b7',
            padding:'0.15rem 0.55rem', borderRadius:'100px', letterSpacing:'0.04em',
          }}>
            LOYALTY REWARD
          </span>
        </div>
        <p style={{ margin:'0.3rem 0 0', fontSize:'0.8rem', color:'rgba(255,255,255,0.75)', lineHeight:1.4 }}>
          Complete your every 11th order or session payment with us and the discount applies automatically at checkout — our way of saying thank you for staying on your wellness journey.
        </p>
      </div>
    </div>
  )
}