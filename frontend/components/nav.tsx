'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Open Orders', href: '/open-orders' },
  { name: 'Inventory', href: '/inventory' },
  { name: 'Parts', href: '/parts' },
  { name: 'Production Runs', href: '/production-runs' },
  { name: 'Quality Checks', href: '/quality-checks' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="flex space-x-4 lg:space-x-6">
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === item.href
              ? 'text-black dark:text-white'
              : 'text-muted-foreground'
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
} 