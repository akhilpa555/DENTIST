import React, { useMemo, useState } from 'react'
import { SERVICES, PATIENTS, INVOICES as INIT_INVOICES } from '../services/mockData'
import Modal from '../components/Modal'

const STORAGE_KEY = 'clinic_demo_data'

type LineItem = { id: string; serviceId: string; qty: number }
type Invoice = { id: string; patientId: string; patientName: string; date: string; items: LineItem[]; status: 'Unpaid' | 'Paid'; taxPercent: number; discount: number }

function normalizeInvoices(src: any[]): Invoice[] {
  return (src || []).map(s => {
    const items = (s.items || []).map((it: any) => ({ id: it.id || Math.random().toString(36).slice(2,9), serviceId: it.serviceId, qty: Number(it.qty || 1) }))
    return {
      id: s.id || Math.random().toString(36).slice(2,9),
      patientId: s.patientId || s.patientId || '',
      patientName: s.patientName || '',
      date: s.date || new Date().toISOString(),
      items,
      status: (s.status === 'Paid' ? 'Paid' : 'Unpaid') as Invoice['status'],
      taxPercent: Number(s.taxPercent || 0),
      discount: Number(s.discount || 0),
    }
  })
}

function readInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return normalizeInvoices(INIT_INVOICES as any[])
    const parsed = JSON.parse(raw)
    if (parsed.invoices) return normalizeInvoices(parsed.invoices)
    return []
  } catch { return normalizeInvoices(INIT_INVOICES as any[]) }
}

export default function Billing(){
  const [invoices, setInvoices] = useState<Invoice[]>(()=> readInvoices())
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Invoice | null>(null)
  const [filter, setFilter] = useState<'All'|'Paid'|'Unpaid'>('All')
  const [search, setSearch] = useState('')

  const persist = (next: Invoice[]) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) {
        const payload = { invoices: next }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        return
      }
      const cur = JSON.parse(raw)
      cur.invoices = next
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cur))
    } catch {
      const payload = { invoices: next }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    }
  }

  // map services to inventory item ids for demo consumption logic
  const serviceInventoryMap: Record<string, string[]> = {
    s2: ['i2'], // Root canal -> anaesthetic
    s7: ['i3'], // Filling -> composite material
    s4: ['i4'], // Scaling -> gauze
    s6: ['i5'], // Crown -> impression material
    // fallback will consume gloves (i1)
  }

  const createEmptyInvoice = (): Invoice => ({ id: Math.random().toString(36).slice(2,9), patientId: PATIENTS[0]?.id || '', patientName: PATIENTS[0]?.name || '', date: new Date().toISOString(), items: [], status: 'Unpaid', taxPercent: 0, discount: 0 })

  const openNew = () => { setEditing(createEmptyInvoice()); setOpen(true) }

  const remove = (id:string) => { const next = invoices.filter(i=>i.id!==id); setInvoices(next); persist(next) }

  const saveInvoice = (inv: Invoice) => {
    const exists = invoices.find(i=>i.id===inv.id)
    let next: Invoice[]
    if (exists) next = invoices.map(i=> i.id===inv.id ? inv : i)
    else next = [inv, ...invoices]
    setInvoices(next); persist(next);
    // decrement inventory based on invoice items (demo logic)
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw){
        const cur = JSON.parse(raw)
        const invItems = cur.inventory || []
        const updated = invItems.map((it: any) => ({ ...it }))
        inv.items.forEach(li => {
          const mapped = serviceInventoryMap[li.serviceId] || ['i1']
          mapped.forEach((iid) => {
            const found = updated.find((u: any) => u.id === iid)
            if (found) found.quantity = Math.max(0, found.quantity - li.qty)
          })
        })
        cur.inventory = updated
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cur))
      }
    }catch{}
    setOpen(false); setEditing(null)
  }

  const exportCSV = () => {
    const rows = [['Invoice ID','Patient','Date','Items','Total','Status']]
    filtered.forEach(inv => {
      const items = inv.items.map(it => {
        const s = SERVICES.find(x=>x.id===it.serviceId)
        return `${s?.name || it.serviceId} x${it.qty}`
      }).join(' | ')
      const total = inv.items.reduce((s, it) => { const svc = SERVICES.find(x=>x.id===it.serviceId)!; return s + svc.price * it.qty }, 0)
      const tax = total * (inv.taxPercent/100)
      const final = total + tax - (inv.discount||0)
      rows.push([inv.id, inv.patientName, new Date(inv.date).toLocaleString(), items, String(final), inv.status])
    })
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""') }"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `invoices_${new Date().toISOString().slice(0,10)}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  React.useEffect(()=>{
    const h = () => setInvoices(readInvoices())
    window.addEventListener('clinic:invoices-updated', h as any)
    return () => window.removeEventListener('clinic:invoices-updated', h as any)
  }, [])

  const togglePaid = (id:string) => {
    const next = invoices.map(i=> i.id===id ? { ...i, status: i.status==='Paid' ? ('Unpaid' as Invoice['status']) : ('Paid' as Invoice['status']) } : i)
    setInvoices(next); persist(next)
  }

  const filtered = useMemo(()=> invoices.filter(i=> {
    if (filter !== 'All' && i.status !== filter) return false
    const q = search.trim().toLowerCase()
    if (q && !i.patientName.toLowerCase().includes(q)) return false
    return true
  }), [invoices, filter, search])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Billing</h1>
        <div className="flex items-center gap-2">
          <input placeholder="Search by patient" value={search} onChange={e=>setSearch(e.target.value)} className="border p-2 rounded" />
          <select value={filter} onChange={e=>setFilter(e.target.value as any)} className="border p-2 rounded">
            <option value="All">All</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
          </select>
          <button className="btn" onClick={exportCSV}>Export CSV</button>
          <button className="btn btn-primary" onClick={openNew}>New Invoice</button>
        </div>
      </div>

      <div className="card">
        <ul className="space-y-2">
          {filtered.length === 0 && <li className="muted">No invoices found.</li>}
          {filtered.map(inv => (
            <li key={inv.id} className="flex justify-between items-center">
              <div>
                <div className="font-medium">{inv.patientName}</div>
                <div className="muted text-sm">{new Date(inv.date).toLocaleString()} • {inv.items.length} items</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="font-medium">₹{(() => {
                  const total = inv.items.reduce((s, it) => {
                    const svc = SERVICES.find(x=>x.id===it.serviceId)!
                    return s + svc.price * it.qty
                  }, 0)
                  const tax = total * (inv.taxPercent/100)
                  const final = total + tax - (inv.discount||0)
                  return final
                })()}</div>
                <button className="px-2 py-1 bg-blue-600 text-white rounded" onClick={()=>{ setEditing(inv); setOpen(true) }}>View/Edit</button>
                <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={()=>togglePaid(inv.id)}>{inv.status==='Paid' ? 'Mark Unpaid' : 'Mark Paid'}</button>
                <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={()=>remove(inv.id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <InvoiceModal open={open} invoice={editing} onClose={()=>{ setOpen(false); setEditing(null) }} onSave={saveInvoice} />
    </div>
  )
}

function InvoiceModal({ open, invoice, onClose, onSave }: { open: boolean; invoice: any; onClose: () => void; onSave: (i: Invoice) => void }){
  const [inv, setInv] = useState<Invoice | null>(invoice)
  React.useEffect(()=> setInv(invoice), [invoice])
  if (!inv) return null

  const addLine = () => {
    const id = Math.random().toString(36).slice(2,9)
    setInv({...inv, items: [...inv.items, { id, serviceId: SERVICES[0]?.id || '', qty: 1 }]})
  }

  const updateLine = (id: string, patch: Partial<LineItem>) => setInv(inv => inv ? ({ ...inv, items: inv.items.map(it=> it.id===id ? { ...it, ...patch } : it) }) : inv)
  const removeLine = (id: string) => setInv(inv => inv ? ({ ...inv, items: inv.items.filter(it=>it.id!==id) }) : inv)

  const computeTotals = () => {
    if (!inv) return { subtotal: 0, tax: 0, total: 0 }
    const subtotal = inv.items.reduce((s, it) => { const svc = SERVICES.find(x=>x.id===it.serviceId)!; return s + svc.price * it.qty }, 0)
    const tax = subtotal * (inv.taxPercent/100)
    const total = subtotal + tax - (inv.discount||0)
    return { subtotal, tax, total }
  }

  return (
    <Modal open={open} onClose={onClose} title={invoice ? 'Invoice' : 'New Invoice'}>
      <div className="space-y-3">
        <div>
          <label className="block text-sm muted">Patient</label>
          <select className="w-full border p-2 rounded" value={inv.patientId} onChange={e=>{ const id = e.target.value; const p = PATIENTS.find(x=>x.id===id); setInv(i=> i ? ({ ...i, patientId: id, patientName: p?.name || ''}) : i) }}>
            {PATIENTS.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <h4 className="font-medium">Line items</h4>
          <ul className="space-y-2">
            {inv.items.map(it=> (
              <li key={it.id} className="flex gap-2 items-center">
                <select className="border p-2 rounded flex-1" value={it.serviceId} onChange={e=>updateLine(it.id, { serviceId: e.target.value })}>
                  {SERVICES.map(s=> <option key={s.id} value={s.id}>{s.name} — ₹{s.price}</option>)}
                </select>
                <input type="number" className="w-24 border p-2 rounded" value={it.qty} onChange={e=>updateLine(it.id, { qty: Number(e.target.value) })} />
                <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={()=>removeLine(it.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <div className="mt-2"><button className="btn btn-primary" onClick={addLine}>Add line</button></div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-sm muted">Tax %</label>
            <input type="number" className="w-full border p-2 rounded" value={inv.taxPercent} onChange={e=> setInv(i=> i ? ({ ...i, taxPercent: Number(e.target.value) }) : i)} />
          </div>
          <div>
            <label className="block text-sm muted">Discount (INR)</label>
            <input type="number" className="w-full border p-2 rounded" value={inv.discount} onChange={e=> setInv(i=> i ? ({ ...i, discount: Number(e.target.value) }) : i)} />
          </div>
          <div>
            <label className="block text-sm muted">Date</label>
            <input type="datetime-local" className="w-full border p-2 rounded" value={new Date(inv.date).toISOString().slice(0,16)} onChange={e=> setInv(i=> i ? ({ ...i, date: new Date(e.target.value).toISOString() }) : i)} />
          </div>
        </div>

        <div className="border-t pt-3">
          {(() => {
            const t = computeTotals();
            return (
              <div className="space-y-1">
                <div className="flex justify-between"><div className="muted">Subtotal</div><div>₹{t.subtotal}</div></div>
                <div className="flex justify-between"><div className="muted">Tax</div><div>₹{t.tax}</div></div>
                <div className="flex justify-between"><div className="muted">Discount</div><div>- ₹{inv.discount}</div></div>
                <div className="flex justify-between font-semibold">Total <div>₹{t.total}</div></div>
              </div>
            )
          })()}
        </div>

        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={()=> onSave(inv)}>Save Invoice</button>
        </div>
      </div>
    </Modal>
  )
}
