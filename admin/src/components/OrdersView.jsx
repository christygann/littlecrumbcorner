import { useState, useEffect } from 'react'
import { db } from '../lib/supabase.js'

const MENU = [
  { category: 'Food', name: 'Burnt Cheesecake (slice)', price: 5.50 },
  { category: 'Food', name: 'Strawberry Shortcake (slice)', price: 5.00 },
  { category: 'Food', name: 'Brownie (slice)', price: 4.50 },
  { category: 'Food', name: 'Apple Cinnamon Muffin', price: 4.00 },
  { category: 'Drinks', name: 'Classic Matcha / Hojicha Latte', price: 5.00 },
  { category: 'Drinks', name: 'Caramelised Banana Matcha', price: 6.50 },
  { category: 'Drinks', name: 'Salted Maple Hojicha', price: 6.00 },
  { category: 'Drinks', name: 'Lavender Earl Grey Tea with Matcha Cloud', price: 6.00 },
  { category: 'Drinks', name: 'Grape Oolong Tea with Matcha Cloud', price: 6.00 },
]

const MENU_BY_NAME = Object.fromEntries(MENU.map(m => [m.name, m]))

const ICE_CREAM = { name: 'Vanilla Ice Cream Scoop', price: 1.00 }

const STATUS_STYLES = {
  placed:   { bg: 'bg-deep-rose/[0.14]',  badge: 'bg-deep-rose/20 text-deep-rose',    dot: 'bg-deep-rose' },
  prepared: { bg: 'bg-sage-light/60',      badge: 'bg-sage-light/80 text-sage-dark',   dot: 'bg-sage' },
  served:   { bg: 'bg-white',              badge: 'bg-cocoa/8 text-cocoa/60',           dot: 'bg-cocoa/30' },
}

function fmtDate(iso) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-SG', { day: '2-digit', month: 'short' }) +
    ' · ' +
    d.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: true })
  )
}

const ghostBtn = 'py-[7px] px-4 rounded-full bg-transparent text-cocoa border border-cocoa/25 text-[12px] tracking-[0.25em] uppercase font-medium cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50'
const darkBtn  = 'py-[7px] px-4 rounded-full bg-cocoa text-cream border-none text-[12px] tracking-[0.25em] uppercase font-medium cursor-pointer hover:opacity-85 transition-opacity disabled:opacity-50'
const fieldCls = 'w-full border border-cocoa/20 rounded-lg px-3 py-2 text-[15px] text-cocoa bg-white placeholder:text-cocoa/30'
const labelCls = 'text-[12px] tracking-[0.2em] uppercase text-sage-dark font-medium'

// ─── New Order ────────────────────────────────────────────────────────────────

function NewOrderTab({ onOrderPlaced }) {
  const [customerName, setCustomerName] = useState('')
  const [selectedItem, setSelectedItem] = useState(MENU[0].name)
  const [qty, setQty] = useState(1)
  const [iceCreamScoop, setIceCreamScoop] = useState(false)
  const [cart, setCart] = useState([])
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)
  const [success, setSuccess] = useState(false)

  const addToCart = () => {
    const item = MENU_BY_NAME[selectedItem]
    if (!item) return
    setCart(prev => {
      let next = [...prev]
      const existing = next.find(c => c.name === item.name)
      if (existing) {
        const newQty = existing.qty + qty
        next = next.map(c => c.name === item.name ? { ...c, qty: newQty, subtotal: parseFloat((newQty * c.price).toFixed(2)) } : c)
      } else {
        next = [...next, { name: item.name, price: item.price, qty, subtotal: parseFloat((item.price * qty).toFixed(2)) }]
      }
      if (item.name === 'Brownie (slice)' && iceCreamScoop) {
        const existingIC = next.find(c => c.name === ICE_CREAM.name)
        if (existingIC) {
          const newQty = existingIC.qty + qty
          next = next.map(c => c.name === ICE_CREAM.name ? { ...c, qty: newQty, subtotal: parseFloat((newQty * c.price).toFixed(2)) } : c)
        } else {
          next = [...next, { name: ICE_CREAM.name, price: ICE_CREAM.price, qty, subtotal: parseFloat((ICE_CREAM.price * qty).toFixed(2)) }]
        }
      }
      return next
    })
  }

  const updateCartQty = (name, newQty) => {
    const q = Math.max(1, parseInt(newQty) || 1)
    setCart(prev => prev.map(c => c.name === name ? { ...c, qty: q, subtotal: parseFloat((c.price * q).toFixed(2)) } : c))
  }

  const removeFromCart = (name) => setCart(prev => prev.filter(c => c.name !== name))

  const total = cart.reduce((sum, c) => sum + c.subtotal, 0)

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) { setErr('Please enter a customer name.'); return }
    if (cart.length === 0) { setErr('Please add at least one item.'); return }
    setSaving(true)
    setErr(null)

    const { data: order, error: orderErr } = await db
      .from('orders')
      .insert({ customer_name: customerName.trim(), total: parseFloat(total.toFixed(2)) })
      .select()
      .single()

    if (orderErr) { setErr(orderErr.message); setSaving(false); return }

    const { error: itemsErr } = await db.from('order_items').insert(
      cart.map(c => ({
        order_id: order.id,
        item_name: c.name,
        quantity: c.qty,
        unit_price: c.price,
        subtotal: c.subtotal,
      }))
    )

    if (itemsErr) { setErr(itemsErr.message); setSaving(false); return }

    setCustomerName('')
    setCart([])
    setQty(1)
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    onOrderPlaced?.()
  }

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between gap-8 items-start">
      {/* Left — inputs */}
      <div className="w-full lg:flex-1 lg:min-w-0 lg:max-w-md">
        {success && (
          <div className="text-[15px] text-sage-dark bg-sage-light/40 px-4 py-3 rounded-lg mb-5">
            Order placed successfully!
          </div>
        )}
        {err && (
          <div className="text-[15px] text-deep-rose bg-deep-rose/8 px-4 py-3 rounded-lg mb-5">{err}</div>
        )}

        <div className="flex flex-col gap-1 mb-5">
          <label className={labelCls}>Customer name</label>
          <input
            className={fieldCls}
            placeholder="e.g. Sarah"
            value={customerName}
            onChange={e => setCustomerName(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-[0.9rem] p-5 shadow-[0_2px_14px_rgba(107,76,59,0.05)]">
          <p className={`${labelCls} mb-3`}>Add items</p>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <select
                className={fieldCls}
                value={selectedItem}
                onChange={e => { setSelectedItem(e.target.value); setIceCreamScoop(false) }}
              >
                {['Food', 'Drinks'].map(cat => (
                  <optgroup key={cat} label={cat}>
                    {MENU.filter(m => m.category === cat).map(m => (
                      <option key={m.name} value={m.name}>
                        {m.name} — ${m.price.toFixed(2)}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <input
              type="number" min={1} max={99} value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 border border-cocoa/20 rounded-lg px-3 py-2 text-[15px] text-cocoa bg-white text-center"
            />
            <button onClick={addToCart} className={darkBtn}>add</button>
          </div>
          {selectedItem === 'Brownie (slice)' && (
            <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={iceCreamScoop} onChange={e => setIceCreamScoop(e.target.checked)} className="accent-cocoa" />
              <span className="text-[13px] text-cocoa/70">add vanilla ice cream scoop <span className="text-cocoa/40">(+$1.00 ea.)</span></span>
            </label>
          )}
        </div>
      </div>

      {/* Right — order summary */}
      <div className="w-full lg:w-80 lg:shrink-0 lg:sticky lg:top-6 lg:self-start">
        <div className="bg-white rounded-[0.9rem] shadow-[0_2px_14px_rgba(107,76,59,0.05)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-cocoa/[0.06]">
            <p className={labelCls}>Order summary</p>
          </div>
          {cart.length === 0 ? (
            <div className="px-5 py-10 text-center font-display italic text-[18px] text-cocoa/30">no items yet</div>
          ) : (
            <>
              {cart.map(c => (
                <div key={c.name} className="flex items-center gap-3 px-5 py-3.5 border-b border-cocoa/[0.04] last:border-none hover:bg-cream/60 transition-colors">
                  <span className="flex-1 text-[15px] text-cocoa min-w-0 leading-snug">{c.name}</span>
                  <input
                    type="number" min={1} max={99} value={c.qty}
                    onChange={e => updateCartQty(c.name, e.target.value)}
                    className="w-12 border border-cocoa/15 rounded-md px-1.5 py-1 text-[14px] text-cocoa bg-white text-center shrink-0"
                  />
                  <span className="text-[15px] text-cocoa font-medium w-16 text-right shrink-0">${c.subtotal.toFixed(2)}</span>
                  <button onClick={() => removeFromCart(c.name)} className="text-[13px] text-deep-rose/50 hover:text-deep-rose transition-colors cursor-pointer shrink-0">✕</button>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-4 bg-linen">
                <span className={labelCls}>Total</span>
                <span className="text-[20px] font-display text-espresso font-light">${total.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
        <button
          onClick={handlePlaceOrder}
          disabled={saving || cart.length === 0 || !customerName.trim()}
          className={`${darkBtn} w-full py-3 mt-3`}
        >
          {saving ? 'placing order…' : 'place order'}
        </button>
      </div>
    </div>
  )
}

// ─── Edit Order Modal ─────────────────────────────────────────────────────────

function EditOrderModal({ order, onSave, onClose }) {
  const [customerName, setCustomerName] = useState(order.customer_name)
  const [cart, setCart] = useState(
    (order.order_items || []).map(i => ({
      name: i.item_name,
      price: i.unit_price,
      qty: i.quantity,
      subtotal: parseFloat(i.subtotal),
    }))
  )
  const [selectedItem, setSelectedItem] = useState(MENU[0].name)
  const [qty, setQty] = useState(1)
  const [iceCreamScoop, setIceCreamScoop] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState(null)

  const addToCart = () => {
    const item = MENU_BY_NAME[selectedItem]
    if (!item) return
    setCart(prev => {
      let next = [...prev]
      const existing = next.find(c => c.name === item.name)
      if (existing) {
        const newQty = existing.qty + qty
        next = next.map(c => c.name === item.name ? { ...c, qty: newQty, subtotal: parseFloat((newQty * c.price).toFixed(2)) } : c)
      } else {
        next = [...next, { name: item.name, price: item.price, qty, subtotal: parseFloat((item.price * qty).toFixed(2)) }]
      }
      if (item.name === 'Brownie (slice)' && iceCreamScoop) {
        const existingIC = next.find(c => c.name === ICE_CREAM.name)
        if (existingIC) {
          const newQty = existingIC.qty + qty
          next = next.map(c => c.name === ICE_CREAM.name ? { ...c, qty: newQty, subtotal: parseFloat((newQty * c.price).toFixed(2)) } : c)
        } else {
          next = [...next, { name: ICE_CREAM.name, price: ICE_CREAM.price, qty, subtotal: parseFloat((ICE_CREAM.price * qty).toFixed(2)) }]
        }
      }
      return next
    })
  }

  const updateCartQty = (name, newQty) => {
    const q = Math.max(1, parseInt(newQty) || 1)
    setCart(prev => prev.map(c => c.name === name ? { ...c, qty: q, subtotal: parseFloat((c.price * q).toFixed(2)) } : c))
  }

  const removeFromCart = (name) => setCart(prev => prev.filter(c => c.name !== name))

  const total = cart.reduce((sum, c) => sum + c.subtotal, 0)

  const handleSave = async () => {
    if (!customerName.trim()) { setErr('Please enter a customer name.'); return }
    if (cart.length === 0) { setErr('Please add at least one item.'); return }
    setSaving(true)
    setErr(null)

    const { error: orderErr } = await db
      .from('orders')
      .update({ customer_name: customerName.trim(), total: parseFloat(total.toFixed(2)) })
      .eq('id', order.id)

    if (orderErr) { setErr(orderErr.message); setSaving(false); return }

    const { error: deleteErr } = await db.from('order_items').delete().eq('order_id', order.id)
    if (deleteErr) { setErr(deleteErr.message); setSaving(false); return }

    const { error: insertErr } = await db.from('order_items').insert(
      cart.map(c => ({
        order_id: order.id,
        item_name: c.name,
        quantity: c.qty,
        unit_price: c.price,
        subtotal: c.subtotal,
      }))
    )

    if (insertErr) { setErr(insertErr.message); setSaving(false); return }

    onSave({
      ...order,
      customer_name: customerName.trim(),
      total: parseFloat(total.toFixed(2)),
      order_items: cart.map(c => ({ item_name: c.name, quantity: c.qty, unit_price: c.price, subtotal: c.subtotal })),
    })
  }

  return (
    <div className="fixed inset-0 bg-espresso/25 backdrop-blur-[2px] flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-cream rounded-[0.9rem] p-7 w-full max-w-lg shadow-[0_8px_40px_rgba(61,43,36,0.15)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-light text-[26px] text-espresso mb-1">edit order</h3>
        <p className="text-[13px] text-cocoa/50 mb-6">{order.customer_name}</p>

        {err && <div className="text-[13px] text-deep-rose bg-deep-rose/8 px-3 py-2 rounded-lg mb-4">{err}</div>}

        <div className="flex flex-col gap-1 mb-5">
          <label className={labelCls}>Customer name</label>
          <input className={fieldCls} value={customerName} onChange={e => setCustomerName(e.target.value)} />
        </div>

        <div className="bg-white rounded-[0.9rem] p-4 shadow-[0_2px_14px_rgba(107,76,59,0.05)] mb-4">
          <p className={`${labelCls} mb-3`}>Add items</p>
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <select className={fieldCls} value={selectedItem} onChange={e => { setSelectedItem(e.target.value); setIceCreamScoop(false) }}>
                {['Food', 'Drinks'].map(cat => (
                  <optgroup key={cat} label={cat}>
                    {MENU.filter(m => m.category === cat).map(m => (
                      <option key={m.name} value={m.name}>{m.name} — ${m.price.toFixed(2)}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <input
              type="number" min={1} max={99} value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 border border-cocoa/20 rounded-lg px-2 py-2 text-[14px] text-cocoa bg-white text-center"
            />
            <button onClick={addToCart} className={darkBtn}>add</button>
          </div>
          {selectedItem === 'Brownie (slice)' && (
            <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={iceCreamScoop} onChange={e => setIceCreamScoop(e.target.checked)} className="accent-cocoa" />
              <span className="text-[13px] text-cocoa/70">add vanilla ice cream scoop <span className="text-cocoa/40">(+$1.00 ea.)</span></span>
            </label>
          )}
        </div>

        {cart.length > 0 && (
          <div className="bg-white rounded-[0.9rem] shadow-[0_2px_14px_rgba(107,76,59,0.05)] mb-5 overflow-hidden">
            {cart.map(c => (
              <div key={c.name} className="flex items-center gap-3 px-4 py-3 border-b border-cocoa/[0.04] last:border-none hover:bg-cream/60 transition-colors">
                <span className="flex-1 text-[14px] text-cocoa min-w-0 leading-snug">{c.name}</span>
                <input
                  type="number" min={1} max={99} value={c.qty}
                  onChange={e => updateCartQty(c.name, e.target.value)}
                  className="w-11 border border-cocoa/15 rounded-md px-1.5 py-1 text-[13px] text-cocoa bg-white text-center shrink-0"
                />
                <span className="text-[14px] text-cocoa font-medium w-14 text-right shrink-0">${c.subtotal.toFixed(2)}</span>
                <button onClick={() => removeFromCart(c.name)} className="text-[12px] text-deep-rose/50 hover:text-deep-rose cursor-pointer shrink-0">✕</button>
              </div>
            ))}
            <div className="flex items-center justify-between px-4 py-3.5 bg-linen">
              <span className={labelCls}>Total</span>
              <span className="text-[18px] font-display text-espresso font-light">${total.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button onClick={handleSave} disabled={saving} className={`${darkBtn} flex-1 justify-center py-2.5`}>
            {saving ? 'saving…' : 'save changes'}
          </button>
          <button onClick={onClose} className={ghostBtn}>cancel</button>
        </div>
      </div>
    </div>
  )
}

// ─── All Orders ───────────────────────────────────────────────────────────────

const STATUS_LABELS = ['placed', 'prepared', 'served']

function AllOrdersTab({ orders, loading, onDelete, onStatusChange, onEdit }) {
  const [deletingId, setDeletingId] = useState(null)
  const [query, setQuery] = useState('')

  const totalCollected = orders.reduce((sum, o) => sum + parseFloat(o.total), 0)

  const filtered = query.trim()
    ? orders.filter(o => o.customer_name?.toLowerCase().includes(query.toLowerCase()))
    : orders

  if (loading) return (
    <div className="text-center py-20 font-display italic text-[22px] text-cocoa/40">loading…</div>
  )

  return (
    <div>
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="bg-white rounded-[0.9rem] px-6 py-4 shadow-[0_2px_14px_rgba(107,76,59,0.05)]">
          <p className={`${labelCls} mb-1`}>Total collected</p>
          <p className="font-display font-light text-[28px] text-espresso">${totalCollected.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-[0.9rem] px-6 py-4 shadow-[0_2px_14px_rgba(107,76,59,0.05)]">
          <p className={`${labelCls} mb-1`}>Orders</p>
          <p className="font-display font-light text-[28px] text-espresso">{orders.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="search by name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full sm:w-72 border border-cocoa/20 rounded-full px-4 py-2 text-[14px] text-cocoa bg-white placeholder:text-cocoa/30 transition"
        />
        {query.trim() && (
          <>
            <span className="text-[13px] text-cocoa/50 whitespace-nowrap">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
            <button onClick={() => setQuery('')} className="text-[12px] text-cocoa/40 hover:text-cocoa/70 transition-colors cursor-pointer">
              clear
            </button>
          </>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 font-display italic text-[22px] text-cocoa/40">
          {query.trim() ? 'no matches found' : 'no orders yet'}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(o => {
            const style = STATUS_STYLES[o.status] || STATUS_STYLES.placed
            return (
              <div key={o.id} className={`${style.bg} rounded-[0.9rem] shadow-[0_2px_14px_rgba(107,76,59,0.05)] overflow-hidden transition-colors duration-300`}>
                {/* Order header */}
                <div className="flex items-start justify-between px-5 py-4 border-b border-cocoa/[0.06] flex-wrap gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-baseline gap-3">
                      <span className="text-[17px] text-espresso font-display font-light">{o.customer_name}</span>
                      <span className="text-[13px] text-cocoa/40 whitespace-nowrap">{fmtDate(o.created_at)}</span>
                    </div>
                    {/* Status toggle */}
                    <div className="flex gap-1 mt-1">
                      {STATUS_LABELS.map(s => (
                        <button
                          key={s}
                          onClick={() => onStatusChange(o.id, s)}
                          className={`px-3 py-0.5 rounded-full text-[11px] tracking-[0.15em] uppercase font-medium cursor-pointer transition-all ${
                            o.status === s
                              ? style.badge
                              : 'text-cocoa/35 hover:text-cocoa/60'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[17px] font-display text-espresso">${parseFloat(o.total).toFixed(2)}</span>
                    <button
                      onClick={() => { setDeletingId(null); onEdit(o) }}
                      className="text-[12px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-cocoa/20 text-cocoa cursor-pointer hover:opacity-85 transition-opacity"
                    >edit</button>
                    {deletingId === o.id ? (
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[13px] text-cocoa/60">sure?</span>
                        <button
                          onClick={() => { onDelete(o.id); setDeletingId(null) }}
                          className="text-[12px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full bg-deep-rose text-white cursor-pointer hover:opacity-85 transition-opacity"
                        >yes</button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-[12px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-cocoa/20 text-cocoa cursor-pointer hover:opacity-85 transition-opacity"
                        >no</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(o.id)}
                        className="text-[12px] tracking-[0.2em] uppercase px-2.5 py-1 rounded-full border border-deep-rose/30 text-deep-rose cursor-pointer hover:opacity-85 transition-opacity"
                      >delete</button>
                    )}
                  </div>
                </div>

                {/* Items */}
                {(o.order_items || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-cocoa/[0.04] last:border-none">
                    <span className="text-[14px] text-cocoa">{item.item_name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] text-cocoa/40">×{item.quantity}</span>
                      <span className="text-[14px] text-cocoa/70 w-16 text-right">${parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Item Stats ───────────────────────────────────────────────────────────────

function ItemStatsTab({ orders }) {
  const stats = {}
  for (const order of orders) {
    for (const item of (order.order_items || [])) {
      if (!stats[item.item_name]) stats[item.item_name] = { qty: 0, revenue: 0 }
      stats[item.item_name].qty += item.quantity
      stats[item.item_name].revenue += parseFloat(item.subtotal)
    }
  }

  const sorted = MENU.map(m => ({
    ...m,
    qty: stats[m.name]?.qty || 0,
    revenue: stats[m.name]?.revenue || 0,
  })).sort((a, b) => b.qty - a.qty)

  const maxQty = Math.max(...sorted.map(s => s.qty), 1)

  if (orders.length === 0) return (
    <div className="text-center py-20 font-display italic text-[22px] text-cocoa/40">no orders yet</div>
  )

  return (
    <div className="max-w-xl flex flex-col gap-3">
      {sorted.map(item => (
        <div key={item.name} className="bg-white rounded-[0.9rem] px-5 py-4 shadow-[0_2px_14px_rgba(107,76,59,0.05)]">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-[11px] tracking-[0.15em] uppercase font-medium px-2 py-0.5 rounded-full shrink-0 ${
                item.category === 'Food' ? 'bg-linen text-cocoa/60' : 'bg-sage-light/40 text-sage-dark'
              }`}>{item.category}</span>
              <span className="text-[15px] text-cocoa truncate">{item.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <span className="text-[13px] text-cocoa/40">${item.revenue.toFixed(2)}</span>
              <span className="text-[16px] text-espresso font-medium w-6 text-right">{item.qty}</span>
            </div>
          </div>
          <div className="h-1.5 bg-linen rounded-full overflow-hidden">
            <div
              className="h-full bg-sage rounded-full transition-all duration-500"
              style={{ width: `${(item.qty / maxQty) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

const TABS = [
  { key: 'new',    label: 'New Order' },
  { key: 'orders', label: 'All Orders' },
  { key: 'stats',  label: 'Item Stats' },
]

export default function OrdersView() {
  const [tab, setTab] = useState('new')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const loadOrders = async () => {
    setLoading(true)
    const { data, error } = await db
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    if (!error) setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => { loadOrders() }, [])

  const handleDelete = async (id) => {
    await db.from('orders').delete().eq('id', id)
    setOrders(prev => prev.filter(o => o.id !== id))
  }

  const handleStatusChange = async (id, status) => {
    await db.from('orders').update({ status }).eq('id', id)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const handleEditSave = (updated) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
    setEditing(null)
  }

  return (
    <div className="flex-1 p-4 sm:p-10 max-w-[1100px] w-full mx-auto">
      <div className="flex items-center gap-3 mb-7">
        <div className="flex gap-1 bg-white rounded-full p-1 shadow-[0_2px_14px_rgba(107,76,59,0.05)]">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-full text-[12px] tracking-[0.2em] uppercase font-medium transition-all cursor-pointer whitespace-nowrap ${
                tab === t.key ? 'bg-cocoa text-cream shadow-sm' : 'text-cocoa/60 hover:text-cocoa'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab !== 'new' && (
          <button className={ghostBtn} onClick={loadOrders} disabled={loading}>
            {loading ? '…' : 'refresh'}
          </button>
        )}
      </div>

      {tab === 'new'    && <NewOrderTab onOrderPlaced={loadOrders} />}
      {tab === 'orders' && (
        <AllOrdersTab
          orders={orders}
          loading={loading}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onEdit={setEditing}
        />
      )}
      {tab === 'stats'  && <ItemStatsTab orders={orders} />}

      {editing && (
        <EditOrderModal
          order={editing}
          onSave={handleEditSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
