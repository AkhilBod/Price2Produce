import { NextResponse } from 'next/server'
import { stockService } from '@/services/stockService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const symbols = searchParams.get('symbols')?.split(',') || []
    
    if (symbols.length === 0) {
      return NextResponse.json({ error: 'No symbols provided' }, { status: 400 })
    }

    console.log('Fetching stock data for:', symbols)
    
    // Try to fetch real data with a reasonable timeout
    const timeoutPromise = new Promise<null>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 15000) // 15 second timeout
    )

    try {
      const stockDataPromise = stockService.getMultipleStockPrices(symbols)
      const stockData = await Promise.race([stockDataPromise, timeoutPromise])
      
      if (stockData) {
        // Mix real data with demo fallbacks
        const results = stockData.map((data, index) => 
          data || stockService.getDemoStockPrice(symbols[index])
        )

        // Check if we got at least some real data
        const realDataCount = results.filter(r => r.lastUpdated !== stockData.find(d => d?.symbol === r.symbol)?.lastUpdated).length
        
        console.log(`Successfully fetched ${realDataCount}/${symbols.length} real stock prices`)
        return NextResponse.json({ 
          data: results,
          source: realDataCount > 0 ? 'mixed' : 'demo',
          realDataCount
        })
      }
    } catch (error) {
      console.warn('Real stock data fetch failed, using demo data:', error)
    }

    // Fallback to all demo data
    console.log('Using demo data for all symbols')
    const demoData = symbols.map(symbol => stockService.getDemoStockPrice(symbol))
    return NextResponse.json({ 
      data: demoData,
      source: 'demo',
      message: 'Using demo data - real data unavailable'
    })

  } catch (error) {
    console.error('Error in stocks API:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { symbol, shares, price } = body

  // Here you would typically save to a database
  console.log('Adding position:', { symbol, shares, price })

  return NextResponse.json({ 
    success: true, 
    message: `Added ${shares} shares of ${symbol} at $${price}` 
  })
}
