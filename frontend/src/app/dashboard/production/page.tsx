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

interface ProductionRun {
  id: number
  part_id: number
  quantity: number
  start_time: string
  end_time: string | null
  status: string
}

export default function ProductionPage() {
  const [productionRuns, setProductionRuns] = useState<ProductionRun[]>([])

  useEffect(() => {
    async function fetchProductionRuns() {
      try {
        const data = await fetchApi<ProductionRun[]>('/production-runs')
        setProductionRuns(data)
      } catch (error) {
        console.error('Failed to fetch production runs:', error)
      }
    }
    fetchProductionRuns()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Production Management</h2>
        <div className="flex items-center space-x-2">
          <Button>Start New Production Run</Button>
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