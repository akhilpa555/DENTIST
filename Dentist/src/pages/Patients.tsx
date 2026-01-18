import React, { useState } from 'react'
import { PATIENTS as INIT_PATIENTS, Patient, SERVICES } from '../services/mockData'
import Modal from '../components/Modal'
import PatientForm from '../components/PatientForm'

const STORAGE_KEY = 'clinic_demo_data'

function readAppointments(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return parsed.appointments || []
  }catch{ return [] }
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw).patients || INIT_PATIENTS } catch {}
    return INIT_PATIENTS
  })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [selected, setSelected] = useState<Patient | null>(null)
  const [activeTab, setActiveTab] = useState<'appointments'|'history'|'details'>('appointments')

  const persist = (next:Patient[]) => {
    const payload = { patients: next, appointments: [], doctors: [] }
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) {
      const cur = JSON.parse(raw); payload.appointments = cur.appointments || []; payload.doctors = cur.doctors || []
    }}catch{}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  type PatientInput = Omit<Patient, 'id'> & { id?: string }

  const create = (p: PatientInput) => {
    const id = Math.random().toString(36).slice(2,9)
    const next = [{ ...p, id }, ...patients] as Patient[]
    setPatients(next)
    persist(next)
    setOpen(false)
  }

  const saveEdit = (p: PatientInput) => {
    if (!p.id) return
    const next = patients.map(pt=> pt.id===p.id ? { ...(p as Patient) } : pt)
    setPatients(next)
    persist(next)
    setEditing(null)
    if (selected?.id === p.id) setSelected(p as Patient)
  }

  const remove = (id:string) => {
    const next = patients.filter(p=>p.id!==id)
    setPatients(next)
    persist(next)
    if (selected?.id === id) setSelected(null)
  }

  const appointmentsFor = (pid:string) => readAppointments().filter((a:any)=> a.patientId === pid).sort((a:any,b:any)=> new Date(b.datetime).getTime() - new Date(a.datetime).getTime())

  const serviceDetails = (ids: string[] = []) => {
    return ids.map(id => SERVICES.find(s => s.id === id)).filter(Boolean) as { id: string; name: string; price: number }[]
  }

  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})
  const toggleExpanded = (key: string) => setExpandedIds(prev => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="md:flex gap-6">
      <div className="md:w-2/3">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Patients</h1>
          <div>
            <button className="btn btn-primary" onClick={()=>setOpen(true)}>New Patient</button>
          </div>
        </div>

        <div className="card">
          <ul className="space-y-3">
            {patients.map((p:Patient) => (
              <li key={p.id} className="flex justify-between items-center">
                <div className="cursor-pointer" onClick={()=>{ setSelected(p); setActiveTab('appointments') }}>
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
      </div>

      <div className="md:w-1/3">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Details</h2>
          {selected && <button className="text-sm muted" onClick={()=>setSelected(null)}>Close</button>}
        </div>

        {!selected ? (
          <div className="card muted">Select a patient to view details (appointments, history, personal details).</div>
        ) : (
          <div className="card">
            <div className="mb-3">
              <div className="flex gap-2">
                <button className={`px-3 py-1 rounded ${activeTab==='appointments'? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={()=>setActiveTab('appointments')}>Appointments</button>
                <button className={`px-3 py-1 rounded ${activeTab==='history'? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={()=>setActiveTab('history')}>History</button>
                <button className={`px-3 py-1 rounded ${activeTab==='details'? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={()=>setActiveTab('details')}>Details</button>
              </div>
            </div>

            {activeTab === 'appointments' && (
              <div>
                <h3 className="font-medium mb-2">Appointments</h3>
                <ul className="space-y-2">
                  {appointmentsFor(selected.id).length === 0 && <li className="muted">No appointments found.</li>}
                  {appointmentsFor(selected.id).map((a:any)=> {
                    const services = serviceDetails(a.serviceIds)
                    const total = services.reduce((s:number, it:any)=> s + (it?.price||0), 0)
                    return (
                      <li key={a.id} className="border rounded p-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{a.doctorName}</div>
                            <div className="muted text-sm">{new Date(a.datetime).toLocaleString()} • {a.status}</div>
                          </div>
                          <div className="text-sm muted">₹{total}</div>
                        </div>
                        <div className="mt-2">
                          <button className="text-sm text-blue-600" onClick={()=>toggleExpanded(`appt-${a.id}`)}>{expandedIds[`appt-${a.id}`] ? 'Hide details' : 'View details'}</button>
                          {expandedIds[`appt-${a.id}`] && (
                            <div className="mt-2 bg-gray-50 p-2 rounded">
                              <div className="muted text-sm">Services</div>
                              <ul className="mb-2">
                                {services.map(s=> <li key={s.id} className="text-sm">{s.name} — ₹{s.price}</li>)}
                              </ul>
                              <div className="muted text-sm">Notes</div>
                              <div className="mb-2">{a.notes || 'No notes recorded.'}</div>
                              <div className="muted text-sm">Provider</div>
                              <div>{a.doctorName} • {a.doctorId}</div>
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="font-medium mb-2">Visit History</h3>
                <ul className="space-y-2">
                  {selected.visits && selected.visits.length > 0 ? selected.visits.map((v:any, idx:number)=> {
                    const vs = serviceDetails(v.serviceIds || [])
                    const vt = vs.reduce((s:number, it:any)=> s + (it?.price||0), 0)
                    return (
                      <li key={idx} className="border rounded p-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="muted text-sm">{v.date}</div>
                            <div className="mt-1">{v.notes}</div>
                          </div>
                          <div className="text-sm muted">₹{vt}</div>
                        </div>
                        <div className="mt-2">
                          <button className="text-sm text-blue-600" onClick={()=>toggleExpanded(`hist-${idx}`)}>{expandedIds[`hist-${idx}`] ? 'Hide details' : 'View details'}</button>
                          {expandedIds[`hist-${idx}`] && (
                            <div className="mt-2 bg-gray-50 p-2 rounded">
                              <div className="muted text-sm">Services</div>
                              <ul className="mb-2">
                                {vs.map(s=> <li key={s.id} className="text-sm">{s.name} — ₹{s.price}</li>)}
                              </ul>
                              <div className="muted text-sm">Practitioner notes</div>
                              <div className="mb-2">{v.notes || '—'}</div>
                            </div>
                          )}
                        </div>
                      </li>
                    )
                  }) : <li className="muted">No visit history.</li>}
                </ul>
              </div>
            )}

            {activeTab === 'details' && (
              <div>
                <h3 className="font-medium mb-2">Personal Details</h3>
                <div className="grid grid-cols-1 gap-2 mb-3">
                  <div className="flex justify-between"><div className="muted">Name</div><div>{selected.name}</div></div>
                  <div className="flex justify-between"><div className="muted">Email</div><div>{selected.email || '—'}</div></div>
                  <div className="flex justify-between"><div className="muted">Phone</div><div>{selected.phone || '—'}</div></div>
                  <div className="flex justify-between"><div className="muted">Age</div><div>{selected.age ?? '—'}</div></div>
                  <div className="flex justify-between"><div className="muted">Gender</div><div>{selected.gender || '—'}</div></div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-medium mb-2">Summary</h4>
                  {(() => {
                    const appts = appointmentsFor(selected.id)
                    const totalVisits = appts.length
                    const totalSpent = appts.reduce((sum:number, a:any) => {
                      const sv = serviceDetails(a.serviceIds || [])
                      return sum + sv.reduce((s:number,it:any)=> s + (it?.price||0), 0)
                    }, 0)
                    const last = appts[0]
                    return (
                      <div className="space-y-2">
                        <div className="flex justify-between"><div className="muted">Last visit</div><div>{last ? new Date(last.datetime).toLocaleString() : '—'}</div></div>
                        <div className="flex justify-between"><div className="muted">Total visits</div><div>{totalVisits}</div></div>
                        <div className="flex justify-between"><div className="muted">Total spent</div><div>₹{totalSpent}</div></div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
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
