import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

/**
 * Hook để lấy danh sách categories từ Supabase với hỗ trợ đa ngôn ngữ
 */
export function useCategories() {
  const { i18n } = useTranslation()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('id, name, name_en, slug')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      
      // Map dữ liệu để hiển thị theo ngôn ngữ hiện tại
      const mappedData = (data || []).map(category => ({
        ...category,
        displayName: (i18n.language === 'en' && category.name_en) ? category.name_en : (category.name || 'Unknown')
      }))
      
      setCategories(mappedData)
    } catch (err) {
      setError(err.message)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [i18n.language]) // Refetch khi đổi ngôn ngữ

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}