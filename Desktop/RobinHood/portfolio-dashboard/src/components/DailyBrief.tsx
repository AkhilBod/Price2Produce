'use client'

import { useState, useEffect } from 'react'
import { Newspaper, TrendingUp, TrendingDown, Users, Award, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { NewsItem } from '@/services/newsService'

interface AnalystUpdate {
  symbol: string
  action: 'upgrade' | 'downgrade' | 'maintain'
  from: string
  to: string
  firm: string
}

interface DailyBriefProps {
  portfolioSymbols?: string[]
}

interface ExpandedArticle {
  id: string
  isExpanded: boolean
}

export function DailyBrief({ portfolioSymbols = [] }: DailyBriefProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedArticles, setExpandedArticles] = useState<Record<string, boolean>>({})

  // Filter news to only show items relevant to portfolio stocks
  const portfolioRelevantNews = news.filter(item => {
    if (portfolioSymbols.length === 0) return true
    
    // Check if article mentions any portfolio symbol
    const content = (item.title + ' ' + item.summary).toLowerCase()
    return portfolioSymbols.some(symbol => 
      content.includes(symbol.toLowerCase()) || 
      content.includes(`$${symbol.toLowerCase()}`) ||
      item.symbol === symbol
    )
  })

  const toggleArticleExpansion = (articleId: string) => {
    setExpandedArticles(prev => ({
      ...prev,
      [articleId]: !prev[articleId]
    }))
  }

  const fetchPortfolioNews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const params = new URLSearchParams({
        limit: '8'
      })
      
      if (portfolioSymbols.length > 0) {
        params.append('symbols', portfolioSymbols.join(','))
      }

      const response = await fetch(`/api/news?${params}`)
      const data = await response.json()
      
      setNews(data.news || [])
    } catch (error) {
      console.error('Error fetching portfolio news:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPortfolioNews()
  }, [portfolioSymbols])

  const handleRefresh = () => {
    fetchPortfolioNews(true)
  }

  // Mock analyst updates for demo
  const analystUpdates: AnalystUpdate[] = [
    {
      symbol: 'AAPL',
      action: 'upgrade',
      from: 'Hold',
      to: 'Buy',
      firm: 'Goldman Sachs'
    },
    {
      symbol: 'IONQ',
      action: 'upgrade',
      from: 'Neutral',
      to: 'Outperform',
      firm: 'Wedbush'
    },
    {
      symbol: 'NVDA',
      action: 'maintain',
      from: 'Buy',
      to: 'Buy',
      firm: 'JPMorgan'
    }
  ]

  const formatTimeAgo = (dateString: string) => {
    const now = new Date().getTime()
    const published = new Date(dateString).getTime()
    const diffInMinutes = Math.floor((now - published) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getImpactIcon = (sentiment: 'positive' | 'negative' | 'neutral') => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'upgrade':
        return 'bg-green-900/20 border border-green-400'
      case 'downgrade':
        return 'bg-red-900/20 border border-red-400'
      default:
        return 'bg-blue-900/20 border border-blue-400'
    }
  }

  return (
    <div className="rh-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Newspaper size={24} className="text-gray-400" />
          <h2 className="text-xl font-bold text-white">Daily Intelligence</h2>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* News affecting your positions */}
      <div className="mb-6">
        <h3 className="font-semibold text-white mb-3">
          News Affecting Your Stocks 
          {portfolioSymbols.length > 0 && (
            <span className="text-sm text-gray-400 font-normal">
              ({portfolioRelevantNews.length} relevant articles)
            </span>
          )}
        </h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-l-4 border-gray-600 pl-4 py-2 animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {portfolioRelevantNews.slice(0, 8).map((item, index) => {
              const isExpanded = expandedArticles[item.id]
              const shouldTruncate = item.summary && item.summary.length > 150
              
              return (
                <div key={item.id} className="border-l-4 border-gray-600 pl-4 py-2 bg-gray-800/30 rounded-r-lg">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      {getImpactIcon(item.sentiment)}
                      {item.symbol && (
                        <span className="px-2 py-1 text-xs rounded font-mono bg-gray-700 text-green-400">
                          ${item.symbol}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{formatTimeAgo(item.publishedAt)}</span>
                      <span className="text-xs text-gray-600">• {item.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title="Open full article"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleArticleExpansion(item.id)}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="text-sm text-white font-medium mb-2 leading-tight">
                    {item.title}
                  </h4>
                  
                  {item.summary && (
                    <div className="text-xs text-gray-400">
                      {isExpanded || !shouldTruncate ? (
                        <p className="leading-relaxed">{item.summary}</p>
                      ) : (
                        <p className="leading-relaxed">
                          {item.summary.substring(0, 150)}
                          {shouldTruncate && (
                            <span className="text-gray-500">
                              ...{' '}
                              <button
                                onClick={() => toggleArticleExpansion(item.id)}
                                className="text-blue-400 hover:text-blue-300 underline"
                              >
                                read more
                              </button>
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {item.engagement && (
                    <div className="flex gap-4 mt-2 text-xs text-gray-500">
                      {item.engagement.upvotes && (
                        <span>👍 {item.engagement.upvotes.toLocaleString()}</span>
                      )}
                      {item.engagement.comments && (
                        <span>💬 {item.engagement.comments.toLocaleString()}</span>
                      )}
                      {item.engagement.shares && (
                        <span>🔄 {item.engagement.shares.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {portfolioRelevantNews.length === 0 && portfolioSymbols.length > 0 && (
              <div className="text-gray-500 text-sm italic p-4 text-center bg-gray-800/20 rounded-lg">
                No recent news found for your portfolio stocks: {portfolioSymbols.join(', ')}
                <br />
                <span className="text-xs">Try refreshing or check back later</span>
              </div>
            )}
            {portfolioSymbols.length === 0 && (
              <div className="text-gray-500 text-sm italic p-4 text-center bg-gray-800/20 rounded-lg">
                Add some stocks to your portfolio to see relevant news here
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analyst Updates */}
      <div className="mb-6">
        <h3 className="font-semibold text-white mb-3">Analyst Updates</h3>
        <div className="space-y-3">
          {analystUpdates.map((update, index) => (
            <div key={index} className="bg-rh-dark p-3 rounded border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono font-bold text-white">{update.symbol}</span>
                <span className={`px-2 py-1 text-xs rounded text-white ${getActionColor(update.action)}`}>
                  {update.action.toUpperCase()}
                </span>
              </div>
              <div className="text-sm text-gray-400">
                <span className="font-medium">{update.firm}</span>: {update.from} → {update.to}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Summary */}
      <div className="mb-6">
        <h3 className="font-semibold text-white mb-3">Market Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-green-900/20 p-3 rounded border border-green-400/30">
            <div className="text-green-400 font-semibold">S&P 500</div>
            <div className="text-white">+0.8% (4,567)</div>
          </div>
          <div className="bg-blue-900/20 p-3 rounded border border-blue-400/30">
            <div className="text-blue-400 font-semibold">NASDAQ</div>
            <div className="text-white">+1.2% (14,432)</div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <h3 className="font-semibold text-white mb-3">Upcoming Events</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-blue-400" />
            <span className="text-gray-300"><strong className="text-white">MSFT</strong> earnings on Jan 25</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-purple-400" />
            <span className="text-gray-300"><strong className="text-white">AAPL</strong> shareholder meeting on Feb 1</span>
          </div>
        </div>
      </div>
    </div>
  )
}
