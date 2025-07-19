'use client'

import { useState, useEffect } from 'react'
import AITradingAssistant from '@/components/AITradingAssistant'

interface Position {
  symbol: string
  shares: number
  costBasis: number
  currentPrice: number
}

export default function AIAssistantPage() {
  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Your actual positions with current prices
  const basePositions = [
    { symbol: 'AAPL', shares: 0.025158, costBasis: 211.20 },
    { symbol: 'SOUN', shares: 3.93, costBasis: 12.76 },
    { symbol: 'IONQ', shares: 1.08, costBasis: 46.21 },
    { symbol: 'PLTR', shares: 0.6524, costBasis: 153.37 },
    { symbol: 'NVDA', shares: 0.43511, costBasis: 172.35 }
  ]

  useEffect(() => {
    fetchCurrentPrices()
  }, [])

  const fetchCurrentPrices = async () => {
    try {
      const symbols = basePositions.map(p => p.symbol).join(',')
      const response = await fetch(`/api/stocks?symbols=${symbols}`)
      const result = await response.json()
      const stockPrices = result.data || []

      const positionsWithPrices = basePositions.map(position => {
        const stockPrice = stockPrices.find((price: any) => price.symbol === position.symbol)
        return {
          ...position,
          currentPrice: stockPrice?.price || position.costBasis
        }
      })

      setPositions(positionsWithPrices)
    } catch (error) {
      console.error('Error fetching prices:', error)
      // Use fallback prices
      setPositions(basePositions.map(p => ({ ...p, currentPrice: p.costBasis })))
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-4" style={{ backgroundColor: 'var(--rh-bg-primary)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rh-green"></div>
            <span className="ml-4 text-gray-400 text-lg">Loading your portfolio...</span>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4" style={{ backgroundColor: 'var(--rh-bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🧠 AI Trading Assistant
          </h1>
          <p className="text-gray-400">
            Get intelligent buy/sell recommendations with real-time analysis and reinvestment suggestions
          </p>
        </header>

        <AITradingAssistant positions={positions} />
      </div>
    </main>
  )
}
