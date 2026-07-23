import { useState } from 'react'

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

// ── Report data ────────────────────────────────────────────────
// Replace `pdfUrl` with the real hosted PDF path for each report
// (e.g. '/reports/annual-report-2025.pdf').
export const allReports = [
  {
    year: '2025',
    title: 'Annual Report 2025',
    tagline: 'Expanding access across Kathmandu Valley',
    summary: 'A look at our growth in client outcomes, new service lines like Trauma Counseling, and our first organizational wellness partnerships.',
    stats: [
      { label: 'Clients Served', value: '4,200+' },
      { label: 'Sessions Held', value: '18,600' },
      { label: 'Partner Orgs', value: '32' },
    ],
    fileSize: '4.2 MB',
    pages: 48,
    pdfUrl: '/reports/annual-report-2025.pdf',
    status: 'Latest',
  },
  {
    year: '2024',
    title: 'Annual Report 2024',
    tagline: 'Building the child & family practice',
    summary: 'Highlights from launching Child Psychology and Family Therapy services, along with community mental health outreach programs.',
    stats: [
      { label: 'Clients Served', value: '3,100' },
      { label: 'Sessions Held', value: '13,400' },
      { label: 'Partner Orgs', value: '21' },
    ],
    fileSize: '3.8 MB',
    pages: 42,
    pdfUrl: '/reports/annual-report-2024.pdf',
  },
  {
    year: '2023',
    title: 'Annual Report 2023',
    tagline: 'Going online, reaching further',
    summary: 'The year we introduced online therapy, extending support beyond Kathmandu to clients across Nepal for the first time.',
    stats: [
      { label: 'Clients Served', value: '2,300' },
      { label: 'Sessions Held', value: '9,800' },
      { label: 'Partner Orgs', value: '14' },
    ],
    fileSize: '3.1 MB',
    pages: 36,
    pdfUrl: '/reports/annual-report-2023.pdf',
  },
  {
    year: '2022',
    title: 'Annual Report 2022',
    tagline: 'Strengthening clinical foundations',
    summary: 'Investments in therapist training, the launch of our Mindfulness & Stress program, and early outcome tracking systems.',
    stats: [
      { label: 'Clients Served', value: '1,450' },
      { label: 'Sessions Held', value: '6,200' },
      { label: 'Partner Orgs', value: '8' },
    ],
    fileSize: '2.6 MB',
    pages: 30,
    pdfUrl: '/reports/annual-report-2022.pdf',
  },
  {
    year: '2021',
    title: 'Annual Report 2021',
    tagline: 'Our founding year',
    summary: 'How Common Psychology began — our first clinic, our founding team, and the values that continue to guide our care today.',
    stats: [
      { label: 'Clients Served', value: '520' },
      { label: 'Sessions Held', value: '2,100' },
      { label: 'Partner Orgs', value: '3' },
    ],
    fileSize: '1.9 MB',
    pages: 24,
    pdfUrl: '/reports/annual-report-2021.pdf',
  },
]

const allYears = ['All', ...allReports.map(r => r.year)]

// ── Glass card palette (shared with Services page) ─────────────
const GLASS = {
  bg:        'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)',
  bgHover:   'linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(200,232,250,0.68) 55%, rgba(255,255,255,0.78) 100%)',
  border:    '1px solid rgba(255,255,255,0.55)',
  borderHov: '1px solid rgba(120,190,230,0.65)',
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6, verticalAlign: -3 }}>
      <path d="M12 3v12m0 0l-4.5-4.5M12 15l4.5-4.5M4 19h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function openAndDownloadPdf(url, filename) {
  // 1. Show the PDF in a new tab
  window.open(url, '_blank', 'noopener,noreferrer')

  // 2. Also trigger a direct download via a hidden link
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function PdfBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.03em',
      color: '#c0392b', background: 'rgba(231,76,60,0.1)',
      border: '1px solid rgba(231,76,60,0.18)',
      padding: '0.18rem 0.55rem', borderRadius: '999px',
    }}>
      PDF
    </span>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function PdfViewerModal({ report, onClose }) {
  if (!report) return null

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,30,28,0.55)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem',
        animation: 'fadeIn 0.2s ease both',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 900, height: '88vh',
          display: 'flex', flexDirection: 'column',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.92) 0%, rgba(222,241,251,0.9) 55%, rgba(255,255,255,0.92) 100%)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.6)',
          borderRadius: '20px',
          boxShadow: '0 24px 60px rgba(0,60,80,0.35)',
          overflow: 'hidden',
          animation: 'popIn 0.25s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.3rem',
          borderBottom: '1px solid rgba(0,123,168,0.14)',
          background: 'rgba(255,255,255,0.5)',
        }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1d3a34' }}>{report.title}</div>
            <div style={{ fontSize: '0.72rem', color: '#7a8a85' }}>{report.pages} pages · {report.fileSize}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => openAndDownloadPdf(report.pdfUrl, `${slugify(report.title)}.pdf`)}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)',
                border: 'none', color: '#fff',
                fontSize: '0.8rem', fontWeight: 600,
                padding: '0.45rem 0.9rem', borderRadius: '999px',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
              }}
            >
              <DownloadIcon />
              Download
            </button>
            <button
              onClick={onClose}
              aria-label="Close PDF viewer"
              style={{
                width: 34, height: 34, borderRadius: '50%',
                border: '1px solid rgba(0,123,168,0.2)',
                background: 'rgba(255,255,255,0.7)',
                color: '#007ba8', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* PDF viewer */}
        <div style={{ flex: 1, background: '#e9eef0' }}>
          <iframe
            src={report.pdfUrl}
            title={report.title}
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  )
}

export default function AnnualReportsPage() {
  const [activeYear, setActiveYear] = useState('All')
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)

  const visibleReports = activeYear === 'All'
    ? allReports
    : allReports.filter(r => r.year === activeYear)

  return (
    <div className="page-wrapper">
      <div
        className="page-hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '4rem 2rem 5rem',
          textAlign: 'center',
          borderRadius: '0 0 60% 60% / 0 0 40px 40px',
          background: `
            radial-gradient(ellipse 75% 60% at 15% 30%, rgba(0,191,255,0.14) 0%, transparent 70%),
            radial-gradient(ellipse 70% 75% at 85% 15%, rgba(0,123,168,0.12) 0%, transparent 65%),
            radial-gradient(ellipse 65% 55% at 55% 85%, rgba(190,233,251,0.4) 0%, transparent 60%),
            linear-gradient(160deg, #ffffff 0%, #eaf6fc 50%, #f0fbff 100%)
          `,
        }}
      >
        <div style={{
          position: 'absolute', width: 220, height: 220, borderRadius: '50%',
          background: 'rgba(0,123,168,0.14)', filter: 'blur(32px)',
          top: -40, right: '5%', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 180, height: 180, borderRadius: '50%',
          background: 'rgba(0,191,255,0.10)', filter: 'blur(32px)',
          bottom: -20, left: '8%', pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
          <span className="section-tag" style={{
            display: 'inline-flex', alignItems: 'center',
            color: '#005580', background: 'rgba(255,255,255,0.7)',
            border: '1.5px solid rgba(190,233,251,0.8)',
          }}>Annual Reports</span>
          <h1 className="section-title" style={{ color: '#003850' }}>
            A Record of <em style={{ color: '#00BFFF', fontStyle: 'italic' }}>Care & Growth</em>
          </h1>
          <p className="section-desc" style={{ color: '#4d7c94' }}>
            Transparent, year-by-year accounts of our impact, our services, and the community we serve.
          </p>
        </div>
      </div>

      <div className="section" style={{ background: 'linear-gradient(180deg, #f0fbff 0%, #ffffff 45%, #eaf6fc 100%)' }}>

        {/* Year filter bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.6rem',
            marginBottom: '3rem',
            padding: '0 1rem',
          }}
        >
          {allYears.map(year => {
            const active = year === activeYear
            return (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                style={{
                  border: active ? '1px solid transparent' : '1px solid #d8e3df',
                  background: active
                    ? 'linear-gradient(135deg, #1d9e75, #007ba8)'
                    : '#fff',
                  color: active ? '#fff' : '#3a4a45',
                  padding: '0.5rem 1.1rem',
                  borderRadius: '999px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: active ? '0 4px 14px rgba(29,158,117,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transform: active ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {year}
              </button>
            )
          })}
        </div>

        <div className="services-grid-full">
          {visibleReports.map((r, i) => {
            const isHovered = hoveredIdx === i
            return (
              <div
                className="service-card-full"
                key={r.year}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setSelectedReport(r)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  background: isHovered ? GLASS.bgHover : GLASS.bg,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isHovered ? GLASS.borderHov : GLASS.border,
                  transform: isHovered ? 'translateY(-8px) scale(1.015)' : 'translateY(0) scale(1)',
                  boxShadow: isHovered
                    ? '0 20px 44px rgba(0,123,168,0.22), 0 6px 16px rgba(29,158,117,0.14), inset 0 1px 0 rgba(255,255,255,0.6)'
                    : '0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.5)',
                  borderRadius: '20px',
                  transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, background 0.35s ease, border 0.35s ease',
                  animation: `fadeSlideIn 0.5s ease both`,
                  animationDelay: `${i * 0.06}s`,
                }}
              >
                {r.status && (
                  <span style={{
                    position: 'absolute', top: 14, right: 14, zIndex: 2,
                    fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.03em',
                    color: '#fff', background: 'linear-gradient(135deg, #1d9e75, #007ba8)',
                    padding: '0.25rem 0.65rem', borderRadius: '999px',
                    boxShadow: '0 2px 8px rgba(29,158,117,0.3)',
                  }}>
                    {r.status}
                  </span>
                )}

                {/* Year "icon" block, styled like the service icon */}
                <div
                  className="service-icon si-blue"
                  style={{
                    transform: isHovered ? 'scale(1.12) rotate(-4deg)' : 'scale(1)',
                    transition: 'transform 0.3s ease',
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {r.year}
                </div>

                <h3 className="service-card-title">{r.title}</h3>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#007ba8', margin: '-0.3rem 0 0.6rem' }}>
                  {r.tagline}
                </p>
                <p className="service-card-desc">{r.summary}</p>

                {/* Stat strip */}
                <div style={{
                  display: 'flex', gap: '0.6rem', marginBottom: '0.9rem',
                  padding: '0.7rem 0', borderTop: '1px solid rgba(0,123,168,0.12)',
                  borderBottom: '1px solid rgba(0,123,168,0.12)',
                }}>
                  {r.stats.map(st => (
                    <div key={st.label} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1d3a34' }}>{st.value}</div>
                      <div style={{ fontSize: '0.62rem', color: '#7a8a85', marginTop: 2 }}>{st.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
                  <PdfBadge />
                  <span style={{ fontSize: '0.72rem', color: '#7a8a85' }}>{r.pages} pages · {r.fileSize}</span>
                </div>

                <button
                  className="btn btn-primary service-card-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    openAndDownloadPdf(r.pdfUrl, `${slugify(r.title)}.pdf`)
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #007ba8 0%, #00bfff 100%)',
                    boxShadow: '0 6px 18px rgba(0,150,210,0.3)',
                    border: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DownloadIcon />
                  Download Report
                </button>
              </div>
            )
          })}
        </div>

        {visibleReports.length === 0 && (
          <p style={{ textAlign: 'center', color: '#7a8a85', marginTop: '2rem' }}>
            No reports match that year.
          </p>
        )}
      </div>

      <PdfViewerModal report={selectedReport} onClose={() => setSelectedReport(null)} />

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}