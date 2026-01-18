'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Users, Image as ImageIcon, Info, Phone, Home, UserPlus, ShoppingBag, Newspaper } from 'lucide-react'
import Image from 'next/image'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Register', path: '/register', icon: UserPlus },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Gallery', path: '/gallery', icon: ImageIcon },
    { name: 'News', path: '/news', icon: Newspaper },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
  ]
  

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-brown-900/95 backdrop-blur-sm shadow-xl' 
          : 'bg-brown-900'
      }`}
    >
      <div className="px-0">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-3 group ml-4">
            <div className="relative">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                <Image
                  src="https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/Untitled%20design%20(2).png"
                  alt="Classic Queen International Logo"
                  fill
                  className="object-contain transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 86px, 100px"
                  priority
                />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 mr-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 relative group ${
                    isActive
                      ? 'text-gold-400 bg-brown-800/50'
                      : 'text-brown-200 hover:text-gold-300 hover:bg-brown-800/30'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                  
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gold-500 rounded-full" />
                  )}
                  
                  <div className="absolute inset-0 border border-gold-500/0 group-hover:border-gold-500/30 rounded-lg transition-all duration-300" />
                </Link>
              )
            })}
            
            {/* Queens Mall Button (Desktop) */}
            <Link
              href="/queens-mall"
              className="ml-4 px-3 py-1.5 bg-gradient-to-r from-brown-500 to-brown-600 hover:from-brown-800 hover:to-brown-700 text-white rounded-lg transition-all duration-300 flex items-center space-x-1.5 shadow-md hover:shadow-lg"
            >
              <ShoppingBag size={12} />
              <span className="text-xs font-medium">Queens Mall</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-brown-200 hover:text-gold-400 hover:bg-brown-800/50 transition-colors duration-300 mr-4"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-brown-700/50">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.path
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'text-gold-400 bg-brown-800/50'
                        : 'text-brown-200 hover:text-gold-300 hover:bg-brown-800/30'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-gold-500 rounded-full" />
                    )}
                  </Link>
                )
              })}
              
              <Link
                href="/queens-mall"
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-brown-500 to-brown-600 hover:from-brown-600 hover:to-brown-700 text-white rounded-lg font-medium transition-colors duration-300 shadow-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingBag size={14} />
                <span className="text-sm">Queens Mall</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header