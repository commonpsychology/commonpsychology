import { useEffect, useState } from 'react'

/**
 * ------------------------------------------------------------------
 * STATIC (do not change per-notice — these are the "letterhead"):
 *   - /header.jpg            → your logo/emblem image
 *   - HEADING_EN / HEADING_NP → "Common Psychology" / "साझा मनोविज्ञान"
 *   - /signature.png          → the signature image you provide
 *   - SIGNATORY_NAME          → "संजीव न्यौपाने"
 * ------------------------------------------------------------------
 * DYNAMIC (edit freely per notice — this is the only part you touch
 * day to day, same as the old NOTICES array):
 *   - letterNo, receivedNo, chNo   → the three reference lines, top-left
 *   - subject                     → underlined notice title
 *   - bodyParagraphs              → array of paragraph strings (Nepali)
 *   - dateBS / sambat             → date block, bottom-left
 *   - signatoryTitle              → designation under the name
 * ------------------------------------------------------------------
 */

// ─── STATIC LETTERHEAD CONFIG ───────────────────────────────────────
const HEADER_IMAGE = '/header.png'
const HEADING_EN = 'Common Psychology'
const HEADING_NP = 'साझा मनोविज्ञान'
const SIGNATURE_IMAGE = '/sig.jpg'
const SIGNATORY_NAME = 'संजीव न्यौपाने'

// ─── DYNAMIC NOTICE CONTENT (edit this per announcement) ───────────
const NOTICE = {
  letterNo: '',
  receivedNo: '',
  chNo: '',
  subject: 'सार्वजनिक सूचना',
  bodyParagraphs: [
    '२०८३-०१-१७ मा ABC फाउन्डेसनको सहकार्यमा त्रिभुवन विश्वविद्यालयमा चेतनामूलक कार्यक्रम आयोजना गरिने छ। सम्बन्धित सबैको जानकारीको लागि यो सूचना प्रकाशित गरिएको छ।',
  ],
  dateBS: '२०८३/०१/१७',
  sambat: '',
  signatoryTitle: 'संस्थापक/सञ्चालक',
}

export default function NoticePopup({ storageKey = 'notice_v2', notice = NOTICE }) {
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(20,20,20,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #dbf0ff 0%, #eef8ff 45%, #ffffff 100%)',
          width: '100%',
          maxWidth: 760,
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 18,
          border: '1px solid #bfe3fb',
          boxShadow: '0 25px 70px rgba(0,123,168,0.28), 0 0 0 1px rgba(255,255,255,0.6) inset',
          fontFamily: `'Noto Sans Devanagari', 'Mangal', Arial, sans-serif`,
          color: '#1a1a1a',
          position: 'relative',
          animation: 'noticeIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
        }}
      >
        {/* Faint watermark logo */}
        <img
          src={HEADER_IMAGE}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '65%',
            maxWidth: 420,
            transform: 'translate(-50%, -50%)',
            opacity: 0.06,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        />

        <style>{`
          @keyframes noticeIn {
            from { opacity:0; transform:scale(0.97) translateY(6px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          .cp-glow-btn:hover { transform: translateY(-1px); }
        `}</style>

        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: '1px solid #ccc',
            background: '#fff',
            color: '#333',
            fontSize: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          ✕
        </button>

        {/* ── Letter paper ───────────────────────────────────── */}
        <div style={{ padding: '2.2rem 2.4rem 2.6rem', position: 'relative', zIndex: 1 }}>
          {/* Reference block (dynamic) */}
          <div style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 4 }}>
            <div>पत्र संख्या:- {notice.letterNo}</div>
            <div>प्राप्त पत्र संख्या र मिति:- {notice.receivedNo}</div>
            <div>च.नं.:- {notice.chNo}</div>
          </div>

          {/* Header (static) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              margin: '0.5rem 0 1.6rem',
              textAlign: 'center',
              padding: '1.1rem 1.5rem',
            }}
          >
            <img
              src={HEADER_IMAGE}
              alt="logo"
              style={{
                width: 78,
                height: 78,
                objectFit: 'contain',
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  color: '#2e7d4f',
                  lineHeight: 1.25,
                }}
              >
                {HEADING_NP}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#2e7d4f',
                  lineHeight: 1.25,
                  marginTop: 4,
                }}
              >
                {HEADING_EN}
              </div>
            </div>
          </div>

          {/* Subject (dynamic) */}
          <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: 4,
              }}
            >
              {notice.subject}
            </span>
          </div>

          {/* Body (dynamic) */}
          <div style={{ fontSize: 15, lineHeight: 2, textAlign: 'justify' }}>
            {notice.bodyParagraphs.map((p, i) => (
              <p key={i} style={{ margin: '0 0 1rem', textIndent: '2em' }}>
                {p}
              </p>
            ))}
          </div>

          {/* Footer row: date (dynamic, left) + signature (static, right) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '2.2rem',
            }}
          >
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              <div>मिति {notice.dateBS}</div>
              {notice.sambat && <div>नेपाल संवत {notice.sambat}</div>}
            </div>

            <div style={{ textAlign: 'center' }}>
              <img
                src={SIGNATURE_IMAGE}
                alt="signature"
                style={{ height: 60, objectFit: 'contain', marginBottom: 2 }}
              />
              <div style={{ fontSize: 14, fontWeight: 600, borderTop: '1px solid #999', paddingTop: 4 }}>
                {SIGNATORY_NAME}
              </div>
              <div style={{ fontSize: 12, color: '#555' }}>{notice.signatoryTitle}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button
              onClick={dismiss}
              className="cp-glow-btn"
              style={{
                padding: '10px 30px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #eaf9ff 0%, #7fd4ff 45%, #009fe3 100%)',
                border: '1px solid #bfeaff',
                color: '#00344c',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,159,227,0.45), 0 0 18px rgba(0,191,255,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Understood, continue
            </button>
            <button
              onClick={dismiss}
              className="cp-glow-btn"
              style={{
                padding: '10px 30px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #ffffff 0%, #eaf6ff 100%)',
                border: '1.5px solid #9fd8ff',
                color: '#00567e',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(0,159,227,0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}