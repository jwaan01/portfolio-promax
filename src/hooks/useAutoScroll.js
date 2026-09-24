import { useCallback, useEffect, useRef, useState } from 'react'
import { setScrollImmediate } from './useSmoothScroll'

export const AUTO_SPEEDS = [0.5, 1, 2]
// Viewport heights per second at 1×: slow enough to let every scrubbed scene play out.
const BASE_VH_PER_SECOND = 0.13

/**
 * Hands-free reading: glides the page down at a steady pace. Any manual
 * input (wheel, touch, keys, clicks outside the controls) or reaching the
 * last page hands control back to the reader.
 */
export function useAutoScroll() {
    const [playing, setPlaying] = useState(false)
    const [speedIndex, setSpeedIndex] = useState(1)
    const speedRef = useRef(AUTO_SPEEDS[1])

    useEffect(() => {
        speedRef.current = AUTO_SPEEDS[speedIndex]
    }, [speedIndex])

    useEffect(() => {
        if (!playing) return

        let frameId
        let last = performance.now()
        let pos = window.scrollY

        const tick = (now) => {
            const dt = Math.min(0.05, (now - last) / 1000)
            last = now
            const max = document.documentElement.scrollHeight - window.innerHeight
            pos = Math.min(max, pos + window.innerHeight * BASE_VH_PER_SECOND * speedRef.current * dt)
            setScrollImmediate(pos)
            if (pos >= max - 1) {
                setPlaying(false)
                return
            }
            frameId = requestAnimationFrame(tick)
        }
        frameId = requestAnimationFrame(tick)

        const stop = () => setPlaying(false)
        const onKey = (e) => {
            if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Escape'].includes(e.key)) stop()
        }
        const onPointer = (e) => {
            if (!e.target.closest('[data-autoplay-control]')) stop()
        }
        window.addEventListener('wheel', stop, { passive: true })
        window.addEventListener('touchstart', stop, { passive: true })
        window.addEventListener('keydown', onKey)
        window.addEventListener('pointerdown', onPointer)

        return () => {
            cancelAnimationFrame(frameId)
            window.removeEventListener('wheel', stop)
            window.removeEventListener('touchstart', stop)
            window.removeEventListener('keydown', onKey)
            window.removeEventListener('pointerdown', onPointer)
        }
    }, [playing])

    const toggle = useCallback(() => {
        if (!playing) {
            // Restart from the cover if the story has already been read to the end.
            const max = document.documentElement.scrollHeight - window.innerHeight
            if (window.scrollY >= max - 2) setScrollImmediate(0)
        }
        setPlaying(!playing)
    }, [playing])

    const cycleSpeed = useCallback(() => setSpeedIndex((i) => (i + 1) % AUTO_SPEEDS.length), [])

    return { playing, toggle, speed: AUTO_SPEEDS[speedIndex], cycleSpeed }
}
