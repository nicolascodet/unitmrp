import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold tracking-tighter">
          MRP System
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
          Streamline your manufacturing process with our comprehensive resource planning solution.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="font-medium">
              Enter Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/parts">
            <Button size="lg" variant="outline" className="font-medium">
              View Parts
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Parts Management</h3>
            <p className="text-sm text-muted-foreground">Track and manage your inventory with ease.</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Production Planning</h3>
            <p className="text-sm text-muted-foreground">Optimize your manufacturing schedule.</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2">Quality Control</h3>
            <p className="text-sm text-muted-foreground">Maintain high standards with detailed tracking.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
