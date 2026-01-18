import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../shared/Sidebar'
import Topbar from '../shared/Topbar.jsx'

export default function AppLayout() {
  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
