import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  console.log('=== NATIONAL DIRECTOR APPLICATION STARTED ===')
  
  try {
    const formData = await request.formData()
    
    // Debug: Log all form data received
    console.log('=== RAW FORM DATA RECEIVED ===')
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? `File: ${value.name}, ${value.size} bytes` : value)
    }
    console.log('=== END RAW FORM DATA ===')
    
    // Extract form data - MATCHING FRONTEND FIELD NAMES
    const applicationData = {
      full_name: formData.get('full_name') || null,
      email: formData.get('email') || null,
      phone: formData.get('phone') || null,
      whatsapp: formData.get('whatsapp') || null,
      nationality: formData.get('nationality') || null,
      country_of_interest: formData.get('country_of_interest') || null, // CHANGED from 'country'
      company_name: formData.get('company_name') || null,
      company_registration_number: formData.get('company_registration_number') || null,
      years_experience: formData.get('years_experience') || null,
      previous_events_organized: formData.get('previous_events_organized') || null,
      website: formData.get('website') || null,
      instagram: formData.get('instagram') || null,
      facebook: formData.get('facebook') || null,
      linkedin: formData.get('linkedin') || null,
      why_interested: formData.get('why_interested') || null,
      plan_for_country: formData.get('plan_for_country') || null,
      how_heard: formData.get('how_heard') || null,
      agree_terms: formData.get('agree_terms') === 'true',
      agree_franchise_terms: formData.get('agree_franchise_terms') === 'true',
      confirm_experience: formData.get('confirm_experience') === 'true',
      payment_id: formData.get('payment_id') || null,
      payment_status: formData.get('payment_status') || 'completed',
      application_fee: parseFloat(formData.get('application_fee') || '0'),
      application_status: 'pending'
    }
    
    console.log('Application data prepared:', applicationData)
    
    // Validate required fields
    const requiredFields = ['full_name', 'email', 'phone', 'whatsapp', 'nationality', 'country_of_interest', 'years_experience', 'why_interested', 'plan_for_country', 'how_heard']
    const missingFields = []
    
    requiredFields.forEach(field => {
      if (!applicationData[field]) {
        missingFields.push(field)
      }
    })
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields)
      return Response.json({ 
        error: 'Missing required fields',
        message: `Please fill in: ${missingFields.join(', ')}`,
        missingFields: missingFields
      }, { status: 400 })
    }
    
    // Upload profile photo if provided
    let profilePhotoUrl = null
    const profilePhoto = formData.get('profile_photo')
    
    if (profilePhoto && profilePhoto.size > 0) {
      console.log('Uploading profile photo...')
      
      try {
        const fileExt = profilePhoto.name.split('.').pop()
        const fileName = `profile_${Date.now()}.${fileExt}`
        const filePath = `${applicationData.email.replace(/[^a-zA-Z0-9]/g, '_')}/${fileName}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('national-directors')
          .upload(filePath, profilePhoto, {
            contentType: profilePhoto.type,
            cacheControl: '3600',
            upsert: false
          })
        
        if (uploadError) {
          console.error('Profile photo upload error:', uploadError)
          // Continue without photo if upload fails
        } else {
          const { data: urlData } = supabase.storage
            .from('national-directors')
            .getPublicUrl(filePath)
          
          profilePhotoUrl = urlData?.publicUrl
          console.log('Profile photo uploaded:', profilePhotoUrl)
        }
      } catch (uploadError) {
        console.error('Profile photo upload exception:', uploadError)
        // Continue without photo
      }
    } else {
      console.log('No profile photo provided or empty file')
    }
    
    // Add profile photo URL to application data
    if (profilePhotoUrl) {
      applicationData.profile_photo_url = profilePhotoUrl
    }
    
    console.log('Inserting into database...')
    
    // Insert application into database
    const { data: application, error: insertError } = await supabase
      .from('national_directors')
      .insert([applicationData])
      .select()
      .single()
    
    if (insertError) {
      console.error('Database insert error:', insertError)
      return Response.json({ 
        error: 'Database error',
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      }, { status: 400 })
    }
    
    console.log('Application submitted successfully:', application.id)
    
    return Response.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.id,
      profilePhotoUploaded: !!profilePhotoUrl
    }, { status: 201 })
    
  } catch (error) {
    console.error('Application error:', error)
    return Response.json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}