import { motion } from 'framer-motion'
import { Calendar, Clock, Star } from 'lucide-react'

const SchedulePage = () => {
    const schedule = [
        {
            day: "Sábado - 14/02",
            events: [
                { time: "08:00", title: "Credenciamento e Acolhida", type: "welcome" },
                { time: "10:00", title: "Missa de Abertura", type: "mass" },
                { time: "14:00", title: "Gincana de Cores", type: "activity" },
                { time: "20:00", title: "Show com Banda X", type: "show" },
            ]
        },
        {
            day: "Domingo - 15/02",
            events: [
                { time: "09:00", title: "Adoração ao Santíssimo", type: "prayer" },
                { time: "15:00", title: "Pregação: 'Vinde as Cores'", type: "talk" },
                { time: "21:00", title: "Holi Night", type: "party" },
            ]
        }
    ]

    return (
        <div className="pt-32 pb-20 min-h-screen relative">
            <div className="max-w-4xl mx-auto px-4 relative z-10">
                <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-12 text-center">
                    Crono<span className="text-holi-primary">grama</span>
                </h1>

                <div className="space-y-12">
                    {schedule.map((day, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="relative"
                        >
                            <div className="bg-holi-primary text-white font-marker text-2xl px-8 py-3 rounded-full inline-block mb-8 shadow-[0_0_20px_rgba(217,70,239,0.4)]">
                                {day.day}
                            </div>

                            <div className="space-y-4 ml-4 border-l-2 border-white/10 pl-8">
                                {day.events.map((event, eIdx) => (
                                    <motion.div
                                        key={eIdx}
                                        whileHover={{ x: 10 }}
                                        className="bg-holi-surface border border-white/5 p-6 rounded-2xl flex items-center gap-6 group hover:border-white/20 transition-all"
                                    >
                                        <div className="text-holi-secondary flex items-center gap-2 font-mono font-bold text-lg">
                                            <Clock size={20} />
                                            {event.time}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white uppercase">{event.title}</h3>
                                        </div>
                                        <div className="text-holi-accent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Star size={20} fill="currentColor" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SchedulePage
