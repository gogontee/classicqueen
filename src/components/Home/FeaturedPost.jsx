'use client'

import { useState, useEffect, useRef } from 'react'
import { Download, Share2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

const FeaturedPost = () => {
  const [featuredItems, setFeaturedItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const modalRef = useRef(null)

  // Fetch featured posts from Supabase
  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
          .from('classicqueen')
          .select('feature_post')
          .single()

        if (error) throw error

        if (data?.feature_post) {
          setFeaturedItems(data.feature_post)
        } else {
          // Fallback to sample data
          setFeaturedItems([
            {
              "type": "video",
              "src": "https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/Smiles_as_the_202601021954_og4d5.mp4",
              "caption": "Her journey to the crown 👑",
              "href": "/gallery"
            },
            {
              "type": "image",
              "src": "https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/queen6.jpg",
              "caption": "Grace, elegance and royalty ✨",
              "href": "/gallery"
            },
            {
              "type": "image",
              "src": "https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/queen5.jpg",
              "caption": "Beauty crowned with purpose 👑",
              "href": "/gallery"
            },
            {
              "type": "image",
              "src": "https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/queen3.jpg",
              "caption": "Confidence. Poise. Power.",
              "href": "/gallery"
            }
          ])
        }
      } catch (error) {
        console.error('Error fetching posts:', error)
        setFeaturedItems([
          {
            "type": "video",
            "src": "https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/Smiles_as_the_202601021954_og4d5.mp4",
            "caption": "Her journey to the crown 👑",
            "href": "/gallery"
          },
          {
            "type": "image",
            "src": "https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/queen6.jpg",
            "caption": "Grace, elegance and royalty ✨",
            "href": "/gallery"
          },
          {
            "type": "image",
            "src": "https://prolgmzklxduqnizyhqau.supabase.co/storage/v1/object/public/classic/queen5.jpg",
            "caption": "Beauty crowned with purpose 👑",
            "href": "/gallery"
          },
          {
            "type": "image",
            "src": "https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/queen3.jpg",
            "caption": "Confidence. Poise. Power.",
            "href": "/gallery"
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedPosts()
  }, [])

  // Handle keyboard navigation in modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return
      
      switch(e.key) {
        case 'Escape':
          closeModal()
          break
        case 'ArrowRight':
          navigateToNext()
          break
        case 'ArrowLeft':
          navigateToPrev()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, currentIndex])

  // Handle touch/swipe gestures for mobile
  useEffect(() => {
    if (!modalRef.current || !isModalOpen) return

    let touchStartX = 0
    let touchEndX = 0

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX
    }

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX
      handleSwipe()
    }

    const handleSwipe = () => {
      const swipeThreshold = 50
      const diff = touchStartX - touchEndX

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next
          navigateToNext()
        } else {
          // Swipe right - previous
          navigateToPrev()
        }
      }
    }

    const modalElement = modalRef.current
    modalElement.addEventListener('touchstart', handleTouchStart)
    modalElement.addEventListener('touchend', handleTouchEnd)

    return () => {
      modalElement.removeEventListener('touchstart', handleTouchStart)
      modalElement.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isModalOpen, currentIndex])

  const handleItemClick = (item, index) => {
    setSelectedItem(item)
    setCurrentIndex(index)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = 'auto'
    setTimeout(() => {
      setSelectedItem(null)
      setCurrentIndex(0)
    }, 300)
  }

  const navigateToNext = () => {
    if (featuredItems.length > 0) {
      const nextIndex = (currentIndex + 1) % featuredItems.length
      setSelectedItem(featuredItems[nextIndex])
      setCurrentIndex(nextIndex)
    }
  }

  const navigateToPrev = () => {
    if (featuredItems.length > 0) {
      const prevIndex = (currentIndex - 1 + featuredItems.length) % featuredItems.length
      setSelectedItem(featuredItems[prevIndex])
      setCurrentIndex(prevIndex)
    }
  }

  const handleShare = async () => {
    if (selectedItem) {
      const shareUrl = selectedItem.src
      if (navigator.share) {
        try {
          await navigator.share({
            title: selectedItem.caption,
            text: `Check out this ${selectedItem.type} from Classic Queen`,
            url: shareUrl,
          })
        } catch (error) {
          console.log('Sharing failed:', error)
          await navigator.clipboard.writeText(shareUrl)
          alert('Link copied to clipboard!')
        }
      } else {
        await navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
      }
    }
  }

  const handleDownload = () => {
    if (selectedItem) {
      const link = document.createElement('a')
      link.href = selectedItem.src
      link.download = `classic-queen-${selectedItem.type}-${Date.now()}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (isLoading) {
    return (
      <div className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 text-brown-900">Featured Post</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-brown-100 to-brown-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <section className="py-8 bg-gradient-to-b from-white to-brown-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-brown-900">
          Featured Post
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredItems.map((item, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleItemClick(item, index)}
            >
              {/* Media Container */}
              <div className="absolute inset-0">
                {item.type === 'image' ? (
                  <Image
                    src={item.src}
                    alt={item.caption}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.src}
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  </div>
                )}
              </div>

              {/* Caption Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-white text-sm font-medium truncate">{item.caption}</p>
              </div>

              {/* Type Indicator - Hidden from users */}
              <div className="sr-only">
                {item.type === 'video' ? 'VIDEO' : 'IMAGE'}
              </div>
            </div>
          ))}
        </div>

        {/* View All Link and Description */}
        <div className="text-center mt-8 max-w-3xl mx-auto">
          <Link
            href="/gallery"
            className="inline-flex items-center text-brown-900 hover:text-brown-700 font-semibold border-b-2 border-gold-500 pb-1 mb-4"
          >
            View All Featured Posts
            <ChevronRight size={20} className="ml-1" />
          </Link>
          
          {/* Description of Classic Queen International Pageant */}
          <div className="mt-6 px-4">
            <p className="text-brown-700 text-sm md:text-lg leading-relaxed">
              Classic Queen International Pageant celebrates elegance, intelligence, and purpose-driven women 
              from around the world. Our platform empowers queens to showcase their unique talents, advocate 
              for meaningful causes, and inspire positive change in their communities. Through this prestigious 
              competition, we honor women who embody grace, confidence, and the transformative power of leadership.
            </p>
          </div>
        </div>
      </div>

      {/* Instagram-style Modal */}
      {isModalOpen && selectedItem && (
        <div 
          ref={modalRef}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-50 text-white hover:text-gold-300 bg-black/50 rounded-full p-2"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Media Container */}
          <div 
            className="relative w-full max-w-4xl h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Arrows */}
            {featuredItems.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToPrev()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:text-gold-300 bg-black/50 rounded-full p-2 md:p-3"
                  aria-label="Previous"
                >
                  <ChevronLeft size={24} className="md:hidden" />
                  <ChevronLeft size={32} className="hidden md:block" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:text-gold-300 bg-black/50 rounded-full p-2 md:p-3"
                  aria-label="Next"
                >
                  <ChevronRight size={24} className="md:hidden" />
                  <ChevronRight size={32} className="hidden md:block" />
                </button>
              </>
            )}

            {/* Media Display */}
            <div className="relative w-full h-full max-h-screen flex items-center justify-center">
              {selectedItem.type === 'image' ? (
                <Image
                  src={selectedItem.src}
                  alt={selectedItem.caption}
                  fill
                  className="object-contain"
                  unoptimized
                  priority
                />
              ) : (
                <video
                  src={selectedItem.src}
                  className="w-full h-full max-h-screen object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between">
              {/* Caption */}
              <div className="flex-1">
                <p className="text-white text-sm md:text-base">{selectedItem.caption}</p>
              </div>

              {/* Action Icons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDownload()
                  }}
                  className="text-white hover:text-gold-300 transition-colors"
                  aria-label="Download"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare()
                  }}
                  className="text-white hover:text-gold-300 transition-colors"
                  aria-label="Share"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Current Index Indicator */}
            {featuredItems.length > 1 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
                <div className="flex gap-1">
                  {featuredItems.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full ${
                        index === currentIndex ? 'bg-gold-300' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

export default FeaturedPost