import { motion, useScroll, useTransform } from 'framer-motion'
import './Cinematic.css'

/** Film grain, lens vignette and letterbox bars that retract as the story begins. */
export default function FilmOverlay() {
    const { scrollY } = useScroll()
    const bar = useTransform(scrollY, [0, 600], ['6vh', '0vh'])

    return (
        <div className="film-overlay" aria-hidden="true">
            <div className="film-grain" />
            <div className="film-vignette" />
            <motion.div className="letterbox letterbox-top" style={{ height: bar }} />
            <motion.div className="letterbox letterbox-bottom" style={{ height: bar }} />
        </div>
    )
}
