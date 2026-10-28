import { useCallback, useEffect, useState } from 'react'
import { db } from './supabase.js'

// Keep in step with the CHECK constraints in setup.sql
export const ITEM_STATUS = {
  available:   { label: 'available',   badge: 'bg-sage-light text-pine',          hint: 'on the site and can be ordered' },
  sold_out:    { label: 'sold out',    badge: 'bg-blush text-deep-rose',          hint: 'shown with a "sold out" label, can’t be ordered' },
  unavailable: { label: 'unavailable', badge: 'bg-cocoa/10 text-cocoa/70',        hint: 'shown with an "unavailable" label, can’t be ordered' },
  hidden:      { label: 'hidden',      badge: 'bg-white text-cocoa/60 border border-cocoa/20', hint: 'not shown on the site' },
}
export const SIZE_STATUS = {
  available: ITEM_STATUS.available,
  sold_out:  ITEM_STATUS.sold_out,
  hidden:    ITEM_STATUS.hidden,
}

const BUCKET = 'menu-photos'
const rand = () => Math.random().toString(36).slice(2, 6)
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'item'

// The name saved on orders: "double fudge brownie (box of 9, 7" × 7")"
export const sizeName = (itemName, option, sizeCount) =>
  sizeCount > 1 && option.trim() ? `${itemName.trim()} (${option.trim().replace(/\s*·\s*/g, ', ')})` : itemName.trim()

const sortRows = rows => rows
  .map(i => ({ ...i, sizes: (i.online_products || []).map(p => ({ ...p, price: Number(p.price) })).sort((a, b) => a.sort - b.sort) }))
  .sort((a, b) => a.sort - b.sort)

export function useMenuAdmin() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    const { data, error: err } = await db.from('menu_items').select('*, online_products(*)')
    if (err) setError(err.message)
    else { setError(null); setItems(sortRows(data)) }
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const fail = (err) => { setError(err.message); reload() }

  const setItemStatus = async (item, status) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status } : i))
    const { error: err } = await db.from('menu_items').update({ status }).eq('id', item.id)
    if (err) fail(err)
  }

  const setSizeStatus = async (item, size, status) => {
    setItems(prev => prev.map(i => i.id !== item.id ? i : { ...i, sizes: i.sizes.map(s => s.id === size.id ? { ...s, status } : s) }))
    const { error: err } = await db.from('online_products').update({ status }).eq('id', size.id)
    if (err) fail(err)
  }

  // Moves an item up (-1) or down (+1), then renumbers the menu 10, 20, 30 …
  const move = async (item, dir) => {
    const idx = items.findIndex(i => i.id === item.id)
    if (!items[idx + dir]) return
    const next = [...items]
    ;[next[idx], next[idx + dir]] = [next[idx + dir], next[idx]]
    const renumbered = next.map((i, n) => ({ ...i, sort: (n + 1) * 10 }))
    setItems(renumbered)
    const changed = renumbered.filter(i => items.find(o => o.id === i.id).sort !== i.sort)
    const results = await Promise.all(changed.map(i => db.from('menu_items').update({ sort: i.sort }).eq('id', i.id)))
    const err = results.find(r => r.error)?.error
    if (err) fail(err)
  }

  // Creates or updates an item and its sizes. Sizes missing from `sizes` are deleted.
  const save = async (draft, sizes, original) => {
    const isNew = !original
    const id = original?.id || `${slug(draft.name)}-${rand()}`
    const sort = isNew ? Math.max(0, ...items.map(i => i.sort)) + 10 : original.sort
    const { error: e1 } = await db.from('menu_items').upsert({
      id, name: draft.name.trim(), tag: draft.tag.trim() || null, blurb: draft.blurb.trim() || null,
      photo_url: draft.photo_url || null, status: draft.status, sort,
    })
    if (e1) throw e1

    const rows = sizes.map((s, n) => ({
      id: s.id || `${id}-${rand()}`, item_id: id,
      option: s.option.trim(), unit: s.unit.trim() || null,
      name: sizeName(draft.name, s.option, sizes.length),
      price: +Number(s.price).toFixed(2), status: s.status, sort: (n + 1) * 10,
    }))
    const { error: e2 } = await db.from('online_products').upsert(rows)
    if (e2) throw e2

    const removed = (original?.sizes || []).filter(s => !rows.some(r => r.id === s.id)).map(s => s.id)
    if (removed.length) {
      const { error: e3 } = await db.from('online_products').delete().in('id', removed)
      if (e3) throw e3
    }
    if (original?.photo_url && original.photo_url !== draft.photo_url) await removePhoto(original.photo_url)
    await reload()
  }

  const remove = async (item) => {
    setItems(prev => prev.filter(i => i.id !== item.id))
    const { error: err } = await db.from('menu_items').delete().eq('id', item.id)  // sizes go with it
    if (err) return fail(err)
    await removePhoto(item.photo_url)
  }

  return { items, loading, error, reload, setItemStatus, setSizeStatus, move, save, remove }
}

// Shrinks a photo to ≤1200px JPEG and uploads it, returning its public URL.
export async function uploadPhoto(file) {
  const blob = await new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => reject(new Error('That file isn’t an image we can read.'))
    img.onload = () => {
      const sc = Math.min(1, 1200 / Math.max(img.width, img.height))
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * sc)
      c.height = Math.round(img.height * sc)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      c.toBlob(b => b ? resolve(b) : reject(new Error('Could not process the photo.')), 'image/jpeg', 0.82)
      URL.revokeObjectURL(img.src)
    }
    img.src = URL.createObjectURL(file)
  })
  const path = `${crypto.randomUUID()}.jpg`
  const { error } = await db.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
  if (error) throw error
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

// Only removes photos uploaded through the admin (not the site's built-in ones).
async function removePhoto(url) {
  const marker = `/${BUCKET}/`
  if (!url || !url.includes(marker)) return
  await db.storage.from(BUCKET).remove([url.slice(url.indexOf(marker) + marker.length)])
}
