// ============================================================
//  EsewaFailurePage.jsx
//  Place at: src/pages/EsewaFailurePage.jsx
//
//  This is the page eSewa redirects to when payment FAILS or
//  the user cancels.
//
//  Register this route in your router:
//    <Route path="/payment/esewa/failure" element={<EsewaFailurePage />} />
// ============================================================

import { useEffect } from 'react'
import { useRouter } from '../context/RouterContext'   // ← adjust path if needed

export default function EsewaFailurePage() {
  const { navigate } = useRouter()

  useEffect(() => {
    // Notify backend so we can mark the payment as failed
    const params  = new URLSearchParams(window.location.search)
    const rawData = params.get('data')
    const token   = localStorage.getItem('accessToken')

    const API = import.meta.env.VITE_API_URL || ''
fetch(`${API}/esewa/failure${rawData ? `?data=${encodeURIComponent(rawData)}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {/* ignore */})
  }, [])

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'#fff5f5', fontFamily:"'DM Sans',system-ui,sans-serif", padding:'1rem',
    }}>
      <div style={{
        background:'white', borderRadius:20, padding:'2.5rem 2rem',
        maxWidth:420, width:'100%', textAlign:'center',
        boxShadow:'0 20px 60px rgba(0,0,0,.1)',
      }}>
        <div style={{
          width:72, height:72, borderRadius:'50%', background:'#fef2f2',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'2rem', margin:'0 auto 1.25rem',
        }}>
          ❌
        </div>

        <div style={{ fontFamily:"'Fraunces',Georgia,serif", fontSize:'1.35rem', color:'#1a3a4a', marginBottom:'.5rem' }}>
          Payment Not Completed
        </div>

        <div style={{ fontSize:'.85rem', color:'#7a9aaa', lineHeight:1.65, marginBottom:'1.5rem' }}>
          Your eSewa payment was cancelled or not completed.<br />
          <strong style={{ color:'#1a3a4a' }}>No money has been charged.</strong>
        </div>

        <div style={{
          background:'#fff8e6', border:'1px solid #f5d87a', borderRadius:10,
          padding:'.85rem 1rem', fontSize:'.8rem', color:'#92600a',
          marginBottom:'1.5rem', lineHeight:1.6,
        }}>
          💡 Common reasons: wrong PIN, session expired, or insufficient eSewa balance.
          You can try again or use a different payment method.
        </div>

        <div style={{ display:'flex', gap:'.5rem', justifyContent:'center', flexWrap:'wrap' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              padding:'.75rem 1.5rem', borderRadius:10, border:'none',
              background:'linear-gradient(135deg,#007BA8,#00BFFF)', color:'white',
              fontFamily:"'DM Sans',sans-serif", fontSize:'.9rem', fontWeight:600,
              cursor:'pointer', boxShadow:'0 4px 14px rgba(0,123,168,.3)',
              transition:'all .15s',
            }}
            onMouseOver={e => { e.target.style.opacity='.9'; e.target.style.transform='translateY(-1px)' }}
            onMouseOut={e => { e.target.style.opacity='1'; e.target.style.transform='none' }}
          >
            ← Try Again
          </button>

          <button
            onClick={() => navigate('/portal')}
            style={{
              padding:'.75rem 1.5rem', borderRadius:10,
              border:'1.5px solid #e2e8f0', background:'transparent',
              color:'#7a9aaa', fontFamily:"'DM Sans',sans-serif",
              fontSize:'.9rem', fontWeight:600, cursor:'pointer', transition:'all .15s',
            }}
            onMouseOver={e => { e.target.style.borderColor='#007BA8'; e.target.style.color='#007BA8' }}
            onMouseOut={e => { e.target.style.borderColor='#e2e8f0'; e.target.style.color='#7a9aaa' }}
          >
            My Dashboard
          </button>
        </div>

        <div style={{ marginTop:'1.25rem', fontSize:'.68rem', color:'#b0bec5' }}>
          🔒 Common Psychology · Secure Payment
        </div>
      </div>
    </div>
  )
}