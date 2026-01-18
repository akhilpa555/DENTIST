import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../shared/Sidebar'
import Topbar from '../shared/Topbar'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="h-screen flex bg-gray-50">
      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
      <div className="flex-1 flex flex-col">
        <Topbar toggleSidebar={() => setSidebarOpen(s => !s)} sidebarOpen={sidebarOpen} />
        <main className="p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
