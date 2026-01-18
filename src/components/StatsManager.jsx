'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function StatsManager({ data, onUpdate, saveToDatabase }) {
  // FIX 1: Initialize with empty array if data is undefined
  const [stats, setStats] = useState(data || [])
  const [editingIndex, setEditingIndex] = useState(null)
  const [newStat, setNewStat] = useState({ icon: '', title: '', value: '' })

  useEffect(() => {
    // FIX 2: Always ensure stats is an array
    setStats(data || [])
  }, [data])

  const handleSave = async () => {
    if (!newStat.icon || !newStat.title.trim() || !newStat.value.trim()) {
      alert('Please fill in all fields')
      return
    }
    
    try {
      // FIX 3: Use spread with safety check
      const updated = [...(stats || [])]
      if (editingIndex === 'new') {
        updated.push(newStat)
      } else {
        updated[editingIndex] = newStat
      }
      
      setStats(updated)
      onUpdate(updated)
      
      const success = await saveToDatabase('stats', updated)
      if (success) {
        setEditingIndex(null)
        setNewStat({ icon: '', title: '', value: '' })
      }
    } catch (error) {
      console.error('Error saving statistic:', error)
      alert('Failed to save statistic')
    }
  }

  const handleDelete = async (index) => {
    if (!confirm('Are you sure you want to delete this statistic?')) return
    
    try {
      // FIX 4: Filter with safety check
      const updated = (stats || []).filter((_, i) => i !== index)
      setStats(updated)
      onUpdate(updated)
      
      await saveToDatabase('stats', updated)
    } catch (error) {
      console.error('Error deleting statistic:', error)
      alert('Failed to delete statistic')
    }
  }

  const iconOptions = [
    'FiUser', 'FiMapPin', 'FiTrophy', 'FaCrown', 
    'FiUsers', 'FiCalendar', 'FiDollarSign', 'FiAward',
    'FiGlobe', 'FiStar', 'FiHeart', 'FiFlag'
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Statistics Management</h2>
        <button
          onClick={() => {
            setNewStat({ icon: '', title: '', value: '' })
            setEditingIndex('new')
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Statistic
        </button>
      </div>

      {/* Add/Edit Form */}
      {editingIndex !== null && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingIndex === 'new' ? 'Add New Statistic' : 'Edit Statistic'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <select
                value={newStat.icon}
                onChange={(e) => setNewStat({...newStat, icon: e.target.value})}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="">Select an icon</option>
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={newStat.title}
                onChange={(e) => setNewStat({...newStat, title: e.target.value})}
                placeholder="e.g., Candidates, Host Country"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value
              </label>
              <input
                type="text"
                value={newStat.value}
                onChange={(e) => setNewStat({...newStat, value: e.target.value})}
                placeholder="e.g., Global, $10,000"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditingIndex(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!newStat.icon || !newStat.title.trim() || !newStat.value.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats List - FIX 5: Added null/undefined check before map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats && stats.length > 0 ? (
          stats.map((stat, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 font-medium">{stat.icon ? stat.icon.slice(0, 2) : 'Ic'}</span>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">{stat.title}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setNewStat(stat)
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
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            No statistics yet. Add your first statistic above.
          </div>
        )}
      </div>
    </div>
  )
}