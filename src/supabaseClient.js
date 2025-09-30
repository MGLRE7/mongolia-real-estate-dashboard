// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// ✅ Environment variables (must be set in Netlify with VITE_ prefix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials are missing. Check your Netlify environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ✅ Test connection
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('market_vs_official') // 👈 lowercase, matches your SQL view
      .select('district')
      .limit(1)

    if (error) {
      console.error('❌ Supabase connection test failed:', error)
      return { connected: false, error }
    }

    console.log('✅ Supabase connection test succeeded:', data)
    return { connected: true }
  } catch (err) {
    console.error('❌ Unexpected error testing Supabase connection:', err)
    return { connected: false, error: err }
  }
}

// ✅ Fetch 5 rows from market_vs_official
export async function fetchMarketVsOfficial() {
  try {
    const { data, error } = await supabase
      .from('market_vs_official') // 👈 lowercase, correct name
      .select('*')
      .limit(5)

    if (error) {
      console.error('❌ Error fetching market_vs_official:', error)
      return { data: null, error }
    }

    console.log('✅ Data fetched from market_vs_official:', data)
    return { data, error: null }
  } catch (err) {
    console.error('❌ Unexpected error fetching data:', err)
    return { data: null, error: err }
  }
}
