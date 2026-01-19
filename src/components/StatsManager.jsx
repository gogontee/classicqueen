'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X, Save, Upload, RefreshCw } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client - IMPORTANT: Add these to your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

export default function StatsManager() {
  const [stats, setStats] = useState([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newStat, setNewStat] = useState({ icon: '', title: '', value: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const TABLE_ID = 1989 // Your specific table ID

  // Fetch stats from database
  const fetchStats = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching stats from database, table ID:', TABLE_ID)
      
      const { data, error } = await supabase
        .from('classicqueen')
        .select('stats')
        .eq('id', TABLE_ID)
        .single()

      if (error) {
        console.error('❌ Database fetch error:', error)
        alert('Failed to load statistics from database')
        setStats([])
        return
      }

      console.log('✅ Database response:', data)
      
      if (data?.stats) {
        // Parse the JSONB column
        let statsArray
        if (Array.isArray(data.stats)) {
          statsArray = data.stats
        } else {
          try {
            statsArray = JSON.parse(data.stats || '[]')
          } catch (parseError) {
            console.error('❌ JSON parse error:', parseError)
            statsArray = []
          }
        }
        
        console.log('📊 Parsed stats array:', statsArray)
        
        // Format for UI
        const formattedStats = statsArray.map(stat => ({
          ...stat,
          isEditing: false,
          originalData: { ...stat }
        }))
        
        setStats(formattedStats)
        console.log(`✅ Loaded ${formattedStats.length} statistics`)
      } else {
        console.log('ℹ️ No stats found in database, starting with empty array')
        setStats([])
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      alert('Error loading statistics')
      setStats([])
    } finally {
      setLoading(false)
    }
  }

  // Save stats to database
  const saveStatsToDatabase = async (statsToSave) => {
    try {
      setSaving(true)
      console.log('💾 Saving to database:', statsToSave)
      
      const { data, error } = await supabase
        .from('classicqueen')
        .update({ 
          stats: statsToSave,
          updated_at: new Date().toISOString()
        })
        .eq('id', TABLE_ID)
        .select()

      if (error) {
        console.error('❌ Database save error:', error)
        throw new Error(`Save failed: ${error.message}`)
      }

      console.log('✅ Database save successful:', data)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Save operation failed:', error)
      return { success: false, error: error.message }
    } finally {
      setSaving(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchStats()
  }, [])

  // Icon options
  const iconOptions = [
    'FiUser', 'FiMapPin', 'FiTrophy', 'FaCrown', 
    'FiUsers', 'FiCalendar', 'FiDollarSign', 'FiAward',
    'FiGlobe', 'FiStar', 'FiHeart', 'FiFlag'
  ]

  // ===== CRUD OPERATIONS =====

  // ADD new statistic
  const handleAddStat = async () => {
    if (!newStat.icon || !newStat.title.trim() || !newStat.value.trim()) {
      alert('Please fill in all fields')
      return
    }
    
    const statToAdd = { 
      icon: newStat.icon, 
      title: newStat.title.trim(), 
      value: newStat.value.trim() 
    }
    
    // Create updated array
    const statsToSave = [
      ...stats.map(({ isEditing, originalData, ...rest }) => rest),
      statToAdd
    ]
    
    // Save to database
    const result = await saveStatsToDatabase(statsToSave)
    
    if (result.success) {
      // Update local state
      const updatedStats = [
        ...stats,
        { ...statToAdd, isEditing: false, originalData: { ...statToAdd } }
      ]
      setStats(updatedStats)
      
      // Reset form
      setIsAddingNew(false)
      setNewStat({ icon: '', title: '', value: '' })
      alert('✅ Statistic added successfully!')
    } else {
      alert(`❌ Failed to save: ${result.error}`)
      await fetchStats() // Refresh from database
    }
  }

  // EDIT existing statistic
  const startEditing = (index) => {
    const updatedStats = [...stats]
    updatedStats[index] = { 
      ...updatedStats[index], 
      isEditing: true 
    }
    setStats(updatedStats)
  }

  const cancelEditing = (index) => {
    const updatedStats = [...stats]
    updatedStats[index] = { 
      ...updatedStats[index].originalData,
      isEditing: false,
      originalData: { ...updatedStats[index].originalData }
    }
    setStats(updatedStats)
  }

  const updateStatField = (index, field, value) => {
    const updatedStats = [...stats]
    updatedStats[index] = { 
      ...updatedStats[index], 
      [field]: value 
    }
    setStats(updatedStats)
  }

  const saveEdit = async (index) => {
    const stat = stats[index]
    if (!stat.icon || !stat.title.trim() || !stat.value.trim()) {
      alert('Please fill in all fields')
      return
    }
    
    const statToSave = { 
      icon: stat.icon, 
      title: stat.title.trim(), 
      value: stat.value.trim() 
    }
    
    // Create updated array
    const updatedStats = [...stats]
    updatedStats[index] = { 
      ...statToSave, 
      isEditing: false,
      originalData: { ...statToSave }
    }
    
    const statsToSave = updatedStats.map(({ isEditing, originalData, ...rest }) => rest)
    
    // Save to database
    const result = await saveStatsToDatabase(statsToSave)
    
    if (result.success) {
      setStats(updatedStats)
      alert('✅ Changes saved successfully!')
    } else {
      alert(`❌ Failed to save: ${result.error}`)
      cancelEditing(index)
      await fetchStats() // Refresh from database
    }
  }

  // DELETE statistic
  const handleDelete = async (index) => {
    const statTitle = stats[index].title
    if (!confirm(`Are you sure you want to delete "${statTitle}"?`)) return
    
    // Create updated array without the deleted item
    const updatedStats = stats.filter((_, i) => i !== index)
    const statsToSave = updatedStats.map(({ isEditing, originalData, ...rest }) => rest)
    
    // Save to database
    const result = await saveStatsToDatabase(statsToSave)
    
    if (result.success) {
      setStats(updatedStats)
      alert(`✅ "${statTitle}" deleted successfully!`)
    } else {
      alert(`❌ Failed to delete: ${result.error}`)
      await fetchStats() // Refresh from database
    }
  }

  // BULK save all
  const handleBulkUpdate = async () => {
    if (!confirm('Save all current changes to database?')) return
    
    const statsToSave = stats.map(({ isEditing, originalData, ...rest }) => rest)
    const result = await saveStatsToDatabase(statsToSave)
    
    if (result.success) {
      alert('✅ All statistics saved to database!')
    } else {
      alert(`❌ Failed to save: ${result.error}`)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading statistics from database...</p>
            <p className="text-sm text-gray-500 mt-2">Table ID: {TABLE_ID}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistics Manager</h1>
          <p className="text-gray-600 mt-1">Database Table ID: {TABLE_ID}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchStats}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleBulkUpdate}
            disabled={saving || stats.length === 0}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All'}
          </button>
          <button
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {/* Database Status */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-700">Statistics in Database:</span>
            <span className="ml-2 text-xl font-bold text-blue-700">{stats.length}</span>
            <span className="ml-4 text-sm text-gray-600">
              Table: classicqueen • ID: {TABLE_ID}
            </span>
          </div>
          {saving && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Saving to database...
            </div>
          )}
        </div>
      </div>

      {/* Add New Statistic Form */}
      {isAddingNew && (
        <div className="mb-8 p-6 border-2 border-green-200 bg-green-50 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-green-900">Add New Statistic</h3>
            <button
              onClick={() => setIsAddingNew(false)}
              className="text-gray-500 hover:text-gray-700"
              disabled={saving}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <select
                value={newStat.icon}
                onChange={(e) => setNewStat({...newStat, icon: e.target.value})}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={saving}
              >
                <option value="">Select Icon</option>
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={newStat.title}
                onChange={(e) => setNewStat({...newStat, title: e.target.value})}
                placeholder="e.g., Candidates, Host Country"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
              <input
                type="text"
                value={newStat.value}
                onChange={(e) => setNewStat({...newStat, value: e.target.value})}
                placeholder="e.g., Global, $10,000"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={saving}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsAddingNew(false)}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={handleAddStat}
              disabled={saving || !newStat.icon || !newStat.title.trim() || !newStat.value.trim()}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg inline-flex items-center transition-colors"
            >
              <Check className="h-4 w-4 mr-2" />
              {saving ? 'Adding...' : 'Add Statistic'}
            </button>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.length > 0 ? stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-xl shadow-md border-2 p-5 transition-all hover:shadow-lg ${stat.isEditing ? 'border-blue-300' : 'border-gray-100'}`}
          >
            {/* Header with actions */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-sm">
                    {stat.icon ? stat.icon.substring(0, 2) : 'IC'}
                  </span>
                </div>
                <span className="ml-3 text-sm font-semibold text-gray-900 truncate">
                  {stat.icon}
                </span>
              </div>
              
              <div className="flex gap-2">
                {stat.isEditing ? (
                  <>
                    <button
                      onClick={() => cancelEditing(index)}
                      className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title="Cancel"
                      disabled={saving}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => saveEdit(index)}
                      className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title="Save"
                      disabled={saving}
                    >
                      <Save className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEditing(index)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                      disabled={saving}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                      disabled={saving}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Editable/View content */}
            <div className="space-y-3">
              {stat.isEditing ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                    <select
                      value={stat.icon}
                      onChange={(e) => updateStatField(index, 'icon', e.target.value)}
                      className="w-full text-sm rounded border border-gray-300 px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                      disabled={saving}
                    >
                      <option value="">Select Icon</option>
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={stat.title}
                      onChange={(e) => updateStatField(index, 'title', e.target.value)}
                      className="w-full text-sm rounded border border-gray-300 px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => updateStatField(index, 'value', e.target.value)}
                      className="w-full text-sm rounded border border-gray-300 px-2 py-1.5 focus:ring-1 focus:ring-blue-500"
                      disabled={saving}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h4 className="text-lg font-bold text-gray-900 truncate">{stat.title}</h4>
                  <p className="text-3xl font-bold text-blue-700">{stat.value}</p>
                </>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Statistics in Database</h3>
              <p className="text-gray-600 mb-4">Table ID {TABLE_ID} has no statistics yet</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={fetchStats}
                  className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Check Database Again'}
                </button>
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg inline-flex items-center justify-center"
                  disabled={saving}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Statistic
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Database Connection Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-2">Database Connection</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• Connected to: <code className="bg-gray-100 px-1 rounded">classicqueen</code> table</div>
          <div>• Row ID: <code className="bg-gray-100 px-1 rounded">{TABLE_ID}</code></div>
          <div>• Column: <code className="bg-gray-100 px-1 rounded">stats (JSONB)</code></div>
          <div>• All changes are saved directly to your Supabase database</div>
        </div>
      </div>
    </div>
  )
}