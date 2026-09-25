'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const SponsorsSection = () => {
  const [isPaused, setIsPaused] = useState(false)
  const [imageErrors, setImageErrors] = useState({})
  const scrollContainerRef = useRef(null)
  const contentRef = useRef(null)
  const router = useRouter()

  const sponsors = [
    {
      id: 1,
      name: 'Platinum Sponsors',
      logo: '/sponsor1.jpeg',
      fallbackLogo: '/sponsor1.jpeg',
      type: 'Highest Level',
    },
    {
      id: 2,
      name: 'Gold Sponsors',
      logo: '/sponsor2.jpeg',
      fallbackLogo: '/sponsor2.jpeg',
      type: 'Premium Level',
    },
    {
      id: 3,
      name: 'Media Partners',
      logo: '/sponsor3.jpeg',
      fallbackLogo: '/sponsor3.jpeg',
      type: 'Broadcast & Media',
    },
    {
      id: 4,
      name: 'Silver Sponsors',
      logo: '/sponsor4.jpeg',
      fallbackLogo: '/sponsor4.jpeg',
      type: 'Supporting Level',
    },
    {
      id: 5,
      name: 'Platinum Sponsors',
      logo: '/sponsor5.jpeg',
      fallbackLogo: '/sponsor5.jpeg',
      type: 'Highest Level',
    },
    {
      id: 6,
      name: 'Gold Sponsors',
      logo: '/sponsor6.jpeg',
      fallbackLogo: '/sponsor6.jpeg',
      type: 'Premium Level',
    },
  ]

  const handleImageError = (sponsorId, sponsorName) => {
    setImageErrors((prev) => ({
      ...prev,
      [sponsorId]: true,
    }))
    console.log(`Failed to load image for ${sponsorName}, using fallback`)
  }

  const getImageSrc = (sponsor) => {
    if (imageErrors[sponsor.id]) {
      return sponsor.fallbackLogo
    }
    return sponsor.logo
  }

  const duplicatedSponsors = [...sponsors, ...sponsors]

  useEffect(() => {
    if (!scrollContainerRef.current) return

    const scrollContainer = scrollContainerRef.current
    let scrollPosition = 0
    const scrollSpeed = 0.5
    let requestId

    const autoScroll = () => {
      if (isPaused) {
        requestId = requestAnimationFrame(autoScroll)
        return
      }

      scrollPosition += scrollSpeed

      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0
        scrollContainer.scrollLeft = 0
      }

      scrollContainer.scrollLeft = scrollPosition
      requestId = requestAnimationFrame(autoScroll)
    }

    requestId = requestAnimationFrame(autoScroll)

    return () => {
      if (requestId) cancelAnimationFrame(requestId)
    }
  }, [isPaused])

  const handleSponsorContact = () => {
    router.push('/contact')
  }

  return (
    <section className="pb-8 md:pb-12 bg-gradient-to-b from-white to-brown-50">
      <div className="container mx-auto px-4">
        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="overflow-x-hidden whitespace-nowrap scrollbar-hide"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
          >
            <div ref={contentRef} className="inline-flex gap-4 md:gap-6 py-2">
              {duplicatedSponsors.map((sponsor, index) => (
                <div
                  key={`${sponsor.id}-${index}`}
                  className="inline-flex flex-shrink-0 sponsor-card"
                >
                  <div className="w-full group relative bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-brown-100 hover:border-gold-200">
                    <div className="relative w-full">
                      <Image
                        src={getImageSrc(sponsor)}
                        alt={sponsor.name}
                        width={600}
                        height={400}
                        className="w-full h-auto block group-hover:scale-105 transition-transform duration-300"
                        onError={() => handleImageError(sponsor.id, sponsor.name)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Edge fades */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-brown-50 to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brown-50 to-transparent pointer-events-none"></div>
        </div>

        {/* Responsive widths + hide scrollbar */}
        <style jsx>{`
          .sponsor-card {
            width: calc(33.333% - 0.75rem);
          }

          @media (min-width: 768px) {
            .sponsor-card {
              width: calc(20% - 1rem);
            }
          }

          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* CTA */}
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
            <button
              onClick={handleSponsorContact}
              className="px-6 py-2.5 bg-gradient-to-r from-brown-900 to-brown-800 hover:from-gold-600 hover:to-gold-500 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap w-full sm:w-auto"
            >
              Contact for Sponsorship
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SponsorsSection