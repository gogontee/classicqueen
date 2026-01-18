'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Crown, Heart, Eye, Trophy, Star, Filter, Search, ChevronLeft, ChevronRight, Award, Users } from 'lucide-react'

const CandidateGrid = () => {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('votes')
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [voteAmount, setVoteAmount] = useState(10)
  
  const itemsPerPage = 9

  // Mock data - replace with Supabase API call later
  useEffect(() => {
    const mockCandidates = Array.from({ length: 27 }, (_, i) => ({
      id: i + 1,
      full_name: `Candidate ${i + 1}`,
      nick_name: ['Queen', 'Princess', 'Star', 'Diamond', 'Rose'][i % 5],
      location: ['USA', 'UK', 'Canada', 'Australia', 'France', 'Japan', 'Brazil', 'India'][i % 8],
      contest_number: `CQ${String(i + 1).padStart(3, '0')}`,
      about: 'Passionate about women empowerment and community development. Currently studying International Relations.',
      votes: Math.floor(Math.random() * 5000) + 1000,
      gifts: Math.floor(Math.random() * 1000) + 100,
      points: (Math.random() * 100).toFixed(1),
      views: Math.floor(Math.random() * 10000) + 5000,
      age: 18 + (i % 12),
      occupation: ['Student', 'Model', 'Activist', 'Entrepreneur', 'Artist'][i % 5],
      photo: `/api/placeholder/400/500`,
      banner: `/api/placeholder/1200/300`,
      approved: true,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }))
    
    // Add some top candidates
    mockCandidates[0] = {
      ...mockCandidates[0],
      full_name: 'Sarah Johnson',
      nick_name: 'The Visionary',
      location: 'USA',
      votes: 12540,
      rank: 1,
      is_featured: true,
    }
    
    mockCandidates[1] = {
      ...mockCandidates[1],
      full_name: 'Maria Garcia',
      nick_name: 'Earth Guardian',
      location: 'Spain',
      votes: 9980,
      rank: 2,
      is_featured: true,
    }
    
    mockCandidates[2] = {
      ...mockCandidates[2],
      full_name: 'Chloe Williams',
      nick_name: 'Hope Bringer',
      location: 'UK',
      votes: 8765,
      rank: 3,
      is_featured: true,
    }

    setTimeout(() => {
      setCandidates(mockCandidates)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter and sort logic
  const filteredCandidates = candidates
    .filter(candidate => 
      candidate.approved &&
      (selectedCountry === 'All' || candidate.location === selectedCountry) &&
      (searchTerm === '' || 
        candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.nick_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'votes': return b.votes - a.votes
        case 'newest': return new Date(b.created_at) - new Date(a.created_at)
        case 'name': return a.full_name.localeCompare(b.full_name)
        default: return b.votes - a.votes
      }
    })

  // Pagination
  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage)
  const countries = ['All', ...new Set(candidates.map(c => c.location).filter(Boolean))]

  // Vote function
  const handleVote = (candidate) => {
    setSelectedCandidate(candidate)
    setShowVoteModal(true)
  }

  const submitVote = () => {
    // Here you would integrate with Paystack/PayPal
    console.log(`Voting ${voteAmount} times for ${selectedCandidate.full_name}`)
    setShowVoteModal(false)
    // Show success message
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-64 bg-brown-200 rounded-t-xl"></div>
              <div className="p-6 space-y-4">
                <div className="h-4 bg-brown-200 rounded w-3/4"></div>
                <div className="h-3 bg-brown-200 rounded w-1/2"></div>
                <div className="h-10 bg-brown-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Stats */}
      <div className="mb-8 bg-gradient-to-r from-brown-600 to-brown-800 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meet Our Contestants</h1>
            <p className="text-brown-200">
              {filteredCandidates.length} beautiful contestants from around the world
            </p>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="text-center">
              <div className="text-2xl font-bold">{filteredCandidates.length}</div>
              <div className="text-sm text-brown-200">Contestants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {filteredCandidates.reduce((sum, c) => sum + c.votes, 0).toLocaleString()}
              </div>
              <div className="text-sm text-brown-200">Total Votes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{countries.length - 1}</div>
              <div className="text-sm text-brown-200">Countries</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400" size={20} />
              <input
                type="text"
                placeholder="Search contestants by name, nickname, or country..."
                className="w-full pl-10 pr-4 py-3 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Country Filter */}
          <div className="w-full md:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400" size={20} />
              <select
                className="w-full pl-10 pr-4 py-3 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent appearance-none bg-white"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country === 'All' ? 'All Countries' : `🇺🇸 ${country}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-64">
            <select
              className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent appearance-none bg-white"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="votes">Most Votes</option>
              <option value="newest">Newest</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {paginatedCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="card hover:shadow-2xl transition-all duration-500 overflow-hidden group"
          >
            {/* Candidate Header with Rank */}
            <div className="relative h-48 bg-gradient-to-br from-brown-400 to-brown-600 overflow-hidden">
              {candidate.rank <= 3 && (
                <div className="absolute top-4 left-4 z-10">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                    candidate.rank === 1 ? 'bg-gold-500' :
                    candidate.rank === 2 ? 'bg-gray-400' :
                    'bg-brown-700'
                  } text-white font-bold text-xl shadow-lg`}>
                    <Trophy size={candidate.rank === 1 ? 20 : 16} />
                  </div>
                </div>
              )}
              
              {/* Overlay Stats */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm opacity-90">Contestant No.</div>
                    <div className="text-xl font-bold">{candidate.contest_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90">Total Votes</div>
                    <div className="text-xl font-bold">{candidate.votes.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-brown-900 mb-1">
                    {candidate.full_name}
                  </h3>
                  <div className="flex items-center space-x-2 text-brown-600">
                    <span>📍 {candidate.location}</span>
                    <span className="text-gold-500">•</span>
                    <span>{candidate.age} years</span>
                  </div>
                  {candidate.nick_name && (
                    <div className="inline-block mt-2 px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-sm font-medium">
                      "{candidate.nick_name}"
                    </div>
                  )}
                </div>
                <div className="flex items-center text-gold-500">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} className="text-brown-300" />
                </div>
              </div>

              <p className="text-brown-600 mb-6 line-clamp-2">
                {candidate.about}
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="text-center p-3 bg-brown-50 rounded-lg">
                  <div className="text-2xl font-bold text-brown-900">{candidate.gifts}</div>
                  <div className="text-xs text-brown-500">Gifts</div>
                </div>
                <div className="text-center p-3 bg-brown-50 rounded-lg">
                  <div className="text-2xl font-bold text-brown-900">{candidate.points}</div>
                  <div className="text-xs text-brown-500">Points</div>
                </div>
                <div className="text-center p-3 bg-brown-50 rounded-lg">
                  <div className="text-2xl font-bold text-brown-900">
                    {(candidate.views / 1000).toFixed(1)}k
                  </div>
                  <div className="text-xs text-brown-500">Views</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => handleVote(candidate)}
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-medium py-3 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
                >
                  <Heart size={18} />
                  <span>Vote Now</span>
                </button>
                <Link
                  href={`/candidates/${candidate.id}`}
                  className="px-4 py-3 border border-brown-300 text-brown-700 hover:bg-brown-50 rounded-lg transition-colors duration-300 flex items-center"
                >
                  <Eye size={18} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mb-12">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-brown-300 text-brown-700 hover:bg-brown-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium ${
                    currentPage === pageNum
                      ? 'bg-brown-600 text-white'
                      : 'border border-brown-300 text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-brown-300 text-brown-700 hover:bg-brown-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
          
          <span className="text-brown-600">
            Page {currentPage} of {totalPages}
          </span>
        </div>
      )}

      {/* Voting Modal */}
      {showVoteModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-brown-900">Cast Your Vote</h3>
              <button
                onClick={() => setShowVoteModal(false)}
                className="text-brown-400 hover:text-brown-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-brown-400 to-brown-600 rounded-full"></div>
                <div>
                  <h4 className="font-bold text-lg">{selectedCandidate.full_name}</h4>
                  <p className="text-brown-600">Contestant #{selectedCandidate.contest_number}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-brown-700 mb-2">
                  Select Vote Package
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[10, 50, 100, 200, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setVoteAmount(amount)}
                      className={`py-3 rounded-lg border ${
                        voteAmount === amount
                          ? 'border-gold-500 bg-gold-50 text-gold-700'
                          : 'border-brown-300 text-brown-700 hover:bg-brown-50'
                      }`}
                    >
                      <div className="font-bold">{amount}</div>
                      <div className="text-xs">votes</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-brown-700 mb-2">
                  Custom Amount
                </label>
                <input
                  type="number"
                  min="1"
                  value={voteAmount}
                  onChange={(e) => setVoteAmount(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-3 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500"
                />
              </div>
            </div>
            
            <div className="bg-brown-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-brown-600">Votes:</span>
                <span className="font-bold">{voteAmount}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-brown-600">Cost per vote:</span>
                <span className="font-bold">$0.10</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-brown-200">
                <span>Total:</span>
                <span>${(voteAmount * 0.10).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={submitVote}
                className="flex-1 bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Proceed to Payment
              </button>
              <button
                onClick={() => setShowVoteModal(false)}
                className="px-6 py-3 border border-brown-300 text-brown-700 hover:bg-brown-50 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCandidates.length === 0 && (
        <div className="text-center py-16">
          <Users className="mx-auto text-brown-300 mb-4" size={64} />
          <h3 className="text-xl font-bold text-brown-900 mb-2">No contestants found</h3>
          <p className="text-brown-600 mb-6">
            Try adjusting your search or filter criteria
          </p>
          <button
            onClick={() => {
              setSearchTerm('')
              setSelectedCountry('All')
            }}
            className="bg-brown-600 hover:bg-brown-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default CandidateGrid