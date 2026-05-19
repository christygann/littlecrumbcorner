// publicDir is 'assets/', so files are served at /filename (no /assets/ prefix)
export const LOGO_SRC       = '/logo-mark-cocoa.png'
export const LOGO_BLUSH_SRC = '/logo-mark-blush.png'

export const MENU = [
  {
    id: 'basque', name: 'basque burnt cheesecake', tag: 'signature', price: '$5.50',
    blurb: 'Slow-baked, caramelised top with a soft, almost-set centre.',
    photo: '/basque-cheesecake.png',
  },
  {
    id: 'strawberry', name: 'strawberry shortcake', tag: '', price: '$5.00',
    blurb: 'Light vanilla sponge layered with cream and fresh strawberries.',
    photo: '/strawberry-shortcake.png',
  },
  {
    id: 'brownie', name: 'double fudge brownie', tag: '', price: '$4.00',
    blurb: 'Dense, fudgy, crackled top — dark chocolate folded through.',
    photo: '/double-fudge-brownie.png',
  },
  {
    id: 'muffin', name: 'apple cinnamon muffin', tag: '', price: '$3.80',
    blurb: 'Warm spiced apple folded with soft, tender crumb topping.',
    photo: '/apple-cinnamon-muffin.png',
  },
]

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

export const SOCIALS = {
  instagram: { handle: '@littlecrumbcorner', url: 'https://www.instagram.com/littlecrumbcorner' },
  telegram:  { handle: '@littlecrumbcorner', url: 'https://t.me/littlecrumbcorner' },
}

export const SLOTS    = ['1:00 — 2:00', '2:00 — 3:00', '3:00 — 4:00', '4:00 — 5:00']
export const REFERRAL = ['instagram', 'telegram', 'a friend', 'walked past', 'other']
