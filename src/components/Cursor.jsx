import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import './Cinematic.css'

const canUseCursor = () =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches

/**
 * A soft follower ring (desktop only). Grows over interactive elements and
 * shows the element's `data-cursor` text as a label when present.
 */
export default function Cursor() {
    const [enabled] = useState(canUseCursor)
    const [hover, setHover] = useState({ active: false, label: '' })
    const [visible, setVisible] = useState(false)

    const x = useMotionValue(-100)
    const y = useMotionValue(-100)
    const dotX = useSpring(x, { stiffness: 900, damping: 50, mass: 0.2 })
    const dotY = useSpring(y, { stiffness: 900, damping: 50, mass: 0.2 })
    const ringX = useSpring(x, { stiffness: 180, damping: 22, mass: 0.6 })
    const ringY = useSpring(y, { stiffness: 180, damping: 22, mass: 0.6 })

    useEffect(() => {
        if (!enabled) return
        const onMove = (e) => {
            x.set(e.clientX)
            y.set(e.clientY)
            setVisible(true)
        }
        const onOver = (e) => {
            const el = e.target.closest('a, button, [data-cursor], input, textarea')
            const isField = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')
            setHover({
                active: Boolean(el) && !isField,
                label: el && !isField ? el.dataset.cursor || '' : '',
            })
        }
        const onLeave = () => setVisible(false)

        window.addEventListener('mousemove', onMove, { passive: true })
        document.addEventListener('mouseover', onOver, { passive: true })
        document.documentElement.addEventListener('mouseleave', onLeave)
        return () => {
            window.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseover', onOver)
            document.documentElement.removeEventListener('mouseleave', onLeave)
        }
    }, [enabled, x, y])

    if (!enabled) return null

    const size = hover.label ? 84 : hover.active ? 56 : 34

    return (
        <div className={`cursor-layer ${visible ? 'is-visible' : ''}`} aria-hidden="true">
            <motion.div className="cursor-dot" style={{ x: dotX, y: dotY }} />
            <motion.div className="cursor-ring" style={{ x: ringX, y: ringY }}>
                <motion.div
                    className={`cursor-ring-shape ${hover.active ? 'is-hover' : ''} ${hover.label ? 'has-label' : ''}`}
                    animate={{ width: size, height: size }}
                    transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                >
                    {hover.label && <span className="cursor-label">{hover.label}</span>}
                </motion.div>
            </motion.div>
        </div>
    )
}
