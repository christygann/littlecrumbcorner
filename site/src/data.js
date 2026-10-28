// publicDir is 'assets/', so files are served at /filename (no /assets/ prefix)
export const LOGO_SRC       = '/logo-mascot.png'
export const LOCKUP_SRC     = '/logo-lockup-inline.png'
export const PAYNOW_QR_SRC  = '/paynow-qr.jpg'
export const PAYNOW_NUMBER  = { value: '92372102', display: '9237 2102' }

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
    note: 'Saturday 6pm or Sunday 12pm at Paya Lebar MRT, Exit E.',
    location: 'Paya Lebar MRT · Exit E',
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
