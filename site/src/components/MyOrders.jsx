import { useEffect, useState } from 'react'
import { Button, Field, SectionHeader, Tag } from './ui.jsx'
import { IconChevron } from '../icons.jsx'
import { FULFILMENT, STATUS } from '../data.js'
import { fmt, fmtDay, fmtShort } from '../lib/helpers.js'
import { loadDeviceOrders, lookupOrder } from '../lib/orders.js'

function OrderCard({ o, byId, defaultOpen, onReorder }) {
  const [open, setOpen] = useState(!!defaultOpen)
  const st = STATUS[o.status] || STATUS.placed
  const count = o.items.reduce((s, i) => s + i.qty, 0)
  const fee = Number(o.fee)

  return (
    <article className={`oc-order${open ? ' open' : ''}`}>
      <button className="oc-order-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="oc-order-id">
          <span className="oc-order-no">{o.number}</span>
          <span className="oc-muted">placed {fmtShort(o.placedAt)}</span>
        </div>
        <div className="oc-order-mid">
          <span>{FULFILMENT[o.method].label} · {fmtDay(o.date)}</span>
          <span className="oc-muted">{count} {count === 1 ? 'item' : 'items'}</span>
        </div>
        <div className="oc-order-end">
          {st.variant ? <Tag variant={st.variant}>{st.label}</Tag> : <span className="oc-status-plain">{st.label}</span>}
          <span className="oc-order-total">{fmt(o.total)}</span>
          <span className="oc-chev"><IconChevron dir="down" /></span>
        </div>
      </button>
      {open && (
        <div className="oc-order-body">
          <div className="oc-order-items">
            {o.items.map(i => (
              <div key={i.id} className="oc-summary-line">
                {byId[i.id] && <img src={byId[i.id].photo} alt="" />}
                <span className="oc-summary-name">{i.name}<span className="oc-summary-qty"> × {i.qty}</span></span>
                <span>{fmt(i.qty * i.price)}</span>
              </div>
            ))}
            <div className="oc-sum-row"><span>{FULFILMENT[o.method].label}</span><span>{fee ? fmt(fee) : 'free'}</span></div>
            <div className="oc-sum-row oc-sum-total"><span>total</span><span>{fmt(o.total)}</span></div>
          </div>
          <div className="oc-order-details">
            <div><span className="oc-label">{o.method === 'collect' ? 'collection' : 'delivery'}</span><span>{fmtDay(o.date)} · {o.slot}</span></div>
            {o.method === 'collect' && <div><span className="oc-label">where</span><span>{FULFILMENT.collect.location}</span></div>}
            {o.address && <div><span className="oc-label">address</span><span>{o.address}</span></div>}
            <div><span className="oc-label">paid with</span><span>PayNow</span></div>
            {o.note && <div><span className="oc-label">note</span><span>{o.note}</span></div>}
          </div>
          <div className="oc-order-foot">
            <Button kind="secondary" onClick={() => onReorder(o)}>order again</Button>
          </div>
        </div>
      )}
    </article>
  )
}

export default function MyOrders({ byId, onReorder, go }) {
  const [no, setNo] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState(null)
  const [searching, setSearching] = useState(false)
  const [orders, setOrders] = useState(null)

  useEffect(() => {
    let live = true
    loadDeviceOrders().then(list => live && setOrders(list)).catch(() => live && setOrders([]))
    return () => { live = false }
  }, [])

  const sorted = (orders || []).slice().sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))

  const lookup = async (e) => {
    e.preventDefault()
    const n = no.trim().toUpperCase().replace(/^(LCC)?-?/, 'LCC-')
    setSearching(true)
    try {
      const hit = await lookupOrder(n, phone)
      setResult(hit ? { order: hit } : { error: "We couldn't find that order. Check the number and phone, or message us on Telegram." })
    } catch (err) {
      setResult({ error: err.message })
    } finally {
      setSearching(false)
    }
  }

  return (
    <section className="oc-page" id="my-orders">
      <div className="oc-orders-wrap">
        <SectionHeader eyebrow="my orders" title="your past orders" />

        <form className="oc-lookup" onSubmit={lookup}>
          <div className="oc-lookup-fields">
            <Field label="order number">
              <input className="oc-input" value={no} onChange={(e) => setNo(e.target.value)} placeholder="LCC-2741" required />
            </Field>
            <Field label="phone used at checkout">
              <input className="oc-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+65 9123 4567" inputMode="tel" required />
            </Field>
            <Button type="submit" disabled={searching}>{searching ? 'finding …' : 'find order'}</Button>
          </div>
          {result?.error && <div className="oc-error" role="alert">{result.error}</div>}
        </form>
        {result?.order && (
          <div className="oc-lookup-result">
            <OrderCard key={result.order.number} o={result.order} byId={byId} defaultOpen onReorder={onReorder} />
          </div>
        )}

        <div className="oc-orders-list-head">
          <span className="lc-eyebrow">placed on this device</span>
          {orders && <span className="oc-muted">{sorted.length} {sorted.length === 1 ? 'order' : 'orders'}</span>}
        </div>
        {orders === null ? (
          <p className="oc-muted">Loading your orders …</p>
        ) : sorted.length === 0 ? (
          <div className="oc-center oc-orders-empty">
            <p className="oc-muted">No orders yet.</p>
            <Button onClick={() => go('home', 'order')}>place an order</Button>
          </div>
        ) : (
          <div className="oc-orders-list">
            {sorted.map((o, i) => <OrderCard key={o.number} o={o} byId={byId} defaultOpen={i === 0} onReorder={onReorder} />)}
          </div>
        )}
      </div>
    </section>
  )
}
