'use client'

import { useEffect, useState, useCallback } from 'react'
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
}

interface QualityCheck {
  id: number
  part_id: number
  check_date: string
  quantity_checked: number
  quantity_rejected: number
  notes: string | null
  status: string
}

interface NewQualityCheck {
  part_id: number
  check_date: string
  quantity_checked: number
  quantity_rejected: number
  notes: string
  status: string
}

export default function QualityPage() {
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [newCheck, setNewCheck] = useState<NewQualityCheck>({
    part_id: 0,
    check_date: new Date().toISOString(),
    quantity_checked: 0,
    quantity_rejected: 0,
    notes: '',
    status: 'pending'
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [partSearch, setPartSearch] = useState('')
  const [filteredParts, setFilteredParts] = useState<Part[]>([])
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)

  const fetchQualityChecks = useCallback(async () => {
    try {
      const data = await fetchApi<QualityCheck[]>('/quality-checks')
      setQualityChecks(data)
    } catch (error) {
      console.error('Failed to fetch quality checks:', error)
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
    fetchQualityChecks()
    fetchParts()
  }, [fetchQualityChecks, fetchParts])

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

  const handleCreateCheck = async () => {
    try {
      const status = calculateStatus(newCheck.quantity_checked, newCheck.quantity_rejected)
      await fetchApi('/quality-checks', {
        method: 'POST',
        body: JSON.stringify({ ...newCheck, status })
      })
      setIsDialogOpen(false)
      setNewCheck({
        part_id: 0,
        check_date: new Date().toISOString(),
        quantity_checked: 0,
        quantity_rejected: 0,
        notes: '',
        status: 'pending'
      })
      setSelectedPart(null)
      setPartSearch('')
      fetchQualityChecks()
    } catch (error) {
      console.error('Failed to create quality check:', error)
    }
  }

  const handleSelectPart = (part: Part) => {
    setSelectedPart(part)
    setNewCheck({
      ...newCheck,
      part_id: part.id
    })
    setPartSearch(part.part_number)
    setFilteredParts([])
  }

  const calculateStatus = (checked: number, rejected: number) => {
    if (checked === 0) return 'pending'
    const rejectRate = (rejected / checked) * 100
    return rejectRate <= 5 ? 'passed' : 'failed'
  }

  const updateQuantities = (checked: number, rejected: number) => {
    setNewCheck({
      ...newCheck,
      quantity_checked: checked,
      quantity_rejected: Math.min(rejected, checked)
    })
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Quality Control</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>New Quality Check</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Quality Check</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new quality check.
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
                            <Label>Quantity Checked</Label>
                            <Input
                              type="number"
                              value={newCheck.quantity_checked}
                              onChange={(e) => updateQuantities(parseInt(e.target.value), newCheck.quantity_rejected)}
                              min={0}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity Rejected</Label>
                            <Input
                              type="number"
                              value={newCheck.quantity_rejected}
                              onChange={(e) => updateQuantities(newCheck.quantity_checked, parseInt(e.target.value))}
                              min={0}
                              max={newCheck.quantity_checked}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Input
                            value={newCheck.notes}
                            onChange={(e) => setNewCheck({ ...newCheck, notes: e.target.value })}
                            placeholder="Add any relevant notes"
                          />
                        </div>
                      </>
                    )}
                  </div>
                  {selectedPart && newCheck.quantity_checked > 0 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Quality Metrics</Label>
                        <div className="rounded-md border p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Rejection Rate</span>
                            <span className="font-medium">
                              {((newCheck.quantity_rejected / newCheck.quantity_checked) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Status</span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              calculateStatus(newCheck.quantity_checked, newCheck.quantity_rejected) === 'passed'
                                ? 'bg-green-100 text-green-800'
                                : calculateStatus(newCheck.quantity_checked, newCheck.quantity_rejected) === 'failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {calculateStatus(newCheck.quantity_checked, newCheck.quantity_rejected)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateCheck}
                  disabled={!selectedPart || newCheck.quantity_checked < 1}
                >
                  Create Quality Check
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quality Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead>Check Date</TableHead>
                    <TableHead>Quantity Checked</TableHead>
                    <TableHead>Quantity Rejected</TableHead>
                    <TableHead>Rejection Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualityChecks.map((check) => {
                    const part = parts.find(p => p.id === check.part_id)
                    const rejectionRate = ((check.quantity_rejected / check.quantity_checked) * 100).toFixed(1)
                    return (
                      <TableRow key={check.id}>
                        <TableCell>{check.id}</TableCell>
                        <TableCell>{part?.part_number || check.part_id}</TableCell>
                        <TableCell>{new Date(check.check_date).toLocaleString()}</TableCell>
                        <TableCell>{check.quantity_checked}</TableCell>
                        <TableCell>{check.quantity_rejected}</TableCell>
                        <TableCell>{rejectionRate}%</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            check.status === 'passed' ? 'bg-green-100 text-green-800' :
                            check.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {check.status}
                          </span>
                        </TableCell>
                        <TableCell>{check.notes || '-'}</TableCell>
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