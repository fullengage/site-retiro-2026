import { motion } from 'framer-motion'

const AboutSection = () => (
    <section className="relative py-24 bg-holi-dark overflow-hidden order-1 md:order-none" id="sobre">
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-holi-dark to-transparent z-20 pointer-events-none"></div>

        <div className="absolute inset-0 z-0">
            <img
                alt="Multidão no retiro"
                className="w-full h-full object-cover opacity-20 grayscale hover:grayscale-0 transition-all duration-700 mix-blend-overlay"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO6bu2DI61ilE5yC90ozz7O79Sys4hQpfdpB21dTvHbR1DNFvUbGrRnCt639Z5c5ZAMbmwkcIEsNwQhpfLYNtNBVtgccJtQFtzAMxpsIcnQg2um6Htg6O2Y2LR5kzLIw5rdw3SkyQetr-pmF_PAeN24xenFdrgBmm0bBd7izRqjoDazWp6v45YkNP-yuwP95U6yqp9VJCb3y1DQfUilV2GyBhqLu4N6LFt8XRwAMnZ6c3ARq20uqwCVTbEqIJv5Okn4MO-Z6miN1k9"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-holi-dark via-holi-dark/95 to-holi-dark"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-holi-accent to-holi-orange mb-8 uppercase drop-shadow-sm">
                Sobre o retiro
            </h2>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl p-8 md:p-14 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group"
            >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-holi-primary rounded-full filter blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-holi-secondary rounded-full filter blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>

                <p className="text-lg md:text-xl text-gray-200 leading-relaxed font-medium relative z-10">
                    Um projeto que começou em 2023, o <strong className="text-holi-primary">Retiro de Carnaval da Comunidade Voz de Deus</strong> já reuniu mais de 300 jovens no mesmo local para vivenciar uma experiência de amor com Cristo!
                    <br /><br />
                    Em 2026 pretendemos alcançar muitas almas com um carnaval bem diferente, cheio de <span className="text-holi-secondary font-marker">cor</span>, <span className="text-holi-accent font-marker">vida</span> e <span className="text-holi-primary font-marker">propósito</span>!
                </p>
            </motion.div>
        </div>

        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-holi-dark to-transparent z-20 pointer-events-none"></div>
    </section>
)

export default AboutSection
