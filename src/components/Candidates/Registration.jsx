'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const CandidateRegistrationForm = () => {
  const router = useRouter()
  const [showCriteria, setShowCriteria] = useState(false)
  const [showExperienceInput, setShowExperienceInput] = useState(false)
  const [countryCheckLoading, setCountryCheckLoading] = useState(false)
  const [galleryPhotos, setGalleryPhotos] = useState([])
  const [galleryPreviews, setGalleryPreviews] = useState([])
  const [countryWarning, setCountryWarning] = useState(null)
  const [showCountryWarningModal, setShowCountryWarningModal] = useState(false)
  const fileInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const [formData, setFormData] = useState({
    full_name: '',
    location: '',
    email: '',
    whatsapp: '',
    occupation: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    about: '',
    contest_experience: '',
    previous_experience_details: '',
    criteria_met: false,
    terms_accepted: false
  })

  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  // Check country availability
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

  // Debounced country check - triggers when user types country
  useEffect(() => {
    if (formData.location && formData.location.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        checkCountryAvailability(formData.location)
      }, 800)
      
      return () => clearTimeout(timeoutId)
    } else {
      setCountryWarning(null)
      setShowCountryWarningModal(false)
    }
  }, [formData.location])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Clear error for this field
    setFormErrors(prev => ({ ...prev, [name]: '' }))
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }
      
      // Show/hide experience details input
      if (name === 'contest_experience') {
        setShowExperienceInput(value === 'yes')
        if (value === 'no') {
          updated.previous_experience_details = ''
        }
      }
      
      return updated
    })
  }

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      setFormErrors(prev => ({ ...prev, photo: 'File size should be less than 5MB' }))
      return
    }
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, photo: 'Only JPG, PNG, and WEBP files are allowed' }))
      return
    }
    
    setPhoto(file)
    setFormErrors(prev => ({ ...prev, photo: '' }))
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    
    if (galleryPhotos.length + files.length > 6) {
      setFormErrors(prev => ({ 
        ...prev, 
        gallery: `Maximum 6 photos allowed. You already have ${galleryPhotos.length} photos.` 
      }))
      return
    }
    
    const validFiles = []
    const invalidFiles = []
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (too large)`)
      } else if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        invalidFiles.push(`${file.name} (invalid type)`)
      } else {
        validFiles.push(file)
      }
    })
    
    if (invalidFiles.length > 0) {
      alert(`Some files were skipped:\n${invalidFiles.join('\n')}`)
    }
    
    if (validFiles.length === 0) return
    
    const newPhotos = [...galleryPhotos, ...validFiles]
    setGalleryPhotos(newPhotos)
    setFormErrors(prev => ({ ...prev, gallery: '' }))
    
    // Create previews for new files only
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setGalleryPreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryPhoto = (index) => {
    const newPhotos = galleryPhotos.filter((_, i) => i !== index)
    const newPreviews = galleryPreviews.filter((_, i) => i !== index)
    setGalleryPhotos(newPhotos)
    setGalleryPreviews(newPreviews)
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const triggerGalleryInput = () => {
    galleryInputRef.current.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (countryWarning) {
      alert('Cannot submit: This country already has a National Director.')
      return
    }
    
    const errors = {}
    
    if (!formData.full_name.trim()) errors.full_name = 'Full name is required'
    if (!formData.location.trim()) errors.location = 'Country is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (!formData.whatsapp.trim()) errors.whatsapp = 'WhatsApp number is required'
    if (!formData.occupation.trim()) errors.occupation = 'Occupation is required'
    if (!formData.about.trim()) errors.about = 'About you is required'
    if (!formData.contest_experience) errors.contest_experience = 'Please select contest experience'
    if (formData.contest_experience === 'yes' && !formData.previous_experience_details.trim()) {
      errors.previous_experience_details = 'Please describe your previous experience'
    }
    if (!photo) errors.photo = 'Profile picture is required'
    if (galleryPhotos.length < 1) errors.gallery = 'At least one gallery photo is required'
    if (!formData.criteria_met) errors.criteria_met = 'Please confirm eligibility criteria'
    if (!formData.terms_accepted) errors.terms_accepted = 'Please accept terms and conditions'
    
    setFormErrors(errors)
    
    if (Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0]
      const element = document.querySelector(`[name="${firstError}"]`) || 
                      document.querySelector(`#${firstError}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.focus()
      }
      return
    }

    setIsSubmitting(true)
    
    try {
      // Create FormData for registration - MATCHING API EXPECTATIONS
      const registrationFormData = new FormData()
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'boolean') {
          registrationFormData.append(key, formData[key].toString())
        } else {
          registrationFormData.append(key, formData[key])
        }
      })
      
      // Append profile photo with field name 'profilePhoto' (what your API expects)
      if (photo) {
        registrationFormData.append('profilePhoto', photo) // API expects 'profilePhoto'
        console.log('Added profile photo as "profilePhoto":', photo.name)
      }
      
      // Append gallery photos - all with the SAME field name 'gallery'
      // This allows API to use formData.getAll('gallery') to get all files
      galleryPhotos.forEach((file, index) => {
        registrationFormData.append('gallery', file) // Same field name for all
        console.log(`Added gallery photo ${index} as "gallery":`, file.name)
      })
      
      // Debug: Log FormData contents
      console.log('=== DEBUG: FormData Contents ===')
      console.log('Total form entries:', Array.from(registrationFormData.entries()).length)
      
      for (let [key, value] of registrationFormData.entries()) {
        console.log(`${key}:`, value instanceof File ? `File: ${value.name}, ${value.size} bytes` : value)
      }
      
      console.log('Gallery files count in FormData:', registrationFormData.getAll('gallery').length)
      
      // Make the API call
      const response = await fetch('/api/candidates/register', {
        method: 'POST',
        body: registrationFormData,
        // Do NOT set Content-Type header - browser will set it automatically
      })
      
      const result = await response.json()
      
      console.log('Registration API Response:', {
        status: response.status,
        ok: response.ok,
        data: result
      })
      
      if (response.ok) {
        alert('Registration submitted successfully! Our team will review your application and contact you within 48 hours. If approved, you will be required to pay the registration fee of $500.')
        
        // Check upload results
        if (result.debug) {
          console.log('Upload debug info:', result.debug)
          if (!result.debug.profilePhotoUploaded) {
            console.warn('Profile photo was not uploaded successfully')
          }
          if (result.debug.galleryImagesUploaded === 0) {
            console.warn('No gallery images were uploaded')
          }
        }
        
        // Check candidate data
        if (result.candidate) {
          console.log('Candidate data from server:', {
            photo: result.candidate.photo,
            galleryCount: result.candidate.gallery ? result.candidate.gallery.length : 0
          })
        }
        
        // Reset form
        setFormData({
          full_name: '',
          location: '',
          email: '',
          whatsapp: '',
          occupation: '',
          instagram: '',
          facebook: '',
          tiktok: '',
          about: '',
          contest_experience: '',
          previous_experience_details: '',
          criteria_met: false,
          terms_accepted: false
        })
        setPhoto(null)
        setPhotoPreview('')
        setGalleryPhotos([])
        setGalleryPreviews([])
        setFormErrors({})
        setCountryWarning(null)
        setShowCountryWarningModal(false)
        
      } else {
        // Handle API error
        let errorMessage = 'Registration failed'
        if (result.message) {
          errorMessage += `: ${result.message}`
        }
        if (result.details) {
          errorMessage += `\nDetails: ${result.details}`
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert(`Registration failed: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContactManagement = () => {
    router.push('/contact')
    setShowCountryWarningModal(false)
    setCountryWarning(null)
  }

  const continueWithoutContact = () => {
    setShowCountryWarningModal(false)
  }

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-gold-50">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="relative w-full mb-8 rounded-xl overflow-hidden shadow-xl" style={{ aspectRatio: '10/3' }}>
          <Image
            src="https://prolgmzklxddnizyhqau.supabase.co/storage/v1/object/public/classic/form%20banner.jpg"
            alt="Classic Queen International Registration"
            fill
            className="object-cover"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brown-900/70 to-transparent flex items-center">
            <div className="text-white p-6 md:p-8 lg:p-12 max-w-xl">
              <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold mb-2">
                REGISTER AS A CONTESTANT
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-gold-200">
                Join the most prestigious beauty pageant in Africa
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <div className="bg-brown-700 px-3 py-1 rounded-full inline-flex items-center text-sm">
                  <span className="font-semibold">Registration Fee: USD300 (If approved)</span>
                </div>
                <div className="bg-amber-600 px-3 py-1 rounded-full inline-flex items-center text-sm">
                  <span className="font-semibold">No payment required now</span>
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
                  <h3 className="text-xl font-bold">Country Already Registered</h3>
                </div>
                <p className="text-brown-700 mb-4">
                  {countryWarning.message}
                </p>
                <p className="text-brown-700 mb-6">
                  Would you like to speak to our management about being connected with the National Director?
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={continueWithoutContact}
                  className="flex-1 py-2 px-4 border border-brown-300 text-brown-700 rounded-lg hover:bg-brown-50 transition-colors"
                >
                  No, continue
                </button>
                <button
                  onClick={handleContactManagement}
                  className="flex-1 py-2 px-4 bg-gradient-to-r from-brown-900 to-brown-800 text-white rounded-lg hover:from-brown-800 hover:to-brown-700 transition-all"
                >
                  Yes, contact management
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-brown-900 mb-2">
                Contestant Registration Form
              </h2>
              <p className="text-brown-600 mb-6">
                Complete all fields below to register for Classic Queen International Pageant
              </p>

              {/* Fee Information Banner */}
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-gold-50 border border-amber-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center text-sm font-bold">
                      $
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-bold text-amber-800">Registration Fee Information</h3>
                    <p className="text-amber-700 text-sm mt-1">
                      There is <span className="font-bold">no payment required</span> to submit your application. 
                      If your application is approved, you will be required to pay a registration fee of <span className="font-bold">USD$300</span> to secure your spot as a contestant.
                    </p>
                  </div>
                </div>
              </div>

              {/* CONTESTANT ELIGIBILITY CRITERIA SECTION */}
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => setShowCriteria(!showCriteria)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-brown-50 to-gold-50 rounded-lg hover:from-brown-100 hover:to-gold-100 transition-all duration-300"
                >
                  <span className="font-bold text-brown-900 text-lg">
                    📋 CONTESTANT ELIGIBILITY CRITERIA
                  </span>
                  <span className="text-brown-700">
                    {showCriteria ? '▲ Hide Criteria' : '▼ Show Criteria'}
                  </span>
                </button>
                
                {/* Expanded Criteria Content */}
                {showCriteria && (
                  <div className="mt-4 bg-white border border-gold-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-brown-900 mb-4">Eligibility Requirements</h3>
                    
                    <div className="space-y-6">
                      {/* 1. Age Requirement */}
                      <div>
                        <h4 className="font-bold text-brown-800 mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center mr-2 text-sm">1</span>
                          Age Requirement
                        </h4>
                        <ul className="text-brown-700 ml-8 space-y-1">
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Must be between 18 – 30 years</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* 2. Height Requirement */}
                      <div>
                        <h4 className="font-bold text-brown-800 mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center mr-2 text-sm">2</span>
                          Height Requirement
                        </h4>
                        <ul className="text-brown-700 ml-8 space-y-1">
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Minimum height: 5'6 ft (168 cm)</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* 3. Nationality */}
                      <div>
                        <h4 className="font-bold text-brown-800 mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center mr-2 text-sm">3</span>
                          Nationality
                        </h4>
                        <ul className="text-brown-700 ml-8 space-y-1">
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Must be a citizen of the country represented</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>OR residency status</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* 4. Marital Status */}
                      <div>
                        <h4 className="font-bold text-brown-800 mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center mr-2 text-sm">4</span>
                          Marital Status
                        </h4>
                        <div className="ml-8">
                          <div className="flex items-center mb-2">
                            <div className="w-4 h-4 border border-brown-400 rounded mr-2 flex-shrink-0"></div>
                            <span className="text-brown-700">Single allowed</span>
                          </div>
                          <div className="flex items-center mb-2">
                            <div className="w-4 h-4 border border-brown-400 rounded mr-2 flex-shrink-0"></div>
                            <span className="text-brown-700">Divorced allowed</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-4 h-4 border border-brown-400 rounded mr-2 flex-shrink-0"></div>
                            <span className="text-brown-700">Single mothers allowed</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* 5. Educational Requirement */}
                      <div>
                        <h4 className="font-bold text-brown-800 mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center mr-2 text-sm">5</span>
                          Educational Requirement
                        </h4>
                        <ul className="text-brown-700 ml-8 space-y-1">
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Minimum of secondary school certificate</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* 6. Character & Conduct */}
                      <div>
                        <h4 className="font-bold text-brown-800 mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center mr-2 text-sm">6</span>
                          Character & Conduct
                        </h4>
                        <ul className="text-brown-700 ml-8 space-y-1">
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Must be of good moral character</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>No involvement in activities that may damage the brand image</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* 7. Health & Fitness */}
                      <div>
                        <h4 className="font-bold text-brown-800 mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center mr-2 text-sm">7</span>
                          Health & Fitness
                        </h4>
                        <ul className="text-brown-700 ml-8 space-y-1">
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Must be physically and mentally fit</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>No contagious or life-threatening illnesses</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Must be able to participate fully in rehearsals and events</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* 8. Communication Skills */}
                      <div>
                        <h4 className="font-bold text-brown-800 mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center mr-2 text-sm">8</span>
                          Communication Skills
                        </h4>
                        <ul className="text-brown-700 ml-8 space-y-1">
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Must be able to communicate confidently</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* 9. Appearance & Grooming */}
                      <div>
                        <h4 className="font-bold text-brown-800 mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center mr-2 text-sm">9</span>
                          Appearance & Grooming
                        </h4>
                        <ul className="text-brown-700 ml-8 space-y-1">
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Natural beauty encouraged</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Cosmetic surgery allowed</span>
                          </li>
                        </ul>
                      </div>
                      
                      {/* 10. Availability & Commitment */}
                      <div>
                        <h4 className="font-bold text-brown-800 mb-2 flex items-center">
                          <span className="w-6 h-6 rounded-full bg-gold-600 text-white flex items-center justify-center mr-2 text-sm">10</span>
                          Availability & Commitment
                        </h4>
                        <p className="text-brown-700 mb-2 ml-8">Must be available for:</p>
                        <ul className="text-brown-700 ml-12 space-y-1">
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Pageant camp</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Rehearsals</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Media activities</span>
                          </li>
                          <li className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-brown-600 mt-2 mr-2 flex-shrink-0"></div>
                            <span>Grand finale</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-gold-50 border border-gold-200 rounded-lg">
                      <p className="text-brown-800 font-medium">
                        By checking the "I confirm that I meet all the eligibility criteria" box below, you confirm that you meet all the above requirements.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-brown-800 font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                        formErrors.full_name ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.full_name && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.full_name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-2">
                      Country *
                      {countryCheckLoading && (
                        <span className="ml-2 text-sm text-brown-500">Checking...</span>
                      )}
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                        formErrors.location || countryWarning ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      placeholder="Country you represent"
                    />
                    {formErrors.location ? (
                      <p className="text-red-600 text-sm mt-1">{formErrors.location}</p>
                    ) : countryWarning ? (
                      <p className="text-red-600 text-sm mt-1">
                        ⚠️ This country already has a National Director
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-brown-800 font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                        formErrors.email ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      placeholder="your.email@example.com"
                    />
                    {formErrors.email && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-2">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                        formErrors.whatsapp ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      placeholder="+2348012345678"
                    />
                    {formErrors.whatsapp && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.whatsapp}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-brown-800 font-medium mb-2">
                      Occupation *
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                        formErrors.occupation ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      placeholder="Your profession"
                    />
                    {formErrors.occupation && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.occupation}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-2">
                      Any Contest Experience? *
                    </label>
                    <div className="flex gap-6 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="contest_experience"
                          value="yes"
                          checked={formData.contest_experience === 'yes'}
                          onChange={handleInputChange}
                          className={`mr-2 ${formErrors.contest_experience ? 'text-red-600' : 'text-gold-600'}`}
                        />
                        <span className="text-brown-700">Yes</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="contest_experience"
                          value="no"
                          checked={formData.contest_experience === 'no'}
                          onChange={handleInputChange}
                          className={`mr-2 ${formErrors.contest_experience ? 'text-red-600' : 'text-gold-600'}`}
                        />
                        <span className="text-brown-700">No</span>
                      </label>
                    </div>
                    {formErrors.contest_experience && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.contest_experience}</p>
                    )}
                  </div>
                </div>

                {showExperienceInput && (
                  <div>
                    <label className="block text-brown-800 font-medium mb-2">
                      Tell us about your previous contest experience *
                    </label>
                    <textarea
                      name="previous_experience_details"
                      value={formData.previous_experience_details}
                      onChange={handleInputChange}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                        formErrors.previous_experience_details ? 'border-red-300 bg-red-50' : 'border-brown-200'
                      }`}
                      placeholder="Describe your previous pageant/contest experience..."
                    />
                    {formErrors.previous_experience_details && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.previous_experience_details}</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-brown-800 font-medium mb-2">
                      Instagram Handle
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                      placeholder="@username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-2">
                      Facebook Profile URL
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                      placeholder="https://facebook.com/username"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-brown-800 font-medium mb-2">
                      TikTok Handle
                    </label>
                    <input
                      type="text"
                      name="tiktok"
                      value={formData.tiktok}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-brown-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
                      placeholder="@username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-brown-800 font-medium mb-2">
                    About You *
                  </label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all ${
                      formErrors.about ? 'border-red-300 bg-red-50' : 'border-brown-200'
                    }`}
                    placeholder="Tell us about yourself, your aspirations, and why you want to join Classic Queen International..."
                  />
                  {formErrors.about && (
                    <p className="text-red-600 text-sm mt-1">{formErrors.about}</p>
                  )}
                </div>

                {/* COMPACT PROFILE PHOTO UPLOAD SECTION */}
                <div className="space-y-3">
                  <label className="block text-brown-800 font-medium">
                    Upload Profile Picture *
                  </label>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className={`inline-flex items-center px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                        formErrors.photo 
                          ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' 
                          : 'border-brown-300 bg-white text-brown-700 hover:bg-brown-50 hover:border-brown-400'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {photo ? 'Change Photo' : 'Select Photo'}
                    </button>
                    
                    {photoPreview && (
                      <div className="flex items-center space-x-2">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden border border-brown-200">
                          <Image
                            src={photoPreview}
                            alt="Profile preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <span className="text-sm text-brown-600">
                          {photo.name}
                        </span>
                      </div>
                    )}
                    
                    {!photo && (
                      <span className="text-sm text-brown-500">
                        Required - JPG, PNG, or WEBP (Max 5MB)
                      </span>
                    )}
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  
                  {formErrors.photo && (
                    <p className="text-red-600 text-sm">{formErrors.photo}</p>
                  )}
                </div>

                {/* COMPACT GALLERY UPLOAD SECTION */}
                <div className="space-y-3">
                  <label className="block text-brown-800 font-medium">
                    Upload Gallery Photos * (Max 6 photos)
                  </label>
                  
                  <div className="flex items-center space-x-4 mb-3">
                    <button
                      type="button"
                      onClick={triggerGalleryInput}
                      className={`inline-flex items-center px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                        formErrors.gallery
                          ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                          : 'border-brown-300 bg-white text-brown-700 hover:bg-brown-50 hover:border-brown-400'
                      }`}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {galleryPhotos.length > 0 ? 'Add More Photos' : 'Select Photos'}
                    </button>
                    
                    {galleryPhotos.length > 0 && (
                      <span className="text-sm font-medium text-brown-700">
                        {galleryPhotos.length} of 6 photos selected
                      </span>
                    )}
                    
                    {galleryPhotos.length < 6 && galleryPhotos.length > 0 && (
                      <span className="text-sm text-brown-500">
                        ({6 - galleryPhotos.length} more can be added)
                      </span>
                    )}
                    
                    <input
                      type="file"
                      ref={galleryInputRef}
                      onChange={handleGalleryUpload}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                  </div>
                  
                  {formErrors.gallery && (
                    <p className="text-red-600 text-sm">{formErrors.gallery}</p>
                  )}
                  
                  {/* COMPACT GALLERY PREVIEWS WITH PLUS SIGN BUTTON */}
                  {galleryPreviews.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-brown-600">Preview:</p>
                      <div className="flex flex-wrap gap-2">
                        {galleryPreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-20 h-20 rounded-md overflow-hidden border border-brown-200">
                              <Image
                                src={preview}
                                alt={`Gallery preview ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryPhoto(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                            <p className="text-xs text-brown-600 mt-1 truncate max-w-[80px]">
                              {galleryPhotos[index].name}
                            </p>
                          </div>
                        ))}
                        
                        {/* PLUS SIGN BUTTON TO ADD MORE PHOTOS */}
                        {galleryPhotos.length < 6 && (
                          <div 
                            onClick={triggerGalleryInput}
                            className="relative w-20 h-20 rounded-md overflow-hidden border-2 border-dashed border-brown-300 flex flex-col items-center justify-center cursor-pointer hover:border-gold-500 hover:bg-gold-50 transition-all"
                          >
                            <div className="text-brown-500">
                              <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                              <p className="text-xs font-medium">Add more</p>
                              <p className="text-[10px] mt-1">
                                {6 - galleryPhotos.length} remaining
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="criteria_met"
                      name="criteria_met"
                      checked={formData.criteria_met}
                      onChange={handleInputChange}
                      className={`mt-1 mr-3 rounded focus:ring-gold-500 ${
                        formErrors.criteria_met ? 'text-red-600' : 'text-gold-600'
                      }`}
                    />
                    <label htmlFor="criteria_met" className="text-brown-700">
                      <span className="font-medium">I confirm that I meet all the eligibility criteria listed above</span>
                    </label>
                  </div>
                  {formErrors.criteria_met && (
                    <p className="text-red-600 text-sm ml-7 -mt-3">{formErrors.criteria_met}</p>
                  )}
                  
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="terms_accepted"
                      name="terms_accepted"
                      checked={formData.terms_accepted}
                      onChange={handleInputChange}
                      className={`mt-1 mr-3 rounded focus:ring-gold-500 ${
                        formErrors.terms_accepted ? 'text-red-600' : 'text-gold-600'
                      }`}
                    />
                    <label htmlFor="terms_accepted" className="text-brown-700">
                      <span className="font-medium">I accept the Terms and Conditions of Classic Queen International</span>
                      <p className="text-sm text-brown-600 mt-1">
                        By checking this box, you agree to abide by all pageant rules and regulations.
                      </p>
                    </label>
                  </div>
                  {formErrors.terms_accepted && (
                    <p className="text-red-600 text-sm ml-7 -mt-3">{formErrors.terms_accepted}</p>
                  )}
                </div>

                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || countryWarning}
                    className={`w-full py-4 text-white font-bold text-lg rounded-lg shadow-lg transition-all duration-300 ${
                      countryWarning 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-brown-900 to-brown-800 hover:from-gold-600 hover:to-gold-500 hover:shadow-xl'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting Registration...
                      </span>
                    ) : countryWarning ? (
                      'Country Already Registered - Cannot Submit'
                    ) : (
                      'Submit Application for Review'
                    )}
                  </button>
                  <p className="text-center text-brown-600 text-sm mt-3">
                    <span className="font-bold text-amber-700">Registration Fee: $300 (Payable only if application is approved)</span>
                    <br />
                    <span className="text-brown-500">No payment required to submit your application</span>
                    {countryWarning && (
                      <span className="block text-red-600 mt-1">
                        ⚠️ Cannot submit because this country already has a National Director
                      </span>
                    )}
                  </p>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-gradient-to-br from-brown-50 to-gold-50 rounded-xl p-6 border border-gold-200">
                <h3 className="text-xl font-bold text-brown-900 mb-4">
                  📋 Form Preview
                </h3>
                <div className="space-y-4">
                  {formData.full_name && (
                    <div>
                      <p className="text-sm text-brown-600">Full Name</p>
                      <p className="font-medium text-brown-900">{formData.full_name}</p>
                    </div>
                  )}
                  
                  {formData.location && (
                    <div>
                      <p className="text-sm text-brown-600">Country</p>
                      <p className="font-medium text-brown-900">
                        {formData.location}
                        {countryWarning && (
                          <span className="ml-2 text-xs text-red-600">(Already registered)</span>
                        )}
                      </p>
                    </div>
                  )}
                  
                  {formData.email && (
                    <div>
                      <p className="text-sm text-brown-600">Email</p>
                      <p className="font-medium text-brown-900">{formData.email}</p>
                    </div>
                  )}
                  
                  {formData.occupation && (
                    <div>
                      <p className="text-sm text-brown-600">Occupation</p>
                      <p className="font-medium text-brown-900">{formData.occupation}</p>
                    </div>
                  )}
                  
                  {formData.contest_experience && (
                    <div>
                      <p className="text-sm text-brown-600">Contest Experience</p>
                      <p className="font-medium text-brown-900">
                        {formData.contest_experience === 'yes' ? 'Yes' : 'No'}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm text-brown-600">Photos Uploaded</p>
                    <p className={`font-medium ${photo ? 'text-green-600' : 'text-red-600'}`}>
                      {photo ? '✓ Profile Photo' : '✗ Profile Photo'}
                    </p>
                    <p className={`font-medium ${galleryPhotos.length > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {galleryPhotos.length > 0 ? `✓ ${galleryPhotos.length} Gallery Photos` : '✗ Gallery Photos'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-brown-600">Required Checks</p>
                    <p className={`font-medium ${formData.criteria_met ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.criteria_met ? '✓ Criteria Confirmed' : '✗ Criteria Not Confirmed'}
                    </p>
                    <p className={`font-medium ${formData.terms_accepted ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.terms_accepted ? '✓ Terms Accepted' : '✗ Terms Not Accepted'}
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-gold-200">
                    <p className="text-sm text-brown-600">Fee Information</p>
                    <p className="text-amber-700 font-medium">
                      $300 Registration Fee
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      ✓ No payment required now
                    </p>
                    <p className="text-xs text-brown-500 mt-1">
                      Payable only if your application is approved
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
export default CandidateRegistrationForm