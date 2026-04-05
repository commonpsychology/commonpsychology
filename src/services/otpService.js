// src/services/otpService.js  (frontend)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function callAPI(endpoint, body) {
  const res = await fetch(`${API_BASE}/otp/${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok || data.error) throw new Error(data.error || 'OTP request failed.')
  return data
}

// channel: 'email' | 'sms' | 'both'
export async function sendOTP({ user_id = null, email = null, phone = null, otp_type, name = '', channel = 'email' }) {
  return callAPI('send', { user_id, email, phone, otp_type, name, channel })
}

export async function verifyOTP({ email = null, phone = null, otp_code, otp_type }) {
  return callAPI('verify', { email, phone, otp_code, otp_type })
}

export function validateNepaliPhone(phone) {
  let n = String(phone).replace(/[\s\-().+]/g, '')
  if (n.startsWith('00977'))      n = n.slice(5)
  else if (n.startsWith('+977'))  n = n.slice(4)
  else if (n.startsWith('977') && n.length === 13) n = n.slice(3)
  if (!/^(97|98)\d{8}$/.test(n)) {
    return { valid: false, normalized: null, error: 'Enter a valid 10-digit Nepali mobile number starting with 97 or 98.' }
  }
  return { valid: true, normalized: n, error: null }
}

export function formatNepaliPhone(p) {
  if (!p || p.length !== 10) return p
  return `${p.slice(0,4)}-${p.slice(4,7)}-${p.slice(7)}`
}