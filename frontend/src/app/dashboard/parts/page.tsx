'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Customer {
  id: number
  name: string
  contact: string
  email: string
  phone: string
  address: string
}

interface Material {
  id: number
  name: string
  type: string
  unit: string
  quantity: number
}

interface Part {
  id: number
  part_number: string
  description: string
  customer_id: number
  material_id: number
  setup_time: number
  cycle_time: number
  price: number
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [isAddingPart, setIsAddingPart] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newPart, setNewPart] = useState({
    part_number: "",
    description: "",
    customer_id: "",
    material_id: "",
    setup_time: "",
    cycle_time: "",
    price: "",
  })

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        await Promise.all([
          fetchParts(),
          fetchCustomers(),
          fetchMaterials()
        ])
      } catch (error) {
        console.error("Error loading data:", error)
        setError("Failed to load data")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const fetchParts = async () => {
    try {
      const response = await fetch("http://localhost:8000/parts")
      if (!response.ok) throw new Error("Failed to fetch parts")
      const data = await response.json()
      setParts(data)
    } catch (error) {
      console.error("Error fetching parts:", error)
      throw error
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://localhost:8000/customers")
      if (!response.ok) throw new Error("Failed to fetch customers")
      const data = await response.json()
      setCustomers(data || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
      throw error
    }
  }

  const fetchMaterials = async () => {
    try {
      const response = await fetch("http://localhost:8000/materials")
      if (!response.ok) throw new Error("Failed to fetch materials")
      const data = await response.json()
      setMaterials(data || [])
    } catch (error) {
      console.error("Error fetching materials:", error)
      throw error
    }
  }

  const addPart = async () => {
    try {
      setError(null)
      setIsLoading(true)

      if (!newPart.part_number || !newPart.customer_id || !newPart.material_id) {
        throw new Error('Required fields are missing')
      }

      const response = await fetch("http://localhost:8000/parts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          part_number: newPart.part_number,
          description: newPart.description,
          customer_id: parseInt(newPart.customer_id),
          material_id: parseInt(newPart.material_id),
          setup_time: parseFloat(newPart.setup_time) || 0,
          cycle_time: parseFloat(newPart.cycle_time) || 0,
          price: parseFloat(newPart.price) || 0,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to create part')
      }

      await fetchParts()
      setIsAddingPart(false)
      setNewPart({
        part_number: "",
        description: "",
        customer_id: "",
        material_id: "",
        setup_time: "",
        cycle_time: "",
        price: "",
      })
    } catch (error) {
      console.error("Error adding part:", error)
      setError(error instanceof Error ? error.message : 'Failed to create part')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter out any items with undefined or empty IDs
  const validCustomers = customers.filter(customer => customer.id != null && customer.id !== 0)
  const validMaterials = materials.filter(material => material.id != null && material.id !== 0)

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Parts</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Parts</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Parts</h2>
        <Button onClick={() => setIsAddingPart(true)}>Create Part</Button>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Parts List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Setup Time</TableHead>
                    <TableHead>Cycle Time</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell>{part.part_number}</TableCell>
                      <TableCell>{part.description}</TableCell>
                      <TableCell>
                        {customers.find(c => c.id === part.customer_id)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {materials.find(m => m.id === part.material_id)?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{part.setup_time}</TableCell>
                      <TableCell>{part.cycle_time}</TableCell>
                      <TableCell>${part.price.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAddingPart} onOpenChange={setIsAddingPart}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Part Number</Label>
              <Input
                value={newPart.part_number}
                onChange={(e) =>
                  setNewPart({ ...newPart, part_number: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={newPart.description}
                onChange={(e) =>
                  setNewPart({ ...newPart, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={newPart.customer_id || undefined}
                onValueChange={(value) =>
                  setNewPart({ ...newPart, customer_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer..." />
                </SelectTrigger>
                <SelectContent>
                  {validCustomers.map((customer) => (
                    <SelectItem 
                      key={customer.id} 
                      value={customer.id.toString()}
                    >
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Material</Label>
              <Select
                value={newPart.material_id || undefined}
                onValueChange={(value) =>
                  setNewPart({ ...newPart, material_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material..." />
                </SelectTrigger>
                <SelectContent>
                  {validMaterials.map((material) => (
                    <SelectItem 
                      key={material.id} 
                      value={material.id.toString()}
                    >
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Setup Time (min)</Label>
                <Input
                  type="number"
                  value={newPart.setup_time}
                  onChange={(e) =>
                    setNewPart({ ...newPart, setup_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Cycle Time (sec)</Label>
                <Input
                  type="number"
                  value={newPart.cycle_time}
                  onChange={(e) =>
                    setNewPart({ ...newPart, cycle_time: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={newPart.price}
                  onChange={(e) =>
                    setNewPart({ ...newPart, price: e.target.value })
                  }
                />
              </div>
            </div>
            <Button
              className="w-full"
              onClick={addPart}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Part"}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 