import React from 'react'
import { DOCTORS } from '../services/mockData'

export default function Doctors() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Doctors</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCTORS.map(d => (
          <div key={d.id} className="card">
            <div className="font-medium">{d.name}</div>
            <div className="muted">{d.specialization}</div>
            <div className="mt-2 muted">Availability: {d.availability.join(', ')}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
