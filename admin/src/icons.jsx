// Stroke 1.5, rounded caps — same line icons as the customer site.
const svgProps = (size) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
})

export const IconEdit = ({ size = 17 }) => (
  <svg {...svgProps(size)}>
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z" />
    <line x1="13.5" y1="8.5" x2="16.5" y2="11.5" />
  </svg>
)

export const IconBin = ({ size = 17 }) => (
  <svg {...svgProps(size)}>
    <path d="M4.5 7h15" />
    <path d="M9.5 7V5.2a1.2 1.2 0 0 1 1.2-1.2h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
    <path d="M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12" />
    <line x1="10.2" y1="11" x2="10.5" y2="17" />
    <line x1="13.8" y1="11" x2="13.5" y2="17" />
  </svg>
)

export const IconPin = ({ size = 16 }) => (
  <svg {...svgProps(size)}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
)

export const IconTruck = ({ size = 16 }) => (
  <svg {...svgProps(size)}>
    <path d="M3 6.5h10.5v10H3z" />
    <path d="M13.5 9.5h4l3 3.2v3.8h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
)

export const IconChevronDown = ({ size = 16 }) => (
  <svg {...svgProps(size)}><polyline points="6 9 12 15 18 9" /></svg>
)

// Round icon buttons for edit / delete
export const iconBtn    = 'inline-flex items-center justify-center w-8 h-8 rounded-full text-cocoa/70 hover:text-cocoa hover:bg-linen cursor-pointer transition-colors'
export const iconBtnDel = 'inline-flex items-center justify-center w-8 h-8 rounded-full text-deep-rose/80 hover:text-deep-rose hover:bg-deep-rose/10 cursor-pointer transition-colors'
