import '../dashboard/DashboardLayout.css'
import { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch } from "@fortawesome/free-solid-svg-icons"
import { useUsers } from '../../hooks/useUsers'
import EditRoleModal from '../../components/EditRoleModal/EditRoleModal'
import { useUserRole } from '../../contexts/UserRoleContext'
import { useTranslation } from 'react-i18next'

export default function DashboardUsers() {
  const { t } = useTranslation(['dashboard', 'common']);
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
    if (!Array.isArray(roles)) return t('users.userRole')
    
    if (roles.includes('super_admin')) return t('users.superAdmin')
    if (roles.includes('admin')) return t('users.admin')
    if (roles.includes('user')) return t('users.userRole')
    return t('users.userRole')
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
      <h2 className="page-title">{t('users.title')}</h2>
      
      {/* Search */}
      <div className="search-section">
        <div className="search-box-admin">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input 
            type="text" 
            placeholder={t('users.searchPlaceholder')} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="search-result">
          {t('users.found')} {filteredUsers.length} {t('users.users')}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <p>{t('common:loading')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p>{t('common:error')}: {error}</p>
        </div>
      )}

      {/* User Table */}
      {!loading && !error && (
        <div className="user-table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>{t('common:email')}</th>
                <th>{t('users.displayName')}</th>
                <th>{t('users.role')}</th>
                <th>{t('users.createdDate')}</th>
                <th>{t('users.actions')}</th>
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
                      {user.full_name || t('users.noName')}
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
                        {t('common:edit')}
                      </button>
                    ) : (
                      <span className="no-permission">
                        {user.roles?.includes('super_admin') ? t('users.cannotEditSuperAdmin') : t('users.noPermission')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                    {t('users.noUsersFound')}
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