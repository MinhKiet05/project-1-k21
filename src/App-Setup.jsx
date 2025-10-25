import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function SetupInstructions() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>🚀 Setup Required - NoTungPhoCo Marketplace</h1>
      
      <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>⚠️ Environment Variables Missing</h3>
        <p>Bạn cần cập nhật <code>.env.local</code> với API keys thật để ứng dụng hoạt động.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>🔐 Step 1: Clerk Setup</h3>
          <ol>
            <li>Tạo tài khoản tại <a href="https://clerk.com" target="_blank">clerk.com</a></li>
            <li>Tạo application mới</li>
            <li>Vào <strong>API Keys</strong> trong dashboard</li>
            <li>Copy <strong>"Publishable key"</strong> (pk_test_...)</li>
            <li>Thay thế <code>VITE_CLERK_PUBLISHABLE_KEY</code> trong <code>.env.local</code></li>
          </ol>
          <a 
            href="https://dashboard.clerk.com" 
            target="_blank" 
            style={{ 
              display: 'inline-block', 
              background: '#4F46E5', 
              color: 'white', 
              padding: '10px 20px', 
              borderRadius: '6px', 
              textDecoration: 'none',
              marginTop: '10px'
            }}
          >
            🚀 Open Clerk Dashboard
          </a>
        </div>

        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>🗄️ Step 2: Supabase Setup</h3>
          <ol>
            <li>Database đã tồn tại tại: <code>enrolgmhppztsryvhijp.supabase.co</code></li>
            <li>Vào <strong>Project Settings → API</strong></li>
            <li>Copy <strong>"anon public"</strong> key (JWT token dài)</li>
            <li>Thay thế <code>VITE_SUPABASE_ANON_KEY</code> trong <code>.env.local</code></li>
            <li>Chạy SQL migrations nếu chưa có</li>
          </ol>
          <a 
            href="https://app.supabase.com/project/enrolgmhppztsryvhijp/settings/api" 
            target="_blank" 
            style={{ 
              display: 'inline-block', 
              background: '#10B981', 
              color: 'white', 
              padding: '10px 20px', 
              borderRadius: '6px', 
              textDecoration: 'none',
              marginTop: '10px'
            }}
          >
            🗄️ Open Supabase Settings
          </a>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>📝 Example .env.local file:</h3>
        <pre style={{ background: '#2d3748', color: '#e2e8f0', padding: '15px', borderRadius: '6px', overflow: 'auto' }}>
{`# Clerk
VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuaW5zcGlyZWQua2F5YWs...

# Supabase  
VITE_SUPABASE_URL=https://enrolgmhppztsryvhijp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
        </pre>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#d1ecf1', borderRadius: '8px' }}>
        <h3>🔄 After updating .env.local:</h3>
        <ol>
          <li>Dừng dev server (Ctrl+C trong terminal)</li>
          <li>Chạy lại: <code>npm run dev</code></li>
          <li>Refresh trang này</li>
        </ol>
      </div>
    </div>
  )
}

export default function App() {
  return <SetupInstructions />
}