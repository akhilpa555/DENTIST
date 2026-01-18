import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import LoginPage from './pages/Login'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Patients from './pages/Patients'
import Doctors from './pages/Doctors'
import Services from './pages/Services'
import Billing from './pages/Billing'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Inventory from './pages/Inventory'

type PropsWithChildren = { children: React.ReactNode }

function ProtectedRoute({ children }: PropsWithChildren) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireRole({ children, allowed }: { children: React.ReactNode; allowed: string[] }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!allowed.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App(): JSX.Element {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route
            path="patients"
            element={
              <RequireRole allowed={[ 'admin', 'doctor', 'receptionist' ]}>
                <Patients />
              </RequireRole>
            }
          />
          <Route
            path="inventory"
            element={
              <RequireRole allowed={[ 'admin', 'doctor', 'receptionist' ]}>
                <Inventory />
              </RequireRole>
            }
          />
          <Route path="doctors" element={<Doctors />} />
          <Route path="services" element={<Services />} />
          <Route
            path="billing"
            element={
              <RequireRole allowed={[ 'admin', 'doctor', 'receptionist' ]}>
                <Billing />
              </RequireRole>
            }
          />
          <Route
            path="reports"
            element={
              <RequireRole allowed={[ 'admin', 'doctor', 'receptionist' ]}>
                <Reports />
              </RequireRole>
            }
          />
          <Route
            path="settings"
            element={
              <RequireRole allowed={[ 'admin' ]}>
                <Settings />
              </RequireRole>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
