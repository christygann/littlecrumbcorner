// Stroke 1.5, rounded caps — matches the design system's line icons.
const svgProps = (size) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round',
})

export const IconIG = ({ size = 18 }) => (
  <svg {...svgProps(size)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17" cy="7" r="0.7" fill="currentColor" />
  </svg>
)

export const IconTG = ({ size = 18 }) => (
  <svg {...svgProps(size)}>
    <path d="M21 4 2.5 11.5l5.5 2 2 6 3.5-4 5 4z" />
    <path d="m7.5 13.5 7-5" />
  </svg>
)

export const IconCal = ({ size = 18 }) => (
  <svg {...svgProps(size)}>
    <rect x="4" y="6" width="16" height="14" rx="2" />
    <line x1="4" y1="10" x2="20" y2="10" />
    <line x1="9" y1="3" x2="9" y2="7" />
    <line x1="15" y1="3" x2="15" y2="7" />
  </svg>
)

export const IconClock = ({ size = 18 }) => (
  <svg {...svgProps(size)}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 16 14" />
  </svg>
)

export const IconBag = ({ size = 20 }) => (
  <svg {...svgProps(size)}>
    <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" />
  </svg>
)

export const IconBagPlus = ({ size = 20 }) => (
  <svg {...svgProps(size)}>
    <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" />
    <path d="M9 10V7a3 3 0 0 1 6 0v3" />
    <line x1="12" y1="12.5" x2="12" y2="17.5" />
    <line x1="9.5" y1="15" x2="14.5" y2="15" />
  </svg>
)

export const IconCheck = ({ size = 20 }) => (
  <svg {...svgProps(size)}><polyline points="5 12.5 10 17.5 19 7.5" /></svg>
)

export const IconBin = ({ size = 18 }) => (
  <svg {...svgProps(size)}>
    <path d="M4.5 7h15" />
    <path d="M9.5 7V5.2a1.2 1.2 0 0 1 1.2-1.2h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
    <path d="M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12" />
    <line x1="10.2" y1="11" x2="10.5" y2="17" />
    <line x1="13.8" y1="11" x2="13.5" y2="17" />
  </svg>
)

export const IconTruck = ({ size = 20 }) => (
  <svg {...svgProps(size)}>
    <path d="M3 6.5h10.5v10H3z" />
    <path d="M13.5 9.5h4l3 3.2v3.8h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17" cy="17.5" r="1.8" />
  </svg>
)

export const IconEdit = ({ size = 18 }) => (
  <svg {...svgProps(size)}>
    <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17z" />
    <line x1="13.5" y1="8.5" x2="16.5" y2="11.5" />
  </svg>
)

export const IconCopy = ({ size = 18 }) => (
  <svg {...svgProps(size)}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2" />
    <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
  </svg>
)

export const IconDownload = ({ size = 16 }) => (
  <svg {...svgProps(size)}>
    <line x1="12" y1="4" x2="12" y2="15" />
    <polyline points="7.5 10.5 12 15 16.5 10.5" />
    <path d="M5 19.5h14" />
  </svg>
)

export const IconUpload = ({ size = 22 }) => (
  <svg {...svgProps(size)}>
    <line x1="12" y1="15" x2="12" y2="4" />
    <polyline points="7.5 8.5 12 4 16.5 8.5" />
    <path d="M5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V15" />
  </svg>
)

export const IconClose = ({ size = 20 }) => (
  <svg {...svgProps(size)}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
)

export const IconMenu = ({ size = 22 }) => (
  <svg {...svgProps(size)}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
)

export const IconPin = ({ size = 18 }) => (
  <svg {...svgProps(size)}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
)

const CHEVRON_ROTATE = { left: 'rotate(180deg)', down: 'rotate(90deg)', right: 'none' }
export const IconChevron = ({ size = 16, dir = 'right' }) => (
  <svg {...svgProps(size)} style={{ transform: CHEVRON_ROTATE[dir] }}>
    <polyline points="9 6 15 12 9 18" />
  </svg>
)
