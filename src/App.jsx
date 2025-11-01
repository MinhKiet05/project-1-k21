import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Header from './components/header/Header.jsx'
import Footer from './components/footer/Footer.jsx'  
import HomePage from './pages/homePage/HomePage.jsx'
import UploadPost from './pages/uploadPost/UploadPost.jsx'
import Management from './pages/management/Management.jsx'
import AboutUs from './pages/aboutUs/AboutUs.jsx'
import { useUser } from '@clerk/clerk-react'

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/post" element={<UploadPost />} />
            <Route path="/management" element={<Management />} />
            <Route path="/about" element={<AboutUs />} />
          </Routes>
        </div>
        
        <Footer />
      </div>
    </Router>
  )
}