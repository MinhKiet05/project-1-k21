import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * 👥 Hook để quản lý users từ Supabase
 */
export function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Lấy danh sách users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Cập nhật role user (roles là array)
  const updateUserRole = async (userId, newRole) => {
    try {
      // Update với array format
      const roleArray = [newRole]
      const { error } = await supabase
        .from('profiles')
        .update({ roles: roleArray })
        .eq('id', userId)

      if (error) throw error
      
      // Cập nhật local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, roles: roleArray } : user
      ))
      
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole
  }
}