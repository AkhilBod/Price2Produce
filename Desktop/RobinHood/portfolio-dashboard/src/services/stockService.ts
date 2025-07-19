// Stock data service for fetching real-time prices and market data

export interface StockPrice {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  high52Week?: number
  low52Week?: number
  lastUpdated: string
}

export interface StockNews {
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

class StockService {
  private apiKey: string
  private alphaVantageUrl = 'https://www.alphavantage.co/query'
  private finnhubUrl = 'https://finnhub.io/api/v1'

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || ''
  }

  // Get current stock price with multiple fallbacks
  async getStockPrice(symbol: string): Promise<StockPrice | null> {
    // Try multiple data sources with timeouts
    const sources = [
      () => this.getFromFinnhub(symbol),
      () => this.getFromAlphaVantage(symbol),
      () => this.getFromYahooFinance(symbol)
    ]

    for (const source of sources) {
      try {
        const result = await Promise.race([
          source(),
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 8000)
          )
        ])
        
        if (result) {
          console.log(`Successfully fetched ${symbol} data`)
          return result
        }
      } catch (error) {
        console.warn(`Source failed for ${symbol}:`, error)
        continue
      }
    }

    console.warn(`All sources failed for ${symbol}, using demo data`)
    return null
  }

  // Finnhub API (free tier, no API key needed for basic quotes)
  private async getFromFinnhub(symbol: string): Promise<StockPrice | null> {
    try {
      const [quoteResponse, candles] = await Promise.all([
        fetch(`${this.finnhubUrl}/quote?symbol=${symbol}`),
        fetch(`${this.finnhubUrl}/stock/candle?symbol=${symbol}&resolution=D&from=${Math.floor(Date.now()/1000) - 86400}&to=${Math.floor(Date.now()/1000)}`)
      ])

      const quote = await quoteResponse.json()
      const candleData = await candles.json()
      
      if (quote.c && quote.c > 0) {
        const price = quote.c
        const previousClose = quote.pc
        const change = price - previousClose
        const changePercent = (change / previousClose) * 100

        return {
          symbol,
          price: parseFloat(price.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: candleData.v?.[candleData.v.length - 1] || 0,
          high52Week: quote.h,
          low52Week: quote.l,
          lastUpdated: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error(`Finnhub error for ${symbol}:`, error)
    }
    return null
  }

  // Alpha Vantage API (fallback)
  private async getFromAlphaVantage(symbol: string): Promise<StockPrice | null> {
    if (!this.apiKey) return null
    
    try {
      const response = await fetch(
        `${this.alphaVantageUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.apiKey}`
      )
      
      const data = await response.json()
      const quote = data['Global Quote']
      
      if (!quote || Object.keys(quote).length === 0) {
        return null
      }

      const price = parseFloat(quote['05. price'] || '0')
      const change = parseFloat(quote['09. change'] || '0')
      const changePercent = parseFloat(quote['10. change percent']?.replace('%', '') || '0')

      return {
        symbol,
        price,
        change,
        changePercent,
        volume: parseInt(quote['06. volume'] || '0'),
        lastUpdated: quote['07. latest trading day'] || new Date().toISOString()
      }
    } catch (error) {
      console.error(`Alpha Vantage error for ${symbol}:`, error)
      return null
    }
  }

  // Yahoo Finance API (alternative free source)
  private async getFromYahooFinance(symbol: string): Promise<StockPrice | null> {
    try {
      // Using a CORS proxy for Yahoo Finance
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
      )
      
      const data = await response.json()
      const result = data.chart.result[0]
      
      if (result && result.meta && result.indicators.quote[0]) {
        const meta = result.meta
        const quote = result.indicators.quote[0]
        const close = quote.close[quote.close.length - 1]
        const previousClose = meta.previousClose
        const change = close - previousClose
        const changePercent = (change / previousClose) * 100

        return {
          symbol,
          price: parseFloat(close.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          volume: quote.volume[quote.volume.length - 1] || 0,
          lastUpdated: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error(`Yahoo Finance error for ${symbol}:`, error)
    }
    return null
  }

  // Get multiple stock prices in parallel
  async getMultipleStockPrices(symbols: string[]): Promise<(StockPrice | null)[]> {
    console.log('Fetching stock prices for:', symbols)
    
    // Fetch all symbols in parallel for speed
    const promises = symbols.map(symbol => this.getStockPrice(symbol))
    const results = await Promise.all(promises)
    
    console.log('Stock fetch results:', results.map(r => r ? `${r.symbol}: $${r.price}` : 'failed'))
    return results
  }

  // Get stock news from Alpha Vantage
  async getStockNews(symbol: string): Promise<StockNews[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${this.apiKey}&limit=5`
      )
      
      const data = await response.json()
      const articles = data.feed || []
      
      return articles.map((article: any) => ({
        title: article.title || '',
        summary: article.summary || '',
        url: article.url || '',
        source: article.source || '',
        publishedAt: article.time_published || '',
        sentiment: this.mapSentiment(article.overall_sentiment_score)
      }))
    } catch (error) {
      console.error(`Error fetching news for ${symbol}:`, error)
      return []
    }
  }

  private mapSentiment(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.15) return 'positive'
    if (score < -0.15) return 'negative'
    return 'neutral'
  }

  // Fallback to demo data if API fails or no key provided
  getDemoStockPrice(symbol: string): StockPrice {
    // Realistic demo data based on recent market trends
    const demoData: Record<string, StockPrice> = {
      'AAPL': {
        symbol: 'AAPL',
        price: 229.87,
        change: 2.45,
        changePercent: 1.08,
        volume: 45678123,
        high52Week: 237.23,
        low52Week: 164.08,
        lastUpdated: new Date().toISOString()
      },
      'SOUN': {
        symbol: 'SOUN',
        price: 15.23,
        change: 0.89,
        changePercent: 6.21,
        volume: 2345678,
        high52Week: 19.45,
        low52Week: 2.89,
        lastUpdated: new Date().toISOString()
      },
      'IONQ': {
        symbol: 'IONQ',
        price: 42.16,
        change: -1.87,
        changePercent: -4.25,
        volume: 1234567,
        high52Week: 76.28,
        low52Week: 8.90,
        lastUpdated: new Date().toISOString()
      },
      'PLTR': {
        symbol: 'PLTR',
        price: 89.45,
        change: -3.22,
        changePercent: -3.47,
        volume: 3456789,
        high52Week: 92.11,
        low52Week: 15.66,
        lastUpdated: new Date().toISOString()
      },
      'NVDA': {
        symbol: 'NVDA',
        price: 195.78,
        change: 8.91,
        changePercent: 4.77,
        volume: 28901234,
        high52Week: 200.43,
        low52Week: 108.13,
        lastUpdated: new Date().toISOString()
      },
      'OKLO': {
        symbol: 'OKLO',
        price: 34.50,
        change: 1.25,
        changePercent: 3.76,
        volume: 1567890,
        high52Week: 45.20,
        low52Week: 8.40,
        lastUpdated: new Date().toISOString()
      },
      'TMC': {
        symbol: 'TMC',
        price: 2.89,
        change: -0.15,
        changePercent: -4.93,
        volume: 892345,
        high52Week: 8.90,
        low52Week: 1.45,
        lastUpdated: new Date().toISOString()
      },
      'BBAI': {
        symbol: 'BBAI',
        price: 12.67,
        change: 0.34,
        changePercent: 2.76,
        volume: 456789,
        high52Week: 28.50,
        low52Week: 1.89,
        lastUpdated: new Date().toISOString()
      }
    }

    return demoData[symbol] || {
      symbol,
      price: 100 + Math.random() * 50, // Random price between 100-150
      change: (Math.random() - 0.5) * 10, // Random change between -5 to +5
      changePercent: (Math.random() - 0.5) * 10, // Random percent change
      volume: Math.floor(Math.random() * 1000000),
      lastUpdated: new Date().toISOString()
    }
  }
}

export const stockService = new StockService()
