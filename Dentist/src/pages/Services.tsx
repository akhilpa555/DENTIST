import React from 'react'
import { SERVICES } from '../services/mockData'

export default function Services() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Services & Pricing</h1>
      <div className="card">
        <ul className="space-y-2">
          {SERVICES.map(s => (
            <li key={s.id} className="flex justify-between">
              <div>{s.name}</div>
              <div className="font-medium">₹ {s.price}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
