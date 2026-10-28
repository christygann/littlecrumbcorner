import { useState } from 'react'
import { LOCKUP_SRC } from '../data.js'
import { IconBag, IconClose, IconMenu } from '../icons.jsx'

const LINKS = ['about', 'order', 'gallery']

export default function Nav({ count, onBag, go }) {
  const [open, setOpen] = useState(false)
  const click = (fn) => (e) => { e.preventDefault(); setOpen(false); fn() }

  return (
    <nav className="oc-nav">
      <div className="oc-nav-inner">
        <a href="#" onClick={click(() => go('home'))}>
          <img src={LOCKUP_SRC} alt="little crumb corner" className="oc-nav-logo" />
        </a>
        <ul className={`oc-nav-links${open ? ' open' : ''}`}>
          {LINKS.map(l => (
            <li key={l}><a href={`#${l}`} onClick={click(() => go('home', l))}>{l}</a></li>
          ))}
          <li><a href="#my-orders" onClick={click(() => go('orders'))}>my orders</a></li>
        </ul>
        <div className="oc-nav-actions">
          <button className="oc-icon-btn" aria-label="open bag" onClick={onBag}>
            <IconBag />
            {count > 0 && <span className="oc-badge">{count}</span>}
          </button>
          <button className="oc-icon-btn oc-mobile-only" aria-label="toggle menu" onClick={() => setOpen(o => !o)}>
            {open ? <IconClose size={22} /> : <IconMenu />}
          </button>
        </div>
      </div>
    </nav>
  )
}
