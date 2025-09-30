// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to fetch market vs official data
export async function fetchMarketVsOfficial() {
  try {
    const { data, error } = await supabase
      .from('market_vs_official')
      .select('*')
    
    return { data, error }
  } catch (err) {
    console.error('Error fetching market vs official data:', err)
    return { data: null, error: err }
  }
}

// Function to fetch district price comparison data
export async function fetchDistrictComparison() {
  try {
    const { data, error } = await supabase
      .from('district_price_comparison')
      .select('*')
    
    return { data, error }
  } catch (err) {
    console.error('Error fetching district comparison data:', err)
    return { data: null, error: err }
  }
}

// Function to fetch market price trends
export async function fetchMarketPriceTrends() {
  try {
    const { data, error } = await supabase
      .from('market_price_trends')
      .select('*')
      .order('trend_month', { ascending: true })
    
    return { data, error }
  } catch (err) {
    console.error('Error fetching market price trends:', err)
    return { data: null, error: err }
  }
}

// Function to fetch NSO housing price index
export async function fetchHousingPriceIndex() {
  try {
    const { data, error } = await supabase
      .from('nso_housing_price_index')
      .select('*')
      .order('index_month', { ascending: true })
    
    return { data, error }
  } catch (err) {
    console.error('Error fetching housing price index:', err)
    return { data: null, error: err }
  }
}

// Function to fetch listing volume
export async function fetchListingVolume() {
  try {
    const { data, error } = await supabase
      .from('listing_volume')
      .select('*')
      .order('volume_month', { ascending: true })
    
    return { data, error }
  } catch (err) {
    console.error('Error fetching listing volume:', err)
    return { data: null, error: err }
  }
}

// Function to fetch NSO price trends
export async function fetchNsoPriceTrends() {
  try {
    const { data, error } = await supabase
      .from('nso_price_trends')
      .select('*')
      .order('trend_month', { ascending: true })
    
    return { data, error }
  } catch (err) {
    console.error('Error fetching NSO price trends:', err)
    return { data: null, error: err }
  }
}

// Function to fetch market listings normalized
export async function fetchMarketListingsNormalized() {
  try {
    const { data, error } = await supabase
      .from('market_listings_normalized')
      .select('*')
      .limit(100) // Limit to avoid fetching too much data
    
    return { data, error }
  } catch (err) {
    console.error('Error fetching market listings:', err)
    return { data: null, error: err }
  }
}

// Function to fetch NSO data normalized
export async function fetchNsoDataNormalized() {
  try {
    const { data, error } = await supabase
      .from('nso_data_normalized')
      .select('*')
      .limit(100) // Limit to avoid fetching too much data
    
    return { data, error }
  } catch (err) {
    console.error('Error fetching NSO data:', err)
    return { data: null, error: err }
  }
}
