import React, { useState } from 'react'

type Patient = {
  id?: string
  name: string
  email?: string
  phone?: string
  age?: number
  gender?: string
}

export default function PatientForm({ initial, onSubmit }: { initial?: Patient; onSubmit: (p: Patient) => void }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [age, setAge] = useState(initial?.age ?? '')
  const [gender, setGender] = useState(initial?.gender ?? '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ id: initial?.id, name, email, phone, age: age ? Number(age) : undefined, gender })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="block text-sm mb-1">Full name</label>
        <input className="w-full border p-2 rounded" value={name} onChange={e=>setName(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input className="w-full border p-2 rounded" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input className="w-full border p-2 rounded" value={phone} onChange={e=>setPhone(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Age</label>
          <input className="w-full border p-2 rounded" value={age} onChange={e=>setAge(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Gender</label>
          <select className="w-full border p-2 rounded" value={gender} onChange={e=>setGender(e.target.value)}>
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary">Save Patient</button>
      </div>
    </form>
  )
}
