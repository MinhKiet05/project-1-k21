import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react'
import ProfileSync from './components/profileSync/ProfileSync.jsx'
import DebugPanel from './components/DebugPanel.jsx'
import { locationService, categoryService, postService } from './lib/database.js'

function DatabaseTest() {
  const { user } = useUser()
  const [locations, setLocations] = useState([])
  const [categories, setCategories] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function testDatabase() {
      try {
        console.log('🔄 Testing database connection...')
        
        const [locationsData, categoriesData, postsData] = await Promise.all([
          locationService.getLocations(),
          categoryService.getCategories(), 
          postService.getPosts({ limit: 5 })
        ])

        setLocations(locationsData)
        setCategories(categoriesData)
        setPosts(postsData)
        
        console.log('✅ Database test successful')
      } catch (err) {
        console.error('❌ Database test failed:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      testDatabase()
    }
  }, [user])

  if (!user) return <div>Please sign in to test database connection</div>
  if (loading) return <div>🔄 Testing database connection...</div>
  if (error) return <div>❌ Database Error: {error}</div>

  return (
    <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h3>🗄️ Database Connection Test</h3>
      <p>✅ Connected to Supabase successfully!</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
        <div>
          <strong>Locations ({locations.length})</strong>
          <ul style={{ fontSize: '12px' }}>
            {locations.map(loc => <li key={loc.id}>{loc.name}</li>)}
            {locations.length === 0 && <li>No locations yet</li>}
          </ul>
        </div>
        <div>
          <strong>Categories ({categories.length})</strong>
          <ul style={{ fontSize: '12px' }}>
            {categories.map(cat => <li key={cat.id}>{cat.name}</li>)}
            {categories.length === 0 && <li>No categories yet</li>}
          </ul>
        </div>
        <div>
          <strong>Posts ({posts.length})</strong>
          <ul style={{ fontSize: '12px' }}>
            {posts.map(post => <li key={post.id}>{post.title}</li>)}
            {posts.length === 0 && <li>No posts yet</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <ProfileSync>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
        <h2>🏪 NoTungPhoCo Marketplace</h2>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>
      
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + Supabase + Clerk</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      
      <SignedIn>
        <DatabaseTest />
      </SignedIn>
      
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      
      <DebugPanel />
    </ProfileSync>
  )
}
