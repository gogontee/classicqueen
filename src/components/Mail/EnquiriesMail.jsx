'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Mail, Search, Filter, Trash2, Archive, Tag, Clock,
  User, Phone, FileText, Eye, EyeOff, Star, StarOff,
  ChevronLeft, ChevronRight, Download, Reply, Forward,
  MoreVertical, RefreshCw, AlertCircle, CheckCircle,
  Calendar, MessageSquare, ExternalLink, X,
  ChevronDown, ChevronUp, Paperclip, Loader2,
  Image as ImageIcon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../../lib/supabase'
import Image from 'next/image'

export default function EnquiriesMail() {
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('all') // all, unread, read, archived, deleted
  const [selectedItems, setSelectedItems] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  const filters = [
    { id: 'all', label: 'All Messages', icon: Mail, count: 0, color: 'text-blue-600' },
    { id: 'unread', label: 'Unread', icon: EyeOff, count: 0, color: 'text-red-600' },
    { id: 'read', label: 'Read', icon: Eye, count: 0, color: 'text-green-600' },
    { id: 'archived', label: 'Archived', icon: Archive, count: 0, color: 'text-yellow-600' },
    { id: 'deleted', label: 'Deleted', icon: Trash2, count: 0, color: 'text-gray-600' },
  ]

  const inquiryTypes = [
    { value: 'general', label: 'General', color: 'bg-blue-100 text-blue-800' },
    { value: 'participation', label: 'Contestant', color: 'bg-purple-100 text-purple-800' },
    { value: 'sponsorship', label: 'Sponsorship', color: 'bg-green-100 text-green-800' },
    { value: 'media', label: 'Media', color: 'bg-pink-100 text-pink-800' },
    { value: 'volunteer', label: 'Volunteer', color: 'bg-orange-100 text-orange-800' },
    { value: 'partnership', label: 'Partnership', color: 'bg-indigo-100 text-indigo-800' },
  ]

  // Check if string value is truthy (for text boolean fields)
  const isTruthy = (value) => {
    if (value === null || value === undefined) return false
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1'
    }
    return Boolean(value)
  }

  // Fetch enquiries
  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEnquiries(data || [])
    } catch (err) {
      console.error('Error fetching enquiries:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEnquiries()
    // Refresh every 30 seconds for new messages
    const interval = setInterval(fetchEnquiries, 30000)
    return () => clearInterval(interval)
  }, [fetchEnquiries])

  // Update filter counts
  useEffect(() => {
    const counts = {
      all: enquiries.length,
      unread: enquiries.filter(e => !isTruthy(e.read)).length,
      read: enquiries.filter(e => isTruthy(e.read)).length,
      archived: enquiries.filter(e => isTruthy(e.archived)).length,
      deleted: enquiries.filter(e => isTruthy(e.deleted)).length,
    }
    
    filters.forEach(f => f.count = counts[f.id] || 0)
  }, [enquiries])

  // Filter and search enquiries
  const filteredEnquiries = enquiries.filter(enquiry => {
    // Apply filter
    if (filter === 'unread' && isTruthy(enquiry.read)) return false
    if (filter === 'read' && !isTruthy(enquiry.read)) return false
    if (filter === 'archived' && !isTruthy(enquiry.archived)) return false
    if (filter === 'deleted' && !isTruthy(enquiry.deleted)) return false

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        enquiry.name?.toLowerCase().includes(term) ||
        enquiry.email?.toLowerCase().includes(term) ||
        enquiry.subject?.toLowerCase().includes(term) ||
        enquiry.message?.toLowerCase().includes(term) ||
        enquiry.inquiry_type?.toLowerCase().includes(term)
      )
    }

    return true
  })

  // Pagination
  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEnquiries = filteredEnquiries.slice(startIndex, startIndex + itemsPerPage)

  // Mark as read
  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ read: 'true', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setEnquiries(prev => prev.map(e => 
        e.id === id ? { ...e, read: 'true' } : e
      ))
      
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(prev => ({ ...prev, read: 'true' }))
      }
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  // Toggle starred
  const toggleStarred = async (id) => {
    try {
      const enquiry = enquiries.find(e => e.id === id)
      const newStarred = isTruthy(enquiry?.starred) ? 'false' : 'true'

      const { error } = await supabase
        .from('enquiries')
        .update({ starred: newStarred, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setEnquiries(prev => prev.map(e => 
        e.id === id ? { ...e, starred: newStarred } : e
      ))
    } catch (err) {
      console.error('Error toggling star:', err)
    }
  }

  // Archive enquiry
  const archiveEnquiry = async (id) => {
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ archived: 'true', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setEnquiries(prev => prev.map(e => 
        e.id === id ? { ...e, archived: 'true' } : e
      ))
    } catch (err) {
      console.error('Error archiving:', err)
    }
  }

  // Delete enquiry
  const deleteEnquiry = async (id) => {
    if (!confirm('Move to deleted?')) return
    
    try {
      const { error } = await supabase
        .from('enquiries')
        .update({ deleted: 'true', updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setEnquiries(prev => prev.map(e => 
        e.id === id ? { ...e, deleted: 'true' } : e
      ))
      
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null)
      }
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  // Bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedItems.length === 0) return

    try {
      const updates = selectedItems.map(id => ({ 
        id, 
        [bulkAction]: 'true',
        updated_at: new Date().toISOString()
      }))
      
      const { error } = await supabase
        .from('enquiries')
        .upsert(updates)

      if (error) throw error

      setEnquiries(prev => prev.map(e => 
        selectedItems.includes(e.id) ? { ...e, [bulkAction]: 'true' } : e
      ))
      
      setSelectedItems([])
      setBulkAction('')
    } catch (err) {
      console.error('Error performing bulk action:', err)
    }
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      responded: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed: { color: 'bg-gray-100 text-gray-800', icon: Archive },
    }
    
    const config = statusConfig[status] || statusConfig.new
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon size={12} />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  // Check if attachment is an image
  const isImageAttachment = (url) => {
    if (!url) return false
    const extension = url.split('.').pop().toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension)
  }

  // Get file extension
  const getFileExtension = (url) => {
    if (!url) return ''
    return url.split('.').pop().toLowerCase()
  }

  // Get file icon based on extension
  const getFileIcon = (url) => {
    const extension = getFileExtension(url)
    const iconClasses = {
      pdf: 'text-red-600',
      doc: 'text-blue-600',
      docx: 'text-blue-600',
      xls: 'text-green-600',
      xlsx: 'text-green-600',
      ppt: 'text-orange-600',
      pptx: 'text-orange-600',
      txt: 'text-gray-600',
      zip: 'text-purple-600',
      rar: 'text-purple-600',
      default: 'text-gray-600'
    }
    
    return iconClasses[extension] || iconClasses.default
  }

  // Open image modal
  const openImageModal = (url) => {
    setSelectedImage(url)
    setImageModalOpen(true)
  }

  if (loading && !enquiries.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Image Modal */}
      <AnimatePresence>
        {imageModalOpen && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setImageModalOpen(false)}
                className="absolute -top-10 right-0 text-white hover:text-gray-300"
              >
                <X size={24} />
              </button>
              <div className="bg-white rounded-lg overflow-hidden">
                <Image
                  src={selectedImage}
                  alt="Attachment"
                  width={800}
                  height={600}
                  className="max-w-full max-h-[70vh] object-contain"
                />
                <div className="p-4 bg-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">
                    {selectedImage.split('/').pop()}
                  </span>
                  <a
                    href={selectedImage}
                    download
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={16} />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-3 md:px-6">
          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Enquiries Mail</h1>
                  <p className="text-sm text-gray-600">{enquiries.length} messages</p>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchEnquiries}
                className="p-2 rounded-lg hover:bg-gray-100"
                title="Refresh"
              >
                <RefreshCw size={20} className="text-gray-600" />
              </button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-800 font-medium">
                  {selectedItems.length} selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Bulk Actions</option>
                  <option value="read">Mark as Read</option>
                  <option value="archived">Archive</option>
                  <option value="deleted">Delete</option>
                </select>
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Apply
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarCollapsed ? 0 : 280 }}
          className={`hidden lg:block ${sidebarCollapsed ? 'overflow-hidden' : ''}`}
        >
          <div className="h-[calc(100vh-73px)] overflow-y-auto border-r border-gray-200 bg-white">
            {/* Compose Button */}
            <div className="p-4 border-b border-gray-200">
              <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md">
                <Mail className="inline mr-2" size={18} />
                New Message
              </button>
            </div>

            {/* Filters */}
            <nav className="p-4 space-y-1">
              {filters.map((filterItem) => {
                const Icon = filterItem.icon
                return (
                  <button
                    key={filterItem.id}
                    onClick={() => setFilter(filterItem.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      filter === filterItem.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`mr-3 ${filterItem.color}`} size={18} />
                      {filterItem.label}
                    </div>
                    {filterItem.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        filter === filterItem.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {filterItem.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Inquiry Types */}
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Inquiry Types</h3>
              <div className="space-y-1">
                {inquiryTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSearchTerm(type.label)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
                  >
                    <span className={type.color}>
                      {type.label}
                    </span>
                    <span className="text-gray-500">
                      {enquiries.filter(e => e.inquiry_type === type.value).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Statistics</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unread Rate</span>
                  <span className="font-medium">
                    {enquiries.length > 0 
                      ? `${Math.round((enquiries.filter(e => !isTruthy(e.read)).length / enquiries.length) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Response Rate</span>
                  <span className="font-medium">
                    {enquiries.length > 0 
                      ? `${Math.round((enquiries.filter(e => e.status === 'responded').length / enquiries.length) * 100)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg. Response Time</span>
                  <span className="font-medium">24h</span>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1">
          <div className="h-[calc(100vh-73px)] flex">
            {/* Message List */}
            <div className={`${selectedEnquiry ? 'hidden md:block md:w-96' : 'flex-1'} border-r border-gray-200 bg-white overflow-hidden`}>
              {/* List Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedEnquiries.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(paginatedEnquiries.map(e => e.id))
                      } else {
                        setSelectedItems([])
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">
                    {filteredEnquiries.length} of {enquiries.length} messages
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Number(e.target.value))}
                    className="text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <option key={page} value={page}>Page {page}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {/* Messages List */}
              <div className="overflow-y-auto h-[calc(100%-65px)]">
                <AnimatePresence>
                  {paginatedEnquiries.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                      <p className="text-gray-600">
                        {searchTerm ? 'Try a different search term' : 'No enquiries yet'}
                      </p>
                    </div>
                  ) : (
                    paginatedEnquiries.map((enquiry) => (
                      <motion.div
                        key={enquiry.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all ${
                          selectedEnquiry?.id === enquiry.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        } ${!isTruthy(enquiry.read) ? 'bg-blue-50/50' : ''}`}
                        onClick={() => {
                          setSelectedEnquiry(enquiry)
                          if (!isTruthy(enquiry.read)) markAsRead(enquiry.id)
                        }}
                      >
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(enquiry.id)}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedItems(prev => [...prev, enquiry.id])
                                  } else {
                                    setSelectedItems(prev => prev.filter(id => id !== enquiry.id))
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                              />
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleStarred(enquiry.id)
                                }}
                                className="flex-shrink-0"
                              >
                                {isTruthy(enquiry.starred) ? (
                                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                ) : (
                                  <StarOff className="h-5 w-5 text-gray-400" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`font-medium truncate ${!isTruthy(enquiry.read) ? 'text-gray-900' : 'text-gray-700'}`}>
                                    {enquiry.name}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                    {enquiry.inquiry_type}
                                  </span>
                                  {enquiry.attachment_url && (
                                    <Paperclip className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  )}
                                </div>
                                <p className={`text-sm truncate ${!isTruthy(enquiry.read) ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                  {enquiry.subject || 'No subject'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatDate(enquiry.created_at)}
                              </span>
                              {!isTruthy(enquiry.read) && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 line-clamp-2 ml-10">
                            {enquiry.message}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Message Detail */}
            {selectedEnquiry && (
              <div className="flex-1 bg-white overflow-hidden">
                {/* Message Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedEnquiry(null)}
                      className="p-2 rounded-lg hover:bg-gray-200 md:hidden"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(selectedEnquiry.status)}
                      {!isTruthy(selectedEnquiry.read) && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Unread
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => archiveEnquiry(selectedEnquiry.id)}
                      className="p-2 rounded-lg hover:bg-gray-200"
                      title="Archive"
                    >
                      <Archive size={18} />
                    </button>
                    <button
                      onClick={() => deleteEnquiry(selectedEnquiry.id)}
                      className="p-2 rounded-lg hover:bg-gray-200"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-200">
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </div>

                {/* Message Content */}
                <div className="overflow-y-auto h-[calc(100%-65px)] p-6">
                  <div className="max-w-3xl mx-auto">
                    {/* Sender Info */}
                    <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-gray-900">{selectedEnquiry.name}</h2>
                            <p className="text-gray-600">{selectedEnquiry.email}</p>
                            {selectedEnquiry.phone && (
                              <div className="flex items-center mt-1 text-gray-600">
                                <Phone className="h-4 w-4 mr-2" />
                                {selectedEnquiry.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 mb-2">
                            {new Date(selectedEnquiry.created_at).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(selectedEnquiry.created_at).toLocaleTimeString('en-US')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          inquiryTypes.find(t => t.value === selectedEnquiry.inquiry_type)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedEnquiry.inquiry_type?.charAt(0).toUpperCase() + selectedEnquiry.inquiry_type?.slice(1)}
                        </span>
                        {selectedEnquiry.subject && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                            Subject: {selectedEnquiry.subject}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="prose prose-lg max-w-none mb-8">
                      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                          {selectedEnquiry.message}
                        </p>
                      </div>
                    </div>

                    {/* Attachments */}
                    {selectedEnquiry.attachment_url && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Paperclip className="h-5 w-5 mr-2" />
                          Attachments
                        </h3>
                        <div className="space-y-3">
                          {isImageAttachment(selectedEnquiry.attachment_url) ? (
                            // Image attachment - show preview
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="mb-4">
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">Image Attachment</p>
                                    <p className="text-sm text-gray-600">
                                      {selectedEnquiry.attachment_url.split('/').pop()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div 
                                  className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => openImageModal(selectedEnquiry.attachment_url)}
                                >
                                  <Image
                                    src={selectedEnquiry.attachment_url}
                                    alt="Attachment"
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  />
                                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                                    <Eye className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">
                                    Click image to view full size
                                  </span>
                                  <a
                                    href={selectedEnquiry.attachment_url}
                                    download
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                  >
                                    <Download size={16} />
                                    <span>Download</span>
                                  </a>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Non-image attachment
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center ${getFileIcon(selectedEnquiry.attachment_url)}`}>
                                    <FileText className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {selectedEnquiry.attachment_url.split('/').pop()}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {getFileExtension(selectedEnquiry.attachment_url).toUpperCase()} file
                                    </p>
                                  </div>
                                </div>
                                <a
                                  href={selectedEnquiry.attachment_url}
                                  download
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                                >
                                  <Download size={16} />
                                  <span>Download</span>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="border-t border-gray-200 pt-6">
                      <div className="flex items-center space-x-3">
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2">
                          <Reply className="h-5 w-5" />
                          <span>Reply</span>
                        </button>
                        <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 flex items-center space-x-2">
                          <Forward className="h-5 w-5" />
                          <span>Forward</span>
                        </button>
                        <button
                          onClick={() => toggleStarred(selectedEnquiry.id)}
                          className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          {isTruthy(selectedEnquiry.starred) ? (
                            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="h-5 w-5 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}