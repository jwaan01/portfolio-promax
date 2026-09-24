import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { CHAPTERS } from '../data/chapters'
import { useActiveChapter } from '../hooks/useActiveChapter'
import { scrollToTarget, setScrollLocked } from '../hooks/useSmoothScroll'
import './Navbar.css'

const EASE = [0.76, 0, 0.24, 1]

/** Minimal top bar that hides while reading and opens a full-screen table of contents. */
export default function Navbar({ ready }) {
    const [open, setOpen] = useState(false)
    const [hidden, setHidden] = useState(false)
    const active = useActiveChapter()
    const { scrollY } = useScroll()

    useMotionValueEvent(scrollY, 'change', (y) => {
        const prev = scrollY.getPrevious() ?? 0
        setHidden(y > prev && y > 200)
    })

    useEffect(() => {
        setScrollLocked(open)
        if (!open) return
        const onKey = (e) => e.key === 'Escape' && setOpen(false)
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [open])

    const goTo = (e, id) => {
        e.preventDefault()
        setOpen(false)
        setScrollLocked(false)
        scrollToTarget(`#${id}`, { duration: 2 })
    }

    return (
        <>
            <motion.header
                className="navbar"
                initial={{ y: '-120%' }}
                animate={{ y: ready && (!hidden || open) ? '0%' : '-120%' }}
                transition={{ duration: 0.8, ease: EASE }}
            >
                <a href="#home" className="nav-logo" onClick={(e) => goTo(e, 'home')}>
                    <span className="logo-bracket">&lt;</span>ZEROTH<span className="logo-bracket">/&gt;</span>
                </a>

                <span className="nav-current mono-label">
                    {CHAPTERS[active].label} · {CHAPTERS[active].title}
                </span>

                <div className="nav-actions">
                    <a href="#contact" className="nav-cta" onClick={(e) => goTo(e, 'contact')}>
                        Contact
                    </a>
                    <button
                        type="button"
                        className={`nav-toggle ${open ? 'is-open' : ''}`}
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        aria-controls="toc"
                    >
                        <span className="nav-toggle-text">{open ? 'Close' : 'Contents'}</span>
                        <span className="nav-toggle-icon" aria-hidden="true">
                            <span />
                            <span />
                        </span>
                    </button>
                </div>
            </motion.header>

            <AnimatePresence>
                {open && (
                    <motion.nav
                        id="toc"
                        className="toc"
                        aria-label="Table of contents"
                        initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
                        animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                        exit={{ clipPath: 'inset(100% 0% 0% 0%)' }}
                        transition={{ duration: 0.9, ease: EASE }}
                        data-lenis-prevent
                    >
                        <span className="toc-label mono-label gold">Table of Contents</span>
                        <ol className="toc-list">
                            {CHAPTERS.map((c, i) => (
                                <li key={c.id}>
                                    <a
                                        href={`#${c.id}`}
                                        className={`toc-link ${i === active ? 'is-active' : ''}`}
                                        onClick={(e) => goTo(e, c.id)}
                                    >
                                        <span className="toc-num">{c.numeral}</span>
                                        <span className="line-mask toc-title">
                                            <motion.span
                                                initial={{ y: '110%' }}
                                                animate={{ y: '0%' }}
                                                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.06 }}
                                            >
                                                {c.title}
                                            </motion.span>
                                        </span>
                                        <span className="toc-page mono-label">p. {String(i + 1).padStart(2, '0')}</span>
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </motion.nav>
                )}
            </AnimatePresence>
        </>
    )
}
