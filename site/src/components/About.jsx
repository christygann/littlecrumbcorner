import SectionHeader from './SectionHeader.jsx'

export default function About() {
  return (
    <section id="about" className="px-5 py-14 sm:px-8 sm:py-16 lg:px-16 lg:py-20">
      <SectionHeader eyebrow="my story" title="hello, i'm christy" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-9 md:gap-16 max-w-[1000px] mx-auto items-center">
        <img
          src="/about-christy.png" alt="Christy"
          className="w-full max-w-[360px] aspect-[3/4] md:w-[360px] md:h-[480px] object-cover rounded-[1.2rem] mx-auto md:justify-self-end"
        />
        <div className="text-[15px] leading-[1.75] text-cocoa">
          <p className="mb-[18px]">
            I am a university student in Singapore. Since young, I have always loved baking.
            I would be found in the kitchen baking desserts like banana muffins and chocolate
            cupcakes. Over time, my skills improved and I was baking more complex desserts,
            such as crepe cakes, macarons, layered cakes and eclairs.
          </p>
          <p className="m-0">
            Little Crumb Corner started because I wanted to turn my love for baking into
            something more. Follow me on this journey and let's see where this takes us :)
          </p>
        </div>
      </div>
    </section>
  )
}
