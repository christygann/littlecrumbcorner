import { LEAD_DAYS } from '../data.js'

export const fmt = (n) => '$' + Number(n).toFixed(2)

// Dates travel as 'YYYY-MM-DD' (the fulfil_date column), read in local time.
export const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromDateKey = (key) => {
  const [y, m, d] = String(key).slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Next `count` days from LEAD_DAYS ahead. With `days`, only those weekdays;
// otherwise every day except Monday (no deliveries on Mondays).
export const upcomingDates = (count = 8, days = null) => {
  const out = []
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + LEAD_DAYS)
  while (out.length < count) {
    if (days ? days.includes(d.getDay()) : d.getDay() !== 1) out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

export const fmtDay   = (key) => fromDateKey(key).toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'short' })
export const fmtDow   = (key) => fromDateKey(key).toLocaleDateString('en-SG', { weekday: 'long' })
export const fmtShort = (iso) => new Date(iso).toLocaleDateString('en-SG', { day: '2-digit', month: 'short', year: 'numeric' })

export const readJSON = (k, fb) => {
  try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb } catch { return fb }
}
export const writeJSON = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage full or blocked */ }
}

export const cartLines = (cart, byId) => cart
  .map(c => ({ ...c, product: byId[c.id] }))
  .filter(l => l.product && !l.product.unavailable)
  .map(l => ({ ...l, subtotal: l.product.price * l.qty }))
export const cartCount    = (cart, byId) => cartLines(cart, byId).reduce((s, l) => s + l.qty, 0)
export const cartSubtotal = (cart, byId) => cartLines(cart, byId).reduce((s, l) => s + l.subtotal, 0)

export const normPhone = (p) => (p || '').replace(/\D/g, '').slice(-8)
