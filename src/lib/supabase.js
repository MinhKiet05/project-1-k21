import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env.VITE_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Hàm để set auth token từ Clerk
export const setSupabaseAuth = (token) => {
  if (token) {
    supabase.auth.setSession({ access_token: token, refresh_token: '' })
  } else {
    supabase.auth.signOut()
  }
}