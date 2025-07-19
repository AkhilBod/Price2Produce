export interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  symbol?: string
  publishedAt: string
  sentiment: 'positive' | 'negative' | 'neutral'
  source: string
  imageUrl?: string
  author?: string
  category: 'market' | 'stock' | 'crypto' | 'earnings' | 'general'
  relevanceScore?: number
  engagement?: {
    upvotes?: number
    comments?: number
    shares?: number
  }
}

interface RedditPost {
  data: {
    id: string
    title: string
    selftext: string
    url: string
    created_utc: number
    score: number
    num_comments: number
    author: string
    subreddit: string
    permalink: string
    thumbnail?: string
  }
}

interface RedditResponse {
  data: {
    children: RedditPost[]
  }
}

export class NewsService {
  private readonly newsApiKey: string | null
  private readonly finnhubApiKey: string | null
  private readonly alphaVantageApiKey: string | null
  private readonly twitterBearerToken: string | null
  
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY || null
    this.finnhubApiKey = process.env.FINNHUB_API_KEY || null
    this.alphaVantageApiKey = process.env.ALPHA_VANTAGE_API_KEY || null
    this.twitterBearerToken = process.env.NEXT_PUBLIC_TWITTER_BEARER_TOKEN || null
  }

  // Get comprehensive news from multiple sources
  async getComprehensiveNews(symbols?: string[], limit: number = 20): Promise<NewsItem[]> {
    const newsPromises = [
      this.getRedditNews(symbols),
      this.getNewsApiData(symbols),
      this.getFinnhubNews(symbols),
      this.getAlphaVantageNews(symbols)
      // Twitter intentionally called separately due to strict quota limits
    ]

    try {
      const results = await Promise.allSettled(newsPromises)
      const allNews: NewsItem[] = []

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allNews.push(...result.value)
        } else {
          console.error(`News source ${index} failed:`, result.reason)
        }
      })

      // Add Twitter data only if quota allows and symbols are provided (more targeted)
      if (symbols && symbols.length > 0) {
        try {
          const twitterNews = await this.getTwitterSentiment(symbols.slice(0, 3)) // Limit to 3 symbols to conserve quota
          if (twitterNews.length > 0) {
            allNews.push(...twitterNews)
            console.log(`📊 Added ${twitterNews.length} Twitter insights for ${symbols.slice(0, 3).join(', ')} (quota used wisely)`)
          }
        } catch (error) {
          console.log('Twitter quota preserved, using other news sources')
        }
      }

      // Sort by relevance and recency, remove duplicates
      const uniqueNews = this.removeDuplicates(allNews)
      const sortedNews = this.sortAndLimitNews(uniqueNews, limit)
      
      // If symbols provided, prioritize portfolio-relevant news
      if (symbols && symbols.length > 0) {
        return this.prioritizePortfolioNews(sortedNews, symbols)
      }
      
      return sortedNews
    } catch (error) {
      console.error('Error fetching comprehensive news:', error)
      return this.getFallbackNews()
    }
  }

  // Prioritize news items that mention portfolio symbols
  private prioritizePortfolioNews(news: NewsItem[], symbols: string[]): NewsItem[] {
    const portfolioNews: NewsItem[] = []
    const otherNews: NewsItem[] = []
    
    news.forEach(item => {
      const content = (item.title + ' ' + item.summary).toLowerCase()
      const isRelevant = symbols.some(symbol => 
        content.includes(symbol.toLowerCase()) || 
        content.includes(`$${symbol.toLowerCase()}`) ||
        item.symbol === symbol
      )
      
      if (isRelevant) {
        // Boost relevance score for portfolio stocks
        item.relevanceScore = (item.relevanceScore || 0) + 15
        portfolioNews.push(item)
      } else {
        otherNews.push(item)
      }
    })
    
    // Return portfolio news first, then other news
    return [...portfolioNews, ...otherNews]
  }

  // Reddit API integration for market sentiment and discussions
  async getRedditNews(symbols?: string[]): Promise<NewsItem[]> {
    try {
      const subreddits = ['investing', 'stocks', 'SecurityAnalysis', 'ValueInvesting', 'StockMarket']
      const searches = symbols ? symbols.map(s => `$${s}`) : ['market', 'stocks', 'investing']
      
      const promises = subreddits.map(async (subreddit) => {
        // Reddit's JSON API (no auth required for public posts)
        const response = await fetch(
          `https://www.reddit.com/r/${subreddit}/hot.json?limit=10`,
          {
            headers: {
              'User-Agent': 'PortfolioDashboard/1.0'
            }
          }
        )
        
        if (!response.ok) return []
        
        const data: RedditResponse = await response.json()
        
        return data.data.children.map((post): NewsItem => ({
          id: `reddit_${post.data.id}`,
          title: post.data.title,
          summary: post.data.selftext.substring(0, 200) + '...',
          url: `https://reddit.com${post.data.permalink}`,
          publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
          sentiment: this.analyzeSentiment(post.data.title + ' ' + post.data.selftext),
          source: `r/${post.data.subreddit}`,
          author: post.data.author,
          category: 'market',
          imageUrl: post.data.thumbnail?.startsWith('http') ? post.data.thumbnail : undefined,
          engagement: {
            upvotes: post.data.score,
            comments: post.data.num_comments
          },
          relevanceScore: this.calculateRedditRelevance(post.data, symbols)
        }))
      })

      const results = await Promise.all(promises)
      return results.flat()
    } catch (error) {
      console.error('Reddit API error:', error)
      return []
    }
  }

  // NewsAPI integration for professional news sources
  async getNewsApiData(symbols?: string[]): Promise<NewsItem[]> {
    if (!this.newsApiKey) {
      console.log('NewsAPI key not found, skipping NewsAPI')
      return []
    }

    try {
      const query = symbols ? symbols.join(' OR ') : 'stock market OR investing OR finance'
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=15&apiKey=${this.newsApiKey}`,
        {
          headers: {
            'User-Agent': 'PortfolioDashboard/1.0'
          }
        }
      )

      if (!response.ok) {
        console.error('NewsAPI response not ok:', response.status)
        return []
      }

      const data = await response.json()
      
      return data.articles?.map((article: any): NewsItem => ({
        id: `newsapi_${Buffer.from(article.url).toString('base64').substring(0, 10)}`,
        title: article.title,
        summary: article.description || article.content?.substring(0, 200) + '...' || '',
        url: article.url,
        publishedAt: article.publishedAt,
        sentiment: this.analyzeSentiment(article.title + ' ' + article.description),
        source: article.source.name,
        author: article.author,
        category: this.categorizeNews(article.title + ' ' + article.description),
        imageUrl: article.urlToImage,
        relevanceScore: this.calculateNewsRelevance(article, symbols)
      })) || []
    } catch (error) {
      console.error('NewsAPI error:', error)
      return []
    }
  }

  // Finnhub news integration
  async getFinnhubNews(symbols?: string[]): Promise<NewsItem[]> {
    if (!this.finnhubApiKey) {
      console.log('Finnhub API key not found, skipping Finnhub news')
      return []
    }

    try {
      const newsPromises = []
      
      // General market news
      newsPromises.push(
        fetch(`https://finnhub.io/api/v1/news?category=general&token=${this.finnhubApiKey}`)
      )

      // Company-specific news if symbols provided
      if (symbols) {
        symbols.forEach(symbol => {
          newsPromises.push(
            fetch(`https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${this.getDateDaysAgo(7)}&to=${this.getToday()}&token=${this.finnhubApiKey}`)
          )
        })
      }

      const responses = await Promise.all(newsPromises)
      const results = await Promise.all(
        responses.map(async (response) => {
          if (response.ok) {
            return await response.json()
          }
          return []
        })
      )

      const allArticles = results.flat()
      
      return allArticles.map((article: any): NewsItem => ({
        id: `finnhub_${article.id || Buffer.from(article.url || '').toString('base64').substring(0, 10)}`,
        title: article.headline || article.title,
        summary: article.summary || '',
        url: article.url,
        publishedAt: new Date((article.datetime || article.publishedAt) * 1000).toISOString(),
        sentiment: this.analyzeSentiment(article.headline + ' ' + article.summary),
        source: article.source || 'Finnhub',
        category: 'stock',
        imageUrl: article.image,
        symbol: article.symbol,
        relevanceScore: this.calculateFinnhubRelevance(article, symbols)
      }))
    } catch (error) {
      console.error('Finnhub news error:', error)
      return []
    }
  }

  // Enhanced Alpha Vantage news
  async getAlphaVantageNews(symbols?: string[]): Promise<NewsItem[]> {
    if (!this.alphaVantageApiKey) {
      console.log('Alpha Vantage API key not found, skipping Alpha Vantage news')
      return []
    }

    try {
      const tickerQuery = symbols ? symbols.join(',') : 'AAPL,GOOGL,MSFT,TSLA,NVDA'
      const response = await fetch(
        `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${tickerQuery}&limit=20&apikey=${this.alphaVantageApiKey}`
      )

      if (!response.ok) return []

      const data = await response.json()
      const articles = data.feed || []

      return articles.map((article: any): NewsItem => ({
        id: `alphavantage_${article.url ? Buffer.from(article.url).toString('base64').substring(0, 10) : Math.random().toString(36).substring(2)}`,
        title: article.title || '',
        summary: article.summary || '',
        url: article.url || '',
        publishedAt: article.time_published || new Date().toISOString(),
        sentiment: this.mapSentiment(article.overall_sentiment_score || 0),
        source: article.source || 'Alpha Vantage',
        author: article.authors?.[0] || undefined,
        category: 'stock',
        imageUrl: article.banner_image,
        relevanceScore: this.calculateAlphaVantageRelevance(article, symbols)
      }))
    } catch (error) {
      console.error('Alpha Vantage news error:', error)
      return []
    }
  }

  // Twitter API integration for market sentiment (VERY LIMITED - 100 calls/month)
  async getTwitterSentiment(symbols?: string[]): Promise<NewsItem[]> {
    if (!this.twitterBearerToken) {
      console.log('Twitter Bearer Token not found, skipping Twitter sentiment analysis')
      return []
    }

    // Check if we should use Twitter API today (rate limiting)
    if (!this.shouldUseTwitterToday()) {
      console.log('Twitter API usage limited for today, skipping to preserve monthly quota')
      return []
    }

    try {
      // With only 100 calls/month, we can only do 1-2 calls per day maximum
      // Priority: Only check Twitter for major portfolio positions or during market events
      
      if (symbols && symbols.length > 0) {
        // Only check Twitter for the TOP portfolio holding to conserve API calls
        const primarySymbol = this.getPrimaryPortfolioSymbol(symbols)
        console.log(`Using precious Twitter API call for: ${primarySymbol}`)
        
        const tweets = await this.fetchTweetsForSymbol(primarySymbol)
        
        // Log API usage
        this.logTwitterAPIUsage()
        
        return tweets
      }

      return []
    } catch (error) {
      console.error('Twitter API error:', error)
      return []
    }
  }

  // Determine if we should use Twitter API today (rate limiting strategy)
  private shouldUseTwitterToday(): boolean {
    const today = new Date().getDate()
    const isWeekend = new Date().getDay() === 0 || new Date().getDay() === 6
    
    // Only use Twitter API on weekdays and only every 3rd day to stay under monthly limit
    // 100 calls/month = ~3 calls per day max, but safer to do 1 call every 3 days
    return !isWeekend && (today % 3 === 0)
  }

  // Get the most important symbol from portfolio (by value)
  private getPrimaryPortfolioSymbol(symbols: string[]): string {
    // Prioritize by likely portfolio value - could be made dynamic
    const priority = ['AAPL', 'NVDA', 'PLTR', 'IONQ', 'SOUN']
    
    for (const symbol of priority) {
      if (symbols.includes(symbol)) {
        return symbol
      }
    }
    
    return symbols[0] // Fallback to first symbol
  }

  // Log Twitter API usage for monitoring
  private logTwitterAPIUsage(): void {
    const today = new Date().toISOString().split('T')[0]
    console.log(`📊 Twitter API used on ${today} - Monitor monthly usage to stay under 100 calls`)
  }

  private async fetchTweetsForSymbol(symbol: string): Promise<NewsItem[]> {
    try {
      // CRITICAL: With only 100 API calls per month, we need to be very selective
      // Focus on high-impact, high-engagement tweets only
      const query = `($${symbol} OR ${this.getCompanyName(symbol)}) (min_retweets:10 OR min_faves:50) -is:retweet lang:en`
      
      const response = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=created_at,author_id,public_metrics,context_annotations&user.fields=verified`,
        {
          headers: {
            'Authorization': `Bearer ${this.twitterBearerToken}`,
            'User-Agent': 'PortfolioDashboard/1.0'
          }
        }
      )

      if (!response.ok) {
        console.error('Twitter API response not ok:', response.status, await response.text())
        return []
      }

      const data = await response.json()
      
      // Only return high-engagement tweets to maximize value from limited API calls
      return (data.data || [])
        .filter((tweet: any) => {
          const metrics = tweet.public_metrics || {}
          const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0)
          return engagement >= 20 // Only include tweets with decent engagement
        })
        .map((tweet: any): NewsItem => ({
          id: `twitter_${tweet.id}`,
          title: `💬 ${tweet.text.substring(0, 80)}${tweet.text.length > 80 ? '...' : ''}`,
          summary: tweet.text,
          url: `https://twitter.com/user/status/${tweet.id}`,
          symbol,
          publishedAt: tweet.created_at,
          sentiment: this.analyzeSentiment(tweet.text),
          source: 'Twitter (Limited)',
          category: 'stock',
          relevanceScore: this.calculateTwitterRelevance(tweet, symbol),
          engagement: {
            shares: tweet.public_metrics?.retweet_count || 0,
            comments: tweet.public_metrics?.reply_count || 0,
            upvotes: tweet.public_metrics?.like_count || 0
          }
        }))
    } catch (error) {
      console.error(`Error fetching Twitter data for ${symbol}:`, error)
      return []
    }
  }

  // Note: fetchMarketSentimentTweets removed due to API quota constraints (100 calls/month)

  private getCompanyName(symbol: string): string {
    const companyNames: Record<string, string> = {
      'AAPL': 'Apple',
      'SOUN': 'SoundHound',
      'IONQ': 'IonQ',
      'PLTR': 'Palantir',
      'NVDA': 'NVIDIA',
      'OKLO': 'Oklo',
      'TMC': 'TMC the metals company',
      'BBAI': 'BigBear.ai'
    }
    return companyNames[symbol] || symbol
  }

  private calculateTwitterRelevance(tweet: any, symbol: string): number {
    let score = 5 // Base relevance

    // Check if tweet mentions the specific symbol
    if (tweet.text.includes(`$${symbol}`)) {
      score += 10
    }

    // Check engagement metrics
    const metrics = tweet.public_metrics || {}
    const engagement = (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0)
    
    if (engagement > 100) score += 5
    if (engagement > 1000) score += 10

    // Check for verified account (would need user data expansion)
    // if (tweet.author?.verified) score += 3

    return score
  }

  // Sentiment analysis helper
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['bullish', 'up', 'gain', 'surge', 'profit', 'growth', 'strong', 'beat', 'exceed', 'optimistic', 'buy', 'rally']
    const negativeWords = ['bearish', 'down', 'loss', 'fall', 'decline', 'weak', 'miss', 'concern', 'pessimistic', 'sell', 'crash']
    
    const words = text.toLowerCase().split(/\W+/)
    let positiveCount = 0
    let negativeCount = 0
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++
      if (negativeWords.includes(word)) negativeCount++
    })
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  // News categorization
  private categorizeNews(text: string): 'market' | 'stock' | 'crypto' | 'earnings' | 'general' {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('earnings') || lowerText.includes('quarterly')) return 'earnings'
    if (lowerText.includes('bitcoin') || lowerText.includes('crypto')) return 'crypto'
    if (lowerText.includes('stock') || lowerText.includes('share')) return 'stock'
    if (lowerText.includes('market') || lowerText.includes('index')) return 'market'
    return 'general'
  }

  // Relevance scoring helpers
  private calculateRedditRelevance(post: RedditPost['data'], symbols?: string[]): number {
    let score = 0
    
    // Base score from engagement
    score += Math.min(post.score / 100, 5) // Max 5 points from upvotes
    score += Math.min(post.num_comments / 20, 3) // Max 3 points from comments
    
    // Symbol relevance
    if (symbols) {
      const content = (post.title + ' ' + post.selftext).toLowerCase()
      symbols.forEach(symbol => {
        if (content.includes(symbol.toLowerCase()) || content.includes(`$${symbol.toLowerCase()}`)) {
          score += 10
        }
      })
    }
    
    return score
  }

  private calculateNewsRelevance(article: any, symbols?: string[]): number {
    let score = 5 // Base relevance
    
    if (symbols) {
      const content = (article.title + ' ' + article.description).toLowerCase()
      symbols.forEach(symbol => {
        if (content.includes(symbol.toLowerCase())) {
          score += 10
        }
      })
    }
    
    return score
  }

  private calculateFinnhubRelevance(article: any, symbols?: string[]): number {
    let score = 7 // Higher base for financial news
    
    if (symbols && article.symbol && symbols.includes(article.symbol)) {
      score += 15
    }
    
    return score
  }

  private calculateAlphaVantageRelevance(article: any, symbols?: string[]): number {
    let score = 8 // High base for financial data provider
    
    if (symbols && article.ticker_sentiment) {
      article.ticker_sentiment.forEach((ticker: any) => {
        if (symbols.includes(ticker.ticker)) {
          score += 12
        }
      })
    }
    
    return score
  }

  // Helper functions
  private mapSentiment(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.15) return 'positive'
    if (score < -0.15) return 'negative'
    return 'neutral'
  }

  private getDateDaysAgo(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split('T')[0]
  }

  private getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  // Remove duplicate news items
  private removeDuplicates(news: NewsItem[]): NewsItem[] {
    const seen = new Set<string>()
    return news.filter(item => {
      const key = item.title.toLowerCase().trim()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  // Sort and limit news
  private sortAndLimitNews(news: NewsItem[], limit: number): NewsItem[] {
    return news
      .sort((a, b) => {
        // Sort by relevance score first, then by date
        const relevanceDiff = (b.relevanceScore || 0) - (a.relevanceScore || 0)
        if (relevanceDiff !== 0) return relevanceDiff
        
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      })
      .slice(0, limit)
  }

  // Fallback news for when APIs fail
  private getFallbackNews(): NewsItem[] {
    return [
      {
        id: 'fallback_1',
        title: 'Market Update: Tech Stocks Show Mixed Performance',
        summary: 'Technology stocks displayed varied performance today as investors weigh quarterly earnings results and market outlook.',
        url: '#',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sentiment: 'neutral',
        source: 'Market Wire',
        category: 'market'
      },
      {
        id: 'fallback_2',
        title: 'Federal Reserve Maintains Current Interest Rate Policy',
        summary: 'The Federal Reserve announced it will maintain current interest rates, citing ongoing economic stability and inflation targets.',
        url: '#',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        sentiment: 'neutral',
        source: 'Financial News',
        category: 'market'
      }
    ]
  }
}

export const newsService = new NewsService()
