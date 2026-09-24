import { useEffect, useState } from 'react'
import { motion, animate } from 'framer-motion'
import './Preloader.css'

const EASE = [0.76, 0, 0.24, 1]
const NAME = 'HUYNH GIA QUAN'

/**
 * Opening title sequence: a counter runs to 100 while the name rises in,
 * then the two halves of the curtain part (exit animation) to reveal the page.
 */
export default function Preloader({ onComplete }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const controls = animate(0, 100, {
            duration: reduce ? 0.3 : 2.4,
            ease: [0.65, 0, 0.35, 1],
            onUpdate: (v) => setCount(Math.round(v)),
            onComplete: () => setTimeout(onComplete, reduce ? 0 : 250),
        })
        return () => controls.stop()
    }, [onComplete])

    return (
        <motion.div className="preloader" aria-hidden="true">
            <motion.div
                className="curtain curtain-top"
                exit={{ y: '-100%' }}
                transition={{ duration: 1.1, ease: EASE }}
            />
            <motion.div
                className="curtain curtain-bottom"
                exit={{ y: '100%' }}
                transition={{ duration: 1.1, ease: EASE }}
            />

            <motion.div
                className="preloader-inner"
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease: EASE }}
            >
                <motion.span
                    className="mono-label"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                >
                    The Chronicle of
                </motion.span>

                <h2 className="preloader-name">
                    {NAME.split(' ').map((word, w) => (
                        <span className="pl-word" key={w}>
                            {word.split('').map((ch, c) => (
                                <span className="pl-mask" key={c}>
                                    <motion.span
                                        initial={{ y: '110%' }}
                                        animate={{ y: '0%' }}
                                        transition={{ duration: 1, ease: EASE, delay: 0.25 + (w * 5 + c) * 0.045 }}
                                    >
                                        {ch}
                                    </motion.span>
                                </span>
                            ))}
                        </span>
                    ))}
                </h2>

                <div className="preloader-bar">
                    <div className="preloader-bar-fill" style={{ transform: `scaleX(${count / 100})` }} />
                </div>

                <div className="preloader-meta">
                    <span className="mono-label">Vol. I — The Silicon Emperor</span>
                    <span className="mono-label">Loading realm</span>
                </div>
            </motion.div>

            <motion.span
                className="preloader-count"
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.4, ease: EASE }}
            >
                {String(count).padStart(3, '0')}
            </motion.span>
        </motion.div>
    )
}
