import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Field, SectionHeader } from './ui.jsx'
import { IconCal, IconCheck, IconChevron, IconCopy, IconDownload, IconEdit, IconPin, IconTruck, IconUpload, IconBin } from '../icons.jsx'
import { FULFILMENT, LOGO_SRC, PAYNOW_NUMBER, PAYNOW_QR_SRC } from '../data.js'
import { fmt, fmtDay, fmtDow, toDateKey, upcomingDates } from '../lib/helpers.js'
import { placeOrder } from '../lib/orders.js'

const STEPS = ['collection or delivery', 'your details', 'payment']

const EMPTY_FORM = {
  method: '', date: '', slot: '', street: '', unit: '', postal: '',
  name: '', phone: '', telegram: '', email: '', note: '', proof: null,
}

function Choice({ active, onClick, className = '', children }) {
  return (
    <button type="button" onClick={onClick} className={`oc-choice${active ? ' active' : ''} ${className}`}>
      {children}
    </button>
  )
}

function CopyNumber({ value, display }) {
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(t)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      const t = document.createElement('textarea')
      t.value = value
      document.body.appendChild(t)
      t.select()
      try { document.execCommand('copy') } catch { /* nothing else to try */ }
      t.remove()
    }
    setCopied(true)
  }

  return (
    <div className="oc-copy-row">
      <span className="oc-paynow-num">{display}</span>
      <button type="button" className={`oc-icon-btn oc-copy-btn${copied ? ' copied' : ''}`} onClick={copy} aria-label="copy paynow number" title="copy">
        {copied ? <IconCheck size={18} /> : <IconCopy />}
      </button>
      <span className={`oc-copied${copied ? ' show' : ''}`} aria-live="polite">{copied ? 'copied' : ''}</span>
    </div>
  )
}

// Shrinks the screenshot to ≤700px JPEG before it's kept in state / uploaded.
function compressImage(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onerror = reject
    r.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const sc = Math.min(1, 700 / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * sc)
        c.height = Math.round(img.height * sc)
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.7))
      }
      img.src = r.result
    }
    r.readAsDataURL(file)
  })
}

function ProofUpload({ value, onChange }) {
  const ref = useRef(null)
  const [drag, setDrag] = useState(false)
  const pick = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    compressImage(file).then(url => onChange({ name: file.name, url })).catch(() => {})
  }

  return (
    <div className="oc-proof">
      <span className="oc-label">transaction screenshot</span>
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => { pick(e.target.files[0]); e.target.value = '' }} />
      {value ? (
        <div className="oc-proof-file">
          <img src={value.url} alt="transfer screenshot" />
          <div className="oc-proof-meta">
            <span className="oc-proof-name">{value.name}</span>
            <span className="oc-proof-ok"><IconCheck size={14} /> uploaded</span>
          </div>
          <div className="oc-proof-actions">
            <button type="button" className="oc-text-btn" onClick={() => ref.current.click()}>replace</button>
            <button type="button" className="oc-icon-btn oc-bin-btn" aria-label="remove screenshot" onClick={() => onChange(null)}><IconBin /></button>
          </div>
        </div>
      ) : (
        <button
          type="button" className={`oc-proof-drop${drag ? ' drag' : ''}`}
          onClick={() => ref.current.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
        >
          <IconUpload />
          <span className="oc-proof-cta">upload screenshot</span>
          <span className="oc-muted">PNG or JPG of your PayNow confirmation</span>
        </button>
      )}
    </div>
  )
}

export function OrderSummary({ lines, fee, method, onEditBag, compact, schedule }) {
  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0)
  return (
    <div className="oc-summary">
      <div className="oc-summary-head">
        <span className="lc-eyebrow">order summary</span>
        {onEditBag && (
          <button className="oc-icon-btn oc-bin-btn" aria-label="edit bag" title="edit bag" onClick={onEditBag}><IconEdit /></button>
        )}
      </div>
      <div className="oc-summary-lines">
        {lines.map(l => (
          <div key={l.id} className="oc-summary-line">
            {!compact && l.product.photo && <img src={l.product.photo} alt="" />}
            <span className="oc-summary-name">{l.product.name}<span className="oc-summary-qty"> × {l.qty}</span></span>
            <span>{fmt(l.subtotal)}</span>
          </div>
        ))}
      </div>
      <div className="oc-summary-foot">
        <div className="oc-sum-row"><span>subtotal</span><span>{fmt(subtotal)}</span></div>
        <div className="oc-sum-row">
          <span>{method ? FULFILMENT[method].label : 'collection / delivery'}</span>
          <span>{method ? (fee ? fmt(fee) : 'free') : '—'}</span>
        </div>
        {schedule && (
          <div className="oc-summary-schedule">
            <IconCal />
            <div>
              <div>{fmtDay(schedule.date)} · {schedule.slot}</div>
              <div className="oc-muted">{schedule.method === 'collect' ? FULFILMENT.collect.location : schedule.postal}</div>
            </div>
          </div>
        )}
        <div className="oc-sum-row oc-sum-total"><span>total</span><span>{fmt(subtotal + fee)}</span></div>
      </div>
    </div>
  )
}

function stepErrors(f) {
  return [
    [
      !f.method && 'Choose collection or delivery.',
      !f.date && 'Pick a date.',
      !f.slot && (f.method === 'collect' ? 'Pick a collection day.' : 'Pick a time slot.'),
      f.method === 'deliver' && !f.street.trim() && 'Add your street address.',
      f.method === 'deliver' && !/^\d{6}$/.test(f.postal.trim()) && 'Add a 6-digit postal code.',
    ],
    [
      !f.name.trim() && 'Add your name.',
      !/^\+?[\d\s]{8,20}$/.test(f.phone.trim()) && 'Add a phone number we can reach you on.',
    ],
    [
      !f.proof && 'Upload a screenshot of your PayNow transfer.',
    ],
  ].map(a => a.filter(Boolean))
}

export default function Checkout({ lines, onPlace, onEditBag, go }) {
  const deliverDates = useMemo(() => upcomingDates(8), [])
  const collectDates = useMemo(() => upcomingDates(6, [6, 0]), [])
  const [step, setStep] = useState(0)
  const [f, setF] = useState(EMPTY_FORM)
  const [tried, setTried] = useState(false)
  const [paying, setPaying] = useState(false)
  const [serverError, setServerError] = useState('')
  const [qrMissing, setQrMissing] = useState(false)

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [step])

  const set = (k) => (e) => setF(p => ({ ...p, [k]: e && e.target ? e.target.value : e }))
  const fee = f.method ? FULFILMENT[f.method].fee : 0
  const dates = f.method === 'collect' ? collectDates : deliverDates
  const total = lines.reduce((s, l) => s + l.subtotal, 0) + fee

  if (lines.length === 0) return (
    <section className="oc-page oc-center">
      <SectionHeader eyebrow="checkout" title="your bag is empty" />
      <Button onClick={() => go('home', 'order')}>browse the menu</Button>
    </section>
  )

  const errors = stepErrors(f)[step]

  const next = async () => {
    setServerError('')
    if (errors.length) { setTried(true); return }
    setTried(false)
    if (step < 2) { setStep(step + 1); return }
    setPaying(true)
    try {
      onPlace(await placeOrder(f, lines))
    } catch (err) {
      setServerError(err.message)
      setPaying(false)
    }
  }

  return (
    <section className="oc-page">
      <div className="oc-checkout-head">
        <button className="oc-back" onClick={() => (step ? setStep(step - 1) : go('home', 'order'))}>
          <IconChevron dir="left" /> {step ? 'back' : 'continue shopping'}
        </button>
        <h1 className="oc-page-title">checkout</h1>
        <ol className="oc-steps">
          {STEPS.map((s, i) => (
            <li key={s} className={i === step ? 'active' : i < step ? 'done' : ''}>
              <button type="button" disabled={i > step || paying} onClick={() => i < step && setStep(i)}>
                <span className="oc-step-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="oc-step-label">{s}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="oc-checkout-grid">
        <div className="oc-panel">
          {step === 0 && (
            <div className="oc-stack">
              <div className="oc-method-grid">
                {['collect', 'deliver'].map(m => (
                  <Choice key={m} active={f.method === m} className="oc-method"
                    onClick={() => setF(p => ({ ...p, method: m, date: '', slot: '' }))}>
                    <span className="oc-method-icon">{m === 'collect' ? <IconPin size={20} /> : <IconTruck />}</span>
                    <span className="oc-method-name">{FULFILMENT[m].label}</span>
                    <span className="oc-method-fee">{FULFILMENT[m].fee ? fmt(FULFILMENT[m].fee) : 'free'}</span>
                    <span className="oc-method-note">{FULFILMENT[m].note}</span>
                  </Choice>
                ))}
              </div>

              {f.method && (
                <div className="oc-stack-sm">
                  <span className="oc-label">{f.method === 'collect' ? 'collection day' : 'delivery date'}</span>
                  <div className="oc-chip-row">
                    {dates.map(d => {
                      const key = toDateKey(d)
                      const time = f.method === 'collect' ? FULFILMENT.collect.days[d.getDay()] : null
                      return (
                        <Choice key={key} active={f.date === key} className={`oc-date${time ? ' oc-date--collect' : ''}`}
                          onClick={() => setF(p => ({ ...p, date: key, slot: time || p.slot }))}>
                          <span className="oc-date-dow">{d.toLocaleDateString('en-SG', { weekday: 'short' })}</span>
                          <span className="oc-date-day">{d.getDate()}</span>
                          <span className="oc-date-mon">{d.toLocaleDateString('en-SG', { month: 'short' })}</span>
                          {time && <span className="oc-date-time">{time}</span>}
                        </Choice>
                      )
                    })}
                  </div>
                </div>
              )}

              {f.method === 'deliver' && (
                <>
                  <div className="oc-stack-sm">
                    <span className="oc-label">time slot</span>
                    <div className="oc-chip-row">
                      {FULFILMENT.deliver.slots.map(sl => (
                        <Choice key={sl} active={f.slot === sl} className="oc-pill" onClick={() => set('slot')(sl)}>{sl}</Choice>
                      ))}
                    </div>
                  </div>
                  <div className="oc-stack-sm">
                    <Field label="street address">
                      <input className="oc-input" value={f.street} onChange={set('street')} placeholder="Blk 123 Serangoon Ave 3" autoComplete="street-address" maxLength={200} />
                    </Field>
                    <div className="oc-row-2">
                      <Field label="unit">
                        <input className="oc-input" value={f.unit} onChange={set('unit')} placeholder="#04-56" maxLength={20} />
                      </Field>
                      <Field label="postal code">
                        <input className="oc-input" value={f.postal} onChange={(e) => set('postal')(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="550123" inputMode="numeric" autoComplete="postal-code" />
                      </Field>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="oc-stack-sm">
              <Field label="name">
                <input className="oc-input" value={f.name} onChange={set('name')} placeholder="jane lee" autoComplete="name" maxLength={100} />
              </Field>
              <div className="oc-row-2">
                <Field label="phone">
                  <input className="oc-input" value={f.phone} onChange={set('phone')} placeholder="+65 9123 4567" inputMode="tel" autoComplete="tel" maxLength={20} />
                </Field>
                <Field label="telegram" hint="Optional">
                  <input className="oc-input" value={f.telegram} onChange={set('telegram')} placeholder="@janelee" maxLength={40} />
                </Field>
              </div>
              <Field label="email" hint="Optional — for your receipt">
                <input className="oc-input" type="email" value={f.email} onChange={set('email')} placeholder="jane@email.com" autoComplete="email" maxLength={120} />
              </Field>
              <Field label="note" hint="Optional">
                <textarea className="oc-input" rows={3} value={f.note} onChange={set('note')} maxLength={1000}
                  placeholder="Allergies, a birthday message, anything we should know" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="oc-stack">
              <div className="oc-paynow">
                <div className="oc-qr-wrap">
                  <div className="oc-qr">
                    <img src={qrMissing ? LOGO_SRC : PAYNOW_QR_SRC} alt="PayNow QR code" onError={() => setQrMissing(true)} />
                  </div>
                  {!qrMissing && (
                    <a className="oc-qr-dl" href={PAYNOW_QR_SRC} download="littlecrumbcorner-paynow-qr.png" aria-label="download qr code">
                      <IconDownload /><span>save qr</span>
                    </a>
                  )}
                </div>
                <div className="oc-stack-sm" style={{ justifyContent: 'center' }}>
                  <div className="lc-eyebrow">amount</div>
                  <div className="oc-paynow-amt">{fmt(total)}</div>
                  <div className="oc-paynow-to">
                    <span className="lc-eyebrow">paynow to</span>
                    <CopyNumber value={PAYNOW_NUMBER.value} display={PAYNOW_NUMBER.display} />
                  </div>
                  <p className="oc-muted" style={{ margin: 0 }}>Add your phone number as the reference so we can match your transfer.</p>
                </div>
                <ProofUpload value={f.proof} onChange={(v) => setF(p => ({ ...p, proof: v }))} />
              </div>
            </div>
          )}

          {tried && errors.length > 0 && <div className="oc-error" role="alert">{errors[0]}</div>}
          {serverError && <div className="oc-error" role="alert">{serverError}</div>}
          <div className="oc-panel-foot">
            <Button onClick={next} disabled={paying}>
              {step < 2 ? 'continue' : paying ? 'placing order …' : `place order · ${fmt(total)}`}
            </Button>
          </div>
        </div>

        <aside className="oc-checkout-aside">
          <OrderSummary
            lines={lines} fee={fee} method={f.method} onEditBag={paying ? null : onEditBag}
            schedule={step > 0 && f.method && f.date && f.slot ? { method: f.method, date: f.date, slot: f.slot, postal: f.postal } : null}
          />
        </aside>
      </div>
    </section>
  )
}

export function Confirmation({ order, byId, go }) {
  const lines = order.items.map(i => ({
    id: i.id, product: { name: i.name, photo: byId[i.id]?.photo }, qty: i.qty, subtotal: i.qty * i.price,
  }))
  return (
    <section className="oc-page oc-confirm">
      <div className="oc-oval" style={{ top: 40, right: -120, width: 340, height: 240, background: 'var(--blush)' }} />
      <div className="oc-confirm-inner">
        <img src={LOGO_SRC} alt="" className="oc-confirm-mascot" />
        <div className="lc-eyebrow">order placed</div>
        <h1 className="oc-page-title" style={{ margin: 0 }}>thank you, {order.name.split(' ')[0]}</h1>
        <p className="oc-confirm-copy">
          Your box is in the works. We'll have it ready {order.method === 'collect' ? 'for collection' : 'for delivery'} on {fmtDow(order.date)}.
          We'll check your PayNow transfer and message you if anything's off.
        </p>
        <div className="oc-confirm-card">
          <div className="oc-confirm-no">
            <span className="lc-eyebrow">order number</span>
            <span className="oc-order-no">{order.number}</span>
          </div>
          <div className="oc-confirm-meta">
            <div><span className="oc-label">{order.method === 'collect' ? 'collection' : 'delivery'}</span><span>{fmtDay(order.date)} · {order.slot}</span></div>
            <div><span className="oc-label">{order.method === 'collect' ? 'where' : 'to'}</span><span>{order.method === 'collect' ? FULFILMENT.collect.location : order.address}</span></div>
            <div><span className="oc-label">paid with</span><span>PayNow</span></div>
          </div>
          <OrderSummary lines={lines} fee={Number(order.fee)} method={order.method} compact />
        </div>
        <div className="oc-confirm-actions">
          <Button onClick={() => go('orders')}>view my orders</Button>
          <Button kind="secondary" onClick={() => go('home')}>back to home</Button>
        </div>
      </div>
    </section>
  )
}
