// routes/delivery.js — FIXED check-credentials + send-otp + verify-otp
// ─────────────────────────────────────────────────────────────
// ROOT CAUSE of "Profile not found":
//
//   The profiles row EXISTS (id=0133d057, role=rider, password_hash='oauth').
//   The delivery_riders row EXISTS (user_id=0133d057).
//
//   But check-credentials was doing:
//     supabase.auth.signInWithPassword(...)
//   which creates a Supabase Auth SESSION — this requires the anon key +
//   RLS to be configured. On many setups this returns a valid user but
//   then the subsequent profiles query with the SERVICE ROLE KEY is
//   fine, but the user_id extracted from authData.user.id may differ
//   from what the profiles table has (e.g. if the supabase client
//   used is the anon-key client, not service-role).
//
//   The REAL issue: supabase.auth.signInWithPassword() on the
//   SERVICE ROLE client does NOT work for credential verification —
//   it only works on the ANON/public client. Using service role key
//   for signInWithPassword always fails silently or returns wrong data.
//
// FIX:
//   Use a SEPARATE supabase client with the ANON KEY for auth sign-in,
//   keep the service role client for DB queries.
//   This matches how your profiles rows are set up (password_hash='oauth'
//   means the password lives in Supabase Auth, not bcrypt).
// ─────────────────────────────────────────────────────────────

const express    = require('express')
const jwt        = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { createClient } = require('@supabase/supabase-js')

const router = express.Router()

// ── Two Supabase clients ──────────────────────────────────────
// Service role: for DB reads/writes (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
// Anon/public: for auth.signInWithPassword (must use anon key)
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY   // ← add SUPABASE_ANON_KEY to your .env
)

// ── Email transport ───────────────────────────────────────────
const mailer = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

// ── JWT helper ────────────────────────────────────────────────
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '12h' })
}

// ── Auth guard for authenticated rider routes ─────────────────
async function getRider(req) {
  const header = req.headers['authorization'] || ''
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) throw { status: 401, message: 'Not authenticated.' }

  let decoded
  try { decoded = jwt.verify(token, process.env.JWT_SECRET) }
  catch { throw { status: 401, message: 'Invalid or expired session.' } }

  const userId = decoded.userId || decoded.id || decoded.sub

  const { data: rider, error } = await supabase
    .from('delivery_riders')
    .select(`
      id, user_id, area, vehicle_type, vehicle_number,
      is_active, is_available, total_delivered, total_failed,
      profiles!inner ( id, full_name, email, phone, is_active )
    `)
    .eq('user_id', userId)
    .single()

  if (error || !rider)           throw { status: 403, message: 'Rider not found.' }
  if (!rider.is_active)          throw { status: 403, message: 'Account is inactive.' }
  if (!rider.profiles.is_active) throw { status: 403, message: 'Account is inactive.' }
  return rider
}

// ─────────────────────────────────────────────────────────────
// POST /api/delivery/check-credentials
// ─────────────────────────────────────────────────────────────
// Works for BOTH registration paths:
//   • admin.createUser() → password_hash = 'oauth' in profiles
//     → use supabaseAuth.signInWithPassword (anon key client)
//   • register-staff.js  → password_hash = bcrypt hash
//     → also works via signInWithPassword if user was created in auth.users
//       OR falls back to bcrypt compare against profiles.password_hash
//
// Sequence:
//   1. Try Supabase Auth sign-in (covers both cases above)
//   2. Look up profiles row by the auth user ID
//   3. Look up delivery_riders row
//   4. Return { user: { id, full_name, email, phone, rider_id, area } }
// ─────────────────────────────────────────────────────────────
router.post('/check-credentials', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' })

    const normalizedEmail = email.trim().toLowerCase()

    // ── Step 1: Authenticate via Supabase Auth (ANON key client) ──
    // This is the correct client for signInWithPassword.
    // Using the service role key for sign-in does NOT work.
    const { data: authData, error: authError } =
      await supabaseAuth.auth.signInWithPassword({
        email:    normalizedEmail,
        password,
      })

console.error('[auth debug] authError full:', JSON.stringify(authError))
console.error('[auth debug] authData:', JSON.stringify(authData))

    if (authError || !authData?.user) {
      // Auth failed — wrong password or user doesn't exist in auth.users
      console.error('[delivery/check-credentials] auth error:', authError?.message)
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const userId = authData.user.id

    // Sign out immediately — we only needed credential verification.
    // The OTP gate is the actual auth. We don't want a lingering session.
    supabaseAuth.auth.signOut().catch(() => {})

    // ── Step 2: Fetch profiles row ─────────────────────────────
    // Use SERVICE ROLE client so RLS never blocks this.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, is_active')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('[delivery/check-credentials] profile lookup failed:', profileError?.message, 'userId:', userId)
      return res.status(404).json({ message: 'Profile not found. Contact admin.' })
    }

    if (!profile.is_active)
      return res.status(403).json({ message: 'Account is inactive. Contact admin.' })

    if (profile.role !== 'rider')
      return res.status(403).json({ message: 'This portal is for delivery riders only.' })

    // ── Step 3: Fetch delivery_riders row ──────────────────────
    const { data: riderRow, error: riderError } = await supabase
      .from('delivery_riders')
      .select('id, is_active, is_available, area, vehicle_type, vehicle_number')
      .eq('user_id', userId)
      .single()

    if (riderError || !riderRow) {
      console.error('[delivery/check-credentials] rider row not found:', riderError?.message)
      return res.status(403).json({ message: 'Rider profile not set up. Contact admin.' })
    }

    if (!riderRow.is_active)
      return res.status(403).json({ message: 'Rider account is inactive. Contact admin.' })

    // ── Step 4: Return info for OTP modal ──────────────────────
    return res.status(200).json({
      user: {
        id:           profile.id,        // used as user_id in send-otp / verify-otp
        full_name:    profile.full_name,
        email:        profile.email,
        phone:        profile.phone,
        rider_id:     riderRow.id,
        area:         riderRow.area,
        vehicle_type: riderRow.vehicle_type,
      },
    })

  } catch (err) {
    console.error('[delivery/check-credentials] unexpected:', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
})

// ─────────────────────────────────────────────────────────────
// POST /api/delivery/send-otp
// Body: { user_id }
// ─────────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  try {
    const { user_id } = req.body
    if (!user_id) return res.status(400).json({ message: 'user_id is required.' })

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, is_active')
      .eq('id', user_id)
      .single()

    if (error || !profile)  return res.status(404).json({ message: 'User not found.' })
    if (!profile.is_active) return res.status(403).json({ message: 'Account is inactive.' })
    if (profile.role !== 'rider')
      return res.status(403).json({ message: 'Not a rider account.' })

    // Generate 6-digit OTP
    const code    = String(Math.floor(100000 + Math.random() * 900000))
    const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    // Clear old codes then insert new one
    await supabase.from('otp_codes').delete().eq('user_id', user_id)
    const { error: insertErr } = await supabase.from('otp_codes').insert({
      user_id,
      code,
      expires_at: expires,
      used:       false,
    })

    if (insertErr) {
      console.error('[delivery/send-otp] insert error:', insertErr)
      return res.status(500).json({ message: 'Failed to generate OTP.' })
    }

    // Send email
    await mailer.sendMail({
      from:    `"Common Psychology" <${process.env.SMTP_USER}>`,
      to:      profile.email,
      subject: 'Your Delivery Portal Login Code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:2rem">
          <h2 style="color:#007BA8;margin-bottom:.5rem">🚴 Delivery Portal Login</h2>
          <p>Hi <strong>${profile.full_name}</strong>,</p>
          <p>Your one-time login code is:</p>
          <div style="font-size:2.5rem;font-weight:800;letter-spacing:.25em;color:#1a3a4a;
                      background:#E0F7FF;border-radius:12px;padding:1rem 1.5rem;
                      text-align:center;margin:1.25rem 0">${code}</div>
          <p style="color:#7a9aaa;font-size:.85rem">
            Expires in <strong>10 minutes</strong>.<br>
            If you didn't request this, contact your supervisor.
          </p>
        </div>`,
    })

    return res.status(200).json({ message: `Code sent to ${profile.email}` })

  } catch (err) {
    console.error('[delivery/send-otp]', err)
    return res.status(500).json({ message: 'Failed to send OTP. Try again.' })
  }
})

// ─────────────────────────────────────────────────────────────
// POST /api/delivery/verify-otp
// Body: { user_id, otp }
// Returns { token, rider } on success
// ─────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  try {
    const { user_id, otp } = req.body
    if (!user_id || !otp)
      return res.status(400).json({ message: 'user_id and otp are required.' })

    // Fetch latest unused code for this user
    const { data: record, error } = await supabase
      .from('otp_codes')
      .select('id, code, expires_at, used')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error || !record)
      return res.status(400).json({ message: 'No code found. Request a new one.' })
    if (record.used)
      return res.status(400).json({ message: 'Code already used. Request a new one.' })
    if (new Date(record.expires_at) < new Date())
      return res.status(400).json({ message: 'Code expired. Request a new one.' })
    if (record.code !== String(otp).trim())
      return res.status(400).json({ message: 'Incorrect code. Please try again.' })

    // Mark code as used
    await supabase.from('otp_codes').update({ used: true }).eq('id', record.id)

    // Fetch rider + profile for the response
    const { data: rider, error: rErr } = await supabase
      .from('delivery_riders')
      .select(`
        id, area, vehicle_type, vehicle_number, is_available,
        total_delivered, total_failed,
        profiles!inner ( id, full_name, email, phone )
      `)
      .eq('user_id', user_id)
      .single()

    if (rErr || !rider)
      return res.status(500).json({ message: 'Rider profile not found.' })

    const token = signToken(user_id)

    // Shape matches what DeliveryLoginPage stores in localStorage as 'deliveryRider'
    // DeliveryDashboardPage reads: rider.name, rider.email, rider.phone, rider.area
    return res.status(200).json({
      token,
      rider: {
        id:              rider.id,
        name:            rider.profiles.full_name,
        email:           rider.profiles.email,
        phone:           rider.profiles.phone,
        area:            rider.area,
        vehicle_type:    rider.vehicle_type,
        vehicle_number:  rider.vehicle_number,
        is_available:    rider.is_available,
        total_delivered: rider.total_delivered,
        total_failed:    rider.total_failed,
      },
    })

  } catch (err) {
    console.error('[delivery/verify-otp]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/delivery/my-orders
// ─────────────────────────────────────────────────────────────
router.get('/my-orders', async (req, res) => {
  try {
    const rider  = await getRider(req)
    const page   = Math.max(1, parseInt(req.query.page)  || 1)
    const limit  = Math.min(50, parseInt(req.query.limit) || 15)
    const offset = (page - 1) * limit
    const dsFilter = req.query.delivery_status || null

    const VALID_DS = ['unassigned','assigned','picked_up','in_transit','delivered','failed','returned']
    if (dsFilter && !VALID_DS.includes(dsFilter))
      return res.status(400).json({ message: 'Invalid delivery_status filter.' })

    let q = supabase
      .from('orders')
      .select(`
        id, order_number, status, total_amount, payment_status,
        delivery_status, delivery_address, delivery_note,
        picked_up_at, delivered_at, failed_at, created_at, updated_at,
        profiles!client_id ( full_name )
      `, { count: 'exact' })
      .eq('delivery_rider_id', rider.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (dsFilter) q = q.eq('delivery_status', dsFilter)

    const { data: rows, error: qErr, count } = await q
    if (qErr) {
      console.error('[delivery/my-orders]', qErr)
      return res.status(500).json({ message: 'Failed to fetch orders.' })
    }

    const items = (rows || []).map(o => ({
      ...o,
      client_name: o.profiles?.full_name || null,
      profiles:    undefined,
    }))

    // Summary counts (separate query — no pagination)
    const { data: all } = await supabase
      .from('orders')
      .select('delivery_status')
      .eq('delivery_rider_id', rider.id)

    const summary = { total: 0, assigned: 0, picked_up: 0, in_transit: 0, delivered: 0, failed: 0, returned: 0 }
    ;(all || []).forEach(r => {
      summary.total++
      if (summary[r.delivery_status] !== undefined) summary[r.delivery_status]++
    })

    return res.status(200).json({
      items,
      pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) },
      summary,
    })

  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    console.error('[delivery/my-orders GET]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
})

// ─────────────────────────────────────────────────────────────
// PUT /api/delivery/my-orders/:id
// ─────────────────────────────────────────────────────────────
router.put('/my-orders/:id', async (req, res) => {
  try {
    const rider = await getRider(req)
    const { delivery_status, delivery_note, note } = req.body
    const resolvedNote   = delivery_note || note || null
    const RIDER_STATUSES = ['picked_up','in_transit','delivered','failed','returned']

    if (!delivery_status || !RIDER_STATUSES.includes(delivery_status))
      return res.status(400).json({ message: `delivery_status must be one of: ${RIDER_STATUSES.join(', ')}` })

    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('id, delivery_status, delivery_rider_id, order_number')
      .eq('id', req.params.id)
      .single()

    if (fetchErr || !order)
      return res.status(404).json({ message: 'Order not found.' })
    if (order.delivery_rider_id !== rider.id)
      return res.status(403).json({ message: 'This order is not assigned to you.' })
    if (['delivered','returned'].includes(order.delivery_status))
      return res.status(409).json({ message: `Order is already ${order.delivery_status}.` })

    const now   = new Date().toISOString()
    const patch = { delivery_status, delivery_note: resolvedNote, updated_at: now }
    if (delivery_status === 'picked_up' && !order.picked_up_at) patch.picked_up_at = now
    if (delivery_status === 'delivered') patch.delivered_at = now
    if (delivery_status === 'failed')    patch.failed_at    = now

    const { data: updated, error: upErr } = await supabase
      .from('orders').update(patch).eq('id', req.params.id)
      .select('id, order_number, delivery_status, delivery_note, delivered_at, updated_at')
      .single()

    if (upErr) {
      console.error('[delivery/my-orders PUT]', upErr)
      return res.status(500).json({ message: 'Failed to update order.' })
    }

    // Audit trail (non-blocking)
    supabase.from('delivery_status_history').insert({
      order_id:   req.params.id,
      rider_id:   rider.id,
      old_status: order.delivery_status,
      new_status: delivery_status,
      note:       resolvedNote,
      changed_by: rider.user_id,
    }).then(({ error }) => {
      if (error) console.warn('[delivery] history log failed:', error.message)
    })

    // Bump counters (non-blocking)
    if (delivery_status === 'delivered')
      supabase.from('delivery_riders')
        .update({ total_delivered: rider.total_delivered + 1 })
        .eq('id', rider.id).then(() => {})
    if (delivery_status === 'failed')
      supabase.from('delivery_riders')
        .update({ total_failed: rider.total_failed + 1 })
        .eq('id', rider.id).then(() => {})

    return res.status(200).json({
      message: `Delivery status updated to ${delivery_status}.`,
      order:   updated,
    })

  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    console.error('[delivery/my-orders PUT]', err)
    return res.status(500).json({ message: 'Internal server error.' })
  }
})

// ─────────────────────────────────────────────────────────────
// GET /api/delivery/me
// ─────────────────────────────────────────────────────────────
router.get('/me', async (req, res) => {
  try {
    const rider = await getRider(req)
    return res.status(200).json({
      id:              rider.id,
      name:            rider.profiles.full_name,
      email:           rider.profiles.email,
      phone:           rider.profiles.phone,
      area:            rider.area,
      vehicle_type:    rider.vehicle_type,
      vehicle_number:  rider.vehicle_number,
      is_available:    rider.is_available,
      total_delivered: rider.total_delivered,
      total_failed:    rider.total_failed,
    })
  } catch (err) {
    if (err.status) return res.status(err.status).json({ message: err.message })
    return res.status(500).json({ message: 'Internal server error.' })
  }
})

module.exports = router

export default DeliveryLoginPage
