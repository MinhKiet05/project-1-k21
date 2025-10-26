import { useEffect } from 'react'

export default function URLCleanup() {
  useEffect(() => {
    // Clean up URL fragments and query params from Clerk redirects
    const currentURL = window.location.href
    
    if (currentURL.includes('#/?redirect_url=') || currentURL.includes('?redirect_url=')) {
      // Clean the URL without redirect
      const cleanURL = window.location.origin + window.location.pathname
      window.history.replaceState(null, '', cleanURL)
    }
  }, [])

  return null
}