import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useMotionValueEvent, useScroll, useTransform } from 'framer-motion'
import ChapterCard from './ChapterCard'
import { CHAPTERS } from '../data/chapters'
import { STACK, TECHNIQUES } from '../data/content'
import './Techniques.css'

const SkillsOrb = lazy(() => import('./SkillsOrb'))

const GLYPHS = {
    security: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <path d="M32 6 10 14v16c0 14 9.5 23.5 22 28 12.5-4.5 22-14 22-28V14L32 6Z" />
            <path d="M32 14 17 19.5v10.8C17 40 23.4 46.4 32 49.6c8.6-3.2 15-9.6 15-19.3V19.5L32 14Z" opacity=".5" />
            <path d="M24 32l6 6 11-12" />
        </svg>
    ),
    games: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <circle cx="32" cy="32" r="22" />
            <ellipse cx="32" cy="32" rx="22" ry="8" opacity=".6" />
            <ellipse cx="32" cy="32" rx="8" ry="22" opacity=".6" />
            <circle cx="32" cy="32" r="3" fill="currentColor" />
            <circle cx="50" cy="14" r="2" fill="currentColor" />
        </svg>
    ),
    silicon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <rect x="16" y="16" width="32" height="32" rx="3" />
            <rect x="24" y="24" width="16" height="16" opacity=".6" />
            <path d="M24 16V8M32 16V8M40 16V8M24 56v-8M32 56v-8M40 56v-8M16 24H8M16 32H8M16 40H8M56 24h-8M56 32h-8M56 40h-8" />
        </svg>
    ),
}

function TechniquePanel({ tech, index, progress }) {
    const numX = useTransform(progress, [0, 1], ['30%', '-30%'])
    return (
        <article className="tp-card" style={{ '--hue': tech.hue }}>
            <motion.span className="tp-num" style={{ x: numX }} aria-hidden="true">
                0{index + 1}
            </motion.span>
            <div className="tp-glow" />
            <div className="tp-head">
                <span className="tp-glyph">{GLYPHS[tech.id]}</span>
                <span className="mono-label tp-field">{tech.field}</span>
            </div>
            <div className="tp-body">
                <h3 className="tp-title">{tech.title}</h3>
                <p className="tp-text">{tech.text}</p>
                <ul className="tp-arts">
                    {tech.arts.map((art) => (
                        <li key={art}>{art}</li>
                    ))}
                </ul>
            </div>
        </article>
    )
}

function OrbPanel() {
    const ref = useRef(null)
    // Mount the WebGL scene once it first nears the viewport, then just pause it offscreen.
    const seen = useInView(ref, { once: true, margin: '0px 400px' })
    const inView = useInView(ref)
    return (
        <article className="tp-orb" ref={ref}>
            <div className="tp-orb-canvas">
                {seen && (
                    <Suspense fallback={null}>
                        <SkillsOrb active={inView} />
                    </Suspense>
                )}
                <div className="tp-orb-ring" />
            </div>
            <div className="tp-orb-copy">
                <span className="mono-label gold">II.4 — The Instruments</span>
                <h3 className="tp-orb-title">Weapons of the Sovereign</h3>
                <div className="tp-stack">
                    {STACK.map((s) => (
                        <span key={s} className="tp-chip">{s}</span>
                    ))}
                </div>
            </div>
        </article>
    )
}

/**
 * Chapter II: vertical scroll is converted into a horizontal camera pan
 * across the three techniques, like panels of a graphic novel spread.
 */
export default function Techniques() {
    const wrapRef = useRef(null)
    const trackRef = useRef(null)
    const [distance, setDistance] = useState(0)
    const [panel, setPanel] = useState(1)
    const dist = useMotionValue(0)

    useEffect(() => {
        const track = trackRef.current
        if (!track) return
        const measure = () => {
            const d = Math.max(0, track.scrollWidth - window.innerWidth)
            setDistance(d)
            dist.set(d)
        }
        measure()
        const ro = new ResizeObserver(measure)
        ro.observe(track)
        window.addEventListener('resize', measure)
        return () => {
            ro.disconnect()
            window.removeEventListener('resize', measure)
        }
    }, [dist])

    const { scrollYProgress: p } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
    const x = useTransform(() => -p.get() * dist.get())
    const panels = TECHNIQUES.length + 2

    useMotionValueEvent(p, 'change', (v) => {
        setPanel(Math.round(v * (panels - 1)) + 1)
    })

    return (
        <section className="chapter techniques" id="techniques">
            <ChapterCard
                chapter={CHAPTERS[2]}
                index={2}
                quote="To ascend the throne, a Sovereign must master the arts that govern the universe."
            />

            <div className="hscroll" ref={wrapRef} style={{ height: `calc(100vh + ${distance}px)` }}>
                <div className="hscroll-sticky">
                    <motion.div className="hscroll-track" ref={trackRef} style={{ x }}>
                        <div className="tp-intro">
                            <span className="mono-label gold">II.0 — The Divine Techniques</span>
                            <h3 className="tp-intro-title">
                                Three arts.
                                <br />
                                <em>One path.</em>
                            </h3>
                            <p className="tp-intro-text">
                                Guarding the realm, creating worlds and forging the silicon beneath them — the disciplines I cultivate every day.
                            </p>
                            <span className="tp-intro-hint mono-label">
                                Keep scrolling
                                <svg width="28" height="10" viewBox="0 0 28 10" fill="none" stroke="currentColor" aria-hidden="true"><path d="M0 5h26M22 1l4 4-4 4" /></svg>
                            </span>
                        </div>

                        {TECHNIQUES.map((tech, i) => (
                            <TechniquePanel key={tech.id} tech={tech} index={i} progress={p} />
                        ))}

                        <OrbPanel />
                    </motion.div>

                    <div className="hscroll-hud container">
                        <span className="mono-label hud-count">
                            {String(panel).padStart(2, '0')}
                        </span>
                        <div className="hud-bar">
                            <motion.div className="hud-bar-fill" style={{ scaleX: p }} />
                        </div>
                        <span className="mono-label">{String(panels).padStart(2, '0')}</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
