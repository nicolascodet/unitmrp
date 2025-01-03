'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  Boxes,
  Factory,
  AlertCircle,
  Wrench,
  FileSpreadsheet,
  ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package },
  { name: 'Production', href: '/dashboard/production', icon: Factory },
  { name: 'Parts', href: '/dashboard/parts', icon: Boxes },
  { name: 'BOM', href: '/dashboard/bom', icon: FileSpreadsheet },
  { name: 'Quality', href: '/dashboard/quality', icon: AlertCircle },
  { name: 'Machines', href: '/dashboard/machines', icon: Wrench },
  { name: 'MRP', href: '/dashboard/mrp', icon: ClipboardList },
  { name: 'Maintenance', href: '/dashboard/maintenance', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-50 border-r border-gray-200">
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-gray-400")} />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 