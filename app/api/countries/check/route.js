import { createClient } from '@supabase/supabase-js'

// Log environment variables (for debugging)
console.log('=== API STARTING ===')
console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
console.log('Node environment:', process.env.NODE_ENV)

// Create supabase client directly in the API route
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Missing Supabase environment variables')
  console.error('URL:', supabaseUrl || 'NOT SET')
  console.error('Key:', supabaseAnonKey ? 'SET (length: ' + supabaseAnonKey.length + ')' : 'NOT SET')
}

// Create the client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})
console.log('Supabase client created')

export async function GET(request) {
  console.log('=== COUNTRY CHECK API CALLED ===')
  
  try {
    const { searchParams } = new URL(request.url)
    const countryName = searchParams.get('name')
    
    console.log('Request URL:', request.url)
    console.log('Country requested:', countryName)

    if (!countryName || countryName.trim().length < 2) {
      console.log('Country name too short, returning false')
      return Response.json({ exists: false }, { status: 200 })
    }

    console.log('Querying database...')
    
    // Get countries from classicqueen.nd_countries JSONB column
    const { data, error } = await supabase
      .from('classicqueen')
      .select('nd_countries')
      .limit(1)

    console.log('Database query completed')
    console.log('Error:', error ? error.message : 'No error')
    console.log('Data received:', data ? 'Yes' : 'No')
    console.log('Data length:', data?.length || 0)

    if (error) {
      console.error('DATABASE ERROR DETAILS:')
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      console.error('Error details:', error.details)
      console.error('Error hint:', error.hint)
      
      return Response.json({ 
        error: 'Database query failed',
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.log('No data found in classicqueen table')
      return Response.json({ exists: false }, { status: 200 })
    }

    let countriesData = data[0]?.nd_countries // Changed from const to let
    console.log('Countries data type:', typeof countriesData)
    console.log('Countries data:', countriesData)
    
    if (!countriesData) {
      console.log('nd_countries is null or undefined')
      return Response.json({ exists: false }, { status: 200 })
    }

    if (!Array.isArray(countriesData)) {
      console.log('nd_countries is not an array, trying to parse as JSON...')
      try {
        const parsed = JSON.parse(countriesData)
        if (Array.isArray(parsed)) {
          console.log('Successfully parsed as JSON array')
          countriesData = parsed // This is now allowed because we used 'let'
        } else {
          console.log('Parsed but not an array')
          return Response.json({ exists: false }, { status: 200 })
        }
      } catch (parseError) {
        console.log('Failed to parse as JSON:', parseError.message)
        return Response.json({ exists: false }, { status: 200 })
      }
    }

    console.log('Searching for country:', countryName.toLowerCase().trim())
    console.log('In array of', countriesData.length, 'countries')
    
    if (countriesData.length > 0) {
      console.log('First few countries:', countriesData.slice(0, 3))
    }

    // Check if country exists (case-insensitive)
    const exactMatch = countriesData.find(country => {
      const countryNameLower = country?.name?.toLowerCase()
      const searchName = countryName.toLowerCase().trim()
      const match = countryNameLower === searchName
      if (match) console.log('FOUND MATCH:', country)
      return match
    })

    console.log('Match result:', exactMatch ? 'FOUND' : 'NOT FOUND')

    return Response.json({
      exists: !!exactMatch,
      countryName: exactMatch?.name || null,
      debug: {
        searchedFor: countryName,
        totalCountries: countriesData.length
      }
    }, { status: 200 })
    
  } catch (error) {
    console.error('=== UNHANDLED ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return Response.json({ 
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  } finally {
    console.log('=== API CALL END ===')
  }
}