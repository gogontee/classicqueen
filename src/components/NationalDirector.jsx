'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation' // Import useRouter

const NationalDirector = () => {
  const router = useRouter() // Initialize router
  const [formData, setFormData] = useState({
    // Personal Information
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    
    // Professional Information
    nationality: '',
    country_of_interest: '',
    company_name: '',
    company_registration_number: '',
    years_experience: '',
    previous_events_organized: '',
    
    // Business Information
    website: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    
    // Additional Information
    why_interested: '',
    plan_for_country: '',
    how_heard: '',
    
    // Agreements
    agree_terms: false,
    agree_franchise_terms: false,
    confirm_experience: false
  })

  const [formErrors, setFormErrors] = useState({})
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [applicationFee] = useState(500) // Updated variable name
  const [countryCheckLoading, setCountryCheckLoading] = useState(false)
  const [countryWarning, setCountryWarning] = useState(null)
  const [showCountryWarningModal, setShowCountryWarningModal] = useState(false)
  const fileInputRef = useRef(null)

  // Show/hide company registration number based on company name
  const [showCompanyRegistration, setShowCompanyRegistration] = useState(false)

  useEffect(() => {
    setShowCompanyRegistration(!!formData.company_name.trim())
  }, [formData.company_name])

  // Debounced country check - triggers when user types country of interest
  useEffect(() => {
    if (formData.country_of_interest && formData.country_of_interest.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        checkCountryAvailability(formData.country_of_interest)
      }, 800)
      
      return () => clearTimeout(timeoutId)
    } else {
      setCountryWarning(null)
      setShowCountryWarningModal(false)
    }
  }, [formData.country_of_interest])

  const checkCountryAvailability = async (countryName) => {
    if (!countryName || countryName.trim().length < 2) {
      setCountryWarning(null)
      setShowCountryWarningModal(false)
      return
    }
    
    setCountryCheckLoading(true)
    try {
      const response = await fetch(`/api/countries/check?name=${encodeURIComponent(countryName.trim())}`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        console.error('API returned error:', data.error)
        return
      }
      
      if (data.exists) {
        setCountryWarning({
          country: data.countryName || countryName,
          message: `The country "${data.countryName || countryName}" already has a National Director.`
        })
        setShowCountryWarningModal(true)
      } else {
        setCountryWarning(null)
        setShowCountryWarningModal(false)
      }
    } catch (error) {
      console.error('Error checking country:', error)
      setCountryWarning(null)
      setShowCountryWarningModal(false)
    } finally {
      setCountryCheckLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing in a field
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB')
      return
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Only JPG, PNG, and WEBP files are allowed')
      return
    }
    
    setPhoto(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (countryWarning) {
      alert('Cannot submit: This country already has a National Director.')
      return
    }
    
    // Validate required checkboxes
    if (!formData.agree_terms || !formData.agree_franchise_terms || !formData.confirm_experience) {
      alert('Please agree to all terms and confirm your experience')
      return
    }

    // Validate required fields with strict checks
    const requiredFields = [
      'full_name', 'email', 'phone', 'whatsapp', 
      'nationality', 'country_of_interest', 'years_experience',
      'why_interested', 'plan_for_country', 'how_heard'
    ]
    
    const errors = {}
    let hasErrors = false
    
    requiredFields.forEach(field => {
      const value = formData[field]
      // Check if value is empty, null, undefined, or default select option
      if (!value || value.toString().trim() === '' || 
          (field === 'years_experience' && value === '') ||
          (field === 'how_heard' && value === '')) {
        errors[field] = 'This field is required'
        hasErrors = true
      }
    })
    
    // Validate photo
    if (!photo) {
      errors.photo = 'Profile photo is required'
      hasErrors = true
    }
    
    if (hasErrors) {
      setFormErrors(errors)
      alert('Please fill in all required fields')
      return
    }
    
    // DEBUG: Log form data before submission
    console.log('=== FORM DATA BEFORE SUBMISSION ===')
    console.log('country_of_interest:', formData.country_of_interest)
    console.log('Type:', typeof formData.country_of_interest)
    console.log('Trimmed:', formData.country_of_interest?.trim())
    console.log('Length:', formData.country_of_interest?.length)
    console.log('=== END DEBUG ===')
    
    setIsSubmitting(true)
    
    try {
      // Process dummy payment for application fee
      const paymentSuccess = await processDummyPayment()
      
      if (!paymentSuccess.success) {
        alert(`Payment failed: ${paymentSuccess.error}`)
        setIsSubmitting(false)
        return
      }
      
      // Create FormData for submission with proper null handling
      const applicationFormData = new FormData()
      
      // Append all form fields with proper null handling
      Object.keys(formData).forEach(key => {
        const value = formData[key]
        
        // Ensure no undefined or null values are sent
        if (value === undefined || value === null) {
          applicationFormData.append(key, '')
        } else if (typeof value === 'boolean') {
          applicationFormData.append(key, value.toString())
        } else if (typeof value === 'string') {
          // Trim strings to avoid whitespace-only values
          applicationFormData.append(key, value.trim())
        } else {
          applicationFormData.append(key, value || '')
        }
      })
      
      // Add payment information
      applicationFormData.append('payment_id', paymentSuccess.id)
      applicationFormData.append('payment_status', 'completed')
      applicationFormData.append('application_fee', applicationFee.toString())
      
      // Append profile photo
      if (photo) {
        applicationFormData.append('profile_photo', photo)
      }
      
      // Debug: Log FormData contents
      console.log('=== SUBMITTING FORM DATA ===')
      for (let [key, value] of applicationFormData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}, ${value.size} bytes` : value)
      }
      console.log('=== END FORM DATA LOG ===')
      
      // Submit application data with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
      
      const response = await fetch('/api/national-directors/apply', {
        method: 'POST',
        body: applicationFormData,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      const result = await response.json()
      
      console.log('Application API Response:', {
        status: response.status,
        ok: response.ok,
        data: result
      })
      
      if (response.ok) {
        alert('Application submitted successfully! Our franchise team will contact you within 48 hours.')
        
        // Reset form
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          whatsapp: '',
          nationality: '',
          country_of_interest: '',
          company_name: '',
          company_registration_number: '',
          years_experience: '',
          previous_events_organized: '',
          website: '',
          instagram: '',
          facebook: '',
          linkedin: '',
          why_interested: '',
          plan_for_country: '',
          how_heard: '',
          agree_terms: false,
          agree_franchise_terms: false,
          confirm_experience: false
        })
        setPhoto(null)
        setPhotoPreview('')
        setFormErrors({}) // Clear errors
        
      } else {
        // Enhanced error handling
        let errorMessage = 'Application failed'
        
        if (result.message) {
          errorMessage += `: ${result.message}`
        } else if (result.error) {
          errorMessage += `: ${result.error}`
        } else if (result.details) {
          errorMessage += `: ${JSON.stringify(result.details)}`
        } else if (result.errors) {
          errorMessage += `: ${JSON.stringify(result.errors)}`
        }
        
        // Check for database constraint errors
        if (errorMessage.includes('null value') || errorMessage.includes('violates not-null constraint')) {
          errorMessage += '\n\nPlease ensure all required fields are filled correctly.'
        }
        
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Application error:', error)
      
      if (error.name === 'AbortError') {
        alert('Request timeout. Please check your internet connection and try again.')
      } else {
        alert(`Application failed: ${error.message}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const processDummyPayment = async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          id: 'pay_nd_' + Date.now().toString(),
          amount: applicationFee
        })
      }, 1000)
    })
  }

  const experienceYears = ['0-2 years', '3-5 years', '6-10 years', '10+ years']

  const howHeardOptions = [
    'Website',
    'Social Media (Instagram)',
    'Social Media (Facebook)',
    'Social Media (LinkedIn)',
    'Referral',
    'Event/Exhibition',
    'Search Engine (Google, etc.)',
    'News/Media',
    'Friend/Colleague',
    'Other'
  ]

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Updated header with clearer fee information */}
      <div className="bg-gradient-to-r from-brown-900 to-brown-800 p-6 text-white">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">National Director Franchise Application</h2>
        <p className="text-brown-200 text-sm md:text-base mb-2">
          Apply to become the exclusive Classic Queen International National Director for your country. 
          Join our global network of beauty pageant professionals.
        </p>
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm">
          <div className="bg-brown-700 px-3 py-1 rounded-full inline-flex items-center">
            <span className="font-semibold">Application Fee: USD{applicationFee}</span>
          </div>
          <div className="bg-amber-600 px-3 py-1 rounded-full inline-flex items-center">
            <span className="font-semibold">Franchise Fee: USD500 (Payable after approval)</span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Personal Information */}
              <div className="bg-brown-50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-brown-900 mb-4 flex items-center">
                  <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-brown-900 text-white flex items-center justify-center mr-2 md:mr-3 text-sm">1</span>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base ${
                        formErrors.full_name ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      required
                    />
                    {formErrors.full_name && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.full_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base ${
                        formErrors.email ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base ${
                        formErrors.phone ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      required
                    />
                    {formErrors.phone && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base ${
                        formErrors.whatsapp ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      required
                    />
                    {formErrors.whatsapp && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.whatsapp}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-brown-50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-brown-900 mb-4 flex items-center">
                  <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-brown-900 text-white flex items-center justify-center mr-2 md:mr-3 text-sm">2</span>
                  Professional Information
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                        Your Nationality *
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base ${
                          formErrors.nationality ? 'border-red-300 bg-red-50' : 'border-brown-200'
                        }`}
                        required
                      />
                      {formErrors.nationality && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.nationality}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                        Country of Interest *
                        {countryCheckLoading && (
                          <span className="ml-2 text-xs text-brown-500">Checking...</span>
                        )}
                      </label>
                      <input
                        type="text"
                        name="country_of_interest"
                        value={formData.country_of_interest}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base ${
                          (formErrors?.country_of_interest || countryWarning) ? 'border-red-300 bg-red-50' : 'border-brown-200'
                        }`}
                        required
                      />
                      {formErrors.country_of_interest && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.country_of_interest}</p>
                      )}
                      {countryWarning ? (
                        <p className="text-red-600 text-xs md:text-sm mt-1">
                          ⚠️ This country already has a National Director
                        </p>
                      ) : null}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      Company/Organization Name (Recommended)
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base"
                      placeholder="Your company or organization name"
                    />
                  </div>
                  
                  {showCompanyRegistration && (
                    <div>
                      <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                        Company Registration Number
                      </label>
                      <input
                        type="text"
                        name="company_registration_number"
                        value={formData.company_registration_number}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base"
                        placeholder="If applicable"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                        Years of Experience in Event Management *
                      </label>
                      <select
                        name="years_experience"
                        value={formData.years_experience}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base ${
                          formErrors.years_experience ? 'border-red-300 bg-red-50' : 'border-brown-200'
                        }`}
                        required
                      >
                        <option value="">Select years *</option>
                        {experienceYears.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                      {formErrors.years_experience && (
                        <p className="text-red-600 text-xs mt-1">{formErrors.years_experience}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                        Previous Events Organized
                      </label>
                      <textarea
                        name="previous_events_organized"
                        value={formData.previous_events_organized}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-3 py-2 md:px-4 md:py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base"
                        placeholder="List any beauty pageants, fashion shows, or major events you've organized (Optional)"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Photo Upload */}
              <div className="bg-brown-50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-brown-900 mb-4 flex items-center">
                  <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-brown-900 text-white flex items-center justify-center mr-2 md:mr-3 text-sm">3</span>
                  Profile Photo
                </h3>
                <div>
                  <label className="block text-brown-800 font-medium mb-2 text-sm md:text-base">
                    Upload Professional Profile Photo *
                  </label>
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <div 
                        onClick={triggerFileInput}
                        className="border-2 border-dashed border-brown-300 rounded-lg p-4 md:p-6 text-center cursor-pointer hover:border-brown-500 hover:bg-brown-50 transition-all"
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <div className="text-brown-500">
                          <svg className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="font-medium text-sm md:text-base">Click to upload profile photo</p>
                          <p className="text-xs md:text-sm mt-1">JPG, PNG, or WEBP (Max 5MB)</p>
                          <p className="text-xs mt-2 text-brown-600">Professional headshot recommended</p>
                        </div>
                      </div>
                    </div>
                    
                    {photoPreview && (
                      <div className="w-24 h-24 md:w-32 md:h-32">
                        <div className="relative w-full h-full rounded-lg overflow-hidden border border-brown-200">
                          <Image
                            src={photoPreview}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <p className="text-xs text-brown-600 mt-1 text-center">Preview</p>
                      </div>
                    )}
                  </div>
                  {formErrors.photo && (
                    <p className="text-red-600 text-xs mt-2">{formErrors.photo}</p>
                  )}
                </div>
              </div>

              {/* Business Information */}
              <div className="bg-brown-50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-brown-900 mb-4 flex items-center">
                  <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-brown-900 text-white flex items-center justify-center mr-2 md:mr-3 text-sm">4</span>
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      Website
                    </label>
                    <input
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base"
                      placeholder="classicqueen.com or https://..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base"
                      placeholder="@username or link"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      Facebook Page
                    </label>
                    <input
                      type="text"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base"
                      placeholder="facebook.com/username or @username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      LinkedIn Profile
                    </label>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 md:px-4 md:py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base"
                      placeholder="linkedin.com/in/username or @username"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-brown-50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-brown-900 mb-4 flex items-center">
                  <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-brown-900 text-white flex items-center justify-center mr-2 md:mr-3 text-sm">5</span>
                  Additional Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      Why are you interested in becoming a National Director? *
                    </label>
                    <textarea
                      name="why_interested"
                      value={formData.why_interested}
                      onChange={handleInputChange}
                      rows={2}
                      className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base ${
                        formErrors.why_interested ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      required
                    ></textarea>
                    {formErrors.why_interested && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.why_interested}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      What is your plan for Classic Queen in your country? *
                    </label>
                    <textarea
                      name="plan_for_country"
                      value={formData.plan_for_country}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base ${
                        formErrors.plan_for_country ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      placeholder="Include your vision, marketing strategy, and timeline"
                      required
                    ></textarea>
                    {formErrors.plan_for_country && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.plan_for_country}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-1 md:mb-2 text-sm md:text-base">
                      How did you hear about us? *
                    </label>
                    <select
                      name="how_heard"
                      value={formData.how_heard}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 md:px-4 md:py-3 border rounded-lg focus:ring-2 focus:ring-brown-600 focus:border-brown-600 transition-all text-sm md:text-base ${
                        formErrors.how_heard ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      required
                    >
                      <option value="">Select option *</option>
                      {howHeardOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    {formErrors.how_heard && (
                      <p className="text-red-600 text-xs mt-1">{formErrors.how_heard}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Agreements */}
              <div className="bg-brown-50 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold text-brown-900 mb-4 flex items-center">
                  <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-brown-900 text-white flex items-center justify-center mr-2 md:mr-3 text-sm">6</span>
                  Agreements & Terms
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="confirm_experience"
                      name="confirm_experience"
                      checked={formData.confirm_experience}
                      onChange={handleInputChange}
                      className={`mt-1 mr-2 text-brown-600 rounded focus:ring-brown-500 w-4 h-4 ${
                        formErrors.confirm_experience ? 'border-red-300' : ''
                      }`}
                      required
                    />
                    <label htmlFor="confirm_experience" className="text-brown-700 text-sm md:text-base">
                      <span className="font-medium">I confirm that I have experience in event management and/or beauty pageant organization *</span>
                    </label>
                  </div>
                  {formErrors.confirm_experience && (
                    <p className="text-red-600 text-xs ml-6">{formErrors.confirm_experience}</p>
                  )}
                  
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agree_terms"
                      name="agree_terms"
                      checked={formData.agree_terms}
                      onChange={handleInputChange}
                      className={`mt-1 mr-2 text-brown-600 rounded focus:ring-brown-500 w-4 h-4 ${
                        formErrors.agree_terms ? 'border-red-300' : ''
                      }`}
                      required
                    />
                    <label htmlFor="agree_terms" className="text-brown-700 text-sm md:text-base">
                      <span className="font-medium">I agree to the Classic Queen International Terms and Conditions *</span>
                      <p className="text-xs md:text-sm text-brown-600 mt-1">
                        By checking this box, you agree to abide by all franchise rules and regulations.
                      </p>
                    </label>
                  </div>
                  {formErrors.agree_terms && (
                    <p className="text-red-600 text-xs ml-6">{formErrors.agree_terms}</p>
                  )}
                  
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agree_franchise_terms"
                      name="agree_franchise_terms"
                      checked={formData.agree_franchise_terms}
                      onChange={handleInputChange}
                      className={`mt-1 mr-2 text-brown-600 rounded focus:ring-brown-500 w-4 h-4 ${
                        formErrors.agree_franchise_terms ? 'border-red-300' : ''
                      }`}
                      required
                    />
                    <label htmlFor="agree_franchise_terms" className="text-brown-700 text-sm md:text-base">
                      <span className="font-medium">I agree to the Franchise Agreement terms *</span>
                      <p className="text-xs md:text-sm text-brown-600 mt-1">
                        Including minimum performance standards, royalty fees, and brand guidelines.
                      </p>
                    </label>
                  </div>
                  {formErrors.agree_franchise_terms && (
                    <p className="text-red-600 text-xs ml-6">{formErrors.agree_franchise_terms}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || countryWarning}
                  className={`w-full py-3 md:py-4 text-white font-bold text-base md:text-lg rounded-lg shadow-lg transition-all duration-300 ${
                    countryWarning 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-brown-900 to-brown-800 hover:from-brown-800 hover:to-brown-700 hover:shadow-xl'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 mr-2 md:mr-3 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing Application...
                    </span>
                  ) : countryWarning ? (
                    'Country Already Registered - Cannot Submit'
                  ) : (
                    `Submit Application - $${applicationFee} Application Fee`
                  )}
                </button>
                <p className="text-center text-brown-600 text-xs md:text-sm mt-2">
                  <span className="font-bold">Note:</span> This is a non-refundable application fee. 
                  If approved, you'll be required to pay the franchise fee of $500 to become an official National Director.
                </p>
              </div>
            </form>
          </div>

          {/* Right Column - Benefits & Information */}
          <div>
            <div className="space-y-4 md:space-y-6">
              <div className="bg-white rounded-xl p-4 md:p-6 border border-brown-200 shadow-sm">
                <h3 className="text-lg font-bold text-brown-900 mb-3 md:mb-4">
                  📋 Requirements
                </h3>
                <ul className="space-y-2 text-brown-700 text-sm md:text-base">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Event management experience</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Franchise Fee: USD500 (after approval)</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Professional profile photo required</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Strong local network & connections</span>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 md:mr-3 flex-shrink-0"></div>
                    <span>Commitment to brand standards</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-brown-900 to-brown-800 rounded-xl p-4 md:p-6 text-white">
                <h3 className="text-lg font-bold mb-3 md:mb-4">
                  🤝 Next Steps
                </h3>
                <ol className="space-y-2 md:space-y-3">
                  <li className="flex items-start">
                    <span className="bg-white text-brown-900 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 flex-shrink-0">1</span>
                    <span className="text-sm md:text-base">Submit application & pay USD500 application fee</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-white text-brown-900 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 flex-shrink-0">2</span>
                    <span className="text-sm md:text-base">Interview with franchise team (48 hours)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-white text-brown-900 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 flex-shrink-0">3</span>
                    <span className="text-sm md:text-base">If approved, pay USD500 franchise fee</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-white text-brown-900 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm font-bold mr-2 md:mr-3 flex-shrink-0">4</span>
                    <span className="text-sm md:text-base">Receive franchise agreement & training</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showCountryWarningModal && countryWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="mb-4">
              <div className="flex items-center text-red-600 mb-2">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h3 className="text-xl font-bold">Country Already Has National Director</h3>
              </div>
              <p className="text-brown-700 mb-4">
                {countryWarning.message}
              </p>
              <p className="text-brown-700 mb-6">
                Would you like to speak to our management about this?
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCountryWarningModal(false)}
                className="flex-1 py-2 px-4 border border-brown-300 text-brown-700 rounded-lg hover:bg-brown-50 transition-colors text-sm md:text-base"
              >
                No, continue
              </button>
              <button
                onClick={() => {
                  // Route to contact page instead of showing alert
                  router.push('/contact')
                  setShowCountryWarningModal(false)
                }}
                className="flex-1 py-2 px-4 bg-gradient-to-r from-brown-900 to-brown-800 text-white rounded-lg hover:from-brown-800 hover:to-brown-700 transition-all text-sm md:text-base"
              >
                Yes, contact management
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NationalDirector