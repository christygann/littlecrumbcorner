import { useEffect, useState } from 'react'
import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Shop from './components/Shop.jsx'
import Gallery from './components/Gallery.jsx'
import Footer from './components/Footer.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Checkout, { Confirmation } from './components/Checkout.jsx'
import MyOrders from './components/MyOrders.jsx'
// HomeCafe (sign-ups) is kept for the next home cafe; render it again here when it's announced.
import { cartLines, readJSON, writeJSON } from './lib/helpers.js'
import { rememberOrder, useMenu } from './lib/orders.js'

const CART_KEY = 'lcc-cart-v1'
const HASH = { checkout: '#/checkout', orders: '#/orders', confirm: '#/orders' }
const viewFromHash = () => {
  const v = window.location.hash.replace(/^#\/?/, '')
  return v === 'checkout' || v === 'orders' ? v : 'home'
}

export default function App() {
  const { menu, byId, loading: menuLoading, error: menuError } = useMenu()
  const [view, setView] = useState(viewFromHash)
  const [cart, setCart] = useState(() => readJSON(CART_KEY, []))
  const [bagOpen, setBagOpen] = useState(false)
  const [lastOrder, setLastOrder] = useState(null)

  useEffect(() => writeJSON(CART_KEY, cart), [cart])
  useEffect(() => { document.body.style.overflow = bagOpen ? 'hidden' : '' }, [bagOpen])

  // Pages live in the hash (#/checkout, #/orders) so the back button works.
  useEffect(() => {
    const onPop = () => { setBagOpen(false); setView(viewFromHash()) }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const go = (v, anchor) => {
    setBagOpen(false)
    // The confirmation isn't bookmarkable: a refresh there lands on my orders.
    const url = new URL(HASH[v] || window.location.pathname + window.location.search, window.location.href).href
    if (v === 'confirm') window.history.replaceState(null, '', url)
    else if (url !== window.location.href) window.history.pushState(null, '', url)
    setView(v)
    setTimeout(() => {
      const el = anchor && document.getElementById(anchor)
      window.scrollTo({ top: el ? el.getBoundingClientRect().top + window.scrollY - 80 : 0, behavior: anchor ? 'smooth' : 'auto' })
    }, 30)
  }

  const add = (id, qty) => setCart(c => c.some(x => x.id === id)
    ? c.map(x => x.id === id ? { ...x, qty: Math.min(30, x.qty + qty) } : x)
    : [...c, { id, qty }])
  const setQty = (id, qty) => setCart(c => c.map(x => x.id === id ? { ...x, qty } : x))
  const remove = (id) => setCart(c => c.filter(x => x.id !== id))

  const place = (order) => {
    rememberOrder(order)
    setCart([])
    setLastOrder(order)
    go('confirm')
  }
  const reorder = (o) => {
    o.items.forEach(i => byId[i.id] && !byId[i.id].unavailable && add(i.id, i.qty))
    setBagOpen(true)
  }

  const lines = cartLines(cart, byId)
  const count = lines.reduce((s, l) => s + l.qty, 0)

  return (
    <div className="oc-site">
      <Nav count={count} onBag={() => setBagOpen(true)} go={go} />
      <main className="oc-main">
        {view === 'home' && (
          <>
            <Hero go={go} />
            <div className="lc-dots" style={{ fontSize: 18, marginBottom: 24 }} />
            <Shop menu={menu} loading={menuLoading} error={menuError} cart={cart} onAdd={add} />
            <Gallery />
            <About />
          </>
        )}
        {view === 'checkout' && <Checkout lines={lines} onPlace={place} onEditBag={() => setBagOpen(true)} go={go} />}
        {view === 'confirm' && lastOrder && <Confirmation order={lastOrder} byId={byId} go={go} />}
        {view === 'orders' && <MyOrders byId={byId} onReorder={reorder} go={go} />}
      </main>
      <Footer go={go} />
      <CartDrawer
        open={bagOpen} lines={lines} onClose={() => setBagOpen(false)}
        setQty={setQty} remove={remove} onCheckout={() => go('checkout')}
      />
    </div>
  )
}
