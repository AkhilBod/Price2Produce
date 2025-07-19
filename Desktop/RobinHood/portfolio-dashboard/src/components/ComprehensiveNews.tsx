'use client'

import { useState, useEffect } from 'react'
import { NewsItem } from '@/services/newsService'

interface NewsCardProps {
  news: NewsItem
}

const NewsCard = ({ news }: NewsCardProps) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-400 bg-green-400/10'
      case 'negative': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'market': return '📊'
      case 'stock': return '📈'
      case 'crypto': return '₿'
      case 'earnings': return '💰'
      default: return '📰'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date().getTime()
    const published = new Date(dateString).getTime()
    const diffInMinutes = Math.floor((now - published) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800 hover:border-gray-700 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(news.category)}</span>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="font-medium">{news.source}</span>
            {news.author && (
              <>
                <span>•</span>
                <span>{news.author}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(news.sentiment)}`}>
            {news.sentiment}
          </span>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(news.publishedAt)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex gap-4">
        {news.imageUrl && (
          <img 
            src={news.imageUrl} 
            alt={news.title}
            className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-medium text-sm line-clamp-2 mb-2 group-hover:text-green-400 transition-colors">
            {news.title}
          </h3>
          {news.summary && (
            <p className="text-gray-400 text-xs line-clamp-2 mb-3">
              {news.summary}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {news.symbol && (
            <span className="px-2 py-1 bg-gray-800 rounded text-green-400 font-mono">
              ${news.symbol}
            </span>
          )}
          {news.engagement && (
            <div className="flex items-center gap-3">
              {news.engagement.upvotes && (
                <span className="flex items-center gap-1">
                  ⬆️ {news.engagement.upvotes}
                </span>
              )}
              {news.engagement.comments && (
                <span className="flex items-center gap-1">
                  💬 {news.engagement.comments}
                </span>
              )}
            </div>
          )}
        </div>
        
        {news.url !== '#' && (
          <button
            onClick={() => window.open(news.url, '_blank')}
            className="text-green-400 hover:text-green-300 text-xs font-medium transition-colors"
          >
            Read more →
          </button>
        )}
      </div>
    </div>
  )
}

interface ComprehensiveNewsProps {
  symbols?: string[]
  limit?: number
  showFilters?: boolean
}

export default function ComprehensiveNews({ 
  symbols = [], 
  limit = 20, 
  showFilters = true 
}: ComprehensiveNewsProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sources, setSources] = useState<any>({})
  const [refreshing, setRefreshing] = useState(false)

  const categories = [
    { value: 'all', label: 'All News', icon: '📰' },
    { value: 'market', label: 'Market', icon: '📊' },
    { value: 'stock', label: 'Stocks', icon: '📈' },
    { value: 'earnings', label: 'Earnings', icon: '💰' },
    { value: 'crypto', label: 'Crypto', icon: '₿' },
    { value: 'general', label: 'General', icon: '🌐' }
  ]

  const fetchNews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const params = new URLSearchParams({
        limit: limit.toString()
      })
      
      if (symbols.length > 0) {
        params.append('symbols', symbols.join(','))
      }
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/news?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setNews(data.news || [])
      setSources(data.sources || {})
      
      if (data.error) {
        setError(`Warning: ${data.error}`)
      }
    } catch (err) {
      console.error('Error fetching news:', err)
      setError('Failed to load news')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [symbols, selectedCategory, limit])

  const handleRefresh = () => {
    fetchNews(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-2">📰 Market News</h2>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>Sources:</span>
            {sources.reddit && <span className="text-green-400">Reddit ✓</span>}
            {sources.newsapi && <span className="text-green-400">NewsAPI ✓</span>}
            {sources.finnhub && <span className="text-green-400">Finnhub ✓</span>}
            {sources.alphavantage && <span className="text-green-400">Alpha Vantage ✓</span>}
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm"
        >
          {refreshing ? '⟳ Refreshing...' : '↻ Refresh'}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === category.value
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-3">
          <div className="flex items-center gap-2 text-yellow-400 text-sm">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                </div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News Grid */}
      {!loading && news.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && news.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📰</div>
          <h3 className="text-lg font-medium text-white mb-2">No news found</h3>
          <p className="text-gray-400 text-sm">
            {selectedCategory !== 'all' 
              ? `No ${selectedCategory} news available at the moment.`
              : 'No news available at the moment.'
            }
          </p>
        </div>
      )}
    </div>
  )
}
