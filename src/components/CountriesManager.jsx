'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Globe, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function CountriesManager() {
  const [countries, setCountries] = useState([])
  const [newCountry, setNewCountry] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const RECORD_ID = 1989

  // Fetch countries from database
  useEffect(() => {
    fetchCountries()
  }, [])

  const fetchCountries = async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log('Fetching countries for ID:', RECORD_ID)
      
      const { data, error: supabaseError } = await supabase
        .from('classicqueen')
        .select('nd_countries, id')
        .eq('id', RECORD_ID)
        .single()

      console.log('Supabase response:', { data, supabaseError })

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        setError(`Database error: ${supabaseError.message}`)
        setCountries([])
        return
      }

      if (!data) {
        console.error('No data found for ID:', RECORD_ID)
        setError(`No record found with ID: ${RECORD_ID}`)
        setCountries([])
        return
      }

      console.log('Raw nd_countries data:', data.nd_countries)
      console.log('Type of nd_countries:', typeof data.nd_countries)

      // Handle different data formats
      let countriesData = data.nd_countries
      
      // If it's a string, try to parse it as JSON
      if (typeof countriesData === 'string') {
        try {
          countriesData = JSON.parse(countriesData)
          console.log('Parsed JSON:', countriesData)
        } catch (parseError) {
          console.error('Failed to parse JSON:', parseError)
          setError(`Invalid data format in database: ${parseError.message}`)
          setCountries([])
          return
        }
      }
      
      // Ensure it's an array
      if (!Array.isArray(countriesData)) {
        console.error('countriesData is not an array:', countriesData)
        setError(`Data format error: Expected array but got ${typeof countriesData}`)
        setCountries([])
        return
      }

      // Filter out any null/undefined entries and ensure each has a name property
      const validCountries = countriesData
        .filter(item => item != null)
        .map(item => ({
          name: item?.name || item?.country || String(item)
        }))

      console.log('Processed countries:', validCountries)
      setCountries(validCountries)
      
    } catch (error) {
      console.error('Error fetching countries:', error)
      setError(`Fetch error: ${error.message}`)
      setCountries([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveToDatabase = async (updatedCountries) => {
    try {
      setIsSaving(true)
      setError(null)
      
      console.log('Saving countries:', updatedCountries)
      
      const { error: supabaseError } = await supabase
        .from('classicqueen')
        .update({ nd_countries: updatedCountries })
        .eq('id', RECORD_ID)

      if (supabaseError) {
        throw new Error(`Database error: ${supabaseError.message}`)
      }

      console.log('Save successful')
      return true
      
    } catch (error) {
      console.error('Error saving to database:', error)
      setError(`Save failed: ${error.message}`)
      alert(`Failed to save changes: ${error.message}`)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleAdd = async () => {
    if (!newCountry.trim()) {
      alert('Please enter a country name')
      return
    }
    
    try {
      const updated = [...countries, { name: newCountry.trim() }]
      setCountries(updated)
      
      const success = await saveToDatabase(updated)
      if (success) {
        setNewCountry('')
      }
    } catch (error) {
      console.error('Error adding country:', error)
      alert('Failed to add country')
    }
  }

  const handleUpdate = async (index) => {
    if (!editValue.trim()) {
      alert('Please enter a country name')
      return
    }
    
    try {
      const updated = [...countries]
      updated[index] = { name: editValue.trim() }
      setCountries(updated)
      
      const success = await saveToDatabase(updated)
      if (success) {
        setEditingIndex(null)
        setEditValue('')
      }
    } catch (error) {
      console.error('Error updating country:', error)
      alert('Failed to update country')
    }
  }

  const handleDelete = async (index) => {
    if (!confirm('Are you sure you want to delete this country?')) return
    
    try {
      const updated = countries.filter((_, i) => i !== index)
      setCountries(updated)
      
      await saveToDatabase(updated)
    } catch (error) {
      console.error('Error deleting country:', error)
      alert('Failed to delete country')
    }
  }

  // Debug function to check database structure
  const debugDatabase = async () => {
    try {
      console.log('Debug: Checking database structure...')
      const { data, error } = await supabase
        .from('classicqueen')
        .select('*')
        .eq('id', RECORD_ID)
        .single()
      
      console.log('Full record:', data)
      console.log('Column types:', {
        id: typeof data?.id,
        nd_countries: typeof data?.nd_countries,
        nd_countries_value: data?.nd_countries
      })
    } catch (error) {
      console.error('Debug error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        <p className="text-gray-600">Loading countries...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Countries Manager</h2>
            <p className="text-gray-600 mt-1">Manage countries list for ID: {RECORD_ID}</p>
          </div>
          <div className="flex items-center space-x-3">
            {isSaving && (
              <div className="flex items-center text-sm text-orange-600">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </div>
            )}
            <button
              onClick={fetchCountries}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Refresh
            </button>
            <button
              onClick={debugDatabase}
              className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Debug
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-2">
                  <button
                    onClick={fetchCountries}
                    className="text-sm font-medium text-red-800 hover:text-red-900"
                  >
                    Try again →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Form */}
        <div className="mb-8">
          <div className="flex space-x-3">
            <input
              type="text"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Enter country name (e.g., United States)"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <button
              onClick={handleAdd}
              disabled={!newCountry.trim() || isSaving}
              className="inline-flex items-center px-5 py-3 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Country
            </button>
          </div>
        </div>

        {/* Countries List - SAFE RENDER */}
        <div className="space-y-3">
          {Array.isArray(countries) && countries.length > 0 ? (
            countries.map((country, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                {editingIndex === index ? (
                  <div className="flex items-center space-x-3 flex-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdate(index)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdate(index)}
                        disabled={isSaving}
                        className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingIndex(null)
                          setEditValue('')
                        }}
                        disabled={isSaving}
                        className="px-4 py-2 border border-gray-300 rounded text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 mr-3">
                        <span className="text-xs font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <span className="text-gray-900 font-medium">
                          {country?.name || 'Unnamed Country'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditValue(country?.name || '')
                          setEditingIndex(index)
                        }}
                        disabled={isSaving}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                        title="Edit country"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        disabled={isSaving}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                        title="Delete country"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {Array.isArray(countries) ? 'No countries added yet' : 'Data format error'}
              </h3>
              <p className="text-gray-600 mb-4">
                {Array.isArray(countries) 
                  ? 'Start by adding your first country above' 
                  : 'Countries data is not in the expected format'}
              </p>
              <button
                onClick={fetchCountries}
                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
              >
                Click here to refresh
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Database Status</p>
              <p className={`font-medium ${error ? 'text-red-600' : 'text-green-600'}`}>
                {error ? 'Error' : 'Connected ✓'}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Countries Count</p>
              <p className="font-medium text-gray-900">
                {Array.isArray(countries) ? countries.length : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}