import { useState } from 'react'
import { useUser, useSignIn, useSignUp } from '@clerk/clerk-react'

export default function CustomAuth() {
  const { isLoaded, isSignedIn, user } = useUser()
  const { signIn, setActive } = useSignIn()
  const { signUp, setActive: setActiveSignUp } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('signin') // 'signin' or 'signup'

  if (!isLoaded) {
    return <div>🔄 Loading authentication...</div>
  }

  if (isSignedIn) {
    return (
      <div style={{ 
        padding: '15px', 
        background: '#d4edda', 
        borderRadius: '8px',
        marginTop: '10px'
      }}>
        <h4>✅ Đăng nhập thành công!</h4>
        <p><strong>Email:</strong> {user.emailAddresses[0]?.emailAddress}</p>
        <p><strong>ID:</strong> {user.id}</p>
        <button 
          onClick={() => {
            // Simple sign out without redirect
            window.location.reload()
          }}
          style={{ 
            padding: '8px 15px', 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🚪 Đăng xuất
        </button>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSigningIn(true)
    setError('')

    try {
      if (mode === 'signin') {
        // Sign in
        const result = await signIn.create({
          identifier: email,
          password: password,
        })

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          window.location.reload() // Simple refresh instead of redirect
        }
      } else {
        // Sign up
        const result = await signUp.create({
          emailAddress: email,
          password: password,
        })

        // Send verification email
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        
        // For simplicity, complete immediately (in real app, ask for verification code)
        if (result.status === 'missing_requirements') {
          // Handle email verification here
          alert('Please check your email for verification code')
        }
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError(err.errors?.[0]?.message || err.message || 'Authentication failed')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f8f9fa', 
      borderRadius: '8px',
      marginTop: '20px',
      maxWidth: '400px',
      margin: '20px auto'
    }}>
      <h3>🔐 {mode === 'signin' ? 'Đăng nhập' : 'Đăng ký'}</h3>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '15px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ 
              width: '100%', 
              padding: '8px', 
              borderRadius: '4px', 
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{ 
            padding: '10px', 
            background: '#f8d7da', 
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            ❌ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSigningIn}
          style={{ 
            width: '100%', 
            padding: '10px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isSigningIn ? 'not-allowed' : 'pointer',
            opacity: isSigningIn ? 0.6 : 1
          }}
        >
          {isSigningIn ? '🔄 Đang xử lý...' : (mode === 'signin' ? '🔐 Đăng nhập' : '📝 Đăng ký')}
        </button>
      </form>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#007bff', 
            textDecoration: 'underline',
            cursor: 'pointer'
          }}
        >
          {mode === 'signin' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </div>

      <div style={{ 
        marginTop: '15px', 
        fontSize: '12px', 
        color: '#666',
        textAlign: 'center'
      }}>
        💡 Custom auth flow để bypass redirect issues
      </div>
    </div>
  )
}