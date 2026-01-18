'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Upload, Film } from 'lucide-react'

export default function HeroManager({ data, onUpdate, supabase, saveToDatabase }) {
  // Initialize with empty array if data is undefined/null
  const [items, setItems] = useState(data || [])
  const [isEditing, setIsEditing] = useState(null)
  const [newItem, setNewItem] = useState({ src: '', type: 'image', cta: { href: '/register' } })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    // Ensure we always have an array
    setItems(data || [])
  }, [data])

  const handleAdd = async () => {
    if (!newItem.src.trim()) {
      alert('Please enter a media URL')
      return
    }
    
    try {
      const updated = [...(items || []), newItem]
      setItems(updated)
      onUpdate(updated)
      
      const success = await saveToDatabase('hero', updated)
      if (success) {
        setNewItem({ src: '', type: 'image', cta: { href: '/register' } })
        setIsEditing(null)
      }
    } catch (error) {
      console.error('Error adding hero item:', error)
      alert('Failed to add hero item')
    }
  }

  const handleDelete = async (index) => {
    if (!confirm('Are you sure you want to delete this hero item?')) return
    
    try {
      const updated = (items || []).filter((_, i) => i !== index)
      setItems(updated)
      onUpdate(updated)
      
      await saveToDatabase('hero', updated)
    } catch (error) {
      console.error('Error deleting hero item:', error)
      alert('Failed to delete hero item')
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `hero/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('heros')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      const { data: urlData } = supabase.storage
        .from('heros')
        .getPublicUrl(filePath)
      
      setNewItem(prev => ({ ...prev, src: urlData.publicUrl }))
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Hero Slider Management</h2>
        <button
          onClick={() => setIsEditing('new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hero Item
        </button>
      </div>

      {/* Add/Edit Form */}
      {isEditing === 'new' && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Hero Item</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media URL or Upload File
              </label>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newItem.src}
                  onChange={(e) => setNewItem({...newItem, src: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                />
                <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,video/*"
                  />
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media Type
              </label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={uploading || !newItem.src.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-4">
        {/* Add null check before map */}
        {items && items.length > 0 ? (
          items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {item.type === 'image' ? (
                    <div className="h-16 w-24 bg-gray-200 rounded overflow-hidden">
                      {item.src ? (
                        <img src={item.src} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                          <Film className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-16 w-24 bg-gray-800 rounded flex items-center justify-center">
                      <Film className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {item.type === 'image' ? 'Image' : 'Video'}
                  </p>
                  <p className="text-sm text-gray-500 truncate max-w-md">{item.src}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDelete(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No hero items yet. Add your first item above.
          </div>
        )}
      </div>
    </div>
  )
}