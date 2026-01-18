'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize2, Minimize2, ChevronLeft, ChevronRight, Calendar, ExternalLink, X, PictureInPicture } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function VideoGallery() {
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [playingVideo, setPlayingVideo] = useState(null)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [modalVideoInfo, setModalVideoInfo] = useState(null)
  const [isModalPlaying, setIsModalPlaying] = useState(true)
  const [modalVolume, setModalVolume] = useState(0.7)
  const [isModalMuted, setIsModalMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [controlsTimeout, setControlsTimeout] = useState(null)
  const videoRefs = useRef({})
  const modalVideoRef = useRef(null)
  const modalContainerRef = useRef(null)
  const tabsContainerRef = useRef(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(true)

  // Fetch video albums from Supabase
  useEffect(() => {
    const fetchVideoAlbums = async () => {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('gallery_new')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching video albums:', error)
          return
        }
        
        const videoAlbums = data
          .map(album => {
            try {
              const videos = album.video ? 
                (typeof album.video === 'string' ? JSON.parse(album.video) : album.video) 
                : []
              
              if (videos.length === 0) return null
              
              return {
                id: album.id,
                name: album.album,
                videos: videos,
                created_at: album.created_at,
                updated_at: album.updated_at,
                video_count: videos.length
              }
            } catch (e) {
              console.error('Error parsing videos for album:', album.id, e)
              return null
            }
          })
          .filter(album => album !== null)
        
        const sortedAlbums = videoAlbums.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        )
        
        setAlbums(sortedAlbums)
        
        if (sortedAlbums.length > 0) {
          setSelectedAlbum(sortedAlbums[0])
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching video albums:', error)
        setLoading(false)
      }
    }
    
    fetchVideoAlbums()
  }, [])

  // Handle scroll for floating header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Handle modal video events
  useEffect(() => {
    if (!modalVideoRef.current) return

    const video = modalVideoRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      setProgress((video.currentTime / video.duration) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handleEnded = () => {
      setIsModalPlaying(false)
    }

    const handlePlay = () => setIsModalPlaying(true)
    const handlePause = () => setIsModalPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [showVideoModal, selectedVideo])

  // Auto-hide controls in modal
  useEffect(() => {
    if (!showVideoModal || !showControls) return

    const timeout = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [showControls, showVideoModal])

  // Get current album videos
  const albumVideos = selectedAlbum?.videos || []
  
  // Format album name for display
  const formatAlbumName = (name) => {
    if (!name) return 'Untitled Album'
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Get album stats for display
  const getAlbumStats = (album) => ({
    name: album.name,
    displayName: formatAlbumName(album.name),
    count: album.video_count || 0,
    featuredVideo: album.videos?.[0]?.url || album.videos?.[0]?.embed_url
  })

  // Pagination for current album videos
  const videosPerPage = 12 // Changed to even number for better 2-column layout
  const totalPages = Math.ceil(albumVideos.length / videosPerPage)
  const startIndex = (currentPage - 1) * videosPerPage
  const paginatedVideos = albumVideos.slice(startIndex, startIndex + videosPerPage)

  useEffect(() => {
    // Reset to first page when album changes
    setCurrentPage(1)
    // Stop any playing videos when changing albums
    if (playingVideo) {
      handlePauseVideo(playingVideo)
    }
  }, [selectedAlbum])

  const handleScroll = (direction) => {
    const container = tabsContainerRef.current
    if (!container) return
    
    const scrollAmount = 200
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : Math.min(container.scrollWidth - container.clientWidth, scrollPosition + scrollAmount)
    
    container.scrollTo({ left: newPosition, behavior: 'smooth' })
    setScrollPosition(newPosition)
  }

  // Check scroll position for mobile tabs
  const checkScrollPosition = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current
      setShowLeftScroll(scrollLeft > 0)
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  // Extract video platform and ID
  const getVideoInfo = (video) => {
    if (!video) return { platform: 'unknown', videoId: null }
    
    const url = video.url || video.embed_url || ''
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0]
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0]
      }
      return { platform: 'youtube', videoId, url }
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return { platform: 'vimeo', videoId, url }
    }
    
    // Dailymotion
    if (url.includes('dailymotion.com')) {
      const videoId = url.split('dailymotion.com/video/')[1]?.split('?')[0]
      return { platform: 'dailymotion', videoId, url }
    }
    
    // Direct video file
    if (url.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i)) {
      return { platform: 'direct', url }
    }
    
    // If it's already an embed code
    if (url.includes('<iframe') || url.includes('embed/')) {
      return { platform: 'embed', embedCode: url, url }
    }
    
    return { platform: 'unknown', url }
  }

  // Generate embed URL based on platform
  const getEmbedUrl = (video) => {
    const { platform, videoId } = getVideoInfo(video)
    
    switch (platform) {
      case 'youtube':
        return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&rel=0&modestbranding=1`
      case 'vimeo':
        return `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0&portrait=0`
      case 'dailymotion':
        return `https://www.dailymotion.com/embed/video/${videoId}`
      case 'direct':
      case 'embed':
        return video.url || video.embed_url
      default:
        return null
    }
  }

  // Handle video play/pause in grid
  const handlePlayVideo = (videoId) => {
    if (playingVideo && playingVideo !== videoId) {
      handlePauseVideo(playingVideo)
    }
    
    const videoElement = videoRefs.current[videoId]
    if (videoElement) {
      if (videoElement.tagName === 'IFRAME') {
        setPlayingVideo(videoId)
      } else {
        videoElement.play()
        setPlayingVideo(videoId)
      }
    }
  }

  const handlePauseVideo = (videoId) => {
    const videoElement = videoRefs.current[videoId]
    if (videoElement && videoElement.tagName !== 'IFRAME') {
      videoElement.pause()
    }
    setPlayingVideo(null)
  }

  // Handle video click to open modal
  const handleVideoClick = (video, index) => {
    const videoId = `${selectedAlbum.id}-${index}`
    const videoInfo = getVideoInfo(video)
    const embedUrl = getEmbedUrl(video)
    
    setSelectedVideo({
      ...video,
      id: videoId,
      embedUrl,
      videoInfo
    })
    setModalVideoInfo(videoInfo)
    setShowVideoModal(true)
    setIsModalPlaying(true)
    setShowControls(true)
    
    // Reset progress
    setProgress(0)
    setCurrentTime(0)
  }

  // Close video modal
  const closeVideoModal = () => {
    setShowVideoModal(false)
    setIsModalPlaying(false)
    setSelectedVideo(null)
    
    if (modalVideoRef.current) {
      modalVideoRef.current.pause()
    }
  }

  // Handle modal video play/pause
  const handleModalPlayPause = () => {
    if (!modalVideoRef.current) return
    
    if (modalVideoRef.current.paused) {
      modalVideoRef.current.play()
      setIsModalPlaying(true)
    } else {
      modalVideoRef.current.pause()
      setIsModalPlaying(false)
    }
    setShowControls(true)
  }

  // Handle modal volume change
  const handleModalVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setModalVolume(newVolume)
    setIsModalMuted(newVolume === 0)
    
    if (modalVideoRef.current) {
      modalVideoRef.current.volume = newVolume
      modalVideoRef.current.muted = newVolume === 0
    }
    setShowControls(true)
  }

  // Handle modal mute toggle
  const handleModalMuteToggle = () => {
    const newMuted = !isModalMuted
    setIsModalMuted(newMuted)
    
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = newMuted
    }
    
    if (newMuted) {
      setModalVolume(0)
    } else {
      setModalVolume(0.7)
    }
    setShowControls(true)
  }

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!modalVideoRef.current || !duration) return
    
    const progressBar = e.currentTarget
    const clickPosition = e.clientX - progressBar.getBoundingClientRect().left
    const percentage = clickPosition / progressBar.clientWidth
    const newTime = percentage * duration
    
    modalVideoRef.current.currentTime = newTime
    setProgress(percentage * 100)
    setCurrentTime(newTime)
    setShowControls(true)
  }

  // Enter fullscreen for modal
  const enterModalFullscreen = () => {
    const container = modalContainerRef.current
    if (!container) return
    
    if (container.requestFullscreen) {
      container.requestFullscreen()
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen()
    } else if (container.msRequestFullscreen) {
      container.msRequestFullscreen()
    }
    setIsFullscreen(true)
    setShowControls(true)
  }

  // Exit fullscreen
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
    setIsFullscreen(false)
    setShowControls(true)
  }

  // Handle volume change for grid videos
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    
    Object.values(videoRefs.current).forEach(video => {
      if (video && video.volume !== undefined) {
        video.volume = newVolume
        video.muted = newVolume === 0
      }
    })
  }

  // Handle mute toggle for grid videos
  const handleMuteToggle = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    
    Object.values(videoRefs.current).forEach(video => {
      if (video && video.muted !== undefined) {
        video.muted = newMuted
      }
    })
    
    if (newMuted) {
      setVolume(0)
    } else {
      setVolume(0.7)
    }
  }

  // Format time
  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Truncate caption
  const truncateCaption = (caption, maxLength = 60) => {
    if (!caption) return 'No description'
    if (caption.length <= maxLength) return caption
    return caption.substring(0, maxLength) + '...'
  }

  // Show controls on mouse move in modal
  const handleModalMouseMove = () => {
    setShowControls(true)
    if (controlsTimeout) clearTimeout(controlsTimeout)
    
    const timeout = setTimeout(() => {
      setShowControls(false)
    }, 3000)
    
    setControlsTimeout(timeout)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="h-12 w-48 bg-gray-800 rounded-lg mx-auto mb-6 animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-800 rounded mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Floating Album Selector */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-gray-900'}`}>
        <div className="container mx-auto px-3 md:px-4">
          {/* Page Header */}
          <div className="flex justify-center pt-4 pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Video Gallery
            </h1>
          </div>

          {/* Horizontal Scrollable Album Tabs */}
          {albums.length > 0 && (
            <div className="relative pb-3">
              {showLeftScroll && (
                <button
                  onClick={() => handleScroll('left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 md:w-7 md:h-7 bg-gray-800 shadow rounded-full flex items-center justify-center hover:bg-gray-700 border border-gray-700"
                >
                  <ChevronLeft size={14} className="text-gray-300" />
                </button>
              )}
              
              <div 
                ref={tabsContainerRef}
                onScroll={checkScrollPosition}
                className="flex overflow-x-auto scrollbar-hide space-x-2 py-1 px-1"
                style={{ scrollBehavior: 'smooth' }}
              >
                <style jsx>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
                
                {albums.map((album) => {
                  const stats = getAlbumStats(album)
                  const isSelected = selectedAlbum?.id === album.id
                  
                  return (
                    <button
                      key={album.id}
                      onClick={() => setSelectedAlbum(album)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-2 min-w-max ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="relative">
                        <div className="w-6 h-6 md:w-7 md:h-7 rounded-md overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <Play className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 md:w-4 md:h-4 bg-red-500 text-white text-[10px] md:text-xs rounded-full flex items-center justify-center">
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
              
              {showRightScroll && (
                <button
                  onClick={() => handleScroll('right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-6 h-6 md:w-7 md:h-7 bg-gray-800 shadow rounded-full flex items-center justify-center hover:bg-gray-700 border border-gray-700"
                >
                  <ChevronRight size={14} className="text-gray-300" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Current Album Header when scrolled */}
      {selectedAlbum && isScrolled && (
        <div className="sticky top-[70px] md:top-[80px] z-30 bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Play className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm md:text-lg font-bold truncate max-w-[200px] md:max-w-none">
                    {formatAlbumName(selectedAlbum.name)}
                  </h1>
                  <p className="text-gray-300 text-xs">
                    {albumVideos.length} videos
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base md:text-xl font-bold text-blue-400">{albumVideos.length}</div>
                <div className="text-gray-300 text-xs">Videos</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <div 
            ref={modalContainerRef}
            className={`relative w-full h-full ${isFullscreen ? '' : 'max-w-7xl max-h-[90vh] rounded-xl overflow-hidden'}`}
            onMouseMove={handleModalMouseMove}
          >
            {/* Close button */}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-50 p-2 bg-black/70 hover:bg-black/90 rounded-full transition-all"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            {/* Video container */}
            <div className="relative w-full h-full bg-black">
              {selectedVideo.videoInfo.platform === 'direct' ? (
                <video
                  ref={modalVideoRef}
                  src={selectedVideo.embedUrl}
                  className="w-full h-full object-contain"
                  autoPlay
                  playsInline
                  onClick={handleModalPlayPause}
                />
              ) : selectedVideo.videoInfo.platform === 'youtube' ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.videoInfo.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                  className="w-full h-full"
                  title={selectedVideo.title || 'Video'}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : selectedVideo.videoInfo.platform === 'vimeo' ? (
                <iframe
                  src={`https://player.vimeo.com/video/${selectedVideo.videoInfo.videoId}?autoplay=1&title=0&byline=0&portrait=0`}
                  className="w-full h-full"
                  title={selectedVideo.title || 'Video'}
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-20 w-20 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Video platform not supported for preview</p>
                    <a
                      href={selectedVideo.videoInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Watch on original site
                    </a>
                  </div>
                </div>
              )}

              {/* Video overlay controls (for direct videos) */}
              {selectedVideo.videoInfo.platform === 'direct' && (
                <>
                  {/* Play/Pause overlay button */}
                  <div 
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                      showControls ? 'opacity-100' : 'opacity-0'
                    }`}
                    onClick={handleModalPlayPause}
                  >
                    <button className={`p-6 bg-black/50 hover:bg-black/70 rounded-full transition-transform ${isModalPlaying ? 'scale-90' : 'scale-100'}`}>
                      {isModalPlaying ? (
                        <Pause className="h-12 w-12 text-white" />
                      ) : (
                        <Play className="h-12 w-12 text-white ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Bottom controls bar */}
                  <div 
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent transition-transform duration-300 ${
                      showControls ? 'translate-y-0' : 'translate-y-full'
                    }`}
                  >
                    {/* Progress bar */}
                    <div 
                      className="h-1.5 bg-gray-700 cursor-pointer group"
                      onClick={handleProgressClick}
                    >
                      <div 
                        className="h-full bg-red-600 relative group-hover:h-2 transition-all"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100"></div>
                      </div>
                    </div>

                    {/* Control buttons */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={handleModalPlayPause}
                          className="hover:bg-white/20 p-2 rounded-full"
                        >
                          {isModalPlaying ? (
                            <Pause className="h-5 w-5 text-white" />
                          ) : (
                            <Play className="h-5 w-5 text-white" />
                          )}
                        </button>

                        <button
                          onClick={handleModalMuteToggle}
                          className="hover:bg-white/20 p-2 rounded-full"
                        >
                          {isModalMuted ? (
                            <VolumeX className="h-5 w-5 text-white" />
                          ) : (
                            <Volume2 className="h-5 w-5 text-white" />
                          )}
                        </button>

                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={modalVolume}
                          onChange={handleModalVolumeChange}
                          className="w-24 accent-red-600"
                        />

                        <div className="text-white text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={isFullscreen ? exitFullscreen : enterModalFullscreen}
                          className="hover:bg-white/20 p-2 rounded-full"
                        >
                          {isFullscreen ? (
                            <Minimize2 className="h-5 w-5 text-white" />
                          ) : (
                            <Maximize2 className="h-5 w-5 text-white" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Video info (outside video for non-fullscreen) */}
            {!isFullscreen && (
              <div className="bg-gray-900 text-white p-6">
                <h2 className="text-2xl font-bold mb-2">
                  {selectedVideo.title || 'Untitled Video'}
                </h2>
                <p className="text-gray-300 mb-4">
                  {selectedVideo.description || selectedVideo.caption || 'No description available'}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span className="bg-gray-800 px-3 py-1 rounded-md capitalize">
                      {selectedVideo.videoInfo.platform}
                    </span>
                    {selectedVideo.created_at && (
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(selectedVideo.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <a
                    href={selectedVideo.videoInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open original
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Video Content */}
      <div className="container mx-auto px-4 pt-6 pb-16">
        {!selectedAlbum ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl shadow-sm">
            <div className="p-2 bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Select an Album</h3>
            <p className="text-gray-400">Choose a video album from above to view videos</p>
          </div>
        ) : albumVideos.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/50 rounded-xl shadow-sm">
            <div className="p-2 bg-blue-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Play className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No videos in this album</h3>
            <p className="text-gray-400">This album is currently empty.</p>
          </div>
        ) : (
          <>
            {/* Album Header */}
            {!isScrolled && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">
                      {formatAlbumName(selectedAlbum.name)}
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base">
                      {albumVideos.length} videos
                    </p>
                  </div>
                  
                  {/* Volume Controls */}
                  <div className="hidden md:flex items-center space-x-2">
                    <button
                      onClick={handleMuteToggle}
                      className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {isMuted ? (
                        <VolumeX className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Volume2 className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-24 accent-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Video Grid - CHANGED TO 2 COLUMNS ON MOBILE */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 mb-8">
              {paginatedVideos.map((video, index) => {
                const videoId = `${selectedAlbum.id}-${index}`
                const isPlaying = playingVideo === videoId
                const embedUrl = getEmbedUrl(video)
                const { platform } = getVideoInfo(video)
                
                return (
                  <div 
                    key={videoId}
                    className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                    onClick={() => handleVideoClick(video, index)}
                  >
                    {/* Video Player */}
                    <div className="relative aspect-video bg-black">
                      {embedUrl ? (
                        platform === 'direct' ? (
                          <video
                            ref={el => videoRefs.current[videoId] = el}
                            src={embedUrl}
                            className="w-full h-full object-cover"
                            poster={video.thumbnail}
                            controls={false}
                            onClick={(e) => {
                              e.stopPropagation()
                              isPlaying ? handlePauseVideo(videoId) : handlePlayVideo(videoId)
                            }}
                          />
                        ) : (
                          <iframe
                            ref={el => videoRefs.current[videoId] = el}
                            src={embedUrl}
                            className="w-full h-full"
                            title={video.title || `Video ${index + 1}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                          <div className="text-center">
                            <Play className="h-10 w-10 md:h-12 md:w-12 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-500 text-xs md:text-sm">Video unavailable</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Overlay Controls for Direct Videos */}
                      {platform === 'direct' && (
                        <>
                          <div 
                            className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-300 ${
                              isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              isPlaying ? handlePauseVideo(videoId) : handlePlayVideo(videoId)
                            }}
                          >
                            <button className="p-3 md:p-4 bg-blue-600/90 hover:bg-blue-600 rounded-full transition-all transform hover:scale-110">
                              {isPlaying ? (
                                <Pause className="h-6 w-6 md:h-8 md:w-8 text-white" />
                              ) : (
                                <Play className="h-6 w-6 md:h-8 md:w-8 text-white ml-1" />
                              )}
                            </button>
                          </div>
                          
                          {/* Play overlay for grid */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-4 md:p-6 bg-black/60 rounded-full">
                              <Play className="h-8 w-8 md:h-10 md:w-10 text-white ml-1" />
                            </div>
                          </div>
                        </>
                      )}
                      
                      {/* Platform Badge */}
                      {platform !== 'direct' && platform !== 'unknown' && (
                        <div className="absolute top-2 right-2">
                          <span className="px-2 py-1 bg-black/70 text-white text-xs rounded-md capitalize">
                            {platform}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Video Info */}
                    <div className="p-3 md:p-4">
                      <h3 className="font-semibold text-white mb-1 md:mb-2 text-sm md:text-base line-clamp-1">
                        {video.title || `Video ${index + 1}`}
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm mb-2 md:mb-3 line-clamp-2">
                        {truncateCaption(video.description || video.caption, 50)}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={10} className="mr-1" />
                          <span className="text-[10px] md:text-xs">
                            {video.created_at 
                              ? new Date(video.created_at).toLocaleDateString()
                              : new Date(selectedAlbum.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1 md:space-x-2">
                          {video.duration && (
                            <span className="bg-gray-900 px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs">
                              {formatTime(video.duration)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 md:space-x-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronLeft size={16} className="md:h-4 md:w-4" />
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
                        className={`w-7 h-7 md:w-8 md:h-8 rounded-lg font-medium text-xs md:text-sm ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-700 text-gray-300 hover:bg-gray-800'
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
                  className="p-1.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                >
                  <ChevronRight size={16} className="md:h-4 md:w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
