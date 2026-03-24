// src/components/RouteGuards.jsx
// Drop this into your router setup.
// Usage:
//   <PublicRoute>  <SignInPage />  </PublicRoute>      ← redirects logged-in users AWAY from /signin
//   <ProtectedRoute roles={['therapist']}> <TherapistDashboard /> </ProtectedRoute>

import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useRouter } from '../context/RouterContext'

/**
 * PublicRoute — wraps pages like /signin, /register.
 * If the user is already logged in, redirect them to the right dashboard.
 */
export function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  const { navigate }      = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user)   return

    // Already logged in — send to the right place
    if (user.role === 'admin' || user.role === 'staff') {
      navigate('/staff/admin')
    } else if (user.role === 'therapist') {
      navigate('/staff/therapist')
    } else {
      navigate('/portal')
    }
  }, [user, loading])

  if (loading) return <LoadingScreen />
  if (user)    return null   // redirect happening, render nothing
  return children
}

/**
 * ProtectedRoute — wraps pages that require login (and optionally a role).
 * If not logged in → redirect to /signin (for clients) or /staff (for staff pages).
 * If logged in but wrong role → redirect to their correct dashboard.
 */
export function ProtectedRoute({ children, roles = [], staffPage = false }) {
  const { user, loading } = useAuth()
  const { navigate }      = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      navigate(staffPage ? '/staff' : '/signin')
      return
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
      // Wrong role — send to their correct dashboard
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/staff/admin')
      } else if (user.role === 'therapist') {
        navigate('/staff/therapist')
      } else {
        navigate('/portal')
      }
    }
  }, [user, loading, roles])

  if (loading)                                       return <LoadingScreen />
  if (!user)                                         return null
  if (roles.length > 0 && !roles.includes(user.role)) return null
  return children
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0fbff' }}>
      <div style={{ textAlign: 'center', color: '#7a9aaa' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌿</div>
        <p style={{ fontFamily: 'var(--font-body)', margin: 0 }}>Loading…</p>
      </div>
    </div>
  )
}