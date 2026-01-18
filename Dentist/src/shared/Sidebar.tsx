import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NavItem: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <NavLink to={to} className={({ isActive }) => `block px-4 py-2 rounded ${isActive ? 'bg-white text-blue-600' : 'text-gray-700 hover:bg-white'}`}>
    {label}
  </NavLink>
)

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const { user } = useAuth()
  return (
    <aside className="sidebar p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        {onClose && (
          <button onClick={onClose} aria-label="Close sidebar" className="mr-2 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700">✕</button>
        )}
        <img src="/src/assets/dental-logo.svg" alt="logo" className="w-10 h-10" />
        <div>
          <div className="font-bold text-lg">Bheemanady Dental Clinic BDC</div>
          <div className="text-xs text-blue-100">Clinic Management</div>
        </div>
      </div>
      <nav className="flex-1 px-1 space-y-2">
        <NavItem to="/" label="Dashboard" />
        <NavItem to="/appointments" label="Appointments" />
        {user?.role !== 'patient' && <NavItem to="/patients" label="Patients" />}
        <NavItem to="/doctors" label="Doctors" />
        <NavItem to="/services" label="Services" />
        {user?.role !== 'patient' && <NavItem to="/billing" label="Billing" />}
        {user?.role !== 'patient' && <NavItem to="/reports" label="Reports" />}
      </nav>
      <div className="mt-6">
        {user?.role === 'admin' && <NavItem to="/settings" label="Settings" />}
      </div>
    </aside>
  )
}
