'use client'

import { useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Package, Timer, AlertCircle, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Stats {
  total_parts: number
  total_production: number
  total_quality_issues: number
  total_machines: number
  low_stock_items: Array<{
    material_name: string
    quantity: number
    reorder_point: number
  }>
  recent_production: Array<{
    id: number
    product_name: string
    quantity: number
    status: string
    start_date: string
  }>
  machine_status: Array<{
    id: number
    name: string
    status: boolean
    current_job: string | null
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await fetchApi<Stats>('/stats')
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-2">Welcome to your manufacturing control center</p>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Parts</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.total_parts ?? '-'}</div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-600">Unique parts in inventory</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Production Orders</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.total_production ?? '-'}</div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-600">Active production runs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Quality Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.total_quality_issues ?? '-'}</div>
            <div className="flex items-center mt-1">
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              <p className="text-xs text-red-600">Open quality concerns</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Machines</CardTitle>
            <Timer className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.total_machines ?? '-'}</div>
            <div className="flex items-center mt-1">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <p className="text-xs text-green-600">Active equipment</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Machine Status and Low Stock */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">Machine Status</CardTitle>
            <p className="text-sm text-gray-500">
              Current machine utilization and jobs
            </p>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Machine</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Job</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.machine_status.map((machine) => (
                    <TableRow key={machine.id}>
                      <TableCell className="font-medium">{machine.name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          machine.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {machine.status ? 'Running' : 'Idle'}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">{machine.current_job || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Reorder Point</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.low_stock_items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.material_name}</TableCell>
                      <TableCell className={item.quantity <= item.reorder_point ? 'text-red-600' : ''}>
                        {item.quantity}
                      </TableCell>
                      <TableCell>{item.reorder_point}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Production */}
      <Card className="bg-white hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">Recent Production Orders</CardTitle>
          <p className="text-sm text-gray-500">
            Latest manufacturing activity across all lines
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recent_production.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.product_name}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">{new Date(order.start_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 