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
        background: 'rgba(0,60,90,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #cdecff 0%, #e6f7ff 40%, #ffffff 100%)',
          width: '100%',
          maxWidth: 760,
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: 18,
          border: '1px solid #99ddff',
          boxShadow: '0 25px 70px rgba(0,191,255,0.3), 0 0 0 1px rgba(255,255,255,0.6) inset',
          fontFamily: `'Noto Sans Devanagari', 'Mangal', Arial, sans-serif`,
          color: '#1a1a1a',
          position: 'relative',
          animation: 'noticeIn 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
        }}
      >
        {/* Faint watermark logo — center background */}
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

        {/* Top-right corner logo */}
        <img
          src={HEADER_IMAGE}
          alt="logo"
          className="cp-corner-logo"
          style={{
            position: 'absolute',
            top: '1.2rem',
            right: '3.4rem',
            width: 50,
            height: 50,
            objectFit: 'contain',
            zIndex: 1,
          }}
        />

        {/* Bluish accent glow — spans the top */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 180,
            background: 'linear-gradient(180deg, rgba(0,191,255,0.30) 0%, rgba(0,191,255,0.12) 55%, rgba(0,191,255,0) 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        <style>{`
          @keyframes noticeIn {
            from { opacity:0; transform:scale(0.97) translateY(6px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          .cp-glow-btn:hover { transform: translateY(-1px); }

          @media (max-width: 480px) {
            .cp-refblock {
              text-align: center !important;
              font-size: 10px !important;
              line-height: 1.4 !important;
              margin-bottom: 0 !important;
            }

            .cp-header {
              flex-direction: row !important;
              text-align: left !important;
              gap: 8px !important;
              padding: 0.3rem 0 0.2rem !important;
              margin: 0.2rem 0 0.5rem !important;
            }
            .cp-header img {
              width: 42px !important;
              height: 42px !important;
            }
            .cp-heading-np {
              margin-left: 0 !important;
              text-align: left !important;
              font-size: 15px !important;
              line-height: 1.15 !important;
            }
            .cp-heading-en {
              text-align: left !important;
              font-size: 10px !important;
              margin-top: 1px !important;
            }

            .cp-subject { font-size: 12px !important; margin-bottom: 0.5rem !important; }

            .cp-body { font-size: 11px !important; line-height: 1.4 !important; }
            .cp-body p { margin: 0 0 0.4rem !important; text-indent: 1.2em !important; }

            .cp-footer {
              flex-direction: row !important;
              align-items: flex-end !important;
              gap: 0.5rem !important;
              text-align: left !important;
              margin-top: 0.8rem !important;
            }
            .cp-footer > div:first-child { font-size: 10px !important; line-height: 1.3 !important; }
            .cp-sig-block { text-align: center !important; }
            .cp-sig-block img { height: 32px !important; }
            .cp-sig-block > div:nth-child(2) { font-size: 10px !important; padding-top: 2px !important; }
            .cp-sig-block > div:nth-child(3) { font-size: 9px !important; }

            .cp-actions {
              flex-direction: row !important;
              margin-top: 0.7rem !important;
              gap: 6px !important;
            }
            .cp-actions button {
              width: 100% !important;
              padding: 7px 10px !important;
              font-size: 11px !important;
            }

            .cp-letter-body { padding: 0.8rem 1rem 1rem !important; }

            .cp-close-btn {
              width: 24px !important;
              height: 24px !important;
              top: 8px !important;
              right: 8px !important;
              font-size: 12px !important;
            }

            .cp-corner-logo {
              top: 0.6rem !important;
              right: 2.6rem !important;
              width: 30px !important;
              height: 30px !important;
            }
          }
        `}</style>

        {/* Close button */}
        <button
          onClick={dismiss}
          aria-label="Close"
          className="cp-close-btn"
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
        <div className="cp-letter-body" style={{ padding: '2.2rem 2.4rem 2.6rem', position: 'relative', zIndex: 1 }}>
          {/* Reference block (dynamic) */}
          <div className="cp-refblock" style={{ fontSize: 13, lineHeight: 1.9, marginBottom: 4 }}>
            <div>पत्र संख्या:-१२७९ {notice.letterNo}</div>
            <div>प्राप्त पत्र संख्या र मिति:-२०८३/०४/०१ {notice.receivedNo}</div>
            <div>च.नं.:-१ {notice.chNo}</div>
          </div>

          {/* Header (static) */}
          <div
            className="cp-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              margin: '0.5rem 0 1.2rem',
              textAlign: 'left',
              padding: '1.1rem 1.5rem 0.4rem',
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
                className="cp-heading-np"
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  color: '#2e7d4f',
                  lineHeight: 1.25,
                  marginLeft: '-0.6rem',
                }}
              >
                {HEADING_NP}
              </div>
              <div
                className="cp-heading-en"
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
          <div className="cp-subject" style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
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
          <div className="cp-body" style={{ fontSize: 15, lineHeight: 2, textAlign: 'justify' }}>
            {notice.bodyParagraphs.map((p, i) => (
              <p key={i} style={{ margin: '0 0 1rem', textIndent: '2em' }}>
                {p}
              </p>
            ))}
          </div>

          {/* Footer row: (static, right) */}
          <div
            className="cp-footer"
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

            <div className="cp-sig-block" style={{ textAlign: 'center' }}>
              <img
                src={SIGNATURE_IMAGE}
                alt="signature"
                style={{
                  height: 60,
                  objectFit: 'contain',
                  marginBottom: 2,
                  mixBlendMode: 'multiply',
                  display: 'block',
                }}
              />
              <div style={{ fontSize: 14, fontWeight: 600, borderTop: '1px solid #999', 
                paddingTop: 4 }}>
                {SIGNATORY_NAME}
              </div>
              <div style={{ fontSize: 12, color: '#555' }}>{notice.signatoryTitle}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="cp-actions" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: 10 }}>
            <button
              onClick={dismiss}
              className="cp-glow-btn"
              style={{
                padding: '10px 30px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #eaf9ff 0%, #66d4ff 45%, #00BFFF 100%)',
                border: '1px solid #bfeaff',
                color: '#00344c',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,191,255,0.45), 0 0 18px rgba(0,191,255,0.35)',
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
                border: '1.5px solid #7fd8ff',
                color: '#00567e',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(0,191,255,0.25)',
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