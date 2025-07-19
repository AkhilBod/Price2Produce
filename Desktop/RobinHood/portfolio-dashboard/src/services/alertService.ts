// Alert management system for portfolio tracking

export interface PriceAlert {
  id: string
  symbol: string
  type: 'stop_loss' | 'profit_target' | 'price_target' | 'significant_move' | 'earnings'
  condition: 'above' | 'below' | 'change_percent'
  targetValue: number
  currentValue?: number
  isActive: boolean
  createdAt: string
  triggeredAt?: string
  message?: string
}

export interface AlertSettings {
  enablePushNotifications: boolean
  enableEmailNotifications: boolean
  significantMoveThreshold: number // percentage
  defaultStopLoss: number // percentage
  defaultProfitTarget: number // percentage
  checkInterval: number // minutes
}

class AlertService {
  private alerts: PriceAlert[] = []
  private settings: AlertSettings = {
    enablePushNotifications: true,
    enableEmailNotifications: false,
    significantMoveThreshold: 5, // 5% moves
    defaultStopLoss: 15, // 15% stop loss
    defaultProfitTarget: 20, // 20% profit target
    checkInterval: 5 // check every 5 minutes
  }

  // Load alerts from localStorage
  loadAlerts(): PriceAlert[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('portfolio_alerts')
      if (saved) {
        this.alerts = JSON.parse(saved)
      }
    }
    return this.alerts
  }

  // Save alerts to localStorage
  saveAlerts(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_alerts', JSON.stringify(this.alerts))
    }
  }

  // Create a new alert
  createAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>): PriceAlert {
    const newAlert: PriceAlert = {
      ...alert,
      id: Date.now().toString(),
      isActive: true,
      createdAt: new Date().toISOString()
    }
    
    this.alerts.push(newAlert)
    this.saveAlerts()
    return newAlert
  }

  // Create stop-loss alert for a position
  createStopLossAlert(symbol: string, costBasis: number, stopLossPercent: number): PriceAlert {
    const targetValue = costBasis * (1 - stopLossPercent / 100)
    return this.createAlert({
      symbol,
      type: 'stop_loss',
      condition: 'below',
      targetValue,
      message: `${symbol} stop-loss at $${targetValue.toFixed(2)} (-${stopLossPercent}%)`
    })
  }

  // Create profit-taking alert
  createProfitTargetAlert(symbol: string, costBasis: number, profitPercent: number): PriceAlert {
    const targetValue = costBasis * (1 + profitPercent / 100)
    return this.createAlert({
      symbol,
      type: 'profit_target',
      condition: 'above',
      targetValue,
      message: `${symbol} profit target at $${targetValue.toFixed(2)} (+${profitPercent}%)`
    })
  }

  // Create custom price target alert
  createPriceTargetAlert(symbol: string, targetPrice: number, condition: 'above' | 'below'): PriceAlert {
    return this.createAlert({
      symbol,
      type: 'price_target',
      condition,
      targetValue: targetPrice,
      message: `${symbol} ${condition} $${targetPrice.toFixed(2)}`
    })
  }

  // Check all alerts against current prices
  checkAlerts(stockPrices: { symbol: string, price: number, changePercent: number }[]): PriceAlert[] {
    const triggeredAlerts: PriceAlert[] = []

    this.alerts.forEach(alert => {
      if (!alert.isActive) return

      const stockData = stockPrices.find(stock => stock.symbol === alert.symbol)
      if (!stockData) return

      let isTriggered = false

      switch (alert.condition) {
        case 'above':
          isTriggered = stockData.price >= alert.targetValue
          break
        case 'below':
          isTriggered = stockData.price <= alert.targetValue
          break
        case 'change_percent':
          isTriggered = Math.abs(stockData.changePercent) >= alert.targetValue
          break
      }

      if (isTriggered) {
        alert.isActive = false
        alert.triggeredAt = new Date().toISOString()
        alert.currentValue = stockData.price
        triggeredAlerts.push(alert)
      }
    })

    // Check for significant moves
    stockPrices.forEach(stock => {
      if (Math.abs(stock.changePercent) >= this.settings.significantMoveThreshold) {
        const existingAlert = this.alerts.find(a => 
          a.symbol === stock.symbol && 
          a.type === 'significant_move' && 
          a.isActive &&
          new Date(a.createdAt).toDateString() === new Date().toDateString()
        )

        if (!existingAlert) {
          const alert = this.createAlert({
            symbol: stock.symbol,
            type: 'significant_move',
            condition: 'change_percent',
            targetValue: this.settings.significantMoveThreshold,
            currentValue: stock.price,
            message: `${stock.symbol} ${stock.changePercent >= 0 ? 'up' : 'down'} ${Math.abs(stock.changePercent).toFixed(1)}%`
          })
          triggeredAlerts.push(alert)
        }
      }
    })

    this.saveAlerts()
    return triggeredAlerts
  }

  // Show browser notification
  showNotification(alert: PriceAlert): void {
    if (!this.settings.enablePushNotifications) return

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${alert.symbol} Alert`, {
        body: alert.message || `${alert.symbol} ${alert.condition} $${alert.targetValue.toFixed(2)}`,
        icon: '/favicon.ico',
        tag: alert.id
      })
    }
  }

  // Request notification permission
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) return false

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return Notification.permission === 'granted'
  }

  // Get all alerts
  getAlerts(): PriceAlert[] {
    return this.alerts
  }

  // Get active alerts
  getActiveAlerts(): PriceAlert[] {
    return this.alerts.filter(alert => alert.isActive)
  }

  // Get triggered alerts from today
  getTodayTriggeredAlerts(): PriceAlert[] {
    const today = new Date().toDateString()
    return this.alerts.filter(alert => 
      alert.triggeredAt && 
      new Date(alert.triggeredAt).toDateString() === today
    )
  }

  // Delete an alert
  deleteAlert(alertId: string): void {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId)
    this.saveAlerts()
  }

  // Update alert settings
  updateSettings(newSettings: Partial<AlertSettings>): void {
    this.settings = { ...this.settings, ...newSettings }
    if (typeof window !== 'undefined') {
      localStorage.setItem('alert_settings', JSON.stringify(this.settings))
    }
  }

  // Load settings
  loadSettings(): AlertSettings {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('alert_settings')
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) }
      }
    }
    return this.settings
  }

  // Get settings
  getSettings(): AlertSettings {
    return this.settings
  }
}

export const alertService = new AlertService()
