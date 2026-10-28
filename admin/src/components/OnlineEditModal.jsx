import { useEffect, useState } from 'react'
import { IconBin, iconBtnDel } from '../icons.jsx'
import { FULFILMENT, WEB_STATUS, WEB_STATUS_KEYS, dowOf, fmt, fmtPlaced, proofUrl } from '../lib/online.js'

export const wLabel = 'text-[11px] tracking-[0.2em] uppercase text-sage-dark font-medium'
export const wField = 'w-full border border-cocoa/20 rounded-lg px-3 py-2 text-[14px] text-cocoa bg-white placeholder:text-cocoa/30'
export const wPill  = 'text-[11px] tracking-[0.2em] uppercase px-3 py-1 rounded-full cursor-pointer hover:opacity-85 transition-opacity whitespace-nowrap'
export const wDark  = 'whitespace-nowrap shrink-0 py-[8px] px-4 rounded-full bg-cocoa text-cream border-none text-[11px] tracking-[0.25em] uppercase font-medium cursor-pointer hover:bg-espresso transition-colors disabled:opacity-50'
export const wGhost = 'whitespace-nowrap shrink-0 py-[8px] px-4 rounded-full bg-transparent text-cocoa border border-cocoa/25 text-[11px] tracking-[0.25em] uppercase font-medium cursor-pointer hover:bg-linen transition-colors disabled:opacity-50'

function MiniStepper({ value, onChange }) {
  const b = 'w-8 h-8 rounded-full text-[16px] text-cocoa cursor-pointer hover:bg-linen disabled:opacity-30 disabled:cursor-default'
  return (
    <div className="inline-flex items-center border border-cocoa/20 rounded-full">
      <button type="button" className={b} disabled={value <= 0} onClick={() => onChange(value - 1)}>−</button>
      <span className="min-w-[22px] text-center text-[14px] font-normal">{value}</span>
      <button type="button" className={b} onClick={() => onChange(value + 1)}>+</button>
    </div>
  )
}

export function OnlineEditModal({ order, products, onSave, onDelete, onClose }) {
  // sizes that are off the menu (or deleted from it) still show if this order has them
  const rows = [
    ...products.filter(p => p.available || order.items.some(i => i.id === p.id)),
    ...order.items.filter(i => !products.some(p => p.id === i.id)).map(i => ({ ...i, available: false })),
  ]
  const [f, setF] = useState(() => ({
    ...order,
    qty: Object.fromEntries(rows.map(p => [p.id, order.items.find(i => i.id === p.id)?.qty || 0])),
  }))
  const [confirmDel, setConfirmDel] = useState(false)
  const set = k => e => setF(p => ({ ...p, [k]: e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e }))

  // an order keeps the price it was placed at; newly added items use today's price
  const items = rows.filter(p => f.qty[p.id] > 0).map(p => ({
    id: p.id, name: p.name, qty: f.qty[p.id], price: order.items.find(i => i.id === p.id)?.price ?? p.price,
  }))
  const fee = FULFILMENT[f.method].fee
  const total = +(items.reduce((s, i) => s + i.qty * i.price, 0) + fee).toFixed(2)

  const setMethod = m => setF(p => ({
    ...p, method: m,
    slot: m === 'deliver' ? FULFILMENT.deliver.slots[0] : (FULFILMENT.collect.days[dowOf(p.date)] || p.slot),
  }))
  const setDate = e => {
    const k = e.target.value
    if (!k) return
    setF(p => ({ ...p, date: k, slot: p.method === 'collect' ? (FULFILMENT.collect.days[dowOf(k)] || p.slot) : p.slot }))
  }
  const save = () => {
    const { qty, ...rest } = f
    onSave({ ...rest, items, fee, total })
  }

  return (
    <div className="fixed inset-0 bg-espresso/25 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-cream rounded-[0.9rem] p-7 w-full max-w-xl shadow-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-baseline justify-between gap-4 mb-6">
          <div>
            <h3 className="font-display font-light text-[26px] text-espresso">edit order</h3>
            <p className="text-[13px] text-cocoa/70">{order.number} · placed {fmtPlaced(order.placedAt)}</p>
          </div>
          <select className={`${wField} w-auto`} value={f.status} onChange={set('status')}>
            {WEB_STATUS_KEYS.map(s => <option key={s} value={s}>{WEB_STATUS[s].label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-5">
          <div className="bg-white rounded-[0.9rem] p-4 shadow-sm flex flex-col gap-3">
            <p className={wLabel}>Items</p>
            {rows.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="flex-1 text-[14px]">{p.name}{!p.available && <span className="text-cocoa/50"> · off menu</span>}</span>
                <span className="text-[13px] text-cocoa/60 w-14 text-right">{fmt(p.price)}</span>
                <MiniStepper value={f.qty[p.id]} onChange={v => setF(x => ({ ...x, qty: { ...x.qty, [p.id]: Math.max(0, v) } }))} />
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-cocoa/[0.08] text-[13px]">
              <span>{FULFILMENT[f.method].label}</span><span>{fee ? fmt(fee) : 'free'}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className={wLabel}>Total</span><span className="font-display text-[20px] text-espresso">{fmt(total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className={wLabel}>Fulfilment</p>
            <div className="flex gap-2">
              {['collect', 'deliver'].map(m => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className={`${wPill} border ${f.method === m ? 'bg-cocoa text-cream border-cocoa' : 'border-cocoa/20 text-cocoa bg-white'}`}>
                  {FULFILMENT[m].label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className={wLabel}>Date</label>
                <input type="date" className={wField} value={f.date} onChange={setDate} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={wLabel}>{f.method === 'collect' ? 'Time' : 'Slot'}</label>
                {f.method === 'deliver'
                  ? <select className={wField} value={f.slot} onChange={set('slot')}>{FULFILMENT.deliver.slots.map(s => <option key={s}>{s}</option>)}</select>
                  : <input className={wField} value={f.slot} onChange={set('slot')} />}
              </div>
            </div>
            {f.method === 'deliver' && (
              <div className="flex flex-col gap-1">
                <label className={wLabel}>Address</label>
                <input className={wField} value={f.address || ''} onChange={set('address')} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <p className={wLabel}>Customer</p>
            <div className="grid grid-cols-2 gap-3">
              <input className={wField} value={f.name} onChange={set('name')} placeholder="name" />
              <input className={wField} value={f.phone} onChange={set('phone')} placeholder="phone" />
              <input className={wField} value={f.telegram || ''} onChange={set('telegram')} placeholder="telegram" />
              <input className={wField} value={f.email || ''} onChange={set('email')} placeholder="email" />
            </div>
            <textarea className={`${wField} resize-none`} rows={2} value={f.note || ''} onChange={set('note')} placeholder="note" />
            <label className="flex items-center gap-2 text-[14px] cursor-pointer select-none">
              <input type="checkbox" className="accent-cocoa w-4 h-4" checked={!!f.paid} onChange={set('paid')} /> PayNow transfer checked
            </label>
          </div>
        </div>

        <div className="flex gap-2 mt-7 items-center flex-wrap">
          <button onClick={save} disabled={!items.length || !f.name.trim()} className={`${wDark} flex-1 py-2.5`}>save changes</button>
          <button onClick={onClose} className={wGhost}>cancel</button>
          {confirmDel ? (
            <div className="flex gap-1.5 items-center ml-auto">
              <span className="text-[13px] text-cocoa/70">delete for good?</span>
              <button onClick={onDelete} className={`${wPill} bg-deep-rose text-cream`}>yes</button>
              <button onClick={() => setConfirmDel(false)} className={`${wPill} border border-cocoa/20`}>no</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} className={`${iconBtnDel} ml-auto`} aria-label="delete order" title="delete"><IconBin /></button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProofLightbox({ order, onClose }) {
  const [url, setUrl] = useState(undefined)
  useEffect(() => { proofUrl(order.proof_path).then(setUrl) }, [order.proof_path])

  return (
    <div className="fixed inset-0 bg-espresso/60 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <div className="bg-cream rounded-[0.9rem] p-4 shadow-lg max-w-md w-full flex flex-col gap-3" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-baseline">
          <span className="font-display text-[18px] text-espresso">{order.number} · {fmt(order.total)}</span>
          <button className="text-[12px] tracking-[0.2em] uppercase cursor-pointer" onClick={onClose}>close</button>
        </div>
        {url
          ? <img src={url} alt="PayNow screenshot" className="w-full max-h-[70vh] object-contain rounded-lg bg-white" />
          : <div className="py-16 text-center bg-linen rounded-lg text-[13px] text-cocoa/70">
              {url === undefined ? 'loading…' : 'No screenshot uploaded'}
            </div>}
      </div>
    </div>
  )
}
