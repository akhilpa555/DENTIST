import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) nav('/')
    else setError('Invalid credentials')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Sign in</h2>
        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}
        <label className="block mb-2 text-sm">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded mb-3" />
        <label className="block mb-2 text-sm">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded mb-4" />
        <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
        <div className="mt-4 text-xs text-gray-500">
          Use admin@clinic.com / Admin@123 or doctor@clinic.com / Doctor@123 or staff@clinic.com / Staff@123
        </div>
      </form>
    </div>
  )
}
