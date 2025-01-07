import { API_ENDPOINTS, fetchApi } from '@/lib/api'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, DollarSign, Package, AlertTriangle, Archive } from 'lucide-react'
import { LineChartCard } from '@/components/ui/line-chart'

interface Part {
  id: number
  name: string
  quantity: number
  cost: number
}

interface ProductionRun {
  id: number
  part_name: string
  status: string
  created_at: string
  cost: number
}

interface QualityCheck {
  id: number
  part_name: string
  result: string
  checked_at: string
}

interface Order {
  id: number
  customer_name: string
  status: string
  total_items: number
  total_amount: number
  created_at: string
}

interface ChartData {
  name: string
  value: number
}

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  trend?: number
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-amber-100 text-amber-800'
    case 'failed':
      return 'bg-rose-100 text-rose-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function groupByMonth(data: { created_at: string; total_amount?: number }[]): ChartData[] {
  const grouped = data.reduce((acc: { [key: string]: number }, item) => {
    const date = new Date(item.created_at)
    const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' })
    acc[monthYear] = (acc[monthYear] || 0) + (item.total_amount || 0)
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const dateA = new Date(a.name + " 1, 2000"); // Add day and year for proper parsing
      const dateB = new Date(b.name + " 1, 2000");
      return dateA.getTime() - dateB.getTime();
    })
}

function StatCard({ title, value, description, trend }: StatCardProps) {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        {trend && (
          <Badge variant={trend > 0 ? "default" : "destructive"} className="text-xs">
            {trend > 0 ? "+" : ""}{trend}%
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Test data
const TEST_DATA = {
  parts: [
    { id: 1, name: 'Aluminum Frame A100', quantity: 5, cost: 150, customer: 'TechCorp Inc.', part_number: 'AF-100' },
    { id: 2, name: 'Steel Bearings B200', quantity: 8, cost: 45, customer: 'Innovate Solutions', part_number: 'SB-200' },
    { id: 3, name: 'Carbon Fiber Panel C300', quantity: 15, cost: 200, customer: 'Future Systems', part_number: 'CF-300' },
    { id: 4, name: 'Titanium Screws T400', quantity: 4, cost: 75, customer: 'Global Manufacturing', part_number: 'TS-400' },
    { id: 5, name: 'Copper Wire CW500', quantity: 25, cost: 30, customer: 'Smart Devices Ltd', part_number: 'CW-500' },
    { id: 6, name: 'LED Panel L600', quantity: 12, cost: 90, customer: 'Elite Electronics', part_number: 'LP-600' },
    { id: 7, name: 'Glass Screen G700', quantity: 6, cost: 120, customer: 'Prime Industries', part_number: 'GS-700' },
  ],
  runs: [
    { id: 1, part_name: 'Aluminum Frame A100', status: 'completed', created_at: '2023-07-15', cost: 800, order_id: 1, quantity: 10 },
    { id: 2, part_name: 'Steel Bearings B200', status: 'completed', created_at: '2023-08-15', cost: 1200, order_id: 2, quantity: 15 },
    { id: 3, part_name: 'Carbon Fiber Panel C300', status: 'completed', created_at: '2023-09-15', cost: 1600, order_id: 3, quantity: 20 },
    { id: 4, part_name: 'LED Panel L600', status: 'completed', created_at: '2023-10-15', cost: 2000, order_id: 4, quantity: 25 },
    { id: 5, part_name: 'Glass Screen G700', status: 'completed', created_at: '2023-11-15', cost: 2400, order_id: 5, quantity: 30 },
    { id: 6, part_name: 'Titanium Screws T400', status: 'completed', created_at: '2023-12-15', cost: 2800, order_id: 6, quantity: 35 },
    { id: 7, part_name: 'Copper Wire CW500', status: 'in_progress', created_at: '2024-01-05', cost: 3200, order_id: 7, quantity: 40 },
    { id: 8, part_name: 'Aluminum Frame A100', status: 'in_progress', created_at: '2024-01-10', cost: 3600, order_id: 8, quantity: 45 },
    { id: 9, part_name: 'Steel Bearings B200', status: 'pending', created_at: '2024-01-15', cost: 4000, order_id: 9, quantity: 50 },
  ],
  orders: [
    { id: 1, customer_name: 'TechCorp Inc.', status: 'completed', total_items: 10, total_amount: 2000, created_at: '2023-07-15' },
    { id: 2, customer_name: 'Innovate Solutions', status: 'completed', total_items: 15, total_amount: 2500, created_at: '2023-08-15' },
    { id: 3, customer_name: 'Future Systems', status: 'completed', total_items: 20, total_amount: 3000, created_at: '2023-09-15' },
    { id: 4, customer_name: 'Global Manufacturing', status: 'completed', total_items: 25, total_amount: 3500, created_at: '2023-10-15' },
    { id: 5, customer_name: 'Smart Devices Ltd', status: 'completed', total_items: 30, total_amount: 4000, created_at: '2023-11-15' },
    { id: 6, customer_name: 'Elite Electronics', status: 'completed', total_items: 35, total_amount: 4500, created_at: '2023-12-15' },
    { id: 7, customer_name: 'Prime Industries', status: 'in_progress', total_items: 40, total_amount: 5000, created_at: '2024-01-05' },
    { id: 8, customer_name: 'TechCorp Inc.', status: 'in_progress', total_items: 45, total_amount: 5500, created_at: '2024-01-10' },
    { id: 9, customer_name: 'Innovate Solutions', status: 'pending', total_items: 50, total_amount: 6000, created_at: '2024-01-15' },
  ],
  checks: [
    { id: 1, part_name: 'Aluminum Frame A100', result: 'passed', checked_at: '2023-07-16', production_run_id: 1, quantity_checked: 10, quantity_rejected: 0 },
    { id: 2, part_name: 'Steel Bearings B200', result: 'passed', checked_at: '2023-08-16', production_run_id: 2, quantity_checked: 15, quantity_rejected: 1 },
    { id: 3, part_name: 'Carbon Fiber Panel C300', result: 'failed', checked_at: '2023-09-16', production_run_id: 3, quantity_checked: 20, quantity_rejected: 3 },
    { id: 4, part_name: 'LED Panel L600', result: 'passed', checked_at: '2023-10-16', production_run_id: 4, quantity_checked: 25, quantity_rejected: 0 },
    { id: 5, part_name: 'Glass Screen G700', result: 'passed', checked_at: '2023-11-16', production_run_id: 5, quantity_checked: 30, quantity_rejected: 2 },
    { id: 6, part_name: 'Titanium Screws T400', result: 'passed', checked_at: '2023-12-16', production_run_id: 6, quantity_checked: 35, quantity_rejected: 1 },
    { id: 7, part_name: 'Copper Wire CW500', result: 'failed', checked_at: '2024-01-06', production_run_id: 7, quantity_checked: 40, quantity_rejected: 5 },
  ]
}

export default async function Home() {
  try {
    // Use test data instead of API calls
    const parts = TEST_DATA.parts;
    const runs = TEST_DATA.runs;
    const checks = TEST_DATA.checks;
    const orders = TEST_DATA.orders;

    // Calculate summary statistics
    const lowStockParts = parts.filter(p => p.quantity < 10)
    const activeRuns = runs.filter(r => r.status === 'in_progress')
    const recentOrders = orders.slice(0, 5)

    // Calculate financial metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const totalCosts = runs.reduce((sum, run) => sum + run.cost, 0) + 
                      parts.reduce((sum, part) => sum + (part.cost * part.quantity), 0)
    const grossProfit = totalRevenue - totalCosts
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    // Calculate inventory worth
    const inventoryWorth = parts.reduce((sum, part) => sum + (part.cost * part.quantity), 0)

    // Prepare chart data
    const revenueData = groupByMonth(orders)
    const productionData = groupByMonth(runs.map(run => ({
      created_at: run.created_at,
      total_amount: run.cost
    })))

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-slate-200">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">Business Overview</h1>
          </div>

          {/* Financial Metrics */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
            <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-800">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-emerald-600">From all orders</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-800">Gross Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-700">{formatCurrency(grossProfit)}</div>
                <p className="text-xs text-violet-600">{profitMargin.toFixed(1)}% margin</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Total Costs</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalCosts)}</div>
                <p className="text-xs text-blue-600">Production & inventory</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-800">Inventory Worth</CardTitle>
                <Archive className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">{formatCurrency(inventoryWorth)}</div>
                <p className="text-xs text-amber-600">Current stock value</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-rose-800">Low Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-rose-700">{lowStockParts.length}</div>
                <p className="text-xs text-rose-600">Need reordering</p>
              </CardContent>
            </Card>
          </div>

          {/* Growth Charts */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <LineChartCard
              title="Monthly Revenue"
              data={revenueData}
              valuePrefix="$"
              height={300}
              color="emerald"
            />
            <LineChartCard
              title="Monthly Production Costs"
              data={productionData}
              valuePrefix="$"
              height={300}
              color="violet"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Orders */}
            <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-semibold text-indigo-800">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-100">
                        <div>
                          <p className="font-medium text-indigo-900">{order.customer_name}</p>
                          <p className="text-sm text-indigo-600">
                            {formatCurrency(order.total_amount)} - {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-indigo-600">No recent orders</p>
                )}
              </CardContent>
            </Card>

            {/* Active Production */}
            <Card className="bg-gradient-to-br from-violet-50 to-white border-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-semibold text-violet-800">Active Production</CardTitle>
              </CardHeader>
              <CardContent>
                {activeRuns.length > 0 ? (
                  <div className="space-y-4">
                    {activeRuns.map((run) => (
                      <div key={run.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-violet-100">
                        <div>
                          <p className="font-medium text-violet-900">{run.part_name}</p>
                          <p className="text-sm text-violet-600">
                            Cost: {formatCurrency(run.cost)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(run.status)}>
                          {run.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-violet-600">No active production runs</p>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card className="bg-gradient-to-br from-rose-50 to-white border-rose-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg font-semibold text-rose-800">Critical Stock Levels</CardTitle>
              </CardHeader>
              <CardContent>
                {lowStockParts.length > 0 ? (
                  <div className="space-y-4">
                    {lowStockParts.slice(0, 5).map((part) => (
                      <div key={part.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-rose-100">
                        <div>
                          <p className="font-medium text-rose-900">{part.name}</p>
                          <p className="text-sm text-rose-600">
                            Quantity: {part.quantity}
                          </p>
                        </div>
                        <Badge variant="destructive">Reorder</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-rose-600">No low stock alerts</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Backend Not Available</h1>
            <p className="text-gray-600 mb-4">
              Please make sure the backend server is running at http://localhost:8000
            </p>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                To start the backend server, run:<br />
                <code className="bg-yellow-100 px-2 py-1 rounded">python -m uvicorn main:app --reload</code><br />
                in your backend directory
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
