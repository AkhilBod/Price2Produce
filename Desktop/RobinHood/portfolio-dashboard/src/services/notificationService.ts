// Smart Notification System for AI Trading Alerts

export interface SmartNotification {
  id: string
  type: 'PRICE_ALERT' | 'AI_RECOMMENDATION' | 'NEWS_ALERT' | 'EARNINGS_REMINDER'
  symbol: string
  title: string
  message: string
  action_required: boolean
  urgency: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  read: boolean
  data?: any
}

class NotificationService {
  private notifications: SmartNotification[] = []
  private listeners: ((notifications: SmartNotification[]) => void)[] = []

  // Add a new smart notification
  addNotification(notification: Omit<SmartNotification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: SmartNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    this.notifications.unshift(newNotification)
    this.notifyListeners()

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      this.showBrowserNotification(newNotification)
    }

    // Auto-remove low priority notifications after 24 hours
    if (notification.urgency === 'low') {
      setTimeout(() => {
        this.removeNotification(newNotification.id)
      }, 24 * 60 * 60 * 1000)
    }
  }

  // Generate AI-powered price alert
  createPriceAlert(symbol: string, currentPrice: number, targetPrice: number, reasoning: string[]) {
    const isUp = currentPrice > targetPrice
    const percentChange = Math.abs(((currentPrice - targetPrice) / targetPrice) * 100)
    
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium'
    if (percentChange > 15) urgency = 'high'
    if (percentChange > 25) urgency = 'critical'

    const title = `${symbol} ${isUp ? '🚀' : '📉'} ${isUp ? 'Breakout' : 'Alert'}`
    const message = `${symbol} ${isUp ? 'surged to' : 'dropped to'} $${currentPrice.toFixed(2)} (${isUp ? '+' : ''}${percentChange.toFixed(1)}%)\n\n${reasoning.join('\n')}`

    this.addNotification({
      type: 'PRICE_ALERT',
      symbol,
      title,
      message,
      action_required: urgency === 'high' || urgency === 'critical',
      urgency,
      data: { currentPrice, targetPrice, percentChange }
    })
  }

  // Generate AI recommendation notification
  createAIRecommendation(symbol: string, action: string, confidence: number, reasoning: string[], reinvestmentSuggestions?: any[]) {
    const actionEmojis = {
      'BUY': '🎯',
      'SELL': '💰',
      'PARTIAL_SELL': '⚖️',
      'HOLD': '🤚'
    }

    const urgency = confidence > 80 ? 'high' : confidence > 60 ? 'medium' : 'low'
    
    let message = `AI recommends ${action} for ${symbol} (${confidence}% confidence)\n\n`
    message += reasoning.join('\n')

    if (reinvestmentSuggestions && reinvestmentSuggestions.length > 0) {
      message += '\n\n💡 Reinvestment Ideas:\n'
      reinvestmentSuggestions.forEach(suggestion => {
        message += `• ${suggestion.symbol} (${suggestion.allocation_percent}%) - ${suggestion.reasoning}\n`
      })
    }

    this.addNotification({
      type: 'AI_RECOMMENDATION',
      symbol,
      title: `${actionEmojis[action as keyof typeof actionEmojis]} AI: ${action} ${symbol}`,
      message,
      action_required: action !== 'HOLD',
      urgency,
      data: { action, confidence, reasoning, reinvestmentSuggestions }
    })
  }

  // Generate news-based alert
  createNewsAlert(symbol: string, headline: string, sentiment: 'positive' | 'negative' | 'neutral', impact: 'low' | 'medium' | 'high') {
    const sentimentEmojis = {
      'positive': '📈',
      'negative': '📉', 
      'neutral': '📰'
    }

    const urgency = impact === 'high' ? 'high' : impact === 'medium' ? 'medium' : 'low'

    this.addNotification({
      type: 'NEWS_ALERT',
      symbol,
      title: `${sentimentEmojis[sentiment]} ${symbol} News`,
      message: headline,
      action_required: impact === 'high',
      urgency,
      data: { headline, sentiment, impact }
    })
  }

  // Generate earnings reminder
  createEarningsReminder(symbol: string, earningsDate: Date, expectedVolatility: 'low' | 'medium' | 'high') {
    const daysUntil = Math.ceil((earningsDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    
    let urgency: 'low' | 'medium' | 'high' = 'low'
    if (daysUntil <= 2) urgency = 'medium'
    if (daysUntil <= 1) urgency = 'high'

    const volatilityWarning = expectedVolatility === 'high' ? '⚠️ High volatility expected' : ''

    this.addNotification({
      type: 'EARNINGS_REMINDER',
      symbol,
      title: `📅 ${symbol} Earnings in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
      message: `${symbol} reports earnings on ${earningsDate.toLocaleDateString()}. ${volatilityWarning}`,
      action_required: daysUntil <= 1,
      urgency,
      data: { earningsDate, expectedVolatility, daysUntil }
    })
  }

  private showBrowserNotification(notification: SmartNotification) {
    const browserNotification = new Notification(notification.title, {
      body: notification.message.split('\n')[0], // First line only
      icon: '/favicon.ico',
      tag: notification.symbol, // Prevent duplicate notifications for same symbol
      requireInteraction: notification.urgency === 'critical'
    })

    browserNotification.onclick = () => {
      window.focus()
      // Could navigate to specific page based on notification type
    }
  }

  // Subscribe to notification updates
  subscribe(callback: (notifications: SmartNotification[]) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]))
  }

  // Mark notification as read
  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      this.notifyListeners()
    }
  }

  // Remove notification
  removeNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id)
    this.notifyListeners()
  }

  // Get all notifications
  getNotifications(): SmartNotification[] {
    return [...this.notifications]
  }

  // Get unread count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  // Request browser notification permission
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  // Clear all notifications
  clearAll() {
    this.notifications = []
    this.notifyListeners()
  }
}

export const notificationService = new NotificationService()

// Auto-request permission when service loads
if (typeof window !== 'undefined') {
  notificationService.requestPermission()
}
