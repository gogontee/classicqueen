'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, FolderPlus, Database } from 'lucide-react'

export default function AlbumsManager({ albums, onUpdateAlbums, supabase }) {
  // FIX 1: Receive albums prop and provide default value
  const [newAlbumName, setNewAlbumName] = useState('')
  const [creatingAlbum, setCreatingAlbum] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Use the albums prop directly, with default empty array
  const albumList = albums || []

  const handleCreateAlbum = async () => {
    if (!newAlbumName.trim()) {
      alert('Please enter an album name')
      return
    }
    
    setLoading(true)
    try {
      // Create the column name
      const columnName = `album_${newAlbumName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`
      
      // First, check if the column already exists in the gallery table
      const { data: existingData, error: checkError } = await supabase
        .from('gallery')
        .select('*')
        .limit(1)
        .single()
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }
      
      // If gallery row doesn't exist, create it first
      if (!existingData) {
        const { error: createError } = await supabase
          .from('gallery')
          .insert({ id: 1, [columnName]: [] })
        
        if (createError) throw createError
      } else {
        // Update existing row to add the new album column
        const { error: updateError } = await supabase
          .from('gallery')
          .update({ [columnName]: [] })
          .eq('id', 1)
        
        if (updateError) {
          // If column doesn't exist, we need to alter the table
          // Note: Supabase doesn't allow direct column creation via client
          // You would need to use a database migration or Edge Function
          // For now, we'll show an alert
          alert(`Album "${newAlbumName}" created in memory. Please create the column in your database with name: ${columnName}`)
        }
      }
      
      // FIX 2: Update local state with safety check
      const updatedAlbums = [...(albumList || []), columnName]
      onUpdateAlbums(updatedAlbums)
      setNewAlbumName('')
      setCreatingAlbum(false)
      
      alert('Album created successfully!')
      
    } catch (error) {
      console.error('Error creating album:', error)
      alert(`Failed to create album: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAlbum = async (albumName) => {
    if (!confirm(`Are you sure you want to delete album "${albumName}"? This will delete all images in this album.`)) {
      return
    }
    
    setLoading(true)
    try {
      // Note: Removing columns requires database admin privileges
      // For now, we'll just remove the data and mark it as inactive
      const { error } = await supabase
        .from('gallery')
        .update({ [albumName]: null })
        .eq('id', 1)
      
      if (error) throw error
      
      // FIX 3: Filter with safety check
      const updatedAlbums = (albumList || []).filter(a => a !== albumName)
      onUpdateAlbums(updatedAlbums)
      
      alert('Album deleted successfully!')
      
    } catch (error) {
      console.error('Error deleting album:', error)
      alert(`Failed to delete album: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleManageAlbum = (albumName) => {
    alert(`Managing album: ${albumName}\n\nThis feature would allow you to:\n1. Add/remove images\n2. Edit image captions\n3. Reorder images\n\nTo implement this, you would need to fetch the images for this album from the database and display them similar to the GalleriesManager.`)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Album Management</h2>
        <button
          onClick={() => setCreatingAlbum(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FolderPlus className="h-4 w-4 mr-2" />
          Create New Album
        </button>
      </div>

      {/* Create Album Form */}
      {creatingAlbum && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Album</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Album Name
              </label>
              <input
                type="text"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="e.g., Behind The Scenes, Red Carpet"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
              <p className="mt-1 text-sm text-gray-500">
                Album will be created as: album_{newAlbumName.toLowerCase().replace(/[^a-z0-9]/g, '_')}
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setCreatingAlbum(false)
                  setNewAlbumName('')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAlbum}
                disabled={loading || !newAlbumName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Album'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Albums List - FIX 4: Added null/undefined check before map */}
      <div className="space-y-4">
        {albumList && albumList.length > 0 ? (
          albumList.map((album) => (
            <div key={album} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <h4 className="font-medium text-gray-900">{album}</h4>
                  <p className="text-sm text-gray-500">
                    Created on: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => handleManageAlbum(album)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Edit2 className="h-3 w-3 mr-1" />
                  Manage
                </button>
                <button
                  onClick={() => handleDeleteAlbum(album)}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1 border border-red-300 rounded text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No albums created yet. Create your first album above.
          </div>
        )}
      </div>
    </div>
  )
}