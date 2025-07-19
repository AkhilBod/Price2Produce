'use client'

import Portfolio from '@/components/Portfolio'
import AITradingAssistant from '@/components/AITradingAssistant'
import { DailyBrief } from '@/components/DailyBrief'
import { RiskAlerts } from '@/components/RiskAlerts'
import { ExitSignals } from '@/components/ExitSignals'
import { usePortfolioData } from '@/hooks/usePortfolioData'

export default function Home() {
  const { portfolioSymbols, portfolioTotals, isLoading } = usePortfolioData()

  return (
    <main className="min-h-screen p-4" style={{ backgroundColor: 'var(--rh-bg-primary)' }}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Portfolio
          </h1>
          <p className="text-gray-400">
            Track your investments, manage risk, and get intelligent insights
          </p>
          {!isLoading && (
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="text-gray-500">Portfolio Value:</span>
              <span className="text-white font-bold text-lg">
                ${portfolioTotals.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`font-medium ${portfolioTotals.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {portfolioTotals.totalGainLoss >= 0 ? '+' : ''}
                ${portfolioTotals.totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                ({portfolioTotals.totalGainLossPercent >= 0 ? '+' : ''}{portfolioTotals.totalGainLossPercent.toFixed(2)}%)
              </span>
            </div>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Portfolio View */}
          <div className="lg:col-span-2 space-y-6">
            <Portfolio />
            <ExitSignals />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RiskAlerts />
            <DailyBrief portfolioSymbols={portfolioSymbols} />
          </div>
        </div>
      </div>
    </main>
  )
}
