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

  const fetchProductionRuns = async () => {
    try {
      const data = await fetchApi<ProductionRun[]>('/production-runs')
      setProductionRuns(data)
    } catch (error) {
      console.error('Failed to fetch production runs:', error)
    }
  }

  const fetchParts = async () => {
    try {
      const data = await fetchApi<Part[]>('/parts')
      setParts(data)
    } catch (error) {
      console.error('Failed to fetch parts:', error)
    }
  }

  useEffect(() => {
    fetchProductionRuns()
    fetchParts()
  }, [])

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
      fetchProductionRuns()
    } catch (error) {
      console.error('Failed to create production run:', error)
    }
  }

  const handleInputChange = (field: keyof NewProductionRun) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value
    setNewRun({ ...newRun, [field]: value })
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
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Production Run</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new production run.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="part_id" className="text-right">Part</Label>
                  <select
                    id="part_id"
                    value={newRun.part_id}
                    onChange={handleInputChange('part_id')}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value={0}>Select a part</option>
                    {parts.map((part) => (
                      <option key={part.id} value={part.id}>
                        {part.part_number} - {part.description}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={newRun.quantity}
                    onChange={handleInputChange('quantity')}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateRun}>Start Production Run</Button>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Part ID</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>{run.id}</TableCell>
                    <TableCell>{run.part_id}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 