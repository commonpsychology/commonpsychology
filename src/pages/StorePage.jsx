// src/pages/StorePage.jsx
// Payment fully centralized — usePayment() replaces the inline checkout modal.
// On success: order + payment both saved in DB, linked by order_id.
// Admin fetches /admin/payments?category=order  OR  /admin/orders

import { useState, useEffect } from 'react'
import { useRouter }  from '../context/RouterContext'
import { useAuth }    from '../context/AuthContext'
import { usePayment } from '../components/PaymentModal'
import { store as storeApi } from '../services/api'
import EleventhPaymentPromo from '../components/EleventhPaymentPromo'

// ── Glass card palette — same bluish-white frosted look used across
//    Services / Resources / Booking / Staff for a consistent design system ──
const GLASS = {
  bg:        'linear-gradient(160deg, rgba(255,255,255,0.72) 0%, rgba(214,238,252,0.55) 55%, rgba(255,255,255,0.68) 100%)',
  bgHover:   'linear-gradient(160deg, rgba(255,255,255,0.82) 0%, rgba(200,232,250,0.68) 55%, rgba(255,255,255,0.78) 100%)',
  border:    '1px solid rgba(255,255,255,0.55)',
  borderHov: '1px solid rgba(120,190,230,0.65)',
  shadow:    '0 4px 18px rgba(0,123,168,0.10), inset 0 1px 0 rgba(255,255,255,0.5)',
  shadowHov: '0 20px 44px rgba(0,123,168,0.22), 0 6px 16px rgba(29,158,117,0.14), inset 0 1px 0 rgba(255,255,255,0.6)',
}

// Soft, layered glass background for the products section — mirrors the
// Resources / Services hero treatment so the whole store feels part of
// the same family.
const SECTION_BG = `
  radial-gradient(ellipse 80% 60% at 12% 15%, rgba(180,230,210,0.32) 0%, transparent 70%),
  radial-gradient(ellipse 70% 80% at 88% 8%, rgba(186,220,248,0.38) 0%, transparent 65%),
  radial-gradient(ellipse 60% 60% at 50% 100%, rgba(254,243,199,0.28) 0%, transparent 60%),
  linear-gradient(180deg, #f5fbff 0%, #eef8fc 55%, #f8fcff 100%)
`

export default function StorePage() {
  const { navigate }    = useRouter()
  const { user }        = useAuth()
  const { openPayment } = usePayment()   // ← centralized

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
  const [address, setAddress] = useState({
  full_name: '', phone: '', address_line: '', city: '', landmark: '', notes: ''
})
const [addrErr, setAddrErr] = useState('')
  const LIMIT = 12

  function updateAddr(field) {
  return e => setAddress(a => ({ ...a, [field]: e.target.value }))
}

function validateAddress() {
  if (!address.full_name.trim())    return 'Full name is required.'
  if (!address.phone.trim())        return 'Phone number is required.'
  if (!address.address_line.trim())return 'Delivery address is required.'
  if (!address.city.trim())         return 'City is required.'
  return ''
}

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
  
  // Find the product from the products list
  const product = products.find(p => p.id === productId)
  
  // Optimistic add — update cart state immediately
  setCart(prev => {
    const existing = prev.find(i => (i.products?.id || i.product_id) === productId)
    if (existing) {
      return prev.map(i =>
        (i.products?.id || i.product_id) === productId
          ? { ...i, quantity: (i.quantity || 1) + 1 }
          : i
      )
    }
    return [...prev, {
      product_id: productId,
      quantity: 1,
      products: product || { id: productId, name: '…', price: 0 },
      product_variants: null,
    }]
  })
  setCartMsg('Added to cart!')
  setTimeout(() => setCartMsg(''), 2500)

  try {
    await storeApi.addToCart(productId, null, 1)
    // Sync real data from server (catches price/variant discrepancies)
    const d = await storeApi.getCart()
    setCart(d.cart || [])
  } catch (err) {
    // Rollback on failure
    setCart(prev => {
      const item = prev.find(i => (i.products?.id || i.product_id) === productId)
      if (!item || item.quantity <= 1) return prev.filter(i => (i.products?.id || i.product_id) !== productId)
      return prev.map(i =>
        (i.products?.id || i.product_id) === productId
          ? { ...i, quantity: (i.quantity || 1) - 1 }
          : i
      )
    })
    setCartMsg(err.message || 'Could not add to cart.')
    setTimeout(() => setCartMsg(''), 2500)
  } finally {
    setAdding(null)
  }
}

async function removeFromCart(productId) {
  // Optimistic remove
  setCart(prev => prev.filter(i => (i.products?.id || i.product_id) !== productId))
  try {
    await storeApi.removeFromCart(productId)
  } catch {
    // Rollback: re-fetch on failure
    storeApi.getCart().then(d => setCart(d.cart || [])).catch(() => {})
  }
}

async function updateQty(productId, qty) {
  if (qty < 1) { removeFromCart(productId); return }
  // Optimistic quantity update
  setCart(prev => prev.map(i =>
    (i.products?.id || i.product_id) === productId
      ? { ...i, quantity: qty }
      : i
  ))
  try {
    await storeApi.updateCart(productId, qty)
  } catch {
    // Rollback on failure
    storeApi.getCart().then(d => setCart(d.cart || [])).catch(() => {})
  }
}

 async function handleCheckout() {
  if (!user) { navigate('/signin'); return }

  const err = validateAddress()
  if (err) { setAddrErr(err); return }
  setAddrErr('')

  const itemLines = cart.map(item => {
    const p     = item.products || {}
    const price = item.product_variants?.price ?? p.sale_price ?? p.price ?? 0
    return { label: `${p.name} × ${item.quantity || 1}`, amount: price * (item.quantity || 1) }
  })

  setCartOpen(false)

  let orderId
  try {
    const orderData = await storeApi.createOrder({ shippingAddress: address }) // ← was null
    orderId = orderData.order?.id || orderData.id
  } catch (err) {
    alert('Could not create order: ' + (err.message || 'Please try again.'))
    return
  }

  const result = await openPayment({
    type:            'order',
    amount:          cartTotal,
    title:           `Store Order #${String(orderId).slice(-8).toUpperCase()}`,
    description:     `${cartCount} item${cartCount !== 1 ? 's' : ''} from Common Psychology Store`,
    itemLines,
    couponEnabled:   true,
    allowedGateways: ['esewa', 'khalti', 'fonepay', 'stripe', 'bank_transfer', 'cash'],
    metadata: { order_id: orderId, item_count: cartCount, category: 'order' },
  })

  if (result.success) {
    try { await storeApi.clearCart() } catch {}
    setCart([])
    setAddress({ full_name:'', phone:'', address_line:'', city:'', landmark:'', notes:'' })
    navigate('/portal')
  } else if (!result.cancelled) {
    alert('Payment was not completed. Your order is saved — you can complete payment from your portal.')
  }
}

  const cartCount = cart.reduce((s,i) => s + (i.quantity || 1), 0)
  const cartTotal = cart.reduce((s,i) => {
    const p = i.products || {}
    const price = i.product_variants?.price ?? p.sale_price ?? p.price ?? 0
    return s + price * (i.quantity || 1)
  }, 0)
  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div className="page-hero" style={{
  position: 'relative',
  overflow: 'hidden',
  padding: '3rem 1.5rem 4rem',
  textAlign: 'center',
  borderRadius: '0 0 50% 50% / 0 0 32px 32px',
  background: `
    radial-gradient(ellipse 90% 70% at 15% 30%, rgba(100,200,150,0.45) 0%, transparent 65%),
    radial-gradient(ellipse 80% 60% at 85% 15%, rgba(34,197,94,0.25) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 70% 85%, rgba(187,247,208,0.4) 0%, transparent 60%),
    linear-gradient(150deg, #064e3b 0%, #065f46 40%, #047857 100%)
  `,
}}>
  <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', background:'rgba(52,211,153,0.18)', filter:'blur(28px)', top:-30, right:0, pointerEvents:'none' }} />
  <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', background:'rgba(16,185,129,0.15)', filter:'blur(24px)', bottom:-20, left:'5%', pointerEvents:'none' }} />
  <div style={{ position:'relative', zIndex:1, maxWidth:480, margin:'0 auto' }}>
    <span className="section-tag" style={{ color:'#6ee7b7', background:'rgba(110,231,183,0.15)', border:'1px solid rgba(110,231,183,0.3)' }}>Wellness Store</span>
    <h1 className="section-title" style={{ color:'#fff' }}>Mental Wellness <em style={{ color:'#6ee7b7', fontStyle:'normal' }}>Products</em></h1>
  <p className="section-desc" style={{ color:'rgba(255,255,255,0.72)', maxWidth:400, margin:'0 auto' }}>Books, workbooks, digital tools, and more — curated for your healing journey.</p>
  </div>
</div>

<div style={{ padding: '0 1rem' }}>
  <EleventhPaymentPromo />
</div>

     <div style={{ background:'var(--white)', padding:'0.75rem 1rem', borderBottom:'1px solid var(--earth-cream)', position:'sticky', top:0, zIndex:10 }}>
  {/* Search + cart row */}
  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.6rem' }}>
    <input
      placeholder="Search products…"
      value={search}
      onChange={e => { setSearch(e.target.value); setPage(1) }}
      style={{ flex:1, minWidth:0, padding:'0.45rem 0.75rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.82rem', outline:'none' }}
    />
    <button
      onClick={() => setCartOpen(true)}
      style={{ flexShrink:0, display:'flex', alignItems:'center', gap:4, padding:'0.45rem 0.85rem', background:'var(--green-deep)', color:'white', border:'none', borderRadius:8, fontSize:'0.78rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}
    >
      🛒 Cart
      {cartCount > 0 && (
        <span style={{ background:'#f97316', borderRadius:'50%', width:18, height:18, fontSize:'0.6rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800 }}>{cartCount}</span>
      )}
    </button>
  </div>
  {/* Horizontally scrollable filter pills */}
  <div style={{ display:'flex', gap:'0.4rem', overflowX:'auto', paddingBottom:2, scrollbarWidth:'none', msOverflowStyle:'none' }}>
    <button
      onClick={() => { setActiveCategory('all'); setPage(1) }}
      style={{ flexShrink:0, padding:'0.3rem 0.9rem', borderRadius:'100px', border:`1.5px solid ${activeCategory==='all'?'var(--green-deep)':'var(--earth-cream)'}`, background:activeCategory==='all'?'var(--green-deep)':'var(--white)', color:activeCategory==='all'?'white':'var(--text-mid)', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}
    >All</button>
    {categories.map(c => (
      <button
        key={c.id}
        onClick={() => { setActiveCategory(c.id); setPage(1) }}
        style={{ flexShrink:0, padding:'0.3rem 0.9rem', borderRadius:'100px', border:`1.5px solid ${activeCategory===c.id?'var(--green-deep)':'var(--earth-cream)'}`, background:activeCategory===c.id?'var(--green-deep)':'var(--white)', color:activeCategory===c.id?'white':'var(--text-mid)', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}
      >{c.name}</button>
    ))}
  </div>
</div>


      {cartMsg && (
        <div style={{ position:'fixed', bottom:'2rem', right:'2rem', background:'var(--green-deep)', color:'white', padding:'0.75rem 1.5rem', borderRadius:10, fontWeight:600, fontSize:'0.9rem', zIndex:1000, boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>{cartMsg}</div>
      )}

      {/* Products grid — bluish-white glass cards on a matching glass section background */}
      <div className="section" style={{ background: SECTION_BG }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.5rem' }}>
            {Array.from({length:8}).map((_,i) => (
              <div key={i} style={{
                background: GLASS.bg,
                backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
                border: GLASS.border,
                borderRadius:'var(--radius-lg)', minHeight:300, opacity:0.5,
              }}/>
            ))}
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
              return (
              <div key={p.id}
                onMouseEnter={() => setHoveredProduct(p.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                style={{
                  background: isHovered ? GLASS.bgHover : GLASS.bg,
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: isHovered ? GLASS.borderHov : GLASS.border,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  transform: isHovered ? 'translateY(-8px) scale(1.015)' : 'translateY(0) scale(1)',
                  boxShadow: isHovered ? GLASS.shadowHov : GLASS.shadow,
                  transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.35s ease, background 0.35s ease, border 0.35s ease',
                }}>
                <div style={{ height:200, background:'rgba(224,247,255,0.55)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', position:'relative' }}>
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '📚'}
                  {p.is_featured && <span style={{ position:'absolute', top:10, left:10, background:'var(--green-deep)', color:'white', fontSize:'0.68rem', fontWeight:800, padding:'0.2rem 0.6rem', borderRadius:'100px', letterSpacing:'0.08em' }}>FEATURED</span>}
                  {p.sale_price && <span style={{ position:'absolute', top:10, right:10, background:'#ef4444', color:'white', fontSize:'0.68rem', fontWeight:800, padding:'0.2rem 0.6rem', borderRadius:'100px' }}>SALE</span>}
                </div>
                <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', height:'calc(100% - 200px)' }}>
  <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--green-deep)', fontWeight:600, marginBottom:'0.4rem' }}>{p.name}</div>
  {p.short_description && <p style={{ fontSize:'0.8rem', color:'var(--text-light)', lineHeight:1.5, marginBottom:'0.75rem' }}>{p.short_description}</p>}
  <div style={{ marginBottom:'0.5rem' }}>
    {p.tags?.slice(0,2).map((t,i) => <span key={i} style={{ fontSize:'0.7rem', fontWeight:600, background:'rgba(29,158,117,0.1)', color:'var(--green-deep)', padding:'0.15rem 0.5rem', borderRadius:'100px', marginRight:'0.35rem', border:'1px solid rgba(29,158,117,0.15)' }}>{t}</span>)}
  </div>
  <div style={{ flex:1 }} />
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:'0.75rem' }}>
                    <div>
                      {p.sale_price
                        ? <><span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--green-deep)', fontWeight:700 }}>NPR {p.sale_price.toLocaleString()}</span><span style={{ fontSize:'0.8rem', color:'var(--text-light)', textDecoration:'line-through', marginLeft:'0.5rem' }}>NPR {p.price?.toLocaleString()}</span></>
                        : <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--green-deep)', fontWeight:700 }}>NPR {p.price?.toLocaleString()}</span>
                      }
                    </div>
                    <span style={{ fontSize:'0.75rem', color:p.stock_quantity>0?'var(--green-deep)':'#ef4444', fontWeight:600 }}>
                      {p.is_digital ? '📥 Digital' : p.stock_quantity > 0 ? `${p.stock_quantity} left` : 'Out of stock'}
                    </span>
                  </div>
                  <button onClick={() => addToCart(p.id)} disabled={adding===p.id||p.stock_quantity===0}
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

      {/* ── Cart drawer ── */}
      {cartOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.4)' }}
          onClick={e => e.target===e.currentTarget && setCartOpen(false)}>
          <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'100%', maxWidth:420, background:'var(--white)', boxShadow:'-4px 0 24px rgba(0,0,0,0.12)', display:'flex', flexDirection:'column' }}>
            <div style={{ padding:'1.5rem', borderBottom:'1px solid var(--earth-cream)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--green-deep)' }}>Your Cart ({cartCount})</h2>
              <button onClick={() => setCartOpen(false)} style={{ background:'none', border:'none', fontSize:'1.25rem', cursor:'pointer', color:'var(--text-light)' }}>✕</button>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'1rem 1.5rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign:'center', padding:'3rem 0', color:'var(--text-light)' }}>
                  <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🛒</div><p>Your cart is empty.</p>
                </div>
              ) : cart.map((item, i) => {
                const p = item.products || {}
                const price = item.product_variants?.price ?? p.sale_price ?? p.price ?? 0
                return (
                  <div key={i} style={{ display:'flex', gap:'1rem', padding:'1rem 0', borderBottom:'1px solid var(--earth-cream)', alignItems:'center' }}>
                    <div style={{ width:56, height:56, borderRadius:8, background:'var(--green-mist)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', flexShrink:0, overflow:'hidden' }}>
                      {p.images?.[0] ? <img src={p.images[0]} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt=""/> : '📚'}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:'0.88rem', color:'var(--green-deep)' }}>{p.name}</div>
                      <div style={{ fontSize:'0.8rem', color:'var(--text-light)' }}>NPR {price.toLocaleString()} each</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                      <button onClick={() => updateQty(p.id,(item.quantity||1)-1)} style={{ width:28, height:28, borderRadius:'50%', border:'1.5px solid var(--earth-cream)', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>−</button>
                      <span style={{ minWidth:20, textAlign:'center', fontWeight:700, fontSize:'0.9rem' }}>{item.quantity||1}</span>
                      <button onClick={() => updateQty(p.id,(item.quantity||1)+1)} style={{ width:28, height:28, borderRadius:'50%', border:'1.5px solid var(--earth-cream)', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(p.id)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'1rem' }}>🗑</button>
                  </div>
                )
              })}
            </div>
        {cart.length > 0 && (
  <div style={{ padding:'1.5rem', borderTop:'1px solid var(--earth-cream)' }}>

    {/* ── Delivery address form ── */}
    <div style={{ marginBottom:'1rem' }}>
      <h3 style={{ fontSize:'0.82rem', fontWeight:700, color:'var(--green-deep)', marginBottom:'0.6rem' }}>
        Delivery Address
      </h3>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        <input placeholder="Full name *" value={address.full_name} onChange={updateAddr('full_name')}
          style={{ padding:'0.5rem 0.7rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.8rem' }} />
        <input placeholder="Phone number *" value={address.phone} onChange={updateAddr('phone')}
          style={{ padding:'0.5rem 0.7rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.8rem' }} />
        <input placeholder="Street / area address *" value={address.address_line} onChange={updateAddr('address_line')}
          style={{ padding:'0.5rem 0.7rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.8rem' }} />
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <input placeholder="City *" value={address.city} onChange={updateAddr('city')}
            style={{ flex:1, padding:'0.5rem 0.7rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.8rem' }} />
          <input placeholder="Landmark (optional)" value={address.landmark} onChange={updateAddr('landmark')}
            style={{ flex:1, padding:'0.5rem 0.7rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.8rem' }} />
        </div>
        <textarea placeholder="Delivery notes (optional)" value={address.notes} onChange={updateAddr('notes')} rows={2}
          style={{ padding:'0.5rem 0.7rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.8rem', resize:'vertical' }} />
      </div>
      {addrErr && <p style={{ color:'#ef4444', fontSize:'0.75rem', marginTop:'0.4rem', fontWeight:600 }}>{addrErr}</p>}
    </div>

    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
      <span style={{ fontWeight:600, color:'var(--text-mid)' }}>Total</span>
      <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:'var(--green-deep)' }}>
        NPR {cartTotal.toLocaleString()}
      </span>
    </div>

    <button onClick={handleCheckout}
      style={{ width:'100%', padding:'0.9rem', background:'var(--green-deep)', color:'white', border:'none', borderRadius:10, fontWeight:700, fontSize:'0.95rem', cursor:'pointer' }}>
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
      {/* No inline PaymentModal — usePayment() renders it via PaymentProvider */}
    </div>
  )
}