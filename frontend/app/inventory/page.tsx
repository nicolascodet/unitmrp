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
import { API_ENDPOINTS, fetchApi, searchParts, type Part } from '@/lib/api'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Supplier {
  id: number
  name: string
  lead_time_days: number
}

interface Material {
  id: number
  name: string
  type: string
  supplier: {
    id: number
    name: string
    lead_time_days: number
  }
  price: number
  moq: number
  reorder_point: number
  specifications: any
}

interface InventoryItem {
  id: number
  material: Material
  quantity: number
  location: string
  status: string
}

interface PurchaseOrder {
  id: number
  po_number: string
  supplier: {
    name: string
  }
  expected_delivery: string
  status: string
  items: PurchaseOrderItem[]
}

interface PurchaseOrderItem {
  id: number
  material: Material
  quantity: number
  unit_price: number
  received_quantity: number
  status: string
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierSearch, setSupplierSearch] = useState('')
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  })
  const [isAddingMaterial, setIsAddingMaterial] = useState(false)
  const [isCreatingPO, setIsCreatingPO] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    type: 'raw',
    supplier_id: 0,
    price: 0,
    moq: 0,
    lead_time_days: 0,
    reorder_point: 0,
    specifications: {}
  })
  const [newPO, setNewPO] = useState({
    supplier_id: 0,
    items: [{ material_id: 0, quantity: 1, unit_price: 0 }]
  })
  const [partSearch, setPartSearch] = useState('')
  const [parts, setParts] = useState<Part[]>([])

  useEffect(() => {
    fetchInventory()
    fetchPurchaseOrders()
    fetchSuppliers()
  }, [])

  const fetchInventory = async () => {
    try {
      const data = await fetchApi<InventoryItem[]>(API_ENDPOINTS.INVENTORY)
      setInventory(data)
    } catch (error) {
      console.error('Error fetching inventory:', error)
    }
  }

  const fetchPurchaseOrders = async () => {
    try {
      const data = await fetchApi<PurchaseOrder[]>(API_ENDPOINTS.PURCHASE_ORDERS)
      setPurchaseOrders(data)
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const data = await fetchApi<Supplier[]>(API_ENDPOINTS.SUPPLIERS)
      setSuppliers(data)
      if (data.length > 0) {
        setNewMaterial(prev => ({ ...prev, supplier_id: data[0].id }))
        setNewPO(prev => ({ ...prev, supplier_id: data[0].id }))
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
    }
  }

  const searchSuppliers = async (search: string) => {
    if (!search.trim()) {
      setSuppliers([])
      return
    }
    
    try {
      const data = await fetchApi<Supplier[]>(`${API_ENDPOINTS.SUPPLIERS}/search?query=${encodeURIComponent(search)}`)
      setSuppliers(data)
    } catch (err) {
      console.error('Search error:', err)
      setSuppliers([])
    }
  }

  // Debounce supplier search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (supplierSearch) {
        searchSuppliers(supplierSearch)
      } else {
        setSuppliers([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [supplierSearch])

  const handleCreateSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await fetch(API_ENDPOINTS.SUPPLIERS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSupplier),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Create supplier failed:', errorText)
        throw new Error(`Failed to create supplier: ${errorText}`)
      }
      
      const supplier = await response.json()
      setNewMaterial(prev => ({
        ...prev,
        supplier_id: supplier.id
      }))
      setShowSupplierForm(false)
      setSupplierSearch(supplier.name)
    } catch (err) {
      console.error('Create supplier error:', err)
    }
  }

  const handleAddMaterial = async () => {
    try {
      await fetchApi(API_ENDPOINTS.MATERIALS, {
        method: 'POST',
        body: JSON.stringify(newMaterial),
      })

      setIsAddingMaterial(false)
      setNewMaterial({
        name: '',
        type: 'raw',
        supplier_id: suppliers[0]?.id || 0,
        price: 0,
        moq: 0,
        lead_time_days: 0,
        reorder_point: 0,
        specifications: {}
      })
      fetchInventory()
    } catch (error) {
      console.error('Error adding material:', error)
    }
  }

  const handleCreatePO = async () => {
    if (!selectedDate) return

    try {
      await fetchApi(API_ENDPOINTS.PURCHASE_ORDERS, {
        method: 'POST',
        body: JSON.stringify({
          ...newPO,
          expected_delivery: selectedDate.toISOString(),
          status: 'draft'
        }),
      })

      setIsCreatingPO(false)
      setNewPO({
        supplier_id: suppliers[0]?.id || 0,
        items: [{ material_id: 0, quantity: 1, unit_price: 0 }]
      })
      setSelectedDate(undefined)
      fetchPurchaseOrders()
    } catch (error) {
      console.error('Error creating purchase order:', error)
    }
  }

  const generatePurchaseOrder = (material: Material) => {
    setNewPO({
      supplier_id: material.supplier.id,
      items: [{
        material_id: material.id,
        quantity: material.moq,
        unit_price: material.price
      }]
    })
    setIsCreatingPO(true)
  }

  // Debounce part search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (partSearch) {
        searchParts(partSearch)
          .then((data: Part[]) => setParts(data))
          .catch(console.error)
      } else {
        setParts([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [partSearch])

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Inventory</CardTitle>
            <Dialog open={isAddingMaterial} onOpenChange={setIsAddingMaterial}>
              <DialogTrigger asChild>
                <Button>Add Material</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Material</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="part_number">Part Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="part_number"
                        value={partSearch}
                        onChange={(e) => setPartSearch(e.target.value)}
                        placeholder="Search part numbers..."
                      />
                    </div>
                    {parts.length > 0 && (
                      <div className="relative mt-1">
                        <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg">
                          {parts.map((part) => (
                            <div
                              key={part.id}
                              className="p-2 hover:bg-accent cursor-pointer"
                              onClick={() => {
                                setNewMaterial(prev => ({
                                  ...prev,
                                  name: part.part_number,
                                  description: part.description
                                }))
                                setPartSearch(part.part_number)
                                setParts([])
                              }}
                            >
                              <div>{part.part_number}</div>
                              <div className="text-sm text-muted-foreground">{part.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="name">Material Name</Label>
                    <Input
                      id="name"
                      value={newMaterial.name}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newMaterial.type}
                      onValueChange={(value) => setNewMaterial(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="raw">Raw Material</SelectItem>
                        <SelectItem value="component">Component</SelectItem>
                        <SelectItem value="finished">Finished Good</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <div className="flex gap-2">
                      <Input
                        value={supplierSearch}
                        onChange={(e) => setSupplierSearch(e.target.value)}
                        placeholder="Search suppliers..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowSupplierForm(true)}
                      >
                        New
                      </Button>
                    </div>
                    {suppliers.length > 0 && (
                      <div className="relative mt-1">
                        <div className="absolute z-10 w-full bg-background border rounded-md shadow-lg">
                          {suppliers.map((supplier) => (
                            <div
                              key={supplier.id}
                              className="p-2 hover:bg-accent cursor-pointer"
                              onClick={() => {
                                setNewMaterial(prev => ({ ...prev, supplier_id: supplier.id }))
                                setSupplierSearch(supplier.name)
                                setSuppliers([])
                              }}
                            >
                              {supplier.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newMaterial.price}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="moq">Minimum Order Quantity</Label>
                    <Input
                      id="moq"
                      type="number"
                      value={newMaterial.moq}
                      onChange={(e) => setNewMaterial(prev => ({ ...prev, moq: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <Button onClick={handleAddMaterial}>Add Material</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showSupplierForm} onOpenChange={setShowSupplierForm}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Supplier</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSupplier}>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Label htmlFor="name">Supplier Name</Label>
                      <Input
                        id="name"
                        value={newSupplier.name}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newSupplier.email}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newSupplier.phone}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={newSupplier.address}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={newSupplier.notes}
                        onChange={(e) => setNewSupplier(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <Button type="submit">Create Supplier</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.material.name}</TableCell>
                    <TableCell>{item.material.type}</TableCell>
                    <TableCell>{item.material.supplier.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        onClick={() => generatePurchaseOrder(item.material)}
                      >
                        Create PO
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isCreatingPO} onOpenChange={setIsCreatingPO}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create Purchase Order</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="supplier">Supplier</Label>
                    <Select
                      value={newPO.supplier_id.toString()}
                      onValueChange={(value) => setNewPO(prev => ({ ...prev, supplier_id: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(supplier => (
                          <SelectItem key={supplier.id} value={supplier.id.toString()}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Expected Delivery Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
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
                  <Button onClick={handleCreatePO}>Create Purchase Order</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Expected Delivery</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell>{po.po_number}</TableCell>
                    <TableCell>{po.supplier.name}</TableCell>
                    <TableCell>{format(new Date(po.expected_delivery), "PPP")}</TableCell>
                    <TableCell>{po.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 