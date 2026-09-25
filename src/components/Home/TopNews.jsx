'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { motion } from 'motion/react'

export default function TopNews() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('id, title, excerpt, content, cover_image, category, created_at')
          .order('created_at', { ascending: false })
          .limit(4)

        if (cancelled) return
        if (error) throw error
        setNews(data || [])
      } catch (err) {
        console.error('Error fetching top news:', err)
        if (!cancelled) setNews([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  /* Hide the whole section if there's no news to show */
  if (!loading && news.length === 0) return null

  return (
    <section className="w-full py-10 md:py-14 bg-gradient-to-b from-[#2E1503] via-[#1a0d02] to-black">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* ---------- Header ---------- */}
        <div className="text-center mb-8 md:mb-10">
          
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold bg-[linear-gradient(135deg,#f5d76e,#c9a227,#9A7B4F,#c9a227,#f5d76e)] bg-clip-text text-transparent">
            Top News
          </h2>
          <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">
            Latest updates, exclusives, and behind-the-scenes stories.
          </p>
        </div>

        {/* ---------- Grid ---------- */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/5 border border-[#9A7B4F]/20 overflow-hidden animate-pulse"
              >
                <div className="w-full aspect-[4/3] bg-white/5" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-20 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/10" />
                  <div className="h-3 w-3/4 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {news.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link href={`/news/${item.id}`} className="block group h-full">
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
                      {/* Cover image */}
                      <div className="relative w-full aspect-[4/3] overflow-hidden bg-black">
                        {item.cover_image ? (
                          <Image
                            src={item.cover_image}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
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
                            <span className="text-[#c9a227] font-bold text-sm md:text-base">
                              Classic Queen
                            </span>
                          </div>
                        )}

                        {/* Category badge */}
                        {item.category && (
                          <div className="absolute top-2 left-2">
                            <span
                              className="px-2 py-0.5 text-[9px] md:text-[10px] font-bold uppercase tracking-wide rounded-full text-[#1a0d02]"
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

                      {/* Divider */}
                      <div className="h-px w-full bg-[#9A7B4F]" />

                      {/* Text panel */}
                      <div
                        className="
                          p-3 md:p-4 flex-1 flex flex-col
                          bg-[linear-gradient(135deg,#2E1503_50%,#362511_60%,#0a0703_100%)]
                        "
                      >
                        <div className="flex items-center gap-1.5 text-[10px] text-[#c9a227] mb-1.5">
                          <Calendar size={10} />
                          <span>
                            {new Date(item.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <h3 className="text-xs md:text-sm font-bold text-white mb-1.5 line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        <p className="hidden md:block text-white/60 text-xs mb-3 line-clamp-3 flex-1 leading-relaxed">
                          {item.excerpt || item.content?.substring(0, 90)}…
                        </p>

                        <div className="flex items-center justify-end text-[#c9a227] text-[10px] md:text-xs font-semibold group-hover:text-[#f5d76e] transition-colors mt-auto">
                          Read More
                          <ArrowRight
                            size={11}
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
        )}

        {/* ---------- More Updates button ---------- */}
        <div className="mt-8 md:mt-10 text-center">
          <Link
            href="/news"
            className="
              inline-flex items-center gap-2
              px-6 py-3 rounded-full
              text-sm font-bold text-[#1a0d02]
              transition-all duration-300
              hover:-translate-y-0.5 hover:shadow-lg
            "
            style={{
              backgroundImage:
                'linear-gradient(135deg, #f5d76e 0%, #c9a227 50%, #9A7B4F 100%)',
              boxShadow: '0 6px 18px rgba(201,162,39,0.4)',
            }}
          >
            More Updates
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}