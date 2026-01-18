'use client'

import Link from 'next/link'
import Image from 'next/image'

const NextQueenSection = () => {
  const positions = [
    { title: 'First Runner Up', id: 2 },
    { title: 'Winner', id: 1 },
    { title: 'Second Runner Up', id: 3 }
  ]

  const imageSrc = 'https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/silhouette1.jpg'

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-brown-900 tracking-tight">
            WHO BECOMES THE NEXT QUEEN?
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-gold-500 to-gold-600 mx-auto mt-1 rounded-full"></div>
        </div>

        {/* Grid of Images */}
        <div className="grid grid-cols-3 gap-2 md:gap-3 max-w-3xl mx-auto">
          {positions.map((position) => (
            <div key={position.id} className="relative group">
              {/* Image Container with proper dimensions */}
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-md">
                <div className="relative w-full h-full">
                  <Image
                    src={imageSrc}
                    alt={`Silhouette of ${position.title}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 33vw, 160px"
                    unoptimized
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-brown-900/80 via-brown-900/30 to-transparent"></div>
                  
                  {/* Floating Question Mark */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white/40">
                      <span className="text-3xl md:text-4xl font-black">?</span>
                    </div>
                  </div>
                  
                  {/* Position Label ON the Image */}
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 md:p-2">
                    <div className="bg-brown-900/90 backdrop-blur-sm rounded px-1.5 py-1 md:px-2 md:py-1.5 text-center">
                      <h3 className="text-white font-bold text-xs">
                        {position.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Register CTA */}
        <div className="text-center mt-4 md:mt-6">
          <Link
            href="/register"
            className="inline-block px-5 md:px-6 py-2.5 bg-gradient-to-r from-brown-900 to-brown-800 hover:from-gold-600 hover:to-gold-500 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Click Here to Register
          </Link>
          
          {/* Subtext */}
          <p className="mt-2 text-brown-600 text-xs max-w-md mx-auto">
            Join the prestigious Classic Queen International Pageant.
          </p>
        </div>
      </div>
    </section>
  )
}

export default NextQueenSection