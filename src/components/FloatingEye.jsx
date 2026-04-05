import { useRouter } from '../context/RouterContext'

export default function FloatingEye() {
  const { navigate } = useRouter()

  return (
    <div
      onClick={() => navigate('/psychological-view')}
      style={{
        position: 'fixed',
        top: '90px',
        right: '20px',
        zIndex: 99999,
      }}
    >
      {/* 🌊 Outer Waves */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '70px',
        height: '70px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: 'rgba(118, 75, 162, 0.4)',
        animation: 'wave 2.5s infinite'
      }} />

      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '70px',
        height: '70px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: 'rgba(118, 75, 162, 0.3)',
        animation: 'wave 2.5s infinite 1s'
      }} />

      {/* 👁 Main Button */}
      <div
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(118,75,162,0.6)',
          position: 'relative',
          zIndex: 2,
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        👁
      </div>

      {/* 🎯 Animations */}
      <style>
        {`
          @keyframes wave {
            0% {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 0.6;
            }
            70% {
              transform: translate(-50%, -50%) scale(1.8);
              opacity: 0;
            }
            100% {
              opacity: 0;
            }
          }
        `}
      </style>
    </div>
  )
}