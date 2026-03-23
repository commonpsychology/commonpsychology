/* eslint-disable no-undef */
const { validationResult } = require('express-validator')
const supabase = require('../db/supabase')

const fail = (res, errors) => res.status(422).json({
  success: false, message: 'Validation failed.',
  errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
})

// ═══════════ ASSESSMENTS ═════════════════════════════════════

// ── GET /api/assessments ──────────────────────────────────────
async function getAssessments(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('id, title, slug, description, type, is_free, is_active')
      .eq('is_active', true)
      .order('title')
    if (error) throw error
    return res.status(200).json({ success: true, assessments: data })
  } catch (err) { next(err) }
}

// ── GET /api/assessments/:slug ────────────────────────────────
async function getAssessment(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('id, title, slug, description, type, questions, scoring, is_free')
      .eq('slug', req.params.slug)
      .eq('is_active', true)
      .single()
    if (error || !data) return res.status(404).json({ success: false, message: 'Assessment not found.' })
    return res.status(200).json({ success: true, assessment: data })
  } catch (err) { next(err) }
}

// ── POST /api/assessments/:id/submit ─────────────────────────
async function submitAssessment(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return fail(res, errors)

    const { answers } = req.body // [{question_id, answer, score}]

    const { data: assessment } = await supabase
      .from('assessments').select('id, scoring, questions').eq('id', req.params.id).single()

    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found.' })

    // Calculate total score
    const total_score = answers.reduce((sum, a) => sum + (Number(a.score) || 0), 0)

    // Match scoring range
    let result_label = '', result_detail = '', recommendation = ''
    if (assessment.scoring) {
      const match = assessment.scoring.find(s =>
        total_score >= s.range[0] && total_score <= s.range[1]
      )
      if (match) {
        result_label    = match.label
        result_detail   = match.description || ''
        recommendation  = match.recommendation || ''
      }
    }

    const { data: result, error } = await supabase
      .from('assessment_results')
      .insert({
        assessment_id: assessment.id,
        user_id: req.user.sub,
        answers, total_score, result_label, result_detail, recommendation,
      })
      .select().single()

    if (error) throw error

    return res.status(201).json({
      success: true,
      result: { id: result.id, total_score, result_label, result_detail, recommendation, taken_at: result.taken_at },
    })
  } catch (err) { next(err) }
}

// ── GET /api/assessments/results/my ──────────────────────────
async function getMyResults(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('assessment_results')
      .select('id, total_score, result_label, recommendation, taken_at, assessments(title, type, slug)')
      .eq('user_id', req.user.sub)
      .order('taken_at', { ascending: false })
    if (error) throw error
    return res.status(200).json({ success: true, results: data })
  } catch (err) { next(err) }
}

// ═══════════ MOOD LOGS ═══════════════════════════════════════

// ── POST /api/mood — log today's mood ────────────────────────
async function logMood(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return fail(res, errors)

    const { mood_score, emotions = [], notes, activities = [], sleep_hours } = req.body

    const { data, error } = await supabase
      .from('mood_logs')
      .insert({ user_id: req.user.sub, mood_score, emotions, notes, activities, sleep_hours })
      .select().single()

    if (error) throw error
    return res.status(201).json({ success: true, log: data })
  } catch (err) { next(err) }
}

// ── GET /api/mood — mood history ─────────────────────────────
async function getMoodHistory(req, res, next) {
  try {
    const { from, to, limit = 30 } = req.query

    let query = supabase
      .from('mood_logs')
      .select('id, mood_score, emotions, notes, activities, sleep_hours, logged_at')
      .eq('user_id', req.user.sub)
      .order('logged_at', { ascending: false })
      .limit(Number(limit))

    if (from) query = query.gte('logged_at', from)
    if (to)   query = query.lte('logged_at', to)

    const { data, error } = await query
    if (error) throw error

    // Summary stats
    const avg = data.length ? (data.reduce((s, l) => s + l.mood_score, 0) / data.length).toFixed(1) : null

    return res.status(200).json({ success: true, logs: data, stats: { count: data.length, average_mood: Number(avg) } })
  } catch (err) { next(err) }
}

// ═══════════ JOURNAL ═════════════════════════════════════════

async function getJournalEntries(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    const { data, count, error } = await supabase
      .from('journal_entries')
      .select('id, title, mood_score, tags, created_at', { count: 'exact' })
      .eq('user_id', req.user.sub)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    if (error) throw error
    return res.status(200).json({ success: true, entries: data, total: count })
  } catch (err) { next(err) }
}

async function getJournalEntry(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('journal_entries').select('*')
      .eq('id', req.params.id).eq('user_id', req.user.sub).single()
    if (error || !data) return res.status(404).json({ success: false, message: 'Entry not found.' })
    return res.status(200).json({ success: true, entry: data })
  } catch (err) { next(err) }
}

async function createJournalEntry(req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return fail(res, errors)

    const { title, content, mood_score, tags, prompt_used } = req.body

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({ user_id: req.user.sub, title, content, mood_score, tags, prompt_used })
      .select().single()

    if (error) throw error
    return res.status(201).json({ success: true, entry: data })
  } catch (err) { next(err) }
}

async function updateJournalEntry(req, res, next) {
  try {
    const { title, content, mood_score, tags } = req.body
    const { data, error } = await supabase
      .from('journal_entries')
      .update({ title, content, mood_score, tags })
      .eq('id', req.params.id).eq('user_id', req.user.sub)
      .select().single()
    if (error) throw error
    return res.status(200).json({ success: true, entry: data })
  } catch (err) { next(err) }
}

async function deleteJournalEntry(req, res, next) {
  try {
    await supabase.from('journal_entries').delete()
      .eq('id', req.params.id).eq('user_id', req.user.sub)
    return res.status(200).json({ success: true, message: 'Entry deleted.' })
  } catch (err) { next(err) }
}

module.exports = {
  getAssessments, getAssessment, submitAssessment, getMyResults,
  logMood, getMoodHistory,
  getJournalEntries, getJournalEntry, createJournalEntry, updateJournalEntry, deleteJournalEntry,
}