import { SectionHeader } from './ui.jsx'

export default function About() {
  return (
    <section id="about" className="oc-section">
      <SectionHeader eyebrow="my story" title="hello, i'm christy" />
      <div className="oc-about-grid">
        <img src="/about-christy.png" alt="Christy" className="oc-about-photo" />
        <div className="oc-about-copy">
          <p>
            I am a university student in Singapore. Since young, I have always loved baking.
            I would be found in the kitchen baking desserts like banana muffins and chocolate
            cupcakes. Over time, my skills improved and I was baking more complex desserts,
            such as crepe cakes, macarons, layered cakes and eclairs.
          </p>
          <p>
            Little Crumb Corner started because I wanted to turn my love for baking into
            something more. Follow me on this journey and let's see where this takes us :)
          </p>
        </div>
      </div>
    </section>
  )
}
