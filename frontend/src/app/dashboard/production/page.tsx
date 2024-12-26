'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayCircle } from "lucide-react"

interface ProductionRun {
  id: number
  part_id: number
  quantity: number
  start_time: string
  end_time: string | null
  status: 'pending' | 'in_progress' | 'completed'
}

export default function ProductionPage() {
  const [runs, setRuns] = useState<ProductionRun[]>([])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Production Planning</h1>
        <Button>
          <PlayCircle className="mr-2 h-4 w-4" />
          Start New Run
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {runs.length > 0 ? (
          runs.map((run) => (
            <Card key={run.id}>
              <CardHeader>
                <CardTitle>Run #{run.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                    <dd className="capitalize">{run.status.replace('_', ' ')}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Quantity</dt>
                    <dd>{run.quantity} units</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Start Time</dt>
                    <dd>{new Date(run.start_time).toLocaleString()}</dd>
                  </div>
                  {run.end_time && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">End Time</dt>
                      <dd>{new Date(run.end_time).toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No production runs found. Start a new run to begin production.</p>
          </div>
        )}
      </div>
    </div>
  )
} 