import SectionHeader from './SectionHeader.jsx'

const PHOTOS = [
  '/SK709606.jpg',
  '/SK709617.jpg',
  '/SK709628.jpg',
  '/SK709644.jpg',
  '/SK709647.jpg',
  '/SK709665.jpg',
  '/SK709703.jpg',
  '/SK709746.jpg',
  '/SK709764.jpg',
]

export default function Gallery() {
  return (
    <section id="gallery" className="relative px-5 py-14 sm:px-8 sm:py-20 lg:px-16 lg:py-[110px]">
      <SectionHeader eyebrow="gallery" title="from our first home cafe" />
      <div className="max-w-[1100px] mx-auto grid grid-cols-3 gap-3 sm:gap-4">
        {PHOTOS.map(src => (
          <div key={src} className="aspect-square overflow-hidden rounded-2xl bg-linen">
            <img src={src} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>
    </section>
  )
}
