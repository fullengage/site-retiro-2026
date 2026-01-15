import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const ComingSoonPage = () => {
    return (
        <div className="bg-holi-dark text-white font-display min-h-screen flex items-center justify-center overflow-hidden relative selection:bg-holi-primary selection:text-white">
            {/* Background Animations */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-noise opacity-30"></div>

                {/* Vibrant Blobs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 50, 0],
                        y: [0, 30, 0]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-holi-primary rounded-full filter blur-[140px] opacity-60"
                ></motion.div>

                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        x: [0, -40, 0],
                        y: [0, -20, 0]
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-holi-secondary rounded-full filter blur-[140px] opacity-60"
                ></motion.div>

                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 45, 0]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-purple-600 rounded-full filter blur-[140px] opacity-60"
                ></motion.div>

                <motion.div
                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-[10%] left-[5%] w-[35%] h-[35%] bg-holi-accent/30 rounded-full filter blur-[140px] opacity-60"
                ></motion.div>

                {/* Decorative Particles */}
                <div className="absolute top-[10%] left-[15%] w-32 h-32 bg-holi-primary/40 rounded-full blur-xl scale-150 rotate-45 opacity-40"></div>
                <div className="absolute top-[40%] right-[5%] w-24 h-24 bg-holi-secondary/30 rounded-full blur-lg opacity-50"></div>
                <div className="absolute bottom-[15%] left-[20%] w-40 h-40 bg-purple-500/40 rounded-full blur-2xl opacity-40"></div>
                <div className="absolute top-[15%] right-[25%] w-20 h-20 bg-holi-accent/20 rounded-full blur-md opacity-30"></div>

                {/* Floating dots */}
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute top-[20%] left-[30%] w-2 h-2 bg-holi-secondary rounded-full blur-[1px] opacity-60"></motion.div>
                <div className="absolute top-[22%] left-[31%] w-1 h-1 bg-holi-secondary rounded-full opacity-40"></div>
                <div className="absolute top-[18%] left-[28%] w-1.5 h-1.5 bg-holi-secondary rounded-full blur-[1px] opacity-50"></div>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute bottom-[30%] right-[15%] w-2 h-2 bg-holi-primary rounded-full blur-[1px] opacity-60"></motion.div>
                <div className="absolute bottom-[32%] right-[14%] w-1 h-1 bg-holi-primary rounded-full opacity-40"></div>
                <div className="absolute bottom-[28%] right-[16%] w-1.5 h-1.5 bg-holi-primary rounded-full blur-[1px] opacity-50"></div>
            </div>

            <main className="relative z-10 max-w-2xl px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 0.9, y: 0 }}
                    className="mb-12"
                >
                    <span className="font-marker text-holi-secondary tracking-widest text-lg md:text-xl uppercase">
                        Retiro de Carnaval 2026
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-6xl md:text-8xl font-black mb-8 uppercase tracking-tighter"
                    style={{ textShadow: '0 0 10px #d946ef, 0 0 20px #06b6d4' }}
                >
                    Em breve
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg md:text-xl text-white/90 font-medium leading-relaxed mb-12 max-w-md mx-auto"
                >
                    Estamos preparando algo muito especial! <br className="hidden md:block" />
                    Acompanhe nossas redes sociais para não perder nada!
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col items-center gap-8"
                >
                    <Link
                        to="/"
                        className="group relative px-8 py-4 bg-transparent border-2 border-purple-500 text-white font-bold rounded-full transition-all duration-300 hover:border-holi-primary hover:scale-105 uppercase tracking-widest text-sm"
                        style={{ boxShadow: '0 0 5px transparent' }}
                    >
                        Voltar para a Home
                    </Link>

                    <div className="flex gap-8 mt-4">
                        <a
                            href="https://www.instagram.com/juventude._adonai/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/60 hover:text-holi-primary transition-colors text-3xl"
                        >
                            <i className="fab fa-instagram"></i>
                        </a>
                    </div>
                </motion.div>
            </main>

            <footer className="absolute bottom-8 w-full text-center z-10">
                <p className="text-xs font-bold text-white/40 uppercase tracking-[0.5em]">
                    Comunidade Voz de Deus
                </p>
            </footer>
        </div>
    )
}

export default ComingSoonPage
