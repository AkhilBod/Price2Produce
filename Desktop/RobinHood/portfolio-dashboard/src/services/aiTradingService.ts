// AI Trading Assistant Service - The brain of our intelligent alerts

export interface TechnicalIndicators {
  rsi: number
  sma20: number
  sma50: number
  support: number
  resistance: number
  volume_ratio: number
  price_vs_52w_high: number
  price_vs_52w_low: number
}

export interface NewsAnalysis {
  articles: NewsArticle[]
  overall_sentiment: 'bullish' | 'bearish' | 'neutral'
  sentiment_score: number
  key_themes: string[]
  impact_level: 'low' | 'medium' | 'high'
}

export interface NewsArticle {
  title: string
  summary: string
  sentiment: 'positive' | 'negative' | 'neutral'
  relevance_score: number
  source: string
  published_at: string
  url: string
}

export interface AITradingSignal {
  action: 'BUY' | 'SELL' | 'HOLD' | 'PARTIAL_SELL'
  confidence: number
  reasoning: string[]
  price_target?: number
  stop_loss?: number
  position_size?: number
  timeline: 'immediate' | 'short_term' | 'medium_term'
}

export interface AIRecommendation {
  symbol: string
  current_price: number
  signal: AITradingSignal
  technical_analysis: TechnicalIndicators
  news_analysis: NewsAnalysis
  market_context: string
  reinvestment_suggestions?: InvestmentSuggestion[]
}

export interface InvestmentSuggestion {
  symbol: string
  allocation_percent: number
  reasoning: string
  risk_level: 'low' | 'medium' | 'high'
  expected_return: string
  why_it_fits: string
}

export interface PortfolioAnalysis {
  diversification_score: number
  risk_level: 'conservative' | 'moderate' | 'aggressive'
  sector_concentration: Record<string, number>
  trading_style: 'day_trader' | 'swing_trader' | 'long_term'
  avg_holding_period: number
  win_rate: number
}

class AITradingService {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || ''
  }

  // Analyze trading patterns to understand user's style
  analyzePortfolioStyle(positions: any[], tradingHistory: any[] = []): PortfolioAnalysis {
    // Calculate sector concentration
    const sectorMap: Record<string, number> = {}
    const totalValue = positions.reduce((sum, p) => sum + (p.shares * p.costBasis), 0)
    
    positions.forEach(pos => {
      const sector = this.getSectorForSymbol(pos.symbol)
      sectorMap[sector] = (sectorMap[sector] || 0) + ((pos.shares * pos.costBasis) / totalValue * 100)
    })

    // Determine risk level based on portfolio
    const techPercent = sectorMap['Technology'] || 0
    const riskLevel = techPercent > 70 ? 'aggressive' : 
                     techPercent > 40 ? 'moderate' : 'conservative'

    return {
      diversification_score: this.calculateDiversificationScore(sectorMap),
      risk_level: riskLevel,
      sector_concentration: sectorMap,
      trading_style: 'swing_trader', // Based on typical positions
      avg_holding_period: 30, // days
      win_rate: 65 // Default assumption
    }
  }

  // Generate AI-powered trading recommendation
  async generateAIRecommendation(
    symbol: string, 
    currentPrice: number, 
    costBasis: number,
    portfolioStyle: PortfolioAnalysis,
    newsData: any[] = []
  ): Promise<AIRecommendation> {
    
    const technical = await this.calculateTechnicalIndicators(symbol, currentPrice)
    const news = this.analyzeNews(newsData)
    const signal = this.generateTradingSignal(symbol, currentPrice, costBasis, technical, news, portfolioStyle)
    
    return {
      symbol,
      current_price: currentPrice,
      signal,
      technical_analysis: technical,
      news_analysis: news,
      market_context: this.getMarketContext(technical, news),
      reinvestment_suggestions: signal.action === 'SELL' || signal.action === 'PARTIAL_SELL' 
        ? this.generateReinvestmentSuggestions(portfolioStyle, currentPrice * 0.75) 
        : undefined
    }
  }

  private generateTradingSignal(
    symbol: string,
    currentPrice: number,
    costBasis: number,
    technical: TechnicalIndicators,
    news: NewsAnalysis,
    portfolioStyle: PortfolioAnalysis
  ): AITradingSignal {
    
    const gainPercent = ((currentPrice - costBasis) / costBasis) * 100
    const reasoning: string[] = []
    
    // Price momentum analysis
    if (technical.price_vs_52w_high > 95) {
      reasoning.push(`📈 At 52-week high (${technical.price_vs_52w_high.toFixed(1)}%)`)
    }
    
    // Technical indicators
    if (technical.rsi > 70) {
      reasoning.push(`⚠️ RSI overbought (${technical.rsi.toFixed(1)})`)
    } else if (technical.rsi < 30) {
      reasoning.push(`🎯 RSI oversold (${technical.rsi.toFixed(1)}) - bounce likely`)
    }

    // News sentiment
    if (news.impact_level === 'high') {
      reasoning.push(`📰 High-impact ${news.overall_sentiment} news`)
    }

    // Gain/loss analysis
    if (gainPercent > 20) {
      reasoning.push(`💰 Strong gains (+${gainPercent.toFixed(1)}%) - consider taking profits`)
    } else if (gainPercent < -15) {
      reasoning.push(`📉 Significant loss (${gainPercent.toFixed(1)}%) - evaluate fundamentals`)
    }

    // Generate signal based on analysis
    let action: AITradingSignal['action'] = 'HOLD'
    let confidence = 50

    if (gainPercent > 25 && technical.rsi > 75) {
      action = 'PARTIAL_SELL'
      confidence = 80
      reasoning.push(`🎯 RECOMMENDATION: Take 50% profits, strong overbought signals`)
    } else if (gainPercent > 40 || technical.price_vs_52w_high > 98) {
      action = 'SELL'
      confidence = 85
      reasoning.push(`🚨 RECOMMENDATION: Take profits at all-time high`)
    } else if (gainPercent < -20 && technical.rsi < 30 && news.overall_sentiment !== 'bearish') {
      action = 'BUY'
      confidence = 75
      reasoning.push(`🎯 RECOMMENDATION: Average down on oversold bounce`)
    }

    return {
      action,
      confidence,
      reasoning,
      price_target: action === 'SELL' ? currentPrice * 1.05 : currentPrice * 1.15,
      stop_loss: currentPrice * 0.92,
      timeline: 'short_term'
    }
  }

  private generateReinvestmentSuggestions(
    portfolioStyle: PortfolioAnalysis, 
    cashAmount: number
  ): InvestmentSuggestion[] {
    
    const suggestions: InvestmentSuggestion[] = []
    
    // Diversification suggestions based on current concentration
    if (portfolioStyle.sector_concentration['Technology'] > 70) {
      suggestions.push({
        symbol: 'SPY',
        allocation_percent: 40,
        reasoning: 'Diversify away from tech concentration',
        risk_level: 'low',
        expected_return: '8-12% annually',
        why_it_fits: 'Balances your tech-heavy portfolio with broad market exposure'
      })
      
      suggestions.push({
        symbol: 'XLF',
        allocation_percent: 30,
        reasoning: 'Financial sector rotation opportunity',
        risk_level: 'medium',
        expected_return: '10-15% short term',
        why_it_fits: 'Diversifies into undervalued financials during tech profit-taking'
      })
    }

    // Growth suggestions based on trading style
    if (portfolioStyle.risk_level === 'aggressive') {
      suggestions.push({
        symbol: 'ARKK',
        allocation_percent: 25,
        reasoning: 'Continue growth momentum in disruptive innovation',
        risk_level: 'high',
        expected_return: '15-25% potential',
        why_it_fits: 'Matches your aggressive growth trading style'
      })
    }

    // Cash reserves
    suggestions.push({
      symbol: 'CASH',
      allocation_percent: 30,
      reasoning: 'Keep dry powder for next opportunity',
      risk_level: 'low',
      expected_return: '4-5% in high-yield savings',
      why_it_fits: 'Flexibility to buy dips in your favorite stocks'
    })

    return suggestions
  }

  private calculateTechnicalIndicators(symbol: string, currentPrice: number): TechnicalIndicators {
    // Mock technical indicators - in real app, calculate from historical data
    return {
      rsi: 45 + Math.random() * 40, // Random RSI between 45-85
      sma20: currentPrice * (0.95 + Math.random() * 0.1),
      sma50: currentPrice * (0.90 + Math.random() * 0.15),
      support: currentPrice * 0.92,
      resistance: currentPrice * 1.08,
      volume_ratio: 0.8 + Math.random() * 1.4,
      price_vs_52w_high: 70 + Math.random() * 30,
      price_vs_52w_low: 150 + Math.random() * 100
    }
  }

  private analyzeNews(articles: any[]): NewsAnalysis {
    // Mock news analysis - in real app, use sentiment analysis API
    const sentiments = ['bullish', 'bearish', 'neutral'] as const
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]
    
    return {
      articles: [],
      overall_sentiment: sentiment,
      sentiment_score: sentiment === 'bullish' ? 0.7 : sentiment === 'bearish' ? -0.6 : 0.1,
      key_themes: ['earnings', 'product launch', 'market expansion'],
      impact_level: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low'
    }
  }

  private getMarketContext(technical: TechnicalIndicators, news: NewsAnalysis): string {
    const contexts = [
      "Market in risk-on mode, growth stocks favored",
      "Sector rotation from tech to value ongoing", 
      "High volatility environment, trade carefully",
      "Low VIX, good environment for momentum plays",
      "Earnings season approaching, expect volatility"
    ]
    
    return contexts[Math.floor(Math.random() * contexts.length)]
  }

  private getSectorForSymbol(symbol: string): string {
    const sectorMap: Record<string, string> = {
      'AAPL': 'Technology',
      'SOUN': 'Technology', 
      'IONQ': 'Technology',
      'PLTR': 'Technology',
      'NVDA': 'Technology',
      'OKLO': 'Energy',
      'TMC': 'Materials',
      'BBAI': 'Technology'
    }
    
    return sectorMap[symbol] || 'Technology'
  }

  private calculateDiversificationScore(sectorMap: Record<string, number>): number {
    // Simple diversification score - lower concentration = higher score
    const maxConcentration = Math.max(...Object.values(sectorMap))
    return Math.max(0, 100 - maxConcentration)
  }
}

export const aiTradingService = new AITradingService()
