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

const style = `
  .news-content,
  .news-content * {
    color: #f5f5f4 !important;
  }
`;

export default function NewsDetailPage() {
  const params = useParams()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [similarNews, setSimilarNews] = useState([])
  const [isVertical, setIsVertical] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchNews()
    }
  }, [params.id])

  useEffect(() => {
    if (news?.cover_image) {
      const img = new window.Image()
      img.onload = () => {
        setIsVertical(img.height > img.width)
      }
      img.src = news.cover_image
    }
  }, [news?.cover_image])

  const fetchSimilarNews = async (currentNews) => {
    try {
      const { data: categoryData } = await supabase
        .from('news')
        .select('*')
        .neq('id', currentNews.id)
        .eq('category', currentNews.category)
        .order('created_at', { ascending: false })
        .limit(3)

      if (categoryData && categoryData.length >= 2) {
        return categoryData.slice(0, 3)
      }

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
      
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      setNews(data)

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
      <div className="min-h-screen bg-brown-800">
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-brown-800">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-amber-500 mb-4">Article Not Found</h2>
            <p className="text-brown-300 mb-6">The news article you're looking for doesn't exist or has been removed.</p>
            <Link
              href="/news"
              className="inline-flex items-center px-6 py-3 bg-amber-500 text-white font-medium rounded-lg hover:bg-amber-600 transition-colors"
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
    <>
      <style>{style}</style>
      <div className="min-h-screen bg-brown-800">
        {/* Article Header */}
        <div className="border-b border-brown-700">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/news"
                className="inline-flex items-center text-white hover:text-amber-400 mb-6 transition-colors"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to News
              </Link>

              <div className="mb-4">
                <span className="inline-block px-4 py-1 bg-amber-500/10 text-white text-sm font-medium rounded-full border border-amber-500/20">
                  {news.category}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6">
                {news.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-white">
                <div className="flex items-center">
                  <User size={16} className="mr-2" />
                  <span>{news.author || 'Classic Queen Team'}</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-amber-500" />
                  <span>
                    {new Date(news.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="mr-2 text-amber-500" />
                  <span>{news.read_time || '5'} min read</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Image Column - First column of the grid */}
              <div className="lg:col-span-1">
                {news.cover_image && (
                  <div className="border border-brown-700 bg-brown-900 rounded-xl overflow-hidden sticky top-24">
                    <img 
                      src={news.cover_image} 
                      alt={news.title}
                      className={`w-full h-auto ${
                        isVertical 
                          ? 'max-h-[600px] object-contain' 
                          : 'max-h-[300px] object-contain'
                      } mx-auto`}
                      style={{ display: 'block' }}
                    />
                  </div>
                )}
              </div>

              {/* Main Content - Second column */}
              <div className="lg:col-span-1">
                {/* Social Sharing */}
                <div className="flex items-center justify-between mb-6 md:mb-8 p-3 md:p-4 bg-brown-700/30 rounded-xl border border-brown-700">
                  <div className="flex items-center">
                    <Bookmark size={18} className="text-amber-500 mr-2" />
                    <span className="text-white text-sm md:text-base font-medium">Save for later</span>
                  </div>
                  <div className="flex items-center space-x-3 md:space-x-4">
                    <button
                      onClick={shareNews}
                      className="flex items-center text-white hover:text-amber-500 transition-colors text-sm md:text-base"
                    >
                      <Share2 size={18} className="mr-1" />
                      Share
                    </button>
                    <div className="flex space-x-1 md:space-x-2">
                      <a href="#" className="w-7 h-7 md:w-8 md:h-8 bg-brown-700 text-amber-500 rounded-full flex items-center justify-center hover:bg-brown-600 transition-colors">
                        <Facebook size={14} />
                      </a>
                      <a href="#" className="w-7 h-7 md:w-8 md:h-8 bg-brown-700 text-amber-500 rounded-full flex items-center justify-center hover:bg-brown-600 transition-colors">
                        <Twitter size={14} />
                      </a>
                      <a href="#" className="w-7 h-7 md:w-8 md:h-8 bg-brown-700 text-amber-500 rounded-full flex items-center justify-center hover:bg-brown-600 transition-colors">
                        <Instagram size={14} />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <article>
                  <div 
                    className="news-content leading-relaxed text-base md:text-lg"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                  />
                </article>

                {/* Tags */}
                {news.tags && news.tags.length > 0 && (
                  <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-brown-700">
                    <h3 className="text-base md:text-lg font-bold text-amber-500 mb-3 md:mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {news.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 md:px-4 md:py-2 bg-brown-700 text-brown-300 rounded-full text-xs md:text-sm hover:bg-brown-600 transition-colors cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Third column */}
              <div className="lg:col-span-1 space-y-4 md:space-y-6">
                {/* Author Info */}
                <div className="bg-brown-700/30 rounded-xl p-4 md:p-6 border border-brown-700">
                  <h3 className="text-lg md:text-xl font-bold text-amber-500 mb-3 md:mb-4">About the Author</h3>
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={18} className="text-brown-900" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm md:text-base">{news.author || 'Classic Queen Team'}</h4>
                      <p className="text-xs md:text-sm text-brown-300 mt-1">
                        Official news and updates from the Classic Queen International organization.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Newsletter */}
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-xl p-4 md:p-6 border border-amber-500/20">
                  <h3 className="text-base md:text-lg font-bold text-amber-500 mb-2 md:mb-3">Never Miss an Update</h3>
                  <p className="text-brown-300 text-xs md:text-sm mb-3 md:mb-4">
                    Subscribe to our newsletter and stay informed about the latest news and events.
                  </p>
                  <div className="space-y-2 md:space-y-3">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full px-3 py-2 md:px-4 md:py-3 rounded-lg bg-brown-700 border border-brown-600 text-white placeholder-brown-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <button className="w-full bg-amber-500 hover:bg-amber-600 text-brown-900 font-medium py-2 md:py-3 rounded-lg transition-colors text-sm md:text-base">
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Similar News Section */}
            {similarNews.length > 0 && (
              <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-brown-700">
                <div className="flex items-center justify-between mb-4 md:mb-8">
                  <div>
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">
                      Similar <span className="text-amber-500">Articles</span>
                    </h2>
                    <p className="text-brown-300 text-sm md:text-base">
                      You might also be interested in these related stories
                    </p>
                  </div>
                  <Link
                    href="/news"
                    className="inline-flex items-center text-amber-500 hover:text-amber-400 font-medium text-sm md:text-base"
                  >
                    View All
                    <ExternalLink size={14} className="ml-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                  {similarNews.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link href={`/news/${item.id}`}>
                        <div className="group bg-brown-700/30 rounded-lg md:rounded-xl overflow-hidden border border-brown-700 hover:border-amber-500/50 hover:bg-brown-700/50 transition-all duration-300 h-full flex flex-col">
                          <div className="relative h-24 sm:h-28 md:h-36 lg:h-48 overflow-hidden bg-brown-900">
                            {item.cover_image ? (
                              <Image
                                src={item.cover_image}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-brown-700 to-brown-900 flex items-center justify-center">
                                <span className="text-brown-300 text-xs md:text-sm lg:text-base font-bold px-2 text-center">Classic Queen</span>
                              </div>
                            )}
                            <div className="absolute top-2 left-2 md:top-4 md:left-4">
                              <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-brown-900/80 backdrop-blur-sm text-amber-500 text-[10px] md:text-xs font-medium rounded-full border border-amber-500/20">
                                {item.category}
                              </span>
                            </div>
                          </div>

                          <div className="p-2 md:p-3 lg:p-4 flex-1 flex flex-col">
                            <div className="flex items-center text-[10px] md:text-xs text-brown-400 mb-1 md:mb-2">
                              <Calendar size={10} className="mr-1" />
                              <span>{new Date(item.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}</span>
                            </div>

                            <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-white mb-1 md:mb-2 line-clamp-2 group-hover:text-amber-500 transition-colors">
                              {item.title}
                            </h3>

                            <p className="text-brown-300 text-[10px] md:text-xs lg:text-sm mb-2 md:mb-3 line-clamp-2 md:line-clamp-3 flex-1 hidden sm:block">
                              {item.excerpt || item.content.substring(0, 60)}...
                            </p>

                            <div className="flex items-center justify-between mt-1 md:mt-2 pt-1 md:pt-2 border-t border-brown-700">
                              <div className="flex items-center text-[10px] md:text-xs text-brown-400">
                                <Clock size={10} className="mr-1" />
                                <span className="hidden xs:inline">{item.read_time || '5'} min</span>
                              </div>
                              <div className="flex items-center text-amber-500 text-[10px] md:text-xs lg:text-sm font-medium group-hover:translate-x-1 transition-transform">
                                Read
                                <ArrowRight size={10} className="ml-0.5" />
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
    </>
  )
}