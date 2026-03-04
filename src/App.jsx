import './App.css'
import NodeBackground from './components/NodeBackground'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'

export default function App() {
  return (
    <>
      {/* Ambient glow blobs */}
      <div className="ambient-blob blob1" />
      <div className="ambient-blob blob2" />

      {/* Interactive Three.js node background */}
      <NodeBackground />

      <Navbar />
      <main style={{ position: 'relative', zIndex: 1 }}>
        <Hero />
        <About />
        <Projects />
        <Contact />
      </main>
    </>
  )
}
