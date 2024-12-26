import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Sidebar() {
  return (
    <div className="w-64 border-r bg-background h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Link href="/dashboard/parts">
              <Button variant="ghost" className="w-full justify-start">
                Parts
              </Button>
            </Link>
            <Link href="/dashboard/production">
              <Button variant="ghost" className="w-full justify-start">
                Production
              </Button>
            </Link>
            <Link href="/dashboard/quality">
              <Button variant="ghost" className="w-full justify-start">
                Quality
              </Button>
            </Link>
            <Link href="/dashboard/machines">
              <Button variant="ghost" className="w-full justify-start">
                Machines
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 