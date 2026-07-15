// src/pages/CartPage.jsx
// Dedicated cart + checkout page, reached from the store's cart button.
// Blue-white frosted glass design matching the store's quick-view look.
// Fetches the cart independently (own route), lets the user edit
// quantities, drop a real delivery pin on an embedded OpenStreetMap
// picker, fill contact details, and pay — same payment flow as before.

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter }  from '../context/RouterContext'
import { useAuth }    from '../context/AuthContext'
import { usePayment } from '../components/PaymentModal'
import { store as storeApi } from '../services/api'

// ── Blue-white frosted glass palette (matches StorePage quick-view) ──
const GLASS = {
  bg:        'linear-gradient(160deg, rgba(255,255,255,0.75) 0%, rgba(214,238,252,0.58) 55%, rgba(255,255,255,0.72) 100%)',
  border:    '1px solid rgba(255,255,255,0.6)',
  shadow:    '0 4px 22px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.55)',
}

const PANEL = {
  bg:     'linear-gradient(160deg, rgba(255,255,255,0.85) 0%, rgba(224,242,254,0.6) 100%)',
  border: '1px solid rgba(255,255,255,0.65)',
  shadow: '0 2px 14px rgba(0,90,140,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
}

const PAGE_BG = `
  radial-gradient(ellipse 90% 55% at 8% 0%, rgba(186,220,248,0.5) 0%, transparent 62%),
  radial-gradient(ellipse 70% 65% at 100% 6%, rgba(214,238,252,0.55) 0%, transparent 60%),
  radial-gradient(ellipse 65% 55% at 45% 100%, rgba(200,232,250,0.35) 0%, transparent 60%),
  linear-gradient(180deg, #eef8fc 0%, #f6fbff 45%, #eaf5fb 100%)
`

const HEADER_BG = `
  linear-gradient(135deg,
    rgba(0,105,148,0.95) 0%,
    rgba(0,158,214,0.92) 32%,
    rgba(0,191,255,0.88) 58%,
    rgba(210,244,255,0.82) 100%)
`


// ── Leaflet / OpenStreetMap (no API key needed) ──
const LEAFLET_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
const LEAFLET_JS  = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
const DEFAULT_CENTER = [27.7172, 85.3240] // Kathmandu fallback

function useLeafletLoader() {
  const [ready, setReady] = useState(!!window.L)
  useEffect(() => {
    if (window.L) { setReady(true); return }
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'; link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }
    let script = document.querySelector(`script[src="${LEAFLET_JS}"]`)
    if (!script) {
      script = document.createElement('script')
      script.src = LEAFLET_JS; script.async = true
      document.body.appendChild(script)
    }
    const onLoad = () => setReady(true)
    script.addEventListener('load', onLoad)
    if (window.L) setReady(true)
    return () => script.removeEventListener('load', onLoad)
  }, [])
  return ready
}

function MapPicker({ onLocationChange }) {
  const leafletReady = useLeafletLoader()
  const mapEl = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [status, setStatus] = useState('Locating you…')
  const [coords, setCoords] = useState(null)
  const lastGeocodeRef = useRef(0)

  const reverseGeocode = useCallback(async (lat, lng) => {
    setStatus('Looking up address…')
    setCoords({ lat, lng })

    // Nominatim caps requests at ~1/sec. If the initial geolocation lookup
    // and a map click land close together, throttle so we don't get
    // rate-limited — which otherwise looks identical to a network failure.
    const wait = Math.max(0, 1100 - (Date.now() - lastGeocodeRef.current))
    if (wait > 0) await new Promise(r => setTimeout(r, wait))
    lastGeocodeRef.current = Date.now()

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
      )
      if (!res.ok) throw new Error(`Nominatim returned ${res.status}`)
      const data = await res.json()
      if (!data || data.error) throw new Error(data?.error || 'No address found')

      const formatted = data.display_name || ''
      const addr = data.address || {}
      const city = addr.city || addr.town || addr.village || addr.county || ''
      onLocationChange({
        latitude: lat, longitude: lng,
        formatted_address: formatted,
        address_line: [addr.road, addr.suburb].filter(Boolean).join(', ') || formatted,
        city,
      })
      setStatus(formatted || 'Pin placed — drag to adjust')
    } catch {
      // lat/lng are still sent to the backend — they're what the rider
      // actually uses. The address text is a convenience label only.
      onLocationChange({ latitude: lat, longitude: lng, formatted_address: '', address_line: '', city: '' })
      setStatus('Exact location saved — address text unavailable right now. Drag the pin to retry.')
    }
  }, [onLocationChange])

  useEffect(() => {
    if (!leafletReady || mapRef.current) return
    const L = window.L
    const map = L.map(mapEl.current).setView(DEFAULT_CENTER, 14)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
    }).addTo(map)

    const marker = L.marker(DEFAULT_CENTER, { draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng()
      reverseGeocode(lat, lng)
    })
    map.on('click', e => {
      marker.setLatLng(e.latlng)
      reverseGeocode(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map
    markerRef.current = marker

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords
          map.setView([latitude, longitude], 15)
          marker.setLatLng([latitude, longitude])
          reverseGeocode(latitude, longitude)
        },
        () => reverseGeocode(DEFAULT_CENTER[0], DEFAULT_CENTER[1]),
        { timeout: 8000, enableHighAccuracy: true, maximumAge: 0 }
      )
    } else {
      reverseGeocode(DEFAULT_CENTER[0], DEFAULT_CENTER[1])
    }

    setTimeout(() => map.invalidateSize(), 200)
  }, [leafletReady, reverseGeocode])

  return (
    <div>
      <div ref={mapEl} style={{ width:'100%', height:260, borderRadius:14, overflow:'hidden', border:'1.5px solid rgba(120,190,230,0.5)', boxShadow:'0 2px 14px rgba(0,90,140,0.10)' }} />
      <p style={{ fontSize:'0.74rem', color:'var(--text-light)', marginTop:'0.5rem' }}>
        📍 {status} — tap the map or drag the pin to set your exact delivery location.
      </p>
      {coords && (
        <p style={{ fontSize:'0.7rem', color:'var(--green-deep)', fontWeight:600, marginTop:'0.15rem', fontFamily:'monospace' }}>
          Exact pin: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
        </p>
      )}
    </div>
  )
}

function QtyStepper({ value, onChange }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
      <button onClick={() => onChange(value - 1)}
        style={{ width:30, height:30, borderRadius:'50%', border:'1.5px solid rgba(120,190,230,0.5)', background:'rgba(255,255,255,0.7)', cursor:'pointer', fontWeight:700, color:'var(--green-deep)' }}>−</button>
      <span style={{ minWidth:22, textAlign:'center', fontWeight:700, fontSize:'0.92rem', color:'var(--text-mid)' }}>{value}</span>
      <button onClick={() => onChange(value + 1)}
        style={{ width:30, height:30, borderRadius:'50%', border:'1.5px solid rgba(120,190,230,0.5)', background:'rgba(255,255,255,0.7)', cursor:'pointer', fontWeight:700, color:'var(--green-deep)' }}>+</button>
    </div>
  )
}

export default function CartPage() {
  const { navigate }    = useRouter()
  const { user }        = useAuth()
  const { openPayment } = usePayment()

  const [cart,    setCart]    = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId,  setBusyId]  = useState(null)
  const [placingOrder, setPlacingOrder] = useState(false)

  const [contact, setContact] = useState({ full_name:'', phone:'', landmark:'', notes:'' })
  const [location, setLocation] = useState(null)
  const [addrErr, setAddrErr] = useState('')

  useEffect(() => {
    if (!user) { navigate('/signin'); return }
    setLoading(true)
    storeApi.getCart().then(d => setCart(d.cart || [])).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  async function updateQty(productId, qty) {
    if (qty < 1) return removeItem(productId)
    setCart(prev => prev.map(i => (i.products?.id || i.product_id) === productId ? { ...i, quantity: qty } : i))
    try { await storeApi.updateCart(productId, qty) }
    catch { storeApi.getCart().then(d => setCart(d.cart || [])).catch(() => {}) }
  }

  async function removeItem(productId) {
    setBusyId(productId)
    const prevCart = cart
    setCart(prev => prev.filter(i => (i.products?.id || i.product_id) !== productId))
    try { await storeApi.removeFromCart(productId) }
    catch { setCart(prevCart) }
    finally { setBusyId(null) }
  }

  const cartCount = cart.reduce((s,i) => s + (i.quantity || 1), 0)
  const cartTotal = cart.reduce((s,i) => {
    const p = i.products || {}
    return s + (p.sale_price ?? p.price ?? 0) * (i.quantity || 1)
  }, 0)

  async function handleCheckout() {
    if (!contact.full_name.trim())  return setAddrErr('Full name is required.')
    if (!contact.phone.trim())      return setAddrErr('Phone number is required.')
    if (!location)                  return setAddrErr('Please drop a pin on the map for delivery.')
    setAddrErr('')

    const itemLines = cart.map(item => {
      const p = item.products || {}
      const price = p.sale_price ?? p.price ?? 0
      return { label: `${p.name} × ${item.quantity || 1}`, amount: price * (item.quantity || 1) }
    })

    setPlacingOrder(true)
    let orderId
    try {
      const orderData = await storeApi.createOrder({ location: { ...contact, ...location } })
      orderId = orderData.order?.id
    } catch (err) {
      setPlacingOrder(false)
      alert('Could not create order: ' + (err.message || 'Please try again.'))
      return
    }

    const result = await openPayment({
      type: 'order',
      amount: cartTotal,
      title: `Store Order #${String(orderId).slice(-8).toUpperCase()}`,
      description: `${cartCount} item${cartCount !== 1 ? 's' : ''} from Common Psychology Store`,
      itemLines,
      couponEnabled: true,
      allowedGateways: ['esewa', 'khalti', 'fonepay', 'stripe', 'bank_transfer', 'cash'],
      metadata: { order_id: orderId, item_count: cartCount, category: 'order' },
    })
    setPlacingOrder(false)

    if (result.success) {
      try { await storeApi.clearCart() } catch {}
      setCart([])
      navigate('/portal')
    } else if (!result.cancelled) {
      alert('Payment was not completed. Your order is saved — you can complete payment from your portal.')
    }
  }

  return (
    <div className="page-wrapper" style={{ minHeight:'100vh', background: PAGE_BG }}>
     {/* Header */}
<div style={{
  position:'sticky', top:0, zIndex:20,
  background: HEADER_BG,
  backdropFilter:'blur(16px) saturate(160%)',
  WebkitBackdropFilter:'blur(16px) saturate(160%)',
  padding:'1.1rem 1.25rem',
  boxShadow:'0 8px 30px rgba(0,191,255,0.32), inset 0 1px 0 rgba(255,255,255,0.65), inset 0 -1px 0 rgba(255,255,255,0.12)',
  borderBottom:'1px solid rgba(255,255,255,0.55)',
  position:'sticky', overflow:'hidden',
}}>
  {/* glossy diagonal shine */}
  <div style={{
    position:'absolute', inset:0, pointerEvents:'none',
    background:'linear-gradient(115deg, transparent 28%, rgba(255,255,255,0.38) 46%, rgba(255,255,255,0.06) 58%, transparent 72%)',
  }} />

  {/* brittle-glass crack facets */}
  <svg
    style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.25, pointerEvents:'none' }}
    preserveAspectRatio="none" viewBox="0 0 400 90"
  >
    <polyline points="0,8 38,24 66,6 118,30" stroke="white" strokeWidth="0.55" fill="none" />
    <polyline points="118,30 156,14 198,34" stroke="white" strokeWidth="0.5" fill="none" />
    <polyline points="248,0 258,22 298,10 322,42" stroke="white" strokeWidth="0.5" fill="none" />
    <polyline points="326,52 358,28 400,54" stroke="white" strokeWidth="0.45" fill="none" />
    <polyline points="0,58 28,80 58,52 92,88" stroke="white" strokeWidth="0.4" fill="none" />
    <polyline points="190,90 210,62 240,86" stroke="white" strokeWidth="0.35" fill="none" />
  </svg>

  <div style={{ maxWidth:1080, margin:'0 auto', display:'flex', alignItems:'center', gap:'0.9rem', position:'relative', zIndex:1 }}>
    <button onClick={() => navigate('/store')}
      style={{
        width:36, height:36, borderRadius:'50%',
        border:'1px solid rgba(255,255,255,0.55)',
        background:'rgba(255,255,255,0.18)',
        backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
        color:'#fff', fontSize:'1.05rem', cursor:'pointer', flexShrink:0,
        boxShadow:'inset 0 1px 0 rgba(255,255,255,0.4)',
      }}>←</button>
    <div>
      <h1 style={{
        fontFamily:'var(--font-display)', fontSize:'1.25rem', color:'#fff',
        fontWeight:700, margin:0, textShadow:'0 1px 6px rgba(0,60,90,0.35)',
      }}>Your Cart</h1>
      <p style={{
        fontSize:'0.75rem', color:'rgba(255,255,255,0.88)', margin:0,
        textShadow:'0 1px 4px rgba(0,60,90,0.3)',
      }}>{cartCount} item{cartCount !== 1 ? 's' : ''}</p>
    </div>
  </div>
</div>

      <div style={{ maxWidth:1080, margin:'0 auto', padding:'1.5rem 1.25rem 4rem' }}>
        {loading ? (
          <div style={{ display:'grid', gap:'1rem' }}>
            {Array.from({length:3}).map((_,i) => (
              <div key={i} style={{ background:GLASS.bg, border:GLASS.border, boxShadow:GLASS.shadow, borderRadius:18, height:96, opacity:0.5 }} />
            ))}
          </div>
        ) : cart.length === 0 ? (
          <div style={{ background:GLASS.bg, border:GLASS.border, boxShadow:GLASS.shadow, borderRadius:22, padding:'4rem 2rem', textAlign:'center', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🛒</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', color:'var(--green-deep)', marginBottom:'0.4rem' }}>Your cart is empty</h2>
            <p style={{ fontSize:'0.85rem', color:'var(--text-light)', marginBottom:'1.5rem' }}>Browse the store and add something to get started.</p>
            <button onClick={() => navigate('/store')}
              style={{ padding:'0.7rem 1.4rem', background:'var(--green-deep)', color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>
              ← Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-grid" style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr)', gap:'1.5rem', alignItems:'start' }}>
            {/* Left column: items only */}
            <div style={{
              background: GLASS.bg, border: GLASS.border, boxShadow: GLASS.shadow, borderRadius:20,
              padding:'1.5rem', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
            }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--green-deep)', fontWeight:700, marginBottom:'1rem' }}>Items</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem' }}>
                {cart.map((item, i) => {
                  const p = item.products || {}
                  const price = p.sale_price ?? p.price ?? 0
                  const img = p.images?.[0] || p.image_url
                  const pid = p.id || item.product_id
                  const lineTotal = price * (item.quantity || 1)
                  return (
                    <div key={i} style={{ display:'flex', gap:'1rem', alignItems:'center', background:PANEL.bg, border:PANEL.border, boxShadow:PANEL.shadow, borderRadius:14, padding:'0.85rem', opacity: busyId===pid ? 0.5 : 1, transition:'opacity 0.2s' }}>
                      <div style={{ width:64, height:64, borderRadius:10, background:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0, overflow:'hidden' }}>
                        {img ? <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '📚'}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--green-deep)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize:'0.78rem', color:'var(--text-light)' }}>NPR {price.toLocaleString()} each</div>
                      </div>
                      <QtyStepper value={item.quantity || 1} onChange={qty => updateQty(pid, qty)} />
                      <div style={{ width:88, textAlign:'right', fontWeight:700, fontSize:'0.88rem', color:'var(--green-deep)' }}>
                        NPR {lineTotal.toLocaleString()}
                      </div>
                      <button onClick={() => removeItem(pid)} title="Remove"
                        style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'1rem', flexShrink:0 }}>🗑</button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right column: delivery details (map + form) on top, order summary below */}
            <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem', minWidth:0 }}>

              {/* Delivery location + contact */}
              <div style={{ background:GLASS.bg, border:GLASS.border, boxShadow:GLASS.shadow, borderRadius:20, padding:'1.5rem', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)' }}>
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--green-deep)', fontWeight:700, marginBottom:'1rem' }}>Delivery Details</h2>

                <MapPicker onLocationChange={setLocation} />

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.6rem', marginTop:'1rem' }}>
                  <input placeholder="Full name *" value={contact.full_name} onChange={e => setContact(c => ({ ...c, full_name:e.target.value }))}
                    style={{ padding:'0.6rem 0.75rem', border:'1.5px solid rgba(120,190,230,0.4)', borderRadius:9, fontSize:'0.82rem', background:'rgba(255,255,255,0.75)', gridColumn:'1 / -1' }} />
                  <input placeholder="Phone number *" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone:e.target.value }))}
                    style={{ padding:'0.6rem 0.75rem', border:'1.5px solid rgba(120,190,230,0.4)', borderRadius:9, fontSize:'0.82rem', background:'rgba(255,255,255,0.75)', gridColumn:'1 / -1' }} />
                  <input placeholder="Landmark (optional)" value={contact.landmark} onChange={e => setContact(c => ({ ...c, landmark:e.target.value }))}
                    style={{ padding:'0.6rem 0.75rem', border:'1.5px solid rgba(120,190,230,0.4)', borderRadius:9, fontSize:'0.82rem', background:'rgba(255,255,255,0.75)', gridColumn:'1 / -1' }} />
                  <textarea placeholder="Delivery notes (optional)" value={contact.notes} onChange={e => setContact(c => ({ ...c, notes:e.target.value }))} rows={2}
                    style={{ padding:'0.6rem 0.75rem', border:'1.5px solid rgba(120,190,230,0.4)', borderRadius:9, fontSize:'0.82rem', resize:'vertical', background:'rgba(255,255,255,0.75)', gridColumn:'1 / -1' }} />
                </div>
                {addrErr && <p style={{ color:'#ef4444', fontSize:'0.76rem', marginTop:'0.6rem', fontWeight:600 }}>{addrErr}</p>}
              </div>

              {/* Order summary — now below map + form */}
              <div style={{
                background: GLASS.bg, border: GLASS.border, boxShadow: GLASS.shadow, borderRadius:20,
                padding:'1.5rem', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
              }} className="cart-summary">
                <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--green-deep)', fontWeight:700, marginBottom:'1rem' }}>Order Summary</h2>

                <div style={{ display:'flex', flexDirection:'column', gap:'0.55rem', marginBottom:'1rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color:'var(--text-mid)' }}>
                    <span>Subtotal ({cartCount} item{cartCount!==1?'s':''})</span>
                    <span>NPR {cartTotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.82rem', color:'var(--text-light)' }}>
                    <span>Delivery</span>
                    <span>Calculated at gateway</span>
                  </div>
                </div>

                <div style={{ borderTop:'1px solid rgba(120,190,230,0.35)', paddingTop:'0.85rem', marginBottom:'1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:700, color:'var(--text-mid)' }}>Total</span>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'1.25rem', fontWeight:700, color:'var(--green-deep)' }}>NPR {cartTotal.toLocaleString()}</span>
                </div>

                <button onClick={handleCheckout} disabled={placingOrder}
                  style={{ width:'100%', padding:'0.9rem', background: placingOrder ? '#94a3b8' : 'var(--green-deep)', color:'white', border:'none', borderRadius:12, fontWeight:700, fontSize:'0.92rem', cursor: placingOrder ? 'not-allowed' : 'pointer', boxShadow:'0 8px 22px rgba(29,158,117,0.25)' }}>
                  {placingOrder ? 'Placing order…' : 'Choose Payment Method →'}
                </button>
                <p style={{ fontSize:'0.7rem', color:'var(--text-light)', textAlign:'center', marginTop:'0.6rem' }}>
                  eSewa · Khalti · QR · Card · Bank Transfer · Cash on Delivery
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 860px) {
          .cart-grid { grid-template-columns: 1fr 1.6fr !important; }
        }
      `}</style>
    </div>
  )
}