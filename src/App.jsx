import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, MotionConfig } from 'framer-motion'
import './App.css'
import NodeBackground from './components/NodeBackground'
import Preloader from './components/Preloader'
import FilmOverlay from './components/FilmOverlay'
import Cursor from './components/Cursor'
import ChapterRail from './components/ChapterRail'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Techniques from './components/Techniques'
import Projects from './components/Projects'
import Ledger from './components/Ledger'
import Contact from './components/Contact'
import { useSmoothScroll } from './hooks/useSmoothScroll'

export default function App() {
    const [ready, setReady] = useState(false)
    const handleLoaded = useCallback(() => setReady(true), [])

    useSmoothScroll(ready)

    // The story always opens on the cover.
    useEffect(() => {
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
        window.scrollTo(0, 0)
    }, [])

    useEffect(() => {
        document.body.classList.toggle('is-loading', !ready)
    }, [ready])

    return (
        <MotionConfig reducedMotion="user">
            <AnimatePresence>{!ready && <Preloader key="preloader" onComplete={handleLoaded} />}</AnimatePresence>

            <div className="ambient-blob blob1" />
            <div className="ambient-blob blob2" />
            <NodeBackground />

            <FilmOverlay />
            <Cursor />
            <Navbar ready={ready} />
            <ChapterRail />

            <main className="story">
                <Hero ready={ready} />
                <About />
                <Techniques />
                <Projects />
                <Ledger />
                <Contact />
            </main>
        </MotionConfig>
    )
}
