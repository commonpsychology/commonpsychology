import { useEffect, useState } from 'react'

const NOTICES = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="#007BA8" strokeWidth="1.2"/>
        <path d="M5 3V2M11 3V2M2 6.5h12" stroke="#007BA8" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    iconBg: '#E0F7FF',
    title: '2026-04-30 AWARENESS PROGRAM IN COLLABORATION WITH ABC FOUNDATION AT TRIBHUVAN UNIVERSITY',
    titleNP: '२०२६-०४-३० त्रिभुवन विश्वविद्यालयमा ABC फाउन्डेसनको सहकार्यमा चेतनामूलक कार्यक्रम आयोजना हुनेछ।',
  },
]

export default function NoticePopup({ storageKey = 'notice_v2' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(storageKey)) setVisible(true)
  }, [storageKey])

  const dismiss = () => {
    sessionStorage.setItem(storageKey, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,60,90,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: 18, width: '100%', maxWidth: 560,
        overflow: 'hidden',
        border: '1px solid #b0d4e8',
        boxShadow: '0 20px 60px rgba(0,123,168,0.25)',
        animation: 'noticeIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
      }}>
        <style>{`
          @keyframes noticeIn {
            from { opacity:0; transform:scale(0.96) translateY(8px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          @keyframes noticePulse {
            0%,100% { opacity:1; } 50% { opacity:0.4; }
          }
        `}</style>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #007BA8 0%, #00BFFF 100%)',
          padding: '1.85rem 1.85rem 1.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 150, height: 150, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.15)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: -15, right: -15,
            width: 90, height: 90, borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.12)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#ffffff', display: 'inline-block',
                animation: 'noticePulse 1.8s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                textTransform: 'uppercase', letterSpacing: '0.12em',
              }}>
                Live notice
              </span>
            </div>
            <button
              onClick={dismiss}
              aria-label="Close"
              style={{
                width: 28, height: 28, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.35)',
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, transition: 'background 0.2s',
              }}
            >✕</button>
          </div>

          <h2 style={{ margin: '0 0 4px', fontSize: 25, fontWeight: 600, color: '#ffffff', lineHeight: 1.25 }}>
            Important announcement
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
            From the team — please read before continuing
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '1.85rem', background: '#ffffff' }}>
          {NOTICES.map((n, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 14,
              padding: '12px 0',
              borderBottom: i < NOTICES.length - 1 ? '1px solid #daeef8' : 'none',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                background: n.iconBg, flexShrink: 0, marginTop: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{n.icon}</div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 14.5, fontWeight: 600, color: '#1a3a4a', lineHeight: 1.45 }}>
                  {n.title}
                </p>
                {n.titleNP && (
                  <p style={{ margin: '0 0 4px', fontSize: 13.5, fontWeight: 500, color: '#2e6080', lineHeight: 1.55 }}>
                    {n.titleNP}
                  </p>
                )}
                {n.body && (
                  <p style={{ margin: 0, fontSize: 12.5, color: '#7a9aaa', lineHeight: 1.5 }}>
                    {n.body}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: 10 }}>
            <button
              onClick={dismiss}
              style={{
                flex: 2, padding: '12px 0', borderRadius: 9,
                background: 'linear-gradient(135deg, #007BA8, #00BFFF)',
                border: 'none',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,191,255,0.3)',
                transition: 'opacity 0.2s',
              }}
            >Understood, continue</button>
            <button
              onClick={dismiss}
              style={{
                flex: 1, padding: '12px 0', borderRadius: 9,
                background: 'transparent',
                border: '1.5px solid #b0d4e8',
                color: '#2e6080', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  )
}