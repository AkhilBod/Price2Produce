'use client'

import { AlertTriangle, Shield, TrendingDown, Target } from 'lucide-react'

interface RiskAlert {
  id: string
  type: 'warning' | 'danger' | 'info'
  title: string
  message: string
  symbol?: string
}

export function RiskAlerts() {
  const alerts: RiskAlert[] = [
    {
      id: '1',
      type: 'warning',
      title: 'High Concentration Risk',
      message: 'Technology sector represents 100% of your portfolio. Consider diversifying into other sectors.',
      symbol: 'TECH'
    },
    {
      id: '2',
      type: 'info',
      title: 'IONQ Strong Performance',
      message: 'IONQ is up 3.06% today. Consider taking partial profits if it reaches your target.',
      symbol: 'IONQ'
    },
    {
      id: '3',
      type: 'info',
      title: 'Small Position Management',
      message: 'Your fractional shares are well-diversified. Consider adding more capital to maximize gains.',
      symbol: 'PORTFOLIO'
    }
  ]

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="text-yellow-400" size={20} />
      case 'danger':
        return <TrendingDown className="text-red-400" size={20} />
      case 'info':
        return <Target style={{ color: 'var(--rh-green)' }} size={20} />
      default:
        return <Shield className="text-gray-400" size={20} />
    }
  }

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-l-yellow-400 bg-yellow-900/20'
      case 'danger':
        return 'border-l-red-400 bg-red-900/20'
      case 'info':
        return 'border-l-green-400 bg-green-900/20'
      default:
        return 'border-l-gray-400 bg-gray-900/20'
    }
  }

  return (
    <div className="rh-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={24} className="text-gray-400" />
        <h2 className="text-xl font-bold text-white">Risk Management</h2>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`border-l-4 p-4 rounded-r ${getAlertStyles(alert.type)}`}
          >
            <div className="flex items-start gap-3">
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <h3 className="font-semibold text-white mb-1">
                  {alert.title}
                  {alert.symbol && (
                    <span className="ml-2 px-2 py-1 text-xs rounded" style={{ backgroundColor: 'var(--rh-bg-tertiary)', color: 'var(--rh-text-secondary)' }}>
                      {alert.symbol}
                    </span>
                  )}
                </h3>
                <p className="text-gray-300 text-sm">{alert.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Health Score */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <h3 className="font-semibold text-white mb-3">Portfolio Health Score</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-700 rounded-full h-3">
            <div className="h-3 rounded-full" style={{ backgroundColor: 'var(--rh-green)', width: '73%' }}></div>
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--rh-green)' }}>73/100</span>
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Good diversification, but consider reducing tech concentration
        </p>
      </div>

      {/* Risk Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">12.5%</div>
          <div className="text-sm text-gray-400">Portfolio Beta</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">18.3%</div>
          <div className="text-sm text-gray-400">Volatility</div>
        </div>
      </div>
    </div>
  )
}
