// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { auth as authApi, getUser, setUser, clearTokens, isLoggedIn } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Seed user from localStorage immediately so pages don't flash
  const [user, setUserState] = useState(() => getUser())

  // loading=true ONLY while we're verifying an existing token with the server.
  // If there's no token at all, we already know the answer → start false.
  const [loading, setLoading] = useState(() => isLoggedIn())

  useEffect(() => {
    if (!isLoggedIn()) {
      // No token → nothing to verify, not loading
      setLoading(false)
      return
    }

    // Token exists → verify it's still valid
    authApi.getMe()
      .then((data) => {
        // Server confirmed → update user in state + storage
        setUserState(data.user)
        setUser(data.user)
      })
      .catch(() => {
        // Token was invalid/expired → wipe everything
        // The api.js request() will handle redirect if needed
        clearTokens()
        setUserState(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    setUserState(data.user)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    return authApi.register(name, email, password)
  }, [])

  const logout = useCallback(async () => {
    try { await authApi.logout() } catch {}
    clearTokens()
    setUserState(null)
  }, [])

  const logoutAll = useCallback(async () => {
    try { await authApi.logoutAll() } catch {}
    clearTokens()
    setUserState(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.getMe()
      setUserState(data.user)
      setUser(data.user)
    } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, logoutAll, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}