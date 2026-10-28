import { useEffect, useState } from 'react'
import {
  FULFILMENT, NEXT_STATUS, WEB_STATUS, WEB_STATUS_KEYS,
  addDaysKey, exportOnlineCSV, fmt, fmtDay, fmtDow, fmtPlaced, nextLabel, todayKey, useOnlineOrders,
} from '../lib/online.js'
import { OnlineEditModal, ProofLightbox, wDark, wGhost, wLabel, wPill } from './OnlineEditModal.jsx'

const svg = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' }
const IconPin = ({ size = 16 }) => (
  <svg width={size} height={size} {...svg}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>
)
const IconTruck = ({ size = 16 }) => (
  <svg width={size} height={size} {...svg}><path d="M3 6.5h10.5v10H3z" /><path d="M13.5 9.5h4l3 3.2v3.8h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17" cy="17.5" r="1.8" /></svg>
)
const IconChevronDown = ({ size = 16 }) => (
  <svg width={size} height={size} {...svg}><polyline points="6 9 12 15 18 9" /></svg>
)

const RANGES = [
  { k: 'upcoming', l: 'upcoming' }, { k: 'today', l: 'today' }, { k: 'week', l: 'next 7 days' },
  { k: 'past', l: 'past' }, { k: 'all', l: 'all dates' },
]
const inRange = (o, r) => {
  const k = o.date, t = todayKey()
  return r === 'all' || (r === 'upcoming' && k >= t) || (r === 'today' && k === t) ||
    (r === 'week' && k >= t && k <= addDaysKey(7)) || (r === 'past' && k < t)
}
const itemsLine = o => o.items.map(i => `${i.qty}× ${i.name}`).join(' · ')
const empty = 'text-center py-20 font-display text-[22px] text-cocoa/50'

function StatusBadge({ s }) {
  const st = WEB_STATUS[s] || WEB_STATUS.placed
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] tracking-[0.15em] uppercase font-medium whitespace-nowrap ${st.badge}`}>{st.label}</span>
}

function PaidButton({ o, onUpdate, onProof }) {
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onProof(o)} className="text-[12px] underline decoration-cocoa/30 underline-offset-2 cursor-pointer hover:text-deep-rose">screenshot</button>
      <button onClick={() => onUpdate(o, { paid: !o.paid })}
        className={`${wPill} border ${o.paid ? 'bg-sage-light/70 border-transparent text-pine' : 'border-deep-rose/40 text-deep-rose bg-white'}`}>
        {o.paid ? 'paid ✓' : 'check payment'}
      </button>
    </div>
  )
}

function OnlineOrderCard({ o, onUpdate, onEdit, onProof }) {
  const [open, setOpen] = useState(false)
  const st = WEB_STATUS[o.status] || WEB_STATUS.placed
  return (
    <div className={`${st.bg} rounded-[0.9rem] shadow-sm overflow-hidden transition-colors duration-300 ${o.status === 'cancelled' ? 'opacity-75' : ''}`}>
      <div className="flex items-start justify-between px-5 py-4 flex-wrap gap-3">
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-display text-[18px] text-espresso">{o.name}</span>
            <span className="text-[13px] text-cocoa/70">{o.number}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-cocoa">
            <span className="text-sage-dark flex">{o.method === 'collect' ? <IconPin /> : <IconTruck />}</span>
            <span>{o.method === 'collect' ? 'self-collection' : 'delivery'} · {fmtDow(o.date)} · {o.slot}</span>
          </div>
          <div className="text-[13px] text-cocoa/80">{itemsLine(o)}</div>
          <div className="flex gap-1 mt-1 flex-wrap">
            {WEB_STATUS_KEYS.map(s => (
              <button key={s} onClick={() => onUpdate(o, { status: s })}
                className={`px-3 py-0.5 rounded-full text-[11px] tracking-[0.15em] uppercase font-medium cursor-pointer transition-all ${o.status === s ? st.badge : 'text-cocoa/50 hover:text-cocoa/80'}`}>
                {WEB_STATUS[s].label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-display text-[18px] text-espresso">{fmt(o.total)}</span>
            <button onClick={() => onEdit(o)} className={`${wPill} border border-cocoa/20 text-cocoa bg-white/60`}>edit</button>
            <button onClick={() => setOpen(!open)} aria-label="details" className={`p-1 text-cocoa/70 cursor-pointer transition-transform ${open ? 'rotate-180' : ''}`}>
              <IconChevronDown />
            </button>
          </div>
          <PaidButton o={o} onUpdate={onUpdate} onProof={onProof} />
        </div>
      </div>
      {open && (
        <div className="grid sm:grid-cols-2 gap-6 px-5 py-4 border-t border-cocoa/[0.08] bg-white/50 text-[14px]">
          <div className="flex flex-col gap-2">
            <p className={wLabel}>Items</p>
            {o.items.map(i => (
              <div key={i.id} className="flex justify-between">
                <span>{i.name} <span className="text-cocoa/60">× {i.qty}</span></span><span>{fmt(i.qty * i.price)}</span>
              </div>
            ))}
            <div className="flex justify-between text-cocoa/70"><span>{FULFILMENT[o.method].label}</span><span>{o.fee ? fmt(o.fee) : 'free'}</span></div>
            <div className="flex justify-between border-t border-cocoa/[0.08] pt-2">
              <span className={wLabel}>Total</span><span className="font-display text-[17px] text-espresso">{fmt(o.total)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className={wLabel}>Customer</p>
            <a href={`tel:${o.phone.replace(/\s/g, '')}`}>{o.phone}</a>
            {o.telegram && <a href={`https://t.me/${o.telegram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer">{o.telegram}</a>}
            {o.email && <a href={`mailto:${o.email}`}>{o.email}</a>}
            {o.method === 'deliver' ? <span>{o.address}</span> : <span className="text-cocoa/80">{FULFILMENT.collect.location}</span>}
            {o.note && <span className="bg-linen rounded-lg px-3 py-2 text-[13px]">{o.note}</span>}
            <span className="text-[12px] text-cocoa/60">placed {fmtPlaced(o.placedAt)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function ItemChips({ orders }) {
  const t = {}
  orders.forEach(o => o.items.forEach(i => { t[i.name] = (t[i.name] || 0) + i.qty }))
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Object.entries(t).map(([n, q]) => <span key={n} className="px-2.5 py-0.5 rounded-full bg-linen text-[12px]">{q} {n}</span>)}
    </div>
  )
}

function FulfilmentBoard({ method, orders, onUpdate, onEdit, onProof }) {
  const [copied, setCopied] = useState(null)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(null), 1600)
    return () => clearTimeout(t)
  }, [copied])

  const active = orders.filter(o => o.method === method && o.status !== 'cancelled')
  const groups = {}
  active.forEach(o => { (groups[o.date + '|' + o.slot] ||= []).push(o) })
  const keys = Object.keys(groups).sort()
  if (!keys.length) return <div className={empty}>no {method === 'collect' ? 'collections' : 'deliveries'} in this range</div>

  const copyAddr = (k, list) => {
    navigator.clipboard?.writeText(list.map(o => `${o.slot} · ${o.name} · ${o.phone} · ${o.address}`).join('\n'))
    setCopied(k)
  }

  return (
    <div className="flex flex-col gap-6">
      {keys.map(k => {
        const list = groups[k].sort((a, b) => a.name.localeCompare(b.name))
        const done = list.filter(o => o.status === 'completed').length
        return (
          <div key={k} className="bg-white rounded-[0.9rem] shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-5 py-4 bg-linen flex-wrap">
              <div className="flex flex-col gap-1.5">
                <span className="font-display text-[20px] text-espresso">{fmtDay(list[0].date).toLowerCase()} · {list[0].slot}</span>
                <span className="text-[13px]">
                  {method === 'collect' ? FULFILMENT.collect.location + ' · ' : ''}
                  {list.length} {list.length === 1 ? 'order' : 'orders'} · {done} {method === 'collect' ? 'collected' : 'delivered'}
                </span>
                <ItemChips orders={list} />
              </div>
              {method === 'deliver' && <button className={wGhost} onClick={() => copyAddr(k, list)}>{copied === k ? 'copied' : 'copy addresses'}</button>}
            </div>
            {list.map(o => (
              <div key={o.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center px-5 py-3.5 border-t border-cocoa/[0.06] hover:bg-cream/60">
                <div className="flex flex-col gap-1 min-w-0 cursor-pointer" onClick={() => onEdit(o)}>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <StatusBadge s={o.status} />
                    <span className="text-[15px] font-normal">{o.name}</span>
                    <span className="text-[12px] text-cocoa/70">{o.number} · {o.phone}</span>
                  </div>
                  <span className="text-[13px] text-cocoa/80">{itemsLine(o)}</span>
                  {method === 'deliver' && <span className="text-[13px]">{o.address}</span>}
                  {o.note && <span className="text-[12px] text-deep-rose">{o.note}</span>}
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <PaidButton o={o} onUpdate={onUpdate} onProof={onProof} />
                  {NEXT_STATUS[o.status] && (
                    <button onClick={() => onUpdate(o, { status: NEXT_STATUS[o.status] })} className={wDark}>{nextLabel(o)}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function BakeList({ orders, products }) {
  const active = orders.filter(o => o.status !== 'cancelled')
  if (!active.length) return <div className={empty}>nothing to bake in this range</div>

  const prods = products.map(p => {
    const r = { ...p, qty: 0, collect: 0, deliver: 0, todo: 0, revenue: 0 }
    active.forEach(o => o.items.filter(i => i.id === p.id).forEach(i => {
      r.qty += i.qty
      r[o.method] += i.qty
      r.revenue += i.qty * i.price
      if (o.status === 'placed' || o.status === 'prepared') r.todo += i.qty
    }))
    return r
  }).filter(p => p.qty > 0 || p.available).sort((a, b) => b.qty - a.qty)
  const max = Math.max(1, ...prods.map(p => p.qty))
  const days = [...new Set(active.map(o => o.date))].sort()
  const cell = (d, id) => active.filter(o => o.date === d)
    .reduce((s, o) => s + o.items.filter(i => i.id === id).reduce((a, i) => a + i.qty, 0), 0)
  const th = 'px-4 py-3 text-left text-[11px] tracking-[0.2em] uppercase font-medium text-sage-dark whitespace-nowrap'

  return (
    <div className="flex flex-col gap-8">
      <div className="grid md:grid-cols-2 gap-3">
        {prods.map(p => (
          <div key={p.id} className="bg-white rounded-[0.9rem] px-5 py-4 shadow-sm flex flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[15px]">{p.name}</span>
              <span className="font-display text-[26px] text-espresso leading-none">{p.qty}</span>
            </div>
            <div className="h-1.5 bg-linen rounded-full overflow-hidden">
              <div className="h-full bg-sage rounded-full transition-all duration-500" style={{ width: `${(p.qty / max) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[12px] text-cocoa/80 flex-wrap gap-2">
              <span>{p.collect} collection · {p.deliver} delivery</span>
              <span>{p.todo > 0 ? <span className="text-deep-rose">{p.todo} still to make</span> : 'all made'} · {fmt(p.revenue)}</span>
            </div>
          </div>
        ))}
      </div>
      <div>
        <p className={`${wLabel} mb-3`}>By day</p>
        <div className="bg-white rounded-[0.9rem] shadow-sm overflow-x-auto">
          <table className="w-full border-collapse text-[14px] min-w-[520px]">
            <thead className="bg-linen">
              <tr>
                <th className={th}>date</th>
                {prods.map(p => <th key={p.id} className={`${th} text-right`}>{p.name}</th>)}
                <th className={`${th} text-right`}>orders</th>
              </tr>
            </thead>
            <tbody>
              {days.map(d => (
                <tr key={d} className="border-t border-cocoa/[0.06]">
                  <td className="px-4 py-3 whitespace-nowrap">{fmtDow(d)}</td>
                  {prods.map(p => <td key={p.id} className="px-4 py-3 text-right">{cell(d, p.id) || <span className="text-cocoa/40">—</span>}</td>)}
                  <td className="px-4 py-3 text-right text-cocoa/70">{active.filter(o => o.date === d).length}</td>
                </tr>
              ))}
              <tr className="border-t border-cocoa/[0.12] bg-cream/60 font-normal">
                <td className="px-4 py-3">total</td>
                {prods.map(p => <td key={p.id} className="px-4 py-3 text-right">{p.qty}</td>)}
                <td className="px-4 py-3 text-right">{active.length}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const WEB_TABS = [{ k: 'all', l: 'All orders' }, { k: 'collect', l: 'Self-collection' }, { k: 'deliver', l: 'Delivery' }, { k: 'bake', l: 'Bake list' }]

export default function OnlineOrdersView() {
  const store = useOnlineOrders()
  const [tab, setTab] = useState('all')
  const [range, setRange] = useState('upcoming')
  const [status, setStatus] = useState('any')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState(null)
  const [proof, setProof] = useState(null)

  const q = query.trim().toLowerCase()
  const ranged = store.orders.filter(o => inRange(o, range) &&
    (!q || [o.name, o.number, o.phone, o.telegram].some(v => (v || '').toLowerCase().includes(q))))
  const filtered = ranged
    .filter(o => status === 'any' ||
      (status === 'todo' ? ['placed', 'prepared'].includes(o.status)
        : status === 'unpaid' ? !o.paid && o.status !== 'cancelled'
        : o.status === status))
    .sort((a, b) => range === 'past' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date) || a.slot.localeCompare(b.slot))
  const live = ranged.filter(o => o.status !== 'cancelled')
  const stats = [
    { k: 'todo',   l: 'To prepare',       v: ranged.filter(o => ['placed', 'prepared'].includes(o.status)).length },
    { k: 'ready',  l: 'Ready',            v: ranged.filter(o => o.status === 'ready').length },
    { k: 'unpaid', l: 'Payment to check', v: live.filter(o => !o.paid).length, warn: true },
    { k: null,     l: 'Revenue',          v: fmt(live.reduce((s, o) => s + o.total, 0)) },
  ]
  const chip = on => `px-3.5 py-1.5 rounded-full text-[11px] tracking-[0.18em] uppercase font-medium cursor-pointer whitespace-nowrap transition-colors ${on ? 'bg-cocoa text-cream' : 'text-cocoa/70 hover:text-cocoa hover:bg-white'}`

  return (
    <div className="flex-1 p-4 sm:p-10 max-w-[1100px] w-full mx-auto">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display font-light text-[32px] text-espresso">online orders</h2>
          <div className="text-[13px] text-cocoa/70 mt-1">{store.orders.length} from the order site</div>
        </div>
        <div className="flex gap-2.5 items-center flex-wrap">
          <button className={wGhost} onClick={store.reload}>refresh</button>
          <button className={wDark} onClick={() => exportOnlineCSV(filtered)} disabled={!filtered.length}>export csv</button>
        </div>
      </div>

      {store.error && (
        <div className="text-[13px] text-deep-rose px-3 py-2 bg-deep-rose/8 rounded-lg mb-6">{store.error}</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <button key={s.l} disabled={!s.k} onClick={() => s.k && setStatus(status === s.k ? 'any' : s.k)}
            className={`text-left bg-white rounded-[0.9rem] px-5 py-4 shadow-sm border transition-colors ${status === s.k ? 'border-cocoa' : 'border-transparent'} ${s.k ? 'cursor-pointer hover:border-cocoa/30' : 'cursor-default'}`}>
            <p className={`${wLabel} mb-1`}>{s.l}</p>
            <p className={`font-display font-light text-[28px] ${s.warn && s.v ? 'text-deep-rose' : 'text-espresso'}`}>{s.v}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-1 bg-white rounded-full p-1 shadow-sm w-fit max-w-full overflow-x-auto mb-4">
        {WEB_TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-5 py-2 rounded-full text-[12px] tracking-[0.2em] uppercase font-medium transition-all cursor-pointer whitespace-nowrap ${tab === t.k ? 'bg-cocoa text-cream shadow-sm' : 'text-cocoa/70 hover:text-cocoa'}`}>
            {t.l}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input type="text" placeholder="search name, order no. or phone…" value={query} onChange={e => setQuery(e.target.value)}
          className="w-full sm:w-72 border border-cocoa/20 rounded-full px-4 py-2 text-[14px] text-cocoa bg-white placeholder:text-cocoa/40" />
        <div className="flex gap-1 flex-wrap">
          {RANGES.map(r => <button key={r.k} onClick={() => setRange(r.k)} className={chip(range === r.k)}>{r.l}</button>)}
        </div>
        {tab === 'all' && (
          <select value={status} onChange={e => setStatus(e.target.value)} className="border border-cocoa/20 rounded-full px-4 py-2 text-[13px] text-cocoa bg-white">
            <option value="any">any status</option>
            <option value="todo">to prepare</option>
            <option value="unpaid">payment to check</option>
            {WEB_STATUS_KEYS.map(s => <option key={s} value={s}>{WEB_STATUS[s].label}</option>)}
          </select>
        )}
      </div>

      {store.loading ? (
        <div className={empty}>loading…</div>
      ) : (
        <>
          {tab === 'all' && (filtered.length === 0
            ? <div className={empty}>{q ? 'no matches found' : 'no orders in this range'}</div>
            : <div className="flex flex-col gap-3">
                {filtered.map(o => <OnlineOrderCard key={o.id} o={o} onUpdate={store.update} onEdit={setEditing} onProof={setProof} />)}
              </div>)}
          {(tab === 'collect' || tab === 'deliver') && (
            <FulfilmentBoard method={tab} orders={ranged} onUpdate={store.update} onEdit={setEditing} onProof={setProof} />
          )}
          {tab === 'bake' && <BakeList orders={ranged} products={store.products} />}
        </>
      )}

      {editing && (
        <OnlineEditModal
          order={editing} products={store.products} onClose={() => setEditing(null)}
          onSave={u => { store.update(editing, u); setEditing(null) }}
          onDelete={() => { store.remove(editing); setEditing(null) }}
        />
      )}
      {proof && <ProofLightbox order={proof} onClose={() => setProof(null)} />}
    </div>
  )
}
