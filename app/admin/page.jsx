'use client'

import React, { useState, useEffect } from 'react'
import { 
  Database, Image as ImageIcon, Film, BarChart3, 
  Globe, Users, Trophy, Settings, Eye,
  Newspaper, Lock, LogOut, AlertCircle, CheckCircle
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

// Import all manager components
import HeroManager from '../../src/components/HeroManager'
import FeaturedPostsManager from '../../src/components/FeaturedPostsManager'
import StatsManager from '../../src/components/StatsManager'
import CountriesManager from '../../src/components/CountriesManager'
import GalleriesManager from '../../src/components/GalleriesManager'
import AlbumsManager from '../../src/components/AlbumsManager'
import NewsManagement from '../../src/components/NewsManagement'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('hero')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const tabs = [
    { id: 'hero', label: 'Hero Slider', icon: Film, color: 'blue' },
    { id: 'featured', label: 'Featured Posts', icon: ImageIcon, color: 'purple' },
    { id: 'stats', label: 'Statistics', icon: BarChart3, color: 'green' },
    { id: 'countries', label: 'ND Countries', icon: Globe, color: 'orange' },
    { id: 'galleries', label: 'Galleries', icon: Database, color: 'pink' },
    { id: 'albums', label: 'Albums', icon: Database, color: 'indigo' },
    { id: 'news', label: 'News', icon: Newspaper, color: 'red' },
  ]

  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = () => {
      const auth = localStorage.getItem('classicqueenAdminAuth')
      const authTime = localStorage.getItem('classicqueenAdminAuthTime')
      
      if (auth === 'true' && authTime) {
        // Check if session is less than 12 hours old
        const sessionAge = Date.now() - parseInt(authTime)
        const maxSessionAge = 12 * 60 * 60 * 1000 // 12 hours
        
        if (sessionAge < maxSessionAge) {
          setIsAuthenticated(true)
        } else {
          // Clear expired session
          localStorage.removeItem('classicqueenAdminAuth')
          localStorage.removeItem('classicqueenAdminAuthTime')
        }
      }
    }
    
    checkSession()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('Please enter a passcode')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Check if passcode exists in the classicqueen.passcode table
      // Try with schema first, then fallback to regular table
      let query = supabase
        .from('classicqueen')
        .select('passcode')
        .eq('passcode', password.trim())
        .single()

      const { data, error: supabaseError } = await query

      // If schema doesn't exist, try admin_passcodes table
      if (supabaseError && supabaseError.code === 'PGRST103') {
        const { data: altData, error: altError } = await supabase
          .from('admin_passcodes')
          .select('passcode')
          .eq('passcode', password.trim())
          .single()
        
        if (altError) {
          throw altError
        }
        
        if (altData && altData.passcode === password.trim()) {
          handleSuccessfulAuth()
          return
        }
      }

      if (supabaseError) {
        if (supabaseError.code === 'PGRST116') {
          // No matching passcode found
          setError('Incorrect passcode. Please try again.')
        } else {
          setError('Error verifying passcode. Please try again.')
        }
        console.error('Supabase error:', supabaseError)
        return
      }

      if (data && data.passcode === password.trim()) {
        handleSuccessfulAuth()
      } else {
        setError('Incorrect passcode. Please try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessfulAuth = () => {
    setIsAuthenticated(true)
    
    // Store authentication in localStorage for session persistence
    localStorage.setItem('classicqueenAdminAuth', 'true')
    localStorage.setItem('classicqueenAdminAuthTime', Date.now().toString())
    
    setError('')
    setPassword('')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('classicqueenAdminAuth')
    localStorage.removeItem('classicqueenAdminAuthTime')
    setPassword('')
    setActiveTab('hero')
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brown-900 via-brown-800 to-brown-950 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 text-white rounded-full mb-4 shadow-lg">
                <Database size={32} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Classic Queen Admin
              </h1>
              <p className="text-brown-200">
                Enter passcode to access the admin dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-brown-200 font-medium mb-2">
                  Admin Passcode
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (error) setError('')
                    }}
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white/10 text-white placeholder-brown-300"
                    placeholder="Enter admin passcode"
                    disabled={loading}
                    autoFocus
                  />
                  <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brown-300" />
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                    <span className="text-red-200 text-sm">{error}</span>
                  </div>
                )}

                <div className="mt-3 text-sm text-brown-300">
                  <p>Contact system administrator if you've forgotten the passcode</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Verifying...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Lock size={18} className="mr-2" />
                    Access Dashboard
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-brown-300">
                  <AlertCircle size={16} />
                  <span>For authorized personnel only</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-brown-300">
                  <CheckCircle size={16} />
                  <span>All activities are logged and monitored</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-b from-brown-50 via-white to-brown-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-brown-900 via-brown-800 to-brown-950 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg shadow-md">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl sm:text-2xl font-bold">
                  Classic Queen Admin Dashboard
                </h1>
                <p className="text-brown-200 text-sm mt-1">
                  Content Management System
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Authenticated</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors text-sm font-medium flex items-center gap-2 border border-white/20"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className="mb-8 bg-gradient-to-r from-gold-50 to-gold-100 rounded-xl p-5 border border-gold-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 text-white rounded-full flex items-center justify-center shadow-md">
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 className="font-bold text-brown-900 text-lg">Welcome to Admin Dashboard</h2>
              <p className="text-brown-700 text-sm">You can now manage all content for Classic Queen International</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-brown-600">
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  Session expires in 12 hours
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-brown-100 overflow-hidden">
            <div className="p-4 border-b border-brown-100">
              <h3 className="font-bold text-brown-900">Content Management</h3>
              <p className="text-brown-600 text-sm">Select a section to manage</p>
            </div>
            
            <nav className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-wrap gap-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-gold-50 to-gold-100 text-brown-900 border border-gold-200 shadow-sm' 
                        : 'text-brown-700 hover:bg-brown-50'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center
                      ${isActive 
                        ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-sm' 
                        : 'bg-brown-100 text-brown-600'
                      }
                    `}>
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow-lg rounded-xl border border-brown-100 overflow-hidden">
          <div className="p-4 border-b border-brown-100 bg-gradient-to-r from-brown-50 to-brown-100">
            <div className="flex items-center gap-2">
              {(() => {
                const activeTabData = tabs.find(tab => tab.id === activeTab)
                if (activeTabData?.icon) {
                  const Icon = activeTabData.icon
                  return (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
                      <Icon size={18} className="text-white" />
                    </div>
                  )
                }
                return null
              })()}
              <div>
                <h2 className="font-bold text-brown-900 text-lg">
                  {tabs.find(tab => tab.id === activeTab)?.label || 'Dashboard'}
                </h2>
                <p className="text-brown-600 text-sm">
                  Manage {tabs.find(tab => tab.id === activeTab)?.label.toLowerCase() || 'content'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === 'hero' && <HeroManager />}
            {activeTab === 'featured' && <FeaturedPostsManager />}
            {activeTab === 'stats' && <StatsManager />}
            {activeTab === 'countries' && <CountriesManager />}
            {activeTab === 'galleries' && <GalleriesManager />}
            {activeTab === 'albums' && <AlbumsManager />}
            {activeTab === 'news' && <NewsManagement />}
            
            {/* Show message for tabs that don't have components yet */}
            {activeTab !== 'news' && !['hero', 'featured', 'stats', 'countries', 'galleries', 'albums'].includes(activeTab) && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brown-100 text-brown-600 rounded-full mb-4">
                  <Database size={24} />
                </div>
                <h3 className="text-xl font-bold text-brown-900 mb-2">Coming Soon</h3>
                <p className="text-brown-600 max-w-md mx-auto">
                  The {tabs.find(tab => tab.id === activeTab)?.label || 'selected'} management section is under development.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-brown-100">
          <div className="text-center text-sm text-brown-500">
            <p>© {new Date().getFullYear()} Classic Queen International. All rights reserved.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-2">
              <span className="flex items-center gap-1">
                <Database size={12} />
                Content Management System v1.0
              </span>
              <span className="hidden sm:block">•</span>
              <span>Session active - Auto logout in 12 hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}