import { LOCKUP_SRC } from '../data.js'

export default function Hero() {
  return (
    <section className="relative text-center px-5 pt-10 pb-16 sm:px-8 sm:pt-14 sm:pb-20 lg:px-16 lg:pt-20 lg:pb-[110px]">
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
