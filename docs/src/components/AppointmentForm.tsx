import React, { useEffect, useState } from 'react'
import { DOCTORS, SERVICES, Appointment } from '../services/mockData'
import { useAuth } from '../context/AuthContext'

const STORAGE_KEY = 'clinic_demo_data'

type Props = {
  initial?: any
  onSubmit: (data: any) => void
}

export default function AppointmentForm({ initial, onSubmit }: Props) {
  const initialPatients = (()=>{ try{ const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw).patients || [] }catch{} return [] })()
  const [patients, setPatients] = useState<any[]>(initialPatients)
  const [patientId, setPatientId] = useState<string>(initial?.patientId ?? initialPatients[0]?.id ?? '')
  const [doctorId, setDoctorId] = useState(initial?.doctorId ?? DOCTORS[0]?.id)
  const [date, setDate] = useState(initial ? new Date(initial.datetime).toISOString().slice(0,10) : new Date().toISOString().slice(0,10))
  const [slot, setSlot] = useState(initial ? new Date(initial.datetime).toISOString() : '')
  const [serviceIds, setServiceIds] = useState<string[]>(initial?.serviceIds ?? [SERVICES[0].id])

  function readPatients(){ try{ const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw).patients || [] }catch{} return [] }

  useEffect(()=>{
    // refresh local patients when form opens
    setPatients(readPatients())
    if (!patientId && readPatients().length) setPatientId(readPatients()[0].id)
  },[])

  const { user } = useAuth()
  useEffect(()=>{
    // if logged in as patient, lock patient selection to their own record (match by email)
    if (user?.role === 'patient'){
      const me = readPatients().find((p:any)=> p.email === user.email)
      if (me) setPatientId(me.id)
    }
  },[user])

  const loadAppointments = () => {
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return parsed.appointments || []
    }catch{ return [] }
  }

  const slotsFor = (docId:string, forDate:string) => {
    // clinic hours 09:00 to 17:00, 30-min slots
    const start = 9, end = 17
    const slots: string[] = []
    for(let h=start; h<end; h++){
      slots.push(`${forDate}T${String(h).padStart(2,'0')}:00:00`) 
      slots.push(`${forDate}T${String(h).padStart(2,'0')}:30:00`)
    }
    // filter out occupied
    const appts = loadAppointments().filter((a:any)=> a.doctorId===docId)
    const occupied = new Set(appts.map((a:any)=> new Date(a.datetime).toISOString()))
    return slots.map(s=> new Date(s).toISOString()).filter(s=>!occupied.has(s))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const dt = slot || new Date(`${date}T09:00:00`).toISOString()
    onSubmit({ patientId, doctorId, datetime: dt, serviceIds })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Patient</label>
        <select className="w-full border p-2 rounded" value={patientId} onChange={e=>setPatientId(e.target.value)} disabled={user?.role==='patient'}>
          <option value="">Select</option>
          {patients.map((p:any)=> <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Doctor</label>
        <select className="w-full border p-2 rounded" value={doctorId} onChange={e=>setDoctorId(e.target.value)}>
          {DOCTORS.map(d=> <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Date</label>
        <input type="date" className="w-full border p-2 rounded" value={date} onChange={e=>{ setDate(e.target.value); setSlot('') }} />
      </div>
      <div>
        <label className="block text-sm mb-1">Available slots (30 min)</label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
          {slotsFor(doctorId, date).map(s=> (
            <label key={s} className={`p-2 border rounded cursor-pointer ${slot===s? 'bg-blue-600 text-white' : ''}`}>
              <input type="radio" name="slot" className="hidden" value={s} checked={slot===s} onChange={()=>setSlot(s)} />
              <div>{new Date(s).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Services</label>
        <div className="space-y-1">
          {SERVICES.map(s=> (
            <label key={s.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={serviceIds.includes(s.id)} onChange={e=>{
                if (e.target.checked) setServiceIds(ids=>[...ids,s.id])
                else setServiceIds(ids=>ids.filter(id=>id!==s.id))
              }} />
              <span>{s.name} (₹{s.price})</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary">Save Appointment</button>
      </div>
    </form>
  )
}
