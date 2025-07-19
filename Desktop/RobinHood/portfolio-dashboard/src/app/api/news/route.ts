import { NextResponse } from 'next/server'
import { newsService, NewsItem } from '@/services/newsService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')?.split(',').filter(Boolean)
    const limit = parseInt(searchParams.get('limit') || '20')
    const category = searchParams.get('category') as 'market' | 'stock' | 'crypto' | 'earnings' | 'general' | undefined

    console.log('Fetching news with params:', { symbols, limit, category })

    // Get comprehensive news from all sources
    const allNews = await newsService.getComprehensiveNews(symbols, limit)

    // Filter by category if specified
    const filteredNews = category 
      ? allNews.filter(news => news.category === category)
      : allNews

    console.log(`Returning ${filteredNews.length} news items`)

    return NextResponse.json({
      news: filteredNews,
      sources: {
        reddit: true,
        newsapi: !!process.env.NEWS_API_KEY,
        finnhub: !!process.env.FINNHUB_API_KEY,
        alphavantage: !!process.env.ALPHA_VANTAGE_API_KEY
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('News API error:', error)
    
    // Return fallback news in case of error
    const fallbackNews: NewsItem[] = [
      {
        id: 'fallback_1',
        title: 'Market Update: Mixed Performance Across Sectors',
        summary: 'Stock markets showed mixed results today as investors digest recent economic data and corporate earnings reports.',
        url: '#',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sentiment: 'neutral',
        source: 'Market Wire',
        category: 'market'
      },
      {
        id: 'fallback_2',
        title: 'Technology Stocks Lead Market Recovery',
        summary: 'Major technology companies reported strong quarterly results, driving broader market optimism.',
        url: '#',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        sentiment: 'positive',
        source: 'Tech News',
        category: 'stock'
      },
      {
        id: 'fallback_3',
        title: 'Federal Reserve Signals Cautious Approach',
        summary: 'The Federal Reserve indicated a measured approach to future monetary policy decisions.',
        url: '#',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        sentiment: 'neutral',
        source: 'Financial Times',
        category: 'market'
      }
    ]

    return NextResponse.json({
      news: fallbackNews,
      sources: {
        reddit: false,
        newsapi: false,
        finnhub: false,
        alphavantage: false
      },
      error: 'Using fallback news data',
      timestamp: new Date().toISOString()
    })
  }
}
