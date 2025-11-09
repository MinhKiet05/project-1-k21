import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

/**
 * Hook để lấy danh sách locations từ Supabase với hỗ trợ đa ngôn ngữ
 */
export function useLocations() {
  const { i18n } = useTranslation()
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLocations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('locations')
        .select('id, name, name_en, slug')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      
      // Map dữ liệu để hiển thị theo ngôn ngữ hiện tại
      const mappedData = (data || []).map(location => ({
        ...location,
        displayName: (i18n.language === 'en' && location.name_en) ? location.name_en : (location.name || 'Unknown')
      }))
      
      setLocations(mappedData)
    } catch (err) {
      setError(err.message)
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [i18n.language]) // Refetch khi đổi ngôn ngữ

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations
  }
}