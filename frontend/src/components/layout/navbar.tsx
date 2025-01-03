import Link from 'next/link'
import { Factory } from 'lucide-react'

export default function Navbar() {
  return (
    <nav className="border-b bg-gradient-to-r from-blue-600 to-blue-800 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Factory className="h-6 w-6" />
            <span className="font-bold text-xl">MRP System</span>
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Manufacturing Resource Planning</span>
          </div>
        </div>
      </div>
    </nav>
  )
} 