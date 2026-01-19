'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X, Upload, Film, Image as ImageIcon, Video, ExternalLink, RefreshCw } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

export default function HeroManager() {
  const [heroItems, setHeroItems] = useState([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [newItem, setNewItem] = useState({ 
    src: '', 
    type: 'image', 
    cta: { href: '/register' } 
  })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const TABLE_ID = 1989 // Your specific table ID

  // Fetch hero items from database
  const fetchHeroItems = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching hero items from database, table ID:', TABLE_ID)
      
      const { data, error } = await supabase
        .from('classicqueen')
        .select('hero')
        .eq('id', TABLE_ID)
        .single()

      if (error) {
        console.error('❌ Database fetch error:', error)
        alert('Failed to load hero items from database')
        setHeroItems([])
        return
      }

      console.log('✅ Database response:', data)
      
      if (data?.hero) {
        // Parse the JSONB column
        let itemsArray
        if (Array.isArray(data.hero)) {
          itemsArray = data.hero
        } else {
          try {
            itemsArray = JSON.parse(data.hero || '[]')
          } catch (parseError) {
            console.error('❌ JSON parse error:', parseError)
            itemsArray = []
          }
        }
        
        console.log('📊 Parsed hero items:', itemsArray)
        
        // Format for UI
        const formattedItems = itemsArray.map(item => ({
          ...item,
          isEditing: false,
          originalData: { ...item }
        }))
        
        setHeroItems(formattedItems)
        console.log(`✅ Loaded ${formattedItems.length} hero items`)
      } else {
        console.log('ℹ️ No hero items found in database')
        setHeroItems([])
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      alert('Error loading hero items')
      setHeroItems([])
    } finally {
      setLoading(false)
    }
  }

  // Save hero items to database
  const saveHeroToDatabase = async (itemsToSave) => {
    try {
      setSaving(true)
      console.log('💾 Saving hero items to database:', itemsToSave)
      
      const { data, error } = await supabase
        .from('classicqueen')
        .update({ 
          hero: itemsToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', TABLE_ID)
        .select()

      if (error) {
        console.error('❌ Database save error:', error)
        throw new Error(`Save failed: ${error.message}`)
      }

      console.log('✅ Database save successful:', data)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Save operation failed:', error)
      return { success: false, error: error.message }
    } finally {
      setSaving(false)
    }
  }

  // Upload file to Supabase storage - UPDATED TO USE 'classic' BUCKET
  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `hero_${Date.now()}.${fileExt}`
      const filePath = `heros/${fileName}` // Keep same folder structure
      
      console.log(`📤 Uploading file: ${fileName} to classic bucket`)
      
      // UPDATED: Upload to 'classic' bucket instead of 'heros'
      const { error: uploadError } = await supabase.storage
        .from('classic') // CHANGED: Using 'classic' bucket
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }
      
      // Get public URL from 'classic' bucket
      const { data: urlData } = supabase.storage
        .from('classic') // CHANGED: Using 'classic' bucket
        .getPublicUrl(filePath)
      
      const mediaType = file.type.startsWith('video/') ? 'video' : 'image'
      
      setNewItem(prev => ({ 
        ...prev, 
        src: urlData.publicUrl,
        type: mediaType
      }))
      
      console.log('✅ File uploaded to classic bucket:', urlData.publicUrl)
      alert('File uploaded successfully to classic bucket!')
      
    } catch (error) {
      console.error('❌ Upload error:', error)
      alert(`Upload failed: ${error.message}`)
      
      // Check if bucket exists
      try {
        const { data: buckets } = await supabase.storage.listBuckets()
        console.log('Available buckets:', buckets)
        if (!buckets?.some(b => b.name === 'classic')) {
          alert('❌ Error: "classic" bucket not found. Please create it in Supabase Storage.')
        }
      } catch (bucketError) {
        console.error('Bucket check error:', bucketError)
      }
    } finally {
      setUploading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchHeroItems()
  }, [])

  // ===== CRUD OPERATIONS =====

  // ADD new hero item
  const handleAddItem = async () => {
    if (!newItem.src.trim()) {
      alert('Please enter a media URL or upload a file')
      return
    }
    
    const itemToAdd = { 
      src: newItem.src.trim(),
      type: newItem.type,
      cta: { href: newItem.cta.href.trim() || '/register' }
    }
    
    // Create updated array
    const itemsToSave = [
      ...heroItems.map(({ isEditing, originalData, ...rest }) => rest),
      itemToAdd
    ]
    
    // Save to database
    const result = await saveHeroToDatabase(itemsToSave)
    
    if (result.success) {
      // Update local state
      const updatedItems = [
        ...heroItems,
        { ...itemToAdd, isEditing: false, originalData: { ...itemToAdd } }
      ]
      setHeroItems(updatedItems)
      
      // Reset form
      setIsAddingNew(false)
      setNewItem({ src: '', type: 'image', cta: { href: '/register' } })
      alert('✅ Hero item added successfully!')
    } else {
      alert(`❌ Failed to save: ${result.error}`)
      await fetchHeroItems() // Refresh from database
    }
  }

  // EDIT existing hero item
  const startEditing = (index) => {
    setEditingIndex(index)
    const updatedItems = [...heroItems]
    updatedItems[index] = { 
      ...updatedItems[index], 
      isEditing: true 
    }
    setHeroItems(updatedItems)
  }

  const cancelEditing = (index) => {
    const updatedItems = [...heroItems]
    updatedItems[index] = { 
      ...updatedItems[index].originalData,
      isEditing: false,
      originalData: { ...updatedItems[index].originalData }
    }
    setHeroItems(updatedItems)
    setEditingIndex(null)
  }

  const updateItemField = (index, field, value) => {
    const updatedItems = [...heroItems]
    if (field === 'cta.href') {
      updatedItems[index].cta.href = value
    } else {
      updatedItems[index][field] = value
    }
    setHeroItems(updatedItems)
  }

  const saveEdit = async (index) => {
    const item = heroItems[index]
    if (!item.src.trim()) {
      alert('Please enter a media URL')
      return
    }
    
    const itemToSave = { 
      src: item.src.trim(),
      type: item.type,
      cta: { href: item.cta.href.trim() || '/register' }
    }
    
    // Create updated array
    const updatedItems = [...heroItems]
    updatedItems[index] = { 
      ...itemToSave, 
      isEditing: false,
      originalData: { ...itemToSave }
    }
    
    const itemsToSave = updatedItems.map(({ isEditing, originalData, ...rest }) => rest)
    
    // Save to database
    const result = await saveHeroToDatabase(itemsToSave)
    
    if (result.success) {
      setHeroItems(updatedItems)
      setEditingIndex(null)
      alert('✅ Changes saved successfully!')
    } else {
      alert(`❌ Failed to save: ${result.error}`)
      cancelEditing(index)
      await fetchHeroItems() // Refresh from database
    }
  }

  // DELETE hero item
  const handleDelete = async (index) => {
    const itemType = heroItems[index].type
    if (!confirm(`Are you sure you want to delete this ${itemType}?`)) return
    
    // Create updated array without the deleted item
    const updatedItems = heroItems.filter((_, i) => i !== index)
    const itemsToSave = updatedItems.map(({ isEditing, originalData, ...rest }) => rest)
    
    // Save to database
    const result = await saveHeroToDatabase(itemsToSave)
    
    if (result.success) {
      setHeroItems(updatedItems)
      alert(`✅ ${itemType} deleted successfully!`)
    } else {
      alert(`❌ Failed to delete: ${result.error}`)
      await fetchHeroItems() // Refresh from database
    }
  }

  // BULK save all
  const handleBulkUpdate = async () => {
    if (!confirm('Save all current hero items to database?')) return
    
    const itemsToSave = heroItems.map(({ isEditing, originalData, ...rest }) => rest)
    const result = await saveHeroToDatabase(itemsToSave)
    
    if (result.success) {
      alert('✅ All hero items saved to database!')
    } else {
      alert(`❌ Failed to save: ${result.error}`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading hero items from database...</p>
            <p className="text-sm text-gray-500 mt-2">Table ID: {TABLE_ID}</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Hero Slider Manager</h1>
          <p className="text-gray-600 mt-1">Database Table ID: {TABLE_ID}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchHeroItems}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleBulkUpdate}
            disabled={saving || heroItems.length === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All'}
          </button>
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Database Status */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-700">Hero Items in Database:</span>
            <span className="ml-2 text-xl font-bold text-blue-700">{heroItems.length}</span>
            <span className="ml-4 text-sm text-gray-600">
              Table: classicqueen • ID: {TABLE_ID}
            </span>
          </div>
          {saving && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Saving to database...
            </div>
          )}
        </div>
      </div>

      {/* Add New Hero Item Form */}
      {isAddingNew && (
        <div className="mb-8 p-6 border-2 border-green-200 bg-green-50 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-green-900">Add New Hero Item</h3>
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
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {uploading ? 'Uploading...' : 'Click to upload image or video'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Files upload to: classic/heros/</p>
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
                    value={newItem.src}
                    onChange={(e) => setNewItem({...newItem, src: e.target.value})}
                    placeholder="https://example.com/media.jpg"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Media Type
                </label>
                <select
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={uploading}
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA Link
                </label>
                <input
                  type="text"
                  value={newItem.cta.href}
                  onChange={(e) => setNewItem({
                    ...newItem, 
                    cta: { href: e.target.value }
                  })}
                  placeholder="/register"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={uploading}
                />
              </div>
            </div>
            
            {/* Preview */}
            {newItem.src && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {newItem.type === 'image' ? (
                      <div className="h-20 w-32 bg-gray-200 rounded overflow-hidden">
                        <img 
                          src={newItem.src} 
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
                    <p className="text-sm text-gray-500 truncate">{newItem.src}</p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${newItem.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {newItem.type === 'image' ? (
                          <ImageIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <Video className="h-3 w-3 mr-1" />
                        )}
                        {newItem.type}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        CTA: {newItem.cta.href}
                      </span>
                    </div>
                    {newItem.src.includes('classic') && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                        ✓ Stored in 'classic' bucket
                      </span>
                    )}
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
                onClick={handleAddItem}
                disabled={uploading || saving || !newItem.src.trim()}
                className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg inline-flex items-center transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {saving ? 'Adding...' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Items List */}
      <div className="space-y-4">
        {heroItems.length > 0 ? (
          heroItems.map((item, index) => (
            <div 
              key={index} 
              className={`p-4 border-2 rounded-lg transition-all ${editingIndex === index ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Media Preview */}
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {item.type === 'image' ? (
                      <div className="h-24 w-32 bg-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={item.src} 
                          alt={`Hero ${index + 1}`} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23e5e7eb"/></svg>'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-24 w-32 bg-gray-800 rounded-lg flex items-center justify-center">
                        <Film className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Editable/View Content */}
                  <div className="flex-1 min-w-0">
                    {editingIndex === index ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Media URL</label>
                          <input
                            type="text"
                            value={item.src}
                            onChange={(e) => updateItemField(index, 'src', e.target.value)}
                            className="w-full text-sm rounded border border-gray-300 px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                            disabled={saving}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                            <select
                              value={item.type}
                              onChange={(e) => updateItemField(index, 'type', e.target.value)}
                              className="w-full text-sm rounded border border-gray-300 px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                              disabled={saving}
                            >
                              <option value="image">Image</option>
                              <option value="video">Video</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">CTA Link</label>
                            <input
                              type="text"
                              value={item.cta.href}
                              onChange={(e) => updateItemField(index, 'cta.href', e.target.value)}
                              className="w-full text-sm rounded border border-gray-300 px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                              disabled={saving}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.type === 'image' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                            {item.type === 'image' ? (
                              <ImageIcon className="h-3 w-3 mr-1" />
                            ) : (
                              <Video className="h-3 w-3 mr-1" />
                            )}
                            {item.type}
                          </span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {item.cta.href}
                          </span>
                          {item.src.includes('classic') && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              classic bucket
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 break-all">{item.src}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  {editingIndex === index ? (
                    <>
                      <button
                        onClick={() => cancelEditing(index)}
                        className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Cancel"
                        disabled={saving}
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => saveEdit(index)}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        title="Save"
                        disabled={saving}
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(index)}
                        className="px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                        disabled={saving}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                        disabled={saving}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Film className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Hero Items Found</h3>
              <p className="text-gray-600 mb-6">Add images or videos for your hero slider</p>
              <button
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Hero Item
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Database Connection Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Storage & Database Information</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• Table: <code className="bg-gray-100 px-1 rounded">classicqueen</code></div>
          <div>• Row ID: <code className="bg-gray-100 px-1 rounded">{TABLE_ID}</code></div>
          <div>• Column: <code className="bg-gray-100 px-1 rounded">hero (JSONB)</code></div>
          <div>• Storage Bucket: <code className="bg-gray-100 px-1 rounded">classic</code> (New uploads go here)</div>
          <div>• Storage Path: <code className="bg-gray-100 px-1 rounded">classic/heros/</code></div>
          <div>• Existing files may be in 'heros' bucket, new uploads go to 'classic' bucket</div>
        </div>
      </div>
    </div>
  )
}