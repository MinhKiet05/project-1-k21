import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AppSetup from './App-Setup.jsx'
import { ClerkProvider } from '@clerk/clerk-react'

// Check environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if keys are properly configured (not placeholders)
const isClerkConfigured = PUBLISHABLE_KEY && 
  !PUBLISHABLE_KEY.includes('REPLACE_WITH') && 
  !PUBLISHABLE_KEY.includes('your_clerk_key')

const isSupabaseConfigured = SUPABASE_KEY && 
  !SUPABASE_KEY.includes('REPLACE_WITH') && 
  !SUPABASE_KEY.includes('your_supabase')

// Show setup page if keys are not configured
if (!isClerkConfigured || !isSupabaseConfigured) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AppSetup />
    </StrictMode>
  )
} else {
  // Normal app with Clerk
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        navigate={(to) => window.history.pushState(null, '', to)}
        signInUrl="/"
        signUpUrl="/"
        afterSignInUrl="/"
        afterSignUpUrl="/"
      >
        <App />
      </ClerkProvider>
    </StrictMode>
  )
}