import React, { useState } from 'react'
import { SERVICES as INIT_SERVICES, Service } from '../services/mockData'
import Modal from '../components/Modal'

const STORAGE_KEY = 'clinic_demo_data'

export default function Services(){
  const [services, setServices] = useState<Service[]>(()=>{
    try{ const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw).services || INIT_SERVICES }catch{}
    return INIT_SERVICES
  })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState<number | ''>('')

  const persist = (next: Service[]) => {
    const payload = { services: next, appointments: [], patients: [], doctors: [] }
    try{ const raw = localStorage.getItem(STORAGE_KEY); if (raw){ const cur = JSON.parse(raw); payload.appointments = cur.appointments || []; payload.patients = cur.patients || []; payload.doctors = cur.doctors || [] } }catch{}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) return
    if (editing){
      const next = services.map(s=> s.id===editing.id ? { ...editing, name, price: Number(price) } : s)
      setServices(next); persist(next); setEditing(null)
    } else {
      const id = Math.random().toString(36).slice(2,9)
      const next = [{ id, name, price: Number(price) }, ...services]
      setServices(next); persist(next)
    }
    setName(''); setPrice('')
    setOpen(false)
  }

  const remove = (id:string) => { const next = services.filter(s=>s.id!==id); setServices(next); persist(next) }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Services & Pricing</h1>
        <button className="btn btn-primary" onClick={()=>setOpen(true)}>New Service</button>
      </div>

      <div className="card">
        <ul className="space-y-2">
          {services.map(s=> (
            <li key={s.id} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="muted text-sm">ID: {s.id}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-medium">₹{s.price}</div>
                <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>{ setEditing(s); setName(s.name); setPrice(s.price); setOpen(true) }}>Edit</button>
                <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={()=>remove(s.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={open} onClose={()=>{ setOpen(false); setEditing(null) }} title={editing? 'Edit Service' : 'New Service'}>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-sm muted">Service name</label>
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm muted">Price (INR)</label>
            <input type="number" value={price as any} onChange={e=>setPrice(Number(e.target.value))} className="w-full border p-2 rounded" />
          </div>
          <div className="text-right">
            <button className="btn btn-primary" type="submit">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
