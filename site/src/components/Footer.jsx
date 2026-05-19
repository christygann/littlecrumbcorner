import { LOGO_SRC, SOCIALS } from '../data.js'
import { IconIG, IconTG } from '../icons.jsx'

export default function Footer() {
  return (
    <footer className="bg-blush text-deep-rose px-5 pt-10 pb-7 sm:px-8 sm:pt-12 sm:pb-8 lg:px-16 lg:pt-16 lg:pb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-10 max-w-[920px] mx-auto items-end">
        <div>
          <img src={LOGO_SRC} alt="" className="w-16 mb-4" />
          <div className="font-display italic text-[20px] mb-1">
            — sweet things by the window —
          </div>
          <div className="text-[13px] opacity-80">
            singapore · small batch · open by invitation
          </div>
        </div>
        <div className="sm:text-right">
          <div className="text-[10px] tracking-[0.3em] uppercase font-medium mb-3">
            find us
          </div>
          <div className="flex sm:justify-end gap-4 flex-wrap">
            <a
              href={SOCIALS.instagram.url} target="_blank" rel="noopener noreferrer"
              className="text-deep-rose inline-flex items-center gap-1.5 text-[14px] hover:opacity-75 transition-opacity"
            >
              <IconIG /> {SOCIALS.instagram.handle}
            </a>
            <a
              href={SOCIALS.telegram.url} target="_blank" rel="noopener noreferrer"
              className="text-deep-rose inline-flex items-center gap-1.5 text-[14px] hover:opacity-75 transition-opacity"
            >
              <IconTG /> {SOCIALS.telegram.handle}
            </a>
          </div>
        </div>
      </div>
      <div className="text-center mt-12 text-[11px] opacity-70 tracking-[0.2em] uppercase">
        © little crumb corner 2026
      </div>
    </footer>
  )
}
