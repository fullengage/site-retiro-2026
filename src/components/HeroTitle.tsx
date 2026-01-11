import { motion } from 'framer-motion'
import { Bolt, Star, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

const HeroTitle = () => (
    <section className="relative py-20 overflow-hidden flex items-center bg-holi-dark">
        <div className="absolute inset-0 z-0 bg-noise opacity-30 pointer-events-none"></div>
        {/* Animated Blobs match Home.html config but with Framer Motion */}
        <motion.div
            animate={{ scale: [1, 1.1, 1], x: [0, 30, 0], y: [0, -50, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-700/40 rounded-full mix-blend-screen filter blur-[120px] opacity-60 pointer-events-none">
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left space-y-6">
                    <div className="inline-block px-5 py-2 rounded-full border border-holi-secondary/50 bg-holi-secondary/10 text-holi-secondary text-sm font-bold tracking-[0.2em] uppercase mb-4 animate-pulse">
                        <Star size={14} className="inline mr-2" />Vem aí mais um retiro!!
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter uppercase relative">
                        Retiro de <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-holi-accent via-holi-primary to-holi-secondary neon-glow">Carnaval</span>
                        <br />
                        <span className="text-white text-outline">2026</span>
                        <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-3xl"></div>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
                        Prepare-se para viver dias inesquecíveis em um ambiente vibrante de fé e alegria. Uma explosão de cores e graça para marcar a história da sua vida.
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row flex-wrap gap-4 items-center justify-center lg:justify-start">
                        <Link to="/inscricao" className="inline-flex items-center justify-center bg-white text-holi-dark font-black text-lg px-8 py-4 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:bg-gray-100 hover:scale-105 transition-all duration-300 uppercase tracking-wide">
                            <Bolt size={20} className="mr-2 text-holi-primary" /> Inscreva-se
                        </Link>
                        <a href="#sobre" className="inline-flex items-center justify-center bg-transparent border-2 border-white/30 text-white font-bold text-lg px-8 py-4 rounded-full hover:bg-white/10 hover:border-white transition-all duration-300 uppercase tracking-wide">
                            Saiba Mais
                        </a>
                        <Link to="/doacoes" className="inline-flex items-center justify-center bg-transparent border-2 border-holi-accent/30 text-holi-accent font-bold text-xs px-5 py-2.5 rounded-full hover:bg-holi-accent/10 hover:border-holi-accent transition-all duration-300 uppercase tracking-wide opacity-80 hover:opacity-100">
                            <Heart size={14} className="mr-1.5" /> Faça uma doação
                        </Link>
                    </div>
                </div>

                <div className="relative flex justify-center lg:justify-end perspective-1000">
                    <div className="absolute top-[-20px] right-[-30px] w-40 h-40 bg-holi-accent rounded-full filter blur-xl opacity-60 animate-bounce"></div>
                    <div className="absolute bottom-[-40px] left-[-20px] w-48 h-48 bg-holi-secondary rounded-full filter blur-xl opacity-60 animate-pulse"></div>

                    <motion.div
                        whileHover={{ rotate: 0 }}
                        className="relative w-[320px] h-[600px] border-4 border-white/20 p-2 rounded-[3rem] shadow-2xl bg-holi-surface/80 backdrop-blur-sm transform -rotate-3 transition-transform duration-500 z-10 group"
                    >
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-holi-primary rounded-full z-30 flex items-center justify-center border-2 border-white shadow-lg">
                            <Heart size={16} className="text-white fill-current" />
                        </div>
                        <div className="absolute top-0 inset-x-0 h-8 bg-holi-dark z-20 rounded-b-2xl w-48 mx-auto border-b border-x border-white/20"></div>
                        <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIQl5k1_4LOwSxdj8_d5wqJD9MG5zXYQ_e_sArmByNMbiLM1kJv_CN_1PzwacGsB2Ot9h3vK2FrFZkqxgLrftVcAnJYX00T2Bwa1smCpQqIQkQxrWq3wJFmbyNGn84NKUtrgHWBFY_BIseI6V7On4wBKqnKQHoKCTC9u4ie7-xQS21xerCqrQJgkpL7KMaRdaZBjm-8Cv8WiWEjZ_zStuCccb3C1kR12x8WeZhklIgJZ50jUwu1SPyweSOBYNpa1P4OBvqUaec_F6i" className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700" alt="Holi Fest" />
                            <div className="absolute inset-0 bg-gradient-to-t from-holi-primary/80 via-transparent to-transparent mix-blend-overlay"></div>
                            <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent text-white z-10">
                                <h3 className="font-black text-3xl uppercase text-holi-accent mb-1 drop-shadow-md">Holi Fest</h3>
                                <p className="text-sm text-gray-200 font-semibold">O sobrenatural em cores!</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-holi-dark to-transparent z-20 pointer-events-none"></div>
    </section>
)

export default HeroTitle
