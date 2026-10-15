import { LOCKUP_SRC } from '../data.js'

export default function Hero() {
  return (
    // Fills the screen below the sticky nav (67 / 77 / 93px tall) so only the logo shows until you scroll
    <section className="relative flex items-center justify-center text-center px-5 sm:px-8 lg:px-16 min-h-[calc(100svh-67px)] sm:min-h-[calc(100svh-77px)] lg:min-h-[calc(100svh-93px)]">
      {/* Decorative blobs */}
      <div className="absolute top-[-60px] right-[-80px] w-[360px] h-[260px] bg-blush opacity-40 rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[300px] bg-sage-light opacity-40 rounded-full pointer-events-none" />

      <div className="relative z-[1]">
        <h1 className="m-0">
          <img
            src={LOCKUP_SRC} alt="little crumb corner"
            className="w-full max-w-[320px] sm:max-w-[480px] lg:max-w-[640px] h-auto mx-auto"
          />
        </h1>
      </div>
    </section>
  )
}
