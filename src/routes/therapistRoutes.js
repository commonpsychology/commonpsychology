// ============================================================
// ADD THIS to your src/routes/controllers/adminController.js
// (or wherever your admin controller lives)
// This is the therapist-specific endpoint
// ============================================================

// ── GET /api/therapist/appointments ──────────────────────────
// Returns only appointments belonging to the logged-in therapist
async function getMyTherapistAppointments(req, res, next) {
  try {
    const userId = req.user?.id   // the therapist's profile id

    // First get the therapist record for this user
    const { data: therapistRecord, error: tErr } = await supabase
      .from('therapists')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (tErr || !therapistRecord) {
      return res.status(404).json({ success: false, message: 'Therapist profile not found.' })
    }

    const { status, page = 1, limit = 50 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = supabase
      .from('appointments')
      .select(`
        id, scheduled_at, type, status, duration_minutes,
        notes, cancellation_reason, created_at,
        client_id, therapist_id,
        clients:profiles!appointments_client_id_fkey (
          id, full_name, email, phone, avatar_url, date_of_birth, gender
        )
      `, { count: 'exact' })
      .eq('therapist_id', therapistRecord.id)
      .order('scheduled_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    if (status) query = query.eq('status', status)

    const { data, count, error } = await query
    if (error) throw error

    return res.status(200).json({
      success: true,
      appointments: data || [],
      pagination: { page: Number(page), limit: Number(limit), total: count || 0 },
    })
  } catch (err) { next(err) }
}

module.exports = { getMyTherapistAppointments }


// ============================================================
// ADD TO YOUR ROUTES — create src/routes/therapistRoutes.js
// ============================================================
/*
const express    = require('express')
const router     = express.Router()
const { authenticate, requireRole } = require('../middleware/auth')
const { getMyTherapistAppointments } = require('./controllers/adminController')
// or wherever you put the function

router.use(authenticate)
router.use(requireRole(['therapist', 'admin']))

router.get('/appointments', getMyTherapistAppointments)

module.exports = router
*/

// ============================================================
// ADD TO src/index.js or server.js:
// ============================================================
/*
const therapistRoutes = require('./routes/therapistRoutes')
app.use('/api/therapist', therapistRoutes)
*/