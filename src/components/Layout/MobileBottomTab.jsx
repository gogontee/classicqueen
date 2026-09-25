'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Home, Users, Image as ImageIcon, UserPlus, LogIn, LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const MobileBottomTab = () => {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const tabs = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: UserPlus, label: 'Register', path: '/register' },
    { icon: Users, label: 'Contestants', path: '/candidates' },
    { icon: ImageIcon, label: 'Gallery', path: '/gallery' },
  ]

  // Load user profile + subscribe to auth changes
  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setAuthLoading(true)
      const { data: authData } = await supabase.auth.getUser()

      if (cancelled) return

      if (!authData?.user) {
        setProfile(null)
        setAuthLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, avatar_url, email')
        .eq('id', authData.user.id)
        .single()

      if (cancelled) return

      setProfile(error ? null : data)
      setAuthLoading(false)
    }

    loadProfile()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadProfile()
    })

    return () => {
      cancelled = true
      sub?.subscription?.unsubscribe?.()
    }
  }, [supabase])

  // Close the user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setUserMenuOpen(false)
    await supabase.auth.signOut()
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const initials =
    profile?.first_name && profile?.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
      : profile?.email?.[0]?.toUpperCase() || '?'

  return (
    <>
      {/* Popup user menu (opens above the tab bar) */}
      {userMenuOpen && profile && (
        <div
          ref={menuRef}
          className="lg:hidden fixed bottom-16 left-0 right-0 z-50 px-4 pb-2"
        >
          <div className="bg-brown-900/98 backdrop-blur border border-gold-500/30 rounded-xl shadow-2xl overflow-hidden max-w-sm mx-auto">
            <div className="px-4 py-3 border-b border-gold-500/20">
              <p className="text-gold-300 text-sm font-semibold truncate">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-brown-300 text-[11px] truncate">{profile.email}</p>
            </div>

            <Link
              href="/auth/dashboard"
              onClick={() => setUserMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-brown-200 hover:text-gold-300 hover:bg-brown-800/50 transition text-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              My Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-3 text-left text-brown-200 hover:text-red-300 hover:bg-brown-800/50 transition text-sm border-t border-gold-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brown-900 border-t border-brown-700 z-40 shadow-2xl">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path
            const Icon = tab.icon

            return (
              <Link
                key={tab.label}
                href={tab.path}
                className={`group relative flex flex-col items-center justify-center p-2 ${
                  isActive ? 'text-gold-400' : 'text-brown-300 hover:text-gold-300'
                }`}
              >
                {/* Hover label */}
                <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-brown-800 text-gold-300 text-[10px] font-semibold px-2 py-1 border border-gold-500/30 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                  {tab.label}
                </span>

                <div
                  className={`relative p-2 rounded-lg transition-all duration-300 ${
                    isActive ? 'bg-brown-800/50' : ''
                  }`}
                >
                  <Icon size={22} />
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gold-500 rounded-full" />
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </Link>
            )
          })}

          {/* Auth-aware tab */}
          {!authLoading && (
            <>
              {profile ? (
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className={`group relative flex flex-col items-center justify-center p-2 ${
                    userMenuOpen ? 'text-gold-400' : 'text-brown-300 hover:text-gold-300'
                  }`}
                  aria-label="Open user menu"
                >
                  {/* Hover label */}
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-brown-800 text-gold-300 text-[10px] font-semibold px-2 py-1 border border-gold-500/30 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                    Profile
                  </span>

                  <div
                    className={`relative p-2 rounded-lg transition-all duration-300 ${
                      userMenuOpen ? 'bg-brown-800/50' : ''
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-gold-500/60">
                      {profile.avatar_url ? (
                        <Image
                          src={profile.avatar_url}
                          alt={`${profile.first_name} ${profile.last_name}`}
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-brown-700 flex items-center justify-center text-gold-300 text-[9px] font-bold">
                          {initials}
                        </div>
                      )}
                    </div>
                    {userMenuOpen && (
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gold-500 rounded-full" />
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">Profile</span>
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  className={`group relative flex flex-col items-center justify-center p-2 ${
                    pathname === '/auth/login'
                      ? 'text-gold-400'
                      : 'text-brown-300 hover:text-gold-300'
                  }`}
                >
                  {/* Hover label */}
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-brown-800 text-gold-300 text-[10px] font-semibold px-2 py-1 border border-gold-500/30 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
                    Login
                  </span>

                  <div
                    className={`relative p-2 rounded-lg transition-all duration-300 ${
                      pathname === '/auth/login' ? 'bg-brown-800/50' : ''
                    }`}
                  >
                    <UserIcon size={22} />
                    {pathname === '/auth/login' && (
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-gold-500 rounded-full" />
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">Login</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default MobileBottomTab