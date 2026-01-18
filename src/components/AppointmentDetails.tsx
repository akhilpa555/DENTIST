import React from 'react'
import { Appointment, SERVICES } from '../services/mockData'
import { INVOICES } from '../services/mockData'

const STORAGE_KEY = 'clinic_demo_data'

export default function AppointmentDetails({ appointment }: { appointment: Appointment | null }){
  if (!appointment) return <div className="p-4">No appointment selected.</div>
  const services = appointment.serviceIds.map(id => SERVICES.find(s=>s.id===id)).filter(Boolean) as any[]
  const total = services.reduce((s:number, it:any)=> s + (it?.price||0), 0)

  const createInvoiceFromAppointment = (print = false) => {
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      const cur = raw ? JSON.parse(raw) : {}
      const items = appointment.serviceIds.map(id=> ({ serviceId: id, qty: 1 }))
      const inv = { id: Math.random().toString(36).slice(2,9), patientId: appointment.patientId, patientName: appointment.patientName, date: new Date().toISOString(), items, taxPercent: 0, discount: 0, status: 'Unpaid' }
      cur.invoices = cur.invoices ? [...cur.invoices, inv] : [inv]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cur))
      // notify Billing to refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent('clinic:invoices-updated', { detail: inv }))
      if (print) {
        // open a simple print window
        const w = window.open('', '_blank')
        if (w) {
          w.document.write(`<pre>Invoice ${inv.id}\nPatient: ${inv.patientName}\nDate: ${new Date(inv.date).toLocaleString()}\nItems:\n${appointment.serviceIds.map(id=> SERVICES.find(s=>s.id===id)?.name + ' - ₹' + (SERVICES.find(s=>s.id===id)?.price)).join('\n')}\nTotal: ₹${total}</pre>`)
          w.document.close(); w.print(); w.close()
        }
      }
    }catch{}
  }

  return (
    <div className="p-4 space-y-2">
      <div className="font-medium text-lg">{appointment.patientName}</div>
      <div className="muted">Patient ID: {appointment.patientId}</div>
      <div className="mt-2">Doctor: <strong>{appointment.doctorName}</strong> (ID: {appointment.doctorId})</div>
      <div>Time: {new Date(appointment.datetime).toLocaleString()}</div>
      <div>Status: {appointment.status}</div>
      <div>
        <div className="muted">Services</div>
        <ul>
          {services.map(s=> <li key={s.id}>{s.name} — ₹{s.price}</li>)}
        </ul>
      </div>
      <div className="font-medium">Total: ₹{total}</div>
      <div className="flex gap-2 mt-2">
        <button className="btn btn-primary" onClick={()=>createInvoiceFromAppointment(false)}>Create Invoice</button>
        <button className="btn btn-outline" onClick={()=>createInvoiceFromAppointment(true)}>Create & Print</button>
      </div>
    </div>
  )
}
