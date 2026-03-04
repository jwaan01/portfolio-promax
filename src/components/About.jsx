import { Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useTypingEffect } from '../hooks/useTypingEffect'
import './About.css'

const SkillsOrb = lazy(() => import('./SkillsOrb'))

const ABOUT_TEXT = `I don't just write code — I obsess over it. With 10+ years engineering production systems used by thousands, I operate at the intersection of performance, beauty, and precision. From rendering 10M+ data points in WebGL to crafting micro-animations that feel inevitable — I believe great software is the closest thing to magic.`

const SKILLS_LIST = [
    { name: 'React', icon: '⚛️' },
    { name: 'JavaScript', icon: '🟨' },
    { name: 'TypeScript', icon: '🔷' },
    { name: 'Node.js', icon: '🟩' },
    { name: 'Next.js', icon: '▲' },
    { name: 'GraphQL', icon: '🔴' },
    { name: 'PostgreSQL', icon: '🐘' },
    { name: 'Docker', icon: '🐳' },
    { name: 'AWS', icon: '☁️' },
    { name: 'Git', icon: '🔀' },
]

export default function About() {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
    const { displayed, done } = useTypingEffect(ABOUT_TEXT, 22, inView ? 400 : 99999)

    return (
        <section className="about" id="about" ref={ref}>
            <div className="container">
                <div className="about-grid">
                    {/* Left: Intro */}
                    <motion.div
                        className="about-intro"
                        initial={{ opacity: 0, x: -40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <h2 className="section-title">ABOUT <span>ME</span></h2>

                        <div className="typing-block">
                            <p className="typing-text">
                                {displayed}
                                <span className="cursor" style={{ display: done ? 'none' : 'inline' }}>|</span>
                            </p>
                        </div>

                        <div className="skill-chips">
                            {SKILLS_LIST.map((s) => (
                                <span key={s.name} className="skill-chip">
                                    {s.icon} {s.name}
                                </span>
                            ))}
                        </div>

                        <div className="stats-row">
                            <div className="stat">
                                <span className="stat-num">10+</span>
                                <span className="stat-label">Years Exp.</span>
                            </div>
                            <div className="stat">
                                <span className="stat-num">40+</span>
                                <span className="stat-label">Projects</span>
                            </div>
                            <div className="stat">
                                <span className="stat-num">15K+</span>
                                <span className="stat-label">Clients</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: 3D Skills Sphere */}
                    <motion.div
                        className="about-orb"
                        initial={{ opacity: 0, x: 40 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    >
                        <div className="orb-wrap">
                            <Suspense fallback={<div className="orb-placeholder" />}>
                                <SkillsOrb />
                            </Suspense>
                            <div className="orb-ring" />
                        </div>
                        <p className="orb-hint">Interactive Skills Cloud</p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
