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

interface QualityCheck {
  id: number
  part_id: number
  check_date: string
  quantity_checked: number
  quantity_rejected: number
  notes: string | null
  status: string
}

export default function QualityPage() {
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([])

  useEffect(() => {
    async function fetchQualityChecks() {
      try {
        const data = await fetchApi<QualityCheck[]>('/quality-checks')
        setQualityChecks(data)
      } catch (error) {
        console.error('Failed to fetch quality checks:', error)
      }
    }
    fetchQualityChecks()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Quality Control</h2>
        <div className="flex items-center space-x-2">
          <Button>New Quality Check</Button>
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Quality Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Part ID</TableHead>
                  <TableHead>Check Date</TableHead>
                  <TableHead>Quantity Checked</TableHead>
                  <TableHead>Quantity Rejected</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualityChecks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell>{check.id}</TableCell>
                    <TableCell>{check.part_id}</TableCell>
                    <TableCell>{new Date(check.check_date).toLocaleString()}</TableCell>
                    <TableCell>{check.quantity_checked}</TableCell>
                    <TableCell>{check.quantity_rejected}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 