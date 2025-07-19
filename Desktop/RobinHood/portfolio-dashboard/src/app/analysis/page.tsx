'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, BarChart3, PieChart, Calendar, DollarSign } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts'

export default function AnalysisPage() {
  const [timeframe, setTimeframe] = useState('1M')

  // Performance data
  const performanceData = [
    { date: 'Week 1', portfolio: 4800, sp500: 4750 },
    { date: 'Week 2', portfolio: 5200, sp500: 4820 },
    { date: 'Week 3', portfolio: 4900, sp500: 4780 },
    { date: 'Week 4', portfolio: 5415, sp500: 4850 },
  ]

  // Sector allocation
  const sectorData = [
    { name: 'Technology', value: 4315, percentage: 79.7 },
    { name: 'Consumer Discretionary', value: 1100, percentage: 20.3 },
  ]

  // Risk metrics
  const riskMetrics = [
    { metric: 'Beta', value: '1.25', description: 'Higher volatility than market' },
    { metric: 'Sharpe Ratio', value: '0.85', description: 'Good risk-adjusted returns' },
    { name: 'Max Drawdown', value: '-12.5%', description: 'Largest peak-to-trough decline' },
    { metric: 'Volatility', value: '18.3%', description: 'Annualized standard deviation' },
  ]

  // Trading patterns
  const tradingPatterns = [
    { pattern: 'Avg Holding Period', value: '48 days', insight: 'Medium-term trader' },
    { pattern: 'Win Rate', value: '67%', insight: 'Above average success rate' },
    { pattern: 'Avg Win', value: '+$245', insight: 'Good profit taking' },
    { pattern: 'Avg Loss', value: '-$89', insight: 'Excellent loss management' },
  ]

  const COLORS = ['#00C896', '#21E1E1', '#FFD23F', '#FF6B6B', '#A855F7']

  return (
    <main className="min-h-screen bg-rh-dark p-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Portfolio Analysis
          </h1>
          <p className="text-gray-400">
            Deep insights into your investment performance and patterns
          </p>
        </header>

        {/* Performance vs Benchmark */}
        <div className="bg-rh-card rounded-lg shadow-lg p-6 mb-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Performance vs S&P 500</h2>
            <div className="flex gap-2">
              {['1W', '1M', '3M', '6M', '1Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    timeframe === period
                      ? 'bg-rh-green text-rh-dark font-semibold'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }} 
                />
                <Line
                  type="monotone"
                  dataKey="portfolio"
                  stroke="#00C896"
                  strokeWidth={3}
                  name="Your Portfolio"
                />
                <Line
                  type="monotone"
                  dataKey="sp500"
                  stroke="#6B7280"
                  strokeWidth={2}
                  name="S&P 500"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 text-center">
            <span className="text-rh-green font-semibold">
              Outperforming S&P 500 by +11.6% this month
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sector Allocation */}
          <div className="bg-rh-card rounded-lg shadow-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Sector Allocation</h2>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={sectorData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Value']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-center">
              <div className="text-orange-400 font-semibold">
                ⚠️ High concentration risk in Technology
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Consider diversifying into other sectors
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="bg-rh-card rounded-lg shadow-lg p-6 border border-gray-800">
            <h2 className="text-xl font-bold text-white mb-4">Risk Metrics</h2>
            <div className="space-y-4">
              {riskMetrics.map((metric, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-white">{metric.metric}</div>
                    <div className="text-sm text-gray-400">{metric.description}</div>
                  </div>
                  <div className="text-lg font-bold text-rh-green">{metric.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trading Patterns Analysis */}
        <div className="bg-rh-card rounded-lg shadow-lg p-6 mb-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Trading Pattern Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tradingPatterns.map((pattern, index) => (
              <div key={index} className="bg-rh-dark p-4 rounded border border-gray-700">
                <div className="text-sm text-gray-400">{pattern.pattern}</div>
                <div className="text-2xl font-bold text-white my-1">{pattern.value}</div>
                <div className="text-xs text-rh-green">{pattern.insight}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-rh-card rounded-lg shadow-lg p-6 border border-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">AI-Powered Recommendations</h2>
          <div className="space-y-4">
            <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="text-blue-400 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-300">Diversification Opportunity</h3>
                  <p className="text-blue-200 text-sm">
                    Consider adding healthcare or financial sector exposure. Your portfolio is 79% technology.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-900/20 border-l-4 border-green-500 p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="text-green-400 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-green-300">Profit Taking Signal</h3>
                  <p className="text-green-200 text-sm">
                    AAPL has reached 17% gains. Consider taking partial profits to lock in gains.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4">
              <div className="flex items-start gap-3">
                <BarChart3 className="text-yellow-400 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-yellow-300">Position Sizing</h3>
                  <p className="text-yellow-200 text-sm">
                    Your average position size is well-balanced at $1,805 per stock.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
