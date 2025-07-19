'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign, Activity, RefreshCw } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Position {
  symbol: string
  shares: number
  costBasis: number
  purchaseDate: string
}

interface StockPrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: string
}

interface PortfolioData extends Position {
  currentPrice: number
  currentValue: number
  gainLoss: number
  gainLossPercent: number
  dayChange: number
  dayChangePercent: number
}

export default function Portfolio() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [dataSource, setDataSource] = useState<'real' | 'demo' | 'mixed'>('demo')
  const [realDataCount, setRealDataCount] = useState(0)

  // Your actual positions
  const positions: Position[] = [
    { symbol: 'AAPL', shares: 0.025158, costBasis: 211.20, purchaseDate: '2024-12-01' },
    { symbol: 'SOUN', shares: 3.93, costBasis: 12.76, purchaseDate: '2024-12-15' },
    { symbol: 'IONQ', shares: 1.08, costBasis: 46.21, purchaseDate: '2024-11-20' },
    { symbol: 'PLTR', shares: 0.6524, costBasis: 153.37, purchaseDate: '2024-11-15' },
    { symbol: 'NVDA', shares: 0.43511, costBasis: 172.35, purchaseDate: '2024-11-10' }
  ]

  const fetchStockData = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const symbols = positions.map(p => p.symbol).join(',')
      const response = await fetch('/api/stocks?symbols=' + symbols)
      
      if (!response.ok) {
        throw new Error('Failed to fetch stock data')
      }
      
      const result = await response.json()
      const stockPrices: StockPrice[] = result.data || []
      
      // Set data source info
      setDataSource(result.source || 'demo')
      setRealDataCount(result.realDataCount || 0)

      // Calculate portfolio data with real P&L
      const portfolioWithPnL = positions.map(position => {
        const stockPrice = stockPrices.find((price: StockPrice) => price.symbol === position.symbol)
        const currentPrice = stockPrice?.price || position.costBasis
        const currentValue = position.shares * currentPrice
        const totalCost = position.shares * position.costBasis
        const gainLoss = currentValue - totalCost
        const gainLossPercent = ((currentPrice - position.costBasis) / position.costBasis) * 100

        return {
          ...position,
          currentPrice,
          currentValue,
          gainLoss,
          gainLossPercent,
          dayChange: stockPrice?.change || 0,
          dayChangePercent: stockPrice?.changePercent || 0
        }
      })

      setPortfolioData(portfolioWithPnL)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data'
      setError(errorMessage)
      console.error('Portfolio fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStockData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStockData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Calculate totals
  const totalValue = portfolioData.reduce((sum, item) => sum + item.currentValue, 0)
  const totalCost = portfolioData.reduce((sum, item) => sum + (item.shares * item.costBasis), 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
  const totalDayChange = portfolioData.reduce((sum, item) => sum + (item.shares * item.dayChange), 0)

  // Performance chart data
  const performanceData = [
    { date: '12/10', value: totalCost * 0.95 },
    { date: '12/11', value: totalCost * 0.98 },
    { date: '12/12', value: totalCost * 1.02 },
    { date: '12/13', value: totalCost * 0.99 },
    { date: '12/14', value: totalCost * 1.05 },
    { date: '12/15', value: totalCost * 1.03 },
    { date: 'Today', value: totalValue }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
        <div className="flex items-center gap-4">
          {/* Data Source Indicator */}
          <div className="flex items-center gap-2">
            {dataSource === 'real' && (
              <span className="flex items-center gap-1 text-xs bg-green-900/20 text-green-400 px-2 py-1 rounded-full border border-green-500/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Data
              </span>
            )}
            {dataSource === 'mixed' && (
              <span className="flex items-center gap-1 text-xs bg-yellow-900/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/20">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                Mixed Data ({realDataCount}/{positions.length} live)
              </span>
            )}
            {dataSource === 'demo' && (
              <span className="flex items-center gap-1 text-xs bg-gray-700/50 text-gray-400 px-2 py-1 rounded-full border border-gray-600/20">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Demo Data
              </span>
            )}
          </div>
          
          {lastUpdated && (
            <span className="text-sm text-gray-400">
              Last updated: {lastUpdated}
            </span>
          )}
          <button
            onClick={fetchStockData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-rh-green/10 text-rh-green border border-rh-green/20 rounded-lg hover:bg-rh-green/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Updating...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-rh-card rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rh-green/10 rounded-lg">
              <DollarSign className="text-rh-green" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">
                ${totalValue.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-rh-card rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className={totalGainLoss >= 0 ? 'bg-green-900/20 p-3 rounded-lg' : 'bg-red-900/20 p-3 rounded-lg'}>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="text-green-400" size={24} />
              ) : (
                <TrendingDown className="text-red-400" size={24} />
              )}
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total P&L</p>
              <p className={totalGainLoss >= 0 ? 'text-2xl font-bold text-green-400' : 'text-2xl font-bold text-red-400'}>
                {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
              </p>
              <p className={totalGainLoss >= 0 ? 'text-sm text-green-400' : 'text-sm text-red-400'}>
                {totalGainLoss >= 0 ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-rh-card rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className={totalDayChange >= 0 ? 'bg-green-900/20 p-3 rounded-lg' : 'bg-red-900/20 p-3 rounded-lg'}>
              <Activity className={totalDayChange >= 0 ? 'text-green-400' : 'text-red-400'} size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Todays Change</p>
              <p className={totalDayChange >= 0 ? 'text-2xl font-bold text-green-400' : 'text-2xl font-bold text-red-400'}>
                {totalDayChange >= 0 ? '+' : ''}${totalDayChange.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-rh-card rounded-lg p-6 border border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-900/20 rounded-lg">
              <DollarSign className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Invested</p>
              <p className="text-2xl font-bold text-white">
                ${totalCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-rh-card rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Portfolio Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C896" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00C896" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#00C896" 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-rh-card rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-bold text-white mb-4">Individual Positions</h3>
        <div className="space-y-4">
          {portfolioData.map((position) => (
            <div key={position.symbol} className="flex items-center justify-between p-4 bg-rh-dark rounded-lg border border-gray-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-white">{position.symbol}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">{position.symbol}</h4>
                  <p className="text-sm text-gray-400">
                    {position.shares.toFixed(position.shares < 1 ? 6 : 2)} shares @ ${position.costBasis.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-white">
                  ${position.currentValue.toFixed(2)}
                </p>
                <p className={position.gainLoss >= 0 ? 'text-sm text-green-400' : 'text-sm text-red-400'}>
                  {position.gainLoss >= 0 ? '+' : ''}${position.gainLoss.toFixed(2)} 
                  ({position.gainLoss >= 0 ? '+' : ''}{position.gainLossPercent.toFixed(2)}%)
                </p>
                <p className={position.dayChangePercent >= 0 ? 'text-xs text-green-400' : 'text-xs text-red-400'}>
                  Today: {position.dayChangePercent >= 0 ? '+' : ''}{position.dayChangePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
