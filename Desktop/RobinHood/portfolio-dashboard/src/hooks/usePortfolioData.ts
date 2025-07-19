import { useState, useEffect } from 'react'

export interface Position {
  symbol: string
  shares: number
  costBasis: number
  purchaseDate: string
}

export interface StockPrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  lastUpdated: string
}

export interface PortfolioData extends Position {
  currentPrice: number
  currentValue: number
  gainLoss: number
  gainLossPercent: number
  dayChange: number
  dayChangePercent: number
}

// Default portfolio positions
export const DEFAULT_POSITIONS: Position[] = [
  { symbol: 'AAPL', shares: 0.025158, costBasis: 211.20, purchaseDate: '2024-12-01' },
  { symbol: 'SOUN', shares: 3.93, costBasis: 12.76, purchaseDate: '2024-12-15' },
  { symbol: 'IONQ', shares: 1.08, costBasis: 46.21, purchaseDate: '2024-11-20' },
  { symbol: 'PLTR', shares: 0.6524, costBasis: 153.37, purchaseDate: '2024-11-15' },
  { symbol: 'NVDA', shares: 0.43511, costBasis: 172.35, purchaseDate: '2024-11-10' },
  { symbol: 'OKLO', shares: 3.95, costBasis: 12.66, purchaseDate: '2024-12-10' },
  { symbol: 'TMC', shares: 47.62, costBasis: 1.05, purchaseDate: '2024-12-05' },
  { symbol: 'BBAI', shares: 16.13, costBasis: 3.10, purchaseDate: '2024-11-25' }
]

export function usePortfolioData() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [lastUpdated, setLastUpdated] = useState<string>('')

  // Get portfolio symbols
  const getPortfolioSymbols = (): string[] => {
    return DEFAULT_POSITIONS.map(position => position.symbol)
  }

  // Fetch and calculate portfolio data
  const fetchPortfolioData = async () => {
    try {
      setIsLoading(true)
      setError('')

      const symbols = getPortfolioSymbols()
      const response = await fetch(`/api/stocks?symbols=${symbols.join(',')}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const stockPrices: StockPrice[] = await response.json()
      setLastUpdated(new Date().toLocaleTimeString())

      // Calculate portfolio data
      const calculatedData: PortfolioData[] = DEFAULT_POSITIONS.map(position => {
        const stockData = stockPrices.find(stock => stock.symbol === position.symbol)
        
        if (!stockData) {
          // Fallback to default values if no stock data
          return {
            ...position,
            currentPrice: position.costBasis,
            currentValue: position.shares * position.costBasis,
            gainLoss: 0,
            gainLossPercent: 0,
            dayChange: 0,
            dayChangePercent: 0
          }
        }

        const currentValue = position.shares * stockData.price
        const gainLoss = currentValue - (position.shares * position.costBasis)
        const gainLossPercent = ((stockData.price - position.costBasis) / position.costBasis) * 100
        const dayChange = position.shares * stockData.change
        const dayChangePercent = stockData.changePercent

        return {
          ...position,
          currentPrice: stockData.price,
          currentValue,
          gainLoss,
          gainLossPercent,
          dayChange,
          dayChangePercent
        }
      })

      setPortfolioData(calculatedData)
    } catch (err) {
      console.error('Error fetching portfolio data:', err)
      setError('Failed to load portfolio data')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate portfolio totals
  const getPortfolioTotals = () => {
    const totalValue = portfolioData.reduce((sum, item) => sum + item.currentValue, 0)
    const totalCost = portfolioData.reduce((sum, item) => sum + (item.shares * item.costBasis), 0)
    const totalGainLoss = totalValue - totalCost
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
    const totalDayChange = portfolioData.reduce((sum, item) => sum + item.dayChange, 0)

    return {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      totalDayChange
    }
  }

  useEffect(() => {
    fetchPortfolioData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPortfolioData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return {
    portfolioData,
    portfolioTotals: getPortfolioTotals(),
    portfolioSymbols: getPortfolioSymbols(),
    isLoading,
    error,
    lastUpdated,
    refetch: fetchPortfolioData
  }
}
