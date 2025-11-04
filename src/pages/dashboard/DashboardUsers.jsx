import '../dashboard/DashboardLayout.css'
import { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { useUsers } from '../../hooks/useUsers'
import EditRoleModal from '../../components/EditRoleModal/EditRoleModal'
import { useUserRole } from '../../contexts/UserRoleContext'

export default function DashboardUsers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Hook để lấy dữ liệu users từ Supabase và role permissions
  const { users, loading, error, updateUserRole } = useUsers()
  const { canEditUserRole } = useUserRole()

  // Lọc users theo search term
  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle edit user role
  const handleEditUser = (user) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingUser(null)
    setIsModalOpen(false)
  }

  const handleUpdateRole = async (userId, newRole) => {
    const result = await updateUserRole(userId, newRole)
    return result
  }

  // Format role display (roles là array)
  const getRoleDisplay = (roles) => {
    if (!Array.isArray(roles)) return 'User'
    
    if (roles.includes('super_admin')) return 'Super Admin'
    if (roles.includes('admin')) return 'Admin'
    if (roles.includes('user')) return 'User'
    return 'User'
  }

  // Get role badge class (roles là array)
  const getRoleBadgeClass = (roles) => {
    if (!Array.isArray(roles)) return 'user'
    
    if (roles.includes('super_admin')) return 'super-admin'
    if (roles.includes('admin')) return 'admin'
    if (roles.includes('user')) return 'user'
    return 'user'
  }

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <div className="users-management">
      <h2 className="page-title">Quản lý người dùng</h2>
      
      {/* Search */}
      <div className="search-section">
        <div className="search-box-admin">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên hoặc email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="search-result">
          Tìm thấy {filteredUsers.length} người dùng
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>Lỗi: {error}</p>
        </div>
      )}

      {/* User Table */}
      {!loading && !error && (
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Tên hiển thị</th>
                <th>Vai trò</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td className="name-cell">
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <img 
                        src={user.avatar_url || 'https://via.placeholder.com/40'} 
                        alt="User" 
                        className="user-avatar"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/40'
                        }}
                      />
                      {user.full_name || 'Chưa có tên'}
                    </div>
                  </td>
                  <td>
                    <span className={`user-role-badge ${getRoleBadgeClass(user.roles)}`}>
                      {getRoleDisplay(user.roles)}
                    </span>
                  </td>
                  <td className="date-cell">
                    {formatDate(user.created_at)}
                  </td>
                  <td>
                    {canEditUserRole(user.roles) ? (
                      <button 
                        className="user-action-btn"
                        onClick={() => handleEditUser(user)}
                      >
                        Sửa
                      </button>
                    ) : (
                      <span className="no-permission">
                        {user.roles?.includes('super_admin') ? 'Không thể sửa Super Admin' : 'Không có quyền'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Role Modal */}
      <EditRoleModal
        user={editingUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdateRole={handleUpdateRole}
      />
    </div>
  )
}