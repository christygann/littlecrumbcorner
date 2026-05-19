import SectionHeader from './SectionHeader.jsx'
import SignUpForm from './SignUpForm.jsx'
import { IconClock, IconCal } from '../icons.jsx'
import { CAFE } from '../data.js'

export default function HomeCafe() {
  return (
    <section id="home-cafe" className="relative px-5 py-14 sm:px-8 sm:py-20 lg:px-16 lg:py-[110px]">
      <SectionHeader eyebrow="home cafe" title="come to our first home cafe" />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-7 md:gap-14 max-w-[920px] mx-auto items-start">

        {/* Invitation panel */}
        <aside className="bg-cream border border-cocoa/12 rounded-[1.5rem] p-7 md:p-9">
          <div className="text-[10px] tracking-[0.3em] uppercase text-sage-dark font-medium mb-3.5">
            you're invited
          </div>
          <h3 className="font-display font-light text-[38px] text-espresso m-0 mb-1 leading-[1.05]">
            Wednesday
          </h3>
          <h3 className="font-display font-light text-[72px] text-espresso m-0 mb-1 leading-[1]">
            27.05
          </h3>
          <div className="font-display italic text-[18px] text-cocoa mb-6">2026</div>

          <div className="flex flex-col gap-3 text-[14px]">
            <div className="flex items-center gap-2.5 text-cocoa">
              <span className="text-sage-dark"><IconClock /></span>
              <span>{CAFE.time}</span>
            </div>
            <div className="flex items-center gap-2.5 text-cocoa">
              <span className="text-sage-dark"><IconCal /></span>
              <span>walk-in welcome, slots fill up</span>
            </div>
          </div>

          <div className="h-px bg-cocoa/15 my-[26px]" />

          <p className="m-0 mb-4 leading-[1.65] text-[14px] text-cocoa">{CAFE.blurb}</p>
          <ul className="m-0 p-0 list-none text-[13px] leading-[1.9] text-cocoa/85">
            {CAFE.perks.map(p => (
              <li key={p} className="relative pl-[18px]">
                <span className="absolute left-0 text-sage">·</span>
                {p}
              </li>
            ))}
          </ul>
        </aside>

        {/* Sign-up card */}
        <div className="bg-white rounded-[1.5rem] px-9 pt-9 pb-8 shadow-[0_4px_24px_rgba(107,76,59,0.08)]">
          <h3 className="font-display font-normal text-[26px] text-espresso m-0 mb-1">
            save my spot
          </h3>
          <div className="text-[13px] text-cocoa/70 mb-[22px]">
            exact address will be released on Telegram
          </div>
          <SignUpForm />
        </div>
      </div>
    </section>
  )
}
