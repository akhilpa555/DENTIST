import React from 'react'
import { APPOINTMENTS, SERVICES } from '../services/mockData'

export default function Billing() {
  const appointment = APPOINTMENTS[0]
  const items = appointment.serviceIds.map(id => SERVICES.find(s => s.id === id)!)
  const total = items.reduce((s, i) => s + i.price, 0)

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Billing</h1>
      <div className="card max-w-md">
        <div className="font-medium mb-2">Bill for {appointment.patientName}</div>
        <ul className="mb-2">
          {items.map(it => (
            <li className="flex justify-between" key={it.id}><span>{it.name}</span><span>₹ {it.price}</span></li>
          ))}
        </ul>
        <div className="flex justify-between font-semibold border-t pt-2">Total <span>₹ {total}</span></div>
        <div className="mt-4">
          <button className="btn btn-primary">Mark Paid</button>
        </div>
      </div>
    </div>
  )
}
