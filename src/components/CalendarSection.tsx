import { motion } from 'framer-motion'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

const CalendarSection = () => {
    return (
        <section className="py-24 bg-holi-surface overflow-hidden relative" id="calendario">
            <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-purple-900/10 to-transparent"></div>
            <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div className="relative min-h-[400px] flex flex-col items-center justify-center">
                        <div className="absolute w-full h-full bg-gradient-to-tr from-holi-primary to-purple-900 rounded-[3rem] transform -rotate-6 opacity-30 blur-xl"></div>
                        <motion.div
                            whileHover={{ rotate: 0, scale: 1.05 }}
                            className="relative w-80 h-96 bg-gradient-to-b from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl border border-white/20"
                        >
                            <div className="absolute top-[-20%] left-[-20%] w-60 h-60 bg-holi-secondary rounded-full mix-blend-screen filter blur-[50px] opacity-40"></div>
                            <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-holi-primary rounded-full mix-blend-screen filter blur-[50px] opacity-40"></div>
                            <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-8">
                                <span className="font-marker text-8xl text-white/10 select-none">14</span>
                                <span className="font-bold text-2xl text-white uppercase tracking-widest mt-2">Fevereiro</span>
                            </div>
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-holi-primary via-holi-accent to-holi-secondary"></div>
                        </motion.div>
                        <a href="#" className="mt-8 inline-flex items-center gap-2 text-holi-secondary hover:text-white font-bold uppercase tracking-widest transition-colors relative group">
                            <CalendarIcon size={16} />
                            <span>Cronograma do evento</span>
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-holi-secondary transition-all group-hover:w-full"></span>
                        </a>
                    </div>

                    <div className="bg-white/5 backdrop-blur-md p-8 md:p-12 rounded-[2rem] shadow-xl border border-white/10 relative">
                        <h2 className="text-4xl font-black text-white mb-8 uppercase text-center md:text-left flex items-center gap-3">
                            <CalendarIcon className="text-holi-accent" /> Calendário
                        </h2>
                        <ul className="space-y-6 mb-10">
                            {[
                                { batch: "PRIMEIRO LOTE", dates: "10 JAN - 25 JAN" },
                                { batch: "SEGUNDO LOTE", dates: "25 JAN - 07 FEV" },
                                { batch: "TERCEIRO LOTE", dates: "07 FEV - 10 FEV" }
                            ].map((item, idx) => (
                                <li key={idx} className={`flex items-center justify-between ${idx !== 2 ? 'border-b border-white/10 pb-4' : 'pb-4'}`}>
                                    <div>
                                        <span className="text-xl font-bold text-gray-500 block">{item.batch}</span>
                                        <span className="text-xs text-gray-600 font-mono">{item.dates}</span>
                                    </div>
                                    <span className="text-gray-500 font-bold text-sm bg-white/5 px-3 py-1 rounded-lg">EM BREVE</span>
                                </li>
                            ))}
                        </ul>
                        <div className="text-center md:text-left">
                            <Link to="/inscricao" className="inline-block bg-holi-primary hover:bg-fuchsia-600 text-white font-bold px-8 py-3 rounded-full transition-all uppercase shadow-lg hover:shadow-fuchsia-500/30">
                                Garantir vaga
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#050208] to-transparent z-20 pointer-events-none"></div>
        </section>
    )
}

export default CalendarSection
