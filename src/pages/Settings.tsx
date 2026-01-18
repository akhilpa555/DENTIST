import React from 'react'

export default function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <div className="bg-white p-4 rounded shadow max-w-md">
        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Clinic Name</label>
          <input className="w-full border px-3 py-2 rounded" defaultValue="Bheemanady Dental Clinic BDC" />
        </div>
        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Working hours</label>
          <input className="w-full border px-3 py-2 rounded" defaultValue="09:00 - 18:00" />
        </div>
      </div>
    </div>
  )
}
