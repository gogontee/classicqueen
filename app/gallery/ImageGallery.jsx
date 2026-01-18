'use client'

import { useState, useEffect } from 'react'
import { 
  Image, Calendar, ChevronLeft, ChevronRight, X,
  Download, Share2, Maximize2, ZoomIn, ZoomOut, RotateCw
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
)

export default function ImageGallery() {
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [albums, setAlbums] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [position, setPosition] = useState({ x: 0, y: 0 })

  // Fetch albums from Supabase
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('gallery_new')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Error fetching albums:', error)
          return
        }
        
        const parsedData = data.map(album => ({
          ...album,
          image_url: typeof album.image_url === 'string' 
            ? JSON.parse(album.image_url)
            : album.image_url || []
        }))
        
        setAlbums(parsedData)
        
        if (parsedData.length > 0) {
          setSelectedAlbum(parsedData[0])
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching albums:', error)
        setLoading(false)
      }
    }
    
    fetchAlbums()
  }, [])

  // Handle scroll for floating header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get current album images
  const albumImages = selectedAlbum?.image_url || []
  
  // Format album name
  const formatAlbumName = (name) => {
    if (!name) return 'Untitled Album'
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Get album stats
  const getAlbumStats = (album) => ({
    name: album.album,
    displayName: formatAlbumName(album.album),
    count: album.image_url?.length || 0,
    featuredImage: album.image_url?.[0]?.url
  })

  // Pagination
  const imagesPerPage = 12
  const totalPages = Math.ceil(albumImages.length / imagesPerPage)
  const startIndex = (currentPage - 1) * imagesPerPage
  const paginatedImages = albumImages.slice(startIndex, startIndex + imagesPerPage)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedAlbum])

  const handleScroll = (direction) => {
    const container = document.getElementById('album-scroll-container')
    if (!container) return
    
    const scrollAmount = 200
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount)
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  // Truncate long captions
  const truncateCaption = (caption, maxLength = 50) => {
    if (!caption) return 'No caption'
    if (caption.length <= maxLength) return caption
    return caption.substring(0, maxLength) + '...'
  }

  // Navigate images in modal
  const navigateImage = (direction) => {
    if (!selectedImageIndex || !selectedAlbum) return
    
    const { index } = selectedImageIndex
    const images = selectedAlbum.image_url
    const newIndex = index + direction
    
    if (newIndex >= 0 && newIndex < images.length) {
      setSelectedImage(images[newIndex])
      setSelectedImageIndex(prev => ({ ...prev, index: newIndex }))
      setZoom(1) // Reset zoom when changing images
      setRotation(0) // Reset rotation when changing images
      setPosition({ x: 0, y: 0 }) // Reset position when changing images
    }
  }

  // Open image modal
  const openImageModal = (image, index) => {
    setSelectedImage(image)
    setSelectedImageIndex({ albumId: selectedAlbum.id, index })
    setShowImageModal(true)
    setZoom(1) // Reset zoom
    setRotation(0) // Reset rotation
    setPosition({ x: 0, y: 0 }) // Reset position
  }

  // Zoom functions
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  // Mouse drag for image movement when zoomed
  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragStart])

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
      {/* Floating Album Selector */}
      <div className={`sticky top-16 z-30 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white'}`}>
        <div className="container mx-auto px-3 md:px-4">
          {/* Album Tabs */}
          {albums.length > 0 && (
            <div className="relative pb-3">
              {scrollPosition > 0 && (
                <button
                  onClick={() => handleScroll('left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 md:w-7 md:h-7 bg-white shadow rounded-full flex items-center justify-center hover:bg-brown-50"
                >
                  <ChevronLeft size={14} className="text-brown-600" />
                </button>
              )}
              
              <div 
                id="album-scroll-container"
                className="flex overflow-x-auto scrollbar-hide space-x-2 py-1 px-1"
                onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
                style={{ scrollBehavior: 'smooth' }}
              >
                {albums.map((album) => {
                  const stats = getAlbumStats(album)
                  const isSelected = selectedAlbum?.id === album.id
                  
                  return (
                    <button
                      key={album.id}
                      onClick={() => setSelectedAlbum(album)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-2 min-w-max ${
                        isSelected
                          ? 'bg-brown-600 text-white shadow'
                          : 'bg-brown-100 text-brown-700 hover:bg-brown-200'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-md overflow-hidden bg-gradient-to-br from-brown-400 to-brown-600">
                          {stats.featuredImage ? (
                            <div 
                              className="w-full h-full bg-cover bg-center"
                              style={{ backgroundImage: `url(${stats.featuredImage})` }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brown-500">
                              <Image className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 md:w-4 md:h-4 bg-gold-500 text-white text-[10px] md:text-xs rounded-full flex items-center justify-center">
                          {stats.count}
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-xs md:text-sm">{stats.displayName}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {scrollPosition < (document.getElementById('album-scroll-container')?.scrollWidth || 0) - 
                               (document.getElementById('album-scroll-container')?.clientWidth || 0) && (
                <button
                  onClick={() => handleScroll('right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 md:w-7 md:h-7 bg-white shadow rounded-full flex items-center justify-center hover:bg-brown-50"
                >
                  <ChevronRight size={14} className="text-brown-600" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current Album Header when scrolled */}
      {selectedAlbum && isScrolled && (
        <div className="sticky top-[100px] md:top-[110px] z-20 bg-gradient-to-r from-brown-700 to-brown-900 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Image className="h-5 w-5 md:h-6 md:w-6 text-gold-400" />
                <div>
                  <h1 className="text-sm md:text-lg font-bold truncate max-w-[200px] md:max-w-none">
                    {formatAlbumName(selectedAlbum.album)}
                  </h1>
                  <p className="text-brown-200 text-xs">
                    {albumImages.length} photos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base md:text-xl font-bold text-gold-400">{albumImages.length}</div>
                <div className="text-brown-200 text-xs">Photos</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Gallery Content */}
      <div className="container mx-auto px-4 pt-6 pb-16">
        {!selectedAlbum ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Image className="h-12 w-12 text-brown-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brown-700 mb-2">Select an Album</h3>
            <p className="text-brown-600">Choose an album from above to view photos</p>
          </div>
        ) : albumImages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Image className="h-12 w-12 text-brown-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-brown-700 mb-2">No photos in this album</h3>
            <p className="text-brown-600">This album is currently empty.</p>
          </div>
        ) : (
          <>
            {/* Gallery Header */}
            {!isScrolled && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-brown-900">
                      {formatAlbumName(selectedAlbum.album)}
                    </h1>
                    <p className="text-brown-600 text-sm md:text-base">
                      {albumImages.length} photos
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Gallery Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {paginatedImages.map((image, index) => (
                <div 
                  key={image.id} 
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Image Only - Clickable */}
                  <div 
                    className="aspect-square relative overflow-hidden cursor-pointer bg-gray-100"
                    onClick={() => openImageModal(image, index)}
                  >
                    <img
                      src={image.url}
                      alt={image.caption || 'Gallery image'}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `https://placehold.co/400x400/8B4513/FFFFFF?text=${encodeURIComponent(selectedAlbum?.album || 'Image')}`
                      }}
                    />
                    
                    {/* View Full Icon on Hover */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                      <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <Maximize2 className="h-8 w-8 text-white/80" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Caption BELOW the image */}
                  <div className="p-3 border-t border-gray-100">
                    <p className="text-sm text-gray-700 line-clamp-2 mb-1">
                      {truncateCaption(image.caption)}
                    </p>
                    <div className="flex items-center text-gray-500 text-xs">
                      <Calendar size={10} className="mr-1" />
                      {new Date(image.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-brown-300 text-brown-700 hover:bg-brown-50 disabled:opacity-50"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 md:w-9 md:h-9 rounded-lg font-medium text-sm ${
                          currentPage === pageNum
                            ? 'bg-brown-600 text-white'
                            : 'border border-brown-300 text-brown-700 hover:bg-brown-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-brown-300 text-brown-700 hover:bg-brown-50 disabled:opacity-50"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image View Modal - BIGGER IMAGE WITH ZOOM */}
      {showImageModal && selectedImage && selectedImageIndex && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Top Controls Bar */}
          <div className="p-4 flex items-center justify-between bg-black/90 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowImageModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              <div className="text-white text-sm">
                <span className="font-medium">{selectedImageIndex.index + 1}</span>
                <span className="text-white/60"> / {albumImages.length}</span>
              </div>
            </div>
            
            {/* Zoom and Rotation Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut className="h-5 w-5 text-white" />
              </button>
              
              <button
                onClick={handleResetZoom}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Reset"
              >
                <Maximize2 className="h-5 w-5 text-white" />
              </button>
              
              <button
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn className="h-5 w-5 text-white" />
              </button>
              
              <button
                onClick={handleRotate}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Rotate"
              >
                <RotateCw className="h-5 w-5 text-white" />
              </button>
              
              <div className="h-6 w-px bg-white/20 mx-1"></div>
              
              <a 
                href={selectedImage.url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Download"
              >
                <Download className="h-5 w-5 text-white" />
              </a>
              
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: selectedImage.caption || 'Gallery Image',
                      text: selectedImage.caption || 'Check out this image',
                      url: selectedImage.url,
                    })
                  } else {
                    navigator.clipboard.writeText(selectedImage.url)
                    alert('Image URL copied to clipboard!')
                  }
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Share"
              >
                <Share2 className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Main Image Area - FULL SCREEN */}
          <div 
            className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-black"
            onMouseDown={handleMouseDown}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Image with Zoom and Rotation */}
              <div
                className="relative transition-transform duration-200"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                  cursor: zoom > 1 ? 'grab' : 'default',
                }}
              >
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.caption}
                  className="max-w-full max-h-[70vh] object-contain select-none"
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = `https://placehold.co/800x600/333/FFF?text=Image+Not+Available`
                  }}
                />
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={() => navigateImage(-1)}
                disabled={selectedImageIndex.index === 0}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/70 hover:bg-black/90 rounded-full transition-all ${
                  selectedImageIndex.index === 0 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <ChevronLeft className="h-6 w-6 text-white" />
              </button>
              
              <button
                onClick={() => navigateImage(1)}
                disabled={selectedImageIndex.index === albumImages.length - 1}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/70 hover:bg-black/90 rounded-full transition-all ${
                  selectedImageIndex.index === albumImages.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <ChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Image Info Panel */}
          <div className="p-4 border-t border-white/10 bg-black/90">
            <div className="max-w-4xl mx-auto">
              <div className="text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">Photo Details</h3>
                    <p className="text-white/80 mb-3">{selectedImage.caption || 'No caption'}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-white/60">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {selectedImage.created_at 
                            ? new Date(selectedImage.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })
                            : 'Recently added'}
                        </span>
                      </div>
                      
                      <div className="flex items-center">
                        <Image className="h-4 w-4 mr-2" />
                        <span className="capitalize">{selectedAlbum?.album}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-white/40 mb-1">Zoom Level</div>
                    <div className="text-white font-medium">{zoom.toFixed(1)}x</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}