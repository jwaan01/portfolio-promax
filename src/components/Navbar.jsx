import { useState, useEffect } from 'react'
import './Navbar.css'

const NAV_LINKS = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#projects', label: 'Projects' },
    { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40)
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
            <div className="nav-inner">
                <a href="#home" className="nav-logo">
                    <span className="logo-bracket">&lt;</span>
                    ZEROTH
                    <span className="logo-bracket">/&gt;</span>
                </a>

                <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
                    {NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <a href={link.href} className="nav-link" onClick={() => setMenuOpen(false)}>
                                {link.label}
                            </a>
                        </li>
                    ))}
                    <li>
                        <a href="#contact" className="nav-cta" onClick={() => setMenuOpen(false)}>
                            Contact Me
                        </a>
                    </li>
                </ul>

                <button
                    className={`hamburger ${menuOpen ? 'active' : ''}`}
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Menu"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
        </nav>
    )
}
