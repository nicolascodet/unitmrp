import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <nav className="border-b bg-background">
      <div className="flex h-16 items-center px-4">
        <h2 className="text-lg font-semibold">MRP System</h2>
        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline">Menu</Button>
        </div>
      </div>
    </nav>
  )
} 