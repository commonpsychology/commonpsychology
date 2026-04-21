// src/services/api.js
// Central API client — never call fetch() directly in components.
import { playlists as playlistsApi } from '../services/playlistsApi'

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api'


// ── Token helpers ─────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem('accessToken')
export const getRefreshToken = () => localStorage.getItem('refreshToken')
export const setTokens = (access, refresh) => {
  localStorage.setItem('accessToken',  access)
  localStorage.setItem('refreshToken', refresh)
}
export const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}
export const getUser    = () => JSON.parse(localStorage.getItem('user') || 'null')
export const setUser    = (u) => localStorage.setItem('user', JSON.stringify(u))
export const isLoggedIn = () => !!getAccessToken()

// ── Smart redirect after auth failure ────────────────────────
function redirectAfterAuthFailure() {
  const path = window.location.pathname
  const isStaffPage = path.startsWith('/staff')
  if (path === '/signin' || path === '/staff') return
  window.location.href = isStaffPage ? '/staff' : '/signin'
}

// ── Core fetch wrapper ────────────────────────────────────────
async function request(path, options = {}, retry = true) {
  const token = getAccessToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  // 401 → try to refresh once, then retry.
  // But never redirect if this is a login/register call — just throw.
  if (res.status === 401 && retry) {
    const isAuthEndpoint = path === '/auth/login' || path === '/auth/register'

    if (!isAuthEndpoint) {
      const refreshed = await tryRefresh()
      if (refreshed) return request(path, options, false)
      clearTokens()
      redirectAfterAuthFailure()
    }

    // Parse error message from backend and throw — always
    let message = 'Invalid email or password.'
    try {
      const errData = await res.json()
      if (errData.message) message = errData.message
    } catch {}
    const err = new Error(message)
    err.status = 401
    throw err
  }

  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed')
    err.status = res.status
    err.errors = data.errors
    throw err
  }

  return data
}

async function tryRefresh() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) return false
    const data = await res.json()
    setTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    return false
  }
}

const get   = (path, opts)       => request(path, { method: 'GET',    ...opts })
const post  = (path, body, opts) => request(path, { method: 'POST',   body: JSON.stringify(body), ...opts })
const put   = (path, body, opts) => request(path, { method: 'PUT',    body: JSON.stringify(body), ...opts })
const patch = (path, body, opts) => request(path, { method: 'PATCH',  body: JSON.stringify(body), ...opts })
const del   = (path, body, opts) => request(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined, ...opts })

// =============================================================================
// AUTH
// =============================================================================
export const auth = {
  register: (name, email, password) =>
    post('/auth/register', { name, email, password }),

  login: async (email, password) => {
    const data = await post('/auth/login', { email, password })
    setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
    return data
  },

  logout: async () => {
    const refreshToken = getRefreshToken()
    try { await post('/auth/logout', { refreshToken }) } catch {}
    clearTokens()
  },

  logoutAll: async () => {
    try { await post('/auth/logout-all', {}) } catch {}
    clearTokens()
  },

  verifyEmail:        (token)           => get(`/auth/verify-email?token=${token}`),
  resendVerification: (email)           => post('/auth/resend-verification', { email }),
  forgotPassword:     (email)           => post('/auth/forgot-password', { email }),
  resetPassword:      (token, password) => post('/auth/reset-password', { token, password }),
  getMe:              ()                => get('/auth/me'),
}

// =============================================================================
// PROFILE
// =============================================================================
export const profile = {
  get:            ()          => get('/profile'),
  update:         (fields)    => put('/profile', fields),
  changePassword: (cur, next) => post('/profile/change-password', { currentPassword: cur, newPassword: next }),
  updateAvatar:   (avatarUrl) => post('/profile/avatar', { avatarUrl }),
  deleteAccount:  (password)  => del('/profile', { password }),
}

// =============================================================================
// THERAPISTS
// =============================================================================
export const therapists = {
  list:            (params = {}) => { const q = new URLSearchParams(params).toString(); return get(`/therapists${q ? `?${q}` : ''}`) },
  search:          (q)           => get(`/therapists/search?q=${encodeURIComponent(q)}`),
  getById:         (id)          => get(`/therapists/${id}`),
  getAvailability: (id)          => get(`/therapists/${id}/availability`),
}

// =============================================================================
// APPOINTMENTS
// =============================================================================
export const appointments = {
  book:       (therapistId, scheduledAt, type, notes) => post('/appointments', { therapistId, scheduledAt, type, notes }),
  list:       (params = {}) => { const q = new URLSearchParams(params).toString(); return get(`/appointments${q ? `?${q}` : ''}`) },
  getById:    (id)          => get(`/appointments/${id}`),
  cancel:     (id, reason)  => patch(`/appointments/${id}/cancel`, { reason }),
  reschedule: (id, at)      => patch(`/appointments/${id}/reschedule`, { scheduledAt: at }),
}

// =============================================================================
// STORE
// =============================================================================
export const store = {
  categories:         ()                               => get('/store/categories'),
  products:           (params = {})                    => { const q = new URLSearchParams(params).toString(); return get(`/store/products${q ? `?${q}` : ''}`) },
  product:            (id)                             => get(`/store/products/${id}`),
  getCart:            ()                               => get('/store/cart'),
  addToCart:          (productId, variantId, quantity)  => post('/store/cart', { productId, variantId, quantity }),
  updateCart:         (productId, qty)                 => patch(`/store/cart/${productId}`, { quantity: qty }),
  removeFromCart:     (productId)                      => del(`/store/cart/${productId}`),
  clearCart:          ()                               => del('/store/cart'),
  getWishlist:        ()                               => get('/store/wishlist'),
  addToWishlist:      (productId)                      => post('/store/wishlist', { productId }),
  removeFromWishlist: (productId)                      => del(`/store/wishlist/${productId}`),
  orders:             (params = {})                    => { const q = new URLSearchParams(params).toString(); return get(`/store/orders${q ? `?${q}` : ''}`) },
  order:              (id)                             => get(`/store/orders/${id}`),
  createOrder:        (body)                           => post('/store/orders', body),
}

// =============================================================================
// PAYMENTS
// =============================================================================
export const payments = {
  initiate: (body)                    => post('/payments/initiate', body),
  verify:   (id, txnId, gateway)      => post('/payments/verify', { paymentId: id, transactionId: txnId, gatewayResponse: gateway }),
  history:  (params = {})             => { const q = new URLSearchParams(params).toString(); return get(`/payments${q ? `?${q}` : ''}`) },
  getById:  (id)                      => get(`/payments/${id}`),
}

// =============================================================================
// WELLNESS
// =============================================================================
export const wellness = {
  assessments:      ()          => get('/assessments'),
  assessment:       (id)        => get(`/assessments/${id}`),
  submitAssessment: (id, ans)   => post(`/assessments/${id}/submit`, { answers: ans }),
  myResults:        ()          => get('/assessments/results/me'),
  getMoodLogs:  (params={}) => { const q = new URLSearchParams(params).toString(); return get(`/wellness/mood${q ? `?${q}` : ''}`) },
addMoodLog:   (body)      => post('/wellness/mood', body),
getJournal:   (params={}) => { const q = new URLSearchParams(params).toString(); return get(`/wellness/journal${q ? `?${q}` : ''}`) },
createEntry:  (body)      => post('/wellness/journal', body),
updateEntry:  (id, body)  => put(`/wellness/journal/${id}`, body),
deleteEntry:  (id)        => del(`/wellness/journal/${id}`),
getHabits:    ()          => get('/wellness/habits'),
createHabit:  (body)      => post('/wellness/habits', body),
logHabit:     (id, notes) => post(`/wellness/habits/${id}/log`, { notes }),
}

// =============================================================================
// NOTIFICATIONS
// =============================================================================
export const notifications = {
  list:        (params={}) => { const q = new URLSearchParams(params).toString(); return get(`/notifications${q ? `?${q}` : ''}`) },
  markRead:    (id)        => patch(`/notifications/${id}/read`, {}),
  markAllRead: ()          => patch('/notifications/read-all', {}),
  delete:      (id)        => del(`/notifications/${id}`),
}

// REPLACE the `community` export in src/services/api.js with this:

export const community = {
  // Groups
  groups:          ()         => get('/community/groups'),
  group:           (id)       => get(`/community/groups/${id}`),
  myGroups:        ()         => get('/community/my-groups'),
  checkMembership: (id)       => get(`/community/groups/${id}/membership`),

  // joinGroup now accepts full body including payment fields
  joinGroup:       (id, body) => post(`/community/groups/${id}/join`, body),
  leaveGroup:      (id)       => del(`/community/groups/${id}/leave`),

  // Link a payment record to a membership (called after /payments POST)
  linkMembershipPayment: (membershipId, paymentId) =>
    patch(`/community/memberships/${membershipId}/link-payment`, { payment_id: paymentId }),

  // My memberships with payment status
  myMemberships: () => get('/community/my-memberships'),

  // Sessions
  sessions:         ()         => get('/community/sessions'),
  myReservations:   ()         => get('/community/my-reservations'),
  reserveSession:   (id, body) => post(`/community/sessions/${id}/reserve`, body),
  cancelReservation:(id)       => del(`/community/sessions/${id}/cancel-reservation`),

  // Posts
  posts:      (params={}) => { const q = new URLSearchParams(params).toString(); return get(`/community/posts${q ? `?${q}` : ''}`) },
  createPost: (body)      => post('/community/posts', body),
  likePost:   (id, body)  => post(`/community/posts/${id}/like`, body),
  deletePost: (id)        => del(`/community/posts/${id}`),
}

// =============================================================================
// ADMIN — all endpoints require admin/staff role JWT
// =============================================================================
export const admin = {
  dashboard: () => get('/admin/dashboard'),

  users: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return get(`/admin/users${q ? `?${q}` : ''}`)
  },
  toggleActive: (id)       => patch(`/admin/users/${id}/toggle-active`, {}),
  updateRole:   (id, role) => patch(`/admin/users/${id}/role`, { role }),

  appointments: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return get(`/admin/appointments${q ? `?${q}` : ''}`)
  },
  updateAppointmentStatus: (id, status) => patch(`/admin/appointments/${id}/status`, { status }),

  orders: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return get(`/admin/orders${q ? `?${q}` : ''}`)
  },
  updateOrderStatus: (id, status) => patch(`/admin/orders/${id}/status`, { status }),

  payments: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return get(`/admin/payments${q ? `?${q}` : ''}`)
  },

  createProduct: (body)     => post('/admin/products', body),
  updateProduct: (id, body) => patch(`/admin/products/${id}`, body),
  deleteProduct: (id)       => del(`/admin/products/${id}`),

  notify: (body) => post('/admin/notifications', body),

    registerStaff: (body) => post('/admin/register-staff', body),
}

// =============================================================================
// POLLS
// =============================================================================
export const polls = {
  submit: (answers) => post('/polls/submit', { answers }).catch(() => null),
}

// =============================================================================
// CONTENT
// =============================================================================
export const content = {
  gallery:         (cat)       => { const q = cat && cat !== 'All' ? `?category=${encodeURIComponent(cat)}` : ''; return get(`/content/gallery${q}`) },
  posts:           (params={}) => { const q = new URLSearchParams(params).toString(); return get(`/content/posts${q ? `?${q}` : ''}`) },
  post:            (slug)      => get(`/content/posts/${slug}`),
  research:        (params={}) => { const q = new URLSearchParams(params).toString(); return get(`/content/research${q ? `?${q}` : ''}`) },
  workshops:       ()          => get('/content/workshops'),
  registerWorkshop:(id, body)  => post(`/content/workshops/${id}/register`, body),
  socialPrograms:  ()          => get('/content/social-programs'),
  communityGroups: ()          => get('/content/community-groups'),
  joinGroup:       (id, body)  => post(`/content/community-groups/${id}/join`, body),
  leaveGroup:      (id)        => del(`/content/community-groups/${id}/leave`),
  groupPosts:      (id)        => get(`/content/community-groups/${id}/posts`),
  resources:       (cat)       => { const q = cat && cat !== 'All' ? `?category=${encodeURIComponent(cat)}` : ''; return get(`/content/resources${q}`) },
courses: () => get('/courses'),
  enrollCourse:    (id, body)  => post(`/content/courses/${id}/enroll`, body),
  bookPlace:       (body)      => post('/content/place-bookings', body),
}

export default { auth, profile, therapists, appointments, store, payments, wellness, notifications, admin, polls, content }
