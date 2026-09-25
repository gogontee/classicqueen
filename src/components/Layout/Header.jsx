'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, Users, Image as ImageIcon, Info, Phone, Home, UserPlus, Newspaper, LogIn, User as UserIcon, LayoutDashboard, LogOut } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobileUserRef = useRef(null)
  const pathname = usePathname()
  const router = useRouter()

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

  // Close desktop dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (mobileUserRef.current && !mobileUserRef.current.contains(e.target)) {
        setIsMobileUserMenuOpen(false)
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

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Register', path: '/register', icon: UserPlus },
    { name: 'Candidates', path: '/candidates', icon: Users },
    { name: 'Gallery', path: '/gallery', icon: ImageIcon },
    { name: 'News', path: '/news', icon: Newspaper },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Phone },
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
          <Link href="/" className="flex items-center space-x-3 group ml-4">
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

            {/* Desktop auth */}
            {authLoading ? (
              <div className="ml-4 w-[90px] h-9 rounded-lg bg-brown-800/50 animate-pulse" />
            ) : profile ? (
              <div className="relative ml-4" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen((v) => !v)}
                  className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gold-500/60 hover:border-gold-400 transition"
                  aria-label="Open user menu"
                >
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
                      My Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-left text-brown-50 hover:text-red-300 hover:bg-[#362511]/90 transition text-sm font-medium border-t border-gold-500/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
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
                <span className="text-sm font-medium">Login</span>
              </Link>
            )}
          </nav>

          {/* Mobile right cluster: user/login + menu button */}
          <div className="lg:hidden flex items-center gap-2 mr-4">
            {authLoading ? (
              <div className="w-10 h-10 rounded-full bg-brown-800/50 animate-pulse" />
            ) : profile ? (
              <div className="relative" ref={mobileUserRef}>
                <button
                  onClick={() => setIsMobileUserMenuOpen((v) => !v)}
                  className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gold-500/60 hover:border-gold-400 transition"
                  aria-label="Open user menu"
                >
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
                      My Dashboard
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-left text-brown-50 hover:text-red-300 hover:bg-[#362511]/90 transition text-sm font-medium border-t border-gold-500/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
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
                <span className="text-xs font-medium">Login</span>
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
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header