'use client'

import { useEffect, useState, ChangeEvent, useCallback } from 'react'
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

interface BOMItem {
  part_id: number
  part_number: string
  quantity: number
}

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
  bom_items?: BOMItem[]
}

interface ProductionRun {
  id: number
  part_id: number
  quantity: number
  start_time: string
  end_time: string | null
  status: string
}

interface NewProductionRun {
  part_id: number
  quantity: number
  start_time: string
  status: string
}

export default function ProductionPage() {
  const [productionRuns, setProductionRuns] = useState<ProductionRun[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [newRun, setNewRun] = useState<NewProductionRun>({
    part_id: 0,
    quantity: 0,
    start_time: new Date().toISOString(),
    status: 'pending'
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [partSearch, setPartSearch] = useState('')
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [bomItems, setBomItems] = useState<BOMItem[]>([])

  const fetchProductionRuns = useCallback(async () => {
    try {
      const data = await fetchApi<ProductionRun[]>('/production-runs')
      setProductionRuns(data)
    } catch (error) {
      console.error('Failed to fetch production runs:', error)
    }
  }, [])

  const fetchParts = useCallback(async () => {
    try {
      const data = await fetchApi<Part[]>('/parts')
      setParts(data)
    } catch (error) {
      console.error('Failed to fetch parts:', error)
    }
  }, [])

  useEffect(() => {
    fetchProductionRuns()
    fetchParts()
  }, [fetchProductionRuns, fetchParts])

  useEffect(() => {
    if (partSearch.trim()) {
      const filtered = parts.filter(
        part => part.part_number.toLowerCase().includes(partSearch.toLowerCase())
      )
      setFilteredParts(filtered)
    } else {
      setFilteredParts([])
    }
  }, [partSearch, parts])

  const handleCreateRun = async () => {
    try {
      await fetchApi('/production-runs', {
        method: 'POST',
        body: JSON.stringify(newRun)
      })
      setIsDialogOpen(false)
      setNewRun({
        part_id: 0,
        quantity: 0,
        start_time: new Date().toISOString(),
        status: 'pending'
      })
      setSelectedPart(null)
      setBomItems([])
      setPartSearch('')
      fetchProductionRuns()
    } catch (error) {
      console.error('Failed to create production run:', error)
    }
  }

  const handleSelectPart = (part: Part) => {
    setSelectedPart(part)
    setNewRun({
      ...newRun,
      part_id: part.id
    })
    setBomItems(part.bom_items || [])
    setPartSearch(part.part_number)
    setFilteredParts([])
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Production Management</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Start New Production Run</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Start New Production Run</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new production run.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Part</Label>
                      <div className="relative">
                        <Input
                          value={partSearch}
                          onChange={(e) => setPartSearch(e.target.value)}
                          placeholder="Search for a part number"
                        />
                        {filteredParts.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-white shadow-lg">
                            {filteredParts.map((part) => (
                              <button
                                key={part.id}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:outline-none"
                                onClick={() => handleSelectPart(part)}
                              >
                                {part.part_number} - {part.description}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {selectedPart && (
                      <>
                        <div className="space-y-2">
                          <Label>Customer</Label>
                          <Input value={selectedPart.customer} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input value={selectedPart.description} disabled />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Cycle Time (min)</Label>
                            <Input value={selectedPart.cycle_time} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>Setup Time (min)</Label>
                            <Input value={selectedPart.setup_time} disabled />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="quantity">Production Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={newRun.quantity}
                            onChange={(e) => setNewRun({ ...newRun, quantity: parseInt(e.target.value) })}
                            min={1}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {selectedPart && bomItems.length > 0 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Bill of Materials</Label>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Part Number</TableHead>
                                <TableHead>Quantity per Unit</TableHead>
                                <TableHead>Total Quantity</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {bomItems.map((item) => (
                                <TableRow key={item.part_id}>
                                  <TableCell>{item.part_number}</TableCell>
                                  <TableCell>{item.quantity}</TableCell>
                                  <TableCell>{item.quantity * newRun.quantity}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateRun} disabled={!selectedPart || newRun.quantity < 1}>
                  Start Production Run
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Production Runs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productionRuns.map((run) => {
                    const part = parts.find(p => p.id === run.part_id)
                    return (
                      <TableRow key={run.id}>
                        <TableCell>{run.id}</TableCell>
                        <TableCell>{part?.part_number || run.part_id}</TableCell>
                        <TableCell>{run.quantity}</TableCell>
                        <TableCell>{new Date(run.start_time).toLocaleString()}</TableCell>
                        <TableCell>
                          {run.end_time ? new Date(run.end_time).toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            run.status === 'completed' ? 'bg-green-100 text-green-800' :
                            run.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {run.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 