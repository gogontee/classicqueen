import { createClient } from '@supabase/supabase-js'

// Log environment variables (same as your working country check)
console.log('=== REGISTER API STARTING ===')
console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('Node environment:', process.env.NODE_ENV)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing Supabase environment variables for register API')
  console.error('URL:', supabaseUrl || 'NOT SET')
  console.error('Key:', supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'NOT SET')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})
console.log('Register API: Supabase client created')

export async function POST(request) {
  console.log('=== CANDIDATE REGISTER API CALLED ===')
  
  try {
    // Parse form data
    const formData = await request.formData()
    const fullName = formData.get('full_name')
    const country = formData.get('location') // Note: frontend sends 'location' field
    const email = formData.get('email')
    const whatsapp = formData.get('whatsapp') // Note: frontend sends 'whatsapp' field
    const phone = whatsapp // Map whatsapp to phone in database
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
    
    // Get files - FIXED: Use correct field names that match updated frontend
    const profilePhoto = formData.get('profilePhoto') // Changed from 'photo' to 'profilePhoto'
    const galleryImages = formData.getAll('gallery') // Get all gallery images
    
    console.log('=== REGISTRATION DATA RECEIVED ===')
    console.log('Full Name:', fullName)
    console.log('Country:', country)
    console.log('Email:', email)
    console.log('WhatsApp:', whatsapp)
    console.log('Occupation:', occupation)
    console.log('Contest Experience:', contestExperience)
    console.log('Criteria Met:', criteriaMet)
    console.log('Terms Accepted:', termsAccepted)
    console.log('Payment ID:', paymentId)
    console.log('Payment Status:', paymentStatus)
    console.log('Profile Photo present:', !!profilePhoto)
    console.log('Profile Photo name:', profilePhoto?.name)
    console.log('Profile Photo size:', profilePhoto?.size)
    console.log('Profile Photo type:', profilePhoto?.type)
    console.log('Gallery images count:', galleryImages.length)
    
    // Log gallery images details
    galleryImages.forEach((img, index) => {
      console.log(`Gallery image ${index}:`, {
        name: img.name,
        size: img.size,
        type: img.type
      })
    })
    
    // Validation
    if (!fullName || !email || !country || !whatsapp || !occupation) {
      return Response.json({ 
        error: 'Missing required fields',
        message: 'Please fill in all required fields'
      }, { status: 400 })
    }

    // Create a unique reference code for storage
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    const candidateCode = `CAND_${timestamp.toString(36).toUpperCase()}_${randomStr}`
    
    console.log('Generated candidate code:', candidateCode)

    // 1. Upload profile photo if provided - UPDATED WITH FIXES
    let profilePhotoUrl = null
    if (profilePhoto && profilePhoto.size > 0) {
      console.log('=== UPLOADING PROFILE PHOTO ===')
      console.log('Profile photo details:', {
        name: profilePhoto.name,
        size: profilePhoto.size,
        type: profilePhoto.type
      })
      
      try {
        // Create unique filename
        const fileExt = profilePhoto.name.split('.').pop()
        const fileName = `profile_${candidateCode}.${fileExt}`
        const filePath = `${candidateCode}/${fileName}`
        
        console.log('Uploading to path:', filePath)
        
        // Upload with proper content type - ADDED CONTENT TYPE
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidates')
          .upload(filePath, profilePhoto, {
            contentType: profilePhoto.type,
            cacheControl: '3600',
            upsert: false
          })
        
        if (uploadError) {
          console.error('Profile photo upload error:', uploadError)
          console.error('Full error object:', JSON.stringify(uploadError, null, 2))
        } else {
          console.log('Profile photo uploaded successfully')
          
          // Get public URL
          const { data: urlData } = supabase.storage
            .from('candidates')
            .getPublicUrl(filePath)
          
          profilePhotoUrl = urlData?.publicUrl
          console.log('Profile photo public URL:', profilePhotoUrl)
        }
      } catch (uploadError) {
        console.error('Exception in profile photo upload:', uploadError)
      }
    } else {
      console.log('No profile photo provided or empty file')
    }

    // 2. Upload gallery images to storage - UPDATED WITH FIXES
    let galleryUrls = []
    const galleryImagesArray = formData.getAll('gallery') // Get all gallery files
    
    console.log(`Found ${galleryImagesArray.length} gallery images to upload`)

    if (galleryImagesArray.length > 0) {
      console.log(`=== UPLOADING ${galleryImagesArray.length} GALLERY IMAGES ===`)
      
      for (let i = 0; i < galleryImagesArray.length; i++) {
        const image = galleryImagesArray[i]
        if (image.size === 0) {
          console.log(`Skipping gallery image ${i} - empty file`)
          continue
        }
        
        try {
          console.log(`Uploading gallery image ${i + 1}/${galleryImagesArray.length}...`)
          
          // Create unique filename
          const fileExt = image.name.split('.').pop()
          const fileName = `gallery_${candidateCode}_${i}.${fileExt}`
          const filePath = `${candidateCode}/gallery/${fileName}`
          
          console.log(`Uploading gallery ${i} to: ${filePath}`)
          
          // Upload with content type - ADDED CONTENT TYPE
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('candidates')
            .upload(filePath, image, {
              contentType: image.type,
              cacheControl: '3600',
              upsert: false
            })
          
          if (uploadError) {
            console.error(`Gallery ${i} upload error:`, uploadError)
          } else {
            console.log(`Gallery image ${i + 1} uploaded successfully`)
            
            // Get public URL
            const { data: urlData } = supabase.storage
              .from('candidates')
              .getPublicUrl(filePath)
            
            if (urlData?.publicUrl) {
              const galleryItem = {
                url: urlData.publicUrl,
                name: image.name,
                type: image.type,
                uploaded_at: new Date().toISOString(),
                order: i
              }
              galleryUrls.push(galleryItem)
              console.log(`Gallery ${i} uploaded: ${urlData.publicUrl}`)
            }
          }
        } catch (error) {
          console.error(`Gallery ${i} upload exception:`, error)
          console.error('Stack:', error.stack)
        }
      }
      
      console.log(`Successfully uploaded ${galleryUrls.length} gallery images`)
      console.log('Gallery data to store:', JSON.stringify(galleryUrls, null, 2))
    } else {
      console.log('No gallery images provided')
    }

    // 3. Create candidate record in database (NO AUTH REQUIRED)
    console.log('=== CREATING CANDIDATE DATABASE RECORD ===')
    
    const candidateData = {
      // Let Supabase auto-generate the UUID - DO NOT include 'id' field
      candidate_code: candidateCode,
      full_name: fullName,
      country: country, // Map from location
      email: email,
      phone: phone, // Map from whatsapp
      whatsapp: whatsapp, // Keep original whatsapp too
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
      photo: profilePhotoUrl, // Profile photo URL - should go to candidates.photo
      gallery: galleryUrls.length > 0 ? galleryUrls : null, // Gallery URLs array - should go to candidates.gallery (JSONB)
      registration_date: new Date().toISOString(),
      // Let Supabase handle created_at and updated_at automatically
    }
    
    console.log('=== CANDIDATE DATA FOR DATABASE INSERT ===')
    console.log('Profile photo URL to store in photo column:', candidateData.photo)
    console.log('Gallery data to store in gallery column:', JSON.stringify(candidateData.gallery, null, 2))
    console.log('Full candidate data:', JSON.stringify(candidateData, null, 2))

    const { data: candidateRecord, error: insertError } = await supabase
      .from('candidates')
      .insert([candidateData])
      .select()
      .single()

    if (insertError) {
      console.error('=== DATABASE INSERT ERROR ===')
      console.error('Error code:', insertError.code)
      console.error('Error message:', insertError.message)
      console.error('Error details:', insertError.details)
      console.error('Error hint:', insertError.hint)
      
      return Response.json({ 
        error: 'Failed to save registration',
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code
      }, { status: 400 })
    }

    console.log('=== CANDIDATE RECORD CREATED SUCCESSFULLY ===')
    console.log('Candidate record:', candidateRecord)
    console.log('Photo stored in database:', candidateRecord.photo)
    console.log('Gallery stored in database:', candidateRecord.gallery)
    console.log('Gallery count in database:', candidateRecord.gallery ? candidateRecord.gallery.length : 0)

    // 4. Return success response
    return Response.json({
      success: true,
      message: 'Registration successful!',
      candidateId: candidateRecord.id, // This is the auto-generated UUID from Supabase
      candidateCode: candidateCode,
      candidate: {
        fullName,
        country,
        email,
        profilePhoto: candidateRecord.photo, // Return the photo from database
        galleryCount: candidateRecord.gallery ? candidateRecord.gallery.length : 0,
        gallery: candidateRecord.gallery // Return gallery from database
      },
      debug: {
        profilePhotoUploaded: !!profilePhotoUrl,
        galleryImagesUploaded: galleryUrls.length,
        databasePhoto: candidateRecord.photo,
        databaseGalleryCount: candidateRecord.gallery ? candidateRecord.gallery.length : 0
      }
    }, { status: 201 })

  } catch (error) {
    console.error('=== UNHANDLED ERROR IN REGISTER API ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return Response.json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  } finally {
    console.log('=== REGISTER API CALL END ===')
  }
}