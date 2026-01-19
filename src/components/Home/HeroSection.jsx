'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

const HeroSection = () => {
  const [heroItems, setHeroItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const [error, setError] = useState(null)
  const [transitionDirection, setTransitionDirection] = useState('next') // 'next' or 'prev'
  const [isTransitioning, setIsTransitioning] = useState(false)
  const videoRef = useRef(null)
  const slideInterval = useRef(null)

  // Fetch hero content from Supabase
  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const { data, error: supabaseError } = await supabase
          .from('classicqueen')
          .select('hero')
          .eq('id', 1989)
          .single()

        if (supabaseError) {
          setError('Failed to load hero content')
          
          // Fallback to sample data if database fetch fails
          const fallbackData = [
            {
              "cta": { "href": "/register", "label": "REGISTER NOW" },
              "src": "https://mttimgygxzfqzmnirfyq.supabase.co/storage/v1/object/public/heros/heros/fkyavyzu7dq_1767319747847.jpg",
              "type": "image"
            },
            {
              "cta": { "href": "/register", "label": "REGISTER NOW" },
              "src": "https://mttimgygxzfqzmnirfyq.supabase.co/storage/v1/object/public/heros/heros/queenvideo1.mp4",
              "type": "video"
            },
          ]
          setHeroItems(fallbackData)
          return
        }

        if (data?.hero) {
          // Parse the JSONB column
          let itemsArray
          if (Array.isArray(data.hero)) {
            itemsArray = data.hero
          } else {
            try {
              itemsArray = JSON.parse(data.hero || '[]')
            } catch {
              itemsArray = []
            }
          }
          
          // Add label to CTA if not present
          const formattedItems = itemsArray.map(item => ({
            ...item,
            cta: {
              href: item.cta?.href || '/register',
              label: item.cta?.label || 'REGISTER NOW'
            }
          }))
          
          setHeroItems(formattedItems)
          
          if (formattedItems.length === 0) {
            setError('No hero items found in database')
          }
        } else {
          setError('No hero content available')
          setHeroItems([])
        }
        
      } catch {
        setError('Error loading hero content')
        setHeroItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeroContent()
  }, [])

  // Handle video ended event
  const handleVideoEnded = () => {
    if (heroItems.length <= 1) return
    
    setIsTransitioning(true)
    setTransitionDirection('next')
    
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === heroItems.length - 1 ? 0 : prevIndex + 1
      )
      setIsTransitioning(false)
    }, 300)
  }

  // Setup video event listeners
  useEffect(() => {
    const videoElement = videoRef.current
    if (videoElement) {
      videoElement.addEventListener('ended', handleVideoEnded)
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('ended', handleVideoEnded)
      }
    }
  }, [currentIndex, heroItems.length])

  // Auto-slide for images only (8-second intervals)
  useEffect(() => {
    if (!isPlaying || heroItems.length <= 1 || heroItems[currentIndex]?.type === 'video') {
      clearInterval(slideInterval.current)
      return
    }

    clearInterval(slideInterval.current)
    
    slideInterval.current = setInterval(() => {
      if (!isTransitioning) {
        slideToNext()
      }
    }, 8000)

    return () => clearInterval(slideInterval.current)
  }, [isPlaying, heroItems.length, currentIndex, isTransitioning])

  // Video controls
  useEffect(() => {
    if (heroItems[currentIndex]?.type === 'video') {
      const video = videoRef.current
      if (video) {
        video.muted = isMuted
        video.currentTime = 0
        
        if (isPlaying) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      }
    }
  }, [currentIndex, isPlaying, isMuted])

  // Smooth slide functions
  const slideToNext = () => {
    if (heroItems.length <= 1 || isTransitioning) return
    
    setIsTransitioning(true)
    setTransitionDirection('next')
    
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === heroItems.length - 1 ? 0 : prevIndex + 1
      )
      setIsTransitioning(false)
    }, 300)
  }
  
  const slideToPrev = () => {
    if (heroItems.length <= 1 || isTransitioning) return
    
    setIsTransitioning(true)
    setTransitionDirection('prev')
    
    setTimeout(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? heroItems.length - 1 : prevIndex - 1
      )
      setIsTransitioning(false)
    }, 300)
  }

  const togglePlayPause = () => setIsPlaying(!isPlaying)
  const toggleMute = () => setIsMuted(!isMuted)
  
  const nextSlide = () => slideToNext()
  const prevSlide = () => slideToPrev()

  // Get video progress
  const [videoProgress, setVideoProgress] = useState(0)
  useEffect(() => {
    if (heroItems[currentIndex]?.type === 'video') {
      const video = videoRef.current
      if (!video) return

      const updateProgress = () => {
        if (video.duration) {
          setVideoProgress((video.currentTime / video.duration) * 100)
        }
      }

      video.addEventListener('timeupdate', updateProgress)
      return () => video.removeEventListener('timeupdate', updateProgress)
    }
  }, [currentIndex, heroItems])

  // Calculate transition classes
  const getTransitionClasses = () => {
    if (!isTransitioning) return ''
    
    if (transitionDirection === 'next') {
      return 'translate-x-full opacity-0'
    } else {
      return '-translate-x-full opacity-0'
    }
  }

  if (isLoading) {
    return (
      <div className="w-full aspect-[4/1] md:aspect-[4/1.5] bg-gradient-to-br from-brown-900 via-brown-800 to-brown-900">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto"></div>
            <p className="mt-4 text-gray-300">Loading hero content...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && heroItems.length === 0) {
    return (
      <div className="w-full aspect-[4/1] md:aspect-[4/1.5] bg-gradient-to-br from-brown-900 via-brown-800 to-brown-900">
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-6">
            <div className="h-16 w-16 mx-auto bg-brown-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gold-500 text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Hero Content Unavailable</h3>
            <p className="text-gray-300 mb-6 max-w-md">{error}</p>
            <p className="text-sm text-gray-400">Check your database connection or add content via Hero Manager</p>
          </div>
        </div>
      </div>
    )
  }

  if (heroItems.length === 0) {
    return (
      <div className="w-full aspect-[4/1] md:aspect-[4/1.5] bg-gradient-to-br from-brown-900 via-brown-800 to-brown-900">
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-6">
            <div className="h-16 w-16 mx-auto bg-brown-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-gold-500 text-2xl">📷</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Hero Content</h3>
            <p className="text-gray-300 mb-6">Add hero images or videos via the Hero Manager</p>
            <Link
              href="/admin"
              className="inline-flex items-center bg-gold-500 hover:bg-gold-600 text-brown-900 font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Go to Hero Manager
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currentItem = heroItems[currentIndex]
  const isVideo = currentItem.type === 'video'

  return (
    <div className="relative w-full aspect-[4/1.5] md:aspect-[4/1] overflow-hidden mt-0 pt-0">
      {/* Main Slide Container with Transition */}
      <div className="absolute inset-0">
        {heroItems.map((item, index) => {
          const isActive = index === currentIndex
          const isPrevious = index === (currentIndex === 0 ? heroItems.length - 1 : currentIndex - 1)
          const isNext = index === (currentIndex === heroItems.length - 1 ? 0 : currentIndex + 1)
          
          // Determine position for smooth transitions
          let positionClass = ''
          if (isActive) {
            positionClass = 'translate-x-0'
          } else if (isPrevious) {
            positionClass = '-translate-x-full'
          } else if (isNext) {
            positionClass = 'translate-x-full'
          } else {
            positionClass = 'translate-x-full'
          }

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-500 ease-in-out ${positionClass} ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              {item.type === 'image' ? (
                <div className="relative w-full h-full">
                  <Image
                    src={item.src}
                    alt="Hero slide"
                    fill
                    className="object-cover"
                    priority={isActive}
                    sizes="100vw"
                    unoptimized
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <video
                    ref={isActive ? videoRef : null}
                    src={item.src}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay={isActive && isPlaying}
                    loop={false}
                    muted={isActive && isMuted}
                    playsInline
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Dark overlay at bottom for CTA visibility */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent z-20"></div>

      {/* CTA Button - BOTTOM LEFT */}
      <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-30">
        <Link
          href={currentItem.cta?.href || '/register'}
          className="inline-flex items-center justify-center bg-gold-500 hover:bg-gold-600 text-brown-900 font-bold py-1.5 md:py-3 px-3 md:px-8 rounded-lg text-xs md:text-lg transition-all duration-300 hover:scale-105 shadow-2xl scale-90 md:scale-100"
        >
          {currentItem.cta?.label || 'REGISTER NOW'}
        </Link>
      </div>

      {/* Volume Toggle Button (only for videos) */}
      {currentItem.type === 'video' && (
        <button
          onClick={toggleMute}
          className="absolute bottom-4 md:bottom-6 right-4 md:right-6 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}

      {/* CONTROLS - Hidden by default */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-30 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="flex items-center space-x-4 bg-black/40 backdrop-blur-sm rounded-full px-4 py-2">
          <button
            onClick={togglePlayPause}
            className="text-white hover:text-gold-300 transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          <button
            onClick={prevSlide}
            className="text-white hover:text-gold-300 transition-colors"
            aria-label="Previous"
            disabled={isTransitioning}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Slide Dots */}
          <div className="flex items-center space-x-2">
            {heroItems.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true)
                    setTransitionDirection(index > currentIndex ? 'next' : 'prev')
                    setTimeout(() => {
                      setCurrentIndex(index)
                      setIsTransitioning(false)
                    }, 300)
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-gold-500 w-4' 
                    : 'bg-white/50 hover:bg-white'
                } ${isTransitioning ? 'cursor-not-allowed' : ''}`}
                aria-label={`Slide ${index + 1}`}
                disabled={isTransitioning}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="text-white hover:text-gold-300 transition-colors"
            aria-label="Next"
            disabled={isTransitioning}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar - TOP (thin line) - Only show for images */}
      {!isVideo && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/30 z-30">
          <div 
            className="h-full bg-gold-500 transition-all duration-8000 ease-linear"
            style={{ 
              width: isPlaying ? `${(currentIndex / (heroItems.length - 1)) * 100}%` : '0%'
            }}
          />
        </div>
      )}

      {/* Video progress indicator - TOP (thin line) */}
      {isVideo && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/30 z-30">
          <div 
            className="h-full bg-gold-500 transition-all duration-100 ease-linear"
            style={{ 
              width: `${videoProgress}%`
            }}
          />
        </div>
      )}
    </div>
  )
}

export default HeroSection