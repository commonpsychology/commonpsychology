// src/routes/contact.js
const express = require('express')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const router   = express.Router()

// POST /api/contact
router.post('/', async (req, res) => {
  const { name, email, phone, subject, message, type = 'general' } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required.' })
  }

  const { error } = await supabase.from('contact_messages').insert({ name, email, phone, subject, message, type })
  if (error) {
    console.error('contact insert error:', error)
    return res.status(500).json({ success: false, message: 'Could not save message.' })
  }

  return res.status(200).json({ success: true, message: 'Message received. We will get back to you shortly.' })
})

// GET /api/contact  (admin: list messages)
router.get('/', async (req, res) => {
  const { page = 1, limit = 20, status } = req.query
  const offset = (page - 1) * limit

  let query = supabase.from('contact_messages')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) return res.status(500).json({ success: false, message: 'Could not fetch messages.' })

  return res.status(200).json({ success: true, messages: data, pagination: { page: Number(page), limit: Number(limit), total: count } })
})

module.exports = router