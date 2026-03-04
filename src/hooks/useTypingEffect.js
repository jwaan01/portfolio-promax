import { useState, useEffect, useRef } from 'react'

export function useTypingEffect(text, speed = 45, startDelay = 0) {
    const [displayed, setDisplayed] = useState('')
    const [done, setDone] = useState(false)
    const indexRef = useRef(0)

    useEffect(() => {
        setDisplayed('')
        setDone(false)
        indexRef.current = 0

        const startTimer = setTimeout(() => {
            const interval = setInterval(() => {
                if (indexRef.current < text.length) {
                    setDisplayed(text.slice(0, indexRef.current + 1))
                    indexRef.current++
                } else {
                    setDone(true)
                    clearInterval(interval)
                }
            }, speed)
            return () => clearInterval(interval)
        }, startDelay)

        return () => clearTimeout(startTimer)
    }, [text, speed, startDelay])

    return { displayed, done }
}
