'use client'

import { useState, useEffect } from 'react'
import { Users, MapPin, Trophy, Crown, TrendingUp, Award, Star, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const Stats = () => {
  const [stats, setStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Map icon names to actual components
  const iconMap = {
    FiUser: Users,
    FiMapPin: MapPin,
    FiTrophy: Trophy,
    FaCrown: Crown,
    FiTrendingUp: TrendingUp,
    FiAward: Award,
    FiStar: Star,
    FiCalendar: Calendar
  }

  // Get icon component
  const getIconComponent = (iconName) => {
    return iconMap[iconName] || Trophy
  }

  // Fetch stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('classicqueen')
          .select('stats')
          .single()

        if (error) throw error

        if (data?.stats) {
          setStats(data.stats)
        } else {
          // Fallback data
          setStats([
            {
              "icon": "FiUser",
              "title": "Candidates",
              "value": "Global"
            },
            {
              "icon": "FiMapPin",
              "title": "Host Country",
              "value": "Ghana"
            },
            {
              "icon": "FiTrophy",
              "title": "Star Prize",
              "value": "$10,000"
            },
            {
              "icon": "FaCrown",
              "title": "Crown",
              "value": "Top 3"
            }
          ])
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError(err.message)
        setStats([
          {
            "icon": "FiUser",
            "title": "Candidates",
            "value": 20
          },
          {
            "icon": "FiMapPin",
            "title": "Host Country",
            "value": "Ghana"
          },
          {
            "icon": "FiTrophy",
            "title": "Star Prize",
            "value": "$10,000"
          },
          {
            "icon": "FaCrown",
            "title": "Crown",
            "value": 3
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <section className="mt-0 relative z-30">
        {/* Mobile Loading - Full width */}
        <div className="md:hidden w-full bg-gradient-to-br from-white to-brown-50 border-t border-gold-100/30">
          <div className="flex justify-center items-center gap-1 overflow-x-auto w-full px-0 py-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-1.5 p-2 rounded-none bg-white border border-brown-100/50 flex-shrink-0 w-[22%] min-w-[85px] mx-0.5 animate-pulse">
                <div className="w-7 h-7 bg-brown-100 rounded-md"></div>
                <div className="flex flex-col justify-center space-y-0.5">
                  <div className="h-4 bg-brown-100 rounded w-12"></div>
                  <div className="h-3 bg-brown-100 rounded w-10"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Loading - Centered */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 md:px-8">
          <div className="bg-gradient-to-br from-white to-brown-50 rounded-none shadow-sm p-1 md:p-2 border-t border-gold-100/30">
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-none bg-white border border-brown-100/50 animate-pulse">
                  <div className="w-9 h-9 bg-brown-100 rounded-md"></div>
                  <div className="flex flex-col justify-center space-y-1">
                    <div className="h-5 bg-brown-100 rounded w-16"></div>
                    <div className="h-3 bg-brown-100 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!stats || stats.length === 0) return null

  return (
    <section className="mt-0 relative z-30">
      {/* Mobile: Full width with side-by-side layout */}
      <div className="md:hidden w-full bg-gradient-to-br from-white to-brown-50 border-t border-gold-100/30">
        <div className="flex justify-center items-center gap-1 overflow-x-auto w-full px-0 py-1">
          {stats.map((stat, index) => {
            const IconComponent = getIconComponent(stat.icon)
            return (
              <div 
                key={index}
                className="flex items-center gap-1.5 p-2 rounded-none bg-white border border-brown-100/50 flex-shrink-0 w-[22%] min-w-[85px] mx-0.5"
              >
                {/* Icon on the left */}
                <div className="p-1.5 rounded-md bg-gradient-to-br from-gold-500 to-gold-400">
                  <IconComponent className="w-3.5 h-3.5 text-white" />
                </div>
                
                {/* Value and title stacked vertically on the right */}
                <div className="flex flex-col justify-center">
                  <div className="text-sm font-bold text-brown-900 leading-tight whitespace-nowrap">
                    {stat.value}
                  </div>
                  <div className="text-[8px] text-brown-600 font-medium truncate">
                    {stat.title}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop: Centered with max-width */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-br from-white to-brown-50 rounded-none shadow-sm p-1 md:p-2 border-t border-gold-100/30">
          <div className="grid grid-cols-4 gap-2">
            {stats.map((stat, index) => {
              const IconComponent = getIconComponent(stat.icon)
              return (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-none bg-white border border-brown-100/50"
                >
                  {/* Icon on the left */}
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gold-500 to-gold-400">
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Value and title stacked vertically on the right */}
                  <div className="flex flex-col justify-center">
                    <div className="text-lg font-bold text-brown-900">
                      {stat.value}
                    </div>
                    <div className="text-[11px] text-brown-600 font-medium truncate">
                      {stat.title}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Stats