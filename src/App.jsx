import './App.css'

import Header from './components/header/Header.jsx'
import Footer from './components/footer/Footer.jsx'  
import HomePage from './pages/homePage/HomePage.jsx'
import { useUser } from '@clerk/clerk-react'
import logo from './assets/logo.png';
function DebugInfo() {
  const { isLoaded, isSignedIn, user } = useUser()

  return (
    <div style={{ 
      background: '#f0f0f0', 
      padding: '20px', 
      margin: '20px 0',
      borderRadius: '5px',
      fontSize: '14px',
      fontFamily: 'monospace'
    }}>
      <h3>� Debug Information</h3>
      <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
      <p><strong>Clerk Loaded:</strong> {isLoaded ? '✅ Yes' : '❌ No'}</p>
      <p><strong>User Signed In:</strong> {isSignedIn ? '✅ Yes' : '❌ No'}</p>
      <p><strong>User ID:</strong> {user?.id || 'Not signed in'}</p>
      <p><strong>User Email:</strong> {user?.emailAddresses?.[0]?.emailAddress || 'N/A'}</p>
      <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
      <p><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
      <p><strong>Domain:</strong> {window.location.hostname}</p>
    </div>
  )
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      
      <div style={{ flex: 1 }}>
        <HomePage />
        <img src={logo} alt="Logo" />
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <DebugInfo />
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
