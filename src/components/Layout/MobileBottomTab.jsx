'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Users, Image, ShoppingBag, UserPlus } from 'lucide-react'

const MobileBottomTab = () => {
  const pathname = usePathname()

  const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: UserPlus, label: 'Register', path: '/register' },
    { icon: Users, label: 'Contestants', path: '/candidates' },
    { icon: Image, label: 'Gallery', path: '/gallery' },
    { icon: ShoppingBag, label: 'Mall', path: '/queens-mall' },
  ]

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brown-900 border-t border-brown-700 z-40 shadow-2xl">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          const Icon = tab.icon
          
          return (
            <Link
              key={tab.label}
              href={tab.path}
              className={`relative flex flex-col items-center justify-center p-2 ${
                isActive ? 'text-gold-400' : 'text-brown-300 hover:text-gold-300'
              }`}
            >
              <div className={`relative p-2 rounded-lg transition-all duration-300 ${
                isActive ? 'bg-brown-800/50' : ''
              }`}>
                <Icon size={22} />
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gold-500 rounded-full" />
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default MobileBottomTab