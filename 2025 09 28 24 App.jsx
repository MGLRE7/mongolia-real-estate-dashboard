import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mongolia Real Estate Dashboard</h1>
              <p className="text-muted-foreground mt-1">Market vs Official Data Analysis</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                Last Updated: Sept 2025
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              <SelectItem value="bayanzurkh">Bayanzurkh</SelectItem>
              <SelectItem value="bayangol">Bayangol</SelectItem>
              <SelectItem value="sukhbaatar">Sukhbaatar</SelectItem>
              <SelectItem value="khan-uul">Khan-Uul</SelectItem>
              <SelectItem value="chingeltei">Chingeltei</SelectItem>
              <SelectItem value="songinokhairkhan">Songinokhairkhan</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={currency === 'MNT' ? 'default' : 'outline'}
            onClick={() => setCurrency(currency === 'MNT' ? 'AUD' : 'MNT')}
            className="w-20"
          >
            {currency}
          </Button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Market Median Price</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(medianMarketPrice)}</div>
              <p className="text-xs text-muted-foreground">per sqm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NSO Official Price</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(nsoAvgPrice)}</div>
              <p className="text-xs text-muted-foreground">per sqm</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Price Gap</CardTitle>
              {priceGap > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{priceGap.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">market premium</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalListings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">active properties</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Housing Price Index</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentHPI.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">base: 100.0</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Price Trends</TabsTrigger>
            <TabsTrigger value="districts">District Comparison</TabsTrigger>
            <TabsTrigger value="index">Housing Price Index</TabsTrigger>
            <TabsTrigger value="volume">Listing Volume</TabsTrigger>
          </TabsList>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Market vs NSO Price Trends</CardTitle>
                <CardDescription>
                  Comparison of median market listing prices with official NSO average prices over time
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      name="Market Median"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="nso" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      name="NSO Average"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="districts">
            <Card>
              <CardHeader>
                <CardTitle>District Price Comparison</CardTitle>
                <CardDescription>
                  Market vs NSO prices across Ulaanbaatar's 6 districts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockData.districtComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="district" angle={-45} textAnchor="end" height={80} />
                    <YAxis tickFormatter={(value) => formatPrice(value)} />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    <Bar dataKey="market" fill="hsl(var(--chart-1))" name="Market Median" />
                    <Bar dataKey="nso" fill="hsl(var(--chart-2))" name="NSO Average" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="index">
            <Card>
              <CardHeader>
                <CardTitle>NSO Housing Price Index</CardTitle>
                <CardDescription>
                  Official government housing price index showing market trends
                </CardDescription>
              </CardHeader>
              <CardContent>
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
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={3}
                      name="Housing Price Index"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="volume">
            <Card>
              <CardHeader>
                <CardTitle>Market Listing Volume</CardTitle>
                <CardDescription>
                  Number of active property listings over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mockData.listingVolume}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={formatTooltip} />
                    <Legend />
                    <Bar dataKey="listings" fill="hsl(var(--chart-4))" name="Total Listings" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Data Quality Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Data Sources & Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Market Data</h4>
                <p className="text-muted-foreground">
                  5,939 property listings from ReMax, Unegui, Century21, and other platforms
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">NSO Statistics</h4>
                <p className="text-muted-foreground">
                  1,513 official records spanning Jan 2022 - May 2024 across 6 UB districts
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Last Updated</h4>
                <p className="text-muted-foreground">
                  Market data: Sept 25, 2025<br />
                  NSO data: May 2024
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App
