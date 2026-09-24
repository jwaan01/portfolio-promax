import { useEffect, useState } from 'react'
import { CHAPTERS } from '../data/chapters'

/** Index of the chapter currently crossing the middle of the viewport. */
export function useActiveChapter() {
    const [active, setActive] = useState(0)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return
                    const idx = CHAPTERS.findIndex((c) => c.id === entry.target.id)
                    if (idx !== -1) setActive(idx)
                })
            },
            { rootMargin: '-50% 0px -50% 0px' },
        )
        CHAPTERS.forEach((c) => {
            const el = document.getElementById(c.id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [])

    return active
}
