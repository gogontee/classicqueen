'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, User, ArrowRight, Clock, ChevronLeft, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { motion } from 'motion/react'

export default function NewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

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

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brown-50 via-white to-brown-50">
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brown-50 via-white to-brown-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading News</h2>
            <p className="text-brown-600">{error}</p>
            <button
              onClick={fetchNews}
              className="mt-4 px-6 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brown-50 via-white to-brown-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-brown-900 via-brown-800 to-brown-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1200/800?pattern=abstract')] opacity-10"></div>
        <div className="container relative mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Page title increased by 50% */}
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold mb-4">
                Latest <span className="text-gold-400">News</span>
              </h1>
              <p className="text-xl text-gold-300 mb-8 max-w-3xl mx-auto">
                Stay updated with the latest announcements, events, and stories from Classic Queen International
              </p>
              
              {/* Search Bar - Reduced by 50% in height */}
              <div className="max-w-md mx-auto mt-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brown-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search news articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-brown-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main News Grid */}
          <div className="lg:w-3/4">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-2">
                All <span className="text-gold-600">Articles</span>
              </h2>
              <p className="text-brown-600">
                {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brown-100 text-brown-600 rounded-full mb-4">
                  <Search size={24} />
                </div>
                <h3 className="text-xl font-bold text-brown-900 mb-2">No articles found</h3>
                <p className="text-brown-600">Try searching with different keywords</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredNews.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/news/${item.id}`}>
                      <div className="group bg-white rounded-xl md:rounded-2xl shadow-lg overflow-hidden border border-brown-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        {/* Cover Image - RESTORED to original styling */}
                        <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-brown-200 to-brown-300">
                          {item.cover_image ? (
                            <Image
                              src={item.cover_image}
                              alt={item.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-brown-800 font-bold text-lg">Classic Queen</span>
                            </div>
                          )}
                          {/* Category Badge */}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-brown-900 text-xs font-medium rounded-full">
                              {item.category}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3 md:p-6 flex-1 flex flex-col">
                          {/* Date only - Very small on mobile, normal on desktop */}
                          <div className="text-[10px] xs:text-xs md:text-sm text-brown-500 mb-2 md:mb-3">
                            <div className="flex items-center">
                              <Calendar size={10} className="mr-1 md:mr-2" />
                              <span>{new Date(item.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            </div>
                          </div>

                          <h3 className="text-sm md:text-lg font-bold text-brown-900 mb-2 md:mb-3 line-clamp-2">
                            {item.title}
                          </h3>

                          <p className="text-brown-600 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 md:line-clamp-3 flex-1">
                            {item.excerpt || item.content.substring(0, 80)}...
                          </p>

                          <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 md:pt-4 border-t border-brown-100">
                            {/* Author - Hidden on mobile, shown on desktop */}
                            <div className="hidden md:flex items-center">
                              <User size={14} className="mr-2 text-brown-500" />
                              <span className="text-sm text-brown-700">{item.author || 'Admin'}</span>
                            </div>
                            <div className="flex items-center text-gold-600 text-xs md:text-sm font-medium group-hover:translate-x-1 transition-transform ml-auto">
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
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-brown-100">
                <h3 className="text-lg font-bold text-brown-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {['Announcements', 'Events', 'Contestants', 'Sponsors', 'Partnerships'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSearchTerm(category)}
                      className="flex items-center justify-between w-full text-left p-2 rounded-lg hover:bg-brown-50 transition-colors"
                    >
                      <span className="text-brown-700">{category}</span>
                      <span className="text-sm text-brown-500 bg-brown-100 px-2 py-1 rounded">
                        {news.filter(n => n.category === category).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured News */}
              {news.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-brown-100">
                  <h3 className="text-lg font-bold text-brown-900 mb-4">Featured</h3>
                  <div className="space-y-4">
                    {news.slice(0, 3).map((item) => (
                      <Link key={item.id} href={`/news/${item.id}`} className="group">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-brown-200 to-brown-300 rounded-lg overflow-hidden">
                            {item.cover_image && (
                              <Image
                                src={item.cover_image}
                                alt={item.title}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-brown-900 text-sm group-hover:text-gold-600 transition-colors line-clamp-2">
                              {item.title}
                            </h4>
                            <p className="text-xs text-brown-500 mt-1">
                              {new Date(item.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl shadow-lg p-6 border border-gold-200">
                <h3 className="text-lg font-bold text-brown-900 mb-3">Stay Updated</h3>
                <p className="text-brown-700 text-sm mb-4">
                  Subscribe to get the latest news delivered to your inbox
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-2 rounded-lg border border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  />
                  <button className="w-full bg-gold-500 hover:bg-gold-600 text-white font-medium py-2 rounded-lg transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}