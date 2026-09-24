import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import './Cinematic.css'

function Letter({ char, progress, range }) {
    const y = useTransform(progress, range, ['115%', '0%'])
    const rotate = useTransform(progress, range, [12, 0])
    return (
        <span className="cc-letter-mask">
            <motion.span className="cc-letter" style={{ y, rotate }}>
                {char}
            </motion.span>
        </span>
    )
}

/**
 * Full-screen chapter title card. The card slides up like a new page and
 * expands to fill the frame; while pinned, the title is scrubbed in letter by
 * letter; then the camera pushes through it into the chapter's content.
 */
export default function ChapterCard({ chapter, quote, index }) {
    const ref = useRef(null)

    // Page slides in: card top travels from the bottom of the viewport to the top.
    const { scrollYProgress: enter } = useScroll({ target: ref, offset: ['start end', 'start start'] })
    // Main timeline: starts a little before pinning so an anchor jump lands mid-reveal.
    const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start 60%', 'end end'] })

    const clipPath = useTransform(enter, [0, 1], ['inset(14% 7% 0% 7% round 40px)', 'inset(0% 0% 0% 0% round 0px)'])

    const numeralScale = useTransform(p, [0, 0.3, 1], [0.7, 1, 1.25])
    const numeralY = useTransform(p, [0, 1], ['12%', '-18%'])
    const numeralOpacity = useTransform(p, [0, 0.25], [0, 1])
    const kickerOpacity = useTransform(p, [0.04, 0.2], [0, 1])
    const ruleScale = useTransform(p, [0.18, 0.36], [0, 1])
    const quoteOpacity = useTransform(p, [0.26, 0.42], [0, 1])
    const quoteY = useTransform(p, [0.26, 0.42], [24, 0])

    // Exit: dolly forward through the title.
    const stageScale = useTransform(p, [0.72, 1], [1, 1.35])
    const stageOpacity = useTransform(p, [0.72, 0.98], [1, 0])

    const totalLetters = chapter.title.replace(/ /g, '').length
    const words = chapter.title.split(' ').reduce((acc, word) => {
        const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].word.length : 0
        return [...acc, { word, offset }]
    }, [])

    return (
        <div className="chapter-card" ref={ref}>
            <motion.div className="cc-sticky" style={{ clipPath }}>
                <motion.div className="cc-chrome" style={{ opacity: stageOpacity }}>
                    <div className="cc-glow" />
                    <div className="cc-numeral-wrap">
                        <motion.span
                            className="cc-numeral"
                            style={{ scale: numeralScale, y: numeralY, opacity: numeralOpacity }}
                        >
                            {chapter.numeral}
                        </motion.span>
                    </div>
                    <div className="cc-frame" />
                    <span className="cc-corner cc-corner-tl mono-label">Vol. I</span>
                    <span className="cc-corner cc-corner-tr mono-label">The Chronicle of the Silicon Emperor</span>
                    <span className="cc-corner cc-corner-bl mono-label">— {chapter.numeral} —</span>
                    <span className="cc-corner cc-corner-br mono-label">Page {String(index + 1).padStart(2, '0')}</span>
                </motion.div>

                <motion.div className="cc-stage" style={{ scale: stageScale, opacity: stageOpacity }}>
                    <motion.span className="cc-kicker mono-label" style={{ opacity: kickerOpacity }}>
                        {chapter.label}
                    </motion.span>

                    <h2 className="cc-title" aria-label={chapter.title}>
                        {words.map(({ word, offset }, w) => (
                            <span className="cc-word" key={w} aria-hidden="true">
                                {word.split('').map((char, c) => {
                                    const i = offset + c
                                    const start = 0.02 + (i / totalLetters) * 0.22
                                    return <Letter key={i} char={char} progress={p} range={[start, start + 0.1]} />
                                })}
                            </span>
                        ))}
                    </h2>

                    <motion.div className="cc-rule" style={{ scaleX: ruleScale }} />

                    {quote && (
                        <motion.p className="cc-quote" style={{ opacity: quoteOpacity, y: quoteY }}>
                            “{quote}”
                        </motion.p>
                    )}
                </motion.div>
            </motion.div>
        </div>
    )
}
