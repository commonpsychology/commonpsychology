// src/pages/StorePage.jsx
// Products/categories/cart come from the backend (Supabase-backed).
// Quick-view: glass blue-white card, 4-image slider that expands to a
// fullscreen lightbox, ratings + reviews (fetched fresh per product).
// Checkout: instead of typed address fields, the user drops a pin on an
// embedded Leaflet/OpenStreetMap picker (no API key needed); lat/lng +
// reverse-geocoded address are sent to the backend and stored on the
// order for the delivery rider to use.

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter }  from '../context/RouterContext'
import { useAuth }    from '../context/AuthContext'
import { usePayment } from '../components/PaymentModal'
import { store as storeApi } from '../services/api'
import EleventhPaymentPromo from '../components/EleventhPaymentPromo'

// ── Glass card palette — bluish-white frosted look ──
const GLASS = {
  bg:        'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)',
  bgHover:   'linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(200,232,250,0.68) 55%, rgba(255,255,255,0.78) 100%)',
  border:    '1px solid rgba(255,255,255,0.55)',
  borderHov: '1px solid rgba(120,190,230,0.65)',
  shadow:    '0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.5)',
  shadowHov: '0 20px 44px rgba(0,123,168,0.22), 0 6px 16px rgba(29,158,117,0.14), inset 0 1px 0 rgba(255,255,255,0.6)',
}

const CARD = {
  bg: '#ffffff', bgHover: '#ffffff',
  border:    '1px solid rgba(226,232,240,0.9)',
  borderHov: '1px solid rgba(29,158,117,0.35)',
  shadow:    '0 2px 12px rgba(15,23,42,0.06)',
  shadowHov: '0 16px 34px rgba(15,23,42,0.10)',
}

const SECTION_BG = `
  radial-gradient(ellipse 80% 60% at 12% 15%, rgba(180,230,210,0.32) 0%, transparent 70%),
  radial-gradient(ellipse 70% 80% at 88% 8%, rgba(186,220,248,0.38) 0%, transparent 65%),
  radial-gradient(ellipse 60% 60% at 50% 100%, rgba(254,243,199,0.28) 0%, transparent 60%),
  linear-gradient(180deg, #f5fbff 0%, #eef8fc 55%, #f8fcff 100%)
`

// ─── Star rating (read-only) ───────────────────────────────────────────────
function Stars({ value = 0, size = '0.85rem' }) {
  const full = Math.round(value)
  return (
    <span style={{ color:'#f59e0b', fontSize:size, letterSpacing:1 }}>
      {'★'.repeat(full)}{'☆'.repeat(5 - full)}
    </span>
  )
}

// ─── Interactive star picker (for writing a review) ────────────────────────
function StarPicker({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.3rem', color: n <= value ? '#f59e0b' : '#d1d5db', padding:0, lineHeight:1 }}>
          ★
        </button>
      ))}
    </div>
  )
}

// ─── Fullscreen image lightbox ──────────────────────────────────────────────
function Lightbox({ images, index, onClose, onNav }) {
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNav(1)
      if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onNav])

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1400, background:'rgba(6,10,20,0.92)', display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <button onClick={onClose} style={{ position:'absolute', top:18, right:20, width:38, height:38, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:'1.1rem', cursor:'pointer' }}>✕</button>
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); onNav(-1) }} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', width:44, height:44, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:'1.4rem', cursor:'pointer' }}>‹</button>
      )}
      <img src={images[index]} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth:'92vw', maxHeight:'88vh', objectFit:'contain', borderRadius:12, boxShadow:'0 20px 70px rgba(0,0,0,0.5)' }} />
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); onNav(1) }} style={{ position:'absolute', right:16, top:'50%', transform:'translateY(-50%)', width:44, height:44, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:'1.4rem', cursor:'pointer' }}>›</button>
      )}
      {images.length > 1 && (
        <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', display:'flex', gap:6 }}>
          {images.map((_, i) => (
            <span key={i} style={{ width:7, height:7, borderRadius:'50%', background: i === index ? '#fff' : 'rgba(255,255,255,0.35)' }} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Product Quick-View Modal (glass, image slider, ratings, reviews) ──────
function ProductQuickView({ productSummary, onClose, onAddToCart, adding }) {
  const [product, setProduct] = useState(productSummary)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  const [myName, setMyName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewMsg, setReviewMsg] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    storeApi.product(productSummary.id)
      .then(d => { if (!cancelled) setProduct(d.product || productSummary) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [productSummary.id])

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const images = (product.images?.length ? product.images : product.image_url ? [product.image_url] : []).slice(0, 4)
  const price = product.sale_price ?? product.price ?? 0

  async function submitReview() {
    if (!myRating) { setReviewMsg('Pick a star rating first.'); return }
    setSubmitting(true); setReviewMsg('')
    try {
      await storeApi.addReview(product.id, { rating: myRating, comment: myComment, author_name: myName || undefined })
      const fresh = await storeApi.productDetail(product.id)
      setProduct(fresh.product)
      setMyRating(0); setMyComment(''); setMyName('')
      setReviewMsg('Thanks for your review!')
    } catch (e) {
      setReviewMsg(e.message || 'Could not submit review.')
    } finally { setSubmitting(false) }
  }

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:1100, background:'rgba(15,23,42,0.55)', backdropFilter:'blur(3px)', WebkitBackdropFilter:'blur(3px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        width:'100%', maxWidth:920, maxHeight:'92vh', overflowY:'auto',
        background: GLASS.bg, backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
        borderRadius:22, boxShadow:'0 30px 70px rgba(0,90,140,0.28)', border: GLASS.border,
        display:'grid', gridTemplateColumns:'minmax(0,1fr)', position:'relative',
      }} className="qv-grid">
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, zIndex:2, width:34, height:34, borderRadius:'50%', border:'none', background:'rgba(15,23,42,0.08)', color:'var(--text-mid)', fontSize:'1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', padding:'1.5rem 1.5rem 0' }}>
          <div onClick={() => images[activeImg] && setLightboxOpen(true)}
            style={{ width:'100%', aspectRatio:'1/1', borderRadius:14, overflow:'hidden', background:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3.5rem', cursor: images.length ? 'zoom-in' : 'default' }}>
            {images[activeImg]
              ? <img src={images[activeImg]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              : '📚'}
          </div>
          {images.length > 1 && (
            <div style={{ display:'flex', gap:'0.5rem' }}>
              {images.map((img,i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  style={{ flex:1, aspectRatio:'1/1', borderRadius:9, overflow:'hidden', padding:0, cursor:'pointer', border:`2px solid ${i===activeImg?'var(--green-deep)':'rgba(255,255,255,0.6)'}`, opacity:i===activeImg?1:0.7 }}>
                  <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', gap:'0.4rem', flexWrap:'wrap', marginBottom:'0.5rem' }}>
            {product.is_featured && <span style={{ background:'var(--green-deep)', color:'#fff', fontSize:'0.65rem', fontWeight:800, padding:'0.2rem 0.6rem', borderRadius:100, letterSpacing:'0.06em' }}>FEATURED</span>}
            {product.sale_price && <span style={{ background:'#ef4444', color:'#fff', fontSize:'0.65rem', fontWeight:800, padding:'0.2rem 0.6rem', borderRadius:100 }}>SALE</span>}
            {product.tags?.slice(0,3).map((t,i) => <span key={i} style={{ fontSize:'0.68rem', fontWeight:600, background:'rgba(29,158,117,0.12)', color:'var(--green-deep)', padding:'0.15rem 0.55rem', borderRadius:100, border:'1px solid rgba(29,158,117,0.15)' }}>{t}</span>)}
          </div>

          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', color:'var(--green-deep)', fontWeight:700, marginBottom:'0.4rem' }}>{product.name}</h2>

          <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.6rem' }}>
            <Stars value={product.rating || 0} />
            <span style={{ fontSize:'0.78rem', color:'var(--text-light)' }}>
              {product.rating ? Number(product.rating).toFixed(1) : 'No ratings yet'} {product.reviews_count ? `(${product.reviews_count} review${product.reviews_count===1?'':'s'})` : ''}
            </span>
          </div>

          <div style={{ marginBottom:'0.9rem' }}>
            {product.sale_price
              ? <><span style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'var(--green-deep)', fontWeight:700 }}>NPR {product.sale_price.toLocaleString()}</span><span style={{ fontSize:'0.95rem', color:'var(--text-light)', textDecoration:'line-through', marginLeft:'0.6rem' }}>NPR {product.price?.toLocaleString()}</span></>
              : <span style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'var(--green-deep)', fontWeight:700 }}>NPR {product.price?.toLocaleString()}</span>
            }
          </div>

          <p style={{ fontSize:'0.86rem', color:'var(--text-mid)', lineHeight:1.7, marginBottom:'1rem', whiteSpace:'pre-line' }}>
            {product.description || product.short_description || 'No description available for this product yet.'}
          </p>

          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.25rem' }}>
            <span style={{ fontSize:'0.8rem', fontWeight:600, color:product.stock_quantity>0?'var(--green-deep)':'#ef4444' }}>
              {product.is_digital ? '📥 Digital download' : product.stock_quantity > 0 ? `✓ ${product.stock_quantity} in stock` : '✕ Out of stock'}
            </span>
          </div>

          <div style={{ marginBottom:'1.25rem', borderTop:'1px solid rgba(255,255,255,0.6)', paddingTop:'1rem' }}>
            <h3 style={{ fontSize:'0.78rem', fontWeight:800, color:'var(--text-mid)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'0.6rem' }}>Customer Reviews</h3>

            {loading ? (
              <div style={{ fontSize:'0.78rem', color:'var(--text-light)' }}>Loading reviews…</div>
            ) : (product.reviews?.length ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem', maxHeight:170, overflowY:'auto', marginBottom:'0.9rem' }}>
                {product.reviews.map((r,i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.55)', borderRadius:10, padding:'0.6rem 0.8rem' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.2rem' }}>
                      <span style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--text-mid)' }}>{r.author_name || 'Anonymous'}</span>
                      <Stars value={r.rating} size="0.72rem" />
                    </div>
                    {r.comment && <p style={{ fontSize:'0.78rem', color:'var(--text-light)', lineHeight:1.5, margin:0 }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize:'0.78rem', color:'var(--text-light)', marginBottom:'0.9rem' }}>No reviews yet — be the first!</p>
            ))}

            <div style={{ background:'rgba(255,255,255,0.5)', borderRadius:10, padding:'0.75rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'0.5rem' }}>
                <StarPicker value={myRating} onChange={setMyRating} />
                <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="Your name (optional)"
                  style={{ flex:1, minWidth:0, padding:'0.35rem 0.6rem', border:'1px solid rgba(148,163,184,0.4)', borderRadius:7, fontSize:'0.76rem', background:'#fff' }} />
              </div>
              <textarea value={myComment} onChange={e => setMyComment(e.target.value)} rows={2} placeholder="Share your experience…"
                style={{ width:'100%', padding:'0.5rem 0.65rem', border:'1px solid rgba(148,163,184,0.4)', borderRadius:7, fontSize:'0.78rem', resize:'vertical', marginBottom:'0.5rem', background:'#fff' }} />
              <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                <button onClick={submitReview} disabled={submitting}
                  style={{ padding:'0.4rem 0.9rem', background:'var(--green-deep)', color:'#fff', border:'none', borderRadius:8, fontSize:'0.78rem', fontWeight:700, cursor:'pointer' }}>
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
                {reviewMsg && <span style={{ fontSize:'0.74rem', color:'var(--text-light)' }}>{reviewMsg}</span>}
              </div>
            </div>
          </div>

          <div style={{ marginTop:'auto', paddingTop:'0.5rem' }}>
            <button onClick={() => onAddToCart(product.id)} disabled={adding===product.id||product.stock_quantity===0}
              style={{ width:'100%', padding:'0.85rem', background:product.stock_quantity===0?'#e5e7eb':'var(--green-deep)', color:product.stock_quantity===0?'#9ca3af':'white', border:'none', borderRadius:10, fontSize:'0.9rem', fontWeight:700, cursor:product.stock_quantity===0?'not-allowed':'pointer' }}>
              {adding===product.id ? 'Adding…' : product.stock_quantity===0 ? 'Out of Stock' : '+ Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox images={images} index={activeImg} onClose={() => setLightboxOpen(false)}
          onNav={dir => setActiveImg(i => (i + dir + images.length) % images.length)} />
      )}

      <style>{`
        @media (min-width: 720px) {
          .qv-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}

// ─── Embedded Leaflet map picker (loads Leaflet from CDN, no npm install) ──
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

  const reverseGeocode = useCallback(async (lat, lng) => {
    setStatus('Looking up address…')
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
      const data = await res.json()
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
      onLocationChange({ latitude: lat, longitude: lng, formatted_address: '', address_line: '', city: '' })
      setStatus('Pin placed (could not fetch address — drag to retry)')
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
        { timeout: 6000 }
      )
    } else {
      reverseGeocode(DEFAULT_CENTER[0], DEFAULT_CENTER[1])
    }

    setTimeout(() => map.invalidateSize(), 200)
  }, [leafletReady, reverseGeocode])

  return (
    <div>
      <div ref={mapEl} style={{ width:'100%', height:220, borderRadius:10, overflow:'hidden', border:'1.5px solid var(--earth-cream)' }} />
      <p style={{ fontSize:'0.72rem', color:'var(--text-light)', marginTop:'0.4rem' }}>
        📍 {status} — tap the map or drag the pin to set your exact delivery location.
      </p>
    </div>
  )
}

export default function StorePage() {
  const { navigate }    = useRouter()
  const { user }        = useAuth()
  const { openPayment } = usePayment()

  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [cart,        setCart]        = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search,      setSearch]      = useState('')
  const [loading,     setLoading]     = useState(true)
  const [cartOpen,    setCartOpen]    = useState(false)
  const [adding,      setAdding]      = useState(null)
  const [cartMsg,     setCartMsg]     = useState('')
  const [page,        setPage]        = useState(1)
  const [total,       setTotal]       = useState(0)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  const [contact, setContact] = useState({ full_name:'', phone:'', landmark:'', notes:'' })
  const [location, setLocation] = useState(null)
  const [addrErr, setAddrErr] = useState('')
  const LIMIT = 12

  useEffect(() => {
    storeApi.categories().then(d => setCategories(d.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit:LIMIT, ...(activeCategory !== 'all' ? { category:activeCategory } : {}), ...(search ? { q:search } : {}) }
    storeApi.products(params)
      .then(d => { setProducts(d.products || []); setTotal(d.pagination?.total || 0) })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeCategory, page, search])

  useEffect(() => {
    if (!user) return
    storeApi.getCart().then(d => setCart(d.cart || [])).catch(() => {})
  }, [user])

  async function addToCart(productId) {
    if (!user) { navigate('/signin'); return }
    setAdding(productId)
    const product = products.find(p => p.id === productId) || quickViewProduct
    setCart(prev => {
      const existing = prev.find(i => (i.products?.id || i.product_id) === productId)
      if (existing) return prev.map(i => (i.products?.id || i.product_id) === productId ? { ...i, quantity:(i.quantity||1)+1 } : i)
      return [...prev, { product_id: productId, quantity: 1, products: product || { id: productId, name:'…', price:0 } }]
    })
    setCartMsg('Added to cart!'); setTimeout(() => setCartMsg(''), 2500)
    try {
      await storeApi.addToCart(productId, null, 1)
      const d = await storeApi.getCart()
      setCart(d.cart || [])
    } catch (err) {
      setCart(prev => {
        const item = prev.find(i => (i.products?.id || i.product_id) === productId)
        if (!item || item.quantity <= 1) return prev.filter(i => (i.products?.id || i.product_id) !== productId)
        return prev.map(i => (i.products?.id || i.product_id) === productId ? { ...i, quantity:(i.quantity||1)-1 } : i)
      })
      setCartMsg(err.message || 'Could not add to cart.'); setTimeout(() => setCartMsg(''), 2500)
    } finally { setAdding(null) }
  }

  async function removeFromCart(productId) {
    setCart(prev => prev.filter(i => (i.products?.id || i.product_id) !== productId))
    try { await storeApi.removeFromCart(productId) }
    catch { storeApi.getCart().then(d => setCart(d.cart || [])).catch(() => {}) }
  }

  async function updateQty(productId, qty) {
    if (qty < 1) { removeFromCart(productId); return }
    setCart(prev => prev.map(i => (i.products?.id || i.product_id) === productId ? { ...i, quantity: qty } : i))
    try { await storeApi.updateCart(productId, qty) }
    catch { storeApi.getCart().then(d => setCart(d.cart || [])).catch(() => {}) }
  }

  async function handleCheckout() {
    if (!user) { navigate('/signin'); return }
    if (!contact.full_name.trim())  return setAddrErr('Full name is required.')
    if (!contact.phone.trim())      return setAddrErr('Phone number is required.')
    if (!location)                  return setAddrErr('Please drop a pin on the map for delivery.')
    setAddrErr('')

    const itemLines = cart.map(item => {
      const p = item.products || {}
      const price = p.sale_price ?? p.price ?? 0
      return { label: `${p.name} × ${item.quantity || 1}`, amount: price * (item.quantity || 1) }
    })

    setCartOpen(false)

    let orderId
    try {
      const orderData = await storeApi.createOrder({ location: { ...contact, ...location } })
      orderId = orderData.order?.id
    } catch (err) {
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

    if (result.success) {
      try { await storeApi.clearCart() } catch {}
      setCart([]); setContact({ full_name:'', phone:'', landmark:'', notes:'' }); setLocation(null)
      navigate('/portal')
    } else if (!result.cancelled) {
      alert('Payment was not completed. Your order is saved — you can complete payment from your portal.')
    }
  }

  const cartCount = cart.reduce((s,i) => s + (i.quantity || 1), 0)
  const cartTotal = cart.reduce((s,i) => {
    const p = i.products || {}
    return s + (p.sale_price ?? p.price ?? 0) * (i.quantity || 1)
  }, 0)
  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{
        position:'relative', overflow:'hidden', padding:'3rem 1.5rem 4rem', textAlign:'center',
        borderRadius:'0 0 50% 50% / 0 0 32px 32px',
        background: `
          radial-gradient(ellipse 90% 70% at 15% 30%, rgba(100,200,150,0.45) 0%, transparent 65%),
          radial-gradient(ellipse 80% 60% at 85% 15%, rgba(34,197,94,0.25) 0%, transparent 60%),
          radial-gradient(ellipse 60% 80% at 70% 85%, rgba(187,247,208,0.4) 0%, transparent 60%),
          linear-gradient(150deg, #064e3b 0%, #065f46 40%, #047857 100%)`,
      }}>
        <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', background:'rgba(52,211,153,0.18)', filter:'blur(28px)', top:-30, right:0, pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', background:'rgba(16,185,129,0.15)', filter:'blur(24px)', bottom:-20, left:'5%', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1, maxWidth:480, margin:'0 auto' }}>
          <span className="section-tag" style={{ color:'#6ee7b7', background:'rgba(110,231,183,0.15)', border:'1px solid rgba(110,231,183,0.3)' }}>Wellness Store</span>
          <h1 className="section-title" style={{ color:'#fff' }}>Mental Wellness <em style={{ color:'#6ee7b7', fontStyle:'normal' }}>Products</em></h1>
          <p className="section-desc" style={{ color:'rgba(255,255,255,0.72)', maxWidth:400, margin:'0 auto' }}>Books, workbooks, digital tools, and more — curated for your healing journey.</p>
        </div>
      </div>

      <div style={{ padding:'0 1rem' }}><EleventhPaymentPromo /></div>

      <div style={{ background:'var(--white)', padding:'0.75rem 1rem', borderBottom:'1px solid var(--earth-cream)', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.6rem' }}>
          <input placeholder="Search products…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ flex:1, minWidth:0, padding:'0.45rem 0.75rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.82rem', outline:'none' }} />
          <button onClick={() => setCartOpen(true)}
            style={{ flexShrink:0, display:'flex', alignItems:'center', gap:4, padding:'0.45rem 0.85rem', background:'var(--green-deep)', color:'white', border:'none', borderRadius:8, fontSize:'0.78rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
            🛒 Cart
            {cartCount > 0 && <span style={{ background:'#f97316', borderRadius:'50%', width:18, height:18, fontSize:'0.6rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>{cartCount}</span>}
          </button>
        </div>
        <div style={{ display:'flex', gap:'0.4rem', overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
          <button onClick={() => { setActiveCategory('all'); setPage(1) }}
            style={{ flexShrink:0, padding:'0.3rem 0.9rem', borderRadius:100, border:`1.5px solid ${activeCategory==='all'?'var(--green-deep)':'var(--earth-cream)'}`, background:activeCategory==='all'?'var(--green-deep)':'var(--white)', color:activeCategory==='all'?'white':'var(--text-mid)', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => { setActiveCategory(c.id); setPage(1) }}
              style={{ flexShrink:0, padding:'0.3rem 0.9rem', borderRadius:100, border:`1.5px solid ${activeCategory===c.id?'var(--green-deep)':'var(--earth-cream)'}`, background:activeCategory===c.id?'var(--green-deep)':'var(--white)', color:activeCategory===c.id?'white':'var(--text-mid)', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>{c.name}</button>
          ))}
        </div>
      </div>

      {cartMsg && (
        <div style={{ position:'fixed', bottom:'2rem', right:'2rem', background:'var(--green-deep)', color:'white', padding:'0.75rem 1.5rem', borderRadius:10, fontWeight:600, fontSize:'0.9rem', zIndex:1000, boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>{cartMsg}</div>
      )}

      <div style={{ background: SECTION_BG }}>
        <div className="section">
          {loading ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.5rem' }}>
              {Array.from({length:8}).map((_,i) => <div key={i} style={{ background:CARD.bg, border:CARD.border, borderRadius:'var(--radius-lg)', minHeight:300, opacity:0.5 }}/>)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem 2rem', color:'var(--text-light)' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📦</div>
              <p>No products found. Try a different search or category.</p>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.5rem' }}>
              {products.map(p => {
                const isHovered = hoveredProduct === p.id
                const primaryImg = p.images?.[0] || p.image_url
                return (
                  <div key={p.id} onMouseEnter={() => setHoveredProduct(p.id)} onMouseLeave={() => setHoveredProduct(null)} onClick={() => setQuickViewProduct(p)}
                    style={{ background:isHovered?CARD.bgHover:CARD.bg, border:isHovered?CARD.borderHov:CARD.border, borderRadius:'var(--radius-lg)', overflow:'hidden', cursor:'pointer',
                      transform:isHovered?'translateY(-8px) scale(1.015)':'translateY(0) scale(1)', boxShadow:isHovered?CARD.shadowHov:CARD.shadow,
                      transition:'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, background 0.35s ease, border 0.35s ease' }}>
                    <div style={{ height:200, background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', position:'relative' }}>
                      {primaryImg ? <img src={primaryImg} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '📚'}
                      {p.is_featured && <span style={{ position:'absolute', top:10, left:10, background:'var(--green-deep)', color:'white', fontSize:'0.68rem', fontWeight:800, padding:'0.2rem 0.6rem', borderRadius:100, letterSpacing:'0.08em' }}>FEATURED</span>}
                      {p.sale_price && <span style={{ position:'absolute', top:10, right:10, background:'#ef4444', color:'white', fontSize:'0.68rem', fontWeight:800, padding:'0.2rem 0.6rem', borderRadius:100 }}>SALE</span>}
                    </div>
                    <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', height:'calc(100% - 200px)' }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--green-deep)', fontWeight:600, marginBottom:'0.3rem' }}>{p.name}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:'0.4rem' }}>
                        <Stars value={p.rating || 0} size="0.72rem" />
                        {p.reviews_count > 0 && <span style={{ fontSize:'0.68rem', color:'var(--text-light)' }}>({p.reviews_count})</span>}
                      </div>
                      {p.short_description && <p style={{ fontSize:'0.8rem', color:'var(--text-light)', lineHeight:1.5, marginBottom:'0.75rem' }}>{p.short_description}</p>}
                      <div style={{ marginBottom:'0.5rem' }}>
                        {p.tags?.slice(0,2).map((t,i) => <span key={i} style={{ fontSize:'0.7rem', fontWeight:600, background:'rgba(29,158,117,0.1)', color:'var(--green-deep)', padding:'0.15rem 0.5rem', borderRadius:100, marginRight:'0.35rem', border:'1px solid rgba(29,158,117,0.15)' }}>{t}</span>)}
                      </div>
                      <div style={{ flex:1 }} />
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.75rem' }}>
                        <div>
                          {p.sale_price
                            ? <><span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--green-deep)', fontWeight:700 }}>NPR {p.sale_price.toLocaleString()}</span><span style={{ fontSize:'0.8rem', color:'var(--text-light)', textDecoration:'line-through', marginLeft:'0.5rem' }}>NPR {p.price?.toLocaleString()}</span></>
                            : <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--green-deep)', fontWeight:700 }}>NPR {p.price?.toLocaleString()}</span>}
                        </div>
                        <span style={{ fontSize:'0.75rem', color:p.stock_quantity>0?'var(--green-deep)':'#ef4444', fontWeight:600 }}>
                          {p.is_digital ? '📥 Digital' : p.stock_quantity > 0 ? `${p.stock_quantity} left` : 'Out of stock'}
                        </span>
                      </div>
                      <button onClick={e => { e.stopPropagation(); addToCart(p.id) }} disabled={adding===p.id||p.stock_quantity===0}
                        style={{ width:'100%', marginTop:'0.75rem', padding:'0.65rem', background:p.stock_quantity===0?'#e5e7eb':'var(--green-deep)', color:p.stock_quantity===0?'#9ca3af':'white', border:'none', borderRadius:8, fontSize:'0.85rem', fontWeight:700, cursor:p.stock_quantity===0?'not-allowed':'pointer', transition:'background 0.2s' }}>
                        {adding===p.id ? 'Adding…' : p.stock_quantity===0 ? 'Out of Stock' : '+ Add to Cart'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'2.5rem', alignItems:'center' }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn btn-outline" style={{ opacity:page===1?0.4:1 }}>← Prev</button>
              <span style={{ fontSize:'0.85rem', color:'var(--text-light)', padding:'0 1rem' }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => p+1)} disabled={page>=totalPages} className="btn btn-outline" style={{ opacity:page>=totalPages?0.4:1 }}>Next →</button>
            </div>
          )}
        </div>
      </div>

      {quickViewProduct && (
        <ProductQuickView productSummary={quickViewProduct} onClose={() => setQuickViewProduct(null)} onAddToCart={addToCart} adding={adding} />
      )}

      {cartOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.4)' }} onClick={e => e.target===e.currentTarget && setCartOpen(false)}>
          <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'100%', maxWidth:420, background:'var(--white)', boxShadow:'-4px 0 24px rgba(0,0,0,0.12)', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'1.5rem', borderBottom:'1px solid var(--earth-cream)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--green-deep)' }}>Your Cart ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} style={{ background:'none', border:'none', fontSize:'1.25rem', cursor:'pointer', color:'var(--text-light)' }}>✕</button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'1rem 1.5rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign:'center', padding:'3rem 0', color:'var(--text-light)' }}><div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🛒</div><p>Your cart is empty.</p></div>
              ) : cart.map((item, i) => {
                const p = item.products || {}
                const price = p.sale_price ?? p.price ?? 0
                const img = p.images?.[0] || p.image_url
                return (
                  <div key={i} style={{ display:'flex', gap:'1rem', padding:'1rem 0', borderBottom:'1px solid var(--earth-cream)', alignItems:'center' }}>
                    <div style={{ width:56, height:56, borderRadius:8, background:'var(--green-mist)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0, overflow:'hidden' }}>
                      {img ? <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : '📚'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--green-deep)' }}>{p.name}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--text-light)' }}>NPR {price.toLocaleString()} each</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      <button onClick={() => updateQty(p.id,(item.quantity||1)-1)} style={{ width:28, height:28, borderRadius:'50%', border:'1.5px solid var(--earth-cream)', background:'none', cursor:'pointer', fontWeight:700 }}>−</button>
                      <span style={{ minWidth:20, textAlign:'center', fontWeight:700, fontSize:'0.9rem' }}>{item.quantity||1}</span>
                      <button onClick={() => updateQty(p.id,(item.quantity||1)+1)} style={{ width:28, height:28, borderRadius:'50%', border:'1.5px solid var(--earth-cream)', background:'none', cursor:'pointer', fontWeight:700 }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(p.id)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'1rem' }}>🗑</button>
                  </div>
                )
              })}
            </div>

            {cart.length > 0 && (
              <div style={{ padding:'1.5rem', borderTop:'1px solid var(--earth-cream)' }}>
                <div style={{ marginBottom:'1rem' }}>
                  <h3 style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--green-deep)', marginBottom:'0.6rem' }}>Delivery Location</h3>
                  <MapPicker onLocationChange={setLocation} />
                  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginTop:'0.6rem' }}>
                    <input placeholder="Full name *" value={contact.full_name} onChange={e => setContact(c => ({ ...c, full_name:e.target.value }))}
                      style={{ padding:'0.5rem 0.7rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.8rem' }} />
                    <input placeholder="Phone number *" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone:e.target.value }))}
                      style={{ padding:'0.5rem 0.7rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.8rem' }} />
                    <input placeholder="Landmark (optional)" value={contact.landmark} onChange={e => setContact(c => ({ ...c, landmark:e.target.value }))}
                      style={{ padding:'0.5rem 0.7rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.8rem' }} />
                    <textarea placeholder="Delivery notes (optional)" value={contact.notes} onChange={e => setContact(c => ({ ...c, notes:e.target.value }))} rows={2}
                      style={{ padding:'0.5rem 0.7rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.8rem', resize:'vertical' }} />
                  </div>
                  {addrErr && <p style={{ color:'#ef4444', fontSize:'0.75rem', marginTop:'0.4rem', fontWeight:600 }}>{addrErr}</p>}
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
                  <span style={{ fontWeight:600, color:'var(--text-mid)' }}>Total</span>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:'var(--green-deep)' }}>NPR {cartTotal.toLocaleString()}</span>
                </div>

                <button onClick={handleCheckout} style={{ width:'100%', padding:'0.9rem', background:'var(--green-deep)', color:'white', border:'none', borderRadius:10, fontWeight:700, fontSize:'0.95rem', cursor:'pointer' }}>
                  Choose Payment Method →
                </button>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.7rem', color:'var(--text-light)', textAlign:'center', marginTop:'0.5rem' }}>
                  eSewa · Khalti · QR · Card · Bank Transfer · Cash on Delivery
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}