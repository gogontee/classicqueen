'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Upload, X, Edit2, ChevronDown, ChevronUp, Check, Image as ImageIcon, Globe, Maximize2, ChevronLeft, ChevronRight, Search } from 'lucide-react'

export default function GalleriesManager({ data, onUpdate, supabase }) {
  // Default album options for suggestions
  const defaultAlbumOptions = [
    "Grand Finale",
    "Preliminary Night",
    "Opening Number",
    "National Costume",
    "Evening Gown",
    "Swimwear",
    "Talent Showcase",
    "Coronation",
    "Top Finalists",
    "Arrival",
    "Training",
    "Rehearsals",
    "BTS",
    "Charity",
    "Award Night",
    "Official Portraits",
    "Sponsor Appearances",
    "Red Carpet"
  ]
  
  const [albums, setAlbums] = useState([]) // Array of album objects with images array
  const [activeAlbum, setActiveAlbum] = useState(null)
  const [newAlbumName, setNewAlbumName] = useState('')
  const [newImage, setNewImage] = useState({ image_url: '', caption: '' })
  const [uploading, setUploading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [editingImage, setEditingImage] = useState(null) // { albumId, imageIndex }
  const [supabaseClient, setSupabaseClient] = useState(null)
  const [expandedCaptions, setExpandedCaptions] = useState({})
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const tabsContainerRef = useRef(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(true)
  const [albumOptions, setAlbumOptions] = useState(defaultAlbumOptions)
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize supabase client
  useEffect(() => {
    if (supabase) {
      setSupabaseClient(supabase)
    } else {
      const initSupabase = async () => {
        try {
          const { createClient } = await import('@supabase/supabase-js')
          const client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          )
          setSupabaseClient(client)
        } catch (error) {
          console.error('Failed to initialize Supabase client:', error)
        }
      }
      initSupabase()
    }
  }, [supabase])

  // Load gallery data from database
  useEffect(() => {
    const loadGalleryData = async () => {
      if (!supabaseClient) return
      
      try {
        setIsLoading(true)
        
        // Fetch all albums from gallery_new table
        const { data: albumRows, error: fetchError } = await supabaseClient
          .from('gallery_new')
          .select('*')
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError
        
        // Process albums - image_url is JSONB column containing array of image objects
        const processedAlbums = []
        
        albumRows?.forEach(albumRow => {
          const images = albumRow.image_url || [] // JSONB array of images
          
          const albumWithImages = {
            id: albumRow.id,
            name: albumRow.album,
            images: images.map((img, index) => ({
              id: img.id || `${albumRow.id}-${index}`,
              url: img.url,
              caption: img.caption,
              created_at: img.created_at || albumRow.created_at
            })),
            created_at: albumRow.created_at,
            updated_at: albumRow.updated_at
          }
          
          processedAlbums.push(albumWithImages)
        })
        
        // Check for albums in database that aren't in our default options
        const databaseAlbums = processedAlbums.map(album => album.name)
        const missingAlbums = databaseAlbums.filter(album => 
          !defaultAlbumOptions.includes(album)
        )
        
        // Update album options if missing albums found
        if (missingAlbums.length > 0) {
          setAlbumOptions([...defaultAlbumOptions, ...missingAlbums])
        }
        
        // Set albums in alphabetical order by name
        const sortedAlbums = processedAlbums.sort((a, b) => a.name.localeCompare(b.name))
        setAlbums(sortedAlbums)
        
        // Set active album to first one if exists
        if (sortedAlbums.length > 0 && !activeAlbum) {
          setActiveAlbum(sortedAlbums[0].id)
        }
        
      } catch (error) {
        console.error('Error loading gallery data:', error)
        alert('Failed to load gallery data: ' + error.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (supabaseClient) {
      loadGalleryData()
    }
  }, [supabaseClient])

  // Find album by ID
  const findAlbumById = (albumId) => {
    return albums.find(album => album.id === albumId)
  }

  // Find album by name
  const findAlbumByName = (albumName) => {
    return albums.find(album => album.name === albumName)
  }

  // Get active album object
  const getActiveAlbum = () => {
    return findAlbumById(activeAlbum)
  }

  // Get images for active album
  const getActiveAlbumImages = () => {
    const album = getActiveAlbum()
    return album ? album.images : []
  }

  // Check scroll position for mobile tabs
  const checkScrollPosition = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current
      setShowLeftScroll(scrollLeft > 0)
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  // Scroll tabs
  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      const scrollAmount = 150
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Save/Update album in database with images JSONB array
  const saveAlbumToDatabase = async (albumData, isEdit = false) => {
    if (!supabaseClient) {
      console.error('Missing supabase client')
      alert('Database connection not ready.')
      return null
    }
    
    try {
      setIsLoading(true)
      
      // Prepare the JSONB array for image_url column
      const imagesArray = albumData.images.map(img => ({
        id: img.id,
        url: img.url,
        caption: img.caption,
        created_at: img.created_at
      }))
      
      const albumPayload = {
        album: albumData.name,
        image_url: imagesArray, // JSONB array
        updated_at: new Date().toISOString()
      }
      
      let result
      
      if (isEdit && albumData.id) {
        // Update existing album
        const { data, error } = await supabaseClient
          .from('gallery_new')
          .update(albumPayload)
          .eq('id', albumData.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Insert new album
        albumPayload.created_at = new Date().toISOString()
        
        const { data, error } = await supabaseClient
          .from('gallery_new')
          .insert([albumPayload])
          .select()
          .single()

        if (error) throw error
        result = data
      }
      
      return result
    } catch (error) {
      console.error('Error saving album:', error)
      alert('Failed to save album: ' + error.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file selection with preview
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, GIF, WebP)')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
      setNewImage(prev => ({ ...prev, image_url: e.target.result }))
    }
    reader.readAsDataURL(file)
    
    // Store file for upload
    event.target.file = file
  }

  // Upload file to Supabase storage
  const uploadFileToStorage = async (file, albumName) => {
    if (!supabaseClient) {
      alert('Database connection not ready')
      return null
    }
    
    setUploading(true)
    try {
      // Clean album name for file path
      const cleanAlbumName = albumName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      const fileExt = file.name.split('.').pop().toLowerCase()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
      const filePath = `gallery_new/${cleanAlbumName}/${fileName}`
      
      const { error: uploadError } = await supabaseClient.storage
        .from('classic-gallery')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabaseClient.storage
        .from('classic-gallery')
        .getPublicUrl(filePath)
      
      return urlData.publicUrl
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed: ' + error.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  // Create new album
  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      alert('Please enter an album name')
      return
    }
    
    try {
      // Check if album already exists
      const existingAlbum = findAlbumByName(newAlbumName)
      if (existingAlbum) {
        alert('An album with this name already exists')
        return
      }
      
      const albumData = {
        name: newAlbumName,
        images: [] // Empty JSONB array
      }
      
      const savedAlbum = await saveAlbumToDatabase(albumData, false)
      
      if (savedAlbum) {
        // Add to local state
        const newAlbumObj = {
          id: savedAlbum.id,
          name: savedAlbum.album,
          images: [],
          created_at: savedAlbum.created_at,
          updated_at: savedAlbum.updated_at
        }
        
        setAlbums(prev => {
          const newAlbums = [...prev, newAlbumObj]
          return newAlbums.sort((a, b) => a.name.localeCompare(b.name))
        })
        
        // Add to album options if not present
        if (!albumOptions.includes(savedAlbum.album)) {
          setAlbumOptions(prev => [...prev, savedAlbum.album])
        }
        
        // Set as active album
        setActiveAlbum(savedAlbum.id)
        
        // Reset form
        setNewAlbumName('')
        setShowAlbumModal(false)
      }
    } catch (error) {
      console.error('Error creating album:', error)
      alert('Failed to create album: ' + error.message)
    }
  }

  // Add new image to album (adds to JSONB array)
  const handleAddImage = async () => {
    if (!newImage.image_url || !newImage.caption.trim()) {
      alert('Please add an image and provide a caption')
      return
    }
    
    const album = getActiveAlbum()
    if (!album) {
      alert('Please select an album first')
      return
    }
    
    try {
      let imageUrl = newImage.image_url
      
      // If it's a local preview (base64), upload the actual file
      if (newImage.image_url.startsWith('data:')) {
        const fileInput = fileInputRef.current
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const uploadedUrl = await uploadFileToStorage(fileInput.files[0], album.name)
          if (!uploadedUrl) return
          imageUrl = uploadedUrl
        } else {
          alert('Please select an image file to upload')
          return
        }
      }
      
      // Create image object for JSONB array
      const newImageObj = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        url: imageUrl,
        caption: newImage.caption,
        created_at: new Date().toISOString()
      }
      
      // Add image to album's images array
      const updatedImages = [...album.images, newImageObj]
      const updatedAlbum = {
        ...album,
        images: updatedImages
      }
      
      // Update album in database with new JSONB array
      const savedAlbum = await saveAlbumToDatabase(updatedAlbum, true)
      
      if (savedAlbum) {
        // Update local state
        setAlbums(prev => prev.map(a => 
          a.id === album.id ? updatedAlbum : a
        ))
        
        // Reset form
        setNewImage({ image_url: '', caption: '' })
        setImagePreview(null)
        setShowUploadModal(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        alert('Image added successfully!')
      }
    } catch (error) {
      console.error('Error adding image:', error)
      alert('Failed to add image: ' + error.message)
    }
  }

  // Edit existing image in JSONB array
  const handleEditImage = async () => {
    if (!editingImage || !newImage.caption.trim()) {
      alert('Please provide a caption')
      return
    }
    
    const { albumId, imageIndex } = editingImage
    const album = findAlbumById(albumId)
    
    if (!album) {
      alert('Album not found')
      return
    }
    
    try {
      let imageUrl = newImage.image_url
      
      // If a new image file was uploaded
      if (newImage.image_url.startsWith('data:')) {
        const fileInput = fileInputRef.current
        if (fileInput && fileInput.files && fileInput.files[0]) {
          const uploadedUrl = await uploadFileToStorage(fileInput.files[0], album.name)
          if (uploadedUrl) {
            imageUrl = uploadedUrl
          }
        }
      }
      
      // Update the specific image in the JSONB array
      const updatedImages = [...album.images]
      updatedImages[imageIndex] = {
        ...updatedImages[imageIndex],
        url: imageUrl,
        caption: newImage.caption
      }
      
      const updatedAlbum = {
        ...album,
        images: updatedImages,
        updated_at: new Date().toISOString()
      }
      
      // Update album in database with updated JSONB array
      const savedAlbum = await saveAlbumToDatabase(updatedAlbum, true)
      
      if (savedAlbum) {
        // Update local state
        setAlbums(prev => prev.map(a => 
          a.id === albumId ? updatedAlbum : a
        ))
        
        // Reset form
        setEditingImage(null)
        setNewImage({ image_url: '', caption: '' })
        setImagePreview(null)
        setShowUploadModal(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        alert('Image updated successfully!')
      }
    } catch (error) {
      console.error('Error editing image:', error)
      alert('Failed to edit image: ' + error.message)
    }
  }

  // Delete image from album (remove from JSONB array)
  const handleDeleteImage = async (albumId, imageIndex, image) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    
    if (!supabaseClient) {
      alert('Database connection not ready.')
      return
    }
    
    try {
      const album = findAlbumById(albumId)
      if (!album) {
        alert('Album not found')
        return
      }
      
      // Remove image from JSONB array
      const updatedImages = album.images.filter((_, index) => index !== imageIndex)
      
      // Optional: Delete from storage if it's our own uploaded file
      if (image.url && image.url.includes('classic-gallery')) {
        try {
          const filePath = image.url.split('classic-gallery/')[1]
          if (filePath) {
            await supabaseClient.storage
              .from('classic-gallery')
              .remove([filePath])
          }
        } catch (storageError) {
          console.warn('Could not delete from storage:', storageError)
        }
      }
      
      const updatedAlbum = {
        ...album,
        images: updatedImages,
        updated_at: new Date().toISOString()
      }
      
      // Update album in database with updated JSONB array
      const savedAlbum = await saveAlbumToDatabase(updatedAlbum, true)
      
      if (savedAlbum) {
        // Update local state
        setAlbums(prev => prev.map(a => 
          a.id === albumId ? updatedAlbum : a
        ))
        
        // Close image modal if open
        if (showImageModal) {
          setShowImageModal(false)
        }
        
        alert('Image deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      alert('Failed to delete image: ' + error.message)
    }
  }

  // Delete entire album
  const handleDeleteAlbum = async (albumId) => {
    const album = findAlbumById(albumId)
    if (!album) return
    
    if (!confirm(`Are you sure you want to delete the "${album.name}" album? This will also delete all images in the album. This cannot be undone.`)) return
    
    if (!supabaseClient) {
      alert('Database connection not ready.')
      return
    }
    
    try {
      // Delete all images from storage first
      for (const image of album.images) {
        if (image.url && image.url.includes('classic-gallery')) {
          try {
            const filePath = image.url.split('classic-gallery/')[1]
            if (filePath) {
              await supabaseClient.storage
                .from('classic-gallery')
                .remove([filePath])
            }
          } catch (storageError) {
            console.warn('Could not delete image from storage:', storageError)
          }
        }
      }
      
      // Delete album from database
      const { error } = await supabaseClient
        .from('gallery_new')
        .delete()
        .eq('id', albumId)

      if (error) throw error
      
      // Update local state
      const updatedAlbums = albums.filter(a => a.id !== albumId)
      setAlbums(updatedAlbums)
      
      // Set active album to another if available
      if (activeAlbum === albumId && updatedAlbums.length > 0) {
        setActiveAlbum(updatedAlbums[0].id)
      } else if (updatedAlbums.length === 0) {
        setActiveAlbum(null)
      }
      
      alert('Album deleted successfully!')
      
    } catch (error) {
      console.error('Error deleting album:', error)
      alert('Failed to delete album: ' + error.message)
    }
  }

  // Start editing image
  const startEditImage = (albumId, imageIndex) => {
    const album = findAlbumById(albumId)
    if (!album) return
    
    const image = album.images[imageIndex]
    setEditingImage({ albumId, imageIndex })
    setNewImage({ 
      image_url: image.url,
      caption: image.caption
    })
    setImagePreview(image.url)
    setShowUploadModal(true)
  }

  // Cancel edit/upload
  const cancelUpload = () => {
    setEditingImage(null)
    setNewImage({ image_url: '', caption: '' })
    setImagePreview(null)
    setShowUploadModal(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Cancel album modal
  const cancelAlbumModal = () => {
    setNewAlbumName('')
    setShowAlbumModal(false)
  }

  // Toggle caption expansion
  const toggleCaption = (imageId) => {
    setExpandedCaptions(prev => ({
      ...prev,
      [imageId]: !prev[imageId]
    }))
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const file = e.dataTransfer.files[0]
    if (!file) return
    
    if (!file.type.startsWith('image/')) {
      alert('Please drop an image file')
      return
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }
    
    // Create preview and open upload modal
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target.result)
      setNewImage(prev => ({ ...prev, image_url: e.target.result }))
      setShowUploadModal(true)
    }
    reader.readAsDataURL(file)
    
    // Store file for upload
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(file)
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files
    }
  }

  // Open image in modal
  const openImageModal = (albumId, index) => {
    setSelectedImageIndex({ albumId, index })
    setShowImageModal(true)
  }

  // Navigate images in modal
  const navigateImage = (direction) => {
    if (!selectedImageIndex) return
    
    const { albumId, index } = selectedImageIndex
    const album = findAlbumById(albumId)
    if (!album) return
    
    const currentImages = album.images
    const newIndex = index + direction
    
    if (newIndex >= 0 && newIndex < currentImages.length) {
      setSelectedImageIndex({ albumId, index: newIndex })
    }
  }

  // Get current image for modal
  const getCurrentModalImage = () => {
    if (!selectedImageIndex) return null
    const { albumId, index } = selectedImageIndex
    const album = findAlbumById(albumId)
    return album?.images[index]
  }

  // Filter albums based on search
  const filteredAlbums = albums.filter(album => 
    album.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-4 md:p-6">
      {/* Loading State */}
      {isLoading && !showUploadModal && !showAlbumModal && (
        <div className="fixed inset-0 bg-brown-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brown-600 mb-4"></div>
            <p className="text-brown-700 font-medium">Loading gallery...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-brown-900 mb-1 md:mb-2 font-serif">Gallery Studio</h1>
            <p className="text-brown-700 text-sm md:text-base">Manage your photo collections</p>
          </div>
          
          <div className="flex items-center space-x-3 mt-3 md:mt-0">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-brown-400" />
              <input
                type="text"
                placeholder="Search albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-brown-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowAlbumModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-brown-600 to-amber-700 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
            >
              <span>Add Album</span>
            </button>
          </div>
        </div>

        {/* Album Tabs */}
        <div className="mb-8 md:mb-10 relative">
          <div className="relative">
            {showLeftScroll && (
              <button
                onClick={() => scrollTabs('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 md:hidden w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border border-brown-200"
              >
                <ChevronLeft className="h-4 w-4 text-brown-700" />
              </button>
            )}
            
            {showRightScroll && (
              <button
                onClick={() => scrollTabs('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 md:hidden w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center border border-brown-200"
              >
                <ChevronRight className="h-4 w-4 text-brown-700" />
              </button>
            )}

            <div 
              ref={tabsContainerRef}
              onScroll={checkScrollPosition}
              className="flex space-x-2 overflow-x-auto scrollbar-hide bg-white rounded-xl p-2 shadow-sm border border-brown-200"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              
              {filteredAlbums.map((album) => (
                <div key={album.id} className="flex-shrink-0">
                  <button
                    onClick={() => setActiveAlbum(album.id)}
                    className={`
                      flex-shrink-0 py-2 px-3 md:py-3 md:px-4 rounded-lg transition-all duration-300 whitespace-nowrap min-w-[120px]
                      ${activeAlbum === album.id 
                        ? 'bg-gradient-to-r from-brown-600 to-amber-700 text-white shadow-md' 
                        : 'text-brown-600 hover:text-brown-900 hover:bg-amber-50'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs md:text-sm font-medium truncate w-full text-center">{album.name}</span>
                      <span className={`text-xs mt-0.5 md:mt-1 ${activeAlbum === album.id ? 'text-amber-100' : 'text-brown-400'}`}>
                        {album.images.length} images
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {filteredAlbums.length === 0 && !isLoading && (
            <div className="text-center mt-4 p-4 bg-amber-50 rounded-xl">
              <p className="text-brown-600">No albums found. Create your first album.</p>
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="mb-10 md:mb-12">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-brown-900">
              {getActiveAlbum()?.name || 'Select an Album'} 
              <span className="ml-2 text-base font-normal text-brown-500">
                ({getActiveAlbumImages().length} images)
              </span>
            </h2>
            
            <div className="flex items-center space-x-3">
              {activeAlbum && (
                <>
                  <button
                    onClick={() => {
                      setEditingImage(null)
                      setNewImage({ image_url: '', caption: '' })
                      setImagePreview(null)
                      setShowUploadModal(true)
                    }}
                    className="px-3 py-1.5 bg-gradient-to-r from-brown-600 to-amber-700 text-white rounded-lg font-medium hover:shadow-lg transition-shadow text-sm"
                  >
                    Add Photo
                  </button>
                  <button
                    onClick={() => handleDeleteAlbum(activeAlbum)}
                    className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                  >
                    Delete Album
                  </button>
                </>
              )}
              <div className="flex items-center space-x-1 md:space-x-2 text-xs md:text-sm text-brown-500">
                <Globe className="h-3 w-3 md:h-4 md:w-4" />
                <span>Public Gallery</span>
              </div>
            </div>
          </div>

          {!activeAlbum ? (
            <div className="text-center py-12 md:py-20 border-3 border-dashed border-brown-300 rounded-2xl bg-white/50 backdrop-blur-sm">
              <div className="p-6 md:p-12 rounded-xl">
                <div className="mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-100 to-brown-100 flex items-center justify-center mb-4 md:mb-6">
                  <ImageIcon className="h-8 w-8 md:h-12 md:w-12 text-brown-500" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-brown-900 mb-2 md:mb-3">No Album Selected</h3>
                <p className="text-brown-600 text-sm md:text-base mb-6 md:mb-8 max-w-md mx-auto">
                  Select an album from above or create a new album to add photos.
                </p>
                <button
                  onClick={() => setShowAlbumModal(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-brown-600 to-amber-700 text-white rounded-lg font-medium hover:shadow-lg transition-shadow text-sm md:text-base"
                >
                  Create New Album
                </button>
              </div>
            </div>
          ) : getActiveAlbumImages().length === 0 ? (
            <div 
              className="text-center py-12 md:py-20 border-3 border-dashed border-brown-300 rounded-2xl bg-white/50 backdrop-blur-sm"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`p-6 md:p-12 rounded-xl ${dragOver ? 'bg-amber-50 border-2 border-amber-300' : ''}`}>
                <div className="mx-auto w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-amber-100 to-brown-100 flex items-center justify-center mb-4 md:mb-6">
                  <ImageIcon className="h-8 w-8 md:h-12 md:w-12 text-brown-500" />
                </div>
                <h3 className="text-lg md:text-2xl font-bold text-brown-900 mb-2 md:mb-3">Empty Album</h3>
                <p className="text-brown-600 text-sm md:text-base mb-6 md:mb-8 max-w-md mx-auto">
                  This album doesn't have any photos yet. Add your first image by clicking the button below or drag and drop images here.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setEditingImage(null)
                      setNewImage({ image_url: '', caption: '' })
                      setImagePreview(null)
                      setShowUploadModal(true)
                    }}
                    className="px-5 py-2.5 bg-gradient-to-r from-brown-600 to-amber-700 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                  >
                    Add First Photo
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 border border-brown-300 text-brown-700 rounded-lg font-medium hover:bg-amber-50 transition-colors"
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {/* Add New Card */}
              <div 
                className="relative group cursor-pointer"
                onClick={() => {
                  setEditingImage(null)
                  setNewImage({ image_url: '', caption: '' })
                  setImagePreview(null)
                  setShowUploadModal(true)
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className={`
                  aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 p-4
                  ${dragOver 
                    ? 'border-amber-400 bg-amber-50 scale-105' 
                    : 'border-brown-300 hover:border-amber-400 hover:bg-amber-50/50'
                  }
                `}>
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-brown-600 to-amber-700 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="h-5 w-5 md:h-8 md:w-8 text-white" />
                  </div>
                  <p className="text-brown-700 font-medium text-sm md:text-base">Add Photo</p>
                  <p className="text-xs md:text-sm text-brown-500 mt-1 text-center">Click or drag & drop</p>
                </div>
              </div>

              {/* Image Cards */}
              {getActiveAlbumImages().map((image, index) => (
                <div 
                  key={image.id}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1"
                >
                  <div 
                    className="aspect-square relative overflow-hidden cursor-pointer bg-gradient-to-br from-amber-200 to-brown-200"
                    onClick={() => openImageModal(activeAlbum, index)}
                  >
                    {image.url ? (
                      <img 
                        src={image.url} 
                        alt={image.caption}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjI1NiIgaGVpZ2h0PSIyNTYiIGZpbGw9IiNGRkZGRkUiLz48cGF0aCBkPSJNMTU4Ljg2IDEzNS44MDhDMTU4Ljg2IDE0Ny42MiAxNDkuMjUgMTU3LjIzIDEzNy40NCAxNTcuMjNDMTI1LjYyIDE1Ny4yMyAxMTYuMDEgMTQ3LjYyIDExNi4wMSAxMzUuODA4QzExNi4wMSAxMjMuOTk1IDEyNS42MiAxMTQuMzg1IDEzNy40NCAxMTQuMzg1QzE0OS4yNSAxMTQuMzg1IDE1OC44NiAxMjMuOTk1IDE1OC44NiAxMzUuODA4WiIgZmlsbD0iI0UyRTJFMyIvPjxwYXRoIGQ9Ik0xMzcuNDQgMTMxLjUwNkgxMjkuNTM0VjEyMy42SDE0NS4zNDZWMTMxLjUwNkgxMzcuNDRaIiBmaWxsPSIjRTJFMkUzIi8+PC9zdmc+'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-10 w-10 text-brown-400" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-brown-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-3 w-full">
                        <button className="w-full py-1.5 bg-white/90 backdrop-blur-sm text-brown-900 rounded-lg font-medium hover:bg-white transition-colors text-sm">
                          View Full Size
                        </button>
                      </div>
                    </div>
                    
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          startEditImage(activeAlbum, index)
                        }}
                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                        title="Edit"
                      >
                        <Edit2 className="h-3 w-3 text-brown-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteImage(activeAlbum, index, image)
                        }}
                        className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3">
                    <div className="mb-2">
                      <div 
                        className={`text-brown-900 cursor-pointer text-sm ${!expandedCaptions[image.id] ? 'line-clamp-2' : ''}`}
                        onClick={() => toggleCaption(image.id)}
                      >
                        {image.caption}
                      </div>
                      {image.caption?.length > 50 && (
                        <button
                          onClick={() => toggleCaption(image.id)}
                          className="mt-1 text-xs text-amber-600 hover:text-amber-700 flex items-center"
                        >
                          {expandedCaptions[image.id] ? (
                            <>
                              Show less
                              <ChevronUp className="h-3 w-3 ml-1" />
                            </>
                          ) : (
                            <>
                              Read more
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-brown-500 pt-2 border-t border-brown-100">
                      <span className="truncate mr-2">
                        {image.created_at ? new Date(image.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        }) : 'Recently added'}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          openImageModal(activeAlbum, index)
                        }}
                        className="p-0.5 hover:text-amber-600 transition-colors"
                      >
                        <Maximize2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Album Create Modal */}
        {showAlbumModal && (
          <div className="fixed inset-0 bg-brown-900/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-4 md:p-6 border-b border-brown-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-2xl font-bold text-brown-900">
                    Create New Album
                  </h3>
                  <button
                    onClick={cancelAlbumModal}
                    className="p-1.5 md:p-2 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 md:h-6 md:w-6 text-brown-500" />
                  </button>
                </div>
                <p className="text-brown-600 text-sm md:text-base mt-1 md:mt-2">
                  Create a new album to organize your photos
                </p>
              </div>
              
              <div className="p-4 md:p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-2">
                      Album Name
                    </label>
                    <input
                      type="text"
                      value={newAlbumName}
                      onChange={(e) => setNewAlbumName(e.target.value)}
                      placeholder="Enter album name"
                      className="w-full rounded-lg border border-brown-300 px-3 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm"
                      maxLength={50}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 md:p-6 border-t border-brown-200 bg-amber-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelAlbumModal}
                    className="px-4 py-2 border border-brown-300 rounded-lg text-brown-700 font-medium hover:bg-white transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAlbum}
                    disabled={isLoading || !newAlbumName.trim()}
                    className={`
                      px-5 py-2 rounded-lg font-medium flex items-center space-x-1.5 transition-all text-sm
                      ${isLoading || !newAlbumName.trim()
                        ? 'bg-brown-300 text-brown-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-brown-600 to-amber-700 text-white hover:shadow-lg'
                      }
                    `}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Create Album</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload/Edit Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-brown-900/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="p-4 md:p-6 border-b border-brown-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg md:text-2xl font-bold text-brown-900">
                    {editingImage ? 'Edit Photo' : 'Add Photo to Album'}
                  </h3>
                  <button
                    onClick={cancelUpload}
                    className="p-1.5 md:p-2 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5 md:h-6 md:w-6 text-brown-500" />
                  </button>
                </div>
                <p className="text-brown-600 text-sm md:text-base mt-1 md:mt-2">
                  {editingImage ? 'Update your photo details' : `Add a photo to "${getActiveAlbum()?.name}"`}
                </p>
              </div>
              
              <div className="p-4 md:p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                <div className="space-y-4">
                  {/* Image Upload Area */}
                  <div 
                    className={`
                      border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer
                      ${imagePreview ? 'border-brown-300' : 'border-amber-300 bg-amber-50/50 hover:bg-amber-50'}
                    `}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept="image/*"
                    />
                    
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-48 h-48 object-cover rounded-lg mx-auto mb-4 shadow-lg"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setImagePreview(null)
                            setNewImage(prev => ({ ...prev, image_url: '' }))
                            if (fileInputRef.current) {
                              fileInputRef.current.value = ''
                            }
                          }}
                          className="absolute top-1 right-1 p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white"
                        >
                          <X className="h-3 w-3 text-brown-700" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brown-600 to-amber-700 flex items-center justify-center mx-auto mb-4">
                          <Upload className="h-8 w-8 text-white" />
                        </div>
                        <p className="text-lg font-medium text-brown-900 mb-2">
                          Drop your image here, or click to browse
                        </p>
                        <p className="text-sm text-brown-500">
                          Supports JPG, PNG, GIF, WebP • Max 10MB
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Caption Input */}
                  <div>
                    <label className="block text-sm font-medium text-brown-700 mb-2">
                      Photo Caption
                    </label>
                    <textarea
                      value={newImage.caption}
                      onChange={(e) => setNewImage(prev => ({ ...prev, caption: e.target.value }))}
                      placeholder="Describe your photo..."
                      className="w-full h-24 rounded-lg border border-brown-300 px-3 py-2 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none text-sm"
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 md:p-6 border-t border-brown-200 bg-amber-50">
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={cancelUpload}
                    className="px-4 py-2 border border-brown-300 rounded-lg text-brown-700 font-medium hover:bg-white transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingImage ? handleEditImage : handleAddImage}
                    disabled={uploading || isLoading || !newImage.caption?.trim() || !imagePreview}
                    className={`
                      px-5 py-2 rounded-lg font-medium flex items-center space-x-1.5 transition-all text-sm
                      ${uploading || isLoading || !newImage.caption?.trim() || !imagePreview
                        ? 'bg-brown-300 text-brown-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-brown-600 to-amber-700 text-white hover:shadow-lg'
                      }
                    `}
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>{editingImage ? 'Update Photo' : 'Add to Album'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image View Modal */}
        {showImageModal && selectedImageIndex && (
          <div className="fixed inset-0 bg-brown-900/90 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50">
            <div className="relative max-w-4xl w-full max-h-[90vh]">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-2 right-2 z-10 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
              
              <div className="flex flex-col lg:flex-row h-full">
                {/* Image */}
                <div className="flex-1 flex items-center justify-center p-2">
                  <img 
                    src={getCurrentModalImage()?.url} 
                    alt={getCurrentModalImage()?.caption}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg"
                  />
                  
                  {/* Navigation Arrows */}
                  {selectedImageIndex.index > 0 && (
                    <button
                      onClick={() => navigateImage(-1)}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4 text-white rotate-90" />
                    </button>
                  )}
                  
                  {selectedImageIndex.index < (getActiveAlbumImages().length - 1) && (
                    <button
                      onClick={() => navigateImage(1)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4 text-white -rotate-90" />
                    </button>
                  )}
                </div>
                
                {/* Image Info */}
                <div className="lg:w-80 bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-3 lg:mt-0 lg:ml-3">
                  <div className="text-white">
                    <h3 className="text-xl font-bold mb-3">Photo Details</h3>
                    <p className="text-base mb-4">{getCurrentModalImage()?.caption}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-white/70 mb-1">Album</p>
                        <p className="font-medium text-sm">
                          {getActiveAlbum()?.name}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-white/70 mb-1">Added on</p>
                        <p className="font-medium text-sm">
                          {getCurrentModalImage()?.created_at 
                            ? new Date(getCurrentModalImage().created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Recently added'}
                        </p>
                      </div>
                      
                      <div className="pt-3 border-t border-white/20">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setShowImageModal(false)
                              startEditImage(
                                selectedImageIndex.albumId,
                                selectedImageIndex.index
                              )
                            }}
                            className="flex-1 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-medium hover:bg-white/30 transition-colors text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this photo?')) {
                                handleDeleteImage(
                                  selectedImageIndex.albumId,
                                  selectedImageIndex.index,
                                  getCurrentModalImage()
                                )
                              }
                            }}
                            className="flex-1 py-2 bg-red-500/20 text-red-300 backdrop-blur-sm rounded-lg font-medium hover:bg-red-500/30 transition-colors text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}