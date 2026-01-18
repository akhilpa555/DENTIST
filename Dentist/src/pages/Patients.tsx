import React, { useState } from 'react'
import { PATIENTS as INIT_PATIENTS } from '../services/mockData'
import Modal from '../components/Modal'
import PatientForm from '../components/PatientForm'

const STORAGE_KEY = 'clinic_demo_data'

export default function Patients() {
  const [patients, setPatients] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw).patients } catch {}
    return INIT_PATIENTS
  })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)

  const persist = (next:any) => {
    const payload = { patients: next, appointments: [] }
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) {
      const cur = JSON.parse(raw); payload.appointments = cur.appointments || []
    }}catch{}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  const create = (p:any) => {
    const id = Math.random().toString(36).slice(2,9)
    const next = [{ ...p, id }, ...patients]
    setPatients(next)
    persist(next)
    setOpen(false)
  }

  const saveEdit = (p:any) => {
    const next = patients.map((pt:any)=> pt.id===p.id ? p : pt)
    setPatients(next)
    persist(next)
    setEditing(null)
  }

  const remove = (id:string) => {
    const next = patients.filter((p: { id: string })=>p.id!==id)
    setPatients(next)
    persist(next)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Patients</h1>
        <div>
          <button className="btn btn-primary" onClick={()=>setOpen(true)}>New Patient</button>
        </div>
      </div>
      <div className="card">
        <ul className="space-y-3">
          {patients.map((p:any) => (
            <li key={p.id} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="muted">{p.phone} • {p.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>setEditing(p)}>Edit</button>
                <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={()=>remove(p.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={open} onClose={()=>setOpen(false)} title="New Patient">
        <PatientForm onSubmit={create} />
      </Modal>

      <Modal open={!!editing} onClose={()=>setEditing(null)} title="Edit Patient">
        {editing && <PatientForm initial={editing} onSubmit={saveEdit} />}
      </Modal>
    </div>
  )
}
