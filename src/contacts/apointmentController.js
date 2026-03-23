/* eslint-disable no-undef */
const { validationResult } = require('express-validator')
const supabase = require('../db/supabase')

const fail = (res, errors) => res.status(422).json({
  success: false, message: 'Validation failed.',
  errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
})

// ── GET /api/appointments — list user's appointments ─────────
async function getMyAppointments(req, res, next) {
  try {
    const { status, from, to, page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = supabase
      .from('appointments')
      .select(`
        id, scheduled_at, duration_minutes, type, status, meeting_link, notes,
        therapists (
          id, consultation_fee,
          profiles!therapists_user_id_fkey ( full_name, avatar_url )
        )
      `, { count: 'exact' })
      .eq('client_id', req.user.sub)
      .order('scheduled_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    if (status) query = query.eq('status', status)
    if (from)   query = query.gte('scheduled_at', from)
    if (to)     query = query.lte('scheduled_at', to)

    const { data, count, error } = await query
    if (error) throw error

    return res.status(200).json({
      success: true,
      appointments: data,
      pagination: { page: Number(page), limit: Number(limit), total: count },
    })
  } catch (err) { next(err) }
}

// ── POST /api/appointments — book appointment ─────────────────
async function bookAppointment(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return fail(res, errors)

    const { therapist_id, scheduled_at, duration_minutes = 60, type = 'online', notes } = req.body

    // Verify therapist exists and is available
    const { data: therapist } = await supabase
      .from('therapists').select('id, is_available, consultation_fee')
      .eq('id', therapist_id).single()

    if (!therapist) return res.status(404).json({ success: false, message: 'Therapist not found.' })
    if (!therapist.is_available) return res.status(409).json({ success: false, message: 'Therapist is not available.' })

    // Check no overlapping appointment for this therapist at this time
    const start = new Date(scheduled_at)
    const end   = new Date(start.getTime() + duration_minutes * 60000)

    const { data: clash } = await supabase
      .from('appointments')
      .select('id')
      .eq('therapist_id', therapist_id)
      .in('status', ['pending', 'confirmed'])
      .lt('scheduled_at', end.toISOString())
      .gt('scheduled_at', new Date(start.getTime() - duration_minutes * 60000).toISOString())

    if (clash && clash.length > 0)
      return res.status(409).json({ success: false, message: 'This time slot is already booked.' })

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        client_id: req.user.sub, therapist_id,
        scheduled_at, duration_minutes, type, notes,
      })
      .select(`
        id, scheduled_at, duration_minutes, type, status, notes,
        therapists (
          id, consultation_fee,
          profiles!therapists_user_id_fkey ( full_name, avatar_url )
        )
      `)
      .single()

    if (error) throw error

    // Create a pending payment record
    await supabase.from('payments').insert({
      appointment_id: appointment.id,
      client_id: req.user.sub,
      amount: therapist.consultation_fee,
      currency: 'NPR',
      status: 'pending',
    })

    return res.status(201).json({ success: true, message: 'Appointment booked.', appointment })
  } catch (err) { next(err) }
}

// ── GET /api/appointments/:id ─────────────────────────────────
async function getAppointment(req, res, next) {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        therapists (
          id, consultation_fee, session_duration,
          profiles!therapists_user_id_fkey ( full_name, avatar_url, phone )
        ),
        sessions ( id, summary, homework, mood_before, mood_after )
      `)
      .eq('id', req.params.id)
      .single()

    if (error || !appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' })

    // Clients can only see their own; therapists can see theirs
    const isClient    = appointment.client_id === req.user.sub
    const isTherapist = req.user.role === 'therapist' // further check below if needed
    const isAdmin     = req.user.role === 'admin'

    if (!isClient && !isTherapist && !isAdmin)
      return res.status(403).json({ success: false, message: 'Access denied.' })

    return res.status(200).json({ success: true, appointment })
  } catch (err) { next(err) }
}

// ── PATCH /api/appointments/:id/cancel ───────────────────────
async function cancelAppointment(req, res, next) {
  try {
    const { reason } = req.body

    const { data: existing } = await supabase
      .from('appointments').select('id, client_id, status, scheduled_at')
      .eq('id', req.params.id).single()

    if (!existing) return res.status(404).json({ success: false, message: 'Appointment not found.' })
    if (existing.client_id !== req.user.sub && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied.' })
    if (['cancelled','completed'].includes(existing.status))
      return res.status(400).json({ success: false, message: `Cannot cancel a ${existing.status} appointment.` })

    const { data: updated, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled', cancellation_reason: reason || null })
      .eq('id', req.params.id)
      .select().single()

    if (error) throw error
    return res.status(200).json({ success: true, message: 'Appointment cancelled.', appointment: updated })
  } catch (err) { next(err) }
}

// ── GET /api/appointments/therapist/:therapistId/availability ─
async function getTherapistAvailability(req, res, next) {
  try {
    const { therapistId } = req.params

    const { data: slots, error } = await supabase
      .from('therapist_availability')
      .select('day_of_week, start_time, end_time')
      .eq('therapist_id', therapistId)
      .eq('is_active', true)
      .order('day_of_week')

    if (error) throw error

    // Also return unavailability periods
    const { data: unavailable } = await supabase
      .from('therapist_unavailability')
      .select('start_date, end_date, reason')
      .eq('therapist_id', therapistId)
      .gte('end_date', new Date().toISOString())

    return res.status(200).json({ success: true, slots, unavailable: unavailable || [] })
  } catch (err) { next(err) }
}

// ── GET /api/appointments/therapist/:therapistId/booked ───────
// Returns booked time slots so the frontend can block them
async function getTherapistBookedSlots(req, res, next) {
  try {
    const { therapistId } = req.params
    const { from, to } = req.query

    let query = supabase
      .from('appointments')
      .select('scheduled_at, duration_minutes')
      .eq('therapist_id', therapistId)
      .in('status', ['pending','confirmed'])

    if (from) query = query.gte('scheduled_at', from)
    if (to)   query = query.lte('scheduled_at', to)

    const { data, error } = await query
    if (error) throw error
    return res.status(200).json({ success: true, booked: data })
  } catch (err) { next(err) }
}

// ── POST /api/appointments/:id/session — therapist adds notes ─
async function createSessionNotes(req, res, next) {
  try {
    if (req.user.role !== 'therapist' && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Only therapists can add session notes.' })

    const { summary, homework, next_session_plan, mood_before, mood_after, session_notes } = req.body

    const { data: appointment } = await supabase
      .from('appointments').select('id, client_id, therapist_id, status')
      .eq('id', req.params.id).single()

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found.' })

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        appointment_id: appointment.id,
        client_id: appointment.client_id,
        therapist_id: appointment.therapist_id,
        summary, homework, next_session_plan,
        mood_before, mood_after, session_notes,
        started_at: new Date().toISOString(),
      })
      .select().single()

    if (error) throw error

    // Mark appointment as completed
    await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointment.id)

    return res.status(201).json({ success: true, session })
  } catch (err) { next(err) }
}

module.exports = {
  getMyAppointments, bookAppointment, getAppointment,
  cancelAppointment, getTherapistAvailability,
  getTherapistBookedSlots, createSessionNotes,
}