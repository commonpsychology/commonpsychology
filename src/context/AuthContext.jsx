// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from './RouterContext'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── localStorage helpers ──────────────────────────────────────
const ls = {
  get:    k      => { try { return JSON.parse(localStorage.getItem(k)) } catch { return null } },
  set:    (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  raw:    k      => localStorage.getItem(k),
  setRaw: (k, v) => localStorage.setItem(k, v),
  del:    k      => localStorage.removeItem(k),
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => ls.get('user'))
  const [loading, setLoading] = useState(true)
  const refreshTimer          = useRef(null)

  // ── Core refresh ─────────────────────────────────────────────
  const doRefresh = useCallback(async () => {
    const refreshToken = ls.raw('refreshToken')
    if (!refreshToken) return false
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refreshToken }),
      })
      if (!res.ok) return false
      const data = await res.json()
      ls.setRaw('accessToken',  data.accessToken)
      ls.setRaw('refreshToken', data.refreshToken)
      return true
    } catch {
      return false
    }
  }, [])

  // ── Schedule silent refresh every 13 min ─────────────────────
  const scheduleRefresh = useCallback(() => {
    clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(async () => {
      const ok = await doRefresh()
      if (ok) scheduleRefresh()
      else    clearUser()
    }, 13 * 60 * 1000)
  }, [doRefresh])

  const clearUser = useCallback(() => {
    ls.del('accessToken')
    ls.del('refreshToken')
    ls.del('user')
    setUser(null)
    clearTimeout(refreshTimer.current)
  }, [])

  // ── FIX: Multi-tab sync via storage events ───────────────────
  // When any tab writes or clears the accessToken, all other tabs
  // react instantly — logging in syncs the session, logging out
  // clears every tab simultaneously.
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== 'accessToken') return
      if (e.newValue) {
        // Another tab logged in — pull the user they stored
        const storedUser = ls.get('user')
        if (storedUser) setUser(storedUser)
      } else {
        // Another tab logged out — clear this tab too
        setUser(null)
        clearTimeout(refreshTimer.current)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])
  // ─────────────────────────────────────────────────────────────

  // ── On mount: verify stored token ────────────────────────────
  useEffect(() => {
    async function init() {
      const token  = ls.raw('accessToken')
      const stored = ls.get('user')

      if (!token || !stored) {
        clearUser()
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          ls.set('user', data.user)
          setUser(data.user)
          scheduleRefresh()
        } else if (res.status === 401) {
          const ok = await doRefresh()
          if (ok) {
            const res2 = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${ls.raw('accessToken')}` },
            })
            if (res2.ok) {
              const data2 = await res2.json()
              ls.set('user', data2.user)
              setUser(data2.user)
              scheduleRefresh()
            } else {
              clearUser()
            }
          } else {
            clearUser()
          }
        } else {
          clearUser()
        }
      } catch {
        // Network error — trust the stored user optimistically
        setUser(stored)
      } finally {
        setLoading(false)
      }
    }

    init()
    return () => clearTimeout(refreshTimer.current)
  }, [])

  // ── Login ────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Login failed')

    ls.setRaw('accessToken',  data.accessToken)
    ls.setRaw('refreshToken', data.refreshToken)
    ls.set('user', data.user)
    setUser(data.user)
    scheduleRefresh()
    // Return the full data object so callers can read data.user.role
    return data
  }, [scheduleRefresh])

  // ── Logout ───────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = ls.raw('refreshToken')
    try {
      if (refreshToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ refreshToken }),
        })
      }
    } catch {}
    clearUser()
  }, [clearUser])

  // ── Refresh user profile from server ─────────────────────────
  const refreshUser = useCallback(async () => {
    const token = ls.raw('accessToken')
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        ls.set('user', data.user)
        setUser(data.user)
      }
    } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

// ── FIX: useAuthGuard ─────────────────────────────────────────
// Drop this at the top of any login/sign-in page component.
// If the user is already logged in (e.g. they pressed the browser
// back button), they are immediately redirected to their dashboard.
// This replaces all the pushState / popstate hacks.
export function useAuthGuard() {
  const { user, loading } = useAuth()
  const { navigate }      = useRouter()

  useEffect(() => {
    if (loading) return   // still checking session — wait
    if (!user)   return   // not logged in — stay on the page
    const role = user.role
    if (role === 'admin' || role === 'staff') navigate('/staff/admin')
    else if (role === 'therapist')            navigate('/staff/therapist')
    else                                      navigate('/portal')
  }, [user, loading])
}