'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  Calendar, User, Clock, Tag, Globe, Eye, EyeOff,
  Upload, CheckCircle, AlertCircle, Loader2,
  Bold, Italic, Underline, List, Link, Type
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { motion } from 'motion/react'
import dynamic from 'next/dynamic'

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

export default function NewsManagement() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [currentNews, setCurrentNews] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Announcements',
    author: 'Classic Queen Team',
    read_time: 5,
    tags: [],
    is_published: true,
    cover_image: ''
  })
  const [newTag, setNewTag] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    'Announcements',
    'Events',
    'Contestants',
    'Sponsors',
    'Partnerships',
    'Press Releases',
    'Behind the Scenes',
    'Success Stories'
  ]

  // Custom toolbar for ReactQuill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'link', 'image', 'align'
  ]

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNews(data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching news:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleContentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files[0]
      if (!file) return

      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a valid image file (JPEG, PNG, WebP, GIF)')
        return
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be less than 5MB')
        return
      }

      setUploading(true)
      setUploadError('')

      // In a real implementation, you would upload to Supabase Storage
      // For now, we'll use a placeholder URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          cover_image: reader.result
        }))
        setUploading(false)
      }
      reader.readAsDataURL(file)

    } catch (err) {
      setUploadError('Error uploading image')
      setUploading(false)
      console.error('Upload error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (!formData.title.trim() || !formData.content.trim()) {
        setError('Title and content are required')
        return
      }

      setIsSubmitting(true)
      setError(null)

      const newsData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        category: formData.category,
        author: formData.author.trim() || 'Classic Queen Team',
        read_time: parseInt(formData.read_time) || 5,
        tags: formData.tags,
        is_published: formData.is_published,
        cover_image: formData.cover_image,
        updated_at: new Date().toISOString()
      }

      let result
      if (currentNews) {
        // Update existing news
        const { data, error } = await supabase
          .from('news')
          .update(newsData)
          .eq('id', currentNews.id)
          .select()
          .single()

        if (error) throw error
        result = data
        
        setSuccessMessage('News updated successfully!')
      } else {
        // Create new news
        const { data, error } = await supabase
          .from('news')
          .insert([newsData])
          .select()
          .single()

        if (error) throw error
        result = data
        
        setSuccessMessage('News created successfully!')
      }

      resetForm()
      fetchNews()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)

    } catch (err) {
      setError(err.message || 'Error saving news article')
      console.error('Error saving news:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (newsItem) => {
    setIsEditing(true)
    setCurrentNews(newsItem)
    setFormData({
      title: newsItem.title,
      excerpt: newsItem.excerpt || '',
      content: newsItem.content || '',
      category: newsItem.category || 'Announcements',
      author: newsItem.author || 'Classic Queen Team',
      read_time: newsItem.read_time || 5,
      tags: newsItem.tags || [],
      is_published: newsItem.is_published !== false,
      cover_image: newsItem.cover_image || ''
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) {
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)

      if (error) throw error

      setSuccessMessage('News deleted successfully!')
      fetchNews()

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.message)
      console.error('Error deleting news:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setIsEditing(false)
    setCurrentNews(null)
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Announcements',
      author: 'Classic Queen Team',
      read_time: 5,
      tags: [],
      is_published: true,
      cover_image: ''
    })
    setNewTag('')
    setUploadError('')
    setError(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading && !news.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brown-900">News Management</h1>
          <p className="text-brown-600 mt-2">Add, edit, and manage news articles</p>
        </div>
        <button
          onClick={resetForm}
          className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white font-medium rounded-lg hover:bg-gold-600 transition-colors"
        >
          <Plus size={20} />
          Add New Article
        </button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Form Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg border border-brown-100 overflow-hidden"
      >
        <div className="p-6 border-b border-brown-100">
          <h2 className="text-xl font-bold text-brown-900">
            {isEditing ? 'Edit News Article' : 'Create New Article'}
          </h2>
          <p className="text-brown-600 text-sm mt-1">
            {isEditing ? 'Update the details below' : 'Fill in the details to create a new news article'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-brown-700 font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-brown-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-brown-50/50"
                  placeholder="Enter news title"
                  required
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-brown-700 font-medium mb-2">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border border-brown-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-brown-50/50 resize-none"
                  placeholder="Brief summary of the article (shown in news listings)"
                />
              </div>

              {/* Category & Author */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brown-700 font-medium mb-2">
                    <Tag size={16} className="inline mr-2" />
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-brown-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-brown-700 font-medium mb-2">
                    <User size={16} className="inline mr-2" />
                    Author
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-brown-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-brown-50/50"
                    placeholder="Author name"
                  />
                </div>
              </div>

              {/* Read Time & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-brown-700 font-medium mb-2">
                    <Clock size={16} className="inline mr-2" />
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    name="read_time"
                    value={formData.read_time}
                    onChange={handleInputChange}
                    min="1"
                    max="60"
                    className="w-full px-4 py-3 rounded-xl border border-brown-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-brown-50/50"
                  />
                </div>

                <div>
                  <label className="block text-brown-700 font-medium mb-2">
                    <Globe size={16} className="inline mr-2" />
                    Status
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_published: true }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        formData.is_published
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-brown-100 text-brown-700 hover:bg-brown-200'
                      }`}
                    >
                      <Eye size={16} />
                      Published
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, is_published: false }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        !formData.is_published
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-brown-100 text-brown-700 hover:bg-brown-200'
                      }`}
                    >
                      <EyeOff size={16} />
                      Draft
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-brown-700 font-medium mb-2">
                  <ImageIcon size={16} className="inline mr-2" />
                  Cover Image
                </label>
                
                {formData.cover_image ? (
                  <div className="space-y-3">
                    <div className="relative h-48 rounded-xl overflow-hidden border border-brown-200">
                      <img
                        src={formData.cover_image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors"
                      >
                        <X size={18} className="text-brown-700" />
                      </button>
                    </div>
                    <div className="text-center">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-brown-100 text-brown-700 rounded-lg hover:bg-brown-200 transition-colors cursor-pointer">
                        <Upload size={16} />
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="block">
                    <div className="border-2 border-dashed border-brown-300 rounded-xl p-8 text-center hover:border-gold-400 transition-colors cursor-pointer bg-gradient-to-b from-brown-50/50 to-transparent">
                      <div className="w-16 h-16 bg-gold-100 text-gold-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ImageIcon size={24} />
                      </div>
                      <p className="text-brown-700 font-medium mb-1">
                        Click to upload cover image
                      </p>
                      <p className="text-brown-500 text-sm">
                        Recommended: 1200x630px, max 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  </label>
                )}

                {uploading && (
                  <div className="flex items-center gap-2 mt-2 text-brown-600">
                    <Loader2 size={16} className="animate-spin" />
                    Uploading image...
                  </div>
                )}

                {uploadError && (
                  <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-brown-700 font-medium mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag"
                    className="flex-1 px-4 py-2 rounded-lg border border-brown-200 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-brown-600 text-white rounded-lg hover:bg-brown-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-brown-100 text-brown-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content - Rich Text Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-brown-700 font-medium">
                Content *
              </label>
              <div className="flex items-center gap-2 text-sm text-brown-500">
                <Type size={14} />
                <span>Rich Text Editor</span>
              </div>
            </div>
            
            <div className="border border-brown-200 rounded-xl overflow-hidden">
              {typeof window !== 'undefined' && (
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your article content here..."
                  className="min-h-[300px] bg-white"
                />
              )}
            </div>
            
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-brown-500">
              <div className="flex items-center gap-1">
                <Bold size={14} />
                <span>Bold</span>
              </div>
              <div className="flex items-center gap-1">
                <Italic size={14} />
                <span>Italic</span>
              </div>
              <div className="flex items-center gap-1">
                <Underline size={14} />
                <span>Underline</span>
              </div>
              <div className="flex items-center gap-1">
                <List size={14} />
                <span>Lists</span>
              </div>
              <div className="flex items-center gap-1">
                <Link size={14} />
                <span>Links & Images</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-brown-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 border border-brown-300 text-brown-700 font-medium rounded-lg hover:bg-brown-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-gold-500 text-white font-medium rounded-lg hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {isEditing ? 'Updating...' : 'Publishing...'}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {isEditing ? 'Update Article' : 'Publish Article'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* News List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-brown-900">All Articles</h2>
          <div className="text-sm text-brown-600">
            {news.length} article{news.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {news.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-brown-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-brown-100 text-brown-600 rounded-full mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-brown-900 mb-2">No articles yet</h3>
            <p className="text-brown-600">Create your first news article to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-brown-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-brown-200 to-brown-300">
                      {item.cover_image ? (
                        <img
                          src={item.cover_image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon size={20} className="text-brown-600" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.is_published !== false 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {item.is_published !== false ? 'Published' : 'Draft'}
                            </span>
                            <span className="px-2 py-1 bg-brown-100 text-brown-700 rounded text-xs">
                              {item.category}
                            </span>
                          </div>
                          <h3 className="font-bold text-brown-900 truncate">{item.title}</h3>
                          <div className="text-sm text-brown-600 line-clamp-2 mt-1 prose prose-sm max-w-none">
                            <div dangerouslySetInnerHTML={{ 
                              __html: item.excerpt || item.content.substring(0, 150) + '...' 
                            }} />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-brown-500 mt-3">
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{item.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(item.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{item.read_time || '5'} min read</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-brown-50 text-brown-600 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="px-2 py-1 bg-brown-50 text-brown-600 rounded text-xs">
                              +{item.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}