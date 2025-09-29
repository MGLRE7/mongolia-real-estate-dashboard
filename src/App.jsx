import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Home, BarChart3, Calendar, MapPin } from 'lucide-react'
import './App.css'

// Mock data based on our NSO analysis results
const mockData = {
  priceComparison: [
    { month: '2022-01', market: 3200000, nso: 2900000, gap: 10.3 },
    { month: '2022-02', market: 3250000, nso: 2950000, gap: 10.2 },
    { month: '2022-03', market: 3300000, nso: 3000000, gap: 10.0 },
    { month: '2022-04', market: 3400000, nso: 3100000, gap: 9.7 },
    { month: '2022-05', market: 3500000, nso: 3200000, gap: 9.4 },
    { month: '2022-06', market: 3600000, nso: 3300000, gap: 9.1 }
  ],
  districtComparison: [
    { district: 'Bayanzurkh', market: 3800000, nso: 3500000, gap: 8.6 },
    { district: 'Bayangol', market: 4200000, nso: 3900000, gap: 7.7 },
    { district: 'Sukhbaatar', market: 4500000, nso: 4100000, gap: 9.8 },
    { district: 'Khan-Uul', market: 5200000, nso: 4800000, gap: 8.3 },
    { district: 'Chingeltei', market: 3900000, nso: 3600000, gap: 8.3 },
    { district: 'Songinokhairkhan', market: 3400000, nso: 3200000, gap: 6.3 }
  ],
  housingPriceIndex: [
    { month: '2022-01', index: 100.0 },
    { month: '2022-02', index: 101.0 },
    { month: '2022-03', index: 103.0 },
    { month: '2022-04', index: 104.0 },
    { month: '2022-05', index: 105.0 },
    { month: '2022-06', index: 107.2 }
  ],
  listingVolume: [
    { month: '2022-01', listings: 450 },
    { month: '2022-02', listings: 520 },
    { month: '2022-03', listings: 680 },
    { month: '2022-04', listings: 750 },
    { month: '2022-05', listings: 820 },
    { month: '2022-06', listings: 890 }
  ]
}

function App() {
  const [selectedDistrict, setSelectedDistrict] = useState('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('6months')
  const [currency, setCurrency] = useState('MNT')
  const [activeTab, setActiveTab] = useState('trends')

  // Key metrics calculations
  const latestData = mockData.priceComparison[mockData.priceComparison.length - 1]
  const medianMarketPrice = latestData.market
  const nsoAvgPrice = latestData.nso
  const priceGap = latestData.gap
  const totalListings = mockData.listingVolume[mockData.listingVolume.length - 1].listings
  const currentHPI = mockData.housingPriceIndex[mockData.housingPriceIndex.length - 1].index

  const formatPrice = (price) => {
    if (currency === 'MNT') {
      return `₮${(price / 1000000).toFixed(1)}M`
    } else {
      // Mock conversion rate: 1 AUD = 2700 MNT
      return `A$${(price / 2700).toLocaleString()}`
    }
  }

  const formatTooltip = (value, name) => {
    if (name === 'gap') return [`${value}%`, 'Price Gap']
    if (name === 'index') return [value, 'Housing Price Index']
    if (name === 'listings') return [value, 'Total Listings']
    return [formatPrice(value), name === 'market' ? 'Market Median' : 'NSO Average']
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mongolia Real Estate Dashboard</h1>
              <p className="text-gray-600 mt-1">Market vs Official Data Analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-1" />
                Last Updated: Sept 2025
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select 
            value={selectedTimeRange} 
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="6months">Last 6 months</option>
            <option value="12months">Last 12 months</option>
            <option value="custom">Custom range</option>
          </select>

          <select 
            value={selectedDistrict} 
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Districts</option>
            <option value="bayanzurkh">Bayanzurkh</option>
            <option value="bayangol">Bayangol</option>
            <option value="sukhbaatar">Sukhbaatar</option>
            <option value="khan-uul">Khan-Uul</option>
            <option value="chingeltei">Chingeltei</option>
            <option value="songinokhairkhan">Songinokhairkhan</option>
          </select>

          <button
            onClick={() => setCurrency(currency === 'MNT' ? 'AUD' : 'MNT')}
            className={`px-4 py-2 rounded-lg font-medium ${
              currency === 'MNT' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            {currency}
          </button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Market Median Price</h3>
              <Home className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatPrice(medianMarketPrice)}</div>
            <p className="text-xs text-gray-500">per sqm</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">NSO Official Price</h3>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatPrice(nsoAvgPrice)}</div>
            <p className="text-xs text-gray-500">per sqm</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Price Gap</h3>
              {priceGap > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{priceGap.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">market premium</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Listings</h3>
              <MapPin className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalListings.toLocaleString()}</div>
            <p className="text-xs text-gray-500">active properties</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Housing Price Index</h3>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{currentHPI.toFixed(1)}</div>
            <p className="text-xs text-gray-500">base: 100.0</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'trends', label: 'Price Trends' },
                { id: 'districts', label: 'District Comparison' },
                { id: 'index', label: 'Housing Price Index' },
                { id: 'volume', label: 'Listing Volume' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'trends' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Market vs NSO Price Trends</h3>
                <p className="text-gray-600 mb-4">
                  Comparison of median market listing prices with official NSO average prices over time
                </p>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockData.priceComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatPrice(value)} />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="market" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Market Median"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="nso" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="NSO Average"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'districts' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">District Price Comparison</h3>
                <p className="text-gray-600 mb-4">
                  Market vs NSO prices across Ulaanbaatar's 6 districts
                </p>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockData.districtComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={(value) => formatPrice(value)} />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    <Bar dataKey="market" fill="#3B82F6" name="Market Median" />
                    <Bar dataKey="nso" fill="#10B981" name="NSO Average" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'index' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">NSO Housing Price Index</h3>
                <p className="text-gray-600 mb-4">
                  Official government housing price index showing market trends
                </p>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={mockData.housingPriceIndex}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="index" 
                      stroke="#F59E0B" 
                      strokeWidth={3}
                      name="Housing Price Index"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {activeTab === 'volume' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Listing Volume</h3>
                <p className="text-gray-600 mb-4">
                  Number of active property listings over time
                </p>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockData.listingVolume}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    <Bar dataKey="listings" fill="#8B5CF6" name="Total Listings" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Data Quality Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Sources & Coverage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Market Data</h4>
                <p className="text-gray-600">
                  5,939 property listings from ReMax, Unegui, Century21, and other platforms
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">NSO Statistics</h4>
                <p className="text-gray-600">
                  1,513 official records spanning Jan 2022 - May 2024 across 6 UB districts
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Last Updated</h4>
                <p className="text-gray-600">
                  Market data: Sept 25, 2025<br />
                  NSO data: May 2024
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
