'use client'

import { useState, useEffect } from 'react'
import { API_ENDPOINTS, fetchApi } from '@/lib/api'

interface Order {
  id: number
  order_number: string
  customer: string
  items: OrderItem[]
  due_date: string
  status: string
}

interface OrderItem {
  id: number
  part_id: number
  quantity: number
  status: string
  part: {
    part_number: string
    description: string
  }
}

interface ProductionRun {
  id: number
  order_id: number
  order_item_id: number
  quantity: number
  status: string
  start_date?: string
  end_date?: string
}

export default function ProductionRunsPage() {
  const [showForm, setShowForm] = useState(false)
  const [runs, setRuns] = useState<ProductionRun[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [orderSearch, setOrderSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrderItem, setSelectedOrderItem] = useState<OrderItem | null>(null)
  const [formData, setFormData] = useState({
    order_id: 0,
    order_item_id: 0,
    quantity: 0,
    status: 'Pending'
  })

  useEffect(() => {
    fetchRuns()
  }, [])

  const fetchRuns = async () => {
    try {
      const data = await fetchApi<ProductionRun[]>(API_ENDPOINTS.PRODUCTION_RUNS)
      setRuns(data)
    } catch (error) {
      console.error('Error fetching runs:', error)
    }
  }

  const searchOrders = async (search: string) => {
    if (!search.trim()) {
      setOrders([])
      return
    }
    
    try {
      const data = await fetchApi<Order[]>(`${API_ENDPOINTS.ORDERS}/search?query=${encodeURIComponent(search)}`)
      setOrders(data)
    } catch (err) {
      console.error('Search error:', err)
      setOrders([])
    }
  }

  // Debounce order search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (orderSearch) {
        searchOrders(orderSearch)
      } else {
        setOrders([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [orderSearch])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await fetchApi(API_ENDPOINTS.PRODUCTION_RUNS, {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      alert('Production run created successfully!')
      setShowForm(false)
      setFormData({
        order_id: 0,
        order_item_id: 0,
        quantity: 0,
        status: 'Pending'
      })
      setSelectedOrder(null)
      setSelectedOrderItem(null)
      fetchRuns()
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
              <label className="block text-sm font-medium mb-1">Order Number</label>
              <div className="relative">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Search for order number..."
                  required
                />
                {orders.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order)
                          setFormData(prev => ({ ...prev, order_id: order.id }))
                          setOrderSearch(order.order_number)
                          setOrders([])
                        }}
                      >
                        {order.order_number} - {order.customer}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedOrder && (
              <div>
                <label className="block text-sm font-medium mb-1">Part</label>
                <select
                  value={selectedOrderItem?.id || ''}
                  onChange={(e) => {
                    const item = selectedOrder.items.find(i => i.id === parseInt(e.target.value))
                    setSelectedOrderItem(item || null)
                    setFormData(prev => ({
                      ...prev,
                      order_item_id: parseInt(e.target.value),
                      quantity: 0
                    }))
                  }}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select a part</option>
                  {selectedOrder.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.part.part_number} - {item.part.description} (Total: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedOrderItem && (
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  className="w-full p-2 border rounded"
                  min="1"
                  max={selectedOrderItem.quantity}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Remaining quantity: {selectedOrderItem.quantity - formData.quantity}
                </p>
              </div>
            )}

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
                onClick={() => {
                  setShowForm(false)
                  setSelectedOrder(null)
                  setSelectedOrderItem(null)
                }} 
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid gap-4">
        {runs.map((run) => (
          <div key={run.id} className="bg-white shadow rounded-lg p-6">
            <h3 className="font-bold mb-2">Order #{run.order_id}</h3>
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