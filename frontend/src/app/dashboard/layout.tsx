import { ReactNode } from "react"
import Navbar from "@/components/layout/navbar"
import Sidebar from "@/components/layout/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 