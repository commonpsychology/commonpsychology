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
      background: 'linear-gradient(120deg, #EAF6FC 0%, #FFFFFF 50%, #F0FBFF 100%)',
      boxShadow: '0 10px 30px rgba(0,123,168,0.14)',
      border: '1px solid rgba(190,233,251,0.7)',
    }}>
      {/* ambient glow */}
      <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.35)', filter:'blur(36px)', top:-60, left:-40, pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:140, height:140, borderRadius:'50%', background:'rgba(0,191,255,0.25)', filter:'blur(30px)', bottom:-50, right:'10%', pointerEvents:'none' }} />

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
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
        animation: 'promoShimmer 4.5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Badge */}
      <div style={{
        flexShrink: 0,
        width: 72, height: 72,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 30%, #ffffff, #a0e9ff 70%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 6px 18px rgba(0,123,168,0.45)',
        animation: 'badgePulse 2.2s ease-in-out infinite',
        position: 'relative', zIndex: 1,
      }}>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'1.35rem', fontWeight:800, color:'#007BA8', lineHeight:1 }}>50%</span>
        <span style={{ fontSize:'0.55rem', fontWeight:800, color:'#007BA8', letterSpacing:'0.06em' }}>OFF</span>
      </div>

      {/* Copy */}
      <div style={{ position:'relative', zIndex:1, flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
          <span style={{
            fontFamily:'var(--font-display)', fontSize:'1.05rem', fontWeight:700, color:'#fff',
          }}>
            50% off your <em style={{ color:'#ffffff', fontStyle:'normal', textDecoration:'underline', textDecorationColor:'rgba(255,255,255,0.5)' }}>11th payment</em>
          </span>
          <span style={{
            fontSize:'0.65rem', fontWeight:800, color:'#005580', background:'#ffffff',
            padding:'0.15rem 0.55rem', borderRadius:'100px', letterSpacing:'0.04em',
          }}>
            LOYALTY REWARD
          </span>
        </div>
        <p style={{ margin:'0.3rem 0 0', fontSize:'0.8rem', color:'rgba(255,255,255,0.9)', lineHeight:1.4 }}>
          Complete your 11th order or session payment with us and the discount applies automatically at checkout — our way of saying thank you for staying on your wellness journey.
        </p>
      </div>
    </div>
  )
}