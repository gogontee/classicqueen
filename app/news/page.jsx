'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight, Search, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { motion } from 'motion/react'

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNews(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get unique categories
  const categories = ['all', ...new Set(news.map(item => item.category).filter(Boolean))]

  const filteredNews = news.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2D1E0F]">
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#2D1E0F]">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading News</h2>
            <p className="text-amber-200">{error}</p>
            <button
              onClick={fetchNews}
              className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brown-800">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Latest <span className="text-amber-400">Updates</span>
          </h1>
          <p className="text-sm text-white">
            News, exclusives, and behind-the-scenes
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-6">
          <div className="relative flex items-center bg-[#3D2E1F]/50 rounded-lg border border-[#5D4E3F]">
            <Search className="w-4 h-4 text-amber-300/70 ml-3" />
            <input
              type="text"
              placeholder="Search updates..."
              className="w-full bg-transparent border-none outline-none px-3 py-2.5 text-sm text-white placeholder-amber-200/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="p-2 hover:bg-[#5D4E3F] rounded-lg transition-colors"
              >
                <X className="w-3 h-3 text-amber-300/70" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => {
            const count = category === 'all' 
              ? news.length 
              : news.filter(item => item.category === category).length
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-amber-600 text-white'
                    : 'bg-[#3D2E1F] text-amber-rose-200 hover:bg-[#4D3E2F]'
                }`}
              >
                {category === 'all' ? 'All' : category} ({count})
              </button>
            )
          })}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-white text-sm">
            {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* News Grid */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {filteredNews.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/news/${item.id}`}>
                  {/* Original News Card - Completely Preserved */}
                  <div className="group bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-amber-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {/* Cover Image */}
                    <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-amber-200 to-amber-300">
                      {item.cover_image ? (
                        <Image
                          src={item.cover_image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-amber-800 font-bold text-lg">Classic Queen</span>
                        </div>
                      )}
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-amber-900 text-xs font-medium rounded-full">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-6 flex-1 flex flex-col">
                      {/* Date */}
                      <div className="text-[10px] xs:text-xs md:text-sm text-amber-600 mb-2 md:mb-3">
                        <div className="flex items-center">
                          <Calendar size={10} className="mr-1 md:mr-2" />
                          <span>{new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm md:text-lg font-bold text-amber-900 mb-2 md:mb-3 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-amber-700 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 md:line-clamp-3 flex-1">
                        {item.excerpt || item.content?.substring(0, 80)}...
                      </p>

                      {/* Footer with author and read more */}
                      <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-amber-100">
                        <div className="hidden md:flex items-center">
                          <User size={14} className="mr-2 text-amber-500" />
                        </div>
                        <div className="flex items-center text-amber-600 text-xs md:text-sm font-medium group-hover:translate-x-1 transition-transform ml-auto">
                          Read More
                          <ArrowRight size={12} className="ml-0.5 md:ml-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#3D2E1F] text-amber-300/70 rounded-full mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
            <p className="text-amber-200/70">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </div>
  )
}