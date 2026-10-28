import { LOGO_SRC, SOCIALS } from '../data.js'
import { IconIG, IconTG } from '../icons.jsx'

export default function Footer({ go }) {
  return (
    <footer className="oc-footer">
      <div className="oc-footer-grid">
        <div className="oc-footer-left">
          <img src={LOGO_SRC} alt="" style={{ width: 64 }} />
          <a href="#my-orders" className="oc-footer-link" onClick={(e) => { e.preventDefault(); go('orders') }}>
            my orders
          </a>
        </div>
        <div className="oc-footer-right">
          <div className="lc-eyebrow">find us</div>
          <div className="oc-footer-socials">
            <a href={SOCIALS.instagram.url} target="_blank" rel="noopener noreferrer" className="oc-footer-link">
              <IconIG /> {SOCIALS.instagram.handle}
            </a>
            <a href={SOCIALS.telegram.url} target="_blank" rel="noopener noreferrer" className="oc-footer-link">
              <IconTG /> {SOCIALS.telegram.handle}
            </a>
          </div>
        </div>
      </div>
      <div className="oc-footer-copy">© little crumb corner 2026</div>
    </footer>
  )
}
