'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const SponsorsSection = () => {
  const [isPaused, setIsPaused] = useState(false)
  const scrollContainerRef = useRef(null)
  const contentRef = useRef(null)
  
  // Sponsor type images instead of brand logos
  const sponsors = [
    {
      id: 1,
      name: 'Platinum Sponsors',
      logo: 'https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/platinum.jpg',
      type: 'Highest Level'
    },
    {
      id: 2,
      name: 'Gold Sponsors',
      logo: 'https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/gold.jpg',
      type: 'Premium Level'
    },
    {
      id: 3,
      name: 'Media Partners',
      logo: 'https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/media%20partner.jpg',
      type: 'Broadcast & Media'
    },
    {
      id: 4,
      name: 'Silver Sponsors',
      logo: 'https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/silver.jpg',
      type: 'Supporting Level'
    },
    // Duplicate a couple to fill more space for scrolling
    {
      id: 5,
      name: 'Platinum Sponsors',
      logo: 'https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/platinum.jpg',
      type: 'Highest Level'
    },
    {
      id: 6,
      name: 'Gold Sponsors',
      logo: 'https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/gold.jpg',
      type: 'Premium Level'
    },
    {
      id: 7,
      name: 'Media Partners',
      logo: 'https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/media%20partner.jpg',
      type: 'Broadcast & Media'
    },
    {
      id: 8,
      name: 'Silver Sponsors',
      logo: 'https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/silver.jpg',
      type: 'Supporting Level'
    }
  ]

  // Duplicate sponsors for seamless loop
  const duplicatedSponsors = [...sponsors, ...sponsors]

  // Auto-scroll functionality - single row, infinite smooth scroll
  useEffect(() => {
    if (!scrollContainerRef.current) return

    const scrollContainer = scrollContainerRef.current
    let scrollPosition = 0
    const scrollSpeed = 0.5
    let animationId
    let requestId

    const autoScroll = () => {
      if (isPaused) {
        requestId = requestAnimationFrame(autoScroll)
        return
      }

      scrollPosition += scrollSpeed
      
      // Reset to start when halfway through duplicated content
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
        scrollContainer.scrollLeft = 0
      }
      
      scrollContainer.scrollLeft = scrollPosition
      requestId = requestAnimationFrame(autoScroll)
    }

    requestId = requestAnimationFrame(autoScroll)

    return () => {
      if (requestId) {
        cancelAnimationFrame(requestId)
      }
    }
  }, [isPaused])

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-brown-50">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brown-900">
            OUR VALUED SPONSORS & PARTNERS
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-gold-500 to-gold-600 mx-auto mt-2 rounded-full"></div>
          <p className="text-brown-600 text-sm md:text-base mt-3 max-w-2xl mx-auto">
            This is a space for visionary brands ready to stand at the forefront of Africa’s most refined pageant experience.
          </p>
        </div>

        {/* Horizontal Scroll Container - SINGLE ROW */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-hidden whitespace-nowrap scrollbar-hide"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
          >
            {/* Single row of sponsor items - duplicated for seamless loop */}
            <div ref={contentRef} className="inline-flex gap-4 md:gap-6 py-2">
              {duplicatedSponsors.map((sponsor, index) => (
                <div 
                  key={`${sponsor.id}-${index}`}
                  className="inline-flex flex-shrink-0"
                  style={{
                    width: 'calc(33.333% - 0.5rem)', // 3 columns on mobile, accounting for gap
                  }}
                >
                  <div className="w-full group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-brown-100 hover:border-gold-200 h-full">
                    {/* Sponsor Logo - NOW USING YOUR SPONSOR TYPE IMAGES */}
                    <div className="relative aspect-square p-4 flex items-center justify-center">
                      <div className="relative w-full h-full">
                        <Image
                          src={sponsor.logo}
                          alt={`${sponsor.name}`}
                          fill
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 33vw, 25vw"
                          unoptimized
                        />
                      </div>
                    </div>
                    
                    {/* Sponsor Info Overlay - NO BRAND NAMES, JUST SPONSOR TYPE */}
                    <div className="absolute inset-0 bg-brown-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                      <h3 className="text-white font-bold text-center text-sm md:text-base">
                        {sponsor.name}
                      </h3>
                      <div className="mt-2 px-3 py-1 bg-gold-500/20 border border-gold-400/30 rounded-full">
                        <span className="text-gold-300 text-xs">
                          {sponsor.type}
                        </span>
                      </div>
                    </div>
                    
                    {/* REMOVED: Sponsor Type Badge - No tags/labels on the images */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient fade effects on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-brown-50 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brown-50 to-transparent pointer-events-none"></div>
        </div>

        {/* Responsive width styles */}
        <style jsx>{`
          @media (min-width: 768px) {
            .inline-flex.flex-shrink-0 {
              width: calc(25% - 1.125rem) !important;
            }
          }
          
          @media (min-width: 1024px) {
            .inline-flex.flex-shrink-0 {
              width: calc(20% - 1.2rem) !important;
            }
          }
          
          /* Hide scrollbar */
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Become a Sponsor CTA - CENTERED ON MOBILE */}
        <div className="text-center mt-8 md:mt-12">
          <div className="inline-flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 bg-gradient-to-r from-brown-50 to-gold-50 rounded-xl p-6 shadow-lg w-full max-w-2xl">
            <div className="text-center sm:text-left w-full sm:w-auto">
              <h3 className="text-lg md:text-xl font-bold text-brown-900">
                Become a Sponsor
              </h3>
              <p className="text-brown-600 text-sm mt-1">
                Partner with us and reach a premium audience
              </p>
            </div>
            <button className="px-6 py-2.5 bg-gradient-to-r from-brown-900 to-brown-800 hover:from-gold-600 hover:to-gold-500 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap w-full sm:w-auto">
              Contact for Sponsorship
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SponsorsSection