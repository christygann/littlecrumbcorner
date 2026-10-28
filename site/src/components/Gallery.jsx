import { SectionHeader } from './ui.jsx'
import { GALLERY_PHOTOS } from '../data.js'

export default function Gallery() {
  return (
    <section id="gallery" className="oc-section-xl">
      <SectionHeader eyebrow="gallery" title="from our first home cafe" />
      <div className="oc-gallery">
        {GALLERY_PHOTOS.map(src => (
          <div key={src} className="oc-gallery-tile">
            <img src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  )
}
