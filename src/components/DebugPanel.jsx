import { useState } from 'react'

export default function DebugPanel() {
  const [showDebug, setShowDebug] = useState(false)

  const envVars = {
    'VITE_CLERK_PUBLISHABLE_KEY': import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    'VITE_SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL, 
    'VITE_SUPABASE_ANON_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
  }

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        style={{ 
          position: 'fixed', 
          bottom: '20px', 
          right: '20px', 
          background: '#666', 
          color: 'white', 
          padding: '10px', 
          border: 'none', 
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        🔍 Debug
      </button>
    )
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'white', 
      border: '2px solid #ccc', 
      padding: '20px', 
      borderRadius: '8px',
      minWidth: '300px',
      maxHeight: '400px',
      overflow: 'auto',
      zIndex: 1000,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h4 style={{ margin: 0 }}>🔍 Debug Panel</h4>
        <button 
          onClick={() => setShowDebug(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>🌍 Environment:</strong>
        <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
          {import.meta.env.DEV ? 'Development' : 'Production'}
        </p>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>🔑 Environment Variables:</strong>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ margin: '8px 0', fontSize: '11px' }}>
            <code style={{ background: '#f5f5f5', padding: '2px 4px' }}>{key}</code>
            <br />
            <span style={{ color: value ? 'green' : 'red' }}>
              {value ? '✅ ' + (value.length > 20 ? value.slice(0, 20) + '...' : value) : '❌ Missing'}
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>🔗 Current URL:</strong>
        <p style={{ margin: '5px 0', fontSize: '11px', wordBreak: 'break-all' }}>
          {window.location.href}
        </p>
      </div>

      <button 
        onClick={() => {
          console.log('🔍 DEBUG INFO:')
          console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production')
          console.log('URL:', window.location.href)
          Object.entries(envVars).forEach(([key, value]) => {
            console.log(`${key}:`, value ? '✅ Set' : '❌ Missing')
          })
        }}
        style={{ 
          width: '100%', 
          padding: '8px', 
          background: '#007acc', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer' 
        }}
      >
        📋 Log to Console
      </button>
    </div>
  )
}