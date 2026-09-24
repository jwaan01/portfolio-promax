import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import ChapterCard from './ChapterCard'
import { CHAPTERS } from '../data/chapters'
import { PROJECTS } from '../data/content'
import './Projects.css'

const EASE = [0.22, 1, 0.36, 1]

function TrialCard({ project, index, total, progress }) {
    const cardRef = useRef(null)
    // How far this card has travelled into view: drives its own entrance.
    const { scrollYProgress: enter } = useScroll({ target: cardRef, offset: ['start end', 'start start'] })

    // Once the next pages stack on top, this one sinks back into the book.
    const targetScale = 1 - (total - index - 1) * 0.045
    const scale = useTransform(progress, [index / total, 1], [1, targetScale])
    const dim = useTransform(progress, [index / total, (index + 1) / total], [0, index === total - 1 ? 0 : 0.55])
    const rotateX = useTransform(enter, [0, 1], [18, 0])
    const visualY = useTransform(enter, [0, 1], ['18%', '0%'])

    const no = String(index + 1).padStart(2, '0')

    return (
        <div className="trial-wrap" ref={cardRef}>
            <motion.article
                className="trial-card"
                style={{ scale, rotateX, top: `calc(${index} * 22px)`, '--hue': project.hue }}
            >
                <div className="trial-content">
                    <div className="trial-top">
                        <span className="mono-label gold">Trial {no}</span>
                        <span className="mono-label">{project.category}</span>
                    </div>

                    <div className="trial-main">
                        <h3 className="trial-title">{project.title}</h3>
                        <p className="trial-desc">{project.desc}</p>
                        <div className="trial-tags">
                            {project.tags.map((tag) => (
                                <span key={tag} className="trial-tag">{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="trial-actions">
                        <a href={project.live} className="trial-btn">
                            Live
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
                        </a>
                        <a href={project.code} className="trial-btn trial-btn-ghost">
                            Source
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
                        </a>
                    </div>
                </div>

                <div className="trial-visual" aria-hidden="true">
                    <motion.div className="trial-visual-inner" style={{ y: visualY }}>
                        <div className="tv-grid" />
                        <div className="tv-orb" />
                        <div className="tv-ring" />
                        <div className="tv-ring tv-ring-2" />
                        <span className="tv-no">{no}</span>
                        <div className="tv-stat">
                            <span className="tv-stat-num">{project.stat}</span>
                            <span className="mono-label">{project.statLabel}</span>
                        </div>
                    </motion.div>
                </div>

                <motion.div className="trial-dim" style={{ opacity: dim }} />
            </motion.article>
        </div>
    )
}

/** Chapter III: each project is a page that slides over the last one. */
export default function Projects() {
    const stackRef = useRef(null)
    const { scrollYProgress } = useScroll({ target: stackRef, offset: ['start start', 'end end'] })

    return (
        <section className="chapter projects" id="projects">
            <ChapterCard
                chapter={CHAPTERS[3]}
                index={3}
                quote="Every great achievement is a Divine Tribulation overcome on the journey to the peak."
            />

            <div className="container trials-intro">
                <motion.span
                    className="mono-label gold"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    III.0 — Selected Work
                </motion.span>
                <h3 className="trials-heading">
                    <span className="line-mask">
                        <motion.span
                            initial={{ y: '110%' }}
                            whileInView={{ y: '0%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: EASE }}
                        >
                            Trials that <em>shipped.</em>
                        </motion.span>
                    </span>
                </h3>
            </div>

            <div className="trials-stack" ref={stackRef}>
                {PROJECTS.map((project, i) => (
                    <TrialCard
                        key={project.id}
                        project={project}
                        index={i}
                        total={PROJECTS.length}
                        progress={scrollYProgress}
                    />
                ))}
            </div>
        </section>
    )
}
