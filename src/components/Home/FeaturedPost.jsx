'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const DEFAULT_FALLBACK_ITEMS = [
  { type: 'image', src: '/featured1.jpeg', caption: 'Elegance personified 👑', href: '/gallery' },
  { type: 'image', src: '/featured2.jpeg', caption: 'Grace and beauty ✨', href: '/gallery' },
  { type: 'image', src: '/featured3.jpeg', caption: 'Confidence in every step 💫', href: '/gallery' },
  { type: 'image', src: '/featured4.jpeg', caption: 'Queen with purpose 👑', href: '/gallery' }
]

const GOLD_GRADIENT =
  'linear-gradient(90deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #BF953F 100%)'

const AUTO_SCROLL_PX_PER_SEC = 24
const RESUME_AFTER_MS        = 5000
const DESKTOP_AUTOSCROLL_MIN = 7
const MAX_DT                 = 0.05 // cap frame delta at 50ms to prevent post-stall jumps

export default function FeaturedPost() {
  const [featuredItems, setFeaturedItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const modalRef = useRef(null)

  // -------- desktop track --------
  const desktopRef          = useRef(null)
  const desktopRaf          = useRef(null)
  const desktopLastTs       = useRef(0)
  const desktopSetWidth     = useRef(0)
  const desktopPaused       = useRef(false)
  const desktopResumeTimer  = useRef(null)
  const desktopExpected     = useRef(0) // last scrollLeft value WE wrote

  // -------- mobile top track --------
  const topRef              = useRef(null)
  const topRaf              = useRef(null)
  const topLastTs           = useRef(0)
  const topSetWidth         = useRef(0)
  const topPaused           = useRef(false)
  const topResumeTimer      = useRef(null)
  const topExpected         = useRef(0)

  // -------- mobile bottom track (reverse) --------
  const bottomRef           = useRef(null)
  const bottomRaf           = useRef(null)
  const bottomLastTs        = useRef(0)
  const bottomSetWidth      = useRef(0)
  const bottomPaused        = useRef(false)
  const bottomResumeTimer   = useRef(null)
  const bottomExpected      = useRef(0)

  // ------------------- fetch -------------------
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('classicqueen')
          .select('feature_post')
          .single()
        if (error) throw error
        if (data?.feature_post && data.feature_post.length > 0) {
          setFeaturedItems(data.feature_post)
        } else {
          setFeaturedItems(DEFAULT_FALLBACK_ITEMS)
        }
      } catch (err) {
        console.error('Error fetching posts:', err)
        setFeaturedItems(DEFAULT_FALLBACK_ITEMS)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFeaturedPosts()
  }, [])

  // ------------------- modal keyboard nav -------------------
  useEffect(() => {
    if (!isModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight') navigateToNext()
      if (e.key === 'ArrowLeft') navigateToPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isModalOpen, currentIndex, featuredItems])

  // ------------------- generic pause/resume -------------------
  const makePauseResume = (pausedRef, resumeTimerRef) => {
    const pause = () => {
      pausedRef.current = true
      setIsPaused(true)
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current)
        resumeTimerRef.current = null
      }
    }
    const scheduleResume = () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = setTimeout(() => {
        pausedRef.current = false
        setIsPaused(false)
      }, RESUME_AFTER_MS)
    }
    return { pause, scheduleResume }
  }

  // ------------------- one autoscroll loop per track -------------------
  // dir = 1 → scrollLeft increases (moves left). dir = -1 → decreases (moves right).
  const startAutoScroll = (
    trackRef, rafRef, lastTsRef, setWidthRef, pausedRef, expectedRef, dir = 1
  ) => {
    const track = trackRef.current
    if (!track) return () => {}

    const measure = () => {
      setWidthRef.current = track.scrollWidth / 2
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)

    // reverse track: start mid-way so we have room to move backwards
    if (dir === -1 && setWidthRef.current > 0) {
      track.scrollLeft = setWidthRef.current
      expectedRef.current = track.scrollLeft
    } else {
      expectedRef.current = track.scrollLeft
    }

    const step = (ts) => {
      if (!lastTsRef.current) lastTsRef.current = ts
      let dt = (ts - lastTsRef.current) / 1000
      if (dt > MAX_DT) dt = MAX_DT
      lastTsRef.current = ts

      if (!pausedRef.current && track) {
        track.scrollLeft += AUTO_SCROLL_PX_PER_SEC * dt * dir

        const w = setWidthRef.current
        if (w > 0) {
          if (dir === 1 && track.scrollLeft >= w) track.scrollLeft -= w
          else if (dir === -1 && track.scrollLeft <= 0) track.scrollLeft += w
        }

        // remember exactly what we wrote, so the scroll listener can tell
        // whether the scroll event was caused by us or by the user
        expectedRef.current = track.scrollLeft
      }
      rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      lastTsRef.current = 0
      ro.disconnect()
    }
  }

  // ------------------- attach user-interaction pause listeners -------------------
  const attachPauseHandlers = (trackRef, pausedRef, resumeTimerRef, expectedRef) => {
    const track = trackRef.current
    if (!track) return () => {}
    const { pause, scheduleResume } = makePauseResume(pausedRef, resumeTimerRef)
    const onInteract = () => { pause(); scheduleResume() }

    track.addEventListener('wheel', onInteract, { passive: true })
    track.addEventListener('touchstart', onInteract, { passive: true })
    track.addEventListener('touchmove', onInteract, { passive: true })
    track.addEventListener('pointerdown', onInteract)

    // Only pause on scroll events that we did NOT cause.
    // Our RAF loop writes to expectedRef.current each frame; if the
    // actual scrollLeft differs from that, the user scrolled.
    track.addEventListener('scroll', () => {
      const diff = Math.abs(track.scrollLeft - expectedRef.current)
      if (diff > 1) {
        if (!pausedRef.current) { pause(); scheduleResume() }
      }
    }, { passive: true })

    return () => {
      track.removeEventListener('wheel', onInteract)
      track.removeEventListener('touchstart', onInteract)
      track.removeEventListener('touchmove', onInteract)
      track.removeEventListener('pointerdown', onInteract)
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    }
  }

  // ------------------- boot all tracks when items load -------------------
  useEffect(() => {
    if (isLoading || featuredItems.length === 0) return

    const cleanups = []

    // Desktop: only auto-scroll if 7+ items
    if (featuredItems.length >= DESKTOP_AUTOSCROLL_MIN) {
      cleanups.push(startAutoScroll(
        desktopRef, desktopRaf, desktopLastTs, desktopSetWidth,
        desktopPaused, desktopExpected, 1
      ))
      cleanups.push(attachPauseHandlers(
        desktopRef, desktopPaused, desktopResumeTimer, desktopExpected
      ))
    }

    // Mobile: need at least 4 to bother
    if (featuredItems.length >= 4) {
      cleanups.push(startAutoScroll(
        topRef, topRaf, topLastTs, topSetWidth,
        topPaused, topExpected, 1
      ))
      cleanups.push(attachPauseHandlers(
        topRef, topPaused, topResumeTimer, topExpected
      ))

      cleanups.push(startAutoScroll(
        bottomRef, bottomRaf, bottomLastTs, bottomSetWidth,
        bottomPaused, bottomExpected, -1
      ))
      cleanups.push(attachPauseHandlers(
        bottomRef, bottomPaused, bottomResumeTimer, bottomExpected
      ))
    }

    return () => cleanups.forEach((fn) => fn && fn())
  }, [isLoading, featuredItems])

  // ------------------- handlers -------------------
  const handleItemClick = (item, index) => {
    setSelectedItem(item)
    setCurrentIndex(index)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }
  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = ''
    setTimeout(() => { setSelectedItem(null); setCurrentIndex(0) }, 300)
  }
  const navigateToNext = () => {
    if (!featuredItems.length) return
    const n = (currentIndex + 1) % featuredItems.length
    setSelectedItem(featuredItems[n]); setCurrentIndex(n)
  }
  const navigateToPrev = () => {
    if (!featuredItems.length) return
    const p = (currentIndex - 1 + featuredItems.length) % featuredItems.length
    setSelectedItem(featuredItems[p]); setCurrentIndex(p)
  }
  const handleShare = async () => {
    if (!selectedItem) return
    const shareUrl = selectedItem.src
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedItem.caption,
          text: `Check out this ${selectedItem.type} from Classic Queen`,
          url: shareUrl,
        })
      } catch {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }
  const handleDownload = () => {
    if (!selectedItem) return
    const link = document.createElement('a')
    link.href = selectedItem.src
    link.download = `classic-queen-${selectedItem.type}-${Date.now()}`
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
  }

  // ------------------- early returns -------------------
  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 text-brown-900">Featured Post</h2>
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 aspect-[3/4] bg-gradient-to-br from-brown-100 to-brown-200 rounded-lg animate-pulse"
                style={{ width: 'calc((100% - 3rem) / 5)' }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!featuredItems.length) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 text-brown-900">Featured Post</h2>
          <div className="text-center p-8 bg-brown-50 rounded-lg">
            <p className="text-brown-600">No featured posts available.</p>
          </div>
        </div>
      </div>
    )
  }

  // render each item twice for the seamless loop — same as ContentScroll
  const loopItems = [...featuredItems, ...featuredItems]

  return (
    <section className="w-full py-8 bg-gradient-to-b from-white to-brown-50">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl md:text-4xl font-bold mb-6 text-brown-900">
          Past Queens
        </h2>
      </div>

      {/* ---------------- DESKTOP: one row, scroll left ---------------- */}
      <div
        ref={desktopRef}
        className="
          hidden md:flex gap-4 overflow-x-auto
          [scrollbar-width:none] [-ms-overflow-style:none]
          [&::-webkit-scrollbar]:hidden
          px-4 md:px-6 select-none
        "
        style={{ touchAction: 'pan-x' }}
      >
        {loopItems.map((item, i) => (
          <FeaturedCard
            key={`d-${i}`}
            item={item}
            onClick={() => handleItemClick(item, i % featuredItems.length)}
            widthClass="md:w-[calc((100%-3rem)/5)]"
          />
        ))}
      </div>

      {/* ---------------- MOBILE: two rows, opposite directions ---------------- */}
      <div className="md:hidden space-y-4">
        {/* top row — scroll left */}
        <div
          ref={topRef}
          className="
            flex gap-3 overflow-x-auto
            [scrollbar-width:none] [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
            px-4 select-none
          "
          style={{ touchAction: 'pan-x' }}
        >
          {loopItems.map((item, i) => (
            <FeaturedCard
              key={`t-${i}`}
              item={item}
              onClick={() => handleItemClick(item, i % featuredItems.length)}
              widthClass="w-[44vw] sm:w-[30vw]"
            />
          ))}
        </div>

        {/* bottom row — scroll right */}
        <div
          ref={bottomRef}
          className="
            flex gap-3 overflow-x-auto
            [scrollbar-width:none] [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
            px-4 select-none
          "
          style={{ touchAction: 'pan-x' }}
        >
          {loopItems.map((item, i) => (
            <FeaturedCard
              key={`b-${i}`}
              item={item}
              onClick={() => handleItemClick(item, i % featuredItems.length)}
              widthClass="w-[44vw] sm:w-[30vw]"
            />
          ))}
        </div>

        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="flex justify-center"
            >
              <span className="text-[10px] text-brown-400">
                Auto-scroll resumes in a few seconds…
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------------- View All + description ---------------- */}
      <div className="container mx-auto px-4">
        <div className="mx-auto mt-8 max-w-3xl text-center">
          
          <div className="mt-6 px-4">
            <p className="text-sm leading-relaxed text-brown-700 md:text-lg">
              Classic Queen International Pageant celebrates elegance, intelligence, and purpose-driven women
              from around the world. Our platform empowers queens to showcase their unique talents, advocate
              for meaningful causes, and inspire positive change in their communities. Through this prestigious
              competition, we honor women who embody grace, confidence, and the transformative power of leadership.
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- Lightbox ---------------- */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {featuredItems.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateToPrev() }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateToNext() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}

            <motion.div
              key={selectedItem.src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedItem.type === 'video' ? (
                <video
                  src={selectedItem.src}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] w-auto max-w-full rounded-xl"
                />
              ) : (
                <img
                  src={selectedItem.src}
                  alt={selectedItem.caption || ''}
                  className="max-h-[80vh] w-auto max-w-full object-contain rounded-xl"
                />
              )}

              <div className="mt-4 flex items-center gap-4">
                {selectedItem.caption && (
                  <p className="text-white/80 text-sm text-center">
                    {selectedItem.caption}
                  </p>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDownload() }}
                  className="text-white/80 hover:text-gold-300 transition-colors"
                  aria-label="Download"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleShare() }}
                  className="text-white/80 hover:text-gold-300 transition-colors"
                  aria-label="Share"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

// ------------------- Card — same shape as ContentCard, with gold outline + 3:4 -------------------
function FeaturedCard({ item, onClick, widthClass }) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex-shrink-0 overflow-hidden rounded-xl
        p-[2px] transition-transform duration-300 hover:scale-[1.02]
        aspect-[3/4]
        ${widthClass}
      `}
      style={{ background: GOLD_GRADIENT }}
    >
      <div className="relative w-full h-full overflow-hidden rounded-[10px] bg-black">
        {item.type === 'video' ? (
          <>
            <video
              src={item.src}
              muted
              playsInline
              preload="metadata"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
          </>
        ) : (
          <img
            src={item.src}
            alt={item.caption || ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {item.caption && (
          <p className="absolute bottom-0 left-0 right-0 p-2 text-[10px] md:text-xs text-white/90 text-left line-clamp-2">
            {item.caption}
          </p>
        )}
      </div>
    </button>
  )
}