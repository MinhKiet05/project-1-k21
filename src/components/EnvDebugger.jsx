import { useState } from 'react'

export default function EnvDebugger() {
  const [showDetails, setShowDetails] = useState(false)

  const envVars = {
    'CLERK_KEY': import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    'SUPABASE_URL': import.meta.env.VITE_SUPABASE_URL,
    'SUPABASE_KEY': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'NODE_ENV': import.meta.env.MODE,
    'DEV': import.meta.env.DEV,
    'PROD': import.meta.env.PROD
  }

  const getKeyStatus = (key, value) => {
    if (!value) return '❌ Missing'
    if (value.includes('REPLACE_WITH') || value.includes('your_')) return '⚠️ Placeholder'
    if (key === 'CLERK_KEY') {
      if (value.startsWith('pk_test_')) return '🟡 Test Key'
      if (value.startsWith('pk_live_')) return '🟢 Live Key'
      return '❓ Unknown Format'
    }
    return '✅ Set'
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      background: 'white', 
      border: '2px solid #007bff', 
      padding: '30px', 
      borderRadius: '8px',
      minWidth: '400px',
      zIndex: 9999,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#007bff' }}>🔍 Environment Debug</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>🌍 Current Environment:</strong>
        <p style={{ margin: '5px 0', fontSize: '14px' }}>
          Mode: {import.meta.env.MODE} | Dev: {import.meta.env.DEV ? 'Yes' : 'No'} | Prod: {import.meta.env.PROD ? 'Yes' : 'No'}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <strong>🔑 Environment Variables Status:</strong>
        {Object.entries(envVars).map(([key, value]) => (
          <div key={key} style={{ 
            margin: '8px 0', 
            padding: '8px', 
            background: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            <strong>{key}:</strong> {getKeyStatus(key, value)}
            {showDetails && (
              <div style={{ 
                marginTop: '5px', 
                fontSize: '11px', 
                color: '#666',
                wordBreak: 'break-all',
                maxHeight: '50px',
                overflow: 'auto'
              }}>
                {value ? (key === 'CLERK_KEY' ? value.slice(0, 20) + '...' : value) : 'undefined'}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          style={{ 
            padding: '8px 16px', 
            background: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>

        <button 
          onClick={() => {
            console.clear()
            console.log('🔍 ENV DEBUG:')
            Object.entries(envVars).forEach(([key, value]) => {
              console.log(`${key}:`, value ? '✅ Set' : '❌ Missing')
              if (value && showDetails) console.log(`  Value:`, value)
            })
          }}
          style={{ 
            padding: '8px 16px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          📋 Log to Console
        </button>
      </div>

      <div style={{ 
        padding: '15px', 
        background: '#fff3cd', 
        borderRadius: '4px',
        fontSize: '13px'
      }}>
        <strong>🚨 Clerk Loading Issues:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>If Clerk key is missing/placeholder → Fix Vercel env vars</li>
          <li>If using Test key on production → Need Production key</li>
          <li>If key format is wrong → Check Clerk dashboard</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px' }}>
        <strong>🔗 Quick Links:</strong>
        <div style={{ marginTop: '10px' }}>
          <a 
            href="https://dashboard.clerk.com/last-active" 
            target="_blank"
            style={{ 
              display: 'inline-block',
              margin: '5px 10px 5px 0',
              padding: '8px 12px',
              background: '#28a745',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            🔑 Clerk Dashboard
          </a>
          <a 
            href={`https://vercel.com/${window.location.hostname.includes('vercel') ? window.location.hostname.split('.')[0] : 'your-project'}/settings/environment-variables`}
            target="_blank"
            style={{ 
              display: 'inline-block',
              margin: '5px 0',
              padding: '8px 12px',
              background: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            ⚙️ Vercel Env Vars
          </a>
        </div>
      </div>
    </div>
  )
}