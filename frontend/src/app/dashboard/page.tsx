'use client'

import { useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Stats {
  total_parts: number
  total_production: number
  total_quality_issues: number
  total_machines: number
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Parts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats?.total_parts ?? '-'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Production Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats?.total_production ?? '-'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Quality Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats?.total_quality_issues ?? '-'}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Machines</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats?.total_machines ?? '-'}</p>
        </CardContent>
      </Card>
    </div>
  )
} 