import React, { useState } from 'react'
import { Doctor } from '../services/mockData'

export default function DoctorForm({ initial, onSubmit }: { initial?: Doctor; onSubmit: (d: Doctor) => void }){
  const [name, setName] = useState(initial?.name ?? '')
  const [spec, setSpec] = useState(initial?.specialization ?? '')
  const [availability, setAvailability] = useState((initial?.availability ?? []).join(', '))
  const [avatar, setAvatar] = useState<string | undefined>(initial?.avatar)

  const handleFile = (f: File | null) => {
    if (!f) return setAvatar(undefined)
    const reader = new FileReader()
    reader.onload = () => setAvatar(String(reader.result))
    reader.readAsDataURL(f)
  }

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    const payload: Doctor = {
      id: initial?.id ?? Math.random().toString(36).slice(2,9),
      name: name.trim(),
      specialization: spec.trim(),
  availability: availability.split(',').map(s=>s.trim()).filter(Boolean),
  avatar
    }
    onSubmit(payload)
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium">Specialization</label>
        <input value={spec} onChange={e=>setSpec(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium">Availability (comma separated)</label>
        <input value={availability} onChange={e=>setAvailability(e.target.value)} className="w-full border px-2 py-1 rounded" />
      </div>
      <div>
        <label className="block text-sm font-medium">Avatar</label>
        <div className="flex items-center gap-3">
          {avatar ? <img src={avatar} alt="avatar" className="w-12 h-12 rounded-full" /> : <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">{(name||'')[0] || '?'}</div>}
          <input type="file" accept="image/*" onChange={e=>handleFile(e.target.files?.[0] ?? null)} />
        </div>
      </div>
      <div className="text-right">
        <button className="btn btn-primary" type="submit">Save</button>
      </div>
    </form>
  )
}
