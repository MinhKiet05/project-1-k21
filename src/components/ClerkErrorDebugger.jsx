import { useUser, useAuth, useClerk } from '@clerk/clerk-react'
import { useState, useEffect } from 'react'

export default function ClerkErrorDebugger() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { getToken } = useAuth()
  const clerk = useClerk()
  const [authError, setAuthError] = useState(null)
  const [tokenTest, setTokenTest] = useState(null)

  // Test token generation
  useEffect(() => {
    if (isSignedIn) {
      getToken()
        .then(token => {
          setTokenTest('✅ Token generated successfully')
          console.log('Token test successful')
        })
        .catch(error => {
          setTokenTest(`❌ Token error: ${error.message}`)
          setAuthError(error)
          console.error('Token generation failed:', error)
        })
    }
  }, [isSignedIn, getToken])

  // Listen for Clerk errors - removed problematic addListener

  if (!isLoaded) {
    return (
      <div style={{ padding: '15px', background: '#fff3cd', borderRadius: '8px', marginTop: '10px' }}>
        <h4>🔄 Clerk Loading...</h4>
        <p>Waiting for Clerk to initialize...</p>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '15px', 
      background: isSignedIn ? '#d4edda' : '#f8d7da', 
      borderRadius: '8px', 
      marginTop: '10px',
      fontSize: '13px'
    }}>
      <h4>🔐 Clerk Authentication Status</h4>
      
      <div style={{ marginBottom: '15px' }}>
        <strong>Basic Status:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Loaded: {isLoaded ? '✅' : '❌'}</li>
          <li>Signed In: {isSignedIn ? '✅' : '❌'}</li>
          <li>User ID: {user?.id || 'N/A'}</li>
          <li>Email: {user?.emailAddresses?.[0]?.emailAddress || 'N/A'}</li>
        </ul>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <strong>Environment:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Domain: <code>{window.location.hostname}</code></li>
          <li>URL: <code>{window.location.href}</code></li>
          <li>Protocol: <code>{window.location.protocol}</code></li>
        </ul>
      </div>

      {tokenTest && (
        <div style={{ marginBottom: '15px' }}>
          <strong>Token Test:</strong>
          <p style={{ margin: '5px 0', color: tokenTest.includes('✅') ? 'green' : 'red' }}>
            {tokenTest}
          </p>
        </div>
      )}

      {authError && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          background: '#721c24', 
          color: '#f8d7da',
          borderRadius: '4px' 
        }}>
          <strong>❌ Authentication Error:</strong>
          <pre style={{ 
            margin: '5px 0', 
            fontSize: '11px', 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {JSON.stringify(authError, null, 2)}
          </pre>
        </div>
      )}

      {!isSignedIn && (
        <div style={{ 
          padding: '10px', 
          background: '#856404', 
          color: '#fff3cd',
          borderRadius: '4px',
          marginTop: '10px'
        }}>
          <strong>⚠️ Troubleshooting Steps:</strong>
          <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>Check that <code>project-1-k21.vercel.app</code> is in Clerk Domains</li>
            <li>Check CORS settings in Clerk Dashboard</li>
            <li>Verify redirect URLs are set to <code>/</code></li>
            <li>Wait 2-3 minutes after adding domain</li>
            <li>Try incognito/private browsing mode</li>
          </ol>
        </div>
      )}

      <div style={{ marginTop: '15px', fontSize: '11px', color: '#666' }}>
        <strong>Quick Actions:</strong>
        <div style={{ marginTop: '5px' }}>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
              marginRight: '10px', 
              padding: '5px 10px', 
              background: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            🔄 Reload Page
          </button>
          <button 
            onClick={() => {
              console.clear()
              console.log('🔍 Clerk Debug Info:')
              console.log('isLoaded:', isLoaded)
              console.log('isSignedIn:', isSignedIn)
              console.log('user:', user)
              console.log('clerk instance:', clerk)
              console.log('authError:', authError)
            }}
            style={{ 
              padding: '5px 10px', 
              background: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            📋 Log Debug Info
          </button>
        </div>
      </div>
    </div>
  )
}