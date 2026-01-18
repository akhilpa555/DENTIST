import React, { createContext, useContext, useEffect, useState } from 'react'

type Role = 'admin' | 'doctor' | 'receptionist' | 'patient'

type User = {
  email: string
  role: Role
  name: string
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const CREDENTIALS: Record<string, { password: string; role: Role; name: string }> = {
  'admin@clinic.com': { password: 'Admin@123', role: 'admin', name: 'Clinic Admin' },
  'doctor@clinic.com': { password: 'Doctor@123', role: 'doctor', name: 'Dr. Akhila Issa' },
  'staff@clinic.com': { password: 'Staff@123', role: 'receptionist', name: 'Reception' },
  'patient@clinic.com': { password: 'Patient@123', role: 'patient', name: 'Patient User' },
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('clinic_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem('clinic_user', JSON.stringify(user))
    else localStorage.removeItem('clinic_user')
  }, [user])

  const login = async (email: string, password: string) => {
    const found = CREDENTIALS[email]
    if (found && found.password === password) {
      const u: User = { email, role: found.role, name: found.name }
      setUser(u)
      return true
    }
    return false
  }

  const logout = () => setUser(null)

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
