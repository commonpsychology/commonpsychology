// src/context/RouterContext.jsx
// Fixed: now parses dynamic :param segments directly from the URL
// so /news/some-slug sets params.slug automatically on hard-refresh or popstate

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const RouterContext = createContext(null)

// ── Persist the in-app back-stack across full page reloads ──────
// sessionStorage survives a hard reload within the same WebView tab,
// so if something forces a real navigation (a stray <a href>, a
// window.location.reload(), etc.) the back stack rehydrates instead
// of collapsing to a single entry and sending back-button presses home.
const STACK_KEY = '__nav_stack__'

function loadStack(fallbackPath) {
  try {
    const raw = sessionStorage.getItem(STACK_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch {}
  return [fallbackPath]
}

function saveStack(stack) {
  try { sessionStorage.setItem(STACK_KEY, JSON.stringify(stack)) } catch {}
}

// ── Route definitions — ADD every dynamic route here ──────────
// Order matters: more specific patterns first
const DYNAMIC_ROUTES = [
  { pattern: '/news/:slug',                  param: 'slug'         },
  { pattern: '/assessment-take/:assessmentId', param: 'assessmentId' },
  { pattern: '/psychological-view/:slug',    param: 'slug'         },
  { pattern: '/therapist/:id',               param: 'id'           },
  { pattern: '/blog/:slug',                  param: 'slug'         },
  { pattern: '/research/:id',                  param: 'id'           },
  { pattern: '/services/:slug',              param: 'slug'         }, // ← ADD THIS
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
  const [params, setParams] = useState(
    () => extractParams(window.location.pathname || '/')
  )

  // Our own in-app navigation stack, since window.history's length/state
  // isn't reliably readable and popstate doesn't tell us if there's more
  // history behind the current entry.
  const [stack, setStack] = useState(() => loadStack(window.location.pathname || '/'))

  // Keep sessionStorage in sync whenever the stack changes, so a hard
  // reload (or Android killing/recreating the WebView) doesn't wipe it.
  useEffect(() => { saveStack(stack) }, [stack])

  useEffect(() => {
    function onPopState() {
      const path = window.location.pathname || '/'
      setCurrentPath(path)
      setParams(extractParams(path))
      // Keep our stack roughly in sync when the browser itself navigates
      // (e.g. swipe-back gesture, or hardware back going through real history)
      setStack(s => {
        if (s.length > 1 && s[s.length - 2] === path) {
          return s.slice(0, -1) // went back one
        }
        if (s[s.length - 1] === path) {
          return s // no change
        }
        return [...s, path] // treat as a forward navigation we didn't track
      })
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = useCallback((path, extraParams = {}) => {
    if (path === currentPath) return
    window.history.pushState({ path }, '', path)
    setCurrentPath(path)
    setParams({ ...extractParams(path), ...extraParams })
    setStack(s => [...s, path])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPath])

  const replace = useCallback((path, extraParams = {}) => {
    window.history.replaceState({ path }, '', path)
    setCurrentPath(path)
    setParams({ ...extractParams(path), ...extraParams })
    setStack(s => (s.length ? [...s.slice(0, -1), path] : [path]))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Reliable back: if we have somewhere in-app to go, use it;
  // otherwise fall back to home instead of silently doing nothing.
  const goBack = useCallback(() => {
    setStack(s => {
      if (s.length <= 1) {
        if (window.location.pathname !== '/') {
          window.history.pushState({ path: '/' }, '', '/')
          setCurrentPath('/')
          setParams({})
        }
        return ['/']
      }
      const next = s.slice(0, -1)
      const target = next[next.length - 1]
      window.history.pushState({ path: target }, '', target)
      setCurrentPath(target)
      setParams(extractParams(target))
      return next
    })
  }, [])

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
