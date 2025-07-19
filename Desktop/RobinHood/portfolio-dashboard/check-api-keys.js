#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    envVars[key.trim()] = value.trim();
  }
});

console.log('🔑 API Keys Configuration Status\n');
console.log('=' .repeat(50));

const apiChecks = [
  {
    name: 'Alpha Vantage (Stock Data)',
    key: 'NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY',
    required: true,
    status: '✅'
  },
  {
    name: 'Google Gemini AI',
    key: 'NEXT_PUBLIC_GEMINI_API_KEY', 
    required: true,
    status: '✅'
  },
  {
    name: 'NewsAPI',
    key: 'NEXT_PUBLIC_NEWS_API_KEY',
    required: false,
    status: '⏳'
  },
  {
    name: 'Reddit API Client ID',
    key: 'NEXT_PUBLIC_REDDIT_CLIENT_ID',
    required: false,
    status: '⏳'
  },
  {
    name: 'Reddit API Client Secret',
    key: 'NEXT_PUBLIC_REDDIT_CLIENT_SECRET',
    required: false,
    status: '⏳'
  },
  {
    name: 'Twitter Bearer Token',
    key: 'NEXT_PUBLIC_TWITTER_BEARER_TOKEN',
    required: false,
    status: '⏳'
  },
  {
    name: 'Finnhub API',
    key: 'NEXT_PUBLIC_FINNHUB_API_KEY',
    required: false,
    status: '⏳'
  },
  {
    name: 'Polygon.io API',
    key: 'NEXT_PUBLIC_POLYGON_API_KEY',
    required: false,
    status: '⏳'
  },
  {
    name: 'IEX Cloud API',
    key: 'NEXT_PUBLIC_IEX_API_KEY',
    required: false,
    status: '⏳'
  },
  {
    name: 'Financial Modeling Prep',
    key: 'NEXT_PUBLIC_FMP_API_KEY',
    required: false,
    status: '⏳'
  }
];

let configuredCount = 0;
let requiredCount = 0;
let requiredConfigured = 0;

apiChecks.forEach(check => {
  const value = envVars[check.key];
  const isConfigured = value && !value.includes('your_') && value !== '';
  
  if (check.required) {
    requiredCount++;
    if (isConfigured) requiredConfigured++;
  }
  
  if (isConfigured) configuredCount++;
  
  const status = isConfigured ? '✅ Configured' : 
                check.required ? '❌ Required' : '⏳ Optional';
  
  console.log(`${status.padEnd(15)} ${check.name}`);
});

console.log('\n' + '=' .repeat(50));
console.log(`📊 Summary:`);
console.log(`   Required APIs: ${requiredConfigured}/${requiredCount} configured`);
console.log(`   Total APIs: ${configuredCount}/${apiChecks.length} configured`);

if (requiredConfigured === requiredCount) {
  console.log('\n🎉 All required APIs are configured! Your dashboard should work.');
} else {
  console.log('\n⚠️  Some required APIs need configuration. Check API_SETUP_GUIDE.md');
}

console.log('\n📚 Next steps:');
console.log('   1. Run: npm run dev');
console.log('   2. Open: http://localhost:3000');
console.log('   3. Check browser console for any API errors');
console.log('   4. Set up optional APIs for enhanced features');

console.log('\n📖 For detailed setup instructions, see: API_SETUP_GUIDE.md');
