import { useEffect, useState } from 'react'
import { db } from './supabase.js'
import { PRODUCTS, buildMenu } from '../data.js'
import { readJSON, writeJSON } from './helpers.js'

const NOT_CONFIGURED = 'Ordering is not set up yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env'
const GENERIC = 'Something went wrong. Please try again or message us on Telegram.'

// Errors raised by place_online_order() are written for customers; anything
// else (network, auth) gets the generic message.
const customerMessage = (err) => (err?.code === 'P0001' && err.message) || GENERIC

// Menu with live prices and availability from online_products.
export function useProducts() {
  const [products, setProducts] = useState(PRODUCTS)
  useEffect(() => {
    if (!db) return
    db.from('online_products').select('id, price, available').then(({ data }) => {
      if (!data?.length) return
      const live = Object.fromEntries(data.map(r => [r.id, r]))
      setProducts(PRODUCTS
        .filter(p => live[p.id])
        .map(p => ({ ...p, price: Number(live[p.id].price), available: live[p.id].available })))
    })
  }, [])
  return buildMenu(products)
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
