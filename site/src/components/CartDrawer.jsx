import { Button, Stepper } from './ui.jsx'
import { IconBin, IconClose } from '../icons.jsx'
import { LOGO_SRC } from '../data.js'
import { fmt } from '../lib/helpers.js'

export default function CartDrawer({ open, lines, onClose, setQty, remove, onCheckout }) {
  const count = lines.reduce((s, l) => s + l.qty, 0)
  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0)

  return (
    <div className={`oc-drawer-wrap${open ? ' open' : ''}`} aria-hidden={!open}>
      <div className="oc-scrim" onClick={onClose} />
      <aside className="oc-drawer" role="dialog" aria-label="your bag">
        <header className="oc-drawer-head">
          <div>
            <div className="lc-eyebrow">your bag</div>
            <div className="oc-drawer-title">{count} {count === 1 ? 'item' : 'items'}</div>
          </div>
          <button className="oc-icon-btn" aria-label="close bag" onClick={onClose}><IconClose /></button>
        </header>

        {lines.length === 0 ? (
          <div className="oc-drawer-empty">
            <img src={LOGO_SRC} alt="" style={{ width: 90, opacity: 0.85 }} />
            <p>your bag is empty</p>
            <Button kind="secondary" onClick={onClose}>browse the menu</Button>
          </div>
        ) : (
          <>
            <div className="oc-drawer-lines">
              {lines.map(l => (
                <div key={l.id} className="oc-line">
                  <img src={l.product.photo} alt="" className="oc-line-thumb" />
                  <div className="oc-line-body">
                    <div className="oc-line-top">
                      <span className="oc-line-name">{l.product.name}</span>
                      <span className="oc-line-total">{fmt(l.subtotal)}</span>
                    </div>
                    <div className="oc-line-bottom">
                      <Stepper size="sm" value={l.qty} onChange={(q) => setQty(l.id, q)} />
                      <button className="oc-icon-btn oc-bin-btn" aria-label={`remove ${l.product.name}`} title="remove" onClick={() => remove(l.id)}>
                        <IconBin />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <footer className="oc-drawer-foot">
              <div className="oc-sum-row">
                <span className="oc-sum-label-display">subtotal</span>
                <span className="oc-sum-strong">{fmt(subtotal)}</span>
              </div>
              <div className="oc-drawer-hint">Collection or delivery is chosen at checkout.</div>
              <Button onClick={onCheckout} style={{ width: '100%' }}>checkout</Button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
