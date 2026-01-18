// app/api/countries/check/route.js
import { createClient } from '@supabase/supabase-js'

// DON'T use console.log here - this runs at build time!
// Instead, use process.env.NODE_ENV check

// Create supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Only create client if variables exist
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null

export async function GET(request) {
  // For debugging in development only
  if (process.env.NODE_ENV === 'development') {
    console.log('=== COUNTRY CHECK API CALLED ===')
  }
  
  try {
    // 1. Check if Supabase is configured
    if (!supabase) {
      return Response.json({ 
        exists: false,
        error: 'Database not configured'
      }, { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const countryName = searchParams.get('name')
    
    if (!countryName || countryName.trim().length < 2) {
      return Response.json({ exists: false }, { status: 200 })
    }

    // 2. FIXED QUERY: Check if table exists and has correct structure
    const { data, error } = await supabase
      .from('countries') // Changed from 'classicqueen' to 'countries' table
      .select('*')
      .ilike('name', `%${countryName}%`) // Case-insensitive search
      .limit(1)

    if (error) {
      // Try alternative table names if 'countries' doesn't exist
      const { data: altData } = await supabase
        .from('classicqueen')
        .select('nd_countries')
        .limit(1)
      
      if (altData && altData[0]?.nd_countries) {
        const countriesArray = Array.isArray(altData[0].nd_countries) 
          ? altData[0].nd_countries 
          : JSON.parse(altData[0].nd_countries || '[]')
        
        const exists = countriesArray.some(country => 
          country?.name?.toLowerCase() === countryName.toLowerCase().trim()
        )
        
        return Response.json({ exists }, { status: 200 })
      }
      
      return Response.json({ exists: false }, { status: 200 })
    }

    // 3. Return result
    return Response.json({
      exists: !!data && data.length > 0,
      countryName: data?.[0]?.name || null
    }, { status: 200 })
    
  } catch (error) {
    // Silent fail for production
    return Response.json({ 
      exists: false,
      error: 'Server error'
    }, { status: 200 }) // Return 200 with exists:false instead of 500
  }
}