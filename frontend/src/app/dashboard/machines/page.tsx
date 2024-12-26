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

interface Machine {
  id: number
  name: string
  status: boolean
  current_shifts: number
  hours_per_shift: number
  current_job: string | null
  last_updated: string
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([])

  useEffect(() => {
    async function fetchMachines() {
      try {
        const data = await fetchApi<Machine[]>('/machines')
        setMachines(data)
      } catch (error) {
        console.error('Failed to fetch machines:', error)
      }
    }
    fetchMachines()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Machine Management</h2>
        <div className="flex items-center space-x-2">
          <Button>Add New Machine</Button>
        </div>
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Machines</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Shifts</TableHead>
                  <TableHead>Hours/Shift</TableHead>
                  <TableHead>Current Job</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {machines.map((machine) => (
                  <TableRow key={machine.id}>
                    <TableCell>{machine.id}</TableCell>
                    <TableCell>{machine.name}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        machine.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {machine.status ? 'Running' : 'Idle'}
                      </span>
                    </TableCell>
                    <TableCell>{machine.current_shifts}</TableCell>
                    <TableCell>{machine.hours_per_shift}</TableCell>
                    <TableCell>{machine.current_job || '-'}</TableCell>
                    <TableCell>{new Date(machine.last_updated).toLocaleString()}</TableCell>
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