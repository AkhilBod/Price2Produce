'use client'

import { TrendingUp, TrendingDown, AlertCircle, Calendar, Target } from 'lucide-react'

interface ExitSignal {
  symbol: string
  type: 'stop-loss' | 'profit-target' | 'dead-money' | 'earnings'
  currentPrice: number
  targetPrice?: number
  stopLoss?: number
  reason: string
  urgency: 'low' | 'medium' | 'high'
  daysHeld: number
}

export function ExitSignals() {
  const signals: ExitSignal[] = [
    {
      symbol: 'AAPL',
      type: 'profit-target',
      currentPrice: 175.50,
      targetPrice: 180.00,
      reason: 'Approaching 20% profit target - consider taking partial profits',
      urgency: 'medium',
      daysHeld: 45
    },
    {
      symbol: 'TSLA',
      type: 'stop-loss',
      currentPrice: 220.00,
      stopLoss: 190.00,
      reason: 'Approaching stop loss level - monitor closely',
      urgency: 'high',
      daysHeld: 32
    },
    {
      symbol: 'MSFT',
      type: 'earnings',
      currentPrice: 320.00,
      reason: 'Earnings announcement in 3 days - high volatility expected',
      urgency: 'medium',
      daysHeld: 67
    }
  ]

  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'profit-target':
        return <Target style={{ color: 'var(--rh-green)' }} size={20} />
      case 'stop-loss':
        return <TrendingDown className="text-red-400" size={20} />
      case 'dead-money':
        return <AlertCircle className="text-yellow-400" size={20} />
      case 'earnings':
        return <Calendar className="text-blue-400" size={20} />
      default:
        return <AlertCircle className="text-gray-400" size={20} />
    }
  }

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-red-400 bg-red-900/20'
      case 'medium':
        return 'border-yellow-400 bg-yellow-900/20'
      case 'low':
        return 'border-green-400 bg-green-900/20'
      default:
        return 'border-gray-600 bg-gray-800/30'
    }
  }

  const getUrgencyDot = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-400'
      case 'medium':
        return 'bg-yellow-400'
      case 'low':
        return 'bg-green-400'
      default:
        return 'bg-gray-400'
    }
  }

  return (
    <div className="rh-card p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={24} className="text-gray-400" />
        <h2 className="text-xl font-bold text-white">Smart Exit Signals</h2>
      </div>

      <div className="space-y-4">
        {signals.map((signal, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${getUrgencyStyles(signal.urgency)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getSignalIcon(signal.type)}
                <div>
                  <h3 className="font-bold text-white">{signal.symbol}</h3>
                  <p className="text-sm text-gray-400">
                    ${signal.currentPrice.toFixed(2)} • Held {signal.daysHeld} days
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${getUrgencyDot(signal.urgency)}`}></div>
                <span className="text-sm font-medium capitalize">{signal.urgency}</span>
              </div>
            </div>

            <p className="text-gray-300 mb-3">{signal.reason}</p>

            {signal.targetPrice && (
              <div className="flex items-center gap-2 text-sm">
                <Target size={16} className="text-green-500" />
                <span>Target: ${signal.targetPrice.toFixed(2)}</span>
                <span className="text-gray-500">
                  ({((signal.targetPrice - signal.currentPrice) / signal.currentPrice * 100).toFixed(1)}% upside)
                </span>
              </div>
            )}

            {signal.stopLoss && (
              <div className="flex items-center gap-2 text-sm">
                <TrendingDown size={16} className="text-red-500" />
                <span>Stop Loss: ${signal.stopLoss.toFixed(2)}</span>
                <span className="text-gray-500">
                  ({((signal.currentPrice - signal.stopLoss) / signal.currentPrice * 100).toFixed(1)}% protection)
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Exit Strategy Settings */}
      <div className="mt-6 pt-6 border-t">
        <h3 className="font-semibold text-white mb-4">Exit Strategy Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-rh-dark p-3 rounded border border-gray-700">
            <div className="text-sm text-gray-400">Default Stop Loss</div>
            <div className="text-lg font-bold text-white">-15%</div>
          </div>
          <div className="bg-rh-dark p-3 rounded border border-gray-700">
            <div className="text-sm text-gray-400">Profit Target</div>
            <div className="text-lg font-bold text-white">+20%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
