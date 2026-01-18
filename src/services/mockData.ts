const uid = () => Math.random().toString(36).slice(2, 9)

export type Appointment = {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  datetime: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
  serviceIds: string[]
}

export type Patient = {
  id: string
  name: string
  email?: string
  phone?: string
  age?: number
  gender?: string
  visits?: Array<{ date: string; notes: string }>
}

export type Doctor = {
  id: string
  name: string
  specialization: string
  availability: string[]
  avatar?: string
}

export type Service = {
  id: string
  name: string
  price: number
}

export const SERVICES: Service[] = [
  { id: 's1', name: 'Consultation', price: 300 },
  { id: 's2', name: 'Root Canal (Single Visit)', price: 4500 },
  { id: 's3', name: 'Braces - Metal (Full Treatment)', price: 25000 },
  { id: 's4', name: 'Scaling & Polishing', price: 800 },
  { id: 's5', name: 'Tooth Extraction', price: 1200 },
  { id: 's6', name: 'Crown (Porcelain)', price: 8000 },
  { id: 's7', name: 'Filling (Composite)', price: 1500 },
  { id: 's8', name: 'Whitening', price: 3000 },
  { id: 's9', name: 'Orthodontic Consultation', price: 500 },
  { id: 's10', name: 'Emergency Care', price: 2000 },
]

export type InventoryItem = {
  id: string
  name: string
  quantity: number
  unit: string
}

export const INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Nitrile Gloves (Box of 100)', quantity: 12, unit: 'box' },
  { id: 'i2', name: 'Local Anaesthetic Cartridge', quantity: 45, unit: 'pcs' },
  { id: 'i3', name: 'Composite Filling Material (Syringe)', quantity: 8, unit: 'pcs' },
  { id: 'i4', name: 'Gauze (Pack)', quantity: 20, unit: 'box' },
  { id: 'i5', name: 'Impression Material (500g)', quantity: 3, unit: 'box' },
]

export const DOCTORS: Doctor[] = [
  { id: 'd1', name: 'Dr. Akhila Issa', specialization: 'Endodontist', availability: ['Mon', 'Wed', 'Fri'] },
  { id: 'd2', name: 'Dr. Jerin T Abraham', specialization: 'Orthodontist', availability: ['Tue', 'Thu'] },
]

export const PATIENTS: Patient[] = [
  { id: 'p1', name: 'Asha Singh', email: 'asha@example.com', phone: '9876543210', age: 29, gender: 'F', visits: [{ date: '2025-12-01', notes: 'Cleaning' }] },
  { id: 'p2', name: 'Vikram Kumar', email: 'vikram@example.com', phone: '9123456780', age: 35, gender: 'M', visits: [{ date: '2025-11-12', notes: 'Root canal' }] },
  { id: 'p3', name: 'Patient User', email: 'patient@clinic.com', phone: '9000000000', age: 30, gender: 'O', visits: [] },
]

export const APPOINTMENTS: Appointment[] = [
  { id: uid(), patientId: 'p1', patientName: 'Asha Singh', doctorId: 'd1', doctorName: 'Dr. Akhila Issa', datetime: new Date().toISOString(), status: 'Scheduled', serviceIds: ['s1'] },
  { id: uid(), patientId: 'p2', patientName: 'Vikram Kumar', doctorId: 'd2', doctorName: 'Dr. Jerin T Abraham', datetime: new Date(Date.now() + 3600 * 1000).toISOString(), status: 'Scheduled', serviceIds: ['s2'] },
  // additional sample appointments for today (useful for calendar/testing)
  { id: uid(), patientId: 'p3', patientName: 'Patient User', doctorId: 'd1', doctorName: 'Dr. Akhila Issa', datetime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 9, 0).toISOString(), status: 'Scheduled', serviceIds: ['s1'] },
  { id: uid(), patientId: 'p1', patientName: 'Asha Singh', doctorId: 'd2', doctorName: 'Dr. Jerin T Abraham', datetime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 10, 30).toISOString(), status: 'Scheduled', serviceIds: ['s4'] },
  { id: uid(), patientId: 'p2', patientName: 'Vikram Kumar', doctorId: 'd1', doctorName: 'Dr. Akhila Issa', datetime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 11, 30).toISOString(), status: 'Scheduled', serviceIds: ['s2'] },
  { id: uid(), patientId: 'p3', patientName: 'Patient User', doctorId: 'd2', doctorName: 'Dr. Jerin T Abraham', datetime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 14, 0).toISOString(), status: 'Scheduled', serviceIds: ['s3'] },
  { id: uid(), patientId: 'p1', patientName: 'Asha Singh', doctorId: 'd1', doctorName: 'Dr. Akhila Issa', datetime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 15, 30).toISOString(), status: 'Scheduled', serviceIds: ['s4'] },
  // extra seeds
  { id: uid(), patientId: 'p2', patientName: 'Vikram Kumar', doctorId: 'd2', doctorName: 'Dr. Jerin T Abraham', datetime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 8, 30).toISOString(), status: 'Scheduled', serviceIds: ['s1'] },
  { id: uid(), patientId: 'p3', patientName: 'Patient User', doctorId: 'd1', doctorName: 'Dr. Akhila Issa', datetime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 12, 0).toISOString(), status: 'Scheduled', serviceIds: ['s2'] },
  { id: uid(), patientId: 'p1', patientName: 'Asha Singh', doctorId: 'd2', doctorName: 'Dr. Jerin T Abraham', datetime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()+1, 9, 0).toISOString(), status: 'Scheduled', serviceIds: ['s1'] },
]

export type Invoice = {
  id: string
  patientId: string
  patientName: string
  date: string
  items: { serviceId: string; qty: number }[]
  taxPercent?: number
  discount?: number
  status?: 'Unpaid' | 'Paid'
}

// Some example invoices so Billing has sample data
export const INVOICES: Invoice[] = [
  { id: 'inv1', patientId: 'p1', patientName: 'Asha Singh', date: new Date().toISOString(), items: [ { serviceId: 's4', qty: 1 }, { serviceId: 's1', qty: 1 } ], taxPercent: 18, discount: 0, status: 'Paid' },
  { id: 'inv2', patientId: 'p2', patientName: 'Vikram Kumar', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), items: [ { serviceId: 's2', qty: 1 } ], taxPercent: 18, discount: 200, status: 'Unpaid' },
  { id: 'inv3', patientId: 'p3', patientName: 'Patient User', date: new Date().toISOString(), items: [ { serviceId: 's1', qty: 1 } ], taxPercent: 0, discount: 0, status: 'Unpaid' },
  { id: 'inv4', patientId: 'p1', patientName: 'Asha Singh', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), items: [ { serviceId: 's6', qty: 1 }, { serviceId: 's7', qty: 2 } ], taxPercent: 12, discount: 500, status: 'Paid' },
  { id: 'inv5', patientId: 'p2', patientName: 'Vikram Kumar', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(), items: [ { serviceId: 's3', qty: 1 } ], taxPercent: 5, discount: 0, status: 'Paid' },
  { id: 'inv6', patientId: 'p3', patientName: 'Patient User', date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), items: [ { serviceId: 's8', qty: 1 }, { serviceId: 's1', qty: 1 } ], taxPercent: 18, discount: 300, status: 'Unpaid' },
  { id: 'inv7', patientId: 'p1', patientName: 'Asha Singh', date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), items: [ { serviceId: 's5', qty: 1 } ], taxPercent: 0, discount: 0, status: 'Paid' },
]
