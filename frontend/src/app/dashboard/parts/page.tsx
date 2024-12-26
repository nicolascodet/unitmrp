'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

interface Part {
  id: number
  part_number: string
  description: string
  customer: string
  material: string
  cycle_time: number
  price: number
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([])

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Parts Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Part
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {parts.length > 0 ? (
          parts.map((part) => (
            <Card key={part.id}>
              <CardHeader>
                <CardTitle>{part.part_number}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                    <dd>{part.description}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Customer</dt>
                    <dd>{part.customer}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Material</dt>
                    <dd>{part.material}</dd>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Cycle Time</dt>
                      <dd>{part.cycle_time} min</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Price</dt>
                      <dd>${part.price.toFixed(2)}</dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No parts found. Add your first part to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
} 