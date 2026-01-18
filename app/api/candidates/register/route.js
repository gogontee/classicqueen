// app/api/candidates/register/route.js
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with fallback
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create supabase client only if variables exist
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null

// Helper function for development logging
const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

export async function POST(request) {
  devLog('=== CANDIDATE REGISTER API CALLED ===')
  
  try {
    // Check if Supabase is configured
    if (!supabase) {
      return Response.json({ 
        error: 'System configuration error',
        message: 'Registration service is temporarily unavailable'
      }, { status: 503 })
    }

    // Parse form data
    const formData = await request.formData()
    const fullName = formData.get('full_name')
    const country = formData.get('location') // Note: frontend sends 'location' field
    const email = formData.get('email')
    const whatsapp = formData.get('whatsapp')
    const occupation = formData.get('occupation')
    const instagram = formData.get('instagram')
    const facebook = formData.get('facebook')
    const tiktok = formData.get('tiktok')
    const about = formData.get('about')
    const contestExperience = formData.get('contest_experience')
    const previousExperienceDetails = formData.get('previous_experience_details')
    const criteriaMet = formData.get('criteria_met') === 'true'
    const termsAccepted = formData.get('terms_accepted') === 'true'
    const paymentId = formData.get('payment_id')
    const paymentStatus = formData.get('payment_status')
    
    // Get files
    const profilePhoto = formData.get('profilePhoto')
    const galleryImages = formData.getAll('gallery')

    devLog('=== REGISTRATION DATA RECEIVED ===')
    devLog('Full Name:', fullName)
    devLog('Email:', email)
    devLog('Profile Photo present:', !!profilePhoto && profilePhoto.size > 0)
    devLog('Gallery images count:', galleryImages.length)

    // Validation
    if (!fullName || !email || !country || !whatsapp || !occupation) {
      return Response.json({ 
        success: false,
        error: 'Missing required fields',
        message: 'Please fill in all required fields'
      }, { status: 400 })
    }

    if (!termsAccepted) {
      return Response.json({ 
        success: false,
        error: 'Terms not accepted',
        message: 'You must accept the terms and conditions'
      }, { status: 400 })
    }

    // Create a unique reference code
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    const candidateCode = `CAND_${timestamp.toString(36).toUpperCase()}_${randomStr}`

    devLog('Generated candidate code:', candidateCode)

    // 1. Upload profile photo if provided
    let profilePhotoUrl = null
    if (profilePhoto && profilePhoto.size > 0) {
      try {
        const fileExt = profilePhoto.name.split('.').pop() || 'jpg'
        const fileName = `profile_${candidateCode}.${fileExt}`
        const filePath = `${candidateCode}/${fileName}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidates')
          .upload(filePath, profilePhoto, {
            contentType: profilePhoto.type || 'image/jpeg'
          })
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('candidates')
            .getPublicUrl(filePath)
          profilePhotoUrl = urlData?.publicUrl
          devLog('Profile photo uploaded:', profilePhotoUrl)
        }
      } catch (error) {
        devLog('Profile photo upload failed:', error.message)
        // Continue without photo - don't fail the entire registration
      }
    }

    // 2. Upload gallery images
    let galleryUrls = []
    for (let i = 0; i < galleryImages.length; i++) {
      const image = galleryImages[i]
      if (image.size === 0) continue
      
      try {
        const fileExt = image.name.split('.').pop() || 'jpg'
        const fileName = `gallery_${candidateCode}_${i}.${fileExt}`
        const filePath = `${candidateCode}/gallery/${fileName}`
        
        const { data, error } = await supabase.storage
          .from('candidates')
          .upload(filePath, image, {
            contentType: image.type || 'image/jpeg'
          })
        
        if (!error) {
          const { data: urlData } = supabase.storage
            .from('candidates')
            .getPublicUrl(filePath)
          
          if (urlData?.publicUrl) {
            galleryUrls.push({
              url: urlData.publicUrl,
              name: image.name,
              order: i,
              uploaded_at: new Date().toISOString()
            })
          }
        }
      } catch (error) {
        devLog(`Gallery image ${i} upload failed:`, error.message)
        // Continue with other images
      }
    }

    // 3. Create candidate record in database
    const candidateData = {
      candidate_code: candidateCode,
      full_name: fullName,
      country: country,
      email: email,
      phone: whatsapp, // Use whatsapp as phone
      whatsapp: whatsapp,
      occupation: occupation,
      instagram: instagram,
      facebook: facebook,
      tiktok: tiktok,
      about: about,
      contest_experience: contestExperience,
      previous_experience_details: previousExperienceDetails,
      criteria_met: criteriaMet,
      terms_accepted: termsAccepted,
      payment_id: paymentId,
      payment_status: paymentStatus,
      photo: profilePhotoUrl,
      gallery: galleryUrls.length > 0 ? galleryUrls : null,
      registration_date: new Date().toISOString()
    }

    const { data: candidateRecord, error: insertError } = await supabase
      .from('candidates')
      .insert([candidateData])
      .select()
      .single()

    if (insertError) {
      devLog('Database insert error:', insertError.message)
      
      // Try alternative table name if 'candidates' doesn't exist
      const { data: altRecord, error: altError } = await supabase
        .from('classicqueen_candidates')
        .insert([candidateData])
        .select()
        .single()
      
      if (altError) {
        return Response.json({ 
          success: false,
          error: 'Failed to save registration',
          message: 'Database error. Please try again later.'
        }, { status: 500 })
      }
      
      // Use alternative record
      return Response.json({
        success: true,
        message: 'Registration successful!',
        candidateId: altRecord.id,
        candidateCode: candidateCode
      }, { status: 201 })
    }

    // 4. Return success response
    return Response.json({
      success: true,
      message: 'Registration successful!',
      candidateId: candidateRecord.id,
      candidateCode: candidateCode
    }, { status: 201 })

  } catch (error) {
    devLog('Unhandled error:', error.message)
    
    return Response.json({ 
      success: false,
      error: 'Registration failed',
      message: 'An unexpected error occurred. Please try again.'
    }, { status: 500 })
  }
}