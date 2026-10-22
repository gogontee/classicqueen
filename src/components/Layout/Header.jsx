'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Users, Image as ImageIcon, Info, Phone, Home, UserPlus, Newspaper, LogIn, User as UserIcon, LayoutDashboard, LogOut, ChevronDown, Globe } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import VoteCountdown from '@/components/VoteCountdown'
import { useTranslations, useLocale } from 'next-intl'
import Cookies from 'js-cookie'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false)
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false)
  const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false)
  
  const dropdownRef = useRef(null)
  const mobileUserRef = useRef(null)
  const infoDropdownRef = useRef(null)
  
  const pathname = usePathname()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('Navigation')

  // Stable client reference — won't be recreated every render
  const supabase = useMemo(() => createClient(), [])

  // Only show the loading placeholder on the very first check.
  const firstLoadRef = useRef(true)

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load current user's profile
  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      if (firstLoadRef.current) setAuthLoading(true)

      try {
        const { data: authData } = await supabase.auth.getUser()
        if (cancelled) return

        if (!authData?.user) {
          setProfile(null)
        } else {
          const { data, error } = await supabase
            .from('users')
            .select('id, first_name, last_name, avatar_url, role, email')
            .eq('id', authData.user.id)
            .single()

          if (cancelled) return
          setProfile(error ? null : data)
        }
      } catch (err) {
        if (err?.name !== 'AbortError') {
          console.error('Profile load error:', err)
        }
      } finally {
        if (!cancelled && firstLoadRef.current) {
          setAuthLoading(false)
          firstLoadRef.current = false
        }
      }
    }

    loadProfile()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadProfile()
    })

    return () => {
      cancelled = true
      sub?.subscription?.unsubscribe?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
      if (mobileUserRef.current && !mobileUserRef.current.contains(e.target)) {
        setIsMobileUserMenuOpen(false)
      }
      if (infoDropdownRef.current && !infoDropdownRef.current.contains(e.target)) {
        setIsInfoDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    setIsMobileUserMenuOpen(false)
    setIsMenuOpen(false)
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const handleLanguageChange = (e) => {
    const newLocale = e.target.value
    Cookies.set('NEXT_LOCALE', newLocale, { expires: 365 })
    router.refresh()
  }

  const navItems = [
    { name: t('home'), path: '/', icon: Home },
    { name: t('register'), path: '/register', icon: UserPlus },
    { name: t('candidates'), path: '/candidates', icon: Users },
    { name: t('gallery'), path: '/gallery', icon: ImageIcon },
    { name: t('news'), path: '/news', icon: Newspaper },
  ]

  const infoItems = [
    { name: t('about'), path: '/about', icon: Info },
    { name: t('contact'), path: '/contact', icon: Phone },
  ]

  const initials =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
      : profile?.email?.[0]?.toUpperCase() || '?'

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-brown-900/95 backdrop-blur-sm shadow-xl' : 'bg-brown-900'
      }`}
    >
      <div className="px-0">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group ml-4 flex-shrink-0">
            <div className="relative">
              <div className="relative w-16 h-16 md:w-20 md:h-20">
                {!imgError ? (
                  <Image
                    src="https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/Untitled%20design%20(2).png"
                    alt="Classic Queen International Logo"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 86px, 100px"
                    priority
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Image
                    src="/cqi.png"
                    alt="Classic Queen International Logo"
                    fill
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 86px, 100px"
                    priority
                  />
                )}
              </div>
            </div>
          </Link>

          {/* Mobile-only countdown — sits between logo and the right cluster */}
          <div className="lg:hidden flex-1 flex items-center justify-center px-2 min-w-0">
            <VoteCountdown variant="dark" />
          </div>

          {/* Desktop Nav */}
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

            {/* Info Dropdown */}
            <div className="relative" ref={infoDropdownRef}>
              <button
                onClick={() => setIsInfoDropdownOpen(!isInfoDropdownOpen)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 relative group ${
                  infoItems.some(i => i.path === pathname)
                    ? 'text-gold-400 bg-brown-800/50'
                    : 'text-brown-200 hover:text-gold-300 hover:bg-brown-800/30'
                }`}
              >
                <Info className="h-4 w-4" />
                <span className="font-medium">{t('info')}</span>
                <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${isInfoDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isInfoDropdownOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-[#1a0d02]/90 backdrop-blur-md border border-gold-500/40 rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] overflow-hidden z-50">
                  {infoItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setIsInfoDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-brown-50 hover:text-gold-300 hover:bg-[#362511]/90 transition text-sm font-medium"
                      >
                        <Icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="flex items-center gap-1.5 px-3 py-2 ml-2 rounded-lg border border-gold-500/30 bg-brown-800/30">
              <Globe size={14} className="text-gold-400" />
              <select
                onChange={handleLanguageChange}
                value={locale}
                className="bg-transparent text-sm font-medium outline-none cursor-pointer text-brown-200 hover:text-gold-300"
              >
                <option value="en" className="text-black">EN</option>
                <option value="fr" className="text-black">FR</option>
              </select>
            </div>

            {/* Desktop auth */}
            {authLoading ? (
              <div className="ml-4 w-[90px] h-9 rounded-lg bg-brown-800/50 animate-pulse" />
            ) : profile ? (
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  className="group relative flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full border border-gold-500/40 hover:border-gold-400 bg-brown-800/40 hover:bg-brown-800/70 transition-all duration-200 cursor-pointer"
                  aria-label="Open user menu"
                  aria-expanded={isDropdownOpen}
                >
                  {/* Avatar with subtle hover ring */}
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-gold-500/60 group-hover:border-gold-400 transition">
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-brown-700 flex items-center justify-center text-gold-300 text-xs font-bold">
                        {initials}
                      </div>
                    )}

                    <div className="absolute inset-0 rounded-full ring-2 ring-gold-400/0 group-hover:ring-gold-400/60 transition-all duration-200" />
                  </div>

                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-brown-900 shadow-sm group-hover:bg-gold-400 transition-colors">
                    <ChevronDown
                      size={12}
                      strokeWidth={3}
                      className={`transition-transform duration-200 ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#1a0d02]/90 backdrop-blur-md border border-gold-500/40 rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-gold-500/20 bg-[#2E1503]/90">
                      <p className="text-gold-300 text-sm font-semibold truncate">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-brown-100 text-[11px] truncate">
                        {profile.email}
                      </p>
                    </div>

                    <Link
                      href="/auth/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-brown-50 hover:text-gold-300 hover:bg-[#362511]/90 transition text-sm font-medium"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t('dashboard')}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-left text-brown-50 hover:text-red-300 hover:bg-[#362511]/90 transition text-sm font-medium border-t border-gold-500/20"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="ml-4 px-4 py-2 rounded-lg bg-gradient-to-r from-brown-500 to-brown-600 hover:from-brown-600 hover:to-brown-700 text-white transition-all duration-300 flex items-center space-x-1.5 shadow-md hover:shadow-lg"
              >
                <LogIn className="h-4 w-4" />
                <span className="text-sm font-medium">{t('login')}</span>
              </Link>
            )}
          </nav>

          {/* Mobile right cluster: user/login + menu button */}
          <div className="lg:hidden flex items-center gap-2 mr-4 flex-shrink-0">
            {authLoading ? (
              <div className="w-10 h-10 rounded-full bg-brown-800/50 animate-pulse" />
            ) : profile ? (
              <div className="relative" ref={mobileUserRef}>
                <button
                  onClick={() => setIsMobileUserMenuOpen((v) => !v)}
                  className="group relative flex items-center gap-1 pl-0.5 pr-1.5 py-0.5 rounded-full border border-gold-500/40 hover:border-gold-400 bg-brown-800/40 transition-all duration-200 cursor-pointer"
                  aria-label="Open user menu"
                  aria-expanded={isMobileUserMenuOpen}
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-gold-500/60 group-hover:border-gold-400 transition">
                    {profile.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_url}
                        alt={`${profile.first_name} ${profile.last_name}`}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-brown-700 flex items-center justify-center text-gold-300 text-xs font-bold">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center w-4 h-4 rounded-full bg-gold-500 text-brown-900 shadow-sm group-hover:bg-gold-400 transition-colors">
                    <ChevronDown
                      size={10}
                      strokeWidth={3}
                      className={`transition-transform duration-200 ${
                        isMobileUserMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {isMobileUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-[#1a0d02]/90 backdrop-blur-md border border-gold-500/40 rounded-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.7)] overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gold-500/20 bg-[#2E1503]/90">
                      <p className="text-gold-300 text-sm font-semibold truncate">
                        {profile.first_name} {profile.last_name}
                      </p>
                      <p className="text-brown-100 text-[11px] truncate">
                        {profile.email}
                      </p>
                    </div>

                    <Link
                      href="/auth/dashboard"
                      onClick={() => setIsMobileUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-brown-50 hover:text-gold-300 hover:bg-[#362511]/90 transition text-sm font-medium"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t('dashboard')}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-left text-brown-50 hover:text-red-300 hover:bg-[#362511]/90 transition text-sm font-medium border-t border-gold-500/20"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brown-500 to-brown-600 hover:from-brown-600 hover:to-brown-700 text-white transition-all duration-300 flex items-center space-x-1.5 shadow-md"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{t('login')}</span>
              </Link>
            )}

            {/* Menu toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-brown-200 hover:text-gold-400 hover:bg-brown-800/50 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav (drawer) */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-brown-700/50">
            <div className="space-y-1 pb-4">
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

              {/* Mobile Info Menu Accordion */}
              <div>
                <button
                  onClick={() => setIsMobileInfoOpen(!isMobileInfoOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-brown-200 hover:text-gold-300 hover:bg-brown-800/30 rounded-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-3">
                    <Info className="h-5 w-5" />
                    <span className="font-medium">{t('info')}</span>
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isMobileInfoOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMobileInfoOpen && (
                  <div className="pl-12 pr-4 py-1 space-y-1 bg-brown-900/50">
                    {infoItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          className="flex items-center space-x-3 px-4 py-2 rounded-lg text-brown-300 hover:text-gold-300 hover:bg-brown-800/30 transition-all duration-300 text-sm"
                          onClick={() => {
                            setIsMenuOpen(false)
                            setIsMobileInfoOpen(false)
                          }}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Mobile Language Switcher */}
              <div className="px-4 py-3 mt-2 border-t border-brown-700/50">
                <div className="flex items-center justify-between bg-brown-800/40 px-3 py-2 rounded-lg border border-gold-500/30">
                  <div className="flex items-center space-x-2 text-brown-200">
                    <Globe size={16} />
                    <span className="text-sm font-medium">Language</span>
                  </div>
                  <select
                    onChange={handleLanguageChange}
                    value={locale}
                    className="bg-transparent text-sm font-medium outline-none cursor-pointer text-gold-400"
                  >
                    <option value="en" className="text-black">English</option>
                    <option value="fr" className="text-black">Français</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header