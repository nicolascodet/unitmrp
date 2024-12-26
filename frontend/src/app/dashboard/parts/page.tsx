'use client'

import { useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([])

  useEffect(() => {
    async function fetchParts() {
      try {
        const data = await fetchApi<Part[]>('/parts')
        setParts(data)
      } catch (error) {
        console.error('Failed to fetch parts:', error)
      }
    }
    fetchParts()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Parts Management</h2>
        <div className="flex items-center space-x-2">
          <Button>Add New Part</Button>
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