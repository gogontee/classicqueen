'use client'

import { useState, useEffect } from 'react'
import { Crown, ShoppingBag, Clock, Mail, Sparkles, Star, Gift, Heart, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { supabase } from '../../lib/supabase'

export default function QueensMallPage() {
  const [days, setDays] = useState(0)
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [contact, setContact] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  // Set launch date (example: 30 days from now)
  useEffect(() => {
    const launchDate = new Date()
    launchDate.setDate(launchDate.getDate() + 30)

    const updateCountdown = () => {
      const now = new Date()
      const difference = launchDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setDays(days)
        setHours(hours)
        setMinutes(minutes)
        setSeconds(seconds)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  const isEmail = (text) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(text)
  }

  const isWhatsAppNumber = (text) => {
    // WhatsApp number validation - allows numbers with optional +, spaces, dashes, parentheses
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,}$/
    const digits = text.replace(/\D/g, '')
    return phoneRegex.test(text) && digits.length >= 10 && digits.length <= 15
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!contact) return

    try {
      setLoading(true)
      
      const contactValue = contact.trim()
      const isEmailContact = isEmail(contactValue)
      const isPhoneContact = isWhatsAppNumber(contactValue)

      if (!isEmailContact && !isPhoneContact) {
        throw new Error('Please enter a valid email address or WhatsApp number (with country code)')
      }

      // Prepare data for Supabase
      const waitlistData = {
        source: 'Queens Mall',
        created_at: new Date().toISOString()
      }

      // Set either email or whatsapp based on input type
      if (isEmailContact) {
        waitlistData.email = contactValue
      } else {
        waitlistData.whatsapp = contactValue
      }

      // Insert into Supabase waitlist table
      const { error } = await supabase
        .from('waitlist')
        .insert([waitlistData])

      if (error) {
        if (error.code === '23505') { // Unique violation - contact already exists
          throw new Error('This contact is already on our waitlist!')
        }
        throw error
      }

      console.log('Successfully subscribed:', contactValue)
      setSubscribed(true)
      setContact('')
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubscribed(false), 5000)
    } catch (error) {
      console.error('Error subscribing:', error)
      alert(error.message || 'Error subscribing. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const featuredProducts = [
    { id: 1, name: 'Royal Tiara Collection', icon: Crown, color: 'from-gold-500 to-gold-600' },
    { id: 2, name: 'Elegant Evening Gowns', icon: Sparkles, color: 'from-gold-500 to-gold-600' },
    { id: 3, name: 'Beauty & Skincare', icon: Star, color: 'from-gold-500 to-gold-600' },
    { id: 4, name: 'Exclusive Gift Sets', icon: Gift, color: 'from-gold-500 to-gold-600' },
    { id: 5, name: 'Luxury Handbags', icon: ShoppingBag, color: 'from-gold-500 to-gold-600' },
    { id: 6, name: 'Premium Jewelry', icon: Sparkles, color: 'from-gold-500 to-gold-600' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-brown-50 via-amber-50 to-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold-600 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.3 + 0.1
            }}
            animate={{
              y: [null, -80],
              opacity: [0.2, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12 md:mb-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gold-500 to-brown-600 rounded-full mb-6 md:mb-8 shadow-xl">
              <Crown className="h-10 w-10 md:h-12 md:w-12 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-brown-800 via-gold-600 to-amber-700 bg-clip-text text-transparent">
              Queen's Mall
            </h1>
            
            <div className="inline-flex items-center gap-2 px-5 py-2 md:px-6 md:py-3 bg-gradient-to-r from-brown-100 to-amber-100 rounded-full mb-6 md:mb-8 shadow-sm">
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-brown-700" />
              <span className="text-base md:text-lg font-medium text-brown-800">Coming Soon</span>
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-gold-600" />
            </div>

            <p className="text-base md:text-xl text-brown-700 max-w-2xl md:max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed">
              An exclusive online marketplace offering premium products, fashion, and accessories curated for the modern queen. Experience luxury shopping like never before.
            </p>
          </motion.div>

          {/* Countdown Timer - Reduced size especially on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-md rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-8 mb-12 md:mb-16 border border-brown-100"
          >
            <div className="text-center mb-6 md:mb-8">
              <div className="flex items-center justify-center gap-2 mb-3 md:mb-4">
                <Clock className="h-5 w-5 md:h-6 md:w-6 text-brown-700" />
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-brown-900">Launching In</h2>
              </div>
              <p className="text-brown-600 text-sm md:text-base mb-6 md:mb-8">Get ready for an extraordinary shopping experience</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 max-w-2xl mx-auto">
              {[
                { value: days, label: 'Days', color: 'bg-gradient-to-br from-brown-600 to-brown-800' },
                { value: hours, label: 'Hours', color: 'bg-gold-500' },
                { value: minutes, label: 'Minutes', color: 'bg-gradient-to-br from-brown-500 to-brown-700' },
                { value: seconds, label: 'Seconds', color: 'bg-gold-600' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  className="text-center"
                >
                  <div className={`${item.color} rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 shadow-md hover:shadow-lg transition-shadow duration-300`}>
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 md:mb-2 tracking-tight">
                      {item.value.toString().padStart(2, '0')}
                    </div>
                    <div className="text-white/90 font-medium text-xs md:text-sm">{item.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Featured Collections - 2 columns on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12 md:mb-16"
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-brown-900 mb-8 md:mb-12">
              Featured <span className="text-gold-600">Collections</span>
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 lg:gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  whileHover={{ scale: 1.03 }}
                  className="group"
                >
                  <div className="bg-gradient-to-br from-white to-brown-50 rounded-xl md:rounded-2xl p-3 md:p-4 lg:p-5 shadow-sm hover:shadow-md border border-brown-200 hover:border-gold-300 transition-all duration-300 h-full flex flex-col items-center text-center">
                    <div className={`w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-gradient-to-br ${product.color} rounded-full flex items-center justify-center mb-3 md:mb-4 lg:mb-6 group-hover:scale-105 transition-transform duration-300`}>
                      <product.icon className="h-5 w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
                    </div>
                    <h3 className="text-sm md:text-base lg:text-lg font-semibold text-brown-900 mb-2 md:mb-3 line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-brown-600 text-xs md:text-sm flex-1 line-clamp-3 leading-relaxed">
                      Premium quality products crafted with royal elegance
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-brown-800 rounded-2xl md:rounded-3xl shadow-xl p-6 md:p-8 lg:p-10 overflow-hidden relative"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 md:w-2 md:h-2 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-6 md:mb-8">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
                <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Phone className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
                Be the First to Know
              </h2>

              <p className="text-white md:text-lg mb-6 md:mb-8 max-w-xl mx-auto leading-relaxed">
                Join our exclusive waiting list for special early access, VIP discounts, and priority updates.
              </p>

              <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter your email or WhatsApp number"
                    disabled={loading}
                    className="flex-1 px-4 py-3 md:px-6 md:py-4 rounded-lg md:rounded-xl bg-white border border-white/30 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent text-sm md:text-base disabled:opacity-70"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3 md:px-8 md:py-4 bg-gradient-to-r from-gold-500 to-amber-600 text-white font-semibold rounded-lg md:rounded-xl hover:from-gold-600 hover:to-amber-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm md:text-base">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 md:h-5 md:w-5" />
                        <span className="text-sm md:text-base">Notify Me</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-3 text-xs md:text-sm text-white/80">
                <p>✓ Enter email (example@domain.com)</p>
                <p>✓ Enter WhatsApp (e.g., +2348012345678)</p>
              </div>

              {subscribed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 md:mt-6 inline-flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full shadow-md"
                >
                  <Sparkles className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs text-brown-800 md:text-sm font-medium">Thank you! You're on the list.</span>
                </motion.div>
              )}

              <p className="text-white text-xs md:text-sm mt-4 md:mt-6">
                We respect your privacy. No spam, ever.
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12 md:mt-16 pt-6 md:pt-8 border-t border-brown-200"
          >
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6">
              {[Crown, ShoppingBag, Sparkles, Star, Gift].map((Icon, index) => (
                <motion.div
                  key={index}
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                  className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-brown-100 to-amber-100 rounded-full flex items-center justify-center shadow-sm"
                >
                  <Icon className="h-4 w-4 md:h-5 md:w-5 text-brown-700" />
                </motion.div>
              ))}
            </div>

            <p className="text-brown-700 mb-3 md:mb-4 text-sm md:text-base">
              <span className="font-bold text-brown-800">Queen's Mall</span> • An Exclusive Shopping Experience
            </p>
            <p className="text-brown-500 text-xs md:text-sm">
              © {new Date().getFullYear()} Classic Queen International. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}