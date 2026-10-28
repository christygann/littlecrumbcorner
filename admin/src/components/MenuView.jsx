import { useRef, useState } from 'react'
import { ITEM_STATUS, SIZE_STATUS, sizeName, uploadPhoto, useMenuAdmin } from '../lib/menu.js'
import { fmt } from '../lib/online.js'
import { wDark, wField, wGhost, wLabel, wPill } from './OnlineEditModal.jsx'
import { IconArrow, IconBin, IconEdit, IconPlus, IconUpload, iconBtn, iconBtnDel } from '../icons.jsx'

const PLACEHOLDER = '/logo-mascot.png'

function StatusPicker({ value, statuses, onChange, small }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {Object.entries(statuses).map(([k, s]) => (
        <button
          key={k} type="button" title={s.hint} onClick={() => k !== value && onChange(k)}
          className={`${small ? 'px-2.5 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]'} rounded-full tracking-[0.15em] uppercase font-medium cursor-pointer whitespace-nowrap transition-colors ${
            value === k ? s.badge : 'text-cocoa/45 hover:text-cocoa/80'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

function MenuItemCard({ item, first, last, store, onEdit }) {
  const [confirmDel, setConfirmDel] = useState(false)
  return (
    <div className={`bg-white rounded-[0.9rem] shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row gap-4 ${item.status === 'hidden' ? 'opacity-70' : ''}`}>
      <img
        src={item.photo_url || PLACEHOLDER} alt=""
        className={`w-full sm:w-[88px] h-[160px] sm:h-[110px] rounded-lg shrink-0 bg-linen ${item.photo_url ? 'object-cover' : 'object-contain p-5'}`}
      />

      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <span className="font-display text-[20px] text-espresso leading-tight">{item.name}</span>
          {item.tag && <span className="px-2 py-0.5 rounded-full bg-sage-light/60 text-sage-dark text-[10px] tracking-[0.2em] uppercase font-medium">{item.tag}</span>}
        </div>
        {item.blurb && <p className="text-[13px] text-cocoa/75 m-0 line-clamp-2">{item.blurb}</p>}

        <div className="flex flex-col mt-1 border-t border-cocoa/[0.06]">
          {item.sizes.map(s => (
            <div key={s.id} className={`flex items-center gap-3 py-2 border-b border-cocoa/[0.06] flex-wrap ${s.status === 'hidden' ? 'opacity-60' : ''}`}>
              <span className="text-[14px] flex-1 min-w-[120px]">{s.option || 'one size'}</span>
              <span className="font-display text-[16px] text-deep-rose w-16 text-right">{fmt(s.price)}</span>
              <StatusPicker small value={s.status} statuses={SIZE_STATUS} onChange={st => store.setSizeStatus(item, s, st)} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex sm:flex-col items-start sm:items-end justify-between gap-3 sm:w-[230px] shrink-0 flex-wrap">
        <div className="flex flex-col gap-1.5 sm:items-end">
          <span className={wLabel}>On the site</span>
          <StatusPicker value={item.status} statuses={ITEM_STATUS} onChange={st => store.setItemStatus(item, st)} />
        </div>
        <div className="flex items-center gap-0.5">
          <button className={iconBtn} disabled={first} onClick={() => store.move(item, -1)} aria-label="move up" title="move up"
            style={first ? { opacity: 0.3, cursor: 'default' } : undefined}><IconArrow dir="up" /></button>
          <button className={iconBtn} disabled={last} onClick={() => store.move(item, 1)} aria-label="move down" title="move down"
            style={last ? { opacity: 0.3, cursor: 'default' } : undefined}><IconArrow dir="down" /></button>
          <button className={iconBtn} onClick={() => onEdit(item)} aria-label={`edit ${item.name}`} title="edit"><IconEdit /></button>
          {confirmDel ? (
            <span className="flex gap-1.5 items-center ml-1">
              <span className="text-[12px] text-cocoa/70">delete?</span>
              <button onClick={() => store.remove(item)} className={`${wPill} bg-deep-rose text-cream`}>yes</button>
              <button onClick={() => setConfirmDel(false)} className={`${wPill} border border-cocoa/20`}>no</button>
            </span>
          ) : (
            <button className={iconBtnDel} onClick={() => setConfirmDel(true)} aria-label={`delete ${item.name}`} title="delete"><IconBin /></button>
          )}
        </div>
      </div>
    </div>
  )
}

const blankSize = () => ({ option: '', unit: '', price: '', status: 'available' })

function MenuEditModal({ item, onClose, onSave }) {
  const fileRef = useRef(null)
  const [f, setF] = useState(() => ({
    name: item?.name || '', tag: item?.tag || '', blurb: item?.blurb || '',
    photo_url: item?.photo_url || '', status: item?.status || 'hidden',
  }))
  const [sizes, setSizes] = useState(() => item?.sizes.map(s => ({ ...s, unit: s.unit || '', price: String(s.price) })) || [blankSize()])
  const [busy, setBusy] = useState('')
  const [err, setErr] = useState('')

  const set = k => e => setF(p => ({ ...p, [k]: e.target.value }))
  const setSize = (n, k, v) => setSizes(p => p.map((s, i) => i === n ? { ...s, [k]: v } : s))

  const pickPhoto = async (file) => {
    if (!file) return
    setErr(''); setBusy('photo')
    try { const url = await uploadPhoto(file); setF(p => ({ ...p, photo_url: url })) }
    catch (e) { setErr(e.message || 'Could not upload the photo.') }
    setBusy('')
  }

  const problems = [
    !f.name.trim() && 'Add a name.',
    !sizes.length && 'Add at least one size.',
    sizes.some(s => s.price === '' || isNaN(+s.price) || +s.price < 0) && 'Every size needs a price.',
    sizes.length > 1 && sizes.some(s => !s.option.trim()) && 'Give each size a label, e.g. "slice" or "box of 9".',
  ].filter(Boolean)

  const save = async () => {
    if (problems.length) { setErr(problems[0]); return }
    setErr(''); setBusy('save')
    try { await onSave(f, sizes, item) }
    catch (e) { setErr(e.message || 'Could not save. Try again.'); setBusy('') }
  }

  return (
    <div className="fixed inset-0 bg-espresso/25 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-cream rounded-[0.9rem] p-6 sm:p-7 w-full max-w-2xl shadow-lg max-h-[92vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="font-display font-light text-[26px] text-espresso mb-1">{item ? 'edit item' : 'add item'}</h3>
        <p className="text-[13px] text-cocoa/70 mb-6">Changes show on the order site as soon as you save.</p>

        <div className="flex flex-col gap-5">
          {/* photo + details */}
          <div className="grid sm:grid-cols-[150px_1fr] gap-4">
            <div className="flex flex-col gap-2">
              <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-linen">
                <img src={f.photo_url || PLACEHOLDER} alt="" className={`w-full h-full ${f.photo_url ? 'object-cover' : 'object-contain p-8'}`} />
                {busy === 'photo' && <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-[12px]">uploading…</div>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => { pickPhoto(e.target.files[0]); e.target.value = '' }} />
              <button type="button" className={`${wGhost} inline-flex items-center justify-center gap-1.5`} onClick={() => fileRef.current.click()} disabled={!!busy}>
                <IconUpload size={14} /> {f.photo_url ? 'replace' : 'add photo'}
              </button>
              {f.photo_url && <button type="button" className="text-[12px] text-cocoa/60 underline underline-offset-2 cursor-pointer" onClick={() => setF(p => ({ ...p, photo_url: '' }))}>remove photo</button>}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className={wLabel}>Name</label>
                <input className={wField} value={f.name} onChange={set('name')} placeholder="double fudge brownie" maxLength={80} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={wLabel}>Label <span className="normal-case tracking-normal text-cocoa/50 font-light">— optional, e.g. signature</span></label>
                <input className={wField} value={f.tag} onChange={set('tag')} placeholder="baker's favourite" maxLength={30} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={wLabel}>Description</label>
                <textarea className={`${wField} resize-none`} rows={3} value={f.blurb} onChange={set('blurb')} maxLength={200}
                  placeholder="Dense, fudgy, crackled top — dark chocolate folded through." />
              </div>
            </div>
          </div>

          {/* sizes */}
          <div className="bg-white rounded-[0.9rem] p-4 shadow-sm flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <p className={wLabel}>Sizes &amp; prices</p>
              <p className="text-[12px] text-cocoa/60 m-0">{sizes.length > 1 ? 'Customers choose from these in a size picker.' : 'With one size, the note shows next to the price, e.g. "$5 per slice".'}</p>
            </div>
            {sizes.map((s, n) => (
              <div key={s.id || n} className="grid grid-cols-[1fr_90px_auto] sm:grid-cols-[1fr_110px_90px_auto] gap-2 items-center">
                <input className={wField} value={s.option} onChange={e => setSize(n, 'option', e.target.value)} placeholder={sizes.length > 1 ? 'box of 9 · 7" × 7"' : 'slice'} aria-label="size label" />
                <input className={`${wField} hidden sm:block`} value={s.unit} onChange={e => setSize(n, 'unit', e.target.value)} placeholder="per slice" aria-label="price note" />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-cocoa/50">$</span>
                  <input className={`${wField} pl-6`} value={s.price} onChange={e => setSize(n, 'price', e.target.value.replace(/[^\d.]/g, ''))} inputMode="decimal" placeholder="0.00" aria-label="price" />
                </div>
                <button type="button" className={iconBtnDel} onClick={() => setSizes(p => p.filter((_, i) => i !== n))} aria-label="remove size" title="remove size" disabled={sizes.length === 1}
                  style={sizes.length === 1 ? { opacity: 0.3, cursor: 'default' } : undefined}><IconBin size={16} /></button>
                <div className="col-span-full -mt-1 mb-1 flex items-center gap-3 flex-wrap">
                  <StatusPicker small value={s.status} statuses={SIZE_STATUS} onChange={st => setSize(n, 'status', st)} />
                  {f.name.trim() && <span className="text-[11px] text-cocoa/50">on orders: {sizeName(f.name, s.option, sizes.length)}</span>}
                </div>
              </div>
            ))}
            <button type="button" className={`${wGhost} self-start inline-flex items-center gap-1.5`} onClick={() => setSizes(p => [...p, blankSize()])}>
              <IconPlus size={14} /> add size
            </button>
          </div>

          {/* status */}
          <div className="flex flex-col gap-2">
            <p className={wLabel}>On the order site</p>
            <StatusPicker value={f.status} statuses={ITEM_STATUS} onChange={st => setF(p => ({ ...p, status: st }))} />
            <p className="text-[12px] text-cocoa/60 m-0">{ITEM_STATUS[f.status].hint}</p>
          </div>
        </div>

        {err && <div className="text-[13px] text-deep-rose px-3 py-2 bg-deep-rose/8 rounded-lg mt-5">{err}</div>}
        <div className="flex gap-2 mt-6">
          <button onClick={save} disabled={!!busy} className={`${wDark} flex-1 py-2.5`}>{busy === 'save' ? 'saving…' : item ? 'save changes' : 'add to menu'}</button>
          <button onClick={onClose} className={wGhost}>cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function MenuView() {
  const store = useMenuAdmin()
  const [editing, setEditing] = useState(null)  // null | 'new' | item

  return (
    <div className="flex-1 p-4 sm:p-10 max-w-[1100px] w-full mx-auto">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="font-display font-light text-[32px] text-espresso">menu</h2>
          <div className="text-[13px] text-cocoa/70 mt-1">What customers see on the order site. Changes show straight away.</div>
        </div>
        <div className="flex gap-2.5 items-center">
          <button className={wGhost} onClick={store.reload}>refresh</button>
          <button className={`${wDark} inline-flex items-center gap-1.5`} onClick={() => setEditing('new')}><IconPlus size={14} /> add item</button>
        </div>
      </div>

      {store.error && <div className="text-[13px] text-deep-rose px-3 py-2 bg-deep-rose/8 rounded-lg mb-6">{store.error}</div>}

      {store.loading ? (
        <div className="text-center py-20 font-display text-[22px] text-cocoa/50">loading…</div>
      ) : store.items.length === 0 ? (
        <div className="text-center py-20 font-display text-[22px] text-cocoa/50">nothing on the menu yet</div>
      ) : (
        <div className="flex flex-col gap-3">
          {store.items.map((item, n) => (
            <MenuItemCard key={item.id} item={item} first={n === 0} last={n === store.items.length - 1} store={store} onEdit={setEditing} />
          ))}
        </div>
      )}

      {editing && (
        <MenuEditModal
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={async (draft, sizes, original) => { await store.save(draft, sizes, original); setEditing(null) }}
        />
      )}
    </div>
  )
}
