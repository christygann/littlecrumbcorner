// publicDir is 'assets/', so files are served at /filename (no /assets/ prefix)
export const LOGO_SRC       = '/logo-mascot.png'
export const LOCKUP_SRC     = '/logo-lockup-inline.png'
export const PAYNOW_QR_SRC  = '/paynow-qr.png'
export const PAYNOW_NUMBER  = { value: '92372102', display: '9237 2102' }

// Fallback prices and availability. The live values come from the
// online_products table (see useProducts), which also prices every order.
export const PRODUCTS = [
  { id: 'basque',       group: 'basque',     option: 'slice',              name: 'basque burnt cheesecake (slice)',         price: 5.5, unit: 'per slice',  photo: '/basque-cheesecake.png' },
  { id: 'basque-whole', group: 'basque',     option: 'whole cake · 8"',    name: 'basque burnt cheesecake (whole 8")',      price: 50,  unit: 'whole cake', photo: '/basque-cheesecake.png' },
  { id: 'brownie',      group: 'brownie',    option: 'slice',              name: 'double fudge brownie (slice)',            price: 4.5, unit: 'per slice',  photo: '/double-fudge-brownie.png' },
  { id: 'brownie-7',    group: 'brownie',    option: 'whole · 7" × 7"',    name: 'double fudge brownie (whole 7" × 7")',    price: 24,  unit: 'whole tray', photo: '/double-fudge-brownie.png' },
  { id: 'brownie-10',   group: 'brownie',    option: 'whole · 10" × 10"',  name: 'double fudge brownie (whole 10" × 10")',  price: 48,  unit: 'whole tray', photo: '/double-fudge-brownie.png' },
  { id: 'strawberry',   group: 'strawberry', option: 'slice',              name: 'strawberry shortcake',                    price: 5,   unit: 'per slice',  photo: '/strawberry-shortcake.png', available: false },
  { id: 'muffin',       group: 'muffin',     option: 'each',               name: 'apple cinnamon muffin',                   price: 4,   unit: 'each',       photo: '/apple-cinnamon-muffin.png', available: false },
]

export const MENU_GROUPS = [
  { id: 'basque',     name: 'basque burnt cheesecake', tag: "baker's favourite", blurb: 'Slow-baked, caramelised top with a soft, almost-set centre.',      photo: '/basque-cheesecake.png' },
  { id: 'brownie',    name: 'double fudge brownie',    tag: 'signature',         blurb: 'Dense, fudgy, crackled top — dark chocolate folded through.',      photo: '/double-fudge-brownie.png' },
  { id: 'strawberry', name: 'strawberry shortcake',    tag: '',                  blurb: 'Light vanilla sponge layered with cream and fresh strawberries.', photo: '/strawberry-shortcake.png' },
  { id: 'muffin',     name: 'apple cinnamon muffin',   tag: '',                  blurb: 'Warm spiced apple folded with soft, tender crumb topping.',       photo: '/apple-cinnamon-muffin.png' },
]

// Groups products into menu cards. A card is unavailable when none of its sizes are.
export const buildMenu = (products) => {
  const menu = MENU_GROUPS.map(g => {
    const options = products
      .filter(p => p.group === g.id)
      .map(p => ({ ...p, unavailable: p.available === false }))
    return { ...g, options, unavailable: options.every(o => o.unavailable) }
  }).filter(g => g.options.length)
  const byId = Object.fromEntries(menu.flatMap(g => g.options).map(p => [p.id, p]))
  return { menu, byId }
}

export const GALLERY_PHOTOS = [
  '/SK709617.jpg', '/SK709628.jpg', '/SK709647.jpg', '/SK709764.jpg',
  '/SK709606.jpg', '/SK709644.jpg', '/SK709665.jpg', '/SK709746.jpg',
]

export const SOCIALS = {
  instagram: { handle: '@littlecrumbcorner', url: 'https://www.instagram.com/littlecrumbcorner' },
  telegram:  { handle: '@littlecrumbcorner', url: 'https://t.me/littlecrumbcorner' },
}

// Keep in step with place_online_order() in setup.sql
export const FULFILMENT = {
  collect: {
    label: 'self-collection', fee: 0,
    note: 'Saturday 6pm or Sunday 12pm at Paya Lebar MRT, Exit A.',
    location: 'Paya Lebar MRT · Exit A',
    days: { 6: '6:00pm', 0: '12:00pm' },
  },
  deliver: {
    label: 'islandwide delivery', fee: 10,
    note: "Flat $10 islandwide. We'll message you when your box is on the way.",
    slots: ['10:00 — 13:00', '14:00 — 17:00', '18:00 — 21:00'],
  },
}
export const LEAD_DAYS = 2

export const STATUS = {
  placed:    { label: 'placed',         variant: 'blush' },
  prepared:  { label: 'being prepared', variant: 'sage' },
  ready:     { label: 'ready',          variant: 'sage' },
  completed: { label: 'completed',      variant: null },
  cancelled: { label: 'cancelled',      variant: null },
}

// ── home cafe (section currently hidden) ──

export const DRINKS = [
  {
    group: 'milk options',
    items: [
      'classic matcha / hojicha latte',
      'caramelised banana matcha',
      'salted maple hojicha',
    ],
  },
  {
    group: 'tea options',
    items: [
      'lavender earl grey with matcha cloud',
      'grape oolong with matcha cloud',
    ],
  },
]

export const CAFE = {
  time:  '1pm — 5pm',
  blurb: 'come for our first ever home cafe!',
  perks: [
    'small-batch bakes and drinks',
    'board games & quiet music',
    'chill and cozy place for friends',
  ],
}

export const SLOTS    = ['1:00 — 2:00', '2:00 — 3:00', '3:00 — 4:00', '4:00 — 5:00']
export const REFERRAL = ['instagram', 'telegram', 'a friend', 'walked past', 'other']
