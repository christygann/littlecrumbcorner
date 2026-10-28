import { useCallback, useEffect, useState } from 'react'
import { db } from './supabase.js'

// Keep in step with site/src/data.js and place_online_order() in setup.sql
export const FULFILMENT = {
  collect: { label: 'self-collection', fee: 0, location: 'Paya Lebar MRT · Exit E', days: { 6: '6:00pm', 0: '12:00pm' } },
  deliver: { label: 'islandwide delivery', fee: 10, slots: ['10:00 — 13:00', '14:00 — 17:00', '18:00 — 21:00'] },
}

export const WEB_STATUS = {
  placed:    { label: 'placed',         bg: 'bg-deep-rose/[0.10]', badge: 'bg-deep-rose/20 text-deep-rose' },
  prepared:  { label: 'being prepared', bg: 'bg-blush/40',         badge: 'bg-blush text-deep-rose' },
  ready:     { label: 'ready',          bg: 'bg-sage-light/60',    badge: 'bg-sage-light text-pine' },
  completed: { label: 'completed',      bg: 'bg-white',            badge: 'bg-cocoa/8 text-cocoa/70' },
  cancelled: { label: 'cancelled',      bg: 'bg-linen/70',         badge: 'bg-cocoa/10 text-cocoa/70' },
}
export const WEB_STATUS_KEYS = Object.keys(WEB_STATUS)
export const NEXT_STATUS = { placed: 'prepared', prepared: 'ready', ready: 'completed' }
export const nextLabel = o => ({
  placed: 'start preparing',
  prepared: 'mark ready',
  ready: o.method === 'collect' ? 'mark collected' : 'mark delivered',
})[o.status]

export const fmt = n => '$' + Number(n).toFixed(2)

// Dates are 'YYYY-MM-DD' strings (fulfil_date), compared as strings and read in local time.
const localKey = d => d.toLocaleDateString('en-CA')
export const todayKey = () => localKey(new Date())
export const addDaysKey = n => { const d = new Date(); d.setDate(d.getDate() + n); return localKey(d) }
const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d) }
export const dowOf  = k => fromKey(k).getDay()
export const fmtDow = k => fromKey(k).toLocaleDateString('en-SG', { weekday: 'short', day: 'numeric', month: 'short' })
export const fmtDay = k => fromKey(k).toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'short' })
export const fmtPlaced = iso => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-SG', { day: 'numeric', month: 'short' }) + ' · ' +
    d.toLocaleTimeString('en-SG', { hour: 'numeric', minute: '2-digit', hour12: true })
}
export const subtotalOf = o => o.items.reduce((s, i) => s + i.qty * i.price, 0)

const fromRow = r => ({
  ...r,
  placedAt: r.created_at,
  date: String(r.fulfil_date).slice(0, 10),
  items: (r.items || []).map(i => ({ ...i, price: Number(i.price) })),
  fee: Number(r.fee),
  total: Number(r.total),
})

const toRow = ({ status, method, date, slot, name, phone, telegram, email, note, address, items, fee, total, paid }) => ({
  status, method, fulfil_date: date, slot, name, phone,
  telegram: telegram || null, email: email || null, note: note || null,
  address: method === 'deliver' ? address || null : null,
  items, subtotal: +(total - fee).toFixed(2), fee, total, paid,
})

export function useOnlineOrders() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    const [o, p] = await Promise.all([
      db.from('online_orders').select('*').order('fulfil_date').order('slot'),
      db.from('online_products').select('*').order('sort'),
    ])
    if (o.error || p.error) setError((o.error || p.error).message)
    else {
      setError(null)
      setOrders(o.data.map(fromRow))
      setProducts(p.data.map(r => ({ ...r, price: Number(r.price) })))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
    // new orders come in while the tab sits open — refresh when you come back to it
    window.addEventListener('focus', reload)
    return () => window.removeEventListener('focus', reload)
  }, [reload])

  const update = async (o, patch) => {
    const next = { ...o, ...patch }
    setOrders(prev => prev.map(x => x.id === o.id ? next : x))
    const { error: err } = await db.from('online_orders').update(toRow(next)).eq('id', o.id)
    if (err) { setError(err.message); reload() }
  }

  const remove = async (o) => {
    setOrders(prev => prev.filter(x => x.id !== o.id))
    const { error: err } = await db.from('online_orders').delete().eq('id', o.id)
    if (err) { setError(err.message); reload(); return }
    if (o.proof_path) await db.storage.from('payment-proofs').remove([o.proof_path])
  }

  return { orders, products, loading, error, reload, update, remove }
}

export async function proofUrl(path) {
  if (!path) return null
  const { data } = await db.storage.from('payment-proofs').createSignedUrl(path, 300)
  return data?.signedUrl ?? null
}

export function exportOnlineCSV(orders) {
  const head = ['Order', 'Placed', 'Fulfilment', 'Date', 'Slot', 'Name', 'Phone', 'Telegram', 'Email', 'Address', 'Items', 'Subtotal', 'Fee', 'Total', 'Paid', 'Status', 'Note']
  const rows = orders.map(o => [
    o.number, new Date(o.placedAt).toLocaleString('en-SG'), FULFILMENT[o.method].label, o.date, o.slot,
    o.name, o.phone, o.telegram || '', o.email || '', o.address || '',
    o.items.map(i => `${i.qty}x ${i.name}`).join('; '),
    subtotalOf(o).toFixed(2), o.fee.toFixed(2), o.total.toFixed(2),
    o.paid ? 'yes' : 'no', WEB_STATUS[o.status]?.label || o.status, o.note || '',
  ])
  const csv = [head, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  a.download = `online-orders-${todayKey()}.csv`
  a.click()
}
