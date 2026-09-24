import { useRef, useState } from 'react'
import {
    motion,
    useAnimationFrame,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
    useVelocity,
} from 'framer-motion'
import ChapterCard from './ChapterCard'
import { CHAPTERS } from '../data/chapters'
import { PROFILE } from '../data/content'
import { scrollToTarget } from '../hooks/useSmoothScroll'
import './Contact.css'

const EASE = [0.22, 1, 0.36, 1]

const wrap = (min, max, v) => {
    const range = max - min
    return ((((v - min) % range) + range) % range) + min
}

/** A marquee that drifts on its own and surges with scroll velocity. */
function VelocityMarquee({ children, baseVelocity = 2.5 }) {
    const baseX = useMotionValue(0)
    const { scrollY } = useScroll()
    const velocity = useVelocity(scrollY)
    const smoothVelocity = useSpring(velocity, { damping: 50, stiffness: 400 })
    const factor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false })
    const direction = useRef(1)
    const x = useTransform(baseX, (v) => `${wrap(-25, -50, v)}%`)

    useAnimationFrame((_, delta) => {
        let move = direction.current * baseVelocity * (delta / 1000)
        const f = factor.get()
        if (f < 0) direction.current = -1
        else if (f > 0) direction.current = 1
        move += direction.current * move * f
        baseX.set(baseX.get() + move)
    })

    return (
        <div className="marquee" aria-hidden="true">
            <motion.div className="marquee-track" style={{ x }}>
                {[0, 1, 2, 3].map((i) => (
                    <span key={i} className="marquee-item">{children}</span>
                ))}
            </motion.div>
        </div>
    )
}

const CHANNELS = [
    { label: 'Divine Raven', kind: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}` },
    { label: 'The Eternal Archive', kind: 'GitHub', value: 'Ryuga00000001', href: PROFILE.github },
    { label: 'The Great Web', kind: 'LinkedIn', value: 'Connect', href: PROFILE.linkedin },
]

/** Epilogue: the invitation to write the next chapter together. */
export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    // No backend: hand the message to the visitor's mail client.
    const handleSubmit = (e) => {
        e.preventDefault()
        const subject = encodeURIComponent(`Alliance request from ${form.name}`)
        const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`)
        window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`
        setSent(true)
        setForm({ name: '', email: '', message: '' })
        setTimeout(() => setSent(false), 5000)
    }

    return (
        <section className="chapter contact" id="contact">
            <ChapterCard
                chapter={CHAPTERS[5]}
                index={5}
                quote="Should you seek an alliance with the Sovereign, send your spirit message through the channels below."
            />

            <VelocityMarquee>
                Let&apos;s write the next chapter <span className="marquee-star">✦</span>
            </VelocityMarquee>

            <div className="container contact-grid">
                <motion.div
                    className="contact-form-wrap"
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 1.2, ease: EASE }}
                >
                    <span className="mono-label gold">V.1 — Send a spirit message</span>
                    {sent ? (
                        <div className="success-msg" role="status">
                            <span className="success-icon">✦</span>
                            <p>Your mail app should now be open with the message ready. The raven awaits.</p>
                        </div>
                    ) : (
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input id="name" type="text" name="name" value={form.name} onChange={handleChange} placeholder=" " required />
                                <label htmlFor="name">Your name</label>
                            </div>
                            <div className="form-group">
                                <input id="email" type="email" name="email" value={form.email} onChange={handleChange} placeholder=" " required />
                                <label htmlFor="email">Email address</label>
                            </div>
                            <div className="form-group">
                                <textarea id="message" name="message" value={form.message} onChange={handleChange} placeholder=" " rows={4} required />
                                <label htmlFor="message">Tell me about your quest</label>
                            </div>
                            <button type="submit" className="btn-primary btn-full" data-cursor="Send">
                                Release the Raven →
                            </button>
                        </form>
                    )}
                </motion.div>

                <div className="channels">
                    <span className="mono-label gold">V.2 — Channels</span>
                    {CHANNELS.map((c, i) => (
                        <motion.a
                            key={c.kind}
                            href={c.href}
                            className="channel"
                            target={c.href.startsWith('http') ? '_blank' : undefined}
                            rel={c.href.startsWith('http') ? 'noreferrer' : undefined}
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: '-10% 0px' }}
                            transition={{ duration: 1, ease: EASE, delay: i * 0.1 }}
                        >
                            <span className="channel-kind mono-label">{c.kind}</span>
                            <span className="channel-label">{c.label}</span>
                            <span className="channel-value">{c.value}</span>
                            <svg className="channel-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
                        </motion.a>
                    ))}
                </div>
            </div>

            <footer className="the-end">
                <motion.h2
                    className="the-end-title"
                    initial={{ opacity: 0, letterSpacing: '0.6em' }}
                    whileInView={{ opacity: 1, letterSpacing: '0.12em' }}
                    viewport={{ once: true, margin: '-10% 0px' }}
                    transition={{ duration: 2.2, ease: EASE }}
                >
                    The End
                </motion.h2>
                <p className="the-end-sub">— or merely the end of Volume I —</p>

                <div className="footer-bar container">
                    <span className="mono-label">© {new Date().getFullYear()} {PROFILE.name}</span>
                    <button type="button" className="mono-label back-top" onClick={() => scrollToTarget('#home', { duration: 2.6 })} data-cursor="Top">
                        Back to the cover ↑
                    </button>
                    <span className="mono-label">Built with React &amp; three.js</span>
                </div>
            </footer>
        </section>
    )
}
