import { createContext, useContext, useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useSupabase } from '../hooks/useSupabase'

const UserRoleContext = createContext()

export function UserRoleProvider({ children }) {
  const { user, isLoaded } = useUser()
  const { supabaseClient, isReady: isSupabaseReady, error: supabaseError } = useSupabase()
  const [userRole, setUserRole] = useState(null)
  const [isLoadingRole, setIsLoadingRole] = useState(true)
  const [roleError, setRoleError] = useState(null)

  useEffect(() => {
    if (!isLoaded || !isSupabaseReady) {
      setIsLoadingRole(true)
      return
    }

    if (!user) {
      setUserRole(null)
      setIsLoadingRole(false)
      setRoleError(null)
      return
    }

    if (supabaseError) {
      setUserRole('user')
      setIsLoadingRole(false)
      setRoleError(supabaseError)
      return
    }

    const fetchUserRole = async () => {
      try {
        setIsLoadingRole(true)
        setRoleError(null)
        
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('roles')
          .eq('id', user.id)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            await createDefaultProfile(user.id)
            setUserRole('user')
          } else {
            setUserRole('user')
            setRoleError(error.message)
          }
        } else {
          const rolesArray = data?.roles || ['user']
          
          if (rolesArray.includes('super_admin')) {
            setUserRole('super_admin')
          } else if (rolesArray.includes('admin')) {
            setUserRole('admin')  
          } else {
            setUserRole('user')
          }
        }
      } catch (err) {
        setUserRole('user')
        setRoleError(err.message)
      } finally {
        setIsLoadingRole(false)
      }
    }

    const createDefaultProfile = async (userId) => {
      try {
        await supabaseClient
          .from('profiles')
          .insert({ id: userId, roles: ['user'] })
      } catch {
        // Profile creation failed
      }
    }

    fetchUserRole()
  }, [user, isLoaded, supabaseClient, isSupabaseReady, supabaseError])

  const isAdmin = () => userRole === 'admin' || userRole === 'super_admin'
  const isSuperAdmin = () => userRole === 'super_admin'
  const canModerateContent = () => userRole === 'admin' || userRole === 'super_admin'
  const canEditRoles = () => userRole === 'super_admin'
  
  // Kiểm tra có thể chỉnh sửa role của user cụ thể không
  const canEditUserRole = (targetUserRoles) => {
    if (userRole !== 'super_admin') return false // Chỉ super_admin mới có quyền
    
    // Super_admin không thể chỉnh sửa role của super_admin khác (ngang hàng)
    if (Array.isArray(targetUserRoles) && targetUserRoles.includes('super_admin')) {
      return false
    }
    
    return true
  }
  
  // Lấy các role option được phép cấp
  const getAvailableRoles = () => {
    if (userRole === 'super_admin') {
      return [
        { value: 'user', label: 'User' },
        { value: 'admin', label: 'Admin' },
        // Super admin không thể cấp super_admin cho người khác
      ]
    }
    return [] // Chỉ super_admin mới được cấp role
  }

  const value = {
    userRole,
    isLoadingRole,
    roleError,
    isAdmin,
    isSuperAdmin,
    canModerateContent,
    canEditRoles,
    canEditUserRole,
    getAvailableRoles,
    // Expose authenticated Supabase client để các component khác có thể sử dụng
    supabaseClient: isSupabaseReady ? supabaseClient : null,
    isSupabaseReady,
  }

  return (
    <UserRoleContext.Provider value={value}>
      {children}
    </UserRoleContext.Provider>
  )
}

export function useUserRole() {
  const context = useContext(UserRoleContext)
  if (!context) {
    throw new Error('useUserRole must be used within a UserRoleProvider')
  }
  return context
}