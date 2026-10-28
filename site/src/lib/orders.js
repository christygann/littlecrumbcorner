import { useEffect, useMemo, useState } from 'react'
import { db } from './supabase.js'
import { LOGO_SRC } from '../data.js'
import { readJSON, writeJSON } from './helpers.js'

const NOT_CONFIGURED = 'Ordering is not set up yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
const GENERIC = 'Something went wrong. Please try again or message us on Telegram.'

// Errors raised by place_online_order() are written for customers; anything
// else (network, auth) gets the generic message.
const customerMessage = (err) => (err?.code === 'P0001' && err.message) || GENERIC

// Turns menu_items + their online_products into menu cards.
// An item shows as sold out when it's marked sold out or every size is;
// hidden items and sizes aren't shown at all.
export function buildMenu(rows) {
  const menu = rows
    .filter(i => i.status !== 'hidden')
    .sort((a, b) => a.sort - b.sort)
    .map(i => {
      const photo = i.photo_url || LOGO_SRC
      const options = (i.online_products || [])
        .filter(p => p.status !== 'hidden')
        .sort((a, b) => a.sort - b.sort)
        .map(p => ({
          id: p.id, group: i.id, option: p.option, name: p.name, unit: p.unit, photo,
          price: Number(p.price), soldOut: p.status === 'sold_out',
        }))
      const status = i.status === 'available' && options.every(o => o.soldOut) ? 'sold_out' : i.status
      const unavailable = status !== 'available'
      return {
        id: i.id, name: i.name, tag: i.tag, blurb: i.blurb, photo, hasPhoto: !!i.photo_url, status, unavailable,
        options: options.map(o => ({ ...o, unavailable: unavailable || o.soldOut })),
      }
    })
    .filter(g => g.options.length)
  const byId = Object.fromEntries(menu.flatMap(g => g.options).map(p => [p.id, p]))
  return { menu, byId }
}

// The live menu. Everything on it is managed from the admin's Menu tab.
export function useMenu() {
  const [state, setState] = useState({ rows: [], loading: !!db, error: db ? null : NOT_CONFIGURED })
  useEffect(() => {
    if (!db) return
    const load = () => db.from('menu_items').select('*, online_products(*)').then(({ data, error }) => {
      setState(prev => error ? { ...prev, loading: false, error: prev.rows.length ? null : GENERIC } : { rows: data, loading: false, error: null })
    })
    load()
    // pick up sold-out changes when a customer comes back to the tab
    window.addEventListener('focus', load)
    return () => window.removeEventListener('focus', load)
  }, [])
  const built = useMemo(() => buildMenu(state.rows), [state.rows])
  return { ...built, loading: state.loading, error: state.error }
}

// Uploads the PayNow screenshot (a JPEG data URL), returning its storage path.
async function uploadProof(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob()
  const path = `${crypto.randomUUID()}.jpg`
  const { error } = await db.storage.from('payment-proofs').upload(path, blob, { contentType: 'image/jpeg' })
  if (error) throw new Error('We couldn’t upload your screenshot. Please try again.')
  return path
}

export async function placeOrder(form, lines) {
  if (!db) throw new Error(NOT_CONFIGURED)
  const proofPath = await uploadProof(form.proof.url)
  const { data, error } = await db.rpc('place_online_order', {
    p: {
      method: form.method, date: form.date, slot: form.slot,
      street: form.street, unit: form.unit, postal: form.postal,
      name: form.name, phone: form.phone, email: form.email, note: form.note,
      telegram: form.telegram.trim() ? '@' + form.telegram.trim().replace(/^@/, '') : '',
      proofPath,
      items: lines.map(l => ({ id: l.id, qty: l.qty })),
    },
  })
  if (error) throw new Error(customerMessage(error))
  return data
}

export async function lookupOrder(number, phone) {
  if (!db) throw new Error(NOT_CONFIGURED)
  const { data, error } = await db.rpc('lookup_online_order', { p_number: number, p_phone: phone })
  if (error) throw new Error(GENERIC)
  return data
}

// ── orders placed on this device ──
// Only the number + phone are kept locally; status is always fetched fresh.

const DEVICE_KEY = 'lcc-my-orders-v1'

export const rememberOrder = (o) => {
  const list = readJSON(DEVICE_KEY, []).filter(x => x.number !== o.number)
  writeJSON(DEVICE_KEY, [{ number: o.number, phone: o.phone }, ...list])
}

export async function loadDeviceOrders() {
  const refs = readJSON(DEVICE_KEY, [])
  if (!refs.length || !db) return []
  const found = await Promise.all(refs.map(r => lookupOrder(r.number, r.phone).catch(() => null)))
  return found.filter(Boolean)
}
