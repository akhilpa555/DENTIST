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
}

export type Service = {
  id: string
  name: string
  price: number
}

export const SERVICES: Service[] = [
  { id: 's1', name: 'Consultation', price: 300 },
  { id: 's2', name: 'Root Canal', price: 4500 },
  { id: 's3', name: 'Braces', price: 25000 },
  { id: 's4', name: 'Cleaning', price: 800 },
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
]
