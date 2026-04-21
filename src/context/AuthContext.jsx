// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from './RouterContext'

const API_BASE = import.meta.env.VITE_API_URL || '${import.meta.env.VITE_API_URL}/api'

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

  // ── Token Refresh ────────────────────────────────────────────
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

  const clearUser = useCallback(() => {
    ls.del('accessToken')
    ls.del('refreshToken')
    ls.del('user')
    setUser(null)
    clearTimeout(refreshTimer.current)
  }, [])

  const scheduleRefresh = useCallback(() => {
    clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(async () => {
      const ok = await doRefresh()
      if (ok) scheduleRefresh()
      else clearUser()
    }, 13 * 60 * 1000)
  }, [doRefresh, clearUser])

  // ── Sync across tabs ─────────────────────────────────────────
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== 'accessToken') return
      if (e.newValue) {
        const storedUser = ls.get('user')
        if (storedUser) setUser(storedUser)
      } else {
        setUser(null)
        clearTimeout(refreshTimer.current)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // ── Init auth ────────────────────────────────────────────────
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
        setUser(stored)
      } finally {
        setLoading(false)
      }
    }

    init()
    return () => clearTimeout(refreshTimer.current)
  }, [doRefresh, scheduleRefresh, clearUser])

  // ── LoginRaw (NO state update) ───────────────────────────────
  const loginRaw = useCallback(async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Login failed')
    }

    return data
  }, [])

  // ── Login (WITH state update) ────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await loginRaw(email, password)

    ls.setRaw('accessToken',  data.accessToken)
    ls.setRaw('refreshToken', data.refreshToken)
    ls.set('user', data.user)

    setUser(data.user)
    scheduleRefresh()

    return data
  }, [loginRaw, scheduleRefresh])

  // ── Register ────────────────────────────────────────────────
  const register = useCallback(async (name, email, password, metadata = {}) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        phone: metadata.phone || null,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Registration failed')
    return data
  }, [])

  // ── Logout ─────────────────────────────────────────────────
  const logout = useCallback(async () => {
    const refreshToken = ls.raw('refreshToken')
    try {
      if (refreshToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
      }
    } catch {}
    clearUser()
  }, [clearUser])

  // ── Refresh user ────────────────────────────────────────────
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
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginRaw,   // ✅ FIXED: now available
        logout,
        refreshUser,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────
export const useAuth = () => useContext(AuthContext)

// ── Auth Guard ───────────────────────────────────────────────
export function useAuthGuard() {
  const { user, loading } = useAuth()
  const { navigate }      = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) return

    const role = user.role
    if (role === 'admin' || role === 'staff') navigate('/staff/admin')
    else if (role === 'therapist') navigate('/staff/therapist')
    else navigate('/portal')
  }, [user, loading, navigate])
}
