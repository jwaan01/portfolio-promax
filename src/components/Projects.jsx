import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import './Projects.css'

const CATEGORIES = ['All', 'Full-Stack', 'Frontend', 'Tools']

const PROJECTS = [
    {
        id: 1,
        title: 'NexaStore',
        category: 'Full-Stack',
        desc: 'Enterprise-grade e-commerce platform with real-time inventory, AI-powered product recommendations, and multi-vendor support that scaled to 50k MAU.',
        tags: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redis'],
        stat: '50k MAU',
        statLabel: 'Monthly Active Users',
        emoji: '🛒',
        gradient: 'from-blue-900 to-blue-950',
        featured: false,
    },
    {
        id: 2,
        title: 'FlowBoard',
        category: 'Full-Stack',
        desc: 'Real-time collaboration suite with Kanban, sprints, and built-in video conferencing. Reduced team context-switching by 60%.',
        tags: ['Next.js', 'WebSockets', 'PostgreSQL', 'WebRTC'],
        stat: '60%',
        statLabel: 'Less Context Switching',
        emoji: '📋',
        gradient: 'from-indigo-900 to-blue-950',
        featured: false,
    },
    {
        id: 3,
        title: 'Cryptex Dashboard',
        category: 'Frontend',
        desc: 'High-frequency crypto portfolio tracker with sub-100ms live price updates, animated D3.js charts, and customizable alerts.',
        tags: ['React', 'D3.js', 'WebSocket', 'TailwindCSS'],
        stat: '<100ms',
        statLabel: 'Live Data Latency',
        emoji: '📈',
        gradient: 'from-blue-800 to-indigo-950',
        featured: false,
    },
    {
        id: 4,
        title: 'AuraUI',
        category: 'Tools',
        desc: 'Award-winning open-source design system with 80+ accessible components, 3 themes, and a Figma kit. 2.4k GitHub stars.',
        tags: ['TypeScript', 'Storybook', 'Radix UI', 'CSS Modules'],
        stat: '2.4k ★',
        statLabel: 'GitHub Stars',
        emoji: '🎨',
        gradient: 'from-blue-900 to-slate-950',
        featured: false,
    },
    {
        id: 5,
        title: 'Vaultix',
        category: 'Full-Stack',
        desc: 'Zero-knowledge encrypted notes app. All data is encrypted client-side before any server touch — privacy-first architecture.',
        tags: ['React', 'Web Crypto API', 'IndexedDB', 'PWA'],
        stat: 'E2E',
        statLabel: 'Zero-Knowledge Encryption',
        emoji: '🔐',
        gradient: 'from-indigo-900 to-blue-950',
        featured: false,
    },
    {
        id: 6,
        title: 'MapSense',
        category: 'Frontend',
        desc: 'Geospatial analytics platform handling 10M+ data points with WebGL-accelerated rendering and real-time event streaming.',
        tags: ['MapboxGL', 'WebGL', 'FastAPI', 'GeoJSON'],
        stat: '10M+',
        statLabel: 'Data Points Rendered',
        emoji: '🗺️',
        gradient: 'from-blue-950 to-indigo-900',
        featured: false,
    },
]

function ProjectCard({ project, index }) {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })

    return (
        <motion.article
            ref={ref}
            className={`project-card ${project.featured ? 'featured' : ''}`}
            initial={{ opacity: 0, y: 36 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.55, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
            <div className="card-top">
                <div className="card-icon-wrap">
                    <span className="card-icon">{project.emoji}</span>
                </div>
                <div className="card-stat-pill">
                    <span className="card-stat-num">{project.stat}</span>
                    <span className="card-stat-label">{project.statLabel}</span>
                </div>
            </div>

            <div className="card-body">
                <span className="card-cat">{project.category}</span>
                <h3 className="card-title">{project.title}</h3>
                <p className="card-desc">{project.desc}</p>
            </div>

            <div className="card-bottom">
                <div className="card-tags">
                    {project.tags.map((tag) => (
                        <span key={tag} className="card-tag">{tag}</span>
                    ))}
                </div>

                <div className="card-actions">
                    <a href="#" className="card-action-btn">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        Live
                    </a>
                    <a href="#" className="card-action-btn card-action-ghost">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                        Code
                    </a>
                </div>
            </div>

            <div className="card-line" />
        </motion.article>
    )
}

export default function Projects() {
    const [activeFilter, setActiveFilter] = useState('All')
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

    const filtered = activeFilter === 'All'
        ? PROJECTS
        : PROJECTS.filter((p) => p.category === activeFilter)

    return (
        <section className="projects" id="projects">
            <div className="container">
                <motion.div
                    ref={ref}
                    className="projects-header"
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <div className="section-eyebrow">
                        <span className="eyebrow-line" />
                        Selected Work
                        <span className="eyebrow-line" />
                    </div>
                    <h2 className="section-title">Projects That <span>Ship.</span></h2>
                    <p className="section-sub">
                        Real-world products built with performance, scalability, and obsessive attention to detail.
                    </p>

                    <div className="filter-bar">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
                                onClick={() => setActiveFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeFilter}
                        className="projects-grid"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {filtered.map((project, i) => (
                            <ProjectCard key={project.id} project={project} index={i} />
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    )
}
