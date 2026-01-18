'use client'

import { useState } from 'react'
import { 
  Mail, Phone, MessageCircle,
  Instagram, Facebook, Send, CheckCircle,
  User, Award, X, Loader2,
  FileText, Globe, Users, Heart
} from 'lucide-react'
import { motion } from "motion/react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [activeTab, setActiveTab] = useState('form')

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry', icon: MessageCircle },
    { value: 'participation', label: 'Contestant Application', icon: Users },
    { value: 'sponsorship', label: 'Sponsorship', icon: Award },
    { value: 'media', label: 'Media & Press', icon: FileText },
    { value: 'volunteer', label: 'Volunteer', icon: Heart },
    { value: 'partnership', label: 'Partnership', icon: Globe },
  ]

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email Address',
      details: ['classicqueeninternational1@gmail.com'],
      description: 'For all inquiries and information',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Phone,
      title: 'Phone Number',
      details: ['+234 815 666 0109'],
      description: 'Call or WhatsApp available',
      color: 'from-emerald-500 to-teal-500'
    }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    setTimeout(() => {
      console.log('Form submitted:', formData)
      setIsSubmitting(false)
      setIsSubmitted(true)
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      })
      setSelectedFile(null)
      
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    }, 1500)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="min-h-screen bg-brown-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brown-900 via-brown-800 to-brown-950">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brown-600/10 rounded-full translate-y-48 -translate-x-48 blur-3xl"></div>
        
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-white">
              Connect With <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-300">Us</span>
            </h1>
            <p className="text-lg md:text-xl text-white mb-10 max-w-2xl mx-auto leading-relaxed">
              Reach out to us for inquiries about participation, partnerships, 
              or any questions. We're here to support your journey.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white">
              <div className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Mail size={18} className="text-gold-300" />
                <span className="text-sm md:text-base">classicqueeninternational1@gmail.com</span>
              </div>
              <div className="hidden sm:block text-white/30">|</div>
              <div className="flex items-center gap-2 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Phone size={18} className="text-gold-300" />
                <span className="text-sm md:text-base">+234 815 666 0109</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Contact Info & Social */}
          <div className="lg:col-span-1 space-y-8">
            {/* Contact Info Cards */}
            <motion.div 
              {...fadeInUp}
              className="bg-white rounded-2xl shadow-lg p-6 border border-brown-100"
            >
              <h2 className="text-2xl font-bold text-brown-900 mb-6 pb-3 border-b border-brown-100">
                Quick <span className="text-gold-600">Contact</span>
              </h2>
              
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon
                  return (
                    <motion.div 
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-start p-4 rounded-xl bg-gradient-to-r from-white to-brown-50 border border-brown-100 hover:border-gold-300 transition-all overflow-hidden"
                    >
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl ${info.color} flex items-center justify-center shadow-md`}>
                        <Icon size={24} className="text-white" />
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <h3 className="font-semibold text-brown-800 text-lg mb-1 truncate">{info.title}</h3>
                        <div className="space-y-1 mb-2">
                          {info.details.map((detail, idx) => (
                            <p key={idx} className="text-brown-700 font-medium break-words">{detail}</p>
                          ))}
                        </div>
                        <p className="text-sm text-brown-500 break-words">{info.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Social Media - Fixed Colors */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 border border-brown-100"
            >
              <h3 className="text-xl font-bold text-brown-900 mb-6">Connect With Us</h3>
              <div className="space-y-4">
                {/* Instagram - Pink */}
                <motion.a
                  href="https://instagram.com/classicqueeninternational"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center p-4 rounded-xl bg-brown-600 text-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <span className="ml-4 font-medium truncate">Instagram</span>
                  <Send size={16} className="ml-auto rotate-45 opacity-80 flex-shrink-0" />
                </motion.a>

                {/* Facebook - Blue */}
                <motion.a
                  href="https://facebook.com/profile.php?id=100063561464595"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center p-4 rounded-xl bg-brown-600 text-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Facebook className="h-5 w-5" />
                  </div>
                  <span className="ml-4 font-medium truncate">Facebook</span>
                  <Send size={16} className="ml-auto rotate-45 opacity-80 flex-shrink-0" />
                </motion.a>

                {/* TikTok - Black */}
                <motion.a
                  href="https://tiktok.com/@classicqueenintl"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center p-4 rounded-xl bg-brown-600 text-white shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-lg text-white">TK</span>
                  </div>
                  <span className="ml-4 font-medium truncate">TikTok</span>
                  <Send size={16} className="ml-auto rotate-45 opacity-80 flex-shrink-0" />
                </motion.a>
              </div>
            </motion.div>

            {/* Inquiry Types */}
            <motion.div 
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-brown-50 to-gold-50 rounded-2xl shadow-lg p-6 border border-gold-100 overflow-hidden"
            >
              <h3 className="text-xl font-bold text-brown-900 mb-4">Inquiry Types</h3>
              <div className="grid grid-cols-2 gap-3">
                {inquiryTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <motion.button
                      key={type.value}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, inquiryType: type.value }))
                        setActiveTab('form')
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-3 rounded-xl text-sm font-medium text-center transition-all overflow-hidden ${
                        formData.inquiryType === type.value
                          ? 'bg-gold-500 text-white shadow-md'
                          : 'bg-white text-brown-700 border border-brown-200 hover:border-gold-300 hover:bg-gold-50'
                      }`}
                    >
                      <Icon size={16} className="mx-auto mb-1" />
                      <span className="block truncate">{type.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Main Form Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-brown-100">
              {/* Form Tabs */}
              <div className="flex border-b border-brown-100">
                <button
                  onClick={() => setActiveTab('form')}
                  className={`flex-1 py-4 text-sm md:text-base font-medium transition-all ${
                    activeTab === 'form'
                      ? 'text-gold-600 border-b-2 border-gold-500 bg-gradient-to-b from-gold-200 to-transparent'
                      : 'text-brown-500 hover:text-brown-700 hover:bg-brown-50'
                  }`}
                >
                  <Send size={18} className="inline mr-2 align-middle" />
                  Send Message
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 md:p-8">
                {isSubmitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full mb-8 shadow-lg">
                      <CheckCircle size={48} />
                    </div>
                    <h3 className="text-2xl font-bold text-brown-900 mb-4">Message Sent Successfully!</h3>
                    <p className="text-brown-600 mb-8 max-w-md mx-auto">
                      Thank you for reaching out to Classic Queen International. 
                      Our team will get back to you within 24-48 hours.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsSubmitted(false)}
                      className="px-8 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      Send Another Message
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="mb-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-2">
                        Send Your <span className="text-gold-600">Inquiry</span>
                      </h2>
                      <p className="text-brown-600">
                        Fill out the form below and we'll respond promptly.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div 
                          whileFocus={{ scale: 1.01 }}
                          className="space-y-2"
                        >
                          <label className="block text-brown-700 font-medium text-sm">
                            <User size={16} className="inline mr-2" />
                            Full Name *
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border ${
                              errors.name ? 'border-red-400' : 'border-brown-200'
                            } focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent bg-brown-50/50 transition-all`}
                            placeholder="Enter your full name"
                          />
                          {errors.name && (
                            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                          )}
                        </motion.div>

                        <motion.div 
                          whileFocus={{ scale: 1.01 }}
                          className="space-y-2"
                        >
                          <label className="block text-brown-700 font-medium text-sm">
                            <Mail size={16} className="inline mr-2" />
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-xl border ${
                              errors.email ? 'border-red-400' : 'border-brown-200'
                            } focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent bg-brown-50/50 transition-all`}
                            placeholder="Enter your email address"
                          />
                          {errors.email && (
                            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                          )}
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div 
                          whileFocus={{ scale: 1.01 }}
                          className="space-y-2"
                        >
                          <label className="block text-brown-700 font-medium text-sm">
                            <Phone size={16} className="inline mr-2" />
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-brown-200 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent bg-brown-50/50 transition-all"
                            placeholder="Enter your phone number"
                          />
                        </motion.div>

                        <motion.div 
                          whileFocus={{ scale: 1.01 }}
                          className="space-y-2"
                        >
                          <label className="block text-brown-700 font-medium text-sm">
                            <Award size={16} className="inline mr-2" />
                            Subject
                          </label>
                          <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl border border-brown-200 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent bg-brown-50/50 transition-all"
                            placeholder="Subject of your inquiry"
                          />
                        </motion.div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-brown-700 font-medium text-sm">
                          Inquiry Type
                        </label>
                        <select
                          name="inquiryType"
                          value={formData.inquiryType}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-brown-200 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent bg-white transition-all appearance-none"
                        >
                          {inquiryTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-brown-700 font-medium text-sm">
                          Message *
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows="5"
                          className={`w-full px-4 py-3 rounded-xl border ${
                            errors.message ? 'border-red-400' : 'border-brown-200'
                          } focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent bg-brown-50/50 transition-all resize-none`}
                          placeholder="Please provide details about your inquiry..."
                        />
                        {errors.message && (
                          <p className="text-sm text-red-500 mt-1">{errors.message}</p>
                        )}
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2">
                        <label className="block text-brown-700 font-medium text-sm">
                          Attachment (Optional)
                        </label>
                        <div className="border-2 border-dashed border-brown-300 rounded-xl p-6 text-center hover:border-gold-400 transition-all bg-gradient-to-b from-brown-50/50 to-transparent">
                          {selectedFile ? (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center justify-between bg-white rounded-lg p-4 shadow-sm overflow-hidden"
                            >
                              <div className="flex items-center min-w-0">
                                <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                  <Award size={24} className="text-gold-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-brown-800 truncate">{selectedFile.name}</p>
                                  <p className="text-sm text-brown-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                type="button"
                                onClick={removeFile}
                                className="text-brown-500 hover:text-red-600 p-2 flex-shrink-0"
                              >
                                <X size={20} />
                              </motion.button>
                            </motion.div>
                          ) : (
                            <>
                              <input
                                type="file"
                                id="file-upload"
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              />
                              <motion.label
                                htmlFor="file-upload"
                                whileHover={{ scale: 1.02 }}
                                className="cursor-pointer flex flex-col items-center"
                              >
                                <div className="w-16 h-16 bg-gradient-to-br from-gold-100 to-gold-200 text-gold-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                  <Award size={28} />
                                </div>
                                <p className="text-brown-700 font-medium mb-1">
                                  Click to upload a file
                                </p>
                                <p className="text-brown-500 text-sm">
                                  PDF, DOC, JPG, PNG up to 5MB
                                </p>
                              </motion.label>
                            </>
                          )}
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-brown-600 to-brown-700 hover:from-brown-700 hover:to-brown-800 text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <Loader2 size={20} className="animate-spin mr-3" />
                            <span>Sending Message...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <Send size={20} className="mr-3" />
                            <span>Send Message</span>
                          </div>
                        )}
                      </motion.button>

                      <p className="text-center text-brown-500 text-xs md:text-sm mt-6">
                        By submitting this form, you agree to our Privacy Policy and 
                        consent to being contacted by Classic Queen International.
                      </p>
                    </form>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}