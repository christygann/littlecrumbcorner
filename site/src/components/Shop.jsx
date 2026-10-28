import { useEffect, useRef, useState } from 'react'
import { Button, Price, SectionHeader, Stepper, Tag } from './ui.jsx'
import { IconBagPlus, IconCheck, IconClose } from '../icons.jsx'
import { fmt } from '../lib/helpers.js'

function AddButton({ label, onClick, disabled, inBag, children }) {
  return (
    <span className="oc-add-wrap">
      <Button onClick={onClick} disabled={disabled} className="oc-add-btn" aria-label={label} title={label}>
        {children}
      </Button>
      {!disabled && inBag > 0 && <span className="oc-badge oc-add-badge" aria-label={`${inBag} in your bag`}>{inBag}</span>}
    </span>
  )
}

function ProductCard({ g, inBag, onAdd, onChoose }) {
  const [qty, setQty] = useState(1)
  const [flash, setFlash] = useState(false)
  const multi = g.options.length > 1
  const single = g.options[0]
  const orderable = g.options.filter(o => !o.unavailable)
  const minPrice = Math.min(...(orderable.length ? orderable : g.options).map(o => o.price))
  const photoCls = g.hasPhoto ? '' : 'oc-photo-placeholder'

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(false), 1400)
    return () => clearTimeout(t)
  }, [flash])

  const add = () => { onAdd(single.id, qty); setQty(1); setFlash(true) }

  return (
    <article className={`oc-product${g.unavailable ? ' is-unavailable' : ''}`} aria-disabled={g.unavailable || undefined}>
      <div className="oc-product-photo">
        {multi && !g.unavailable
          ? <button type="button" className="oc-photo-btn" onClick={() => onChoose(g)} aria-label={`choose ${g.name} size`}><img src={g.photo} alt={g.name} className={photoCls} /></button>
          : <img src={g.photo} alt={g.name} className={photoCls} />}
        {g.unavailable && <span className="oc-unavail-badge"><Tag>{g.status === 'sold_out' ? 'sold out' : 'unavailable'}</Tag></span>}
        {/* on phones the tag sits on the photo to keep the card short */}
        {!g.unavailable && g.tag && <span className="oc-photo-tag"><Tag variant="sage">{g.tag}</Tag></span>}
      </div>
      <div className="oc-product-body">
        <div className="oc-product-tag">{!g.unavailable && g.tag && <Tag variant="sage">{g.tag}</Tag>}</div>
        <h3 className="oc-product-name">{g.name}</h3>
        <div className="oc-price-wrap">
          {multi
            ? <div className="oc-from"><span>from</span><Price amount={minPrice} /></div>
            : <Price amount={single.price} label={single.unit} />}
        </div>
        <p className="oc-product-blurb">{g.blurb}</p>
        {multi ? (
          <div className="oc-product-actions">
            <span className="oc-size-count">{g.options.length} {g.options.length === 1 ? 'size' : 'sizes'}</span>
            <AddButton label={`choose ${g.name} size`} onClick={() => onChoose(g)} disabled={g.unavailable} inBag={inBag}>
              <IconBagPlus />
            </AddButton>
          </div>
        ) : (
          <div className="oc-product-actions">
            <Stepper value={qty} onChange={setQty} disabled={g.unavailable} />
            <AddButton label={`add ${g.name} to bag`} onClick={add} disabled={g.unavailable} inBag={inBag}>
              {flash ? <IconCheck /> : <IconBagPlus />}
            </AddButton>
          </div>
        )}
      </div>
    </article>
  )
}

function OptionSheet({ g, onClose, onAdd }) {
  const [qty, setQty] = useState({})
  // keep the last group rendered while the sheet animates closed
  const shown = useRef(null)
  if (g) shown.current = g
  const cur = shown.current

  useEffect(() => {
    setQty({})
    if (!g) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [g, onClose])

  const count = Object.values(qty).reduce((a, b) => a + b, 0)
  const total = cur ? cur.options.reduce((s, o) => s + (qty[o.id] || 0) * o.price, 0) : 0
  const add = () => { cur.options.forEach(o => qty[o.id] && onAdd(o.id, qty[o.id])); onClose() }

  return (
    <div className={`oc-sheet-wrap${g ? ' open' : ''}`} aria-hidden={!g}>
      <div className="oc-scrim" onClick={onClose} />
      {cur && (
        <div className="oc-sheet" role="dialog" aria-label={`choose ${cur.name}`}>
          <div className="oc-sheet-head">
            <img src={cur.photo} alt="" className={`oc-sheet-thumb ${cur.hasPhoto ? '' : 'oc-photo-placeholder'}`} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="lc-eyebrow">choose a size</div>
              <div className="oc-drawer-title">{cur.name}</div>
            </div>
            <button className="oc-icon-btn" aria-label="close" onClick={onClose}><IconClose /></button>
          </div>
          <div className="oc-sheet-options">
            {cur.options.map(o => {
              const q = qty[o.id] || 0
              return (
                <div key={o.id} className={`oc-option${q ? ' active' : ''}${o.unavailable ? ' is-unavailable' : ''}`}>
                  <div className="oc-option-info">
                    <span className="oc-option-name">{o.option}</span>
                    {o.soldOut && <span className="oc-option-soldout">sold out</span>}
                  </div>
                  <Price amount={o.price} />
                  <Stepper size="sm" min={0} value={q} disabled={o.unavailable}
                    onChange={(v) => setQty(p => ({ ...p, [o.id]: v }))} />
                </div>
              )
            })}
          </div>
          <div className="oc-sheet-foot">
            <div className="oc-sum-row">
              <span className="oc-sum-label-display">{count} {count === 1 ? 'item' : 'items'}</span>
              <span className="oc-sum-strong">{fmt(total)}</span>
            </div>
            <Button onClick={add} disabled={!count} style={{ width: '100%' }}>
              {count ? 'add to bag' : 'select a size'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Shop({ menu, loading, error, cart, onAdd }) {
  const [choosing, setChoosing] = useState(null)
  const close = useRef(() => setChoosing(null)).current
  const inBag = (g) => g.options.reduce((s, o) => s + (cart.find(c => c.id === o.id)?.qty || 0), 0)

  return (
    <section id="order" className="oc-section-lg" style={{ background: 'var(--linen)' }}>
      <SectionHeader eyebrow="place an order" title="what we bake" />
      {loading || error || !menu.length ? (
        <p className="oc-shop-status">
          {loading ? 'loading the menu …' : error || 'nothing on the menu right now — check back soon'}
        </p>
      ) : (
        <div className="oc-product-grid">
          {menu.map(g => <ProductCard key={g.id} g={g} inBag={inBag(g)} onAdd={onAdd} onChoose={setChoosing} />)}
        </div>
      )}
      <OptionSheet g={choosing} onClose={close} onAdd={onAdd} />
    </section>
  )
}
