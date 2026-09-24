import { useEffect } from 'react'
import Lenis from 'lenis'

let lenisInstance = null

/** Scroll to a selector or element, through Lenis when it is running. */
export function scrollToTarget(target, options = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target
    if (!el) return
    if (lenisInstance) {
        lenisInstance.scrollTo(el, { duration: 1.8, ...options })
    } else {
        el.scrollIntoView({ behavior: 'smooth' })
    }
}

/** Freeze page scrolling (e.g. while a full-screen menu is open). */
export function setScrollLocked(locked) {
    if (lenisInstance) {
        if (locked) lenisInstance.stop()
        else lenisInstance.start()
    }
    document.body.style.overflow = locked ? 'hidden' : ''
}

/**
 * Inertia smooth scrolling for the whole page. Starts only once `enabled`
 * is true (after the preloader) and is skipped for reduced-motion users.
 * Same-page anchor links are routed through Lenis so they glide too.
 */
export function useSmoothScroll(enabled) {
    useEffect(() => {
        if (!enabled) return
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const lenis = new Lenis({
            duration: 1.25,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 0.9,
            touchMultiplier: 1.4,
        })
        lenisInstance = lenis

        let frameId
        const raf = (time) => {
            lenis.raf(time)
            frameId = requestAnimationFrame(raf)
        }
        frameId = requestAnimationFrame(raf)

        const onClick = (e) => {
            if (e.defaultPrevented) return
            const link = e.target.closest('a[href^="#"]')
            if (!link) return
            const hash = link.getAttribute('href')
            if (hash.length < 2) return
            const target = document.querySelector(hash)
            if (!target) return
            e.preventDefault()
            lenis.scrollTo(target, { duration: 1.8 })
        }
        document.addEventListener('click', onClick)

        return () => {
            cancelAnimationFrame(frameId)
            document.removeEventListener('click', onClick)
            lenis.destroy()
            lenisInstance = null
        }
    }, [enabled])
}
