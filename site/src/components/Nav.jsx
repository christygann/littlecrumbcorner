import { useState } from 'react'
import { LOCKUP_SRC } from '../data.js'

const LINKS = ['about', 'gallery', 'home cafe']

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-cocoa/[0.06]">
    <div className="max-w-[1280px] mx-auto px-5 py-[18px] sm:px-8 sm:py-5 lg:px-16 lg:py-7 flex items-center justify-between">
      <img src={LOCKUP_SRC} alt="little crumb corner" className="h-[30px] sm:h-[36px] w-auto" />

      {/* Mobile toggle */}
      <button
        className="sm:hidden bg-transparent border-0 p-2 cursor-pointer text-cocoa relative z-[5]"
        aria-label="toggle menu"
        onClick={() => setOpen(o => !o)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          {open
            ? <><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></>
            : <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>
          }
        </svg>
      </button>

      {/* Desktop nav */}
      <ul className="hidden sm:flex gap-9 list-none m-0 px-3 py-2 font-normal">
        {LINKS.map(l => (
          <li key={l}>
            <a href={`#${l.replace(' ', '-')}`}
               className="text-cocoa text-[13px] hover:text-deep-rose transition-colors duration-200">
              {l}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile dropdown */}
      {open && (
        <ul className="absolute top-[60px] right-5 z-10 sm:hidden list-none m-0 flex flex-col gap-3.5 bg-cream px-6 py-[18px] border border-cocoa/12 rounded-[1.2rem] shadow-lg">
          {LINKS.map(l => (
            <li key={l}>
              <a href={`#${l.replace(' ', '-')}`} onClick={() => setOpen(false)}
                 className="text-cocoa text-[13px] hover:text-deep-rose transition-colors duration-200">
                {l}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
    </nav>
  )
}
