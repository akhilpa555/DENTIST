import React, { useState } from 'react'
import { INVENTORY as INIT_INVENTORY } from '../services/mockData'

const STORAGE_KEY = 'clinic_demo_data'

type Item = { id: string; name: string; quantity: number; unit: string }

function readInventory(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return INIT_INVENTORY as Item[]; const parsed = JSON.parse(raw); return parsed.inventory || INIT_INVENTORY }catch{ return INIT_INVENTORY }
}

export default function Inventory(){
  const [items, setItems] = useState<Item[]>(()=> readInventory())
  const [editing, setEditing] = useState<Item | null>(null)
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState<number | ''>('')
  const [unit, setUnit] = useState('pcs')
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState<string>('All')
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5)

  const persist = (next: Item[]) => {
    const payload = { inventory: next, appointments: [], patients: [], doctors: [] }
    try{ const raw = localStorage.getItem(STORAGE_KEY); if (raw) { const cur = JSON.parse(raw); payload.appointments = cur.appointments || []; payload.patients = cur.patients || []; payload.doctors = cur.doctors || [] } }catch{}
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !quantity) return
    if (editing) {
      const next = items.map(it=> it.id===editing.id ? { ...editing, name, quantity: Number(quantity), unit } : it)
      setItems(next); persist(next); setEditing(null)
    } else {
      const id = Math.random().toString(36).slice(2,9)
      const next = [{ id, name, quantity: Number(quantity), unit }, ...items]
      setItems(next); persist(next)
    }
    setName(''); setQuantity(''); setUnit('pcs')
  }

  const remove = (id:string) => { const next = items.filter(i=>i.id!==id); setItems(next); persist(next) }

  const filteredItems = items.filter(it=>{
    const q = search.trim().toLowerCase()
    if (q && !it.name.toLowerCase().includes(q)) return false
    if (unitFilter !== 'All' && it.unit !== unitFilter) return false
    if (lowStockOnly && it.quantity > lowStockThreshold) return false
    return true
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Inventory</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-sm muted">Item name</label>
              <input className="w-full border p-2 rounded" value={name} onChange={e=>setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="border p-2 rounded" value={quantity as any} onChange={e=>setQuantity(e.target.value as any)} placeholder="Quantity" />
              <select className="border p-2 rounded" value={unit} onChange={e=>setUnit(e.target.value)}>
                <option value="pcs">pcs</option>
                <option value="ml">ml</option>
                <option value="box">box</option>
              </select>
            </div>
            <div className="text-right">
              <button className="btn btn-primary" type="submit">{editing ? 'Save' : 'Add Item'}</button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="font-medium">Stock</h3>
            <div className="ml-auto flex items-center gap-2">
              <input placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} className="border px-2 py-1 rounded" />
              <select value={unitFilter} onChange={e=>setUnitFilter(e.target.value)} className="border px-2 py-1 rounded">
                <option value="All">All units</option>
                <option value="pcs">pcs</option>
                <option value="ml">ml</option>
                <option value="box">box</option>
              </select>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={lowStockOnly} onChange={e=>setLowStockOnly(e.target.checked)} /> Low stock
              </label>
              <input type="number" value={lowStockThreshold} onChange={e=>setLowStockThreshold(Number(e.target.value))} className="w-20 border px-2 py-1 rounded" />
            </div>
          </div>
          <ul className="space-y-2">
            {filteredItems.length === 0 && <li className="muted">No items match the filter.</li>}
            {filteredItems.map(it=> (
              <li key={it.id} className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{it.name}</div>
                  <div className="muted text-sm">{it.quantity} {it.unit}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>{ setEditing(it); setName(it.name); setQuantity(it.quantity); setUnit(it.unit) }}>Edit</button>
                  <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={()=>remove(it.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
