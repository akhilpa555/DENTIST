import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { APPOINTMENTS, PATIENTS, DOCTORS, SERVICES, INVENTORY, INVOICES } from './services/mockData'

// Seed LocalStorage with demo data if not present
try {
  const key = 'clinic_demo_data'
  const raw = localStorage.getItem(key)
  if (!raw) {
    const payload = { appointments: APPOINTMENTS, patients: PATIENTS, doctors: DOCTORS, services: SERVICES, inventory: INVENTORY, invoices: INVOICES }
    localStorage.setItem(key, JSON.stringify(payload))
  }
} catch {}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
