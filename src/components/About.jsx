import { useEffect, useRef, useState } from 'react'
import { animate, motion, useInView, useScroll, useTransform } from 'framer-motion'
import ChapterCard from './ChapterCard'
import { CHAPTERS } from '../data/chapters'
import { ORIGIN_TEXT, PILLARS, STATS } from '../data/content'
import './About.css'

const EASE = [0.22, 1, 0.36, 1]

function ScrubWord({ word, progress, range, highlight }) {
    const opacity = useTransform(progress, range, [0.12, 1])
    const y = useTransform(progress, range, [8, 0])
    return (
        <motion.span className={`scrub-word ${highlight ? 'is-highlight' : ''}`} style={{ opacity, y }}>
            {word}
        </motion.span>
    )
}

function Counter({ value, suffix }) {
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-15% 0px' })
    const [n, setN] = useState(0)

    useEffect(() => {
        if (!inView) return
        const controls = animate(0, value, { duration: 2.2, ease: EASE, onUpdate: (v) => setN(Math.round(v)) })
        return () => controls.stop()
    }, [inView, value])

    return (
        <span ref={ref} className="stat-num">
            {n}
            <span className="stat-suffix">{suffix}</span>
        </span>
    )
}

/** Chapter I: the origin story, read word by word as you scroll. */
export default function About() {
    const scrubRef = useRef(null)
    const { scrollYProgress: p } = useScroll({ target: scrubRef, offset: ['start start', 'end end'] })
    const labelOpacity = useTransform(p, [0, 0.08], [0, 1])
    const barScale = useTransform(p, [0, 0.9], [0, 1])

    const words = ORIGIN_TEXT.split(' ').map((raw) => ({
        text: raw.replace(/\*/g, ''),
        highlight: raw.startsWith('*'),
    }))

    return (
        <section className="chapter about" id="about">
            <ChapterCard
                chapter={CHAPTERS[1]}
                index={1}
                quote="In the vast void of the Binary Chaos, one soul dared to carve logic into the fabric of reality."
            />

            <div className="about-scrub" ref={scrubRef}>
                <div className="about-sticky">
                    <div className="container about-scrub-inner">
                        <motion.div className="about-scrub-head" style={{ opacity: labelOpacity }}>
                            <span className="mono-label gold">I.1 — The Origin</span>
                            <div className="about-scrub-bar">
                                <motion.div className="about-scrub-bar-fill" style={{ scaleX: barScale }} />
                            </div>
                        </motion.div>
                        <p className="scrub-text">
                            {words.map((w, i) => {
                                const start = (i / words.length) * 0.85
                                return (
                                    <ScrubWord
                                        key={i}
                                        word={w.text}
                                        highlight={w.highlight}
                                        progress={p}
                                        range={[start, start + 0.12]}
                                    />
                                )
                            })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="container about-after">
                <div className="stats-row">
                    {STATS.map((s, i) => (
                        <motion.div
                            key={s.label}
                            className="stat"
                            initial={{ opacity: 0, y: 60 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-10% 0px' }}
                            transition={{ duration: 1.1, ease: EASE, delay: i * 0.12 }}
                        >
                            <Counter value={s.value} suffix={s.suffix} />
                            <span className="stat-label mono-label">{s.label}</span>
                        </motion.div>
                    ))}
                </div>

                <div className="pillars">
                    <motion.span
                        className="mono-label gold pillars-label"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                    >
                        I.2 — The Three Great Pillars of the Cosmos
                    </motion.span>
                    {PILLARS.map((pillar, i) => (
                        <motion.div
                            key={pillar.name}
                            className="pillar"
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: '-12% 0px' }}
                        >
                            <motion.div
                                className="pillar-rule"
                                variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1 } }}
                                transition={{ duration: 1.4, ease: EASE, delay: i * 0.1 }}
                            />
                            <span className="pillar-index mono-label">0{i + 1}</span>
                            <span className="line-mask pillar-name">
                                <motion.span
                                    variants={{ hidden: { y: '110%' }, show: { y: '0%' } }}
                                    transition={{ duration: 1.1, ease: EASE, delay: 0.15 + i * 0.1 }}
                                >
                                    {pillar.name}
                                </motion.span>
                            </span>
                            <motion.span
                                className="pillar-field"
                                variants={{ hidden: { opacity: 0, x: 30 }, show: { opacity: 1, x: 0 } }}
                                transition={{ duration: 1.1, ease: EASE, delay: 0.3 + i * 0.1 }}
                            >
                                {pillar.field}
                            </motion.span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
