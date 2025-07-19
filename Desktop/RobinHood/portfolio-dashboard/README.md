# Portfolio Health Dashboard

A comprehensive stock portfolio management dashboard built with Next.js, TypeScript, and Tailwind CSS. Perfect for tracking your investments, managing risk, and getting intelligent insights.

## 🚀 Features

### Portfolio Health Dashboard
- **Real-time P&L tracking** - Monitor your current positions with live updates
- **Cost basis vs current price** - See exactly how your investments are performing
- **Portfolio diversification analysis** - Understand your sector allocation and concentration risk
- **Risk management alerts** - Get notified when positions become too large

### Smart Exit Signals
- **Personalized stop-losses** - Set automatic triggers based on your risk tolerance
- **Profit-taking alerts** - Get notified when stocks hit your target gains
- **"Dead money" detector** - Identify stocks that have been sideways for weeks
- **Earnings date reminders** - Never miss important events with historical volatility data

### Daily Intelligence Reports
- **Morning briefings** - Overnight news affecting YOUR specific stocks
- **Sector performance** - See how your sectors are performing vs the market
- **Insider trading activity** - Track insider movements on your positions
- **Analyst upgrades/downgrades** - Get updates specifically for stocks you own

### Personalized Features
- **Trading pattern analysis** - Learn from your past trades and spot patterns
- **"Mistake tracker"** - Analyze your trading history to improve
- **Position sizing calculator** - Based on your account size and risk tolerance
- **Tax loss harvesting** - Identify opportunities to optimize your taxes

### Smart Notifications
- **Context-rich alerts** - "AAPL down 3% on chip shortage news"
- **Significance filtering** - Only get alerted on moves that matter (not every 1% change)
- **Weekly performance summaries** - Actionable insights delivered weekly
- **Customizable frequency** - Choose immediate, daily, or weekly updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Database**: SQLite (with Better SQLite3)
- **API**: Next.js API Routes

## 📦 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run the development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Getting Started

### Adding Your First Position

1. Navigate to the "Positions" page
2. Click "Add Position" 
3. Enter your stock symbol (e.g., AAPL)
4. Add the number of shares you own
5. Enter your cost basis (the price you paid)
6. Select your purchase date
7. Click "Save"

### Customizing Your Settings

1. Go to the "Settings" page
2. Set your risk management preferences:
   - Default stop loss percentage
   - Profit target percentage
   - Maximum position size
3. Configure your alert preferences
4. Choose your notification frequency
5. Save your settings

### Understanding the Dashboard

- **Portfolio Overview**: Shows your total value, gains/losses, and performance chart
- **Risk Alerts**: Displays warnings about concentration risk and other concerns
- **Exit Signals**: Smart recommendations for when to buy/sell
- **Daily Brief**: News and analyst updates affecting your stocks

## 📊 Sample Data

The app comes with sample data for demonstration:

- **AAPL**: 10 shares at $150 cost basis
- **TSLA**: 5 shares at $200 cost basis  
- **MSFT**: 8 shares at $280 cost basis

You can replace this with your real positions in the Positions page.
