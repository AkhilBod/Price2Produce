'use client'

import { useState } from 'react'
import { Bell, Shield, Target, TrendingUp, Save, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Risk Management
    stopLossPercentage: 15,
    profitTargetPercentage: 20,
    maxPositionSize: 25,
    
    // Alerts
    priceAlerts: true,
    newsAlerts: true,
    earningsReminders: true,
    analystUpdates: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    notificationFrequency: 'immediate', // immediate, daily, weekly
    
    // Trading Preferences
    riskTolerance: 'moderate', // conservative, moderate, aggressive
    investmentHorizon: 'medium', // short, medium, long
    
    // API Settings
    dataRefreshInterval: 15, // minutes
    enableRealTimeData: true,
  })

  const handleSave = () => {
    // Here you would save to localStorage or API
    console.log('Saving settings:', settings)
    alert('Settings saved successfully!')
  }

  return (
    <main className="min-h-screen bg-rh-dark p-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Settings & Preferences
          </h1>
          <p className="text-gray-400">
            Customize your dashboard, alerts, and risk management preferences
          </p>
        </header>

        <div className="space-y-6">
          {/* Risk Management Settings */}
          <div className="bg-rh-card rounded-lg shadow-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="text-rh-green" size={24} />
              <h2 className="text-xl font-bold text-white">Risk Management</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Stop Loss (%)
                </label>
                <input
                  type="number"
                  value={settings.stopLossPercentage}
                  onChange={(e) => setSettings({...settings, stopLossPercentage: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rh-green"
                  min="5"
                  max="50"
                />
                <p className="text-xs text-gray-400 mt-1">Automatic stop loss trigger</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profit Target (%)
                </label>
                <input
                  type="number"
                  value={settings.profitTargetPercentage}
                  onChange={(e) => setSettings({...settings, profitTargetPercentage: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rh-green"
                  min="10"
                  max="100"
                />
                <p className="text-xs text-gray-400 mt-1">Alert when target is reached</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Position Size (%)
                </label>
                <input
                  type="number"
                  value={settings.maxPositionSize}
                  onChange={(e) => setSettings({...settings, maxPositionSize: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rh-green"
                  min="5"
                  max="100"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum % of portfolio per stock</p>
              </div>
            </div>
          </div>

          {/* Alert Settings */}
          <div className="bg-rh-card rounded-lg shadow-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-rh-green" size={24} />
              <h2 className="text-xl font-bold text-white">Alert Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.priceAlerts}
                    onChange={(e) => setSettings({...settings, priceAlerts: e.target.checked})}
                    className="w-4 h-4 text-rh-green bg-rh-dark border-gray-600 rounded focus:ring-rh-green"
                  />
                  <span className="text-gray-300">Price Movement Alerts</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.newsAlerts}
                    onChange={(e) => setSettings({...settings, newsAlerts: e.target.checked})}
                    className="w-4 h-4 text-rh-green bg-rh-dark border-gray-600 rounded focus:ring-rh-green"
                  />
                  <span className="text-gray-300">News & Market Updates</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.earningsReminders}
                    onChange={(e) => setSettings({...settings, earningsReminders: e.target.checked})}
                    className="w-4 h-4 text-rh-green bg-rh-dark border-gray-600 rounded focus:ring-rh-green"
                  />
                  <span className="text-gray-300">Earnings Reminders</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.analystUpdates}
                    onChange={(e) => setSettings({...settings, analystUpdates: e.target.checked})}
                    className="w-4 h-4 text-rh-green bg-rh-dark border-gray-600 rounded focus:ring-rh-green"
                  />
                  <span className="text-gray-300">Analyst Updates</span>
                </label>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notification Frequency
                  </label>
                  <select
                    value={settings.notificationFrequency}
                    onChange={(e) => setSettings({...settings, notificationFrequency: e.target.value})}
                    className="w-full px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rh-green"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="daily">Daily Summary</option>
                    <option value="weekly">Weekly Summary</option>
                  </select>
                </div>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                    className="w-4 h-4 text-rh-green bg-rh-dark border-gray-600 rounded focus:ring-rh-green"
                  />
                  <span className="text-gray-300">Email Notifications</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                    className="w-4 h-4 text-rh-green bg-rh-dark border-gray-600 rounded focus:ring-rh-green"
                  />
                  <span className="text-gray-300">Push Notifications</span>
                </label>
              </div>
            </div>
          </div>

          {/* Trading Preferences */}
          <div className="bg-rh-card rounded-lg shadow-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="text-rh-green" size={24} />
              <h2 className="text-xl font-bold text-white">Trading Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Risk Tolerance
                </label>
                <select
                  value={settings.riskTolerance}
                  onChange={(e) => setSettings({...settings, riskTolerance: e.target.value})}
                  className="w-full px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rh-green"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Affects AI recommendations</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Investment Horizon
                </label>
                <select
                  value={settings.investmentHorizon}
                  onChange={(e) => setSettings({...settings, investmentHorizon: e.target.value})}
                  className="w-full px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rh-green"
                >
                  <option value="short">Short-term (&lt; 1 year)</option>
                  <option value="medium">Medium-term (1-5 years)</option>
                  <option value="long">Long-term (&gt; 5 years)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">Influences strategy recommendations</p>
              </div>
            </div>
          </div>

          {/* Data & Performance */}
          <div className="bg-rh-card rounded-lg shadow-lg p-6 border border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-rh-green" size={24} />
              <h2 className="text-xl font-bold text-white">Data & Performance</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Refresh Interval (minutes)
                </label>
                <select
                  value={settings.dataRefreshInterval}
                  onChange={(e) => setSettings({...settings, dataRefreshInterval: Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-rh-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-rh-green"
                >
                  <option value={1}>1 minute</option>
                  <option value={5}>5 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.enableRealTimeData}
                    onChange={(e) => setSettings({...settings, enableRealTimeData: e.target.checked})}
                    className="w-4 h-4 text-rh-green bg-rh-dark border-gray-600 rounded focus:ring-rh-green"
                  />
                  <span className="text-gray-300">Enable Real-time Data</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-rh-green text-rh-dark rounded-lg hover:bg-green-400 font-semibold transition-colors"
            >
              <Save size={20} />
              Save Settings
            </button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-400 mt-1" size={20} />
              <div>
                <h3 className="font-medium text-yellow-400">Important Note</h3>
                <p className="text-yellow-300 text-sm mt-1">
                  This is a demo application. In a production environment, these settings would be stored securely and integrated with real trading APIs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
