# API Keys Setup Guide 🔑

This guide will help you set up all the API keys needed for your RobinHood-style portfolio dashboard. All APIs listed have free tiers that should be sufficient for personal use.

## 📊 Stock Data APIs

### 1. Alpha Vantage (Already configured)
- **Status**: ✅ Already set up
- **Limits**: 5 calls/min, 500 calls/day
- **URL**: https://www.alphavantage.co/support/#api-key

### 2. Polygon.io (Backup data source)
- **Status**: ✅ Configured
- **Limits**: 5 calls/min (free tier)
- **URL**: https://polygon.io/

### 3. Finnhub (Real-time financial data)
- **Status**: ✅ Configured
- **Limits**: 60 calls/min
- **URL**: https://finnhub.io/

### 4. Tiingo (Alternative data source)
- **Status**: ✅ Configured
- **Limits**: 500 requests/day
- **URL**: https://api.tiingo.com/

### 5. Financial Modeling Prep (Enhanced analytics)
- **Status**: ✅ Configured
- **Limits**: 250 requests/day
- **URL**: https://financialmodelingprep.com/

## 🤖 AI Services

### 1. Google Gemini AI (Already configured)
- **Status**: ✅ Already set up
- **Limits**: 15 requests/min, 1500/day
- **URL**: https://aistudio.google.com/app/apikey

## 📰 News APIs

### 1. NewsAPI (General financial news)
- **Status**: ✅ Configured
- **Limits**: 1000 requests/month (free)
- **URL**: https://newsapi.org/

### 2. Reddit API (Social sentiment)
- **Status**: ✅ Configured
- **Limits**: 100 requests/min
- **URL**: https://www.reddit.com/prefs/apps

### 3. Twitter API v2 (Market sentiment)
- **Status**: ✅ Configured (Limited Plan)
- **Limits**: 100 requests/month
- **URL**: https://developer.twitter.com/en/portal/dashboard

## 💰 Additional Financial APIs

### 1. Financial Modeling Prep (Already configured above)

## 🔔 Notification Services

### 1. Discord Webhook
- **Status**: ✅ Configured
- **Purpose**: Send portfolio alerts to Discord
- **URL**: Webhook configured for real-time alerts

## 📧 Email Alerts

### Gmail SMTP Setup
- **Status**: ✅ Configured
- **Purpose**: Send email alerts for important portfolio changes
- **Configuration**: SMTP properly configured with app password

## 🚀 Current Status Summary

**✅ Fully Configured APIs:**
- Alpha Vantage (Stock Data)
- Google Gemini AI (Trading Recommendations)
- NewsAPI (Financial News)
- Reddit API (Social Sentiment)
- Twitter API (Limited - 100 calls/month)
- Finnhub (Real-time Data)
- Polygon.io (Backup Data)
- Financial Modeling Prep (Analytics)
- Tiingo (Alternative Data)
- Discord Webhook (Alerts)
- Gmail SMTP (Email Alerts)

**🎯 Portfolio Focus:**
Your news feed is configured to prioritize content relevant to your holdings:
- AAPL, SOUN, IONQ, PLTR, NVDA, OKLO, TMC, BBAI

## 🛠️ Testing Your Setup

After setting up APIs, you can test them:

```bash
# Test the dashboard
npm run dev

# Check API connectivity in browser console
# Navigate to: http://localhost:3000
```

## 📝 Notes

- **Free Tier Limits**: All APIs have generous free tiers suitable for personal use
- **Rate Limiting**: The app includes automatic rate limiting and fallbacks
- **API Rotation**: Multiple stock APIs ensure reliability if one fails
- **Security**: Never commit API keys to version control
- **Costs**: With free tiers, your monthly cost should be $0

## 🆘 Support

If you encounter issues:
1. Check API key format (no spaces, correct length)
2. Verify API endpoints are accessible
3. Check rate limits in API dashboards
4. Review browser console for error messages

Happy trading! 📈
