import './DashboardLayout.css'
import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUsers, faFileAlt } from "@fortawesome/free-solid-svg-icons"

export default function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isUsersActive = location.pathname === '/dashboard/users'
  const isPostsActive = location.pathname === '/dashboard/posts'

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-title">
          <h2>Dashboard</h2>
        </div>
        
        <div className="sidebar-menu">
          <div 
            className={`menu-item ${isUsersActive ? 'active' : ''}`}
            onClick={() => navigate('/dashboard/users')}
          >
            <FontAwesomeIcon icon={faUsers} />
            <span>Người dùng</span>
          </div>
          <div 
            className={`menu-item ${isPostsActive ? 'active' : ''}`}
            onClick={() => navigate('/dashboard/posts')}
          >
            <FontAwesomeIcon icon={faFileAlt} />
            <span>Bài đăng</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  )
}