import { useState, useEffect } from 'react'
import { SignedIn, useUser } from '@clerk/clerk-react'
import { locationService, categoryService, postService } from '../../lib/database.js'
import CardProduct from '../../components/cardProduct/CardProduct.jsx'
import './HomePage.css'
function WelcomeSection() {
  return (
    <section style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '60px 20px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', margin: '0 0 20px 0', fontWeight: 'bold' }}>
          🏪 NoTungPhoCo Marketplace
        </h1>
        <CardProduct product={{
          image: 'https://via.placeholder.com/150',
          name: 'Sách giáo trình',
          description: 'Sách giáo trình lập trình React',
          price: 150000
        }} />
        <p style={{ fontSize: '1.2rem', margin: '0 0 30px 0', opacity: 0.9 }}>
          Nền tảng mua bán dành riêng cho sinh viên
        </p>
        <p style={{ fontSize: '1rem', margin: '0 0 40px 0', opacity: 0.8 }}>
          Tìm kiếm sách giáo trình, đồ điện tử, quần áo và nhiều thứ khác với giá sinh viên
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid white',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}>
            🔍 Tìm kiếm sản phẩm
          </button>
          <button style={{
            background: 'white',
            border: 'none',
            color: '#667eea',
            padding: '15px 30px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            📝 Đăng bài bán hàng
          </button>
        </div>
      </div>
    </section>
  )
}

function StatsSection() {
  const [stats, setStats] = useState({
    users: 0,
    posts: 0,
    categories: 0,
    locations: 0
  })

  useEffect(() => {
    // Simulate loading stats
    const timer = setTimeout(() => {
      setStats({
        users: 1250,
        posts: 890,
        categories: 11,
        locations: 10
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section style={{ padding: '50px 20px', background: '#f8f9fa' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 40px 0' }}>📊 Thống kê</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '30px'
        }}>
          <div style={{ padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👥</div>
            <h3 style={{ fontSize: '2rem', margin: '0', color: '#007bff' }}>{stats.users}</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Người dùng</p>
          </div>
          
          <div style={{ padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📦</div>
            <h3 style={{ fontSize: '2rem', margin: '0', color: '#28a745' }}>{stats.posts}</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Sản phẩm</p>
          </div>
          
          <div style={{ padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📂</div>
            <h3 style={{ fontSize: '2rem', margin: '0', color: '#ffc107' }}>{stats.categories}</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Danh mục</p>
          </div>
          
          <div style={{ padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📍</div>
            <h3 style={{ fontSize: '2rem', margin: '0', color: '#dc3545' }}>{stats.locations}</h3>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Khu vực</p>
          </div>
        </div>
      </div>
    </section>
  )
}

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

  if (!user) return null
  if (loading) return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <div>🔄 Testing database connection...</div>
    </div>
  )
  if (error) return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
      <div>❌ Database Error: {error}</div>
    </div>
  )

  return (
    <section style={{ padding: '50px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          padding: '30px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          background: 'white'
        }}>
          <h3 style={{ margin: '0 0 20px 0' }}>🗄️ Database Connection Test</h3>
          <p style={{ color: 'green', margin: '0 0 20px 0' }}>✅ Connected to Supabase successfully!</p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px' 
          }}>
            <div>
              <h4 style={{ margin: '0 0 10px 0' }}>📍 Locations ({locations.length})</h4>
              <ul style={{ fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
                {locations.map(loc => <li key={loc.id}>{loc.name}</li>)}
                {locations.length === 0 && <li>No locations yet</li>}
              </ul>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 10px 0' }}>📂 Categories ({categories.length})</h4>
              <ul style={{ fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
                {categories.map(cat => <li key={cat.id}>{cat.name}</li>)}
                {categories.length === 0 && <li>No categories yet</li>}
              </ul>
            </div>
            
            <div>
              <h4 style={{ margin: '0 0 10px 0' }}>📦 Posts ({posts.length})</h4>
              <ul style={{ fontSize: '14px', margin: 0, paddingLeft: '20px' }}>
                {posts.map(post => <li key={post.id}>{post.title}</li>)}
                {posts.length === 0 && <li>No posts yet</li>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  return (
    <main style={{ minHeight: 'calc(100vh - 200px)' }}>
      <WelcomeSection />
      <StatsSection />
      
      <SignedIn>
        <DatabaseTest />
      </SignedIn>
    </main>
  )
}