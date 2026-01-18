'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Crown, Trophy, Star, Heart, Eye } from 'lucide-react'

const FeaturedCandidates = () => {
  const [featuredCandidates, setFeaturedCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API call later
  useEffect(() => {
    setTimeout(() => {
      setFeaturedCandidates([
        {
          id: 1,
          name: 'Sarah Johnson',
          country: 'United States',
          votes: 2540,
          rank: 1,
          photo: '/api/placeholder/400/500',
          bio: 'Advocate for women education',
        },
        {
          id: 2,
          name: 'Maria Garcia',
          country: 'Spain',
          votes: 1980,
          rank: 2,
          photo: '/api/placeholder/400/500',
          bio: 'Environmental activist',
        },
        {
          id: 3,
          name: 'Chloe Williams',
          country: 'United Kingdom',
          votes: 1765,
          rank: 3,
          photo: '/api/placeholder/400/500',
          bio: 'Mental health awareness',
        },
      ])
      setLoading(false)
    }, 1000)
  }, [])

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-b from-brown-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-brown-900 mb-12">
            Featured Contestants
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-64 bg-brown-200 rounded-t-xl"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-brown-200 rounded w-3/4"></div>
                  <div className="h-3 bg-brown-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-brown-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-4">
            Featured Contestants
          </h2>
          <p className="text-brown-600 max-w-2xl mx-auto">
            Meet our top contestants who are leading the competition with their grace, 
            talent, and commitment to making a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="card group hover:shadow-2xl transition-all duration-500 overflow-hidden"
            >
              {/* Candidate Rank Badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  candidate.rank === 1 ? 'bg-gold-500' :
                  candidate.rank === 2 ? 'bg-gray-400' :
                  'bg-brown-600'
                } text-white font-bold text-xl shadow-lg`}>
                  {candidate.rank}
                  {candidate.rank === 1 && <Trophy className="ml-1" size={16} />}
                </div>
              </div>

              {/* Candidate Photo */}
              <div className="relative h-64 overflow-hidden bg-brown-100">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10" />
                <div className="w-full h-full bg-gradient-to-br from-brown-300 to-brown-500 group-hover:scale-105 transition-transform duration-700" />
                
                {/* Quick Stats Overlay */}
                <div className="absolute bottom-4 left-0 right-0 z-20 px-4">
                  <div className="flex justify-between items-center text-white">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Heart size={16} />
                        <span className="font-bold">{candidate.votes.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye size={16} />
                        <span className="font-bold">{(candidate.votes * 10).toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-1 rounded-lg text-sm font-medium transition-colors">
                      Vote Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Candidate Info */}
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-brown-900 mb-1">
                        {candidate.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-brown-600">
                        <span>🇺🇸</span>
                        <span>{candidate.country}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-gold-500">
                      <Star size={18} fill="currentColor" />
                      <Star size={18} fill="currentColor" />
                      <Star size={18} fill="currentColor" />
                      <Star size={18} fill="currentColor" />
                      <Star size={18} className="text-brown-300" />
                    </div>
                  </div>
                </div>

                <p className="text-brown-600 mb-6 line-clamp-2">
                  {candidate.bio}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-brown-100">
                  <Link
                    href={`/candidates/${candidate.id}`}
                    className="text-brown-700 hover:text-gold-600 font-medium flex items-center space-x-2 transition-colors"
                  >
                    <span>View Profile</span>
                    <span>→</span>
                  </Link>
                  <div className="flex space-x-2">
                    <button className="p-2 text-brown-500 hover:text-gold-600 hover:bg-brown-50 rounded-lg transition-colors">
                      <Heart size={18} />
                    </button>
                    <button className="p-2 text-brown-500 hover:text-gold-600 hover:bg-brown-50 rounded-lg transition-colors">
                      <Eye size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/candidates"
            className="inline-flex items-center space-x-2 bg-brown-600 hover:bg-brown-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-300 hover:scale-105"
          >
            <span>View All Contestants</span>
            <Crown size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FeaturedCandidates