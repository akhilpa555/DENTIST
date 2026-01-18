import React, { useMemo, useState } from 'react'
import { APPOINTMENTS, PATIENTS, DOCTORS, SERVICES, Appointment } from '../services/mockData'
import { useAuth } from '../context/AuthContext'

const STORAGE_KEY = 'clinic_demo_data'
import Modal from '../components/Modal'
import AppointmentForm from '../components/AppointmentForm'
import AppointmentDetails from '../components/AppointmentDetails'

export default function Appointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw).appointments || APPOINTMENTS } catch {}
    return APPOINTMENTS
  })
  const [editing, setEditing] = useState<any>(null)
  const [details, setDetails] = useState<Appointment | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All'|'Scheduled'|'Completed'|'Cancelled'>('All')

  const persist = (next: Appointment[]) => {
    const payload = { appointments: next, patients: [], doctors: [] }
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) {
      const cur = JSON.parse(raw); payload.patients = cur.patients || []; payload.doctors = cur.doctors || []
    }}catch{}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  const updateAndPersist = (fn: (prev: Appointment[]) => Appointment[]) => {
    setAppointments(prev => {
      const next = fn(prev)
      persist(next)
      return next
    })
  }

  const cancel = (id: string) => updateAndPersist(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a))
  const complete = (id: string) => updateAndPersist(prev => prev.map(a => a.id === id ? { ...a, status: 'Completed' } : a))

  const saveEdit = (data: any) => {
    if (!editing) return
    updateAndPersist(prev => prev.map(a => a.id === editing.id ? { ...a, ...data } : a))
    setEditing(null)
  }

  const now = new Date()
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()

  // apply patient role restriction helper
  const visibleAppointments = useMemo(() => {
    let list = appointments.slice()
    if (user?.role === 'patient'){
      const me = PATIENTS.find(p=>p.email===user.email)
      list = list.filter(a=>a.patientId===me?.id)
    }
    // apply search & status
    const q = search.trim().toLowerCase()
    if (q) list = list.filter(a => a.patientName.toLowerCase().includes(q) || a.doctorName.toLowerCase().includes(q))
    if (statusFilter !== 'All') list = list.filter(a => a.status === statusFilter)
    // sort by datetime asc
    list.sort((x,y)=> new Date(x.datetime).getTime() - new Date(y.datetime).getTime())
    return list
  }, [appointments, user, search, statusFilter])

  const todayAppointments = visibleAppointments.filter(a => isSameDay(new Date(a.datetime), now))
  const upcomingAppointments = visibleAppointments.filter(a => new Date(a.datetime) > now)
  const pastAppointments = visibleAppointments.filter(a => new Date(a.datetime) < now)

  // Calendar view state
  const [showCalendar, setShowCalendar] = useState(false)
  const [rangeFilter, setRangeFilter] = useState<'today'|'3days'|'week'|'month'>('today')
  const [currentMonth, setCurrentMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<Date | null>(now)

  const getRangeStart = (filter: typeof rangeFilter) => {
    const end = new Date()
    if (filter === 'today') return new Date(end.getFullYear(), end.getMonth(), end.getDate())
    if (filter === '3days') { const d = new Date(end); d.setDate(end.getDate() - 2); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
    if (filter === 'week') { const d = new Date(end); d.setDate(end.getDate() - 6); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
    if (filter === 'month') { const d = new Date(end); d.setDate(end.getDate() - 29); return new Date(d.getFullYear(), d.getMonth(), d.getDate()) }
    return new Date()
  }

  const rangeStart = getRangeStart(rangeFilter)
  const appointmentsInRange = visibleAppointments.filter(a => new Date(a.datetime) >= rangeStart && new Date(a.datetime) <= now)

  // set selectedDate to start of range when range changes
  React.useEffect(()=>{
    setSelectedDate(new Date(rangeStart))
  },[rangeFilter])

  // build calendar grid for currentMonth
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  const startGrid = new Date(startOfMonth)
  startGrid.setDate(startOfMonth.getDate() - startOfMonth.getDay()) // start from Sunday
  const days: Date[] = []
  for (let i = 0; i < 42; i++) { const d = new Date(startGrid); d.setDate(startGrid.getDate() + i); days.push(d) }

  // compute display days based on rangeFilter
  let displayDays: Date[] = []
  let gridCols = 7
  if (rangeFilter === 'month') {
    displayDays = days
    gridCols = 7
  } else if (rangeFilter === 'week') {
    // week containing today (Sunday start)
    const s = new Date(now); s.setDate(now.getDate() - now.getDay())
    for (let i=0;i<7;i++){ const d=new Date(s); d.setDate(s.getDate()+i); displayDays.push(d) }
    gridCols = 7
  } else if (rangeFilter === '3days') {
    const s = new Date(rangeStart)
    for (let i=0;i<3;i++){ const d=new Date(s); d.setDate(s.getDate()+i); displayDays.push(d) }
    gridCols = 3
  } else { // today
    displayDays = [new Date(rangeStart)]
    gridCols = 1
  }

  const apptsByDate = (list: Appointment[]) => {
    const map: Record<string, Appointment[]> = {}
    list.forEach(a => {
      const key = new Date(a.datetime).toISOString().slice(0,10)
      map[key] = map[key] || []
      map[key].push(a)
    })
    return map
  }
  const apptsMap = apptsByDate(visibleAppointments)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Appointments</h1>

      <div className="mb-4 flex items-center gap-3">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search patient or doctor" className="border p-2 rounded w-64" />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="border p-2 rounded">
          <option value="All">All statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button className="ml-auto px-3 py-1 border rounded" onClick={()=>setShowCalendar(s=>!s)}>{showCalendar ? 'Hide calendar' : 'Show calendar'}</button>
      </div>

      {showCalendar && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex gap-2">
              <button className={`px-2 py-1 rounded ${rangeFilter==='today'? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={()=>setRangeFilter('today')}>Today</button>
              <button className={`px-2 py-1 rounded ${rangeFilter==='3days'? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={()=>setRangeFilter('3days')}>Last 3 days</button>
              <button className={`px-2 py-1 rounded ${rangeFilter==='week'? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={()=>setRangeFilter('week')}>Last week</button>
              <button className={`px-2 py-1 rounded ${rangeFilter==='month'? 'bg-blue-600 text-white' : 'bg-gray-100'}`} onClick={()=>setRangeFilter('month')}>Last month</button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button className="px-2 py-1 border rounded" onClick={()=> setCurrentMonth(m=> new Date(m.getFullYear(), m.getMonth()-1, 1))}>&lt;</button>
              <div className="font-medium">{currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
              <button className="px-2 py-1 border rounded" onClick={()=> setCurrentMonth(m=> new Date(m.getFullYear(), m.getMonth()+1, 1))}>&gt;</button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({length:gridCols}).map((_,i)=> {
              // header for small views: show day names or full label
              if (gridCols === 7) return <div key={i} className="text-center text-xs muted">{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</div>
              const label = displayDays[i] ? displayDays[i].toLocaleString(undefined,{ weekday: 'short', month: 'short', day: 'numeric' }) : ''
              return <div key={i} className="text-center text-xs muted">{label}</div>
            })}
            {displayDays.map(d=> {
              const key = d.toISOString().slice(0,10)
              const count = apptsMap[key]?.length ?? 0
              const inMonth = d.getMonth() === currentMonth.getMonth()
              return (
                <div key={key} onClick={()=>setSelectedDate(new Date(d))} className={`p-2 ${gridCols===7 ? 'h-20' : 'h-32'} border rounded cursor-pointer ${gridCols===7 ? (inMonth? '' : 'bg-gray-50 text-gray-400') : ''} ${isSameDay(d, selectedDate|| new Date(0)) ? 'ring-2 ring-blue-400' : ''}`}>
                  <div className="text-sm">{d.getDate()}</div>
                  {count > 0 && <div className="text-xs mt-1 bg-blue-100 text-blue-700 rounded-full w-6 h-6 text-center">{count}</div>}
                </div>
              )
            })}
          </div>

          <div className="mt-3">
            <h4 className="font-medium">Appointments in range ({appointmentsInRange.length})</h4>
            <ul className="space-y-2 mt-2">
              {appointmentsInRange.map(a=> (
                <li key={a.id} className="border rounded p-2">
                  <div className="flex justify-between"><div>{a.patientName} • {a.doctorName}</div><div className="muted">{new Date(a.datetime).toLocaleString()}</div></div>
                </li>
              ))}
            </ul>
          </div>
          {selectedDate && (
            <div className="mt-3">
              <h4 className="font-medium">Appointments on {selectedDate.toDateString()}</h4>
              <ul className="space-y-2 mt-2">
                {(apptsMap[selectedDate.toISOString().slice(0,10)] || []).map(a=> (
                  <li key={a.id} className="border rounded p-2 cursor-pointer" onClick={()=>setDetails(a)}>
                    <div className="flex justify-between"><div>{a.patientName} • {a.doctorName}</div><div className="muted">{new Date(a.datetime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div></div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Today's appointments</h2>
        {todayAppointments.length === 0 ? <div className="card muted">No appointments for today.</div> : (
          <ul className="space-y-2">
            {todayAppointments.map(a => (
              <li key={a.id} className="card flex justify-between items-center">
                <div>
                  <div className="font-medium">{a.patientName} — {a.doctorName}</div>
                  <div className="muted text-sm">{new Date(a.datetime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • {a.status}</div>
                </div>
                <div className="flex items-center gap-2">
                  {user?.role !== 'patient' && <button onClick={()=>complete(a.id)} className="px-2 py-1 bg-green-500 text-white rounded">Complete</button>}
                  <button onClick={()=>setEditing(a)} className="px-2 py-1 bg-blue-600 text-white rounded">Edit</button>
                  <button onClick={()=>cancel(a.id)} className="px-2 py-1 bg-yellow-400 rounded">Cancel</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-6">
        <h2 className="text-lg font-medium mb-2">Upcoming appointments</h2>
        {upcomingAppointments.length === 0 ? <div className="card muted">No upcoming appointments.</div> : (
          <div className="card">
            <table className="w-full table-auto">
              <thead>
                <tr className="text-left text-sm text-gray-500">
                  <th className="py-2">Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map(a => (
                  <tr key={a.id} className="border-t">
                    <td className="py-2">{a.patientName}</td>
                    <td>{a.doctorName}</td>
                    <td>{new Date(a.datetime).toLocaleString()}</td>
                    <td>{a.status}</td>
                    <td className="space-x-2">
                      {user?.role !== 'patient' && <button onClick={() => complete(a.id)} className="px-2 py-1 bg-green-500 text-white rounded">Complete</button>}
                      <button onClick={() => cancel(a.id)} className="px-2 py-1 bg-yellow-400 rounded">Cancel</button>
                      <button onClick={() => setEditing(a)} className="px-2 py-1 bg-blue-600 text-white rounded">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium mb-2">Past appointments</h2>
        <div className="card">
          {pastAppointments.length === 0 ? <div className="muted">No past appointments.</div> : (
            <ul className="space-y-2">
              {pastAppointments.map(a => (
                <li key={a.id} className="border rounded p-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{a.patientName} — {a.doctorName}</div>
                      <div className="muted text-sm">{new Date(a.datetime).toLocaleString()}</div>
                    </div>
                    <div className="muted">{a.status}</div>
                  </div>
                  <div className="mt-2 muted text-sm">Services: {serviceList(a.serviceIds)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Modal open={!!editing} onClose={()=>setEditing(null)} title="Edit Appointment">
        {editing && <AppointmentForm initial={editing} onSubmit={saveEdit} />}
      </Modal>
      <Modal open={!!details} onClose={()=>setDetails(null)} title="Appointment Details">
        <AppointmentDetails appointment={details} />
      </Modal>
    </div>
  )
}

function serviceList(ids: string[] = []){
  try{ const names = ids.map(id=> SERVICES.find(s=>s.id===id)?.name).filter(Boolean); return names.join(', ') }catch{ return '' }
}
