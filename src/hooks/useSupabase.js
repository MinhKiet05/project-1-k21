import { useState, useEffect, useMemo } from 'react'
import { useSession } from '@clerk/clerk-react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Kiểm tra config ngay khi import
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// Singleton client instance
let globalSupabaseClient = null

const createAuthenticatedClient = () => {
  if (!globalSupabaseClient) {
    globalSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
        storageKey: `sb-${supabaseUrl.split('//')[1]?.split('.')[0]}-auth`,
      },
    })
  }
  return globalSupabaseClient
}

export function useSupabase() {
  const { session, isLoaded } = useSession()
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  const supabaseClient = useMemo(() => {
    try {
      return createAuthenticatedClient()
    } catch (err) {
      setError(err.message)
      return null
    }
  }, [])

  useEffect(() => {
    if (!isLoaded || !supabaseClient) {
      setIsReady(false)
      return
    }

    const setupAuth = async () => {
      try {
        setError(null)

        if (session) {
          const token = await session.getToken({ template: 'supabase' })
          if (token) {
            supabaseClient.rest.headers['Authorization'] = `Bearer ${token}`
          } else {
            throw new Error('Failed to get Supabase token')
          }
        } else {
          delete supabaseClient.rest.headers['Authorization']
        }

        setIsReady(true)
      } catch (err) {
        setError(err.message)
        setIsReady(false)
      }
    }

    setupAuth()
  }, [session, isLoaded, supabaseClient])

  // Auto refresh token
  useEffect(() => {
    if (!session || !supabaseClient || !isReady) return

    const refreshInterval = setInterval(async () => {
      try {
        const token = await session.getToken({ template: 'supabase' })
        if (token) {
          supabaseClient.rest.headers['Authorization'] = `Bearer ${token}`
        }
      } catch {
        // Silent fail
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(refreshInterval)
  }, [session, supabaseClient, isReady])

  return { supabaseClient, isReady, error }
}

export function useAuthenticatedSupabase() {
  const { supabaseClient, isReady, error } = useSupabase()

  if (!isReady || error || !supabaseClient) {
    throw new Error(error || 'Supabase client not ready')
  }

  return supabaseClient
}