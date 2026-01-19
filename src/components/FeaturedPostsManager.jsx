'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Upload, Film, Image as ImageIcon, Video, ExternalLink, RefreshCw } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

export default function FeaturedPostsManager() {
  const [featuredPosts, setFeaturedPosts] = useState([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [newPost, setNewPost] = useState({ 
    src: '', 
    href: '/gallery', 
    type: 'image', 
    caption: '' 
  })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const TABLE_ID = 1989

  // Fetch featured posts from database
  const fetchFeaturedPosts = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('classicqueen')
        .select('feature_post')
        .eq('id', TABLE_ID)
        .single()

      if (error) {
        console.error('Database fetch error:', error)
        alert('Failed to load featured posts from database')
        setFeaturedPosts([])
        return
      }

      if (data?.feature_post) {
        // Parse the JSONB column
        let postsArray
        if (Array.isArray(data.feature_post)) {
          postsArray = data.feature_post
        } else {
          try {
            postsArray = JSON.parse(data.feature_post || '[]')
          } catch {
            postsArray = []
          }
        }
        
        // Format for UI
        const formattedPosts = postsArray.map(post => ({
          ...post,
          isEditing: false,
          originalData: { ...post }
        }))
        
        setFeaturedPosts(formattedPosts)
      } else {
        setFeaturedPosts([])
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Error loading featured posts')
      setFeaturedPosts([])
    } finally {
      setLoading(false)
    }
  }

  // Save featured posts to database
  const saveFeaturedPostsToDatabase = async (postsToSave) => {
    try {
      setSaving(true)
      
      const { data, error } = await supabase
        .from('classicqueen')
        .update({ 
          feature_post: postsToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', TABLE_ID)
        .select()

      if (error) {
        throw new Error(`Save failed: ${error.message}`)
      }

      return { success: true, data }
    } catch (error) {
      console.error('Save operation failed:', error)
      return { success: false, error: error.message }
    } finally {
      setSaving(false)
    }
  }

  // Upload file to Supabase storage (classic bucket) - UPDATED FOR REUSE
  const handleFileUpload = async (event, isEditMode = false, editIndex = null) => {
    const file = event.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `featured_${Date.now()}.${fileExt}`
      const filePath = `featured/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('classic')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('classic')
        .getPublicUrl(filePath)
      
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
      
      if (isEditMode && editIndex !== null) {
        // Update existing post during edit
        const updatedPosts = [...featuredPosts]
        updatedPosts[editIndex] = {
          ...updatedPosts[editIndex],
          src: urlData.publicUrl,
          type: mediaType
        }
        setFeaturedPosts(updatedPosts)
      } else {
        // Update new post form
        setNewPost(prev => ({ 
          ...prev, 
          src: urlData.publicUrl,
          type: mediaType
        }))
      }
      
      alert('File uploaded successfully to classic bucket!')
      
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchFeaturedPosts()
  }, [])

  // ADD new featured post
  const handleAddPost = async () => {
    if (!newPost.src.trim() || !newPost.caption.trim()) {
      alert('Please fill in all required fields')
      return
    }
    
    const postToAdd = { 
      src: newPost.src.trim(),
      href: newPost.href.trim() || '/gallery',
      type: newPost.type,
      caption: newPost.caption.trim()
    }
    
    // Create updated array
    const postsToSave = [
      ...featuredPosts.map(({ isEditing, originalData, ...rest }) => rest),
      postToAdd
    ]
    
    // Save to database
    const result = await saveFeaturedPostsToDatabase(postsToSave)
    
    if (result.success) {
      // Update local state
      const updatedPosts = [
        ...featuredPosts,
        { ...postToAdd, isEditing: false, originalData: { ...postToAdd } }
      ]
      setFeaturedPosts(updatedPosts)
      
      // Reset form
      setIsAddingNew(false)
      setNewPost({ src: '', href: '/gallery', type: 'image', caption: '' })
      alert('✅ Featured post added successfully!')
    } else {
      alert(`❌ Failed to save: ${result.error}`)
      await fetchFeaturedPosts() // Refresh from database
    }
  }

  // EDIT existing featured post
  const startEditing = (index) => {
    setEditingIndex(index)
    const updatedPosts = [...featuredPosts]
    updatedPosts[index] = { 
      ...updatedPosts[index], 
      isEditing: true 
    }
    setFeaturedPosts(updatedPosts)
  }

  const cancelEditing = (index) => {
    const updatedPosts = [...featuredPosts]
    updatedPosts[index] = { 
      ...updatedPosts[index].originalData,
      isEditing: false,
      originalData: { ...updatedPosts[index].originalData }
    }
    setFeaturedPosts(updatedPosts)
    setEditingIndex(null)
  }

  const updatePostField = (index, field, value) => {
    const updatedPosts = [...featuredPosts]
    updatedPosts[index][field] = value
    setFeaturedPosts(updatedPosts)
  }

  const saveEdit = async (index) => {
    const post = featuredPosts[index]
    if (!post.src.trim() || !post.caption.trim()) {
      alert('Please fill in all required fields')
      return
    }
    
    const postToSave = { 
      src: post.src.trim(),
      href: post.href.trim() || '/gallery',
      type: post.type,
      caption: post.caption.trim()
    }
    
    // Create updated array
    const updatedPosts = [...featuredPosts]
    updatedPosts[index] = { 
      ...postToSave, 
      isEditing: false,
      originalData: { ...postToSave }
    }
    
    const postsToSave = updatedPosts.map(({ isEditing, originalData, ...rest }) => rest)
    
    // Save to database
    const result = await saveFeaturedPostsToDatabase(postsToSave)
    
    if (result.success) {
      setFeaturedPosts(updatedPosts)
      setEditingIndex(null)
      alert('✅ Changes saved successfully!')
    } else {
      alert(`❌ Failed to save: ${result.error}`)
      cancelEditing(index)
      await fetchFeaturedPosts() // Refresh from database
    }
  }

  // DELETE featured post
  const handleDelete = async (index) => {
    const postCaption = featuredPosts[index].caption
    if (!confirm(`Are you sure you want to delete "${postCaption}"?`)) return
    
    // Create updated array without the deleted item
    const updatedPosts = featuredPosts.filter((_, i) => i !== index)
    const postsToSave = updatedPosts.map(({ isEditing, originalData, ...rest }) => rest)
    
    // Save to database
    const result = await saveFeaturedPostsToDatabase(postsToSave)
    
    if (result.success) {
      setFeaturedPosts(updatedPosts)
      alert(`✅ "${postCaption}" deleted successfully!`)
    } else {
      alert(`❌ Failed to delete: ${result.error}`)
      await fetchFeaturedPosts() // Refresh from database
    }
  }

  // BULK save all
  const handleBulkUpdate = async () => {
    if (!confirm('Save all current featured posts to database?')) return
    
    const postsToSave = featuredPosts.map(({ isEditing, originalData, ...rest }) => rest)
    const result = await saveFeaturedPostsToDatabase(postsToSave)
    
    if (result.success) {
      alert('✅ All featured posts saved to database!')
    } else {
      alert(`❌ Failed to save: ${result.error}`)
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading featured posts...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Featured Posts Manager</h1>
          <p className="text-gray-600 mt-1">Manage featured posts for gallery</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchFeaturedPosts}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleBulkUpdate}
            disabled={saving || featuredPosts.length === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All'}
          </button>
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Database Status */}
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-700">Featured Posts in Database:</span>
            <span className="ml-2 text-xl font-bold text-purple-700">{featuredPosts.length}</span>
            <span className="ml-4 text-sm text-gray-600">
              Table: classicqueen • Column: feature_post
            </span>
          </div>
          {saving && (
            <div className="flex items-center text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              Saving to database...
            </div>
          )}
        </div>
      </div>

      {/* Add New Featured Post Form */}
      {isAddingNew && (
        <div className="mb-8 p-6 border-2 border-purple-200 bg-purple-50 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-purple-900">Add New Featured Post</h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-gray-500 hover:text-gray-700"
              disabled={saving || uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media File Upload (to 'classic' bucket)
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-purple-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload image or video'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Files upload to: classic/featured/</p>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="image/*,video/*"
                      disabled={uploading}
                    />
                  </div>
                </label>
                <div className="text-sm text-gray-500">
                  or
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={newPost.src}
                    onChange={(e) => setNewPost({...newPost, src: e.target.value})}
                    placeholder="https://example.com/media.jpg"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption *
                </label>
                <input
                  type="text"
                  value={newPost.caption}
                  onChange={(e) => setNewPost({...newPost, caption: e.target.value})}
                  placeholder="Enter caption"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={uploading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Type
                </label>
                <select
                  value={newPost.type}
                  onChange={(e) => setNewPost({...newPost, type: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={uploading}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL
              </label>
              <input
                type="text"
                value={newPost.href}
                onChange={(e) => setNewPost({...newPost, href: e.target.value})}
                placeholder="/gallery"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>
            
            {/* Preview */}
            {newPost.src && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {newPost.type === 'image' ? (
                      <div className="h-20 w-32 bg-gray-200 rounded overflow-hidden">
                        <img 
                          src={newPost.src} 
                          alt="Preview" 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e5e7eb"/></svg>'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-20 w-32 bg-gray-800 rounded flex items-center justify-center">
                        <Film className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{newPost.caption || 'No caption'}</p>
                    <p className="text-sm text-gray-500 truncate mt-1">{newPost.src}</p>
                    <div className="flex items-center mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${newPost.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {newPost.type === 'image' ? (
                          <ImageIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <Video className="h-3 w-3 mr-1" />
                        )}
                        {newPost.type}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        Link: {newPost.href}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsAddingNew(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddPost}
                disabled={uploading || saving || !newPost.src.trim() || !newPost.caption.trim()}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg inline-flex items-center transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {saving ? 'Adding...' : 'Add Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Featured Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredPosts.length > 0 ? featuredPosts.map((post, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-xl shadow-md border-2 overflow-hidden transition-all hover:shadow-lg ${editingIndex === index ? 'border-purple-300' : 'border-gray-100'}`}
          >
            {/* Media Preview */}
            <div className="h-56 bg-gray-200 relative overflow-hidden">
              {post.type === 'image' ? (
                post.src ? (
                  <img 
                    src={post.src} 
                    alt={post.caption} 
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e5e7eb"/></svg>'
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )
              ) : (
                <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                  <Video className="h-12 w-12 text-white" />
                </div>
              )}
              
              {/* Media Type Badge */}
              <div className="absolute top-2 right-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${post.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                  {post.type === 'image' ? (
                    <ImageIcon className="h-3 w-3 mr-1" />
                  ) : (
                    <Video className="h-3 w-3 mr-1" />
                  )}
                  {post.type}
                </span>
              </div>
            </div>
            
            {/* Post Content */}
            <div className="p-4">
              {editingIndex === index ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Media URL or Upload
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={post.src}
                        onChange={(e) => updatePostField(index, 'src', e.target.value)}
                        className="flex-1 text-sm rounded border border-gray-300 px-2 py-1.5 focus:ring-1 focus:ring-purple-500"
                        disabled={saving || uploading}
                        placeholder="https://example.com/media.jpg"
                      />
                      <label className="cursor-pointer">
                        <div className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors">
                          <Upload className="h-3 w-3 mr-1" />
                          Upload
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, true, index)}
                            accept="image/*,video/*"
                            disabled={uploading}
                          />
                        </div>
                      </label>
                    </div>
                    {post.src && (
                      <p className="text-xs text-gray-500 truncate mt-1">{post.src}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Caption</label>
                    <input
                      type="text"
                      value={post.caption}
                      onChange={(e) => updatePostField(index, 'caption', e.target.value)}
                      className="w-full text-sm rounded border border-gray-300 px-2 py-1.5 focus:ring-1 focus:ring-purple-500"
                      disabled={saving}
                      placeholder="Enter caption"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                      <select
                        value={post.type}
                        onChange={(e) => updatePostField(index, 'type', e.target.value)}
                        className="w-full text-sm rounded border border-gray-300 px-2 py-1.5 focus:ring-1 focus:ring-purple-500"
                        disabled={saving}
                      >
                        <option value="image">Image</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Link</label>
                      <input
                        type="text"
                        value={post.href}
                        onChange={(e) => updatePostField(index, 'href', e.target.value)}
                        className="w-full text-sm rounded border border-gray-300 px-2 py-1.5 focus:ring-1 focus:ring-purple-500"
                        disabled={saving}
                        placeholder="/gallery"
                      />
                    </div>
                  </div>
                  
                  {/* Edit Mode Preview */}
                  {post.src && (
                    <div className="p-2 bg-gray-50 rounded border border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-1">Current:</p>
                      <div className="flex items-center">
                        <div className="h-12 w-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          {post.type === 'image' ? (
                            <img 
                              src={post.src} 
                              alt="Current" 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e5e7eb"/></svg>'
                              }}
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-700 flex items-center justify-center">
                              <Video className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="ml-2 flex-1 min-w-0">
                          <p className="text-xs text-gray-600 truncate">{post.src.split('/').pop()}</p>
                          <span className="text-xs text-gray-500">{post.type}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => cancelEditing(index)}
                      className="px-3 py-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded text-sm transition-colors"
                      disabled={saving || uploading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(index)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                      disabled={saving || uploading || !post.src.trim() || !post.caption.trim()}
                    >
                      {uploading ? 'Uploading...' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-gray-900 mb-2">{post.caption}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <ExternalLink className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">{post.href}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEditing(index)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Edit"
                        disabled={saving}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Delete"
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Film className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Featured Posts</h3>
              <p className="text-gray-600 mb-6">Add posts to feature in your gallery</p>
              <button
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Post
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Database Info */}
      {featuredPosts.length > 0 && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Storage:</span> New uploads go to <code className="bg-gray-100 px-1 rounded">classic</code> bucket
              <span className="mx-2">•</span>
              <span className="font-medium">Total:</span> {featuredPosts.length} posts
            </div>
            <div className="text-sm text-gray-500">
              Click edit button on any post to modify
            </div>
          </div>
        </div>
      )}
    </div>
  )
}