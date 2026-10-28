import { LOCKUP_SRC } from '../data.js'
import { Button } from './ui.jsx'

export default function Hero({ go }) {
  return (
    // Fills the screen below the sticky nav so only the logo shows until you scroll
    <section className="oc-hero">
      {/* Decorative blobs */}
      <div className="oc-oval" style={{ top: -60, right: -80, width: 360, height: 260, background: 'var(--blush)' }} />
      <div className="oc-oval" style={{ bottom: -100, left: -100, width: 400, height: 300, background: 'var(--sage-light)' }} />

      <div className="oc-hero-inner">
        <h1 style={{ margin: 0 }}>
          <img src={LOCKUP_SRC} alt="little crumb corner" className="oc-hero-logo" />
        </h1>
        <Button onClick={() => go('home', 'order')}>place an order</Button>
      </div>
    </section>
  )
}
