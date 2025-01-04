'use client'

import { useState, useEffect } from 'react'

export default function QualityChecksPage() {
  const [showForm, setShowForm] = useState(false)
  const [checks, setChecks] = useState([])
  const [formData, setFormData] = useState({
    part_name: '',
    result: 'Pass',
    notes: ''
  })

  useEffect(() => {
    fetchChecks()
  }, [])

  const fetchChecks = async () => {
    try {
      const response = await fetch('http://localhost:8000/quality-checks')
      if (response.ok) {
        const data = await response.json()
        setChecks(data)
      }
    } catch (error) {
      console.error('Error fetching checks:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/quality-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        alert('Quality check created successfully!')
        setShowForm(false)
        setFormData({ part_name: '', result: 'Pass', notes: '' })
        fetchChecks() // Refresh the list
      }
    } catch (error) {
      alert('Failed to create quality check')
    }
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quality Checks</h1>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Quality Check
        </button>
      </div>
      
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Part Name</label>
              <input
                type="text"
                value={formData.part_name}
                onChange={(e) => setFormData({...formData, part_name: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Result</label>
              <select
                value={formData.result}
                onChange={(e) => setFormData({...formData, result: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="Pass">Pass</option>
                <option value="Fail">Fail</option>
                <option value="Pending Review">Pending Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <button 
                type="submit" 
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Create
              </button>
              <button 
                type="button"
                onClick={() => setShowForm(false)} 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid gap-4">
        {checks.map((check: any, index: number) => (
          <div key={index} className="bg-white shadow rounded-lg p-6">
            <h3 className="font-bold mb-2">{check.part_name}</h3>
            <div className="space-y-1 text-sm">
              <p>Result: {check.result}</p>
              {check.check_date && <p>Date: {new Date(check.check_date).toLocaleDateString()}</p>}
              {check.notes && <p>Notes: {check.notes}</p>}
            </div>
          </div>
        ))}
        {checks.length === 0 && (
          <p className="text-gray-500 text-center">No quality checks available</p>
        )}
      </div>
    </main>
  )
} 