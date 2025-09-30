// src/App.jsx
import { useState, useEffect } from 'react'
import { fetchMarketVsOfficial, testConnection } from './supabaseClient'
import './App.css'

function App() {
  const [marketData, setMarketData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState(null)

  // Test connection on load
  useEffect(() => {
    async function checkConnection() {
      const result = await testConnection()
      setConnectionStatus(result)
    }
    checkConnection()
  }, [])

  // Fetch data on load
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const { data, error } = await fetchMarketVsOfficial()

      if (error) {
        setError(`Error fetching data: ${error.message}`)
        setLoading(false)
        return
      }

      console.log('Fetched market_vs_official rows:', data) // ✅ debug
      setMarketData(data || [])
      setLoading(false)
    }
    loadData()
  }, [])

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    })
  }

  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MNT',
      maximumFractionDigits: 0
    }).format(value)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Phase 5C: Data Pipeline Test</h1>

      {/* Connection Status */}
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
        {connectionStatus === null ? (
          <p>Checking connection...</p>
        ) : connectionStatus.connected ? (
          <p className="text-green-600">✅ Connected to Supabase successfully!</p>
        ) : (
          <p className="text-red-600">
            ❌ Connection failed: {connectionStatus.error?.message || 'Unknown error'}
          </p>
        )}
      </div>

      {/* Data Display */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Market vs Official Data (5 rows):</h2>

        {loading ? (
          <p>Loading data...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : marketData.length === 0 ? (
          <p>No data found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 border">District</th>
                  <th className="py-2 px-4 border">Market Month</th>
                  <th className="py-2 px-4 border">NSO Month</th>
                  <th className="py-2 px-4 border">Market Median</th>
                  <th className="py-2 px-4 border">NSO Avg</th>
                  <th className="py-2 px-4 border">Price Gap %</th>
                  <th className="py-2 px-4 border">Listings</th>
                </tr>
              </thead>
              <tbody>
                {marketData.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="py-2 px-4 border">{row.district || 'N/A'}</td>
                    <td className="py-2 px-4 border">{formatDate(row.market_month)}</td>
                    <td className="py-2 px-4 border">{formatDate(row.nso_month)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(row.market_median)}</td>
                    <td className="py-2 px-4 border">{formatCurrency(row.nso_avg)}</td>
                    <td className="py-2 px-4 border">
                      {row.price_gap_percent !== null
                        ? `${row.price_gap_percent}%`
                        : 'N/A'}
                    </td>
                    <td className="py-2 px-4 border">{row.listing_count || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raw Data for Debugging */}
      <div className="mt-8">
        <h3 className="text-md font-semibold mb-2">Raw Data (for debugging):</h3>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 text-xs">
          {JSON.stringify(marketData, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default App
