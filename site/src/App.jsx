import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
// import Menu from './components/Menu.jsx'
import Gallery from './components/Gallery.jsx'
import HomeCafe from './components/HomeCafe.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  return (
    <div className="relative overflow-x-hidden">
      <Nav />
      <Hero />
      <div className="text-center text-sage tracking-[0.6em] text-lg mb-6">· · ·</div>
      <About />
      {/* <Menu /> */}
      <Gallery />
      <HomeCafe />
      <Footer />
    </div>
  )
}
