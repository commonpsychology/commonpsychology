// src/context/RouterContext.jsx
// Fixed: now parses dynamic :param segments directly from the URL
// so /news/some-slug sets params.slug automatically on hard-refresh or popstate

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RouterContext = createContext(null)

// ── Route definitions — ADD every dynamic route here ──────────
// Order matters: more specific patterns first
const DYNAMIC_ROUTES = [
  { pattern: '/news/:slug',                  param: 'slug'         },
  { pattern: '/assessment-take/:assessmentId', param: 'assessmentId' },
  { pattern: '/psychological-view/:slug',    param: 'slug'         },
  { pattern: '/therapist/:id',               param: 'id'           },
  { pattern: '/blog/:slug',                  param: 'slug'         },
    { pattern: '/research/:id',                  param: 'id'           }, // ← ADD THIS
  { pattern: '/product/:slug',               param: 'slug'         },
  { pattern: '/course/:slug',                param: 'slug'         },
]

// Extract params from the current pathname by matching against DYNAMIC_ROUTES
function extractParams(pathname) {
  for (const route of DYNAMIC_ROUTES) {
    const patternParts = route.pattern.split('/')
    const pathParts    = pathname.split('/')

    if (patternParts.length !== pathParts.length) continue

    const match = patternParts.every((part, i) =>
      part.startsWith(':') || part === pathParts[i]
    )

    if (match) {
      const extracted = {}
      patternParts.forEach((part, i) => {
        if (part.startsWith(':')) {
          extracted[part.slice(1)] = decodeURIComponent(pathParts[i])
        }
      })
      return extracted
    }
  }
  return {}
}

export function RouterProvider({ children }) {
  const [currentPath, setCurrentPath] = useState(
    () => window.location.pathname || '/'
  )
  // Initialise params from the URL immediately (handles hard-refresh)
  const [params, setParams] = useState(
    () => extractParams(window.location.pathname || '/')
  )

  // Listen to browser back/forward
  useEffect(() => {
    function onPopState() {
      const path = window.location.pathname || '/'
      setCurrentPath(path)
      setParams(extractParams(path))
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((path, extraParams = {}) => {
    if (path === currentPath) return
    window.history.pushState({ path }, '', path)
    setCurrentPath(path)
    // Merge URL-parsed params with any extra params passed programmatically
    setParams({ ...extractParams(path), ...extraParams })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPath])

  const replace = useCallback((path, extraParams = {}) => {
    window.history.replaceState({ path }, '', path)
    setCurrentPath(path)
    setParams({ ...extractParams(path), ...extraParams })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const goBack    = useCallback(() => window.history.back(),    [])
  const goForward = useCallback(() => window.history.forward(), [])

  return (
    <RouterContext.Provider value={{ currentPath, params, navigate, replace, goBack, goForward }}>
      {children}
    </RouterContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRouter() {
  return useContext(RouterContext)
}