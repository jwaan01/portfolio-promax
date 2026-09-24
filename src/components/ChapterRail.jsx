import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { CHAPTERS } from '../data/chapters'
import { useActiveChapter } from '../hooks/useActiveChapter'
import './Cinematic.css'

/** Reading progress, a side table of contents and a book-style page counter. */
export default function ChapterRail() {
    const active = useActiveChapter()
    const { scrollYProgress } = useScroll()
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
    const chapter = CHAPTERS[active]
    // Step aside for the footer on the last page.
    const [atEnd, setAtEnd] = useState(false)
    useMotionValueEvent(scrollYProgress, 'change', (v) => setAtEnd(v > 0.98))

    return (
        <>
            <motion.div className="read-progress" style={{ scaleX: progress }} aria-hidden="true" />

            <nav className="chapter-rail" aria-label="Chapters">
                {CHAPTERS.map((c, i) => (
                    <a
                        key={c.id}
                        href={`#${c.id}`}
                        className={`rail-item ${i === active ? 'is-active' : ''}`}
                        aria-current={i === active ? 'true' : undefined}
                    >
                        <span className="rail-title">{c.title}</span>
                        <span className="rail-num">{c.numeral}</span>
                    </a>
                ))}
            </nav>

            <div className={`page-counter ${atEnd ? 'is-hidden' : ''}`} aria-hidden="true">
                <span className="page-num">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={active}
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: '0%', opacity: 1 }}
                            exit={{ y: '-100%', opacity: 0 }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        >
                            {String(active + 1).padStart(2, '0')}
                        </motion.span>
                    </AnimatePresence>
                </span>
                <span className="page-total">/ {String(CHAPTERS.length).padStart(2, '0')}</span>
                <span className="page-label">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={chapter.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ duration: 0.35 }}
                        >
                            {chapter.label} — {chapter.title}
                        </motion.span>
                    </AnimatePresence>
                </span>
            </div>
        </>
    )
}
