'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Globe } from 'lucide-react'

export default function CountriesManager({ data, onUpdate, saveToDatabase }) {
  // FIX 1: Initialize with empty array if data is undefined
  const [countries, setCountries] = useState(data || [])
  const [newCountry, setNewCountry] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    // FIX 2: Always ensure countries is an array
    setCountries(data || [])
  }, [data])

  const handleAdd = async () => {
    if (!newCountry.trim()) {
      alert('Please enter a country name')
      return
    }
    
    try {
      // FIX 3: Use spread with safety check
      const updated = [...(countries || []), { name: newCountry }]
      setCountries(updated)
      onUpdate(updated)
      
      const success = await saveToDatabase('nd_countries', updated)
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
      // FIX 4: Use spread with safety check
      const updated = [...(countries || [])]
      updated[index] = { name: editValue }
      setCountries(updated)
      onUpdate(updated)
      
      const success = await saveToDatabase('nd_countries', updated)
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
      // FIX 5: Filter with safety check
      const updated = (countries || []).filter((_, i) => i !== index)
      setCountries(updated)
      onUpdate(updated)
      
      await saveToDatabase('nd_countries', updated)
    } catch (error) {
      console.error('Error deleting country:', error)
      alert('Failed to delete country')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">National Director Countries</h2>
      </div>

      {/* Add Form */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newCountry}
            onChange={(e) => setNewCountry(e.target.value)}
            placeholder="Enter country name"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2"
          />
          <button
            onClick={handleAdd}
            disabled={!newCountry.trim()}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Country
          </button>
        </div>
      </div>

      {/* Countries List - FIX 6: Added null/undefined check before map */}
      <div className="space-y-3">
        {countries && countries.length > 0 ? (
          countries.map((country, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              {editingIndex === index ? (
                <div className="flex items-center space-x-4 flex-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleUpdate(index)}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingIndex(null)
                        setEditValue('')
                      }}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{country.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditValue(country.name)
                        setEditingIndex(index)
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No countries added yet. Add your first country above.
          </div>
        )}
      </div>
    </div>
  )
}