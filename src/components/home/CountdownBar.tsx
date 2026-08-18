import React, { useState, useEffect } from 'react'

interface TimeLeft {
    days: number
    hours: number
    minutes: number
    seconds: number
}

export const CountdownBar: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const targetDate = new Date('September 25, 2026 18:00:00').getTime()
            const now = new Date().getTime()
            const distance = targetDate - now

            if (distance > 0) {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24))
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
                const seconds = Math.floor((distance % (1000 * 60)) / 1000)

                setTimeLeft({ days, hours, minutes, seconds })
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
            }
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="sziget-countdown-bar" role="timer" aria-label="Contagem regressiva para abertura dos portões">
            <span>⚡ ABERTURA DOS PORTÕES 25 SETEMBRO 2026:</span>
            <div className="sziget-timer-box">
                <div className="sziget-timer-unit">
                    <strong>{timeLeft.days.toString().padStart(2, '0')}</strong> DIAS
                </div>
                <div className="sziget-timer-unit">
                    <strong>{timeLeft.hours.toString().padStart(2, '0')}</strong> HRS
                </div>
                <div className="sziget-timer-unit">
                    <strong>{timeLeft.minutes.toString().padStart(2, '0')}</strong> MINS
                </div>
                <div className="sziget-timer-unit">
                    <strong>{timeLeft.seconds.toString().padStart(2, '0')}</strong> SECS
                </div>
            </div>
        </div>
    )
}

export default CountdownBar
