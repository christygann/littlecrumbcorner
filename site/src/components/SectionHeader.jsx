export default function SectionHeader({ eyebrow, title }) {
  return (
    <header className="text-center mb-12">
      <div className="text-[11px] tracking-[0.3em] uppercase text-sage-dark font-medium mb-2.5">
        {eyebrow}
      </div>
      <h2 className="font-display font-light text-[28px] sm:text-[36px] lg:text-[44px] text-espresso m-0 mb-1.5 tracking-[0.01em] leading-[1.1]">
        {title}
      </h2>
      <div className="w-[60px] h-px bg-sage/50 mx-auto mt-5" />
    </header>
  )
}
