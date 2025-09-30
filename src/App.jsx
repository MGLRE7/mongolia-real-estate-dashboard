// src/App.jsx
import { useState, useEffect } from 'react'
import { 
  fetchMarketVsOfficial, 
  fetchDistrictComparison,
  fetchHousingPriceIndex,
  fetchListingVolume
} from './supabaseClient'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Home, BarChart3, Calendar, MapPin } from 'lucide-react'
import './App.css'

function App() {
  const [marketData, setMarketData] = useState([])
  const [housingIndex, setHousingIndex] = useState([])
  const [listingVolume, setListingVolume] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('comparison')
  const [currency, setCurrency] = useState('MNT')

  // Exchange rate (simplified)
  const exchangeRate = 3600; // 1 AUD = 3600 MNT

  // Fetch data on load
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Fetch market vs official data
        const { data: marketVsOfficialData, error: marketError } = await fetchMarketVsOfficial()
        if (marketError) throw marketError
        setMarketData(marketVsOfficialData || [])
        
        // Fetch housing price index
        const { data: indexData, error: indexError } = await fetchHousingPriceIndex()
        if (indexError) throw indexError
        setHousingIndex(indexData || [])
        
        // Fetch listing volume
        const { data: volumeData, error: volumeError } = await fetchListingVolume()
        if (volumeError) throw volumeError
        setListingVolume(volumeData || [])
        
        setLoading(false)
      } catch (err) {
        setError(`Error fetching data: ${err.message}`)
        setLoading(false)
      }
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
  const formatCurrency = (value, currency = 'MNT') => {
    if (value === null || value === undefined) return 'N/A'
    
    // Convert currency if needed
    const convertedValue = currency === 'AUD' ? value / exchangeRate : value
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(convertedValue)
  }

  // Calculate summary metrics
  const summaryMetrics = {
    marketMedian: marketData.reduce((sum, item) => item.market_median ? sum + 1 : sum, 0) > 0 ? 
      marketData.reduce((sum, item) => item.market_median ? sum + item.market_median : sum, 0) / 
      marketData.reduce((sum, item) => item.market_median ? sum + 1 : sum, 0) : 0,
    
    nsoAvg: marketData.reduce((sum, item) => item.nso_avg ? sum + 1 : sum, 0) > 0 ?
      marketData.reduce((sum, item) => item.nso_avg ? sum + item.nso_avg : sum, 0) / 
      marketData.reduce((sum, item) => item.nso_avg ? sum + 1 : sum, 0) : 0,
    
    avgPriceGap: marketData.reduce((sum, item) => item.price_gap_percent ? sum + 1 : sum, 0) > 0 ?
      marketData.reduce((sum, item) => item.price_gap_percent ? sum + item.price_gap_percent : sum, 0) / 
      marketData.reduce((sum, item) => item.price_gap_percent ? sum + 1 : sum, 0) : 0,
    
    totalListings: marketData.reduce((sum, item) => item.listing_count ? sum + item.listing_count : sum, 0),
    
    housingIndex: housingIndex.length > 0 ? 
      housingIndex[housingIndex.length - 1].housing_price_index / 10000 : 0
  }

  // Prepare data for district comparison chart
  const districtComparisonData = marketData.map(item => ({
    district: item.district,
    marketMedian: item.market_median ? (currency === 'AUD' ? item.market_median / exchangeRate : item.market_median) : 0,
    nsoAvg: item.nso_avg ? (currency === 'AUD' ? item.nso_avg / exchangeRate : item.nso_avg) : 0,
    priceGap: item.price_gap_percent || 0
  })).filter(item => item.marketMedian > 0 || item.nsoAvg > 0);

  // Prepare data for housing price index chart
  const housingIndexData = housingIndex.map(item => ({
    month: formatDate(item.index_month),
    index: item.housing_price_index / 10000
  }));

  // Prepare data for listing volume chart
  const volumeByDistrict = {};
  listingVolume.forEach(item => {
    if (!volumeByDistrict[item.district]) {
      volumeByDistrict[item.district] = 0;
    }
    volumeByDistrict[item.district] += item.total_listings;
  });
  
  const listingVolumeData = Object.keys(volumeByDistrict).map(district => ({
    district,
    listings: volumeByDistrict[district]
  }));

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mongolia Real Estate Dashboard</h1>
        <p className="text-gray-600">Market vs Official Data Analysis</p>
        
        {/* Currency Toggle */}
        <div className="mt-4 flex items-center">
          <span className="mr-2">Currency:</span>
          <div className="flex border rounded overflow-hidden">
            <button 
              className={`px-4 py-1 ${currency === 'MNT' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setCurrency('MNT')}
            >
              MNT
            </button>
            <button 
              className={`px-4 py-1 ${currency === 'AUD' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              onClick={() => setCurrency('AUD')}
            >
              AUD
            </button>
          </div>
        </div>
      </header>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl">Loading data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <Home className="text-blue-500 mr-2" />
                <h3 className="font-semibold">Market Median</h3>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(summaryMetrics.marketMedian, currency)}</p>
              <p className="text-sm text-gray-500">Per square meter</p>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <BarChart3 className="text-green-500 mr-2" />
                <h3 className="font-semibold">NSO Official</h3>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(summaryMetrics.nsoAvg, currency)}</p>
              <p className="text-sm text-gray-500">Per square meter</p>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                {summaryMetrics.avgPriceGap > 0 ? (
                  <TrendingUp className="text-red-500 mr-2" />
                ) : (
                  <TrendingDown className="text-green-500 mr-2" />
                )}
                <h3 className="font-semibold">Price Gap</h3>
              </div>
              <p className="text-2xl font-bold">
                {summaryMetrics.avgPriceGap ? `${summaryMetrics.avgPriceGap.toFixed(1)}%` : 'N/A'}
              </p>
              <p className="text-sm text-gray-500">Market vs Official</p>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <MapPin className="text-purple-500 mr-2" />
                <h3 className="font-semibold">Total Listings</h3>
              </div>
              <p className="text-2xl font-bold">{summaryMetrics.totalListings.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Active properties</p>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <Calendar className="text-orange-500 mr-2" />
                <h3 className="font-semibold">Housing Price Index</h3>
              </div>
              <p className="text-2xl font-bold">{summaryMetrics.housingIndex.toFixed(1)}</p>
              <p className="text-sm text-gray-500">Base: 100</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex border-b">
              <button 
                className={`py-2 px-4 ${activeTab === 'comparison' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('comparison')}
              >
                District Comparison
              </button>
              <button 
                className={`py-2 px-4 ${activeTab === 'index' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('index')}
              >
                Housing Price Index
              </button>
              <button 
                className={`py-2 px-4 ${activeTab === 'volume' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                onClick={() => setActiveTab('volume')}
              >
                Listing Volume
              </button>
            </div>
          </div>
          
          {/* Chart Area */}
          <div className="bg-white p-6 rounded shadow mb-8">
            {activeTab === 'comparison' && (
              <>
                <h2 className="text-xl font-semibold mb-4">District Price Comparison</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={districtComparisonData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="district" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis 
                        label={{ 
                          value: `Price per sqm (${currency})`, 
                          angle: -90, 
                          position: 'insideLeft' 
                        }} 
                      />
                      <Tooltip 
                        formatter={(value) => [
                          formatCurrency(value, currency),
                          currency === 'MNT' ? 'Price (MNT)' : 'Price (AUD)'
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="marketMedian" name="Market Median" fill="#3b82f6" />
                      <Bar dataKey="nsoAvg" name="NSO Average" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
            
            {activeTab === 'index' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Housing Price Index Trend</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={housingIndexData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Index Value (Base: 100)', 
                          angle: -90, 
                          position: 'insideLeft' 
                        }} 
                      />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="index" 
                        name="Housing Price Index" 
                        stroke="#f59e0b" 
                        strokeWidth={2} 
                        dot={{ r: 4 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
            
            {activeTab === 'volume' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Listing Volume by District</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={listingVolumeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="district" 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Number of Listings', 
                          angle: -90, 
                          position: 'insideLeft' 
                        }} 
                      />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="listings" 
                        name="Total Listings" 
                        fill="#8b5cf6" 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
          
          {/* Data Table */}
          <div className="bg-white p-6 rounded shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Market vs Official Data</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
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
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-2 px-4 border">{row.district || 'N/A'}</td>
                      <td className="py-2 px-4 border">{formatDate(row.market_month)}</td>
                      <td className="py-2 px-4 border">{formatDate(row.nso_month)}</td>
                      <td className="py-2 px-4 border">{formatCurrency(row.market_median, currency)}</td>
                      <td className="py-2 px-4 border">{formatCurrency(row.nso_avg, currency)}</td>
                      <td className="py-2 px-4 border">
                        {row.price_gap_percent !== null ? `${row.price_gap_percent}%` : 'N/A'}
                      </td>
                      <td className="py-2 px-4 border">{row.listing_count || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Data Sources */}
          <div className="bg-gray-50 p-6 rounded">
            <h2 className="text-lg font-semibold mb-2">Data Sources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium">Market Data</h3>
                <p className="text-sm text-gray-600">
                  {summaryMetrics.totalListings.toLocaleString()} property listings from Octoparse scrapes
                </p>
                <p className="text-sm text-gray-600">
                  Last updated: {marketData.length > 0 ? formatDate(marketData[0].market_month) : 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Official Statistics</h3>
                <p className="text-sm text-gray-600">
                  1,513 NSO records covering 7 districts
                </p>
                <p className="text-sm text-gray-600">
                  Last updated: {marketData.length > 0 ? formatDate(marketData[0].nso_month) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default App
