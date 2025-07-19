# Twitter API Quota Management (100 calls/month limit)

## Current Limitations
- **Monthly Limit**: 100 API calls
- **Daily Budget**: ~3 calls per day maximum
- **Conservative Strategy**: 1 call every 3 days to ensure we don't exceed quota

## Optimized Usage Strategy

### When Twitter API is Called
- ✅ **Weekdays only** (Monday-Friday)
- ✅ **Every 3rd day** (to stay well under monthly limit)
- ✅ **Only for primary portfolio holding** (highest value stock)
- ✅ **High-engagement tweets only** (min 20 engagements)

### What We Query
- **Single Stock Focus**: Only the most valuable portfolio position
- **Quality Filter**: `min_retweets:10 OR min_faves:50`
- **Language Filter**: English only
- **No Retweets**: Original content only

### Fallback Strategy
When Twitter quota is reached or unavailable:
- ✅ Reddit API (unlimited)
- ✅ NewsAPI (1000 calls/month)
- ✅ Finnhub (60 calls/minute)
- ✅ Alpha Vantage (500 calls/day)

## Monthly Usage Tracking

### January 2025
- [ ] Week 1: 0/25 calls used
- [ ] Week 2: 0/25 calls used  
- [ ] Week 3: 0/25 calls used
- [ ] Week 4: 0/25 calls used

### Tips to Maximize Value
1. **Use only during market volatility** - Save calls for when social sentiment matters most
2. **Focus on earnings announcements** - High-impact events where Twitter sentiment is valuable
3. **Monitor engagement thresholds** - Only process tweets with meaningful engagement
4. **Cache results** - Store Twitter sentiment data locally to avoid re-fetching

## Alternative Solutions
If 100 calls/month proves insufficient:
1. **Twitter API Basic** ($100/month) - 10,000 tweets/month
2. **Focus on Reddit/News** - Free alternatives with good market sentiment
3. **Manual Social Monitoring** - Check Twitter manually during key events
4. **Webhook Integration** - Set up alerts for specific Twitter events

## Implementation Notes
- Twitter API calls are logged with timestamps
- Smart rate limiting prevents accidental quota depletion
- Graceful fallback to other news sources when Twitter unavailable
- User notifications when Twitter data is limited due to quota

## ROI Assessment
With only 100 calls/month, Twitter provides:
- **High Value**: During earnings, major news events
- **Medium Value**: Regular market sentiment tracking
- **Low Value**: General market chatter, low-engagement tweets

**Recommendation**: Use sparingly for high-impact events only.
