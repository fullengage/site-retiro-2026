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
        <div className="sziget-countdown-bar rack-console-bar" role="timer" aria-label="Contagem regressiva para abertura dos portões">
            <div className="rack-status-indicator">
                <span className="rack-led-pulse" />
                <span className="rack-label">MASTER TIMER • STAGE READY</span>
                <span className="rack-freq">FREQ: 25.09.2026</span>
            </div>

            <div className="sziget-timer-box rack-digital-display">
                <div className="sziget-timer-unit rack-unit">
                    <span className="rack-led-num">{timeLeft.days.toString().padStart(2, '0')}</span>
                    <span className="rack-unit-label">DIAS</span>
                </div>
                <div className="sziget-timer-unit rack-unit">
                    <span className="rack-led-num">{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="rack-unit-label">HRS</span>
                </div>
                <div className="sziget-timer-unit rack-unit">
                    <span className="rack-led-num">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="rack-unit-label">MIN</span>
                </div>
                <div className="sziget-timer-unit rack-unit">
                    <span className="rack-led-num">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className="rack-unit-label">SEG</span>
                </div>
            </div>

            <div className="rack-vu-meter" aria-hidden="true">
                <span className="vu-bar vu-green" />
                <span className="vu-bar vu-green" />
                <span className="vu-bar vu-yellow" />
                <span className="vu-bar vu-red" />
            </div>
        </div>
    )
}

export default CountdownBar
