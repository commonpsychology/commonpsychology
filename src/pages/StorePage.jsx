// src/pages/StorePage.jsx
// Payment fully centralized — usePayment() replaces the inline checkout modal.
// On success: order + payment both saved in DB, linked by order_id.
// Admin fetches /admin/payments?category=order  OR  /admin/orders

import { useState, useEffect } from 'react'
import { useRouter }  from '../context/RouterContext'
import { useAuth }    from '../context/AuthContext'
import { usePayment } from '../components/PaymentModal'
import { store as storeApi } from '../services/api'

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
    try {
      await storeApi.addToCart(productId, null, 1)
      const d = await storeApi.getCart(); setCart(d.cart || [])
      setCartMsg('Added to cart!'); setTimeout(() => setCartMsg(''), 2500)
    } catch (err) {
      setCartMsg(err.message || 'Could not add to cart.'); setTimeout(() => setCartMsg(''), 2500)
    } finally { setAdding(null) }
  }

  async function removeFromCart(productId) {
    try { await storeApi.removeFromCart(productId); const d = await storeApi.getCart(); setCart(d.cart || []) } catch {}
  }

  async function updateQty(productId, qty) {
    if (qty < 1) { removeFromCart(productId); return }
    try { await storeApi.updateCart(productId, qty); const d = await storeApi.getCart(); setCart(d.cart || []) } catch {}
  }

  // ── Main checkout: create order first, then open payment modal ────────────
  async function handleCheckout() {
    if (!user) { navigate('/signin'); return }
    setCartOpen(false)

    // 1. Create order record in DB (status = 'pending_payment')
    let orderData, orderId
    try {
      orderData = await storeApi.createOrder({ shippingAddress: null })
      orderId   = orderData.order?.id || orderData.id
    } catch (err) {
      alert('Could not create order: ' + (err.message || 'Please try again.'))
      return
    }

    // 2. Build line items from cart for the payment summary
    const itemLines = cart.map(item => {
      const p     = item.products || {}
      const price = item.product_variants?.price ?? p.sale_price ?? p.price ?? 0
      return { label:`${p.name} × ${item.quantity || 1}`, amount: price * (item.quantity || 1) }
    })

    // 3. Open centralized payment modal — all gateway logic lives there
    // COD is allowed for store orders (physical delivery)
    const result = await openPayment({
      type:         'order',
      amount:       cartTotal,
      title:        `Store Order #${String(orderId).slice(-8).toUpperCase()}`,
      description:  `${cartCount} item${cartCount !== 1 ? 's' : ''} from Puja Samargi Store`,
      itemLines,
      couponEnabled: true,
      allowedGateways: ['esewa','khalti','fonepay','stripe','bank_transfer','cash'],
      // Stored in payments table — admin queries by order_id or category='order'
      metadata: {
        order_id:    orderId,
        item_count:  cartCount,
        category:    'order',
      },
    })

    if (result.success) {
      setCart([])
      navigate('/portal')   // or navigate(`/orders/${orderId}/success`)
    } else if (!result.cancelled) {
      // Payment failed — order stays 'pending_payment', user can retry from portal
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
      <div className="page-hero" style={{ background:'var(--green-deep)' }}>
        <span className="section-tag" style={{ color:'var(--green-pale)' }}>Wellness Store</span>
        <h1 className="section-title" style={{ color:'white' }}>Mental Wellness <em>Products</em></h1>
        <p className="section-desc" style={{ color:'rgba(255,255,255,0.75)', maxWidth:500 }}>Books, workbooks, digital tools, and more — curated for your healing journey.</p>
      </div>

      {/* Toolbar */}
      <div style={{ background:'var(--white)', padding:'1.25rem 2rem', borderBottom:'1px solid var(--earth-cream)', display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap', justifyContent:'space-between', position:'sticky', top:0, zIndex:10 }}>
        <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap', flex:1 }}>
          <button onClick={() => { setActiveCategory('all'); setPage(1) }} style={{ padding:'0.4rem 1rem', borderRadius:'100px', border:`1.5px solid ${activeCategory==='all'?'var(--green-deep)':'var(--earth-cream)'}`, background:activeCategory==='all'?'var(--green-deep)':'var(--white)', color:activeCategory==='all'?'white':'var(--text-mid)', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>All</button>
          {categories.map(c => (
            <button key={c.id} onClick={() => { setActiveCategory(c.id); setPage(1) }}
              style={{ padding:'0.4rem 1rem', borderRadius:'100px', border:`1.5px solid ${activeCategory===c.id?'var(--green-deep)':'var(--earth-cream)'}`, background:activeCategory===c.id?'var(--green-deep)':'var(--white)', color:activeCategory===c.id?'white':'var(--text-mid)', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
              {c.name}
            </button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <input placeholder="Search products…" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            style={{ padding:'0.5rem 1rem', border:'1.5px solid var(--earth-cream)', borderRadius:8, fontSize:'0.85rem', outline:'none', width:200 }}/>
          <button onClick={() => setCartOpen(true)} style={{ position:'relative', padding:'0.5rem 1rem', background:'var(--green-deep)', color:'white', border:'none', borderRadius:8, fontSize:'0.85rem', fontWeight:700, cursor:'pointer' }}>
            🛒 Cart {cartCount > 0 && <span style={{ background:'#f97316', borderRadius:'50%', padding:'0 5px', fontSize:'0.72rem', marginLeft:4 }}>{cartCount}</span>}
          </button>
        </div>
      </div>

      {cartMsg && (
        <div style={{ position:'fixed', bottom:'2rem', right:'2rem', background:'var(--green-deep)', color:'white', padding:'0.75rem 1.5rem', borderRadius:10, fontWeight:600, fontSize:'0.9rem', zIndex:1000, boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>{cartMsg}</div>
      )}

      {/* Products grid */}
      <div className="section" style={{ background:'var(--off-white)' }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.5rem' }}>
            {Array.from({length:8}).map((_,i) => <div key={i} style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', minHeight:300, opacity:0.4 }}/>)}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign:'center', padding:'4rem 2rem', color:'var(--text-light)' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📦</div>
            <p>No products found. Try a different search or category.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1.5rem' }}>
            {products.map(p => (
              <div key={p.id} style={{ background:'var(--white)', borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--earth-cream)', transition:'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-strong)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow='none'}>
                <div style={{ height:200, background:'var(--green-mist)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'3rem', position:'relative' }}>
                  {p.images?.[0] ? <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/> : '📚'}
                  {p.is_featured && <span style={{ position:'absolute', top:10, left:10, background:'var(--green-deep)', color:'white', fontSize:'0.68rem', fontWeight:800, padding:'0.2rem 0.6rem', borderRadius:'100px', letterSpacing:'0.08em' }}>FEATURED</span>}
                  {p.sale_price && <span style={{ position:'absolute', top:10, right:10, background:'#ef4444', color:'white', fontSize:'0.68rem', fontWeight:800, padding:'0.2rem 0.6rem', borderRadius:'100px' }}>SALE</span>}
                </div>
                <div style={{ padding:'1.25rem' }}>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--green-deep)', fontWeight:600, marginBottom:'0.4rem' }}>{p.name}</div>
                  {p.short_description && <p style={{ fontSize:'0.8rem', color:'var(--text-light)', lineHeight:1.5, marginBottom:'0.75rem' }}>{p.short_description}</p>}
                  {p.tags?.slice(0,2).map((t,i) => <span key={i} style={{ fontSize:'0.7rem', fontWeight:600, background:'var(--green-mist)', color:'var(--green-deep)', padding:'0.15rem 0.5rem', borderRadius:'100px', marginRight:'0.35rem' }}>{t}</span>)}
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
            ))}
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
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem' }}>
                  <span style={{ fontWeight:600, color:'var(--text-mid)' }}>Total</span>
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', fontWeight:700, color:'var(--green-deep)' }}>NPR {cartTotal.toLocaleString()}</span>
                </div>
                {/* Single button — opens centralized payment modal */}
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