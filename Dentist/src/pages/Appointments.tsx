import React, { useState } from 'react'
import { APPOINTMENTS, PATIENTS, DOCTORS, SERVICES, Appointment } from '../services/mockData'
import Modal from '../components/Modal'
import AppointmentForm from '../components/AppointmentForm'

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS)
  const [editing, setEditing] = useState<any>(null)

  const cancel = (id: string) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Cancelled' } : a))
  const complete = (id: string) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'Completed' } : a))

  const saveEdit = (data: any) => {
    setAppointments(prev => prev.map(a => a.id === editing.id ? { ...a, ...data } : a))
    setEditing(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Appointments</h1>
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
            {appointments.map(a => (
              <tr key={a.id} className="border-t">
                <td className="py-2">{a.patientName}</td>
                <td>{a.doctorName}</td>
                <td>{new Date(a.datetime).toLocaleString()}</td>
                <td>{a.status}</td>
                <td className="space-x-2">
                  <button onClick={() => cancel(a.id)} className="px-2 py-1 bg-yellow-400 rounded">Cancel</button>
                  <button onClick={() => complete(a.id)} className="px-2 py-1 bg-green-500 text-white rounded">Complete</button>
                  <button onClick={() => setEditing(a)} className="px-2 py-1 bg-blue-600 text-white rounded">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!editing} onClose={()=>setEditing(null)} title="Edit Appointment">
        {editing && <AppointmentForm initial={editing} onSubmit={saveEdit} />}
      </Modal>
    </div>
  )
}
