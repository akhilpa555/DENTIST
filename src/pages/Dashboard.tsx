import React from 'react'
import { APPOINTMENTS as INIT_APPOINTMENTS, PATIENTS as INIT_PATIENTS, DOCTORS } from '../services/mockData'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import AppointmentForm from '../components/AppointmentForm'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'clinic_demo_data'

function StatCard({ title, value, icon, onClick }: { title: string; value: string | number; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="card flex items-center justify-between text-left hover:shadow-md transition-shadow">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
      <div className="text-3xl text-blue-600">{icon}</div>
    </button>
  )
}

type AppType = {
  id: string
  patientName: string
  doctorName: string
  datetime: string
  status: string
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [appointments, setAppointments] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw).appointments } catch {};
    return INIT_APPOINTMENTS
  })
  const [patients, setPatients] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) return JSON.parse(raw).patients } catch {};
    return INIT_PATIENTS
  })
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState<any>(null)

  const persist = (next: any) => {
    const payload = { appointments: next, patients }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  const handleCreate = (data: any) => {
    const id = Math.random().toString(36).slice(2,9)
    const patient = patients.find((p:any)=>p.id===data.patientId)
    const doctor = DOCTORS.find(d=>d.id===data.doctorId)
    const newA = { id, patientId: data.patientId, patientName: patient?.name || 'Unknown', doctorId: data.doctorId, doctorName: doctor?.name || 'Doctor', datetime: data.datetime, status: 'Scheduled', serviceIds: data.serviceIds }
    const next = [newA, ...appointments]
    setAppointments(next)
    persist(next)
    setOpenCreate(false)
  }

  const handleEdit = (id:string, data:any) => {
    const next = appointments.map((a: AppType) => a.id===id ? { ...a, ...data } : a)
    setAppointments(next)
    persist(next)
    setOpenEdit(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Welcome to Bheemanady Dental Clinic BDC</h1>
          <p className="muted">Effortless appointments and patient care</p>
        </div>
        <div className="w-64">
          <img src="/src/assets/dental-hero.svg" alt="hero" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard title="Today's Appointments" value={user?.role === 'patient' ? (appointments.filter((a:any)=> a.patientId === patients.find((p:any)=>p.email===user.email)?.id).length) : appointments.length} icon={<span>🗓️</span>} onClick={() => navigate('/appointments')} />
        <StatCard title="Total Patients" value={patients.length} icon={<span>👥</span>} onClick={() => navigate('/patients')} />
        <StatCard title="Doctors Available" value={DOCTORS.length} icon={<span>🩺</span>} onClick={() => navigate('/doctors')} />
        {user?.role !== 'patient' && (
          <StatCard title="Revenue (mock)" value={`₹ ${123456}`} icon={<span>💰</span>} onClick={() => navigate('/reports')} />
        )}
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4">Upcoming Appointments</h2>
        <ul className="space-y-2">
          {(() => {
            const myId = user?.role === 'patient' ? patients.find((p:any)=>p.email === user.email)?.id : null
            const visible = myId ? appointments.filter((a:any)=> a.patientId === myId) : appointments
            return visible.slice(0,5).map((a: AppType) => (
              <li key={a.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.patientName}</div>
                  <div className="muted">{a.doctorName} • {new Date(a.datetime).toLocaleString()}</div>
                </div>
                <div className={`px-3 py-1 rounded text-sm ${a.status === 'Scheduled' ? 'bg-blue-50 text-blue-700' : a.status === 'Completed' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{a.status}</div>
              </li>
            ))
          })()}
        </ul>
      </div>

      <div className="mt-6 flex gap-3">
        <button className="btn btn-primary" onClick={() => setOpenCreate(true)}>Create Appointment</button>
        <button className="btn" onClick={() => alert('Open patients list')}>View Patients</button>
      </div>

      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Create Appointment">
        <AppointmentForm onSubmit={handleCreate} />
      </Modal>

      <Modal open={!!openEdit} onClose={() => setOpenEdit(null)} title="Edit Appointment">
        {openEdit && <AppointmentForm initial={openEdit} onSubmit={(data)=> handleEdit(openEdit.id, data)} />}
      </Modal>
    </div>
  )
}
