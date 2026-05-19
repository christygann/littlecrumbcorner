import { useState } from 'react'
import { LOGO_SRC } from '../data.js'

const LINKS = ['about', 'menu', 'home cafe']

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="relative max-w-[1280px] mx-auto px-5 py-[18px] sm:px-8 sm:py-5 lg:px-16 lg:py-7 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={LOGO_SRC} alt="" className="w-[38px] h-auto" />
        <span className="font-display font-normal text-[18px] text-espresso tracking-[0.04em]">
          little crumb corner
        </span>
      </div>

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
        <ul className="absolute top-[60px] right-5 z-10 sm:hidden list-none m-0 flex flex-col gap-3.5 bg-cream px-6 py-[18px] border border-cocoa/12 rounded-[1.2rem] shadow-[0_8px_32px_rgba(107,76,59,0.10)]">
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
    </nav>
  )
}
