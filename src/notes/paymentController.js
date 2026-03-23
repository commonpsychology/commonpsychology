/* eslint-disable no-undef */
const crypto  = require('crypto')
const supabase = require('../db/supabase')

// ── eSewa helper: build HMAC-SHA256 signature ─────────────────
function esewaSignature(message) {
  return crypto
    .createHmac('sha256', process.env.ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64')
}

// ════════════════════════════════════════════════════════════
// eSewa
// ════════════════════════════════════════════════════════════

// ── POST /api/payments/esewa/initiate ─────────────────────────
// Returns the form data the frontend needs to POST to eSewa
async function esewaInitiate(req, res, next) {
  try {
    const { payment_id } = req.body

    const { data: payment } = await supabase
      .from('payments')
      .select('id, amount, order_id, appointment_id, status, client_id')
      .eq('id', payment_id).single()

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' })
    if (payment.client_id !== req.user.sub)
      return res.status(403).json({ success: false, message: 'Access denied.' })
    if (payment.status === 'completed')
      return res.status(400).json({ success: false, message: 'Payment already completed.' })

    const amount         = Number(payment.amount)
    const tax_amount     = 0
    const total_amount   = amount
    const transaction_uuid = payment.id  // use payment UUID as unique ref
    const product_code   = process.env.ESEWA_MERCHANT_ID
    const success_url    = `${process.env.CLIENT_URL}/payment/esewa/success`
    const failure_url    = `${process.env.CLIENT_URL}/payment/esewa/failure`

    // eSewa v2 signature: "total_amount,transaction_uuid,product_code"
    const signatureMessage = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`
    const signature = esewaSignature(signatureMessage)

    return res.status(200).json({
      success: true,
      gateway_url: `${process.env.ESEWA_BASE_URL}/api/epay/main/v2/form`,
      form_data: {
        amount,
        tax_amount,
        total_amount,
        transaction_uuid,
        product_code,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url,
        failure_url,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
    })
  } catch (err) { next(err) }
}

// ── POST /api/payments/esewa/verify ───────────────────────────
// Called by your frontend after eSewa redirects to success_url
// with ?data=base64encodedJSON
async function esewaVerify(req, res, next) {
  try {
    const { data: encodedData } = req.body  // base64 from eSewa

    if (!encodedData) return res.status(400).json({ success: false, message: 'No data from eSewa.' })

    // Decode the response
    const decoded   = JSON.parse(Buffer.from(encodedData, 'base64').toString('utf-8'))
    const { transaction_uuid, total_amount, transaction_code, status } = decoded

    if (status !== 'COMPLETE')
      return res.status(400).json({ success: false, message: `eSewa payment status: ${status}` })

    // Verify signature from eSewa response
    const signatureMessage = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_MERCHANT_ID},signed_field_names=${decoded.signed_field_names}`
    const expectedSig = esewaSignature(signatureMessage)

    if (expectedSig !== decoded.signature)
      return res.status(400).json({ success: false, message: 'Signature mismatch. Possible fraud.' })

    // transaction_uuid == payment.id
    const { data: payment } = await supabase
      .from('payments').select('id, order_id, appointment_id, client_id, status')
      .eq('id', transaction_uuid).single()

    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found.' })
    if (payment.status === 'completed')
      return res.status(200).json({ success: true, message: 'Payment already recorded.' })

    // Update payment record
    await supabase.from('payments').update({
      status: 'completed',
      method: 'esewa',
      transaction_id: transaction_code,
      gateway_response: decoded,
      paid_at: new Date().toISOString(),
    }).eq('id', payment.id)

    // Update order/appointment status
    if (payment.order_id)
      await supabase.from('orders').update({ status: 'confirmed' }).eq('id', payment.order_id)
    if (payment.appointment_id)
      await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', payment.appointment_id)

    // Create invoice
    await supabase.from('invoices').insert({
      payment_id: payment.id,
      client_id: payment.client_id,
      amount: total_amount,
      status: 'paid',
      paid_at: new Date().toISOString(),
    })

    return res.status(200).json({ success: true, message: 'Payment verified and confirmed.' })
  } catch (err) { next(err) }
}

// ════════════════════════════════════════════════════════════
// Khalti
// ════════════════════════════════════════════════════════════

// ── POST /api/payments/khalti/initiate ────────────────────────
async function khaltiInitiate(req, res, next) {
  try {
    const { payment_id, customer_info } = req.body

    const { data: payment } = await supabase
      .from('payments')
      .select('id, amount, order_id, appointment_id, status, client_id')
      .eq('id', payment_id).single()

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' })
    if (payment.client_id !== req.user.sub)
      return res.status(403).json({ success: false, message: 'Access denied.' })
    if (payment.status === 'completed')
      return res.status(400).json({ success: false, message: 'Payment already completed.' })

    // Call Khalti initiate API
    const response = await fetch(`${process.env.KHALTI_BASE_URL}/api/v2/epayment/initiate/`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        return_url: `${process.env.CLIENT_URL}/payment/khalti/verify`,
        website_url: process.env.CLIENT_URL,
        amount: Math.round(Number(payment.amount) * 100), // Khalti uses paisa
        purchase_order_id: payment.id,
        purchase_order_name: payment.order_id ? 'Product Order' : 'Therapy Session',
        customer_info: customer_info || {},
      }),
    })

    const data = await response.json()

    if (!response.ok)
      return res.status(400).json({ success: false, message: 'Khalti initiation failed.', details: data })

    // Store pidx (Khalti's payment reference) in gateway_response
    await supabase.from('payments').update({ gateway_response: data }).eq('id', payment.id)

    return res.status(200).json({
      success: true,
      payment_url: data.payment_url,
      pidx: data.pidx,
    })
  } catch (err) { next(err) }
}

// ── POST /api/payments/khalti/verify ─────────────────────────
// Called by frontend after Khalti redirects with ?pidx=...
async function khaltiVerify(req, res, next) {
  try {
    const { pidx } = req.body

    if (!pidx) return res.status(400).json({ success: false, message: 'pidx required.' })

    // Verify with Khalti
    const response = await fetch(`${process.env.KHALTI_BASE_URL}/api/v2/epayment/lookup/`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    })

    const data = await response.json()

    if (!response.ok || data.status !== 'Completed')
      return res.status(400).json({ success: false, message: `Khalti payment status: ${data.status}`, details: data })

    // purchase_order_id == payment.id
    const { data: payment } = await supabase
      .from('payments').select('id, order_id, appointment_id, client_id, status, amount')
      .eq('id', data.purchase_order_id).single()

    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found.' })
    if (payment.status === 'completed')
      return res.status(200).json({ success: true, message: 'Payment already recorded.' })

    // Verify amount matches (Khalti returns paisa)
    const paidAmount = data.total_amount / 100
    if (Math.abs(paidAmount - Number(payment.amount)) > 1)
      return res.status(400).json({ success: false, message: 'Amount mismatch.' })

    await supabase.from('payments').update({
      status: 'completed', method: 'khalti',
      transaction_id: data.transaction_id || pidx,
      gateway_response: data, paid_at: new Date().toISOString(),
    }).eq('id', payment.id)

    if (payment.order_id)
      await supabase.from('orders').update({ status: 'confirmed' }).eq('id', payment.order_id)
    if (payment.appointment_id)
      await supabase.from('appointments').update({ status: 'confirmed' }).eq('id', payment.appointment_id)

    await supabase.from('invoices').insert({
      payment_id: payment.id, client_id: payment.client_id,
      amount: paidAmount, status: 'paid', paid_at: new Date().toISOString(),
    })

    return res.status(200).json({ success: true, message: 'Khalti payment verified.' })
  } catch (err) { next(err) }
}

// ── GET /api/payments/my ─────────────────────────────────────
async function getMyPayments(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('id, amount, currency, method, status, transaction_id, paid_at, created_at, orders(order_number), appointments(scheduled_at)')
      .eq('client_id', req.user.sub)
      .order('created_at', { ascending: false })

    if (error) throw error
    return res.status(200).json({ success: true, payments: data })
  } catch (err) { next(err) }
}

// ── GET /api/payments/invoices ────────────────────────────────
async function getMyInvoices(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('id, invoice_number, amount, tax, status, paid_at, created_at, payments(method)')
      .eq('client_id', req.user.sub)
      .order('created_at', { ascending: false })

    if (error) throw error
    return res.status(200).json({ success: true, invoices: data })
  } catch (err) { next(err) }
}

module.exports = { esewaInitiate, esewaVerify, khaltiInitiate, khaltiVerify, getMyPayments, getMyInvoices }