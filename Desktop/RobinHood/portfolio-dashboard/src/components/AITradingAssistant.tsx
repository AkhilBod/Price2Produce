'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, Target, AlertTriangle, Lightbulb, DollarSign } from 'lucide-react'
import { aiTradingService, AIRecommendation, PortfolioAnalysis } from '@/services/aiTradingService'

interface Position {
  symbol: string
  shares: number
  costBasis: number
  currentPrice: number
}

interface Props {
  positions: Position[]
}

export default function AITradingAssistant({ positions }: Props) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeRecommendation, setActiveRecommendation] = useState<AIRecommendation | null>(null)

  useEffect(() => {
    if (positions.length > 0) {
      generateAIRecommendations()
    }
  }, [positions])

  const generateAIRecommendations = async () => {
    setIsAnalyzing(true)
    
    try {
      // Analyze portfolio style
      const portfolioStyle = aiTradingService.analyzePortfolioStyle(positions)
      setPortfolioAnalysis(portfolioStyle)

      // Generate AI recommendations for each position
      const recs: AIRecommendation[] = []
      
      for (const position of positions) {
        const rec = await aiTradingService.generateAIRecommendation(
          position.symbol,
          position.currentPrice,
          position.costBasis,
          portfolioStyle
        )
        recs.push(rec)
        
        // Add delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      setRecommendations(recs)
      
      // Show the most urgent recommendation
      const urgentRec = recs.find(r => r.signal.action !== 'HOLD') || recs[0]
      if (urgentRec) {
        setActiveRecommendation(urgentRec)
      }
      
    } catch (error) {
      console.error('Error generating AI recommendations:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'BUY': return 'text-green-400 bg-green-900/20 border-green-500/30'
      case 'SELL': return 'text-red-400 bg-red-900/20 border-red-500/30'
      case 'PARTIAL_SELL': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30'
      default: return 'text-blue-400 bg-blue-900/20 border-blue-500/30'
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'BUY': return <TrendingUp size={20} />
      case 'SELL': return <TrendingDown size={20} />
      case 'PARTIAL_SELL': return <Target size={20} />
      default: return <AlertTriangle size={20} />
    }
  }

  if (isAnalyzing) {
    return (
      <div className="bg-rh-card rounded-lg p-6 border border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="text-rh-green animate-pulse" size={24} />
          <h2 className="text-xl font-bold text-white">AI Trading Assistant</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rh-green"></div>
          <span className="ml-3 text-gray-400">Analyzing your portfolio...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Assistant Header */}
      <div className="bg-rh-card rounded-lg p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="text-rh-green" size={24} />
            <h2 className="text-xl font-bold text-white">AI Trading Assistant</h2>
          </div>
          <button
            onClick={generateAIRecommendations}
            className="px-4 py-2 bg-rh-green/10 text-rh-green border border-rh-green/30 rounded-lg hover:bg-rh-green/20 transition-colors"
          >
            Refresh Analysis
          </button>
        </div>

        {portfolioAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-rh-dark rounded-lg p-4">
              <div className="text-sm text-gray-400">Risk Level</div>
              <div className="text-lg font-semibold text-white capitalize">
                {portfolioAnalysis.risk_level}
              </div>
            </div>
            <div className="bg-rh-dark rounded-lg p-4">
              <div className="text-sm text-gray-400">Diversification Score</div>
              <div className="text-lg font-semibold text-white">
                {portfolioAnalysis.diversification_score.toFixed(0)}/100
              </div>
            </div>
            <div className="bg-rh-dark rounded-lg p-4">
              <div className="text-sm text-gray-400">Trading Style</div>
              <div className="text-lg font-semibold text-white capitalize">
                {portfolioAnalysis.trading_style.replace('_', ' ')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Alert */}
      {activeRecommendation && (
        <div className={`rounded-lg p-6 border-2 ${getActionColor(activeRecommendation.signal.action)}`}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-gray-800/50">
              {getActionIcon(activeRecommendation.signal.action)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">
                  {activeRecommendation.symbol} - {activeRecommendation.signal.action} SIGNAL
                </h3>
                <span className="px-2 py-1 bg-gray-800 rounded text-sm text-gray-300">
                  {activeRecommendation.signal.confidence}% confidence
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="text-gray-300">
                  <strong>${activeRecommendation.current_price.toFixed(2)}</strong> 
                  {activeRecommendation.technical_analysis.price_vs_52w_high > 95 && (
                    <span className="ml-2 text-yellow-400">📈 Near 52W High!</span>
                  )}
                </div>

                <div className="space-y-1">
                  {activeRecommendation.signal.reasoning.map((reason, index) => (
                    <div key={index} className="text-sm text-gray-300">
                      {reason}
                    </div>
                  ))}
                </div>

                {activeRecommendation.reinvestment_suggestions && (
                  <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="text-yellow-400" size={16} />
                      <span className="font-semibold text-white">Reinvestment Suggestions</span>
                    </div>
                    <div className="space-y-2">
                      {activeRecommendation.reinvestment_suggestions.map((suggestion, index) => (
                        <div key={index} className="text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{suggestion.symbol}</span>
                            <span className="text-rh-green">{suggestion.allocation_percent}%</span>
                          </div>
                          <div className="text-gray-400 text-xs">{suggestion.reasoning}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Recommendations */}
      <div className="bg-rh-card rounded-lg p-6 border border-gray-800">
        <h3 className="text-lg font-bold text-white mb-4">All AI Recommendations</h3>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div 
              key={rec.symbol} 
              className="bg-rh-dark rounded-lg p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
              onClick={() => setActiveRecommendation(rec)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-lg">{rec.symbol}</span>
                  <div className={`px-2 py-1 rounded text-sm ${getActionColor(rec.signal.action)}`}>
                    {rec.signal.action}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-medium">${rec.current_price.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">{rec.signal.confidence}% confidence</div>
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-300">
                {rec.signal.reasoning[0]}
              </div>
              
              <div className="mt-2 text-xs text-gray-400">
                RSI: {rec.technical_analysis.rsi.toFixed(1)} | 
                52W High: {rec.technical_analysis.price_vs_52w_high.toFixed(1)}% |
                News: {rec.news_analysis.overall_sentiment}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
