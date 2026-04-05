// src/pages/MyAccountPage.jsx
// Avatar uploads to backend → backend uploads to Supabase Storage (no supabase client needed in frontend)

import { useState, useEffect, useRef } from 'react'
import { useRouter }  from '../context/RouterContext'
import { useAuth }    from '../context/AuthContext'
import { profile as profileApi } from '../services/api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const SKY_D  = '#007BA8'
const WHITE  = '#fff'
const BG     = '#f4f8fb'
const BORDER = '#daeef8'
const MID    = '#4a6a7a'

const TABS = [
  { id:'profile',       icon:'👤', label:'Profile'        },
  { id:'security',      icon:'🔒', label:'Security'       },
  { id:'sessions',      icon:'📅', label:'Sessions'       },
  { id:'notifications', icon:'🔔', label:'Notifications'  },
  { id:'orders',        icon:'📦', label:'My Orders'      },
]

const ORDER_STATUS_COLORS = {
  pending:    { bg:'#fff9e6', color:'#8a5a1a' },
  confirmed:  { bg:'#e8f8f0', color:'#1a7a4a' },
  processing: { bg:'#e0f7ff', color:'#007BA8' },
  shipped:    { bg:'#f0e8ff', color:'#5a1a8a' },
  delivered:  { bg:'#e8f8f0', color:'#1a5a3a' },
  cancelled:  { bg:'#fff0f0', color:'#c0392b' },
  refunded:   { bg:'#f0f4f8', color:'#4a6a7a' },
}

// The ordered steps shown in the timeline
const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered']

const CSS = `
  .acc-layout { min-height:100vh; background:${BG}; }
  .acc-hero { background:linear-gradient(135deg,#007BA8 0%,#00BFFF 100%); padding:clamp(1.25rem,4vw,2rem); padding-top:calc(clamp(1.25rem,4vw,2rem) + 72px); }
  .acc-hero-inner { max-width:900px; margin:0 auto; display:flex; align-items:center; gap:1.25rem; flex-wrap:wrap; }
  .acc-main { max-width:900px; margin:0 auto; padding:clamp(1rem,4vw,2rem); display:grid; grid-template-columns:200px 1fr; gap:1.5rem; align-items:start; }
  .acc-sidebar { background:${WHITE}; border-radius:14px; border:1px solid ${BORDER}; padding:0.85rem; position:sticky; top:1rem; }
  .acc-sidebar-btn { display:flex; align-items:center; gap:0.6rem; width:100%; padding:0.65rem 0.85rem; border-radius:10px; border:none; cursor:pointer; text-align:left; margin-bottom:0.15rem; font-family:inherit; transition:background 0.15s; }
  .acc-content { background:${WHITE}; border-radius:14px; border:1px solid ${BORDER}; padding:clamp(1.25rem,4vw,2rem); }
  .acc-tabs-mobile { display:none; background:${WHITE}; border-bottom:1px solid ${BORDER}; overflow-x:auto; scrollbar-width:none; }
  .acc-tabs-mobile::-webkit-scrollbar { display:none; }
  .acc-tab-btn { flex-shrink:0; padding:0.85rem 1.1rem; border:none; background:none; font-family:inherit; font-size:0.83rem; cursor:pointer; border-bottom:2.5px solid transparent; white-space:nowrap; color:${MID}; transition:all 0.2s; }
  .acc-tab-btn.active { color:${SKY_D}; font-weight:700; border-bottom-color:${SKY_D}; }
  .acc-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }

  .acc-avatar-wrap { position:relative; width:72px; height:72px; flex-shrink:0; cursor:pointer; }
  .acc-avatar-wrap:hover .acc-avatar-overlay { opacity:1; }
  .acc-avatar-img { width:72px; height:72px; border-radius:50%; object-fit:cover; border:3px solid rgba(255,255,255,0.55); display:block; background:rgba(255,255,255,0.15); }
  .acc-avatar-placeholder { width:72px; height:72px; border-radius:50%; background:rgba(255,255,255,0.18); border:3px solid rgba(255,255,255,0.45); display:flex; align-items:center; justify-content:center; font-size:1.4rem; color:rgba(255,255,255,0.7); }
  .acc-avatar-overlay { position:absolute; inset:0; border-radius:50%; background:rgba(0,0,0,0.45); display:flex; flex-direction:column; align-items:center; justify-content:center; opacity:0; transition:opacity 0.22s ease; gap:2px; }
  .acc-avatar-overlay span:first-child { font-size:1.1rem; line-height:1; }
  .acc-avatar-overlay span:last-child { font-size:0.58rem; font-weight:700; color:white; letter-spacing:0.04em; text-transform:uppercase; }
  .acc-avatar-uploading { position:absolute; inset:0; border-radius:50%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; }
  @keyframes acc-spin { to { transform:rotate(360deg); } }
  .acc-spinner { width:22px; height:22px; border:2.5px solid rgba(255,255,255,0.25); border-top-color:white; border-radius:50%; animation:acc-spin 0.7s linear infinite; }
  .acc-avatar-badge { position:absolute; bottom:2px; right:2px; width:20px; height:20px; border-radius:50%; background:white; border:2px solid rgba(0,123,168,0.3); display:flex; align-items:center; justify-content:center; font-size:0.6rem; box-shadow:0 1px 4px rgba(0,0,0,0.18); }

  /* ── Status timeline ── */
  .status-timeline { display:flex; align-items:center; padding:0.85rem 1.1rem 0.65rem; border-top:1px solid ${BORDER}; background:${BG}; overflow-x:auto; scrollbar-width:none; gap:0; }
  .status-timeline::-webkit-scrollbar { display:none; }
  .st-step { display:flex; flex-direction:column; align-items:center; flex:1; min-width:52px; }
  .st-dot { width:22px; height:22px; border-radius:50%; border:2px solid ${BORDER}; background:${WHITE}; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; position:relative; z-index:1; flex-shrink:0; transition:all 0.2s; }
  .st-dot.done { background:${SKY_D}; border-color:${SKY_D}; color:${WHITE}; }
  .st-dot.active { background:${WHITE}; border-color:${SKY_D}; color:${SKY_D}; box-shadow:0 0 0 3px rgba(0,123,168,0.15); }
  .st-dot.cancelled { background:#fff0f0; border-color:#c0392b; color:#c0392b; }
  .st-label { font-size:10px; color:#7a9aaa; margin-top:5px; text-align:center; white-space:nowrap; font-weight:400; transition:all 0.2s; }
  .st-label.done  { color:${SKY_D}; font-weight:700; }
  .st-label.active { color:#1a3a4a; font-weight:700; }
  .st-label.cancelled { color:#c0392b; font-weight:700; }
  .st-line { flex:1; height:2px; background:${BORDER}; margin-bottom:18px; min-width:12px; transition:background 0.3s; }
  .st-line.done { background:${SKY_D}; }
  .st-line.cancelled { background:#f5c4c4; }

  @media(max-width:700px) {
    .acc-main { grid-template-columns:1fr; }
    .acc-sidebar { display:none; }
    .acc-tabs-mobile { display:flex; }
    .acc-grid-2 { grid-template-columns:1fr; }
    .acc-hero-inner { gap:0.85rem; }
  }
`

function injectCSS() {
  if (document.getElementById('acc-css')) return
  const s = document.createElement('style')
  s.id = 'acc-css'; s.textContent = CSS
  document.head.appendChild(s)
}

// ─── Status Timeline Component ────────────────────────────────
function StatusTimeline({ status }) {
  const normalised   = (status || 'pending').toLowerCase()
  const isCancelled  = normalised === 'cancelled' || normalised === 'refunded'
  const activeIdx    = STATUS_STEPS.indexOf(normalised)

  return (
    <div className="status-timeline">
      {STATUS_STEPS.map((step, i) => {
        const done    = !isCancelled && i < activeIdx
        const active  = !isCancelled && i === activeIdx
        const dimmed  = isCancelled && i > 1   // grey out future steps after cancellation
        const cancelAt = isCancelled && i === 1 // show ✕ at confirmed step (first step after placed)

        let dotClass = ''
        if (done)     dotClass = 'done'
        if (active)   dotClass = 'active'
        if (cancelAt) dotClass = 'cancelled'

        let labelClass = ''
        if (done)     labelClass = 'done'
        if (active)   labelClass = 'active'
        if (cancelAt) labelClass = 'cancelled'

        const stepLabel = step === 'pending' ? 'Placed' : step.charAt(0).toUpperCase() + step.slice(1)

        return (
          <div key={step} style={{ display:'flex', alignItems:'center', flex: i < STATUS_STEPS.length - 1 ? '1' : 'none' }}>
            <div className="st-step" style={{ opacity: dimmed ? 0.3 : 1 }}>
              <div className={`st-dot${dotClass ? ' ' + dotClass : ''}`}>
                {done     && '✓'}
                {cancelAt && '✕'}
              </div>
              <div className={`st-label${labelClass ? ' ' + labelClass : ''}`}>
                {stepLabel}
              </div>
            </div>

            {i < STATUS_STEPS.length - 1 && (
              <div
                className={`st-line${
                  done ? ' done' :
                  (isCancelled && i === 0) ? ' cancelled' :
                  ''
                }`}
                style={{ opacity: (isCancelled && i >= 1) ? 0.25 : 1 }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Avatar Upload Component ──────────────────────────────────
function AvatarUploader({ currentUrl, onUploaded }) {
  const fileRef                   = useRef(null)
  const [preview, setPreview]     = useState(currentUrl || null)
  const [uploading, setUploading] = useState(false)
  const [uploadErr, setUploadErr] = useState('')

  useEffect(() => {
    if (currentUrl && !preview) setPreview(currentUrl)
  }, [currentUrl])

  function handleClick() {
    setUploadErr('')
    fileRef.current?.click()
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowed.includes(file.type)) {
      setUploadErr('Only JPG, PNG or WEBP allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadErr('Image must be under 5 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    setUploading(true)
    setUploadErr('')

    try {
      const fd    = new FormData()
      fd.append('avatar', file)

      const token = localStorage.getItem('accessToken')
      const res   = await fetch(`${API_BASE}/profile/avatar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)

      const avatarUrl = data.avatar_url || data.avatarUrl
      if (avatarUrl) setPreview(avatarUrl)
      if (onUploaded) onUploaded(avatarUrl)

    } catch (err) {
      console.error('Avatar upload error:', err)
      setUploadErr(err.message || 'Upload failed.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'0.35rem' }}>
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        style={{ display:'none' }}
        onChange={handleFile}
      />

      <div
        className="acc-avatar-wrap"
        onClick={handleClick}
        title="Click to change photo"
        role="button"
        aria-label="Change profile photo"
      >
        {preview
          ? <img src={preview} alt="Profile" className="acc-avatar-img" />
          : <div className="acc-avatar-placeholder">📷</div>
        }

        {!uploading && (
          <div className="acc-avatar-overlay">
            <span>📷</span>
            <span>Change</span>
          </div>
        )}

        {uploading && (
          <div className="acc-avatar-uploading">
            <div className="acc-spinner" />
          </div>
        )}

        {!uploading && (
          <div className="acc-avatar-badge">✏️</div>
        )}
      </div>

      {uploadErr && (
        <div style={{
          fontSize:'0.68rem', color:'#ff6b6b',
          background:'rgba(255,255,255,0.15)', borderRadius:6,
          padding:'0.2rem 0.5rem', maxWidth:140, lineHeight:1.4,
        }}>
          {uploadErr}
        </div>
      )}
    </div>
  )
}

// ─── Orders Tab ───────────────────────────────────────────────
function OrdersTab() {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [expanded, setExpanded] = useState(null)
  const { navigate } = useRouter()

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    setLoading(true); setError('')
    try {
      const token = localStorage.getItem('accessToken')
      const res = await fetch(`${API_BASE}/orders?limit=50`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.message || `HTTP ${res.status}`)
      }
      const data = await res.json()
      setOrders(data.orders || data.data || data.items || [])
    } catch (err) {
      setError(err.message || 'Could not load orders.')
    } finally { setLoading(false) }
  }

  function fmt(d) {
    return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })
  }

  function statusStyle(status) {
    const s = ORDER_STATUS_COLORS[status] || { bg:'#f0f4f8', color:'#4a6a7a' }
    return {
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'0.2rem 0.65rem', borderRadius:100,
      fontSize:'0.68rem', fontWeight:800, textTransform:'uppercase',
      letterSpacing:'0.07em', background:s.bg, color:s.color,
    }
  }

  // Dot indicator inside the badge
  function StatusBadge({ status }) {
    const s = ORDER_STATUS_COLORS[status] || { bg:'#f0f4f8', color:'#4a6a7a' }
    return (
      <span style={statusStyle(status)}>
        <span style={{
          width:5, height:5, borderRadius:'50%',
          background:'currentColor', opacity:0.75,
          display:'inline-block', flexShrink:0,
        }} />
        {status || 'pending'}
      </span>
    )
  }

  if (loading) return (
    <div style={{ padding:'2rem', textAlign:'center' }}>
      <div style={{ fontSize:'1.5rem', marginBottom:'0.75rem', opacity:0.4 }}>📦</div>
      <p style={{ color:MID, fontSize:'0.85rem' }}>Loading your orders…</p>
    </div>
  )

  if (error) return (
    <div>
      <div style={{ background:'#fff0f0', border:'1px solid #f5a0a0', borderRadius:10, padding:'1rem', marginBottom:'1.25rem', color:'#c0392b', fontSize:'0.85rem' }}>
        ⚠️ {error}
      </div>
      <button onClick={fetchOrders} style={{ padding:'0.5rem 1.25rem', borderRadius:8, border:`1.5px solid ${BORDER}`, background:'none', color:SKY_D, fontSize:'0.82rem', cursor:'pointer', fontWeight:600 }}>
        🔄 Try Again
      </button>
    </div>
  )

  if (orders.length === 0) return (
    <div style={{ textAlign:'center', padding:'3rem 1rem' }}>
      <div style={{ fontSize:'3rem', marginBottom:'1rem', opacity:0.3 }}>📦</div>
      <p style={{ color:MID, marginBottom:'0.5rem', fontFamily:'var(--font-display)', fontSize:'1.05rem' }}>No orders yet</p>
      <p style={{ color:'#7a9aaa', fontSize:'0.85rem', marginBottom:'1.5rem' }}>When you purchase products or courses, they'll appear here.</p>
      <button onClick={() => navigate('/store')} style={{ padding:'0.65rem 1.5rem', borderRadius:10, border:'none', background:`linear-gradient(135deg,${SKY_D} 0%,#00BFFF 100%)`, color:WHITE, fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>
        Browse Shop →
      </button>
    </div>
  )

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'0.5rem' }}>
        <h2 style={{ fontFamily:'var(--font-display)', color:'#1a3a4a', fontSize:'clamp(1rem,3vw,1.2rem)', margin:0 }}>
          My Orders ({orders.length})
        </h2>
        <button onClick={fetchOrders} style={{ padding:'0.35rem 0.85rem', borderRadius:7, border:`1.5px solid ${BORDER}`, background:'none', color:MID, fontSize:'0.78rem', cursor:'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
        {orders.map((order) => {
          const isOpen   = expanded === order.id
          const items    = order.order_items || order.items || []
          const status   = (order.status || 'pending').toLowerCase()
          const isCancelledOrRefunded = status === 'cancelled' || status === 'refunded'

          return (
            <div
              key={order.id}
              style={{
                background:WHITE,
                border:`1.5px solid ${isOpen ? '#b0d4e8' : BORDER}`,
                borderRadius:12,
                overflow:'hidden',
                boxShadow: isOpen ? '0 4px 18px rgba(0,191,255,0.08)' : 'none',
                transition:'all 0.2s',
              }}
            >
              {/* ── Card header (always visible, clickable) ── */}
              <div
                onClick={() => setExpanded(isOpen ? null : order.id)}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'0.95rem 1.1rem', cursor:'pointer',
                  background: isOpen ? '#f0fbff' : WHITE,
                  flexWrap:'wrap', gap:'0.5rem',
                  transition:'background 0.15s',
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:'0.85rem' }}>
                  <div style={{
                    width:38, height:38, borderRadius:10,
                    background: isOpen ? `linear-gradient(135deg,${SKY_D} 0%,#00BFFF 100%)` : BG,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'1rem', flexShrink:0, transition:'all 0.2s',
                  }}>
                    <span style={{ color: isOpen ? WHITE : 'inherit' }}>📦</span>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:'#1a3a4a', fontSize:'0.88rem' }}>
                      {order.order_number || `#${order.id?.slice(0,8).toUpperCase()}`}
                    </div>
                    <div style={{ fontSize:'0.72rem', color:'#7a9aaa', marginTop:1 }}>
                      {fmt(order.created_at)}
                      {items.length > 0 && ` · ${items.length} item${items.length !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:'0.65rem', flexShrink:0 }}>
                  {/* ── Prominent status badge ── */}
                  <StatusBadge status={status} />

                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:800, color:'#1a3a4a', fontSize:'0.92rem' }}>
                      NPR {Number(order.total_amount || 0).toLocaleString()}
                    </div>
                  </div>

                  <span style={{
                    fontSize:'0.75rem', color:'#7a9aaa',
                    transition:'transform 0.2s', display:'inline-block',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                  }}>
                    ▾
                  </span>
                </div>
              </div>

              {/* ── Status timeline (always visible below header) ── */}
              <StatusTimeline status={status} />

              {/* ── Expanded details ── */}
              {isOpen && (
                <div style={{ borderTop:`1px solid ${BORDER}`, padding:'1.1rem' }}>

                  {/* Cancellation notice */}
                  {isCancelledOrRefunded && (
                    <div style={{
                      background:'#fff0f0', border:'1px solid #f5c4c4', borderRadius:8,
                      padding:'0.65rem 0.9rem', marginBottom:'1rem',
                      fontSize:'0.82rem', color:'#c0392b', display:'flex', alignItems:'center', gap:'0.5rem',
                    }}>
                      <span>✕</span>
                      <span>
                        This order was <strong>{status}</strong>
                        {status === 'refunded' ? ' — a refund has been processed.' : ' before processing.'}
                      </span>
                    </div>
                  )}

                  {/* Items list */}
                  {items.length > 0 ? (
                    <div style={{ marginBottom:'1rem' }}>
                      <div style={{ fontSize:'0.68rem', fontWeight:800, color:MID, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'0.6rem' }}>
                        Items
                      </div>
                      {items.map((item, idx) => {
                        const unitPrice = Number(item.unit_price || item.price || 0)
                        const qty       = Number(item.quantity || 1)
                        const lineTotal = Number(item.total_price || item.line_total || (unitPrice * qty) || 0)
                        return (
                          <div
                            key={item.id || idx}
                            style={{
                              display:'flex', justifyContent:'space-between', alignItems:'center',
                              padding:'0.5rem 0',
                              borderBottom: idx < items.length - 1 ? `1px solid ${BORDER}` : 'none',
                            }}
                          >
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{
                                fontSize:'0.85rem', fontWeight:600, color:'#1a3a4a',
                                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                                textDecoration: isCancelledOrRefunded ? 'line-through' : 'none',
                                opacity: isCancelledOrRefunded ? 0.6 : 1,
                              }}>
                                {item.products?.name || item.product_name || item.name || `Product #${String(item.product_id || '').slice(0,6) || '—'}`}
                              </div>
                              <div style={{ fontSize:'0.72rem', color:'#7a9aaa', marginTop:1 }}>
                                NPR {unitPrice.toLocaleString()} × {qty}
                              </div>
                            </div>
                            <div style={{
                              fontWeight:700,
                              color: isCancelledOrRefunded ? '#7a9aaa' : SKY_D,
                              fontSize:'0.85rem', flexShrink:0, marginLeft:'0.75rem',
                              textDecoration: isCancelledOrRefunded ? 'line-through' : 'none',
                            }}>
                              NPR {lineTotal.toLocaleString()}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize:'0.8rem', color:'#7a9aaa', marginBottom:'1rem' }}>
                      No item details available.
                    </p>
                  )}

                  {/* Totals */}
                  {(() => {
                    const subtotal  = Number(order.subtotal || order.sub_total || order.subtotal_amount || 0)
                    const discount  = Number(order.discount_amount || order.discount || order.coupon_discount || 0)
                    const tax       = Number(order.tax_amount || order.tax || order.vat_amount || 0)
                    const shipping  = Number(order.shipping_amount || order.shipping || order.delivery_charge || 0)
                    const total     = Number(order.total_amount || order.total || order.grand_total || 0)
                    const calculatedSubtotal = subtotal > 0 ? subtotal : items.reduce((sum, item) => {
                      const unit = Number(item.unit_price || item.price || 0)
                      const qty  = Number(item.quantity || 1)
                      return sum + (Number(item.total_price || item.line_total || 0) || unit * qty)
                    }, 0)
                    const rows = [
                      ['Subtotal', calculatedSubtotal],
                      discount > 0 && ['Discount', discount, true],
                      tax      > 0 && ['Tax',      tax],
                      shipping > 0 && ['Shipping', shipping],
                    ].filter(Boolean)

                    return (
                      <div style={{
                        background:BG, borderRadius:8,
                        padding:'0.75rem 1rem', marginBottom:'1rem',
                        display:'flex', flexDirection:'column', gap:'0.3rem',
                      }}>
                        {rows.map(([label, val, isDiscount]) => (
                          <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', color:MID }}>
                            <span>{label}</span>
                            <span style={{ color: isDiscount ? '#1a7a4a' : 'inherit' }}>
                              {isDiscount ? '− ' : ''}NPR {Number(val || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                        <div style={{
                          display:'flex', justifyContent:'space-between',
                          fontSize:'0.9rem', fontWeight:800, color:'#1a3a4a',
                          borderTop:`1px solid ${BORDER}`, paddingTop:'0.4rem', marginTop:'0.2rem',
                        }}>
                          <span>{isCancelledOrRefunded ? 'Order Total' : 'Total Paid'}</span>
                          <span style={{ textDecoration: isCancelledOrRefunded ? 'line-through' : 'none', opacity: isCancelledOrRefunded ? 0.5 : 1 }}>
                            NPR {total.toLocaleString()}
                          </span>
                        </div>

                        {/* Refund row */}
                        {status === 'refunded' && (
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.88rem', fontWeight:700, color:'#1a7a4a', paddingTop:'0.3rem' }}>
                            <span>Refund Processed</span>
                            <span>NPR {total.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  {/* Notes & coupon */}
                  {order.notes && (
                    <div style={{ fontSize:'0.8rem', color:'#7a9aaa', fontStyle:'italic', marginTop:'0.5rem' }}>
                      Note: {order.notes}
                    </div>
                  )}

                  {order.coupon_code && (
                    <div style={{
                      display:'inline-flex', alignItems:'center', gap:'0.4rem',
                      marginTop:'0.65rem', background:'#e8f8f0', color:'#1a7a4a',
                      borderRadius:100, padding:'0.2rem 0.65rem',
                      fontSize:'0.75rem', fontWeight:700,
                    }}>
                      🎫 Coupon applied: {order.coupon_code}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function MyAccountPage() {
  useEffect(() => { injectCSS() }, [])

  const { navigate }                  = useRouter()
  const { user, logout, refreshUser } = useAuth()
  const [tab,     setTab]     = useState('profile')
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  const [form, setForm] = useState({
    full_name:'', phone:'', date_of_birth:'', gender:'',
    address:'', city:'', bio:'', language:'en', emergency_contact:'',
  })

  const [pwForm,   setPwForm]   = useState({ current:'', newPw:'', confirm:'' })
  const [pwMsg,    setPwMsg]    = useState('')
  const [pwErr,    setPwErr]    = useState('')
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    profileApi.get().then(d => {
      const p = d.user || d
      setForm({
        full_name:         p.fullName         || p.full_name         || '',
        phone:             p.phone            || '',
        date_of_birth:     p.dateOfBirth      || p.date_of_birth     || '',
        gender:            p.gender           || '',
        address:           p.address          || '',
        city:              p.city             || '',
        bio:               p.bio              || '',
        language:          p.language         || 'en',
        emergency_contact: p.emergencyContact || p.emergency_contact || '',
      })
    }).catch(() => {})
  }, [user])

  async function handleSave() {
    setSaving(true); setError(''); setSaved(false)
    try {
      await profileApi.update(form)
      await refreshUser()
      setSaved(true); setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err.message || 'Could not save profile.')
    } finally { setSaving(false) }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwErr(''); setPwMsg('')
    if (!pwForm.current || !pwForm.newPw)  { setPwErr('Please fill all fields.'); return }
    if (pwForm.newPw !== pwForm.confirm)   { setPwErr('Passwords do not match.'); return }
    if (pwForm.newPw.length < 8)           { setPwErr('Minimum 8 characters.'); return }
    setPwSaving(true)
    try {
      await profileApi.changePassword(pwForm.current, pwForm.newPw)
      setPwMsg('Password changed. Signing you out…')
      setTimeout(() => logout(), 2000)
    } catch (err) {
      setPwErr(err.message || 'Could not change password.')
    } finally { setPwSaving(false) }
  }

  async function handleAvatarUploaded(url) {
    try { await refreshUser() } catch (_) {}
  }

  const up = k => v => setForm(f => ({ ...f, [k]: v }))

  const inputSx = {
    width:'100%', padding:'0.75rem 1rem',
    border:`1.5px solid ${BORDER}`, borderRadius:10,
    fontSize:'0.9rem', color:'#1a3a4a', outline:'none',
    boxSizing:'border-box',
    background: editing ? WHITE : BG,
    transition:'background 0.2s',
  }
  const labelSx = {
    display:'block', fontSize:'0.72rem', fontWeight:800,
    color:MID, textTransform:'uppercase',
    letterSpacing:'0.08em', marginBottom:'0.4rem',
  }

  const TabBtn = ({ id, icon, label }) => (
    <button className={`acc-tab-btn${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>
      {icon} {label}
    </button>
  )

  return (
    <div className="acc-layout">

      {/* ── Hero ── */}
      <div className="acc-hero">
        <div className="acc-hero-inner">

          <AvatarUploader
            currentUrl={user?.avatarUrl || user?.avatar_url || null}
            onUploaded={handleAvatarUploaded}
          />

          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{
              fontFamily:'var(--font-display)',
              fontSize:'clamp(1.2rem,5vw,1.6rem)', color:WHITE, margin:0,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>
              {user?.fullName || user?.full_name || 'Your Account'}
            </h1>
            <p style={{
              color:'rgba(255,255,255,0.75)', fontSize:'clamp(0.72rem,2vw,0.82rem)',
              margin:'0.25rem 0 0',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>
              {user?.email}
            </p>
          </div>

          <button
            onClick={logout}
            style={{
              padding:'0.45rem 1rem', borderRadius:9,
              border:'1.5px solid rgba(255,255,255,0.35)',
              background:'rgba(255,255,255,0.12)', color:WHITE,
              fontSize:'0.8rem', fontWeight:600, cursor:'pointer',
              flexShrink:0, whiteSpace:'nowrap',
            }}
          >
            🚪 Log Out
          </button>
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className="acc-tabs-mobile">
        {TABS.map(t => <TabBtn key={t.id} {...t}/>)}
      </div>

      {/* Main grid */}
      <div className="acc-main">

        {/* Desktop sidebar */}
        <div className="acc-sidebar">
          {TABS.map(t => (
            <button key={t.id} className="acc-sidebar-btn" onClick={() => setTab(t.id)}
              style={{ background: tab === t.id ? 'var(--sky-light)' : 'transparent' }}>
              <span style={{ fontSize:'0.95rem', width:20, textAlign:'center' }}>{t.icon}</span>
              <span style={{ fontSize:'0.84rem', fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? SKY_D : MID }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="acc-content">

          {/* ── PROFILE TAB ── */}
          {tab === 'profile' && (
            <>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'0.75rem' }}>
                <h2 style={{ fontFamily:'var(--font-display)', color:'#1a3a4a', fontSize:'clamp(1rem,3vw,1.2rem)', margin:0 }}>
                  Profile Information
                </h2>
                {!editing
                  ? <button onClick={() => setEditing(true)} style={{ padding:'0.45rem 1rem', borderRadius:8, border:`1.5px solid ${BORDER}`, background:'none', fontSize:'0.82rem', color:SKY_D, cursor:'pointer', fontWeight:600 }}>✏️ Edit</button>
                  : <div style={{ display:'flex', gap:'0.5rem' }}>
                      <button onClick={() => setEditing(false)} style={{ padding:'0.45rem 1rem', borderRadius:8, border:`1.5px solid ${BORDER}`, background:'none', fontSize:'0.82rem', color:MID, cursor:'pointer' }}>Cancel</button>
                      <button onClick={handleSave} disabled={saving} style={{ padding:'0.45rem 1rem', borderRadius:8, border:'none', background:SKY_D, color:WHITE, fontSize:'0.82rem', fontWeight:700, cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
                        {saving ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                }
              </div>

              {saved && <div style={{ background:'#e8f8f0', border:'1px solid #a0ddb8', borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem', fontSize:'0.85rem', color:'#1a7a4a' }}>✓ Profile saved!</div>}
              {error && <div style={{ background:'#fff0f0', border:'1px solid #f5a0a0', borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem', fontSize:'0.85rem', color:'#c0392b' }}>{error}</div>}

              <div className="acc-grid-2">
                {[
                  { key:'full_name',         label:'Full Name',         type:'text' },
                  { key:'phone',             label:'Phone',             type:'tel'  },
                  { key:'date_of_birth',     label:'Date of Birth',     type:'date' },
                  { key:'city',              label:'City',              type:'text' },
                  { key:'address',           label:'Address',           type:'text' },
                  { key:'emergency_contact', label:'Emergency Contact', type:'text' },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label style={labelSx}>{label}</label>
                    <input type={type} value={form[key]} disabled={!editing} onChange={e => up(key)(e.target.value)} style={inputSx}/>
                  </div>
                ))}

                <div>
                  <label style={labelSx}>Gender</label>
                  <select value={form.gender} disabled={!editing} onChange={e => up('gender')(e.target.value)} style={{ ...inputSx, cursor: editing ? 'pointer' : 'default' }}>
                    <option value="">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non_binary">Non-binary</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>

                <div>
                  <label style={labelSx}>Language</label>
                  <select value={form.language} disabled={!editing} onChange={e => up('language')(e.target.value)} style={{ ...inputSx, cursor: editing ? 'pointer' : 'default' }}>
                    <option value="en">English</option>
                    <option value="ne">Nepali</option>
                  </select>
                </div>

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={labelSx}>Bio</label>
                  <textarea value={form.bio} disabled={!editing} rows={3} onChange={e => up('bio')(e.target.value)}
                    style={{ ...inputSx, resize:'vertical', fontFamily:'var(--font-body)', lineHeight:1.65 }}/>
                </div>
              </div>
            </>
          )}

          {/* ── ORDERS TAB ── */}
          {tab === 'orders' && <OrdersTab />}

          {/* ── SECURITY TAB ── */}
          {tab === 'security' && (
            <>
              <h2 style={{ fontFamily:'var(--font-display)', color:'#1a3a4a', fontSize:'clamp(1rem,3vw,1.2rem)', marginBottom:'1.5rem' }}>Change Password</h2>
              {pwMsg && <div style={{ background:'#e8f8f0', border:'1px solid #a0ddb8', borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem', fontSize:'0.85rem', color:'#1a7a4a' }}>{pwMsg}</div>}
              {pwErr && <div style={{ background:'#fff0f0', border:'1px solid #f5a0a0', borderRadius:8, padding:'0.65rem 1rem', marginBottom:'1rem', fontSize:'0.85rem', color:'#c0392b' }}>{pwErr}</div>}
              <form onSubmit={handlePasswordChange} style={{ display:'flex', flexDirection:'column', gap:'1rem', maxWidth:400 }}>
                {[
                  { key:'current', label:'Current Password' },
                  { key:'newPw',   label:'New Password' },
                  { key:'confirm', label:'Confirm New Password' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={labelSx}>{label}</label>
                    <input type="password" value={pwForm[key]} onChange={e => setPwForm(f => ({ ...f, [key]:e.target.value }))} style={inputSx}/>
                  </div>
                ))}
                <button type="submit" disabled={pwSaving} style={{ padding:'0.8rem 1.5rem', background:SKY_D, color:WHITE, border:'none', borderRadius:10, fontWeight:700, fontSize:'0.9rem', cursor:'pointer', opacity: pwSaving ? 0.7 : 1 }}>
                  {pwSaving ? 'Changing…' : 'Change Password'}
                </button>
              </form>
            </>
          )}

          {/* ── SESSIONS TAB ── */}
          {tab === 'sessions' && (
            <div style={{ textAlign:'center', padding:'3rem 2rem', color:'var(--text-light)' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>📅</div>
              <p style={{ marginBottom:'1.5rem' }}>View all your sessions from the Client Portal.</p>
              <button className="btn btn-primary" onClick={() => navigate('/portal')}>Go to My Portal →</button>
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {tab === 'notifications' && (
            <div style={{ textAlign:'center', padding:'3rem 2rem', color:'var(--text-light)' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🔔</div>
              <p style={{ marginBottom:'1.5rem' }}>See in Client Portal.</p>
              <button className="btn btn-primary" onClick={() => navigate('/portal')}>Go to My Portal →</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}