import SectionHeader from './SectionHeader.jsx'
import { MENU, DRINKS } from '../data.js'

export default function Menu() {
  return (
    <section id="menu" className="bg-linen px-5 py-16 sm:px-8 sm:py-18 lg:px-16 lg:py-[100px]">
      <SectionHeader eyebrow="on the menu" title="what we bake" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-[920px] mx-auto">
        {MENU.map(item => (
          <article
            key={item.id}
            className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3.5 sm:gap-[18px] bg-white rounded-[1.2rem] p-4 sm:p-5 shadow-[0_2px_14px_rgba(107,76,59,0.05)]"
          >
            <img
              src={item.photo} alt={item.name}
              className="w-full h-[200px] sm:w-[140px] sm:h-[140px] object-cover rounded-[1.2rem]"
            />
            <div className="flex flex-col justify-center">
              {item.tag && (
                <div className="text-[10px] tracking-[0.3em] uppercase text-sage-dark font-medium mb-1.5">
                  {item.tag}
                </div>
              )}
              <div className="flex justify-between items-baseline gap-3 mb-2">
                <h3 className="font-display font-normal text-[22px] m-0 text-espresso leading-[1.15]">
                  {item.name}
                </h3>
                <span className="font-display font-normal text-[18px] text-deep-rose whitespace-nowrap">
                  {item.price}
                </span>
              </div>
              <p className="m-0 text-[13px] leading-[1.55] text-cocoa/80">
                {item.blurb}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Drinks */}
      <div className="max-w-[920px] mx-auto mt-16 sm:mt-12">
        <div className="text-center text-[10px] tracking-[0.3em] uppercase text-sage-dark font-medium mb-7">
          · and to drink ·
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 sm:gap-12 bg-white rounded-[1.2rem] px-6 py-6 sm:px-11 sm:py-9 shadow-[0_2px_14px_rgba(107,76,59,0.05)]">
          {DRINKS.map(g => (
            <div key={g.group}>
              <h4 className="font-display font-normal text-[26px] text-espresso m-0 mb-3.5 tracking-[0.01em]">
                {g.group}
              </h4>
              <ul className="m-0 p-0 list-none text-[14px] leading-[1.85] text-cocoa">
                {g.items.map(d => (
                  <li key={d} className="relative pl-[18px]">
                    <span className="absolute left-0 text-sage">·</span>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
