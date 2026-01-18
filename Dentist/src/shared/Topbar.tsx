import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Topbar() {
  const { user, logout } = useAuth()
  return (
    <header className="topbar flex items-center justify-between p-4 bg-white">
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold text-gray-700">Dashboard</div>
        <div className="text-sm text-gray-500">Good morning</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">{user?.role?.toUpperCase()}</div>
        <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded">
          <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center text-blue-700">{user?.name?.[0] ?? 'U'}</div>
          <div className="text-sm">{user?.name}</div>
        </div>
        <button onClick={logout} className="btn btn-ghost">Logout</button>
      </div>
    </header>
  )
}
