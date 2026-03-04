import { Suspense, lazy, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './Hero.css'

const HeroCube = lazy(() => import('./HeroCube'))

const TAGLINES = [
    'Exploring the digital frontier...',
    'Engineering tomorrow\'s web, today.',
    'Where design meets algorithmic art.',
]

function TypewriterLoop({ lines }) {
    const [lineIdx, setLineIdx] = useState(0)
    const [displayed, setDisplayed] = useState('')
    const [phase, setPhase] = useState('typing') // typing | pause | erasing

    useEffect(() => {
        const current = lines[lineIdx]

        if (phase === 'typing') {
            if (displayed.length < current.length) {
                const t = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 55)
                return () => clearTimeout(t)
            } else {
                const t = setTimeout(() => setPhase('pause'), 2200)
                return () => clearTimeout(t)
            }
        }

        if (phase === 'pause') {
            const t = setTimeout(() => setPhase('erasing'), 600)
            return () => clearTimeout(t)
        }

        if (phase === 'erasing') {
            if (displayed.length > 0) {
                const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 28)
                return () => clearTimeout(t)
            } else {
                setLineIdx((i) => (i + 1) % lines.length)
                setPhase('typing')
            }
        }
    }, [displayed, phase, lineIdx, lines])

    return (
        <span>
            {displayed}
            <span className="cursor">|</span>
        </span>
    )
}

export default function Hero() {
    return (
        <section className="hero" id="home">
            <div className="hero-canvas-wrap">
                <Suspense fallback={null}>
                    <HeroCube />
                </Suspense>
                <div className="cube-glow-ring" />
            </div>

            <motion.div
                className="hero-content"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            >
                <motion.div
                    className="hero-badge"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <span className="badge-dot" />
                    Available for work
                </motion.div>

                <h1 className="hero-name">
                    <span className="name-main">Huynh Gia Quan</span>
                    <span className="name-nick">@zeroth</span>
                </h1>

                <p className="hero-tagline">
                    <TypewriterLoop lines={TAGLINES} />
                </p>

                <p className="hero-bio">
                    I architect immersive digital experiences at the intersection of{' '}
                    <em>design</em>, <em>engineering</em>, and <em>creativity</em> —{' '}
                    pushing the boundaries of what the web can feel like.
                </p>

                <div className="hero-cta">
                    <a href="#projects" className="btn-primary">
                        <span>View My Work</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </a>
                    <a href="#contact" className="btn-ghost">Get In Touch</a>
                </div>
            </motion.div>

            <div className="hero-scroll-hint">
                <span>Scroll</span>
                <div className="scroll-line" />
            </div>
        </section>
    )
}
