'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight, Search, X } from 'lucide-react'
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

  const categories = ['all', ...new Set(news.map((item) => item.category).filter(Boolean))]

  const filteredNews = news.filter((item) => {
    const matchesSearch =
      searchTerm === '' ||
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E1503] via-[#1a0d02] to-black">
        <div className="container mx-auto px-4 py-20">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c9a227]" />
          </div>
        </div>
      </div>
    )
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E1503] via-[#1a0d02] to-black">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading News</h2>
            <p className="text-white/70">{error}</p>
            <button
              onClick={fetchNews}
              className="mt-6 px-6 py-2.5 rounded-xl text-white font-semibold transition hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #9A7B4F 0%, #6b4423 100%)',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E1503] via-[#1a0d02] to-black">
      <div className="container mx-auto px-4 sm:px-6 py-10 md:py-14 max-w-7xl">
        {/* ---------- Header ---------- */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[#c9a227]/80 font-semibold">
            Classic Queen International
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold bg-[linear-gradient(135deg,#f5d76e,#c9a227,#9A7B4F,#c9a227,#f5d76e)] bg-clip-text text-transparent">
            Latest Updates
          </h1>
          <p className="mt-3 text-sm text-white/60 max-w-md mx-auto">
            News, exclusives, and behind-the-scenes stories from the crown.
          </p>
        </div>

        {/* ---------- Search Bar ---------- */}
        <div className="relative max-w-xl mx-auto mb-8">
          <div
            className="relative flex items-center rounded-xl border border-[#9A7B4F]/40 bg-white/5 backdrop-blur-sm overflow-hidden focus-within:border-[#c9a227] transition-colors"
          >
            <Search className="w-4 h-4 text-[#c9a227] ml-4 shrink-0" />
            <input
              type="text"
              placeholder="Search updates…"
              className="w-full bg-transparent border-none outline-none px-3 py-3 text-sm text-white placeholder-white/40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-3 hover:bg-white/10 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            )}
          </div>
        </div>

        {/* ---------- Category Filters ---------- */}
        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => {
              const count =
                category === 'all'
                  ? news.length
                  : news.filter((item) => item.category === category).length

              const isActive = selectedCategory === category

              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-4 py-1.5 rounded-full text-xs font-semibold transition-all
                    ${
                      isActive
                        ? 'text-[#1a0d02] shadow-md'
                        : 'text-[#f5d76e] border border-[#9A7B4F]/50 hover:bg-[#9A7B4F]/15 hover:border-[#c9a227]'
                    }
                  `}
                  style={
                    isActive
                      ? {
                          background:
                            'linear-gradient(135deg, #f5d76e 0%, #c9a227 100%)',
                        }
                      : undefined
                  }
                >
                  {category === 'all' ? 'All' : category} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* ---------- Results Count ---------- */}
        <div className="mb-6">
          <p className="text-white/50 text-xs">
            {filteredNews.length} article{filteredNews.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* ---------- News Grid ---------- */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredNews.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/news/${item.id}`} className="block group h-full">
                  {/* Card with gold rim */}
                  <div
                    className="
                      relative rounded-2xl p-[2px] h-full
                      transition-transform duration-300 ease-out
                      group-hover:scale-[1.02]
                    "
                    style={{
                      background:
                        'conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                    }}
                  >
                    <div className="rounded-2xl bg-black overflow-hidden h-full flex flex-col">
                      {/* Cover Image */}
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
                        {item.cover_image ? (
                          <Image
                            src={item.cover_image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{
                              background:
                                'linear-gradient(135deg, #2E1503 0%, #6b4423 100%)',
                            }}
                          >
                            <span className="text-[#c9a227] font-bold text-lg">
                              Classic Queen
                            </span>
                          </div>
                        )}

                        {/* Category Badge */}
                        {item.category && (
                          <div className="absolute top-3 left-3">
                            <span
                              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full text-[#1a0d02]"
                              style={{
                                background:
                                  'linear-gradient(135deg, #f5d76e 0%, #c9a227 100%)',
                              }}
                            >
                              {item.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Divider line */}
                      <div className="h-px w-full bg-[#9A7B4F]" />

                      {/* Content — gradient brown panel */}
                      <div
                        className="
                          p-4 flex-1 flex flex-col
                          bg-[linear-gradient(135deg,#2E1503_50%,#362511_60%,#0a0703_100%)]
                        "
                      >
                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-[10px] text-[#c9a227] mb-2">
                          <Calendar size={11} />
                          <span>
                            {new Date(item.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        {/* Excerpt */}
                        <p className="text-white/60 text-xs mb-4 line-clamp-3 flex-1 leading-relaxed">
                          {item.excerpt || item.content?.substring(0, 90)}…
                        </p>

                        {/* Read More */}
                        <div className="flex items-center justify-end text-[#c9a227] text-xs font-semibold group-hover:text-[#f5d76e] transition-colors">
                          Read More
                          <ArrowRight
                            size={12}
                            className="ml-1 group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 p-[2px]"
              style={{
                background:
                  'conic-gradient(from 45deg, #7a5c14, #f9e79f, #c9a227, #fff4c2, #8a6a1a, #f5d76e, #7a5c14)',
              }}
            >
              <div className="flex items-center justify-center w-full h-full rounded-full bg-[#1a0d02]">
                <Search size={24} className="text-[#c9a227]" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No articles found</h3>
            <p className="text-white/50 text-sm">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    </div>
  )
}