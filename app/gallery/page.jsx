'use client'

import { useState, useEffect } from 'react'
import { Image, Video } from 'lucide-react'
import ImageGallery from './ImageGallery'
import VideoGallery from '../../src/components/VideoGallery'

export default function GalleryPage() {
  const [mediaType, setMediaType] = useState('photos')
  const [loading, setLoading] = useState(true)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-brown-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="h-12 w-48 bg-brown-200 rounded-lg mx-auto mb-6 animate-pulse"></div>
            <div className="h-4 w-96 bg-brown-200 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-64 bg-brown-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-brown-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-brown-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brown-50 to-white">
      {/* Media Type Toggle Header */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-center">
            <div className="inline-flex bg-white rounded-lg shadow p-0.5">
              <button
                onClick={() => setMediaType('photos')}
                className={`px-6 py-3 rounded-md transition-all duration-200 flex items-center space-x-2 ${
                  mediaType === 'photos'
                    ? 'bg-brown-600 text-white shadow-sm'
                    : 'text-brown-700 hover:bg-brown-50'
                }`}
              >
                <Image size={20} />
                <span className="text-sm font-medium">Photos</span>
              </button>
              <button
                onClick={() => setMediaType('videos')}
                className={`px-6 py-3 rounded-md transition-all duration-200 flex items-center space-x-2 ${
                  mediaType === 'videos'
                    ? 'bg-brown-600 text-white shadow-sm'
                    : 'text-brown-700 hover:bg-brown-50'
                }`}
              >
                <Video size={20} />
                <span className="text-sm font-medium">Videos</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render the appropriate gallery */}
      {mediaType === 'photos' ? <ImageGallery /> : <VideoGallery />}
    </div>
  )
}