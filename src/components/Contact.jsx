import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import './Contact.css'

const SAMPLE_MESSAGES = [
    { id: 1, name: 'Sarah K.', text: 'Absolutely stunning work on the dashboard — our users love it!', time: '2m ago', avatar: '👩‍💻' },
    { id: 2, name: 'Alex M.', text: 'Incredible attention to detail. Delivered ahead of schedule!', time: '1h ago', avatar: '🧑‍🚀' },
    { id: 3, name: 'James L.', text: 'The animation work completely transformed our landing page conversions.', time: '3h ago', avatar: '👨‍🎨' },
    { id: 4, name: 'Priya D.', text: 'Best developer I have worked with. Clean code, great communication.', time: '1d ago', avatar: '👩‍🔬' },
    { id: 5, name: 'Tom R.', text: 'The Three.js hero section blew everyone in the team away.', time: '2d ago', avatar: '🧑‍💼' },
]

export default function Contact() {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
    const [form, setForm] = useState({ name: '', email: '', message: '' })
    const [sent, setSent] = useState(false)

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setSent(true)
        setTimeout(() => setSent(false), 4000)
        setForm({ name: '', email: '', message: '' })
    }

    return (
        <section className="contact" id="contact">
            <div className="container">
                <motion.div
                    ref={ref}
                    className="section-header"
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="section-title">GET IN <span>TOUCH</span></h2>
                    <p className="section-sub">Have a project in mind? Let&apos;s make something great.</p>
                </motion.div>

                <div className="contact-grid">
                    {/* Form */}
                    <motion.div
                        className="contact-form-wrap"
                        initial={{ opacity: 0, x: -30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.1 }}
                    >
                        {sent ? (
                            <div className="success-msg">
                                <span className="success-icon">✓</span>
                                <p>Message sent! I&apos;ll get back to you soon.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="name">Your Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={form.message}
                                        onChange={handleChange}
                                        placeholder="Tell me about your project..."
                                        rows={5}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-primary btn-full">
                                    Send Message →
                                </button>
                            </form>
                        )}
                    </motion.div>

                    {/* Messages feed */}
                    <motion.div
                        className="messages-feed"
                        initial={{ opacity: 0, x: 30 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <div className="feed-header">
                            <span className="feed-dot" />
                            <span className="feed-title">Live Testimonials</span>
                        </div>
                        <div className="feed-list">
                            {SAMPLE_MESSAGES.map((msg, i) => (
                                <motion.div
                                    key={msg.id}
                                    className="feed-item"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                                >
                                    <div className="feed-avatar">{msg.avatar}</div>
                                    <div className="feed-content">
                                        <div className="feed-meta">
                                            <span className="feed-name">{msg.name}</span>
                                            <span className="feed-time">{msg.time}</span>
                                        </div>
                                        <p className="feed-text">{msg.text}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Footer */}
            <div className="contact-footer">
                <p className="footer-text">Designed & Built with ❤️ & <span className="cyan">three.js</span></p>
                <div className="social-links">
                    <a href="https://github.com/Ryuga00000001" className="social-link">GitHub</a>
                    <a href="#" className="social-link">LinkedIn</a>
                    <a href="#" className="social-link">Twitter</a>
                </div>
            </div>
        </section>
    )
}
