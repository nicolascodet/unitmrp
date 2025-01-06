'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { API_ENDPOINTS, fetchApi } from '@/lib/api'

interface Order {
  id: number
  order_number: string
  customer: string
  due_date: string
  status: string
  items: OrderItem[]
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

interface Part {
  id: number
  part_number: string
  description: string
  customer: string
}

export default function OpenOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [isAddingOrder, setIsAddingOrder] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [newOrder, setNewOrder] = useState({
    customer: '',
    items: [{ part_id: 0, quantity: 1, status: 'pending' }]
  })
  const [partSearch, setPartSearch] = useState('')
  const [filteredParts, setFilteredParts] = useState<Part[]>([])

  useEffect(() => {
    fetchOrders()
    fetchParts()
  }, [])

  useEffect(() => {
    if (partSearch) {
      setFilteredParts(
        parts.filter(part =>
          part.part_number.toLowerCase().includes(partSearch.toLowerCase()) ||
          part.description.toLowerCase().includes(partSearch.toLowerCase())
        )
      )
    } else {
      setFilteredParts([])
    }
  }, [partSearch, parts])

  const fetchOrders = async () => {
    try {
      const data = await fetchApi<Order[]>(API_ENDPOINTS.ORDERS)
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }

  const fetchParts = async () => {
    try {
      const data = await fetchApi<Part[]>(API_ENDPOINTS.PARTS)
      setParts(data)
    } catch (error) {
      console.error('Error fetching parts:', error)
    }
  }

  const handleCreateOrder = async () => {
    if (!selectedDate) return

    try {
      await fetchApi(API_ENDPOINTS.ORDERS, {
        method: 'POST',
        body: JSON.stringify({
          ...newOrder,
          due_date: selectedDate.toISOString(),
          status: 'open'
        }),
      })

      setIsAddingOrder(false)
      setNewOrder({
        customer: '',
        items: [{ part_id: 0, quantity: 1, status: 'pending' }]
      })
      setSelectedDate(undefined)
      fetchOrders()
    } catch (error) {
      console.error('Error creating order:', error)
    }
  }

  const selectPart = (part: Part) => {
    setNewOrder(prev => ({
      ...prev,
      customer: part.customer,
      items: [{ ...prev.items[0], part_id: part.id }]
    }))
    setPartSearch('')
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Open Orders</CardTitle>
          <Dialog open={isAddingOrder} onOpenChange={setIsAddingOrder}>
            <DialogTrigger asChild>
              <Button>Add Order</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="relative">
                  <Label htmlFor="part">Part Number</Label>
                  <Input
                    id="part"
                    value={partSearch}
                    onChange={(e) => setPartSearch(e.target.value)}
                    placeholder="Search for part number..."
                  />
                  {filteredParts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                      {filteredParts.map(part => (
                        <div
                          key={part.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => selectPart(part)}
                        >
                          {part.part_number} - {part.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Input
                    id="customer"
                    value={newOrder.customer}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, customer: e.target.value }))}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newOrder.items[0].quantity}
                    onChange={(e) => setNewOrder(prev => ({
                      ...prev,
                      items: [{ ...prev.items[0], quantity: parseInt(e.target.value) }]
                    }))}
                    min={1}
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Button onClick={handleCreateOrder} disabled={!selectedDate || !newOrder.customer || !newOrder.items[0].part_id}>
                  Create Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.order_number}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.items[0]?.part?.part_number}</TableCell>
                  <TableCell>{order.items[0]?.quantity}</TableCell>
                  <TableCell>{format(new Date(order.due_date), "PPP")}</TableCell>
                  <TableCell>{order.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 