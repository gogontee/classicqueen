'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Facebook, 
  Twitter, 
  Instagram, 
  Bookmark, 
  ExternalLink,
  ArrowRight 
} from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { motion } from 'motion/react'

export default function NewsDetailPage() {
  const params = useParams()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [similarNews, setSimilarNews] = useState([])

  useEffect(() => {
    if (params.id) {
      fetchNews()
    }
  }, [params.id])

  const fetchSimilarNews = async (currentNews) => {
    try {
      // Fetch news with similar category
      const { data: categoryData } = await supabase
        .from('news')
        .select('*')
        .neq('id', currentNews.id)
        .eq('category', currentNews.category)
        .order('created_at', { ascending: false })
        .limit(3)

      // If we have enough similar category news, return them
      if (categoryData && categoryData.length >= 2) {
        return categoryData.slice(0, 3)
      }

      // Otherwise, fetch recent news (fallback)
      const { data: recentData } = await supabase
        .from('news')
        .select('*')
        .neq('id', currentNews.id)
        .order('created_at', { ascending: false })
        .limit(3)

      return recentData || []
    } catch (err) {
      console.error('Error fetching similar news:', err)
      return []
    }
  }

  const fetchNews = async () => {
    try {
      setLoading(true)
      
      // Fetch the specific news article
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setNews(data)

      // Fetch similar news
      if (data) {
        const similarData = await fetchSimilarNews(data)
        setSimilarNews(similarData)
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }

  const shareNews = () => {
    if (navigator.share && news) {
      navigator.share({
        title: news.title,
        text: news.excerpt,
        url: window.location.href,
      })
    }
  }

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

  if (error || !news) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brown-50 via-white to-brown-50">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Article Not Found</h2>
            <p className="text-brown-600 mb-6">The news article you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/news"
              className="inline-flex items-center px-6 py-3 bg-gold-500 text-white font-medium rounded-lg hover:bg-gold-600 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back to News
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brown-50 via-white to-brown-50">
      {/* Article Header */}
      <div className="bg-gradient-to-r from-brown-900 via-brown-800 to-brown-950 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                href="/news"
                className="inline-flex items-center text-gold-300 hover:text-gold-400 mb-6 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to News
              </Link>

              <div className="mb-4">
                <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full">
                  {news.category}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {news.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-brown-200">
                <div className="flex items-center">
                  <User size={18} className="mr-2 text-gold-400" />
                  <span>{news.author || 'Classic Queen Team'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2 text-gold-400" />
                  <span>
                    {new Date(news.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock size={18} className="mr-2 text-gold-400" />
                  <span>{news.read_time || '5'} min read</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Cover Image */}
              <div className="relative h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden mb-8 shadow-xl">
                {news.cover_image ? (
                  <Image
                    src={news.cover_image}
                    alt={news.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-brown-200 to-brown-300 flex items-center justify-center">
                    <span className="text-brown-800 font-bold text-2xl">Classic Queen</span>
                  </div>
                )}
              </div>

              {/* Social Sharing */}
              <div className="flex items-center justify-between mb-8 p-4 bg-white rounded-xl shadow-lg border border-brown-100">
                <div className="flex items-center">
                  <Bookmark size={20} className="text-brown-600 mr-2" />
                  <span className="text-brown-700 font-medium">Save for later</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={shareNews}
                    className="flex items-center text-brown-700 hover:text-gold-600 transition-colors"
                  >
                    <Share2 size={20} className="mr-2" />
                    Share
                  </button>
                  <div className="flex space-x-2">
                    <a href="#" className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                      <Facebook size={16} />
                    </a>
                    <a href="#" className="w-8 h-8 bg-blue-50 text-blue-400 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors">
                      <Twitter size={16} />
                    </a>
                    <a href="#" className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center hover:bg-pink-200 transition-colors">
                      <Instagram size={16} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Article Content */}
              <motion.article
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="prose prose-lg max-w-none"
              >
                <div 
                  className="text-brown-800 leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />
              </motion.article>

              {/* Tags */}
              {news.tags && news.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-brown-100">
                  <h3 className="text-lg font-bold text-brown-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {news.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-brown-100 text-brown-700 rounded-full text-sm hover:bg-brown-200 transition-colors cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Author Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-brown-100">
                <h3 className="text-xl font-bold text-brown-900 mb-4">About the Author</h3>
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-gold-200 to-gold-300 rounded-full flex items-center justify-center">
                    <User size={24} className="text-gold-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-brown-900">{news.author || 'Classic Queen Team'}</h4>
                    <p className="text-sm text-brown-600 mt-1">
                      Official news and updates from the Classic Queen International organization.
                    </p>
                  </div>
                </div>
              </div>

              {/* Newsletter */}
              <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl shadow-lg p-6 border border-gold-200">
                <h3 className="text-lg font-bold text-brown-900 mb-3">Never Miss an Update</h3>
                <p className="text-brown-700 text-sm mb-4">
                  Subscribe to our newsletter and stay informed about the latest news and events.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-4 py-3 rounded-lg border border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  />
                  <button className="w-full bg-gold-500 hover:bg-gold-600 text-white font-medium py-3 rounded-lg transition-colors">
                    Subscribe Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Similar News Section - Full Width */}
          {similarNews.length > 0 && (
            <div className="mt-16 pt-12 border-t border-brown-100">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-2">
                    Similar <span className="text-gold-600">Articles</span>
                  </h2>
                  <p className="text-brown-600">
                    You might also be interested in these related stories
                  </p>
                </div>
                <Link
                  href="/news"
                  className="inline-flex items-center text-gold-600 hover:text-gold-700 font-medium"
                >
                  View All News
                  <ExternalLink size={18} className="ml-2" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarNews.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Link href={`/news/${item.id}`}>
                      <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-brown-100 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        {/* Cover Image */}
                        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-brown-200 to-brown-300">
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
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center text-sm text-brown-500 mb-3">
                            <Calendar size={14} className="mr-2" />
                            <span>{new Date(item.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}</span>
                          </div>

                          <h3 className="text-lg font-bold text-brown-900 mb-3 line-clamp-2">
                            {item.title}
                          </h3>

                          <p className="text-brown-600 text-sm mb-4 line-clamp-3 flex-1">
                            {item.excerpt || item.content.substring(0, 100)}...
                          </p>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-brown-100">
                            <div className="flex items-center text-sm text-brown-700">
                              <Clock size={14} className="mr-2" />
                              {item.read_time || '5'} min read
                            </div>
                            <div className="flex items-center text-gold-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                              Read
                              <ArrowRight size={16} className="ml-1" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}