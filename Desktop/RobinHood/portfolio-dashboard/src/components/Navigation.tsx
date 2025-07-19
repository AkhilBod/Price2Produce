'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Settings, PieChart, TrendingUp, Brain, Calendar } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/positions', label: 'Positions', icon: PieChart },
    { href: '/ai-assistant', label: 'AI Assistant', icon: Brain },
    { href: '/analysis', label: 'Analysis', icon: TrendingUp },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <nav style={{ backgroundColor: 'var(--rh-bg-secondary)', borderBottom: '1px solid var(--rh-border)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-white">
              RobinHood Portfolio
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'nav-active'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-300">
              Portfolio Value: <span className="font-bold" style={{ color: 'var(--rh-green)' }}>$5,415</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
