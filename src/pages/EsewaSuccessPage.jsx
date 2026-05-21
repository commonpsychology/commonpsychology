// ============================================================
//  EsewaSuccessPage.jsx
//  Place at: src/pages/EsewaSuccessPage.jsx
//
//  This is the page eSewa redirects to after a SUCCESSFUL payment.
//  URL pattern: /payment/esewa/success?data=BASE64_JSON
//
//  Register this route in your router:
//    <Route path="/payment/esewa/success" element={<EsewaSuccessPage />} />
// ============================================================

import { useEffect, useState } from 'react'
import { useRouter } from '../context/RouterContext'   // ← adjust path if needed

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600&family=DM+Sans:wght@400;500;600&display=swap');
.esewa-cb { min-height:100vh; display:flex; align-items:center; justify-content:center; background:#f0f9ff; font-family:'DM Sans',sans-serif; padding:1rem; }
.esewa-cb-card { background:white; border-radius:20px; padding:2.5rem 2rem; max-width:420px; width:100%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,.1); }
.esewa-cb-icon { width:72px; height:72px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto 1.25rem; }
.esewa-cb-icon.success { background:#ecfdf5; }
.esewa-cb-icon.error   { background:#fef2f2; }
.esewa-cb-icon.loading { background:#eff6ff; }
.esewa-cb-title { font-family:'Fraunces',Georgia,serif; font-size:1.35rem; color:#1a3a4a; margin-bottom:.5rem; }
.esewa-cb-sub   { font-size:.85rem; color:#7a9aaa; line-height:1.65; margin-bottom:1.5rem; }
.esewa-cb-ref   { font-family:monospace; font-size:.78rem; background:#f0f4f8; border:1px solid #e2e8f0; border-radius:6px; padding:.4rem .85rem; color:#005580; display:inline-block; margin-bottom:1.25rem; }
.esewa-cb-btn   { display:inline-block; padding:.75rem 2rem; border-radius:10px; font-family:'DM Sans',sans-serif; font-size:.9rem; font-weight:600; cursor:pointer; border:none; transition:all .15s; }
.esewa-cb-btn.primary { background:linear-gradient(135deg,#007BA8,#00BFFF); color:white; box-shadow:0 4px 14px rgba(0,123,168,.3); }
.esewa-cb-btn.primary:hover { opacity:.9; transform:translateY(-1px); }
.esewa-cb-btn.ghost { background:transparent; color:#7a9aaa; border:1.5px solid #e2e8f0; margin-left:.5rem; }
.esewa-cb-btn.ghost:hover { border-color:#007BA8; color:#007BA8; }
.esewa-cb-spinner { width:32px; height:32px; border:3px solid rgba(0,123,168,.2); border-top-color:#007BA8; border-radius:50%; animation:esewaSpn .7s linear infinite; margin:0 auto; }
@keyframes esewaSpn { to { transform:rotate(360deg) } }
.esewa-cb-detail { background:#f0f4f8; border-radius:10px; padding:.85rem 1rem; margin-bottom:1.25rem; text-align:left; }
.esewa-cb-detail-row { display:flex; justify-content:space-between; font-size:.8rem; padding:.22rem 0; border-bottom:1px solid #e2e8f0; }
.esewa-cb-detail-row:last-child { border-bottom:none; }
.esewa-cb-detail-key { color:#7a9aaa; font-weight:600; }
.esewa-cb-detail-val { color:#1a3a4a; font-weight:700; font-family:monospace; font-size:.75rem; }
`

export default function EsewaSuccessPage() {
  const { navigate } = useRouter()

  const [status,  setStatus]  = useState('verifying')   // 'verifying' | 'success' | 'error' | 'already_done'
  const [message, setMessage] = useState('')
  const [payInfo, setPayInfo] = useState(null)

  useEffect(() => {
    // Inject CSS
    if (!document.getElementById('esewa-cb-css')) {
      const s = document.createElement('style')
      s.id = 'esewa-cb-css'
      s.textContent = CSS
      document.head.appendChild(s)
    }

    const params  = new URLSearchParams(window.location.search)
    const rawData = params.get('data')

    if (!rawData) {
      setStatus('error')
      setMessage('No payment data received from eSewa. If you paid successfully, please contact support.')
      return
    }

    // Call our backend to verify
    const token = localStorage.getItem('accessToken')

    fetch(`/api/esewa/verify?data=${encodeURIComponent(rawData)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(r => r.json())
      .then(result => {
        if (result.success) {
          setPayInfo(result)
          setStatus(result.already_done ? 'already_done' : 'success')
        } else {
          setStatus('error')
          setMessage(result.message || 'Payment verification failed.')
        }
      })
      .catch(err => {
        setStatus('error')
        setMessage('Network error during verification. Please check your payment status or contact support.')
        console.error('[EsewaSuccessPage] verify error:', err)
      })
  }, [])

  // Auto-redirect to portal after success
  useEffect(() => {
    if (status !== 'success' && status !== 'already_done') return
    const t = setTimeout(() => navigate('/portal'), 5000)
    return () => clearTimeout(t)
  }, [status])

  return (
    <div className="esewa-cb">
      <div className="esewa-cb-card">

        {/* ── VERIFYING ── */}
        {status === 'verifying' && (
          <>
            <div className="esewa-cb-icon loading">
              <div className="esewa-cb-spinner" />
            </div>
            <div className="esewa-cb-title">Verifying Payment</div>
            <div className="esewa-cb-sub">
              We are confirming your payment with eSewa.<br />
              This takes just a moment…
            </div>
          </>
        )}

        {/* ── SUCCESS ── */}
        {(status === 'success' || status === 'already_done') && (
          <>
            <div className="esewa-cb-icon success">✅</div>
            <div className="esewa-cb-title">
              {status === 'already_done' ? 'Already Confirmed' : 'Payment Confirmed!'}
            </div>
            <div className="esewa-cb-sub">
              {status === 'already_done'
                ? 'This payment was already verified. No action needed.'
                : 'Your eSewa payment has been verified and confirmed automatically.'}
            </div>

            {payInfo && (
              <div className="esewa-cb-detail">
                {payInfo.transaction_id && (
                  <div className="esewa-cb-detail-row">
                    <span className="esewa-cb-detail-key">Transaction ID</span>
                    <span className="esewa-cb-detail-val">{payInfo.transaction_id}</span>
                  </div>
                )}
                {payInfo.amount && (
                  <div className="esewa-cb-detail-row">
                    <span className="esewa-cb-detail-key">Amount</span>
                    <span className="esewa-cb-detail-val">NPR {Number(payInfo.amount).toLocaleString()}</span>
                  </div>
                )}
                {payInfo.category && (
                  <div className="esewa-cb-detail-row">
                    <span className="esewa-cb-detail-key">Category</span>
                    <span className="esewa-cb-detail-val">{payInfo.category}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ fontSize:'.72rem', color:'#7a9aaa', marginBottom:'1.25rem' }}>
              Redirecting to your dashboard in 5 seconds…
            </div>

            <button className="esewa-cb-btn primary" onClick={() => navigate('/portal')}>
              Go to Dashboard →
            </button>
          </>
        )}

        {/* ── ERROR ── */}
        {status === 'error' && (
          <>
            <div className="esewa-cb-icon error">❌</div>
            <div className="esewa-cb-title">Verification Failed</div>
            <div className="esewa-cb-sub">{message}</div>
            <div style={{ display:'flex', gap:'.5rem', justifyContent:'center', flexWrap:'wrap' }}>
              <button className="esewa-cb-btn primary" onClick={() => navigate('/')}>
                Go Home
              </button>
              <button className="esewa-cb-btn ghost" onClick={() => navigate('/portal')}>
                My Dashboard
              </button>
            </div>
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop:'1.25rem', fontSize:'.68rem', color:'#b0bec5' }}>
          🔒 Common Psychology · Secure Payment
        </div>
      </div>
    </div>
  )
}