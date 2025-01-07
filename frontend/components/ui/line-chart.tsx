'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart as TremorLineChart } from "@tremor/react"

interface ChartData {
  name: string
  value: number
}

interface LineChartProps {
  title: string
  data: ChartData[]
  valuePrefix?: string
  height?: number
  color?: string
}

export function LineChartCard({ 
  title, 
  data, 
  valuePrefix = "", 
  height = 300,
  color = "indigo"
}: LineChartProps) {
  const formatValue = (value: number) => `${valuePrefix}${value.toLocaleString()}`

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="border-b border-gray-100">
        <CardTitle className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div style={{ height }} className="relative w-full">
          <TremorLineChart
            data={data}
            index="name"
            categories={["value"]}
            colors={[color]}
            valueFormatter={formatValue}
            showLegend={false}
            showGridLines={true}
            showXAxis={true}
            showYAxis={true}
            yAxisWidth={70}
            autoMinValue={false}
            minValue={0}
            className="h-full w-full"
            curveType="natural"
            connectNulls={true}
          />
        </div>
      </CardContent>
    </Card>
  )
} 