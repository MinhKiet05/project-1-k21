import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import './Header.css'
export default function Header() {
  return (
    <header style={{
      background: 'white',
      borderBottom: '1px solid #e0e0e0',
      padding: '10px 20px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '1.5rem',
            color: '#333'
          }}>
             NoTungPhoCo Marketplace
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                 Đăng nhập
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  )
}
