'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const HeroSection = () => {
  const [heroItems, setHeroItems] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true) // Start muted for autoplay compliance
  const videoRef = useRef(null)
  const slideInterval = useRef(null)

  // Fetch hero content
  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        setIsLoading(true)
        
        // TODO: Replace with your API call
        const heroData = [
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
        
        setHeroItems(heroData)
        
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeroContent()
  }, [])

  // Handle video ended event
  const handleVideoEnded = () => {
    if (heroItems.length <= 1) return
    
    // Move to next slide when video ends
    setCurrentIndex((prevIndex) => 
      prevIndex === heroItems.length - 1 ? 0 : prevIndex + 1
    )
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
    // Don't auto-slide if current item is a video (videos handle their own timing)
    if (!isPlaying || heroItems.length <= 1 || heroItems[currentIndex]?.type === 'video') {
      clearInterval(slideInterval.current)
      return
    }

    clearInterval(slideInterval.current)
    
    slideInterval.current = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === heroItems.length - 1 ? 0 : prevIndex + 1
      )
    }, 8000)

    return () => clearInterval(slideInterval.current)
  }, [isPlaying, heroItems.length, currentIndex])

  // Video controls
  useEffect(() => {
    if (heroItems[currentIndex]?.type === 'video') {
      const video = videoRef.current
      if (video) {
        video.muted = isMuted
        
        // Reset video to beginning when slide changes
        video.currentTime = 0
        
        if (isPlaying) {
          video.play().catch(e => console.log('Video autoplay failed:', e))
        } else {
          video.pause()
        }
      }
    }
  }, [currentIndex, isPlaying, isMuted])

  const togglePlayPause = () => setIsPlaying(!isPlaying)
  const toggleMute = () => setIsMuted(!isMuted)
  
  const nextSlide = () => {
    if (heroItems.length <= 1) return
    setCurrentIndex((prevIndex) => 
      prevIndex === heroItems.length - 1 ? 0 : prevIndex + 1
    )
  }
  
  const prevSlide = () => {
    if (heroItems.length <= 1) return
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? heroItems.length - 1 : prevIndex - 1
    )
  }

  if (isLoading) {
    return (
      <div className="w-full aspect-[4/1] md:aspect-[4/1.5] bg-gradient-to-br from-brown-900 via-brown-800 to-brown-900">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
        </div>
      </div>
    )
  }

  if (heroItems.length === 0) return null

  const currentItem = heroItems[currentIndex]
  const isVideo = currentItem.type === 'video'

  return (
    // ✅ NO GAP: removed any top margin/padding
    <div className="relative w-full aspect-[4/1.5] md:aspect-[4/1] overflow-hidden mt-0 pt-0">
      {/* Media Display */}
      <div className="absolute inset-0">
        {currentItem.type === 'image' ? (
          <div className="relative w-full h-full">
            <Image
              src={currentItem.src}
              alt="Hero slide"
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <video
              id="hero-video"
              ref={videoRef}
              src={currentItem.src}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay={isPlaying}
              loop={false} // Disable loop since we want to go to next slide on end
              muted={isMuted}
              playsInline
            />
          </div>
        )}
      </div>

      {/* Dark overlay at bottom for CTA visibility */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/80 to-transparent"></div>

      {/* ✅ CTA Button - BOTTOM LEFT (70% smaller on mobile) */}
      <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 z-10">
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
          className="absolute bottom-4 md:bottom-6 right-4 md:right-6 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}

      {/* ✅ CONTROLS - HIDDEN (invisible to users) */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-20 opacity-0 hover:opacity-100 transition-opacity duration-300">
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
          >
            <ChevronLeft size={20} />
          </button>

          {/* Slide Dots */}
          <div className="flex items-center space-x-2">
            {heroItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'bg-gold-500 w-4' 
                    : 'bg-white/50 hover:bg-white'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="text-white hover:text-gold-300 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Progress Bar - TOP (thin line) - Only show for images */}
      {!isVideo && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/30">
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
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/30">
          <div 
            className="h-full bg-gold-500 transition-all duration-100 ease-linear"
            style={{ 
              width: videoRef.current 
                ? `${(videoRef.current.currentTime / videoRef.current.duration) * 100}%` 
                : '0%'
            }}
          />
        </div>
      )}

      {/* Slide Indicator - TOP RIGHT (hidden) */}
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0">
        {currentIndex + 1}/{heroItems.length}
      </div>

      {/* Media type indicator (hidden, for debugging) */}
      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs opacity-0">
        {currentItem.type} {isVideo && videoRef.current && `(${Math.round(videoRef.current.currentTime)}s / ${Math.round(videoRef.current.duration)}s)`}
      </div>
    </div>
  )
}

export default HeroSection