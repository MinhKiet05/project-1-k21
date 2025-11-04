import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook để lấy danh sách categories từ Supabase
 */
export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      setCategories(data || [])
    } catch (err) {
      setError(err.message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}