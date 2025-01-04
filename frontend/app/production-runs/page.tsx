'use client'

import { useState, useEffect } from 'react'

export default function ProductionRunsPage() {
  const [showForm, setShowForm] = useState(false)
  const [runs, setRuns] = useState([])
  const [formData, setFormData] = useState({
    part_name: '',
    quantity: 0,
    status: 'Pending'
  })

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      const response = await fetch('http://localhost:8000/production-runs')
      if (response.ok) {
        const data = await response.json()
        setRuns(data)
      }
    } catch (error) {
      console.error('Error fetching runs:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/production-runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      if (response.ok) {
        alert('Production run created successfully!')
        setShowForm(false)
        setFormData({ part_name: '', quantity: 0, status: 'Pending' })
        fetchRuns() // Refresh the list
      }
    } catch (error) {
      alert('Failed to create production run')
    }
  }

  return (
    <main className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Production Runs</h1>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Add Production Run
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
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
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
        {runs.map((run: any, index: number) => (
          <div key={index} className="bg-white shadow rounded-lg p-6">
            <h3 className="font-bold mb-2">{run.part_name}</h3>
            <div className="space-y-1 text-sm">
              <p>Quantity: {run.quantity}</p>
              <p>Status: {run.status}</p>
              {run.start_date && <p>Start Date: {new Date(run.start_date).toLocaleDateString()}</p>}
              {run.end_date && <p>End Date: {new Date(run.end_date).toLocaleDateString()}</p>}
            </div>
          </div>
        ))}
        {runs.length === 0 && (
          <p className="text-gray-500 text-center">No production runs available</p>
        )}
      </div>
    </main>
  )
} 