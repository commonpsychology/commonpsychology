// src/pages/StorePage.jsx
// Products/categories/cart come from the backend (Supabase-backed).
// Quick-view: glass blue-white card, 4-image slider (swipeable on touch
// AND mouse/trackpad) that expands to a fullscreen lightbox, ratings +
// reviews (fetched fresh per product).
// Cart/checkout now lives on its own route — see CartPage.jsx — reached
// by clicking the cart button.

import { useState, useEffect, useRef } from 'react'
import { useRouter }  from '../context/RouterContext'
import { useAuth }    from '../context/AuthContext'
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
    <div style={{ display:'flex', gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button"
          onClick={e => { e.stopPropagation(); onChange(n) }}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.5rem', lineHeight:1,
            color: n <= value ? '#f59e0b' : '#d1d5db', padding:'6px', margin:'-6px',
            touchAction:'manipulation', transform: n <= value ? 'scale(1.05)' : 'scale(1)',
            transition:'color 0.15s, transform 0.15s' }}>
          ★
        </button>
      ))}
    </div>
  )
}

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

  const dragX = useRef(null)
  function onPointerDown(e) { dragX.current = e.clientX }
  function onPointerUp(e) {
    if (dragX.current == null) return
    const dx = e.clientX - dragX.current
    if (Math.abs(dx) > 40) onNav(dx < 0 ? 1 : -1)
    dragX.current = null
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1400, background:'rgba(6,10,20,0.92)', display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}>
      <button onClick={onClose} style={{ position:'absolute', top:18, right:20, width:38, height:38, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:'1.1rem', cursor:'pointer' }}>✕</button>
      {images.length > 1 && (
        <button onClick={e => { e.stopPropagation(); onNav(-1) }} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', width:44, height:44, borderRadius:'50%', border:'none', background:'rgba(255,255,255,0.12)', color:'#fff', fontSize:'1.4rem', cursor:'pointer' }}>‹</button>
      )}
      <img src={images[index]} alt="" draggable={false}
        onClick={e => e.stopPropagation()}
        onPointerDown={e => { e.stopPropagation(); onPointerDown(e) }}
        onPointerUp={e => { e.stopPropagation(); onPointerUp(e) }}
        style={{ maxWidth:'92vw', maxHeight:'88vh', objectFit:'contain', borderRadius:12, boxShadow:'0 20px 70px rgba(0,0,0,0.5)', cursor:'grab', touchAction:'pan-y' }} />
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

  // Fresh product fetch + reset image index whenever a different product is opened.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setActiveImg(0)
    setLightboxOpen(false)
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

  // Pointer-based swipe (covers touch on mobile AND mouse/trackpad drag on desktop).
  const dragX = useRef(null)
  const dragging = useRef(false)
  function navImg(dir) { setActiveImg(i => (images.length ? (i + dir + images.length) % images.length : 0)) }
  function onImgPointerDown(e) { dragX.current = e.clientX; dragging.current = true }
  function onImgPointerUp(e) {
    if (!dragging.current || dragX.current == null) { dragging.current = false; return }
    const dx = e.clientX - dragX.current
    if (Math.abs(dx) > 40) navImg(dx < 0 ? 1 : -1)
    dragX.current = null
    dragging.current = false
  }
  function onImgPointerLeave() { dragX.current = null; dragging.current = false }

  async function submitReview() {
    if (!myRating) { setReviewMsg('Pick a star rating first.'); return }
    setSubmitting(true); setReviewMsg('')
    try {
      await storeApi.addReview(product.id, { rating: myRating, comment: myComment, author_name: myName || undefined })
      const fresh = await storeApi.product(product.id)
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
          <div style={{ position:'relative' }}>
            <div
              onClick={() => !dragging.current && images[activeImg] && setLightboxOpen(true)}
              onPointerDown={onImgPointerDown}
              onPointerUp={onImgPointerUp}
              onPointerLeave={onImgPointerLeave}
              style={{ width:'100%', aspectRatio:'1/1', borderRadius:14, overflow:'hidden', background:'rgba(255,255,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3.5rem', cursor: images.length ? 'grab' : 'default', touchAction:'pan-y', userSelect:'none' }}>
              {images[activeImg]
                ? <img src={images[activeImg]} alt={product.name} draggable={false} style={{ width:'100%', height:'100%', objectFit:'cover', pointerEvents:'none' }}/>
                : '📚'}
            </div>
            {images.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); navImg(-1) }}
                  style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', width:34, height:34, borderRadius:'50%', border:'none', background:'rgba(15,23,42,0.5)', color:'#fff', fontSize:'1.1rem', cursor:'pointer' }}>‹</button>
                <button onClick={e => { e.stopPropagation(); navImg(1) }}
                  style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', width:34, height:34, borderRadius:'50%', border:'none', background:'rgba(15,23,42,0.5)', color:'#fff', fontSize:'1.1rem', cursor:'pointer' }}>›</button>
                <div style={{ position:'absolute', bottom:10, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5 }}>
                  {images.map((_, i) => (
                    <span key={i} style={{ width:6, height:6, borderRadius:'50%', background: i===activeImg ? '#fff' : 'rgba(255,255,255,0.4)' }} />
                  ))}
                </div>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display:'flex', gap:'0.5rem' }}>
              {images.map((img,i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  style={{ flex:1, aspectRatio:'1/1', borderRadius:9, overflow:'hidden', padding:0, cursor:'pointer', border:`2px solid ${i===activeImg?'var(--green-deep)':'rgba(255,255,255,0.6)'}`, opacity:i===activeImg?1:0.7 }}>
                  <img src={img} alt="" draggable={false} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
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

export default function StorePage() {
  const { navigate }    = useRouter()
  const { user }        = useAuth()

  const [products,    setProducts]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [cart,        setCart]        = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [search,      setSearch]      = useState('')
  const [loading,     setLoading]     = useState(true)
  const [adding,      setAdding]      = useState(null)
  const [cartMsg,     setCartMsg]     = useState('')
  const [page,        setPage]        = useState(1)
  const [total,       setTotal]       = useState(0)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

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

  const cartCount = cart.reduce((s,i) => s + (i.quantity || 1), 0)
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
          <button onClick={() => navigate('/cart')}
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
    </div>
  )
}