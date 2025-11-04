import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook để lấy danh sách locations từ Supabase
 */
export function useLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLocations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('locations')
        .select('id, name, slug')
        .order('name', { ascending: true })

      if (fetchError) throw fetchError
      setLocations(data || [])
    } catch (err) {
      setError(err.message)
      setLocations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations
  }
}