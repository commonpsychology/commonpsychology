// src/pages/PaymentEthicsPage.jsx
import { useState, useEffect } from 'react'
import { useRouter } from '../context/RouterContext'
import { useFetch, apiFetch } from '../hooks/useFetch'

const PLANS = [
  {
    name: 'Single Session',
    price: 'NPR 2,500',
    priceNote: 'per session',
    popular: false,
    features: ['50-minute therapy session', 'Any registered therapist', 'Online or in-person', 'Session notes provided', 'No commitment required'],
    cta: 'Book Now',
  },
  {
    name: 'Monthly Plan',
    price: 'NPR 8,500',
    priceNote: '4 sessions / month',
    popular: true,
    features: ['4 × 50-minute sessions', 'Same therapist continuity', 'Priority booking', 'Secure messaging access', 'Monthly progress report', '15% saving vs single rate'],
    cta: 'Get Started',
  },
  {
    name: 'Couples / Family',
    price: 'NPR 3,500',
    priceNote: 'per session',
    popular: false,
    features: ['80-minute joint session', 'Specialist couples therapist', 'Online or in-person', 'Homework & exercises', 'Flexible scheduling'],
    cta: 'Book Session',
  },
  {
    name: 'Sliding Scale',
    price: 'NPR 500–1,500',
    priceNote: 'income-based',
    popular: false,
    features: ['For low-income applicants', 'Application required', 'Limited spots available', 'Full 50-minute sessions', 'Same quality of care'],
    cta: 'Apply',
  },
]

const ETHICS = [
  { icon: '🔒', title: 'Confidentiality', body: 'All communications between clients and therapists are strictly confidential. We will never share your information with third parties without your explicit written consent, except where required by law (imminent risk to life).' },
  { icon: '🤝', title: 'Informed Consent', body: 'Before any therapy begins, clients receive a full explanation of the therapeutic process, its limitations, and their rights. Ongoing consent is obtained throughout treatment. Clients may withdraw at any time.' },
  { icon: '⚖️', title: 'Professional Standards', body: 'All our therapists are licensed under the Nepal Medical Council or the Nepal Psychological Society. We follow the ethical guidelines set by the Nepal Health Professional Council.' },
  { icon: '🌐', title: 'Data Privacy', body: "Client data is stored on encrypted servers compliant with Nepal's privacy legislation. We follow the principles of data minimisation, purpose limitation, and storage limitation." },
  { icon: '🚫', title: 'No Discrimination', body: 'We provide services without discrimination on the basis of gender, sexuality, caste, religion, ethnicity, disability, or socioeconomic status. Inclusive care is fundamental to our mission.' },
  { icon: '📣', title: 'Complaints & Redress', body: 'If you have a complaint, you may contact our Ethics Officer at ethics@pujasamargi.com.np. All complaints are investigated within 10 business days.' },
]

const BILLING_FAQS = [
  { q: 'What payment methods do you accept?', a: 'We accept eSewa, Khalti, bank transfer (NABIL, NIC Asia, Global IME), and cash payments at our office. Credit/debit cards are accepted online.' },
  { q: 'Is there a cancellation policy?', a: 'Sessions cancelled with 24+ hours notice receive a full refund or rescheduling. Sessions cancelled within 24 hours are charged 50% of the session fee.' },
  { q: 'Can I get an insurance receipt?', a: 'Yes. We provide detailed tax receipts for all sessions. Some Nepali health insurance providers partially cover psychotherapy — check your policy or ask us to assist.' },
  { q: 'Do you offer student discounts?', a: 'Yes. Students with a valid student ID receive 20% off single sessions. This cannot be combined with the sliding scale programme.' },
  { q: 'How does the sliding scale application work?', a: 'Submit a brief financial hardship application via our portal. Our team reviews applications within 3 business days. Approved clients select from available reduced-rate slots.' },
]

/* Fallback legal docs in case API fails */
const FALLBACK_LEGAL = [
  { id: 'privacy-policy',        doc: 'Privacy Policy',             icon: '📄', updated: 'Last updated Jan 2025', has_file: false },
  { id: 'terms-of-service',      doc: 'Terms of Service',           icon: '📋', updated: 'Last updated Jan 2025', has_file: false },
  { id: 'informed-consent',      doc: 'Informed Consent Form',      icon: '✍️', updated: 'Last updated Mar 2025', has_file: false },
  { id: 'data-processing',       doc: 'Data Processing Agreement',  icon: '🔒', updated: 'Last updated Jan 2025', has_file: false },
  { id: 'therapist-code',        doc: 'Therapist Code of Conduct',  icon: '⚖️', updated: 'Last updated Feb 2025', has_file: false },
]

/* ── Shared palette ── */
const C = {
  skyBright:'#00BFFF', skyMid:'#009FD4', skyDeep:'#007BA8',
  skyFaint:'#E0F7FF', skyFainter:'#F0FBFF', skyGhost:'#F8FEFF',
  white:'#ffffff', mint:'#e8f3ee', mintMid:'#b8d5c8',
  textDark:'#1a3a4a', textMid:'#2e6080', textLight:'#7a9aaa',
  border:'#b0d4e8', borderFaint:'#daeef8',
}
const heroGrad    = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 40%,${C.skyBright} 80%,#22d3ee 100%)`
const sectionGrad = `linear-gradient(135deg,${C.skyFainter} 0%,${C.mint} 60%,${C.skyFaint} 100%)`
const btnGrad     = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyBright} 100%)`
const popularGrad = `linear-gradient(135deg,${C.skyDeep} 0%,${C.skyMid} 50%,${C.skyBright} 100%)`

/* ── PDF Viewer Modal ─────────────────────────────────────────────── */
function PdfModal({ doc, onClose }) {
  const [url, setUrl]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await apiFetch(`/resources/legal/${doc.id}/view`)
        if (!cancelled && res.success) setUrl(res.file_url)
        else if (!cancelled) setError('Could not load document.')
      } catch {
        if (!cancelled) setError('Could not load document.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [doc.id])

  async function handleDownload() {
    try {
      // Trigger download via the download endpoint
      const a = document.createElement('a')
      a.href = `/api/resources/legal/${doc.id}/download`
      a.download = doc.doc + '.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch {
      // fallback: open in new tab
      if (url) window.open(url, '_blank')
    }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:2000,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'1rem' }}
      onClick={onClose}>
      <div style={{ background:C.white, borderRadius:20, width:'100%', maxWidth:860,
        maxHeight:'90vh', display:'flex', flexDirection:'column',
        boxShadow:'0 24px 64px rgba(0,0,0,0.3)', overflow:'hidden' }}
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'1rem 1.5rem', borderBottom:`1px solid ${C.borderFaint}`,
          background:sectionGrad }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <span style={{ fontSize:'1.3rem' }}>{doc.icon}</span>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', fontWeight:700,
                color:C.textDark }}>{doc.doc}</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem',
                color:C.textLight }}>{doc.updated}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
            {url && (
              <button onClick={handleDownload}
                style={{ padding:'0.45rem 1rem', borderRadius:8, border:'none',
                  background:btnGrad, color:'white', fontFamily:'var(--font-body)',
                  fontSize:'0.8rem', fontWeight:700, cursor:'pointer',
                  boxShadow:'0 3px 12px rgba(0,191,255,0.3)' }}>
                ⬇ Download PDF
              </button>
            )}
            <button onClick={onClose}
              style={{ padding:'0.45rem 0.7rem', borderRadius:8, border:`1px solid ${C.border}`,
                background:C.white, color:C.textLight, fontSize:'1rem', cursor:'pointer',
                fontFamily:'var(--font-body)' }}>✕</button>
          </div>
        </div>

        {/* PDF content area */}
        <div style={{ flex:1, overflowY:'auto', position:'relative', minHeight:400 }}>
          {loading && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
              height:400, flexDirection:'column', gap:'1rem' }}>
              <div style={{ width:40, height:40, borderRadius:'50%', border:`3px solid ${C.borderFaint}`,
                borderTopColor:C.skyBright, animation:'spin 0.8s linear infinite' }} />
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.85rem', color:C.textLight }}>
                Loading document…
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}
          {error && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
              height:400, flexDirection:'column', gap:'0.75rem', padding:'2rem' }}>
              <div style={{ fontSize:'2.5rem' }}>📄</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:C.textMid,
                textAlign:'center' }}>{error}</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.8rem', color:C.textLight,
                textAlign:'center' }}>
                Ensure the PDF files are placed in <code>public/pdfs/legal/</code>
              </div>
            </div>
          )}
          {!loading && !error && url && (
            <iframe
              src={url + '#toolbar=0&navpanes=0&scrollbar=1'}
              title={doc.doc}
              style={{ width:'100%', height:'100%', minHeight:560, border:'none', display:'block' }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default function PaymentEthicsPage() {
  const { navigate }    = useRouter()
  const [activeTab, setActiveTab] = useState('Pricing')
  const [openFaq, setOpenFaq]     = useState(null)
  const [viewingDoc, setViewingDoc] = useState(null)   // for PDF viewer modal
  const TABS = ['Pricing', 'Billing & FAQ', 'Ethics & Legal']

  // Fetch legal docs list from API so has_file is live
  const { data: legalDocs } = useFetch('/resources/legal', {}, [])
  const docs = legalDocs?.length ? legalDocs : FALLBACK_LEGAL

  async function handleDownloadDirect(doc) {
    const a = document.createElement('a')
    a.href = `/api/resources/legal/${doc.id}/download`
    a.download = doc.doc + '.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="page-wrapper" style={{ background:C.skyGhost }}>

      {/* ── Hero ── */}
      <div style={{ background:heroGrad, padding:'5rem 4rem 4rem', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-60, right:-60, width:280, height:280, borderRadius:'50%',
          background:'rgba(255,255,255,0.07)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, left:'55%', width:180, height:180, borderRadius:'50%',
          background:'rgba(255,255,255,0.05)', pointerEvents:'none' }} />
        <div style={{ maxWidth:620, position:'relative' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6,
            background:'rgba(255,255,255,0.15)', backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,0.25)', borderRadius:100,
            padding:'0.3rem 0.9rem', marginBottom:'1rem' }}>
            <span style={{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.1em',
              color:'rgba(255,255,255,0.9)', textTransform:'uppercase' }}>🔒 Payments & Ethics</span>
          </div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,2.8rem)',
            color:'white', marginBottom:'1rem', lineHeight:1.2 }}>
            Transparent Pricing,<br />Ethical Care
          </h1>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'1rem', color:'rgba(255,255,255,0.82)',
            lineHeight:1.7, maxWidth:480 }}>
            We believe quality mental healthcare should be accessible and honest. No hidden fees,
            no surprises — just clear pricing and unwavering ethical standards.
          </p>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ background:`linear-gradient(to right,${C.skyFaint} 0%,${C.mint} 50%,${C.skyFainter} 100%)`,
        borderBottom:`1px solid ${C.borderFaint}`, padding:'0 4rem', display:'flex', gap:0 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            padding:'1rem 1.75rem', border:'none', background:'none',
            fontFamily:'var(--font-body)', fontSize:'0.88rem',
            fontWeight: activeTab===t?700:500,
            color: activeTab===t?C.skyMid:C.textLight,
            borderBottom: activeTab===t?`2.5px solid ${C.skyBright}`:'2.5px solid transparent',
            cursor:'pointer', transition:'all 0.2s', whiteSpace:'nowrap',
          }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'3.5rem 4rem' }}>

        {/* ─── PRICING ─── */}
        {activeTab === 'Pricing' && (
          <div>
            <div style={{ textAlign:'center', marginBottom:'3rem' }}>
              <div style={{ display:'inline-block', background:sectionGrad,
                border:`1px solid ${C.borderFaint}`, borderRadius:16, padding:'1.5rem 3rem' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color:C.textDark,
                  marginBottom:'0.4rem' }}>Session Fees</h2>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', color:C.textMid, margin:0 }}>
                  All prices in Nepalese Rupees (NPR). Includes GST where applicable.
                </p>
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',
              gap:'1.5rem', marginBottom:'3rem' }}>
              {PLANS.map((plan, i) => (
                <div key={i} style={{
                  borderRadius:20, padding:'2rem',
                  background: plan.popular?popularGrad:C.white,
                  border: plan.popular?'none':`1px solid ${C.borderFaint}`,
                  boxShadow: plan.popular?`0 16px 48px rgba(0,191,255,0.28)`:`0 4px 20px rgba(0,191,255,0.06)`,
                  position:'relative', overflow:'hidden',
                  transform: plan.popular?'scale(1.03)':'scale(1)',
                  transition:'transform 0.22s, box-shadow 0.22s',
                }}
                  onMouseEnter={e => { if (!plan.popular) { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 36px rgba(0,191,255,0.14)` }}}
                  onMouseLeave={e => { if (!plan.popular) { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow=`0 4px 20px rgba(0,191,255,0.06)` }}}
                >
                  {plan.popular && (
                    <div style={{ position:'absolute', top:'1rem', right:'1rem',
                      background:'rgba(255,255,255,0.2)', color:'white', fontSize:'0.68rem',
                      fontWeight:800, padding:'3px 10px', borderRadius:100, letterSpacing:'0.06em' }}>
                      MOST POPULAR
                    </div>
                  )}
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem',
                    color: plan.popular?'rgba(255,255,255,0.85)':C.textMid, marginBottom:'0.5rem' }}>
                    {plan.name}
                  </div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem',
                    color: plan.popular?'white':C.textDark, marginBottom:'0.2rem', fontWeight:800 }}>
                    {plan.price}
                  </div>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem',
                    color: plan.popular?'rgba(255,255,255,0.65)':C.textLight, marginBottom:'1.5rem' }}>
                    {plan.priceNote}
                  </div>
                  <div style={{ borderTop:`1px solid ${plan.popular?'rgba(255,255,255,0.2)':C.borderFaint}`,
                    paddingTop:'1.25rem', marginBottom:'1.5rem' }}>
                    {plan.features.map((f, j) => (
                      <div key={j} style={{ display:'flex', alignItems:'center', gap:'0.5rem',
                        marginBottom:'0.6rem' }}>
                        <span style={{ color: plan.popular?'rgba(255,255,255,0.9)':C.skyBright,
                          fontSize:'0.8rem', fontWeight:700 }}>✓</span>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem',
                          color: plan.popular?'rgba(255,255,255,0.85)':C.textMid }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate('/book')} style={{
                    width:'100%', padding:'0.8rem', borderRadius:10, border:'none', cursor:'pointer',
                    background: plan.popular?C.white:btnGrad,
                    color: plan.popular?C.skyDeep:C.white,
                    fontFamily:'var(--font-body)', fontSize:'0.88rem', fontWeight:700,
                    transition:'opacity 0.2s',
                    boxShadow: plan.popular?'none':`0 4px 16px rgba(0,191,255,0.3)`,
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                    {plan.cta} →
                  </button>
                </div>
              ))}
            </div>

            {/* Payment methods */}
            <div style={{ background:sectionGrad, borderRadius:16, padding:'2rem',
              border:`1px solid ${C.borderFaint}` }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:C.textDark,
                marginBottom:'1rem' }}>Accepted Payment Methods</div>
              <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                {['💚 eSewa','🟣 Khalti','🏦 Bank Transfer','💳 Card (Online)','💵 Cash (Office)'].map((m,i) => (
                  <div key={i} style={{ padding:'0.5rem 1.1rem', borderRadius:10, background:C.white,
                    border:`1px solid ${C.border}`, fontFamily:'var(--font-body)', fontSize:'0.82rem',
                    fontWeight:600, color:C.textMid, boxShadow:`0 2px 8px rgba(0,191,255,0.06)` }}>
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── BILLING FAQ ─── */}
        {activeTab === 'Billing & FAQ' && (
          <div style={{ maxWidth:780, margin:'0 auto' }}>
            <div style={{ background:sectionGrad, borderRadius:16, padding:'1.5rem 2rem',
              marginBottom:'1.75rem', border:`1px solid ${C.borderFaint}` }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:C.textDark,
                margin:0 }}>Billing & Payment Questions</h2>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {BILLING_FAQS.map((faq, i) => (
                <div key={i} style={{ background:C.white, borderRadius:12,
                  border:`1px solid ${openFaq===i?C.skyBright:C.borderFaint}`,
                  overflow:'hidden', transition:'border-color 0.2s',
                  boxShadow: openFaq===i?`0 4px 20px rgba(0,191,255,0.1)`:'none' }}>
                  <button onClick={() => setOpenFaq(openFaq===i?null:i)}
                    style={{ width:'100%', display:'flex', justifyContent:'space-between',
                      alignItems:'center', padding:'1.1rem 1.25rem', background:'none', border:'none',
                      cursor:'pointer', textAlign:'left' }}>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:'0.9rem', fontWeight:700,
                      color:C.textDark }}>{faq.q}</span>
                    <span style={{ width:26, height:26, borderRadius:'50%', flexShrink:0,
                      background: openFaq===i?btnGrad:C.skyFaint,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color: openFaq===i?C.white:C.skyMid, fontSize:'1.1rem', fontWeight:700,
                      transform: openFaq===i?'rotate(45deg)':'rotate(0)', transition:'transform 0.2s,background 0.2s' }}>+</span>
                  </button>
                  {openFaq===i && (
                    <div style={{ padding:'0 1.25rem 1.1rem', fontFamily:'var(--font-body)',
                      fontSize:'0.86rem', color:C.textMid, lineHeight:1.7,
                      borderTop:`1px solid ${C.borderFaint}` }}>
                      <div style={{ paddingTop:'0.85rem' }}>{faq.a}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop:'2.5rem', background:sectionGrad, borderRadius:14,
              padding:'1.5rem', border:`1px solid ${C.borderFaint}` }}>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.86rem', color:C.textDark,
                lineHeight:1.65, margin:0 }}>
                💬 <strong>Still have questions?</strong> Our billing team is available Mon–Fri 9 AM–5 PM.
                Email <strong>billing@pujasamargi.com.np</strong> or call our reception.
              </p>
            </div>
          </div>
        )}

        {/* ─── ETHICS & LEGAL ─── */}
        {activeTab === 'Ethics & Legal' && (
          <div>
            <div style={{ background:sectionGrad, borderRadius:16, padding:'1.5rem 2rem',
              marginBottom:'2.5rem', border:`1px solid ${C.borderFaint}` }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:C.textDark,
                marginBottom:'0.3rem' }}>Our Ethical Commitments</h2>
              <p style={{ fontFamily:'var(--font-body)', fontSize:'0.88rem', color:C.textMid,
                margin:0, maxWidth:600 }}>
                We hold ourselves to the highest professional and ethical standards. Below are the core
                principles that guide every interaction at Puja Samargi.
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',
              gap:'1.5rem', marginBottom:'3rem' }}>
              {ETHICS.map((e, i) => (
                <div key={i} style={{ background:C.white, borderRadius:16, padding:'1.75rem',
                  border:`1px solid ${C.borderFaint}`, boxShadow:`0 4px 20px rgba(0,191,255,0.06)`,
                  transition:'transform 0.22s, box-shadow 0.22s' }}
                  onMouseEnter={el => { el.currentTarget.style.transform='translateY(-3px)'; el.currentTarget.style.boxShadow=`0 10px 32px rgba(0,191,255,0.12)` }}
                  onMouseLeave={el => { el.currentTarget.style.transform='translateY(0)'; el.currentTarget.style.boxShadow=`0 4px 20px rgba(0,191,255,0.06)` }}>
                  <div style={{ width:46, height:46, borderRadius:12,
                    background:`linear-gradient(135deg,${C.skyFaint} 0%,${C.mint} 100%)`,
                    border:`1px solid ${C.borderFaint}`, display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:'1.3rem', marginBottom:'1rem' }}>{e.icon}</div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:C.textDark,
                    marginBottom:'0.6rem' }}>{e.title}</h3>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:'0.84rem', color:C.textMid,
                    lineHeight:1.7, margin:0 }}>{e.body}</p>
                </div>
              ))}
            </div>

            {/* ── Legal Documents ── */}
            <div style={{ background:C.white, borderRadius:16, padding:'2rem',
              border:`1px solid ${C.borderFaint}`, boxShadow:`0 4px 20px rgba(0,191,255,0.06)` }}>
              <div style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:C.textDark,
                marginBottom:'0.5rem' }}>Legal Documents</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:'0.82rem', color:C.textLight,
                marginBottom:'1.25rem' }}>
                All documents open as a PDF viewer in-page. You can also download each document.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                {docs.map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center',
                    justifyContent:'space-between', padding:'0.85rem 1rem', borderRadius:10,
                    background:sectionGrad, border:`1px solid ${C.borderFaint}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <span style={{ fontSize:'1.1rem' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.86rem',
                          fontWeight:700, color:C.textDark }}>{item.doc}</div>
                        <div style={{ fontFamily:'var(--font-body)', fontSize:'0.72rem',
                          color:C.textLight }}>{item.updated}</div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display:'flex', gap:'0.5rem' }}>
                      {item.has_file ? (
                        <>
                          {/* View in modal */}
                          <button onClick={() => setViewingDoc(item)}
                            style={{ padding:'0.3rem 0.9rem', borderRadius:8,
                              border:`1.5px solid ${C.skyBright}`, background:'transparent',
                              color:C.skyMid, fontFamily:'var(--font-body)', fontSize:'0.75rem',
                              fontWeight:700, cursor:'pointer', transition:'background 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.background=C.skyFaint}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                            👁 View
                          </button>
                          {/* Download directly */}
                          <button onClick={() => handleDownloadDirect(item)}
                            style={{ padding:'0.3rem 0.9rem', borderRadius:8, border:'none',
                              background:btnGrad, color:'white', fontFamily:'var(--font-body)',
                              fontSize:'0.75rem', fontWeight:700, cursor:'pointer',
                              boxShadow:`0 2px 8px rgba(0,191,255,0.25)` }}>
                            ⬇ PDF
                          </button>
                        </>
                      ) : (
                        <span style={{ fontFamily:'var(--font-body)', fontSize:'0.75rem',
                          color:C.textLight, fontStyle:'italic', padding:'0.3rem 0' }}>
                          Coming soon
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p style={{ fontFamily:'var(--font-body)', fontSize:'0.78rem', color:C.textLight,
              lineHeight:1.6, marginTop:'2rem' }}>
              Puja Samargi Mental Wellness Center is registered under the Companies Act 2006 of Nepal.
              All therapists are licensed and regulated by the Nepal Health Professional Council.
              For regulatory queries, contact <strong>ethics@pujasamargi.com.np</strong>.
            </p>
          </div>
        )}

      </div>

      {/* PDF Viewer Modal */}
      {viewingDoc && (
        <PdfModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}
    </div>
  )
}