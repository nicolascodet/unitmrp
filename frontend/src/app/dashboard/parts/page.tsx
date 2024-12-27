'use client'

import { useEffect, useState, ChangeEvent } from 'react'
import { fetchApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Part {
  id: number
  part_number: string
  description: string
  customer: string
  material: string
  cycle_time: number
  price: number
  compatible_machines: string[]
  setup_time: number
}

interface NewPart extends Omit<Part, 'id'> {}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [newPart, setNewPart] = useState<NewPart>({
    part_number: '',
    description: '',
    customer: '',
    material: '',
    cycle_time: 0,
    price: 0,
    compatible_machines: [],
    setup_time: 0
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchParts()
  }, [])

  async function fetchParts() {
    try {
      const data = await fetchApi<Part[]>('/parts')
      setParts(data)
    } catch (error) {
      console.error('Failed to fetch parts:', error)
    }
  }

  async function handleCreatePart() {
    try {
      await fetchApi('/parts', {
        method: 'POST',
        body: JSON.stringify(newPart)
      })
      setIsDialogOpen(false)
      setNewPart({
        part_number: '',
        description: '',
        customer: '',
        material: '',
        cycle_time: 0,
        price: 0,
        compatible_machines: [],
        setup_time: 0
      })
      fetchParts()
    } catch (error) {
      console.error('Failed to create part:', error)
    }
  }

  const handleInputChange = (field: keyof NewPart) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    setNewPart({ ...newPart, [field]: value })
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Parts Management</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New Part</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Part</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new part.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="part_number" className="text-right">Part Number</Label>
                  <Input
                    id="part_number"
                    value={newPart.part_number}
                    onChange={handleInputChange('part_number')}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">Description</Label>
                  <Input
                    id="description"
                    value={newPart.description}
                    onChange={handleInputChange('description')}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customer" className="text-right">Customer</Label>
                  <Input
                    id="customer"
                    value={newPart.customer}
                    onChange={handleInputChange('customer')}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="material" className="text-right">Material</Label>
                  <Input
                    id="material"
                    value={newPart.material}
                    onChange={handleInputChange('material')}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cycle_time" className="text-right">Cycle Time (min)</Label>
                  <Input
                    id="cycle_time"
                    type="number"
                    value={newPart.cycle_time}
                    onChange={handleInputChange('cycle_time')}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newPart.price}
                    onChange={handleInputChange('price')}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="setup_time" className="text-right">Setup Time (min)</Label>
                  <Input
                    id="setup_time"
                    type="number"
                    value={newPart.setup_time}
                    onChange={handleInputChange('setup_time')}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreatePart}>Create Part</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Parts Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Part Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Cycle Time (min)</TableHead>
                  <TableHead>Price ($)</TableHead>
                  <TableHead>Setup Time (min)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parts.map((part) => (
                  <TableRow key={part.id}>
                    <TableCell>{part.part_number}</TableCell>
                    <TableCell>{part.description}</TableCell>
                    <TableCell>{part.customer}</TableCell>
                    <TableCell>{part.material}</TableCell>
                    <TableCell>{part.cycle_time}</TableCell>
                    <TableCell>{part.price}</TableCell>
                    <TableCell>{part.setup_time}</TableCell>
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