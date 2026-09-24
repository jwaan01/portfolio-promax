import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { PROFILE, TAGLINES } from '../data/content'
import './Hero.css'

const HeroCube = lazy(() => import('./HeroCube'))

const EASE = [0.22, 1, 0.36, 1]

function TypewriterLoop({ lines, start }) {
    const [lineIdx, setLineIdx] = useState(0)
    const [displayed, setDisplayed] = useState('')
    const [phase, setPhase] = useState('typing') // typing | pause | erasing

    useEffect(() => {
        if (!start) return
        const current = lines[lineIdx]
        let t

        if (phase === 'typing') {
            t = displayed.length < current.length
                ? setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 50)
                : setTimeout(() => setPhase('pause'), 2400)
        } else if (phase === 'pause') {
            t = setTimeout(() => setPhase('erasing'), 500)
        } else if (displayed.length > 0) {
            t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 24)
        } else {
            t = setTimeout(() => {
                setLineIdx((i) => (i + 1) % lines.length)
                setPhase('typing')
            }, 200)
        }
        return () => clearTimeout(t)
    }, [displayed, phase, lineIdx, lines, start])

    return (
        <span>
            {displayed}
            <span className="cursor-blink">_</span>
        </span>
    )
}

function RisingLine({ children, delay, ready }) {
    return (
        <span className="line-mask">
            <motion.span
                initial={{ y: '110%' }}
                animate={ready ? { y: '0%' } : {}}
                transition={{ duration: 1.3, ease: EASE, delay }}
            >
                {children}
            </motion.span>
        </span>
    )
}

/**
 * Prologue: the book cover. Pinned for a while; scrolling pushes the camera
 * into the galaxy cube while the title dissolves, then fades to black.
 */
export default function Hero({ ready }) {
    const ref = useRef(null)
    const { ref: viewRef, inView } = useInView({ threshold: 0 })
    const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })

    const cubeScale = useTransform(p, [0, 1], [1, 3.4])
    const cubeOpacity = useTransform(p, [0.55, 0.95], [1, 0])
    const titleY = useTransform(p, [0, 0.6], ['0%', '-40%'])
    const titleScale = useTransform(p, [0, 0.6], [1, 0.82])
    const titleOpacity = useTransform(p, [0.15, 0.55], [1, 0])
    const titleSpread = useTransform(p, [0, 0.6], ['0.04em', '0.4em'])
    const uiOpacity = useTransform(p, [0, 0.2], [1, 0])
    const uiY = useTransform(p, [0, 0.2], [0, 40])
    const blackout = useTransform(p, [0.72, 1], [0, 1])

    return (
        <section className="hero" id="home" ref={ref}>
            <div className="hero-sticky" ref={viewRef}>
                <motion.div className="hero-cube" style={{ scale: cubeScale, opacity: cubeOpacity }}>
                    <motion.div
                        className="hero-cube-inner"
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={ready ? { opacity: 1, scale: 1 } : {}}
                        transition={{ duration: 2, ease: EASE, delay: 0.2 }}
                    >
                        <Suspense fallback={null}>
                            <HeroCube active={inView} />
                        </Suspense>
                        <div className="cube-glow-ring" />
                    </motion.div>
                </motion.div>

                {/* Cover meta, like the corners of a book jacket */}
                <motion.div className="hero-meta" style={{ opacity: uiOpacity }}>
                    <motion.span
                        className="mono-label hero-meta-tl"
                        initial={{ opacity: 0 }}
                        animate={ready ? { opacity: 1 } : {}}
                        transition={{ duration: 1, delay: 0.9 }}
                    >
                        Vol. I &nbsp;·&nbsp; Prologue
                    </motion.span>
                    <motion.span
                        className="mono-label hero-meta-tr"
                        initial={{ opacity: 0 }}
                        animate={ready ? { opacity: 1 } : {}}
                        transition={{ duration: 1, delay: 1 }}
                    >
                        <span className="badge-dot" /> Available for alliance
                    </motion.span>
                </motion.div>

                <motion.div
                    className="hero-title-wrap"
                    style={{ y: titleY, scale: titleScale, opacity: titleOpacity }}
                >
                    <span className="hero-kicker">
                        <RisingLine ready={ready} delay={0.3}>
                            <span className="mono-label gold">The Chronicle of the Silicon Emperor</span>
                        </RisingLine>
                    </span>
                    <motion.h1 className="hero-name" style={{ letterSpacing: titleSpread }}>
                        <RisingLine ready={ready} delay={0.45}>Huynh Gia</RisingLine>
                        <RisingLine ready={ready} delay={0.58}>
                            <span className="hero-name-outline">Quan</span>
                        </RisingLine>
                    </motion.h1>
                    <span className="hero-handle">
                        <RisingLine ready={ready} delay={0.8}>
                            <span className="mono-label">{PROFILE.handle} — Sovereign of Logic</span>
                        </RisingLine>
                    </span>
                </motion.div>

                <motion.div className="hero-bottom" style={{ opacity: uiOpacity, y: uiY }}>
                    <motion.div
                        className="hero-bio"
                        initial={{ opacity: 0, y: 20 }}
                        animate={ready ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 1, ease: EASE, delay: 1.1 }}
                    >
                        <p className="hero-tagline">
                            <TypewriterLoop lines={TAGLINES} start={ready} />
                        </p>
                        <p className="hero-desc">
                            I architect immersive digital experiences at the intersection of <em>design</em>,{' '}
                            <em>engineering</em> and <em>creativity</em>.
                        </p>
                    </motion.div>

                    <motion.div
                        className="hero-cta"
                        initial={{ opacity: 0, y: 20 }}
                        animate={ready ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 1, ease: EASE, delay: 1.25 }}
                    >
                        <a href="#projects" className="btn-primary" data-cursor="Read">
                            <span>Read the Trials</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </a>
                        <a href="#contact" className="btn-ghost">Send a Raven</a>
                    </motion.div>
                </motion.div>

                <motion.div className="hero-scroll-hint" style={{ opacity: uiOpacity }}>
                    <motion.div
                        className="hero-scroll-inner"
                        initial={{ opacity: 0 }}
                        animate={ready ? { opacity: 1 } : {}}
                        transition={{ duration: 1, delay: 1.6 }}
                    >
                        <span className="mono-label">Turn the page</span>
                        <div className="scroll-line" />
                    </motion.div>
                </motion.div>

                <motion.div className="hero-blackout" style={{ opacity: blackout }} />
            </div>
        </section>
    )
}
