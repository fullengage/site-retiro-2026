import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertTriangle } from 'lucide-react'

interface CountdownTimerProps {
    targetDate: string
}

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
    const [isExpired, setIsExpired] = useState(false)

    function calculateTimeLeft() {
        // Parse date explicitly to avoid timezone issues if possible, or use standard string
        // Assuming targetDate is ISO string or valid date string
        const difference = +new Date(targetDate) - +new Date()

        if (difference <= 0) {
            return { hours: '00', minutes: '00', seconds: '00' }
        }

        return {
            hours: Math.floor((difference / (1000 * 60 * 60))).toString().padStart(2, '0'),
            minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, '0'),
            seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, '0')
        }
    }

    useEffect(() => {
        // Initial check
        const initialDiff = +new Date(targetDate) - +new Date()
        if (initialDiff <= 0) setIsExpired(true)

        const timer = setInterval(() => {
            const diff = +new Date(targetDate) - +new Date()
            if (diff <= 0) {
                setIsExpired(true)
                setTimeLeft({ hours: '00', minutes: '00', seconds: '00' })
                clearInterval(timer)
            } else {
                setTimeLeft(calculateTimeLeft())
            }
        }, 1000)

        return () => clearInterval(timer)
    }, [targetDate])

    if (isExpired) return null // Hide if expired? Or show "Expired"?
    // For now, let's just make it disappear if expired or show '00'. 
    // Usually better to hide or show "Lote Virou" message. 
    // Given the prompt "ends today", let's hide or show 00:00:00.

    // Actually, let's keep it visible with 00:00:00 to show urgency was real or just hide.
    // Let's return null to remove it cleanly if expired, as the user wants it FOR the end of the batch.
    // But maybe showing "Lote Encerrado" is better. 
    // I'll stick to just the countdown for now as requested. 

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl mx-auto mb-12"
        >
            <div className="relative overflow-hidden rounded-3xl bg-black/40 border border-red-500/30 p-6 backdrop-blur-sm">
                {/* Ping animation for urgency */}
                <div className="absolute top-0 right-0 p-4">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>

                <div className="text-center">
                    <h3 className="text-red-400 font-bold uppercase tracking-[0.2em] text-sm mb-6 flex items-center justify-center gap-2">
                        <AlertTriangle size={16} className="animate-pulse" />
                        Últimas Horas - 1º Lote
                    </h3>

                    <div className="flex justify-center items-center gap-2 sm:gap-6">
                        <div className="flex flex-col items-center bg-black/40 rounded-xl p-3 sm:p-4 min-w-[80px] sm:min-w-[100px] border border-white/5">
                            <span className="text-3xl sm:text-5xl font-black text-white tabular-nums tracking-tighter">
                                {timeLeft.hours}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mt-1">Horas</span>
                        </div>

                        <span className="text-2xl sm:text-4xl font-black text-red-500/50 pb-6">:</span>

                        <div className="flex flex-col items-center bg-black/40 rounded-xl p-3 sm:p-4 min-w-[80px] sm:min-w-[100px] border border-white/5">
                            <span className="text-3xl sm:text-5xl font-black text-white tabular-nums tracking-tighter">
                                {timeLeft.minutes}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mt-1">Minutos</span>
                        </div>

                        <span className="text-2xl sm:text-4xl font-black text-red-500/50 pb-6">:</span>

                        <div className="flex flex-col items-center bg-black/40 rounded-xl p-3 sm:p-4 min-w-[80px] sm:min-w-[100px] border border-white/5">
                            <span className="text-3xl sm:text-5xl font-black text-red-500 tabular-nums tracking-tighter">
                                {timeLeft.seconds}
                            </span>
                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mt-1">Segundos</span>
                        </div>
                    </div>

                    <p className="mt-6 text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
                        O primeiro lote encerra hoje às 00:00. <br />
                        <span className="text-white font-bold">Garanta o menor preço agora!</span>
                    </p>
                </div>
            </div>
        </motion.div>
    )
}

export default CountdownTimer
