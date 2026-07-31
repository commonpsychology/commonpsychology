// src/components/BackButton.jsx
import { useRouter } from '../context/RouterContext'

export default function BackButton() {
  const { currentPath, goBack } = useRouter()

  const atHome = currentPath === '/' || currentPath === ''
  const isNativeApp = typeof window !== 'undefined' && !!window.Capacitor

  if (atHome || !isNativeApp) return null

  return (
    <button
      onClick={goBack}
      aria-label="Go back"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 10px)',
        left: 12,
        zIndex: 9999,
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: 'none',
        background: 'rgba(0,0,0,0.55)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        lineHeight: 1,
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }}
    >
      ←
    </button>
  )
}