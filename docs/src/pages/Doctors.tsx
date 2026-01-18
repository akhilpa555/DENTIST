import React, { useState } from 'react'
import { DOCTORS as INIT_DOCTORS, Doctor } from '../services/mockData'
import Modal from '../components/Modal'
import DoctorForm from '../components/DoctorForm'
import { useAuth } from '../context/AuthContext'

const STORAGE_KEY = 'clinic_demo_data'

export default function Doctors() {
  const { user } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed.doctors)) return parsed.doctors
      }
    } catch {}
    return INIT_DOCTORS
  })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)

  const persist = (next: Doctor[]) => {
    const payload = { doctors: next, appointments: [], patients: [] }
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) {
      const cur = JSON.parse(raw); payload.appointments = cur.appointments || []; payload.patients = cur.patients || []
    }}catch{}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  const create = (d: Doctor) => {
    const next = [d, ...doctors]
    setDoctors(next)
    persist(next)
    setOpen(false)
  }

  const saveEdit = (d: Doctor) => {
    const next = doctors.map(dt => dt.id === d.id ? d : dt)
    setDoctors(next)
    persist(next)
    setEditing(null)
  }

  const remove = (id: string) => {
    const next = doctors.filter(d => d.id !== id)
    setDoctors(next)
    persist(next)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Doctors</h1>
        {user?.role === 'admin' && (
          <div>
            <button className="btn btn-primary" onClick={() => setOpen(true)}>New Doctor</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map(d => (
          <div key={d.id} className="card flex items-center gap-3">
            <div>
              {d.avatar ? <img src={d.avatar} className="w-12 h-12 rounded-full" alt={d.name} /> : <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">{d.name.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>}
            </div>
            <div className="flex-1">
              <div className="font-medium">{d.name}</div>
              <div className="muted">{d.specialization}</div>
              <div className="mt-2 muted">Availability: {d.availability.join(', ')}</div>
            </div>
            {user?.role === 'admin' && (
              <div className="mt-3 flex gap-2">
                <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={() => setEditing(d)}>Edit</button>
                <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => remove(d.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New Doctor">
        <DoctorForm onSubmit={create} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Doctor">
        {editing && <DoctorForm initial={editing} onSubmit={saveEdit} />}
      </Modal>
    </div>
  )
}
