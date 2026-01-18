'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Film } from 'lucide-react'

export default function FeaturedPostsManager({ data, onUpdate, saveToDatabase }) {
  // FIX 1: Initialize with empty array if data is undefined
  const [posts, setPosts] = useState(data || [])
  const [editingIndex, setEditingIndex] = useState(null)
  const [newPost, setNewPost] = useState({ src: '', href: '/gallery', type: 'image', caption: '' })

  useEffect(() => {
    // FIX 2: Always ensure posts is an array
    setPosts(data || [])
  }, [data])

  const handleSave = async () => {
    if (!newPost.src.trim() || !newPost.caption.trim()) {
      alert('Please fill in all fields')
      return
    }
    
    try {
      // FIX 3: Use spread with safety check
      const updated = [...(posts || [])]
      if (editingIndex === 'new') {
        updated.push(newPost)
      } else {
        updated[editingIndex] = newPost
      }
      
      setPosts(updated)
      onUpdate(updated)
      
      const success = await saveToDatabase('feature_post', updated)
      if (success) {
        setEditingIndex(null)
        setNewPost({ src: '', href: '/gallery', type: 'image', caption: '' })
      }
    } catch (error) {
      console.error('Error saving featured post:', error)
      alert('Failed to save featured post')
    }
  }

  const handleDelete = async (index) => {
    if (!confirm('Are you sure you want to delete this featured post?')) return
    
    try {
      // FIX 4: Filter with safety check
      const updated = (posts || []).filter((_, i) => i !== index)
      setPosts(updated)
      onUpdate(updated)
      
      await saveToDatabase('feature_post', updated)
    } catch (error) {
      console.error('Error deleting featured post:', error)
      alert('Failed to delete featured post')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Featured Posts Management</h2>
        <button
          onClick={() => {
            setNewPost({ src: '', href: '/gallery', type: 'image', caption: '' })
            setEditingIndex('new')
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Featured Post
        </button>
      </div>

      {/* Add/Edit Form */}
      {editingIndex !== null && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingIndex === 'new' ? 'Add New Featured Post' : 'Edit Featured Post'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media URL
              </label>
              <input
                type="text"
                value={newPost.src}
                onChange={(e) => setNewPost({...newPost, src: e.target.value})}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption
              </label>
              <input
                type="text"
                value={newPost.caption}
                onChange={(e) => setNewPost({...newPost, caption: e.target.value})}
                placeholder="Enter caption"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={newPost.type}
                onChange={(e) => setNewPost({...newPost, type: e.target.value})}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingIndex(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newPost.src.trim() || !newPost.caption.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Grid - FIX 5: Added null/undefined check before map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts && posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                {post.type === 'image' ? (
                  post.src ? (
                    <img src={post.src} alt={post.caption} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                      <Film className="h-12 w-12 text-gray-400" />
                    </div>
                  )
                ) : (
                  <div className="h-full w-full bg-gray-800 flex items-center justify-center">
                    <Film className="h-12 w-12 text-white" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">{post.caption || 'No caption'}</h3>
                <p className="text-sm text-gray-500 truncate">{post.src}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {post.type}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setNewPost(post)
                        setEditingIndex(index)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No featured posts yet. Add your first post above.
          </div>
        )}
      </div>
    </div>
  )
}