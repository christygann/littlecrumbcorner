import { LOGO_SRC } from '../data.js'

export default function Hero() {
  return (
    <section className="relative text-center px-5 pt-10 pb-16 sm:px-8 sm:pt-14 sm:pb-20 lg:px-16 lg:pt-20 lg:pb-[110px]">
      {/* Decorative blobs */}
      <div className="absolute top-[-60px] right-[-80px] w-[360px] h-[260px] bg-blush opacity-40 rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[300px] bg-sage-light opacity-40 rounded-full pointer-events-none" />

      <div className="relative z-[1]">
        <img
          src={LOGO_SRC} alt="little crumb corner"
          className="w-[110px] sm:w-[140px] lg:w-[180px] h-auto mx-auto mb-7"
        />
        <h1 className="font-display font-light text-[40px] sm:text-[56px] lg:text-[78px] text-espresso m-0 mb-3.5 leading-[1.05] tracking-[0.005em]">
          little crumb corner
        </h1>
        <div className="font-display italic font-light text-[22px] text-cocoa mb-9">
          sweet things by the window
        </div>
        <a
          href="#home-cafe"
          className="inline-block py-3.5 px-9 rounded-full bg-cocoa text-cream text-[11px] tracking-[0.3em] uppercase font-medium hover:opacity-90 transition-opacity duration-200"
        >
          save a spot · 27 may
        </a>
      </div>
    </section>
  )
}
