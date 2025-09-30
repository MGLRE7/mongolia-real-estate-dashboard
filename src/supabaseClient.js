// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test function to fetch 5 rows from market_vs_official
export async function fetchMarketVsOfficial() {
  try {
    const { data, error } = await supabase
      .from('market_vs_official')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('Error fetching data:', error)
      return { data: null, error }
    }
    
    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err }
  }
}

// Test function to check connection
export async function testConnection() {
  try {
    // Simple query to test connection
    const { data, error } = await supabase
      .from('market_vs_official')
      .select('count()', { count: 'exact', head: true })
    
    if (error) {
      return { connected: false, error }
    }
    
    return { connected: true, count: data, error: null }
  } catch (err) {
    return { connected: false, error: err }
  }
}
