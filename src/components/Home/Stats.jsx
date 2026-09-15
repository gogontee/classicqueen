'use client'

import { useState, useEffect } from 'react'
import { Users, MapPin, Trophy, Crown, TrendingUp, Award, Star, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const GOLD_GRADIENT =
  'linear-gradient(90deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #BF953F 100%)'

const FALLBACK_STATS = [
  { icon: 'FiUser',      title: 'Candidates',   value: 'Global'  },
  { icon: 'FiMapPin',    title: 'Host Country', value: 'Ghana'   },
  { icon: 'FiTrophy',    title: 'Star Prize',   value: '$5,000'  },
  { icon: 'FaCrown',     title: 'Crown',        value: 'Top 3'   }
]

const Stats = () => {
  const [stats, setStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const getIconComponent = (iconName) => iconMap[iconName] || Trophy

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)

        const { data, error } = await supabase
          .from('classicqueen')
          .select('stats')
          .single()

        if (error) throw error

        if (data?.stats && data.stats.length > 0) {
          setStats(data.stats)
        } else {
          setStats(FALLBACK_STATS)
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
        setError(err.message)
        setStats(FALLBACK_STATS)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  // ------------------- Loading skeleton -------------------
  if (isLoading) {
    return (
      <section className="mt-0 relative z-30">
        {/* Mobile skeleton */}
        <div className="md:hidden w-full bg-gradient-to-br from-white to-brown-50 border-t border-gold-100/30">
          <div className="flex justify-center gap-2 w-full px-2.5 py-2 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 rounded-lg p-[1.5px] animate-pulse"
                style={{ background: GOLD_GRADIENT, opacity: 0.4 }}
              >
                <div className="flex items-center gap-1.5 rounded-[6px] bg-white px-2 py-1.5">
                  <div className="w-6 h-6 bg-brown-100 rounded-md" />
                  <div className="flex flex-col gap-1">
                    <div className="h-3 bg-brown-100 rounded w-10" />
                    <div className="h-2 bg-brown-100 rounded w-8" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop skeleton */}
        <div className="hidden md:flex justify-center max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-lg p-[1.5px] animate-pulse"
                style={{ background: GOLD_GRADIENT, opacity: 0.4 }}
              >
                <div className="flex items-center gap-2 rounded-[6px] bg-white px-3 py-2">
                  <div className="w-7 h-7 bg-brown-100 rounded-md" />
                  <div className="flex flex-col gap-1.5">
                    <div className="h-3.5 bg-brown-100 rounded w-16" />
                    <div className="h-2.5 bg-brown-100 rounded w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!stats || stats.length === 0) return null

  return (
    <section className="mt-0 relative z-30">
      {/* ============ MOBILE: centered compact row ============ */}
      <div className="md:hidden w-full bg-gradient-to-br from-white to-brown-50 border-t border-gold-100/30">
        <div
          className="
            flex justify-center gap-2 w-full px-2.5 py-2
            [scrollbar-width:none] [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {stats.map((stat, index) => {
            const IconComponent = getIconComponent(stat.icon)
            return (
              <div
                key={index}
                className="
                  group relative shrink-0
                  rounded-lg p-[1.5px]
                  transition-transform duration-300 active:scale-[0.97]
                "
                style={{ background: GOLD_GRADIENT }}
              >
                <div className="relative flex items-center gap-1.5 rounded-[6px] bg-white px-2 py-1.5 overflow-hidden">
                  {/* soft inner gold glow */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        'linear-gradient(120deg, transparent 30%, rgba(252,246,186,0.35) 50%, transparent 70%)',
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="relative shrink-0 rounded-md p-[1px]"
                    style={{ background: GOLD_GRADIENT }}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-gradient-to-br from-gold-500 to-gold-400">
                      <IconComponent className="h-3 w-3 text-white" />
                    </div>
                  </div>

                  {/* Value + Title */}
                  <div className="relative flex min-w-0 flex-col">
                    <div className="whitespace-nowrap text-[13px] font-bold leading-tight text-brown-900">
                      {stat.value}
                    </div>
                    <div className="whitespace-nowrap text-[9px] font-medium leading-tight text-brown-600">
                      {stat.title}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============ DESKTOP: centered compact row ============ */}
      <div className="hidden md:flex justify-center max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex gap-2.5">
          {stats.map((stat, index) => {
            const IconComponent = getIconComponent(stat.icon)
            return (
              <div
                key={index}
                className="
                  group relative rounded-lg p-[1.5px]
                  transition-transform duration-300 hover:scale-[1.02]
                "
                style={{ background: GOLD_GRADIENT }}
              >
                <div className="relative flex items-center gap-2 rounded-[6px] bg-white px-3 py-2 overflow-hidden">
                  {/* shimmer on hover */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background:
                        'linear-gradient(120deg, transparent 30%, rgba(252,246,186,0.35) 50%, transparent 70%)',
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="relative shrink-0 rounded-md p-[1px]"
                    style={{ background: GOLD_GRADIENT }}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-gradient-to-br from-gold-500 to-gold-400">
                      <IconComponent className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>

                  {/* Value + Title */}
                  <div className="relative flex min-w-0 flex-col">
                    <div className="truncate text-sm font-bold leading-tight text-brown-900">
                      {stat.value}
                    </div>
                    <div className="truncate text-[10px] font-medium leading-tight text-brown-600">
                      {stat.title}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default Stats