import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Replace with your actual table name
    const { data, error } = await supabase
      .from('classicqueen') // Your table name here
      .select('hero') // Assuming hero is the JSONB column
    
    if (error) throw error
    
    // Extract the hero array from JSONB column
    const heroData = data[0]?.hero || []
    
    return Response.json(heroData)
    
  } catch (error) {
    console.error('API Error:', error)
    // Return fallback data
    return Response.json([
      {
        "cta": { "href": "/register" },
        "src": "https://mttimgygxzfqzmnirfyq.supabase.co/storage/v1/object/public/heros/heros/fkyavyzu7dq_1767319747847.jpg",
        "type": "image"
      }
    ])
  }
}